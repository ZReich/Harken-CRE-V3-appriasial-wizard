import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Plus, Trash2, ArrowUpRight, ArrowDownRight, Minus, MapPin, Activity, ChevronDown, PenLine, ChevronUp, Map as MapIcon } from 'lucide-react';
import { LandComp } from '../types';
import { 
  MOCK_LAND_COMPS, 
  SUBJECT_PROPERTY, 
  TRANSACTION_DATA_ROWS,
  TRANSACTION_ADJ_ROWS,
  QUALITATIVE_ROWS,
  AvailableElement,
  formatCurrency, 
  formatNumber 
} from '../constants';
import { HorizontalScrollIndicator } from '../../../components/HorizontalScrollIndicator';
import EnhancedTextArea from '../../../components/EnhancedTextArea';
import { useWizard } from '../../../context/WizardContext';
import { getAvailableElements as filterElements, normalizeSection } from '../../../utils/elementFilter';
import type { SectionType } from '../../../constants/elementRegistry';
import type { LandValuationData } from '../../../types';
import { ComparableMapPreview } from '../../../components/ComparableMapPreview';

// Grid column widths
const LABEL_COL_WIDTH = 160;
const SUBJECT_COL_WIDTH = 180;
const COMP_COL_WIDTH = 170;
const ACTION_COL_WIDTH = 160;

export const LandSalesGrid: React.FC = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { state: wizardState, setLandValuationData } = useWizard();
  const { propertyType, propertySubtype, scenarios, activeScenarioId, landValuationData } = wizardState;
  const currentScenario = scenarios.find(s => s.id === activeScenarioId)?.name;
  
  const [comps, setComps] = useState<LandComp[]>(MOCK_LAND_COMPS);
  const [transactionRows, setTransactionRows] = useState(TRANSACTION_DATA_ROWS);
  const [adjustmentRows, setAdjustmentRows] = useState(TRANSACTION_ADJ_ROWS);
  const [qualitativeRows, setQualitativeRows] = useState(QUALITATIVE_ROWS);
  const [activePopover, setActivePopover] = useState<{rowId: string, compId: string} | null>(null);
  const [openElementDropdown, setOpenElementDropdown] = useState<'transaction' | 'adjustments' | 'qualitative' | null>(null);
  
  // Notes section - load from context if available
  const [notesText, setNotesText] = useState(landValuationData?.reconciliationText ?? '');
  
  // Custom elements saved by user for future use
  const [customTransactionElements, setCustomTransactionElements] = useState<AvailableElement[]>([]);
  const [customAdjustmentElements, setCustomAdjustmentElements] = useState<AvailableElement[]>([]);
  const [customQualitativeElements, setCustomQualitativeElements] = useState<AvailableElement[]>([]);

  // Calculate total grid width (including action column) - prefixed with underscore as reserved for future use
  const _totalGridWidth = LABEL_COL_WIDTH + SUBJECT_COL_WIDTH + (comps.length * COMP_COL_WIDTH) + ACTION_COL_WIDTH;
  void _totalGridWidth; // Reserved for future use

  // Calculate concluded land values
  const getAdjustedPricePerAcreCalc = (comp: LandComp) => {
    const adjustment = comp.adjustment || 0;
    return comp.pricePerAcre * (1 + adjustment / 100);
  };

  const concludedPricePerAcre = useMemo(() => {
    if (comps.length === 0) return null;
    return comps.reduce((acc, c) => acc + getAdjustedPricePerAcreCalc(c), 0) / comps.length;
  }, [comps]);

  const concludedLandValue = useMemo(() => {
    if (concludedPricePerAcre === null) return null;
    return Math.round(concludedPricePerAcre * SUBJECT_PROPERTY.landAcres);
  }, [concludedPricePerAcre]);

  // Persist land valuation data to WizardContext
  useEffect(() => {
    const dataToSave: LandValuationData = {
      landComps: comps.map(c => ({
        id: c.id,
        address: c.address,
        saleDate: c.dateSold,
        salePrice: c.salePrice,
        acreage: c.landAcres,
        pricePerAcre: c.pricePerAcre,
        zoning: c.zoning,
        adjustments: { overall: c.adjustment || 0 },
        adjustedPricePerAcre: getAdjustedPricePerAcreCalc(c),
      })),
      subjectAcreage: SUBJECT_PROPERTY.landAcres,
      concludedPricePerAcre,
      concludedLandValue,
      reconciliationText: notesText,
    };
    setLandValuationData(dataToSave);
  }, [comps, notesText, concludedPricePerAcre, concludedLandValue, setLandValuationData]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (activePopover && !target.closest('.adjustment-popover')) {
        setActivePopover(null);
      }
      if (openElementDropdown && !target.closest('.element-dropdown')) {
        setOpenElementDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activePopover, openElementDropdown]);

  const handleDeleteComp = (compId: string) => {
    if (window.confirm('Are you sure you want to remove this land sale?')) {
      setComps(prev => prev.filter(c => c.id !== compId));
    }
  };

  const handleUpdateComp = (compId: string, field: keyof LandComp, value: any) => {
    setComps(prev => prev.map(c => 
      c.id === compId ? { ...c, [field]: value } : c
    ));
  };

  // Add an element from the available elements dropdown
  const handleAddElement = (section: 'transaction' | 'adjustments' | 'qualitative', element: AvailableElement) => {
    const newRow = { 
      id: element.id, 
      label: element.label + ':', 
      section: section, 
      removable: true 
    };
    
    if (section === 'transaction') {
      // Check if already exists
      if (transactionRows.some(r => r.id === element.id)) return;
      setTransactionRows(prev => [...prev, newRow]);
    } else if (section === 'adjustments') {
      if (adjustmentRows.some(r => r.id === element.id)) return;
      setAdjustmentRows(prev => [...prev, newRow]);
    } else {
      if (qualitativeRows.some(r => r.id === element.id)) return;
      setQualitativeRows(prev => [...prev, newRow]);
    }
    setOpenElementDropdown(null);
  };

  // Add a custom element with user-typed name and save for future use
  const handleAddCustomElement = (section: 'transaction' | 'adjustments' | 'qualitative') => {
    const name = prompt('Enter element name:');
    if (!name) return;
    const newId = name.toLowerCase().replace(/\s+/g, '_') + '_custom';
    const newRow = { 
      id: newId, 
      label: name + ':', 
      section: section, 
      removable: true 
    };
    
    // Create the custom element to save for future use
    const customElement: AvailableElement = {
      id: newId,
      label: name,
      description: 'Custom element'
    };
    
    if (section === 'transaction') {
      setTransactionRows(prev => [...prev, newRow]);
      // Save to custom elements if not already there
      setCustomTransactionElements(prev => 
        prev.some(e => e.id === newId) ? prev : [...prev, customElement]
      );
    } else if (section === 'adjustments') {
      setAdjustmentRows(prev => [...prev, newRow]);
      setCustomAdjustmentElements(prev => 
        prev.some(e => e.id === newId) ? prev : [...prev, customElement]
      );
    } else {
      setQualitativeRows(prev => [...prev, newRow]);
      setCustomQualitativeElements(prev => 
        prev.some(e => e.id === newId) ? prev : [...prev, customElement]
      );
    }
    setOpenElementDropdown(null);
  };

  // Get available elements for a section (excluding already added, including custom)
  // Uses dynamic filtering based on property type, subtype, approach, section, and scenario
  const getAvailableElements = (section: 'transaction' | 'adjustments' | 'qualitative') => {
    const existingIds = section === 'transaction' 
      ? transactionRows.map(r => r.id)
      : section === 'adjustments'
        ? adjustmentRows.map(r => r.id)
        : qualitativeRows.map(r => r.id);
    
    // Map section names to registry format
    const sectionMap: Record<string, SectionType> = {
      'transaction': 'transaction',
      'adjustments': 'quantitative',  // Land uses quantitative adjustments
      'qualitative': 'qualitative'
    };
    const normalizedSection = sectionMap[section] || normalizeSection(section) as SectionType;
    
    // Filter elements based on current context
    const filteredElements = filterElements({
      section: normalizedSection,
      propertyType: propertyType || 'land',  // Default to land for this grid
      subtype: propertySubtype,
      approach: 'land_valuation',
      scenario: currentScenario,
      excludeKeys: existingIds
    });
    
    // Map to the format expected by this grid (id instead of key)
    const baseElements: AvailableElement[] = filteredElements.map(el => ({
      id: el.key,
      label: el.label
    }));
    
    // Add custom elements for this section
    const customElements = section === 'transaction'
      ? customTransactionElements
      : section === 'adjustments'
        ? customAdjustmentElements
        : customQualitativeElements;
    
    // Combine and filter out already added
    const allElements = [...baseElements, ...customElements];
    return allElements.filter(el => !existingIds.includes(el.id));
  };

  const handleDeleteRow = (rowId: string, section: 'transaction' | 'adjustments' | 'qualitative') => {
    if (section === 'transaction') {
      setTransactionRows(prev => prev.filter(r => r.id !== rowId));
    } else if (section === 'adjustments') {
      setAdjustmentRows(prev => prev.filter(r => r.id !== rowId));
    } else {
      setQualitativeRows(prev => prev.filter(r => r.id !== rowId));
    }
  };

  const getAdjustedPricePerAcre = (comp: LandComp) => {
    const adjustment = comp.adjustment || 0;
    return comp.pricePerAcre * (1 + adjustment / 100);
  };

  const getTransactionValue = (comp: LandComp, rowId: string) => {
    switch (rowId) {
      case 'dateSold': return comp.dateSold;
      case 'location': return comp.address;
      case 'cityState': return comp.cityStateZip;
      case 'hbuUse': return comp.hbuUse;
      case 'irrigation': return comp.irrigation;
      case 'utilities': return comp.utilities;
      case 'topography': return comp.topography;
      case 'zoning': return comp.zoning;
      case 'salePrice': return formatCurrency(comp.salePrice);
      case 'sizeAcres': return formatNumber(comp.landAcres, 2);
      case 'priceAcre': return formatCurrency(comp.pricePerAcre);
      default: return '-';
    }
  };

  const getSubjectTransactionValue = (rowId: string) => {
    switch (rowId) {
      case 'dateSold': return 'Current';
      case 'location': return SUBJECT_PROPERTY.address;
      case 'cityState': return SUBJECT_PROPERTY.cityState;
      case 'hbuUse': return SUBJECT_PROPERTY.hbuUse;
      case 'irrigation': return SUBJECT_PROPERTY.irrigation;
      case 'utilities': return SUBJECT_PROPERTY.utilities;
      case 'topography': return SUBJECT_PROPERTY.topography;
      case 'zoning': return SUBJECT_PROPERTY.zoning;
      case 'salePrice': return 'N/A';
      case 'sizeAcres': return formatNumber(SUBJECT_PROPERTY.landAcres, 3);
      case 'priceAcre': return 'N/A';
      default: return '-';
    }
  };

  const getSubjectAdjustmentValue = (rowId: string) => {
    switch (rowId) {
      case 'propRights': return SUBJECT_PROPERTY.propRights;
      case 'financing': return SUBJECT_PROPERTY.financing;
      case 'condSale': return SUBJECT_PROPERTY.condSale;
      case 'marketCond': return 'Current';
      case 'adjustment': return '-';
      case 'adjPriceAcre': return 'N/A';
      default: return '-';
    }
  };

  const getSubjectQualitativeValue = (rowId: string) => {
    switch (rowId) {
      case 'locationAdj': return SUBJECT_PROPERTY.locationQuality;
      case 'irrigationAdj': return SUBJECT_PROPERTY.irrigation;
      case 'utilitiesAdj': return SUBJECT_PROPERTY.utilities;
      case 'topographyAdj': return SUBJECT_PROPERTY.topography;
      case 'sizeAdj': return formatNumber(SUBJECT_PROPERTY.landAcres, 3);
      case 'zoningAdj': return SUBJECT_PROPERTY.zoning;
      default: return '-';
    }
  };

  // Click-to-cycle adjustment chip - cycles through Similar → Superior → Inferior
  const cycleAdjustmentValue = (currentValue: string): string => {
    const cycle = ['Similar', 'Superior', 'Inferior'];
    const currentIndex = cycle.indexOf(currentValue);
    const nextIndex = (currentIndex + 1) % cycle.length;
    return cycle[nextIndex];
  };

  // Adjustment Chip Component - click to cycle through values
  const AdjustmentChip = ({ compId, rowId }: { compId: string, rowId: string }) => {
    const comp = comps.find(c => c.id === compId);
    const currentValue = comp?.[rowId as keyof LandComp] as string || 'Similar';
    
    const handleClick = () => {
      const nextValue = cycleAdjustmentValue(currentValue);
      handleUpdateComp(compId, rowId as keyof LandComp, nextValue);
    };

    const isSup = currentValue === 'Superior';
    const isInf = currentValue === 'Inferior';
    const baseClass = `inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide border shadow-sm transition-all cursor-pointer select-none active:scale-95`;
    
    if (isSup) return (
      <span 
        onClick={handleClick} 
        className={`${baseClass} bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300`}
        title="Click to change"
      >
        <ArrowUpRight className="w-3 h-3" /> SUP
      </span>
    );
    if (isInf) return (
      <span 
        onClick={handleClick} 
        className={`${baseClass} bg-red-50 text-red-700 border-red-200 hover:bg-red-100 hover:border-red-300`}
        title="Click to change"
      >
        <ArrowDownRight className="w-3 h-3" /> INF
      </span>
    );
    return (
      <span 
        onClick={handleClick} 
        className={`${baseClass} bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100 hover:border-slate-300`}
        title="Click to change"
      >
        <Minus className="w-3 h-3" /> SIM
      </span>
    );
  };

  // Market Conditions Chip - click to cycle (same as qualitative adjustments)
  const MarketCondChip = ({ comp }: { comp: LandComp }) => {
    const currentValue = comp.marketCond;
    
    const handleClick = () => {
      const nextValue = cycleAdjustmentValue(currentValue);
      handleUpdateComp(comp.id, 'marketCond', nextValue as 'Similar' | 'Superior' | 'Inferior');
    };

    const isSup = currentValue === 'Superior';
    const isInf = currentValue === 'Inferior';
    const baseClass = `inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide border shadow-sm transition-all cursor-pointer select-none active:scale-95`;
    
    if (isSup) return (
      <span 
        onClick={handleClick} 
        className={`${baseClass} bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300`}
        title="Click to change"
      >
        <ArrowUpRight className="w-3 h-3" /> SUP
      </span>
    );
    if (isInf) return (
      <span 
        onClick={handleClick} 
        className={`${baseClass} bg-red-50 text-red-700 border-red-200 hover:bg-red-100 hover:border-red-300`}
        title="Click to change"
      >
        <ArrowDownRight className="w-3 h-3" /> INF
      </span>
    );
    return (
      <span 
        onClick={handleClick} 
        className={`${baseClass} bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100 hover:border-slate-300`}
        title="Click to change"
      >
        <Minus className="w-3 h-3" /> SIM
      </span>
    );
  };

  // Overall Comparability Chip - click to cycle (styled for blue background)
  const OverallChip = ({ comp }: { comp: LandComp }) => {
    const currentValue = comp.overallComparability;
    
    const handleClick = () => {
      const nextValue = cycleAdjustmentValue(currentValue);
      handleUpdateComp(comp.id, 'overallComparability', nextValue as 'Superior' | 'Similar' | 'Inferior');
    };

    const isSup = currentValue === 'Superior';
    const isInf = currentValue === 'Inferior';
    const baseClass = `inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide border-2 shadow-sm transition-all cursor-pointer select-none active:scale-95`;
    
    if (isSup) return (
      <span 
        onClick={handleClick} 
        className={`${baseClass} bg-emerald-500 text-white border-emerald-400 hover:bg-emerald-600`}
        title="Click to change"
      >
        <ArrowUpRight className="w-3.5 h-3.5" /> Superior
      </span>
    );
    if (isInf) return (
      <span 
        onClick={handleClick} 
        className={`${baseClass} bg-red-500 text-white border-red-400 hover:bg-red-600`}
        title="Click to change"
      >
        <ArrowDownRight className="w-3.5 h-3.5" /> Inferior
      </span>
    );
    return (
      <span 
        onClick={handleClick} 
        className={`${baseClass} bg-white/20 text-white border-white/40 hover:bg-white/30`}
        title="Click to change"
      >
        <Minus className="w-3.5 h-3.5" /> Similar
      </span>
    );
  };

  // Add Element Button with Dropdown - now positioned in the Elements column
  const AddElementButton = ({ section }: { section: 'transaction' | 'adjustments' | 'qualitative' }) => {
    const isOpen = openElementDropdown === section;
    const availableElements = getAvailableElements(section);
    
    return (
      <div className={`element-dropdown relative ${isOpen ? 'z-[500]' : ''}`}>
        <button 
          onClick={() => setOpenElementDropdown(isOpen ? null : section)}
          className="w-full py-2 px-3 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-between gap-2 text-slate-500 font-semibold hover:border-[#0da1c7] hover:text-[#0da1c7] hover:bg-[#0da1c7]/5 transition-all duration-300 group text-xs bg-white dark:bg-slate-800"
        >
          <div className="flex items-center gap-2">
            <Plus size={12} className="text-slate-400 group-hover:text-[#0da1c7]" />
            <span>Add Element</span>
          </div>
          <ChevronDown size={12} className={`text-slate-400 group-hover:text-[#0da1c7] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {isOpen && (
          <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-xl shadow-2xl border border-slate-200 z-[500] overflow-hidden">
            <div className="px-3 py-2 bg-slate-50 border-b border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Available Elements</span>
            </div>
            <div className="max-h-48 overflow-y-auto">
              {availableElements.length > 0 ? (
                availableElements.map(element => (
                  <button
                    key={element.id}
                    onClick={() => handleAddElement(section, element)}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-[#0da1c7]/5 transition-colors border-b border-slate-100 last:border-b-0 group"
                  >
                    <div className="font-medium text-slate-700 group-hover:text-[#0da1c7]">{element.label}</div>
                    {element.description && (
                      <div className="text-[10px] text-slate-400 mt-0.5">{element.description}</div>
                    )}
                  </button>
                ))
              ) : (
                <div className="px-3 py-3 text-xs text-slate-400 italic text-center">
                  All elements have been added
                </div>
              )}
            </div>
            <div className="border-t border-slate-200">
              <button
                onClick={() => handleAddCustomElement(section)}
                className="w-full text-left px-3 py-2.5 text-xs hover:bg-[#0da1c7]/5 transition-colors flex items-center gap-2 text-[#0da1c7] font-medium"
              >
                <PenLine size={12} />
                Add Custom
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Prepare map data - check if subject and comps have coordinates
  const hasSubjectCoords = SUBJECT_PROPERTY.lat !== undefined && SUBJECT_PROPERTY.lng !== undefined;
  const compsWithCoords = comps.filter(c => c.lat !== undefined && c.lng !== undefined);
  
  // Map collapsed state
  const [isMapCollapsed, setIsMapCollapsed] = useState(false);

  return (
    <div className="flex flex-col h-full bg-slate-50 relative overflow-hidden">
      
      {/* LAND SALES MAP SECTION */}
      {hasSubjectCoords && (
        <div className="flex-shrink-0 border-b border-slate-200 bg-white dark:bg-slate-800">
          {/* Map Header - Always visible */}
          <button
            onClick={() => setIsMapCollapsed(!isMapCollapsed)}
            className="w-full flex items-center justify-between px-4 py-2 hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <MapIcon className="w-4 h-4 text-orange-600" />
              <span className="font-semibold text-sm text-slate-700">Land Sales Map</span>
              <span className="text-xs text-slate-400">
                ({compsWithCoords.length} of {comps.length} comp{comps.length !== 1 ? 's' : ''} mapped)
              </span>
            </div>
            {isMapCollapsed ? (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            )}
          </button>
          
          {/* Map Content - Collapsible */}
          {!isMapCollapsed && (
            <div className="px-4 pb-4">
              <ComparableMapPreview
                subject={{
                  lat: SUBJECT_PROPERTY.lat!,
                  lng: SUBJECT_PROPERTY.lng!,
                  address: `${SUBJECT_PROPERTY.address}, ${SUBJECT_PROPERTY.cityState}`,
                  propertyName: SUBJECT_PROPERTY.address,
                }}
                comparables={compsWithCoords.map((comp, index) => ({
                  id: comp.id,
                  lat: comp.lat!,
                  lng: comp.lng!,
                  label: `Comp ${index + 1}`,
                  address: `${comp.address}, ${comp.cityStateZip}`,
                  details: formatCurrency(comp.salePrice),
                }))}
                type="land-sales"
                height={280}
              />
            </div>
          )}
        </div>
      )}
      
      {/* SCROLLABLE AREA - with isolation for proper stacking context */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-auto custom-scrollbar relative" 
        style={{ backgroundColor: '#ffffff', isolation: 'isolate' }}
      >
        {/* Horizontal Scroll Indicator - offset to avoid action column */}
        <HorizontalScrollIndicator scrollContainerRef={scrollContainerRef} stickyTop={120} rightOffset={ACTION_COL_WIDTH} />
        
        {/* Flex container for grid + action column */}
        <div 
          className="flex"
          style={{ minWidth: `${LABEL_COL_WIDTH + SUBJECT_COL_WIDTH + (comps.length * COMP_COL_WIDTH) + ACTION_COL_WIDTH}px` }}
        >
          {/* GRID CONTAINER */}
          <div 
            className="grid relative bg-white flex-shrink-0" 
            style={{ 
              gridTemplateColumns: `${LABEL_COL_WIDTH}px ${SUBJECT_COL_WIDTH}px repeat(${comps.length}, ${COMP_COL_WIDTH}px)`, 
              minWidth: `${LABEL_COL_WIDTH + SUBJECT_COL_WIDTH + (comps.length * COMP_COL_WIDTH)}px`,
              backgroundColor: '#ffffff'
            }}
          >
          
          {/* ========== HEADER ROW ========== */}
          <div 
            className="sticky top-0 left-0 z-[120] bg-white border-b border-slate-200 flex items-end" 
            style={{ width: LABEL_COL_WIDTH, height: 120, backgroundColor: '#ffffff', transform: 'translateZ(0)', willChange: 'transform' }}
          >
            <div className="p-2 pl-3">
              <div className="font-bold text-slate-400 text-xs uppercase tracking-wider">Element</div>
            </div>
          </div>
          
          {/* Subject Header with Photo - SOLID background to prevent content showing through */}
          <div 
            className="sticky top-0 left-[160px] z-[110] border-b-2 border-[#0da1c7] shadow-[4px_0_16px_rgba(0,0,0,0.08)] flex flex-col"
            style={{ width: SUBJECT_COL_WIDTH, height: 120, backgroundColor: '#ffffff', transform: 'translateZ(0)', willChange: 'transform' }}
          >
            {/* Subject Photo - same height as comp photos */}
            <div className="relative h-16 w-full overflow-hidden group">
              <img 
                src={SUBJECT_PROPERTY.imageUrl} 
                alt="Subject Property" 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
              />
              <div className="absolute top-1.5 left-1.5 bg-[#0da1c7] text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                SUBJECT
              </div>
            </div>
            {/* Subject Info - solid light blue background */}
            <div className="p-2 flex-1 flex flex-col gap-0.5 bg-sky-50 border-r border-slate-200">
              <h3 className="font-bold text-slate-800 dark:text-white text-xs leading-tight line-clamp-1" title={SUBJECT_PROPERTY.address}>
                {SUBJECT_PROPERTY.address.split(',')[0]}
              </h3>
              <div className="flex items-start gap-1 text-[10px] text-slate-500">
                <MapPin className="w-3 h-3 flex-shrink-0 mt-0.5 text-[#0da1c7]" />
                <span className="line-clamp-1 leading-tight">{SUBJECT_PROPERTY.cityState}</span>
              </div>
            </div>
          </div>
          
          {/* Comp Headers with Photos */}
          {comps.map((comp, idx) => (
            <div 
              key={comp.id} 
              className="sticky top-0 z-[100] border-b border-slate-200 flex flex-col"
              style={{ height: 120, backgroundColor: '#ffffff', transform: 'translateZ(0)', willChange: 'transform' }}
            >
              {/* Comp Photo */}
              <div className="relative h-16 w-full overflow-hidden group">
                <img 
                  src={comp.imageUrl} 
                  alt={comp.address} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                />
                <div className="absolute top-1.5 right-1.5 bg-slate-900/70 backdrop-blur-sm text-white text-[10px] font-medium px-1.5 py-0.5 rounded shadow-sm">
                  Sold {comp.dateSold}
                </div>
                {/* Delete button overlay */}
                <button
                  onClick={() => handleDeleteComp(comp.id)}
                  className="absolute top-1.5 left-1.5 p-1 rounded bg-white/80 hover:bg-red-100 text-slate-400 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                  title="Remove this sale"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
              {/* Comp Info */}
              <div className="p-2 flex-1 flex flex-col gap-0.5 border-r border-slate-200">
                <h3 className="font-bold text-slate-800 dark:text-white text-xs leading-tight line-clamp-1" title={comp.address}>
                  Sale {idx + 1}
                </h3>
                <div className="flex items-start gap-1 text-[10px] text-slate-500">
                  <MapPin className="w-3 h-3 flex-shrink-0 mt-0.5 text-[#0da1c7]" />
                  <span className="line-clamp-1 leading-tight">{comp.cityStateZip}</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-auto">
                  <Activity className="w-3 h-3 text-emerald-500" />
                  <span>{(Math.random() * 10 + 1).toFixed(1)} mi away</span>
                </div>
              </div>
            </div>
          ))}


          {/* ========== TRANSACTION DATA SECTION ========== */}
          <div className="col-span-full relative z-[50] mt-4 border-y border-slate-200">
            <div className="absolute left-0 right-0 h-full bg-slate-100" style={{ opacity: 0.3 }}></div>
            <div 
              className="sticky left-0 w-fit px-4 py-2 font-bold text-xs uppercase tracking-widest text-slate-700 flex items-center gap-2"
              style={{ zIndex: 51, backgroundColor: '#f9fafb' }}
            >
              TRANSACTION DATA
            </div>
          </div>

          {/* Transaction Data Rows */}
          {transactionRows.map(row => (
            <React.Fragment key={row.id}>
              {/* Label Column - Never scrolls horizontally */}
              <div 
                className="sticky left-0 z-[60] border-r border-b border-slate-100 flex items-center justify-between px-2 py-1.5 group"
                style={{ width: LABEL_COL_WIDTH, backgroundColor: '#ffffff', transform: 'translateZ(0)' }}
              >
                <span className="text-xs font-medium text-slate-600 truncate">{row.label}</span>
                <button
                  onClick={() => handleDeleteRow(row.id, 'transaction')}
                  className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-red-100 text-slate-300 hover:text-red-500 transition-all"
                  title={`Remove ${row.label}`}
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
              
              {/* Subject Column - Never scrolls horizontally */}
              <div 
                className="sticky left-[160px] z-[55] border-r border-b border-slate-100 p-2 flex items-center justify-center text-xs shadow-[4px_0_16px_rgba(0,0,0,0.05)]"
                style={{ width: SUBJECT_COL_WIDTH, backgroundColor: '#f0f9ff', transform: 'translateZ(0)' }}
              >
                <span className="font-medium text-slate-700">{getSubjectTransactionValue(row.id)}</span>
              </div>
              
              {/* Comp Columns */}
              {comps.map(comp => (
                <div 
                  key={`${row.id}-${comp.id}`} 
                  className="border-r border-b border-slate-100 p-2 flex items-center justify-center text-xs bg-white dark:bg-slate-800"
                >
                  <span className="font-medium text-slate-600">{getTransactionValue(comp, row.id)}</span>
                </div>
              ))}
            </React.Fragment>
          ))}

          {/* Add Element Button for Transaction Section - in Elements column */}
          <div 
            className={`sticky left-0 p-2 ${openElementDropdown === 'transaction' ? 'z-[500]' : 'z-[60]'}`}
            style={{ width: LABEL_COL_WIDTH, backgroundColor: '#ffffff' }}
          >
            <AddElementButton section="transaction" />
          </div>
          <div 
            className="sticky left-[160px] z-[55] shadow-[4px_0_16px_rgba(0,0,0,0.05)]"
            style={{ width: SUBJECT_COL_WIDTH, backgroundColor: '#ffffff' }}
          ></div>
          {comps.map(comp => (
            <div key={`add-trans-${comp.id}`} className="bg-white dark:bg-slate-800"></div>
          ))}

          {/* ========== TRANSACTION ADJUSTMENTS SECTION ========== */}
          <div className="col-span-full relative z-[50] mt-4 border-y border-blue-200">
            <div className="absolute left-0 right-0 h-full bg-blue-50" style={{ opacity: 0.3 }}></div>
            <div 
              className="sticky left-0 w-fit px-4 py-2 font-bold text-xs uppercase tracking-widest text-blue-700 flex items-center gap-2"
              style={{ zIndex: 51, backgroundColor: '#eff6ff' }}
            >
              TRANSACTION ADJUSTMENTS
            </div>
          </div>

          {/* Transaction Adjustment Rows */}
          {adjustmentRows.map(row => (
            <React.Fragment key={row.id}>
              {/* Label Column - Never scrolls horizontally */}
              <div 
                className={`sticky left-0 z-[60] border-r border-b border-slate-100 flex items-center justify-between px-2 py-1.5 group ${
                  row.id === 'adjPriceAcre' ? 'border-t-2 border-t-slate-800' : ''
                }`}
                style={{ width: LABEL_COL_WIDTH, backgroundColor: row.id === 'adjPriceAcre' ? '#f8fafc' : '#ffffff', transform: 'translateZ(0)' }}
              >
                <span className={`text-xs truncate ${
                  row.id === 'adjPriceAcre' ? 'font-black text-slate-900 uppercase' : 'font-medium text-slate-600'
                }`}>{row.label}</span>
                <button
                  onClick={() => handleDeleteRow(row.id, 'adjustments')}
                  className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-red-100 text-slate-300 hover:text-red-500 transition-all"
                  title={`Remove ${row.label}`}
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
              
              {/* Subject Column - Never scrolls horizontally */}
              <div 
                className={`sticky left-[160px] z-[55] border-r border-b border-slate-100 p-2 flex items-center justify-center text-xs shadow-[4px_0_16px_rgba(0,0,0,0.05)] ${
                  row.id === 'adjPriceAcre' ? 'border-t-2 border-t-slate-800' : ''
                }`}
                style={{ width: SUBJECT_COL_WIDTH, backgroundColor: row.id === 'adjPriceAcre' ? '#dbeafe' : '#f0f9ff', transform: 'translateZ(0)' }}
              >
                <span className="font-medium text-slate-700">{getSubjectAdjustmentValue(row.id)}</span>
              </div>
              
              {/* Comp Columns */}
              {comps.map(comp => (
                <div 
                  key={`${row.id}-${comp.id}`} 
                  className={`border-r border-b border-slate-100 p-2 flex items-center justify-center text-xs bg-white ${
                    row.id === 'adjPriceAcre' ? 'border-t-2 border-t-slate-800 bg-slate-50' : ''
                  }`}
                >
                  {row.id === 'marketCond' ? (
                    <MarketCondChip comp={comp} />
                  ) : row.id === 'adjustment' ? (
                    <span className={`font-medium ${comp.adjustment !== 0 ? (comp.adjustment > 0 ? 'text-red-600' : 'text-emerald-600') : 'text-slate-500'}`}>
                      {comp.adjustment !== 0 ? `${comp.adjustment > 0 ? '+' : ''}${comp.adjustment.toFixed(1)}%` : '-'}
                    </span>
                  ) : row.id === 'adjPriceAcre' ? (
                    <span className="font-bold text-emerald-700">{formatCurrency(getAdjustedPricePerAcre(comp))}</span>
                  ) : row.id === 'propRights' ? (
                    <span className="font-medium text-slate-600">{comp.propRights}</span>
                  ) : row.id === 'financing' ? (
                    <span className="font-medium text-slate-600">{comp.financing}</span>
                  ) : row.id === 'condSale' ? (
                    <span className="font-medium text-slate-600">{comp.condSale}</span>
                  ) : (
                    <span className="font-medium text-slate-600">-</span>
                  )}
                </div>
              ))}
            </React.Fragment>
          ))}

          {/* Add Element Button for Adjustments Section - in Elements column */}
          <div 
            className={`sticky left-0 p-2 ${openElementDropdown === 'adjustments' ? 'z-[500]' : 'z-[60]'}`}
            style={{ width: LABEL_COL_WIDTH, backgroundColor: '#ffffff' }}
          >
            <AddElementButton section="adjustments" />
          </div>
          <div 
            className="sticky left-[160px] z-[55] shadow-[4px_0_16px_rgba(0,0,0,0.05)]"
            style={{ width: SUBJECT_COL_WIDTH, backgroundColor: '#f0f9ff' }}
          ></div>
          {comps.map(comp => (
            <div key={`add-adj-${comp.id}`} className="bg-white dark:bg-slate-800"></div>
          ))}

          {/* ========== QUALITATIVE ADJUSTMENTS SECTION ========== */}
          <div className="col-span-full relative z-[50] mt-4 border-y border-emerald-200">
            <div className="absolute left-0 right-0 h-full bg-emerald-50" style={{ opacity: 0.3 }}></div>
            <div 
              className="sticky left-0 w-fit px-4 py-2 font-bold text-xs uppercase tracking-widest text-emerald-700 flex items-center gap-2"
              style={{ zIndex: 51, backgroundColor: '#ecfdf5' }}
            >
              QUALITATIVE ADJUSTMENTS
            </div>
          </div>

          {/* Qualitative Adjustment Rows */}
          {qualitativeRows.map(row => (
            <React.Fragment key={row.id}>
              {/* Label Column - Never scrolls horizontally */}
              <div 
                className="sticky left-0 z-[60] border-r border-b border-slate-100 flex items-center justify-between px-2 py-1.5 group"
                style={{ width: LABEL_COL_WIDTH, backgroundColor: '#ffffff', transform: 'translateZ(0)' }}
              >
                <span className="text-xs font-medium text-slate-600 truncate">{row.label}</span>
                <button
                  onClick={() => handleDeleteRow(row.id, 'qualitative')}
                  className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-red-100 text-slate-300 hover:text-red-500 transition-all"
                  title={`Remove ${row.label}`}
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
              
              {/* Subject Column - Never scrolls horizontally */}
              <div 
                className="sticky left-[160px] z-[55] border-r border-b border-slate-100 p-2 flex items-center justify-center text-xs shadow-[4px_0_16px_rgba(0,0,0,0.05)]"
                style={{ width: SUBJECT_COL_WIDTH, backgroundColor: '#f0f9ff', transform: 'translateZ(0)' }}
              >
                <span className="font-medium text-slate-700">{getSubjectQualitativeValue(row.id)}</span>
              </div>
              
              {/* Comp Columns */}
              {comps.map(comp => (
                <div 
                  key={`${row.id}-${comp.id}`} 
                  className="border-r border-b border-slate-100 p-2 flex items-center justify-center text-xs bg-white dark:bg-slate-800"
                >
                  <AdjustmentChip compId={comp.id} rowId={row.field || row.id} />
                </div>
              ))}
            </React.Fragment>
          ))}

          {/* Add Element Button for Qualitative Section - in Elements column */}
          <div 
            className={`sticky left-0 p-2 ${openElementDropdown === 'qualitative' ? 'z-[500]' : 'z-[60]'}`}
            style={{ width: LABEL_COL_WIDTH, backgroundColor: '#ffffff' }}
          >
            <AddElementButton section="qualitative" />
          </div>
          <div 
            className="sticky left-[160px] z-[55] shadow-[4px_0_16px_rgba(0,0,0,0.05)]"
            style={{ width: SUBJECT_COL_WIDTH, backgroundColor: '#ffffff' }}
          ></div>
          {comps.map(comp => (
            <div key={`add-qual-${comp.id}`} className="bg-white dark:bg-slate-800"></div>
          ))}

          {/* ========== OVERALL COMPARABILITY FOOTER ========== */}
          <div className="col-span-full relative z-[50] mt-4"></div>
          
          {/* Label Column - Never scrolls horizontally */}
          <div 
            className="sticky left-0 z-[60] bg-[#0da1c7] border-b border-[#0da1c7] p-3 flex items-center"
            style={{ width: LABEL_COL_WIDTH, transform: 'translateZ(0)' }}
          >
            <span className="text-xs font-bold text-white uppercase tracking-wide">Overall Comparability</span>
          </div>
          
          {/* Subject Column - Never scrolls horizontally */}
          <div 
            className="sticky left-[160px] z-[55] bg-[#0da1c7] border-b border-[#0da1c7] p-3 flex items-center justify-center shadow-[4px_0_16px_rgba(0,0,0,0.15)]"
            style={{ width: SUBJECT_COL_WIDTH, transform: 'translateZ(0)' }}
          >
            <span className="text-xs font-bold text-white">N/A</span>
          </div>
          
          {/* Comp Columns */}
          {comps.map(comp => (
            <div 
              key={`overall-${comp.id}`} 
              className="bg-[#0da1c7] border-b border-[#0da1c7] p-2 flex items-center justify-center"
            >
              <OverallChip comp={comp} />
            </div>
          ))}

          </div>

          {/* ACTION COLUMN */}
          <div 
            className="flex-shrink-0 bg-slate-50 flex flex-col items-center justify-start py-8 sticky top-0 self-start"
            style={{ width: ACTION_COL_WIDTH, height: 'auto', minHeight: 400 }}
          >
            <div className="flex flex-col items-center justify-center h-80 py-4">
              {/* Add Comps */}
              <button 
                className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-white transition-colors group"
                title="Add a new comp manually"
              >
                <div className="w-12 h-12 rounded-full bg-[#0da1c7]/20 flex items-center justify-center group-hover:bg-[#0da1c7]/30 transition-colors">
                  <Plus className="w-6 h-6 text-[#0da1c7]" />
                </div>
                <span className="text-xs font-semibold text-[#0da1c7]">Add Comps</span>
              </button>
            </div>
          </div>
        </div>

        {/* VALUE INDICATION FOOTER - Stays centered, doesn't scroll horizontally */}
        <div 
          className="sticky left-0 bg-slate-50 border-t-2 border-slate-300 p-8 pt-10"
          style={{ width: '100vw', maxWidth: '100%' }}
        >
          <div className="max-w-4xl mx-auto flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-8 bg-[#0da1c7] rounded-full"></div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white uppercase tracking-wider">Land Value Indication</h2>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-sm text-slate-500 font-medium mb-2">Subject Land Size</div>
                  <div className="text-2xl font-bold text-slate-800 dark:text-white">{formatNumber(SUBJECT_PROPERTY.landAcres, 3)} Acres</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-slate-500 font-medium mb-2">Average Adjusted $/Acre</div>
                  <div className="text-2xl font-bold text-[#0da1c7]">
                    {formatCurrency(comps.reduce((acc, c) => acc + getAdjustedPricePerAcre(c), 0) / comps.length)}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-slate-500 font-medium mb-2">Indicated Land Value</div>
                  <div className="text-2xl font-bold text-emerald-600">
                    {formatCurrency((comps.reduce((acc, c) => acc + getAdjustedPricePerAcre(c), 0) / comps.length) * SUBJECT_PROPERTY.landAcres)}
                  </div>
                </div>
              </div>
            </div>

            {/* Notes Section with AI Draft */}
            <div className="mt-6">
              <EnhancedTextArea
                label="Notes"
                value={notesText}
                onChange={setNotesText}
                placeholder="Type your analysis and assumptions here..."
                sectionContext="land_valuation"
                helperText="AI can draft a land valuation narrative based on your comparable analysis."
                minHeight={250}
                rows={8}
              />
            </div>
            
            {/* Bottom padding */}
            <div className="h-8"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
