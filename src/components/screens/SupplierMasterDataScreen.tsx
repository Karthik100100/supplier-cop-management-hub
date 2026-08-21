import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Supplier } from '../../types';
import { 
  Database, 
  Search, 
  Filter, 
  Download, 
  Plus, 
  Eye, 
  X, 
  MapPin, 
  Mail, 
  Phone, 
  Award, 
  ShieldCheck, 
  AlertTriangle, 
  Clock, 
  FileText, 
  CheckCircle,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

export const SupplierMasterDataScreen: React.FC = () => {
  const { 
    suppliers, 
    selectedSupplier, 
    setSelectedSupplier, 
    cars, 
    audits, 
    setIsAddSupplierModalOpen, 
    setEditingSupplier, 
    setIsRaiseCarModalOpen, 
    setPreselectedCarSupplierId,
    canEdit,
    exportDataToCSV,
    globalSearch
  } = useApp();

  const [regionFilter, setRegionFilter] = useState('All');
  const [riskFilter, setRiskFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Combined search
  const activeSearch = searchQuery || globalSearch;

  const filteredSuppliers = suppliers.filter(s => {
    const matchesRegion = regionFilter === 'All' || s.region === regionFilter;
    const matchesRisk = riskFilter === 'All' || s.riskCategory === riskFilter;
    const matchesSearch = !activeSearch ||
      s.name.toLowerCase().includes(activeSearch.toLowerCase()) ||
      s.id.toLowerCase().includes(activeSearch.toLowerCase()) ||
      s.commodity.toLowerCase().includes(activeSearch.toLowerCase()) ||
      s.location.toLowerCase().includes(activeSearch.toLowerCase());
    return matchesRegion && matchesRisk && matchesSearch;
  });

  const supplierCars = selectedSupplier 
    ? cars.filter(c => c.supplierId === selectedSupplier.id)
    : [];

  const supplierAudits = selectedSupplier
    ? audits.filter(a => a.supplierId === selectedSupplier.id)
    : [];

  const handleExport = () => {
    const rows = filteredSuppliers.map(s => ({
      ID: s.id,
      Name: s.name,
      DUNS: s.duns,
      Commodity: s.commodity,
      Location: s.location,
      Region: s.region,
      Risk: s.riskCategory,
      Approval_Status: s.approvalStatus,
      PPM: s.ppm,
      OTD: `${s.otd}%`,
      Audit_Score: s.auditScore,
      Composite_Score: s.compositeScore,
      Tier: s.tier
    }));
    exportDataToCSV('Supplier_Master_Data_Hub', rows);
  };

  return (
    <div className="space-y-6 pb-8 relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white tracking-tight">
            Supplier Master Data Hub
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Single source of truth for Tier-1 supply base accreditations, contacts, and audit histories.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-[#1E293B] text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 rounded-lg text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            Export Master Hub
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
              Add Supplier
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-[#1E293B] p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Filters:
          </span>

          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            className="text-xs px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="All">All Regions</option>
            <option value="EU">Europe (EU)</option>
            <option value="NA">North America (NA)</option>
            <option value="APAC">Asia-Pacific (APAC)</option>
          </select>

          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="text-xs px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="All">All Risk Profiles</option>
            <option value="Low">Low Risk</option>
            <option value="Medium">Medium Risk</option>
            <option value="High">High Risk</option>
          </select>
        </div>

        <div className="w-full sm:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter suppliers by name or DUNS..."
            className="w-full text-xs px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none"
          />
        </div>
      </div>

      {/* Main Master Data Table */}
      <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 text-[11px] font-semibold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Supplier & ID</th>
                <th className="py-3 px-4">Commodity</th>
                <th className="py-3 px-4">Location / Region</th>
                <th className="py-3 px-4">DUNS Number</th>
                <th className="py-3 px-4">Risk Profile</th>
                <th className="py-3 px-4">Composite Score</th>
                <th className="py-3 px-4">Tier Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {filteredSuppliers.map((supplier) => (
                <tr
                  key={supplier.id}
                  onClick={() => setSelectedSupplier(supplier)}
                  className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer ${
                    selectedSupplier?.id === supplier.id ? 'bg-teal-50/50 dark:bg-teal-950/20' : ''
                  }`}
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

                  <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                    <div>{supplier.location}</div>
                    <span className="text-[10px] font-mono text-slate-400">{supplier.region}</span>
                  </td>

                  <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-300">
                    {supplier.duns}
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${
                        supplier.riskCategory === 'Low'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : supplier.riskCategory === 'Medium'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300'
                          : 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-300'
                      }`}
                    >
                      {supplier.riskCategory}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-mono font-semibold text-slate-800 dark:text-slate-200">
                    {supplier.compositeScore.toFixed(2)}
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700">
                      {supplier.tier}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => setSelectedSupplier(supplier)}
                      className="px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-teal-700 dark:hover:text-teal-400 text-[11px] font-medium rounded-md shadow-2xs hover:bg-slate-50 transition-colors inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>Profile</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-Over Drawer for Selected Supplier Profile */}
      {selectedSupplier && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-2xs flex justify-end">
          <div className="bg-white dark:bg-[#1E293B] w-full max-w-2xl h-full shadow-2xl overflow-y-auto p-6 flex flex-col justify-between border-l border-slate-200/80 dark:border-slate-800 animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div>
              <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded border border-teal-200 dark:border-teal-800">
                      {selectedSupplier.id}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      DUNS: {selectedSupplier.duns}
                    </span>
                  </div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white mt-1.5">
                    {selectedSupplier.name}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {selectedSupplier.location} • {selectedSupplier.commodity}
                  </p>
                </div>

                <button
                  onClick={() => setSelectedSupplier(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Bento Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-5">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] uppercase font-medium text-slate-400">Composite Score</span>
                  <div className="text-lg font-semibold text-teal-700 dark:text-teal-400 mt-1 font-mono">
                    {selectedSupplier.compositeScore} <span className="text-xs text-slate-400 font-normal">/ 5.0</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] uppercase font-medium text-slate-400">PPM Quality</span>
                  <div className={`text-lg font-semibold mt-1 font-mono ${selectedSupplier.ppm > 50 ? 'text-rose-600' : 'text-slate-900 dark:text-white'}`}>
                    {selectedSupplier.ppm}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] uppercase font-medium text-slate-400">On-Time Delivery</span>
                  <div className="text-lg font-semibold text-emerald-600 dark:text-emerald-400 mt-1 font-mono">
                    {selectedSupplier.otd}%
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] uppercase font-medium text-slate-400">Open CARs</span>
                  <div className="text-lg font-semibold text-slate-900 dark:text-white mt-1 font-mono">
                    {supplierCars.filter(c => c.status !== 'Verified Closed').length}
                  </div>
                </div>
              </div>

              {/* Accreditations Profile */}
              <div className="mb-5">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                  Accreditations & QMS Certificates
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedSupplier.accreditations.map((cert) => (
                    <div
                      key={cert.name}
                      className="p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-medium text-xs text-slate-900 dark:text-white">
                          {cert.name}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {cert.certNumber} • Exp: {cert.expiryDate}
                        </div>
                      </div>
                      <span
                        className={`text-[10px] font-medium px-2 py-0.5 rounded-md ${
                          cert.status === 'Valid'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : cert.status === 'Expiring 30D'
                            ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                            : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                        }`}
                      >
                        {cert.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Key Contacts */}
              <div className="mb-5">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                  Key Supplier Contacts
                </h4>
                <div className="space-y-2">
                  {selectedSupplier.contacts.map((contact, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-medium text-slate-900 dark:text-white">{contact.name}</span>
                        <span className="text-slate-400 text-[11px] ml-2">({contact.title})</span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                        <span>{contact.email}</span>
                        <span>{contact.phone}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Open CARs List */}
              {supplierCars.length > 0 && (
                <div className="mb-5">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                    Associated Corrective Actions (CARs)
                  </h4>
                  <div className="space-y-2">
                    {supplierCars.map((car) => (
                      <div
                        key={car.ref}
                        className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                      >
                        <div className="flex justify-between items-start">
                          <span className="font-mono font-semibold text-slate-900 dark:text-white">{car.ref}</span>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                            {car.status}
                          </span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 mt-1 text-[11px]">
                          {car.issue}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Drawer Footer Actions */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
              {canEdit('performance') && (
                <button
                  onClick={() => {
                    setPreselectedCarSupplierId(selectedSupplier.id);
                    setIsRaiseCarModalOpen(true);
                  }}
                  className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-medium shadow-xs cursor-pointer"
                >
                  Raise CAR / Review
                </button>
              )}

              {canEdit('suppliers') && (
                <button
                  onClick={() => {
                    setEditingSupplier(selectedSupplier);
                    setIsAddSupplierModalOpen(true);
                  }}
                  className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-medium shadow-xs cursor-pointer ml-auto"
                >
                  Edit Master Data
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
