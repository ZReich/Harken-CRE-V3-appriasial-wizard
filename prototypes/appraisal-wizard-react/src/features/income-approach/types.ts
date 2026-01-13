// =================================================================
// INCOME APPROACH TYPES
// =================================================================

// =================================================================
// LEASE ABSTRACTION TYPES (USPAP Tier 1)
// Complete commercial lease abstraction for income approach
// =================================================================

/** Lease type classification */
export type LeaseType = 
  | 'gross' 
  | 'modified_gross' 
  | 'triple_net' 
  | 'double_net' 
  | 'single_net' 
  | 'ground' 
  | 'percentage'
  | 'month_to_month';

/** Rent escalation structure */
export interface RentEscalation {
  id: string;
  type: 'fixed' | 'cpi' | 'step' | 'percentage' | 'market_reset';
  /** For fixed/step: dollar amount; For percentage/CPI: rate as decimal */
  value: number;
  /** Frequency in months (12 = annual, 60 = every 5 years) */
  frequencyMonths: number;
  /** Start date for this escalation schedule */
  startDate?: string;
  /** Cap on CPI adjustments (optional) */
  cap?: number;
  /** Floor on CPI adjustments (optional) */
  floor?: number;
  /** Description/notes about this escalation */
  notes?: string;
}

/** Lease option (renewal, expansion, termination, purchase) */
export interface LeaseOption {
  id: string;
  type: 'renewal' | 'expansion' | 'termination' | 'purchase' | 'right_of_first_refusal';
  /** Term length in months (for renewal options) */
  termMonths?: number;
  /** Notice required in days */
  noticeDays?: number;
  /** Rate basis for option */
  rateBasis?: 'market' | 'fixed' | 'cpi_adjusted' | 'percentage_increase';
  /** Fixed rate or percentage if applicable */
  rateValue?: number;
  /** Expansion SF available */
  expansionSf?: number;
  /** Termination fee if applicable */
  terminationFee?: number;
  /** Purchase price or method */
  purchaseTerms?: string;
  /** Date option expires (if different from lease end) */
  expirationDate?: string;
  /** Whether option has been exercised */
  isExercised?: boolean;
  notes?: string;
}

/** Tenant Improvement (TI) allowance structure */
export interface TenantImprovement {
  id: string;
  /** TI allowance per SF */
  allowancePerSf?: number;
  /** Total TI allowance (if not calculated from SF) */
  totalAllowance?: number;
  /** Whether TI is amortized into rent */
  isAmortized: boolean;
  /** Amortization period in months */
  amortizationPeriod?: number;
  /** Amortization interest rate */
  amortizationRate?: number;
  /** Work letter deadline */
  workLetterDeadline?: string;
  /** Landlord work description */
  landlordWork?: string;
  /** Tenant work description */
  tenantWork?: string;
  notes?: string;
}

/** Expense recovery/reimbursement structure */
export interface ExpenseRecovery {
  /** Base year for expense stop calculations */
  baseYear?: number;
  /** Base amount per SF (expense stop) */
  baseAmountPerSf?: number;
  /** CAM reimbursement structure */
  cam: {
    type: 'none' | 'pro_rata' | 'fixed' | 'capped';
    amount?: number;
    cap?: number;
    adminFeePercent?: number; // Landlord admin fee (typically 10-15%)
  };
  /** Real estate tax recovery */
  taxes: {
    type: 'none' | 'pro_rata' | 'fixed' | 'base_year_stop';
    amount?: number;
    baseYear?: number;
  };
  /** Insurance recovery */
  insurance: {
    type: 'none' | 'pro_rata' | 'fixed' | 'base_year_stop';
    amount?: number;
    baseYear?: number;
  };
  /** Utilities responsibility */
  utilities: {
    type: 'landlord' | 'tenant' | 'submetered' | 'prorated';
    estimatedAnnual?: number;
  };
}

/** Security deposit / financial terms */
export interface LeaseFinancials {
  /** Security deposit amount */
  securityDeposit?: number;
  /** Letter of credit amount (if applicable) */
  letterOfCredit?: number;
  /** Guarantor information */
  guarantor?: {
    name: string;
    type: 'personal' | 'corporate' | 'parent_company';
    term?: string; // "Full term" or "First 24 months" etc.
  };
  /** Rent commencement date (may differ from lease start) */
  rentCommencementDate?: string;
  /** Free rent period in months */
  freeRentMonths?: number;
  /** Percentage rent terms (for retail) */
  percentageRent?: {
    breakpoint: number;
    percentage: number;
    reportingPeriod: 'monthly' | 'quarterly' | 'annually';
  };
}

/** Complete lease abstraction for a tenant */
export interface LeaseAbstraction {
  id: string;
  /** Links to the parent LineItem */
  lineItemId: string;
  
  // === TENANT INFORMATION ===
  tenantName: string;
  tenantLegalName?: string;
  tenantType?: 'national' | 'regional' | 'local' | 'government' | 'non_profit';
  tenantIndustry?: string;
  tenantCreditRating?: string;
  /** D&B number or other identifier */
  tenantIdentifier?: string;
  
  // === PREMISES ===
  suiteNumber?: string;
  floor?: number | string;
  leasedSqFt: number;
  /** Pro-rata share percentage (calculated or explicit) */
  proRataShare?: number;
  /** Whether this is a sublease */
  isSublease?: boolean;
  sublandlord?: string;
  
  // === LEASE TERM ===
  leaseType: LeaseType;
  leaseStartDate: string;
  leaseEndDate: string;
  /** Original lease execution date */
  executionDate?: string;
  /** Is this a renewal/extension of prior lease */
  isRenewal?: boolean;
  /** Amendment count */
  amendmentCount?: number;
  
  // === RENT ===
  /** Current annual base rent */
  currentBaseRent: number;
  /** Initial base rent at lease start */
  initialBaseRent?: number;
  /** Current rent per SF */
  currentRentPerSf?: number;
  /** Payment frequency */
  paymentFrequency?: 'monthly' | 'quarterly' | 'annually';
  
  // === ESCALATIONS ===
  escalations: RentEscalation[];
  
  // === OPTIONS ===
  options: LeaseOption[];
  
  // === TENANT IMPROVEMENTS ===
  tenantImprovements?: TenantImprovement;
  
  // === EXPENSE RECOVERY ===
  expenseRecovery?: ExpenseRecovery;
  
  // === FINANCIALS ===
  financials?: LeaseFinancials;
  
  // === METADATA ===
  /** Lease document reference */
  documentReference?: string;
  /** Abstract verified by */
  verifiedBy?: string;
  verifiedDate?: string;
  /** General notes about the lease */
  notes?: string;
  /** Last updated timestamp */
  updatedAt?: string;
  createdAt?: string;
}

/** Summary statistics for lease portfolio */
export interface LeasePortfolioSummary {
  totalLeasedSf: number;
  totalVacantSf: number;
  occupancyRate: number;
  weightedAvgLeaseTermMonths: number;
  weightedAvgRentPerSf: number;
  nearTermExpirations: number; // Count expiring within 12 months
  totalAnnualRent: number;
  totalAnnualRecoveries: number;
}

export interface LineItem {
  id: string;
  name: string;
  amount: number; // Annual amount (Contract Amount)
  comments?: string;
  itemSqFt?: number; // Specific SF for this item
  
  // SF Source tracking for unknown SF scenarios (per Ben's 7-plex example)
  sfSource?: 'measured' | 'estimated' | 'unknown';
  
  // USPAP / Commercial Specifics
  marketRentPerSf?: number; // Market Rent per SF for comparison (Gap analysis)
  leaseExpiry?: string; // Date string YYYY-MM-DD
  
  // Rent Comp Linking (for income line to rent comp connection)
  linkedRentCompIds?: string[];
  
  // === MULTI-FAMILY UNIT GROUPING ===
  /** For grouped multi-family entries: number of units in this group */
  unitCount?: number;
  /** For grouped multi-family entries: number of vacant units */
  vacantUnits?: number;
  /** Unit type identifier for multi-family (links back to unitMix) */
  unitType?: 'studio' | '1br' | '2br' | '3br' | '4br+';
  /** Whether this line was auto-generated from Setup's unitMix */
  isFromUnitMix?: boolean;
  
  // === LEASE ABSTRACTION LINK ===
  /** Complete lease abstraction data for this tenant */
  leaseAbstraction?: LeaseAbstraction;
}

export interface IncomeData {
  rentalIncome: LineItem[];
  expenseReimbursements: LineItem[]; // Recoveries (CAM, Tax, Ins billbacks)
  otherIncome: LineItem[];
  vacancyRate: number;
  vacancyCollectionLoss: number;
  notes: string;
}

export interface ExpenseData {
  expenses: LineItem[];
  reserves: LineItem[]; // Below the line deductions (Capital Reserves)
  notes: string;
}

export interface ValuationData {
  // Direct Cap
  marketCapRate: number; // Going-In Cap
  
  // Yield Cap (DCF)
  terminalCapRate: number; // Exit Cap
  discountRate: number; // IRR / Yield
  annualGrowthRate: number; // Standard growth for income/expenses
  holdingPeriod: number; // usually 10 years
  
  notes: string;
}

export interface PropertyMeta {
  type: 'multifamily' | 'office' | 'retail' | 'industrial' | 'other';
  sqFt: number;
  sfSource?: 'measured' | 'estimated' | 'unknown';  // Track SF certainty
  unitCount: number;
}

export interface FinancialSummary {
  potentialGrossRevenue: number; // Base Rent + Reimbursements + Other
  potentialBaseRent: number;
  totalReimbursements: number;
  totalOtherIncome: number;
  
  potentialGrossIncome: number; // Alias for Revenue (standard term)
  effectiveGrossIncome: number;
  
  totalExpenses: number;
  netOperatingIncome: number;
  
  totalReserves: number;
  adjustedNetOperatingIncome: number; // Cash Flow before Debt Service
  
  expenseRatio: number;
  incomePerSf: number;
  expensesPerSf: number;
  noiPerSf: number;
  
  // Market Analysis
  potentialMarketRent: number;
  lossToLease: number; // Difference between Market and Contract
}

export type ValuationScenario = 'as-is' | 'as-completed' | 'as-stabilized' | 'liquidation';

export type LineItemType = 'rental' | 'reimbursement' | 'other_income' | 'expense' | 'reserve';

// =================================================================
// CAP RATE CALCULATOR TYPES
// =================================================================

export interface CapRateComp {
  id: string;
  salePrice: number;
  noi: number;
  address?: string;
}

export interface BandOfInvestmentInputs {
  loanToValue: number;       // LTV as decimal (e.g., 0.75 for 75%)
  interestRate: number;      // Annual rate as decimal
  loanTerm: number;          // Years
  equityDividendRate: number; // EDR as decimal
}

export interface DebtCoverageInputs {
  debtCoverageRatio: number; // DCR (e.g., 1.25)
  loanConstant: number;      // Annual loan constant as decimal
  loanToValue: number;       // LTV as decimal
}

export interface MarketSurveyInputs {
  capRate: number;           // Direct input as decimal
  source: string;            // Source attribution
  notes?: string;
}

export type CapRateMethod = 'comparable' | 'band' | 'dcr' | 'market';

export interface CapRateCalculatorState {
  activeMethod: CapRateMethod;
  comparables: CapRateComp[];
  bandInputs: BandOfInvestmentInputs;
  dcrInputs: DebtCoverageInputs;
  marketInputs: MarketSurveyInputs;
  selectedCapRate: number | null;
}

// =================================================================
// INCOME APPROACH STATE
// =================================================================

// Re-export comparable types for convenience
export type { RentComp, RentGridRow, SubjectRentProperty } from './rentTypes';
export type { ExpenseComp, ExpenseGridRow, SubjectExpenseProperty } from './expenseTypes';

// Import for use in IncomeApproachState
import type { RentComp } from './rentTypes';
import type { ExpenseComp } from './expenseTypes';

// Income Approach sub-tab types for workflow tracking
export type IncomeSubTab = 'rent-comps' | 'expense-comps' | 'pro-forma' | 'valuation';

export interface IncomeApproachState {
  propertyMeta: PropertyMeta;
  incomeData: IncomeData;
  expenseData: ExpenseData;
  valuationData: ValuationData;
  scenario: ValuationScenario;
  showGuidance: boolean;
  
  // Comparable data (persisted)
  rentComparables: RentComp[];
  rentCompNotes: string;
  expenseComparables: ExpenseComp[];
  expenseCompNotes: string;
  
  // Concluded values from rent comparables
  concludedMarketRentPerSf?: number;
  
  // Workflow tracking
  completedSubTabs: IncomeSubTab[];
}



