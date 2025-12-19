
import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { 
  Plus, 
  Trash2, 
  ArrowUpRight, 
  ArrowDownRight, 
  Minus,
  CheckCircle2,
  AlertCircle,
  Maximize2,
  Sparkles,
  Loader2,
  X,
  FileText
} from 'lucide-react';
import { Property, GridRowData, PropertyValues, ComparisonValue, Section } from '../types';
import { PropertyCard } from './PropertyCard';
import { RichTextEditor } from './RichTextEditor';
import { INITIAL_ROWS, SECTIONS, AVAILABLE_ELEMENTS } from '../constants';

interface SalesGridProps {
  properties: Property[];
  values: PropertyValues;
  analysisMode?: 'standard' | 'residual';
}

export const SalesGrid: React.FC<SalesGridProps> = ({ properties, values: initialValues, analysisMode = 'standard' }) => {
  const [rows, setRows] = useState<GridRowData[]>(INITIAL_ROWS);
  const [sections, setSections] = useState<Section[]>(SECTIONS);
  const [values, setValues] = useState<PropertyValues>(initialValues);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  
  // Valuation Method State
  const [valuationMethod, setValuationMethod] = useState<'average' | 'most_similar'>('average');
  const [primaryCompId, setPrimaryCompId] = useState<string | null>(null);
  const [reconciliationText, setReconciliationText] = useState("");
  
  // UI State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activePopover, setActivePopover] = useState<{rowId: string, propId: string, field: 'value' | 'adjustment'} | null>(null);

  const LABEL_COL_WIDTH = 160;
  const SUBJECT_COL_WIDTH = 180;
  const COMP_COL_WIDTH = 170;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activePopover) {
        const target = event.target as Element;
        if (!target.closest('.adjustment-popover')) {
          setActivePopover(null);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activePopover]);

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

  const getCalculatedValue = (propId: string, rowKey: string): number | string | null => {
    const propValues = values[propId];
    if (!propValues) return null;

    if (rowKey === 'residual_value') {
      const price = propValues['price']?.value;
      const land = propValues['land_value']?.value;
      if (typeof price === 'number' && typeof land === 'number') return price - land;
      return null;
    }

    if (rowKey === 'residual_price_sf') {
      const price = propValues['price']?.value;
      const land = propValues['land_value']?.value;
      const bldgSize = propValues['bldg_size_fact']?.value;
      if (typeof price === 'number' && typeof land === 'number' && typeof bldgSize === 'number' && bldgSize > 0) {
        return (price - land) / bldgSize;
      }
      return null;
    }

    if (rowKey === 'overall_adj') {
      const adjustmentKeys = ['time_adj', 'location_adj', 'condition_adj', 'construction_adj', 'scale_adj', 'use_adj'];
      let total = 0;
      adjustmentKeys.forEach(k => {
        const val = propValues[k]?.value;
        if (typeof val === 'number') total += val;
      });
      return total;
    }

    if (rowKey === 'overall_comp') {
        const overallAdj = getCalculatedValue(propId, 'overall_adj') as number || 0;
        if (overallAdj < -0.025) return 'Superior';
        if (overallAdj > 0.025) return 'Inferior';
        return 'Similar';
    }

    if (rowKey === 'adj_price_sf' || rowKey === 'adj_price_sf_val') {
      const overallAdj = getCalculatedValue(propId, 'overall_adj') as number || 0;
      let basePriceSf = 0;
      if (analysisMode === 'residual') {
         const resVal = getCalculatedValue(propId, 'residual_price_sf');
         basePriceSf = typeof resVal === 'number' ? resVal : 0;
      } else {
         basePriceSf = typeof propValues['price_sf']?.value === 'number' ? propValues['price_sf'].value : 0;
      }
      if (basePriceSf === 0) return null;
      return basePriceSf * (1 + overallAdj);
    }

    if (rowKey === 'total_value') {
      const subjectBldgSize = values['subject']?.['bldg_size_fact']?.value;
      let finalPriceSf = 0;
      if (valuationMethod === 'most_similar' && primaryCompId) {
          finalPriceSf = getCalculatedValue(primaryCompId, 'adj_price_sf_val') as number || 0;
      } else {
          finalPriceSf = getCalculatedValue(propId, 'adj_price_sf_val') as number || 0;
      }
      if (propId === 'subject') return null; 
      if (typeof subjectBldgSize === 'number' && finalPriceSf > 0) {
         let val = subjectBldgSize * finalPriceSf;
         if (analysisMode === 'residual') {
            const subjectLand = values['subject']?.['subject_land_add_back']?.value;
            if (typeof subjectLand === 'number') val += subjectLand;
         }
         return formatValue(val, 'currency');
      }
      return null;
    }
    return null;
  };

  const generateNarrative = async () => {
    if (!process.env.API_KEY) {
        alert("API Key is missing.");
        return;
    }
    setIsGenerating(true);
    try {
        const subject = properties.find(p => p.type === 'subject');
        if (!subject) throw new Error("No Subject Property");
        let prompt = `You are an expert real estate appraiser writing a "Value Reconciliation and Narrative" in HTML format. Use <h3>, <p>, <ul>.\n\nSubject: ${subject.name}\nMode: ${analysisMode}\nMethod: ${valuationMethod}\n`;
        properties.filter(p => p.type === 'comp').forEach((comp, index) => {
            const netAdj = getCalculatedValue(comp.id, 'overall_adj') as number;
            prompt += `Comp ${index + 1}: Net Adj ${(netAdj * 100).toFixed(1)}%. Rated ${getCalculatedValue(comp.id, 'overall_comp')}.\n`;
        });
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
        if (response.text) setReconciliationText(response.text.replace(/```html/g, '').replace(/```/g, ''));
    } catch (error) {
        setReconciliationText("<p style='color: red;'>Error generating narrative.</p>");
    } finally {
        setIsGenerating(false);
    }
  };

  const updateValue = (propId: string, rowKey: string, val: any, field: 'value' | 'adjustment' = 'value') => {
    setValues(prev => ({
      ...prev,
      [propId]: {
        ...prev[propId],
        [rowKey]: { ...prev[propId][rowKey], [field]: val }
      }
    }));
  };

  const AdjustmentBadge = ({ flag, value, onClick, showValue = true }: any) => {
    const isSup = flag === 'superior' || flag === 'Superior';
    const isInf = flag === 'inferior' || flag === 'Inferior';
    const baseClass = `inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide border shadow-sm transition-all cursor-pointer`;
    
    if (isSup) return <span onClick={onClick} className={`${baseClass} bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100`}>
      <ArrowUpRight className="w-3 h-3" /> SUP {showValue && value !== 0 && <span className="ml-1 border-l border-emerald-200 pl-1">{Math.abs(value * 100).toFixed(1)}%</span>}
    </span>;
    if (isInf) return <span onClick={onClick} className={`${baseClass} bg-red-50 text-red-700 border-red-200 hover:bg-red-100`}>
      <ArrowDownRight className="w-3 h-3" /> INF {showValue && value !== 0 && <span className="ml-1 border-l border-red-200 pl-1">{Math.abs(value * 100).toFixed(1)}%</span>}
    </span>;
    return <span onClick={onClick} className={`${baseClass} bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100`}><Minus className="w-3 h-3" /> SIM</span>;
  };

  const renderQuantitativeCell = (propId: string, row: GridRowData, valObj: ComparisonValue) => {
    const numericValue = typeof valObj.value === 'number' ? valObj.value : 0;
    const isOpen = activePopover?.rowId === row.id && activePopover?.propId === propId;
    return <div className="flex items-center w-full relative">
       <AdjustmentBadge flag={numericValue < 0 ? 'superior' : numericValue > 0 ? 'inferior' : 'similar'} value={numericValue} onClick={() => setActivePopover(isOpen ? null : { rowId: row.id, propId, field: 'value' })} />
       {isOpen && (
         <div className="adjustment-popover absolute top-full right-0 mt-2 w-32 bg-white rounded-xl shadow-2xl border border-slate-200 z-[100] p-2">
            <input type="number" autoFocus className="w-full text-xs border rounded px-2 py-1" placeholder="%" onBlur={(e) => {
                updateValue(propId, row.key, parseFloat(e.target.value) / 100 || 0, 'value');
                setActivePopover(null);
            }} />
         </div>
       )}
    </div>;
  };

  const visibleRows = rows.filter(r => r.mode === 'both' || r.mode === analysisMode);

  return (
    <div className="flex flex-col h-full bg-slate-50 relative overflow-hidden">
      
      {/* SCROLLABLE PAGE AREA */}
      <div className="flex-1 overflow-auto custom-scrollbar relative bg-white">
        <div className="grid relative min-w-max" style={{ gridTemplateColumns: `${LABEL_COL_WIDTH}px ${SUBJECT_COL_WIDTH}px repeat(${properties.length - 1}, minmax(${COMP_COL_WIDTH}px, 1fr))` }}>
          
          {/* Header */}
          <div className="sticky top-0 z-[100] bg-white border-b border-slate-200 p-2 pl-3 flex items-end" style={{ left: 0, width: LABEL_COL_WIDTH }}>
            <div className="font-bold text-slate-400 text-xs uppercase tracking-wider">Elements</div>
          </div>
          {properties.map((prop, i) => (
             <div key={prop.id} className={`sticky top-0 z-[${prop.type === 'subject' ? 95 : 90}] border-b border-r ${prop.type === 'subject' ? 'border-blue-200 bg-blue-50 shadow-[4px_0_16px_rgba(0,0,0,0.1)]' : 'border-slate-200 bg-white'}`} style={prop.type === 'subject' ? { left: LABEL_COL_WIDTH, width: SUBJECT_COL_WIDTH } : {}}>
                <PropertyCard property={prop} isSubject={prop.type === 'subject'} />
             </div>
          ))}

          {/* Sections */}
          {sections.map(section => (
            <React.Fragment key={section.id}>
              <div className="col-span-full relative z-[20] mt-6 border-y border-slate-200">
                <div className={`absolute left-0 right-0 h-full opacity-30 ${section.color}`}></div>
                <div className="sticky left-0 w-fit px-4 py-2 font-bold text-xs text-slate-700 uppercase tracking-widest bg-gray-50/95 backdrop-blur-sm z-20">
                    {section.title}
                </div>
              </div>

              {visibleRows.filter(r => r.category === section.id).map(row => (
                <React.Fragment key={row.id}>
                  <div className={`sticky left-0 z-[80] bg-white border-r border-b border-slate-100 flex items-center px-2 py-1.5 group ${row.key === 'total_value' ? 'border-t-2 border-t-slate-800' : ''}`} style={{ width: LABEL_COL_WIDTH }}>
                    <span className={`text-xs text-slate-600 truncate ${row.key === 'total_value' ? 'font-black text-slate-900 uppercase' : 'font-medium'}`}>{row.label}</span>
                  </div>
                  {properties.map(prop => (
                    <div key={`${row.id}-${prop.id}`} className={`border-r border-b border-slate-100 p-2 flex items-center text-xs ${prop.type === 'subject' ? 'sticky z-[75] bg-blue-50 shadow-[4px_0_16px_rgba(0,0,0,0.1)]' : 'bg-white'}`} style={prop.type === 'subject' ? { left: LABEL_COL_WIDTH, width: SUBJECT_COL_WIDTH } : {}}>
                       {section.id === 'quantitative' && prop.type !== 'subject' ? renderQuantitativeCell(prop.id, row, values[prop.id]?.[row.key] || { value: 0 }) : 
                        <span className="font-medium">{formatValue(values[prop.id]?.[row.key]?.value || getCalculatedValue(prop.id, row.key), row.format)}</span>}
                    </div>
                  ))}
                </React.Fragment>
              ))}
            </React.Fragment>
          ))}
        </div>

        {/* RECONCILIATION SECTION AT BOTTOM OF PAGE */}
        <div className="bg-slate-50 border-t border-slate-300 p-12 pb-32">
          <div className="max-w-5xl mx-auto flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-6 bg-emerald-500 rounded-full"></div>
                <h2 className="text-xl font-bold text-slate-800 uppercase tracking-wider">Value Reconciliation & Narrative</h2>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={generateNarrative} 
                  disabled={isGenerating} 
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-50 border border-purple-200 text-sm font-bold text-purple-600 shadow-sm hover:bg-purple-100 disabled:opacity-50 transition-all"
                >
                  {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  {isGenerating ? 'Drafting...' : 'Draft with AI'}
                </button>
                <button 
                  onClick={() => setIsModalOpen(true)} 
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-slate-200 text-sm font-bold text-slate-600 shadow-sm hover:bg-slate-50 transition-all"
                >
                  <Maximize2 size={16} /> Full Screen
                </button>
              </div>
            </div>

            <RichTextEditor 
              value={reconciliationText} 
              onChange={setReconciliationText} 
              placeholder="Start typing your reconciliation narrative here..."
              className="min-h-[300px] border-slate-200 shadow-lg"
              minHeight="300px"
            />
          </div>
        </div>
      </div>

      {/* FULL SCREEN MODAL POP-UP */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[1000] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-8 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-6xl h-full max-h-[92vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95">
                <div className="flex items-center justify-between px-8 py-4 border-b border-slate-200 bg-slate-50">
                    <div className="flex items-center gap-3">
                        <FileText className="text-emerald-600" />
                        <h2 className="font-bold text-lg text-slate-800">Focused Reconciliation Mode</h2>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={generateNarrative} disabled={isGenerating} className="flex items-center gap-2 px-6 py-2 rounded-lg bg-purple-600 text-white text-sm font-bold shadow-md hover:bg-purple-700 disabled:opacity-50 transition-all">
                             {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                             Auto-Draft with AI
                        </button>
                        <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-full hover:bg-slate-200 transition-colors">
                            <X size={24} className="text-slate-500" />
                        </button>
                    </div>
                </div>
                <div className="flex-1 p-10 bg-slate-100/10 overflow-auto flex justify-center">
                    <div className="w-full max-w-4xl h-full">
                        <RichTextEditor 
                            value={reconciliationText} 
                            onChange={setReconciliationText} 
                            className="h-full border-none shadow-none"
                            minHeight="100%"
                            autoFocus
                        />
                    </div>
                </div>
                <div className="px-8 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-400 flex justify-between">
                  <span>Press ESC to close</span>
                  <span>Changes are saved automatically</span>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};
