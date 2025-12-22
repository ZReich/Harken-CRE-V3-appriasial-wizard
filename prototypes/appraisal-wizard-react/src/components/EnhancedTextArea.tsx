import { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  Sparkles, 
  Maximize2, 
  Minimize2,
  Undo,
  Redo,
  AlignLeft,
  AlignCenter,
  AlignRight,
  X,
  Check,
  Info,
  Loader2
} from 'lucide-react';
import { useWizard } from '../context/WizardContext';
import { buildHBUContext, formatContextForAPI } from '../utils/hbuContextBuilder';

// ==========================================
// TYPES
// ==========================================
interface EnhancedTextAreaProps {
  id?: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  sectionContext?: string;
  helperText?: string;
  required?: boolean;
  minHeight?: number;
  contextData?: Record<string, any>; // Additional context for AI generation
}

interface AIPreview {
  content: string;
  isVisible: boolean;
}

// Simulated AI responses for demo (templates reserved for future API integration)
const SimulatedAIDrafts: Record<string, string> = {
  'legal_description': 'Lot 12, Block 4, of CANYON CREEK INDUSTRIAL PARK, according to the plat thereof, filed in Plat Book 45, at Page 123, records of Yellowstone County, Montana, located in the Southeast Quarter of Section 15, Township 1 South, Range 26 East, Principal Meridian, Montana.',
  'area_description': 'The subject property is located in the Billings Heights area of Billings, Montana, an established commercial and industrial corridor along South 30th Street West. The immediate neighborhood is characterized by a mix of light industrial, warehouse, and commercial uses. The area benefits from excellent access to Interstate 90 and major arterial roads. The local economy is diverse, supported by agriculture, energy, healthcare, and manufacturing sectors.',
  'site_description': 'The subject site contains approximately 1.43 acres (62,291 square feet) of level, rectangular land. The site has approximately 200 feet of frontage along South 30th Street West with adequate ingress and egress. All public utilities including water, sewer, electricity, and natural gas are available and connected.',
  'improvement_description': 'The subject improvements consist of a single-story industrial warehouse building constructed in 2019. The building features a steel frame with metal panel exterior walls and a standing seam metal roof. The structure provides approximately 11,174 square feet of gross building area, including warehouse space with 24-foot clear heights.',
  'hbu_analysis': 'Based on analysis of the four tests of highest and best use, the subject site as vacant would be developed with industrial/warehouse use. This conclusion is supported by: (1) Legal permissibility under the I1-Light Industrial zoning; (2) Physical possibility given the level topography; (3) Financial feasibility based on current market demand; and (4) Maximum productivity compared to alternative uses.',
  'reconciliation': 'In reconciling the value indications, the Income Approach is given primary emphasis as it best reflects investor decision-making for income-producing properties. The Sales Comparison Approach provides good support. The Cost Approach is given least weight due to challenges in measuring depreciation.',
  
  // HBU-specific templates for the four tests
  'hbu_legally_permissible': 'The subject property is zoned I-1 (Light Industrial) under the applicable zoning ordinance. Under this zoning classification, permitted uses by right include light manufacturing, warehousing and distribution, research and development facilities, and related commercial uses. Conditional uses may include outdoor storage with appropriate screening and certain retail uses accessory to industrial operations.\n\nNo deed restrictions, private covenants, or easements were identified in our title review that would further limit development potential beyond the zoning requirements. The current use is a conforming use under the applicable zoning ordinance. Based on this analysis, the legally permissible uses include industrial, warehouse, and related commercial development.',
  
  'hbu_physically_possible': 'The subject site contains approximately 1.43 acres of generally level land with a regular, rectangular configuration. The site topography is level and at grade with the surrounding roadway, presenting no significant physical constraints to development. All public utilities including municipal water, sanitary sewer, electricity, natural gas, and telecommunications are available and connected to the site.\n\nThe property is located in Flood Zone X per FEMA mapping, indicating minimal flood risk with no special flood insurance requirements. The site has adequate frontage and direct access from a public right-of-way. Given these physical characteristics, the site is suitable for virtually any development permitted under the applicable zoning. Physically possible uses include any development compatible with the site size, shape, and utility availability.',
  
  'hbu_financially_feasible': 'Current market conditions indicate sustained demand for industrial and warehouse space in the subject market area. The submarket vacancy rate of approximately 5.2% is below the long-term historical average, indicating a healthy balance between supply and demand. Market rental rates for comparable industrial space range from $6.50 to $8.50 per square foot NNN, which would support new development at current construction costs.\n\nDevelopment feasibility analysis indicates that new industrial construction would generate a positive residual land value, confirming financial feasibility. Market-derived capitalization rates for stabilized industrial properties range from 6.50% to 7.50%, reflecting investor confidence in the asset class. Based on our analysis, industrial and warehouse development would be financially feasible, generating adequate return to justify development.',
  
  'hbu_maximally_productive': 'Based on our analysis of the four tests of highest and best use, it is our conclusion that the highest and best use of the subject site as if vacant is development with industrial or warehouse improvements. This conclusion synthesizes the legally permissible uses (industrial zoning), physically possible uses (adequate site size and utilities), and financially feasible uses (positive residual land value for industrial development).\n\nAmong the legally permissible, physically possible, and financially feasible uses, industrial development would result in the highest land value. This conclusion is supported by the site\'s location within an established industrial corridor, adequate infrastructure, and strong market fundamentals. Therefore, the highest and best use as vacant is development with industrial or warehouse improvements.',
  
  'hbu_as_improved': 'The subject property is currently improved with a 11,174 square foot industrial warehouse building constructed in 2019. The existing improvements are consistent with and represent a reasonable approximation of the ideal improvement for the site given current market conditions and zoning. The improvements are in good condition with substantial remaining economic life and provide adequate functional utility for industrial users.\n\nWe considered alternative uses including renovation, conversion to alternative use, or demolition. Given the improvements\' modern construction, good condition, and functional utility, demolition and redevelopment is not economically justified. The contribution value of the improvements exceeds the cost to demolish and redevelop. Based on this analysis, it is our conclusion that the highest and best use of the subject property as improved is continuation of its current use as an industrial warehouse facility.',

  // ===========================================
  // GRID-SPECIFIC AI PROMPTS (30-Year Appraiser Style)
  // ===========================================
  
  'sales_comparison': '**Sales Comparison Approach - Reconciliation**\n\nIn developing the Sales Comparison Approach, I have analyzed recent transactions of properties considered most comparable to the subject. After 30 years in this profession, I can attest that this approach provides the most reliable indication of market value when sufficient comparable data exists.\n\n**Comparable Selection Criteria:**\nThe sales selected represent the best available data, considering location, physical characteristics, and market conditions. Each transaction was verified to the extent possible to confirm arms-length status.\n\n**Adjustment Analysis:**\nAdjustments were applied for differences in property rights conveyed, financing terms, conditions of sale, market conditions, location, and physical characteristics. The adjustments reflect market-derived differences based on paired sales analysis and professional judgment developed over decades of practice.\n\n**Reconciliation:**\nGreatest weight was given to the comparables requiring the least overall adjustment, as these properties most closely mirror the subject. The adjusted sale prices demonstrate a reasonable range, and the indicated value falls within market expectations.\n\n**Value Indication via Sales Comparison Approach:** [Value to be inserted based on grid data]',

  'land_valuation': '**Land Valuation - Analysis and Reconciliation**\n\nThe land value estimate was developed using the Sales Comparison Approach, which is the preferred methodology for vacant land when adequate comparable sales data is available.\n\n**Market Analysis:**\nThe local land market has demonstrated [stable/increasing/decreasing] conditions over the past 12-24 months. Demand for [property type] land in this submarket remains [strong/moderate/weak], supported by [economic factors].\n\n**Comparable Land Sales:**\nI have analyzed recent sales of comparable land parcels, with adjustments made for differences in size, location, topography, utilities, zoning, and market conditions. After three decades of appraising land, these adjustments reflect my understanding of how buyers in this market value specific property characteristics.\n\n**Adjustment Rationale:**\n- **Location:** Adjustments reflect differences in access, visibility, and surrounding land uses\n- **Size:** Larger parcels typically sell at lower unit prices due to diminished buyer pool\n- **Utilities:** Availability and cost to connect significantly impact land value\n- **Topography:** Level, usable land commands premium pricing\n\n**Land Value Conclusion:**\nBased on the adjusted comparable sales, the indicated land value is [Value to be inserted]. This conclusion reflects the most probable price the subject land would bring in a competitive market.',

  'rent_comparable': '**Rent Comparable Analysis - Market Rent Conclusion**\n\nIn estimating market rent for the subject property, I have analyzed comparable rental properties in the subject\'s competitive market area.\n\n**Rental Market Conditions:**\nThe current rental market for [property type] space reflects [market conditions]. Vacancy rates in the immediate area are approximately [X]%, indicating [balanced/landlord-favorable/tenant-favorable] conditions.\n\n**Comparable Rental Analysis:**\nThe rentals selected represent properties that compete directly with the subject for tenants. Adjustments were made for differences in location, size, condition, amenities, and lease terms.\n\n**Key Observations:**\n- Effective rental rates range from $[X] to $[Y] per square foot\n- Most leases are structured on a [NNN/Modified Gross/Full Service] basis\n- Tenant improvement allowances average $[X] per square foot\n- Concessions are [typical/minimal/significant] in the current market\n\n**Market Rent Conclusion:**\nBased on my analysis of comparable rentals and 30 years of experience in this market, the indicated market rent for the subject is $[X] per square foot on a [lease basis] basis. This rent level reflects the most probable rent the subject would command from a knowledgeable tenant in the current market.',

  'expense_comparable': '**Operating Expense Analysis**\n\nIn developing the expense estimate for the subject property, I have analyzed comparable expense data from similar properties in the market.\n\n**Expense Data Sources:**\nExpense comparables were selected from properties similar to the subject in terms of property type, size, age, and quality. Data was obtained from [sources] and verified to the extent possible.\n\n**Expense Categories Analyzed:**\n- **Real Estate Taxes:** Based on current assessment and mill levy\n- **Insurance:** Reflects current market rates for similar properties\n- **Utilities:** Where applicable, based on comparable consumption data\n- **Repairs & Maintenance:** Reflects typical expenditures for properties of this age and condition\n- **Management:** Market-standard percentage of effective gross income\n- **Reserves for Replacement:** Appropriate reserve for long-lived components\n\n**Expense Comparison:**\nThe expense ratio for comparable properties ranges from [X]% to [Y]% of effective gross income, with total expenses per square foot ranging from $[X] to $[Y].\n\n**Expense Conclusion:**\nBased on the comparable data and my professional judgment developed over 30 years, the stabilized expenses for the subject property are estimated at $[X] per square foot, representing an expense ratio of approximately [X]%.',

  'multi_family': '**Multi-Family Rental Approach - Analysis and Reconciliation**\n\nIn developing the rental analysis for this multi-family property, I have applied the same rigorous methodology that has guided my 30-year career in real estate appraisal.\n\n**Market Overview:**\nThe multi-family market in this area has demonstrated [market conditions]. Vacancy rates for comparable properties average approximately [X]%, and rental rate trends have been [increasing/stable/declining] over the past 12 months.\n\n**Rental Comparable Analysis:**\nI have analyzed [X] rental comparables representing properties that compete directly with the subject for tenants. These comparables were selected based on similarity in unit mix, age, condition, location, and amenities.\n\n**Adjustment Factors:**\n- **Location:** Adjustments for differences in neighborhood quality and access\n- **Unit Size/Configuration:** Bed/bath count and square footage comparisons\n- **Condition/Quality:** Age, renovation status, and finish levels\n- **Amenities:** Parking, utilities included, in-unit features\n- **Property Type:** Building style and unit count considerations\n\n**Rental Rate Conclusion:**\nBased on my analysis, the indicated market rental rates for the subject units are:\n- [Unit Type 1]: $[X]/month\n- [Unit Type 2]: $[Y]/month\n\nThese conclusions reflect the most probable rents the subject units would achieve from typical tenants in the current market. The overall adjustment range supports confidence in these conclusions.',
  
  'default': 'This section contains professionally written appraisal content that follows USPAP guidelines and industry best practices. The content should be reviewed and modified as appropriate for the specific assignment.'
};

// ==========================================
// MAIN COMPONENT
// ==========================================
export default function EnhancedTextArea({
  id,
  label,
  value,
  onChange,
  placeholder = '',
  rows = 4,
  sectionContext = 'default',
  helperText,
  required = false,
  minHeight: propMinHeight,
  contextData,
}: EnhancedTextAreaProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiPreview, setAIPreview] = useState<AIPreview>({ content: '', isVisible: false });
  const [isFocused, setIsFocused] = useState(false);
  
  // Get wizard context for AI generation (safely - may not be in provider)
  let wizardState: any = null;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const wizardContext = useWizard();
    wizardState = wizardContext?.state;
  } catch {
    // Not in WizardProvider - that's ok, we'll use fallbacks
  }

  // Sync editor content with value prop
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  // Calculate word/character count
  const text = value.replace(/<[^>]*>/g, '').trim();
  const wordCount = text ? text.split(/\s+/).length : 0;
  const charCount = text.length;

  // Execute formatting command
  const execCommand = useCallback((command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    // Update parent state
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  // Handle editor input
  const handleInput = useCallback(() => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  // Generate AI content - calls backend API when available, falls back to simulated
  const generateAI = useCallback(async () => {
    setIsGeneratingAI(true);
    
    try {
      // Build context from wizard state if available
      let apiContext: Record<string, any> = contextData || {};
      
      if (wizardState) {
        const hbuContext = buildHBUContext(wizardState);
        apiContext = { ...formatContextForAPI(hbuContext), ...contextData };
      }
      
      // Try to call the backend API
      const response = await fetch('/api/appraisals/ai-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section: sectionContext,
          context: apiContext,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data?.data?.content) {
          setAIPreview({ content: data.data.content, isVisible: true });
          setIsGeneratingAI(false);
          return;
        }
      }
      
      // Fall back to simulated responses if API fails
      console.warn('AI API not available, using simulated response');
      const draft = SimulatedAIDrafts[sectionContext] || SimulatedAIDrafts.default;
      setAIPreview({ content: draft, isVisible: true });
    } catch (error) {
      console.warn('AI generation failed, using simulated response:', error);
      // Fall back to simulated responses
      const draft = SimulatedAIDrafts[sectionContext] || SimulatedAIDrafts.default;
      setAIPreview({ content: draft, isVisible: true });
    }
    
    setIsGeneratingAI(false);
  }, [sectionContext, contextData, wizardState]);

  // Accept AI draft
  const acceptAI = useCallback(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = aiPreview.content.replace(/\n/g, '<br>');
      onChange(editorRef.current.innerHTML);
    }
    setAIPreview({ content: '', isVisible: false });
  }, [aiPreview.content, onChange]);

  // Reject AI draft
  const rejectAI = useCallback(() => {
    setAIPreview({ content: '', isVisible: false });
  }, []);

  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev);
  }, []);

  // Close fullscreen on Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isFullscreen]);

  const minHeight = propMinHeight || rows * 28;

  return (
    <>
      {/* Fullscreen Overlay */}
      {isFullscreen && (
        <div className="fixed inset-0 bg-black/60 z-40" onClick={toggleFullscreen} />
      )}
      
      <div 
        className={`relative ${isFullscreen 
          ? 'fixed inset-8 z-50 bg-white rounded-2xl shadow-2xl p-8 flex flex-col max-w-6xl mx-auto' 
          : ''
        }`}
        style={isFullscreen ? { minHeight: '80vh', maxHeight: '90vh' } : undefined}
      >
        {/* Label Row */}
        <div className="flex items-center justify-between mb-2">
          <label htmlFor={id} className={`block font-medium text-gray-700 ${isFullscreen ? 'text-lg' : 'text-sm'}`}>
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        </div>

        {/* Toolbar */}
        <div className={`flex flex-wrap items-center gap-1 bg-gray-50 border border-gray-200 rounded-t-xl ${isFullscreen ? 'p-4 gap-2' : 'p-2'}`}>
          {/* History */}
          <div className="flex items-center gap-0.5 pr-2 border-r border-gray-300">
            <ToolbarButton icon={<Undo className="w-4 h-4" />} onClick={() => execCommand('undo')} title="Undo" />
            <ToolbarButton icon={<Redo className="w-4 h-4" />} onClick={() => execCommand('redo')} title="Redo" />
          </div>

          {/* Text Formatting */}
          <div className="flex items-center gap-0.5 px-2 border-r border-gray-300">
            <ToolbarButton icon={<Bold className="w-4 h-4" />} onClick={() => execCommand('bold')} title="Bold (Ctrl+B)" />
            <ToolbarButton icon={<Italic className="w-4 h-4" />} onClick={() => execCommand('italic')} title="Italic (Ctrl+I)" />
            <ToolbarButton icon={<Underline className="w-4 h-4" />} onClick={() => execCommand('underline')} title="Underline (Ctrl+U)" />
          </div>

          {/* Alignment */}
          <div className="flex items-center gap-0.5 px-2 border-r border-gray-300">
            <ToolbarButton icon={<AlignLeft className="w-4 h-4" />} onClick={() => execCommand('justifyLeft')} title="Align Left" />
            <ToolbarButton icon={<AlignCenter className="w-4 h-4" />} onClick={() => execCommand('justifyCenter')} title="Align Center" />
            <ToolbarButton icon={<AlignRight className="w-4 h-4" />} onClick={() => execCommand('justifyRight')} title="Align Right" />
          </div>

          {/* Lists */}
          <div className="flex items-center gap-0.5 px-2 border-r border-gray-300">
            <ToolbarButton icon={<List className="w-4 h-4" />} onClick={() => execCommand('insertUnorderedList')} title="Bullet List" />
            <ToolbarButton icon={<ListOrdered className="w-4 h-4" />} onClick={() => execCommand('insertOrderedList')} title="Numbered List" />
          </div>

          {/* AI Draft */}
          <div className="flex items-center gap-2 px-2">
            <button
              type="button"
              onClick={generateAI}
              disabled={isGeneratingAI}
              className="h-7 px-3 text-xs font-medium text-white bg-gradient-to-r from-[#4db8d1] to-[#7fcce0] rounded-md hover:from-[#3da8c1] hover:to-[#6fc0d4] flex items-center gap-1.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {isGeneratingAI ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  AI Draft
                </>
              )}
            </button>
          </div>

          {/* Fullscreen Toggle */}
          <div className="ml-auto">
            <ToolbarButton 
              icon={isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />} 
              onClick={toggleFullscreen} 
              title={isFullscreen ? 'Exit Fullscreen (Esc)' : 'Fullscreen'} 
            />
          </div>
        </div>

        {/* Editor */}
        <div 
          ref={editorRef}
          id={id}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          data-placeholder={placeholder}
          className={`
            w-full border border-gray-200 border-t-0 rounded-b-xl bg-white
            text-gray-700 leading-relaxed
            focus:outline-none focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent
            overflow-y-auto
            ${isFullscreen ? 'flex-1 p-8 text-lg leading-loose' : 'p-4 text-sm'}
            ${!value && !isFocused ? 'empty-placeholder' : ''}
          `}
          style={{ minHeight: isFullscreen ? '500px' : `${minHeight}px` }}
        />

        {/* Footer: Word Count & Helper Text */}
        <div className="flex items-center justify-between mt-2">
          {helperText && (
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-gray-400" />
              {helperText}
            </p>
          )}
          <p className="text-xs text-gray-400 ml-auto">
            {wordCount} words, {charCount} characters
          </p>
        </div>

        {/* AI Preview */}
        {aiPreview.isVisible && (
          <div className="mt-3 p-4 bg-green-50 border border-green-300 rounded-xl animate-fade-in">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-green-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                AI Generated Draft
              </span>
              <div className="flex gap-2">
                <button
                  onClick={acceptAI}
                  className="px-3 py-1 text-xs font-medium text-white bg-green-600 rounded-md hover:bg-green-700 flex items-center gap-1 transition-colors"
                >
                  <Check className="w-3 h-3" />
                  Accept
                </button>
                <button
                  onClick={rejectAI}
                  className="px-3 py-1 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-1 transition-colors"
                >
                  <X className="w-3 h-3" />
                  Reject
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
              {aiPreview.content}
            </p>
          </div>
        )}

      </div>

      {/* Global Styles */}
      <style>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          font-style: italic;
          pointer-events: none;
        }
        [contenteditable]:focus:empty:before {
          content: '';
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}

// ==========================================
// TOOLBAR BUTTON COMPONENT
// ==========================================
function ToolbarButton({ 
  icon, 
  onClick, 
  title,
  active = false 
}: { 
  icon: React.ReactNode; 
  onClick: () => void; 
  title: string;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`
        w-8 h-8 flex items-center justify-center rounded-md transition-colors
        ${active 
          ? 'bg-[#0da1c7] text-white' 
          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
        }
      `}
    >
      {icon}
    </button>
  );
}
