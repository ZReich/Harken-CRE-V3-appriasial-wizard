// =================================================================
// SAMPLE APPRAISAL DATA - Rove 6907 Entryway Drive
// =================================================================
// Source: Final Appraisal Report - 6907 Entryway Drive (1).pdf
// Property: Fusion Technologies Shop/Office
// =================================================================

export interface SamplePhoto {
  id: string;
  url: string;
  caption: string;
  category: 'cover' | 'exterior' | 'interior' | 'aerial' | 'site' | 'comparable';
}

export interface ComparableSale {
  id: string;
  name: string;
  address: string;
  salePrice: number;
  saleDate: string;
  buildingSize: number;
  pricePerSF: number;
  yearBuilt: number;
  photoUrl: string;
  adjustments: {
    location: number;
    size: number;
    quality: number;
    age: number;
    condition: number;
    total: number;
  };
  adjustedPricePerSF: number;
}

export const sampleAppraisalData = {
  // =================================================================
  // PROPERTY INFORMATION
  // =================================================================
  property: {
    name: 'Fusion Technologies Shop/Office',
    address: '6907 Entryway Drive',
    fullAddress: '6907 Entryway Drive, Billings, Montana 59106',
    city: 'Billings',
    county: 'Yellowstone County',
    state: 'Montana',
    zip: '59106',
    taxId: 'C16892',
    legalDescription: 'Lot 6, Block 5, Harnish Trade Center Subdivision, Second Filing, Yellowstone County, Montana',
    ownerOfRecord: 'Bauer Development LLC',
    propertyType: 'Light Industrial',
    propertySubtype: 'Shop with Office',
  },

  // =================================================================
  // ASSIGNMENT DETAILS
  // =================================================================
  assignment: {
    client: 'First Security Bank of Missoula, a Division of Glacier Bank',
    clientAddress: 'P.O. Box 4506, Missoula, Montana 59806',
    intendedUse: 'Loan underwriting, modification, or extension; classification or monitoring of a loan; disposition or monitoring of REO or loan collateral',
    interestValued: 'Fee Simple Estate',
    inspectionDate: 'July 28, 2023',
    effectiveDate: 'July 28, 2023',
    reportDate: 'July 31, 2023',
    appraiser: 'Brenda L. McNaney, AI-GRS',
    appraiserCompany: 'ROVE Valuations',
    appraiserAddress: '3312 Fourth Avenue North, Billings, Montana 59101',
    appraiserPhone: '(406) 855-0960',
    appraiserLicense: 'Montana Certified General Appraiser #16011',
  },

  // =================================================================
  // SITE CHARACTERISTICS
  // =================================================================
  site: {
    landArea: 1.534,
    landAreaUnit: 'acres',
    landAreaSF: 66832,
    shape: 'Rectangular',
    frontage: '225.79 feet along Entryway Drive',
    topography: 'Level and at street grade',
    zoning: 'I1',
    zoningDescription: 'Light Industrial, intended for warehouse, light industrial, and business uses',
    floodZone: 'Not in identified flood hazard area',
    utilities: ['Well', 'Septic', 'Electric', 'Natural Gas', 'Telephone'],
    access: 'Gravel approach from Entryway Drive - Good access',
    easements: 'No adverse easements',
  },

  // =================================================================
  // IMPROVEMENTS
  // =================================================================
  improvements: {
    yearBuilt: 2023,
    effectiveAge: 0,
    remainingLife: 40,
    grossBuildingArea: 10200,
    buildingType: 'Pre-engineered Steel',
    officeArea: 1750,
    shopArea: 8450,
    mezzanineArea: 1750,
    clearHeight: 20,
    overheadDoors: '(3) 17\'w x 14\'h',
    construction: 'Pre-engineered Steel',
    condition: 'New / Excellent',
    quality: 'Good+',
    stories: 1,
    siteCoverage: 15.3,
  },

  // =================================================================
  // CLIENT INFORMATION
  // =================================================================
  client: {
    name: 'First Security Bank of Missoula',
    address: 'P.O. Box 4506, Missoula, Montana 59806',
    contactName: 'Lending Department',
  },

  // =================================================================
  // VALUATION SUMMARY
  // =================================================================
  valuation: {
    landValue: 324135,
    costApproachValue: 1755000,
    salesComparisonValue: 1750000,
    incomeApproachValue: 1710000,
    asIsValue: 1750000,
    exposurePeriod: 'Less than 6 months',
    marketingTime: 'Less than 6 months',
    effectiveDate: '2023-07-28',
    inspectionDate: '2023-07-28',
    reportDate: '2023-07-31',
  },

  // =================================================================
  // RECONCILIATION
  // =================================================================
  reconciliation: {
    costApproachWeight: 20,
    salesComparisonWeight: 50,
    incomeApproachWeight: 30,
    narrative: `The three approaches to value produced the following indications: Cost Approach - $1,755,000; Sales Comparison Approach - $1,750,000; Income Approach - $1,710,000. The range of values is relatively tight (2.6% spread from low to high), indicating that all three approaches produced credible results and are supportive of each other.

Greatest weight is placed on the Sales Comparison Approach (50%) as buyers and sellers in the local Billings market typically rely on direct comparisons to similar properties when making purchase decisions. The comparable sales utilized in our analysis were verified transactions of similar light industrial properties that required only moderate adjustments. Market participants consistently cite sales comparison as their primary valuation methodology for this property type.

The Income Approach (30%) is given secondary consideration. While the subject is owner-occupied rather than leased, investors in this market would consider income potential as part of their purchase analysis. The capitalization rate applied was derived from market transactions and supported by investor surveys. The resulting value indication of $1,710,000 provides good support for the Sales Comparison conclusion.

The Cost Approach (20%) is given least weight, despite the subject being new construction with minimal depreciation. While the Cost Approach accurately reflects the replacement cost of the improvements, it does not directly capture market dynamics including investor preferences and market conditions. Nevertheless, the Cost Approach value of $1,755,000 provides an excellent check on the other approaches and demonstrates that the subject improvements represent a well-designed, efficiently constructed facility.

Based on the foregoing analysis and reconciliation, it is my opinion that the market value of the subject property, as of the effective date of appraisal, is $1,750,000.`,
  },

  // =================================================================
  // HIGHEST AND BEST USE
  // =================================================================
  hbu: {
    asVacant: {
      legallyPermissible: 'The site is zoned I1 – Light Industrial. Under this classification, permitted uses include warehouse, light industrial, and business uses related to wholesale activities.',
      physicallyPossible: 'The site contains 1.534 acres of level land with a rectangular configuration. All utilities are available. The site is suitable for light industrial development.',
      financiallyFeasible: 'Current market conditions indicate sustained demand for light industrial space in the Billings market. Development of a light industrial building would generate adequate return to justify development.',
      maximallyProductive: 'Development with a light industrial use would be the maximally productive use of the site as vacant.',
      conclusion: 'Development with light industrial improvements',
    },
    asImproved: {
      analysis: 'The existing improvements are consistent with the ideal improvement for the site given current market conditions and zoning. The improvements are new construction in excellent condition with substantial remaining economic life. Demolition and redevelopment is not economically justified.',
      conclusion: 'Continuation of current use as a light industrial building',
    },
  },

  // =================================================================
  // SALES COMPARISON
  // =================================================================
  salesComparison: {
    methodology: `The Sales Comparison Approach estimates value by comparing the subject to recent sales of similar properties. Adjustments are made for differences in property characteristics that affect value, including location, size, age, condition, quality, and other relevant factors.

For this analysis, we searched for sales of similar light industrial properties in the Billings market area over the past 24 months. We identified and analyzed four comparable sales that we determined to be most similar to the subject property in terms of physical and locational characteristics. The comparable sales include modern, pre-engineered steel construction shop/warehouse buildings with office space, similar to the subject.

Adjustments were applied using a paired sales analysis methodology where possible, supplemented by appraiser judgment based on market experience. Positive adjustments were applied when the comparable was inferior to the subject; negative adjustments were applied when the comparable was superior. The primary adjustment categories include property rights conveyed, financing terms, conditions of sale, market conditions (time), location, building size, quality of construction, age/effective age, and condition.

The unit of comparison utilized is price per square foot of gross building area. This is the most commonly used unit of comparison for light industrial properties in the Billings market and provides the most reliable basis for comparison.`,
  },

  // =================================================================
  // COMPARABLE SALES
  // =================================================================
  comparables: [
    {
      id: 'comp-1',
      name: 'Comparable 1',
      address: '6811 Entryway Drive',
      salePrice: 1150000,
      saleDate: 'Dec 2022',
      buildingSize: 7200,
      pricePerSF: 159.72,
      yearBuilt: 2022,
      photoUrl: 'https://images.unsplash.com/photo-1565610222536-ef125c59da2e?w=400',
      adjustments: {
        location: 0,
        size: 5,
        quality: 5,
        age: 0,
        condition: 0,
        total: 10,
      },
      adjustedPricePerSF: 175.69,
    },
    {
      id: 'comp-2',
      name: 'Comparable 2',
      address: '5445 Midland Road',
      salePrice: 2100000,
      saleDate: 'Feb 2023',
      buildingSize: 12000,
      pricePerSF: 175.00,
      yearBuilt: 2021,
      photoUrl: 'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=400',
      adjustments: {
        location: -5,
        size: -3,
        quality: 0,
        age: 2,
        condition: 0,
        total: -6,
      },
      adjustedPricePerSF: 164.50,
    },
    {
      id: 'comp-3',
      name: 'Comparable 3',
      address: '1925 Overland Ave',
      salePrice: 1425000,
      saleDate: 'Apr 2023',
      buildingSize: 8400,
      pricePerSF: 169.64,
      yearBuilt: 2020,
      photoUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400',
      adjustments: {
        location: 0,
        size: 3,
        quality: 0,
        age: 3,
        condition: 0,
        total: 6,
      },
      adjustedPricePerSF: 179.82,
    },
    {
      id: 'comp-4',
      name: 'Comparable 4',
      address: '6825 Trading Post Rd',
      salePrice: 1875000,
      saleDate: 'May 2023',
      buildingSize: 11200,
      pricePerSF: 167.41,
      yearBuilt: 2022,
      photoUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400',
      adjustments: {
        location: 0,
        size: -2,
        quality: 3,
        age: 1,
        condition: 0,
        total: 2,
      },
      adjustedPricePerSF: 170.76,
    },
  ] as ComparableSale[],

  // =================================================================
  // AREA ANALYSIS (Enhanced Narrative)
  // =================================================================
  areaAnalysis: {
    regional: `The subject property is located in Billings, Montana, the largest city in Montana and the principal trade center for a large region encompassing eastern Montana, northern Wyoming, and western portions of North and South Dakota. Billings serves as the commercial, medical, and cultural hub for this region, commonly referred to as the "Midland Empire" or "Magic City" trade area.

Billings is situated along the Yellowstone River in south-central Montana at the intersection of Interstate 90 and Interstate 94. The city's strategic location at the crossroads of these major transportation corridors has made it a natural distribution and logistics center for the region. The Billings Logan International Airport provides commercial air service with connections to major hub cities including Denver, Salt Lake City, Minneapolis, and Seattle.

The Billings Metropolitan Statistical Area (MSA) has a population of approximately 184,000, representing the largest MSA in Montana. The regional economy is diverse, with major sectors including healthcare, energy, agriculture, retail trade, and transportation/logistics. The presence of two major hospital systems (Billings Clinic and St. Vincent Healthcare) has established the city as a regional medical destination.

The energy sector, including oil and gas extraction, refining, and related services, has historically been a significant economic driver. The Billings refineries represent one of the largest concentrations of petroleum refining capacity in the Rocky Mountain region. Agricultural production, including cattle ranching and grain farming, remains important to the regional economy. Recent economic development initiatives have focused on diversifying the economy and attracting technology and advanced manufacturing enterprises.`,
    
    neighborhood: `The subject property is located in the Harnish Trade Center Subdivision, an established light industrial area in the West End of Billings. This area is characterized by a mix of light industrial, warehouse, and commercial properties developed primarily over the past 20 years. The neighborhood is bounded generally by Interstate 90 to the north, Shiloh Road to the east, King Avenue West to the south, and 54th Street West to the west.

The Harnish Trade Center area has emerged as one of Billings' premier light industrial locations, benefiting from excellent transportation access, modern infrastructure, and proximity to major commercial corridors. Notable properties and businesses in the immediate vicinity include Bridger Steel (regional steel distributor), Western Ranch Supply (agricultural equipment), FedEx Freight terminal, Tractor and Equipment Company, and numerous smaller industrial and service businesses.

The neighborhood has experienced significant development activity over the past decade, with approximately 300,000 square feet of new industrial construction completed since 2018. The area has attracted users seeking modern, functional industrial space with good highway visibility and access. Land values in the neighborhood have appreciated at approximately 8-12% annually over the past three years, reflecting sustained demand.

Access to the neighborhood is excellent via Entryway Drive, which connects to King Avenue West and provides direct access to I-90 and the greater Billings area. The immediate area is characterized by well-maintained properties, paved streets, and adequate infrastructure for industrial uses. No adverse external influences were observed that would negatively impact the subject property.`,
    
    marketConditions: `The Billings industrial market has demonstrated resilience and growth over the past several years. According to local market data, the industrial vacancy rate in the Billings market is approximately 4.8%, which is below the long-term historical average of 6-7%. This low vacancy rate indicates a healthy market with sustained demand for quality industrial space.

Absorption of industrial space has been positive, with net absorption of approximately 125,000 square feet over the trailing twelve months. New construction activity has been moderate, with most new development occurring on a build-to-suit basis or with significant pre-leasing. Speculative development has been limited, helping to maintain the supply-demand balance.

Market rental rates for industrial space vary based on age, quality, and location. For modern, high-quality light industrial space comparable to the subject, rental rates range from $10.00 to $14.00 per square foot on a gross or modified gross lease basis. NNN lease rates for similar properties range from $7.50 to $10.00 per square foot, with tenants responsible for property taxes, insurance, and maintenance.

Investment activity in the Billings industrial market has been steady. Capitalization rates for stabilized industrial properties have ranged from 6.00% to 7.50%, depending on tenant quality, lease term, and property condition. Investor demand has remained strong, supported by the relatively attractive yields compared to gateway markets and the stable regional economy. Market participants expect continued moderate growth in both rental rates and values over the near term.`,
  },

  // =================================================================
  // SITE DESCRIPTION (Enhanced Narrative)
  // =================================================================
  siteDescription: {
    narrative: `The subject site is located on the south side of Entryway Drive, approximately 0.25 miles east of its intersection with King Avenue West, in the Harnish Trade Center Subdivision of Billings, Montana. The site contains 1.534 acres (66,832 square feet) of level land with a generally rectangular configuration.

The site has excellent visibility and access from Entryway Drive, with approximately 225.79 feet of frontage. A paved approach provides ingress and egress for vehicles, with adequate turning radius for truck traffic. The site topography is level and at grade with the surrounding roadway, presenting no significant constraints to development or site utilization.

Utilities available to the site include private well water, private septic system, electricity, natural gas, and telecommunications. The private well and septic system are common for properties in this area of Billings and are adequate for the current and anticipated uses. No utility deficiencies were observed.

According to FEMA Flood Insurance Rate Map (FIRM) panel 30111C2175E, dated November 16, 2016, the subject site is located in Flood Zone X, an area determined to be outside the 0.2% annual chance (500-year) floodplain. No special flood hazard insurance is required.

The subject site is improved with paving, exterior lighting, and perimeter fencing. The secured yard area provides outdoor storage and staging capability. Landscaping is minimal, consistent with the industrial character of the area. Overall, the site is well-suited for its current light industrial use and presents no significant adverse characteristics.`,
  },

  // =================================================================
  // INCOME APPROACH
  // =================================================================
  incomeApproach: {
    methodology: `The Income Approach estimates value by capitalizing the anticipated net operating income at an appropriate rate that reflects market expectations for risk and return. This approach is most applicable when the subject property is income-producing or could be leased to third-party tenants. The subject property is a light industrial shop/office building that would be attractive to investors in the local market.

For this analysis, we have utilized the Direct Capitalization method, which involves estimating stabilized net operating income and dividing by an appropriate capitalization rate derived from the market. We have estimated market rent based on our analysis of comparable lease transactions in the Billings industrial market.`,
    marketRentPerSF: 13.00,
    potentialGrossIncome: 132600,
    vacancyRate: 5,
    effectiveGrossIncome: 125970,
    expenseRatio: 15,
    operatingExpenses: 18896,
    netOperatingIncome: 107074,
    capRate: 6.25,
    valueConclusion: 1710000,
  },

  // =================================================================
  // COST APPROACH
  // =================================================================
  costApproach: {
    landValue: 324135,
    costPerSF: 140.28,
    replacementCostNew: 1430865,
    physicalDepreciation: 0,
    functionalObsolescence: 0,
    externalObsolescence: 0,
    depreciatedCost: 1430865,
    siteImprovements: 0,
    valueConclusion: 1755000,
  },

  // =================================================================
  // ASSUMPTIONS & LIMITING CONDITIONS
  // =================================================================
  assumptions: [
    'The appraiser assumes no responsibility for matters of a legal nature affecting the property appraised or the title thereto, nor does the appraiser render any opinion as to title, which is assumed to be good and marketable.',
    'The property is appraised as though under responsible ownership and competent management.',
    'The information furnished by others is believed to be reliable, but no warranty is given for its accuracy.',
    'All engineering is assumed to be correct. Any plot plans and illustrative material in this report are included only to assist the reader in visualizing the property.',
    'It is assumed that there are no hidden or unapparent conditions of the property, subsoil, or structures that would render it more or less valuable.',
    'It is assumed that the property is in full compliance with all applicable federal, state, and local environmental regulations and laws unless otherwise stated.',
    'It is assumed that all applicable zoning and use regulations and restrictions have been complied with, unless nonconformity has been stated, defined, and considered.',
    'It is assumed that all required licenses, certificates of occupancy, consents, or other legislative or administrative authority have been or can be obtained or renewed.',
    'The appraiser is not required to give testimony or appear in court because of having made this appraisal unless arrangements have been previously made.',
    'Any allocation of value between land and improvements applies only under the stated program of utilization. The separate valuations for land and buildings must not be used in conjunction with any other appraisal and are invalid if so used.',
  ],

  limitingConditions: [
    'The distribution of the total valuation in this report between land and improvements applies only under the existing program of utilization. The separate valuations for land and building must not be used in conjunction with any other appraisal and are invalid if so used.',
    'Possession of this report, or a copy thereof, does not carry with it the right of publication.',
    'Neither all nor any part of the contents of this report shall be conveyed to any person or entity, other than the appraiser\'s or firm\'s client, through advertising, solicitation materials, public relations, news, sales, or other media without the written consent and approval of the author.',
    'The appraiser will not be required to give testimony or appear in court because of having made an appraisal of the subject property, unless specific arrangements to do so have been made beforehand, or as otherwise required by law.',
    'No environmental impact studies were requested or made in conjunction with this appraisal, and the appraiser hereby reserves the right to alter, amend, revise, or rescind any of the value opinions based upon any subsequent environmental impact studies, research, or investigation.',
  ],

  // =================================================================
  // CERTIFICATIONS
  // =================================================================
  certifications: [
    'The statements of fact contained in this report are true and correct.',
    'The reported analyses, opinions, and conclusions are limited only by the reported assumptions and limiting conditions and are my personal, impartial, and unbiased professional analyses, opinions, and conclusions.',
    'I have no present or prospective interest in the property that is the subject of this report and no personal interest with respect to the parties involved.',
    'I have performed no services, as an appraiser or in any other capacity, regarding the property that is the subject of this report within the three-year period immediately preceding acceptance of this assignment.',
    'I have no bias with respect to the property that is the subject of this report or the parties involved with this assignment.',
    'My engagement in this assignment was not contingent upon developing or reporting predetermined results.',
    'My compensation for completing this assignment is not contingent upon the development or reporting of a predetermined value or direction in value that favors the cause of the client, the amount of the value opinion, the attainment of a stipulated result, or the occurrence of a subsequent event directly related to the intended use of this appraisal.',
    'My analyses, opinions, and conclusions were developed, and this report has been prepared, in conformity with the Uniform Standards of Professional Appraisal Practice.',
    'I have made a personal inspection of the property that is the subject of this report.',
    'No one provided significant real property appraisal assistance to the person signing this certification.',
  ],

  // =================================================================
  // PHOTOS
  // =================================================================
  photos: [
    {
      id: 'photo-cover',
      url: 'https://images.unsplash.com/photo-1565610222536-ef125c59da2e?w=800',
      caption: 'Subject Property - Fusion Technologies Shop/Office',
      category: 'cover',
    },
    {
      id: 'photo-ext-1',
      url: 'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=600',
      caption: 'Front Elevation - View from Entryway Drive',
      category: 'exterior',
    },
    {
      id: 'photo-ext-2',
      url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600',
      caption: 'East Elevation - Overhead Doors',
      category: 'exterior',
    },
    {
      id: 'photo-ext-3',
      url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600',
      caption: 'Rear Elevation - North Side',
      category: 'exterior',
    },
    {
      id: 'photo-int-1',
      url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600',
      caption: 'Office Area - Reception',
      category: 'interior',
    },
    {
      id: 'photo-int-2',
      url: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=600',
      caption: 'Office Area - Conference Room',
      category: 'interior',
    },
    {
      id: 'photo-int-3',
      url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600',
      caption: 'Shop Area - Main Floor',
      category: 'interior',
    },
    {
      id: 'photo-int-4',
      url: 'https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=600',
      caption: 'Shop Area - Overhead Doors',
      category: 'interior',
    },
    {
      id: 'photo-aerial',
      url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600',
      caption: 'Aerial View of Subject Property',
      category: 'aerial',
    },
    {
      id: 'photo-site-1',
      url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600',
      caption: 'Street View - Entryway Drive Looking East',
      category: 'site',
    },
    {
      id: 'photo-site-2',
      url: 'https://images.unsplash.com/photo-1558618047-f4b511bfe6e5?w=600',
      caption: 'Yard Area - Secured with Chain Link Fence',
      category: 'site',
    },
  ] as SamplePhoto[],
};

export default sampleAppraisalData;
