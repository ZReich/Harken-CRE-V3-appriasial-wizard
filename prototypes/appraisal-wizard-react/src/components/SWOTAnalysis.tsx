/**
 * SWOT Analysis Component
 * 
 * Four-quadrant UI for Strengths, Weaknesses, Opportunities, and Threats.
 * Allows users to input items for each category with a clean, visual interface.
 * 
 * Enhanced with:
 * - AI suggestion badges
 * - Data completeness indicator
 * - Impact score visualization
 * - Source attribution
 */

import { useState } from 'react';
import { 
  Plus, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  Lightbulb, 
  ShieldAlert,
  Sparkles,
  Loader2,
  Info,
  TrendingUp,
  TrendingDown,
  Minus,
  Database
} from 'lucide-react';
import EnhancedTextArea from './EnhancedTextArea';

export interface SWOTData {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
  summary: string;
}

export interface SWOTSuggestionResult extends Partial<SWOTData> {
  dataCompleteness?: number;
  impactScore?: number;
}

interface SWOTAnalysisProps {
  data: SWOTData;
  onChange: (data: SWOTData) => void;
  onGenerateSuggestions?: () => Promise<SWOTSuggestionResult>;
  className?: string;
  readOnly?: boolean;
}

interface SWOTQuadrantProps {
  title: string;
  items: string[];
  aiSuggestedCount?: number;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: React.ReactNode;
  placeholder: string;
  onAdd: (item: string) => void;
  onRemove: (index: number) => void;
  readOnly?: boolean;
}

function SWOTQuadrant({
  title,
  items,
  aiSuggestedCount = 0,
  color,
  bgColor,
  borderColor,
  icon,
  placeholder,
  onAdd,
  onRemove,
  readOnly = false,
}: SWOTQuadrantProps) {
  const [inputValue, setInputValue] = useState('');

  const handleAdd = () => {
    if (inputValue.trim()) {
      onAdd(inputValue.trim());
      setInputValue('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className={`${bgColor} rounded-xl border ${borderColor} overflow-hidden flex flex-col`}>
      {/* Header */}
      <div className={`px-4 py-3 border-b ${borderColor} flex items-center gap-2`}>
        <div className={`p-1.5 rounded-lg ${color}`}>
          {icon}
        </div>
        <span className="font-semibold text-slate-800 dark:text-white">{title}</span>
        <span className="ml-auto text-sm text-slate-500 flex items-center gap-1.5">
          {aiSuggestedCount > 0 && (
            <span className="flex items-center gap-1 text-xs text-[#0da1c7] bg-[#0da1c7]/10 px-1.5 py-0.5 rounded">
              <Sparkles className="w-3 h-3" />
              {aiSuggestedCount}
            </span>
          )}
          {items.length} item{items.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Items List */}
      <div className="flex-1 p-3 space-y-2 max-h-48 overflow-y-auto">
        {items.length === 0 ? (
          <p className="text-sm text-slate-400 italic py-4 text-center">
            No items added yet
          </p>
        ) : (
          items.map((item, index) => (
            <div 
              key={index}
              className="flex items-start gap-2 bg-white/60 dark:bg-slate-700/60 rounded-lg px-3 py-2 group"
            >
              <span className="text-sm text-slate-700 flex-1">{item}</span>
              {!readOnly && (
                <button
                  onClick={() => onRemove(index)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-200 rounded transition-all"
                >
                  <X className="w-3 h-3 text-slate-400" />
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add Input */}
      {!readOnly && (
        <div className="p-3 border-t border-slate-200/50">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={placeholder}
              className="flex-1 px-3 py-2 text-sm bg-white dark:bg-slate-700 dark:text-white border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0da1c7] dark:focus:ring-cyan-400 focus:border-transparent"
            />
            <button
              onClick={handleAdd}
              disabled={!inputValue.trim()}
              className="p-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Plus className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Impact Score Gauge component
 */
function ImpactScoreGauge({ score }: { score: number }) {
  // Convert -100 to +100 to 0-100 for display
  const normalizedScore = (score + 100) / 2;
  const isPositive = score > 10;
  const isNegative = score < -10;
  
  return (
    <div className="flex items-center gap-3 bg-slate-50 rounded-lg px-3 py-2">
      <div className="flex items-center gap-1.5">
        {isPositive ? (
          <TrendingUp className="w-4 h-4 text-emerald-500" />
        ) : isNegative ? (
          <TrendingDown className="w-4 h-4 text-red-500" />
        ) : (
          <Minus className="w-4 h-4 text-slate-400" />
        )}
        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Impact Score</span>
      </div>
      <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-500 ${
            isPositive ? 'bg-emerald-500' : isNegative ? 'bg-red-500' : 'bg-slate-400'
          }`}
          style={{ width: `${normalizedScore}%` }}
        />
      </div>
      <span className={`text-sm font-bold ${
        isPositive ? 'text-emerald-600' : isNegative ? 'text-red-600' : 'text-slate-600'
      }`}>
        {score > 0 ? '+' : ''}{score}
      </span>
    </div>
  );
}

/**
 * Data Completeness Indicator
 */
function DataCompletenessIndicator({ completeness }: { completeness: number }) {
  const getLabel = () => {
    if (completeness >= 80) return 'Excellent';
    if (completeness >= 60) return 'Good';
    if (completeness >= 40) return 'Fair';
    return 'Limited';
  };
  
  const getColor = () => {
    if (completeness >= 80) return 'text-emerald-600 bg-emerald-50';
    if (completeness >= 60) return 'text-blue-600 bg-blue-50';
    if (completeness >= 40) return 'text-amber-600 bg-amber-50';
    return 'text-slate-600 bg-slate-100';
  };
  
  return (
    <div className="flex items-center gap-2 text-sm">
      <Database className="w-4 h-4 text-slate-400" />
      <span className="text-slate-500 dark:text-slate-400">Data Completeness:</span>
      <span className={`px-2 py-0.5 rounded font-medium ${getColor()}`}>
        {completeness}% ({getLabel()})
      </span>
    </div>
  );
}

export function SWOTAnalysis({ 
  data, 
  onChange, 
  onGenerateSuggestions,
  className = '',
  readOnly = false 
}: SWOTAnalysisProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiSuggestedCounts, setAiSuggestedCounts] = useState({
    strengths: 0,
    weaknesses: 0,
    opportunities: 0,
    threats: 0,
  });
  const [dataCompleteness, setDataCompleteness] = useState<number | null>(null);
  const [impactScore, setImpactScore] = useState<number | null>(null);

  const updateCategory = (category: keyof Omit<SWOTData, 'summary'>, items: string[]) => {
    onChange({
      ...data,
      [category]: items,
    });
  };

  const addItem = (category: keyof Omit<SWOTData, 'summary'>) => (item: string) => {
    updateCategory(category, [...data[category], item]);
  };

  const removeItem = (category: keyof Omit<SWOTData, 'summary'>) => (index: number) => {
    updateCategory(category, data[category].filter((_, i) => i !== index));
    // Decrement AI count if removing an AI-suggested item
    if (index < aiSuggestedCounts[category]) {
      setAiSuggestedCounts(prev => ({
        ...prev,
        [category]: Math.max(0, prev[category] - 1),
      }));
    }
  };

  const handleGenerateSuggestions = async () => {
    if (!onGenerateSuggestions) return;
    
    setIsGenerating(true);
    try {
      const suggestions = await onGenerateSuggestions();
      if (suggestions) {
        const newStrengths = suggestions.strengths || [];
        const newWeaknesses = suggestions.weaknesses || [];
        const newOpportunities = suggestions.opportunities || [];
        const newThreats = suggestions.threats || [];
        
        // Track AI-suggested counts (append to existing counts)
        setAiSuggestedCounts(prev => ({
          strengths: prev.strengths + newStrengths.length,
          weaknesses: prev.weaknesses + newWeaknesses.length,
          opportunities: prev.opportunities + newOpportunities.length,
          threats: prev.threats + newThreats.length,
        }));
        
        // Update data completeness and impact score if provided
        if (suggestions.dataCompleteness !== undefined) {
          setDataCompleteness(suggestions.dataCompleteness);
        }
        if (suggestions.impactScore !== undefined) {
          setImpactScore(suggestions.impactScore);
        }
        
        onChange({
          ...data,
          strengths: [...data.strengths, ...newStrengths],
          weaknesses: [...data.weaknesses, ...newWeaknesses],
          opportunities: [...data.opportunities, ...newOpportunities],
          threats: [...data.threats, ...newThreats],
        });
      }
    } catch (error) {
      console.error('Failed to generate SWOT suggestions:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const totalItems = data.strengths.length + data.weaknesses.length + 
                     data.opportunities.length + data.threats.length;
  const totalAiItems = aiSuggestedCounts.strengths + aiSuggestedCounts.weaknesses +
                       aiSuggestedCounts.opportunities + aiSuggestedCounts.threats;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header with AI Generate Button */}
      {!readOnly && onGenerateSuggestions && (
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white">SWOT Analysis</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Analyze strengths, weaknesses, opportunities, and threats</p>
          </div>
          <button
            onClick={handleGenerateSuggestions}
            disabled={isGenerating}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#0da1c7] to-[#0890b0] text-white rounded-lg hover:from-[#0890b0] hover:to-[#0780a0] transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                AI Suggestions
              </>
            )}
          </button>
        </div>
      )}
      
      {/* AI Analysis Stats Bar */}
      {(dataCompleteness !== null || impactScore !== null || totalAiItems > 0) && (
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border border-slate-200 p-4 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            {/* Data Completeness */}
            {dataCompleteness !== null && (
              <DataCompletenessIndicator completeness={dataCompleteness} />
            )}
            
            {/* AI Stats */}
            {totalAiItems > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <Sparkles className="w-4 h-4 text-[#0da1c7]" />
                <span className="text-slate-500 dark:text-slate-400">AI-generated:</span>
                <span className="text-[#0da1c7] font-medium">
                  {totalAiItems} of {totalItems} items
                </span>
              </div>
            )}
          </div>
          
          {/* Impact Score Gauge */}
          {impactScore !== null && (
            <ImpactScoreGauge score={impactScore} />
          )}
        </div>
      )}

      {/* Info Banner when no suggestions yet */}
      {!readOnly && totalItems === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
          <Info className="text-blue-600 shrink-0 mt-0.5" size={18} />
          <div className="text-sm text-blue-800">
            <p className="font-medium">Generate intelligent suggestions</p>
            <p className="text-blue-600 mt-1">
              Click "AI Suggestions" to analyze your property data (site details, demographics, 
              economic indicators, improvements, and market data) and generate relevant SWOT items.
            </p>
          </div>
        </div>
      )}

      {/* Four Quadrants Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Strengths */}
        <SWOTQuadrant
          title="Strengths"
          items={data.strengths}
          aiSuggestedCount={aiSuggestedCounts.strengths}
          color="bg-emerald-100 text-emerald-600"
          bgColor="bg-emerald-50/50"
          borderColor="border-emerald-200"
          icon={<CheckCircle2 className="w-4 h-4" />}
          placeholder="Add a strength..."
          onAdd={addItem('strengths')}
          onRemove={removeItem('strengths')}
          readOnly={readOnly}
        />

        {/* Weaknesses */}
        <SWOTQuadrant
          title="Weaknesses"
          items={data.weaknesses}
          aiSuggestedCount={aiSuggestedCounts.weaknesses}
          color="bg-red-100 text-red-600"
          bgColor="bg-red-50/50"
          borderColor="border-red-200"
          icon={<AlertTriangle className="w-4 h-4" />}
          placeholder="Add a weakness..."
          onAdd={addItem('weaknesses')}
          onRemove={removeItem('weaknesses')}
          readOnly={readOnly}
        />

        {/* Opportunities */}
        <SWOTQuadrant
          title="Opportunities"
          items={data.opportunities}
          aiSuggestedCount={aiSuggestedCounts.opportunities}
          color="bg-blue-100 text-blue-600"
          bgColor="bg-blue-50/50"
          borderColor="border-blue-200"
          icon={<Lightbulb className="w-4 h-4" />}
          placeholder="Add an opportunity..."
          onAdd={addItem('opportunities')}
          onRemove={removeItem('opportunities')}
          readOnly={readOnly}
        />

        {/* Threats */}
        <SWOTQuadrant
          title="Threats"
          items={data.threats}
          aiSuggestedCount={aiSuggestedCounts.threats}
          color="bg-amber-100 text-amber-600"
          bgColor="bg-amber-50/50"
          borderColor="border-amber-200"
          icon={<ShieldAlert className="w-4 h-4" />}
          placeholder="Add a threat..."
          onAdd={addItem('threats')}
          onRemove={removeItem('threats')}
          readOnly={readOnly}
        />
      </div>

      {/* Summary / Analysis Notes */}
      {!readOnly ? (
        <EnhancedTextArea
          label="Summary / Analysis Notes"
          value={data.summary}
          onChange={(newSummary) => onChange({ ...data, summary: newSummary })}
          placeholder="Synthesize the SWOT analysis into a cohesive narrative assessing the subject property's competitive position..."
          sectionContext="swot_summary_analysis"
          minHeight={120}
          additionalContext={{
            strengths: data.strengths,
            weaknesses: data.weaknesses,
            opportunities: data.opportunities,
            threats: data.threats,
            totalItems: data.strengths.length + data.weaknesses.length + data.opportunities.length + data.threats.length,
          }}
          aiInstructions="Write a comprehensive SWOT analysis summary in the voice of a 30-year veteran commercial real estate appraiser. Synthesize all identified strengths, weaknesses, opportunities, and threats into a cohesive 2-3 paragraph narrative. Assess the subject property's overall competitive position in the market. Discuss how the strengths can be leveraged, how weaknesses might be mitigated, what opportunities exist for value enhancement, and what threats require monitoring. Conclude with an overall assessment of the property's market positioning and investment outlook. Use professional appraisal terminology and maintain an objective, analytical tone appropriate for a formal appraisal report."
        />
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Summary / Analysis Notes
          </label>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {data.summary || 'No summary provided.'}
          </p>
        </div>
      )}
    </div>
  );
}

export default SWOTAnalysis;
