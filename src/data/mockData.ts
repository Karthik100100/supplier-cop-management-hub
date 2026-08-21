import { Supplier, CAR, Audit, User, ActivityItem, NotificationItem } from '../types';

/**
 * Composite score formula: weighted average of PPM (30%), OTD (25%), Audit Score (25%), SCAR Closure (20%), normalized to a 0-5 scale.
 * Normalization logic:
 * - PPM (30%): 0-25 PPM = 5.0, 50 PPM = 4.0, 100 PPM = 2.5, 150+ PPM = 0-1
 * - OTD (25%): (otd / 100) * 5
 * - Audit Score (25%): (auditScore / 100) * 5
 * - SCAR Closure (20%): (scarClosure / 100) * 5
 */
export function calculateCompositeScore(ppm: number, otd: number, auditScore: number, scarClosure: number): number {
  const ppmScore = Math.max(0, Math.min(5, 5 - (ppm / 30)));
  const otdScore = Math.max(0, Math.min(5, (otd / 100) * 5));
  const auditScoreNorm = Math.max(0, Math.min(5, (auditScore / 100) * 5));
  const scarClosureNorm = Math.max(0, Math.min(5, (scarClosure / 100) * 5));

  const composite = (0.30 * ppmScore) + (0.25 * otdScore) + (0.25 * auditScoreNorm) + (0.20 * scarClosureNorm);
  return Number(composite.toFixed(2));
}

/**
 * Tier auto-assigns based on composite score:
 * ≥ 4.0: Preferred (Tier 1)
 * 3.0 - 3.9: Approved (Tier 1)
 * 2.0 - 2.9: Conditional (Tier 2)
 * 1.0 - 1.9: Development Required (Tier 3)
 * < 1.0: Immediate Action (At Risk)
 */
export function deriveTier(compositeScore: number): string {
  if (compositeScore >= 4.0) return 'Tier 1 - Preferred';
  if (compositeScore >= 3.0) return 'Tier 1 - Approved';
  if (compositeScore >= 2.0) return 'Tier 2 - Conditional';
  if (compositeScore >= 1.0) return 'Tier 3 - Development Required';
  return 'Immediate Action';
}

export const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: 'SUP-10294',
    name: 'Apex Die Casting GmbH',
    commodity: 'Powertrain Components',
    location: 'Stuttgart, Germany',
    region: 'EU',
    riskCategory: 'Low',
    iatfCertExpiry: '2026-11-15',
    iatfStatus: 'Valid',
    assessmentStatus: 'Audit Passed (94%)',
    assessmentScore: 94,
    sqaSigned: true,
    sqaDate: '2023-10-12',
    approvalStatus: 'Approved',
    ppm: 12.4,
    otd: 99.2,
    auditScore: 95,
    scarClosure: 100,
    compositeScore: 4.82,
    tier: 'Tier 1 - Preferred',
    duns: '31-482-9012',
    contacts: [
      { name: 'Dr. Klaus Weber', email: 'k.weber@apex-diecasting.de', phone: '+49 711 889210', title: 'Director of Quality' },
      { name: 'Helga Schmidt', email: 'h.schmidt@apex-diecasting.de', phone: '+49 711 889211', title: 'Key Account Executive' }
    ],
    accreditations: [
      { name: 'IATF 16949:2016', category: 'Automotive QMS', status: 'Valid', expiryDate: '2026-11-15', certNumber: 'IATF-0482910' },
      { name: 'ISO 9001:2015', category: 'Quality Management', status: 'Valid', expiryDate: '2026-11-15', certNumber: 'ISO-994821' },
      { name: 'ISO 14001:2015', category: 'Environmental', status: 'Valid', expiryDate: '2025-08-20', certNumber: 'ENV-18290' },
      { name: 'TISAX Level 3', category: 'Information Security', status: 'Valid', expiryDate: '2026-03-30', certNumber: 'TSX-29102' }
    ],
    notes: 'Primary aluminum casting source for EV drivetrain housings. High capability Cpk > 1.67.'
  },
  {
    id: 'SUP-08472',
    name: 'Global Wire Harness Ltd.',
    commodity: 'Electrical Systems',
    location: 'Guadalajara, Mexico',
    region: 'NA',
    riskCategory: 'Medium',
    iatfCertExpiry: '2025-04-10',
    iatfStatus: 'Expiring Soon',
    assessmentStatus: 'In Progress',
    assessmentScore: 78,
    sqaSigned: false,
    approvalStatus: 'Pending',
    ppm: 145.0,
    otd: 94.5,
    auditScore: 78,
    scarClosure: 45,
    compositeScore: 2.35,
    tier: 'Tier 2 - Conditional',
    duns: '83-291-0492',
    contacts: [
      { name: 'Carlos Mendez', email: 'c.mendez@globalwire.mx', phone: '+52 33 4910 2849', title: 'VP Quality & Operations' },
      { name: 'Sofia Ramos', email: 's.ramos@globalwire.mx', phone: '+52 33 4910 2850', title: 'Program Manager' }
    ],
    accreditations: [
      { name: 'IATF 16949:2016', category: 'Automotive QMS', status: 'Expiring 30D', expiryDate: '2025-04-10', certNumber: 'IATF-0391822' },
      { name: 'ISO 9001:2015', category: 'Quality Management', status: 'Valid', expiryDate: '2026-01-14', certNumber: 'ISO-882910' },
      { name: 'ISO 45001:2018', category: 'Occupational Health', status: 'Valid', expiryDate: '2025-09-12', certNumber: 'OHS-48192' }
    ],
    notes: 'Experiencing minor crimping tool calibration drift. Corrective actions underway for terminal seating.'
  },
  {
    id: 'SUP-09123',
    name: 'NeoPlast Polymers Inc.',
    commodity: 'Interior Plastics',
    location: 'Detroit, MI, USA',
    region: 'NA',
    riskCategory: 'High',
    iatfCertExpiry: '2024-12-01',
    iatfStatus: 'Expired',
    assessmentStatus: 'Audit Failed (62%)',
    assessmentScore: 62,
    sqaSigned: false,
    approvalStatus: 'Rejected',
    ppm: 188.0,
    otd: 89.0,
    auditScore: 62,
    scarClosure: 30,
    compositeScore: 1.34,
    tier: 'Tier 3 - Development Required',
    duns: '19-382-7491',
    contacts: [
      { name: 'David Miller', email: 'dmiller@neoplast.com', phone: '+1 313 555 0192', title: 'Quality Assurance Director' }
    ],
    accreditations: [
      { name: 'IATF 16949:2016', category: 'Automotive QMS', status: 'Expired', expiryDate: '2024-12-01', certNumber: 'IATF-0182741' },
      { name: 'ISO 9001:2015', category: 'Quality Management', status: 'Pending', expiryDate: '2025-02-15', certNumber: 'ISO-391820' }
    ],
    notes: 'Failed initial Tier-1 CoP audit due to lack of statistical process control on injection pressure.'
  },
  {
    id: 'SUP-11002',
    name: 'Stuttgart Bearings Co.',
    commodity: 'Chassis & Suspension',
    location: 'Munich, Germany',
    region: 'EU',
    riskCategory: 'Low',
    iatfCertExpiry: '2027-02-28',
    iatfStatus: 'Valid',
    assessmentStatus: 'Audit Passed (98%)',
    assessmentScore: 98,
    sqaSigned: true,
    sqaDate: '2022-04-01',
    approvalStatus: 'Approved',
    ppm: 8.5,
    otd: 99.8,
    auditScore: 98,
    scarClosure: 100,
    compositeScore: 4.93,
    tier: 'Tier 1 - Preferred',
    duns: '44-910-3849',
    contacts: [
      { name: 'Hans Gruber', email: 'h.gruber@stuttgart-bearings.de', phone: '+49 89 2049102', title: 'Chief Quality Officer' }
    ],
    accreditations: [
      { name: 'IATF 16949:2016', category: 'Automotive QMS', status: 'Valid', expiryDate: '2027-02-28', certNumber: 'IATF-0591023' },
      { name: 'ISO 14001:2015', category: 'Environmental', status: 'Valid', expiryDate: '2026-09-30', certNumber: 'ENV-39102' },
      { name: 'VDA 6.3 Grade A', category: 'Process Quality', status: 'Valid', expiryDate: '2026-05-15', certNumber: 'VDA-88301' }
    ],
    notes: 'Zero defects recorded over past 4 quarters. Benchmark supplier for Wheel Hub assemblies.'
  },
  {
    id: 'SUP-10488',
    name: 'AutoPlast Solutions',
    commodity: 'Injection Molding',
    location: 'Wroclaw, Poland',
    region: 'EU',
    riskCategory: 'Low',
    iatfCertExpiry: '2026-07-19',
    iatfStatus: 'Valid',
    assessmentStatus: 'Audit Passed (91%)',
    assessmentScore: 91,
    sqaSigned: true,
    sqaDate: '2023-01-15',
    approvalStatus: 'Approved',
    ppm: 30.0,
    otd: 98.1,
    auditScore: 91,
    scarClosure: 92,
    compositeScore: 4.35,
    tier: 'Tier 1 - Preferred',
    duns: '55-829-1048',
    contacts: [
      { name: 'Marek Wisniewski', email: 'm.wisniewski@autoplast.pl', phone: '+48 71 829 104', title: 'Head of Quality Engineering' }
    ],
    accreditations: [
      { name: 'IATF 16949:2016', category: 'Automotive QMS', status: 'Valid', expiryDate: '2026-07-19', certNumber: 'IATF-0492811' },
      { name: 'ISO 9001:2015', category: 'Quality Management', status: 'Valid', expiryDate: '2026-07-19', certNumber: 'ISO-772910' }
    ],
    notes: 'Specialized in instrument panel trim pieces. Highly responsive to engineering change notices.'
  },
  {
    id: 'SUP-10332',
    name: 'Precision Castings Inc.',
    commodity: 'Die Casting',
    location: 'Nagoya, Japan',
    region: 'APAC',
    riskCategory: 'Medium',
    iatfCertExpiry: '2025-10-30',
    iatfStatus: 'Valid',
    assessmentStatus: 'Under Review',
    assessmentScore: 88,
    sqaSigned: true,
    sqaDate: '2023-06-20',
    approvalStatus: 'Under Review',
    ppm: 45.2,
    otd: 97.8,
    auditScore: 88,
    scarClosure: 80,
    compositeScore: 3.99,
    tier: 'Tier 1 - Approved',
    duns: '62-109-4820',
    contacts: [
      { name: 'Kenji Sato', email: 'k-sato@precisioncast.co.jp', phone: '+81 52 910 4829', title: 'Plant Quality Manager' }
    ],
    accreditations: [
      { name: 'IATF 16949:2016', category: 'Automotive QMS', status: 'Valid', expiryDate: '2025-10-30', certNumber: 'IATF-0481920' },
      { name: 'ISO 9001:2015', category: 'Quality Management', status: 'Valid', expiryDate: '2026-04-12', certNumber: 'ISO-662910' },
      { name: 'TISAX Level 3', category: 'Data Security', status: 'Expiring 30D', expiryDate: '2025-05-15', certNumber: 'TSX-10294' }
    ],
    notes: 'High precision die casting for sensor brackets. Under review for Q1 certification endorsement.'
  },
  {
    id: 'SUP-07821',
    name: 'MagnaTech Powertrain',
    commodity: 'Transmission & Gears',
    location: 'Toronto, Canada',
    region: 'NA',
    riskCategory: 'Low',
    iatfCertExpiry: '2026-12-05',
    iatfStatus: 'Valid',
    assessmentStatus: 'Audit Passed (96%)',
    assessmentScore: 96,
    sqaSigned: true,
    sqaDate: '2021-08-11',
    approvalStatus: 'Approved',
    ppm: 15.0,
    otd: 99.4,
    auditScore: 96,
    scarClosure: 95,
    compositeScore: 4.75,
    tier: 'Tier 1 - Preferred',
    duns: '22-839-4019',
    contacts: [
      { name: 'Sarah Jenkins', email: 's.jenkins@magnatech.ca', phone: '+1 416 555 3918', title: 'Global Quality Director' }
    ],
    accreditations: [
      { name: 'IATF 16949:2016', category: 'Automotive QMS', status: 'Valid', expiryDate: '2026-12-05', certNumber: 'IATF-0519283' },
      { name: 'ISO 14001:2015', category: 'Environmental', status: 'Valid', expiryDate: '2026-06-20', certNumber: 'ENV-92810' }
    ],
    notes: 'Strategic supplier for multi-speed transmission gearing. Excellent PPAP First-Time-Through.'
  },
  {
    id: 'SUP-10991',
    name: 'Boschmann Sensorik SE',
    commodity: 'Sensors & ADAS',
    location: 'Reutlingen, Germany',
    region: 'EU',
    riskCategory: 'Low',
    iatfCertExpiry: '2027-05-18',
    iatfStatus: 'Valid',
    assessmentStatus: 'Audit Passed (99%)',
    assessmentScore: 99,
    sqaSigned: true,
    sqaDate: '2022-09-01',
    approvalStatus: 'Approved',
    ppm: 6.2,
    otd: 99.9,
    auditScore: 99,
    scarClosure: 100,
    compositeScore: 4.97,
    tier: 'Tier 1 - Preferred',
    duns: '33-291-8840',
    contacts: [
      { name: 'Dr. Stefan Braun', email: 's.braun@boschmann-sensorik.de', phone: '+49 7121 99201', title: 'VP Quality & Functional Safety' }
    ],
    accreditations: [
      { name: 'IATF 16949:2016', category: 'Automotive QMS', status: 'Valid', expiryDate: '2027-05-18', certNumber: 'IATF-0601928' },
      { name: 'ISO 26262 ASIL-D', category: 'Functional Safety', status: 'Valid', expiryDate: '2027-05-18', certNumber: 'ASIL-99182' },
      { name: 'TISAX Level 3', category: 'Information Security', status: 'Valid', expiryDate: '2026-10-15', certNumber: 'TSX-88291' }
    ],
    notes: 'Top tier ADAS radar & camera sensor supplier. Full ISO 26262 compliance.'
  }
];

export const INITIAL_CARS: CAR[] = [
  {
    ref: 'CAR-892',
    supplierId: 'SUP-10294',
    supplierName: 'Apex Die Casting GmbH',
    issue: 'Minor non-conformance in packaging spec for batch #D-4019 (corrosion inhibitor sheet misplaced)',
    raisedDate: '2026-08-10',
    dueDate: '2026-09-10',
    severity: 'Minor',
    status: '8D Submitted',
    assignedSqe: 'J. Doe (SQE)',
    rootCause: 'Operator packaging instruction sheet revised without laminated line copy.',
    containmentAction: '100% sort of incoming pallets; new optical verification added at packing station.'
  },
  {
    ref: 'CAR-889',
    supplierId: 'SUP-08472',
    supplierName: 'Global Wire Harness Ltd.',
    issue: 'Terminal insertion depth mismatch on CAN bus 12-pin connector causing intermittent signal drop',
    raisedDate: '2026-08-02',
    dueDate: '2026-08-25',
    severity: 'Critical',
    status: 'Under Investigation',
    assignedSqe: 'Anna Smith (SQE)',
    rootCause: 'Pneumatic press pressure fluctuation between shift changes.',
    containmentAction: 'Quarantined 4,200 wire harness sub-assemblies; secondary continuity pull test instituted.'
  },
  {
    ref: 'CAR-875',
    supplierId: 'SUP-09123',
    supplierName: 'NeoPlast Polymers Inc.',
    issue: 'Sink marks and dimensional tolerance failure (+0.8mm over spec) on driver door upper trim',
    raisedDate: '2026-07-15',
    dueDate: '2026-08-15',
    severity: 'Critical',
    status: 'Open',
    assignedSqe: 'Anna Smith (SQE)',
    rootCause: 'Melt temperature cycling variation and worn cooling channel in Mold #4.',
    containmentAction: 'Production stopped on Mold #4; diverted to backup tool.'
  },
  {
    ref: 'CAR-860',
    supplierId: 'SUP-10332',
    supplierName: 'Precision Castings Inc.',
    issue: 'Surface porosity exceeding Level 2 specification on mounting lugs for sensor housing',
    raisedDate: '2026-06-28',
    dueDate: '2026-07-28',
    severity: 'Major',
    status: 'Verified Closed',
    assignedSqe: 'J. Doe (SQE)',
    rootCause: 'Degassing cycle time reduced by 15% during high ambient humidity shift.',
    containmentAction: 'Automated vacuum degassing timer locked with supervisor key.'
  },
  {
    ref: 'CAR-852',
    supplierId: 'SUP-10488',
    supplierName: 'AutoPlast Solutions',
    issue: 'Gate vestige protrusion exceeding 0.3mm on center console side bracket',
    raisedDate: '2026-05-14',
    dueDate: '2026-06-14',
    severity: 'Minor',
    status: 'Verified Closed',
    assignedSqe: 'J. Doe (SQE)',
    rootCause: 'Robotic degating cutter blade wear.',
    containmentAction: 'Blade replacement interval reduced from 5,000 to 2,500 shots.'
  }
];

export const INITIAL_AUDITS: Audit[] = [
  {
    id: 'AUD-2026-01',
    supplierId: 'SUP-10294',
    supplierName: 'Apex Die Casting GmbH',
    auditType: 'VDA 6.3 Process',
    lastDate: '2025-10-12',
    nextDate: '2026-10-12',
    result: 'Grade A (94%)',
    scorePercent: 94,
    status: 'Scheduled',
    leadAuditor: 'J. Doe',
    findingsCount: 1
  },
  {
    id: 'AUD-2026-02',
    supplierId: 'SUP-08472',
    supplierName: 'Global Wire Harness Ltd.',
    auditType: 'CoP Verification',
    lastDate: '2025-09-20',
    nextDate: '2026-09-05',
    result: 'Conditional (78%)',
    scorePercent: 78,
    status: 'Scheduled',
    leadAuditor: 'Anna Smith',
    findingsCount: 4
  },
  {
    id: 'AUD-2026-03',
    supplierId: 'SUP-09123',
    supplierName: 'NeoPlast Polymers Inc.',
    auditType: 'IATF 16949 QMS',
    lastDate: '2026-01-10',
    nextDate: '2026-08-30',
    result: 'Failed (62%)',
    scorePercent: 62,
    status: 'Overdue',
    leadAuditor: 'Anna Smith',
    findingsCount: 8
  },
  {
    id: 'AUD-2026-04',
    supplierId: 'SUP-11002',
    supplierName: 'Stuttgart Bearings Co.',
    auditType: 'VDA 6.3 Process',
    lastDate: '2025-11-04',
    nextDate: '2026-11-04',
    result: 'Grade A (98%)',
    scorePercent: 98,
    status: 'Completed',
    leadAuditor: 'Dr. Marcus Vance',
    findingsCount: 0
  },
  {
    id: 'AUD-2026-05',
    supplierId: 'SUP-10488',
    supplierName: 'AutoPlast Solutions',
    auditType: 'MMOG/LE Logistics',
    lastDate: '2025-12-18',
    nextDate: '2026-12-18',
    result: 'Level A (91%)',
    scorePercent: 91,
    status: 'Scheduled',
    leadAuditor: 'Rachel Chen',
    findingsCount: 2
  },
  {
    id: 'AUD-2026-06',
    supplierId: 'SUP-10991',
    supplierName: 'Boschmann Sensorik SE',
    auditType: 'CoP Verification',
    lastDate: '2026-03-15',
    nextDate: '2027-03-15',
    result: 'Grade A (99%)',
    scorePercent: 99,
    status: 'Completed',
    leadAuditor: 'J. Doe',
    findingsCount: 0
  }
];

export const INITIAL_USERS: User[] = [
  {
    id: 'USR-001',
    name: 'Sarah Connor',
    email: 'sarah.connor@automotive-tier1.com',
    role: 'Admin',
    department: 'Global Purchasing & Systems',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    lastActive: 'Just now'
  },
  {
    id: 'USR-002',
    name: 'Rachel Chen',
    email: 'r.chen@automotive-tier1.com',
    role: 'Purchasing Manager',
    department: 'Procurement & Commercial',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    lastActive: '12 mins ago'
  },
  {
    id: 'USR-003',
    name: 'J. Doe (SQE)',
    email: 'j.doe@automotive-tier1.com',
    role: 'Supplier Quality Engineer',
    department: 'Supplier Quality Engineering',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    lastActive: '5 mins ago'
  },
  {
    id: 'USR-004',
    name: 'Anna Smith',
    email: 'a.smith@automotive-tier1.com',
    role: 'Supplier Quality Engineer',
    department: 'Quality Assurance & APQP',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80',
    lastActive: '1 hour ago'
  },
  {
    id: 'USR-005',
    name: 'Michael Johnson',
    email: 'm.johnson@automotive-tier1.com',
    role: 'Executive Viewer',
    department: 'Executive Operations & VP Office',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    lastActive: 'Yesterday'
  },
  {
    id: 'USR-006',
    name: 'Elena Rostova',
    email: 'e.rostova@automotive-tier1.com',
    role: 'Purchasing Manager',
    department: 'Raw Materials & Fasteners',
    status: 'Inactive',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    lastActive: '3 weeks ago'
  }
];

export const INITIAL_ACTIVITIES: ActivityItem[] = [
  {
    id: 'ACT-001',
    timestamp: '10 mins ago',
    type: 'car',
    title: 'CAR-892 Status Updated',
    description: 'Apex Die Casting submitted 8D report with optical verification containment.',
    badge: '8D Submitted',
    badgeType: 'info',
    linkScreen: 'performance'
  },
  {
    id: 'ACT-002',
    timestamp: '2 hours ago',
    type: 'audit',
    title: 'CoP Audit Scheduled',
    description: 'On-site audit confirmed for Global Wire Harness Ltd. on Sept 05, 2026.',
    badge: 'Scheduled',
    badgeType: 'warning',
    linkScreen: 'performance'
  },
  {
    id: 'ACT-003',
    timestamp: '5 hours ago',
    type: 'approval',
    title: 'Supplier Approved',
    description: 'Stuttgart Bearings Co. approved with Tier 1 - Preferred rating (4.93 / 5.0).',
    badge: 'Approved',
    badgeType: 'success',
    linkScreen: 'approval'
  },
  {
    id: 'ACT-004',
    timestamp: '1 day ago',
    type: 'supplier',
    title: 'New Master Record Created',
    description: 'Boschmann Sensorik SE master accreditation package fully verified.',
    badge: 'Master Data',
    badgeType: 'success',
    linkScreen: 'master-data'
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'NOTIF-1',
    title: 'TISAX Certification Expiring',
    message: 'Precision Castings Inc. TISAX Level 3 certification expires in 30 days.',
    timestamp: '15m ago',
    type: 'warning',
    read: false,
    linkScreen: 'master-data'
  },
  {
    id: 'NOTIF-2',
    title: 'High PPM Alert Triggered',
    message: 'Global Wire Harness Ltd. monthly PPM exceeded target: 145 PPM (Target: 50 PPM).',
    timestamp: '1h ago',
    type: 'alert',
    read: false,
    linkScreen: 'performance'
  },
  {
    id: 'NOTIF-3',
    title: 'New CAR Raised',
    message: 'CAR-889 raised for CAN Bus 12-pin connector depth variance.',
    timestamp: '3h ago',
    type: 'info',
    read: false,
    linkScreen: 'performance'
  }
];
