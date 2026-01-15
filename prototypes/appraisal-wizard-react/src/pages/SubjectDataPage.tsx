/**
 * SubjectDataPage - Subject Property Data Entry
 * ==============================================
 * 
 * This is the main data entry page (~3,100 lines) for subject property information.
 * It coordinates 30+ extracted components across 7 tabs and is intentionally large
 * as a page-level orchestrator.
 * 
 * ## Tab Structure
 * 1. **Site** - Land/site characteristics, parcel data
 * 2. **Improvements** - Building inventory, component details
 * 3. **Site Improvements** - M&S Section 66 items (paving, landscaping)
 * 4. **Ownership** - Ownership history, sale details
 * 5. **Tax** - Tax assessment, millage rates
 * 6. **Photos** - Photo staging, classification, assignment
 * 7. **Maps** - Map generation, boundary drawing
 * 
 * ## Key Features
 * - Multi-source field suggestions (documents, GIS, Cotality)
 * - Document extraction integration
 * - Photo AI classification
 * - Map generation with boundary drawing
 * - Progress tracking per section
 * 
 * ## Component Dependencies
 * - ImprovementsInventory: Building inventory grid
 * - SiteImprovementsInventory: Site improvements management
 * - PhotoStagingTray: Photo upload and staging
 * - MapGeneratorPanel: ESRI map integration
 * - DemographicsPanel: Census data display
 * 
 * ## Section Navigation (search for `// ===`)
 * - TAB CONFIGURATION: Tab definitions and icons
 * - STATE MANAGEMENT: Local state hooks
 * - TAB CONTENT: Tab-specific render functions
 * - MAIN RENDER: Layout and tab switching
 * 
 * @see DEVELOPER_GUIDE.md for architecture decisions
 */

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import WizardLayout from '../components/WizardLayout';
import ImprovementsInventory from '../components/ImprovementsInventory';
import SiteImprovementsInventory from '../components/SiteImprovementsInventory';
import BoundaryFieldsCard from '../components/BoundaryFieldsCard';
import TrafficDataCard from '../components/TrafficDataCard';
import BuildingPermitsCard from '../components/BuildingPermitsCard';
import MapGeneratorPanel from '../components/MapGeneratorPanel';
import BoundaryDrawingTool from '../components/BoundaryDrawingTool';
import EnhancedTextArea from '../components/EnhancedTextArea';
import WizardGuidancePanel from '../components/WizardGuidancePanel';
import DemographicsPanel from '../components/DemographicsPanel';
import { useWizard } from '../context/WizardContext';
import { DocumentSourceIndicator, getDocumentSourceInputClasses } from '../components/DocumentSourceIndicator';
import { MultiValueSuggestion } from '../components/MultiValueSuggestion';
import type { SiteImprovement, PhotoData } from '../types';
import { fetchTrafficData, type TrafficDataEntry as TrafficServiceEntry } from '../services/trafficService';
import { fetchBuildingPermits, type BuildingPermitEntry as PermitServiceEntry } from '../services/permitsService';
import { UsersIcon } from '../components/icons';
import {
  LocationIcon,
  SiteIcon,
  BuildingIcon,
  TaxIcon,
  PhotoIcon,
  DocumentIcon,
} from '../components/icons';
import {
  Upload, X, FileText, CheckCircle, Image, MapPin, Building2, FileCheck, Camera, Eye, ChevronDown,
  Home, Sofa, Trees, Route, Landmark, FileSignature, Handshake, File as FileIcon, BarChart3, Map, Receipt, Wallet, Folder,
  Sparkles, Loader2, Info, Droplets, Zap, AlertTriangle, Check, Crop
} from 'lucide-react';
import ButtonSelector from '../components/ButtonSelector';
import ExpandableNote from '../components/ExpandableNote';
import PhotoQuickPeek from '../components/PhotoQuickPeek';
import PhotoLivePreview from '../components/PhotoLivePreview';
import PhotoStagingTray from '../components/PhotoStagingTray';
import PhotoAssignmentModal from '../components/PhotoAssignmentModal';
import FloatingDropPanel from '../components/FloatingDropPanel';
import CoverPhotoSection from '../components/CoverPhotoSection';
import CoverPhotoPickerModal from '../components/CoverPhotoPickerModal';
import PhotoCropModal from '../components/PhotoCropModal';
import { autoCropImage, detectCategoryFromFilename, type SmartCropResult } from '../services/smartCropService';
import { SidebarTab } from '../components/SidebarTab';
import { SectionProgressSummary } from '../components/SectionProgressSummary';
import { useCompletion } from '../hooks/useCompletion';
import { useCelebration } from '../hooks/useCelebration';
import { useSmartContinue } from '../hooks/useSmartContinue';
import { SUBJECT_DATA_GUIDANCE, type SectionGuidance } from '../constants/wizardPhaseGuidance';
import { generateDraft } from '../services/aiService';
import type { AIGenerationContext } from '../types/api';
import { getPropertyType } from '../constants/marshallSwift';
import { getFloodZone } from '../services/femaFloodService';

const tabs = [
  { id: 'location', label: 'Location & Area', Icon: LocationIcon },
  { id: 'site', label: 'Site Details', Icon: SiteIcon },
  { id: 'improvements', label: 'Improvements', Icon: BuildingIcon },
  { id: 'demographics', label: 'Demographics', Icon: UsersIcon },
  { id: 'tax', label: 'Tax & Ownership', Icon: TaxIcon },
  { id: 'photos', label: 'Photos', Icon: PhotoIcon },
  { id: 'exhibits', label: 'Exhibits & Docs', Icon: DocumentIcon },
];

// Photo categories based on Rove appraisal standards
interface PhotoSlot {
  id: string;
  label: string;
  description?: string;
  recommended?: boolean;
}

interface PhotoCategory {
  id: string;
  label: string;
  Icon: React.FC<{ className?: string }>;
  description: string;
  slots: PhotoSlot[];
  reportPages?: string; // Which pages these appear on
}

const photoCategories: PhotoCategory[] = [
  {
    id: 'exterior',
    label: 'Exterior',
    Icon: Home,
    description: 'Building exterior elevations',
    reportPages: 'Subject Photos',
    slots: [
      { id: 'ext_front', label: 'Front Elevation', description: 'Primary street-facing view', recommended: true },
      { id: 'ext_rear', label: 'Rear Elevation', description: 'Back of building', recommended: true },
      { id: 'ext_side_1', label: 'Side Elevation (Left)', description: 'Left side of building' },
      { id: 'ext_side_2', label: 'Side Elevation (Right)', description: 'Right side of building' },
      { id: 'ext_additional_1', label: 'Additional Exterior', description: 'Extra exterior view' },
      { id: 'ext_additional_2', label: 'Additional Exterior', description: 'Extra exterior view' },
    ],
  },
  {
    id: 'interior',
    label: 'Interior',
    Icon: Sofa,
    description: 'Interior spaces and finishes',
    reportPages: 'Subject Photos',
    slots: [
      { id: 'int_lobby', label: 'Lobby/Reception', description: 'Main entrance or reception area' },
      { id: 'int_office', label: 'Typical Office', description: 'Representative office space', recommended: true },
      { id: 'int_conference', label: 'Conference Room', description: 'Meeting/conference space' },
      { id: 'int_shop', label: 'Shop/Warehouse', description: 'Shop or warehouse space if applicable', recommended: true },
      { id: 'int_bathroom', label: 'Bathroom', description: 'Representative bathroom' },
      { id: 'int_mechanical', label: 'Mechanical Room', description: 'HVAC or mechanical systems' },
      { id: 'int_mezzanine', label: 'Mezzanine', description: 'Mezzanine level if present' },
      { id: 'int_kitchen', label: 'Kitchen/Break Room', description: 'Kitchen or break room area' },
      { id: 'int_additional_1', label: 'Additional Interior', description: 'Extra interior view' },
      { id: 'int_additional_2', label: 'Additional Interior', description: 'Extra interior view' },
      { id: 'int_additional_3', label: 'Additional Interior', description: 'Extra interior view' },
      { id: 'int_additional_4', label: 'Additional Interior', description: 'Extra interior view' },
    ],
  },
  {
    id: 'site',
    label: 'Site',
    Icon: Trees,
    description: 'Site improvements, parking, and yard areas',
    reportPages: 'Subject Photos',
    slots: [
      { id: 'site_parking', label: 'Parking Area', description: 'Main parking lot or area', recommended: true },
      { id: 'site_yard_n', label: 'Yard/Storage (North)', description: 'Yard facing north' },
      { id: 'site_yard_s', label: 'Yard/Storage (South)', description: 'Yard facing south' },
      { id: 'site_yard_e', label: 'Yard/Storage (East)', description: 'Yard facing east' },
      { id: 'site_yard_w', label: 'Yard/Storage (West)', description: 'Yard facing west' },
    ],
  },
  {
    id: 'street',
    label: 'Street Scene',
    Icon: Route,
    description: 'Views of the street and neighborhood',
    reportPages: 'Subject Photos',
    slots: [
      { id: 'street_east', label: 'Street View Facing East', description: 'View looking east from property', recommended: true },
      { id: 'street_west', label: 'Street View Facing West', description: 'View looking west from property', recommended: true },
    ],
  },
];

// PhotoData is now imported from shared types
export type { PhotoData } from '../types';

export default function SubjectDataPage() {
  const { state: wizardState, setSubjectData, setSiteImprovements, setReportPhotos } = useWizard();
  const [activeTab, setActiveTab] = useState('location');

  // Location tab state - initialize from WizardContext
  // Auto-populate city/county from address entered in Setup phase
  const [cityCounty, setCityCounty] = useState(() => {
    const addr = wizardState.subjectData?.address;

    // Helper to clean up potentially corrupted city/county values
    const cleanValue = (value: string | undefined): string => {
      if (!value) return '';
      // If the value contains multiple commas, it might be corrupted with repeated values
      const parts = value.split(',').map(p => p.trim()).filter(Boolean);
      // Remove duplicates by converting to Set and back to array
      const uniqueParts = [...new Set(parts)];
      return uniqueParts.join(', ');
    };

    const rawCity = addr?.city || '';
    const rawCounty = addr?.county || '';

    // Clean both values first
    const cleanedCity = cleanValue(rawCity);
    const cleanedCounty = cleanValue(rawCounty);

    // If we already have a comma-separated string in city, it might be "City, County" already
    // In that case, use it as-is (after cleaning)
    if (cleanedCity.includes(',')) {
      return cleanedCity;
    }

    // Otherwise, build it from separate city and county
    if (cleanedCity && cleanedCounty) {
      return `${cleanedCity}, ${cleanedCounty}`;
    } else if (cleanedCity) {
      return cleanedCity;
    } else if (cleanedCounty) {
      return cleanedCounty;
    }
    return '';
  });
  const [areaDescription, setAreaDescription] = useState(() => wizardState.subjectData?.areaDescription || '');
  const [neighborhoodBoundaries, setNeighborhoodBoundaries] = useState(() => wizardState.subjectData?.neighborhoodBoundaries || '');
  const [neighborhoodCharacteristics, setNeighborhoodCharacteristics] = useState(() => wizardState.subjectData?.neighborhoodCharacteristics || '');
  const [specificLocation, setSpecificLocation] = useState(() => wizardState.subjectData?.specificLocation || '');

  // AI Draft All state for Location & Area
  const [isDraftingAllLocation, setIsDraftingAllLocation] = useState(false);

  // Build AI context from wizard state
  const aiContext = useMemo((): AIGenerationContext => {
    return {
      propertyType: wizardState.propertyType || 'commercial',
      propertySubtype: wizardState.propertySubtype || undefined,
      siteData: {
        city: wizardState.subjectData?.address?.city,
        state: wizardState.subjectData?.address?.state,
        county: wizardState.subjectData?.address?.county,
        zoning: wizardState.subjectData?.zoningClass,
        siteSize: wizardState.subjectData?.siteArea,
        topography: wizardState.subjectData?.topography,
        shape: wizardState.subjectData?.shape,
      },
      // Include site improvements inventory for AI drafts
      siteImprovements: (wizardState.siteImprovements || []).map(imp => ({
        typeName: imp.typeName,
        quantity: imp.quantity,
        unit: imp.unit,
        yearInstalled: imp.yearInstalled ?? undefined,
        condition: imp.condition,
      })),
    };
  }, [wizardState]);

  // Handler for AI Draft All - Location & Area section
  // Calls the real OpenAI API to generate professional appraisal text
  const handleDraftAllLocation = useCallback(async () => {
    setIsDraftingAllLocation(true);

    try {
      // Generate all 4 sections using the AI API with specific prompts
      // Area Description
      const areaDescriptionDraft = await generateDraft('area_description', aiContext);
      setAreaDescription(areaDescriptionDraft);

      // Neighborhood Boundaries (uses dedicated neighborhood_boundaries prompt)
      const neighborhoodBoundariesDraft = await generateDraft('neighborhood_boundaries', aiContext);
      setNeighborhoodBoundaries(neighborhoodBoundariesDraft);

      // Neighborhood Characteristics (uses dedicated neighborhood_characteristics prompt)
      const neighborhoodCharacteristicsDraft = await generateDraft('neighborhood_characteristics', aiContext);
      setNeighborhoodCharacteristics(neighborhoodCharacteristicsDraft);

      // Specific Location (uses dedicated specific_location prompt)
      const specificLocationDraft = await generateDraft('specific_location', aiContext);
      setSpecificLocation(specificLocationDraft);

    } catch (error) {
      console.error('Error generating AI drafts:', error);
      // Show error to user
      alert('Failed to generate AI drafts. Please check your API configuration and try again.');
    } finally {
      setIsDraftingAllLocation(false);
    }
  }, [aiContext]);

  // Site tab state - initialize from WizardContext
  const [acres, setAcres] = useState(() => wizardState.subjectData?.siteAreaUnit === 'acres' ? wizardState.subjectData?.siteArea || '' : '');
  const [squareFeet, setSquareFeet] = useState(() => wizardState.subjectData?.siteAreaUnit === 'sqft' ? wizardState.subjectData?.siteArea || '' : '');
  const [shape, setShape] = useState(() => wizardState.subjectData?.shape || '');
  const [frontage, setFrontage] = useState(() => wizardState.subjectData?.frontage || '');
  const [siteNotes, setSiteNotes] = useState('');
  const [zoningClass, setZoningClass] = useState(() => wizardState.subjectData?.zoningClass || '');
  const [zoningDescription, setZoningDescription] = useState(() => wizardState.subjectData?.zoningDescription || '');
  const [zoningConformance, setZoningConformance] = useState(() => wizardState.subjectData?.zoningConforming ? 'conforming' : '');
  const [topography, setTopography] = useState(() => wizardState.subjectData?.topography || '');
  const [drainage, setDrainage] = useState('');
  const [environmental, setEnvironmental] = useState(() => wizardState.subjectData?.environmental || '');
  const [easements, setEasements] = useState(() => wizardState.subjectData?.easements || '');

  // Expanded Utilities state
  const [waterSource, setWaterSource] = useState('');
  const [waterProvider, setWaterProvider] = useState('');
  const [waterNotes, setWaterNotes] = useState('');
  const [sewerType, setSewerType] = useState('');
  const [sewerNotes, setSewerNotes] = useState('');
  const [electricProvider, setElectricProvider] = useState('');
  const [electricAdequacy, setElectricAdequacy] = useState('');
  const [electricNotes, setElectricNotes] = useState('');
  const [naturalGas, setNaturalGas] = useState('');
  const [naturalGasNotes, setNaturalGasNotes] = useState('');
  const [telecom, setTelecom] = useState('');
  const [telecomNotes, setTelecomNotes] = useState('');

  // Storm Drainage & Fire Protection state
  const [stormDrainage, setStormDrainage] = useState('');
  const [stormDrainageNotes, setStormDrainageNotes] = useState('');
  const [fireHydrantDistance, setFireHydrantDistance] = useState('');

  // Enhanced Flood Zone state
  const [femaZone, setFemaZone] = useState('');
  const [femaMapPanel, setFemaMapPanel] = useState('');
  const [femaMapDate, setFemaMapDate] = useState('');
  const [floodInsuranceRequired, setFloodInsuranceRequired] = useState('');
  const [floodZoneNotes, setFloodZoneNotes] = useState('');
  const [isLookingUpFloodZone, setIsLookingUpFloodZone] = useState(false);
  const [floodZoneLookupError, setFloodZoneLookupError] = useState<string | null>(null);

  // Site Description Narrative - initialize from WizardContext
  const [siteDescriptionNarrative, setSiteDescriptionNarrative] = useState(() =>
    wizardState.subjectData?.siteDescriptionNarrative || ''
  );
  const [isDraftingSiteDescription, setIsDraftingSiteDescription] = useState(false);

  // Property Boundaries - initialize from WizardContext
  const [northBoundary, setNorthBoundary] = useState(() => wizardState.subjectData?.northBoundary || '');
  const [southBoundary, setSouthBoundary] = useState(() => wizardState.subjectData?.southBoundary || '');
  const [eastBoundary, setEastBoundary] = useState(() => wizardState.subjectData?.eastBoundary || '');
  const [westBoundary, setWestBoundary] = useState(() => wizardState.subjectData?.westBoundary || '');

  // Traffic Data state (types defined at module level)
  const [trafficData, setTrafficData] = useState<TrafficDataEntry[]>([]);
  const [selectedRoadClass, setSelectedRoadClass] = useState('all');
  const [trafficNotes, setTrafficNotes] = useState('');
  const [isRefreshingTraffic, setIsRefreshingTraffic] = useState(false);
  const [trafficDataSource, setTrafficDataSource] = useState<'mdot' | 'cotality' | 'manual' | 'mock' | null>(null);

  // Building Permits state (types defined at module level)
  const [permits, setPermits] = useState<BuildingPermitEntry[]>([]);
  const [selectedPermitType, setSelectedPermitType] = useState('all');
  const [permitNotes, setPermitNotes] = useState('');
  const [isRefreshingPermits, setIsRefreshingPermits] = useState(false);
  const [permitsDataSource, setPermitsDataSource] = useState<'county' | 'cotality' | 'manual' | 'mock' | null>(null);

  // Coordinates from wizard state
  const latitude = wizardState.subjectData?.coordinates?.latitude;
  const longitude = wizardState.subjectData?.coordinates?.longitude;
  const propertyState = wizardState.subjectData?.address?.state;

  // Refresh traffic data from API
  const handleRefreshTraffic = useCallback(async () => {
    if (!latitude || !longitude) {
      console.log('[Traffic] No coordinates available');
      return;
    }

    setIsRefreshingTraffic(true);
    try {
      const result = await fetchTrafficData(latitude, longitude, propertyState);
      if (result.data && result.data.length > 0) {
        // Map service types to local types
        const mappedData: TrafficDataEntry[] = result.data.map(d => ({
          roadName: d.roadName,
          roadClass: d.roadClass,
          annualAverageDailyTraffic: d.annualAverageDailyTraffic,
          truckPercentage: d.truckPercentage,
          speedLimit: d.speedLimit,
          lanesCount: d.lanesCount,
          distance: d.distance,
          direction: d.direction,
          year: d.year,
        }));
        setTrafficData(mappedData);
        setTrafficDataSource(result.source === 'mdot' ? 'mdot' : result.source === 'mock' ? 'mock' : 'manual');
      }
    } catch (error) {
      console.error('Failed to refresh traffic data:', error);
    } finally {
      setIsRefreshingTraffic(false);
    }
  }, [latitude, longitude, propertyState]);

  // Refresh permits data from API
  const handleRefreshPermits = useCallback(async () => {
    const address = wizardState.subjectData?.address;
    if (!address?.street || !address?.city) {
      console.log('[Permits] No address available');
      return;
    }

    setIsRefreshingPermits(true);
    try {
      const result = await fetchBuildingPermits({
        address: address.street,
        city: address.city,
        state: address.state,
        county: address.county,
        parcelId: wizardState.subjectData?.cadastralData?.parcelId,
      });
      if (result.data) {
        // Map service types to local types
        const mappedData: BuildingPermitEntry[] = result.data.map(d => ({
          id: d.id,
          permitNumber: d.permitNumber,
          permitType: d.permitType,
          description: d.description,
          issuedDate: d.issuedDate,
          completedDate: d.completedDate,
          status: d.status,
          estimatedValue: d.estimatedValue,
          actualValue: d.actualValue,
          contractor: d.contractor,
          inspectionsPassed: d.inspectionsPassed,
          inspectionsRequired: d.inspectionsRequired,
        }));
        setPermits(mappedData);
        setPermitsDataSource(result.source === 'county' ? 'county' : result.source === 'mock' ? 'mock' : 'manual');
      }
    } catch (error) {
      console.error('Failed to refresh permit data:', error);
    } finally {
      setIsRefreshingPermits(false);
    }
  }, [wizardState.subjectData?.address, wizardState.subjectData?.cadastralData?.parcelId]);

  // Tax tab state (local - tax assessment details)
  const [taxYear, setTaxYear] = useState(new Date().getFullYear().toString());
  const [taxAmount, setTaxAmount] = useState('');
  const [assessedLand, setAssessedLand] = useState('');
  const [assessedImprovements, setAssessedImprovements] = useState('');
  const [totalAssessed, setTotalAssessed] = useState('');
  const [millLevy, setMillLevy] = useState('');
  const [taxDataAutoFilled, setTaxDataAutoFilled] = useState(false);

  // Auto-populate tax fields from cadastralData when available
  useEffect(() => {
    const cadastral = wizardState.subjectData?.cadastralData;
    if (cadastral && !taxDataAutoFilled) {
      // Only auto-fill if fields are empty
      if (!assessedLand && cadastral.assessedLandValue) {
        setAssessedLand(`$${cadastral.assessedLandValue.toLocaleString()}`);
      }
      if (!assessedImprovements && cadastral.assessedImprovementValue) {
        setAssessedImprovements(`$${cadastral.assessedImprovementValue.toLocaleString()}`);
      }
      if (!totalAssessed && cadastral.totalAssessedValue) {
        setTotalAssessed(`$${cadastral.totalAssessedValue.toLocaleString()}`);
      }
      if (cadastral.taxYear) {
        setTaxYear(cadastral.taxYear.toString());
      }
      setTaxDataAutoFilled(true);
    }
  }, [wizardState.subjectData?.cadastralData, taxDataAutoFilled, assessedLand, assessedImprovements, totalAssessed]);

  // Sale history from WizardContext (centralized)
  const lastSaleDate = wizardState.subjectData?.lastSaleDate || '';
  const lastSalePrice = wizardState.subjectData?.lastSalePrice || '';
  const transactionHistory = wizardState.subjectData?.transactionHistory || '';
  // Setters for centralized sale history
  const setLastSaleDate = (v: string) => setSubjectData({ lastSaleDate: v });
  const setLastSalePrice = (v: string) => setSubjectData({ lastSalePrice: v });
  const setTransactionHistory = (v: string) => setSubjectData({ transactionHistory: v });
  const [grantor, setGrantor] = useState('');
  const [grantee, setGrantee] = useState('');

  // Sync location & site form fields to WizardContext when they change
  // NOTE: We do NOT update address.county here - that's set in Setup and should not be
  // overwritten with the display-only cityCounty value (which is city + county concatenated)
  useEffect(() => {
    setSubjectData({
      // Location fields - preserve existing address, don't overwrite county
      address: wizardState.subjectData?.address,
      areaDescription,
      neighborhoodBoundaries,
      neighborhoodCharacteristics,
      specificLocation,
      // Site fields
      siteArea: acres || squareFeet,
      siteAreaUnit: acres ? 'acres' : 'sqft',
      shape,
      frontage,
      topography,
      environmental,
      easements,
      zoningClass,
      zoningDescription,
      zoningConforming: zoningConformance === 'conforming',
      // Utilities
      waterSource,
      sewerType,
      electricProvider,
      naturalGas,
      telecom,
      // Flood Zone
      femaZone,
      femaMapPanel,
      femaMapDate,
      floodInsuranceRequired,
      // Narratives
      siteDescriptionNarrative,
      // Property Boundaries
      northBoundary,
      southBoundary,
      eastBoundary,
      westBoundary,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- wizardState.subjectData?.address intentionally omitted to prevent infinite loop
  }, [areaDescription, neighborhoodBoundaries, neighborhoodCharacteristics, specificLocation,
    acres, squareFeet, shape, frontage, topography, environmental, easements,
    zoningClass, zoningDescription, zoningConformance,
    waterSource, sewerType, electricProvider, naturalGas, telecom,
    femaZone, femaMapPanel, femaMapDate, floodInsuranceRequired,
    siteDescriptionNarrative, northBoundary, southBoundary, eastBoundary, westBoundary,
    setSubjectData]);

  // Photos state with metadata support
  const [photos, setPhotos] = useState<Record<string, PhotoData | null>>({});
  const [photoToPreview, setPhotoToPreview] = useState<{ slotId: string; photo: PhotoData } | null>(null);

  // Default metadata values from appraiser info and inspection date
  const defaultTakenBy = useMemo(() => {
    const name = wizardState.subjectData?.inspectorName || '';
    const license = wizardState.subjectData?.inspectorLicense || '';
    return name ? (license ? `${name}, ${license}` : name) : '';
  }, [wizardState.subjectData?.inspectorName, wizardState.subjectData?.inspectorLicense]);

  const defaultTakenDate = wizardState.subjectData?.inspectionDate || '';

  // Exhibits state
  const [exhibits, setExhibits] = useState<Record<string, { file: File; name: string } | null>>({});
  const [includeInReport, setIncludeInReport] = useState<Record<string, boolean>>({});


  // Load extracted data
  useEffect(() => {
    const stored = sessionStorage.getItem('harken_extracted_data');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        if (data.cadastral?.owner?.value) setGrantee(data.cadastral.owner.value);
      } catch (e) {
        console.warn('Failed to load extracted data');
      }
    }
  }, []);

  const handlePhotoUpload = (slotId: string, file: File) => {
    const preview = URL.createObjectURL(file);
    setPhotos(prev => ({
      ...prev,
      [slotId]: {
        file,
        preview,
        caption: '',
        takenBy: defaultTakenBy,
        takenDate: defaultTakenDate,
      }
    }));
  };

  const removePhoto = (slotId: string) => {
    if (photos[slotId]?.preview) {
      URL.revokeObjectURL(photos[slotId]!.preview);
    }
    setPhotos(prev => ({ ...prev, [slotId]: null }));
  };

  const updatePhotoMetadata = (slotId: string, updates: Partial<PhotoData>) => {
    setPhotos(prev => {
      const existing = prev[slotId];
      if (!existing) return prev;
      return { ...prev, [slotId]: { ...existing, ...updates } };
    });
  };

  // Handle preview photo in report context
  const handlePreviewPhoto = (slotId: string, photo: PhotoData) => {
    setPhotoToPreview({ slotId, photo });
  };

  // Sync photos to WizardContext for report preview
  useEffect(() => {
    const assignments = Object.entries(photos)
      .filter(([, photo]) => photo !== null)
      .map(([slotId, photo], index) => ({
        id: `photo-${slotId}`,
        photoId: slotId,
        slotId,
        caption: photo!.caption,
        sortOrder: index,
        url: photo!.preview,
      }));

    setReportPhotos({
      assignments,
      coverPhotoId: wizardState.coverPhoto?.id ?? null,
    });
  }, [photos, wizardState.coverPhoto?.id, setReportPhotos]);

  const handleExhibitUpload = (slotId: string, file: File) => {
    // Update local state (legacy, but might be used elsewhere)
    setExhibits(prev => ({ ...prev, [slotId]: { file, name: file.name } }));
    setIncludeInReport(prev => ({ ...prev, [slotId]: true }));

    // Sync to WizardContext for Report Preview
    // We create a proper UploadedDocument object
    const newDoc: import('../types').UploadedDocument = {
      id: slotId.startsWith('exhibit_') ? slotId : `exhibit_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      documentType: 'unknown', // Custom exhibits are generic by default
      status: 'ready',
      includeInReport: true,
      uploadDate: new Date().toISOString(),
      slotId: 'custom_exhibit', // Mark as custom
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
    };

    console.log('[SubjectDataPage] Adding custom exhibit to context:', newDoc);
    addUploadedDocument(newDoc);
  };

  const removeExhibit = (slotId: string) => {
    setExhibits(prev => ({ ...prev, [slotId]: null }));
  };

  // Progress tracking
  const { tabCompletions, sectionCompletion, trackTabChange } = useCompletion('subjectData');
  const { checkAndTriggerCelebration } = useCelebration();

  // Track tab changes for smart navigation
  useEffect(() => {
    trackTabChange(activeTab);
  }, [activeTab, trackTabChange]);

  // Check if section just completed
  useEffect(() => {
    if (sectionCompletion === 100) {
      checkAndTriggerCelebration('subjectData');
    }
  }, [sectionCompletion, checkAndTriggerCelebration]);

  // Smart continue logic
  const { handleContinue } = useSmartContinue({
    sectionId: 'subjectData',
    tabs: tabs.map(t => t.id),
    activeTab,
    setActiveTab,
    currentPhase: 4,
  });

  // Get completion percentage for a specific tab
  const getTabCompletion = (tabId: string): number => {
    const tabData = tabCompletions.find(t => t.id === tabId);
    return tabData?.completion || 0;
  };

  const sidebar = (
    <div>
      <h2 className="text-lg font-bold text-harken-dark dark:text-white mb-1">Subject Property</h2>
      <p className="text-sm text-harken-gray dark:text-slate-400 mb-6">
        {wizardState.propertyType ? `${wizardState.propertyType} • ${wizardState.propertySubtype || 'General'}` : 'Commercial • Industrial'}
      </p>
      <nav className="space-y-1">
        {tabs.map((tab) => (
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
  const currentGuidance = useMemo((): SectionGuidance | null => {
    return SUBJECT_DATA_GUIDANCE[activeTab] || null;
  }, [activeTab]);

  // Guidance panel for the right sidebar
  const helpSidebar = (
    <WizardGuidancePanel
      guidance={currentGuidance}
      themeColor="harken-blue"
    />
  );

  // Live preview panel for the photos tab
  const previewSidebar = activeTab === 'photos' ? (
    <PhotoLivePreview
      photos={photos}
      defaultTakenBy={defaultTakenBy}
      defaultTakenDate={defaultTakenDate}
    />
  ) : null;

  return (
    <WizardLayout
      title="Subject Property Data"
      subtitle="Phase 4 of 6 • Detailed Property Information"
      phase={4}
      sidebar={sidebar}
      helpSidebarGuidance={helpSidebar}
      helpSidebarPreview={previewSidebar}
      showPreviewMode={activeTab === 'photos'}
      onContinue={handleContinue}
    >
      <div className="animate-fade-in">
        {activeTab === 'improvements' ? (
          <ImprovementsInventory />
        ) : activeTab === 'location' ? (
          <LocationContent
            cityCounty={cityCounty}
            setCityCounty={setCityCounty}
            areaDescription={areaDescription}
            setAreaDescription={setAreaDescription}
            neighborhoodBoundaries={neighborhoodBoundaries}
            setNeighborhoodBoundaries={setNeighborhoodBoundaries}
            neighborhoodCharacteristics={neighborhoodCharacteristics}
            setNeighborhoodCharacteristics={setNeighborhoodCharacteristics}
            specificLocation={specificLocation}
            setSpecificLocation={setSpecificLocation}
            onDraftAll={handleDraftAllLocation}
            isDraftingAll={isDraftingAllLocation}
            contextData={aiContext}
          />
        ) : activeTab === 'site' ? (
          <SiteContent
            // Property type for filtering
            propertyType={wizardState.propertyType}
            // Site Size & Shape
            acres={acres}
            setAcres={setAcres}
            squareFeet={squareFeet}
            setSquareFeet={setSquareFeet}
            shape={shape}
            setShape={setShape}
            frontage={frontage}
            setFrontage={setFrontage}
            siteNotes={siteNotes}
            setSiteNotes={setSiteNotes}
            // Zoning
            zoningClass={zoningClass}
            setZoningClass={setZoningClass}
            zoningDescription={zoningDescription}
            setZoningDescription={setZoningDescription}
            zoningConformance={zoningConformance}
            setZoningConformance={setZoningConformance}
            // Utilities
            waterSource={waterSource}
            setWaterSource={setWaterSource}
            waterProvider={waterProvider}
            setWaterProvider={setWaterProvider}
            waterNotes={waterNotes}
            setWaterNotes={setWaterNotes}
            sewerType={sewerType}
            setSewerType={setSewerType}
            sewerNotes={sewerNotes}
            setSewerNotes={setSewerNotes}
            electricProvider={electricProvider}
            setElectricProvider={setElectricProvider}
            electricAdequacy={electricAdequacy}
            setElectricAdequacy={setElectricAdequacy}
            electricNotes={electricNotes}
            setElectricNotes={setElectricNotes}
            naturalGas={naturalGas}
            setNaturalGas={setNaturalGas}
            naturalGasNotes={naturalGasNotes}
            setNaturalGasNotes={setNaturalGasNotes}
            telecom={telecom}
            setTelecom={setTelecom}
            telecomNotes={telecomNotes}
            setTelecomNotes={setTelecomNotes}
            // Storm Drainage & Fire Protection
            stormDrainage={stormDrainage}
            setStormDrainage={setStormDrainage}
            stormDrainageNotes={stormDrainageNotes}
            setStormDrainageNotes={setStormDrainageNotes}
            fireHydrantDistance={fireHydrantDistance}
            setFireHydrantDistance={setFireHydrantDistance}
            // Site Improvements Inventory (M&S Section 66)
            siteImprovements={wizardState.siteImprovements || []}
            onSiteImprovementsChange={setSiteImprovements}
            // Additional Characteristics
            topography={topography}
            setTopography={setTopography}
            drainage={drainage}
            setDrainage={setDrainage}
            environmental={environmental}
            setEnvironmental={setEnvironmental}
            easements={easements}
            setEasements={setEasements}
            // Flood Zone
            femaZone={femaZone}
            setFemaZone={setFemaZone}
            femaMapPanel={femaMapPanel}
            setFemaMapPanel={setFemaMapPanel}
            femaMapDate={femaMapDate}
            setFemaMapDate={setFemaMapDate}
            floodInsuranceRequired={floodInsuranceRequired}
            setFloodInsuranceRequired={setFloodInsuranceRequired}
            floodZoneNotes={floodZoneNotes}
            setFloodZoneNotes={setFloodZoneNotes}
            isLookingUpFloodZone={isLookingUpFloodZone}
            setIsLookingUpFloodZone={setIsLookingUpFloodZone}
            floodZoneLookupError={floodZoneLookupError}
            setFloodZoneLookupError={setFloodZoneLookupError}
            subjectCoordinates={wizardState.subjectData?.coordinates}
            // Site Description Narrative
            siteDescriptionNarrative={siteDescriptionNarrative}
            setSiteDescriptionNarrative={setSiteDescriptionNarrative}
            isDraftingSiteDescription={isDraftingSiteDescription}
            setIsDraftingSiteDescription={setIsDraftingSiteDescription}
            // Property Boundaries
            northBoundary={northBoundary}
            setNorthBoundary={setNorthBoundary}
            southBoundary={southBoundary}
            setSouthBoundary={setSouthBoundary}
            eastBoundary={eastBoundary}
            setEastBoundary={setEastBoundary}
            westBoundary={westBoundary}
            setWestBoundary={setWestBoundary}
            latitude={wizardState.subjectData?.coordinates?.latitude}
            longitude={wizardState.subjectData?.coordinates?.longitude}
            cadastralData={wizardState.subjectData?.cadastralData}
            subjectAddress={wizardState.subjectData?.address ?
              `${wizardState.subjectData.address.street}, ${wizardState.subjectData.address.city}, ${wizardState.subjectData.address.state} ${wizardState.subjectData.address.zip}` : undefined}
            propertyBoundaryCoordinates={wizardState.subjectData?.propertyBoundaryCoordinates}
            onPropertyBoundaryChange={(coords) => setSubjectData({ propertyBoundaryCoordinates: coords })}
            // Traffic Data
            trafficData={trafficData}
            setTrafficData={setTrafficData}
            selectedRoadClass={selectedRoadClass}
            setSelectedRoadClass={setSelectedRoadClass}
            trafficNotes={trafficNotes}
            setTrafficNotes={setTrafficNotes}
            // Building Permits
            permits={permits}
            setPermits={setPermits}
            selectedPermitType={selectedPermitType}
            setSelectedPermitType={setSelectedPermitType}
            permitNotes={permitNotes}
            setPermitNotes={setPermitNotes}
            // API refresh handlers
            onRefreshTraffic={handleRefreshTraffic}
            isRefreshingTraffic={isRefreshingTraffic}
            trafficDataSource={trafficDataSource}
            onRefreshPermits={handleRefreshPermits}
            isRefreshingPermits={isRefreshingPermits}
            permitsDataSource={permitsDataSource}
          />
        ) : activeTab === 'demographics' ? (
          <DemographicsContent
            latitude={wizardState.subjectData?.coordinates?.latitude}
            longitude={wizardState.subjectData?.coordinates?.longitude}
          />
        ) : activeTab === 'tax' ? (
          <TaxContent
            taxYear={taxYear}
            setTaxYear={setTaxYear}
            taxAmount={taxAmount}
            setTaxAmount={setTaxAmount}
            assessedLand={assessedLand}
            setAssessedLand={setAssessedLand}
            assessedImprovements={assessedImprovements}
            setAssessedImprovements={setAssessedImprovements}
            totalAssessed={totalAssessed}
            setTotalAssessed={setTotalAssessed}
            millLevy={millLevy}
            setMillLevy={setMillLevy}
            lastSaleDate={lastSaleDate}
            setLastSaleDate={setLastSaleDate}
            lastSalePrice={lastSalePrice}
            setLastSalePrice={setLastSalePrice}
            grantor={grantor}
            setGrantor={setGrantor}
            grantee={grantee}
            setGrantee={setGrantee}
            transactionHistory={transactionHistory}
            setTransactionHistory={setTransactionHistory}
            isAutoFilled={taxDataAutoFilled}
          />
        ) : activeTab === 'photos' ? (
          <PhotosContent
            photos={photos}
            onUpload={handlePhotoUpload}
            onRemove={removePhoto}
            onUpdateMetadata={updatePhotoMetadata}
            defaultTakenBy={defaultTakenBy}
            defaultTakenDate={defaultTakenDate}
            onPreviewPhoto={handlePreviewPhoto}
          />
        ) : (
          <ExhibitsContent
            exhibits={exhibits}
            includeInReport={includeInReport}
            setIncludeInReport={setIncludeInReport}
            onUpload={handleExhibitUpload}
            onRemove={removeExhibit}
          />
        )}
      </div>

      {/* Full Screen Photo Preview Modal */}
      {photoToPreview && (
        <div
          className="fixed inset-0 z-[2000] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 transition-all duration-300 animate-fade-in"
          onClick={() => setPhotoToPreview(null)}
        >
          <div
            className="relative max-w-5xl w-full max-h-[90vh] flex flex-col group"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-4 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-harken-blue/20 flex items-center justify-center border border-harken-blue/30 overflow-hidden">
                  <img src={photoToPreview.photo.preview} alt="" className="w-full h-full object-cover blur-[2px] opacity-50" />
                  <Camera className="w-5 h-5 text-harken-blue absolute" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">
                    {photoCategories.flatMap(c => c.slots).find(s => s.id === photoToPreview.slotId)?.label || 'Photo Preview'}
                  </h3>
                  <p className="text-sm text-slate-400">
                    {photoToPreview.photo.caption || 'No caption provided'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPhotoToPreview(null)}
                className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all hover:scale-110 active:scale-95 border border-white/10"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Image Container */}
            <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-white/10 flex items-center justify-center relative min-h-[400px]">
              <img
                src={photoToPreview.photo.preview}
                alt={photoToPreview.photo.caption}
                className="max-w-full max-h-[75vh] object-contain select-none"
              />

              {/* Overlay Action Button */}
              <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => setPhotoToPreview(null)}
                  className="px-6 py-2.5 bg-harken-blue text-white rounded-xl shadow-lg shadow-harken-blue/20 hover:bg-harken-blue/90 transition-all font-medium"
                >
                  Accept & Close
                </button>
              </div>
            </div>

            {/* Modal Footer Info */}
            <div className="mt-4 flex items-center justify-between text-xs text-slate-500 font-medium uppercase tracking-wider">
              <div className="flex items-center gap-4">
                <span>Taken By: {photoToPreview.photo.takenBy || 'Unknown'}</span>
                <span>Date: {photoToPreview.photo.takenDate || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2 text-harken-blue">
                <div className="w-2 h-2 rounded-full bg-harken-blue animate-pulse" />
                Full Resolution View
              </div>
            </div>
          </div>
        </div>
      )}
    </WizardLayout>
  );
}

// ==========================================
// LOCATION CONTENT - Matches HTML Prototype
// ==========================================
interface LocationProps {
  cityCounty: string;
  setCityCounty: (v: string) => void;
  areaDescription: string;
  setAreaDescription: (v: string) => void;
  neighborhoodBoundaries: string;
  setNeighborhoodBoundaries: (v: string) => void;
  neighborhoodCharacteristics: string;
  setNeighborhoodCharacteristics: (v: string) => void;
  specificLocation: string;
  setSpecificLocation: (v: string) => void;
  onDraftAll?: () => void;
  isDraftingAll?: boolean;
  contextData?: AIGenerationContext;
}

function LocationContent({
  cityCounty, setCityCounty,
  areaDescription, setAreaDescription,
  neighborhoodBoundaries, setNeighborhoodBoundaries,
  neighborhoodCharacteristics, setNeighborhoodCharacteristics,
  specificLocation, setSpecificLocation,
  onDraftAll,
  isDraftingAll = false,
  contextData,
}: LocationProps) {
  return (
    <div className="space-y-6">
      {/* Page Header with AI Draft All Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-harken-dark dark:text-white">Location & Area Analysis</h2>
          <p className="text-sm text-harken-gray mt-1">Describe the regional, neighborhood, and specific location context</p>
        </div>
        <button
          onClick={onDraftAll}
          disabled={isDraftingAll}
          className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-gradient-light-from to-gradient-light-to rounded-lg hover:from-gradient-light-hover-from hover:to-gradient-light-hover-to flex items-center gap-2 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isDraftingAll ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Drafting All...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              AI Draft All (4 Sections)
            </>
          )}
        </button>
      </div>

      {/* General Area Analysis */}
      <div className="bg-surface-1 dark:bg-elevation-1 border border-light-border dark:border-dark-border rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-harken-dark dark:text-white border-b-2 border-light-border dark:border-harken-gray pb-3 mb-4">
          General Area Analysis
        </h3>
        <div className="space-y-4">
          {/* City/County - Auto-populated from Setup */}
          <div>
            <label className="block text-sm font-medium text-harken-dark dark:text-slate-200 mb-1">
              City/County <span className="text-harken-error">*</span>
            </label>
            {cityCounty ? (
              <div className="flex items-center gap-2">
                <div className="flex-1 px-3 py-2 bg-accent-teal-mint-light border border-accent-teal-mint-light rounded-lg text-sm text-accent-teal-mint font-medium flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-accent-teal-mint" />
                  {cityCounty}
                </div>
                <div className="flex items-center gap-1 text-xs text-accent-teal-mint bg-accent-teal-mint-light px-2 py-1 rounded-md">
                  <Info className="w-3 h-3" />
                  <span>Auto-filled from Setup</span>
                </div>
              </div>
            ) : (
              <input
                type="text"
                value={cityCounty}
                onChange={(e) => setCityCounty(e.target.value)}
                placeholder="Enter city and county (e.g., Billings, Yellowstone County)"
                className="w-full px-3 py-2 border border-light-border dark:border-harken-gray rounded-lg text-sm focus:ring-2 focus:ring-harken-blue focus:border-transparent bg-surface-1 dark:bg-elevation-1 dark:text-white"
              />
            )}
          </div>
          <EnhancedTextArea
            id="area_description"
            label="Area Description"
            value={areaDescription}
            onChange={setAreaDescription}
            placeholder="Describe the general area, economic conditions, population trends, major employers, and overall market conditions..."
            rows={6}
            sectionContext="area_description"
            helperText="AI can help draft a professional area description based on the selected location."
            contextData={contextData}
          />
        </div>
      </div>

      {/* Neighborhood Analysis */}
      <div className="bg-surface-1 dark:bg-elevation-1 border border-light-border dark:border-dark-border rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-harken-dark dark:text-white border-b-2 border-light-border dark:border-harken-gray pb-3 mb-4">
          Neighborhood Analysis
        </h3>
        <div className="space-y-4">
          <EnhancedTextArea
            id="neighborhood_boundaries"
            label="Neighborhood Boundaries"
            value={neighborhoodBoundaries}
            onChange={setNeighborhoodBoundaries}
            placeholder="Define the neighborhood boundaries using specific streets, landmarks, or geographic features. North: ..., South: ..., East: ..., West: ..."
            rows={5}
            sectionContext="neighborhood_boundaries"
            helperText="Describe boundaries using recognizable landmarks and street names."
            contextData={contextData}
          />
          <EnhancedTextArea
            id="neighborhood_characteristics"
            label="Neighborhood Characteristics"
            value={neighborhoodCharacteristics}
            onChange={setNeighborhoodCharacteristics}
            placeholder="Describe predominant land uses, development patterns, age and condition of properties, access/transportation, schools, shopping, employment centers, and any factors affecting property values..."
            rows={6}
            sectionContext="neighborhood_characteristics"
            helperText="Include factors that influence desirability and market appeal."
            contextData={contextData}
          />
        </div>
      </div>

      {/* Location Description */}
      <div className="bg-surface-1 dark:bg-elevation-1 border border-light-border dark:border-dark-border rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-harken-dark dark:text-white border-b-2 border-light-border dark:border-harken-gray pb-3 mb-4">
          Location Description
        </h3>
        <EnhancedTextArea
          id="specific_location"
          label="Specific Location"
          value={specificLocation}
          onChange={setSpecificLocation}
          placeholder="Describe the property's exact location including street address relationship, proximity to major intersections, landmarks, and directional references..."
          rows={5}
          sectionContext="specific_location"
          helperText="Be specific enough that a reader could locate the property from this description."
          required
          contextData={contextData}
        />
      </div>
    </div>
  );
}

// ==========================================
// DEMOGRAPHICS CONTENT
// ==========================================
interface DemographicsProps {
  latitude?: number;
  longitude?: number;
}

function DemographicsContent({ latitude, longitude }: DemographicsProps) {
  const { setDemographicsData } = useWizard();
  const hasCoordinates = latitude !== undefined && longitude !== undefined;

  const handleDataLoaded = (data: import('../types/api').RadiusDemographics[]) => {
    // Save demographics data to wizard state for report generation
    setDemographicsData({
      radiusAnalysis: data,
      dataSource: 'census',
      dataPullDate: new Date().toISOString(),
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-harken-blue/5 to-transparent border border-harken-blue/20 rounded-xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-harken-blue flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-slate-800 dark:text-white">Neighborhood Demographics</h4>
            <p className="text-sm text-slate-600">
              View demographic data for the 1, 3, and 5 mile radius rings around the subject property.
              This data is automatically fetched from the US Census Bureau.
            </p>
          </div>
        </div>
      </div>

      {hasCoordinates ? (
        <DemographicsPanel
          latitude={latitude}
          longitude={longitude}
          onDataLoaded={handleDataLoaded}
        />
      ) : (
        <div className="text-center py-12 text-slate-500">
          <p>Enter a property address to view demographic data.</p>
        </div>
      )}
    </div>
  );
}

// ==========================================
// SITE CONTENT - Enhanced with ButtonSelectors
// ==========================================
interface SiteProps {
  // Property type for filtering
  propertyType: string | null;
  // Site Size & Shape
  acres: string;
  setAcres: (v: string) => void;
  squareFeet: string;
  setSquareFeet: (v: string) => void;
  shape: string;
  setShape: (v: string) => void;
  frontage: string;
  setFrontage: (v: string) => void;
  siteNotes: string;
  setSiteNotes: (v: string) => void;
  // Zoning
  zoningClass: string;
  setZoningClass: (v: string) => void;
  zoningDescription: string;
  setZoningDescription: (v: string) => void;
  zoningConformance: string;
  setZoningConformance: (v: string) => void;
  // Utilities
  waterSource: string;
  setWaterSource: (v: string) => void;
  waterProvider: string;
  setWaterProvider: (v: string) => void;
  waterNotes: string;
  setWaterNotes: (v: string) => void;
  sewerType: string;
  setSewerType: (v: string) => void;
  sewerNotes: string;
  setSewerNotes: (v: string) => void;
  electricProvider: string;
  setElectricProvider: (v: string) => void;
  electricAdequacy: string;
  setElectricAdequacy: (v: string) => void;
  electricNotes: string;
  setElectricNotes: (v: string) => void;
  naturalGas: string;
  setNaturalGas: (v: string) => void;
  naturalGasNotes: string;
  setNaturalGasNotes: (v: string) => void;
  telecom: string;
  setTelecom: (v: string) => void;
  telecomNotes: string;
  setTelecomNotes: (v: string) => void;
  // Storm Drainage & Fire Protection
  stormDrainage: string;
  setStormDrainage: (v: string) => void;
  stormDrainageNotes: string;
  setStormDrainageNotes: (v: string) => void;
  fireHydrantDistance: string;
  setFireHydrantDistance: (v: string) => void;
  // Site Improvements Inventory (M&S Section 66)
  siteImprovements: SiteImprovement[];
  onSiteImprovementsChange: (improvements: SiteImprovement[]) => void;
  // Additional Characteristics
  topography: string;
  setTopography: (v: string) => void;
  drainage: string;
  setDrainage: (v: string) => void;
  environmental: string;
  setEnvironmental: (v: string) => void;
  easements: string;
  setEasements: (v: string) => void;
  // Flood Zone
  femaZone: string;
  setFemaZone: (v: string) => void;
  femaMapPanel: string;
  setFemaMapPanel: (v: string) => void;
  femaMapDate: string;
  setFemaMapDate: (v: string) => void;
  floodInsuranceRequired: string;
  setFloodInsuranceRequired: (v: string) => void;
  floodZoneNotes: string;
  setFloodZoneNotes: (v: string) => void;
  isLookingUpFloodZone: boolean;
  setIsLookingUpFloodZone: (v: boolean) => void;
  floodZoneLookupError: string | null;
  setFloodZoneLookupError: (v: string | null) => void;
  subjectCoordinates?: { latitude: number; longitude: number };
  // Site Description Narrative
  siteDescriptionNarrative: string;
  setSiteDescriptionNarrative: (v: string) => void;
  isDraftingSiteDescription: boolean;
  setIsDraftingSiteDescription: (v: boolean) => void;
  // Property Boundaries
  northBoundary: string;
  setNorthBoundary: (v: string) => void;
  southBoundary: string;
  setSouthBoundary: (v: string) => void;
  eastBoundary: string;
  setEastBoundary: (v: string) => void;
  westBoundary: string;
  setWestBoundary: (v: string) => void;
  // Coordinates for map
  latitude?: number;
  longitude?: number;
  // Cadastral data for boundary display
  cadastralData?: {
    parcelId?: string;
    legalDescription?: string;
    situsAddress?: string;
  };
  // Subject address for map display
  subjectAddress?: string;
  // Property boundary polygon coordinates
  propertyBoundaryCoordinates?: Array<{ lat: number; lng: number }>;
  onPropertyBoundaryChange?: (coords: Array<{ lat: number; lng: number }>) => void;
  // Traffic Data
  trafficData: TrafficDataEntry[];
  setTrafficData: (data: TrafficDataEntry[]) => void;
  selectedRoadClass: string;
  setSelectedRoadClass: (v: string) => void;
  trafficNotes: string;
  setTrafficNotes: (v: string) => void;
  // Building Permits
  permits: BuildingPermitEntry[];
  setPermits: (permits: BuildingPermitEntry[]) => void;
  selectedPermitType: string;
  setSelectedPermitType: (v: string) => void;
  permitNotes: string;
  setPermitNotes: (v: string) => void;
  // API refresh handlers
  onRefreshTraffic: () => void;
  isRefreshingTraffic: boolean;
  trafficDataSource: 'mdot' | 'cotality' | 'manual' | 'mock' | null;
  onRefreshPermits: () => void;
  isRefreshingPermits: boolean;
  permitsDataSource: 'county' | 'cotality' | 'manual' | 'mock' | null;
}

// Traffic Data Entry type (for Site tab external integration)
interface TrafficDataEntry {
  roadName: string;
  roadClass: string;
  annualAverageDailyTraffic: number;
  truckPercentage?: number;
  speedLimit?: number;
  lanesCount?: number;
  distance?: string;
  direction?: string;
  year?: number;
}

// Building Permit Entry type (matches BuildingPermit in BuildingPermitsCard)
interface BuildingPermitEntry {
  id: string;
  permitNumber: string;
  permitType: 'new_construction' | 'addition' | 'alteration' | 'repair' | 'demolition' | 'mechanical' | 'electrical' | 'plumbing' | 'other';
  description: string;
  issuedDate: string;
  completedDate?: string;
  status: 'issued' | 'active' | 'completed' | 'expired' | 'cancelled' | 'pending';
  estimatedValue?: number;
  actualValue?: number;
  contractor?: string;
  inspectionsPassed?: number;
  inspectionsRequired?: number;
}

// Button selector option definitions
const SHAPE_OPTIONS = [
  { value: 'rectangular', label: 'Rectangular' },
  { value: 'approx_rectangular', label: 'Approx Rectangular' },
  { value: 'irregular', label: 'Irregular' },
  { value: 'triangular', label: 'Triangular' },
  { value: 'square', label: 'Square' },
];

const ZONING_CONFORMANCE_OPTIONS = [
  { value: 'conforming', label: 'Conforming' },
  { value: 'non_conforming', label: 'Non-Conforming' },
  { value: 'legal_non_conforming', label: 'Legal Non-Conforming' },
];

const WATER_SOURCE_OPTIONS = [
  { value: 'city', label: 'City', icon: <Droplets className="w-4 h-4" /> },
  { value: 'well', label: 'Well', icon: <Droplets className="w-4 h-4" /> },
  { value: 'other', label: 'Other', icon: <Droplets className="w-4 h-4" /> },
];

const SEWER_TYPE_OPTIONS = [
  { value: 'city', label: 'City' },
  { value: 'septic', label: 'Septic' },
  { value: 'other', label: 'Other' },
];

const ELECTRIC_ADEQUACY_OPTIONS = [
  { value: 'adequate', label: 'Adequate' },
  { value: 'limited', label: 'Limited' },
  { value: 'unknown', label: 'Unknown' },
];

const AVAILABILITY_OPTIONS = [
  { value: 'available', label: 'Available' },
  { value: 'not_available', label: 'Not Available' },
  { value: 'unknown', label: 'Unknown' },
];

const TOPOGRAPHY_OPTIONS = [
  { value: 'level', label: 'Level' },
  { value: 'gently_sloping', label: 'Gently Sloping' },
  { value: 'moderately_sloping', label: 'Moderately Sloping' },
  { value: 'steep', label: 'Steep' },
  { value: 'rolling', label: 'Rolling' },
];

const DRAINAGE_OPTIONS = [
  { value: 'adequate', label: 'Adequate' },
  { value: 'good', label: 'Good' },
  { value: 'poor', label: 'Poor' },
  { value: 'unknown', label: 'Unknown' },
];

const STORM_DRAINAGE_OPTIONS = [
  { value: 'adequate', label: 'Adequate' },
  { value: 'limited', label: 'Limited' },
  { value: 'poor', label: 'Poor' },
  { value: 'unknown', label: 'Unknown' },
];

const FIRE_HYDRANT_OPTIONS = [
  { value: '<500ft', label: '< 500 ft' },
  { value: '500-1000ft', label: '500-1000 ft' },
  { value: '>1000ft', label: '> 1000 ft' },
  { value: 'none', label: 'None Nearby' },
  { value: 'unknown', label: 'Unknown' },
];

const ENVIRONMENTAL_OPTIONS = [
  { value: 'none_known', label: 'No Known Issues' },
  { value: 'phase1_clear', label: 'Phase 1 Clear' },
  { value: 'phase2_required', label: 'Phase 2 Required' },
  { value: 'contamination', label: 'Contamination', icon: <AlertTriangle className="w-4 h-4" /> },
];

const FEMA_ZONE_OPTIONS = [
  { value: 'zone_x', label: 'Zone X' },
  { value: 'zone_a', label: 'Zone A' },
  { value: 'zone_ae', label: 'Zone AE' },
  { value: 'zone_ve', label: 'Zone VE' },
  { value: 'other', label: 'Other' },
];

const FLOOD_INSURANCE_OPTIONS = [
  { value: 'required', label: 'Required' },
  { value: 'not_required', label: 'Not Required' },
  { value: 'unknown', label: 'Unknown' },
];

function SiteContent({
  propertyType,
  acres, setAcres, squareFeet, setSquareFeet,
  shape, setShape,
  frontage, setFrontage,
  siteNotes, setSiteNotes,
  zoningClass, setZoningClass,
  zoningDescription, setZoningDescription,
  zoningConformance, setZoningConformance,
  waterSource, setWaterSource, waterProvider, setWaterProvider, waterNotes, setWaterNotes,
  sewerType, setSewerType, sewerNotes, setSewerNotes,
  electricProvider, setElectricProvider, electricAdequacy, setElectricAdequacy, electricNotes, setElectricNotes,
  naturalGas, setNaturalGas, naturalGasNotes, setNaturalGasNotes,
  telecom, setTelecom, telecomNotes, setTelecomNotes,
  stormDrainage, setStormDrainage, stormDrainageNotes, setStormDrainageNotes,
  fireHydrantDistance, setFireHydrantDistance,
  siteImprovements, onSiteImprovementsChange,
  topography, setTopography, drainage, setDrainage,
  environmental, setEnvironmental, easements, setEasements,
  femaZone, setFemaZone, femaMapPanel, setFemaMapPanel,
  femaMapDate, setFemaMapDate, floodInsuranceRequired, setFloodInsuranceRequired,
  floodZoneNotes, setFloodZoneNotes,
  isLookingUpFloodZone, setIsLookingUpFloodZone,
  floodZoneLookupError, setFloodZoneLookupError,
  subjectCoordinates,
  siteDescriptionNarrative, setSiteDescriptionNarrative,
  isDraftingSiteDescription, setIsDraftingSiteDescription,
  northBoundary, setNorthBoundary,
  southBoundary, setSouthBoundary,
  eastBoundary, setEastBoundary,
  westBoundary, setWestBoundary,
  latitude, longitude,
  cadastralData,
  subjectAddress,
  propertyBoundaryCoordinates,
  onPropertyBoundaryChange,
  // Traffic Data
  trafficData, setTrafficData,
  selectedRoadClass, setSelectedRoadClass,
  trafficNotes, setTrafficNotes,
  // Building Permits
  permits, setPermits,
  selectedPermitType, setSelectedPermitType,
  permitNotes, setPermitNotes,
  onRefreshTraffic,
  isRefreshingTraffic,
  trafficDataSource,
  onRefreshPermits,
  isRefreshingPermits,
  permitsDataSource,
}: SiteProps) {
  // Get field source tracking and suggestion helpers from wizard context
  const { hasFieldSource, hasPendingFieldSuggestion } = useWizard();

  // 1 acre = 43,560 square feet
  const SQFT_PER_ACRE = 43560;

  // Handle acres change - update square feet
  const handleAcresChange = (value: string) => {
    setAcres(value);
    if (value && !isNaN(parseFloat(value))) {
      const sf = parseFloat(value) * SQFT_PER_ACRE;
      setSquareFeet(sf.toFixed(0));
    } else {
      setSquareFeet('');
    }
  };

  // Handle square feet change - update acres
  const handleSquareFeetChange = (value: string) => {
    const numericValue = value.replace(/,/g, '');
    setSquareFeet(numericValue);
    if (numericValue && !isNaN(parseFloat(numericValue))) {
      const ac = parseFloat(numericValue) / SQFT_PER_ACRE;
      setAcres(ac.toFixed(3));
    } else {
      setAcres('');
    }
  };

  // Lookup Flood Zone from FEMA
  const handleLookupFloodZone = async () => {
    if (!subjectCoordinates?.latitude || !subjectCoordinates?.longitude) {
      setFloodZoneLookupError('Property coordinates required. Please enter an address first.');
      return;
    }

    setIsLookingUpFloodZone(true);
    setFloodZoneLookupError(null);

    try {
      const result = await getFloodZone(subjectCoordinates.latitude, subjectCoordinates.longitude);

      if (result) {
        // Map the zone to our FEMA zone options
        const zoneMap: Record<string, string> = {
          'X': 'zone_x',
          'A': 'zone_a',
          'AE': 'zone_ae',
          'AO': 'zone_a',
          'AH': 'zone_a',
          'V': 'zone_ve',
          'VE': 'zone_ve',
        };

        const mappedZone = zoneMap[result.floodZone] || 'other';
        setFemaZone(mappedZone);
        setFemaMapPanel(result.panelNumber || '');
        setFloodInsuranceRequired(result.insuranceRequired ? 'required' : 'not_required');

        // Add lookup result to notes
        const noteText = `FEMA Lookup: ${result.floodZone} - ${result.zoneDescription}`;
        const newNotes = floodZoneNotes ? `${floodZoneNotes}\n${noteText}` : noteText;
        setFloodZoneNotes(newNotes);
      }
    } catch (error) {
      console.error('Flood zone lookup failed:', error);
      setFloodZoneLookupError(error instanceof Error ? error.message : 'Lookup failed. Please try again.');
    } finally {
      setIsLookingUpFloodZone(false);
    }
  };

  // AI Draft Site Description
  const handleDraftSiteDescription = async () => {
    setIsDraftingSiteDescription(true);
    await new Promise(resolve => setTimeout(resolve, 1200));

    const draftContent = `The subject site is located with ${frontage || 'adequate frontage'} providing good access. The site contains approximately ${acres ? `${acres} acres (${parseInt(squareFeet || '0').toLocaleString()} square feet)` : 'the stated land area'} with a ${shape || 'regular'} configuration.

${topography ? `The site topography is ${topography.replace(/_/g, ' ')}, ` : ''}${drainage ? `with ${drainage} drainage characteristics. ` : ''}The site is accessible from the adjacent roadway.

${waterSource ? `Water service is provided by ${waterSource === 'city' ? 'municipal water' : waterSource === 'well' ? 'private well' : 'alternative source'}. ` : ''}${sewerType ? `Sewer service consists of ${sewerType === 'city' ? 'municipal sanitary sewer' : sewerType === 'septic' ? 'private septic system' : 'alternative system'}. ` : ''}${naturalGas === 'available' ? 'Natural gas is available. ' : ''}${telecom === 'available' ? 'Telecommunications services are available. ' : ''}${electricAdequacy ? `Electric service appears ${electricAdequacy}. ` : ''}

${femaZone ? `According to FEMA mapping, the site is located in Flood ${femaZone.replace(/_/g, ' ').replace('zone', 'Zone')}${femaMapPanel ? ` (Map Panel ${femaMapPanel})` : ''}. ${floodInsuranceRequired === 'required' ? 'Flood insurance is required.' : floodInsuranceRequired === 'not_required' ? 'No special flood insurance is required.' : ''}` : ''}

${environmental ? `Environmental status: ${environmental === 'none_known' ? 'No known environmental issues' : environmental === 'phase1_clear' ? 'Phase 1 ESA completed with no recognized environmental conditions' : environmental === 'phase2_required' ? 'Phase 2 environmental assessment is required' : 'Environmental contamination has been identified'}. ` : ''}

Overall, the site is well-suited for its current use and presents no significant adverse characteristics that would negatively impact value.`;

    setSiteDescriptionNarrative(draftContent);
    setIsDraftingSiteDescription(false);
  };

  return (
    <div className="space-y-6">
      {/* Site Size & Shape */}
      <div className="bg-surface-1 dark:bg-elevation-1 border border-light-border dark:border-dark-border rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-harken-dark dark:text-white border-b-2 border-light-border dark:border-harken-gray pb-3 mb-4">
          Site Size & Shape
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-harken-dark dark:text-slate-200 mb-1">
              Total Acres <span className="text-harken-error">*</span>
              <DocumentSourceIndicator fieldPath="subjectData.siteArea" inline />
            </label>
            <input
              type="number"
              value={acres}
              onChange={(e) => handleAcresChange(e.target.value)}
              step="0.001"
              className={`w-full px-3 py-2 border border-light-border dark:border-harken-gray rounded-lg text-sm focus:ring-2 focus:ring-harken-blue focus:border-transparent bg-surface-1 dark:bg-elevation-1 dark:text-white dark:placeholder-harken-gray-med ${getDocumentSourceInputClasses(hasFieldSource('subjectData.siteArea'))
                }`}
              placeholder="0.000"
            />
            {hasPendingFieldSuggestion('subjectData.siteArea') && (
              <MultiValueSuggestion
                fieldPath="subjectData.siteArea"
                fieldLabel="Total Acres"
                onAccept={(value) => {
                  // Extract numeric value from strings like "2.45 acres" or "2.45 acres (106,722 SF)"
                  const numericMatch = value.match(/[\d.]+/);
                  const numericValue = numericMatch ? numericMatch[0] : value;
                  handleAcresChange(numericValue);
                }}
              />
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-harken-dark dark:text-slate-200 mb-1">
              Total Square Feet <span className="text-harken-gray-med text-xs">(or enter to calculate acres)</span>
            </label>
            <input
              type="text"
              value={squareFeet ? parseInt(squareFeet).toLocaleString() : ''}
              onChange={(e) => handleSquareFeetChange(e.target.value)}
              className="w-full px-3 py-2 border border-light-border dark:border-harken-gray rounded-lg text-sm focus:ring-2 focus:ring-harken-blue focus:border-transparent bg-surface-1 dark:bg-elevation-1 dark:text-white dark:placeholder-harken-gray-med"
              placeholder="0"
            />
          </div>
        </div>

        <div className="mt-4">
          <ButtonSelector
            label="Shape"
            options={SHAPE_OPTIONS}
            value={shape}
            onChange={setShape}
          />
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-harken-dark dark:text-slate-200 mb-1">Frontage</label>
          <input
            type="text"
            value={frontage}
            onChange={(e) => setFrontage(e.target.value)}
            className="w-full px-3 py-2 border border-light-border dark:border-harken-gray rounded-lg text-sm focus:ring-2 focus:ring-harken-blue focus:border-transparent bg-surface-1 dark:bg-elevation-1 dark:text-white dark:placeholder-harken-gray-med"
            placeholder="e.g., 475' along South 30th Street West"
          />
        </div>

        <div className="mt-4">
          <EnhancedTextArea
            id="site_notes"
            label="Note to Reader"
            value={siteNotes}
            onChange={setSiteNotes}
            placeholder="Any special notes about site allocation, phasing, subdivision plans, or unique site attributes..."
            rows={4}
            sectionContext="site_notes"
            helperText="Include any caveats or special considerations about the site."
          />
        </div>
      </div>

      {/* Property Boundaries with Map Preview */}
      <BoundaryFieldsCard
        northBoundary={northBoundary}
        onNorthBoundaryChange={setNorthBoundary}
        southBoundary={southBoundary}
        onSouthBoundaryChange={setSouthBoundary}
        eastBoundary={eastBoundary}
        onEastBoundaryChange={setEastBoundary}
        westBoundary={westBoundary}
        onWestBoundaryChange={setWestBoundary}
        latitude={latitude}
        longitude={longitude}
        dataSource={cadastralData?.parcelId ? 'cadastral' : 'manual'}
        parcelId={cadastralData?.parcelId}
      />

      {/* Site Maps - One-click generation and boundary drawing */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Map Generator - Aerial, Location, Vicinity */}
        <MapGeneratorPanel
          coordinates={latitude && longitude ? { lat: latitude, lng: longitude } : undefined}
          address={subjectAddress}
          propertyName={undefined}
        />

        {/* Boundary Drawing Tool - Interactive parcel boundaries */}
        <BoundaryDrawingTool
          center={latitude && longitude ? { lat: latitude, lng: longitude } : undefined}
          initialBoundary={propertyBoundaryCoordinates}
          onBoundaryChange={onPropertyBoundaryChange}
          height={350}
        />
      </div>

      {/* External Data Integration - Traffic & Permits */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TrafficDataCard
          trafficData={trafficData}
          onTrafficDataChange={setTrafficData}
          selectedRoadClass={selectedRoadClass}
          onRoadClassChange={setSelectedRoadClass}
          trafficNotes={trafficNotes}
          onTrafficNotesChange={setTrafficNotes}
          onRefresh={onRefreshTraffic}
          isRefreshing={isRefreshingTraffic}
          dataSource={trafficDataSource}
        />
        <BuildingPermitsCard
          permits={permits}
          onPermitsChange={setPermits}
          selectedPermitType={selectedPermitType}
          onPermitTypeChange={setSelectedPermitType}
          permitNotes={permitNotes}
          onPermitNotesChange={setPermitNotes}
          onRefresh={onRefreshPermits}
          isRefreshing={isRefreshingPermits}
          dataSource={permitsDataSource}
        />
      </div>

      {/* Zoning & Land Use */}
      <div className="bg-surface-1 dark:bg-elevation-1 border border-light-border dark:border-dark-border rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-harken-dark dark:text-white border-b-2 border-light-border dark:border-harken-gray pb-3 mb-4">
          Zoning & Land Use
        </h3>
        <div className="space-y-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-harken-dark dark:text-slate-200 mb-1">
              Zoning Classification <span className="text-harken-error">*</span>
              <DocumentSourceIndicator fieldPath="subjectData.zoningClass" inline />
            </label>
            <input
              type="text"
              value={zoningClass}
              onChange={(e) => setZoningClass(e.target.value)}
              className={`w-full px-3 py-2 border border-light-border dark:border-harken-gray rounded-lg text-sm focus:ring-2 focus:ring-harken-blue focus:border-transparent bg-surface-1 dark:bg-elevation-1 dark:text-white dark:placeholder-harken-gray-med ${getDocumentSourceInputClasses(hasFieldSource('subjectData.zoningClass'))
                }`}
              placeholder="e.g., I1 - Light Industrial"
            />
            {hasPendingFieldSuggestion('subjectData.zoningClass') && (
              <MultiValueSuggestion
                fieldPath="subjectData.zoningClass"
                fieldLabel="Zoning Classification"
                onAccept={(value) => {
                  setZoningClass(value);
                }}
              />
            )}
          </div>

          <EnhancedTextArea
            id="zoning_description"
            label="Zoning Description"
            value={zoningDescription}
            onChange={setZoningDescription}
            placeholder="Describe the zoning district, permitted uses, development standards..."
            rows={6}
            sectionContext="zoning_description"
            helperText="AI can help draft a comprehensive zoning description."
          />

          <ButtonSelector
            label="Zoning Conformance"
            options={ZONING_CONFORMANCE_OPTIONS}
            value={zoningConformance}
            onChange={setZoningConformance}
          />
        </div>
      </div>

      {/* Utilities & Services - Expanded */}
      <div className="bg-surface-1 dark:bg-elevation-1 border border-light-border dark:border-dark-border rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-harken-dark dark:text-white border-b-2 border-light-border dark:border-harken-gray pb-3 mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-harken-blue" />
          Utilities & Services
        </h3>
        <div className="space-y-6">
          {/* Water Source */}
          <div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <ButtonSelector
                  label="Water Source"
                  options={WATER_SOURCE_OPTIONS}
                  value={waterSource}
                  onChange={setWaterSource}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-harken-dark dark:text-slate-200 mb-1">Water Provider</label>
                <input
                  type="text"
                  value={waterProvider}
                  onChange={(e) => setWaterProvider(e.target.value)}
                  className="w-full px-3 py-2 border border-light-border dark:border-harken-gray rounded-lg text-sm focus:ring-2 focus:ring-harken-blue focus:border-transparent bg-surface-1 dark:bg-elevation-1 dark:text-white dark:placeholder-harken-gray-med"
                  placeholder="e.g., City of Bozeman Water"
                />
              </div>
            </div>
            <ExpandableNote
              id="water_notes"
              label="Water Notes"
              value={waterNotes}
              onChange={setWaterNotes}
              placeholder="Add notes about water service..."
              sectionContext="water_source"
            />
          </div>

          {/* Sewer Type */}
          <div>
            <ButtonSelector
              label="Sewer Type"
              options={SEWER_TYPE_OPTIONS}
              value={sewerType}
              onChange={setSewerType}
            />
            <ExpandableNote
              id="sewer_notes"
              label="Sewer Notes"
              value={sewerNotes}
              onChange={setSewerNotes}
              placeholder="Add notes about sewer service..."
              sectionContext="sewer_type"
            />
          </div>

          {/* Electric */}
          <div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-harken-dark dark:text-slate-200 mb-1">Electric Provider</label>
                <input
                  type="text"
                  value={electricProvider}
                  onChange={(e) => setElectricProvider(e.target.value)}
                  className="w-full px-3 py-2 border border-light-border dark:border-harken-gray rounded-lg text-sm focus:ring-2 focus:ring-harken-blue focus:border-transparent bg-surface-1 dark:bg-elevation-1 dark:text-white dark:placeholder-harken-gray-med"
                  placeholder="e.g., NorthWestern Energy"
                />
              </div>
              <div>
                <ButtonSelector
                  label="Adequacy"
                  options={ELECTRIC_ADEQUACY_OPTIONS}
                  value={electricAdequacy}
                  onChange={setElectricAdequacy}
                  size="sm"
                />
              </div>
            </div>
            <ExpandableNote
              id="electric_notes"
              label="Electric Notes"
              value={electricNotes}
              onChange={setElectricNotes}
              placeholder="Add notes about electric service..."
              sectionContext="electric"
            />
          </div>

          {/* Natural Gas */}
          <div>
            <ButtonSelector
              label="Natural Gas"
              options={AVAILABILITY_OPTIONS}
              value={naturalGas}
              onChange={setNaturalGas}
            />
            <ExpandableNote
              id="natural_gas_notes"
              label="Natural Gas Notes"
              value={naturalGasNotes}
              onChange={setNaturalGasNotes}
              placeholder="Add notes about natural gas service..."
              sectionContext="natural_gas"
            />
          </div>

          {/* Telecom */}
          <div>
            <ButtonSelector
              label="Telecommunications"
              options={AVAILABILITY_OPTIONS}
              value={telecom}
              onChange={setTelecom}
            />
            <ExpandableNote
              id="telecom_notes"
              label="Telecom Notes"
              value={telecomNotes}
              onChange={setTelecomNotes}
              placeholder="Add notes about telecommunications..."
              sectionContext="telecom"
            />
          </div>

          {/* Storm Drainage */}
          <div>
            <ButtonSelector
              label="Storm Drainage"
              options={STORM_DRAINAGE_OPTIONS}
              value={stormDrainage}
              onChange={setStormDrainage}
            />
            <ExpandableNote
              id="storm_drainage_notes"
              label="Storm Drainage Notes"
              value={stormDrainageNotes}
              onChange={setStormDrainageNotes}
              placeholder="Add notes about storm drainage, retention requirements..."
              sectionContext="storm_drainage"
            />
          </div>

          {/* Fire Hydrant Proximity */}
          <div>
            <ButtonSelector
              label="Fire Hydrant Distance"
              options={FIRE_HYDRANT_OPTIONS}
              value={fireHydrantDistance}
              onChange={setFireHydrantDistance}
            />
          </div>
        </div>
      </div>

      {/* Site Improvements Inventory - M&S Section 66 with Age-Life Tracking */}
      <SiteImprovementsInventory
        improvements={siteImprovements}
        onChange={onSiteImprovementsChange}
        propertyCategory={propertyType ? getPropertyType(propertyType)?.category : undefined}
      />

      {/* Additional Site Characteristics */}
      <div className="bg-surface-1 dark:bg-elevation-1 border border-light-border dark:border-dark-border rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-harken-dark dark:text-white border-b-2 border-light-border dark:border-harken-gray pb-3 mb-4">
          Additional Site Characteristics
        </h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-6">
            <ButtonSelector
              label="Topography"
              options={TOPOGRAPHY_OPTIONS}
              value={topography}
              onChange={setTopography}
              size="sm"
            />
            <ButtonSelector
              label="Drainage"
              options={DRAINAGE_OPTIONS}
              value={drainage}
              onChange={setDrainage}
              size="sm"
            />
          </div>

          <ButtonSelector
            label="Environmental"
            options={ENVIRONMENTAL_OPTIONS}
            value={environmental}
            onChange={setEnvironmental}
          />

          <EnhancedTextArea
            id="easements"
            label="Easements"
            value={easements}
            onChange={setEasements}
            placeholder="Describe any easements affecting the property..."
            rows={4}
            sectionContext="easements"
            helperText="Document all known easements and their impact."
          />
        </div>
      </div>

      {/* Flood Zone - Enhanced */}
      <div className="bg-surface-1 dark:bg-elevation-1 border border-light-border dark:border-dark-border rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between border-b-2 border-light-border pb-3 mb-4">
          <h3 className="text-lg font-bold text-harken-dark dark:text-white flex items-center gap-2">
            <Droplets className="w-5 h-5 text-harken-blue" />
            Flood Zone
          </h3>
          <button
            onClick={handleLookupFloodZone}
            disabled={isLookingUpFloodZone || !subjectCoordinates}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-gradient-action-from to-gradient-action-to rounded-lg hover:from-gradient-action-hover-from hover:to-gradient-action-hover-to disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            {isLookingUpFloodZone ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Looking up...
              </>
            ) : (
              <>
                <Map className="w-4 h-4" />
                Lookup Flood Zone
              </>
            )}
          </button>
        </div>

        {/* Error message */}
        {floodZoneLookupError && (
          <div className="mb-4 p-3 bg-harken-error/10 border border-harken-error/30 rounded-lg flex items-center gap-2 text-harken-error text-sm">
            <AlertTriangle className="w-4 h-4" />
            {floodZoneLookupError}
          </div>
        )}

        {/* No coordinates warning */}
        {!subjectCoordinates && (
          <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 rounded-lg flex items-center gap-2 text-amber-700 dark:text-amber-200 text-sm">
            <Info className="w-4 h-4" />
            Enter a property address in Setup to enable automatic flood zone lookup.
          </div>
        )}

        <div className="space-y-4">
          <ButtonSelector
            label="FEMA Zone"
            options={FEMA_ZONE_OPTIONS}
            value={femaZone}
            onChange={setFemaZone}
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-harken-dark dark:text-slate-200 mb-1">Map Panel Number</label>
              <input
                type="text"
                value={femaMapPanel}
                onChange={(e) => setFemaMapPanel(e.target.value)}
                className="w-full px-3 py-2 border border-light-border dark:border-harken-gray rounded-lg text-sm focus:ring-2 focus:ring-harken-blue focus:border-transparent bg-surface-1 dark:bg-elevation-1 dark:text-white dark:placeholder-harken-gray-med"
                placeholder="e.g., 30111C2175E"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-harken-dark dark:text-slate-200 mb-1">Map Effective Date</label>
              <input
                type="date"
                value={femaMapDate}
                onChange={(e) => setFemaMapDate(e.target.value)}
                className="w-full px-3 py-2 border border-light-border dark:border-harken-gray rounded-lg text-sm focus:ring-2 focus:ring-harken-blue focus:border-transparent bg-surface-1 dark:bg-elevation-1 dark:text-white dark:[color-scheme:dark]"
              />
            </div>
          </div>

          <ButtonSelector
            label="Flood Insurance Required"
            options={FLOOD_INSURANCE_OPTIONS}
            value={floodInsuranceRequired}
            onChange={setFloodInsuranceRequired}
          />

          <ExpandableNote
            id="flood_zone_notes"
            label="Flood Zone Notes"
            value={floodZoneNotes}
            onChange={setFloodZoneNotes}
            placeholder="Add notes about flood zone..."
            sectionContext="flood_zone"
          />
        </div>
      </div>

      {/* Site Description Narrative - New Card */}
      <div className="bg-surface-1 dark:bg-elevation-1 border border-light-border dark:border-dark-border rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between border-b-2 border-light-border pb-3 mb-4">
          <h3 className="text-lg font-bold text-harken-dark dark:text-white">
            Site Description Narrative
          </h3>
          <button
            onClick={handleDraftSiteDescription}
            disabled={isDraftingSiteDescription}
            className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-gradient-light-from to-gradient-light-to rounded-lg hover:from-gradient-light-hover-from hover:to-gradient-light-hover-to flex items-center gap-2 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDraftingSiteDescription ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Drafting...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                AI Draft Site Description
              </>
            )}
          </button>
        </div>
        <p className="text-sm text-harken-gray mb-4">
          Generate a professional site description narrative from all the data entered above.
        </p>
        <EnhancedTextArea
          id="site_description_narrative"
          label="Site Description"
          value={siteDescriptionNarrative}
          onChange={setSiteDescriptionNarrative}
          placeholder="The subject site is located..."
          rows={12}
          sectionContext="site_description_full"
          helperText="This narrative will appear in the final appraisal report."
        />
      </div>
    </div>
  );
}

// ==========================================
// TAX CONTENT - Complete with Sale History
// ==========================================
interface TaxProps {
  taxYear: string;
  setTaxYear: (v: string) => void;
  taxAmount: string;
  setTaxAmount: (v: string) => void;
  assessedLand: string;
  setAssessedLand: (v: string) => void;
  assessedImprovements: string;
  setAssessedImprovements: (v: string) => void;
  totalAssessed: string;
  setTotalAssessed: (v: string) => void;
  millLevy: string;
  setMillLevy: (v: string) => void;
  lastSaleDate: string;
  setLastSaleDate: (v: string) => void;
  lastSalePrice: string;
  setLastSalePrice: (v: string) => void;
  grantor: string;
  setGrantor: (v: string) => void;
  grantee: string;
  setGrantee: (v: string) => void;
  transactionHistory: string;
  setTransactionHistory: (v: string) => void;
  isAutoFilled?: boolean;
}

function TaxContent({
  taxYear, setTaxYear,
  taxAmount, setTaxAmount,
  assessedLand, setAssessedLand,
  assessedImprovements, setAssessedImprovements,
  totalAssessed, setTotalAssessed,
  millLevy, setMillLevy,
  lastSaleDate, setLastSaleDate,
  lastSalePrice, setLastSalePrice,
  grantor, setGrantor,
  grantee, setGrantee,
  transactionHistory, setTransactionHistory,
  isAutoFilled = false,
}: TaxProps) {
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 11 }, (_, i) => String(currentYear - i));

  return (
    <div className="space-y-6">
      {/* Auto-fill indicator */}
      {isAutoFilled && (
        <div className="flex items-center gap-2 px-3 py-2 bg-accent-teal-mint-light border border-accent-teal-mint-light rounded-lg text-sm text-accent-teal-mint">
          <CheckCircle className="w-4 h-4" />
          <span>Tax assessment data auto-filled from property records</span>
        </div>
      )}

      {/* Property Tax Information */}
      <div className="bg-surface-1 dark:bg-elevation-1 border border-light-border dark:border-dark-border rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-harken-dark dark:text-white border-b-2 border-light-border dark:border-harken-gray pb-3 mb-4">
          Property Tax Information
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-harken-dark dark:text-slate-200 mb-1">Tax Year</label>
            <select
              value={taxYear}
              onChange={(e) => setTaxYear(e.target.value)}
              className="w-full px-3 py-2 border border-light-border dark:border-harken-gray rounded-lg text-sm focus:ring-2 focus:ring-harken-blue focus:border-transparent bg-surface-1 dark:bg-elevation-1 dark:text-white"
            >
              {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-harken-dark dark:text-slate-200 mb-1">Current Year Tax Amount</label>
            <input
              type="text"
              value={taxAmount}
              onChange={(e) => setTaxAmount(e.target.value)}
              className="w-full px-3 py-2 border border-light-border rounded-lg text-sm focus:ring-2 focus:ring-harken-blue focus:border-transparent"
              placeholder="$0.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-harken-dark dark:text-slate-200 mb-1">Assessed Value - Land</label>
            <input
              type="text"
              value={assessedLand}
              onChange={(e) => setAssessedLand(e.target.value)}
              className="w-full px-3 py-2 border border-light-border rounded-lg text-sm focus:ring-2 focus:ring-harken-blue focus:border-transparent"
              placeholder="$0.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-harken-dark dark:text-slate-200 mb-1">Assessed Value - Improvements</label>
            <input
              type="text"
              value={assessedImprovements}
              onChange={(e) => setAssessedImprovements(e.target.value)}
              className="w-full px-3 py-2 border border-light-border rounded-lg text-sm focus:ring-2 focus:ring-harken-blue focus:border-transparent"
              placeholder="$0.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-harken-dark dark:text-slate-200 mb-1">Total Assessed Value</label>
            <input
              type="text"
              value={totalAssessed}
              onChange={(e) => setTotalAssessed(e.target.value)}
              className="w-full px-3 py-2 border border-light-border rounded-lg text-sm focus:ring-2 focus:ring-harken-blue focus:border-transparent"
              placeholder="$0.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-harken-dark dark:text-slate-200 mb-1">Mill Levy / Tax Rate</label>
            <input
              type="number"
              value={millLevy}
              onChange={(e) => setMillLevy(e.target.value)}
              step="0.001"
              className="w-full px-3 py-2 border border-light-border rounded-lg text-sm focus:ring-2 focus:ring-harken-blue focus:border-transparent"
              placeholder="0.000"
            />
          </div>
        </div>
      </div>

      {/* Sale & Ownership History */}
      <div className="bg-surface-1 dark:bg-elevation-1 border border-light-border dark:border-dark-border rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-harken-dark dark:text-white border-b-2 border-light-border dark:border-harken-gray pb-3 mb-4">
          Sale & Ownership History
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-harken-dark dark:text-slate-200 mb-1">Date of Last Sale</label>
            <input
              type="date"
              value={lastSaleDate}
              onChange={(e) => setLastSaleDate(e.target.value)}
              className="w-full px-3 py-2 border border-light-border rounded-lg text-sm focus:ring-2 focus:ring-harken-blue focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-harken-dark dark:text-slate-200 mb-1">Last Sale Price</label>
            <input
              type="text"
              value={lastSalePrice}
              onChange={(e) => setLastSalePrice(e.target.value)}
              className="w-full px-3 py-2 border border-light-border rounded-lg text-sm focus:ring-2 focus:ring-harken-blue focus:border-transparent"
              placeholder="$0.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-harken-dark dark:text-slate-200 mb-1">Grantor (Seller)</label>
            <input
              type="text"
              value={grantor}
              onChange={(e) => setGrantor(e.target.value)}
              className="w-full px-3 py-2 border border-light-border rounded-lg text-sm focus:ring-2 focus:ring-harken-blue focus:border-transparent"
              placeholder="Name of seller"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-harken-dark dark:text-slate-200 mb-1">Grantee (Buyer)</label>
            <input
              type="text"
              value={grantee}
              onChange={(e) => setGrantee(e.target.value)}
              className="w-full px-3 py-2 border border-light-border rounded-lg text-sm focus:ring-2 focus:ring-harken-blue focus:border-transparent"
              placeholder="Name of buyer"
            />
          </div>
        </div>
        <div className="mt-4">
          <EnhancedTextArea
            id="transaction_history"
            label="Transaction History (Last 3 Years)"
            value={transactionHistory}
            onChange={setTransactionHistory}
            placeholder="Document any sales, transfers, listings, or offers within the past 3 years per USPAP requirements. Include dates, prices, parties involved, and whether transactions were arms-length..."
            rows={6}
            sectionContext="transaction_history"
            helperText="USPAP requires analysis of all sales and transfers within 3 years of the effective date."
            required
          />
        </div>
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
          <svg className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-xs text-amber-800">
            <strong>USPAP Requirement:</strong> Document and analyze any sales within 3 years of the effective date.
          </p>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// PHOTOS CONTENT - Rove Standard Categories
// ==========================================
interface PhotosProps {
  photos: Record<string, PhotoData | null>;
  onUpload: (slotId: string, file: File) => void;
  onRemove: (slotId: string) => void;
  onUpdateMetadata: (slotId: string, updates: Partial<PhotoData>) => void;
  defaultTakenBy: string;
  defaultTakenDate: string;
  onPreviewPhoto?: (slotId: string, photo: PhotoData) => void;
  /** Enable crop-before-upload workflow */
  enableCropOnUpload?: boolean;
}

function PhotosContent({
  photos,
  onUpload,
  onRemove,
  onUpdateMetadata,
  defaultTakenBy,
  defaultTakenDate,
  onPreviewPhoto,
  enableCropOnUpload = true,
}: PhotosProps) {
  const {
    state: wizardState,
    getStagingPhotos,
    removeStagingPhoto,
    assignStagingPhoto,
    getUnassignedStagingPhotos,
    setCoverPhoto,
    removeCoverPhoto,
  } = useWizard();

  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(photoCategories.map(c => [c.id, true]))
  );
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_hoveredSlot, setHoveredSlot] = useState<string | null>(null);
  const [showQuickPeek, setShowQuickPeek] = useState<string | null>(null);
  const [dragOverSlot, setDragOverSlot] = useState<string | null>(null);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [showCoverPhotoPicker, setShowCoverPhotoPicker] = useState(false);
  const [focusedSlotIndex, setFocusedSlotIndex] = useState<number>(-1);
  const [isDraggingPhoto, setIsDraggingPhoto] = useState(false);
  const [draggedPhotoPreview, setDraggedPhotoPreview] = useState<string | undefined>();
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const photoSlotRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Crop modal state
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropImageUrl, setCropImageUrl] = useState<string | null>(null);
  const [cropTargetSlotId, setCropTargetSlotId] = useState<string | null>(null);
  const [pendingOriginalFile, setPendingOriginalFile] = useState<File | null>(null);

  // Handle opening crop modal for existing photo
  const handleOpenCropModal = useCallback((slotId: string, photo: PhotoData) => {
    setCropImageUrl(photo.preview);
    setCropTargetSlotId(slotId);
    setPendingOriginalFile(photo.file || null);
    setCropModalOpen(true);
  }, []);

  // Handle crop completion - accepts both blob and crop data
  const handleCropComplete = useCallback((croppedBlob: Blob, cropData?: { x: number; y: number; width: number; height: number }) => {
    if (!cropTargetSlotId) return;

    // Create a new file from the cropped blob
    const fileName = pendingOriginalFile?.name || `cropped-${Date.now()}.jpg`;
    const croppedFile = new File([croppedBlob], fileName, { type: 'image/jpeg' });

    // Upload the cropped file
    onUpload(cropTargetSlotId, croppedFile);

    // Store crop data for potential re-cropping (could be saved to wizard state)
    if (cropData) {
      console.log('Photo cropped with data:', cropData);
    }

    // Clean up
    setCropModalOpen(false);
    setCropImageUrl(null);
    setCropTargetSlotId(null);
    setPendingOriginalFile(null);
  }, [cropTargetSlotId, pendingOriginalFile, onUpload]);

  // Handle crop cancel
  const handleCropCancel = useCallback(() => {
    // If there was a pending file for new upload, discard it
    setCropModalOpen(false);
    setCropImageUrl(null);
    setCropTargetSlotId(null);
    setPendingOriginalFile(null);
  }, []);

  // State for auto-crop processing
  const [isAutoCropping, setIsAutoCropping] = useState(false);

  // Handle file upload with AI auto-crop
  const handleFileUploadWithCrop = useCallback(async (slotId: string, file: File) => {
    if (enableCropOnUpload) {
      try {
        setIsAutoCropping(true);
        setCropTargetSlotId(slotId);

        // Detect category from slot ID for smarter cropping
        const category = slotId.includes('exterior') ? 'exterior' as const
          : slotId.includes('interior') ? 'interior' as const
            : slotId.includes('aerial') ? 'aerial' as const
              : slotId.includes('street') ? 'street' as const
                : detectCategoryFromFilename(file.name);

        // Auto-crop the image using AI-driven smart crop
        const { croppedFile, cropData, originalFile } = await autoCropImage(file, {
          category,
          targetAspectRatio: 16 / 9, // Default to landscape for real estate
        });

        // Upload the auto-cropped file immediately
        onUpload(slotId, croppedFile);

        // Store original for manual re-crop if user wants to adjust
        setPendingOriginalFile(originalFile);

        // Log the auto-crop for debugging
        console.log(`Auto-cropped ${file.name} with ${Math.round(cropData.confidence * 100)}% confidence (${cropData.aspectRatioLabel})`);

        setIsAutoCropping(false);
        setCropTargetSlotId(null);
      } catch (error) {
        console.error('Auto-crop failed, falling back to manual crop:', error);
        setIsAutoCropping(false);

        // Fallback to manual crop modal
        const previewUrl = URL.createObjectURL(file);
        setCropImageUrl(previewUrl);
        setCropTargetSlotId(slotId);
        setPendingOriginalFile(file);
        setCropModalOpen(true);
      }
    } else {
      // Direct upload without cropping
      onUpload(slotId, file);
    }
  }, [enableCropOnUpload, onUpload]);

  // Get all slots in a flat array for keyboard navigation
  const allSlots = useMemo(() => {
    return photoCategories.flatMap(cat => cat.slots.map(slot => ({ ...slot, category: cat.id })));
  }, []);

  // Get used slots (slots that already have photos)
  const usedSlots = useMemo(() => {
    const used = new Set<string>();
    Object.entries(photos).forEach(([slotId, photo]) => {
      if (photo) used.add(slotId);
    });
    return used;
  }, [photos]);

  // Existing slot assignments for the classification service
  const existingSlotAssignments = useMemo(() => {
    const assignments: Record<string, string> = {};
    Object.entries(photos).forEach(([slotId, photo]) => {
      if (photo) assignments[slotId] = slotId;
    });
    return assignments;
  }, [photos]);

  const handleFileChange = useCallback((slotId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      handleFileUploadWithCrop(slotId, e.target.files[0]);
    }
  }, [handleFileUploadWithCrop]);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => ({ ...prev, [categoryId]: !prev[categoryId] }));
  };

  // Count uploaded photos per category
  const getUploadedCount = (category: PhotoCategory) => {
    return category.slots.filter(slot => photos[slot.id]).length;
  };

  // Drag and drop handlers for slots
  const handleSlotDragOver = (e: React.DragEvent, slotId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!photos[slotId]) {
      setDragOverSlot(slotId);
    }
  };

  const handleSlotDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverSlot(null);
  };

  const handleSlotDrop = (e: React.DragEvent, slotId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverSlot(null);

    // Check if it's a staging photo
    const jsonData = e.dataTransfer.getData('application/json');
    if (jsonData) {
      try {
        const data = JSON.parse(jsonData);
        if (data.type === 'staging-photo' && data.photoId) {
          const stagingPhotos = getStagingPhotos();
          const stagingPhoto = stagingPhotos.find(p => p.id === data.photoId);
          if (stagingPhoto) {
            // Upload the file to the slot
            onUpload(slotId, stagingPhoto.file);
            // Mark as assigned and remove from staging
            assignStagingPhoto(data.photoId, slotId);
            removeStagingPhoto(data.photoId);
            return;
          }
        }
      } catch {
        // Not JSON, fall through to file handling
      }
    }

    // Handle direct file drops
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        onUpload(slotId, file);
      }
    }
  };

  // Handle assigning a staging photo to a slot
  const handleAssignStagingPhoto = (photo: { id: string; file: File }, slotId: string) => {
    onUpload(slotId, photo.file);
    assignStagingPhoto(photo.id, slotId);
    removeStagingPhoto(photo.id);
  };

  // Handle accepting all AI suggestions
  const handleAcceptAllSuggestions = useCallback(() => {
    const unassigned = getUnassignedStagingPhotos();
    const localUsedSlots = new Set(usedSlots);
    unassigned.forEach(photo => {
      const topSuggestion = photo.suggestions?.[0];
      if (topSuggestion && !localUsedSlots.has(topSuggestion.slotId)) {
        onUpload(topSuggestion.slotId, photo.file);
        assignStagingPhoto(photo.id, topSuggestion.slotId);
        removeStagingPhoto(photo.id);
        localUsedSlots.add(topSuggestion.slotId); // Mark as used for subsequent photos
      }
    });
  }, [getUnassignedStagingPhotos, usedSlots, onUpload, assignStagingPhoto, removeStagingPhoto]);

  // Keyboard navigation handler
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Only handle if no input is focused
    if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
      return;
    }

    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault();
        setFocusedSlotIndex(prev => {
          const next = prev + 1;
          if (next >= allSlots.length) return 0;
          return next;
        });
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault();
        setFocusedSlotIndex(prev => {
          const next = prev - 1;
          if (next < 0) return allSlots.length - 1;
          return next;
        });
        break;
      case 'Enter':
      case ' ':
        if (focusedSlotIndex >= 0 && focusedSlotIndex < allSlots.length) {
          e.preventDefault();
          const slot = allSlots[focusedSlotIndex];
          const fileInput = fileInputRefs.current[slot.id];
          if (fileInput && !photos[slot.id]) {
            fileInput.click();
          }
        }
        break;
      case 'Delete':
      case 'Backspace':
        if (focusedSlotIndex >= 0 && focusedSlotIndex < allSlots.length) {
          e.preventDefault();
          const slot = allSlots[focusedSlotIndex];
          if (photos[slot.id]) {
            onRemove(slot.id);
          }
        }
        break;
      case 'a':
        // Accept all suggestions with Ctrl/Cmd + A
        if ((e.ctrlKey || e.metaKey) && getUnassignedStagingPhotos().length > 0) {
          e.preventDefault();
          handleAcceptAllSuggestions();
        }
        break;
    }
  }, [focusedSlotIndex, allSlots, photos, onRemove, getUnassignedStagingPhotos, handleAcceptAllSuggestions]);

  // Focus the slot element when focusedSlotIndex changes
  useEffect(() => {
    if (focusedSlotIndex >= 0 && focusedSlotIndex < allSlots.length) {
      const slot = allSlots[focusedSlotIndex];
      const element = photoSlotRefs.current[slot.id];
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.focus();
      }
    }
  }, [focusedSlotIndex, allSlots]);

  // Register keyboard event listener
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Handle assignment modal apply
  const handleApplyAssignments = (assignments: Record<string, string>) => {
    const stagingPhotos = getStagingPhotos();
    Object.entries(assignments).forEach(([photoId, slotId]) => {
      const photo = stagingPhotos.find(p => p.id === photoId);
      if (photo) {
        onUpload(slotId, photo.file);
        assignStagingPhoto(photoId, slotId);
        removeStagingPhoto(photoId);
      }
    });
  };

  // Hover preview handling with 300ms delay
  const handleMouseEnter = (slotId: string) => {
    setHoveredSlot(slotId);
    if (photos[slotId]) {
      hoverTimeoutRef.current = setTimeout(() => {
        setShowQuickPeek(slotId);
      }, 300);
    }
  };

  const handleMouseLeave = () => {
    setHoveredSlot(null);
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setShowQuickPeek(null);
  };

  return (
    <div className="space-y-6">
      {/* Cover Photo Section - Hero image for report title page */}
      <CoverPhotoSection
        coverPhoto={wizardState.coverPhoto}
        onSetCoverPhoto={setCoverPhoto}
        onRemoveCoverPhoto={removeCoverPhoto}
        uploadedPhotos={photos}
        subjectData={wizardState.subjectData}
        onOpenPicker={() => setShowCoverPhotoPicker(true)}
      />

      {/* Cover Photo Picker Modal */}
      <CoverPhotoPickerModal
        isOpen={showCoverPhotoPicker}
        onClose={() => setShowCoverPhotoPicker(false)}
        onSelect={setCoverPhoto}
        uploadedPhotos={photos}
      />

      {/* Staging Tray - Shows unassigned photos (uploaded in Document Intake) */}
      <PhotoStagingTray
        onAssignPhoto={handleAssignStagingPhoto}
        onAcceptAllSuggestions={handleAcceptAllSuggestions}
        usedSlots={usedSlots}
        onDragStart={(photo) => {
          setIsDraggingPhoto(true);
          setDraggedPhotoPreview(photo.preview);
        }}
        onDragEnd={() => {
          setIsDraggingPhoto(false);
          setDraggedPhotoPreview(undefined);
        }}
      />

      {/* Floating Drop Panel - Appears when dragging a photo */}
      <FloatingDropPanel
        isVisible={isDraggingPhoto}
        draggedPhotoPreview={draggedPhotoPreview}
        usedSlots={usedSlots}
        onDropToSlot={(slotId) => {
          const stagingPhotos = getStagingPhotos();
          const unassigned = stagingPhotos.filter(p => !p.assignedSlot);
          // Find the photo that's currently being dragged
          // For now, we'll use the first unassigned one since we're dragging
          if (unassigned.length > 0) {
            const photo = unassigned.find(p => p.preview === draggedPhotoPreview) || unassigned[0];
            if (photo) {
              onUpload(slotId, photo.file);
              assignStagingPhoto(photo.id, slotId);
              removeStagingPhoto(photo.id);
            }
          }
          setIsDraggingPhoto(false);
          setDraggedPhotoPreview(undefined);
        }}
      />

      {/* Photo Stats Summary */}
      <div className="bg-gradient-to-r from-harken-blue/10 to-harken-accent/5 border border-harken-blue/20 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-harken-blue/20 flex items-center justify-center">
              <Camera className="w-5 h-5 text-harken-blue" />
            </div>
            <div>
              <p className="font-semibold text-harken-dark dark:text-white">Subject Property Photos</p>
              <p className="text-sm text-harken-gray dark:text-slate-400">
                {Object.values(photos).filter(Boolean).length} of{' '}
                {photoCategories.reduce((sum, c) => sum + c.slots.length, 0)} photos uploaded
              </p>
            </div>
          </div>
          <div className="flex gap-2 text-xs">
            {photoCategories.map(cat => {
              const CatIcon = cat.Icon;
              return (
                <div
                  key={cat.id}
                  className={`px-2 py-1 rounded-full flex items-center gap-1 ${getUploadedCount(cat) > 0
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-harken-gray-light text-harken-gray dark:bg-elevation-1 dark:text-slate-400'
                    }`}
                >
                  <CatIcon className="w-3 h-3" />
                  <span>{getUploadedCount(cat)}/{cat.slots.length}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Assignment Modal */}
      <PhotoAssignmentModal
        isOpen={showAssignmentModal}
        onClose={() => setShowAssignmentModal(false)}
        onApply={handleApplyAssignments}
        existingSlotAssignments={existingSlotAssignments}
      />

      {/* Photo Categories */}
      {photoCategories.map((category) => (
        <div
          key={category.id}
          className="bg-surface-1 dark:bg-elevation-1 border border-light-border dark:border-dark-border rounded-xl shadow-sm overflow-hidden"
        >
          {/* Category Header */}
          <button
            onClick={() => toggleCategory(category.id)}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-harken-gray-light dark:hover:bg-elevation-3/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-harken-blue/10 flex items-center justify-center">
                <category.Icon className="w-5 h-5 text-harken-blue" />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-harken-dark dark:text-white">{category.label}</h3>
                <p className="text-sm text-harken-gray dark:text-slate-400">{category.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getUploadedCount(category) > 0
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-harken-gray-light text-harken-gray dark:bg-elevation-1 dark:text-slate-400'
                }`}>
                {getUploadedCount(category)}/{category.slots.length}
              </span>
              {category.reportPages && (
                <span className="text-xs text-harken-gray-med dark:text-slate-500">
                  {category.reportPages}
                </span>
              )}
              <ChevronDown className={`w-5 h-5 text-harken-gray-med transition-transform ${expandedCategories[category.id] ? 'rotate-180' : ''
                }`} />
            </div>
          </button>

          {/* Category Content */}
          {expandedCategories[category.id] && (
            <div className="border-t border-harken-gray-light dark:border-dark-border p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {category.slots.map((slot) => {
                  const photo = photos[slot.id];
                  const isDragOver = dragOverSlot === slot.id;
                  const globalIndex = allSlots.findIndex(s => s.id === slot.id);
                  const isFocused = focusedSlotIndex === globalIndex;

                  return (
                    <div
                      key={slot.id}
                      ref={(el) => { photoSlotRefs.current[slot.id] = el; }}
                      tabIndex={0}
                      className={`border-2 rounded-xl p-4 transition-all outline-none ${isFocused
                        ? 'ring-2 ring-harken-blue ring-offset-2 dark:ring-offset-harken-dark'
                        : ''
                        } ${isDragOver && !photo
                          ? 'border-harken-blue bg-harken-blue/10 dark:bg-harken-blue/20 scale-[1.02]'
                          : photo
                            ? 'border-green-200 dark:border-green-900/50 bg-green-50/30 dark:bg-green-900/10'
                            : slot.recommended
                              ? 'border-harken-blue/30 dark:border-harken-blue/50 bg-harken-blue/5 dark:bg-harken-blue/10'
                              : 'border-light-border dark:border-dark-border hover:border-harken-blue/40'
                        }`}
                      onMouseEnter={() => handleMouseEnter(slot.id)}
                      onMouseLeave={handleMouseLeave}
                      onDragOver={(e) => handleSlotDragOver(e, slot.id)}
                      onDragLeave={handleSlotDragLeave}
                      onDrop={(e) => handleSlotDrop(e, slot.id)}
                      onFocus={() => setFocusedSlotIndex(globalIndex)}
                    >
                      {/* Slot Header */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-medium text-harken-dark dark:text-white">{slot.label}</p>
                            {slot.recommended && !photo && (
                              <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-medium rounded">
                                Recommended
                              </span>
                            )}
                          </div>
                          {slot.description && (
                            <p className="text-xs text-harken-gray dark:text-slate-400">{slot.description}</p>
                          )}
                        </div>
                        {photo && (
                          <button
                            onClick={() => onRemove(slot.id)}
                            className="p-1 text-harken-gray-med hover:text-harken-error hover:bg-accent-red-light dark:hover:bg-accent-red-light rounded transition-colors"
                            title="Remove photo"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {photo ? (
                        <div className="space-y-3">
                          {/* Photo Preview */}
                          <div className="relative group">
                            <img
                              src={photo.preview}
                              alt={slot.label}
                              className="w-full h-32 object-cover rounded-lg"
                            />
                            {/* Overlay with Preview and Crop buttons */}
                            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                              {/* Crop button */}
                              {enableCropOnUpload && (
                                <button
                                  onClick={() => handleOpenCropModal(slot.id, photo)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-harken-blue/50 rounded-full text-sm font-medium text-slate-700 dark:text-harken-blue hover:bg-white dark:hover:border-harken-blue dark:hover:bg-slate-900 transition-colors shadow-sm backdrop-blur-sm"
                                  title="Crop photo"
                                >
                                  <Crop className="w-4 h-4" />
                                  Crop
                                </button>
                              )}
                              {/* Preview button */}
                              {onPreviewPhoto && (
                                <button
                                  onClick={() => onPreviewPhoto(slot.id, photo)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-harken-blue/50 rounded-full text-sm font-medium text-slate-700 dark:text-harken-blue hover:bg-white dark:hover:border-harken-blue dark:hover:bg-slate-900 transition-colors shadow-sm backdrop-blur-sm"
                                  title="Preview in report"
                                >
                                  <Eye className="w-4 h-4" />
                                  Preview
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Photo Metadata Fields */}
                          <div className="space-y-2">
                            {/* Caption */}
                            <input
                              type="text"
                              placeholder="Photo caption (e.g., South Elevation)"
                              value={photo.caption || ''}
                              onChange={(e) => onUpdateMetadata(slot.id, { caption: e.target.value })}
                              className="w-full px-3 py-2 text-sm border border-light-border dark:border-harken-gray bg-surface-1 dark:bg-elevation-1 text-harken-dark dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-harken-blue/40"
                            />

                            {/* Taken By & Date (collapsed row) */}
                            <div className="flex gap-2">
                              <input
                                type="text"
                                placeholder="Taken by"
                                value={photo.takenBy || defaultTakenBy}
                                onChange={(e) => onUpdateMetadata(slot.id, { takenBy: e.target.value })}
                                className="flex-1 px-2 py-1.5 text-xs border border-light-border dark:border-harken-gray bg-surface-1 dark:bg-elevation-1 text-harken-dark dark:text-white rounded focus:outline-none focus:ring-1 focus:ring-harken-blue/40"
                              />
                              <input
                                type="date"
                                value={photo.takenDate || defaultTakenDate}
                                onChange={(e) => onUpdateMetadata(slot.id, { takenDate: e.target.value })}
                                className="w-32 px-2 py-1.5 text-xs border border-light-border dark:border-harken-gray bg-surface-1 dark:bg-elevation-1 text-harken-dark dark:text-white dark:[color-scheme:dark] rounded focus:outline-none focus:ring-1 focus:ring-harken-blue/40"
                              />
                            </div>
                          </div>
                        </div>
                      ) : isAutoCropping && cropTargetSlotId === slot.id ? (
                        // Auto-cropping loading state
                        <div className="border-2 border-dashed border-harken-blue rounded-lg p-6 text-center bg-harken-blue/10 dark:bg-harken-blue/20">
                          <Loader2 className="w-8 h-8 mx-auto mb-2 text-harken-blue animate-spin" />
                          <p className="text-xs text-harken-blue font-medium">
                            Auto-cropping...
                          </p>
                          <p className="text-[10px] text-harken-gray mt-1">
                            Optimizing for real estate
                          </p>
                        </div>
                      ) : (
                        <label className={`block border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${isDragOver
                          ? 'border-harken-blue bg-harken-blue/10 dark:bg-harken-blue/20'
                          : isFocused
                            ? 'border-harken-blue bg-harken-blue/5 dark:bg-harken-blue/10'
                            : 'border-light-border dark:border-dark-border hover:border-harken-blue hover:bg-harken-blue/5 dark:hover:bg-harken-blue/10'
                          }`}>
                          <input
                            ref={(el) => { fileInputRefs.current[slot.id] = el; }}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleFileChange(slot.id, e)}
                          />
                          <Image className={`w-8 h-8 mx-auto mb-2 ${isDragOver || isFocused ? 'text-harken-blue' : 'text-harken-gray-med'}`} />
                          <p className={`text-xs ${isDragOver || isFocused ? 'text-harken-blue font-medium' : 'text-harken-gray'}`}>
                            {isDragOver ? 'Drop here' : isFocused ? 'Press Enter to upload' : 'Click or drag to upload'}
                          </p>
                        </label>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ))}



      {/* Photo Quick Peek Preview */}
      {showQuickPeek && photos[showQuickPeek] && (() => {
        // Find the slot and category info
        let slotLabel = '';
        let categoryLabel = '';
        for (const cat of photoCategories) {
          const slot = cat.slots.find(s => s.id === showQuickPeek);
          if (slot) {
            slotLabel = slot.label;
            categoryLabel = cat.label;
            break;
          }
        }
        return (
          <PhotoQuickPeek
            photo={photos[showQuickPeek]!}
            slotLabel={slotLabel}
            categoryLabel={categoryLabel}
            anchorElement={photoSlotRefs.current[showQuickPeek]}
            isVisible={true}
            onClose={handleMouseLeave}
          />
        );
      })()}

      {/* Photo Crop Modal */}
      {cropModalOpen && cropImageUrl && (
        <PhotoCropModal
          image={cropImageUrl}
          initialAspectRatio={16 / 9}
          onCrop={handleCropComplete}
          onCancel={handleCropCancel}
          title="Crop Photo"
          showAspectRatioSelector={true}
        />
      )}
    </div>
  );
}

// ==========================================
// EXHIBITS CONTENT - With Intake Integration
// ==========================================

// Document type display info with proper SVG icons
const DOCUMENT_TYPE_INFO: Record<string, { label: string; Icon: React.FC<{ className?: string }>; color: string }> = {
  cadastral: { label: 'Cadastral / County Records', Icon: Landmark, color: 'blue' },
  engagement: { label: 'Engagement Letter', Icon: FileSignature, color: 'purple' },
  sale: { label: 'Buy/Sale Agreement', Icon: Handshake, color: 'green' },
  lease: { label: 'Lease Agreement', Icon: FileIcon, color: 'orange' },
  rentroll: { label: 'Rent Roll', Icon: BarChart3, color: 'teal' },
  survey: { label: 'Survey / Plat Map', Icon: Map, color: 'indigo' },
  tax_return: { label: 'Tax Return', Icon: Receipt, color: 'red' },
  financial_statement: { label: 'Financial Statement', Icon: Wallet, color: 'emerald' },
  unknown: { label: 'Other Document', Icon: Folder, color: 'gray' },
};

interface ExhibitsProps {
  exhibits: Record<string, { file: File; name: string } | null>;
  includeInReport: Record<string, boolean>;
  setIncludeInReport: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  onUpload: (slotId: string, file: File) => void;
  onRemove: (slotId: string) => void;
}

interface CustomExhibit {
  id: string;
  file: File;
  name: string;
  preview?: string;
  status: 'uploading' | 'processing' | 'ready';
  includeInReport: boolean;
}

// Props note: exhibits, includeInReport, setIncludeInReport, onUpload, onRemove are available via ExhibitsProps for future features
function ExhibitsContent({ onUpload }: ExhibitsProps) {
  const { state: wizardState } = useWizard();
  const [customExhibits, setCustomExhibits] = useState<CustomExhibit[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get documents from WizardContext (uploaded during Document Intake phase)
  const intakeDocuments = wizardState.uploadedDocuments || [];
  const hasIntakeDocuments = intakeDocuments.length > 0;

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // AI-powered name extraction from filename
  const extractDocumentName = (filename: string): string => {
    // Remove extension
    let name = filename.replace(/\.[^/.]+$/, '');
    // Replace underscores and hyphens with spaces
    name = name.replace(/[_-]/g, ' ');
    // Remove common prefixes like dates, numbers
    name = name.replace(/^\d{4}[-_]?\d{2}[-_]?\d{2}\s*/, '');
    name = name.replace(/^\d+\s*[-_]\s*/, '');
    // Capitalize first letter of each word
    name = name.replace(/\b\w/g, l => l.toUpperCase());
    // If still empty, use generic name
    if (!name.trim()) {
      name = 'Custom Exhibit';
    }
    return name.trim();
  };

  // Handle file drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  }, []);

  // Handle file selection
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    processFiles(files);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  // Process uploaded files
  const processFiles = (files: File[]) => {
    const newExhibits: CustomExhibit[] = files.map(file => {
      const id = `exhibit_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
      const suggestedName = extractDocumentName(file.name);

      // Create preview for images/PDFs
      let preview: string | undefined;
      if (file.type.startsWith('image/')) {
        preview = URL.createObjectURL(file);
      }

      return {
        id,
        file,
        name: suggestedName,
        preview,
        status: 'ready' as const,
        includeInReport: true,
      };
    });

    setCustomExhibits(prev => [...prev, ...newExhibits]);

    // Sync to parent/context
    newExhibits.forEach(exhibit => {
      onUpload(exhibit.id, exhibit.file);
    });
  };

  // Remove custom exhibit
  const handleRemoveExhibit = (id: string) => {
    setCustomExhibits(prev => prev.filter(e => e.id !== id));
  };

  // Start editing name
  const handleStartEdit = (exhibit: CustomExhibit) => {
    setEditingId(exhibit.id);
    setEditName(exhibit.name);
  };

  // Save edited name
  const handleSaveName = (id: string) => {
    if (editName.trim()) {
      setCustomExhibits(prev => prev.map(e =>
        e.id === id ? { ...e, name: editName.trim() } : e
      ));
    }
    setEditingId(null);
    setEditName('');
  };

  // Get file type icon
  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <Image className="w-5 h-5 text-violet-500" />;
    if (file.type === 'application/pdf') return <FileText className="w-5 h-5 text-harken-blue" />;
    if (file.type.includes('spreadsheet') || file.type.includes('excel')) return <BarChart3 className="w-5 h-5 text-accent-teal-mint" />;
    if (file.type.includes('document') || file.type.includes('word')) return <FileIcon className="w-5 h-5 text-blue-500" />;
    return <Folder className="w-5 h-5 text-slate-500" />;
  };

  return (
    <div className="space-y-6">
      {/* Documents from Intake - styled like Document Intake page */}
      {hasIntakeDocuments && (
        <div className="bg-surface-1 dark:bg-elevation-1 border border-light-border dark:border-dark-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-harken-dark dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-harken-blue" />
              Documents from Intake ({intakeDocuments.length})
            </h3>
            <p className="text-xs text-green-600 flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" />
              All documents processed
            </p>
          </div>
          <div className="space-y-3">
            {intakeDocuments.map((doc) => {
              const typeInfo = DOCUMENT_TYPE_INFO[doc.slotId] || DOCUMENT_TYPE_INFO.unknown;

              return (
                <div
                  key={doc.id}
                  className="flex items-center gap-4 p-4 bg-surface-1 dark:bg-elevation-1/50 rounded-xl border border-light-border dark:border-dark-border hover:border-harken-blue/30 dark:hover:border-harken-blue/40 transition-all group"
                >
                  {/* Icon */}
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-harken-dark dark:to-harken-dark flex items-center justify-center flex-shrink-0 border border-light-border dark:border-dark-border dark:border-harken-gray">
                    <typeInfo.Icon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  </div>

                  {/* Name and size */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-harken-dark dark:text-white truncate">{doc.name}</p>
                    <p className="text-xs text-harken-gray dark:text-slate-400">{formatFileSize(doc.size)}</p>
                  </div>

                  {/* Classification badge */}
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-harken-blue/10 text-harken-blue border border-harken-blue/20">
                    {typeInfo.label}
                  </span>

                  {/* Fields extracted indicator */}
                  {doc.extractedData && Object.keys(doc.extractedData).length > 0 && (
                    <span className="text-xs text-green-600 flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      {Object.keys(doc.extractedData).length} fields extracted
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State if no documents AT ALL (Intake or Custom) */}
      {!hasIntakeDocuments && customExhibits.length === 0 && (
        <div className="bg-harken-gray-light dark:bg-elevation-1/50 border border-light-border dark:border-dark-border rounded-xl p-8 text-center">
          <FileText className="w-12 h-12 text-harken-gray-med-lt dark:text-slate-500 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-harken-dark dark:text-slate-200 mb-2">No Documents Uploaded</h3>
          <p className="text-sm text-harken-gray dark:text-slate-400 mb-4">
            Documents uploaded during the Document Intake phase will appear here.
          </p>
          <p className="text-xs text-harken-gray-med dark:text-slate-500">
            You can add additional exhibits below.
          </p>
        </div>
      )}

      {/* Additional Exhibits */}
      <div className="bg-surface-1 dark:bg-elevation-1 border border-light-border dark:border-dark-border rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-harken-dark dark:text-white border-b-2 border-light-border dark:border-harken-gray pb-3 mb-4">
          Additional Exhibits
        </h3>
        <p className="text-sm text-harken-gray dark:text-slate-400 mb-4">
          Upload additional documents to include in the report addenda.
        </p>

        {/* Uploaded Custom Exhibits - styled like Document Intake */}
        {customExhibits.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            <div className="lg:col-span-2 flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-harken-dark dark:text-slate-200">
                Uploaded Exhibits ({customExhibits.length})
              </p>
              <p className="text-xs text-green-600 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" />
                Ready for report
              </p>
            </div>
            {customExhibits.map((exhibit) => (
              <div
                key={exhibit.id}
                className="flex items-center gap-4 p-4 bg-surface-1 dark:bg-elevation-1/50 rounded-xl border border-light-border dark:border-dark-border hover:border-harken-blue/30 dark:hover:border-harken-blue/40 transition-all group"
              >
                {/* Icon */}
                <div className="w-10 h-10 rounded-xl overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 dark:from-harken-dark dark:to-harken-dark flex items-center justify-center flex-shrink-0 border border-light-border dark:border-dark-border dark:border-harken-gray">
                  {exhibit.preview ? (
                    <img src={exhibit.preview} alt="" className="w-full h-full object-cover" />
                  ) : (
                    getFileIcon(exhibit.file)
                  )}
                </div>

                {/* Name and details */}
                <div className="flex-1 min-w-0">
                  {editingId === exhibit.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveName(exhibit.id);
                          if (e.key === 'Escape') { setEditingId(null); setEditName(''); }
                        }}
                        autoFocus
                        className="flex-1 px-3 py-1.5 text-sm border border-harken-blue rounded-lg focus:outline-none focus:ring-2 focus:ring-harken-blue/30 bg-surface-1 dark:bg-elevation-1 dark:text-white"
                      />
                      <button
                        onClick={() => handleSaveName(exhibit.id)}
                        className="p-1.5 text-harken-blue hover:bg-harken-blue/10 rounded-lg"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => { setEditingId(null); setEditName(''); }}
                        className="p-1.5 text-harken-gray-med hover:bg-harken-gray-light dark:hover:bg-elevation-3 rounded-lg"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm font-semibold text-harken-dark dark:text-white truncate">
                        {exhibit.name}
                      </p>
                      <p className="text-xs text-harken-gray">{formatFileSize(exhibit.file.size)}</p>
                    </>
                  )}
                </div>

                {/* Classification badge */}
                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-harken-blue/10 text-harken-blue border border-harken-blue/20">
                  Custom Exhibit
                </span>

                {/* Change name link */}
                {editingId !== exhibit.id && (
                  <button
                    onClick={() => handleStartEdit(exhibit)}
                    className="text-xs text-harken-gray-med hover:text-harken-blue transition-colors"
                  >
                    Change
                  </button>
                )}

                {/* Remove button */}
                <button
                  onClick={() => handleRemoveExhibit(exhibit.id)}
                  className="p-1.5 text-harken-gray-med-lt hover:text-harken-gray transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Drag & Drop Upload Zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={(e) => { e.preventDefault(); setIsDragOver(false); }}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`
            w-full px-4 py-6 border-2 border-dashed rounded-xl cursor-pointer
            transition-all duration-200 flex flex-col items-center gap-2
            ${isDragOver
              ? 'border-harken-blue bg-harken-blue/10 dark:bg-harken-blue/20 scale-[1.01]'
              : 'border-light-border dark:border-dark-border hover:border-harken-blue dark:hover:border-harken-blue hover:bg-harken-blue/5 dark:hover:bg-harken-blue/10'
            }
          `}
        >
          <div className={`
            w-12 h-12 rounded-xl flex items-center justify-center transition-all
            ${isDragOver ? 'bg-harken-blue text-white scale-110' : 'bg-harken-gray-light dark:bg-elevation-1 text-harken-gray-med dark:text-slate-500'}
          `}>
            <Upload className="w-6 h-6" />
          </div>
          <div className="text-center">
            <p className={`font-medium ${isDragOver ? 'text-harken-blue' : 'text-harken-dark dark:text-slate-200'}`}>
              {isDragOver ? 'Drop files here' : 'Drop files here or click to browse'}
            </p>
            <p className="text-sm text-harken-gray dark:text-slate-400 mt-1">
              PDF, Word, Excel, Images, and more
            </p>
          </div>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.gif,.webp,.heic"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Helper text */}
        <p className="text-xs text-harken-gray dark:text-slate-400 mt-3 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          Document names are auto-detected. Click any name to edit it.
        </p>
      </div>
    </div>
  );
}
