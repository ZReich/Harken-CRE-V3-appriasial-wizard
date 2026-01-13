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

// Reserved for future formatting
const _formatPercent = (value: number): string => {
  return `${value.toFixed(2)}%`;
};
void _formatPercent;

// ==========================================
// AI DRAFT GENERATORS
// Following cursor rules: 30-year MAI appraiser voice, third person,
// HTML formatting only, definitive language, data integrity
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

  return `<b><u>REVENUE ANALYSIS</u></b>

The revenue analysis for the subject ${data.propertyType} property is based on contract rents as reflected in the current rent roll provided to the appraiser. The subject contains approximately ${data.sqFt.toLocaleString()} square feet of net rentable area with ${tenantCount} tenant${tenantCount !== 1 ? 's' : ''} currently in occupancy.

<b><u>RENT ROLL SUMMARY</u></b>

The rent roll comprises the following tenancies: ${tenantList || 'various tenants as itemized in the rent roll'}. Total scheduled base rent equals ${formatCurrency(totalRent)} annually, representing a weighted average rental rate of $${rentPerSf.toFixed(2)} per square foot. Based on the appraiser's analysis of comparable rental data, these contract rents ${rentPerSf > 15 ? 'are at' : 'appear to be at'} market levels for similar space in the subject's competitive market area.

${totalReimb > 0 ? `<b><u>EXPENSE REIMBURSEMENTS</u></b>\n\nExpense reimbursements totaling ${formatCurrency(totalReimb)} annually are recovered from tenants pursuant to the lease terms, which is typical for ${data.propertyType} properties operating under modified gross or triple net lease structures in this market.` : 'The lease structure is full-service gross with no additional expense reimbursements from tenants beyond base rent.'}

${data.lossToLease !== 0 ? `<b><u>LOSS-TO-LEASE ANALYSIS</u></b>\n\nThe appraiser's analysis indicates that contract rents are ${data.lossToLease < 0 ? 'above' : 'below'} current market levels by ${formatCurrency(Math.abs(data.lossToLease))} annually. This ${data.lossToLease < 0 ? 'suggests potential downside risk at lease renewal as rents may adjust to market' : 'represents upside potential as leases roll to market upon expiration'}.` : 'Based on the appraiser's market rent analysis, contract rents appear to be consistent with current market levels for comparable space.'}

<b><u>VACANCY AND CREDIT LOSS</u></b>

A vacancy and credit loss allowance of ${data.vacancyRate.toFixed(1)}% has been applied to Potential Gross Income. This allowance is consistent with stabilized market conditions for this property type and quality class, and is supported by the appraiser's analysis of comparable properties. The resulting Effective Gross Income is ${formatCurrency(data.effectiveGrossIncome)}.`;
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

  return `<b><u>OPERATING EXPENSE ANALYSIS</u></b>

Operating expenses for the subject ${data.propertyType} property have been estimated based on the appraiser's analysis of historical operating statements, comparable expense data, and published expense surveys. Total operating expenses are concluded at ${formatCurrency(data.totalExpenses)} annually, representing an expense ratio of ${data.expenseRatio.toFixed(1)}% of Effective Gross Income and $${data.expensesPerSf.toFixed(2)} per square foot.

<b><u>EXPENSE BREAKDOWN</u></b>

The appraiser's expense estimate includes the following categories: ${expenseList || 'standard operating expense categories typical for this property type'}. These expense levels are consistent with similar ${data.propertyType} properties in the subject's market area based on the appraiser's research and interviews with property managers.

${data.reserves.length > 0 ? `<b><u>REPLACEMENT RESERVES</u></b>\n\nReplacement reserves totaling ${formatCurrency(data.totalReserves)} annually have been deducted below the line for the following capital items: ${reserveList}. These reserves are consistent with industry standards for ${data.propertyType} properties of similar age, construction quality, and condition, and are adequate to address anticipated capital expenditures over the investment holding period.` : 'No separate replacement reserves have been allocated in this analysis, as the lease structure transfers capital replacement responsibility to the tenant(s).'}

<b><u>EXPENSE RATIO ANALYSIS</u></b>

The concluded expense ratio of ${data.expenseRatio.toFixed(1)}% is ${data.expenseRatio < 30 ? 'relatively low, which is consistent with a net lease structure where the tenant is responsible for most operating expenses, or reflects an efficiently managed property with minimal landlord obligations' : data.expenseRatio > 50 ? 'elevated compared to typical market levels, which is attributable to the full-service lease structure or higher-than-average operating costs associated with the property's age, quality, or specific operational requirements' : 'within the typical range for comparable properties in this market and is supportable based on published expense surveys and comparable property data'}. The expense projections adopted in this analysis are considered reasonable and supportable based on the property type, location, and current market conditions, and assume competent property management.`;
}

function generateValuationDraft(data: ValuationContextData): string {
  const pricePsf = data.sqFt > 0 ? data.directCapValue / data.sqFt : 0;
  const dcfPricePsf = data.sqFt > 0 ? data.dcfValue / data.sqFt : 0;
  const spreadToTerminal = data.terminalCapRate - data.marketCapRate;
  const spreadBasisPoints = Math.abs(spreadToTerminal * 100).toFixed(0);
  const scenarioDisplay = data.scenario.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  return `<b><u>INCOME APPROACH VALUE CONCLUSION</u></b>

The Income Approach value conclusion for the subject ${data.propertyType} property has been developed using both Direct Capitalization and Discounted Cash Flow (Yield Capitalization) methodologies. The analysis is presented under the "${scenarioDisplay}" valuation scenario.

<b><u>DIRECT CAPITALIZATION ANALYSIS</u></b>

The stabilized Net Operating Income of ${formatCurrency(data.netOperatingIncome)} ($${data.noiPerSf.toFixed(2)}/SF) has been capitalized at a market-derived overall capitalization rate of ${data.marketCapRate.toFixed(2)}%. This capitalization rate is supported by the appraiser's analysis of recent comparable sales, published investor surveys, and current investor yield requirements for ${data.propertyType} properties in this market. It is our conclusion that the Direct Capitalization approach indicates a value of ${formatCurrency(data.directCapValue)}, or $${pricePsf.toFixed(2)} per square foot.

<b><u>DISCOUNTED CASH FLOW ANALYSIS</u></b>

A ${data.holdingPeriod}-year Discounted Cash Flow analysis was developed using a discount rate (internal rate of return) of ${data.discountRate.toFixed(2)}% and a terminal capitalization rate of ${data.terminalCapRate.toFixed(2)}%. The ${spreadToTerminal > 0 ? 'positive' : 'negative'} spread of ${spreadBasisPoints} basis points between the going-in and terminal capitalization rates reflects ${spreadToTerminal > 0 ? 'the typical risk premium investors require for the uncertainty associated with the reversion value' : 'market expectations of yield compression and improving conditions over the holding period'}. Annual income growth of ${data.annualGrowthRate.toFixed(1)}% has been applied, which is consistent with current market expectations and inflation forecasts. It is our conclusion that the DCF analysis indicates a value of ${formatCurrency(data.dcfValue)}, or $${dcfPricePsf.toFixed(2)} per square foot.

<b><u>RECONCILIATION AND CONCLUSION</u></b>

${Math.abs(data.directCapValue - data.dcfValue) / data.directCapValue < 0.05
      ? 'The two methodologies produce closely aligned value indications, which provides strong support for the reliability of the concluded value and the underlying assumptions.'
      : 'The variance between the two approaches reflects the differing treatment of income growth, stabilization timing, and risk factors inherent in each methodology.'} Based on the appraiser's analysis and considering the ${data.scenario.includes('stabilized') ? 'stabilized nature of the subject\'s income stream' : 'specific valuation assumptions required for this scenario'}, ${data.directCapValue > data.dcfValue ? 'primary weight is given to the Direct Capitalization approach, which is most reflective of how typical investors would analyze this property' : 'the DCF analysis is given greater emphasis, as it better captures the anticipated changes in income over the investment period'}. It is our conclusion that the Income Approach indicates a value of ${formatCurrency(Math.round((data.directCapValue + data.dcfValue) / 2 / 1000) * 1000)} for the subject property.`;
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
          ? 'fixed inset-8 z-50 bg-surface-1 dark:bg-elevation-1 rounded-2xl shadow-2xl p-8 flex flex-col max-w-6xl mx-auto'
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
        <div className={`flex flex-wrap items-center gap-1 bg-harken-gray-light dark:bg-elevation-1 border border-light-border dark:border-harken-gray rounded-t-xl ${isFullscreen ? 'p-4 gap-2' : 'p-2'}`}>
          {/* History */}
          <div className="flex items-center gap-0.5 pr-2 border-r border-light-border dark:border-harken-gray">
            <ToolbarButton icon={<Undo className="w-4 h-4" />} onClick={() => execCommand('undo')} title="Undo" />
            <ToolbarButton icon={<Redo className="w-4 h-4" />} onClick={() => execCommand('redo')} title="Redo" />
          </div>

          {/* Text Formatting */}
          <div className="flex items-center gap-0.5 px-2 border-r border-light-border dark:border-harken-gray">
            <ToolbarButton icon={<Bold className="w-4 h-4" />} onClick={() => execCommand('bold')} title="Bold (Ctrl+B)" />
            <ToolbarButton icon={<Italic className="w-4 h-4" />} onClick={() => execCommand('italic')} title="Italic (Ctrl+I)" />
            <ToolbarButton icon={<Underline className="w-4 h-4" />} onClick={() => execCommand('underline')} title="Underline (Ctrl+U)" />
          </div>

          {/* Alignment */}
          <div className="flex items-center gap-0.5 px-2 border-r border-light-border dark:border-harken-gray">
            <ToolbarButton icon={<AlignLeft className="w-4 h-4" />} onClick={() => execCommand('justifyLeft')} title="Align Left" />
            <ToolbarButton icon={<AlignCenter className="w-4 h-4" />} onClick={() => execCommand('justifyCenter')} title="Align Center" />
            <ToolbarButton icon={<AlignRight className="w-4 h-4" />} onClick={() => execCommand('justifyRight')} title="Align Right" />
          </div>

          {/* Lists */}
          <div className="flex items-center gap-0.5 px-2 border-r border-light-border dark:border-harken-gray">
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
            w-full border border-light-border dark:border-harken-gray border-t-0 rounded-b-xl bg-surface-1 dark:bg-elevation-1
            text-harken-gray dark:text-slate-200 leading-relaxed
            focus:outline-none focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent
            overflow-y-auto
            ${isFullscreen ? 'flex-1 p-8 text-lg leading-loose' : 'p-4 text-sm'}
            ${!value && !isFocused ? 'empty-placeholder' : ''}
          `}
          style={{ minHeight: isFullscreen ? '500px' : `${minHeight}px` }}
        />

        {/* Footer: Word Count & Helper Text */}
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-harken-gray-med flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-harken-gray-med" />
            {helperText || defaultHelperText[sectionType]}
          </p>
          <p className="text-xs text-harken-gray-med ml-auto">
            {wordCount} words, {charCount} characters
          </p>
        </div>

        {/* AI Preview */}
        {aiPreview.isVisible && (
          <div className="mt-3 p-4 bg-accent-teal-mint-light border border-accent-teal-mint rounded-xl animate-fade-in">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-accent-teal-mint flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                AI Generated Draft
              </span>
              <div className="flex gap-2">
                <button
                  onClick={acceptAI}
                  className="px-3 py-1 text-xs font-medium text-white bg-accent-teal-mint rounded-md hover:bg-accent-teal-mint flex items-center gap-1 transition-colors"
                >
                  <Check className="w-3 h-3" />
                  Accept
                </button>
                <button
                  onClick={rejectAI}
                  className="px-3 py-1 text-xs font-medium text-harken-gray dark:text-slate-200 bg-surface-1 dark:bg-elevation-1 border border-light-border dark:border-harken-gray rounded-md hover:bg-harken-gray-light dark:hover:bg-harken-gray flex items-center gap-1 transition-colors"
                >
                  <X className="w-3 h-3" />
                  Reject
                </button>
              </div>
            </div>
            <div className="text-sm text-harken-gray leading-relaxed whitespace-pre-wrap">
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
          : 'text-harken-gray-med dark:text-slate-400 hover:text-harken-gray dark:hover:text-white hover:bg-harken-gray-light dark:hover:bg-harken-gray'
        }
      `}
    >
      {icon}
    </button>
  );
}

