import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Calendar,
  TrendingUp,
  RefreshCw,
  Hammer,
  Receipt,
  CheckCircle2,
  HelpCircle,
  Plus,
  Trash2,
  Info,
  User,
  FileText,
  MessageSquare
} from 'lucide-react';
import type { 
  LeaseAbstraction, 
  LeaseType, 
  RentEscalation, 
  LeaseOption, 
  TenantImprovement,
  ExpenseRecovery,
  LineItem 
} from '../types';
import { NotesEditorModal } from '../../../components/NotesEditorModal';

// =================================================================
// CONSTANTS & HELPERS
// =================================================================

const LEASE_TYPES: { value: LeaseType; label: string; description: string }[] = [
  { value: 'triple_net', label: 'Triple Net (NNN)', description: 'Tenant pays all operating expenses' },
  { value: 'double_net', label: 'Double Net (NN)', description: 'Tenant pays taxes and insurance' },
  { value: 'single_net', label: 'Single Net (N)', description: 'Tenant pays property taxes only' },
  { value: 'modified_gross', label: 'Modified Gross', description: 'Landlord pays base year, tenant pays increases' },
  { value: 'gross', label: 'Full Service Gross', description: 'Landlord pays all operating expenses' },
  { value: 'ground', label: 'Ground Lease', description: 'Land only, tenant owns improvements' },
  { value: 'percentage', label: 'Percentage', description: 'Base rent plus percentage of sales' },
  { value: 'month_to_month', label: 'Month-to-Month', description: 'No fixed term, can terminate with notice' },
];

const ESCALATION_TYPES = [
  { value: 'fixed', label: 'Fixed', icon: '$' },
  { value: 'percentage', label: 'Percent', icon: '%' },
  { value: 'cpi', label: 'CPI', icon: 'CPI' },
  { value: 'step', label: 'Step', icon: '↗' },
  { value: 'market_reset', label: 'Market', icon: 'MKT' },
];

const OPTION_TYPES = [
  { value: 'renewal', label: 'Renewal' },
  { value: 'expansion', label: 'Expansion' },
  { value: 'termination', label: 'Termination' },
  { value: 'purchase', label: 'Purchase' },
  { value: 'right_of_first_refusal', label: 'ROFR' },
];

const TENANT_TYPES = [
  { value: 'national', label: 'National' },
  { value: 'regional', label: 'Regional' },
  { value: 'local', label: 'Local' },
  { value: 'government', label: 'Govt' },
  { value: 'non_profit', label: 'Non-Profit' },
];

const RECOVERY_TYPES = [
  { value: 'none', label: 'Landlord Pays' },
  { value: 'pro_rata', label: 'Pro-Rata' },
  { value: 'fixed', label: 'Fixed' },
  { value: 'capped', label: 'Capped' },
];

const TAX_INS_RECOVERY_TYPES = [
  { value: 'none', label: 'Landlord Pays' },
  { value: 'pro_rata', label: 'Pro-Rata' },
  { value: 'fixed', label: 'Fixed' },
  { value: 'base_year_stop', label: 'Base Year' },
];

const UTILITY_TYPES = [
  { value: 'landlord', label: 'Landlord' },
  { value: 'tenant', label: 'Tenant' },
  { value: 'submetered', label: 'Submetered' },
  { value: 'prorated', label: 'Pro-Rata' },
];

const RATE_BASIS_TYPES = [
  { value: 'market', label: 'Market' },
  { value: 'fixed', label: 'Fixed' },
  { value: 'cpi_adjusted', label: 'CPI Adj' },
  { value: 'percentage_increase', label: '% Increase' },
];

const generateId = () => `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

const monthsBetween = (start: string, end: string) => {
  if (!start || !end) return 0;
  const s = new Date(start);
  const e = new Date(end);
  return (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth());
};

// =================================================================
// REUSABLE UI COMPONENTS (No Dropdowns)
// =================================================================

/** Tooltip that appears to the RIGHT to prevent cutoff */
interface GuidanceTooltipProps {
  text: string;
}

const GuidanceTooltip: React.FC<GuidanceTooltipProps> = ({ text }) => (
  <div className="group relative inline-flex ml-1.5">
    <HelpCircle size={14} className="text-harken-gray-med hover:text-harken-blue cursor-help transition-colors" />
    <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 w-56 p-3 bg-harken-dark text-white text-xs rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[200] pointer-events-none">
      {text}
      <div className="absolute right-full top-1/2 -translate-y-1/2 w-2 h-2 bg-harken-dark rotate-45 -mr-1" />
    </div>
  </div>
);

interface FieldLabelProps {
  label: string;
  guidance?: string;
  required?: boolean;
}

const FieldLabel: React.FC<FieldLabelProps> = ({ label, guidance, required }) => (
  <label className="flex items-center text-[11px] font-bold text-harken-gray-med dark:text-slate-400 uppercase tracking-wide mb-1.5">
    {label}
    {required && <span className="text-harken-error ml-0.5">*</span>}
    {guidance && <GuidanceTooltip text={guidance} />}
  </label>
);

/** Input field that properly handles zero values */
interface InputFieldProps {
  label: string;
  value: string | number | undefined;
  onChange: (val: string) => void;
  type?: 'text' | 'number' | 'date';
  placeholder?: string;
  guidance?: string;
  required?: boolean;
  prefix?: string;
  suffix?: string;
  className?: string;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  guidance,
  required,
  prefix,
  suffix,
  className = ''
}) => {
  // For numeric fields, show empty string when value is 0 or undefined
  const displayValue = type === 'number' 
    ? (value && value !== 0 ? value : '') 
    : (value ?? '');

  return (
    <div className={className}>
      <FieldLabel label={label} guidance={guidance} required={required} />
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-harken-gray-med text-sm font-medium">{prefix}</span>
        )}
        <input
          type={type}
          value={displayValue}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full px-3 py-2.5 bg-surface-1 dark:bg-elevation-1 border border-light-border dark:border-harken-gray rounded-lg text-sm text-harken-dark dark:text-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-harken-blue/30 focus:border-harken-blue transition-all placeholder:text-harken-gray-med ${prefix ? 'pl-7' : ''} ${suffix ? 'pr-14' : ''}`}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-harken-gray-med text-sm font-medium">{suffix}</span>
        )}
      </div>
    </div>
  );
};

/** Chip-based selection (replaces dropdowns) */
interface ChipSelectProps {
  label: string;
  value: string | undefined;
  onChange: (val: string) => void;
  options: { value: string; label: string; icon?: string }[];
  guidance?: string;
  required?: boolean;
  className?: string;
  size?: 'sm' | 'md';
}

const ChipSelect: React.FC<ChipSelectProps> = ({
  label,
  value,
  onChange,
  options,
  guidance,
  required,
  className = '',
  size = 'md'
}) => (
  <div className={className}>
    <FieldLabel label={label} guidance={guidance} required={required} />
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => {
        const isSelected = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`inline-flex items-center gap-1 rounded-full border font-semibold transition-all ${
              size === 'sm' ? 'px-2.5 py-1 text-[10px]' : 'px-3 py-1.5 text-xs'
            } ${
              isSelected
                ? 'bg-harken-blue text-white border-harken-blue'
                : 'bg-surface-1 dark:bg-elevation-1 text-harken-gray dark:text-slate-300 border-light-border dark:border-harken-gray hover:border-harken-blue hover:text-harken-blue'
            }`}
          >
            {opt.icon && <span className="font-bold">{opt.icon}</span>}
            {opt.label}
          </button>
        );
      })}
    </div>
  </div>
);

/** Segmented button bar for compact selections */
interface SegmentedSelectProps {
  label: string;
  value: string | undefined;
  onChange: (val: string) => void;
  options: { value: string; label: string }[];
  guidance?: string;
  className?: string;
}

const SegmentedSelect: React.FC<SegmentedSelectProps> = ({
  label,
  value,
  onChange,
  options,
  guidance,
  className = ''
}) => (
  <div className={className}>
    <FieldLabel label={label} guidance={guidance} />
    <div className="inline-flex rounded-lg border border-light-border dark:border-harken-gray overflow-hidden">
      {options.map((opt, idx) => {
        const isSelected = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`px-3 py-2 text-xs font-semibold transition-all ${
              idx > 0 ? 'border-l border-light-border dark:border-harken-gray' : ''
            } ${
              isSelected
                ? 'bg-harken-blue text-white'
                : 'bg-surface-1 dark:bg-elevation-1 text-harken-gray dark:text-slate-300 hover:bg-harken-blue/10 hover:text-harken-blue'
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  </div>
);

/** Rich text field that opens NotesEditorModal */
interface RichTextFieldProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  guidance?: string;
  className?: string;
}

const RichTextField: React.FC<RichTextFieldProps> = ({
  label,
  value,
  onChange,
  placeholder = 'Click to add details...',
  guidance,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tempValue, setTempValue] = useState(value);

  const handleOpen = () => {
    setTempValue(value);
    setIsOpen(true);
  };

  const handleSave = () => {
    onChange(tempValue);
    setIsOpen(false);
  };

  const plainText = value ? value.replace(/<[^>]*>/g, '').trim() : '';

  return (
    <div className={className}>
      <FieldLabel label={label} guidance={guidance} />
      <button
        type="button"
        onClick={handleOpen}
        className={`w-full text-left px-4 py-3 bg-surface-1 dark:bg-elevation-1 border border-light-border dark:border-harken-gray rounded-lg transition-all hover:border-harken-blue focus:outline-none focus:ring-2 focus:ring-harken-blue/30 group ${
          plainText ? '' : 'min-h-[80px]'
        }`}
      >
        {plainText ? (
          <div className="flex items-start gap-2">
            <MessageSquare size={14} className="text-harken-blue flex-shrink-0 mt-0.5" />
            <p className="text-sm text-harken-dark dark:text-slate-200 line-clamp-3">{plainText}</p>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-harken-gray-med">
            <MessageSquare size={14} />
            <span className="text-sm">{placeholder}</span>
          </div>
        )}
      </button>

      <NotesEditorModal
        isOpen={isOpen}
        title={label}
        content={tempValue}
        onClose={() => setIsOpen(false)}
        onSave={handleSave}
        onInput={(content) => setTempValue(content)}
      />
    </div>
  );
};

// Tab definitions
const TABS = [
  { id: 'tenant', label: 'Tenant', Icon: User, shortLabel: 'Tenant' },
  { id: 'term', label: 'Lease Term', Icon: Calendar, shortLabel: 'Term' },
  { id: 'escalations', label: 'Escalations', Icon: TrendingUp, shortLabel: 'Escalations' },
  { id: 'options', label: 'Options', Icon: RefreshCw, shortLabel: 'Options' },
  { id: 'ti', label: 'Tenant Improvements', Icon: Hammer, shortLabel: 'TI' },
  { id: 'expenses', label: 'Expense Recovery', Icon: Receipt, shortLabel: 'Expenses' },
] as const;

type TabId = typeof TABS[number]['id'];

// =================================================================
// MAIN COMPONENT
// =================================================================

interface LeaseAbstractionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  lineItem: LineItem;
  onSave: (abstraction: LeaseAbstraction) => void;
  propertyType?: string;
  totalPropertySqFt?: number;
}

export const LeaseAbstractionDrawer: React.FC<LeaseAbstractionDrawerProps> = ({
  isOpen,
  onClose,
  lineItem,
  onSave,
  totalPropertySqFt = 0
}) => {
  const [activeTab, setActiveTab] = useState<TabId>('tenant');
  
  const getInitialData = (): LeaseAbstraction => {
    if (lineItem.leaseAbstraction) {
      return { ...lineItem.leaseAbstraction };
    }
    return {
      id: generateId(),
      lineItemId: lineItem.id,
      tenantName: lineItem.name || '',
      leasedSqFt: lineItem.itemSqFt || 0,
      leaseType: 'triple_net',
      leaseStartDate: '',
      leaseEndDate: lineItem.leaseExpiry || '',
      currentBaseRent: lineItem.amount || 0,
      escalations: [],
      options: [],
      createdAt: new Date().toISOString(),
    };
  };

  const [data, setData] = useState<LeaseAbstraction>(getInitialData());

  useEffect(() => {
    if (isOpen) {
      setData(getInitialData());
      setActiveTab('tenant');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lineItem.id, isOpen]);

  const termMonths = useMemo(() => 
    monthsBetween(data.leaseStartDate, data.leaseEndDate), 
    [data.leaseStartDate, data.leaseEndDate]
  );

  const rentPerSf = useMemo(() => 
    data.leasedSqFt > 0 ? data.currentBaseRent / data.leasedSqFt : 0,
    [data.currentBaseRent, data.leasedSqFt]
  );

  const proRata = useMemo(() =>
    totalPropertySqFt > 0 && data.leasedSqFt > 0 
      ? (data.leasedSqFt / totalPropertySqFt) * 100 
      : 0,
    [data.leasedSqFt, totalPropertySqFt]
  );

  const tabCompletion = useMemo(() => ({
    tenant: !!(data.tenantName && data.leasedSqFt),
    term: !!(data.leaseStartDate && data.leaseEndDate && data.leaseType),
    escalations: data.escalations.length > 0,
    options: true,
    ti: true,
    expenses: true,
  }), [data]);

  const handleUpdate = <K extends keyof LeaseAbstraction>(
    field: K, 
    value: LeaseAbstraction[K]
  ) => {
    setData(prev => ({ ...prev, [field]: value, updatedAt: new Date().toISOString() }));
  };

  // Escalation handlers
  const addEscalation = () => {
    const newEsc: RentEscalation = {
      id: generateId(),
      type: 'percentage',
      value: 3,
      frequencyMonths: 12,
    };
    setData(prev => ({ ...prev, escalations: [...prev.escalations, newEsc] }));
  };

  const updateEscalation = (id: string, updates: Partial<RentEscalation>) => {
    setData(prev => ({
      ...prev,
      escalations: prev.escalations.map(e => e.id === id ? { ...e, ...updates } : e)
    }));
  };

  const removeEscalation = (id: string) => {
    setData(prev => ({
      ...prev,
      escalations: prev.escalations.filter(e => e.id !== id)
    }));
  };

  // Option handlers
  const addOption = () => {
    const newOpt: LeaseOption = {
      id: generateId(),
      type: 'renewal',
      termMonths: 60,
      noticeDays: 180,
      rateBasis: 'market',
    };
    setData(prev => ({ ...prev, options: [...prev.options, newOpt] }));
  };

  const updateOption = (id: string, updates: Partial<LeaseOption>) => {
    setData(prev => ({
      ...prev,
      options: prev.options.map(o => o.id === id ? { ...o, ...updates } : o)
    }));
  };

  const removeOption = (id: string) => {
    setData(prev => ({
      ...prev,
      options: prev.options.filter(o => o.id !== id)
    }));
  };

  // TI handlers
  const updateTI = (updates: Partial<TenantImprovement>) => {
    setData(prev => ({
      ...prev,
      tenantImprovements: prev.tenantImprovements 
        ? { ...prev.tenantImprovements, ...updates }
        : { id: generateId(), isAmortized: false, ...updates }
    }));
  };

  // Expense recovery handlers
  const updateExpenseRecovery = (updates: Partial<ExpenseRecovery>) => {
    setData(prev => ({
      ...prev,
      expenseRecovery: { ...prev.expenseRecovery, ...updates } as ExpenseRecovery
    }));
  };

  // Financials handlers
  const updateFinancials = (updates: Partial<LeaseAbstraction['financials']>) => {
    setData(prev => ({
      ...prev,
      financials: { ...prev.financials, ...updates }
    }));
  };

  const handleSave = () => {
    onSave(data);
    onClose();
  };

  if (!isOpen) return null;

  // =================================================================
  // TAB CONTENT RENDERERS
  // =================================================================

  const renderTenantTab = () => (
    <div className="space-y-6">
      <div className="flex items-start gap-3 p-4 bg-harken-blue/5 dark:bg-harken-blue/10 border border-harken-blue/20 rounded-xl">
        <Info size={18} className="text-harken-blue flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-harken-dark dark:text-slate-200 font-medium">Tenant Information</p>
          <p className="text-xs text-harken-gray dark:text-slate-400 mt-1">
            Enter the tenant's legal name exactly as it appears in the lease. Credit-worthy tenants 
            (national chains, government entities) may support higher capitalization rates.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <InputField
          label="Tenant Name"
          value={data.tenantName}
          onChange={(val) => handleUpdate('tenantName', val)}
          placeholder="e.g., Starbucks Corporation"
          guidance="Trading name or DBA used by tenant"
          required
          className="col-span-2"
        />
        <InputField
          label="Legal Entity Name"
          value={data.tenantLegalName}
          onChange={(val) => handleUpdate('tenantLegalName', val)}
          placeholder="e.g., Starbucks Coffee Company"
          guidance="Exact legal name on lease for USPAP compliance"
        />
        <ChipSelect
          label="Tenant Type"
          value={data.tenantType}
          onChange={(val) => handleUpdate('tenantType', val as LeaseAbstraction['tenantType'])}
          options={TENANT_TYPES}
          guidance="National/credit tenants typically command lower cap rates"
        />
        <InputField
          label="Industry / Sector"
          value={data.tenantIndustry}
          onChange={(val) => handleUpdate('tenantIndustry', val)}
          placeholder="e.g., Food & Beverage"
        />
        <InputField
          label="Credit Rating"
          value={data.tenantCreditRating}
          onChange={(val) => handleUpdate('tenantCreditRating', val)}
          placeholder="e.g., BBB+"
          guidance="S&P/Moody's rating if available"
        />
      </div>

      <div className="border-t border-light-border dark:border-harken-gray pt-6">
        <h4 className="text-sm font-bold text-harken-dark dark:text-slate-200 mb-4">Premises</h4>
        <div className="grid grid-cols-3 gap-4">
          <InputField
            label="Suite / Unit"
            value={data.suiteNumber}
            onChange={(val) => handleUpdate('suiteNumber', val)}
            placeholder="e.g., Suite 100"
          />
          <InputField
            label="Floor"
            value={data.floor?.toString()}
            onChange={(val) => handleUpdate('floor', val)}
            placeholder="e.g., 1"
          />
          <InputField
            label="Leased SF"
            value={data.leasedSqFt}
            onChange={(val) => handleUpdate('leasedSqFt', parseFloat(val) || 0)}
            type="number"
            guidance="Rentable square footage per lease"
            required
          />
        </div>

        {proRata > 0 && (
          <div className="mt-4 flex items-center gap-4 p-3 bg-surface-2 dark:bg-elevation-2 rounded-lg">
            <div className="flex-1">
              <p className="text-xs font-medium text-harken-gray-med uppercase tracking-wide">Pro-Rata Share</p>
              <p className="text-lg font-bold text-harken-dark dark:text-slate-200">{proRata.toFixed(2)}%</p>
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-harken-gray-med uppercase tracking-wide">Of Total Property</p>
              <p className="text-sm text-harken-gray">{totalPropertySqFt.toLocaleString()} SF</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderTermTab = () => (
    <div className="space-y-6">
      <div className="flex items-start gap-3 p-4 bg-harken-blue/5 dark:bg-harken-blue/10 border border-harken-blue/20 rounded-xl">
        <Info size={18} className="text-harken-blue flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-harken-dark dark:text-slate-200 font-medium">Lease Term & Structure</p>
          <p className="text-xs text-harken-gray dark:text-slate-400 mt-1">
            Accurate lease dates are critical for DCF analysis and WALT calculations. 
            Select the lease type that matches the expense structure in the lease document.
          </p>
        </div>
      </div>

      {/* Lease Type Selection - Cards, not dropdown */}
      <div>
        <FieldLabel 
          label="Lease Type" 
          guidance="Determines how operating expenses are handled between landlord and tenant"
          required 
        />
        <div className="grid grid-cols-2 gap-2 mt-2">
          {LEASE_TYPES.map((lt) => (
            <button
              key={lt.value}
              type="button"
              onClick={() => handleUpdate('leaseType', lt.value)}
              className={`p-3 rounded-lg border text-left transition-all ${
                data.leaseType === lt.value
                  ? 'border-harken-blue bg-harken-blue/5 dark:bg-harken-blue/10'
                  : 'border-light-border dark:border-harken-gray hover:border-harken-blue/50 hover:bg-surface-2 dark:hover:bg-elevation-2'
              }`}
            >
              <p className={`text-sm font-semibold ${
                data.leaseType === lt.value ? 'text-harken-blue' : 'text-harken-dark dark:text-slate-200'
              }`}>{lt.label}</p>
              <p className="text-[11px] text-harken-gray-med mt-0.5">{lt.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-4">
        <InputField
          label="Lease Start Date"
          value={data.leaseStartDate}
          onChange={(val) => handleUpdate('leaseStartDate', val)}
          type="date"
          required
        />
        <InputField
          label="Lease End Date"
          value={data.leaseEndDate}
          onChange={(val) => handleUpdate('leaseEndDate', val)}
          type="date"
          required
        />
        <InputField
          label="Execution Date"
          value={data.executionDate}
          onChange={(val) => handleUpdate('executionDate', val)}
          type="date"
          guidance="Date lease was signed (for document verification)"
        />
        <InputField
          label="Rent Commencement"
          value={data.financials?.rentCommencementDate}
          onChange={(val) => updateFinancials({ rentCommencementDate: val })}
          type="date"
          guidance="When rent payments begin (may differ from lease start)"
        />
      </div>

      {/* Term Summary */}
      {termMonths > 0 && (
        <div className="grid grid-cols-3 gap-4 p-4 bg-gradient-to-r from-harken-blue/5 to-accent-teal-mint/5 dark:from-harken-blue/10 dark:to-accent-teal-mint/10 rounded-xl border border-harken-blue/20">
          <div className="text-center">
            <p className="text-[11px] font-bold text-harken-gray-med uppercase tracking-wide">Lease Term</p>
            <p className="text-2xl font-black text-harken-dark dark:text-slate-200 mt-1">{termMonths}</p>
            <p className="text-xs text-harken-gray">months</p>
          </div>
          <div className="text-center border-l border-r border-harken-blue/20">
            <p className="text-[11px] font-bold text-harken-gray-med uppercase tracking-wide">Years</p>
            <p className="text-2xl font-black text-harken-dark dark:text-slate-200 mt-1">{(termMonths / 12).toFixed(1)}</p>
            <p className="text-xs text-harken-gray">years</p>
          </div>
          <div className="text-center">
            <p className="text-[11px] font-bold text-harken-gray-med uppercase tracking-wide">Remaining</p>
            <p className="text-2xl font-black text-harken-dark dark:text-slate-200 mt-1">
              {Math.max(0, monthsBetween(new Date().toISOString().split('T')[0], data.leaseEndDate))}
            </p>
            <p className="text-xs text-harken-gray">months</p>
          </div>
        </div>
      )}

      {/* Rent */}
      <div className="border-t border-light-border dark:border-harken-gray pt-6">
        <h4 className="text-sm font-bold text-harken-dark dark:text-slate-200 mb-4">Base Rent</h4>
        <div className="grid grid-cols-2 gap-4">
          <InputField
            label="Annual Base Rent"
            value={data.currentBaseRent}
            onChange={(val) => handleUpdate('currentBaseRent', parseFloat(val) || 0)}
            type="number"
            prefix="$"
            required
          />
          <div className="flex flex-col justify-end">
            <p className="text-[11px] font-bold text-harken-gray-med uppercase tracking-wide mb-1.5">Rent per SF</p>
            <div className="px-3 py-2.5 bg-surface-2 dark:bg-elevation-2 border border-light-border dark:border-harken-gray rounded-lg">
              <span className="text-lg font-bold text-harken-blue">${rentPerSf.toFixed(2)}</span>
              <span className="text-xs text-harken-gray-med ml-1">/SF/yr</span>
            </div>
          </div>
        </div>
      </div>

      {/* Free Rent */}
      <div className="grid grid-cols-2 gap-4">
        <InputField
          label="Free Rent Period"
          value={data.financials?.freeRentMonths}
          onChange={(val) => updateFinancials({ freeRentMonths: parseInt(val) || 0 })}
          type="number"
          suffix="months"
          guidance="Abated rent period at lease commencement"
        />
        <InputField
          label="Security Deposit"
          value={data.financials?.securityDeposit}
          onChange={(val) => updateFinancials({ securityDeposit: parseFloat(val) || 0 })}
          type="number"
          prefix="$"
        />
      </div>
    </div>
  );

  const renderEscalationsTab = () => (
    <div className="space-y-6">
      <div className="flex items-start gap-3 p-4 bg-harken-blue/5 dark:bg-harken-blue/10 border border-harken-blue/20 rounded-xl">
        <Info size={18} className="text-harken-blue flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-harken-dark dark:text-slate-200 font-medium">Rent Escalations</p>
          <p className="text-xs text-harken-gray dark:text-slate-400 mt-1">
            Document all rent increases specified in the lease. This data is essential for accurate 
            DCF projections and lease-by-lease cash flow modeling.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {data.escalations.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-light-border dark:border-harken-gray rounded-xl">
            <TrendingUp size={32} className="mx-auto text-harken-gray-med mb-3" />
            <p className="text-sm font-medium text-harken-dark dark:text-slate-200">No escalations defined</p>
            <p className="text-xs text-harken-gray-med mt-1 mb-4">Add rent escalation schedules from the lease</p>
            <button
              type="button"
              onClick={addEscalation}
              className="inline-flex items-center gap-2 px-4 py-2 bg-harken-blue text-white text-sm font-semibold rounded-lg hover:bg-harken-blue/90 transition-all"
            >
              <Plus size={16} />
              Add Escalation
            </button>
          </div>
        ) : (
          <>
            {data.escalations.map((esc, idx) => (
              <div 
                key={esc.id} 
                className="p-4 bg-surface-1 dark:bg-elevation-1 border border-light-border dark:border-harken-gray rounded-xl"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-harken-gray-med uppercase tracking-wide">
                    Escalation {idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeEscalation(esc.id)}
                    className="p-1.5 text-harken-gray-med hover:text-harken-error hover:bg-harken-error/10 rounded-lg transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <ChipSelect
                    label="Type"
                    value={esc.type}
                    onChange={(val) => updateEscalation(esc.id, { type: val as RentEscalation['type'] })}
                    options={ESCALATION_TYPES}
                    size="sm"
                  />
                  <InputField
                    label={esc.type === 'fixed' || esc.type === 'step' ? 'Amount' : 'Rate'}
                    value={esc.value}
                    onChange={(val) => updateEscalation(esc.id, { value: parseFloat(val) || 0 })}
                    type="number"
                    prefix={esc.type === 'fixed' || esc.type === 'step' ? '$' : undefined}
                    suffix={esc.type !== 'fixed' && esc.type !== 'step' ? '%' : undefined}
                  />
                  <InputField
                    label="Frequency"
                    value={esc.frequencyMonths}
                    onChange={(val) => updateEscalation(esc.id, { frequencyMonths: parseInt(val) || 12 })}
                    type="number"
                    suffix="mo"
                    guidance="Months between increases"
                  />
                </div>
                {esc.type === 'cpi' && (
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <InputField
                      label="CPI Cap"
                      value={esc.cap}
                      onChange={(val) => updateEscalation(esc.id, { cap: parseFloat(val) || undefined })}
                      type="number"
                      suffix="%"
                      guidance="Maximum annual increase"
                    />
                    <InputField
                      label="CPI Floor"
                      value={esc.floor}
                      onChange={(val) => updateEscalation(esc.id, { floor: parseFloat(val) || undefined })}
                      type="number"
                      suffix="%"
                      guidance="Minimum annual increase"
                    />
                  </div>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addEscalation}
              className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-harken-blue/30 text-harken-blue text-sm font-semibold rounded-xl hover:border-harken-blue hover:bg-harken-blue/5 transition-all"
            >
              <Plus size={16} />
              Add Another Escalation
            </button>
          </>
        )}
      </div>
    </div>
  );

  const renderOptionsTab = () => (
    <div className="space-y-6">
      <div className="flex items-start gap-3 p-4 bg-harken-blue/5 dark:bg-harken-blue/10 border border-harken-blue/20 rounded-xl">
        <Info size={18} className="text-harken-blue flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-harken-dark dark:text-slate-200 font-medium">Lease Options</p>
          <p className="text-xs text-harken-gray dark:text-slate-400 mt-1">
            Document renewal, expansion, termination, and purchase options. Favorable options 
            can significantly impact value and should be disclosed per USPAP requirements.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {data.options.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-light-border dark:border-harken-gray rounded-xl">
            <RefreshCw size={32} className="mx-auto text-harken-gray-med mb-3" />
            <p className="text-sm font-medium text-harken-dark dark:text-slate-200">No options defined</p>
            <p className="text-xs text-harken-gray-med mt-1 mb-4">Add lease options (renewal, expansion, etc.)</p>
            <button
              type="button"
              onClick={addOption}
              className="inline-flex items-center gap-2 px-4 py-2 bg-harken-blue text-white text-sm font-semibold rounded-lg hover:bg-harken-blue/90 transition-all"
            >
              <Plus size={16} />
              Add Option
            </button>
          </div>
        ) : (
          <>
            {data.options.map((opt, idx) => (
              <div 
                key={opt.id} 
                className="p-4 bg-surface-1 dark:bg-elevation-1 border border-light-border dark:border-harken-gray rounded-xl"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-harken-gray-med uppercase tracking-wide">
                    Option {idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeOption(opt.id)}
                    className="p-1.5 text-harken-gray-med hover:text-harken-error hover:bg-harken-error/10 rounded-lg transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                
                <ChipSelect
                  label="Option Type"
                  value={opt.type}
                  onChange={(val) => updateOption(opt.id, { type: val as LeaseOption['type'] })}
                  options={OPTION_TYPES}
                  size="sm"
                  className="mb-4"
                />

                <div className="grid grid-cols-2 gap-3">
                  {(opt.type === 'renewal' || opt.type === 'expansion') && (
                    <InputField
                      label="Option Term"
                      value={opt.termMonths}
                      onChange={(val) => updateOption(opt.id, { termMonths: parseInt(val) || 0 })}
                      type="number"
                      suffix="months"
                    />
                  )}
                  <InputField
                    label="Notice Required"
                    value={opt.noticeDays}
                    onChange={(val) => updateOption(opt.id, { noticeDays: parseInt(val) || 0 })}
                    type="number"
                    suffix="days"
                  />
                  {opt.type === 'renewal' && (
                    <ChipSelect
                      label="Rate Basis"
                      value={opt.rateBasis}
                      onChange={(val) => updateOption(opt.id, { rateBasis: val as LeaseOption['rateBasis'] })}
                      options={RATE_BASIS_TYPES}
                      size="sm"
                      className="col-span-2"
                    />
                  )}
                  {opt.type === 'expansion' && (
                    <InputField
                      label="Expansion SF"
                      value={opt.expansionSf}
                      onChange={(val) => updateOption(opt.id, { expansionSf: parseInt(val) || 0 })}
                      type="number"
                      suffix="SF"
                    />
                  )}
                  {opt.type === 'termination' && (
                    <InputField
                      label="Termination Fee"
                      value={opt.terminationFee}
                      onChange={(val) => updateOption(opt.id, { terminationFee: parseFloat(val) || 0 })}
                      type="number"
                      prefix="$"
                    />
                  )}
                </div>

                {/* Exercised toggle */}
                <div className="mt-4 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => updateOption(opt.id, { isExercised: !opt.isExercised })}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                      opt.isExercised 
                        ? 'bg-accent-teal-mint border-accent-teal-mint' 
                        : 'border-harken-gray-med hover:border-harken-blue'
                    }`}
                  >
                    {opt.isExercised && <CheckCircle2 size={14} className="text-white" />}
                  </button>
                  <span className="text-xs text-harken-gray">Option has been exercised</span>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addOption}
              className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-harken-blue/30 text-harken-blue text-sm font-semibold rounded-xl hover:border-harken-blue hover:bg-harken-blue/5 transition-all"
            >
              <Plus size={16} />
              Add Another Option
            </button>
          </>
        )}
      </div>
    </div>
  );

  const renderTITab = () => {
    const tiTotal = (data.tenantImprovements?.allowancePerSf || 0) * data.leasedSqFt;
    
    return (
      <div className="space-y-6">
        <div className="flex items-start gap-3 p-4 bg-harken-blue/5 dark:bg-harken-blue/10 border border-harken-blue/20 rounded-xl">
          <Info size={18} className="text-harken-blue flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-harken-dark dark:text-slate-200 font-medium">Tenant Improvements</p>
            <p className="text-xs text-harken-gray dark:text-slate-400 mt-1">
              Document TI allowances provided to the tenant. Amortized TI impacts effective rent 
              calculations and should be considered in rent comparability analysis.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <InputField
            label="TI Allowance per SF"
            value={data.tenantImprovements?.allowancePerSf}
            onChange={(val) => updateTI({ allowancePerSf: parseFloat(val) || 0 })}
            type="number"
            prefix="$"
            guidance="Typical range: $15-$75/SF for office"
          />
          <div className="flex flex-col justify-end">
            <p className="text-[11px] font-bold text-harken-gray-med uppercase tracking-wide mb-1.5">Total TI</p>
            <div className="px-3 py-2.5 bg-surface-2 dark:bg-elevation-2 border border-light-border dark:border-harken-gray rounded-lg">
              <span className="text-lg font-bold text-harken-blue">
                ${tiTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
            </div>
          </div>
        </div>

        {/* Amortization */}
        <div className="p-4 bg-surface-1 dark:bg-elevation-1 border border-light-border dark:border-harken-gray rounded-xl">
          <div className="flex items-center gap-3 mb-4">
            <button
              type="button"
              onClick={() => updateTI({ isAmortized: !data.tenantImprovements?.isAmortized })}
              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                data.tenantImprovements?.isAmortized 
                  ? 'bg-harken-blue border-harken-blue' 
                  : 'border-harken-gray-med hover:border-harken-blue'
              }`}
            >
              {data.tenantImprovements?.isAmortized && <CheckCircle2 size={14} className="text-white" />}
            </button>
            <div>
              <p className="text-sm font-semibold text-harken-dark dark:text-slate-200">TI is Amortized into Rent</p>
              <p className="text-xs text-harken-gray-med">Tenant pays back TI allowance over lease term</p>
            </div>
          </div>

          {data.tenantImprovements?.isAmortized && (
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-light-border dark:border-harken-gray">
              <InputField
                label="Amortization Period"
                value={data.tenantImprovements?.amortizationPeriod}
                onChange={(val) => updateTI({ amortizationPeriod: parseInt(val) || 0 })}
                type="number"
                suffix="months"
              />
              <InputField
                label="Interest Rate"
                value={data.tenantImprovements?.amortizationRate}
                onChange={(val) => updateTI({ amortizationRate: parseFloat(val) || 0 })}
                type="number"
                suffix="%"
              />
            </div>
          )}
        </div>

        {/* Work Letter - Rich Text */}
        <RichTextField
          label="Landlord Work"
          value={data.tenantImprovements?.landlordWork || ''}
          onChange={(val) => updateTI({ landlordWork: val })}
          placeholder="Click to describe landlord's work obligations..."
          guidance="Work landlord is responsible for prior to delivery"
        />

        <RichTextField
          label="Tenant Work"
          value={data.tenantImprovements?.tenantWork || ''}
          onChange={(val) => updateTI({ tenantWork: val })}
          placeholder="Click to describe tenant's work scope..."
          guidance="Improvements tenant is responsible for"
        />
      </div>
    );
  };

  const renderExpensesTab = () => {
    const recovery = data.expenseRecovery || {
      cam: { type: 'none' as const },
      taxes: { type: 'none' as const },
      insurance: { type: 'none' as const },
      utilities: { type: 'tenant' as const },
    };

    return (
      <div className="space-y-6">
        <div className="flex items-start gap-3 p-4 bg-harken-blue/5 dark:bg-harken-blue/10 border border-harken-blue/20 rounded-xl">
          <Info size={18} className="text-harken-blue flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-harken-dark dark:text-slate-200 font-medium">Expense Recovery Structure</p>
            <p className="text-xs text-harken-gray dark:text-slate-400 mt-1">
              Define how operating expenses are allocated between landlord and tenant. 
              This directly affects the net rent calculation used in valuation.
            </p>
          </div>
        </div>

        {/* Base Year */}
        <div className="grid grid-cols-2 gap-4">
          <InputField
            label="Base Year"
            value={recovery.baseYear}
            onChange={(val) => updateExpenseRecovery({ baseYear: parseInt(val) || undefined })}
            type="number"
            placeholder="e.g., 2024"
            guidance="Year used for expense stop calculations"
          />
          <InputField
            label="Base Amount per SF"
            value={recovery.baseAmountPerSf}
            onChange={(val) => updateExpenseRecovery({ baseAmountPerSf: parseFloat(val) || undefined })}
            type="number"
            prefix="$"
            guidance="Expense stop amount (landlord pays up to this)"
          />
        </div>

        {/* CAM */}
        <div className="p-4 bg-surface-1 dark:bg-elevation-1 border border-light-border dark:border-harken-gray rounded-xl space-y-4">
          <h4 className="text-sm font-bold text-harken-dark dark:text-slate-200">CAM / Common Area Maintenance</h4>
          <SegmentedSelect
            label="Recovery Type"
            value={recovery.cam?.type}
            onChange={(val) => updateExpenseRecovery({ 
              cam: { ...recovery.cam, type: val as ExpenseRecovery['cam']['type'] }
            })}
            options={RECOVERY_TYPES}
          />
          {recovery.cam?.type !== 'none' && (
            <div className="grid grid-cols-2 gap-3">
              <InputField
                label="Amount"
                value={recovery.cam?.amount}
                onChange={(val) => updateExpenseRecovery({ 
                  cam: { ...recovery.cam, amount: parseFloat(val) || 0 }
                })}
                type="number"
                prefix="$"
                suffix="/SF"
              />
              <InputField
                label="Admin Fee"
                value={recovery.cam?.adminFeePercent}
                onChange={(val) => updateExpenseRecovery({ 
                  cam: { ...recovery.cam, adminFeePercent: parseFloat(val) || 0 }
                })}
                type="number"
                suffix="%"
                guidance="Landlord admin fee (typically 10-15%)"
              />
            </div>
          )}
        </div>

        {/* Taxes */}
        <div className="p-4 bg-surface-1 dark:bg-elevation-1 border border-light-border dark:border-harken-gray rounded-xl space-y-4">
          <h4 className="text-sm font-bold text-harken-dark dark:text-slate-200">Real Estate Taxes</h4>
          <SegmentedSelect
            label="Recovery Type"
            value={recovery.taxes?.type}
            onChange={(val) => updateExpenseRecovery({ 
              taxes: { ...recovery.taxes, type: val as ExpenseRecovery['taxes']['type'] }
            })}
            options={TAX_INS_RECOVERY_TYPES}
          />
          {recovery.taxes?.type === 'base_year_stop' && (
            <InputField
              label="Base Year"
              value={recovery.taxes?.baseYear}
              onChange={(val) => updateExpenseRecovery({ 
                taxes: { ...recovery.taxes, baseYear: parseInt(val) || 0 }
              })}
              type="number"
            />
          )}
        </div>

        {/* Insurance */}
        <div className="p-4 bg-surface-1 dark:bg-elevation-1 border border-light-border dark:border-harken-gray rounded-xl space-y-4">
          <h4 className="text-sm font-bold text-harken-dark dark:text-slate-200">Insurance</h4>
          <SegmentedSelect
            label="Recovery Type"
            value={recovery.insurance?.type}
            onChange={(val) => updateExpenseRecovery({ 
              insurance: { ...recovery.insurance, type: val as ExpenseRecovery['insurance']['type'] }
            })}
            options={TAX_INS_RECOVERY_TYPES}
          />
        </div>

        {/* Utilities */}
        <div className="p-4 bg-surface-1 dark:bg-elevation-1 border border-light-border dark:border-harken-gray rounded-xl space-y-4">
          <h4 className="text-sm font-bold text-harken-dark dark:text-slate-200">Utilities</h4>
          <div className="grid grid-cols-2 gap-4">
            <SegmentedSelect
              label="Responsibility"
              value={recovery.utilities?.type}
              onChange={(val) => updateExpenseRecovery({ 
                utilities: { ...recovery.utilities, type: val as ExpenseRecovery['utilities']['type'] }
              })}
              options={UTILITY_TYPES}
            />
            <InputField
              label="Est. Annual Cost"
              value={recovery.utilities?.estimatedAnnual}
              onChange={(val) => updateExpenseRecovery({ 
                utilities: { ...recovery.utilities, estimatedAnnual: parseFloat(val) || 0 }
              })}
              type="number"
              prefix="$"
            />
          </div>
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'tenant': return renderTenantTab();
      case 'term': return renderTermTab();
      case 'escalations': return renderEscalationsTab();
      case 'options': return renderOptionsTab();
      case 'ti': return renderTITab();
      case 'expenses': return renderExpensesTab();
      default: return null;
    }
  };

  // =================================================================
  // RENDER
  // =================================================================

  return (
    <div className="fixed inset-0 z-[1100] flex">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-harken-dark/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="absolute right-0 top-0 bottom-0 w-full max-w-2xl bg-surface-1 dark:bg-elevation-base shadow-2xl flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="bg-gradient-to-r from-gradient-action-start to-gradient-action-end px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">Lease Abstraction</h2>
              <p className="text-white/70 text-sm">{data.tenantName || 'New Tenant'}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 py-3 border-b border-light-border dark:border-harken-gray bg-surface-2 dark:bg-elevation-1 flex-shrink-0 overflow-x-auto">
          <div className="flex gap-1">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              const isComplete = tabCompletion[tab.id];
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                    isActive 
                      ? 'bg-harken-blue text-white' 
                      : 'text-harken-gray hover:bg-surface-3 dark:hover:bg-elevation-2 hover:text-harken-dark dark:hover:text-slate-200'
                  }`}
                >
                  {isComplete && !isActive ? (
                    <CheckCircle2 size={14} className="text-accent-teal-mint" />
                  ) : (
                    <tab.Icon size={14} />
                  )}
                  {tab.shortLabel}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {renderTabContent()}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-surface-2 dark:bg-elevation-1 border-t border-light-border dark:border-harken-gray flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2 text-sm text-harken-gray-med">
            {Object.values(tabCompletion).filter(Boolean).length} of {TABS.length} sections complete
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-harken-gray font-semibold hover:bg-surface-3 dark:hover:bg-elevation-2 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-6 py-2 bg-harken-blue hover:bg-harken-blue/90 text-white font-bold rounded-lg shadow-sm transition-all transform active:scale-95"
            >
              Save Lease Abstract
            </button>
          </div>
        </div>
      </div>

      {/* Animation styles */}
      <style>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default LeaseAbstractionDrawer;
