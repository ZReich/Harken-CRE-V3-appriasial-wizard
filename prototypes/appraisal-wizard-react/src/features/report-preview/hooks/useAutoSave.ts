import { useState, useEffect, useCallback, useRef } from 'react';

// =================================================================
// TYPES
// =================================================================

export interface AutoSaveConfig {
  enabled: boolean;
  intervalMs: number;
  debounceMs: number;
  maxVersions: number;
  storageKey: string;
}

export interface SavedVersion {
  id: string;
  timestamp: string;
  data: any;
  description: string;
}

export interface AutoSaveState {
  isEnabled: boolean;
  isSaving: boolean;
  lastSaved: string | null;
  pendingChanges: boolean;
  error: string | null;
  versions: SavedVersion[];
}

export interface AutoSaveActions {
  enable: () => void;
  disable: () => void;
  saveNow: () => Promise<void>;
  recoverFromVersion: (versionId: string) => any;
  deleteVersion: (versionId: string) => void;
  clearAllVersions: () => void;
  hasSavedData: () => boolean;
  getLatestVersion: () => SavedVersion | null;
}

const DEFAULT_CONFIG: AutoSaveConfig = {
  enabled: true,
  intervalMs: 60000, // 1 minute
  debounceMs: 2000, // 2 seconds after last change
  maxVersions: 10,
  storageKey: 'appraisal-wizard-autosave',
};

// =================================================================
// LOCAL STORAGE HELPERS
// =================================================================

function getStorageKey(baseKey: string, reportId?: string): string {
  return reportId ? `${baseKey}-${reportId}` : baseKey;
}

function loadVersionsFromStorage(storageKey: string): SavedVersion[] {
  try {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load auto-save versions:', e);
  }
  return [];
}

function saveVersionsToStorage(storageKey: string, versions: SavedVersion[]): void {
  try {
    localStorage.setItem(storageKey, JSON.stringify(versions));
  } catch (e) {
    console.error('Failed to save auto-save versions:', e);
    // Handle storage quota exceeded
    if (e instanceof DOMException && e.name === 'QuotaExceededError') {
      // Remove oldest versions and try again
      const trimmedVersions = versions.slice(-5);
      try {
        localStorage.setItem(storageKey, JSON.stringify(trimmedVersions));
      } catch {
        console.error('Still failed after trimming versions');
      }
    }
  }
}

function generateVersionId(): string {
  return `v-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// =================================================================
// HOOK
// =================================================================

export function useAutoSave(
  getData: () => any,
  reportId?: string,
  config: Partial<AutoSaveConfig> = {}
): [AutoSaveState, AutoSaveActions] {
  const mergedConfig: AutoSaveConfig = { ...DEFAULT_CONFIG, ...config };
  const storageKey = getStorageKey(mergedConfig.storageKey, reportId);
  
  const [state, setState] = useState<AutoSaveState>({
    isEnabled: mergedConfig.enabled,
    isSaving: false,
    lastSaved: null,
    pendingChanges: false,
    error: null,
    versions: loadVersionsFromStorage(storageKey),
  });
  
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastDataRef = useRef<string | null>(null);

  // Perform the save operation
  const performSave = useCallback(async (description: string = 'Auto-saved') => {
    const currentData = getData();
    const dataString = JSON.stringify(currentData);
    
    // Don't save if data hasn't changed
    if (dataString === lastDataRef.current) {
      setState(prev => ({ ...prev, pendingChanges: false }));
      return;
    }
    
    setState(prev => ({ ...prev, isSaving: true, error: null }));
    
    try {
      // Create new version
      const newVersion: SavedVersion = {
        id: generateVersionId(),
        timestamp: new Date().toISOString(),
        data: currentData,
        description,
      };
      
      // Update versions list (keep max versions)
      const updatedVersions = [...state.versions, newVersion].slice(-mergedConfig.maxVersions);
      
      // Save to localStorage
      saveVersionsToStorage(storageKey, updatedVersions);
      
      // Update state
      lastDataRef.current = dataString;
      setState(prev => ({
        ...prev,
        isSaving: false,
        lastSaved: newVersion.timestamp,
        pendingChanges: false,
        versions: updatedVersions,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isSaving: false,
        error: error instanceof Error ? error.message : 'Failed to auto-save',
      }));
    }
  }, [getData, state.versions, storageKey, mergedConfig.maxVersions]);

  // Save now (manual trigger)
  const saveNow = useCallback(async () => {
    await performSave('Manual save');
  }, [performSave]);

  // Mark changes pending (trigger debounced save)
  const markChanges = useCallback(() => {
    if (!state.isEnabled) return;
    
    setState(prev => ({ ...prev, pendingChanges: true }));
    
    // Clear existing debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    // Set new debounce
    debounceRef.current = setTimeout(() => {
      performSave('Debounced auto-save');
    }, mergedConfig.debounceMs);
  }, [state.isEnabled, performSave, mergedConfig.debounceMs]);

  // Enable auto-save
  const enable = useCallback(() => {
    setState(prev => ({ ...prev, isEnabled: true }));
  }, []);

  // Disable auto-save
  const disable = useCallback(() => {
    setState(prev => ({ ...prev, isEnabled: false }));
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
  }, []);

  // Recover from a specific version
  const recoverFromVersion = useCallback((versionId: string): any => {
    const version = state.versions.find(v => v.id === versionId);
    if (version) {
      return version.data;
    }
    return null;
  }, [state.versions]);

  // Delete a specific version
  const deleteVersion = useCallback((versionId: string) => {
    const updatedVersions = state.versions.filter(v => v.id !== versionId);
    saveVersionsToStorage(storageKey, updatedVersions);
    setState(prev => ({ ...prev, versions: updatedVersions }));
  }, [state.versions, storageKey]);

  // Clear all versions
  const clearAllVersions = useCallback(() => {
    localStorage.removeItem(storageKey);
    setState(prev => ({ ...prev, versions: [], lastSaved: null }));
  }, [storageKey]);

  // Check if there's saved data
  const hasSavedData = useCallback((): boolean => {
    return state.versions.length > 0;
  }, [state.versions]);

  // Get the latest version
  const getLatestVersion = useCallback((): SavedVersion | null => {
    if (state.versions.length === 0) return null;
    return state.versions[state.versions.length - 1];
  }, [state.versions]);

  // Set up interval-based auto-save
  useEffect(() => {
    if (state.isEnabled) {
      intervalRef.current = setInterval(() => {
        performSave('Interval auto-save');
      }, mergedConfig.intervalMs);
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [state.isEnabled, performSave, mergedConfig.intervalMs]);

  // Expose markChanges via returned data change detection
  // Components should call markChanges when data changes
  useEffect(() => {
    // Track data changes
    const currentData = getData();
    const dataString = JSON.stringify(currentData);
    
    if (lastDataRef.current !== null && dataString !== lastDataRef.current) {
      markChanges();
    }
    
    lastDataRef.current = dataString;
  }, [getData, markChanges]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const actions: AutoSaveActions = {
    enable,
    disable,
    saveNow,
    recoverFromVersion,
    deleteVersion,
    clearAllVersions,
    hasSavedData,
    getLatestVersion,
  };

  return [state, actions];
}

// =================================================================
// RECOVERY DIALOG COMPONENT HOOK
// =================================================================

export function useAutoSaveRecovery(
  storageKey: string,
  reportId?: string
): {
  hasRecoveryData: boolean;
  versions: SavedVersion[];
  recoverVersion: (versionId: string) => any;
  dismissRecovery: () => void;
} {
  const fullStorageKey = getStorageKey(storageKey, reportId);
  const [versions] = useState<SavedVersion[]>(() => 
    loadVersionsFromStorage(fullStorageKey)
  );
  const [dismissed, setDismissed] = useState(false);

  const hasRecoveryData = !dismissed && versions.length > 0;

  const recoverVersion = useCallback((versionId: string): any => {
    const version = versions.find(v => v.id === versionId);
    if (version) {
      setDismissed(true);
      return version.data;
    }
    return null;
  }, [versions]);

  const dismissRecovery = useCallback(() => {
    setDismissed(true);
  }, []);

  return {
    hasRecoveryData,
    versions,
    recoverVersion,
    dismissRecovery,
  };
}

export default useAutoSave;

