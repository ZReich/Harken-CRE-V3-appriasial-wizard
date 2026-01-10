// src/components/guidance/InfoTooltip.tsx
// Contextual information tooltip with hover/click display

import React, { useState, useRef, useEffect } from 'react';
import { Info, HelpCircle, X } from 'lucide-react';
import { createPortal } from 'react-dom';

export type TooltipVariant = 'info' | 'help' | 'warning';
export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right' | 'auto';

interface InfoTooltipProps {
  /** Tooltip content - can be a string or JSX */
  content: React.ReactNode;
  /** Optional title for the tooltip */
  title?: string;
  /** Icon variant: 'info' (default) or 'help' */
  variant?: TooltipVariant;
  /** Position preference (will auto-adjust if out of viewport) */
  position?: TooltipPosition;
  /** Size of the icon */
  iconSize?: number;
  /** Custom className for the icon button */
  className?: string;
  /** If true, tooltip is always visible (controlled mode) */
  isOpen?: boolean;
  /** Callback when tooltip visibility changes */
  onOpenChange?: (isOpen: boolean) => void;
  /** Maximum width of the tooltip */
  maxWidth?: number;
  /** If true, clicking opens a modal-like tooltip instead of hover */
  clickToOpen?: boolean;
}

const VARIANT_ICONS = {
  info: Info,
  help: HelpCircle,
  warning: Info,
};

const VARIANT_COLORS = {
  info: 'text-harken-blue dark:text-cyan-400',
  help: 'text-harken-gray-med dark:text-slate-400 hover:text-harken-blue dark:hover:text-cyan-400',
  warning: 'text-amber-500 dark:text-amber-400',
};

const VARIANT_BG = {
  info: 'bg-harken-blue/5 dark:bg-cyan-500/10 border-harken-blue/20 dark:border-cyan-500/30',
  help: 'bg-surface-1 dark:bg-elevation-1 border-light-border dark:border-harken-gray',
  warning: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-500/30',
};

export function InfoTooltip({
  content,
  title,
  variant = 'info',
  position = 'auto',
  iconSize = 16,
  className = '',
  isOpen: controlledOpen,
  onOpenChange,
  maxWidth = 320,
  clickToOpen = false,
}: InfoTooltipProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [adjustedPosition, setAdjustedPosition] = useState<TooltipPosition>(position === 'auto' ? 'top' : position);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setIsOpen = (value: boolean) => {
    if (controlledOpen === undefined) {
      setInternalOpen(value);
    }
    onOpenChange?.(value);
  };

  const Icon = VARIANT_ICONS[variant];

  // Calculate tooltip position
  useEffect(() => {
    if (!isOpen || !triggerRef.current) return;

    const trigger = triggerRef.current;
    const rect = trigger.getBoundingClientRect();
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    // Calculate best position if auto
    let bestPosition: TooltipPosition = position === 'auto' ? 'top' : position;
    
    if (position === 'auto') {
      // Prefer top, but check if there's space
      const spaceTop = rect.top;
      const spaceBottom = viewport.height - rect.bottom;
      const spaceLeft = rect.left;
      const spaceRight = viewport.width - rect.right;

      if (spaceTop < 100 && spaceBottom > spaceTop) {
        bestPosition = 'bottom';
      } else if (spaceLeft < maxWidth / 2 && spaceRight > spaceLeft) {
        bestPosition = 'right';
      } else if (spaceRight < maxWidth / 2 && spaceLeft > spaceRight) {
        bestPosition = 'left';
      }
    }

    setAdjustedPosition(bestPosition);

    // Calculate position based on adjusted position
    let top = 0;
    let left = 0;

    switch (bestPosition) {
      case 'top':
        top = rect.top - 8;
        left = rect.left + rect.width / 2;
        break;
      case 'bottom':
        top = rect.bottom + 8;
        left = rect.left + rect.width / 2;
        break;
      case 'left':
        top = rect.top + rect.height / 2;
        left = rect.left - 8;
        break;
      case 'right':
        top = rect.top + rect.height / 2;
        left = rect.right + 8;
        break;
    }

    setTooltipPosition({ top, left });
  }, [isOpen, position, maxWidth]);

  // Close on outside click for click mode
  useEffect(() => {
    if (!clickToOpen || !isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node) &&
        tooltipRef.current &&
        !tooltipRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [clickToOpen, isOpen]);

  // Close on escape
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  const handleTrigger = () => {
    if (clickToOpen) {
      setIsOpen(!isOpen);
    }
  };

  const handleMouseEnter = () => {
    if (!clickToOpen) {
      setIsOpen(true);
    }
  };

  const handleMouseLeave = () => {
    if (!clickToOpen) {
      setIsOpen(false);
    }
  };

  // Position classes for tooltip arrow
  const arrowClasses: Record<TooltipPosition, string> = {
    top: 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45',
    bottom: 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-45',
    left: 'right-0 top-1/2 -translate-y-1/2 translate-x-1/2 rotate-45',
    right: 'left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 rotate-45',
    auto: 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45',
  };

  // Transform origin for animation
  const transformOrigins: Record<TooltipPosition, string> = {
    top: 'origin-bottom',
    bottom: 'origin-top',
    left: 'origin-right',
    right: 'origin-left',
    auto: 'origin-bottom',
  };

  // Tooltip transform based on position
  const tooltipTransforms: Record<TooltipPosition, string> = {
    top: '-translate-x-1/2 -translate-y-full',
    bottom: '-translate-x-1/2',
    left: '-translate-x-full -translate-y-1/2',
    right: '-translate-y-1/2',
    auto: '-translate-x-1/2 -translate-y-full',
  };

  return (
    <>
      <button
        ref={triggerRef}
        onClick={handleTrigger}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`inline-flex items-center justify-center transition-colors ${VARIANT_COLORS[variant]} ${className}`}
        type="button"
        aria-label={title || 'More information'}
      >
        <Icon size={iconSize} />
      </button>

      {isOpen &&
        createPortal(
          <div
            ref={tooltipRef}
            className={`
              fixed z-[9999] px-4 py-3 rounded-xl shadow-xl border
              ${VARIANT_BG[variant]}
              ${transformOrigins[adjustedPosition]}
              ${tooltipTransforms[adjustedPosition]}
              animate-fade-in
            `}
            style={{
              top: tooltipPosition.top,
              left: tooltipPosition.left,
              maxWidth,
            }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {/* Arrow */}
            <div
              className={`absolute w-3 h-3 ${VARIANT_BG[variant].split(' ')[0]} ${arrowClasses[adjustedPosition]}`}
            />

            {/* Content */}
            <div className="relative">
              {clickToOpen && (
                <button
                  onClick={() => setIsOpen(false)}
                  className="absolute -top-1 -right-1 p-0.5 rounded-full text-harken-gray-med hover:text-harken-dark dark:hover:text-white transition-colors"
                >
                  <X size={14} />
                </button>
              )}
              {title && (
                <h4 className="text-sm font-semibold text-harken-dark dark:text-white mb-1 pr-4">
                  {title}
                </h4>
              )}
              <div className="text-sm text-harken-gray dark:text-slate-300 leading-relaxed">
                {content}
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}

export default InfoTooltip;
