import { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  Sparkles, 
  Maximize2, 
  Minimize2,
  Undo,
  Redo,
  AlignLeft,
  AlignCenter,
  AlignRight,
  X,
  Check,
  Info,
  Loader2
} from 'lucide-react';

// ==========================================
// TYPES
// ==========================================
interface EnhancedTextAreaProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  sectionContext?: string;
  helperText?: string;
  required?: boolean;
}

interface AIPreview {
  content: string;
  isVisible: boolean;
}

// Simulated AI responses for demo (templates reserved for future API integration)
const SimulatedAIDrafts: Record<string, string> = {
  'legal_description': 'Lot 12, Block 4, of CANYON CREEK INDUSTRIAL PARK, according to the plat thereof, filed in Plat Book 45, at Page 123, records of Yellowstone County, Montana, located in the Southeast Quarter of Section 15, Township 1 South, Range 26 East, Principal Meridian, Montana.',
  'area_description': 'The subject property is located in the Billings Heights area of Billings, Montana, an established commercial and industrial corridor along South 30th Street West. The immediate neighborhood is characterized by a mix of light industrial, warehouse, and commercial uses. The area benefits from excellent access to Interstate 90 and major arterial roads. The local economy is diverse, supported by agriculture, energy, healthcare, and manufacturing sectors.',
  'site_description': 'The subject site contains approximately 1.43 acres (62,291 square feet) of level, rectangular land. The site has approximately 200 feet of frontage along South 30th Street West with adequate ingress and egress. All public utilities including water, sewer, electricity, and natural gas are available and connected.',
  'improvement_description': 'The subject improvements consist of a single-story industrial warehouse building constructed in 2019. The building features a steel frame with metal panel exterior walls and a standing seam metal roof. The structure provides approximately 11,174 square feet of gross building area, including warehouse space with 24-foot clear heights.',
  'hbu_analysis': 'Based on analysis of the four tests of highest and best use, the subject site as vacant would be developed with industrial/warehouse use. This conclusion is supported by: (1) Legal permissibility under the I1-Light Industrial zoning; (2) Physical possibility given the level topography; (3) Financial feasibility based on current market demand; and (4) Maximum productivity compared to alternative uses.',
  'reconciliation': 'In reconciling the value indications, the Income Approach is given primary emphasis as it best reflects investor decision-making for income-producing properties. The Sales Comparison Approach provides good support. The Cost Approach is given least weight due to challenges in measuring depreciation.',
  'default': 'This section contains professionally written appraisal content that follows USPAP guidelines and industry best practices. The content should be reviewed and modified as appropriate for the specific assignment.'
};

// ==========================================
// MAIN COMPONENT
// ==========================================
export default function EnhancedTextArea({
  id,
  label,
  value,
  onChange,
  placeholder = '',
  rows = 4,
  sectionContext = 'default',
  helperText,
  required = false,
}: EnhancedTextAreaProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiPreview, setAIPreview] = useState<AIPreview>({ content: '', isVisible: false });
  const [isFocused, setIsFocused] = useState(false);

  // Sync editor content with value prop
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  // Calculate word/character count
  const text = value.replace(/<[^>]*>/g, '').trim();
  const wordCount = text ? text.split(/\s+/).length : 0;
  const charCount = text.length;

  // Execute formatting command
  const execCommand = useCallback((command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    // Update parent state
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  // Handle editor input
  const handleInput = useCallback(() => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  // Generate AI content
  const generateAI = useCallback(async () => {
    setIsGeneratingAI(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const draft = SimulatedAIDrafts[sectionContext] || SimulatedAIDrafts.default;
    setAIPreview({ content: draft, isVisible: true });
    setIsGeneratingAI(false);
  }, [sectionContext]);

  // Accept AI draft
  const acceptAI = useCallback(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = aiPreview.content.replace(/\n/g, '<br>');
      onChange(editorRef.current.innerHTML);
    }
    setAIPreview({ content: '', isVisible: false });
  }, [aiPreview.content, onChange]);

  // Reject AI draft
  const rejectAI = useCallback(() => {
    setAIPreview({ content: '', isVisible: false });
  }, []);

  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev);
  }, []);

  // Close fullscreen on Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isFullscreen]);

  const minHeight = rows * 28;

  return (
    <>
      {/* Fullscreen Overlay */}
      {isFullscreen && (
        <div className="fixed inset-0 bg-black/60 z-40" onClick={toggleFullscreen} />
      )}
      
      <div 
        className={`relative ${isFullscreen 
          ? 'fixed inset-8 z-50 bg-white rounded-2xl shadow-2xl p-8 flex flex-col max-w-6xl mx-auto' 
          : ''
        }`}
        style={isFullscreen ? { minHeight: '80vh', maxHeight: '90vh' } : undefined}
      >
        {/* Label Row */}
        <div className="flex items-center justify-between mb-2">
          <label htmlFor={id} className={`block font-medium text-gray-700 ${isFullscreen ? 'text-lg' : 'text-sm'}`}>
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        </div>

        {/* Toolbar */}
        <div className={`flex flex-wrap items-center gap-1 bg-gray-50 border border-gray-200 rounded-t-xl ${isFullscreen ? 'p-4 gap-2' : 'p-2'}`}>
          {/* History */}
          <div className="flex items-center gap-0.5 pr-2 border-r border-gray-300">
            <ToolbarButton icon={<Undo className="w-4 h-4" />} onClick={() => execCommand('undo')} title="Undo" />
            <ToolbarButton icon={<Redo className="w-4 h-4" />} onClick={() => execCommand('redo')} title="Redo" />
          </div>

          {/* Text Formatting */}
          <div className="flex items-center gap-0.5 px-2 border-r border-gray-300">
            <ToolbarButton icon={<Bold className="w-4 h-4" />} onClick={() => execCommand('bold')} title="Bold (Ctrl+B)" />
            <ToolbarButton icon={<Italic className="w-4 h-4" />} onClick={() => execCommand('italic')} title="Italic (Ctrl+I)" />
            <ToolbarButton icon={<Underline className="w-4 h-4" />} onClick={() => execCommand('underline')} title="Underline (Ctrl+U)" />
          </div>

          {/* Alignment */}
          <div className="flex items-center gap-0.5 px-2 border-r border-gray-300">
            <ToolbarButton icon={<AlignLeft className="w-4 h-4" />} onClick={() => execCommand('justifyLeft')} title="Align Left" />
            <ToolbarButton icon={<AlignCenter className="w-4 h-4" />} onClick={() => execCommand('justifyCenter')} title="Align Center" />
            <ToolbarButton icon={<AlignRight className="w-4 h-4" />} onClick={() => execCommand('justifyRight')} title="Align Right" />
          </div>

          {/* Lists */}
          <div className="flex items-center gap-0.5 px-2 border-r border-gray-300">
            <ToolbarButton icon={<List className="w-4 h-4" />} onClick={() => execCommand('insertUnorderedList')} title="Bullet List" />
            <ToolbarButton icon={<ListOrdered className="w-4 h-4" />} onClick={() => execCommand('insertOrderedList')} title="Numbered List" />
          </div>

          {/* AI Draft */}
          <div className="flex items-center gap-2 px-2">
            <button
              type="button"
              onClick={generateAI}
              disabled={isGeneratingAI}
              className="h-7 px-3 text-xs font-medium text-white bg-gradient-to-r from-[#4db8d1] to-[#7fcce0] rounded-md hover:from-[#3da8c1] hover:to-[#6fc0d4] flex items-center gap-1.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {isGeneratingAI ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  AI Draft
                </>
              )}
            </button>
          </div>

          {/* Fullscreen Toggle */}
          <div className="ml-auto">
            <ToolbarButton 
              icon={isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />} 
              onClick={toggleFullscreen} 
              title={isFullscreen ? 'Exit Fullscreen (Esc)' : 'Fullscreen'} 
            />
          </div>
        </div>

        {/* Editor */}
        <div 
          ref={editorRef}
          id={id}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          data-placeholder={placeholder}
          className={`
            w-full border border-gray-200 border-t-0 rounded-b-xl bg-white
            text-gray-700 leading-relaxed
            focus:outline-none focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent
            overflow-y-auto
            ${isFullscreen ? 'flex-1 p-8 text-lg leading-loose' : 'p-4 text-sm'}
            ${!value && !isFocused ? 'empty-placeholder' : ''}
          `}
          style={{ minHeight: isFullscreen ? '500px' : `${minHeight}px` }}
        />

        {/* Footer: Word Count & Helper Text */}
        <div className="flex items-center justify-between mt-2">
          {helperText && (
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-gray-400" />
              {helperText}
            </p>
          )}
          <p className="text-xs text-gray-400 ml-auto">
            {wordCount} words, {charCount} characters
          </p>
        </div>

        {/* AI Preview */}
        {aiPreview.isVisible && (
          <div className="mt-3 p-4 bg-green-50 border border-green-300 rounded-xl animate-fade-in">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-green-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                AI Generated Draft
              </span>
              <div className="flex gap-2">
                <button
                  onClick={acceptAI}
                  className="px-3 py-1 text-xs font-medium text-white bg-green-600 rounded-md hover:bg-green-700 flex items-center gap-1 transition-colors"
                >
                  <Check className="w-3 h-3" />
                  Accept
                </button>
                <button
                  onClick={rejectAI}
                  className="px-3 py-1 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-1 transition-colors"
                >
                  <X className="w-3 h-3" />
                  Reject
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
              {aiPreview.content}
            </p>
          </div>
        )}

      </div>

      {/* Global Styles */}
      <style>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          font-style: italic;
          pointer-events: none;
        }
        [contenteditable]:focus:empty:before {
          content: '';
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}

// ==========================================
// TOOLBAR BUTTON COMPONENT
// ==========================================
function ToolbarButton({ 
  icon, 
  onClick, 
  title,
  active = false 
}: { 
  icon: React.ReactNode; 
  onClick: () => void; 
  title: string;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`
        w-8 h-8 flex items-center justify-center rounded-md transition-colors
        ${active 
          ? 'bg-[#0da1c7] text-white' 
          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
        }
      `}
    >
      {icon}
    </button>
  );
}
