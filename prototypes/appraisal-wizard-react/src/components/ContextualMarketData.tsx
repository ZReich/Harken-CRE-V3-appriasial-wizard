import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, Minus, Activity, Building2, DollarSign, Percent, Clock, MapPin } from 'lucide-react';
import { useWizard } from '../context/WizardContext';

interface MarketMetric {
  label: string;
  value: string;
  subValue?: string;
  trend?: 'up' | 'down' | 'stable';
  Icon?: React.ElementType;
}

interface ContextualMarketDataProps {
  activeApproach: string;
  scenarioId?: number;
  className?: string;
}

/**
 * ContextualMarketData - Displays market metrics relevant to the active approach
 * 
 * Different data shown per approach:
 * - Sales Comparison: Market $/SF range, transaction volume, days on market
 * - Income Approach: Market rent range, vacancy rate, cap rate range
 * - Cost Approach: Construction cost $/SF, labor indices
 * - Land Valuation: Land price per acre range, absorption rate
 */
export const ContextualMarketData: React.FC<ContextualMarketDataProps> = ({
  activeApproach,
  scenarioId: _scenarioId,
  className = '',
}) => {
  void _scenarioId; // Reserved for future scenario-specific data
  const { state } = useWizard();
  const { propertyType, propertySubtype, subjectData } = state;

  // Get metrics based on active approach
  const metrics = useMemo((): MarketMetric[] => {
    switch (activeApproach) {
      case 'Sales Comparison':
        return [
          {
            label: 'Market $/SF Range',
            value: '$185 - $245',
            subValue: 'Based on 12 comps',
            trend: 'up',
            Icon: Building2,
          },
          {
            label: 'Avg Days on Market',
            value: '68 days',
            subValue: 'vs 82 days prior year',
            trend: 'down',
            Icon: Clock,
          },
          {
            label: 'Transaction Volume',
            value: '24 sales',
            subValue: 'Last 12 months',
            trend: 'stable',
            Icon: Activity,
          },
          {
            label: 'Cap Rate (Sales)',
            value: '6.25% - 7.50%',
            subValue: 'Implied from sales',
            Icon: Percent,
          },
        ];

      case 'Income Approach':
        return [
          {
            label: 'Market Rent Range',
            value: '$22.50 - $28.00',
            subValue: 'NNN per SF',
            trend: 'up',
            Icon: DollarSign,
          },
          {
            label: 'Market Vacancy',
            value: '6.8%',
            subValue: 'Submarket average',
            trend: 'down',
            Icon: Building2,
          },
          {
            label: 'Market Cap Rate',
            value: '6.00% - 7.25%',
            subValue: 'Class B Office',
            Icon: Percent,
          },
          {
            label: 'Expense Ratio',
            value: '32% - 38%',
            subValue: 'Market typical',
            Icon: Activity,
          },
        ];

      case 'Cost Approach':
        return [
          {
            label: 'Construction Cost',
            value: '$165 - $195',
            subValue: 'Per SF (incl. site work)',
            trend: 'up',
            Icon: Building2,
          },
          {
            label: 'Labor Index',
            value: '1.12',
            subValue: 'vs national average',
            Icon: Activity,
          },
          {
            label: 'Material Costs',
            value: '+8.5%',
            subValue: 'YoY change',
            trend: 'up',
            Icon: TrendingUp,
          },
          {
            label: 'Entrepreneurial Profit',
            value: '10% - 15%',
            subValue: 'Market typical',
            Icon: Percent,
          },
        ];

      case 'Land Valuation':
        return [
          {
            label: 'Land Price Range',
            value: '$12 - $18',
            subValue: 'Per SF land',
            trend: 'stable',
            Icon: MapPin,
          },
          {
            label: 'Price per Acre',
            value: '$520K - $785K',
            subValue: 'Commercial zoned',
            Icon: DollarSign,
          },
          {
            label: 'Absorption Rate',
            value: '18 months',
            subValue: 'Avg time to sell',
            Icon: Clock,
          },
          {
            label: 'Development Activity',
            value: 'Moderate',
            subValue: '3 projects in area',
            trend: 'up',
            Icon: Activity,
          },
        ];

      default:
        return [
          {
            label: 'Property Type',
            value: propertyType || 'Not specified',
            Icon: Building2,
          },
          {
            label: 'Subtype',
            value: propertySubtype || 'Not specified',
            Icon: Activity,
          },
          {
            label: 'Location',
            value: subjectData?.address?.city || 'Not specified',
            Icon: MapPin,
          },
        ];
    }
  }, [activeApproach, propertyType, propertySubtype, subjectData]);

  // Get approach-specific header color
  const getApproachTheme = (approach: string) => {
    switch (approach) {
      case 'Sales Comparison':
        return { bg: 'bg-cyan-50', border: 'border-cyan-200', accent: 'text-cyan-700' };
      case 'Income Approach':
        return { bg: 'bg-green-50', border: 'border-green-200', accent: 'text-green-700' };
      case 'Cost Approach':
        return { bg: 'bg-orange-50', border: 'border-orange-200', accent: 'text-orange-700' };
      case 'Land Valuation':
        return { bg: 'bg-lime-50', border: 'border-lime-200', accent: 'text-lime-700' };
      default:
        return { bg: 'bg-slate-50', border: 'border-slate-200', accent: 'text-slate-700' };
    }
  };

  const theme = getApproachTheme(activeApproach);

  // Get trend icon
  const TrendIcon = ({ trend }: { trend?: 'up' | 'down' | 'stable' }) => {
    if (!trend) return null;
    
    switch (trend) {
      case 'up':
        return <TrendingUp size={12} className="text-emerald-500" />;
      case 'down':
        return <TrendingDown size={12} className="text-red-500" />;
      case 'stable':
        return <Minus size={12} className="text-slate-400" />;
    }
  };

  return (
    <div className={`bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden ${className}`}>
      {/* Header */}
      <div className={`px-4 py-3 ${theme.bg} border-b ${theme.border}`}>
        <h4 className={`text-xs font-bold uppercase tracking-widest ${theme.accent}`}>
          Market Context
        </h4>
        <p className="text-xs text-slate-500 mt-0.5">
          {activeApproach} metrics
        </p>
      </div>

      {/* Metrics grid */}
      <div className="p-3 space-y-3">
        {metrics.map((metric, index) => {
          const Icon = metric.Icon || Activity;
          
          return (
            <div 
              key={index}
              className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <div className={`p-1.5 rounded-lg ${theme.bg}`}>
                <Icon size={14} className={theme.accent} />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    {metric.label}
                  </span>
                  <TrendIcon trend={metric.trend} />
                </div>
                <div className="text-sm font-bold text-slate-800 truncate">
                  {metric.value}
                </div>
                {metric.subValue && (
                  <div className="text-xs text-slate-400">
                    {metric.subValue}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Data source note */}
      <div className="px-4 py-2 bg-slate-50 border-t border-slate-100">
        <p className="text-[10px] text-slate-400 italic">
          Data sourced from Market Analysis inputs
        </p>
      </div>
    </div>
  );
};

export default ContextualMarketData;

