import type { PGlite } from "@electric-sql/pglite"

/**
 * FIXTURES DE TESTE — dados fictícios, usados SOMENTE em testes locais (PGlite).
 * Nunca aplicar em ambiente real. CNPJs são gerados a partir de bases
 * arbitrárias com dígitos verificadores calculados (não correspondem a empresas).
 */

function cnpjWithCheckDigits(base12: string): string {
  const calc = (base: string, weights: number[]) => {
    const sum = weights.reduce((acc, w, i) => acc + (base.charCodeAt(i) - 48) * w, 0)
    const rest = sum % 11
    return rest < 2 ? 0 : 11 - rest
  }
  const d1 = calc(base12, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2])
  const d2 = calc(base12 + d1, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2])
  return `${base12}${d1}${d2}`
}

const id = (n: number) => `00000000-0000-4000-8000-${n.toString().padStart(12, "0")}`

export const CNPJ = {
  A: cnpjWithCheckDigits("900000010001"),
  B: cnpjWithCheckDigits("900000020001"),
  C: cnpjWithCheckDigits("900000030001"),
  D: cnpjWithCheckDigits("900000040001"),
  /** Não cadastrado */
  X: cnpjWithCheckDigits("900000990001"),
}

export const COMPANY = { A: id(101), B: id(102), C: id(103), D: id(104) }
export const UNIT = { A1: id(201), A2: id(202), B1: id(203) }

export const USER = {
  timpAdmin: id(1),
  timpAdmin2: id(2),
  timpOperator: id(3),
  timpTechnician: id(4),
  aAdmin: id(11),
  aUser: id(12),
  aPending: id(13),
  aMembershipSuspended: id(14),
  aProfileSuspended: id(15),
  aPendingAdmin: id(16),
  bAdmin: id(21),
  bUser: id(22),
  bPending: id(23),
  newcomer: id(31),
  blockedNewcomer: id(32),
}

export const MEMBERSHIP = {
  aAdmin: id(301),
  aUser: id(302),
  aPending: id(303),
  aMembershipSuspended: id(304),
  aProfileSuspended: id(305),
  aPendingAdmin: id(306),
  bAdmin: id(311),
  bUser: id(312),
  bPending: id(313),
}

export async function seedFixtures(db: PGlite): Promise<void> {
  const users = Object.entries(USER)
    .map(([key, uid]) => `('${uid}', '${key.toLowerCase()}@example.test')`)
    .join(",\n")
  await db.exec(`insert into auth.users (id, email) values ${users};`)

  await db.exec(`
    update public.profiles set status = 'active'
      where id not in ('${USER.newcomer}', '${USER.blockedNewcomer}', '${USER.aPending}', '${USER.bPending}', '${USER.aPendingAdmin}');
    update public.profiles set status = 'suspended' where id = '${USER.aProfileSuspended}';
    update public.profiles set status = 'blocked' where id = '${USER.blockedNewcomer}';
    update public.profiles set timp_role = 'timp_admin' where id in ('${USER.timpAdmin}', '${USER.timpAdmin2}');
    update public.profiles set timp_role = 'timp_operator' where id = '${USER.timpOperator}';
    update public.profiles set timp_role = 'timp_technician' where id = '${USER.timpTechnician}';

    insert into public.companies (id, legal_name, cnpj, signup_enabled) values
      ('${COMPANY.A}', 'Empresa Teste A', '${CNPJ.A}', true),
      ('${COMPANY.B}', 'Empresa Teste B', '${CNPJ.B}', true),
      ('${COMPANY.C}', 'Empresa Teste C', '${CNPJ.C}', true),
      ('${COMPANY.D}', 'Empresa Teste D', '${CNPJ.D}', false);

    insert into public.units (id, company_id, name) values
      ('${UNIT.A1}', '${COMPANY.A}', 'Unidade A1'),
      ('${UNIT.A2}', '${COMPANY.A}', 'Unidade A2'),
      ('${UNIT.B1}', '${COMPANY.B}', 'Unidade B1');

    insert into public.company_memberships (id, user_id, company_id, role, status, approved_at) values
      ('${MEMBERSHIP.aAdmin}', '${USER.aAdmin}', '${COMPANY.A}', 'client_admin', 'active', now()),
      ('${MEMBERSHIP.aUser}', '${USER.aUser}', '${COMPANY.A}', 'client_user', 'active', now()),
      ('${MEMBERSHIP.aPending}', '${USER.aPending}', '${COMPANY.A}', 'client_user', 'pending_approval', null),
      ('${MEMBERSHIP.aMembershipSuspended}', '${USER.aMembershipSuspended}', '${COMPANY.A}', 'client_user', 'suspended', now()),
      ('${MEMBERSHIP.aProfileSuspended}', '${USER.aProfileSuspended}', '${COMPANY.A}', 'client_admin', 'active', now()),
      ('${MEMBERSHIP.aPendingAdmin}', '${USER.aPendingAdmin}', '${COMPANY.A}', 'client_admin', 'pending_approval', null),
      ('${MEMBERSHIP.bAdmin}', '${USER.bAdmin}', '${COMPANY.B}', 'client_admin', 'active', now()),
      ('${MEMBERSHIP.bUser}', '${USER.bUser}', '${COMPANY.B}', 'client_user', 'active', now()),
      ('${MEMBERSHIP.bPending}', '${USER.bPending}', '${COMPANY.B}', 'client_user', 'pending_approval', null);

    insert into public.membership_units (membership_id, unit_id, company_id) values
      ('${MEMBERSHIP.aUser}', '${UNIT.A1}', '${COMPANY.A}'),
      ('${MEMBERSHIP.aMembershipSuspended}', '${UNIT.A1}', '${COMPANY.A}'),
      ('${MEMBERSHIP.bUser}', '${UNIT.B1}', '${COMPANY.B}');
  `)
}
