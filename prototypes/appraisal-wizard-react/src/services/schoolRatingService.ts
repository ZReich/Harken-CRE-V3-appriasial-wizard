/**
 * School Rating Service
 * 
 * Provides school rating data from GreatSchools API.
 * Currently using mock data until API partnership is established.
 * 
 * 100% portable - works with Vercel API Routes or Harken backend.
 */

// Toggle when GreatSchools API becomes available
const USE_MOCK_DATA = true;

export interface SchoolRating {
  schoolId: string;
  name: string;
  type: 'elementary' | 'middle' | 'high' | 'combined';
  rating: number; // 1-10 scale
  distance: number; // miles from property
  enrollment?: number;
  gradeRange?: string;
}

export interface SchoolRatingsResponse {
  success: boolean;
  data: {
    schools: SchoolRating[];
    averageRating: number;
    districtRating: number | null;
    summary: string;
  } | null;
  source: 'greatschools' | 'mock';
  error?: string;
}

/**
 * Generate mock school data based on location
 */
function generateMockSchoolData(latitude: number, longitude: number): SchoolRating[] {
  // Deterministic generation based on coordinates
  const seed = Math.abs(Math.floor(latitude * 100 + longitude * 10));
  
  const schoolNames = {
    elementary: ['Lincoln', 'Washington', 'Roosevelt', 'Jefferson', 'Madison'],
    middle: ['Central', 'Riverside', 'Highland', 'Valley', 'Lakeside'],
    high: ['Main', 'North', 'South', 'East', 'West'],
  };
  
  const schools: SchoolRating[] = [];
  
  // Add 2-3 elementary schools
  const numElementary = 2 + (seed % 2);
  for (let i = 0; i < numElementary; i++) {
    schools.push({
      schoolId: `es-${seed}-${i}`,
      name: `${schoolNames.elementary[(seed + i) % 5]} Elementary School`,
      type: 'elementary',
      rating: 5 + (seed % 5),
      distance: 0.5 + (i * 0.3),
      enrollment: 300 + (seed % 200),
      gradeRange: 'K-5',
    });
  }
  
  // Add 1-2 middle schools
  const numMiddle = 1 + (seed % 2);
  for (let i = 0; i < numMiddle; i++) {
    schools.push({
      schoolId: `ms-${seed}-${i}`,
      name: `${schoolNames.middle[(seed + i) % 5]} Middle School`,
      type: 'middle',
      rating: 5 + ((seed + 1) % 5),
      distance: 1.0 + (i * 0.5),
      enrollment: 500 + (seed % 300),
      gradeRange: '6-8',
    });
  }
  
  // Add 1 high school
  schools.push({
    schoolId: `hs-${seed}-0`,
    name: `${schoolNames.high[(seed + 2) % 5]} High School`,
    type: 'high',
    rating: 5 + ((seed + 2) % 5),
    distance: 1.5 + (seed % 10) / 10,
    enrollment: 1000 + (seed % 500),
    gradeRange: '9-12',
  });
  
  return schools;
}

/**
 * Get school ratings for a location
 * 
 * @param latitude - Latitude coordinate
 * @param longitude - Longitude coordinate
 * @param radius - Search radius in miles (default: 3)
 */
export async function getSchoolRatings(
  latitude: number,
  longitude: number,
  radius: number = 3
): Promise<SchoolRatingsResponse> {
  if (USE_MOCK_DATA) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const schools = generateMockSchoolData(latitude, longitude)
      .filter(s => s.distance <= radius);
    
    const averageRating = schools.length > 0
      ? schools.reduce((sum, s) => sum + s.rating, 0) / schools.length
      : 0;
    
    const districtRating = Math.round(averageRating * 10) / 10;
    
    return {
      success: true,
      data: {
        schools,
        averageRating: Math.round(averageRating * 10) / 10,
        districtRating,
        summary: `The subject property is served by ${schools.length} schools within a ${radius}-mile radius, with an average rating of ${averageRating.toFixed(1)} out of 10.`,
      },
      source: 'mock',
    };
  }
  
  // TODO: Implement actual GreatSchools API call when available
  return {
    success: false,
    data: null,
    source: 'greatschools',
    error: 'GreatSchools API not yet configured',
  };
}

/**
 * Get school quality score for risk rating (0-100)
 */
export function getSchoolQualityScore(schools: SchoolRating[]): number {
  if (schools.length === 0) return 50; // Neutral if no data
  
  const avgRating = schools.reduce((sum, s) => sum + s.rating, 0) / schools.length;
  return avgRating * 10; // Convert 1-10 scale to 0-100
}

