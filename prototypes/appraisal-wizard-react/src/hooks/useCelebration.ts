import { useCallback, useEffect, useRef } from 'react';
import { useWizard } from '../context/WizardContext';
import { 
  getSectionSchema, 
  CELEBRATION_MESSAGES, 
  getScenarioCelebrationMessage,
  type CelebrationLevel,
  type AnimationType 
} from '../constants/completionSchema';

interface CelebrationData {
  isVisible: boolean;
  sectionId: string | null;
  scenarioId: number | null;
  level: CelebrationLevel;
  animationType: AnimationType;
  duration: number;
  title: string;
  subtitle: string;
}

/**
 * Hook for managing celebration triggers and display
 */
export function useCelebration() {
  const { state, showCelebration, hideCelebration, markSectionComplete, getSectionCompletion } = useWizard();
  
  // Default celebration state if not present (for backwards compatibility with old localStorage)
  const celebration = state.celebration || {
    isVisible: false,
    sectionId: null,
    scenarioId: null,
    level: 'none' as const,
  };

  // Track previously completed sections to avoid re-triggering
  const completedSectionsRef = useRef<Set<string>>(new Set());
  const completedScenariosRef = useRef<Set<number>>(new Set());

  // Get celebration data for current state
  const getCelebrationData = useCallback((): CelebrationData => {
    if (!celebration?.isVisible || !celebration?.sectionId) {
      return {
        isVisible: false,
        sectionId: null,
        scenarioId: null,
        level: 'none',
        animationType: 'none',
        duration: 0,
        title: '',
        subtitle: '',
      };
    }

    const section = getSectionSchema(celebration.sectionId);
    const messages = celebration.scenarioId 
      ? getScenarioCelebrationMessage(
          state.scenarios?.find(s => s.id === celebration.scenarioId)?.name || 'Scenario'
        )
      : CELEBRATION_MESSAGES[celebration.sectionId] || { title: 'Complete!', subtitle: '' };

    return {
      isVisible: celebration.isVisible,
      sectionId: celebration.sectionId,
      scenarioId: celebration.scenarioId,
      level: celebration.level,
      animationType: section?.animationType || 'none',
      duration: section?.animationDuration || 2,
      title: messages.title,
      subtitle: messages.subtitle,
    };
  }, [celebration, state.scenarios]);

  // Trigger celebration for a section
  const triggerSectionCelebration = useCallback((sectionId: string) => {
    // Don't trigger if already celebrated
    if (completedSectionsRef.current.has(sectionId)) return;
    
    const section = getSectionSchema(sectionId);
    if (!section || section.celebrationLevel === 'none') return;

    completedSectionsRef.current.add(sectionId);
    markSectionComplete(sectionId);
    showCelebration(sectionId, section.celebrationLevel);
  }, [markSectionComplete, showCelebration]);

  // Trigger celebration for a completed scenario
  const triggerScenarioCelebration = useCallback((scenarioId: number, scenarioName: string) => {
    // Don't trigger if already celebrated
    if (completedScenariosRef.current.has(scenarioId)) return;
    
    completedScenariosRef.current.add(scenarioId);
    showCelebration('analysis', 'medium', scenarioId);
  }, [showCelebration]);

  // Trigger grand celebration when all scenarios complete
  const triggerGrandCelebration = useCallback(() => {
    showCelebration('analysis', 'grand');
  }, [showCelebration]);

  // Dismiss current celebration
  const dismissCelebration = useCallback(() => {
    hideCelebration();
  }, [hideCelebration]);

  // Auto-dismiss celebration after duration
  useEffect(() => {
    if (!celebration.isVisible) return;

    const section = getSectionSchema(celebration.sectionId || '');
    const duration = (section?.animationDuration || 3) * 1000;

    const timer = setTimeout(() => {
      hideCelebration();
    }, duration);

    return () => clearTimeout(timer);
  }, [celebration.isVisible, celebration.sectionId, hideCelebration]);

  // Check if section just completed and trigger celebration
  const checkAndTriggerCelebration = useCallback((sectionId: string) => {
    const section = getSectionSchema(sectionId);
    if (!section || section.celebrationLevel === 'none') return;
    
    const completion = getSectionCompletion(sectionId);
    if (completion === 100 && !completedSectionsRef.current.has(sectionId)) {
      triggerSectionCelebration(sectionId);
    }
  }, [getSectionCompletion, triggerSectionCelebration]);

  return {
    // Current celebration state
    celebrationData: getCelebrationData(),
    isVisible: celebration.isVisible,
    
    // Trigger functions
    triggerSectionCelebration,
    triggerScenarioCelebration,
    triggerGrandCelebration,
    checkAndTriggerCelebration,
    
    // Dismiss
    dismissCelebration,
  };
}

export default useCelebration;

