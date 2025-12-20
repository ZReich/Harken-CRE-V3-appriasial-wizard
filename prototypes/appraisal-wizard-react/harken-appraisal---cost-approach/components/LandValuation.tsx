import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Trash2, Settings2, ArrowRight, ChevronDown, Wand2, Calculator, Check } from 'lucide-react';
import { Comp } from '../types';

interface LandValuationProps {
  onValueChange: (val: number) => void;
}

// Configuration for grid sections
type RowType = 'data' | 'adjustment';

interface GridRow {
  id: string;
  label: string;
  type: RowType;
  section: 'transaction' | 'quantitative' | 'qualitative';
  field?: keyof Comp;
  removable?: boolean;
}

const INITIAL_ROWS: GridRow[] = [
  // Transaction Data
  { id: 'salePrice', label: 'Sale Price', type: 'data', section: 'transaction', field: 'salePrice' },
  { id: 'dateSold', label: 'Date Sold', type: 'data', section: 'transaction', field: 'dateSold' },
  { id: 'landSf', label: 'Land SF', type: 'data', section: 'transaction', field: 'landSf' },
  { id: 'pricePsf', label: '$/SF (Unadj)', type: 'data', section: 'transaction' }, // Calculated
  { id: 'zoning', label: 'Zoning', type: 'data', section: 'transaction', field: 'zoning' },
  
  // Quantitative Adjustments
  { id: 'market', label: 'Time (Market Cond.)', type: 'adjustment', section: 'quantitative', removable: true },
  { id: 'location', label: 'Location', type: 'adjustment', section: 'quantitative', removable: true },
  { id: 'size', label: 'Size', type: 'adjustment', section: 'quantitative', removable: true },
  { id: 'zoning_adj', label: 'Zoning', type: 'adjustment', section: 'quantitative', removable: true },
  { id: 'utilities', label: 'Utilities', type: 'adjustment', section: 'quantitative', removable: true },
  
  // Qualitative Characteristics
  { id: 'access', label: 'Access/Exposure', type: 'adjustment', section: 'qualitative', removable: true },
  { id: 'topography', label: 'Topography', type: 'adjustment', section: 'qualitative', removable: true },
];

const mockComps: Comp[] = [
  {
    id: '1',
    address: '123 Main St',
    cityStateZip: 'Billings, MT 59102',
    dateSold: '2023-10-02',
    salePrice: 1550000,
    landSf: 52359,
    zoning: 'CMU1',
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800',
    adjustments: {
      market: 0,
      location: -0.05, // -5%
      zoning_adj: 0,
      utilities: 0,
      size: 0.05, // +5%
    },
  },
  {
    id: '2',
    address: '4500 King Ave',
    cityStateZip: 'Billings, MT 59106',
    dateSold: '2023-08-15',
    salePrice: 1800000,
    landSf: 65000,
    zoning: 'CMU2',
    imageUrl: 'https://images.unsplash.com/photo-1449824913929-4b4794984059?auto=format&fit=crop&q=80&w=800',
    adjustments: {
      market: 0.02,
      location: 0,
      zoning_adj: 0,
      utilities: 0,
      size: -0.02,
    },
  },
    {
    id: '3',
    address: '782 Broadwater Ave',
    cityStateZip: 'Billings, MT 59102',
    dateSold: '2023-06-10',
    salePrice: 950000,
    landSf: 32000,
    zoning: 'CMU1',
    imageUrl: 'https://images.unsplash.com/photo-1572883454114-1cf0031a029e?auto=format&fit=crop&q=80&w=800',
    adjustments: {
      market: 0, // Inferior
      location: -0.02, // Superior
      zoning_adj: 0,
      utilities: 0,
      size: 0,
    },
  }
];

// --- Helpers ---
const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
const formatPercent = (val: number) => `${val > 0 ? '+' : ''}${(val * 100).toFixed(1)}%`;

export const LandValuation: React.FC<LandValuationProps> = ({ onValueChange }) => {
  const [comps, setComps] = useState<Comp[]>(mockComps);
  const [rows, setRows] = useState<GridRow[]>(INITIAL_ROWS);
  const [subjectLandSf] = useState(55000); 
  
  // Rounding State
  const [roundedValue, setRoundedValue] = useState<number | null>(null);
  
  // Popover State
  const [activePopover, setActivePopover] = useState<{ compId: string, rowId: string, rect: DOMRect } | null>(null);

  // Logic
  const calculateAdjustedPrice = (comp: Comp) => {
    const activeAdjustmentKeys = rows.filter(r => r.type === 'adjustment').map(r => r.id);
    const totalAdjPercent = activeAdjustmentKeys.reduce((acc, key) => acc + (comp.adjustments[key] || 0), 0);
    const pricePsf = comp.salePrice / comp.landSf;
    return pricePsf * (1 + totalAdjPercent);
  };

  // The raw mathematical average
  const rawIndicatedValue = useMemo(() => {
    if (comps.length === 0) return 0;
    const avgAdjustedPsf = comps.reduce((acc, comp) => acc + calculateAdjustedPrice(comp), 0) / comps.length;
    return avgAdjustedPsf * subjectLandSf;
  }, [comps, rows, subjectLandSf]);

  // Handle rounding logic
  const finalValue = roundedValue !== null ? roundedValue : rawIndicatedValue;

  useEffect(() => {
    onValueChange(finalValue);
  }, [finalValue, onValueChange]);
  
  // Reset rounded value if raw value changes significantly (optional, keeps UI in sync)
  useEffect(() => {
    if (roundedValue === null) return;
    // If the raw value changes by more than 1%, reset the rounding to force user to re-verify
    // This is a safety feature so they don't have stale rounded numbers
    if (Math.abs(rawIndicatedValue - roundedValue) / rawIndicatedValue > 0.05) {
       setRoundedValue(null); 
    }
  }, [rawIndicatedValue]);

  const handleRound = (precision: number) => {
      setRoundedValue(Math.round(rawIndicatedValue / precision) * precision);
  };

  const handleAdjustmentChange = (compId: string, category: string, value: number) => {
    setComps(prev => prev.map(c => {
      if (c.id !== compId) return c;
      return { ...c, adjustments: { ...c.adjustments, [category]: value } };
    }));
    setActivePopover(null);
  };

  const handleDeleteRow = (id: string) => {
    if (window.confirm("Are you sure you want to remove this element?")) {
        setRows(prev => prev.filter(r => r.id !== id));
    }
  };

  const handleAddRow = (section: 'quantitative' | 'qualitative') => {
    const name = prompt("Enter characteristic name:");
    if (!name) return;
    const newId = name.toLowerCase().replace(/\s+/g, '_');
    setRows(prev => [...prev, { id: newId, label: name, type: 'adjustment', section, removable: true }]);
  };

  const getSectionRows = (section: string) => rows.filter(r => r.section === section);

  // Popover Component
  const AdjustmentPopover = () => {
    if (!activePopover) return null;
    const style = { top: activePopover.rect.bottom + 5, left: activePopover.rect.left };

    // Basic boundary checking (optional, for robustness)
    const isOverflowingRight = (activePopover.rect.left + 240) > window.innerWidth;
    const adjustedStyle = isOverflowingRight 
        ? { ...style, left: undefined, right: window.innerWidth - activePopover.rect.right } 
        : style;

    return (
        <>
            <div className="fixed inset-0 z-40" onClick={() => setActivePopover(null)}></div>
            <div className="fixed z-50 w-64 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden animate-in fade-in zoom-in-95 duration-100" style={adjustedStyle}>
                 <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wide">Select Adjustment</div>
                 <div className="p-1.5 space-y-1">
                    <button onClick={() => handleAdjustmentChange(activePopover.compId, activePopover.rowId, 0)} className="flex items-center justify-between w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors border border-transparent hover:border-gray-200">
                        <span className="font-semibold text-gray-600">SIMILAR</span>
                        <span className="font-mono text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">0%</span>
                    </button>
                    
                    <div className="border-t border-gray-100 my-1"></div>
                    
                    <div className="px-2 pb-1 pt-1 text-[10px] font-bold text-green-600 uppercase tracking-wider flex items-center gap-1">
                        Inferior <span className="text-gray-400 font-normal normal-case">(Subject is better, so + Adj)</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                        <button onClick={() => handleAdjustmentChange(activePopover.compId, activePopover.rowId, 0.02)} className="px-2 py-1.5 text-xs text-center bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 rounded border border-green-100 transition-colors">+2.0%</button>
                        <button onClick={() => handleAdjustmentChange(activePopover.compId, activePopover.rowId, 0.05)} className="px-2 py-1.5 text-xs text-center bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 rounded border border-green-100 transition-colors">+5.0%</button>
                        <button onClick={() => handleAdjustmentChange(activePopover.compId, activePopover.rowId, 0.10)} className="px-2 py-1.5 text-xs text-center bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 rounded border border-green-100 transition-colors">+10.0%</button>
                    </div>

                    <div className="border-t border-gray-100 my-1"></div>

                    <div className="px-2 pb-1 pt-1 text-[10px] font-bold text-red-600 uppercase tracking-wider flex items-center gap-1">
                        Superior <span className="text-gray-400 font-normal normal-case">(Subject is worse, so - Adj)</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                        <button onClick={() => handleAdjustmentChange(activePopover.compId, activePopover.rowId, -0.02)} className="px-2 py-1.5 text-xs text-center bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800 rounded border border-red-100 transition-colors">-2.0%</button>
                        <button onClick={() => handleAdjustmentChange(activePopover.compId, activePopover.rowId, -0.05)} className="px-2 py-1.5 text-xs text-center bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800 rounded border border-red-100 transition-colors">-5.0%</button>
                        <button onClick={() => handleAdjustmentChange(activePopover.compId, activePopover.rowId, -0.10)} className="px-2 py-1.5 text-xs text-center bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800 rounded border border-red-100 transition-colors">-10.0%</button>
                    </div>

                    <div className="border-t border-gray-100 my-1"></div>
                    <button className="flex items-center justify-center gap-2 w-full px-3 py-2 text-xs text-gray-500 hover:text-brand-600 hover:bg-brand-50 rounded-md font-medium transition-colors">
                        <Settings2 size={12}/> Custom Value...
                    </button>
                 </div>
            </div>
        </>
    )
  }

  // --- Render Components ---

  const AdjustmentCell = ({ comp, row }: { comp: Comp, row: GridRow }) => {
     const value = comp.adjustments[row.id] || 0;
     const isZero = value === 0;
     const isPositive = value > 0; // Inferior (+ Adjustment)
     const isNegative = value < 0; // Superior (- Adjustment)

     return (
        <div className="w-full h-full flex items-center justify-center px-3 py-2">
            <button 
                onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setActivePopover({ compId: comp.id, rowId: row.id, rect });
                }}
                className={`
                    w-full h-9 flex items-center justify-between px-3 rounded text-[10px] font-bold uppercase tracking-wider transition-all border shadow-sm
                    ${isZero ? 'bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50' : ''}
                    ${isPositive ? 'bg-green-50 border-green-200 text-green-700 hover:border-green-300 hover:bg-green-100' : ''}
                    ${isNegative ? 'bg-red-50 border-red-200 text-red-700 hover:border-red-300 hover:bg-red-100' : ''}
                `}
            >
                <span className="truncate mr-2 font-bold">
                    {isZero ? 'SIMILAR' : isPositive ? 'INFERIOR' : 'SUPERIOR'}
                </span>
                <div className="flex items-center gap-1 flex-shrink-0">
                    {!isZero && (
                        <span className="font-mono">{formatPercent(value)}</span>
                    )}
                    <ChevronDown size={14} className={`opacity-40 ${isZero ? 'ml-auto' : ''}`} />
                </div>
            </button>
        </div>
     );
  };

  return (
    <div className="flex flex-col h-full bg-white relative font-sans">
      <AdjustmentPopover />
      
      {/* Scroll Container */}
      <div className="flex-1 overflow-auto custom-scrollbar bg-white">
         <div className="inline-flex min-w-full">
            
            {/* COLUMN 1: ELEMENTS (Sticky Left) */}
            <div className="sticky left-0 z-30 w-52 bg-white border-r border-gray-200 flex flex-col flex-shrink-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
                {/* Header Blank Space */}
                <div className="h-[280px] border-b border-gray-200 bg-white p-6 flex flex-col justify-end">
                    {/* Placeholder for alignment */}
                </div>

                {/* Rows */}
                {/* Section: Transaction Data */}
                {getSectionRows('transaction').map(row => (
                    <div key={row.id} className="h-14 flex items-center px-4 border-b border-gray-100 text-sm font-medium text-gray-600 bg-white group hover:bg-gray-50/50 transition-colors relative">
                        {row.label}
                        {row.removable && (
                             <button onClick={() => handleDeleteRow(row.id)} className="absolute right-2 p-1.5 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={14}/></button>
                        )}
                    </div>
                ))}

                {/* Section: Quantitative */}
                <div className="h-14 px-4 flex items-center bg-gray-100 border-b border-gray-200">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider leading-tight w-24">Quantitative Adjustments</span>
                </div>
                {getSectionRows('quantitative').map(row => (
                    <div key={row.id} className="h-14 flex items-center px-4 border-b border-gray-100 text-sm font-medium text-gray-600 bg-white group hover:bg-gray-50/50 transition-colors relative">
                        {row.label}
                        {row.removable && (
                             <button onClick={() => handleDeleteRow(row.id)} className="absolute right-2 p-1.5 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={14}/></button>
                        )}
                    </div>
                ))}
                
                {/* Section: Qualitative */}
                 <div className="h-14 px-4 flex items-center bg-gray-100 border-b border-gray-200">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider leading-tight w-24">Qualitative Characteristics</span>
                </div>
                {getSectionRows('qualitative').map(row => (
                    <div key={row.id} className="h-14 flex items-center px-4 border-b border-gray-100 text-sm font-medium text-gray-600 bg-white group hover:bg-gray-50/50 transition-colors relative">
                        {row.label}
                        {row.removable && (
                             <button onClick={() => handleDeleteRow(row.id)} className="absolute right-2 p-1.5 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={14}/></button>
                        )}
                    </div>
                ))}
                 {/* Spacer for Add Button */}
                 <div className="h-[57px] border-b border-gray-200 bg-white"></div>

            </div>

            {/* COLUMN 2: SUBJECT (Sticky Left 2) */}
            <div className="sticky left-52 z-30 w-72 bg-white border-r border-gray-200 flex flex-col flex-shrink-0 shadow-[4px_0_24px_rgba(0,0,0,0.04)]">
                {/* Subject Header */}
                <div className="h-[280px] border-b border-gray-200 p-4 relative group bg-white flex flex-col">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="p-1.5 bg-brand-50 rounded text-brand-600">
                            <ArrowRight size={14} className="-rotate-45"/>
                        </div>
                        <div>
                            <div className="text-lg font-bold text-gray-900 leading-tight">Land Valuation</div>
                            <div className="text-xs text-gray-500">Sales Comparison Grid</div>
                        </div>
                    </div>

                    <div className="flex-1 w-full rounded-lg bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center mb-3 overflow-hidden relative">
                         <div className="text-gray-400 text-xs font-medium">No Photo Available</div>
                    </div>
                    
                    {/* Land Value Conclusion with Rounding */}
                    <div className="flex flex-col gap-2">
                        <div className="flex items-end justify-between">
                             <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-gray-500 uppercase">Indicated Land Value</span>
                                <div className="flex items-center gap-2">
                                    <span className={`text-lg font-bold ${roundedValue !== null ? 'text-brand-600' : 'text-gray-900'}`}>
                                        {formatCurrency(finalValue)}
                                    </span>
                                    {roundedValue !== null && <Check size={14} className="text-brand-600" />}
                                </div>
                             </div>
                             <div className="flex flex-col items-end gap-1">
                                <button 
                                    onClick={() => handleRound(1000)}
                                    className="px-2 py-1 bg-white border border-gray-200 hover:bg-gray-50 hover:border-brand-300 hover:text-brand-600 rounded text-[10px] font-bold text-gray-500 flex items-center gap-1 transition-all"
                                    title="Round to nearest $1,000"
                                >
                                    <Wand2 size={10} /> $1k
                                </button>
                             </div>
                        </div>
                        {roundedValue !== null && (
                            <div className="text-[10px] text-gray-400 font-medium">
                                Exact: {formatCurrency(rawIndicatedValue)}
                            </div>
                        )}
                    </div>
                </div>

                {/* Rows - Subject */}
                
                {/* Transaction Data */}
                {getSectionRows('transaction').map(row => (
                    <div key={`sub_${row.id}`} className="h-14 flex items-center px-4 border-b border-gray-100 text-sm text-gray-900 font-bold bg-white">
                        {row.id === 'salePrice' ? 'N/A' : 
                         row.id === 'landSf' ? subjectLandSf.toLocaleString() :
                         row.id === 'zoning' ? 'CMU1' : 'N/A'}
                    </div>
                ))}
                
                {/* Quantitative */}
                <div className="h-14 bg-white border-b border-gray-100"></div> {/* Spacer for header */}
                {getSectionRows('quantitative').map(row => (
                    <div key={`sub_${row.id}`} className="h-14 flex items-center px-4 border-b border-gray-100 text-sm text-gray-400 italic bg-white">
                       Subject
                    </div>
                ))}

                {/* Qualitative */}
                <div className="h-14 bg-white border-b border-gray-100"></div> {/* Spacer for header */}
                {getSectionRows('qualitative').map(row => (
                    <div key={`sub_${row.id}`} className="h-14 flex items-center px-4 border-b border-gray-100 text-sm text-gray-400 italic bg-white">
                        Subject
                    </div>
                ))}
                 <div className="p-3 border-b border-gray-200 bg-white">
                    <button onClick={() => handleAddRow('qualitative')} className="w-full py-2 bg-brand-50 text-brand-600 border border-brand-100 rounded text-xs font-bold hover:bg-brand-100 transition-colors flex items-center justify-center gap-1 shadow-sm">
                        <Plus size={14}/> Add Characteristic
                    </button>
                </div>
            </div>

            {/* COLUMNS 3+: COMPS */}
            {comps.map((comp, idx) => {
                const adjustedPsf = calculateAdjustedPrice(comp);
                
                return (
                    <div key={comp.id} className="w-80 border-r border-gray-200 flex flex-col flex-shrink-0 bg-white">
                        {/* Header */}
                        <div className="h-[280px] border-b border-gray-200 p-4 relative group">
                            <div className="h-40 w-full rounded-lg overflow-hidden bg-gray-100 mb-3 relative shadow-sm border border-gray-200">
                                <img src={comp.imageUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Comp" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
                                
                                <div className="absolute bottom-3 left-3 text-white">
                                    <div className="text-sm font-bold leading-tight">{comp.address}</div>
                                    <div className="text-[10px] opacity-90">{comp.cityStateZip}</div>
                                </div>
                            </div>
                            <div className="flex flex-col space-y-3">
                                <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Sale Price</span>
                                    <span className="text-lg font-bold text-gray-900">{formatCurrency(comp.salePrice)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Rows */}
                        
                        {/* Transaction Data */}
                        {getSectionRows('transaction').map(row => {
                            let content = '';
                            if (row.field) content = comp[row.field]?.toString() || '';
                            if (row.id === 'salePrice') content = formatCurrency(comp.salePrice);
                            if (row.id === 'landSf') content = comp.landSf.toLocaleString();
                            if (row.id === 'pricePsf') content = formatCurrency(comp.salePrice / comp.landSf);
                            
                            return (
                                <div key={row.id} className="h-14 flex items-center px-4 border-b border-gray-100 text-sm text-gray-700 bg-white">
                                    {row.id === 'pricePsf' ? (
                                        <span className="px-2 py-0.5 rounded bg-brand-50 text-brand-700 font-bold">{content}</span>
                                    ) : (
                                        <span className="font-medium text-gray-900">{content}</span>
                                    )}
                                </div>
                            );
                        })}

                        {/* Quantitative */}
                        <div className="h-14 bg-white border-b border-gray-100"></div> {/* Spacer for header */}
                        {getSectionRows('quantitative').map(row => (
                             <div key={row.id} className="h-14 flex items-center border-b border-gray-100 bg-white">
                                 <AdjustmentCell comp={comp} row={row} />
                             </div>
                        ))}

                        {/* Qualitative */}
                        <div className="h-14 bg-white border-b border-gray-100"></div> {/* Spacer for header */}
                        {getSectionRows('qualitative').map(row => (
                             <div key={row.id} className="h-14 flex items-center border-b border-gray-100 bg-white">
                                <AdjustmentCell comp={comp} row={row} />
                             </div>
                        ))}
                        {/* Spacer for Add Button */}
                        <div className="h-[57px] border-b border-gray-200 bg-white"></div>

                    </div>
                );
            })}

             {/* Add Comp Button Column */}
            <div className="w-48 flex-shrink-0 flex items-center justify-center p-4 bg-white border-r border-dashed border-gray-200">
               <button className="flex flex-col items-center gap-2 text-gray-300 hover:text-brand-600 transition-all hover:scale-105 active:scale-95 group">
                  <div className="w-12 h-12 rounded-full border-2 border-dashed border-gray-200 group-hover:border-brand-500 flex items-center justify-center bg-gray-50 group-hover:bg-white shadow-sm transition-colors">
                     <Plus size={24} className="group-hover:rotate-90 transition-transform duration-300" />
                  </div>
                  <span className="text-xs font-bold text-center uppercase tracking-wide">Add Comp</span>
               </button>
            </div>

         </div>
      </div>
    </div>
  );
};