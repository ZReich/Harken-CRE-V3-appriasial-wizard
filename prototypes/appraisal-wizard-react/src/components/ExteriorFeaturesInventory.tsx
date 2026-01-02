/**
 * ExteriorFeaturesInventory Component
 * 
 * Redesigned to match Site Improvements pattern with two-tier button selectors,
 * per-item date/condition/economic life tracking, and expandable notes.
 */

import { useState, useCallback, useMemo } from 'react';
import {
  Plus,
  Trash2,
  Calendar,
  Star,
  CheckCircle2,
  Calculator,
  ChevronDown,
  ChevronRight,
  Home,
  FileText,
  HelpCircle,
  Sparkles,
  MoreHorizontal,
  PenLine,
  Camera,
} from 'lucide-react';
import {
  EXTERIOR_CATEGORIES,
  getExteriorTypesByCategory,
  getBuildingComponentType,
  ECONOMIC_LIFE_GUIDE,
  type ExteriorCategory,
  type BuildingComponentType,
  type ApplicablePropertyType,
} from '../constants/buildingComponents';
import type { PropertyCategory } from '../constants/marshallSwift';
import { useFilteredBuildingComponents } from '../hooks/useFilteredBuildingComponents';
import { useCustomBuildingTypes, getSectionFromCategory } from '../hooks/useCustomBuildingTypes';
import ExpandableNote from './ExpandableNote';
import EnhancedTextArea from './EnhancedTextArea';
import PhotoReferencePanel from './PhotoReferencePanel';
import { useWizard } from '../context/WizardContext';
import type { ExteriorFeatures, ComponentDetail, ComponentCondition, PhotoData } from '../types';
import type { DetectedMaterial } from '../services/aiService';

// =================================================================
// CONSTANTS
// =================================================================

const CONDITION_OPTIONS: { value: ComponentCondition; label: string; abbrev: string; color: string }[] = [
  { value: 'excellent', label: 'Excellent', abbrev: 'Excl', color: 'bg-green-100 text-green-700 border-green-300' },
  { value: 'good', label: 'Good', abbrev: 'Good', color: 'bg-lime-100 text-lime-700 border-lime-300' },
  { value: 'average', label: 'Average', abbrev: 'Avg', color: 'bg-gray-100 text-gray-700 border-gray-300' },
  { value: 'fair', label: 'Fair', abbrev: 'Fair', color: 'bg-amber-100 text-amber-700 border-amber-300' },
  { value: 'poor', label: 'Poor', abbrev: 'Poor', color: 'bg-red-100 text-red-700 border-red-300' },
];

// =================================================================
// HELPER FUNCTIONS
// =================================================================

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

function calculateEffectiveAge(yearInstalled: number | undefined, condition: ComponentCondition): number {
  if (!yearInstalled) return 0;
  
  const currentYear = new Date().getFullYear();
  const actualAge = currentYear - yearInstalled;
  
  const conditionMultipliers: Record<ComponentCondition, number> = {
    excellent: 0.6,
    good: 0.8,
    average: 1.0,
    fair: 1.2,
    poor: 1.5,
  };
  
  return Math.round(actualAge * conditionMultipliers[condition]);
}

function calculateDepreciationPercent(effectiveAge: number, economicLife: number): number {
  if (economicLife <= 0) return 0;
  return Math.min(100, Math.round((effectiveAge / economicLife) * 100));
}

/**
 * Generate array of years from current year back to 1900.
 * Optionally prioritizes a specific year (e.g., building year built) at the top.
 */
function generateYearOptions(priorityYear?: number | null): number[] {
  const currentYear = new Date().getFullYear();
  const years: number[] = [];
  
  // Add priority year first if provided and valid
  if (priorityYear && priorityYear >= 1900 && priorityYear <= currentYear) {
    years.push(priorityYear);
  }
  
  // Add all years from current back to 1900
  for (let year = currentYear; year >= 1900; year--) {
    if (year !== priorityYear) {
      years.push(year);
    }
  }
  
  return years;
}

// =================================================================
// COMPONENT PROPS
// =================================================================

interface ExteriorFeaturesInventoryProps {
  features: ExteriorFeatures | undefined;
  onChange: (features: ExteriorFeatures) => void;
  buildingYearBuilt?: number | null;
  
  /**
   * Default occupancy code from wizard (Setup page).
   * Used for component filtering.
   */
  defaultOccupancyCode?: string;
  
  /**
   * Property type override for this specific building.
   */
  buildingPropertyTypeOverride?: string;
  
  /**
   * Occupancy code override for this specific building.
   */
  buildingOccupancyCodeOverride?: string;
  
  /**
   * Property category (residential | commercial | land).
   */
  propertyCategory?: PropertyCategory;
}

// =================================================================
// MAIN COMPONENT
// =================================================================

export default function ExteriorFeaturesInventory({
  features,
  onChange,
  buildingYearBuilt,
  defaultOccupancyCode,
  buildingPropertyTypeOverride,
  buildingOccupancyCodeOverride,
  propertyCategory,
}: ExteriorFeaturesInventoryProps) {
  // State for the add form
  const [selectedCategory, setSelectedCategory] = useState<ExteriorCategory | null>(null);
  const [selectedTypeId, setSelectedTypeId] = useState<string | null>(null);
  
  // Quick add form state
  const [yearInstalled, setYearInstalled] = useState<string>('');
  const [condition, setCondition] = useState<ComponentCondition>('average');
  const [customEconomicLife, setCustomEconomicLife] = useState<string>('');
  
  // Custom type state
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customDefaultLife, setCustomDefaultLife] = useState('30');
  const [saveForFuture, setSaveForFuture] = useState(false);
  
  // Show other options toggle
  const [showOtherOptions, setShowOtherOptions] = useState(false);
  
  // Expanded items state (for individual notes)
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  
  // Photo reference panel state
  const [showPhotoPanel, setShowPhotoPanel] = useState(false);
  const [activeSubSection, setActiveSubSection] = useState('exterior_features');
  
  // Get photos from wizard context
  const { state: wizardState } = useWizard();
  const photos = useMemo(() => {
    // Convert report photo assignments to PhotoData format
    const photoMap: Record<string, PhotoData | null> = {};
    wizardState.reportPhotos?.assignments?.forEach((assignment) => {
      if (assignment.url) {
        photoMap[assignment.slotId] = {
          // file is optional - only present for newly uploaded photos
          preview: assignment.url,
          caption: assignment.caption || '',
          takenBy: '',
          takenDate: '',
        };
      }
    });
    return photoMap;
  }, [wizardState.reportPhotos?.assignments]);
  
  // Count of relevant photos for the current section
  const contextPhotoCount = useMemo(() => {
    const mapping: Record<string, string[]> = {
      'exterior_features': ['ext_front', 'ext_rear', 'ext_side_1', 'ext_side_2', 'ext_additional_1', 'ext_additional_2'],
      'exterior_roof': ['ext_roof', 'ext_additional_1', 'ext_additional_2'],
    };
    const relevantPrefixes = mapping[activeSubSection] || mapping['exterior_features'];
    return Object.keys(photos).filter(slotId => 
      relevantPrefixes.some(prefix => slotId.startsWith(prefix)) && photos[slotId]
    ).length;
  }, [photos, activeSubSection]);

  // Handle applying detected material from photo analysis
  const handleApplyMaterial = useCallback((material: DetectedMaterial) => {
    // Map material category to our component categories
    const categoryMapping: Record<string, 'foundation' | 'roof' | 'walls' | 'windows'> = {
      'foundation': 'foundation',
      'roofing': 'roof',
      'siding': 'walls',
      'other': 'walls',
    };
    
    const targetCategory = categoryMapping[material.category];
    if (!targetCategory) return;
    
    // Create a new component detail from the detected material
    const newComponent: ComponentDetail = {
      id: `${material.id}_${Date.now()}`,
      type: material.name,
      condition: material.suggestedCondition,
      effectiveAge: material.suggestedAge,
      notes: material.details,
    };
    
    // Add to the appropriate category
    const updateKey = `${targetCategory}Details` as 'foundationDetails' | 'roofDetails' | 'wallDetails' | 'windowDetails';
    const currentDetails = features?.[updateKey] || [];
    
    onChange?.({
      ...features,
      [updateKey]: [...currentDetails, newComponent],
    });
  }, [features, onChange]);
  
  // General notes
  const [generalNotes, setGeneralNotes] = useState(features?.description || '');
  
  // Custom types hook
  const { 
    customTypes, 
    addCustomType, 
    getCustomTypesByCategory,
    toBuildingComponentType,
  } = useCustomBuildingTypes();
  
  // Filtered components hook for property type filtering
  const {
    getExteriorComponents,
    effectivePropertyType,
    isOverridden,
  } = useFilteredBuildingComponents({
    defaultOccupancyCode,
    buildingPropertyTypeOverride,
    buildingOccupancyCodeOverride,
    propertyCategory,
  });

  // Get all component details from features
  const allComponents = useMemo(() => {
    return [
      ...(features?.foundationDetails || []),
      ...(features?.roofDetails || []),
      ...(features?.wallDetails || []),
      ...(features?.windowDetails || []),
    ];
  }, [features]);

  // Get types for selected category (filtered by property type + custom)
  const { recommendedTypes, otherTypes, allTypes } = useMemo(() => {
    if (!selectedCategory) {
      return { recommendedTypes: [], otherTypes: [], allTypes: [] };
    }
    
    // Get filtered components from hook
    const filtered = getExteriorComponents(selectedCategory);
    
    // Get custom types for this category
    const customTypesForCategory = getCustomTypesByCategory(selectedCategory).map(toBuildingComponentType);
    
    // Add custom types to recommended list
    const recommendedWithCustom = [...filtered.recommended, ...customTypesForCategory];
    
    return {
      recommendedTypes: recommendedWithCustom,
      otherTypes: filtered.other,
      allTypes: [...filtered.all, ...customTypesForCategory],
    };
  }, [selectedCategory, getExteriorComponents, getCustomTypesByCategory, toBuildingComponentType]);
  
  // For backwards compatibility
  const availableTypes = allTypes;

  // Get the selected type details
  const selectedType = useMemo(() => {
    if (!selectedTypeId) return null;
    
    // Check M&S types first
    const msType = getBuildingComponentType(selectedTypeId);
    if (msType) return msType;
    
    // Check custom types
    const customType = customTypes.find(t => t.id === selectedTypeId);
    if (customType) return toBuildingComponentType(customType);
    
    return null;
  }, [selectedTypeId, customTypes, toBuildingComponentType]);

  // Calculate totals
  const totals = useMemo(() => {
    return { count: allComponents.length };
  }, [allComponents]);

  // Reset form
  const resetForm = useCallback(() => {
    setSelectedCategory(null);
    setSelectedTypeId(null);
    setShowCustomForm(false);
    setYearInstalled('');
    setCondition('average');
    setCustomEconomicLife('');
    setCustomName('');
    setCustomDefaultLife('30');
    setSaveForFuture(false);
  }, []);

  // Handle type selection
  const handleTypeSelect = useCallback((typeId: string) => {
    setSelectedTypeId(typeId);
    setShowCustomForm(false);
    const type = getBuildingComponentType(typeId) || customTypes.find(t => t.id === typeId);
    if (type) {
      setCustomEconomicLife(String(type.defaultEconomicLife));
    }
  }, [customTypes]);

  // Get the appropriate details array key for a category
  const getDetailsKey = (category: ExteriorCategory): keyof ExteriorFeatures => {
    switch (category) {
      case 'foundation': return 'foundationDetails';
      case 'roofing': return 'roofDetails';
      case 'walls': return 'wallDetails';
      case 'windows': return 'windowDetails';
    }
  };

  // Add component to inventory
  const addToInventory = useCallback(() => {
    if (!selectedCategory) return;
    
    let typeId = selectedTypeId || '';
    let typeName = '';
    let economicLife = parseInt(customEconomicLife) || 30;

    if (showCustomForm) {
      if (!customName.trim()) return;
      
      typeName = customName.trim();
      economicLife = parseInt(customDefaultLife) || 30;
      
      if (saveForFuture) {
        const newCustomType = addCustomType({
          label: typeName,
          category: selectedCategory,
          parentSection: 'exterior',
          defaultUnit: 'SF',
          defaultEconomicLife: economicLife,
          depreciationClass: '39-year',
        });
        typeId = newCustomType.id;
      } else {
        typeId = `temp-${generateId()}`;
      }
    } else {
      if (!selectedType) return;
      typeId = selectedType.id;
      typeName = selectedType.label;
      economicLife = parseInt(customEconomicLife) || selectedType.defaultEconomicLife;
    }

    const year = yearInstalled ? parseInt(yearInstalled) : (buildingYearBuilt || undefined);
    const effectiveAge = calculateEffectiveAge(year, condition);

    const newComponent: ComponentDetail = {
      id: generateId(),
      type: typeName,
      yearInstalled: year,
      condition,
      economicLife,
      effectiveAge,
      effectiveAgeOverride: false,
    };

    const detailsKey = getDetailsKey(selectedCategory);
    const currentDetails = (features?.[detailsKey] as ComponentDetail[] | undefined) || [];
    
    onChange({
      ...features,
      [detailsKey]: [...currentDetails, newComponent],
    });
    
    resetForm();
  }, [
    selectedCategory, selectedTypeId, selectedType, showCustomForm,
    yearInstalled, condition, customEconomicLife, customName, customDefaultLife,
    saveForFuture, buildingYearBuilt, features, onChange, resetForm, addCustomType
  ]);

  // Remove component
  const removeComponent = useCallback((componentId: string, category: ExteriorCategory) => {
    const detailsKey = getDetailsKey(category);
    const currentDetails = (features?.[detailsKey] as ComponentDetail[] | undefined) || [];
    
    onChange({
      ...features,
      [detailsKey]: currentDetails.filter(c => c.id !== componentId),
    });
  }, [features, onChange]);

  // Update component (for notes)
  const updateComponent = useCallback((componentId: string, category: ExteriorCategory, updates: Partial<ComponentDetail>) => {
    const detailsKey = getDetailsKey(category);
    const currentDetails = (features?.[detailsKey] as ComponentDetail[] | undefined) || [];
    
    onChange({
      ...features,
      [detailsKey]: currentDetails.map(c => c.id === componentId ? { ...c, ...updates } : c),
    });
  }, [features, onChange]);

  // Toggle expanded state
  const toggleExpanded = useCallback((id: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  // Check if a type is custom
  const isCustomType = useCallback((typeId: string) => {
    return typeId.startsWith('custom-') || typeId.startsWith('temp-');
  }, []);

  // Can add to inventory?
  const canAdd = useMemo(() => {
    if (showCustomForm) {
      return customName.trim().length > 0;
    }
    return !!selectedTypeId;
  }, [showCustomForm, selectedTypeId, customName]);

  // Get category for a component (reverse lookup)
  const getCategoryForComponent = useCallback((componentId: string): ExteriorCategory | null => {
    if (features?.foundationDetails?.some(c => c.id === componentId)) return 'foundation';
    if (features?.roofDetails?.some(c => c.id === componentId)) return 'roofing';
    if (features?.wallDetails?.some(c => c.id === componentId)) return 'walls';
    if (features?.windowDetails?.some(c => c.id === componentId)) return 'windows';
    return null;
  }, [features]);

  // Update general notes
  const handleGeneralNotesChange = useCallback((value: string) => {
    setGeneralNotes(value);
    onChange({
      ...features,
      description: value,
    });
  }, [features, onChange]);

  return (
    <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Home className="w-5 h-5 text-[#0da1c7]" />
            <div>
              <h3 className="text-lg font-bold text-[#1c3643]">Exterior Features</h3>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                Track individual components with installation dates and conditions
              </p>
            </div>
          </div>
          
          {/* Photo Reference Toggle */}
          <button
            onClick={() => setShowPhotoPanel(!showPhotoPanel)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              showPhotoPanel
                ? 'bg-[#0da1c7] text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            {showPhotoPanel ? 'Hide Photos' : 'View Photos'}
            {contextPhotoCount > 0 && (
              <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] ${
                showPhotoPanel ? 'bg-white/20' : 'bg-[#0da1c7] text-white'
              }`}>
                {contextPhotoCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Add Form Section */}
      <div className="p-4 bg-slate-50/50 border-b border-gray-100">
        {/* Category Selector */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-600 mb-2">Category</label>
          <div className="flex flex-wrap gap-2">
            {EXTERIOR_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id as ExteriorCategory);
                  setSelectedTypeId(null);
                  setShowCustomForm(false);
                  // Update active subsection for photo panel filtering
                  setActiveSubSection(cat.id === 'roofing' ? 'exterior_roof' : 'exterior_features');
                }}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-[#0da1c7] text-white border-[#0da1c7]'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-[#0da1c7] hover:text-[#0da1c7]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Type Selector (shown when category is selected) */}
        {selectedCategory && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-medium text-gray-600 dark:text-slate-400">
                Type ({EXTERIOR_CATEGORIES.find(c => c.id === selectedCategory)?.label})
              </label>
              {effectivePropertyType && (
                <span className="flex items-center gap-1 text-xs text-[#0da1c7]">
                  <Sparkles size={12} />
                  Filtered for {effectivePropertyType}
                  {isOverridden && <span className="text-gray-400">(override)</span>}
                </span>
              )}
            </div>
            
            {/* Recommended Types */}
            <div className="flex flex-wrap gap-2">
              {recommendedTypes.map(type => {
                const isCustom = type.id.startsWith('custom-');
                return (
                  <button
                    key={type.id}
                    onClick={() => handleTypeSelect(type.id)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-all flex items-center gap-1 ${
                      selectedTypeId === type.id && !showCustomForm
                        ? 'bg-[#0da1c7] text-white border-[#0da1c7]'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-[#0da1c7] hover:text-[#0da1c7]'
                    }`}
                  >
                    {isCustom && <Star size={12} className="text-amber-400" />}
                    {type.label}
                  </button>
                );
              })}
              
              {/* Other Options Toggle */}
              {otherTypes.length > 0 && (
                <button
                  onClick={() => setShowOtherOptions(!showOtherOptions)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-all flex items-center gap-1 ${
                    showOtherOptions
                      ? 'bg-gray-100 text-gray-700 border-gray-300'
                      : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <MoreHorizontal size={12} />
                  Other ({otherTypes.length})
                </button>
              )}
              
              {/* Custom button */}
              <button
                onClick={() => {
                  setSelectedTypeId(null);
                  setShowCustomForm(true);
                  setCustomName('');
                  setCustomDefaultLife('30');
                  setSaveForFuture(false);
                }}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-all flex items-center gap-1 ${
                  showCustomForm
                    ? 'bg-[#0da1c7] text-white border-[#0da1c7]'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-[#0da1c7] hover:text-[#0da1c7]'
                }`}
              >
                <Plus size={12} />
                Custom
              </button>
            </div>
            
            {/* Other Options Expanded */}
            {showOtherOptions && otherTypes.length > 0 && (
              <div className="mt-2 pt-2 border-t border-gray-200 dark:border-slate-700">
                <div className="text-xs text-gray-500 mb-2">Other Options</div>
                <div className="flex flex-wrap gap-2">
                  {otherTypes.map(type => (
                    <button
                      key={type.id}
                      onClick={() => handleTypeSelect(type.id)}
                      className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-all ${
                        selectedTypeId === type.id && !showCustomForm
                          ? 'bg-[#0da1c7] text-white border-[#0da1c7]'
                          : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-[#0da1c7] hover:text-[#0da1c7]'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Custom Type Form */}
        {showCustomForm && selectedCategory && (
          <div className="mb-4 p-3 bg-white rounded-lg border border-[#0da1c7]/30 border-dashed">
            <div className="flex items-center gap-2 mb-3 text-sm text-gray-600 dark:text-slate-400">
              <Plus size={14} className="text-[#0da1c7]" />
              <span>Add custom type to <strong>{EXTERIOR_CATEGORIES.find(c => c.id === selectedCategory)?.label}</strong></span>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Custom Component Name
                </label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent"
                  placeholder="e.g., Composite Siding"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
                  Economic Life (yrs)
                  <span 
                    className="inline-flex items-center cursor-help"
                    title={`Typical range: ${ECONOMIC_LIFE_GUIDE.exterior[selectedCategory]?.range || '20-50 yrs'}`}
                  >
                    <HelpCircle size={12} className="text-gray-400" />
                  </span>
                </label>
                <input
                  type="number"
                  value={customDefaultLife}
                  onChange={(e) => setCustomDefaultLife(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent"
                  min="1"
                  max="100"
                />
              </div>
            </div>
            
            {/* Economic Life Guide */}
            <div className="mb-3 p-2 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-start gap-2">
                <Calculator size={14} className="text-[#0da1c7] mt-0.5 flex-shrink-0" />
                <div className="text-xs text-gray-600 dark:text-slate-400">
                  <div className="font-medium text-gray-700 mb-1">
                    Economic Life Guide for {EXTERIOR_CATEGORIES.find(c => c.id === selectedCategory)?.label}
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1">
                    <span><strong>Range:</strong> {ECONOMIC_LIFE_GUIDE.exterior[selectedCategory]?.range || '20-50 yrs'}</span>
                    <span><strong>Typical:</strong> {ECONOMIC_LIFE_GUIDE.exterior[selectedCategory]?.typical || 30} yrs</span>
                  </div>
                  <div className="mt-1 text-gray-500 italic">
                    {ECONOMIC_LIFE_GUIDE.exterior[selectedCategory]?.examples || 'Varies by type'}
                  </div>
                  <button
                    type="button"
                    onClick={() => setCustomDefaultLife(String(ECONOMIC_LIFE_GUIDE.exterior[selectedCategory]?.typical || 30))}
                    className="mt-1.5 text-[#0da1c7] hover:text-[#0da1c7]/80 font-medium underline"
                  >
                    Use typical ({ECONOMIC_LIFE_GUIDE.exterior[selectedCategory]?.typical || 30} yrs)
                  </button>
                </div>
              </div>
            </div>
            
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={saveForFuture}
                onChange={(e) => setSaveForFuture(e.target.checked)}
                className="rounded border-gray-300 text-[#0da1c7] focus:ring-[#0da1c7]"
              />
              <Star size={14} className="text-amber-400" />
              Save to My Component Types (for future appraisals)
            </label>
          </div>
        )}

        {/* Quick Add Form (shown when type or custom form is active) */}
        {(selectedTypeId || showCustomForm) && (
          <div className="p-3 bg-white rounded-lg border border-gray-200 dark:border-slate-700">
            <div className="grid grid-cols-3 gap-3 mb-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
                  <Calendar size={12} />
                  Year Installed
                </label>
                <select
                  value={yearInstalled}
                  onChange={(e) => setYearInstalled(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent bg-white dark:bg-slate-700 dark:text-white"
                >
                  <option value="">Select year...</option>
                  {generateYearOptions(buildingYearBuilt).map((year) => (
                    <option key={year} value={year}>
                      {year}
                      {year === buildingYearBuilt && ' (Building Year)'}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Economic Life (yrs)
                </label>
                <input
                  type="number"
                  value={customEconomicLife}
                  onChange={(e) => setCustomEconomicLife(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent"
                  placeholder={selectedType?.defaultEconomicLife?.toString() || '30'}
                  min="1"
                  max="100"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={addToInventory}
                  disabled={!canAdd}
                  className={`w-full flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    canAdd
                      ? 'bg-[#0da1c7] text-white hover:bg-[#0da1c7]/90'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Plus size={14} />
                  Add
                </button>
              </div>
            </div>
            
            {/* Condition Selector */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Condition</label>
              <div className="flex gap-2">
                {CONDITION_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setCondition(opt.value)}
                    className={`flex-1 px-2 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                      condition === opt.value
                        ? opt.color
                        : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {opt.abbrev}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Inventory Section */}
      <div className="p-4">
        {/* Inventory Header */}
        {allComponents.length > 0 && (
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
            <div className="flex items-center gap-2 text-sm">
              <Calculator size={14} className="text-gray-400" />
              <span className="font-medium text-gray-700">Components ({totals.count} items)</span>
            </div>
          </div>
        )}

        {/* Inventory Items by Category */}
        {EXTERIOR_CATEGORIES.map(category => {
          const detailsKey = getDetailsKey(category.id as ExteriorCategory);
          const categoryComponents = (features?.[detailsKey] as ComponentDetail[] | undefined) || [];
          
          if (categoryComponents.length === 0) return null;
          
          return (
            <div key={category.id} className="mb-4">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                {category.label}
              </div>
              <div className="space-y-2">
                {categoryComponents.map((component) => {
                  const depreciationPct = calculateDepreciationPercent(
                    component.effectiveAge || 0, 
                    component.economicLife || 30
                  );
                  const isCustom = isCustomType(component.type);
                  const isExpanded = expandedItems.has(component.id);
                  const hasNotes = component.notes && component.notes.trim().length > 0;
                  
                  return (
                    <div
                      key={component.id}
                      className="bg-slate-50 rounded-lg border border-slate-100 hover:border-slate-200 transition-colors overflow-hidden"
                    >
                      {/* Main Row */}
                      <div className="flex items-center gap-3 p-3">
                        {/* Expand/Collapse Button */}
                        <button
                          onClick={() => toggleExpanded(component.id)}
                          className={`p-1 rounded transition-colors flex-shrink-0 ${
                            hasNotes ? 'text-[#0da1c7] hover:bg-[#0da1c7]/10' : 'text-gray-400 hover:bg-gray-100'
                          }`}
                          title={isExpanded ? 'Collapse notes' : 'Add/view notes'}
                        >
                          {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        </button>

                        {/* Type Name */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            {isCustom && <Star size={12} className="text-amber-400 flex-shrink-0" />}
                            <span className="font-medium text-sm text-gray-900 dark:text-white truncate">
                              {component.type}
                            </span>
                            {hasNotes && !isExpanded && (
                              <span title="Has notes">
                                <FileText size={12} className="text-[#0da1c7] flex-shrink-0" />
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Year */}
                        <div className="text-sm text-gray-500 whitespace-nowrap w-12 text-center">
                          {component.yearInstalled || '—'}
                        </div>

                        {/* Economic Life */}
                        <div className="text-xs text-gray-500 whitespace-nowrap">
                          {component.economicLife || 30}yr
                        </div>

                        {/* Condition Badge */}
                        <div className={`px-2 py-0.5 text-xs font-medium rounded ${
                          CONDITION_OPTIONS.find(c => c.value === component.condition)?.color || 'bg-gray-100 text-gray-600'
                        }`}>
                          {CONDITION_OPTIONS.find(c => c.value === component.condition)?.abbrev || 'Avg'}
                        </div>

                        {/* Depreciation */}
                        <div 
                          className={`px-2 py-0.5 text-xs font-medium rounded whitespace-nowrap cursor-help ${
                            depreciationPct >= 75 ? 'bg-red-100 text-red-700' :
                            depreciationPct >= 50 ? 'bg-amber-100 text-amber-700' :
                            depreciationPct > 0 ? 'bg-lime-100 text-lime-700' :
                            'bg-gray-100 text-gray-500'
                          }`}
                          title={`Depreciation: ${depreciationPct}% | Economic Life: ${component.economicLife || 30} yrs | Effective Age: ${component.effectiveAge || 0} yrs`}
                        >
                          {depreciationPct}%
                        </div>

                        {/* Status */}
                        {component.yearInstalled && component.condition ? (
                          <CheckCircle2 size={16} className="text-lime-500 flex-shrink-0" />
                        ) : (
                          <div className="w-4" />
                        )}

                        {/* Delete Button */}
                        <button
                          onClick={() => removeComponent(component.id, category.id as ExteriorCategory)}
                          className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors flex-shrink-0"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      {/* Expanded Details Section */}
                      {isExpanded && (
                        <div className="px-3 pb-3 pt-0">
                          <div className="ml-7 border-l-2 border-[#0da1c7]/20 pl-3 space-y-4">
                            {/* Depreciation Override */}
                            <div className="space-y-2">
                              <div className="flex items-center gap-3">
                                <div className="text-sm">
                                  <span className="text-slate-500 dark:text-slate-400">Depreciation:</span>
                                  <span className={`ml-2 font-semibold ${component.depreciationOverride !== undefined ? 'text-amber-600' : 'text-slate-700'}`}>
                                    {component.depreciationOverride !== undefined ? component.depreciationOverride : depreciationPct}%
                                  </span>
                                  {component.depreciationOverride !== undefined && (
                                    <span className="ml-1 text-xs text-amber-500">(override)</span>
                                  )}
                                </div>
                                
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (component.depreciationOverride !== undefined) {
                                      updateComponent(component.id, category.id as ExteriorCategory, { 
                                        depreciationOverride: undefined, 
                                        depreciationOverrideReason: undefined 
                                      });
                                    } else {
                                      updateComponent(component.id, category.id as ExteriorCategory, { 
                                        depreciationOverride: depreciationPct 
                                      });
                                    }
                                  }}
                                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium transition-all ${
                                    component.depreciationOverride !== undefined
                                      ? 'border-amber-400 bg-amber-50 text-amber-700'
                                      : 'border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-500'
                                  }`}
                                >
                                  <PenLine className="w-3 h-3" />
                                  Override
                                </button>
                              </div>
                              
                              {component.depreciationOverride !== undefined && (
                                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 space-y-3">
                                  <div className="flex items-center gap-2">
                                    <label className="text-xs font-medium text-amber-700">Override %</label>
                                    <input
                                      type="number"
                                      min="0"
                                      max="100"
                                      className="w-20 px-3 py-1.5 border border-amber-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                                      value={component.depreciationOverride}
                                      onChange={(e) => updateComponent(component.id, category.id as ExteriorCategory, { 
                                        depreciationOverride: e.target.value ? Number(e.target.value) : 0 
                                      })}
                                    />
                                    <span className="text-xs text-amber-600">
                                      (calculated: {depreciationPct}%)
                                    </span>
                                  </div>
                                  <EnhancedTextArea
                                    label="Override Reason"
                                    value={component.depreciationOverrideReason || ''}
                                    onChange={(v) => updateComponent(component.id, category.id as ExteriorCategory, { depreciationOverrideReason: v })}
                                    placeholder="Explain the rationale for this depreciation override..."
                                    sectionContext="depreciation_override"
                                    rows={3}
                                  />
                                </div>
                              )}
                            </div>
                            
                            {/* Notes */}
                            <ExpandableNote
                              id={`exterior_${component.id}_notes`}
                              label={`Notes for ${component.type}`}
                              value={component.notes || ''}
                              onChange={(value) => updateComponent(component.id, category.id as ExteriorCategory, { notes: value })}
                              placeholder={`Add notes about this ${component.type.toLowerCase()} (condition details, recent repairs, quality observations...)`}
                              sectionContext="exterior_component"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Empty State */}
        {allComponents.length === 0 && !selectedCategory && (
          <div className="text-center py-6 text-gray-500 dark:text-slate-400">
            <p className="text-sm">Select a category above to add exterior features</p>
          </div>
        )}
      </div>

      {/* General Notes Section */}
      <div className="p-4 pt-0">
        <ExpandableNote
          id="exterior_features_notes"
          label="Exterior Features Notes"
          value={generalNotes}
          onChange={handleGeneralNotesChange}
          placeholder="Add general notes about exterior features..."
          sectionContext="exterior_description"
        />
      </div>
      
      {/* Photo Reference Panel */}
      {showPhotoPanel && (
        <PhotoReferencePanel
          activeSection={activeSubSection}
          photos={photos}
          onClose={() => setShowPhotoPanel(false)}
          onApplyMaterial={handleApplyMaterial}
        />
      )}
    </div>
  );
}

