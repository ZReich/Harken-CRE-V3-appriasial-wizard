import { useMemo } from 'react';
// ReactNode is used via React.FC return type

interface SidebarTabProps {
  id: string;
  label: string;
  Icon: React.FC<{ className?: string }>;
  isActive: boolean;
  completion: number;
  showProgress?: boolean;
  onClick: () => void;
  accentColor?: string;
}

export function SidebarTab({
  id: _id,
  label,
  Icon,
  isActive,
  completion,
  showProgress = true,
  onClick,
  accentColor = '#0da1c7',
}: SidebarTabProps) {
  void _id; // Used for identification in parent components
  const isComplete = completion === 100;
  const hasProgress = completion > 0 && completion < 100;

  // Compute styles based on state
  const containerClasses = useMemo(() => {
    const base = 'w-full text-left px-4 py-3 rounded-lg text-sm transition-all duration-200';

    if (isActive) {
      return `${base} bg-opacity-10 font-medium`;
    }

    return `${base} text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800`;
  }, [isActive]);

  const containerStyle = useMemo(() => {
    if (isActive) {
      return { backgroundColor: `${accentColor}15`, color: accentColor };
    }
    return {};
  }, [isActive, accentColor]);

  return (
    <button
      onClick={onClick}
      className={containerClasses}
      style={containerStyle}
    >
      <div className="flex items-center gap-3">
        {/* Icon with completion indicator */}
        <div className="relative flex-shrink-0">
          <Icon className="w-5 h-5" />
          {showProgress && isComplete && (
            <div
              className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full flex items-center justify-center bg-green-500 animate-scale-in"
            >
              <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
        </div>

        {/* Label and progress */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="truncate">{label}</span>
            {showProgress && (
              <span
                className={`text-xs tabular-nums flex-shrink-0 ${isComplete ? 'text-green-600 dark:text-green-400 font-medium' :
                    hasProgress ? 'text-gray-500 dark:text-slate-300' : 'text-gray-400 dark:text-slate-400'
                  }`}
              >
                {completion}%
              </span>
            )}
          </div>

          {/* Progress bar */}
          {showProgress && (
            <div className="h-1 bg-gray-200 dark:bg-slate-700 rounded-full mt-1.5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ease-out ${isComplete ? 'bg-green-500' : ''
                  }`}
                style={{
                  width: `${completion}%`,
                  backgroundColor: isComplete ? undefined : accentColor,
                }}
              />
            </div>
          )}
        </div>
      </div>
    </button>
  );
}

// For backwards compatibility - simple tab without progress
interface SimpleSidebarTabProps {
  label: string;
  Icon: React.FC<{ className?: string }>;
  isActive: boolean;
  onClick: () => void;
  accentColor?: string;
}

export function SimpleSidebarTab({
  label,
  Icon,
  isActive,
  onClick,
  accentColor = '#0da1c7',
}: SimpleSidebarTabProps) {
  return (
    <SidebarTab
      id={label}
      label={label}
      Icon={Icon}
      isActive={isActive}
      completion={0}
      showProgress={false}
      onClick={onClick}
      accentColor={accentColor}
    />
  );
}

export default SidebarTab;

