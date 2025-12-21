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
import type { LineItem } from '../types';

// ==========================================
// TYPES
// ==========================================
export type IncomeSectionType = 'revenue' | 'expenses' | 'valuation';

export interface RevenueContextData {
  propertyType: string;
  sqFt: number;
  unitCount: number;
  rentalIncome: LineItem[];
  reimbursements: LineItem[];
  vacancyRate: number;
  effectiveGrossIncome: number;
  potentialGrossIncome: number;
  lossToLease: number;
  potentialMarketRent: number;
}

export interface ExpensesContextData {
  propertyType: string;
  sqFt: number;
  expenses: LineItem[];
  reserves: LineItem[];
  expenseRatio: number;
  expensesPerSf: number;
  totalExpenses: number;
  totalReserves: number;
  effectiveGrossIncome: number;
}

export interface ValuationContextData {
  scenario: string;
  propertyType: string;
  sqFt: number;
  netOperatingIncome: number;
  noiPerSf: number;
  directCapValue: number;
  marketCapRate: number;
  dcfValue: number;
  discountRate: number;
  terminalCapRate: number;
  holdingPeriod: number;
  annualGrowthRate: number;
}

export type IncomeContextData = RevenueContextData | ExpensesContextData | ValuationContextData;

interface IncomeTextEditorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  sectionType: IncomeSectionType;
  contextData: IncomeContextData;
  placeholder?: string;
  rows?: number;
  helperText?: string;
}

interface AIPreview {
  content: string;
  isVisible: boolean;
}

// ==========================================
// CURRENCY FORMATTER
// ==========================================
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD',
    maximumFractionDigits: 0 
  }).format(value);
};

const formatPercent = (value: number): string => {
  return `${value.toFixed(2)}%`;
};

// ==========================================
// AI DRAFT GENERATORS
// ==========================================
function generateRevenueDraft(data: RevenueContextData): string {
  const tenantCount = data.rentalIncome.length;
  const totalRent = data.rentalIncome.reduce((sum, t) => sum + t.amount, 0);
  const totalReimb = data.reimbursements.reduce((sum, r) => sum + r.amount, 0);
  const rentPerSf = data.sqFt > 0 ? totalRent / data.sqFt : 0;
  
  // Build tenant summary
  const tenantList = data.rentalIncome.map(t => {
    const sf = t.itemSqFt || 0;
    const rentPsf = sf > 0 ? (t.amount / sf).toFixed(2) : 'N/A';
    return `${t.name} (${sf.toLocaleString()} SF at $${rentPsf}/SF)`;
  }).join('; ');

  return `The revenue analysis for this ${data.propertyType} property is based on actual contract rents as reflected in the current rent roll. The subject contains approximately ${data.sqFt.toLocaleString()} square feet of rentable area with ${tenantCount} tenant${tenantCount !== 1 ? 's' : ''} currently in place.

The rent roll comprises: ${tenantList || 'various tenants'}. Total scheduled base rent equals ${formatCurrency(totalRent)} annually, representing an average rental rate of $${rentPerSf.toFixed(2)} per square foot.

${totalReimb > 0 ? `Expense reimbursements totaling ${formatCurrency(totalReimb)} annually are recovered from tenants under the lease terms, typical for ${data.propertyType} properties in this market.` : 'The lease structure is gross with no additional expense reimbursements from tenants.'}

${data.lossToLease !== 0 ? `A loss-to-lease analysis indicates contract rents are ${data.lossToLease < 0 ? 'above' : 'below'} current market levels by ${formatCurrency(Math.abs(data.lossToLease))} annually, which ${data.lossToLease < 0 ? 'suggests potential downside risk at lease renewal' : 'represents upside potential as leases roll to market'}.` : 'Contract rents appear to be in line with current market levels.'}

A vacancy and credit loss allowance of ${data.vacancyRate.toFixed(1)}% has been applied to Potential Gross Income, consistent with stabilized market conditions for this property type and quality. This results in an Effective Gross Income of ${formatCurrency(data.effectiveGrossIncome)}.`;
}

function generateExpensesDraft(data: ExpensesContextData): string {
  const expenseList = data.expenses.map(e => {
    const pctEgi = data.effectiveGrossIncome > 0 
      ? ((e.amount / data.effectiveGrossIncome) * 100).toFixed(1) 
      : '0.0';
    const perSf = data.sqFt > 0 ? (e.amount / data.sqFt).toFixed(2) : '0.00';
    return `${e.name}: ${formatCurrency(e.amount)} (${pctEgi}% of EGI, $${perSf}/SF)`;
  }).join('; ');

  const reserveList = data.reserves.map(r => {
    const perSf = data.sqFt > 0 ? (r.amount / data.sqFt).toFixed(2) : '0.00';
    return `${r.name}: ${formatCurrency(r.amount)} ($${perSf}/SF)`;
  }).join('; ');

  return `Operating expenses for the subject ${data.propertyType} property have been analyzed based on historical operating statements and market comparables. Total operating expenses are estimated at ${formatCurrency(data.totalExpenses)} annually, representing an expense ratio of ${data.expenseRatio.toFixed(1)}% of Effective Gross Income and $${data.expensesPerSf.toFixed(2)} per square foot.

The expense breakdown includes: ${expenseList || 'standard operating categories'}.

${data.reserves.length > 0 ? `Replacement reserves of ${formatCurrency(data.totalReserves)} have been deducted below the line for: ${reserveList}. These reserves are typical for ${data.propertyType} properties of similar age and condition.` : 'No separate replacement reserves have been allocated in this analysis.'}

The overall expense ratio of ${data.expenseRatio.toFixed(1)}% is ${data.expenseRatio < 30 ? 'relatively low, consistent with a net lease structure or efficiently managed property' : data.expenseRatio > 50 ? 'elevated, suggesting potential operational inefficiencies or full-service lease obligations' : 'within the typical range for comparable properties in this market'}. The expense projections are considered reasonable and supportable based on the property type, location, and current market conditions.`;
}

function generateValuationDraft(data: ValuationContextData): string {
  const pricePsf = data.sqFt > 0 ? data.directCapValue / data.sqFt : 0;
  const dcfPricePsf = data.sqFt > 0 ? data.dcfValue / data.sqFt : 0;
  const spreadToTerminal = data.terminalCapRate - data.marketCapRate;

  return `The Income Approach value conclusion for the subject ${data.propertyType} property has been developed using both Direct Capitalization and Discounted Cash Flow (Yield Capitalization) methodologies under the "${data.scenario.replace('-', ' ')}" scenario.

**Direct Capitalization Analysis:**
The stabilized Net Operating Income of ${formatCurrency(data.netOperatingIncome)} (${formatCurrency(data.noiPerSf)}/SF) has been capitalized at a market-derived overall rate of ${data.marketCapRate.toFixed(2)}%. This capitalization rate is supported by analysis of recent comparable sales and current investor requirements for ${data.propertyType} properties in this market. The resulting value indication is ${formatCurrency(data.directCapValue)}, or $${pricePsf.toFixed(2)} per square foot.

**Discounted Cash Flow Analysis:**
A ${data.holdingPeriod}-year DCF analysis was performed using a discount rate (yield) of ${data.discountRate.toFixed(2)}% and a terminal capitalization rate of ${data.terminalCapRate.toFixed(2)}%. The ${spreadToTerminal > 0 ? 'positive' : 'negative'} spread of ${Math.abs(spreadToTerminal).toFixed(2)} basis points between going-in and terminal cap rates reflects ${spreadToTerminal > 0 ? 'anticipated market uncertainty and risk premium at reversion' : 'expectations of market improvement over the holding period'}. Annual income growth of ${data.annualGrowthRate.toFixed(1)}% has been applied. The DCF analysis indicates a value of ${formatCurrency(data.dcfValue)}, or $${dcfPricePsf.toFixed(2)} per square foot.

**Reconciliation:**
${Math.abs(data.directCapValue - data.dcfValue) / data.directCapValue < 0.05 
  ? 'The two methodologies produce closely aligned value indications, which provides strong support for the concluded value.' 
  : 'The variance between the two approaches reflects differing assumptions regarding stabilization and market conditions.'} 
Given the ${data.scenario.includes('stabilized') ? 'stabilized nature of the income stream' : 'specific assumptions required for this valuation scenario'}, ${data.directCapValue > data.dcfValue ? 'primary weight is given to the Direct Capitalization approach' : 'the DCF analysis is given greater emphasis'} in the final value conclusion.`;
}

// ==========================================
// MAIN COMPONENT
// ==========================================
export function IncomeTextEditor({
  label,
  value,
  onChange,
  sectionType,
  contextData,
  placeholder = 'Type your analysis and assumptions here...',
  rows = 6,
  helperText,
}: IncomeTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiPreview, setAIPreview] = useState<AIPreview>({ content: '', isVisible: false });
  const [isFocused, setIsFocused] = useState(false);

  // Generate unique ID
  const id = `income-editor-${sectionType}`;

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
  const execCommand = useCallback((command: string, cmdValue: string | undefined = undefined) => {
    document.execCommand(command, false, cmdValue);
    editorRef.current?.focus();
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

  // Generate AI content based on section type and context data
  const generateAI = useCallback(async () => {
    setIsGeneratingAI(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1800));
    
    let draft = '';
    
    switch (sectionType) {
      case 'revenue':
        draft = generateRevenueDraft(contextData as RevenueContextData);
        break;
      case 'expenses':
        draft = generateExpensesDraft(contextData as ExpensesContextData);
        break;
      case 'valuation':
        draft = generateValuationDraft(contextData as ValuationContextData);
        break;
    }
    
    setAIPreview({ content: draft, isVisible: true });
    setIsGeneratingAI(false);
  }, [sectionType, contextData]);

  // Accept AI draft
  const acceptAI = useCallback(() => {
    if (editorRef.current) {
      // Convert markdown-style bold to HTML
      let htmlContent = aiPreview.content
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br>');
      editorRef.current.innerHTML = htmlContent;
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

  const minHeight = rows * 28;

  // Default helper text based on section
  const defaultHelperText = {
    revenue: 'AI can draft a professional revenue analysis based on your rent roll data.',
    expenses: 'AI can draft an expense methodology narrative using your operating data.',
    valuation: 'AI can draft a reconciliation narrative based on your cap rate and DCF analysis.',
  };

  return (
    <>
      {/* Fullscreen Overlay */}
      {isFullscreen && (
        <div className="fixed inset-0 bg-black/60 z-40" onClick={toggleFullscreen} />
      )}
      
      <div 
        className={`relative ${isFullscreen 
          ? 'fixed inset-8 z-50 bg-white rounded-2xl shadow-2xl p-8 flex flex-col max-w-6xl mx-auto' 
          : 'mt-6'
        }`}
        style={isFullscreen ? { minHeight: '80vh', maxHeight: '90vh' } : undefined}
      >
        {/* Label Row */}
        <div className="flex items-center justify-between mb-2">
          <label 
            htmlFor={id} 
            className={`block font-bold uppercase tracking-widest text-slate-400 ${isFullscreen ? 'text-sm' : 'text-xs'}`}
          >
            {label}
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
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-gray-400" />
            {helperText || defaultHelperText[sectionType]}
          </p>
          <p className="text-xs text-gray-400 ml-auto">
            {wordCount} words, {charCount} characters
          </p>
        </div>

        {/* AI Preview */}
        {aiPreview.isVisible && (
          <div className="mt-3 p-4 bg-emerald-50 border border-emerald-300 rounded-xl animate-fade-in">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-emerald-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                AI Generated Draft
              </span>
              <div className="flex gap-2">
                <button
                  onClick={acceptAI}
                  className="px-3 py-1 text-xs font-medium text-white bg-emerald-600 rounded-md hover:bg-emerald-700 flex items-center gap-1 transition-colors"
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
            <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
              {aiPreview.content.split('\n\n').map((paragraph, idx) => (
                <p key={idx} className="mb-3 last:mb-0">
                  {paragraph.split('**').map((part, i) => 
                    i % 2 === 1 ? <strong key={i}>{part}</strong> : part
                  )}
                </p>
              ))}
            </div>
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

