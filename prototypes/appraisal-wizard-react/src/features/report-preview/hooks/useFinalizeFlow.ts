import { useState, useCallback } from 'react';
import { useWizard } from '../../../context/WizardContext';
import { TemplateFormData } from '../components/dialogs/TemplateSaveDialog';

// =================================================================
// TYPES
// =================================================================

export type FlowStage = 
  | 'idle'
  | 'check-changes'      // Check for unsaved changes
  | 'save-dialog'        // Show save dialog
  | 'saving'             // Saving in progress
  | 'post-save'          // Post-save options
  | 'template-dialog'    // Template save dialog
  | 'saving-template'    // Saving template
  | 'finalize-dialog'    // Finalize confirmation
  | 'generating'         // PDF generation in progress
  | 'complete'           // Success
  | 'error';             // Error state

export interface FinalizeFlowState {
  stage: FlowStage;
  hasUnsavedChanges: boolean;
  isProcessing: boolean;
  error: string | null;
  generatedPdfUrl: string | null;
  savedTemplateId: string | null;
}

export interface FinalizeFlowActions {
  // Start the finalize process
  startFinalize: () => void;
  
  // Save flow actions
  saveChanges: () => Promise<void>;
  saveAsCopy: () => Promise<void>;
  discardChanges: () => void;
  
  // Post-save actions
  openTemplateDialog: () => void;
  proceedToFinalize: () => void;
  continueEditing: () => void;
  
  // Template actions
  saveAsTemplate: (data: TemplateFormData) => Promise<void>;
  skipTemplate: () => void;
  
  // Finalize actions
  confirmFinalize: () => Promise<void>;
  cancelFinalize: () => void;
  
  // Error handling
  retry: () => void;
  dismiss: () => void;
  
  // Navigation
  goBack: () => void;
  reset: () => void;
}

// =================================================================
// HOOK
// =================================================================

export function useFinalizeFlow(): [FinalizeFlowState, FinalizeFlowActions] {
  useWizard(); // Access context for potential future use
  
  const [state, setState] = useState<FinalizeFlowState>({
    stage: 'idle',
    hasUnsavedChanges: false,
    isProcessing: false,
    error: null,
    generatedPdfUrl: null,
    savedTemplateId: null,
  });

  // Check for unsaved changes (would integrate with useReportState)
  const checkForUnsavedChanges = useCallback((): boolean => {
    // In real implementation, this would check useReportState's isDirty
    return state.hasUnsavedChanges;
  }, [state.hasUnsavedChanges]);

  // Start the finalize process
  const startFinalize = useCallback(() => {
    const hasChanges = checkForUnsavedChanges();
    
    if (hasChanges) {
      setState(prev => ({ ...prev, stage: 'save-dialog', hasUnsavedChanges: true }));
    } else {
      setState(prev => ({ ...prev, stage: 'finalize-dialog' }));
    }
  }, [checkForUnsavedChanges]);

  // Save changes to the actual report
  const saveChanges = useCallback(async () => {
    setState(prev => ({ ...prev, stage: 'saving', isProcessing: true }));
    
    try {
      // Simulate API call to save changes
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In real implementation, would dispatch to update wizard state
      // dispatch({ type: 'APPLY_PREVIEW_EDITS', payload: previewEdits });
      
      setState(prev => ({
        ...prev,
        stage: 'post-save',
        isProcessing: false,
        hasUnsavedChanges: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        stage: 'error',
        isProcessing: false,
        error: error instanceof Error ? error.message : 'Failed to save changes',
      }));
    }
  }, []);

  // Save as a copy (new appraisal version)
  const saveAsCopy = useCallback(async () => {
    setState(prev => ({ ...prev, stage: 'saving', isProcessing: true }));
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Would create a new appraisal copy
      
      setState(prev => ({
        ...prev,
        stage: 'post-save',
        isProcessing: false,
        hasUnsavedChanges: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        stage: 'error',
        isProcessing: false,
        error: error instanceof Error ? error.message : 'Failed to save copy',
      }));
    }
  }, []);

  // Discard changes and proceed
  const discardChanges = useCallback(() => {
    setState(prev => ({
      ...prev,
      stage: 'finalize-dialog',
      hasUnsavedChanges: false,
    }));
  }, []);

  // Open template dialog
  const openTemplateDialog = useCallback(() => {
    setState(prev => ({ ...prev, stage: 'template-dialog' }));
  }, []);

  // Proceed directly to finalize
  const proceedToFinalize = useCallback(() => {
    setState(prev => ({ ...prev, stage: 'finalize-dialog' }));
  }, []);

  // Continue editing (close flow)
  const continueEditing = useCallback(() => {
    setState(prev => ({ ...prev, stage: 'idle' }));
  }, []);

  // Save as template
  const saveAsTemplate = useCallback(async (_data: TemplateFormData) => {
    setState(prev => ({ ...prev, stage: 'saving-template', isProcessing: true }));
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In real implementation, would save template to backend
      const templateId = `template-${Date.now()}`;
      
      setState(prev => ({
        ...prev,
        stage: 'finalize-dialog',
        isProcessing: false,
        savedTemplateId: templateId,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        stage: 'error',
        isProcessing: false,
        error: error instanceof Error ? error.message : 'Failed to save template',
      }));
    }
  }, []);

  // Skip template save
  const skipTemplate = useCallback(() => {
    setState(prev => ({ ...prev, stage: 'finalize-dialog' }));
  }, []);

  // Confirm and execute finalize
  const confirmFinalize = useCallback(async () => {
    setState(prev => ({ ...prev, stage: 'generating', isProcessing: true }));
    
    try {
      // Simulate PDF generation
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // In real implementation, would call backend PDF generation
      const pdfUrl = '/generated/report.pdf';
      
      setState(prev => ({
        ...prev,
        stage: 'complete',
        isProcessing: false,
        generatedPdfUrl: pdfUrl,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        stage: 'error',
        isProcessing: false,
        error: error instanceof Error ? error.message : 'Failed to generate PDF',
      }));
    }
  }, []);

  // Cancel finalize
  const cancelFinalize = useCallback(() => {
    setState(prev => ({ ...prev, stage: 'idle' }));
  }, []);

  // Retry after error
  const retry = useCallback(() => {
    // Go back to the appropriate stage based on what failed
    setState(prev => ({
      ...prev,
      stage: 'finalize-dialog',
      error: null,
    }));
  }, []);

  // Dismiss error and go to idle
  const dismiss = useCallback(() => {
    setState(prev => ({
      ...prev,
      stage: 'idle',
      error: null,
    }));
  }, []);

  // Go back one step in the flow
  const goBack = useCallback(() => {
    setState(prev => {
      switch (prev.stage) {
        case 'save-dialog':
          return { ...prev, stage: 'idle' };
        case 'post-save':
          return { ...prev, stage: 'save-dialog' };
        case 'template-dialog':
          return { ...prev, stage: 'post-save' };
        case 'finalize-dialog':
          return { ...prev, stage: prev.savedTemplateId ? 'idle' : 'post-save' };
        default:
          return { ...prev, stage: 'idle' };
      }
    });
  }, []);

  // Reset the entire flow
  const reset = useCallback(() => {
    setState({
      stage: 'idle',
      hasUnsavedChanges: false,
      isProcessing: false,
      error: null,
      generatedPdfUrl: null,
      savedTemplateId: null,
    });
  }, []);

  const actions: FinalizeFlowActions = {
    startFinalize,
    saveChanges,
    saveAsCopy,
    discardChanges,
    openTemplateDialog,
    proceedToFinalize,
    continueEditing,
    saveAsTemplate,
    skipTemplate,
    confirmFinalize,
    cancelFinalize,
    retry,
    dismiss,
    goBack,
    reset,
  };

  return [state, actions];
}

export default useFinalizeFlow;

