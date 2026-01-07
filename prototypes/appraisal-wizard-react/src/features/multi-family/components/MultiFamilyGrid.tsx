import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Plus, Trash2, ArrowUpRight, ArrowDownRight, Minus, MapPin, Activity, ChevronDown, PenLine, Home, Building2, Grid3X3 } from 'lucide-react';
import { MultiFamilyComp, MultiFamilyGridRow, AvailableMultiFamilyElement } from '../types';
import { 
  MOCK_MF_COMPS, 
  SUBJECT_MF_PROPERTY, 
  TRANSACTION_ROWS,
  QUANTITATIVE_ROWS,
  QUALITATIVE_ROWS,
  formatCurrency, 
  formatPercent,
  LABEL_COL_WIDTH,
  SUBJECT_COL_WIDTH,
  COMP_COL_WIDTH,
  ACTION_COL_WIDTH,
} from '../constants';
import { HorizontalScrollIndicator } from '../../../components/HorizontalScrollIndicator';
import EnhancedTextArea from '../../../components/EnhancedTextArea';
import { useWizard } from '../../../context/WizardContext';
import { getAvailableElements as filterElements, normalizeSection } from '../../../utils/elementFilter';
import type { SectionType } from '../../../constants/elementRegistry';
import type { MultiFamilyCalculationMethod } from '../../../types';

interface MultiFamilyGridProps {
  scenarioId?: number;
}

export const MultiFamilyGrid: React.FC<MultiFamilyGridProps> = ({ scenarioId }) => {
  const { setApproachConclusion, setSubjectData, state: wizardState } = useWizard();
  const { propertyType, propertySubtype, scenarios, activeScenarioId, subjectData } = wizardState;
  const currentScenario = scenarios.find(s => s.id === activeScenarioId)?.name;
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // Use subject data from context if available, otherwise fallback to mock
  const subjectProperty = useMemo(() => {
    if (subjectData?.address?.street) {
      return {
        address: subjectData.address.street,
        cityState: `${subjectData.address.city || ''}, ${subjectData.address.state || ''} ${subjectData.address.zip || ''}`.trim(),
        imageUrl: SUBJECT_MF_PROPERTY.imageUrl, // Keep placeholder image
        propertyType: subjectData.gridConfiguration?.gridType === 'multi_family' ? 'Multi-Family' : 'Office / Professional',
        bedBath: subjectData.unitMix && subjectData.unitMix.length > 0 
          ? `${subjectData.unitMix.find(u => u.count > 0)?.bedrooms || 2} BR / ${subjectData.unitMix.find(u => u.count > 0)?.bathrooms || 1} BA`
          : SUBJECT_MF_PROPERTY.bedBath,
        includedUtilities: SUBJECT_MF_PROPERTY.includedUtilities, // Could be added to subjectData later
        currentRentPerMonth: subjectData.unitMix?.find(u => u.avgRent)?.avgRent || SUBJECT_MF_PROPERTY.currentRentPerMonth,
        unitCount: subjectData.totalUnitCount || SUBJECT_MF_PROPERTY.unitCount,
        yearBuilt: SUBJECT_MF_PROPERTY.yearBuilt, // Could be derived from improvements
        condition: SUBJECT_MF_PROPERTY.condition,
        parking: SUBJECT_MF_PROPERTY.parking,
      };
    }
    return SUBJECT_MF_PROPERTY;
  }, [subjectData]);
  
  const [comps, setComps] = useState<MultiFamilyComp[]>(MOCK_MF_COMPS);
  const [transactionRows, setTransactionRows] = useState(TRANSACTION_ROWS);
  const [quantitativeRows, setQuantitativeRows] = useState(QUANTITATIVE_ROWS);
  const [qualitativeRows, setQualitativeRows] = useState(QUALITATIVE_ROWS);
  const [activePopover, setActivePopover] = useState<{rowId: string, compId: string} | null>(null);
  const [openElementDropdown, setOpenElementDropdown] = useState<'transaction' | 'quantitative' | 'qualitative' | null>(null);
  const [notesText, setNotesText] = useState('');
  const [adjustmentMode, setAdjustmentMode] = useState<'Percent' | 'Dollar'>('Percent');
  const [customInputValue, setCustomInputValue] = useState<string>('');
  
  // Calculation method for display units - reads from subject data or defaults to per_unit
  const [calculationMethod, setCalculationMethodLocal] = useState<MultiFamilyCalculationMethod>(
    subjectData?.calculationMethod || 'per_unit'
  );
  
  // Sync calculation method when subjectData changes (external updates)
  useEffect(() => {
    if (subjectData?.calculationMethod && subjectData.calculationMethod !== calculationMethod) {
      setCalculationMethodLocal(subjectData.calculationMethod);
    }
  }, [subjectData?.calculationMethod]);
  
  // Handler that syncs to both local state AND WizardContext
  const handleCalculationMethodChange = (method: MultiFamilyCalculationMethod) => {
    setCalculationMethodLocal(method);
    setSubjectData({ calculationMethod: method });
  };
  
  // Get display label based on calculation method
  const getUnitLabel = (): string => {
    switch (calculationMethod) {
      case 'per_room': return '$/Room';
      case 'per_sf': return '$/SF';
      case 'per_pad': return '$/Pad';
      case 'per_hole': return '$/Hole';
      case 'per_unit':
      default: return '$/Unit';
    }
  };
  
  // Get count field name based on calculation method
  const getCountFieldLabel = (): string => {
    switch (calculationMethod) {
      case 'per_room': return 'Room Count';
      case 'per_pad': return 'Pad Count';
      case 'per_hole': return 'Hole Count';
      case 'per_sf': return 'Building SF';
      case 'per_unit':
      default: return 'Unit Count';
    }
  };

  // Calculate total grid width
  const totalGridWidth = LABEL_COL_WIDTH + SUBJECT_COL_WIDTH + (comps.length * COMP_COL_WIDTH) + ACTION_COL_WIDTH;

  // Calculate average adjusted rental rate
  const averageAdjustedRate = comps.length > 0
    ? comps.reduce((acc, c) => {
        const totalAdj = (c.parkingAdj + c.qualityConditionAdj + c.yearBuiltAdj) / 100;
        return acc + c.rentalRatePerMonth * (1 + totalAdj);
      }, 0) / comps.length
    : 0;

  // Sync to reconciliation
  useEffect(() => {
    if (scenarioId !== undefined && averageAdjustedRate > 0) {
      setApproachConclusion(scenarioId, 'Multi-Family Approach', Math.round(averageAdjustedRate));
    }
  }, [scenarioId, averageAdjustedRate, setApproachConclusion]);

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
    if (window.confirm('Are you sure you want to remove this rental comparable?')) {
      setComps(prev => prev.filter(c => c.id !== compId));
    }
  };

  const handleUpdateComp = (compId: string, field: keyof MultiFamilyComp, value: any) => {
    setComps(prev => prev.map(c => 
      c.id === compId ? { ...c, [field]: value } : c
    ));
  };

  const handleAddElement = (section: 'transaction' | 'quantitative' | 'qualitative', element: AvailableMultiFamilyElement) => {
    const newRow: MultiFamilyGridRow = { 
      id: element.id, 
      label: element.label + ':', 
      section: section, 
      removable: true 
    };
    
    if (section === 'transaction') {
      if (transactionRows.some(r => r.id === element.id)) return;
      setTransactionRows(prev => [...prev, newRow]);
    } else if (section === 'quantitative') {
      if (quantitativeRows.some(r => r.id === element.id)) return;
      setQuantitativeRows(prev => [...prev, newRow]);
    } else {
      if (qualitativeRows.some(r => r.id === element.id)) return;
      setQualitativeRows(prev => [...prev, newRow]);
    }
    setOpenElementDropdown(null);
  };

  const handleAddCustomElement = (section: 'transaction' | 'quantitative' | 'qualitative') => {
    const name = prompt('Enter element name:');
    if (!name) return;
    const newId = name.toLowerCase().replace(/\s+/g, '_') + '_custom';
    const newRow: MultiFamilyGridRow = { 
      id: newId, 
      label: name + ':', 
      section: section, 
      removable: true 
    };
    
    if (section === 'transaction') {
      setTransactionRows(prev => [...prev, newRow]);
    } else if (section === 'quantitative') {
      setQuantitativeRows(prev => [...prev, newRow]);
    } else {
      setQualitativeRows(prev => [...prev, newRow]);
    }
    setOpenElementDropdown(null);
  };

  // Get available elements for a section using dynamic filtering
  const getAvailableElements = (section: 'transaction' | 'quantitative' | 'qualitative') => {
    const existingIds = section === 'transaction' 
      ? transactionRows.map(r => r.id)
      : section === 'quantitative'
        ? quantitativeRows.map(r => r.id)
        : qualitativeRows.map(r => r.id);
    
    // Normalize section for registry lookup
    const normalizedSection = normalizeSection(section) as SectionType;
    
    // Filter elements based on current context - default to multifamily for this grid
    const filteredElements = filterElements({
      section: normalizedSection,
      propertyType: propertyType || 'commercial',
      subtype: propertySubtype || 'multifamily',
      approach: 'multi_family',
      scenario: currentScenario,
      excludeKeys: existingIds
    });
    
    // Map to the format expected by this grid
    const mappedElements: AvailableMultiFamilyElement[] = filteredElements.map(el => ({
      id: el.key,
      label: el.label,
      description: el.description,
      section: section  // Add the section from the function parameter
    }));
    
    return mappedElements;
  };

  const handleDeleteRow = (rowId: string, section: 'transaction' | 'quantitative' | 'qualitative') => {
    if (section === 'transaction') {
      setTransactionRows(prev => prev.filter(r => r.id !== rowId));
    } else if (section === 'quantitative') {
      setQuantitativeRows(prev => prev.filter(r => r.id !== rowId));
    } else {
      setQualitativeRows(prev => prev.filter(r => r.id !== rowId));
    }
  };

  const getTransactionValue = (comp: MultiFamilyComp, rowId: string) => {
    switch (rowId) {
      case 'location': return comp.address;
      case 'propertyType': return comp.propertyType;
      case 'bedBath': return comp.bedBath;
      case 'includedUtilities': return comp.includedUtilities;
      case 'rentalRate': return formatCurrency(comp.rentalRatePerMonth);
      default: return '-';
    }
  };

  const getSubjectTransactionValue = (rowId: string) => {
    switch (rowId) {
      case 'location': return `${subjectProperty.address}, ${subjectProperty.cityState}`;
      case 'propertyType': return subjectProperty.propertyType;
      case 'bedBath': return subjectProperty.bedBath;
      case 'includedUtilities': return subjectProperty.includedUtilities;
      case 'rentalRate': return subjectProperty.currentRentPerMonth ? formatCurrency(subjectProperty.currentRentPerMonth) : 'TBD';
      default: return '-';
    }
  };

  const getSubjectQualitativeValue = (rowId: string) => {
    switch (rowId) {
      case 'locationQual': return subjectProperty.cityState;
      case 'bedBathQual': return subjectProperty.bedBath;
      case 'utilitiesQual': return subjectProperty.includedUtilities;
      case 'parkingQual': return subjectProperty.parking || '-';
      case 'yearBuiltQual': return subjectProperty.yearBuilt?.toString() || '-';
      case 'conditionQual': return subjectProperty.condition || '-';
      default: return '-';
    }
  };

  const cycleQualitativeValue = (currentValue: string): 'Similar' | 'Superior' | 'Inferior' => {
    const cycle: ('Similar' | 'Superior' | 'Inferior')[] = ['Similar', 'Superior', 'Inferior'];
    const currentIndex = cycle.indexOf(currentValue as any);
    return cycle[(currentIndex + 1) % cycle.length];
  };

  // Adjustment Chip Component
  const AdjustmentChip = ({ compId, rowId }: { compId: string, rowId: string }) => {
    const comp = comps.find(c => c.id === compId);
    const currentValue = comp?.[rowId as keyof MultiFamilyComp] as string || 'Similar';
    
    const handleClick = () => {
      const nextValue = cycleQualitativeValue(currentValue);
      handleUpdateComp(compId, rowId as keyof MultiFamilyComp, nextValue);
    };

    const isSup = currentValue === 'Superior';
    const isInf = currentValue === 'Inferior';
    const baseClass = `inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide border shadow-sm transition-all cursor-pointer select-none active:scale-95`;
    
    if (isSup) return (
      <span onClick={handleClick} className={`${baseClass} bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300`} title="Click to change">
        <ArrowUpRight className="w-3 h-3" /> SUP
      </span>
    );
    if (isInf) return (
      <span onClick={handleClick} className={`${baseClass} bg-red-50 text-red-700 border-red-200 hover:bg-red-100 hover:border-red-300`} title="Click to change">
        <ArrowDownRight className="w-3 h-3" /> INF
      </span>
    );
    return (
      <span onClick={handleClick} className={`${baseClass} bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600 hover:border-slate-300 dark:hover:border-slate-500`} title="Click to change">
        <Minus className="w-3 h-3" /> SIM
      </span>
    );
  };

  // Overall Chip Component
  const OverallChip = ({ comp }: { comp: MultiFamilyComp }) => {
    const currentValue = comp.overallComparability;
    
    const handleClick = () => {
      const nextValue = cycleQualitativeValue(currentValue);
      handleUpdateComp(comp.id, 'overallComparability', nextValue);
    };

    const isSup = currentValue === 'Superior';
    const isInf = currentValue === 'Inferior';
    const baseClass = `inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide border-2 shadow-sm transition-all cursor-pointer select-none active:scale-95`;
    
    if (isSup) return (
      <span onClick={handleClick} className={`${baseClass} bg-emerald-500 text-white border-emerald-400 hover:bg-emerald-600`} title="Click to change">
        <ArrowUpRight className="w-3.5 h-3.5" /> Superior
      </span>
    );
    if (isInf) return (
      <span onClick={handleClick} className={`${baseClass} bg-red-500 text-white border-red-400 hover:bg-red-600`} title="Click to change">
        <ArrowDownRight className="w-3.5 h-3.5" /> Inferior
      </span>
    );
    return (
      <span onClick={handleClick} className={`${baseClass} bg-white/20 text-white border-white/40 hover:bg-white/30`} title="Click to change">
        <Minus className="w-3.5 h-3.5" /> Similar
      </span>
    );
  };

  // Add Element Button
  const AddElementButton = ({ section }: { section: 'transaction' | 'quantitative' | 'qualitative' }) => {
    const isOpen = openElementDropdown === section;
    const availableElements = getAvailableElements(section);
    
    return (
      <div className={`element-dropdown relative ${isOpen ? 'z-[500]' : ''}`}>
        <button 
          onClick={() => setOpenElementDropdown(isOpen ? null : section)}
          className="w-full py-2 px-3 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg flex items-center justify-between gap-2 text-slate-500 dark:text-slate-400 font-semibold hover:border-accent-cyan hover:text-accent-cyan hover:bg-accent-cyan/5 transition-all duration-300 group text-xs bg-white dark:bg-slate-800"
        >
          <div className="flex items-center gap-2">
            <Plus size={12} className="text-slate-400 group-hover:text-accent-cyan" />
            <span>Add Element</span>
          </div>
          <ChevronDown size={12} className={`text-slate-400 group-hover:text-accent-cyan transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {isOpen && (
          <div className="absolute top-full left-0 mt-1 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 z-[500] overflow-hidden">
            <div className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Available Elements</span>
            </div>
            <div className="max-h-48 overflow-y-auto">
              {availableElements.length > 0 ? (
                availableElements.map(element => (
                  <button
                    key={element.id}
                    onClick={() => handleAddElement(section, element)}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-accent-cyan/5 dark:hover:bg-accent-cyan/10 transition-colors border-b border-slate-100 dark:border-slate-700 last:border-b-0 group"
                  >
                    <div className="font-medium text-slate-700 dark:text-slate-300 group-hover:text-accent-cyan">{element.label}</div>
                    {element.description && (
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{element.description}</div>
                    )}
                  </button>
                ))
              ) : (
                <div className="px-3 py-3 text-xs text-slate-400 dark:text-slate-500 italic text-center">
                  All elements have been added
                </div>
              )}
            </div>
            <div className="border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={() => handleAddCustomElement(section)}
                className="w-full text-left px-3 py-2.5 text-xs hover:bg-accent-cyan/5 dark:hover:bg-accent-cyan/10 transition-colors flex items-center gap-2 text-accent-cyan font-medium"
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

  // Preset percent options for quantitative adjustments
  const percentOptions = [
    { value: 20, label: '+20%' },
    { value: 17.5, label: '+17.5%' },
    { value: 15, label: '+15%' },
    { value: 12.5, label: '+12.5%' },
    { value: 10, label: '+10%' },
    { value: 7.5, label: '+7.5%' },
    { value: 5, label: '+5%' },
    { value: 2.5, label: '+2.5%' },
    { value: 0, label: '0%' },
    { value: -2.5, label: '-2.5%' },
    { value: -5, label: '-5%' },
    { value: -7.5, label: '-7.5%' },
    { value: -10, label: '-10%' },
    { value: -12.5, label: '-12.5%' },
    { value: -15, label: '-15%' },
    { value: -17.5, label: '-17.5%' },
    { value: -20, label: '-20%' },
  ];

  // Update a comp's adjustment value
  const updateCompAdjustment = (compId: string, field: string, value: number) => {
    setComps(prev => prev.map(c => 
      c.id === compId ? { ...c, [field]: value } : c
    ));
  };

  // Quantitative adjustment cell with popover
  const renderQuantitativeCell = (comp: MultiFamilyComp, rowId: string) => {
    const value = comp[rowId as keyof MultiFamilyComp] as number || 0;
    const isOpen = activePopover?.rowId === rowId && activePopover?.compId === comp.id;
    
    const getStatusLabel = (val: number) => val > 0 ? 'INF' : val < 0 ? 'SUP' : 'SIM';

    // Adjustment badge component inline
    const isSup = value < 0;
    const isInf = value > 0;
    const baseClass = `inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide border shadow-sm transition-all cursor-pointer`;

    return (
      <div className="flex items-center w-full relative">
        <span 
          onClick={() => {
            setActivePopover(isOpen ? null : { rowId, compId: comp.id });
            setCustomInputValue('');
          }}
          className={`${baseClass} ${
            isSup ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' :
            isInf ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100' :
            'bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600'
          }`}
        >
          {isSup && <ArrowUpRight className="w-3 h-3" />}
          {isInf && <ArrowDownRight className="w-3 h-3" />}
          {!isSup && !isInf && <Minus className="w-3 h-3" />}
          {isSup ? 'SUP' : isInf ? 'INF' : 'SIM'}
          {value !== 0 && <span className="ml-1 border-l border-current pl-1 opacity-70">{Math.abs(value).toFixed(1)}%</span>}
        </span>
        
        {isOpen && (
          <div className="adjustment-popover absolute top-full left-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 z-[200] overflow-hidden">
            {/* Mode Toggle Header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                Adjustment
              </span>
              <div className="flex gap-1">
                <button
                  type="button"
                  className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${adjustmentMode === 'Percent'
                    ? 'bg-accent-cyan text-white shadow-sm'
                    : 'bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600'
                  }`}
                  onClick={() => setAdjustmentMode('Percent')}
                >
                  %
                </button>
              </div>
            </div>

            {/* Scrollable Percent Options */}
            <div className="max-h-48 overflow-y-auto">
              {percentOptions.map((option) => (
                <button
                  type="button"
                  key={option.value}
                  className={`w-full px-3 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center justify-between transition-colors ${
                    value === option.value ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' : 'text-slate-700 dark:text-slate-200'
                  }`}
                  onClick={() => {
                    updateCompAdjustment(comp.id, rowId, option.value);
                    setActivePopover(null);
                  }}
                >
                  <span className="font-medium">{option.label}</span>
                  <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                    option.value > 0 ? 'text-red-600 bg-red-50 dark:bg-red-900/30' :
                    option.value < 0 ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30' :
                    'text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700'
                  }`}>
                    {getStatusLabel(option.value)}
                  </span>
                </button>
              ))}
            </div>
            
            {/* Custom Input */}
            <div className="border-t border-slate-100 dark:border-slate-700 px-3 py-2.5 bg-slate-50 dark:bg-slate-900">
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                Custom %
              </label>
              <div className="flex gap-2 mt-1.5">
                <input
                  type="text"
                  className="flex-1 border border-slate-200 dark:border-slate-600 rounded-md px-2 py-1.5 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-cyan focus:border-transparent"
                  value={customInputValue}
                  placeholder="e.g. 12.5"
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9.-]/g, '');
                    setCustomInputValue(val);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const parsed = parseFloat(customInputValue);
                      if (!isNaN(parsed)) {
                        updateCompAdjustment(comp.id, rowId, parsed);
                        setActivePopover(null);
                      }
                    }
                  }}
                />
                <button
                  type="button"
                  className="px-3 py-1.5 bg-accent-cyan text-white text-xs font-bold rounded-md hover:bg-accent-cyan/90 transition-colors"
                  onClick={() => {
                    const parsed = parseFloat(customInputValue);
                    if (!isNaN(parsed)) {
                      updateCompAdjustment(comp.id, rowId, parsed);
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
          </div>
        )}
      </div>
    );
  };

  // Calculate adjusted rate for a comp
  const getAdjustedRate = (comp: MultiFamilyComp): number => {
    const totalAdj = (comp.parkingAdj + comp.qualityConditionAdj + comp.yearBuiltAdj) / 100;
    return comp.rentalRatePerMonth * (1 + totalAdj);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 relative overflow-hidden">
      
      {/* CALCULATION METHOD TOGGLE */}
      <div className="flex-shrink-0 px-4 py-3 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Display Unit:</span>
            <div className="flex gap-1 bg-slate-100 dark:bg-slate-700 p-1 rounded-lg">
              {[
                { value: 'per_unit' as MultiFamilyCalculationMethod, label: 'Per Unit', icon: Home },
                { value: 'per_room' as MultiFamilyCalculationMethod, label: 'Per Room', icon: Building2 },
                { value: 'per_sf' as MultiFamilyCalculationMethod, label: 'Per SF', icon: Grid3X3 },
              ].map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => handleCalculationMethodChange(value)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    calculationMethod === value
                      ? 'bg-harken-blue text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </button>
              ))}
            </div>
          </div>
          
          {/* Subject Unit/Room Count Display */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 dark:text-slate-400">{getCountFieldLabel()}:</span>
              <span className="font-bold text-harken-blue">{subjectProperty.unitCount || subjectData?.totalUnitCount || '—'}</span>
            </div>
            {subjectData?.unitMix && subjectData.unitMix.length > 0 && calculationMethod === 'per_unit' && (
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span>Mix:</span>
                {subjectData.unitMix.filter(u => u.count > 0).map(u => (
                  <span key={u.unitType} className="bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                    {u.count}x {u.unitType === 'studio' ? 'Studio' : `${u.bedrooms}BR`}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* SCROLLABLE AREA */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-auto custom-scrollbar relative bg-white dark:bg-slate-900" 
        style={{ isolation: 'isolate' }}
      >
        {/* Horizontal Scroll Indicator - hidden but keeps scroll functionality */}
        <HorizontalScrollIndicator scrollContainerRef={scrollContainerRef} stickyTop={120} rightOffset={ACTION_COL_WIDTH} hideIndicator={true} />
        
        {/* Flex container for grid + action column */}
        <div 
          className="flex"
          style={{ minWidth: `${totalGridWidth}px` }}
        >
          {/* GRID CONTAINER */}
          <div 
            className="grid relative bg-white dark:bg-slate-900 flex-shrink-0" 
            style={{ 
              gridTemplateColumns: `${LABEL_COL_WIDTH}px ${SUBJECT_COL_WIDTH}px repeat(${comps.length}, ${COMP_COL_WIDTH}px)`, 
              minWidth: `${LABEL_COL_WIDTH + SUBJECT_COL_WIDTH + (comps.length * COMP_COL_WIDTH)}px`,
            }}
          >
          
          {/* ========== HEADER ROW ========== */}
          <div 
            className="sticky top-0 left-0 z-[120] bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 flex items-end" 
            style={{ width: LABEL_COL_WIDTH, height: 120, transform: 'translateZ(0)', willChange: 'transform' }}
          >
            <div className="p-2 pl-3">
              <div className="font-bold text-slate-400 text-xs uppercase tracking-wider">Element</div>
            </div>
          </div>
          
          {/* Subject Header */}
          <div 
            className="sticky top-0 left-[160px] z-[110] border-b-2 border-accent-cyan shadow-[4px_0_16px_rgba(0,0,0,0.08)] dark:shadow-none flex flex-col bg-white dark:bg-slate-900"
            style={{ width: SUBJECT_COL_WIDTH, height: 120, transform: 'translateZ(0)', willChange: 'transform' }}
          >
            <div className="relative h-16 w-full overflow-hidden group">
              <img src={subjectProperty.imageUrl} alt="Subject Property" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute top-1.5 left-1.5 bg-accent-cyan text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                SUBJECT
              </div>
            </div>
            <div className="p-2 flex-1 flex flex-col gap-0.5 bg-sky-50 dark:bg-[#0f1f3a] border-r border-slate-200 dark:border-slate-700">
              <h3 className="font-bold text-slate-800 dark:text-white text-xs leading-tight line-clamp-1" title={subjectProperty.address}>
                {subjectProperty.address}
              </h3>
              <div className="flex items-start gap-1 text-[10px] text-slate-500 dark:text-slate-400">
                <MapPin className="w-3 h-3 flex-shrink-0 mt-0.5 text-accent-cyan" />
                <span className="line-clamp-1 leading-tight">{subjectProperty.cityState}</span>
              </div>
            </div>
          </div>
          
          {/* Comp Headers */}
          {comps.map((comp, idx) => (
            <div 
              key={comp.id} 
              className="sticky top-0 z-[100] border-b border-slate-200 dark:border-slate-700 flex flex-col bg-white dark:bg-slate-900"
              style={{ height: 120, transform: 'translateZ(0)', willChange: 'transform' }}
            >
              <div className="relative h-16 w-full overflow-hidden group">
                <img src={comp.imageUrl} alt={comp.address} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute top-1.5 right-1.5 bg-slate-900 text-white text-[10px] font-medium px-1.5 py-0.5 rounded shadow-sm">
                  {formatCurrency(comp.rentalRatePerMonth)}/mo
                </div>
                <button
                  onClick={() => handleDeleteComp(comp.id)}
                  className="absolute top-1.5 left-1.5 p-1 rounded bg-white/80 dark:bg-slate-800/80 hover:bg-red-100 dark:hover:bg-red-900/30 text-slate-400 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                  title="Remove this rental"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
              <div className="p-2 flex-1 flex flex-col gap-0.5 border-r border-slate-200 dark:border-slate-700">
                <h3 className="font-bold text-slate-800 dark:text-white text-xs leading-tight line-clamp-1" title={comp.address}>
                  Rental {idx + 1}
                </h3>
                <div className="flex items-start gap-1 text-[10px] text-slate-500 dark:text-slate-400">
                  <MapPin className="w-3 h-3 flex-shrink-0 mt-0.5 text-accent-cyan" />
                  <span className="line-clamp-1 leading-tight">{comp.cityStateZip}</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-auto">
                  <Activity className="w-3 h-3 text-emerald-500" />
                  <span>{comp.bedBath}</span>
                </div>
              </div>
            </div>
          ))}

          {/* ========== TRANSACTION DATA SECTION ========== */}
          <div className="col-span-full relative z-[50] mt-4 border-y border-slate-200 dark:border-slate-700">
            <div className="absolute left-0 right-0 h-full bg-slate-100 dark:bg-slate-800" style={{ opacity: 0.3 }}></div>
            <div className="sticky left-0 w-fit px-4 py-2 font-bold text-xs uppercase tracking-widest text-slate-700 dark:text-slate-300 flex items-center gap-2 bg-slate-50 dark:bg-slate-900" style={{ zIndex: 51 }}>
              TRANSACTION DATA
            </div>
          </div>

          {transactionRows.map(row => (
            <React.Fragment key={row.id}>
              <div className="sticky left-0 z-[60] border-r border-b border-slate-100 dark:border-slate-700 flex items-center justify-between px-2 py-1.5 group bg-white dark:bg-slate-900" style={{ width: LABEL_COL_WIDTH, transform: 'translateZ(0)' }}>
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400 truncate">{row.label}</span>
                {row.removable && (
                  <button onClick={() => handleDeleteRow(row.id, 'transaction')} className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-slate-300 hover:text-red-500 transition-all">
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
              <div className="sticky left-[160px] z-[55] border-r border-b border-slate-100 dark:border-slate-700 p-2 flex items-center justify-center text-xs shadow-[4px_0_16px_rgba(0,0,0,0.05)] dark:shadow-none bg-sky-50 dark:bg-[#0f1f3a]" style={{ width: SUBJECT_COL_WIDTH, transform: 'translateZ(0)' }}>
                <span className="font-medium text-slate-700 dark:text-slate-200">{getSubjectTransactionValue(row.id)}</span>
              </div>
              {comps.map(comp => (
                <div key={`${row.id}-${comp.id}`} className="border-r border-b border-slate-100 dark:border-slate-700 p-2 flex items-center justify-center text-xs bg-white dark:bg-slate-800">
                  <span className="font-medium text-slate-600 dark:text-slate-300">{getTransactionValue(comp, row.id)}</span>
                </div>
              ))}
            </React.Fragment>
          ))}

          {/* Add Element - Transaction */}
          <div className={`sticky left-0 p-2 bg-white dark:bg-slate-900 ${openElementDropdown === 'transaction' ? 'z-[500]' : 'z-[60]'}`} style={{ width: LABEL_COL_WIDTH }}>
            <AddElementButton section="transaction" />
          </div>
          <div className="sticky left-[160px] z-[55] shadow-[4px_0_16px_rgba(0,0,0,0.05)] bg-white dark:bg-slate-900" style={{ width: SUBJECT_COL_WIDTH }}></div>
          {comps.map(comp => <div key={`add-trans-${comp.id}`} className="bg-white dark:bg-slate-800"></div>)}

          {/* ========== QUANTITATIVE ADJUSTMENTS SECTION ========== */}
          <div className="col-span-full relative z-[50] mt-4 border-y border-blue-200 dark:border-blue-800">
            <div className="absolute left-0 right-0 h-full bg-blue-50 dark:bg-blue-900/20" style={{ opacity: 0.3 }}></div>
            <div className="sticky left-0 w-fit px-4 py-2 font-bold text-xs uppercase tracking-widest text-blue-700 dark:text-blue-300 flex items-center gap-2 bg-blue-50 dark:bg-slate-900" style={{ zIndex: 51 }}>
              QUANTITATIVE ADJUSTMENTS
            </div>
          </div>

          {quantitativeRows.map(row => (
            <React.Fragment key={row.id}>
              <div className="sticky left-0 z-[60] border-r border-b border-slate-100 dark:border-slate-700 flex items-center justify-between px-2 py-1.5 group bg-white dark:bg-slate-900" style={{ width: LABEL_COL_WIDTH, transform: 'translateZ(0)' }}>
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400 truncate">{row.label}</span>
                {row.removable && (
                  <button onClick={() => handleDeleteRow(row.id, 'quantitative')} className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-slate-300 hover:text-red-500 transition-all">
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
              <div className="sticky left-[160px] z-[55] border-r border-b border-slate-100 dark:border-slate-700 p-2 flex items-center justify-center text-xs shadow-[4px_0_16px_rgba(0,0,0,0.05)] dark:shadow-none bg-sky-50 dark:bg-[#0f1f3a]" style={{ width: SUBJECT_COL_WIDTH, transform: 'translateZ(0)' }}>
                <span className="font-medium text-slate-700 dark:text-slate-200">-</span>
              </div>
              {comps.map(comp => (
                <div key={`${row.id}-${comp.id}`} className="border-r border-b border-slate-100 dark:border-slate-700 p-2 flex items-center justify-center text-xs bg-white dark:bg-slate-800">
                  {renderQuantitativeCell(comp, row.field || row.id)}
                </div>
              ))}
            </React.Fragment>
          ))}

          {/* Add Element - Quantitative */}
          <div className={`sticky left-0 p-2 bg-white dark:bg-slate-900 ${openElementDropdown === 'quantitative' ? 'z-[500]' : 'z-[60]'}`} style={{ width: LABEL_COL_WIDTH }}>
            <AddElementButton section="quantitative" />
          </div>
          <div className="sticky left-[160px] z-[55] shadow-[4px_0_16px_rgba(0,0,0,0.05)] bg-sky-50 dark:bg-[#0f1f3a]" style={{ width: SUBJECT_COL_WIDTH }}></div>
          {comps.map(comp => <div key={`add-quant-${comp.id}`} className="bg-white dark:bg-slate-800"></div>)}

          {/* ========== QUALITATIVE ADJUSTMENTS SECTION ========== */}
          <div className="col-span-full relative z-[50] mt-4 border-y border-emerald-200 dark:border-emerald-800">
            <div className="absolute left-0 right-0 h-full bg-emerald-50 dark:bg-emerald-900/20" style={{ opacity: 0.3 }}></div>
            <div className="sticky left-0 w-fit px-4 py-2 font-bold text-xs uppercase tracking-widest text-emerald-700 dark:text-emerald-300 flex items-center gap-2 bg-emerald-50 dark:bg-slate-900" style={{ zIndex: 51 }}>
              QUALITATIVE ADJUSTMENTS
            </div>
          </div>

          {qualitativeRows.map(row => (
            <React.Fragment key={row.id}>
              <div className="sticky left-0 z-[60] border-r border-b border-slate-100 dark:border-slate-700 flex items-center justify-between px-2 py-1.5 group bg-white dark:bg-slate-900" style={{ width: LABEL_COL_WIDTH, transform: 'translateZ(0)' }}>
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400 truncate">{row.label}</span>
                {row.removable && (
                  <button onClick={() => handleDeleteRow(row.id, 'qualitative')} className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-slate-300 hover:text-red-500 transition-all">
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
              <div className="sticky left-[160px] z-[55] border-r border-b border-slate-100 dark:border-slate-700 p-2 flex items-center justify-center text-xs shadow-[4px_0_16px_rgba(0,0,0,0.05)] dark:shadow-none bg-sky-50 dark:bg-[#0f1f3a]" style={{ width: SUBJECT_COL_WIDTH, transform: 'translateZ(0)' }}>
                <span className="font-medium text-slate-700 dark:text-slate-200">{getSubjectQualitativeValue(row.id)}</span>
              </div>
              {comps.map(comp => (
                <div key={`${row.id}-${comp.id}`} className="border-r border-b border-slate-100 dark:border-slate-700 p-2 flex items-center justify-center text-xs bg-white dark:bg-slate-800">
                  <AdjustmentChip compId={comp.id} rowId={row.field || row.id} />
                </div>
              ))}
            </React.Fragment>
          ))}

          {/* Add Element - Qualitative */}
          <div className={`sticky left-0 p-2 bg-white dark:bg-slate-900 ${openElementDropdown === 'qualitative' ? 'z-[500]' : 'z-[60]'}`} style={{ width: LABEL_COL_WIDTH }}>
            <AddElementButton section="qualitative" />
          </div>
          <div className="sticky left-[160px] z-[55] shadow-[4px_0_16px_rgba(0,0,0,0.05)] bg-white dark:bg-slate-900" style={{ width: SUBJECT_COL_WIDTH }}></div>
          {comps.map(comp => <div key={`add-qual-${comp.id}`} className="bg-white dark:bg-slate-800"></div>)}

          {/* ========== SUMMARY SECTION ========== */}
          <div className="col-span-full relative z-[50] mt-4 border-y border-slate-300 dark:border-slate-600">
            <div className="absolute left-0 right-0 h-full bg-slate-100 dark:bg-slate-800" style={{ opacity: 0.3 }}></div>
            <div className="sticky left-0 w-fit px-4 py-2 font-bold text-xs uppercase tracking-widest text-slate-700 dark:text-slate-300 flex items-center gap-2 bg-slate-50 dark:bg-slate-900" style={{ zIndex: 51 }}>
              SUMMARY
            </div>
          </div>

          {/* Overall Adjustment Row */}
          <React.Fragment>
            <div className="sticky left-0 z-[60] border-r border-b border-slate-100 dark:border-slate-700 flex items-center px-2 py-1.5 bg-white dark:bg-slate-900" style={{ width: LABEL_COL_WIDTH, transform: 'translateZ(0)' }}>
              <span className="text-xs font-semibold text-slate-800 dark:text-white italic">Overall Adjustment:</span>
            </div>
            <div className="sticky left-[160px] z-[55] border-r border-b border-slate-100 dark:border-slate-700 p-2 flex items-center justify-center text-xs shadow-[4px_0_16px_rgba(0,0,0,0.05)] dark:shadow-none bg-sky-50 dark:bg-[#0f1f3a]" style={{ width: SUBJECT_COL_WIDTH, transform: 'translateZ(0)' }}>
              <span className="font-medium text-slate-700 dark:text-slate-200">-</span>
            </div>
            {comps.map(comp => {
              const totalAdj = comp.parkingAdj + comp.qualityConditionAdj + comp.yearBuiltAdj;
              return (
                <div key={`overall-adj-${comp.id}`} className="border-r border-b border-slate-100 dark:border-slate-700 p-2 flex items-center justify-center text-xs bg-white dark:bg-slate-800">
                  <span className={`font-bold ${totalAdj !== 0 ? (totalAdj > 0 ? 'text-red-600' : 'text-emerald-600') : 'text-slate-500 dark:text-slate-400'}`}>
                    {formatPercent(totalAdj)}
                  </span>
                </div>
              );
            })}
          </React.Fragment>

          {/* Adjusted Rental Rates Row */}
          <React.Fragment>
            <div className="sticky left-0 z-[60] border-r border-b border-slate-100 dark:border-slate-700 flex items-center px-2 py-1.5 bg-white dark:bg-slate-900" style={{ width: LABEL_COL_WIDTH, transform: 'translateZ(0)' }}>
              <span className="text-xs font-semibold text-slate-800 dark:text-white">Adjusted Rental Rates $...</span>
            </div>
            <div className="sticky left-[160px] z-[55] border-r border-b border-slate-100 dark:border-slate-700 p-2 flex items-center justify-center text-xs shadow-[4px_0_16px_rgba(0,0,0,0.05)] dark:shadow-none bg-sky-50 dark:bg-[#0f1f3a]" style={{ width: SUBJECT_COL_WIDTH, transform: 'translateZ(0)' }}>
              <span className="font-medium text-slate-700 dark:text-slate-200">-</span>
            </div>
            {comps.map(comp => (
              <div key={`adj-rate-${comp.id}`} className="border-r border-b border-slate-100 dark:border-slate-700 p-2 flex items-center justify-center text-xs bg-white dark:bg-slate-800">
                <span className="font-bold text-emerald-700 dark:text-emerald-400">{formatCurrency(getAdjustedRate(comp))}</span>
              </div>
            ))}
          </React.Fragment>

          {/* Adjusted Comp Range Row */}
          <React.Fragment>
            <div className="sticky left-0 z-[60] border-r border-b border-slate-100 dark:border-slate-700 border-t-2 border-t-slate-800 dark:border-t-slate-600 flex items-center px-2 py-1.5 bg-slate-100 dark:bg-slate-800" style={{ width: LABEL_COL_WIDTH, transform: 'translateZ(0)' }}>
              <span className="text-xs font-black text-slate-900 dark:text-white uppercase">Adjusted Comp Range:</span>
            </div>
            <div className="sticky left-[160px] z-[55] border-r border-b border-slate-100 dark:border-slate-700 border-t-2 border-t-slate-800 dark:border-t-slate-600 p-2 flex items-center justify-center text-xs shadow-[4px_0_16px_rgba(0,0,0,0.05)] dark:shadow-none bg-blue-100 dark:bg-blue-900/30" style={{ width: SUBJECT_COL_WIDTH, transform: 'translateZ(0)' }}>
              <span className="font-bold text-slate-800 dark:text-white">
                {comps.length > 0 ? `${formatCurrency(Math.min(...comps.map(c => getAdjustedRate(c))))} - ${formatCurrency(Math.max(...comps.map(c => getAdjustedRate(c))))}` : '-'}
              </span>
            </div>
            {comps.map(comp => (
              <div key={`range-${comp.id}`} className="border-r border-b border-slate-100 dark:border-slate-700 border-t-2 border-t-slate-800 dark:border-t-slate-600 p-2 flex items-center justify-center text-xs bg-slate-100 dark:bg-slate-800"></div>
            ))}
          </React.Fragment>

          {/* ========== OVERALL COMPARABILITY FOOTER ========== */}
          <div className="col-span-full relative z-[50] mt-4"></div>
          
          <div className="sticky left-0 z-[60] bg-accent-cyan border-b border-accent-cyan p-3 flex items-center" style={{ width: LABEL_COL_WIDTH, transform: 'translateZ(0)' }}>
            <span className="text-xs font-bold text-white uppercase tracking-wide">Overall Comparability</span>
          </div>
          <div className="sticky left-[160px] z-[55] bg-accent-cyan border-b border-accent-cyan p-3 flex items-center justify-center shadow-[4px_0_16px_rgba(0,0,0,0.15)]" style={{ width: SUBJECT_COL_WIDTH, transform: 'translateZ(0)' }}>
            <span className="text-xs font-bold text-white">N/A</span>
          </div>
          {comps.map(comp => (
            <div key={`overall-${comp.id}`} className="bg-accent-cyan border-b border-accent-cyan p-2 flex items-center justify-center">
              <OverallChip comp={comp} />
            </div>
          ))}

          </div>

          {/* ACTION COLUMN */}
          <div className="flex-shrink-0 bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-start py-8 sticky top-0 self-start" style={{ width: ACTION_COL_WIDTH, height: 'auto', minHeight: 400 }}>
            <div className="flex flex-col items-center justify-center h-80 py-4">
              <button className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-white dark:hover:bg-slate-800 transition-colors group" title="Add a new comp">
                <div className="w-12 h-12 rounded-full bg-accent-cyan/20 dark:bg-accent-cyan/10 flex items-center justify-center group-hover:bg-accent-cyan/30 dark:group-hover:bg-accent-cyan/20 transition-colors">
                  <Plus className="w-6 h-6 text-accent-cyan" />
                </div>
                <span className="text-xs font-semibold text-accent-cyan">Add Comps</span>
              </button>
            </div>
          </div>
        </div>

        {/* RENTAL INDICATION FOOTER - Stays centered, doesn't scroll horizontally */}
        <div 
          className="sticky left-0 bg-slate-50 dark:bg-slate-900 border-t-2 border-slate-300 dark:border-slate-700 p-8 pt-10"
          style={{ width: '100vw', maxWidth: '100%' }}
        >
          <div className="max-w-4xl mx-auto flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <div className="w-2 h-8 bg-accent-cyan rounded-full"></div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white uppercase tracking-wider">Multi-Family Rental Indication</h2>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-2">Subject Unit Count</div>
                  <div className="text-2xl font-bold text-slate-800 dark:text-white">{subjectProperty.unitCount || '-'} Units</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-2">Indicated Market Rent</div>
                  <div className="text-2xl font-bold text-accent-cyan">
                    {formatCurrency(averageAdjustedRate)}/mo
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-2">Adjusted Comp Range</div>
                  <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    {comps.length > 0 ? `${formatCurrency(Math.min(...comps.map(c => getAdjustedRate(c))))} - ${formatCurrency(Math.max(...comps.map(c => getAdjustedRate(c))))}` : '-'}
                  </div>
                </div>
              </div>
            </div>

            {/* Notes Section with AI Draft */}
            <div className="mt-6">
              <EnhancedTextArea
                label="Notes"
                value={notesText}
                onChange={setNotesText}
                placeholder="Type your analysis and assumptions here..."
                sectionContext="multi_family"
                helperText="AI can draft a multi-family rental analysis based on your comparable data."
                minHeight={250}
                rows={8}
              />
            </div>
            
            <div className="h-8"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

