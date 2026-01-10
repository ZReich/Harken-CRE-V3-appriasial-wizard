// src/components/guidance/content.ts
// Guidance content for various wizard topics

import { DecisionStep } from './DecisionWizard';

// =================================================================
// ANALYSIS TYPE GUIDANCE
// =================================================================

export const ANALYSIS_TYPE_CONTENT = {
  title: 'Understanding Analysis Types',
  description:
    'Choose how this property component contributes to the overall property value.',

  options: {
    full: {
      label: 'Full Analysis',
      shortDescription: 'Separate approaches for this component',
      longDescription: `
        Use Full Analysis when this component represents a distinct, 
        independently-valued portion of the property. Each approach 
        (Sales, Income, Cost) will be applied separately, and the 
        resulting value will be reconciled with other components.
        
        **Best for:**
        - Primary improvements (main building)
        - Separately sellable land parcels
        - Major use components in mixed-use properties
        
        **Example:** The retail storefront in a mixed-use building 
        with apartments above.
      `,
    },
    contributory: {
      label: 'Contributory Value Only',
      shortDescription: 'Income approach only, value added to primary',
      longDescription: `
        Use Contributory Analysis when this component adds value to 
        the primary improvement but isn't valued independently. Only 
        the Income Approach will be applied, and the resulting 
        contributory value will be added to the primary component's 
        value.
        
        **Best for:**
        - Accessory dwelling units (ADUs)
        - Secondary income sources (mobile home pads, storage units)
        - Minor improvements that enhance value
        
        **Example:** A mobile home pad on a nursery property that 
        generates rental income.
      `,
    },
    combined: {
      label: 'Combined Analysis',
      shortDescription: 'No separate analysis, add lines to primary income',
      longDescription: `
        Use Combined Analysis when the component's income should be 
        analyzed as part of the primary income stream. No separate 
        income instance is created; instead, you can add income lines 
        directly to the primary pro forma.
        
        **Best for:**
        - Ancillary income that doesn't warrant separate analysis
        - Small additional income sources
        - Components fully integrated with primary use
        
        **Example:** Vending machine income in an office building.
      `,
    },
  },

  helpText: `
    Still unsure? Consider these questions:
    
    1. **Could this component be sold separately?**
       If yes → Full Analysis
    
    2. **Does it generate significant independent income?**
       If yes → Contributory or Full Analysis
    
    3. **Is the income minor compared to primary use?**
       If yes → Combined Analysis
    
    4. **Does the client/lender require separate valuation?**
       If yes → Full Analysis
  `,
};

// Decision wizard steps for Analysis Type
export const ANALYSIS_TYPE_DECISION_STEPS: DecisionStep[] = [
  {
    id: 'sellable',
    question: 'Could this component be sold separately from the main property?',
    description:
      'Consider whether the component has independent marketability.',
    options: [
      {
        id: 'yes-sellable',
        label: 'Yes, it could be sold separately',
        description: 'The component is legally and physically separable',
        value: 'full',
        nextStepId: null,
      },
      {
        id: 'no-sellable',
        label: 'No, it\'s tied to the main property',
        description: 'The component cannot be separated and sold independently',
        nextStepId: 'income-significant',
      },
    ],
    helpText:
      'Examples of separately sellable: excess land parcels, detached buildings with separate utilities. Not sellable: attached additions, shared-wall units.',
  },
  {
    id: 'income-significant',
    question: 'Does this component generate significant income relative to the primary use?',
    description:
      'Consider both the amount and importance of the income stream.',
    options: [
      {
        id: 'yes-significant',
        label: 'Yes, significant income',
        description: 'More than 20% of total property income',
        value: 'contributory',
        nextStepId: null,
      },
      {
        id: 'moderate-income',
        label: 'Moderate income',
        description: '5-20% of total property income',
        nextStepId: 'lender-requirement',
      },
      {
        id: 'minor-income',
        label: 'Minor or no income',
        description: 'Less than 5% of total property income',
        value: 'combined',
        nextStepId: null,
      },
    ],
    helpText:
      'Consider annual income amounts. A mobile home pad generating $600/month may be significant for a small property but minor for a large commercial complex.',
  },
  {
    id: 'lender-requirement',
    question: 'Does the client or lender require separate valuation of this component?',
    options: [
      {
        id: 'yes-required',
        label: 'Yes, separate valuation required',
        description: 'Client/lender specifically requested it',
        value: 'contributory',
        nextStepId: null,
      },
      {
        id: 'no-required',
        label: 'No specific requirement',
        description: 'Standard analysis approach is acceptable',
        value: 'combined',
        nextStepId: null,
      },
    ],
  },
];

// =================================================================
// LAND CLASSIFICATION GUIDANCE
// =================================================================

export const LAND_CLASSIFICATION_CONTENT = {
  title: 'Land Classification',
  description:
    'Properly classifying land is critical for accurate valuation and reporting.',

  options: {
    standard: {
      label: 'Standard Land',
      shortDescription: 'Part of the primary site',
      longDescription: `
        Standard land is the portion of the site that is typical and 
        necessary for the primary improvement. It's valued as part of 
        the overall property using standard approaches.
        
        **Characteristics:**
        - Appropriate size for the improvement
        - Zoned for current use
        - Contributes to highest and best use
        
        **Valuation:** Included in overall property value via Sales 
        Comparison or extracted in Cost Approach.
      `,
    },
    excess: {
      label: 'Excess Land',
      shortDescription: 'Separately marketable land beyond site needs',
      longDescription: `
        Excess land is the portion of a property that is not needed 
        to support the existing improvements and has independent 
        utility and separate highest and best use.
        
        **Key test:** Could this land be separated and sold without 
        affecting the primary improvement?
        
        **Characteristics:**
        - Has separate access or could obtain it
        - Separately buildable or usable
        - Distinct from primary site needs
        
        **Valuation:** Valued separately via Land Sales Comparison 
        and added to improvement value.
        
        **Example:** An extra acre behind a retail building with 
        separate street frontage.
      `,
    },
    surplus: {
      label: 'Surplus Land',
      shortDescription: 'Extra land that cannot be separately sold',
      longDescription: `
        Surplus land is land that is not needed to serve the existing 
        improvements but cannot be separated and sold. It may have 
        utility (parking overflow, expansion potential) but no 
        independent marketability.
        
        **Key test:** The land is "extra" but cannot be sold separately 
        due to zoning, access, or physical constraints.
        
        **Characteristics:**
        - No separate access
        - Not separately buildable
        - Provides ancillary benefit only
        
        **Valuation:** Treated as a contributory value adjustment 
        (typically via extraction from sales with similar conditions).
        
        **Example:** The back portion of a flag lot with no street 
        frontage.
      `,
    },
  },

  helpText: `
    The distinction between excess and surplus is critical:
    
    **Excess Land** = Separately sellable → Valued independently
    **Surplus Land** = Not separately sellable → Contributory adjustment
    
    If unsure, ask: "Could I subdivide and sell this land today?"
    - Yes → Excess
    - No → Surplus (if there's extra) or Standard (if appropriate for use)
  `,
};

// =================================================================
// RENT COMP MODE GUIDANCE
// =================================================================

export const RENT_COMP_MODE_CONTENT = {
  title: 'Rent Comparable Analysis Mode',
  description: 'Choose the appropriate analysis mode for your rent comparables.',

  options: {
    commercial: {
      label: 'Commercial Mode',
      shortDescription: 'NNN rents, lease terms, tenant types',
      longDescription: `
        Use Commercial Mode for retail, office, industrial, and other 
        commercial properties. Analysis focuses on:
        
        - Rent per SF (NNN and Gross)
        - Lease terms and expiration
        - Tenant type (national, regional, local)
        - CAM recovery and reimbursements
        
        **Best for:** Retail, office, industrial, warehouse, flex space.
      `,
    },
    residential: {
      label: 'Residential Mode',
      shortDescription: 'Rent per unit, bed/bath, amenities',
      longDescription: `
        Use Residential Mode for apartments, duplexes, and multi-family 
        properties. Analysis focuses on:
        
        - Rent per unit (not per SF)
        - Unit configuration (bed/bath)
        - Unit size and type
        - Amenities and condition
        
        **Best for:** Apartments, duplexes, triplexes, fourplexes, 
        condos, townhomes used as rentals.
      `,
    },
  },

  helpText: `
    The system will auto-detect the appropriate mode based on your 
    property component configuration:
    
    - Residential category → Residential Mode
    - Commercial category → Commercial Mode
    
    You can override this if needed for mixed-use analysis.
  `,
};

// =================================================================
// PROPERTY COMPONENTS GUIDANCE
// =================================================================

export const PROPERTY_COMPONENTS_CONTENT = {
  title: 'Property Components',
  description:
    'Define the different uses and components that make up this property.',

  overview: `
    The Property Components system allows you to analyze mixed-use 
    properties by defining each distinct use separately. Each component 
    can have its own valuation approaches and analysis configuration.
    
    **Why use components?**
    - Mixed-use properties (retail + apartments)
    - Properties with excess or surplus land
    - Properties with multiple income sources
    - Complex properties requiring separate analysis
  `,

  workflow: `
    1. **Define Primary Component**
       Configure the main use of the property (e.g., retail storefront).
    
    2. **Add Additional Components**
       Click "+ Add Property Component" to define secondary uses 
       (e.g., upstairs apartments, excess land).
    
    3. **Configure Analysis**
       For each component, choose Full, Contributory, or Combined 
       analysis based on its significance.
    
    4. **Analyze Each Component**
       The Analysis page will show tabs for each component requiring 
       separate analysis.
    
    5. **Reconcile Values**
       The system automatically sums values from all components and 
       presents a reconciliation summary.
  `,

  helpText: `
    **Not sure if you need components?**
    
    Use a single component (standard approach) if:
    - Single-use property
    - No excess/surplus land
    - All income from one source
    
    Use multiple components if:
    - More than one distinct use type
    - Excess or surplus land present
    - Multiple significant income sources
    - Client requires separate valuation of uses
  `,
};

// =================================================================
// CONTRIBUTORY VALUE GUIDANCE
// =================================================================

export const CONTRIBUTORY_VALUE_CONTENT = {
  title: 'Contributory Value Analysis',
  description:
    'Understanding how contributory values work in mixed-use properties.',

  overview: `
    Contributory value represents the additional value that a secondary 
    component adds to the primary property. It's calculated separately 
    but added to (not reconciled with) the primary value.
    
    **Formula:**
    Total Value = Primary Value + Sum of Contributory Values
  `,

  methodology: `
    **How Contributory Values Are Calculated:**
    
    1. **Income Approach Only**
       Contributory components typically use only the Income Approach, 
       as they represent income-producing additions.
    
    2. **Direct Capitalization**
       Annual net income from the component is capitalized at an 
       appropriate rate to derive value.
    
    3. **Addition to Primary**
       The contributory value is added directly to the primary value 
       in the final reconciliation.
  `,

  examples: `
    **Example 1: Mobile Home Pad on Nursery**
    - Nursery (Primary): $450,000 (Sales + Income)
    - Mobile Home Pad (Contributory): $35,000 (Income only)
    - Total Value: $485,000
    
    **Example 2: Storage Units on Industrial**
    - Industrial Building (Primary): $1,200,000
    - Storage Units (Contributory): $85,000
    - Total Value: $1,285,000
  `,

  helpText: `
    Contributory analysis is appropriate when:
    - The component cannot be sold separately
    - Income is significant but not dominant
    - Full analysis would be excessive
    - Component enhances primary use value
  `,
};

// =================================================================
// SCENARIO SELECTION GUIDANCE
// =================================================================

export const SCENARIO_SELECTION_CONTENT = {
  title: 'Appraisal Scenarios',
  description: 'Understanding which scenarios are required for your appraisal.',

  scenarios: {
    asIs: {
      label: 'As Is',
      description: `
        Value of the property in its current condition on the effective 
        date. Required for most appraisals.
      `,
      triggers: ['Default for existing properties', 'Required by most lenders'],
    },
    asCompleted: {
      label: 'As Completed',
      description: `
        Prospective value assuming completion of proposed improvements, 
        as of a future date. Required when improvements are planned or 
        under construction.
      `,
      triggers: [
        'Construction loans',
        'Proposed developments',
        'Major renovations',
      ],
    },
    asStabilized: {
      label: 'As Stabilized',
      description: `
        Prospective value assuming the property reaches stabilized 
        occupancy, as of a future date. Required for income properties 
        in lease-up or development.
      `,
      triggers: [
        'New construction lease-up',
        'Income property stabilization',
        'Interagency Guidelines for construction loans',
      ],
    },
    asProposed: {
      label: 'As Proposed',
      description: `
        Value based on proposed plans before any construction begins. 
        Used for feasibility analysis and early-stage financing.
      `,
      triggers: ['Pre-construction analysis', 'Development feasibility'],
    },
  },

  helpText: `
    The system automatically determines required scenarios based on:
    - Property status (existing, under construction, proposed)
    - Planned changes (renovations, change of use)
    - Occupancy status (stabilized, lease-up, vacant)
    - Loan purpose (construction, bridge, permanent)
    
    You can always add custom scenarios for special situations.
  `,
};
