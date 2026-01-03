import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, Download, Calculator, TrendingUp, Calendar } from 'lucide-react';

// =================================================================
// TYPES
// =================================================================

interface DCFInputs {
  pgi: number;            // Potential Gross Income Year 1
  vacancyRate: number;    // Vacancy & Collection Loss %
  operatingExpenses: number; // Annual Operating Expenses
  growthRate: number;     // Annual growth rate for NOI
  holdingPeriod: number;  // Years
  discountRate: number;   // Discount Rate
  terminalCapRate: number; // Terminal/Reversion Cap Rate
  sellingCosts: number;   // Selling costs as % of reversion
}

interface DCFYearData {
  year: number;
  pgi: number;
  vacancy: number;
  egi: number;
  expenses: number;
  noi: number;
  pvFactor: number;
  pvNoi: number;
}

interface DCFProjectionTableProps {
  initialInputs?: Partial<DCFInputs>;
  simplified?: boolean;
  onValueChange?: (value: number) => void;
}

// =================================================================
// DEFAULT INPUTS
// =================================================================

const DEFAULT_INPUTS: DCFInputs = {
  pgi: 150000,
  vacancyRate: 0.05,
  operatingExpenses: 45000,
  growthRate: 0.025,
  holdingPeriod: 10,
  discountRate: 0.09,
  terminalCapRate: 0.085,
  sellingCosts: 0.03,
};

// =================================================================
// COMPONENT
// =================================================================

export const DCFProjectionTable: React.FC<DCFProjectionTableProps> = ({
  initialInputs = {},
  simplified = false,
  onValueChange,
}) => {
  const [inputs, setInputs] = useState<DCFInputs>({ ...DEFAULT_INPUTS, ...initialInputs });
  const [isExpanded, setIsExpanded] = useState(!simplified);

  // Calculate year-by-year projections
  const yearData = useMemo((): DCFYearData[] => {
    const years: DCFYearData[] = [];

    for (let year = 1; year <= inputs.holdingPeriod; year++) {
      const growthFactor = Math.pow(1 + inputs.growthRate, year - 1);
      const pgi = inputs.pgi * growthFactor;
      const vacancy = pgi * inputs.vacancyRate;
      const egi = pgi - vacancy;
      const expenses = inputs.operatingExpenses * growthFactor;
      const noi = egi - expenses;
      const pvFactor = 1 / Math.pow(1 + inputs.discountRate, year);
      const pvNoi = noi * pvFactor;

      years.push({ year, pgi, vacancy, egi, expenses, noi, pvFactor, pvNoi });
    }

    return years;
  }, [inputs]);

  // Calculate reversion and total value
  const calculations = useMemo(() => {
    const lastYearNoi = yearData[yearData.length - 1]?.noi || 0;
    const reversionNoi = lastYearNoi * (1 + inputs.growthRate); // Year 11 NOI
    const grossReversion = reversionNoi / inputs.terminalCapRate;
    const sellingCostsAmount = grossReversion * inputs.sellingCosts;
    const netReversion = grossReversion - sellingCostsAmount;
    const reversionPvFactor = 1 / Math.pow(1 + inputs.discountRate, inputs.holdingPeriod);
    const pvReversion = netReversion * reversionPvFactor;

    const pvNoiTotal = yearData.reduce((acc, y) => acc + y.pvNoi, 0);
    const totalValue = pvNoiTotal + pvReversion;

    return {
      reversionNoi,
      grossReversion,
      sellingCostsAmount,
      netReversion,
      reversionPvFactor,
      pvReversion,
      pvNoiTotal,
      totalValue,
    };
  }, [yearData, inputs]);

  // Notify parent of value change
  React.useEffect(() => {
    onValueChange?.(calculations.totalValue);
  }, [calculations.totalValue, onValueChange]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercent = (value: number) => `${(value * 100).toFixed(2)}%`;

  // Reserved for future editable inputs
  const _handleInputChange = (field: keyof DCFInputs, value: string) => {
    const numValue = parseFloat(value.replace(/[^0-9.-]/g, ''));
    if (!isNaN(numValue)) {
      setInputs(prev => ({ ...prev, [field]: numValue }));
    }
  };
  void _handleInputChange;

  // Simplified view
  if (simplified && !isExpanded) {
    return (
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
        <button
          onClick={() => setIsExpanded(true)}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#0da1c7]/10 rounded-lg">
              <Calculator className="w-5 h-5 text-[#0da1c7]" />
            </div>
            <div className="text-left">
              <div className="text-sm font-semibold text-slate-800 dark:text-white">Year-by-Year DCF Projection</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">{inputs.holdingPeriod}-year holding period • Click to expand</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-lg font-bold text-[#0da1c7]">{formatCurrency(calculations.totalValue)}</div>
              <div className="text-[10px] text-slate-400 uppercase">DCF Value</div>
            </div>
            <ChevronDown className="w-5 h-5 text-slate-400" />
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-5 h-5 text-[#0da1c7]" />
          <h3 className="font-bold text-lg text-slate-800 dark:text-white">Year-by-Year DCF Projection</h3>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors text-slate-600 dark:text-slate-300" title="Export to Excel">
            <Download className="w-4 h-4" />
          </button>
          {simplified && (
            <button
              onClick={() => setIsExpanded(false)}
              className="p-2 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors text-slate-600 dark:text-slate-300"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Input Summary Bar */}
      <div className="px-6 py-3 bg-slate-100 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600 flex items-center gap-6 text-xs overflow-x-auto">
        <div className="flex items-center gap-2">
          <span className="text-slate-500 dark:text-slate-400">Discount Rate:</span>
          <span className="font-semibold text-slate-700 dark:text-slate-200">{formatPercent(inputs.discountRate)}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-500 dark:text-slate-400">Growth Rate:</span>
          <span className="font-semibold text-slate-700 dark:text-slate-200">{formatPercent(inputs.growthRate)}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-500 dark:text-slate-400">Terminal Cap:</span>
          <span className="font-semibold text-slate-700 dark:text-slate-200">{formatPercent(inputs.terminalCapRate)}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-500 dark:text-slate-400">Holding Period:</span>
          <span className="font-semibold text-slate-700 dark:text-slate-200">{inputs.holdingPeriod} years</span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
              <th className="sticky left-0 z-10 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-left font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5" />
                  Year
                </div>
              </th>
              <th className="px-4 py-3 text-right font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">PGI</th>
              <th className="px-4 py-3 text-right font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Vacancy</th>
              <th className="px-4 py-3 text-right font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">EGI</th>
              <th className="px-4 py-3 text-right font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Expenses</th>
              <th className="px-4 py-3 text-right font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">NOI</th>
              <th className="px-4 py-3 text-right font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">PV Factor</th>
              <th className="px-4 py-3 text-right font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">PV of NOI</th>
            </tr>
          </thead>
          <tbody>
            {yearData.map((data, idx) => (
              <tr
                key={data.year}
                className={`border-b border-slate-100 dark:border-slate-700 transition-colors ${idx === 0 ? 'bg-[#0da1c7]/5 dark:bg-[#0da1c7]/10' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
                  }`}
              >
                <td className="sticky left-0 z-10 bg-white dark:bg-slate-800 px-4 py-2.5 font-semibold text-slate-700 dark:text-slate-200">
                  {idx === 0 && <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#0da1c7]/10 text-[#0da1c7] text-[10px] font-bold mr-1">CURRENT</span>}
                  Year {data.year}
                </td>
                <td className="px-4 py-2.5 text-right text-slate-600 dark:text-slate-300">{formatCurrency(data.pgi)}</td>
                <td className="px-4 py-2.5 text-right text-red-500 dark:text-red-400">({formatCurrency(data.vacancy)})</td>
                <td className="px-4 py-2.5 text-right text-slate-600 dark:text-slate-300">{formatCurrency(data.egi)}</td>
                <td className="px-4 py-2.5 text-right text-red-500 dark:text-red-400">({formatCurrency(data.expenses)})</td>
                <td className="px-4 py-2.5 text-right font-semibold text-slate-800 dark:text-white">{formatCurrency(data.noi)}</td>
                <td className="px-4 py-2.5 text-right text-slate-500 dark:text-slate-400">{data.pvFactor.toFixed(4)}</td>
                <td className="px-4 py-2.5 text-right font-semibold text-emerald-600 dark:text-emerald-400">{formatCurrency(data.pvNoi)}</td>
              </tr>
            ))}

            {/* Reversion Row */}
            <tr className="border-t-2 border-slate-800 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/50">
              <td className="sticky left-0 z-10 bg-slate-50 dark:bg-slate-800 px-4 py-3 font-bold text-slate-700 dark:text-slate-200 uppercase">
                Reversion (Year {inputs.holdingPeriod + 1})
              </td>
              <td className="px-4 py-3 text-right text-slate-400 dark:text-slate-500">—</td>
              <td className="px-4 py-3 text-right text-slate-400 dark:text-slate-500">—</td>
              <td className="px-4 py-3 text-right text-slate-400 dark:text-slate-500">—</td>
              <td className="px-4 py-3 text-right text-slate-400 dark:text-slate-500">—</td>
              <td className="px-4 py-3 text-right">
                <div className="text-slate-600 dark:text-slate-300">{formatCurrency(calculations.netReversion)}</div>
                <div className="text-[10px] text-slate-400 dark:text-slate-500">Net of {formatPercent(inputs.sellingCosts)} costs</div>
              </td>
              <td className="px-4 py-3 text-right text-slate-500 dark:text-slate-400">{calculations.reversionPvFactor.toFixed(4)}</td>
              <td className="px-4 py-3 text-right font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(calculations.pvReversion)}</td>
            </tr>

            {/* Total Row */}
            <tr className="bg-slate-900 dark:bg-slate-950 text-white border-t border-slate-800 dark:border-slate-900">
              <td className="sticky left-0 z-10 bg-slate-900 dark:bg-slate-950 px-4 py-4 font-black text-lg uppercase" colSpan={6}>
                DCF Value Indication
              </td>
              <td className="px-4 py-4 text-right font-bold">Total</td>
              <td className="px-4 py-4 text-right font-black text-[#0da1c7] text-xl">{formatCurrency(calculations.totalValue)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Summary Footer */}
      <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700">
        <div className="grid grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-[10px] text-slate-500 uppercase tracking-wide mb-1">PV of Cash Flows</div>
            <div className="text-lg font-bold text-slate-800 dark:text-white">{formatCurrency(calculations.pvNoiTotal)}</div>
          </div>
          <div className="text-center">
            <div className="text-[10px] text-slate-500 uppercase tracking-wide mb-1">PV of Reversion</div>
            <div className="text-lg font-bold text-slate-800 dark:text-white">{formatCurrency(calculations.pvReversion)}</div>
          </div>
          <div className="text-center">
            <div className="text-[10px] text-slate-500 uppercase tracking-wide mb-1">Implied Going-In Cap</div>
            <div className="text-lg font-bold text-slate-800 dark:text-white">
              {formatPercent(yearData[0]?.noi / calculations.totalValue || 0)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-[10px] text-slate-500 uppercase tracking-wide mb-1">DCF Value</div>
            <div className="text-2xl font-black text-[#0da1c7]">{formatCurrency(calculations.totalValue)}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

