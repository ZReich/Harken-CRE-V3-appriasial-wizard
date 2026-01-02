import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Sparkles } from 'lucide-react';
import type { PhotoData } from '../types';

interface PhotoQuickPeekProps {
  photo: PhotoData;
  slotLabel: string;
  categoryLabel: string;
  anchorElement: HTMLElement | null;
  isVisible: boolean;
  onClose: () => void;
}

export const PhotoQuickPeek: React.FC<PhotoQuickPeekProps> = ({
  photo,
  slotLabel,
  categoryLabel,
  anchorElement,
  isVisible,
  onClose,
}) => {
  const [position, setPosition] = useState({ top: 0, left: 0, placement: 'right' as 'left' | 'right' });
  const [isAnimating, setIsAnimating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate position relative to anchor element
  const updatePosition = useCallback(() => {
    if (!anchorElement) return;
    
    const rect = anchorElement.getBoundingClientRect();
    const previewWidth = 420;
    const previewHeight = 320;
    const padding = 16;

    // Check available space on each side
    const spaceOnRight = window.innerWidth - rect.right;
    const spaceOnLeft = rect.left;

    let placement: 'left' | 'right' = 'right';
    let left = rect.right + padding;
    let top = 0;

    // Always try to place to the side (right or left) to avoid overlapping with photo
    // Choose the side with more space, even if it means some clipping
    if (spaceOnRight >= spaceOnLeft) {
      // More space on right - place there (may clip if not enough room)
      placement = 'right';
      left = rect.right + padding;
      // Clamp to ensure it stays mostly visible
      left = Math.min(left, window.innerWidth - previewWidth - padding);
    } else {
      // More space on left - place there (may clip if not enough room)
      placement = 'left';
      left = rect.left - previewWidth - padding;
      // Clamp to ensure it stays mostly visible
      left = Math.max(padding, left);
    }

    // Vertical positioning - center with anchor, but keep in viewport
    top = rect.top + rect.height / 2 - previewHeight / 2;
    top = Math.max(padding, Math.min(top, window.innerHeight - previewHeight - padding));

    setPosition({ top, left, placement });
  }, [anchorElement]);

  // Update position when visibility changes or anchor moves
  useEffect(() => {
    if (isVisible && anchorElement) {
      updatePosition();
      setIsAnimating(true);
    }
  }, [isVisible, anchorElement, updatePosition]);

  // Handle window resize
  useEffect(() => {
    if (!isVisible) return;
    
    const handleResize = () => updatePosition();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isVisible, updatePosition]);

  if (!isVisible || !anchorElement) return null;

  const formattedDate = photo.takenDate 
    ? new Date(photo.takenDate).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      })
    : '';

  return createPortal(
    <div
      ref={containerRef}
      className={`fixed z-50 transition-all duration-200 ease-out ${
        isAnimating ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
      }`}
      style={{
        top: position.top,
        left: position.left,
        transformOrigin: position.placement === 'right' ? 'left center' : 'right center',
      }}
      onMouseEnter={() => {}} // Keep preview open when hovering over it
      onMouseLeave={onClose}
    >
      {/* Preview Card */}
      <div 
        className="w-[400px] bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden"
        style={{
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        }}
      >
        {/* Mini Report Header */}
        <div className="bg-[#1E4A3F] text-white px-4 py-2">
          <h4 className="text-sm font-semibold">Subject Property Photos</h4>
        </div>

        {/* Photo Grid Preview */}
        <div className="p-4 bg-white dark:bg-slate-800">
          <div className="grid grid-cols-2 gap-2">
            {/* Featured photo (larger) */}
            <div className="col-span-1 row-span-2">
              <div className="relative h-32 bg-slate-100 rounded-lg overflow-hidden border-2 border-[#0da1c7]">
                <img
                  src={photo.preview}
                  alt={photo.caption || slotLabel}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                  <p className="text-white text-[10px] font-medium truncate">
                    {photo.caption || slotLabel}
                  </p>
                </div>
              </div>
            </div>

            {/* Empty placeholder slots */}
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-[60px] bg-slate-50 rounded-lg border border-dashed border-slate-200 flex items-center justify-center">
                <span className="text-[9px] text-slate-300">Empty</span>
              </div>
            ))}
          </div>

          {/* Attribution */}
          {(photo.takenBy || formattedDate) && (
            <div className="mt-3 pt-2 border-t border-slate-100 text-center">
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                {photo.takenBy && `Taken By: ${photo.takenBy}`}
                {photo.takenBy && formattedDate && ', '}
                {formattedDate}
              </p>
            </div>
          )}
        </div>

        {/* Helper Text */}
        <div className="px-4 py-3 bg-gradient-to-r from-[#0da1c7]/10 to-[#4db8d1]/5 border-t border-[#0da1c7]/20">
          <p className="text-xs text-[#1c3643] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#0da1c7]" />
            <span>
              This is how your <strong>{categoryLabel}</strong> photo will appear in the final report's photo addenda.
            </span>
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default PhotoQuickPeek;

