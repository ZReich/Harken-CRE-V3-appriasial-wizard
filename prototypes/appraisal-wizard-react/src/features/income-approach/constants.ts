import type { IncomeData, ExpenseData, ValuationData, PropertyMeta, IncomeApproachState } from './types';

// =================================================================
// DEFAULT VALUES
// =================================================================

export const DEFAULT_PROPERTY_META: PropertyMeta = {
  type: 'office',
  sqFt: 25000,
  unitCount: 24
};

export const DEFAULT_INCOME_DATA: IncomeData = {
  rentalIncome: [
    { id: '100', name: 'Suite 100 - Tech Co', amount: 900000, itemSqFt: 20000, marketRentPerSf: 50, leaseExpiry: '2026-12-31' },
    { id: '101', name: 'Retail Corner', amount: 100000, itemSqFt: 5000, marketRentPerSf: 25, leaseExpiry: '2024-06-30' },
  ],
  expenseReimbursements: [
    { id: '200', name: 'CAM Recovery', amount: 85000 },
    { id: '201', name: 'Tax Reimbursement', amount: 120000 },
  ],
  otherIncome: [
    { id: '1', name: 'Parking Fees', amount: 12000, itemSqFt: 0 },
  ],
  vacancyRate: 5.0,
  vacancyCollectionLoss: 0,
  notes: "Analysis considers both contract and market rent scenarios. Vacancy is stabilized at 5% consistent with the submarket.",
};

export const DEFAULT_EXPENSE_DATA: ExpenseData = {
  expenses: [
    { id: '10', name: 'Real Estate Taxes', amount: 145000 },
    { id: '11', name: 'Property Insurance', amount: 24000 },
    { id: '12', name: 'Maintenance & Repairs', amount: 35000 },
    { id: '13', name: 'Management Fees', amount: 42000 },
    { id: '14', name: 'Utilities', amount: 65000 },
  ],
  reserves: [
    { id: '300', name: 'Capital Reserves ($0.25/SF)', amount: 6250 }
  ],
  notes: "Operating expenses based on T-12 actuals adjusted for inflation. Management fee imputed at 3.5%.",
};

export const DEFAULT_VALUATION_DATA: ValuationData = {
  marketCapRate: 5.50, // Going-In
  terminalCapRate: 6.00, // Exit
  discountRate: 7.50, // Yield
  annualGrowthRate: 3.0,
  holdingPeriod: 10,
  notes: ""
};

export const EMPTY_INCOME_DATA: IncomeData = {
  rentalIncome: [],
  expenseReimbursements: [],
  otherIncome: [],
  vacancyRate: 5.0,
  vacancyCollectionLoss: 0,
  notes: "",
};

export const EMPTY_EXPENSE_DATA: ExpenseData = {
  expenses: [],
  reserves: [],
  notes: "",
};

export const EMPTY_VALUATION_DATA: ValuationData = {
  marketCapRate: 6.00,
  terminalCapRate: 6.50,
  discountRate: 8.00,
  annualGrowthRate: 3.0,
  holdingPeriod: 10,
  notes: ""
};

export const EMPTY_PROPERTY_META: PropertyMeta = {
  type: 'office',
  sqFt: 0,
  unitCount: 0
};

// =================================================================
// INITIAL STATE FOR DEMO
// =================================================================

export const INITIAL_INCOME_APPROACH_STATE: IncomeApproachState = {
  propertyMeta: DEFAULT_PROPERTY_META,
  incomeData: DEFAULT_INCOME_DATA,
  expenseData: DEFAULT_EXPENSE_DATA,
  valuationData: DEFAULT_VALUATION_DATA,
  scenario: 'as-stabilized',
  showGuidance: true,
};

// =================================================================
// PROPERTY TYPE OPTIONS
// =================================================================

export const PROPERTY_TYPE_OPTIONS = [
  { value: 'office', label: 'Office', icon: 'LayoutGrid' },
  { value: 'retail', label: 'Retail', icon: 'Store' },
  { value: 'multifamily', label: 'Multifamily', icon: 'Home' },
  { value: 'industrial', label: 'Industrial', icon: 'Warehouse' },
  { value: 'other', label: 'Other', icon: 'Building2' },
] as const;

export const VALUATION_SCENARIOS = [
  { value: 'as-is', label: 'As Is' },
  { value: 'as-completed', label: 'As Completed' },
  { value: 'as-stabilized', label: 'As Stabilized' },
  { value: 'liquidation', label: 'Liquidation' },
] as const;





