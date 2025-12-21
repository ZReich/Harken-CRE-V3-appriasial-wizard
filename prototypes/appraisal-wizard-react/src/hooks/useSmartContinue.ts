import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { COMPLETION_SCHEMA } from '../constants/completionSchema';
import { useCompletion } from './useCompletion';

interface SmartContinueOptions {
  sectionId: string;
  tabs: string[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentPhase: number;
}

/**
 * Hook for implementing smart Continue button logic
 * - Cycles through sidebar tabs first
 * - Advances to next main section when all tabs are visited or section is complete
 */
export function useSmartContinue({
  sectionId,
  tabs,
  activeTab,
  setActiveTab,
  currentPhase,
}: SmartContinueOptions) {
  const navigate = useNavigate();
  const { sectionCompletion, isComplete } = useCompletion(sectionId);

  // Get the pages array for navigation
  const pages = useMemo(() => [
    { path: '/template', label: 'Template' },
    { path: '/document-intake', label: 'Documents' },
    { path: '/setup', label: 'Setup' },
    { path: '/subject-data', label: 'Subject Data' },
    { path: '/analysis', label: 'Analysis' },
    { path: '/review', label: 'Review' },
  ], []);

  // Find current tab index
  const currentTabIndex = useMemo(() => {
    return tabs.indexOf(activeTab);
  }, [tabs, activeTab]);

  // Check if on last tab
  const isLastTab = currentTabIndex === tabs.length - 1;

  // The smart Continue logic
  const handleContinue = useCallback(() => {
    // If section is complete, go to next phase
    if (isComplete) {
      if (currentPhase < 6) {
        navigate(pages[currentPhase].path);
      }
      return;
    }

    // If not on last tab, go to next tab
    if (!isLastTab && currentTabIndex >= 0) {
      setActiveTab(tabs[currentTabIndex + 1]);
      return;
    }

    // If on last tab but section not complete, wrap to first tab
    if (isLastTab && !isComplete) {
      // Option 1: Go back to first tab to complete remaining items
      // setActiveTab(tabs[0]);
      
      // Option 2: Proceed anyway to next section (current behavior)
      if (currentPhase < 6) {
        navigate(pages[currentPhase].path);
      }
      return;
    }

    // Default: go to next phase
    if (currentPhase < 6) {
      navigate(pages[currentPhase].path);
    }
  }, [isComplete, isLastTab, currentTabIndex, currentPhase, tabs, setActiveTab, navigate, pages]);

  // Button label based on state
  const continueLabel = useMemo(() => {
    if (isComplete) {
      return currentPhase < 6 ? 'Continue →' : 'Finalize';
    }
    if (isLastTab) {
      return currentPhase < 6 ? 'Continue →' : 'Finalize';
    }
    return `Continue to ${tabs[currentTabIndex + 1] ? capitalize(tabs[currentTabIndex + 1]) : 'Next'}`;
  }, [isComplete, isLastTab, currentTabIndex, tabs, currentPhase]);

  return {
    handleContinue,
    continueLabel,
    isLastTab,
    isComplete,
    sectionCompletion,
  };
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default useSmartContinue;

