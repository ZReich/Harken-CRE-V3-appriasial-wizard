import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Minus,
  Maximize2,
  X,
  Trash2,
  AlertTriangle,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  List,
  MessageSquare,
  Plus,
  ChevronDown,
  PenLine
} from 'lucide-react';
import { Property, GridRowData, PropertyValues, ComparisonValue, Section, GridRowCategory } from '../types';
import { PropertyCard } from './PropertyCard';
import { INITIAL_ROWS, SECTIONS } from '../constants';
import EnhancedTextArea from '../../../components/EnhancedTextArea';
import { useWizard } from '../../../context/WizardContext';
import { getAvailableElements as filterElements, normalizeSection } from '../../../utils/elementFilter';
import type { SectionType } from '../../../constants/elementRegistry';
import { HorizontalScrollIndicator } from '../../../components/HorizontalScrollIndicator';

interface SalesGridProps {
  properties: Property[];
  values: PropertyValues;
  analysisMode?: 'standard' | 'residual';
  scenarioId?: number;
  onDeleteProperty?: (propertyId: string) => void;
}

export const SalesGrid: React.FC<SalesGridProps> = ({ properties, values: initialValues, analysisMode = 'standard', scenarioId, onDeleteProperty }) => {
  const { setApproachConclusion, state: wizardState } = useWizard();
  const { propertyType, propertySubtype, scenarios, activeScenarioId } = wizardState;
  
  // Get current scenario name for element filtering
  const currentScenario = scenarios.find(s => s.id === activeScenarioId)?.name;
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [rows, setRows] = useState<GridRowData[]>(INITIAL_ROWS);
  const [sections] = useState<Section[]>(SECTIONS);
  const [values, setValues] = useState<PropertyValues>(initialValues);
  const [reconciliationText, setReconciliationText] = useState("");
  const [activePopover, setActivePopover] = useState<{rowId: string, propId: string, field: 'value' | 'adjustment'} | null>(null);
  const [hiddenSections, setHiddenSections] = useState<Set<string>>(new Set());
  const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; sectionId: string; sectionTitle: string } | null>(null);
  const [notesEditor, setNotesEditor] = useState<{ isOpen: boolean; propId: string; propName: string; rowKey: string } | null>(null);
  const [notesContent, setNotesContent] = useState<string>('');
  const [openElementDropdown, setOpenElementDropdown] = useState<string | null>(null);

  // Calculate the concluded value from comparable properties
  const concludedValue = useMemo(() => {
    const subjectBldgSize = values['subject']?.['bldg_size_fact']?.value;
    if (typeof subjectBldgSize !== 'number' || subjectBldgSize <= 0) return null;
    
    // Get adjusted price/SF from all comps (non-subject properties)
    const compValues: number[] = [];
    properties.forEach(prop => {
      if (prop.type === 'subject') return;
      const propValues = values[prop.id];
      if (!propValues) return;
      
      // Calculate overall adjustment
      let netAdj = 0;
      Object.keys(propValues).forEach(key => {
        const entry = propValues[key];
        if (entry?.adjustment !== undefined && typeof entry.adjustment === 'number' && key !== 'price' && key !== 'price_sf') {
          netAdj += entry.adjustment;
        }
      });
      
      // Calculate adjusted price/SF
      let basePriceSf = 0;
      if (analysisMode === 'residual') {
        const price = propValues['price']?.value;
        const land = propValues['land_value']?.value;
        const bldgSf = propValues['bldg_size_fact']?.value;
        if (typeof price === 'number' && typeof land === 'number' && typeof bldgSf === 'number' && bldgSf > 0) {
          basePriceSf = (price - land) / bldgSf;
        }
      } else {
        basePriceSf = typeof propValues['price_sf']?.value === 'number' ? propValues['price_sf'].value : 0;
      }
      
      if (basePriceSf > 0) {
        const adjustedPriceSf = basePriceSf * (1 + netAdj);
        let totalVal = subjectBldgSize * adjustedPriceSf;
        if (analysisMode === 'residual') {
          const subjectLand = values['subject']?.['subject_land_add_back']?.value;
          if (typeof subjectLand === 'number') totalVal += subjectLand;
        }
        compValues.push(totalVal);
      }
    });
    
    if (compValues.length === 0) return null;
    
    // Return average of all comp values as the indication
    const avg = compValues.reduce((a, b) => a + b, 0) / compValues.length;
    return Math.round(avg);
  }, [values, properties, analysisMode]);

  // Sync concluded value to WizardContext when scenarioId is provided
  useEffect(() => {
    if (scenarioId !== undefined && concludedValue !== null) {
      setApproachConclusion(scenarioId, 'Sales Comparison', concludedValue);
    }
  }, [scenarioId, concludedValue, setApproachConclusion]);

  // Handle clicking outside to close dropdowns
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

  // Get available elements for a section that haven't been added yet
  // Uses dynamic filtering based on property type, subtype, approach, section, and scenario
  const getAvailableElements = (sectionId: string) => {
    const currentRowKeys = rows.filter(r => r.category === sectionId).map(r => r.key);
    
    // Normalize section ID to match registry format
    const normalizedSection = normalizeSection(sectionId) as SectionType;
    
    // Filter elements based on current context
    const filteredElements = filterElements({
      section: normalizedSection,
      propertyType: propertyType,
      subtype: propertySubtype,
      approach: 'sales_comparison',
      scenario: currentScenario,
      excludeKeys: currentRowKeys
    });
    
    // Map to the format expected by the dropdown
    return filteredElements.map(el => ({
      key: el.key,
      label: el.label,
      description: el.description
    }));
  };

  // Add an element from the available elements dropdown
  const handleAddElement = (sectionId: GridRowCategory, element: { label: string; key: string }) => {
    const newRow: GridRowData = { 
      id: `${sectionId}_${element.key}`, 
      category: sectionId, 
      label: element.label, 
      key: element.key, 
      format: 'text',
      mode: 'both'
    };
    
    // Check if already exists
    if (rows.some(r => r.key === element.key)) return;
    setRows(prev => [...prev, newRow]);
    setOpenElementDropdown(null);
  };

  // Add a custom element with user-typed name
  const handleAddCustomElement = (sectionId: GridRowCategory) => {
    const name = prompt('Enter element name:');
    if (!name) return;
    const key = name.toLowerCase().replace(/\s+/g, '_') + '_custom';
    const newRow: GridRowData = { 
      id: `${sectionId}_${key}`, 
      category: sectionId, 
      label: name, 
      key: key, 
      format: 'text',
      mode: 'both'
    };
    
    setRows(prev => [...prev, newRow]);
    setOpenElementDropdown(null);
  };

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
    // Use execCommand for rich text formatting
    const editor = document.getElementById('notes-editor');
    if (!editor) return;
    
    editor.focus();
    
    switch (format) {
      case 'bold':
        document.execCommand('bold', false);
        break;
      case 'italic':
        document.execCommand('italic', false);
        break;
      case 'underline':
        document.execCommand('underline', false);
        break;
      case 'alignLeft':
        document.execCommand('justifyLeft', false);
        break;
      case 'alignCenter':
        document.execCommand('justifyCenter', false);
        break;
      case 'bullet':
        document.execCommand('insertUnorderedList', false);
        break;
    }
    
    // Update state with new content
    setTimeout(() => {
      if (editor) {
        setNotesContent(editor.innerHTML);
      }
    }, 0);
  };
  
  const handleEditorInput = () => {
    const editor = document.getElementById('notes-editor');
    if (editor) {
      setNotesContent(editor.innerHTML);
    }
  };

  const getPropertyName = (propId: string) => {
    const prop = properties.find(p => p.id === propId);
    return prop?.name || propId;
  };

  // Strip HTML tags for preview display
  const stripHtml = (html: string) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  // Focus editor when modal opens
  useEffect(() => {
    if (notesEditor?.isOpen) {
      setTimeout(() => {
        const editor = document.getElementById('notes-editor');
        if (editor) {
          editor.focus();
          // Move cursor to end
          const range = document.createRange();
          const selection = window.getSelection();
          range.selectNodeContents(editor);
          range.collapse(false);
          selection?.removeAllRanges();
          selection?.addRange(range);
        }
      }, 100);
    }
  }, [notesEditor?.isOpen]);

  const LABEL_COL_WIDTH = 160;
  const SUBJECT_COL_WIDTH = 180;
  const COMP_COL_WIDTH = 170;
  const ACTION_COL_WIDTH = 160;
  
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

    // AUTO-CALCULATE: Extracted Cap Rate = NOI at Sale / Sale Price
    if (rowKey === 'extracted_cap_rate') {
      const price = propValues['price']?.value;
      const noi = propValues['noi_at_sale']?.value;
      if (typeof price === 'number' && price > 0 && typeof noi === 'number' && noi > 0) {
        return noi / price; // Returns as decimal (e.g., 0.0624 for 6.24%)
      }
      return null;
    }

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

  // Click-to-cycle function for qualitative adjustments
  const cycleQualitativeValue = (currentFlag: string | undefined): { value: string, flag: 'similar' | 'superior' | 'inferior' } => {
    const cycle: { value: string, flag: 'similar' | 'superior' | 'inferior' }[] = [
      { value: 'Similar', flag: 'similar' },
      { value: 'Superior', flag: 'superior' },
      { value: 'Inferior', flag: 'inferior' }
    ];
    const currentIndex = cycle.findIndex(c => c.flag === currentFlag?.toLowerCase());
    const nextIndex = (currentIndex + 1) % cycle.length;
    return cycle[nextIndex];
  };

  // Qualitative Chip Component - click to cycle through values
  const QualitativeChip = ({ propId, rowKey }: { propId: string, rowKey: string }) => {
    const currentValue = values[propId]?.[rowKey];
    const flag = currentValue?.flag || 'similar';
    
    const handleClick = () => {
      const next = cycleQualitativeValue(flag);
      setValues(prev => ({
        ...prev,
        [propId]: {
          ...prev[propId],
          [rowKey]: { value: next.value, flag: next.flag }
        }
      }));
    };

    const isSup = flag === 'superior';
    const isInf = flag === 'inferior';
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

  // Add Element Button with Dropdown - positioned in the Elements column
  const AddElementButton = ({ sectionId }: { sectionId: GridRowCategory }) => {
    const isOpen = openElementDropdown === sectionId;
    const availableElements = getAvailableElements(sectionId);
    
    return (
      <div className={`element-dropdown relative ${isOpen ? 'z-[500]' : ''}`}>
        <button 
          onClick={() => setOpenElementDropdown(isOpen ? null : sectionId)}
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
                    key={element.key}
                    onClick={() => handleAddElement(sectionId, element)}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-[#0da1c7]/5 transition-colors border-b border-slate-100 last:border-b-0 group"
                  >
                    <div className="font-medium text-slate-700 group-hover:text-[#0da1c7]">{element.label}</div>
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
                onClick={() => handleAddCustomElement(sectionId)}
                className="w-full text-left px-3 py-2.5 text-xs hover:bg-[#0da1c7]/5 transition-colors flex items-center gap-2 text-[#0da1c7] font-medium"
              >
                <PenLine size={12} />
                Add Custom
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Preset percent options for quantitative adjustments
  const percentOptions = [
    { value: 0.20, label: '+20%' },
    { value: 0.175, label: '+17.5%' },
    { value: 0.15, label: '+15%' },
    { value: 0.125, label: '+12.5%' },
    { value: 0.10, label: '+10%' },
    { value: 0.075, label: '+7.5%' },
    { value: 0.05, label: '+5%' },
    { value: 0.025, label: '+2.5%' },
    { value: 0, label: '0%' },
    { value: -0.025, label: '-2.5%' },
    { value: -0.05, label: '-5%' },
    { value: -0.075, label: '-7.5%' },
    { value: -0.10, label: '-10%' },
    { value: -0.125, label: '-12.5%' },
    { value: -0.15, label: '-15%' },
    { value: -0.175, label: '-17.5%' },
    { value: -0.20, label: '-20%' },
  ];

  // State for adjustment mode (Percent or Dollar)
  const [adjustmentMode, setAdjustmentMode] = useState<'Percent' | 'Dollar'>('Percent');
  const [customInputValue, setCustomInputValue] = useState<string>('');

  const renderQuantitativeCell = (propId: string, row: GridRowData, valObj: ComparisonValue) => {
    const numericValue = typeof valObj.value === 'number' ? valObj.value : 0;
    const isOpen = activePopover?.rowId === row.id && activePopover?.propId === propId;

    const getStatusLabel = (val: number) => val > 0 ? 'INF' : val < 0 ? 'SUP' : 'SIM';
    
    return (
      <div className="flex items-center w-full relative">
        <AdjustmentBadge 
          flag={numericValue < 0 ? 'superior' : numericValue > 0 ? 'inferior' : 'similar'} 
          value={numericValue} 
          onClick={() => {
            setActivePopover(isOpen ? null : { rowId: row.id, propId, field: 'value' });
            setCustomInputValue('');
          }} 
        />
        {isOpen && (
          <div className="adjustment-popover absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-slate-200 z-[200] overflow-hidden">
            {/* Mode Toggle Header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100 bg-slate-50">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                Adjustment Mode
              </span>
              <div className="flex gap-1">
                <button
                  type="button"
                  className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
                    adjustmentMode === 'Percent'
                      ? 'bg-[#0da1c7] text-white shadow-sm'
                      : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
                  }`}
                  onClick={() => setAdjustmentMode('Percent')}
                >
                  %
                </button>
                <button
                  type="button"
                  className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
                    adjustmentMode === 'Dollar'
                      ? 'bg-[#0da1c7] text-white shadow-sm'
                      : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
                  }`}
                  onClick={() => setAdjustmentMode('Dollar')}
                >
                  $
                </button>
              </div>
            </div>

            {adjustmentMode === 'Percent' ? (
              <>
                {/* Scrollable Percent Options */}
                <div className="max-h-48 overflow-y-auto">
                  {percentOptions.map((option) => (
                    <button
                      type="button"
                      key={option.value}
                      className={`w-full px-3 py-2 text-left text-sm hover:bg-slate-50 flex items-center justify-between transition-colors ${
                        numericValue === option.value ? 'bg-blue-50 text-blue-700' : ''
                      }`}
                      onClick={() => {
                        updateValue(propId, row.key, option.value, 'value');
                        setActivePopover(null);
                      }}
                    >
                      <span className="font-medium">{option.label}</span>
                      <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                        option.value > 0 
                          ? 'text-red-600 bg-red-50' 
                          : option.value < 0 
                            ? 'text-emerald-600 bg-emerald-50' 
                            : 'text-slate-500 bg-slate-100'
                      }`}>
                        {getStatusLabel(option.value)}
                      </span>
                    </button>
                  ))}
                </div>
                {/* Custom Input */}
                <div className="border-t border-slate-100 px-3 py-2.5 bg-slate-50">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                    Custom %
                  </label>
                  <div className="flex gap-2 mt-1.5">
                    <input
                      type="text"
                      className="flex-1 border border-slate-200 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent"
                      value={customInputValue}
                      placeholder="e.g. 12.5"
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9.-]/g, '');
                        setCustomInputValue(val);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const parsed = parseFloat(customInputValue) / 100;
                          if (!isNaN(parsed)) {
                            updateValue(propId, row.key, parsed, 'value');
                            setActivePopover(null);
                          }
                        }
                      }}
                    />
                    <button
                      type="button"
                      className="px-3 py-1.5 bg-[#0da1c7] text-white text-xs font-bold rounded-md hover:bg-[#0b8eaf] transition-colors"
                      onClick={() => {
                        const parsed = parseFloat(customInputValue) / 100;
                        if (!isNaN(parsed)) {
                          updateValue(propId, row.key, parsed, 'value');
                          setActivePopover(null);
                        }
                      }}
                    >
                      Apply
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Positive = inferior, negative = superior
                  </p>
                </div>
              </>
            ) : (
              /* Dollar Mode Input */
              <div className="p-3 space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                  Dollar Adjustment
                </label>
                <input
                  type="text"
                  autoFocus
                  className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent"
                  placeholder="Enter amount"
                  value={customInputValue}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9.-]/g, '');
                    setCustomInputValue(val);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const parsed = parseFloat(customInputValue) / 1000; // Store as fraction
                      if (!isNaN(parsed)) {
                        updateValue(propId, row.key, parsed, 'value');
                        setActivePopover(null);
                      }
                    }
                  }}
                />
                <button
                  type="button"
                  className="w-full px-3 py-2 bg-[#0da1c7] text-white text-xs font-bold rounded-md hover:bg-[#0b8eaf] transition-colors"
                  onClick={() => {
                    const parsed = parseFloat(customInputValue) / 1000;
                    if (!isNaN(parsed)) {
                      updateValue(propId, row.key, parsed, 'value');
                      setActivePopover(null);
                    }
                  }}
                >
                  Apply Dollar Adjustment
                </button>
                <p className="text-[10px] text-slate-400">
                  Positive = inferior, negative = superior
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const visibleRows = rows.filter(r => r.mode === 'both' || r.mode === analysisMode);

  return (
    <div className="flex flex-col h-full bg-slate-50 relative overflow-hidden">
      
      {/* SCROLLABLE AREA - Contains grid and reconciliation */}
      <div ref={scrollContainerRef} className="flex-1 overflow-auto custom-scrollbar relative" style={{ backgroundColor: '#ffffff', isolation: 'isolate' }}>
        {/* Horizontal Scroll Indicator - offset to avoid action column */}
        <HorizontalScrollIndicator scrollContainerRef={scrollContainerRef} stickyTop={120} rightOffset={ACTION_COL_WIDTH} />
        
        {/* Flex container for grid + action column */}
        <div 
          className="flex"
          style={{ minWidth: `${totalGridWidth + ACTION_COL_WIDTH}px` }}
        >
          {/* GRID CONTAINER */}
          <div 
            className="grid relative bg-white flex-shrink-0" 
            style={{ 
              gridTemplateColumns: `${LABEL_COL_WIDTH}px ${SUBJECT_COL_WIDTH}px repeat(${properties.length - 1}, ${COMP_COL_WIDTH}px)`, 
              minWidth: `${totalGridWidth}px`,
              backgroundColor: '#ffffff'
            }}
          >
            
            {/* Header Row - Sticky to top with solid backgrounds */}
            <div 
              className="sticky top-0 left-0 z-[120] border-b border-slate-200 flex items-end" 
              style={{ 
                width: LABEL_COL_WIDTH, 
                height: 120,
                backgroundColor: '#ffffff', 
                transform: 'translateZ(0)',
                willChange: 'transform'
              }}
            >
              <div className="p-2 pl-3">
                <div className="font-bold text-slate-400 text-xs uppercase tracking-wider">Elements</div>
              </div>
            </div>
            {properties.map((prop) => (
               <div 
                 key={prop.id} 
                 className={`sticky top-0 overflow-hidden flex flex-col ${
                   prop.type === 'subject' 
                     ? 'z-[110] border-b-2 border-[#0da1c7] shadow-[4px_0_16px_rgba(0,0,0,0.08)]' 
                     : 'z-[100] border-b border-slate-200'
                 }`} 
                 style={{ 
                   height: 120,
                   backgroundColor: '#ffffff',
                   transform: 'translateZ(0)',
                   willChange: 'transform',
                   ...(prop.type === 'subject' ? { left: LABEL_COL_WIDTH, width: SUBJECT_COL_WIDTH, position: 'sticky' as const } : {})
                 }}
               >
                  <PropertyCard property={prop} isSubject={prop.type === 'subject'} onDelete={onDeleteProperty} />
               </div>
            ))}

            {/* Sections */}
            {sections.filter(s => !hiddenSections.has(s.id)).map(section => {
              const hasResidualRows = visibleRows.some(r => r.category === section.id && r.mode === 'residual');
              const canDeleteSection = section.id === 'quantitative' || section.id === 'qualitative';
              return (
                <React.Fragment key={section.id}>
                  {/* Section Header - Full Width */}
                  <div 
                    className={`col-span-full relative z-[50] mt-4 border-y ${
                      hasResidualRows ? 'border-purple-300' : 'border-slate-200'
                    }`}
                    style={{ backgroundColor: hasResidualRows ? '#faf5ff' : '#f9fafb' }}
                  >
                    <div 
                      className={`sticky left-0 w-fit px-4 py-2 font-bold text-xs uppercase tracking-widest flex items-center gap-2 ${
                        hasResidualRows 
                          ? 'text-purple-700' 
                          : 'text-slate-700'
                      }`}
                      style={{ zIndex: 51, backgroundColor: hasResidualRows ? '#faf5ff' : '#f9fafb' }}
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
                      {/* Label Column - Sticky Left, never scrolls horizontally */}
                      <div 
                        className={`sticky left-0 z-[60] border-r border-b border-slate-100 flex items-center justify-between px-2 py-1.5 group ${
                          row.key === 'total_value' 
                            ? 'border-t-2 border-t-slate-800' 
                            : isResidualRow 
                            ? 'border-purple-200' 
                            : ''
                        }`} 
                        style={{ 
                          width: LABEL_COL_WIDTH,
                          backgroundColor: row.key === 'total_value' ? '#f8fafc' : isResidualRow ? '#faf5ff' : '#ffffff',
                          transform: 'translateZ(0)'
                        }}
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
                        const noteText = typeof noteValue === 'string' ? stripHtml(noteValue) : '';
                        const hasNotes = noteText.trim() !== '' && 
                          !noteText.toLowerCase().includes('click to');
                        
                        // Determine background color based on row type and property type
                        const getBgColor = () => {
                          if (row.key === 'total_value') return '#f8fafc';
                          if (prop.type === 'subject') return isResidualRow ? '#faf5ff' : '#eff6ff';
                          if (isResidualRow) return '#faf5ff';
                          return '#ffffff';
                        };
                        
                        return (
                          <div 
                            key={`${row.id}-${prop.id}`} 
                            className={`border-r border-b border-slate-100 p-2 flex items-center text-xs ${
                              prop.type === 'subject' 
                                ? 'z-[55] shadow-[4px_0_16px_rgba(0,0,0,0.05)]' 
                                : ''
                            } ${
                              row.key === 'total_value' 
                                ? 'border-t-2 border-t-slate-800 font-bold' 
                                : isResidualRow 
                                ? 'border-purple-200' 
                                : ''
                            } ${isNotesRow ? 'cursor-pointer hover:bg-slate-50 transition-colors' : ''}`} 
                            style={prop.type === 'subject' 
                              ? { 
                                  left: LABEL_COL_WIDTH, 
                                  width: SUBJECT_COL_WIDTH, 
                                  position: 'sticky' as const,
                                  backgroundColor: getBgColor(),
                                  transform: 'translateZ(0)'
                                } 
                              : { backgroundColor: getBgColor() }
                            }
                            onClick={isNotesRow ? () => openNotesEditor(prop.id, getPropertyName(prop.id), row.key) : undefined}
                          >
                             {isNotesRow ? (
                               <div className="flex items-center gap-1.5 w-full">
                                 <MessageSquare className={`w-3 h-3 flex-shrink-0 ${hasNotes ? 'text-[#0da1c7]' : 'text-slate-300'}`} />
                                 <span className={`truncate ${hasNotes ? 'text-slate-700' : 'text-slate-400 italic'}`}>
                                   {hasNotes 
                                     ? (noteText.length > 30 ? noteText.substring(0, 30) + '...' : noteText) 
                                     : 'Click to add notes'}
                                 </span>
                               </div>
                            ) : section.id === 'quantitative' && prop.type !== 'subject' 
                              ? renderQuantitativeCell(prop.id, row, values[prop.id]?.[row.key] || { value: 0 }) 
                              : section.id === 'qualitative' && prop.type !== 'subject'
                              ? <QualitativeChip propId={prop.id} rowKey={row.key} />
                              : (() => {
                                  // For calculated fields, always use the calculated value
                                  const calculatedVal = row.isCalculated ? getCalculatedValue(prop.id, row.key) : null;
                                  const displayValue = calculatedVal !== null 
                                    ? calculatedVal 
                                    : (values[prop.id]?.[row.key]?.value ?? getCalculatedValue(prop.id, row.key));
                                  
                                  // Special styling for auto-calculated cap rate
                                  const isAutoCalcCapRate = row.key === 'extracted_cap_rate' && calculatedVal !== null;
                                  
                                  return (
                                    <span className={`${
                                      row.key === 'total_value' 
                                        ? 'font-bold text-emerald-700' 
                                        : isResidualRow 
                                        ? 'font-semibold text-purple-700' 
                                        : isAutoCalcCapRate
                                        ? 'font-semibold text-[#0da1c7]'
                                        : 'font-medium'
                                    }`}>
                                      {formatValue(displayValue, row.format)}
                                      {isAutoCalcCapRate && (
                                        <span className="ml-1 text-[9px] text-slate-400 font-normal" title="Auto-calculated from NOI ÷ Sale Price">
                                          (auto)
                                        </span>
                                      )}
                                    </span>
                                  );
                                })()
                            }
                          </div>
                        );
                      })}
                    </React.Fragment>
                  );
                })}

                {/* Add Element Button Row for this section */}
                <div 
                  className={`sticky left-0 p-2 ${openElementDropdown === section.id ? 'z-[500]' : 'z-[60]'}`}
                  style={{ width: LABEL_COL_WIDTH, backgroundColor: '#ffffff' }}
                >
                  <AddElementButton sectionId={section.id as GridRowCategory} />
                </div>
                <div 
                  className="sticky left-[160px] z-[55] shadow-[4px_0_16px_rgba(0,0,0,0.05)]"
                  style={{ width: SUBJECT_COL_WIDTH, backgroundColor: '#ffffff' }}
                ></div>
                {properties.filter(p => p.type !== 'subject').map(prop => (
                  <div key={`add-element-${section.id}-${prop.id}`} className="bg-white"></div>
                ))}
                </React.Fragment>
              );
            })}
          </div>

          {/* ACTION COLUMN */}
          <div 
            className="flex-shrink-0 bg-slate-50 flex flex-col items-center justify-start py-8 sticky top-0 self-start"
            style={{ width: ACTION_COL_WIDTH, height: 'auto', minHeight: 400 }}
          >
            <div className="flex flex-col items-center justify-center h-80 py-4">
              {/* Add Comps */}
              <button 
                className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-white transition-colors group"
                title="Add a new comp manually"
              >
                <div className="w-12 h-12 rounded-full bg-[#0da1c7]/20 flex items-center justify-center group-hover:bg-[#0da1c7]/30 transition-colors">
                  <Plus className="w-6 h-6 text-[#0da1c7]" />
                </div>
                <span className="text-xs font-semibold text-[#0da1c7]">Add Comps</span>
              </button>
            </div>
          </div>
        </div>

        {/* RECONCILIATION SECTION - Stays centered, doesn't scroll horizontally */}
        <div 
          className="sticky left-0 bg-slate-50 border-t-2 border-slate-300 p-8 pt-10"
          style={{ width: '100vw', maxWidth: '100%' }}
        >
          <div className="max-w-4xl mx-auto flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <div className="w-2 h-8 bg-emerald-500 rounded-full"></div>
              <h2 className="text-xl font-bold text-slate-800 uppercase tracking-wider">Value Reconciliation & Narrative</h2>
            </div>

            <EnhancedTextArea
              label="Notes"
              value={reconciliationText}
              onChange={setReconciliationText}
              placeholder="Type your analysis and assumptions here..."
              sectionContext="sales_comparison"
              helperText="AI can draft a reconciliation narrative based on your sales comparison analysis."
              minHeight={300}
              rows={10}
            />
            
            {/* Bottom padding */}
            <div className="h-8"></div>
          </div>
        </div>
      </div>

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
                onClick={() => applyFormatting('alignLeft')}
                className="p-2 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
                title="Align Left"
              >
                <AlignLeft className="w-4 h-4" />
              </button>
              <button 
                onClick={() => applyFormatting('alignCenter')}
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
            
            {/* Rich Text Editor */}
            <div className="p-5">
              <div
                id="notes-editor"
                contentEditable
                onInput={handleEditorInput}
                dangerouslySetInnerHTML={{ __html: notesContent }}
                className="w-full h-48 px-4 py-3 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0da1c7]/30 focus:border-[#0da1c7] overflow-y-auto transition-all empty:before:content-['Type_your_analysis_and_assumptions_here...'] empty:before:text-slate-400"
                style={{ minHeight: '192px' }}
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
