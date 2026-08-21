import React from 'react';
import { useApp } from '../../context/AppContext';
import { X, BookOpen, ShieldCheck, Award, Truck, AlertTriangle, CheckCircle2, Download } from 'lucide-react';

export const StandardsDetailModal: React.FC = () => {
  const { selectedStandardsDoc, setSelectedStandardsDoc, exportDataToCSV } = useApp();

  if (!selectedStandardsDoc) return null;

  const getContent = () => {
    switch (selectedStandardsDoc) {
      case 'iatf':
        return {
          title: 'IATF 16949:2016 — Clause 8.4 Control of Externally Provided Processes, Products and Services',
          subtitle: 'Automotive Quality Management Standard',
          badge: 'Mandatory Compliance',
          sections: [
            {
              heading: '8.4.1 General & Type-Approval Statutory Conformity',
              body: 'The organization must ensure that externally provided processes, products, and services conform to specified statutory, regulatory, and customer requirements (Conformity of Production). All automotive suppliers must maintain an active third-party ISO 9001 certification and a roadmap towards IATF 16949 compliance.'
            },
            {
              heading: '8.4.1.2 Supplier Selection Process',
              body: 'Requires an integrated, cross-functional supplier evaluation including: risk assessment to product conformity, quality performance history, volume capability, evaluation of software/functional safety (ISO 26262), and financial stability verification.'
            },
            {
              heading: '8.4.2.3 Automotive QMS Development (CoP Requirement)',
              body: 'Mandatory progression for sub-tier suppliers: Step 1: ISO 9001 via accredited certification bodies -> Step 2: MAQMSR (Minimum Automotive Quality Management System Requirements) -> Step 3: Full IATF 16949 third-party certification.'
            },
            {
              heading: '8.4.2.4 Second-Party Audits',
              body: 'Annual second-party audits must be integrated into supplier management based on risk: supplier risk assessments, on-site VDA 6.3 process audits, product audits, and special process evaluations (CQI-9, CQI-11, CQI-12).'
            }
          ]
        };
      case 'ford-q1':
        return {
          title: 'Ford Q1 & Supplier Improvement Metrics (SIM) Standard',
          subtitle: 'OEM Supplier Excellence Framework',
          badge: 'OEM Target Spec',
          sections: [
            {
              heading: '1. Quality Performance Thresholds',
              body: 'Suppliers must achieve zero repeat quality rejections and maintain fleet PPM below 20 PPM over a consecutive 6-month evaluation period.'
            },
            {
              heading: '2. 100% On-Time Delivery Discipline',
              body: 'No production interruptions at Tier-1 or OEM assembly facilities. Zero unauthorized premium freight occurrences; 100% advance shipping notices (ASNs) sent within 15 minutes of vehicle departure.'
            },
            {
              heading: '3. 8D Problem Solving Responsiveness',
              body: 'Mandatory initial containment (D3) within 24 hours of notification; root cause (D4) and permanent corrective action (D5/D6) verified and submitted within 14 calendar days.'
            },
            {
              heading: '4. APQP / PPAP First-Time-Through',
              body: 'Level 3 PPAP warrant approval required on initial submission with Cpk > 1.67 for critical characteristics.'
            }
          ]
        };
      case 'mmog-le':
        return {
          title: 'MMOG/LE v6 — Materials Management Operations Guideline',
          subtitle: 'Global Supply Chain & Logistics Assessment Standard',
          badge: 'Logistics Benchmark',
          sections: [
            {
              heading: 'Chapter 1: Strategy and Business Planning',
              body: 'Evaluation of supply chain contingency plans, capacity planning models, and automated ERP scheduling integrations.'
            },
            {
              heading: 'Chapter 2: Work Organization & Human Resources',
              body: 'Standard work instructions for packaging, material handling ergonomics, operator qualification matrices, and inventory control.'
            },
            {
              heading: 'Chapter 3: Capacity & Resource Management',
              body: 'Bottleneck monitoring, OEE tracking, maintenance downtime contingency protocols, and supply chain buffer sizing.'
            },
            {
              heading: 'Chapter 4: Customer Interface & Delivery Integrity',
              body: 'Electronic Data Interchange (EDI) standards, barcode packaging compliance, corrosion prevention bags, and FIFO stock rotation.'
            }
          ]
        };
      case 'escalation':
        return {
          title: 'Tier-1 Quality Escalation & Controlled Shipping Framework',
          subtitle: 'Corrective Action Governance',
          badge: 'Risk Containment',
          sections: [
            {
              heading: 'Level 1: Engineering Warning (PPM > 50 or Repeat Minor Issue)',
              body: 'Supplier quality engineer issues formal notification. Supplier must submit D3 containment within 24 hours and weekly progress updates.'
            },
            {
              heading: 'Level 2: Controlled Shipping Level 1 (CSL-1)',
              body: 'Supplier conducts 100% redundant offline inspection by dedicated quality inspectors at their own manufacturing plant prior to shipment.'
            },
            {
              heading: 'Level 3: Controlled Shipping Level 2 (CSL-2)',
              body: 'Third-party certified sorting agency is contracted at the supplier’s expense to inspect 100% of outgoing parts. Weekly executive reviews with Purchasing Director.'
            },
            {
              heading: 'Level 4: New Business Hold (NBH) & De-Sourcing',
              body: 'Supplier is placed on global NBH. Immediate qualification of alternate secondary source begins. Removal from Tier-1 Approved Supplier List.'
            }
          ]
        };
      default:
        return null;
    }
  };

  const doc = getContent();
  if (!doc) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-2xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#1E293B] rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-slate-200/80 dark:border-slate-800 max-h-[85vh] overflow-y-auto animate-in zoom-in-95 duration-150 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-200/60 dark:border-teal-800">
                {doc.badge}
              </span>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white mt-1">
                {doc.title}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">{doc.subtitle}</p>
            </div>

            <button
              onClick={() => setSelectedStandardsDoc(null)}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-3.5 my-5">
            {doc.sections.map((sec, idx) => (
              <div key={idx} className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-800">
                <h4 className="text-xs font-semibold text-slate-900 dark:text-white flex items-center gap-1.5 mb-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 flex-shrink-0" />
                  {sec.heading}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pl-5">
                  {sec.body}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            Tier-1 Quality Compliance Reference Document
          </span>

          <button
            onClick={() => setSelectedStandardsDoc(null)}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-medium shadow-xs transition-colors"
          >
            Close Document
          </button>
        </div>
      </div>
    </div>
  );
};
