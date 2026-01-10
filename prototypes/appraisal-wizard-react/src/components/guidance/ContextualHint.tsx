// src/components/guidance/ContextualHint.tsx
// Contextual hint component that appears near target elements

import React, { useState, useEffect, useRef } from 'react';
import { X, Lightbulb, ArrowRight } from 'lucide-react';
import { useGuidanceHint, GuidanceTopic } from './GuidanceProvider';
import { createPortal } from 'react-dom';

interface ContextualHintProps {
  /** Unique ID for this hint (for tracking seen/dismissed) */
  hintId: string;
  /** Topic category for this hint */
  topic: GuidanceTopic;
  /** Hint title */
  title: string;
  /** Hint content */
  content: React.ReactNode;
  /** Position relative to children */
  position?: 'top' | 'bottom' | 'left' | 'right';
  /** Children to wrap (the target element) */
  children: React.ReactNode;
  /** Optional action button */
  action?: {
    label: string;
    onClick: () => void;
  };
  /** Delay before showing (ms) */
  showDelay?: number;
  /** Custom className for the hint */
  className?: string;
}

export function ContextualHint({
  hintId,
  topic,
  title,
  content,
  position = 'bottom',
  children,
  action,
  showDelay = 1000,
  className = '',
}: ContextualHintProps) {
  const { shouldShow, onSeen, onDismiss } = useGuidanceHint(hintId, topic);
  const [isVisible, setIsVisible] = useState(false);
  const [hintPosition, setHintPosition] = useState({ top: 0, left: 0 });
  const targetRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);

  // Show hint after delay
  useEffect(() => {
    if (!shouldShow) return;

    const timer = setTimeout(() => {
      setIsVisible(true);
      onSeen();
    }, showDelay);

    return () => clearTimeout(timer);
  }, [shouldShow, showDelay, onSeen]);

  // Calculate position
  useEffect(() => {
    if (!isVisible || !targetRef.current) return;

    const updatePosition = () => {
      if (!targetRef.current) return;

      const rect = targetRef.current.getBoundingClientRect();
      const hintWidth = 320;
      const hintHeight = 150;
      const gap = 12;

      let top = 0;
      let left = 0;

      switch (position) {
        case 'top':
          top = rect.top - hintHeight - gap;
          left = rect.left + rect.width / 2 - hintWidth / 2;
          break;
        case 'bottom':
          top = rect.bottom + gap;
          left = rect.left + rect.width / 2 - hintWidth / 2;
          break;
        case 'left':
          top = rect.top + rect.height / 2 - hintHeight / 2;
          left = rect.left - hintWidth - gap;
          break;
        case 'right':
          top = rect.top + rect.height / 2 - hintHeight / 2;
          left = rect.right + gap;
          break;
      }

      // Keep within viewport
      const viewport = {
        width: window.innerWidth,
        height: window.innerHeight,
      };

      left = Math.max(16, Math.min(left, viewport.width - hintWidth - 16));
      top = Math.max(16, Math.min(top, viewport.height - hintHeight - 16));

      setHintPosition({ top, left });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isVisible, position]);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss();
  };

  const handleAction = () => {
    action?.onClick();
    setIsVisible(false);
  };

  // Arrow position classes
  const arrowPositions: Record<string, string> = {
    top: 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45',
    bottom: 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-45',
    left: 'right-0 top-1/2 -translate-y-1/2 translate-x-1/2 rotate-45',
    right: 'left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 rotate-45',
  };

  return (
    <>
      <div ref={targetRef} className="inline-block">
        {children}
      </div>

      {isVisible &&
        createPortal(
          <div
            ref={hintRef}
            className={`
              fixed z-[9998] w-80 bg-amber-50 dark:bg-amber-900/30 
              border border-amber-200 dark:border-amber-500/30 
              rounded-xl shadow-xl p-4 animate-fade-in
              ${className}
            `}
            style={{
              top: hintPosition.top,
              left: hintPosition.left,
            }}
          >
            {/* Arrow */}
            <div
              className={`absolute w-3 h-3 bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-500/30 ${arrowPositions[position]}`}
              style={{
                borderWidth: position === 'top' || position === 'left' ? '0 1px 1px 0' : '1px 0 0 1px',
              }}
            />

            {/* Close button */}
            <button
              onClick={handleDismiss}
              className="absolute top-2 right-2 p-1 text-amber-500 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 rounded transition-colors"
            >
              <X size={16} />
            </button>

            {/* Content */}
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 p-1.5 bg-amber-100 dark:bg-amber-800/30 rounded-lg">
                <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1 min-w-0 pr-4">
                <h4 className="font-semibold text-amber-800 dark:text-amber-300 text-sm mb-1">
                  {title}
                </h4>
                <div className="text-sm text-amber-700 dark:text-amber-200/90">
                  {content}
                </div>
              </div>
            </div>

            {/* Action button */}
            {action && (
              <div className="mt-3 flex justify-end">
                <button
                  onClick={handleAction}
                  className="flex items-center gap-1 text-xs font-medium text-amber-700 dark:text-amber-300 hover:text-amber-800 dark:hover:text-amber-200 transition-colors"
                >
                  {action.label}
                  <ArrowRight size={14} />
                </button>
              </div>
            )}

            {/* Don't show again */}
            <button
              onClick={handleDismiss}
              className="mt-2 text-[11px] text-amber-500 dark:text-amber-400/70 hover:text-amber-600 dark:hover:text-amber-300"
            >
              Don't show this again
            </button>
          </div>,
          document.body
        )}
    </>
  );
}

export default ContextualHint;
