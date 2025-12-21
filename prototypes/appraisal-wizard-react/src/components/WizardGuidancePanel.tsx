import { useState } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  Lightbulb, 
  AlertTriangle, 
  BookOpen,
  Info,
  CheckCircle2
} from 'lucide-react';
import USPAPDetailModal, { USPAPDetail } from './USPAPDetailModal';

export interface GuidanceSectionContent {
  id: string;
  title: string;
  context: string;
  tips: string[];
  commonMistakes: string[];
  uspap?: {
    reference: string;
    brief: string;
    detail: USPAPDetail;
  };
}

interface WizardGuidancePanelProps {
  sectionId: string;
  guidance: GuidanceSectionContent;
  themeAccent?: string;
}

export default function WizardGuidancePanel({
  sectionId: _sectionId,
  guidance,
  themeAccent = '#0da1c7',
}: WizardGuidancePanelProps) {
  void _sectionId; // Reserved for future section-specific behavior
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    context: true,
    tips: false,
    mistakes: false,
  });
  const [uspapModalOpen, setUspapModalOpen] = useState(false);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const SectionHeader = ({
    id,
    icon: Icon,
    title,
    iconColor,
    bgColor,
  }: {
    id: string;
    icon: typeof Info;
    title: string;
    iconColor: string;
    bgColor: string;
  }) => (
    <button
      onClick={() => toggleSection(id)}
      className="w-full flex items-center justify-between py-2 group"
    >
      <div className="flex items-center gap-2">
        <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${bgColor}`}>
          <Icon className={`w-3.5 h-3.5 ${iconColor}`} />
        </div>
        <span className="text-sm font-semibold text-gray-800">{title}</span>
      </div>
      {expandedSections[id] ? (
        <ChevronUp className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
      ) : (
        <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
      )}
    </button>
  );

  return (
    <div className="space-y-4">
      {/* Section Title */}
      <div>
        <h3 
          className="text-lg font-bold text-gray-900 flex items-center gap-2"
        >
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: themeAccent }}
          />
          {guidance.title}
        </h3>
        <p className="text-xs text-gray-500 mt-0.5">Section Guidance</p>
      </div>

      {/* Context Section */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-4 bg-gray-50 border-b border-gray-200">
          <SectionHeader
            id="context"
            icon={Info}
            title="Overview"
            iconColor="text-blue-600"
            bgColor="bg-blue-100"
          />
        </div>
        {expandedSections.context && (
          <div className="px-4 py-3 bg-white animate-in slide-in-from-top-1 duration-200">
            <p className="text-sm text-gray-700 leading-relaxed">
              {guidance.context}
            </p>
          </div>
        )}
      </div>

      {/* Tips Section */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-4 bg-gray-50 border-b border-gray-200">
          <SectionHeader
            id="tips"
            icon={Lightbulb}
            title="Best Practices"
            iconColor="text-amber-600"
            bgColor="bg-amber-100"
          />
        </div>
        {expandedSections.tips && (
          <div className="px-4 py-3 bg-white animate-in slide-in-from-top-1 duration-200">
            <ul className="space-y-2">
              {guidance.tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <CheckCircle2 
                    className="w-4 h-4 shrink-0 mt-0.5" 
                    style={{ color: themeAccent }}
                  />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Common Mistakes Section */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-4 bg-gray-50 border-b border-gray-200">
          <SectionHeader
            id="mistakes"
            icon={AlertTriangle}
            title="Common Mistakes"
            iconColor="text-red-600"
            bgColor="bg-red-100"
          />
        </div>
        {expandedSections.mistakes && (
          <div className="px-4 py-3 bg-white animate-in slide-in-from-top-1 duration-200">
            <ul className="space-y-2">
              {guidance.commonMistakes.map((mistake, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  </span>
                  {mistake}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* USPAP Reference Link - Compact Design */}
      {guidance.uspap && (
        <button
          onClick={() => setUspapModalOpen(true)}
          className="w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 border-dashed transition-all hover:border-solid group"
          style={{ 
            borderColor: `${themeAccent}40`,
            backgroundColor: `${themeAccent}05`,
          }}
        >
          <div className="flex items-center gap-3">
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${themeAccent}15` }}
            >
              <BookOpen className="w-4 h-4" style={{ color: themeAccent }} />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <span 
                  className="text-sm font-semibold"
                  style={{ color: themeAccent }}
                >
                  USPAP: {guidance.uspap.reference}
                </span>
              </div>
              <p className="text-xs text-gray-500 line-clamp-1">
                {guidance.uspap.brief}
              </p>
            </div>
          </div>
          <span 
            className="text-xs font-medium px-2 py-1 rounded-md transition-colors group-hover:bg-opacity-100"
            style={{ 
              backgroundColor: `${themeAccent}10`,
              color: themeAccent,
            }}
          >
            View →
          </span>
        </button>
      )}

      {/* USPAP Detail Modal */}
      {guidance.uspap && (
        <USPAPDetailModal
          isOpen={uspapModalOpen}
          onClose={() => setUspapModalOpen(false)}
          detail={guidance.uspap.detail}
          themeAccent={themeAccent}
        />
      )}
    </div>
  );
}

