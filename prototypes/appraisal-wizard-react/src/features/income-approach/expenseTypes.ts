/**
 * Expense Comparable Types
 * 
 * Matches the pattern from land-valuation/types.ts for consistency
 */

export interface ExpenseComp {
  id: string;
  address: string;
  cityStateZip: string;
  imageUrl: string;
  
  // Property Data
  propertyType: string;
  sizeSf: number;
  yearBuilt: number;
  occupancy: number;
  
  // Expense Categories (all per SF)
  reTaxesPerSf: number;
  insurancePerSf: number;
  utilitiesPerSf: number;
  rmPerSf: number;
  managementPercent: number;
  totalExpensesPerSf: number;
  
  // Optional Expense Fields
  camPerSf?: number;
  janitorialPerSf?: number;
  securityPerSf?: number;
  landscapingPerSf?: number;
  professionalFeesPerSf?: number;
  reservesPerSf?: number;
  
  // Ratios
  expenseRatioPercent: number; // Total Expenses / EGI
  expensesPerUnit?: number;
  
  // Overall
  selected: boolean; // Whether this comp is selected as benchmark
}

export interface SubjectExpenseProperty {
  address: string;
  cityState: string;
  propertyType: string;
  sizeSf: number;
  yearBuilt: number;
  occupancy: number;
  imageUrl: string;
  
  // Subject's actual expenses
  reTaxesPerSf?: number;
  insurancePerSf?: number;
  utilitiesPerSf?: number;
  rmPerSf?: number;
  managementPercent?: number;
  totalExpensesPerSf?: number;
  expenseRatioPercent?: number;
}

export interface ExpenseGridRow {
  id: string;
  label: string;
  section: 'property' | 'expense' | 'ratio' | 'footer';
  field?: keyof ExpenseComp;
  removable?: boolean;
  format?: 'currency' | 'percent' | 'number';
}

