import { ReactNode, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWizard } from '../context/WizardContext';
import ProgressStepper from './ProgressStepper';
import WizardHeader from './WizardHeader';
import CelebrationOverlay from './CelebrationOverlay';

interface WizardLayoutProps {
  children: ReactNode;
  sidebar?: ReactNode;
  helpSidebarGuidance?: ReactNode;
  helpSidebarValues?: ReactNode;
  helpSidebarPreview?: ReactNode;
  title: string;
  subtitle: string;
  phase: number;
  noPadding?: boolean;
  // New: Scenario switcher component (rendered in header)
  scenarioSwitcher?: ReactNode;
  // New: Theme accent color for dynamic theming
  themeAccent?: string;
  // New: Sidebar accent color for approach color-coding
  sidebarAccent?: string;
  // Smart Continue: Custom handler that cycles through tabs before advancing
  onContinue?: () => void;
  // Show preview mode toggle in header
  showPreviewMode?: boolean;
}

export default function WizardLayout({
  children,
  sidebar,
  helpSidebarGuidance,
  helpSidebarValues,
  helpSidebarPreview,
  title,
  subtitle,
  phase,
  noPadding = false,
  scenarioSwitcher,
  themeAccent,
  sidebarAccent,
  onContinue: customOnContinue,
  showPreviewMode = false,
}: WizardLayoutProps) {
  const { state, toggleFullscreen } = useWizard();
  const navigate = useNavigate();
  const [leftCollapsed, setLeftCollapsed] = useState(state.isFullscreen);
  const [rightCollapsed, setRightCollapsed] = useState(state.isFullscreen);
  const [guidanceMode, setGuidanceMode] = useState<'guidance' | 'values' | 'preview'>(
    'guidance'
  );
  
  // Track previous sidebar states before fullscreen
  const prevLeftCollapsed = useRef(false);
  const prevRightCollapsed = useRef(false);

  const pages = [
    { path: '/template', label: 'Template' },
    { path: '/document-intake', label: 'Documents' },
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
    // Use custom handler if provided (for smart tab cycling)
    if (customOnContinue) {
      customOnContinue();
      return;
    }
    // Default: navigate to next phase
    if (phase < 6) {
      navigate(pages[phase].path);
    }
  };

  const handlePrevious = () => {
    if (phase > 1) {
      navigate(pages[phase - 2].path);
    }
  };

  const hasHelpSidebar = Boolean(helpSidebarGuidance || helpSidebarValues || helpSidebarPreview);
  const helpSidebar =
    guidanceMode === 'preview'
      ? helpSidebarPreview || helpSidebarGuidance
      : guidanceMode === 'values'
        ? helpSidebarValues || helpSidebarGuidance
        : helpSidebarGuidance || helpSidebarValues;

  // Compute background tint based on theme accent
  const getBackgroundTint = () => {
    if (!themeAccent) return undefined;
    // Apply a very subtle wash based on the theme color
    return `linear-gradient(to bottom, ${themeAccent}05 0%, transparent 100px)`;
  };

  // Compute sidebar border accent
  const getSidebarStyle = () => {
    if (!sidebarAccent) return {};
    return {
      borderLeftColor: `${sidebarAccent}30`,
      borderLeftWidth: '3px',
    };
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-50 dark:bg-slate-900">
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
        guidanceMode={guidanceMode}
        onGuidanceModeChange={setGuidanceMode}
        isGuidanceVisible={!rightCollapsed}
        onToggleGuidance={() => setRightCollapsed(!rightCollapsed)}
        hasGuidance={hasHelpSidebar}
        hasSections={Boolean(sidebar)}
        isSectionsCollapsed={leftCollapsed}
        onToggleSections={() => setLeftCollapsed(!leftCollapsed)}
        scenarioSwitcher={scenarioSwitcher}
        themeAccent={themeAccent}
        showPreviewMode={showPreviewMode && Boolean(helpSidebarPreview)}
      />

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        {sidebar && (
          <aside
            className={`bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 overflow-y-auto transition-all duration-300 ${
              leftCollapsed ? 'w-0 border-r-0' : 'w-[17rem]'
            }`}
          >
            {!leftCollapsed && <div className="p-6">{sidebar}</div>}
          </aside>
        )}

        {/* Main Content */}
        <main 
          className="flex-1 min-w-0 bg-white dark:bg-slate-900 relative"
          style={themeAccent ? { background: getBackgroundTint() } : undefined}
        >
          <div className={noPadding ? 'absolute inset-0' : 'p-8 h-full overflow-auto'}>{children}</div>
        </main>

        {/* Right Sidebar (Guidance/Values Panel) */}
        {hasHelpSidebar && (
          <aside
            className={`bg-white dark:bg-slate-800 border-l border-gray-200 dark:border-slate-700 overflow-y-auto transition-all duration-300 ${
              rightCollapsed ? 'w-0 border-l-0' : 'w-[20rem]'
            }`}
            style={!rightCollapsed ? getSidebarStyle() : undefined}
          >
            {!rightCollapsed && <div className="p-6">{helpSidebar}</div>}
          </aside>
        )}

      </div>

      {/* Celebration Overlay - renders on top of everything */}
      <CelebrationOverlay />
    </div>
  );
}
