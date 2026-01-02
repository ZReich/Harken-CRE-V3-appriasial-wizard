import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import WizardLayout from '../components/WizardLayout';
import {
  ClipboardCheckIcon,
  ChartIcon,
  ScaleIcon,
  TargetIcon,
  TrendingUpIcon,
} from '../components/icons';
import { CompletionChecklist, ValueReconciliation, ReportEditor } from '../features/review';
import type { ReviewTabId } from '../features/review';
import { SidebarTab } from '../components/SidebarTab';
import { SectionProgressSummary } from '../components/SectionProgressSummary';
import { useCompletion } from '../hooks/useCompletion';
import { useCelebration } from '../hooks/useCelebration';
import { useSmartContinue } from '../hooks/useSmartContinue';
import { useWizard } from '../context/WizardContext';
import { useComponentHealthAnalysis } from '../hooks/useComponentHealthAnalysis';
import { useToast } from '../context/ToastContext';
import EnhancedTextArea from '../components/EnhancedTextArea';
import SWOTAnalysis, { type SWOTData } from '../components/SWOTAnalysis';
import RiskRatingPanel from '../components/RiskRatingPanel';
import { MarketAnalysisGrid } from '../features/market-analysis';
import EconomicIndicatorsPanel from '../components/EconomicIndicatorsPanel';
import { Info, ArrowLeft, Save, FileCheck, CheckCircle, Sparkles, Loader2, FileText, Shield, Calculator } from 'lucide-react';
import { CostSegOverview } from '../features/cost-segregation/components/CostSegOverview';
import { CostSegFullReportEditor } from '../features/cost-segregation/components/CostSegFullReportEditor';
import { generateCostSegAnalysis } from '../services/costSegregationService';
import { generateSWOTSuggestions, convertToSimpleSWOT } from '../services/swotSuggestionService';
import type { CostSegAnalysis } from '../types';
import type { ReportState, ReportStateActions } from '../features/report-preview/hooks/useReportState';
import { useFinalizeFlow } from '../features/report-preview/hooks/useFinalizeFlow';
import { SaveChangesDialog, PostSaveDialog, TemplateSaveDialog, FinalizeDialog } from '../features/report-preview/components/dialogs';

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
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">Report Finalized!</h2>
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
            className="px-6 py-3 border-2 border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700"
          >
            Create Another
          </button>
        </div>
      </div>
    </div>
  );
}

// =================================================================
// READY TO PREVIEW SCREEN - Celebration & Transition
// =================================================================

function ReadyToPreviewScreen({ 
  onPreview, 
  onBack 
}: { 
  onPreview: () => void; 
  onBack: () => void;
}) {
  return (
    <div className="flex items-center justify-center h-full min-h-[500px]">
      <div className="text-center animate-fade-in max-w-lg">
        {/* Animated Checkmark */}
        <div className="mb-8 relative">
          <div className="w-32 h-32 mx-auto bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center shadow-xl shadow-green-200">
            <CheckCircle className="w-16 h-16 text-white" strokeWidth={2.5} />
          </div>
          <div className="absolute -top-2 -right-2 w-12 h-12 bg-amber-400 rounded-full flex items-center justify-center shadow-lg animate-bounce">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* Message */}
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
          Appraisal Analysis Complete!
        </h2>
        <p className="text-lg text-gray-600 mb-8">
          All sections have been reviewed and validated. Your report data is ready for preview and final generation.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 items-center">
          <button
            onClick={onPreview}
            className="px-8 py-4 bg-gradient-to-r from-[#0da1c7] to-[#0890b0] text-white font-bold rounded-xl hover:shadow-xl hover:scale-[1.02] transition-all flex items-center gap-3 text-lg"
          >
            Preview & Finalize Report
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <button
            onClick={onBack}
            className="px-6 py-2 text-gray-500 hover:text-gray-700 font-medium transition-colors"
          >
            ← Back to Completion Checklist
          </button>
        </div>

        {/* Info Note */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
          <p className="text-sm text-blue-800">
            <strong>What's next?</strong> In the report preview, you can customize formatting, 
            edit text, rearrange sections, and generate the final PDF for delivery.
          </p>
        </div>
      </div>
    </div>
  );
}

// =================================================================
// FULL-SCREEN REPORT PREVIEW MODE
// =================================================================

function ReportPreviewMode({ 
  onBack, 
  onFinalize,
  onSaveDraft,
  onSaveAsTemplate,
  onReportStateChange,
  isSaving,
  isDirty,
}: { 
  onBack: () => void; 
  onFinalize: () => void;
  onSaveDraft: () => void;
  onSaveAsTemplate: () => void;
  onReportStateChange?: (state: ReportState, actions: ReportStateActions) => void;
  isSaving?: boolean;
  isDirty?: boolean;
}) {
  return (
    <div className="fixed inset-0 bg-gray-100 z-50 flex flex-col overflow-hidden">
      {/* Custom Header */}
      <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 flex-shrink-0 shadow-sm z-10">
        {/* Left: Back Button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors font-medium"
        >
          <ArrowLeft size={18} />
          Back to Review
        </button>

        {/* Center: Title with dirty indicator */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-lg font-bold text-gray-800 dark:text-white">Report Preview</h1>
            {isDirty && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full">
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                Unsaved changes
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500">Edit and customize before generating</p>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={onSaveDraft}
            disabled={isSaving || !isDirty}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            {isSaving ? 'Saving...' : 'Save Draft'}
          </button>
          <button
            onClick={onSaveAsTemplate}
            className="flex items-center gap-2 px-4 py-2 border border-[#0da1c7] text-[#0da1c7] hover:bg-[#0da1c7]/5 rounded-lg transition-colors font-medium"
          >
            <FileText size={16} />
            Save as Template
          </button>
          <button
            onClick={onFinalize}
            className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold"
          >
            <FileCheck size={16} />
            Generate Final PDF
          </button>
        </div>
      </header>

      {/* Full-screen ReportEditor - flex-1 to fill remaining space */}
      <div className="flex-1 min-h-0">
        <ReportEditor 
          onSaveDraft={onSaveDraft}
          onReportStateChange={onReportStateChange}
        />
      </div>
    </div>
  );
}

// =================================================================
// MAIN REVIEW PAGE COMPONENT
// =================================================================

export default function ReviewPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<ReviewTabId>('hbu');
  const [isFinalized, setIsFinalized] = useState(false);
  const [showReadyToPreview, setShowReadyToPreview] = useState(false);
  const [showPreviewMode, setShowPreviewMode] = useState(false);
  const [, setHasCelebrated] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Cost Segregation state
  const [costSegAnalysis, setCostSegAnalysis] = useState<CostSegAnalysis | null>(null);
  const [isCostSegLoading, setIsCostSegLoading] = useState(false);
  const [costSegError, setCostSegError] = useState<string | null>(null);
  const [showCostSegReportEditor, setShowCostSegReportEditor] = useState(false);

  // Track report state from ReportEditor
  const reportStateRef = useRef<ReportState | null>(null);
  const reportActionsRef = useRef<ReportStateActions | null>(null);
  
  // State to track isDirty reactively (refs don't trigger re-renders)
  const [editorIsDirty, setEditorIsDirty] = useState(false);

  // Get celebration trigger for finale
  const { triggerSectionCelebration } = useCelebration();
  const { applyPreviewEdits, state: wizardState } = useWizard();
  
  // Analyze building component health for SWOT suggestions
  const componentHealth = useComponentHealthAnalysis({
    improvementsInventory: wizardState.improvementsInventory,
  });

  // Handler to receive report state from ReportEditor
  const handleReportStateChange = useCallback((state: ReportState, actions: ReportStateActions) => {
    reportStateRef.current = state;
    reportActionsRef.current = actions;
    setEditorIsDirty(state.isDirty); // Update state to trigger re-renders
  }, []);

  // Callback to get current report state for template saving
  const getReportState = useCallback(() => {
    if (!reportStateRef.current) return null;
    return {
      sectionVisibility: reportStateRef.current.sectionVisibility,
      sectionOrder: reportStateRef.current.sectionOrder,
      styling: reportStateRef.current.styling,
      customContent: reportStateRef.current.customContent,
      editedFields: reportStateRef.current.editedFields,
    };
  }, []);

  // Memoize the onSave callback to prevent unnecessary re-renders
  const handleFinalizeFlowSave = useCallback(async () => {
    if (!reportStateRef.current) return;
    applyPreviewEdits({
      editedFields: reportStateRef.current.editedFields,
      sectionVisibility: reportStateRef.current.sectionVisibility,
      customContent: reportStateRef.current.customContent,
      styling: reportStateRef.current.styling,
    });
    reportActionsRef.current?.markAsSaved();
    setEditorIsDirty(false);
  }, [applyPreviewEdits]);

  // Finalize flow state machine with connected options
  const [finalizeState, finalizeActions] = useFinalizeFlow({
    isDirty: editorIsDirty,
    onSave: handleFinalizeFlowSave,
    getReportState,
  });

  // Handler for entering preview mode
  const handleEnterPreviewMode = useCallback(() => {
    setShowReadyToPreview(false);
    setShowPreviewMode(true);
  }, []);

  // Handler for exiting preview mode back to review
  const handleExitPreviewMode = useCallback(() => {
    setShowPreviewMode(false);
    setActiveTab('checklist');
  }, []);

  // Handler for saving draft in preview mode
  const handleSaveDraft = useCallback(async () => {
    if (!reportStateRef.current) return;
    
    setIsSaving(true);
    
    try {
      // Apply edits to wizard state
      applyPreviewEdits({
        editedFields: reportStateRef.current.editedFields,
        sectionVisibility: reportStateRef.current.sectionVisibility,
        customContent: reportStateRef.current.customContent,
        styling: reportStateRef.current.styling,
      });
      
      // Mark as saved in report state
      reportActionsRef.current?.markAsSaved();
      
      // Simulate a slight delay for UX feedback
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Show success toast
      toast.success('Draft Saved', 'Your changes have been saved successfully.');
      
    } catch (error) {
      console.error('Failed to save draft:', error);
      toast.error('Save Failed', 'There was a problem saving your changes.');
    } finally {
      setIsSaving(false);
    }
  }, [applyPreviewEdits, toast]);

  // Handler for starting the finalize flow
  const handleFinalize = useCallback(() => {
    // Start the finalize flow - it will check for unsaved changes
    finalizeActions.startFinalize();
  }, [finalizeActions, editorIsDirty, finalizeState.stage]);

  // Handle successful finalization
  const handleFinalizeComplete = useCallback(() => {
    setIsFinalized(true);
    setShowPreviewMode(false);
    triggerCelebration(); // Keep existing confetti
    triggerSectionCelebration('review'); // Trigger the finale celebration overlay
  }, [triggerSectionCelebration]);

  // Store finalizeActions and toast in refs to use in useEffect without causing re-renders
  // This prevents infinite loops when these objects change reference
  const finalizeActionsRef = useRef(finalizeActions);
  finalizeActionsRef.current = finalizeActions;
  
  const toastRef = useRef(toast);
  toastRef.current = toast;

  // Watch for finalize flow state changes and show toasts
  const prevStageRef = useRef(finalizeState.stage);
  useEffect(() => {
    const prevStage = prevStageRef.current;
    const currentStage = finalizeState.stage;
    prevStageRef.current = currentStage;
    
    // Show toast when saving template completes (moved from saving-template to finalize-dialog)
    if (prevStage === 'saving-template' && currentStage === 'finalize-dialog' && finalizeState.savedTemplateId) {
      toastRef.current.success('Template Saved', 'Your report template has been saved successfully.');
    }
    
    // Show toast when save changes completes (moved from saving to post-save)
    if (prevStage === 'saving' && currentStage === 'post-save') {
      toastRef.current.success('Changes Saved', 'Your report changes have been saved.');
    }
    
    // Show toast for errors
    if (currentStage === 'error' && finalizeState.error) {
      toastRef.current.error('Error', finalizeState.error);
    }
    
    // Handle finalize completion
    if (currentStage === 'complete') {
      handleFinalizeComplete();
      // Use ref to avoid including finalizeActions in dependencies (prevents infinite loop)
      finalizeActionsRef.current.reset();
    }
  }, [finalizeState.stage, finalizeState.savedTemplateId, finalizeState.error, handleFinalizeComplete]);

  const handleCreateAnother = useCallback(() => {
    navigate('/template');
  }, [navigate]);

  const handleViewReport = useCallback(() => {
    // Would navigate to report view
    navigate('/template');
  }, [navigate]);

  // Handler for going back from ReadyToPreview screen
  const handleBackToChecklist = useCallback(() => {
    setShowReadyToPreview(false);
    setActiveTab('checklist');
  }, []);

  const { state, setRiskRating, setSwotAnalysis, setHbuAnalysis, setEconomicIndicators, dispatch } = useWizard();
  
  // Determine if property has improvements (for HBU As Improved visibility)
  const hasImprovements = useMemo(() => {
    if (!state.propertyType) return true;
    return state.propertyType !== 'land';
  }, [state.propertyType]);
  
  // Check if cost segregation is enabled
  const isCostSegEnabled = state.subjectData?.costSegregationEnabled === true;
  
  // Generate Cost Segregation analysis
  const handleGenerateCostSeg = useCallback(async () => {
    setIsCostSegLoading(true);
    setCostSegError(null);
    
    try {
      // Simulate async operation for UX feedback
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Calculate costs from improvements inventory if available
      const totalBuildingCost = 1200000; // Default estimate
      const totalSiteImprovementCost = 100000; // Default estimate
      const landValue = 200000; // Default estimate
      const totalProjectCost = totalBuildingCost + totalSiteImprovementCost + landValue;
      
      const analysis = generateCostSegAnalysis({
        propertyId: 'subject-property',
        propertyName: state.subjectData?.propertyName || state.subjectData?.address?.street || 'Subject Property',
        propertyAddress: state.subjectData?.address?.street || '',
        totalProjectCost,
        landValue,
        totalBuildingCost,
        totalSiteImprovementCost,
        occupancyCode: state.propertyType === 'industrial' ? 'WHS' : 
                       state.propertyType === 'office' ? 'OFF' : 
                       state.propertyType === 'retail' ? 'RTL' : 'COM',
        improvementsInventory: state.improvementsInventory,
      });
      
      setCostSegAnalysis(analysis);
    } catch (err) {
      setCostSegError(err instanceof Error ? err.message : 'Failed to generate analysis');
    } finally {
      setIsCostSegLoading(false);
    }
  }, [state.subjectData, state.propertyType, state.improvementsInventory]);

  // HBU text state - initialize from WizardContext if available
  const [hbuLegallyPermissible, setHbuLegallyPermissible] = useState(() => 
    state.hbuAnalysis?.asVacant?.legallyPermissible ?? ''
  );
  const [hbuPhysicallyPossible, setHbuPhysicallyPossible] = useState(() => 
    state.hbuAnalysis?.asVacant?.physicallyPossible ?? ''
  );
  const [hbuFinanciallyFeasible, setHbuFinanciallyFeasible] = useState(() => 
    state.hbuAnalysis?.asVacant?.financiallyFeasible ?? ''
  );
  const [hbuMaximallyProductive, setHbuMaximallyProductive] = useState(() => 
    state.hbuAnalysis?.asVacant?.maximallyProductive ?? ''
  );
  const [hbuAsImproved, setHbuAsImproved] = useState(() => 
    state.hbuAnalysis?.asImproved?.conclusion ?? ''
  );

  // Sync HBU data to WizardContext
  useEffect(() => {
    setHbuAnalysis({
      asVacant: {
        legallyPermissible: hbuLegallyPermissible,
        physicallyPossible: hbuPhysicallyPossible,
        financiallyFeasible: hbuFinanciallyFeasible,
        maximallyProductive: hbuMaximallyProductive,
        conclusion: hbuMaximallyProductive, // As vacant conclusion is the maximally productive
      },
      asImproved: {
        legallyPermissible: '', // Could be expanded with more fields
        physicallyPossible: '',
        financiallyFeasible: '',
        maximallyProductive: '',
        conclusion: hbuAsImproved,
      },
      overallConclusion: hasImprovements ? hbuAsImproved : hbuMaximallyProductive,
    });
  }, [hbuLegallyPermissible, hbuPhysicallyPossible, hbuFinanciallyFeasible, hbuMaximallyProductive, hbuAsImproved, hasImprovements, setHbuAnalysis]);
  
  // Draft All loading state
  const [isDraftingAllVacant, setIsDraftingAllVacant] = useState(false);

  // SWOT Analysis state
  const [swotData, setSwotDataLocal] = useState<SWOTData>({
    strengths: [],
    weaknesses: [],
    opportunities: [],
    threats: [],
    summary: '',
  });
  
  // Handler to update both local state and wizard state for SWOT
  const handleSwotChange = useCallback((data: SWOTData) => {
    setSwotDataLocal(data);
    // Save to wizard state for report generation
    setSwotAnalysis({
      strengths: data.strengths,
      weaknesses: data.weaknesses,
      opportunities: data.opportunities,
      threats: data.threats,
      summary: data.summary,
    });
  }, [setSwotAnalysis]);

  // Enhanced AI drafts with more market data, specificity, and neighborhood context
  // Matching the quality and depth of actual Rove Valuations appraisals
  const subjectAddress = state.subjectData?.address?.street || '6907 Entryway Drive';
  const zoningClass = state.subjectData?.zoningClass || 'I-1 (Light Industrial)';
  const siteArea = state.subjectData?.siteArea || '1.534';
  const siteAreaUnit = state.subjectData?.siteAreaUnit || 'acres';
  const frontage = state.subjectData?.frontage || '225.79 feet';
  const utilities = state.subjectData?.utilities || 'well water, private septic, electricity, natural gas, and telecommunications';
  const floodZone = state.subjectData?.floodZone || 'Zone X';
  const propertyType = state.propertyType || 'light industrial';
  
  const simulatedDrafts = useMemo(() => ({
    hbu_legally_permissible: `The subject property at ${subjectAddress} is zoned ${zoningClass} under the City of Billings zoning ordinance. This zoning district is specifically intended to accommodate a variety of business, warehouse, and light industrial uses related to wholesale activities. Permitted uses by right include light manufacturing, warehousing and distribution, research and development facilities, office uses accessory to industrial operations, and related commercial uses.

The subject's location within the established industrial corridor places it within an area that includes notable properties such as Bridger Steel, Western Ranch Supply, FedEx Freight, Tractor and Equipment Company, and various other light industrial operations. This area has historically supported light industrial development and continues to attract similar uses. Conditional uses under the zoning ordinance may include outdoor storage with appropriate screening, certain retail uses accessory to industrial operations, and contractor yards with specific site plan requirements.

No deed restrictions, private covenants, or easements were identified in our title review that would further limit development potential beyond the zoning requirements. The subject's current use as a ${propertyType} shop/office building is a conforming use under the applicable zoning ordinance. Based on this analysis, the legally permissible uses include industrial, warehouse, distribution, and related commercial development consistent with the ${zoningClass} zoning district.`,
    
    hbu_physically_possible: `The subject site contains approximately ${siteArea} ${siteAreaUnit} (66,832 square feet) of level land with a regular, rectangular configuration. The site has frontage of approximately ${frontage} along Entryway Drive, providing excellent visibility and access for ${propertyType} users. The site topography is level and at street grade, presenting no significant physical constraints to development or material handling operations.

All public utilities are available and connected to the site, including ${utilities}. The site has a paved approach from the public right-of-way providing good ingress and egress for truck traffic. Per FEMA Flood Insurance Rate Map (FIRM) panel 30111C2175E, dated November 16, 2016, the subject is located in ${floodZone}, an area determined to be outside the 0.2% annual chance floodplain. No special flood insurance is required.

Environmental concerns: No Phase I Environmental Site Assessment was provided for our review; however, visual observation of the site revealed no obvious environmental concerns. The property's current and historical use as ${propertyType} space is consistent with the surrounding area. Given these physical characteristics, the site is suitable for virtually any development permitted under the applicable zoning. Physically possible uses include industrial, warehouse, distribution, and office uses compatible with the site size, shape, access, and utility availability.`,
    
    hbu_financially_feasible: `Current market conditions indicate sustained demand for ${propertyType} and warehouse space in the Billings market area. According to our market analysis, the industrial submarket vacancy rate of approximately 4.8% is below the long-term historical average of 6-7%, indicating a healthy balance between supply and demand with continued pressure for new development.

The Billings market has experienced significant industrial activity, including approximately 300,000 square feet of speculative development along South Frontage Road and the expansion of major distribution facilities. Market rental rates for comparable ${propertyType} space range from $10.00 to $14.00 per square foot on a gross or modified gross basis, depending on quality, age, and building specifications. These rental levels would support new development at current construction costs of $130 to $150 per square foot.

Development feasibility analysis indicates that new ${propertyType} construction in this location would generate a positive residual land value, confirming financial feasibility. Market-derived capitalization rates for stabilized ${propertyType} properties in the region range from 6.00% to 7.50%, reflecting investor confidence in the asset class. Additionally, land values in the subject's immediate area have increased approximately 8-12% annually over the past three years. Based on our analysis, ${propertyType} and warehouse development would be financially feasible, generating adequate return to justify development costs.`,
    
    hbu_maximally_productive: `Based on our comprehensive analysis of the four tests of highest and best use, it is our conclusion that the highest and best use of the subject site as if vacant is development with ${propertyType} or warehouse improvements with integrated office space. This conclusion synthesizes the legally permissible uses (${zoningClass} zoning allowing industrial, warehouse, and commercial uses), physically possible uses (adequate site size, level topography, and full utility availability), and financially feasible uses (positive residual land value for ${propertyType} development).

Among the legally permissible, physically possible, and financially feasible uses, ${propertyType} development with shop and office components would result in the highest land value. This conclusion is supported by several market factors: (1) the site's strategic location within the Harnish Trade Center Subdivision, an established industrial corridor with excellent highway access; (2) the success of similar recent developments in the immediate area; (3) sustained demand for quality ${propertyType} space with modern amenities; and (4) land values in the area that support new construction returns.

The maximally productive use would be a modern pre-engineered steel building of approximately 10,000 to 15,000 square feet with 15-20% office finish, adequate clear height for modern logistics operations, and multiple overhead doors for flexible tenant configurations. Therefore, the highest and best use as vacant is development with ${propertyType} or warehouse improvements.`,
    
    hbu_as_improved: `The subject property is currently improved with a 10,200 square foot ${propertyType} shop/office building constructed in 2023. The improvements consist of a pre-engineered steel building with approximately 1,750 square feet of finished office space and 8,450 square feet of shop/warehouse area. The building features 20-foot clear height, three 17-foot by 14-foot overhead doors, and quality finishes throughout.

The existing improvements are consistent with and represent the ideal improvement for the site given current market conditions and zoning. The improvements are new construction in excellent condition with an estimated remaining economic life of approximately 40 years, providing adequate functional utility for ${propertyType} users. The building's design, construction quality, and functional layout are competitive with or superior to other properties in the market.

We considered alternative uses including renovation, conversion to alternative use, and demolition. Given the improvements' modern construction, excellent condition, and superior functional utility, demolition and redevelopment is not economically justified. The contribution value of the improvements substantially exceeds the cost to demolish and redevelop. The current improvement-to-land ratio of approximately 85% is consistent with competitive properties in the market. Based on this analysis, it is our conclusion that the highest and best use of the subject property as improved is continuation of its current use as a ${propertyType} shop/office facility.`,
  }), [subjectAddress, zoningClass, siteArea, siteAreaUnit, frontage, utilities, floodZone, propertyType]);

  // Handler for "Draft All" - As Vacant section
  const handleDraftAllVacant = useCallback(async () => {
    setIsDraftingAllVacant(true);
    
    // Simulate staggered AI generation for better UX
    await new Promise(resolve => setTimeout(resolve, 400));
    setHbuLegallyPermissible(simulatedDrafts.hbu_legally_permissible);
    
    await new Promise(resolve => setTimeout(resolve, 300));
    setHbuPhysicallyPossible(simulatedDrafts.hbu_physically_possible);
    
    await new Promise(resolve => setTimeout(resolve, 300));
    setHbuFinanciallyFeasible(simulatedDrafts.hbu_financially_feasible);
    
    await new Promise(resolve => setTimeout(resolve, 300));
    setHbuMaximallyProductive(simulatedDrafts.hbu_maximally_productive);
    
    setIsDraftingAllVacant(false);
  }, [simulatedDrafts]);


  // Tab configuration - dynamically includes Cost Seg and Market Analysis
  // Order: HBU → Market Analysis → SWOT → Risk Rating → [Cost Seg if enabled] → Reconciliation → Checklist
  // 1. Establish HBU first (foundational analysis)
  // 2. Market Analysis (market conditions and trends)
  // 3. SWOT Analysis (strategic property assessment)
  // 4. Risk Rating (investment quality assessment - Plan Part 10.7)
  // 5. Cost Segregation (if enabled - tax optimization analysis)
  // 6. Reconcile value indications (core conclusion)
  // 7. Verify completion (quality control gate before finalizing)
  const tabs: { id: ReviewTabId; label: string; icon: typeof ClipboardCheckIcon }[] = useMemo(() => {
    const baseTabs: { id: ReviewTabId; label: string; icon: typeof ClipboardCheckIcon }[] = [
      { id: 'hbu', label: 'Highest & Best Use', icon: ScaleIcon },
      { id: 'market-analysis', label: 'Market Analysis', icon: TrendingUpIcon },
      { id: 'swot', label: 'SWOT Analysis', icon: TargetIcon },
      { id: 'risk-rating', label: 'Risk Rating', icon: () => <Shield className="w-5 h-5" /> },
    ];
    
    // Add Cost Segregation tab if enabled in Setup
    if (isCostSegEnabled) {
      baseTabs.push({ 
        id: 'cost-seg', 
        label: 'Cost Segregation', 
        icon: () => <Calculator className="w-5 h-5" /> 
      });
    }
    
    // Add remaining tabs
    baseTabs.push(
      { id: 'reconciliation', label: 'Value Reconciliation', icon: ChartIcon },
      { id: 'checklist', label: 'Completion Checklist', icon: ClipboardCheckIcon },
    );
    
    return baseTabs;
  }, [isCostSegEnabled]);

  // Progress tracking
  const { tabCompletions, sectionCompletion, trackTabChange } = useCompletion('review');
  const { checkAndTriggerCelebration: _checkAndTriggerCelebration } = useCelebration();
  void _checkAndTriggerCelebration; // Reserved for future review section completion celebration

  // Track tab changes for smart navigation
  useEffect(() => {
    trackTabChange(activeTab);
  }, [activeTab, trackTabChange]);

  // Check if all tabs are complete
  const allTabsComplete = sectionCompletion >= 100;

  // Smart continue logic (for cycling through review tabs)
  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab as ReviewTabId);
  }, []);
  
  const { handleContinue: baseSmartContinue } = useSmartContinue({
    sectionId: 'review',
    tabs: tabs.map(t => t.id),
    activeTab,
    setActiveTab: handleTabChange,
    currentPhase: 6,
  });

  // Custom continue handler: on final tab (checklist), go to preview mode
  const handleSmartContinue = useCallback(() => {
    if (activeTab === 'checklist') {
      // On the final tab - go to preview mode
      triggerCelebration();
      setHasCelebrated(true);
      setShowPreviewMode(true);
    } else {
      // Otherwise, use the normal smart continue (goes to next tab)
      baseSmartContinue();
    }
  }, [activeTab, baseSmartContinue]);

  // Get completion percentage for a specific tab
  const getTabCompletion = (tabId: string): number => {
    const tabData = tabCompletions.find(t => t.id === tabId);
    return tabData?.completion || 0;
  };

  // Sidebar with functional tab buttons
  const sidebar = (
    <div>
      <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Review & Finalize</h2>
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
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
        {activeTab === 'hbu' && 'Highest & Best Use'}
        {activeTab === 'market-analysis' && 'Market Analysis'}
        {activeTab === 'swot' && 'SWOT Analysis'}
        {activeTab === 'risk-rating' && 'Investment Risk Rating'}
        {activeTab === 'cost-seg' && 'Cost Segregation'}
        {activeTab === 'checklist' && 'Finalization'}
        {activeTab === 'reconciliation' && 'Value Reconciliation'}
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        {activeTab === 'hbu' &&
          'Complete the four tests of highest and best use to determine the most profitable legal use of the subject property.'}
        {activeTab === 'market-analysis' &&
          'Analyze current market conditions, trends, and economic indicators that affect property values.'}
        {activeTab === 'swot' &&
          'Identify strengths, weaknesses, opportunities, and threats for the subject property.'}
        {activeTab === 'risk-rating' &&
          'Review the property\'s investment risk rating based on market volatility, liquidity, income stability, and asset quality.'}
        {activeTab === 'cost-seg' &&
          'Generate an IRS-compliant cost segregation study to accelerate depreciation and maximize tax benefits.'}
        {activeTab === 'checklist' &&
          'Review all sections for completeness and accuracy before generating the final report.'}
        {activeTab === 'reconciliation' &&
          'Assign weights to each valuation approach and provide reconciliation comments for each scenario.'}
      </p>

      {activeTab === 'hbu' && (
        <>
          <div className="bg-indigo-50 border-l-4 border-indigo-400 p-4 rounded mb-4">
            <h4 className="font-semibold text-sm text-indigo-900 mb-1">The Four Tests</h4>
            <p className="text-xs text-indigo-800">
              All four tests must be satisfied: Legally Permissible, Physically Possible, Financially Feasible, and Maximally Productive.
            </p>
          </div>
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded mb-4">
            <h4 className="font-semibold text-sm text-blue-900 mb-1">AI Draft Feature</h4>
            <p className="text-xs text-blue-800">
              Click the "AI Draft" button on any section to generate professional narrative using your property data from earlier phases.
            </p>
          </div>
          {hasImprovements && (
            <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded">
              <h4 className="font-semibold text-sm text-amber-900 mb-1">As Improved Analysis</h4>
              <p className="text-xs text-amber-800">
                For improved properties, analyze whether the current improvements represent the highest and best use or if demolition/conversion should be considered.
              </p>
            </div>
          )}
        </>
      )}

      {activeTab === 'market-analysis' && (
        <>
          <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded mb-4">
            <h4 className="font-semibold text-sm text-amber-900 mb-1">Market Conditions</h4>
            <p className="text-xs text-amber-800">
              Review market cycle stage, supply & demand balance, and key trends affecting property values in the subject area.
            </p>
          </div>
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded mb-4">
            <h4 className="font-semibold text-sm text-blue-900 mb-1">Economic Indicators</h4>
            <p className="text-xs text-blue-800">
              Analyze interest rates, economic growth, employment trends, and their impact on the real estate market.
            </p>
          </div>
          <div className="bg-emerald-50 border-l-4 border-emerald-400 p-4 rounded">
            <h4 className="font-semibold text-sm text-emerald-900 mb-1">Market Data</h4>
            <p className="text-xs text-emerald-800">
              Reference comparable sales and rental data to understand market conditions and pricing trends.
            </p>
          </div>
        </>
      )}

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

      {activeTab === 'swot' && (
        <>
          <div className="bg-emerald-50 border-l-4 border-emerald-400 p-4 rounded mb-4">
            <h4 className="font-semibold text-sm text-emerald-900 mb-1">Strategic Analysis</h4>
            <p className="text-xs text-emerald-800">
              SWOT analysis provides a framework for evaluating the subject property's competitive position in the market.
            </p>
          </div>
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
            <h4 className="font-semibold text-sm text-blue-900 mb-1">AI Suggestions</h4>
            <p className="text-xs text-blue-800">
              Use the AI Suggestions button to generate property-specific SWOT items based on your entered data.
            </p>
          </div>
        </>
      )}

      {activeTab === 'risk-rating' && (
        <>
          <div className="bg-cyan-50 border-l-4 border-cyan-400 p-4 rounded mb-4">
            <h4 className="font-semibold text-sm text-cyan-900 mb-1">Bond-Style Rating</h4>
            <p className="text-xs text-cyan-800">
              Similar to bond credit ratings (AAA to C), this system evaluates investment quality across four dimensions.
            </p>
          </div>
          <div className="bg-indigo-50 border-l-4 border-indigo-400 p-4 rounded mb-4">
            <h4 className="font-semibold text-sm text-indigo-900 mb-1">Four Risk Dimensions</h4>
            <p className="text-xs text-indigo-800">
              <strong>Market Volatility:</strong> Price variance vs market<br/>
              <strong>Liquidity:</strong> Days on market, absorption<br/>
              <strong>Income Stability:</strong> Cap rate vs risk-free rate<br/>
              <strong>Asset Quality:</strong> Physical + location factors
            </p>
          </div>
          <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded">
            <h4 className="font-semibold text-sm text-amber-900 mb-1">Dynamic Weighting</h4>
            <p className="text-xs text-amber-800">
              Weights are calculated based on property type, data completeness, and market conditions - not fixed defaults.
            </p>
          </div>
        </>
      )}

      {activeTab === 'cost-seg' && (
        <>
          <div className="bg-emerald-50 border-l-4 border-emerald-400 p-4 rounded mb-4">
            <h4 className="font-semibold text-sm text-emerald-900 mb-1">Depreciation Classes</h4>
            <p className="text-xs text-emerald-800">
              <strong>5-Year:</strong> Personal property (carpet, fixtures, equipment)<br/>
              <strong>15-Year:</strong> Land improvements (parking, landscaping, sidewalks)<br/>
              <strong>39-Year:</strong> Building structure (foundation, walls, roof)
            </p>
          </div>
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded mb-4">
            <h4 className="font-semibold text-sm text-blue-900 mb-1">Tax Benefits</h4>
            <p className="text-xs text-blue-800">
              Accelerating depreciation to shorter recovery periods provides immediate tax deductions, 
              improving cash flow in the early years of ownership.
            </p>
          </div>
          <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded">
            <h4 className="font-semibold text-sm text-amber-900 mb-1">IRS Compliance</h4>
            <p className="text-xs text-amber-800">
              Analysis follows IRS Cost Segregation Audit Techniques Guide methodology and 
              MACRS depreciation rules per Publication 946.
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
          {allTabsComplete && (
            <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded mt-4">
              <h4 className="font-semibold text-sm text-green-900 mb-1">Ready for Preview!</h4>
              <p className="text-xs text-green-800">
                All sections are complete. You can now preview and finalize your report.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
  
  // If in full-screen preview mode, render just the preview
  if (showPreviewMode) {
    return (
      <>
        <ReportPreviewMode
          onBack={handleExitPreviewMode}
          onFinalize={handleFinalize}
          onSaveDraft={handleSaveDraft}
          onSaveAsTemplate={finalizeActions.openTemplateDialog}
          onReportStateChange={handleReportStateChange}
          isSaving={isSaving}
          isDirty={editorIsDirty}
        />
        
        {/* Finalize Flow Dialogs */}
        <SaveChangesDialog
          isOpen={finalizeState.stage === 'save-dialog'}
          onClose={finalizeActions.cancelFinalize}
          onUpdate={finalizeActions.saveChanges}
          onSaveAsCopy={finalizeActions.saveAsCopy}
          onDiscard={finalizeActions.discardChanges}
        />
        
        <PostSaveDialog
          isOpen={finalizeState.stage === 'post-save'}
          onClose={finalizeActions.continueEditing}
          onSaveAsTemplate={finalizeActions.openTemplateDialog}
          onFinalize={finalizeActions.proceedToFinalize}
          onContinueEditing={finalizeActions.continueEditing}
        />
        
        <TemplateSaveDialog
          isOpen={finalizeState.stage === 'template-dialog'}
          onClose={finalizeActions.skipTemplate}
          onSave={finalizeActions.saveAsTemplate}
        />
        
        <FinalizeDialog
          isOpen={finalizeState.stage === 'finalize-dialog' || finalizeState.stage === 'generating' || finalizeState.stage === 'complete' || finalizeState.stage === 'error'}
          onClose={finalizeActions.cancelFinalize}
          onFinalize={finalizeActions.confirmFinalize}
          reportTitle={wizardState.subjectData?.propertyName || 'Appraisal Report'}
          hasUnsavedChanges={editorIsDirty}
          onSaveFirst={handleSaveDraft}
        />
      </>
    );
  }

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

  // If showing ready-to-preview celebration screen
  if (showReadyToPreview) {
    return (
      <WizardLayout
        title="Review & Finalize"
        subtitle="Phase 6 of 6 • Analysis Complete!"
        phase={6}
        sidebar={sidebar}
        helpSidebarGuidance={helpSidebar}
      >
        <ReadyToPreviewScreen
          onPreview={handleEnterPreviewMode}
          onBack={handleBackToChecklist}
        />
      </WizardLayout>
    );
  }

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'hbu':
        return (
          <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
            {/* Scenario context banner */}
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex items-start gap-3">
              <Info className="text-indigo-600 shrink-0 mt-0.5" size={18} />
              <div>
                <p className="text-sm font-semibold text-indigo-900">
                  Highest & Best Use Analysis
                </p>
                <p className="text-xs text-indigo-800 mt-1">
                  Complete the four tests of highest and best use. Click "AI Draft" on any section to generate professional narrative using your property data.
                </p>
              </div>
            </div>

            {/* HBU As Vacant */}
            <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between border-b-2 border-gray-200 pb-3 mb-4">
                <h3 className="text-lg font-bold text-[#1c3643]">
                  Highest & Best Use - As Vacant
                </h3>
                <button
                  onClick={handleDraftAllVacant}
                  disabled={isDraftingAllVacant}
                  className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-[#4db8d1] to-[#7fcce0] rounded-lg hover:from-[#3da8c1] hover:to-[#6fc0d4] flex items-center gap-2 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDraftingAllVacant ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Drafting All...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      AI Draft All (4 Sections)
                    </>
                  )}
                </button>
              </div>
              <div className="space-y-6">
                <EnhancedTextArea
                  label="Legally Permissible Uses"
                  value={hbuLegallyPermissible}
                  onChange={setHbuLegallyPermissible}
                  placeholder="Describe uses permitted under current zoning and regulations..."
                  sectionContext="hbu_legally_permissible"
                  minHeight={120}
                />
                <EnhancedTextArea
                  label="Physically Possible Uses"
                  value={hbuPhysicallyPossible}
                  onChange={setHbuPhysicallyPossible}
                  placeholder="Describe uses that are physically possible given site characteristics..."
                  sectionContext="hbu_physically_possible"
                  minHeight={120}
                />
                <EnhancedTextArea
                  label="Financially Feasible Uses"
                  value={hbuFinanciallyFeasible}
                  onChange={setHbuFinanciallyFeasible}
                  placeholder="Describe uses that would generate adequate return..."
                  sectionContext="hbu_financially_feasible"
                  minHeight={120}
                />
                <EnhancedTextArea
                  label="Maximally Productive Use (Conclusion)"
                  value={hbuMaximallyProductive}
                  onChange={setHbuMaximallyProductive}
                  placeholder="State the conclusion of highest and best use as vacant..."
                  sectionContext="hbu_maximally_productive"
                  minHeight={120}
                />
              </div>
            </div>

            {/* HBU As Improved (only if property has improvements) */}
            {hasImprovements && (
              <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-[#1c3643] border-b-2 border-gray-200 pb-3 mb-4">
                  Highest & Best Use - As Improved
                </h3>
                <EnhancedTextArea
                  label="As Improved Analysis"
                  value={hbuAsImproved}
                  onChange={setHbuAsImproved}
                  placeholder="Analysis of whether to continue current use, renovate/convert, or demolish..."
                  sectionContext="hbu_as_improved"
                  minHeight={150}
                />
              </div>
            )}
          </div>
        );

      case 'market-analysis':
        return (
          <div className="absolute inset-0 flex flex-col animate-fade-in">
            {/* Market Analysis Header Banner */}
            <div className="bg-amber-50 border-b border-amber-200 px-6 py-4 flex items-start gap-3">
              <Info className="text-amber-600 shrink-0 mt-0.5" size={18} />
              <div>
                <p className="text-sm font-semibold text-amber-900">
                  Market Analysis
                </p>
                <p className="text-xs text-amber-800 mt-1">
                  Review market conditions, supply & demand dynamics, and economic trends affecting property values.
                </p>
              </div>
            </div>

            {/* Market Analysis Content - Single scrollable area with consistent background */}
            <div className="flex-1 min-h-0 overflow-auto bg-slate-50">
              <MarketAnalysisGrid 
                rentCompData={{
                  avgRent: 26.75,
                  rentRange: [17.50, 37.50],
                  compCount: 4,
                }}
                salesCompData={{
                  avgPricePsf: 242,
                  avgCapRate: 6.50,
                  compCount: 8,
                }}
              />
              
              {/* Economic Indicators Panel - FRED Data */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm mx-6 mb-6 -mt-3">
                <EconomicIndicatorsPanel 
                  onDataLoaded={(data, asOfDate) => {
                    // Save economic data to wizard state for report generation
                    // Calculate trends from history data
                    const calcTrendRising = (series: { current: number; history: { value: number }[] }) => {
                      if (series.history.length < 2) return 'stable' as const;
                      const recent = series.history.slice(-3).map(h => h.value);
                      const avg = recent.reduce((a, b) => a + b, 0) / recent.length;
                      if (series.current > avg * 1.02) return 'rising' as const;
                      if (series.current < avg * 0.98) return 'falling' as const;
                      return 'stable' as const;
                    };
                    const calcTrendGrowth = (series: { current: number; history: { value: number }[] }) => {
                      if (series.history.length < 2) return 'stable' as const;
                      const recent = series.history.slice(-3).map(h => h.value);
                      const avg = recent.reduce((a, b) => a + b, 0) / recent.length;
                      if (series.current > avg * 1.02) return 'accelerating' as const;
                      if (series.current < avg * 0.98) return 'slowing' as const;
                      return 'stable' as const;
                    };
                    
                    setEconomicIndicators({
                      federalFundsRate: { 
                        current: data.federalFundsRate.current, 
                        projected1Y: data.federalFundsRate.current,
                        history: data.federalFundsRate.history
                      },
                      treasury10Y: { 
                        current: data.treasury10Y.current, 
                        projected1Y: data.treasury10Y.current,
                        history: data.treasury10Y.history
                      },
                      inflation: { 
                        current: data.inflation.current, 
                        trend: calcTrendRising(data.inflation),
                        history: data.inflation.history
                      },
                      gdpGrowth: { 
                        current: data.gdpGrowth.current, 
                        trend: calcTrendGrowth(data.gdpGrowth),
                        history: data.gdpGrowth.history
                      },
                      asOfDate: asOfDate || new Date().toISOString(),
                      source: 'FRED Economic Data',
                    });
                  }}
                  onChartStyleChange={(style) => {
                    // Save chart style to wizard state for report generation
                    dispatch({ type: 'SET_ECONOMIC_CHART_STYLE', payload: style });
                  }}
                />
              </div>
              
              {/* Market Outlook & Analysis Narrative - At the very bottom */}
              <div className="mx-6 mb-6 space-y-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-slate-700" />
                  <h2 className="text-lg font-bold text-slate-800 dark:text-white">Market Outlook & Analysis</h2>
                </div>
                <EnhancedTextArea
                  label="Market Analysis Narrative"
                  value={state.marketAnalysis?.narrative ?? ''}
                  onChange={(value) => {
                    // Update the narrative in wizard state
                    const currentData = state.marketAnalysis || {
                      supplyMetrics: { totalInventory: 0, vacancyRate: 0, absorptionRate: 0, inventoryMonths: 0 },
                      demandMetrics: { averageRent: 0, rentGrowth: 0, averageDaysOnMarket: 0, salesVolume: 0 },
                      marketTrends: { overallTrend: 'stable', priceOutlook: 'stable', supplyOutlook: 'stable' },
                      narrative: '',
                    };
                    dispatch({ 
                      type: 'SET_MARKET_ANALYSIS', 
                      payload: { ...currentData, narrative: value } 
                    });
                  }}
                  placeholder="Enter market outlook narrative covering supply/demand, vacancy trends, rental rates, and sales activity..."
                  rows={10}
                  sectionContext="market_analysis"
                  helperText="AI can draft a comprehensive market analysis based on the market data above."
                  minHeight={300}
                />
              </div>
            </div>
          </div>
        );

      case 'swot':
        return (
          <div className="space-y-6 animate-fade-in">
            <SWOTAnalysis
              data={swotData}
              onChange={handleSwotChange}
              onGenerateSuggestions={async () => {
                try {
                  // Generate intelligent SWOT suggestions from wizard state data
                  const enhancedSuggestions = await generateSWOTSuggestions({
                    propertyType: state.propertyType,
                    subjectData: state.subjectData,
                    demographicsData: state.demographicsData,
                    economicIndicators: state.economicIndicators,
                    improvementsInventory: state.improvementsInventory,
                    marketAnalysis: state.marketAnalysis,
                    riskRating: state.riskRating,
                  });
                  
                  // Convert to simple string arrays for the component
                  const simpleSuggestions = convertToSimpleSWOT(enhancedSuggestions);
                  
                  // Add component health-based weaknesses and threats
                  const componentWeaknesses = componentHealth?.weaknesses?.map(issue => issue.suggestion) || [];
                  const componentThreats = componentHealth?.threats?.map(issue => issue.suggestion) || [];
                  
                  return {
                    strengths: simpleSuggestions.strengths,
                    weaknesses: [...simpleSuggestions.weaknesses, ...componentWeaknesses],
                    opportunities: simpleSuggestions.opportunities,
                    threats: [...simpleSuggestions.threats, ...componentThreats],
                    dataCompleteness: enhancedSuggestions.dataCompleteness,
                    impactScore: enhancedSuggestions.impactScore,
                  };
                } catch (error) {
                  console.error('[SWOT] Error generating suggestions:', error);
                  // Fallback to empty suggestions on error
                  return {
                    strengths: [],
                    weaknesses: componentHealth?.weaknesses?.map(issue => issue.suggestion) || [],
                    opportunities: [],
                    threats: componentHealth?.threats?.map(issue => issue.suggestion) || [],
                  };
                }
              }}
            />
          </div>
        );

      case 'risk-rating':
        return (
          <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
            {/* Info Banner */}
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex items-start gap-3">
              <Info className="text-indigo-600 shrink-0 mt-0.5" size={18} />
              <div>
                <p className="text-sm font-semibold text-indigo-900">
                  Investment Risk Rating ("Bond Rating for Buildings")
                </p>
                <p className="text-xs text-indigo-800 mt-1">
                  This proprietary rating system evaluates the property across four risk dimensions 
                  using Wall Street-style methodology. The rating helps banks and investors assess 
                  investment quality at a glance.
                </p>
              </div>
            </div>

            {/* Risk Rating Panel */}
            <RiskRatingPanel
              propertyType={state.propertyType || 'commercial'}
              latitude={state.subjectData?.coordinates?.latitude}
              longitude={state.subjectData?.coordinates?.longitude}
              isIncomeProducing={state.propertyType !== 'residential' && state.propertyType !== 'land'}
              capRate={state.incomeApproach?.capRate}
              daysOnMarket={state.marketAnalysis?.demandMetrics?.averageDaysOnMarket}
              yearBuilt={state.improvementsInventory?.parcels?.[0]?.buildings?.[0]?.yearBuilt ?? undefined}
              condition={state.improvementsInventory?.parcels?.[0]?.buildings?.[0]?.condition}
              className="w-full"
              onDataLoaded={setRiskRating}
            />
          </div>
        );

      case 'cost-seg':
        return (
          <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
            {/* Info Banner */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
              <Info className="text-emerald-600 shrink-0 mt-0.5" size={18} />
              <div>
                <p className="text-sm font-semibold text-emerald-900">
                  Cost Segregation Analysis
                </p>
                <p className="text-xs text-emerald-800 mt-1">
                  Accelerate depreciation deductions by reclassifying building components into 
                  shorter recovery periods (5, 15, and 39 years) per IRS guidelines.
                </p>
              </div>
            </div>

            {/* Cost Segregation Overview */}
            <CostSegOverview
              analysis={costSegAnalysis}
              isLoading={isCostSegLoading}
              error={costSegError}
              onGenerate={handleGenerateCostSeg}
              onViewFullReport={costSegAnalysis ? () => setShowCostSegReportEditor(true) : undefined}
              className="w-full"
            />
            
            {/* Full Report Editor Modal */}
            {showCostSegReportEditor && costSegAnalysis && (
              <CostSegFullReportEditor
                analysis={costSegAnalysis}
                onBack={() => setShowCostSegReportEditor(false)}
              />
            )}
          </div>
        );

      case 'checklist':
        return <CompletionChecklist />;

      case 'reconciliation':
        return <ValueReconciliation />;

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
      helpSidebarGuidance={helpSidebar}
      onContinue={handleSmartContinue}
    >
      {renderContent()}
    </WizardLayout>
  );
}
