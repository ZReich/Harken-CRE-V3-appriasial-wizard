/**
 * BonusDepreciationGuidance Component
 * 
 * Provides comprehensive guidance on bonus depreciation rules, eligibility,
 * phase-down schedule, and current tax year considerations.
 * 
 * References:
 * - Tax Cuts and Jobs Act (TCJA) of 2017
 * - IRC Section 168(k)
 * - IRS Publication 946
 */

import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Info,
  ChevronDown,
  ChevronRight,
  Calendar,
  TrendingDown,
  DollarSign,
  HelpCircle,
  Building2,
  Shield,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { getBonusDepreciationRate, formatCostSegCurrency, formatCostSegPercent } from '../../../services/costSegregationService';

interface BonusDepreciationGuidanceProps {
  taxYear?: number;
  eligibleAmount?: number;
  className?: string;
  defaultExpanded?: boolean;
  variant?: 'full' | 'compact' | 'inline';
}

// Bonus depreciation phase-down schedule per TCJA
const PHASE_DOWN_SCHEDULE = [
  { year: 2022, rate: 1.00, label: '100%', status: 'expired' as const },
  { year: 2023, rate: 0.80, label: '80%', status: 'expired' as const },
  { year: 2024, rate: 0.60, label: '60%', status: 'current' as const },
  { year: 2025, rate: 0.40, label: '40%', status: 'future' as const },
  { year: 2026, rate: 0.20, label: '20%', status: 'future' as const },
  { year: 2027, rate: 0.00, label: '0%', status: 'future' as const },
];

const ELIGIBILITY_CRITERIA = [
  {
    id: 'property-type',
    title: 'Eligible Property Types',
    eligible: [
      '5-year personal property (furniture, fixtures, equipment)',
      '7-year personal property (office equipment)',
      '15-year land improvements (parking lots, landscaping)',
      'Qualified Improvement Property (QIP) with proper election',
    ],
    ineligible: [
      '27.5-year residential rental real property (building structure)',
      '39-year nonresidential real property (building structure)',
      'Land (never depreciable)',
      'Used property not meeting "original use" requirements*',
    ],
    note: '*Used property may qualify if first use begins with the taxpayer',
  },
  {
    id: 'acquisition',
    title: 'Acquisition Requirements',
    requirements: [
      'Property must be acquired after September 27, 2017',
      'No binding written contract for acquisition before 9/28/2017',
      'Property must be placed in service before January 1, 2027',
      'For used property: First use must begin with the taxpayer',
    ],
  },
  {
    id: 'exclusions',
    title: 'Exclusions & Limitations',
    items: [
      'Property used in "floor plan financing" arrangements',
      'Property from related parties (>50% ownership)',
      'Tax-exempt use property',
      'Certain regulated utility property',
      'Property subject to a binding commitment before 9/28/2017',
    ],
  },
];

const FAQ_ITEMS = [
  {
    question: 'What is bonus depreciation?',
    answer: 'Bonus depreciation allows taxpayers to immediately deduct a large percentage of the cost of eligible property in the year it is placed in service, rather than depreciating it over its normal recovery period. For 2024, 60% of eligible property can be expensed immediately.',
  },
  {
    question: 'Can I elect out of bonus depreciation?',
    answer: 'Yes. Taxpayers can elect out of bonus depreciation on a class-by-class basis. This election is made on a timely filed return (including extensions) and is irrevocable without IRS consent.',
  },
  {
    question: 'Does bonus depreciation apply to building structures?',
    answer: 'No. Building structural components (39-year or 27.5-year property) are NOT eligible for bonus depreciation. Only the segregated 5-year, 7-year, and 15-year components qualify, which is why cost segregation is valuable.',
  },
  {
    question: 'What is the benefit of cost segregation with bonus depreciation?',
    answer: 'Cost segregation reclassifies portions of the building from 39/27.5-year property to shorter-lived property classes (5, 7, 15 years). These shorter-lived components are then eligible for bonus depreciation, significantly accelerating tax deductions.',
  },
  {
    question: 'Will bonus depreciation be extended?',
    answer: 'As of 2024, no extension has been enacted. The current law has bonus depreciation phasing down to 0% by 2027. Congress may consider extensions, but this is speculative and should not be relied upon for planning.',
  },
  {
    question: 'What about Qualified Improvement Property (QIP)?',
    answer: 'QIP is 15-year property and IS eligible for bonus depreciation (after the CARES Act correction). QIP includes interior improvements to nonresidential buildings made after the building was placed in service.',
  },
];

export const BonusDepreciationGuidance: React.FC<BonusDepreciationGuidanceProps> = ({
  taxYear = new Date().getFullYear(),
  eligibleAmount,
  className = '',
  defaultExpanded = false,
  variant = 'full',
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const currentRate = getBonusDepreciationRate(taxYear);
  const bonusAmount = eligibleAmount ? eligibleAmount * currentRate : null;
  const currentYearInfo = PHASE_DOWN_SCHEDULE.find(y => y.year === taxYear);

  // Compact variant for inline display
  if (variant === 'compact') {
    return (
      <div className={`bg-amber-50 border border-amber-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="font-medium text-amber-800 mb-1">
              {taxYear} Bonus Depreciation: {formatCostSegPercent(currentRate)}
            </div>
            <p className="text-sm text-amber-700">
              Eligible 5-year, 7-year, and 15-year property qualifies for first-year bonus depreciation.
              {currentRate < 1.0 && currentRate > 0 && (
                <span className="block mt-1 text-amber-600">
                  Note: Bonus depreciation phases down each year through 2026.
                </span>
              )}
            </p>
            {bonusAmount !== null && (
              <div className="mt-2 text-sm font-semibold text-amber-800">
                Potential Bonus Deduction: {formatCostSegCurrency(bonusAmount)}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Inline variant for minimal display
  if (variant === 'inline') {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2 py-1 bg-amber-100 text-amber-800 rounded text-sm ${className}`}>
        <Clock className="w-3.5 h-3.5" />
        {taxYear} Bonus: {formatCostSegPercent(currentRate)}
      </span>
    );
  }

  // Full variant (default)
  return (
    <div className={`bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden ${className}`}>
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-amber-50 to-amber-100/50 hover:from-amber-100/70 hover:to-amber-100 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center shadow-sm">
            <TrendingDown className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-lg">
              Bonus Depreciation Guidance
            </h3>
            <p className="text-sm text-slate-600 flex items-center gap-2">
              <span className="font-medium text-amber-700">{taxYear}: {formatCostSegPercent(currentRate)} Bonus Rate</span>
              <span className="text-slate-400">|</span>
              <span>Eligibility Rules & Phase-Down Schedule</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {currentRate === 0 && (
            <span className="px-2.5 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
              Not Available
            </span>
          )}
          {currentRate > 0 && currentRate < 1.0 && (
            <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
              Phased Down
            </span>
          )}
          {isExpanded ? (
            <ChevronDown className="w-5 h-5 text-slate-400" />
          ) : (
            <ChevronRight className="w-5 h-5 text-slate-400" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="divide-y divide-slate-100">
          {/* Current Year Summary */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Current Rate */}
              <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-xl p-5 border border-amber-200">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5 text-amber-600" />
                  <span className="text-sm font-semibold text-amber-800">Tax Year {taxYear}</span>
                </div>
                <div className="text-3xl font-bold text-amber-900 mb-1">
                  {formatCostSegPercent(currentRate)}
                </div>
                <div className="text-sm text-amber-700">
                  Bonus Depreciation Rate
                </div>
              </div>

              {/* Eligible Property */}
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl p-5 border border-emerald-200">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span className="text-sm font-semibold text-emerald-800">Eligible Property</span>
                </div>
                <div className="text-sm text-emerald-700 space-y-1">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5" />
                    <span>5-Year Personal Property</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5" />
                    <span>7-Year Personal Property</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>15-Year Land Improvements</span>
                  </div>
                </div>
              </div>

              {/* Ineligible Property */}
              <div className="bg-gradient-to-br from-red-50 to-red-100/50 rounded-xl p-5 border border-red-200">
                <div className="flex items-center gap-2 mb-2">
                  <XCircle className="w-5 h-5 text-red-600" />
                  <span className="text-sm font-semibold text-red-800">Not Eligible</span>
                </div>
                <div className="text-sm text-red-700 space-y-1">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>27.5-Year Residential</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>39-Year Commercial</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Land Value</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bonus Amount Calculation */}
            {bonusAmount !== null && eligibleAmount && (
              <div className="mt-4 bg-slate-50 rounded-xl p-4 border border-slate-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-5 h-5 text-slate-500" />
                    <div>
                      <div className="text-sm text-slate-600">
                        Eligible Property: {formatCostSegCurrency(eligibleAmount)}
                      </div>
                      <div className="text-xs text-slate-500">
                        × {formatCostSegPercent(currentRate)} bonus rate
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-emerald-600">
                      {formatCostSegCurrency(bonusAmount)}
                    </div>
                    <div className="text-xs text-slate-500">
                      First-Year Bonus Deduction
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Phase-Down Schedule */}
          <div className="p-6">
            <h4 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <TrendingDown className="w-4 h-4" />
              Bonus Depreciation Phase-Down Schedule (TCJA)
            </h4>
            
            <div className="grid grid-cols-6 gap-2">
              {PHASE_DOWN_SCHEDULE.map((item) => (
                <div
                  key={item.year}
                  className={`p-3 rounded-lg text-center border ${
                    item.status === 'current'
                      ? 'bg-amber-100 border-amber-300 ring-2 ring-amber-400'
                      : item.status === 'expired'
                      ? 'bg-slate-100 border-slate-200 opacity-60'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className={`text-xs font-medium ${
                    item.status === 'current' ? 'text-amber-700' : 'text-slate-500'
                  }`}>
                    {item.year}
                  </div>
                  <div className={`text-lg font-bold ${
                    item.status === 'current' 
                      ? 'text-amber-900' 
                      : item.rate === 0 
                      ? 'text-red-600'
                      : 'text-slate-700'
                  }`}>
                    {item.label}
                  </div>
                  {item.status === 'current' && (
                    <div className="text-xs text-amber-600 font-medium mt-1">
                      Current
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-blue-700">
                <strong>Important:</strong> These rates are based on when property is <em>placed in service</em>, 
                not when acquired. For planning purposes, property placed in service before year-end 
                qualifies for that year's bonus rate.
              </p>
            </div>
          </div>

          {/* Eligibility Criteria */}
          <div className="p-6">
            <h4 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Eligibility Requirements
            </h4>

            <div className="space-y-3">
              {ELIGIBILITY_CRITERIA.map((criterion) => (
                <div key={criterion.id} className="border border-slate-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setActiveSection(
                      activeSection === criterion.id ? null : criterion.id
                    )}
                    className="w-full px-4 py-3 flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition-colors text-left"
                  >
                    <span className="font-medium text-slate-900">{criterion.title}</span>
                    {activeSection === criterion.id ? (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                  
                  {activeSection === criterion.id && (
                    <div className="px-4 py-3 border-t border-slate-200">
                      {criterion.eligible && (
                        <div className="mb-3">
                          <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-2">
                            Eligible
                          </div>
                          <ul className="space-y-1">
                            {criterion.eligible.map((item, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {criterion.ineligible && (
                        <div className="mb-3">
                          <div className="text-xs font-semibold text-red-700 uppercase tracking-wide mb-2">
                            Not Eligible
                          </div>
                          <ul className="space-y-1">
                            {criterion.ineligible.map((item, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                                <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {criterion.requirements && (
                        <ul className="space-y-1">
                          {criterion.requirements.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                              <CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      )}
                      {criterion.items && (
                        <ul className="space-y-1">
                          {criterion.items.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                              <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      )}
                      {criterion.note && (
                        <p className="mt-2 text-xs text-slate-500 italic">{criterion.note}</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* FAQ Section */}
          <div className="p-6">
            <h4 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <HelpCircle className="w-4 h-4" />
              Frequently Asked Questions
            </h4>

            <div className="space-y-2">
              {FAQ_ITEMS.map((faq, idx) => (
                <div key={idx} className="border border-slate-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                    className="w-full px-4 py-3 flex items-start gap-3 hover:bg-slate-50 transition-colors text-left"
                  >
                    <HelpCircle className="w-4 h-4 text-[#0da1c7] mt-0.5 flex-shrink-0" />
                    <span className="font-medium text-slate-900 flex-1">{faq.question}</span>
                    {expandedFaq === idx ? (
                      <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    )}
                  </button>
                  
                  {expandedFaq === idx && (
                    <div className="px-4 py-3 border-t border-slate-200 bg-slate-50">
                      <p className="text-sm text-slate-600 leading-relaxed pl-7">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Disclaimer */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200">
            <div className="flex items-start gap-2 text-xs text-slate-500">
              <AlertCircle className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
              <p>
                <strong>Disclaimer:</strong> This guidance is for informational purposes only and does not 
                constitute tax advice. Tax laws change frequently. Consult with a qualified tax professional 
                or CPA for specific guidance regarding your situation. The analysis is based on current 
                interpretation of IRC Section 168(k) and related Treasury Regulations.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BonusDepreciationGuidance;
