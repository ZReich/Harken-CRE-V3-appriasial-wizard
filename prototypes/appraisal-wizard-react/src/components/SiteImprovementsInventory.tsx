/**
 * SiteImprovementsInventory Component
 * 
 * Redesigned with two-tier button selectors for a gamified UX.
 * No large dropdowns - uses category buttons + type buttons.
 * Includes custom type creation with "save for future" option.
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
  Warehouse,
  FileText,
  HelpCircle,
  PenLine,
} from 'lucide-react';

// Helper function to generate year options for dropdown
const generateYearOptions = (currentYear: number) => {
  const years = [];
  for (let i = currentYear; i >= 1900; i--) {
    years.push({ value: i.toString(), label: i.toString() });
  }
  return years;
};
import {
  getSiteImprovementType,
  getSiteImprovementTypesByCategory,
  SITE_IMPROVEMENT_CATEGORIES,
  type SiteImprovementCategory,
  type PropertyCategory,
  type SiteImprovementType,
} from '../constants/marshallSwift';
import { useCustomSiteTypes } from '../hooks/useCustomSiteTypes';
import ExpandableNote from './ExpandableNote';
import EnhancedTextArea from './EnhancedTextArea';
import type { SiteImprovement, SiteImprovementCondition } from '../types';

// =================================================================
// CONSTANTS
// =================================================================

const CONDITION_OPTIONS: { value: SiteImprovementCondition; label: string; abbrev: string; color: string }[] = [
  { value: 'excellent', label: 'Excellent', abbrev: 'Excl', color: 'bg-green-100 text-green-700 border-green-300' },
  { value: 'good', label: 'Good', abbrev: 'Good', color: 'bg-lime-100 text-lime-700 border-lime-300' },
  { value: 'average', label: 'Average', abbrev: 'Avg', color: 'bg-gray-100 text-gray-700 border-gray-300' },
  { value: 'fair', label: 'Fair', abbrev: 'Fair', color: 'bg-amber-100 text-amber-700 border-amber-300' },
  { value: 'poor', label: 'Poor', abbrev: 'Poor', color: 'bg-red-100 text-red-700 border-red-300' },
];

const UNIT_OPTIONS: { value: 'SF' | 'LF' | 'EA' | 'LS'; label: string; fullName: string }[] = [
  { value: 'SF', label: 'SF', fullName: 'Square Feet' },
  { value: 'LF', label: 'LF', fullName: 'Linear Feet' },
  { value: 'EA', label: 'EA', fullName: 'Each (Count)' },
  { value: 'LS', label: 'LS', fullName: 'Lump Sum' },
];

// All categories (we'll use responsive classes to show/hide the +more button)
const ALL_CATEGORIES = SITE_IMPROVEMENT_CATEGORIES;
// On small screens, show first 7 categories and hide the rest behind +more
const VISIBLE_ON_SMALL = 7;

// Economic life reference guide by category (for custom improvements)
const ECONOMIC_LIFE_GUIDE: Record<SiteImprovementCategory | 'other', { range: string; examples: string; typical: number }> = {
  paving: { range: '5-30 yrs', examples: 'Striping 5, Gravel 10, Asphalt 20, Concrete 30', typical: 20 },
  fencing: { range: '15-40 yrs', examples: 'Wood 15, Chain Link 25, Ornamental 30, Masonry 40', typical: 20 },
  lighting: { range: '15-25 yrs', examples: 'Bollard 15, Pole Light 20, High-Mast 25', typical: 20 },
  landscaping: { range: '10-25 yrs', examples: 'Basic 10, Professional 15, Windbreak 25', typical: 15 },
  structures: { range: '15-40 yrs', examples: 'Shed 15, Deck 20, Carport 25, Garage 40', typical: 25 },
  utilities: { range: '15-35 yrs', examples: 'Irrigation 15, Well 25, Septic 30', typical: 25 },
  signage: { range: '15-20 yrs', examples: 'Building Sign 15, Monument 15, Pylon 20', typical: 15 },
  recreation: { range: '15-30 yrs', examples: 'Above-ground Pool 15, In-ground Pool 25, Tennis Court 30', typical: 25 },
  agricultural: { range: '15-25 yrs', examples: 'Corrals 15, Feed Bunks 20, Scales 25', typical: 20 },
  other: { range: '10-30 yrs', examples: 'Varies by improvement type', typical: 20 },
};

// =================================================================
// HELPER FUNCTIONS
// =================================================================

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 11);
}

function calculateEffectiveAge(yearInstalled: number | null, condition: SiteImprovementCondition): number {
  if (!yearInstalled) return 0;

  const currentYear = new Date().getFullYear();
  const actualAge = currentYear - yearInstalled;

  const conditionMultipliers: Record<SiteImprovementCondition, number> = {
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

// =================================================================
// COMPONENT PROPS
// =================================================================

interface SiteImprovementsInventoryProps {
  improvements: SiteImprovement[];
  onChange: (improvements: SiteImprovement[]) => void;
  /** Property category for filtering recommended site improvements */
  propertyCategory?: PropertyCategory;
}

// =================================================================
// MAIN COMPONENT
// =================================================================

export default function SiteImprovementsInventory({
  improvements,
  onChange,
  propertyCategory,
}: SiteImprovementsInventoryProps) {
  // State for the add form
  const [selectedCategory, setSelectedCategory] = useState<SiteImprovementCategory | 'other' | null>(null);
  const [selectedTypeId, setSelectedTypeId] = useState<string | null>(null);
  const [showMoreCategories, setShowMoreCategories] = useState(false);
  const [showOtherTypes, setShowOtherTypes] = useState(false);
  const [generalNotes, setGeneralNotes] = useState('');

  // Quick add form state
  const [quantity, setQuantity] = useState<string>('');
  const [unit, setUnit] = useState<'SF' | 'LF' | 'EA' | 'LS'>('SF');
  const [yearInstalled, setYearInstalled] = useState<string>('');
  const [condition, setCondition] = useState<SiteImprovementCondition>('average');

  // Custom type state (for inline custom within each category)
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customEconomicLife, setCustomEconomicLife] = useState('20');
  const [saveForFuture, setSaveForFuture] = useState(false);

  // Expanded items state (for individual notes)
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Custom types hook
  const {
    customTypes,
    addCustomType,
    getCustomTypesByCategory,
    toSiteImprovementType,
  } = useCustomSiteTypes();

  // Get types for selected category with recommended/other split
  const { recommendedTypes, otherTypes, allTypes } = useMemo(() => {
    if (!selectedCategory || selectedCategory === 'other') {
      return { recommendedTypes: [], otherTypes: [], allTypes: [] };
    }

    const categoryTypes = getSiteImprovementTypesByCategory(selectedCategory);
    const customTypesForCategory = getCustomTypesByCategory(selectedCategory).map(toSiteImprovementType);
    const allTypesArray = [...categoryTypes, ...customTypesForCategory];

    // If no property category, all are "recommended"
    if (!propertyCategory) {
      return {
        recommendedTypes: allTypesArray,
        otherTypes: [],
        allTypes: allTypesArray,
      };
    }

    // Split into recommended (matching property category) and other
    const recommended: SiteImprovementType[] = [];
    const other: SiteImprovementType[] = [];

    categoryTypes.forEach(type => {
      if (type.applicablePropertyCategories.includes(propertyCategory)) {
        recommended.push(type);
      } else {
        other.push(type);
      }
    });

    // Custom types go to "other" unless they don't have the property restriction
    customTypesForCategory.forEach(type => {
      if (!type.applicablePropertyCategories || type.applicablePropertyCategories.length === 0 ||
        type.applicablePropertyCategories.includes(propertyCategory)) {
        recommended.push(type);
      } else {
        other.push(type);
      }
    });

    return {
      recommendedTypes: recommended,
      otherTypes: other,
      allTypes: allTypesArray,
    };
  }, [selectedCategory, propertyCategory, getCustomTypesByCategory, toSiteImprovementType]);

  // Legacy compatibility - total available types
  const availableTypes = useMemo(() => {
    if (!selectedCategory || selectedCategory === 'other') return [];

    const msTypes = getSiteImprovementTypesByCategory(selectedCategory);
    const customTypesForCategory = getCustomTypesByCategory(selectedCategory).map(toSiteImprovementType);

    return [...msTypes, ...customTypesForCategory];
  }, [selectedCategory, getCustomTypesByCategory, toSiteImprovementType]);

  // Get the selected type details
  const selectedType = useMemo(() => {
    if (!selectedTypeId) return null;

    // Check M&S types first
    const msType = getSiteImprovementType(selectedTypeId);
    if (msType) return msType;

    // Check custom types
    const customType = customTypes.find(t => t.id === selectedTypeId);
    if (customType) return toSiteImprovementType(customType);

    return null;
  }, [selectedTypeId, customTypes, toSiteImprovementType]);

  // Calculate totals
  const totals = useMemo(() => {
    let totalContributory = 0;
    improvements.forEach(imp => {
      totalContributory += imp.contributoryValue || 0;
    });
    return { count: improvements.length, totalContributory };
  }, [improvements]);

  // Reset form
  const resetForm = useCallback(() => {
    setSelectedCategory(null);
    setSelectedTypeId(null);
    setShowCustomForm(false);
    setQuantity('');
    setUnit('SF');
    setYearInstalled('');
    setCondition('average');
    setCustomName('');
    setCustomEconomicLife('20');
    setSaveForFuture(false);
  }, []);

  // Handle type selection - set default unit from type
  const handleTypeSelect = useCallback((typeId: string) => {
    setSelectedTypeId(typeId);
    const type = getSiteImprovementType(typeId) || customTypes.find(t => t.id === typeId);
    if (type) {
      setUnit(type.defaultUnit);
    }
  }, [customTypes]);

  // Add improvement to inventory
  const addToInventory = useCallback(() => {
    let typeId = selectedTypeId || '';
    let typeName = '';
    let economicLife = 20;
    let finalUnit = unit;

    if (showCustomForm && selectedCategory) {
      // Custom type within the selected category
      if (!customName.trim()) return;

      typeName = customName.trim();
      economicLife = parseInt(customEconomicLife) || 20;

      // Save for future if requested
      if (saveForFuture) {
        const newCustomType = addCustomType({
          label: typeName,
          category: selectedCategory as SiteImprovementCategory,
          defaultUnit: unit,
          defaultEconomicLife: economicLife,
        });
        typeId = newCustomType.id;
      } else {
        typeId = `temp-${generateId()}`;
      }
    } else {
      // M&S or saved custom type
      if (!selectedType) return;
      typeId = selectedType.id;
      typeName = selectedType.label;
      economicLife = selectedType.defaultEconomicLife;
      finalUnit = selectedType.defaultUnit;
    }

    const year = yearInstalled ? parseInt(yearInstalled) : null;
    const effectiveAge = calculateEffectiveAge(year, condition);
    const depreciationPct = calculateDepreciationPercent(effectiveAge, economicLife);

    const newImprovement: SiteImprovement = {
      id: generateId(),
      typeId,
      typeName,
      description: '',
      quantity: parseFloat(quantity) || 0,
      unit: finalUnit,
      yearInstalled: year,
      condition,
      economicLife,
      effectiveAge,
      effectiveAgeOverride: false,
      depreciationPercent: depreciationPct,
    };

    onChange([...improvements, newImprovement]);
    resetForm();
    setShowCustomForm(false);
  }, [
    showCustomForm, selectedCategory, selectedTypeId, selectedType,
    quantity, unit, yearInstalled, condition,
    customName, customEconomicLife, saveForFuture,
    addCustomType, improvements, onChange, resetForm
  ]);

  // Remove improvement
  const removeImprovement = useCallback((id: string) => {
    onChange(improvements.filter(i => i.id !== id));
  }, [improvements, onChange]);

  // Update improvement (for notes/description)
  const updateImprovement = useCallback((id: string, updates: Partial<SiteImprovement>) => {
    onChange(improvements.map(i => i.id === id ? { ...i, ...updates } : i));
  }, [improvements, onChange]);

  // Toggle expanded state for individual notes
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
    return customTypes.some(t => t.id === typeId);
  }, [customTypes]);

  // Can add to inventory?
  const canAdd = useMemo(() => {
    if (showCustomForm) {
      return customName.trim().length > 0 && parseFloat(quantity) > 0;
    }
    return selectedTypeId && parseFloat(quantity) > 0;
  }, [showCustomForm, selectedTypeId, customName, quantity]);

  return (
    <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Warehouse className="w-5 h-5 text-[#0da1c7]" />
            <div>
              <h3 className="text-lg font-bold text-[#1c3643] dark:text-white">Site Improvements</h3>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                M&S Section 66 - Itemized with age-life depreciation
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Add Form Section */}
      <div className="p-4 bg-slate-50/50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-700">
        {/* Category Selector */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-2">Category</label>
          <div className="flex flex-wrap gap-2">
            {/* Categories visible on all screens (first 7) */}
            {ALL_CATEGORIES.slice(0, VISIBLE_ON_SMALL).map(cat => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setSelectedTypeId(null);
                  setShowCustomForm(false);
                }}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-all ${selectedCategory === cat.id
                  ? 'bg-[#0da1c7] text-white border-[#0da1c7]'
                  : 'bg-white dark:bg-slate-700 text-gray-700 dark:text-slate-300 border-gray-200 dark:border-slate-600 hover:border-[#0da1c7] dark:hover:border-[#0da1c7] hover:text-[#0da1c7] dark:hover:text-[#0da1c7]'
                  }`}
              >
                {cat.label}
              </button>
            ))}

            {/* Categories hidden on small screens (show as buttons on large, dropdown on small) */}
            {ALL_CATEGORIES.slice(VISIBLE_ON_SMALL).map(cat => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setSelectedTypeId(null);
                  setShowCustomForm(false);
                }}
                className={`hidden xl:block px-3 py-1.5 text-sm font-medium rounded-lg border transition-all ${selectedCategory === cat.id
                  ? 'bg-[#0da1c7] text-white border-[#0da1c7]'
                  : 'bg-white dark:bg-slate-700 text-gray-700 dark:text-slate-300 border-gray-200 dark:border-slate-600 hover:border-[#0da1c7] dark:hover:border-[#0da1c7] hover:text-[#0da1c7] dark:hover:text-[#0da1c7]'
                  }`}
              >
                {cat.label}
              </button>
            ))}

            {/* More categories dropdown - only visible on small screens */}
            {ALL_CATEGORIES.length > VISIBLE_ON_SMALL && (
              <div className="relative xl:hidden">
                <button
                  onClick={() => setShowMoreCategories(!showMoreCategories)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-all flex items-center gap-1 ${ALL_CATEGORIES.slice(VISIBLE_ON_SMALL).some(c => c.id === selectedCategory)
                    ? 'bg-[#0da1c7] text-white border-[#0da1c7]'
                    : 'bg-white dark:bg-slate-700 text-gray-700 dark:text-slate-300 border-gray-200 dark:border-slate-600 hover:border-[#0da1c7] dark:hover:border-[#0da1c7] hover:text-[#0da1c7] dark:hover:text-[#0da1c7]'
                    }`}
                >
                  +{ALL_CATEGORIES.length - VISIBLE_ON_SMALL}
                  <ChevronDown size={14} />
                </button>
                {showMoreCategories && (
                  <div className="absolute top-full left-0 mt-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg z-10 py-1 min-w-[140px]">
                    {ALL_CATEGORIES.slice(VISIBLE_ON_SMALL).map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setSelectedCategory(cat.id);
                          setSelectedTypeId(null);
                          setShowMoreCategories(false);
                          setShowCustomForm(false);
                        }}
                        className={`w-full px-3 py-2 text-sm text-left hover:bg-gray-50 dark:hover:bg-slate-700 ${selectedCategory === cat.id ? 'text-[#0da1c7] font-medium' : 'text-gray-700 dark:text-slate-300'
                          }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Type Selector (shown when category is selected) */}
        {selectedCategory && (
          <div className="mb-4">
            {/* Recommended Types */}
            {recommendedTypes.length > 0 && (
              <>
                <label className="block text-xs font-medium text-gray-600 mb-2">
                  {propertyCategory
                    ? `Recommended for ${propertyCategory === 'commercial' ? 'Commercial' : propertyCategory === 'residential' ? 'Residential' : 'This'} Properties`
                    : `Type (${ALL_CATEGORIES.find(c => c.id === selectedCategory)?.label})`}
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {recommendedTypes.map(type => {
                    const isCustom = type.id.startsWith('custom-');
                    return (
                      <button
                        key={type.id}
                        onClick={() => {
                          handleTypeSelect(type.id);
                          setShowCustomForm(false);
                        }}
                        className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-all flex items-center gap-1 ${selectedTypeId === type.id && !showCustomForm
                          ? 'bg-[#0da1c7] text-white border-[#0da1c7]'
                          : 'bg-white dark:bg-slate-700 text-gray-700 dark:text-slate-300 border-gray-200 dark:border-slate-600 hover:border-[#0da1c7] dark:hover:border-[#0da1c7] hover:text-[#0da1c7] dark:hover:text-[#0da1c7]'
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

            {/* Other Options (collapsible) */}
            {otherTypes.length > 0 && (
              <div className="mb-3">
                <button
                  onClick={() => setShowOtherTypes(!showOtherTypes)}
                  className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 mb-2"
                >
                  {showOtherTypes ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  Other Options ({otherTypes.length})
                </button>

                {showOtherTypes && (
                  <div className="flex flex-wrap gap-2 pl-2 border-l-2 border-gray-200 dark:border-slate-700">
                    {otherTypes.map(type => {
                      const isCustom = type.id.startsWith('custom-');
                      return (
                        <button
                          key={type.id}
                          onClick={() => {
                            handleTypeSelect(type.id);
                            setShowCustomForm(false);
                          }}
                          className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-all flex items-center gap-1 ${selectedTypeId === type.id && !showCustomForm
                            ? 'bg-[#0da1c7] text-white border-[#0da1c7]'
                            : 'bg-white dark:bg-slate-700 text-gray-700 dark:text-slate-300 border-gray-200 dark:border-slate-600 hover:border-[#0da1c7] dark:hover:border-[#0da1c7] hover:text-[#0da1c7] dark:hover:text-[#0da1c7]'
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
            {recommendedTypes.length === 0 && otherTypes.length === 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {availableTypes.map(type => {
                  const isCustom = type.id.startsWith('custom-');
                  return (
                    <button
                      key={type.id}
                      onClick={() => {
                        handleTypeSelect(type.id);
                        setShowCustomForm(false);
                      }}
                      className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-all flex items-center gap-1 ${selectedTypeId === type.id && !showCustomForm
                        ? 'bg-[#0da1c7] text-white border-[#0da1c7]'
                        : 'bg-white dark:bg-slate-700 text-gray-700 dark:text-slate-300 border-gray-200 dark:border-slate-600 hover:border-[#0da1c7] dark:hover:border-[#0da1c7] hover:text-[#0da1c7] dark:hover:text-[#0da1c7]'
                        }`}
                    >
                      {isCustom && <Star size={12} className="text-amber-400" />}
                      {type.label}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Custom button within each category */}
            <button
              onClick={() => {
                setSelectedTypeId(null);
                setShowCustomForm(true);
                setShowOtherTypes(false);
                setCustomName('');
                setCustomEconomicLife('20');
                setSaveForFuture(false);
              }}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-all flex items-center gap-1 ${showCustomForm
                ? 'bg-[#0da1c7] text-white border-[#0da1c7]'
                : 'bg-white dark:bg-slate-700 text-gray-700 dark:text-slate-300 border-gray-200 dark:border-slate-600 hover:border-[#0da1c7] dark:hover:border-[#0da1c7] hover:text-[#0da1c7] dark:hover:text-[#0da1c7]'
                }`}
            >
              <Plus size={12} />
              Custom
            </button>
          </div>
        )}

        {/* Custom Type Form (shown when Custom button is clicked within a category) */}
        {showCustomForm && selectedCategory && (
          <div className="mb-4 p-3 bg-white dark:bg-slate-800 rounded-lg border border-[#0da1c7]/30 border-dashed">
            <div className="flex items-center gap-2 mb-3 text-sm text-gray-600 dark:text-slate-400">
              <Plus size={14} className="text-[#0da1c7]" />
              <span>Add custom type to <strong>{ALL_CATEGORIES.find(c => c.id === selectedCategory)?.label}</strong></span>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Custom Improvement Name
                </label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent"
                  placeholder="e.g., Loading Ramp, Flag Pole"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
                  Economic Life (yrs)
                  <span
                    className="inline-flex items-center cursor-help"
                    title={`Typical range for ${ALL_CATEGORIES.find(c => c.id === selectedCategory)?.label}: ${ECONOMIC_LIFE_GUIDE[selectedCategory as keyof typeof ECONOMIC_LIFE_GUIDE]?.range || '10-30 yrs'}`}
                  >
                    <HelpCircle size={12} className="text-gray-400" />
                  </span>
                </label>
                <input
                  type="number"
                  value={customEconomicLife}
                  onChange={(e) => setCustomEconomicLife(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent"
                  min="1"
                  max="100"
                />
              </div>
            </div>

            {/* Economic Life Calculator / Reference Guide */}
            <div className="mb-3 p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
              <div className="flex items-start gap-2">
                <Calculator size={14} className="text-[#0da1c7] mt-0.5 flex-shrink-0" />
                <div className="text-xs text-gray-600 dark:text-slate-400">
                  <div className="font-medium text-gray-700 dark:text-slate-300 mb-1">
                    Economic Life Guide for {ALL_CATEGORIES.find(c => c.id === selectedCategory)?.label}
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1">
                    <span><strong>Range:</strong> {ECONOMIC_LIFE_GUIDE[selectedCategory as keyof typeof ECONOMIC_LIFE_GUIDE]?.range || '10-30 yrs'}</span>
                    <span><strong>Typical:</strong> {ECONOMIC_LIFE_GUIDE[selectedCategory as keyof typeof ECONOMIC_LIFE_GUIDE]?.typical || 20} yrs</span>
                  </div>
                  <div className="mt-1 text-gray-500 dark:text-slate-500 italic">
                    {ECONOMIC_LIFE_GUIDE[selectedCategory as keyof typeof ECONOMIC_LIFE_GUIDE]?.examples || 'Varies by type'}
                  </div>
                  <button
                    type="button"
                    onClick={() => setCustomEconomicLife(String(ECONOMIC_LIFE_GUIDE[selectedCategory as keyof typeof ECONOMIC_LIFE_GUIDE]?.typical || 20))}
                    className="mt-1.5 text-[#0da1c7] hover:text-[#0da1c7]/80 font-medium underline"
                  >
                    Use typical ({ECONOMIC_LIFE_GUIDE[selectedCategory as keyof typeof ECONOMIC_LIFE_GUIDE]?.typical || 20} yrs)
                  </button>
                </div>
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400 cursor-pointer">
              <input
                type="checkbox"
                checked={saveForFuture}
                onChange={(e) => setSaveForFuture(e.target.checked)}
                className="rounded border-gray-300 text-[#0da1c7] focus:ring-[#0da1c7]"
              />
              <Star size={14} className="text-amber-400" />
              Save to My Improvement Types (for future appraisals)
            </label>
          </div>
        )}

        {/* Quick Add Form (shown when type or custom form is active) */}
        {(selectedTypeId || showCustomForm) && (
          <div className="p-3 bg-white rounded-lg border border-gray-200 dark:border-slate-700">
            <div className="grid grid-cols-4 gap-3 mb-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1">Quantity</label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1">Unit</label>
                <div className="flex gap-1">
                  {UNIT_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setUnit(opt.value)}
                      title={opt.fullName}
                      className={`flex-1 px-2 py-2 text-xs font-medium rounded border transition-all ${unit === opt.value
                        ? 'bg-[#0da1c7] text-white border-[#0da1c7]'
                        : 'bg-white dark:bg-slate-700 text-gray-600 dark:text-slate-300 border-gray-200 dark:border-slate-600 hover:border-gray-300'
                        }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1 flex items-center gap-1">
                  <Calendar size={12} />
                  Year
                </label>
                <select
                  value={yearInstalled}
                  onChange={(e) => setYearInstalled(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent"
                >
                  <option value="">Select year...</option>
                  {generateYearOptions(new Date().getFullYear()).map((year) => (
                    <option key={year.value} value={year.value}>
                      {year.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={addToInventory}
                  disabled={!canAdd}
                  className={`w-full flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${canAdd
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
              <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1.5">Condition</label>
              <div className="flex gap-2">
                {CONDITION_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setCondition(opt.value)}
                    className={`flex-1 px-2 py-1.5 text-xs font-medium rounded-lg border transition-all ${condition === opt.value
                      ? opt.color
                      : 'bg-white dark:bg-slate-700 text-gray-500 dark:text-slate-400 border-gray-200 dark:border-slate-600 hover:border-gray-300'
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
        {improvements.length > 0 && (
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
            <div className="flex items-center gap-2 text-sm">
              <Calculator size={14} className="text-gray-400" />
              <span className="font-medium text-gray-700">Inventory ({totals.count} items)</span>
            </div>
            {totals.totalContributory > 0 && (
              <span className="text-sm text-gray-600 dark:text-slate-400">
                Est. Value: <span className="font-semibold">${totals.totalContributory.toLocaleString()}</span>
              </span>
            )}
          </div>
        )}

        {/* Inventory Items */}
        <div className="space-y-2">
          {improvements.map((improvement) => {
            const depreciationPct = calculateDepreciationPercent(improvement.effectiveAge, improvement.economicLife);
            const isCustom = isCustomType(improvement.typeId);
            const isExpanded = expandedItems.has(improvement.id);
            const hasNotes = improvement.description && improvement.description.trim().length > 0;

            return (
              <div
                key={improvement.id}
                className="bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600 transition-colors overflow-hidden"
              >
                {/* Main Row */}
                <div className="flex items-center gap-3 p-3">
                  {/* Expand/Collapse Button */}
                  <button
                    onClick={() => toggleExpanded(improvement.id)}
                    className={`p-1 rounded transition-colors flex-shrink-0 ${hasNotes ? 'text-[#0da1c7] hover:bg-[#0da1c7]/10' : 'text-gray-400 hover:bg-gray-100'
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
                        {improvement.typeName}
                      </span>
                      {hasNotes && !isExpanded && (
                        <span title="Has notes">
                          <FileText size={12} className="text-[#0da1c7] flex-shrink-0" />
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quantity */}
                  <div className="text-sm text-gray-600 whitespace-nowrap">
                    {improvement.quantity.toLocaleString()} {improvement.unit}
                  </div>

                  {/* Year */}
                  <div className="text-sm text-gray-500 whitespace-nowrap w-12 text-center">
                    {improvement.yearInstalled || '—'}
                  </div>

                  {/* Condition Badge */}
                  <div className={`px-2 py-0.5 text-xs font-medium rounded ${CONDITION_OPTIONS.find(c => c.value === improvement.condition)?.color || 'bg-gray-100 text-gray-600'
                    }`}>
                    {CONDITION_OPTIONS.find(c => c.value === improvement.condition)?.abbrev || improvement.condition}
                  </div>

                  {/* Depreciation */}
                  <div
                    className={`px-2 py-0.5 text-xs font-medium rounded whitespace-nowrap cursor-help ${depreciationPct >= 75 ? 'bg-red-100 text-red-700' :
                      depreciationPct >= 50 ? 'bg-amber-100 text-amber-700' :
                        depreciationPct > 0 ? 'bg-lime-100 text-lime-700' :
                          'bg-gray-100 text-gray-500'
                      }`}
                    title={`Depreciation: ${depreciationPct}% | Economic Life: ${improvement.economicLife} yrs | Effective Age: ${improvement.effectiveAge} yrs`}
                  >
                    {depreciationPct}%
                  </div>

                  {/* Status */}
                  {improvement.typeId && improvement.quantity > 0 && improvement.yearInstalled ? (
                    <CheckCircle2 size={16} className="text-lime-500 flex-shrink-0" />
                  ) : (
                    <div className="w-4" />
                  )}

                  {/* Delete Button */}
                  <button
                    onClick={() => removeImprovement(improvement.id)}
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
                            <span className={`ml-2 font-semibold ${improvement.depreciationOverride !== undefined ? 'text-amber-600' : 'text-slate-700'}`}>
                              {improvement.depreciationOverride !== undefined ? improvement.depreciationOverride : depreciationPct}%
                            </span>
                            {improvement.depreciationOverride !== undefined && (
                              <span className="ml-1 text-xs text-amber-500">(override)</span>
                            )}
                          </div>

                          {/* Toggle pill - not a checkbox */}
                          <button
                            type="button"
                            onClick={() => {
                              if (improvement.depreciationOverride !== undefined) {
                                // Turn off override
                                updateImprovement(improvement.id, {
                                  depreciationOverride: undefined,
                                  depreciationOverrideReason: undefined
                                });
                              } else {
                                // Turn on override with current calculated value
                                updateImprovement(improvement.id, {
                                  depreciationOverride: depreciationPct
                                });
                              }
                            }}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium transition-all ${improvement.depreciationOverride !== undefined
                              ? 'border-amber-400 bg-amber-50 text-amber-700'
                              : 'border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-500'
                              }`}
                          >
                            <PenLine className="w-3 h-3" />
                            Override
                          </button>
                        </div>

                        {/* Override inputs - slide open when active */}
                        {improvement.depreciationOverride !== undefined && (
                          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 space-y-3">
                            <div className="flex items-center gap-2">
                              <label className="text-xs font-medium text-amber-700">Override %</label>
                              <input
                                type="number"
                                min="0"
                                max="100"
                                className="w-20 px-3 py-1.5 border border-amber-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                                value={improvement.depreciationOverride}
                                onChange={(e) => updateImprovement(improvement.id, {
                                  depreciationOverride: e.target.value ? Number(e.target.value) : 0
                                })}
                              />
                              <span className="text-xs text-amber-600">
                                (calculated: {depreciationPct}%)
                              </span>
                            </div>
                            <EnhancedTextArea
                              label="Override Reason"
                              value={improvement.depreciationOverrideReason || ''}
                              onChange={(v) => updateImprovement(improvement.id, { depreciationOverrideReason: v })}
                              placeholder="Explain the rationale for this depreciation override..."
                              sectionContext="depreciation_override"
                              rows={3}
                            />
                          </div>
                        )}
                      </div>

                      {/* Notes */}
                      <ExpandableNote
                        id={`site_improvement_${improvement.id}_notes`}
                        label={`Notes for ${improvement.typeName}`}
                        value={improvement.description || ''}
                        onChange={(value) => updateImprovement(improvement.id, { description: value })}
                        placeholder={`Add notes about this ${improvement.typeName.toLowerCase()} (condition details, recent repairs, quality observations...)`}
                        sectionContext="site_improvements"
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {improvements.length === 0 && !selectedCategory && (
          <div className="text-center py-6 text-gray-500 dark:text-slate-400">
            <p className="text-sm">Select a category above to add site improvements</p>
          </div>
        )}
      </div>

      {/* Notes Section */}
      <div className="p-4 pt-0">
        <ExpandableNote
          id="site_improvements_notes"
          label="Site Improvements Notes"
          value={generalNotes}
          onChange={setGeneralNotes}
          placeholder="Add general notes about site improvements..."
          sectionContext="site_improvements"
        />
      </div>
    </div>
  );
}
