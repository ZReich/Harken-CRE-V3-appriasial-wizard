// src/components/PropertyComponentPanel.tsx
// Slide-out panel for adding/editing property components
// Uses button-based selection matching the main Setup page style (no dropdowns or checkboxes)
// Enhanced with robust contextual guidance

import { useState, useEffect, useMemo } from 'react';
import {
  X,
  Building,
  Home,
  TreeDeciduous,
  Check,
  Lightbulb,
  AlertTriangle,
  Info,
  HelpCircle,
  Layers,
  PlusCircle,
  Merge,
} from 'lucide-react';
import type { PropertyComponent, MultiFamilyUnitMix, MultiFamilyCalculationMethod } from '../types';
import { PROPERTY_CATEGORIES, getPropertyTypesByCategory, type PropertyCategory } from '../constants/marshallSwift';
import {
  getContextualTips,
  getCategoryGuidance,
  getAnalysisTypeGuidance,
  getLandClassificationGuidance,
  CATEGORY_GUIDANCE,
} from '../constants/componentGuidance';
import { UnitMixGrid, DEFAULT_UNIT_MIX } from './UnitMixGrid';

// Multi-family property types that should show UnitMixGrid
const MULTIFAMILY_PROPERTY_TYPES = [
  'duplex-fourplex',
  'multifamily',
  'apartment-garden',
  'apartment-mid-rise',
  'apartment-high-rise',
  'hotel-motel',
  'senior-housing',
];

interface PropertyComponentPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (component: PropertyComponent) => void;
  editingComponent?: PropertyComponent | null;
  existingComponentCount: number;
}

// Category icons matching Setup page
const CATEGORY_ICONS: Record<PropertyCategory, React.ComponentType<{ className?: string }>> = {
  commercial: Building,
  residential: Home,
  land: TreeDeciduous,
};

// Category color configurations
const CATEGORY_BUTTON_STYLES: Record<PropertyCategory, {
  selected: string;
  unselected: string;
  icon: string;
  bgLight: string;
}> = {
  commercial: {
    selected: 'border-harken-blue bg-harken-blue/10 dark:bg-cyan-500/20',
    unselected: 'border-light-border dark:border-harken-gray hover:border-harken-blue/50',
    icon: 'text-harken-blue dark:text-cyan-400',
    bgLight: 'bg-harken-blue/5',
  },
  residential: {
    selected: 'border-accent-teal-mint bg-accent-teal-mint/10 dark:bg-teal-500/20',
    unselected: 'border-light-border dark:border-harken-gray hover:border-accent-teal-mint/50',
    icon: 'text-accent-teal-mint dark:text-teal-400',
    bgLight: 'bg-accent-teal-mint/5',
  },
  land: {
    selected: 'border-lime-500 bg-lime-50 dark:bg-lime-500/20',
    unselected: 'border-light-border dark:border-harken-gray hover:border-lime-500/50',
    icon: 'text-lime-600 dark:text-lime-400',
    bgLight: 'bg-lime-50',
  },
};

// Analysis type icons
const ANALYSIS_TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  full: Layers,
  contributory: PlusCircle,
  combined: Merge,
};

type AnalysisType = 'full' | 'contributory' | 'combined';
type LandClassification = 'standard' | 'excess' | 'surplus';

// Contextual Tip Component
function ContextualTip({ 
  message, 
  type 
}: { 
  message: string; 
  type: 'info' | 'warning' | 'success' 
}) {
  const styles = {
    info: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-200 dark:border-blue-800',
      icon: <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />,
      text: 'text-blue-800 dark:text-blue-200',
    },
    warning: {
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      border: 'border-amber-200 dark:border-amber-800',
      icon: <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />,
      text: 'text-amber-800 dark:text-amber-200',
    },
    success: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      border: 'border-green-200 dark:border-green-800',
      icon: <Check className="w-4 h-4 text-green-600 dark:text-green-400 shrink-0" />,
      text: 'text-green-800 dark:text-green-200',
    },
  };

  const style = styles[type];

  return (
    <div className={`flex items-start gap-2.5 p-3 rounded-lg border ${style.bg} ${style.border}`}>
      {style.icon}
      <p className={`text-xs leading-relaxed ${style.text}`}>{message}</p>
    </div>
  );
}

// Category Guidance Card
function CategoryGuidanceCard({ category }: { category: PropertyCategory }) {
  const guidance = getCategoryGuidance(category);
  const styles = CATEGORY_BUTTON_STYLES[category];
  
  if (!guidance) return null;

  return (
    <div className={`p-4 rounded-xl border border-light-border/50 dark:border-harken-gray/30 ${styles.bgLight} dark:bg-slate-800/30`}>
      <div className="flex items-start gap-3 mb-3">
        <div className={`p-2 rounded-lg ${styles.selected}`}>
          <Lightbulb className={`w-4 h-4 ${styles.icon}`} />
        </div>
        <div>
          <h4 className={`text-sm font-semibold ${styles.icon}`}>{guidance.label}</h4>
          <p className="text-xs text-harken-gray-med dark:text-slate-400 mt-0.5">
            {guidance.description}
          </p>
        </div>
      </div>
      
      {/* Recommended Approaches */}
      <div className="mt-3 pt-3 border-t border-light-border/50 dark:border-harken-gray/30">
        <p className="text-[10px] uppercase font-bold text-harken-gray-med dark:text-slate-500 tracking-wide mb-2">
          Recommended Approaches
        </p>
        <div className="flex flex-wrap gap-1.5">
          {guidance.approaches.recommended.map((approach) => (
            <span 
              key={approach}
              className={`px-2 py-0.5 text-xs font-medium rounded ${styles.selected} ${styles.icon}`}
            >
              {approach}
            </span>
          ))}
        </div>
        <p className="text-xs text-harken-gray-med dark:text-slate-400 mt-2 italic">
          {guidance.approaches.description}
        </p>
      </div>
    </div>
  );
}

export function PropertyComponentPanel({
  isOpen,
  onClose,
  onSave,
  editingComponent,
  existingComponentCount,
}: PropertyComponentPanelProps) {
  // Form state
  const [name, setName] = useState('');
  const [category, setCategory] = useState<PropertyCategory | null>(null);
  const [propertyType, setPropertyType] = useState<string | null>(null);
  const [landClassification, setLandClassification] = useState<LandClassification>('standard');
  const [analysisType, setAnalysisType] = useState<AnalysisType>('contributory');
  const [salesApproach, setSalesApproach] = useState(false);
  const [incomeApproach, setIncomeApproach] = useState(true);
  const [costApproach, setCostApproach] = useState(false);
  
  // Size allocation state
  const [squareFootage, setSquareFootage] = useState<number | null>(null);
  const [acreage, setAcreage] = useState<number | null>(null);
  const [sfSource, setSfSource] = useState<'measured' | 'estimated' | 'unknown'>('unknown');
  const [unitCount, setUnitCount] = useState<number | null>(null);
  
  // Multi-family Unit Mix state (for Income Approach)
  const [unitMix, setUnitMix] = useState<MultiFamilyUnitMix[]>(DEFAULT_UNIT_MIX);
  const [totalUnitCount, setTotalUnitCount] = useState(0);
  const [calculationMethod, setCalculationMethod] = useState<MultiFamilyCalculationMethod>('per_unit');
  const [perUnitSfUnknown, setPerUnitSfUnknown] = useState(false);
  const [totalBuildingSf, setTotalBuildingSf] = useState(0);
  
  // UI state
  const [showGuidance, setShowGuidance] = useState(true);
  
  // Check if current property type is multi-family (needs unit mix grid)
  const isMultiFamilyType = useMemo(() => {
    return propertyType ? MULTIFAMILY_PROPERTY_TYPES.includes(propertyType) : false;
  }, [propertyType]);
  
  // Constants for conversion
  const SF_PER_ACRE = 43560;
  
  // Sync Size Allocation SF → Total Building SF when "Per-unit SF unknown" is toggled ON
  // One-way sync: populate from Size Allocation, but don't loop back
  useEffect(() => {
    if (perUnitSfUnknown && isMultiFamilyType && incomeApproach) {
      // When toggling unknown ON, populate Total Building SF from Size Allocation if empty
      if (squareFootage && totalBuildingSf === 0) {
        setTotalBuildingSf(squareFootage);
      }
    }
    // Note: Only depend on perUnitSfUnknown toggle, not on the values themselves
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [perUnitSfUnknown, isMultiFamilyType, incomeApproach]);
  
  // Sync Unit Count (Size Allocation) → Total Units (Unit Configuration) - one-way only
  // When user enters Unit Count in Size Allocation, copy to Unit Configuration
  useEffect(() => {
    if (isMultiFamilyType && incomeApproach && unitCount && unitCount > 0) {
      // Only sync if Total Units is 0 (not yet set) or if Unit Count was just updated
      if (totalUnitCount === 0) {
        setTotalUnitCount(unitCount);
      }
    }
    // Note: Only trigger when unitCount changes, not totalUnitCount (prevents loop)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMultiFamilyType, incomeApproach, unitCount]);
  
  // Get contextual tips based on current selections
  const contextualTips = useMemo(() => {
    return getContextualTips({
      category,
      propertyType,
      landClassification,
      analysisType,
      salesApproach,
      incomeApproach,
      costApproach,
    });
  }, [category, propertyType, landClassification, analysisType, salesApproach, incomeApproach, costApproach]);

  // Get analysis type guidance
  const currentAnalysisGuidance = useMemo(() => {
    return getAnalysisTypeGuidance(analysisType);
  }, [analysisType]);

  // Get land classification guidance
  const currentLandGuidance = useMemo(() => {
    return getLandClassificationGuidance(landClassification);
  }, [landClassification]);
  
  // Handle SF change - auto-calculate acreage for land
  const handleSfChange = (value: number | null) => {
    setSquareFootage(value);
    if (category === 'land' && value !== null) {
      setAcreage(Math.round((value / SF_PER_ACRE) * 1000) / 1000); // 3 decimal places
    }
  };
  
  // Handle acreage change - auto-calculate SF for land
  const handleAcreageChange = (value: number | null) => {
    setAcreage(value);
    if (value !== null) {
      setSquareFootage(Math.round(value * SF_PER_ACRE));
    }
  };

  // Get available property types based on selected category
  const availablePropertyTypes = category ? getPropertyTypesByCategory(category) : [];

  // Reset form when panel opens/closes or editing component changes
  useEffect(() => {
    if (isOpen && editingComponent) {
      // Editing mode - populate form
      setName(editingComponent.name);
      setCategory(editingComponent.category);
      setPropertyType(editingComponent.propertyType);
      setLandClassification(editingComponent.landClassification);
      setAnalysisType(editingComponent.analysisConfig.analysisType);
      setSalesApproach(editingComponent.analysisConfig.salesApproach);
      setIncomeApproach(editingComponent.analysisConfig.incomeApproach);
      setCostApproach(editingComponent.analysisConfig.costApproach);
      // Size allocation
      setSquareFootage(editingComponent.squareFootage);
      setSfSource(editingComponent.sfSource || 'unknown');
      setUnitCount(editingComponent.unitCount ?? null);
      // Unit mix data (for multi-family)
      setUnitMix(editingComponent.unitMix || DEFAULT_UNIT_MIX);
      setTotalUnitCount(editingComponent.unitCount || 0);
      setCalculationMethod('per_unit'); // Default - could be stored on component
      setPerUnitSfUnknown(editingComponent.perUnitSfUnknown || false);
      setTotalBuildingSf(editingComponent.totalBuildingSf || 0);
      // Calculate acreage from SF if land
      if (editingComponent.category === 'land' && editingComponent.squareFootage) {
        setAcreage(Math.round((editingComponent.squareFootage / SF_PER_ACRE) * 1000) / 1000);
      } else {
        setAcreage(null);
      }
    } else if (isOpen) {
      // New component - reset form
      setName('');
      setCategory(null);
      setPropertyType(null);
      setLandClassification('standard');
      setAnalysisType('contributory');
      setSalesApproach(false);
      setIncomeApproach(true);
      setCostApproach(false);
      // Size allocation reset
      setSquareFootage(null);
      setAcreage(null);
      setSfSource('unknown');
      setUnitCount(null);
      // Unit mix reset
      setUnitMix(DEFAULT_UNIT_MIX);
      setTotalUnitCount(0);
      setCalculationMethod('per_unit');
      setPerUnitSfUnknown(false);
      setTotalBuildingSf(0);
    }
  }, [isOpen, editingComponent]);

  // Reset property type when category changes
  useEffect(() => {
    if (!editingComponent) {
      setPropertyType(null);
    }
  }, [category, editingComponent]);

  // Auto-adjust approach recommendations when category changes
  useEffect(() => {
    if (editingComponent) return; // Don't auto-change in edit mode
    
    if (category === 'commercial') {
      setIncomeApproach(true);
      setSalesApproach(true);
      setCostApproach(false);
    } else if (category === 'residential') {
      setIncomeApproach(true);
      setSalesApproach(true);
      setCostApproach(false);
    } else if (category === 'land') {
      setSalesApproach(true);
      setIncomeApproach(false);
      setCostApproach(false);
      setLandClassification('excess'); // Land components default to excess
    }
  }, [category, editingComponent]);

  const handleSave = () => {
    if (!category || !propertyType || !name.trim()) return;

    // Determine if we should include unit mix (multi-family with income approach)
    const shouldIncludeUnitMix = isMultiFamilyType && incomeApproach;
    
    // Calculate effective unit count from unit mix if applicable
    const effectiveUnitCount = shouldIncludeUnitMix 
      ? unitMix.reduce((acc, u) => acc + u.count, 0)
      : (category === 'residential' ? (unitCount ?? undefined) : undefined);
    
    // Calculate total SF from unit mix if applicable
    const effectiveSf = shouldIncludeUnitMix && !perUnitSfUnknown
      ? unitMix.reduce((acc, u) => acc + (u.count * (u.avgSF || 0)), 0)
      : (shouldIncludeUnitMix && perUnitSfUnknown ? totalBuildingSf : squareFootage);

    const component: PropertyComponent = {
      id: editingComponent?.id || `comp_${Date.now()}`,
      name: name.trim(),
      category,
      propertyType,
      msOccupancyCode: null, // Could be enhanced with M&S code selection
      squareFootage: effectiveSf,
      sfSource: shouldIncludeUnitMix && perUnitSfUnknown ? 'unknown' : sfSource,
      unitCount: effectiveUnitCount,
      unitMix: shouldIncludeUnitMix ? unitMix : undefined,
      perUnitSfUnknown: shouldIncludeUnitMix ? perUnitSfUnknown : undefined,
      totalBuildingSf: shouldIncludeUnitMix && perUnitSfUnknown ? totalBuildingSf : undefined,
      landClassification,
      isPrimary: editingComponent?.isPrimary || existingComponentCount === 0,
      sortOrder: editingComponent?.sortOrder || existingComponentCount,
      analysisConfig: {
        salesApproach,
        incomeApproach,
        costApproach,
        analysisType,
      },
    };

    onSave(component);
    onClose();
  };

  const isValid = category && propertyType && name.trim().length > 0;
  const hasWarnings = contextualTips.some(t => t.type === 'warning');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full max-w-xl bg-white dark:bg-elevation-1 shadow-2xl animate-slide-in-right flex flex-col">
        {/* Accent bar - fixed position on left edge */}
        <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-gradient-to-b from-harken-blue via-accent-teal-mint to-lime-500 z-20" />
        
        {/* Header - sticky */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 ml-1.5 bg-white dark:bg-elevation-1 border-b border-light-border dark:border-harken-gray/50">
          <div>
            <h2 
              className="text-lg font-semibold text-harken-gray dark:text-slate-100"
              style={{ fontVariantLigatures: 'none', letterSpacing: '0.01em' }}
            >
              {editingComponent ? "Edit Property Component" : "Add Property Component"}
            </h2>
            <p className="text-xs text-harken-gray-med dark:text-slate-400 mt-0.5">
              Define a distinct use type within your mixed-use property
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowGuidance(!showGuidance)}
              className={`p-2 rounded-lg transition-colors ${
                showGuidance 
                  ? 'bg-harken-blue/10 text-harken-blue dark:bg-cyan-500/10 dark:text-cyan-400'
                  : 'text-harken-gray-med hover:text-harken-gray dark:hover:text-slate-300 hover:bg-harken-gray-light/20'
              }`}
              title={showGuidance ? 'Hide guidance' : 'Show guidance'}
            >
              <HelpCircle className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-harken-gray-med hover:text-harken-gray dark:hover:text-slate-300 rounded-lg hover:bg-harken-gray-light/20"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 ml-1.5 space-y-6">
            
            {/* Contextual Tips Panel */}
            {showGuidance && contextualTips.length > 0 && (
              <div className="space-y-2 animate-fade-in">
                {contextualTips.map((tip, index) => (
                  <ContextualTip key={index} message={tip.message} type={tip.type} />
                ))}
              </div>
            )}

            {/* Component Name */}
            <div>
              <label className="block text-sm font-medium text-harken-gray dark:text-slate-200 mb-2">
                Component Name <span className="text-harken-error">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder='e.g., "Upstairs Apartments", "Retail Space"'
                className="w-full px-4 py-3 rounded-lg border border-light-border dark:border-harken-gray bg-white dark:bg-elevation-2 text-harken-gray dark:text-slate-100 placeholder:text-harken-gray-light focus:border-harken-blue focus:ring-2 focus:ring-harken-blue/20 outline-none transition-all"
              />
              <p className="mt-1.5 text-xs text-harken-gray-med dark:text-slate-400">
                Use a descriptive name that clearly identifies this portion of the property
              </p>
            </div>

            {/* Property Category */}
            <div>
              <label className="block text-sm font-medium text-harken-gray dark:text-slate-200 mb-3">
                Property Category <span className="text-harken-error">*</span>
              </label>
              <div className="grid grid-cols-3 gap-3">
                {PROPERTY_CATEGORIES.map((cat) => {
                  const Icon = CATEGORY_ICONS[cat.id];
                  const isSelected = category === cat.id;
                  const styles = CATEGORY_BUTTON_STYLES[cat.id];
                  const guidance = CATEGORY_GUIDANCE[cat.id];
                  
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setCategory(cat.id)}
                      className={`relative p-4 border-2 rounded-lg text-center transition-all ${
                        isSelected ? styles.selected : styles.unselected
                      } bg-white dark:bg-elevation-2`}
                    >
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-5 h-5 bg-current rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                      <Icon className={`w-8 h-8 mx-auto mb-2 ${isSelected ? styles.icon : 'text-harken-gray-med dark:text-slate-500'}`} />
                      <span className={`block text-sm font-medium ${isSelected ? styles.icon : 'text-harken-gray dark:text-slate-300'}`}>
                        {cat.label}
                      </span>
                      {guidance && (
                        <span className="block text-[10px] text-harken-gray-med dark:text-slate-500 mt-1">
                          {guidance.examples[0]}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Category Guidance Card */}
            {showGuidance && category && (
              <CategoryGuidanceCard category={category} />
            )}

            {/* Property Type */}
            {category && (
              <div className="animate-fade-in">
                <label className="block text-sm font-medium text-harken-gray dark:text-slate-200 mb-3">
                  Property Type <span className="text-harken-error">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
                  {availablePropertyTypes.map((type) => {
                    const isSelected = propertyType === type.id;
                    const styles = CATEGORY_BUTTON_STYLES[category];
                    
                    return (
                      <button
                        key={type.id}
                        onClick={() => setPropertyType(type.id)}
                        className={`relative p-3 border-2 rounded-lg text-left transition-all ${
                          isSelected ? styles.selected : styles.unselected
                        } bg-white dark:bg-elevation-2`}
                      >
                        {isSelected && (
                          <div className="absolute top-2 right-2">
                            <Check className={`w-4 h-4 ${styles.icon}`} />
                          </div>
                        )}
                        <span className={`block text-sm font-medium pr-6 ${isSelected ? styles.icon : 'text-harken-gray dark:text-slate-300'}`}>
                          {type.label}
                        </span>
                        {type.description && (
                          <span className="block text-[10px] text-harken-gray-med dark:text-slate-500 mt-0.5 line-clamp-1">
                            {type.description}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Size Allocation */}
            {category && propertyType && (
              <div className="space-y-4 p-4 rounded-xl bg-gradient-to-br from-slate-50 to-transparent dark:from-slate-800/30 dark:to-transparent border border-light-border/50 dark:border-harken-gray/30 animate-fade-in">
                <label className="block text-sm font-medium text-harken-gray dark:text-slate-200">
                  Size Allocation
                </label>
                
                {/* For Land: Show both Acreage and Square Footage with auto-calc */}
                {category === 'land' ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-harken-gray-med dark:text-slate-400 mb-1.5">
                          Acreage
                        </label>
                        <input
                          type="number"
                          step="0.001"
                          value={acreage ?? ''}
                          onChange={(e) => handleAcreageChange(e.target.value ? Number(e.target.value) : null)}
                          placeholder="e.g., 2.5"
                          className="w-full px-3 py-2.5 rounded-lg border border-light-border dark:border-harken-gray bg-white dark:bg-elevation-2 text-harken-gray dark:text-slate-100 placeholder:text-harken-gray-light focus:border-harken-blue focus:ring-2 focus:ring-harken-blue/20 outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-harken-gray-med dark:text-slate-400 mb-1.5">
                          Square Footage
                        </label>
                        <input
                          type="number"
                          value={squareFootage ?? ''}
                          onChange={(e) => handleSfChange(e.target.value ? Number(e.target.value) : null)}
                          placeholder="e.g., 108,900"
                          className="w-full px-3 py-2.5 rounded-lg border border-light-border dark:border-harken-gray bg-white dark:bg-elevation-2 text-harken-gray dark:text-slate-100 placeholder:text-harken-gray-light focus:border-harken-blue focus:ring-2 focus:ring-harken-blue/20 outline-none transition-all"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-harken-gray-med dark:text-slate-400 italic">
                      Values auto-calculate (1 acre = 43,560 SF)
                    </p>
                  </div>
                ) : (
                  /* For non-land: Square Footage & Unit Count */
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-harken-gray-med dark:text-slate-400 mb-1.5">
                        Square Footage
                      </label>
                      <input
                        type="number"
                        value={squareFootage ?? ''}
                        onChange={(e) => setSquareFootage(e.target.value ? Number(e.target.value) : null)}
                        placeholder="e.g., 1,200"
                        className="w-full px-3 py-2.5 rounded-lg border border-light-border dark:border-harken-gray bg-white dark:bg-elevation-2 text-harken-gray dark:text-slate-100 placeholder:text-harken-gray-light focus:border-harken-blue focus:ring-2 focus:ring-harken-blue/20 outline-none transition-all"
                      />
                    </div>
                    
                    {/* Unit Count (for residential) */}
                    {category === 'residential' && (
                      <div>
                        <label className="block text-xs text-harken-gray-med dark:text-slate-400 mb-1.5">
                          Unit Count
                        </label>
                        <input
                          type="number"
                          value={unitCount ?? ''}
                          onChange={(e) => setUnitCount(e.target.value ? Number(e.target.value) : null)}
                          placeholder="e.g., 4"
                          className="w-full px-3 py-2.5 rounded-lg border border-light-border dark:border-harken-gray bg-white dark:bg-elevation-2 text-harken-gray dark:text-slate-100 placeholder:text-harken-gray-light focus:border-harken-blue focus:ring-2 focus:ring-harken-blue/20 outline-none transition-all"
                        />
                      </div>
                    )}
                  </div>
                )}
                
                {/* SF Source */}
                <div>
                  <label className="block text-xs text-harken-gray-med dark:text-slate-400 mb-2">
                    How was size determined?
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['measured', 'estimated', 'unknown'] as const).map((source) => {
                      const isSelected = sfSource === source;
                      const labels: Record<typeof source, string> = {
                        measured: 'Measured',
                        estimated: 'Estimated', 
                        unknown: 'Unknown'
                      };
                      return (
                        <button
                          key={source}
                          type="button"
                          onClick={() => setSfSource(source)}
                          className={`px-3 py-2 text-xs font-medium rounded-lg border-2 transition-all ${
                            isSelected
                              ? 'border-harken-blue bg-harken-blue/10 text-harken-blue dark:border-cyan-400 dark:bg-cyan-500/10 dark:text-cyan-400'
                              : 'border-light-border dark:border-harken-gray text-harken-gray-med dark:text-slate-400 hover:border-harken-blue/50 bg-white dark:bg-elevation-2'
                          }`}
                        >
                          {labels[source]}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Multi-Family Unit Mix Grid - shown for multi-family types with Income Approach */}
            {isMultiFamilyType && incomeApproach && (
              <div className="animate-fade-in p-4 rounded-xl bg-gradient-to-br from-accent-teal-mint/5 to-transparent dark:from-teal-500/10 dark:to-transparent border border-accent-teal-mint/20 dark:border-teal-500/20">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 rounded bg-accent-teal-mint/20 dark:bg-teal-500/20 flex items-center justify-center">
                    <Building className="w-3.5 h-3.5 text-accent-teal-mint dark:text-teal-400" />
                  </div>
                  <span className="text-sm font-semibold text-harken-gray dark:text-slate-200">
                    Unit Configuration
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent-teal-mint/10 text-accent-teal-mint dark:bg-teal-500/10 dark:text-teal-400 font-medium">
                    Income Approach
                  </span>
                </div>
                <UnitMixGrid
                  value={unitMix}
                  onChange={setUnitMix}
                  totalUnitCount={totalUnitCount}
                  onTotalUnitCountChange={setTotalUnitCount}
                  calculationMethod={calculationMethod}
                  onCalculationMethodChange={setCalculationMethod}
                  perUnitSfUnknown={perUnitSfUnknown}
                  onPerUnitSfUnknownChange={setPerUnitSfUnknown}
                  totalBuildingSf={totalBuildingSf}
                  onTotalBuildingSfChange={setTotalBuildingSf}
                  mode="compact"
                  showCalculationMethod={false}
                  showUnknownSfToggle={true}
                  description="Configure unit breakdown for rent roll and income analysis."
                />
              </div>
            )}

            <hr className="border-light-border dark:border-harken-gray" />

            {/* Component Type (Land Classification) */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-harken-gray dark:text-slate-200">
                  Land Classification
                </label>
                {showGuidance && currentLandGuidance && (
                  <span className="text-[10px] text-harken-gray-med dark:text-slate-500 italic">
                    {currentLandGuidance.valuationMethod.slice(0, 50)}...
                  </span>
                )}
              </div>
              <div className="grid grid-cols-1 gap-2">
                {([
                  { id: 'standard', label: 'Standard Component', desc: 'Part of main property improvements' },
                  { id: 'excess', label: 'Excess Land', desc: 'Can be sold separately (valued via land sales comparison)' },
                  { id: 'surplus', label: 'Surplus Land', desc: 'Cannot be sold separately (adds contributory value only)' },
                ] as const).map((option) => {
                  const isSelected = landClassification === option.id;
                  const guidance = getLandClassificationGuidance(option.id);
                  
                  return (
                    <button
                      key={option.id}
                      onClick={() => setLandClassification(option.id)}
                      className={`relative p-4 border-2 rounded-lg text-left transition-all ${
                        isSelected
                          ? 'border-harken-blue bg-harken-blue/5 dark:bg-cyan-500/10'
                          : 'border-light-border dark:border-harken-gray hover:border-harken-blue/50 bg-white dark:bg-elevation-2'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-3 right-3">
                          <Check className="w-5 h-5 text-harken-blue dark:text-cyan-400" />
                        </div>
                      )}
                      <span className={`block text-sm font-semibold pr-8 ${isSelected ? 'text-harken-blue dark:text-cyan-400' : 'text-harken-gray dark:text-slate-200'}`}>
                        {option.label}
                      </span>
                      <span className="block text-xs text-harken-gray-med dark:text-slate-400 mt-0.5">
                        {option.desc}
                      </span>
                      {showGuidance && isSelected && guidance && (
                        <div className="mt-3 pt-3 border-t border-light-border/50 dark:border-harken-gray/30">
                          <p className="text-xs text-harken-gray-med dark:text-slate-400">
                            <strong>Valuation:</strong> {guidance.valuationMethod}
                          </p>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <hr className="border-light-border dark:border-harken-gray" />

            {/* Analysis Configuration */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-harken-gray dark:text-slate-200">
                  Analysis Configuration
                </label>
                {showGuidance && currentAnalysisGuidance && (
                  <span className="text-[10px] text-harken-blue dark:text-cyan-400 font-medium">
                    {currentAnalysisGuidance.label}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-1 gap-2">
                {([
                  { id: 'full', label: 'Full Analysis', desc: 'Separate approach tabs for this component' },
                  { id: 'contributory', label: 'Contributory Value', desc: 'Income approach only, value added to total' },
                  { id: 'combined', label: 'Combined', desc: 'No separate tabs; income lines added to primary grid' },
                ] as const).map((option) => {
                  const isSelected = analysisType === option.id;
                  const Icon = ANALYSIS_TYPE_ICONS[option.id];
                  const guidance = getAnalysisTypeGuidance(option.id);
                  
                  return (
                    <button
                      key={option.id}
                      onClick={() => setAnalysisType(option.id)}
                      className={`relative p-4 border-2 rounded-lg text-left transition-all ${
                        isSelected
                          ? 'border-harken-blue bg-harken-blue/5 dark:bg-cyan-500/10'
                          : 'border-light-border dark:border-harken-gray hover:border-harken-blue/50 bg-white dark:bg-elevation-2'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-3 right-3">
                          <Check className="w-5 h-5 text-harken-blue dark:text-cyan-400" />
                        </div>
                      )}
                      <div className="flex items-start gap-3">
                        <Icon className={`w-5 h-5 mt-0.5 ${isSelected ? 'text-harken-blue dark:text-cyan-400' : 'text-harken-gray-med dark:text-slate-500'}`} />
                        <div className="flex-1">
                          <span className={`block text-sm font-semibold pr-8 ${isSelected ? 'text-harken-blue dark:text-cyan-400' : 'text-harken-gray dark:text-slate-200'}`}>
                            {option.label}
                          </span>
                          <span className="block text-xs text-harken-gray-med dark:text-slate-400 mt-0.5">
                            {option.desc}
                          </span>
                          {showGuidance && isSelected && guidance && (
                            <div className="mt-3 pt-3 border-t border-light-border/50 dark:border-harken-gray/30">
                              <p className="text-xs text-harken-gray dark:text-slate-300 mb-2">
                                {guidance.fullDescription}
                              </p>
                              <p className="text-[10px] uppercase font-bold text-harken-gray-med dark:text-slate-500 tracking-wide mb-1">
                                Best When
                              </p>
                              <ul className="space-y-0.5">
                                {guidance.whenToUse.slice(0, 2).map((use, i) => (
                                  <li key={i} className="text-xs text-harken-gray-med dark:text-slate-400 flex items-start gap-1.5">
                                    <span className="w-1 h-1 rounded-full bg-harken-blue dark:bg-cyan-400 mt-1.5 shrink-0" />
                                    {use}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Enabled Approaches */}
            <div>
              <label className="block text-sm font-medium text-harken-gray dark:text-slate-200 mb-3">
                Enabled Approaches
              </label>
              <div className="grid grid-cols-3 gap-3">
                {([
                  { id: 'sales', label: 'Sales Comparison', state: salesApproach, setState: setSalesApproach },
                  { id: 'income', label: 'Income Approach', state: incomeApproach, setState: setIncomeApproach },
                  { id: 'cost', label: 'Cost Approach', state: costApproach, setState: setCostApproach },
                ]).map((approach) => (
                  <button
                    key={approach.id}
                    onClick={() => approach.setState(!approach.state)}
                    className={`relative p-3 border-2 rounded-lg text-center transition-all ${
                      approach.state
                        ? 'border-harken-blue bg-harken-blue/5 dark:bg-cyan-500/10'
                        : 'border-light-border dark:border-harken-gray hover:border-harken-blue/50 bg-white dark:bg-elevation-2'
                    }`}
                  >
                    {approach.state && (
                      <div className="absolute top-2 right-2">
                        <Check className="w-4 h-4 text-harken-blue dark:text-cyan-400" />
                      </div>
                    )}
                    <span className={`block text-xs font-medium ${approach.state ? 'text-harken-blue dark:text-cyan-400' : 'text-harken-gray dark:text-slate-300'}`}>
                      {approach.label}
                    </span>
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs text-harken-gray-med dark:text-slate-400">
                Select which valuation approaches apply to this component. Approaches can be adjusted per scenario.
              </p>
              
              {/* Approach warning if none selected */}
              {!salesApproach && !incomeApproach && !costApproach && (
                <div className="mt-3 flex items-center gap-2 text-amber-600 dark:text-amber-400">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-xs">At least one approach should be enabled</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer - sticky at bottom */}
        <div className="sticky bottom-0 flex items-center justify-between gap-3 px-6 py-4 ml-1.5 bg-white dark:bg-elevation-1 border-t border-light-border dark:border-harken-gray/50">
          <div className="flex items-center gap-2">
            {hasWarnings && (
              <span className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                <AlertTriangle className="w-4 h-4" />
                Review warnings above
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-harken-gray-med hover:text-harken-gray dark:text-slate-400 dark:hover:text-slate-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!isValid}
              className={`px-6 py-2.5 text-sm font-semibold rounded-lg transition-all bg-harken-blue text-white shadow-md ${
                isValid
                  ? 'hover:bg-harken-blue-hover cursor-pointer'
                  : 'opacity-50 cursor-not-allowed'
              }`}
            >
              {editingComponent ? 'Save Changes' : 'Add Component'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PropertyComponentPanel;
