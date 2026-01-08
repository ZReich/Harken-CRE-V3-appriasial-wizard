import React from 'react';
import { X, RotateCcw, Clock, Trash2, AlertTriangle } from 'lucide-react';
import { SavedVersion } from '../../hooks/useAutoSave';

interface RecoveryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  versions: SavedVersion[];
  onRecover: (versionId: string) => void;
  onDelete: (versionId: string) => void;
  onDismiss: () => void;
}

export const RecoveryDialog: React.FC<RecoveryDialogProps> = ({
  isOpen,
  onClose,
  versions,
  onRecover,
  onDelete,
  onDismiss,
}) => {
  if (!isOpen) return null;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  // Sort versions by timestamp, newest first
  const sortedVersions = [...versions].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-surface-1 dark:bg-elevation-1 rounded-xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-accent-amber-gold-light">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent-amber-gold-light rounded-lg flex items-center justify-center">
              <AlertTriangle className="text-accent-amber-gold" size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Unsaved Work Found</h2>
              <p className="text-sm text-slate-600">Would you like to recover your previous session?</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-accent-amber-gold-light rounded-lg transition-colors"
          >
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[50vh]">
          <p className="text-sm text-slate-600 mb-4">
            We found {versions.length} auto-saved version{versions.length > 1 ? 's' : ''} of your report.
            Select one to recover:
          </p>

          <div className="space-y-3">
            {sortedVersions.map((version, index) => (
              <div
                key={version.id}
                className={`border rounded-lg p-4 transition-colors ${
                  index === 0
                    ? 'border-accent-amber-gold bg-accent-amber-gold-light'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Clock size={16} className="text-slate-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-800 dark:text-white">
                          {formatDate(version.timestamp)}
                        </span>
                        {index === 0 && (
                          <span className="text-[10px] px-2 py-0.5 bg-accent-amber-gold-light text-accent-amber-gold rounded-full font-medium">
                            LATEST
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500">{getTimeAgo(version.timestamp)}</p>
                      <p className="text-xs text-slate-400 mt-1">{version.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onRecover(version.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-500 text-white rounded-lg text-sm font-medium hover:bg-sky-600 transition-colors"
                    >
                      <RotateCcw size={14} />
                      Recover
                    </button>
                    <button
                      onClick={() => onDelete(version.id)}
                      className="p-1.5 text-slate-400 hover:text-harken-error hover:bg-accent-red-light rounded-lg transition-colors"
                      title="Delete this version"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center px-6 py-4 border-t border-slate-200 bg-slate-50">
          <button
            onClick={onDismiss}
            className="text-sm text-slate-500 hover:text-slate-700"
          >
            Don't show this again for this report
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Start Fresh
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecoveryDialog;

