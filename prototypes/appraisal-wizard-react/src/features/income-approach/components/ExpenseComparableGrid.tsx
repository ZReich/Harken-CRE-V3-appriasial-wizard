import React, { useState, useEffect, useRef, useCallback } from 'react';
import { HorizontalScrollIndicator } from '../../../components/HorizontalScrollIndicator';
import EnhancedTextArea from '../../../components/EnhancedTextArea';
import { Plus, Trash2, MapPin, CheckCircle2, Circle, ChevronDown, PenLine, Building2 } from 'lucide-react';
import { ExpenseComp, ExpenseGridRow } from '../expenseTypes';
import { 
  MOCK_EXPENSE_COMPS, 
  SUBJECT_EXPENSE_PROPERTY, 
  EXPENSE_PROPERTY_ROWS,
  EXPENSE_CATEGORY_ROWS,
  EXPENSE_RATIO_ROWS,
  AVAILABLE_PROPERTY_ELEMENTS,
  AVAILABLE_EXPENSE_ELEMENTS,
  AvailableExpenseElement,
  formatCurrency, 
  formatPercent,
  formatNumber
} from '../expenseConstants';

// Grid column widths (matching LandSalesGrid)
const LABEL_COL_WIDTH = 160;
const SUBJECT_COL_WIDTH = 180;
const COMP_COL_WIDTH = 170;

// Props interface for controlled component
interface ExpenseComparableGridProps {
  /** Initial expense comparables - if empty, will show empty state */
  expenseComparables?: ExpenseComp[];
  /** Notes text for the expense analysis */
  notes?: string;
  /** Callback when comparables change */
  onCompsChange?: (comps: ExpenseComp[]) => void;
  /** Callback when notes change */
  onNotesChange?: (notes: string) => void;
}

export const ExpenseComparableGrid: React.FC<ExpenseComparableGridProps> = ({
  expenseComparables,
  notes: initialNotes = '',
  onCompsChange,
  onNotesChange,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  // Initialize from props, fallback to mock data if no data provided (for demo purposes)
  const [comps, setComps] = useState<ExpenseComp[]>(
    expenseComparables && expenseComparables.length > 0 ? expenseComparables : MOCK_EXPENSE_COMPS
  );
  const [notesText, setNotesText] = useState(initialNotes);
  const [propertyRows, setPropertyRows] = useState(EXPENSE_PROPERTY_ROWS);
  const [expenseRows, setExpenseRows] = useState(EXPENSE_CATEGORY_ROWS);
  const [ratioRows] = useState(EXPENSE_RATIO_ROWS);
  const [openElementDropdown, setOpenElementDropdown] = useState<'property' | 'expense' | null>(null);
  
  // Sync with parent when comps change
  const notifyCompsChange = useCallback((newComps: ExpenseComp[]) => {
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
    if (window.confirm('Are you sure you want to remove this expense comparable?')) {
      setComps(prev => {
        const newComps = prev.filter(c => c.id !== compId);
        notifyCompsChange(newComps);
        return newComps;
      });
    }
  };

  const handleToggleSelected = (compId: string) => {
    setComps(prev => {
      const newComps = prev.map(c => 
        c.id === compId ? { ...c, selected: !c.selected } : c
      );
      notifyCompsChange(newComps);
      return newComps;
    });
  };

  // Add an element from the available elements dropdown
  const handleAddElement = (section: 'property' | 'expense', element: AvailableExpenseElement) => {
    const newRow: ExpenseGridRow = { 
      id: element.id, 
      label: element.label + ':', 
      section: section, 
      format: element.format,
      removable: true 
    };
    
    if (section === 'property') {
      if (propertyRows.some(r => r.id === element.id)) return;
      setPropertyRows(prev => [...prev, newRow]);
    } else {
      if (expenseRows.some(r => r.id === element.id)) return;
      // Insert before totalExpensesPerSf
      const totalIndex = expenseRows.findIndex(r => r.id === 'totalExpensesPerSf');
      if (totalIndex >= 0) {
        setExpenseRows(prev => [...prev.slice(0, totalIndex), newRow, ...prev.slice(totalIndex)]);
      } else {
        setExpenseRows(prev => [...prev, newRow]);
      }
    }
    setOpenElementDropdown(null);
  };

  const handleAddCustomElement = (section: 'property' | 'expense') => {
    const name = prompt('Enter element name:');
    if (!name) return;
    const newId = name.toLowerCase().replace(/\s+/g, '_') + '_custom';
    const newRow: ExpenseGridRow = { 
      id: newId, 
      label: name + ':', 
      section: section, 
      format: section === 'expense' ? 'currency' : undefined,
      removable: true 
    };
    
    if (section === 'property') {
      setPropertyRows(prev => [...prev, newRow]);
    } else {
      const totalIndex = expenseRows.findIndex(r => r.id === 'totalExpensesPerSf');
      if (totalIndex >= 0) {
        setExpenseRows(prev => [...prev.slice(0, totalIndex), newRow, ...prev.slice(totalIndex)]);
      } else {
        setExpenseRows(prev => [...prev, newRow]);
      }
    }
    setOpenElementDropdown(null);
  };

  const getAvailableElements = (section: 'property' | 'expense') => {
    const existingIds = section === 'property' 
      ? propertyRows.map(r => r.id)
      : expenseRows.map(r => r.id);
    
    const allElements = section === 'property'
      ? AVAILABLE_PROPERTY_ELEMENTS
      : AVAILABLE_EXPENSE_ELEMENTS;
    
    return allElements.filter(el => !existingIds.includes(el.id));
  };

  const handleDeleteRow = (rowId: string, section: 'property' | 'expense') => {
    if (section === 'property') {
      setPropertyRows(prev => prev.filter(r => r.id !== rowId));
    } else {
      setExpenseRows(prev => prev.filter(r => r.id !== rowId));
    }
  };

  const formatValue = (value: any, format?: 'currency' | 'percent' | 'number'): string => {
    if (value === undefined || value === null) return '-';
    switch (format) {
      case 'currency': return formatCurrency(value);
      case 'percent': return formatPercent(value);
      case 'number': return formatNumber(value);
      default: return String(value);
    }
  };

  const getPropertyValue = (comp: ExpenseComp, rowId: string, format?: 'currency' | 'percent' | 'number') => {
    const value = comp[rowId as keyof ExpenseComp];
    return formatValue(value, format);
  };

  const getSubjectPropertyValue = (rowId: string, format?: 'currency' | 'percent' | 'number') => {
    const value = SUBJECT_EXPENSE_PROPERTY[rowId as keyof typeof SUBJECT_EXPENSE_PROPERTY];
    return formatValue(value, format);
  };

  // Add Element Button with Dropdown
  const AddElementButton = ({ section }: { section: 'property' | 'expense' }) => {
    const isOpen = openElementDropdown === section;
    const availableElements = getAvailableElements(section);
    
    return (
      <div className={`element-dropdown relative ${isOpen ? 'z-[500]' : ''}`}>
        <button 
          onClick={() => setOpenElementDropdown(isOpen ? null : section)}
          className="w-full py-2 px-3 border-2 border-dashed border-border-muted dark:border-dark-border-muted rounded-lg flex items-center justify-between gap-2 text-slate-500 font-semibold hover:border-harken-blue hover:text-harken-blue hover:bg-harken-blue/5 transition-all duration-300 group text-xs bg-surface-1 dark:bg-elevation-1"
        >
          <div className="flex items-center gap-2">
            <Plus size={12} className="text-slate-400 group-hover:text-harken-blue" />
            <span>Add Element</span>
          </div>
          <ChevronDown size={12} className={`text-slate-400 group-hover:text-harken-blue transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {isOpen && (
          <div className="absolute top-full left-0 mt-1 w-64 bg-surface-1 dark:bg-elevation-1 rounded-xl shadow-2xl border border-light-border dark:border-dark-border dark:border-dark-border z-[500] overflow-hidden">
            <div className="px-3 py-2 bg-surface-2 dark:bg-elevation-2 border-b border-light-border dark:border-dark-border">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Available Elements</span>
            </div>
            <div className="max-h-48 overflow-y-auto">
              {availableElements.length > 0 ? (
                availableElements.map(element => (
                  <button
                    key={element.id}
                    onClick={() => handleAddElement(section, element)}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-harken-blue/5 transition-colors border-b border-light-border dark:border-dark-border last:border-b-0 group"
                  >
                    <div className="font-medium text-slate-700 group-hover:text-harken-blue">{element.label}</div>
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
            <div className="border-t border-light-border dark:border-dark-border">
              <button
                onClick={() => handleAddCustomElement(section)}
                className="w-full text-left px-3 py-2.5 text-xs hover:bg-harken-blue/5 transition-colors flex items-center gap-2 text-harken-blue font-medium"
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

  // Calculate benchmark values from selected comps
  const selectedComps = comps.filter(c => c.selected);
  const avgExpenseRatio = selectedComps.length > 0
    ? selectedComps.reduce((acc, c) => acc + c.expenseRatioPercent, 0) / selectedComps.length
    : 0;
  const avgTotalExpPerSf = selectedComps.length > 0
    ? selectedComps.reduce((acc, c) => acc + c.totalExpensesPerSf, 0) / selectedComps.length
    : 0;

  return (
    <div className="flex flex-col h-full bg-surface-2 dark:bg-elevation-2 dark:bg-elevation-1 relative overflow-hidden">
      
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
            style={{ width: LABEL_COL_WIDTH, height: 120 }}
          >
            <div className="p-2 pl-3">
              <div className="font-bold text-slate-400 text-xs uppercase tracking-wider">Element</div>
            </div>
          </div>
          
          {/* Subject Header with Photo */}
          <div 
            className="sticky top-0 left-[160px] z-[110] border-b-2 border-harken-blue bg-surface-1 dark:bg-elevation-1 shadow-[4px_0_16px_rgba(0,0,0,0.08)] flex flex-col"
            style={{ width: SUBJECT_COL_WIDTH, height: 120 }}
          >
            <div className="relative h-16 w-full overflow-hidden group">
              <img 
                src={SUBJECT_EXPENSE_PROPERTY.imageUrl} 
                alt="Subject Property" 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
              />
              <div className="absolute top-1.5 left-1.5 bg-harken-blue text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                SUBJECT
              </div>
            </div>
            <div className="p-2 flex-1 flex flex-col gap-0.5 bg-sky-50 dark:bg-[#0f1f3a] border-r border-light-border dark:border-dark-border dark:border-dark-border">
              <h3 className="font-bold text-slate-800 dark:text-white text-xs leading-tight line-clamp-1" title={SUBJECT_EXPENSE_PROPERTY.address}>
                {SUBJECT_EXPENSE_PROPERTY.address.split(',')[0]}
              </h3>
              <div className="flex items-start gap-1 text-[10px] text-slate-500 dark:text-slate-400">
                <MapPin className="w-3 h-3 flex-shrink-0 mt-0.5 text-harken-blue" />
                <span className="line-clamp-1 leading-tight">{SUBJECT_EXPENSE_PROPERTY.cityState}</span>
              </div>
            </div>
          </div>
          
          {/* Comp Headers with Photos */}
          {comps.map((comp, idx) => (
            <div 
              key={comp.id} 
              className="sticky top-0 z-[100] border-b border-light-border dark:border-dark-border dark:border-dark-border bg-surface-1 dark:bg-elevation-1 flex flex-col"
              style={{ height: 120 }}
            >
              <div className="relative h-16 w-full overflow-hidden group">
                <img 
                  src={comp.imageUrl} 
                  alt={comp.address} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                />
                <div className="absolute top-1.5 right-1.5 bg-slate-900/70 backdrop-blur-sm text-white text-[10px] font-medium px-1.5 py-0.5 rounded shadow-sm flex items-center gap-1">
                  <Building2 className="w-2.5 h-2.5" />
                  {comp.propertyType}
                </div>
                <button
                  onClick={() => handleDeleteComp(comp.id)}
                  className="absolute top-1.5 left-1.5 p-1 rounded bg-surface-1/80 dark:bg-elevation-1/80 hover:bg-accent-red-light dark:hover:bg-accent-red-light text-slate-400 hover:text-harken-error transition-all opacity-0 group-hover:opacity-100"
                  title="Remove this comparable"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
              <div className="p-2 flex-1 flex flex-col gap-0.5 border-r border-light-border dark:border-dark-border dark:border-dark-border">
                <h3 className="font-bold text-slate-800 dark:text-white text-xs leading-tight line-clamp-1" title={comp.address}>
                  Comp {idx + 1}
                </h3>
                <div className="flex items-start gap-1 text-[10px] text-slate-500 dark:text-slate-400">
                  <MapPin className="w-3 h-3 flex-shrink-0 mt-0.5 text-harken-blue" />
                  <span className="line-clamp-1 leading-tight">{comp.cityStateZip}</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] mt-auto">
                  <button
                    onClick={() => handleToggleSelected(comp.id)}
                    className={`flex items-center gap-1 px-1.5 py-0.5 rounded transition-all ${
                      comp.selected 
                        ? 'bg-accent-teal-mint-light text-accent-teal-mint' 
                        : 'bg-harken-gray-light dark:bg-elevation-1 text-harken-gray-med hover:bg-harken-gray-light dark:hover:bg-harken-gray'
                    }`}
                  >
                    {comp.selected ? <CheckCircle2 className="w-3 h-3" /> : <Circle className="w-3 h-3" />}
                    <span className="font-medium">{comp.selected ? 'Selected' : 'Select'}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* ========== PROPERTY DATA SECTION ========== */}
          <div className="col-span-full relative z-[50] mt-4 border-y border-light-border dark:border-dark-border dark:border-dark-border">
            <div className="absolute left-0 right-0 h-full opacity-30 bg-surface-3 dark:bg-elevation-subtle"></div>
            <div 
              className="sticky left-0 w-fit px-4 py-2 font-bold text-xs uppercase tracking-widest bg-surface-2 dark:bg-elevation-2 dark:bg-elevation-1 text-slate-700 dark:text-slate-200 flex items-center gap-2"
              style={{ zIndex: 51 }}
            >
              PROPERTY DATA
            </div>
          </div>

          {/* Property Data Rows */}
          {propertyRows.map(row => (
            <React.Fragment key={row.id}>
              <div 
                className="sticky left-0 z-[60] border-r border-b border-light-border dark:border-dark-border dark:border-dark-border flex items-center justify-between px-2 py-1.5 group bg-surface-1 dark:bg-elevation-1"
                style={{ width: LABEL_COL_WIDTH, transform: 'translateZ(0)' }}
              >
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400 truncate">{row.label}</span>
                {row.removable && (
                  <button
                    onClick={() => handleDeleteRow(row.id, 'property')}
                    className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-accent-red-light dark:hover:bg-accent-red-light text-slate-300 hover:text-harken-error transition-all"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
              
              <div 
                className="sticky left-[160px] z-[55] border-r border-b border-light-border dark:border-dark-border dark:border-dark-border p-2 flex items-center justify-center text-xs bg-sky-50 dark:bg-[#0f1f3a] shadow-[4px_0_16px_rgba(0,0,0,0.05)] dark:shadow-none"
                style={{ width: SUBJECT_COL_WIDTH }}
              >
                <span className="font-medium text-slate-700 dark:text-slate-200">{getSubjectPropertyValue(row.id, row.format)}</span>
              </div>
              
              {comps.map(comp => (
                <div 
                  key={`${row.id}-${comp.id}`} 
                  className="border-r border-b border-light-border dark:border-dark-border dark:border-dark-border p-2 flex items-center justify-center text-xs bg-surface-1 dark:bg-elevation-1"
                >
                  <span className="font-medium text-slate-600 dark:text-slate-200">{getPropertyValue(comp, row.id, row.format)}</span>
                </div>
              ))}
            </React.Fragment>
          ))}

          {/* Add Element Button for Property Section */}
          <div 
            className={`sticky left-0 bg-surface-1 dark:bg-elevation-1 p-2 ${openElementDropdown === 'property' ? 'z-[500]' : 'z-[60]'}`}
            style={{ width: LABEL_COL_WIDTH }}
          >
            <AddElementButton section="property" />
          </div>
          <div 
            className="sticky left-[160px] z-[55] bg-surface-1 dark:bg-elevation-1 shadow-[4px_0_16px_rgba(0,0,0,0.05)]"
            style={{ width: SUBJECT_COL_WIDTH }}
          ></div>
          {comps.map(comp => (
            <div key={`add-prop-${comp.id}`} className="bg-surface-1 dark:bg-elevation-1"></div>
          ))}

          {/* ========== EXPENSE CATEGORIES SECTION ========== */}
          <div className="col-span-full relative z-[50] mt-4 border-y border-blue-200 dark:border-blue-800">
            <div className="absolute left-0 right-0 h-full opacity-30 bg-blue-50 dark:bg-blue-900/20"></div>
            <div 
              className="sticky left-0 w-fit px-4 py-2 font-bold text-xs uppercase tracking-widest bg-blue-50 dark:bg-elevation-1 text-blue-700 dark:text-blue-300 flex items-center gap-2"
              style={{ zIndex: 51 }}
            >
              EXPENSE CATEGORIES
            </div>
          </div>

          {/* Expense Category Rows */}
          {expenseRows.map(row => (
            <React.Fragment key={row.id}>
              <div 
                className={`sticky left-0 z-[60] border-r border-b border-light-border dark:border-dark-border dark:border-dark-border flex items-center justify-between px-2 py-1.5 group ${
                  row.id === 'totalExpensesPerSf' ? 'border-t-2 border-t-slate-800 dark:border-t-slate-600 bg-surface-2 dark:bg-elevation-2 dark:bg-elevation-1' : 'bg-surface-1 dark:bg-elevation-1'
                }`}
                style={{ width: LABEL_COL_WIDTH, transform: 'translateZ(0)' }}
              >
                <span className={`text-xs truncate ${
                  row.id === 'totalExpensesPerSf' ? 'font-black text-slate-900 dark:text-white uppercase' : 'font-medium text-slate-600 dark:text-slate-400'
                }`}>{row.label}</span>
                {row.removable !== false && (
                  <button
                    onClick={() => handleDeleteRow(row.id, 'expense')}
                    className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-accent-red-light dark:hover:bg-accent-red-light text-slate-300 hover:text-harken-error transition-all"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
              
              <div 
                className={`sticky left-[160px] z-[55] border-r border-b border-light-border dark:border-dark-border dark:border-dark-border p-2 flex items-center justify-center text-xs shadow-[4px_0_16px_rgba(0,0,0,0.05)] dark:shadow-none ${
                  row.id === 'totalExpensesPerSf' ? 'border-t-2 border-t-slate-800 dark:border-t-slate-600 bg-blue-100 dark:bg-blue-900/30' : 'bg-sky-50 dark:bg-[#0f1f3a]'
                }`}
                style={{ width: SUBJECT_COL_WIDTH }}
              >
                <span className={`font-medium text-slate-700 dark:text-slate-200 ${row.id === 'totalExpensesPerSf' ? 'font-bold' : ''}`}>
                  {getSubjectPropertyValue(row.id, row.format)}
                </span>
              </div>
              
              {comps.map(comp => (
                <div 
                  key={`${row.id}-${comp.id}`} 
                  className={`border-r border-b border-light-border dark:border-dark-border dark:border-dark-border p-2 flex items-center justify-center text-xs bg-surface-1 dark:bg-elevation-1 ${
                    row.id === 'totalExpensesPerSf' ? 'border-t-2 border-t-slate-800 dark:border-t-slate-600 bg-surface-2 dark:bg-elevation-2 dark:bg-elevation-1' : ''
                  }`}
                >
                  <span className={`font-medium ${
                    row.id === 'totalExpensesPerSf' ? 'font-bold text-accent-teal-mint dark:text-accent-teal-mint' : 'text-harken-gray dark:text-slate-200'
                  }`}>
                    {getPropertyValue(comp, row.id, row.format)}
                  </span>
                </div>
              ))}
            </React.Fragment>
          ))}

          {/* Add Element Button for Expense Section */}
          <div 
            className={`sticky left-0 bg-surface-1 dark:bg-elevation-1 p-2 ${openElementDropdown === 'expense' ? 'z-[500]' : 'z-[60]'}`}
            style={{ width: LABEL_COL_WIDTH }}
          >
            <AddElementButton section="expense" />
          </div>
          <div 
            className="sticky left-[160px] z-[55] bg-sky-50 dark:bg-[#0f1f3a] shadow-[4px_0_16px_rgba(0,0,0,0.05)] dark:shadow-none"
            style={{ width: SUBJECT_COL_WIDTH }}
          ></div>
          {comps.map(comp => (
            <div key={`add-exp-${comp.id}`} className="bg-surface-1 dark:bg-elevation-1"></div>
          ))}

          {/* ========== RATIOS SECTION ========== */}
          <div className="col-span-full relative z-[50] mt-4 border-y border-accent-teal-mint dark:border-accent-teal-mint">
            <div className="absolute left-0 right-0 h-full opacity-30 bg-accent-teal-mint-light dark:bg-accent-teal-mint/20"></div>
            <div 
              className="sticky left-0 w-fit px-4 py-2 font-bold text-xs uppercase tracking-widest bg-accent-teal-mint-light dark:bg-elevation-1 text-accent-teal-mint dark:text-accent-teal-mint flex items-center gap-2"
              style={{ zIndex: 51 }}
            >
              EXPENSE RATIOS
            </div>
          </div>

          {/* Ratio Rows */}
          {ratioRows.map(row => (
            <React.Fragment key={row.id}>
              <div 
                className="sticky left-0 z-[60] border-r border-b border-light-border dark:border-dark-border dark:border-dark-border flex items-center px-2 py-1.5 bg-surface-1 dark:bg-elevation-1"
                style={{ width: LABEL_COL_WIDTH, transform: 'translateZ(0)' }}
              >
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{row.label}</span>
              </div>
              
              <div 
                className="sticky left-[160px] z-[55] border-r border-b border-light-border dark:border-dark-border dark:border-dark-border p-2 flex items-center justify-center text-xs bg-sky-50 dark:bg-[#0f1f3a] shadow-[4px_0_16px_rgba(0,0,0,0.05)] dark:shadow-none"
                style={{ width: SUBJECT_COL_WIDTH }}
              >
                <span className="font-bold text-slate-700 dark:text-slate-200">{getSubjectPropertyValue(row.id, row.format)}</span>
              </div>
              
              {comps.map(comp => (
                <div 
                  key={`${row.id}-${comp.id}`} 
                  className={`border-r border-b border-light-border dark:border-dark-border dark:border-dark-border p-2 flex items-center justify-center text-xs ${
                    comp.selected ? 'bg-accent-teal-mint-light dark:bg-accent-teal-mint/30' : 'bg-surface-1 dark:bg-elevation-1'
                  }`}
                >
                  <span className={`font-bold ${comp.selected ? 'text-accent-teal-mint dark:text-accent-teal-mint' : 'text-harken-gray dark:text-slate-200'}`}>
                    {getPropertyValue(comp, row.id, row.format)}
                  </span>
                </div>
              ))}
            </React.Fragment>
          ))}

          {/* ========== BENCHMARK FOOTER ========== */}
          <div className="col-span-full relative z-[50] mt-4"></div>
          
          <div 
            className="sticky left-0 z-[60] bg-harken-blue border-b border-harken-blue p-3 flex items-center"
            style={{ width: LABEL_COL_WIDTH, transform: 'translateZ(0)' }}
          >
            <span className="text-xs font-bold text-white uppercase tracking-wide">Benchmark</span>
          </div>
          
          <div 
            className="sticky left-[160px] z-[55] bg-harken-blue border-b border-harken-blue p-3 flex items-center justify-center shadow-[4px_0_16px_rgba(0,0,0,0.15)]"
            style={{ width: SUBJECT_COL_WIDTH }}
          >
            <span className="text-xs font-bold text-white">—</span>
          </div>
          
          {comps.map(comp => (
            <div 
              key={`benchmark-${comp.id}`} 
              className={`p-2 flex items-center justify-center ${
                comp.selected ? 'bg-accent-teal-mint' : 'bg-harken-blue'
              }`}
            >
              {comp.selected ? (
                <CheckCircle2 className="w-5 h-5 text-white" />
              ) : (
                <span className="text-xs text-white/60">—</span>
              )}
            </div>
          ))}

        </div>

        {/* EXPENSE BENCHMARK FOOTER - Stays centered, doesn't scroll horizontally */}
        <div 
          className="sticky left-0 bg-surface-2 dark:bg-elevation-2 border-t-2 border-border-muted dark:border-dark-border-muted p-8 pt-10"
          style={{ width: '100vw', maxWidth: '100%' }}
        >
          <div className="max-w-4xl mx-auto flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-8 bg-harken-blue rounded-full"></div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white uppercase tracking-wider">Expense Benchmark</h2>
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400">
                Based on {selectedComps.length} selected comparable{selectedComps.length !== 1 ? 's' : ''}
              </div>
            </div>
            <div className="bg-surface-1 dark:bg-elevation-1 rounded-2xl border border-light-border dark:border-dark-border dark:border-dark-border p-6 shadow-sm">
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-sm text-slate-500 font-medium mb-2">Subject Expense Ratio</div>
                  <div className="text-2xl font-bold text-slate-800 dark:text-white">
                    {formatPercent(SUBJECT_EXPENSE_PROPERTY.expenseRatioPercent || 0)}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-slate-500 font-medium mb-2">Market Avg Expense Ratio</div>
                  <div className="text-2xl font-bold text-harken-blue">
                    {formatPercent(avgExpenseRatio)}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-harken-gray-med font-medium mb-2">Market Avg $/SF</div>
                  <div className="text-2xl font-bold text-accent-teal-mint">
                    {formatCurrency(avgTotalExpPerSf)}
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
                sectionContext="expense_comparable"
                helperText="AI can draft an expense analysis based on your comparable data."
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

