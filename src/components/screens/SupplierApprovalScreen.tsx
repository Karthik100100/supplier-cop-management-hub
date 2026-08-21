import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Supplier, ApprovalStatus, RiskCategory } from '../../types';
import { 
  CheckCircle2, 
  Clock, 
  XCircle, 
  AlertCircle, 
  Plus, 
  Filter, 
  Download, 
  Eye, 
  FileText, 
  Check, 
  X, 
  ChevronRight,
  ShieldCheck,
  FileCheck2,
  AlertTriangle
} from 'lucide-react';

export const SupplierApprovalScreen: React.FC = () => {
  const { 
    suppliers, 
    updateSupplier, 
    setSelectedSupplier, 
    setActiveScreen, 
    setIsAddSupplierModalOpen, 
    setEditingSupplier,
    canEdit,
    exportDataToCSV,
    globalSearch
  } = useApp();

  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [riskFilter, setRiskFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Combined search (local + global)
  const activeSearch = searchQuery || globalSearch;

  // Filter logic
  const filteredSuppliers = suppliers.filter(s => {
    const matchesStatus = statusFilter === 'All' || s.approvalStatus === statusFilter;
    const matchesRisk = riskFilter === 'All' || s.riskCategory === riskFilter;
    const matchesSearch = !activeSearch || 
      s.name.toLowerCase().includes(activeSearch.toLowerCase()) ||
      s.id.toLowerCase().includes(activeSearch.toLowerCase()) ||
      s.commodity.toLowerCase().includes(activeSearch.toLowerCase()) ||
      s.location.toLowerCase().includes(activeSearch.toLowerCase());
    return matchesStatus && matchesRisk && matchesSearch;
  });

  // Summary Metrics
  const approvedCount = suppliers.filter(s => s.approvalStatus === 'Approved').length;
  const pendingCount = suppliers.filter(s => s.approvalStatus === 'Pending' || s.approvalStatus === 'Under Review').length;
  const sqaSignedCount = suppliers.filter(s => s.sqaSigned).length;
  const complianceRate = Math.round((approvedCount / (suppliers.length || 1)) * 100);

  const handleStatusChange = (supplierId: string, newStatus: ApprovalStatus) => {
    updateSupplier(supplierId, { approvalStatus: newStatus });
  };

  const handleToggleSqa = (supplierId: string, currentSqa: boolean) => {
    updateSupplier(supplierId, { 
      sqaSigned: !currentSqa,
      sqaDate: !currentSqa ? new Date().toISOString().split('T')[0] : undefined
    });
  };

  const handleExport = () => {
    const rows = filteredSuppliers.map(s => ({
      Supplier_ID: s.id,
      Name: s.name,
      Commodity: s.commodity,
      Location: s.location,
      Risk_Category: s.riskCategory,
      IATF_Status: s.iatfStatus,
      IATF_Expiry: s.iatfCertExpiry,
      Assessment_Status: s.assessmentStatus,
      SQA_Signed: s.sqaSigned ? 'Yes' : 'No',
      Approval_Status: s.approvalStatus,
      Composite_Score: s.compositeScore,
      Tier: s.tier
    }));
    exportDataToCSV('Supplier_Approval_Pipeline', rows);
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white tracking-tight">
            Supplier Approval Pipeline
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Initial qualification, SQA legal execution, IATF 16949 certification verification, and APQP readiness.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-[#1E293B] text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 rounded-lg text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            Export Pipeline
          </button>

          {canEdit('suppliers') && (
            <button
              onClick={() => {
                setEditingSupplier(null);
                setIsAddSupplierModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-medium transition-colors shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add / Amend Supplier
            </button>
          )}
        </div>
      </div>

      {/* Info Summary Cards Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Key Pipeline Activities */}
        <div className="bg-white dark:bg-[#1E293B] p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-2 mb-3 text-slate-900 dark:text-white font-semibold text-xs">
            <Clock className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <h3>Key Pipeline Activities</h3>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400">Completed On-site Audits</span>
              <span className="font-medium text-emerald-600 dark:text-emerald-400">{approvedCount} Verified</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400">Pending Review & SQA Signing</span>
              <span className="font-medium text-amber-600 dark:text-amber-400">{pendingCount} Suppliers</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-500 dark:text-slate-400">Signed SQA Agreements</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">{sqaSignedCount} / {suppliers.length}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Required Deliverables */}
        <div className="bg-white dark:bg-[#1E293B] p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-2 mb-3 text-slate-900 dark:text-white font-semibold text-xs">
            <FileCheck2 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <h3>Required Deliverables</h3>
          </div>
          <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 flex-shrink-0" />
              <span>IATF 16949 / ISO 9001 Current Certificate</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 flex-shrink-0" />
              <span>Signed Supplier Quality Agreement (SQA)</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 flex-shrink-0" />
              <span>CoP Initial Verification Audit Score ≥ 85%</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 flex-shrink-0" />
              <span>PPAP Level 3 & Control Plan submission</span>
            </div>
          </div>
        </div>

        {/* Card 3: Success Criteria */}
        <div className="bg-white dark:bg-[#1E293B] p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2 text-slate-900 dark:text-white font-semibold text-xs">
              <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <h3>Approval Compliance Rate</h3>
            </div>
            <p className="text-xs text-slate-400">
              Fleet target threshold: 100% full approval before SOP production release.
            </p>
          </div>

          <div className="mt-4">
            <div className="flex justify-between items-center text-xs font-medium mb-1.5">
              <span className="text-slate-600 dark:text-slate-300">Approved Base</span>
              <span className="text-teal-700 dark:text-teal-400 font-semibold">{complianceRate}% ({approvedCount}/{suppliers.length})</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-teal-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${complianceRate}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-[#1E293B] p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Filters:
          </span>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-teal-600"
          >
            <option value="All">All Statuses</option>
            <option value="Approved">Approved</option>
            <option value="Pending">Pending</option>
            <option value="Under Review">Under Review</option>
            <option value="Rejected">Rejected</option>
          </select>

          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="text-xs px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-teal-600"
          >
            <option value="All">All Risk Levels</option>
            <option value="Low">Low Risk</option>
            <option value="Medium">Medium Risk</option>
            <option value="High">High Risk</option>
          </select>
        </div>

        <div className="w-full sm:w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search in table..."
            className="w-full text-xs px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-teal-600"
          />
        </div>
      </div>

      {/* Main Interactive Table */}
      <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 text-[11px] font-semibold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Supplier & ID</th>
                <th className="py-3 px-4">Commodity</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Risk Category</th>
                <th className="py-3 px-4">IATF Expiry</th>
                <th className="py-3 px-4">Assessment Status</th>
                <th className="py-3 px-4">SQA Signed</th>
                <th className="py-3 px-4">Approval Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {filteredSuppliers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    No suppliers match the current filter criteria.
                  </td>
                </tr>
              ) : (
                filteredSuppliers.map((supplier) => {
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
                        <div className="font-mono text-[11px] text-slate-400">
                          {supplier.id}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                        {supplier.commodity}
                      </td>

                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                        {supplier.location}
                      </td>

                      <td className="py-3.5 px-4">
                        {supplier.riskCategory === 'Low' && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800">
                            Low
                          </span>
                        )}
                        {supplier.riskCategory === 'Medium' && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800">
                            Medium
                          </span>
                        )}
                        {supplier.riskCategory === 'High' && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800">
                            High
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <span className={supplier.iatfStatus === 'Expired' ? 'text-rose-600 font-semibold' : supplier.iatfStatus === 'Expiring Soon' ? 'text-amber-600 font-medium' : 'text-slate-600 dark:text-slate-300'}>
                            {supplier.iatfCertExpiry}
                          </span>
                          {supplier.iatfStatus === 'Expired' && <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-medium text-slate-700 dark:text-slate-300">
                        {supplier.assessmentStatus}
                      </td>

                      <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                        {canEdit('suppliers') ? (
                          <button
                            onClick={() => handleToggleSqa(supplier.id, supplier.sqaSigned)}
                            className={`px-2.5 py-1 rounded-md text-[11px] font-medium flex items-center gap-1 border transition-colors cursor-pointer ${
                              supplier.sqaSigned
                                ? 'bg-teal-50 text-teal-800 border-teal-200 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-800 hover:bg-teal-100'
                                : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700 hover:bg-slate-200'
                            }`}
                            title="Click to toggle SQA agreement signed state"
                          >
                            {supplier.sqaSigned ? <Check className="w-3 h-3 text-teal-600 dark:text-teal-400" /> : <X className="w-3 h-3 text-slate-400" />}
                            <span>{supplier.sqaSigned ? 'Signed' : 'Unsigned'}</span>
                          </button>
                        ) : (
                          <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${supplier.sqaSigned ? 'text-teal-700 dark:text-teal-400' : 'text-slate-400'}`}>
                            {supplier.sqaSigned ? 'Signed' : 'Unsigned'}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                        {canEdit('suppliers') ? (
                          <select
                            value={supplier.approvalStatus}
                            onChange={(e) => handleStatusChange(supplier.id, e.target.value as ApprovalStatus)}
                            className={`text-[11px] font-medium px-2 py-1 rounded-md border focus:outline-none cursor-pointer ${
                              supplier.approvalStatus === 'Approved'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                                : supplier.approvalStatus === 'Pending'
                                ? 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
                                : supplier.approvalStatus === 'Under Review'
                                ? 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800'
                                : 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'
                            }`}
                          >
                            <option value="Approved">Approved</option>
                            <option value="Pending">Pending</option>
                            <option value="Under Review">Under Review</option>
                            <option value="Rejected">Rejected</option>
                          </select>
                        ) : (
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${
                            supplier.approvalStatus === 'Approved'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                              : supplier.approvalStatus === 'Pending'
                              ? 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                              : supplier.approvalStatus === 'Under Review'
                              ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                              : 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                          }`}>
                            {supplier.approvalStatus}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedSupplier(supplier);
                              setActiveScreen('master-data');
                            }}
                            className="p-1.5 text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
                            title="View Master Profile"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {canEdit('suppliers') && (
                            <button
                              onClick={() => {
                                setEditingSupplier(supplier);
                                setIsAddSupplierModalOpen(true);
                              }}
                              className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
                              title="Edit Supplier Details"
                            >
                              <FileText className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
