import { useState } from 'react';
import WizardLayout from '../components/WizardLayout';
import {
  ScaleIcon,
  LandIcon,
  TrendingUpIcon,
  ChartIcon,
  CurrencyIcon,
  ConstructionIcon,
} from '../components/icons';
import { SalesGrid, PROPERTIES, MOCK_VALUES } from '../features/sales-comparison';
import { Layers, Building } from 'lucide-react';

const analysisTabs = [
  { id: 'hbu', label: 'Highest & Best Use', Icon: ScaleIcon },
  { id: 'land', label: 'Land Valuation', Icon: LandIcon },
  { id: 'market', label: 'Market Analysis', Icon: TrendingUpIcon },
  { id: 'sales', label: 'Sales Comparison', Icon: ChartIcon },
  { id: 'income', label: 'Income Approach', Icon: CurrencyIcon },
  { id: 'cost', label: 'Cost Approach', Icon: ConstructionIcon },
];

export default function AnalysisPage() {
  const [activeTab, setActiveTab] = useState('sales');
  const [analysisMode, setAnalysisMode] = useState<'standard' | 'residual'>('standard');

  const sidebar = (
    <div>
      <h2 className="text-lg font-bold text-gray-900 mb-1">Valuation Analysis</h2>
      <p className="text-sm text-gray-500 mb-6">3 Approaches Selected</p>
      <nav className="space-y-1">
        {analysisTabs.map((tab) => {
          const Icon = tab.Icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm flex items-center gap-3 transition-colors ${
                activeTab === tab.id
                  ? 'bg-[#0da1c7]/10 text-[#0da1c7] font-medium'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-5 h-5" />
              {tab.label}
            </button>
          );
        })}
      </nav>
    </div>
  );

  const helpSidebar = (
    <div>
      <h3 className="text-lg font-bold text-gray-900 mb-3">
        {analysisTabs.find((t) => t.id === activeTab)?.label}
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        {activeTab === 'hbu'
          ? 'Analyze the highest and best use of the property as if vacant and as improved.'
          : activeTab === 'land'
          ? 'Estimate the value of the land as if vacant using appropriate methods.'
          : activeTab === 'market'
          ? 'Analyze market conditions, supply/demand, and trends affecting value.'
          : activeTab === 'sales'
          ? 'Compare the subject to similar properties that have recently sold.'
          : activeTab === 'income'
          ? 'Analyze income-producing potential using direct capitalization or DCF.'
          : 'Estimate value using cost to reproduce or replace improvements.'}
      </p>
      {activeTab === 'sales' && (
        <div className="space-y-3">
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
            <h4 className="font-semibold text-sm text-blue-900 mb-1">Analysis Mode</h4>
            <p className="text-xs text-blue-800 mb-2">
              Toggle between standard price/SF analysis or residual improvement analysis.
            </p>
          </div>
          <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded">
            <h4 className="font-semibold text-sm text-green-900 mb-1">Tip</h4>
            <p className="text-xs text-green-800">
              Click on adjustment badges to modify percentage adjustments for each comparable.
            </p>
          </div>
        </div>
      )}
    </div>
  );

  // For Sales Comparison, we want full-width layout without padding
  const isSalesComparison = activeTab === 'sales';

  return (
    <WizardLayout
      title="Valuation Analysis"
      subtitle="Phase 5 of 6 • Valuation Approaches"
      phase={5}
      sidebar={isSalesComparison ? undefined : sidebar}
      helpSidebar={isSalesComparison ? undefined : helpSidebar}
      noPadding={isSalesComparison}
    >
      {activeTab === 'sales' ? (
        <div className="absolute inset-0 flex flex-col">
          {/* Sales Comparison Header Bar */}
          <div className="flex-shrink-0 bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between z-40 shadow-sm">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setActiveTab('hbu')}
                className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Analysis
              </button>
              <div className="w-px h-6 bg-slate-200" />
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <ChartIcon className="w-5 h-5 text-[#0da1c7]" />
                Sales Comparison Grid
              </h2>
            </div>
            <div className="flex items-center gap-4">
               {/* Analysis Mode Toggle */}
               <div className="flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200">
                 <button 
                    onClick={() => setAnalysisMode('standard')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md flex items-center gap-2 transition-all ${
                      analysisMode === 'standard' 
                        ? 'bg-white text-slate-800 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                 >
                    <Layers className="w-3.5 h-3.5" />
                    Standard
                 </button>
                 <button 
                    onClick={() => setAnalysisMode('residual')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md flex items-center gap-2 transition-all ${
                      analysisMode === 'residual' 
                        ? 'bg-purple-600 text-white shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                 >
                    <Building className="w-3.5 h-3.5" />
                    Improvement Analysis
                 </button>
               </div>
            </div>
          </div>

          {/* Sales Grid */}
          <div className="flex-1 min-h-0">
            <SalesGrid 
              properties={PROPERTIES} 
              values={MOCK_VALUES} 
              analysisMode={analysisMode}
            />
          </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
          {activeTab === 'hbu' ? (
            <HBUContent />
          ) : activeTab === 'income' ? (
            <IncomeApproachContent />
          ) : (
            <PlaceholderContent title={analysisTabs.find((t) => t.id === activeTab)?.label || ''} />
          )}
        </div>
      )}
    </WizardLayout>
  );
}

function HBUContent() {
  return (
    <>
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-[#1c3643] border-b-2 border-gray-200 pb-3 mb-4">
          Highest & Best Use - As Vacant
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Legally Permissible Uses
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent"
              rows={3}
              placeholder="Describe uses permitted under current zoning and regulations..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Physically Possible Uses
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent"
              rows={3}
              placeholder="Describe uses that are physically possible given site characteristics..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Financially Feasible Uses
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent"
              rows={3}
              placeholder="Describe uses that would generate adequate return..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Maximally Productive Use
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent"
              rows={3}
              placeholder="Conclusion of highest and best use as vacant..."
            />
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-[#1c3643] border-b-2 border-gray-200 pb-3 mb-4">
          Highest & Best Use - As Improved
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Conclusion
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent"
              rows={4}
              placeholder="Analysis of whether to continue current use, renovate, or demolish..."
            />
          </div>
        </div>
      </div>
    </>
  );
}

function IncomeApproachContent() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-bold text-[#1c3643] border-b-2 border-gray-200 pb-3 mb-4">
        Income Approach
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Potential Gross Income</label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent"
            placeholder="$0"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Vacancy & Collection Loss</label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent"
            placeholder="5%"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Effective Gross Income</label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent bg-gray-50"
            placeholder="$0"
            readOnly
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Operating Expenses</label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent"
            placeholder="$0"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Net Operating Income</label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent bg-gray-50"
            placeholder="$0"
            readOnly
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Capitalization Rate</label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent"
            placeholder="6.5%"
          />
        </div>
      </div>
      <div className="mt-6 p-4 bg-[#0da1c7]/10 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="font-semibold text-[#1c3643]">Indicated Value via Income Approach</span>
          <span className="text-2xl font-bold text-[#0da1c7]">$0</span>
        </div>
      </div>
    </div>
  );
}

function PlaceholderContent({ title }: { title: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-bold text-[#1c3643] border-b-2 border-gray-200 pb-3 mb-4">
        {title}
      </h3>
      <p className="text-sm text-gray-600">
        Analysis content for {title} will be displayed here...
      </p>
    </div>
  );
}
