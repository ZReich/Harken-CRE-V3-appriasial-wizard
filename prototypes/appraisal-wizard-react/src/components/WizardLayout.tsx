import { ReactNode, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWizard } from '../context/WizardContext';
import ProgressStepper from './ProgressStepper';
import WizardHeader from './WizardHeader';

interface WizardLayoutProps {
  children: ReactNode;
  sidebar?: ReactNode;
  helpSidebar?: ReactNode;
  title: string;
  subtitle: string;
  phase: number;
  noPadding?: boolean;
}

export default function WizardLayout({
  children,
  sidebar,
  helpSidebar,
  title,
  subtitle,
  phase,
  noPadding = false,
}: WizardLayoutProps) {
  const { state, toggleFullscreen } = useWizard();
  const navigate = useNavigate();
  const [leftCollapsed, setLeftCollapsed] = useState(state.isFullscreen);
  const [rightCollapsed, setRightCollapsed] = useState(state.isFullscreen);
  
  // Track previous sidebar states before fullscreen
  const prevLeftCollapsed = useRef(false);
  const prevRightCollapsed = useRef(false);

  const pages = [
    { path: '/template', label: 'Template' },
    { path: '/setup', label: 'Setup' },
    { path: '/subject-data', label: 'Subject Data' },
    { path: '/analysis', label: 'Analysis' },
    { path: '/review', label: 'Review' },
  ];

  // Handle fullscreen toggle - collapse/restore sidebars
  const handleToggleFullscreen = () => {
    if (!state.isFullscreen) {
      // Entering fullscreen - save current states and collapse
      prevLeftCollapsed.current = leftCollapsed;
      prevRightCollapsed.current = rightCollapsed;
      setLeftCollapsed(true);
      setRightCollapsed(true);
    } else {
      // Exiting fullscreen - restore previous states
      setLeftCollapsed(prevLeftCollapsed.current);
      setRightCollapsed(prevRightCollapsed.current);
    }
    toggleFullscreen();
  };

  // Sync sidebar state if fullscreen changes from elsewhere
  useEffect(() => {
    if (state.isFullscreen) {
      setLeftCollapsed(true);
      setRightCollapsed(true);
    }
  }, [state.isFullscreen]);

  const handleNext = () => {
    if (phase < 5) {
      navigate(pages[phase].path);
    }
  };

  const handlePrevious = () => {
    if (phase > 1) {
      navigate(pages[phase - 2].path);
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-50">
      {/* Progress Stepper */}
      {!state.isFullscreen && (
        <ProgressStepper currentPhase={phase} pages={pages} />
      )}

      {/* Header */}
      <WizardHeader
        title={title}
        subtitle={subtitle}
        phase={phase}
        isFullscreen={state.isFullscreen}
        onToggleFullscreen={handleToggleFullscreen}
        onContinue={handleNext}
        onPrevious={handlePrevious}
      />

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar Toggle */}
        {sidebar && (
          <button
            onClick={() => setLeftCollapsed(!leftCollapsed)}
            className="fixed top-1/2 -translate-y-1/2 z-50 bg-[#0da1c7] text-white w-6 h-14 rounded-r-md shadow-lg hover:bg-[#0b8fb0] hover:w-7 transition-all flex items-center justify-center"
            style={{ left: leftCollapsed ? 0 : '17rem' }}
          >
            <svg
              className={`w-4 h-4 transition-transform ${leftCollapsed ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {/* Left Sidebar */}
        {sidebar && (
          <aside
            className={`bg-white border-r border-gray-200 overflow-y-auto transition-all duration-300 ${
              leftCollapsed ? 'w-0 border-r-0' : 'w-[17rem]'
            }`}
          >
            {!leftCollapsed && <div className="p-6">{sidebar}</div>}
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1 min-w-0 bg-white relative">
          <div className={noPadding ? 'absolute inset-0' : 'p-8 h-full overflow-auto'}>{children}</div>
        </main>

        {/* Right Sidebar */}
        {helpSidebar && (
          <aside
            className={`bg-white border-l border-gray-200 overflow-y-auto transition-all duration-300 ${
              rightCollapsed ? 'w-0 border-l-0' : 'w-[20rem]'
            }`}
          >
            {!rightCollapsed && <div className="p-6">{helpSidebar}</div>}
          </aside>
        )}

        {/* Right Sidebar Toggle */}
        {helpSidebar && (
          <button
            onClick={() => setRightCollapsed(!rightCollapsed)}
            className="fixed top-1/2 -translate-y-1/2 z-50 bg-[#0da1c7] text-white w-6 h-14 rounded-l-md shadow-lg hover:bg-[#0b8fb0] hover:w-7 transition-all flex items-center justify-center"
            style={{ right: rightCollapsed ? 0 : '20rem' }}
          >
            <svg
              className={`w-4 h-4 transition-transform ${rightCollapsed ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
