import { useState, useCallback, useMemo } from 'react';
import { useWizard } from '../../../context/WizardContext';
import { TemplateFormData } from '../components/dialogs/TemplateSaveDialog';
import { downloadPDF, printToPDF, isPDFExportSupported } from '../utils/pdfExporter';
import { saveTemplate as saveTemplateToStorage } from '../utils/templateStorage';

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
// OPTIONS INTERFACE
// =================================================================

export interface FinalizeFlowOptions {
  /** External isDirty state from report editor */
  isDirty?: boolean;
  /** Callback to save changes - will be called when saveChanges action is triggered */
  onSave?: () => Promise<void>;
  /** Callback to get current report state for template saving */
  getReportState?: () => {
    sectionVisibility: Record<string, boolean>;
    sectionOrder: string[];
    styling: Record<string, React.CSSProperties>;
    customContent: Record<string, unknown>;
    editedFields: Record<string, { path: string; editedValue: unknown }>;
  } | null;
}

// =================================================================
// HOOK
// =================================================================

export function useFinalizeFlow(options?: FinalizeFlowOptions): [FinalizeFlowState, FinalizeFlowActions] {
  useWizard(); // Access context for potential future use
  
  const [state, setState] = useState<FinalizeFlowState>({
    stage: 'idle',
    hasUnsavedChanges: false,
    isProcessing: false,
    error: null,
    generatedPdfUrl: null,
    savedTemplateId: null,
  });

  // Check for unsaved changes - use external isDirty if provided
  const checkForUnsavedChanges = useCallback((): boolean => {
    // Use external isDirty state if provided, otherwise fall back to internal state
    return options?.isDirty ?? state.hasUnsavedChanges;
  }, [options?.isDirty, state.hasUnsavedChanges]);

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
      // Use provided onSave callback if available
      if (options?.onSave) {
        await options.onSave();
      } else {
        // Fallback simulation for development
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
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
  }, [options?.onSave]);

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
  const saveAsTemplate = useCallback(async (data: TemplateFormData) => {
    setState(prev => ({ ...prev, stage: 'saving-template', isProcessing: true }));
    
    try {
      // Get current report state for template content using provided callback
      const reportState = options?.getReportState?.();
      const templateContent = {
        sectionVisibility: reportState?.sectionVisibility ?? {},
        sectionOrder: reportState?.sectionOrder ?? [],
        styling: reportState?.styling ?? {},
        customContent: reportState?.customContent ?? {},
        editedFields: reportState?.editedFields ?? {},
      };
      
      // Save to IndexedDB with actual content
      const templateId = await saveTemplateToStorage(data, templateContent);
      
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
  }, [options?.getReportState]);

  // Skip template save
  const skipTemplate = useCallback(() => {
    setState(prev => ({ ...prev, stage: 'finalize-dialog' }));
  }, []);

  // Confirm and execute finalize
  const confirmFinalize = useCallback(async () => {
    setState(prev => ({ ...prev, stage: 'generating', isProcessing: true }));
    
    try {
      // Check if html2pdf is available
      const support = isPDFExportSupported();
      
      // Find the report preview element
      const reportElement = document.querySelector('.report-preview-content') as HTMLElement | null;
      
      if (support.clientSide && reportElement) {
        try {
          // Generate PDF using html2pdf.js
          await downloadPDF(reportElement, {
            filename: `appraisal-report-${Date.now()}.pdf`,
            pageSize: 'letter',
            orientation: 'portrait',
            quality: 'high',
          });
          
          setState(prev => ({
            ...prev,
            stage: 'complete',
            isProcessing: false,
            generatedPdfUrl: 'downloaded', // PDF was downloaded directly
          }));
        } catch (html2pdfError) {
          // html2canvas/html2pdf may fail with unsupported CSS features like oklch colors
          // Fall back to print-to-PDF
          if (support.print) {
            try {
              printToPDF(reportElement);
              setState(prev => ({
                ...prev,
                stage: 'complete',
                isProcessing: false,
                generatedPdfUrl: 'printed', // Used print dialog as fallback
              }));
            } catch (printError) {
              // Print fallback also failed (e.g., popup blocked)
              throw printError;
            }
          } else {
            throw html2pdfError; // Re-throw if no fallback available
          }
        }
      } else if (support.print) {
        // Fallback to print dialog
        printToPDF(reportElement || undefined);
        
        setState(prev => ({
          ...prev,
          stage: 'complete',
          isProcessing: false,
          generatedPdfUrl: 'printed', // Used print dialog
        }));
      } else {
        throw new Error('PDF generation is not supported in this browser. Please try Chrome or Firefox.');
      }
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

  // Memoize actions object to prevent unnecessary re-renders and infinite loops
  // when this object is used in dependency arrays
  const actions: FinalizeFlowActions = useMemo(() => ({
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
  }), [
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
  ]);

  return [state, actions];
}

export default useFinalizeFlow;

