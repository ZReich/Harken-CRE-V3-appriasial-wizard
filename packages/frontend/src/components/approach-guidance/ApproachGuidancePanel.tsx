import React, { useState } from 'react';
import { Box, Typography, IconButton, Tooltip } from '@mui/material';
import { Icons } from '@/components/icons';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import TipsAndUpdatesOutlinedIcon from '@mui/icons-material/TipsAndUpdates';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

export type ApproachType = 'sales' | 'income' | 'cost' | 'highest_best_use' | 'land_valuation' | 'market_analysis';

export interface GuidanceSection {
  title: string;
  content: string;
  type?: 'info' | 'tip' | 'uspap' | 'warning' | 'checklist';
}

export interface ApproachGuidance {
  title: string;
  description: string;
  sections: GuidanceSection[];
  uspapRequirements: string[];
  commonMistakes: string[];
  proTips: string[];
}

interface ApproachGuidancePanelProps {
  approachType: ApproachType;
  isVisible: boolean;
  mode: 'guidance' | 'values';
  onModeChange: (mode: 'guidance' | 'values') => void;
  onClose?: () => void;
  customGuidance?: ApproachGuidance;
  valueSummary?: {
    approachValue?: number | string;
    weightedValue?: number | string;
    weight?: number;
    perUnit?: number | string;
    unitType?: string;
  };
}

// Default guidance content for each approach
const defaultGuidanceContent: Record<ApproachType, ApproachGuidance> = {
  sales: {
    title: 'Sales Comparison Approach',
    description: 'Derive value by comparing the subject property to similar properties that have recently sold, with adjustments for differences.',
    sections: [
      {
        title: 'Key Principles',
        content: 'The Sales Comparison Approach is based on the principle of substitution: a buyer will pay no more for a property than the cost of acquiring an equally desirable substitute property. This approach is most reliable when there are sufficient comparable sales with minimal adjustments needed.',
        type: 'info',
      },
      {
        title: 'Selecting Comparables',
        content: 'Choose sales that are similar in location, physical characteristics, and time of sale. Ideal comparables are within the same market area, sold within the past 12 months, and require minimal adjustments.',
        type: 'tip',
      },
      {
        title: 'Adjustment Process',
        content: 'Always adjust FROM the comparable TO the subject. If the comparable is superior, make a negative adjustment. If the comparable is inferior, make a positive adjustment. Keep total net adjustments under 15% and gross adjustments under 25% when possible.',
        type: 'info',
      },
    ],
    uspapRequirements: [
      'Analyze all agreements of sale, options, and listings of the subject within 3 years (Standards Rule 1-5)',
      'Document comparable selection criteria and reasoning',
      'Explain and support all adjustments made',
      'Reconcile comparable indicators to arrive at a value conclusion',
      'Disclose any extraordinary assumptions or hypothetical conditions',
    ],
    commonMistakes: [
      'Using sales that are too dissimilar requiring excessive adjustments',
      'Not verifying sale conditions (arms-length transaction)',
      'Applying adjustments inconsistently across comparables',
      'Failing to consider time adjustments in changing markets',
      'Not supporting adjustment amounts with market data',
    ],
    proTips: [
      'Bracket the subject property with comparable sales (some superior, some inferior)',
      'Use paired sales analysis to extract adjustment rates when possible',
      'Weight more heavily those comparables requiring the least adjustment',
      'Consider both quantitative and qualitative adjustments',
      'Document your reasoning for comparable selection and rejection',
    ],
  },
  income: {
    title: 'Income Approach',
    description: 'Derive value based on the income-producing capability of the property, converting anticipated future benefits into present value.',
    sections: [
      {
        title: 'Key Principles',
        content: 'The Income Approach is based on the principle of anticipation: value is created by the expectation of future benefits. This approach is most reliable for income-producing properties where market participants make decisions based on income potential.',
        type: 'info',
      },
      {
        title: 'Income Analysis',
        content: 'Analyze potential gross income (PGI), vacancy and collection losses, effective gross income (EGI), operating expenses, and net operating income (NOI). Use market rents rather than contract rents unless analyzing an existing lease.',
        type: 'tip',
      },
      {
        title: 'Capitalization Methods',
        content: 'Direct capitalization divides NOI by an overall rate (Cap Rate). Yield capitalization (DCF) projects cash flows over a holding period and discounts them to present value. Choose the method most applicable to the property type and investor behavior.',
        type: 'info',
      },
    ],
    uspapRequirements: [
      'Analyze income and expense data for the subject and comparables',
      'Develop realistic income projections based on market evidence',
      'Support capitalization rates with market extraction or band of investment',
      'Explain the rationale for the capitalization method selected',
      'Consider lease terms and their impact on value when applicable',
    ],
    commonMistakes: [
      'Using contract rents when they differ significantly from market rents',
      'Not properly accounting for vacancy and collection losses',
      'Excluding necessary operating expenses or reserves',
      'Applying cap rates from dissimilar property types',
      'Failing to consider lease-up periods for new developments',
    ],
    proTips: [
      'Always verify income data with multiple sources when possible',
      'Use local expense ratios to check reasonableness of reported expenses',
      'Extract cap rates from recent sales of similar investment properties',
      'Consider both going-in and terminal cap rates in DCF analysis',
      'Account for capital reserves for replacement of short-lived items',
    ],
  },
  cost: {
    title: 'Cost Approach',
    description: 'Derive value by estimating the cost to construct a reproduction or replacement of the existing structure, minus depreciation, plus land value.',
    sections: [
      {
        title: 'Key Principles',
        content: 'The Cost Approach is based on the principle of substitution: a buyer will pay no more for a property than the cost to acquire a similar site and construct improvements of equal utility. This approach is most reliable for newer properties with minimal depreciation.',
        type: 'info',
      },
      {
        title: 'Cost Estimation Methods',
        content: 'Use comparative unit method (cost per SF), unit-in-place method (cost by component), or quantity survey method (detailed line-item costing). Comparative unit is most common; quantity survey is most accurate but time-consuming.',
        type: 'tip',
      },
      {
        title: 'Depreciation Analysis',
        content: 'Account for physical deterioration (curable and incurable), functional obsolescence (design flaws, outdated features), and external/economic obsolescence (market or location factors). Depreciation is always measured from reproduction/replacement cost new.',
        type: 'info',
      },
    ],
    uspapRequirements: [
      'Estimate land value separately using appropriate techniques',
      'Specify whether reproduction or replacement cost is used and why',
      'Identify and measure all forms of depreciation',
      'Support depreciation estimates with market evidence when possible',
      'Add entrepreneurial profit/incentive when appropriate',
    ],
    commonMistakes: [
      'Using outdated cost data without adjustments',
      'Not accounting for entrepreneurial profit/incentive',
      'Underestimating or overestimating depreciation',
      'Failing to consider functional obsolescence in older buildings',
      'Not adjusting for local cost factors (location modifiers)',
    ],
    proTips: [
      'Use current cost manuals and update with local multipliers',
      'Consider age-life method for physical depreciation as a starting point',
      'Extract depreciation rates from market sales when possible',
      'Include soft costs (fees, permits, financing) in cost estimate',
      'Compare final value to Sales Comparison as reasonableness check',
    ],
  },
  highest_best_use: {
    title: 'Highest & Best Use',
    description: 'Analyze the reasonably probable and legal use of the property that results in the highest value.',
    sections: [
      {
        title: 'Four Tests of Highest & Best Use',
        content: 'Every potential use must be: 1) Legally Permissible - allowed under zoning and regulations, 2) Physically Possible - feasible given site characteristics, 3) Financially Feasible - generates adequate return, 4) Maximally Productive - highest value among feasible alternatives.',
        type: 'info',
      },
      {
        title: 'As Vacant vs. As Improved',
        content: 'Analyze highest and best use as if vacant (what to build) and as improved (continue current use, modify, or demolish and redevelop). These analyses may yield different conclusions.',
        type: 'tip',
      },
    ],
    uspapRequirements: [
      'The appraiser must analyze the relevant legal, physical, and economic factors',
      'Highest and best use must be analyzed as vacant and as improved',
      'The conclusion must be consistent with market evidence',
      'All four tests must be applied sequentially',
    ],
    commonMistakes: [
      'Skipping the as-vacant analysis',
      'Not considering alternative uses',
      'Confusing highest and best use with most intensive use',
    ],
    proTips: [
      'Research recent zoning changes and proposed developments',
      'Consider special permits and variances that may expand possibilities',
      'Analyze what developers are actually building in the area',
    ],
  },
  land_valuation: {
    title: 'Land Valuation',
    description: 'Estimate the value of land as if vacant and available for development to its highest and best use.',
    sections: [
      {
        title: 'Methods of Land Valuation',
        content: 'Common methods include: Sales Comparison (most reliable when data exists), Allocation (ratio of land to total value), Extraction (sales price minus depreciated improvement cost), Land Residual (income approach), and Ground Rent Capitalization.',
        type: 'info',
      },
    ],
    uspapRequirements: [
      'Land must be valued separately when using the Cost Approach',
      'Selection of method must be appropriate for the property type',
      'Adjustments must be supported by market data',
    ],
    commonMistakes: [
      'Using land sales without proper verification',
      'Not adjusting for entitlements and approvals',
      'Ignoring impact of zoning on land value',
    ],
    proTips: [
      'Land with approvals is typically worth more than raw land',
      'Consider land residual when comparable sales are scarce',
      'Use allocation percentages from recent improved sales',
    ],
  },
  market_analysis: {
    title: 'Market Analysis',
    description: 'Analyze supply, demand, and market conditions to support valuation conclusions.',
    sections: [
      {
        title: 'Market Conditions',
        content: 'Evaluate current supply and demand balance, absorption rates, vacancy trends, rent trends, and price trends. Consider both the broader market and the specific submarket.',
        type: 'info',
      },
    ],
    uspapRequirements: [
      'Identify the relevant market area',
      'Analyze market conditions as of the effective date',
      'Consider the impact of market conditions on value conclusions',
    ],
    commonMistakes: [
      'Using stale market data',
      'Defining the market area too broadly or too narrowly',
      'Ignoring competing properties',
    ],
    proTips: [
      'Track multiple market indicators over time',
      'Interview local brokers and market participants',
      'Consider economic factors affecting the specific property type',
    ],
  },
};

export const ApproachGuidancePanel: React.FC<ApproachGuidancePanelProps> = ({
  approachType,
  isVisible,
  mode,
  onModeChange,
  onClose,
  customGuidance,
  valueSummary,
}) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    sections: true,
    uspap: false,
    mistakes: false,
    tips: false,
  });

  if (!isVisible) return null;

  const guidance = customGuidance || defaultGuidanceContent[approachType];

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const getSectionIcon = (type?: string) => {
    switch (type) {
      case 'tip':
        return <LightbulbOutlinedIcon className="text-amber-500" fontSize="small" />;
      case 'uspap':
        return <MenuBookOutlinedIcon className="text-blue-600" fontSize="small" />;
      case 'warning':
        return <WarningAmberIcon className="text-orange-500" fontSize="small" />;
      case 'checklist':
        return <CheckCircleOutlineIcon className="text-green-500" fontSize="small" />;
      default:
        return <InfoOutlinedIcon className="text-[#0DA1C7]" fontSize="small" />;
    }
  };

  const formatCurrency = (value: number | string | undefined) => {
    if (value === undefined) return '$0';
    const numValue = typeof value === 'string' ? parseFloat(value.replace(/[$,]/g, '')) : value;
    return `$${Math.round(numValue).toLocaleString('en-US')}`;
  };

  return (
    <Box
      className="bg-white border-l border-[#eee] border-solid overflow-y-auto shadow-lg"
      sx={{
        position: 'fixed',
        right: 0,
        top: '160px', // Account for main header (58px) + sub-header (~102px)
        bottom: 0,
        width: '280px',
        zIndex: 40,
        transition: 'transform 0.3s ease-in-out',
        transform: isVisible ? 'translateX(0)' : 'translateX(100%)',
      }}
    >
      {/* Header with Guidance/Values Toggle */}
      <Box className="sticky top-0 bg-white z-10 border-b border-[#eee] border-solid">
        <Box className="flex items-center justify-between p-3">
          <Box className="flex rounded-md overflow-hidden border border-[#ddd]">
            <button
              onClick={() => onModeChange('guidance')}
              className={`px-4 py-2 text-sm font-medium transition-colors cursor-pointer border-0 ${
                mode === 'guidance'
                  ? 'bg-[#0DA1C7] text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              Guidance
            </button>
            <button
              onClick={() => onModeChange('values')}
              className={`px-4 py-2 text-sm font-medium transition-colors cursor-pointer border-0 border-l border-[#ddd] ${
                mode === 'values'
                  ? 'bg-[#0DA1C7] text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              Values
            </button>
          </Box>
          {onClose && (
            <IconButton size="small" onClick={onClose}>
              <Icons.CloseIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
      </Box>

      {/* Content */}
      <Box className="p-4">
        {mode === 'guidance' ? (
          <>
            {/* Title and Description */}
            <Typography variant="h6" className="font-bold text-[#2e2e2e] mb-2">
              {guidance.title}
            </Typography>
            <Typography variant="body2" className="text-gray-600 mb-4">
              {guidance.description}
            </Typography>

            {/* Guidance Sections */}
            <Box className="mb-4">
              <button
                onClick={() => toggleSection('sections')}
                className="w-full flex items-center justify-between p-2 bg-gray-50 rounded cursor-pointer border-0 hover:bg-gray-100"
              >
                <span className="font-semibold text-sm text-[#2e2e2e]">Key Guidance</span>
                <Icons.ExpandMoreIcon
                  className={`transform transition-transform ${expandedSections.sections ? 'rotate-180' : ''}`}
                />
              </button>
              {expandedSections.sections && (
                <Box className="mt-2 space-y-3">
                  {guidance.sections.map((section, index) => (
                    <Box
                      key={index}
                      className="p-3 bg-gray-50 rounded-lg border-l-4"
                      sx={{
                        borderColor:
                          section.type === 'tip'
                            ? '#F59E0B'
                            : section.type === 'warning'
                              ? '#EF4444'
                              : '#0DA1C7',
                      }}
                    >
                      <Box className="flex items-center gap-2 mb-1">
                        {getSectionIcon(section.type)}
                        <Typography variant="subtitle2" className="font-semibold text-[#2e2e2e]">
                          {section.title}
                        </Typography>
                      </Box>
                      <Typography variant="body2" className="text-gray-600 text-sm leading-relaxed">
                        {section.content}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>

            {/* USPAP Requirements */}
            <Box className="mb-4">
              <button
                onClick={() => toggleSection('uspap')}
                className="w-full flex items-center justify-between p-2 bg-blue-50 rounded cursor-pointer border-0 hover:bg-blue-100"
              >
                <Box className="flex items-center gap-2">
                  <MenuBookOutlinedIcon className="text-blue-600" fontSize="small" />
                  <span className="font-semibold text-sm text-blue-800">USPAP Requirements</span>
                </Box>
                <Icons.ExpandMoreIcon
                  className={`text-blue-600 transform transition-transform ${expandedSections.uspap ? 'rotate-180' : ''}`}
                />
              </button>
              {expandedSections.uspap && (
                <Box className="mt-2 p-3 bg-blue-50 rounded-lg">
                  <ul className="m-0 pl-4 space-y-2">
                    {guidance.uspapRequirements.map((req, index) => (
                      <li key={index} className="text-sm text-blue-800">
                        {req}
                      </li>
                    ))}
                  </ul>
                </Box>
              )}
            </Box>

            {/* Common Mistakes */}
            <Box className="mb-4">
              <button
                onClick={() => toggleSection('mistakes')}
                className="w-full flex items-center justify-between p-2 bg-orange-50 rounded cursor-pointer border-0 hover:bg-orange-100"
              >
                <Box className="flex items-center gap-2">
                  <WarningAmberIcon className="text-orange-500" fontSize="small" />
                  <span className="font-semibold text-sm text-orange-800">Common Mistakes to Avoid</span>
                </Box>
                <Icons.ExpandMoreIcon
                  className={`text-orange-500 transform transition-transform ${expandedSections.mistakes ? 'rotate-180' : ''}`}
                />
              </button>
              {expandedSections.mistakes && (
                <Box className="mt-2 p-3 bg-orange-50 rounded-lg">
                  <ul className="m-0 pl-4 space-y-2">
                    {guidance.commonMistakes.map((mistake, index) => (
                      <li key={index} className="text-sm text-orange-800">
                        {mistake}
                      </li>
                    ))}
                  </ul>
                </Box>
              )}
            </Box>

            {/* Pro Tips */}
            <Box className="mb-4">
              <button
                onClick={() => toggleSection('tips')}
                className="w-full flex items-center justify-between p-2 bg-green-50 rounded cursor-pointer border-0 hover:bg-green-100"
              >
                <Box className="flex items-center gap-2">
                  <TipsAndUpdatesOutlinedIcon className="text-green-600" fontSize="small" />
                  <span className="font-semibold text-sm text-green-800">Pro Tips</span>
                </Box>
                <Icons.ExpandMoreIcon
                  className={`text-green-600 transform transition-transform ${expandedSections.tips ? 'rotate-180' : ''}`}
                />
              </button>
              {expandedSections.tips && (
                <Box className="mt-2 p-3 bg-green-50 rounded-lg">
                  <ul className="m-0 pl-4 space-y-2">
                    {guidance.proTips.map((tip, index) => (
                      <li key={index} className="text-sm text-green-800">
                        {tip}
                      </li>
                    ))}
                  </ul>
                </Box>
              )}
            </Box>
          </>
        ) : (
          /* Values Mode */
          <Box>
            <Typography variant="h6" className="font-bold text-[#2e2e2e] mb-4">
              Value Summary
            </Typography>
            
            {valueSummary ? (
              <Box className="space-y-4">
                {valueSummary.approachValue !== undefined && (
                  <Box className="p-4 bg-[#0DA1C7] bg-opacity-10 rounded-lg">
                    <Typography variant="body2" className="text-gray-600 mb-1">
                      Approach Value
                    </Typography>
                    <Typography variant="h5" className="font-bold text-[#0DA1C7]">
                      {formatCurrency(valueSummary.approachValue)}
                    </Typography>
                  </Box>
                )}

                {valueSummary.weight !== undefined && (
                  <Box className="p-4 bg-gray-50 rounded-lg">
                    <Typography variant="body2" className="text-gray-600 mb-1">
                      Applied Weight
                    </Typography>
                    <Typography variant="h6" className="font-semibold text-[#2e2e2e]">
                      {valueSummary.weight}%
                    </Typography>
                  </Box>
                )}

                {valueSummary.weightedValue !== undefined && (
                  <Box className="p-4 bg-gray-50 rounded-lg">
                    <Typography variant="body2" className="text-gray-600 mb-1">
                      Weighted Value
                    </Typography>
                    <Typography variant="h6" className="font-semibold text-[#2e2e2e]">
                      {formatCurrency(valueSummary.weightedValue)}
                    </Typography>
                  </Box>
                )}

                {valueSummary.perUnit !== undefined && (
                  <Box className="p-4 bg-gray-50 rounded-lg">
                    <Typography variant="body2" className="text-gray-600 mb-1">
                      Value per {valueSummary.unitType || 'SF'}
                    </Typography>
                    <Typography variant="h6" className="font-semibold text-[#2e2e2e]">
                      {formatCurrency(valueSummary.perUnit)}
                    </Typography>
                  </Box>
                )}
              </Box>
            ) : (
              <Box className="p-4 bg-gray-50 rounded-lg text-center">
                <Typography variant="body2" className="text-gray-500">
                  Complete the approach analysis to see value calculations
                </Typography>
              </Box>
            )}

            {/* Quick Reference */}
            <Box className="mt-6">
              <Typography variant="subtitle2" className="font-semibold text-[#2e2e2e] mb-2">
                Quick Reference
              </Typography>
              <Box className="p-3 bg-blue-50 rounded-lg">
                <Typography variant="body2" className="text-sm text-blue-800">
                  <strong>Tip:</strong> Switch to Guidance mode for USPAP requirements and best practices for this approach.
                </Typography>
              </Box>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ApproachGuidancePanel;

