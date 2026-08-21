import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ShieldCheck, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Award, 
  Plus, 
  Download, 
  Eye, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  ChevronRight,
  Filter
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend,
  ReferenceLine
} from 'recharts';

export const DashboardScreen: React.FC = () => {
  const { 
    suppliers, 
    cars, 
    audits, 
    activities, 
    setActiveScreen, 
    setPerformanceTab, 
    setSelectedSupplier, 
    setIsAddSupplierModalOpen,
    canEdit,
    exportDataToCSV
  } = useApp();

  const [filterCommodity, setFilterCommodity] = useState<string>('All');

  // KPI Calculations
  const approvedCount = suppliers.filter(s => s.approvalStatus === 'Approved').length;
  const avgScorecard = Number((suppliers.reduce((acc, s) => acc + (s.compositeScore * 20), 0) / (suppliers.length || 1)).toFixed(1));
  const fleetPpm = Math.round(suppliers.reduce((acc, s) => acc + s.ppm, 0) / (suppliers.length || 1));
  const openCars = cars.filter(c => c.status !== 'Verified Closed').length;

  // Chart Data: PPM Trend (Jan - Jun)
  const ppmTrendData = [
    { month: 'Jan', fleetPpm: 42, target: 50 },
    { month: 'Feb', fleetPpm: 45, target: 50 },
    { month: 'Mar', fleetPpm: 48, target: 50 },
    { month: 'Apr', fleetPpm: 52, target: 50 },
    { month: 'May', fleetPpm: 55, target: 50 },
    { month: 'Jun', fleetPpm: fleetPpm, target: 50 },
  ];

  // Chart Data: Tier Distribution
  const tierCounts: Record<string, number> = {
    'Tier 1 (Preferred)': suppliers.filter(s => s.compositeScore >= 4.0).length,
    'Tier 1 (Approved)': suppliers.filter(s => s.compositeScore >= 3.0 && s.compositeScore < 4.0).length,
    'Tier 2 (Conditional)': suppliers.filter(s => s.compositeScore >= 2.0 && s.compositeScore < 3.0).length,
    'Tier 3 / At Risk': suppliers.filter(s => s.compositeScore < 2.0).length,
  };

  const tierChartData = [
    { name: 'Tier 1 (Preferred)', value: tierCounts['Tier 1 (Preferred)'], color: '#00685f' },
    { name: 'Tier 1 (Approved)', value: tierCounts['Tier 1 (Approved)'], color: '#008378' },
    { name: 'Tier 2 (Conditional)', value: tierCounts['Tier 2 (Conditional)'], color: '#2170e4' },
    { name: 'Tier 3 / At Risk', value: tierCounts['Tier 3 / At Risk'], color: '#ba1a1a' },
  ].filter(d => d.value > 0);

  // Filtered table data
  const filteredSuppliers = filterCommodity === 'All' 
    ? suppliers 
    : suppliers.filter(s => s.commodity.toLowerCase().includes(filterCommodity.toLowerCase()));

  const handleExportDashboard = () => {
    const rows = suppliers.map(s => ({
      Supplier_ID: s.id,
      Name: s.name,
      Commodity: s.commodity,
      Approval_Status: s.approvalStatus,
      PPM: s.ppm,
      OTD_Percent: `${s.otd}%`,
      Audit_Score: s.auditScore,
      Composite_Score: s.compositeScore,
      Tier: s.tier
    }));
    exportDataToCSV('Tier1_Compliance_Summary_Report', rows);
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Page Header & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time Conformity of Production (CoP) & Quality compliance metrics across Tier-1 supply base.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportDashboard}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-[#1E293B] text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 rounded-lg text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            Export Report
          </button>

          {canEdit('suppliers') && (
            <button
              onClick={() => setIsAddSupplierModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-medium transition-colors shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Supplier
            </button>
          )}
        </div>
      </div>

      {/* KPI Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Approved Suppliers */}
        <div
          onClick={() => setActiveScreen('approval')}
          className="bg-white dark:bg-[#1E293B] p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer group"
        >
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Approved Suppliers
            </span>
            <div className="p-1.5 bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 rounded-lg">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-semibold text-slate-900 dark:text-white tracking-tight">
              {approvedCount} <span className="text-xs font-normal text-slate-400">/ {suppliers.length}</span>
            </div>
            <div className="flex items-center gap-1 mt-1 text-teal-600 dark:text-teal-400 text-xs font-medium">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+2 verified this month</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Avg Scorecard Rating */}
        <div
          onClick={() => {
            setActiveScreen('performance');
            setPerformanceTab('scorecard');
          }}
          className="bg-white dark:bg-[#1E293B] p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer group"
        >
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Avg Scorecard Rating
            </span>
            <div className="p-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-semibold text-slate-900 dark:text-white tracking-tight">
              {avgScorecard}<span className="text-xs font-normal text-slate-400">/100</span>
            </div>
            <div className="flex items-center gap-1 mt-1 text-slate-500 dark:text-slate-400 text-xs font-normal">
              <span className="w-1.5 h-0.5 bg-slate-400 inline-block" />
              <span>Steady vs last quarter (4.62 / 5.0)</span>
            </div>
          </div>
        </div>

        {/* KPI 3: Fleet PPM (Alert Border) */}
        <div
          onClick={() => {
            setActiveScreen('performance');
            setPerformanceTab('scorecard');
          }}
          className="bg-white dark:bg-[#1E293B] p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer relative overflow-hidden group"
        >
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Fleet PPM
            </span>
            <div className="p-1.5 bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 rounded-lg">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-semibold text-rose-600 dark:text-rose-400 tracking-tight">
              {fleetPpm}
            </div>
            <div className="flex items-center gap-1 mt-1 text-rose-600 dark:text-rose-400 text-xs font-medium">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Target: ≤ 50 PPM</span>
            </div>
          </div>
        </div>

        {/* KPI 4: Open Corrective Actions */}
        <div
          onClick={() => {
            setActiveScreen('performance');
            setPerformanceTab('car');
          }}
          className="bg-white dark:bg-[#1E293B] p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer group"
        >
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Open Corrective Actions (CARs)
            </span>
            <div className="p-1.5 bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 rounded-lg">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-semibold text-slate-900 dark:text-white tracking-tight">
              {openCars}
            </div>
            <div className="flex items-center gap-1 mt-1 text-teal-600 dark:text-teal-400 text-xs font-medium">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>{cars.filter(c => c.status === '8D Submitted').length} 8D reports submitted</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section: PPM Trend vs Target & Supplier Tier Doughnut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Line Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-[#1E293B] p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                PPM Trend vs Target
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Monthly average Fleet Parts Per Million (PPM) variance against industry target.
              </p>
            </div>
            <span className="text-[11px] font-medium px-2 py-0.5 bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 rounded-md border border-teal-200 dark:border-teal-800">
              Target: 50 PPM
            </span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ppmTrendData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} domain={[0, 80]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                    border: '1px solid #1E293B'
                  }}
                  itemStyle={{ color: '#2dd4bf' }}
                />
                <ReferenceLine y={50} stroke="#0d9488" strokeDasharray="5 5" label={{ value: 'Target 50 PPM', fill: '#0d9488', fontSize: 10, position: 'top' }} />
                <Line
                  type="monotone"
                  dataKey="fleetPpm"
                  name="Fleet Average PPM"
                  stroke="#f43f5e"
                  strokeWidth={2}
                  dot={{ r: 3.5, fill: '#f43f5e' }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Supplier Tiers Doughnut Chart */}
        <div className="bg-white dark:bg-[#1E293B] p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col">
          <div className="flex justify-between items-center mb-2">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Supplier Tiers
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Classification based on composite score.
              </p>
            </div>
          </div>

          <div className="h-56 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={tierChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                  onClick={() => {
                    setActiveScreen('approval');
                  }}
                  className="cursor-pointer"
                >
                  {tierChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                    border: '1px solid #1E293B'
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  wrapperStyle={{ fontSize: '11px', color: '#64748b' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between text-xs text-slate-500">
            <span>Total Evaluated: {suppliers.length}</span>
            <button 
              onClick={() => setActiveScreen('performance')}
              className="text-teal-600 dark:text-teal-400 font-medium hover:underline flex items-center gap-0.5"
            >
              View Scorecards <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Success Criteria Tracker & Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Success Criteria Tracker Table (2 cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Success Criteria Tracker
              </h3>
              <p className="text-xs text-slate-400">
                Key suppliers against strict automotive threshold targets.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={filterCommodity}
                onChange={(e) => setFilterCommodity(e.target.value)}
                className="text-xs px-2.5 py-1 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none"
              >
                <option value="All">All Commodities</option>
                <option value="Powertrain">Powertrain</option>
                <option value="Electrical">Electrical</option>
                <option value="Plastics">Plastics</option>
                <option value="Chassis">Chassis</option>
                <option value="Sensors">Sensors</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 text-[11px] font-semibold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="py-2.5 px-4">Supplier Name</th>
                  <th className="py-2.5 px-4">Commodity</th>
                  <th className="py-2.5 px-4">Audit Status</th>
                  <th className="py-2.5 px-4">PPM (Current)</th>
                  <th className="py-2.5 px-4">Scorecard</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                {filteredSuppliers.slice(0, 5).map((supplier) => {
                  const isProbation = supplier.ppm > 50 || supplier.approvalStatus === 'Rejected';
                  const isUnderReview = supplier.approvalStatus === 'Under Review' || supplier.approvalStatus === 'Pending';

                  return (
                    <tr
                      key={supplier.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer"
                      onClick={() => {
                        setSelectedSupplier(supplier);
                        setActiveScreen('master-data');
                      }}
                    >
                      <td className="py-3 px-4 font-mono font-medium text-teal-700 dark:text-teal-400 group-hover:underline">
                        {supplier.name}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                        {supplier.commodity}
                      </td>
                      <td className="py-3 px-4">
                        {supplier.approvalStatus === 'Approved' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800">
                            <CheckCircle2 className="w-3 h-3" /> Approved
                          </span>
                        )}
                        {isProbation && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800">
                            <AlertTriangle className="w-3 h-3" /> Probation
                          </span>
                        )}
                        {isUnderReview && !isProbation && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800">
                            <Clock className="w-3 h-3" /> Under Review
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`font-mono ${supplier.ppm > 50 ? 'text-rose-600 font-semibold' : 'text-slate-800 dark:text-slate-200'}`}>
                          {supplier.ppm}
                        </span>
                        <span className="text-[10px] text-slate-400 ml-1.5">(Target: 50)</span>
                      </td>
                      <td className="py-3 px-4 font-mono">
                        <span className={supplier.compositeScore >= 4.0 ? 'text-emerald-600 dark:text-emerald-400 font-medium' : supplier.compositeScore >= 3.0 ? 'text-teal-600 dark:text-teal-400' : 'text-rose-600 font-medium'}>
                          {(supplier.compositeScore * 20).toFixed(0)}/100
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSupplier(supplier);
                            setActiveScreen('master-data');
                          }}
                          className="p-1 text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                          title="View Master Profile"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activity Feed (1 col) */}
        <div className="bg-white dark:bg-[#1E293B] p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Recent Activity Feed
            </h3>
            <span className="text-[11px] text-teal-600 dark:text-teal-400 font-medium">
              Live Feed
            </span>
          </div>

          <div className="space-y-4 flex-1 overflow-y-auto max-h-80 pr-1">
            {activities.map((activity) => (
              <div
                key={activity.id}
                onClick={() => {
                  if (activity.linkScreen) setActiveScreen(activity.linkScreen);
                }}
                className="flex items-start gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer group"
              >
                <div className="w-2 h-2 rounded-full bg-teal-500 mt-1.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <p className="text-xs font-medium text-slate-800 dark:text-slate-200 group-hover:text-teal-700 dark:group-hover:text-teal-300 truncate">
                      {activity.title}
                    </p>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap">
                      {activity.timestamp}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2 leading-tight">
                    {activity.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <button
              onClick={() => setActiveScreen('performance')}
              className="text-xs text-teal-600 dark:text-teal-400 font-medium hover:underline flex items-center gap-1"
            >
              View Audit Schedules & CARs <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
