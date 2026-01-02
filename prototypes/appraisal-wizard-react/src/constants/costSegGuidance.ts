/**
 * Cost Segregation Guidance System
 * 
 * Comprehensive guidance, IRS references, glossary terms, and contextual help
 * for the Cost Segregation module.
 * 
 * References:
 * - IRS Publication 946: How to Depreciate Property
 * - IRS TD 9636: Tangible Property Regulations
 * - IRS Audit Techniques Guide: Cost Segregation
 * - AICPA Cost Segregation Practice Aid
 */

// =================================================================
// IRS REFERENCES
// =================================================================

export interface IRSReference {
  id: string;
  title: string;
  citation: string;
  summary: string;
  url?: string;
  relevantSections?: string[];
}

export const IRS_REFERENCES: Record<string, IRSReference> = {
  'pub-946': {
    id: 'pub-946',
    title: 'IRS Publication 946',
    citation: 'Publication 946 (2023), How to Depreciate Property',
    summary: 'Primary reference for depreciation rules including MACRS, recovery periods, and conventions.',
    url: 'https://www.irs.gov/publications/p946',
    relevantSections: ['Chapter 4: MACRS', 'Appendix B: Table of Class Lives and Recovery Periods'],
  },
  
  'td-9636': {
    id: 'td-9636',
    title: 'IRS TD 9636',
    citation: 'Treasury Decision 9636 (2013), Tangible Property Regulations',
    summary: 'Final regulations on repair and capitalization, including building system definitions.',
    url: 'https://www.federalregister.gov/documents/2013/09/19/2013-21756/guidance-regarding-deduction-and-capitalization-of-expenditures-related-to-tangible-property',
    relevantSections: ['§1.263(a)-3(e): Building Systems'],
  },
  
  'atg-costseg': {
    id: 'atg-costseg',
    title: 'IRS Audit Techniques Guide',
    citation: 'Cost Segregation Audit Techniques Guide (2023)',
    summary: 'IRS guidelines for examining cost segregation studies, including common audit triggers.',
    relevantSections: [
      'Chapter 2: Engineering-Based Approach',
      'Chapter 3: Residual Estimation Approach',
      'Chapter 4: Rule of 45',
      'Chapter 5: Common Issues',
    ],
  },
  
  'irc-168': {
    id: 'irc-168',
    title: 'IRC Section 168',
    citation: '26 U.S.C. § 168: Accelerated Cost Recovery System',
    summary: 'Defines MACRS depreciation system and recovery periods for different asset classes.',
    url: 'https://www.law.cornell.edu/uscode/text/26/168',
  },
  
  'revenue-procedure-87-56': {
    id: 'revenue-procedure-87-56',
    title: 'Revenue Procedure 87-56',
    citation: 'Rev. Proc. 87-56, 1987-2 C.B. 674',
    summary: 'Provides class lives and recovery periods for property under MACRS.',
    relevantSections: ['Asset Class 00.11 through 80.0'],
  },
};

// =================================================================
// GLOSSARY TERMS
// =================================================================

export interface GlossaryTerm {
  id: string;
  term: string;
  definition: string;
  irsReference?: string;
  relatedTerms?: string[];
  example?: string;
}

export const GLOSSARY: Record<string, GlossaryTerm> = {
  'macrs': {
    id: 'macrs',
    term: 'MACRS',
    definition: 'Modified Accelerated Cost Recovery System. The current method of depreciation for most property placed in service after 1986.',
    irsReference: 'pub-946',
    relatedTerms: ['recovery-period', 'depreciation-method'],
  },
  
  'recovery-period': {
    id: 'recovery-period',
    term: 'Recovery Period',
    definition: 'The number of years over which the cost basis of property is recovered through depreciation deductions.',
    irsReference: 'pub-946',
    relatedTerms: ['macrs', 'class-life'],
  },
  
  'placed-in-service': {
    id: 'placed-in-service',
    term: 'Placed in Service',
    definition: 'The date when property is ready and available for its specific use. Depreciation begins when property is placed in service.',
    irsReference: 'pub-946',
    example: 'For a building, this is typically the date of substantial completion or occupancy.',
  },
  
  'personal-property': {
    id: 'personal-property',
    term: 'Personal Property',
    definition: 'Tangible property that is not real property. Generally includes equipment, machinery, and removable components. Usually qualifies for 5-year or 7-year recovery.',
    irsReference: 'td-9636',
    relatedTerms: ['real-property', '5-year', '7-year'],
    example: 'Movable partition walls, specialty electrical for equipment, carpet, furniture.',
  },
  
  'real-property': {
    id: 'real-property',
    term: 'Real Property',
    definition: 'Land and generally anything built on, growing on, or attached to land. Typically depreciated over 27.5 or 39 years.',
    irsReference: 'td-9636',
    relatedTerms: ['personal-property', '39-year', '27.5-year'],
  },
  
  'land-improvements': {
    id: 'land-improvements',
    term: 'Land Improvements',
    definition: 'Improvements directly to or added to land. Generally qualify for 15-year recovery. Examples include parking lots, landscaping, fencing, and site utilities.',
    irsReference: 'revenue-procedure-87-56',
    relatedTerms: ['15-year', 'site-improvements'],
  },
  
  'building-system': {
    id: 'building-system',
    term: 'Building System',
    definition: 'Per IRS TD 9636, one of eight structural components: HVAC, plumbing, electrical, escalators/elevators, fire protection/alarm, security, gas distribution. These systems are evaluated as a unit of property.',
    irsReference: 'td-9636',
    relatedTerms: ['unit-of-property'],
  },
  
  'unit-of-property': {
    id: 'unit-of-property',
    term: 'Unit of Property',
    definition: 'The appropriate unit for determining whether costs must be capitalized or may be deducted. Building systems are evaluated as separate units.',
    irsReference: 'td-9636',
    relatedTerms: ['building-system'],
  },
  
  '5-year': {
    id: '5-year',
    term: '5-Year Property',
    definition: 'Property with a 5-year recovery period. Includes computers, office equipment, autos, light trucks, and certain qualified technology equipment.',
    irsReference: 'pub-946',
    relatedTerms: ['personal-property', 'macrs'],
    example: 'Computer networks, office furniture, specialty lighting fixtures.',
  },
  
  '7-year': {
    id: '7-year',
    term: '7-Year Property',
    definition: 'Property with a 7-year recovery period. Includes office furniture and fixtures, and any property not designated to another class.',
    irsReference: 'pub-946',
    relatedTerms: ['personal-property', 'macrs'],
    example: 'Desks, chairs, decorative fixtures, certain equipment.',
  },
  
  '15-year': {
    id: '15-year',
    term: '15-Year Property',
    definition: 'Property with a 15-year recovery period. Primarily land improvements such as sidewalks, roads, fences, and landscaping.',
    irsReference: 'pub-946',
    relatedTerms: ['land-improvements'],
    example: 'Parking lots, exterior lighting, site utilities, fencing.',
  },
  
  '27.5-year': {
    id: '27.5-year',
    term: '27.5-Year Property',
    definition: 'Residential rental property with a 27.5-year recovery period.',
    irsReference: 'pub-946',
    relatedTerms: ['real-property'],
  },
  
  '39-year': {
    id: '39-year',
    term: '39-Year Property',
    definition: 'Nonresidential real property with a 39-year recovery period. Includes the building shell and structural components.',
    irsReference: 'pub-946',
    relatedTerms: ['real-property'],
  },
  
  'bonus-depreciation': {
    id: 'bonus-depreciation',
    term: 'Bonus Depreciation',
    definition: 'Additional first-year depreciation deduction for qualified property. Currently 100% for property placed in service through 2022, phasing down thereafter.',
    irsReference: 'irc-168',
    relatedTerms: ['macrs', 'section-179'],
  },
  
  'section-179': {
    id: 'section-179',
    term: 'Section 179 Deduction',
    definition: 'Allows businesses to deduct the full purchase price of qualifying equipment purchased or financed during the tax year, subject to limits.',
    irsReference: 'irc-168',
    relatedTerms: ['bonus-depreciation'],
  },
  
  'engineering-based': {
    id: 'engineering-based',
    term: 'Engineering-Based Approach',
    definition: 'Cost segregation method that relies on detailed cost estimates, engineering principles, and construction documents. Most defensible approach per IRS.',
    irsReference: 'atg-costseg',
    relatedTerms: ['residual-estimation'],
  },
  
  'residual-estimation': {
    id: 'residual-estimation',
    term: 'Residual Estimation Approach',
    definition: 'Cost segregation method that estimates costs by subtracting known costs from total project cost. Less defensible than engineering-based approach.',
    irsReference: 'atg-costseg',
    relatedTerms: ['engineering-based'],
  },
};

// =================================================================
// CONTEXTUAL GUIDANCE
// =================================================================

export interface GuidanceContent {
  id: string;
  title: string;
  context: 'overview' | 'system-refinement' | 'supplemental-items' | 'audit-risk' | 'benchmarks' | 'measurements';
  content: string;
  tips?: string[];
  warnings?: string[];
  irsReferences?: string[];
  relatedGlossary?: string[];
}

export const GUIDANCE_CONTENT: Record<string, GuidanceContent> = {
  // OVERVIEW GUIDANCE
  'costseg-overview': {
    id: 'costseg-overview',
    title: 'Cost Segregation Overview',
    context: 'overview',
    content: `Cost segregation is an IRS-approved tax strategy that accelerates depreciation deductions by identifying property components that can be depreciated over shorter periods (5, 7, or 15 years) rather than the standard 27.5 or 39 years.

**Key Benefits:**
- Accelerated depreciation deductions
- Improved cash flow through tax savings
- Retroactive studies can generate immediate deductions via Form 3115

**This Wizard Approach:**
Most building costs are already captured in your standard appraisal. This section focuses on the "secret sauce" - the specialized breakdowns and supplemental items unique to cost segregation that aren't typically documented in a standard appraisal.`,
    tips: [
      'Focus on system refinements (electrical, HVAC, plumbing) and supplemental items',
      'Document measurements and photos for IRS defensibility',
      'Use engineering-based estimates when possible',
      'Consider bonus depreciation implications for qualifying property',
    ],
    irsReferences: ['pub-946', 'atg-costseg'],
    relatedGlossary: ['macrs', 'personal-property', 'land-improvements'],
  },
  
  // SYSTEM REFINEMENT GUIDANCE
  'system-refinement-overview': {
    id: 'system-refinement-overview',
    title: 'Building System Refinements',
    context: 'system-refinement',
    content: `Per IRS TD 9636, building systems (HVAC, electrical, plumbing, etc.) must be evaluated as a unit. However, within each system, certain components may qualify for shorter depreciation periods.

**Common Refinements:**
- **Electrical:** Dedicated equipment circuits, specialty wiring, lighting controls
- **HVAC:** Rooftop units serving specific processes, supplemental cooling
- **Plumbing:** Process-specific piping, specialized fixtures
- **Fire Protection:** Certain sprinkler components in tenant spaces`,
    tips: [
      'Start with the total system cost from your appraisal',
      'Break out only components that clearly qualify for shorter periods',
      'Document the engineering basis for each allocation',
      'Use measurements (linear feet of conduit, tons of cooling) when possible',
      'Link photos to support classifications',
    ],
    warnings: [
      'Over-allocation to shorter periods is a common audit trigger',
      'Ensure refinements are supported by engineering estimates or measurements',
      'Don\'t double-count costs between systems',
    ],
    irsReferences: ['td-9636', 'atg-costseg'],
    relatedGlossary: ['building-system', 'unit-of-property', 'engineering-based'],
  },
  
  'electrical-refinement': {
    id: 'electrical-refinement',
    title: 'Electrical System Refinement',
    context: 'system-refinement',
    content: `Electrical systems often contain components qualifying for 5-year or 7-year depreciation:

**5-Year Qualified:**
- Dedicated circuits for computers/data equipment
- UPS/backup power for IT equipment
- Specialty lighting for equipment operation
- Control systems for manufacturing

**15-Year Qualified:**
- Exterior site lighting
- Parking lot lighting circuits
- Monument sign electrical

**Measurement Tips:**
- Linear feet of conduit/cable for dedicated circuits
- Number of dedicated panels and disconnects
- Square footage served by specialty lighting`,
    tips: [
      'Focus on circuits serving equipment vs. general building power',
      'Document the specific equipment powered by dedicated circuits',
      'Typical allocation: 5-15% of total electrical qualifies for shorter periods',
    ],
    warnings: [
      'General building power distribution stays at 39 years',
      'Don\'t allocate entire panels - only dedicated portions',
    ],
    irsReferences: ['atg-costseg', 'td-9636'],
    relatedGlossary: ['5-year', '15-year', 'personal-property'],
  },
  
  'hvac-refinement': {
    id: 'hvac-refinement',
    title: 'HVAC System Refinement',
    context: 'system-refinement',
    content: `HVAC systems may have components qualifying for shorter depreciation:

**5-Year Qualified:**
- Dedicated cooling for server rooms/data centers
- Process-specific HVAC (manufacturing, labs)
- Supplemental HVAC for equipment rooms

**Typical Building HVAC (39-year):**
- Central air handlers
- Rooftop units for general building comfort
- Main ductwork and distribution

**Measurement Tips:**
- Tons of cooling capacity for dedicated units
- Square footage served by process-specific HVAC
- BTU capacity of supplemental units`,
    tips: [
      'Focus on HVAC serving equipment vs. human comfort',
      'Document the specific process or equipment served',
      'Typical allocation: 5-10% of total HVAC qualifies for 5-year',
    ],
    warnings: [
      'General comfort cooling stays at 39 years',
      'Must demonstrate a clear non-comfort purpose',
    ],
    irsReferences: ['atg-costseg', 'td-9636'],
    relatedGlossary: ['5-year', '39-year', 'building-system'],
  },
  
  'plumbing-refinement': {
    id: 'plumbing-refinement',
    title: 'Plumbing System Refinement',
    context: 'system-refinement',
    content: `Plumbing systems typically have fewer opportunities for shorter depreciation:

**5-Year Qualified (Rare):**
- Specialized process piping (manufacturing, food service)
- Equipment-specific water lines
- Laboratory gas/water systems

**15-Year Qualified:**
- Irrigation systems
- Exterior water features
- Site fire hydrants

**Typical Building Plumbing (39-year):**
- General domestic water supply
- Sanitary waste systems
- Natural gas distribution`,
    tips: [
      'Most plumbing stays at 39 years',
      'Focus on specialized systems serving equipment or exterior improvements',
      'Typical allocation: 0-5% of total plumbing qualifies for shorter periods',
    ],
    irsReferences: ['td-9636', 'atg-costseg'],
    relatedGlossary: ['5-year', '15-year', 'building-system'],
  },
  
  // SUPPLEMENTAL ITEMS GUIDANCE
  'supplemental-items-overview': {
    id: 'supplemental-items-overview',
    title: 'Supplemental Items',
    context: 'supplemental-items',
    content: `Supplemental items are cost segregation-specific components that aren't typically broken out in a standard appraisal. These are often the highest-value components to identify.

**Common Categories:**
- **Personal Property:** Movable partitions, window treatments, decorative fixtures
- **Land Improvements:** Parking striping, landscaping details, site lighting
- **Tenant Improvements:** Demising walls, specialized finishes, built-ins
- **Equipment:** Security systems, audio-visual, specialized lighting controls`,
    tips: [
      'Look for items that are movable or non-structural',
      'Document the specific purpose of each item',
      'Use vendor invoices when available for support',
      'Link photos showing the items in place',
    ],
    warnings: [
      'Items must be separately identifiable, not part of building shell',
      'Avoid including items already captured in system refinements',
    ],
    irsReferences: ['atg-costseg', 'revenue-procedure-87-56'],
    relatedGlossary: ['personal-property', 'land-improvements', '5-year', '7-year', '15-year'],
  },
  
  // MEASUREMENT GUIDANCE
  'measurement-calculator': {
    id: 'measurement-calculator',
    title: 'Measurement-Based Costing',
    context: 'measurements',
    content: `Measurement-based costing provides the strongest IRS support for cost allocations. This engineering-based approach is more defensible than percentage-based estimates.

**Common Measurement Units:**
- **LF (Linear Feet):** Conduit, piping, cable runs, fencing
- **SF (Square Feet):** Flooring, ceilings, wall finishes, roofing areas
- **EA (Each):** Fixtures, equipment, controls, disconnects
- **CY (Cubic Yards):** Concrete, earthwork
- **TON (Tons):** HVAC equipment capacity

**Unit Cost Sources:**
- RS Means Cost Data
- Marshall & Swift Valuation Service
- Contractor invoices and estimates
- Engineering estimates`,
    tips: [
      'Measure actual installed quantities when possible',
      'Document measurement methods and assumptions',
      'Use industry-standard unit costs',
      'Include both material and labor in unit costs',
      'Keep measurement notes and sketches',
    ],
    irsReferences: ['atg-costseg'],
    relatedGlossary: ['engineering-based'],
  },
  
  // AUDIT RISK GUIDANCE
  'audit-risk-overview': {
    id: 'audit-risk-overview',
    title: 'IRS Audit Risk Assessment',
    context: 'audit-risk',
    content: `The IRS scrutinizes cost segregation studies, particularly those with aggressive allocations. Understanding common audit triggers helps you create defensible studies.

**Common Audit Triggers:**
- More than 30% allocated to personal property (5/7-year)
- Lack of engineering support or documentation
- Missing or inadequate site inspection
- No photos or measurements
- Allocations significantly above industry averages
- Use of residual estimation method

**Best Practices for Defensibility:**
- Engineering-based approach with detailed cost estimates
- Comprehensive site inspection with photos
- Measurements and calculations for key components
- Comparison to industry benchmarks
- Clear documentation of methodology`,
    warnings: [
      'Aggressive allocations increase audit risk exponentially',
      'Missing documentation is the #1 cause of adjustments in audits',
      'Residual estimation is considered less reliable by IRS',
    ],
    irsReferences: ['atg-costseg'],
    relatedGlossary: ['engineering-based', 'residual-estimation'],
  },
  
  // BENCHMARKS GUIDANCE
  'benchmarks-overview': {
    id: 'benchmarks-overview',
    title: 'Industry Benchmarks',
    context: 'benchmarks',
    content: `Industry benchmarks provide a sanity check for cost segregation allocations. While every property is unique, significant deviations from typical ranges warrant additional scrutiny and documentation.

**Typical Allocation Ranges by Property Type:**

**Office Buildings:**
- 5/7-Year: 15-25%
- 15-Year: 10-15%
- 39-Year: 60-75%

**Industrial/Warehouse:**
- 5/7-Year: 20-30%
- 15-Year: 15-20%
- 39-Year: 50-65%

**Retail:**
- 5/7-Year: 25-35%
- 15-Year: 10-15%
- 39-Year: 50-65%

**Important Notes:**
- These are guidelines, not rules
- Age, condition, and improvements affect allocations
- Specialized facilities may deviate significantly
- Document reasons for material deviations`,
    tips: [
      'Use benchmarks as a reasonableness check',
      'If above typical ranges, ensure strong documentation',
      'Consider property-specific factors (age, improvements, use)',
      'Compare to similar completed studies when available',
    ],
    irsReferences: ['atg-costseg'],
  },
};

// =================================================================
// QUICK TIPS BY CONTEXT
// =================================================================

export const QUICK_TIPS: Record<string, string[]> = {
  'overview': [
    'Focus on items not in standard appraisal',
    'Document everything with photos and measurements',
    'Use engineering-based estimates',
    'Compare to industry benchmarks',
  ],
  
  'electrical': [
    'Measure linear feet of dedicated conduit/cable',
    'Identify circuits serving equipment vs. building',
    'Document specific equipment powered',
    'Typical: 5-15% qualifies for shorter periods',
  ],
  
  'hvac': [
    'Identify process-specific HVAC systems',
    'Measure tons of capacity for dedicated units',
    'Document non-comfort cooling purposes',
    'Typical: 5-10% qualifies for 5-year',
  ],
  
  'plumbing': [
    'Most plumbing stays at 39 years',
    'Focus on specialized process systems',
    'Include exterior irrigation as 15-year',
    'Typical: 0-5% qualifies for shorter periods',
  ],
  
  'fire-protection': [
    'Main systems typically 39-year',
    'Tenant-specific upgrades may qualify shorter',
    'Document serving non-building purposes',
  ],
  
  'supplemental': [
    'Look for movable, non-structural items',
    'Window treatments, partitions, fixtures',
    'Site improvements: parking, landscaping',
    'Keep vendor invoices for support',
  ],
  
  'measurements': [
    'Strongest IRS support available',
    'Use industry-standard units (LF, SF, EA)',
    'Document measurement methods',
    'Include both material and labor costs',
  ],
  
  'audit': [
    'Keep allocations reasonable vs. benchmarks',
    'Document everything with photos',
    'Use engineering-based approach',
    'Conduct thorough site inspection',
  ],
};

// =================================================================
// CONTEXTUAL GUIDANCE HELPER
// =================================================================

export function getGuidanceForContext(context: string): GuidanceContent[] {
  return Object.values(GUIDANCE_CONTENT).filter(g => 
    g.context === context || g.id.includes(context)
  );
}

export function getGlossaryTerm(termId: string): GlossaryTerm | undefined {
  return GLOSSARY[termId];
}

export function getIRSReference(refId: string): IRSReference | undefined {
  return IRS_REFERENCES[refId];
}

export function getQuickTips(context: string): string[] {
  return QUICK_TIPS[context] || [];
}

// =================================================================
// SEARCH HELPERS
// =================================================================

export function searchGlossary(query: string): GlossaryTerm[] {
  const lowerQuery = query.toLowerCase();
  return Object.values(GLOSSARY).filter(term =>
    term.term.toLowerCase().includes(lowerQuery) ||
    term.definition.toLowerCase().includes(lowerQuery)
  );
}

export function searchGuidance(query: string): GuidanceContent[] {
  const lowerQuery = query.toLowerCase();
  return Object.values(GUIDANCE_CONTENT).filter(guide =>
    guide.title.toLowerCase().includes(lowerQuery) ||
    guide.content.toLowerCase().includes(lowerQuery)
  );
}
