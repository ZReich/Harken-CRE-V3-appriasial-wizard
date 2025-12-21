import { useState, useMemo, useEffect, useCallback } from 'react';
import WizardLayout from '../components/WizardLayout';
import ScenarioSwitcher, { getScenarioAccentColor, getScenarioColors } from '../components/ScenarioSwitcher';
import {
  ScaleIcon,
  LandIcon,
  TrendingUpIcon,
  ChartIcon,
  CurrencyIcon,
  ConstructionIcon,
} from '../components/icons';
import { SalesGrid, PROPERTIES, MOCK_VALUES } from '../features/sales-comparison';
import { IncomeApproachGrid } from '../features/income-approach';
import { CostApproachGrid } from '../features/cost-approach';
import { LandSalesGrid } from '../features/land-valuation';
import { MarketAnalysisGrid } from '../features/market-analysis';
import { useWizard } from '../context/WizardContext';
import { getGuidance, type GuidanceContent } from '../constants/guidance';
import { Layers, Building, Wallet, HardHat, Plus, Info, AlertTriangle, CheckCircle2, Lightbulb, BookOpen } from 'lucide-react';
import { useCelebration } from '../hooks/useCelebration';
import { ScenarioCelebration } from '../components/ScenarioCelebration';

// Approach definitions with color coding for navigation
const APPROACH_CONFIG = {
  hbu: { 
    id: 'hbu', 
    label: 'Highest & Best Use', 
    Icon: ScaleIcon,
    color: '#6366f1', // indigo
    bgClass: 'bg-indigo-50',
    borderClass: 'border-l-indigo-400',
  },
  land: { 
    id: 'land', 
    label: 'Land Valuation', 
    Icon: LandIcon,
    color: '#84cc16', // lime
    bgClass: 'bg-lime-50',
    borderClass: 'border-l-lime-400',
  },
  market: { 
    id: 'market', 
    label: 'Market Analysis', 
    Icon: TrendingUpIcon,
    color: '#f59e0b', // amber
    bgClass: 'bg-amber-50',
    borderClass: 'border-l-amber-400',
  },
  sales: { 
    id: 'sales', 
    label: 'Sales Comparison', 
    Icon: ChartIcon,
    color: '#0da1c7', // teal (primary)
    bgClass: 'bg-cyan-50',
    borderClass: 'border-l-cyan-400',
  },
  income: { 
    id: 'income', 
    label: 'Income Approach', 
    Icon: CurrencyIcon,
    color: '#22c55e', // green
    bgClass: 'bg-green-50',
    borderClass: 'border-l-green-400',
  },
  cost: { 
    id: 'cost', 
    label: 'Cost Approach', 
    Icon: ConstructionIcon,
    color: '#f97316', // orange
    bgClass: 'bg-orange-50',
    borderClass: 'border-l-orange-400',
  },
};

// Map scenario approach names to tab IDs
const APPROACH_NAME_TO_ID: Record<string, string> = {
  'Highest & Best Use': 'hbu',
  'Land Valuation': 'land',
  'Market Analysis': 'market',
  'Sales Comparison': 'sales',
  'Income Approach': 'income',
  'Cost Approach': 'cost',
};

// All possible tabs in display order
const ALL_TABS = ['hbu', 'land', 'market', 'sales', 'income', 'cost'];

export default function AnalysisPage() {
  const [activeTab, setActiveTab] = useState('sales');
  const [analysisMode, setAnalysisMode] = useState<'standard' | 'residual'>('standard');
  const { state, setIncomeApproachData } = useWizard();

  // Get the active scenario
  const activeScenario = useMemo(() => {
    return state.scenarios.find(s => s.id === state.activeScenarioId) || state.scenarios[0];
  }, [state.scenarios, state.activeScenarioId]);

  // Get scenario theme colors
  const scenarioColors = useMemo(() => {
    return activeScenario ? getScenarioColors(activeScenario.name) : getScenarioColors('As Is');
  }, [activeScenario]);

  const themeAccent = useMemo(() => {
    return activeScenario ? getScenarioAccentColor(activeScenario.name) : '#0da1c7';
  }, [activeScenario]);

  // Filter tabs based on active scenario's approaches
  const availableTabs = useMemo(() => {
    if (!activeScenario) return ALL_TABS;
    
    const approachIds = activeScenario.approaches.map(name => APPROACH_NAME_TO_ID[name]).filter(Boolean);
    
    // Always include HBU and Market Analysis as they're foundational
    const requiredTabs = ['hbu', 'market'];
    const combinedTabs = [...new Set([...requiredTabs, ...approachIds])];
    
    // Return in proper display order
    return ALL_TABS.filter(tab => combinedTabs.includes(tab));
  }, [activeScenario]);

  // Switch to first available tab if current tab becomes unavailable
  useEffect(() => {
    if (!availableTabs.includes(activeTab) && availableTabs.length > 0) {
      setActiveTab(availableTabs[0]);
    }
  }, [availableTabs, activeTab]);

  // Get current approach config
  const currentApproach = APPROACH_CONFIG[activeTab as keyof typeof APPROACH_CONFIG];

  // Get scenario-specific guidance
  const guidance = useMemo((): GuidanceContent => {
    if (!activeScenario) {
      return getGuidance('As Is', activeTab);
    }
    return getGuidance(activeScenario.name, activeTab);
  }, [activeScenario, activeTab]);

  // Celebration system
  const { triggerGrandCelebration } = useCelebration();
  const { areAllScenariosComplete: checkAllComplete } = useWizard();
  
  // Track scenario mini-celebration
  const [showScenarioCelebration, setShowScenarioCelebration] = useState(false);
  const [celebratingScenarioName, setCelebratingScenarioName] = useState('');

  // Handle dismissing scenario celebration
  const handleDismissScenarioCelebration = useCallback(() => {
    setShowScenarioCelebration(false);
    setCelebratingScenarioName('');
    
    // Check if all scenarios are now complete
    if (checkAllComplete()) {
      triggerGrandCelebration();
    }
  }, [checkAllComplete, triggerGrandCelebration]);

  // Left Sidebar - Approach Navigation with subtle color coding
  const sidebar = (
    <div>
      <h2 className="text-lg font-bold text-gray-900 mb-1">Valuation Analysis</h2>
      <p className="text-sm text-gray-500 mb-2">
        {activeScenario?.name || 'As Is'} Scenario
      </p>
      <p className="text-xs text-slate-400 mb-6">
        {availableTabs.length} Approaches Active
      </p>
      <nav className="space-y-1">
        {availableTabs.map((tabId) => {
          const config = APPROACH_CONFIG[tabId as keyof typeof APPROACH_CONFIG];
          if (!config) return null;
          const Icon = config.Icon;
          const isActive = activeTab === tabId;

          return (
            <button
              key={tabId}
              onClick={() => setActiveTab(tabId)}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm flex items-center gap-3 transition-all border-l-4 ${
                isActive
                  ? `${config.bgClass} font-medium ${config.borderClass}`
                  : 'text-gray-600 hover:bg-gray-100 border-l-transparent'
              }`}
              style={isActive ? { color: config.color } : undefined}
            >
              <Icon className="w-5 h-5" />
              {config.label}
            </button>
          );
        })}
      </nav>

      {/* Scenario Info */}
      <div className={`mt-6 p-3 rounded-lg border ${scenarioColors.activeBg} ${scenarioColors.activeBorder}`}>
        <div className={`text-xs font-semibold uppercase tracking-wide ${scenarioColors.activeText} mb-1`}>
          Active Scenario
        </div>
        <div className="text-sm font-medium text-slate-800">
          {activeScenario?.name || 'As Is'}
        </div>
        {activeScenario?.effectiveDate && (
          <div className="text-xs text-slate-500 mt-1">
            Effective: {new Date(activeScenario.effectiveDate).toLocaleDateString()}
          </div>
        )}
      </div>
    </div>
  );

  // Right Sidebar - Dynamic Guidance Panel
  const helpSidebarGuidance = (
    <div className="space-y-4">
      {/* Header with approach and scenario context */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <span 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: currentApproach?.color || '#0da1c7' }}
          />
          {currentApproach?.label || 'Analysis'}
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          {activeScenario?.name} Scenario Guidance
        </p>
      </div>

      {/* Scenario Context Banner */}
      <div className={`${scenarioColors.activeBg} border ${scenarioColors.activeBorder} rounded-xl p-4 animate-in fade-in slide-in-from-top-2 duration-300`}>
        <div className="flex gap-3">
          <Info className={`${scenarioColors.activeText} shrink-0`} size={18} />
          <div>
            <p className={`text-sm font-semibold ${scenarioColors.activeText} mb-1`}>
              Scenario Context
            </p>
            <p className="text-xs text-slate-700">
              {guidance.context}
            </p>
          </div>
        </div>
      </div>

      {/* Key Assumptions */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle2 className="text-green-600" size={16} />
          <h4 className="text-sm font-semibold text-slate-800">Key Assumptions</h4>
        </div>
        <ul className="space-y-2">
          {guidance.assumptions.map((assumption, i) => (
            <li key={i} className="text-xs text-slate-600 flex items-start gap-2">
              <span className="w-1 h-1 rounded-full bg-green-400 mt-1.5 shrink-0" />
              {assumption}
            </li>
          ))}
        </ul>
      </div>

      {/* Common Pitfalls */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="text-amber-600" size={16} />
          <h4 className="text-sm font-semibold text-amber-900">Common Pitfalls</h4>
        </div>
        <ul className="space-y-2">
          {guidance.pitfalls.map((pitfall, i) => (
            <li key={i} className="text-xs text-amber-800 flex items-start gap-2">
              <span className="w-1 h-1 rounded-full bg-amber-400 mt-1.5 shrink-0" />
              {pitfall}
            </li>
          ))}
        </ul>
      </div>

      {/* USPAP Requirements */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="text-blue-600" size={16} />
          <h4 className="text-sm font-semibold text-blue-900">USPAP</h4>
        </div>
        <p className="text-xs text-blue-800">
          {guidance.uspap}
        </p>
      </div>

      {/* Tips */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="text-green-600" size={16} />
          <h4 className="text-sm font-semibold text-green-900">Tips</h4>
        </div>
        <ul className="space-y-2">
          {guidance.tips.map((tip, i) => (
            <li key={i} className="text-xs text-green-800 flex items-start gap-2">
              <span className="w-1 h-1 rounded-full bg-green-400 mt-1.5 shrink-0" />
              {tip}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  // Right Sidebar - Values Panel (scenario-specific)
  const helpSidebarValues = (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-bold text-gray-900">Approach Values</h3>
        <p className="text-xs text-slate-500 mt-1">
          {activeScenario?.name} Scenario
        </p>
      </div>

      {/* Current Approach Value */}
      <div 
        className="p-4 rounded-xl border-2"
        style={{ 
          backgroundColor: `${currentApproach?.color}10`,
          borderColor: `${currentApproach?.color}40`
        }}
      >
        <div className="text-xs uppercase text-slate-500 mb-1">Current Approach</div>
        <div className="text-base font-semibold text-slate-900 mb-2">
          {currentApproach?.label}
        </div>
        <div className="text-2xl font-bold" style={{ color: currentApproach?.color }}>
          {activeTab === 'sales'
            ? '$1,250,000'
            : activeTab === 'income'
            ? '$1,180,000'
            : activeTab === 'cost'
            ? '$1,320,000'
            : activeTab === 'land'
            ? '$820,000'
            : '—'}
        </div>
        {activeTab !== 'hbu' && activeTab !== 'market' && (
          <div className="text-xs text-slate-500 mt-1">
            {activeTab === 'sales'
              ? '$215 / SF (adjusted)'
              : activeTab === 'income'
              ? '$18.50 / SF (annual)'
              : activeTab === 'cost'
              ? '$245 / SF (improvements)'
              : activeTab === 'land'
              ? '$12,961 / acre'
              : ''}
          </div>
        )}
      </div>

      {/* All Approach Values Summary */}
      <div className="space-y-2">
        <div className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
          All Approaches ({activeScenario?.name})
        </div>
        {availableTabs
          .filter(tab => ['land', 'sales', 'income', 'cost'].includes(tab))
          .map(tabId => {
            const config = APPROACH_CONFIG[tabId as keyof typeof APPROACH_CONFIG];
            const value = tabId === 'sales' ? '$1,250,000'
              : tabId === 'income' ? '$1,180,000'
              : tabId === 'cost' ? '$1,320,000'
              : tabId === 'land' ? '$820,000' : '—';
            
            return (
              <div 
                key={tabId}
                className={`p-3 rounded-lg border flex items-center justify-between ${
                  tabId === activeTab ? 'border-slate-300 bg-slate-50' : 'border-slate-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: config?.color }}
                  />
                  <span className="text-sm text-slate-700">{config?.label}</span>
                </div>
                <span className="text-sm font-semibold text-slate-900">{value}</span>
              </div>
            );
          })}
      </div>

      {/* Scenario Comparison (if multiple scenarios) */}
      {state.scenarios.length > 1 && (
        <div className="bg-violet-50 border border-violet-200 rounded-xl p-4">
          <div className="text-xs font-semibold text-violet-900 mb-2">
            Scenario Comparison
          </div>
          {state.scenarios.map(scenario => {
            const colors = getScenarioColors(scenario.name);
            const isActive = scenario.id === state.activeScenarioId;
            return (
              <div 
                key={scenario.id}
                className={`flex items-center justify-between py-1.5 ${isActive ? 'opacity-100' : 'opacity-60'}`}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${colors.dot}`} />
                  <span className="text-xs text-slate-700">{scenario.name}</span>
                </div>
                <span className="text-xs font-medium text-slate-800">
                  {scenario.name === 'As Is' ? '$1,250,000' 
                    : scenario.name === 'As Completed' ? '$1,450,000'
                    : scenario.name === 'As Stabilized' ? '$1,380,000'
                    : '$1,250,000'}
                </span>
              </div>
            );
          })}
        </div>
      )}

      <div className="bg-slate-100 border border-slate-200 rounded-lg p-3 text-xs text-slate-600">
        Values update automatically as you make changes. Switch to Guidance for USPAP requirements.
      </div>
    </div>
  );

  // Keep full-width content for grid-heavy views
  const isFullWidthView = activeTab === 'sales' || activeTab === 'income' || activeTab === 'cost' || activeTab === 'land' || activeTab === 'market';

  return (
    <WizardLayout
      title="Valuation Analysis"
      subtitle="Phase 5 of 6 • Valuation Approaches"
      phase={5}
      sidebar={sidebar}
      helpSidebarGuidance={helpSidebarGuidance}
      helpSidebarValues={helpSidebarValues}
      noPadding={isFullWidthView}
      scenarioSwitcher={<ScenarioSwitcher />}
      themeAccent={themeAccent}
      sidebarAccent={currentApproach?.color}
    >
      {activeTab === 'sales' ? (
        <div className="absolute inset-0 flex flex-col">
          {/* Sales Comparison Header Bar */}
          <div className="flex-shrink-0 bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between z-40 shadow-sm">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <span style={{ color: APPROACH_CONFIG.sales.color }}><ChartIcon className="w-5 h-5" /></span>
                Sales Comparison Grid
              </h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {activeScenario?.name}
              </span>
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
      ) : activeTab === 'income' ? (
        <div className="absolute inset-0 flex flex-col">
          {/* Income Approach Header Bar */}
          <div className="flex-shrink-0 bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between z-40 shadow-sm">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Wallet className="w-5 h-5" style={{ color: APPROACH_CONFIG.income.color }} />
                Income Approach Analysis
              </h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {activeScenario?.name}
              </span>
            </div>
          </div>

          {/* Income Approach Grid */}
          <div className="flex-1 min-h-0 overflow-auto">
            <IncomeApproachGrid 
              initialData={state.incomeApproachData}
              onDataChange={setIncomeApproachData}
              showGuidancePanel={true}
            />
          </div>
        </div>
      ) : activeTab === 'cost' ? (
        <div className="absolute inset-0 flex flex-col">
          {/* Cost Approach Header Bar */}
          <div className="flex-shrink-0 bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between z-40 shadow-sm">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <HardHat className="w-5 h-5" style={{ color: APPROACH_CONFIG.cost.color }} />
                Cost Approach Analysis
              </h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {activeScenario?.name}
              </span>
            </div>
          </div>

          {/* Cost Approach Grid */}
          <div className="flex-1 min-h-0 overflow-auto">
            <CostApproachGrid />
          </div>
        </div>
      ) : activeTab === 'land' ? (
        <div className="absolute inset-0 flex flex-col">
          {/* Land Valuation Header Bar */}
          <div className="flex-shrink-0 bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between z-40 shadow-sm">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <span style={{ color: APPROACH_CONFIG.land.color }}><LandIcon className="w-5 h-5" /></span>
                Land Valuation - Sales Comparison
              </h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {activeScenario?.name}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 bg-[#0da1c7] text-white text-sm font-medium rounded-lg hover:bg-[#0b8fb2] transition-colors flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Land Sale
              </button>
            </div>
          </div>

          {/* Land Sales Grid */}
          <div className="flex-1 min-h-0">
            <LandSalesGrid />
          </div>
        </div>
      ) : activeTab === 'market' ? (
        <div className="absolute inset-0 flex flex-col">
          {/* Market Analysis Header Bar */}
          <div 
            className="h-12 border-b flex items-center justify-between px-6"
            style={{ borderColor: currentApproach?.color + '40', backgroundColor: currentApproach?.color + '08' }}
          >
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold" style={{ color: currentApproach?.color }}>
                {activeScenario?.name}: Market Analysis
              </span>
            </div>
          </div>
          {/* Market Analysis Grid */}
          <div className="flex-1 min-h-0 overflow-auto">
            <MarketAnalysisGrid 
              rentCompData={{
                avgRent: 26.75,
                rentRange: [17.50, 37.50],
                compCount: 4,
              }}
              salesCompData={{
                avgPricePsf: 242,
                avgCapRate: 6.50,
                compCount: 8,
              }}
            />
          </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
          {activeTab === 'hbu' ? (
            <HBUContent scenarioName={activeScenario?.name} />
          ) : (
            <PlaceholderContent 
              title={APPROACH_CONFIG[activeTab as keyof typeof APPROACH_CONFIG]?.label || ''} 
              scenarioName={activeScenario?.name}
            />
          )}
        </div>
      )}

      {/* Scenario mini-celebration */}
      <ScenarioCelebration
        scenarioName={celebratingScenarioName}
        isVisible={showScenarioCelebration}
        onDismiss={handleDismissScenarioCelebration}
        duration={2}
      />
    </WizardLayout>
  );
}

function HBUContent({ scenarioName }: { scenarioName?: string }) {
  return (
    <>
      {/* Scenario context banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <Info className="text-blue-600 shrink-0 mt-0.5" size={18} />
        <div>
          <p className="text-sm font-semibold text-blue-900">
            Analyzing for: {scenarioName || 'As Is'}
          </p>
          <p className="text-xs text-blue-800 mt-1">
            {scenarioName === 'As Is' 
              ? 'Consider the property in its current condition with existing improvements.'
              : scenarioName === 'As Completed'
              ? 'Analyze as if proposed improvements are 100% complete.'
              : scenarioName === 'As Stabilized'
              ? 'Analyze as if property has achieved stabilized occupancy.'
              : 'Complete the highest and best use analysis for this scenario.'}
          </p>
        </div>
      </div>

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

function PlaceholderContent({ title, scenarioName }: { title: string; scenarioName?: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-[#1c3643] border-b-2 border-gray-200 pb-3">
          {title}
        </h3>
        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
          {scenarioName}
        </span>
      </div>
      <p className="text-sm text-gray-600">
        Analysis content for {title} ({scenarioName} scenario) will be displayed here...
      </p>
    </div>
  );
}
