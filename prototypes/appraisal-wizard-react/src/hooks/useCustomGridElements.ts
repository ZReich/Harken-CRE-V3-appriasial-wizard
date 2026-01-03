/**
 * useCustomGridElements Hook
 * 
 * Manages user-defined custom grid elements for Sales Comparison Grid.
 * Persists to localStorage for reuse across appraisals.
 */

import { useState, useEffect, useCallback } from 'react';
import type { GridRowCategory } from '../features/sales-comparison/types';

// =================================================================
// TYPES
// =================================================================

export interface CustomGridElement {
    id: string;
    label: string;
    key: string;
    category: GridRowCategory;
    isCustom: true;
    createdAt: string;
}

// Storage key for localStorage
const STORAGE_KEY = 'harken_custom_grid_elements';

// =================================================================
// HOOK
// =================================================================

interface UseCustomGridElementsReturn {
    /** All custom grid elements */
    customElements: CustomGridElement[];

    /** Add a new custom element */
    addCustomElement: (element: { label: string; key: string; category: GridRowCategory }) => CustomGridElement;

    /** Remove a custom element by ID */
    removeCustomElement: (id: string) => void;

    /** Get custom elements for a specific category */
    getCustomElementsByCategory: (category: GridRowCategory) => CustomGridElement[];

    /** Check if a custom element with this key already exists */
    hasCustomElement: (key: string) => boolean;
}

export function useCustomGridElements(): UseCustomGridElementsReturn {
    // Load from storage or default to empty array
    const [customElements, setCustomElements] = useState<CustomGridElement[]>(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            console.warn('Failed to load custom grid elements:', e);
            return [];
        }
    });

    // Persist to localStorage whenever elements change
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(customElements));
        } catch (e) {
            console.warn('Failed to save custom grid elements:', e);
        }
    }, [customElements]);

    // Add a new custom element
    const addCustomElement = useCallback((
        element: { label: string; key: string; category: GridRowCategory }
    ): CustomGridElement => {
        // Check if it already exists to avoid duplicates
        if (customElements.some(e => e.key === element.key)) {
            return customElements.find(e => e.key === element.key) as CustomGridElement;
        }

        const newElement: CustomGridElement = {
            ...element,
            id: `custom-grid-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 5)}`,
            isCustom: true,
            createdAt: new Date().toISOString(),
        };

        setCustomElements(prev => [...prev, newElement]);
        return newElement;
    }, [customElements]);

    // Remove a custom element
    const removeCustomElement = useCallback((id: string) => {
        setCustomElements(prev => prev.filter(e => e.id !== id));
    }, []);

    // Get custom elements by category
    const getCustomElementsByCategory = useCallback((category: GridRowCategory): CustomGridElement[] => {
        return customElements.filter(e => e.category === category);
    }, [customElements]);

    // Check if a custom element with this key exists
    const hasCustomElement = useCallback((key: string): boolean => {
        return customElements.some(e => e.key === key);
    }, [customElements]);

    return {
        customElements,
        addCustomElement,
        removeCustomElement,
        getCustomElementsByCategory,
        hasCustomElement,
    };
}

export default useCustomGridElements;
