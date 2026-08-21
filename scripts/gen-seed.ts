import { writeFileSync } from 'fs';
import {
  INITIAL_SUPPLIERS,
  INITIAL_CARS,
  INITIAL_AUDITS,
  INITIAL_USERS,
} from '../src/data/mockData';

const q = (v: unknown): string => {
  if (v === undefined || v === null || v === '') return 'null';
  if (typeof v === 'number') return String(v);
  if (typeof v === 'boolean') return v ? 'true' : 'false';
  return `'${String(v).replace(/'/g, "''")}'`;
};
const j = (v: unknown): string => `'${JSON.stringify(v).replace(/'/g, "''")}'::jsonb`;

const lines: string[] = [];
lines.push(`-- ============================================================================
-- Supplier CoP Management Hub — Seed data (mock / demo only, no real suppliers)
-- Generated from src/data/mockData.ts. Run AFTER 01_schema.sql and 02_rls.sql.
--
-- compositeScore and tier are deliberately NOT inserted: the
-- trg_suppliers_composite trigger derives them from ppm / otd / auditScore /
-- scarClosure so the server is the single source of truth.
-- ============================================================================
`);

lines.push(`-- ${INITIAL_SUPPLIERS.length} suppliers -------------------------------------------------------`);
lines.push(`insert into public.suppliers
  (id, name, commodity, location, region, "riskCategory", "iatfCertExpiry", "iatfStatus",
   "assessmentStatus", "assessmentScore", "sqaSigned", "sqaDate", "approvalStatus",
   ppm, otd, "auditScore", "scarClosure", duns, contacts, accreditations, notes)
values`);
lines.push(
  INITIAL_SUPPLIERS.map(
    (s) =>
      `  (${q(s.id)}, ${q(s.name)}, ${q(s.commodity)}, ${q(s.location)}, ${q(s.region)}, ${q(s.riskCategory)}, ${q(s.iatfCertExpiry)}, ${q(s.iatfStatus)},\n   ${q(s.assessmentStatus)}, ${s.assessmentScore}, ${q(s.sqaSigned)}, ${q(s.sqaDate)}, ${q(s.approvalStatus)},\n   ${s.ppm}, ${s.otd}, ${s.auditScore}, ${s.scarClosure}, ${q(s.duns)}, ${j(s.contacts)}, ${j(s.accreditations)}, ${q(s.notes)})`
  ).join(',\n')
);
lines.push(`on conflict (id) do nothing;\n`);

lines.push(`-- ${INITIAL_CARS.length} corrective action requests ---------------------------------------`);
lines.push(`insert into public.cars
  (ref, "supplierId", "supplierName", issue, "raisedDate", "dueDate", severity, status,
   "assignedSqe", "rootCause", "containmentAction")
values`);
lines.push(
  INITIAL_CARS.map(
    (c) =>
      `  (${q(c.ref)}, ${q(c.supplierId)}, ${q(c.supplierName)}, ${q(c.issue)}, ${q(c.raisedDate)}, ${q(c.dueDate)}, ${q(c.severity)}, ${q(c.status)},\n   ${q(c.assignedSqe)}, ${q(c.rootCause)}, ${q(c.containmentAction)})`
  ).join(',\n')
);
lines.push(`on conflict (ref) do nothing;\n`);

lines.push(`-- ${INITIAL_AUDITS.length} audits ----------------------------------------------------------`);
lines.push(`insert into public.audits
  (id, "supplierId", "supplierName", "auditType", "lastDate", "nextDate", result,
   "scorePercent", status, "leadAuditor", "findingsCount")
values`);
lines.push(
  INITIAL_AUDITS.map(
    (a) =>
      `  (${q(a.id)}, ${q(a.supplierId)}, ${q(a.supplierName)}, ${q(a.auditType)}, ${q(a.lastDate)}, ${q(a.nextDate)}, ${q(a.result)},\n   ${a.scorePercent}, ${q(a.status)}, ${q(a.leadAuditor)}, ${a.findingsCount})`
  ).join(',\n')
);
lines.push(`on conflict (id) do nothing;\n`);

lines.push(`-- ${INITIAL_USERS.length} directory users -------------------------------------------------`);
lines.push(`insert into public.users
  (id, name, email, role, department, status, avatar, "lastActive")
values`);
lines.push(
  INITIAL_USERS.map(
    (u) =>
      `  (${q(u.id)}, ${q(u.name)}, ${q(u.email)}, ${q(u.role)}, ${q(u.department)}, ${q(u.status)}, ${q(u.avatar)}, ${q(u.lastActive)})`
  ).join(',\n')
);
lines.push(`on conflict (email) do nothing;`);

writeFileSync(new URL('../supabase/03_seed.sql', import.meta.url), lines.join('\n') + '\n');
console.log(
  `seed written: ${INITIAL_SUPPLIERS.length} suppliers, ${INITIAL_CARS.length} cars, ${INITIAL_AUDITS.length} audits, ${INITIAL_USERS.length} users`
);
