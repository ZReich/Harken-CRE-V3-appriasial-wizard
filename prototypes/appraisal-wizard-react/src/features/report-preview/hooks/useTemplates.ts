/**
 * useTemplates Hook
 * 
 * Provides access to saved report templates from IndexedDB.
 * Used on the Template selection page to show user-created templates.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getAllTemplates,
  getTemplate,
  deleteTemplate,
  searchTemplates,
  getTemplatesByPropertyType,
  isIndexedDBSupported,
  type StoredTemplate,
} from '../utils/templateStorage';

export interface UseTemplatesState {
  templates: StoredTemplate[];
  isLoading: boolean;
  error: string | null;
  isSupported: boolean;
}

export interface UseTemplatesActions {
  loadTemplates: () => Promise<void>;
  loadTemplate: (id: string) => Promise<StoredTemplate | null>;
  removeTemplate: (id: string) => Promise<void>;
  searchByQuery: (query: string) => Promise<StoredTemplate[]>;
  searchByPropertyType: (propertyType: string) => Promise<StoredTemplate[]>;
  refresh: () => Promise<void>;
}

export function useTemplates(): [UseTemplatesState, UseTemplatesActions] {
  const [state, setState] = useState<UseTemplatesState>({
    templates: [],
    isLoading: true,
    error: null,
    isSupported: isIndexedDBSupported(),
  });

  // Load all templates
  const loadTemplates = useCallback(async () => {
    if (!isIndexedDBSupported()) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Template storage is not supported in this browser',
      }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const templates = await getAllTemplates();
      setState(prev => ({
        ...prev,
        templates,
        isLoading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load templates',
      }));
    }
  }, []);

  // Load a single template by ID
  const loadTemplate = useCallback(async (id: string): Promise<StoredTemplate | null> => {
    try {
      return await getTemplate(id);
    } catch (error) {
      console.error('Failed to load template:', error);
      return null;
    }
  }, []);

  // Remove a template
  const removeTemplate = useCallback(async (id: string) => {
    try {
      await deleteTemplate(id);
      // Refresh the list
      await loadTemplates();
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to delete template',
      }));
    }
  }, [loadTemplates]);

  // Search templates by query
  const searchByQuery = useCallback(async (query: string): Promise<StoredTemplate[]> => {
    try {
      return await searchTemplates(query);
    } catch (error) {
      console.error('Failed to search templates:', error);
      return [];
    }
  }, []);

  // Search templates by property type
  const searchByPropertyType = useCallback(async (propertyType: string): Promise<StoredTemplate[]> => {
    try {
      return await getTemplatesByPropertyType(propertyType);
    } catch (error) {
      console.error('Failed to search templates:', error);
      return [];
    }
  }, []);

  // Refresh templates list
  const refresh = useCallback(async () => {
    await loadTemplates();
  }, [loadTemplates]);

  // Load templates on mount
  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  const actions: UseTemplatesActions = {
    loadTemplates,
    loadTemplate,
    removeTemplate,
    searchByQuery,
    searchByPropertyType,
    refresh,
  };

  return [state, actions];
}

export default useTemplates;

