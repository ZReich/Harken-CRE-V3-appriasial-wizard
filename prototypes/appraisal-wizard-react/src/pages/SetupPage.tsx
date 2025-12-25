import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import WizardLayout from '../components/WizardLayout';
import EnhancedTextArea from '../components/EnhancedTextArea';
import WizardGuidancePanel from '../components/WizardGuidancePanel';
import PropertyLookupModal from '../components/PropertyLookupModal';
import { useWizard } from '../context/WizardContext';
import { Trash2, Plus, Lock, Search, Loader2, CheckCircle, MapPin, AlertCircle } from 'lucide-react';
import type { CadastralData } from '../types/api';
import { getPropertyData, getLookupCostInfo, type PropertyLookupResult } from '../services/propertyDataRouter';
import {
  ClipboardCheckIcon,
  ScaleIcon,
  IdentificationIcon,
  EyeIcon,
  BadgeCheckIcon,
  CommercialIcon,
  ResidentialIcon,
  LandIcon,
  ChartIcon,
  CurrencyIcon,
  ConstructionIcon,
} from '../components/icons';
import { SidebarTab } from '../components/SidebarTab';
import { SectionProgressSummary } from '../components/SectionProgressSummary';
import { useCompletion } from '../hooks/useCompletion';
import { useCelebration } from '../hooks/useCelebration';
import { useSmartContinue } from '../hooks/useSmartContinue';
import { getSetupGuidance } from '../constants/setupGuidance';

// ==========================================
// SETUP TAB CONFIGURATION
// ==========================================
const setupTabs = [
  { id: 'basics', label: 'Assignment Basics', Icon: ClipboardCheckIcon },
  { id: 'purpose', label: 'Purpose & Scope', Icon: ScaleIcon },
  { id: 'property', label: 'Property ID', Icon: IdentificationIcon },
  { id: 'inspection', label: 'Inspection', Icon: EyeIcon },
  { id: 'certifications', label: 'Certifications', Icon: BadgeCheckIcon },
];

// ==========================================
// PROPERTY TYPE OPTIONS
// ==========================================
const propertyTypes = [
  { 
    id: 'commercial', 
    label: 'Commercial', 
    description: 'Office, Retail, Industrial',
    Icon: CommercialIcon 
  },
  { 
    id: 'residential', 
    label: 'Residential', 
    description: '1-4 Family, Condo',
    Icon: ResidentialIcon 
  },
  { 
    id: 'land', 
    label: 'Land', 
    description: 'Vacant, Subdivided',
    Icon: LandIcon 
  },
];

// ==========================================
// PROPERTY SUBTYPES
// ==========================================
const propertySubtypes: Record<string, Array<{ id: string; name: string; description: string }>> = {
  commercial: [
    { id: 'office', name: 'Office', description: 'CBD, Suburban, Medical' },
    { id: 'retail', name: 'Retail', description: 'Strip Center, Mall, Standalone' },
    { id: 'industrial', name: 'Industrial', description: 'Warehouse, Manufacturing, Flex' },
    { id: 'multifamily', name: 'Multi-Family (5+)', description: 'Apartment Complex, 5+ Units' },
    { id: 'mixeduse', name: 'Mixed-Use', description: 'Residential + Commercial' },
    { id: 'hospitality', name: 'Hospitality', description: 'Hotel, Motel, Resort' },
  ],
  residential: [
    { id: 'singlefamily', name: 'Single Family', description: 'Detached Residence' },
    { id: 'condo', name: 'Condo', description: 'Individual Unit Ownership' },
    { id: 'townhome', name: 'Townhome', description: 'Attached Residence' },
    { id: '2-4unit', name: '2-4 Unit', description: 'Small Multi-Family' },
  ],
  land: [
    { id: 'vacant', name: 'Vacant Land', description: 'Undeveloped Parcel' },
    { id: 'reslot', name: 'Residential Lot', description: 'Buildable Lot, Subdivision' },
    { id: 'commsite', name: 'Commercial Site', description: 'Development Ready' },
    { id: 'agricultural', name: 'Agricultural', description: 'Farm, Ranch, Orchard' },
  ],
};

// ==========================================
// PROPERTY STATUS OPTIONS
// ==========================================
const propertyStatusOptions = [
  { value: 'existing', label: 'Existing / Completed', description: 'Property is built and operational' },
  { value: 'under_construction', label: 'Under Construction', description: 'Currently being built or renovated' },
  { value: 'proposed', label: 'Proposed / Not Yet Started', description: 'Plans exist but construction has not begun' },
  { value: 'recently_completed', label: 'Recently Completed', description: 'Finished within the last 12 months' },
];

// ==========================================
// PLANNED CHANGES OPTIONS
// ==========================================
const plannedChangesOptions = [
  { value: 'none', label: 'No planned changes', description: 'Property will remain as-is' },
  { value: 'minor', label: 'Minor repairs/updates', description: 'Less than 10% of property value' },
  { value: 'major', label: 'Major renovation or expansion', description: 'Significant capital improvements planned' },
  { value: 'change_of_use', label: 'Change of use / Conversion', description: 'Property will be converted to different use' },
];

// ==========================================
// OCCUPANCY STATUS OPTIONS
// ==========================================
const occupancyStatusOptions = [
  { value: 'stabilized', label: 'Stabilized (>90% occupied)', description: 'At or near market occupancy' },
  { value: 'lease_up', label: 'In lease-up phase', description: 'Currently filling vacancies' },
  { value: 'vacant', label: 'Vacant or under-occupied', description: 'Below 70% occupied' },
  { value: 'not_applicable', label: 'N/A (owner-occupied)', description: 'Not an income property' },
];

// ==========================================
// LOAN PURPOSE OPTIONS
// ==========================================
const loanPurposeOptions = [
  { value: 'purchase', label: 'Purchase financing', description: 'Acquisition of existing property' },
  { value: 'refinance', label: 'Refinance', description: 'Refinancing existing debt' },
  { value: 'construction', label: 'Construction loan', description: 'Financing new construction' },
  { value: 'bridge', label: 'Bridge / interim financing', description: 'Short-term financing, often for value-add' },
  { value: 'internal', label: 'Internal / portfolio review', description: 'Not for lending purposes' },
];

// ==========================================
// PURPOSE & SCOPE OPTIONS
// ==========================================
const appraisalPurposeOptions = [
  { value: 'market_value', label: 'Market Value', description: 'Most probable selling price in open market' },
  { value: 'insurable_value', label: 'Insurable Value', description: 'Replacement cost for insurance purposes' },
  { value: 'liquidation_value', label: 'Liquidation Value', description: 'Value under forced or distressed sale' },
  { value: 'investment_value', label: 'Investment Value', description: 'Value to a specific investor' },
];

const propertyInterestOptions = [
  { value: 'fee_simple', label: 'Fee Simple', description: 'Full ownership rights, subject only to government powers' },
  { value: 'leased_fee', label: 'Leased Fee', description: "Landlord's interest when property is leased" },
  { value: 'leasehold', label: 'Leasehold', description: "Tenant's interest under a lease agreement" },
  { value: 'partial_interest', label: 'Partial Interest', description: 'Fractional ownership or undivided interest' },
];

// ==========================================
// APPROACH OPTIONS
// ==========================================
const approachOptions = [
  { key: 'Sales Comparison', label: 'Sales Comparison', Icon: ChartIcon },
  { key: 'Cost Approach', label: 'Cost Approach', Icon: ConstructionIcon },
  { key: 'Income Approach', label: 'Income Approach', Icon: CurrencyIcon },
  { key: 'Land Valuation', label: 'Land Valuation', Icon: LandIcon },
  { key: 'Multi-Family Approach', label: 'Multi-Family', Icon: ResidentialIcon },
];

// ==========================================
// SCENARIO INTERFACE
// ==========================================
interface Scenario {
  id: number;
  name: string;
  nameSelect: string;
  customName: string;
  approaches: string[];
  isRequired?: boolean;
  requirementSource?: string;
  effectiveDate?: string;
}

// ==========================================
// ASSIGNMENT CONTEXT INTERFACE
// ==========================================
interface AssignmentContext {
  propertyType: string | null;
  subType: string | null;
  propertyStatus: string | null;
  plannedChanges: string | null;
  occupancyStatus: string | null;
  loanPurpose: string | null;
  appraisalPurpose: string | null;
  propertyInterest: string | null;
  intendedUsers: string;
}

// ==========================================
// SCENARIO DETERMINATION LOGIC
// ==========================================
function getDefaultApproachesForScenario(scenarioName: string, propertyType: string | null, subType: string | null): string[] {
  const approaches: string[] = [];
  
  // Check if this is a multi-family property type
  const isMultiFamily = subType === 'multifamily' || subType === '2-4unit' || 
                        subType?.includes('multifamily') || subType?.includes('2-4unit') ||
                        subType?.includes('apartment');
  
  // Multi-Family properties get Multi-Family Approach automatically
  if (isMultiFamily) {
    approaches.push('Multi-Family Approach');
    approaches.push('Income Approach'); // Also include standard income
    approaches.push('Sales Comparison');
    if (scenarioName === 'As Completed' || scenarioName === 'As Proposed') {
      approaches.push('Cost Approach', 'Land Valuation');
    }
  } else if (propertyType === 'commercial') {
    approaches.push('Sales Comparison', 'Income Approach');
    if (scenarioName === 'As Completed' || scenarioName === 'As Proposed') {
      approaches.push('Cost Approach', 'Land Valuation'); // Cost Approach requires Land Valuation
    }
  } else if (propertyType === 'residential') {
    approaches.push('Sales Comparison');
    if (scenarioName === 'As Completed' || scenarioName === 'As Proposed') {
      approaches.push('Cost Approach', 'Land Valuation'); // Cost Approach requires Land Valuation
    }
  } else if (propertyType === 'land') {
    // Land properties use Land Valuation (not Sales Comparison for improved properties)
    approaches.push('Land Valuation');
  } else {
    approaches.push('Sales Comparison');
  }
  
  if (scenarioName === 'As Stabilized') {
    if (!approaches.includes('Income Approach') && (propertyType === 'commercial' || isMultiFamily)) {
      approaches.unshift('Income Approach');
    }
    // For multi-family, ensure Multi-Family Approach is included
    if (isMultiFamily && !approaches.includes('Multi-Family Approach')) {
      approaches.unshift('Multi-Family Approach');
    }
  }
  
  // Ensure Cost Approach always has Land Valuation (for land value extraction)
  if (approaches.includes('Cost Approach') && !approaches.includes('Land Valuation')) {
    approaches.push('Land Valuation');
  }
  
  return approaches;
}

function determineRequiredScenarios(context: AssignmentContext): Scenario[] {
  const result: Scenario[] = [];
  const { propertyType, subType, propertyStatus, plannedChanges, occupancyStatus, loanPurpose } = context;
  
  if (!propertyStatus) {
    return [{ id: 1, name: 'As Is', nameSelect: 'As Is', customName: '', approaches: [], isRequired: false, requirementSource: '' }];
  }
  
  // RULE 1: Property Status Drives Primary Scenarios
  if (propertyStatus === 'proposed') {
    result.push({ id: 1, name: 'As Proposed', nameSelect: 'As Proposed', customName: '', approaches: getDefaultApproachesForScenario('As Proposed', propertyType, subType), isRequired: true, requirementSource: 'Proposed development - no existing improvements' });
    result.push({ id: 2, name: 'As Completed', nameSelect: 'As Completed', customName: '', approaches: getDefaultApproachesForScenario('As Completed', propertyType, subType), isRequired: true, requirementSource: 'Interagency Guidelines - construction/development' });
    result.push({ id: 3, name: 'As Stabilized', nameSelect: 'As Stabilized', customName: '', approaches: getDefaultApproachesForScenario('As Stabilized', propertyType, subType), isRequired: true, requirementSource: 'Interagency Guidelines - income property stabilization' });
  } else if (propertyStatus === 'under_construction') {
    result.push({ id: 1, name: 'As Is', nameSelect: 'As Is', customName: '', approaches: getDefaultApproachesForScenario('As Is', propertyType, subType), isRequired: true, requirementSource: 'Current value of partially-complete improvements' });
    result.push({ id: 2, name: 'As Completed', nameSelect: 'As Completed', customName: '', approaches: getDefaultApproachesForScenario('As Completed', propertyType, subType), isRequired: true, requirementSource: 'Interagency Guidelines - construction loan' });
    result.push({ id: 3, name: 'As Stabilized', nameSelect: 'As Stabilized', customName: '', approaches: getDefaultApproachesForScenario('As Stabilized', propertyType, subType), isRequired: true, requirementSource: 'Interagency Guidelines - post-construction lease-up' });
  } else if (propertyStatus === 'recently_completed') {
    result.push({ id: 1, name: 'As Is', nameSelect: 'As Is', customName: '', approaches: getDefaultApproachesForScenario('As Is', propertyType, subType), isRequired: true, requirementSource: 'Current market value' });
    if (occupancyStatus === 'lease_up' || occupancyStatus === 'vacant') {
      result.push({ id: 2, name: 'As Stabilized', nameSelect: 'As Stabilized', customName: '', approaches: getDefaultApproachesForScenario('As Stabilized', propertyType, subType), isRequired: true, requirementSource: 'Property not yet at stabilized occupancy' });
    }
  } else {
    result.push({ id: 1, name: 'As Is', nameSelect: 'As Is', customName: '', approaches: getDefaultApproachesForScenario('As Is', propertyType, subType), isRequired: true, requirementSource: 'Current market value' });
  }
  
  // RULE 2: Planned Changes Add Scenarios
  if (plannedChanges === 'major' || plannedChanges === 'change_of_use') {
    if (!result.some(s => s.name === 'As Completed')) {
      result.push({ id: result.length + 1, name: 'As Completed', nameSelect: 'As Completed', customName: '', approaches: getDefaultApproachesForScenario('As Completed', propertyType, subType), isRequired: true, requirementSource: 'Major renovation/change of use planned' });
    }
    if (occupancyStatus && occupancyStatus !== 'not_applicable' && !result.some(s => s.name === 'As Stabilized')) {
      result.push({ id: result.length + 1, name: 'As Stabilized', nameSelect: 'As Stabilized', customName: '', approaches: getDefaultApproachesForScenario('As Stabilized', propertyType, subType), isRequired: false, requirementSource: 'Recommended for income property after renovation' });
    }
  }
  
  // RULE 3: Occupancy Adjustments
  if (occupancyStatus === 'lease_up' && !result.some(s => s.name === 'As Stabilized')) {
    result.push({ id: result.length + 1, name: 'As Stabilized', nameSelect: 'As Stabilized', customName: '', approaches: getDefaultApproachesForScenario('As Stabilized', propertyType, subType), isRequired: true, requirementSource: 'Property currently in lease-up phase' });
  }
  
  // RULE 4: Loan Purpose Overrides
  if (loanPurpose === 'construction') {
    if (!result.some(s => s.name === 'As Completed')) {
      result.push({ id: result.length + 1, name: 'As Completed', nameSelect: 'As Completed', customName: '', approaches: getDefaultApproachesForScenario('As Completed', propertyType, subType), isRequired: true, requirementSource: 'Interagency Guidelines - construction loan requirement' });
    }
    if (!result.some(s => s.name === 'As Stabilized')) {
      result.push({ id: result.length + 1, name: 'As Stabilized', nameSelect: 'As Stabilized', customName: '', approaches: getDefaultApproachesForScenario('As Stabilized', propertyType, subType), isRequired: true, requirementSource: 'Interagency Guidelines - construction loan requirement' });
    }
  }
  
  if (loanPurpose === 'bridge' && plannedChanges && plannedChanges !== 'none' && !result.some(s => s.name === 'As Completed')) {
    result.push({ id: result.length + 1, name: 'As Completed', nameSelect: 'As Completed', customName: '', approaches: getDefaultApproachesForScenario('As Completed', propertyType, subType), isRequired: false, requirementSource: 'Recommended for bridge financing with planned improvements' });
  }
  
  result.forEach((s, idx) => s.id = idx + 1);
  return result;
}

const scenarioNameOptions = [
  { label: 'As Is', value: 'As Is' },
  { label: 'As Completed', value: 'As Completed' },
  { label: 'As Stabilized', value: 'As Stabilized' },
  { label: 'As Proposed', value: 'As Proposed' },
  { label: 'Type my own', value: 'Type my own' },
];

// ==========================================
// MAIN COMPONENT
// ==========================================
export default function SetupPage() {
  const { state: wizardState, addOwner, updateOwner, removeOwner, setScenarios: syncScenariosToContext, setPropertyType: syncPropertyType, setSubjectData } = useWizard();
  const [activeTab, setActiveTab] = useState('basics');
  
  // Track which fields are locked (pre-filled from extraction)
  const [lockedFields, setLockedFields] = useState<Record<string, boolean>>({});
  
  // Assignment context state - initialize from WizardContext if available
  const [context, setContext] = useState<AssignmentContext>(() => ({
    propertyType: wizardState.propertyType || null,
    subType: wizardState.propertySubtype || null,
    // Initialize these from wizardState.subjectData to preserve values across tab changes
    propertyStatus: wizardState.subjectData?.propertyStatus || null,
    plannedChanges: wizardState.subjectData?.plannedChanges || null,
    occupancyStatus: wizardState.subjectData?.occupancyStatus || null,
    loanPurpose: wizardState.subjectData?.loanPurpose || null,
    appraisalPurpose: wizardState.subjectData?.appraisalPurpose || null,
    propertyInterest: wizardState.subjectData?.propertyInterest || null,
    intendedUsers: wizardState.subjectData?.intendedUsers || '',
  }));
  
  // Form field state - will be pre-filled from extraction
  // Initialize from WizardContext if available
  const [address, setAddress] = useState(() => wizardState.subjectData?.address || { street: '', city: '', state: '', zip: '', county: '' });
  const [dates, setDates] = useState(() => ({
    reportDate: wizardState.subjectData?.reportDate || '',
    inspectionDate: wizardState.subjectData?.inspectionDate || '',
    effectiveDate: wizardState.subjectData?.effectiveDate || ''
  }));
  
  // Property ID state - will be pre-filled from extraction
  const [propertyName, setPropertyName] = useState(() => wizardState.subjectData?.propertyName || '');
  const [legalDescription, setLegalDescription] = useState(() => wizardState.subjectData?.legalDescription || '');
  const [taxId, setTaxId] = useState(() => wizardState.subjectData?.taxId || '');
  
  // Property Lookup Modal state
  const [showPropertyLookup, setShowPropertyLookup] = useState(false);
  
  // Auto-lookup state
  const [autoLookupStatus, setAutoLookupStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [autoLookupMessage, setAutoLookupMessage] = useState('');
  const [lastLookupAddress, setLastLookupAddress] = useState('');
  const lookupTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Handle property data import from lookup - MUST be defined before performAutoLookup
  const handlePropertyImport = useCallback((data: CadastralData) => {
    // Update property ID fields
    if (data.parcelId) setTaxId(data.parcelId);
    if (data.legalDescription) setLegalDescription(data.legalDescription);
    
    // Update address if available (only fill empty fields)
    if (data.situsAddress || data.situsCity || data.situsZip) {
      setAddress(prev => ({
        ...prev,
        // Only fill in fields that are empty
        street: prev.street || data.situsAddress || '',
        city: prev.city || data.situsCity || '',
        zip: data.situsZip || prev.zip,
        county: data.county || prev.county,
      }));
    }
    
    // Lock the imported fields
    setLockedFields(prev => ({
      ...prev,
      taxId: !!data.parcelId,
      legalDescription: !!data.legalDescription,
    }));
    
    // Update owner if we have owner name from cadastral
    if (data.ownerName && wizardState.owners && wizardState.owners.length > 0) {
      updateOwner(wizardState.owners[0].id, { name: data.ownerName });
    }
    
    // Build coordinates object if available
    const coordinates = (data.latitude !== undefined && data.longitude !== undefined)
      ? { latitude: data.latitude, longitude: data.longitude }
      : undefined;
    
    // Update the WizardContext with all available data
    setSubjectData({
      // Existing address data
      address: {
        street: address.street || data.situsAddress || '',
        city: address.city || data.situsCity || '',
        state: address.state || '',
        zip: data.situsZip || address.zip,
        county: data.county || address.county,
      },
      // Property identification
      taxId: data.parcelId || taxId,
      legalDescription: data.legalDescription || legalDescription,
      // Site data from cadastral
      siteArea: data.acres > 0 ? data.acres.toString() : (data.sqft > 0 ? (data.sqft / 43560).toFixed(2) : ''),
      siteAreaUnit: data.acres > 0 ? 'acres' : 'sqft',
      // Coordinates if available (for demographics lookup)
      coordinates,
      // Store full cadastral data for reference
      cadastralData: {
        parcelId: data.parcelId,
        legalDescription: data.legalDescription,
        county: data.county,
        acres: data.acres,
        sqft: data.sqft,
        situsAddress: data.situsAddress,
        ownerName: data.ownerName,
        assessedLandValue: data.assessedLandValue,
        assessedImprovementValue: data.assessedImprovementValue,
        totalAssessedValue: data.totalAssessedValue,
        taxYear: data.taxYear,
        lastUpdated: new Date().toISOString(),
      },
    });
  }, [address, taxId, legalDescription, setSubjectData, wizardState.owners, updateOwner]);
  
  // Debounced auto-lookup when address is complete
  const performAutoLookup = useCallback(async (street: string, city: string, state: string) => {
    // Create a signature for this address to avoid duplicate lookups
    const addressSignature = `${street}|${city}|${state}`.toLowerCase();
    if (addressSignature === lastLookupAddress) {
      return; // Already looked up this address
    }
    
    console.log('[AutoLookup] Starting lookup for:', { street, city, state });
    setAutoLookupStatus('loading');
    setAutoLookupMessage('Looking up property data...');
    setLastLookupAddress(addressSignature);
    
    try {
      const result: PropertyLookupResult = await getPropertyData({
        address: street,
        city: city,
        state: state,
      });
      
      console.log('[AutoLookup] Result:', result);
      
      if (result.success && result.data) {
        // Auto-fill the data
        handlePropertyImport(result.data);
        
        const source = result.isFreeService 
          ? 'Montana Cadastral (FREE)' 
          : result.source === 'mock' 
            ? 'Simulated Data' 
            : 'Cotality';
            
        setAutoLookupStatus('success');
        setAutoLookupMessage(`Property data loaded from ${source}`);
        
        // Clear success message after 5 seconds
        setTimeout(() => {
          setAutoLookupStatus('idle');
          setAutoLookupMessage('');
        }, 5000);
      } else {
        console.warn('[AutoLookup] Lookup failed:', result.error);
        setAutoLookupStatus('error');
        setAutoLookupMessage(result.error || 'Property not found');
        
        // Clear error message after 5 seconds
        setTimeout(() => {
          setAutoLookupStatus('idle');
          setAutoLookupMessage('');
        }, 5000);
      }
    } catch (error) {
      console.error('[AutoLookup] Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to lookup property';
      setAutoLookupStatus('error');
      setAutoLookupMessage(errorMessage);
      
      setTimeout(() => {
        setAutoLookupStatus('idle');
        setAutoLookupMessage('');
      }, 5000);
    }
  }, [lastLookupAddress, handlePropertyImport]);
  
  // Watch address changes and trigger auto-lookup
  useEffect(() => {
    // Clear any pending lookup
    if (lookupTimeoutRef.current) {
      clearTimeout(lookupTimeoutRef.current);
    }
    
    // Check if address is complete enough for lookup
    const street = address.street?.trim();
    const city = address.city?.trim();
    const state = address.state?.trim();
    
    // Need at least street, city, and state for a lookup
    if (!street || !city || !state) {
      return;
    }
    
    // Require minimum lengths to avoid premature lookups
    if (street.length < 5 || city.length < 2 || state.length < 2) {
      return;
    }
    
    // Create signature to check if we've already looked this up
    const addressSignature = `${street}|${city}|${state}`.toLowerCase();
    if (addressSignature === lastLookupAddress) {
      return; // Already looked up
    }
    
    console.log('[AutoLookup] Address complete, scheduling lookup in 1.5s:', { street, city, state });
    
    // Debounce: wait 1.5 seconds after typing stops before lookup
    lookupTimeoutRef.current = setTimeout(() => {
      performAutoLookup(street, city, state);
    }, 1500);
    
    return () => {
      if (lookupTimeoutRef.current) {
        clearTimeout(lookupTimeoutRef.current);
      }
    };
  }, [address.street, address.city, address.state, lastLookupAddress, performAutoLookup]);
  
  // Inspection state - declare early so it can be used in sync useEffect
  // Default inspectionType to 'interior_exterior' since that's the default dropdown value
  const [inspectionType, setInspectionType] = useState(() => wizardState.subjectData?.inspectionType || 'interior_exterior');
  const [personalInspection, setPersonalInspection] = useState(() => {
    // Use persisted value from WizardContext, default to true
    return wizardState.subjectData?.personalInspection ?? true;
  });
  const [inspectorName, setInspectorName] = useState(() => wizardState.subjectData?.inspectorName || '');
  const [inspectorLicense, setInspectorLicense] = useState(() => wizardState.subjectData?.inspectorLicense || '');
  const [appraisalAssistance, setAppraisalAssistance] = useState('');
  
  // Certifications state - declare early so it can be used in sync useEffect
  const [certificationAcknowledged, setCertificationAcknowledged] = useState(() => wizardState.subjectData?.certificationAcknowledged || false);
  const [additionalCertifications, setAdditionalCertifications] = useState('');
  const [licenseNumber, setLicenseNumber] = useState(() => wizardState.subjectData?.licenseNumber || '');
  const [licenseState, setLicenseState] = useState(() => wizardState.subjectData?.licenseState || '');
  const [licenseExpiration, setLicenseExpiration] = useState(() => wizardState.subjectData?.licenseExpiration || '');
  
  // Sync form fields to WizardContext when they change
  useEffect(() => {
    setSubjectData({
      address,
      reportDate: dates.reportDate,
      inspectionDate: dates.inspectionDate,
      effectiveDate: dates.effectiveDate,
      propertyName,
      legalDescription,
      taxId,
      // Purpose & Scope fields
      appraisalPurpose: context.appraisalPurpose || '',
      intendedUsers: context.intendedUsers || '',
      propertyInterest: context.propertyInterest || '',
      // Inspection fields
      inspectorName,
      inspectorLicense,
      inspectionType,
      personalInspection,
      // Certifications
      certificationAcknowledged,
      licenseNumber,
      licenseState,
      licenseExpiration,
      // Assignment Context (drives visibility logic)
      propertyStatus: context.propertyStatus as 'existing' | 'under_construction' | 'proposed' | 'recently_completed' | undefined,
      occupancyStatus: context.occupancyStatus as 'stabilized' | 'lease_up' | 'vacant' | 'not_applicable' | undefined,
      plannedChanges: context.plannedChanges as 'none' | 'minor' | 'major' | 'change_of_use' | undefined,
      loanPurpose: context.loanPurpose as 'purchase' | 'refinance' | 'construction' | 'bridge' | 'internal' | undefined,
    });
  }, [address, dates, propertyName, legalDescription, taxId, context.appraisalPurpose, 
      context.intendedUsers, context.propertyInterest, inspectorName, inspectorLicense, 
      inspectionType, personalInspection, certificationAcknowledged, licenseNumber, licenseState, licenseExpiration,
      context.propertyStatus, context.occupancyStatus, context.plannedChanges,
      context.loanPurpose, setSubjectData]);
  
  // Pre-fill from extracted data on mount
  useEffect(() => {
    // Check sessionStorage for extracted data (from DocumentIntakePage)
    const storedExtracted = sessionStorage.getItem('harken_extracted_data');
    if (storedExtracted) {
      try {
        const extracted = JSON.parse(storedExtracted);
        const newLocks: Record<string, boolean> = {};
        
        // Pre-fill from cadastral data
        if (extracted.cadastral) {
          const cad = extracted.cadastral;
          if (cad.propertyAddress?.value) {
            // Parse address if it's a full string
            const addrParts = cad.propertyAddress.value.split(',').map((s: string) => s.trim());
            if (addrParts.length >= 3) {
              setAddress({
                street: addrParts[0] || '',
                city: addrParts[1] || '',
                state: addrParts[2]?.split(' ')[0] || '',
                zip: addrParts[2]?.split(' ')[1] || '',
                county: cad.county?.value || '',
              });
              newLocks['address'] = true;
            }
          }
          if (cad.legalDescription?.value) {
            setLegalDescription(cad.legalDescription.value);
            newLocks['legalDescription'] = true;
          }
          if (cad.taxId?.value) {
            setTaxId(cad.taxId.value);
            newLocks['taxId'] = true;
          }
          if (cad.owner?.value && wizardState.owners?.length > 0) {
            updateOwner(wizardState.owners[0].id, { name: cad.owner.value });
            newLocks['owner'] = true;
          }
          if (cad.landArea?.value) {
            setPropertyName(cad.landArea.value);
          }
        }
        
        // Pre-fill from engagement letter
        if (extracted.engagement) {
          const eng = extracted.engagement;
          if (eng.effectiveDate?.value) {
            setDates(prev => ({ ...prev, effectiveDate: eng.effectiveDate.value }));
            newLocks['effectiveDate'] = true;
          }
          if (eng.appraisalPurpose?.value) {
            // Could map to appraisalPurpose context
          }
        }
        
        // Note: Sale agreement data is now handled in SubjectDataPage Tax & Ownership tab
        
        setLockedFields(newLocks);
      } catch (e) {
        console.warn('Failed to parse extracted data', e);
      }
    }
  }, []);
  
  // Scenarios state
  // Initialize scenarios from WizardContext to preserve effective dates and approaches
  const [scenarios, setScenarios] = useState<Scenario[]>(() => {
    // If we have scenarios in WizardContext, use them
    if (wizardState.scenarios && wizardState.scenarios.length > 0) {
      return wizardState.scenarios.map(s => ({
        id: s.id,
        name: s.name,
        nameSelect: s.name as 'As Is' | 'As Completed' | 'As Stabilized' | 'As Proposed' | 'Custom',
        customName: '',
        approaches: s.approaches || [],
        effectiveDate: s.effectiveDate || '',
        isRequired: s.isRequired || false,
      }));
    }
    // Default if no scenarios exist yet
    return [{ id: 1, name: 'As Is', nameSelect: 'As Is', customName: '', approaches: [] }];
  });
  
  // Update scenarios when RELEVANT context properties change (not appraisalPurpose, intendedUsers, etc.)
  // Only propertyStatus, plannedChanges, occupancyStatus should trigger scenario recalculation
  useEffect(() => {
    if (context.propertyStatus) {
      const newScenarios = determineRequiredScenarios(context);
      setScenarios(prevScenarios => {
        // Preserve effectiveDate from existing scenarios when recreating
        const preservedDates: Record<string, string> = {};
        prevScenarios.forEach(s => {
          if (s.effectiveDate) {
            preservedDates[s.name] = s.effectiveDate;
          }
        });
        
        // Apply preserved dates to new scenarios
        const scenariosWithDates = newScenarios.map(s => ({
          ...s,
          effectiveDate: preservedDates[s.name] || s.effectiveDate || '',
        }));
        
        const customScenarios = prevScenarios.filter(s => !['As Is', 'As Completed', 'As Stabilized', 'As Proposed'].includes(s.name));
        return [...scenariosWithDates, ...customScenarios];
      });
    }
  }, [context.propertyStatus, context.plannedChanges, context.occupancyStatus, context.propertyType, context.subType]);

  // Sync local scenarios to WizardContext whenever they change
  useEffect(() => {
    // Convert local Scenario format to AppraisalScenario format for context
    const contextScenarios = scenarios.map(s => ({
      id: s.id,
      name: s.name,
      approaches: s.approaches,
      effectiveDate: s.effectiveDate || '',
      isRequired: s.isRequired || false,
    }));
    syncScenariosToContext(contextScenarios);
  }, [scenarios, syncScenariosToContext]);

  // Sync property type to WizardContext when it changes
  useEffect(() => {
    if (context.propertyType) {
      syncPropertyType(context.propertyType, context.subType || undefined);
    }
  }, [context.propertyType, context.subType, syncPropertyType]);
  
  // Auto-adjust approaches when property type changes to land
  useEffect(() => {
    if (context.propertyType === 'land') {
      setScenarios(prevScenarios => prevScenarios.map(s => {
        let newApproaches = [...s.approaches];
        
        // Add Land Valuation if not present
        if (!newApproaches.includes('Land Valuation')) {
          newApproaches.push('Land Valuation');
        }
        
        // For land properties, Sales Comparison is typically not used (land uses Land Valuation)
        // Remove Sales Comparison if Land Valuation is now the primary approach
        if (newApproaches.includes('Land Valuation') && newApproaches.includes('Sales Comparison')) {
          newApproaches = newApproaches.filter(a => a !== 'Sales Comparison');
        }
        
        return { ...s, approaches: newApproaches };
      }));
    }
  }, [context.propertyType]);
  
  // Helper to check if occupancy question should show
  const shouldShowOccupancyQuestion = () => {
    if (context.propertyType === 'commercial') return true;
    if (context.subType && (context.subType.includes('multifamily') || context.subType.includes('2-4unit'))) return true;
    return false;
  };
  
  // Update context helper
  const updateContext = (field: keyof AssignmentContext, value: string | null) => {
    setContext(prev => ({ ...prev, [field]: value }));
  };
  
  // Scenario management functions
  const addScenario = () => {
    const newId = scenarios.length > 0 ? Math.max(...scenarios.map(s => s.id)) + 1 : 1;
    setScenarios([...scenarios, { id: newId, name: '', nameSelect: '', customName: '', approaches: [] }]);
  };
  
  const removeScenario = (id: number) => {
    if (scenarios.length <= 1) return;
    const scenario = scenarios.find(s => s.id === id);
    if (scenario?.isRequired) return;
    setScenarios(scenarios.filter(s => s.id !== id));
  };
  
  const updateScenarioName = (id: number, type: 'pill' | 'custom', value: string) => {
    setScenarios(scenarios.map(s => {
      if (s.id !== id) return s;
      if (type === 'pill') {
        if (value === 'Type my own') {
          return { ...s, nameSelect: 'Type my own', name: s.customName || '' };
        } else {
          return { ...s, nameSelect: value, name: value, customName: '' };
        }
      } else {
        return { ...s, customName: value, name: value };
      }
    }));
  };
  
  const toggleScenarioApproach = (id: number, approach: string) => {
    setScenarios(scenarios.map(s => {
      if (s.id !== id) return s;
      const hasApproach = s.approaches.includes(approach);
      
      if (hasApproach) {
        // Removing an approach
        let newApproaches = s.approaches.filter(a => a !== approach);
        // If removing Cost Approach and no other approach needs Land Valuation, consider keeping it
        // (user can manually remove Land Valuation if desired)
        return { ...s, approaches: newApproaches };
      } else {
        // Adding an approach
        let newApproaches = [...s.approaches, approach];
        
        // Auto-add Land Valuation when Cost Approach is selected (required for land value)
        if (approach === 'Cost Approach' && !newApproaches.includes('Land Valuation')) {
          newApproaches.push('Land Valuation');
        }
        
        return { ...s, approaches: newApproaches };
      }
    }));
  };
  
  const updateScenarioDate = (id: number, date: string) => {
    setScenarios(scenarios.map(s => s.id === id ? { ...s, effectiveDate: date } : s));
  };

  // ==========================================
  // RENDER TAB CONTENT
  // ==========================================
  // Get cost info for current state
  const lookupCostInfo = getLookupCostInfo(address.state || 'MT');
  
  const renderBasicsTab = () => (
    <div className="space-y-6">
      {/* Property Address */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between border-b-2 border-gray-200 pb-3 mb-4">
          <h3 className="text-lg font-bold text-[#1c3643]">
            Property Address
          </h3>
          {/* Auto-lookup status indicator */}
          {autoLookupStatus !== 'idle' && (
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              autoLookupStatus === 'loading' 
                ? 'bg-blue-100 text-blue-700' 
                : autoLookupStatus === 'success' 
                  ? 'bg-emerald-100 text-emerald-700' 
                  : 'bg-amber-100 text-amber-700'
            }`}>
              {autoLookupStatus === 'loading' && <Loader2 className="w-3 h-3 animate-spin" />}
              {autoLookupStatus === 'success' && <CheckCircle className="w-3 h-3" />}
              {autoLookupStatus === 'error' && <AlertCircle className="w-3 h-3" />}
              {autoLookupMessage}
            </div>
          )}
        </div>
        
        {/* Auto-lookup info banner */}
        <div className={`mb-4 p-3 rounded-lg flex items-center gap-3 ${
          lookupCostInfo.isFree
            ? 'bg-emerald-50 border border-emerald-200'
            : 'bg-blue-50 border border-blue-200'
        }`}>
          <div className={`p-2 rounded-full ${
            lookupCostInfo.isFree ? 'bg-emerald-100' : 'bg-blue-100'
          }`}>
            <MapPin className={`w-4 h-4 ${
              lookupCostInfo.isFree ? 'text-emerald-600' : 'text-blue-600'
            }`} />
          </div>
          <div className="flex-1">
            <p className={`text-sm font-medium ${
              lookupCostInfo.isFree ? 'text-emerald-700' : 'text-blue-700'
            }`}>
              Auto Property Lookup Enabled
            </p>
            <p className={`text-xs ${
              lookupCostInfo.isFree ? 'text-emerald-600' : 'text-blue-600'
            }`}>
              {lookupCostInfo.note} — Property data will auto-fill when address is complete
            </p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Street Address <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={address.street}
              onChange={(e) => setAddress({ ...address, street: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent"
              placeholder="1478 South 30th Street West"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={address.city}
                onChange={(e) => setAddress({ ...address, city: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent"
                placeholder="Billings"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={address.state}
                onChange={(e) => setAddress({ ...address, state: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent"
                placeholder="MT"
                maxLength={2}
              />
              <p className="text-xs text-gray-400 mt-1">
                Use 2-letter state code (e.g., MT for Montana)
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ZIP Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={address.zip}
                onChange={(e) => setAddress({ ...address, zip: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent ${
                  lockedFields['address'] ? 'bg-blue-50 border-blue-200' : 'border-gray-300'
                }`}
                placeholder="59102"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                County <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={address.county}
                onChange={(e) => setAddress({ ...address, county: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent ${
                  lockedFields['address'] ? 'bg-blue-50 border-blue-200' : 'border-gray-300'
                }`}
                placeholder="Yellowstone"
              />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-3">
            This is the primary parcel address. For multi-parcel properties, additional addresses can be entered in Subject Data &gt; Improvements.
          </p>
        </div>
      </div>

      {/* Key Dates */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-[#1c3643] border-b-2 border-gray-200 pb-3 mb-4">
          Key Dates
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date of Report <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={dates.reportDate}
              onChange={(e) => setDates({ ...dates, reportDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date of Inspection <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={dates.inspectionDate}
              onChange={(e) => setDates({ ...dates, inspectionDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Effective Date of Appraisal <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={dates.effectiveDate}
              onChange={(e) => setDates({ ...dates, effectiveDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent"
            />
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-3 flex items-center gap-1">
          <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>The Effective Date is the "as of" date for your value opinion. For As Is values, this is typically the inspection date. For prospective values (As Completed, As Stabilized), use the projected future date.</span>
        </p>
      </div>

      {/* Property Type */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-[#1c3643] border-b-2 border-gray-200 pb-3 mb-4">
          Property Type Selection
        </h3>
        <div className="grid grid-cols-3 gap-4">
          {propertyTypes.map((type) => {
            const Icon = type.Icon;
            const isSelected = context.propertyType === type.id;
            return (
              <button
                key={type.id}
                onClick={() => updateContext('propertyType', type.id)}
                className={`relative p-6 border-2 rounded-lg text-center transition-all hover:border-[#0da1c7] hover:shadow-md ${
                  isSelected
                    ? 'border-[#0da1c7] bg-[#0da1c7]/5'
                    : 'border-gray-200'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-[#0da1c7] rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
                <Icon className={`w-10 h-10 mx-auto mb-3 ${isSelected ? 'text-[#0da1c7]' : 'text-gray-400'}`} />
                <span className={`block text-base font-semibold ${isSelected ? 'text-[#0da1c7]' : 'text-gray-700'}`}>{type.label}</span>
                <span className="block text-xs text-gray-500 mt-1">{type.description}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Property Sub-Type (conditional) */}
      {context.propertyType && propertySubtypes[context.propertyType] && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm animate-fade-in">
          <h3 className="text-lg font-bold text-[#1c3643] border-b-2 border-gray-200 pb-3 mb-4">
            Property Sub-Type
          </h3>
          <div className="grid grid-cols-3 gap-4">
            {propertySubtypes[context.propertyType].map((subtype) => {
              const isSelected = context.subType === subtype.id;
              return (
                <button
                  key={subtype.id}
                  onClick={() => updateContext('subType', subtype.id)}
                  className={`relative p-4 border-2 rounded-lg text-center transition-all hover:border-[#0da1c7] ${
                    isSelected
                      ? 'border-[#0da1c7] bg-[#0da1c7]/5'
                      : 'border-gray-200'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-[#0da1c7] rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                  <span className={`block font-semibold text-sm ${isSelected ? 'text-[#0da1c7]' : 'text-gray-700'}`}>{subtype.name}</span>
                  <span className="block text-xs text-gray-500 mt-1">{subtype.description}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Property Status */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-[#1c3643] border-b-2 border-gray-200 pb-3 mb-4">
          Property Status
        </h3>
        <p className="text-sm text-gray-600 mb-4">These questions determine which valuation scenarios are required for your appraisal.</p>
        
        {/* Property Status Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            What is the current status of the property? <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {propertyStatusOptions.map((opt) => {
              const isSelected = context.propertyStatus === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => updateContext('propertyStatus', opt.value)}
                  className={`relative p-4 border-2 rounded-lg text-left transition-all hover:border-[#0da1c7]/50 ${
                    isSelected ? 'border-[#0da1c7] bg-[#0da1c7]/5' : 'border-gray-200'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-[#0da1c7] rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                  <h4 className="font-semibold text-sm text-gray-900">{opt.label}</h4>
                  <p className="text-xs text-gray-500 mt-1">{opt.description}</p>
                </button>
              );
            })}
          </div>
          {context.propertyStatus && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 animate-pulse">
              <strong>Auto-configured:</strong> Based on your selection, required valuation scenarios and approaches have been pre-selected below.
            </div>
          )}
        </div>
        
        {/* Planned Changes (conditional) */}
        {(context.propertyStatus === 'existing' || context.propertyStatus === 'recently_completed') && (
          <div className="mb-6 animate-fade-in">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Are there any planned improvements or renovations?
            </label>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {plannedChangesOptions.map((opt) => {
                const isSelected = context.plannedChanges === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => updateContext('plannedChanges', opt.value)}
                    className={`relative p-3 border-2 rounded-lg text-left transition-all hover:border-[#0da1c7]/50 ${
                      isSelected ? 'border-[#0da1c7] bg-[#0da1c7]/5' : 'border-gray-200'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-4 h-4 bg-[#0da1c7] rounded-full flex items-center justify-center">
                        <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                    <h4 className="font-semibold text-sm text-gray-900">{opt.label}</h4>
                    <p className="text-xs text-gray-500 mt-1">{opt.description}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}
        
        {/* Occupancy Status (conditional) */}
        {shouldShowOccupancyQuestion() && (
          <div className="mb-6 animate-fade-in">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              What is the current occupancy status?
            </label>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {occupancyStatusOptions.map((opt) => {
                const isSelected = context.occupancyStatus === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => updateContext('occupancyStatus', opt.value)}
                    className={`relative p-4 pr-8 border-2 rounded-lg text-left transition-all hover:border-[#0da1c7]/50 min-h-[72px] ${
                      isSelected ? 'border-[#0da1c7] bg-[#0da1c7]/5' : 'border-gray-200'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-3 right-3 w-5 h-5 bg-[#0da1c7] rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                    <h4 className="font-semibold text-sm text-gray-900 pr-2">{opt.label}</h4>
                    <p className="text-xs text-gray-500 mt-1">{opt.description}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}
        
        {/* Loan Purpose */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            What is the intended use of this appraisal?
          </label>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            {loanPurposeOptions.map((opt) => {
              const isSelected = context.loanPurpose === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => updateContext('loanPurpose', opt.value)}
                  className={`relative p-3 border-2 rounded-lg text-left transition-all hover:border-[#0da1c7]/50 ${
                    isSelected ? 'border-[#0da1c7] bg-[#0da1c7]/5' : 'border-gray-200'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-4 h-4 bg-[#0da1c7] rounded-full flex items-center justify-center">
                      <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                  <h4 className="font-semibold text-sm text-gray-900">{opt.label}</h4>
                  <p className="text-xs text-gray-500 mt-1">{opt.description}</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Valuation Scenarios */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-[#1c3643] border-b-2 border-gray-200 pb-3 flex-1">
            Valuation Scenarios
          </h3>
          {context.propertyStatus && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Auto-configured
            </span>
          )}
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Based on your selections above, these scenarios are recommended. You can customize approaches for each or add additional scenarios.
        </p>
        
        {/* Scenarios List */}
        <div className="space-y-4">
          {scenarios.map((scenario) => (
            <div
              key={scenario.id}
              className={`border rounded-xl p-5 transition-all hover:shadow-md ${
                scenario.isRequired
                  ? 'border-l-4 border-l-red-400 border-gray-200'
                  : scenario.isRequired === false
                  ? 'border-l-4 border-l-blue-400 border-gray-200'
                  : 'border-gray-200'
              }`}
            >
              {/* Scenario Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-xl font-bold text-gray-900">
                    {scenario.name || 'New Scenario'}
                  </span>
                  {scenario.isRequired !== undefined && (
                    scenario.isRequired ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Required
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Recommended
                      </span>
                    )
                  )}
                </div>
                {/* Always show delete button, but disable for required scenarios */}
                <button
                  onClick={() => removeScenario(scenario.id)}
                  disabled={scenario.isRequired || scenarios.length <= 1}
                  className={`p-2 transition-colors rounded-full ${
                    scenario.isRequired || scenarios.length <= 1
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-red-500 hover:text-red-700 hover:bg-red-50'
                  }`}
                  title={scenario.isRequired ? 'Cannot remove required scenario' : 'Remove scenario'}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              
              {/* Requirement Source */}
              {scenario.requirementSource && (
                <div className={`mb-4 px-3 py-2 rounded text-xs ${
                  scenario.isRequired ? 'bg-red-50 border border-red-200' : 'bg-blue-50 border border-blue-200'
                }`}>
                  <span className="font-medium">{scenario.isRequired ? 'Why required:' : 'Why recommended:'}</span> {scenario.requirementSource}
                </div>
              )}
              
              {/* Effective Date and Scenario Type Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Effective Date for {scenario.name || 'Scenario'} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={scenario.effectiveDate || ''}
                    onChange={(e) => updateScenarioDate(scenario.id, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent bg-[#f0f9fb]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Change Scenario Type</label>
                  <div className="flex flex-wrap gap-2">
                    {scenarioNameOptions.filter(opt => opt.value !== 'Type my own').map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => updateScenarioName(scenario.id, 'pill', opt.value)}
                        className={`px-3 py-1.5 border rounded-full text-xs font-medium transition-all ${
                          scenario.nameSelect === opt.value || scenario.name === opt.value
                            ? 'border-[#0da1c7] bg-[#0da1c7] text-white'
                            : 'border-gray-300 bg-white text-gray-700 hover:border-[#0da1c7]'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Custom name input */}
              {(scenario.nameSelect === 'Type my own' || 
                (!scenarioNameOptions.some(opt => opt.value === scenario.name) && scenario.name)) && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Custom Scenario Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter custom scenario name..."
                    value={scenario.customName || scenario.name}
                    onChange={(e) => updateScenarioName(scenario.id, 'custom', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent"
                  />
                </div>
              )}
              
              {/* Approach Selection */}
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Approaches for this Scenario
              </label>
              <div className="grid grid-cols-3 gap-3">
                {approachOptions.map((app) => {
                  const Icon = app.Icon;
                  const isSelected = scenario.approaches.includes(app.key);
                  return (
                    <button
                      key={app.key}
                      onClick={() => toggleScenarioApproach(scenario.id, app.key)}
                      className={`relative flex flex-col items-center justify-center p-4 border-2 rounded-lg transition-all ${
                        isSelected
                          ? 'border-[#0da1c7] bg-[#0da1c7]/5'
                          : 'border-gray-200 hover:border-[#0da1c7]'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-5 h-5 bg-[#0da1c7] rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                      <Icon className={`w-8 h-8 mb-2 ${isSelected ? 'text-[#0da1c7]' : 'text-gray-400'}`} />
                      <span className={`text-sm font-medium ${isSelected ? 'text-[#0da1c7]' : 'text-gray-700'}`}>
                        {app.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          
          {/* Add Scenario Button */}
          <button
            onClick={addScenario}
            className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 font-medium hover:border-gray-400 hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Add Another Scenario
          </button>
        </div>
      </div>
    </div>
  );

  const renderPurposeTab = () => (
    <div className="space-y-6">
      {/* Purpose of Appraisal */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-[#1c3643] border-b-2 border-gray-200 pb-3 mb-4">
          What type of value are you estimating?
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {appraisalPurposeOptions.map((opt) => {
            const isSelected = context.appraisalPurpose === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => updateContext('appraisalPurpose', opt.value)}
                className={`relative p-4 border-2 rounded-lg text-left transition-all hover:border-[#0da1c7]/50 ${
                  isSelected ? 'border-[#0da1c7] bg-[#0da1c7]/5' : 'border-gray-200'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-[#0da1c7] rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
                <h4 className="font-semibold text-sm text-gray-900">{opt.label}</h4>
                <p className="text-xs text-gray-500 mt-1">{opt.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Property Interest */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-[#1c3643] border-b-2 border-gray-200 pb-3 mb-4">
          What property interest is being appraised?
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {propertyInterestOptions.map((opt) => {
            const isSelected = context.propertyInterest === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => updateContext('propertyInterest', opt.value)}
                className={`relative p-4 border-2 rounded-lg text-left transition-all hover:border-[#0da1c7]/50 ${
                  isSelected ? 'border-[#0da1c7] bg-[#0da1c7]/5' : 'border-gray-200'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-[#0da1c7] rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
                <h4 className="font-semibold text-sm text-gray-900">{opt.label}</h4>
                <p className="text-xs text-gray-500 mt-1">{opt.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Intended Users */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-[#1c3643] border-b-2 border-gray-200 pb-3 mb-4">
          Intended Users
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Per USPAP, you must identify the intended user(s) of the appraisal report.
        </p>
        <textarea
          value={context.intendedUsers}
          onChange={(e) => updateContext('intendedUsers', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent"
          rows={3}
          placeholder="e.g., ABC Bank, for lending purposes; John Smith, for estate planning..."
        />
      </div>
    </div>
  );

  const renderPropertyIdTab = () => (
    <div className="space-y-6">
      {/* Property Lookup Button */}
      <div className="bg-gradient-to-r from-[#0da1c7]/10 to-transparent border border-[#0da1c7]/20 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#0da1c7]/10 rounded-lg">
              <Search className="w-5 h-5 text-[#0da1c7]" />
            </div>
            <div>
              <h4 className="font-medium text-slate-800">Property Data Lookup</h4>
              <p className="text-sm text-slate-500">
                Auto-fill property details from {address.state === 'MT' || address.state === 'Montana' ? 'Montana Cadastral (FREE)' : 'public records'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowPropertyLookup(true)}
            className="px-4 py-2 bg-[#0da1c7] text-white rounded-lg hover:bg-[#0b8fb3] transition-colors font-medium flex items-center gap-2"
          >
            <Search size={16} />
            Lookup Property
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-[#1c3643] border-b-2 border-gray-200 pb-3 mb-4">
          Property Identification Details
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Property Name (e.g. Canyon Creek Apts)</label>
            <input
              type="text"
              value={propertyName}
              onChange={(e) => setPropertyName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent"
              placeholder="Enter property name..."
            />
          </div>
          <div>
            <EnhancedTextArea
              id="legal-description"
              label="Legal Description"
              value={legalDescription}
              onChange={setLegalDescription}
              placeholder="Enter legal description..."
              rows={4}
              sectionContext="legal_description"
              helperText="Include lot, block, subdivision, section, township and range information. For multi-parcel properties, additional legal descriptions can be entered in Subject Data > Improvements."
            />
          </div>
        </div>
      </div>

      {/* Ownership Section - Multiple Owners */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between border-b-2 border-gray-200 pb-3 mb-4">
          <h3 className="text-lg font-bold text-[#1c3643]">Property Ownership</h3>
          <button
            onClick={addOwner}
            className="text-sm text-[#0da1c7] hover:text-[#0b8fb0] font-medium flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Add Owner
          </button>
        </div>
        
        <div className="space-y-4">
          {wizardState.owners.map((owner, index) => (
            <div key={owner.id} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
              <div className="flex items-start justify-between mb-3">
                <span className="text-sm font-medium text-gray-700">Owner {index + 1}</span>
                {wizardState.owners.length > 1 && (
                  <button
                    onClick={() => removeOwner(owner.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                    title="Remove Owner"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Owner Name <span className="text-red-500">*</span>
                    {lockedFields['owner'] && index === 0 && (
                      <button
                        onClick={() => setLockedFields(prev => ({ ...prev, owner: false }))}
                        className="ml-2 text-[#0da1c7]"
                        title="Unlock to edit (pre-filled from document)"
                      >
                        <Lock className="w-3 h-3 inline" />
                      </button>
                    )}
                  </label>
                  <input
                    type="text"
                    value={owner.name}
                    onChange={(e) => updateOwner(owner.id, { name: e.target.value })}
                    disabled={lockedFields['owner'] && index === 0}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent ${
                      lockedFields['owner'] && index === 0 ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                    placeholder="Full legal name as shown on title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ownership Type</label>
                  <select
                    value={owner.ownershipType}
                    onChange={(e) => updateOwner(owner.id, { ownershipType: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent bg-white"
                  >
                    <option value="individual">Individual</option>
                    <option value="corporation">Corporation</option>
                    <option value="llc">LLC</option>
                    <option value="partnership">Partnership</option>
                    <option value="trust">Trust</option>
                    <option value="government">Government Entity</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              {wizardState.owners.length > 1 && (
                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ownership Percentage</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={owner.percentage}
                      onChange={(e) => updateOwner(owner.id, { percentage: parseFloat(e.target.value) || 0 })}
                      min="0"
                      max="100"
                      step="0.01"
                      className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent"
                    />
                    <span className="text-gray-500">%</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Tax Identification Section */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-[#1c3643] border-b-2 border-gray-200 pb-3 mb-4">
          Tax Identification
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tax ID / Parcel #
              {lockedFields['taxId'] && (
                <button
                  onClick={() => setLockedFields(prev => ({ ...prev, taxId: false }))}
                  className="ml-2 text-[#0da1c7]"
                  title="Unlock to edit"
                >
                  <Lock className="w-3 h-3 inline" />
                </button>
              )}
            </label>
            <input
              type="text"
              value={taxId}
              onChange={(e) => setTaxId(e.target.value)}
              disabled={lockedFields['taxId']}
              className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent ${
                lockedFields['taxId'] ? 'bg-blue-50 border-blue-200' : ''
              }`}
              placeholder="Enter tax ID..."
            />
            <p className="text-xs text-gray-400 mt-1">
              This is the primary parcel. Additional parcels can be added in Subject Data &gt; Improvements.
            </p>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-3 flex items-center gap-1">
          <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Sale history and transaction details are captured in Subject Data &gt; Tax &amp; Ownership.</span>
        </p>
      </div>
    </div>
  );

  const renderInspectionTab = () => (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-[#1c3643] border-b-2 border-gray-200 pb-3 mb-4">
          Subject Property Inspection
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Inspection Type</label>
            <select
              value={inspectionType}
              onChange={(e) => setInspectionType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent"
            >
              <option value="interior_exterior">Interior & Exterior Inspection</option>
              <option value="exterior_only">Exterior Only Inspection</option>
              <option value="desktop">Desktop / No Inspection</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date of Inspection
              <span className="text-xs text-gray-500 font-normal ml-2">(from Key Dates)</span>
            </label>
            <input
              type="date"
              value={dates.inspectionDate}
              onChange={(e) => setDates({ ...dates, inspectionDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent bg-blue-50 border-blue-200"
            />
            <p className="text-xs text-blue-600 mt-1">Synced with Assignment Basics &gt; Key Dates</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Did you personally inspect the property?</label>
            <div className="flex gap-4">
              <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 flex-1">
                <input
                  type="radio"
                  name="personal_inspection"
                  checked={personalInspection}
                  onChange={() => setPersonalInspection(true)}
                  className="mr-2 text-[#0da1c7] focus:ring-[#0da1c7]"
                />
                <span>Yes, I inspected it personally</span>
              </label>
              <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 flex-1">
                <input
                  type="radio"
                  name="personal_inspection"
                  checked={!personalInspection}
                  onChange={() => setPersonalInspection(false)}
                  className="mr-2 text-[#0da1c7] focus:ring-[#0da1c7]"
                />
                <span>No, I did not inspect it</span>
              </label>
            </div>
          </div>
          {!personalInspection && (
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 animate-fade-in">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Contract Appraiser / Inspector Details</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Inspector Name</label>
                  <input
                    type="text"
                    value={inspectorName}
                    onChange={(e) => setInspectorName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
                  <input
                    type="text"
                    value={inspectorLicense}
                    onChange={(e) => setInspectorLicense(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-[#1c3643] border-b-2 border-gray-200 pb-3 mb-4">
          USPAP Certification & Assistance
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Identify any significant professional assistance provided by others.
        </p>
        <textarea
          value={appraisalAssistance}
          onChange={(e) => setAppraisalAssistance(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent"
          rows={3}
          placeholder="Name and description of assistance (e.g. John Doe provided market research...)"
        />
      </div>
    </div>
  );

  const renderCertificationsTab = () => (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-[#1c3643] border-b-2 border-gray-200 pb-3 mb-4">
          USPAP Certifications
        </h3>
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded mb-4">
          <p className="text-sm text-blue-800">
            USPAP Standards Rule 2-3 requires certification statements in appraisal reports.
            These certifications will be included in your final report.
          </p>
        </div>
        <div className="space-y-3">
          <label className="flex items-start gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              checked={certificationAcknowledged}
              onChange={(e) => setCertificationAcknowledged(e.target.checked)}
              className="mt-1 text-[#0da1c7] focus:ring-[#0da1c7]"
            />
            <div>
              <span className="font-medium text-gray-900">I acknowledge the USPAP certification requirements</span>
              <p className="text-sm text-gray-500 mt-1">
                I certify that my analyses, opinions, and conclusions were developed, and this report was prepared, 
                in conformity with the Uniform Standards of Professional Appraisal Practice.
              </p>
            </div>
          </label>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Additional Certifications (if any)</label>
          <textarea
            value={additionalCertifications}
            onChange={(e) => setAdditionalCertifications(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent"
            rows={4}
            placeholder="Add any additional certifications required for this assignment..."
          />
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-[#1c3643] border-b-2 border-gray-200 pb-3 mb-4">
          Licenses & Certifications
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
            <input
              type="text"
              value={licenseNumber}
              onChange={(e) => setLicenseNumber(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent"
              placeholder="Enter license number..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">License State</label>
            <input
              type="text"
              value={licenseState}
              onChange={(e) => setLicenseState(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent"
              placeholder="e.g., Montana"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Expiration Date</label>
            <input
              type="date"
              value={licenseExpiration}
              onChange={(e) => setLicenseExpiration(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'basics':
        return renderBasicsTab();
      case 'purpose':
        return renderPurposeTab();
      case 'property':
        return renderPropertyIdTab();
      case 'inspection':
        return renderInspectionTab();
      case 'certifications':
        return renderCertificationsTab();
      default:
        return renderBasicsTab();
    }
  };

  // ==========================================
  // PROGRESS TRACKING
  // ==========================================
  const { tabCompletions, sectionCompletion, trackTabChange } = useCompletion('setup');
  const { checkAndTriggerCelebration } = useCelebration();

  // Track tab changes for smart navigation
  useEffect(() => {
    trackTabChange(activeTab);
  }, [activeTab, trackTabChange]);

  // Check if section just completed
  useEffect(() => {
    if (sectionCompletion === 100) {
      checkAndTriggerCelebration('setup');
    }
  }, [sectionCompletion, checkAndTriggerCelebration]);

  // Smart continue logic
  const { handleContinue } = useSmartContinue({
    sectionId: 'setup',
    tabs: setupTabs.map(t => t.id),
    activeTab,
    setActiveTab,
    currentPhase: 3,
  });

  // Get completion percentage for a specific tab
  const getTabCompletion = (tabId: string): number => {
    const tabData = tabCompletions.find(t => t.id === tabId);
    return tabData?.completion || 0;
  };

  // ==========================================
  // SIDEBAR COMPONENTS
  // ==========================================
  const sidebar = (
    <div>
      <h2 className="text-lg font-bold text-gray-900 mb-1">Appraisal Setup</h2>
      <p className="text-sm text-gray-500 mb-6">
        {context.propertyType ? `${context.propertyType.charAt(0).toUpperCase() + context.propertyType.slice(1)}${context.subType ? ` • ${context.subType}` : ''}` : 'Configure Assignment'}
      </p>
      <nav className="space-y-1">
        {setupTabs.map((tab) => (
          <SidebarTab
            key={tab.id}
            id={tab.id}
            label={tab.label}
            Icon={tab.Icon}
            isActive={activeTab === tab.id}
            completion={getTabCompletion(tab.id)}
            showProgress={true}
            onClick={() => setActiveTab(tab.id)}
          />
        ))}
      </nav>
      <SectionProgressSummary completion={sectionCompletion} />
    </div>
  );

  // Get guidance content for the active tab
  const activeGuidance = useMemo(() => {
    return getSetupGuidance(activeTab);
  }, [activeTab]);

  // New enhanced guidance panel
  const helpSidebar = (
    <WizardGuidancePanel
      guidance={activeGuidance}
      themeColor="#0da1c7"
    />
  );

  return (
    <>
      <WizardLayout
        title="Appraisal Setup"
        subtitle="Phase 3 of 6 • Assignment Details"
        phase={3}
        sidebar={sidebar}
        helpSidebarGuidance={helpSidebar}
        onContinue={handleContinue}
      >
        <div className="max-w-4xl mx-auto animate-fade-in">
          {renderTabContent()}
        </div>
      </WizardLayout>
      
      {/* Property Lookup Modal */}
      <PropertyLookupModal
        isOpen={showPropertyLookup}
        onClose={() => setShowPropertyLookup(false)}
        onImport={handlePropertyImport}
        initialState={address.state || 'MT'}
      />
    </>
  );
}
