import { useMemo, useCallback } from 'react';
import { useWizard } from '../context/WizardContext';
import { getSectionSchema, COMPLETION_SCHEMA } from '../constants/completionSchema';

/**
 * Hook for tracking completion status of sections and tabs
 */
export function useCompletion(sectionId: string) {
  const { getTabCompletion, getSectionCompletion, getSmartInitialTab, setPageTab } = useWizard();

  // Get section schema
  const section = useMemo(() => getSectionSchema(sectionId), [sectionId]);

  // Get tabs for this section
  const tabs = useMemo(() => section?.tabs || [], [section]);

  // Get completion for each tab
  const tabCompletions = useMemo(() => {
    return tabs.map(tab => ({
      ...tab,
      completion: getTabCompletion(sectionId, tab.id),
    }));
  }, [tabs, sectionId, getTabCompletion]);

  // Get overall section completion
  const sectionCompletion = useMemo(() => {
    return getSectionCompletion(sectionId);
  }, [sectionId, getSectionCompletion]);

  // Check if section is complete
  const isComplete = sectionCompletion === 100;

  // Get smart initial tab
  const getInitialTab = useCallback((defaultTab: string) => {
    return getSmartInitialTab(sectionId, defaultTab);
  }, [sectionId, getSmartInitialTab]);

  // Track tab change
  const trackTabChange = useCallback((tabId: string) => {
    setPageTab(sectionId, tabId);
  }, [sectionId, setPageTab]);

  // Get completion for a specific tab
  const getTabProgress = useCallback((tabId: string): number => {
    return getTabCompletion(sectionId, tabId);
  }, [sectionId, getTabCompletion]);

  // Check if a tab is complete
  const isTabComplete = useCallback((tabId: string): boolean => {
    return getTabCompletion(sectionId, tabId) === 100;
  }, [sectionId, getTabCompletion]);

  // Should track progress for this section
  const shouldTrackProgress = section?.trackProgress ?? false;

  // Celebration config for this section
  const celebrationConfig = useMemo(() => ({
    level: section?.celebrationLevel ?? 'none',
    animationType: section?.animationType ?? 'none',
    duration: section?.animationDuration ?? 0,
  }), [section]);

  return {
    // Section info
    section,
    tabs,
    shouldTrackProgress,
    
    // Completion data
    tabCompletions,
    sectionCompletion,
    isComplete,
    
    // Helpers
    getInitialTab,
    trackTabChange,
    getTabProgress,
    isTabComplete,
    
    // Celebration
    celebrationConfig,
  };
}

/**
 * Hook for getting completion across all sections (for progress stepper)
 */
export function useOverallProgress() {
  const { getSectionCompletion } = useWizard();

  const sectionCompletions = useMemo(() => {
    return COMPLETION_SCHEMA.map(section => ({
      id: section.id,
      path: section.path,
      label: section.label,
      completion: getSectionCompletion(section.id),
      trackProgress: section.trackProgress,
      celebrationLevel: section.celebrationLevel,
    }));
  }, [getSectionCompletion]);

  const overallCompletion = useMemo(() => {
    const trackableSections = sectionCompletions.filter(s => s.trackProgress);
    if (trackableSections.length === 0) return 0;
    const total = trackableSections.reduce((sum, s) => sum + s.completion, 0);
    return Math.round(total / trackableSections.length);
  }, [sectionCompletions]);

  return {
    sectionCompletions,
    overallCompletion,
  };
}

export default useCompletion;

