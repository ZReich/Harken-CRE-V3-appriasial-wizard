/**
 * Building Permits API Wrapper
 * 
 * Provides access to building permit data from various sources:
 * - County permit databases (varies by jurisdiction)
 * - State-level permit aggregators where available
 * 
 * Currently uses mock data with structure for future county integrations.
 * 
 * 100% portable - can be copied directly to Harken backend.
 */

// =================================================================
// TYPES
// =================================================================

export interface BuildingPermitEntry {
  id: string;
  permitNumber: string;
  permitType: 'new_construction' | 'addition' | 'alteration' | 'repair' | 'demolition' | 'mechanical' | 'electrical' | 'plumbing' | 'other';
  description: string;
  issuedDate: string;
  completedDate?: string;
  expirationDate?: string;
  status: 'issued' | 'active' | 'completed' | 'expired' | 'cancelled' | 'pending';
  estimatedValue?: number;
  actualValue?: number;
  contractor?: string;
  contractorLicense?: string;
  inspectionsPassed?: number;
  inspectionsRequired?: number;
  address?: string;
  parcelId?: string;
  source: 'county' | 'state' | 'cotality' | 'mock';
}

export interface PermitQueryResult {
  success: boolean;
  data: BuildingPermitEntry[];
  source: string;
  county?: string;
  error?: string;
}

// =================================================================
// MONTANA COUNTY PERMIT SOURCES
// =================================================================

// Montana counties with known online permit systems
// This can be expanded as more counties come online
const MONTANA_PERMIT_SOURCES: Record<string, string | null> = {
  'missoula': 'https://www.missoulacounty.us/government/community-development/building-permitting', // No API, web only
  'gallatin': null, // No public API
  'yellowstone': null, // No public API
  'flathead': null, // No public API
  'cascade': null, // No public API
  'lewis and clark': null, // No public API
  // Add more counties as APIs become available
};

// =================================================================
// QUERY FUNCTIONS
// =================================================================

/**
 * Query building permits for a property
 * Currently returns mock data - county API integrations pending
 */
export async function queryBuildingPermits(
  address: string,
  city: string,
  state: string,
  county?: string,
  parcelId?: string
): Promise<PermitQueryResult> {
  try {
    console.log('[Permits] Querying permits for:', { address, city, state, county, parcelId });
    
    // For now, return mock data
    // In production, this would:
    // 1. Determine the county
    // 2. Check if county has an API
    // 3. Query county-specific API
    // 4. Fall back to Cotality permit data if available
    
    const mockPermits = generateMockPermits(address, city, state, county);
    
    return {
      success: true,
      data: mockPermits,
      source: 'mock',
      county: county || city,
      error: mockPermits.length === 0 ? 'No permit history found for this property' : undefined,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Permits] Query error:', message);
    return {
      success: false,
      data: [],
      source: 'mock',
      error: message,
    };
  }
}

/**
 * Query permits by parcel ID (more reliable than address)
 */
export async function queryPermitsByParcelId(
  parcelId: string,
  county: string,
  state: string
): Promise<PermitQueryResult> {
  // Same as address query for now - would use parcel-based lookup in production
  return queryBuildingPermits('', '', state, county, parcelId);
}

// =================================================================
// MOCK DATA GENERATION
// =================================================================

/**
 * Generate realistic mock permit data based on property characteristics
 */
function generateMockPermits(
  address: string,
  city: string,
  state: string,
  county?: string
): BuildingPermitEntry[] {
  // Generate deterministic data based on address hash
  const hash = Math.abs(hashString(address + city + state));
  const currentYear = new Date().getFullYear();
  
  const permits: BuildingPermitEntry[] = [];
  
  // Number of permits (0-5 based on hash)
  const permitCount = hash % 6;
  
  if (permitCount === 0) {
    return []; // No permit history
  }
  
  const permitTypes: BuildingPermitEntry['permitType'][] = [
    'new_construction', 'addition', 'alteration', 'repair', 
    'mechanical', 'electrical', 'plumbing'
  ];
  
  const contractors = [
    'ABC Construction LLC',
    'Mountain View Builders',
    'Big Sky Construction',
    'Pioneer Building Co.',
    'Summit Contractors Inc.',
  ];
  
  for (let i = 0; i < permitCount; i++) {
    const subHash = hash + i * 1000;
    const yearsAgo = (subHash % 10) + 1;
    const permitYear = currentYear - yearsAgo;
    const permitType = permitTypes[subHash % permitTypes.length];
    const isCompleted = yearsAgo > 1 || (subHash % 3 !== 0);
    
    permits.push({
      id: `permit-${subHash}`,
      permitNumber: `${county?.substring(0, 3).toUpperCase() || 'MTN'}-${permitYear}-${(subHash % 9999).toString().padStart(4, '0')}`,
      permitType,
      description: getPermitDescription(permitType, subHash),
      issuedDate: `${permitYear}-${((subHash % 12) + 1).toString().padStart(2, '0')}-${((subHash % 28) + 1).toString().padStart(2, '0')}`,
      completedDate: isCompleted 
        ? `${permitYear + (subHash % 2)}-${(((subHash + 3) % 12) + 1).toString().padStart(2, '0')}-${(((subHash + 7) % 28) + 1).toString().padStart(2, '0')}`
        : undefined,
      status: isCompleted ? 'completed' : 'active',
      estimatedValue: getPermitValue(permitType, subHash),
      actualValue: isCompleted ? getPermitValue(permitType, subHash) * (0.9 + (subHash % 30) / 100) : undefined,
      contractor: contractors[subHash % contractors.length],
      contractorLicense: `MT-${(10000 + subHash % 90000).toString()}`,
      inspectionsPassed: isCompleted ? 4 : Math.min(subHash % 4, 3),
      inspectionsRequired: 4,
      address: address || undefined,
      source: 'mock',
    });
  }
  
  // Sort by date descending (most recent first)
  return permits.sort((a, b) => 
    new Date(b.issuedDate).getTime() - new Date(a.issuedDate).getTime()
  );
}

/**
 * Get a description based on permit type
 */
function getPermitDescription(permitType: BuildingPermitEntry['permitType'], hash: number): string {
  const descriptions: Record<string, string[]> = {
    new_construction: [
      'New commercial building construction',
      'New warehouse/industrial facility',
      'New retail space construction',
      'New office building construction',
    ],
    addition: [
      'Building addition - 2,500 SF',
      'Warehouse expansion',
      'Office space addition',
      'Loading dock addition',
    ],
    alteration: [
      'Interior tenant improvements',
      'Building facade renovation',
      'ADA accessibility upgrades',
      'Interior reconfiguration',
    ],
    repair: [
      'Roof repair/replacement',
      'Foundation repair',
      'Structural repairs',
      'Fire damage restoration',
    ],
    mechanical: [
      'HVAC system replacement',
      'New RTU installation',
      'Ventilation system upgrade',
      'Cooling tower installation',
    ],
    electrical: [
      'Electrical service upgrade - 400A',
      'Panel replacement',
      'Lighting system upgrade',
      'Emergency generator installation',
    ],
    plumbing: [
      'Plumbing system renovation',
      'Fire sprinkler installation',
      'Bathroom addition',
      'Water heater replacement',
    ],
    demolition: [
      'Partial structure demolition',
      'Interior demolition for remodel',
      'Outbuilding removal',
    ],
    other: [
      'Sign permit',
      'Fire alarm system',
      'Grading permit',
    ],
  };
  
  const options = descriptions[permitType] || descriptions.other;
  return options[hash % options.length];
}

/**
 * Get estimated permit value based on type
 */
function getPermitValue(permitType: BuildingPermitEntry['permitType'], hash: number): number {
  const baseValues: Record<string, [number, number]> = {
    new_construction: [500000, 5000000],
    addition: [100000, 1000000],
    alteration: [25000, 500000],
    repair: [5000, 100000],
    mechanical: [15000, 150000],
    electrical: [5000, 75000],
    plumbing: [3000, 50000],
    demolition: [10000, 100000],
    other: [1000, 25000],
  };
  
  const [min, max] = baseValues[permitType] || baseValues.other;
  return Math.round(min + (hash % (max - min)));
}

/**
 * Simple string hash function
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
}
