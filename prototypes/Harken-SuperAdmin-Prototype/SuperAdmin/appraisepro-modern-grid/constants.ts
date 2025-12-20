import { Property, GridRowData, PropertyValues, Section } from './types';

export const PROPERTIES: Property[] = [
  {
    id: 'subject',
    type: 'subject',
    name: "The Loft/Wild Willy's",
    address: "1123 1st Avenue North, Billings",
    image: "https://picsum.photos/id/122/400/300", 
    status: "Subject"
  },
  {
    id: 'comp1',
    type: 'comp',
    name: "Tippy Cow Café",
    address: "279 Airport Road, Billings",
    image: "https://picsum.photos/id/437/400/300", 
    distance: "2.4 mi",
    status: "Sold 08-2024"
  },
  {
    id: 'comp2',
    type: 'comp',
    name: "Doc & Eddy's",
    address: "927 S. 32nd Street, Billings",
    image: "https://picsum.photos/id/225/400/300",
    distance: "3.1 mi",
    status: "Sold 01-2024"
  },
  {
    id: 'comp3',
    type: 'comp',
    name: "Casino Mardi Gras",
    address: "4100 King Avenue West, Billings",
    image: "https://picsum.photos/id/158/400/300",
    distance: "5.0 mi",
    status: "Sold 06-2023"
  },
  {
    id: 'comp4',
    type: 'comp',
    name: "Beartooth Bar & Grill",
    address: "305 South 1st Avenue, Laurel",
    image: "https://picsum.photos/id/431/400/300",
    distance: "12.5 mi",
    status: "Sold 12-2020"
  },
  {
    id: 'comp5',
    type: 'comp',
    name: "Dos Machos Restaurant",
    address: "980 S. 24th Street West, Billings",
    image: "https://picsum.photos/id/348/400/300",
    distance: "4.2 mi",
    status: "Sold 02-2020"
  },
  {
    id: 'comp6',
    type: 'comp',
    name: "The Red Door Lounge",
    address: "3875 Grand Avenue, Billings",
    image: "https://picsum.photos/id/435/400/300",
    distance: "6.1 mi",
    status: "Sold 11-2019"
  },
  {
    id: 'comp7',
    type: 'comp',
    name: "Jake's Downtown",
    address: "2701 1st Avenue North, Billings",
    image: "https://picsum.photos/id/238/400/300",
    distance: "0.5 mi",
    status: "Sold 09-2019"
  },
  {
    id: 'comp8',
    type: 'comp',
    name: "Bullwhackers",
    address: "1500 N 7th Ave, Bozeman",
    image: "https://picsum.photos/id/299/400/300",
    distance: "142 mi",
    status: "Sold 05-2019"
  }
];

export const INITIAL_ROWS: GridRowData[] = [
  // SECTION 1: Transaction Data (Facts)
  { id: 't1', category: 'transaction', label: 'Date of Sale', key: 'date', format: 'date' },
  { id: 't2', category: 'transaction', label: 'Identification', key: 'identification', format: 'text' },
  { id: 't3', category: 'transaction', label: 'Address', key: 'address_row', format: 'text' },
  { id: 't4', category: 'transaction', label: 'H & B Use', key: 'hb_use_fact', format: 'text' },
  { id: 't5', category: 'transaction', label: 'Year Built', key: 'year_built', format: 'text' },
  { id: 't6', category: 'transaction', label: 'Effective Age', key: 'eff_age_fact', format: 'text' },
  { id: 't7', category: 'transaction', label: 'Site Area SF', key: 'site_area_fact', format: 'number' },
  { id: 't8', category: 'transaction', label: 'Bldg. Size', key: 'bldg_size_fact', format: 'number' },
  { id: 't9', category: 'transaction', label: 'Qual./Cond.', key: 'condition_fact', format: 'text' },
  { id: 't10', category: 'transaction', label: 'Sales Price', key: 'price', format: 'currency' },
  { id: 't11', category: 'transaction', label: 'Overall $/SF', key: 'price_sf', format: 'currency' },
  { id: 't12', category: 'transaction', label: 'CAP Rate', key: 'cap_rate', format: 'percent' },

  // SECTION 2: Transactional Adjustments
  { id: 'a1', category: 'adjustments', label: 'Prop. Rights', key: 'rights', format: 'text' },
  { id: 'a2', category: 'adjustments', label: 'Financing', key: 'financing', format: 'text' },
  { id: 'a3', category: 'adjustments', label: 'Cond. Sale', key: 'cond_sale', format: 'text' },
  { id: 'a4', category: 'adjustments', label: 'Expenditures', key: 'expenditures', format: 'text' },
  { id: 'a5', category: 'adjustments', label: 'Market Cond.', key: 'market_cond', format: 'text' },
  { id: 'a6', category: 'adjustments', label: 'Adjustment', key: 'adjustment', format: 'text' },
  { id: 'a7', category: 'adjustments', label: 'Adj. Price/SF', key: 'adj_price_sf', format: 'currency' },

  // SECTION 3: Physical Characteristics (Comparison)
  { id: 'p1', category: 'physical', label: 'Location', key: 'location', format: 'text' },
  { id: 'p2', category: 'physical', label: 'H & B Use', key: 'hb_use_comp', format: 'text' },
  { id: 'p3', category: 'physical', label: 'Effective Age', key: 'eff_age_comp', format: 'text' },
  { id: 'p4', category: 'physical', label: 'Site Size/SF', key: 'site_area_comp', format: 'text' },
  { id: 'p5', category: 'physical', label: 'Bldg. Size/SF', key: 'bldg_size_comp', format: 'text' },
  { id: 'p6', category: 'physical', label: 'Qual./Cond.', key: 'condition_comp', format: 'text' },
  
  // SECTION 4: Valuation Analysis
  { id: 'v1', category: 'valuation', label: 'Notes', key: 'notes', format: 'text' },
  { id: 'v2', category: 'valuation', label: 'Overall Comparability', key: 'overall_comp', format: 'text' },
  { id: 'v3', category: 'valuation', label: 'Overall Adjustment', key: 'overall_adj', format: 'percent' },
  { id: 'v4', category: 'valuation', label: 'Adjusted Price Per SF', key: 'adj_price_sf_val', format: 'currency' },
  { id: 'v5', category: 'valuation', label: 'Weighting', key: 'weighting', format: 'percent' },
  { id: 'v6', category: 'valuation', label: 'Sales Value $/SF', key: 'sales_value_sf', format: 'currency_sf' },
  { id: 'v7', category: 'valuation', label: 'TOTAL SALES VALUE', key: 'total_value', format: 'currency' },
];

export const MOCK_VALUES: PropertyValues = {
  subject: {
    // Transaction Facts
    date: { value: 'Current' },
    identification: { value: "The Loft/Wild Willy's" },
    address_row: { value: "1123 1st Avenue North" },
    hb_use_fact: { value: 'Bar/Casino/Rest' },
    year_built: { value: '1930/R2006' },
    eff_age_fact: { value: '12 yrs' },
    site_area_fact: { value: 62375 },
    bldg_size_fact: { value: 8766 },
    condition_fact: { value: 'Aver./Aver.+' },
    price: { value: null },
    price_sf: { value: null },
    cap_rate: { value: null },

    // Adjustments
    rights: { value: 'Fee Simple' },
    financing: { value: 'Cash to Seller' },
    cond_sale: { value: 'Typical' },
    expenditures: { value: 'None' },
    market_cond: { value: 'Current' },
    adjustment: { value: '-' },
    adj_price_sf: { value: null },

    // Physical Comparison
    location: { value: 'Good' },
    hb_use_comp: { value: 'Bar/Casino/Rest' },
    eff_age_comp: { value: '12 yrs' },
    site_area_comp: { value: 62375 },
    bldg_size_comp: { value: 8766 },
    condition_comp: { value: 'Aver./Aver.+' },
    
    // Valuation
    notes: { value: 'Click to Enter Property Notes' },
    overall_comp: { value: null },
    overall_adj: { value: null },
    adj_price_sf_val: { value: null },
    weighting: { value: 1.0 }, // 100%
    sales_value_sf: { value: 235.31 },
    total_value: { value: 'N/A' }
  },
  comp1: {
    // Transaction Facts
    date: { value: '08-2024' },
    identification: { value: "Tippy Cow Café" },
    address_row: { value: "279 Airport Road" },
    hb_use_fact: { value: 'Restaurant' },
    year_built: { value: '1977/R2000' },
    eff_age_fact: { value: '10 yrs' },
    site_area_fact: { value: 37592 },
    bldg_size_fact: { value: 3280 },
    condition_fact: { value: 'Aver./Aver.+' },
    price: { value: 1155000 },
    price_sf: { value: 352.13 },
    cap_rate: { value: 0.0624 },

    // Adjustments
    rights: { value: 'Fee Simple' },
    financing: { value: '-' },
    cond_sale: { value: '-' },
    expenditures: { value: '-' },
    market_cond: { value: '-' },
    adjustment: { value: '-' },
    adj_price_sf: { value: 352.13 },

    // Physical Comparison
    location: { value: 'Superior', flag: 'superior' },
    hb_use_comp: { value: '-', flag: 'similar' },
    eff_age_comp: { value: '-', flag: 'similar' },
    site_area_comp: { value: 'Inferior', flag: 'inferior' },
    bldg_size_comp: { value: 'Superior', flag: 'superior' },
    condition_comp: { value: '-', flag: 'similar' },
    
    // Valuation
    notes: { value: 'Click to add adjustment notes' },
    overall_comp: { value: 'Superior', flag: 'superior' },
    overall_adj: { value: 0 },
    adj_price_sf_val: { value: 344.38 },
    weighting: { value: 0.25 },
    sales_value_sf: { value: null },
    total_value: { value: null }
  },
  comp2: {
    // Transaction Facts
    date: { value: '01-2024' },
    identification: { value: "Doc & Eddy's" },
    address_row: { value: "927 S. 32nd Street" },
    hb_use_fact: { value: 'Rest/Bar/Casino' },
    year_built: { value: '2005' },
    eff_age_fact: { value: '7 yrs' },
    site_area_fact: { value: 84684 },
    bldg_size_fact: { value: 9120 },
    condition_fact: { value: 'Aver./Aver.+' },
    price: { value: 1415000 },
    price_sf: { value: 155.15 },
    cap_rate: { value: 0.0661 },

    // Adjustments
    rights: { value: 'Fee Simple' },
    financing: { value: '-' },
    cond_sale: { value: '-' },
    expenditures: { value: '-' },
    market_cond: { value: '-' },
    adjustment: { value: '-' },
    adj_price_sf: { value: 155.15 },

    // Physical Comparison
    location: { value: 'Superior', flag: 'superior' },
    hb_use_comp: { value: 'Superior', flag: 'superior' },
    eff_age_comp: { value: 'Superior', flag: 'superior' },
    site_area_comp: { value: 'Superior', flag: 'superior' },
    bldg_size_comp: { value: '-', flag: 'similar' },
    condition_comp: { value: '-', flag: 'similar' },
    
    // Valuation
    notes: { value: 'Click to add adjustment notes' },
    overall_comp: { value: 'Superior', flag: 'superior' },
    overall_adj: { value: 0 },
    adj_price_sf_val: { value: 30.45 },
    weighting: { value: 0.25 },
    sales_value_sf: { value: null },
    total_value: { value: null }
  },
  comp3: {
    date: { value: '06-2023' },
    identification: { value: "Casino Mardi Gras" },
    address_row: { value: "4100 King Avenue" },
    hb_use_fact: { value: 'Bar/Casino' },
    year_built: { value: '2007' },
    eff_age_fact: { value: '7 yrs' },
    site_area_fact: { value: 36271 },
    bldg_size_fact: { value: 4284 },
    condition_fact: { value: 'Good/Good' },
    price: { value: 1300000 },
    price_sf: { value: 303.45 },
    cap_rate: { value: 0.0564 },

    rights: { value: 'Fee Simple' },
    financing: { value: '-' },
    cond_sale: { value: '-' },
    expenditures: { value: '-' },
    market_cond: { value: '-' },
    adjustment: { value: '-' },
    adj_price_sf: { value: 303.45 },

    location: { value: 'Superior', flag: 'superior' },
    hb_use_comp: { value: 'Inferior', flag: 'inferior' },
    eff_age_comp: { value: 'Superior', flag: 'superior' },
    site_area_comp: { value: 'Inferior', flag: 'inferior' },
    bldg_size_comp: { value: 'Superior', flag: 'superior' },
    condition_comp: { value: 'Superior', flag: 'superior' },
    
    // Valuation
    notes: { value: 'Click to add adjustment notes' },
    overall_comp: { value: 'Superior', flag: 'superior' },
    overall_adj: { value: 0 },
    adj_price_sf_val: { value: 139.29 },
    weighting: { value: 0.25 },
    sales_value_sf: { value: null },
    total_value: { value: null }
  },
  comp4: {
    date: { value: '12-2020' },
    identification: { value: "Beartooth Bar" },
    address_row: { value: "305 South 1st" },
    hb_use_fact: { value: 'Bar/Casino/Rest' },
    year_built: { value: '1998/R2014' },
    eff_age_fact: { value: '7 yrs' },
    site_area_fact: { value: 15000 },
    bldg_size_fact: { value: 3996 },
    condition_fact: { value: 'Aver./Aver.+' },
    price: { value: 525000 },
    price_sf: { value: 131.38 },
    cap_rate: { value: 0.0739 },

    rights: { value: 'Fee Simple' },
    financing: { value: '-' },
    cond_sale: { value: '-' },
    expenditures: { value: '-' },
    market_cond: { value: 'Inferior' },
    adjustment: { value: '5.0%' },
    adj_price_sf: { value: 137.95 },

    location: { value: 'Inferior', flag: 'inferior' },
    hb_use_comp: { value: '-', flag: 'similar' },
    eff_age_comp: { value: 'Superior', flag: 'superior' },
    site_area_comp: { value: 'Inferior', flag: 'inferior' },
    bldg_size_comp: { value: 'Superior', flag: 'superior' },
    condition_comp: { value: '-', flag: 'similar' },
    
    // Valuation
    notes: { value: 'Click to add adjustment notes' },
    overall_comp: { value: 'Similar', flag: 'similar' },
    overall_adj: { value: 0 },
    adj_price_sf_val: { value: 427.13 },
    weighting: { value: 0.25 },
    sales_value_sf: { value: null },
    total_value: { value: null }
  },
  comp5: {
    date: { value: '02-2020' },
    identification: { value: "Dos Machos" },
    address_row: { value: "980 S. 24th Street" },
    hb_use_fact: { value: 'Bar/Casino/Rest' },
    year_built: { value: '2000' },
    eff_age_fact: { value: '15 yrs' },
    site_area_fact: { value: 74339 },
    bldg_size_fact: { value: 8349 },
    condition_fact: { value: 'Aver./Aver.' },
    price: { value: 1850000 },
    price_sf: { value: 221.58 },
    cap_rate: { value: 0.0598 },

    rights: { value: 'Fee Simple' },
    financing: { value: '-' },
    cond_sale: { value: '-' },
    expenditures: { value: '-' },
    market_cond: { value: 'Inferior' },
    adjustment: { value: '10.0%' },
    adj_price_sf: { value: 243.74 },

    location: { value: 'Superior', flag: 'superior' },
    hb_use_comp: { value: '-', flag: 'similar' },
    eff_age_comp: { value: '-', flag: 'similar' },
    site_area_comp: { value: 'Superior', flag: 'superior' },
    bldg_size_comp: { value: '-', flag: 'similar' },
    condition_comp: { value: 'Inferior', flag: 'inferior' },
    
    // Valuation
    notes: { value: 'Click to add adjustment notes' },
    overall_comp: { value: 'Superior', flag: 'superior' },
    overall_adj: { value: 0 },
    adj_price_sf_val: { value: 250.00 },
    weighting: { value: 0.25 },
    sales_value_sf: { value: null },
    total_value: { value: null }
  }
};

export const AVAILABLE_ELEMENTS = [
  // General / Office / Retail
  { label: 'City/State', key: 'city_state' },
  { label: 'Data Source', key: 'data_source' },
  { label: 'Year Built/Ren', key: 'year_built_ren' },
  { label: '% Office', key: 'pct_office' },
  { label: 'Sidewall Height', key: 'sidewall_height' },
  { label: 'Clear Height', key: 'clear_height' },
  { label: 'Zoning', key: 'zoning' },
  { label: 'Utilities', key: 'utilities' },
  { label: 'Topography', key: 'topography' },
  { label: 'Land Value', key: 'land_value' },
  { label: 'Bldg Value', key: 'bldg_value' },
  { label: 'Grantor', key: 'grantor' },
  { label: 'Grantee', key: 'grantee' },
  { label: 'Site Utility', key: 'site_utility' },
  
  // Industrial
  { label: 'Dock Doors', key: 'dock_doors' },
  { label: 'Power', key: 'power' },
  { label: 'Tenant', key: 'tenant' },
  { label: 'Tenant Rating (S&P)', key: 'tenant_rating' },
  
  // Multi-Family
  { label: '# of Units', key: 'num_units' },
  { label: 'Unit Mix', key: 'unit_mix' },
  { label: 'Price/Unit', key: 'price_unit' },
  { label: 'Net Rentable Area', key: 'nra' },
  { label: 'Gross Bldg Area', key: 'gba' },
  { label: 'Unit Size/SF', key: 'unit_size_sf' },
  { label: 'Beds/Baths', key: 'beds_baths' },
  { label: 'Garages', key: 'garages' },
  { label: 'Heat Source', key: 'heat_source' },
  
  // Hotel
  { label: 'Chain', key: 'chain' },
  { label: 'Scale', key: 'scale' },
  { label: 'Brand/Scale', key: 'brand_scale' },
  { label: 'Room Count', key: 'room_count' },
  { label: 'Price/Room', key: 'price_room' },
  { label: 'RevPAR', key: 'revpar' },
  { label: 'ADR', key: 'adr' },
  
  // Storage
  { label: 'Climate Controlled %', key: 'climate_control' },
  { label: 'Heated', key: 'heated' },
  { label: 'Demised Units', key: 'demised_units' },
];

export const SECTIONS: Section[] = [
  { id: 'transaction', title: 'Transaction Data', color: 'bg-blue-50' },
  { id: 'adjustments', title: 'Transactional Adjustments', color: 'bg-yellow-50' },
  { id: 'physical', title: 'Physical Characteristics & Overall', color: 'bg-emerald-50' },
  { id: 'valuation', title: 'Valuation Analysis', color: 'bg-white' },
];