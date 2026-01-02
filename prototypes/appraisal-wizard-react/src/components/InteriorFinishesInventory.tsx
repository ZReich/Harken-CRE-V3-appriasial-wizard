/**
 * InteriorFinishesInventory Component
 * 
 * Redesigned to match Site Improvements pattern with two-tier button selectors,
 * per-item date/condition/economic life tracking, and expandable notes.
 * Used at the Area/Segment level within buildings.
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
  Layers,
  FileText,
  HelpCircle,
  PenLine,
  Camera,
} from 'lucide-react';
import {
  INTERIOR_CATEGORIES,
  getInteriorTypesByCategory,
  getBuildingComponentType,
  ECONOMIC_LIFE_GUIDE,
  type InteriorCategory,
  type BuildingComponentType,
} from '../constants/buildingComponents';
import { useCustomBuildingTypes } from '../hooks/useCustomBuildingTypes';
import { useFilteredInteriorComponents } from '../hooks/useFilteredInteriorComponents';
import type { AreaTypeId } from '../constants/useAreaTypes';
import ExpandableNote from './ExpandableNote';
import EnhancedTextArea from './EnhancedTextArea';
import PhotoReferencePanel from './PhotoReferencePanel';
import { useWizard } from '../context/WizardContext';
import type { InteriorFeatures, ComponentDetail, ComponentCondition, PhotoData } from '../types';
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

// Map category id to details key - interior walls use 'walls' category but 'wallDetails' key
const INTERIOR_CATEGORY_TO_KEY: Record<InteriorCategory, keyof InteriorFeatures> = {
  'ceilings': 'ceilingDetails',
  'flooring': 'flooringDetails',
  'walls': 'wallDetails',
  'plumbing': 'plumbingDetails',
  'lighting': 'lightingDetails',
};

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

interface InteriorFinishesInventoryProps {
  features: InteriorFeatures | undefined;
  onChange: (features: InteriorFeatures) => void;
  buildingYearBuilt?: number | null;
  areaName?: string;
  compact?: boolean;
  /** Area type ID for filtering recommended finishes (e.g., 'warehouse', 'office', 'kitchen') */
  areaTypeId?: AreaTypeId | string;
}

// =================================================================
// MAIN COMPONENT
// =================================================================

export default function InteriorFinishesInventory({
  features,
  onChange,
  buildingYearBuilt,
  areaName,
  compact = false,
  areaTypeId,
}: InteriorFinishesInventoryProps) {
  // State for the add form
  const [selectedCategory, setSelectedCategory] = useState<InteriorCategory | null>(null);
  const [selectedTypeId, setSelectedTypeId] = useState<string | null>(null);
  
  // Quick add form state
  const [yearInstalled, setYearInstalled] = useState<string>('');
  const [condition, setCondition] = useState<ComponentCondition>('average');
  const [customEconomicLife, setCustomEconomicLife] = useState<string>('');
  
  // Custom type state
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customDefaultLife, setCustomDefaultLife] = useState('15');
  const [saveForFuture, setSaveForFuture] = useState(false);
  
  // Expanded items state (for individual notes)
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  
  // Show "other options" expandable section
  const [showOtherOptions, setShowOtherOptions] = useState(false);
  
  // Photo reference panel state
  const [showPhotoPanel, setShowPhotoPanel] = useState(false);
  const [activeSubSection, setActiveSubSection] = useState('interior_finishes');
  
  // Get photos from wizard context
  const { state: wizardState } = useWizard();
  const photos = useMemo(() => {
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
      'interior_finishes': ['int_office', 'int_lobby', 'int_conference', 'int_shop', 'int_bathroom', 'int_kitchen', 'int_mezzanine'],
      'interior_ceilings': ['int_office', 'int_lobby', 'int_conference', 'int_shop'],
      'interior_flooring': ['int_office', 'int_lobby', 'int_conference', 'int_shop', 'int_bathroom'],
    };
    const relevantPrefixes = mapping[activeSubSection] || mapping['interior_finishes'];
    return Object.keys(photos).filter(slotId => 
      relevantPrefixes.some(prefix => slotId.startsWith(prefix)) && photos[slotId]
    ).length;
  }, [photos, activeSubSection]);

  // Handle applying detected material from photo analysis
  const handleApplyMaterial = useCallback((material: DetectedMaterial) => {
    // Map material category to our interior finish categories
    const categoryMapping: Record<string, 'flooring' | 'ceiling' | 'walls'> = {
      'flooring': 'flooring',
      'ceiling': 'ceiling',
      'other': 'walls',
    };
    
    const targetCategory = categoryMapping[material.category] || 'walls';
    
    // Create a new component detail from the detected material
    const newComponent: ComponentDetail = {
      id: `${material.id}_${Date.now()}`,
      type: material.name,
      condition: material.suggestedCondition,
      effectiveAge: material.suggestedAge,
      notes: material.details,
    };
    
    // Add to the appropriate category
    const updateKey = `${targetCategory}Details` as 'flooringDetails' | 'ceilingDetails' | 'wallDetails';
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
  
  // Filtered interior components based on area type
  const {
    getCeilingComponents,
    getFlooringComponents,
    getWallComponents,
    getPlumbingComponents,
    getLightingComponents,
    areaTypeLabel,
  } = useFilteredInteriorComponents({ areaType: areaTypeId || 'other' });

  // Get all component details from features
  const allComponents = useMemo(() => {
    return [
      ...(features?.ceilingDetails || []),
      ...(features?.flooringDetails || []),
      ...(features?.wallDetails || []),
      ...(features?.plumbingDetails || []),
      ...(features?.lightingDetails || []),
    ];
  }, [features]);

  // Get types for selected category (M&S + custom) with recommended/other split
  const { recommendedTypes, otherTypes, allTypes } = useMemo(() => {
    if (!selectedCategory) return { recommendedTypes: [], otherTypes: [], allTypes: [] };
    
    // Get filtered results based on category
    let filteredResult;
    switch (selectedCategory) {
      case 'ceilings':
        filteredResult = getCeilingComponents();
        break;
      case 'flooring':
        filteredResult = getFlooringComponents();
        break;
      case 'walls':
        filteredResult = getWallComponents();
        break;
      case 'plumbing':
        filteredResult = getPlumbingComponents();
        break;
      case 'lighting':
        filteredResult = getLightingComponents();
        break;
      default:
        filteredResult = { recommended: [], other: [], all: [] };
    }
    
    // Add custom types to the "other" category
    const customTypesForCategory = getCustomTypesByCategory(selectedCategory).map(toBuildingComponentType);
    
    return {
      recommendedTypes: filteredResult.recommended,
      otherTypes: [...filteredResult.other, ...customTypesForCategory],
      allTypes: [...filteredResult.all, ...customTypesForCategory],
    };
  }, [selectedCategory, getCeilingComponents, getFlooringComponents, getWallComponents, getPlumbingComponents, getLightingComponents, getCustomTypesByCategory, toBuildingComponentType]);
  
  // Legacy compatibility - total available types
  const availableTypes = useMemo(() => {
    return [...recommendedTypes, ...otherTypes];
  }, [recommendedTypes, otherTypes]);

  // Get the selected type details
  const selectedType = useMemo(() => {
    if (!selectedTypeId) return null;
    
    const msType = getBuildingComponentType(selectedTypeId);
    if (msType) return msType;
    
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
    setCustomDefaultLife('15');
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
  const getDetailsKey = (category: InteriorCategory): keyof InteriorFeatures => {
    return INTERIOR_CATEGORY_TO_KEY[category];
  };

  // Add component to inventory
  const addToInventory = useCallback(() => {
    if (!selectedCategory) return;
    
    let typeId = selectedTypeId || '';
    let typeName = '';
    let economicLife = parseInt(customEconomicLife) || 15;

    if (showCustomForm) {
      if (!customName.trim()) return;
      
      typeName = customName.trim();
      economicLife = parseInt(customDefaultLife) || 15;
      
      if (saveForFuture) {
        const newCustomType = addCustomType({
          label: typeName,
          category: selectedCategory,
          parentSection: 'interior',
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
  const removeComponent = useCallback((componentId: string, category: InteriorCategory) => {
    const detailsKey = getDetailsKey(category);
    const currentDetails = (features?.[detailsKey] as ComponentDetail[] | undefined) || [];
    
    onChange({
      ...features,
      [detailsKey]: currentDetails.filter(c => c.id !== componentId),
    });
  }, [features, onChange]);

  // Update component (for notes)
  const updateComponent = useCallback((componentId: string, category: InteriorCategory, updates: Partial<ComponentDetail>) => {
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

  // Update general notes
  const handleGeneralNotesChange = useCallback((value: string) => {
    setGeneralNotes(value);
    onChange({
      ...features,
      description: value,
    });
  }, [features, onChange]);

  return (
    <div className={`bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden ${compact ? 'text-sm' : ''}`}>
      {/* Header */}
      <div className={`${compact ? 'p-3' : 'p-4'} border-b border-gray-100`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className={`${compact ? 'w-4 h-4' : 'w-5 h-5'} text-[#0da1c7]`} />
            <div>
              <h3 className={`${compact ? 'text-base' : 'text-lg'} font-bold text-[#1c3643]`}>
                Interior Finishes {areaName && <span className="font-normal text-gray-500">({areaName})</span>}
              </h3>
              {!compact && (
                <p className="text-xs text-gray-500">
                  Track ceilings, flooring, and wall finishes
                </p>
              )}
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
      <div className={`${compact ? 'p-3' : 'p-4'} bg-slate-50/50 border-b border-gray-100`}>
        {/* Category Selector */}
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 mb-2">Category</label>
          <div className="flex flex-wrap gap-2">
            {INTERIOR_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id as InteriorCategory);
                  setSelectedTypeId(null);
                  setShowCustomForm(false);
                  // Update active subsection for photo panel filtering
                  setActiveSubSection(`interior_${cat.id}`);
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

        {/* Type Selector */}
        {selectedCategory && (
          <div className="mb-3">
            {/* Recommended Types */}
            {recommendedTypes.length > 0 && (
              <>
                <label className="block text-xs font-medium text-gray-600 mb-2">
                  Recommended for {areaTypeId ? areaTypeLabel : INTERIOR_CATEGORIES.find(c => c.id === selectedCategory)?.label}
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {recommendedTypes.map(type => (
                    <button
                      key={type.id}
                      onClick={() => handleTypeSelect(type.id)}
                      className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-all flex items-center gap-1 ${
                        selectedTypeId === type.id && !showCustomForm
                          ? 'bg-[#0da1c7] text-white border-[#0da1c7]'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-[#0da1c7] hover:text-[#0da1c7]'
                      }`}
                    >
                      {type.isPrimary && <CheckCircle2 size={12} className="text-green-500" />}
                      {type.label}
                    </button>
                  ))}
                </div>
              </>
            )}
            
            {/* Other Options (collapsible) */}
            {otherTypes.length > 0 && (
              <div>
                <button
                  onClick={() => setShowOtherOptions(!showOtherOptions)}
                  className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 mb-2"
                >
                  {showOtherOptions ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  Other Options ({otherTypes.length})
                </button>
                
                {showOtherOptions && (
                  <div className="flex flex-wrap gap-2 mb-3 pl-2 border-l-2 border-gray-200">
                    {otherTypes.map(type => {
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
                  </div>
                )}
              </div>
            )}
            
            {/* Fallback if no recommended types - show all */}
            {recommendedTypes.length === 0 && (
              <>
                <label className="block text-xs font-medium text-gray-600 mb-2">
                  Type ({INTERIOR_CATEGORIES.find(c => c.id === selectedCategory)?.label})
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {availableTypes.map(type => {
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
                </div>
              </>
            )}
              
            {/* Custom button */}
            <button
              onClick={() => {
                setSelectedTypeId(null);
                setShowCustomForm(true);
                setShowOtherOptions(false);
                setCustomName('');
                setCustomDefaultLife('15');
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
        )}

        {/* Custom Type Form */}
        {showCustomForm && selectedCategory && (
          <div className="mb-3 p-3 bg-white rounded-lg border border-[#0da1c7]/30 border-dashed">
            <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
              <Plus size={14} className="text-[#0da1c7]" />
              <span>Add custom type to <strong>{INTERIOR_CATEGORIES.find(c => c.id === selectedCategory)?.label}</strong></span>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Custom Finish Name
                </label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent"
                  placeholder="e.g., Luxury Vinyl Plank"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
                  Economic Life (yrs)
                  <span 
                    className="inline-flex items-center cursor-help"
                    title={`Typical range: ${ECONOMIC_LIFE_GUIDE.interior[selectedCategory]?.range || '10-40 yrs'}`}
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
            {!compact && (
              <div className="mb-3 p-2 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-start gap-2">
                  <Calculator size={14} className="text-[#0da1c7] mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-gray-600">
                    <div className="font-medium text-gray-700 mb-1">
                      Economic Life Guide for {INTERIOR_CATEGORIES.find(c => c.id === selectedCategory)?.label}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                      <span><strong>Range:</strong> {ECONOMIC_LIFE_GUIDE.interior[selectedCategory]?.range || '10-40 yrs'}</span>
                      <span><strong>Typical:</strong> {ECONOMIC_LIFE_GUIDE.interior[selectedCategory]?.typical || 15} yrs</span>
                    </div>
                    <div className="mt-1 text-gray-500 italic">
                      {ECONOMIC_LIFE_GUIDE.interior[selectedCategory]?.examples || 'Varies by type'}
                    </div>
                    <button
                      type="button"
                      onClick={() => setCustomDefaultLife(String(ECONOMIC_LIFE_GUIDE.interior[selectedCategory]?.typical || 15))}
                      className="mt-1.5 text-[#0da1c7] hover:text-[#0da1c7]/80 font-medium underline"
                    >
                      Use typical ({ECONOMIC_LIFE_GUIDE.interior[selectedCategory]?.typical || 15} yrs)
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={saveForFuture}
                onChange={(e) => setSaveForFuture(e.target.checked)}
                className="rounded border-gray-300 text-[#0da1c7] focus:ring-[#0da1c7]"
              />
              <Star size={14} className="text-amber-400" />
              Save to My Finish Types (for future appraisals)
            </label>
          </div>
        )}

        {/* Quick Add Form */}
        {(selectedTypeId || showCustomForm) && (
          <div className="p-3 bg-white rounded-lg border border-gray-200">
            <div className="grid grid-cols-3 gap-3 mb-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
                  <Calendar size={12} />
                  Year Installed
                </label>
                <select
                  value={yearInstalled}
                  onChange={(e) => setYearInstalled(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent bg-white"
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
                  placeholder={selectedType?.defaultEconomicLife?.toString() || '15'}
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
      <div className={`${compact ? 'p-3' : 'p-4'}`}>
        {/* Inventory Header */}
        {allComponents.length > 0 && (
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
            <div className="flex items-center gap-2 text-sm">
              <Calculator size={14} className="text-gray-400" />
              <span className="font-medium text-gray-700">Finishes ({totals.count} items)</span>
            </div>
          </div>
        )}

        {/* Inventory Items by Category */}
        {INTERIOR_CATEGORIES.map(category => {
          const detailsKey = getDetailsKey(category.id as InteriorCategory);
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
                    component.economicLife || 15
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
                            <span className="font-medium text-sm text-gray-900 truncate">
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
                          {component.economicLife || 15}yr
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
                          title={`Depreciation: ${depreciationPct}% | Economic Life: ${component.economicLife || 15} yrs | Effective Age: ${component.effectiveAge || 0} yrs`}
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
                          onClick={() => removeComponent(component.id, category.id as InteriorCategory)}
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
                                  <span className="text-slate-500">Depreciation:</span>
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
                                      updateComponent(component.id, category.id as InteriorCategory, { 
                                        depreciationOverride: undefined, 
                                        depreciationOverrideReason: undefined 
                                      });
                                    } else {
                                      updateComponent(component.id, category.id as InteriorCategory, { 
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
                                      onChange={(e) => updateComponent(component.id, category.id as InteriorCategory, { 
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
                                    onChange={(v) => updateComponent(component.id, category.id as InteriorCategory, { depreciationOverrideReason: v })}
                                    placeholder="Explain the rationale for this depreciation override..."
                                    sectionContext="depreciation_override"
                                    rows={3}
                                  />
                                </div>
                              )}
                            </div>
                            
                            {/* Notes */}
                            <ExpandableNote
                              id={`interior_${component.id}_notes`}
                              label={`Notes for ${component.type}`}
                              value={component.notes || ''}
                              onChange={(value) => updateComponent(component.id, category.id as InteriorCategory, { notes: value })}
                              placeholder={`Add notes about this finish (condition details, recent updates, quality observations...)`}
                              sectionContext="interior_component"
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
          <div className="text-center py-4 text-gray-500">
            <p className="text-sm">Select a category above to add interior finishes</p>
          </div>
        )}
      </div>

      {/* General Notes Section */}
      {!compact && (
        <div className="p-4 pt-0">
          <ExpandableNote
            id="interior_finishes_notes"
            label="Interior Finishes Notes"
            value={generalNotes}
            onChange={handleGeneralNotesChange}
            placeholder="Add general notes about interior finishes..."
            sectionContext="interior_description"
          />
        </div>
      )}
      
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

