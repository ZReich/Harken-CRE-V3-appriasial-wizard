/**
 * SWOT Analysis Component
 * 
 * Four-quadrant UI for Strengths, Weaknesses, Opportunities, and Threats.
 * Allows users to input items for each category with a clean, visual interface.
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
  Loader2
} from 'lucide-react';

export interface SWOTData {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
  summary: string;
}

interface SWOTAnalysisProps {
  data: SWOTData;
  onChange: (data: SWOTData) => void;
  onGenerateSuggestions?: () => Promise<Partial<SWOTData>>;
  className?: string;
  readOnly?: boolean;
}

interface SWOTQuadrantProps {
  title: string;
  items: string[];
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
        <span className="font-semibold text-slate-800">{title}</span>
        <span className="ml-auto text-sm text-slate-500">
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
              className="flex items-start gap-2 bg-white/60 rounded-lg px-3 py-2 group"
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
              className="flex-1 px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent"
            />
            <button
              onClick={handleAdd}
              disabled={!inputValue.trim()}
              className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Plus className="w-4 h-4 text-slate-600" />
            </button>
          </div>
        </div>
      )}
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
  };

  const handleGenerateSuggestions = async () => {
    if (!onGenerateSuggestions) return;
    
    setIsGenerating(true);
    try {
      const suggestions = await onGenerateSuggestions();
      if (suggestions) {
        onChange({
          ...data,
          strengths: [...data.strengths, ...(suggestions.strengths || [])],
          weaknesses: [...data.weaknesses, ...(suggestions.weaknesses || [])],
          opportunities: [...data.opportunities, ...(suggestions.opportunities || [])],
          threats: [...data.threats, ...(suggestions.threats || [])],
        });
      }
    } catch (error) {
      console.error('Failed to generate SWOT suggestions:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header with AI Generate Button */}
      {!readOnly && onGenerateSuggestions && (
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-800">SWOT Analysis</h3>
            <p className="text-sm text-slate-500">Analyze strengths, weaknesses, opportunities, and threats</p>
          </div>
          <button
            onClick={handleGenerateSuggestions}
            disabled={isGenerating}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
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

      {/* Four Quadrants Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Strengths */}
        <SWOTQuadrant
          title="Strengths"
          items={data.strengths}
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

      {/* Summary */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Summary / Analysis Notes
        </label>
        {readOnly ? (
          <p className="text-sm text-slate-600">
            {data.summary || 'No summary provided.'}
          </p>
        ) : (
          <textarea
            value={data.summary}
            onChange={(e) => onChange({ ...data, summary: e.target.value })}
            placeholder="Summarize the key takeaways from the SWOT analysis..."
            rows={3}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent resize-none"
          />
        )}
      </div>
    </div>
  );
}

export default SWOTAnalysis;

