import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Wallet, PieChart, Activity, Check, LayoutGrid, Home, Warehouse, Store, TrendingUp, DollarSign, CalendarRange, ArrowRightLeft, Table2, ChevronDown, ChevronUp, FileText, Receipt, Calculator, CheckCircle2 } from 'lucide-react';
import type { IncomeData, ExpenseData, LineItem, FinancialSummary, PropertyMeta, ValuationData, IncomeApproachState, IncomeSubTab } from '../types';
import type { RentComp } from '../rentTypes';
import type { ExpenseComp } from '../expenseTypes';
import { IncomeTextEditor } from './IncomeTextEditor';
import type { RevenueContextData, ExpensesContextData, ValuationContextData } from './IncomeTextEditor';
import { InputRow } from './InputRow';
import { FinancialChart } from './FinancialChart';
import { RiskAnalysisModal } from './RiskAnalysisModal';
import { DCFProjectionTable } from './DCFProjectionTable';
import { RentComparableGrid } from './RentComparableGrid';
import { ExpenseComparableGrid } from './ExpenseComparableGrid';
import { CapRateCalculator } from './CapRateCalculator';
import { RentCompLinkingPanel } from './RentCompLinkingPanel';
import { NotesEditorModal } from '../../../components/NotesEditorModal';
import type { SalesCompComparable } from './CapRateCalculator';
import { INITIAL_INCOME_APPROACH_STATE } from '../constants';
import { useWizard } from '../../../context/WizardContext';
// Import Sales Comparison mock data for Cap Rate Calculator pre-population
import { MOCK_VALUES as SALES_COMP_VALUES } from '../../sales-comparison/constants';

// Sub-tab configuration for the workflow stepper (IncomeSubTab imported from types)
const INCOME_SUBTABS: Array<{
  id: IncomeSubTab;
  label: string;
  shortLabel: string;
  Icon: React.ElementType;
  description: string;
}> = [
    { id: 'rent-comps', label: 'Rent Comparables', shortLabel: 'Rent Comps', Icon: FileText, description: 'Analyze market rents from comparable properties' },
    { id: 'expense-comps', label: 'Expense Comparables', shortLabel: 'Expense Comps', Icon: Receipt, description: 'Review operating expenses from similar properties' },
    { id: 'pro-forma', label: 'Pro Forma', shortLabel: 'Pro Forma', Icon: Table2, description: 'Build income/expense projections for subject property' },
    { id: 'valuation', label: 'Valuation', shortLabel: 'Valuation', Icon: Calculator, description: 'Apply cap rate and DCF analysis to derive value' },
  ];

const generateId = () => Math.random().toString(36).substring(2, 11);

interface IncomeSubTabVisibility {
  rentComparableGrid?: boolean;
  expenseComparableGrid?: boolean;
}

/** Component-specific data passed from PropertyComponent */
interface ComponentData {
  id: string;
  name: string;
  category: 'commercial' | 'residential' | 'land';
  propertyType: string;
  squareFootage: number | null;
  unitCount: number | null;
  /** SF source - when 'unknown', skip $/SF displays */
  sfSource?: 'measured' | 'estimated' | 'unknown';
}

interface IncomeApproachGridProps {
  initialData?: IncomeApproachState | null;
  onDataChange?: (data: IncomeApproachState) => void;
  showGuidancePanel?: boolean;
  scenarioId?: number;
  visibility?: IncomeSubTabVisibility;
  /** Rent comparable mode - determines field configuration (commercial vs residential) */
  rentCompMode?: 'commercial' | 'residential';
  /** Component-specific data - overrides global state when provided */
  componentData?: ComponentData;
}

export const IncomeApproachGrid: React.FC<IncomeApproachGridProps> = ({
  initialData,
  onDataChange,
  showGuidancePanel: _showGuidancePanel = true,
  scenarioId,
  visibility = { rentComparableGrid: true, expenseComparableGrid: true },
  rentCompMode = 'commercial',
  componentData,
}) => {
  // showGuidancePanel is reserved for future use
  void _showGuidancePanel;
  const { state, setApproachConclusion, getActiveScenario } = useWizard();

  // Get scenario from WizardContext (not local state - removes redundant scenario switcher)
  const activeScenario = getActiveScenario();
  const scenarioName = activeScenario?.name || 'As Is';

  // Property type: use component data if provided, otherwise fall back to global state
  const propertyType = (
    componentData?.propertyType || 
    state.propertySubtype || 
    state.propertyType || 
    'office'
  ) as PropertyMeta['type'];

  // --- State ---
  const [showChart, setShowChart] = useState(true);
  const [showCapRateCalculator, setShowCapRateCalculator] = useState(false);

  // Rent comp linking state
  const [linkingIncomeItem, setLinkingIncomeItem] = useState<LineItem | null>(null);

  // Handle opening rent comp linking panel for an income line
  const handleLinkComps = (item: LineItem) => {
    setLinkingIncomeItem(item);
  };

  // Handle linking a rent comp to an income line
  const handleLink = (incomeItemId: string, rentCompId: string) => {
    setIncomeData(prev => ({
      ...prev,
      rentalIncome: prev.rentalIncome.map(item => {
        if (item.id === incomeItemId) {
          const currentLinks = item.linkedRentCompIds || [];
          if (!currentLinks.includes(rentCompId)) {
            return { ...item, linkedRentCompIds: [...currentLinks, rentCompId] };
          }
        }
        return item;
      }),
    }));
    // Update the linkingIncomeItem state to reflect the change
    setLinkingIncomeItem(prev => {
      if (prev && prev.id === incomeItemId) {
        const currentLinks = prev.linkedRentCompIds || [];
        if (!currentLinks.includes(rentCompId)) {
          return { ...prev, linkedRentCompIds: [...currentLinks, rentCompId] };
        }
      }
      return prev;
    });
  };

  // Handle unlinking a rent comp from an income line
  const handleUnlink = (incomeItemId: string, rentCompId: string) => {
    setIncomeData(prev => ({
      ...prev,
      rentalIncome: prev.rentalIncome.map(item => {
        if (item.id === incomeItemId) {
          const currentLinks = item.linkedRentCompIds || [];
          return { ...item, linkedRentCompIds: currentLinks.filter(id => id !== rentCompId) };
        }
        return item;
      }),
    }));
    // Update the linkingIncomeItem state to reflect the change
    setLinkingIncomeItem(prev => {
      if (prev && prev.id === incomeItemId) {
        const currentLinks = prev.linkedRentCompIds || [];
        return { ...prev, linkedRentCompIds: currentLinks.filter(id => id !== rentCompId) };
      }
      return prev;
    });
  };

  // Sub-tab state for workflow navigation
  const [activeSubTab, setActiveSubTab] = useState<IncomeSubTab>('pro-forma');

  // Track completion status for each sub-tab (for workflow indicator) - persist from parent
  const [completedSubTabs, setCompletedSubTabs] = useState<Set<IncomeSubTab>>(
    new Set(initialData?.completedSubTabs || [])
  );

  // Determine which sub-tabs are available based on visibility
  const availableSubTabs = useMemo(() => {
    return INCOME_SUBTABS.filter(tab => {
      if (tab.id === 'rent-comps') return visibility.rentComparableGrid !== false;
      if (tab.id === 'expense-comps') return visibility.expenseComparableGrid !== false;
      return true; // pro-forma and valuation always available
    });
  }, [visibility.rentComparableGrid, visibility.expenseComparableGrid]);

  // Keep sqFt and unitCount editable locally
  // Priority: componentData > initialData > 0
  const [localPropertyMeta, setLocalPropertyMeta] = useState({
    sqFt: componentData?.squareFootage || initialData?.propertyMeta?.sqFt || 0,
    unitCount: componentData?.unitCount || initialData?.propertyMeta?.unitCount || 0,
  });

  // Update local state when componentData changes (switching between component tabs)
  useEffect(() => {
    if (componentData) {
      setLocalPropertyMeta({
        sqFt: componentData.squareFootage || 0,
        unitCount: componentData.unitCount || 0,
      });
    }
  }, [componentData?.id, componentData?.squareFootage, componentData?.unitCount]);

  // Combine for display and calculations - memoized to avoid infinite loops in useEffect
  const propertyMeta: PropertyMeta = useMemo(() => ({
    type: propertyType,
    sqFt: localPropertyMeta.sqFt,
    unitCount: localPropertyMeta.unitCount,
  }), [propertyType, localPropertyMeta.sqFt, localPropertyMeta.unitCount]);
  
  // Check if SF is actually known (not 'unknown' source and value > 0)
  const isSfKnown = useMemo(() => {
    // If componentData explicitly says 'unknown', SF is not reliable
    if (componentData?.sfSource === 'unknown') return false;
    // If SF is 0 or null, it's not known
    return localPropertyMeta.sqFt > 0;
  }, [componentData?.sfSource, localPropertyMeta.sqFt]);

  // Initialize sqFt from Subject Data (improvements inventory) if available - runs once on mount
  // Only applies when NO componentData is provided (fallback to global state)
  useEffect(() => {
    // Skip if componentData is provided - use component's own data instead
    if (componentData) return;
    
    const parcels = state.improvementsInventory?.parcels;
    // Only initialize if sqFt is 0 (unset)
    if (parcels && parcels.length > 0) {
      setLocalPropertyMeta(prev => {
        // Don't update if already set
        if (prev.sqFt > 0) return prev;

        // Sum all building areas across all parcels
        let totalSqFt = 0;
        let totalUnits = 0;

        parcels.forEach(parcel => {
          parcel.buildings?.forEach(bldg => {
            bldg.areas?.forEach(area => {
              totalSqFt += area.squareFootage || 0;
              // Count apartment/unit-type areas as units
              if (area.type === 'apartment' || area.type === 'other') {
                totalUnits += 1;
              }
            });
          });
        });

        if (totalSqFt > 0) {
          return {
            ...prev,
            sqFt: totalSqFt,
            ...(totalUnits > 0 ? { unitCount: totalUnits } : {})
          };
        }
        return prev;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.improvementsInventory]);

  const [incomeData, setIncomeData] = useState<IncomeData>(
    initialData?.incomeData || INITIAL_INCOME_APPROACH_STATE.incomeData
  );

  const [expenseData, setExpenseData] = useState<ExpenseData>(
    initialData?.expenseData || INITIAL_INCOME_APPROACH_STATE.expenseData
  );

  const [valuationData, setValuationData] = useState<ValuationData>(
    initialData?.valuationData || INITIAL_INCOME_APPROACH_STATE.valuationData
  );

  // Rent & Expense Comparables (persisted through parent)
  const [rentComparables, setRentComparables] = useState<RentComp[]>(
    initialData?.rentComparables || []
  );
  const [rentCompNotes, setRentCompNotes] = useState(
    initialData?.rentCompNotes || ''
  );
  const [expenseComparables, setExpenseComparables] = useState<ExpenseComp[]>(
    initialData?.expenseComparables || []
  );
  const [expenseCompNotes, setExpenseCompNotes] = useState(
    initialData?.expenseCompNotes || ''
  );

  const [isRiskModalOpen, setIsRiskModalOpen] = useState(false);
  const [showDetailedDCF, setShowDetailedDCF] = useState(false);

  // Notes Modal State
  const [activeNoteParams, setActiveNoteParams] = useState<{
    listType: 'rental' | 'reimbursement' | 'other_income' | 'expense' | 'reserve';
    item: LineItem;
  } | null>(null);

  const handleEditNotes = (listType: 'rental' | 'reimbursement' | 'other_income' | 'expense' | 'reserve', item: LineItem) => {
    setActiveNoteParams({ listType, item });
  };

  const handleSaveNotes = () => {
    // Current implementation saves onInput/state update immediately in the grid state
    // So this just closes the modal, but we could add explicit save logic here if needed
    setActiveNoteParams(null);
  };

  const handleNoteInput = (content: string) => {
    if (activeNoteParams) {
      updateLineItem(activeNoteParams.listType, { ...activeNoteParams.item, comments: content });
      // Also update local state to keep editor in sync
      setActiveNoteParams(prev => prev ? ({ ...prev, item: { ...prev.item, comments: content } }) : null);
    }
  };

  // Notify parent of data changes
  useEffect(() => {
    if (onDataChange) {
      onDataChange({
        propertyMeta,
        incomeData,
        expenseData,
        valuationData,
        scenario: 'as-stabilized', // Default scenario - actual scenario is managed by WizardContext
        showGuidance: true,
        // Comparable data (persisted)
        rentComparables,
        rentCompNotes,
        expenseComparables,
        expenseCompNotes,
        // Workflow tracking
        completedSubTabs: Array.from(completedSubTabs),
      });
    }
  }, [propertyMeta, incomeData, expenseData, valuationData, onDataChange, rentComparables, rentCompNotes, expenseComparables, expenseCompNotes, completedSubTabs]);

  // --- Calculations ---
  const summary = useMemo<FinancialSummary>(() => {
    const potentialBaseRent = incomeData.rentalIncome.reduce((acc, item) => acc + item.amount, 0);
    const potentialMarketRent = incomeData.rentalIncome.reduce((acc, item) => acc + ((item.marketRentPerSf || 0) * (item.itemSqFt || 0)), 0);
    const totalReimbursements = incomeData.expenseReimbursements.reduce((acc, item) => acc + item.amount, 0);
    const totalOtherIncome = incomeData.otherIncome.reduce((acc, item) => acc + item.amount, 0);
    const potentialGrossRevenue = potentialBaseRent + totalReimbursements + totalOtherIncome;
    const potentialGrossIncome = potentialGrossRevenue;
    const vacancyAmount = potentialGrossIncome * (incomeData.vacancyRate / 100);
    const effectiveGrossIncome = potentialGrossIncome - vacancyAmount;
    const totalExpenses = expenseData.expenses.reduce((acc, item) => acc + item.amount, 0);
    const netOperatingIncome = effectiveGrossIncome - totalExpenses;
    const totalReserves = expenseData.reserves.reduce((acc, item) => acc + item.amount, 0);
    const adjustedNetOperatingIncome = netOperatingIncome - totalReserves;
    const expenseRatio = effectiveGrossIncome > 0 ? (totalExpenses / effectiveGrossIncome) * 100 : 0;
    const safeSqFt = propertyMeta.sqFt > 0 ? propertyMeta.sqFt : 1;

    return {
      potentialBaseRent,
      totalReimbursements,
      totalOtherIncome,
      potentialGrossRevenue,
      potentialGrossIncome,
      effectiveGrossIncome,
      totalExpenses,
      netOperatingIncome,
      totalReserves,
      adjustedNetOperatingIncome,
      expenseRatio,
      incomePerSf: effectiveGrossIncome / safeSqFt,
      expensesPerSf: totalExpenses / safeSqFt,
      noiPerSf: netOperatingIncome / safeSqFt,
      potentialMarketRent,
      lossToLease: potentialMarketRent - potentialBaseRent
    };
  }, [incomeData, expenseData, propertyMeta.sqFt]);

  // Direct Cap Value
  const directCapValue = (valuationData.marketCapRate > 0)
    ? summary.netOperatingIncome / (valuationData.marketCapRate / 100)
    : 0;

  // DCF Analysis
  const dcfAnalysis = useMemo(() => {
    const years = valuationData.holdingPeriod;
    const growth = valuationData.annualGrowthRate / 100;
    const discount = valuationData.discountRate / 100;
    const terminalCap = valuationData.terminalCapRate / 100;
    const sellingCosts = 0.02;

    let cumulativePV = 0;
    let currentNOI = summary.netOperatingIncome;

    for (let i = 1; i <= years; i++) {
      const pvFactor = 1 / Math.pow(1 + discount, i);
      cumulativePV += currentNOI * pvFactor;
      currentNOI = currentNOI * (1 + growth);
    }

    const grossReversionValue = currentNOI / terminalCap;
    const netReversionValue = grossReversionValue * (1 - sellingCosts);
    const pvReversion = netReversionValue / Math.pow(1 + discount, years);

    return {
      totalValue: cumulativePV + pvReversion,
      pvCashFlows: cumulativePV,
      pvReversion: pvReversion,
      reversionYearNOI: currentNOI
    };
  }, [summary.netOperatingIncome, valuationData]);

  // Sync concluded value to WizardContext when scenarioId is provided
  useEffect(() => {
    if (scenarioId !== undefined && directCapValue > 0) {
      setApproachConclusion(scenarioId, 'Income Approach', Math.round(directCapValue));
    }
  }, [scenarioId, directCapValue, setApproachConclusion]);

  const safeSqFt = propertyMeta.sqFt || 1;

  // Sensitivity Matrix
  const sensitivityRows = useMemo(() => {
    const baseCap = valuationData.marketCapRate;
    const steps = [-0.5, -0.25, 0, 0.25, 0.5];
    return steps.map(step => {
      const rate = baseCap + step;
      const val = (rate > 0) ? summary.netOperatingIncome / (rate / 100) : 0;
      return {
        rate: rate.toFixed(2),
        value: val,
        psf: val / safeSqFt,
        isSelected: step === 0
      };
    });
  }, [valuationData.marketCapRate, summary.netOperatingIncome, safeSqFt]);

  // Extract income property comparables from Sales Comparison Grid
  // These have both sale price and NOI for cap rate extraction
  const salesCompComparables = useMemo((): SalesCompComparable[] => {
    const comps: SalesCompComparable[] = [];

    // Iterate through all properties in the sales comparison data
    Object.entries(SALES_COMP_VALUES).forEach(([propId, propValues]) => {
      // Skip subject property
      if (propId === 'subject') return;

      const price = propValues?.price?.value;
      const noi = propValues?.noi_at_sale?.value;
      const name = propValues?.identification?.value;
      const address = propValues?.address_row?.value;

      // Only include comps that have both price and NOI
      if (typeof price === 'number' && price > 0 &&
        typeof noi === 'number' && noi > 0) {
        comps.push({
          id: propId,
          name: typeof name === 'string' ? name : propId,
          address: typeof address === 'string' ? address : undefined,
          salePrice: price,
          noi: noi,
        });
      }
    });

    return comps;
  }, []); // MOCK_VALUES is static, so no dependencies needed

  // --- Handlers ---
  const updateLineItem = (
    listType: 'rental' | 'reimbursement' | 'other_income' | 'expense' | 'reserve',
    updatedItem: LineItem
  ) => {
    if (listType === 'rental') {
      setIncomeData(prev => ({ ...prev, rentalIncome: prev.rentalIncome.map(i => i.id === updatedItem.id ? updatedItem : i) }));
    } else if (listType === 'reimbursement') {
      setIncomeData(prev => ({ ...prev, expenseReimbursements: prev.expenseReimbursements.map(i => i.id === updatedItem.id ? updatedItem : i) }));
    } else if (listType === 'other_income') {
      setIncomeData(prev => ({ ...prev, otherIncome: prev.otherIncome.map(i => i.id === updatedItem.id ? updatedItem : i) }));
    } else if (listType === 'reserve') {
      setExpenseData(prev => ({ ...prev, reserves: prev.reserves.map(i => i.id === updatedItem.id ? updatedItem : i) }));
    } else {
      setExpenseData(prev => ({ ...prev, expenses: prev.expenses.map(i => i.id === updatedItem.id ? updatedItem : i) }));
    }
  };

  const deleteLineItem = (listType: 'rental' | 'reimbursement' | 'other_income' | 'expense' | 'reserve', id: string) => {
    if (listType === 'rental') {
      setIncomeData(prev => ({ ...prev, rentalIncome: prev.rentalIncome.filter(i => i.id !== id) }));
    } else if (listType === 'reimbursement') {
      setIncomeData(prev => ({ ...prev, expenseReimbursements: prev.expenseReimbursements.filter(i => i.id !== id) }));
    } else if (listType === 'other_income') {
      setIncomeData(prev => ({ ...prev, otherIncome: prev.otherIncome.filter(i => i.id !== id) }));
    } else if (listType === 'reserve') {
      setExpenseData(prev => ({ ...prev, reserves: prev.reserves.filter(i => i.id !== id) }));
    } else {
      setExpenseData(prev => ({ ...prev, expenses: prev.expenses.filter(i => i.id !== id) }));
    }
  };

  const addLineItem = (listType: 'rental' | 'reimbursement' | 'other_income' | 'expense' | 'reserve') => {
    const newItem = { id: generateId(), name: '', amount: 0, itemSqFt: 0 };
    if (listType === 'rental') setIncomeData(prev => ({ ...prev, rentalIncome: [...prev.rentalIncome, newItem] }));
    else if (listType === 'reimbursement') setIncomeData(prev => ({ ...prev, expenseReimbursements: [...prev.expenseReimbursements, newItem] }));
    else if (listType === 'other_income') setIncomeData(prev => ({ ...prev, otherIncome: [...prev.otherIncome, newItem] }));
    else if (listType === 'reserve') setExpenseData(prev => ({ ...prev, reserves: [...prev.reserves, newItem] }));
    else setExpenseData(prev => ({ ...prev, expenses: [...prev.expenses, newItem] }));
  };

  const AddButton = ({ label, onClick }: { label: string, onClick: () => void }) => (
    <button
      onClick={onClick}
      className="w-full mt-2 py-4 border-2 border-dashed border-border-muted dark:border-dark-border-muted rounded-xl flex items-center justify-center gap-2 text-slate-500 dark:text-slate-400 font-bold hover:border-harken-blue hover:text-harken-blue hover:bg-harken-blue/5 transition-all duration-300 group"
    >
      <div className="w-8 h-8 rounded-full bg-surface-3 dark:bg-elevation-subtle group-hover:bg-harken-blue/10 flex items-center justify-center transition-colors">
        <Plus size={18} className="text-slate-400 dark:text-slate-200 group-hover:text-harken-blue" />
      </div>
      {label}
    </button>
  );

  // Handle marking a sub-tab as complete
  const markSubTabComplete = (tabId: IncomeSubTab) => {
    setCompletedSubTabs(prev => new Set([...prev, tabId]));
  };

  // Navigate to next sub-tab
  const goToNextSubTab = () => {
    const currentIndex = availableSubTabs.findIndex(t => t.id === activeSubTab);
    if (currentIndex < availableSubTabs.length - 1) {
      markSubTabComplete(activeSubTab);
      setActiveSubTab(availableSubTabs[currentIndex + 1].id);
    }
  };

  return (
    <div className="h-full flex flex-col bg-harken-gray-light dark:bg-elevation-1 text-slate-900 dark:text-white font-sans overflow-hidden">

      {/* STICKY WORKFLOW STEPPER - Always visible */}
      <div className="flex-shrink-0 sticky top-0 z-40 bg-harken-gray-light dark:bg-elevation-1 px-6 pt-4 pb-2">
        <div className="bg-surface-1 dark:bg-elevation-1 rounded-xl p-4 border border-light-border dark:border-dark-border dark:border-dark-border shadow-sm">
          <div className="flex items-center justify-between">
            {availableSubTabs.map((tab, index) => {
              const Icon = tab.Icon;
              const isActive = activeSubTab === tab.id;
              const isCompleted = completedSubTabs.has(tab.id);
              const isPast = availableSubTabs.findIndex(t => t.id === activeSubTab) > index;

              return (
                <React.Fragment key={tab.id}>
                  {/* Step indicator */}
                  <button
                    onClick={() => setActiveSubTab(tab.id)}
                    className={`flex items-center gap-3 px-4 py-2 rounded-xl transition-all ${isActive
                      ? 'bg-harken-blue/10 text-harken-blue'
                      : isCompleted || isPast
                        ? 'text-accent-teal-mint dark:text-accent-teal-mint hover:bg-accent-teal-mint-light dark:hover:bg-accent-teal-mint-light'
                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-harken-gray-light hover:bg-surface-2 dark:bg-elevation-2 dark:hover:bg-elevation-3'
                      }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isActive
                      ? 'bg-harken-blue text-white'
                      : isCompleted || isPast
                        ? 'bg-accent-teal-mint text-white'
                        : 'bg-surface-4 dark:bg-elevation-muted text-slate-500 dark:text-slate-400'
                      }`}>
                      {isCompleted || isPast ? (
                        <CheckCircle2 size={16} />
                      ) : (
                        <Icon size={16} />
                      )}
                    </div>
                    <div className="text-left hidden md:block">
                      <div className={`text-xs font-bold uppercase tracking-wide ${isActive ? 'text-harken-blue' : isCompleted || isPast ? 'text-accent-teal-mint' : 'text-slate-400'
                        }`}>
                        Step {index + 1}
                      </div>
                      <div className={`text-sm font-bold ${isActive ? 'text-slate-800 dark:text-white' : 'text-slate-600 dark:text-slate-400'
                        }`}>
                        {tab.shortLabel}
                      </div>
                    </div>
                  </button>

                  {/* Connector line */}
                  {index < availableSubTabs.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 transition-colors ${isPast || isCompleted ? 'bg-accent-teal-mint' : 'bg-surface-4 dark:bg-elevation-muted'
                      }`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Sub-tab description - compact on smaller screens */}
          <div className="mt-2 pt-2 border-t border-light-border dark:border-dark-border dark:border-dark-border hidden sm:block">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {availableSubTabs.find(t => t.id === activeSubTab)?.description}
            </p>
          </div>
        </div>
      </div>

      {/* SCROLLABLE CONTENT AREA */}
      <div className="flex-1 overflow-y-auto px-6 pb-20">
        <div className="flex items-start gap-8">
          <div className="flex-grow space-y-6 min-w-0">

            {/* RENT COMPARABLES SUB-TAB */}
            {activeSubTab === 'rent-comps' && visibility.rentComparableGrid !== false && (
              <div className="animate-fade-in">
                <RentComparableGrid
                  rentComparables={rentComparables}
                  notes={rentCompNotes}
                  onCompsChange={setRentComparables}
                  onNotesChange={setRentCompNotes}
                  rentCompMode={rentCompMode}
                />
                <div className="flex justify-end mt-4">
                  <button
                    onClick={goToNextSubTab}
                    className="px-6 py-3 bg-harken-blue text-white font-bold rounded-xl hover:bg-harken-blue/90 transition-colors shadow-md"
                  >
                    Continue to Expense Comps
                  </button>
                </div>
              </div>
            )}

            {/* EXPENSE COMPARABLES SUB-TAB */}
            {activeSubTab === 'expense-comps' && visibility.expenseComparableGrid !== false && (
              <div className="animate-fade-in">
                <ExpenseComparableGrid
                  expenseComparables={expenseComparables}
                  notes={expenseCompNotes}
                  onCompsChange={setExpenseComparables}
                  onNotesChange={setExpenseCompNotes}
                />
                <div className="flex justify-end mt-4">
                  <button
                    onClick={goToNextSubTab}
                    className="px-6 py-3 bg-harken-blue text-white font-bold rounded-xl hover:bg-harken-blue/90 transition-colors shadow-md"
                  >
                    Continue to Pro Forma
                  </button>
                </div>
              </div>
            )}

            {/* PRO FORMA & VALUATION SUB-TABS (existing content) */}
            {(activeSubTab === 'pro-forma' || activeSubTab === 'valuation') && (
              <>
                {/* PROPERTY CONTEXT BAR */}
                <div className="bg-surface-1 dark:bg-elevation-1 rounded-xl p-4 border border-light-border dark:border-dark-border dark:border-dark-border shadow-sm flex flex-col lg:flex-row items-center justify-between gap-6">

                  {/* Left: Property Type Badge - Read-only from WizardContext */}
                  <div className="flex items-center gap-4 w-full lg:w-auto">
                    <div className="p-3 bg-harken-blue/10 rounded-xl text-harken-blue">
                      {propertyMeta.type === 'office' && <LayoutGrid size={24} />}
                      {propertyMeta.type === 'retail' && <Store size={24} />}
                      {propertyMeta.type === 'multifamily' && <Home size={24} />}
                      {propertyMeta.type === 'industrial' && <Warehouse size={24} />}
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Property Type</div>
                      <div className="font-black text-slate-800 dark:text-white capitalize text-lg leading-tight">
                        {propertyMeta.type}
                      </div>
                    </div>
                  </div>

                  <div className="hidden lg:block h-10 w-px bg-surface-3 dark:bg-elevation-subtle"></div>

                  {/* Inputs - Connected to Subject Data */}
                  <div className="flex items-center gap-8 flex-grow w-full lg:w-auto justify-start">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                        Building SqFt
                        {state.improvementsInventory?.parcels?.some(p => p.buildings?.length > 0) && (
                          <span className="text-harken-blue ml-1">(from Subject Data)</span>
                        )}
                      </label>
                      <div className="flex items-center gap-2 group">
                        <input
                          type="number"
                          value={localPropertyMeta.sqFt}
                          onChange={(e) => setLocalPropertyMeta(prev => ({ ...prev, sqFt: parseFloat(e.target.value) || 0 }))}
                          className="bg-surface-1 dark:bg-elevation-1 border border-light-border dark:border-harken-gray rounded-lg px-3 py-1.5 font-bold text-slate-700 dark:text-slate-200 w-32 focus:ring-2 focus:ring-harken-blue focus:border-transparent outline-none transition-all"
                        />
                        <span className="text-xs font-bold text-slate-400 group-hover:text-harken-blue transition-colors">SF</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Unit Count</label>
                      <div className="flex items-center gap-2 group">
                        <input
                          type="number"
                          value={localPropertyMeta.unitCount}
                          onChange={(e) => setLocalPropertyMeta(prev => ({ ...prev, unitCount: parseFloat(e.target.value) || 0 }))}
                          className="bg-surface-1 dark:bg-elevation-1 border border-light-border dark:border-harken-gray rounded-lg px-3 py-1.5 font-bold text-slate-700 dark:text-slate-200 w-24 focus:ring-2 focus:ring-harken-blue focus:border-transparent outline-none transition-all"
                        />
                        <span className="text-xs font-bold text-slate-400 group-hover:text-harken-blue transition-colors">Units</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* TOP METRICS */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-surface-1 dark:bg-elevation-1 p-5 rounded-2xl shadow-sm border border-light-border dark:border-dark-border dark:border-dark-border flex flex-col justify-between">
                    <div className="text-xs font-bold text-slate-400 uppercase">Indicated Value</div>
                    <div className="text-2xl font-black text-harken-blue">${directCapValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                  </div>
                  <div className="bg-surface-1 dark:bg-elevation-1 p-5 rounded-2xl shadow-sm border border-light-border dark:border-dark-border dark:border-dark-border flex flex-col justify-between">
                    <div className="text-xs font-bold text-slate-400 uppercase">Price / SF</div>
                    <div className="text-2xl font-black text-slate-800 dark:text-white">
                      {isSfKnown ? `$${(directCapValue / safeSqFt).toFixed(2)}` : '—'}
                    </div>
                    {!isSfKnown && (
                      <div className="text-[10px] text-amber-600 dark:text-amber-400 mt-1">SF unknown</div>
                    )}
                  </div>
                  <div className="bg-surface-1 dark:bg-elevation-1 p-5 rounded-2xl shadow-sm border border-light-border dark:border-dark-border dark:border-dark-border flex flex-col justify-between">
                    <div className="text-xs font-bold text-slate-400 uppercase">Expense Ratio</div>
                    <div className="text-2xl font-black text-slate-800 dark:text-white">{summary.expenseRatio.toFixed(1)}%</div>
                  </div>
                  <div className="bg-surface-1 dark:bg-elevation-1 p-5 rounded-2xl shadow-sm border border-light-border dark:border-dark-border dark:border-dark-border flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-1 bg-accent-teal-mint-light rounded-bl-xl">
                      <Check size={14} className="text-accent-teal-mint" />
                    </div>
                    <div className="text-xs font-bold text-slate-400 uppercase">Adjusted NOI</div>
                    <div className="text-2xl font-black text-accent-teal-mint">${summary.adjustedNetOperatingIncome.toLocaleString()}</div>
                  </div>
                </div>

                {/* Financial Summary Chart - Collapsible inline */}
                {(activeSubTab === 'pro-forma' || activeSubTab === 'valuation') && (
                  <div className="bg-surface-1 dark:bg-elevation-1 rounded-xl p-4 border border-light-border dark:border-dark-border dark:border-dark-border shadow-sm">
                    <button
                      onClick={() => setShowChart(!showChart)}
                      className="w-full flex items-center justify-between text-left"
                    >
                      <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <PieChart className="text-harken-blue" size={18} />
                        Income Waterfall
                      </h3>
                      {showChart ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                    {showChart && (
                      <div className="mt-4">
                        <FinancialChart summary={summary} />
                      </div>
                    )}
                  </div>
                )}

                {/* INCOME SECTION */}
                <div className="bg-surface-1 dark:bg-elevation-1 rounded-xl shadow-sm border border-light-border dark:border-dark-border dark:border-dark-border overflow-hidden">
                  <div className="p-8 pb-4">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-[#0da1c7]/10 rounded-2xl text-[#0da1c7]">
                          <Wallet size={24} />
                        </div>
                        <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Revenue Assumptions</h2>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-slate-400 font-bold uppercase">Effective Gross Income</div>
                        <div className="text-xl font-black text-slate-800 dark:text-white">${summary.effectiveGrossIncome.toLocaleString()}</div>
                      </div>
                    </div>

                    {/* RENTAL INCOME */}
                    <div className="mb-10">
                      <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 pl-2">Rent Roll</h3>
                      <div className="space-y-3">
                        {incomeData.rentalIncome.map(item => (
                          <InputRow
                            key={item.id}
                            placeholder="e.g. Market Rent (Base)"
                            totalPropertySqFt={propertyMeta.sqFt}
                            effectiveGrossIncome={summary.effectiveGrossIncome}
                            item={item}
                            variant="rental"
                            onChange={(updated) => updateLineItem('rental', updated)}
                            onDelete={(id) => deleteLineItem('rental', id)}
                            onEditNotes={(item) => handleEditNotes('rental', item)}
                            onLinkComps={handleLinkComps}
                            linkedCompCount={item.linkedRentCompIds?.length || 0}
                          />
                        ))}
                      </div>
                      <AddButton label="Add Tenant Lease" onClick={() => addLineItem('rental')} />
                    </div>

                    {/* REIMBURSEMENTS */}
                    <div className="mb-10">
                      <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 pl-2">Reimbursements</h3>
                      <div className="space-y-3">
                        {incomeData.expenseReimbursements.map(item => (
                          <InputRow
                            key={item.id}
                            placeholder="e.g. CAM Reimbursement"
                            totalPropertySqFt={propertyMeta.sqFt}
                            effectiveGrossIncome={summary.effectiveGrossIncome}
                            item={item}
                            variant="reimbursement"
                            onChange={(updated) => updateLineItem('reimbursement', updated)}
                            onDelete={(id) => deleteLineItem('reimbursement', id)}
                            onEditNotes={(item) => handleEditNotes('reimbursement', item)}
                          />
                        ))}
                      </div>
                      <AddButton label="Add Expense Recovery" onClick={() => addLineItem('reimbursement')} />
                    </div>

                    {/* VACANCY BOX */}
                    <div className="bg-surface-2 dark:bg-elevation-2 dark:bg-elevation-1/50 rounded-2xl p-6 border border-light-border dark:border-dark-border dark:border-dark-border flex items-center justify-between mb-8">
                      <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Vacancy & Credit Loss</label>
                        <p className="text-xs text-slate-400 mt-1 max-w-xs">Global vacancy rate applied to Potential Gross Income.</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="bg-surface-1 dark:bg-elevation-1 px-4 py-2 rounded-xl border border-light-border dark:border-dark-border dark:border-dark-border flex items-center gap-2 shadow-sm">
                          <input
                            type="number"
                            value={incomeData.vacancyRate}
                            onChange={(e) => setIncomeData({ ...incomeData, vacancyRate: parseFloat(e.target.value) || 0 })}
                            className="w-12 text-right font-black text-lg outline-none text-slate-800 dark:text-white bg-surface-1 dark:bg-elevation-1"
                          />
                          <span className="font-bold text-slate-400">%</span>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-bold text-rose-400 uppercase">Deduction</div>
                          <div className="text-lg font-bold text-rose-500">
                            (${(summary.potentialGrossIncome * (incomeData.vacancyRate / 100)).toLocaleString(undefined, { maximumFractionDigits: 0 })})
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="px-8 pb-8">
                    <IncomeTextEditor
                      label="Revenue Methodology Notes"
                      sectionType="revenue"
                      contextData={{
                        propertyType: propertyMeta.type,
                        sqFt: propertyMeta.sqFt,
                        unitCount: propertyMeta.unitCount,
                        rentalIncome: incomeData.rentalIncome,
                        reimbursements: incomeData.expenseReimbursements,
                        vacancyRate: incomeData.vacancyRate,
                        effectiveGrossIncome: summary.effectiveGrossIncome,
                        potentialGrossIncome: summary.potentialGrossIncome,
                        lossToLease: summary.lossToLease,
                        potentialMarketRent: summary.potentialMarketRent,
                      } as RevenueContextData}
                      value={incomeData.notes}
                      onChange={(val) => setIncomeData({ ...incomeData, notes: val })}
                    />
                  </div>
                </div>

                {/* EXPENSE SECTION */}
                <div className="bg-surface-1 dark:bg-elevation-1 rounded-xl shadow-sm border border-light-border dark:border-dark-border dark:border-dark-border overflow-hidden">
                  <div className="p-8 pb-4">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-amber-50 rounded-2xl text-amber-600">
                          <Activity size={24} />
                        </div>
                        <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Operating Expenses</h2>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-slate-400 font-bold uppercase">Total Expenses</div>
                        <div className="text-xl font-black text-amber-600">(${summary.totalExpenses.toLocaleString()})</div>
                      </div>
                    </div>

                    <div className="mb-10">
                      <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 pl-2">Expense Items</h3>
                      <div className="space-y-3">
                        {expenseData.expenses.map(item => (
                          <InputRow
                            key={item.id}
                            placeholder="e.g. Parking Income"
                            totalPropertySqFt={propertyMeta.sqFt}
                            effectiveGrossIncome={summary.effectiveGrossIncome}
                            item={item}
                            variant="expense"
                            onChange={(updated) => updateLineItem('expense', updated)}
                            onDelete={(id) => deleteLineItem('expense', id)}
                            onEditNotes={(item) => handleEditNotes('other_income', item)}
                          />
                        ))}
                      </div>
                      <AddButton label="Add Operating Expense" onClick={() => addLineItem('expense')} />
                    </div>

                    <div className="mb-10">
                      <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 pl-2">Replacement Reserves</h3>
                      <div className="space-y-3">
                        {expenseData.reserves.map(item => (
                          <InputRow
                            key={item.id}
                            item={item}
                            variant="reserve"
                            onChange={(updated) => updateLineItem('reserve', updated)}
                            onDelete={(id) => deleteLineItem('reserve', id)}
                            effectiveGrossIncome={summary.effectiveGrossIncome}
                            totalPropertySqFt={propertyMeta.sqFt}
                          />
                        ))}
                      </div>
                      <AddButton label="Add Capital Reserve" onClick={() => addLineItem('reserve')} />
                    </div>
                  </div>
                  <div className="px-8 pb-8">
                    <IncomeTextEditor
                      label="Expense Methodology Notes"
                      sectionType="expenses"
                      contextData={{
                        propertyType: propertyMeta.type,
                        sqFt: propertyMeta.sqFt,
                        expenses: expenseData.expenses,
                        reserves: expenseData.reserves,
                        expenseRatio: summary.expenseRatio,
                        expensesPerSf: summary.expensesPerSf,
                        totalExpenses: summary.totalExpenses,
                        totalReserves: summary.totalReserves,
                        effectiveGrossIncome: summary.effectiveGrossIncome,
                      } as ExpensesContextData}
                      value={expenseData.notes}
                      onChange={(val) => setExpenseData({ ...expenseData, notes: val })}
                    />
                  </div>
                </div>

                {/* VALUATION SECTION */}
                <div className="bg-surface-1 dark:bg-elevation-1 rounded-xl shadow-sm border border-light-border dark:border-dark-border dark:border-dark-border overflow-hidden">
                  <div className="p-8 bg-gradient-to-r from-accent-teal-mint-light to-white dark:from-accent-teal-mint/10 dark:to-harken-dark border-b-2 border-accent-teal-mint dark:border-accent-teal-mint/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-accent-teal-mint-light dark:bg-accent-teal-mint/10 rounded-2xl text-accent-teal-mint dark:text-accent-teal-mint border border-accent-teal-mint dark:border-accent-teal-mint/30">
                          <TrendingUp size={24} />
                        </div>
                        <div>
                          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Valuation Summary</h2>
                          <p className="text-accent-teal-mint dark:text-accent-teal-mint text-sm font-medium">Reconciliation: {scenarioName} scenario</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-bold text-accent-teal-mint dark:text-accent-teal-mint uppercase tracking-widest mb-1">Direct Cap Value</div>
                        <div className="text-3xl font-black tracking-tight text-accent-teal-mint dark:text-accent-teal-mint">${directCapValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                      </div>
                    </div>
                  </div>

                  <div className="p-8">
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">

                      {/* LEFT: DIRECT CAP */}
                      <div className="space-y-8">
                        <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest border-b border-light-border dark:border-dark-border dark:border-harken-gray pb-3 flex items-center gap-2">
                          Direct Capitalization
                          <span className="px-2 py-0.5 bg-surface-3 dark:bg-elevation-subtle text-slate-500 dark:text-slate-400 rounded text-[10px]">Method A</span>
                        </h3>

                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 block">Net Operating Income</label>
                          <div className="flex items-center gap-3 p-4 bg-surface-2 dark:bg-elevation-2 dark:bg-elevation-1/50 border border-light-border dark:border-dark-border dark:border-dark-border rounded-xl">
                            <div className="p-2 bg-surface-1 dark:bg-elevation-1 rounded-lg shadow-sm text-slate-400 dark:text-slate-200">
                              <DollarSign size={20} />
                            </div>
                            <span className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
                              {summary.netOperatingIncome.toLocaleString()}
                            </span>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between items-end mb-4">
                            <div className="flex items-center gap-2">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Going-In Cap Rate</label>
                              <button
                                onClick={() => setShowCapRateCalculator(true)}
                                className="p-1.5 bg-harken-blue/10 hover:bg-harken-blue/20 rounded-lg transition-colors group"
                                title="Open Cap Rate Calculator"
                              >
                                <Calculator className="w-4 h-4 text-harken-blue group-hover:scale-110 transition-transform" />
                              </button>
                            </div>
                            <span className="text-xl font-black text-accent-teal-mint bg-accent-teal-mint-light px-3 py-1 rounded-lg border border-accent-teal-mint">
                              {valuationData.marketCapRate.toFixed(2)}%
                            </span>
                          </div>
                          <input
                            type="range"
                            min="3" max="10" step="0.05"
                            value={valuationData.marketCapRate}
                            onChange={(e) => setValuationData({ ...valuationData, marketCapRate: parseFloat(e.target.value) })}
                            className="w-full h-3 bg-surface-4 dark:bg-elevation-muted rounded-lg appearance-none cursor-pointer accent-accent-teal-mint"
                          />
                        </div>

                        <div className="bg-surface-2 dark:bg-elevation-2 dark:bg-elevation-1/50 rounded-xl p-4 border border-light-border dark:border-dark-border dark:border-dark-border">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 block">Sensitivity Analysis</label>
                          <table className="w-full text-sm">
                            <tbody className="divide-y divide-light-border dark:divide-dark-border dark:divide-harken-dark">
                              {sensitivityRows.slice(1, 4).map((row, idx) => (
                                <tr key={idx} className={`transition-colors ${row.isSelected ? 'bg-accent-teal-mint-light/50 dark:bg-accent-teal-mint/10' : 'bg-transparent'}`}>
                                  <td className="py-2 text-left text-xs font-bold text-slate-500 dark:text-slate-400">{row.rate}%</td>
                                  <td className="py-2 text-right font-bold text-slate-800 dark:text-white">${row.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* RIGHT: YIELD CAP / DCF */}
                      <div className="space-y-8 relative">
                        <div className="hidden xl:block absolute -left-6 top-0 bottom-0 w-px bg-surface-3 dark:bg-elevation-subtle"></div>

                        <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest border-b border-light-border dark:border-dark-border dark:border-harken-gray pb-3 flex items-center gap-2">
                          Yield Capitalization (DCF)
                          <span className="px-2 py-0.5 bg-surface-3 dark:bg-elevation-subtle text-slate-500 dark:text-slate-400 rounded text-[10px]">Method B</span>
                          <span className="ml-auto text-xs text-accent-teal-mint font-bold bg-accent-teal-mint-light px-2 py-0.5 rounded border border-accent-teal-mint">
                            ${dcfAnalysis.totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                          </span>
                        </h3>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Holding Period</label>
                            <div className="flex items-center gap-2 border border-light-border dark:border-dark-border dark:border-dark-border rounded-lg px-3 py-2 bg-surface-1 dark:bg-elevation-1">
                              <CalendarRange size={16} className="text-slate-400" />
                              <input
                                type="number"
                                value={valuationData.holdingPeriod}
                                onChange={(e) => setValuationData({ ...valuationData, holdingPeriod: parseFloat(e.target.value) })}
                                className="w-full text-sm font-bold text-slate-800 dark:text-white outline-none bg-surface-1 dark:bg-elevation-1"
                              />
                              <span className="text-xs font-bold text-slate-400">Yrs</span>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Growth Rate</label>
                            <div className="flex items-center gap-2 border border-light-border dark:border-dark-border dark:border-dark-border rounded-lg px-3 py-2 bg-surface-1 dark:bg-elevation-1">
                              <TrendingUp size={16} className="text-slate-400" />
                              <input
                                type="number"
                                value={valuationData.annualGrowthRate}
                                onChange={(e) => setValuationData({ ...valuationData, annualGrowthRate: parseFloat(e.target.value) })}
                                className="w-full text-sm font-bold text-slate-800 dark:text-white outline-none bg-surface-1 dark:bg-elevation-1"
                              />
                              <span className="text-xs font-bold text-slate-400">%</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between items-end mb-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Discount Rate (Yield)</label>
                            <span className="text-sm font-black text-slate-700 dark:text-slate-200">{valuationData.discountRate.toFixed(2)}%</span>
                          </div>
                          <input
                            type="range"
                            min="4" max="15" step="0.25"
                            value={valuationData.discountRate}
                            onChange={(e) => setValuationData({ ...valuationData, discountRate: parseFloat(e.target.value) })}
                            className="w-full h-2 bg-surface-3 dark:bg-elevation-subtle rounded-lg appearance-none cursor-pointer accent-harken-blue"
                          />
                        </div>

                        <div>
                          <div className="flex justify-between items-end mb-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Terminal Cap Rate</label>
                            <span className="text-sm font-black text-slate-700 dark:text-slate-200">{valuationData.terminalCapRate.toFixed(2)}%</span>
                          </div>
                          <input
                            type="range"
                            min="3" max="12" step="0.25"
                            value={valuationData.terminalCapRate}
                            onChange={(e) => setValuationData({ ...valuationData, terminalCapRate: parseFloat(e.target.value) })}
                            className="w-full h-2 bg-surface-3 dark:bg-elevation-subtle rounded-lg appearance-none cursor-pointer accent-harken-blue"
                          />
                          <div className="mt-1 flex items-center gap-2 text-[10px] font-medium text-slate-400">
                            <ArrowRightLeft size={10} />
                            Spread to Going-In Cap: <span className="text-slate-600 font-bold">{(valuationData.terminalCapRate - valuationData.marketCapRate).toFixed(2)}%</span>
                            {valuationData.terminalCapRate <= valuationData.marketCapRate && (
                              <span className="text-rose-500 font-bold ml-1">(Risk: Terminal should usually be higher)</span>
                            )}
                          </div>
                        </div>

                        <div className="bg-surface-2 dark:bg-elevation-2 dark:bg-elevation-1/50 p-4 rounded-xl border border-light-border dark:border-dark-border dark:border-dark-border grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-[10px] text-slate-400 font-bold uppercase">PV Cash Flow</div>
                            <div className="text-sm font-bold text-slate-700 dark:text-slate-200">${dcfAnalysis.pvCashFlows.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-[10px] text-slate-400 font-bold uppercase">PV Reversion</div>
                            <div className="text-sm font-bold text-slate-700 dark:text-slate-200">${dcfAnalysis.pvReversion.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                          </div>
                        </div>

                        {/* Toggle for Detailed DCF Table */}
                        <button
                          onClick={() => setShowDetailedDCF(!showDetailedDCF)}
                          className="w-full py-3 border-2 border-dashed border-border-muted dark:border-dark-border-muted rounded-xl flex items-center justify-center gap-2 text-slate-500 font-semibold hover:border-harken-blue hover:text-harken-blue hover:bg-harken-blue/5 transition-all duration-300 group text-sm"
                        >
                          <Table2 size={16} className="text-slate-400 group-hover:text-harken-blue" />
                          {showDetailedDCF ? 'Hide' : 'Show'} Year-by-Year Projection
                          {showDetailedDCF ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                      </div>
                    </div>

                    {/* Detailed DCF Projection Table (Collapsible) */}
                    {showDetailedDCF && (
                      <div className="mt-6 animate-in fade-in slide-in-from-top-2 duration-300">
                        <DCFProjectionTable
                          initialInputs={{
                            pgi: summary.potentialGrossIncome,
                            vacancyRate: incomeData.vacancyRate / 100,
                            operatingExpenses: summary.totalExpenses,
                            growthRate: valuationData.annualGrowthRate / 100,
                            holdingPeriod: valuationData.holdingPeriod,
                            discountRate: valuationData.discountRate / 100,
                            terminalCapRate: valuationData.terminalCapRate / 100,
                          }}
                        />
                      </div>
                    )}
                  </div>
                  <div className="px-8 pb-8 space-y-6">
                    <IncomeTextEditor
                      label="Reconciliation & Conclusion"
                      sectionType="valuation"
                      contextData={{
                        scenario: scenarioName.toLowerCase().replace(' ', '-'),
                        propertyType: propertyMeta.type,
                        sqFt: propertyMeta.sqFt,
                        netOperatingIncome: summary.netOperatingIncome,
                        noiPerSf: summary.noiPerSf,
                        directCapValue: directCapValue,
                        marketCapRate: valuationData.marketCapRate,
                        dcfValue: dcfAnalysis.totalValue,
                        discountRate: valuationData.discountRate,
                        terminalCapRate: valuationData.terminalCapRate,
                        holdingPeriod: valuationData.holdingPeriod,
                        annualGrowthRate: valuationData.annualGrowthRate,
                      } as ValuationContextData}
                      value={valuationData.notes}
                      onChange={(val) => setValuationData({ ...valuationData, notes: val })}
                    />

                    {/* FINAL STEP: Risk Scan - Double-check before AI Draft */}
                    <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-harken-dark/50 dark:to-harken-dark rounded-xl p-6 border-2 border-dashed border-border-muted dark:border-dark-border-muted">
                      <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl text-amber-600 dark:text-amber-500 border border-amber-200 dark:border-amber-900/50">
                            <Activity size={24} />
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-800 dark:text-white">Pre-Flight Check</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Run a comprehensive audit before generating your report draft.</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setIsRiskModalOpen(true)}
                          className="w-full lg:w-auto flex items-center justify-center gap-2 bg-harken-blue text-white px-8 py-4 rounded-xl font-bold hover:bg-harken-blue/90 transition-all shadow-lg hover:shadow-xl active:scale-95 group"
                        >
                          <Activity size={20} className="text-white group-hover:scale-110 transition-transform" />
                          <span>Run Risk Scan</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <RiskAnalysisModal
        isOpen={isRiskModalOpen}
        onClose={() => setIsRiskModalOpen(false)}
        summary={summary}
        expenses={expenseData}
        income={incomeData}
        propertyMeta={propertyMeta}
        valuationData={valuationData}
        directCapValue={directCapValue}
        dcfValue={dcfAnalysis.totalValue}
      />

      <CapRateCalculator
        isOpen={showCapRateCalculator}
        onClose={() => setShowCapRateCalculator(false)}
        onApply={(capRate) => setValuationData({ ...valuationData, marketCapRate: capRate })}
        currentCapRate={valuationData.marketCapRate}
        currentNOI={summary.netOperatingIncome}
        initialComparables={salesCompComparables}
      />

      {/* SHARED NOTES EDITOR MODAL */}
      {activeNoteParams && (
        <NotesEditorModal
          isOpen={true}
          title={activeNoteParams.item.name || 'Untitled Line Item'}
          content={activeNoteParams.item.comments || ''}
          onClose={() => setActiveNoteParams(null)}
          onSave={handleSaveNotes}
          onInput={handleNoteInput}
        />
      )}

      {/* RENT COMP LINKING PANEL */}
      {linkingIncomeItem && (
        <RentCompLinkingPanel
          incomeItem={linkingIncomeItem}
          rentComparables={rentComparables}
          rentCompMode={rentCompMode}
          onLink={handleLink}
          onUnlink={handleUnlink}
          onClose={() => setLinkingIncomeItem(null)}
        />
      )}
    </div>
  );
};

