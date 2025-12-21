import { useEffect, useState } from 'react';
import { ChartAnimation } from './animations';

interface ScenarioCelebrationProps {
  scenarioName: string;
  isVisible: boolean;
  onDismiss: () => void;
  duration?: number;  // in seconds
}

/**
 * Mini celebration overlay for when a scenario is completed in Analysis
 * Less intrusive than the full CelebrationOverlay
 */
export function ScenarioCelebration({
  scenarioName,
  isVisible,
  onDismiss,
  duration = 2,
}: ScenarioCelebrationProps) {
  const [isExiting, setIsExiting] = useState(false);

  // Auto-dismiss after duration
  useEffect(() => {
    if (!isVisible) return;

    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onDismiss, 300); // Wait for exit animation
    }, duration * 1000);

    return () => clearTimeout(timer);
  }, [isVisible, duration, onDismiss]);

  if (!isVisible) return null;

  return (
    <div 
      className={`fixed bottom-8 right-8 z-40 ${isExiting ? 'animate-slide-out-right' : 'animate-slide-in-right'}`}
    >
      <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm border-l-4 border-green-500">
        {/* Compact chart animation */}
        <div className="mb-4 h-24 overflow-hidden">
          <ChartAnimation />
        </div>

        {/* Message */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-gray-900">
              {scenarioName} Complete!
            </h3>
            <p className="text-sm text-gray-600">
              All approaches have value conclusions
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4 h-1 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-green-500 rounded-full"
            style={{
              animation: `shrink-width ${duration}s linear forwards`,
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default ScenarioCelebration;

