/**
 * CostSegTab Component
 * 
 * Main tab component for Cost Segregation within the Analysis page.
 * Provides options to generate analysis, review results, or skip if not needed.
 */

import React, { useState } from 'react';
import {
  Calculator,
  ChevronRight,
  Building2,
  Clock,
  AlertTriangle,
  CheckCircle2,
  SkipForward,
  TrendingUp,
  HelpCircle,
  RefreshCw,
  DollarSign,
  FileText,
  AlertCircle,
  Zap,
} from 'lucide-react';
import { useCostSegAnalysis } from '../../../hooks/useCostSegAnalysis';
import { formatCostSegCurrency, formatCostSegPercent, getBonusDepreciationRate } from '../../../services/costSegregationService';
import { CostSegOverview } from './CostSegOverview';
import { ComponentClassifier } from './ComponentClassifier';
import { DepreciationSchedule } from './DepreciationSchedule';
import { BuildingSystems } from './BuildingSystems';
import { BonusDepreciationGuidance } from './BonusDepreciationGuidance';
import { ClassificationGuidance } from './ClassificationGuidance';
import type { DepreciationClass } from '../../../constants/costSegregation';

type TabView = 'overview' | 'components' | 'schedule' | 'systems' | 'guidance';

interface CostSegTabProps {
  className?: string;
}

export const CostSegTab: React.FC<CostSegTabProps> = ({ className = '' }) => {
  const [activeView, setActiveView] = useState<TabView>('overview');
  const [isSkipped, setIsSkipped] = useState(false);
  const [showGuidance, setShowGuidance] = useState(false);
  
  const {
    analysis,
    isReady,
    canGenerate,
    isCostSegEnabled,
    hasCostApproach,
    isCostApproachComplete,
    isGenerating,
    error,
    generate,
    applyOverride,
    resetOverrides,
    summary,
    missingData,
    validationErrors,
  } = useCostSegAnalysis();

  const currentYear = new Date().getFullYear();
  const bonusRate = getBonusDepreciationRate(currentYear);

  // Handle skip
  const handleSkip = () => {
    setIsSkipped(true);
  };

  const handleUnskip = () => {
    setIsSkipped(false);
  };

  // Handle override
  const handleOverride = (componentId: string, newClass: DepreciationClass, reason?: string) => {
    applyOverride(componentId, newClass, reason);
  };

  // If skipped, show minimal UI with option to undo
  if (isSkipped) {
    return (
      <div className={`flex flex-col items-center justify-center h-full p-8 ${className}`}>
        <div className="max-w-lg text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <SkipForward className="w-8 h-8 text-slate-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Cost Segregation Skipped
          </h2>
          <p className="text-slate-600 mb-6">
            You've chosen to skip the Cost Segregation analysis for this appraisal.
            The Cost Segregation report will not be generated.
          </p>
          <button
            onClick={handleUnskip}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#0da1c7] text-white rounded-xl hover:bg-[#0b8eb1] transition-colors font-medium"
          >
            <RefreshCw className="w-5 h-5" />
            Enable Cost Segregation
          </button>
        </div>
      </div>
    );
  }

  // If not enabled or missing prerequisites, show info/requirements
  if (!isCostSegEnabled || !hasCostApproach) {
    return (
      <div className={`flex flex-col items-center justify-center h-full p-8 ${className}`}>
        <div className="max-w-lg text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-8 h-8 text-amber-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Cost Segregation Not Available
          </h2>
          <p className="text-slate-600 mb-6">
            {!isCostSegEnabled 
              ? 'Cost Segregation is not enabled for this appraisal. Enable it in the Setup page under "Optional Add-on Reports".'
              : 'Cost Segregation requires the Cost Approach. Please select Cost Approach in at least one scenario.'}
          </p>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left">
            <h4 className="font-medium text-slate-900 mb-2 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-slate-400" />
              Requirements:
            </h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex items-center gap-2">
                {isCostSegEnabled 
                  ? <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  : <AlertCircle className="w-4 h-4 text-amber-500" />}
                Cost Segregation enabled in Setup
              </li>
              <li className="flex items-center gap-2">
                {hasCostApproach 
                  ? <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  : <AlertCircle className="w-4 h-4 text-amber-500" />}
                Cost Approach selected in scenario
              </li>
              <li className="flex items-center gap-2">
                {isCostApproachComplete 
                  ? <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  : <AlertCircle className="w-4 h-4 text-amber-500" />}
                Cost Approach analysis completed
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // If enabled but Cost Approach not complete
  if (!isCostApproachComplete) {
    return (
      <div className={`flex flex-col h-full p-6 ${className}`}>
        {/* Header with skip option */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Cost Segregation</h2>
            <p className="text-slate-600">Generate IRS-compliant depreciation analysis</p>
          </div>
          <button
            onClick={handleSkip}
            className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors text-sm"
          >
            <SkipForward className="w-4 h-4" />
            Skip this step
          </button>
        </div>

        {/* Waiting for Cost Approach */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="max-w-lg text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Clock className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              Waiting for Cost Approach
            </h3>
            <p className="text-slate-600 mb-6">
              Complete the Cost Approach analysis first. The Cost Segregation study uses 
              building cost data from the Cost Approach to allocate components to IRS 
              depreciation classes.
            </p>
            
            {/* What to expect */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left mb-6">
              <h4 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-500" />
                What Cost Segregation Provides:
              </h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span>Component allocation to 5-year, 15-year, and 39-year depreciation classes</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span>Year-by-year MACRS depreciation schedule</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span>Bonus depreciation calculations for {currentYear} ({formatCostSegPercent(bonusRate)} rate)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span>Professional PDF report for tax advisor use</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => setShowGuidance(true)}
              className="inline-flex items-center gap-2 text-[#0da1c7] hover:text-[#0b8eb1] text-sm font-medium"
            >
              <HelpCircle className="w-4 h-4" />
              Learn about Cost Segregation
            </button>
          </div>
        </div>

        {/* Guidance Modal */}
        {showGuidance && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">Cost Segregation Guide</h3>
                <button
                  onClick={() => setShowGuidance(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <span className="sr-only">Close</span>
                  ×
                </button>
              </div>
              <div className="p-6 space-y-6">
                <BonusDepreciationGuidance defaultExpanded />
                <ClassificationGuidance />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Main view - ready for analysis
  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <Calculator className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Cost Segregation</h2>
              <p className="text-sm text-slate-600">
                IRS-compliant depreciation analysis • {currentYear} Tax Year
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowGuidance(true)}
              className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors text-sm"
            >
              <HelpCircle className="w-4 h-4" />
              Guidance
            </button>
            <button
              onClick={handleSkip}
              className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors text-sm"
            >
              <SkipForward className="w-4 h-4" />
              Skip
            </button>
          </div>
        </div>

        {/* Sub-navigation */}
        {analysis && (
          <div className="flex items-center gap-1 mt-4 -mb-4 border-b border-slate-200">
            {[
              { id: 'overview' as const, label: 'Overview', icon: FileText },
              { id: 'components' as const, label: 'Components', icon: Zap },
              { id: 'schedule' as const, label: 'Schedule', icon: Clock },
              { id: 'systems' as const, label: 'Building Systems', icon: Building2 },
              { id: 'guidance' as const, label: 'Guidance', icon: HelpCircle },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
                  activeView === tab.id
                    ? 'border-[#0da1c7] text-[#0da1c7]'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {!analysis ? (
          /* Generate Analysis View */
          <div className="max-w-2xl mx-auto">
            {/* Quick Stats Preview */}
            {summary && (
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                    Total Cost
                  </div>
                  <div className="text-lg font-bold text-slate-900">
                    {formatCostSegCurrency(summary.totalProjectCost)}
                  </div>
                </div>
                <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
                  <div className="text-xs text-emerald-600 uppercase tracking-wide mb-1">
                    Est. Accelerated
                  </div>
                  <div className="text-lg font-bold text-emerald-700">
                    ~{formatCostSegPercent(0.15)}
                  </div>
                </div>
                <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                  <div className="text-xs text-amber-600 uppercase tracking-wide mb-1">
                    Bonus Rate
                  </div>
                  <div className="text-lg font-bold text-amber-700">
                    {formatCostSegPercent(bonusRate)}
                  </div>
                </div>
              </div>
            )}

            {/* Generate Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-8 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <TrendingUp className="w-10 h-10 text-emerald-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">
                  Generate Cost Segregation Analysis
                </h3>
                <p className="text-slate-600 mb-6 max-w-md mx-auto">
                  Analyze building components and allocate costs to IRS depreciation classes
                  for accelerated tax benefits.
                </p>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6 text-sm text-red-700 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    {error}
                  </div>
                )}

                {missingData.length > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 text-left">
                    <div className="font-medium text-amber-800 mb-2 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Missing Data
                    </div>
                    <ul className="text-sm text-amber-700 space-y-1">
                      {missingData.map((item, idx) => (
                        <li key={idx}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <button
                  onClick={generate}
                  disabled={!canGenerate || isGenerating}
                  className={`inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-lg transition-all ${
                    canGenerate && !isGenerating
                      ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/25'
                      : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  {isGenerating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Calculator className="w-5 h-5" />
                      Generate Analysis
                    </>
                  )}
                </button>
              </div>

              {/* Bonus Depreciation Note */}
              <div className="px-8 py-4 bg-amber-50 border-t border-amber-200">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-5 h-5 text-amber-600 flex-shrink-0" />
                  <div className="text-sm text-amber-700">
                    <strong>{currentYear} Bonus Depreciation: {formatCostSegPercent(bonusRate)}</strong>
                    <span className="text-amber-600"> — Eligible 5-year, 7-year, and 15-year property qualifies for first-year bonus.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Analysis Results Views */
          <>
            {activeView === 'overview' && (
              <CostSegOverview
                analysis={analysis}
                onGenerate={generate}
                onViewDetails={() => setActiveView('components')}
                onViewSchedule={() => setActiveView('schedule')}
              />
            )}
            {activeView === 'components' && (
              <ComponentClassifier
                analysis={analysis}
                onOverride={handleOverride}
                onResetAll={resetOverrides}
              />
            )}
            {activeView === 'schedule' && (
              <DepreciationSchedule analysis={analysis} />
            )}
            {activeView === 'systems' && (
              <BuildingSystems analysis={analysis} />
            )}
            {activeView === 'guidance' && (
              <div className="space-y-6">
                <BonusDepreciationGuidance
                  eligibleAmount={(summary?.fiveYearTotal ?? 0) + (summary?.fifteenYearTotal ?? 0)}
                  defaultExpanded
                />
                <ClassificationGuidance showExamples />
              </div>
            )}
          </>
        )}
      </div>

      {/* Guidance Modal */}
      {showGuidance && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl max-h-[90vh] overflow-y-auto w-full">
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-slate-200 flex items-center justify-between z-10">
              <h3 className="text-lg font-semibold text-slate-900">Cost Segregation Guide</h3>
              <button
                onClick={() => setShowGuidance(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-xl"
              >
                ×
              </button>
            </div>
            <div className="p-6 space-y-6">
              <BonusDepreciationGuidance defaultExpanded />
              <ClassificationGuidance />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CostSegTab;
