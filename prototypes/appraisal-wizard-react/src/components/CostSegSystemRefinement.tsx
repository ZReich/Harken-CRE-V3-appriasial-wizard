/**
 * CostSegSystemRefinement Component
 * 
 * Allows users to break down major building systems (electrical, HVAC, plumbing, etc.)
 * into specific depreciation classes with measurement support.
 * 
 * Features:
 * - Shows total system cost from appraisal
 * - Add refinement lines with inline calculator
 * - Track allocation progress
 * - Photo linking
 * - Validation (must equal total)
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
  Calculator,
  AlertCircle,
  CheckCircle2,
  Camera,
  Info,
} from 'lucide-react';
import type {
  CostSegSystemRefinement as SystemRefinement,
  CostSegRefinementLine,
  DepreciationClass,
} from '../types';

interface CostSegSystemRefinementProps {
  refinement: SystemRefinement;
  onUpdate: (updated: SystemRefinement) => void;
  onDelete?: () => void;
  availablePhotos?: { id: string; url: string; caption?: string }[];
  onLinkPhoto?: (refinementId: string, photoId: string) => void;
}

const SYSTEM_ICONS: Record<string, string> = {
  electrical: '⚡',
  plumbing: '💧',
  hvac: '❄️',
  'fire-protection': '🔥',
  elevators: '🛗',
  roofing: '🏠',
  structural: '🏗️',
};

const DEPRECIATION_CLASS_OPTIONS: { value: DepreciationClass; label: string; color: string }[] = [
  { value: '5-year', label: '5-Year (Personal Property)', color: 'emerald' },
  { value: '7-year', label: '7-Year (Equipment)', color: 'blue' },
  { value: '15-year', label: '15-Year (Land Improvement)', color: 'amber' },
  { value: '27.5-year', label: '27.5-Year (Residential)', color: 'violet' },
  { value: '39-year', label: '39-Year (Nonresidential)', color: 'slate' },
];

const ALLOCATION_METHODS = [
  { value: 'measured', label: 'Measured (LF/SF/EA)' },
  { value: 'percentage', label: 'Percentage' },
  { value: 'engineering-estimate', label: 'Engineering Estimate' },
] as const;

const MEASUREMENT_UNITS = [
  { value: 'LF', label: 'Linear Feet (LF)' },
  { value: 'SF', label: 'Square Feet (SF)' },
  { value: 'EA', label: 'Each (EA)' },
  { value: 'tons', label: 'Tons' },
  { value: 'BTU', label: 'BTU' },
  { value: 'amps', label: 'Amps' },
  { value: 'kW', label: 'Kilowatts (kW)' },
] as const;

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export const CostSegSystemRefinement: React.FC<CostSegSystemRefinementProps> = ({
  refinement,
  onUpdate,
  onDelete,
  availablePhotos = [],
  onLinkPhoto,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [editingLineId, setEditingLineId] = useState<string | null>(null);

  // Calculate allocation status
  const allocationStatus = useMemo(() => {
    const allocated = refinement.refinements.reduce((sum, line) => sum + line.amount, 0);
    const remaining = refinement.totalSystemCost - allocated;
    const percentAllocated = (allocated / refinement.totalSystemCost) * 100;
    
    return {
      allocated,
      remaining,
      percentAllocated,
      isOver: allocated > refinement.totalSystemCost,
      isComplete: Math.abs(allocated - refinement.totalSystemCost) < 1, // Allow for rounding
    };
  }, [refinement.refinements, refinement.totalSystemCost]);

  const handleAddRefinement = useCallback(() => {
    const newLine: CostSegRefinementLine = {
      id: `refinement-${Date.now()}`,
      description: '',
      depreciationClass: '39-year',
      amount: 0,
      allocationMethod: 'percentage',
    };
    
    onUpdate({
      ...refinement,
      refinements: [...refinement.refinements, newLine],
      totalAllocated: allocationStatus.allocated,
      isFullyAllocated: allocationStatus.isComplete,
    });
    
    setEditingLineId(newLine.id);
  }, [refinement, onUpdate, allocationStatus]);

  const handleUpdateLine = useCallback((lineId: string, updates: Partial<CostSegRefinementLine>) => {
    onUpdate({
      ...refinement,
      refinements: refinement.refinements.map(line =>
        line.id === lineId ? { ...line, ...updates } : line
      ),
      totalAllocated: allocationStatus.allocated,
      isFullyAllocated: allocationStatus.isComplete,
    });
  }, [refinement, onUpdate, allocationStatus]);

  const handleDeleteLine = useCallback((lineId: string) => {
    onUpdate({
      ...refinement,
      refinements: refinement.refinements.filter(line => line.id !== lineId),
      totalAllocated: allocationStatus.allocated,
      isFullyAllocated: allocationStatus.isComplete,
    });
  }, [refinement, onUpdate, allocationStatus]);

  const getDepreciationClassColor = (depClass: DepreciationClass) => {
    const option = DEPRECIATION_CLASS_OPTIONS.find(opt => opt.value === depClass);
    return option?.color || 'gray';
  };

  return (
    <div className="border border-light-border rounded-xl overflow-hidden bg-surface-1 shadow-sm">
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-white border-b border-light-border cursor-pointer hover:bg-slate-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3 flex-1">
          <span className="text-2xl">{SYSTEM_ICONS[refinement.systemType] || '🔧'}</span>
          <div>
            <h3 className="text-lg font-bold text-harken-dark dark:text-white">{refinement.systemLabel}</h3>
            <p className="text-sm text-harken-gray-med dark:text-slate-400">
              Total: {formatCurrency(refinement.totalSystemCost)} • {refinement.refinements.length} refinement{refinement.refinements.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Allocation Progress */}
          <div className="text-right mr-4">
            <div className="text-xs font-medium text-harken-gray dark:text-slate-400">Allocated</div>
            <div className={`text-sm font-bold ${allocationStatus.isComplete ? 'text-accent-teal-mint' : allocationStatus.isOver ? 'text-harken-error' : 'text-accent-amber-gold'}`}>
              {formatCurrency(allocationStatus.allocated)} ({allocationStatus.percentAllocated.toFixed(1)}%)
            </div>
          </div>
          
          {allocationStatus.isComplete ? (
            <CheckCircle2 className="w-5 h-5 text-accent-teal-mint" />
          ) : allocationStatus.isOver ? (
            <AlertCircle className="w-5 h-5 text-harken-error" />
          ) : (
            <AlertCircle className="w-5 h-5 text-accent-amber-gold" />
          )}
          
          {isExpanded ? (
            <ChevronDown className="w-5 h-5 text-harken-gray-med" />
          ) : (
            <ChevronRight className="w-5 h-5 text-harken-gray-med" />
          )}
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-harken-gray dark:text-slate-400">
              <span>Allocation Progress</span>
              <span>{formatCurrency(allocationStatus.remaining)} remaining</span>
            </div>
            <div className="h-2 bg-harken-gray-light rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  allocationStatus.isComplete
                    ? 'bg-accent-teal-mint'
                    : allocationStatus.isOver
                    ? 'bg-harken-error'
                    : 'bg-accent-amber-gold'
                }`}
                style={{ width: `${Math.min(allocationStatus.percentAllocated, 100)}%` }}
              />
            </div>
          </div>

          {/* Validation Message */}
          {!allocationStatus.isComplete && (
            <div className={`flex items-start gap-2 p-3 rounded-lg ${
              allocationStatus.isOver ? 'bg-accent-red-light border border-harken-error/30' : 'bg-accent-amber-gold-light border border-accent-amber-gold-light'
            }`}>
              <AlertCircle className={`w-4 h-4 mt-0.5 ${allocationStatus.isOver ? 'text-harken-error' : 'text-accent-amber-gold'}`} />
              <div className="text-sm">
                {allocationStatus.isOver ? (
                  <p className="text-harken-error font-medium">
                    Over-allocated by {formatCurrency(Math.abs(allocationStatus.remaining))}. Please reduce refinement amounts.
                  </p>
                ) : (
                  <p className="text-accent-amber-gold">
                    {formatCurrency(allocationStatus.remaining)} remaining to allocate. Total must equal system cost.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Refinement Lines */}
          <div className="space-y-2">
            {refinement.refinements.map((line, index) => (
              <RefinementLine
                key={line.id}
                line={line}
                index={index}
                isEditing={editingLineId === line.id}
                onEdit={() => setEditingLineId(line.id)}
                onSave={() => setEditingLineId(null)}
                onUpdate={(updates) => handleUpdateLine(line.id, updates)}
                onDelete={() => handleDeleteLine(line.id)}
                availablePhotos={availablePhotos}
                onLinkPhoto={onLinkPhoto}
              />
            ))}
          </div>

          {/* Add Refinement Button */}
          <button
            onClick={handleAddRefinement}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-accent-teal-mint hover:text-accent-teal-mint-hover bg-accent-teal-mint-light hover:bg-accent-teal-mint-light rounded-lg transition-colors w-full justify-center border-2 border-dashed border-accent-teal-mint-light hover:border-accent-teal-mint"
          >
            <Plus className="w-4 h-4" />
            Add Refinement
          </button>

          {/* Delete System Button */}
          {onDelete && (
            <button
              onClick={onDelete}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-harken-error hover:text-harken-error hover:bg-accent-red-light rounded-lg transition-colors w-full justify-center"
            >
              <Trash2 className="w-4 h-4" />
              Remove This System
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// Refinement Line Component
interface RefinementLineProps {
  line: CostSegRefinementLine;
  index: number;
  isEditing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onUpdate: (updates: Partial<CostSegRefinementLine>) => void;
  onDelete: () => void;
  availablePhotos: { id: string; url: string; caption?: string }[];
  onLinkPhoto?: (refinementId: string, photoId: string) => void;
}

const RefinementLine: React.FC<RefinementLineProps> = ({
  line,
  index,
  isEditing,
  onEdit,
  onSave,
  onUpdate,
  onDelete,
  availablePhotos,
  onLinkPhoto,
}) => {
  const [showPhotoSelector, setShowPhotoSelector] = useState(false);

  const depClassOption = DEPRECIATION_CLASS_OPTIONS.find(opt => opt.value === line.depreciationClass);

  if (!isEditing) {
    // Display mode
    return (
      <div
        onClick={onEdit}
        className="flex items-center gap-3 p-3 bg-harken-gray-light hover:bg-harken-gray-light rounded-lg cursor-pointer transition-colors border border-light-border"
      >
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-harken-dark dark:text-white">{line.description || 'Unnamed refinement'}</span>
            <span className={`px-2 py-0.5 text-xs font-medium rounded-full bg-${depClassOption?.color}-100 text-${depClassOption?.color}-700`}>
              {line.depreciationClass}
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-harken-gray dark:text-slate-400">
            <span className="font-semibold text-harken-dark dark:text-white">{formatCurrency(line.amount)}</span>
            <span>• {ALLOCATION_METHODS.find(m => m.value === line.allocationMethod)?.label}</span>
            {line.measurements && (
              <span>• {line.measurements.quantity} {line.measurements.unit}</span>
            )}
            {line.linkedPhotoIds && line.linkedPhotoIds.length > 0 && (
              <span className="flex items-center gap-1">
                <Camera className="w-3 h-3" />
                {line.linkedPhotoIds.length} photo{line.linkedPhotoIds.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-1.5 text-harken-gray-med hover:text-harken-error hover:bg-accent-red-light rounded transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // Edit mode
  return (
    <div className="p-4 bg-surface-1 border-2 border-accent-teal-mint-light rounded-lg space-y-3">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-semibold text-harken-gray">Refinement #{index + 1}</h4>
        <button
          onClick={onSave}
          className="px-3 py-1 text-xs font-medium text-accent-teal-mint bg-accent-teal-mint-light hover:bg-accent-teal-mint-light rounded transition-colors"
        >
          Done
        </button>
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-medium text-harken-gray mb-1">Description</label>
        <input
          type="text"
          value={line.description}
          onChange={(e) => onUpdate({ description: e.target.value })}
          placeholder="e.g., Dedicated Equipment Circuits"
          className="w-full px-3 py-2 border border-light-border rounded-lg text-sm focus:ring-2 focus:ring-accent-teal-mint focus:border-transparent"
        />
      </div>

      {/* Depreciation Class */}
      <div>
        <label className="block text-xs font-medium text-harken-gray mb-1">Depreciation Class</label>
        <select
          value={line.depreciationClass}
          onChange={(e) => onUpdate({ depreciationClass: e.target.value as DepreciationClass })}
          className="w-full px-3 py-2 border border-light-border rounded-lg text-sm focus:ring-2 focus:ring-accent-teal-mint focus:border-transparent"
        >
          {DEPRECIATION_CLASS_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Allocation Method */}
      <div>
        <label className="block text-xs font-medium text-harken-gray mb-1">Allocation Method</label>
        <select
          value={line.allocationMethod}
          onChange={(e) => onUpdate({ allocationMethod: e.target.value as CostSegRefinementLine['allocationMethod'] })}
          className="w-full px-3 py-2 border border-light-border rounded-lg text-sm focus:ring-2 focus:ring-accent-teal-mint focus:border-transparent"
        >
          {ALLOCATION_METHODS.map(method => (
            <option key={method.value} value={method.value}>{method.label}</option>
          ))}
        </select>
      </div>

      {/* Amount */}
      <div>
        <label className="block text-xs font-medium text-harken-gray mb-1">Amount</label>
        <input
          type="number"
          value={line.amount}
          onChange={(e) => onUpdate({ amount: parseFloat(e.target.value) || 0 })}
          placeholder="0"
          className="w-full px-3 py-2 border border-light-border rounded-lg text-sm focus:ring-2 focus:ring-accent-teal-mint focus:border-transparent"
        />
      </div>

      {/* Measurements (if method is 'measured') */}
      {line.allocationMethod === 'measured' && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
          <div className="flex items-center gap-2 text-xs font-medium text-blue-900 mb-2">
            <Calculator className="w-4 h-4" />
            Measurement Calculator
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs text-blue-700 mb-1">Quantity</label>
              <input
                type="number"
                value={line.measurements?.quantity || ''}
                onChange={(e) => onUpdate({
                  measurements: {
                    ...line.measurements,
                    quantity: parseFloat(e.target.value) || 0,
                    unit: line.measurements?.unit || 'LF',
                    notes: line.measurements?.notes || '',
                  }
                })}
                className="w-full px-2 py-1.5 border border-blue-300 rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-blue-700 mb-1">Unit</label>
              <select
                value={line.measurements?.unit || 'LF'}
                onChange={(e) => onUpdate({
                  measurements: {
                    ...line.measurements,
                    quantity: line.measurements?.quantity || 0,
                    unit: e.target.value as any,
                    notes: line.measurements?.notes || '',
                  }
                })}
                className="w-full px-2 py-1.5 border border-blue-300 rounded text-sm"
              >
                {MEASUREMENT_UNITS.map(unit => (
                  <option key={unit.value} value={unit.value}>{unit.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-blue-700 mb-1">$/Unit</label>
              <input
                type="number"
                value={line.measurements?.costPerUnit || ''}
                onChange={(e) => {
                  const costPerUnit = parseFloat(e.target.value) || 0;
                  const quantity = line.measurements?.quantity || 0;
                  onUpdate({
                    measurements: {
                      ...line.measurements,
                      quantity,
                      unit: line.measurements?.unit || 'LF',
                      costPerUnit,
                      notes: line.measurements?.notes || '',
                    },
                    amount: quantity * costPerUnit,
                  });
                }}
                className="w-full px-2 py-1.5 border border-blue-300 rounded text-sm"
              />
            </div>
          </div>
          {line.measurements?.quantity && line.measurements?.costPerUnit && (
            <div className="text-xs text-blue-800 font-medium pt-1">
              = {line.measurements.quantity} × ${line.measurements.costPerUnit} = {formatCurrency((line.measurements.quantity * line.measurements.costPerUnit))}
            </div>
          )}
        </div>
      )}

      {/* Notes */}
      <div>
        <label className="block text-xs font-medium text-harken-gray mb-1">Notes / Justification</label>
        <textarea
          value={line.notes || ''}
          onChange={(e) => onUpdate({ notes: e.target.value })}
          placeholder="Optional: Add notes or IRS justification..."
          rows={2}
          className="w-full px-3 py-2 border border-light-border rounded-lg text-sm focus:ring-2 focus:ring-accent-teal-mint focus:border-transparent resize-none"
        />
      </div>

      {/* Photo Linking */}
      <div>
        <button
          onClick={() => setShowPhotoSelector(!showPhotoSelector)}
          className="flex items-center gap-2 text-xs font-medium text-harken-gray dark:text-slate-400 hover:text-harken-dark dark:hover:text-white"
        >
          <Camera className="w-4 h-4" />
          Link Photos ({line.linkedPhotoIds?.length || 0})
        </button>
        {showPhotoSelector && availablePhotos.length > 0 && (
          <div className="mt-2 p-2 border border-light-border rounded-lg max-h-40 overflow-y-auto">
            <div className="grid grid-cols-4 gap-2">
              {availablePhotos.slice(0, 8).map(photo => (
                <button
                  key={photo.id}
                  onClick={() => {
                    const currentIds = line.linkedPhotoIds || [];
                    const isLinked = currentIds.includes(photo.id);
                    onUpdate({
                      linkedPhotoIds: isLinked
                        ? currentIds.filter(id => id !== photo.id)
                        : [...currentIds, photo.id]
                    });
                  }}
                  className={`relative aspect-square rounded overflow-hidden border-2 ${
                    line.linkedPhotoIds?.includes(photo.id)
                      ? 'border-accent-teal-mint'
                      : 'border-light-border hover:border-light-border'
                  }`}
                >
                  <img src={photo.url} alt={photo.caption || ''} className="w-full h-full object-cover" />
                  {line.linkedPhotoIds?.includes(photo.id) && (
                    <div className="absolute inset-0 bg-accent-teal-mint bg-opacity-20 flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CostSegSystemRefinement;
