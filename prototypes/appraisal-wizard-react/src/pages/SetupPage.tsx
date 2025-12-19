import { useState } from 'react';
import WizardLayout from '../components/WizardLayout';
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

const setupTabs = [
  { id: 'basics', label: 'Assignment Basics', Icon: ClipboardCheckIcon },
  { id: 'purpose', label: 'Purpose & Scope', Icon: ScaleIcon },
  { id: 'property', label: 'Property ID', Icon: IdentificationIcon },
  { id: 'inspection', label: 'Inspection', Icon: EyeIcon },
  { id: 'certifications', label: 'Certifications', Icon: BadgeCheckIcon },
];

const propertyTypes = [
  { id: 'commercial', label: 'Commercial', Icon: CommercialIcon },
  { id: 'residential', label: 'Residential', Icon: ResidentialIcon },
  { id: 'industrial', label: 'Industrial', Icon: CommercialIcon },
  { id: 'land', label: 'Land', Icon: LandIcon },
];

const approaches = [
  { id: 'sales', label: 'Sales Comparison', Icon: ChartIcon, selected: true },
  { id: 'income', label: 'Income Approach', Icon: CurrencyIcon, selected: true },
  { id: 'cost', label: 'Cost Approach', Icon: ConstructionIcon, selected: false },
];

export default function SetupPage() {
  const [activeTab, setActiveTab] = useState('basics');
  const [selectedType, setSelectedType] = useState('commercial');

  const sidebar = (
    <div>
      <h2 className="text-lg font-bold text-gray-900 mb-1">Appraisal Setup</h2>
      <p className="text-sm text-gray-500 mb-6">Configure Assignment</p>
      <nav className="space-y-1">
        {setupTabs.map((tab) => {
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
      <h3 className="text-lg font-bold text-gray-900 mb-3">Setup Guidance</h3>
      <p className="text-sm text-gray-600 mb-4">
        {activeTab === 'basics'
          ? 'Define the fundamental parameters of your appraisal assignment including client, intended use, and effective dates.'
          : activeTab === 'purpose'
          ? 'Specify the purpose and intended use of the appraisal, as well as the scope of work.'
          : activeTab === 'property'
          ? 'Identify the property being appraised with sufficient detail for unambiguous identification.'
          : activeTab === 'inspection'
          ? 'Document the type and extent of property inspection performed.'
          : 'Complete required certifications and limiting conditions.'}
      </p>
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
        <h4 className="font-semibold text-sm text-blue-900 mb-1">USPAP Requirement</h4>
        <p className="text-xs text-blue-800">
          Standards Rule 2-2(a) requires clear identification of the client, intended use, and
          intended users of the appraisal.
        </p>
      </div>
    </div>
  );

  return (
    <WizardLayout
      title="Appraisal Setup"
      subtitle="Phase 2 of 5 • Assignment Details"
      phase={2}
      sidebar={sidebar}
      helpSidebar={helpSidebar}
    >
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        {/* Property Type */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-[#1c3643] border-b-2 border-gray-200 pb-3 mb-4">
            Property Type
          </h3>
          <div className="grid grid-cols-4 gap-4">
            {propertyTypes.map((type) => {
              const Icon = type.Icon;
              return (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={`p-4 border-2 rounded-lg text-center transition-all ${
                    selectedType === type.id
                      ? 'border-[#0da1c7] bg-[#0da1c7]/5'
                      : 'border-gray-200 hover:border-[#0da1c7]'
                  }`}
                >
                  <Icon className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">{type.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Valuation Scenarios */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-[#1c3643] border-b-2 border-gray-200 pb-3 mb-4">
            Valuation Scenarios
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Select the scenarios required for this appraisal. Each scenario can have different
            effective dates and approaches.
          </p>
          <div className="flex flex-wrap gap-3">
            {['As Is', 'As Completed', 'As Stabilized', 'As Proposed'].map((scenario, idx) => (
              <button
                key={scenario}
                className={`px-4 py-2 rounded-full border-2 text-sm font-medium transition-all ${
                  idx === 0
                    ? 'bg-[#0da1c7] border-[#0da1c7] text-white'
                    : 'border-gray-200 text-gray-600 hover:border-[#0da1c7]'
                }`}
              >
                {scenario}
              </button>
            ))}
          </div>
        </div>

        {/* Approaches */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-[#1c3643] border-b-2 border-gray-200 pb-3 mb-4">
            Valuation Approaches
          </h3>
          <div className="grid grid-cols-3 gap-4">
            {approaches.map((approach) => {
              const Icon = approach.Icon;
              return (
                <button
                  key={approach.id}
                  className={`p-4 border-2 rounded-lg text-center transition-all ${
                    approach.selected
                      ? 'border-[#0da1c7] bg-[#0da1c7]/5'
                      : 'border-gray-200 hover:border-[#0da1c7]'
                  }`}
                >
                  <Icon className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">{approach.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Client Information */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-[#1c3643] border-b-2 border-gray-200 pb-3 mb-4">
            Client Information
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent"
                placeholder="Enter client name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Intended User(s)</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent"
                placeholder="e.g., Client, Lender"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Intended Use</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent">
                <option>Mortgage Financing</option>
                <option>Internal Decision Making</option>
                <option>Estate Planning</option>
                <option>Tax Appeal</option>
                <option>Litigation Support</option>
                <option>Other</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </WizardLayout>
  );
}
