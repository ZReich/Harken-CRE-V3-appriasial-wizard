import { X, BookOpen, ExternalLink, CheckCircle } from 'lucide-react';
import { uspapDetails } from '../constants/uspapDetails';

interface USPAPDetailModalProps {
  reference: string;
  isOpen: boolean;
  onClose: () => void;
  themeColor?: string;
}

export default function USPAPDetailModal({
  reference,
  isOpen,
  onClose,
  themeColor = 'var(--harken-blue)',
}: USPAPDetailModalProps) {
  if (!isOpen) return null;

  const detail = uspapDetails[reference];

  if (!detail) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
        <div className="bg-surface-1 dark:bg-elevation-1 rounded-2xl shadow-xl max-w-xl w-full mx-4 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-harken-dark dark:text-white">USPAP Reference</h3>
            <button onClick={onClose} className="text-harken-gray-med hover:text-harken-gray">
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-harken-gray">Details for {reference} are not yet available.</p>
          <div className="flex justify-end mt-6">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-lg text-white font-medium"
              style={{ backgroundColor: themeColor }}
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div 
        className="bg-surface-1 dark:bg-elevation-1 rounded-2xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-harken-gray-light">
          <div className="flex items-center gap-4">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${themeColor}15` }}
            >
              <BookOpen className="w-6 h-6" style={{ color: themeColor }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-harken-dark dark:text-white">{reference}</h3>
                <span 
                  className="px-2 py-0.5 rounded text-xs font-medium"
                  style={{ 
                    backgroundColor: `${themeColor}15`,
                    color: themeColor 
                  }}
                >
                  {detail.type}
                </span>
              </div>
              <p className="text-sm text-harken-gray-med dark:text-slate-400">{detail.title}</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-harken-gray-med hover:text-harken-gray p-1 hover:bg-harken-gray-light rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Official Standard Text */}
          {detail.officialText && (
            <div className="bg-harken-gray-light rounded-xl p-5">
              <p className="text-xs font-semibold text-harken-gray-med uppercase tracking-wider mb-3">
                Official Standard Text
              </p>
              <p className="text-sm text-harken-gray italic leading-relaxed">
                "{detail.officialText}"
              </p>
            </div>
          )}

          {/* What This Means */}
          <div 
            className="rounded-xl p-5 border-l-4"
            style={{ 
              backgroundColor: `${themeColor}08`,
              borderLeftColor: themeColor 
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-4 h-4" style={{ color: themeColor }} />
              <p 
                className="text-xs font-bold uppercase tracking-wider"
                style={{ color: themeColor }}
              >
                What This Means
              </p>
            </div>
            <p className="text-sm text-harken-gray leading-relaxed">
              {detail.explanation}
            </p>
          </div>

          {/* How to Comply */}
          {detail.compliance && detail.compliance.length > 0 && (
            <div className="rounded-xl p-5 border-l-4 bg-accent-teal-mint-light/50" style={{ borderLeftColor: '#22c55e' }}>
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-4 h-4 text-accent-teal-mint" />
                <p className="text-xs font-bold uppercase tracking-wider text-accent-teal-mint">
                  How to Comply
                </p>
              </div>
              <ul className="space-y-2">
                {detail.compliance.map((item, index) => (
                  <li key={index} className="flex items-start gap-3 text-sm text-harken-gray">
                    <span 
                      className="w-5 h-5 rounded flex items-center justify-center text-xs font-semibold shrink-0"
                      style={{ backgroundColor: `${themeColor}20`, color: themeColor }}
                    >
                      {index + 1}
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Related Standards */}
          {detail.relatedStandards && detail.relatedStandards.length > 0 && (
            <div className="rounded-xl p-5 border-l-4 bg-accent-amber-gold-light/50" style={{ borderLeftColor: '#f2b705' }}>
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-4 h-4 text-accent-amber-gold" />
                <p className="text-xs font-bold uppercase tracking-wider text-accent-amber-gold">
                  Related Standards
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {detail.relatedStandards.map((standard, index) => (
                  <span 
                    key={index}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-surface-1 border border-light-border text-accent-amber-gold"
                  >
                    <BookOpen className="w-3 h-3" />
                    {standard}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-harken-gray-light bg-harken-gray-light/50">
          <a
            href="https://www.appraisalfoundation.org/imis/TAF/Standards/USPAP/TAF/USPAP.aspx"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-harken-gray-med hover:text-harken-dark transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Full USPAP Documentation
          </a>
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-lg text-white font-medium transition-opacity hover:opacity-90"
            style={{ backgroundColor: themeColor }}
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
