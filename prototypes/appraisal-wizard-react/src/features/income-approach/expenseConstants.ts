/**
 * Expense Comparable Constants
 * 
 * Mock data and row configurations matching the LandSalesGrid pattern
 */

import { ExpenseComp, SubjectExpenseProperty, ExpenseGridRow } from './expenseTypes';

// =================================================================
// SUBJECT PROPERTY
// =================================================================

export const SUBJECT_EXPENSE_PROPERTY: SubjectExpenseProperty = {
  address: '1211 East Main Street',
  cityState: 'Bozeman, MT',
  propertyType: 'Retail',
  sizeSf: 4290,
  yearBuilt: 1985,
  occupancy: 95,
  imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop',
  reTaxesPerSf: 3.25,
  insurancePerSf: 0.85,
  utilitiesPerSf: 1.50,
  rmPerSf: 1.25,
  managementPercent: 4.0,
  totalExpensesPerSf: 7.85,
  expenseRatioPercent: 33.7,
};

// =================================================================
// MOCK EXPENSE COMPARABLES
// =================================================================

export const MOCK_EXPENSE_COMPS: ExpenseComp[] = [
  {
    id: 'exp1',
    address: '245 W. Main Street',
    cityStateZip: 'Bozeman, MT',
    imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop',
    propertyType: 'Retail',
    sizeSf: 8500,
    yearBuilt: 2010,
    occupancy: 98,
    reTaxesPerSf: 3.45,
    insurancePerSf: 0.72,
    utilitiesPerSf: 1.35,
    rmPerSf: 0.95,
    managementPercent: 3.5,
    totalExpensesPerSf: 7.22,
    expenseRatioPercent: 28.5,
    selected: true,
  },
  {
    id: 'exp2',
    address: '890 N. 7th Avenue',
    cityStateZip: 'Bozeman, MT',
    imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop',
    propertyType: 'Retail',
    sizeSf: 5200,
    yearBuilt: 2005,
    occupancy: 92,
    reTaxesPerSf: 3.15,
    insurancePerSf: 0.80,
    utilitiesPerSf: 1.65,
    rmPerSf: 1.10,
    managementPercent: 4.0,
    totalExpensesPerSf: 7.70,
    expenseRatioPercent: 32.1,
    selected: true,
  },
  {
    id: 'exp3',
    address: '1025 Huffine Lane',
    cityStateZip: 'Bozeman, MT',
    imageUrl: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=400&h=300&fit=crop',
    propertyType: 'Retail',
    sizeSf: 12000,
    yearBuilt: 2018,
    occupancy: 100,
    reTaxesPerSf: 3.80,
    insurancePerSf: 0.65,
    utilitiesPerSf: 1.20,
    rmPerSf: 0.75,
    managementPercent: 3.0,
    totalExpensesPerSf: 6.80,
    expenseRatioPercent: 25.2,
    selected: false,
  },
  {
    id: 'exp4',
    address: '55 E. Cottonwood',
    cityStateZip: 'Bozeman, MT',
    imageUrl: 'https://images.unsplash.com/photo-1582037928769-181f2644ecb7?w=400&h=300&fit=crop',
    propertyType: 'Retail/Office',
    sizeSf: 3800,
    yearBuilt: 1995,
    occupancy: 88,
    reTaxesPerSf: 2.95,
    insurancePerSf: 0.90,
    utilitiesPerSf: 1.85,
    rmPerSf: 1.45,
    managementPercent: 5.0,
    totalExpensesPerSf: 8.40,
    expenseRatioPercent: 38.2,
    selected: false,
  },
];

// =================================================================
// ROW CONFIGURATIONS
// =================================================================

export const EXPENSE_PROPERTY_ROWS: ExpenseGridRow[] = [
  { id: 'address', label: 'Address:', section: 'property', field: 'address' },
  { id: 'propertyType', label: 'Property Type:', section: 'property', field: 'propertyType' },
  { id: 'sizeSf', label: 'Size/SF:', section: 'property', field: 'sizeSf', format: 'number' },
  { id: 'yearBuilt', label: 'Year Built:', section: 'property', field: 'yearBuilt', format: 'number' },
  { id: 'occupancy', label: 'Occupancy:', section: 'property', field: 'occupancy', format: 'percent' },
];

export const EXPENSE_CATEGORY_ROWS: ExpenseGridRow[] = [
  { id: 'reTaxesPerSf', label: 'RE Taxes/SF:', section: 'expense', field: 'reTaxesPerSf', format: 'currency' },
  { id: 'insurancePerSf', label: 'Insurance/SF:', section: 'expense', field: 'insurancePerSf', format: 'currency' },
  { id: 'utilitiesPerSf', label: 'Utilities/SF:', section: 'expense', field: 'utilitiesPerSf', format: 'currency' },
  { id: 'rmPerSf', label: 'R&M/SF:', section: 'expense', field: 'rmPerSf', format: 'currency' },
  { id: 'managementPercent', label: 'Management %:', section: 'expense', field: 'managementPercent', format: 'percent' },
  { id: 'totalExpensesPerSf', label: 'Total Exp/SF:', section: 'expense', field: 'totalExpensesPerSf', format: 'currency', removable: false },
];

export const EXPENSE_RATIO_ROWS: ExpenseGridRow[] = [
  { id: 'expenseRatioPercent', label: 'Expense Ratio:', section: 'ratio', field: 'expenseRatioPercent', format: 'percent' },
];

// =================================================================
// AVAILABLE ELEMENTS FOR ADDING
// =================================================================

export interface AvailableExpenseElement {
  id: string;
  label: string;
  description?: string;
  format?: 'currency' | 'percent' | 'number';
}

export const AVAILABLE_PROPERTY_ELEMENTS: AvailableExpenseElement[] = [
  { id: 'cityState', label: 'City/State', description: 'Location' },
  { id: 'units', label: 'Unit Count', description: 'Number of units', format: 'number' },
  { id: 'parkingRatio', label: 'Parking Ratio', description: 'Spaces per 1,000 SF', format: 'number' },
  { id: 'stories', label: 'Stories', description: 'Number of floors', format: 'number' },
];

export const AVAILABLE_EXPENSE_ELEMENTS: AvailableExpenseElement[] = [
  { id: 'camPerSf', label: 'CAM/SF', description: 'Common area maintenance', format: 'currency' },
  { id: 'janitorialPerSf', label: 'Janitorial/SF', description: 'Cleaning services', format: 'currency' },
  { id: 'securityPerSf', label: 'Security/SF', description: 'Security costs', format: 'currency' },
  { id: 'landscapingPerSf', label: 'Landscaping/SF', description: 'Grounds maintenance', format: 'currency' },
  { id: 'professionalFeesPerSf', label: 'Prof. Fees/SF', description: 'Legal, accounting, etc.', format: 'currency' },
  { id: 'reservesPerSf', label: 'Reserves/SF', description: 'Replacement reserves', format: 'currency' },
  { id: 'adminPerSf', label: 'Admin/SF', description: 'Administrative costs', format: 'currency' },
  { id: 'marketingPerSf', label: 'Marketing/SF', description: 'Advertising & leasing', format: 'currency' },
];

// =================================================================
// FORMATTING UTILITIES
// =================================================================

export const formatCurrency = (value: number): string => {
  return `$${value.toFixed(2)}`;
};

export const formatPercent = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('en-US').format(value);
};



