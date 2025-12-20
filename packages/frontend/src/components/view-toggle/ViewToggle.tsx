import React from 'react';
import { motion } from 'framer-motion';
import { ViewModule, TableChart, Map } from '@mui/icons-material';
import { colors, borderRadius, transitions } from '@/utils/design-tokens';

export type ViewMode = 'cards' | 'table' | 'map';

interface ViewToggleProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  compType?: string; // 'commercial', 'residential', 'land'
  availableViews?: ViewMode[]; // Optional: limit which views are available
  className?: string;
}

const ViewToggle: React.FC<ViewToggleProps> = ({
  currentView,
  onViewChange,
  compType = 'commercial',
  availableViews = ['cards', 'table', 'map'],
  className = '',
}) => {
  const views: Array<{ id: ViewMode; label: string; icon: React.ReactNode }> = [
    { id: 'cards', label: 'Cards', icon: <ViewModule fontSize="small" /> },
    { id: 'table', label: 'Table', icon: <TableChart fontSize="small" /> },
    { id: 'map', label: 'Map', icon: <Map fontSize="small" /> },
  ].filter((view) => availableViews.includes(view.id));

  const handleViewChange = (viewId: ViewMode) => {
    // Save preference to localStorage per comp type
    localStorage.setItem(`viewPreference_${compType}`, viewId);
    onViewChange(viewId);
  };

  return (
    <div
      className={`inline-flex bg-white rounded-lg p-1 shadow-sm border border-gray-200 ${className}`}
      style={{
        borderRadius: borderRadius.md,
      }}
    >
      {views.map((view) => (
        <button
          key={view.id}
          onClick={() => handleViewChange(view.id)}
          className="relative px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center gap-2"
          style={{
            color: currentView === view.id ? colors.primary : colors.textLight,
            borderRadius: borderRadius.sm,
            transition: `color ${transitions.normal}`,
          }}
          aria-label={`Switch to ${view.label} view`}
          aria-pressed={currentView === view.id}
        >
          {/* Active background indicator */}
          {currentView === view.id && (
            <motion.div
              layoutId="activeView"
              className="absolute inset-0 rounded-md"
              style={{
                backgroundColor: colors.primary,
                opacity: 0.1,
                borderRadius: borderRadius.sm,
              }}
              initial={false}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 30,
              }}
            />
          )}

          {/* Icon and label */}
          <span className="relative z-10 flex items-center gap-2">
            {view.icon}
            <span className="hidden sm:inline">{view.label}</span>
          </span>
        </button>
      ))}
    </div>
  );
};

export default ViewToggle;


















