import { useState, useCallback, useRef, useEffect } from 'react';

// =================================================================
// TYPES
// =================================================================

export interface HistoryState<T> {
  past: T[];
  present: T;
  future: T[];
}

export interface UndoRedoOptions {
  maxHistoryLength?: number;
  debounceMs?: number;
}

export interface UndoRedoResult<T> {
  state: T;
  setState: (newState: T, options?: { skipHistory?: boolean; merge?: boolean }) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  historyLength: number;
  clear: () => void;
}

// =================================================================
// HOOK
// =================================================================

/**
 * Hook for managing undo/redo history
 */
export function useUndoRedo<T>(
  initialState: T,
  options: UndoRedoOptions = {}
): UndoRedoResult<T> {
  const { maxHistoryLength = 50, debounceMs = 1000 } = options;
  
  const [history, setHistory] = useState<HistoryState<T>>({
    past: [],
    present: initialState,
    future: [],
  });
  
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastUpdateRef = useRef<number>(0);
  
  // Set state with history tracking
  const setState = useCallback((
    newState: T,
    opts?: { skipHistory?: boolean; merge?: boolean }
  ) => {
    const now = Date.now();
    const shouldMerge = opts?.merge || (now - lastUpdateRef.current < debounceMs);
    
    setHistory(current => {
      if (opts?.skipHistory) {
        return { ...current, present: newState };
      }
      
      // If merging, replace the current present instead of adding to past
      if (shouldMerge && current.past.length > 0) {
        return {
          past: current.past,
          present: newState,
          future: [], // Clear future on new change
        };
      }
      
      // Add current state to past
      const newPast = [...current.past, current.present];
      
      // Limit history length
      if (newPast.length > maxHistoryLength) {
        newPast.shift();
      }
      
      return {
        past: newPast,
        present: newState,
        future: [], // Clear future on new change
      };
    });
    
    lastUpdateRef.current = now;
  }, [debounceMs, maxHistoryLength]);
  
  // Undo
  const undo = useCallback(() => {
    setHistory(current => {
      if (current.past.length === 0) return current;
      
      const newPast = current.past.slice(0, -1);
      const previousState = current.past[current.past.length - 1];
      
      return {
        past: newPast,
        present: previousState,
        future: [current.present, ...current.future],
      };
    });
  }, []);
  
  // Redo
  const redo = useCallback(() => {
    setHistory(current => {
      if (current.future.length === 0) return current;
      
      const nextState = current.future[0];
      const newFuture = current.future.slice(1);
      
      return {
        past: [...current.past, current.present],
        present: nextState,
        future: newFuture,
      };
    });
  }, []);
  
  // Clear history
  const clear = useCallback(() => {
    setHistory(current => ({
      past: [],
      present: current.present,
      future: [],
    }));
  }, []);
  
  // Cleanup debounce timer
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);
  
  return {
    state: history.present,
    setState,
    undo,
    redo,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
    historyLength: history.past.length,
    clear,
  };
}

// =================================================================
// DEBOUNCED UPDATES FOR TEXT EDITING
// =================================================================

/**
 * Create a debounced state updater for text editing
 * Groups rapid changes into single history entries
 */
export function useDebouncedHistory<T>(
  undoRedo: UndoRedoResult<T>,
  debounceMs: number = 1000
) {
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingStateRef = useRef<T | null>(null);
  
  const debouncedSetState = useCallback((newState: T) => {
    pendingStateRef.current = newState;
    
    // Update immediately but merge with previous
    undoRedo.setState(newState, { merge: true });
    
    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    // Set new timer to commit the change
    debounceTimerRef.current = setTimeout(() => {
      if (pendingStateRef.current !== null) {
        // This will create a new history entry
        pendingStateRef.current = null;
      }
    }, debounceMs);
  }, [undoRedo, debounceMs]);
  
  // Cleanup
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);
  
  return debouncedSetState;
}

// =================================================================
// UTILITY FOR CREATING CHECKPOINTS
// =================================================================

/**
 * Create named checkpoints in history
 */
export function useHistoryCheckpoints<T>(undoRedo: UndoRedoResult<T>) {
  const checkpointsRef = useRef<Map<string, T>>(new Map());
  
  const createCheckpoint = useCallback((name: string) => {
    checkpointsRef.current.set(name, undoRedo.state);
  }, [undoRedo.state]);
  
  const restoreCheckpoint = useCallback((name: string) => {
    const checkpoint = checkpointsRef.current.get(name);
    if (checkpoint) {
      undoRedo.setState(checkpoint);
    }
  }, [undoRedo]);
  
  const hasCheckpoint = useCallback((name: string) => {
    return checkpointsRef.current.has(name);
  }, []);
  
  const deleteCheckpoint = useCallback((name: string) => {
    checkpointsRef.current.delete(name);
  }, []);
  
  const listCheckpoints = useCallback(() => {
    return Array.from(checkpointsRef.current.keys());
  }, []);
  
  return {
    createCheckpoint,
    restoreCheckpoint,
    hasCheckpoint,
    deleteCheckpoint,
    listCheckpoints,
  };
}

export default useUndoRedo;

