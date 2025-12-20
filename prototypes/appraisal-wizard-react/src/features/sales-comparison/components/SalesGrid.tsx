import React, { useState, useEffect } from 'react';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Minus,
  Maximize2,
  Sparkles,
  Loader2,
  X,
  FileText,
  Trash2,
  AlertTriangle,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  List,
  MessageSquare
} from 'lucide-react';
import { Property, GridRowData, PropertyValues, ComparisonValue, Section } from '../types';
import { PropertyCard } from './PropertyCard';
import { RichTextEditor } from './RichTextEditor';
import { INITIAL_ROWS, SECTIONS } from '../constants';

interface SalesGridProps {
  properties: Property[];
  values: PropertyValues;
  analysisMode?: 'standard' | 'residual';
}

export const SalesGrid: React.FC<SalesGridProps> = ({ properties, values: initialValues, analysisMode = 'standard' }) => {
  const [rows, setRows] = useState<GridRowData[]>(INITIAL_ROWS);
  const [sections] = useState<Section[]>(SECTIONS);
  const [values, setValues] = useState<PropertyValues>(initialValues);
  const [reconciliationText, setReconciliationText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activePopover, setActivePopover] = useState<{rowId: string, propId: string, field: 'value' | 'adjustment'} | null>(null);
  const [hiddenSections, setHiddenSections] = useState<Set<string>>(new Set());
  const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; sectionId: string; sectionTitle: string } | null>(null);
  const [notesEditor, setNotesEditor] = useState<{ isOpen: boolean; propId: string; propName: string; rowKey: string } | null>(null);
  const [notesContent, setNotesContent] = useState<string>('');

  const removeRow = (rowId: string) => {
    setRows(prev => prev.filter(r => r.id !== rowId));
  };

  const handleSectionDeleteClick = (sectionId: string, sectionTitle: string) => {
    setConfirmDelete({ isOpen: true, sectionId, sectionTitle });
  };

  const confirmSectionDelete = () => {
    if (confirmDelete) {
      setHiddenSections(prev => new Set([...prev, confirmDelete.sectionId]));
      setConfirmDelete(null);
    }
  };

  const cancelSectionDelete = () => {
    setConfirmDelete(null);
  };

  const openNotesEditor = (propId: string, propName: string, rowKey: string) => {
    const currentValue = values[propId]?.[rowKey]?.value || '';
    // Clear placeholder text - start with empty if it's a default placeholder
    const isPlaceholder = typeof currentValue === 'string' && 
      (currentValue.toLowerCase().includes('click to') || currentValue === '');
    setNotesContent(isPlaceholder ? '' : (typeof currentValue === 'string' ? currentValue : ''));
    setNotesEditor({ isOpen: true, propId, propName, rowKey });
  };

  const saveNotes = () => {
    if (notesEditor) {
      setValues(prev => ({
        ...prev,
        [notesEditor.propId]: {
          ...prev[notesEditor.propId],
          [notesEditor.rowKey]: { ...prev[notesEditor.propId]?.[notesEditor.rowKey], value: notesContent }
        }
      }));
      setNotesEditor(null);
      setNotesContent('');
    }
  };

  const closeNotesEditor = () => {
    setNotesEditor(null);
    setNotesContent('');
  };

  const applyFormatting = (format: string) => {
    // Simple formatting - in a real app, you'd use a rich text editor library
    const textarea = document.getElementById('notes-textarea') as HTMLTextAreaElement;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = notesContent.substring(start, end);
    
    let formattedText = selectedText;
    switch (format) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        break;
      case 'underline':
        formattedText = `__${selectedText}__`;
        break;
      case 'bullet':
        formattedText = `\n• ${selectedText}`;
        break;
    }
    
    const newContent = notesContent.substring(0, start) + formattedText + notesContent.substring(end);
    setNotesContent(newContent);
  };

  const getPropertyName = (propId: string) => {
    const prop = properties.find(p => p.id === propId);
    return prop?.name || propId;
  };

  const LABEL_COL_WIDTH = 160;
  const SUBJECT_COL_WIDTH = 180;
  const COMP_COL_WIDTH = 170;
  
  // Calculate total grid width for reconciliation section
  const totalGridWidth = LABEL_COL_WIDTH + SUBJECT_COL_WIDTH + (properties.length - 1) * COMP_COL_WIDTH;

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
      const finalPriceSf = getCalculatedValue(propId, 'adj_price_sf_val') as number || 0;
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
    setIsGenerating(true);
    try {
      // Simulated AI response for demo
      await new Promise(resolve => setTimeout(resolve, 1500));
      const narrative = `<h3>Sales Comparison Analysis Reconciliation</h3>
<p>Based on our analysis of ${properties.length - 1} comparable sales, we have derived a value indication for the subject property.</p>
<p>The comparables selected represent the most relevant transactions in the market area, with adjustments made for differences in time, location, condition, and other property characteristics.</p>
<ul>
<li>Sales ranged from recently closed to transactions within the past 5 years</li>
<li>Net adjustments ranged from -10% to +25%</li>
<li>The strongest emphasis was placed on the most similar sales with the lowest net adjustments</li>
</ul>
<p><strong>Conclusion:</strong> Based on the Sales Comparison Approach, the indicated value of the subject property is <strong>$2,062,000</strong> (rounded).</p>`;
      setReconciliationText(narrative);
    } catch (error) {
      setReconciliationText("<p style='color: red;'>Error generating narrative. Please try again.</p>");
    } finally {
      setIsGenerating(false);
    }
  };

  const updateValue = (propId: string, rowKey: string, val: number, field: 'value' | 'adjustment' = 'value') => {
    setValues(prev => ({
      ...prev,
      [propId]: {
        ...prev[propId],
        [rowKey]: { ...prev[propId][rowKey], [field]: val }
      }
    }));
  };

  const AdjustmentBadge = ({ flag, value, onClick, showValue = true }: { flag?: string, value: number, onClick: () => void, showValue?: boolean }) => {
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
         <div className="adjustment-popover absolute top-full right-0 mt-2 w-32 bg-white rounded-xl shadow-2xl border border-slate-200 z-[200] p-2">
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
      
      {/* SCROLLABLE AREA - Contains grid and reconciliation */}
      <div className="flex-1 overflow-auto custom-scrollbar relative bg-white">
        {/* GRID CONTAINER */}
        <div className="grid relative bg-white" style={{ gridTemplateColumns: `${LABEL_COL_WIDTH}px ${SUBJECT_COL_WIDTH}px repeat(${properties.length - 1}, ${COMP_COL_WIDTH}px)`, minWidth: `${totalGridWidth}px` }}>
            
            {/* Header Row - Sticky to top */}
            <div 
              className="sticky top-0 left-0 z-[120] bg-white border-b-2 border-slate-300 p-2 pl-3 flex items-end" 
              style={{ width: LABEL_COL_WIDTH }}
            >
              <div className="font-bold text-slate-400 text-xs uppercase tracking-wider">Elements</div>
            </div>
            {properties.map((prop) => (
               <div 
                 key={prop.id} 
                 className={`sticky top-0 border-b-2 border-r ${
                   prop.type === 'subject' 
                     ? 'z-[110] border-blue-300 bg-blue-50 shadow-[4px_0_16px_rgba(0,0,0,0.08)]' 
                     : 'z-[100] border-slate-300 bg-white'
                 }`} 
                 style={prop.type === 'subject' ? { left: LABEL_COL_WIDTH, width: SUBJECT_COL_WIDTH, position: 'sticky' } : {}}
               >
                  <PropertyCard property={prop} isSubject={prop.type === 'subject'} />
               </div>
            ))}

            {/* Sections */}
            {sections.filter(s => !hiddenSections.has(s.id)).map(section => {
              const hasResidualRows = visibleRows.some(r => r.category === section.id && r.mode === 'residual');
              const canDeleteSection = section.id === 'quantitative' || section.id === 'qualitative';
              return (
                <React.Fragment key={section.id}>
                  {/* Section Header - Full Width */}
                  <div className={`col-span-full relative z-[50] mt-4 border-y ${
                    hasResidualRows ? 'border-purple-300' : 'border-slate-200'
                  }`}>
                    <div className={`absolute left-0 right-0 h-full opacity-30 ${
                      hasResidualRows ? 'bg-purple-50' : section.color
                    }`}></div>
                    <div 
                      className={`sticky left-0 w-fit px-4 py-2 font-bold text-xs uppercase tracking-widest backdrop-blur-sm flex items-center gap-2 ${
                        hasResidualRows 
                          ? 'bg-purple-50/95 text-purple-700' 
                          : 'bg-gray-50/95 text-slate-700'
                      }`}
                      style={{ zIndex: 51 }}
                    >
                        {section.title}
                        {canDeleteSection && (
                          <button
                            onClick={() => handleSectionDeleteClick(section.id, section.title)}
                            className="ml-2 p-1 rounded hover:bg-red-100 text-slate-400 hover:text-red-500 transition-colors"
                            title={`Remove ${section.title} section`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                    </div>
                  </div>

                {/* Section Rows */}
                {visibleRows.filter(r => r.category === section.id).map(row => {
                  const isResidualRow = row.mode === 'residual';
                  return (
                    <React.Fragment key={row.id}>
                      {/* Label Column - Sticky Left */}
                      <div 
                        className={`sticky left-0 z-[60] border-r border-b border-slate-100 flex items-center justify-between px-2 py-1.5 group ${
                          row.key === 'total_value' 
                            ? 'border-t-2 border-t-slate-800 bg-slate-50' 
                            : isResidualRow 
                            ? 'bg-purple-50 border-purple-200' 
                            : 'bg-white'
                        }`} 
                        style={{ width: LABEL_COL_WIDTH }}
                      >
                        <span className={`text-xs truncate ${
                          row.key === 'total_value' 
                            ? 'font-black text-slate-900 uppercase' 
                            : isResidualRow 
                            ? 'font-semibold text-purple-700' 
                            : 'font-medium text-slate-600'
                        }`}>{row.label}</span>
                        <button
                          onClick={() => removeRow(row.id)}
                          className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-red-100 text-slate-300 hover:text-red-500 transition-all"
                          title={`Remove ${row.label}`}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                      
                      {/* Data Cells */}
                      {properties.map(prop => {
                        const isNotesRow = row.key === 'notes';
                        const noteValue = values[prop.id]?.[row.key]?.value;
                        const hasNotes = noteValue && 
                          typeof noteValue === 'string' && 
                          noteValue.trim() !== '' && 
                          !noteValue.toLowerCase().includes('click to');
                        
                        return (
                          <div 
                            key={`${row.id}-${prop.id}`} 
                            className={`border-r border-b border-slate-100 p-2 flex items-center text-xs ${
                              prop.type === 'subject' 
                                ? `z-[55] shadow-[4px_0_16px_rgba(0,0,0,0.05)] ${
                                  isResidualRow ? 'bg-purple-50' : 'bg-blue-50'
                                }` 
                                : isResidualRow 
                                ? 'bg-purple-50' 
                                : 'bg-white'
                            } ${
                              row.key === 'total_value' 
                                ? 'border-t-2 border-t-slate-800 bg-slate-50 font-bold' 
                                : isResidualRow 
                                ? 'border-purple-200' 
                                : ''
                            } ${isNotesRow ? 'cursor-pointer hover:bg-slate-50 transition-colors' : ''}`} 
                            style={prop.type === 'subject' ? { left: LABEL_COL_WIDTH, width: SUBJECT_COL_WIDTH, position: 'sticky' } : {}}
                            onClick={isNotesRow ? () => openNotesEditor(prop.id, getPropertyName(prop.id), row.key) : undefined}
                          >
                             {isNotesRow ? (
                               <div className="flex items-center gap-1.5 w-full">
                                 <MessageSquare className={`w-3 h-3 flex-shrink-0 ${hasNotes ? 'text-[#0da1c7]' : 'text-slate-300'}`} />
                                 <span className={`truncate ${hasNotes ? 'text-slate-700' : 'text-slate-400 italic'}`}>
                                   {hasNotes && typeof noteValue === 'string' 
                                     ? (noteValue.length > 25 ? noteValue.substring(0, 25) + '...' : noteValue) 
                                     : 'Click to add notes'}
                                 </span>
                               </div>
                             ) : section.id === 'quantitative' && prop.type !== 'subject' 
                               ? renderQuantitativeCell(prop.id, row, values[prop.id]?.[row.key] || { value: 0 }) 
                               : <span className={
                                   row.key === 'total_value' 
                                     ? 'font-bold text-emerald-700' 
                                     : isResidualRow 
                                     ? 'font-semibold text-purple-700' 
                                     : 'font-medium'
                                 }>{formatValue(values[prop.id]?.[row.key]?.value ?? getCalculatedValue(prop.id, row.key), row.format)}</span>
                             }
                          </div>
                        );
                      })}
                    </React.Fragment>
                  );
                })}
                </React.Fragment>
              );
            })}
        </div>

        {/* RECONCILIATION SECTION - Only appears when scrolled to bottom, centered, no horizontal scroll */}
        <div className="bg-slate-50 border-t-2 border-slate-300 p-8 pt-10" style={{ width: '100%', minWidth: '100%' }}>
          <div className="max-w-4xl mx-auto flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-8 bg-emerald-500 rounded-full"></div>
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
              placeholder="Start typing your reconciliation narrative here, or use the 'Draft with AI' button to generate content..."
              className="min-h-[300px] border-slate-200 shadow-lg bg-white"
              minHeight="300px"
            />
            
            {/* Bottom padding */}
            <div className="h-8"></div>
          </div>
        </div>
      </div>

      {/* FULL SCREEN MODAL POP-UP */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[1000] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-8">
            <div className="bg-white w-full max-w-6xl h-full max-h-[92vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
                <div className="flex items-center justify-between px-8 py-4 border-b border-slate-200 bg-slate-50">
                    <div className="flex items-center gap-3">
                        <FileText className="text-emerald-600" />
                        <h2 className="font-bold text-lg text-slate-800">Focused Reconciliation Mode</h2>
                    </div>
                    <div className="flex items-center gap-3">
                        <button 
                          onClick={generateNarrative} 
                          disabled={isGenerating} 
                          className="flex items-center gap-2 px-6 py-2 rounded-lg bg-purple-600 text-white text-sm font-bold shadow-md hover:bg-purple-700 disabled:opacity-50 transition-all"
                        >
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

      {/* NOTES EDITOR MODAL */}
      {notesEditor?.isOpen && (
        <div className="fixed inset-0 z-[1100] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div 
            className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#0da1c7] to-[#0b8dad] px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-white/80" />
                <h3 className="text-white font-semibold text-sm uppercase tracking-wide">
                  Editing Notes: {notesEditor.propName}
                </h3>
              </div>
              <button 
                onClick={closeNotesEditor}
                className="p-1 rounded hover:bg-white/20 transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
            
            {/* Formatting Toolbar */}
            <div className="px-5 py-3 border-b border-slate-200 flex items-center gap-1">
              <button 
                onClick={() => applyFormatting('bold')}
                className="p-2 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
                title="Bold"
              >
                <Bold className="w-4 h-4" />
              </button>
              <button 
                onClick={() => applyFormatting('italic')}
                className="p-2 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
                title="Italic"
              >
                <Italic className="w-4 h-4" />
              </button>
              <button 
                onClick={() => applyFormatting('underline')}
                className="p-2 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
                title="Underline"
              >
                <Underline className="w-4 h-4" />
              </button>
              <div className="w-px h-5 bg-slate-200 mx-1"></div>
              <button 
                className="p-2 rounded bg-slate-100 text-[#0da1c7] transition-colors"
                title="Align Left"
              >
                <AlignLeft className="w-4 h-4" />
              </button>
              <button 
                className="p-2 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
                title="Align Center"
              >
                <AlignCenter className="w-4 h-4" />
              </button>
              <button 
                onClick={() => applyFormatting('bullet')}
                className="p-2 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
                title="Bullet List"
              >
                <List className="w-4 h-4" />
              </button>
              <div className="flex-1"></div>
              <button 
                className="p-2 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                title="Full Screen"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
            
            {/* Text Area */}
            <div className="p-5">
              <textarea
                id="notes-textarea"
                value={notesContent}
                onChange={(e) => setNotesContent(e.target.value)}
                placeholder="Type your analysis and assumptions here..."
                className="w-full h-48 px-4 py-3 border border-slate-200 rounded-lg text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0da1c7]/30 focus:border-[#0da1c7] resize-none transition-all"
                autoFocus
              />
            </div>
            
            {/* Actions */}
            <div className="px-5 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                onClick={closeNotesEditor}
                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveNotes}
                className="px-5 py-2 rounded-lg text-sm font-semibold text-white bg-[#0da1c7] hover:bg-[#0b8dad] shadow-sm hover:shadow transition-all"
              >
                Save Notes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SECTION DELETE CONFIRMATION MODAL */}
      {confirmDelete?.isOpen && (
        <div className="fixed inset-0 z-[1100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div 
            className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Warning Header */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">Remove Section?</h3>
                <p className="text-white/80 text-sm">This action cannot be undone</p>
              </div>
            </div>
            
            {/* Content */}
            <div className="px-6 py-5">
              <p className="text-slate-600 text-sm leading-relaxed">
                Are you sure you want to remove the <span className="font-semibold text-slate-800">"{confirmDelete.sectionTitle}"</span> section? 
                All rows within this section will be hidden from the grid.
              </p>
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="text-amber-800 text-xs">
                  This will remove all adjustment data from your analysis. You may need to refresh the page to restore this section.
                </p>
              </div>
            </div>
            
            {/* Actions */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                onClick={cancelSectionDelete}
                className="px-5 py-2.5 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
              >
                No, Keep It
              </button>
              <button
                onClick={confirmSectionDelete}
                className="px-5 py-2.5 rounded-lg text-sm font-bold text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-md hover:shadow-lg transition-all"
              >
                Yes, Remove Section
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
