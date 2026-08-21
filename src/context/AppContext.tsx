import type { Session } from '@supabase/supabase-js';
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
  INITIAL_ACTIVITIES,
  INITIAL_NOTIFICATIONS,
  calculateCompositeScore,
  deriveTier,
} from '../data/mockData';
import { TABLES, describeError, isSupabaseConfigured, supabase } from '../lib/supabaseClient';
import {
  ActivityItem,
  ApprovalStatus,
  Audit,
  CAR,
  NotificationItem,
  RiskCategory,
  Role,
  ScreenId,
  Supplier,
  User,
} from '../types';

/**
 * All supplier / CAR / audit / user state now lives in Supabase Postgres.
 *
 * Activity feed and notifications remain client-side ephemeral UI state — they
 * are derived reactions to mutations rather than persisted records, so they are
 * seeded from mockData and rebuilt each session.
 *
 * Every mutator below keeps its original signature so no screen or modal
 * component needed changing.
 */

const SUPPLIER_COLUMNS =
  'id, name, commodity, location, region, "riskCategory", "iatfCertExpiry", "iatfStatus", "assessmentStatus", "assessmentScore", "sqaSigned", "sqaDate", "approvalStatus", ppm, otd, "auditScore", "scarClosure", "compositeScore", tier, duns, contacts, accreditations, notes';

const ROLE_VALUES: Role[] = ['Admin', 'Purchasing Manager', 'Supplier Quality Engineer', 'Executive Viewer'];

interface AppContextType {
  currentRole: Role | null;
  setCurrentRole: (role: Role | null) => void;
  activeScreen: ScreenId;
  setActiveScreen: (screen: ScreenId) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  performanceTab: 'scorecard' | 'audit' | 'car';
  setPerformanceTab: (tab: 'scorecard' | 'audit' | 'car') => void;

  // Data State
  suppliers: Supplier[];
  cars: CAR[];
  audits: Audit[];
  users: User[];
  activities: ActivityItem[];
  notifications: NotificationItem[];

  // Selected Slide-Over supplier
  selectedSupplier: Supplier | null;
  setSelectedSupplier: (supplier: Supplier | null) => void;

  // Modals state
  isAddSupplierModalOpen: boolean;
  setIsAddSupplierModalOpen: (open: boolean) => void;
  editingSupplier: Supplier | null;
  setEditingSupplier: (supplier: Supplier | null) => void;
  isRaiseCarModalOpen: boolean;
  setIsRaiseCarModalOpen: (open: boolean) => void;
  preselectedCarSupplierId: string | null;
  setPreselectedCarSupplierId: (id: string | null) => void;
  isInviteUserModalOpen: boolean;
  setIsInviteUserModalOpen: (open: boolean) => void;
  selectedStandardsDoc: string | null;
  setSelectedStandardsDoc: (docKey: string | null) => void;

  // Search & Notifications
  globalSearch: string;
  setGlobalSearch: (q: string) => void;
  dismissNotification: (id: string) => void;
  markAllNotificationsRead: () => void;

  // Mutators
  addSupplier: (supplierData: {
    name: string;
    commodity: string;
    location: string;
    region: 'EU' | 'NA' | 'APAC' | 'Global';
    riskCategory: RiskCategory;
    iatfCertExpiry: string;
    assessmentStatus: string;
    assessmentScore: number;
    sqaSigned: boolean;
    approvalStatus: ApprovalStatus;
    ppm: number;
    otd: number;
    auditScore: number;
    scarClosure: number;
    duns?: string;
    notes?: string;
  }) => void;
  updateSupplier: (id: string, updates: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;

  addCAR: (carData: Omit<CAR, 'ref'>) => void;
  updateCARStatus: (ref: string, status: CAR['status']) => void;

  addAudit: (auditData: Omit<Audit, 'id'>) => void;

  updateUserRole: (userId: string, newRole: Role) => void;
  toggleUserStatus: (userId: string) => void;
  inviteUser: (userData: { name: string; email: string; role: Role; department: string }) => void;

  // RBAC Helpers
  canAccessScreen: (screen: ScreenId) => boolean;
  canEdit: (scope: 'suppliers' | 'performance' | 'users') => boolean;

  // Export utility
  exportDataToCSV: (filename: string, rows: Record<string, any>[]) => void;

  // --- Supabase-backed session & status (additive) ---
  session: Session | null;
  authRole: Role | null;
  currentUserName: string | null;
  currentUserEmail: string | null;
  isBootstrapping: boolean;
  isSyncing: boolean;
  dataError: string | null;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (
    email: string,
    password: string,
    meta: { name: string; role: Role; department?: string }
  ) => Promise<{ error: string | null; needsConfirmation: boolean }>;
  signOut: () => Promise<void>;
  refreshAll: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

/** Postgres `numeric` arrives as a JS number via PostgREST, but be defensive. */
const num = (v: unknown, fallback = 0): number => {
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : fallback;
};

const rowToSupplier = (row: any): Supplier => ({
  id: row.id,
  name: row.name,
  commodity: row.commodity,
  location: row.location,
  region: row.region,
  riskCategory: row.riskCategory,
  iatfCertExpiry: row.iatfCertExpiry,
  iatfStatus: row.iatfStatus,
  assessmentStatus: row.assessmentStatus,
  assessmentScore: num(row.assessmentScore),
  sqaSigned: Boolean(row.sqaSigned),
  sqaDate: row.sqaDate ?? undefined,
  approvalStatus: row.approvalStatus,
  ppm: num(row.ppm),
  otd: num(row.otd),
  auditScore: num(row.auditScore),
  scarClosure: num(row.scarClosure),
  compositeScore: num(row.compositeScore),
  tier: row.tier,
  duns: row.duns,
  contacts: Array.isArray(row.contacts) ? row.contacts : [],
  accreditations: Array.isArray(row.accreditations) ? row.accreditations : [],
  notes: row.notes ?? undefined,
});

const rowToCar = (row: any): CAR => ({
  ref: row.ref,
  supplierId: row.supplierId,
  supplierName: row.supplierName,
  issue: row.issue,
  raisedDate: row.raisedDate,
  dueDate: row.dueDate,
  severity: row.severity,
  status: row.status,
  assignedSqe: row.assignedSqe,
  rootCause: row.rootCause ?? undefined,
  containmentAction: row.containmentAction ?? undefined,
});

const rowToAudit = (row: any): Audit => ({
  id: row.id,
  supplierId: row.supplierId,
  supplierName: row.supplierName,
  auditType: row.auditType,
  lastDate: row.lastDate,
  nextDate: row.nextDate,
  result: row.result,
  scorePercent: num(row.scorePercent),
  status: row.status,
  leadAuditor: row.leadAuditor,
  findingsCount: num(row.findingsCount),
});

const rowToUser = (row: any): User => ({
  id: row.id,
  name: row.name,
  email: row.email,
  role: row.role,
  department: row.department,
  status: row.status,
  avatar: row.avatar ?? undefined,
  lastActive: row.lastActive,
});

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // --- Auth / session ---
  const [session, setSession] = useState<Session | null>(null);
  const [authRole, setAuthRole] = useState<Role | null>(null);
  const [currentUserName, setCurrentUserName] = useState<string | null>(null);
  const [roleOverride, setRoleOverride] = useState<Role | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);

  // The effective role drives navigation/RBAC in the UI. Admins can preview
  // other roles from the top bar; the database still enforces the real one.
  const currentRole: Role | null = roleOverride ?? authRole;

  const [activeScreen, setActiveScreen] = useState<ScreenId>('dashboard');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [performanceTab, setPerformanceTab] = useState<'scorecard' | 'audit' | 'car'>('scorecard');

  // Entities — now hydrated from Supabase
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [cars, setCars] = useState<CAR[]>([]);
  const [audits, setAudits] = useState<Audit[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>(INITIAL_ACTIVITIES);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  // Modals
  const [isAddSupplierModalOpen, setIsAddSupplierModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [isRaiseCarModalOpen, setIsRaiseCarModalOpen] = useState(false);
  const [preselectedCarSupplierId, setPreselectedCarSupplierId] = useState<string | null>(null);
  const [isInviteUserModalOpen, setIsInviteUserModalOpen] = useState(false);
  const [selectedStandardsDoc, setSelectedStandardsDoc] = useState<string | null>(null);

  const [globalSearch, setGlobalSearch] = useState('');

  // Latest suppliers snapshot for mutators that need to read-then-write without
  // adding suppliers to their dependency arrays.
  const suppliersRef = useRef<Supplier[]>([]);
  useEffect(() => {
    suppliersRef.current = suppliers;
  }, [suppliers]);

  const carsRef = useRef<CAR[]>([]);
  useEffect(() => {
    carsRef.current = cars;
  }, [cars]);

  // Dark mode class on <html>
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(prev => !prev);

  const pushActivity = (activity: ActivityItem) => setActivities(prev => [activity, ...prev]);
  const pushNotification = (notif: NotificationItem) => setNotifications(prev => [notif, ...prev]);

  // =========================================================================
  // Reads
  // =========================================================================
  const refreshAll = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setDataError('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
      return;
    }
    setIsSyncing(true);
    try {
      const [supRes, carRes, audRes, usrRes] = await Promise.all([
        supabase.from(TABLES.suppliers).select(SUPPLIER_COLUMNS).order('id', { ascending: true }),
        supabase.from(TABLES.cars).select('*').order('raisedDate', { ascending: false }),
        supabase.from(TABLES.audits).select('*').order('nextDate', { ascending: true }),
        supabase.from(TABLES.users).select('*').order('id', { ascending: true }),
      ]);

      const firstError = supRes.error || carRes.error || audRes.error || usrRes.error;
      if (firstError) {
        setDataError(describeError(firstError, 'Could not load data from Supabase.'));
        return;
      }

      setSuppliers((supRes.data ?? []).map(rowToSupplier));
      setCars((carRes.data ?? []).map(rowToCar));
      setAudits((audRes.data ?? []).map(rowToAudit));
      setUsers((usrRes.data ?? []).map(rowToUser));
      setDataError(null);
    } catch (err) {
      setDataError(describeError(err, 'Could not reach Supabase.'));
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const loadProfile = useCallback(async (userId: string, fallbackEmail?: string | null) => {
    const { data, error } = await supabase
      .from(TABLES.profiles)
      .select('id, email, name, role, department')
      .eq('id', userId)
      .maybeSingle();

    if (error || !data) {
      setAuthRole('Executive Viewer');
      setCurrentUserName(fallbackEmail?.split('@')[0] ?? 'User');
      return;
    }
    setAuthRole(ROLE_VALUES.includes(data.role) ? (data.role as Role) : 'Executive Viewer');
    setCurrentUserName(data.name ?? fallbackEmail?.split('@')[0] ?? 'User');
  }, []);

  // Bootstrap: restore any persisted session, then subscribe to auth changes.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { data } = await supabase.auth.getSession();
      if (cancelled) return;
      setSession(data.session ?? null);
      if (data.session?.user) {
        await loadProfile(data.session.user.id, data.session.user.email);
        await refreshAll();
      }
      setIsBootstrapping(false);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      setSession(nextSession ?? null);
      if (nextSession?.user) {
        await loadProfile(nextSession.user.id, nextSession.user.email);
        await refreshAll();
      } else {
        setAuthRole(null);
        setRoleOverride(null);
        setCurrentUserName(null);
        setSuppliers([]);
        setCars([]);
        setAudits([]);
        setUsers([]);
      }
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [loadProfile, refreshAll]);

  // =========================================================================
  // Auth actions
  // =========================================================================
  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) return { error: error.message };
    setActiveScreen('dashboard');
    return { error: null };
  }, []);

  const signUp = useCallback(
    async (email: string, password: string, meta: { name: string; role: Role; department?: string }) => {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            name: meta.name,
            role: meta.role,
            department: meta.department ?? 'Supply Chain Operations',
          },
        },
      });
      if (error) return { error: error.message, needsConfirmation: false };
      return { error: null, needsConfirmation: !data.session };
    },
    []
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setRoleOverride(null);
    setActiveScreen('dashboard');
  }, []);

  /**
   * Preserved signature. `null` ends the session (used by the sidebar / top bar
   * sign-out buttons); a role value previews that role's navigation.
   */
  const setCurrentRole = useCallback(
    (role: Role | null) => {
      if (role === null) {
        void signOut();
        return;
      }
      setRoleOverride(role === authRole ? null : role);
    },
    [authRole, signOut]
  );

  // =========================================================================
  // RBAC helpers (unchanged behaviour)
  // =========================================================================
  const canAccessScreen = (screen: ScreenId): boolean => {
    if (!currentRole) return false;
    switch (currentRole) {
      case 'Admin':
        return true;
      case 'Purchasing Manager':
        return ['dashboard', 'approval', 'master-data'].includes(screen);
      case 'Supplier Quality Engineer':
        return ['dashboard', 'performance', 'standards'].includes(screen);
      case 'Executive Viewer':
        return ['dashboard', 'standards'].includes(screen);
      default:
        return false;
    }
  };

  const canEdit = (scope: 'suppliers' | 'performance' | 'users'): boolean => {
    if (!currentRole) return false;
    if (currentRole === 'Executive Viewer') return false;
    if (currentRole === 'Admin') return true;
    if (currentRole === 'Purchasing Manager' && scope === 'suppliers') return true;
    if (currentRole === 'Supplier Quality Engineer' && scope === 'performance') return true;
    return false;
  };

  // =========================================================================
  // Supplier mutators
  // =========================================================================
  const addSupplier: AppContextType['addSupplier'] = async data => {
    const nextId = `SUP-${Math.floor(10000 + Math.random() * 90000)}`;
    const iatfCertExpiry = data.iatfCertExpiry || '2026-12-31';

    const payload = {
      id: nextId,
      name: data.name,
      commodity: data.commodity,
      location: data.location || 'Global Facility',
      region: data.region || 'EU',
      riskCategory: data.riskCategory,
      iatfCertExpiry,
      iatfStatus: 'Valid',
      assessmentStatus: data.assessmentStatus || `Audit Passed (${data.assessmentScore || 90}%)`,
      assessmentScore: data.assessmentScore || 90,
      sqaSigned: data.sqaSigned,
      sqaDate: data.sqaSigned ? new Date().toISOString().split('T')[0] : null,
      approvalStatus: data.approvalStatus,
      ppm: data.ppm,
      otd: data.otd,
      auditScore: data.auditScore,
      scarClosure: data.scarClosure,
      duns:
        data.duns ||
        `${Math.floor(10 + Math.random() * 89)}-${Math.floor(100 + Math.random() * 899)}-${Math.floor(
          1000 + Math.random() * 8999
        )}`,
      contacts: [
        {
          name: 'Lead Contact',
          email: `info@${data.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
          phone: '+1 800 555 0100',
          title: 'Quality Lead',
        },
      ],
      accreditations: [
        {
          name: 'IATF 16949:2016',
          category: 'Automotive QMS',
          status: 'Valid',
          expiryDate: iatfCertExpiry,
          certNumber: `IATF-${Math.floor(1000000 + Math.random() * 9000000)}`,
        },
        {
          name: 'ISO 9001:2015',
          category: 'Quality Management',
          status: 'Valid',
          expiryDate: '2027-01-15',
          certNumber: `ISO-${Math.floor(100000 + Math.random() * 900000)}`,
        },
      ],
      notes: data.notes || 'Newly onboarded supplier for automotive supply chain.',
    };

    const { data: inserted, error } = await supabase
      .from(TABLES.suppliers)
      .insert(payload)
      .select(SUPPLIER_COLUMNS)
      .single();

    if (error || !inserted) {
      setDataError(describeError(error, 'Could not create the supplier.'));
      return;
    }

    // compositeScore / tier are returned already derived by the DB trigger.
    const newSupplier = rowToSupplier(inserted);
    setSuppliers(prev => [newSupplier, ...prev]);

    pushActivity({
      id: `ACT-${Date.now()}`,
      timestamp: 'Just now',
      type: 'supplier',
      title: 'Supplier Added / Amended',
      description: `${newSupplier.name} (${newSupplier.id}) registered with ${newSupplier.approvalStatus} status.`,
      badge: newSupplier.approvalStatus,
      badgeType:
        newSupplier.approvalStatus === 'Approved'
          ? 'success'
          : newSupplier.approvalStatus === 'Pending'
            ? 'warning'
            : 'info',
      linkScreen: 'approval',
    });
  };

  const updateSupplier: AppContextType['updateSupplier'] = async (id, updates) => {
    // Optimistic client-side derivation keeps the UI instant; the Postgres
    // trigger recomputes authoritatively and we reconcile with its response.
    setSuppliers(prev =>
      prev.map(s => {
        if (s.id !== id) return s;
        const merged = { ...s, ...updates };
        const compositeScore = calculateCompositeScore(
          merged.ppm,
          merged.otd,
          merged.auditScore,
          merged.scarClosure
        );
        return { ...merged, compositeScore, tier: deriveTier(compositeScore) };
      })
    );

    const { id: _ignored, compositeScore: _cs, tier: _tier, ...writable } = updates as Partial<Supplier>;
    const patch = Object.fromEntries(
      Object.entries(writable).map(([k, v]) => [k, v === undefined ? null : v])
    );
    if (Object.keys(patch).length === 0) return;

    const { data: updated, error } = await supabase
      .from(TABLES.suppliers)
      .update(patch)
      .eq('id', id)
      .select(SUPPLIER_COLUMNS)
      .maybeSingle();

    if (error) {
      setDataError(describeError(error, 'Could not update the supplier.'));
      await refreshAll();
      return;
    }

    if (updated) {
      const fresh = rowToSupplier(updated);
      setSuppliers(prev => prev.map(s => (s.id === id ? fresh : s)));
      setSelectedSupplier(prev => (prev && prev.id === id ? fresh : prev));
    }
  };

  /**
   * SQE-side rollups: suppliers are read-only for that role, so score changes
   * driven by CAR/audit outcomes go through the apply_supplier_metric RPC.
   */
  const applySupplierMetric = async (
    supplierId: string,
    metrics: { scarClosure?: number; auditScore?: number; assessmentStatus?: string }
  ) => {
    const { data, error } = await supabase.rpc('apply_supplier_metric', {
      p_supplier_id: supplierId,
      p_scar_closure: metrics.scarClosure ?? null,
      p_audit_score: metrics.auditScore ?? null,
      p_assessment_status: metrics.assessmentStatus ?? null,
    });
    if (error) {
      setDataError(describeError(error, 'Could not update the supplier scorecard.'));
      return;
    }
    const row = Array.isArray(data) ? data[0] : data;
    if (row) {
      const fresh = rowToSupplier(row);
      setSuppliers(prev => prev.map(s => (s.id === fresh.id ? fresh : s)));
      setSelectedSupplier(prev => (prev && prev.id === fresh.id ? fresh : prev));
    }
  };

  const deleteSupplier: AppContextType['deleteSupplier'] = async id => {
    const { error } = await supabase.from(TABLES.suppliers).delete().eq('id', id);
    if (error) {
      setDataError(describeError(error, 'Could not delete the supplier.'));
      return;
    }
    setSuppliers(prev => prev.filter(s => s.id !== id));
    // ON DELETE CASCADE removes dependent CARs and audits server-side.
    setCars(prev => prev.filter(c => c.supplierId !== id));
    setAudits(prev => prev.filter(a => a.supplierId !== id));
    setSelectedSupplier(prev => (prev && prev.id === id ? null : prev));
  };

  // =========================================================================
  // CAR mutators
  // =========================================================================
  const addCAR: AppContextType['addCAR'] = async carData => {
    const nextRef = `CAR-${Math.floor(900 + Math.random() * 100)}`;
    const { data: inserted, error } = await supabase
      .from(TABLES.cars)
      .insert({
        ref: nextRef,
        supplierId: carData.supplierId,
        supplierName: carData.supplierName,
        issue: carData.issue,
        raisedDate: carData.raisedDate,
        dueDate: carData.dueDate,
        severity: carData.severity,
        status: carData.status,
        assignedSqe: carData.assignedSqe,
        rootCause: carData.rootCause ?? null,
        containmentAction: carData.containmentAction ?? null,
      })
      .select('*')
      .single();

    if (error || !inserted) {
      setDataError(describeError(error, 'Could not raise the CAR.'));
      return;
    }

    const newCAR = rowToCar(inserted);
    setCars(prev => [newCAR, ...prev]);

    // An open CAR drags the supplier's SCAR closure percentage down.
    const supplier = suppliersRef.current.find(s => s.id === carData.supplierId);
    if (supplier) {
      await applySupplierMetric(supplier.id, { scarClosure: Math.max(20, supplier.scarClosure - 15) });
    }

    pushActivity({
      id: `ACT-${Date.now()}`,
      timestamp: 'Just now',
      type: 'car',
      title: `${newCAR.ref} Raised`,
      description: `Corrective Action logged for ${newCAR.supplierName}: ${newCAR.issue.slice(0, 60)}...`,
      badge: newCAR.severity,
      badgeType: newCAR.severity === 'Critical' ? 'error' : 'warning',
      linkScreen: 'performance',
    });

    pushNotification({
      id: `NOTIF-${Date.now()}`,
      title: `New CAR Raised (${newCAR.ref})`,
      message: `${newCAR.supplierName} - ${newCAR.severity} severity issue raised.`,
      timestamp: 'Just now',
      type: newCAR.severity === 'Critical' ? 'alert' : 'warning',
      read: false,
      linkScreen: 'performance',
    });
  };

  const updateCARStatus: AppContextType['updateCARStatus'] = async (ref, status) => {
    const { data: updated, error } = await supabase
      .from(TABLES.cars)
      .update({ status })
      .eq('ref', ref)
      .select('*')
      .maybeSingle();

    if (error) {
      setDataError(describeError(error, 'Could not update the CAR status.'));
      return;
    }
    if (!updated) {
      setDataError('Your role does not have permission to update corrective actions.');
      return;
    }

    setCars(prev => prev.map(c => (c.ref === ref ? rowToCar(updated) : c)));

    if (status === 'Verified Closed') {
      const targetCar = carsRef.current.find(c => c.ref === ref);
      const supplier = targetCar && suppliersRef.current.find(s => s.id === targetCar.supplierId);
      if (supplier) {
        await applySupplierMetric(supplier.id, { scarClosure: Math.min(100, supplier.scarClosure + 15) });
      }
    }
  };

  // =========================================================================
  // Audit mutators
  // =========================================================================
  const addAudit: AppContextType['addAudit'] = async auditData => {
    const nextId = `AUD-2026-${Math.floor(10 + Math.random() * 90)}`;
    const { data: inserted, error } = await supabase
      .from(TABLES.audits)
      .insert({
        id: nextId,
        supplierId: auditData.supplierId,
        supplierName: auditData.supplierName,
        auditType: auditData.auditType,
        lastDate: auditData.lastDate,
        nextDate: auditData.nextDate,
        result: auditData.result,
        scorePercent: auditData.scorePercent,
        status: auditData.status,
        leadAuditor: auditData.leadAuditor,
        findingsCount: auditData.findingsCount,
      })
      .select('*')
      .single();

    if (error || !inserted) {
      setDataError(describeError(error, 'Could not schedule the audit.'));
      return;
    }

    const newAudit = rowToAudit(inserted);
    setAudits(prev => [newAudit, ...prev]);

    if (auditData.scorePercent) {
      await applySupplierMetric(auditData.supplierId, {
        auditScore: auditData.scorePercent,
        assessmentStatus: `Audit ${auditData.scorePercent >= 85 ? 'Passed' : 'Conditional'} (${auditData.scorePercent}%)`,
      });
    }

    pushActivity({
      id: `ACT-${Date.now()}`,
      timestamp: 'Just now',
      type: 'audit',
      title: `Audit Scheduled (${newAudit.id})`,
      description: `${newAudit.auditType} for ${newAudit.supplierName} on ${newAudit.nextDate}.`,
      badge: 'Scheduled',
      badgeType: 'info',
      linkScreen: 'performance',
    });
  };

  // =========================================================================
  // User directory mutators (Admin-only at the RLS layer)
  // =========================================================================
  const updateUserRole: AppContextType['updateUserRole'] = async (userId, newRole) => {
    const { data: updated, error } = await supabase
      .from(TABLES.users)
      .update({ role: newRole })
      .eq('id', userId)
      .select('*, auth_user_id')
      .maybeSingle();

    if (error || !updated) {
      setDataError(describeError(error, 'Only an Admin can change user roles.'));
      return;
    }
    setUsers(prev => prev.map(u => (u.id === userId ? rowToUser(updated) : u)));

    // Keep the auth-side profile (which RLS reads) in step with the directory.
    if (updated.auth_user_id) {
      await supabase.from(TABLES.profiles).update({ role: newRole }).eq('id', updated.auth_user_id);
      if (session?.user?.id === updated.auth_user_id) setAuthRole(newRole);
    }
  };

  const toggleUserStatus: AppContextType['toggleUserStatus'] = async userId => {
    const target = users.find(u => u.id === userId);
    if (!target) return;
    const nextStatus = target.status === 'Active' ? 'Inactive' : 'Active';

    const { data: updated, error } = await supabase
      .from(TABLES.users)
      .update({ status: nextStatus })
      .eq('id', userId)
      .select('*')
      .maybeSingle();

    if (error || !updated) {
      setDataError(describeError(error, 'Only an Admin can change user status.'));
      return;
    }
    setUsers(prev => prev.map(u => (u.id === userId ? rowToUser(updated) : u)));
  };

  const inviteUser: AppContextType['inviteUser'] = async userData => {
    const payload = {
      id: `USR-${String(Date.now()).slice(-6)}`,
      name: userData.name || userData.email.split('@')[0],
      email: userData.email.trim().toLowerCase(),
      role: userData.role,
      department: userData.department || 'Supply Chain Operations',
      status: 'Active',
      avatar: `https://images.unsplash.com/photo-${1530000000000 + Math.floor(Math.random() * 99999999)}?w=150&auto=format&fit=crop&q=80`,
      lastActive: 'Invited just now',
    };

    const { data: inserted, error } = await supabase
      .from(TABLES.users)
      .insert(payload)
      .select('*')
      .single();

    if (error || !inserted) {
      setDataError(describeError(error, 'Only an Admin can invite users.'));
      return;
    }
    setUsers(prev => [rowToUser(inserted), ...prev]);

    pushActivity({
      id: `ACT-${Date.now()}`,
      timestamp: 'Just now',
      type: 'user',
      title: 'User Invited',
      description: `${payload.name} invited as ${payload.role}. They complete access by signing up with ${payload.email}.`,
      badge: payload.role,
      badgeType: 'info',
      linkScreen: 'users',
    });
  };

  const dismissNotification = (id: string) => setNotifications(prev => prev.filter(n => n.id !== id));
  const markAllNotificationsRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));

  // Export CSV (unchanged)
  const exportDataToCSV = (filename: string, rows: Record<string, any>[]) => {
    if (!rows || !rows.length) return;
    const headers = Object.keys(rows[0]);
    const csvContent = [
      headers.join(','),
      ...rows.map(row =>
        headers
          .map(header => {
            const val = row[header];
            if (typeof val === 'string') return `"${val.replace(/"/g, '""')}"`;
            return val !== undefined && val !== null ? val : '';
          })
          .join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <AppContext.Provider
      value={{
        currentRole,
        setCurrentRole,
        activeScreen,
        setActiveScreen,
        isDarkMode,
        toggleDarkMode,
        performanceTab,
        setPerformanceTab,
        suppliers,
        cars,
        audits,
        users,
        activities,
        notifications,
        selectedSupplier,
        setSelectedSupplier,
        isAddSupplierModalOpen,
        setIsAddSupplierModalOpen,
        editingSupplier,
        setEditingSupplier,
        isRaiseCarModalOpen,
        setIsRaiseCarModalOpen,
        preselectedCarSupplierId,
        setPreselectedCarSupplierId,
        isInviteUserModalOpen,
        setIsInviteUserModalOpen,
        selectedStandardsDoc,
        setSelectedStandardsDoc,
        globalSearch,
        setGlobalSearch,
        dismissNotification,
        markAllNotificationsRead,
        addSupplier,
        updateSupplier,
        deleteSupplier,
        addCAR,
        updateCARStatus,
        addAudit,
        updateUserRole,
        toggleUserStatus,
        inviteUser,
        canAccessScreen,
        canEdit,
        exportDataToCSV,
        session,
        authRole,
        currentUserName,
        currentUserEmail: session?.user?.email ?? null,
        isBootstrapping,
        isSyncing,
        dataError,
        signIn,
        signUp,
        signOut,
        refreshAll,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
