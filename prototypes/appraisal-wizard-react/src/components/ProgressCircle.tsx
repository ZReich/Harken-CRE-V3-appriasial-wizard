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
  size = 36, // Slightly smaller default for better density
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

    const fillPercent = Math.min(100, Math.max(0, completion));
    return {
      background: `conic-gradient(rgba(34, 197, 94, 0.4) ${fillPercent * 3.6}deg, transparent 0deg)`,
    };
  }, [completion, trackProgress, isCompleted]);

  // Determine circle background and border
  const getCircleClasses = () => {
    if (isCompleted) {
      return 'bg-green-500 border-green-500 text-white';
    }
    if (isActive) {
      return 'bg-harken-blue border-harken-blue text-white shadow-md shadow-cyan-500/20';
    }
    // Visited but not complete -> Slight emphasis
    if (completion > 0 && !isCompleted) {
      return 'bg-surface-1 dark:bg-elevation-1 border-green-400 dark:border-green-500/50 text-harken-gray dark:text-white';
    }
    // Pending
    return 'bg-surface-1 dark:bg-elevation-1 border-light-border dark:border-dark-border text-harken-gray-med dark:text-slate-500';
  };

  return (
    <button
      type="button"
      className={`relative rounded-full flex items-center justify-center transition-all duration-300 outline-none focus:ring-2 focus:ring-offset-2 focus:ring-harken-blue dark:focus:ring-offset-slate-900 ${isActive ? 'ring-2 ring-offset-2 ring-harken-blue dark:ring-offset-harken-dark scale-110' : 'hover:border-light-border dark:hover:border-harken-gray'
        } ${justCompleted ? 'scale-125' : ''}`}
      onClick={onClick}
      style={{ width: size, height: size }}
      aria-label={`Go to phase ${phaseNum}`}
    >
      {/* Background/Base Border */}
      <div className={`absolute inset-0 rounded-full border-2 transition-colors duration-300 ${getCircleClasses().split(' ').filter(c =>
        c.startsWith('bg-') ||
        c.startsWith('border-') ||
        c.startsWith('dark:bg-') ||
        c.startsWith('dark:border-')
      ).join(' ')}`} />

      {/* Partial Fill (Conic for circular progress feel) - Only if not active/complete to avoid clash */}
      {trackProgress && !isCompleted && !isActive && completion > 0 && (
        <div
          className="absolute inset-[2px] rounded-full transition-all duration-500 opacity-50"
          style={gradientStyle}
        />
      )}

      {/* Content */}
      <div className={`relative z-10 flex items-center justify-center font-bold text-sm transition-colors duration-300 ${isCompleted || isActive ? 'text-white' : 'text-harken-gray-med dark:text-slate-200'}`}>
        {isCompleted ? (
          <svg
            className={`w-4 h-4 ${justCompleted ? 'animate-bounce-once' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={3}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <span>{phaseNum}</span>
        )}
      </div>

      {/* Active Indicator Pulse (Subtle) */}
      {isActive && !isCompleted && (
        <div className="absolute inset-0 rounded-full border border-white dark:border-slate-900 animate-ping-slow opacity-30" />
      )}

      {/* Completion Ring Effect */}
      {justCompleted && (
        <div className="absolute inset-0 rounded-full border-2 border-green-500 animate-ping-once opacity-50" />
      )}
    </button>
  );
}

export default ProgressCircle;

