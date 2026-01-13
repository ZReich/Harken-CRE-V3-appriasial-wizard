/**
 * MechanicalSystemsInventory Component
 * 
 * Redesigned to match Site Improvements pattern with two-tier button selectors,
 * per-item date/condition/economic life tracking, capacity fields, and expandable notes.
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
  Wrench,
  FileText,
  HelpCircle,
  Sparkles,
  MoreHorizontal,
  PenLine,
  Camera,
} from 'lucide-react';
import {
  MECHANICAL_CATEGORIES,
  getMechanicalTypesByCategory,
  getBuildingComponentType,
  ECONOMIC_LIFE_GUIDE,
  type MechanicalCategory,
  type BuildingComponentType,
  type ApplicablePropertyType,
} from '../constants/buildingComponents';
import type { PropertyCategory } from '../constants/marshallSwift';
import { useFilteredBuildingComponents } from '../hooks/useFilteredBuildingComponents';
import { useCustomBuildingTypes } from '../hooks/useCustomBuildingTypes';
import ExpandableNote from './ExpandableNote';
import EnhancedTextArea from './EnhancedTextArea';
import PhotoReferencePanel from './PhotoReferencePanel';
import { useWizard } from '../context/WizardContext';
import type { MechanicalSystems, ComponentDetail, ComponentCondition, PhotoData } from '../types';
import type { DetectedMaterial } from '../services/aiService';

// =================================================================
// CONSTANTS
// =================================================================

const CONDITION_OPTIONS: { value: ComponentCondition; label: string; abbrev: string; color: string }[] = [
  { value: 'excellent', label: 'Excellent', abbrev: 'Excl', color: 'bg-accent-teal-mint-light text-accent-teal-mint border-accent-teal-mint' },
  { value: 'good', label: 'Good', abbrev: 'Good', color: 'bg-lime-100 text-lime-700 border-lime-300' },
  { value: 'average', label: 'Average', abbrev: 'Avg', color: 'bg-harken-gray-light text-harken-gray border-light-border' },
  { value: 'fair', label: 'Fair', abbrev: 'Fair', color: 'bg-accent-amber-gold-light text-accent-amber-gold border-accent-amber-gold' },
  { value: 'poor', label: 'Poor', abbrev: 'Poor', color: 'bg-accent-red-light text-harken-error border-harken-error/20' },
];

// =================================================================
// HELPER FUNCTIONS
// =================================================================

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 11);
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

interface MechanicalSystemsInventoryProps {
  systems: MechanicalSystems | undefined;
  onChange: (systems: MechanicalSystems) => void;
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

export default function MechanicalSystemsInventory({
  systems,
  onChange,
  buildingYearBuilt,
  defaultOccupancyCode,
  buildingPropertyTypeOverride,
  buildingOccupancyCodeOverride,
  propertyCategory,
}: MechanicalSystemsInventoryProps) {
  // State for the add form
  const [selectedCategory, setSelectedCategory] = useState<MechanicalCategory | null>(null);
  const [selectedTypeId, setSelectedTypeId] = useState<string | null>(null);
  
  // Quick add form state
  const [yearInstalled, setYearInstalled] = useState<string>('');
  const [condition, setCondition] = useState<ComponentCondition>('average');
  const [customEconomicLife, setCustomEconomicLife] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('1');
  const [unitCapacity, setUnitCapacity] = useState<string>('');
  
  // Custom type state
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customDefaultLife, setCustomDefaultLife] = useState('20');
  const [saveForFuture, setSaveForFuture] = useState(false);
  
  // Show other options toggle
  const [showOtherOptions, setShowOtherOptions] = useState(false);
  
  // Expanded items state (for individual notes)
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  
  // Photo reference panel state
  const [showPhotoPanel, setShowPhotoPanel] = useState(false);
  const [activeSubSection, setActiveSubSection] = useState('mechanical_hvac');
  
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
      'mechanical_hvac': ['int_mechanical', 'int_hvac'],
      'mechanical_electrical': ['int_electrical', 'int_mechanical'],
      'mechanical_plumbing': ['int_plumbing', 'int_bathroom'],
    };
    const relevantPrefixes = mapping[activeSubSection] || mapping['mechanical_hvac'];
    return Object.keys(photos).filter(slotId => 
      relevantPrefixes.some(prefix => slotId.startsWith(prefix)) && photos[slotId]
    ).length;
  }, [photos, activeSubSection]);

  // Handle applying detected material from photo analysis
  const handleApplyMaterial = useCallback((material: DetectedMaterial) => {
    // Map material category to MechanicalSystems detail fields
    // MechanicalSystems has: electricalDetails, heatingDetails, coolingDetails, sprinklerDetails, elevatorDetails
    const getUpdateKey = (category: string): keyof MechanicalSystems | null => {
      switch (category) {
        case 'mechanical': return 'heatingDetails'; // HVAC → heating
        case 'electrical': return 'electricalDetails';
        case 'other': return 'sprinklerDetails'; // Fire protection as fallback
        default: return null;
      }
    };
    
    const updateKey = getUpdateKey(material.category);
    if (!updateKey) return;
    
    // Create a new component detail from the detected material
    const newComponent: ComponentDetail = {
      id: `${material.id}_${Date.now()}`,
      type: material.name,
      condition: material.suggestedCondition,
      effectiveAge: material.suggestedAge,
      notes: material.details,
    };
    
    // Add to the appropriate category
    const currentDetails = (systems?.[updateKey] as ComponentDetail[] | undefined) || [];
    
    onChange?.({
      ...systems,
      [updateKey]: [...currentDetails, newComponent],
    });
  }, [systems, onChange]);
  
  // General notes
  const [generalNotes, setGeneralNotes] = useState(systems?.description || '');
  
  // Custom types hook
  const { 
    customTypes, 
    addCustomType, 
    getCustomTypesByCategory,
    toBuildingComponentType,
  } = useCustomBuildingTypes();
  
  // Filtered components hook for property type filtering
  const {
    getMechanicalComponents,
    effectivePropertyType,
    isOverridden,
  } = useFilteredBuildingComponents({
    defaultOccupancyCode,
    buildingPropertyTypeOverride,
    buildingOccupancyCodeOverride,
    propertyCategory,
  });

  // Get all component details from systems
  const allComponents = useMemo(() => {
    return [
      ...(systems?.electricalDetails || []),
      ...(systems?.heatingDetails || []),
      ...(systems?.coolingDetails || []),
      ...(systems?.sprinklerDetails || []),
      ...(systems?.elevatorDetails || []),
    ];
  }, [systems]);

  // Get types for selected category (filtered by property type + custom)
  const { recommendedTypes, otherTypes, allTypes } = useMemo(() => {
    if (!selectedCategory) {
      return { recommendedTypes: [], otherTypes: [], allTypes: [] };
    }
    
    // Get filtered components from hook
    const filtered = getMechanicalComponents(selectedCategory);
    
    // Get custom types for this category
    const customTypesForCategory = getCustomTypesByCategory(selectedCategory).map(toBuildingComponentType);
    
    // Add custom types to recommended list
    const recommendedWithCustom = [...filtered.recommended, ...customTypesForCategory];
    
    return {
      recommendedTypes: recommendedWithCustom,
      otherTypes: filtered.other,
      allTypes: [...filtered.all, ...customTypesForCategory],
    };
  }, [selectedCategory, getMechanicalComponents, getCustomTypesByCategory, toBuildingComponentType]);
  
  // For backwards compatibility
  const availableTypes = allTypes;

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
    setQuantity('1');
    setUnitCapacity('');
    setCustomName('');
    setCustomDefaultLife('20');
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
  const getDetailsKey = (category: MechanicalCategory): keyof MechanicalSystems => {
    switch (category) {
      case 'electrical': return 'electricalDetails';
      case 'heating': return 'heatingDetails';
      case 'cooling': return 'coolingDetails';
      case 'fire-protection': return 'sprinklerDetails';
      case 'elevators': return 'elevatorDetails';
    }
  };

  // Add component to inventory
  const addToInventory = useCallback(() => {
    if (!selectedCategory) return;
    
    let typeId = selectedTypeId || '';
    let typeName = '';
    let economicLife = parseInt(customEconomicLife) || 20;

    if (showCustomForm) {
      if (!customName.trim()) return;
      
      typeName = customName.trim();
      economicLife = parseInt(customDefaultLife) || 20;
      
      if (saveForFuture) {
        const newCustomType = addCustomType({
          label: typeName,
          category: selectedCategory,
          parentSection: 'mechanical',
          defaultUnit: 'EA',
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
    const qty = parseInt(quantity) || 1;
    
    // Build display label with capacity if provided
    let displayLabel = typeName;
    if (qty > 1 || unitCapacity) {
      const capacityStr = unitCapacity ? ` @ ${unitCapacity}` : '';
      displayLabel = `${typeName} (${qty}x${capacityStr})`;
    }

    const newComponent: ComponentDetail = {
      id: generateId(),
      type: displayLabel,
      yearInstalled: year,
      condition,
      economicLife,
      effectiveAge,
      effectiveAgeOverride: false,
      quantity: qty,
      unit: selectedType?.defaultUnit || 'EA',
    };

    const detailsKey = getDetailsKey(selectedCategory);
    const currentDetails = (systems?.[detailsKey] as ComponentDetail[] | undefined) || [];
    
    onChange({
      ...systems,
      [detailsKey]: [...currentDetails, newComponent],
    });
    
    resetForm();
  }, [
    selectedCategory, selectedTypeId, selectedType, showCustomForm,
    yearInstalled, condition, customEconomicLife, quantity, unitCapacity,
    customName, customDefaultLife, saveForFuture, buildingYearBuilt,
    systems, onChange, resetForm, addCustomType
  ]);

  // Remove component
  const removeComponent = useCallback((componentId: string, category: MechanicalCategory) => {
    const detailsKey = getDetailsKey(category);
    const currentDetails = (systems?.[detailsKey] as ComponentDetail[] | undefined) || [];
    
    onChange({
      ...systems,
      [detailsKey]: currentDetails.filter(c => c.id !== componentId),
    });
  }, [systems, onChange]);

  // Update component (for notes)
  const updateComponent = useCallback((componentId: string, category: MechanicalCategory, updates: Partial<ComponentDetail>) => {
    const detailsKey = getDetailsKey(category);
    const currentDetails = (systems?.[detailsKey] as ComponentDetail[] | undefined) || [];
    
    onChange({
      ...systems,
      [detailsKey]: currentDetails.map(c => c.id === componentId ? { ...c, ...updates } : c),
    });
  }, [systems, onChange]);

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
      ...systems,
      description: value,
    });
  }, [systems, onChange]);

  // Show capacity field for certain categories
  const showCapacityField = selectedCategory === 'heating' || selectedCategory === 'cooling';

  return (
    <div className="bg-surface-1 dark:bg-elevation-1 border border-light-border dark:border-dark-border rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-harken-gray-light">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-harken-blue" />
            <div>
              <h3 className="text-lg font-bold text-[#1c3643] dark:text-white">Mechanical Systems</h3>
              <p className="text-xs text-harken-gray-med dark:text-slate-400">
                Track HVAC, electrical, fire protection, and elevators
              </p>
            </div>
          </div>
          
          {/* Photo Reference Toggle */}
          <button
            onClick={() => setShowPhotoPanel(!showPhotoPanel)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              showPhotoPanel
                ? 'bg-harken-blue text-white'
                : 'bg-surface-3 dark:bg-elevation-subtle text-slate-600 hover:bg-surface-4 dark:hover:bg-elevation-muted'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            {showPhotoPanel ? 'Hide Photos' : 'View Photos'}
            {contextPhotoCount > 0 && (
              <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] ${
                showPhotoPanel ? 'bg-surface-1/20' : 'bg-harken-blue text-white'
              }`}>
                {contextPhotoCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Add Form Section */}
      <div className="p-4 bg-surface-2 dark:bg-elevation-2/50 border-b border-harken-gray-light">
        {/* Category Selector */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-harken-gray mb-2">Category</label>
          <div className="flex flex-wrap gap-2">
            {MECHANICAL_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id as MechanicalCategory);
                  setSelectedTypeId(null);
                  setShowCustomForm(false);
                  // Update active subsection for photo panel filtering
                  setActiveSubSection(`mechanical_${cat.id}`);
                }}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-accent-cyan text-white border-accent-cyan'
                    : 'bg-surface-1 dark:bg-elevation-1 text-harken-gray dark:text-slate-300 border-light-border dark:border-dark-border hover:border-accent-cyan hover:text-accent-cyan'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Type Selector */}
        {selectedCategory && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-medium text-harken-gray dark:text-slate-400">
                Type ({MECHANICAL_CATEGORIES.find(c => c.id === selectedCategory)?.label})
              </label>
              {effectivePropertyType && (
                <span className="flex items-center gap-1 text-xs text-harken-blue">
                  <Sparkles size={12} />
                  Filtered for {effectivePropertyType}
                  {isOverridden && <span className="text-harken-gray-med">(override)</span>}
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
                        ? 'bg-accent-cyan text-white border-accent-cyan'
                        : 'bg-surface-1 dark:bg-elevation-1 text-harken-gray dark:text-slate-300 border-light-border dark:border-dark-border hover:border-accent-cyan hover:text-accent-cyan'
                    }`}
                  >
                    {isCustom && <Star size={12} className="text-accent-amber-gold-hover" />}
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
                      ? 'bg-harken-gray-light dark:bg-elevation-2 text-harken-gray dark:text-slate-300 border-light-border dark:border-dark-border'
                      : 'bg-surface-1 dark:bg-elevation-1 text-harken-gray-med dark:text-slate-400 border-light-border dark:border-dark-border hover:border-accent-cyan hover:text-accent-cyan'
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
                  setCustomDefaultLife('20');
                  setSaveForFuture(false);
                }}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-all flex items-center gap-1 ${
                  showCustomForm
                    ? 'bg-accent-cyan text-white border-accent-cyan'
                    : 'bg-surface-1 dark:bg-elevation-1 text-harken-gray dark:text-slate-300 border-light-border dark:border-dark-border hover:border-accent-cyan hover:text-accent-cyan'
                }`}
              >
                <Plus size={12} />
                Custom
              </button>
            </div>
            
            {/* Other Options Expanded */}
            {showOtherOptions && otherTypes.length > 0 && (
              <div className="mt-2 pt-2 border-t border-light-border dark:border-dark-border">
                <div className="text-xs text-harken-gray-med mb-2">Other Options</div>
                <div className="flex flex-wrap gap-2">
                  {otherTypes.map(type => (
                    <button
                      key={type.id}
                      onClick={() => handleTypeSelect(type.id)}
                      className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-all ${
                        selectedTypeId === type.id && !showCustomForm
                          ? 'bg-accent-cyan text-white border-accent-cyan'
                          : 'bg-harken-gray-light dark:bg-elevation-2 text-harken-gray dark:text-slate-300 border-light-border dark:border-dark-border hover:border-accent-cyan hover:text-accent-cyan'
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
          <div className="mb-4 p-3 bg-surface-1 rounded-lg border border-harken-blue/30 border-dashed">
            <div className="flex items-center gap-2 mb-3 text-sm text-harken-gray dark:text-slate-400">
              <Plus size={14} className="text-harken-blue" />
              <span>Add custom type to <strong>{MECHANICAL_CATEGORIES.find(c => c.id === selectedCategory)?.label}</strong></span>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs font-medium text-harken-gray mb-1">
                  Custom System Name
                </label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-light-border rounded-lg focus:ring-2 focus:ring-harken-blue focus:border-transparent"
                  placeholder="e.g., Geothermal Heat Pump"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-harken-gray mb-1 flex items-center gap-1">
                  Economic Life (yrs)
                  <span 
                    className="inline-flex items-center cursor-help"
                    title={`Typical range: ${ECONOMIC_LIFE_GUIDE.mechanical[selectedCategory]?.range || '15-40 yrs'}`}
                  >
                    <HelpCircle size={12} className="text-harken-gray-med" />
                  </span>
                </label>
                <input
                  type="number"
                  value={customDefaultLife}
                  onChange={(e) => setCustomDefaultLife(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-light-border rounded-lg focus:ring-2 focus:ring-harken-blue focus:border-transparent"
                  min="1"
                  max="100"
                />
              </div>
            </div>
            
            {/* Economic Life Guide */}
            <div className="mb-3 p-2 bg-surface-2 dark:bg-elevation-2 rounded-lg border border-light-border dark:border-dark-border">
              <div className="flex items-start gap-2">
                <Calculator size={14} className="text-harken-blue mt-0.5 flex-shrink-0" />
                <div className="text-xs text-harken-gray dark:text-slate-400">
                  <div className="font-medium text-harken-gray mb-1">
                    Economic Life Guide for {MECHANICAL_CATEGORIES.find(c => c.id === selectedCategory)?.label}
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1">
                    <span><strong>Range:</strong> {ECONOMIC_LIFE_GUIDE.mechanical[selectedCategory]?.range || '15-40 yrs'}</span>
                    <span><strong>Typical:</strong> {ECONOMIC_LIFE_GUIDE.mechanical[selectedCategory]?.typical || 20} yrs</span>
                  </div>
                  <div className="mt-1 text-harken-gray-med italic">
                    {ECONOMIC_LIFE_GUIDE.mechanical[selectedCategory]?.examples || 'Varies by type'}
                  </div>
                  <button
                    type="button"
                    onClick={() => setCustomDefaultLife(String(ECONOMIC_LIFE_GUIDE.mechanical[selectedCategory]?.typical || 20))}
                    className="mt-1.5 text-harken-blue hover:text-harken-blue/80 font-medium underline"
                  >
                    Use typical ({ECONOMIC_LIFE_GUIDE.mechanical[selectedCategory]?.typical || 20} yrs)
                  </button>
                </div>
              </div>
            </div>
            
            <label className="flex items-center gap-2 text-sm text-harken-gray cursor-pointer">
              <input
                type="checkbox"
                checked={saveForFuture}
                onChange={(e) => setSaveForFuture(e.target.checked)}
                className="rounded border-light-border text-harken-blue focus:ring-harken-blue"
              />
              <Star size={14} className="text-accent-amber-gold-hover" />
              Save to My System Types (for future appraisals)
            </label>
          </div>
        )}

        {/* Quick Add Form */}
        {(selectedTypeId || showCustomForm) && (
          <div className="p-3 bg-surface-1 rounded-lg border border-light-border dark:border-dark-border">
            <div className="grid grid-cols-4 gap-3 mb-3">
              <div>
                <label className="block text-xs font-medium text-harken-gray mb-1 flex items-center gap-1">
                  <Calendar size={12} />
                  Year Installed
                </label>
                <select
                  value={yearInstalled}
                  onChange={(e) => setYearInstalled(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-light-border dark:border-harken-gray rounded-lg focus:ring-2 focus:ring-harken-blue focus:border-transparent bg-surface-1 dark:bg-elevation-1 dark:text-white"
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
                <label className="block text-xs font-medium text-harken-gray mb-1">Qty</label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-light-border rounded-lg focus:ring-2 focus:ring-harken-blue focus:border-transparent"
                  placeholder="1"
                  min="1"
                />
              </div>
              {showCapacityField && (
                <div>
                  <label className="block text-xs font-medium text-harken-gray mb-1">Capacity</label>
                  <input
                    type="text"
                    value={unitCapacity}
                    onChange={(e) => setUnitCapacity(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-light-border rounded-lg focus:ring-2 focus:ring-harken-blue focus:border-transparent"
                    placeholder="5 ton"
                  />
                </div>
              )}
              <div className="flex items-end">
                <button
                  onClick={addToInventory}
                  disabled={!canAdd}
                  className={`w-full flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    canAdd
                      ? 'bg-harken-blue text-white hover:bg-harken-blue/90'
                      : 'bg-harken-gray-light text-harken-gray-med cursor-not-allowed'
                  }`}
                >
                  <Plus size={14} />
                  Add
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-harken-gray mb-1">
                  Economic Life (yrs)
                </label>
                <input
                  type="number"
                  value={customEconomicLife}
                  onChange={(e) => setCustomEconomicLife(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-light-border rounded-lg focus:ring-2 focus:ring-harken-blue focus:border-transparent"
                  placeholder={selectedType?.defaultEconomicLife?.toString() || '20'}
                  min="1"
                  max="100"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-harken-gray mb-1.5">Condition</label>
                <div className="flex gap-1">
                  {CONDITION_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setCondition(opt.value)}
                      className={`flex-1 px-1.5 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                        condition === opt.value
                          ? opt.color
                          : 'bg-surface-1 text-harken-gray-med border-light-border hover:border-light-border'
                      }`}
                    >
                      {opt.abbrev}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Inventory Section */}
      <div className="p-4">
        {/* Inventory Header */}
        {allComponents.length > 0 && (
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-harken-gray-light">
            <div className="flex items-center gap-2 text-sm">
              <Calculator size={14} className="text-harken-gray-med" />
              <span className="font-medium text-harken-gray">Systems ({totals.count} items)</span>
            </div>
          </div>
        )}

        {/* Inventory Items by Category */}
        {MECHANICAL_CATEGORIES.map(category => {
          const detailsKey = getDetailsKey(category.id as MechanicalCategory);
          const categoryComponents = (systems?.[detailsKey] as ComponentDetail[] | undefined) || [];
          
          if (categoryComponents.length === 0) return null;
          
          return (
            <div key={category.id} className="mb-4">
              <div className="text-xs font-semibold text-harken-gray-med uppercase tracking-wider mb-2">
                {category.label}
              </div>
              <div className="space-y-2">
                {categoryComponents.map((component) => {
                  const depreciationPct = calculateDepreciationPercent(
                    component.effectiveAge || 0, 
                    component.economicLife || 20
                  );
                  const isCustom = isCustomType(component.type);
                  const isExpanded = expandedItems.has(component.id);
                  const hasNotes = component.notes && component.notes.trim().length > 0;
                  
                  return (
                    <div
                      key={component.id}
                      className="bg-surface-2 dark:bg-elevation-2 rounded-lg border border-light-border dark:border-dark-border hover:border-light-border dark:border-dark-border transition-colors overflow-hidden"
                    >
                      {/* Main Row */}
                      <div className="flex items-center gap-3 p-3">
                        {/* Expand/Collapse Button */}
                        <button
                          onClick={() => toggleExpanded(component.id)}
                          className={`p-1 rounded transition-colors flex-shrink-0 ${
                            hasNotes ? 'text-harken-blue hover:bg-harken-blue/10' : 'text-harken-gray-med hover:bg-harken-gray-light'
                          }`}
                          title={isExpanded ? 'Collapse notes' : 'Add/view notes'}
                        >
                          {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        </button>

                        {/* Type Name */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            {isCustom && <Star size={12} className="text-accent-amber-gold-hover flex-shrink-0" />}
                            <span className="font-medium text-sm text-harken-dark dark:text-white truncate">
                              {component.type}
                            </span>
                            {hasNotes && !isExpanded && (
                              <span title="Has notes">
                                <FileText size={12} className="text-harken-blue flex-shrink-0" />
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Year */}
                        <div className="text-sm text-harken-gray-med whitespace-nowrap w-12 text-center">
                          {component.yearInstalled || '—'}
                        </div>

                        {/* Economic Life */}
                        <div className="text-xs text-harken-gray-med whitespace-nowrap">
                          {component.economicLife || 20}yr
                        </div>

                        {/* Condition Badge */}
                        <div className={`px-2 py-0.5 text-xs font-medium rounded ${
                          CONDITION_OPTIONS.find(c => c.value === component.condition)?.color || 'bg-harken-gray-light text-harken-gray'
                        }`}>
                          {CONDITION_OPTIONS.find(c => c.value === component.condition)?.abbrev || 'Avg'}
                        </div>

                        {/* Depreciation */}
                        <div 
                          className={`px-2 py-0.5 text-xs font-medium rounded whitespace-nowrap cursor-help ${
                            depreciationPct >= 75 ? 'bg-accent-red-light text-harken-error' :
                            depreciationPct >= 50 ? 'bg-accent-amber-gold-light text-accent-amber-gold' :
                            depreciationPct > 0 ? 'bg-lime-100 text-lime-700' :
                            'bg-harken-gray-light text-harken-gray-med'
                          }`}
                          title={`Depreciation: ${depreciationPct}% | Economic Life: ${component.economicLife || 20} yrs | Effective Age: ${component.effectiveAge || 0} yrs`}
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
                          onClick={() => removeComponent(component.id, category.id as MechanicalCategory)}
                          className="p-1 text-harken-gray-med hover:text-harken-error hover:bg-accent-red-light rounded transition-colors flex-shrink-0"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      {/* Expanded Details Section */}
                      {isExpanded && (
                        <div className="px-3 pb-3 pt-0">
                          <div className="ml-7 border-l-2 border-harken-blue/20 pl-3 space-y-4">
                            {/* Depreciation Override */}
                            <div className="space-y-2">
                              <div className="flex items-center gap-3">
                                <div className="text-sm">
                                  <span className="text-slate-500 dark:text-slate-400">Depreciation:</span>
                                  <span className={`ml-2 font-semibold ${component.depreciationOverride !== undefined ? 'text-accent-amber-gold' : 'text-slate-700'}`}>
                                    {component.depreciationOverride !== undefined ? component.depreciationOverride : depreciationPct}%
                                  </span>
                                  {component.depreciationOverride !== undefined && (
                                    <span className="ml-1 text-xs text-accent-amber-gold">(override)</span>
                                  )}
                                </div>
                                
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (component.depreciationOverride !== undefined) {
                                      updateComponent(component.id, category.id as MechanicalCategory, { 
                                        depreciationOverride: undefined, 
                                        depreciationOverrideReason: undefined 
                                      });
                                    } else {
                                      updateComponent(component.id, category.id as MechanicalCategory, { 
                                        depreciationOverride: depreciationPct 
                                      });
                                    }
                                  }}
                                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium transition-all ${
                                    component.depreciationOverride !== undefined
                                      ? 'border-accent-amber-gold/30 bg-accent-amber-gold-light text-accent-amber-gold'
                                      : 'border-light-border dark:border-dark-border text-slate-400 hover:border-border-muted dark:hover:border-dark-border-muted hover:text-slate-500'
                                  }`}
                                >
                                  <PenLine className="w-3 h-3" />
                                  Override
                                </button>
                              </div>
                              
                              {component.depreciationOverride !== undefined && (
                                <div className="p-3 bg-accent-amber-gold-light rounded-lg border border-accent-amber-gold-light space-y-3">
                                  <div className="flex items-center gap-2">
                                    <label className="text-xs font-medium text-accent-amber-gold">Override %</label>
                                    <input
                                      type="number"
                                      min="0"
                                      max="100"
                                      className="w-20 px-3 py-1.5 border border-accent-amber-gold-light rounded-lg text-sm focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                                      value={component.depreciationOverride}
                                      onChange={(e) => updateComponent(component.id, category.id as MechanicalCategory, { 
                                        depreciationOverride: e.target.value ? Number(e.target.value) : 0 
                                      })}
                                    />
                                    <span className="text-xs text-accent-amber-gold">
                                      (calculated: {depreciationPct}%)
                                    </span>
                                  </div>
                                  <EnhancedTextArea
                                    label="Override Reason"
                                    value={component.depreciationOverrideReason || ''}
                                    onChange={(v) => updateComponent(component.id, category.id as MechanicalCategory, { depreciationOverrideReason: v })}
                                    placeholder="Explain the rationale for this depreciation override..."
                                    sectionContext="depreciation_override"
                                    rows={3}
                                  />
                                </div>
                              )}
                            </div>
                            
                            {/* Notes */}
                            <ExpandableNote
                              id={`mechanical_${component.id}_notes`}
                              label={`Notes for ${component.type}`}
                              value={component.notes || ''}
                              onChange={(value) => updateComponent(component.id, category.id as MechanicalCategory, { notes: value })}
                              placeholder={`Add notes about this system (condition details, maintenance history, capacity notes...)`}
                              sectionContext="mechanical_component"
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
          <div className="text-center py-6 text-harken-gray-med dark:text-slate-400">
            <p className="text-sm">Select a category above to add mechanical systems</p>
          </div>
        )}
      </div>

      {/* General Notes Section */}
      <div className="p-4 pt-0">
        <ExpandableNote
          id="mechanical_systems_notes"
          label="Mechanical Systems Notes"
          value={generalNotes}
          onChange={handleGeneralNotesChange}
          placeholder="Add general notes about mechanical systems..."
          sectionContext="mechanical_description"
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

