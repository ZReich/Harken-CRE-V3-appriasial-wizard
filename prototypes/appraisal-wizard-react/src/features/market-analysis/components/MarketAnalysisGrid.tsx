import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Building2,
  DollarSign,
  Percent,
  Calendar,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  FileText,
  Activity,
  Home,
  Clock,
  Target,
  // TrendingDown - reserved for future use
} from 'lucide-react';
import type { MarketData } from '../types';
import { MOCK_MARKET_DATA } from '../constants';
import EnhancedTextArea from '../../../components/EnhancedTextArea';
import { useWizard } from '../../../context/WizardContext';
import type { MarketAnalysisData } from '../../../types';

interface MarketAnalysisGridProps {
  // NOTE: Auto-aggregated data has moved to the ContextualMarketData sidebar component
  // These props are deprecated but kept for backwards compatibility
  rentCompData?: {
    avgRent: number;
    rentRange: [number, number];
    compCount: number;
  };
  salesCompData?: {
    avgPricePsf: number;
    avgCapRate: number;
    compCount: number;
  };
  initialData?: Partial<MarketData>;
}

export const MarketAnalysisGrid: React.FC<MarketAnalysisGridProps> = ({
  rentCompData,
  salesCompData,
  initialData = MOCK_MARKET_DATA,
}) => {
  const { setMarketAnalysis, state: wizardState } = useWizard();
  const [marketData] = useState<MarketData>({ ...MOCK_MARKET_DATA, ...initialData });
  // Initialize from context if available
  const [marketOutlook, setMarketOutlook] = useState(
    wizardState.marketAnalysis?.narrative ?? marketData.marketOutlook
  );

  // Persist market analysis data to WizardContext
  useEffect(() => {
    const dataToSave: MarketAnalysisData = {
      supplyMetrics: {
        totalInventory: marketData.supplyDemand.newConstructionSf + marketData.supplyDemand.pipelineSf,
        vacancyRate: marketData.supplyDemand.vacancyRate,
        absorptionRate: marketData.supplyDemand.absorptionSf,
        inventoryMonths: marketData.supplyDemand.vacancyRate > 0
          ? Math.round((marketData.supplyDemand.absorptionSf / 12) / (marketData.supplyDemand.vacancyRate / 100 * marketData.supplyDemand.absorptionSf) * 12)
          : 0,
      },
      demandMetrics: {
        averageRent: marketData.rentTrends.currentAskingRent,
        rentGrowth: marketData.rentTrends.rentChange,
        averageDaysOnMarket: marketData.saleTrends.avgDom,
        salesVolume: marketData.saleTrends.transactionVolume,
      },
      marketTrends: {
        overallTrend: marketData.supplyDemand.absorptionChange > 0 ? 'improving' :
          marketData.supplyDemand.absorptionChange < 0 ? 'declining' : 'stable',
        priceOutlook: marketData.saleTrends.priceChange > 0 ? 'increasing' :
          marketData.saleTrends.priceChange < 0 ? 'decreasing' : 'stable',
        supplyOutlook: marketData.supplyDemand.pipelineSf > marketData.supplyDemand.absorptionSf ? 'increasing' :
          marketData.supplyDemand.pipelineSf < marketData.supplyDemand.absorptionSf ? 'decreasing' : 'stable',
      },
      narrative: marketOutlook,
    };
    setMarketAnalysis(dataToSave);
  }, [marketData, marketOutlook, setMarketAnalysis]);

  const formatCurrency = (value: number) => `$${value.toFixed(2)}`;
  const formatPercent = (value: number) => `${value.toFixed(2)}%`;
  const formatNumber = (value: number) => new Intl.NumberFormat('en-US').format(value);

  const TrendBadge = ({ change, suffix = '' }: { change: number; suffix?: string }) => {
    const isPositive = change > 0;
    const isNeutral = change === 0;
    return (
      <span className={`inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded ${isPositive ? 'bg-accent-teal-mint-light text-accent-teal-mint' :
          isNeutral ? 'bg-surface-3 dark:bg-elevation-subtle text-slate-500' :
            'bg-accent-red-light text-harken-error'
        }`}>
        {isPositive ? <ArrowUpRight className="w-3 h-3" /> :
          isNeutral ? <Minus className="w-3 h-3" /> :
            <ArrowDownRight className="w-3 h-3" />}
        {isPositive ? '+' : ''}{change.toFixed(1)}{suffix}
      </span>
    );
  };

  const MetricCard = ({
    icon: Icon,
    label,
    value,
    change,
    changeLabel,
    source,
    className = '',
    valueClassName = ''
  }: {
    icon: any;
    label: string;
    value: string | number;
    change?: number;
    changeLabel?: string;
    source?: string;
    className?: string;
    valueClassName?: string;
  }) => (
    <div className={`bg-surface-1 dark:bg-elevation-1 rounded-2xl border border-light-border dark:border-dark-border dark:border-dark-border p-4 shadow-sm hover:shadow-md transition-shadow ${className}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="p-2 bg-surface-3 dark:bg-elevation-subtle rounded-lg">
          <Icon className="w-4 h-4 text-slate-600 dark:text-slate-200" />
        </div>
        {source && (
          <span className="text-[9px] font-medium text-slate-400 dark:text-slate-500 bg-surface-2 dark:bg-elevation-2 dark:bg-elevation-1 px-1.5 py-0.5 rounded">{source}</span>
        )}
      </div>
      <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">{label}</div>
      <div className={`text-2xl font-black text-slate-800 dark:text-white ${valueClassName}`}>{value}</div>
      {change !== undefined && (
        <div className="mt-2 flex items-center gap-2">
          <TrendBadge change={change} suffix="%" />
          {changeLabel && <span className="text-[10px] text-slate-400 dark:text-slate-500">{changeLabel}</span>}
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col bg-surface-2 dark:bg-elevation-2 dark:bg-elevation-1 p-6 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-harken-blue rounded-xl">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 dark:text-white">Market Analysis</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Data as of {marketData.dataAsOf}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {rentCompData && (
            <span className="px-3 py-1.5 bg-accent-teal-mint-light text-accent-teal-mint rounded-full text-xs font-bold flex items-center gap-1.5">
              <Home className="w-3.5 h-3.5" />
              {rentCompData.compCount} Rent Comps
            </span>
          )}
          {salesCompData && (
            <span className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-bold flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5" />
              {salesCompData.compCount} Sales Comps
            </span>
          )}
        </div>
      </div>

      {/* Note about contextual data location */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 flex items-start gap-3">
        <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">External Market Research</p>
          <p className="text-xs text-blue-800 dark:text-blue-200 mt-1">
            Enter market data from external research sources (CoStar, LoopNet, broker interviews, etc.).
            Aggregated data from your comparables is displayed in the "Values" sidebar within each approach for easy reference.
          </p>
        </div>
      </div>

      {/* Supply & Demand Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-slate-700 dark:text-slate-200" />
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">Supply & Demand</h2>
        </div>
        <div className="grid grid-cols-4 gap-4">
          <MetricCard
            icon={Target}
            label="Vacancy Rate"
            value={formatPercent(marketData.supplyDemand.vacancyRate)}
            change={marketData.supplyDemand.vacancyChange}
            changeLabel="YoY"
            valueClassName={marketData.supplyDemand.vacancyRate < 6 ? 'text-accent-teal-mint' : 'text-accent-amber-gold'}
          />
          <MetricCard
            icon={TrendingUp}
            label="Net Absorption"
            value={`${formatNumber(marketData.supplyDemand.absorptionSf)} SF`}
            change={marketData.supplyDemand.absorptionChange}
            changeLabel="YoY"
          />
          <MetricCard
            icon={Building2}
            label="New Construction"
            value={`${formatNumber(marketData.supplyDemand.newConstructionSf)} SF`}
            source="Trailing 12mo"
          />
          <MetricCard
            icon={Calendar}
            label="Pipeline"
            value={`${formatNumber(marketData.supplyDemand.pipelineSf)} SF`}
            source="Under Construction"
          />
        </div>
      </div>

      {/* Rent Trends Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Home className="w-5 h-5 text-slate-700 dark:text-slate-200" />
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">Rent Trends</h2>
        </div>
        <div className="grid grid-cols-4 gap-4">
          <MetricCard
            icon={DollarSign}
            label="Asking Rent"
            value={`${formatCurrency(marketData.rentTrends.currentAskingRent)}/SF`}
            change={marketData.rentTrends.rentChange}
            changeLabel="YoY Growth"
            valueClassName="text-harken-blue"
          />
          <MetricCard
            icon={TrendingUp}
            label="5-Year Avg Growth"
            value={formatPercent(marketData.rentTrends.rentGrowth5Year)}
            source="CAGR"
          />
          <div className="bg-surface-1 dark:bg-elevation-1 rounded-2xl border border-light-border dark:border-dark-border dark:border-dark-border p-4 shadow-sm col-span-2">
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 bg-surface-3 dark:bg-elevation-subtle rounded-lg">
                <BarChart3 className="w-4 h-4 text-slate-600 dark:text-slate-200" />
              </div>
              <span className="text-[9px] font-medium text-slate-400 dark:text-slate-500 bg-surface-2 dark:bg-elevation-2 dark:bg-elevation-1 px-1.5 py-0.5 rounded">Market Range</span>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-2">Submarket Rent Range</div>
            <div className="flex items-center gap-3">
              <div className="text-lg font-bold text-slate-600 dark:text-slate-200">{formatCurrency(marketData.rentTrends.rentRangeLow)}</div>
              <div className="flex-1 h-2 bg-gradient-to-r from-slate-200 via-[#0da1c7] to-slate-200 dark:from-harken-dark dark:to-slate-700 rounded-full relative">
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-harken-blue rounded-full border-2 border-white dark:border-slate-800 shadow-md"
                  style={{
                    left: `${((marketData.rentTrends.currentAskingRent - marketData.rentTrends.rentRangeLow) /
                      (marketData.rentTrends.rentRangeHigh - marketData.rentTrends.rentRangeLow)) * 100}%`
                  }}
                />
              </div>
              <div className="text-lg font-bold text-slate-600 dark:text-slate-200">{formatCurrency(marketData.rentTrends.rentRangeHigh)}</div>
            </div>
            <div className="text-center text-[10px] text-slate-400 dark:text-slate-500 mt-2">
              Subject Market Position: <span className="font-bold text-harken-blue">{formatCurrency(marketData.rentTrends.currentAskingRent)}/SF</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sale Trends Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-slate-700 dark:text-slate-200" />
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">Sale Trends</h2>
        </div>
        <div className="grid grid-cols-4 gap-4">
          <MetricCard
            icon={DollarSign}
            label="Avg Sale $/SF"
            value={`$${marketData.saleTrends.avgPricePsf}`}
            change={marketData.saleTrends.priceChange}
            changeLabel="YoY"
            valueClassName="text-accent-teal-mint"
          />
          <MetricCard
            icon={Percent}
            label="Avg Cap Rate"
            value={formatPercent(marketData.saleTrends.avgCapRate)}
            change={marketData.saleTrends.capRateChange * 100}
            changeLabel="bps YoY"
          />
          <MetricCard
            icon={Activity}
            label="Transaction Volume"
            value={`${marketData.saleTrends.transactionVolume} sales`}
            source="Trailing 12mo"
          />
          <MetricCard
            icon={Clock}
            label="Avg Days on Market"
            value={`${marketData.saleTrends.avgDom} days`}
          />
        </div>
      </div>

      {/* Cap Rate Comparison Chart */}
      <div className="bg-surface-1 dark:bg-elevation-1 rounded-2xl border border-light-border dark:border-dark-border dark:border-dark-border p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Percent className="w-4 h-4 text-harken-blue" />
            Cap Rate Summary
          </h3>
          <span className="text-[10px] text-slate-400 dark:text-slate-500">From Sales Comparables</span>
        </div>
        <div className="grid grid-cols-5 gap-4">
          <div className="text-center p-3 bg-surface-2 dark:bg-elevation-2 dark:bg-elevation-1 rounded-xl">
            <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase mb-1">Min</div>
            <div className="text-xl font-bold text-slate-700 dark:text-slate-200">5.64%</div>
          </div>
          <div className="text-center p-3 bg-surface-2 dark:bg-elevation-2 dark:bg-elevation-1 rounded-xl">
            <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase mb-1">25th %ile</div>
            <div className="text-xl font-bold text-slate-700 dark:text-slate-200">6.12%</div>
          </div>
          <div className="text-center p-3 bg-harken-blue/10 rounded-xl border-2 border-harken-blue">
            <div className="text-[10px] text-harken-blue uppercase mb-1 font-bold">Median</div>
            <div className="text-xl font-black text-harken-blue">6.50%</div>
          </div>
          <div className="text-center p-3 bg-surface-2 dark:bg-elevation-2 dark:bg-elevation-1 rounded-xl">
            <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase mb-1">75th %ile</div>
            <div className="text-xl font-bold text-slate-700 dark:text-slate-200">7.20%</div>
          </div>
          <div className="text-center p-3 bg-surface-2 dark:bg-elevation-2 dark:bg-elevation-1 rounded-xl">
            <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase mb-1">Max</div>
            <div className="text-xl font-bold text-slate-700 dark:text-slate-200">7.80%</div>
          </div>
        </div>
      </div>

    </div>
  );
};

