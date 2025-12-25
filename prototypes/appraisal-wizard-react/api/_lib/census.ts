/**
 * Census API Wrapper
 * 
 * Provides access to US Census Bureau API for demographic data.
 * Uses American Community Survey (ACS) 5-Year estimates.
 * 
 * API Documentation: https://www.census.gov/data/developers/data-sets.html
 * 100% portable - can be copied directly to Harken backend.
 */

const CENSUS_BASE_URL = 'https://api.census.gov/data';
const ACS_YEAR = '2022';  // Most recent 5-year ACS

// =================================================================
// TYPES
// =================================================================

export interface CensusDemographics {
  population: number;
  medianAge: number;
  households: number;
  averageHouseholdSize: number;
  medianHouseholdIncome: number;
  perCapitaIncome: number;
  bachelorsDegree: number;
  mastersDegree: number;
  doctorateDegree: number;
  laborForce: number;
  unemployed: number;
}

export interface GeoCoordinates {
  latitude: number;
  longitude: number;
}

export interface FIPSCodes {
  state: string;
  county: string;
  tract?: string;
}

// =================================================================
// ACS VARIABLE DEFINITIONS
// =================================================================

export const ACS_VARIABLES = {
  TOTAL_POPULATION: 'B01001_001E',
  MEDIAN_AGE: 'B01002_001E',
  TOTAL_HOUSEHOLDS: 'B11001_001E',
  AVG_HOUSEHOLD_SIZE: 'B25010_001E',
  MEDIAN_HOUSEHOLD_INCOME: 'B19013_001E',
  PER_CAPITA_INCOME: 'B19301_001E',
  BACHELORS_DEGREE: 'B15003_022E',
  MASTERS_DEGREE: 'B15003_023E',
  DOCTORATE_DEGREE: 'B15003_025E',
  LABOR_FORCE: 'B23025_002E',
  UNEMPLOYED: 'B23025_005E',
  TOTAL_POPULATION_25_PLUS: 'B15003_001E',  // For education percentage calculation
} as const;

// =================================================================
// GEOCODING (Coordinates to FIPS)
// =================================================================

/**
 * Convert lat/lng coordinates to FIPS codes using Census Geocoder
 * 
 * @param coords - Latitude and longitude
 * @returns Promise resolving to FIPS codes (state, county, tract)
 */
export async function coordinatesToFIPS(coords: GeoCoordinates): Promise<FIPSCodes> {
  const url = new URL('https://geocoding.geo.census.gov/geocoder/geographies/coordinates');
  url.searchParams.set('x', coords.longitude.toString());
  url.searchParams.set('y', coords.latitude.toString());
  url.searchParams.set('benchmark', 'Public_AR_Current');
  url.searchParams.set('vintage', 'Current_Current');
  url.searchParams.set('format', 'json');

  const response = await fetch(url.toString());
  
  if (!response.ok) {
    throw new Error(`Census geocoder error: ${response.status}`);
  }

  const data = await response.json() as { 
    result?: { 
      geographies?: { 
        'Census Tracts'?: Array<{ STATE?: string; COUNTY?: string; TRACT?: string }>;
        'Counties'?: Array<{ STATE?: string; COUNTY?: string }>;
      } 
    } 
  };
  
  const geographies = data.result?.geographies;
  if (!geographies) {
    throw new Error('No geography data returned from Census geocoder');
  }

  // Get Census Tracts data
  const tract = geographies['Census Tracts']?.[0];
  const county = geographies['Counties']?.[0];

  if (!tract && !county) {
    throw new Error('Could not determine FIPS codes for location');
  }

  const stateFips = tract?.STATE || county?.STATE;
  const countyFips = tract?.COUNTY || county?.COUNTY;

  if (!stateFips || !countyFips) {
    throw new Error('Could not determine FIPS codes for location');
  }

  return {
    state: stateFips,
    county: countyFips,
    tract: tract?.TRACT,
  };
}

// =================================================================
// DEMOGRAPHICS DATA
// =================================================================

/**
 * Fetch demographics data for a county
 * 
 * @param fips - FIPS codes (state and county)
 * @returns Promise resolving to demographics data
 */
export async function getCountyDemographics(fips: FIPSCodes): Promise<CensusDemographics> {
  const variables = Object.values(ACS_VARIABLES).join(',');
  
  const url = `${CENSUS_BASE_URL}/${ACS_YEAR}/acs/acs5?get=${variables}&for=county:${fips.county}&in=state:${fips.state}`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Census API error: ${response.status}`);
  }

  const data = await response.json() as string[][];
  
  // Data comes as array: [header_row, data_row]
  if (!data || data.length < 2) {
    throw new Error('No data returned from Census API');
  }

  const headers: string[] = data[0];
  const values: string[] = data[1];

  // Create lookup from variable name to value
  const lookup: Record<string, number> = {};
  headers.forEach((header, i) => {
    lookup[header] = parseFloat(values[i]) || 0;
  });

  // Calculate education percentages
  const totalPopOver25 = lookup[ACS_VARIABLES.TOTAL_POPULATION_25_PLUS] || 1;
  
  return {
    population: lookup[ACS_VARIABLES.TOTAL_POPULATION],
    medianAge: lookup[ACS_VARIABLES.MEDIAN_AGE],
    households: lookup[ACS_VARIABLES.TOTAL_HOUSEHOLDS],
    averageHouseholdSize: lookup[ACS_VARIABLES.AVG_HOUSEHOLD_SIZE],
    medianHouseholdIncome: lookup[ACS_VARIABLES.MEDIAN_HOUSEHOLD_INCOME],
    perCapitaIncome: lookup[ACS_VARIABLES.PER_CAPITA_INCOME],
    bachelorsDegree: lookup[ACS_VARIABLES.BACHELORS_DEGREE],
    mastersDegree: lookup[ACS_VARIABLES.MASTERS_DEGREE],
    doctorateDegree: lookup[ACS_VARIABLES.DOCTORATE_DEGREE],
    laborForce: lookup[ACS_VARIABLES.LABOR_FORCE],
    unemployed: lookup[ACS_VARIABLES.UNEMPLOYED],
  };
}

/**
 * Fetch demographics by coordinates
 * 
 * @param coords - Latitude and longitude
 * @returns Promise resolving to demographics data
 */
export async function getDemographicsByCoordinates(
  coords: GeoCoordinates
): Promise<CensusDemographics> {
  const fips = await coordinatesToFIPS(coords);
  return getCountyDemographics(fips);
}

/**
 * Generate radius-based demographics data
 * 
 * Note: True radius-based queries require ESRI GeoEnrichment API.
 * This implementation uses county-level data as an approximation.
 * For production, integrate with ESRI or use Census tract-level aggregation.
 * 
 * @param coords - Latitude and longitude
 * @param radii - Array of radii in miles (default: [1, 3, 5])
 * @returns Promise resolving to array of radius demographics
 */
export async function getRadiusDemographics(
  coords: GeoCoordinates,
  radii: number[] = [1, 3, 5]
): Promise<Array<{
  radius: number;
  demographics: CensusDemographics;
  isApproximate: boolean;
}>> {
  // Get base county demographics
  const countyData = await getDemographicsByCoordinates(coords);
  
  // For now, we scale the data based on radius as an approximation
  // True radius-based data would require ESRI or tract-level aggregation
  return radii.map(radius => {
    // Scale factor: smaller radius = smaller population
    // This is a rough approximation
    const scaleFactor = radius === 1 ? 0.1 : radius === 3 ? 0.3 : 0.5;
    
    return {
      radius,
      demographics: {
        ...countyData,
        population: Math.round(countyData.population * scaleFactor),
        households: Math.round(countyData.households * scaleFactor),
        laborForce: Math.round(countyData.laborForce * scaleFactor),
        unemployed: Math.round(countyData.unemployed * scaleFactor),
        bachelorsDegree: Math.round(countyData.bachelorsDegree * scaleFactor),
        mastersDegree: Math.round(countyData.mastersDegree * scaleFactor),
        doctorateDegree: Math.round(countyData.doctorateDegree * scaleFactor),
        // These don't scale with radius
        medianAge: countyData.medianAge,
        averageHouseholdSize: countyData.averageHouseholdSize,
        medianHouseholdIncome: countyData.medianHouseholdIncome,
        perCapitaIncome: countyData.perCapitaIncome,
      },
      isApproximate: true,
    };
  });
}


