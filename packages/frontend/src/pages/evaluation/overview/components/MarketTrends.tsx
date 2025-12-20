import React from 'react';
import { Box, Typography, Tooltip } from '@mui/material';
import { ARROW_IMAGES, MARKET_TREND_LABELS } from '../constants/area-info.constants';

interface MarketTrendsProps {
  selectedImages: Record<string, string>;
  onArrowClick: (label: string, image: string, direction: string) => void;
}

const MarketTrends: React.FC<MarketTrendsProps> = ({ selectedImages, onArrowClick }) => {
  const renderTooltipContent = (label: string) => (
    <Box sx={{ display: 'flex', gap: 1 }}>
      {Object.entries(ARROW_IMAGES).map(([direction, icon], index) => (
        <Box
          key={index}
          sx={{
            width: 40,
            height: 40,
            backgroundColor: 'black',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
          onClick={() => onArrowClick(label, icon, direction)}
        >
          <img
            src={icon}
            alt={`Icon-${direction}`}
            style={{ width: 20, height: 20, filter: 'invert(1)' }}
          />
        </Box>
      ))}
    </Box>
  );

  return (
    <>
      <Typography
        variant="h4"
        component="h4"
        className="text-lg font-montserrat font-bold py-5"
        style={{ fontFamily: 'montserrat-normal' }}
      >
        MARKET TRENDS
      </Typography>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          flexDirection: 'row',
          justifyContent: 'space-between',
          p: 1,
          m: 1,
          gap: 5,
          borderRadius: 1,
        }}
      >
        {MARKET_TREND_LABELS.map((label, index) => (
          <Tooltip
            key={index}
            title={renderTooltipContent(label)}
            placement="bottom"
            arrow
            componentsProps={{
              tooltip: {
                sx: {
                  backgroundColor: 'transparent',
                  boxShadow: 'none',
                  padding: 0,
                  margin: 0,
                },
              },
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <img
                src={selectedImages[label]}
                alt={label}
                style={{ width: 60, height: 50 }}
              />
              {label}
            </Box>
          </Tooltip>
        ))}
      </Box>
    </>
  );
};

export default MarketTrends;