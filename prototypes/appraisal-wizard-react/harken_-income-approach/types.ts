
export interface LineItem {
  id: string;
  name: string;
  amount: number; // Annual amount (Contract Amount)
  comments?: string;
  itemSqFt?: number; // Specific SF for this item
  
  // USPAP / Commercial Specifics
  marketRentPerSf?: number; // Market Rent per SF for comparison (Gap analysis)
  leaseExpiry?: string; // Date string YYYY-MM-DD
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
