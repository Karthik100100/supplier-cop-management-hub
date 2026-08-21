import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { CarSeverity, CarStatus } from '../../types';
import { X, AlertOctagon, CheckCircle2, ShieldAlert } from 'lucide-react';

export const RaiseCarModal: React.FC = () => {
  const { 
    isRaiseCarModalOpen, 
    setIsRaiseCarModalOpen, 
    preselectedCarSupplierId, 
    suppliers, 
    addCAR 
  } = useApp();

  const [supplierId, setSupplierId] = useState('');
  const [issue, setIssue] = useState('');
  const [severity, setSeverity] = useState<CarSeverity>('Major');
  const [dueDate, setDueDate] = useState('');
  const [assignedSqe, setAssignedSqe] = useState('J. Doe (SQE)');
  const [rootCause, setRootCause] = useState('');
  const [containmentAction, setContainmentAction] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (preselectedCarSupplierId) {
      setSupplierId(preselectedCarSupplierId);
    } else if (suppliers.length > 0) {
      setSupplierId(suppliers[0].id);
    }
    // Default due date to +30 days from now
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 30);
    setDueDate(targetDate.toISOString().split('T')[0]);
    setIssue('');
    setRootCause('');
    setContainmentAction('');
    setSeverity('Major');
    setError('');
  }, [preselectedCarSupplierId, isRaiseCarModalOpen, suppliers]);

  if (!isRaiseCarModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!issue.trim()) {
      setError('Issue description is mandatory.');
      return;
    }
    const targetSupplier = suppliers.find(s => s.id === supplierId);
    if (!targetSupplier) {
      setError('Please select a valid supplier.');
      return;
    }

    addCAR({
      supplierId: targetSupplier.id,
      supplierName: targetSupplier.name,
      issue,
      raisedDate: new Date().toISOString().split('T')[0],
      dueDate: dueDate || new Date().toISOString().split('T')[0],
      severity,
      status: 'Open',
      assignedSqe,
      rootCause,
      containmentAction
    });

    setIsRaiseCarModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-2xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#1E293B] rounded-2xl max-w-xl w-full p-6 shadow-xl border border-slate-200/80 dark:border-slate-800 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-100 dark:border-rose-900/50">
              <AlertOctagon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Log Corrective Action (CAR / 8D)
              </h2>
              <p className="text-xs text-slate-400">
                Initiate formal automotive CAPA incident investigation for Tier-1 non-conformance.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsRaiseCarModalOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl text-xs text-rose-700 dark:text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs mt-4">
          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
              Select Supplier *
            </label>
            <select
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-600"
            >
              {suppliers.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.id}) — {s.commodity}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Severity Level
              </label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as CarSeverity)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-600"
              >
                <option value="Critical">Critical (Line Stop / Safety / High PPM)</option>
                <option value="Major">Major (Function / Tolerance failure)</option>
                <option value="Minor">Minor (Packaging / Labeling / Visual)</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                8D Target Closure Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-600"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
              Issue Non-Conformance Summary *
            </label>
            <textarea
              rows={3}
              value={issue}
              onChange={(e) => setIssue(e.target.value)}
              placeholder="Detail the defective condition, batch numbers, part numbers, and failure mode observed..."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-600"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
              Initial Containment Action (D3)
            </label>
            <input
              type="text"
              value={containmentAction}
              onChange={(e) => setContainmentAction(e.target.value)}
              placeholder="e.g. 100% sort of warehouse stock, quarantine lot #4902..."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Assigned Lead SQE
              </label>
              <select
                value={assignedSqe}
                onChange={(e) => setAssignedSqe(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-600"
              >
                <option value="J. Doe (SQE)">J. Doe (SQE)</option>
                <option value="Anna Smith (SQE)">Anna Smith (SQE)</option>
                <option value="Rachel Chen (Purchasing)">Rachel Chen (Purchasing)</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Root Cause Hypothesis (D4)
              </label>
              <input
                type="text"
                value={rootCause}
                onChange={(e) => setRootCause(e.target.value)}
                placeholder="e.g. Tooling wear, thermal drift, material variation..."
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-600"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setIsRaiseCarModalOpen(false)}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-medium shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <AlertOctagon className="w-3.5 h-3.5" />
              <span>Raise CAR</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
