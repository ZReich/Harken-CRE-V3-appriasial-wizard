import React from 'react';
import { X, Star, FileCheck, ArrowLeft, CheckCircle } from 'lucide-react';

interface PostSaveDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveAsTemplate: () => void;
  onFinalize: () => void;
  onContinueEditing: () => void;
}

export const PostSaveDialog: React.FC<PostSaveDialogProps> = ({
  isOpen,
  onClose,
  onSaveAsTemplate,
  onFinalize,
  onContinueEditing,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-surface-1 dark:bg-elevation-1 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-light-border dark:border-dark-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent-teal-mint-light rounded-lg flex items-center justify-center">
              <CheckCircle className="text-accent-teal-mint" size={20} />
            </div>
            <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Report Saved Successfully</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-surface-3 dark:hover:bg-elevation-subtle rounded-lg transition-colors"
          >
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-center gap-2 text-accent-teal-mint mb-6">
            <CheckCircle size={18} />
            <span className="font-medium">Your changes have been saved.</span>
          </div>

          <p className="text-slate-600 mb-6">
            What would you like to do next?
          </p>

          {/* Options */}
          <div className="space-y-3">
            <button
              onClick={onSaveAsTemplate}
              className="w-full flex items-start gap-4 p-4 border border-light-border dark:border-dark-border rounded-lg hover:border-accent-amber-gold hover:bg-accent-amber-gold-light transition-colors text-left"
            >
              <div className="w-10 h-10 bg-accent-amber-gold-light rounded-lg flex items-center justify-center flex-shrink-0">
                <Star className="text-accent-amber-gold" size={20} />
              </div>
              <div>
                <h4 className="font-medium text-slate-800 dark:text-white">Save as Template</h4>
                <p className="text-sm text-slate-500 mt-0.5">
                  Save this report structure for future use. Great for similar property types.
                </p>
              </div>
            </button>

            <button
              onClick={onFinalize}
              className="w-full flex items-start gap-4 p-4 border-2 border-sky-500 rounded-lg hover:bg-sky-50 transition-colors text-left"
            >
              <div className="w-10 h-10 bg-sky-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileCheck className="text-sky-600" size={20} />
              </div>
              <div>
                <h4 className="font-medium text-slate-800 dark:text-white">Create Final Report</h4>
                <p className="text-sm text-slate-500 mt-0.5">
                  Generate the PDF and finalize this appraisal.
                </p>
              </div>
            </button>

            <button
              onClick={onContinueEditing}
              className="w-full flex items-start gap-4 p-4 border border-light-border dark:border-dark-border rounded-lg hover:border-border-muted dark:hover:border-dark-border-muted hover:bg-surface-2 dark:bg-elevation-2 transition-colors text-left"
            >
              <div className="w-10 h-10 bg-surface-3 dark:bg-elevation-subtle rounded-lg flex items-center justify-center flex-shrink-0">
                <ArrowLeft className="text-slate-600" size={20} />
              </div>
              <div>
                <h4 className="font-medium text-slate-800 dark:text-white">Continue Editing</h4>
                <p className="text-sm text-slate-500 mt-0.5">
                  Go back to the report editor.
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostSaveDialog;

