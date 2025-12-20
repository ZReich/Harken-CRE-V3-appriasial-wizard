import React, { useState, useEffect } from 'react';
import { Bold, Italic, Underline, List, AlignLeft, Wand2, Maximize2, Minimize2, Database, FileText, X, Plus, Loader2 } from 'lucide-react';

interface RichTextEditorProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  onGenerateSnippet?: () => Promise<string | void>;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ label, value, onChange, onGenerateSnippet }) => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Lock body scroll when full screen
  useEffect(() => {
    if (isFullScreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isFullScreen]);

  const handleGenerate = async () => {
    if (!onGenerateSnippet) return;
    setIsGenerating(true);
    try {
      const result = await onGenerateSnippet();
      if (typeof result === 'string' && result.length > 0) {
        // Append with a newline if there is existing content
        const newValue = value ? `${value}\n\n${result}` : result;
        onChange(newValue);
      }
    } catch (error) {
      console.error("Failed to generate draft", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const ToolbarButton = ({ icon: Icon, active = false }: { icon: React.ElementType, active?: boolean }) => (
    <button className={`p-2 rounded-lg transition-all ${active ? 'bg-[#0da1c7]/10 text-[#0da1c7]' : 'text-slate-500 hover:bg-slate-100 hover:text-[#0da1c7]'}`}>
      <Icon size={18} />
    </button>
  );

  const ActionButton = ({ icon: Icon, label, onClick }: { icon: React.ElementType, label: string, onClick?: () => void }) => (
    <button 
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-2 text-xs font-bold uppercase tracking-wide text-slate-600 bg-white border border-slate-200 rounded-lg hover:border-[#0da1c7] hover:text-[#0da1c7] transition-all shadow-sm active:scale-95 whitespace-nowrap"
    >
      <Icon size={14} />
      {label}
    </button>
  );

  const EditorContent = () => (
    <div className={`flex flex-col ${isFullScreen ? 'h-full bg-slate-50' : 'bg-white'}`}>
      {/* Top Utility Bar (Merge/Snippets) */}
      <div className={`flex items-center gap-2 p-3 ${isFullScreen ? 'px-6 py-4 bg-white border-b border-slate-200' : 'bg-slate-50 border-b border-slate-100'} overflow-x-auto`}>
        <ActionButton icon={FileText} label="Merge Field" />
        <ActionButton icon={Database} label="Snippet" />
        <ActionButton icon={Plus} label="Add Snippet" />
        <div className="flex-grow"></div>
        {onGenerateSnippet && (
          <button 
            onClick={handleGenerate}
            disabled={isGenerating}
            className="text-xs flex items-center gap-1 text-[#0da1c7] hover:text-[#0b8fb0] font-bold uppercase tracking-wide transition-colors px-2 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />}
            {isGenerating ? 'Drafting...' : 'AI Draft'}
          </button>
        )}
      </div>

      {/* Formatting Toolbar */}
      <div className={`flex items-center gap-1 p-2 bg-white border-b border-slate-100 ${isFullScreen ? 'px-6 shadow-sm z-10' : ''}`}>
        <div className="flex items-center gap-1 border-r border-slate-100 pr-3 mr-2">
          <ToolbarButton icon={Bold} />
          <ToolbarButton icon={Italic} />
          <ToolbarButton icon={Underline} />
        </div>
        <div className="flex items-center gap-1 border-r border-slate-100 pr-3 mr-2">
          <ToolbarButton icon={AlignLeft} active />
          <ToolbarButton icon={List} />
        </div>
        
        <div className="flex-grow"></div>
        
        <button 
          onClick={() => setIsFullScreen(!isFullScreen)}
          className="p-2 text-slate-400 hover:text-[#0da1c7] hover:bg-[#0da1c7]/10 rounded-lg transition-colors"
          title={isFullScreen ? "Minimize" : "Full Screen"}
        >
          {isFullScreen ? <Minimize2 size={20} /> : <Maximize2 size={18} />}
        </button>
      </div>

      {/* Text Area */}
      <div className="flex-grow relative">
        <textarea
          className={`w-full p-6 text-sm text-slate-700 outline-none bg-white placeholder:text-slate-400 leading-relaxed font-medium
            ${isFullScreen 
              ? 'h-full max-w-4xl mx-auto shadow-sm my-8 min-h-[calc(100vh-200px)] resize-none rounded-xl' 
              : 'h-48 resize-y'
            }`}
          placeholder="Type your analysis and assumptions here..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  );

  if (isFullScreen) {
    return (
      <div className="fixed inset-0 z-[100] bg-slate-100 flex flex-col animate-fade-in">
        <div className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between shadow-sm flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#0da1c7]/10 text-[#0da1c7] rounded-xl">
              <FileText size={24} />
            </div>
            <div>
              <h2 className="font-bold text-slate-800 text-xl">{label}</h2>
              <p className="text-sm text-slate-500 font-medium">Distraction-free editing mode</p>
            </div>
          </div>
          <button 
            onClick={() => setIsFullScreen(false)}
            className="flex items-center gap-2 px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors text-sm"
          >
            <X size={18} /> Close & Save
          </button>
        </div>
        <div className="flex-grow overflow-hidden overflow-y-auto px-4">
          <EditorContent />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full group mt-6">
      <div className="flex justify-between items-end mb-3">
        <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">{label}</label>
      </div>
      <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm transition-all duration-300 focus-within:shadow-lg focus-within:ring-2 focus-within:ring-[#0da1c7]/20 focus-within:border-[#0da1c7]">
        <EditorContent />
      </div>
    </div>
  );
};

