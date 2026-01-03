import React, { useState, useEffect } from 'react';
import { Bold, Italic, Underline, AlignLeft, List, ListOrdered, Type, Maximize2, Minimize2 } from 'lucide-react';

interface RichTextEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ 
  value = '', 
  onChange,
  placeholder = 'Start typing your narrative here...'
}) => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [content, setContent] = useState(value);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsFullScreen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    onChange?.(newContent);
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  return (
    <>
      {isFullScreen && (
        <div className="h-64 border-2 border-dashed border-slate-200 rounded-lg bg-slate-50 flex flex-col items-center justify-center text-slate-400 gap-2 animate-pulse">
          <Maximize2 size={24} className="opacity-50" />
          <span className="text-sm font-medium">Editing in full screen mode...</span>
          <button onClick={() => setIsFullScreen(false)} className="text-xs text-[#0da1c7] hover:underline">Return to normal view</button>
        </div>
      )}

      <div 
        className={`
          bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden transition-all duration-300 ease-in-out
          ${isFullScreen 
            ? 'fixed inset-0 z-[100] border-0 rounded-none h-screen w-screen flex flex-col' 
            : 'border rounded-lg relative'
          }
        `}
      >
        <div className={`
          border-b border-slate-200 bg-slate-50 flex items-center justify-between flex-shrink-0
          ${isFullScreen ? 'px-6 py-4 shadow-sm z-10' : 'p-3'}
        `}>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 pr-3 border-r border-slate-300">
              <button className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"><Bold size={16} /></button>
              <button className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"><Italic size={16} /></button>
              <button className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"><Underline size={16} /></button>
            </div>
            <div className="flex items-center gap-1 px-3 border-r border-slate-300 hidden sm:flex">
              <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded px-2 py-1 cursor-pointer hover:border-slate-400 dark:hover:border-slate-500 transition-colors">
                <Type size={12} />
                <span>Sans Serif</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded px-2 py-1 cursor-pointer hover:border-slate-400 dark:hover:border-slate-500 transition-colors">
                <span>Normal</span>
              </div>
            </div>
            <div className="flex items-center gap-1 pl-3">
              <button className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"><AlignLeft size={16} /></button>
              <button className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"><List size={16} /></button>
              <button className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"><ListOrdered size={16} /></button>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex gap-2">
              <button className="text-xs font-medium text-[#0da1c7] border border-[#0da1c7]/20 bg-[#0da1c7]/10 px-3 py-1.5 rounded hover:bg-[#0da1c7]/20 transition">Merge Field</button>
              <button className="text-xs font-medium text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-1.5 rounded hover:bg-slate-50 dark:hover:bg-slate-600 transition">Snippet Data</button>
            </div>
            
            <div className="w-px h-5 bg-slate-300 mx-1 hidden sm:block"></div>

            <button 
              onClick={toggleFullScreen}
              className={`
                p-2 rounded-md transition-all duration-200 flex items-center gap-2 text-xs font-medium
                ${isFullScreen 
                  ? 'bg-[#0da1c7] text-white hover:bg-[#0b8fb0] shadow-sm' 
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white'
                }
              `}
              title={isFullScreen ? "Exit Full Screen (Esc)" : "Full Screen"}
            >
              {isFullScreen ? (
                <>
                  <Minimize2 size={16} />
                  <span className="hidden sm:inline">Exit Full Screen</span>
                </>
              ) : (
                <>
                  <Maximize2 size={16} />
                  <span className="sr-only">Full Screen</span>
                </>
              )}
            </button>
          </div>
        </div>
        
        <div 
          className={`
            outline-none text-slate-700 leading-relaxed
            ${isFullScreen 
              ? 'flex-1 p-8 sm:p-12 text-lg max-w-5xl mx-auto w-full overflow-y-auto' 
              : 'p-4 min-h-[120px] text-sm'
            }
          `} 
          contentEditable 
          suppressContentEditableWarning
          onInput={(e) => handleContentChange(e.currentTarget.textContent || '')}
          data-placeholder={placeholder}
        >
          {content || (
            <>
              <p className="mb-2">The cost approach was considered in this appraisal. The land value was estimated based on the comparable sales method...</p>
              <p>
                Additional comments regarding the site improvements and their contribution to overall value are noted here. 
                The subject property's effective age was determined based on observed condition and recent renovations.
              </p>
            </>
          )}
        </div>

        {isFullScreen && (
          <div className="fixed bottom-6 right-6 z-20">
            <button 
              onClick={toggleFullScreen}
              className="bg-slate-900 text-white px-4 py-2 rounded-full shadow-lg text-sm font-medium hover:scale-105 transition-transform flex items-center gap-2"
            >
              <Minimize2 size={14} /> Done
            </button>
          </div>
        )}
      </div>
    </>
  );
};





