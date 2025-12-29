/**
 * useCostSegReportState Hook
 * 
 * Manages the state of the Cost Seg report editor including:
 * - Section visibility toggles
 * - Custom narrative content
 * - Edit tracking
 * - Auto-save to localStorage
 * - Undo/redo support
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import type { CostSegAnalysis, CostSegReportState } from '../types';
import { COST_SEG_REPORT_SECTIONS } from '../constants';

const STORAGE_KEY = 'harken_cost_seg_report_draft';

interface UseCostSegReportStateReturn {
  /** Current report state */
  reportState: CostSegReportState;
  
  /** Whether there are unsaved changes */
  isDirty: boolean;
  
  /** Toggle section visibility */
  toggleSection: (sectionId: string) => void;
  
  /** Update custom narrative for a section */
  updateNarrative: (sectionId: string, content: string) => void;
  
  /** Reset a section to defaults */
  resetSection: (sectionId: string) => void;
  
  /** Save the current state */
  save: () => void;
  
  /** Load saved state from localStorage */
  load: () => void;
  
  /** Clear all saved state */
  clear: () => void;
  
  /** Get section visibility */
  isSectionVisible: (sectionId: string) => boolean;
  
  /** Get sections in order */
  orderedSections: typeof COST_SEG_REPORT_SECTIONS;
  
  /** Last saved timestamp */
  lastSavedAt: string | null;
}

/**
 * Create initial report state from analysis
 */
function createInitialState(analysis: CostSegAnalysis): CostSegReportState {
  const sectionVisibility: Record<string, boolean> = {};
  
  for (const section of COST_SEG_REPORT_SECTIONS) {
    sectionVisibility[section.id] = section.enabled;
  }
  
  return {
    analysis,
    sectionVisibility,
    editedFields: {},
    customNarratives: {},
    isDirty: false,
    lastSavedAt: null,
    lastAutoSaveAt: null,
    version: 1,
  };
}

/**
 * Hook for managing Cost Seg report state
 */
export function useCostSegReportState(analysis: CostSegAnalysis): UseCostSegReportStateReturn {
  const [reportState, setReportState] = useState<CostSegReportState>(() => {
    // Try to load from localStorage
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as CostSegReportState;
        // Only restore if it's for the same property
        if (parsed.analysis?.propertyId === analysis.propertyId) {
          return { ...parsed, analysis };
        }
      }
    } catch {
      // Ignore errors and use fresh state
    }
    return createInitialState(analysis);
  });

  // Update analysis when it changes
  useEffect(() => {
    setReportState(prev => ({
      ...prev,
      analysis,
    }));
  }, [analysis]);

  // Auto-save to localStorage
  useEffect(() => {
    if (reportState.isDirty) {
      const timeout = setTimeout(() => {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(reportState));
          setReportState(prev => ({
            ...prev,
            lastAutoSaveAt: new Date().toISOString(),
          }));
        } catch {
          // Ignore storage errors
        }
      }, 1000); // Debounce 1 second
      
      return () => clearTimeout(timeout);
    }
  }, [reportState]);

  const toggleSection = useCallback((sectionId: string) => {
    setReportState(prev => ({
      ...prev,
      sectionVisibility: {
        ...prev.sectionVisibility,
        [sectionId]: !prev.sectionVisibility[sectionId],
      },
      isDirty: true,
      version: prev.version + 1,
    }));
  }, []);

  const updateNarrative = useCallback((sectionId: string, content: string) => {
    setReportState(prev => ({
      ...prev,
      customNarratives: {
        ...prev.customNarratives,
        [sectionId]: content,
      },
      isDirty: true,
      version: prev.version + 1,
    }));
  }, []);

  const resetSection = useCallback((sectionId: string) => {
    setReportState(prev => {
      const newNarratives = { ...prev.customNarratives };
      delete newNarratives[sectionId];
      
      const defaultVisibility = COST_SEG_REPORT_SECTIONS.find(s => s.id === sectionId)?.enabled ?? true;
      
      return {
        ...prev,
        sectionVisibility: {
          ...prev.sectionVisibility,
          [sectionId]: defaultVisibility,
        },
        customNarratives: newNarratives,
        isDirty: true,
        version: prev.version + 1,
      };
    });
  }, []);

  const save = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reportState));
      setReportState(prev => ({
        ...prev,
        isDirty: false,
        lastSavedAt: new Date().toISOString(),
      }));
    } catch {
      console.error('Failed to save Cost Seg report state');
    }
  }, [reportState]);

  const load = useCallback(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as CostSegReportState;
        setReportState({ ...parsed, analysis });
      }
    } catch {
      console.error('Failed to load Cost Seg report state');
    }
  }, [analysis]);

  const clear = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setReportState(createInitialState(analysis));
    } catch {
      // Ignore errors
    }
  }, [analysis]);

  const isSectionVisible = useCallback((sectionId: string) => {
    return reportState.sectionVisibility[sectionId] ?? true;
  }, [reportState.sectionVisibility]);

  const orderedSections = useMemo(() => {
    return [...COST_SEG_REPORT_SECTIONS].sort((a, b) => a.order - b.order);
  }, []);

  return {
    reportState,
    isDirty: reportState.isDirty,
    toggleSection,
    updateNarrative,
    resetSection,
    save,
    load,
    clear,
    isSectionVisible,
    orderedSections,
    lastSavedAt: reportState.lastSavedAt,
  };
}

export default useCostSegReportState;

