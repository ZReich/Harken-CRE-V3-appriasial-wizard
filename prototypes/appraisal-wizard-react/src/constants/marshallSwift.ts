/**
 * Marshall & Swift Classification Schema
 * 
 * Comprehensive property classification system aligned with Marshall & Swift
 * cost valuation methodology. Includes property categories, types, occupancy codes,
 * and site improvement classifications.
 * 
 * References:
 * - Marshall Valuation Service (Commercial/Industrial): Sections 11-17
 * - Residential Cost Handbook (Residential)
 * - Section 66: Yard/Site Improvements
 */

// =================================================================
// PROPERTY CATEGORIES
// =================================================================

export type PropertyCategory = 'residential' | 'commercial' | 'land';

export interface PropertyCategoryConfig {
  id: PropertyCategory;
  label: string;
  description: string;
  msReference: string;
}

export const PROPERTY_CATEGORIES: PropertyCategoryConfig[] = [
  {
    id: 'residential',
    label: 'Residential',
    description: 'Single-family, multi-family (1-4 units), manufactured housing',
    msReference: 'Residential Cost Handbook',
  },
  {
    id: 'commercial',
    label: 'Commercial',
    description: 'Office, Retail, Industrial, Institutional, Agricultural',
    msReference: 'Marshall Valuation Service Sections 11-17',
  },
  {
    id: 'land',
    label: 'Land',
    description: 'Vacant land, development sites',
    msReference: 'Section 66 - Site Improvements Only',
  },
];

// =================================================================
// PROPERTY TYPES (Tier 2)
// =================================================================

export interface PropertyType {
  id: string;
  label: string;
  description: string;
  category: PropertyCategory;
  msSection?: string;
}

export const PROPERTY_TYPES: PropertyType[] = [
  // Residential Types
  {
    id: 'single-family',
    label: 'Single Family Residence',
    description: 'Detached single-family home',
    category: 'residential',
    msSection: 'RCH Section 1',
  },
  {
    id: 'townhouse',
    label: 'Townhouse / Row House',
    description: 'Attached units with individual entrances',
    category: 'residential',
    msSection: 'RCH Section 2',
  },
  {
    id: 'duplex-fourplex',
    label: 'Duplex / Triplex / Fourplex',
    description: 'Small multi-family (2-4 units)',
    category: 'residential',
    msSection: 'RCH Section 3',
  },
  {
    id: 'manufactured',
    label: 'Manufactured Housing',
    description: 'Mobile homes, HUD-code manufactured',
    category: 'residential',
    msSection: 'RCH Section 4',
  },
  {
    id: 'adu',
    label: 'Accessory Dwelling Unit',
    description: 'Guest house, granny flat, ADU',
    category: 'residential',
    msSection: 'RCH Section 5',
  },

  // Commercial Types - Office & Professional (Section 11)
  {
    id: 'office',
    label: 'Office & Professional',
    description: 'General office, medical, banks',
    category: 'commercial',
    msSection: 'Section 11',
  },
  
  // Commercial Types - Retail & Service (Section 13)
  {
    id: 'retail',
    label: 'Retail & Service',
    description: 'Stores, restaurants, automotive',
    category: 'commercial',
    msSection: 'Section 13',
  },

  // Commercial Types - Industrial & Storage (Section 14)
  {
    id: 'industrial',
    label: 'Industrial & Storage',
    description: 'Warehouse, manufacturing, flex',
    category: 'commercial',
    msSection: 'Section 14',
  },

  // Commercial Types - Multi-Family (Section 12)
  {
    id: 'multifamily',
    label: 'Multi-Family (5+ Units)',
    description: 'Apartments, senior housing, hotels',
    category: 'commercial',
    msSection: 'Section 12',
  },

  // Commercial Types - Institutional (Section 16)
  {
    id: 'institutional',
    label: 'Institutional & Public',
    description: 'Schools, churches, government',
    category: 'commercial',
    msSection: 'Section 16',
  },

  // Commercial Types - Agricultural (Section 17)
  {
    id: 'agricultural',
    label: 'Agricultural',
    description: 'Barns, silos, greenhouses',
    category: 'commercial',
    msSection: 'Section 17',
  },

  // Land Types
  {
    id: 'vacant-land',
    label: 'Vacant Land',
    description: 'Undeveloped, no improvements',
    category: 'land',
    msSection: 'N/A - Land Comparison',
  },
  {
    id: 'development-site',
    label: 'Development Site',
    description: 'Entitled or partially improved',
    category: 'land',
    msSection: 'Section 66 - Site Improvements',
  },
];

// =================================================================
// M&S OCCUPANCY CODES (Tier 3)
// =================================================================

export interface OccupancyCode {
  id: string;
  label: string;
  description: string;
  propertyTypeId: string;
  msSection: string;
  msPage?: string;
  defaultEconomicLife: number;
  applicableClasses: ConstructionClass[];
  qualityGrades: QualityGrade[];
}

export type ConstructionClass = 'A' | 'B' | 'C' | 'D' | 'S';
export type QualityGrade = 'low' | 'fair' | 'average' | 'good' | 'excellent' | 'luxury';

export const CONSTRUCTION_CLASSES: { id: ConstructionClass; label: string; description: string }[] = [
  { id: 'A', label: 'Class A - Fireproof Steel', description: 'Steel frame, fireproof construction' },
  { id: 'B', label: 'Class B - Reinforced Concrete', description: 'Reinforced concrete frame' },
  { id: 'C', label: 'Class C - Masonry', description: 'Masonry bearing walls' },
  { id: 'D', label: 'Class D - Wood Frame', description: 'Wood frame construction' },
  { id: 'S', label: 'Class S - Metal', description: 'Pre-engineered metal building' },
];

export const QUALITY_GRADES: { id: QualityGrade; label: string; multiplier: number }[] = [
  { id: 'low', label: 'Low', multiplier: 0.75 },
  { id: 'fair', label: 'Fair', multiplier: 0.85 },
  { id: 'average', label: 'Average', multiplier: 1.0 },
  { id: 'good', label: 'Good', multiplier: 1.15 },
  { id: 'excellent', label: 'Excellent', multiplier: 1.35 },
  { id: 'luxury', label: 'Luxury', multiplier: 1.60 },
];

export const OCCUPANCY_CODES: OccupancyCode[] = [
  // =================================================================
  // RESIDENTIAL OCCUPANCY CODES
  // =================================================================
  {
    id: 'sfr-detached',
    label: 'Single Family Detached',
    description: 'Detached home for one family',
    propertyTypeId: 'single-family',
    msSection: 'RCH',
    defaultEconomicLife: 60,
    applicableClasses: ['C', 'D'],
    qualityGrades: ['low', 'fair', 'average', 'good', 'excellent', 'luxury'],
  },
  {
    id: 'townhouse',
    label: 'Townhouse',
    description: 'Attached row house with individual entrance',
    propertyTypeId: 'townhouse',
    msSection: 'RCH',
    defaultEconomicLife: 55,
    applicableClasses: ['C', 'D'],
    qualityGrades: ['fair', 'average', 'good', 'excellent'],
  },
  {
    id: 'duplex',
    label: 'Duplex',
    description: 'Two-unit residential building',
    propertyTypeId: 'duplex-fourplex',
    msSection: 'RCH',
    defaultEconomicLife: 55,
    applicableClasses: ['C', 'D'],
    qualityGrades: ['fair', 'average', 'good', 'excellent'],
  },
  {
    id: 'triplex',
    label: 'Triplex',
    description: 'Three-unit residential building',
    propertyTypeId: 'duplex-fourplex',
    msSection: 'RCH',
    defaultEconomicLife: 55,
    applicableClasses: ['C', 'D'],
    qualityGrades: ['fair', 'average', 'good', 'excellent'],
  },
  {
    id: 'fourplex',
    label: 'Fourplex',
    description: 'Four-unit residential building',
    propertyTypeId: 'duplex-fourplex',
    msSection: 'RCH',
    defaultEconomicLife: 55,
    applicableClasses: ['C', 'D'],
    qualityGrades: ['fair', 'average', 'good', 'excellent'],
  },
  {
    id: 'mobile-single',
    label: 'Mobile Home - Single Wide',
    description: 'Single-wide mobile home',
    propertyTypeId: 'manufactured',
    msSection: 'RCH',
    defaultEconomicLife: 30,
    applicableClasses: ['D'],
    qualityGrades: ['low', 'fair', 'average', 'good'],
  },
  {
    id: 'mobile-double',
    label: 'Mobile Home - Double Wide',
    description: 'Double-wide mobile home',
    propertyTypeId: 'manufactured',
    msSection: 'RCH',
    defaultEconomicLife: 35,
    applicableClasses: ['D'],
    qualityGrades: ['low', 'fair', 'average', 'good'],
  },
  {
    id: 'manufactured-hud',
    label: 'Manufactured Home (HUD)',
    description: 'HUD-code manufactured home',
    propertyTypeId: 'manufactured',
    msSection: 'RCH',
    defaultEconomicLife: 40,
    applicableClasses: ['D'],
    qualityGrades: ['fair', 'average', 'good', 'excellent'],
  },
  {
    id: 'adu-guest',
    label: 'Guest House / ADU',
    description: 'Accessory dwelling unit',
    propertyTypeId: 'adu',
    msSection: 'RCH',
    defaultEconomicLife: 50,
    applicableClasses: ['C', 'D'],
    qualityGrades: ['fair', 'average', 'good', 'excellent'],
  },

  // =================================================================
  // OFFICE & PROFESSIONAL (Section 11)
  // =================================================================
  {
    id: 'office-lowrise',
    label: 'Office - Low Rise',
    description: '1-3 story general office building',
    propertyTypeId: 'office',
    msSection: 'Section 11',
    msPage: 'P 11',
    defaultEconomicLife: 50,
    applicableClasses: ['A', 'B', 'C', 'D', 'S'],
    qualityGrades: ['fair', 'average', 'good', 'excellent'],
  },
  {
    id: 'office-midrise',
    label: 'Office - Mid Rise',
    description: '4-7 story office building',
    propertyTypeId: 'office',
    msSection: 'Section 11',
    msPage: 'P 12',
    defaultEconomicLife: 55,
    applicableClasses: ['A', 'B'],
    qualityGrades: ['average', 'good', 'excellent', 'luxury'],
  },
  {
    id: 'office-highrise',
    label: 'Office - High Rise',
    description: '8+ story office building',
    propertyTypeId: 'office',
    msSection: 'Section 11',
    msPage: 'P 13',
    defaultEconomicLife: 60,
    applicableClasses: ['A', 'B'],
    qualityGrades: ['good', 'excellent', 'luxury'],
  },
  {
    id: 'medical-office',
    label: 'Medical Office Building',
    description: 'Medical/dental professional offices',
    propertyTypeId: 'office',
    msSection: 'Section 11',
    msPage: 'P 15',
    defaultEconomicLife: 50,
    applicableClasses: ['A', 'B', 'C'],
    qualityGrades: ['average', 'good', 'excellent'],
  },
  {
    id: 'dental-clinic',
    label: 'Dental Clinic',
    description: 'Dental office/clinic',
    propertyTypeId: 'office',
    msSection: 'Section 11',
    msPage: 'P 16',
    defaultEconomicLife: 45,
    applicableClasses: ['B', 'C', 'D'],
    qualityGrades: ['average', 'good', 'excellent'],
  },
  {
    id: 'hospital-general',
    label: 'Hospital - General',
    description: 'General acute care hospital',
    propertyTypeId: 'office',
    msSection: 'Section 11',
    msPage: 'P 20',
    defaultEconomicLife: 50,
    applicableClasses: ['A', 'B'],
    qualityGrades: ['good', 'excellent'],
  },
  {
    id: 'veterinary',
    label: 'Veterinary Hospital',
    description: 'Animal hospital/clinic',
    propertyTypeId: 'office',
    msSection: 'Section 11',
    msPage: 'P 25',
    defaultEconomicLife: 45,
    applicableClasses: ['B', 'C', 'S'],
    qualityGrades: ['fair', 'average', 'good', 'excellent'],
  },
  {
    id: 'bank-branch',
    label: 'Bank Branch',
    description: 'Retail bank branch with/without drive-thru',
    propertyTypeId: 'office',
    msSection: 'Section 11',
    msPage: 'P 30',
    defaultEconomicLife: 50,
    applicableClasses: ['A', 'B', 'C'],
    qualityGrades: ['average', 'good', 'excellent'],
  },

  // =================================================================
  // RETAIL & SERVICE (Section 13)
  // =================================================================
  {
    id: 'retail-general',
    label: 'General Retail Store',
    description: 'Freestanding retail/mercantile',
    propertyTypeId: 'retail',
    msSection: 'Section 13',
    msPage: 'P 11',
    defaultEconomicLife: 45,
    applicableClasses: ['B', 'C', 'D', 'S'],
    qualityGrades: ['fair', 'average', 'good', 'excellent'],
  },
  {
    id: 'department-store',
    label: 'Department Store',
    description: 'Large anchor retail store',
    propertyTypeId: 'retail',
    msSection: 'Section 13',
    msPage: 'P 15',
    defaultEconomicLife: 50,
    applicableClasses: ['A', 'B', 'C'],
    qualityGrades: ['average', 'good', 'excellent'],
  },
  {
    id: 'discount-bigbox',
    label: 'Discount / Big Box',
    description: 'Large format discount retailer',
    propertyTypeId: 'retail',
    msSection: 'Section 13',
    msPage: 'P 18',
    defaultEconomicLife: 40,
    applicableClasses: ['C', 'S'],
    qualityGrades: ['fair', 'average', 'good'],
  },
  {
    id: 'strip-center',
    label: 'Strip Shopping Center',
    description: 'Neighborhood/community strip center',
    propertyTypeId: 'retail',
    msSection: 'Section 13',
    msPage: 'P 20',
    defaultEconomicLife: 45,
    applicableClasses: ['B', 'C', 'S'],
    qualityGrades: ['fair', 'average', 'good', 'excellent'],
  },
  {
    id: 'regional-mall',
    label: 'Regional Mall',
    description: 'Enclosed regional shopping mall',
    propertyTypeId: 'retail',
    msSection: 'Section 13',
    msPage: 'P 25',
    defaultEconomicLife: 50,
    applicableClasses: ['A', 'B'],
    qualityGrades: ['average', 'good', 'excellent', 'luxury'],
  },
  {
    id: 'restaurant-sitdown',
    label: 'Restaurant - Sit Down',
    description: 'Full-service restaurant',
    propertyTypeId: 'retail',
    msSection: 'Section 13',
    msPage: 'P 30',
    defaultEconomicLife: 40,
    applicableClasses: ['B', 'C', 'D'],
    qualityGrades: ['fair', 'average', 'good', 'excellent'],
  },
  {
    id: 'restaurant-fastfood',
    label: 'Restaurant - Fast Food/QSR',
    description: 'Quick service restaurant',
    propertyTypeId: 'retail',
    msSection: 'Section 13',
    msPage: 'P 32',
    defaultEconomicLife: 35,
    applicableClasses: ['C', 'D', 'S'],
    qualityGrades: ['fair', 'average', 'good'],
  },
  {
    id: 'bar-tavern',
    label: 'Bar / Tavern / Nightclub',
    description: 'Entertainment venue',
    propertyTypeId: 'retail',
    msSection: 'Section 13',
    msPage: 'P 35',
    defaultEconomicLife: 40,
    applicableClasses: ['B', 'C', 'D'],
    qualityGrades: ['fair', 'average', 'good', 'excellent'],
  },
  {
    id: 'auto-dealership',
    label: 'Auto Dealership',
    description: 'New/used car dealership with service',
    propertyTypeId: 'retail',
    msSection: 'Section 15',
    msPage: 'P 11',
    defaultEconomicLife: 45,
    applicableClasses: ['B', 'C', 'S'],
    qualityGrades: ['average', 'good', 'excellent'],
  },
  {
    id: 'gas-station',
    label: 'Service Station / Gas Station',
    description: 'Fuel station with convenience store',
    propertyTypeId: 'retail',
    msSection: 'Section 15',
    msPage: 'P 15',
    defaultEconomicLife: 35,
    applicableClasses: ['C', 'D', 'S'],
    qualityGrades: ['fair', 'average', 'good'],
  },
  {
    id: 'auto-repair',
    label: 'Auto Repair Garage',
    description: 'Automotive service/repair facility',
    propertyTypeId: 'retail',
    msSection: 'Section 15',
    msPage: 'P 20',
    defaultEconomicLife: 40,
    applicableClasses: ['C', 'S'],
    qualityGrades: ['fair', 'average', 'good'],
  },
  {
    id: 'car-wash',
    label: 'Car Wash',
    description: 'Tunnel, automatic, or self-serve car wash',
    propertyTypeId: 'retail',
    msSection: 'Section 15',
    msPage: 'P 25',
    defaultEconomicLife: 30,
    applicableClasses: ['C', 'S'],
    qualityGrades: ['fair', 'average', 'good'],
  },
  {
    id: 'parking-structure',
    label: 'Parking Structure',
    description: 'Multi-level parking garage',
    propertyTypeId: 'retail',
    msSection: 'Section 15',
    msPage: 'P 30',
    defaultEconomicLife: 50,
    applicableClasses: ['A', 'B'],
    qualityGrades: ['fair', 'average', 'good'],
  },

  // =================================================================
  // INDUSTRIAL & STORAGE (Section 14)
  // =================================================================
  {
    id: 'warehouse-general',
    label: 'General Warehouse',
    description: 'General purpose storage warehouse',
    propertyTypeId: 'industrial',
    msSection: 'Section 14',
    msPage: 'P 11',
    defaultEconomicLife: 45,
    applicableClasses: ['B', 'C', 'S'],
    qualityGrades: ['fair', 'average', 'good'],
  },
  {
    id: 'distribution-center',
    label: 'Distribution Center',
    description: 'Large-scale distribution/logistics facility',
    propertyTypeId: 'industrial',
    msSection: 'Section 14',
    msPage: 'P 15',
    defaultEconomicLife: 45,
    applicableClasses: ['B', 'C', 'S'],
    qualityGrades: ['average', 'good', 'excellent'],
  },
  {
    id: 'cold-storage',
    label: 'Cold Storage / Refrigerated',
    description: 'Refrigerated/freezer warehouse',
    propertyTypeId: 'industrial',
    msSection: 'Section 14',
    msPage: 'P 20',
    defaultEconomicLife: 40,
    applicableClasses: ['B', 'C', 'S'],
    qualityGrades: ['average', 'good', 'excellent'],
  },
  {
    id: 'mini-storage',
    label: 'Mini-Storage / Self-Storage',
    description: 'Self-storage facility',
    propertyTypeId: 'industrial',
    msSection: 'Section 14',
    msPage: 'P 25',
    defaultEconomicLife: 40,
    applicableClasses: ['C', 'S'],
    qualityGrades: ['fair', 'average', 'good'],
  },
  {
    id: 'manufacturing-light',
    label: 'Light Manufacturing',
    description: 'Light assembly/manufacturing',
    propertyTypeId: 'industrial',
    msSection: 'Section 14',
    msPage: 'P 30',
    defaultEconomicLife: 45,
    applicableClasses: ['B', 'C', 'S'],
    qualityGrades: ['fair', 'average', 'good'],
  },
  {
    id: 'manufacturing-heavy',
    label: 'Heavy Manufacturing',
    description: 'Heavy industrial/factory',
    propertyTypeId: 'industrial',
    msSection: 'Section 14',
    msPage: 'P 35',
    defaultEconomicLife: 50,
    applicableClasses: ['A', 'B', 'C'],
    qualityGrades: ['fair', 'average', 'good'],
  },
  {
    id: 'flex-rd',
    label: 'Flex / R&D Building',
    description: 'Office-industrial flex space',
    propertyTypeId: 'industrial',
    msSection: 'Section 14',
    msPage: 'P 40',
    defaultEconomicLife: 45,
    applicableClasses: ['B', 'C', 'S'],
    qualityGrades: ['average', 'good', 'excellent'],
  },
  {
    id: 'loft-industrial',
    label: 'Loft Industrial',
    description: 'Multi-story loft industrial',
    propertyTypeId: 'industrial',
    msSection: 'Section 14',
    msPage: 'P 45',
    defaultEconomicLife: 50,
    applicableClasses: ['B', 'C'],
    qualityGrades: ['fair', 'average', 'good'],
  },

  // =================================================================
  // MULTI-FAMILY (Section 12)
  // =================================================================
  {
    id: 'apartment-lowrise',
    label: 'Apartment - Low Rise',
    description: '1-3 story apartment building',
    propertyTypeId: 'multifamily',
    msSection: 'Section 12',
    msPage: 'P 11',
    defaultEconomicLife: 55,
    applicableClasses: ['C', 'D'],
    qualityGrades: ['fair', 'average', 'good', 'excellent'],
  },
  {
    id: 'apartment-midrise',
    label: 'Apartment - Mid Rise',
    description: '4-7 story apartment building',
    propertyTypeId: 'multifamily',
    msSection: 'Section 12',
    msPage: 'P 15',
    defaultEconomicLife: 55,
    applicableClasses: ['A', 'B', 'C'],
    qualityGrades: ['average', 'good', 'excellent', 'luxury'],
  },
  {
    id: 'apartment-highrise',
    label: 'Apartment - High Rise',
    description: '8+ story apartment building',
    propertyTypeId: 'multifamily',
    msSection: 'Section 12',
    msPage: 'P 18',
    defaultEconomicLife: 60,
    applicableClasses: ['A', 'B'],
    qualityGrades: ['good', 'excellent', 'luxury'],
  },
  {
    id: 'assisted-living',
    label: 'Assisted Living Facility',
    description: 'Senior assisted living',
    propertyTypeId: 'multifamily',
    msSection: 'Section 12',
    msPage: 'P 25',
    defaultEconomicLife: 50,
    applicableClasses: ['B', 'C'],
    qualityGrades: ['average', 'good', 'excellent'],
  },
  {
    id: 'nursing-home',
    label: 'Nursing Home / Convalescent',
    description: 'Skilled nursing facility',
    propertyTypeId: 'multifamily',
    msSection: 'Section 12',
    msPage: 'P 28',
    defaultEconomicLife: 45,
    applicableClasses: ['B', 'C'],
    qualityGrades: ['average', 'good', 'excellent'],
  },
  {
    id: 'hotel-fullservice',
    label: 'Hotel - Full Service',
    description: 'Full-service hotel with amenities',
    propertyTypeId: 'multifamily',
    msSection: 'Section 12',
    msPage: 'P 35',
    defaultEconomicLife: 45,
    applicableClasses: ['A', 'B'],
    qualityGrades: ['average', 'good', 'excellent', 'luxury'],
  },
  {
    id: 'hotel-limited',
    label: 'Hotel - Limited Service',
    description: 'Limited service hotel',
    propertyTypeId: 'multifamily',
    msSection: 'Section 12',
    msPage: 'P 38',
    defaultEconomicLife: 40,
    applicableClasses: ['B', 'C'],
    qualityGrades: ['fair', 'average', 'good'],
  },
  {
    id: 'motel',
    label: 'Motel',
    description: 'Economy motel',
    propertyTypeId: 'multifamily',
    msSection: 'Section 12',
    msPage: 'P 40',
    defaultEconomicLife: 35,
    applicableClasses: ['C', 'D'],
    qualityGrades: ['low', 'fair', 'average', 'good'],
  },
  {
    id: 'extended-stay',
    label: 'Extended Stay Hotel',
    description: 'Extended stay lodging',
    propertyTypeId: 'multifamily',
    msSection: 'Section 12',
    msPage: 'P 42',
    defaultEconomicLife: 40,
    applicableClasses: ['B', 'C'],
    qualityGrades: ['average', 'good', 'excellent'],
  },
  {
    id: 'dormitory',
    label: 'Dormitory / Group Quarters',
    description: 'Student/worker dormitory',
    propertyTypeId: 'multifamily',
    msSection: 'Section 12',
    msPage: 'P 45',
    defaultEconomicLife: 50,
    applicableClasses: ['B', 'C'],
    qualityGrades: ['fair', 'average', 'good'],
  },

  // =================================================================
  // INSTITUTIONAL & PUBLIC (Section 16)
  // =================================================================
  {
    id: 'school-elementary',
    label: 'Elementary School',
    description: 'K-5/6 school building',
    propertyTypeId: 'institutional',
    msSection: 'Section 16',
    msPage: 'P 11',
    defaultEconomicLife: 55,
    applicableClasses: ['B', 'C'],
    qualityGrades: ['average', 'good', 'excellent'],
  },
  {
    id: 'school-middle',
    label: 'Middle School',
    description: 'Middle/junior high school',
    propertyTypeId: 'institutional',
    msSection: 'Section 16',
    msPage: 'P 12',
    defaultEconomicLife: 55,
    applicableClasses: ['B', 'C'],
    qualityGrades: ['average', 'good', 'excellent'],
  },
  {
    id: 'school-high',
    label: 'High School',
    description: 'Secondary school',
    propertyTypeId: 'institutional',
    msSection: 'Section 16',
    msPage: 'P 13',
    defaultEconomicLife: 55,
    applicableClasses: ['A', 'B', 'C'],
    qualityGrades: ['average', 'good', 'excellent'],
  },
  {
    id: 'college-university',
    label: 'College / University',
    description: 'Higher education buildings',
    propertyTypeId: 'institutional',
    msSection: 'Section 16',
    msPage: 'P 18',
    defaultEconomicLife: 60,
    applicableClasses: ['A', 'B'],
    qualityGrades: ['good', 'excellent', 'luxury'],
  },
  {
    id: 'daycare',
    label: 'Day Care Center',
    description: 'Child care facility',
    propertyTypeId: 'institutional',
    msSection: 'Section 16',
    msPage: 'P 20',
    defaultEconomicLife: 45,
    applicableClasses: ['C', 'D'],
    qualityGrades: ['fair', 'average', 'good', 'excellent'],
  },
  {
    id: 'church-sanctuary',
    label: 'Church / Sanctuary',
    description: 'Religious facility',
    propertyTypeId: 'institutional',
    msSection: 'Section 16',
    msPage: 'P 25',
    defaultEconomicLife: 60,
    applicableClasses: ['A', 'B', 'C', 'D'],
    qualityGrades: ['fair', 'average', 'good', 'excellent', 'luxury'],
  },
  {
    id: 'theater-cinema',
    label: 'Theater - Cinema',
    description: 'Movie theater',
    propertyTypeId: 'institutional',
    msSection: 'Section 16',
    msPage: 'P 30',
    defaultEconomicLife: 40,
    applicableClasses: ['B', 'C'],
    qualityGrades: ['average', 'good', 'excellent'],
  },
  {
    id: 'theater-live',
    label: 'Theater - Live Stage',
    description: 'Performing arts theater',
    propertyTypeId: 'institutional',
    msSection: 'Section 16',
    msPage: 'P 32',
    defaultEconomicLife: 55,
    applicableClasses: ['A', 'B'],
    qualityGrades: ['good', 'excellent', 'luxury'],
  },
  {
    id: 'arena-stadium',
    label: 'Arena / Stadium',
    description: 'Large sports/entertainment venue',
    propertyTypeId: 'institutional',
    msSection: 'Section 16',
    msPage: 'P 35',
    defaultEconomicLife: 50,
    applicableClasses: ['A', 'B'],
    qualityGrades: ['good', 'excellent'],
  },
  {
    id: 'community-center',
    label: 'Community Center / Library',
    description: 'Public community facility',
    propertyTypeId: 'institutional',
    msSection: 'Section 16',
    msPage: 'P 40',
    defaultEconomicLife: 55,
    applicableClasses: ['B', 'C'],
    qualityGrades: ['average', 'good', 'excellent'],
  },
  {
    id: 'fire-station',
    label: 'Fire Station',
    description: 'Fire department facility',
    propertyTypeId: 'institutional',
    msSection: 'Section 16',
    msPage: 'P 45',
    defaultEconomicLife: 50,
    applicableClasses: ['B', 'C', 'S'],
    qualityGrades: ['average', 'good', 'excellent'],
  },
  {
    id: 'police-station',
    label: 'Police Station',
    description: 'Law enforcement facility',
    propertyTypeId: 'institutional',
    msSection: 'Section 16',
    msPage: 'P 46',
    defaultEconomicLife: 50,
    applicableClasses: ['B', 'C'],
    qualityGrades: ['average', 'good', 'excellent'],
  },
  {
    id: 'post-office',
    label: 'Post Office',
    description: 'Postal service facility',
    propertyTypeId: 'institutional',
    msSection: 'Section 16',
    msPage: 'P 48',
    defaultEconomicLife: 50,
    applicableClasses: ['B', 'C'],
    qualityGrades: ['average', 'good'],
  },
  {
    id: 'correctional',
    label: 'Jail / Correctional Facility',
    description: 'Detention/correctional facility',
    propertyTypeId: 'institutional',
    msSection: 'Section 16',
    msPage: 'P 50',
    defaultEconomicLife: 50,
    applicableClasses: ['A', 'B'],
    qualityGrades: ['average', 'good'],
  },

  // =================================================================
  // AGRICULTURAL (Section 17)
  // =================================================================
  {
    id: 'barn-general',
    label: 'General Purpose Barn',
    description: 'Multi-purpose agricultural barn',
    propertyTypeId: 'agricultural',
    msSection: 'Section 17',
    msPage: 'P 11',
    defaultEconomicLife: 40,
    applicableClasses: ['D', 'S'],
    qualityGrades: ['low', 'fair', 'average', 'good'],
  },
  {
    id: 'barn-dairy',
    label: 'Dairy Barn',
    description: 'Dairy cattle housing',
    propertyTypeId: 'agricultural',
    msSection: 'Section 17',
    msPage: 'P 15',
    defaultEconomicLife: 35,
    applicableClasses: ['D', 'S'],
    qualityGrades: ['fair', 'average', 'good'],
  },
  {
    id: 'barn-horse',
    label: 'Horse Barn',
    description: 'Equine facility',
    propertyTypeId: 'agricultural',
    msSection: 'Section 17',
    msPage: 'P 18',
    defaultEconomicLife: 40,
    applicableClasses: ['D', 'S'],
    qualityGrades: ['fair', 'average', 'good', 'excellent'],
  },
  {
    id: 'pole-barn',
    label: 'Pole Barn / Equipment Shed',
    description: 'Open or enclosed pole building',
    propertyTypeId: 'agricultural',
    msSection: 'Section 17',
    msPage: 'P 20',
    defaultEconomicLife: 35,
    applicableClasses: ['D', 'S'],
    qualityGrades: ['low', 'fair', 'average'],
  },
  {
    id: 'loafing-shed',
    label: 'Loafing Shed',
    description: 'Open livestock shelter',
    propertyTypeId: 'agricultural',
    msSection: 'Section 17',
    msPage: 'P 22',
    defaultEconomicLife: 25,
    applicableClasses: ['D', 'S'],
    qualityGrades: ['low', 'fair', 'average'],
  },
  {
    id: 'poultry-broiler',
    label: 'Poultry House - Broiler',
    description: 'Broiler chicken production',
    propertyTypeId: 'agricultural',
    msSection: 'Section 17',
    msPage: 'P 25',
    defaultEconomicLife: 25,
    applicableClasses: ['D', 'S'],
    qualityGrades: ['fair', 'average', 'good'],
  },
  {
    id: 'poultry-layer',
    label: 'Poultry House - Layer',
    description: 'Egg production facility',
    propertyTypeId: 'agricultural',
    msSection: 'Section 17',
    msPage: 'P 27',
    defaultEconomicLife: 25,
    applicableClasses: ['D', 'S'],
    qualityGrades: ['fair', 'average', 'good'],
  },
  {
    id: 'greenhouse-glass',
    label: 'Greenhouse - Glass',
    description: 'Commercial glass greenhouse',
    propertyTypeId: 'agricultural',
    msSection: 'Section 17',
    msPage: 'P 30',
    defaultEconomicLife: 30,
    applicableClasses: ['S'],
    qualityGrades: ['fair', 'average', 'good', 'excellent'],
  },
  {
    id: 'greenhouse-poly',
    label: 'Greenhouse - Poly/Film',
    description: 'Polyethylene greenhouse',
    propertyTypeId: 'agricultural',
    msSection: 'Section 17',
    msPage: 'P 32',
    defaultEconomicLife: 15,
    applicableClasses: ['S'],
    qualityGrades: ['low', 'fair', 'average'],
  },
  {
    id: 'silo',
    label: 'Silo',
    description: 'Grain/silage storage silo',
    propertyTypeId: 'agricultural',
    msSection: 'Section 17',
    msPage: 'P 35',
    defaultEconomicLife: 35,
    applicableClasses: ['B', 'S'],
    qualityGrades: ['fair', 'average', 'good'],
  },
  {
    id: 'grain-bin',
    label: 'Grain Bin',
    description: 'Metal grain storage bin',
    propertyTypeId: 'agricultural',
    msSection: 'Section 17',
    msPage: 'P 38',
    defaultEconomicLife: 30,
    applicableClasses: ['S'],
    qualityGrades: ['fair', 'average', 'good'],
  },

  // =================================================================
  // LAND OCCUPANCY CODES
  // =================================================================
  {
    id: 'vacant-unimproved',
    label: 'Vacant - Unimproved',
    description: 'Raw land, no improvements',
    propertyTypeId: 'vacant-land',
    msSection: 'N/A',
    defaultEconomicLife: 0,
    applicableClasses: [],
    qualityGrades: [],
  },
  {
    id: 'vacant-graded',
    label: 'Vacant - Graded/Cleared',
    description: 'Cleared and graded land',
    propertyTypeId: 'development-site',
    msSection: 'Section 66',
    defaultEconomicLife: 0,
    applicableClasses: [],
    qualityGrades: [],
  },
  {
    id: 'development-entitled',
    label: 'Development Site - Entitled',
    description: 'Approved for development',
    propertyTypeId: 'development-site',
    msSection: 'Section 66',
    defaultEconomicLife: 0,
    applicableClasses: [],
    qualityGrades: [],
  },
];

// =================================================================
// SITE IMPROVEMENT TYPES (Section 66)
// =================================================================

export type SiteImprovementCategory = 
  | 'paving'
  | 'fencing'
  | 'lighting'
  | 'recreation'
  | 'utilities'
  | 'signage'
  | 'landscaping'
  | 'structures'
  | 'agricultural';

export interface SiteImprovementType {
  id: string;
  label: string;
  category: SiteImprovementCategory;
  defaultUnit: 'SF' | 'LF' | 'EA' | 'LS';
  defaultEconomicLife: number;
  applicablePropertyCategories: PropertyCategory[];
  msReference?: string;
}

export const SITE_IMPROVEMENT_TYPES: SiteImprovementType[] = [
  // =================================================================
  // PAVING & SURFACING
  // =================================================================
  {
    id: 'asphalt-paving',
    label: 'Asphalt Paving',
    category: 'paving',
    defaultUnit: 'SF',
    defaultEconomicLife: 20,
    applicablePropertyCategories: ['residential', 'commercial'],
    msReference: 'Section 66 P 11',
  },
  {
    id: 'concrete-paving',
    label: 'Concrete Paving',
    category: 'paving',
    defaultUnit: 'SF',
    defaultEconomicLife: 30,
    applicablePropertyCategories: ['residential', 'commercial'],
    msReference: 'Section 66 P 12',
  },
  {
    id: 'gravel-surface',
    label: 'Gravel / Crushed Rock',
    category: 'paving',
    defaultUnit: 'SF',
    defaultEconomicLife: 10,
    applicablePropertyCategories: ['residential', 'commercial', 'land'],
    msReference: 'Section 66 P 13',
  },
  {
    id: 'heavy-duty-paving',
    label: 'Heavy-Duty Paving',
    category: 'paving',
    defaultUnit: 'SF',
    defaultEconomicLife: 25,
    applicablePropertyCategories: ['commercial'],
    msReference: 'Section 66 P 14',
  },
  {
    id: 'sidewalk',
    label: 'Sidewalk',
    category: 'paving',
    defaultUnit: 'SF',
    defaultEconomicLife: 30,
    applicablePropertyCategories: ['residential', 'commercial'],
    msReference: 'Section 66 P 15',
  },
  {
    id: 'curbing',
    label: 'Curbing',
    category: 'paving',
    defaultUnit: 'LF',
    defaultEconomicLife: 30,
    applicablePropertyCategories: ['commercial'],
    msReference: 'Section 66 P 16',
  },
  {
    id: 'striping',
    label: 'Parking Lot Striping',
    category: 'paving',
    defaultUnit: 'LS',
    defaultEconomicLife: 5,
    applicablePropertyCategories: ['commercial'],
    msReference: 'Section 66 P 17',
  },

  // =================================================================
  // FENCING & WALLS
  // =================================================================
  {
    id: 'chain-link-fence',
    label: 'Chain Link Fence',
    category: 'fencing',
    defaultUnit: 'LF',
    defaultEconomicLife: 25,
    applicablePropertyCategories: ['residential', 'commercial'],
    msReference: 'Section 66 P 20',
  },
  {
    id: 'wood-fence',
    label: 'Wood Fence',
    category: 'fencing',
    defaultUnit: 'LF',
    defaultEconomicLife: 15,
    applicablePropertyCategories: ['residential', 'commercial'],
    msReference: 'Section 66 P 21',
  },
  {
    id: 'vinyl-fence',
    label: 'Vinyl Fence',
    category: 'fencing',
    defaultUnit: 'LF',
    defaultEconomicLife: 25,
    applicablePropertyCategories: ['residential'],
    msReference: 'Section 66 P 22',
  },
  {
    id: 'ornamental-fence',
    label: 'Ornamental Metal Fence',
    category: 'fencing',
    defaultUnit: 'LF',
    defaultEconomicLife: 30,
    applicablePropertyCategories: ['residential', 'commercial'],
    msReference: 'Section 66 P 23',
  },
  {
    id: 'security-fence',
    label: 'Security Fence (w/Barbed Wire)',
    category: 'fencing',
    defaultUnit: 'LF',
    defaultEconomicLife: 25,
    applicablePropertyCategories: ['commercial'],
    msReference: 'Section 66 P 24',
  },
  {
    id: 'masonry-wall',
    label: 'Masonry / Retaining Wall',
    category: 'fencing',
    defaultUnit: 'LF',
    defaultEconomicLife: 40,
    applicablePropertyCategories: ['residential', 'commercial'],
    msReference: 'Section 66 P 25',
  },
  {
    id: 'gate-manual',
    label: 'Gate - Manual',
    category: 'fencing',
    defaultUnit: 'EA',
    defaultEconomicLife: 20,
    applicablePropertyCategories: ['residential', 'commercial'],
    msReference: 'Section 66 P 26',
  },
  {
    id: 'gate-electric',
    label: 'Gate - Electric/Automatic',
    category: 'fencing',
    defaultUnit: 'EA',
    defaultEconomicLife: 15,
    applicablePropertyCategories: ['commercial'],
    msReference: 'Section 66 P 27',
  },
  {
    id: 'agricultural-fence',
    label: 'Agricultural Fence (Barbed Wire)',
    category: 'fencing',
    defaultUnit: 'LF',
    defaultEconomicLife: 20,
    applicablePropertyCategories: ['commercial'],
    msReference: 'Section 66 P 28',
  },
  {
    id: 'cross-fence',
    label: 'Cross Fence / Interior Fence',
    category: 'fencing',
    defaultUnit: 'LF',
    defaultEconomicLife: 15,
    applicablePropertyCategories: ['commercial'],
    msReference: 'Section 66 P 29',
  },

  // =================================================================
  // LIGHTING
  // =================================================================
  {
    id: 'pole-light',
    label: 'Pole Light',
    category: 'lighting',
    defaultUnit: 'EA',
    defaultEconomicLife: 20,
    applicablePropertyCategories: ['commercial'],
    msReference: 'Section 66 P 30',
  },
  {
    id: 'high-mast-light',
    label: 'High-Mast Lighting',
    category: 'lighting',
    defaultUnit: 'EA',
    defaultEconomicLife: 25,
    applicablePropertyCategories: ['commercial'],
    msReference: 'Section 66 P 31',
  },
  {
    id: 'bollard-light',
    label: 'Bollard Light',
    category: 'lighting',
    defaultUnit: 'EA',
    defaultEconomicLife: 15,
    applicablePropertyCategories: ['residential', 'commercial'],
    msReference: 'Section 66 P 32',
  },
  {
    id: 'landscape-lighting',
    label: 'Landscape Lighting',
    category: 'lighting',
    defaultUnit: 'LS',
    defaultEconomicLife: 15,
    applicablePropertyCategories: ['residential', 'commercial'],
    msReference: 'Section 66 P 33',
  },

  // =================================================================
  // RECREATION
  // =================================================================
  {
    id: 'pool-inground',
    label: 'Swimming Pool - In-ground',
    category: 'recreation',
    defaultUnit: 'EA',
    defaultEconomicLife: 25,
    applicablePropertyCategories: ['residential', 'commercial'],
    msReference: 'Section 66 P 40',
  },
  {
    id: 'pool-aboveground',
    label: 'Swimming Pool - Above-ground',
    category: 'recreation',
    defaultUnit: 'EA',
    defaultEconomicLife: 10,
    applicablePropertyCategories: ['residential'],
    msReference: 'Section 66 P 41',
  },
  {
    id: 'spa-hot-tub',
    label: 'Spa / Hot Tub',
    category: 'recreation',
    defaultUnit: 'EA',
    defaultEconomicLife: 15,
    applicablePropertyCategories: ['residential', 'commercial'],
    msReference: 'Section 66 P 42',
  },
  {
    id: 'tennis-court',
    label: 'Tennis Court',
    category: 'recreation',
    defaultUnit: 'EA',
    defaultEconomicLife: 20,
    applicablePropertyCategories: ['residential', 'commercial'],
    msReference: 'Section 66 P 45',
  },
  {
    id: 'basketball-court',
    label: 'Basketball Court',
    category: 'recreation',
    defaultUnit: 'EA',
    defaultEconomicLife: 20,
    applicablePropertyCategories: ['residential', 'commercial'],
    msReference: 'Section 66 P 46',
  },
  {
    id: 'playground',
    label: 'Playground Equipment',
    category: 'recreation',
    defaultUnit: 'LS',
    defaultEconomicLife: 15,
    applicablePropertyCategories: ['residential', 'commercial'],
    msReference: 'Section 66 P 47',
  },

  // =================================================================
  // UTILITIES
  // =================================================================
  {
    id: 'septic-system',
    label: 'Septic System',
    category: 'utilities',
    defaultUnit: 'EA',
    defaultEconomicLife: 30,
    applicablePropertyCategories: ['residential', 'commercial'],
    msReference: 'Section 66 P 50',
  },
  {
    id: 'water-well',
    label: 'Water Well',
    category: 'utilities',
    defaultUnit: 'EA',
    defaultEconomicLife: 30,
    applicablePropertyCategories: ['residential', 'commercial'],
    msReference: 'Section 66 P 51',
  },
  {
    id: 'water-tank',
    label: 'Water Tank / Storage',
    category: 'utilities',
    defaultUnit: 'EA',
    defaultEconomicLife: 25,
    applicablePropertyCategories: ['commercial'],
    msReference: 'Section 66 P 52',
  },
  {
    id: 'irrigation-system',
    label: 'Irrigation System',
    category: 'utilities',
    defaultUnit: 'LS',
    defaultEconomicLife: 20,
    applicablePropertyCategories: ['residential', 'commercial'],
    msReference: 'Section 66 P 53',
  },
  {
    id: 'irrigation-pivot',
    label: 'Center Pivot Irrigation',
    category: 'utilities',
    defaultUnit: 'EA',
    defaultEconomicLife: 25,
    applicablePropertyCategories: ['commercial'],
    msReference: 'Section 66 P 54',
  },
  {
    id: 'fuel-storage',
    label: 'Fuel Storage Tank',
    category: 'utilities',
    defaultUnit: 'EA',
    defaultEconomicLife: 25,
    applicablePropertyCategories: ['commercial'],
    msReference: 'Section 66 P 55',
  },
  {
    id: 'truck-scale',
    label: 'Truck Scale',
    category: 'utilities',
    defaultUnit: 'EA',
    defaultEconomicLife: 25,
    applicablePropertyCategories: ['commercial'],
    msReference: 'Section 66 P 56',
  },
  {
    id: 'detention-pond',
    label: 'Detention / Retention Pond',
    category: 'utilities',
    defaultUnit: 'LS',
    defaultEconomicLife: 40,
    applicablePropertyCategories: ['commercial'],
    msReference: 'Section 66 P 57',
  },

  // =================================================================
  // SIGNAGE
  // =================================================================
  {
    id: 'pylon-sign',
    label: 'Pylon Sign',
    category: 'signage',
    defaultUnit: 'EA',
    defaultEconomicLife: 15,
    applicablePropertyCategories: ['commercial'],
    msReference: 'Section 66 P 60',
  },
  {
    id: 'monument-sign',
    label: 'Monument Sign',
    category: 'signage',
    defaultUnit: 'EA',
    defaultEconomicLife: 20,
    applicablePropertyCategories: ['commercial'],
    msReference: 'Section 66 P 61',
  },
  {
    id: 'building-sign',
    label: 'Building-Mounted Sign',
    category: 'signage',
    defaultUnit: 'EA',
    defaultEconomicLife: 15,
    applicablePropertyCategories: ['commercial'],
    msReference: 'Section 66 P 62',
  },

  // =================================================================
  // LANDSCAPING
  // =================================================================
  {
    id: 'landscaping-basic',
    label: 'Basic Landscaping',
    category: 'landscaping',
    defaultUnit: 'SF',
    defaultEconomicLife: 15,
    applicablePropertyCategories: ['residential', 'commercial'],
    msReference: 'Section 66 P 65',
  },
  {
    id: 'landscaping-professional',
    label: 'Professional Landscaping',
    category: 'landscaping',
    defaultUnit: 'SF',
    defaultEconomicLife: 20,
    applicablePropertyCategories: ['residential', 'commercial'],
    msReference: 'Section 66 P 66',
  },
  {
    id: 'windbreak',
    label: 'Windbreak / Shelterbelt',
    category: 'landscaping',
    defaultUnit: 'LF',
    defaultEconomicLife: 30,
    applicablePropertyCategories: ['commercial'],
    msReference: 'Section 66 P 67',
  },

  // =================================================================
  // STRUCTURES
  // =================================================================
  {
    id: 'detached-garage',
    label: 'Detached Garage',
    category: 'structures',
    defaultUnit: 'SF',
    defaultEconomicLife: 40,
    applicablePropertyCategories: ['residential'],
    msReference: 'Section 66 P 70',
  },
  {
    id: 'carport',
    label: 'Carport',
    category: 'structures',
    defaultUnit: 'SF',
    defaultEconomicLife: 25,
    applicablePropertyCategories: ['residential', 'commercial'],
    msReference: 'Section 66 P 71',
  },
  {
    id: 'storage-shed',
    label: 'Storage Shed',
    category: 'structures',
    defaultUnit: 'SF',
    defaultEconomicLife: 25,
    applicablePropertyCategories: ['residential'],
    msReference: 'Section 66 P 72',
  },
  {
    id: 'gazebo',
    label: 'Gazebo',
    category: 'structures',
    defaultUnit: 'EA',
    defaultEconomicLife: 25,
    applicablePropertyCategories: ['residential', 'commercial'],
    msReference: 'Section 66 P 73',
  },
  {
    id: 'deck',
    label: 'Deck',
    category: 'structures',
    defaultUnit: 'SF',
    defaultEconomicLife: 20,
    applicablePropertyCategories: ['residential'],
    msReference: 'Section 66 P 74',
  },
  {
    id: 'patio',
    label: 'Patio',
    category: 'structures',
    defaultUnit: 'SF',
    defaultEconomicLife: 25,
    applicablePropertyCategories: ['residential', 'commercial'],
    msReference: 'Section 66 P 75',
  },
  {
    id: 'trash-enclosure',
    label: 'Trash Enclosure',
    category: 'structures',
    defaultUnit: 'EA',
    defaultEconomicLife: 20,
    applicablePropertyCategories: ['commercial'],
    msReference: 'Section 66 P 76',
  },
  {
    id: 'guard-booth',
    label: 'Guard Booth',
    category: 'structures',
    defaultUnit: 'EA',
    defaultEconomicLife: 25,
    applicablePropertyCategories: ['commercial'],
    msReference: 'Section 66 P 77',
  },

  // =================================================================
  // AGRICULTURAL
  // =================================================================
  {
    id: 'corral',
    label: 'Corral / Pen',
    category: 'agricultural',
    defaultUnit: 'SF',
    defaultEconomicLife: 20,
    applicablePropertyCategories: ['commercial'],
    msReference: 'Section 66 P 80',
  },
  {
    id: 'feed-bunk',
    label: 'Feed Bunk',
    category: 'agricultural',
    defaultUnit: 'LF',
    defaultEconomicLife: 20,
    applicablePropertyCategories: ['commercial'],
    msReference: 'Section 66 P 81',
  },
  {
    id: 'water-trough',
    label: 'Water Trough',
    category: 'agricultural',
    defaultUnit: 'EA',
    defaultEconomicLife: 20,
    applicablePropertyCategories: ['commercial'],
    msReference: 'Section 66 P 82',
  },
  {
    id: 'livestock-scale',
    label: 'Livestock Scale',
    category: 'agricultural',
    defaultUnit: 'EA',
    defaultEconomicLife: 25,
    applicablePropertyCategories: ['commercial'],
    msReference: 'Section 66 P 83',
  },
];

// =================================================================
// HELPER FUNCTIONS
// =================================================================

/**
 * Get property types for a given category
 */
export function getPropertyTypesByCategory(category: PropertyCategory): PropertyType[] {
  return PROPERTY_TYPES.filter(pt => pt.category === category);
}

/**
 * Get occupancy codes for a given property type
 */
export function getOccupancyCodesByPropertyType(propertyTypeId: string): OccupancyCode[] {
  return OCCUPANCY_CODES.filter(oc => oc.propertyTypeId === propertyTypeId);
}

/**
 * Get site improvement types for a given property category
 */
export function getSiteImprovementsByCategory(category: PropertyCategory): SiteImprovementType[] {
  return SITE_IMPROVEMENT_TYPES.filter(si => 
    si.applicablePropertyCategories.includes(category)
  );
}

/**
 * Get a property category config by ID
 */
export function getPropertyCategory(id: PropertyCategory): PropertyCategoryConfig | undefined {
  return PROPERTY_CATEGORIES.find(c => c.id === id);
}

/**
 * Get a property type by ID
 */
export function getPropertyType(id: string): PropertyType | undefined {
  return PROPERTY_TYPES.find(pt => pt.id === id);
}

/**
 * Get an occupancy code by ID
 */
export function getOccupancyCode(id: string): OccupancyCode | undefined {
  return OCCUPANCY_CODES.find(oc => oc.id === id);
}

/**
 * Get a site improvement type by ID
 */
export function getSiteImprovementType(id: string): SiteImprovementType | undefined {
  return SITE_IMPROVEMENT_TYPES.find(si => si.id === id);
}

/**
 * Get economic life for a site improvement
 */
export function getSiteImprovementEconomicLife(typeId: string): number {
  const type = getSiteImprovementType(typeId);
  return type?.defaultEconomicLife ?? 20;
}

/**
 * Get the full hierarchy path for display
 */
export function getPropertyHierarchyLabel(
  categoryId: PropertyCategory,
  propertyTypeId: string,
  occupancyCodeId?: string
): string {
  const category = getPropertyCategory(categoryId);
  const propertyType = getPropertyType(propertyTypeId);
  const occupancyCode = occupancyCodeId ? getOccupancyCode(occupancyCodeId) : undefined;

  const parts = [category?.label, propertyType?.label, occupancyCode?.label].filter(Boolean);
  return parts.join(' > ');
}

// =================================================================
// SITE IMPROVEMENT CATEGORY HELPERS
// =================================================================

/**
 * Site improvement category configuration for UI display
 */
export interface SiteImprovementCategoryConfig {
  id: SiteImprovementCategory;
  label: string;
  icon?: string;
}

/**
 * List of site improvement categories for button rendering
 */
export const SITE_IMPROVEMENT_CATEGORIES: SiteImprovementCategoryConfig[] = [
  { id: 'paving', label: 'Paving' },
  { id: 'fencing', label: 'Fencing' },
  { id: 'lighting', label: 'Lighting' },
  { id: 'landscaping', label: 'Landscape' },
  { id: 'structures', label: 'Structures' },
  { id: 'utilities', label: 'Utilities' },
  { id: 'signage', label: 'Signs' },
  { id: 'recreation', label: 'Recreation' },
  { id: 'agricultural', label: 'Agricultural' },
];

/**
 * Get site improvement types by their category (paving, fencing, etc.)
 */
export function getSiteImprovementTypesByCategory(category: SiteImprovementCategory): SiteImprovementType[] {
  return SITE_IMPROVEMENT_TYPES.filter(si => si.category === category);
}

/**
 * Get all unique site improvement categories that have types
 */
export function getAvailableSiteImprovementCategories(): SiteImprovementCategory[] {
  const categories = new Set<SiteImprovementCategory>();
  SITE_IMPROVEMENT_TYPES.forEach(si => categories.add(si.category));
  return Array.from(categories);
}

/**
 * Get a site improvement category config by ID
 */
export function getSiteImprovementCategoryConfig(id: SiteImprovementCategory): SiteImprovementCategoryConfig | undefined {
  return SITE_IMPROVEMENT_CATEGORIES.find(c => c.id === id);
}

