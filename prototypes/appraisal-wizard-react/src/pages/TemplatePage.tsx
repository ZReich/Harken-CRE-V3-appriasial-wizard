import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWizard } from '../context/WizardContext';
import { CommercialIcon, ResidentialIcon, LandIcon } from '../components/icons';

const templates = [
  {
    id: 'commercial',
    name: 'Commercial',
    Icon: CommercialIcon,
    color: 'text-[#0da1c7]',
    description: 'For income-producing properties: office, retail, industrial, multi-family',
    features: [
      'Income Approach (DCF, Direct Cap)',
      'Sales Comparison Approach',
      'Cost Approach',
      'Rent Roll & Expense Analysis',
    ],
  },
  {
    id: 'residential',
    name: 'Residential',
    Icon: ResidentialIcon,
    color: 'text-green-600',
    description: 'For 1-4 family residential properties, condos, and townhomes',
    features: [
      'Sales Comparison Approach',
      'Cost Approach',
      'Income Approach (if applicable)',
      'USPAP Compliant',
    ],
  },
  {
    id: 'land',
    name: 'Land / Vacant',
    Icon: LandIcon,
    color: 'text-yellow-600',
    description: 'For vacant land, lots, and development sites',
    features: [
      'Sales Comparison Approach',
      'Allocation / Extraction Method',
      'Highest & Best Use Analysis',
      'Development Feasibility',
    ],
  },
];

export default function TemplatePage() {
  const navigate = useNavigate();
  const { setTemplate } = useWizard();
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (templateId: string) => {
    setSelected(templateId);
    setTemplate(templateId);
  };

  const handleContinue = () => {
    if (selected) {
      navigate('/setup');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Nav Bar */}
      <nav className="bg-[#1c3643] text-white h-20 flex items-center justify-between px-8">
        <img
          src="https://app.harkenbov.com/assets/img/harken-logo-white.png"
          alt="Harken"
          className="h-10"
        />
        <span className="font-semibold text-lg">Appraisal Wizard</span>
        <div className="flex items-center gap-3">
          <span className="text-sm">Harken Admin</span>
          <div className="w-9 h-9 rounded-full bg-[#0da1c7] flex items-center justify-center font-bold">
            HA
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto py-12 px-6">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl font-bold text-[#1c3643] mb-3">Create New Appraisal</h1>
          <p className="text-lg text-gray-600">Select a template to begin your appraisal report</p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            {['Template', 'Setup', 'Subject Data', 'Analysis', 'Review'].map((step, idx) => (
              <div key={step} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    idx === 0
                      ? 'bg-[#0da1c7] text-white'
                      : 'bg-gray-300 text-gray-500'
                  }`}
                >
                  {idx + 1}
                </div>
                <span
                  className={`text-sm ${
                    idx === 0 ? 'font-semibold text-[#1c3643]' : 'text-gray-500'
                  }`}
                >
                  {step}
                </span>
                {idx < 4 && <div className="w-16 h-1 bg-gray-300 rounded" />}
              </div>
            ))}
          </div>
          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-[#0da1c7] rounded-full" style={{ width: '20%' }} />
          </div>
        </div>

        {/* Template Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {templates.map((template) => {
            const Icon = template.Icon;
            return (
              <div
                key={template.id}
                onClick={() => handleSelect(template.id)}
                className={`bg-white rounded-xl p-6 cursor-pointer transition-all duration-200 border-2 ${
                  selected === template.id
                    ? 'border-[#0da1c7] shadow-lg shadow-[#0da1c7]/20'
                    : 'border-gray-200 hover:border-[#0da1c7] hover:-translate-y-1 hover:shadow-md'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-[#1c3643]">{template.name}</h3>
                  <Icon className={`w-10 h-10 ${template.color}`} />
                </div>
                <p className="text-sm text-gray-600 mb-4">{template.description}</p>
                <ul className="text-xs text-gray-500 space-y-1">
                  {template.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <svg className="w-3 h-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Continue Button */}
        <div className="text-center">
          <button
            onClick={handleContinue}
            disabled={!selected}
            className={`px-8 py-3 rounded-lg font-semibold flex items-center gap-2 mx-auto transition-all ${
              selected
                ? 'bg-[#0da1c7] text-white hover:bg-[#0b8fb0]'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Continue to Setup
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
