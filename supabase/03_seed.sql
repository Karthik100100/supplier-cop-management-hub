-- ============================================================================
-- Supplier CoP Management Hub — Seed data (mock / demo only, no real suppliers)
-- Generated from src/data/mockData.ts. Run AFTER 01_schema.sql and 02_rls.sql.
--
-- compositeScore and tier are deliberately NOT inserted: the
-- trg_suppliers_composite trigger derives them from ppm / otd / auditScore /
-- scarClosure so the server is the single source of truth.
-- ============================================================================

-- 8 suppliers -------------------------------------------------------
insert into public.suppliers
  (id, name, commodity, location, region, "riskCategory", "iatfCertExpiry", "iatfStatus",
   "assessmentStatus", "assessmentScore", "sqaSigned", "sqaDate", "approvalStatus",
   ppm, otd, "auditScore", "scarClosure", duns, contacts, accreditations, notes)
values
  ('SUP-10294', 'Apex Die Casting GmbH', 'Powertrain Components', 'Stuttgart, Germany', 'EU', 'Low', '2026-11-15', 'Valid',
   'Audit Passed (94%)', 94, true, '2023-10-12', 'Approved',
   12.4, 99.2, 95, 100, '31-482-9012', '[{"name":"Dr. Klaus Weber","email":"k.weber@apex-diecasting.de","phone":"+49 711 889210","title":"Director of Quality"},{"name":"Helga Schmidt","email":"h.schmidt@apex-diecasting.de","phone":"+49 711 889211","title":"Key Account Executive"}]'::jsonb, '[{"name":"IATF 16949:2016","category":"Automotive QMS","status":"Valid","expiryDate":"2026-11-15","certNumber":"IATF-0482910"},{"name":"ISO 9001:2015","category":"Quality Management","status":"Valid","expiryDate":"2026-11-15","certNumber":"ISO-994821"},{"name":"ISO 14001:2015","category":"Environmental","status":"Valid","expiryDate":"2025-08-20","certNumber":"ENV-18290"},{"name":"TISAX Level 3","category":"Information Security","status":"Valid","expiryDate":"2026-03-30","certNumber":"TSX-29102"}]'::jsonb, 'Primary aluminum casting source for EV drivetrain housings. High capability Cpk > 1.67.'),
  ('SUP-08472', 'Global Wire Harness Ltd.', 'Electrical Systems', 'Guadalajara, Mexico', 'NA', 'Medium', '2025-04-10', 'Expiring Soon',
   'In Progress', 78, false, null, 'Pending',
   145, 94.5, 78, 45, '83-291-0492', '[{"name":"Carlos Mendez","email":"c.mendez@globalwire.mx","phone":"+52 33 4910 2849","title":"VP Quality & Operations"},{"name":"Sofia Ramos","email":"s.ramos@globalwire.mx","phone":"+52 33 4910 2850","title":"Program Manager"}]'::jsonb, '[{"name":"IATF 16949:2016","category":"Automotive QMS","status":"Expiring 30D","expiryDate":"2025-04-10","certNumber":"IATF-0391822"},{"name":"ISO 9001:2015","category":"Quality Management","status":"Valid","expiryDate":"2026-01-14","certNumber":"ISO-882910"},{"name":"ISO 45001:2018","category":"Occupational Health","status":"Valid","expiryDate":"2025-09-12","certNumber":"OHS-48192"}]'::jsonb, 'Experiencing minor crimping tool calibration drift. Corrective actions underway for terminal seating.'),
  ('SUP-09123', 'NeoPlast Polymers Inc.', 'Interior Plastics', 'Detroit, MI, USA', 'NA', 'High', '2024-12-01', 'Expired',
   'Audit Failed (62%)', 62, false, null, 'Rejected',
   188, 89, 62, 30, '19-382-7491', '[{"name":"David Miller","email":"dmiller@neoplast.com","phone":"+1 313 555 0192","title":"Quality Assurance Director"}]'::jsonb, '[{"name":"IATF 16949:2016","category":"Automotive QMS","status":"Expired","expiryDate":"2024-12-01","certNumber":"IATF-0182741"},{"name":"ISO 9001:2015","category":"Quality Management","status":"Pending","expiryDate":"2025-02-15","certNumber":"ISO-391820"}]'::jsonb, 'Failed initial Tier-1 CoP audit due to lack of statistical process control on injection pressure.'),
  ('SUP-11002', 'Stuttgart Bearings Co.', 'Chassis & Suspension', 'Munich, Germany', 'EU', 'Low', '2027-02-28', 'Valid',
   'Audit Passed (98%)', 98, true, '2022-04-01', 'Approved',
   8.5, 99.8, 98, 100, '44-910-3849', '[{"name":"Hans Gruber","email":"h.gruber@stuttgart-bearings.de","phone":"+49 89 2049102","title":"Chief Quality Officer"}]'::jsonb, '[{"name":"IATF 16949:2016","category":"Automotive QMS","status":"Valid","expiryDate":"2027-02-28","certNumber":"IATF-0591023"},{"name":"ISO 14001:2015","category":"Environmental","status":"Valid","expiryDate":"2026-09-30","certNumber":"ENV-39102"},{"name":"VDA 6.3 Grade A","category":"Process Quality","status":"Valid","expiryDate":"2026-05-15","certNumber":"VDA-88301"}]'::jsonb, 'Zero defects recorded over past 4 quarters. Benchmark supplier for Wheel Hub assemblies.'),
  ('SUP-10488', 'AutoPlast Solutions', 'Injection Molding', 'Wroclaw, Poland', 'EU', 'Low', '2026-07-19', 'Valid',
   'Audit Passed (91%)', 91, true, '2023-01-15', 'Approved',
   30, 98.1, 91, 92, '55-829-1048', '[{"name":"Marek Wisniewski","email":"m.wisniewski@autoplast.pl","phone":"+48 71 829 104","title":"Head of Quality Engineering"}]'::jsonb, '[{"name":"IATF 16949:2016","category":"Automotive QMS","status":"Valid","expiryDate":"2026-07-19","certNumber":"IATF-0492811"},{"name":"ISO 9001:2015","category":"Quality Management","status":"Valid","expiryDate":"2026-07-19","certNumber":"ISO-772910"}]'::jsonb, 'Specialized in instrument panel trim pieces. Highly responsive to engineering change notices.'),
  ('SUP-10332', 'Precision Castings Inc.', 'Die Casting', 'Nagoya, Japan', 'APAC', 'Medium', '2025-10-30', 'Valid',
   'Under Review', 88, true, '2023-06-20', 'Under Review',
   45.2, 97.8, 88, 80, '62-109-4820', '[{"name":"Kenji Sato","email":"k-sato@precisioncast.co.jp","phone":"+81 52 910 4829","title":"Plant Quality Manager"}]'::jsonb, '[{"name":"IATF 16949:2016","category":"Automotive QMS","status":"Valid","expiryDate":"2025-10-30","certNumber":"IATF-0481920"},{"name":"ISO 9001:2015","category":"Quality Management","status":"Valid","expiryDate":"2026-04-12","certNumber":"ISO-662910"},{"name":"TISAX Level 3","category":"Data Security","status":"Expiring 30D","expiryDate":"2025-05-15","certNumber":"TSX-10294"}]'::jsonb, 'High precision die casting for sensor brackets. Under review for Q1 certification endorsement.'),
  ('SUP-07821', 'MagnaTech Powertrain', 'Transmission & Gears', 'Toronto, Canada', 'NA', 'Low', '2026-12-05', 'Valid',
   'Audit Passed (96%)', 96, true, '2021-08-11', 'Approved',
   15, 99.4, 96, 95, '22-839-4019', '[{"name":"Sarah Jenkins","email":"s.jenkins@magnatech.ca","phone":"+1 416 555 3918","title":"Global Quality Director"}]'::jsonb, '[{"name":"IATF 16949:2016","category":"Automotive QMS","status":"Valid","expiryDate":"2026-12-05","certNumber":"IATF-0519283"},{"name":"ISO 14001:2015","category":"Environmental","status":"Valid","expiryDate":"2026-06-20","certNumber":"ENV-92810"}]'::jsonb, 'Strategic supplier for multi-speed transmission gearing. Excellent PPAP First-Time-Through.'),
  ('SUP-10991', 'Boschmann Sensorik SE', 'Sensors & ADAS', 'Reutlingen, Germany', 'EU', 'Low', '2027-05-18', 'Valid',
   'Audit Passed (99%)', 99, true, '2022-09-01', 'Approved',
   6.2, 99.9, 99, 100, '33-291-8840', '[{"name":"Dr. Stefan Braun","email":"s.braun@boschmann-sensorik.de","phone":"+49 7121 99201","title":"VP Quality & Functional Safety"}]'::jsonb, '[{"name":"IATF 16949:2016","category":"Automotive QMS","status":"Valid","expiryDate":"2027-05-18","certNumber":"IATF-0601928"},{"name":"ISO 26262 ASIL-D","category":"Functional Safety","status":"Valid","expiryDate":"2027-05-18","certNumber":"ASIL-99182"},{"name":"TISAX Level 3","category":"Information Security","status":"Valid","expiryDate":"2026-10-15","certNumber":"TSX-88291"}]'::jsonb, 'Top tier ADAS radar & camera sensor supplier. Full ISO 26262 compliance.')
on conflict (id) do nothing;

-- 5 corrective action requests ---------------------------------------
insert into public.cars
  (ref, "supplierId", "supplierName", issue, "raisedDate", "dueDate", severity, status,
   "assignedSqe", "rootCause", "containmentAction")
values
  ('CAR-892', 'SUP-10294', 'Apex Die Casting GmbH', 'Minor non-conformance in packaging spec for batch #D-4019 (corrosion inhibitor sheet misplaced)', '2026-08-10', '2026-09-10', 'Minor', '8D Submitted',
   'J. Doe (SQE)', 'Operator packaging instruction sheet revised without laminated line copy.', '100% sort of incoming pallets; new optical verification added at packing station.'),
  ('CAR-889', 'SUP-08472', 'Global Wire Harness Ltd.', 'Terminal insertion depth mismatch on CAN bus 12-pin connector causing intermittent signal drop', '2026-08-02', '2026-08-25', 'Critical', 'Under Investigation',
   'Anna Smith (SQE)', 'Pneumatic press pressure fluctuation between shift changes.', 'Quarantined 4,200 wire harness sub-assemblies; secondary continuity pull test instituted.'),
  ('CAR-875', 'SUP-09123', 'NeoPlast Polymers Inc.', 'Sink marks and dimensional tolerance failure (+0.8mm over spec) on driver door upper trim', '2026-07-15', '2026-08-15', 'Critical', 'Open',
   'Anna Smith (SQE)', 'Melt temperature cycling variation and worn cooling channel in Mold #4.', 'Production stopped on Mold #4; diverted to backup tool.'),
  ('CAR-860', 'SUP-10332', 'Precision Castings Inc.', 'Surface porosity exceeding Level 2 specification on mounting lugs for sensor housing', '2026-06-28', '2026-07-28', 'Major', 'Verified Closed',
   'J. Doe (SQE)', 'Degassing cycle time reduced by 15% during high ambient humidity shift.', 'Automated vacuum degassing timer locked with supervisor key.'),
  ('CAR-852', 'SUP-10488', 'AutoPlast Solutions', 'Gate vestige protrusion exceeding 0.3mm on center console side bracket', '2026-05-14', '2026-06-14', 'Minor', 'Verified Closed',
   'J. Doe (SQE)', 'Robotic degating cutter blade wear.', 'Blade replacement interval reduced from 5,000 to 2,500 shots.')
on conflict (ref) do nothing;

-- 6 audits ----------------------------------------------------------
insert into public.audits
  (id, "supplierId", "supplierName", "auditType", "lastDate", "nextDate", result,
   "scorePercent", status, "leadAuditor", "findingsCount")
values
  ('AUD-2026-01', 'SUP-10294', 'Apex Die Casting GmbH', 'VDA 6.3 Process', '2025-10-12', '2026-10-12', 'Grade A (94%)',
   94, 'Scheduled', 'J. Doe', 1),
  ('AUD-2026-02', 'SUP-08472', 'Global Wire Harness Ltd.', 'CoP Verification', '2025-09-20', '2026-09-05', 'Conditional (78%)',
   78, 'Scheduled', 'Anna Smith', 4),
  ('AUD-2026-03', 'SUP-09123', 'NeoPlast Polymers Inc.', 'IATF 16949 QMS', '2026-01-10', '2026-08-30', 'Failed (62%)',
   62, 'Overdue', 'Anna Smith', 8),
  ('AUD-2026-04', 'SUP-11002', 'Stuttgart Bearings Co.', 'VDA 6.3 Process', '2025-11-04', '2026-11-04', 'Grade A (98%)',
   98, 'Completed', 'Dr. Marcus Vance', 0),
  ('AUD-2026-05', 'SUP-10488', 'AutoPlast Solutions', 'MMOG/LE Logistics', '2025-12-18', '2026-12-18', 'Level A (91%)',
   91, 'Scheduled', 'Rachel Chen', 2),
  ('AUD-2026-06', 'SUP-10991', 'Boschmann Sensorik SE', 'CoP Verification', '2026-03-15', '2027-03-15', 'Grade A (99%)',
   99, 'Completed', 'J. Doe', 0)
on conflict (id) do nothing;

-- 6 directory users -------------------------------------------------
insert into public.users
  (id, name, email, role, department, status, avatar, "lastActive")
values
  ('USR-001', 'Sarah Connor', 'sarah.connor@automotive-tier1.com', 'Admin', 'Global Purchasing & Systems', 'Active', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80', 'Just now'),
  ('USR-002', 'Rachel Chen', 'r.chen@automotive-tier1.com', 'Purchasing Manager', 'Procurement & Commercial', 'Active', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80', '12 mins ago'),
  ('USR-003', 'J. Doe (SQE)', 'j.doe@automotive-tier1.com', 'Supplier Quality Engineer', 'Supplier Quality Engineering', 'Active', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', '5 mins ago'),
  ('USR-004', 'Anna Smith', 'a.smith@automotive-tier1.com', 'Supplier Quality Engineer', 'Quality Assurance & APQP', 'Active', 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80', '1 hour ago'),
  ('USR-005', 'Michael Johnson', 'm.johnson@automotive-tier1.com', 'Executive Viewer', 'Executive Operations & VP Office', 'Active', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', 'Yesterday'),
  ('USR-006', 'Elena Rostova', 'e.rostova@automotive-tier1.com', 'Purchasing Manager', 'Raw Materials & Fasteners', 'Inactive', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80', '3 weeks ago')
on conflict (email) do nothing;
