import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import WizardLayout from '../components/WizardLayout';
import ImprovementsInventory from '../components/ImprovementsInventory';
import SiteImprovementsInventory from '../components/SiteImprovementsInventory';
import EnhancedTextArea from '../components/EnhancedTextArea';
import WizardGuidancePanel from '../components/WizardGuidancePanel';
import DemographicsPanel from '../components/DemographicsPanel';
import { useWizard } from '../context/WizardContext';
import type { SiteImprovement } from '../types';
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
  Home, Sofa, Trees, Route, Landmark, FileSignature, Handshake, File, BarChart3, Map, Receipt, Wallet, Folder,
  Sparkles, Loader2, Info, Droplets, Zap, AlertTriangle, Check
} from 'lucide-react';
import ButtonSelector from '../components/ButtonSelector';
import ExpandableNote from '../components/ExpandableNote';
import PhotoQuickPeek from '../components/PhotoQuickPeek';
import PhotoLivePreview from '../components/PhotoLivePreview';
import BulkPhotoDropZone from '../components/BulkPhotoDropZone';
import PhotoStagingTray from '../components/PhotoStagingTray';
import PhotoAssignmentModal from '../components/PhotoAssignmentModal';
import FloatingDropPanel from '../components/FloatingDropPanel';
import CoverPhotoSection from '../components/CoverPhotoSection';
import CoverPhotoPickerModal from '../components/CoverPhotoPickerModal';
import { SidebarTab } from '../components/SidebarTab';
import { SectionProgressSummary } from '../components/SectionProgressSummary';
import { useCompletion } from '../hooks/useCompletion';
import { useCelebration } from '../hooks/useCelebration';
import { useSmartContinue } from '../hooks/useSmartContinue';
import { SUBJECT_DATA_GUIDANCE, type SectionGuidance } from '../constants/wizardPhaseGuidance';
import { generateDraft } from '../services/aiService';
import type { AIGenerationContext } from '../types/api';

const tabs = [
  { id: 'location', label: 'Location & Area', Icon: LocationIcon },
  { id: 'site', label: 'Site Details', Icon: SiteIcon },
  { id: 'improvements', label: 'Improvements', Icon: BuildingIcon },
  { id: 'demographics', label: 'Demographics', Icon: UsersIcon },
  { id: 'tax', label: 'Tax & Ownership', Icon: TaxIcon },
  { id: 'photos', label: 'Photos & Maps', Icon: PhotoIcon },
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

// Photo metadata structure
export interface PhotoData {
  file: File;
  preview: string;
  caption: string;
  takenBy: string;
  takenDate: string;
}

export default function SubjectDataPage() {
  const { state: wizardState, setSubjectData, setSiteImprovements, setReportPhotos } = useWizard();
  const [activeTab, setActiveTab] = useState('location');

  // Location tab state - initialize from WizardContext
  // Auto-populate city/county from address entered in Setup phase
  const [cityCounty, setCityCounty] = useState(() => {
    const addr = wizardState.subjectData?.address;
    if (addr?.city && addr?.county) {
      return `${addr.city}, ${addr.county}`;
    } else if (addr?.city) {
      return addr.city;
    } else if (addr?.county) {
      return addr.county;
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

  // Enhanced Flood Zone state
  const [femaZone, setFemaZone] = useState('');
  const [femaMapPanel, setFemaMapPanel] = useState('');
  const [femaMapDate, setFemaMapDate] = useState('');
  const [floodInsuranceRequired, setFloodInsuranceRequired] = useState('');
  const [floodZoneNotes, setFloodZoneNotes] = useState('');

  // Site Description Narrative
  const [siteDescriptionNarrative, setSiteDescriptionNarrative] = useState('');
  const [isDraftingSiteDescription, setIsDraftingSiteDescription] = useState(false);

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
  useEffect(() => {
    setSubjectData({
      // Location fields
      address: { ...wizardState.subjectData?.address, county: cityCounty },
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
    });
  }, [cityCounty, areaDescription, neighborhoodBoundaries, neighborhoodCharacteristics, specificLocation,
      acres, squareFeet, shape, frontage, topography, environmental, easements,
      zoningClass, zoningDescription, zoningConformance,
      waterSource, sewerType, electricProvider, naturalGas, telecom,
      femaZone, femaMapPanel, femaMapDate, floodInsuranceRequired,
      siteDescriptionNarrative, setSubjectData]);

  // Photos state with metadata support
  const [photos, setPhotos] = useState<Record<string, PhotoData | null>>({});

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
    // This will be handled by the PhotoQuickPeek component
    // For now, we can log which photo is being previewed
    console.log('Preview photo:', slotId, photo.caption);
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
    setExhibits(prev => ({ ...prev, [slotId]: { file, name: file.name } }));
    setIncludeInReport(prev => ({ ...prev, [slotId]: true }));
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
      <h2 className="text-lg font-bold text-gray-900 mb-1">Subject Property</h2>
      <p className="text-sm text-gray-500 mb-6">
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
      themeColor="#0da1c7"
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
            // Site Description Narrative
            siteDescriptionNarrative={siteDescriptionNarrative}
            setSiteDescriptionNarrative={setSiteDescriptionNarrative}
            isDraftingSiteDescription={isDraftingSiteDescription}
            setIsDraftingSiteDescription={setIsDraftingSiteDescription}
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
          <h2 className="text-xl font-bold text-[#1c3643]">Location & Area Analysis</h2>
          <p className="text-sm text-gray-500 mt-1">Describe the regional, neighborhood, and specific location context</p>
        </div>
        <button
          onClick={onDraftAll}
          disabled={isDraftingAll}
          className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-[#4db8d1] to-[#7fcce0] rounded-lg hover:from-[#3da8c1] hover:to-[#6fc0d4] flex items-center gap-2 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-[#1c3643] border-b-2 border-gray-200 pb-3 mb-4">
          General Area Analysis
        </h3>
        <div className="space-y-4">
          {/* City/County - Auto-populated from Setup */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City/County <span className="text-red-500">*</span>
            </label>
            {cityCounty ? (
              <div className="flex items-center gap-2">
                <div className="flex-1 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-800 font-medium flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  {cityCounty}
                </div>
                <div className="flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent bg-white"
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
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-[#1c3643] border-b-2 border-gray-200 pb-3 mb-4">
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
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-[#1c3643] border-b-2 border-gray-200 pb-3 mb-4">
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
      <div className="bg-gradient-to-r from-[#0da1c7]/5 to-transparent border border-[#0da1c7]/20 rounded-xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-[#0da1c7] flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-slate-800">Neighborhood Demographics</h4>
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
  // Site Description Narrative
  siteDescriptionNarrative: string;
  setSiteDescriptionNarrative: (v: string) => void;
  isDraftingSiteDescription: boolean;
  setIsDraftingSiteDescription: (v: boolean) => void;
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
  acres, setAcres, squareFeet, setSquareFeet,
  shape, setShape,
  frontage, setFrontage,
  siteNotes, setSiteNotes,
  zoningClass, setZoningClass,
  zoningDescription, setZoningDescription,
  zoningConformance, setZoningConformance,
  waterSource, setWaterSource, waterNotes, setWaterNotes,
  sewerType, setSewerType, sewerNotes, setSewerNotes,
  electricProvider, setElectricProvider, electricAdequacy, setElectricAdequacy, electricNotes, setElectricNotes,
  naturalGas, setNaturalGas, naturalGasNotes, setNaturalGasNotes,
  telecom, setTelecom, telecomNotes, setTelecomNotes,
  siteImprovements, onSiteImprovementsChange,
  topography, setTopography, drainage, setDrainage,
  environmental, setEnvironmental, easements, setEasements,
  femaZone, setFemaZone, femaMapPanel, setFemaMapPanel,
  femaMapDate, setFemaMapDate, floodInsuranceRequired, setFloodInsuranceRequired,
  floodZoneNotes, setFloodZoneNotes,
  siteDescriptionNarrative, setSiteDescriptionNarrative,
  isDraftingSiteDescription, setIsDraftingSiteDescription,
}: SiteProps) {
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
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-[#1c3643] border-b-2 border-gray-200 pb-3 mb-4">
          Site Size & Shape
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Total Acres <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={acres}
              onChange={(e) => handleAcresChange(e.target.value)}
              step="0.001"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent"
              placeholder="0.000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Total Square Feet <span className="text-gray-400 text-xs">(or enter to calculate acres)</span>
            </label>
            <input
              type="text"
              value={squareFeet ? parseInt(squareFeet).toLocaleString() : ''}
              onChange={(e) => handleSquareFeetChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent"
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Frontage</label>
          <input
            type="text"
            value={frontage}
            onChange={(e) => setFrontage(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent"
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

      {/* Zoning & Land Use */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-[#1c3643] border-b-2 border-gray-200 pb-3 mb-4">
          Zoning & Land Use
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Zoning Classification <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={zoningClass}
              onChange={(e) => setZoningClass(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent"
              placeholder="e.g., I1 - Light Industrial"
            />
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
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-[#1c3643] border-b-2 border-gray-200 pb-3 mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-[#0da1c7]" />
          Utilities & Services
        </h3>
        <div className="space-y-6">
          {/* Water Source */}
          <div>
            <ButtonSelector
              label="Water Source"
              options={WATER_SOURCE_OPTIONS}
              value={waterSource}
              onChange={setWaterSource}
            />
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Electric Provider</label>
                <input
                  type="text"
                  value={electricProvider}
                  onChange={(e) => setElectricProvider(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent"
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
        </div>
      </div>

      {/* Site Improvements Inventory - M&S Section 66 with Age-Life Tracking */}
      <SiteImprovementsInventory
        improvements={siteImprovements}
        onChange={onSiteImprovementsChange}
      />

      {/* Additional Site Characteristics */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-[#1c3643] border-b-2 border-gray-200 pb-3 mb-4">
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
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-[#1c3643] border-b-2 border-gray-200 pb-3 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-[#0da1c7]" />
          Flood Zone
        </h3>
        <div className="space-y-4">
          <ButtonSelector
            label="FEMA Zone"
            options={FEMA_ZONE_OPTIONS}
            value={femaZone}
            onChange={setFemaZone}
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Map Panel Number</label>
              <input
                type="text"
                value={femaMapPanel}
                onChange={(e) => setFemaMapPanel(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent"
                placeholder="e.g., 30111C2175E"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Map Effective Date</label>
              <input
                type="date"
                value={femaMapDate}
                onChange={(e) => setFemaMapDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent"
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
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between border-b-2 border-gray-200 pb-3 mb-4">
          <h3 className="text-lg font-bold text-[#1c3643]">
            Site Description Narrative
          </h3>
          <button
            onClick={handleDraftSiteDescription}
            disabled={isDraftingSiteDescription}
            className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-[#4db8d1] to-[#7fcce0] rounded-lg hover:from-[#3da8c1] hover:to-[#6fc0d4] flex items-center gap-2 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
        <p className="text-sm text-gray-500 mb-4">
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
        <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-700">
          <CheckCircle className="w-4 h-4" />
          <span>Tax assessment data auto-filled from property records</span>
        </div>
      )}
      
      {/* Property Tax Information */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-[#1c3643] border-b-2 border-gray-200 pb-3 mb-4">
          Property Tax Information
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tax Year</label>
            <select
              value={taxYear}
              onChange={(e) => setTaxYear(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent bg-white"
            >
              {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Year Tax Amount</label>
            <input
              type="text"
              value={taxAmount}
              onChange={(e) => setTaxAmount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent"
              placeholder="$0.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assessed Value - Land</label>
            <input
              type="text"
              value={assessedLand}
              onChange={(e) => setAssessedLand(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent"
              placeholder="$0.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assessed Value - Improvements</label>
            <input
              type="text"
              value={assessedImprovements}
              onChange={(e) => setAssessedImprovements(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent"
              placeholder="$0.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Total Assessed Value</label>
            <input
              type="text"
              value={totalAssessed}
              onChange={(e) => setTotalAssessed(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent"
              placeholder="$0.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mill Levy / Tax Rate</label>
            <input
              type="number"
              value={millLevy}
              onChange={(e) => setMillLevy(e.target.value)}
              step="0.001"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent"
              placeholder="0.000"
            />
          </div>
        </div>
      </div>

      {/* Sale & Ownership History */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-[#1c3643] border-b-2 border-gray-200 pb-3 mb-4">
          Sale & Ownership History
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date of Last Sale</label>
            <input
              type="date"
              value={lastSaleDate}
              onChange={(e) => setLastSaleDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Sale Price</label>
            <input
              type="text"
              value={lastSalePrice}
              onChange={(e) => setLastSalePrice(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent"
              placeholder="$0.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Grantor (Seller)</label>
            <input
              type="text"
              value={grantor}
              onChange={(e) => setGrantor(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent"
              placeholder="Name of seller"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Grantee (Buyer)</label>
            <input
              type="text"
              value={grantee}
              onChange={(e) => setGrantee(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent"
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
}

function PhotosContent({ 
  photos, 
  onUpload, 
  onRemove, 
  onUpdateMetadata,
  defaultTakenBy,
  defaultTakenDate,
  onPreviewPhoto,
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

  const handleFileChange = (slotId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      onUpload(slotId, e.target.files[0]);
    }
  };

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

  // Handle bulk upload completion
  const handlePhotosProcessed = () => {
    // Could show the assignment modal automatically
    // For now, staging tray handles it inline
  };

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

      {/* Bulk Upload Drop Zone */}
      <BulkPhotoDropZone
        onPhotosProcessed={handlePhotosProcessed}
        existingSlotAssignments={existingSlotAssignments}
      />

      {/* Staging Tray - Shows unassigned photos */}
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
      <div className="bg-gradient-to-r from-[#0da1c7]/10 to-[#4db8d1]/5 border border-[#0da1c7]/20 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#0da1c7]/20 flex items-center justify-center">
              <Camera className="w-5 h-5 text-[#0da1c7]" />
            </div>
            <div>
              <p className="font-semibold text-[#1c3643]">Subject Property Photos</p>
              <p className="text-sm text-gray-600">
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
                  className={`px-2 py-1 rounded-full flex items-center gap-1 ${
                    getUploadedCount(cat) > 0 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-500'
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
          className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden"
        >
          {/* Category Header */}
          <button
            onClick={() => toggleCategory(category.id)}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#0da1c7]/10 flex items-center justify-center">
                <category.Icon className="w-5 h-5 text-[#0da1c7]" />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-[#1c3643]">{category.label}</h3>
                <p className="text-sm text-gray-500">{category.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                getUploadedCount(category) > 0 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-gray-100 text-gray-500'
              }`}>
                {getUploadedCount(category)}/{category.slots.length}
              </span>
              {category.reportPages && (
                <span className="text-xs text-gray-400">
                  {category.reportPages}
                </span>
              )}
              <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${
                expandedCategories[category.id] ? 'rotate-180' : ''
              }`} />
            </div>
          </button>

          {/* Category Content */}
          {expandedCategories[category.id] && (
            <div className="border-t border-gray-100 p-6">
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
                      className={`border-2 rounded-xl p-4 transition-all outline-none ${
                        isFocused
                          ? 'ring-2 ring-[#0da1c7] ring-offset-2'
                          : ''
                      } ${
                        isDragOver && !photo
                          ? 'border-[#0da1c7] bg-[#0da1c7]/10 scale-[1.02]'
                          : photo 
                            ? 'border-green-200 bg-green-50/30' 
                            : slot.recommended 
                              ? 'border-[#0da1c7]/30 bg-[#0da1c7]/5' 
                              : 'border-gray-200'
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
                            <p className="text-sm font-medium text-gray-800">{slot.label}</p>
                            {slot.recommended && !photo && (
                              <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-medium rounded">
                                Recommended
                              </span>
                            )}
                          </div>
                          {slot.description && (
                            <p className="text-xs text-gray-500">{slot.description}</p>
                          )}
                        </div>
                        {photo && (
                          <button
                            onClick={() => onRemove(slot.id)}
                            className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
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
                            {/* Preview button overlay */}
                            {onPreviewPhoto && (
                              <button
                                onClick={() => onPreviewPhoto(slot.id, photo)}
                                className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
                                title="Preview in report"
                              >
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/90 rounded-full text-sm font-medium text-gray-800">
                                  <Eye className="w-4 h-4" />
                                  Preview
                                </div>
                              </button>
                            )}
                          </div>

                          {/* Photo Metadata Fields */}
                          <div className="space-y-2">
                            {/* Caption */}
                            <input
                              type="text"
                              placeholder="Photo caption (e.g., South Elevation)"
                              value={photo.caption || ''}
                              onChange={(e) => onUpdateMetadata(slot.id, { caption: e.target.value })}
                              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0da1c7]/40"
                            />
                            
                            {/* Taken By & Date (collapsed row) */}
                            <div className="flex gap-2">
                              <input
                                type="text"
                                placeholder="Taken by"
                                value={photo.takenBy || defaultTakenBy}
                                onChange={(e) => onUpdateMetadata(slot.id, { takenBy: e.target.value })}
                                className="flex-1 px-2 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#0da1c7]/40"
                              />
                              <input
                                type="date"
                                value={photo.takenDate || defaultTakenDate}
                                onChange={(e) => onUpdateMetadata(slot.id, { takenDate: e.target.value })}
                                className="w-32 px-2 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#0da1c7]/40"
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <label className={`block border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${
                          isDragOver 
                            ? 'border-[#0da1c7] bg-[#0da1c7]/10' 
                            : isFocused
                              ? 'border-[#0da1c7] bg-[#0da1c7]/5'
                              : 'border-gray-300 hover:border-[#0da1c7] hover:bg-[#0da1c7]/5'
                        }`}>
                          <input
                            ref={(el) => { fileInputRefs.current[slot.id] = el; }}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleFileChange(slot.id, e)}
                          />
                          <Image className={`w-8 h-8 mx-auto mb-2 ${isDragOver || isFocused ? 'text-[#0da1c7]' : 'text-gray-400'}`} />
                          <p className={`text-xs ${isDragOver || isFocused ? 'text-[#0da1c7] font-medium' : 'text-gray-500'}`}>
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

      {/* Auto-Generate Maps */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-[#1c3643] border-b-2 border-gray-200 pb-3 mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-[#0da1c7]" />
          Maps
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Generate maps automatically from the property address.
        </p>
        <div className="flex flex-wrap gap-3">
          <button className="px-4 py-2 border border-[#0da1c7] text-[#0da1c7] rounded-lg text-sm font-medium hover:bg-[#0da1c7]/10 flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Generate Location Map
          </button>
          <button className="px-4 py-2 border border-[#0da1c7] text-[#0da1c7] rounded-lg text-sm font-medium hover:bg-[#0da1c7]/10 flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Generate Aerial View
          </button>
          <button className="px-4 py-2 border border-[#0da1c7] text-[#0da1c7] rounded-lg text-sm font-medium hover:bg-[#0da1c7]/10 flex items-center gap-2">
            <FileCheck className="w-4 h-4" />
            Generate Flood Map
          </button>
        </div>
      </div>

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
  lease: { label: 'Lease Agreement', Icon: File, color: 'orange' },
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
function ExhibitsContent(_props: ExhibitsProps) {
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
      const id = `exhibit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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
    if (file.type === 'application/pdf') return <FileText className="w-5 h-5 text-[#0da1c7]" />;
    if (file.type.includes('spreadsheet') || file.type.includes('excel')) return <BarChart3 className="w-5 h-5 text-emerald-500" />;
    if (file.type.includes('document') || file.type.includes('word')) return <File className="w-5 h-5 text-blue-500" />;
    return <Folder className="w-5 h-5 text-slate-500" />;
  };

  return (
    <div className="space-y-6">
      {/* Documents from Intake - styled like Document Intake page */}
      {hasIntakeDocuments && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-[#1c3643] flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#0da1c7]" />
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
                  className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:border-[#0da1c7]/30 transition-all group"
                >
                  {/* Icon */}
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center flex-shrink-0 border border-slate-200">
                    <typeInfo.Icon className="w-5 h-5 text-slate-600" />
                  </div>

                  {/* Name and size */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{doc.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(doc.size)}</p>
                  </div>

                  {/* Classification badge */}
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[#0da1c7]/10 text-[#0da1c7] border border-[#0da1c7]/20">
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

      {/* Empty State if no documents */}
      {!hasIntakeDocuments && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">No Documents Uploaded</h3>
          <p className="text-sm text-gray-500 mb-4">
            Documents uploaded during the Document Intake phase will appear here.
          </p>
          <p className="text-xs text-gray-400">
            You can add additional exhibits below.
          </p>
        </div>
      )}

      {/* Additional Exhibits */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-[#1c3643] border-b-2 border-gray-200 pb-3 mb-4">
          Additional Exhibits
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Upload additional documents to include in the report addenda.
        </p>

        {/* Uploaded Custom Exhibits - styled like Document Intake */}
        {customExhibits.length > 0 && (
          <div className="space-y-3 mb-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-700">
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
                className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:border-[#0da1c7]/30 transition-all group"
              >
                {/* Icon */}
                <div className="w-10 h-10 rounded-xl overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center flex-shrink-0 border border-slate-200">
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
                        className="flex-1 px-3 py-1.5 text-sm border border-[#0da1c7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0da1c7]/30"
                      />
                      <button
                        onClick={() => handleSaveName(exhibit.id)}
                        className="p-1.5 text-[#0da1c7] hover:bg-[#0da1c7]/10 rounded-lg"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => { setEditingId(null); setEditName(''); }}
                        className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {exhibit.name}
                      </p>
                      <p className="text-xs text-gray-500">{formatFileSize(exhibit.file.size)}</p>
                    </>
                  )}
                </div>

                {/* Classification badge */}
                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[#0da1c7]/10 text-[#0da1c7] border border-[#0da1c7]/20">
                  Custom Exhibit
                </span>

                {/* Change name link */}
                {editingId !== exhibit.id && (
                  <button
                    onClick={() => handleStartEdit(exhibit)}
                    className="text-xs text-gray-400 hover:text-[#0da1c7] transition-colors"
                  >
                    Change
                  </button>
                )}

                {/* Remove button */}
                <button
                  onClick={() => handleRemoveExhibit(exhibit.id)}
                  className="p-1.5 text-gray-300 hover:text-gray-500 transition-colors"
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
              ? 'border-[#0da1c7] bg-[#0da1c7]/10 scale-[1.01]' 
              : 'border-gray-300 hover:border-[#0da1c7] hover:bg-[#0da1c7]/5'
            }
          `}
        >
          <div className={`
            w-12 h-12 rounded-xl flex items-center justify-center transition-all
            ${isDragOver ? 'bg-[#0da1c7] text-white scale-110' : 'bg-gray-100 text-gray-400'}
          `}>
            <Upload className="w-6 h-6" />
          </div>
          <div className="text-center">
            <p className={`font-medium ${isDragOver ? 'text-[#0da1c7]' : 'text-gray-700'}`}>
              {isDragOver ? 'Drop files here' : 'Drop files here or click to browse'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
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
        <p className="text-xs text-gray-500 mt-3 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          Document names are auto-detected. Click any name to edit it.
        </p>
      </div>
    </div>
  );
}
