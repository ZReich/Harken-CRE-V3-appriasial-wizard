/**
 * PhotoComponentSuggestions Component
 * 
 * Displays detected building components from photo AI analysis.
 * Allows users to accept/reject suggestions and add them to the improvements inventory.
 * 
 * Features:
 * - Shows detected components with confidence scores
 * - Grouped by category (roofing, walls, flooring, etc.)
 * - One-click "Add to Inventory" functionality
 * - Condition suggestions from AI
 */

import { useState, useMemo } from 'react';
import {
  Camera,
  Plus,
  CheckCircle2,
  X,
  AlertTriangle,
  Building2,
  Layers,
  Zap,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import type { DetectedBuildingComponent, ComponentDetectionCategory } from '../services/photoClassification';

// =================================================================
// TYPES
// =================================================================

interface PhotoComponentSuggestionsProps {
  /** Detected components from photo analysis */
  detectedComponents: DetectedBuildingComponent[];
  /** Photo filename for display */
  photoFilename?: string;
  /** Callback when user accepts a component suggestion */
  onAcceptComponent?: (component: DetectedBuildingComponent) => void;
  /** Callback when user rejects/dismisses a component */
  onRejectComponent?: (componentTypeId: string) => void;
  /** Already added component type IDs (to show as already added) */
  existingComponentTypeIds?: Set<string>;
  /** Compact mode for inline display */
  compact?: boolean;
}

// =================================================================
// CONSTANTS
// =================================================================

const CATEGORY_CONFIG: Record<ComponentDetectionCategory, {
  label: string;
  icon: typeof Building2;
  section: 'exterior' | 'mechanical' | 'interior' | 'costseg';
}> = {
  roofing: { label: 'Roofing', icon: Building2, section: 'exterior' },
  walls: { label: 'Walls', icon: Building2, section: 'exterior' },
  windows: { label: 'Windows', icon: Building2, section: 'exterior' },
  foundation: { label: 'Foundation', icon: Building2, section: 'exterior' },
  hvac: { label: 'HVAC', icon: Zap, section: 'mechanical' },
  electrical: { label: 'Electrical', icon: Zap, section: 'mechanical' },
  flooring: { label: 'Flooring', icon: Layers, section: 'interior' },
  ceilings: { label: 'Ceilings', icon: Layers, section: 'interior' },
  // Cost Segregation Categories
  'personal-property': { label: 'Personal Property', icon: Layers, section: 'costseg' },
  'land-improvements': { label: 'Land Improvements', icon: Building2, section: 'costseg' },
  'tenant-improvements': { label: 'Tenant Improvements', icon: Layers, section: 'costseg' },
  'electrical-refinement': { label: 'Electrical (Cost Seg)', icon: Zap, section: 'costseg' },
  'hvac-refinement': { label: 'HVAC (Cost Seg)', icon: Zap, section: 'costseg' },
  'plumbing-refinement': { label: 'Plumbing (Cost Seg)', icon: Zap, section: 'costseg' },
};

const CONDITION_COLORS: Record<string, string> = {
  excellent: 'bg-accent-teal-mint-light text-accent-teal-mint border-accent-teal-mint',
  good: 'bg-lime-100 text-lime-700 border-lime-300',
  average: 'bg-harken-gray-light text-harken-gray border-light-border',
  fair: 'bg-accent-amber-gold-light text-accent-amber-gold border-accent-amber-gold-light',
  poor: 'bg-accent-red-light text-harken-error border-harken-error/30',
};

// =================================================================
// HELPER COMPONENTS
// =================================================================

interface ComponentCardProps {
  component: DetectedBuildingComponent;
  isAdded: boolean;
  onAccept: () => void;
  onReject: () => void;
  compact?: boolean;
}

function ComponentCard({ component, isAdded, onAccept, onReject, compact }: ComponentCardProps) {
  const confidenceColor = component.confidence >= 80
    ? 'text-accent-teal-mint'
    : component.confidence >= 60
      ? 'text-accent-amber-gold'
      : 'text-harken-gray-med';

  return (
    <div className={`
      bg-surface-1 rounded-lg border transition-all
      ${isAdded
        ? 'border-accent-teal-mint bg-green-50'
        : 'border-light-border hover:border-[#0da1c7] hover:shadow-sm'}
      ${compact ? 'p-2' : 'p-3'}
    `}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`font-medium ${compact ? 'text-sm' : 'text-base'} text-harken-dark`}>
              {component.componentLabel}
            </span>
            {component.suggestedCondition && (
              <span className={`
                px-1.5 py-0.5 text-xs font-medium rounded border
                ${CONDITION_COLORS[component.suggestedCondition] || 'bg-harken-gray-light text-harken-gray'}
              `}>
                {component.suggestedCondition}
              </span>
            )}
          </div>

          {!compact && component.reasoning && (
            <p className="text-xs text-harken-gray-med mt-1 line-clamp-2">
              {component.reasoning}
            </p>
          )}

          <div className="flex items-center gap-2 mt-1">
            <span className={`text-xs font-medium ${confidenceColor}`}>
              {Math.round(component.confidence)}% confidence
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {isAdded ? (
            <span className="flex items-center gap-1 text-xs font-medium text-accent-teal-mint">
              <CheckCircle2 size={14} />
              Added
            </span>
          ) : (
            <>
              <button
                onClick={onAccept}
                className="p-1.5 rounded-lg bg-[#0da1c7] text-white hover:bg-[#0b8fb3] transition-colors"
                title="Add to inventory"
              >
                <Plus size={14} />
              </button>
              <button
                onClick={onReject}
                className="p-1.5 rounded-lg text-harken-gray-med hover:text-harken-error hover:bg-accent-red-light transition-colors"
                title="Dismiss suggestion"
              >
                <X size={14} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// =================================================================
// MAIN COMPONENT
// =================================================================

export default function PhotoComponentSuggestions({
  detectedComponents,
  photoFilename,
  onAcceptComponent,
  onRejectComponent,
  existingComponentTypeIds = new Set(),
  compact = false,
}: PhotoComponentSuggestionsProps) {
  const [dismissedComponents, setDismissedComponents] = useState<Set<string>>(new Set());
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['exterior', 'mechanical', 'interior']));

  // Filter out dismissed components
  const visibleComponents = useMemo(() => {
    return detectedComponents.filter(c => !dismissedComponents.has(c.componentTypeId));
  }, [detectedComponents, dismissedComponents]);

  // Group components by section (exterior, mechanical, interior)
  const groupedComponents = useMemo(() => {
    const groups: Record<'exterior' | 'mechanical' | 'interior' | 'costseg', DetectedBuildingComponent[]> = {
      exterior: [],
      mechanical: [],
      interior: [],
      costseg: [],
    };

    visibleComponents.forEach(component => {
      const config = CATEGORY_CONFIG[component.category];
      if (config) {
        groups[config.section].push(component);
      }
    });

    return groups;
  }, [visibleComponents]);

  // Handle accept
  const handleAccept = (component: DetectedBuildingComponent) => {
    onAcceptComponent?.(component);
  };

  // Handle reject
  const handleReject = (componentTypeId: string) => {
    setDismissedComponents(prev => new Set([...prev, componentTypeId]));
    onRejectComponent?.(componentTypeId);
  };

  // Toggle section expansion
  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  // If no components detected, show empty state
  if (visibleComponents.length === 0) {
    return null;
  }

  const renderSection = (
    sectionId: 'exterior' | 'mechanical' | 'interior',
    label: string,
    icon: React.ReactNode
  ) => {
    const components = groupedComponents[sectionId];
    if (components.length === 0) return null;

    const isExpanded = expandedSections.has(sectionId);

    return (
      <div key={sectionId} className="mb-3">
        <button
          onClick={() => toggleSection(sectionId)}
          className="flex items-center gap-2 w-full text-left mb-2"
        >
          {isExpanded ? <ChevronDown size={14} className="text-harken-gray-med" /> : <ChevronRight size={14} className="text-harken-gray-med" />}
          {icon}
          <span className="text-sm font-medium text-harken-gray dark:text-slate-200">{label}</span>
          <span className="text-xs text-harken-gray-med">({components.length})</span>
        </button>

        {isExpanded && (
          <div className="space-y-2 pl-5">
            {components.map(component => (
              <ComponentCard
                key={component.componentTypeId}
                component={component}
                isAdded={existingComponentTypeIds.has(component.componentTypeId)}
                onAccept={() => handleAccept(component)}
                onReject={() => handleReject(component.componentTypeId)}
                compact={compact}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`
      bg-cyan-50 dark:bg-elevation-1/50 border border-cyan-200 dark:border-cyan-900/30 rounded-xl overflow-hidden
      ${compact ? 'p-3' : 'p-4'}
    `}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center">
          <Camera className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
        </div>
        <div>
          <h4 className={`font-semibold text-cyan-900 dark:text-cyan-400 ${compact ? 'text-sm' : 'text-base'}`}>
            Detected Components
          </h4>
          {photoFilename && (
            <p className="text-xs text-cyan-700 dark:text-cyan-500/70">
              From: {photoFilename}
            </p>
          )}
        </div>
        <div className="ml-auto flex items-center gap-1 text-xs text-cyan-700 dark:text-cyan-500/70">
          <AlertTriangle size={12} />
          <span>Review & add to inventory</span>
        </div>
      </div>

      {/* Component Sections */}
      {renderSection('exterior', 'Exterior Features', <Building2 size={14} className="text-harken-gray-med dark:text-slate-400" />)}
      {renderSection('mechanical', 'Mechanical Systems', <Zap size={14} className="text-harken-gray-med dark:text-slate-400" />)}
      {renderSection('interior', 'Interior Finishes', <Layers size={14} className="text-harken-gray-med dark:text-slate-400" />)}

      {/* Summary Footer */}
      <div className="mt-3 pt-3 border-t border-cyan-200 dark:border-cyan-900/30 flex items-center justify-between">
        <span className="text-xs text-cyan-700 dark:text-cyan-500/70">
          {visibleComponents.length} component{visibleComponents.length !== 1 ? 's' : ''} detected
        </span>
        {visibleComponents.length > 0 && (
          <button
            onClick={() => visibleComponents.forEach(c => handleAccept(c))}
            className="text-xs font-medium text-cyan-700 dark:text-cyan-400 hover:text-cyan-900 dark:hover:text-cyan-300 flex items-center gap-1"
          >
            <Plus size={12} />
            Add All to Inventory
          </button>
        )}
      </div>
    </div>
  );
}

