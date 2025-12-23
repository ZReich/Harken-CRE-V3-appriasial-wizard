import { useEffect, useCallback, useRef } from 'react';

// =================================================================
// TYPES
// =================================================================

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  action: () => void;
  description: string;
  category: 'global' | 'navigation' | 'editing' | 'formatting';
}

export interface KeyboardShortcutConfig {
  enabled?: boolean;
  preventDefault?: boolean;
  stopPropagation?: boolean;
}

// =================================================================
// DEFAULT SHORTCUTS
// =================================================================

export const GLOBAL_SHORTCUTS: Omit<KeyboardShortcut, 'action'>[] = [
  { key: 'z', ctrl: true, description: 'Undo', category: 'global' },
  { key: 'z', ctrl: true, shift: true, description: 'Redo', category: 'global' },
  { key: 'y', ctrl: true, description: 'Redo (alternate)', category: 'global' },
  { key: 's', ctrl: true, description: 'Save', category: 'global' },
  { key: 'p', ctrl: true, description: 'Print/Export PDF', category: 'global' },
  { key: 'Escape', description: 'Deselect / Exit edit mode', category: 'global' },
  { key: 'Delete', description: 'Delete selected element', category: 'global' },
  { key: 'd', ctrl: true, description: 'Duplicate selected element', category: 'global' },
  { key: 'a', ctrl: true, description: 'Select all', category: 'global' },
];

export const NAVIGATION_SHORTCUTS: Omit<KeyboardShortcut, 'action'>[] = [
  { key: 'PageUp', description: 'Previous page', category: 'navigation' },
  { key: 'PageDown', description: 'Next page', category: 'navigation' },
  { key: 'Home', description: 'Go to first page', category: 'navigation' },
  { key: 'End', description: 'Go to last page', category: 'navigation' },
  { key: 'g', ctrl: true, description: 'Go to page number', category: 'navigation' },
  { key: 'f', ctrl: true, description: 'Find text in report', category: 'navigation' },
];

export const ELEMENT_SHORTCUTS: Omit<KeyboardShortcut, 'action'>[] = [
  { key: 'ArrowUp', description: 'Nudge element up 2pt', category: 'editing' },
  { key: 'ArrowDown', description: 'Nudge element down 2pt', category: 'editing' },
  { key: 'ArrowLeft', description: 'Nudge element left 2pt', category: 'editing' },
  { key: 'ArrowRight', description: 'Nudge element right 2pt', category: 'editing' },
  { key: 'ArrowUp', shift: true, description: 'Nudge element up 12pt', category: 'editing' },
  { key: 'ArrowDown', shift: true, description: 'Nudge element down 12pt', category: 'editing' },
  { key: 'ArrowLeft', shift: true, description: 'Nudge element left 12pt', category: 'editing' },
  { key: 'ArrowRight', shift: true, description: 'Nudge element right 12pt', category: 'editing' },
  { key: 'Enter', description: 'Edit selected element', category: 'editing' },
  { key: 'Tab', description: 'Select next element', category: 'editing' },
  { key: 'Tab', shift: true, description: 'Select previous element', category: 'editing' },
];

export const FORMATTING_SHORTCUTS: Omit<KeyboardShortcut, 'action'>[] = [
  { key: 'b', ctrl: true, description: 'Bold', category: 'formatting' },
  { key: 'i', ctrl: true, description: 'Italic', category: 'formatting' },
  { key: 'u', ctrl: true, description: 'Underline', category: 'formatting' },
  { key: 'l', ctrl: true, shift: true, description: 'Bullet list', category: 'formatting' },
  { key: 'o', ctrl: true, shift: true, description: 'Numbered list', category: 'formatting' },
  { key: ']', ctrl: true, description: 'Increase font size', category: 'formatting' },
  { key: '[', ctrl: true, description: 'Decrease font size', category: 'formatting' },
];

// =================================================================
// HOOK
// =================================================================

export interface UseKeyboardShortcutsOptions {
  shortcuts: KeyboardShortcut[];
  enabled?: boolean;
  scope?: HTMLElement | null;
}

/**
 * Hook for managing keyboard shortcuts in the editor
 */
export function useKeyboardShortcuts(options: UseKeyboardShortcutsOptions): void {
  const { shortcuts, enabled = true, scope } = options;
  const shortcutsRef = useRef(shortcuts);
  
  // Keep shortcuts ref updated
  useEffect(() => {
    shortcutsRef.current = shortcuts;
  }, [shortcuts]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;
    
    // Ignore if typing in an input or textarea (unless it's a special key)
    const target = event.target as HTMLElement;
    const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
    
    // Find matching shortcut
    const matchingShortcut = shortcutsRef.current.find(shortcut => {
      const keyMatch = shortcut.key.toLowerCase() === event.key.toLowerCase();
      const ctrlMatch = !!shortcut.ctrl === (event.ctrlKey || event.metaKey);
      const shiftMatch = !!shortcut.shift === event.shiftKey;
      const altMatch = !!shortcut.alt === event.altKey;
      
      return keyMatch && ctrlMatch && shiftMatch && altMatch;
    });
    
    if (matchingShortcut) {
      // Allow some shortcuts even in inputs
      const allowInInput = ['Escape', 's', 'z', 'y'].includes(matchingShortcut.key.toLowerCase());
      
      if (!isInput || allowInInput || (matchingShortcut.ctrl && !isInput)) {
        event.preventDefault();
        event.stopPropagation();
        matchingShortcut.action();
      }
    }
  }, [enabled]);

  useEffect(() => {
    const target = scope || document;
    target.addEventListener('keydown', handleKeyDown as EventListener);
    return () => target.removeEventListener('keydown', handleKeyDown as EventListener);
  }, [handleKeyDown, scope]);
}

/**
 * Create a shortcut handler for the editor
 */
export function createEditorShortcuts(handlers: {
  onUndo?: () => void;
  onRedo?: () => void;
  onSave?: () => void;
  onPrint?: () => void;
  onEscape?: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  onSelectAll?: () => void;
  onPrevPage?: () => void;
  onNextPage?: () => void;
  onFirstPage?: () => void;
  onLastPage?: () => void;
  onGoToPage?: () => void;
  onFind?: () => void;
  onNudge?: (direction: 'up' | 'down' | 'left' | 'right', large: boolean) => void;
  onEditElement?: () => void;
  onSelectNext?: () => void;
  onSelectPrev?: () => void;
  onFormat?: (format: string) => void;
}): KeyboardShortcut[] {
  const shortcuts: KeyboardShortcut[] = [];
  
  // Global shortcuts
  if (handlers.onUndo) {
    shortcuts.push({
      key: 'z', ctrl: true,
      action: handlers.onUndo,
      description: 'Undo',
      category: 'global',
    });
  }
  
  if (handlers.onRedo) {
    shortcuts.push(
      { key: 'z', ctrl: true, shift: true, action: handlers.onRedo, description: 'Redo', category: 'global' },
      { key: 'y', ctrl: true, action: handlers.onRedo, description: 'Redo (alternate)', category: 'global' }
    );
  }
  
  if (handlers.onSave) {
    shortcuts.push({
      key: 's', ctrl: true,
      action: handlers.onSave,
      description: 'Save',
      category: 'global',
    });
  }
  
  if (handlers.onPrint) {
    shortcuts.push({
      key: 'p', ctrl: true,
      action: handlers.onPrint,
      description: 'Print/Export PDF',
      category: 'global',
    });
  }
  
  if (handlers.onEscape) {
    shortcuts.push({
      key: 'Escape',
      action: handlers.onEscape,
      description: 'Deselect / Exit edit mode',
      category: 'global',
    });
  }
  
  if (handlers.onDelete) {
    shortcuts.push({
      key: 'Delete',
      action: handlers.onDelete,
      description: 'Delete selected element',
      category: 'global',
    });
  }
  
  if (handlers.onDuplicate) {
    shortcuts.push({
      key: 'd', ctrl: true,
      action: handlers.onDuplicate,
      description: 'Duplicate selected element',
      category: 'global',
    });
  }
  
  // Navigation shortcuts
  if (handlers.onPrevPage) {
    shortcuts.push({
      key: 'PageUp',
      action: handlers.onPrevPage,
      description: 'Previous page',
      category: 'navigation',
    });
  }
  
  if (handlers.onNextPage) {
    shortcuts.push({
      key: 'PageDown',
      action: handlers.onNextPage,
      description: 'Next page',
      category: 'navigation',
    });
  }
  
  if (handlers.onFirstPage) {
    shortcuts.push({
      key: 'Home',
      action: handlers.onFirstPage,
      description: 'Go to first page',
      category: 'navigation',
    });
  }
  
  if (handlers.onLastPage) {
    shortcuts.push({
      key: 'End',
      action: handlers.onLastPage,
      description: 'Go to last page',
      category: 'navigation',
    });
  }
  
  // Nudge shortcuts
  if (handlers.onNudge) {
    shortcuts.push(
      { key: 'ArrowUp', action: () => handlers.onNudge!('up', false), description: 'Nudge up', category: 'editing' },
      { key: 'ArrowDown', action: () => handlers.onNudge!('down', false), description: 'Nudge down', category: 'editing' },
      { key: 'ArrowLeft', action: () => handlers.onNudge!('left', false), description: 'Nudge left', category: 'editing' },
      { key: 'ArrowRight', action: () => handlers.onNudge!('right', false), description: 'Nudge right', category: 'editing' },
      { key: 'ArrowUp', shift: true, action: () => handlers.onNudge!('up', true), description: 'Nudge up large', category: 'editing' },
      { key: 'ArrowDown', shift: true, action: () => handlers.onNudge!('down', true), description: 'Nudge down large', category: 'editing' },
      { key: 'ArrowLeft', shift: true, action: () => handlers.onNudge!('left', true), description: 'Nudge left large', category: 'editing' },
      { key: 'ArrowRight', shift: true, action: () => handlers.onNudge!('right', true), description: 'Nudge right large', category: 'editing' }
    );
  }
  
  // Formatting shortcuts
  if (handlers.onFormat) {
    shortcuts.push(
      { key: 'b', ctrl: true, action: () => handlers.onFormat!('bold'), description: 'Bold', category: 'formatting' },
      { key: 'i', ctrl: true, action: () => handlers.onFormat!('italic'), description: 'Italic', category: 'formatting' },
      { key: 'u', ctrl: true, action: () => handlers.onFormat!('underline'), description: 'Underline', category: 'formatting' }
    );
  }
  
  return shortcuts;
}

/**
 * Get all shortcuts grouped by category
 */
export function getShortcutsByCategory(): Record<string, Omit<KeyboardShortcut, 'action'>[]> {
  return {
    global: GLOBAL_SHORTCUTS,
    navigation: NAVIGATION_SHORTCUTS,
    editing: ELEMENT_SHORTCUTS,
    formatting: FORMATTING_SHORTCUTS,
  };
}

/**
 * Format shortcut for display
 */
export function formatShortcut(shortcut: Omit<KeyboardShortcut, 'action'>): string {
  const parts: string[] = [];
  
  if (shortcut.ctrl) parts.push('Ctrl');
  if (shortcut.shift) parts.push('Shift');
  if (shortcut.alt) parts.push('Alt');
  if (shortcut.meta) parts.push('⌘');
  
  // Format special keys
  let keyDisplay = shortcut.key;
  if (keyDisplay === 'ArrowUp') keyDisplay = '↑';
  if (keyDisplay === 'ArrowDown') keyDisplay = '↓';
  if (keyDisplay === 'ArrowLeft') keyDisplay = '←';
  if (keyDisplay === 'ArrowRight') keyDisplay = '→';
  if (keyDisplay === 'Escape') keyDisplay = 'Esc';
  if (keyDisplay === 'Delete') keyDisplay = 'Del';
  
  parts.push(keyDisplay.toUpperCase());
  
  return parts.join('+');
}

export default useKeyboardShortcuts;

