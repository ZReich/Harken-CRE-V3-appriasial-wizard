import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, ArrowUpRight, ArrowDownRight, Minus, MapPin, Activity, ChevronDown, PenLine } from 'lucide-react';
import { LandComp, GridRow } from '../types';
import { 
  MOCK_LAND_COMPS, 
  SUBJECT_PROPERTY, 
  TRANSACTION_DATA_ROWS,
  TRANSACTION_ADJ_ROWS,
  QUALITATIVE_ROWS,
  AVAILABLE_TRANSACTION_ELEMENTS,
  AVAILABLE_ADJUSTMENT_ELEMENTS,
  AVAILABLE_QUALITATIVE_ELEMENTS,
  AvailableElement,
  formatCurrency, 
  formatNumber 
} from '../constants';

interface Section {
  id: string;
  title: string;
  color: string;
}

const SECTIONS: Section[] = [
  { id: 'transaction', title: 'TRANSACTION DATA', color: 'bg-slate-100' },
  { id: 'adjustments', title: 'TRANSACTION ADJUSTMENTS', color: 'bg-blue-50' },
  { id: 'qualitative', title: 'QUALITATIVE ADJUSTMENTS', color: 'bg-emerald-50' },
];

// Grid column widths
const LABEL_COL_WIDTH = 160;
const SUBJECT_COL_WIDTH = 180;
const COMP_COL_WIDTH = 170;

export const LandSalesGrid: React.FC = () => {
  const [comps, setComps] = useState<LandComp[]>(MOCK_LAND_COMPS);
  const [transactionRows, setTransactionRows] = useState(TRANSACTION_DATA_ROWS);
  const [adjustmentRows, setAdjustmentRows] = useState(TRANSACTION_ADJ_ROWS);
  const [qualitativeRows, setQualitativeRows] = useState(QUALITATIVE_ROWS);
  const [activePopover, setActivePopover] = useState<{rowId: string, compId: string} | null>(null);
  const [hiddenSections, setHiddenSections] = useState<Set<string>>(new Set());
  const [openElementDropdown, setOpenElementDropdown] = useState<'transaction' | 'adjustments' | 'qualitative' | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Calculate total grid width
  const totalGridWidth = LABEL_COL_WIDTH + SUBJECT_COL_WIDTH + (comps.length * COMP_COL_WIDTH);

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

  // Add a custom element with user-typed name
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
    
    if (section === 'transaction') {
      setTransactionRows(prev => [...prev, newRow]);
    } else if (section === 'adjustments') {
      setAdjustmentRows(prev => [...prev, newRow]);
    } else {
      setQualitativeRows(prev => [...prev, newRow]);
    }
    setOpenElementDropdown(null);
  };

  // Get available elements for a section (excluding already added)
  const getAvailableElements = (section: 'transaction' | 'adjustments' | 'qualitative') => {
    const existingIds = section === 'transaction' 
      ? transactionRows.map(r => r.id)
      : section === 'adjustments'
        ? adjustmentRows.map(r => r.id)
        : qualitativeRows.map(r => r.id);
    
    const allElements = section === 'transaction'
      ? AVAILABLE_TRANSACTION_ELEMENTS
      : section === 'adjustments'
        ? AVAILABLE_ADJUSTMENT_ELEMENTS
        : AVAILABLE_QUALITATIVE_ELEMENTS;
    
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

  // Market Conditions Dropdown
  const MarketCondDropdown = ({ comp }: { comp: LandComp }) => (
    <select
      value={comp.marketCond}
      onChange={(e) => handleUpdateComp(comp.id, 'marketCond', e.target.value)}
      className="w-full text-center text-xs py-1 px-2 border border-slate-200 rounded-lg bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent transition-all"
    >
      <option value="Similar">Similar</option>
      <option value="Superior">Superior</option>
      <option value="Inferior">Inferior</option>
    </select>
  );

  // Overall Comparability Dropdown
  const OverallDropdown = ({ comp }: { comp: LandComp }) => (
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

  // Add Element Button with Dropdown - now positioned in the Elements column
  const AddElementButton = ({ section }: { section: 'transaction' | 'adjustments' | 'qualitative' }) => {
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

  return (
    <div className="flex flex-col h-full bg-slate-50 relative overflow-hidden">
      
      {/* SCROLLABLE AREA */}
      <div className="flex-1 overflow-auto custom-scrollbar relative bg-white">
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
          
          {/* Subject Header with Photo - SOLID background to prevent content showing through */}
          <div 
            className="sticky top-0 left-[160px] z-[110] border-b-2 border-[#0da1c7] bg-white shadow-[4px_0_16px_rgba(0,0,0,0.08)] flex flex-col"
            style={{ width: SUBJECT_COL_WIDTH, height: 120 }}
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
              <h3 className="font-bold text-slate-800 text-xs leading-tight line-clamp-1" title={SUBJECT_PROPERTY.address}>
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
              className="sticky top-0 z-[100] border-b border-slate-200 bg-white flex flex-col"
              style={{ height: 120 }}
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
                <h3 className="font-bold text-slate-800 text-xs leading-tight line-clamp-1" title={comp.address}>
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
              {/* Label Column */}
              <div 
                className="sticky left-0 z-[60] border-r border-b border-slate-100 flex items-center justify-between px-2 py-1.5 bg-white group"
                style={{ width: LABEL_COL_WIDTH }}
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
              
              {/* Subject Column - solid background */}
              <div 
                className="sticky left-[160px] z-[55] border-r border-b border-slate-100 p-2 flex items-center justify-center text-xs bg-sky-50 shadow-[4px_0_16px_rgba(0,0,0,0.05)]"
                style={{ width: SUBJECT_COL_WIDTH }}
              >
                <span className="font-medium text-slate-700">{getSubjectTransactionValue(row.id)}</span>
              </div>
              
              {/* Comp Columns */}
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

          {/* Add Element Button for Transaction Section - in Elements column */}
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

          {/* ========== TRANSACTION ADJUSTMENTS SECTION ========== */}
          <div className="col-span-full relative z-[50] mt-4 border-y border-blue-200">
            <div className="absolute left-0 right-0 h-full opacity-30 bg-blue-50"></div>
            <div 
              className="sticky left-0 w-fit px-4 py-2 font-bold text-xs uppercase tracking-widest backdrop-blur-sm bg-blue-50/95 text-blue-700 flex items-center gap-2"
              style={{ zIndex: 51 }}
            >
              TRANSACTION ADJUSTMENTS
            </div>
          </div>

          {/* Transaction Adjustment Rows */}
          {adjustmentRows.map(row => (
            <React.Fragment key={row.id}>
              {/* Label Column */}
              <div 
                className={`sticky left-0 z-[60] border-r border-b border-slate-100 flex items-center justify-between px-2 py-1.5 bg-white group ${
                  row.id === 'adjPriceAcre' ? 'border-t-2 border-t-slate-800 bg-slate-50' : ''
                }`}
                style={{ width: LABEL_COL_WIDTH }}
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
              
              {/* Subject Column - solid background */}
              <div 
                className={`sticky left-[160px] z-[55] border-r border-b border-slate-100 p-2 flex items-center justify-center text-xs shadow-[4px_0_16px_rgba(0,0,0,0.05)] ${
                  row.id === 'adjPriceAcre' ? 'border-t-2 border-t-slate-800 bg-blue-100' : 'bg-sky-50'
                }`}
                style={{ width: SUBJECT_COL_WIDTH }}
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
                    <MarketCondDropdown comp={comp} />
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
            className={`sticky left-0 bg-white p-2 ${openElementDropdown === 'adjustments' ? 'z-[500]' : 'z-[60]'}`}
            style={{ width: LABEL_COL_WIDTH }}
          >
            <AddElementButton section="adjustments" />
          </div>
          <div 
            className="sticky left-[160px] z-[55] bg-sky-50 shadow-[4px_0_16px_rgba(0,0,0,0.05)]"
            style={{ width: SUBJECT_COL_WIDTH }}
          ></div>
          {comps.map(comp => (
            <div key={`add-adj-${comp.id}`} className="bg-white"></div>
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
              {/* Label Column */}
              <div 
                className="sticky left-0 z-[60] border-r border-b border-slate-100 flex items-center justify-between px-2 py-1.5 bg-white group"
                style={{ width: LABEL_COL_WIDTH }}
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
              
              {/* Subject Column - solid background */}
              <div 
                className="sticky left-[160px] z-[55] border-r border-b border-slate-100 p-2 flex items-center justify-center text-xs bg-sky-50 shadow-[4px_0_16px_rgba(0,0,0,0.05)]"
                style={{ width: SUBJECT_COL_WIDTH }}
              >
                <span className="font-medium text-slate-700">{getSubjectQualitativeValue(row.id)}</span>
              </div>
              
              {/* Comp Columns */}
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

          {/* Add Element Button for Qualitative Section - in Elements column */}
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
          
          {/* Label Column */}
          <div 
            className="sticky left-0 z-[60] bg-[#0da1c7] border-b border-[#0da1c7] p-3 flex items-center"
            style={{ width: LABEL_COL_WIDTH }}
          >
            <span className="text-xs font-bold text-white uppercase tracking-wide">Overall Comparability</span>
          </div>
          
          {/* Subject Column */}
          <div 
            className="sticky left-[160px] z-[55] bg-[#0da1c7] border-b border-[#0da1c7] p-3 flex items-center justify-center shadow-[4px_0_16px_rgba(0,0,0,0.15)]"
            style={{ width: SUBJECT_COL_WIDTH }}
          >
            <span className="text-xs font-bold text-white">N/A</span>
          </div>
          
          {/* Comp Columns */}
          {comps.map(comp => (
            <div 
              key={`overall-${comp.id}`} 
              className="bg-[#0da1c7] border-b border-[#0da1c7] p-2 flex items-center justify-center"
            >
              <OverallDropdown comp={comp} />
            </div>
          ))}

        </div>

        {/* VALUE INDICATION FOOTER */}
        <div className="bg-slate-50 border-t-2 border-slate-300 p-8 pt-10" style={{ width: '100%', minWidth: '100%' }}>
          <div className="max-w-4xl mx-auto flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-8 bg-[#0da1c7] rounded-full"></div>
                <h2 className="text-xl font-bold text-slate-800 uppercase tracking-wider">Land Value Indication</h2>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-sm text-slate-500 font-medium mb-2">Subject Land Size</div>
                  <div className="text-2xl font-bold text-slate-800">{formatNumber(SUBJECT_PROPERTY.landAcres, 3)} Acres</div>
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
          </div>
        </div>
      </div>
    </div>
  );
};
