import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useWizard } from '../../../context/WizardContext';

// =================================================================
// TYPES
// =================================================================

export interface EditedField {
  id: string;
  path: string; // JSON path to the field in wizard state
  originalValue: any;
  editedValue: any;
  editedAt: string;
  type: 'text' | 'number' | 'date' | 'selection' | 'custom';
}

export interface ConflictInfo {
  fieldId: string;
  path: string;
  previewValue: any;
  wizardValue: any;
  originalValue: any;
  message: string;
}

export interface ReportState {
  // Current state
  isDirty: boolean;
  editedFields: Record<string, EditedField>;
  conflicts: ConflictInfo[];
  
  // Versioning
  version: number;
  lastSaved: string | null;
  lastWizardSync: string;
  
  // Content
  sectionOrder: string[];
  sectionVisibility: Record<string, boolean>;
  customContent: Record<string, any>;
  styling: Record<string, React.CSSProperties>;
}

export interface ReportStateActions {
  // Edit operations
  setFieldValue: (path: string, value: any, type?: EditedField['type']) => void;
  revertField: (path: string) => void;
  revertAllFields: () => void;
  
  // Section operations
  setSectionVisibility: (sectionId: string, visible: boolean) => void;
  reorderSections: (newOrder: string[]) => void;
  
  // Styling operations
  setElementStyle: (elementId: string, styles: React.CSSProperties) => void;
  
  // Custom content
  setCustomContent: (key: string, content: any) => void;
  
  // Sync operations
  syncFromWizard: () => void;
  checkForConflicts: () => ConflictInfo[];
  resolveConflict: (fieldId: string, resolution: 'keep-preview' | 'use-wizard') => void;
  
  // Save operations
  markAsSaved: () => void;
  
  // Query
  getFieldValue: (path: string) => any;
  hasFieldBeenEdited: (path: string) => boolean;
}

// =================================================================
// UTILITY FUNCTIONS
// =================================================================

function getValueAtPath(obj: any, path: string): any {
  const parts = path.split('.');
  let current = obj;
  for (const part of parts) {
    if (current === undefined || current === null) return undefined;
    // Handle array indices like "items[0]"
    const match = part.match(/^(\w+)\[(\d+)\]$/);
    if (match) {
      current = current[match[1]]?.[parseInt(match[2])];
    } else {
      current = current[part];
    }
  }
  return current;
}

// Utility function for setting values at path (for future use in applying edits)
export function setValueAtPath(obj: any, path: string, value: any): any {
  const parts = path.split('.');
  const result = JSON.parse(JSON.stringify(obj)); // Deep clone
  let current = result;
  
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    const match = part.match(/^(\w+)\[(\d+)\]$/);
    if (match) {
      if (!current[match[1]]) current[match[1]] = [];
      if (!current[match[1]][parseInt(match[2])]) current[match[1]][parseInt(match[2])] = {};
      current = current[match[1]][parseInt(match[2])];
    } else {
      if (!current[part]) current[part] = {};
      current = current[part];
    }
  }
  
  const lastPart = parts[parts.length - 1];
  const lastMatch = lastPart.match(/^(\w+)\[(\d+)\]$/);
  if (lastMatch) {
    if (!current[lastMatch[1]]) current[lastMatch[1]] = [];
    current[lastMatch[1]][parseInt(lastMatch[2])] = value;
  } else {
    current[lastPart] = value;
  }
  
  return result;
}

function generateFieldId(path: string): string {
  return `field-${path.replace(/\./g, '-').replace(/\[/g, '-').replace(/\]/g, '')}`;
}

// =================================================================
// HOOK
// =================================================================

export function useReportState(): [ReportState, ReportStateActions] {
  const { state: wizardState } = useWizard();
  
  // Store a snapshot of wizard state at initial load for conflict detection
  const initialWizardSnapshot = useRef<any>(null);
  
  const [state, setState] = useState<ReportState>({
    isDirty: false,
    editedFields: {},
    conflicts: [],
    version: 1,
    lastSaved: null,
    lastWizardSync: new Date().toISOString(),
    sectionOrder: [],
    sectionVisibility: {},
    customContent: {},
    styling: {},
  });

  // Initialize wizard snapshot on first load
  useEffect(() => {
    if (!initialWizardSnapshot.current) {
      initialWizardSnapshot.current = JSON.parse(JSON.stringify(wizardState));
      setState(prev => ({
        ...prev,
        lastWizardSync: new Date().toISOString(),
      }));
    }
  }, [wizardState]);

  // Set field value (creates an edit record)
  const setFieldValue = useCallback((path: string, value: any, type: EditedField['type'] = 'text') => {
    const fieldId = generateFieldId(path);
    const originalValue = getValueAtPath(initialWizardSnapshot.current, path);
    
    setState(prev => {
      const existingEdit = prev.editedFields[fieldId];
      
      // If reverting to original value, remove the edit
      if (JSON.stringify(value) === JSON.stringify(originalValue)) {
        const { [fieldId]: removed, ...remainingEdits } = prev.editedFields;
        return {
          ...prev,
          isDirty: Object.keys(remainingEdits).length > 0,
          editedFields: remainingEdits,
        };
      }
      
      return {
        ...prev,
        isDirty: true,
        editedFields: {
          ...prev.editedFields,
          [fieldId]: {
            id: fieldId,
            path,
            originalValue: existingEdit?.originalValue ?? originalValue,
            editedValue: value,
            editedAt: new Date().toISOString(),
            type,
          },
        },
      };
    });
  }, []);

  // Revert a single field
  const revertField = useCallback((path: string) => {
    const fieldId = generateFieldId(path);
    setState(prev => {
      const { [fieldId]: removed, ...remainingEdits } = prev.editedFields;
      return {
        ...prev,
        isDirty: Object.keys(remainingEdits).length > 0,
        editedFields: remainingEdits,
      };
    });
  }, []);

  // Revert all fields
  const revertAllFields = useCallback(() => {
    setState(prev => ({
      ...prev,
      isDirty: false,
      editedFields: {},
      styling: {},
      customContent: {},
    }));
  }, []);

  // Set section visibility
  const setSectionVisibility = useCallback((sectionId: string, visible: boolean) => {
    setState(prev => ({
      ...prev,
      isDirty: true,
      sectionVisibility: {
        ...prev.sectionVisibility,
        [sectionId]: visible,
      },
    }));
  }, []);

  // Reorder sections
  const reorderSections = useCallback((newOrder: string[]) => {
    setState(prev => ({
      ...prev,
      isDirty: true,
      sectionOrder: newOrder,
    }));
  }, []);

  // Set element style
  const setElementStyle = useCallback((elementId: string, styles: React.CSSProperties) => {
    setState(prev => ({
      ...prev,
      isDirty: true,
      styling: {
        ...prev.styling,
        [elementId]: {
          ...prev.styling[elementId],
          ...styles,
        },
      },
    }));
  }, []);

  // Set custom content
  const setCustomContent = useCallback((key: string, content: any) => {
    setState(prev => ({
      ...prev,
      isDirty: true,
      customContent: {
        ...prev.customContent,
        [key]: content,
      },
    }));
  }, []);

  // Sync from wizard (update snapshot, detect conflicts)
  const syncFromWizard = useCallback(() => {
    const newSnapshot = JSON.parse(JSON.stringify(wizardState));
    const conflicts: ConflictInfo[] = [];
    
    // Check each edited field for conflicts
    Object.values(state.editedFields).forEach(edit => {
      const currentWizardValue = getValueAtPath(newSnapshot, edit.path);
      const originalWizardValue = getValueAtPath(initialWizardSnapshot.current, edit.path);
      
      // If wizard value has changed since we started editing
      if (JSON.stringify(currentWizardValue) !== JSON.stringify(originalWizardValue)) {
        // And it's different from our edit
        if (JSON.stringify(currentWizardValue) !== JSON.stringify(edit.editedValue)) {
          conflicts.push({
            fieldId: edit.id,
            path: edit.path,
            previewValue: edit.editedValue,
            wizardValue: currentWizardValue,
            originalValue: originalWizardValue,
            message: `Field at "${edit.path}" was modified in the wizard while you were editing.`,
          });
        }
      }
    });
    
    // Update snapshot and conflicts
    initialWizardSnapshot.current = newSnapshot;
    setState(prev => ({
      ...prev,
      conflicts,
      lastWizardSync: new Date().toISOString(),
    }));
    
    return conflicts;
  }, [wizardState, state.editedFields]);

  // Check for conflicts without updating snapshot
  const checkForConflicts = useCallback((): ConflictInfo[] => {
    const currentSnapshot = JSON.parse(JSON.stringify(wizardState));
    const conflicts: ConflictInfo[] = [];
    
    Object.values(state.editedFields).forEach(edit => {
      const currentWizardValue = getValueAtPath(currentSnapshot, edit.path);
      const originalWizardValue = getValueAtPath(initialWizardSnapshot.current, edit.path);
      
      if (JSON.stringify(currentWizardValue) !== JSON.stringify(originalWizardValue)) {
        if (JSON.stringify(currentWizardValue) !== JSON.stringify(edit.editedValue)) {
          conflicts.push({
            fieldId: edit.id,
            path: edit.path,
            previewValue: edit.editedValue,
            wizardValue: currentWizardValue,
            originalValue: originalWizardValue,
            message: `Conflict: "${edit.path}" was modified elsewhere.`,
          });
        }
      }
    });
    
    return conflicts;
  }, [wizardState, state.editedFields]);

  // Resolve a conflict
  const resolveConflict = useCallback((fieldId: string, resolution: 'keep-preview' | 'use-wizard') => {
    setState(prev => {
      const edit = prev.editedFields[fieldId];
      if (!edit) return prev;
      
      const conflict = prev.conflicts.find(c => c.fieldId === fieldId);
      if (!conflict) return prev;
      
      if (resolution === 'use-wizard') {
        // Remove the edit, accepting wizard value
        const { [fieldId]: removed, ...remainingEdits } = prev.editedFields;
        return {
          ...prev,
          editedFields: remainingEdits,
          conflicts: prev.conflicts.filter(c => c.fieldId !== fieldId),
          isDirty: Object.keys(remainingEdits).length > 0,
        };
      } else {
        // Keep preview value, update original to match current wizard
        // (so it won't conflict again)
        return {
          ...prev,
          editedFields: {
            ...prev.editedFields,
            [fieldId]: {
              ...edit,
              originalValue: conflict.wizardValue, // Update baseline
            },
          },
          conflicts: prev.conflicts.filter(c => c.fieldId !== fieldId),
        };
      }
    });
  }, []);

  // Mark as saved
  const markAsSaved = useCallback(() => {
    setState(prev => ({
      ...prev,
      isDirty: false,
      lastSaved: new Date().toISOString(),
      version: prev.version + 1,
    }));
  }, []);

  // Get field value (returns edited value if exists, otherwise wizard value)
  const getFieldValue = useCallback((path: string): any => {
    const fieldId = generateFieldId(path);
    const edit = state.editedFields[fieldId];
    if (edit) {
      return edit.editedValue;
    }
    return getValueAtPath(wizardState, path);
  }, [state.editedFields, wizardState]);

  // Check if a field has been edited
  const hasFieldBeenEdited = useCallback((path: string): boolean => {
    const fieldId = generateFieldId(path);
    return fieldId in state.editedFields;
  }, [state.editedFields]);

  const actions: ReportStateActions = useMemo(() => ({
    setFieldValue,
    revertField,
    revertAllFields,
    setSectionVisibility,
    reorderSections,
    setElementStyle,
    setCustomContent,
    syncFromWizard,
    checkForConflicts,
    resolveConflict,
    markAsSaved,
    getFieldValue,
    hasFieldBeenEdited,
  }), [
    setFieldValue,
    revertField,
    revertAllFields,
    setSectionVisibility,
    reorderSections,
    setElementStyle,
    setCustomContent,
    syncFromWizard,
    checkForConflicts,
    resolveConflict,
    markAsSaved,
    getFieldValue,
    hasFieldBeenEdited,
  ]);

  return [state, actions];
}

export default useReportState;

