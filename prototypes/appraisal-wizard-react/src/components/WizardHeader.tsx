interface WizardHeaderProps {
  title: string;
  subtitle: string;
  phase: number;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onContinue: () => void;
  onPrevious: () => void;
}

export default function WizardHeader({
  title,
  subtitle,
  phase,
  isFullscreen,
  onToggleFullscreen,
  onContinue,
  onPrevious,
}: WizardHeaderProps) {
  return (
    <div
      className={`bg-gray-50 border-b border-gray-200 ${
        isFullscreen ? 'py-2 px-6' : 'py-4 px-8'
      }`}
    >
      <div className="flex items-center justify-between">
        {/* Title */}
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1
              className={`font-bold text-gray-900 ${
                isFullscreen ? 'text-lg' : 'text-2xl'
              }`}
            >
              {title}
            </h1>
            <span className="px-3 py-1 rounded-md text-xs font-semibold bg-blue-100 text-blue-800">
              In Progress
            </span>
          </div>
          {!isFullscreen && (
            <p className="text-sm text-gray-600">{subtitle}</p>
          )}
        </div>

        {/* Center Controls */}
        <div className="flex items-center gap-3">
          {/* Guidance/Values Toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button className="px-3 py-1.5 text-sm font-medium rounded-md bg-white text-gray-900 shadow-sm">
              Guidance
            </button>
            <button className="px-3 py-1.5 text-sm font-medium rounded-md text-gray-600">
              Values
            </button>
          </div>

          {/* Fullscreen Toggle */}
          <button
            onClick={onToggleFullscreen}
            className="p-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
            title={isFullscreen ? 'Exit Full Screen' : 'Enter Full Screen'}
          >
            {isFullscreen ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            )}
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Exit
          </button>
          <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            Save Draft
          </button>
          <button
            onClick={onContinue}
            className="px-6 py-2 text-sm font-semibold text-white bg-[#0da1c7] rounded-lg hover:bg-[#0b8fb0] flex items-center gap-2"
          >
            Continue
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

