import { ReactNode } from 'react';
import { ThemeToggle } from './ThemeToggle';

interface WizardHeaderProps {
  title: string;
  subtitle: string;
  phase: number;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onContinue: () => void;
  onPrevious: () => void;
  guidanceMode?: 'guidance' | 'values' | 'preview';
  onGuidanceModeChange?: (mode: 'guidance' | 'values' | 'preview') => void;
  isGuidanceVisible?: boolean;
  onToggleGuidance?: () => void;
  hasGuidance?: boolean;
  hasSections?: boolean;
  isSectionsCollapsed?: boolean;
  onToggleSections?: () => void;
  // New: Scenario switcher slot
  scenarioSwitcher?: ReactNode;
  // New: Theme accent color
  themeAccent?: string;
  // Show preview mode toggle
  showPreviewMode?: boolean;
}

export default function WizardHeader({
  title,
  subtitle,
  phase: _phase,
  isFullscreen,
  onToggleFullscreen,
  onContinue,
  onPrevious: _onPrevious,
  guidanceMode = 'guidance',
  onGuidanceModeChange,
  isGuidanceVisible = true,
  onToggleGuidance,
  hasGuidance = false,
  hasSections = false,
  isSectionsCollapsed = false,
  onToggleSections,
  scenarioSwitcher,
  themeAccent,
  showPreviewMode = false,
}: WizardHeaderProps) {
  // Compute dynamic styles based on theme accent
  const accentColor = themeAccent || '#0da1c7';
  const continueButtonStyle = {
    backgroundColor: accentColor,
  };
  const continueButtonHoverClass = themeAccent ? '' : 'hover:bg-[#0b8fb0]';

  return (
    <div
      className={`bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 ${
        isFullscreen ? 'py-2 px-6' : 'py-3 px-8'
      }`}
      style={themeAccent ? { borderBottomColor: `${themeAccent}20` } : undefined}
    >
      {/* Scenario Switcher Row (if provided) */}
      {scenarioSwitcher && !isFullscreen && (
        <div className="mb-3 pb-3 border-b border-gray-200/50">
          {scenarioSwitcher}
        </div>
      )}

      <div className="flex items-center justify-between">
        {/* Title */}
        <div>
          <div className="flex items-center gap-3 mb-1">
            {hasSections && (
              <button
                onClick={onToggleSections}
                className="p-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg bg-white"
                title={isSectionsCollapsed ? 'Show sections' : 'Hide sections'}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={isSectionsCollapsed ? 'M9 5l7 7-7 7' : 'M15 19l-7-7 7-7'}
                  />
                </svg>
              </button>
            )}
            <h1
              className={`font-bold text-gray-900 dark:text-white ${
                isFullscreen ? 'text-lg' : 'text-2xl'
              }`}
            >
              {title}
            </h1>
            <span 
              className="px-3 py-1 rounded-md text-xs font-semibold"
              style={themeAccent 
                ? { backgroundColor: `${themeAccent}15`, color: themeAccent }
                : undefined
              }
              {...(!themeAccent && { className: 'px-3 py-1 rounded-md text-xs font-semibold bg-blue-100 text-blue-800' })}
            >
              In Progress
            </span>
          </div>
          {!isFullscreen && (
            <p className="text-sm text-gray-600 dark:text-slate-400">{subtitle}</p>
          )}
        </div>

        {/* Center Controls */}
        <div className="flex items-center gap-3">
          {/* Guidance/Values/Preview Toggle */}
          {hasGuidance && (
            <div className="flex items-center bg-gray-100 rounded-lg p-1 border border-gray-200">
              <button
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  guidanceMode === 'guidance'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
                onClick={() => onGuidanceModeChange?.('guidance')}
              >
                Guidance
              </button>
              <button
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors border-l border-gray-200 ${
                  guidanceMode === 'values'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
                onClick={() => onGuidanceModeChange?.('values')}
              >
                Values
              </button>
              {showPreviewMode && (
                <button
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors border-l border-gray-200 flex items-center gap-1.5 ${
                    guidanceMode === 'preview'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                  onClick={() => onGuidanceModeChange?.('preview')}
                  title="Live preview of how photos will appear in the report"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Preview
                </button>
              )}
              <button
                className="ml-2 px-2 py-1 text-xs font-medium text-gray-600 hover:text-gray-900"
                onClick={onToggleGuidance}
                title={isGuidanceVisible ? 'Hide panel' : 'Show panel'}
              >
                {isGuidanceVisible ? 'Hide' : 'Show'}
              </button>
            </div>
          )}

          {/* Fullscreen Toggle */}
          <button
            onClick={onToggleFullscreen}
            className="p-2 text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700"
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
          {/* Theme Toggle */}
          <ThemeToggle size="sm" showSystemOption />
          
          <button className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Exit
          </button>
          <button className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-600 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            Save Draft
          </button>
          <button
            onClick={onContinue}
            className={`px-6 py-2 text-sm font-semibold text-white rounded-lg flex items-center gap-2 ${continueButtonHoverClass}`}
            style={continueButtonStyle}
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
