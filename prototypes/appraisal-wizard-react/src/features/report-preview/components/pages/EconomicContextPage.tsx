/**
 * Economic Context Page Component
 * 
 * Displays economic indicators from FRED API in a clean tabular format
 * for the appraisal report.
 */

import React from 'react';
import type { EconomicIndicatorsResponse } from '../../../../types/api';

interface EconomicContextPageProps {
  data: EconomicIndicatorsResponse['data'];
  asOfDate?: string;
  pageNumber?: number;
}

// Formatting helper
const formatRate = (value: number) => `${value.toFixed(2)}%`;

export const EconomicContextPage: React.FC<EconomicContextPageProps> = ({
  data,
  asOfDate,
  pageNumber,
}) => {
  if (!data) {
    return (
      <div className="bg-white w-[8.5in] min-h-[11in] p-[1in] shadow-lg mx-auto">
        <h1 className="text-xl font-bold text-slate-800 border-b-2 border-[#0da1c7] pb-2 mb-6">
          ECONOMIC CONTEXT
        </h1>
        <p className="text-sm text-slate-500 italic">No economic data available.</p>
      </div>
    );
  }

  const { federalFundsRate, treasury10Y, inflation, gdpGrowth } = data;

  // Get trend info for each indicator
  const getTrendLabel = (history: { value: number }[]) => {
    if (history.length < 3) return 'Stable';
    const recent = history.slice(0, 3).reduce((sum, p) => sum + p.value, 0) / 3;
    const older = history.slice(-3).reduce((sum, p) => sum + p.value, 0) / 3;
    const changePct = ((recent - older) / older) * 100;
    if (changePct > 5) return 'Rising';
    if (changePct < -5) return 'Falling';
    return 'Stable';
  };

  const indicators = [
    { 
      name: 'Federal Funds Rate', 
      current: federalFundsRate.current, 
      trend: getTrendLabel(federalFundsRate.history),
      description: 'The target rate set by the Federal Reserve for overnight lending between banks',
    },
    { 
      name: '10-Year Treasury Yield', 
      current: treasury10Y.current, 
      trend: getTrendLabel(treasury10Y.history),
      description: 'The benchmark risk-free rate used for cap rate analysis',
    },
    { 
      name: 'Inflation (CPI)', 
      current: inflation.current, 
      trend: getTrendLabel(inflation.history),
      description: 'Year-over-year change in the Consumer Price Index',
    },
    { 
      name: 'GDP Growth', 
      current: gdpGrowth.current, 
      trend: getTrendLabel(gdpGrowth.history),
      description: 'Annual growth rate of real Gross Domestic Product',
    },
  ];

  return (
    <div className="bg-white w-[8.5in] min-h-[11in] p-[1in] shadow-lg mx-auto relative">
      {/* Header */}
      <h1 className="text-xl font-bold text-slate-800 border-b-2 border-[#0da1c7] pb-2 mb-6">
        ECONOMIC CONTEXT
      </h1>

      {/* Introductory Text */}
      <p className="text-sm text-slate-700 mb-6 leading-relaxed">
        The following economic indicators provide context for the current real estate market conditions 
        and inform the cap rate analysis and investment risk assessment for the subject property.
      </p>

      {/* Economic Indicators Table */}
      <table className="w-full text-sm border-collapse mb-8">
        <thead>
          <tr className="bg-slate-100">
            <th className="text-left py-3 px-4 font-semibold text-slate-700 border border-slate-200">
              Indicator
            </th>
            <th className="text-center py-3 px-4 font-semibold text-slate-700 border border-slate-200 w-32">
              Current Rate
            </th>
            <th className="text-center py-3 px-4 font-semibold text-slate-700 border border-slate-200 w-24">
              Trend
            </th>
          </tr>
        </thead>
        <tbody>
          {indicators.map((indicator, idx) => (
            <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
              <td className="py-3 px-4 border border-slate-200">
                <span className="font-medium text-slate-800">{indicator.name}</span>
                <p className="text-xs text-slate-500 mt-1">{indicator.description}</p>
              </td>
              <td className="py-3 px-4 text-center font-semibold text-slate-800 border border-slate-200">
                {formatRate(indicator.current)}
              </td>
              <td className="py-3 px-4 text-center border border-slate-200">
                <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                  indicator.trend === 'Rising' ? 'bg-emerald-100 text-emerald-700' :
                  indicator.trend === 'Falling' ? 'bg-red-100 text-red-700' :
                  'bg-slate-100 text-slate-600'
                }`}>
                  {indicator.trend}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Analysis Section */}
      <h2 className="text-lg font-semibold text-slate-800 border-b border-slate-300 pb-2 mb-4">
        Market Implications
      </h2>
      <div className="text-sm text-slate-700 leading-relaxed space-y-4">
        <p>
          The current Federal Funds Rate of {formatRate(federalFundsRate.current)} reflects the Federal Reserve's 
          monetary policy stance. This rate directly impacts commercial real estate financing costs and, 
          consequently, property values through the cost of capital.
        </p>
        <p>
          The 10-Year Treasury yield of {formatRate(treasury10Y.current)} serves as the benchmark risk-free rate 
          for calculating cap rate spreads. The spread between market cap rates and the Treasury yield reflects 
          the risk premium investors require for real estate investments.
        </p>
        <p>
          With inflation at {formatRate(inflation.current)}, real estate continues to serve as a potential hedge 
          against rising prices, particularly for properties with shorter lease terms that allow for rent adjustments. 
          GDP growth of {formatRate(gdpGrowth.current)} indicates {gdpGrowth.current > 2 ? 'healthy' : 'moderate'} 
          {' '}economic expansion, supporting demand for commercial real estate.
        </p>
      </div>

      {/* Source Attribution */}
      <div className="absolute bottom-[1in] left-[1in] right-[1in]">
        <p className="text-xs text-slate-500">
          Source: Federal Reserve Economic Data (FRED)
          {asOfDate && ` (as of ${new Date(asOfDate).toLocaleDateString()})`}
        </p>
      </div>

      {/* Page Number */}
      {pageNumber && (
        <div className="absolute bottom-[0.5in] right-[1in]">
          <span className="text-sm text-slate-400">{pageNumber}</span>
        </div>
      )}
    </div>
  );
};

export default EconomicContextPage;

