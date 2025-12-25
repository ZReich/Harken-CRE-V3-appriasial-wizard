import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  Calculator,
  Building2,
  Percent,
  Landmark,
  FileText,
  Plus,
  Trash2,
  AlertTriangle,
  Check,
  Info,
} from 'lucide-react';
import type {
  CapRateComp,
  BandOfInvestmentInputs,
  DebtCoverageInputs,
  MarketSurveyInputs,
  CapRateMethod,
} from '../types';

// =================================================================
// TYPES
// =================================================================

export interface SalesCompComparable {
  id: string;
  name: string;
  address?: string;
  salePrice: number;
  noi: number;
}

interface CapRateCalculatorProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (capRate: number) => void;
  currentCapRate: number;
  currentNOI?: number;
  /** Pre-populated comparables from Sales Comparison Grid */
  initialComparables?: SalesCompComparable[];
}

// =================================================================
// HELPER FUNCTIONS
// =================================================================

const generateId = () => Math.random().toString(36).substr(2, 9);

const formatPercent = (value: number, decimals = 2) => 
  `${(value * 100).toFixed(decimals)}%`;

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);

// Calculate mortgage constant (annual payment / loan amount)
const calculateMortgageConstant = (interestRate: number, termYears: number): number => {
  if (interestRate <= 0 || termYears <= 0) return 0;
  const monthlyRate = interestRate / 12;
  const numPayments = termYears * 12;
  const monthlyPayment = monthlyRate / (1 - Math.pow(1 + monthlyRate, -numPayments));
  return monthlyPayment * 12; // Annual constant
};

// =================================================================
// TAB DEFINITIONS
// =================================================================

const TABS: { id: CapRateMethod; label: string; icon: React.ReactNode; description: string }[] = [
  {
    id: 'comparable',
    label: 'Comp Extraction',
    icon: <Building2 size={16} />,
    description: 'Derive cap rate from comparable sales',
  },
  {
    id: 'band',
    label: 'Band of Investment',
    icon: <Percent size={16} />,
    description: 'Mortgage-equity technique',
  },
  {
    id: 'dcr',
    label: 'DCR Method',
    icon: <Landmark size={16} />,
    description: 'Debt coverage ratio approach',
  },
  {
    id: 'market',
    label: 'Market Survey',
    icon: <FileText size={16} />,
    description: 'Direct market input',
  },
];

// =================================================================
// COMPONENT
// =================================================================

export const CapRateCalculator: React.FC<CapRateCalculatorProps> = ({
  isOpen,
  onClose,
  onApply,
  currentCapRate,
  currentNOI = 0,
  initialComparables = [],
}) => {
  // Active method tab
  const [activeMethod, setActiveMethod] = useState<CapRateMethod>('comparable');

  // Build initial comparables from Sales Comparison data or empty rows
  const buildInitialComparables = (): CapRateComp[] => {
    if (initialComparables.length > 0) {
      return initialComparables.map(comp => ({
        id: comp.id,
        salePrice: comp.salePrice,
        noi: comp.noi,
        address: comp.name || comp.address || '',
      }));
    }
    // Default empty rows if no initial data
    return [
      { id: generateId(), salePrice: 0, noi: 0, address: '' },
      { id: generateId(), salePrice: 0, noi: 0, address: '' },
      { id: generateId(), salePrice: 0, noi: 0, address: '' },
    ];
  };

  // Comparable Extraction State - initialize from Sales Comparison data
  const [comparables, setComparables] = useState<CapRateComp[]>(buildInitialComparables);
  
  // Update comparables when initialComparables changes (e.g., when modal opens)
  useEffect(() => {
    if (isOpen && initialComparables.length > 0) {
      setComparables(buildInitialComparables());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialComparables.length]);

  // Band of Investment State
  const [bandInputs, setBandInputs] = useState<BandOfInvestmentInputs>({
    loanToValue: 0.75,
    interestRate: 0.065,
    loanTerm: 25,
    equityDividendRate: 0.10,
  });

  // DCR State
  const [dcrInputs, setDcrInputs] = useState<DebtCoverageInputs>({
    debtCoverageRatio: 1.25,
    loanConstant: 0.08,
    loanToValue: 0.75,
  });

  // Market Survey State
  const [marketInputs, setMarketInputs] = useState<MarketSurveyInputs>({
    capRate: currentCapRate / 100,
    source: '',
    notes: '',
  });

  // Update market input when currentCapRate changes
  useEffect(() => {
    setMarketInputs(prev => ({ ...prev, capRate: currentCapRate / 100 }));
  }, [currentCapRate]);

  // =================================================================
  // CALCULATIONS
  // =================================================================

  // Comparable Extraction Calculation
  const compResults = useMemo(() => {
    const validComps = comparables.filter(c => c.salePrice > 0 && c.noi > 0);
    if (validComps.length === 0) return null;

    const rates = validComps.map(c => c.noi / c.salePrice);
    const minRate = Math.min(...rates);
    const maxRate = Math.max(...rates);
    const avgRate = rates.reduce((sum, r) => sum + r, 0) / rates.length;

    // Weighted average by sale price
    const totalValue = validComps.reduce((sum, c) => sum + c.salePrice, 0);
    const weightedRate = validComps.reduce((sum, c) => {
      const weight = c.salePrice / totalValue;
      return sum + (c.noi / c.salePrice) * weight;
    }, 0);

    return {
      rates,
      minRate,
      maxRate,
      avgRate,
      weightedRate,
      count: validComps.length,
    };
  }, [comparables]);

  // Band of Investment Calculation
  const bandResult = useMemo(() => {
    const mortgageConstant = calculateMortgageConstant(
      bandInputs.interestRate,
      bandInputs.loanTerm
    );
    
    // Formula: (LTV × MC) + ((1 - LTV) × EDR)
    const capRate =
      bandInputs.loanToValue * mortgageConstant +
      (1 - bandInputs.loanToValue) * bandInputs.equityDividendRate;

    return {
      mortgageConstant,
      capRate,
      debtComponent: bandInputs.loanToValue * mortgageConstant,
      equityComponent: (1 - bandInputs.loanToValue) * bandInputs.equityDividendRate,
    };
  }, [bandInputs]);

  // DCR Calculation
  const dcrResult = useMemo(() => {
    // Formula: DCR × LC × LTV
    const capRate = dcrInputs.debtCoverageRatio * dcrInputs.loanConstant * dcrInputs.loanToValue;
    return { capRate };
  }, [dcrInputs]);

  // Get current calculated cap rate based on active method
  const calculatedCapRate = useMemo(() => {
    switch (activeMethod) {
      case 'comparable':
        return compResults?.weightedRate ?? null;
      case 'band':
        return bandResult.capRate;
      case 'dcr':
        return dcrResult.capRate;
      case 'market':
        return marketInputs.capRate;
      default:
        return null;
    }
  }, [activeMethod, compResults, bandResult, dcrResult, marketInputs]);

  // Validation warnings
  const warnings = useMemo(() => {
    const warns: string[] = [];
    if (calculatedCapRate !== null) {
      if (calculatedCapRate < 0.03) {
        warns.push('Cap rate below 3% is unusually aggressive');
      }
      if (calculatedCapRate > 0.15) {
        warns.push('Cap rate above 15% may indicate distressed asset');
      }
    }
    return warns;
  }, [calculatedCapRate]);

  // =================================================================
  // HANDLERS
  // =================================================================

  const addComparable = () => {
    setComparables([...comparables, { id: generateId(), salePrice: 0, noi: 0, address: '' }]);
  };

  const removeComparable = (id: string) => {
    if (comparables.length > 1) {
      setComparables(comparables.filter(c => c.id !== id));
    }
  };

  const updateComparable = (id: string, field: keyof CapRateComp, value: string | number) => {
    setComparables(
      comparables.map(c =>
        c.id === id ? { ...c, [field]: value } : c
      )
    );
  };

  const handleApply = () => {
    if (calculatedCapRate !== null && calculatedCapRate > 0) {
      onApply(calculatedCapRate * 100); // Convert to percentage
      onClose();
    }
  };

  if (!isOpen) return null;

  // =================================================================
  // RENDER
  // =================================================================

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-gradient-to-r from-[#0da1c7]/10 to-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#0da1c7]/10 rounded-xl">
              <Calculator className="w-5 h-5 text-[#0da1c7]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Cap Rate Calculator</h2>
              <p className="text-xs text-slate-500">Derive market cap rate using multiple methods</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveMethod(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeMethod === tab.id
                  ? 'text-[#0da1c7] border-[#0da1c7] bg-white'
                  : 'text-slate-500 border-transparent hover:text-slate-700 hover:bg-slate-100'
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Method Description */}
          <div className="flex items-start gap-2 p-3 bg-slate-50 rounded-lg">
            <Info className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-slate-600">
              {TABS.find(t => t.id === activeMethod)?.description}
            </p>
          </div>

          {/* COMPARABLE EXTRACTION TAB */}
          {activeMethod === 'comparable' && (
            <div className="space-y-4">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Income Property Comparables
              </div>

              <div className="space-y-3">
                {comparables.map((comp, idx) => {
                  const impliedRate = comp.salePrice > 0 && comp.noi > 0
                    ? comp.noi / comp.salePrice
                    : null;

                  return (
                    <div
                      key={comp.id}
                      className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200"
                    >
                      <div className="w-8 h-8 bg-[#0da1c7]/10 rounded-lg flex items-center justify-center text-[#0da1c7] text-sm font-bold">
                        {idx + 1}
                      </div>

                      <div className="flex-1 grid grid-cols-3 gap-3">
                        <div>
                          <label className="text-[10px] font-medium text-slate-400 uppercase block mb-1">
                            Sale Price
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                            <input
                              type="number"
                              value={comp.salePrice || ''}
                              onChange={e => updateComparable(comp.id, 'salePrice', parseFloat(e.target.value) || 0)}
                              placeholder="0"
                              className="w-full pl-7 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent outline-none"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] font-medium text-slate-400 uppercase block mb-1">
                            NOI
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                            <input
                              type="number"
                              value={comp.noi || ''}
                              onChange={e => updateComparable(comp.id, 'noi', parseFloat(e.target.value) || 0)}
                              placeholder="0"
                              className="w-full pl-7 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent outline-none"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] font-medium text-slate-400 uppercase block mb-1">
                            Implied Cap
                          </label>
                          <div className={`px-3 py-2 rounded-lg text-sm font-bold ${
                            impliedRate !== null
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-400'
                          }`}>
                            {impliedRate !== null ? formatPercent(impliedRate) : '--'}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => removeComparable(comp.id)}
                        disabled={comparables.length <= 1}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={addComparable}
                className="w-full py-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 text-sm font-medium hover:border-[#0da1c7] hover:text-[#0da1c7] hover:bg-[#0da1c7]/5 transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Comparable
              </button>

              {/* Results Summary */}
              {compResults && (
                <div className="bg-[#0da1c7]/5 rounded-xl p-4 border border-[#0da1c7]/20 space-y-3">
                  <div className="text-xs font-bold text-slate-600 uppercase tracking-widest">
                    Analysis Summary ({compResults.count} comparables)
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Range</p>
                      <p className="font-bold text-slate-800">
                        {formatPercent(compResults.minRate)} - {formatPercent(compResults.maxRate)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Simple Average</p>
                      <p className="font-bold text-slate-800">{formatPercent(compResults.avgRate)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Weighted Average</p>
                      <p className="font-bold text-[#0da1c7] text-lg">{formatPercent(compResults.weightedRate)}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* BAND OF INVESTMENT TAB */}
          {activeMethod === 'band' && (
            <div className="space-y-5">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Mortgage Component
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1.5">
                    Loan-to-Value (LTV)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      value={(bandInputs.loanToValue * 100).toFixed(1)}
                      onChange={e => setBandInputs({ ...bandInputs, loanToValue: parseFloat(e.target.value) / 100 || 0 })}
                      className="w-full px-3 py-2 pr-8 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent outline-none"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">%</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1.5">
                    Interest Rate
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.125"
                      value={(bandInputs.interestRate * 100).toFixed(3)}
                      onChange={e => setBandInputs({ ...bandInputs, interestRate: parseFloat(e.target.value) / 100 || 0 })}
                      className="w-full px-3 py-2 pr-8 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent outline-none"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">%</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1.5">
                    Loan Term
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={bandInputs.loanTerm}
                      onChange={e => setBandInputs({ ...bandInputs, loanTerm: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 pr-10 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent outline-none"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">yrs</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">Calculated Mortgage Constant</span>
                  <span className="font-bold text-slate-700">{formatPercent(bandResult.mortgageConstant)}</span>
                </div>
              </div>

              <div className="text-xs font-bold text-slate-500 uppercase tracking-widest pt-2">
                Equity Component
              </div>

              <div className="w-1/2">
                <label className="text-xs font-medium text-slate-600 block mb-1.5">
                  Equity Dividend Rate (EDR)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.25"
                    value={(bandInputs.equityDividendRate * 100).toFixed(2)}
                    onChange={e => setBandInputs({ ...bandInputs, equityDividendRate: parseFloat(e.target.value) / 100 || 0 })}
                    className="w-full px-3 py-2 pr-8 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent outline-none"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">%</span>
                </div>
              </div>

              {/* Formula Display */}
              <div className="bg-[#0da1c7]/5 rounded-xl p-4 border border-[#0da1c7]/20 space-y-3">
                <div className="text-xs font-bold text-slate-600 uppercase tracking-widest">
                  Band of Investment Formula
                </div>
                <div className="font-mono text-sm text-slate-700 bg-white p-3 rounded-lg border border-slate-200">
                  Cap Rate = (LTV x MC) + ((1 - LTV) x EDR)
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Debt Component</p>
                    <p className="font-bold text-slate-800">
                      {formatPercent(bandInputs.loanToValue)} x {formatPercent(bandResult.mortgageConstant)} = {formatPercent(bandResult.debtComponent)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Equity Component</p>
                    <p className="font-bold text-slate-800">
                      {formatPercent(1 - bandInputs.loanToValue)} x {formatPercent(bandInputs.equityDividendRate)} = {formatPercent(bandResult.equityComponent)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* DCR METHOD TAB */}
          {activeMethod === 'dcr' && (
            <div className="space-y-5">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Debt Coverage Ratio Method
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1.5">
                    Debt Coverage Ratio
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    value={dcrInputs.debtCoverageRatio}
                    onChange={e => setDcrInputs({ ...dcrInputs, debtCoverageRatio: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent outline-none"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Typical: 1.20 - 1.35</p>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1.5">
                    Loan Constant
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.25"
                      value={(dcrInputs.loanConstant * 100).toFixed(2)}
                      onChange={e => setDcrInputs({ ...dcrInputs, loanConstant: parseFloat(e.target.value) / 100 || 0 })}
                      className="w-full px-3 py-2 pr-8 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent outline-none"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">%</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">Annual debt service / loan</p>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1.5">
                    Loan-to-Value
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="1"
                      value={(dcrInputs.loanToValue * 100).toFixed(1)}
                      onChange={e => setDcrInputs({ ...dcrInputs, loanToValue: parseFloat(e.target.value) / 100 || 0 })}
                      className="w-full px-3 py-2 pr-8 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent outline-none"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">%</span>
                  </div>
                </div>
              </div>

              {/* Formula Display */}
              <div className="bg-[#0da1c7]/5 rounded-xl p-4 border border-[#0da1c7]/20 space-y-3">
                <div className="text-xs font-bold text-slate-600 uppercase tracking-widest">
                  DCR Formula
                </div>
                <div className="font-mono text-sm text-slate-700 bg-white p-3 rounded-lg border border-slate-200">
                  Cap Rate = DCR x Loan Constant x LTV
                </div>
                <div className="pt-2">
                  <p className="text-xs text-slate-500 mb-1">Calculation</p>
                  <p className="font-bold text-slate-800">
                    {dcrInputs.debtCoverageRatio} x {formatPercent(dcrInputs.loanConstant)} x {formatPercent(dcrInputs.loanToValue)} = {formatPercent(dcrResult.capRate)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* MARKET SURVEY TAB */}
          {activeMethod === 'market' && (
            <div className="space-y-5">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Direct Market Input
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1.5">
                    Market Cap Rate
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.25"
                      value={(marketInputs.capRate * 100).toFixed(2)}
                      onChange={e => setMarketInputs({ ...marketInputs, capRate: parseFloat(e.target.value) / 100 || 0 })}
                      className="w-full px-3 py-2 pr-8 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent outline-none"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">%</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1.5">
                    Source
                  </label>
                  <input
                    type="text"
                    value={marketInputs.source}
                    onChange={e => setMarketInputs({ ...marketInputs, source: e.target.value })}
                    placeholder="e.g., CoStar, RealtyRates, Broker Survey"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1.5">
                  Notes
                </label>
                <textarea
                  value={marketInputs.notes}
                  onChange={e => setMarketInputs({ ...marketInputs, notes: e.target.value })}
                  placeholder="Additional context or source details..."
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent outline-none resize-none"
                />
              </div>

              {/* Implied Value Preview */}
              {currentNOI > 0 && marketInputs.capRate > 0 && (
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
                    Implied Value at This Cap Rate
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-500">Current NOI</p>
                      <p className="font-bold text-slate-800">{formatCurrency(currentNOI)}</p>
                    </div>
                    <div className="text-slate-300">/</div>
                    <div>
                      <p className="text-xs text-slate-500">Cap Rate</p>
                      <p className="font-bold text-slate-800">{formatPercent(marketInputs.capRate)}</p>
                    </div>
                    <div className="text-slate-300">=</div>
                    <div>
                      <p className="text-xs text-slate-500">Value</p>
                      <p className="font-bold text-[#0da1c7] text-lg">
                        {formatCurrency(currentNOI / marketInputs.capRate)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Warnings */}
          {warnings.length > 0 && (
            <div className="space-y-2">
              {warnings.map((warn, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg"
                >
                  <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  <span className="text-sm text-amber-700">{warn}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-200 bg-slate-50">
          <div className="flex items-center justify-between">
            {/* Result Preview */}
            <div className="flex items-center gap-4">
              <div>
                <p className="text-xs text-slate-500 uppercase">Calculated Cap Rate</p>
                <p className={`text-2xl font-bold ${calculatedCapRate !== null ? 'text-[#0da1c7]' : 'text-slate-300'}`}>
                  {calculatedCapRate !== null ? formatPercent(calculatedCapRate) : '--'}
                </p>
              </div>
              {calculatedCapRate !== null && currentNOI > 0 && (
                <div className="pl-4 border-l border-slate-200">
                  <p className="text-xs text-slate-500 uppercase">Implied Value</p>
                  <p className="text-lg font-bold text-slate-700">
                    {formatCurrency(currentNOI / calculatedCapRate)}
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleApply}
                disabled={calculatedCapRate === null || calculatedCapRate <= 0}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#0da1c7] text-white text-sm font-bold rounded-lg hover:bg-[#0b8fb0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Check className="w-4 h-4" />
                Apply to Going-In Cap Rate
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CapRateCalculator;

