export type Role = 'Admin' | 'Purchasing Manager' | 'Supplier Quality Engineer' | 'Executive Viewer';

export type ScreenId = 'dashboard' | 'approval' | 'performance' | 'master-data' | 'standards' | 'users';

export type ApprovalStatus = 'Approved' | 'Pending' | 'Rejected' | 'Under Review';

export type RiskCategory = 'Low' | 'Medium' | 'High' | 'Critical';

export type CarSeverity = 'Critical' | 'Major' | 'Minor';

export type CarStatus = 'Open' | 'Under Investigation' | '8D Submitted' | 'Verified Closed';

export type AuditType = 'VDA 6.3 Process' | 'IATF 16949 QMS' | 'CoP Verification' | 'PPAP On-site' | 'MMOG/LE Logistics';

export interface Accreditation {
  name: string;
  category: string;
  status: 'Valid' | 'Expiring 30D' | 'Expired' | 'Pending';
  expiryDate: string;
  certNumber: string;
}

export interface SupplierContact {
  name: string;
  email: string;
  phone: string;
  title: string;
}

export interface Supplier {
  id: string; // e.g. SUP-10294
  name: string;
  commodity: string;
  location: string;
  region: 'EU' | 'NA' | 'APAC' | 'Global';
  riskCategory: RiskCategory;
  iatfCertExpiry: string;
  iatfStatus: 'Valid' | 'Expiring Soon' | 'Expired' | 'Pending';
  assessmentStatus: string; // e.g. 'Audit Passed (94%)'
  assessmentScore: number;
  sqaSigned: boolean;
  sqaDate?: string;
  approvalStatus: ApprovalStatus;
  ppm: number;
  otd: number; // percentage, e.g. 99.2
  auditScore: number; // 0 - 100
  scarClosure: number; // percentage, e.g. 100
  compositeScore: number; // 0.0 - 5.0
  tier: string; // e.g. 'Tier 1 - Preferred'
  duns: string;
  contacts: SupplierContact[];
  accreditations: Accreditation[];
  notes?: string;
}

export interface CAR {
  ref: string; // e.g. CAR-892
  supplierId: string;
  supplierName: string;
  issue: string;
  raisedDate: string;
  dueDate: string;
  severity: CarSeverity;
  status: CarStatus;
  assignedSqe: string;
  rootCause?: string;
  containmentAction?: string;
}

export interface Audit {
  id: string;
  supplierId: string;
  supplierName: string;
  auditType: AuditType;
  lastDate: string;
  nextDate: string;
  result: string; // e.g. 'Grade A (95%)'
  scorePercent: number;
  status: 'Completed' | 'Scheduled' | 'Overdue';
  leadAuditor: string;
  findingsCount: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  department: string;
  status: 'Active' | 'Inactive';
  avatar?: string;
  lastActive: string;
}

export interface ActivityItem {
  id: string;
  timestamp: string;
  type: 'audit' | 'car' | 'approval' | 'user' | 'supplier';
  title: string;
  description: string;
  badge: string;
  badgeType: 'success' | 'warning' | 'error' | 'info';
  linkScreen?: ScreenId;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'warning' | 'info' | 'success' | 'alert';
  read: boolean;
  linkScreen?: ScreenId;
}
