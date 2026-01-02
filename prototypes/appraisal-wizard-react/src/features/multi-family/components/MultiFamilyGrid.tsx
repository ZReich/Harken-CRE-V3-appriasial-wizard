import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, ArrowUpRight, ArrowDownRight, Minus, MapPin, Activity, ChevronDown, PenLine } from 'lucide-react';
import { MultiFamilyComp, MultiFamilyGridRow, AvailableMultiFamilyElement } from '../types';
import { 
  MOCK_MF_COMPS, 
  SUBJECT_MF_PROPERTY, 
  TRANSACTION_ROWS,
  QUANTITATIVE_ROWS,
  QUALITATIVE_ROWS,
  formatCurrency, 
  formatPercent,
  LABEL_COL_WIDTH,
  SUBJECT_COL_WIDTH,
  COMP_COL_WIDTH,
  ACTION_COL_WIDTH,
} from '../constants';
import { HorizontalScrollIndicator } from '../../../components/HorizontalScrollIndicator';
import EnhancedTextArea from '../../../components/EnhancedTextArea';
import { useWizard } from '../../../context/WizardContext';
import { getAvailableElements as filterElements, normalizeSection } from '../../../utils/elementFilter';
import type { SectionType } from '../../../constants/elementRegistry';

interface MultiFamilyGridProps {
  scenarioId?: number;
}

export const MultiFamilyGrid: React.FC<MultiFamilyGridProps> = ({ scenarioId }) => {
  const { setApproachConclusion, state: wizardState } = useWizard();
  const { propertyType, propertySubtype, scenarios, activeScenarioId } = wizardState;
  const currentScenario = scenarios.find(s => s.id === activeScenarioId)?.name;
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  const [comps, setComps] = useState<MultiFamilyComp[]>(MOCK_MF_COMPS);
  const [transactionRows, setTransactionRows] = useState(TRANSACTION_ROWS);
  const [quantitativeRows, setQuantitativeRows] = useState(QUANTITATIVE_ROWS);
  const [qualitativeRows, setQualitativeRows] = useState(QUALITATIVE_ROWS);
  const [activePopover, setActivePopover] = useState<{rowId: string, compId: string} | null>(null);
  const [openElementDropdown, setOpenElementDropdown] = useState<'transaction' | 'quantitative' | 'qualitative' | null>(null);
  const [notesText, setNotesText] = useState('');

  // Calculate total grid width
  const totalGridWidth = LABEL_COL_WIDTH + SUBJECT_COL_WIDTH + (comps.length * COMP_COL_WIDTH) + ACTION_COL_WIDTH;

  // Calculate average adjusted rental rate
  const averageAdjustedRate = comps.length > 0
    ? comps.reduce((acc, c) => {
        const totalAdj = (c.parkingAdj + c.qualityConditionAdj + c.yearBuiltAdj) / 100;
        return acc + c.rentalRatePerMonth * (1 + totalAdj);
      }, 0) / comps.length
    : 0;

  // Sync to reconciliation
  useEffect(() => {
    if (scenarioId !== undefined && averageAdjustedRate > 0) {
      setApproachConclusion(scenarioId, 'Multi-Family Approach', Math.round(averageAdjustedRate));
    }
  }, [scenarioId, averageAdjustedRate, setApproachConclusion]);

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
    if (window.confirm('Are you sure you want to remove this rental comparable?')) {
      setComps(prev => prev.filter(c => c.id !== compId));
    }
  };

  const handleUpdateComp = (compId: string, field: keyof MultiFamilyComp, value: any) => {
    setComps(prev => prev.map(c => 
      c.id === compId ? { ...c, [field]: value } : c
    ));
  };

  const handleAddElement = (section: 'transaction' | 'quantitative' | 'qualitative', element: AvailableMultiFamilyElement) => {
    const newRow: MultiFamilyGridRow = { 
      id: element.id, 
      label: element.label + ':', 
      section: section, 
      removable: true 
    };
    
    if (section === 'transaction') {
      if (transactionRows.some(r => r.id === element.id)) return;
      setTransactionRows(prev => [...prev, newRow]);
    } else if (section === 'quantitative') {
      if (quantitativeRows.some(r => r.id === element.id)) return;
      setQuantitativeRows(prev => [...prev, newRow]);
    } else {
      if (qualitativeRows.some(r => r.id === element.id)) return;
      setQualitativeRows(prev => [...prev, newRow]);
    }
    setOpenElementDropdown(null);
  };

  const handleAddCustomElement = (section: 'transaction' | 'quantitative' | 'qualitative') => {
    const name = prompt('Enter element name:');
    if (!name) return;
    const newId = name.toLowerCase().replace(/\s+/g, '_') + '_custom';
    const newRow: MultiFamilyGridRow = { 
      id: newId, 
      label: name + ':', 
      section: section, 
      removable: true 
    };
    
    if (section === 'transaction') {
      setTransactionRows(prev => [...prev, newRow]);
    } else if (section === 'quantitative') {
      setQuantitativeRows(prev => [...prev, newRow]);
    } else {
      setQualitativeRows(prev => [...prev, newRow]);
    }
    setOpenElementDropdown(null);
  };

  // Get available elements for a section using dynamic filtering
  const getAvailableElements = (section: 'transaction' | 'quantitative' | 'qualitative') => {
    const existingIds = section === 'transaction' 
      ? transactionRows.map(r => r.id)
      : section === 'quantitative'
        ? quantitativeRows.map(r => r.id)
        : qualitativeRows.map(r => r.id);
    
    // Normalize section for registry lookup
    const normalizedSection = normalizeSection(section) as SectionType;
    
    // Filter elements based on current context - default to multifamily for this grid
    const filteredElements = filterElements({
      section: normalizedSection,
      propertyType: propertyType || 'commercial',
      subtype: propertySubtype || 'multifamily',
      approach: 'multi_family',
      scenario: currentScenario,
      excludeKeys: existingIds
    });
    
    // Map to the format expected by this grid
    const mappedElements: AvailableMultiFamilyElement[] = filteredElements.map(el => ({
      id: el.key,
      label: el.label,
      description: el.description,
      section: section  // Add the section from the function parameter
    }));
    
    return mappedElements;
  };

  const handleDeleteRow = (rowId: string, section: 'transaction' | 'quantitative' | 'qualitative') => {
    if (section === 'transaction') {
      setTransactionRows(prev => prev.filter(r => r.id !== rowId));
    } else if (section === 'quantitative') {
      setQuantitativeRows(prev => prev.filter(r => r.id !== rowId));
    } else {
      setQualitativeRows(prev => prev.filter(r => r.id !== rowId));
    }
  };

  const getTransactionValue = (comp: MultiFamilyComp, rowId: string) => {
    switch (rowId) {
      case 'location': return comp.address;
      case 'propertyType': return comp.propertyType;
      case 'bedBath': return comp.bedBath;
      case 'includedUtilities': return comp.includedUtilities;
      case 'rentalRate': return formatCurrency(comp.rentalRatePerMonth);
      default: return '-';
    }
  };

  const getSubjectTransactionValue = (rowId: string) => {
    switch (rowId) {
      case 'location': return `${SUBJECT_MF_PROPERTY.address}, ${SUBJECT_MF_PROPERTY.cityState}`;
      case 'propertyType': return SUBJECT_MF_PROPERTY.propertyType;
      case 'bedBath': return SUBJECT_MF_PROPERTY.bedBath;
      case 'includedUtilities': return SUBJECT_MF_PROPERTY.includedUtilities;
      case 'rentalRate': return SUBJECT_MF_PROPERTY.currentRentPerMonth ? formatCurrency(SUBJECT_MF_PROPERTY.currentRentPerMonth) : 'TBD';
      default: return '-';
    }
  };

  const getSubjectQualitativeValue = (rowId: string) => {
    switch (rowId) {
      case 'locationQual': return SUBJECT_MF_PROPERTY.cityState;
      case 'bedBathQual': return SUBJECT_MF_PROPERTY.bedBath;
      case 'utilitiesQual': return SUBJECT_MF_PROPERTY.includedUtilities;
      case 'parkingQual': return SUBJECT_MF_PROPERTY.parking || '-';
      case 'yearBuiltQual': return SUBJECT_MF_PROPERTY.yearBuilt?.toString() || '-';
      case 'conditionQual': return SUBJECT_MF_PROPERTY.condition || '-';
      default: return '-';
    }
  };

  const cycleQualitativeValue = (currentValue: string): 'Similar' | 'Superior' | 'Inferior' => {
    const cycle: ('Similar' | 'Superior' | 'Inferior')[] = ['Similar', 'Superior', 'Inferior'];
    const currentIndex = cycle.indexOf(currentValue as any);
    return cycle[(currentIndex + 1) % cycle.length];
  };

  // Adjustment Chip Component
  const AdjustmentChip = ({ compId, rowId }: { compId: string, rowId: string }) => {
    const comp = comps.find(c => c.id === compId);
    const currentValue = comp?.[rowId as keyof MultiFamilyComp] as string || 'Similar';
    
    const handleClick = () => {
      const nextValue = cycleQualitativeValue(currentValue);
      handleUpdateComp(compId, rowId as keyof MultiFamilyComp, nextValue);
    };

    const isSup = currentValue === 'Superior';
    const isInf = currentValue === 'Inferior';
    const baseClass = `inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide border shadow-sm transition-all cursor-pointer select-none active:scale-95`;
    
    if (isSup) return (
      <span onClick={handleClick} className={`${baseClass} bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300`} title="Click to change">
        <ArrowUpRight className="w-3 h-3" /> SUP
      </span>
    );
    if (isInf) return (
      <span onClick={handleClick} className={`${baseClass} bg-red-50 text-red-700 border-red-200 hover:bg-red-100 hover:border-red-300`} title="Click to change">
        <ArrowDownRight className="w-3 h-3" /> INF
      </span>
    );
    return (
      <span onClick={handleClick} className={`${baseClass} bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100 hover:border-slate-300`} title="Click to change">
        <Minus className="w-3 h-3" /> SIM
      </span>
    );
  };

  // Overall Chip Component
  const OverallChip = ({ comp }: { comp: MultiFamilyComp }) => {
    const currentValue = comp.overallComparability;
    
    const handleClick = () => {
      const nextValue = cycleQualitativeValue(currentValue);
      handleUpdateComp(comp.id, 'overallComparability', nextValue);
    };

    const isSup = currentValue === 'Superior';
    const isInf = currentValue === 'Inferior';
    const baseClass = `inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide border-2 shadow-sm transition-all cursor-pointer select-none active:scale-95`;
    
    if (isSup) return (
      <span onClick={handleClick} className={`${baseClass} bg-emerald-500 text-white border-emerald-400 hover:bg-emerald-600`} title="Click to change">
        <ArrowUpRight className="w-3.5 h-3.5" /> Superior
      </span>
    );
    if (isInf) return (
      <span onClick={handleClick} className={`${baseClass} bg-red-500 text-white border-red-400 hover:bg-red-600`} title="Click to change">
        <ArrowDownRight className="w-3.5 h-3.5" /> Inferior
      </span>
    );
    return (
      <span onClick={handleClick} className={`${baseClass} bg-white/20 text-white border-white/40 hover:bg-white/30`} title="Click to change">
        <Minus className="w-3.5 h-3.5" /> Similar
      </span>
    );
  };

  // Add Element Button
  const AddElementButton = ({ section }: { section: 'transaction' | 'quantitative' | 'qualitative' }) => {
    const isOpen = openElementDropdown === section;
    const availableElements = getAvailableElements(section);
    
    return (
      <div className={`element-dropdown relative ${isOpen ? 'z-[500]' : ''}`}>
        <button 
          onClick={() => setOpenElementDropdown(isOpen ? null : section)}
          className="w-full py-2 px-3 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-between gap-2 text-slate-500 font-semibold hover:border-[#0da1c7] hover:text-[#0da1c7] hover:bg-[#0da1c7]/5 transition-all duration-300 group text-xs bg-white"
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
                Type My Own...
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Quantitative adjustment cell
  const renderQuantitativeCell = (comp: MultiFamilyComp, rowId: string) => {
    const value = comp[rowId as keyof MultiFamilyComp] as number || 0;
    return (
      <span className={`font-medium ${value !== 0 ? (value > 0 ? 'text-red-600' : 'text-emerald-600') : 'text-slate-500'}`}>
        {formatPercent(value)}
      </span>
    );
  };

  // Calculate adjusted rate for a comp
  const getAdjustedRate = (comp: MultiFamilyComp): number => {
    const totalAdj = (comp.parkingAdj + comp.qualityConditionAdj + comp.yearBuiltAdj) / 100;
    return comp.rentalRatePerMonth * (1 + totalAdj);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative overflow-hidden">
      
      {/* SCROLLABLE AREA */}
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
          style={{ minWidth: `${totalGridWidth}px` }}
        >
          {/* GRID CONTAINER */}
          <div 
            className="grid relative bg-white flex-shrink-0" 
            style={{ 
              gridTemplateColumns: `${LABEL_COL_WIDTH}px ${SUBJECT_COL_WIDTH}px repeat(${comps.length}, ${COMP_COL_WIDTH}px)`, 
              minWidth: `${LABEL_COL_WIDTH + SUBJECT_COL_WIDTH + (comps.length * COMP_COL_WIDTH)}px`,
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
          
          {/* Subject Header */}
          <div 
            className="sticky top-0 left-[160px] z-[110] border-b-2 border-[#0da1c7] shadow-[4px_0_16px_rgba(0,0,0,0.08)] flex flex-col"
            style={{ width: SUBJECT_COL_WIDTH, height: 120, backgroundColor: '#ffffff', transform: 'translateZ(0)', willChange: 'transform' }}
          >
            <div className="relative h-16 w-full overflow-hidden group">
              <img src={SUBJECT_MF_PROPERTY.imageUrl} alt="Subject Property" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute top-1.5 left-1.5 bg-[#0da1c7] text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                SUBJECT
              </div>
            </div>
            <div className="p-2 flex-1 flex flex-col gap-0.5 bg-sky-50 border-r border-slate-200">
              <h3 className="font-bold text-slate-800 dark:text-white text-xs leading-tight line-clamp-1" title={SUBJECT_MF_PROPERTY.address}>
                {SUBJECT_MF_PROPERTY.address}
              </h3>
              <div className="flex items-start gap-1 text-[10px] text-slate-500">
                <MapPin className="w-3 h-3 flex-shrink-0 mt-0.5 text-[#0da1c7]" />
                <span className="line-clamp-1 leading-tight">{SUBJECT_MF_PROPERTY.cityState}</span>
              </div>
            </div>
          </div>
          
          {/* Comp Headers */}
          {comps.map((comp, idx) => (
            <div 
              key={comp.id} 
              className="sticky top-0 z-[100] border-b border-slate-200 flex flex-col"
              style={{ height: 120, backgroundColor: '#ffffff', transform: 'translateZ(0)', willChange: 'transform' }}
            >
              <div className="relative h-16 w-full overflow-hidden group">
                <img src={comp.imageUrl} alt={comp.address} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute top-1.5 right-1.5 bg-slate-900 text-white text-[10px] font-medium px-1.5 py-0.5 rounded shadow-sm">
                  {formatCurrency(comp.rentalRatePerMonth)}/mo
                </div>
                <button
                  onClick={() => handleDeleteComp(comp.id)}
                  className="absolute top-1.5 left-1.5 p-1 rounded bg-white/80 hover:bg-red-100 text-slate-400 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                  title="Remove this rental"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
              <div className="p-2 flex-1 flex flex-col gap-0.5 border-r border-slate-200">
                <h3 className="font-bold text-slate-800 dark:text-white text-xs leading-tight line-clamp-1" title={comp.address}>
                  Rental {idx + 1}
                </h3>
                <div className="flex items-start gap-1 text-[10px] text-slate-500">
                  <MapPin className="w-3 h-3 flex-shrink-0 mt-0.5 text-[#0da1c7]" />
                  <span className="line-clamp-1 leading-tight">{comp.cityStateZip}</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-auto">
                  <Activity className="w-3 h-3 text-emerald-500" />
                  <span>{comp.bedBath}</span>
                </div>
              </div>
            </div>
          ))}

          {/* ========== TRANSACTION DATA SECTION ========== */}
          <div className="col-span-full relative z-[50] mt-4 border-y border-slate-200">
            <div className="absolute left-0 right-0 h-full bg-slate-100" style={{ opacity: 0.3 }}></div>
            <div className="sticky left-0 w-fit px-4 py-2 font-bold text-xs uppercase tracking-widest text-slate-700 flex items-center gap-2" style={{ zIndex: 51, backgroundColor: '#f9fafb' }}>
              TRANSACTION DATA
            </div>
          </div>

          {transactionRows.map(row => (
            <React.Fragment key={row.id}>
              <div className="sticky left-0 z-[60] border-r border-b border-slate-100 flex items-center justify-between px-2 py-1.5 group" style={{ width: LABEL_COL_WIDTH, backgroundColor: '#ffffff', transform: 'translateZ(0)' }}>
                <span className="text-xs font-medium text-slate-600 truncate">{row.label}</span>
                {row.removable && (
                  <button onClick={() => handleDeleteRow(row.id, 'transaction')} className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-red-100 text-slate-300 hover:text-red-500 transition-all">
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
              <div className="sticky left-[160px] z-[55] border-r border-b border-slate-100 p-2 flex items-center justify-center text-xs shadow-[4px_0_16px_rgba(0,0,0,0.05)]" style={{ width: SUBJECT_COL_WIDTH, backgroundColor: '#f0f9ff', transform: 'translateZ(0)' }}>
                <span className="font-medium text-slate-700">{getSubjectTransactionValue(row.id)}</span>
              </div>
              {comps.map(comp => (
                <div key={`${row.id}-${comp.id}`} className="border-r border-b border-slate-100 p-2 flex items-center justify-center text-xs bg-white">
                  <span className="font-medium text-slate-600">{getTransactionValue(comp, row.id)}</span>
                </div>
              ))}
            </React.Fragment>
          ))}

          {/* Add Element - Transaction */}
          <div className={`sticky left-0 p-2 ${openElementDropdown === 'transaction' ? 'z-[500]' : 'z-[60]'}`} style={{ width: LABEL_COL_WIDTH, backgroundColor: '#ffffff' }}>
            <AddElementButton section="transaction" />
          </div>
          <div className="sticky left-[160px] z-[55] shadow-[4px_0_16px_rgba(0,0,0,0.05)]" style={{ width: SUBJECT_COL_WIDTH, backgroundColor: '#ffffff' }}></div>
          {comps.map(comp => <div key={`add-trans-${comp.id}`} className="bg-white"></div>)}

          {/* ========== QUANTITATIVE ADJUSTMENTS SECTION ========== */}
          <div className="col-span-full relative z-[50] mt-4 border-y border-blue-200">
            <div className="absolute left-0 right-0 h-full bg-blue-50" style={{ opacity: 0.3 }}></div>
            <div className="sticky left-0 w-fit px-4 py-2 font-bold text-xs uppercase tracking-widest text-blue-700 flex items-center gap-2" style={{ zIndex: 51, backgroundColor: '#eff6ff' }}>
              QUANTITATIVE ADJUSTMENTS
            </div>
          </div>

          {quantitativeRows.map(row => (
            <React.Fragment key={row.id}>
              <div className="sticky left-0 z-[60] border-r border-b border-slate-100 flex items-center justify-between px-2 py-1.5 group" style={{ width: LABEL_COL_WIDTH, backgroundColor: '#ffffff', transform: 'translateZ(0)' }}>
                <span className="text-xs font-medium text-slate-600 truncate">{row.label}</span>
                {row.removable && (
                  <button onClick={() => handleDeleteRow(row.id, 'quantitative')} className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-red-100 text-slate-300 hover:text-red-500 transition-all">
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
              <div className="sticky left-[160px] z-[55] border-r border-b border-slate-100 p-2 flex items-center justify-center text-xs shadow-[4px_0_16px_rgba(0,0,0,0.05)]" style={{ width: SUBJECT_COL_WIDTH, backgroundColor: '#f0f9ff', transform: 'translateZ(0)' }}>
                <span className="font-medium text-slate-700">-</span>
              </div>
              {comps.map(comp => (
                <div key={`${row.id}-${comp.id}`} className="border-r border-b border-slate-100 p-2 flex items-center justify-center text-xs bg-white">
                  {renderQuantitativeCell(comp, row.field || row.id)}
                </div>
              ))}
            </React.Fragment>
          ))}

          {/* Add Element - Quantitative */}
          <div className={`sticky left-0 p-2 ${openElementDropdown === 'quantitative' ? 'z-[500]' : 'z-[60]'}`} style={{ width: LABEL_COL_WIDTH, backgroundColor: '#ffffff' }}>
            <AddElementButton section="quantitative" />
          </div>
          <div className="sticky left-[160px] z-[55] shadow-[4px_0_16px_rgba(0,0,0,0.05)]" style={{ width: SUBJECT_COL_WIDTH, backgroundColor: '#f0f9ff' }}></div>
          {comps.map(comp => <div key={`add-quant-${comp.id}`} className="bg-white"></div>)}

          {/* ========== QUALITATIVE ADJUSTMENTS SECTION ========== */}
          <div className="col-span-full relative z-[50] mt-4 border-y border-emerald-200">
            <div className="absolute left-0 right-0 h-full bg-emerald-50" style={{ opacity: 0.3 }}></div>
            <div className="sticky left-0 w-fit px-4 py-2 font-bold text-xs uppercase tracking-widest text-emerald-700 flex items-center gap-2" style={{ zIndex: 51, backgroundColor: '#ecfdf5' }}>
              QUALITATIVE ADJUSTMENTS
            </div>
          </div>

          {qualitativeRows.map(row => (
            <React.Fragment key={row.id}>
              <div className="sticky left-0 z-[60] border-r border-b border-slate-100 flex items-center justify-between px-2 py-1.5 group" style={{ width: LABEL_COL_WIDTH, backgroundColor: '#ffffff', transform: 'translateZ(0)' }}>
                <span className="text-xs font-medium text-slate-600 truncate">{row.label}</span>
                {row.removable && (
                  <button onClick={() => handleDeleteRow(row.id, 'qualitative')} className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-red-100 text-slate-300 hover:text-red-500 transition-all">
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
              <div className="sticky left-[160px] z-[55] border-r border-b border-slate-100 p-2 flex items-center justify-center text-xs shadow-[4px_0_16px_rgba(0,0,0,0.05)]" style={{ width: SUBJECT_COL_WIDTH, backgroundColor: '#f0f9ff', transform: 'translateZ(0)' }}>
                <span className="font-medium text-slate-700">{getSubjectQualitativeValue(row.id)}</span>
              </div>
              {comps.map(comp => (
                <div key={`${row.id}-${comp.id}`} className="border-r border-b border-slate-100 p-2 flex items-center justify-center text-xs bg-white">
                  <AdjustmentChip compId={comp.id} rowId={row.field || row.id} />
                </div>
              ))}
            </React.Fragment>
          ))}

          {/* Add Element - Qualitative */}
          <div className={`sticky left-0 p-2 ${openElementDropdown === 'qualitative' ? 'z-[500]' : 'z-[60]'}`} style={{ width: LABEL_COL_WIDTH, backgroundColor: '#ffffff' }}>
            <AddElementButton section="qualitative" />
          </div>
          <div className="sticky left-[160px] z-[55] shadow-[4px_0_16px_rgba(0,0,0,0.05)]" style={{ width: SUBJECT_COL_WIDTH, backgroundColor: '#ffffff' }}></div>
          {comps.map(comp => <div key={`add-qual-${comp.id}`} className="bg-white"></div>)}

          {/* ========== SUMMARY SECTION ========== */}
          <div className="col-span-full relative z-[50] mt-4 border-y border-amber-200">
            <div className="absolute left-0 right-0 h-full bg-amber-50" style={{ opacity: 0.3 }}></div>
            <div className="sticky left-0 w-fit px-4 py-2 font-bold text-xs uppercase tracking-widest text-amber-700 flex items-center gap-2" style={{ zIndex: 51, backgroundColor: '#fffbeb' }}>
              SUMMARY
            </div>
          </div>

          {/* Overall Adjustment Row */}
          <React.Fragment>
            <div className="sticky left-0 z-[60] border-r border-b border-slate-100 flex items-center px-2 py-1.5" style={{ width: LABEL_COL_WIDTH, backgroundColor: '#ffffff', transform: 'translateZ(0)' }}>
              <span className="text-xs font-semibold text-slate-800 dark:text-white italic">Overall Adjustment:</span>
            </div>
            <div className="sticky left-[160px] z-[55] border-r border-b border-slate-100 p-2 flex items-center justify-center text-xs shadow-[4px_0_16px_rgba(0,0,0,0.05)]" style={{ width: SUBJECT_COL_WIDTH, backgroundColor: '#f0f9ff', transform: 'translateZ(0)' }}>
              <span className="font-medium text-slate-700">-</span>
            </div>
            {comps.map(comp => {
              const totalAdj = comp.parkingAdj + comp.qualityConditionAdj + comp.yearBuiltAdj;
              return (
                <div key={`overall-adj-${comp.id}`} className="border-r border-b border-slate-100 p-2 flex items-center justify-center text-xs bg-white">
                  <span className={`font-bold ${totalAdj !== 0 ? (totalAdj > 0 ? 'text-red-600' : 'text-emerald-600') : 'text-slate-500'}`}>
                    {formatPercent(totalAdj)}
                  </span>
                </div>
              );
            })}
          </React.Fragment>

          {/* Adjusted Rental Rates Row */}
          <React.Fragment>
            <div className="sticky left-0 z-[60] border-r border-b border-slate-100 flex items-center px-2 py-1.5" style={{ width: LABEL_COL_WIDTH, backgroundColor: '#ffffff', transform: 'translateZ(0)' }}>
              <span className="text-xs font-semibold text-slate-800 dark:text-white">Adjusted Rental Rates $...</span>
            </div>
            <div className="sticky left-[160px] z-[55] border-r border-b border-slate-100 p-2 flex items-center justify-center text-xs shadow-[4px_0_16px_rgba(0,0,0,0.05)]" style={{ width: SUBJECT_COL_WIDTH, backgroundColor: '#f0f9ff', transform: 'translateZ(0)' }}>
              <span className="font-medium text-slate-700">-</span>
            </div>
            {comps.map(comp => (
              <div key={`adj-rate-${comp.id}`} className="border-r border-b border-slate-100 p-2 flex items-center justify-center text-xs bg-white">
                <span className="font-bold text-emerald-700">{formatCurrency(getAdjustedRate(comp))}</span>
              </div>
            ))}
          </React.Fragment>

          {/* Adjusted Comp Range Row */}
          <React.Fragment>
            <div className="sticky left-0 z-[60] border-r border-b border-slate-100 flex items-center px-2 py-1.5" style={{ width: LABEL_COL_WIDTH, backgroundColor: '#fef3c7', transform: 'translateZ(0)' }}>
              <span className="text-xs font-black text-slate-900 uppercase">Adjusted Comp Range:</span>
            </div>
            <div className="sticky left-[160px] z-[55] border-r border-b border-slate-100 p-2 flex items-center justify-center text-xs shadow-[4px_0_16px_rgba(0,0,0,0.05)]" style={{ width: SUBJECT_COL_WIDTH, backgroundColor: '#fef3c7', transform: 'translateZ(0)' }}>
              <span className="font-bold text-amber-800">
                {comps.length > 0 ? `${formatCurrency(Math.min(...comps.map(c => getAdjustedRate(c))))} - ${formatCurrency(Math.max(...comps.map(c => getAdjustedRate(c))))}` : '-'}
              </span>
            </div>
            {comps.map(comp => (
              <div key={`range-${comp.id}`} className="border-r border-b border-slate-100 p-2 flex items-center justify-center text-xs" style={{ backgroundColor: '#fef3c7' }}></div>
            ))}
          </React.Fragment>

          {/* ========== OVERALL COMPARABILITY FOOTER ========== */}
          <div className="col-span-full relative z-[50] mt-4"></div>
          
          <div className="sticky left-0 z-[60] bg-[#0da1c7] border-b border-[#0da1c7] p-3 flex items-center" style={{ width: LABEL_COL_WIDTH, transform: 'translateZ(0)' }}>
            <span className="text-xs font-bold text-white uppercase tracking-wide">Overall Comparability</span>
          </div>
          <div className="sticky left-[160px] z-[55] bg-[#0da1c7] border-b border-[#0da1c7] p-3 flex items-center justify-center shadow-[4px_0_16px_rgba(0,0,0,0.15)]" style={{ width: SUBJECT_COL_WIDTH, transform: 'translateZ(0)' }}>
            <span className="text-xs font-bold text-white">N/A</span>
          </div>
          {comps.map(comp => (
            <div key={`overall-${comp.id}`} className="bg-[#0da1c7] border-b border-[#0da1c7] p-2 flex items-center justify-center">
              <OverallChip comp={comp} />
            </div>
          ))}

          </div>

          {/* ACTION COLUMN */}
          <div className="flex-shrink-0 bg-slate-50 flex flex-col items-center justify-start py-8 sticky top-0 self-start" style={{ width: ACTION_COL_WIDTH, height: 'auto', minHeight: 400 }}>
            <div className="flex flex-col items-center justify-center h-80 py-4">
              <button className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-white transition-colors group" title="Add a new comp">
                <div className="w-12 h-12 rounded-full bg-[#0da1c7]/20 flex items-center justify-center group-hover:bg-[#0da1c7]/30 transition-colors">
                  <Plus className="w-6 h-6 text-[#0da1c7]" />
                </div>
                <span className="text-xs font-semibold text-[#0da1c7]">Add Comps</span>
              </button>
            </div>
          </div>
        </div>

        {/* RENTAL INDICATION FOOTER - Stays centered, doesn't scroll horizontally */}
        <div 
          className="sticky left-0 bg-slate-50 border-t-2 border-slate-300 p-8 pt-10"
          style={{ width: '100vw', maxWidth: '100%' }}
        >
          <div className="max-w-4xl mx-auto flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <div className="w-2 h-8 bg-[#0da1c7] rounded-full"></div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white uppercase tracking-wider">Multi-Family Rental Indication</h2>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-sm text-slate-500 font-medium mb-2">Subject Unit Count</div>
                  <div className="text-2xl font-bold text-slate-800 dark:text-white">{SUBJECT_MF_PROPERTY.unitCount || '-'} Units</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-slate-500 font-medium mb-2">Indicated Market Rent</div>
                  <div className="text-2xl font-bold text-[#0da1c7]">
                    {formatCurrency(averageAdjustedRate)}/mo
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-slate-500 font-medium mb-2">Adjusted Comp Range</div>
                  <div className="text-2xl font-bold text-emerald-600">
                    {comps.length > 0 ? `${formatCurrency(Math.min(...comps.map(c => getAdjustedRate(c))))} - ${formatCurrency(Math.max(...comps.map(c => getAdjustedRate(c))))}` : '-'}
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
                sectionContext="multi_family"
                helperText="AI can draft a multi-family rental analysis based on your comparable data."
                minHeight={250}
                rows={8}
              />
            </div>
            
            <div className="h-8"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

