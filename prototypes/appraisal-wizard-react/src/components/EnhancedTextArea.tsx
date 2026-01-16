import { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  Sparkles, 
  Maximize2, 
  Minimize2,
  Undo,
  Redo,
  AlignLeft,
  AlignCenter,
  AlignRight,
  X,
  Check,
  Info,
  Loader2
} from 'lucide-react';
import { useWizard } from '../context/WizardContext';
import { buildEnhancedContextForAI } from '../utils/hbuContextBuilder';
import { generateDraft as generateAIDraft } from '../services/aiService';
import type { AIGenerationContext } from '../types/api';
import DocumentSourceIndicator from './DocumentSourceIndicator';

// ==========================================
// TYPES
// ==========================================
interface EnhancedTextAreaProps {
  id?: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  sectionContext?: string;
  helperText?: string;
  required?: boolean;
  minHeight?: number;
  contextData?: Record<string, any>; // Additional context for AI generation
  additionalContext?: Record<string, any>; // Additional context data to pass to AI
  aiInstructions?: string; // Custom instructions for AI generation
  fieldPath?: string; // For DocumentSourceIndicator
}

interface AIPreview {
  content: string;
  isVisible: boolean;
}

// FIX #48: Simulated AI responses for demo (fallback when API unavailable)
// Bold and underlined section headers for professional appraisal appearance
// TODO: These should be updated to template in actual wizard data when available
// Currently these are static templates - they should use contextData prop to inject real values
const SimulatedAIDrafts: Record<string, string> = {
  'legal_description': '<b><u>LEGAL DESCRIPTION</u></b>\n\nLot 12, Block 4, of CANYON CREEK INDUSTRIAL PARK, according to the plat thereof, filed in Plat Book 45, at Page 123, records of Yellowstone County, Montana, located in the Southeast Quarter of Section 15, Township 1 South, Range 26 East, Principal Meridian, Montana.',
  
  'area_description': '<b><u>AREA DESCRIPTION</u></b>\n\nThe subject property is located in the Billings Heights area of Billings, Montana, an established commercial and industrial corridor along South 30th Street West. The immediate neighborhood is characterized by a mix of light industrial, warehouse, and commercial uses. The area benefits from excellent access to Interstate 90 and major arterial roads. The local economy is diverse, supported by agriculture, energy, healthcare, and manufacturing sectors.',
  
  'site_description': '<b><u>SITE DESCRIPTION</u></b>\n\nThe subject site contains approximately 1.43 acres (62,291 square feet) of level, rectangular land. The site has approximately 200 feet of frontage along South 30th Street West with adequate ingress and egress. All public utilities including water, sewer, electricity, and natural gas are available and connected.',
  
  'improvement_description': '<b><u>IMPROVEMENT DESCRIPTION</u></b>\n\nThe subject improvements consist of a single-story industrial warehouse building constructed in 2019. The building features a steel frame with metal panel exterior walls and a standing seam metal roof. The structure provides approximately 11,174 square feet of gross building area, including warehouse space with 24-foot clear heights.',
  
  'hbu_analysis': '<b><u>HIGHEST AND BEST USE CONCLUSION</u></b>\n\nBased on analysis of the four tests of highest and best use, the subject site as vacant would be developed with industrial/warehouse use. This conclusion is supported by: (1) Legal permissibility under the I1-Light Industrial zoning; (2) Physical possibility given the level topography; (3) Financial feasibility based on current market demand; and (4) Maximum productivity compared to alternative uses.',
  
  'swot_summary_analysis': `<b><u>SWOT ANALYSIS SUMMARY</u></b>

The subject property exhibits a balanced risk-return profile with notable competitive advantages tempered by specific operational considerations. The property's strengths—including favorable zoning, well-maintained improvements in good to excellent condition, and strong market positioning—provide a solid foundation for sustained performance. These attributes enhance marketability and support stable cash flows, positioning the asset favorably within its competitive set.

However, several weaknesses warrant attention. Limited walkability may reduce property desirability in market segments where pedestrian accessibility is valued. Additionally, the concrete slab and building envelope components are approaching the end of their useful economic lives, with significant depreciation already recognized. These factors introduce near-term capital expenditure requirements that must be incorporated into hold-period projections and budgetary planning.

From an opportunity perspective, strong rent growth of 3.2% signals robust demand fundamentals and appreciation potential. Improving market conditions with positive price outlooks further support value enhancement strategies. The property is well-positioned to capture upside through strategic lease renewals and potential operational improvements.

Threat analysis reveals elevated liquidity and asset quality risk scores (70/100 and 80/100 respectively), which require investor consideration and may influence required returns. The approaching replacement needs for roof membrane systems (TPO installed 1989) and window components (LVP/LVT with approximately 3 years remaining useful life) represent material capital obligations that will impact near-term cash flows. These deferred maintenance items, if not addressed proactively, could accelerate depreciation and negatively affect tenant retention.

Overall, the property presents a defensible investment opportunity for operators capable of managing near-term capital requirements while capitalizing on favorable market momentum. The combination of strong operational fundamentals and identifiable risks suggests appropriate pricing should reflect both value-creation potential and capital replacement obligations inherent in the asset's current condition and market positioning.`,
  
  'reconciliation': `<b><u>VALUE RECONCILIATION</u></b>

In reconciling the value indications from the applicable valuation approaches, I have given primary emphasis to the Income Approach, which indicates a value reflective of investor decision-making for income-producing properties. This approach is considered most reliable because income-producing properties like the subject are typically purchased by investors who base their acquisition decisions on anticipated income and return requirements. The income data utilized reflects actual operating history and market-supported assumptions.

<b><u>SALES COMPARISON APPROACH</u></b>

The Sales Comparison Approach provides strong supporting indication of value. Adequate comparable sales data was available, and market participants for this property type rely on direct comparison to recent transactions. The adjustments applied are well-supported by market evidence.

<b><u>COST APPROACH</u></b>

The Cost Approach is given least weight due to the difficulty in accurately measuring depreciation for properties of this age and type. However, the Cost Approach indication provides a useful benchmark and confirms the reasonableness of the other approaches.

<b><u>FINAL VALUE OPINION</u></b>

Based on the foregoing analysis, it is my opinion that the market value of the subject property reflects the most probable price the property would bring in a competitive and open market under all conditions requisite to a fair sale, with buyer and seller each acting prudently and knowledgeably.`,

  'exposure': `<b><u>EXPOSURE TIME ESTIMATE</u></b>

Based on analysis of current market conditions for this property type in the subject market area, I estimate the exposure time for the subject property to be 6 to 12 months. This estimate reflects the time period the property would have been exposed to the market prior to the effective date of value, assuming competent marketing at market-appropriate pricing.

<b><u>MARKETING TIME ESTIMATE</u></b>

The estimated marketing time, which represents the prospective time to achieve a sale from the effective date forward, is also estimated at 6 to 12 months. This estimate considers the property's value level, which falls within the typical transaction size for this market. The subject's condition and functional utility are consistent with market expectations.

<b><u>MARKET CONDITIONS</u></b>

Current market conditions for properties of this type are stable, with adequate buyer demand and available financing for qualified investors. Transaction velocity in this submarket has remained consistent over the past 12 months, supporting the exposure and marketing time estimates provided. These estimates are based on interviews with market participants, review of comparable marketing times, and my professional experience in this market.`,
  
  // HBU-specific templates for the four tests
  'hbu_legally_permissible': '<b><u>LEGALLY PERMISSIBLE USES</u></b>\n\nThe subject property is zoned I-1 (Light Industrial) under the applicable zoning ordinance. Under this zoning classification, permitted uses by right include light manufacturing, warehousing and distribution, research and development facilities, and related commercial uses. Conditional uses may include outdoor storage with appropriate screening and certain retail uses accessory to industrial operations.\n\n<b><u>DEED RESTRICTIONS AND COVENANTS</u></b>\n\nNo deed restrictions, private covenants, or easements were identified in our title review that would further limit development potential beyond the zoning requirements. The current use is a conforming use under the applicable zoning ordinance.\n\n<b><u>CONCLUSION</u></b>\n\nBased on this analysis, the legally permissible uses include industrial, warehouse, and related commercial development.',
  
  'hbu_physically_possible': '<b><u>SITE CHARACTERISTICS</u></b>\n\nThe subject site contains approximately 1.43 acres of generally level land with a regular, rectangular configuration. The site topography is level and at grade with the surrounding roadway, presenting no significant physical constraints to development. All public utilities including municipal water, sanitary sewer, electricity, natural gas, and telecommunications are available and connected to the site.\n\n<b><u>FLOOD ZONE AND ACCESS</u></b>\n\nThe property is located in Flood Zone X per FEMA mapping, indicating minimal flood risk with no special flood insurance requirements. The site has adequate frontage and direct access from a public right-of-way.\n\n<b><u>CONCLUSION</u></b>\n\nGiven these physical characteristics, the site is suitable for virtually any development permitted under the applicable zoning. Physically possible uses include any development compatible with the site size, shape, and utility availability.',
  
  'hbu_financially_feasible': '<b><u>MARKET CONDITIONS</u></b>\n\nCurrent market conditions indicate sustained demand for industrial and warehouse space in the subject market area. The submarket vacancy rate of approximately 5.2% is below the long-term historical average, indicating a healthy balance between supply and demand. Market rental rates for comparable industrial space range from $6.50 to $8.50 per square foot NNN, which would support new development at current construction costs.\n\n<b><u>DEVELOPMENT FEASIBILITY</u></b>\n\nDevelopment feasibility analysis indicates that new industrial construction would generate a positive residual land value, confirming financial feasibility. Market-derived capitalization rates for stabilized industrial properties range from 6.50% to 7.50%, reflecting investor confidence in the asset class.\n\n<b><u>CONCLUSION</u></b>\n\nBased on our analysis, industrial and warehouse development would be financially feasible, generating adequate return to justify development.',
  
  'hbu_maximally_productive': '<b><u>SYNTHESIS OF HIGHEST AND BEST USE TESTS</u></b>\n\nBased on our analysis of the four tests of highest and best use, it is our conclusion that the highest and best use of the subject site as if vacant is development with industrial or warehouse improvements. This conclusion synthesizes the legally permissible uses (industrial zoning), physically possible uses (adequate site size and utilities), and financially feasible uses (positive residual land value for industrial development).\n\n<b><u>MAXIMALLY PRODUCTIVE USE</u></b>\n\nAmong the legally permissible, physically possible, and financially feasible uses, industrial development would result in the highest land value. This conclusion is supported by the site\'s location within an established industrial corridor, adequate infrastructure, and strong market fundamentals.\n\n<b><u>CONCLUSION</u></b>\n\nTherefore, the highest and best use as vacant is development with industrial or warehouse improvements.',
  
  'hbu_as_improved': '<b><u>EXISTING IMPROVEMENTS</u></b>\n\nThe subject property is currently improved with a 11,174 square foot industrial warehouse building constructed in 2019. The existing improvements are consistent with and represent a reasonable approximation of the ideal improvement for the site given current market conditions and zoning. The improvements are in good condition with substantial remaining economic life and provide adequate functional utility for industrial users.\n\n<b><u>ALTERNATIVE USE ANALYSIS</u></b>\n\nWe considered alternative uses including renovation, conversion to alternative use, or demolition. Given the improvements\' modern construction, good condition, and functional utility, demolition and redevelopment is not economically justified. The contribution value of the improvements exceeds the cost to demolish and redevelop.\n\n<b><u>CONCLUSION</u></b>\n\nBased on this analysis, it is our conclusion that the highest and best use of the subject property as improved is continuation of its current use as an industrial warehouse facility.',

  // ===========================================
  // GRID-SPECIFIC AI PROMPTS (30-Year Appraiser Style)
  // Bold and underlined section headers for professional appearance
  // ===========================================
  
  'sales_comparison': `<b><u>SALES COMPARISON APPROACH - RECONCILIATION</u></b>

In developing the Sales Comparison Approach, I have analyzed recent transactions of properties considered most comparable to the subject. After 30 years in this profession, I can attest that this approach provides the most reliable indication of market value when sufficient comparable data exists.

<b><u>COMPARABLE SELECTION CRITERIA</u></b>

The sales selected represent the best available data, considering location, physical characteristics, and market conditions. Each transaction was verified to the extent possible to confirm arms-length status.

<b><u>ADJUSTMENT ANALYSIS</u></b>

Adjustments were applied for differences in property rights conveyed, financing terms, conditions of sale, market conditions, location, and physical characteristics. The adjustments reflect market-derived differences based on paired sales analysis and professional judgment developed over decades of practice.

<b><u>RECONCILIATION</u></b>

Greatest weight was given to the comparables requiring the least overall adjustment, as these properties most closely mirror the subject. The adjusted sale prices demonstrate a reasonable range, and the indicated value falls within market expectations.

<b><u>VALUE INDICATION VIA SALES COMPARISON APPROACH:</u></b> [Value to be inserted based on grid data]`,

  'land_valuation': `<b><u>LAND VALUATION - ANALYSIS AND RECONCILIATION</u></b>

The land value estimate was developed using the Sales Comparison Approach, which is the preferred methodology for vacant land when adequate comparable sales data is available.

<b><u>MARKET ANALYSIS</u></b>

The local land market has demonstrated stable conditions over the past 12-24 months. Demand for commercial and industrial land in this submarket remains moderate to strong, supported by continued regional economic growth and limited new land inventory.

<b><u>COMPARABLE LAND SALES</u></b>

I have analyzed recent sales of comparable land parcels, with adjustments made for differences in size, location, topography, utilities, zoning, and market conditions. After three decades of appraising land, these adjustments reflect my understanding of how buyers in this market value specific property characteristics.

<b><u>ADJUSTMENT RATIONALE</u></b>

Location adjustments reflect differences in access, visibility, and surrounding land uses. Size adjustments account for the fact that larger parcels typically sell at lower unit prices due to diminished buyer pool. Utility availability and cost to connect significantly impact land value. Level, usable land commands premium pricing compared to sloped or irregular parcels.

<b><u>LAND VALUE CONCLUSION</u></b>

Based on the adjusted comparable sales, the indicated land value reflects the most probable price the subject land would bring in a competitive market under current conditions.`,

  'rent_comparable': `<b><u>RENT COMPARABLE ANALYSIS - MARKET RENT CONCLUSION</u></b>

In estimating market rent for the subject property, I have analyzed comparable rental properties in the subject's competitive market area.

<b><u>RENTAL MARKET CONDITIONS</u></b>

The current rental market for commercial and industrial space reflects stable to improving conditions. Vacancy rates in the immediate area indicate balanced to landlord-favorable conditions, with quality space being absorbed at competitive rates.

<b><u>COMPARABLE RENTAL ANALYSIS</u></b>

The rentals selected represent properties that compete directly with the subject for tenants. Adjustments were made for differences in location, size, condition, amenities, and lease terms.

<b><u>KEY OBSERVATIONS</u></b>

Effective rental rates demonstrate a reasonable range consistent with the subject's quality and location. Most leases are structured on a triple net (NNN) or modified gross basis, with tenant improvement allowances reflecting current market standards. Concessions are minimal in the current market environment.

<b><u>MARKET RENT CONCLUSION</u></b>

Based on my analysis of comparable rentals and 30 years of experience in this market, the indicated market rent reflects the most probable rent the subject would command from a knowledgeable tenant in the current market.`,

  'expense_comparable': `<b><u>OPERATING EXPENSE ANALYSIS</u></b>

In developing the expense estimate for the subject property, I have analyzed comparable expense data from similar properties in the market.

<b><u>EXPENSE DATA SOURCES</u></b>

Expense comparables were selected from properties similar to the subject in terms of property type, size, age, and quality. Data was obtained from property managers, owners, and published surveys, and verified to the extent possible.

<b><u>EXPENSE CATEGORIES ANALYZED</u></b>

Real Estate Taxes are based on current assessment and mill levy. Insurance reflects current market rates for similar properties. Utilities, where applicable, are based on comparable consumption data. Repairs and Maintenance reflects typical expenditures for properties of this age and condition. Management is a market-standard percentage of effective gross income. Reserves for Replacement provides an appropriate allowance for long-lived components.

<b><u>EXPENSE COMPARISON</u></b>

The expense ratio for comparable properties demonstrates a reasonable range of effective gross income, with total expenses per square foot consistent with market expectations for this property type.

<b><u>EXPENSE CONCLUSION</u></b>

Based on the comparable data and my professional judgment developed over 30 years, the stabilized expenses for the subject property are estimated at levels consistent with market standards for similar properties.`,

  'multi_family': `<b><u>MULTI-FAMILY RENTAL APPROACH - ANALYSIS AND RECONCILIATION</u></b>

In developing the rental analysis for this multi-family property, I have applied the same rigorous methodology that has guided my 30-year career in real estate appraisal.

<b><u>MARKET OVERVIEW</u></b>

The multi-family market in this area has demonstrated stable to improving conditions. Vacancy rates for comparable properties remain at healthy levels, and rental rate trends have been stable to increasing over the past 12 months.

<b><u>RENTAL COMPARABLE ANALYSIS</u></b>

I have analyzed rental comparables representing properties that compete directly with the subject for tenants. These comparables were selected based on similarity in unit mix, age, condition, location, and amenities.

<b><u>ADJUSTMENT FACTORS</u></b>

Location adjustments account for differences in neighborhood quality and access. Unit size and configuration adjustments reflect bed/bath count and square footage comparisons. Condition and quality adjustments consider age, renovation status, and finish levels. Amenity adjustments account for parking, utilities included, and in-unit features. Property type adjustments consider building style and unit count.

<b><u>RENTAL RATE CONCLUSION</u></b>

Based on my analysis, the indicated market rental rates for the subject units reflect the most probable rents the units would achieve from typical tenants in the current market. The overall adjustment range supports confidence in these conclusions.`,

  'cost_approach': `<b><u>COST APPROACH - METHODOLOGY AND ANALYSIS</u></b>

The Cost Approach to value is based on the principle of substitution, which holds that a prudent investor would pay no more for a property than the cost to acquire a similar site and construct improvements of equal utility. After 30 years of applying this approach, I have developed reliable methods for estimating replacement cost new and appropriate depreciation.

<b><u>LAND VALUE</u></b>

The land value was estimated via the Sales Comparison Approach, analyzing recent sales of comparable vacant land parcels. After adjusting for differences in size, location, topography, utilities, and zoning, the indicated land value represents the most probable price the subject site would bring in a competitive market.

<b><u>IMPROVEMENT COST ESTIMATE</u></b>

The replacement cost new of the improvements was estimated using Marshall & Swift cost data, supplemented by local contractor estimates where applicable. The cost estimate reflects current construction costs for a building of similar quality, size, and utility. This includes direct costs (materials, labor, contractor overhead and profit) and indirect costs (architectural fees, permits, financing costs, and developer profit).

<b><u>DEPRECIATION ANALYSIS</u></b>

Physical depreciation was estimated based on the actual age, effective age, and remaining economic life of the improvements. The observed condition of the improvements was considered in this analysis. Functional obsolescence, if any, was analyzed for curable and incurable items affecting utility. External obsolescence was considered based on market conditions and locational factors that might affect value.

<b><u>VALUE INDICATION</u></b>

The Cost Approach value indication is derived by adding the depreciated improvement value to the land value. This approach is particularly relevant for newer construction, special-purpose properties, and as a check on other valuation approaches.

<b><u>COST APPROACH CONCLUSION</u></b>

Based on my analysis and professional judgment developed over three decades of practice, the Cost Approach provides a reliable indication of value that is well-supported by the underlying data and methodology.`,

  'market_analysis': `<b><u>MARKET ANALYSIS - OVERVIEW AND TRENDS</u></b>

A thorough understanding of market conditions is essential to the valuation process. Drawing on 30 years of experience analyzing real estate markets, I have examined the supply, demand, and pricing trends that affect the subject property type in this market area.

<b><u>MARKET AREA DEFINITION</u></b>

The subject's market area encompasses the competitive area from which demand originates and within which alternative properties exist. This area is defined by geographic boundaries, transportation patterns, and the typical search area of market participants for properties of this type. The delineation considers both physical and economic factors that influence market behavior.

<b><u>SUPPLY AND DEMAND ANALYSIS</u></b>

Current market conditions reflect a balance between supply and demand. The existing inventory consists of properties that compete directly with the subject for tenants or buyers. New construction activity has been measured, with deliveries pacing appropriately with absorption. The pipeline of proposed and under-construction projects indicates continued but disciplined development activity.

<b><u>VACANCY AND ABSORPTION TRENDS</u></b>

The current vacancy rate for comparable properties is at healthy levels relative to historical averages. Absorption trends over the past 12-24 months have been positive, with net absorption exceeding new deliveries. This trend supports stable to improving market conditions and suggests that the subject property should lease or sell within typical market timeframes.

<b><u>RENTAL RATE AND PRICING TRENDS</u></b>

Rental rates for comparable properties have demonstrated stability with modest upward pressure in recent periods. Landlords report consistent tenant demand and limited concessions compared to prior market cycles. Sale prices per square foot have remained stable, and capitalization rates reflect investor confidence in the asset class. These trends are consistent with a balanced to landlord-favorable market environment.

<b><u>MARKET OUTLOOK</u></b>

Based on my analysis of current conditions and leading indicators, the market outlook is stable to positive over the near to intermediate term. Economic fundamentals support continued demand, and the supply pipeline appears appropriately calibrated. These conditions provide a favorable environment for the subject property and support the values indicated by the valuation approaches applied in this analysis.`,

  // ===========================================
  // SITE DETAILS AI TEMPLATES
  // =========================================== 

  'water_source': `<b><u>WATER SERVICE</u></b>

City water service is provided by the municipal water department. The water main connection is located along the frontage road and provides adequate capacity for the current and anticipated uses.

<b><u>SERVICE ADEQUACY</u></b>

Based on our inspection and inquiry, the water service appears adequate for the current use with no observable deficiencies. Water pressure and volume are sufficient for the property's requirements including fire suppression needs if applicable.

<b><u>CONCLUSION</u></b>

No water service deficiencies were identified that would adversely affect the subject property's utility or value.`,

  'sewer_type': `<b><u>SANITARY SEWER SERVICE</u></b>

The property is connected to municipal sanitary sewer service provided by the city's public works department. The sewer connection is via a lateral line extending to the main trunk line located in the adjacent right-of-way.

<b><u>SYSTEM ADEQUACY</u></b>

The sewer system appears adequate for the current use with no observable deficiencies. The sanitary sewer infrastructure in this area has sufficient capacity to accommodate the subject property and surrounding development.

<b><u>CONCLUSION</u></b>

No sewer service deficiencies were identified that would adversely affect the subject property's utility or value.`,

  'electric': `<b><u>ELECTRIC SERVICE</u></b>

Electric service is provided by the local utility company with primary service extending from utility poles along the property frontage. The service appears to be adequate three-phase power suitable for industrial/commercial applications.

<b><u>SERVICE CHARACTERISTICS</u></b>

Based on our inspection, the electrical system appears to be in functional condition consistent with the age and type of improvements. The service capacity appears adequate for the current and reasonably anticipated uses.

<b><u>CONCLUSION</u></b>

No electrical service deficiencies were identified that would adversely affect the subject property's utility or value.`,

  'natural_gas': `<b><u>NATURAL GAS SERVICE</u></b>

Natural gas service is available and connected to the property. The gas service is provided by the local utility and appears adequate for heating requirements and any industrial processes requiring natural gas.

<b><u>CONCLUSION</u></b>

Natural gas availability is consistent with surrounding properties in this industrial area and supports the property's utility for its current use.`,

  'telecom': `<b><u>TELECOMMUNICATIONS</u></b>

Telecommunications services including telephone, internet, and cable television are available to the property. Multiple telecommunications providers service this area, providing options for high-speed internet and business-class communications.

<b><u>CONCLUSION</u></b>

Telecommunications infrastructure is adequate for modern business operations and supports the property's utility for commercial and industrial uses.`,

  'access_visibility': `<b><u>ACCESS AND VISIBILITY</u></b>

Access to the subject site is provided via a paved approach from the adjacent roadway. The approach provides adequate ingress and egress for passenger vehicles, delivery trucks, and other commercial traffic. The turning radius appears adequate for larger commercial vehicles.

<b><u>VISIBILITY</u></b>

The property has good visibility from the adjacent roadway. The site's visibility is enhanced by its location and the relative absence of visual obstructions from neighboring properties or landscaping.

<b><u>TRAFFIC AND CIRCULATION</u></b>

Traffic patterns in the immediate area are consistent with the industrial/commercial character of the neighborhood. Peak hour traffic does not appear to significantly impact access to the subject property.

<b><u>CONCLUSION</u></b>

The property's access and visibility characteristics are competitive with comparable properties in the market area and support the property's utility for its current and intended use.`,

  'site_improvements': `<b><u>SITE IMPROVEMENTS</u></b>

Site improvements include paved parking and circulation areas, exterior lighting, and perimeter security features. The improvements appear to be in average to good condition consistent with the age of the overall development.

<b><u>PAVING</u></b>

Paved areas consist of asphalt paving providing parking stalls for employees and visitors, as well as circulation and loading areas. The paving exhibits normal wear consistent with age but appears to be adequately maintained.

<b><u>LIGHTING AND SECURITY</u></b>

Exterior lighting is provided throughout the site for safety and security. Perimeter fencing provides security for the property and controlled access to yard and storage areas.

<b><u>CONCLUSION</u></b>

The site improvements are consistent with market expectations for this property type and contribute positively to the property's utility and marketability.`,

  'paving': `<b><u>PAVING</u></b>

The paved areas consist of asphalt paving in average condition. The pavement provides adequate parking and circulation for the property's current use. Minor surface wear including hairline cracking and minor patching is observed, consistent with normal wear for the age of the improvements.

<b><u>CONCLUSION</u></b>

The paving appears to have adequate remaining useful life and requires only routine maintenance at this time.`,

  'fencing': `<b><u>FENCING</u></b>

The property is secured with fencing around the perimeter. The fencing appears to be in average condition and provides adequate security for the site including protection of any yard storage or outdoor work areas.

<b><u>CONCLUSION</u></b>

The fencing contributes to the property's security and is consistent with similar properties in the market area.`,

  'flood_zone': `<b><u>FLOOD ZONE DETERMINATION</u></b>

According to the Federal Emergency Management Agency (FEMA) Flood Insurance Rate Map (FIRM), the subject site is located in Flood Zone X, which is defined as an area determined to be outside the 0.2% annual chance (500-year) floodplain.

<b><u>FLOOD INSURANCE REQUIREMENTS</u></b>

Properties located in Flood Zone X are not required to carry flood insurance as a condition of federally regulated financing, although flood insurance may still be obtained if desired.

<b><u>CONCLUSION</u></b>

The subject site does not appear to have significant flood risk, and no special flood hazard insurance is required. This flood zone determination is subject to change based on future FEMA map revisions.`,

  'site_description_full': `<b><u>SITE DESCRIPTION</u></b>

The subject site is located on the property identified in the legal description, containing approximately [acres] acres ([square feet] square feet) of land with a generally [shape] configuration.

<b><u>ACCESS AND FRONTAGE</u></b>

The site has [frontage description] of frontage providing [access quality] access. A [approach type] approach provides ingress and egress for vehicles, with adequate turning radius for truck and delivery traffic. Site visibility is [visibility rating] from the adjacent roadway.

<b><u>TOPOGRAPHY AND DRAINAGE</u></b>

The site topography is [topography], presenting no significant constraints to development or site utilization. Drainage appears [drainage] with no evidence of standing water or drainage problems observed during our inspection.

<b><u>UTILITIES</u></b>

Utilities available to the site include [water source] water, [sewer type] sewer, electricity, natural gas, and telecommunications. All utility services appear adequate for the current and anticipated uses. No utility deficiencies were observed.

<b><u>FLOOD ZONE</u></b>

According to FEMA Flood Insurance Rate Map, the subject site is located in [FEMA zone]. [Flood insurance statement based on zone].

<b><u>SITE IMPROVEMENTS</u></b>

Site improvements include [paving type] paving, exterior lighting, and [fencing type] fencing. [Yard/storage and landscaping descriptions]. The improvements appear to be in [condition] condition consistent with the age of development.

<b><u>ENVIRONMENTAL</u></b>

[Environmental status statement]. No obvious signs of environmental contamination were observed during our physical inspection.

<b><u>EASEMENTS AND ENCROACHMENTS</u></b>

[Easements description, or "No adverse easements or encroachments were identified that would adversely affect value."]

<b><u>CONCLUSION</u></b>

Overall, the site is well-suited for its current use and presents no significant adverse characteristics that would negatively impact value or marketability.`,

  'default': 'This section contains professionally written appraisal content that follows USPAP guidelines and industry best practices. The content should be reviewed and modified as appropriate for the specific assignment.'
};

// ==========================================
// MAIN COMPONENT
// ==========================================
export default function EnhancedTextArea({
  id,
  label,
  value,
  onChange,
  placeholder = '',
  rows = 4,
  sectionContext = 'default',
  helperText,
  required = false,
  minHeight: propMinHeight,
  contextData,
  additionalContext,
  aiInstructions,
  fieldPath,
}: EnhancedTextAreaProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiPreview, setAIPreview] = useState<AIPreview>({ content: '', isVisible: false });
  const [isFocused, setIsFocused] = useState(false);
  
  // Get wizard context for AI generation (safely - may not be in provider)
  let wizardState: any = null;
  let hasFieldSource: ((fieldPath: string) => boolean) | null = null;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const wizardContext = useWizard();
    wizardState = wizardContext?.state;
    hasFieldSource = wizardContext?.hasFieldSource || null;
  } catch {
    // Not in WizardProvider - that's ok, we'll use fallbacks
  }

  // Sync editor content with value prop
  // Convert newlines to <br> for proper display in contentEditable
  useEffect(() => {
    if (editorRef.current) {
      // Always convert \n to <br> for display (works with or without HTML)
      const formattedValue = value.replace(/\n/g, '<br>');
      
      if (editorRef.current.innerHTML !== formattedValue) {
        editorRef.current.innerHTML = formattedValue;
      }
    }
  }, [value]);

  // Calculate word/character count
  const text = value.replace(/<[^>]*>/g, '').trim();
  const wordCount = text ? text.split(/\s+/).length : 0;
  const charCount = text.length;

  // Track formatting state for active button highlighting
  const [formatState, setFormatState] = useState({
    bold: false,
    italic: false,
    underline: false,
    unorderedList: false,
    orderedList: false,
    alignLeft: true,
    alignCenter: false,
    alignRight: false,
  });

  // Update formatting state based on current selection
  const updateFormatState = useCallback(() => {
    const isAlignCenter = document.queryCommandState('justifyCenter');
    const isAlignRight = document.queryCommandState('justifyRight');
    const isAlignJustify = document.queryCommandState('justifyFull');
    
    // If no explicit alignment is detected, default to left
    // This prevents false positives
    const isAlignLeft = document.queryCommandState('justifyLeft') || 
                        (!isAlignCenter && !isAlignRight && !isAlignJustify);
    
    setFormatState({
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline'),
      unorderedList: document.queryCommandState('insertUnorderedList'),
      orderedList: document.queryCommandState('insertOrderedList'),
      alignLeft: isAlignLeft && !isAlignCenter && !isAlignRight,
      alignCenter: isAlignCenter,
      alignRight: isAlignRight,
    });
  }, []);

  // Listen for selection changes to update format state
  useEffect(() => {
    const handleSelectionChange = () => {
      if (editorRef.current && document.activeElement === editorRef.current) {
        updateFormatState();
      }
    };
    
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, [updateFormatState]);

  // Store selection range to restore after button click
  const savedSelectionRef = useRef<Range | null>(null);
  
  // Save current selection
  const saveSelection = useCallback(() => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0 && editorRef.current?.contains(selection.anchorNode)) {
      savedSelectionRef.current = selection.getRangeAt(0).cloneRange();
    }
  }, []);
  
  // Save selection on mouse/key up within editor (before potential button click)
  const handleEditorMouseUp = useCallback(() => {
    saveSelection();
  }, [saveSelection]);

  // Execute formatting command
  const execCommand = useCallback((command: string, value: string | undefined = undefined) => {
    const editor = editorRef.current;
    if (!editor) return;
    
    // Ensure editor is focused first
    editor.focus();
    
    // Restore saved selection
    const selection = window.getSelection();
    if (savedSelectionRef.current && selection) {
      try {
        selection.removeAllRanges();
        selection.addRange(savedSelectionRef.current);
      } catch (e) {
        // Selection might be invalid, that's ok
      }
    }
    
    // For list commands, if there's no selection, place cursor at end
    const isListCommand = command === 'insertUnorderedList' || command === 'insertOrderedList';
    
    if (isListCommand && (!selection || selection.rangeCount === 0 || selection.isCollapsed)) {
      // If editor is empty, add a zero-width space to have something to work with
      if (!editor.textContent || editor.textContent.trim() === '') {
        editor.innerHTML = '<br>';
        const range = document.createRange();
        range.selectNodeContents(editor);
        range.collapse(false);
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
    }
    
    // Execute the command
    document.execCommand(command, false, value);
    
    // For list commands, ensure left alignment is applied
    if (isListCommand) {
      document.execCommand('justifyLeft', false, undefined);
    }
    
    // Save the new selection state
    saveSelection();
    
    // Update format state after command
    setTimeout(updateFormatState, 10);
    
    // Update parent state
    onChange(editor.innerHTML);
  }, [onChange, updateFormatState, saveSelection]);

  // Handle editor input
  const handleInput = useCallback(() => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  // Generate AI content - calls backend API when available, falls back to simulated
  const generateAI = useCallback(async () => {
    setIsGeneratingAI(true);
    
    try {
      // Build context from wizard state if available
      let apiContext: AIGenerationContext = {};
      
      // FIX #49: Add fallback if context building fails
      if (wizardState) {
        try {
          // Use the enhanced context builder for comprehensive data extraction
          apiContext = buildEnhancedContextForAI(wizardState, sectionContext);
          
          // Check if context builder returned an error
          if ((apiContext as any).error) {
            console.warn('Context builder returned error:', (apiContext as any).message);
            // Continue with minimal context
            apiContext = {
              propertyType: wizardState.propertyType || 'Commercial',
              siteData: {
                city: wizardState.subjectData?.address?.city || '',
                state: wizardState.subjectData?.address?.state || '',
              },
            };
          }
          
          // Merge any additional context passed via props
          if (contextData) {
            apiContext = { ...apiContext, ...contextData };
          }
        } catch (contextError) {
          // FIX #49: If context building fails, use minimal fallback
          console.error('Failed to build context:', contextError);
          apiContext = {
            propertyType: wizardState.propertyType || 'Commercial',
            siteData: {
              city: wizardState.subjectData?.address?.city || 'Not specified',
              state: wizardState.subjectData?.address?.state || 'Not specified',
            },
          };
        }
      } else if (contextData) {
        apiContext = contextData as AIGenerationContext;
      }
      
      // Merge additional context if provided
      if (additionalContext) {
        apiContext = { ...apiContext, ...additionalContext };
      }
      
      // Try to call the backend API using the new AI service
      try {
        const content = await generateAIDraft(
          sectionContext,
          apiContext,
          value || undefined,  // Pass existing text for improvement
          aiInstructions || undefined  // Pass custom instructions if provided
        );
        
        if (content) {
          setAIPreview({ content, isVisible: true });
          setIsGeneratingAI(false);
          return;
        }
      } catch (apiError) {
        console.warn('AI API not available, using simulated response:', apiError);
      }
      
      // Fall back to simulated responses if API fails
      const draft = SimulatedAIDrafts[sectionContext] || SimulatedAIDrafts.default;
      setAIPreview({ content: draft, isVisible: true });
    } catch (error) {
      console.warn('AI generation failed, using simulated response:', error);
      // Fall back to simulated responses
      const draft = SimulatedAIDrafts[sectionContext] || SimulatedAIDrafts.default;
      setAIPreview({ content: draft, isVisible: true });
    }
    
    setIsGeneratingAI(false);
  }, [sectionContext, contextData, wizardState, value, additionalContext, aiInstructions]);

  // Accept AI draft
  const acceptAI = useCallback(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = aiPreview.content.replace(/\n/g, '<br>');
      onChange(editorRef.current.innerHTML);
    }
    setAIPreview({ content: '', isVisible: false });
  }, [aiPreview.content, onChange]);

  // Reject AI draft
  const rejectAI = useCallback(() => {
    setAIPreview({ content: '', isVisible: false });
  }, []);

  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev);
  }, []);

  // Calculate fullscreen positioning to account for sidebars
  const [fullscreenStyle, setFullscreenStyle] = useState<React.CSSProperties>({});
  
  useEffect(() => {
    if (isFullscreen) {
      // Find the guidance sidebar (typically has data attribute or specific class)
      const rightSidebar = document.querySelector('aside') as HTMLElement;
      const leftSidebar = document.querySelector('[class*="sidebar"]') as HTMLElement;
      
      // Calculate available width
      const viewportWidth = window.innerWidth;
      const rightSidebarWidth = rightSidebar ? rightSidebar.offsetWidth : 0;
      const leftSidebarWidth = leftSidebar ? leftSidebar.offsetWidth : 0;
      
      // Calculate center point of the available content area
      const availableWidth = viewportWidth - rightSidebarWidth - leftSidebarWidth;
      const contentCenterX = leftSidebarWidth + (availableWidth / 2);
      
      // Use 90% of available width, max 1200px
      const modalWidth = Math.min(availableWidth * 0.9, 1200);
      
      setFullscreenStyle({
        position: 'fixed',
        top: '50%',
        left: `${contentCenterX}px`,
        transform: 'translate(-50%, -50%)',
        width: `${modalWidth}px`,
        height: '85vh',
        maxHeight: '85vh',
        zIndex: 50,
      });
    }
  }, [isFullscreen]);

  // Close fullscreen on Escape and handle resize
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    
    const handleResize = () => {
      if (isFullscreen) {
        // Trigger recalculation
        setIsFullscreen(false);
        setTimeout(() => setIsFullscreen(true), 0);
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('keydown', handleEscape);
      window.removeEventListener('resize', handleResize);
    };
  }, [isFullscreen]);

  const minHeight = propMinHeight || rows * 28;

  return (
    <>
      {/* Fullscreen Overlay */}
      {isFullscreen && (
        <div className="fixed inset-0 bg-black/60 z-40" onClick={toggleFullscreen} />
      )}
      
      <div 
        className={`relative ${isFullscreen 
          ? 'bg-surface-1 dark:bg-elevation-1 rounded-2xl shadow-2xl p-8 flex flex-col overflow-hidden' 
          : ''
        }`}
        style={isFullscreen ? fullscreenStyle : undefined}
      >
        {/* Label Row */}
        <div className="flex items-center justify-between mb-2">
          <label htmlFor={id} className={`block font-medium text-harken-gray dark:text-slate-200 ${isFullscreen ? 'text-lg' : 'text-sm'} flex items-center gap-2`}>
            {label}
            {required && <span className="text-harken-error ml-1">*</span>}
            {fieldPath && hasFieldSource && hasFieldSource(fieldPath) && (
              <DocumentSourceIndicator fieldPath={fieldPath} />
            )}
          </label>
        </div>

        {/* Toolbar */}
        <div className={`flex flex-wrap items-center gap-1 bg-harken-gray-light dark:bg-elevation-1 border border-light-border dark:border-harken-gray rounded-t-xl ${isFullscreen ? 'p-4 gap-2' : 'p-2'}`}>
          {/* History */}
          <div className="flex items-center gap-0.5 pr-2 border-r border-light-border dark:border-harken-gray">
            <ToolbarButton icon={<Undo className="w-4 h-4" />} onClick={() => execCommand('undo')} title="Undo" />
            <ToolbarButton icon={<Redo className="w-4 h-4" />} onClick={() => execCommand('redo')} title="Redo" />
          </div>

          {/* Text Formatting */}
          <div className="flex items-center gap-0.5 px-2 border-r border-light-border dark:border-harken-gray">
            <ToolbarButton icon={<Bold className="w-4 h-4" />} onClick={() => execCommand('bold')} title="Bold (Ctrl+B)" active={formatState.bold} />
            <ToolbarButton icon={<Italic className="w-4 h-4" />} onClick={() => execCommand('italic')} title="Italic (Ctrl+I)" active={formatState.italic} />
            <ToolbarButton icon={<Underline className="w-4 h-4" />} onClick={() => execCommand('underline')} title="Underline (Ctrl+U)" active={formatState.underline} />
          </div>

          {/* Alignment */}
          <div className="flex items-center gap-0.5 px-2 border-r border-light-border dark:border-harken-gray">
            <ToolbarButton icon={<AlignLeft className="w-4 h-4" />} onClick={() => execCommand('justifyLeft')} title="Align Left" active={formatState.alignLeft} />
            <ToolbarButton icon={<AlignCenter className="w-4 h-4" />} onClick={() => execCommand('justifyCenter')} title="Align Center" active={formatState.alignCenter} />
            <ToolbarButton icon={<AlignRight className="w-4 h-4" />} onClick={() => execCommand('justifyRight')} title="Align Right" active={formatState.alignRight} />
          </div>

          {/* Lists */}
          <div className="flex items-center gap-0.5 px-2 border-r border-light-border dark:border-harken-gray">
            <ToolbarButton icon={<List className="w-4 h-4" />} onClick={() => execCommand('insertUnorderedList')} title="Bullet List" active={formatState.unorderedList} />
            <ToolbarButton icon={<ListOrdered className="w-4 h-4" />} onClick={() => execCommand('insertOrderedList')} title="Numbered List" active={formatState.orderedList} />
          </div>

          {/* AI Draft - Pushed to right */}
          <div className="flex items-center gap-2 px-2 ml-auto">
            <button
              type="button"
              onClick={generateAI}
              disabled={isGeneratingAI}
              className="h-7 px-3 text-xs font-medium text-white bg-gradient-to-r from-[#4db8d1] to-[#7fcce0] rounded-md hover:from-[#3da8c1] hover:to-[#6fc0d4] flex items-center gap-1.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {isGeneratingAI ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  AI Draft
                </>
              )}
            </button>
          </div>

          {/* Fullscreen Toggle */}
          <div>
            <ToolbarButton 
              icon={isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />} 
              onClick={toggleFullscreen} 
              title={isFullscreen ? 'Exit Fullscreen (Esc)' : 'Fullscreen'} 
            />
          </div>
        </div>

        {/* Editor */}
        <div 
          ref={editorRef}
          id={id}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onMouseUp={handleEditorMouseUp}
          onKeyUp={saveSelection}
          data-placeholder={placeholder}
          className={`
            w-full border border-light-border dark:border-harken-gray border-t-0 rounded-b-xl bg-surface-1 dark:bg-elevation-1
            text-harken-gray dark:text-slate-200 leading-relaxed
            focus:outline-none focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent
            overflow-y-auto
            ${isFullscreen ? 'flex-1 p-8 text-lg leading-loose' : 'p-4 text-sm'}
            ${!value && !isFocused ? 'empty-placeholder' : ''}
          `}
          style={{ minHeight: isFullscreen ? '500px' : `${minHeight}px` }}
        />

        {/* Footer: Word Count & Helper Text */}
        <div className="flex items-center justify-between mt-2">
          {helperText && (
            <p className="text-xs text-harken-gray-med flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-harken-gray-med" />
              {helperText}
            </p>
          )}
          <p className="text-xs text-harken-gray-med ml-auto">
            {wordCount} words, {charCount} characters
          </p>
        </div>

        {/* AI Preview */}
        {aiPreview.isVisible && (
          <div className={`mt-3 p-4 bg-accent-teal-mint-light border border-accent-teal-mint rounded-xl animate-fade-in ${
            isFullscreen ? 'max-h-[40vh] flex flex-col' : ''
          }`}>
            <div className="flex items-center justify-between mb-3 flex-shrink-0">
              <span className="text-xs font-semibold text-accent-teal-mint flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                AI Generated Draft
              </span>
              <div className="flex gap-2">
                <button
                  onClick={acceptAI}
                  className="px-3 py-1 text-xs font-medium text-white bg-accent-teal-mint rounded-md hover:bg-accent-teal-mint flex items-center gap-1 transition-colors"
                >
                  <Check className="w-3 h-3" />
                  Accept
                </button>
                <button
                  onClick={rejectAI}
                  className="px-3 py-1 text-xs font-medium text-harken-gray dark:text-slate-200 bg-surface-1 dark:bg-elevation-1 border border-light-border dark:border-harken-gray rounded-md hover:bg-harken-gray-light dark:hover:bg-harken-gray flex items-center gap-1 transition-colors"
                >
                  <X className="w-3 h-3" />
                  Reject
                </button>
              </div>
            </div>
            <div className={`${isFullscreen ? 'overflow-y-auto flex-1 pr-2' : ''}`}>
              <p className={`text-sm text-harken-gray leading-relaxed whitespace-pre-wrap ${
                isFullscreen ? 'text-base' : ''
              }`}>
                {aiPreview.content}
              </p>
            </div>
          </div>
        )}

      </div>

      {/* Global Styles */}
      <style>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          font-style: italic;
          pointer-events: none;
        }
        [contenteditable]:focus:empty:before {
          content: '';
        }
        [contenteditable] ul {
          list-style-type: disc;
          padding-left: 1.5rem;
          margin: 0.5rem 0;
          text-align: left;
        }
        [contenteditable] ol {
          list-style-type: decimal;
          padding-left: 1.5rem;
          margin: 0.5rem 0;
          text-align: left;
        }
        [contenteditable] li {
          margin: 0.25rem 0;
          text-align: left;
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}

// ==========================================
// TOOLBAR BUTTON COMPONENT
// ==========================================
function ToolbarButton({ 
  icon, 
  onClick, 
  title,
  active = false 
}: { 
  icon: React.ReactNode; 
  onClick: () => void; 
  title: string;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      // Use onMouseDown with preventDefault to prevent focus loss from editor
      onMouseDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
      title={title}
      className={`
        w-8 h-8 flex items-center justify-center rounded-md transition-all cursor-pointer
        ${active 
          ? 'bg-[#0da1c7]/20 text-[#0da1c7] ring-2 ring-[#0da1c7] ring-offset-1 ring-offset-surface-1 dark:ring-offset-elevation-1' 
          : 'text-harken-gray-med hover:text-harken-gray hover:bg-harken-gray-light dark:hover:bg-elevation-2'
        }
      `}
    >
      {icon}
    </button>
  );
}
