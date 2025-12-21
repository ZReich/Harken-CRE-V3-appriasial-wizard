import { useMemo } from 'react';

interface SectionProgressSummaryProps {
  completion: number;
  label?: string;
  accentColor?: string;
  showPercentage?: boolean;
}

export function SectionProgressSummary({
  completion,
  label = 'Overall Progress',
  accentColor = '#0da1c7',
  showPercentage = true,
}: SectionProgressSummaryProps) {
  const isComplete = completion === 100;

  const progressBarColor = useMemo(() => {
    if (isComplete) return '#22c55e'; // green-500
    return accentColor;
  }, [isComplete, accentColor]);

  return (
    <div className="mt-6 pt-4 border-t border-gray-200">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-gray-600">{label}</span>
        {showPercentage && (
          <span 
            className={`text-xs font-semibold tabular-nums ${
              isComplete ? 'text-green-600' : 'text-gray-700'
            }`}
          >
            {completion}%
          </span>
        )}
      </div>
      
      {/* Progress bar */}
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ 
            width: `${completion}%`,
            backgroundColor: progressBarColor,
          }}
        />
      </div>

      {/* Completion message */}
      {isComplete && (
        <div className="mt-2 flex items-center gap-1.5 text-green-600 animate-fade-in">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-xs font-medium">Section Complete!</span>
        </div>
      )}
    </div>
  );
}

export default SectionProgressSummary;

