import React, { useState, useEffect, useRef, useCallback } from 'react';
import { HorizontalScrollIndicator } from '../../../components/HorizontalScrollIndicator';
import EnhancedTextArea from '../../../components/EnhancedTextArea';
import { Plus, Trash2, ArrowUpRight, ArrowDownRight, Minus, MapPin, Activity, ChevronDown, PenLine, Calendar, ChevronUp, Map as MapIcon } from 'lucide-react';
import { RentComp, RentGridRow } from '../rentTypes';
import { 
  MOCK_RENT_COMPS, 
  SUBJECT_RENT_PROPERTY, 
  RENT_TRANSACTION_ROWS,
  RENT_QUALITATIVE_ROWS,
  AvailableRentElement,
  formatCurrency, 
  formatNumber,
  formatRentPerSf
} from '../rentConstants';
import { useWizard } from '../../../context/WizardContext';
import { getAvailableElements as filterElements, normalizeSection } from '../../../utils/elementFilter';
import type { SectionType } from '../../../constants/elementRegistry';
import { ComparableMapPreview } from '../../../components/ComparableMapPreview';

// Grid column widths (matching LandSalesGrid)
const LABEL_COL_WIDTH = 160;
const SUBJECT_COL_WIDTH = 180;
const COMP_COL_WIDTH = 170;

// Props interface for controlled component
interface RentComparableGridProps {
  /** Initial rent comparables - if empty, will show empty state */
  rentComparables?: RentComp[];
  /** Notes text for the rent analysis */
  notes?: string;
  /** Callback when comparables change */
  onCompsChange?: (comps: RentComp[]) => void;
  /** Callback when notes change */
  onNotesChange?: (notes: string) => void;
}

export const RentComparableGrid: React.FC<RentComparableGridProps> = ({
  rentComparables,
  notes: initialNotes = '',
  onCompsChange,
  onNotesChange,
}) => {
  const { state: wizardState } = useWizard();
  const { propertyType, propertySubtype, scenarios, activeScenarioId } = wizardState;
  const currentScenario = scenarios.find(s => s.id === activeScenarioId)?.name;
  
  // Initialize from props, fallback to mock data if no data provided (for demo purposes)
  const [comps, setComps] = useState<RentComp[]>(
    rentComparables && rentComparables.length > 0 ? rentComparables : MOCK_RENT_COMPS
  );
  const [transactionRows, setTransactionRows] = useState(RENT_TRANSACTION_ROWS);
  const [qualitativeRows, setQualitativeRows] = useState(RENT_QUALITATIVE_ROWS);
  const [openElementDropdown, setOpenElementDropdown] = useState<'transaction' | 'qualitative' | null>(null);
  const [notesText, setNotesText] = useState(initialNotes);
  const _dropdownRef = useRef<HTMLDivElement>(null);
  void _dropdownRef; // Reserved for future click-outside handling
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // Sync with parent when comps change
  const notifyCompsChange = useCallback((newComps: RentComp[]) => {
    if (onCompsChange) {
      onCompsChange(newComps);
    }
  }, [onCompsChange]);
  
  // Sync with parent when notes change
  const handleNotesChange = useCallback((newNotes: string) => {
    setNotesText(newNotes);
    if (onNotesChange) {
      onNotesChange(newNotes);
    }
  }, [onNotesChange]);

  // Calculate total grid width
  const totalGridWidth = LABEL_COL_WIDTH + SUBJECT_COL_WIDTH + (comps.length * COMP_COL_WIDTH);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (openElementDropdown && !target.closest('.element-dropdown')) {
        setOpenElementDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openElementDropdown]);

  const handleDeleteComp = (compId: string) => {
    if (window.confirm('Are you sure you want to remove this rental comparable?')) {
      setComps(prev => {
        const newComps = prev.filter(c => c.id !== compId);
        notifyCompsChange(newComps);
        return newComps;
      });
    }
  };

  const handleUpdateComp = (compId: string, field: keyof RentComp, value: any) => {
    setComps(prev => {
      const newComps = prev.map(c => 
        c.id === compId ? { ...c, [field]: value } : c
      );
      notifyCompsChange(newComps);
      return newComps;
    });
  };

  // Add an element from the available elements dropdown
  const handleAddElement = (section: 'transaction' | 'qualitative', element: AvailableRentElement) => {
    const newRow: RentGridRow = { 
      id: element.id, 
      label: element.label + ':', 
      section: section, 
      removable: true 
    };
    
    if (section === 'transaction') {
      if (transactionRows.some(r => r.id === element.id)) return;
      setTransactionRows(prev => [...prev, newRow]);
    } else {
      if (qualitativeRows.some(r => r.id === element.id)) return;
      setQualitativeRows(prev => [...prev, newRow]);
    }
    setOpenElementDropdown(null);
  };

  // Add a custom element with user-typed name
  const handleAddCustomElement = (section: 'transaction' | 'qualitative') => {
    const name = prompt('Enter element name:');
    if (!name) return;
    const newId = name.toLowerCase().replace(/\s+/g, '_') + '_custom';
    const newRow: RentGridRow = { 
      id: newId, 
      label: name + ':', 
      section: section, 
      removable: true 
    };
    
    if (section === 'transaction') {
      setTransactionRows(prev => [...prev, newRow]);
    } else {
      setQualitativeRows(prev => [...prev, newRow]);
    }
    setOpenElementDropdown(null);
  };

  // Get available elements for a section (excluding already added)
  // Get available elements for a section using dynamic filtering
  const getAvailableElements = (section: 'transaction' | 'qualitative') => {
    const existingIds = section === 'transaction' 
      ? transactionRows.map(r => r.id)
      : qualitativeRows.map(r => r.id);
    
    // Normalize section for registry lookup
    const normalizedSection = normalizeSection(section) as SectionType;
    
    // Filter elements based on current context
    const filteredElements = filterElements({
      section: normalizedSection,
      propertyType: propertyType,
      subtype: propertySubtype,
      approach: 'income',
      scenario: currentScenario,
      excludeKeys: existingIds
    });
    
    // Map to the format expected by this grid
    const mappedElements: AvailableRentElement[] = filteredElements.map(el => ({
      id: el.key,
      label: el.label
    }));
    
    return mappedElements;
  };

  const handleDeleteRow = (rowId: string, section: 'transaction' | 'qualitative') => {
    if (section === 'transaction') {
      setTransactionRows(prev => prev.filter(r => r.id !== rowId));
    } else {
      setQualitativeRows(prev => prev.filter(r => r.id !== rowId));
    }
  };

  const getTransactionValue = (comp: RentComp, rowId: string) => {
    switch (rowId) {
      case 'address': return comp.address;
      case 'cityState': return comp.cityStateZip;
      case 'hbuUse': return comp.hbuUse;
      case 'sizeSfBldg': return formatNumber(comp.sizeSfBldg);
      case 'condition': return comp.condition;
      case 'nnnRentPerSf': return formatRentPerSf(comp.nnnRentPerSf);
      case 'leaseDate': return comp.leaseDate;
      case 'yearBuilt': return comp.yearBuilt?.toString() || '-';
      case 'propertyType': return comp.propertyType || '-';
      default: return '-';
    }
  };

  const getSubjectTransactionValue = (rowId: string) => {
    switch (rowId) {
      case 'address': return SUBJECT_RENT_PROPERTY.address;
      case 'cityState': return SUBJECT_RENT_PROPERTY.cityState;
      case 'hbuUse': return SUBJECT_RENT_PROPERTY.hbuUse;
      case 'sizeSfBldg': return formatNumber(SUBJECT_RENT_PROPERTY.sizeSfBldg);
      case 'condition': return SUBJECT_RENT_PROPERTY.condition;
      case 'nnnRentPerSf': return SUBJECT_RENT_PROPERTY.currentRentPerSf ? formatRentPerSf(SUBJECT_RENT_PROPERTY.currentRentPerSf) : 'N/A';
      case 'yearBuilt': return SUBJECT_RENT_PROPERTY.yearBuilt?.toString() || '-';
      case 'propertyType': return SUBJECT_RENT_PROPERTY.propertyType || '-';
      default: return '-';
    }
  };

  const getSubjectQualitativeValue = (rowId: string) => {
    switch (rowId) {
      case 'locationAdj': return SUBJECT_RENT_PROPERTY.cityState;
      case 'hbuUseAdj': return SUBJECT_RENT_PROPERTY.hbuUse;
      case 'sizeSfBldgAdj': return formatNumber(SUBJECT_RENT_PROPERTY.sizeSfBldg);
      case 'conditionAdj': return SUBJECT_RENT_PROPERTY.condition;
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
    const currentValue = comp?.[rowId as keyof RentComp] as string || 'Similar';
    
    const handleClick = () => {
      const nextValue = cycleAdjustmentValue(currentValue);
      handleUpdateComp(compId, rowId as keyof RentComp, nextValue);
    };

    const isSup = currentValue === 'Superior';
    const isInf = currentValue === 'Inferior';
    const baseClass = `inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide border shadow-sm transition-all cursor-pointer select-none active:scale-95`;
    
    if (isSup) return (
      <span 
        onClick={handleClick} 
        className={`${baseClass} bg-accent-teal-mint-light text-accent-teal-mint border-accent-teal-mint hover:bg-accent-teal-mint-light hover:border-accent-teal-mint`}
        title="Click to change"
      >
        <ArrowUpRight className="w-3 h-3" /> SUP
      </span>
    );
    if (isInf) return (
      <span 
        onClick={handleClick} 
        className={`${baseClass} bg-accent-red-light text-harken-error border-harken-error/20 hover:bg-accent-red-light hover:border-harken-error/20`}
        title="Click to change"
      >
        <ArrowDownRight className="w-3 h-3" /> INF
      </span>
    );
    return (
      <span 
        onClick={handleClick} 
        className={`${baseClass} bg-harken-gray-light dark:bg-elevation-1 text-harken-gray-med dark:text-slate-400 border-light-border dark:border-harken-gray hover:bg-harken-gray-light dark:hover:bg-harken-gray hover:border-light-border dark:hover:border-harken-gray`}
        title="Click to change"
      >
        <Minus className="w-3 h-3" /> SIM
      </span>
    );
  };

  // Overall Comparability Chip - click to cycle (matching SalesGrid pattern)
  const OverallChip = ({ comp }: { comp: RentComp }) => {
    const currentValue = comp.overallComparability;
    
    const handleClick = () => {
      const nextValue = cycleAdjustmentValue(currentValue);
      handleUpdateComp(comp.id, 'overallComparability', nextValue as any);
    };

    const isSup = currentValue === 'Superior';
    const isInf = currentValue === 'Inferior';
    const baseClass = `inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide border-2 shadow-sm transition-all cursor-pointer select-none active:scale-95`;
    
    if (isSup) return (
      <span 
        onClick={handleClick} 
        className={`${baseClass} bg-accent-teal-mint text-white border-accent-teal-mint hover:bg-accent-teal-mint`}
        title="Click to change"
      >
        <ArrowUpRight className="w-3.5 h-3.5" /> Superior
      </span>
    );
    if (isInf) return (
      <span 
        onClick={handleClick} 
        className={`${baseClass} bg-harken-error text-white border-harken-error hover:bg-harken-error`}
        title="Click to change"
      >
        <ArrowDownRight className="w-3.5 h-3.5" /> Inferior
      </span>
    );
    return (
      <span 
        onClick={handleClick} 
        className={`${baseClass} bg-surface-1/20 text-white border-white/40 hover:bg-surface-1/30`}
        title="Click to change"
      >
        <Minus className="w-3.5 h-3.5" /> Similar
      </span>
    );
  };

  // Add Element Button with Dropdown
  const AddElementButton = ({ section }: { section: 'transaction' | 'qualitative' }) => {
    const isOpen = openElementDropdown === section;
    const availableElements = getAvailableElements(section);
    
    return (
      <div className={`element-dropdown relative ${isOpen ? 'z-[500]' : ''}`}>
        <button 
          onClick={() => setOpenElementDropdown(isOpen ? null : section)}
          className="w-full py-2 px-3 border-2 border-dashed border-border-muted dark:border-dark-border-muted rounded-lg flex items-center justify-between gap-2 text-slate-500 dark:text-slate-400 font-semibold hover:border-harken-blue hover:text-harken-blue hover:bg-harken-blue/5 transition-all duration-300 group text-xs bg-surface-1 dark:bg-elevation-1"
        >
          <div className="flex items-center gap-2">
            <Plus size={12} className="text-slate-400 group-hover:text-harken-blue" />
            <span>Add Element</span>
          </div>
          <ChevronDown size={12} className={`text-slate-400 group-hover:text-harken-blue transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {isOpen && (
          <div className="absolute top-full left-0 mt-1 w-64 bg-surface-1 dark:bg-elevation-1 rounded-xl shadow-2xl border border-light-border dark:border-dark-border dark:border-dark-border z-[500] overflow-hidden">
            <div className="px-3 py-2 bg-surface-2 dark:bg-elevation-2 dark:bg-elevation-1 border-b border-light-border dark:border-dark-border dark:border-dark-border">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Available Elements</span>
            </div>
            <div className="max-h-48 overflow-y-auto">
              {availableElements.length > 0 ? (
                availableElements.map(element => (
                  <button
                    key={element.id}
                    onClick={() => handleAddElement(section, element)}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-harken-blue/5 dark:hover:bg-harken-blue/10 transition-colors border-b border-light-border dark:border-dark-border dark:border-dark-border last:border-b-0 group"
                  >
                    <div className="font-medium text-slate-700 dark:text-slate-200 group-hover:text-harken-blue">{element.label}</div>
                    {element.description && (
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{element.description}</div>
                    )}
                  </button>
                ))
              ) : (
                <div className="px-3 py-3 text-xs text-slate-400 dark:text-slate-500 italic text-center">
                  All elements have been added
                </div>
              )}
            </div>
            <div className="border-t border-light-border dark:border-dark-border dark:border-dark-border">
              <button
                onClick={() => handleAddCustomElement(section)}
                className="w-full text-left px-3 py-2.5 text-xs hover:bg-harken-blue/5 dark:hover:bg-harken-blue/10 transition-colors flex items-center gap-2 text-harken-blue font-medium"
              >
                <PenLine size={12} />
                Type My Own...
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Calculate rent indication
  const averageRentPerSf = comps.length > 0 
    ? comps.reduce((acc, c) => acc + c.nnnRentPerSf, 0) / comps.length 
    : 0;
  
  const similarComps = comps.filter(c => c.overallComparability === 'Similar');
  const weightedAvgRent = similarComps.length > 0
    ? similarComps.reduce((acc, c) => acc + c.nnnRentPerSf, 0) / similarComps.length
    : averageRentPerSf;

  // Prepare map data - check if subject and comps have coordinates
  const hasSubjectCoords = SUBJECT_RENT_PROPERTY.lat !== undefined && SUBJECT_RENT_PROPERTY.lng !== undefined;
  const compsWithCoords = comps.filter(c => c.lat !== undefined && c.lng !== undefined);
  
  // Map collapsed state
  const [isMapCollapsed, setIsMapCollapsed] = useState(false);

  return (
    <div className="flex flex-col h-full bg-surface-2 dark:bg-elevation-2 dark:bg-elevation-1 relative overflow-hidden">
      
      {/* RENTAL COMPARABLES MAP SECTION */}
      {hasSubjectCoords && (
        <div className="flex-shrink-0 border-b border-light-border dark:border-dark-border dark:border-dark-border bg-surface-1 dark:bg-elevation-1">
          {/* Map Header - Always visible */}
          <button
            onClick={() => setIsMapCollapsed(!isMapCollapsed)}
            className="w-full flex items-center justify-between px-4 py-2 hover:bg-surface-2 dark:bg-elevation-2 dark:hover:bg-elevation-3 transition-colors"
          >
            <div className="flex items-center gap-2">
              <MapIcon className="w-4 h-4 text-accent-teal-mint" />
              <span className="font-semibold text-sm text-slate-700 dark:text-slate-200">Rental Comparables Map</span>
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
                  lat: SUBJECT_RENT_PROPERTY.lat!,
                  lng: SUBJECT_RENT_PROPERTY.lng!,
                  address: SUBJECT_RENT_PROPERTY.address,
                  propertyName: SUBJECT_RENT_PROPERTY.address,
                }}
                comparables={compsWithCoords.map((comp, index) => ({
                  id: comp.id,
                  lat: comp.lat!,
                  lng: comp.lng!,
                  label: `Comp ${index + 1}`,
                  address: `${comp.address}, ${comp.cityStateZip}`,
                  details: formatRentPerSf(comp.nnnRentPerSf),
                }))}
                type="rental-comps"
                height={280}
              />
            </div>
          )}
        </div>
      )}
      
      {/* SCROLLABLE AREA */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-auto custom-scrollbar relative bg-surface-1 dark:bg-elevation-1" 
        style={{ isolation: 'isolate' }}
      >
        {/* Horizontal Scroll Indicator - hidden but keeps scroll functionality */}
        <HorizontalScrollIndicator scrollContainerRef={scrollContainerRef} stickyTop={120} hideIndicator={true} />
        
        {/* GRID CONTAINER */}
        <div 
          className="grid relative bg-surface-1 dark:bg-elevation-1" 
          style={{ 
            gridTemplateColumns: `${LABEL_COL_WIDTH}px ${SUBJECT_COL_WIDTH}px repeat(${comps.length}, ${COMP_COL_WIDTH}px)`, 
            minWidth: `${totalGridWidth}px` 
          }}
        >
          
          {/* ========== HEADER ROW ========== */}
          <div 
            className="sticky top-0 left-0 z-[120] bg-surface-1 dark:bg-elevation-1 border-b border-light-border dark:border-dark-border dark:border-dark-border flex items-end" 
            style={{ width: LABEL_COL_WIDTH, height: 120, transform: 'translateZ(0)', willChange: 'transform' }}
          >
            <div className="p-2 pl-3">
              <div className="font-bold text-slate-400 text-xs uppercase tracking-wider">Element</div>
            </div>
          </div>
          
          {/* Subject Header with Photo */}
          <div 
            className="sticky top-0 left-[160px] z-[110] border-b-2 border-harken-blue shadow-[4px_0_16px_rgba(0,0,0,0.08)] dark:shadow-none flex flex-col bg-surface-1 dark:bg-elevation-1"
            style={{ width: SUBJECT_COL_WIDTH, height: 120, transform: 'translateZ(0)', willChange: 'transform' }}
          >
            <div className="relative h-16 w-full overflow-hidden group">
              <img 
                src={SUBJECT_RENT_PROPERTY.imageUrl} 
                alt="Subject Property" 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
              />
              <div className="absolute top-1.5 left-1.5 bg-harken-blue text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                SUBJECT
              </div>
            </div>
            <div className="p-2 flex-1 flex flex-col gap-0.5 bg-sky-50 dark:bg-[#0f1f3a] border-r border-light-border dark:border-dark-border dark:border-dark-border">
              <h3 className="font-bold text-slate-800 dark:text-white text-xs leading-tight line-clamp-1" title={SUBJECT_RENT_PROPERTY.address}>
                {SUBJECT_RENT_PROPERTY.address.split(',')[0]}
              </h3>
              <div className="flex items-start gap-1 text-[10px] text-slate-500 dark:text-slate-400">
                <MapPin className="w-3 h-3 flex-shrink-0 mt-0.5 text-harken-blue" />
                <span className="line-clamp-1 leading-tight">{SUBJECT_RENT_PROPERTY.cityState}</span>
              </div>
            </div>
          </div>
          
          {/* Comp Headers with Photos */}
          {comps.map((comp, idx) => (
            <div 
              key={comp.id} 
              className="sticky top-0 z-[100] border-b border-light-border dark:border-dark-border dark:border-dark-border flex flex-col bg-surface-1 dark:bg-elevation-1"
              style={{ height: 120, transform: 'translateZ(0)', willChange: 'transform' }}
            >
              <div className="relative h-16 w-full overflow-hidden group">
                <img 
                  src={comp.imageUrl} 
                  alt={comp.address} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                />
                <div className="absolute top-1.5 right-1.5 bg-slate-900/70 backdrop-blur-sm text-white text-[10px] font-medium px-1.5 py-0.5 rounded shadow-sm flex items-center gap-1">
                  <Calendar className="w-2.5 h-2.5" />
                  {comp.leaseDate}
                </div>
                <button
                  onClick={() => handleDeleteComp(comp.id)}
                  className="absolute top-1.5 left-1.5 p-1 rounded bg-surface-1/80 dark:bg-elevation-1/80 hover:bg-accent-red-light dark:hover:bg-accent-red-light text-slate-400 hover:text-harken-error transition-all opacity-0 group-hover:opacity-100"
                  title="Remove this rental"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
              <div className="p-2 flex-1 flex flex-col gap-0.5 border-r border-light-border dark:border-dark-border dark:border-dark-border">
                <h3 className="font-bold text-slate-800 dark:text-white text-xs leading-tight line-clamp-1" title={comp.address}>
                  Rental {idx + 1}
                </h3>
                <div className="flex items-start gap-1 text-[10px] text-slate-500 dark:text-slate-400">
                  <MapPin className="w-3 h-3 flex-shrink-0 mt-0.5 text-harken-blue" />
                  <span className="line-clamp-1 leading-tight">{comp.cityStateZip}</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-auto">
                  <Activity className="w-3 h-3 text-accent-teal-mint" />
                  <span>{formatRentPerSf(comp.nnnRentPerSf)}/SF</span>
                </div>
              </div>
            </div>
          ))}

          {/* ========== TRANSACTION DATA SECTION ========== */}
          <div className="col-span-full relative z-[50] mt-4 border-y border-light-border dark:border-dark-border dark:border-dark-border">
            <div className="absolute left-0 right-0 h-full opacity-30 bg-surface-3 dark:bg-elevation-subtle"></div>
            <div 
              className="sticky left-0 w-fit px-4 py-2 font-bold text-xs uppercase tracking-widest bg-surface-2 dark:bg-elevation-2 dark:bg-elevation-1 text-slate-700 dark:text-slate-200 flex items-center gap-2"
              style={{ zIndex: 51 }}
            >
              TRANSACTION DATA
            </div>
          </div>

          {/* Transaction Data Rows */}
          {transactionRows.map(row => (
            <React.Fragment key={row.id}>
              <div 
                className="sticky left-0 z-[60] border-r border-b border-light-border dark:border-dark-border dark:border-dark-border flex items-center justify-between px-2 py-1.5 group bg-surface-1 dark:bg-elevation-1"
                style={{ width: LABEL_COL_WIDTH, transform: 'translateZ(0)' }}
              >
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400 truncate">{row.label}</span>
                {row.removable && (
                  <button
                    onClick={() => handleDeleteRow(row.id, 'transaction')}
                    className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-accent-red-light dark:hover:bg-accent-red-light text-slate-300 hover:text-harken-error transition-all"
                    title={`Remove ${row.label}`}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
              
              <div 
                className="sticky left-[160px] z-[55] border-r border-b border-light-border dark:border-dark-border dark:border-dark-border p-2 flex items-center justify-center text-xs bg-sky-50 dark:bg-[#0f1f3a] shadow-[4px_0_16px_rgba(0,0,0,0.05)] dark:shadow-none"
                style={{ width: SUBJECT_COL_WIDTH }}
              >
                <span className="font-medium text-slate-700 dark:text-slate-200">{getSubjectTransactionValue(row.id)}</span>
              </div>
              
              {comps.map(comp => (
                <div 
                  key={`${row.id}-${comp.id}`} 
                  className="border-r border-b border-light-border dark:border-dark-border dark:border-dark-border p-2 flex items-center justify-center text-xs bg-surface-1 dark:bg-elevation-1"
                >
                  <span className="font-medium text-slate-600 dark:text-slate-200">{getTransactionValue(comp, row.id)}</span>
                </div>
              ))}
            </React.Fragment>
          ))}

          {/* Add Element Button for Transaction Section */}
          <div 
            className={`sticky left-0 bg-surface-1 dark:bg-elevation-1 p-2 ${openElementDropdown === 'transaction' ? 'z-[500]' : 'z-[60]'}`}
            style={{ width: LABEL_COL_WIDTH }}
          >
            <AddElementButton section="transaction" />
          </div>
          <div 
            className="sticky left-[160px] z-[55] bg-surface-1 dark:bg-elevation-1 shadow-[4px_0_16px_rgba(0,0,0,0.05)] dark:shadow-none"
            style={{ width: SUBJECT_COL_WIDTH }}
          ></div>
          {comps.map(comp => (
            <div key={`add-trans-${comp.id}`} className="bg-surface-1 dark:bg-elevation-1"></div>
          ))}

          {/* ========== QUALITATIVE ADJUSTMENTS SECTION ========== */}
          <div className="col-span-full relative z-[50] mt-4 border-y border-accent-teal-mint dark:border-accent-teal-mint">
            <div className="absolute left-0 right-0 h-full opacity-30 bg-accent-teal-mint-light dark:bg-accent-teal-mint/20"></div>
            <div 
              className="sticky left-0 w-fit px-4 py-2 font-bold text-xs uppercase tracking-widest bg-accent-teal-mint-light dark:bg-elevation-1 text-accent-teal-mint dark:text-accent-teal-mint flex items-center gap-2"
              style={{ zIndex: 51 }}
            >
              QUALITATIVE ADJUSTMENTS
            </div>
          </div>

          {/* Qualitative Adjustment Rows */}
          {qualitativeRows.map(row => (
            <React.Fragment key={row.id}>
              <div 
                className="sticky left-0 z-[60] border-r border-b border-light-border dark:border-dark-border dark:border-dark-border flex items-center justify-between px-2 py-1.5 group bg-surface-1 dark:bg-elevation-1"
                style={{ width: LABEL_COL_WIDTH, transform: 'translateZ(0)' }}
              >
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400 truncate">{row.label}</span>
                <button
                  onClick={() => handleDeleteRow(row.id, 'qualitative')}
                  className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-accent-red-light dark:hover:bg-accent-red-light text-slate-300 hover:text-harken-error transition-all"
                  title={`Remove ${row.label}`}
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
              
              <div 
                className="sticky left-[160px] z-[55] border-r border-b border-light-border dark:border-dark-border dark:border-dark-border p-2 flex items-center justify-center text-xs bg-sky-50 dark:bg-[#0f1f3a] shadow-[4px_0_16px_rgba(0,0,0,0.05)] dark:shadow-none"
                style={{ width: SUBJECT_COL_WIDTH }}
              >
                <span className="font-medium text-slate-700 dark:text-slate-200">{getSubjectQualitativeValue(row.id)}</span>
              </div>
              
              {comps.map(comp => (
                <div 
                  key={`${row.id}-${comp.id}`} 
                  className="border-r border-b border-light-border dark:border-dark-border dark:border-dark-border p-2 flex items-center justify-center text-xs bg-surface-1 dark:bg-elevation-1"
                >
                  <AdjustmentChip compId={comp.id} rowId={row.field || row.id} />
                </div>
              ))}
            </React.Fragment>
          ))}

          {/* Add Element Button for Qualitative Section */}
          <div 
            className={`sticky left-0 bg-surface-1 dark:bg-elevation-1 p-2 ${openElementDropdown === 'qualitative' ? 'z-[500]' : 'z-[60]'}`}
            style={{ width: LABEL_COL_WIDTH }}
          >
            <AddElementButton section="qualitative" />
          </div>
          <div 
            className="sticky left-[160px] z-[55] bg-surface-1 dark:bg-elevation-1 shadow-[4px_0_16px_rgba(0,0,0,0.05)] dark:shadow-none"
            style={{ width: SUBJECT_COL_WIDTH }}
          ></div>
          {comps.map(comp => (
            <div key={`add-qual-${comp.id}`} className="bg-surface-1 dark:bg-elevation-1"></div>
          ))}

          {/* ========== OVERALL COMPARABILITY FOOTER ========== */}
          <div className="col-span-full relative z-[50] mt-4"></div>
          
          <div 
            className="sticky left-0 z-[60] bg-harken-blue border-b border-harken-blue p-3 flex items-center"
            style={{ width: LABEL_COL_WIDTH, transform: 'translateZ(0)' }}
          >
            <span className="text-xs font-bold text-white uppercase tracking-wide">Overall Comparability</span>
          </div>
          
          <div 
            className="sticky left-[160px] z-[55] bg-harken-blue border-b border-harken-blue p-3 flex items-center justify-center shadow-[4px_0_16px_rgba(0,0,0,0.15)]"
            style={{ width: SUBJECT_COL_WIDTH }}
          >
            <span className="text-xs font-bold text-white">N/A</span>
          </div>
          
          {comps.map(comp => (
            <div 
              key={`overall-${comp.id}`} 
              className="bg-harken-blue border-b border-harken-blue p-2 flex items-center justify-center"
            >
              <OverallChip comp={comp} />
            </div>
          ))}

        </div>

        {/* RENT INDICATION FOOTER - Stays centered, doesn't scroll horizontally */}
        <div 
          className="sticky left-0 bg-surface-2 dark:bg-elevation-2 dark:bg-elevation-1 border-t-2 border-border-muted dark:border-dark-border-muted p-8 pt-10"
          style={{ width: '100vw', maxWidth: '100%' }}
        >
          <div className="max-w-4xl mx-auto flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-8 bg-harken-blue rounded-full"></div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white uppercase tracking-wider">Rent Indication</h2>
              </div>
            </div>
            <div className="bg-surface-1 dark:bg-elevation-1 rounded-2xl border border-light-border dark:border-dark-border dark:border-dark-border p-6 shadow-sm">
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-sm text-slate-500 font-medium mb-2">Subject Size</div>
                  <div className="text-2xl font-bold text-slate-800 dark:text-white">{formatNumber(SUBJECT_RENT_PROPERTY.sizeSfBldg)} SF</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-slate-500 font-medium mb-2">Indicated Market Rent</div>
                  <div className="text-2xl font-bold text-harken-blue">
                    {formatRentPerSf(weightedAvgRent)}/SF
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-harken-gray-med font-medium mb-2">Annual Rent Potential</div>
                  <div className="text-2xl font-bold text-accent-teal-mint">
                    {formatCurrency(weightedAvgRent * SUBJECT_RENT_PROPERTY.sizeSfBldg)}
                  </div>
                </div>
              </div>
            </div>

            {/* Notes Section with AI Draft */}
            <div className="mt-6">
              <EnhancedTextArea
                label="Notes"
                value={notesText}
                onChange={handleNotesChange}
                placeholder="Type your analysis and assumptions here..."
                sectionContext="rent_comparable"
                helperText="AI can draft a market rent analysis based on your rental comparables."
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

