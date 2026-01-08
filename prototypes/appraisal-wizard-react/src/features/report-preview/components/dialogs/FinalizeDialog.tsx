import React, { useState } from 'react';
import { X, FileCheck, CheckCircle, Loader2, AlertCircle, Printer } from 'lucide-react';

type FinalizeStep = 'confirm' | 'processing' | 'complete' | 'error';
type CompletionMethod = 'downloaded' | 'printed' | null;

interface FinalizeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onFinalize: () => Promise<void>;
  reportTitle: string;
  hasUnsavedChanges: boolean;
  onSaveFirst: () => void;
}

export const FinalizeDialog: React.FC<FinalizeDialogProps> = ({
  isOpen,
  onClose,
  onFinalize,
  reportTitle,
  hasUnsavedChanges,
  onSaveFirst,
}) => {
  const [step, setStep] = useState<FinalizeStep>('confirm');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  // Track how PDF was generated (downloaded directly vs print dialog)
  const [completionMethod, setCompletionMethod] = useState<CompletionMethod>(null);
  
  if (!isOpen) return null;

  const handleFinalize = async () => {
    setStep('processing');
    setProgress(0);
    setError(null);
    setCompletionMethod(null);

    try {
      // Simulate progress steps for visual feedback
      const progressSteps = [
        { percent: 10, delay: 200 },
        { percent: 30, delay: 300 },
        { percent: 50, delay: 300 },
        { percent: 70, delay: 400 },
        { percent: 90, delay: 300 },
      ];

      for (const step of progressSteps) {
        await new Promise(resolve => setTimeout(resolve, step.delay));
        setProgress(step.percent);
      }

      // Call the actual finalize function (triggers PDF download)
      await onFinalize();
      
      setProgress(100);
      // PDF was downloaded directly to user's device
      setCompletionMethod('downloaded');
      setStep('complete');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate report';
      // Check if it was a successful print dialog fallback (not a popup blocked error)
      if (errorMessage === 'printed') {
        setCompletionMethod('printed');
        setStep('complete');
      } else {
        setError(errorMessage);
        setStep('error');
      }
    }
  };

  const handleClose = () => {
    setStep('confirm');
    setProgress(0);
    setError(null);
    setCompletionMethod(null);
    onClose();
  };

  const renderConfirmStep = () => (
    <>
      <div className="p-6">
        {hasUnsavedChanges && (
          <div className="bg-accent-amber-gold-light border border-accent-amber-gold rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="text-accent-amber-gold flex-shrink-0 mt-0.5" size={20} />
            <div>
              <h4 className="font-medium text-accent-amber-gold">Unsaved Changes</h4>
              <p className="text-sm text-accent-amber-gold mt-1">
                You have unsaved changes. Would you like to save them before creating the final report?
              </p>
              <button
                onClick={onSaveFirst}
                className="mt-2 px-3 py-1.5 bg-accent-amber-gold text-white rounded text-sm font-medium hover:bg-accent-amber-gold/90"
              >
                Save Changes First
              </button>
            </div>
          </div>
        )}

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileCheck className="text-sky-600" size={32} />
          </div>
          <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">Ready to Finalize</h3>
          <p className="text-slate-600">
            Create the final PDF report for <strong>{reportTitle}</strong>
          </p>
        </div>

        <div className="bg-surface-2 dark:bg-elevation-2 rounded-lg p-4 mb-6">
          <h4 className="font-medium text-slate-700 mb-3">This will:</h4>
          <ul className="space-y-2 text-sm text-harken-gray">
            <li className="flex items-center gap-2">
              <CheckCircle size={16} className="text-accent-teal-mint" />
              Generate a professional PDF report
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle size={16} className="text-accent-teal-mint" />
              Lock in all current data and formatting
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle size={16} className="text-accent-teal-mint" />
              Create a downloadable file for delivery
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle size={16} className="text-accent-teal-mint" />
              Save this version to your report history
            </li>
          </ul>
        </div>

        <p className="text-xs text-slate-500 text-center">
          You can always generate a new version later if needed.
        </p>
      </div>

      <div className="flex justify-end gap-3 px-6 py-4 border-t border-light-border dark:border-dark-border bg-surface-2 dark:bg-elevation-2">
        <button
          onClick={handleClose}
          className="px-4 py-2 text-slate-600 hover:bg-surface-4 dark:hover:bg-elevation-muted rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleFinalize}
          className="px-6 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors font-medium flex items-center gap-2"
        >
          <FileCheck size={18} />
          Create Final Report
        </button>
      </div>
    </>
  );

  const renderProcessingStep = () => (
    <div className="p-8 text-center">
      <div className="w-20 h-20 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <Loader2 className="text-sky-600 animate-spin" size={40} />
      </div>
      
      <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">Generating Report</h3>
      <p className="text-slate-600 mb-6">Please wait while we create your PDF...</p>
      
      <div className="max-w-md mx-auto">
        <div className="h-2 bg-surface-4 dark:bg-elevation-muted rounded-full overflow-hidden mb-2">
          <div
            className="h-full bg-sky-500 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-sm text-slate-500">{progress}% complete</p>
      </div>
    </div>
  );

  const renderCompleteStep = () => (
    <>
      <div className="p-8 text-center">
        <div className="w-20 h-20 bg-accent-teal-mint-light rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="text-accent-teal-mint" size={40} />
        </div>
        
        <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">Report Generated!</h3>
        
        {completionMethod === 'downloaded' ? (
          <>
            <p className="text-slate-600 mb-6">
              Your PDF has been downloaded to your device. Check your downloads folder for the file.
            </p>
            <div className="bg-accent-teal-mint-light border border-accent-teal-mint rounded-lg p-4 mb-4 text-left">
              <p className="text-sm text-accent-teal-mint flex items-center gap-2">
                <CheckCircle size={16} />
                PDF saved to your Downloads folder
              </p>
            </div>
          </>
        ) : completionMethod === 'printed' ? (
          <>
            <p className="text-slate-600 mb-6">
              The print dialog was opened to save your report. If you cancelled the dialog, you can try again.
            </p>
            <div className="bg-accent-amber-gold-light border border-accent-amber-gold rounded-lg p-4 mb-4 text-left">
              <p className="text-sm text-accent-amber-gold flex items-center gap-2">
                <Printer size={16} />
                Use "Save as PDF" in the print dialog to download
              </p>
            </div>
          </>
        ) : (
          <p className="text-slate-600 mb-6">
            Your appraisal report has been successfully created.
          </p>
        )}
        
        <button
          onClick={handleFinalize}
          className="px-6 py-3 bg-surface-3 dark:bg-elevation-subtle text-slate-700 rounded-lg hover:bg-surface-4 dark:hover:bg-elevation-muted transition-colors font-medium flex items-center justify-center gap-2 mx-auto"
        >
          Generate Another Copy
        </button>
      </div>

      <div className="flex justify-center px-6 py-4 border-t border-light-border dark:border-dark-border bg-surface-2 dark:bg-elevation-2">
        <button
          onClick={handleClose}
          className="px-4 py-2 text-slate-600 hover:bg-surface-4 dark:hover:bg-elevation-muted rounded-lg transition-colors"
        >
          Close
        </button>
      </div>
    </>
  );

  const renderErrorStep = () => (
    <>
      <div className="p-8 text-center">
        <div className="w-20 h-20 bg-accent-red-light rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="text-harken-error" size={40} />
        </div>
        
        <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">Generation Failed</h3>
        <p className="text-slate-600 mb-4">
          We encountered an error while creating your report.
        </p>
        
        <div className="bg-accent-red-light border border-harken-error/20 rounded-lg p-4 mb-6 text-left">
          <p className="text-sm text-harken-error">{error}</p>
        </div>
      </div>

      <div className="flex justify-end gap-3 px-6 py-4 border-t border-light-border dark:border-dark-border bg-surface-2 dark:bg-elevation-2">
        <button
          onClick={handleClose}
          className="px-4 py-2 text-slate-600 hover:bg-surface-4 dark:hover:bg-elevation-muted rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={() => setStep('confirm')}
          className="px-6 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors font-medium"
        >
          Try Again
        </button>
      </div>
    </>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-surface-1 dark:bg-elevation-1 rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-light-border dark:border-dark-border">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
            {step === 'confirm' && 'Finalize Report'}
            {step === 'processing' && 'Generating...'}
            {step === 'complete' && 'Success!'}
            {step === 'error' && 'Error'}
          </h2>
          {step !== 'processing' && (
            <button
              onClick={handleClose}
              className="p-2 hover:bg-surface-3 dark:hover:bg-elevation-subtle rounded-lg transition-colors"
            >
              <X size={20} className="text-slate-400" />
            </button>
          )}
        </div>

        {/* Content */}
        {step === 'confirm' && renderConfirmStep()}
        {step === 'processing' && renderProcessingStep()}
        {step === 'complete' && renderCompleteStep()}
        {step === 'error' && renderErrorStep()}
      </div>
    </div>
  );
};

export default FinalizeDialog;

