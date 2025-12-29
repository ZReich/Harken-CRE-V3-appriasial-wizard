/**
 * CostSegTab Component
 * 
 * Main tab component for Cost Segregation in the Analysis page.
 * Includes skip banner, overview, component classifier, and depreciation schedule.
 */

import React, { useState } from 'react';
import { 
  Calculator, 
  SkipForward, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle, 
  ChevronDown,
  ChevronUp,
  FileText,
  Settings
} from 'lucide-react';
import { useCostSegAnalysis } from '../hooks/useCostSegAnalysis';
import { CostSegOverview } from './CostSegOverview';
import { ComponentClassifier } from './ComponentClassifier';
import { DepreciationSchedule } from './DepreciationSchedule';

type TabView = 'overview' | 'components' | 'schedule';

export function CostSegTab() {
  const {
    analysis,
    isEnabled,
    isReady,
    canGenerate,
    isSkipped,
    validationMessages,
    setEnabled,
    skipCostSeg,
    generateAnalysis,
    overrideComponent,
  } = useCostSegAnalysis();
  
  const [activeView, setActiveView] = useState<TabView>('overview');
  const [showTaxRateModal, setShowTaxRateModal] = useState(false);
  
  // If not enabled and not skipped, show the skip banner
  if (!isEnabled && !isSkipped) {
    return (
      <div className="space-y-6">
        {/* Skip Banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-amber-100 rounded-xl">
              <Calculator className="text-amber-600" size={24} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-amber-900">
                Cost Segregation Analysis
              </h3>
              <p className="text-amber-700 mt-1">
                Cost Segregation is an optional add-on report that identifies building components 
                eligible for accelerated depreciation. This can provide significant tax benefits 
                for property owners.
              </p>
              <p className="text-amber-600 text-sm mt-2">
                If you are not creating a Cost Seg report for this assignment, you can skip this step.
              </p>
              
              {validationMessages.length > 0 && (
                <div className="mt-4 p-3 bg-amber-100 rounded-lg">
                  <div className="flex items-center gap-2 text-amber-800 font-medium text-sm mb-2">
                    <AlertTriangle size={16} />
                    Prerequisites
                  </div>
                  <ul className="text-sm text-amber-700 space-y-1 ml-6 list-disc">
                    {validationMessages.map((msg, i) => (
                      <li key={i}>{msg}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="flex items-center gap-3 mt-4">
                <button
                  onClick={() => setEnabled(true)}
                  disabled={!canGenerate}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    canGenerate
                      ? 'bg-[#0da1c7] text-white hover:bg-[#0b8fb3]'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Calculator size={18} />
                  Enable Cost Segregation
                </button>
                
                <button
                  onClick={skipCostSeg}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <SkipForward size={18} />
                  Skip Cost Seg
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Placeholder content */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-12 text-center">
          <Calculator className="mx-auto text-gray-300 mb-4" size={48} />
          <p className="text-gray-500">
            Enable Cost Segregation above to generate an IRS-compliant depreciation analysis.
          </p>
        </div>
      </div>
    );
  }
  
  // If skipped, show minimal UI with option to enable
  if (isSkipped) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
        <CheckCircle className="mx-auto text-gray-400 mb-4" size={48} />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Cost Segregation Skipped
        </h3>
        <p className="text-gray-500 mb-4">
          You've chosen to skip the Cost Segregation analysis for this assignment.
        </p>
        <button
          onClick={() => setEnabled(true)}
          disabled={!canGenerate}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            canGenerate
              ? 'bg-[#0da1c7] text-white hover:bg-[#0b8fb3]'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          <Calculator size={18} />
          Enable Cost Segregation
        </button>
      </div>
    );
  }
  
  // If enabled but not ready (no data), show loading or error
  if (!isReady || !analysis) {
    return (
      <div className="space-y-6">
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
          <RefreshCw className="mx-auto text-[#0da1c7] mb-4 animate-spin" size={48} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Generating Analysis...
          </h3>
          <p className="text-gray-500">
            Analyzing building components and calculating depreciation schedules.
          </p>
          
          <button
            onClick={generateAnalysis}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#0da1c7] text-white rounded-lg font-medium hover:bg-[#0b8fb3] transition-colors"
          >
            <RefreshCw size={18} />
            Regenerate Analysis
          </button>
        </div>
      </div>
    );
  }
  
  // Main content with analysis
  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#0da1c7]/10 rounded-xl">
            <Calculator className="text-[#0da1c7]" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Cost Segregation Analysis
            </h2>
            <p className="text-sm text-gray-500">
              {analysis.components.length} components classified | 
              Depreciable basis: ${analysis.depreciableBasis.toLocaleString()}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={generateAnalysis}
            className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            title="Regenerate Analysis"
          >
            <RefreshCw size={18} />
            Refresh
          </button>
          
          <button
            onClick={() => setShowTaxRateModal(true)}
            className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            title="Settings"
          >
            <Settings size={18} />
          </button>
        </div>
      </div>
      
      {/* View Tabs */}
      <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl w-fit">
        {[
          { id: 'overview' as const, label: 'Overview', icon: FileText },
          { id: 'components' as const, label: 'Components', icon: Calculator },
          { id: 'schedule' as const, label: 'Schedule', icon: FileText },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveView(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeView === tab.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>
      
      {/* Active View Content */}
      {activeView === 'overview' && (
        <CostSegOverview 
          analysis={analysis}
          onEditTaxRate={() => setShowTaxRateModal(true)}
        />
      )}
      
      {activeView === 'components' && (
        <ComponentClassifier
          components={analysis.components}
          onOverride={overrideComponent}
        />
      )}
      
      {activeView === 'schedule' && (
        <DepreciationSchedule schedule={analysis.depreciationSchedule} />
      )}
      
      {/* Tax Rate Modal would go here */}
      {showTaxRateModal && (
        <TaxRateModal 
          currentRate={analysis.taxRate}
          onClose={() => setShowTaxRateModal(false)}
        />
      )}
    </div>
  );
}

// Simple Tax Rate Modal
function TaxRateModal({ 
  currentRate, 
  onClose 
}: { 
  currentRate: number; 
  onClose: () => void;
}) {
  const { setTaxRate } = useCostSegAnalysis();
  const [rate, setRate] = useState(currentRate * 100);
  
  const handleSave = () => {
    setTaxRate(rate / 100);
    onClose();
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Tax Rate Settings
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Marginal Tax Rate
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={rate}
                onChange={(e) => setRate(parseFloat(e.target.value) || 0)}
                min={0}
                max={100}
                step={1}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent"
              />
              <span className="text-gray-500">%</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Used for calculating estimated tax savings
            </p>
          </div>
          
          <div className="flex gap-2 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2 bg-[#0da1c7] text-white rounded-lg hover:bg-[#0b8fb3] transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CostSegTab;

