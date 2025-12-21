import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { ApproachGuidancePanel, ApproachType, ApproachGuidance } from './ApproachGuidancePanel';
import { ApproachGuidanceToggle } from './ApproachGuidanceToggle';

interface ApproachGuidanceWrapperProps {
  children: React.ReactNode;
  approachType: ApproachType;
  title: string;
  subtitle?: string;
  valueSummary?: {
    approachValue?: number | string;
    weightedValue?: number | string;
    weight?: number;
    perUnit?: number | string;
    unitType?: string;
  };
  customGuidance?: ApproachGuidance;
  onExitClick?: () => void;
  onSaveDraft?: () => void;
  onContinue?: () => void;
  showActions?: boolean;
  status?: 'In Progress' | 'Complete' | 'Not Started';
}

export const ApproachGuidanceWrapper: React.FC<ApproachGuidanceWrapperProps> = ({
  children,
  approachType,
  title,
  subtitle,
  valueSummary,
  customGuidance,
  onExitClick,
  onSaveDraft,
  onContinue,
  showActions = true,
  status = 'In Progress',
}) => {
  const [isGuidancePanelVisible, setIsGuidancePanelVisible] = useState(true);
  const [guidanceMode, setGuidanceMode] = useState<'guidance' | 'values'>('guidance');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleModeChange = (mode: 'guidance' | 'values') => {
    setGuidanceMode(mode);
    if (!isGuidancePanelVisible) {
      setIsGuidancePanelVisible(true);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    if (!isFullscreen) {
      setIsGuidancePanelVisible(false);
    }
  };

  return (
    <Box className="relative min-h-screen">
      {/* Sub-header with title and toggle */}
      <Box className="sticky top-[58px] z-30 bg-white border-b border-[#eee] border-solid">
        <Box className="flex items-center justify-between px-6 py-3">
          {/* Left side - Title and status */}
          <Box className="flex items-center gap-3">
            <Typography variant="h5" className="font-bold text-[#2e2e2e]">
              {title}
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

          {/* Right side - Toggle and actions */}
          <Box className="flex items-center gap-4">
            <ApproachGuidanceToggle
              mode={guidanceMode}
              onModeChange={handleModeChange}
              isVisible={isGuidancePanelVisible}
              onTogglePanel={() => setIsGuidancePanelVisible(!isGuidancePanelVisible)}
              showFullscreen={true}
              onFullscreen={toggleFullscreen}
            />

            {showActions && (
              <Box className="flex items-center gap-2 ml-4 border-l border-[#eee] pl-4">
                {onExitClick && (
                  <button
                    onClick={onExitClick}
                    className="px-4 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50 cursor-pointer flex items-center gap-1"
                  >
                    ✕ Exit
                  </button>
                )}
                {onSaveDraft && (
                  <button
                    onClick={onSaveDraft}
                    className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 cursor-pointer flex items-center gap-1"
                  >
                    📄 Save Draft
                  </button>
                )}
                {onContinue && (
                  <button
                    onClick={onContinue}
                    className="px-4 py-2 text-sm text-white bg-[#0DA1C7] border-0 rounded hover:bg-[#0b8fb1] cursor-pointer flex items-center gap-1"
                  >
                    Continue →
                  </button>
                )}
              </Box>
            )}
          </Box>
        </Box>

        {subtitle && (
          <Box className="px-6 pb-2">
            <Typography variant="body2" className="text-gray-500">
              {subtitle}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Main content area */}
      <Box
        className={`transition-all duration-300 ${
          isGuidancePanelVisible && !isFullscreen ? 'pr-[280px]' : ''
        }`}
      >
        {children}
      </Box>

      {/* Guidance Panel */}
      <ApproachGuidancePanel
        approachType={approachType}
        isVisible={isGuidancePanelVisible && !isFullscreen}
        mode={guidanceMode}
        onModeChange={setGuidanceMode}
        onClose={() => setIsGuidancePanelVisible(false)}
        customGuidance={customGuidance}
        valueSummary={valueSummary}
      />
    </Box>
  );
};

export default ApproachGuidanceWrapper;

