/**
 * Economic Context Page Component
 * 
 * Displays economic indicators from FRED API with data tables and optional charts
 * for the appraisal report.
 */

import React from 'react';
import type { EconomicIndicators } from '../../../../types';
import EconomicChart from '../../../../components/EconomicChart';
import type { ChartStyle } from '../../../../components/ChartStyleSelector';
import { ReportPageBase } from './ReportPageBase';

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
  if (indicator.trend) {
    const trend = indicator.trend.toLowerCase();
    if (trend === 'rising' || trend === 'accelerating') return 'Rising';
    if (trend === 'falling' || trend === 'slowing') return 'Falling';
    return 'Stable';
  }
  
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
      <ReportPageBase
        title="Economic Context"
        sidebarLabel="ECON"
        pageNumber={pageNumber}
        sectionNumber={3}
        sectionTitle="MARKET"
        contentPadding="p-10"
      >
        <p className="text-sm text-slate-500 italic">No economic data available.</p>
      </ReportPageBase>
    );
  }

  const { federalFundsRate, treasury10Y, inflation, gdpGrowth, asOfDate } = data;

  const indicators = [
    { 
      name: 'Federal Funds Rate', 
      current: federalFundsRate.current, 
      trend: getTrendFromData(federalFundsRate as { current: number; trend?: string; history?: { value: number }[] }),
    },
    { 
      name: '10-Year Treasury', 
      current: treasury10Y.current, 
      trend: getTrendFromData(treasury10Y as { current: number; trend?: string; history?: { value: number }[] }),
    },
    { 
      name: 'Inflation (CPI)', 
      current: inflation.current, 
      trend: getTrendFromData(inflation as { current: number; trend?: string; history?: { value: number }[] }),
    },
    { 
      name: 'GDP Growth', 
      current: gdpGrowth.current, 
      trend: getTrendFromData(gdpGrowth as { current: number; trend?: string; history?: { value: number }[] }),
    },
  ];

  const hasHistory = data.federalFundsRate.history || data.treasury10Y.history || data.inflation.history || data.gdpGrowth.history;

  return (
    <ReportPageBase
      title="Economic Context"
      sidebarLabel="ECON"
      pageNumber={pageNumber}
      sectionNumber={3}
      sectionTitle="MARKET"
      contentPadding="p-10"
    >
      {/* Introductory Text */}
      <p className="text-xs text-slate-700 mb-3 leading-relaxed">
        The following economic indicators provide context for current real estate market conditions.
      </p>

      {/* Economic Indicators Table */}
      <table className="w-full text-xs border-collapse mb-4">
        <thead>
          <tr className="bg-slate-100">
            <th className="text-left py-2 px-3 font-semibold text-slate-700 border border-slate-200">
              Indicator
            </th>
            <th className="text-center py-2 px-3 font-semibold text-slate-700 w-24 border border-slate-200">
              Current
            </th>
            <th className="text-center py-2 px-3 font-semibold text-slate-700 w-20 border border-slate-200">
              Trend
            </th>
          </tr>
        </thead>
        <tbody>
          {indicators.map((indicator, idx) => (
            <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
              <td className="py-2 px-3 border border-slate-200 font-medium text-slate-800">
                {indicator.name}
              </td>
              <td className="py-2 px-3 text-center font-semibold text-slate-800 border border-slate-200">
                {formatRate(indicator.current)}
              </td>
              <td className="py-2 px-3 text-center border border-slate-200">
                <span 
                  className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium ${
                    indicator.trend === 'Rising' ? 'bg-emerald-100 text-emerald-700' :
                    indicator.trend === 'Falling' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {indicator.trend}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Economic Indicators Charts - Only show if history data is available */}
      {hasHistory && (
        <>
          <h2 className="text-xs font-semibold text-slate-800 pb-1 mb-2 border-b border-slate-200">
            Historical Trends
          </h2>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {data.federalFundsRate.history && (
              <div className="rounded-lg p-2 bg-slate-50 border border-slate-200">
                <h3 className="text-[10px] font-semibold text-slate-800 mb-1">Federal Funds Rate</h3>
                <EconomicChart
                  data={data.federalFundsRate.history}
                  chartStyle={chartStyle}
                  title="Federal Funds Rate"
                  color="#0da1c7"
                  height={100}
                  unit="%"
                  showAxis={true}
                  textColor="#334155"
                />
              </div>
            )}
            {data.treasury10Y.history && (
              <div className="rounded-lg p-2 bg-slate-50 border border-slate-200">
                <h3 className="text-[10px] font-semibold text-slate-800 mb-1">10-Year Treasury</h3>
                <EconomicChart
                  data={data.treasury10Y.history}
                  chartStyle={chartStyle}
                  title="10-Year Treasury"
                  color="#0da1c7"
                  height={100}
                  unit="%"
                  showAxis={true}
                  textColor="#334155"
                />
              </div>
            )}
            {data.inflation.history && (
              <div className="rounded-lg p-2 bg-slate-50 border border-slate-200">
                <h3 className="text-[10px] font-semibold text-slate-800 mb-1">Inflation (CPI)</h3>
                <EconomicChart
                  data={data.inflation.history}
                  chartStyle={chartStyle}
                  title="Inflation"
                  color="#0da1c7"
                  height={100}
                  unit="%"
                  showAxis={true}
                  textColor="#334155"
                />
              </div>
            )}
            {data.gdpGrowth.history && (
              <div className="rounded-lg p-2 bg-slate-50 border border-slate-200">
                <h3 className="text-[10px] font-semibold text-slate-800 mb-1">GDP Growth</h3>
                <EconomicChart
                  data={data.gdpGrowth.history}
                  chartStyle={chartStyle}
                  title="GDP Growth"
                  color="#0da1c7"
                  height={100}
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
      <h2 className="text-xs font-semibold text-slate-800 pb-1 mb-2 border-b border-slate-200">
        Market Implications
      </h2>
      <div className="text-[10px] text-slate-700 leading-relaxed space-y-2 mb-3">
        <p>
          The Federal Funds Rate of {formatRate(federalFundsRate.current)} reflects monetary policy stance, 
          directly impacting commercial real estate financing costs and property values.
        </p>
        <p>
          The 10-Year Treasury at {formatRate(treasury10Y.current)} serves as the benchmark for cap rate 
          analysis. Inflation at {formatRate(inflation.current)} and GDP growth of {formatRate(gdpGrowth.current)} 
          indicate {gdpGrowth.current > 2 ? 'healthy' : 'moderate'} economic conditions.
        </p>
      </div>

      {/* Source Attribution */}
      <div className="mt-auto pt-2 text-[9px] text-slate-400">
        Source: {data.source || 'Federal Reserve Economic Data (FRED)'}
        {asOfDate && ` (as of ${new Date(asOfDate).toLocaleDateString()})`}
      </div>
    </ReportPageBase>
  );
};

export default EconomicContextPage;
