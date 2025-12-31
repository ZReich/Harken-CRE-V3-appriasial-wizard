/**
 * useCostSegReportState Hook
 * 
 * Manages the state for the Cost Segregation report editor,
 * including section visibility, edited fields, and auto-save functionality.
 */

import { useState, useCallback, useMemo } from 'react';
import type { CostSegAnalysis } from '../../../types';

export interface ReportSection {
  id: string;
  title: string;
  description: string;
  isVisible: boolean;
  isRequired: boolean;
  order: number;
}

export interface ReportEditableField {
  id: string;
  sectionId: string;
  label: string;
  value: string;
  defaultValue: string;
  isEdited: boolean;
}

export interface CostSegReportSettings {
  firmName: string;
  preparerName: string;
  preparerCredentials: string;
  showWatermark: boolean;
  includeDetailedSchedule: boolean;
  scheduleMaxYears: number;
}

export interface UseCostSegReportStateReturn {
  sections: ReportSection[];
  toggleSection: (sectionId: string) => void;
  reorderSection: (sectionId: string, newOrder: number) => void;
  
  editableFields: ReportEditableField[];
  updateField: (fieldId: string, value: string) => void;
  resetField: (fieldId: string) => void;
  resetAllFields: () => void;
  
  settings: CostSegReportSettings;
  updateSettings: (updates: Partial<CostSegReportSettings>) => void;
  
  visibleSections: ReportSection[];
  hasChanges: boolean;
  isDirty: boolean;
}

const DEFAULT_SECTIONS: Omit<ReportSection, 'isVisible'>[] = [
  { id: 'cover', title: 'Cover Page', description: 'Title page with property info and key metrics', isRequired: true, order: 0 },
  { id: 'summary', title: 'Executive Summary', description: 'Overview of findings and tax benefits', isRequired: true, order: 1 },
  { id: 'methodology', title: 'Methodology', description: 'IRS compliance and study approach', isRequired: true, order: 2 },
  { id: 'components', title: 'Component Detail', description: 'Detailed listing of all components', isRequired: false, order: 3 },
  { id: 'schedule', title: 'Depreciation Schedule', description: 'Year-by-year depreciation projection', isRequired: false, order: 4 },
  { id: 'systems', title: 'Building Systems', description: 'TD 9636 building systems breakdown', isRequired: false, order: 5 },
  { id: 'disclaimer', title: 'Disclaimer', description: 'Limiting conditions and certification', isRequired: true, order: 6 },
];

const DEFAULT_SETTINGS: CostSegReportSettings = {
  firmName: 'Harken Appraisal Services',
  preparerName: '',
  preparerCredentials: '',
  showWatermark: false,
  includeDetailedSchedule: true,
  scheduleMaxYears: 15,
};

/**
 * Hook to manage Cost Segregation report editor state.
 */
export function useCostSegReportState(
  analysis: CostSegAnalysis | null
): UseCostSegReportStateReturn {
  // Section visibility state
  const [sections, setSections] = useState<ReportSection[]>(() =>
    DEFAULT_SECTIONS.map(s => ({ ...s, isVisible: true }))
  );

  // Editable fields state
  const [editableFields, setEditableFields] = useState<ReportEditableField[]>(() => {
    if (!analysis) return [];
    
    return [
      {
        id: 'propertyName',
        sectionId: 'cover',
        label: 'Property Name',
        value: analysis.propertyName || 'Subject Property',
        defaultValue: analysis.propertyName || 'Subject Property',
        isEdited: false,
      },
      {
        id: 'propertyAddress',
        sectionId: 'cover',
        label: 'Property Address',
        value: analysis.propertyAddress || '',
        defaultValue: analysis.propertyAddress || '',
        isEdited: false,
      },
      {
        id: 'methodologyDescription',
        sectionId: 'methodology',
        label: 'Methodology Description',
        value: analysis.methodologyDescription || '',
        defaultValue: analysis.methodologyDescription || '',
        isEdited: false,
      },
    ];
  });

  // Settings state
  const [settings, setSettings] = useState<CostSegReportSettings>(DEFAULT_SETTINGS);

  // Toggle section visibility
  const toggleSection = useCallback((sectionId: string) => {
    setSections(prev => prev.map(s => 
      s.id === sectionId && !s.isRequired
        ? { ...s, isVisible: !s.isVisible }
        : s
    ));
  }, []);

  // Reorder section
  const reorderSection = useCallback((sectionId: string, newOrder: number) => {
    setSections(prev => {
      const sorted = [...prev].sort((a, b) => a.order - b.order);
      const sectionIndex = sorted.findIndex(s => s.id === sectionId);
      if (sectionIndex === -1) return prev;

      const section = sorted[sectionIndex];
      sorted.splice(sectionIndex, 1);
      sorted.splice(newOrder, 0, section);

      return sorted.map((s, idx) => ({ ...s, order: idx }));
    });
  }, []);

  // Update editable field
  const updateField = useCallback((fieldId: string, value: string) => {
    setEditableFields(prev => prev.map(f =>
      f.id === fieldId
        ? { ...f, value, isEdited: value !== f.defaultValue }
        : f
    ));
  }, []);

  // Reset field to default
  const resetField = useCallback((fieldId: string) => {
    setEditableFields(prev => prev.map(f =>
      f.id === fieldId
        ? { ...f, value: f.defaultValue, isEdited: false }
        : f
    ));
  }, []);

  // Reset all fields
  const resetAllFields = useCallback(() => {
    setEditableFields(prev => prev.map(f => ({
      ...f,
      value: f.defaultValue,
      isEdited: false,
    })));
  }, []);

  // Update settings
  const updateSettings = useCallback((updates: Partial<CostSegReportSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  }, []);

  // Compute visible sections (sorted by order)
  const visibleSections = useMemo(() => 
    sections
      .filter(s => s.isVisible)
      .sort((a, b) => a.order - b.order),
    [sections]
  );

  // Check if any fields have been edited
  const hasChanges = useMemo(() =>
    editableFields.some(f => f.isEdited),
    [editableFields]
  );

  // Check if state is "dirty" (any changes from defaults)
  const isDirty = useMemo(() => {
    const sectionsChanged = sections.some((s, idx) => 
      !s.isVisible || s.order !== idx
    );
    const settingsChanged = JSON.stringify(settings) !== JSON.stringify(DEFAULT_SETTINGS);
    return hasChanges || sectionsChanged || settingsChanged;
  }, [sections, settings, hasChanges]);

  return {
    sections,
    toggleSection,
    reorderSection,
    editableFields,
    updateField,
    resetField,
    resetAllFields,
    settings,
    updateSettings,
    visibleSections,
    hasChanges,
    isDirty,
  };
}

export default useCostSegReportState;
