import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Trash2, Settings2, ArrowRight, ChevronDown, Wand2, Check } from 'lucide-react';
import { LandComp, GridRow } from '../types';
import { INITIAL_LAND_ROWS, MOCK_LAND_COMPS, formatCurrency, formatPercent } from '../constants';

interface LandValuationProps {
  onValueChange: (val: number) => void;
}

export const LandValuation: React.FC<LandValuationProps> = ({ onValueChange }) => {
  const [comps, setComps] = useState<LandComp[]>(MOCK_LAND_COMPS);
  const [rows, setRows] = useState<GridRow[]>(INITIAL_LAND_ROWS);
  const [subjectLandSf] = useState(55000); 
  const [roundedValue, setRoundedValue] = useState<number | null>(null);
  const [activePopover, setActivePopover] = useState<{ compId: string, rowId: string, rect: DOMRect } | null>(null);

  const calculateAdjustedPrice = (comp: LandComp) => {
    const activeAdjustmentKeys = rows.filter(r => r.type === 'adjustment').map(r => r.id);
    const totalAdjPercent = activeAdjustmentKeys.reduce((acc, key) => acc + (comp.adjustments[key] || 0), 0);
    const pricePsf = comp.salePrice / comp.landSf;
    return pricePsf * (1 + totalAdjPercent);
  };

  const rawIndicatedValue = useMemo(() => {
    if (comps.length === 0) return 0;
    const avgAdjustedPsf = comps.reduce((acc, comp) => acc + calculateAdjustedPrice(comp), 0) / comps.length;
    return avgAdjustedPsf * subjectLandSf;
  }, [comps, rows, subjectLandSf]);

  const finalValue = roundedValue !== null ? roundedValue : rawIndicatedValue;

  useEffect(() => {
    onValueChange(finalValue);
  }, [finalValue, onValueChange]);
  
  useEffect(() => {
    if (roundedValue === null) return;
    if (Math.abs(rawIndicatedValue - roundedValue) / rawIndicatedValue > 0.05) {
       setRoundedValue(null); 
    }
  }, [rawIndicatedValue, roundedValue]);

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

  const AdjustmentPopover = () => {
    if (!activePopover) return null;
    const style: React.CSSProperties = { top: activePopover.rect.bottom + 5, left: activePopover.rect.left };
    const isOverflowingRight = (activePopover.rect.left + 240) > window.innerWidth;
    const adjustedStyle = isOverflowingRight 
      ? { ...style, left: undefined, right: window.innerWidth - activePopover.rect.right } 
      : style;

    return (
      <>
        <div className="fixed inset-0 z-40" onClick={() => setActivePopover(null)}></div>
        <div className="fixed z-50 w-64 bg-surface-1 dark:bg-elevation-1 rounded-lg shadow-xl border border-light-border dark:border-dark-border dark:border-dark-border overflow-hidden animate-in fade-in zoom-in-95 duration-100" style={adjustedStyle}>
          <div className="px-4 py-2 bg-surface-2 dark:bg-elevation-2 border-b border-light-border dark:border-dark-border text-xs font-bold text-slate-500 uppercase tracking-wide">Select Adjustment</div>
          <div className="p-1.5 space-y-1">
            <button onClick={() => handleAdjustmentChange(activePopover.compId, activePopover.rowId, 0)} className="flex items-center justify-between w-full px-3 py-2 text-sm text-slate-700 hover:bg-surface-2 dark:bg-elevation-2 rounded-md transition-colors border border-transparent hover:border-light-border dark:border-dark-border">
              <span className="font-semibold text-slate-600 dark:text-slate-200">SIMILAR</span>
              <span className="font-mono text-xs bg-surface-3 dark:bg-elevation-subtle text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded">0%</span>
            </button>
            
            <div className="border-t border-light-border dark:border-dark-border my-1"></div>
            
            <div className="px-2 pb-1 pt-1 text-[10px] font-bold text-accent-teal-mint uppercase tracking-wider flex items-center gap-1">
              Inferior <span className="text-harken-gray-med font-normal normal-case">(Subject is better, so + Adj)</span>
            </div>
            <div className="grid grid-cols-3 gap-1">
              <button onClick={() => handleAdjustmentChange(activePopover.compId, activePopover.rowId, 0.02)} className="px-2 py-1.5 text-xs text-center bg-accent-teal-mint-light text-accent-teal-mint hover:bg-accent-teal-mint-light hover:text-accent-teal-mint rounded border border-accent-teal-mint transition-colors">+2.0%</button>
              <button onClick={() => handleAdjustmentChange(activePopover.compId, activePopover.rowId, 0.05)} className="px-2 py-1.5 text-xs text-center bg-accent-teal-mint-light text-accent-teal-mint hover:bg-accent-teal-mint-light hover:text-accent-teal-mint rounded border border-accent-teal-mint transition-colors">+5.0%</button>
              <button onClick={() => handleAdjustmentChange(activePopover.compId, activePopover.rowId, 0.10)} className="px-2 py-1.5 text-xs text-center bg-accent-teal-mint-light text-accent-teal-mint hover:bg-accent-teal-mint-light hover:text-accent-teal-mint rounded border border-accent-teal-mint transition-colors">+10.0%</button>
            </div>

            <div className="border-t border-light-border dark:border-dark-border my-1"></div>

            <div className="px-2 pb-1 pt-1 text-[10px] font-bold text-harken-error uppercase tracking-wider flex items-center gap-1">
              Superior <span className="text-harken-gray-med font-normal normal-case">(Subject is worse, so - Adj)</span>
            </div>
            <div className="grid grid-cols-3 gap-1">
              <button onClick={() => handleAdjustmentChange(activePopover.compId, activePopover.rowId, -0.02)} className="px-2 py-1.5 text-xs text-center bg-accent-red-light text-harken-error hover:bg-accent-red-light hover:text-harken-error rounded border border-harken-error/20 transition-colors">-2.0%</button>
              <button onClick={() => handleAdjustmentChange(activePopover.compId, activePopover.rowId, -0.05)} className="px-2 py-1.5 text-xs text-center bg-accent-red-light text-harken-error hover:bg-accent-red-light hover:text-harken-error rounded border border-harken-error/20 transition-colors">-5.0%</button>
              <button onClick={() => handleAdjustmentChange(activePopover.compId, activePopover.rowId, -0.10)} className="px-2 py-1.5 text-xs text-center bg-accent-red-light text-harken-error hover:bg-accent-red-light hover:text-harken-error rounded border border-harken-error/20 transition-colors">-10.0%</button>
            </div>

            <div className="border-t border-light-border dark:border-dark-border my-1"></div>
            <button className="flex items-center justify-center gap-2 w-full px-3 py-2 text-xs text-slate-500 hover:text-[#0da1c7] hover:bg-[#0da1c7]/10 rounded-md font-medium transition-colors">
              <Settings2 size={12}/> Custom Value...
            </button>
          </div>
        </div>
      </>
    );
  };

  const AdjustmentCell = ({ comp, row }: { comp: LandComp, row: GridRow }) => {
    const value = comp.adjustments[row.id] || 0;
    const isZero = value === 0;
    const isPositive = value > 0;
    const isNegative = value < 0;

    return (
      <div className="w-full h-full flex items-center justify-center px-3 py-2">
        <button 
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            setActivePopover({ compId: comp.id, rowId: row.id, rect });
          }}
          className={`
            w-full h-9 flex items-center justify-between px-3 rounded text-[10px] font-bold uppercase tracking-wider transition-all border shadow-sm
            ${isZero ? 'bg-surface-1 dark:bg-elevation-1 border-light-border dark:border-dark-border dark:border-harken-gray text-slate-500 dark:text-slate-400 hover:border-border-muted dark:hover:border-dark-border-muted hover:bg-surface-2 dark:bg-elevation-2 dark:hover:bg-elevation-3' : ''}
            ${isPositive ? 'bg-accent-teal-mint-light border-accent-teal-mint text-accent-teal-mint hover:border-accent-teal-mint hover:bg-accent-teal-mint-light' : ''}
            ${isNegative ? 'bg-accent-red-light border-harken-error/20 text-harken-error hover:border-harken-error/30 hover:bg-accent-red-light' : ''}
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
    <div className="flex flex-col h-full bg-surface-1 dark:bg-elevation-1 relative font-sans">
      <AdjustmentPopover />
      
      <div className="flex-1 overflow-auto custom-scrollbar bg-surface-1 dark:bg-elevation-1">
        <div className="inline-flex min-w-full">
          
          {/* COLUMN 1: ELEMENTS (Sticky Left) */}
          <div className="sticky left-0 z-30 w-52 bg-surface-1 dark:bg-elevation-1 border-r border-light-border dark:border-dark-border dark:border-dark-border flex flex-col flex-shrink-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
            <div className="h-[280px] border-b border-light-border dark:border-dark-border dark:border-dark-border bg-surface-1 dark:bg-elevation-1 p-6 flex flex-col justify-end"></div>

            {getSectionRows('transaction').map(row => (
              <div key={row.id} className="h-14 flex items-center px-4 border-b border-light-border dark:border-dark-border dark:border-dark-border text-sm font-medium text-slate-600 dark:text-slate-200 bg-surface-1 dark:bg-elevation-1 group hover:bg-surface-2 dark:bg-elevation-2/50 dark:hover:bg-elevation-3/50 transition-colors relative">
                {row.label}
                {row.removable && (
                  <button onClick={() => handleDeleteRow(row.id)} className="absolute right-2 p-1.5 text-slate-300 hover:text-harken-error opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={14}/></button>
                )}
              </div>
            ))}

            <div className="h-14 px-4 flex items-center bg-surface-3 dark:bg-elevation-subtle border-b border-light-border dark:border-dark-border dark:border-harken-gray">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider leading-tight w-24">Quantitative Adjustments</span>
            </div>
            {getSectionRows('quantitative').map(row => (
              <div key={row.id} className="h-14 flex items-center px-4 border-b border-light-border dark:border-dark-border dark:border-dark-border text-sm font-medium text-slate-600 dark:text-slate-200 bg-surface-1 dark:bg-elevation-1 group hover:bg-surface-2 dark:bg-elevation-2/50 dark:hover:bg-elevation-3/50 transition-colors relative">
                {row.label}
                {row.removable && (
                  <button onClick={() => handleDeleteRow(row.id)} className="absolute right-2 p-1.5 text-slate-300 hover:text-harken-error opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={14}/></button>
                )}
              </div>
            ))}
            
            <div className="h-14 px-4 flex items-center bg-surface-3 dark:bg-elevation-subtle border-b border-light-border dark:border-dark-border dark:border-harken-gray">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider leading-tight w-24">Qualitative Characteristics</span>
            </div>
            {getSectionRows('qualitative').map(row => (
              <div key={row.id} className="h-14 flex items-center px-4 border-b border-light-border dark:border-dark-border dark:border-dark-border text-sm font-medium text-slate-600 dark:text-slate-200 bg-surface-1 dark:bg-elevation-1 group hover:bg-surface-2 dark:bg-elevation-2/50 dark:hover:bg-elevation-3/50 transition-colors relative">
                {row.label}
                {row.removable && (
                  <button onClick={() => handleDeleteRow(row.id)} className="absolute right-2 p-1.5 text-slate-300 hover:text-harken-error opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={14}/></button>
                )}
              </div>
            ))}
            <div className="h-[57px] border-b border-light-border dark:border-dark-border dark:border-dark-border bg-surface-1 dark:bg-elevation-1"></div>
          </div>

          {/* COLUMN 2: SUBJECT (Sticky Left 2) */}
          <div className="sticky left-52 z-30 w-72 bg-surface-1 dark:bg-elevation-1 border-r border-light-border dark:border-dark-border dark:border-dark-border flex flex-col flex-shrink-0 shadow-[4px_0_24px_rgba(0,0,0,0.04)]">
            <div className="h-[280px] border-b border-light-border dark:border-dark-border dark:border-dark-border p-4 relative group bg-surface-1 dark:bg-elevation-1 flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 bg-[#0da1c7]/10 rounded text-[#0da1c7]">
                  <ArrowRight size={14} className="-rotate-45"/>
                </div>
                <div>
                  <div className="text-lg font-bold text-slate-900 leading-tight">Land Valuation</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Sales Comparison Grid</div>
                </div>
              </div>

              <div className="flex-1 w-full rounded-lg bg-surface-2 dark:bg-elevation-2 border-2 border-dashed border-light-border dark:border-dark-border flex flex-col items-center justify-center mb-3 overflow-hidden relative">
                <div className="text-slate-400 text-xs font-medium">No Photo Available</div>
              </div>
              
              <div className="flex flex-col gap-2">
                <div className="flex items-end justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Indicated Land Value</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-lg font-bold ${roundedValue !== null ? 'text-[#0da1c7]' : 'text-slate-900'}`}>
                        {formatCurrency(finalValue)}
                      </span>
                      {roundedValue !== null && <Check size={14} className="text-[#0da1c7]" />}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <button 
                      onClick={() => handleRound(1000)}
                      className="px-2 py-1 bg-surface-1 dark:bg-elevation-1 border border-light-border dark:border-dark-border dark:border-harken-gray hover:bg-surface-2 dark:bg-elevation-2 dark:hover:bg-harken-gray hover:border-[#0da1c7] hover:text-[#0da1c7] rounded text-[10px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1 transition-all"
                      title="Round to nearest $1,000"
                    >
                      <Wand2 size={10} /> $1k
                    </button>
                  </div>
                </div>
                {roundedValue !== null && (
                  <div className="text-[10px] text-slate-400 font-medium">
                    Exact: {formatCurrency(rawIndicatedValue)}
                  </div>
                )}
              </div>
            </div>

            {getSectionRows('transaction').map(row => (
              <div key={`sub_${row.id}`} className="h-14 flex items-center px-4 border-b border-light-border dark:border-dark-border dark:border-dark-border text-sm text-slate-900 dark:text-white font-bold bg-surface-1 dark:bg-elevation-1">
                {row.id === 'salePrice' ? 'N/A' : 
                 row.id === 'landSf' ? subjectLandSf.toLocaleString() :
                 row.id === 'zoning' ? 'CMU1' : 'N/A'}
              </div>
            ))}
            
            <div className="h-14 bg-surface-1 dark:bg-elevation-1 border-b border-light-border dark:border-dark-border dark:border-dark-border"></div>
            {getSectionRows('quantitative').map(row => (
              <div key={`sub_${row.id}`} className="h-14 flex items-center px-4 border-b border-light-border dark:border-dark-border dark:border-dark-border text-sm text-slate-400 italic bg-surface-1 dark:bg-elevation-1">
                Subject
              </div>
            ))}

            <div className="h-14 bg-surface-1 dark:bg-elevation-1 border-b border-light-border dark:border-dark-border dark:border-dark-border"></div>
            {getSectionRows('qualitative').map(row => (
              <div key={`sub_${row.id}`} className="h-14 flex items-center px-4 border-b border-light-border dark:border-dark-border dark:border-dark-border text-sm text-slate-400 italic bg-surface-1 dark:bg-elevation-1">
                Subject
              </div>
            ))}
            <div className="p-3 border-b border-light-border dark:border-dark-border dark:border-dark-border bg-surface-1 dark:bg-elevation-1">
              <button onClick={() => handleAddRow('qualitative')} className="w-full py-2 bg-[#0da1c7]/10 text-[#0da1c7] border border-[#0da1c7]/20 rounded text-xs font-bold hover:bg-[#0da1c7]/20 transition-colors flex items-center justify-center gap-1 shadow-sm">
                <Plus size={14}/> Add Characteristic
              </button>
            </div>
          </div>

          {/* COLUMNS 3+: COMPS */}
          {comps.map((comp) => {
            return (
              <div key={comp.id} className="w-80 border-r border-light-border dark:border-dark-border dark:border-dark-border flex flex-col flex-shrink-0 bg-surface-1 dark:bg-elevation-1">
                <div className="h-[280px] border-b border-light-border dark:border-dark-border p-4 relative group">
                  <div className="h-40 w-full rounded-lg overflow-hidden bg-surface-3 dark:bg-elevation-subtle mb-3 relative shadow-sm border border-light-border dark:border-dark-border dark:border-harken-gray">
                    <img src={comp.imageUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Comp" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
                    
                    <div className="absolute bottom-3 left-3 text-white">
                      <div className="text-sm font-bold leading-tight">{comp.address}</div>
                      <div className="text-[10px] opacity-90">{comp.cityStateZip}</div>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-3">
                    <div className="flex justify-between items-center border-b border-light-border dark:border-dark-border pb-2">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Sale Price</span>
                      <span className="text-lg font-bold text-slate-900">{formatCurrency(comp.salePrice)}</span>
                    </div>
                  </div>
                </div>

                {getSectionRows('transaction').map(row => {
                  let content: string | number = '';
                  if (row.field) content = comp[row.field]?.toString() || '';
                  if (row.id === 'salePrice') content = formatCurrency(comp.salePrice);
                  if (row.id === 'landSf') content = comp.landSf.toLocaleString();
                  if (row.id === 'pricePsf') content = formatCurrency(comp.salePrice / comp.landSf);
                  
                  return (
                    <div key={row.id} className="h-14 flex items-center px-4 border-b border-light-border dark:border-dark-border dark:border-dark-border text-sm text-slate-700 dark:text-slate-200 bg-surface-1 dark:bg-elevation-1">
                      {row.id === 'pricePsf' ? (
                        <span className="px-2 py-0.5 rounded bg-[#0da1c7]/10 text-[#0da1c7] font-bold">{content}</span>
                      ) : (
                        <span className="font-medium text-slate-900">{content}</span>
                      )}
                    </div>
                  );
                })}

                <div className="h-14 bg-surface-1 dark:bg-elevation-1 border-b border-light-border dark:border-dark-border dark:border-dark-border"></div>
                {getSectionRows('quantitative').map(row => (
                  <div key={row.id} className="h-14 flex items-center border-b border-light-border dark:border-dark-border dark:border-dark-border bg-surface-1 dark:bg-elevation-1">
                    <AdjustmentCell comp={comp} row={row} />
                  </div>
                ))}

                <div className="h-14 bg-surface-1 dark:bg-elevation-1 border-b border-light-border dark:border-dark-border dark:border-dark-border"></div>
                {getSectionRows('qualitative').map(row => (
                  <div key={row.id} className="h-14 flex items-center border-b border-light-border dark:border-dark-border dark:border-dark-border bg-surface-1 dark:bg-elevation-1">
                    <AdjustmentCell comp={comp} row={row} />
                  </div>
                ))}
                <div className="h-[57px] border-b border-light-border dark:border-dark-border dark:border-dark-border bg-surface-1 dark:bg-elevation-1"></div>
              </div>
            );
          })}

          {/* Add Comp Button Column */}
          <div className="w-48 flex-shrink-0 flex items-center justify-center p-4 bg-surface-1 dark:bg-elevation-1 border-r border-dashed border-light-border dark:border-dark-border dark:border-harken-gray">
            <button className="flex flex-col items-center gap-2 text-slate-300 dark:text-slate-500 hover:text-[#0da1c7] transition-all hover:scale-105 active:scale-95 group">
              <div className="w-12 h-12 rounded-full border-2 border-dashed border-light-border dark:border-dark-border dark:border-harken-gray group-hover:border-[#0da1c7] flex items-center justify-center bg-surface-2 dark:bg-elevation-2 dark:bg-elevation-1 group-hover:bg-surface-1 dark:group-hover:bg-slate-600 shadow-sm transition-colors">
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





