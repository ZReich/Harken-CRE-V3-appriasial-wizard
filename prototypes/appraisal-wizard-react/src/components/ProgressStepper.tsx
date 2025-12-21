import { useNavigate } from 'react-router-dom';
import { useMemo } from 'react';
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
    <div className="bg-white border-b border-gray-200 py-4 px-8">
      <div className="flex items-center justify-center gap-2">
        {sectionData.map((section, idx) => {
          const { phaseNum, trackProgress, completion, path, label } = section;
          // A section is ONLY completed when it reaches 100% - not just because user navigated past it
          const isCompleted = completion === 100;
          const isActive = phaseNum === currentPhase;
          // Sections user has visited but not completed should show as "in progress"
          const hasVisited = phaseNum < currentPhase;

          return (
            <div key={path} className="flex items-center gap-2">
              {/* Phase Circle + Label */}
              <div className="flex items-center gap-2">
                <ProgressCircle
                  phaseNum={phaseNum}
                  completion={completion}
                  isActive={isActive}
                  isCompleted={isCompleted}
                  trackProgress={trackProgress}
                  onClick={() => navigate(path)}
                />
                <span
                  className={`text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity ${
                    isActive ? 'text-gray-900 font-semibold' : 
                    isCompleted ? 'text-green-600 font-medium' : 
                    hasVisited ? 'text-gray-600' : 'text-gray-400'
                  }`}
                  onClick={() => navigate(path)}
                >
                  {label}
                </span>
              </div>

              {/* Connector - only colored when PREVIOUS section is truly complete */}
              {idx < pages.length - 1 && (
                <div
                  className={`w-16 h-0.5 transition-colors duration-300 ${
                    isCompleted ? 'bg-[#0da1c7]' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
