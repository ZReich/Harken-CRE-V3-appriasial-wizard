/**
 * Risk Rating Panel Component
 * 
 * Displays the Investment Risk Rating ("Bond Rating for Buildings")
 * with an interactive UI showing the four risk dimensions.
 */

import { useState, useEffect } from 'react';
import { 
  Shield, 
  ShieldCheck, 
  ShieldAlert, 
  ShieldX,
  Loader2,
  AlertCircle,
  RefreshCw,
  TrendingUp,
  Activity,
  Building2,
  BarChart3,
  Info
} from 'lucide-react';
import { calculateRiskRating, RISK_RATING_DISCLOSURE } from '../services/riskRatingService';
import type { RiskRatingRequest, RiskRatingData } from '../types/api';

interface RiskRatingPanelProps {
  propertyType: string;
  latitude?: number;
  longitude?: number;
  isIncomeProducing?: boolean;
  capRate?: number;
  daysOnMarket?: number;
  yearBuilt?: number;
  condition?: string;
  className?: string;
  onDataLoaded?: (data: RiskRatingData) => void;
}

// Grade colors and icons
const GRADE_CONFIG: Record<string, { 
  bg: string; 
  text: string; 
  border: string; 
  icon: typeof Shield;
  description: string;
}> = {
  'AAA': { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-400', icon: ShieldCheck, description: 'Institutional Grade - Exceptional' },
  'AA': { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-400', icon: ShieldCheck, description: 'High Quality - Very Low Risk' },
  'A': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-300', icon: ShieldCheck, description: 'Upper Medium Grade' },
  'BBB': { bg: 'bg-cyan-100', text: 'text-cyan-800', border: 'border-cyan-400', icon: Shield, description: 'Investment Grade - Moderate Risk' },
  'BB': { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-400', icon: ShieldAlert, description: 'Speculative - Below Investment Grade' },
  'B': { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-400', icon: ShieldAlert, description: 'Highly Speculative' },
  'CCC': { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-400', icon: ShieldX, description: 'Substantial Risk' },
  'CC': { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-400', icon: ShieldX, description: 'Extremely Speculative' },
  'C': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-300', icon: ShieldX, description: 'Near Default Risk' },
};

const DIMENSION_ICONS = {
  marketVolatility: TrendingUp,
  liquidity: Activity,
  incomeStability: BarChart3,
  assetQuality: Building2,
};

const DIMENSION_LABELS = {
  marketVolatility: 'Market Volatility',
  liquidity: 'Liquidity Risk',
  incomeStability: 'Income Stability',
  assetQuality: 'Asset Quality',
};

export function RiskRatingPanel({
  propertyType,
  latitude,
  longitude,
  isIncomeProducing = true,
  capRate,
  daysOnMarket,
  yearBuilt,
  condition,
  className = '',
  onDataLoaded,
}: RiskRatingPanelProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<RiskRatingData | null>(null);
  const [showDisclosure, setShowDisclosure] = useState(false);

  const fetchRating = async () => {
    if (!propertyType || !latitude || !longitude) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const request: RiskRatingRequest = {
        propertyType,
        latitude,
        longitude,
        isIncomeProducing,
        capRate,
        daysOnMarket,
        yearBuilt,
        condition,
      };

      const response = await calculateRiskRating(request);
      
      if (response.success && response.data) {
        setData(response.data);
        onDataLoaded?.(response.data);
      } else {
        setError(response.error || 'Failed to calculate risk rating');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (propertyType && latitude && longitude) {
      fetchRating();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propertyType, latitude, longitude, isIncomeProducing, capRate, daysOnMarket, yearBuilt, condition]);

  // Loading state
  if (isLoading) {
    return (
      <div className={`bg-white rounded-xl border border-slate-200 p-6 ${className}`}>
        <div className="flex items-center justify-center gap-3 py-8">
          <Loader2 className="w-5 h-5 text-[#0da1c7] animate-spin" />
          <span className="text-slate-600">Calculating risk rating...</span>
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
          onClick={fetchRating}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      </div>
    );
  }

  // No data / incomplete inputs
  if (!data) {
    return (
      <div className={`bg-white rounded-xl border border-slate-200 p-6 ${className}`}>
        <div className="flex items-center gap-3 text-amber-600 mb-2">
          <Info className="w-5 h-5" />
          <span className="font-medium">Property Data Required</span>
        </div>
        <p className="text-sm text-slate-500">
          Complete property location and type information to calculate the investment risk rating.
        </p>
      </div>
    );
  }

  const gradeConfig = GRADE_CONFIG[data.overallGrade] || GRADE_CONFIG['BBB'];
  const GradeIcon = gradeConfig.icon;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Rating Card */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#0da1c7]/10 rounded-lg">
              <Shield className="w-5 h-5 text-[#0da1c7]" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Investment Risk Rating</h3>
              <p className="text-xs text-slate-500">"Bond Rating for Buildings"</p>
            </div>
          </div>
          <button
            onClick={() => setShowDisclosure(!showDisclosure)}
            className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1"
          >
            <Info className="w-3 h-3" />
            Disclosure
          </button>
        </div>

        <div className="p-6">
          {/* Rating Badge */}
          <div className="flex items-center justify-center mb-6">
            <div className={`${gradeConfig.bg} ${gradeConfig.border} border-4 rounded-2xl p-6 text-center min-w-[180px]`}>
              <div className="flex justify-center mb-2">
                <GradeIcon className={`w-8 h-8 ${gradeConfig.text}`} />
              </div>
              <div className={`text-4xl font-bold ${gradeConfig.text} mb-1`}>
                {data.overallGrade}
              </div>
              <div className={`text-sm font-medium ${gradeConfig.text}`}>
                {gradeConfig.description}
              </div>
              <div className="text-slate-600 mt-2 text-sm">
                Score: {data.overallScore} / 100
              </div>
            </div>
          </div>

          {/* Dimension Scores */}
          <div className="space-y-3">
            {Object.entries(data.dimensions).map(([key, dim]) => {
              const Icon = DIMENSION_ICONS[key as keyof typeof DIMENSION_ICONS];
              const label = DIMENSION_LABELS[key as keyof typeof DIMENSION_LABELS];
              const score = dim.score;
              const weight = dim.weight;

              return (
                <div key={key} className="bg-slate-50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-slate-500" />
                      <span className="text-sm font-medium text-slate-700">{label}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-slate-500">Weight: {(weight * 100).toFixed(0)}%</span>
                      <span className="font-semibold text-slate-800">{score}</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${
                        score >= 80 ? 'bg-emerald-500' :
                        score >= 60 ? 'bg-cyan-500' :
                        score >= 40 ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Weighting Rationale */}
          {data.weightingRationale && (
            <div className="mt-4 p-3 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-500 font-medium mb-1">Weight Determination</p>
              <p className="text-sm text-slate-600">{data.weightingRationale}</p>
            </div>
          )}
        </div>
      </div>

      {/* Disclosure Panel */}
      {showDisclosure && (
        <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
          <h4 className="font-medium text-slate-700 mb-2">USPAP Disclosure</h4>
          <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
            {RISK_RATING_DISCLOSURE}
          </p>
        </div>
      )}

      {/* Generation Info */}
      <div className="text-xs text-slate-400 text-center">
        Rating generated: {new Date(data.generatedDate).toLocaleDateString()}
      </div>
    </div>
  );
}

export default RiskRatingPanel;

