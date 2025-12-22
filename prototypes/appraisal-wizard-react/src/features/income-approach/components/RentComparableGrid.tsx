import React, { useState, useEffect, useRef } from 'react';
import { HorizontalScrollIndicator } from '../../../components/HorizontalScrollIndicator';
import EnhancedTextArea from '../../../components/EnhancedTextArea';
import { Plus, Trash2, ArrowUpRight, ArrowDownRight, Minus, MapPin, Activity, ChevronDown, PenLine, Calendar } from 'lucide-react';
import { RentComp, RentGridRow } from '../rentTypes';
import { 
  MOCK_RENT_COMPS, 
  SUBJECT_RENT_PROPERTY, 
  RENT_TRANSACTION_ROWS,
  RENT_QUALITATIVE_ROWS,
  AVAILABLE_TRANSACTION_ELEMENTS,
  AVAILABLE_QUALITATIVE_ELEMENTS,
  AvailableRentElement,
  formatCurrency, 
  formatNumber,
  formatRentPerSf
} from '../rentConstants';

// Grid column widths (matching LandSalesGrid)
const LABEL_COL_WIDTH = 160;
const SUBJECT_COL_WIDTH = 180;
const COMP_COL_WIDTH = 170;

export const RentComparableGrid: React.FC = () => {
  const [comps, setComps] = useState<RentComp[]>(MOCK_RENT_COMPS);
  const [transactionRows, setTransactionRows] = useState(RENT_TRANSACTION_ROWS);
  const [qualitativeRows, setQualitativeRows] = useState(RENT_QUALITATIVE_ROWS);
  const [openElementDropdown, setOpenElementDropdown] = useState<'transaction' | 'qualitative' | null>(null);
  const [notesText, setNotesText] = useState('');
  const _dropdownRef = useRef<HTMLDivElement>(null);
  void _dropdownRef; // Reserved for future click-outside handling
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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
      setComps(prev => prev.filter(c => c.id !== compId));
    }
  };

  const handleUpdateComp = (compId: string, field: keyof RentComp, value: any) => {
    setComps(prev => prev.map(c => 
      c.id === compId ? { ...c, [field]: value } : c
    ));
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
  const getAvailableElements = (section: 'transaction' | 'qualitative') => {
    const existingIds = section === 'transaction' 
      ? transactionRows.map(r => r.id)
      : qualitativeRows.map(r => r.id);
    
    const allElements = section === 'transaction'
      ? AVAILABLE_TRANSACTION_ELEMENTS
      : AVAILABLE_QUALITATIVE_ELEMENTS;
    
    return allElements.filter(el => !existingIds.includes(el.id));
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

  // Overall Comparability Dropdown
  const OverallDropdown = ({ comp }: { comp: RentComp }) => (
    <select
      value={comp.overallComparability}
      onChange={(e) => handleUpdateComp(comp.id, 'overallComparability', e.target.value as any)}
      className="w-full text-center text-xs py-1.5 px-2 border-0 bg-transparent cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/50 font-semibold text-white"
    >
      <option value="Superior" className="text-slate-800">Superior</option>
      <option value="Similar" className="text-slate-800">Similar</option>
      <option value="Inferior" className="text-slate-800">Inferior</option>
    </select>
  );

  // Add Element Button with Dropdown
  const AddElementButton = ({ section }: { section: 'transaction' | 'qualitative' }) => {
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

  // Calculate rent indication
  const averageRentPerSf = comps.length > 0 
    ? comps.reduce((acc, c) => acc + c.nnnRentPerSf, 0) / comps.length 
    : 0;
  
  const similarComps = comps.filter(c => c.overallComparability === 'Similar');
  const weightedAvgRent = similarComps.length > 0
    ? similarComps.reduce((acc, c) => acc + c.nnnRentPerSf, 0) / similarComps.length
    : averageRentPerSf;

  return (
    <div className="flex flex-col h-full bg-slate-50 relative overflow-hidden">
      
      {/* SCROLLABLE AREA */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-auto custom-scrollbar relative" 
        style={{ backgroundColor: '#ffffff', isolation: 'isolate' }}
      >
        {/* Horizontal Scroll Indicator - positioned below headers */}
        <HorizontalScrollIndicator scrollContainerRef={scrollContainerRef} stickyTop={120} />
        
        {/* GRID CONTAINER */}
        <div 
          className="grid relative bg-white" 
          style={{ 
            gridTemplateColumns: `${LABEL_COL_WIDTH}px ${SUBJECT_COL_WIDTH}px repeat(${comps.length}, ${COMP_COL_WIDTH}px)`, 
            minWidth: `${totalGridWidth}px` 
          }}
        >
          
          {/* ========== HEADER ROW ========== */}
          <div 
            className="sticky top-0 left-0 z-[120] bg-white border-b border-slate-200 flex items-end" 
            style={{ width: LABEL_COL_WIDTH, height: 120 }}
          >
            <div className="p-2 pl-3">
              <div className="font-bold text-slate-400 text-xs uppercase tracking-wider">Element</div>
            </div>
          </div>
          
          {/* Subject Header with Photo */}
          <div 
            className="sticky top-0 left-[160px] z-[110] border-b-2 border-[#0da1c7] bg-white shadow-[4px_0_16px_rgba(0,0,0,0.08)] flex flex-col"
            style={{ width: SUBJECT_COL_WIDTH, height: 120 }}
          >
            <div className="relative h-16 w-full overflow-hidden group">
              <img 
                src={SUBJECT_RENT_PROPERTY.imageUrl} 
                alt="Subject Property" 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
              />
              <div className="absolute top-1.5 left-1.5 bg-[#0da1c7] text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                SUBJECT
              </div>
            </div>
            <div className="p-2 flex-1 flex flex-col gap-0.5 bg-sky-50 border-r border-slate-200">
              <h3 className="font-bold text-slate-800 text-xs leading-tight line-clamp-1" title={SUBJECT_RENT_PROPERTY.address}>
                {SUBJECT_RENT_PROPERTY.address.split(',')[0]}
              </h3>
              <div className="flex items-start gap-1 text-[10px] text-slate-500">
                <MapPin className="w-3 h-3 flex-shrink-0 mt-0.5 text-[#0da1c7]" />
                <span className="line-clamp-1 leading-tight">{SUBJECT_RENT_PROPERTY.cityState}</span>
              </div>
            </div>
          </div>
          
          {/* Comp Headers with Photos */}
          {comps.map((comp, idx) => (
            <div 
              key={comp.id} 
              className="sticky top-0 z-[100] border-b border-slate-200 bg-white flex flex-col"
              style={{ height: 120 }}
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
                  className="absolute top-1.5 left-1.5 p-1 rounded bg-white/80 hover:bg-red-100 text-slate-400 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                  title="Remove this rental"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
              <div className="p-2 flex-1 flex flex-col gap-0.5 border-r border-slate-200">
                <h3 className="font-bold text-slate-800 text-xs leading-tight line-clamp-1" title={comp.address}>
                  Rental {idx + 1}
                </h3>
                <div className="flex items-start gap-1 text-[10px] text-slate-500">
                  <MapPin className="w-3 h-3 flex-shrink-0 mt-0.5 text-[#0da1c7]" />
                  <span className="line-clamp-1 leading-tight">{comp.cityStateZip}</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-auto">
                  <Activity className="w-3 h-3 text-emerald-500" />
                  <span>{formatRentPerSf(comp.nnnRentPerSf)}/SF</span>
                </div>
              </div>
            </div>
          ))}

          {/* ========== TRANSACTION DATA SECTION ========== */}
          <div className="col-span-full relative z-[50] mt-4 border-y border-slate-200">
            <div className="absolute left-0 right-0 h-full opacity-30 bg-slate-100"></div>
            <div 
              className="sticky left-0 w-fit px-4 py-2 font-bold text-xs uppercase tracking-widest backdrop-blur-sm bg-gray-50/95 text-slate-700 flex items-center gap-2"
              style={{ zIndex: 51 }}
            >
              TRANSACTION DATA
            </div>
          </div>

          {/* Transaction Data Rows */}
          {transactionRows.map(row => (
            <React.Fragment key={row.id}>
              <div 
                className="sticky left-0 z-[60] border-r border-b border-slate-100 flex items-center justify-between px-2 py-1.5 group"
                style={{ width: LABEL_COL_WIDTH, backgroundColor: '#ffffff', transform: 'translateZ(0)' }}
              >
                <span className="text-xs font-medium text-slate-600 truncate">{row.label}</span>
                {row.removable && (
                  <button
                    onClick={() => handleDeleteRow(row.id, 'transaction')}
                    className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-red-100 text-slate-300 hover:text-red-500 transition-all"
                    title={`Remove ${row.label}`}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
              
              <div 
                className="sticky left-[160px] z-[55] border-r border-b border-slate-100 p-2 flex items-center justify-center text-xs bg-sky-50 shadow-[4px_0_16px_rgba(0,0,0,0.05)]"
                style={{ width: SUBJECT_COL_WIDTH }}
              >
                <span className="font-medium text-slate-700">{getSubjectTransactionValue(row.id)}</span>
              </div>
              
              {comps.map(comp => (
                <div 
                  key={`${row.id}-${comp.id}`} 
                  className="border-r border-b border-slate-100 p-2 flex items-center justify-center text-xs bg-white"
                >
                  <span className="font-medium text-slate-600">{getTransactionValue(comp, row.id)}</span>
                </div>
              ))}
            </React.Fragment>
          ))}

          {/* Add Element Button for Transaction Section */}
          <div 
            className={`sticky left-0 bg-white p-2 ${openElementDropdown === 'transaction' ? 'z-[500]' : 'z-[60]'}`}
            style={{ width: LABEL_COL_WIDTH }}
          >
            <AddElementButton section="transaction" />
          </div>
          <div 
            className="sticky left-[160px] z-[55] bg-white shadow-[4px_0_16px_rgba(0,0,0,0.05)]"
            style={{ width: SUBJECT_COL_WIDTH }}
          ></div>
          {comps.map(comp => (
            <div key={`add-trans-${comp.id}`} className="bg-white"></div>
          ))}

          {/* ========== QUALITATIVE ADJUSTMENTS SECTION ========== */}
          <div className="col-span-full relative z-[50] mt-4 border-y border-emerald-200">
            <div className="absolute left-0 right-0 h-full opacity-30 bg-emerald-50"></div>
            <div 
              className="sticky left-0 w-fit px-4 py-2 font-bold text-xs uppercase tracking-widest backdrop-blur-sm bg-emerald-50/95 text-emerald-700 flex items-center gap-2"
              style={{ zIndex: 51 }}
            >
              QUALITATIVE ADJUSTMENTS
            </div>
          </div>

          {/* Qualitative Adjustment Rows */}
          {qualitativeRows.map(row => (
            <React.Fragment key={row.id}>
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
              
              <div 
                className="sticky left-[160px] z-[55] border-r border-b border-slate-100 p-2 flex items-center justify-center text-xs bg-sky-50 shadow-[4px_0_16px_rgba(0,0,0,0.05)]"
                style={{ width: SUBJECT_COL_WIDTH }}
              >
                <span className="font-medium text-slate-700">{getSubjectQualitativeValue(row.id)}</span>
              </div>
              
              {comps.map(comp => (
                <div 
                  key={`${row.id}-${comp.id}`} 
                  className="border-r border-b border-slate-100 p-2 flex items-center justify-center text-xs bg-white"
                >
                  <AdjustmentChip compId={comp.id} rowId={row.field || row.id} />
                </div>
              ))}
            </React.Fragment>
          ))}

          {/* Add Element Button for Qualitative Section */}
          <div 
            className={`sticky left-0 bg-white p-2 ${openElementDropdown === 'qualitative' ? 'z-[500]' : 'z-[60]'}`}
            style={{ width: LABEL_COL_WIDTH }}
          >
            <AddElementButton section="qualitative" />
          </div>
          <div 
            className="sticky left-[160px] z-[55] bg-white shadow-[4px_0_16px_rgba(0,0,0,0.05)]"
            style={{ width: SUBJECT_COL_WIDTH }}
          ></div>
          {comps.map(comp => (
            <div key={`add-qual-${comp.id}`} className="bg-white"></div>
          ))}

          {/* ========== OVERALL COMPARABILITY FOOTER ========== */}
          <div className="col-span-full relative z-[50] mt-4"></div>
          
          <div 
            className="sticky left-0 z-[60] bg-[#0da1c7] border-b border-[#0da1c7] p-3 flex items-center"
            style={{ width: LABEL_COL_WIDTH, transform: 'translateZ(0)' }}
          >
            <span className="text-xs font-bold text-white uppercase tracking-wide">Overall Comparability</span>
          </div>
          
          <div 
            className="sticky left-[160px] z-[55] bg-[#0da1c7] border-b border-[#0da1c7] p-3 flex items-center justify-center shadow-[4px_0_16px_rgba(0,0,0,0.15)]"
            style={{ width: SUBJECT_COL_WIDTH }}
          >
            <span className="text-xs font-bold text-white">N/A</span>
          </div>
          
          {comps.map(comp => (
            <div 
              key={`overall-${comp.id}`} 
              className="bg-[#0da1c7] border-b border-[#0da1c7] p-2 flex items-center justify-center"
            >
              <OverallDropdown comp={comp} />
            </div>
          ))}

        </div>

        {/* RENT INDICATION FOOTER - Stays centered, doesn't scroll horizontally */}
        <div 
          className="sticky left-0 bg-slate-50 border-t-2 border-slate-300 p-8 pt-10"
          style={{ width: '100vw', maxWidth: '100%' }}
        >
          <div className="max-w-4xl mx-auto flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-8 bg-[#0da1c7] rounded-full"></div>
                <h2 className="text-xl font-bold text-slate-800 uppercase tracking-wider">Rent Indication</h2>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-sm text-slate-500 font-medium mb-2">Subject Size</div>
                  <div className="text-2xl font-bold text-slate-800">{formatNumber(SUBJECT_RENT_PROPERTY.sizeSfBldg)} SF</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-slate-500 font-medium mb-2">Indicated Market Rent</div>
                  <div className="text-2xl font-bold text-[#0da1c7]">
                    {formatRentPerSf(weightedAvgRent)}/SF
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-slate-500 font-medium mb-2">Annual Rent Potential</div>
                  <div className="text-2xl font-bold text-emerald-600">
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
                onChange={setNotesText}
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

