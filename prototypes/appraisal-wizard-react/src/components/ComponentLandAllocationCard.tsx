/**
 * ComponentLandAllocationCard.tsx
 * Card component to display and edit land allocation for a property component.
 * Appears in Site Details section of Subject Data page.
 */

import { useState, useCallback } from 'react';
import {
  MapPin,
  Building,
  Home,
  TreeDeciduous,
  Edit2,
  Check,
  X,
  AlertTriangle,
  Info,
} from 'lucide-react';
import type { PropertyComponent, LandAllocation } from '../types';
import { useWizard } from '../context/WizardContext';
import EnhancedTextArea from './EnhancedTextArea';

// Category icons matching Setup page
const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  commercial: Building,
  residential: Home,
  land: TreeDeciduous,
};

// Category color configurations
const CATEGORY_COLORS: Record<string, {
  bg: string;
  border: string;
  text: string;
  iconBg: string;
}> = {
  commercial: {
    bg: 'bg-harken-blue/5 dark:bg-cyan-500/10',
    border: 'border-harken-blue/20 dark:border-cyan-500/30',
    text: 'text-harken-blue dark:text-cyan-400',
    iconBg: 'bg-harken-blue/10 dark:bg-cyan-500/20',
  },
  residential: {
    bg: 'bg-accent-teal-mint/5 dark:bg-teal-500/10',
    border: 'border-accent-teal-mint/20 dark:border-teal-500/30',
    text: 'text-accent-teal-mint dark:text-teal-400',
    iconBg: 'bg-accent-teal-mint/10 dark:bg-teal-500/20',
  },
  land: {
    bg: 'bg-lime-50 dark:bg-lime-500/10',
    border: 'border-lime-200 dark:border-lime-500/30',
    text: 'text-lime-600 dark:text-lime-400',
    iconBg: 'bg-lime-100 dark:bg-lime-500/20',
  },
};

interface ComponentLandAllocationCardProps {
  component: PropertyComponent;
  onUpdate?: (updates: Partial<PropertyComponent>) => void;
  compact?: boolean;
}

// Allocation method options
const ALLOCATION_METHODS = [
  { id: 'measured', label: 'Measured' },
  { id: 'estimated', label: 'Estimated' },
  { id: 'county_records', label: 'County Records' },
] as const;

// Shape options - matching Site Size & Shape section
const SHAPE_OPTIONS = [
  { id: 'rectangular', label: 'Rectangular' },
  { id: 'approx_rectangular', label: 'Approx Rectangular' },
  { id: 'irregular', label: 'Irregular' },
  { id: 'triangular', label: 'Triangular' },
  { id: 'square', label: 'Square' },
] as const;

// Helper to get shape label from ID
const getShapeLabel = (shapeId: string | undefined): string => {
  if (!shapeId) return '';
  const shape = SHAPE_OPTIONS.find((s) => s.id === shapeId);
  return shape?.label || shapeId.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
};

// Access type options for excess/surplus land
const ACCESS_TYPES = [
  { id: 'separate', label: 'Separate' },
  { id: 'shared', label: 'Shared' },
  { id: 'easement', label: 'Easement' },
  { id: 'none', label: 'None' },
] as const;

export function ComponentLandAllocationCard({
  component,
  onUpdate,
  compact = false,
}: ComponentLandAllocationCardProps) {
  const { 
    updatePropertyComponent, 
    getPropertyComponents,
    state 
  } = useWizard();
  const [isEditing, setIsEditing] = useState(false);
  
  // Form state for all land allocation fields
  const [editAcres, setEditAcres] = useState<string>(
    component.landAllocation?.acres?.toString() || ''
  );
  const [editSf, setEditSf] = useState<string>(
    component.landAllocation?.squareFeet?.toString() || ''
  );
  const [editShape, setEditShape] = useState<string>(
    component.landAllocation?.shape || ''
  );
  
  // Bidirectional conversion handlers
  const handleAcresChange = (value: string) => {
    setEditAcres(value);
    if (value) {
      const acres = parseFloat(value);
      if (!isNaN(acres)) {
        setEditSf(Math.round(acres * 43560).toString());
      }
    } else {
      setEditSf('');
    }
  };
  
  const handleSfChange = (value: string) => {
    setEditSf(value);
    if (value) {
      const sf = parseFloat(value);
      if (!isNaN(sf)) {
        setEditAcres((sf / 43560).toFixed(3));
      }
    } else {
      setEditAcres('');
    }
  };
  const [editFrontage, setEditFrontage] = useState<string>(
    component.landAllocation?.frontage || ''
  );
  const [editNotes, setEditNotes] = useState<string>(
    component.landAllocation?.notes || ''
  );
  const [editMethod, setEditMethod] = useState<'measured' | 'estimated' | 'county_records'>(
    component.landAllocation?.allocationMethod || 'estimated'
  );
  // Excess land fields
  const [editAccessType, setEditAccessType] = useState<'separate' | 'shared' | 'easement' | 'none'>(
    component.landAllocation?.accessType || 'none'
  );
  const [editHasUtilities, setEditHasUtilities] = useState<boolean>(
    component.landAllocation?.hasUtilities || false
  );
  const [editHasLegalAccess, setEditHasLegalAccess] = useState<boolean>(
    component.landAllocation?.hasLegalAccess || false
  );

  const Icon = CATEGORY_ICONS[component.category] || Building;
  const colors = CATEGORY_COLORS[component.category] || CATEGORY_COLORS.commercial;
  
  // Get total site acres from wizard state
  const totalSiteAcres = parseFloat(state.subjectData?.siteArea || '0');
  const siteUnit = state.subjectData?.siteAreaUnit || 'acres';
  const totalSiteInAcres = siteUnit === 'sqft' ? totalSiteAcres / 43560 : totalSiteAcres;
  
  // Calculate primary component's allocation automatically
  // Primary = Total Site - Sum of all non-primary component allocations
  const allComponents = getPropertyComponents();
  const nonPrimaryAllocations = allComponents
    .filter(c => !c.isPrimary && c.landAllocation?.acres)
    .reduce((sum, c) => sum + (c.landAllocation?.acres || 0), 0);
  
  const isPrimaryComponent = component.isPrimary;
  
  // For primary: auto-calculate, for others: use stored value
  const calculatedPrimaryAcres = Math.max(0, totalSiteInAcres - nonPrimaryAllocations);
  const displayAcres = isPrimaryComponent 
    ? calculatedPrimaryAcres 
    : (component.landAllocation?.acres || 0);
  const displaySquareFeet = Math.round(displayAcres * 43560);
  
  // Create a "virtual" landAlloc for display purposes
  const landAlloc = isPrimaryComponent
    ? {
        acres: calculatedPrimaryAcres,
        squareFeet: displaySquareFeet,
        allocationMethod: 'estimated' as const,
      }
    : component.landAllocation;

  // Check if this is excess or surplus land
  const isExcessOrSurplus = component.landClassification === 'excess' || component.landClassification === 'surplus';

  const handleSave = useCallback(() => {
    const acres = editAcres ? parseFloat(editAcres) : null;
    const squareFeet = acres !== null ? Math.round(acres * 43560) : null;

    const updatedAllocation: LandAllocation = {
      acres,
      squareFeet,
      allocationMethod: editMethod,
      shape: editShape || undefined,
      frontage: editFrontage || undefined,
      notes: editNotes || undefined,
      // Only include excess land fields if applicable
      ...(isExcessOrSurplus && {
        accessType: editAccessType,
        hasUtilities: editHasUtilities,
        hasLegalAccess: editHasLegalAccess,
      }),
    };

    if (onUpdate) {
      onUpdate({ landAllocation: updatedAllocation });
    } else {
      updatePropertyComponent(component.id, { landAllocation: updatedAllocation });
    }

    setIsEditing(false);
  }, [editAcres, landAlloc, component.id, onUpdate, updatePropertyComponent]);

  const handleCancel = useCallback(() => {
    // Reset all form fields to component values
    setEditAcres(component.landAllocation?.acres?.toString() || '');
    setEditSf(component.landAllocation?.squareFeet?.toString() || '');
    setEditShape(component.landAllocation?.shape || '');
    setEditFrontage(component.landAllocation?.frontage || '');
    setEditNotes(component.landAllocation?.notes || '');
    setEditMethod(component.landAllocation?.allocationMethod || 'estimated');
    setEditAccessType(component.landAllocation?.accessType || 'none');
    setEditHasUtilities(component.landAllocation?.hasUtilities || false);
    setEditHasLegalAccess(component.landAllocation?.hasLegalAccess || false);
    setIsEditing(false);
  }, [component.landAllocation]);

  // Format numbers for display
  const formatNumber = (num: number | null | undefined) => {
    if (num === null || num === undefined) return '—';
    return num.toLocaleString('en-US', { maximumFractionDigits: 3 });
  };

  return (
    <div
      className={`rounded-xl border transition-all ${colors.bg} ${colors.border} ${
        compact ? 'p-3' : 'p-4'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colors.iconBg}`}>
            <Icon className={`w-4 h-4 ${colors.text}`} />
          </div>
          <div>
            <h4 className={`text-sm font-semibold ${colors.text}`}>
              {component.name}
            </h4>
            <p className="text-xs text-harken-gray-med dark:text-slate-400 capitalize">
              {component.propertyType.replace(/-/g, ' ')}
              {component.isPrimary && (
                <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded bg-harken-blue/10 text-harken-blue dark:bg-cyan-500/10 dark:text-cyan-400">
                  Primary
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Only show edit button for non-primary components */}
        {!isEditing && landAlloc && !isPrimaryComponent && (
          <button
            onClick={() => setIsEditing(true)}
            className="group p-1.5 rounded-lg hover:bg-harken-blue/10 dark:hover:bg-cyan-500/20 hover:ring-2 hover:ring-harken-blue/30 dark:hover:ring-cyan-500/30 transition-all"
            title="Edit land allocation"
          >
            <Edit2 className="w-4 h-4 text-harken-gray-med dark:text-slate-400 group-hover:text-harken-blue dark:group-hover:text-cyan-400 transition-colors" />
          </button>
        )}
      </div>

      {/* Primary Component: Always show auto-calculated allocation */}
      {isPrimaryComponent ? (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/50 dark:bg-slate-800/50 rounded-lg px-3 py-2">
              <span className="block text-[10px] uppercase tracking-wide text-harken-gray-med dark:text-slate-500 mb-0.5">
                Acres
              </span>
              <span className="text-sm font-semibold text-harken-dark dark:text-white">
                {formatNumber(calculatedPrimaryAcres)}
              </span>
            </div>
            <div className="bg-white/50 dark:bg-slate-800/50 rounded-lg px-3 py-2">
              <span className="block text-[10px] uppercase tracking-wide text-harken-gray-med dark:text-slate-500 mb-0.5">
                Square Feet
              </span>
              <span className="text-sm font-semibold text-harken-dark dark:text-white">
                {formatNumber(displaySquareFeet)}
              </span>
            </div>
          </div>
          
          {/* Auto-calculated indicator */}
          <div className="flex items-center gap-2 text-xs text-harken-gray-med dark:text-slate-400">
            <Info className="w-3 h-3 text-harken-blue dark:text-cyan-400" />
            <span>Auto-calculated (Total site minus other components)</span>
          </div>
        </div>
      ) : landAlloc ? (
        <div className="space-y-3">
          {isEditing ? (
            <div className="space-y-3">
              {/* Acres & SF Row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-wide text-harken-gray-med dark:text-slate-500 mb-1">
                    Acres *
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={editAcres}
                    onChange={(e) => handleAcresChange(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-light-border dark:border-harken-gray bg-white dark:bg-elevation-2 text-harken-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-harken-blue dark:focus:ring-cyan-500 focus:border-transparent"
                    placeholder="Enter acres"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wide text-harken-gray-med dark:text-slate-500 mb-1">
                    Square Feet <span className="normal-case font-normal">(or enter to calculate acres)</span>
                  </label>
                  <input
                    type="number"
                    step="1"
                    value={editSf}
                    onChange={(e) => handleSfChange(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-light-border dark:border-harken-gray bg-white dark:bg-elevation-2 text-harken-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-harken-blue dark:focus:ring-cyan-500 focus:border-transparent"
                    placeholder="Enter square feet"
                  />
                </div>
              </div>

              {/* Allocation Method */}
              <div>
                <label className="block text-[10px] uppercase tracking-wide text-harken-gray-med dark:text-slate-500 mb-1">
                  How was size determined?
                </label>
                <div className="flex gap-1">
                  {ALLOCATION_METHODS.map((method) => (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setEditMethod(method.id)}
                      className={`flex-1 px-2 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                        editMethod === method.id
                          ? 'bg-harken-blue text-white border-harken-blue dark:bg-cyan-500 dark:border-cyan-500'
                          : 'bg-white dark:bg-elevation-2 text-harken-gray-med dark:text-slate-400 border-light-border dark:border-harken-gray hover:border-harken-blue/50'
                      }`}
                    >
                      {method.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Shape */}
              <div>
                <label className="block text-[10px] uppercase tracking-wide text-harken-gray-med dark:text-slate-500 mb-1">
                  Shape
                </label>
                <div className="flex flex-wrap gap-1">
                  {SHAPE_OPTIONS.map((shape) => (
                    <button
                      key={shape.id}
                      type="button"
                      onClick={() => setEditShape(shape.id)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                        editShape === shape.id
                          ? 'bg-harken-blue text-white border-harken-blue dark:bg-cyan-500 dark:border-cyan-500'
                          : 'bg-white dark:bg-elevation-2 text-harken-gray-med dark:text-slate-400 border-light-border dark:border-harken-gray hover:border-harken-blue/50'
                      }`}
                    >
                      {shape.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Frontage */}
              <div>
                <label className="block text-[10px] uppercase tracking-wide text-harken-gray-med dark:text-slate-500 mb-1">
                  Frontage
                </label>
            <input
              type="text"
              value={editFrontage}
              onChange={(e) => setEditFrontage(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-light-border dark:border-harken-gray bg-white dark:bg-elevation-2 text-harken-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-harken-blue dark:focus:ring-cyan-500 focus:border-transparent"
              placeholder="e.g., 1000 feet across from the lake on the north side"
            />
              </div>

              {/* Excess Land Fields */}
              {isExcessOrSurplus && (
                <div className="pt-2 border-t border-light-border/50 dark:border-harken-gray/30 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      component.landClassification === 'excess' 
                        ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400'
                        : 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400'
                    }`}>
                      {component.landClassification === 'excess' ? 'Excess Land Details' : 'Surplus Land Details'}
                    </span>
                  </div>
                  
                  {/* Access Type */}
                  <div>
                    <label className="block text-[10px] uppercase tracking-wide text-harken-gray-med dark:text-slate-500 mb-1">
                      Access Type
                    </label>
                    <div className="flex gap-1">
                      {ACCESS_TYPES.map((access) => (
                        <button
                          key={access.id}
                          type="button"
                          onClick={() => setEditAccessType(access.id)}
                          className={`flex-1 px-2 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                            editAccessType === access.id
                              ? 'bg-harken-blue text-white border-harken-blue dark:bg-cyan-500 dark:border-cyan-500'
                              : 'bg-white dark:bg-elevation-2 text-harken-gray-med dark:text-slate-400 border-light-border dark:border-harken-gray hover:border-harken-blue/50'
                          }`}
                        >
                          {access.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Utilities & Legal Access Toggles */}
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editHasUtilities}
                        onChange={(e) => setEditHasUtilities(e.target.checked)}
                        className="w-4 h-4 rounded border-light-border dark:border-harken-gray text-harken-blue focus:ring-harken-blue/20"
                      />
                      <span className="text-xs text-harken-dark dark:text-white">Has Utilities</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editHasLegalAccess}
                        onChange={(e) => setEditHasLegalAccess(e.target.checked)}
                        className="w-4 h-4 rounded border-light-border dark:border-harken-gray text-harken-blue focus:ring-harken-blue/20"
                      />
                      <span className="text-xs text-harken-dark dark:text-white">Has Legal Access</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Note to Reader */}
              <EnhancedTextArea
                id={`land_allocation_notes_${component.id}`}
                label="Note to Reader"
                value={editNotes}
                onChange={setEditNotes}
                placeholder="Any special notes about site allocation, phasing, subdivision plans, or unique site attributes..."
                rows={3}
                sectionContext="land_allocation_notes"
                helperText="Include any caveats or special considerations about this component's land."
              />

              {/* Save/Cancel Buttons */}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 text-sm font-medium rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 text-sm font-medium rounded-lg bg-harken-blue dark:bg-cyan-500 text-white hover:bg-harken-blue/90 dark:hover:bg-cyan-600 transition-colors"
                >
                  Save Allocation
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Display Mode - Acres & SF */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/50 dark:bg-slate-800/50 rounded-lg px-3 py-2">
                  <span className="block text-[10px] uppercase tracking-wide text-harken-gray-med dark:text-slate-500 mb-0.5">
                    Acres
                  </span>
                  <span className="text-sm font-semibold text-harken-dark dark:text-white">
                    {formatNumber(landAlloc.acres)}
                  </span>
                </div>
                <div className="bg-white/50 dark:bg-slate-800/50 rounded-lg px-3 py-2">
                  <span className="block text-[10px] uppercase tracking-wide text-harken-gray-med dark:text-slate-500 mb-0.5">
                    Square Feet
                  </span>
                  <span className="text-sm font-semibold text-harken-dark dark:text-white">
                    {formatNumber(landAlloc.squareFeet)}
                  </span>
                </div>
              </div>

              {/* Allocation Method & Shape */}
              <div className="flex items-center gap-2 text-xs text-harken-gray-med dark:text-slate-400">
                <MapPin className="w-3 h-3" />
                <span className="capitalize">{landAlloc.allocationMethod?.replace(/_/g, ' ') || 'Estimated'}</span>
                {landAlloc.shape && (
                  <>
                    <span className="text-slate-300 dark:text-slate-600">•</span>
                    <span>{getShapeLabel(landAlloc.shape)}</span>
                  </>
                )}
                {landAlloc.frontage && (
                  <>
                    <span className="text-slate-300 dark:text-slate-600">•</span>
                    <span>{landAlloc.frontage}</span>
                  </>
                )}
              </div>

              {/* Notes (if present) */}
              {landAlloc.notes && (
                <div className="text-xs text-harken-gray dark:text-slate-300 leading-relaxed">
                  <div className="text-[10px] uppercase tracking-wide text-harken-gray-med dark:text-slate-500 mb-1">
                    Note to Reader
                  </div>
                  <div 
                    className="prose prose-sm dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: landAlloc.notes }}
                  />
                </div>
              )}

              {/* Excess Land Details */}
              {isExcessOrSurplus && landAlloc.accessType && (
                <div className="pt-2 border-t border-light-border/50 dark:border-harken-gray/30">
                  <div className="flex items-center gap-3 text-xs">
                    <span className={`px-2 py-0.5 rounded ${
                      component.landClassification === 'excess' 
                        ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400'
                        : 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400'
                    }`}>
                      {component.landClassification === 'excess' ? 'Excess Land' : 'Surplus Land'}
                    </span>
                    <span className="text-harken-gray-med dark:text-slate-400 capitalize">
                      {landAlloc.accessType} access
                    </span>
                    {landAlloc.hasUtilities && (
                      <span className="text-green-600 dark:text-green-400">✓ Utilities</span>
                    )}
                    {landAlloc.hasLegalAccess && (
                      <span className="text-green-600 dark:text-green-400">✓ Legal Access</span>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        // No land allocation yet - show Add button or editing mode
        isEditing ? (
          <div className="space-y-3">
            {/* Acres & SF Row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] uppercase tracking-wide text-harken-gray-med dark:text-slate-500 mb-1">
                  Acres *
                </label>
              <input
                type="number"
                step="0.001"
                value={editAcres}
                onChange={(e) => handleAcresChange(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-light-border dark:border-harken-gray bg-white dark:bg-elevation-2 text-harken-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-harken-blue dark:focus:ring-cyan-500 focus:border-transparent"
                placeholder="Enter acres"
                autoFocus
              />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-wide text-harken-gray-med dark:text-slate-500 mb-1">
                  Square Feet <span className="normal-case font-normal">(or enter to calculate acres)</span>
                </label>
              <input
                type="number"
                step="1"
                value={editSf}
                onChange={(e) => handleSfChange(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-light-border dark:border-harken-gray bg-white dark:bg-elevation-2 text-harken-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-harken-blue dark:focus:ring-cyan-500 focus:border-transparent"
                placeholder="Enter square feet"
              />
              </div>
            </div>

            {/* Allocation Method */}
            <div>
              <label className="block text-[10px] uppercase tracking-wide text-harken-gray-med dark:text-slate-500 mb-1">
                How was size determined?
              </label>
              <div className="flex gap-1">
                {ALLOCATION_METHODS.map((method) => (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setEditMethod(method.id)}
                    className={`flex-1 px-2 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                      editMethod === method.id
                        ? 'bg-harken-blue text-white border-harken-blue dark:bg-cyan-500 dark:border-cyan-500'
                        : 'bg-white dark:bg-elevation-2 text-harken-gray-med dark:text-slate-400 border-light-border dark:border-harken-gray hover:border-harken-blue/50'
                    }`}
                  >
                    {method.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Shape */}
            <div>
              <label className="block text-[10px] uppercase tracking-wide text-harken-gray-med dark:text-slate-500 mb-1">
                Shape
              </label>
              <div className="flex flex-wrap gap-1">
                {SHAPE_OPTIONS.map((shape) => (
                  <button
                    key={shape.id}
                    type="button"
                    onClick={() => setEditShape(shape.id)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                      editShape === shape.id
                        ? 'bg-harken-blue text-white border-harken-blue dark:bg-cyan-500 dark:border-cyan-500'
                        : 'bg-white dark:bg-elevation-2 text-harken-gray-med dark:text-slate-400 border-light-border dark:border-harken-gray hover:border-harken-blue/50'
                    }`}
                  >
                    {shape.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Frontage */}
            <div>
              <label className="block text-[10px] uppercase tracking-wide text-harken-gray-med dark:text-slate-500 mb-1">
                Frontage
              </label>
              <input
                type="text"
                value={editFrontage}
                onChange={(e) => setEditFrontage(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-light-border dark:border-harken-gray bg-white dark:bg-elevation-2 text-harken-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-harken-blue dark:focus:ring-cyan-500 focus:border-transparent"
                placeholder="e.g., 1000 feet across from the lake on the north side"
              />
            </div>

            {/* Excess Land Fields */}
            {isExcessOrSurplus && (
              <div className="pt-2 border-t border-light-border/50 dark:border-harken-gray/30 space-y-3">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-xs ${
                    component.landClassification === 'excess' 
                      ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400'
                      : 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400'
                  }`}>
                    {component.landClassification === 'excess' ? 'Excess Land Details' : 'Surplus Land Details'}
                  </span>
                </div>
                
                {/* Access Type */}
                <div>
                  <label className="block text-[10px] uppercase tracking-wide text-harken-gray-med dark:text-slate-500 mb-1">
                    Access Type
                  </label>
                  <div className="flex gap-1">
                    {ACCESS_TYPES.map((access) => (
                      <button
                        key={access.id}
                        type="button"
                        onClick={() => setEditAccessType(access.id)}
                        className={`flex-1 px-2 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                          editAccessType === access.id
                            ? 'bg-harken-blue text-white border-harken-blue dark:bg-cyan-500 dark:border-cyan-500'
                            : 'bg-white dark:bg-elevation-2 text-harken-gray-med dark:text-slate-400 border-light-border dark:border-harken-gray hover:border-harken-blue/50'
                        }`}
                      >
                        {access.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Utilities & Legal Access Toggles */}
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editHasUtilities}
                      onChange={(e) => setEditHasUtilities(e.target.checked)}
                      className="w-4 h-4 rounded border-light-border dark:border-harken-gray text-harken-blue focus:ring-harken-blue/20"
                    />
                    <span className="text-xs text-harken-dark dark:text-white">Has Utilities</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editHasLegalAccess}
                      onChange={(e) => setEditHasLegalAccess(e.target.checked)}
                      className="w-4 h-4 rounded border-light-border dark:border-harken-gray text-harken-blue focus:ring-harken-blue/20"
                    />
                    <span className="text-xs text-harken-dark dark:text-white">Has Legal Access</span>
                  </label>
                </div>
              </div>
            )}

            {/* Note to Reader */}
            <EnhancedTextArea
              id={`land_allocation_notes_new_${component.id}`}
              label="Note to Reader"
              value={editNotes}
              onChange={setEditNotes}
              placeholder="Any special notes about site allocation, phasing, subdivision plans, or unique site attributes..."
              rows={3}
              sectionContext="land_allocation_notes"
              helperText="Include any caveats or special considerations about this component's land."
            />

            {/* Save/Cancel Buttons */}
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-harken-blue dark:bg-cyan-500 text-white hover:bg-harken-blue/90 dark:hover:bg-cyan-600 transition-colors"
              >
                Save Allocation
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className={`w-full py-3 px-4 rounded-lg border-2 border-dashed text-sm font-medium transition-all flex items-center justify-center gap-2 
              ${colors.border} ${colors.text} hover:${colors.bg}
              ${component.category === 'commercial' 
                ? 'hover:border-harken-blue/50 hover:ring-2 hover:ring-harken-blue/20 dark:hover:border-cyan-500/50 dark:hover:ring-cyan-500/20' 
                : component.category === 'residential'
                ? 'hover:border-accent-teal-mint/50 hover:ring-2 hover:ring-accent-teal-mint/20 dark:hover:border-teal-500/50 dark:hover:ring-teal-500/20'
                : 'hover:border-lime-300 hover:ring-2 hover:ring-lime-200 dark:hover:border-lime-500/50 dark:hover:ring-lime-500/20'
              }
            `}
          >
            <MapPin className="w-4 h-4" />
            Add Land Allocation
          </button>
        )
      )}
    </div>
  );
}

/**
 * Summary card showing total site area and allocation breakdown
 */
interface LandAllocationSummaryProps {
  totalSiteAcres: number;
  siteUnit: 'acres' | 'sf';
}

export function LandAllocationSummary({ totalSiteAcres, siteUnit }: LandAllocationSummaryProps) {
  const { getPropertyComponents } = useWizard();
  const allComponents = getPropertyComponents();

  // Convert if site is in SF
  const displayTotal = siteUnit === 'sf' ? totalSiteAcres / 43560 : totalSiteAcres;
  
  // Calculate non-primary allocations
  const nonPrimaryComponents = allComponents.filter(c => !c.isPrimary);
  const nonPrimaryAllocations = nonPrimaryComponents
    .filter(c => c.landAllocation?.acres)
    .reduce((sum, c) => sum + (c.landAllocation?.acres || 0), 0);
  
  // Primary gets the remainder
  const primaryAllocation = Math.max(0, displayTotal - nonPrimaryAllocations);
  const totalAllocated = primaryAllocation + nonPrimaryAllocations;
  
  // Check if non-primary allocations exceed total
  const isOverAllocated = nonPrimaryAllocations > displayTotal;
  const percentAllocated = displayTotal > 0 ? (totalAllocated / displayTotal) * 100 : 0;
  
  // Components with manual allocations (non-primary that have allocations)
  const componentsWithManualAlloc = nonPrimaryComponents.filter(c => c.landAllocation?.acres);
  const hasPrimaryComponent = allComponents.some(c => c.isPrimary);

  return (
    <div className="p-4 rounded-xl border border-light-border dark:border-harken-gray/30 bg-white dark:bg-elevation-2">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-lime-100 dark:bg-lime-500/20 flex items-center justify-center">
          <MapPin className="w-4 h-4 text-lime-600 dark:text-lime-400" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-harken-dark dark:text-white">
            Land Allocation Summary
          </h4>
          <p className="text-xs text-harken-gray-med dark:text-slate-400">
            {hasPrimaryComponent 
              ? `Primary auto-calculates from ${nonPrimaryComponents.length} additional component${nonPrimaryComponents.length !== 1 ? 's' : ''}`
              : `${allComponents.length} component${allComponents.length !== 1 ? 's' : ''}`
            }
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-harken-gray-med dark:text-slate-400">
            {totalAllocated.toFixed(3)} of {displayTotal.toFixed(3)} acres allocated
          </span>
          <span className={isOverAllocated ? 'text-red-500' : 'text-lime-600 dark:text-lime-400'}>
            {percentAllocated.toFixed(1)}%
          </span>
        </div>
        <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              isOverAllocated ? 'bg-red-500' : 'bg-lime-500'
            }`}
            style={{ width: `${Math.min(percentAllocated, 100)}%` }}
          />
        </div>
      </div>

      {/* Status Display */}
      <div className={`flex items-center gap-2 text-sm font-medium ${
        isOverAllocated 
          ? 'text-red-600 dark:text-red-400'
          : 'text-harken-dark dark:text-white'
      }`}>
        {isOverAllocated ? (
          <>
            <AlertTriangle className="w-4 h-4" />
            <span>Components exceed total site by {(nonPrimaryAllocations - displayTotal).toFixed(3)} acres</span>
          </>
        ) : nonPrimaryComponents.length === 0 ? (
          <>
            <Check className="w-4 h-4 text-green-500" />
            <span>Primary component receives all {displayTotal.toFixed(3)} acres</span>
          </>
        ) : componentsWithManualAlloc.length === 0 ? (
          <>
            <Info className="w-4 h-4 text-harken-blue dark:text-cyan-400" />
            <span className="text-harken-gray-med dark:text-slate-400">
              Add acres to secondary components - primary will auto-adjust
            </span>
          </>
        ) : (
          <>
            <Check className="w-4 h-4 text-green-500" />
            <span>Primary receives remaining {primaryAllocation.toFixed(3)} acres</span>
          </>
        )}
      </div>
    </div>
  );
}
