import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  ChevronDown, 
  Check, 
  Plus,
  Home,
  Sofa,
  Trees,
  Route,
  Sparkles,
  X
} from 'lucide-react';
import { PHOTO_SLOTS } from '../services/photoClassification';

interface SlotInfo {
  id: string;
  label: string;
  category: string;
  categoryLabel: string;
  description: string;
}

interface VisualSlotPickerProps {
  value?: string;
  onChange: (slotId: string) => void;
  usedSlots: Set<string>;
  suggestedSlotId?: string;
  photoPreview?: string;
  className?: string;
}

// Category configuration with icons
const CATEGORIES = [
  { id: 'exterior', label: 'Exterior', Icon: Home, color: 'from-blue-500 to-cyan-500' },
  { id: 'interior', label: 'Interior', Icon: Sofa, color: 'from-purple-500 to-pink-500' },
  { id: 'site', label: 'Site', Icon: Trees, color: 'from-green-500 to-emerald-500' },
  { id: 'street', label: 'Street', Icon: Route, color: 'from-amber-500 to-orange-500' },
];

// Group slots by category
function getSlotsByCategory(): Record<string, SlotInfo[]> {
  const grouped: Record<string, SlotInfo[]> = {};
  PHOTO_SLOTS.forEach(slot => {
    if (!grouped[slot.category]) {
      grouped[slot.category] = [];
    }
    grouped[slot.category].push(slot);
  });
  return grouped;
}

export default function VisualSlotPicker({
  value,
  onChange,
  usedSlots,
  suggestedSlotId,
  photoPreview,
  className = '',
}: VisualSlotPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('exterior');
  const [hoveredSlot, setHoveredSlot] = useState<string | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [panelPosition, setPanelPosition] = useState({ top: 0, left: 0, width: 0 });

  const slotsByCategory = getSlotsByCategory();
  const selectedSlot = PHOTO_SLOTS.find(s => s.id === value);

  // Calculate panel position when opened
  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const panelWidth = Math.min(480, window.innerWidth - 32);
      const panelHeight = 400;
      
      let top = rect.bottom + 8;
      let left = rect.left;
      
      // Adjust if panel would go off screen
      if (left + panelWidth > window.innerWidth - 16) {
        left = window.innerWidth - panelWidth - 16;
      }
      if (top + panelHeight > window.innerHeight - 16) {
        top = rect.top - panelHeight - 8;
      }
      
      setPanelPosition({ top, left, width: panelWidth });
    }
  }, [isOpen]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    
    const handleClick = (e: MouseEvent) => {
      if (
        panelRef.current && 
        !panelRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleSelectSlot = (slotId: string) => {
    onChange(slotId);
    setIsOpen(false);
  };

  const getCategoryInfo = (categoryId: string) => {
    return CATEGORIES.find(c => c.id === categoryId) || CATEGORIES[0];
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        className={`
          relative w-full flex items-center justify-between gap-2 px-3 py-2.5 
          bg-white border-2 rounded-xl text-left transition-all duration-200
          ${isOpen 
            ? 'border-[#0da1c7] ring-4 ring-[#0da1c7]/20' 
            : 'border-gray-200 hover:border-[#0da1c7]/50'
          }
          ${className}
        `}
      >
        {selectedSlot ? (
          <div className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-md bg-gradient-to-br ${getCategoryInfo(selectedSlot.category).color} flex items-center justify-center`}>
              <Check className="w-3.5 h-3.5 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800 dark:text-white">{selectedSlot.label}</p>
              <p className="text-[10px] text-gray-500 dark:text-slate-400">{selectedSlot.categoryLabel}</p>
            </div>
          </div>
        ) : (
          <span className="text-sm text-gray-500 dark:text-slate-400">Choose where this photo goes...</span>
        )}
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        
        {/* Subtle glow effect */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#0da1c7]/0 via-[#0da1c7]/5 to-[#0da1c7]/0 opacity-0 hover:opacity-100 transition-opacity pointer-events-none" />
      </button>

      {/* Dropdown Panel (Portal) */}
      {isOpen && createPortal(
        <div
          ref={panelRef}
          className="fixed z-[9999] animate-in fade-in zoom-in-95 duration-200"
          style={{
            top: panelPosition.top,
            left: panelPosition.left,
            width: panelPosition.width,
          }}
        >
          {/* Frosted glass panel */}
          <div className="bg-white/95 backdrop-blur-xl border border-gray-200 rounded-2xl shadow-2xl shadow-black/20 overflow-hidden">
            {/* Header with photo preview */}
            <div className="relative px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center gap-3">
                {photoPreview && (
                  <div className="w-12 h-12 rounded-lg overflow-hidden shadow-md flex-shrink-0">
                    <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 dark:text-white">Select a slot for this photo</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">Choose from available slots below</p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Category Tabs */}
            <div className="flex px-2 pt-3 pb-1 gap-1 overflow-x-auto">
              {CATEGORIES.map((cat, index) => {
                const isActive = activeCategory === cat.id;
                const availableCount = (slotsByCategory[cat.id] || []).filter(s => !usedSlots.has(s.id)).length;
                const CatIcon = cat.Icon;
                
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`
                      flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap
                      transition-all duration-200 flex-shrink-0 animate-slot-reveal
                      ${isActive 
                        ? `bg-gradient-to-r ${cat.color} text-white shadow-lg shadow-${cat.id === 'exterior' ? 'blue' : cat.id === 'interior' ? 'purple' : cat.id === 'site' ? 'green' : 'amber'}-500/25 animate-tab-spring` 
                        : 'text-gray-600 hover:bg-gray-100 hover:scale-105'
                      }
                    `}
                    style={{
                      '--stagger-delay': `${index * 50}ms`,
                    } as React.CSSProperties}
                  >
                    <CatIcon className="w-4 h-4" />
                    <span>{cat.label}</span>
                    <span className={`
                      px-1.5 py-0.5 rounded-full text-[10px] font-bold
                      ${isActive ? 'bg-white/30' : 'bg-gray-200 text-gray-500'}
                    `}>
                      {availableCount}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Slots Grid */}
            <div className="p-3 max-h-[280px] overflow-y-auto">
              <div className="grid grid-cols-3 gap-2">
                {(slotsByCategory[activeCategory] || []).map((slot, index) => {
                  const isUsed = usedSlots.has(slot.id);
                  const isSuggested = slot.id === suggestedSlotId;
                  const isHovered = hoveredSlot === slot.id;
                  const isSelected = value === slot.id;
                  
                  return (
                    <button
                      key={slot.id}
                      onClick={() => !isUsed && handleSelectSlot(slot.id)}
                      onMouseEnter={() => setHoveredSlot(slot.id)}
                      onMouseLeave={() => setHoveredSlot(null)}
                      disabled={isUsed}
                      className={`
                        relative p-3 rounded-xl border-2 transition-all duration-200 animate-slot-reveal
                        ${isUsed 
                          ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                          : isSelected
                            ? 'border-[#0da1c7] bg-[#0da1c7]/10 shadow-lg shadow-[#0da1c7]/20 animate-success-pulse'
                            : isSuggested
                              ? 'border-[#0da1c7]/50 bg-[#0da1c7]/5 hover:border-[#0da1c7] hover:bg-[#0da1c7]/10 animate-glow-pulse'
                              : 'border-gray-200 hover:border-[#0da1c7]/50 hover:bg-gray-50'
                        }
                        ${isHovered && !isUsed ? 'scale-105 shadow-lg' : ''}
                      `}
                      style={{
                        '--stagger-delay': `${index * 30}ms`,
                      } as React.CSSProperties}
                    >
                      {/* Slot Preview Area */}
                      <div className={`
                        aspect-[4/3] rounded-lg mb-2 flex items-center justify-center
                        ${isUsed 
                          ? 'bg-gray-200' 
                          : isSelected
                            ? 'bg-[#0da1c7]/20'
                            : 'bg-gradient-to-br from-gray-100 to-gray-50 border-2 border-dashed border-gray-300'
                        }
                      `}>
                        {isSelected ? (
                          <Check className="w-6 h-6 text-[#0da1c7]" />
                        ) : isUsed ? (
                          <span className="text-[10px] text-gray-400 font-medium">IN USE</span>
                        ) : (
                          <Plus className={`w-5 h-5 ${isHovered ? 'text-[#0da1c7]' : 'text-gray-400'}`} />
                        )}
                      </div>
                      
                      {/* Slot Label */}
                      <p className={`text-xs font-medium text-center truncate ${isUsed ? 'text-gray-400' : 'text-gray-700'}`}>
                        {slot.label}
                      </p>

                      {/* AI Suggested Badge */}
                      {isSuggested && !isUsed && (
                        <div className="absolute -top-2 -right-2 flex items-center gap-0.5 px-1.5 py-0.5 bg-gradient-to-r from-[#0da1c7] to-[#4db8d1] text-white text-[9px] font-bold rounded-full shadow-lg">
                          <Sparkles className="w-2.5 h-2.5" />
                          AI
                        </div>
                      )}

                      {/* Hover Glow Effect */}
                      {isHovered && !isUsed && (
                        <div className="absolute inset-0 rounded-xl bg-[#0da1c7]/10 pointer-events-none animate-pulse" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Empty State */}
              {(slotsByCategory[activeCategory] || []).filter(s => !usedSlots.has(s.id)).length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-slate-400">
                  <p className="text-sm">All {getCategoryInfo(activeCategory).label} slots are filled</p>
                  <p className="text-xs mt-1">Try another category</p>
                </div>
              )}
            </div>

            {/* Footer with keyboard hint */}
            <div className="px-4 py-2 border-t border-gray-100 bg-gray-50/50">
              <p className="text-[10px] text-gray-400 text-center">
                Click to select • Press <kbd className="px-1 py-0.5 bg-gray-200 rounded text-gray-600 font-mono">Esc</kbd> to close
              </p>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

