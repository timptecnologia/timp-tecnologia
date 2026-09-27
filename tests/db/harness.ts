import { readdirSync, readFileSync } from "node:fs"
import { join } from "node:path"

import { PGlite } from "@electric-sql/pglite"

/**
 * Harness de banco para testes de RLS/IDOR.
 * Aplica o shim do Supabase + as migrations REAIS do projeto (sem alteração)
 * em um Postgres real (PGlite / WASM) e executa consultas como cada papel.
 */

const ROOT = join(__dirname, "..", "..")
const MIGRATIONS_DIR = join(ROOT, "supabase", "migrations")

export function migrationFiles(): string[] {
  return readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql"))
    .sort()
}

export async function createTestDatabase(): Promise<PGlite> {
  const db = new PGlite()
  await db.exec(readFileSync(join(__dirname, "supabase-shim.sql"), "utf8"))
  for (const file of migrationFiles()) {
    try {
      await db.exec(readFileSync(join(MIGRATIONS_DIR, file), "utf8"))
    } catch (error) {
      throw new Error(`Falha ao aplicar migration ${file}: ${(error as Error).message}`)
    }
  }
  return db
}

export type Aal = "aal1" | "aal2"

export interface Session {
  query<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<T[]>
  exec(sql: string, params?: unknown[]): Promise<void>
}

/**
 * Executa `fn` como um papel específico, com claims JWT como o PostgREST faz.
 * Tudo roda dentro de uma transação que é SEMPRE desfeita (rollback) — cada
 * cenário parte do mesmo estado de fixtures.
 */
export async function as<T>(
  db: PGlite,
  identity: { role: "anon" } | { role: "authenticated"; userId: string; aal?: Aal } | { role: "service_role" },
  fn: (s: Session) => Promise<T>,
): Promise<T> {
  const claims =
    identity.role === "authenticated"
      ? { sub: identity.userId, role: "authenticated", aal: identity.aal ?? "aal2" }
      : { role: identity.role }

  return db.transaction(async (tx) => {
    await tx.query("select set_config('request.jwt.claims', $1, true)", [JSON.stringify(claims)])
    await tx.exec(`set local role ${identity.role}`)
    // Cada comando roda em SAVEPOINT: um erro esperado não aborta o cenário inteiro.
    let n = 0
    async function run<R>(sql: string, params?: unknown[]): Promise<R[]> {
      const sp = `sp_${++n}`
      await tx.exec(`savepoint ${sp}`)
      try {
        const res = await tx.query<R>(sql, params)
        await tx.exec(`release savepoint ${sp}`)
        return res.rows
      } catch (error) {
        await tx.exec(`rollback to savepoint ${sp}`)
        throw error
      }
    }
    const session: Session = {
      query: run,
      async exec(sql: string, params?: unknown[]) {
        await run(sql, params)
      },
    }
    try {
      return await fn(session)
    } finally {
      await tx.rollback()
    }
  })
}

/** Captura o erro do Postgres (código + mensagem) de uma operação que DEVE falhar. */
export async function pgError(promise: Promise<unknown>): Promise<{ code?: string; message: string }> {
  try {
    await promise
  } catch (error) {
    const e = error as { code?: string; message: string }
    return { code: e.code, message: e.message }
  }
  throw new Error("Esperava erro do banco, mas a operação foi executada com sucesso")
}
