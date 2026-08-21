import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  BookOpen, 
  ShieldCheck, 
  Award, 
  Truck, 
  AlertTriangle, 
  ChevronRight, 
  ExternalLink, 
  FileText, 
  Layers,
  HelpCircle
} from 'lucide-react';

interface StandardCard {
  key: string;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  tag: string;
  summary: string;
  keyPoints: string[];
}

const STANDARDS: StandardCard[] = [
  {
    key: 'iatf',
    title: 'IATF 16949 Clause 8.4',
    subtitle: 'Control of Externally Provided Products & Services',
    icon: ShieldCheck,
    tag: 'Core Standard',
    summary: 'Defines mandatory automotive requirements for supplier QMS development, type-approval compliance, and Conformity of Production (CoP) verification.',
    keyPoints: [
      'Clause 8.4.1.2: Strict supplier selection and onboarding criteria',
      'Clause 8.4.2.1: Type-approval and statutory conformity of production',
      'Clause 8.4.2.3: Mandatory automotive QMS development roadmap',
      'Clause 8.4.2.4: Second-party audits (VDA 6.3 / CoP verification)'
    ]
  },
  {
    key: 'ford-q1',
    title: 'Ford Q1 & SIM Framework',
    subtitle: 'OEM Supplier Excellence Certification',
    icon: Award,
    tag: 'OEM Benchmark',
    summary: 'Rigorous standard benchmarking supplier quality metrics, Supplier Improvement Metrics (SIM), and ongoing delivery excellence.',
    keyPoints: [
      'Zero-defect mindset with < 20 PPM expectation',
      '100% on-time delivery without expedited freight incidents',
      'Disciplined 8D problem-solving turnaround within 14 days',
      'Continuous APQP / PPAP Level 3 capability'
    ]
  },
  {
    key: 'mmog-le',
    title: 'MMOG/LE v6',
    subtitle: 'Materials Management Operations Guideline',
    icon: Truck,
    tag: 'Logistics Standard',
    summary: 'Global automotive guideline for supply chain management, EDI integration, packaging integrity, and delivery risk prevention.',
    keyPoints: [
      'Level A (≥90%): Benchmark world-class supply chain execution',
      'Automated ASN transmission & real-time inventory tracking',
      'Contingency disaster recovery & capacity planning',
      'Packaging compliance & corrosion mitigation standard'
    ]
  },
  {
    key: 'escalation',
    title: 'Escalation Framework',
    subtitle: 'Automotive Quality Containment & CSL',
    icon: AlertTriangle,
    tag: 'Governance',
    summary: 'Four-tier progressive intervention framework when supplier CoP compliance, PPM thresholds, or audit ratings deteriorate.',
    keyPoints: [
      'Level 1: Engineering Alert & mandatory 8D submission within 48h',
      'Level 2: Controlled Shipping Level 1 (CSL-1) 100% internal sort',
      'Level 3: Controlled Shipping Level 2 (CSL-2) 3rd-party sorting',
      'Level 4: New Business Hold (NBH) and sourcing review'
    ]
  }
];

const KPI_DEFINITIONS = [
  {
    kpi: 'Parts Per Million (PPM)',
    formula: '(Total Defective Parts / Total Parts Shipped) × 1,000,000',
    target: '≤ 50 PPM (Tier-1 fleet target: ≤ 20 PPM)',
    trigger: '> 50 PPM triggers mandatory CAR logging'
  },
  {
    kpi: 'On-Time Delivery (OTD)',
    formula: '(On-Time Shipments / Total Scheduled Shipments) × 100',
    target: '≥ 98.0%',
    trigger: '< 95.0% requires root cause action plan'
  },
  {
    kpi: 'VDA 6.3 Audit Score',
    formula: 'Evaluated Process Compliance Points / Total Max Points × 100',
    target: '≥ 90% (Grade A - Quality Capable)',
    trigger: '< 80% (Grade C - De-source / Immediate CSL)'
  },
  {
    kpi: 'SCAR Closure Time',
    formula: 'Time elapsed from initial incident notification to 8D verification',
    target: '< 30 Calendar Days',
    trigger: '> 45 Days escalated to Purchasing Leadership'
  },
  {
    kpi: 'PPAP First-Time-Through (FTT)',
    formula: '(Approved PPAPs on 1st submission / Total PPAPs submitted) × 100',
    target: '≥ 92%',
    trigger: '< 80% triggers on-site APQP audit'
  }
];

export const StandardsLibraryScreen: React.FC = () => {
  const { setSelectedStandardsDoc } = useApp();

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-slate-900 dark:text-white tracking-tight">
          Standards & Compliance Library
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Authoritative reference manuals for IATF 16949, VDA 6.3, MMOG/LE, and OEM quality governance.
        </p>
      </div>

      {/* Standards Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {STANDARDS.map((std) => {
          const IconComp = std.icon;

          return (
            <div
              key={std.key}
              onClick={() => setSelectedStandardsDoc(std.key)}
              className="bg-white dark:bg-[#1E293B] p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-teal-500/50 dark:hover:border-teal-500/50 transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 flex items-center justify-center border border-teal-100 dark:border-teal-900/50">
                      <IconComp className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-slate-900 dark:text-white group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">
                        {std.title}
                      </h3>
                      <p className="text-[11px] text-slate-400">{std.subtitle}</p>
                    </div>
                  </div>

                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700">
                    {std.tag}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                  {std.summary}
                </p>

                <div className="space-y-1.5 border-t border-slate-100 dark:border-slate-800/80 pt-3">
                  {std.keyPoints.map((pt, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-500 flex-shrink-0" />
                      <span className="truncate">{pt}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-teal-700 dark:text-teal-400 font-medium group-hover:underline">
                <span>View Full Standard & Guidelines</span>
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          );
        })}
      </div>

      {/* KPI Definitions & Benchmarks Table */}
      <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            Automotive KPI Definitions & Benchmark Thresholds
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Formulas and escalation triggers used across the Tier-1 purchasing division.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 text-[11px] font-semibold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">KPI Metric</th>
                <th className="py-3 px-4">Measurement Formula</th>
                <th className="py-3 px-4">Tier-1 Benchmark Target</th>
                <th className="py-3 px-4">Action Trigger</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {KPI_DEFINITIONS.map((def, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="py-3.5 px-4 font-medium text-slate-900 dark:text-white">
                    {def.kpi}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                    {def.formula}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-teal-700 dark:text-teal-400">
                    {def.target}
                  </td>
                  <td className="py-3.5 px-4 text-rose-600 dark:text-rose-400 font-medium">
                    {def.trigger}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
