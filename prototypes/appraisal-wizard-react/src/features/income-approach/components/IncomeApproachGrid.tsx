import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Wallet, PieChart, Info, Activity, Check, LayoutGrid, Home, Warehouse, Store, TrendingUp, DollarSign, CalendarRange, ArrowRightLeft, Layers } from 'lucide-react';
import type { IncomeData, ExpenseData, LineItem, FinancialSummary, PropertyMeta, ValuationData, ValuationScenario, IncomeApproachState } from '../types';
import { RichTextEditor } from './RichTextEditor';
import { InputRow } from './InputRow';
import { FinancialChart } from './FinancialChart';
import { RiskAnalysisModal } from './RiskAnalysisModal';
import { INITIAL_INCOME_APPROACH_STATE, VALUATION_SCENARIOS } from '../constants';

const generateId = () => Math.random().toString(36).substr(2, 9);

interface IncomeApproachGridProps {
  initialData?: IncomeApproachState | null;
  onDataChange?: (data: IncomeApproachState) => void;
  showGuidancePanel?: boolean;
}

export const IncomeApproachGrid: React.FC<IncomeApproachGridProps> = ({ 
  initialData,
  onDataChange,
  showGuidancePanel = true
}) => {
  // --- State ---
  const [showGuidance, setShowGuidance] = useState(true);
  const [scenario, setScenario] = useState<ValuationScenario>(initialData?.scenario || 'as-stabilized');

  const [propertyMeta, setPropertyMeta] = useState<PropertyMeta>(
    initialData?.propertyMeta || INITIAL_INCOME_APPROACH_STATE.propertyMeta
  );

  const [incomeData, setIncomeData] = useState<IncomeData>(
    initialData?.incomeData || INITIAL_INCOME_APPROACH_STATE.incomeData
  );

  const [expenseData, setExpenseData] = useState<ExpenseData>(
    initialData?.expenseData || INITIAL_INCOME_APPROACH_STATE.expenseData
  );

  const [valuationData, setValuationData] = useState<ValuationData>(
    initialData?.valuationData || INITIAL_INCOME_APPROACH_STATE.valuationData
  );

  const [isRiskModalOpen, setIsRiskModalOpen] = useState(false);

  // Notify parent of data changes
  useEffect(() => {
    if (onDataChange) {
      onDataChange({
        propertyMeta,
        incomeData,
        expenseData,
        valuationData,
        scenario,
        showGuidance,
      });
    }
  }, [propertyMeta, incomeData, expenseData, valuationData, scenario, showGuidance, onDataChange]);

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
      className="w-full mt-2 py-4 border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center gap-2 text-slate-500 font-bold hover:border-[#0da1c7] hover:text-[#0da1c7] hover:bg-[#0da1c7]/5 transition-all duration-300 group"
    >
      <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-[#0da1c7]/10 flex items-center justify-center transition-colors">
        <Plus size={18} className="text-slate-400 group-hover:text-[#0da1c7]" />
      </div>
      {label}
    </button>
  );

  return (
    <div className="min-h-full bg-gray-50 text-slate-900 pb-20 font-sans">
      <div className="flex items-start gap-8">
        
        {/* --- MAIN CONTENT --- */}
        <div className="flex-grow space-y-6 min-w-0 p-6">

          {/* PROPERTY CONTEXT BAR */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-6">
            
            {/* Left: Property Type Badge */}
            <div className="flex items-center gap-4 w-full lg:w-auto">
              <div className="p-3 bg-[#0da1c7]/10 rounded-xl text-[#0da1c7]">
                {propertyMeta.type === 'office' && <LayoutGrid size={24} />}
                {propertyMeta.type === 'retail' && <Store size={24} />}
                {propertyMeta.type === 'multifamily' && <Home size={24} />}
                {propertyMeta.type === 'industrial' && <Warehouse size={24} />}
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Property Type</div>
                <div className="font-black text-slate-800 capitalize text-lg leading-tight">{propertyMeta.type}</div>
              </div>
            </div>

            <div className="hidden lg:block h-10 w-px bg-slate-100"></div>

            {/* Scenario Switcher */}
            <div className="flex flex-col gap-1 w-full lg:w-auto">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                <Layers size={10} />
                Valuation Scenario
              </label>
              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                {VALUATION_SCENARIOS.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => setScenario(s.value)}
                    className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-tight transition-all whitespace-nowrap ${scenario === s.value ? 'bg-white text-[#0da1c7] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="hidden lg:block h-10 w-px bg-slate-100"></div>

            {/* Inputs */}
            <div className="flex items-center gap-8 flex-grow w-full lg:w-auto justify-start">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Building SqFt</label>
                <div className="flex items-center gap-2 group">
                  <input 
                    type="number" 
                    value={propertyMeta.sqFt}
                    onChange={(e) => setPropertyMeta({...propertyMeta, sqFt: parseFloat(e.target.value) || 0})}
                    className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-bold text-slate-700 w-32 focus:ring-2 focus:ring-[#0da1c7] outline-none transition-all focus:bg-white"
                  />
                  <span className="text-xs font-bold text-slate-400 group-hover:text-[#0da1c7] transition-colors">SF</span>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Unit Count</label>
                <div className="flex items-center gap-2 group">
                  <input 
                    type="number" 
                    value={propertyMeta.unitCount}
                    onChange={(e) => setPropertyMeta({...propertyMeta, unitCount: parseFloat(e.target.value) || 0})}
                    className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-bold text-slate-700 w-24 focus:ring-2 focus:ring-[#0da1c7] outline-none transition-all focus:bg-white"
                  />
                  <span className="text-xs font-bold text-slate-400 group-hover:text-[#0da1c7] transition-colors">Units</span>
                </div>
              </div>
            </div>

            {/* Right: Risk Button */}
            <button 
              onClick={() => setIsRiskModalOpen(true)}
              className="w-full lg:w-auto flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-md hover:shadow-lg active:scale-95 group"
            >
              <Activity size={18} className="text-[#0da1c7] group-hover:scale-110 transition-transform" />
              <span>Run Risk Scan</span>
            </button>
          </div>
          
          {/* TOP METRICS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
              <div className="text-xs font-bold text-slate-400 uppercase">Indicated Value</div>
              <div className="text-2xl font-black text-[#0da1c7]">${directCapValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
              <div className="text-xs font-bold text-slate-400 uppercase">Price / SF</div>
              <div className="text-2xl font-black text-slate-800">${(directCapValue / safeSqFt).toFixed(2)}</div>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
              <div className="text-xs font-bold text-slate-400 uppercase">Expense Ratio</div>
              <div className="text-2xl font-black text-slate-800">{summary.expenseRatio.toFixed(1)}%</div>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 p-1 bg-emerald-100 rounded-bl-xl">
                <Check size={14} className="text-emerald-600" />
              </div>
              <div className="text-xs font-bold text-slate-400 uppercase">Adjusted NOI</div>
              <div className="text-2xl font-black text-emerald-500">${summary.adjustedNetOperatingIncome.toLocaleString()}</div>
            </div>
          </div>

          {/* INCOME SECTION */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-8 pb-4">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-[#0da1c7]/10 rounded-2xl text-[#0da1c7]">
                    <Wallet size={24} />
                  </div>
                  <h2 className="text-2xl font-black text-slate-800 tracking-tight">Revenue Assumptions</h2>
                </div>
                <div className="text-right">
                  <div className="text-sm text-slate-400 font-bold uppercase">Effective Gross Income</div>
                  <div className="text-xl font-black text-slate-800">${summary.effectiveGrossIncome.toLocaleString()}</div>
                </div>
              </div>

              {/* RENTAL INCOME */}
              <div className="mb-10">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 pl-2">Rent Roll</h3>
                <div className="space-y-3">
                  {incomeData.rentalIncome.map(item => (
                    <InputRow 
                      key={item.id} 
                      item={item} 
                      variant="rental" 
                      onChange={(updated) => updateLineItem('rental', updated)}
                      onDelete={(id) => deleteLineItem('rental', id)}
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
                      item={item} 
                      variant="reimbursement" 
                      onChange={(updated) => updateLineItem('reimbursement', updated)}
                      onDelete={(id) => deleteLineItem('reimbursement', id)}
                    />
                  ))}
                </div>
                <AddButton label="Add Expense Recovery" onClick={() => addLineItem('reimbursement')} />
              </div>

              {/* VACANCY BOX */}
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 flex items-center justify-between mb-8">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Vacancy & Credit Loss</label>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs">Global vacancy rate applied to Potential Gross Income.</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 flex items-center gap-2 shadow-sm">
                    <input 
                      type="number"
                      value={incomeData.vacancyRate}
                      onChange={(e) => setIncomeData({...incomeData, vacancyRate: parseFloat(e.target.value) || 0})}
                      className="w-12 text-right font-black text-lg outline-none text-slate-800 bg-white"
                    />
                    <span className="font-bold text-slate-400">%</span>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-rose-400 uppercase">Deduction</div>
                    <div className="text-lg font-bold text-rose-500">
                      (${ (summary.potentialGrossIncome * (incomeData.vacancyRate / 100)).toLocaleString(undefined, {maximumFractionDigits: 0}) })
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-8 pb-8">
              <RichTextEditor 
                label="Revenue Methodology Notes" 
                value={incomeData.notes} 
                onChange={(val) => setIncomeData({...incomeData, notes: val})} 
              />
            </div>
          </div>

          {/* EXPENSE SECTION */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-8 pb-4">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-amber-50 rounded-2xl text-amber-600">
                    <Activity size={24} />
                  </div>
                  <h2 className="text-2xl font-black text-slate-800 tracking-tight">Operating Expenses</h2>
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
                      item={item} 
                      variant="expense" 
                      onChange={(updated) => updateLineItem('expense', updated)}
                      onDelete={(id) => deleteLineItem('expense', id)}
                      effectiveGrossIncome={summary.effectiveGrossIncome}
                      totalPropertySqFt={propertyMeta.sqFt}
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
              <RichTextEditor 
                label="Expense Methodology Notes" 
                value={expenseData.notes} 
                onChange={(val) => setExpenseData({...expenseData, notes: val})} 
              />
            </div>
          </div>

          {/* VALUATION SECTION */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-8 bg-slate-900 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-emerald-500/20 rounded-2xl text-emerald-400 border border-emerald-500/50">
                    <TrendingUp size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black tracking-tight">Valuation Summary</h2>
                    <p className="text-slate-400 text-sm font-medium">Reconciliation: {scenario.toUpperCase().replace('-', ' ')} scenario</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-1">Direct Cap Value</div>
                  <div className="text-3xl font-black tracking-tight">${directCapValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                </div>
              </div>
            </div>
            
            <div className="p-8">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
                
                {/* LEFT: DIRECT CAP */}
                <div className="space-y-8">
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-3 flex items-center gap-2">
                    Direct Capitalization
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px]">Method A</span>
                  </h3>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 block">Net Operating Income</label>
                    <div className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                      <div className="p-2 bg-white rounded-lg shadow-sm text-slate-400">
                        <DollarSign size={20} />
                      </div>
                      <span className="text-2xl font-black text-slate-800 tracking-tight">
                        {summary.netOperatingIncome.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-end mb-4">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Going-In Cap Rate</label>
                      <span className="text-xl font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100">
                        {valuationData.marketCapRate.toFixed(2)}%
                      </span>
                    </div>
                    <input 
                      type="range" 
                      min="3" max="10" step="0.05"
                      value={valuationData.marketCapRate}
                      onChange={(e) => setValuationData({...valuationData, marketCapRate: parseFloat(e.target.value)})}
                      className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                  </div>

                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 block">Sensitivity Analysis</label>
                    <table className="w-full text-sm">
                      <tbody className="divide-y divide-slate-100">
                        {sensitivityRows.slice(1,4).map((row, idx) => (
                          <tr key={idx} className={`transition-colors ${row.isSelected ? 'bg-emerald-50/50' : 'bg-transparent'}`}>
                            <td className="py-2 text-left text-xs font-bold text-slate-500">{row.rate}%</td>
                            <td className="py-2 text-right font-bold text-slate-800">${row.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* RIGHT: YIELD CAP / DCF */}
                <div className="space-y-8 relative">
                  <div className="hidden xl:block absolute -left-6 top-0 bottom-0 w-px bg-slate-100"></div>

                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-3 flex items-center gap-2">
                    Yield Capitalization (DCF)
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px]">Method B</span>
                    <span className="ml-auto text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                      ${dcfAnalysis.totalValue.toLocaleString(undefined, {maximumFractionDigits: 0})}
                    </span>
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Holding Period</label>
                      <div className="flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-2 bg-white">
                        <CalendarRange size={16} className="text-slate-400" />
                        <input 
                          type="number"
                          value={valuationData.holdingPeriod}
                          onChange={(e) => setValuationData({...valuationData, holdingPeriod: parseFloat(e.target.value)})}
                          className="w-full text-sm font-bold text-slate-800 outline-none bg-white"
                        />
                        <span className="text-xs font-bold text-slate-400">Yrs</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Growth Rate</label>
                      <div className="flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-2 bg-white">
                        <TrendingUp size={16} className="text-slate-400" />
                        <input 
                          type="number"
                          value={valuationData.annualGrowthRate}
                          onChange={(e) => setValuationData({...valuationData, annualGrowthRate: parseFloat(e.target.value)})}
                          className="w-full text-sm font-bold text-slate-800 outline-none bg-white"
                        />
                        <span className="text-xs font-bold text-slate-400">%</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-end mb-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Discount Rate (Yield)</label>
                      <span className="text-sm font-black text-slate-700">{valuationData.discountRate.toFixed(2)}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="4" max="15" step="0.25"
                      value={valuationData.discountRate}
                      onChange={(e) => setValuationData({...valuationData, discountRate: parseFloat(e.target.value)})}
                      className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#0da1c7]"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-end mb-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Terminal Cap Rate</label>
                      <span className="text-sm font-black text-slate-700">{valuationData.terminalCapRate.toFixed(2)}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="3" max="12" step="0.25"
                      value={valuationData.terminalCapRate}
                      onChange={(e) => setValuationData({...valuationData, terminalCapRate: parseFloat(e.target.value)})}
                      className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#0da1c7]"
                    />
                    <div className="mt-1 flex items-center gap-2 text-[10px] font-medium text-slate-400">
                      <ArrowRightLeft size={10} />
                      Spread to Going-In Cap: <span className="text-slate-600 font-bold">{(valuationData.terminalCapRate - valuationData.marketCapRate).toFixed(2)}%</span>
                      {valuationData.terminalCapRate <= valuationData.marketCapRate && (
                        <span className="text-rose-500 font-bold ml-1">(Risk: Terminal should usually be higher)</span>
                      )}
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase">PV Cash Flow</div>
                      <div className="text-sm font-bold text-slate-700">${dcfAnalysis.pvCashFlows.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-slate-400 font-bold uppercase">PV Reversion</div>
                      <div className="text-sm font-bold text-slate-700">${dcfAnalysis.pvReversion.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-8 pb-8">
              <RichTextEditor 
                label="Reconciliation & Conclusion" 
                value={valuationData.notes} 
                onChange={(val) => setValuationData({...valuationData, notes: val})} 
              />
            </div>
          </div>
        </div>
        
        {/* --- RIGHT GUIDANCE PANEL --- */}
        {showGuidancePanel && showGuidance && (
          <div className="w-80 flex-shrink-0 hidden 2xl:block animate-fade-in p-6">
            <div className="sticky top-28 space-y-6">
              
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                  <PieChart className="text-[#0da1c7]" size={18} />
                  Waterfall
                </h3>
                <FinancialChart summary={summary} />
              </div>

              <div className="bg-[#0da1c7]/10 border border-[#0da1c7]/20 rounded-3xl p-6">
                <div className="flex items-start gap-3">
                  <Info className="text-[#0da1c7] mt-1 flex-shrink-0" size={20} />
                  <div>
                    <h4 className="font-bold text-[#1c3643] text-sm mb-1">Methodology Tip</h4>
                    <p className="text-xs text-[#1c3643]/80 leading-relaxed">
                      When projecting for <strong>{scenario.replace('-', ' ')}</strong>, ensure you have market data to support the specific risk adjustments for that timeline.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      <RiskAnalysisModal 
        isOpen={isRiskModalOpen} 
        onClose={() => setIsRiskModalOpen(false)} 
        summary={summary} 
        expenses={expenseData} 
        income={incomeData} 
        propertyMeta={propertyMeta} 
      />
    </div>
  );
};

