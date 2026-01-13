/**
 * Economic Context Page Component
 * 
 * Displays economic indicators from FRED API with data tables and optional charts
 * for the appraisal report.
 * 
 * Supports both the full API response format (with history) and 
 * the simplified WizardState format (without history).
 */

import React from 'react';
import type { EconomicIndicators } from '../../../../types';
import EconomicChart from '../../../../components/EconomicChart';
import type { ChartStyle } from '../../../../components/ChartStyleSelector';

interface EconomicContextPageProps {
  data: EconomicIndicators | null;
  pageNumber?: number;
  chartStyle?: ChartStyle;
}

// Formatting helper
const formatRate = (value: number) => `${value.toFixed(2)}%`;

// Helper to determine trend from simple trend string or history array
const getTrendFromData = (
  indicator: { current: number; trend?: string; history?: { value: number }[] }
): string => {
  // If we have a direct trend string, use it
  if (indicator.trend) {
    const trend = indicator.trend.toLowerCase();
    if (trend === 'rising' || trend === 'accelerating') return 'Rising';
    if (trend === 'falling' || trend === 'slowing') return 'Falling';
    return 'Stable';
  }
  
  // If we have history, calculate trend
  if (indicator.history && indicator.history.length >= 3) {
    const recent = indicator.history.slice(0, 3).reduce((sum, p) => sum + p.value, 0) / 3;
    const older = indicator.history.slice(-3).reduce((sum, p) => sum + p.value, 0) / 3;
    const changePct = ((recent - older) / older) * 100;
    if (changePct > 5) return 'Rising';
    if (changePct < -5) return 'Falling';
  }
  
  return 'Stable';
};

export const EconomicContextPage: React.FC<EconomicContextPageProps> = ({
  data,
  pageNumber,
  chartStyle = 'gradient',
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

  const { federalFundsRate, treasury10Y, inflation, gdpGrowth, asOfDate } = data;

  const indicators = [
    { 
      name: 'Federal Funds Rate', 
      current: federalFundsRate.current, 
      trend: getTrendFromData(federalFundsRate as { current: number; trend?: string; history?: { value: number }[] }),
      description: 'The target rate set by the Federal Reserve for overnight lending between banks',
    },
    { 
      name: '10-Year Treasury Yield', 
      current: treasury10Y.current, 
      trend: getTrendFromData(treasury10Y as { current: number; trend?: string; history?: { value: number }[] }),
      description: 'The benchmark risk-free rate used for cap rate analysis',
    },
    { 
      name: 'Inflation (CPI)', 
      current: inflation.current, 
      trend: getTrendFromData(inflation as { current: number; trend?: string; history?: { value: number }[] }),
      description: 'Year-over-year change in the Consumer Price Index',
    },
    { 
      name: 'GDP Growth', 
      current: gdpGrowth.current, 
      trend: getTrendFromData(gdpGrowth as { current: number; trend?: string; history?: { value: number }[] }),
      description: 'Annual growth rate of real Gross Domestic Product',
    },
  ];

  return (
    <div className="bg-white w-[8.5in] min-h-[11in] p-[1in] shadow-lg mx-auto flex flex-col">
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
          <tr style={{ backgroundColor: '#f1f5f9' }}>
            <th className="text-left py-3 px-4 font-semibold text-slate-700" style={{ border: '1px solid #e2e8f0' }}>
              Indicator
            </th>
            <th className="text-center py-3 px-4 font-semibold text-slate-700 w-32" style={{ border: '1px solid #e2e8f0' }}>
              Current Rate
            </th>
            <th className="text-center py-3 px-4 font-semibold text-slate-700 w-24" style={{ border: '1px solid #e2e8f0' }}>
              Trend
            </th>
          </tr>
        </thead>
        <tbody>
          {indicators.map((indicator, idx) => (
            <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
              <td className="py-3 px-4" style={{ border: '1px solid #e2e8f0' }}>
                <span className="font-medium text-slate-800">{indicator.name}</span>
                <p className="text-xs text-slate-500 mt-1">{indicator.description}</p>
              </td>
              <td className="py-3 px-4 text-center font-semibold text-slate-800" style={{ border: '1px solid #e2e8f0' }}>
                {formatRate(indicator.current)}
              </td>
              <td className="py-3 px-4 text-center" style={{ border: '1px solid #e2e8f0' }}>
                <span 
                  className="inline-block px-2 py-1 rounded text-xs font-medium"
                  style={{
                    backgroundColor: indicator.trend === 'Rising' ? '#dcfce7' :
                      indicator.trend === 'Falling' ? '#7f1d1d' : '#f1f5f9',
                    color: indicator.trend === 'Rising' ? '#166534' :
                      indicator.trend === 'Falling' ? '#ffffff' : '#475569',
                  }}
                >
                  {indicator.trend}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Economic Indicators Charts - Only show if history data is available */}
      {(data.federalFundsRate.history || data.treasury10Y.history || data.inflation.history || data.gdpGrowth.history) && (
        <>
          <h2 className="text-lg font-semibold text-slate-800 pb-2 mb-4 mt-8" style={{ borderBottom: '1px solid #e2e8f0' }}>
            Historical Trends
          </h2>
          <div className="grid grid-cols-2 gap-4 mb-8">
            {data.federalFundsRate.history && (
              <div className="rounded-lg p-4" style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <h3 className="text-sm font-semibold text-slate-800 mb-3">Federal Funds Rate</h3>
                <EconomicChart
                  data={data.federalFundsRate.history}
                  chartStyle={chartStyle}
                  title="Federal Funds Rate"
                  color="#0da1c7"
                  height={180}
                  unit="%"
                  showAxis={true}
                  textColor="#334155"
                />
              </div>
            )}
            {data.treasury10Y.history && (
              <div className="rounded-lg p-4" style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <h3 className="text-sm font-semibold text-slate-800 mb-3">10-Year Treasury Yield</h3>
                <EconomicChart
                  data={data.treasury10Y.history}
                  chartStyle={chartStyle}
                  title="10-Year Treasury"
                  color="#0da1c7"
                  height={180}
                  unit="%"
                  showAxis={true}
                  textColor="#334155"
                />
              </div>
            )}
            {data.inflation.history && (
              <div className="rounded-lg p-4" style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <h3 className="text-sm font-semibold text-slate-800 mb-3">Inflation (CPI)</h3>
                <EconomicChart
                  data={data.inflation.history}
                  chartStyle={chartStyle}
                  title="Inflation"
                  color="#0da1c7"
                  height={180}
                  unit="%"
                  showAxis={true}
                  textColor="#334155"
                />
              </div>
            )}
            {data.gdpGrowth.history && (
              <div className="rounded-lg p-4" style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <h3 className="text-sm font-semibold text-slate-800 mb-3">GDP Growth</h3>
                <EconomicChart
                  data={data.gdpGrowth.history}
                  chartStyle={chartStyle}
                  title="GDP Growth"
                  color="#0da1c7"
                  height={180}
                  unit="%"
                  showAxis={true}
                  textColor="#334155"
                />
              </div>
            )}
          </div>
        </>
      )}

      {/* Analysis Section */}
      <h2 className="text-lg font-semibold text-slate-800 pb-2 mb-4" style={{ borderBottom: '1px solid #e2e8f0' }}>
        Market Implications
      </h2>
      <div className="text-sm text-slate-700 leading-relaxed space-y-4 mb-8">
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

      {/* Source Attribution - positioned at bottom with proper spacing */}
      <div className="mt-auto pt-4">
        <p className="text-xs text-slate-500">
          Source: {data.source || 'Federal Reserve Economic Data (FRED)'}
          {asOfDate && ` (as of ${new Date(asOfDate).toLocaleDateString()})`}
        </p>
      </div>

      {/* Page Number */}
      {pageNumber && (
        <div className="text-right mt-4">
          <span className="text-sm text-slate-400">{pageNumber}</span>
        </div>
      )}
    </div>
  );
};

export default EconomicContextPage;

