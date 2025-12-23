import { LandComp, Improvement, GridRow, ValueScenario } from './types';

// =================================================================
// DROPDOWN OPTIONS
// =================================================================

export const OCCUPANCY_OPTIONS = [
  "Apartment", "Bank", "Convenience Store", "Hospital", 
  "Hotel/Motel", "Industrial", "Industrial (Light)", "Industrial (Heavy)", 
  "Office", "Office (Low Rise)", "Office (High Rise)", "Parking Structure", 
  "Retail Store", "School", "Warehouse"
];

export const CLASS_OPTIONS = [
  "A - Fireproof Steel", 
  "B - Reinforced Concrete", 
  "C - Masonry", 
  "D - Wood Frame", 
  "S - Metal"
];

export const QUALITY_OPTIONS = [
  "Low", "Fair", "Average", "Good", "Excellent", "Luxury"
];

export const SCENARIO_OPTIONS: ValueScenario[] = [
  'As Is',
  'As Completed', 
  'As Stabilized'
];

// =================================================================
// DEPRECIATION TABLE DATA
// =================================================================

export const DEPRECIATION_TABLE_DATA = [
  { age: 1, frame: 1, masonryWood: 0, masonrySteel: 0 },
  { age: 2, frame: 2, masonryWood: 1, masonrySteel: 0 },
  { age: 3, frame: 3, masonryWood: 2, masonrySteel: 1 },
  { age: 4, frame: 4, masonryWood: 3, masonrySteel: 2 },
  { age: 5, frame: 6, masonryWood: 5, masonrySteel: 3 },
  { age: 8, frame: 12, masonryWood: 10, masonrySteel: 5 },
  { age: 10, frame: 20, masonryWood: 15, masonrySteel: 8 },
  { age: 15, frame: 25, masonryWood: 20, masonrySteel: 15 },
  { age: 20, frame: 30, masonryWood: 25, masonrySteel: 20 },
  { age: 25, frame: 35, masonryWood: 30, masonrySteel: 25 },
  { age: 30, frame: 40, masonryWood: 35, masonrySteel: 30 },
  { age: 35, frame: 45, masonryWood: 40, masonrySteel: 35 },
  { age: 40, frame: 50, masonryWood: 45, masonrySteel: 40 },
  { age: 45, frame: 55, masonryWood: 50, masonrySteel: 45 },
  { age: 50, frame: 60, masonryWood: 55, masonrySteel: 50 },
  { age: 55, frame: 65, masonryWood: 60, masonrySteel: 55 },
  { age: 60, frame: 70, masonryWood: 65, masonrySteel: 60 },
];

// =================================================================
// INITIAL GRID ROWS
// =================================================================

export const INITIAL_LAND_ROWS: GridRow[] = [
  // Transaction Data
  { id: 'salePrice', label: 'Sale Price', type: 'data', section: 'transaction', field: 'salePrice' },
  { id: 'dateSold', label: 'Date Sold', type: 'data', section: 'transaction', field: 'dateSold' },
  { id: 'landSf', label: 'Land SF', type: 'data', section: 'transaction', field: 'landSf' },
  { id: 'pricePsf', label: '$/SF (Unadj)', type: 'data', section: 'transaction' },
  { id: 'zoning', label: 'Zoning', type: 'data', section: 'transaction', field: 'zoning' },
  
  // Quantitative Adjustments
  { id: 'market', label: 'Time (Market Cond.)', type: 'adjustment', section: 'quantitative', removable: true },
  { id: 'location', label: 'Location', type: 'adjustment', section: 'quantitative', removable: true },
  { id: 'size', label: 'Size', type: 'adjustment', section: 'quantitative', removable: true },
  { id: 'zoning_adj', label: 'Zoning', type: 'adjustment', section: 'quantitative', removable: true },
  { id: 'utilities', label: 'Utilities', type: 'adjustment', section: 'quantitative', removable: true },
  
  // Qualitative Characteristics
  { id: 'access', label: 'Access/Exposure', type: 'adjustment', section: 'qualitative', removable: true },
  { id: 'topography', label: 'Topography', type: 'adjustment', section: 'qualitative', removable: true },
];

// =================================================================
// MOCK DATA
// =================================================================

export const MOCK_LAND_COMPS: LandComp[] = [
  {
    id: '1',
    address: '123 Main St',
    cityStateZip: 'Billings, MT 59102',
    dateSold: '2023-10-02',
    salePrice: 1550000,
    landSf: 52359,
    zoning: 'CMU1',
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800',
    adjustments: {
      market: 0,
      location: -0.05,
      zoning_adj: 0,
      utilities: 0,
      size: 0.05,
    },
  },
  {
    id: '2',
    address: '4500 King Ave',
    cityStateZip: 'Billings, MT 59106',
    dateSold: '2023-08-15',
    salePrice: 1800000,
    landSf: 65000,
    zoning: 'CMU2',
    imageUrl: 'https://images.unsplash.com/photo-1449824913929-4b4794984059?auto=format&fit=crop&q=80&w=800',
    adjustments: {
      market: 0.02,
      location: 0,
      zoning_adj: 0,
      utilities: 0,
      size: -0.02,
    },
  },
  {
    id: '3',
    address: '782 Broadwater Ave',
    cityStateZip: 'Billings, MT 59102',
    dateSold: '2023-06-10',
    salePrice: 950000,
    landSf: 32000,
    zoning: 'CMU1',
    imageUrl: 'https://images.unsplash.com/photo-1572883454114-1cf0031a029e?auto=format&fit=crop&q=80&w=800',
    adjustments: {
      market: 0,
      location: -0.02,
      zoning_adj: 0,
      utilities: 0,
      size: 0,
    },
  }
];

export const MOCK_IMPROVEMENTS: Improvement[] = [
  {
    id: '1',
    name: "Light Manufacturing",
    occupancy: "Industrial (Light)",
    class: "C - Masonry",
    quality: "Average",
    sourceName: "MVS Sec 14 P 24",
    sourceDate: "Jan 2024",
    yearBuilt: 2022,
    yearRemodeled: undefined,
    effectiveAge: 2,
    economicLife: 45,
    areaSf: 9425,
    baseCostPsf: 113.36,
    entrepreneurialIncentive: 0.10,
    multipliers: { current: 1.0, local: 1.0, perimeter: 1.0 },
    depreciationPhysical: 0.05,
    depreciationFunctional: 0.0,
    depreciationExternal: 0.0,
  },
  {
    id: '2',
    name: "Interior Office",
    occupancy: "Office",
    class: "C - Masonry",
    quality: "Good",
    sourceName: "MVS Sec 15 P 10",
    sourceDate: "Jan 2024",
    yearBuilt: 2024,
    effectiveAge: 0,
    economicLife: 55,
    areaSf: 400,
    baseCostPsf: 150.24,
    entrepreneurialIncentive: 0.15,
    multipliers: { current: 1.0, local: 1.0, perimeter: 1.0 },
    depreciationPhysical: 0.0,
    depreciationFunctional: 0.0,
    depreciationExternal: 0.0,
  },
  {
    id: '3',
    name: "Refrigerated Space",
    occupancy: "Industrial",
    class: "C - Masonry",
    quality: "Average",
    yearBuilt: 2020,
    effectiveAge: 4,
    economicLife: 45,
    areaSf: 675,
    baseCostPsf: 132.81,
    entrepreneurialIncentive: 0.10,
    multipliers: { current: 1.0, local: 1.0, perimeter: 1.0 },
    depreciationPhysical: 0.10,
    depreciationFunctional: 0.0,
    depreciationExternal: 0.0,
  }
];

export const DEFAULT_IMPROVEMENT: Improvement = {
  id: '',
  name: "New Component",
  occupancy: "Industrial",
  class: "C - Masonry",
  quality: "Average",
  yearBuilt: new Date().getFullYear(),
  effectiveAge: 0,
  economicLife: 45,
  areaSf: 0,
  baseCostPsf: 0,
  entrepreneurialIncentive: 0.10,
  multipliers: { current: 1.0, local: 1.0, perimeter: 1.0 },
  depreciationPhysical: 0,
  depreciationFunctional: 0,
  depreciationExternal: 0,
};

// =================================================================
// HELPER FUNCTIONS
// =================================================================

export const formatCurrency = (val: number) => 
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

export const formatPercent = (val: number) => 
  `${val > 0 ? '+' : ''}${(val * 100).toFixed(1)}%`;

export const formatPercentSimple = (val: number) => 
  `${(val * 100).toFixed(1)}%`;



