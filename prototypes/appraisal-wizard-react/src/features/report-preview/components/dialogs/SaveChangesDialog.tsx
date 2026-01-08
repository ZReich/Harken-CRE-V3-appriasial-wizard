import React from 'react';
import { X, Save, Copy, RotateCcw, AlertCircle } from 'lucide-react';

interface SaveChangesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
  onSaveAsCopy: () => void;
  onDiscard: () => void;
  changes?: ChangeItem[];
}

interface ChangeItem {
  type: string;
  description: string;
}

export const SaveChangesDialog: React.FC<SaveChangesDialogProps> = ({
  isOpen,
  onClose,
  onUpdate,
  onSaveAsCopy,
  onDiscard,
  changes = [],
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-surface-1 dark:bg-elevation-1 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-light-border dark:border-dark-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent-amber-gold-light rounded-lg flex items-center justify-center">
              <AlertCircle className="text-accent-amber-gold" size={20} />
            </div>
            <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Save Changes</h2>
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
          <p className="text-slate-600 mb-4">
            You have unsaved changes in the report editor.
          </p>

          {/* Changes list */}
          {changes.length > 0 && (
            <div className="bg-surface-2 dark:bg-elevation-2 rounded-lg p-4 mb-6 border border-light-border dark:border-dark-border">
              <h4 className="text-sm font-medium text-slate-700 mb-2">Changes made:</h4>
              <ul className="space-y-1 text-sm text-slate-600">
                {changes.map((change, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-slate-400">•</span>
                    {change.description}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <p className="text-sm text-slate-500 mb-6">
            How would you like to proceed?
          </p>

          {/* Options */}
          <div className="space-y-3">
            <button
              onClick={onUpdate}
              className="w-full flex items-start gap-4 p-4 border border-light-border dark:border-dark-border rounded-lg hover:border-sky-300 hover:bg-sky-50 transition-colors text-left"
            >
              <div className="w-10 h-10 bg-sky-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Save className="text-sky-600" size={20} />
              </div>
              <div>
                <h4 className="font-medium text-slate-800 dark:text-white">Update Report</h4>
                <p className="text-sm text-slate-500 mt-0.5">
                  Apply these changes to the appraisal record. This updates the source data for future edits.
                </p>
              </div>
            </button>

            <button
              onClick={onSaveAsCopy}
              className="w-full flex items-start gap-4 p-4 border border-light-border dark:border-dark-border rounded-lg hover:border-border-muted dark:hover:border-dark-border-muted hover:bg-surface-2 dark:bg-elevation-2 transition-colors text-left"
            >
              <div className="w-10 h-10 bg-surface-3 dark:bg-elevation-subtle rounded-lg flex items-center justify-center flex-shrink-0">
                <Copy className="text-slate-600" size={20} />
              </div>
              <div>
                <h4 className="font-medium text-slate-800 dark:text-white">Save as Copy</h4>
                <p className="text-sm text-slate-500 mt-0.5">
                  Create a new version with these changes. Original report remains unchanged.
                </p>
              </div>
            </button>

            <button
              onClick={onDiscard}
              className="w-full flex items-start gap-4 p-4 border border-light-border dark:border-dark-border rounded-lg hover:border-harken-error/20 hover:bg-accent-red-light transition-colors text-left"
            >
              <div className="w-10 h-10 bg-accent-red-light rounded-lg flex items-center justify-center flex-shrink-0">
                <RotateCcw className="text-harken-error" size={20} />
              </div>
              <div>
                <h4 className="font-medium text-slate-800 dark:text-white">Discard Changes</h4>
                <p className="text-sm text-slate-500 mt-0.5">
                  Revert to the original data from the wizard.
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end px-6 py-4 border-t border-light-border dark:border-dark-border bg-surface-2 dark:bg-elevation-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:bg-surface-4 dark:hover:bg-elevation-muted rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default SaveChangesDialog;

