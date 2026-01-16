import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWizard } from '../context/WizardContext';
import { COMPLETION_SCHEMA, shouldTrackProgress } from '../constants/completionSchema';
import ProgressCircle from './ProgressCircle';

interface ProgressStepperProps {
  currentPhase: number;
  pages: { path: string; label: string }[];
}

export default function ProgressStepper({ currentPhase, pages }: ProgressStepperProps) {
  const navigate = useNavigate();
  const { getSectionCompletion } = useWizard();

  const handleNavigate = (path: string) => {
    const hardNavigatePaths = new Set(['/subject-data', '/analysis', '/review']);
    const shouldHardNavigate =
      hardNavigatePaths.has(path) ||
      hardNavigatePaths.has(window.location.pathname);

    if (shouldHardNavigate) {
      window.location.assign(path);
      return;
    }

    navigate(path);
  };

  // Get completion data for each section
  const sectionData = useMemo(() => {
    return pages.map((page, idx) => {
      const schema = COMPLETION_SCHEMA.find(s => s.path === page.path);
      const sectionId = schema?.id || '';
      const completion = getSectionCompletion(sectionId);
      const trackProgress = shouldTrackProgress(sectionId);

      return {
        ...page,
        sectionId,
        completion,
        trackProgress,
        phaseNum: idx + 1,
      };
    });
  }, [pages, getSectionCompletion]);

  return (
      <div className="w-full bg-surface-1 dark:bg-elevation-1 border-b border-light-border dark:border-slate-600 transition-colors duration-300 sticky top-0 z-[999999] pointer-events-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between relative">

          {/* Progress Bar Background Line (Absolute) - for continuous connection look */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[2px] bg-harken-gray-light dark:bg-elevation-1 -z-10 hidden sm:block" />

          {sectionData.map((section, idx) => {
            const { phaseNum, trackProgress, completion, path, label } = section;
            const isCompleted = completion === 100;
            const isActive = phaseNum === currentPhase;
            const hasVisited = phaseNum < currentPhase;

            // Determine connector color for the progress bar segments
            // This is handled by the individual flex items if we want a segmented bar, 
            // or we connect them visually. 
            // Here we'll use a flex-based approach where each item (except last) grows to connect to the next.

            return (
              <div
                key={path}
                className={`flex items-center ${idx < pages.length - 1 ? 'flex-1' : ''} group`}
              >
                {/* Step Item - ensure clickability with explicit pointer-events */}
                <div className="flex items-center gap-3 relative z-10 bg-surface-1 dark:bg-elevation-1 pr-2 pointer-events-auto">
                  <ProgressCircle
                    phaseNum={phaseNum}
                    completion={completion}
                    isActive={isActive}
                    isCompleted={isCompleted}
                    trackProgress={trackProgress}
                    onClick={() => handleNavigate(path)}
                  />

                  {/* Label - Hide on very small screens if needed, or adjust font */}
                  <div className="hidden md:flex flex-col cursor-pointer" onClick={() => handleNavigate(path)}>
                    <span className={`text-xs font-bold uppercase tracking-wider transition-colors duration-200 ${isActive ? 'text-harken-blue dark:text-[#22d3ee]' :
                      isCompleted ? 'text-green-600 dark:text-green-500' :
                        hasVisited ? 'text-harken-gray dark:text-slate-400' :
                          'text-harken-gray-med dark:text-slate-500 group-hover:text-harken-gray-med dark:group-hover:text-slate-500'
                      }`}>
                      Step {phaseNum}
                    </span>
                    <span className={`text-sm font-semibold transition-colors duration-200 whitespace-nowrap ${isActive ? 'text-harken-dark dark:text-white' :
                      isCompleted ? 'text-harken-dark dark:text-white' :
                        hasVisited ? 'text-harken-gray dark:text-slate-400' :
                          'text-harken-gray-med dark:text-slate-500'
                      }`}>
                      {label}
                    </span>
                  </div>
                </div>

                {/* Connector Line (Dynamic) */}
                {idx < pages.length - 1 && (
                  <div className="flex-1 h-[2px] mx-4 rounded-full relative overflow-hidden bg-harken-gray-light dark:bg-elevation-1">
                    <div
                      className={`absolute inset-0 transition-all duration-500 ease-out ${isCompleted
                        ? 'bg-green-500 dark:bg-green-600 translate-x-0'
                        : isActive
                          ? 'bg-gradient-to-r from-harken-blue to-harken-gray-med-lt dark:from-harken-blue dark:to-harken-dark opacity-50'
                          : '-translate-x-full bg-harken-gray-med-lt dark:bg-elevation-1'
                        }`}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
