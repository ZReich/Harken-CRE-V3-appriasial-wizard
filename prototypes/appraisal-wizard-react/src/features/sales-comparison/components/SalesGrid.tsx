import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Maximize2,
  Minimize2,
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
  PenLine,
  ChevronUp,
  Map as MapIcon,
  Star,
  Link2,
  Calculator
} from 'lucide-react';
import { NotesEditorModal } from '../../../components/NotesEditorModal';
import { OverridePopover, OverrideBadge, type OverrideData } from '../../../components/OverridePopover';
import { AdjustmentExplanationPopover } from '../../../components/AdjustmentExplanationPopover';
import { Property, GridRowData, PropertyValues, ComparisonValue, Section, GridRowCategory, AdjustmentExplanation } from '../types';
import { PropertyCard } from './PropertyCard';
import { INITIAL_ROWS, SECTIONS } from '../constants';
import EnhancedTextArea from '../../../components/EnhancedTextArea';
import { useWizard } from '../../../context/WizardContext';
import { getAvailableElements as filterElements, normalizeSection } from '../../../utils/elementFilter';
import type { SectionType } from '../../../constants/elementRegistry';
import { HorizontalScrollIndicator } from '../../../components/HorizontalScrollIndicator';
import { ComparableMapPreview } from '../../../components/ComparableMapPreview';
import { useCustomGridElements } from '../../../hooks/useCustomGridElements';
import type { SalesGridConfiguration } from '../../../types';
import { getUnitLabel, getUnitShortLabel, INDUSTRIAL_CONFIG } from '../../../constants/gridConfigurations';
import { getPhysicalFieldsForGridType, getTransactionalFieldsForGridType } from '../../../constants/gridFieldDefinitions';

interface SalesGridProps {
  properties: Property[];
  values: PropertyValues;
  analysisMode?: 'standard' | 'residual';
  scenarioId?: number;
  onDeleteProperty?: (propertyId: string) => void;
  /** Grid configuration - determines visible fields and calculation methods */
  gridConfig?: SalesGridConfiguration;
  componentId?: string;
  componentCategory?: string | null;
  componentSubtype?: string | null;
}


export const SalesGrid: React.FC<SalesGridProps> = ({
  properties,
  values: initialValues,
  analysisMode = 'standard',
  scenarioId,
  onDeleteProperty,
  gridConfig,
  componentId,
  componentCategory,
  componentSubtype,
}) => {

  const {
    setApproachConclusion,
    setSalesComparisonData,
    setSalesComparisonDataForComponent,
    state: wizardState,
  } = useWizard();
  const {
    propertyType,
    propertySubtype,
    scenarios,
    activeScenarioId,
    salesComparisonData,
    salesComparisonDataByComponent,
    landValuationData,
    subjectData,
  } = wizardState;
  
  // Use grid config from props, or fall back to wizard state, or use a default
  const activeGridConfig = gridConfig || subjectData?.gridConfiguration;
  const { addCustomElement, getCustomElementsByCategory, removeCustomElement } = useCustomGridElements();

  // Get current scenario name for element filtering
  const currentScenario = scenarios.find(s => s.id === activeScenarioId)?.name;
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [rows, setRows] = useState<GridRowData[]>(INITIAL_ROWS);
  const [sections] = useState<Section[]>(SECTIONS);
  const activeSalesData = componentId
    ? salesComparisonDataByComponent?.[componentId]
    : salesComparisonData;
  // Load values from context if available, otherwise use initial values from props
  const [values, setValues] = useState<PropertyValues>(
    activeSalesData?.values ? (activeSalesData.values as unknown as PropertyValues) : initialValues
  );
  const [reconciliationText, setReconciliationText] = useState(
    activeSalesData?.reconciliationText ?? ""
  );
  const [activePopover, setActivePopover] = useState<{ rowId: string, propId: string, field: 'value' | 'adjustment' } | null>(null);
  const [activeOverridePopover, setActiveOverridePopover] = useState<{ rowKey: string, propId: string } | null>(null);
  const [activeExplanationPopover, setActiveExplanationPopover] = useState<{ rowKey: string, propId: string } | null>(null);
  const [hiddenSections, setHiddenSections] = useState<Set<string>>(new Set());
  const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; sectionId: string; sectionTitle: string } | null>(null);
  const [notesEditor, setNotesEditor] = useState<{ isOpen: boolean; propId: string; propName: string; rowKey: string } | null>(null);
  const [notesContent, setNotesContent] = useState<string>('');

  useEffect(() => {
    const nextValues = activeSalesData?.values
      ? (activeSalesData.values as unknown as PropertyValues)
      : initialValues;
    setValues(nextValues);
    setReconciliationText(activeSalesData?.reconciliationText ?? "");
  }, [componentId, initialValues, activeSalesData?.values, activeSalesData?.reconciliationText]);
  
  // List of calculated fields that can be overridden
  const OVERRIDABLE_CALCULATED_FIELDS = [
    'extracted_cap_rate',
    'residual_value', 
    'residual_price_sf',
    'overall_adj',
    'overall_comp',
    'adj_price_sf',
    'adj_price_sf_val',
    'total_value'
  ];
  const [openElementDropdown, setOpenElementDropdown] = useState<string | null>(null);
  const [addingCustomToSection, setAddingCustomToSection] = useState<string | null>(null);
  const [customElementName, setCustomElementName] = useState('');
  const [saveCustomForFuture, setSaveCustomForFuture] = useState(false);
  const [dropdownPlacement, setDropdownPlacement] = useState<'top' | 'bottom'>('bottom');
  const buttonRef = useRef<HTMLButtonElement>(null);

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

  // Auto-populate subject_land_add_back from Land Valuation when in residual mode
  // This creates the data connection between Land Valuation and Sales Comparison
  useEffect(() => {
    if (analysisMode === 'residual' && landValuationData?.concludedLandValue) {
      const currentValue = values['subject']?.['subject_land_add_back']?.value;
      
      // Only auto-populate if not already set or if land valuation value changed
      if (currentValue !== landValuationData.concludedLandValue) {
        setValues(prev => ({
          ...prev,
          subject: {
            ...prev['subject'],
            subject_land_add_back: { 
              value: landValuationData.concludedLandValue, 
              adjustment: 0,
              flag: 'similar' as const,
              linkedFromLandValuation: true  // Flag to indicate this came from Land Valuation
            }
          }
        }));
      }
    }
  }, [analysisMode, landValuationData?.concludedLandValue]);

  // Check if per-unit SF is unknown (use subjectData.perUnitSfUnknown or check unitMix sfSource)
  const isSfUnknown = useMemo(() => {
    // Check explicit flag first
    if (subjectData?.perUnitSfUnknown) return true;
    // Check if unit mix has unknown sfSource
    if (subjectData?.unitMix?.some(u => u.sfSource === 'unknown')) return true;
    return false;
  }, [subjectData?.perUnitSfUnknown, subjectData?.unitMix]);
  
  // Calculate concluded value per SF (skip if SF is unknown)
  const concludedValuePsf = useMemo(() => {
    if (isSfUnknown) return null; // Don't calculate $/SF when SF is unknown
    const subjectBldgSize = values['subject']?.['bldg_size_fact']?.value;
    if (concludedValue && typeof subjectBldgSize === 'number' && subjectBldgSize > 0) {
      return Math.round(concludedValue / subjectBldgSize);
    }
    return null;
  }, [concludedValue, values, isSfUnknown]);
  
  // Calculate concluded value per unit (for multi-family properties)
  const concludedValuePerUnit = useMemo(() => {
    const unitCount = subjectData?.totalUnitCount;
    if (concludedValue && typeof unitCount === 'number' && unitCount > 0) {
      return Math.round(concludedValue / unitCount);
    }
    return null;
  }, [concludedValue, subjectData?.totalUnitCount]);
  
  // Determine if we should show dual metrics (both $/SF and $/unit)
  const showDualMetrics = activeGridConfig?.gridType === 'multi_family' || 
                          activeGridConfig?.gridType === 'hotel_motel';
  
  // Get the primary metric based on configuration
  const primaryMetricLabel = activeGridConfig ? getUnitLabel(activeGridConfig.unitOfMeasure) : '$/SF';
  const primaryMetricValue = activeGridConfig?.unitOfMeasure === 'per_unit' 
    ? concludedValuePerUnit 
    : concludedValuePsf;

  // Persist sales comparison data to WizardContext
  useEffect(() => {
    // Convert local property and value format to storage format
    const dataToSave = {
      properties: properties.map(p => ({
        id: p.id,
        type: p.type,
        name: p.name,
        address: p.address,
        image: p.image,
        status: p.status,
      })),
      values: values as unknown as Record<string, Record<string, import('../../../types').SalesCompValue>>,
      reconciliationText,
      analysisMode,
      concludedValue,
      concludedValuePsf,
    };
    if (componentId) {
      setSalesComparisonDataForComponent(componentId, dataToSave);
    } else {
      setSalesComparisonData(dataToSave);
    }
  }, [
    values,
    reconciliationText,
    analysisMode,
    concludedValue,
    concludedValuePsf,
    properties,
    componentId,
    setSalesComparisonData,
    setSalesComparisonDataForComponent,
  ]);

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
      propertyType: componentCategory ?? propertyType,
      subtype: componentSubtype ?? propertySubtype,
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

  // Start adding a custom element - switch view in dropdown
  const handleStartCustomElement = (sectionId: GridRowCategory) => {
    setAddingCustomToSection(sectionId);
    setCustomElementName('');
    setSaveCustomForFuture(false);
  };

  // Confirm adding custom element
  const handleConfirmCustomElement = () => {
    if (!customElementName.trim() || !addingCustomToSection) return;

    const sectionId = addingCustomToSection as GridRowCategory;
    const name = customElementName.trim();
    const key = name.toLowerCase().replace(/\s+/g, '_') + '_custom';

    // Add to current grid
    const newRow: GridRowData = {
      id: `${sectionId}_${key}`,
      category: sectionId,
      label: name,
      key: key,
      format: 'text',
      mode: 'both'
    };

    if (!rows.some(r => r.key === key)) {
      setRows(prev => [...prev, newRow]);
    }

    // Save to local storage if requested
    if (saveCustomForFuture) {
      addCustomElement({
        category: sectionId,
        label: name,
        key: key
      });
    }

    setOpenElementDropdown(null);
    setAddingCustomToSection(null);
    setCustomElementName('');
    setSaveCustomForFuture(false);
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

  // Apply an override to a calculated field
  const applyOverride = (propId: string, rowKey: string, override: OverrideData) => {
    setValues(prev => ({
      ...prev,
      [propId]: {
        ...prev[propId],
        [rowKey]: { 
          ...prev[propId]?.[rowKey],
          value: prev[propId]?.[rowKey]?.value ?? null,
          override 
        }
      }
    }));
    setActiveOverridePopover(null);
  };

  // Clear an override from a calculated field
  const clearOverride = (propId: string, rowKey: string) => {
    setValues(prev => {
      const updated = { ...prev };
      if (updated[propId]?.[rowKey]) {
        const { override: _, ...rest } = updated[propId][rowKey];
        updated[propId] = {
          ...updated[propId],
          [rowKey]: rest
        };
      }
      return updated;
    });
    setActiveOverridePopover(null);
  };

  // Save adjustment explanation for USPAP compliance
  const saveExplanation = (propId: string, rowKey: string, explanation: AdjustmentExplanation) => {
    setValues(prev => ({
      ...prev,
      [propId]: {
        ...prev[propId],
        [rowKey]: {
          ...prev[propId]?.[rowKey],
          explanation: {
            ...explanation,
            updatedAt: new Date().toISOString()
          }
        }
      }
    }));
    setActiveExplanationPopover(null);
  };

  // Clear adjustment explanation
  const clearExplanation = (propId: string, rowKey: string) => {
    setValues(prev => {
      const updated = { ...prev };
      if (updated[propId]?.[rowKey]) {
        const { explanation: _, ...rest } = updated[propId][rowKey];
        updated[propId] = {
          ...updated[propId],
          [rowKey]: rest
        };
      }
      return updated;
    });
    setActiveExplanationPopover(null);
  };

  // Get the display value for a field (considering overrides)
  const getDisplayValue = (propId: string, rowKey: string, row: GridRowData): { 
    value: number | string | null; 
    isOverridden: boolean; 
    override?: OverrideData;
    calculatedValue: number | string | null;
  } => {
    const propValues = values[propId];
    const compValue = propValues?.[rowKey];
    const calculatedValue = row.isCalculated ? getCalculatedValue(propId, rowKey) : null;
    
    // Check if there's an override
    if (compValue?.override) {
      return {
        value: compValue.override.overrideValue,
        isOverridden: true,
        override: compValue.override,
        calculatedValue
      };
    }
    
    // Use calculated value if available, otherwise stored value
    return {
      value: calculatedValue ?? compValue?.value ?? null,
      isOverridden: false,
      calculatedValue
    };
  };

  // Determine format type for override popover
  const getOverrideFormat = (format?: string): 'currency' | 'percent' | 'number' | 'text' => {
    if (format === 'currency' || format === 'currency_sf') return 'currency';
    if (format === 'percent' || format === 'percent_adjustment') return 'percent';
    if (format === 'number') return 'number';
    return 'text';
  };

  const AdjustmentBadge = ({ flag, value, onClick, showValue = true }: { flag?: string, value: number, onClick: () => void, showValue?: boolean }) => {
    const isSup = flag === 'superior' || flag === 'Superior';
    const isInf = flag === 'inferior' || flag === 'Inferior';
    const baseClass = `inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide border shadow-sm transition-all cursor-pointer`;

    if (isSup) return <span onClick={onClick} className={`${baseClass} bg-accent-teal-mint-light text-accent-teal-mint border-accent-teal-mint hover:bg-accent-teal-mint-light`}>
      <ArrowUpRight className="w-3 h-3" /> SUP {showValue && value !== 0 && <span className="ml-1 border-l border-accent-teal-mint-light pl-1">{Math.abs(value * 100).toFixed(1)}%</span>}
    </span>;
    if (isInf) return <span onClick={onClick} className={`${baseClass} bg-accent-red-light text-harken-error border-harken-error/20 hover:bg-accent-red-light`}>
      <ArrowDownRight className="w-3 h-3" /> INF {showValue && value !== 0 && <span className="ml-1 border-l border-harken-error/30 pl-1">{Math.abs(value * 100).toFixed(1)}%</span>}
    </span>;
    return <span onClick={onClick} className={`${baseClass} bg-surface-2 dark:bg-elevation-2 dark:bg-elevation-1 text-slate-500 dark:text-slate-400 border-light-border dark:border-dark-border dark:border-harken-gray hover:bg-surface-3 dark:hover:bg-elevation-subtle`}><Minus className="w-3 h-3" /> SIM</span>;
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
  const QualitativeChip = ({ propId, rowKey, rowLabel }: { propId: string, rowKey: string, rowLabel: string }) => {
    const currentValue = values[propId]?.[rowKey];
    const flag = currentValue?.flag || 'similar';
    const hasExplanation = !!currentValue?.explanation?.text;
    const isExplanationOpen = activeExplanationPopover?.rowKey === rowKey && activeExplanationPopover?.propId === propId;

    const handleClick = () => {
      const next = cycleQualitativeValue(flag);
      setValues(prev => ({
        ...prev,
        [propId]: {
          ...prev[propId],
          [rowKey]: { ...prev[propId]?.[rowKey], value: next.value, flag: next.flag }
        }
      }));
    };

    const isSup = flag === 'superior';
    const isInf = flag === 'inferior';
    const baseClass = `inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide border shadow-sm transition-all cursor-pointer select-none active:scale-95`;

    const renderChip = () => {
      if (isSup) return (
        <span
          onClick={handleClick}
          className={`${baseClass} bg-accent-teal-mint-light text-accent-teal-mint border-accent-teal-mint hover:bg-accent-teal-mint-light hover:border-accent-teal-mint`}
          title="Click to change"
        >
          <ArrowUpRight className="w-3 h-3" /> SUP
        </span>
      );
      if (isInf) return (
        <span
          onClick={handleClick}
          className={`${baseClass} bg-accent-red-light text-harken-error border-harken-error/20 hover:bg-accent-red-light hover:border-harken-error`}
          title="Click to change"
        >
          <ArrowDownRight className="w-3 h-3" /> INF
        </span>
      );
      return (
        <span
          onClick={handleClick}
          className={`${baseClass} bg-surface-2 dark:bg-elevation-2 dark:bg-elevation-1 text-slate-500 dark:text-slate-400 border-light-border dark:border-dark-border dark:border-harken-gray hover:bg-surface-3 dark:hover:bg-elevation-subtle hover:border-border-muted dark:hover:border-dark-border-muted`}
          title="Click to change"
        >
          <Minus className="w-3 h-3" /> SIM
        </span>
      );
    };

    return (
      <div className="flex items-center gap-1 group/chip relative">
        {renderChip()}
        
        {/* Explanation Icon Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setActiveExplanationPopover(isExplanationOpen ? null : { rowKey, propId });
          }}
          className={`p-1 rounded transition-all flex-shrink-0 ${
            hasExplanation 
              ? 'text-harken-blue bg-harken-blue/10 hover:bg-harken-blue/20' 
              : 'text-slate-300 hover:text-slate-500 dark:hover:text-slate-300 opacity-0 group-hover/chip:opacity-100'
          }`}
          title={hasExplanation ? 'Edit explanation' : 'Add explanation'}
        >
          <MessageSquare className={`w-3 h-3 ${hasExplanation ? 'fill-current' : ''}`} />
        </button>
        
        {/* Explanation Popover */}
        {isExplanationOpen && (
          <AdjustmentExplanationPopover
            currentExplanation={currentValue?.explanation}
            adjustmentValue={0}
            compName={getPropertyName(propId)}
            rowLabel={rowLabel}
            flag={flag as 'superior' | 'inferior' | 'similar'}
            onSave={(explanation) => saveExplanation(propId, rowKey, explanation)}
            onClear={() => clearExplanation(propId, rowKey)}
            onClose={() => setActiveExplanationPopover(null)}
            position="left"
          />
        )}
      </div>
    );
  };


  // Add Element Button with Dropdown - positioned in the Elements column
  const AddElementButton = ({ sectionId }: { sectionId: GridRowCategory }) => {
    const isOpen = openElementDropdown === sectionId;
    const isAddingCustom = addingCustomToSection === sectionId;
    const availableElements = isAddingCustom ? [] : getAvailableElements(sectionId);

    // Smart positioning logic
    const toggleDropdown = () => {
      if (isOpen) {
        setOpenElementDropdown(null);
        setAddingCustomToSection(null);
      } else {
        // Check available space below
        if (buttonRef.current) {
          const rect = buttonRef.current.getBoundingClientRect();
          const spaceBelow = window.innerHeight - rect.bottom;
          setDropdownPlacement(spaceBelow < 250 ? 'top' : 'bottom');
        }
        setOpenElementDropdown(sectionId);
      }
    };

    return (
      <div className={`element-dropdown relative ${isOpen ? 'z-[500]' : ''}`}>
        <button
          ref={buttonRef}
          onClick={toggleDropdown}
          className="w-full py-2 px-3 border-2 border-dashed border-border-muted dark:border-dark-border-muted rounded-lg flex items-center justify-between gap-2 text-slate-500 dark:text-slate-400 font-semibold hover:border-harken-blue hover:text-harken-blue hover:bg-harken-blue/5 transition-all duration-300 group text-xs bg-surface-1 dark:bg-elevation-1"
        >
          <div className="flex items-center gap-2">
            <Plus size={12} className="text-slate-400 group-hover:text-harken-blue" />
            <span>Add Element</span>
          </div>
          <ChevronDown size={12} className={`text-slate-400 group-hover:text-harken-blue transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className={`absolute left-0 w-72 bg-surface-1 dark:bg-elevation-1 rounded-xl shadow-2xl border border-light-border dark:border-dark-border dark:border-dark-border z-[500] overflow-hidden flex flex-col transition-all duration-200 ${dropdownPlacement === 'top' ? 'bottom-full mb-1' : 'top-full mt-1'
            }`}>
            {isAddingCustom ? (
              <div className="p-3">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">New Custom Element</span>
                  <button
                    onClick={() => setAddingCustomToSection(null)}
                    className="p-1 hover:bg-surface-3 dark:hover:bg-elevation-3 rounded text-slate-400 hover:text-slate-600 dark:hover:text-harken-gray-light"
                  >
                    <X size={14} />
                  </button>
                </div>

                <div className="mb-3">
                  <label className="block text-[10px] font-medium text-slate-500 dark:text-slate-400 mb-1">Element Name</label>
                  <input
                    type="text"
                    value={customElementName}
                    onChange={(e) => setCustomElementName(e.target.value)}
                    placeholder="e.g. Traffic Count"
                    className="w-full px-2 py-1.5 text-xs border border-border-muted dark:border-dark-border-muted rounded-lg focus:ring-2 focus:ring-harken-blue focus:border-transparent bg-surface-1 dark:bg-elevation-1 dark:text-white"
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && handleConfirmCustomElement()}
                  />
                </div>

                <div className="mb-3">
                  <button
                    type="button"
                    onClick={() => setSaveCustomForFuture(!saveCustomForFuture)}
                    className={`group w-full flex items-center justify-between p-3 rounded-xl border transition-all duration-300 ${saveCustomForFuture
                      ? 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-700/50'
                      : 'bg-surface-2 dark:bg-elevation-2 border-light-border dark:border-dark-border dark:bg-elevation-1/50 dark:border-dark-border hover:border-border-muted dark:hover:border-dark-border-muted'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg transition-all duration-300 ${saveCustomForFuture
                        ? 'bg-amber-100 text-amber-500 scale-110 rotate-12 dark:bg-amber-900/40 dark:text-amber-400'
                        : 'bg-surface-1 text-slate-400 dark:bg-elevation-1/50 dark:text-slate-500 group-hover:bg-surface-1 group-hover:text-amber-400 dark:group-hover:bg-slate-900 dark:group-hover:text-amber-500/70'
                        }`}>
                        <Star className={`w-4 h-4 ${saveCustomForFuture ? 'fill-current' : ''}`} />
                      </div>
                      <div className="text-left">
                        <div className={`text-xs font-bold transition-colors ${saveCustomForFuture
                          ? 'text-amber-700 dark:text-amber-400'
                          : 'text-slate-600 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-300'
                          }`}>
                          {saveCustomForFuture ? 'Saved for Future Use' : 'Save for Future Use'}
                        </div>
                        <div className="text-[10px] text-slate-400 dark:text-slate-500">
                          {saveCustomForFuture ? 'Will appear in available elements' : 'Add to your library'}
                        </div>
                      </div>
                    </div>
                  </button>
                </div>

                <button
                  onClick={handleConfirmCustomElement}
                  disabled={!customElementName.trim()}
                  className="w-full py-2 bg-harken-blue text-white rounded-lg text-xs font-bold hover:bg-harken-blue/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                >
                  Add Element
                </button>
              </div>
            ) : (
              <>
                <div className="px-3 py-2 bg-surface-2 dark:bg-elevation-2 dark:bg-elevation-1/50 border-b border-light-border dark:border-dark-border dark:border-dark-border flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Available Elements</span>
                  <div className="flex items-center gap-2">
                    {/* Add Custom Button is now in the header too for quick access */}
                    <button
                      onClick={() => handleStartCustomElement(sectionId)}
                      className="text-[10px] text-harken-blue hover:underline font-medium flex items-center gap-1"
                    >
                      <Plus size={10} /> Custom
                    </button>
                  </div>
                </div>
                <div className="max-h-48 overflow-y-auto custom-scrollbar">
                  {availableElements.length > 0 ? (
                    availableElements.map(element => (
                      <button
                        key={element.key}
                        onClick={() => handleAddElement(sectionId, element)}
                        className="w-full text-left px-3 py-2 text-xs hover:bg-harken-blue/5 dark:hover:bg-harken-blue/10 transition-colors border-b border-light-border dark:border-dark-border dark:border-dark-border last:border-b-0 group"
                      >
                        <div className="font-medium text-slate-700 dark:text-slate-200 group-hover:text-harken-blue">{element.label}</div>
                        {element.description && (
                          <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{element.description}</div>
                        )}
                      </button>
                    ))
                  ) : (
                    <div className="px-3 py-4 text-xs text-slate-400 dark:text-slate-500 italic text-center flex flex-col items-center gap-2">
                      <span>All standard elements added</span>
                      <button
                        onClick={() => handleStartCustomElement(sectionId)}
                        className="text-harken-blue hover:underline"
                      >
                        Create Custom Element
                      </button>
                    </div>
                  )}
                </div>
                <div className="border-t border-light-border dark:border-dark-border dark:border-dark-border bg-surface-2 dark:bg-elevation-2 dark:bg-elevation-1/50">
                  <button
                    onClick={() => handleStartCustomElement(sectionId)}
                    className="w-full text-left px-3 py-2.5 text-xs hover:bg-harken-blue/5 transition-colors flex items-center gap-2 text-harken-blue font-medium"
                  >
                    <PenLine size={12} />
                    Create Custom Element
                  </button>
                </div>
              </>
            )}
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
    const hasExplanation = !!valObj.explanation?.text;
    const isLargeAdjustment = Math.abs(numericValue) >= 0.15; // 15%+
    const needsExplanation = isLargeAdjustment && !hasExplanation;
    const isExplanationOpen = activeExplanationPopover?.rowKey === row.key && activeExplanationPopover?.propId === propId;
    const currentFlag: 'superior' | 'inferior' | 'similar' = numericValue < 0 ? 'superior' : numericValue > 0 ? 'inferior' : 'similar';

    const getStatusLabel = (val: number) => val > 0 ? 'INF' : val < 0 ? 'SUP' : 'SIM';

    return (
      <div className="flex items-center w-full relative group/cell gap-1">
        <AdjustmentBadge
          flag={currentFlag}
          value={numericValue}
          onClick={() => {
            setActivePopover(isOpen ? null : { rowId: row.id, propId, field: 'value' });
            setCustomInputValue('');
          }}
        />
        
        {/* Explanation Icon Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setActiveExplanationPopover(isExplanationOpen ? null : { rowKey: row.key, propId });
          }}
          className={`p-1 rounded transition-all flex-shrink-0 ${
            hasExplanation 
              ? 'text-harken-blue bg-harken-blue/10 hover:bg-harken-blue/20' 
              : needsExplanation
                ? 'text-amber-500 bg-amber-50 dark:bg-amber-900/20 animate-pulse'
                : 'text-slate-300 hover:text-slate-500 dark:hover:text-slate-300 opacity-0 group-hover/cell:opacity-100'
          }`}
          title={hasExplanation ? 'Edit explanation' : needsExplanation ? 'Explanation required (>15% adjustment)' : 'Add explanation'}
        >
          <MessageSquare className={`w-3 h-3 ${hasExplanation ? 'fill-current' : ''}`} />
        </button>
        
        {/* Explanation Popover */}
        {isExplanationOpen && (
          <AdjustmentExplanationPopover
            currentExplanation={valObj.explanation}
            adjustmentValue={numericValue}
            compName={getPropertyName(propId)}
            rowLabel={row.label}
            flag={currentFlag}
            onSave={(explanation) => saveExplanation(propId, row.key, explanation)}
            onClear={() => clearExplanation(propId, row.key)}
            onClose={() => setActiveExplanationPopover(null)}
            position="left"
          />
        )}
        
        {/* Adjustment Value Popover */}
        {isOpen && (
          <div className="adjustment-popover absolute top-full left-0 mt-2 w-48 bg-surface-1 dark:bg-elevation-1 rounded-xl shadow-2xl border border-light-border dark:border-dark-border dark:border-dark-border z-[200] overflow-hidden">
            {/* Mode Toggle Header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-light-border dark:border-dark-border dark:border-dark-border bg-surface-2 dark:bg-elevation-2 dark:bg-elevation-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                Adjustment Mode
              </span>
              <div className="flex gap-1">
                <button
                  type="button"
                  className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${adjustmentMode === 'Percent'
                    ? 'bg-harken-blue text-white shadow-sm'
                    : 'bg-surface-1 dark:bg-elevation-1 text-slate-500 dark:text-slate-200 border border-light-border dark:border-dark-border dark:border-harken-gray hover:bg-surface-2 dark:bg-elevation-2 dark:hover:bg-harken-gray'
                    }`}
                  onClick={() => setAdjustmentMode('Percent')}
                >
                  %
                </button>
                <button
                  type="button"
                  className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${adjustmentMode === 'Dollar'
                    ? 'bg-harken-blue text-white shadow-sm'
                    : 'bg-surface-1 dark:bg-elevation-1 text-slate-500 dark:text-slate-200 border border-light-border dark:border-dark-border dark:border-harken-gray hover:bg-surface-2 dark:bg-elevation-2 dark:hover:bg-harken-gray'
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
                      className={`w-full px-3 py-2 text-left text-sm hover:bg-surface-2 dark:bg-elevation-2 dark:hover:bg-elevation-3/50 flex items-center justify-between transition-colors ${numericValue === option.value ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' : 'text-slate-700 dark:text-slate-200'
                        }`}
                      onClick={() => {
                        updateValue(propId, row.key, option.value, 'value');
                        setActivePopover(null);
                      }}
                    >
                      <span className="font-medium">{option.label}</span>
                      <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${option.value > 0
                        ? 'text-harken-error bg-accent-red-light'
                        : option.value < 0
                          ? 'text-accent-teal-mint bg-accent-teal-mint-light'
                          : 'text-slate-500 dark:text-slate-400 bg-surface-3 dark:bg-elevation-subtle'
                        }`}>
                        {getStatusLabel(option.value)}
                      </span>
                    </button>
                  ))}
                </div>
                {/* Custom Input */}
                <div className="border-t border-light-border dark:border-dark-border dark:border-dark-border px-3 py-2.5 bg-surface-2 dark:bg-elevation-2 dark:bg-elevation-1">
                  <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                    Custom %
                  </label>
                  <div className="flex gap-2 mt-1.5">
                    <input
                      type="text"
                      className="flex-1 border border-light-border dark:border-dark-border dark:border-harken-gray rounded-md px-2 py-1.5 text-sm bg-surface-1 dark:bg-elevation-1 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-harken-blue dark:focus:ring-harken-blue focus:border-transparent"
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
                      className="px-3 py-1.5 bg-harken-blue text-white text-xs font-bold rounded-md hover:bg-harken-blue/90 transition-colors"
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
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  Dollar Adjustment
                </label>
                <input
                  type="text"
                  autoFocus
                  className="w-full border border-light-border dark:border-dark-border dark:border-harken-gray rounded-md px-3 py-2 text-sm bg-surface-1 dark:bg-elevation-1 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-harken-blue focus:border-transparent"
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
                  className="w-full px-3 py-2 bg-harken-blue text-white text-xs font-bold rounded-md hover:bg-harken-blue/90 transition-colors"
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

  // Filter rows based on analysis mode AND grid configuration (property type specific fields)
  const visibleRows = useMemo(() => {
    let filtered = rows.filter(r => r.mode === 'both' || r.mode === analysisMode);
    
    // If we have a grid configuration, filter to show only relevant fields for this property type
    if (activeGridConfig) {
      const physicalFieldDefs = getPhysicalFieldsForGridType(activeGridConfig.gridType);
      const transactionalFieldDefs = getTransactionalFieldsForGridType(activeGridConfig.gridType);
      const physicalFieldIds = new Set(physicalFieldDefs.map(f => f.id));
      const transactionalFieldIds = new Set(transactionalFieldDefs.map(f => f.id));
      const configFieldIds = new Set([
        ...activeGridConfig.transactionalFields,
        ...activeGridConfig.physicalFields,
        ...activeGridConfig.metrics
      ]);
      
      // Core rows that should always be visible regardless of property type
      const coreRowKeys = new Set([
        'date', 'identification', 'address_row', 'price', 'price_sf', 'notes', 
        'overall_comp', 'overall_adj', 'adj_price_sf_val', 'total_value',
        // USPAP-required transactional adjustments
        'property_rights', 'financing_terms', 'conditions_of_sale', 'expenditures_after_sale', 'market_conditions',
        // Common physical factors
        'location', 'highest_best_use', 'year_built', 'effective_age', 'quality_condition', 'site_size_sf', 'building_size_sf',
        // Residual/Improvement Analysis critical fields (must always show when mode is residual)
        'subject_land_add_back', 'land_value', 'land_source', 'residual_value', 'residual_price_sf', 'weighting',
        // Valuation section fields
        'sales_value_sf'
      ]);
      
      filtered = filtered.filter(r => {
        // Always show core rows and calculated fields
        if (coreRowKeys.has(r.key) || r.isCalculated) return true;
        
        // Check if row key matches a field in the grid configuration
        if (configFieldIds.has(r.key)) return true;
        
        // Always show cap rate extraction rows - critical for income approach support
        if (r.category === 'cap_rate_extraction') return true;
        
        // Always show quantitative adjustment rows - critical for paired sales analysis
        if (r.category === 'quantitative') return true;
        
        // Always show qualitative characteristic rows - critical for comparison analysis
        if (r.category === 'qualitative') return true;
        
        // For transaction category, check transactional fields
        if (r.category === 'transaction' && transactionalFieldIds.has(r.key)) return true;
        
        // For physical category, check physical fields
        if (r.category === 'physical' && physicalFieldIds.has(r.key)) return true;
        
        // Default: show rows that don't have a specific field mapping
        // (Custom rows, notes, etc.)
        if (!r.key.includes('_') && r.key.length < 20) return true;
        
        return false;
      });
      
      // Property-type specific field additions
      if (activeGridConfig.gridType === 'industrial') {
        // Industrial-specific fields like sidewall_height, dock_doors will be added via element dropdown
      } else if (activeGridConfig.gridType === 'multi_family') {
        // Multi-family specific fields like unit_count, unit_mix will be added via element dropdown
      }
    }
    
    return filtered;
  }, [rows, analysisMode, activeGridConfig]);

  // Prepare map data from properties
  const subjectProperty = properties.find(p => p.type === 'subject');
  const compProperties = properties.filter(p => p.type === 'comp');

  const hasSubjectCoords = subjectProperty?.lat !== undefined && subjectProperty?.lng !== undefined;
  const comparablesWithCoords = compProperties.filter(p => p.lat !== undefined && p.lng !== undefined);

  // Map collapsed state
  const [isMapCollapsed, setIsMapCollapsed] = useState(false);

  return (
    <div className="flex flex-col h-full bg-surface-2 dark:bg-elevation-2 dark:bg-elevation-1 relative overflow-hidden">

      {/* COMPARABLE MAP SECTION */}
      {hasSubjectCoords && (
        <div className="flex-shrink-0 border-b border-light-border dark:border-dark-border dark:border-dark-border bg-surface-1 dark:bg-elevation-1">
          {/* Map Header - Always visible */}
          <button
            onClick={() => setIsMapCollapsed(!isMapCollapsed)}
            className="w-full flex items-center justify-between px-4 py-2 hover:bg-surface-2 dark:bg-elevation-2 dark:hover:bg-elevation-3 transition-colors"
          >
            <div className="flex items-center gap-2">
              <MapIcon className="w-4 h-4 text-harken-blue" />
              <span className="font-semibold text-sm text-slate-700 dark:text-slate-200">Improved Sales Map</span>
              <span className="text-xs text-slate-400">
                ({comparablesWithCoords.length} of {compProperties.length} comp{compProperties.length !== 1 ? 's' : ''} mapped)
              </span>
            </div>
            {isMapCollapsed ? (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {/* Map Content - Collapsible */}
          {!isMapCollapsed && (
            <div className="px-4 pb-4">
              <ComparableMapPreview
                subject={{
                  lat: subjectProperty!.lat!,
                  lng: subjectProperty!.lng!,
                  address: subjectProperty?.address,
                  propertyName: subjectProperty?.name,
                }}
                comparables={comparablesWithCoords.map((comp, index) => ({
                  id: comp.id,
                  lat: comp.lat!,
                  lng: comp.lng!,
                  label: comp.name || `Comp ${index + 1}`,
                  address: comp.address,
                  details: comp.salePrice
                    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(comp.salePrice)
                    : undefined,
                }))}
                type="improved-sales"
                height={280}
              />
            </div>
          )}
        </div>
      )}

      {/* SCROLLABLE AREA - Contains grid and reconciliation */}
      {/* SCROLLABLE AREA - Contains grid and reconciliation */}
      <div ref={scrollContainerRef} className="sales-grid-scroll-container flex-1 overflow-auto custom-scrollbar relative bg-surface-1 dark:bg-elevation-1" style={{ isolation: 'isolate' }}>
        {/* Horizontal Scroll Indicator - logic kept for zone scrolling, visual hidden */}
        <HorizontalScrollIndicator scrollContainerRef={scrollContainerRef} stickyTop={120} rightOffset={ACTION_COL_WIDTH} hideIndicator={true} />

        {/* Flex container for grid + action column */}
        <div
          className="flex"
          style={{ minWidth: `${totalGridWidth + ACTION_COL_WIDTH}px` }}
        >
          {/* GRID CONTAINER */}
          <div
            className="grid relative bg-surface-1 dark:bg-elevation-1 flex-shrink-0"
            style={{
              gridTemplateColumns: `${LABEL_COL_WIDTH}px ${SUBJECT_COL_WIDTH}px repeat(${properties.length - 1}, ${COMP_COL_WIDTH}px)`,
              minWidth: `${totalGridWidth}px`,
            }}
          >

            {/* Header Row - Sticky to top with solid backgrounds */}
            <div
              className="sticky top-0 left-0 z-[120] border-b border-light-border dark:border-dark-border dark:border-dark-border flex items-end bg-surface-1 dark:bg-elevation-1"
              style={{
                width: LABEL_COL_WIDTH,
                height: 120,
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
                className={`sticky top-0 overflow-hidden flex flex-col bg-surface-1 dark:bg-elevation-1 ${prop.type === 'subject'
                  ? 'z-[110] border-b-2 border-harken-blue shadow-[4px_0_16px_rgba(0,0,0,0.08)] dark:shadow-none'
                  : 'z-[100] border-b border-light-border dark:border-dark-border dark:border-dark-border'
                  }`}
                style={{
                  height: 120,
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
                    className={`col-span-full relative z-[50] mt-4 border-y ${hasResidualRows ? 'border-purple-300 dark:border-purple-800' : 'border-light-border dark:border-dark-border dark:border-dark-border'
                      } ${hasResidualRows ? 'bg-purple-50 dark:bg-purple-900/20' : 'bg-surface-2 dark:bg-elevation-2 dark:bg-elevation-1'}`}
                  >
                    <div
                      className={`sticky left-0 w-fit px-4 py-2 font-bold text-xs uppercase tracking-widest flex items-center gap-2 ${hasResidualRows
                        ? 'text-slate-700 dark:text-slate-200'
                        : 'text-slate-700 dark:text-slate-200'
                        } ${hasResidualRows ? 'bg-purple-50 dark:bg-purple-900/10' : 'bg-surface-2 dark:bg-elevation-2 dark:bg-elevation-1'}`}
                      style={{ zIndex: 51 }}
                    >
                      {section.title}
                      {canDeleteSection && (
                        <button
                          onClick={() => handleSectionDeleteClick(section.id, section.title)}
                          className="ml-2 p-1 rounded hover:bg-accent-red-light text-slate-400 hover:text-harken-error transition-colors"
                          title={`Remove ${section.title} section`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Section Rows */}
                  {visibleRows.filter(r => r.category === section.id).map((row, rowIndex) => {
                    const isResidualRow = row.mode === 'residual';
                    const isEvenRow = rowIndex % 2 === 0;
                    
                    // Zebra stripe backgrounds for better row tracking
                    const zebraLight = isEvenRow ? 'bg-white dark:bg-elevation-1' : 'bg-slate-50/50 dark:bg-elevation-2/30';
                    const zebraResidual = isEvenRow ? 'bg-purple-50 dark:bg-purple-900/10' : 'bg-purple-100/50 dark:bg-purple-900/20';
                    
                    return (
                      <React.Fragment key={row.id}>
                        {/* Label Column - Sticky Left, never scrolls horizontally */}
                        <div
                          className={`sticky left-0 z-[60] border-r border-b border-light-border dark:border-dark-border dark:border-dark-border/50 flex items-center justify-between px-2 py-1.5 group ${row.key === 'total_value'
                            ? 'border-t-2 border-t-slate-800 dark:border-t-slate-600 bg-surface-2 dark:bg-elevation-2 dark:bg-elevation-1'
                            : isResidualRow
                              ? `border-purple-200 dark:border-purple-800 ${zebraResidual}`
                              : zebraLight
                            }`}
                          style={{
                            width: LABEL_COL_WIDTH,
                            transform: 'translateZ(0)',
                            backgroundColor: 'inherit'
                          }}
                        >
                          <span className={`text-xs truncate ${row.key === 'total_value'
                            ? 'font-black text-slate-900 dark:text-white uppercase'
                            : isResidualRow
                              ? 'font-semibold text-slate-700 dark:text-slate-200'
                              : 'font-medium text-slate-600 dark:text-slate-400'
                            }`}>{row.label}</span>
                          <button
                            onClick={() => removeRow(row.id)}
                            className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-accent-red-light text-slate-300 hover:text-harken-error transition-all"
                            title={`Remove ${row.label}`}
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Data Cells */}
                        {
                          properties.map(prop => {
                            const isNotesRow = row.key === 'notes';
                            const noteValue = values[prop.id]?.[row.key]?.value;
                            const noteText = typeof noteValue === 'string' ? stripHtml(noteValue) : '';
                            const hasNotes = noteText.trim() !== '' &&
                              !noteText.toLowerCase().includes('click to');

                            // Determine background color based on row type, property type, and zebra striping
                            const bgClass = (() => {
                              if (row.key === 'total_value') return 'bg-surface-2 dark:bg-elevation-2';
                              
                              // Subject column - subtle teal/cyan tint, still with zebra
                              if (prop.type === 'subject') {
                                if (isResidualRow) {
                                  return isEvenRow 
                                    ? 'bg-purple-50 dark:bg-purple-950/40' 
                                    : 'bg-purple-100/60 dark:bg-purple-900/30';
                                }
                                return isEvenRow 
                                  ? 'bg-cyan-50/50 dark:bg-cyan-950/20' 
                                  : 'bg-cyan-100/40 dark:bg-cyan-900/15';
                              }
                              
                              // Residual/improvement analysis rows
                              if (isResidualRow) {
                                return isEvenRow 
                                  ? 'bg-purple-50 dark:bg-purple-900/10' 
                                  : 'bg-purple-100/50 dark:bg-purple-900/20';
                              }
                              
                              // Standard rows with zebra striping
                              return isEvenRow 
                                ? 'bg-white dark:bg-elevation-1' 
                                : 'bg-slate-50/50 dark:bg-elevation-2/30';
                            })();

                            return (
                              <div
                                key={`${row.id}-${prop.id}`}
                                className={`border-r border-b border-light-border dark:border-dark-border dark:border-dark-border/50 p-2 flex items-center text-xs ${prop.type === 'subject'
                                  ? 'z-[55] shadow-[4px_0_16px_rgba(0,0,0,0.05)] dark:shadow-none'
                                  : 'relative z-[1]'
                                  } ${row.key === 'total_value'
                                    ? 'border-t-2 border-t-slate-800 dark:border-t-slate-600 font-bold'
                                    : isResidualRow
                                      ? 'border-purple-200 dark:border-purple-800'
                                      : ''
                                  } ${bgClass} ${isNotesRow ? 'cursor-pointer hover:bg-surface-2 dark:bg-elevation-2 dark:hover:bg-elevation-3/50 transition-colors' : ''}`}
                                style={prop.type === 'subject'
                                  ? {
                                    left: LABEL_COL_WIDTH,
                                    width: SUBJECT_COL_WIDTH,
                                    position: 'sticky' as const,
                                    transform: 'translateZ(0)',
                                    backgroundColor: 'inherit'
                                  }
                                  : {}
                                }
                                onClick={isNotesRow ? () => openNotesEditor(prop.id, getPropertyName(prop.id), row.key) : undefined}
                              >
                                {isNotesRow ? (
                                  <div className="flex items-center gap-1.5 w-full">
                                    <MessageSquare className={`w-3 h-3 flex-shrink-0 ${hasNotes ? 'text-harken-blue' : 'text-slate-300 dark:text-slate-500'}`} />
                                    <span className={`truncate ${hasNotes ? 'text-slate-700 dark:text-slate-200' : 'text-slate-400 dark:text-slate-500 italic'}`}>
                                      {hasNotes
                                        ? (noteText.length > 30 ? noteText.substring(0, 30) + '...' : noteText)
                                        : 'Click to add notes'}
                                    </span>
                                  </div>
                                ) : section.id === 'quantitative' && prop.type !== 'subject'
                                  ? renderQuantitativeCell(prop.id, row, values[prop.id]?.[row.key] || { value: 0 })
                                  : section.id === 'qualitative' && prop.type !== 'subject'
                                    ? <QualitativeChip propId={prop.id} rowKey={row.key} rowLabel={row.label} />
                                    : (() => {
                                      // Get display value considering overrides
                                      const displayData = getDisplayValue(prop.id, row.key, row);
                                      const { value: displayValue, isOverridden, override, calculatedValue } = displayData;

                                      // Check if this field can be overridden
                                      const canOverride = row.isCalculated && 
                                        OVERRIDABLE_CALCULATED_FIELDS.includes(row.key) && 
                                        prop.type !== 'subject' &&
                                        calculatedValue !== null;
                                      
                                      const isOverridePopoverOpen = activeOverridePopover?.rowKey === row.key && 
                                        activeOverridePopover?.propId === prop.id;

                                      // Special styling for auto-calculated cap rate (not overridden)
                                      const isAutoCalcCapRate = row.key === 'extracted_cap_rate' && !isOverridden && calculatedValue !== null;
                                      
                                      // Check if this is the subject land add-back linked from Land Valuation
                                      const isLinkedLandValue = row.key === 'subject_land_add_back' && 
                                        prop.type === 'subject' && 
                                        landValuationData?.concludedLandValue &&
                                        values[prop.id]?.[row.key]?.value === landValuationData.concludedLandValue;

                                      return (
                                        <div className="relative flex items-center gap-1.5 w-full">
                                          <span className={`${row.key === 'total_value'
                                            ? 'font-bold text-accent-teal-mint'
                                            : isOverridden
                                              ? 'font-semibold text-amber-700 dark:text-amber-400'
                                              : isResidualRow
                                                ? 'font-semibold text-slate-700 dark:text-slate-200'
                                                : isAutoCalcCapRate || isLinkedLandValue
                                                  ? 'font-semibold text-harken-blue'
                                                  : 'font-medium'
                                            }`}>
                                            {formatValue(displayValue, row.format)}
                                          </span>
                                          
                                          {/* Override badge - shown when value is overridden */}
                                          {isOverridden && override && (
                                            <OverrideBadge 
                                              override={override}
                                              onClick={() => setActiveOverridePopover({ rowKey: row.key, propId: prop.id })}
                                            />
                                          )}
                                          
                                          {/* Auto-calc indicator for non-overridden calculated fields */}
                                          {isAutoCalcCapRate && !isOverridden && (
                                            <span className="text-[9px] text-slate-400 font-normal" title="Auto-calculated from NOI ÷ Sale Price">
                                              (auto)
                                            </span>
                                          )}
                                          
                                          {/* Calculator icon for overridable fields (hover to show) */}
                                          {canOverride && !isOverridden && (
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setActiveOverridePopover({ rowKey: row.key, propId: prop.id });
                                              }}
                                              className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-amber-100 dark:hover:bg-amber-900/30 text-slate-300 hover:text-amber-600 transition-all ml-auto"
                                              title={`Override calculated ${row.label}`}
                                            >
                                              <Calculator className="w-3 h-3" />
                                            </button>
                                          )}
                                          
                                          {isLinkedLandValue && (
                                            <span 
                                              className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-accent-teal-mint-light dark:bg-accent-teal-mint-light text-accent-teal-mint dark:text-accent-teal-mint rounded text-[9px] font-medium border border-accent-teal-mint dark:border-accent-teal-mint" 
                                              title="Linked from Land Valuation concluded value"
                                            >
                                              <Link2 className="w-2.5 h-2.5" />
                                              Land Val
                                            </span>
                                          )}
                                          
                                          {/* Override Popover */}
                                          {isOverridePopoverOpen && (
                                            <OverridePopover
                                              calculatedValue={calculatedValue}
                                              currentOverride={override}
                                              fieldLabel={row.label}
                                              format={getOverrideFormat(row.format)}
                                              onApply={(newOverride) => applyOverride(prop.id, row.key, newOverride)}
                                              onClear={() => clearOverride(prop.id, row.key)}
                                              onClose={() => setActiveOverridePopover(null)}
                                              position="left"
                                            />
                                          )}
                                        </div>
                                      );
                                    })()
                                }
                              </div>
                            );
                          })
                        }
                      </React.Fragment>
                    );
                  })}

                  {/* Add Element Button Row for this section */}
                  <div
                    className={`sticky left-0 p-2 bg-surface-1 dark:bg-elevation-1 border-r border-light-border dark:border-dark-border dark:border-dark-border/50 ${openElementDropdown === section.id ? 'z-[500]' : 'z-[60]'}`}
                    style={{ width: LABEL_COL_WIDTH }}
                  >
                    <AddElementButton sectionId={section.id as GridRowCategory} />
                  </div>
                  <div
                    className="sticky left-[160px] z-[55] shadow-[4px_0_16px_rgba(0,0,0,0.05)] dark:shadow-none bg-surface-1 dark:bg-elevation-1 border-r border-light-border dark:border-dark-border dark:border-dark-border/50"
                    style={{ width: SUBJECT_COL_WIDTH }}
                  ></div>
                  {properties.filter(p => p.type !== 'subject').map(prop => (
                    <div key={`add-element-${section.id}-${prop.id}`} className="bg-surface-1 dark:bg-elevation-1 border-r border-light-border dark:border-dark-border dark:border-dark-border/50"></div>
                  ))}
                </React.Fragment>
              );
            })}
          </div>

          {/* ACTION COLUMN */}
          <div
            className="flex-shrink-0 bg-surface-2 dark:bg-elevation-2 dark:bg-elevation-1 flex flex-col items-center justify-start py-8 sticky top-0 self-start"
            style={{ width: ACTION_COL_WIDTH, height: 'auto', minHeight: 400 }}
          >
            <div className="flex flex-col items-center justify-center h-80 py-4">
              {/* Add Comps */}
              <button
                className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-surface-1 dark:hover:bg-elevation-3 transition-colors group"
                title="Add a new comp manually"
              >
                <div className="w-12 h-12 rounded-full bg-harken-blue/20 flex items-center justify-center group-hover:bg-harken-blue/30 transition-colors">
                  <Plus className="w-6 h-6 text-harken-blue" />
                </div>
                <span className="text-xs font-semibold text-harken-blue">Add Comps</span>
              </button>
            </div>
          </div>
        </div>

        {/* RECONCILIATION SECTION - Stays centered, doesn't scroll horizontally */}
        <div
          className="sticky left-0 bg-surface-2 dark:bg-elevation-2 dark:bg-elevation-1 border-t-2 border-border-muted dark:border-dark-border-muted p-8 pt-10"
          style={{ width: '100vw', maxWidth: '100%' }}
        >
          <div className="max-w-4xl mx-auto flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <div className="w-2 h-8 bg-accent-teal-mint rounded-full"></div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white uppercase tracking-wider">Value Reconciliation & Narrative</h2>
            </div>

            {/* Dual Metric Display - Shows both $/SF and $/Unit for multi-family */}
            {showDualMetrics && (
              <div className="grid grid-cols-2 gap-4">
                <div className={`p-4 rounded-xl border-2 ${subjectData?.primaryValueDriver === 'price_per_sf' && !isSfUnknown ? 'bg-harken-blue/5 border-harken-blue' : 'bg-surface-2 dark:bg-elevation-2 dark:bg-elevation-1 border-light-border dark:border-dark-border dark:border-dark-border'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-slate-600 dark:text-slate-200">$/SF Building</span>
                    {subjectData?.primaryValueDriver === 'price_per_sf' && !isSfUnknown && (
                      <span className="px-2 py-0.5 bg-harken-blue text-white text-[10px] font-bold rounded">PRIMARY</span>
                    )}
                    {isSfUnknown && (
                      <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px] font-medium rounded">SF Unknown</span>
                    )}
                  </div>
                  <div className={`text-2xl font-bold ${subjectData?.primaryValueDriver === 'price_per_sf' && !isSfUnknown ? 'text-harken-blue' : 'text-slate-800 dark:text-white'}`}>
                    {isSfUnknown ? '—' : (concludedValuePsf ? `$${concludedValuePsf.toLocaleString()}` : '-')}
                  </div>
                </div>
                <div className={`p-4 rounded-xl border-2 ${subjectData?.primaryValueDriver === 'price_per_unit' ? 'bg-harken-blue/5 border-harken-blue' : 'bg-surface-2 dark:bg-elevation-2 dark:bg-elevation-1 border-light-border dark:border-dark-border dark:border-dark-border'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-slate-600 dark:text-slate-200">$/Unit</span>
                    {subjectData?.primaryValueDriver === 'price_per_unit' && (
                      <span className="px-2 py-0.5 bg-harken-blue text-white text-[10px] font-bold rounded">PRIMARY</span>
                    )}
                  </div>
                  <div className={`text-2xl font-bold ${subjectData?.primaryValueDriver === 'price_per_unit' ? 'text-harken-blue' : 'text-slate-800 dark:text-white'}`}>
                    {concludedValuePerUnit ? `$${concludedValuePerUnit.toLocaleString()}` : '-'}
                  </div>
                </div>
              </div>
            )}

            {/* Concluded Value Summary */}
            <div className="p-5 bg-accent-teal-mint-light dark:bg-accent-teal-mint-light rounded-xl border border-accent-teal-mint dark:border-accent-teal-mint">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-accent-teal-mint dark:text-accent-teal-mint">Concluded Value Indication</span>
                <div className="text-right">
                  <div className="text-2xl font-bold text-accent-teal-mint dark:text-accent-teal-mint">
                    {concludedValue ? `$${concludedValue.toLocaleString()}` : 'Pending'}
                  </div>
                  {!showDualMetrics && concludedValuePsf && (
                    <div className="text-sm text-accent-teal-mint dark:text-accent-teal-mint">
                      ${concludedValuePsf.toLocaleString()} / SF
                    </div>
                  )}
                </div>
              </div>
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
      {
        notesEditor?.isOpen && (
          <NotesEditorModal
            isOpen={notesEditor.isOpen}
            title={notesEditor.propName}
            content={notesContent}
            onClose={closeNotesEditor}
            onSave={saveNotes}
            onInput={handleEditorInput}
            applyFormatting={applyFormatting}
          />
        )
      }

      {/* SECTION DELETE CONFIRMATION MODAL */}
      {
        confirmDelete?.isOpen && (
          <div className="fixed inset-0 z-[1100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div
              className="bg-surface-1 dark:bg-elevation-1 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Warning Header */}
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-surface-1/20 rounded-full flex items-center justify-center">
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
                  Are you sure you want to remove the <span className="font-semibold text-slate-800 dark:text-white">"{confirmDelete.sectionTitle}"</span> section?
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
              <div className="px-6 py-4 bg-surface-2 dark:bg-elevation-2 dark:bg-elevation-1 border-t border-light-border dark:border-dark-border dark:border-dark-border flex items-center justify-end gap-3">
                <button
                  onClick={cancelSectionDelete}
                  className="px-5 py-2.5 rounded-lg text-sm font-semibold text-slate-600 dark:text-slate-200 hover:bg-surface-4 dark:hover:bg-elevation-muted transition-colors"
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
        )
      }
    </div >
  );
};
