import { useState } from 'react';
import { Bold, Italic, Underline, List, ListOrdered, FileText, Sparkles, Maximize2, Minimize2 } from 'lucide-react';

interface EnhancedTextAreaProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  sectionContext?: string;
  helperText?: string;
}

export default function EnhancedTextArea({
  id,
  label,
  value,
  onChange,
  placeholder = '',
  rows = 4,
  helperText,
}: EnhancedTextAreaProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;

  const handleFormat = (format: string) => {
    // Basic formatting placeholders
    const formats: Record<string, string> = {
      bold: '**text**',
      italic: '_text_',
      underline: '__text__',
      ul: '• Item',
      ol: '1. Item',
    };
    const insertion = formats[format] || '';
    onChange(value + (value ? '\n' : '') + insertion);
  };

  return (
    <div className={`${isFullscreen ? 'fixed inset-4 z-50 bg-white rounded-xl shadow-2xl p-4' : ''}`}>
      <div className="flex items-center justify-between mb-2">
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">
          {label}
        </label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
            title="Snippets"
          >
            <FileText className="w-4 h-4" />
          </button>
          <button
            type="button"
            className="px-2 py-1 text-xs font-medium text-white bg-[#0da1c7] rounded hover:bg-[#0b8fb0] flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3" />
            AI Draft
          </button>
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
            title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Formatting Toolbar */}
      <div className="flex items-center gap-1 mb-2 p-1 bg-gray-50 rounded-lg border border-gray-200">
        <button
          type="button"
          onClick={() => handleFormat('bold')}
          className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-white rounded"
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => handleFormat('italic')}
          className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-white rounded"
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => handleFormat('underline')}
          className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-white rounded"
          title="Underline"
        >
          <Underline className="w-4 h-4" />
        </button>
        <div className="w-px h-4 bg-gray-300 mx-1" />
        <button
          type="button"
          onClick={() => handleFormat('ul')}
          className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-white rounded"
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => handleFormat('ol')}
          className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-white rounded"
          title="Numbered List"
        >
          <ListOrdered className="w-4 h-4" />
        </button>
      </div>

      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={isFullscreen ? 20 : rows}
        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent resize-none"
      />

      <div className="flex items-center justify-between mt-2">
        {helperText && (
          <p className="text-xs text-gray-500">{helperText}</p>
        )}
        <p className="text-xs text-gray-400 ml-auto">{wordCount} words</p>
      </div>
    </div>
  );
}

