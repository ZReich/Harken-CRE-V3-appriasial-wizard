import { useState } from 'react';
import WizardLayout from '../components/WizardLayout';
import ImprovementsInventory from '../components/ImprovementsInventory';
import {
  LocationIcon,
  SiteIcon,
  BuildingIcon,
  TaxIcon,
  PhotoIcon,
  DocumentIcon,
} from '../components/icons';

const tabs = [
  { id: 'location', label: 'Location & Area', Icon: LocationIcon },
  { id: 'site', label: 'Site Details', Icon: SiteIcon },
  { id: 'improvements', label: 'Improvements', Icon: BuildingIcon },
  { id: 'tax', label: 'Tax & Ownership', Icon: TaxIcon },
  { id: 'photos', label: 'Photos & Maps', Icon: PhotoIcon },
  { id: 'exhibits', label: 'Exhibits & Docs', Icon: DocumentIcon },
];

export default function SubjectDataPage() {
  const [activeTab, setActiveTab] = useState('improvements');

  const sidebar = (
    <div>
      <h2 className="text-lg font-bold text-gray-900 mb-1">Subject Property</h2>
      <p className="text-sm text-gray-500 mb-6">Commercial • Industrial</p>
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
          ? 'Enter the property address, legal description, and geographic identifiers.'
          : activeTab === 'site'
          ? 'Document the site characteristics including size, shape, topography, and utilities.'
          : activeTab === 'tax'
          ? 'Record tax assessment data, ownership history, and sale information.'
          : activeTab === 'photos'
          ? 'Upload property photographs, aerial imagery, and location maps.'
          : 'Attach supporting documents, exhibits, and supplemental materials.'}
      </p>
      {activeTab === 'improvements' && (
        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded">
          <h4 className="font-semibold text-sm text-amber-900 mb-1">USPAP Guidance</h4>
          <p className="text-xs text-amber-800">
            Standards Rule 1-4(b) requires analysis of improvements including their condition
            and functional utility.
          </p>
        </div>
      )}
    </div>
  );

  return (
    <WizardLayout
      title="Subject Property Data"
      subtitle="Phase 3 of 5 • Detailed Property Information"
      phase={3}
      sidebar={sidebar}
      helpSidebar={helpSidebar}
    >
      <div className="animate-fade-in">
        {activeTab === 'improvements' ? (
          <ImprovementsInventory />
        ) : activeTab === 'location' ? (
          <LocationContent />
        ) : activeTab === 'site' ? (
          <SiteContent />
        ) : activeTab === 'tax' ? (
          <TaxContent />
        ) : activeTab === 'photos' ? (
          <PhotosContent />
        ) : (
          <ExhibitsContent />
        )}
      </div>
    </WizardLayout>
  );
}

// Placeholder content components
function LocationContent() {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-[#1c3643] border-b-2 border-gray-200 pb-3 mb-4">
          Property Address
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent"
              placeholder="123 Main Street"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent"
              placeholder="City name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent"
              placeholder="State"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent"
              placeholder="12345"
            />
          </div>
        </div>
      </div>
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-[#1c3643] border-b-2 border-gray-200 pb-3 mb-4">
          Geographic Identifiers
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">County</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent"
              placeholder="County name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Census Tract</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent"
              placeholder="Census tract ID"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function SiteContent() {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-[#1c3643] border-b-2 border-gray-200 pb-3 mb-4">
          Site Dimensions
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Land Area (Acres)</label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Land Area (SF)</label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent"
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Shape</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent">
              <option>Regular</option>
              <option>Irregular</option>
              <option>Rectangular</option>
              <option>Square</option>
            </select>
          </div>
        </div>
      </div>
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-[#1c3643] border-b-2 border-gray-200 pb-3 mb-4">
          Utilities & Access
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Water</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent">
              <option>Public</option>
              <option>Well</option>
              <option>None</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sewer</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent">
              <option>Public</option>
              <option>Septic</option>
              <option>None</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

function TaxContent() {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-[#1c3643] border-b-2 border-gray-200 pb-3 mb-4">
          Tax Assessment
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assessed Value - Land</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent"
              placeholder="$0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assessed Value - Improvements</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent"
              placeholder="$0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tax Year</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent"
              placeholder="2024"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Annual Tax Amount</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent"
              placeholder="$0"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function PhotosContent() {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-[#1c3643] border-b-2 border-gray-200 pb-3 mb-4">
          Property Photos
        </h3>
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
          <PhotoIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">Drag and drop photos here, or click to browse</p>
          <button className="px-4 py-2 bg-[#0da1c7] text-white rounded-lg text-sm font-medium hover:bg-[#0b8fb0]">
            Upload Photos
          </button>
        </div>
      </div>
    </div>
  );
}

function ExhibitsContent() {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-[#1c3643] border-b-2 border-gray-200 pb-3 mb-4">
          Supporting Documents
        </h3>
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
          <DocumentIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">Drag and drop documents here, or click to browse</p>
          <button className="px-4 py-2 bg-[#0da1c7] text-white rounded-lg text-sm font-medium hover:bg-[#0b8fb0]">
            Upload Documents
          </button>
        </div>
      </div>
    </div>
  );
}
