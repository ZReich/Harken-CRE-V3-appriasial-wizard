import React, { useState, useEffect } from 'react';
import { Box, Typography, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { Icons } from '@/components/icons';
import { ApproachGuidancePanel, ApproachType } from './ApproachGuidancePanel';
import { ApproachGuidanceToggle } from './ApproachGuidanceToggle';

// Icons for each approach
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import LandscapeIcon from '@mui/icons-material/Landscape';
import BarChartIcon from '@mui/icons-material/BarChart';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import BuildIcon from '@mui/icons-material/Build';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

interface ApproachMenuItem {
  id: string;
  label: string;
  path: string;
  icon: React.ReactNode;
  approachType: ApproachType;
  enabled: boolean;
}

interface ValuationAnalysisLayoutProps {
  children: React.ReactNode;
  evaluationId: string;
  scenarioId?: string;
  approachesEnabled?: {
    highestBestUse?: boolean;
    landValuation?: boolean;
    marketAnalysis?: boolean;
    salesComparison?: boolean;
    incomeApproach?: boolean;
    costApproach?: boolean;
  };
  currentApproach?: ApproachType;
  valueSummary?: {
    approachValue?: number | string;
    weightedValue?: number | string;
    weight?: number;
    perUnit?: number | string;
    unitType?: string;
  };
  onSaveDraft?: () => void;
  onContinue?: () => void;
  onExit?: () => void;
  status?: 'In Progress' | 'Complete' | 'Not Started';
  phaseInfo?: string;
}

export const ValuationAnalysisLayout: React.FC<ValuationAnalysisLayoutProps> = ({
  children,
  evaluationId,
  scenarioId,
  approachesEnabled = {},
  currentApproach,
  valueSummary,
  onSaveDraft,
  onContinue,
  onExit,
  status = 'In Progress',
  phaseInfo = 'Phase 5 of 6 • Valuation Approaches',
}) => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id') || evaluationId;
  
  const [isGuidancePanelVisible, setIsGuidancePanelVisible] = useState(true);
  const [guidanceMode, setGuidanceMode] = useState<'guidance' | 'values'>('guidance');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLeftSidebarCollapsed, setIsLeftSidebarCollapsed] = useState(false);

  // Default all approaches to enabled if not specified
  const approaches: ApproachMenuItem[] = [
    {
      id: 'highest_best_use',
      label: 'Highest & Best Use',
      path: `/evaluation/highest-best-use?id=${id}${scenarioId ? `&scenarioId=${scenarioId}` : ''}`,
      icon: <TrendingUpIcon />,
      approachType: 'highest_best_use',
      enabled: approachesEnabled.highestBestUse !== false,
    },
    {
      id: 'land_valuation',
      label: 'Land Valuation',
      path: `/evaluation/land-valuation?id=${id}${scenarioId ? `&scenarioId=${scenarioId}` : ''}`,
      icon: <LandscapeIcon />,
      approachType: 'land_valuation',
      enabled: approachesEnabled.landValuation !== false,
    },
    {
      id: 'market_analysis',
      label: 'Market Analysis',
      path: `/evaluation/market-analysis?id=${id}${scenarioId ? `&scenarioId=${scenarioId}` : ''}`,
      icon: <BarChartIcon />,
      approachType: 'market_analysis',
      enabled: approachesEnabled.marketAnalysis !== false,
    },
    {
      id: 'sales',
      label: 'Sales Comparison',
      path: `/evaluation/sales-approach?id=${id}${scenarioId ? `&salesId=${scenarioId}` : ''}`,
      icon: <CompareArrowsIcon />,
      approachType: 'sales',
      enabled: approachesEnabled.salesComparison !== false,
    },
    {
      id: 'income',
      label: 'Income Approach',
      path: `/evaluation/income-approch?id=${id}${scenarioId ? `&IncomeId=${scenarioId}` : ''}`,
      icon: <AccountBalanceIcon />,
      approachType: 'income',
      enabled: approachesEnabled.incomeApproach !== false,
    },
    {
      id: 'cost',
      label: 'Cost Approach',
      path: `/evaluation/cost-approach?id=${id}${scenarioId ? `&costId=${scenarioId}` : ''}`,
      icon: <BuildIcon />,
      approachType: 'cost',
      enabled: approachesEnabled.costApproach !== false,
    },
  ];

  // Determine active approach from URL
  const getActiveApproach = (): ApproachType | null => {
    const path = location.pathname;
    if (path.includes('highest-best-use')) return 'highest_best_use';
    if (path.includes('land-valuation')) return 'land_valuation';
    if (path.includes('market-analysis')) return 'market_analysis';
    if (path.includes('sales-approach') || path.includes('sales-comps')) return 'sales';
    if (path.includes('income-approch') || path.includes('rent-roll') || path.includes('cap-approach')) return 'income';
    if (path.includes('cost-approach') || path.includes('cost-comps')) return 'cost';
    return currentApproach || null;
  };

  const activeApproach = getActiveApproach();

  // Get title for current approach
  const getApproachTitle = () => {
    const active = approaches.find(a => a.approachType === activeApproach);
    return active?.label || 'Valuation Analysis';
  };

  const handleModeChange = (mode: 'guidance' | 'values') => {
    setGuidanceMode(mode);
    if (!isGuidancePanelVisible) {
      setIsGuidancePanelVisible(true);
    }
  };

  return (
    <Box className="min-h-screen bg-gray-50">
      {/* Top Header Bar */}
      <Box className="sticky top-[58px] z-40 bg-white border-b border-[#eee] border-solid shadow-sm">
        <Box className="flex items-center justify-between px-4 py-3">
          {/* Left - Title and Status */}
          <Box className="flex items-center gap-4">
            <Typography variant="h5" className="font-bold text-[#2e2e2e]">
              Valuation Analysis
            </Typography>
            <Box
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                status === 'Complete'
                  ? 'bg-green-100 text-green-700'
                  : status === 'In Progress'
                    ? 'bg-[#0DA1C7] bg-opacity-20 text-[#0DA1C7]'
                    : 'bg-gray-100 text-gray-600'
              }`}
            >
              {status}
            </Box>
          </Box>

          {/* Center - Guidance/Values Toggle */}
          <ApproachGuidanceToggle
            mode={guidanceMode}
            onModeChange={handleModeChange}
            isVisible={isGuidancePanelVisible}
            onTogglePanel={() => setIsGuidancePanelVisible(!isGuidancePanelVisible)}
            showFullscreen={true}
            onFullscreen={() => {
              setIsFullscreen(!isFullscreen);
              if (!isFullscreen) {
                setIsGuidancePanelVisible(false);
                setIsLeftSidebarCollapsed(true);
              } else {
                setIsGuidancePanelVisible(true);
                setIsLeftSidebarCollapsed(false);
              }
            }}
          />

          {/* Right - Actions */}
          <Box className="flex items-center gap-2">
            {onExit && (
              <button
                onClick={onExit}
                className="px-3 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer flex items-center gap-1"
              >
                <CloseIcon fontSize="small" /> Exit
              </button>
            )}
            {onSaveDraft && (
              <button
                onClick={onSaveDraft}
                className="px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer flex items-center gap-1"
              >
                <SaveIcon fontSize="small" /> Save Draft
              </button>
            )}
            {onContinue && (
              <button
                onClick={onContinue}
                className="px-4 py-2 text-sm text-white bg-[#0DA1C7] border-0 rounded-md hover:bg-[#0b8fb1] cursor-pointer flex items-center gap-1"
              >
                Continue <ArrowForwardIcon fontSize="small" />
              </button>
            )}
          </Box>
        </Box>
        
        {/* Phase info */}
        <Box className="px-4 pb-2 text-xs text-gray-500">
          {phaseInfo}
        </Box>
      </Box>

      {/* Main Layout with Sidebars */}
      <Box className="flex">
        {/* Left Sidebar - Approach Navigation */}
        {!isLeftSidebarCollapsed && (
          <Box
            className="fixed left-0 top-[160px] bottom-0 bg-white border-r border-[#eee] border-solid overflow-y-auto z-30"
            sx={{ width: isFullscreen ? 0 : 240 }}
          >
            <Box className="p-4">
              <Typography variant="subtitle2" className="font-semibold text-[#2e2e2e] mb-1">
                Valuation Analysis
              </Typography>
              <Typography variant="caption" className="text-gray-500">
                {approaches.filter(a => a.enabled).length} Approaches Selected
              </Typography>
            </Box>

            <List className="pt-0">
              {approaches.filter(a => a.enabled).map((approach) => {
                const isActive = approach.approachType === activeApproach;
                return (
                  <ListItem
                    key={approach.id}
                    component={Link}
                    to={approach.path}
                    className={`py-3 px-4 transition-colors cursor-pointer no-underline ${
                      isActive
                        ? 'bg-[#0DA1C7] bg-opacity-10 border-l-4 border-[#0DA1C7] border-solid border-t-0 border-r-0 border-b-0'
                        : 'hover:bg-gray-50 border-l-4 border-transparent border-solid border-t-0 border-r-0 border-b-0'
                    }`}
                  >
                    <ListItemIcon
                      className={`min-w-[36px] ${isActive ? 'text-[#0DA1C7]' : 'text-gray-500'}`}
                    >
                      {approach.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={approach.label}
                      primaryTypographyProps={{
                        className: `text-sm font-medium ${isActive ? 'text-[#0DA1C7]' : 'text-gray-700'}`,
                      }}
                    />
                  </ListItem>
                );
              })}
            </List>

            {/* Collapse button */}
            <Box className="absolute bottom-4 left-0 right-0 flex justify-center">
              <button
                onClick={() => setIsLeftSidebarCollapsed(true)}
                className="p-2 text-gray-400 hover:text-gray-600 bg-white border border-gray-200 rounded-full cursor-pointer shadow-sm"
              >
                <Icons.ChevronLeftIcon fontSize="small" />
              </button>
            </Box>
          </Box>
        )}

        {/* Expand Left Sidebar Button (when collapsed) */}
        {isLeftSidebarCollapsed && !isFullscreen && (
          <button
            onClick={() => setIsLeftSidebarCollapsed(false)}
            className="fixed left-0 top-1/2 transform -translate-y-1/2 z-40 p-2 bg-[#0DA1C7] text-white border-0 rounded-r-lg cursor-pointer shadow-lg"
          >
            <Icons.ChevronRightIcon fontSize="small" />
          </button>
        )}

        {/* Main Content Area */}
        <Box
          className="flex-1 min-h-[calc(100vh-160px)] transition-all duration-300"
          sx={{
            marginLeft: isLeftSidebarCollapsed || isFullscreen ? 0 : '240px',
            marginRight: isGuidancePanelVisible && !isFullscreen ? '280px' : 0,
          }}
        >
          {children}
        </Box>

        {/* Right Guidance Panel */}
        {activeApproach && (
          <ApproachGuidancePanel
            approachType={activeApproach}
            isVisible={isGuidancePanelVisible && !isFullscreen}
            mode={guidanceMode}
            onModeChange={setGuidanceMode}
            onClose={() => setIsGuidancePanelVisible(false)}
            valueSummary={valueSummary}
          />
        )}
      </Box>
    </Box>
  );
};

export default ValuationAnalysisLayout;

