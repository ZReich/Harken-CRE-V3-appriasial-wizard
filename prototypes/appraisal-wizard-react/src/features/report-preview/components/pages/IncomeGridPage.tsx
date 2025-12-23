import React from 'react';

interface IncomeGridPageProps {
  title?: string;
  pageNumber?: number;
  scenarioId?: number;
  scenarioName?: string;
  data?: IncomeGridData;
  isEditing?: boolean;
  onCellClick?: (row: string, col: string) => void;
}

interface IncomeGridData {
  pgi?: number;
  vacancy?: number;
  egi?: number;
  expenses?: Record<string, number>;
  totalExpenses?: number;
  noi?: number;
  capRate?: number;
  indicatedValue?: number;
}

const DEFAULT_INCOME_DATA: IncomeGridData = {
  pgi: 120000,
  vacancy: 6000,
  egi: 114000,
  expenses: {
    propertyTaxes: 8500,
    insurance: 3200,
    utilities: 2400,
    repairs: 4800,
    management: 5700,
    reserves: 2400,
  },
  totalExpenses: 27000,
  noi: 87000,
  capRate: 8.5,
  indicatedValue: 1023529,
};

export const IncomeGridPage: React.FC<IncomeGridPageProps> = ({
  title = 'Income Approach',
  pageNumber,
  scenarioName,
  data = DEFAULT_INCOME_DATA,
  isEditing = false,
  onCellClick,
}) => {
  const formatCurrency = (value: number | undefined): string => {
    if (value === undefined) return '-';
    return `$${value.toLocaleString()}`;
  };

  const formatPercent = (value: number | undefined): string => {
    if (value === undefined) return '-';
    return `${value.toFixed(2)}%`;
  };

  return (
    <div className="w-full h-full bg-white flex flex-col">
      {/* Page header */}
      <div className="px-12 pt-8 pb-4 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-800">{title}</h2>
            {scenarioName && (
              <p className="text-sm text-slate-500 mt-1">{scenarioName}</p>
            )}
          </div>
          {pageNumber && (
            <span className="text-sm text-slate-400">Page {pageNumber}</span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-12 py-6 overflow-auto">
        <div className="grid grid-cols-2 gap-8">
          {/* Pro Forma */}
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Operating Statement</h3>
            
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <tbody>
                  {/* Income Section */}
                  <tr className="bg-slate-100">
                    <td colSpan={2} className="px-4 py-2 font-semibold text-slate-600 uppercase text-xs tracking-wider">
                      Income
                    </td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="px-4 py-2 text-slate-700">Potential Gross Income</td>
                    <td 
                      className={`px-4 py-2 text-right font-medium ${isEditing ? 'cursor-pointer hover:bg-slate-50' : ''}`}
                      onClick={() => isEditing && onCellClick?.('pgi', 'value')}
                    >
                      {formatCurrency(data.pgi)}
                    </td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="px-4 py-2 text-slate-700">Less: Vacancy & Collection Loss</td>
                    <td className="px-4 py-2 text-right font-medium text-red-600">
                      ({formatCurrency(data.vacancy)})
                    </td>
                  </tr>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <td className="px-4 py-2 font-semibold text-slate-800">Effective Gross Income</td>
                    <td className="px-4 py-2 text-right font-bold text-slate-800">
                      {formatCurrency(data.egi)}
                    </td>
                  </tr>

                  {/* Expenses Section */}
                  <tr className="bg-slate-100">
                    <td colSpan={2} className="px-4 py-2 font-semibold text-slate-600 uppercase text-xs tracking-wider">
                      Operating Expenses
                    </td>
                  </tr>
                  {data.expenses && Object.entries(data.expenses).map(([key, value]) => (
                    <tr key={key} className="border-b border-slate-100">
                      <td className="px-4 py-2 text-slate-700 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </td>
                      <td className="px-4 py-2 text-right text-slate-600">
                        {formatCurrency(value)}
                      </td>
                    </tr>
                  ))}
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <td className="px-4 py-2 font-semibold text-slate-800">Total Expenses</td>
                    <td className="px-4 py-2 text-right font-bold text-red-600">
                      ({formatCurrency(data.totalExpenses)})
                    </td>
                  </tr>

                  {/* NOI */}
                  <tr className="bg-slate-800 text-white">
                    <td className="px-4 py-3 font-bold">Net Operating Income</td>
                    <td className="px-4 py-3 text-right font-bold text-lg">
                      {formatCurrency(data.noi)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Capitalization */}
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Direct Capitalization</h3>
            
            <div className="border border-slate-200 rounded-lg p-6 bg-slate-50">
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                  <span className="text-slate-700">Net Operating Income</span>
                  <span className="font-semibold text-slate-800">{formatCurrency(data.noi)}</span>
                </div>
                
                <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                  <span className="text-slate-700">Capitalization Rate</span>
                  <span className="font-semibold text-slate-800">{formatPercent(data.capRate)}</span>
                </div>
                
                <div className="pt-4">
                  <div className="text-center">
                    <div className="text-sm text-slate-500 mb-2">Value = NOI ÷ Cap Rate</div>
                    <div className="text-3xl font-bold text-sky-600">
                      {formatCurrency(data.indicatedValue)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Cap Rate Support */}
            <div className="mt-6">
              <h4 className="font-semibold text-slate-800 mb-3">Capitalization Rate Support</h4>
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600">Source</th>
                      <th className="px-3 py-2 text-center text-xs font-semibold text-slate-600">Range</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-100">
                      <td className="px-3 py-2 text-slate-700">Comparable Sales</td>
                      <td className="px-3 py-2 text-center text-slate-600">7.5% - 9.0%</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="px-3 py-2 text-slate-700">Investor Surveys</td>
                      <td className="px-3 py-2 text-center text-slate-600">8.0% - 9.5%</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="px-3 py-2 text-slate-700">Band of Investment</td>
                      <td className="px-3 py-2 text-center text-slate-600">8.25%</td>
                    </tr>
                    <tr className="bg-slate-50">
                      <td className="px-3 py-2 font-semibold text-slate-800">Selected Rate</td>
                      <td className="px-3 py-2 text-center font-bold text-sky-600">{formatPercent(data.capRate)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncomeGridPage;

