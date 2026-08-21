import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CAR, Audit, Supplier, CarStatus } from '../../types';
import { 
  Gauge, 
  Calendar, 
  AlertOctagon, 
  Plus, 
  Download, 
  Search, 
  Filter, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  ShieldAlert, 
  ArrowUpRight, 
  Eye, 
  FileCheck,
  Calculator,
  UserCheck
} from 'lucide-react';

export const SupplierPerformanceScreen: React.FC = () => {
  const { 
    suppliers, 
    cars, 
    audits, 
    performanceTab, 
    setPerformanceTab, 
    updateCARStatus, 
    setIsRaiseCarModalOpen, 
    setPreselectedCarSupplierId,
    setSelectedSupplier,
    setActiveScreen,
    canEdit,
    exportDataToCSV,
    globalSearch
  } = useApp();

  const [searchFilter, setSearchFilter] = useState('');
  const [tierFilter, setTierFilter] = useState('All');
  const [carStatusFilter, setCarStatusFilter] = useState('All');
  const [auditStatusFilter, setAuditStatusFilter] = useState('All');

  // Combined search
  const activeSearch = searchFilter || globalSearch;

  // KPI Calculations
  const fleetPpm = Math.round(suppliers.reduce((acc, s) => acc + s.ppm, 0) / (suppliers.length || 1));
  const avgOtd = Number((suppliers.reduce((acc, s) => acc + s.otd, 0) / (suppliers.length || 1)).toFixed(1));
  const openCars = cars.filter(c => c.status !== 'Verified Closed').length;
  const criticalCars = cars.filter(c => c.severity === 'Critical' && c.status !== 'Verified Closed').length;
  const upcomingAudits = audits.filter(a => a.status === 'Scheduled' || a.status === 'Overdue').length;

  // Filtered Suppliers for Scorecard Tab
  const filteredSuppliers = suppliers.filter(s => {
    const matchesTier = tierFilter === 'All' || s.tier.includes(tierFilter);
    const matchesSearch = !activeSearch || 
      s.name.toLowerCase().includes(activeSearch.toLowerCase()) || 
      s.commodity.toLowerCase().includes(activeSearch.toLowerCase());
    return matchesTier && matchesSearch;
  });

  // Filtered Audits
  const filteredAudits = audits.filter(a => {
    const matchesStatus = auditStatusFilter === 'All' || a.status === auditStatusFilter;
    const matchesSearch = !activeSearch || 
      a.supplierName.toLowerCase().includes(activeSearch.toLowerCase()) ||
      a.auditType.toLowerCase().includes(activeSearch.toLowerCase()) ||
      a.id.toLowerCase().includes(activeSearch.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Filtered CARs
  const filteredCars = cars.filter(c => {
    const matchesStatus = carStatusFilter === 'All' || c.status === carStatusFilter;
    const matchesSearch = !activeSearch || 
      c.supplierName.toLowerCase().includes(activeSearch.toLowerCase()) ||
      c.issue.toLowerCase().includes(activeSearch.toLowerCase()) ||
      c.ref.toLowerCase().includes(activeSearch.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleExportPerformance = () => {
    if (performanceTab === 'scorecard') {
      const rows = filteredSuppliers.map(s => ({
        Supplier: s.name,
        Commodity: s.commodity,
        PPM: s.ppm,
        OTD_Percent: `${s.otd}%`,
        Audit_Score: s.auditScore,
        SCAR_Closure: `${s.scarClosure}%`,
        Composite_Score: s.compositeScore,
        Tier: s.tier
      }));
      exportDataToCSV('Supplier_Performance_Scorecards', rows);
    } else if (performanceTab === 'audit') {
      const rows = filteredAudits.map(a => ({
        Audit_ID: a.id,
        Supplier: a.supplierName,
        Audit_Type: a.auditType,
        Last_Date: a.lastDate,
        Next_Date: a.nextDate,
        Result: a.result,
        Status: a.status,
        Lead_Auditor: a.leadAuditor
      }));
      exportDataToCSV('Audit_Schedules_Log', rows);
    } else {
      const rows = filteredCars.map(c => ({
        CAR_Ref: c.ref,
        Supplier: c.supplierName,
        Severity: c.severity,
        Status: c.status,
        Raised_Date: c.raisedDate,
        Due_Date: c.dueDate,
        Issue: c.issue,
        Assigned_SQE: c.assignedSqe
      }));
      exportDataToCSV('Corrective_Actions_CAPA_Log', rows);
    }
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white tracking-tight">
            Supplier Performance Tracking
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Automotive scorecard analytics, VDA 6.3/CoP audit schedules, and 8D CAPA corrective action tracking.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportPerformance}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-[#1E293B] text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 rounded-lg text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            Export Tab Data
          </button>

          {canEdit('performance') && (
            <button
              onClick={() => {
                setPreselectedCarSupplierId(null);
                setIsRaiseCarModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-medium transition-colors shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Log Review / Raise CAR
            </button>
          )}
        </div>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white dark:bg-[#1E293B] p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Fleet Avg PPM
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className={`text-2xl font-semibold font-mono ${fleetPpm > 50 ? 'text-rose-600' : 'text-slate-900 dark:text-white'}`}>
              {fleetPpm}
            </span>
            <span className="text-[11px] text-slate-400">Target: ≤ 50 PPM</span>
          </div>
          <div className="mt-2 w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full ${fleetPpm > 50 ? 'bg-rose-500' : 'bg-teal-500'}`}
              style={{ width: `${Math.min(100, (fleetPpm / 50) * 100)}%` }}
            />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white dark:bg-[#1E293B] p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Fleet On-Time Delivery (OTD)
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-semibold font-mono text-emerald-600 dark:text-emerald-400">
              {avgOtd}%
            </span>
            <span className="text-[11px] text-slate-400">Target: ≥ 98.0%</span>
          </div>
          <div className="mt-2 w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${avgOtd}%` }} />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white dark:bg-[#1E293B] p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Open Corrective Actions
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-semibold text-slate-900 dark:text-white">
              {openCars}
            </span>
            {criticalCars > 0 && (
              <span className="text-[11px] font-medium text-rose-600 dark:text-rose-400">
                {criticalCars} Critical
              </span>
            )}
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            {cars.filter(c => c.status === '8D Submitted').length} awaiting SQE verification
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white dark:bg-[#1E293B] p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Upcoming Audits
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-semibold text-slate-900 dark:text-white">
              {upcomingAudits}
            </span>
            <span className="text-[11px] text-amber-600 font-medium">
              {audits.filter(a => a.status === 'Overdue').length} Overdue
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Next: {audits[1]?.nextDate || 'Upcoming'}
          </div>
        </div>
      </div>

      {/* Tabs Controller */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6">
        <button
          onClick={() => setPerformanceTab('scorecard')}
          className={`pb-3 text-xs font-medium flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            performanceTab === 'scorecard'
              ? 'border-teal-600 text-teal-700 dark:text-teal-400 dark:border-teal-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <Gauge className="w-3.5 h-3.5" />
          <span>Scorecard & Ratings</span>
          <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-600 dark:text-slate-400">
            {suppliers.length}
          </span>
        </button>

        <button
          onClick={() => setPerformanceTab('audit')}
          className={`pb-3 text-xs font-medium flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            performanceTab === 'audit'
              ? 'border-teal-600 text-teal-700 dark:text-teal-400 dark:border-teal-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Audit Schedule</span>
          <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-600 dark:text-slate-400">
            {audits.length}
          </span>
        </button>

        <button
          onClick={() => setPerformanceTab('car')}
          className={`pb-3 text-xs font-medium flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            performanceTab === 'car'
              ? 'border-teal-600 text-teal-700 dark:text-teal-400 dark:border-teal-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <AlertOctagon className="w-3.5 h-3.5" />
          <span>Corrective Actions (CARs)</span>
          {openCars > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 rounded-full font-medium">
              {openCars} Open
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: Scorecard & Ratings */}
      {performanceTab === 'scorecard' && (
        <div className="space-y-4">
          {/* Formula helper bar */}
          <div className="bg-teal-50/60 dark:bg-teal-950/30 p-3 rounded-xl border border-teal-100/80 dark:border-teal-900/50 flex flex-col md:flex-row md:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-teal-900 dark:text-teal-300 font-medium">
              <Calculator className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>Score Weighting: 30% PPM • 25% OTD • 25% Audit Score • 20% SCAR Closure</span>
            </div>
            <div className="text-slate-500 dark:text-slate-400 text-[11px]">
              Thresholds: Preferred (≥4.0) | Approved (3.0-3.9) | Conditional (2.0-2.9) | At Risk (&lt;2.0)
            </div>
          </div>

          {/* Table Filters */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Tier Filter:</span>
              <select
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value)}
                className="text-xs px-2.5 py-1.5 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300"
              >
                <option value="All">All Tiers</option>
                <option value="Preferred">Tier 1 - Preferred</option>
                <option value="Approved">Tier 1 - Approved</option>
                <option value="Conditional">Tier 2 - Conditional</option>
                <option value="Development">Tier 3 - Development</option>
              </select>
            </div>
          </div>

          {/* Scorecard Table */}
          <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 text-[11px] font-semibold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Supplier & ID</th>
                    <th className="py-3 px-4">Commodity</th>
                    <th className="py-3 px-4">PPM (30%)</th>
                    <th className="py-3 px-4">OTD% (25%)</th>
                    <th className="py-3 px-4">Audit (25%)</th>
                    <th className="py-3 px-4">SCAR Closure (20%)</th>
                    <th className="py-3 px-4">Composite Score</th>
                    <th className="py-3 px-4">Assigned Tier</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {filteredSuppliers.map((supplier) => {
                    const isPreferred = supplier.compositeScore >= 4.0;
                    const isApproved = supplier.compositeScore >= 3.0 && supplier.compositeScore < 4.0;
                    const isConditional = supplier.compositeScore >= 2.0 && supplier.compositeScore < 3.0;

                    return (
                      <tr
                        key={supplier.id}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer"
                        onClick={() => {
                          setSelectedSupplier(supplier);
                          setActiveScreen('master-data');
                        }}
                      >
                        <td className="py-3.5 px-4">
                          <div className="font-medium text-slate-900 dark:text-white group-hover:text-teal-700 dark:group-hover:text-teal-400">
                            {supplier.name}
                          </div>
                          <div className="font-mono text-[11px] text-slate-400">{supplier.id}</div>
                        </td>

                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                          {supplier.commodity}
                        </td>

                        <td className="py-3.5 px-4 font-mono">
                          <span className={supplier.ppm > 50 ? 'text-rose-600 font-semibold' : 'text-slate-800 dark:text-slate-200'}>
                            {supplier.ppm}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 font-mono">
                          <span className={supplier.otd < 95 ? 'text-amber-600' : 'text-slate-800 dark:text-slate-200'}>
                            {supplier.otd}%
                          </span>
                        </td>

                        <td className="py-3.5 px-4 font-mono">
                          {supplier.auditScore}%
                        </td>

                        <td className="py-3.5 px-4 font-mono">
                          <span className={supplier.scarClosure < 60 ? 'text-rose-600' : 'text-slate-800 dark:text-slate-200'}>
                            {supplier.scarClosure}%
                          </span>
                        </td>

                        <td className="py-3.5 px-4 font-mono font-semibold text-sm">
                          <span className={isPreferred ? 'text-teal-700 dark:text-teal-400' : isApproved ? 'text-teal-600' : isConditional ? 'text-amber-600' : 'text-rose-600'}>
                            {supplier.compositeScore.toFixed(2)}
                          </span>
                          <span className="text-[11px] text-slate-400 font-normal ml-1">/ 5.0</span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${
                              isPreferred
                                ? 'bg-teal-50 text-teal-800 border border-teal-200 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-800'
                                : isApproved
                                ? 'bg-blue-50 text-blue-800 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800'
                                : isConditional
                                ? 'bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
                                : 'bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'
                            }`}
                          >
                            {supplier.tier}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            {canEdit('performance') && (
                              <button
                                onClick={() => {
                                  setPreselectedCarSupplierId(supplier.id);
                                  setIsRaiseCarModalOpen(true);
                                }}
                                className="px-2 py-1 text-[11px] font-medium text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 rounded border border-teal-200 dark:border-teal-800 cursor-pointer"
                                title="Log CAR or Score Review"
                              >
                                Log Review
                              </button>
                            )}

                            <button
                              onClick={() => {
                                setSelectedSupplier(supplier);
                                setActiveScreen('master-data');
                              }}
                              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Audit Schedule */}
      {performanceTab === 'audit' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Status Filter:</span>
              <select
                value={auditStatusFilter}
                onChange={(e) => setAuditStatusFilter(e.target.value)}
                className="text-xs px-2.5 py-1.5 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300"
              >
                <option value="All">All Audits</option>
                <option value="Completed">Completed</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Overdue">Overdue</option>
              </select>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 text-[11px] font-semibold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Audit ID</th>
                    <th className="py-3 px-4">Supplier</th>
                    <th className="py-3 px-4">Audit Type</th>
                    <th className="py-3 px-4">Last Date</th>
                    <th className="py-3 px-4">Next Due Date</th>
                    <th className="py-3 px-4">Score & Result</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Lead Auditor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {filteredAudits.map((audit) => (
                    <tr key={audit.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-700 dark:text-slate-300">
                        {audit.id}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-900 dark:text-white">
                        {audit.supplierName}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-medium text-slate-700 dark:text-slate-300">
                          {audit.auditType}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                        {audit.lastDate}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px]">
                        <span className={audit.status === 'Overdue' ? 'text-rose-600 font-semibold' : 'text-slate-700 dark:text-slate-300'}>
                          {audit.nextDate}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-medium">
                        {audit.result}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${
                            audit.status === 'Completed'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : audit.status === 'Scheduled'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-300'
                              : 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-300'
                          }`}
                        >
                          {audit.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                        {audit.leadAuditor}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Corrective Actions (CARs) */}
      {performanceTab === 'car' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Status Filter:</span>
              <select
                value={carStatusFilter}
                onChange={(e) => setCarStatusFilter(e.target.value)}
                className="text-xs px-2.5 py-1.5 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300"
              >
                <option value="All">All Statuses</option>
                <option value="Open">Open</option>
                <option value="Under Investigation">Under Investigation</option>
                <option value="8D Submitted">8D Submitted</option>
                <option value="Verified Closed">Verified Closed</option>
              </select>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 text-[11px] font-semibold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Ref #</th>
                    <th className="py-3 px-4">Supplier</th>
                    <th className="py-3 px-4">Severity</th>
                    <th className="py-3 px-4">Issue Description</th>
                    <th className="py-3 px-4">Raised / Due</th>
                    <th className="py-3 px-4">Status Flow</th>
                    <th className="py-3 px-4">Assigned SQE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {filteredCars.map((car) => {
                    const isClosed = car.status === 'Verified Closed';

                    return (
                      <tr key={car.ref} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-medium text-slate-900 dark:text-white">
                          {car.ref}
                        </td>

                        <td className="py-3.5 px-4 font-medium text-slate-800 dark:text-slate-200">
                          {car.supplierName}
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${
                              car.severity === 'Critical'
                                ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                : car.severity === 'Major'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                            }`}
                          >
                            {car.severity}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 max-w-xs text-slate-600 dark:text-slate-300">
                          <p className="line-clamp-2">{car.issue}</p>
                          {car.rootCause && (
                            <p className="text-[10px] text-slate-400 mt-0.5 italic truncate">
                              Root: {car.rootCause}
                            </p>
                          )}
                        </td>

                        <td className="py-3.5 px-4 font-mono text-[11px]">
                          <div>R: {car.raisedDate}</div>
                          <div className="text-slate-400">Due: {car.dueDate}</div>
                        </td>

                        <td className="py-3.5 px-4">
                          {canEdit('performance') ? (
                            <select
                              value={car.status}
                              onChange={(e) => updateCARStatus(car.ref, e.target.value as CarStatus)}
                              className={`text-[11px] font-medium px-2 py-1 rounded-md border focus:outline-none cursor-pointer ${
                                isClosed
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300'
                                  : car.status === '8D Submitted'
                                  ? 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300'
                                  : car.status === 'Under Investigation'
                                  ? 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300'
                                  : 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300'
                              }`}
                            >
                              <option value="Open">Open</option>
                              <option value="Under Investigation">Under Investigation</option>
                              <option value="8D Submitted">8D Submitted</option>
                              <option value="Verified Closed">Verified Closed</option>
                            </select>
                          ) : (
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${
                              isClosed
                                ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : car.status === '8D Submitted'
                                ? 'bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                                : 'bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            }`}>
                              {car.status}
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                          {car.assignedSqe}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
