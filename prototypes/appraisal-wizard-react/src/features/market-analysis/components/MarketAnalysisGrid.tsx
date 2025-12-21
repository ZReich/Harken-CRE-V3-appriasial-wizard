import React, { useState } from 'react';
import { 
  TrendingUp, 
  Building2, 
  DollarSign, 
  Percent, 
  Calendar,
  BarChart3,
  MapPin,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  FileText,
  Activity,
  Home,
  Clock,
  Target
} from 'lucide-react';
import type { MarketData } from '../types';
import { MOCK_MARKET_DATA } from '../constants';

interface MarketAnalysisGridProps {
  // Data from other grids (auto-aggregated)
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
  const [marketData, _setMarketData] = useState<MarketData>({ ...MOCK_MARKET_DATA, ...initialData });
  void _setMarketData; // Reserved for future editable fields
  const [marketOutlook, setMarketOutlook] = useState(marketData.marketOutlook);

  const formatCurrency = (value: number) => `$${value.toFixed(2)}`;
  const formatPercent = (value: number) => `${value.toFixed(2)}%`;
  const formatNumber = (value: number) => new Intl.NumberFormat('en-US').format(value);

  const TrendBadge = ({ change, suffix = '' }: { change: number; suffix?: string }) => {
    const isPositive = change > 0;
    const isNeutral = change === 0;
    return (
      <span className={`inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded ${
        isPositive ? 'bg-emerald-100 text-emerald-700' : 
        isNeutral ? 'bg-slate-100 text-slate-500' :
        'bg-red-100 text-red-700'
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
    <div className={`bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow ${className}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="p-2 bg-slate-100 rounded-lg">
          <Icon className="w-4 h-4 text-slate-600" />
        </div>
        {source && (
          <span className="text-[9px] font-medium text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded">{source}</span>
        )}
      </div>
      <div className="text-xs text-slate-500 font-medium mb-1">{label}</div>
      <div className={`text-2xl font-black text-slate-800 ${valueClassName}`}>{value}</div>
      {change !== undefined && (
        <div className="mt-2 flex items-center gap-2">
          <TrendBadge change={change} suffix="%" />
          {changeLabel && <span className="text-[10px] text-slate-400">{changeLabel}</span>}
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-auto p-6 space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#0da1c7] rounded-xl">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800">Market Analysis</h1>
            <p className="text-sm text-slate-500">Data as of {marketData.dataAsOf}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {rentCompData && (
            <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold flex items-center gap-1.5">
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

      {/* Data Source Summary (from other grids) */}
      {(rentCompData || salesCompData) && (
        <div className="bg-gradient-to-r from-[#0da1c7]/10 to-emerald-500/10 rounded-2xl p-4 border border-[#0da1c7]/20">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-4 h-4 text-[#0da1c7]" />
            <span className="text-sm font-bold text-slate-700">Auto-Aggregated from Your Comparables</span>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {rentCompData && (
              <>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase">Avg Rent (Comps)</div>
                  <div className="text-lg font-bold text-[#0da1c7]">{formatCurrency(rentCompData.avgRent)}/SF</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase">Rent Range</div>
                  <div className="text-lg font-bold text-slate-700">
                    {formatCurrency(rentCompData.rentRange[0])} - {formatCurrency(rentCompData.rentRange[1])}
                  </div>
                </div>
              </>
            )}
            {salesCompData && (
              <>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase">Avg $/SF (Sales)</div>
                  <div className="text-lg font-bold text-emerald-600">${salesCompData.avgPricePsf.toFixed(0)}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase">Avg Cap Rate</div>
                  <div className="text-lg font-bold text-slate-700">{salesCompData.avgCapRate.toFixed(2)}%</div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Supply & Demand Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-slate-700" />
          <h2 className="text-lg font-bold text-slate-800">Supply & Demand</h2>
        </div>
        <div className="grid grid-cols-4 gap-4">
          <MetricCard 
            icon={Target}
            label="Vacancy Rate"
            value={formatPercent(marketData.supplyDemand.vacancyRate)}
            change={marketData.supplyDemand.vacancyChange}
            changeLabel="YoY"
            valueClassName={marketData.supplyDemand.vacancyRate < 6 ? 'text-emerald-600' : 'text-amber-600'}
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
          <Home className="w-5 h-5 text-slate-700" />
          <h2 className="text-lg font-bold text-slate-800">Rent Trends</h2>
        </div>
        <div className="grid grid-cols-4 gap-4">
          <MetricCard 
            icon={DollarSign}
            label="Asking Rent"
            value={`${formatCurrency(marketData.rentTrends.currentAskingRent)}/SF`}
            change={marketData.rentTrends.rentChange}
            changeLabel="YoY Growth"
            valueClassName="text-[#0da1c7]"
          />
          <MetricCard 
            icon={TrendingUp}
            label="5-Year Avg Growth"
            value={formatPercent(marketData.rentTrends.rentGrowth5Year)}
            source="CAGR"
          />
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm col-span-2">
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 bg-slate-100 rounded-lg">
                <BarChart3 className="w-4 h-4 text-slate-600" />
              </div>
              <span className="text-[9px] font-medium text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded">Market Range</span>
            </div>
            <div className="text-xs text-slate-500 font-medium mb-2">Submarket Rent Range</div>
            <div className="flex items-center gap-3">
              <div className="text-lg font-bold text-slate-600">{formatCurrency(marketData.rentTrends.rentRangeLow)}</div>
              <div className="flex-1 h-2 bg-gradient-to-r from-slate-200 via-[#0da1c7] to-slate-200 rounded-full relative">
                <div 
                  className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-[#0da1c7] rounded-full border-2 border-white shadow-md"
                  style={{ 
                    left: `${((marketData.rentTrends.currentAskingRent - marketData.rentTrends.rentRangeLow) / 
                      (marketData.rentTrends.rentRangeHigh - marketData.rentTrends.rentRangeLow)) * 100}%` 
                  }}
                />
              </div>
              <div className="text-lg font-bold text-slate-600">{formatCurrency(marketData.rentTrends.rentRangeHigh)}</div>
            </div>
            <div className="text-center text-[10px] text-slate-400 mt-2">
              Subject Market Position: <span className="font-bold text-[#0da1c7]">{formatCurrency(marketData.rentTrends.currentAskingRent)}/SF</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sale Trends Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-slate-700" />
          <h2 className="text-lg font-bold text-slate-800">Sale Trends</h2>
        </div>
        <div className="grid grid-cols-4 gap-4">
          <MetricCard 
            icon={DollarSign}
            label="Avg Sale $/SF"
            value={`$${marketData.saleTrends.avgPricePsf}`}
            change={marketData.saleTrends.priceChange}
            changeLabel="YoY"
            valueClassName="text-emerald-600"
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

      {/* Market Outlook Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-slate-700" />
          <h2 className="text-lg font-bold text-slate-800">Market Outlook</h2>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <textarea
            value={marketOutlook}
            onChange={(e) => setMarketOutlook(e.target.value)}
            placeholder="Enter market outlook narrative..."
            className="w-full h-32 text-sm text-slate-700 leading-relaxed resize-none outline-none"
          />
          <div className="mt-4 flex items-center gap-2 text-[10px] text-slate-400">
            <MapPin className="w-3 h-3" />
            <span>Market narrative will be included in the Market Analysis section of your report</span>
          </div>
        </div>
      </div>

      {/* Cap Rate Comparison Chart */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Percent className="w-4 h-4 text-[#0da1c7]" />
            Cap Rate Summary
          </h3>
          <span className="text-[10px] text-slate-400">From Sales Comparables</span>
        </div>
        <div className="grid grid-cols-5 gap-4">
          <div className="text-center p-3 bg-slate-50 rounded-xl">
            <div className="text-[10px] text-slate-500 uppercase mb-1">Min</div>
            <div className="text-xl font-bold text-slate-700">5.64%</div>
          </div>
          <div className="text-center p-3 bg-slate-50 rounded-xl">
            <div className="text-[10px] text-slate-500 uppercase mb-1">25th %ile</div>
            <div className="text-xl font-bold text-slate-700">6.12%</div>
          </div>
          <div className="text-center p-3 bg-[#0da1c7]/10 rounded-xl border-2 border-[#0da1c7]">
            <div className="text-[10px] text-[#0da1c7] uppercase mb-1 font-bold">Median</div>
            <div className="text-xl font-black text-[#0da1c7]">6.50%</div>
          </div>
          <div className="text-center p-3 bg-slate-50 rounded-xl">
            <div className="text-[10px] text-slate-500 uppercase mb-1">75th %ile</div>
            <div className="text-xl font-bold text-slate-700">7.20%</div>
          </div>
          <div className="text-center p-3 bg-slate-50 rounded-xl">
            <div className="text-[10px] text-slate-500 uppercase mb-1">Max</div>
            <div className="text-xl font-bold text-slate-700">7.80%</div>
          </div>
        </div>
      </div>

    </div>
  );
};

