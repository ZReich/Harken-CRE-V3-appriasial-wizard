/**
 * CostSegGuidancePanel Component
 * 
 * Context-aware guidance panel that displays relevant IRS references,
 * glossary terms, and tips based on what the user is currently editing.
 */

import React, { useState, useMemo } from 'react';
import {
  HelpCircle,
  BookOpen,
  AlertTriangle,
  Lightbulb,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Search,
  X,
} from 'lucide-react';
import {
  GUIDANCE_CONTENT,
  GLOSSARY,
  IRS_REFERENCES,
  getGuidanceForContext,
  getQuickTips,
  searchGlossary,
  searchGuidance,
  type GuidanceContent,
  type GlossaryTerm,
  type IRSReference,
} from '../constants/costSegGuidance';

interface CostSegGuidancePanelProps {
  context: 'overview' | 'system-refinement' | 'supplemental-items' | 'audit-risk' | 'benchmarks' | 'measurements';
  systemType?: 'electrical' | 'plumbing' | 'hvac' | 'fire-protection';
  isOpen?: boolean;
  onClose?: () => void;
  className?: string;
}

type TabType = 'guidance' | 'glossary' | 'irs-refs';

export const CostSegGuidancePanel: React.FC<CostSegGuidancePanelProps> = ({
  context,
  systemType,
  isOpen = true,
  onClose,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('guidance');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['main']));

  // Get contextual guidance
  const contextualGuidance = useMemo(() => {
    const guidance = getGuidanceForContext(context);
    
    // If system-refinement context, prioritize system-specific guidance
    if (context === 'system-refinement' && systemType) {
      const systemGuidance = GUIDANCE_CONTENT[`${systemType}-refinement`];
      if (systemGuidance) {
        return [systemGuidance, ...guidance.filter(g => g.id !== systemGuidance.id)];
      }
    }
    
    return guidance;
  }, [context, systemType]);

  const quickTips = useMemo(() => {
    if (context === 'system-refinement' && systemType) {
      return getQuickTips(systemType);
    }
    return getQuickTips(context);
  }, [context, systemType]);

  // Search results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return { glossary: [], guidance: [] };
    
    return {
      glossary: searchGlossary(searchQuery),
      guidance: searchGuidance(searchQuery),
    };
  }, [searchQuery]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  };

  if (!isOpen) return null;

  return (
    <div className={`bg-surface-1 border-l border-light-border flex flex-col ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-light-border">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-harken-dark dark:text-white">Cost Seg Guidance</h3>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 text-harken-gray-med hover:text-harken-gray rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="p-4 border-b border-light-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-harken-gray-med" />
          <input
            type="text"
            placeholder="Search guidance, terms, or IRS refs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-light-border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-harken-gray-med hover:text-harken-gray"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Search Results */}
      {searchQuery && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {searchResults.guidance.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-harken-gray-med uppercase mb-2">Guidance</h4>
              {searchResults.guidance.map(guide => (
                <GuidanceCard key={guide.id} guidance={guide} isExpanded />
              ))}
            </div>
          )}
          
          {searchResults.glossary.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-harken-gray-med uppercase mb-2">Glossary</h4>
              {searchResults.glossary.map(term => (
                <GlossaryCard key={term.id} term={term} />
              ))}
            </div>
          )}
          
          {searchResults.guidance.length === 0 && searchResults.glossary.length === 0 && (
            <div className="text-center py-8 text-sm text-harken-gray-med dark:text-slate-400">
              No results found for "{searchQuery}"
            </div>
          )}
        </div>
      )}

      {/* Tabs (when not searching) */}
      {!searchQuery && (
        <>
          <div className="flex border-b border-light-border">
            <button
              onClick={() => setActiveTab('guidance')}
              className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'guidance'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-harken-gray dark:text-slate-400 hover:text-harken-dark dark:hover:text-white'
              }`}
            >
              Guidance
            </button>
            <button
              onClick={() => setActiveTab('glossary')}
              className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'glossary'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-harken-gray dark:text-slate-400 hover:text-harken-dark dark:hover:text-white'
              }`}
            >
              Glossary
            </button>
            <button
              onClick={() => setActiveTab('irs-refs')}
              className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'irs-refs'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-harken-gray dark:text-slate-400 hover:text-harken-dark dark:hover:text-white'
              }`}
            >
              IRS Refs
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === 'guidance' && (
              <div className="space-y-4">
                {/* Quick Tips */}
                {quickTips.length > 0 && (
                  <div className="bg-accent-amber-gold-light border border-accent-amber-gold-light rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Lightbulb className="w-4 h-4 text-accent-amber-gold" />
                      <h4 className="text-sm font-semibold text-accent-amber-gold">Quick Tips</h4>
                    </div>
                    <ul className="space-y-1 text-xs text-accent-amber-gold">
                      {quickTips.map((tip, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-accent-amber-gold mt-0.5">•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Contextual Guidance */}
                {contextualGuidance.map(guide => (
                  <GuidanceCard
                    key={guide.id}
                    guidance={guide}
                    isExpanded={expandedSections.has(guide.id)}
                    onToggle={() => toggleSection(guide.id)}
                  />
                ))}

                {contextualGuidance.length === 0 && (
                  <div className="text-center py-8 text-sm text-harken-gray-med dark:text-slate-400">
                    No specific guidance for this context
                  </div>
                )}
              </div>
            )}

            {activeTab === 'glossary' && (
              <div className="space-y-3">
                {Object.values(GLOSSARY).map(term => (
                  <GlossaryCard key={term.id} term={term} />
                ))}
              </div>
            )}

            {activeTab === 'irs-refs' && (
              <div className="space-y-3">
                {Object.values(IRS_REFERENCES).map(ref => (
                  <IRSReferenceCard key={ref.id} reference={ref} />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

// =================================================================
// CARD COMPONENTS
// =================================================================

interface GuidanceCardProps {
  guidance: GuidanceContent;
  isExpanded?: boolean;
  onToggle?: () => void;
}

const GuidanceCard: React.FC<GuidanceCardProps> = ({ guidance, isExpanded = false, onToggle }) => {
  return (
    <div className="border border-light-border rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-3 bg-harken-gray-light hover:bg-harken-gray-light transition-colors"
      >
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-blue-600" />
          <h4 className="text-sm font-semibold text-harken-dark dark:text-white">{guidance.title}</h4>
        </div>
        {onToggle && (
          isExpanded ? (
            <ChevronDown className="w-4 h-4 text-harken-gray-med" />
          ) : (
            <ChevronRight className="w-4 h-4 text-harken-gray-med" />
          )
        )}
      </button>
      
      {isExpanded && (
        <div className="p-3 space-y-3">
          <p className="text-xs text-harken-gray whitespace-pre-line">{guidance.content}</p>
          
          {guidance.tips && guidance.tips.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded p-2">
              <div className="flex items-center gap-1 mb-1">
                <Lightbulb className="w-3 h-3 text-green-600" />
                <span className="text-xs font-medium text-green-900">Tips:</span>
              </div>
              <ul className="space-y-1 text-xs text-green-800">
                {guidance.tips.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-green-600">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {guidance.warnings && guidance.warnings.length > 0 && (
            <div className="bg-accent-red-light border border-harken-error/30 rounded p-2">
              <div className="flex items-center gap-1 mb-1">
                <AlertTriangle className="w-3 h-3 text-harken-error" />
                <span className="text-xs font-medium text-harken-error">Warnings:</span>
              </div>
              <ul className="space-y-1 text-xs text-harken-error">
                {guidance.warnings.map((warning, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-harken-error">•</span>
                    <span>{warning}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {guidance.relatedGlossary && guidance.relatedGlossary.length > 0 && (
            <div className="text-xs">
              <span className="font-medium text-harken-gray">Related Terms: </span>
              <span className="text-blue-600">
                {guidance.relatedGlossary.map((termId, idx) => (
                  <span key={termId}>
                    {GLOSSARY[termId]?.term || termId}
                    {idx < guidance.relatedGlossary!.length - 1 && ', '}
                  </span>
                ))}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface GlossaryCardProps {
  term: GlossaryTerm;
}

const GlossaryCard: React.FC<GlossaryCardProps> = ({ term }) => {
  return (
    <div className="border border-light-border rounded-lg p-3">
      <h4 className="text-sm font-semibold text-harken-dark dark:text-white mb-1">{term.term}</h4>
      <p className="text-xs text-harken-gray mb-2">{term.definition}</p>
      
      {term.example && (
        <div className="bg-blue-50 border border-blue-200 rounded p-2 mb-2">
          <span className="text-xs font-medium text-blue-900">Example: </span>
          <span className="text-xs text-blue-800">{term.example}</span>
        </div>
      )}
      
      {term.irsReference && (
        <div className="text-xs text-harken-gray">
          <span className="font-medium">Reference: </span>
          <span>{IRS_REFERENCES[term.irsReference]?.title || term.irsReference}</span>
        </div>
      )}
      
      {term.relatedTerms && term.relatedTerms.length > 0 && (
        <div className="text-xs text-harken-gray mt-1">
          <span className="font-medium">Related: </span>
          <span className="text-blue-600">
            {term.relatedTerms.map((termId, idx) => (
              <span key={termId}>
                {GLOSSARY[termId]?.term || termId}
                {idx < term.relatedTerms!.length - 1 && ', '}
              </span>
            ))}
          </span>
        </div>
      )}
    </div>
  );
};

interface IRSReferenceCardProps {
  reference: IRSReference;
}

const IRSReferenceCard: React.FC<IRSReferenceCardProps> = ({ reference }) => {
  return (
    <div className="border border-light-border rounded-lg p-3">
      <div className="flex items-start justify-between mb-2">
        <h4 className="text-sm font-semibold text-harken-dark dark:text-white">{reference.title}</h4>
        {reference.url && (
          <a
            href={reference.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-700"
            title="Open in new tab"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        )}
      </div>
      
      <p className="text-xs text-harken-gray mb-2 italic">{reference.citation}</p>
      <p className="text-xs text-harken-gray mb-2">{reference.summary}</p>
      
      {reference.relevantSections && reference.relevantSections.length > 0 && (
        <div className="bg-harken-gray-light rounded p-2">
          <span className="text-xs font-medium text-harken-gray">Key Sections:</span>
          <ul className="mt-1 space-y-1">
            {reference.relevantSections.map((section, idx) => (
              <li key={idx} className="text-xs text-harken-gray flex items-start gap-2">
                <span className="text-harken-gray-med">•</span>
                <span>{section}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CostSegGuidancePanel;
