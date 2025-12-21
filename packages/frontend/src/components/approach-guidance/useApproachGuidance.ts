import { useState, useCallback } from 'react';
import type { ApproachType } from './ApproachGuidancePanel';

interface UseApproachGuidanceOptions {
  defaultVisible?: boolean;
  defaultMode?: 'guidance' | 'values';
}

interface UseApproachGuidanceReturn {
  isVisible: boolean;
  mode: 'guidance' | 'values';
  showGuidance: () => void;
  showValues: () => void;
  togglePanel: () => void;
  setMode: (mode: 'guidance' | 'values') => void;
  closePanel: () => void;
  openPanel: () => void;
}

export const useApproachGuidance = (
  options: UseApproachGuidanceOptions = {}
): UseApproachGuidanceReturn => {
  const { defaultVisible = true, defaultMode = 'guidance' } = options;
  
  const [isVisible, setIsVisible] = useState(defaultVisible);
  const [mode, setMode] = useState<'guidance' | 'values'>(defaultMode);

  const showGuidance = useCallback(() => {
    setMode('guidance');
    setIsVisible(true);
  }, []);

  const showValues = useCallback(() => {
    setMode('values');
    setIsVisible(true);
  }, []);

  const togglePanel = useCallback(() => {
    setIsVisible((prev) => !prev);
  }, []);

  const closePanel = useCallback(() => {
    setIsVisible(false);
  }, []);

  const openPanel = useCallback(() => {
    setIsVisible(true);
  }, []);

  return {
    isVisible,
    mode,
    showGuidance,
    showValues,
    togglePanel,
    setMode,
    closePanel,
    openPanel,
  };
};

