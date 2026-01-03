import { useMemo, useEffect, useState } from 'react';

interface ProgressCircleProps {
  phaseNum: number;
  completion: number;  // 0-100
  isActive: boolean;
  isCompleted: boolean;
  trackProgress: boolean;  // Whether to show fill animation
  onClick: () => void;
  size?: number;
}

export function ProgressCircle({
  phaseNum,
  completion,
  isActive,
  isCompleted,
  trackProgress,
  onClick,
  size = 40,
}: ProgressCircleProps) {
  const [justCompleted, setJustCompleted] = useState(false);

  // Detect when transitioning to complete
  useEffect(() => {
    if (isCompleted && !justCompleted) {
      setJustCompleted(true);
      const timer = setTimeout(() => setJustCompleted(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [isCompleted]);

  // Calculate gradient for partial fill
  const gradientStyle = useMemo(() => {
    if (!trackProgress || isCompleted) return {};
    
    // Fill from bottom to top
    const fillPercent = Math.min(100, Math.max(0, completion));
    return {
      background: `linear-gradient(to top, 
        rgba(34, 197, 94, 0.5) ${fillPercent}%, 
        transparent ${fillPercent}%
      )`,
    };
  }, [completion, trackProgress, isCompleted]);

  // Determine circle background
  const getCircleClasses = () => {
    if (isCompleted) {
      return `bg-green-500 text-white ${justCompleted ? 'animate-pulse-once' : ''}`;
    }
    if (isActive) {
      return 'bg-[#0da1c7] text-white';
    }
    return 'bg-gray-200 dark:bg-slate-600 text-gray-400 dark:text-slate-300';
  };

  return (
    <button
      type="button"
      className={`relative cursor-pointer hover:opacity-90 transition-all duration-200 ${
        justCompleted ? 'scale-110' : ''
      }`}
      onClick={onClick}
      style={{ width: size, height: size }}
      aria-label={`Go to phase ${phaseNum}`}
    >
      {/* Base circle */}
      <div
        className={`w-full h-full rounded-full flex items-center justify-center font-semibold text-sm relative overflow-hidden ${getCircleClasses()}`}
      >
        {/* Fill overlay for progress (only for trackProgress sections) */}
        {trackProgress && !isCompleted && completion > 0 && (
          <div 
            className="absolute inset-0 rounded-full transition-all duration-500"
            style={gradientStyle}
          />
        )}

        {/* Content */}
        <div className="relative z-10">
          {isCompleted ? (
            <svg 
              className={`w-5 h-5 ${justCompleted ? 'animate-bounce-once' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={3} 
                d="M5 13l4 4L19 7" 
              />
            </svg>
          ) : (
            <span>{phaseNum}</span>
          )}
        </div>
      </div>

      {/* Completion ring effect */}
      {justCompleted && (
        <div className="absolute inset-0 rounded-full border-2 border-green-400 animate-ping-once" />
      )}
    </button>
  );
}

export default ProgressCircle;

