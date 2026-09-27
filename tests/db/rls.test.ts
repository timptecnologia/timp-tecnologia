import type { PGlite } from "@electric-sql/pglite"
import { beforeAll, describe, expect, it } from "vitest"

import { CNPJ, COMPANY, MEMBERSHIP, UNIT, USER, seedFixtures } from "./fixtures"
import { as, createTestDatabase, pgError, type Aal, type Session } from "./harness"

/**
 * Testes NEGATIVOS de RLS / IDOR sobre as migrations reais (Postgres via PGlite).
 * Cada negação tem um controle positivo correspondente, para provar que o teste
 * não passa "por vacuidade" (ex.: nada visível para ninguém).
 */

let db: PGlite

beforeAll(async () => {
  db = await createTestDatabase()
  await seedFixtures(db)
})

const asUser = <T>(userId: string, fn: (s: Session) => Promise<T>, aal: Aal = "aal2") =>
  as(db, { role: "authenticated", userId, aal }, fn)
const asAnon = <T>(fn: (s: Session) => Promise<T>) => as(db, { role: "anon" }, fn)

const ids = (rows: Array<{ id: string }>) => rows.map((r) => r.id).sort()
const DENIED = "42501" // insufficient_privilege

const TABLES = ["companies", "units", "profiles", "company_memberships", "membership_units", "audit_log"] as const

describe("anon (sem sessão)", () => {
  it.each(TABLES)("não lê %s", async (table) => {
    const err = await asAnon((s) => pgError(s.query(`select * from public.${table}`)))
    expect(err.code).toBe(DENIED)
  })

  it("não executa RPCs de vínculo/aprovação", async () => {
    const err = await asAnon((s) => pgError(s.query("select public.approve_membership($1)", [MEMBERSHIP.aPending])))
    expect(err.code).toBe(DENIED)
    const err2 = await asAnon((s) => pgError(s.query("select public.request_company_membership($1)", [CNPJ.A])))
    expect(err2.code).toBe(DENIED)
  })

  it("não escreve em nenhuma tabela", async () => {
    const err = await asAnon((s) =>
      pgError(s.query("insert into public.companies (legal_name, cnpj) values ('X', $1)", [CNPJ.X])),
    )
    expect(err.code).toBe(DENIED)
  })
})

describe("isolamento entre tenants (Empresa A × Empresa B)", () => {
  it("controle positivo: Cliente Admin A lê a própria empresa e suas unidades", async () => {
    const companies = await asUser(USER.aAdmin, (s) => s.query<{ id: string }>("select id from public.companies"))
    expect(ids(companies)).toEqual([COMPANY.A])
    const units = await asUser(USER.aAdmin, (s) => s.query<{ id: string }>("select id from public.units"))
    expect(ids(units)).toEqual([UNIT.A1, UNIT.A2].sort())
  })

  it("tenant A NÃO lê empresa/unidades/vínculos/perfis de B (mesmo filtrando pelo ID de B)", async () => {
    await asUser(USER.aAdmin, async (s) => {
      expect(await s.query("select * from public.companies where id = $1", [COMPANY.B])).toHaveLength(0)
      expect(await s.query("select * from public.units where company_id = $1", [COMPANY.B])).toHaveLength(0)
      expect(await s.query("select * from public.units where id = $1", [UNIT.B1])).toHaveLength(0)
      expect(await s.query("select * from public.company_memberships where company_id = $1", [COMPANY.B])).toHaveLength(0)
      expect(await s.query("select * from public.profiles where id = $1", [USER.bAdmin])).toHaveLength(0)
      expect(await s.query("select * from public.membership_units where company_id = $1", [COMPANY.B])).toHaveLength(0)
    })
  })

  it("tenant B NÃO lê dados de A (simétrico)", async () => {
    await asUser(USER.bUser, async (s) => {
      expect(await s.query("select * from public.companies where id = $1", [COMPANY.A])).toHaveLength(0)
      expect(await s.query("select * from public.units where id = $1", [UNIT.A1])).toHaveLength(0)
      expect(await s.query("select * from public.profiles where id = $1", [USER.aUser])).toHaveLength(0)
    })
  })

  it("tenant A NÃO altera empresa/unidade de B (sem efeito e sem privilégio)", async () => {
    await asUser(USER.aAdmin, async (s) => {
      // Cliente não tem política de UPDATE: 0 linhas afetadas, mesmo na própria empresa
      const r1 = await s.query("update public.companies set legal_name = 'hack' where id = $1 returning id", [COMPANY.B])
      expect(r1).toHaveLength(0)
      const r2 = await s.query("update public.units set name = 'hack' where id = $1 returning id", [UNIT.B1])
      expect(r2).toHaveLength(0)
      // Colunas sem grant → erro de privilégio
      const e = await pgError(s.query("update public.units set company_id = $1 where id = $2", [COMPANY.A, UNIT.B1]))
      expect(e.code).toBe(DENIED)
    })
  })

  it("company_id manipulado: cliente não cria unidade em outra empresa (nem na própria)", async () => {
    await asUser(USER.aAdmin, async (s) => {
      const e1 = await pgError(s.query("insert into public.units (company_id, name) values ($1, 'X')", [COMPANY.B]))
      expect(e1.code).toBe(DENIED)
      const e2 = await pgError(s.query("insert into public.units (company_id, name) values ($1, 'X')", [COMPANY.A]))
      expect(e2.code).toBe(DENIED)
    })
  })

  it("company_id/user_id manipulados: cliente não cria vínculo direto (mass assignment)", async () => {
    await asUser(USER.aUser, async (s) => {
      const e = await pgError(
        s.query("insert into public.company_memberships (user_id, company_id, role, status, approved_at) values ($1, $2, 'client_admin', 'active', now())", [
          USER.aUser,
          COMPANY.B,
        ]),
      )
      expect(e.code).toBe(DENIED)
    })
  })

  it("DELETE é negado para clientes em todas as tabelas", async () => {
    for (const table of TABLES) {
      const err = await asUser(USER.aAdmin, (s) => pgError(s.query(`delete from public.${table}`)))
      expect(err.code, table).toBe(DENIED)
    }
  })
})

describe("escopo de unidade (unit_id IDOR dentro da mesma empresa)", () => {
  it("Cliente Usuário vê SOMENTE as unidades atribuídas", async () => {
    const units = await asUser(USER.aUser, (s) => s.query<{ id: string }>("select id from public.units"))
    expect(ids(units)).toEqual([UNIT.A1])
    const direct = await asUser(USER.aUser, (s) => s.query("select * from public.units where id = $1", [UNIT.A2]))
    expect(direct).toHaveLength(0)
  })

  it("Cliente Usuário não vê vínculos nem perfis de outros usuários da empresa", async () => {
    const memberships = await asUser(USER.aUser, (s) => s.query<{ id: string }>("select id from public.company_memberships"))
    expect(ids(memberships)).toEqual([MEMBERSHIP.aUser])
    const profiles = await asUser(USER.aUser, (s) => s.query<{ id: string }>("select id from public.profiles"))
    expect(ids(profiles)).toEqual([USER.aUser])
  })

  it("Cliente Admin não atribui unidade de outra empresa a um usuário (unit_id de B)", async () => {
    const err = await asUser(USER.aAdmin, (s) =>
      pgError(s.query("select public.set_membership_units($1, $2)", [MEMBERSHIP.aUser, [UNIT.A1, UNIT.B1]])),
    )
    expect(err.code).toBe(DENIED)
  })

  it("controle positivo: Cliente Admin atribui unidade da própria empresa", async () => {
    await asUser(USER.aAdmin, async (s) => {
      await s.exec("select public.set_membership_units($1, $2)", [MEMBERSHIP.aUser, [UNIT.A1, UNIT.A2]])
      const rows = await s.query<{ unit_id: string }>("select unit_id from public.membership_units where membership_id = $1", [
        MEMBERSHIP.aUser,
      ])
      expect(rows.map((r) => r.unit_id).sort()).toEqual([UNIT.A1, UNIT.A2].sort())
    })
  })

  it("Cliente Admin de A não altera escopo de vínculo de B (membership_id de B)", async () => {
    const err = await asUser(USER.aAdmin, (s) => pgError(s.query("select public.set_membership_units($1, $2)", [MEMBERSHIP.bUser, [UNIT.B1]])))
    expect(err.code).toBe(DENIED)
  })
})

describe("perfis: user_id manipulado e colunas protegidas", () => {
  it("usuário não altera perfil de outro usuário", async () => {
    const rows = await asUser(USER.aAdmin, (s) =>
      s.query("update public.profiles set full_name = 'hack' where id = $1 returning id", [USER.aUser]),
    )
    expect(rows).toHaveLength(0)
  })

  it("usuário não altera o próprio status nem a própria role (escalonamento)", async () => {
    await asUser(USER.aUser, async (s) => {
      expect((await pgError(s.query("update public.profiles set status = 'active' where id = $1", [USER.aUser]))).code).toBe(DENIED)
      expect((await pgError(s.query("update public.profiles set timp_role = 'timp_admin' where id = $1", [USER.aUser]))).code).toBe(DENIED)
    })
  })

  it("controle positivo: usuário altera o próprio nome", async () => {
    const rows = await asUser(USER.aUser, (s) =>
      s.query("update public.profiles set full_name = 'Nome Teste' where id = $1 returning id", [USER.aUser]),
    )
    expect(rows).toHaveLength(1)
  })

  it("metadados do signUp não definem role/status (perfil nasce pendente e sem role)", async () => {
    await db.transaction(async (tx) => {
      const uid = "00000000-0000-4000-8000-000000009999"
      await tx.query(
        `insert into auth.users (id, email, raw_user_meta_data) values ($1, 'meta@example.test', '{"timp_role":"timp_admin","status":"active","role":"client_admin"}')`,
        [uid],
      )
      const res = await tx.query<{ status: string; timp_role: string | null }>("select status, timp_role from public.profiles where id = $1", [uid])
      expect(res.rows[0]).toEqual({ status: "pending_approval", timp_role: null })
      await tx.rollback()
    })
  })
})

describe("aprovação de vínculos (regras HANDOFF §17)", () => {
  it("controle positivo: Cliente Admin aprova usuário comum da própria empresa", async () => {
    await asUser(USER.aAdmin, async (s) => {
      await s.exec("select public.approve_membership($1)", [MEMBERSHIP.aPending])
      const [m] = await s.query<{ status: string; approved_by: string }>(
        "select status, approved_by from public.company_memberships where id = $1",
        [MEMBERSHIP.aPending],
      )
      expect(m).toEqual({ status: "active", approved_by: USER.aAdmin })
    })
  })

  it("Cliente Admin NÃO aprova Cliente Admin (primeiro admin/admin → somente TIMP)", async () => {
    const err = await asUser(USER.aAdmin, (s) => pgError(s.query("select public.approve_membership($1)", [MEMBERSHIP.aPendingAdmin])))
    expect(err.code).toBe(DENIED)
  })

  it("controle positivo: TIMP Admin aprova Cliente Admin", async () => {
    await asUser(USER.timpAdmin, async (s) => {
      await s.exec("select public.approve_membership($1)", [MEMBERSHIP.aPendingAdmin])
      const [m] = await s.query<{ status: string }>("select status from public.company_memberships where id = $1", [MEMBERSHIP.aPendingAdmin])
      expect(m?.status).toBe("active")
    })
  })

  it("Cliente Admin de A NÃO aprova vínculo de B (membership_id de outro tenant)", async () => {
    const err = await asUser(USER.aAdmin, (s) => pgError(s.query("select public.approve_membership($1)", [MEMBERSHIP.bPending])))
    expect(err.code).toBe(DENIED)
  })

  it("resposta idêntica para ID inexistente e ID de outro tenant (sem enumeração)", async () => {
    const other = await asUser(USER.aAdmin, (s) => pgError(s.query("select public.approve_membership($1)", [MEMBERSHIP.bPending])))
    const missing = await asUser(USER.aAdmin, (s) =>
      pgError(s.query("select public.approve_membership($1)", ["00000000-0000-4000-8000-00000000abcd"])),
    )
    expect(missing).toEqual(other)
  })

  it("Cliente Usuário NÃO aprova ninguém (role inferior)", async () => {
    const err = await asUser(USER.aUser, (s) => pgError(s.query("select public.approve_membership($1)", [MEMBERSHIP.aPending])))
    expect(err.code).toBe(DENIED)
  })

  it.each([
    ["TIMP Operador", USER.timpOperator],
    ["TIMP Técnico", USER.timpTechnician],
  ])("%s NÃO aprova (aprovação TIMP = timp_admin)", async (_label, uid) => {
    const err = await asUser(uid, (s) => pgError(s.query("select public.approve_membership($1)", [MEMBERSHIP.aPendingAdmin])))
    expect(err.code).toBe(DENIED)
  })

  it("ninguém aprova o próprio vínculo", async () => {
    const err = await asUser(USER.aPending, (s) => pgError(s.query("select public.approve_membership($1)", [MEMBERSHIP.aPending])))
    expect(err.code).toBe(DENIED)
  })

  it("aprovação sem MFA (aal1) é negada, mesmo para TIMP Admin", async () => {
    const e1 = await asUser(USER.timpAdmin, (s) => pgError(s.query("select public.approve_membership($1)", [MEMBERSHIP.aPendingAdmin])), "aal1")
    expect(e1.code).toBe(DENIED)
    const e2 = await asUser(USER.aAdmin, (s) => pgError(s.query("select public.approve_membership($1)", [MEMBERSHIP.aPending])), "aal1")
    expect(e2.code).toBe(DENIED)
  })

  it("promoção a Cliente Admin: Cliente Admin NÃO promove; TIMP Admin promove", async () => {
    const err = await asUser(USER.aAdmin, (s) => pgError(s.query("select public.set_membership_role($1, 'client_admin')", [MEMBERSHIP.aUser])))
    expect(err.code).toBe(DENIED)
    await asUser(USER.timpAdmin, async (s) => {
      await s.exec("select public.set_membership_role($1, 'client_admin')", [MEMBERSHIP.aUser])
      const [m] = await s.query<{ role: string }>("select role from public.company_memberships where id = $1", [MEMBERSHIP.aUser])
      expect(m?.role).toBe("client_admin")
    })
  })

  it("cliente NÃO executa ações TIMP (override de status, role TIMP, habilitar CNPJ)", async () => {
    await asUser(USER.aAdmin, async (s) => {
      expect((await pgError(s.query("select public.set_membership_status($1, 'suspended', 'motivo teste')", [MEMBERSHIP.aUser]))).code).toBe(DENIED)
      expect((await pgError(s.query("select public.set_profile_status($1, 'blocked', 'motivo teste')", [USER.aUser]))).code).toBe(DENIED)
      expect((await pgError(s.query("select public.set_timp_role($1, 'timp_admin')", [USER.aAdmin]))).code).toBe(DENIED)
      const r = await s.query("update public.companies set signup_enabled = true where id = $1 returning id", [COMPANY.D])
      expect(r).toHaveLength(0)
    })
  })

  it("TIMP Operador NÃO executa override administrativo", async () => {
    const err = await asUser(USER.timpOperator, (s) =>
      pgError(s.query("select public.set_profile_status($1, 'blocked', 'motivo teste')", [USER.aUser])),
    )
    expect(err.code).toBe(DENIED)
  })

  it("TIMP Admin não altera o próprio acesso/role", async () => {
    const err = await asUser(USER.timpAdmin, (s) => pgError(s.query("select public.set_timp_role($1, null)", [USER.timpAdmin])))
    expect(err.code).toBe(DENIED)
  })
})

describe("usuário suspenso / bloqueado / revogado não permanece autorizado", () => {
  it("vínculo suspenso: perde leitura da empresa e unidades", async () => {
    await asUser(USER.aMembershipSuspended, async (s) => {
      expect(await s.query("select * from public.companies")).toHaveLength(0)
      expect(await s.query("select * from public.units")).toHaveLength(0)
    })
  })

  it("perfil suspenso: Cliente Admin perde leitura e poder de aprovação", async () => {
    await asUser(USER.aProfileSuspended, async (s) => {
      expect(await s.query("select * from public.companies")).toHaveLength(0)
      expect(await s.query("select * from public.units")).toHaveLength(0)
      expect((await pgError(s.query("select public.approve_membership($1)", [MEMBERSHIP.aPending]))).code).toBe(DENIED)
    })
  })

  it("suspensão pela TIMP tem efeito imediato na mesma sessão", async () => {
    // Suspende e verifica na mesma transação (a policy é reavaliada a cada consulta)
    await db.transaction(async (tx) => {
      await tx.query("select set_config('request.jwt.claims', $1, true)", [
        JSON.stringify({ sub: USER.timpAdmin, role: "authenticated", aal: "aal2" }),
      ])
      await tx.exec("set local role authenticated")
      await tx.query("select public.set_profile_status($1, 'suspended', 'teste de suspensão')", [USER.aUser])
      await tx.query("select set_config('request.jwt.claims', $1, true)", [
        JSON.stringify({ sub: USER.aUser, role: "authenticated", aal: "aal1" }),
      ])
      const res = await tx.query("select * from public.units")
      expect(res.rows).toHaveLength(0)
      await tx.rollback()
    })
  })

  it("controle positivo: o mesmo Cliente Usuário ativo lê sua unidade", async () => {
    const rows = await asUser(USER.aUser, (s) => s.query("select * from public.units"), "aal1")
    expect(rows).toHaveLength(1)
  })

  it("TIMP staff sem MFA (aal1) não tem acesso privilegiado cross-tenant", async () => {
    const rows = await asUser(USER.timpAdmin, (s) => s.query("select * from public.companies"), "aal1")
    expect(rows).toHaveLength(0)
    const withMfa = await asUser(USER.timpAdmin, (s) => s.query("select * from public.companies"))
    expect(withMfa.length).toBeGreaterThanOrEqual(4)
  })

  it("Cliente Admin sem MFA (aal1) não exerce privilégios de admin", async () => {
    const rows = await asUser(USER.aAdmin, (s) => s.query("select * from public.company_memberships"), "aal1")
    // Só enxerga o próprio vínculo
    expect(ids(rows as Array<{ id: string }>)).toEqual([MEMBERSHIP.aAdmin])
  })
})

describe("cadastro por CNPJ habilitado", () => {
  it("CNPJ não habilitado / inexistente → mesma negação", async () => {
    const disabled = await asUser(USER.newcomer, (s) => pgError(s.query("select public.request_company_membership($1)", [CNPJ.D])), "aal1")
    const unknown = await asUser(USER.newcomer, (s) => pgError(s.query("select public.request_company_membership($1)", [CNPJ.X])), "aal1")
    expect(disabled.code).toBe(DENIED)
    expect(unknown).toEqual(disabled)
  })

  it("primeiro solicitante de empresa sem admin vira candidato a Cliente Admin; demais, usuário comum", async () => {
    await asUser(
      USER.newcomer,
      async (s) => {
        const [row] = await s.query<{ id: string }>("select public.request_company_membership($1) as id", [CNPJ.C])
        const [m] = await s.query<{ role: string; status: string }>("select role, status from public.company_memberships where id = $1", [row?.id])
        expect(m).toEqual({ role: "client_admin", status: "pending_approval" })
      },
      "aal1",
    )
    await asUser(
      USER.newcomer,
      async (s) => {
        const [row] = await s.query<{ id: string }>("select public.request_company_membership($1) as id", [CNPJ.A])
        const [m] = await s.query<{ role: string }>("select role from public.company_memberships where id = $1", [row?.id])
        expect(m?.role).toBe("client_user")
      },
      "aal1",
    )
  })

  it("conta bloqueada não solicita vínculo", async () => {
    const err = await asUser(USER.blockedNewcomer, (s) => pgError(s.query("select public.request_company_membership($1)", [CNPJ.A])), "aal1")
    expect(err.code).toBe(DENIED)
  })

  it("controle positivo: TIMP Admin habilita CNPJ e o carimbo é do servidor", async () => {
    await asUser(USER.timpAdmin, async (s) => {
      const [row] = await s.query<{ signup_enabled_by: string }>(
        "update public.companies set signup_enabled = true where id = $1 returning signup_enabled_by",
        [COMPANY.D],
      )
      expect(row?.signup_enabled_by).toBe(USER.timpAdmin)
    })
  })
})

describe("audit log (append-only, protegido)", () => {
  it("cliente não lê auditoria", async () => {
    const rows = await asUser(USER.aAdmin, (s) => s.query("select * from public.audit_log"))
    expect(rows).toHaveLength(0)
  })

  it("ninguém autenticado insere/altera/apaga auditoria diretamente", async () => {
    await asUser(USER.timpAdmin, async (s) => {
      const ins = await pgError(
        s.query("insert into public.audit_log (action, entity_type, result, origin) values ('x.y', 'x', 'success', 'web')"),
      )
      expect(ins.code).toBe(DENIED)
      expect((await pgError(s.query("update public.audit_log set action = 'x.z'"))).code).toBe(DENIED)
      expect((await pgError(s.query("delete from public.audit_log"))).code).toBe(DENIED)
    })
  })

  it("nem o dono do banco / service role altera ou apaga registros (trigger)", async () => {
    await as(db, { role: "service_role" }, async (s) => {
      expect((await pgError(s.query("update public.audit_log set action = 'x.z'"))).code).toBe(DENIED)
      expect((await pgError(s.query("delete from public.audit_log"))).code).toBe(DENIED)
    })
    expect((await pgError(db.query("truncate public.audit_log"))).code).toBe(DENIED)
  })

  it("metadata com chave de segredo é rejeitada", async () => {
    await as(db, { role: "service_role" }, async (s) => {
      const err = await pgError(
        s.query(
          `insert into public.audit_log (action, entity_type, result, origin, metadata) values ('auth.login', 'session', 'failure', 'web', '{"attempt":{"password":"x"}}')`,
        ),
      )
      expect(err.code).toBe("23514") // check_violation
    })
  })

  it("aprovação gera registro com ator, tenant e resultado; TIMP Admin lê", async () => {
    await asUser(USER.aAdmin, async (s) => {
      await s.exec("select public.approve_membership($1)", [MEMBERSHIP.aPending])
      // Mesmo o Cliente Admin que agiu não lê a auditoria
      expect(await s.query("select * from public.audit_log")).toHaveLength(0)
    })
    await asUser(USER.timpAdmin, async (s) => {
      await s.exec("select public.approve_membership($1)", [MEMBERSHIP.bPending])
      const rows = await s.query<{ actor_id: string; actor_role: string; company_id: string; result: string }>(
        "select actor_id, actor_role, company_id, result from public.audit_log where action = 'membership.approve'",
      )
      expect(rows).toContainEqual({ actor_id: USER.timpAdmin, actor_role: "timp_admin", company_id: COMPANY.B, result: "success" })
    })
  })
})

describe("grants mínimos", () => {
  it("authenticated não tem privilégios de escrita além das colunas permitidas", async () => {
    const res = await db.query<{ table_name: string; privilege_type: string }>(`
      select table_name, privilege_type from information_schema.role_table_grants
      where grantee in ('anon', 'authenticated') and table_schema = 'public'
      order by 1, 2`)
    // Só SELECT em nível de tabela; INSERT/UPDATE apenas por coluna (verificado abaixo)
    for (const row of res.rows) expect(row.privilege_type, `${row.table_name}`).toBe("SELECT")
    expect(res.rows.some((r) => r.table_name === "audit_log")).toBe(true)
  })

  it("anon não possui nenhum grant", async () => {
    const res = await db.query(`select 1 from information_schema.role_table_grants where grantee = 'anon' and table_schema = 'public'`)
    expect(res.rows).toHaveLength(0)
  })

  it("todas as tabelas de public têm RLS habilitado", async () => {
    const res = await db.query<{ relname: string; relrowsecurity: boolean }>(`
      select c.relname, c.relrowsecurity from pg_class c join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public' and c.relkind = 'r'`)
    expect(res.rows.length).toBeGreaterThanOrEqual(6)
    for (const row of res.rows) expect(row.relrowsecurity, row.relname).toBe(true)
  })

  it("nenhuma policy é concedida a anon ou PUBLIC", async () => {
    const res = await db.query<{ policyname: string; roles: string }>(`select policyname, roles::text from pg_policies where schemaname = 'public'`)
    for (const row of res.rows) expect(row.roles, row.policyname).toBe("{authenticated}")
  })

  it("funções SECURITY DEFINER têm search_path fixo", async () => {
    const res = await db.query<{ proname: string; proconfig: string[] | null }>(`
      select p.proname, p.proconfig from pg_proc p join pg_namespace n on n.oid = p.pronamespace
      where n.nspname in ('public', 'app') and p.prosecdef`)
    expect(res.rows.length).toBeGreaterThan(0)
    for (const row of res.rows) expect(row.proconfig ?? [], row.proname).toContain("search_path=\"\"")
  })
})
