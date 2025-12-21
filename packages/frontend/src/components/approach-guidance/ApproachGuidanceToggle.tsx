import React from 'react';
import { Box, IconButton, Tooltip } from '@mui/material';
import FullscreenIcon from '@mui/icons-material/Fullscreen';

interface ApproachGuidanceToggleProps {
  mode: 'guidance' | 'values';
  onModeChange: (mode: 'guidance' | 'values') => void;
  isVisible: boolean;
  onTogglePanel?: () => void;
  showFullscreen?: boolean;
  onFullscreen?: () => void;
}

export const ApproachGuidanceToggle: React.FC<ApproachGuidanceToggleProps> = ({
  mode,
  onModeChange,
  isVisible,
  onTogglePanel,
  showFullscreen = true,
  onFullscreen,
}) => {
  return (
    <Box className="flex items-center gap-2">
      {/* Guidance/Values Toggle */}
      <Box className="flex rounded-md overflow-hidden border border-[#ddd] shadow-sm">
        <button
          onClick={() => {
            onModeChange('guidance');
            if (!isVisible && onTogglePanel) {
              onTogglePanel();
            }
          }}
          className={`px-4 py-2 text-sm font-medium transition-all duration-200 cursor-pointer border-0 ${
            mode === 'guidance' && isVisible
              ? 'bg-[#0DA1C7] text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          Guidance
        </button>
        <button
          onClick={() => {
            onModeChange('values');
            if (!isVisible && onTogglePanel) {
              onTogglePanel();
            }
          }}
          className={`px-4 py-2 text-sm font-medium transition-all duration-200 cursor-pointer border-0 border-l border-[#ddd] ${
            mode === 'values' && isVisible
              ? 'bg-[#0DA1C7] text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          Values
        </button>
      </Box>

      {/* Fullscreen Button */}
      {showFullscreen && onFullscreen && (
        <Tooltip title="Toggle Fullscreen">
          <IconButton
            onClick={onFullscreen}
            size="small"
            className="border border-[#ddd] rounded-md bg-white hover:bg-gray-50"
            sx={{ width: 36, height: 36 }}
          >
            <FullscreenIcon fontSize="small" className="text-gray-600" />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
};

export default ApproachGuidanceToggle;

