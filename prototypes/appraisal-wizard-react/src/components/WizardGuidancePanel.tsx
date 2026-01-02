import { useState } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  Lightbulb, 
  AlertTriangle, 
  BookOpen,
  Info,
  ArrowRight,
} from 'lucide-react';
import USPAPDetailModal from './USPAPDetailModal';
import type { SectionGuidance } from '../constants/wizardPhaseGuidance';

interface WizardGuidancePanelProps {
  guidance: SectionGuidance | null;
  themeColor?: string;
}

interface CollapsibleSectionProps {
  title: string;
  icon: React.ReactNode;
  iconBgColor: string;
  iconColor: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function CollapsibleSection({ 
  title, 
  icon, 
  iconBgColor, 
  iconColor, 
  children, 
  defaultOpen = false 
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-800">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div 
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: iconBgColor }}
          >
            <span style={{ color: iconColor }}>{icon}</span>
          </div>
          <span className="text-sm font-semibold text-gray-800 dark:text-white">{title}</span>
        </div>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-gray-400 dark:text-slate-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400 dark:text-slate-500" />
        )}
      </button>
      {isOpen && (
        <div className="px-4 pb-4 pt-1 border-t border-gray-100 dark:border-slate-700">
          {children}
        </div>
      )}
    </div>
  );
}

export default function WizardGuidancePanel({
  guidance,
  themeColor = '#0da1c7',
}: WizardGuidancePanelProps) {
  const [uspapModalOpen, setUspapModalOpen] = useState(false);

  if (!guidance) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-slate-400">
        <Info className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Select a section to view guidance</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start gap-2">
        <span 
          className="w-2 h-2 rounded-full mt-2 shrink-0"
          style={{ backgroundColor: themeColor }}
        />
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{guidance.title}</h3>
          <p className="text-sm text-gray-500 dark:text-slate-400">Section Guidance</p>
        </div>
      </div>

      {/* Overview Section */}
      <CollapsibleSection
        title="Overview"
        icon={<Info className="w-4 h-4" />}
        iconBgColor="#dbeafe"
        iconColor="#2563eb"
        defaultOpen={true}
      >
        <p className="text-sm text-gray-700 dark:text-slate-300 leading-relaxed mt-2">
          {guidance.context}
        </p>
      </CollapsibleSection>

      {/* Best Practices Section */}
      {guidance.tips && guidance.tips.length > 0 && (
        <CollapsibleSection
          title="Best Practices"
          icon={<Lightbulb className="w-4 h-4" />}
          iconBgColor="#fef3c7"
          iconColor="#d97706"
          defaultOpen={false}
        >
          <ul className="space-y-2 mt-2">
            {guidance.tips.map((tip, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-700 dark:text-slate-300">
                <span 
                  className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                  style={{ backgroundColor: themeColor }}
                />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </CollapsibleSection>
      )}

      {/* Common Mistakes Section */}
      {guidance.mistakes && guidance.mistakes.length > 0 && (
        <CollapsibleSection
          title="Common Mistakes"
          icon={<AlertTriangle className="w-4 h-4" />}
          iconBgColor="#fee2e2"
          iconColor="#dc2626"
          defaultOpen={false}
        >
          <ul className="space-y-2 mt-2">
            {guidance.mistakes.map((mistake, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-700 dark:text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
                <span>{mistake}</span>
              </li>
            ))}
          </ul>
        </CollapsibleSection>
      )}

      {/* USPAP Reference - Compact Dashed Box */}
      {guidance.uspap && (
        <div 
          className="rounded-xl p-4 border-2 border-dashed"
          style={{ borderColor: `${themeColor}40` }}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${themeColor}15` }}
              >
                <BookOpen className="w-5 h-5" style={{ color: themeColor }} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span 
                    className="text-sm font-bold"
                    style={{ color: themeColor }}
                  >
                    USPAP: {guidance.uspap.reference}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-slate-400 truncate">
                  {guidance.uspap.summary}
                </p>
              </div>
            </div>
            <button
              onClick={() => setUspapModalOpen(true)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium shrink-0 transition-colors hover:bg-opacity-20"
              style={{ 
                color: themeColor,
                backgroundColor: `${themeColor}10`,
              }}
            >
              View
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* USPAP Modal */}
      {guidance.uspap && (
        <USPAPDetailModal
          reference={guidance.uspap.reference}
          isOpen={uspapModalOpen}
          onClose={() => setUspapModalOpen(false)}
          themeColor={themeColor}
        />
      )}
    </div>
  );
}
