import { useState, useMemo, useEffect, useCallback, lazy, Suspense } from 'react';
import WizardLayout from '../components/WizardLayout';
import ScenarioSwitcher, { getScenarioAccentColor, getScenarioColors } from '../components/ScenarioSwitcher';
import {
  LandIcon,
  ChartIcon,
  CurrencyIcon,
  ConstructionIcon,
  ResidentialIcon,
} from '../components/icons';
// Static imports for constants only
import { PROPERTIES, MOCK_VALUES } from '../features/sales-comparison';

// Lazy-loaded feature components for code-splitting
const SalesGrid = lazy(() => import('../features/sales-comparison').then(m => ({ default: m.SalesGrid })));
const IncomeApproachGrid = lazy(() => import('../features/income-approach').then(m => ({ default: m.IncomeApproachGrid })));
const CostApproachGrid = lazy(() => import('../features/cost-approach').then(m => ({ default: m.CostApproachGrid })));
const LandSalesGrid = lazy(() => import('../features/land-valuation').then(m => ({ default: m.LandSalesGrid })));
const MultiFamilyGrid = lazy(() => import('../features/multi-family').then(m => ({ default: m.MultiFamilyGrid })));
const CostSegTab = lazy(() => import('../features/cost-segregation').then(m => ({ default: m.CostSegTab })));
import { useWizard } from '../context/WizardContext';
import { getGuidance, type GuidanceContent } from '../constants/guidance';
import { Layers, Building, Wallet, HardHat, Info, AlertTriangle, CheckCircle2, Lightbulb, BookOpen } from 'lucide-react';
import { useCelebration } from '../hooks/useCelebration';
import { ScenarioCelebration } from '../components/ScenarioCelebration';
import { ReconciliationSummary } from '../components/ReconciliationSummary';
import { ContextualMarketData } from '../components/ContextualMarketData';
import { getVisibleComponents } from '../utils/componentVisibility';
import { Loader2 } from 'lucide-react';

// Loading fallback for lazy-loaded feature grids
function GridLoader() {
  return (
    <div className="flex-1 flex items-center justify-center bg-surface-2 dark:bg-elevation-2/50 dark:bg-elevation-1/50">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 text-[#0da1c7] animate-spin" />
        <p className="text-sm text-slate-500 dark:text-slate-400">Loading analysis...</p>
      </div>
    </div>
  );
}

// Approach definitions with color coding for navigation
// NOTE: HBU has been moved to the Review page per plan
const APPROACH_CONFIG = {
  land: {
    id: 'land',
    label: 'Land Valuation',
    Icon: LandIcon,
    color: '#84cc16', // lime
    bgClass: 'bg-lime-50 dark:bg-lime-900/20',
    borderClass: 'border-l-lime-400',
  },
  sales: {
    id: 'sales',
    label: 'Sales Comparison',
    Icon: ChartIcon,
    color: '#0da1c7', // teal (primary)
    bgClass: 'bg-cyan-50 dark:bg-cyan-900/20',
    borderClass: 'border-l-cyan-400',
  },
  income: {
    id: 'income',
    label: 'Income Approach',
    Icon: CurrencyIcon,
    color: '#22c55e', // green
    bgClass: 'bg-accent-teal-mint-light dark:bg-green-900/20',
    borderClass: 'border-l-green-400',
  },
  cost: {
    id: 'cost',
    label: 'Cost Approach',
    Icon: ConstructionIcon,
    color: '#f97316', // orange
    bgClass: 'bg-orange-50 dark:bg-orange-900/20',
    borderClass: 'border-l-orange-400',
  },
  multifamily: {
    id: 'multifamily',
    label: 'Multi-Family',
    Icon: ResidentialIcon,
    color: '#8b5cf6', // violet
    bgClass: 'bg-violet-50 dark:bg-violet-900/20',
    borderClass: 'border-l-violet-400',
  },
  costseg: {
    id: 'costseg',
    label: 'Cost Segregation',
    Icon: Wallet,
    color: '#2fc4b2', // teal-mint
    bgClass: 'bg-accent-teal-mint-light dark:bg-accent-teal-mint/10',
    borderClass: 'border-l-accent-teal-mint',
  },
};

// Map scenario approach names to tab IDs
// NOTE: Market Analysis has been moved to Review page
const APPROACH_NAME_TO_ID: Record<string, string> = {
  'Land Valuation': 'land',
  'Sales Comparison': 'sales',
  'Income Approach': 'income',
  'Cost Approach': 'cost',
  'Multi-Family Approach': 'multifamily',
};

// All possible tabs in display order (HBU and Market Analysis moved to Review page)
const ALL_TABS = ['land', 'sales', 'multifamily', 'income', 'cost'];

export default function AnalysisPage() {
  const [activeTab, setActiveTab] = useState('sales');
  const [analysisMode, setAnalysisMode] = useState<'standard' | 'residual'>('standard');
  const { state, setIncomeApproachData, hasImprovements, setEconomicIndicators, dispatch } = useWizard();
  
  // Extract subjectData for grid configuration
  const { subjectData } = state;

  // Get the active scenario
  const activeScenario = useMemo(() => {
    return state.scenarios.find(s => s.id === state.activeScenarioId) || state.scenarios[0];
  }, [state.scenarios, state.activeScenarioId]);

  // Calculate component visibility based on wizard configuration
  const visibility = useMemo(() => {
    return getVisibleComponents({
      propertyType: state.propertyType,
      propertySubtype: state.propertySubtype,
      propertyInterest: state.subjectData?.propertyInterest || 'fee_simple',
      hasImprovements,
      activeScenario: activeScenario || null,
      // Assignment context for smart visibility
      propertyStatus: state.subjectData?.propertyStatus,
      occupancyStatus: state.subjectData?.occupancyStatus,
      plannedChanges: state.subjectData?.plannedChanges,
      // Check if actual data exists
      hasActualRentRoll: (state.incomeApproachData?.incomeData?.rentalIncome?.length ?? 0) > 0,
      hasActualExpenses: (state.incomeApproachData?.expenseData?.expenses?.length ?? 0) > 0,
    });
  }, [
    state.propertyType, state.propertySubtype,
    state.subjectData?.propertyInterest, state.subjectData?.propertyStatus,
    state.subjectData?.occupancyStatus, state.subjectData?.plannedChanges,
    state.incomeApproachData,
    hasImprovements, activeScenario
  ]);

  // Get scenario theme colors
  const scenarioColors = useMemo(() => {
    return activeScenario ? getScenarioColors(activeScenario.name) : getScenarioColors('As Is');
  }, [activeScenario]);

  const themeAccent = useMemo(() => {
    return activeScenario ? getScenarioAccentColor(activeScenario.name) : '#0da1c7';
  }, [activeScenario]);

  // Check if Cost Segregation is enabled
  const isCostSegEnabled = state.subjectData?.costSegregationEnabled === true;

  // Filter tabs based on active scenario's approaches
  const availableTabs = useMemo(() => {
    if (!activeScenario) return ALL_TABS;

    const approachIds = activeScenario.approaches.map(name => APPROACH_NAME_TO_ID[name]).filter(Boolean);

    // Note: HBU and Market Analysis are now in Review page
    const combinedTabs = [...approachIds];

    // Add Cost Segregation tab if enabled AND Cost Approach is selected
    if (isCostSegEnabled && approachIds.includes('cost')) {
      combinedTabs.push('costseg');
    }

    // Return in proper display order (with costseg after cost)
    const orderedTabs = [...ALL_TABS];
    if (isCostSegEnabled) {
      // Insert costseg after cost in the order
      const costIndex = orderedTabs.indexOf('cost');
      if (costIndex !== -1) {
        orderedTabs.splice(costIndex + 1, 0, 'costseg');
      }
    }

    return orderedTabs.filter(tab => combinedTabs.includes(tab));
  }, [activeScenario, isCostSegEnabled]);

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
      <h2 className="text-lg font-bold text-harken-dark dark:text-white mb-1">Valuation Analysis</h2>
      <p className="text-sm text-harken-gray-med dark:text-slate-400 mb-2">
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
              className={`w-full text-left px-4 py-3 rounded-lg text-sm flex items-center gap-3 transition-all border-l-4 ${isActive
                  ? `${config.bgClass} font-medium ${config.borderClass}`
                  : 'text-harken-gray dark:text-slate-200 hover:bg-harken-gray-light dark:hover:bg-elevation-3 border-l-transparent'
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
        <div className="text-sm font-medium text-slate-800 dark:text-white">
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
        <h3 className="text-lg font-bold text-harken-dark dark:text-white flex items-center gap-2">
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
            <p className="text-xs text-slate-700 dark:text-slate-200">
              {guidance.context}
            </p>
          </div>
        </div>
      </div>

      {/* Key Assumptions */}
      <div className="bg-surface-2 dark:bg-elevation-2 dark:bg-elevation-1 border border-light-border dark:border-dark-border dark:border-dark-border rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle2 className="text-accent-teal-mint dark:text-green-400" size={16} />
          <h4 className="text-sm font-semibold text-slate-800 dark:text-white">Key Assumptions</h4>
        </div>
        <ul className="space-y-2">
          {guidance.assumptions.map((assumption, i) => (
            <li key={i} className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2">
              <span className="w-1 h-1 rounded-full bg-green-400 mt-1.5 shrink-0" />
              {assumption}
            </li>
          ))}
        </ul>
      </div>

      {/* Common Pitfalls */}
      <div className="bg-accent-amber-gold-light dark:bg-amber-900/30 border border-accent-amber-gold dark:border-amber-800 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="text-amber-600 dark:text-amber-400" size={16} />
          <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-200">Common Pitfalls</h4>
        </div>
        <ul className="space-y-2">
          {guidance.pitfalls.map((pitfall, i) => (
            <li key={i} className="text-xs text-accent-amber-gold dark:text-amber-300 flex items-start gap-2">
              <span className="w-1 h-1 rounded-full bg-amber-400 mt-1.5 shrink-0" />
              {pitfall}
            </li>
          ))}
        </ul>
      </div>

      {/* USPAP Requirements */}
      <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="text-blue-600 dark:text-blue-400" size={16} />
          <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-200">USPAP</h4>
        </div>
        <p className="text-xs text-blue-800 dark:text-blue-300">
          {guidance.uspap}
        </p>
      </div>

      {/* Tips */}
      <div className="bg-accent-teal-mint-light dark:bg-green-900/30 border border-accent-teal-mint dark:border-green-800 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="text-accent-teal-mint dark:text-green-400" size={16} />
          <h4 className="text-sm font-semibold text-green-900 dark:text-green-200">Tips</h4>
        </div>
        <ul className="space-y-2">
          {guidance.tips.map((tip, i) => (
            <li key={i} className="text-xs text-accent-teal-mint dark:text-green-300 flex items-start gap-2">
              <span className="w-1 h-1 rounded-full bg-green-400 mt-1.5 shrink-0" />
              {tip}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  // Get approach name for contextual market data
  const getApproachName = (tabId: string) => {
    switch (tabId) {
      case 'sales': return 'Sales Comparison';
      case 'income': return 'Income Approach';
      case 'cost': return 'Cost Approach';
      case 'land': return 'Land Valuation';
      default: return 'Sales Comparison';
    }
  };

  // Right Sidebar - Values Panel (scenario-specific)
  // Uses ReconciliationSummary and ContextualMarketData components
  const helpSidebarValues = (
    <div className="space-y-4">
      {/* Scenario Header */}
      <div>
        <h3 className="text-lg font-bold text-harken-dark dark:text-white">Values Overview</h3>
        <p className="text-xs text-slate-500 mt-1">
          {activeScenario?.name} Scenario
        </p>
      </div>

      {/* Reconciliation Summary - Editable weights with hover-reveal slider */}
      <ReconciliationSummary
        scenarioId={activeScenario?.id || 1}
        propertyType={state.propertyType || 'commercial'}
        unitBasis="sf"
        totalUnits={5812} // TODO: Get from subject data
      />

      {/* Contextual Market Data - Changes based on active approach */}
      <ContextualMarketData
        activeApproach={getApproachName(activeTab)}
        scenarioId={activeScenario?.id || 1}
      />

      {/* Scenario Comparison (if multiple scenarios) */}
      {state.scenarios.length > 1 && (
        <div className="bg-violet-50 dark:bg-violet-900/30 border border-violet-200 dark:border-violet-800 rounded-xl p-4">
          <div className="text-xs font-semibold text-violet-900 dark:text-violet-200 mb-2">
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
                  <span className="text-xs text-slate-700 dark:text-slate-200">{scenario.name}</span>
                </div>
                <span className="text-xs font-medium text-slate-800 dark:text-white">
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

      <div className="bg-surface-3 dark:bg-elevation-subtle border border-light-border dark:border-dark-border dark:border-dark-border rounded-lg p-3 text-xs text-slate-600 dark:text-slate-400">
        Hover over approach values to adjust weights. Values update automatically as you make changes.
      </div>
    </div>
  );

  // Keep full-width content for grid-heavy views
  const isFullWidthView = activeTab === 'sales' || activeTab === 'income' || activeTab === 'cost' || activeTab === 'land' || activeTab === 'multifamily' || activeTab === 'costseg';

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
          <div className="flex-shrink-0 bg-surface-1 dark:bg-elevation-1 border-b border-light-border dark:border-dark-border dark:border-dark-border px-6 py-3 flex items-center justify-between z-40 shadow-sm">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <span style={{ color: APPROACH_CONFIG.sales.color }}><ChartIcon className="w-5 h-5" /></span>
                Sales Comparison Grid
              </h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-surface-3 dark:bg-elevation-subtle text-slate-600 dark:text-slate-200">
                {activeScenario?.name}
              </span>
            </div>
            <div className="flex items-center gap-4">
              {/* Analysis Mode Toggle */}
              <div className="flex items-center bg-surface-3 dark:bg-elevation-subtle rounded-lg p-1 border border-light-border dark:border-dark-border dark:border-harken-gray">
                <button
                  onClick={() => setAnalysisMode('standard')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md flex items-center gap-2 transition-all ${analysisMode === 'standard'
                      ? 'bg-surface-1 dark:bg-dark-input text-slate-800 dark:text-white shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-harken-gray-light'
                    }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  Standard
                </button>
                <button
                  onClick={() => setAnalysisMode('residual')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md flex items-center gap-2 transition-all ${analysisMode === 'residual'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-harken-gray-light'
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
            <Suspense fallback={<GridLoader />}>
              <SalesGrid
                properties={PROPERTIES}
                values={MOCK_VALUES}
                analysisMode={analysisMode}
                scenarioId={activeScenario?.id}
                gridConfig={subjectData?.gridConfiguration}
              />
            </Suspense>
          </div>
        </div>
      ) : activeTab === 'income' ? (
        <div className="absolute inset-0 flex flex-col">
          {/* Income Approach Header Bar */}
          <div className="flex-shrink-0 bg-surface-1 dark:bg-elevation-1 border-b border-light-border dark:border-dark-border dark:border-dark-border px-6 py-3 flex items-center justify-between z-40 shadow-sm">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Wallet className="w-5 h-5" style={{ color: APPROACH_CONFIG.income.color }} />
                Income Approach Analysis
              </h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-surface-3 dark:bg-elevation-subtle text-slate-600 dark:text-slate-200">
                {activeScenario?.name}
              </span>
            </div>
          </div>

          {/* Income Approach Grid */}
          <div className="flex-1 min-h-0 overflow-auto">
            <Suspense fallback={<GridLoader />}>
              <IncomeApproachGrid
                initialData={state.incomeApproachData}
                onDataChange={setIncomeApproachData}
                showGuidancePanel={true}
                scenarioId={activeScenario?.id}
                visibility={{
                  rentComparableGrid: visibility.rentComparableGrid,
                  expenseComparableGrid: visibility.expenseComparableGrid,
                }}
              />
            </Suspense>
          </div>
        </div>
      ) : activeTab === 'cost' ? (
        <div className="absolute inset-0 flex flex-col">
          {/* Cost Approach Header Bar */}
          <div className="flex-shrink-0 bg-surface-1 dark:bg-elevation-1 border-b border-light-border dark:border-dark-border dark:border-dark-border px-6 py-3 flex items-center justify-between z-40 shadow-sm">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <HardHat className="w-5 h-5" style={{ color: APPROACH_CONFIG.cost.color }} />
                Cost Approach Analysis
              </h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-surface-3 dark:bg-elevation-subtle text-slate-600 dark:text-slate-200">
                {activeScenario?.name}
              </span>
            </div>
          </div>

          {/* Cost Approach Grid */}
          <div className="flex-1 min-h-0 overflow-auto">
            <Suspense fallback={<GridLoader />}>
              <CostApproachGrid scenarioId={activeScenario?.id} />
            </Suspense>
          </div>
        </div>
      ) : activeTab === 'land' ? (
        <div className="absolute inset-0 flex flex-col">
          {/* Land Valuation Header Bar */}
          <div className="flex-shrink-0 bg-surface-1 dark:bg-elevation-1 border-b border-light-border dark:border-dark-border dark:border-dark-border px-6 py-3 flex items-center justify-between z-40 shadow-sm">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <span style={{ color: APPROACH_CONFIG.land.color }}><LandIcon className="w-5 h-5" /></span>
                Land Valuation - Sales Comparison
              </h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-surface-3 dark:bg-elevation-subtle text-slate-600 dark:text-slate-200">
                {activeScenario?.name}
              </span>
            </div>
          </div>

          {/* Land Sales Grid */}
          <div className="flex-1 min-h-0">
            <Suspense fallback={<GridLoader />}>
              <LandSalesGrid />
            </Suspense>
          </div>
        </div>
      ) : activeTab === 'multifamily' ? (
        <div className="absolute inset-0 flex flex-col">
          {/* Multi-Family Header Bar */}
          <div className="flex-shrink-0 bg-surface-1 dark:bg-elevation-1 border-b border-light-border dark:border-dark-border dark:border-dark-border px-6 py-3 flex items-center justify-between z-40 shadow-sm">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <span style={{ color: APPROACH_CONFIG.multifamily.color }}><ResidentialIcon className="w-5 h-5" /></span>
                Multi-Family Rental Analysis
              </h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-surface-3 dark:bg-elevation-subtle text-slate-600 dark:text-slate-200">
                {activeScenario?.name}
              </span>
            </div>
          </div>

          {/* Multi-Family Grid */}
          <div className="flex-1 min-h-0">
            <Suspense fallback={<GridLoader />}>
              <MultiFamilyGrid scenarioId={activeScenario?.id} />
            </Suspense>
          </div>
        </div>
      ) : activeTab === 'costseg' ? (
        <div className="absolute inset-0 flex flex-col">
          <Suspense fallback={<GridLoader />}>
            <CostSegTab />
          </Suspense>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
          <PlaceholderContent
            title={APPROACH_CONFIG[activeTab as keyof typeof APPROACH_CONFIG]?.label || ''}
            scenarioName={activeScenario?.name}
          />
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

function PlaceholderContent({ title, scenarioName }: { title: string; scenarioName?: string }) {
  return (
    <div className="bg-surface-1 dark:bg-elevation-1 border border-light-border dark:border-dark-border rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-[#1c3643] dark:text-white border-b-2 border-light-border dark:border-harken-gray pb-3">
          {title}
        </h3>
        <span className="text-xs px-2 py-0.5 rounded-full bg-surface-3 dark:bg-elevation-subtle text-slate-600 dark:text-slate-200">
          {scenarioName}
        </span>
      </div>
      <p className="text-sm text-harken-gray dark:text-slate-400">
        Analysis content for {title} ({scenarioName} scenario) will be displayed here...
      </p>
    </div>
  );
}
