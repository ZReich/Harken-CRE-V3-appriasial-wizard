// Income Approach - Feature Module
export { IncomeApproachGrid } from './components/IncomeApproachGrid';
export { InputRow } from './components/InputRow';
export { IncomeTextEditor } from './components/IncomeTextEditor';
export { FinancialChart } from './components/FinancialChart';
export { RiskAnalysisModal } from './components/RiskAnalysisModal';
export { RentComparableGrid } from './components/RentComparableGrid';
export { ExpenseComparableGrid } from './components/ExpenseComparableGrid';
export { DCFProjectionTable } from './components/DCFProjectionTable';
export type { 
  IncomeSectionType, 
  RevenueContextData, 
  ExpensesContextData, 
  ValuationContextData,
  IncomeContextData 
} from './components/IncomeTextEditor';

export {
  DEFAULT_PROPERTY_META,
  DEFAULT_INCOME_DATA,
  DEFAULT_EXPENSE_DATA,
  DEFAULT_VALUATION_DATA,
  EMPTY_INCOME_DATA,
  EMPTY_EXPENSE_DATA,
  EMPTY_VALUATION_DATA,
  EMPTY_PROPERTY_META,
  INITIAL_INCOME_APPROACH_STATE,
  PROPERTY_TYPE_OPTIONS,
  VALUATION_SCENARIOS,
} from './constants';

export type {
  LineItem,
  IncomeData,
  ExpenseData,
  ValuationData,
  PropertyMeta,
  FinancialSummary,
  ValuationScenario,
  LineItemType,
  IncomeApproachState,
  IncomeSubTab,
  // Re-exported from rentTypes and expenseTypes via types.ts
  RentComp,
  RentGridRow,
  SubjectRentProperty,
  ExpenseComp,
  ExpenseGridRow,
  SubjectExpenseProperty,
} from './types';

