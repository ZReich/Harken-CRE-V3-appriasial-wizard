/**
 * ComponentClassifier Component
 * 
 * Grid for reviewing and overriding component depreciation classifications.
 */

import React, { useState, useMemo } from 'react';
import { Search, Filter, Edit2, Check, X, AlertTriangle, Building, Trees } from 'lucide-react';
import type { CostSegComponent, DepreciationClass } from '../types';
import { DEPRECIATION_CLASSES } from '../constants';

interface ComponentClassifierProps {
  components: CostSegComponent[];
  onOverride: (componentId: string, newClass: DepreciationClass, justification?: string) => void;
}

// Color palette for depreciation classes
const CLASS_COLORS: Record<string, string> = {
  '5-year': 'bg-emerald-100 text-emerald-700 border-emerald-300',
  '7-year': 'bg-teal-100 text-teal-700 border-teal-300',
  '15-year': 'bg-amber-100 text-amber-700 border-amber-300',
  '27.5-year': 'bg-slate-100 text-slate-700 border-slate-300',
  '39-year': 'bg-slate-200 text-slate-700 border-slate-400',
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

interface EditingState {
  componentId: string;
  newClass: DepreciationClass;
  justification: string;
}

export function ComponentClassifier({ components, onOverride }: ComponentClassifierProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState<DepreciationClass | 'all'>('all');
  const [filterSource, setFilterSource] = useState<'all' | 'auto' | 'manual'>('all');
  const [editing, setEditing] = useState<EditingState | null>(null);
  
  // Filter and sort components
  const filteredComponents = useMemo(() => {
    return components.filter(comp => {
      // Search filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        if (!comp.label.toLowerCase().includes(search) &&
            !comp.description?.toLowerCase().includes(search) &&
            !comp.buildingName?.toLowerCase().includes(search)) {
          return false;
        }
      }
      
      // Class filter
      if (filterClass !== 'all') {
        const effectiveClass = comp.depreciationClassOverride || comp.depreciationClass;
        if (effectiveClass !== filterClass) return false;
      }
      
      // Source filter
      if (filterSource !== 'all') {
        if (comp.classificationSource !== filterSource) return false;
      }
      
      return true;
    }).sort((a, b) => {
      // Sort by building, then by class, then by label
      if (a.buildingName !== b.buildingName) {
        return (a.buildingName || '').localeCompare(b.buildingName || '');
      }
      
      const classOrder = ['5-year', '7-year', '15-year', '27.5-year', '39-year'];
      const aClass = a.depreciationClassOverride || a.depreciationClass;
      const bClass = b.depreciationClassOverride || b.depreciationClass;
      
      if (aClass !== bClass) {
        return classOrder.indexOf(aClass) - classOrder.indexOf(bClass);
      }
      
      return a.label.localeCompare(b.label);
    });
  }, [components, searchTerm, filterClass, filterSource]);
  
  // Count by class for quick stats
  const classStats = useMemo(() => {
    const stats: Record<string, number> = {};
    components.forEach(comp => {
      const cls = comp.depreciationClassOverride || comp.depreciationClass;
      stats[cls] = (stats[cls] || 0) + 1;
    });
    return stats;
  }, [components]);
  
  const handleStartEdit = (comp: CostSegComponent) => {
    setEditing({
      componentId: comp.id,
      newClass: comp.depreciationClassOverride || comp.depreciationClass,
      justification: comp.overrideJustification || '',
    });
  };
  
  const handleSaveEdit = () => {
    if (!editing) return;
    
    const comp = components.find(c => c.id === editing.componentId);
    if (!comp) return;
    
    const currentClass = comp.depreciationClassOverride || comp.depreciationClass;
    if (editing.newClass !== currentClass || editing.justification) {
      onOverride(editing.componentId, editing.newClass, editing.justification || undefined);
    }
    
    setEditing(null);
  };
  
  const handleCancelEdit = () => {
    setEditing(null);
  };

  return (
    <div className="space-y-4">
      {/* Header with Search and Filters */}
      <div className="flex items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search components..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent"
          />
        </div>
        
        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-400" />
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value as DepreciationClass | 'all')}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent"
            >
              <option value="all">All Classes</option>
              {DEPRECIATION_CLASSES.map(cls => (
                <option key={cls.id} value={cls.id}>
                  {cls.label} ({classStats[cls.id] || 0})
                </option>
              ))}
            </select>
          </div>
          
          <select
            value={filterSource}
            onChange={(e) => setFilterSource(e.target.value as 'all' | 'auto' | 'manual')}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent"
          >
            <option value="all">All Sources</option>
            <option value="auto">Auto-classified</option>
            <option value="manual">Manually Overridden</option>
          </select>
        </div>
      </div>
      
      {/* Component Count */}
      <div className="text-sm text-gray-500">
        Showing {filteredComponents.length} of {components.length} components
      </div>
      
      {/* Component Grid */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Component
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Source
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Category
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Classification
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Cost
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider w-24">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredComponents.map((comp) => {
              const effectiveClass = comp.depreciationClassOverride || comp.depreciationClass;
              const isEditing = editing?.componentId === comp.id;
              const hasOverride = !!comp.depreciationClassOverride;
              
              return (
                <tr 
                  key={comp.id} 
                  className={`hover:bg-gray-50 transition-colors ${hasOverride ? 'bg-amber-50/30' : ''}`}
                >
                  {/* Component Info */}
                  <td className="px-4 py-3">
                    <div className="flex items-start gap-3">
                      <div className={`p-1.5 rounded-lg ${comp.dataSource === 'site-improvements' ? 'bg-amber-100' : 'bg-blue-100'}`}>
                        {comp.dataSource === 'site-improvements' 
                          ? <Trees size={16} className="text-amber-600" />
                          : <Building size={16} className="text-blue-600" />
                        }
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{comp.label}</div>
                        {comp.buildingName && (
                          <div className="text-xs text-gray-500">{comp.buildingName}</div>
                        )}
                        {comp.description && (
                          <div className="text-xs text-gray-400 mt-0.5">{comp.description}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  
                  {/* Source */}
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                      comp.classificationSource === 'manual' 
                        ? 'bg-amber-100 text-amber-700' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {comp.classificationSource === 'manual' && <Edit2 size={10} />}
                      {comp.classificationSource === 'manual' ? 'Override' : 'Auto'}
                    </span>
                  </td>
                  
                  {/* Category */}
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {comp.category === 'personal-property' && 'Personal Property'}
                    {comp.category === 'land-improvement' && 'Land Improvement'}
                    {comp.category === 'real-property' && 'Real Property'}
                  </td>
                  
                  {/* Classification */}
                  <td className="px-4 py-3">
                    {isEditing ? (
                      <select
                        value={editing.newClass}
                        onChange={(e) => setEditing({
                          ...editing,
                          newClass: e.target.value as DepreciationClass
                        })}
                        className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent"
                        autoFocus
                      >
                        {DEPRECIATION_CLASSES.map(cls => (
                          <option key={cls.id} value={cls.id}>
                            {cls.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${CLASS_COLORS[effectiveClass]}`}>
                          {effectiveClass}
                        </span>
                        {hasOverride && (
                          <span className="text-xs text-amber-600 flex items-center gap-1">
                            <AlertTriangle size={12} />
                            Override
                          </span>
                        )}
                      </div>
                    )}
                    {isEditing && (
                      <input
                        type="text"
                        placeholder="Justification (optional)"
                        value={editing.justification}
                        onChange={(e) => setEditing({
                          ...editing,
                          justification: e.target.value
                        })}
                        className="mt-2 w-full px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent"
                      />
                    )}
                    {comp.overrideJustification && !isEditing && (
                      <div className="text-xs text-gray-400 mt-1 italic">
                        "{comp.overrideJustification}"
                      </div>
                    )}
                  </td>
                  
                  {/* Cost */}
                  <td className="px-4 py-3 text-right">
                    <div className="font-medium text-gray-900">
                      {formatCurrency(comp.cost)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {comp.percentOfTotal.toFixed(1)}%
                    </div>
                  </td>
                  
                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      {isEditing ? (
                        <>
                          <button
                            onClick={handleSaveEdit}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors"
                            title="Save"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Cancel"
                          >
                            <X size={16} />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleStartEdit(comp)}
                          className="p-1.5 text-gray-500 hover:text-[#0da1c7] hover:bg-[#0da1c7]/10 rounded-lg transition-colors"
                          title="Edit Classification"
                        >
                          <Edit2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        
        {filteredComponents.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No components match your filters
          </div>
        )}
      </div>
    </div>
  );
}

export default ComponentClassifier;

