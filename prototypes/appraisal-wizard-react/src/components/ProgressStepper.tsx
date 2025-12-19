import { useNavigate } from 'react-router-dom';

interface ProgressStepperProps {
  currentPhase: number;
  pages: { path: string; label: string }[];
}

export default function ProgressStepper({ currentPhase, pages }: ProgressStepperProps) {
  const navigate = useNavigate();

  return (
    <div className="bg-white border-b border-gray-200 py-4 px-8">
      <div className="flex items-center justify-center gap-2">
        {pages.map((page, idx) => {
          const phaseNum = idx + 1;
          const isCompleted = phaseNum < currentPhase;
          const isActive = phaseNum === currentPhase;
          const isInactive = phaseNum > currentPhase;

          return (
            <div key={page.path} className="flex items-center gap-2">
              {/* Phase Circle + Label */}
              <div
                className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => navigate(page.path)}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm ${
                    isCompleted
                      ? 'bg-green-500 text-white'
                      : isActive
                      ? 'bg-[#0da1c7] text-white'
                      : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  {isCompleted ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    phaseNum
                  )}
                </div>
                <span
                  className={`text-xs font-medium ${
                    isActive ? 'text-gray-900 font-semibold' : isCompleted ? 'text-gray-600' : 'text-gray-400'
                  }`}
                >
                  {page.label}
                </span>
              </div>

              {/* Connector */}
              {idx < pages.length - 1 && (
                <div
                  className={`w-16 h-0.5 ${
                    phaseNum < currentPhase ? 'bg-[#0da1c7]' : 'bg-gray-200'
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

