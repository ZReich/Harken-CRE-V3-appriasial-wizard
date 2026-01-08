import React, { useEffect, useRef, useState } from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Undo,
  Redo
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
  autoFocus?: boolean;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ 
  value, 
  onChange, 
  placeholder,
  className = "",
  minHeight = "150px",
  autoFocus = false
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
       if (!editorRef.current.innerText.trim() || Math.abs(editorRef.current.innerHTML.length - value.length) > 5) {
          editorRef.current.innerHTML = value;
       }
    }
  }, [value]);

  useEffect(() => {
    if (autoFocus && editorRef.current) {
        editorRef.current.focus();
    }
  }, [autoFocus]);

  const exec = (command: string, commandValue: string | undefined = undefined) => {
    document.execCommand(command, false, commandValue);
    if (editorRef.current) {
        onChange(editorRef.current.innerHTML);
    }
    if (editorRef.current) {
        editorRef.current.focus();
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  return (
    <div className={`flex flex-col border border-light-border rounded-xl bg-surface-1 overflow-hidden shadow-sm transition-all ${isFocused ? 'ring-2 ring-purple-100 border-purple-300' : ''} ${className}`}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-light-border bg-harken-gray-light select-none">
        
        {/* History */}
        <div className="flex items-center gap-0.5 mr-2">
            <ToolbarBtn icon={<Undo size={14} />} onClick={() => exec('undo')} title="Undo" />
            <ToolbarBtn icon={<Redo size={14} />} onClick={() => exec('redo')} title="Redo" />
        </div>
        <div className="w-px h-4 bg-slate-300 mx-1" />

        {/* Text Style */}
        <select 
            className="h-7 text-xs border border-light-border rounded bg-surface-1 px-1 text-harken-gray focus:outline-none focus:border-purple-300 mr-1"
            onChange={(e) => exec('formatBlock', e.target.value)}
            defaultValue="p"
        >
            <option value="p">Normal</option>
            <option value="h3">Heading</option>
            <option value="h4">Subheading</option>
            <option value="blockquote">Quote</option>
        </select>
        
        <select 
            className="h-7 text-xs border border-light-border rounded bg-surface-1 px-1 text-harken-gray focus:outline-none focus:border-purple-300 mr-2"
            onChange={(e) => exec('fontName', e.target.value)}
            defaultValue="Inter"
        >
            <option value="Inter">Sans Serif</option>
            <option value="Times New Roman">Serif</option>
            <option value="Courier New">Monospace</option>
        </select>

        <div className="w-px h-4 bg-slate-300 mx-1" />

        {/* Formatting */}
        <ToolbarBtn icon={<Bold size={15} />} onClick={() => exec('bold')} title="Bold" />
        <ToolbarBtn icon={<Italic size={15} />} onClick={() => exec('italic')} title="Italic" />
        <ToolbarBtn icon={<Underline size={15} />} onClick={() => exec('underline')} title="Underline" />
        
        <div className="w-px h-4 bg-slate-300 mx-1" />
        
        {/* Alignment */}
        <ToolbarBtn icon={<AlignLeft size={15} />} onClick={() => exec('justifyLeft')} title="Align Left" />
        <ToolbarBtn icon={<AlignCenter size={15} />} onClick={() => exec('justifyCenter')} title="Align Center" />
        <ToolbarBtn icon={<AlignRight size={15} />} onClick={() => exec('justifyRight')} title="Align Right" />
        
        <div className="w-px h-4 bg-slate-300 mx-1" />
        
        {/* Lists */}
        <ToolbarBtn icon={<List size={15} />} onClick={() => exec('insertUnorderedList')} title="Bullet List" />
        <ToolbarBtn icon={<ListOrdered size={15} />} onClick={() => exec('insertOrderedList')} title="Numbered List" />
      </div>
      
      {/* Editor Area */}
      <div className="flex-1 relative bg-surface-1 cursor-text">
        <div 
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="w-full h-full p-6 focus:outline-none prose prose-sm max-w-none text-slate-800 font-normal leading-relaxed overflow-y-auto"
            style={{ minHeight }}
            dangerouslySetInnerHTML={{ __html: value }}
        />
        {!value && (
            <div className="absolute top-6 left-6 text-slate-300 pointer-events-none text-sm select-none">
                {placeholder || "Start typing..."}
            </div>
        )}
      </div>
      
      {/* Footer / Status bar */}
      <div className="px-3 py-1 bg-surface-2 dark:bg-elevation-2 border-t border-light-border dark:border-dark-border text-[10px] text-slate-400 flex justify-end">
         Rich Text Mode
      </div>
    </div>
  );
};

const ToolbarBtn = ({ icon, onClick, title }: { icon: React.ReactNode, onClick: () => void, title?: string }) => (
  <button 
    onClick={(e) => { e.preventDefault(); onClick(); }}
    title={title}
    className="p-1.5 rounded text-slate-500 hover:bg-purple-50 hover:text-purple-700 transition-colors focus:outline-none"
  >
    {icon}
  </button>
);

