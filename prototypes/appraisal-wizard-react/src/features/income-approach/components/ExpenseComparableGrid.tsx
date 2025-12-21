import React, { useState, useEffect } from 'react';
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

export const ExpenseComparableGrid: React.FC = () => {
  const [comps, setComps] = useState<ExpenseComp[]>(MOCK_EXPENSE_COMPS);
  const [propertyRows, setPropertyRows] = useState(EXPENSE_PROPERTY_ROWS);
  const [expenseRows, setExpenseRows] = useState(EXPENSE_CATEGORY_ROWS);
  const [ratioRows] = useState(EXPENSE_RATIO_ROWS);
  const [openElementDropdown, setOpenElementDropdown] = useState<'property' | 'expense' | null>(null);

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
      setComps(prev => prev.filter(c => c.id !== compId));
    }
  };

  const handleToggleSelected = (compId: string) => {
    setComps(prev => prev.map(c => 
      c.id === compId ? { ...c, selected: !c.selected } : c
    ));
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

  // Calculate benchmark values from selected comps
  const selectedComps = comps.filter(c => c.selected);
  const avgExpenseRatio = selectedComps.length > 0
    ? selectedComps.reduce((acc, c) => acc + c.expenseRatioPercent, 0) / selectedComps.length
    : 0;
  const avgTotalExpPerSf = selectedComps.length > 0
    ? selectedComps.reduce((acc, c) => acc + c.totalExpensesPerSf, 0) / selectedComps.length
    : 0;

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
          
          {/* Subject Header with Photo */}
          <div 
            className="sticky top-0 left-[160px] z-[110] border-b-2 border-[#0da1c7] bg-white shadow-[4px_0_16px_rgba(0,0,0,0.08)] flex flex-col"
            style={{ width: SUBJECT_COL_WIDTH, height: 120 }}
          >
            <div className="relative h-16 w-full overflow-hidden group">
              <img 
                src={SUBJECT_EXPENSE_PROPERTY.imageUrl} 
                alt="Subject Property" 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
              />
              <div className="absolute top-1.5 left-1.5 bg-[#0da1c7] text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                SUBJECT
              </div>
            </div>
            <div className="p-2 flex-1 flex flex-col gap-0.5 bg-sky-50 border-r border-slate-200">
              <h3 className="font-bold text-slate-800 text-xs leading-tight line-clamp-1" title={SUBJECT_EXPENSE_PROPERTY.address}>
                {SUBJECT_EXPENSE_PROPERTY.address.split(',')[0]}
              </h3>
              <div className="flex items-start gap-1 text-[10px] text-slate-500">
                <MapPin className="w-3 h-3 flex-shrink-0 mt-0.5 text-[#0da1c7]" />
                <span className="line-clamp-1 leading-tight">{SUBJECT_EXPENSE_PROPERTY.cityState}</span>
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
                  <Building2 className="w-2.5 h-2.5" />
                  {comp.propertyType}
                </div>
                <button
                  onClick={() => handleDeleteComp(comp.id)}
                  className="absolute top-1.5 left-1.5 p-1 rounded bg-white/80 hover:bg-red-100 text-slate-400 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                  title="Remove this comparable"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
              <div className="p-2 flex-1 flex flex-col gap-0.5 border-r border-slate-200">
                <h3 className="font-bold text-slate-800 text-xs leading-tight line-clamp-1" title={comp.address}>
                  Comp {idx + 1}
                </h3>
                <div className="flex items-start gap-1 text-[10px] text-slate-500">
                  <MapPin className="w-3 h-3 flex-shrink-0 mt-0.5 text-[#0da1c7]" />
                  <span className="line-clamp-1 leading-tight">{comp.cityStateZip}</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] mt-auto">
                  <button
                    onClick={() => handleToggleSelected(comp.id)}
                    className={`flex items-center gap-1 px-1.5 py-0.5 rounded transition-all ${
                      comp.selected 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
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
          <div className="col-span-full relative z-[50] mt-4 border-y border-slate-200">
            <div className="absolute left-0 right-0 h-full opacity-30 bg-slate-100"></div>
            <div 
              className="sticky left-0 w-fit px-4 py-2 font-bold text-xs uppercase tracking-widest backdrop-blur-sm bg-gray-50/95 text-slate-700 flex items-center gap-2"
              style={{ zIndex: 51 }}
            >
              PROPERTY DATA
            </div>
          </div>

          {/* Property Data Rows */}
          {propertyRows.map(row => (
            <React.Fragment key={row.id}>
              <div 
                className="sticky left-0 z-[60] border-r border-b border-slate-100 flex items-center justify-between px-2 py-1.5 bg-white group"
                style={{ width: LABEL_COL_WIDTH }}
              >
                <span className="text-xs font-medium text-slate-600 truncate">{row.label}</span>
                {row.removable && (
                  <button
                    onClick={() => handleDeleteRow(row.id, 'property')}
                    className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-red-100 text-slate-300 hover:text-red-500 transition-all"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
              
              <div 
                className="sticky left-[160px] z-[55] border-r border-b border-slate-100 p-2 flex items-center justify-center text-xs bg-sky-50 shadow-[4px_0_16px_rgba(0,0,0,0.05)]"
                style={{ width: SUBJECT_COL_WIDTH }}
              >
                <span className="font-medium text-slate-700">{getSubjectPropertyValue(row.id, row.format)}</span>
              </div>
              
              {comps.map(comp => (
                <div 
                  key={`${row.id}-${comp.id}`} 
                  className="border-r border-b border-slate-100 p-2 flex items-center justify-center text-xs bg-white"
                >
                  <span className="font-medium text-slate-600">{getPropertyValue(comp, row.id, row.format)}</span>
                </div>
              ))}
            </React.Fragment>
          ))}

          {/* Add Element Button for Property Section */}
          <div 
            className={`sticky left-0 bg-white p-2 ${openElementDropdown === 'property' ? 'z-[500]' : 'z-[60]'}`}
            style={{ width: LABEL_COL_WIDTH }}
          >
            <AddElementButton section="property" />
          </div>
          <div 
            className="sticky left-[160px] z-[55] bg-white shadow-[4px_0_16px_rgba(0,0,0,0.05)]"
            style={{ width: SUBJECT_COL_WIDTH }}
          ></div>
          {comps.map(comp => (
            <div key={`add-prop-${comp.id}`} className="bg-white"></div>
          ))}

          {/* ========== EXPENSE CATEGORIES SECTION ========== */}
          <div className="col-span-full relative z-[50] mt-4 border-y border-amber-200">
            <div className="absolute left-0 right-0 h-full opacity-30 bg-amber-50"></div>
            <div 
              className="sticky left-0 w-fit px-4 py-2 font-bold text-xs uppercase tracking-widest backdrop-blur-sm bg-amber-50/95 text-amber-700 flex items-center gap-2"
              style={{ zIndex: 51 }}
            >
              EXPENSE CATEGORIES
            </div>
          </div>

          {/* Expense Category Rows */}
          {expenseRows.map(row => (
            <React.Fragment key={row.id}>
              <div 
                className={`sticky left-0 z-[60] border-r border-b border-slate-100 flex items-center justify-between px-2 py-1.5 bg-white group ${
                  row.id === 'totalExpensesPerSf' ? 'border-t-2 border-t-slate-800 bg-slate-50' : ''
                }`}
                style={{ width: LABEL_COL_WIDTH }}
              >
                <span className={`text-xs truncate ${
                  row.id === 'totalExpensesPerSf' ? 'font-black text-slate-900 uppercase' : 'font-medium text-slate-600'
                }`}>{row.label}</span>
                {row.removable !== false && (
                  <button
                    onClick={() => handleDeleteRow(row.id, 'expense')}
                    className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-red-100 text-slate-300 hover:text-red-500 transition-all"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
              
              <div 
                className={`sticky left-[160px] z-[55] border-r border-b border-slate-100 p-2 flex items-center justify-center text-xs shadow-[4px_0_16px_rgba(0,0,0,0.05)] ${
                  row.id === 'totalExpensesPerSf' ? 'border-t-2 border-t-slate-800 bg-amber-100' : 'bg-sky-50'
                }`}
                style={{ width: SUBJECT_COL_WIDTH }}
              >
                <span className={`font-medium text-slate-700 ${row.id === 'totalExpensesPerSf' ? 'font-bold' : ''}`}>
                  {getSubjectPropertyValue(row.id, row.format)}
                </span>
              </div>
              
              {comps.map(comp => (
                <div 
                  key={`${row.id}-${comp.id}`} 
                  className={`border-r border-b border-slate-100 p-2 flex items-center justify-center text-xs bg-white ${
                    row.id === 'totalExpensesPerSf' ? 'border-t-2 border-t-slate-800 bg-slate-50' : ''
                  }`}
                >
                  <span className={`font-medium ${
                    row.id === 'totalExpensesPerSf' ? 'font-bold text-amber-700' : 'text-slate-600'
                  }`}>
                    {getPropertyValue(comp, row.id, row.format)}
                  </span>
                </div>
              ))}
            </React.Fragment>
          ))}

          {/* Add Element Button for Expense Section */}
          <div 
            className={`sticky left-0 bg-white p-2 ${openElementDropdown === 'expense' ? 'z-[500]' : 'z-[60]'}`}
            style={{ width: LABEL_COL_WIDTH }}
          >
            <AddElementButton section="expense" />
          </div>
          <div 
            className="sticky left-[160px] z-[55] bg-sky-50 shadow-[4px_0_16px_rgba(0,0,0,0.05)]"
            style={{ width: SUBJECT_COL_WIDTH }}
          ></div>
          {comps.map(comp => (
            <div key={`add-exp-${comp.id}`} className="bg-white"></div>
          ))}

          {/* ========== RATIOS SECTION ========== */}
          <div className="col-span-full relative z-[50] mt-4 border-y border-blue-200">
            <div className="absolute left-0 right-0 h-full opacity-30 bg-blue-50"></div>
            <div 
              className="sticky left-0 w-fit px-4 py-2 font-bold text-xs uppercase tracking-widest backdrop-blur-sm bg-blue-50/95 text-blue-700 flex items-center gap-2"
              style={{ zIndex: 51 }}
            >
              EXPENSE RATIOS
            </div>
          </div>

          {/* Ratio Rows */}
          {ratioRows.map(row => (
            <React.Fragment key={row.id}>
              <div 
                className="sticky left-0 z-[60] border-r border-b border-slate-100 flex items-center px-2 py-1.5 bg-white"
                style={{ width: LABEL_COL_WIDTH }}
              >
                <span className="text-xs font-medium text-slate-600">{row.label}</span>
              </div>
              
              <div 
                className="sticky left-[160px] z-[55] border-r border-b border-slate-100 p-2 flex items-center justify-center text-xs bg-sky-50 shadow-[4px_0_16px_rgba(0,0,0,0.05)]"
                style={{ width: SUBJECT_COL_WIDTH }}
              >
                <span className="font-bold text-slate-700">{getSubjectPropertyValue(row.id, row.format)}</span>
              </div>
              
              {comps.map(comp => (
                <div 
                  key={`${row.id}-${comp.id}`} 
                  className={`border-r border-b border-slate-100 p-2 flex items-center justify-center text-xs ${
                    comp.selected ? 'bg-emerald-50' : 'bg-white'
                  }`}
                >
                  <span className={`font-bold ${comp.selected ? 'text-emerald-700' : 'text-slate-600'}`}>
                    {getPropertyValue(comp, row.id, row.format)}
                  </span>
                </div>
              ))}
            </React.Fragment>
          ))}

          {/* ========== BENCHMARK FOOTER ========== */}
          <div className="col-span-full relative z-[50] mt-4"></div>
          
          <div 
            className="sticky left-0 z-[60] bg-[#0da1c7] border-b border-[#0da1c7] p-3 flex items-center"
            style={{ width: LABEL_COL_WIDTH }}
          >
            <span className="text-xs font-bold text-white uppercase tracking-wide">Benchmark</span>
          </div>
          
          <div 
            className="sticky left-[160px] z-[55] bg-[#0da1c7] border-b border-[#0da1c7] p-3 flex items-center justify-center shadow-[4px_0_16px_rgba(0,0,0,0.15)]"
            style={{ width: SUBJECT_COL_WIDTH }}
          >
            <span className="text-xs font-bold text-white">—</span>
          </div>
          
          {comps.map(comp => (
            <div 
              key={`benchmark-${comp.id}`} 
              className={`p-2 flex items-center justify-center ${
                comp.selected ? 'bg-emerald-500' : 'bg-[#0da1c7]'
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

        {/* EXPENSE BENCHMARK FOOTER */}
        <div className="bg-slate-50 border-t-2 border-slate-300 p-8 pt-10" style={{ width: '100%', minWidth: '100%' }}>
          <div className="max-w-4xl mx-auto flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-8 bg-[#0da1c7] rounded-full"></div>
                <h2 className="text-xl font-bold text-slate-800 uppercase tracking-wider">Expense Benchmark</h2>
              </div>
              <div className="text-sm text-slate-500">
                Based on {selectedComps.length} selected comparable{selectedComps.length !== 1 ? 's' : ''}
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-sm text-slate-500 font-medium mb-2">Subject Expense Ratio</div>
                  <div className="text-2xl font-bold text-slate-800">
                    {formatPercent(SUBJECT_EXPENSE_PROPERTY.expenseRatioPercent || 0)}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-slate-500 font-medium mb-2">Market Avg Expense Ratio</div>
                  <div className="text-2xl font-bold text-[#0da1c7]">
                    {formatPercent(avgExpenseRatio)}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-slate-500 font-medium mb-2">Market Avg $/SF</div>
                  <div className="text-2xl font-bold text-emerald-600">
                    {formatCurrency(avgTotalExpPerSf)}
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

