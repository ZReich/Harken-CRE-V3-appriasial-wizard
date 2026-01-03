import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Home,
  Sofa,
  Trees,
  Route,
  Check,
  Image as ImageIcon,
  Crosshair
} from 'lucide-react';
import { PHOTO_SLOTS } from '../services/photoClassification';

interface FloatingDropPanelProps {
  isVisible: boolean;
  draggedPhotoPreview?: string;
  usedSlots: Set<string>;
  onDropToSlot: (slotId: string) => void;
}

// Category configuration
const CATEGORIES = [
  { id: 'exterior', label: 'Exterior', Icon: Home, color: 'blue' },
  { id: 'interior', label: 'Interior', Icon: Sofa, color: 'purple' },
  { id: 'site', label: 'Site', Icon: Trees, color: 'green' },
  { id: 'street', label: 'Street', Icon: Route, color: 'amber' },
];

// Group slots by category
function getSlotsByCategory(): Record<string, typeof PHOTO_SLOTS> {
  const grouped: Record<string, typeof PHOTO_SLOTS> = {};
  PHOTO_SLOTS.forEach(slot => {
    if (!grouped[slot.category]) {
      grouped[slot.category] = [];
    }
    grouped[slot.category].push(slot);
  });
  return grouped;
}

export default function FloatingDropPanel({
  isVisible,
  draggedPhotoPreview,
  usedSlots,
  onDropToSlot,
}: FloatingDropPanelProps) {
  const [hoveredSlot, setHoveredSlot] = useState<string | null>(null);
  const [showPanel, setShowPanel] = useState(false);
  const slotsByCategory = getSlotsByCategory();

  // Animate in/out
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => setShowPanel(true), 50);
      return () => clearTimeout(timer);
    } else {
      setShowPanel(false);
    }
  }, [isVisible]);

  if (!isVisible && !showPanel) return null;

  const handleDragOver = (e: React.DragEvent, slotId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!usedSlots.has(slotId)) {
      setHoveredSlot(slotId);
      e.dataTransfer.dropEffect = 'move';
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setHoveredSlot(null);
  };

  const handleDrop = (e: React.DragEvent, slotId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!usedSlots.has(slotId)) {
      onDropToSlot(slotId);
    }
    setHoveredSlot(null);
  };

  return createPortal(
    <div
      className={`
        fixed top-0 right-0 h-full w-[300px] z-[9998]
        transition-transform duration-300 ease-out
        ${showPanel ? 'translate-x-0' : 'translate-x-full'}
      `}
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-l from-black/20 to-transparent pointer-events-none" />

      {/* Panel */}
      <div className="absolute inset-y-0 right-0 w-[280px] bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-l border-gray-200 dark:border-slate-700 shadow-2xl shadow-black/20 flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 px-4 py-4 border-b border-gray-200 dark:border-slate-700 bg-gradient-to-br from-[#0da1c7]/15 via-[#4db8d1]/10 to-white dark:from-[#0da1c7]/10 dark:to-slate-800">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 rounded-xl bg-[#0da1c7] animate-ping opacity-20" />
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-[#0da1c7] to-[#4db8d1] flex items-center justify-center shadow-lg shadow-[#0da1c7]/30">
                <Crosshair className="w-5 h-5 text-white" />
              </div>
            </div>
            <div>
              <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                Drop Photo Here
                <span className="inline-flex h-2 w-2 rounded-full bg-[#0da1c7] animate-pulse" />
              </h3>
              <p className="text-xs text-gray-500 dark:text-slate-400">Drag to any slot below</p>
            </div>
          </div>

          {/* Preview of dragged photo */}
          {draggedPhotoPreview && (
            <div className="mt-3 flex items-center gap-2 p-2 bg-white dark:bg-slate-700/50 rounded-lg shadow-sm border border-gray-100 dark:border-slate-600/50">
              <div className="w-10 h-10 rounded-md overflow-hidden flex-shrink-0">
                <img src={draggedPhotoPreview} alt="Dragging" className="w-full h-full object-cover" />
              </div>
              <p className="text-xs text-gray-600 dark:text-slate-300 truncate">Dragging photo...</p>
            </div>
          )}
        </div>

        {/* Scrollable Slots List */}
        <div className="flex-1 overflow-y-auto">
          {CATEGORIES.map((category, catIndex) => {
            const categorySlots = slotsByCategory[category.id] || [];
            const CatIcon = category.Icon;
            const availableCount = categorySlots.filter(s => !usedSlots.has(s.id)).length;

            if (availableCount === 0) return null;

            return (
              <div
                key={category.id}
                className="border-b border-gray-100 last:border-b-0"
                style={{ animationDelay: `${catIndex * 50}ms` }}
              >
                {/* Category Header */}
                <div className={`
                  sticky top-0 px-4 py-2 flex items-center gap-2
                  bg-gradient-to-r from-${category.color}-50 to-white dark:from-${category.color}-900/30 dark:to-slate-800
                  border-b border-${category.color}-100/50 dark:border-${category.color}-700/50
                `}>
                  <CatIcon className={`w-4 h-4 text-${category.color}-500 dark:text-${category.color}-400`} />
                  <span className="text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wide">
                    {category.label}
                  </span>
                  <span className={`ml-auto px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-${category.color}-100 dark:bg-${category.color}-900/40 text-${category.color}-600 dark:text-${category.color}-300`}>
                    {availableCount}
                  </span>
                </div>

                {/* Slots */}
                <div className="px-2 py-2 space-y-1">
                  {categorySlots.map((slot, slotIndex) => {
                    const isUsed = usedSlots.has(slot.id);
                    const isHovered = hoveredSlot === slot.id;

                    if (isUsed) return null;

                    return (
                      <div
                        key={slot.id}
                        onDragOver={(e) => handleDragOver(e, slot.id)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, slot.id)}
                        className={`
                          flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer
                          transition-all duration-200 border-2 animate-slot-reveal
                          ${isHovered
                            ? 'border-[#0da1c7] bg-[#0da1c7]/10 scale-[1.02] shadow-lg shadow-[#0da1c7]/20 animate-glow-pulse'
                            : 'border-transparent bg-gray-50 dark:bg-slate-700/40 hover:bg-gray-100 dark:hover:bg-slate-700/60'
                          }
                        `}
                        style={{
                          '--stagger-delay': `${(catIndex * 100) + (slotIndex * 30)}ms`,
                        } as React.CSSProperties}
                      >
                        {/* Slot Icon */}
                        <div className={`
                          w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
                          transition-all duration-200
                          ${isHovered
                            ? 'bg-[#0da1c7] shadow-lg'
                            : 'bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600'
                          }
                        `}>
                          {isHovered ? (
                            <Check className="w-5 h-5 text-white" />
                          ) : (
                            <ImageIcon className="w-4 h-4 text-gray-400" />
                          )}
                        </div>

                        {/* Slot Info */}
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate ${isHovered ? 'text-[#0da1c7] dark:text-[#4db8d1]' : 'text-gray-700 dark:text-slate-200'}`}>
                            {slot.label}
                          </p>
                          <p className="text-[10px] text-gray-400 dark:text-slate-400 truncate">
                            {slot.description}
                          </p>
                        </div>

                        {/* Drop indicator */}
                        {isHovered && (
                          <div className="flex-shrink-0 w-2 h-2 rounded-full bg-[#0da1c7] animate-pulse" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer hint */}
        <div className="flex-shrink-0 px-4 py-3 border-t border-gray-200 dark:border-slate-700 bg-gray-50/80 dark:bg-slate-800/80">
          <p className="text-[10px] text-gray-400 dark:text-slate-400 text-center">
            Release to drop photo into the highlighted slot
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
}

