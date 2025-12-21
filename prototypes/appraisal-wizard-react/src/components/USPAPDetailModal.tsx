import { X, BookOpen, CheckCircle, AlertTriangle, ExternalLink } from 'lucide-react';
import { useEffect } from 'react';

export interface USPAPDetail {
  id: string;
  reference: string; // e.g., "SR 1-3(b)"
  title: string;
  fullText: string;
  plainLanguage: string;
  howToComply: string[];
  relatedStandards?: string[];
  category: 'standards-rule' | 'ethics' | 'advisory' | 'definitions';
}

interface USPAPDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  detail: USPAPDetail | null;
  themeAccent?: string;
}

export default function USPAPDetailModal({
  isOpen,
  onClose,
  detail,
  themeAccent = '#0da1c7',
}: USPAPDetailModalProps) {
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !detail) return null;

  const getCategoryBadge = () => {
    switch (detail.category) {
      case 'standards-rule':
        return { label: 'Standards Rule', bg: 'bg-blue-100', text: 'text-blue-800' };
      case 'ethics':
        return { label: 'Ethics Rule', bg: 'bg-purple-100', text: 'text-purple-800' };
      case 'advisory':
        return { label: 'Advisory Opinion', bg: 'bg-amber-100', text: 'text-amber-800' };
      case 'definitions':
        return { label: 'Definition', bg: 'bg-gray-100', text: 'text-gray-800' };
      default:
        return { label: 'USPAP', bg: 'bg-gray-100', text: 'text-gray-800' };
    }
  };

  const badge = getCategoryBadge();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[85vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div
          className="px-6 py-4 border-b border-gray-200"
          style={{ background: `linear-gradient(to right, ${themeAccent}10, transparent)` }}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${themeAccent}20` }}
              >
                <BookOpen className="w-5 h-5" style={{ color: themeAccent }} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-gray-900">{detail.reference}</h2>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${badge.bg} ${badge.text}`}>
                    {badge.label}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{detail.title}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-5 overflow-y-auto max-h-[calc(85vh-140px)] space-y-5">
          {/* Full Standard Text */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Official Standard Text
            </h3>
            <p className="text-sm text-slate-800 leading-relaxed italic">
              "{detail.fullText}"
            </p>
          </div>

          {/* Plain Language Explanation */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-semibold text-blue-800 uppercase tracking-wider">
                What This Means
              </h3>
            </div>
            <p className="text-sm text-blue-900 leading-relaxed">
              {detail.plainLanguage}
            </p>
          </div>

          {/* How to Comply */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <h3 className="text-xs font-semibold text-green-800 uppercase tracking-wider">
                How to Comply
              </h3>
            </div>
            <ul className="space-y-2">
              {detail.howToComply.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-green-900">
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5"
                    style={{ backgroundColor: `${themeAccent}20`, color: themeAccent }}
                  >
                    {i + 1}
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Related Standards */}
          {detail.relatedStandards && detail.relatedStandards.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <h3 className="text-xs font-semibold text-amber-800 uppercase tracking-wider">
                  Related Standards
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {detail.relatedStandards.map((ref, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 text-amber-800 rounded-lg text-xs font-medium"
                  >
                    <BookOpen className="w-3 h-3" />
                    {ref}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
          <a
            href="https://www.appraisalfoundation.org/imis/TAF/Standards/Appraisal_Standards/Uniform_Standards_of_Professional_Appraisal_Practice/TAF/USPAP.aspx"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
          >
            <ExternalLink className="w-3 h-3" />
            Full USPAP Documentation
          </a>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-lg transition-colors"
            style={{ backgroundColor: themeAccent, color: 'white' }}
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}

