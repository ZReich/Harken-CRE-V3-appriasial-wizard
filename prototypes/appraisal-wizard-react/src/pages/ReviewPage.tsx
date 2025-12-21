import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import WizardLayout from '../components/WizardLayout';
import {
  ClipboardCheckIcon,
  ChartIcon,
  DocumentIcon,
} from '../components/icons';
import { CompletionChecklist, ValueReconciliation, ReportEditor } from '../features/review';
import type { ReviewTabId } from '../features/review';
import { SidebarTab } from '../components/SidebarTab';
import { SectionProgressSummary } from '../components/SectionProgressSummary';
import { useCompletion } from '../hooks/useCompletion';
import { useCelebration } from '../hooks/useCelebration';
import { useSmartContinue } from '../hooks/useSmartContinue';

// =================================================================
// CONFETTI ANIMATION
// =================================================================

function triggerCelebration() {
  const colors = ['#0da1c7', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];
  for (let i = 0; i < 50; i++) {
    setTimeout(() => {
      const confetti = document.createElement('div');
      confetti.style.position = 'fixed';
      confetti.style.left = Math.random() * window.innerWidth + 'px';
      confetti.style.top = '-20px';
      confetti.style.width = '10px';
      confetti.style.height = '10px';
      confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.borderRadius = '50%';
      confetti.style.pointerEvents = 'none';
      confetti.style.zIndex = '9999';
      document.body.appendChild(confetti);

      const duration = 2000 + Math.random() * 1000;
      const endY = window.innerHeight + 20;

      confetti.animate(
        [
          { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
          { transform: `translateY(${endY}px) rotate(${Math.random() * 720}deg)`, opacity: 0 },
        ],
        {
          duration: duration,
          easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        }
      ).onfinish = () => confetti.remove();
    }, i * 30);
  }
}

// =================================================================
// SUCCESS SCREEN COMPONENT
// =================================================================

function SuccessScreen({ onCreateAnother, onViewReport }: { onCreateAnother: () => void; onViewReport: () => void }) {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center animate-fade-in">
        <div className="mb-6">
          <svg className="w-32 h-32 mx-auto text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-3">Report Finalized!</h2>
        <p className="text-lg text-gray-600 mb-8">Your appraisal report has been successfully generated.</p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={onViewReport}
            className="px-6 py-3 bg-[#0da1c7] text-white font-semibold rounded-lg hover:bg-[#0890a8]"
          >
            View Report
          </button>
          <button
            onClick={onCreateAnother}
            className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50"
          >
            Create Another
          </button>
        </div>
      </div>
    </div>
  );
}

// =================================================================
// FINALIZE BUTTON COMPONENT
// =================================================================

function FinalizeButton({ onFinalize }: { onFinalize: () => void }) {
  return (
    <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 mt-6">
      <div className="flex items-center gap-4">
        <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-green-900 mb-1">Ready to Finalize</h3>
          <p className="text-sm text-green-800">
            Review your work and click "Finalize Report" to generate the final PDF.
          </p>
        </div>
        <button
          onClick={onFinalize}
          className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
        >
          Finalize Report
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// =================================================================
// MAIN REVIEW PAGE COMPONENT
// =================================================================

export default function ReviewPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<ReviewTabId>('checklist');
  const [isFinalized, setIsFinalized] = useState(false);

  // Get celebration trigger for finale
  const { triggerSectionCelebration } = useCelebration();

  const handleFinalize = useCallback(() => {
    setIsFinalized(true);
    triggerCelebration(); // Keep existing confetti
    triggerSectionCelebration('review'); // Trigger the finale celebration overlay
  }, [triggerSectionCelebration]);

  const handleCreateAnother = useCallback(() => {
    navigate('/template');
  }, [navigate]);

  const handleViewReport = useCallback(() => {
    // Would navigate to report view
    navigate('/template');
  }, [navigate]);

  // Tab configuration
  const tabs: { id: ReviewTabId; label: string; icon: typeof ClipboardCheckIcon }[] = [
    { id: 'checklist', label: 'Completion Checklist', icon: ClipboardCheckIcon },
    { id: 'reconciliation', label: 'Value Reconciliation', icon: ChartIcon },
    { id: 'preview', label: 'Report Preview', icon: DocumentIcon },
  ];

  // Progress tracking
  const { tabCompletions, sectionCompletion, trackTabChange } = useCompletion('review');
  const { checkAndTriggerCelebration } = useCelebration();

  // Track tab changes for smart navigation
  useEffect(() => {
    trackTabChange(activeTab);
  }, [activeTab, trackTabChange]);

  // Smart continue logic (for cycling through review tabs)
  const { handleContinue: handleSmartContinue } = useSmartContinue({
    sectionId: 'review',
    tabs: tabs.map(t => t.id),
    activeTab,
    setActiveTab,
    currentPhase: 6,
  });

  // Get completion percentage for a specific tab
  const getTabCompletion = (tabId: string): number => {
    const tabData = tabCompletions.find(t => t.id === tabId);
    return tabData?.completion || 0;
  };

  // Sidebar with functional tab buttons
  const sidebar = (
    <div>
      <h2 className="text-lg font-bold text-gray-900 mb-1">Review & Finalize</h2>
      <p className="text-sm text-gray-500 mb-6">Final Checks</p>
      <nav className="space-y-1">
        {tabs.map((tab) => (
          <SidebarTab
            key={tab.id}
            id={tab.id}
            label={tab.label}
            Icon={tab.icon}
            isActive={activeTab === tab.id}
            completion={getTabCompletion(tab.id)}
            showProgress={true}
            onClick={() => setActiveTab(tab.id)}
          />
        ))}
      </nav>
      <SectionProgressSummary completion={sectionCompletion} />
    </div>
  );

  // Help sidebar content based on active tab
  const helpSidebar = (
    <div>
      <h3 className="text-lg font-bold text-gray-900 mb-3">
        {activeTab === 'checklist' && 'Finalization'}
        {activeTab === 'reconciliation' && 'Value Reconciliation'}
        {activeTab === 'preview' && 'Report Editor'}
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        {activeTab === 'checklist' &&
          'Review all sections for completeness and accuracy before generating the final report.'}
        {activeTab === 'reconciliation' &&
          'Assign weights to each valuation approach and provide reconciliation comments for each scenario.'}
        {activeTab === 'preview' &&
          'Preview and customize your report. Click on elements to edit text, fonts, and styling.'}
      </p>

      {activeTab === 'checklist' && (
        <>
          <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded mb-4">
            <h4 className="font-semibold text-sm text-green-900 mb-1">Ready to Finalize</h4>
            <p className="text-xs text-green-800">
              All required sections have been completed. You may proceed with report generation.
            </p>
          </div>
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
            <h4 className="font-semibold text-sm text-blue-900 mb-1">USPAP Compliance</h4>
            <p className="text-xs text-blue-800">
              Ensure all required certifications are signed and limiting conditions are properly disclosed.
            </p>
          </div>
        </>
      )}

      {activeTab === 'reconciliation' && (
        <>
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded mb-4">
            <h4 className="font-semibold text-sm text-blue-900 mb-1">Approach Weighting</h4>
            <p className="text-xs text-blue-800">
              Weights should reflect the reliability and applicability of each approach for this property type.
            </p>
          </div>
          <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded">
            <h4 className="font-semibold text-sm text-amber-900 mb-1">Reconciliation Comments</h4>
            <p className="text-xs text-amber-800">
              Provide clear reasoning for your weight assignments and how you arrived at the final value.
            </p>
          </div>
        </>
      )}

      {activeTab === 'preview' && (
        <>
          <div className="bg-purple-50 border-l-4 border-purple-400 p-4 rounded mb-4">
            <h4 className="font-semibold text-sm text-purple-900 mb-1">Edit Elements</h4>
            <p className="text-xs text-purple-800">
              Click on any text, image, or section to customize its appearance and content.
            </p>
          </div>
          <div className="bg-indigo-50 border-l-4 border-indigo-400 p-4 rounded">
            <h4 className="font-semibold text-sm text-indigo-900 mb-1">Add Text Blocks</h4>
            <p className="text-xs text-indigo-800">
              Use the "Add Text Block" button to add custom content anywhere on your report pages.
            </p>
          </div>
        </>
      )}
    </div>
  );

  // If finalized, show success screen
  if (isFinalized) {
    return (
      <WizardLayout
        title="Review & Finalize"
        subtitle="Phase 6 of 6 • Report Complete"
        phase={6}
        sidebar={sidebar}
        helpSidebarGuidance={helpSidebar}
      >
        <SuccessScreen onCreateAnother={handleCreateAnother} onViewReport={handleViewReport} />
      </WizardLayout>
    );
  }

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'checklist':
        return (
          <>
            <CompletionChecklist />
            <div className="max-w-4xl mx-auto">
              <FinalizeButton onFinalize={handleFinalize} />
            </div>
          </>
        );

      case 'reconciliation':
        return (
          <>
            <ValueReconciliation />
            <div className="max-w-6xl mx-auto">
              <FinalizeButton onFinalize={handleFinalize} />
            </div>
          </>
        );

      case 'preview':
        return <ReportEditor />;

      default:
        return null;
    }
  };

  return (
    <WizardLayout
      title="Review & Finalize"
      subtitle="Phase 6 of 6 • Final Review & Reconciliation"
      phase={6}
      sidebar={sidebar}
      helpSidebarGuidance={activeTab !== 'preview' ? helpSidebar : undefined}
      noPadding={activeTab === 'preview'}
      onContinue={handleSmartContinue}
    >
      {renderContent()}
    </WizardLayout>
  );
}
