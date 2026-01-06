import { useMemo } from 'react';
import { useWizard } from '../context/WizardContext';
import { COMPLETION_SCHEMA, shouldTrackProgress } from '../constants/completionSchema';
import ProgressCircle from './ProgressCircle';

interface ProgressStepperProps {
  currentPhase: number;
  pages: { path: string; label: string }[];
}

export default function ProgressStepper({ currentPhase, pages }: ProgressStepperProps) {
  const { getSectionCompletion } = useWizard();

  // Force full page navigation to work around react-router issues
  const handleNavigate = (path: string) => {
    window.location.href = path;
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
    <div className="w-full bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between relative">

          {/* Progress Bar Background Line (Absolute) - for continuous connection look */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[2px] bg-gray-100 dark:bg-slate-800 -z-10 hidden sm:block" />

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
                {/* Step Item */}
                <div className="flex items-center gap-3 relative bg-white dark:bg-slate-900 pr-2">
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
                    <span className={`text-xs font-bold uppercase tracking-wider transition-colors duration-200 ${isActive ? 'text-[#0da1c7] dark:text-[#22d3ee]' :
                      isCompleted ? 'text-green-600 dark:text-green-500' :
                        hasVisited ? 'text-gray-600 dark:text-slate-400' :
                          'text-gray-400 dark:text-slate-600 group-hover:text-gray-500 dark:group-hover:text-slate-500'
                      }`}>
                      Step {phaseNum}
                    </span>
                    <span className={`text-sm font-semibold transition-colors duration-200 whitespace-nowrap ${isActive ? 'text-gray-900 dark:text-white' :
                      isCompleted ? 'text-gray-800 dark:text-gray-200' :
                        hasVisited ? 'text-gray-600 dark:text-slate-400' :
                          'text-gray-400 dark:text-slate-600'
                      }`}>
                      {label}
                    </span>
                  </div>
                </div>

                {/* Connector Line (Dynamic) */}
                {idx < pages.length - 1 && (
                  <div className="flex-1 h-[2px] mx-4 rounded-full relative overflow-hidden bg-gray-100 dark:bg-slate-800">
                    <div
                      className={`absolute inset-0 transition-all duration-500 ease-out ${isCompleted
                        ? 'bg-green-500 dark:bg-green-600 translate-x-0'
                        : isActive
                          ? 'bg-gradient-to-r from-[#0da1c7] to-gray-200 dark:from-[#0da1c7] dark:to-slate-800 opacity-50'
                          : '-translate-x-full bg-gray-200 dark:bg-slate-700'
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
