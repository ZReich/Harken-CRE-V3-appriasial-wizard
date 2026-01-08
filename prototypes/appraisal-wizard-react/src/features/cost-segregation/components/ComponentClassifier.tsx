/**
 * ComponentClassifier Component
 * 
 * Grid view for reviewing and overriding component depreciation classifications.
 * Allows users to adjust auto-assigned IRS depreciation classes.
 */

import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter,
  Download,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  RotateCcw,
  Info,
} from 'lucide-react';
import { formatCostSegCurrency, formatCostSegPercent } from '../../../services/costSegregationService';
import { 
  DepreciationClass, 
  DEPRECIATION_CLASSES,
  getComponentClassification,
} from '../../../constants/costSegregation';
import type { CostSegComponent, CostSegAnalysis } from '../../../types';

interface ComponentClassifierProps {
  analysis: CostSegAnalysis;
  onOverride: (componentId: string, newClass: DepreciationClass, reason?: string) => void;
  onResetAll?: () => void;
  onExport?: () => void;
  className?: string;
}

type FilterCategory = 'all' | 'building-structure' | 'building-component' | 'site-improvement' | 'personal-property';

export const ComponentClassifier: React.FC<ComponentClassifierProps> = ({
  analysis,
  onOverride,
  onResetAll,
  onExport,
  className = '',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<FilterCategory>('all');
  const [expandedComponent, setExpandedComponent] = useState<string | null>(null);

  // Filter and search components
  const filteredComponents = useMemo(() => {
    return analysis.components.filter(c => {
      // Search filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        if (!c.label.toLowerCase().includes(search) && 
            !c.componentId.toLowerCase().includes(search)) {
          return false;
        }
      }
      // Category filter
      if (filterCategory !== 'all' && c.category !== filterCategory) {
        return false;
      }
      return true;
    });
  }, [analysis.components, searchTerm, filterCategory]);

  // Group by depreciation class
  const groupedByClass = useMemo(() => {
    const groups: Record<DepreciationClass, CostSegComponent[]> = {
      '5-year': [],
      '7-year': [],
      '15-year': [],
      '27.5-year': [],
      '39-year': [],
    };
    
    filteredComponents.forEach(c => {
      const effectiveClass = c.depreciationClassOverride || c.depreciationClass;
      groups[effectiveClass].push(c);
    });
    
    return groups;
  }, [filteredComponents]);

  const getClassColor = (depClass: DepreciationClass) => {
    switch (depClass) {
      case '5-year': return 'bg-accent-teal-mint-light text-accent-teal-mint border-accent-teal-mint-light';
      case '7-year': return 'bg-accent-teal-mint-light text-green-800 border-green-200';
      case '15-year': return 'bg-blue-100 text-blue-800 border-blue-200';
      case '27.5-year': return 'bg-purple-100 text-purple-800 border-purple-200';
      case '39-year': return 'bg-surface-3 dark:bg-elevation-subtle text-slate-700 border-light-border dark:border-dark-border';
      default: return 'bg-harken-gray-light text-harken-dark border-light-border';
    }
  };

  return (
    <div className={`bg-surface-1 rounded-xl border border-light-border dark:border-dark-border shadow-sm overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-light-border dark:border-dark-border bg-gradient-to-r from-slate-50 to-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-900 text-lg">Component Classification</h3>
          <div className="flex items-center gap-2">
            {onResetAll && analysis.hasManualOverrides && (
              <button
                onClick={onResetAll}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-surface-3 dark:hover:bg-elevation-subtle rounded-lg transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Reset Overrides
              </button>
            )}
            {onExport && (
              <button
                onClick={onExport}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-[#0da1c7] text-white rounded-lg hover:bg-[#0b8eb1] transition-colors"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            )}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search components..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-light-border dark:border-dark-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0da1c7]/20 focus:border-[#0da1c7]"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value as FilterCategory)}
              className="pl-9 pr-8 py-2 border border-light-border dark:border-dark-border rounded-lg text-sm bg-surface-1 focus:outline-none focus:ring-2 focus:ring-[#0da1c7]/20 focus:border-[#0da1c7] appearance-none cursor-pointer"
            >
              <option value="all">All Categories</option>
              <option value="building-structure">Building Structure</option>
              <option value="building-component">Building Component</option>
              <option value="site-improvement">Site Improvement</option>
              <option value="personal-property">Personal Property</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Component Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-surface-2 dark:bg-elevation-2 border-b border-light-border dark:border-dark-border">
              <th className="text-left px-4 py-3 font-semibold text-slate-700">Component</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-700">Category</th>
              <th className="text-right px-4 py-3 font-semibold text-slate-700">Cost</th>
              <th className="text-center px-4 py-3 font-semibold text-slate-700">Auto Class</th>
              <th className="text-center px-4 py-3 font-semibold text-slate-700">Override</th>
              <th className="text-center px-4 py-3 font-semibold text-slate-700 w-10">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredComponents.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                  No components match your search criteria.
                </td>
              </tr>
            ) : (
              filteredComponents.map((component) => {
                const isOverridden = !!component.depreciationClassOverride;
                const effectiveClass = component.depreciationClassOverride || component.depreciationClass;
                const classification = getComponentClassification(component.componentId);
                
                return (
                  <React.Fragment key={component.id}>
                    <tr 
                      className={`border-b border-light-border dark:border-dark-border hover:bg-surface-2 dark:bg-elevation-2/50 cursor-pointer ${
                        expandedComponent === component.id ? 'bg-surface-2 dark:bg-elevation-2' : ''
                      }`}
                      onClick={() => setExpandedComponent(
                        expandedComponent === component.id ? null : component.id
                      )}
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-900">{component.label}</div>
                        <div className="text-xs text-slate-500">{component.componentId}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-surface-3 dark:bg-elevation-subtle text-slate-600 text-xs rounded-full capitalize">
                          {component.category.replace(/-/g, ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-slate-900">
                        {formatCostSegCurrency(component.cost)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${getClassColor(component.depreciationClass)}`}>
                          {component.depreciationClass}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <select
                          value={effectiveClass}
                          onChange={(e) => {
                            e.stopPropagation();
                            const newClass = e.target.value as DepreciationClass;
                            if (newClass !== component.depreciationClass) {
                              onOverride(component.componentId, newClass);
                            }
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className={`px-2 py-1 text-xs font-medium rounded-lg border cursor-pointer ${
                            isOverridden 
                              ? 'bg-accent-amber-gold-light border-accent-amber-gold-light text-accent-amber-gold' 
                              : 'bg-surface-1 border-light-border dark:border-dark-border text-slate-700'
                          }`}
                        >
                          {DEPRECIATION_CLASSES.map(dc => (
                            <option key={dc.id} value={dc.id}>
                              {dc.id}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {isOverridden ? (
                          <div className="flex items-center justify-center">
                            <span title="Manually overridden"><AlertTriangle className="w-4 h-4 text-accent-amber-gold" /></span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center">
                            <span title="Auto-classified"><CheckCircle2 className="w-4 h-4 text-accent-teal-mint" /></span>
                          </div>
                        )}
                      </td>
                    </tr>
                    {/* Expanded Details */}
                    {expandedComponent === component.id && (
                      <tr className="bg-surface-2 dark:bg-elevation-2/80">
                        <td colSpan={6} className="px-4 py-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">IRS Reference</div>
                              <div className="text-slate-700">{classification?.irsReference || 'N/A'}</div>
                            </div>
                            <div>
                              <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Source</div>
                              <div className="text-slate-700 capitalize">{component.sourceType}</div>
                            </div>
                            <div>
                              <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">% of Total</div>
                              <div className="text-slate-700">{formatCostSegPercent(component.percentOfTotal)}</div>
                            </div>
                            {classification?.notes && (
                              <div className="md:col-span-3">
                                <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Notes</div>
                                <div className="text-slate-700">{classification.notes}</div>
                              </div>
                            )}
                            {component.overrideReason && (
                              <div className="md:col-span-3">
                                <div className="text-xs text-accent-amber-gold uppercase tracking-wide mb-1">Override Reason</div>
                                <div className="text-accent-amber-gold">{component.overrideReason}</div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Summary Footer */}
      <div className="px-6 py-4 bg-surface-2 dark:bg-elevation-2 border-t border-light-border dark:border-dark-border">
        <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
          <div className="flex items-center gap-4">
            <span className="text-slate-600">
              Showing <span className="font-medium text-slate-900">{filteredComponents.length}</span> of {analysis.components.length} components
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className={`px-2 py-1 rounded-full border ${getClassColor('5-year')}`}>
              5-yr: {groupedByClass['5-year'].length}
            </span>
            <span className={`px-2 py-1 rounded-full border ${getClassColor('15-year')}`}>
              15-yr: {groupedByClass['15-year'].length}
            </span>
            <span className={`px-2 py-1 rounded-full border ${getClassColor('39-year')}`}>
              39-yr: {groupedByClass['39-year'].length}
            </span>
          </div>
        </div>
      </div>

      {/* Info Footer */}
      <div className="px-6 py-3 bg-blue-50 border-t border-blue-100">
        <div className="flex items-start gap-2 text-xs text-blue-700">
          <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
          <p>
            Click on any component row to view details. Use the Override dropdown to change the depreciation 
            class assignment. Overrides are highlighted in amber and included in the analysis report.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ComponentClassifier;

