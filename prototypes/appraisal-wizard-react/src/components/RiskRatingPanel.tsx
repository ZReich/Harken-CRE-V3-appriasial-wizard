/**
 * Risk Rating Panel Component
 * 
 * Displays the Investment Risk Rating ("Bond Rating for Buildings")
 * with comprehensive analysis of the four risk dimensions.
 * 
 * This proprietary methodology combines multiple data sources to provide
 * an institutional-quality risk assessment framework.
 */

import { useState, useEffect } from 'react';
import { 
  Shield, 
  ShieldCheck, 
  ShieldAlert, 
  ShieldX,
  AlertCircle,
  RefreshCw,
  TrendingUp,
  Activity,
  Building2,
  BarChart3,
  Info,
  ChevronDown,
  ChevronUp,
  Target,
  Scale,
  Gauge,
  LineChart,
  PieChart,
  Landmark,
  MapPin,
  Clock,
  DollarSign
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
  lightBg: string;
  icon: typeof Shield;
  description: string;
  investorProfile: string;
}> = {
  'AAA': { 
    bg: 'bg-emerald-100', 
    text: 'text-emerald-800', 
    border: 'border-emerald-400', 
    lightBg: 'bg-emerald-50',
    icon: ShieldCheck, 
    description: 'Institutional Grade - Exceptional',
    investorProfile: 'Suitable for institutional investors, pension funds, and REITs seeking core assets with minimal risk exposure.'
  },
  'AA': { 
    bg: 'bg-emerald-100', 
    text: 'text-emerald-700', 
    border: 'border-emerald-400', 
    lightBg: 'bg-emerald-50',
    icon: ShieldCheck, 
    description: 'High Quality - Very Low Risk',
    investorProfile: 'Appropriate for conservative investors and institutions seeking stable, predictable returns with limited downside.'
  },
  'A': { 
    bg: 'bg-emerald-50', 
    text: 'text-emerald-700', 
    border: 'border-emerald-300', 
    lightBg: 'bg-emerald-50/50',
    icon: ShieldCheck, 
    description: 'Upper Medium Grade',
    investorProfile: 'Well-suited for core-plus strategies balancing stability with modest value-add potential.'
  },
  'BBB': { 
    bg: 'bg-cyan-100', 
    text: 'text-cyan-800', 
    border: 'border-cyan-400', 
    lightBg: 'bg-cyan-50',
    icon: Shield, 
    description: 'Investment Grade - Moderate Risk',
    investorProfile: 'Suitable for value-add investors willing to accept moderate risk for enhanced returns.'
  },
  'BB': { 
    bg: 'bg-amber-100', 
    text: 'text-amber-800', 
    border: 'border-amber-400', 
    lightBg: 'bg-amber-50',
    icon: ShieldAlert, 
    description: 'Speculative - Below Investment Grade',
    investorProfile: 'Appropriate for opportunistic investors with higher risk tolerance and active management capabilities.'
  },
  'B': { 
    bg: 'bg-amber-100', 
    text: 'text-amber-700', 
    border: 'border-amber-400', 
    lightBg: 'bg-amber-50',
    icon: ShieldAlert, 
    description: 'Highly Speculative',
    investorProfile: 'Requires experienced investors comfortable with significant risk and hands-on asset management.'
  },
  'CCC': { 
    bg: 'bg-red-100', 
    text: 'text-red-800', 
    border: 'border-red-400', 
    lightBg: 'bg-red-50',
    icon: ShieldX, 
    description: 'Substantial Risk',
    investorProfile: 'Distressed asset specialists or turnaround investors with extensive rehabilitation experience.'
  },
  'CC': { 
    bg: 'bg-red-100', 
    text: 'text-red-700', 
    border: 'border-red-400', 
    lightBg: 'bg-red-50',
    icon: ShieldX, 
    description: 'Extremely Speculative',
    investorProfile: 'High-risk tolerance required. Material probability of loss; deep discount pricing essential.'
  },
  'C': { 
    bg: 'bg-red-50', 
    text: 'text-red-700', 
    border: 'border-red-300', 
    lightBg: 'bg-red-50/50',
    icon: ShieldX, 
    description: 'Near Default Risk',
    investorProfile: 'Distressed debt investors only. Significant capital required for stabilization.'
  },
};

const DIMENSION_CONFIG = {
  marketVolatility: {
    icon: TrendingUp,
    label: 'Market Volatility (Beta)',
    shortLabel: 'Market Volatility',
    description: 'Measures price sensitivity relative to broader real estate market movements, incorporating historical volatility patterns, economic cycle exposure, and sector-specific risk factors.',
    factors: [
      { icon: LineChart, label: 'Price volatility vs. market index' },
      { icon: Activity, label: 'Economic cycle sensitivity' },
      { icon: Target, label: 'Sector concentration risk' },
    ],
  },
  liquidity: {
    icon: Activity,
    label: 'Liquidity Risk',
    shortLabel: 'Liquidity',
    description: 'Evaluates the ease of converting the asset to cash without significant price concession, based on market depth, transaction velocity, and buyer pool characteristics.',
    factors: [
      { icon: Clock, label: 'Average days on market' },
      { icon: Scale, label: 'Transaction volume depth' },
      { icon: MapPin, label: 'Geographic market liquidity' },
    ],
  },
  incomeStability: {
    icon: BarChart3,
    label: 'Income Stability (Yield Spread)',
    shortLabel: 'Income Stability',
    description: 'Analyzes the predictability and durability of income streams through lease structure, tenant creditworthiness, and income diversification metrics.',
    factors: [
      { icon: DollarSign, label: 'Cap rate spread analysis' },
      { icon: PieChart, label: 'Income diversification' },
      { icon: Landmark, label: 'Tenant credit quality' },
    ],
  },
  assetQuality: {
    icon: Building2,
    label: 'Asset Quality',
    shortLabel: 'Asset Quality',
    description: 'Comprehensive assessment of physical characteristics including construction quality, functional utility, deferred maintenance, and capital expenditure requirements.',
    factors: [
      { icon: Building2, label: 'Construction & condition' },
      { icon: Gauge, label: 'Functional obsolescence' },
      { icon: Target, label: 'Location quality metrics' },
    ],
  },
};

// Rating scale for visual comparison
const RATING_SCALE = ['AAA', 'AA', 'A', 'BBB', 'BB', 'B', 'CCC', 'CC', 'C'];

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
  const [expandedDimension, setExpandedDimension] = useState<string | null>(null);
  const [showMethodology, setShowMethodology] = useState(false);

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
      <div className={`bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 ${className}`}>
        <div className="flex flex-col items-center justify-center gap-4 py-12">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-slate-200 rounded-full" />
            <div className="absolute inset-0 w-16 h-16 border-4 border-[#0da1c7] border-t-transparent rounded-full animate-spin" />
          </div>
          <div className="text-center">
            <p className="font-medium text-slate-700">Calculating Investment Risk Rating</p>
            <p className="text-sm text-slate-500 mt-1">Analyzing market data, property characteristics, and economic indicators...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 ${className}`}>
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
      <div className={`bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 ${className}`}>
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
  const gradeIndex = RATING_SCALE.indexOf(data.overallGrade);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Rating Card */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-[#0da1c7] to-[#0d8fb5] rounded-xl shadow-sm">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-lg">Investment Risk Rating</h3>
                <p className="text-sm text-slate-500">Proprietary "Bond Rating for Buildings" Analysis</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowMethodology(!showMethodology)}
                className="text-xs text-[#0da1c7] hover:text-[#0d8fb5] flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-[#0da1c7]/5 transition-colors"
              >
                <Info className="w-3.5 h-3.5" />
                Methodology
              </button>
            </div>
          </div>
        </div>

        {/* Methodology Explainer */}
        {showMethodology && (
          <div className="px-6 py-4 bg-gradient-to-r from-[#0da1c7]/5 to-transparent border-b border-slate-200">
            <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <Scale className="w-4 h-4 text-[#0da1c7]" />
              Risk Assessment Framework
            </h4>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              Our Investment Risk Rating applies institutional-grade analytics to evaluate commercial real estate 
              risk using a framework inspired by fixed-income credit ratings. The methodology synthesizes 
              multiple quantitative and qualitative factors across four critical dimensions to produce a 
              comprehensive risk assessment.
            </p>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-[#0da1c7]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-[#0da1c7] font-bold">1</span>
                </div>
                <div>
                  <span className="font-medium text-slate-700">Multi-Source Data Integration</span>
                  <p className="text-slate-500">Federal economic data, market statistics, and property-specific metrics</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-[#0da1c7]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-[#0da1c7] font-bold">2</span>
                </div>
                <div>
                  <span className="font-medium text-slate-700">Dynamic Weight Calibration</span>
                  <p className="text-slate-500">Weights adjusted based on property type and market conditions</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-[#0da1c7]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-[#0da1c7] font-bold">3</span>
                </div>
                <div>
                  <span className="font-medium text-slate-700">Z-Score Normalization</span>
                  <p className="text-slate-500">Scores normalized relative to MSA-level benchmarks</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-[#0da1c7]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-[#0da1c7] font-bold">4</span>
                </div>
                <div>
                  <span className="font-medium text-slate-700">Composite Scoring</span>
                  <p className="text-slate-500">Weighted aggregation into AAA-C rating scale</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="p-6">
          {/* Rating Badge with Scale */}
          <div className="mb-8">
            {/* Main Badge */}
            <div className="flex items-center justify-center mb-6">
              <div className={`${gradeConfig.bg} ${gradeConfig.border} border-4 rounded-2xl p-6 text-center min-w-[200px] shadow-sm`}>
                <div className="flex justify-center mb-2">
                  <GradeIcon className={`w-10 h-10 ${gradeConfig.text}`} />
                </div>
                <div className={`text-5xl font-bold ${gradeConfig.text} mb-1 tracking-tight`}>
                  {data.overallGrade}
                </div>
                <div className={`text-sm font-semibold ${gradeConfig.text} mb-2`}>
                  {gradeConfig.description}
                </div>
                <div className="text-slate-600 text-sm font-medium">
                  Composite Score: {data.overallScore} / 100
                </div>
              </div>
            </div>

            {/* Rating Scale Visualization */}
            <div className="bg-slate-50 rounded-xl p-4">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                <span>Lower Risk</span>
                <span>Higher Risk</span>
              </div>
              <div className="flex items-center gap-1">
                {RATING_SCALE.map((grade) => {
                  const config = GRADE_CONFIG[grade];
                  const isCurrent = grade === data.overallGrade;
                  return (
                    <div 
                      key={grade}
                      className={`flex-1 h-8 flex items-center justify-center rounded text-xs font-bold transition-all ${
                        isCurrent 
                          ? `${config.bg} ${config.text} ${config.border} border-2 scale-110 shadow-md z-10` 
                          : `${config.lightBg} ${config.text} opacity-60`
                      }`}
                    >
                      {grade}
                    </div>
                  );
                })}
              </div>
              <div className="text-center mt-3">
                <span className="text-xs text-slate-500">
                  This property ranks in the <span className="font-semibold text-slate-700">
                    {gradeIndex <= 2 ? 'top tier' : gradeIndex <= 4 ? 'middle tier' : 'speculative tier'}
                  </span> of investment-grade properties
                </span>
              </div>
            </div>
          </div>

          {/* Investor Profile */}
          <div className={`${gradeConfig.lightBg} rounded-xl p-4 mb-6 border ${gradeConfig.border} border-opacity-30`}>
            <h4 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
              <Target className="w-4 h-4 text-slate-600" />
              Investor Profile Match
            </h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              {gradeConfig.investorProfile}
            </p>
          </div>

          {/* Dimension Analysis */}
          <h4 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-slate-600" />
            Four-Dimension Risk Analysis
          </h4>
          
          <div className="space-y-3">
            {Object.entries(data.dimensions).map(([key, dim]) => {
              const config = DIMENSION_CONFIG[key as keyof typeof DIMENSION_CONFIG];
              const Icon = config.icon;
              const score = dim.score;
              const weight = dim.weight;
              const isExpanded = expandedDimension === key;

              return (
                <div key={key} className="bg-slate-50 rounded-xl overflow-hidden border border-slate-100">
                  {/* Dimension Header */}
                  <button
                    onClick={() => setExpandedDimension(isExpanded ? null : key)}
                    className="w-full p-4 flex items-center justify-between hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        score >= 80 ? 'bg-emerald-100 text-emerald-600' :
                        score >= 60 ? 'bg-cyan-100 text-cyan-600' :
                        score >= 40 ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <span className="font-medium text-slate-800">{config.label}</span>
                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                          <span>Weight: {(weight * 100).toFixed(0)}%</span>
                          <span>•</span>
                          <span className={`font-medium ${
                            score >= 80 ? 'text-emerald-600' :
                            score >= 60 ? 'text-cyan-600' :
                            score >= 40 ? 'text-amber-600' : 'text-red-600'
                          }`}>
                            {score >= 80 ? 'Strong' : score >= 60 ? 'Adequate' : score >= 40 ? 'Moderate Risk' : 'Elevated Risk'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-32">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-lg font-bold text-slate-800">{score}</span>
                          <span className="text-xs text-slate-400">/100</span>
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
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                  </button>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-slate-200">
                      <p className="text-sm text-slate-600 leading-relaxed mt-3 mb-4">
                        {config.description}
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        {config.factors.map((factor, idx) => {
                          const FactorIcon = factor.icon;
                          return (
                            <div key={idx} className="bg-white dark:bg-slate-700 rounded-lg p-3 border border-slate-200 dark:border-slate-600">
                              <FactorIcon className="w-4 h-4 text-slate-400 mb-1" />
                              <span className="text-xs text-slate-600">{factor.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Weighting Rationale */}
          {data.weightingRationale && (
            <div className="mt-6 p-4 bg-gradient-to-r from-slate-50 to-white rounded-xl border border-slate-200">
              <h4 className="font-medium text-slate-700 mb-2 flex items-center gap-2">
                <Scale className="w-4 h-4 text-slate-500" />
                Dynamic Weight Rationale
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed">{data.weightingRationale}</p>
            </div>
          )}
        </div>
      </div>

      {/* Disclosure Toggle */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <button
          onClick={() => setShowDisclosure(!showDisclosure)}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Info className="w-5 h-5 text-slate-400" />
            <span className="font-medium text-slate-700">USPAP Compliance Disclosure</span>
          </div>
          {showDisclosure ? (
            <ChevronUp className="w-5 h-5 text-slate-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-400" />
          )}
        </button>
        {showDisclosure && (
          <div className="px-6 pb-6 border-t border-slate-200">
            <p className="text-xs text-slate-600 leading-relaxed mt-4 whitespace-pre-line">
              {RISK_RATING_DISCLOSURE}
            </p>
          </div>
        )}
      </div>

      {/* Generation Info */}
      <div className="text-xs text-slate-400 text-center flex items-center justify-center gap-2">
        <Clock className="w-3 h-3" />
        Rating generated: {new Date(data.generatedDate).toLocaleDateString()} at {new Date(data.generatedDate).toLocaleTimeString()}
      </div>
    </div>
  );
}

export default RiskRatingPanel;
