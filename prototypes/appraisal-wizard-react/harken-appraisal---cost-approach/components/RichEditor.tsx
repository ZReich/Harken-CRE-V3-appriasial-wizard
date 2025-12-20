import React, { useState, useEffect } from 'react';
import { Bold, Italic, Underline, AlignLeft, AlignCenter, List, ListOrdered, Type, Maximize2, Minimize2 } from 'lucide-react';

export const RichEditor: React.FC = () => {
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Handle escape key to exit full screen
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsFullScreen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  return (
    <>
      {/* Placeholder that stays in the flow when editor is fixed/fullscreen */}
      {isFullScreen && (
        <div className="mt-12 h-64 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50 flex flex-col items-center justify-center text-gray-400 gap-2 animate-pulse">
           <Maximize2 size={24} className="opacity-50" />
           <span className="text-sm font-medium">Editing in full screen mode...</span>
           <button onClick={() => setIsFullScreen(false)} className="text-xs text-brand-600 hover:underline">Return to normal view</button>
        </div>
      )}

      <div 
        className={`
          bg-white border-gray-200 shadow-sm overflow-hidden transition-all duration-300 ease-in-out
          ${isFullScreen 
            ? 'fixed inset-0 z-[100] border-0 rounded-none h-screen w-screen flex flex-col' 
            : 'mt-12 border rounded-lg relative'
          }
        `}
      >
        <div className={`
            border-b border-gray-200 bg-gray-50 flex items-center justify-between flex-shrink-0
            ${isFullScreen ? 'px-6 py-4 shadow-sm z-10' : 'p-3'}
        `}>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 pr-3 border-r border-gray-300">
              <button className="p-1.5 rounded hover:bg-gray-200 text-gray-600 transition-colors"><Bold size={16} /></button>
              <button className="p-1.5 rounded hover:bg-gray-200 text-gray-600 transition-colors"><Italic size={16} /></button>
              <button className="p-1.5 rounded hover:bg-gray-200 text-gray-600 transition-colors"><Underline size={16} /></button>
            </div>
            <div className="flex items-center gap-1 px-3 border-r border-gray-300 hidden sm:flex">
               <div className="flex items-center gap-1 text-xs text-gray-600 bg-white border border-gray-300 rounded px-2 py-1 cursor-pointer hover:border-gray-400 transition-colors">
                 <Type size={12} />
                 <span>Sans Serif</span>
               </div>
               <div className="flex items-center gap-1 text-xs text-gray-600 bg-white border border-gray-300 rounded px-2 py-1 cursor-pointer hover:border-gray-400 transition-colors">
                 <span>Normal</span>
               </div>
            </div>
             <div className="flex items-center gap-1 pl-3">
               <button className="p-1.5 rounded hover:bg-gray-200 text-gray-600 transition-colors"><AlignLeft size={16} /></button>
               <button className="p-1.5 rounded hover:bg-gray-200 text-gray-600 transition-colors"><List size={16} /></button>
               <button className="p-1.5 rounded hover:bg-gray-200 text-gray-600 transition-colors"><ListOrdered size={16} /></button>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <div className="hidden sm:flex gap-2">
                <button className="text-xs font-medium text-brand-600 border border-brand-200 bg-brand-50 px-3 py-1.5 rounded hover:bg-brand-100 transition">Merge Field</button>
                <button className="text-xs font-medium text-gray-600 border border-gray-200 bg-white px-3 py-1.5 rounded hover:bg-gray-50 transition">Snippet Data</button>
             </div>
             
             <div className="w-px h-5 bg-gray-300 mx-1 hidden sm:block"></div>

             <button 
                onClick={toggleFullScreen}
                className={`
                    p-2 rounded-md transition-all duration-200 flex items-center gap-2 text-xs font-medium
                    ${isFullScreen 
                        ? 'bg-brand-600 text-white hover:bg-brand-700 shadow-sm' 
                        : 'text-gray-500 hover:bg-gray-200 hover:text-gray-900'
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
        
        <div className={`
            outline-none text-gray-700 leading-relaxed
            ${isFullScreen 
                ? 'flex-1 p-8 sm:p-12 text-lg max-w-5xl mx-auto w-full overflow-y-auto' 
                : 'p-4 min-h-[120px] text-sm'
            }
        `} contentEditable suppressContentEditableWarning>
          <p className="mb-2">The cost approach was considered in this appraisal. The land value was estimated based on the comparable sales method...</p>
          <p>
            Additional comments regarding the site improvements and their contribution to overall value are noted here. 
            The subject property's effective age was determined based on observed condition and recent renovations.
          </p>
        </div>

        {isFullScreen && (
            <div className="fixed bottom-6 right-6 z-20">
                <button 
                    onClick={toggleFullScreen}
                    className="bg-gray-900 text-white px-4 py-2 rounded-full shadow-lg text-sm font-medium hover:scale-105 transition-transform flex items-center gap-2"
                >
                    <Minimize2 size={14} /> Done
                </button>
            </div>
        )}
      </div>
    </>
  );
};
