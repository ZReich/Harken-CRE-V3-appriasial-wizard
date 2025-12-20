import { useState, useEffect } from 'react';
import WizardLayout from '../components/WizardLayout';
import ImprovementsInventory from '../components/ImprovementsInventory';
import EnhancedTextArea from '../components/EnhancedTextArea';
import { useWizard } from '../context/WizardContext';
import {
  LocationIcon,
  SiteIcon,
  BuildingIcon,
  TaxIcon,
  PhotoIcon,
  DocumentIcon,
} from '../components/icons';
import { Upload, X, FileText, CheckCircle, Image, MapPin, Building2, FileCheck } from 'lucide-react';

const tabs = [
  { id: 'location', label: 'Location & Area', Icon: LocationIcon },
  { id: 'site', label: 'Site Details', Icon: SiteIcon },
  { id: 'improvements', label: 'Improvements', Icon: BuildingIcon },
  { id: 'tax', label: 'Tax & Ownership', Icon: TaxIcon },
  { id: 'photos', label: 'Photos & Maps', Icon: PhotoIcon },
  { id: 'exhibits', label: 'Exhibits & Docs', Icon: DocumentIcon },
];

// Photo slots mapped to report pages
const photoSlots = [
  { id: 'eval_p001_cover', page: 1, label: 'Cover Photo (Primary Exterior)' },
  { id: 'eval_p002_toc', page: 2, label: 'Table of Contents Photo (Exterior)' },
  { id: 'eval_p007_exec', page: 7, label: 'Executive Summary Photo (Exterior)' },
  { id: 'eval_p009_ps_1', page: 9, label: 'Property Summary Photo (1)' },
  { id: 'eval_p009_ps_2', page: 9, label: 'Property Summary Photo (2)' },
];

// Required document types for exhibits
const exhibitSlots = [
  { id: 'floor_plans', label: 'Floor Plans', description: 'Architectural floor plans' },
  { id: 'site_plans', label: 'Site Plans', description: 'Site plan or survey' },
  { id: 'rent_roll', label: 'Rent Roll', description: 'Current rent roll (if applicable)' },
  { id: 'operating_statements', label: 'Operating Statements', description: 'Income/expense statements' },
  { id: 'lease_agreements', label: 'Lease Agreements', description: 'Sample leases' },
  { id: 'title_report', label: 'Title Report', description: 'Preliminary title report' },
];

export default function SubjectDataPage() {
  const { state: wizardState } = useWizard();
  const [activeTab, setActiveTab] = useState('location');

  // Location tab state
  const [cityCounty, setCityCounty] = useState('');
  const [areaDescription, setAreaDescription] = useState('');
  const [neighborhoodBoundaries, setNeighborhoodBoundaries] = useState('');
  const [neighborhoodCharacteristics, setNeighborhoodCharacteristics] = useState('');
  const [specificLocation, setSpecificLocation] = useState('');

  // Site tab state
  const [acres, setAcres] = useState('');
  const [squareFeet, setSquareFeet] = useState('');
  const [shape, setShape] = useState('');
  const [frontage, setFrontage] = useState('');
  const [siteNotes, setSiteNotes] = useState('');
  const [zoningClass, setZoningClass] = useState('');
  const [zoningDescription, setZoningDescription] = useState('');
  const [zoningPermitted, setZoningPermitted] = useState(false);
  const [utilitiesStatus, setUtilitiesStatus] = useState('');
  const [topography, setTopography] = useState('');
  const [drainage, setDrainage] = useState('');
  const [floodZone, setFloodZone] = useState('');
  const [environmental, setEnvironmental] = useState('');
  const [easements, setEasements] = useState('');

  // Tax tab state
  const [taxYear, setTaxYear] = useState(new Date().getFullYear().toString());
  const [taxAmount, setTaxAmount] = useState('');
  const [assessedLand, setAssessedLand] = useState('');
  const [assessedImprovements, setAssessedImprovements] = useState('');
  const [totalAssessed, setTotalAssessed] = useState('');
  const [millLevy, setMillLevy] = useState('');
  const [lastSaleDate, setLastSaleDate] = useState('');
  const [lastSalePrice, setLastSalePrice] = useState('');
  const [grantor, setGrantor] = useState('');
  const [grantee, setGrantee] = useState('');
  const [transactionHistory, setTransactionHistory] = useState('');

  // Photos state
  const [photos, setPhotos] = useState<Record<string, { file: File; preview: string } | null>>({});

  // Exhibits state
  const [exhibits, setExhibits] = useState<Record<string, { file: File; name: string } | null>>({});
  const [includeInReport, setIncludeInReport] = useState<Record<string, boolean>>({});

  // Auto-calculate SF from acres
  useEffect(() => {
    if (acres) {
      const sf = parseFloat(acres) * 43560;
      setSquareFeet(sf.toFixed(0));
    }
  }, [acres]);

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
    setPhotos(prev => ({ ...prev, [slotId]: { file, preview } }));
  };

  const removePhoto = (slotId: string) => {
    if (photos[slotId]?.preview) {
      URL.revokeObjectURL(photos[slotId]!.preview);
    }
    setPhotos(prev => ({ ...prev, [slotId]: null }));
  };

  const handleExhibitUpload = (slotId: string, file: File) => {
    setExhibits(prev => ({ ...prev, [slotId]: { file, name: file.name } }));
    setIncludeInReport(prev => ({ ...prev, [slotId]: true }));
  };

  const removeExhibit = (slotId: string) => {
    setExhibits(prev => ({ ...prev, [slotId]: null }));
  };

  const sidebar = (
    <div>
      <h2 className="text-lg font-bold text-gray-900 mb-1">Subject Property</h2>
      <p className="text-sm text-gray-500 mb-6">
        {wizardState.propertyType ? `${wizardState.propertyType} • ${wizardState.propertySubtype || 'General'}` : 'Commercial • Industrial'}
      </p>
      <nav className="space-y-1">
        {tabs.map((tab) => {
          const Icon = tab.Icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm flex items-center gap-3 transition-colors ${
                activeTab === tab.id
                  ? 'bg-[#0da1c7]/10 text-[#0da1c7] font-medium'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-5 h-5" />
              {tab.label}
            </button>
          );
        })}
      </nav>
    </div>
  );

  const helpSidebar = (
    <div>
      <h3 className="text-lg font-bold text-gray-900 mb-3">
        {tabs.find((t) => t.id === activeTab)?.label}
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        {activeTab === 'improvements'
          ? 'Describe all improvements on the property including buildings, structures, and site improvements.'
          : activeTab === 'location'
          ? 'Describe the area, neighborhood, and specific location of the subject property.'
          : activeTab === 'site'
          ? 'Document the site characteristics including size, shape, zoning, topography, and utilities.'
          : activeTab === 'tax'
          ? 'Record tax assessment data, ownership history, and sale information.'
          : activeTab === 'photos'
          ? 'Upload property photographs mapped to specific pages in the final report.'
          : 'Attach supporting documents and exhibits. Toggle which ones appear in the final report.'}
      </p>
      {activeTab === 'location' && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
          <h4 className="font-semibold text-sm text-blue-900 mb-1">Note</h4>
          <p className="text-xs text-blue-800">
            Property address is entered in Setup. Focus here on describing the area and neighborhood context.
          </p>
        </div>
      )}
      {activeTab === 'tax' && (
        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded">
          <h4 className="font-semibold text-sm text-amber-900 mb-1">USPAP Requirement</h4>
          <p className="text-xs text-amber-800">
            Document and analyze any sales within 3 years of the effective date.
          </p>
        </div>
      )}
      {activeTab === 'photos' && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded">
          <h4 className="font-semibold text-sm text-green-900 mb-1">Photo Tips</h4>
          <p className="text-xs text-green-800">
            Each photo slot corresponds to a specific page in the final report. Upload high-quality images.
          </p>
        </div>
      )}
    </div>
  );

  return (
    <WizardLayout
      title="Subject Property Data"
      subtitle="Phase 4 of 6 • Detailed Property Information"
      phase={4}
      sidebar={sidebar}
      helpSidebar={helpSidebar}
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
          />
        ) : activeTab === 'site' ? (
          <SiteContent
            acres={acres}
            setAcres={setAcres}
            squareFeet={squareFeet}
            shape={shape}
            setShape={setShape}
            frontage={frontage}
            setFrontage={setFrontage}
            siteNotes={siteNotes}
            setSiteNotes={setSiteNotes}
            zoningClass={zoningClass}
            setZoningClass={setZoningClass}
            zoningDescription={zoningDescription}
            setZoningDescription={setZoningDescription}
            zoningPermitted={zoningPermitted}
            setZoningPermitted={setZoningPermitted}
            utilitiesStatus={utilitiesStatus}
            setUtilitiesStatus={setUtilitiesStatus}
            topography={topography}
            setTopography={setTopography}
            drainage={drainage}
            setDrainage={setDrainage}
            floodZone={floodZone}
            setFloodZone={setFloodZone}
            environmental={environmental}
            setEnvironmental={setEnvironmental}
            easements={easements}
            setEasements={setEasements}
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
          />
        ) : activeTab === 'photos' ? (
          <PhotosContent
            photos={photos}
            onUpload={handlePhotoUpload}
            onRemove={removePhoto}
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
}

function LocationContent({
  cityCounty, setCityCounty,
  areaDescription, setAreaDescription,
  neighborhoodBoundaries, setNeighborhoodBoundaries,
  neighborhoodCharacteristics, setNeighborhoodCharacteristics,
  specificLocation, setSpecificLocation,
}: LocationProps) {
  return (
    <div className="space-y-6">
      {/* General Area Analysis */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-[#1c3643] border-b-2 border-gray-200 pb-3 mb-4">
          General Area Analysis
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City/County <span className="text-red-500">*</span>
            </label>
            <select
              value={cityCounty}
              onChange={(e) => setCityCounty(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent bg-white"
            >
              <option value="">Select City/County...</option>
              <option value="billings">Billings, Yellowstone County</option>
              <option value="bozeman">Bozeman, Gallatin County</option>
              <option value="missoula">Missoula, Missoula County</option>
              <option value="greatfalls">Great Falls, Cascade County</option>
              <option value="other">Other</option>
            </select>
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
        />
      </div>
    </div>
  );
}

// ==========================================
// SITE CONTENT - Complete with Zoning
// ==========================================
interface SiteProps {
  acres: string;
  setAcres: (v: string) => void;
  squareFeet: string;
  shape: string;
  setShape: (v: string) => void;
  frontage: string;
  setFrontage: (v: string) => void;
  siteNotes: string;
  setSiteNotes: (v: string) => void;
  zoningClass: string;
  setZoningClass: (v: string) => void;
  zoningDescription: string;
  setZoningDescription: (v: string) => void;
  zoningPermitted: boolean;
  setZoningPermitted: (v: boolean) => void;
  utilitiesStatus: string;
  setUtilitiesStatus: (v: string) => void;
  topography: string;
  setTopography: (v: string) => void;
  drainage: string;
  setDrainage: (v: string) => void;
  floodZone: string;
  setFloodZone: (v: string) => void;
  environmental: string;
  setEnvironmental: (v: string) => void;
  easements: string;
  setEasements: (v: string) => void;
}

function SiteContent({
  acres, setAcres, squareFeet,
  shape, setShape,
  frontage, setFrontage,
  siteNotes, setSiteNotes,
  zoningClass, setZoningClass,
  zoningDescription, setZoningDescription,
  zoningPermitted, setZoningPermitted,
  utilitiesStatus, setUtilitiesStatus,
  topography, setTopography,
  drainage, setDrainage,
  floodZone, setFloodZone,
  environmental, setEnvironmental,
  easements, setEasements,
}: SiteProps) {
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
              onChange={(e) => setAcres(e.target.value)}
              step="0.001"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent"
              placeholder="0.000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Total Square Feet <span className="text-gray-400 text-xs">(auto-calculated)</span>
            </label>
            <input
              type="text"
              value={squareFeet ? parseInt(squareFeet).toLocaleString() : ''}
              readOnly
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-600"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Shape</label>
            <select
              value={shape}
              onChange={(e) => setShape(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent bg-white"
            >
              <option value="">Select shape...</option>
              <option value="rectangular">Rectangular</option>
              <option value="approx_rectangular">Approximately Rectangular</option>
              <option value="irregular">Irregular</option>
              <option value="triangular">Triangular</option>
              <option value="square">Square</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Frontage</label>
            <input
              type="text"
              value={frontage}
              onChange={(e) => setFrontage(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent"
              placeholder="e.g., 475' along South 30th Street West"
            />
          </div>
        </div>
        <div className="mt-4">
          <EnhancedTextArea
            id="site_notes"
            label="Note to Reader"
            value={siteNotes}
            onChange={setSiteNotes}
            placeholder="Any special notes about site allocation, phasing, subdivision plans, or unique site attributes that would affect value..."
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
            placeholder="Describe the zoning district, permitted uses by right and conditional, development standards including setbacks, height limits, FAR, lot coverage, parking requirements, and any overlay districts or special regulations..."
            rows={6}
            sectionContext="zoning_description"
            helperText="AI can help draft a comprehensive zoning description based on the classification."
          />
          <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
            <input
              type="checkbox"
              checked={zoningPermitted}
              onChange={(e) => setZoningPermitted(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-[#0da1c7] focus:ring-[#0da1c7]"
            />
            <span className="text-sm text-gray-700">Current use is permitted under zoning</span>
          </label>
        </div>
      </div>

      {/* Utilities & Services */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-[#1c3643] border-b-2 border-gray-200 pb-3 mb-4">
          Utilities & Services
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Utilities Status</label>
            <select
              value={utilitiesStatus}
              onChange={(e) => setUtilitiesStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent bg-white"
            >
              <option value="">Select status...</option>
              <option value="all_city">All city services available</option>
              <option value="to_extend">All city services to be extended</option>
              <option value="partial">Partial utilities</option>
              <option value="well_septic">Well & Septic</option>
            </select>
          </div>
        </div>
      </div>

      {/* Additional Site Characteristics */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-[#1c3643] border-b-2 border-gray-200 pb-3 mb-4">
          Additional Site Characteristics
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Topography</label>
            <select
              value={topography}
              onChange={(e) => setTopography(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent bg-white"
            >
              <option value="">Select...</option>
              <option value="level">Level</option>
              <option value="gently_sloping">Gently Sloping</option>
              <option value="moderately_sloping">Moderately Sloping</option>
              <option value="steep">Steep</option>
              <option value="rolling">Rolling</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Drainage</label>
            <select
              value={drainage}
              onChange={(e) => setDrainage(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent bg-white"
            >
              <option value="">Select...</option>
              <option value="adequate">Adequate</option>
              <option value="good">Good</option>
              <option value="poor">Poor</option>
              <option value="unknown">Unknown</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Flood Zone</label>
            <input
              type="text"
              value={floodZone}
              onChange={(e) => setFloodZone(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent"
              placeholder="e.g., Zone X (Minimal Risk)"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Environmental</label>
            <select
              value={environmental}
              onChange={(e) => setEnvironmental(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent bg-white"
            >
              <option value="">Select...</option>
              <option value="none_known">No Known Issues</option>
              <option value="phase1_clear">Phase 1 ESA - Clear</option>
              <option value="phase2_required">Phase 2 Required</option>
              <option value="contamination">Contamination Present</option>
            </select>
          </div>
        </div>
        <div className="mt-4">
          <EnhancedTextArea
            id="easements"
            label="Easements"
            value={easements}
            onChange={setEasements}
            placeholder="Describe any easements affecting the property: utility easements, access easements, drainage easements, etc..."
            rows={4}
            sectionContext="easements"
            helperText="Document all known easements and their impact on the property."
          />
        </div>
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
}: TaxProps) {
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 11 }, (_, i) => String(currentYear - i));

  return (
    <div className="space-y-6">
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
// PHOTOS CONTENT - Report Page-Mapped Slots
// ==========================================
interface PhotosProps {
  photos: Record<string, { file: File; preview: string } | null>;
  onUpload: (slotId: string, file: File) => void;
  onRemove: (slotId: string) => void;
}

function PhotosContent({ photos, onUpload, onRemove }: PhotosProps) {
  const handleFileChange = (slotId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      onUpload(slotId, e.target.files[0]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Report Primary Photos */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-[#1c3643] border-b-2 border-gray-200 pb-3 mb-4">
          Report Primary Photos
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Each photo slot corresponds to a specific page in the final report. Upload high-quality exterior photos.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {photoSlots.map((slot) => (
            <div key={slot.id} className="border border-gray-200 rounded-xl p-4">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#0da1c7]/10 text-[#1c3643] border border-[#0da1c7]/20 mb-1">
                    Page {slot.page}
                  </span>
                  <p className="text-sm font-medium text-gray-800">{slot.label}</p>
                </div>
              </div>
              
              {photos[slot.id] ? (
                <div className="relative group">
                  <img
                    src={photos[slot.id]!.preview}
                    alt={slot.label}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => onRemove(slot.id)}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="block border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-[#0da1c7] hover:bg-[#0da1c7]/5 transition-all">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileChange(slot.id, e)}
                  />
                  <Image className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-xs text-gray-500">Click to upload</p>
                </label>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Additional Photos */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-[#1c3643] border-b-2 border-gray-200 pb-3 mb-4">
          Additional Property Photos
        </h3>
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">Drag and drop additional photos here, or click to browse</p>
          <button className="px-4 py-2 bg-[#0da1c7] text-white rounded-lg text-sm font-medium hover:bg-[#0b8fb0]">
            Upload Photos
          </button>
        </div>
      </div>

      {/* Auto-Generate Maps */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-[#1c3643] border-b-2 border-gray-200 pb-3 mb-4">
          Maps
        </h3>
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
    </div>
  );
}

// ==========================================
// EXHIBITS CONTENT - With Intake Integration
// ==========================================
interface ExhibitsProps {
  exhibits: Record<string, { file: File; name: string } | null>;
  includeInReport: Record<string, boolean>;
  setIncludeInReport: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  onUpload: (slotId: string, file: File) => void;
  onRemove: (slotId: string) => void;
}

function ExhibitsContent({ exhibits, includeInReport, setIncludeInReport, onUpload, onRemove }: ExhibitsProps) {
  const handleFileChange = (slotId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      onUpload(slotId, e.target.files[0]);
    }
  };

  // Check for documents from intake
  const storedDocs = sessionStorage.getItem('harken_upload_preview');
  const intakeDocs = storedDocs ? JSON.parse(storedDocs) : { cadastral: [], engagement: [] };
  const hasIntakeDocs = intakeDocs.cadastral.length > 0 || intakeDocs.engagement.length > 0;

  return (
    <div className="space-y-6">
      {/* Documents from Intake */}
      {hasIntakeDocs && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-bold text-blue-900 mb-3 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Documents from Intake
          </h3>
          <p className="text-sm text-blue-700 mb-4">
            These documents were uploaded during the document intake phase. Toggle which ones to include in the final report.
          </p>
          <div className="space-y-2">
            {intakeDocs.cadastral.map((doc: any, i: number) => (
              <label key={`cad-${i}`} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-blue-200 cursor-pointer hover:border-blue-400">
                <input
                  type="checkbox"
                  checked={includeInReport[`intake_cadastral_${i}`] ?? true}
                  onChange={(e) => setIncludeInReport(prev => ({ ...prev, [`intake_cadastral_${i}`]: e.target.checked }))}
                  className="w-4 h-4 rounded border-gray-300 text-[#0da1c7] focus:ring-[#0da1c7]"
                />
                <FileText className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-gray-800 flex-1">{doc.name}</span>
                <span className="text-xs text-gray-500">Cadastral</span>
              </label>
            ))}
            {intakeDocs.engagement.map((doc: any, i: number) => (
              <label key={`eng-${i}`} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-blue-200 cursor-pointer hover:border-blue-400">
                <input
                  type="checkbox"
                  checked={includeInReport[`intake_engagement_${i}`] ?? true}
                  onChange={(e) => setIncludeInReport(prev => ({ ...prev, [`intake_engagement_${i}`]: e.target.checked }))}
                  className="w-4 h-4 rounded border-gray-300 text-[#0da1c7] focus:ring-[#0da1c7]"
                />
                <FileText className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-gray-800 flex-1">{doc.name}</span>
                <span className="text-xs text-gray-500">Engagement</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Required Documents */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-[#1c3643] border-b-2 border-gray-200 pb-3 mb-4">
          Required Documents
        </h3>
        <div className="space-y-4">
          {exhibitSlots.map((slot) => (
            <div
              key={slot.id}
              className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-[#0da1c7] transition-all"
            >
              <div className="flex items-center gap-3">
                {exhibits[slot.id] ? (
                  <CheckCircle className="w-8 h-8 text-green-500" />
                ) : (
                  <FileText className="w-8 h-8 text-gray-400" />
                )}
                <div>
                  <div className="font-semibold text-gray-900">{slot.label}</div>
                  <div className="text-xs text-gray-500">{slot.description}</div>
                  {exhibits[slot.id] && (
                    <div className="text-xs text-green-600 mt-1">{exhibits[slot.id]!.name}</div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {exhibits[slot.id] && (
                  <button
                    onClick={() => onRemove(slot.id)}
                    className="p-1 text-gray-400 hover:text-red-500"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
                <label className="px-4 py-2 bg-[#0da1c7] text-white rounded-lg text-sm font-medium hover:bg-[#0b8fb0] cursor-pointer">
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => handleFileChange(slot.id, e)}
                  />
                  {exhibits[slot.id] ? 'Replace' : 'Upload'}
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Exhibits */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-[#1c3643] border-b-2 border-gray-200 pb-3 mb-4">
          Additional Exhibits
        </h3>
        <button className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-[#0da1c7] hover:text-[#0da1c7] transition-all flex items-center justify-center gap-2">
          <Upload className="w-5 h-5" />
          Add Custom Exhibit
        </button>
      </div>
    </div>
  );
}
