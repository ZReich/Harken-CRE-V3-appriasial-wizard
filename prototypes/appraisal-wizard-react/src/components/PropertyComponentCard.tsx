// src/components/PropertyComponentCard.tsx
// Displays a property component configuration card for the Setup page
// Part of the Mixed-Use Property Architecture

import { useState } from 'react';
import {
  Building,
  Home,
  TreeDeciduous,
  PenSquare,
  Trash2,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  RefreshCw,
} from 'lucide-react';
import type { PropertyComponent } from '../types';

interface PropertyComponentCardProps {
  component: PropertyComponent;
  onEdit: (component: PropertyComponent) => void;
  onRemove: (componentId: string) => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

// Category color configurations matching the wizard design system
const CATEGORY_STYLES: Record<PropertyComponent['category'], {
  bgClass: string;
  borderClass: string;
  badgeClass: string;
  textClass: string;
  iconClass: string;
}> = {
  commercial: {
    bgClass: 'bg-harken-blue/5 dark:bg-cyan-500/10',
    borderClass: 'border-l-harken-blue dark:border-l-cyan-400',
    badgeClass: 'bg-harken-blue text-white',
    textClass: 'text-harken-blue dark:text-cyan-400',
    iconClass: 'text-harken-blue dark:text-cyan-400',
  },
  residential: {
    bgClass: 'bg-accent-teal-mint/10 dark:bg-teal-500/10',
    borderClass: 'border-l-accent-teal-mint dark:border-l-teal-400',
    badgeClass: 'bg-accent-teal-mint text-white',
    textClass: 'text-accent-teal-mint dark:text-teal-400',
    iconClass: 'text-accent-teal-mint dark:text-teal-400',
  },
  land: {
    bgClass: 'bg-lime-50 dark:bg-lime-500/10',
    borderClass: 'border-l-lime-500 dark:border-l-lime-400',
    badgeClass: 'bg-lime-500 text-white',
    textClass: 'text-lime-600 dark:text-lime-400',
    iconClass: 'text-lime-600 dark:text-lime-400',
  },
};

const CATEGORY_ICONS: Record<PropertyComponent['category'], React.ComponentType<{ className?: string }>> = {
  commercial: Building,
  residential: Home,
  land: TreeDeciduous,
};

const CATEGORY_LABELS: Record<PropertyComponent['category'], string> = {
  commercial: 'Commercial',
  residential: 'Residential',
  land: 'Land',
};

const ANALYSIS_TYPE_LABELS: Record<string, string> = {
  full: 'Full Analysis',
  contributory: 'Contributory Value',
  combined: 'Combined',
};

const LAND_CLASSIFICATION_LABELS: Record<string, string> = {
  standard: 'Standard Component',
  excess: 'Excess Land',
  surplus: 'Surplus Land',
};

export function PropertyComponentCard({
  component,
  onEdit,
  onRemove,
  isExpanded = true,
  onToggleExpand,
}: PropertyComponentCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const styles = CATEGORY_STYLES[component.category];
  const CategoryIcon = CATEGORY_ICONS[component.category];
  
  // Format square footage or unit count display
  const getSizeDisplay = () => {
    if (component.unitCount && component.unitCount > 0) {
      // Multi-family with unit count
      const unitMixSummary = component.unitMix?.length
        ? component.unitMix.map(u => `${u.count}× ${u.unitType.toUpperCase()}`).join(', ')
        : `${component.unitCount} units`;
      
      if (component.squareFootage) {
        return `${unitMixSummary} | ${component.squareFootage.toLocaleString()} SF`;
      }
      return unitMixSummary;
    }
    
    if (component.squareFootage) {
      const sfLabel = component.sfSource === 'unknown' ? 'SF (estimated)' : 'SF';
      return `${component.squareFootage.toLocaleString()} ${sfLabel}`;
    }
    
    return 'Size not specified';
  };

  const handleDelete = () => {
    if (showDeleteConfirm) {
      onRemove(component.id);
      setShowDeleteConfirm(false);
    } else {
      setShowDeleteConfirm(true);
    }
  };

  return (
    <div
      className={`
        relative border-l-4 rounded-lg shadow-sm transition-all
        ${styles.borderClass} ${styles.bgClass}
        border border-light-border dark:border-harken-gray
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          {/* Primary Badge */}
          {component.isPrimary && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-bold uppercase tracking-wide bg-harken-blue text-white rounded-full">
              <CheckCircle className="w-3.5 h-3.5" />
              Primary
            </span>
          )}
          
          {/* Auto-synced indicator for primary components created from classification */}
          {component.isPrimary && component.id === 'primary' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium text-harken-gray-med dark:text-slate-400 bg-slate-100 dark:bg-slate-800/50 rounded">
              <RefreshCw className="w-3 h-3" />
              Synced from classification
            </span>
          )}
          
          {/* Category Badge */}
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded ${styles.badgeClass}`}>
            <CategoryIcon className="w-3.5 h-3.5" />
            {CATEGORY_LABELS[component.category]}
          </span>
          
          {/* Land Classification Badge (if applicable) */}
          {component.landClassification !== 'standard' && (
            <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
              {LAND_CLASSIFICATION_LABELS[component.landClassification]}
            </span>
          )}
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(component)}
            className="p-1.5 text-harken-gray-med hover:text-harken-blue dark:hover:text-cyan-400 rounded-lg hover:bg-white/50 dark:hover:bg-white/5 transition-colors"
            aria-label="Edit component"
          >
            <PenSquare className="w-4 h-4" />
          </button>
          
          {!component.isPrimary && (
            <button
              onClick={handleDelete}
              className={`p-1.5 rounded-lg transition-colors ${
                showDeleteConfirm
                  ? 'text-white bg-harken-error hover:bg-red-600'
                  : 'text-harken-gray-med hover:text-harken-error dark:hover:text-red-400 hover:bg-white/50 dark:hover:bg-white/5'
              }`}
              aria-label={showDeleteConfirm ? 'Confirm delete' : 'Delete component'}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          
          {onToggleExpand && (
            <button
              onClick={onToggleExpand}
              className="p-1.5 text-harken-gray-med hover:text-harken-gray dark:hover:text-slate-300 rounded-lg hover:bg-white/50 dark:hover:bg-white/5 transition-colors"
              aria-label={isExpanded ? 'Collapse' : 'Expand'}
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          )}
        </div>
      </div>
      
      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="px-4 pb-2">
          <div className="flex items-center justify-between p-2 bg-harken-error/10 rounded-lg text-sm">
            <span className="text-harken-error dark:text-red-400">
              Delete this component and all its data?
            </span>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="text-harken-gray-med hover:text-harken-gray text-xs underline"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      
      {/* Content */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-3">
          {/* Component Name & Type */}
          <div>
            <h4 className="text-base font-semibold text-harken-gray dark:text-slate-100">
              {component.name}
            </h4>
            <p className="text-sm text-harken-gray-med dark:text-slate-400">
              {component.propertyType}
              {component.msOccupancyCode && ` > ${component.msOccupancyCode}`}
            </p>
          </div>
          
          {/* Size Display */}
          <p className="text-sm text-harken-gray-med dark:text-slate-400">
            {getSizeDisplay()}
          </p>
          
          {/* Analysis Type */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-harken-gray-med dark:text-slate-400">Analysis:</span>
            <span className={`font-medium ${styles.textClass}`}>
              {ANALYSIS_TYPE_LABELS[component.analysisConfig.analysisType]}
            </span>
          </div>
          
          {/* Approach Toggles */}
          <div className="flex items-center gap-4 text-sm">
            <span className="text-harken-gray-med dark:text-slate-400">Approaches:</span>
            <div className="flex items-center gap-3">
              <ApproachIndicator
                label="Sales"
                enabled={component.analysisConfig.salesApproach}
                activeClass={styles.textClass}
              />
              <ApproachIndicator
                label="Income"
                enabled={component.analysisConfig.incomeApproach}
                activeClass={styles.textClass}
              />
              <ApproachIndicator
                label="Cost"
                enabled={component.analysisConfig.costApproach}
                activeClass={styles.textClass}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ApproachIndicator({
  label,
  enabled,
  activeClass,
}: {
  label: string;
  enabled: boolean;
  activeClass: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 ${
        enabled
          ? activeClass
          : 'text-harken-gray-light dark:text-slate-600 line-through'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${enabled ? 'bg-current' : 'bg-harken-gray-light dark:bg-slate-600'}`} />
      {label}
    </span>
  );
}

export default PropertyComponentCard;
