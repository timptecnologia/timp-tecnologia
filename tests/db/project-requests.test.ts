import type { PGlite } from "@electric-sql/pglite"
import { beforeAll, describe, expect, it } from "vitest"

import { USER, seedFixtures } from "./fixtures"
import { as, createTestDatabase, pgError, type Session } from "./harness"

/**
 * Solicitações de projeto (formulário público) e rate limit distribuído —
 * migration 20260929000100. Testes NEGATIVOS com controle positivo.
 * Cada cenário roda em transação desfeita (zero resíduo).
 */

let db: PGlite

beforeAll(async () => {
  db = await createTestDatabase()
  await seedFixtures(db)
})

const DENIED = "42501"
const CHECK = "23514"

const VALID = {
  name: "Pessoa Teste",
  company: null,
  email: "teste@exemplo.com.br",
  phone: "+5521900000000",
  uf: "RJ",
  city: "Rio de Janeiro",
  project_type: "Empresa",
  size: null,
  solution: null,
  message: "Mensagem de teste.",
}
const COLS = Object.keys(VALID)
const insertSql = `insert into public.project_requests (${COLS.join(", ")}) values (${COLS.map((_, i) => `$${i + 1}`).join(", ")})`
const insert = (s: Session, row: Record<string, unknown> = VALID) => s.exec(insertSql, COLS.map((c) => row[c]))

const asService = <T>(fn: (s: Session) => Promise<T>) => as(db, { role: "service_role" }, fn)
const asAnon = <T>(fn: (s: Session) => Promise<T>) => as(db, { role: "anon" }, fn)
const asUser = <T>(userId: string, fn: (s: Session) => Promise<T>, aal: "aal1" | "aal2" = "aal2") => as(db, { role: "authenticated", userId, aal }, fn)

describe("project_requests: escrita", () => {
  it("controle positivo: o servidor (service_role) grava uma solicitação válida", async () => {
    const n = await asService(async (s) => {
      await insert(s)
      const rows = await s.query<{ n: number }>("select count(*)::int as n from public.project_requests")
      return rows[0]?.n
    }).catch((e) => e as Error)
    // service_role não tem SELECT: a contagem é negada — prova de least privilege
    expect(n).toBeInstanceOf(Error)
    const ok = await asService((s) => insert(s).then(() => true))
    expect(ok).toBe(true)
  })

  it("anon não insere (o formulário não é gravável direto pela API pública)", async () => {
    const err = await asAnon((s) => pgError(insert(s)))
    expect(err.code).toBe(DENIED)
  })

  it("usuário autenticado (cliente ou equipe) não insere direto", async () => {
    for (const u of [USER.aAdmin, USER.timpAdmin]) {
      const err = await asUser(u, (s) => pgError(insert(s)))
      expect(err.code).toBe(DENIED)
    }
  })

  it("servidor não define colunas protegidas (id, created_at, status)", async () => {
    const err = await asService((s) =>
      pgError(s.exec(`insert into public.project_requests (${COLS.join(", ")}, status) values (${COLS.map((_, i) => `$${i + 1}`).join(", ")}, 'closed')`, [...COLS.map((c) => (VALID as Record<string, unknown>)[c])])),
    )
    expect(err.code).toBe(DENIED)
  })

  it.each([
    ["telefone fora do formato normalizado", { phone: "21999999999" }],
    ["e-mail inválido", { email: "sem-arroba" }],
    ["UF inválida", { uf: "rj" }],
    ["nome com caractere de controle", { name: "a\u0007b" }],
    ["mensagem acima do limite", { message: "x".repeat(4001) }],
  ])("restrições do banco barram %s (defesa em profundidade)", async (_label, patch) => {
    const err = await asService((s) => pgError(insert(s, { ...VALID, ...patch })))
    expect(err.code).toBe(CHECK)
  })

  it("servidor não altera nem apaga solicitações", async () => {
    const upd = await asService((s) => pgError(s.exec("update public.project_requests set status = 'spam'")))
    expect(upd.code).toBe(DENIED)
    const del = await asService((s) => pgError(s.exec("delete from public.project_requests")))
    expect(del.code).toBe(DENIED)
  })
})

describe("project_requests: leitura", () => {
  // Grava uma linha como servidor e lê na MESMA transação com outro papel
  async function readAs(identity: Parameters<typeof as>[1]): Promise<number | Error> {
    return db.transaction(async (tx) => {
      await tx.exec("set local role service_role")
      await tx.query(insertSql, COLS.map((c) => (VALID as Record<string, unknown>)[c]))
      await tx.exec("reset role")
      const claims = identity.role === "authenticated" ? { sub: identity.userId, role: "authenticated", aal: identity.aal ?? "aal2" } : { role: identity.role }
      await tx.query("select set_config('request.jwt.claims', $1, true)", [JSON.stringify(claims)])
      await tx.exec(`set local role ${identity.role}`)
      let out: number | Error
      try {
        await tx.exec("savepoint r")
        const res = await tx.query<{ n: number }>("select count(*)::int as n from public.project_requests")
        out = res.rows[0]?.n ?? 0
      } catch (e) {
        await tx.exec("rollback to savepoint r")
        out = e as Error
      }
      await tx.rollback()
      return out
    }).catch((e: Error) => (e.message.includes("rollback") ? e : e))
  }

  it("controle positivo: equipe Timp com MFA lê as solicitações", async () => {
    expect(await readAs({ role: "authenticated", userId: USER.timpAdmin, aal: "aal2" })).toBe(1)
  })

  it("equipe Timp SEM MFA (aal1) não vê nada", async () => {
    expect(await readAs({ role: "authenticated", userId: USER.timpAdmin, aal: "aal1" })).toBe(0)
  })

  it("clientes (admin e usuário) não veem solicitações de ninguém", async () => {
    for (const u of [USER.aAdmin, USER.aUser, USER.bAdmin]) expect(await readAs({ role: "authenticated", userId: u, aal: "aal2" })).toBe(0)
  })

  it("anon não lê", async () => {
    const r = await readAs({ role: "anon" })
    expect(r).toBeInstanceOf(Error)
    expect((r as Error & { code?: string }).code).toBe(DENIED)
  })
})

describe("rate_limit_hit (rate limit distribuído)", () => {
  it("controle positivo: service_role incrementa a janela e o contador reinicia por chave", async () => {
    const hits = await asService(async (s) => {
      const out: number[] = []
      for (let i = 0; i < 3; i++) out.push((await s.query<{ hits: number }>("select hits from public.rate_limit_hit($1, $2)", ["publicForm:k1", 3600]))[0]!.hits)
      out.push((await s.query<{ hits: number }>("select hits from public.rate_limit_hit($1, $2)", ["publicForm:k2", 3600]))[0]!.hits)
      return out
    })
    expect(hits).toEqual([1, 2, 3, 1])
  })

  it("janela vencida reinicia a contagem", async () => {
    const hits = await asService(async (s) => {
      await s.query("select public.rate_limit_hit($1, $2)", ["publicForm:exp", 1])
      await s.query("select pg_sleep(1.1)")
      return (await s.query<{ hits: number }>("select hits from public.rate_limit_hit($1, $2)", ["publicForm:exp", 1]))[0]!.hits
    })
    expect(hits).toBe(1)
  })

  it("anon e authenticated não executam o rate limit (nem forjam/zeram contadores)", async () => {
    const e1 = await asAnon((s) => pgError(s.query("select public.rate_limit_hit('x', 60)")))
    expect(e1.code).toBe(DENIED)
    const e2 = await asUser(USER.timpAdmin, (s) => pgError(s.query("select public.rate_limit_hit('x', 60)")))
    expect(e2.code).toBe(DENIED)
  })

  it("tabela de contadores inacessível a todos os papéis da API", async () => {
    for (const identity of [{ role: "anon" as const }, { role: "service_role" as const }, { role: "authenticated" as const, userId: USER.timpAdmin }]) {
      const err = await as(db, identity, (s) => pgError(s.query("select * from app.rate_limit_buckets")))
      expect(err.code).toBe(DENIED)
    }
  })

  it("parâmetros inválidos são recusados", async () => {
    const err = await asService((s) => pgError(s.query("select public.rate_limit_hit($1, $2)", ["", 60])))
    expect(err.code).toBe("22023")
    const err2 = await asService((s) => pgError(s.query("select public.rate_limit_hit($1, $2)", ["k", 0])))
    expect(err2.code).toBe("22023")
  })
})
