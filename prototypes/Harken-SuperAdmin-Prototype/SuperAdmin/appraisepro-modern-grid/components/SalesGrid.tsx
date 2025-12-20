import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  ArrowUpRight, 
  ArrowDownRight, 
  Minus,
  ChevronDown
} from 'lucide-react';
import { Property, GridRowData, PropertyValues, ComparisonValue } from '../types';
import { PropertyCard } from './PropertyCard';
import { INITIAL_ROWS, SECTIONS, AVAILABLE_ELEMENTS } from '../constants';

interface SalesGridProps {
  properties: Property[];
  values: PropertyValues;
}

export const SalesGrid: React.FC<SalesGridProps> = ({ properties, values: initialValues }) => {
  const [rows, setRows] = useState<GridRowData[]>(INITIAL_ROWS);
  const [values, setValues] = useState<PropertyValues>(initialValues);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  // Constants for sticky positioning
  const LABEL_COL_WIDTH = 160;
  const SUBJECT_COL_WIDTH = 180;
  const COMP_COL_WIDTH = 170;

  const formatValue = (val: string | number | null | undefined, format?: string) => {
    if (val === null || val === undefined) return '-';
    if (format === 'currency' && typeof val === 'number') {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
    }
    if (format === 'percent' && typeof val === 'number') {
      return new Intl.NumberFormat('en-US', { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);
    }
    if (format === 'currency_sf' && typeof val === 'number') {
      return `${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(val)} / SF`;
    }
    return val;
  };

  const handleDeleteRow = (rowId: string) => {
    if (window.confirm('Are you sure you want to remove this element from the grid?')) {
      setRows(rows.filter(r => r.id !== rowId));
    }
  };

  const handleAddRow = (sectionId: string, element: { label: string, key: string }) => {
    const newRow: GridRowData = {
      id: `new_${Date.now()}`,
      category: sectionId as any,
      label: element.label,
      key: element.key,
      format: 'text'
    };
    setRows(prev => [...prev, newRow]);
    setActiveSection(null); // Close dropdown after selection
  };

  const toggleFlag = (propId: string, rowKey: string, currentFlag?: string) => {
    const nextFlag = currentFlag === 'superior' ? 'inferior' : currentFlag === 'inferior' ? 'similar' : 'superior';
    const nextValue = nextFlag === 'superior' ? 'Superior' : nextFlag === 'inferior' ? 'Inferior' : 'Similar';
    
    setValues(prev => ({
      ...prev,
      [propId]: {
        ...prev[propId],
        [rowKey]: {
          ...prev[propId][rowKey],
          flag: nextFlag as any,
          value: rowKey === 'overall_comp' ? nextValue : prev[propId][rowKey].value
        }
      }
    }));
  };

  const renderFlag = (propId: string, rowKey: string, val: ComparisonValue) => {
    const isSubject = propId === 'subject';
    if (isSubject) return null;

    let baseClass = "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide cursor-pointer select-none transition-all border shadow-sm";

    if (val.flag === 'superior') {
      return (
        <span 
          onClick={() => toggleFlag(propId, rowKey, val.flag)}
          className={`${baseClass} bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300`}
        >
          <ArrowUpRight className="w-3 h-3" /> Sup
        </span>
      );
    } else if (val.flag === 'inferior') {
      return (
        <span 
          onClick={() => toggleFlag(propId, rowKey, val.flag)}
          className={`${baseClass} bg-red-50 text-red-700 border-red-200 hover:bg-red-100 hover:border-red-300`}
        >
          <ArrowDownRight className="w-3 h-3" /> Inf
        </span>
      );
    } else {
      return (
        <span 
          onClick={() => toggleFlag(propId, rowKey, val.flag || 'similar')}
          className={`${baseClass} bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100 hover:text-slate-700 hover:border-slate-300`}
        >
          <Minus className="w-3 h-3" /> Sim
        </span>
      );
    }
  };

  const renderValuationCell = (propId: string, row: GridRowData, valObj: ComparisonValue) => {
    if (row.key === 'notes') {
      return (
        <a href="#" className="text-cyan-600 hover:text-cyan-700 hover:underline text-xs font-medium truncate">
          {valObj.value || 'Add notes'}
        </a>
      );
    }
    
    if (row.key === 'overall_comp') {
       if (propId === 'subject') return <span className="text-slate-300">-</span>;
       return (
         <div className="flex w-full items-center">
            {renderFlag(propId, row.key, valObj)}
         </div>
       );
    }

    if (row.key === 'weighting') {
      const displayVal = formatValue(valObj.value, row.format);
      return (
        <div className="w-full">
          <input 
            type="text" 
            defaultValue={displayVal || ''} 
            className="w-full bg-transparent border-b border-slate-300 text-sm focus:border-cyan-500 focus:outline-none"
          />
        </div>
      );
    }

    if (row.key === 'total_value') {
      return (
        <span className="text-lg font-bold text-emerald-600">{valObj.value}</span>
      );
    }

    // Default valuation formatting
    return <span className={`truncate font-medium text-slate-600 ${row.key === 'sales_value_sf' ? 'text-slate-400' : ''}`}>{formatValue(valObj.value, row.format)}</span>;
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      
      {/* Scrollable Container */}
      <div className="overflow-auto custom-scrollbar flex-1 relative bg-white pb-40">
        
        {/* Table Grid Definition */}
        <div 
          className="grid relative" 
          style={{ 
            gridTemplateColumns: `${LABEL_COL_WIDTH}px ${SUBJECT_COL_WIDTH}px repeat(${properties.length - 1}, minmax(${COMP_COL_WIDTH}px, 1fr))` 
          }}
        >
          
          {/* Header Row: Column 1 (Empty/Title) */}
          <div 
            className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm flex items-end p-2 pl-3"
            style={{ left: 0, width: LABEL_COL_WIDTH }}
          >
             <div className="font-bold text-slate-400 text-xs uppercase tracking-wider">Elements</div>
          </div>
          
          {/* Header Row: Subject Property (Sticky Column 2) - Higher Z-Index and Opaque BG */}
          {properties.filter(p => p.type === 'subject').map(prop => (
             <div 
               key={prop.id} 
               className="sticky top-0 z-50 border-b border-r border-blue-200 bg-blue-50 shadow-[4px_0_24px_rgba(0,0,0,0.05)]"
               style={{ left: LABEL_COL_WIDTH, width: SUBJECT_COL_WIDTH }}
             >
                <PropertyCard property={prop} isSubject={true} />
             </div>
          ))}

          {/* Header Row: Comps (Scrollable) */}
          {properties.filter(p => p.type !== 'subject').map((prop) => (
             <div 
               key={prop.id} 
               className="sticky top-0 z-40 border-b border-r border-slate-200 bg-white"
             >
                <PropertyCard property={prop} />
             </div>
          ))}

          {/* Data Rows Grouped by Section */}
          {SECTIONS.map(section => {
            const sectionRows = rows.filter(r => r.category === section.id);
            const showFlags = section.id === 'physical';
            const isValuation = section.id === 'valuation';
            const isActive = activeSection === section.id;
            
            return (
              <React.Fragment key={section.id}>
                {/* Section Header */}
                <div className="col-span-full sticky left-0 z-30 mt-6 mb-0">
                  <div className={`
                    absolute left-0 right-0 h-full opacity-30
                    ${section.color}
                  `}></div>
                  <div className={`relative px-4 py-2.5 flex items-center gap-2 border-y border-slate-200 ${isValuation ? 'bg-white' : 'bg-gray-50/95'} backdrop-blur-sm`}>
                    {!isValuation && <span className="font-bold text-xs text-slate-700 uppercase tracking-widest">{section.title}</span>}
                    {isValuation && <span className="font-bold text-sm text-slate-900">Analysis</span>}
                  </div>
                </div>

                {/* Rows */}
                {sectionRows.map((row) => (
                  <React.Fragment key={row.id}>
                    {/* Label Column (Sticky Left 0) */}
                    <div 
                      className={`
                        sticky left-0 z-30 bg-white border-r border-b border-slate-100 flex items-center justify-between group
                        ${row.key === 'total_value' ? 'border-t-2 border-t-slate-800' : ''}
                      `}
                      style={{ width: LABEL_COL_WIDTH }}
                      onMouseEnter={() => setHoveredRow(row.id)}
                      onMouseLeave={() => setHoveredRow(null)}
                    >
                      <div className="flex items-center h-full w-full pl-2">
                        {/* Remove button (hide for valuation rows mostly, or allow it) */}
                        <button 
                          onClick={() => handleDeleteRow(row.id)}
                          className={`
                            p-1.5 rounded-md text-slate-300 hover:text-red-600 hover:bg-red-50 transition-all mr-1
                            ${hoveredRow === row.id && !isValuation ? 'opacity-100' : 'opacity-0'}
                          `}
                          title="Remove Element"
                          disabled={isValuation}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        
                        <span className={`
                           text-xs text-slate-600 truncate pr-2 
                           ${row.key === 'total_value' ? 'font-black text-slate-900 uppercase' : 'font-medium'}
                           ${row.key.includes('overall') ? 'italic font-bold text-slate-800' : ''}
                        `}>
                          {row.label}
                        </span>
                      </div>
                    </div>

                    {/* Subject Property Data (Sticky Left 200) */}
                    {properties.filter(p => p.type === 'subject').map(prop => {
                      const valObj = values[prop.id]?.[row.key] || { value: null };
                      const displayVal = formatValue(valObj.value, row.format);
                      return (
                        <div 
                          key={`${row.id}-${prop.id}`}
                          className={`
                            sticky z-30 border-r border-b border-blue-100 p-2 flex flex-col justify-center text-xs text-slate-800
                            ${hoveredRow === row.id ? 'bg-blue-100' : 'bg-blue-50'}
                            ${row.key === 'total_value' ? 'bg-blue-50/50' : ''}
                            transition-colors shadow-[4px_0_10px_rgba(0,0,0,0.02)]
                          `}
                          style={{ left: LABEL_COL_WIDTH, width: SUBJECT_COL_WIDTH }}
                          onMouseEnter={() => setHoveredRow(row.id)}
                          onMouseLeave={() => setHoveredRow(null)}
                        >
                          {isValuation ? renderValuationCell(prop.id, row, valObj) : <span className="truncate font-medium">{displayVal}</span>}
                        </div>
                      );
                    })}

                    {/* Comp Data */}
                    {properties.filter(p => p.type !== 'subject').map((prop) => {
                      const valObj = values[prop.id]?.[row.key] || { value: null };
                      const displayVal = formatValue(valObj.value, row.format);
                      
                      return (
                        <div 
                          key={`${row.id}-${prop.id}`} 
                          className={`
                            relative border-r border-b border-slate-100 p-2 flex flex-col justify-center text-xs text-slate-700
                            ${hoveredRow === row.id ? 'bg-slate-50' : 'bg-white'}
                            transition-colors
                          `}
                          onMouseEnter={() => setHoveredRow(row.id)}
                          onMouseLeave={() => setHoveredRow(null)}
                        >
                          {isValuation ? (
                            <div className="flex h-full items-center">
                              {renderValuationCell(prop.id, row, valObj)}
                            </div>
                          ) : (
                            <div className="flex justify-between items-start gap-2 h-full items-center">
                              <span className="truncate font-medium flex-1">{displayVal}</span>
                              {showFlags && renderFlag(prop.id, row.key, valObj)}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </React.Fragment>
                ))}

                {/* Add Row Section - Only for non-valuation sections */}
                {!isValuation && (
                  <div 
                    className={`col-span-full border-b border-slate-200 bg-white p-2 sticky left-0 transition-all ${isActive ? 'z-[100]' : 'z-20'}`}
                    onMouseEnter={() => setActiveSection(section.id)}
                    onMouseLeave={() => setActiveSection(null)}
                  >
                     <div className="relative group max-w-md mx-auto">
                       <button className={`
                          flex items-center justify-center gap-2 text-xs font-bold px-4 py-3 rounded-xl border border-dashed w-full transition-all mt-2 mb-4
                          ${isActive 
                             ? 'text-cyan-700 bg-cyan-50 border-cyan-300' 
                             : 'text-slate-400 border-slate-300 hover:text-cyan-600 hover:bg-cyan-50 hover:border-cyan-300'
                          }
                       `}>
                          <Plus className="w-4 h-4" />
                          Add {section.title} Characteristic
                       </button>
                       
                       {/* Dropdown for adding elements */}
                       {isActive && (
                         <div className="absolute left-0 right-0 top-full mt-[-12px] bg-white rounded-xl shadow-2xl border border-slate-200 z-50 max-h-60 overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-top-1 duration-200">
                           <div className="p-1 grid grid-cols-2 gap-1">
                              {AVAILABLE_ELEMENTS.map(el => (
                                <button 
                                  key={el.key}
                                  onClick={() => handleAddRow(section.id, el)}
                                  className="text-left px-3 py-2.5 text-xs font-medium text-slate-600 hover:bg-cyan-50 hover:text-cyan-700 rounded-lg truncate transition-colors"
                                >
                                  {el.label}
                                </button>
                              ))}
                           </div>
                         </div>
                       )}
                     </div>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};