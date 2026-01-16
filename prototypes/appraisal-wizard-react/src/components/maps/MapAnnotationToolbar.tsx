/**
 * MapAnnotationToolbar.tsx
 * Toolbar for map annotation tools.
 * Provides buttons for adding callouts, drawing boundaries, and managing annotations.
 * Uses Harken-blue (#0da1c7) color scheme.
 */

import React from 'react';
import {
  MousePointer2,
  MessageCircle,
  Minus,
  Pentagon,
  Trash2,
  Undo2,
} from 'lucide-react';
import type { AnnotationTool } from './useMapAnnotations';

interface MapAnnotationToolbarProps {
  activeTool: AnnotationTool;
  onToolChange: (tool: AnnotationTool) => void;
  onUndo?: () => void;
  onClear?: () => void;
  hasAnnotations?: boolean;
  canUndo?: boolean;
  compact?: boolean;
}

interface ToolButton {
  id: AnnotationTool;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const TOOLS: ToolButton[] = [
  {
    id: 'select',
    label: 'Select',
    icon: MousePointer2,
    description: 'Select and move annotations',
  },
  {
    id: 'callout',
    label: 'Callout',
    icon: MessageCircle,
    description: 'Add text callout with arrow',
  },
  {
    id: 'line',
    label: 'Line',
    icon: Minus,
    description: 'Draw lines on map',
  },
  {
    id: 'boundary',
    label: 'Boundary',
    icon: Pentagon,
    description: 'Draw area boundary',
  },
];

export function MapAnnotationToolbar({
  activeTool,
  onToolChange,
  onUndo,
  onClear,
  hasAnnotations = false,
  canUndo = false,
  compact = false,
}: MapAnnotationToolbarProps) {
  return (
    <div className={`flex items-center gap-1 p-1.5 rounded-xl bg-white/95 dark:bg-elevation-2/95 backdrop-blur-sm border border-light-border dark:border-harken-gray shadow-lg ${compact ? '' : 'px-2'}`}>
      {/* Drawing Tools */}
      <div className="flex items-center gap-0.5">
        {TOOLS.map((tool) => {
          const Icon = tool.icon;
          const isActive = activeTool === tool.id;
          
          return (
            <button
              key={tool.id}
              onClick={() => onToolChange(tool.id)}
              title={`${tool.label}: ${tool.description}`}
              className={`
                p-2 rounded-lg transition-all
                ${isActive
                  ? 'bg-harken-blue text-white shadow-md dark:bg-cyan-500'
                  : 'text-harken-gray-med dark:text-slate-400 hover:bg-harken-blue/10 hover:text-harken-blue dark:hover:bg-cyan-500/10 dark:hover:text-cyan-400'
                }
              `}
            >
              <Icon className="w-4 h-4" />
            </button>
          );
        })}
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-light-border dark:bg-harken-gray mx-1" />

      {/* Action Buttons */}
      <div className="flex items-center gap-0.5">
        {/* Undo */}
        <button
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo last action"
          className={`
            p-2 rounded-lg transition-all
            ${canUndo
              ? 'text-harken-gray-med dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-harken-dark dark:hover:text-white'
              : 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
            }
          `}
        >
          <Undo2 className="w-4 h-4" />
        </button>

        {/* Clear All */}
        <button
          onClick={onClear}
          disabled={!hasAnnotations}
          title="Clear all annotations"
          className={`
            p-2 rounded-lg transition-all
            ${hasAnnotations
              ? 'text-harken-gray-med dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400'
              : 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
            }
          `}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Tool label when not compact */}
      {!compact && activeTool && (
        <>
          <div className="w-px h-6 bg-light-border dark:bg-harken-gray mx-1" />
          <span className="text-xs font-medium text-harken-gray-med dark:text-slate-400 px-1">
            {TOOLS.find(t => t.id === activeTool)?.label || 'Select'}
          </span>
        </>
      )}
    </div>
  );
}

export default MapAnnotationToolbar;
