// src/components/guidance/GuidanceProvider.tsx
// Context provider for managing guidance state across the application

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

// Guidance topics that can be shown
export type GuidanceTopic =
  | 'welcome'
  | 'property-components'
  | 'analysis-type'
  | 'land-classification'
  | 'rent-comp-mode'
  | 'contributory-value'
  | 'scenario-selection'
  | 'income-linking';

// Hint configuration
export interface GuidanceHint {
  id: string;
  topic: GuidanceTopic;
  title: string;
  content: string;
  targetSelector?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  showOnce?: boolean;
}

// Context state
interface GuidanceContextState {
  /** Whether guidance is enabled */
  isEnabled: boolean;
  /** Toggle guidance on/off */
  setEnabled: (enabled: boolean) => void;
  /** Currently visible topic (for modals/panels) */
  activeTopicId: GuidanceTopic | null;
  /** Show a specific guidance topic */
  showTopic: (topicId: GuidanceTopic) => void;
  /** Hide the current topic */
  hideTopic: () => void;
  /** Check if a hint has been seen */
  hasSeenHint: (hintId: string) => boolean;
  /** Mark a hint as seen */
  markHintSeen: (hintId: string) => void;
  /** Reset all seen hints */
  resetSeenHints: () => void;
  /** List of dismissed hints */
  dismissedHints: Set<string>;
  /** Dismiss a hint (don't show again) */
  dismissHint: (hintId: string) => void;
  /** Check if first-time user */
  isFirstTimeUser: boolean;
  /** Mark as not first-time */
  markNotFirstTime: () => void;
}

const GuidanceContext = createContext<GuidanceContextState | null>(null);

const STORAGE_KEYS = {
  enabled: 'harken_guidance_enabled',
  seenHints: 'harken_guidance_seen_hints',
  dismissedHints: 'harken_guidance_dismissed_hints',
  firstTime: 'harken_guidance_first_time',
};

interface GuidanceProviderProps {
  children: React.ReactNode;
  /** Default enabled state */
  defaultEnabled?: boolean;
}

export function GuidanceProvider({
  children,
  defaultEnabled = true,
}: GuidanceProviderProps) {
  // Load initial state from localStorage
  const [isEnabled, setIsEnabledState] = useState<boolean>(() => {
    if (typeof window === 'undefined') return defaultEnabled;
    const stored = localStorage.getItem(STORAGE_KEYS.enabled);
    return stored !== null ? stored === 'true' : defaultEnabled;
  });

  const [activeTopicId, setActiveTopicId] = useState<GuidanceTopic | null>(null);

  const [seenHints, setSeenHints] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set();
    const stored = localStorage.getItem(STORAGE_KEYS.seenHints);
    return stored ? new Set(JSON.parse(stored)) : new Set();
  });

  const [dismissedHints, setDismissedHints] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set();
    const stored = localStorage.getItem(STORAGE_KEYS.dismissedHints);
    return stored ? new Set(JSON.parse(stored)) : new Set();
  });

  const [isFirstTimeUser, setIsFirstTimeUser] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    const stored = localStorage.getItem(STORAGE_KEYS.firstTime);
    return stored === null || stored === 'true';
  });

  // Persist state to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.enabled, String(isEnabled));
  }, [isEnabled]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.seenHints, JSON.stringify([...seenHints]));
  }, [seenHints]);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEYS.dismissedHints,
      JSON.stringify([...dismissedHints])
    );
  }, [dismissedHints]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.firstTime, String(isFirstTimeUser));
  }, [isFirstTimeUser]);

  // Actions
  const setEnabled = useCallback((enabled: boolean) => {
    setIsEnabledState(enabled);
  }, []);

  const showTopic = useCallback((topicId: GuidanceTopic) => {
    setActiveTopicId(topicId);
  }, []);

  const hideTopic = useCallback(() => {
    setActiveTopicId(null);
  }, []);

  const hasSeenHint = useCallback(
    (hintId: string) => {
      return seenHints.has(hintId);
    },
    [seenHints]
  );

  const markHintSeen = useCallback((hintId: string) => {
    setSeenHints((prev) => new Set([...prev, hintId]));
  }, []);

  const resetSeenHints = useCallback(() => {
    setSeenHints(new Set());
  }, []);

  const dismissHint = useCallback((hintId: string) => {
    setDismissedHints((prev) => new Set([...prev, hintId]));
  }, []);

  const markNotFirstTime = useCallback(() => {
    setIsFirstTimeUser(false);
  }, []);

  const value: GuidanceContextState = {
    isEnabled,
    setEnabled,
    activeTopicId,
    showTopic,
    hideTopic,
    hasSeenHint,
    markHintSeen,
    resetSeenHints,
    dismissedHints,
    dismissHint,
    isFirstTimeUser,
    markNotFirstTime,
  };

  return (
    <GuidanceContext.Provider value={value}>
      {children}
    </GuidanceContext.Provider>
  );
}

// Hook to use guidance context
export function useGuidance() {
  const context = useContext(GuidanceContext);
  if (!context) {
    throw new Error('useGuidance must be used within a GuidanceProvider');
  }
  return context;
}

// Utility hook for conditional hint display
export function useGuidanceHint(hintId: string, topic: GuidanceTopic) {
  const { isEnabled, hasSeenHint, markHintSeen, dismissedHints, dismissHint } =
    useGuidance();

  const shouldShow =
    isEnabled && !hasSeenHint(hintId) && !dismissedHints.has(hintId);

  const handleSeen = useCallback(() => {
    markHintSeen(hintId);
  }, [hintId, markHintSeen]);

  const handleDismiss = useCallback(() => {
    dismissHint(hintId);
  }, [hintId, dismissHint]);

  return {
    shouldShow,
    onSeen: handleSeen,
    onDismiss: handleDismiss,
  };
}

export default GuidanceProvider;
