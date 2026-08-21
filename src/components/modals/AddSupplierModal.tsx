import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { RiskCategory, ApprovalStatus } from '../../types';
import { calculateCompositeScore, deriveTier } from '../../data/mockData';
import { X, Building2, ShieldCheck, Calculator, Check, AlertCircle } from 'lucide-react';

export const AddSupplierModal: React.FC = () => {
  const { 
    isAddSupplierModalOpen, 
    setIsAddSupplierModalOpen, 
    editingSupplier, 
    setEditingSupplier, 
    addSupplier, 
    updateSupplier 
  } = useApp();

  const [name, setName] = useState('');
  const [commodity, setCommodity] = useState('Powertrain Components');
  const [location, setLocation] = useState('');
  const [region, setRegion] = useState<'EU' | 'NA' | 'APAC' | 'Global'>('EU');
  const [riskCategory, setRiskCategory] = useState<RiskCategory>('Low');
  const [iatfCertExpiry, setIatfCertExpiry] = useState('2026-12-31');
  const [assessmentScore, setAssessmentScore] = useState<number>(92);
  const [sqaSigned, setSqaSigned] = useState<boolean>(true);
  const [approvalStatus, setApprovalStatus] = useState<ApprovalStatus>('Approved');
  const [ppm, setPpm] = useState<number>(25);
  const [otd, setOtd] = useState<number>(98.5);
  const [auditScore, setAuditScore] = useState<number>(92);
  const [scarClosure, setScarClosure] = useState<number>(95);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  // Calculate preview live
  const previewCompositeScore = calculateCompositeScore(ppm, otd, auditScore, scarClosure);
  const previewTier = deriveTier(previewCompositeScore);

  useEffect(() => {
    if (editingSupplier) {
      setName(editingSupplier.name);
      setCommodity(editingSupplier.commodity);
      setLocation(editingSupplier.location);
      setRegion(editingSupplier.region || 'EU');
      setRiskCategory(editingSupplier.riskCategory);
      setIatfCertExpiry(editingSupplier.iatfCertExpiry);
      setAssessmentScore(editingSupplier.assessmentScore || 90);
      setSqaSigned(editingSupplier.sqaSigned);
      setApprovalStatus(editingSupplier.approvalStatus);
      setPpm(editingSupplier.ppm);
      setOtd(editingSupplier.otd);
      setAuditScore(editingSupplier.auditScore);
      setScarClosure(editingSupplier.scarClosure);
      setNotes(editingSupplier.notes || '');
    } else {
      setName('');
      setCommodity('Powertrain Components');
      setLocation('');
      setRegion('EU');
      setRiskCategory('Low');
      setIatfCertExpiry('2026-12-31');
      setAssessmentScore(92);
      setSqaSigned(true);
      setApprovalStatus('Approved');
      setPpm(25);
      setOtd(98.5);
      setAuditScore(92);
      setScarClosure(95);
      setNotes('');
    }
    setError('');
  }, [editingSupplier, isAddSupplierModalOpen]);

  if (!isAddSupplierModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Supplier Name is required.');
      return;
    }
    if (!location.trim()) {
      setError('Location (City, Country) is required.');
      return;
    }

    if (editingSupplier) {
      updateSupplier(editingSupplier.id, {
        name,
        commodity,
        location,
        region,
        riskCategory,
        iatfCertExpiry,
        assessmentScore,
        assessmentStatus: `Audit ${assessmentScore >= 85 ? 'Passed' : 'Conditional'} (${assessmentScore}%)`,
        sqaSigned,
        approvalStatus,
        ppm: Number(ppm),
        otd: Number(otd),
        auditScore: Number(auditScore),
        scarClosure: Number(scarClosure),
        notes
      });
    } else {
      addSupplier({
        name,
        commodity,
        location,
        region,
        riskCategory,
        iatfCertExpiry,
        assessmentScore,
        assessmentStatus: `Audit Passed (${assessmentScore}%)`,
        sqaSigned,
        approvalStatus,
        ppm: Number(ppm),
        otd: Number(otd),
        auditScore: Number(auditScore),
        scarClosure: Number(scarClosure),
        notes
      });
    }

    setIsAddSupplierModalOpen(false);
    setEditingSupplier(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-2xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#1E293B] rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-slate-200/80 dark:border-slate-800 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 flex items-center justify-center border border-teal-100 dark:border-teal-900/50">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                {editingSupplier ? 'Amend Supplier Master Record' : 'Register New Automotive Supplier'}
              </h2>
              <p className="text-xs text-slate-400">
                Tier-1 Conformity of Production (CoP) Accreditation & Baseline Performance.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setIsAddSupplierModalOpen(false);
              setEditingSupplier(null);
            }}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Live Scorecard Preview Card */}
        <div className="my-4 p-3.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-teal-800 dark:text-teal-300 flex items-center gap-1.5">
              <Calculator className="w-3.5 h-3.5" />
              Automated Scorecard Preview
            </span>
            <div className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
              Formula: (PPM × 30%) + (OTD × 25%) + (Audit × 25%) + (SCAR × 20%)
            </div>
          </div>

          <div className="text-right">
            <div className="text-xl font-semibold font-mono text-teal-700 dark:text-teal-300">
              {previewCompositeScore.toFixed(2)} <span className="text-xs font-normal text-slate-500">/ 5.0</span>
            </div>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 text-teal-800 dark:text-teal-200 border border-teal-200/60 dark:border-teal-800">
              {previewTier}
            </span>
          </div>
        </div>

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Supplier Legal Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Apex Precision Castings GmbH"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-600"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Commodity Family
              </label>
              <select
                value={commodity}
                onChange={(e) => setCommodity(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-600"
              >
                <option value="Powertrain Components">Powertrain Components</option>
                <option value="Electrical Systems">Electrical Systems & Harnesses</option>
                <option value="Interior Plastics">Interior Plastics & Trim</option>
                <option value="Chassis & Suspension">Chassis & Suspension</option>
                <option value="Sensors & ADAS">Sensors & ADAS Electronics</option>
                <option value="Fasteners & Hardware">Fasteners & Hardware</option>
                <option value="Raw Materials / Stamping">Raw Materials / Stamping</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Location (City, Country) *
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Stuttgart, Germany"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-600"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Global Region
              </label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-600"
              >
                <option value="EU">Europe (EU)</option>
                <option value="NA">North America (NA)</option>
                <option value="APAC">Asia-Pacific (APAC)</option>
                <option value="Global">Global / Other</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Risk Classification
              </label>
              <select
                value={riskCategory}
                onChange={(e) => setRiskCategory(e.target.value as RiskCategory)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-600"
              >
                <option value="Low">Low Risk</option>
                <option value="Medium">Medium Risk</option>
                <option value="High">High Risk</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                IATF 16949 Expiry Date
              </label>
              <input
                type="date"
                value={iatfCertExpiry}
                onChange={(e) => setIatfCertExpiry(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-600"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Initial Assessment Score (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={assessmentScore}
                onChange={(e) => setAssessmentScore(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-600"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Approval Decision Status
              </label>
              <select
                value={approvalStatus}
                onChange={(e) => setApprovalStatus(e.target.value as ApprovalStatus)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-600"
              >
                <option value="Approved">Approved</option>
                <option value="Pending">Pending</option>
                <option value="Under Review">Under Review</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Performance Baseline Weights Section */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-3">
            <span className="font-semibold text-slate-700 dark:text-slate-300 text-[11px] uppercase tracking-wider block">
              Performance Baseline Metrics
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Monthly PPM</label>
                <input
                  type="number"
                  min="0"
                  value={ppm}
                  onChange={(e) => setPpm(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-500 mb-1">OTD (%)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={otd}
                  onChange={(e) => setOtd(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Audit Score (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={auditScore}
                  onChange={(e) => setAuditScore(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-500 mb-1">SCAR Closure (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={scarClosure}
                  onChange={(e) => setScarClosure(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-xs"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="sqaCheck"
              checked={sqaSigned}
              onChange={(e) => setSqaSigned(e.target.checked)}
              className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4 cursor-pointer"
            />
            <label htmlFor="sqaCheck" className="text-slate-700 dark:text-slate-300 font-medium cursor-pointer">
              Supplier Quality Agreement (SQA) legally executed and signed on file
            </label>
          </div>

          {/* Footer actions */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => {
                setIsAddSupplierModalOpen(false);
                setEditingSupplier(null);
              }}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium shadow-xs transition-colors"
            >
              {editingSupplier ? 'Save Changes' : 'Register Supplier'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
