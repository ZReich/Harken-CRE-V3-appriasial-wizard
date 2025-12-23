import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWizard } from '../context/WizardContext';
import { FileText, Info, CheckCircle } from 'lucide-react';

// ==========================================
// SAVED REPORT TEMPLATES (Admin-created)
// ==========================================
interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  tags: { label: string; color: string }[];
  sections: number;
  approaches: string[];
  accounts: number;
  isSystem: boolean;
}

const savedTemplates: ReportTemplate[] = [
  {
    id: 'commercial-standard',
    name: 'Commercial Evaluation - Standard',
    description: 'Standard commercial property evaluation with income, sales, and cap rate approaches',
    tags: [
      { label: 'COMMERCIAL', color: 'bg-blue-100 text-blue-700 border-blue-200' },
      { label: 'EVALUATION', color: 'bg-green-100 text-green-700 border-green-200' },
    ],
    sections: 18,
    approaches: ['Income', 'Sales', 'Cap'],
    accounts: 73,
    isSystem: true,
  },
  {
    id: 'commercial-as-is-completed',
    name: 'Commercial As-Is/As-Completed',
    description: 'Development project evaluation with as-is current condition and as-completed post-construction scenarios',
    tags: [
      { label: 'COMMERCIAL', color: 'bg-blue-100 text-blue-700 border-blue-200' },
      { label: 'EVALUATION', color: 'bg-green-100 text-green-700 border-green-200' },
      { label: 'DUAL SCENARIO', color: 'bg-orange-100 text-orange-700 border-orange-200' },
    ],
    sections: 20,
    approaches: ['Income', 'Sales', 'Cost', 'Cap'],
    accounts: 89,
    isSystem: true,
  },
  {
    id: 'multi-family',
    name: 'Multi-Family Evaluation',
    description: 'Specialized for multi-family properties with unit-level rent roll and income analysis',
    tags: [
      { label: 'COMMERCIAL', color: 'bg-blue-100 text-blue-700 border-blue-200' },
      { label: 'EVALUATION', color: 'bg-green-100 text-green-700 border-green-200' },
    ],
    sections: 22,
    approaches: ['Income', 'Multi-Family', 'Rent Roll'],
    accounts: 54,
    isSystem: true,
  },
  {
    id: 'development-lifecycle',
    name: 'Development Lifecycle Analysis',
    description: 'Complete development analysis with as-is, as-stabilized, and as-completed scenarios for major projects',
    tags: [
      { label: 'COMMERCIAL', color: 'bg-blue-100 text-blue-700 border-blue-200' },
      { label: 'EVALUATION', color: 'bg-green-100 text-green-700 border-green-200' },
      { label: 'MULTI-SCENARIO', color: 'bg-purple-100 text-purple-700 border-purple-200' },
    ],
    sections: 24,
    approaches: ['Income', 'Sales', 'Cost', 'Cap'],
    accounts: 31,
    isSystem: true,
  },
];

// ==========================================
// MAIN COMPONENT
// ==========================================
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
      navigate('/document-intake');
    }
  };

  const progressSteps = ['Template', 'Documents', 'Setup', 'Subject Data', 'Analysis', 'Review'];

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
      <div className="max-w-7xl mx-auto py-10 px-6">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-[#1c3643] mb-2">Select Report Template</h1>
          <p className="text-gray-600">
            Choose a template that determines which sections and fields will appear in your final report.{' '}
            <button className="text-[#0da1c7] underline hover:text-[#0b8fb0]">
              You can customize this later if needed.
            </button>
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            {progressSteps.map((step, idx) => (
              <div key={step} className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                    idx === 0
                      ? 'bg-[#0da1c7] text-white'
                      : 'bg-gray-300 text-gray-500'
                  }`}
                >
                  {idx + 1}
                </div>
                <span
                  className={`text-xs ${
                    idx === 0 ? 'font-semibold text-[#1c3643]' : 'text-gray-500'
                  }`}
                >
                  {step}
                </span>
                {idx < progressSteps.length - 1 && <div className="w-10 h-0.5 bg-gray-300 rounded" />}
              </div>
            ))}
          </div>
          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-[#0da1c7] rounded-full transition-all" style={{ width: `${100 / progressSteps.length}%` }} />
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8 flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-900 text-sm">What are report templates?</h4>
            <p className="text-blue-800 text-sm">
              Report templates allow you to control what appears in your final PDF. Your administrator has created 
              pre-configured templates for different scenarios (bank submissions, quick valuations, etc.). 
              Select the one that best fits your needs.
            </p>
          </div>
        </div>

        {/* Template Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
          {savedTemplates.map((template) => (
            <div
              key={template.id}
              onClick={() => handleSelect(template.id)}
              className={`bg-white rounded-xl p-5 cursor-pointer transition-all duration-200 border-2 ${
                selected === template.id
                  ? 'border-[#0da1c7] shadow-lg shadow-[#0da1c7]/20'
                  : 'border-gray-200 hover:border-[#0da1c7]/50 hover:shadow-md'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-bold text-[#1c3643]">{template.name}</h3>
                {template.isSystem && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 bg-gray-100 text-gray-500 rounded border border-gray-200">
                    SYSTEM
                  </span>
                )}
              </div>
              
              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-3">
                {template.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${tag.color}`}
                  >
                    {tag.label}
                  </span>
                ))}
              </div>

              <p className="text-sm text-gray-600 mb-4">{template.description}</p>

              {/* Metadata */}
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5" />
                  {template.sections} sections
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  {template.approaches.join(', ')}
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  {template.accounts} accounts
                </span>
              </div>

              {/* Selection indicator */}
              {selected === template.id && (
                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-2 text-[#0da1c7]">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Selected</span>
                </div>
              )}
            </div>
          ))}
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
            Continue to Document Intake
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          {!selected && (
            <p className="text-sm text-gray-500 mt-2">Please select a template to continue</p>
          )}
        </div>
      </div>
    </div>
  );
}
