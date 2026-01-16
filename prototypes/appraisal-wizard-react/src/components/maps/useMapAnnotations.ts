/**
 * useMapAnnotations.ts
 * Custom hook for managing map annotations state and operations.
 * Provides CRUD operations for annotations and syncs to wizard state.
 */

import { useState, useCallback } from 'react';
import type { MapAnnotation, MapAnnotationStyle } from '../../types';

export type AnnotationTool = 'select' | 'callout' | 'boundary' | 'line' | null;

interface UseMapAnnotationsOptions {
  initialAnnotations?: MapAnnotation[];
  onChange?: (annotations: MapAnnotation[]) => void;
}

interface UseMapAnnotationsReturn {
  annotations: MapAnnotation[];
  activeTool: AnnotationTool;
  selectedAnnotationId: string | null;
  setActiveTool: (tool: AnnotationTool) => void;
  setSelectedAnnotation: (id: string | null) => void;
  addAnnotation: (annotation: Omit<MapAnnotation, 'id'>) => MapAnnotation;
  updateAnnotation: (id: string, updates: Partial<MapAnnotation>) => void;
  removeAnnotation: (id: string) => void;
  clearAnnotations: () => void;
  undoLastAnnotation: () => void;
  getAnnotationById: (id: string) => MapAnnotation | undefined;
}

/**
 * Default Harken-blue style for annotations
 */
export const DEFAULT_ANNOTATION_STYLE: MapAnnotationStyle = {
  backgroundColor: '#0da1c7', // harken-blue
  textColor: '#ffffff',
  lineColor: '#0da1c7',
  lineWidth: 2,
  fontSize: 'md',
};

/**
 * Hook for managing map annotations
 */
export function useMapAnnotations({
  initialAnnotations = [],
  onChange,
}: UseMapAnnotationsOptions = {}): UseMapAnnotationsReturn {
  const [annotations, setAnnotations] = useState<MapAnnotation[]>(initialAnnotations);
  const [activeTool, setActiveTool] = useState<AnnotationTool>('select');
  const [selectedAnnotationId, setSelectedAnnotation] = useState<string | null>(null);
  const [history, setHistory] = useState<MapAnnotation[][]>([]);

  // Helper to update annotations and notify parent
  const updateAnnotationsState = useCallback((newAnnotations: MapAnnotation[]) => {
    // Save current state to history for undo
    setHistory(prev => [...prev.slice(-9), annotations]);
    setAnnotations(newAnnotations);
    onChange?.(newAnnotations);
  }, [annotations, onChange]);

  // Add a new annotation
  const addAnnotation = useCallback((annotation: Omit<MapAnnotation, 'id'>): MapAnnotation => {
    const newAnnotation: MapAnnotation = {
      ...annotation,
      id: `anno_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      style: annotation.style || DEFAULT_ANNOTATION_STYLE,
    };
    
    updateAnnotationsState([...annotations, newAnnotation]);
    return newAnnotation;
  }, [annotations, updateAnnotationsState]);

  // Update an existing annotation
  const updateAnnotation = useCallback((id: string, updates: Partial<MapAnnotation>) => {
    const newAnnotations = annotations.map(anno =>
      anno.id === id ? { ...anno, ...updates } : anno
    );
    updateAnnotationsState(newAnnotations);
  }, [annotations, updateAnnotationsState]);

  // Remove an annotation
  const removeAnnotation = useCallback((id: string) => {
    const newAnnotations = annotations.filter(anno => anno.id !== id);
    updateAnnotationsState(newAnnotations);
    if (selectedAnnotationId === id) {
      setSelectedAnnotation(null);
    }
  }, [annotations, selectedAnnotationId, updateAnnotationsState]);

  // Clear all annotations
  const clearAnnotations = useCallback(() => {
    updateAnnotationsState([]);
    setSelectedAnnotation(null);
  }, [updateAnnotationsState]);

  // Undo last annotation
  const undoLastAnnotation = useCallback(() => {
    if (history.length > 0) {
      const lastState = history[history.length - 1];
      setHistory(prev => prev.slice(0, -1));
      setAnnotations(lastState);
      onChange?.(lastState);
    }
  }, [history, onChange]);

  // Get annotation by ID
  const getAnnotationById = useCallback((id: string) => {
    return annotations.find(anno => anno.id === id);
  }, [annotations]);

  return {
    annotations,
    activeTool,
    selectedAnnotationId,
    setActiveTool,
    setSelectedAnnotation,
    addAnnotation,
    updateAnnotation,
    removeAnnotation,
    clearAnnotations,
    undoLastAnnotation,
    getAnnotationById,
  };
}

export default useMapAnnotations;
