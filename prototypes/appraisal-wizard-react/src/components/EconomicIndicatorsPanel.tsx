/**
 * Economic Indicators Panel Component
 * 
 * Displays economic data from FRED API with selectable chart styles.
 * Shows Federal Funds Rate, 10-Year Treasury, Inflation, and GDP Growth.
 */

import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown,
  Minus,
  Loader2, 
  AlertCircle, 
  RefreshCw,
  BarChart3,
  Percent,
  DollarSign,
  Activity
} from 'lucide-react';
import { getEconomicIndicators, formatRate, getTrend } from '../services/economicService';
import EconomicChart from './EconomicChart';
import ChartStyleSelector, { type ChartStyle } from './ChartStyleSelector';
import type { EconomicIndicatorsResponse, EconomicSeries } from '../types/api';

interface EconomicIndicatorsPanelProps {
  className?: string;
  onDataLoaded?: (data: EconomicIndicatorsResponse['data'], asOfDate?: string) => void;
  onChartStyleChange?: (style: ChartStyle) => void;
}

interface IndicatorCardProps {
  title: string;
  icon: React.ReactNode;
  series: EconomicSeries;
  chartStyle: ChartStyle;
  color: string;
  unit?: string;
}

function IndicatorCard({ title, icon, series, chartStyle, color, unit = '%' }: IndicatorCardProps) {
  const trend = getTrend(series.history);
  const previousValue = series.history[1]?.value;
  const change = previousValue ? series.current - previousValue : 0;

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-slate-100" style={{ color }}>
            {icon}
          </div>
          <span className="font-medium text-slate-700 text-sm">{title}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-slate-800">
            {formatRate(series.current)}
          </span>
          {change !== 0 && (
            <span className={`flex items-center gap-0.5 text-xs ${
              change > 0 ? 'text-emerald-600' : 'text-red-600'
            }`}>
              {change > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {Math.abs(change).toFixed(2)}
            </span>
          )}
          {change === 0 && (
            <span className="flex items-center gap-0.5 text-xs text-slate-400">
              <Minus className="w-3 h-3" />
            </span>
          )}
        </div>
      </div>
      <div className="p-4">
        <EconomicChart
          data={series.history}
          chartStyle={chartStyle}
          title={title}
          color={color}
          height={140}
          unit={unit}
          showAxis={chartStyle !== 'glass'}
        />
      </div>
      <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span>
          Trend: {' '}
          <span className={`font-medium ${
            trend === 'rising' ? 'text-emerald-600' : 
            trend === 'falling' ? 'text-red-600' : 'text-slate-600'
          }`}>
            {trend.charAt(0).toUpperCase() + trend.slice(1)}
          </span>
        </span>
        <span>{series.history.length} data points</span>
      </div>
    </div>
  );
}

export function EconomicIndicatorsPanel({ 
  className = '',
  onDataLoaded,
  onChartStyleChange 
}: EconomicIndicatorsPanelProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<EconomicIndicatorsResponse['data'] | null>(null);
  const [asOfDate, setAsOfDate] = useState<string>('');
  const [chartStyle, setChartStyle] = useState<ChartStyle>('gradient');

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getEconomicIndicators();
      
      if (response.success && response.data) {
        setData(response.data);
        setAsOfDate(response.asOfDate);
        onDataLoaded?.(response.data, response.asOfDate);
      } else {
        setError(response.error || 'Failed to fetch economic data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChartStyleChange = (style: ChartStyle) => {
    setChartStyle(style);
    onChartStyleChange?.(style);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={`bg-white rounded-xl border border-slate-200 p-6 ${className}`}>
        <div className="flex items-center justify-center gap-3 py-8">
          <Loader2 className="w-5 h-5 text-[#0da1c7] animate-spin" />
          <span className="text-slate-600">Loading economic indicators...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`bg-white rounded-xl border border-slate-200 p-6 ${className}`}>
        <div className="flex items-center gap-3 text-red-600 mb-4">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className={`bg-white rounded-xl border border-slate-200 p-6 ${className}`}>
        <p className="text-slate-500">No economic data available.</p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Chart Style Selector */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#0da1c7]/10 rounded-lg">
              <BarChart3 className="w-5 h-5 text-[#0da1c7]" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Economic Indicators</h3>
              <p className="text-xs text-slate-500">
                Source: Federal Reserve Economic Data (FRED) • Updated {asOfDate ? new Date(asOfDate).toLocaleDateString() : 'Recently'}
              </p>
            </div>
          </div>
          <ChartStyleSelector
            value={chartStyle}
            onChange={handleChartStyleChange}
            label=""
          />
        </div>
      </div>

      {/* Indicator Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <IndicatorCard
          title="Federal Funds Rate"
          icon={<Percent className="w-4 h-4" />}
          series={data.federalFundsRate}
          chartStyle={chartStyle}
          color="#0da1c7"
        />
        <IndicatorCard
          title="10-Year Treasury"
          icon={<DollarSign className="w-4 h-4" />}
          series={data.treasury10Y}
          chartStyle={chartStyle}
          color="#10b981"
        />
        <IndicatorCard
          title="Inflation (CPI)"
          icon={<TrendingUp className="w-4 h-4" />}
          series={data.inflation}
          chartStyle={chartStyle}
          color="#f59e0b"
        />
        <IndicatorCard
          title="GDP Growth"
          icon={<Activity className="w-4 h-4" />}
          series={data.gdpGrowth}
          chartStyle={chartStyle}
          color="#8b5cf6"
        />
      </div>

      {/* Summary Card */}
      <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
        <h4 className="font-medium text-slate-700 mb-2">Economic Context Summary</h4>
        <p className="text-sm text-slate-600 leading-relaxed">
          Current economic conditions show the Federal Funds Rate at {formatRate(data.federalFundsRate.current)}, 
          with the 10-Year Treasury yield at {formatRate(data.treasury10Y.current)}. 
          Year-over-year inflation stands at {formatRate(data.inflation.current, 1)}, 
          and GDP growth is {formatRate(data.gdpGrowth.current, 1)}. 
          These indicators inform cap rate analysis and investment risk assessment for the subject property.
        </p>
      </div>
    </div>
  );
}

export default EconomicIndicatorsPanel;

