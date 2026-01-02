import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWizard } from '../context/WizardContext';
import { FileText, Info, CheckCircle, Star, Edit2, Copy, Trash2, MoreVertical, User, Clock } from 'lucide-react';

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
// CUSTOM TEMPLATES (User-created)
// ==========================================
interface CustomTemplate {
  id: string;
  name: string;
  description: string;
  useCase: string;
  propertyTypes: string[];
  tags: string[];
  createdBy: string;
  createdAt: string;
  lastUsed: string | null;
  timesUsed: number;
  isPublic: boolean;
}

// Mock data for custom templates - in production, this would come from an API
const customTemplates: CustomTemplate[] = [
  {
    id: 'custom-industrial-shop',
    name: 'Industrial Shop/Office Combo',
    description: 'Template for light industrial properties with integrated shop and office components. Configured for bank loan submissions.',
    useCase: 'Standard bank loan appraisal',
    propertyTypes: ['Industrial'],
    tags: ['industrial', 'shop', 'bank loan'],
    createdBy: 'John Appraiser',
    createdAt: '2024-11-15T10:30:00Z',
    lastUsed: '2024-12-18T14:22:00Z',
    timesUsed: 12,
    isPublic: true,
  },
  {
    id: 'custom-retail-strip',
    name: 'Retail Strip Center',
    description: 'Optimized for small retail strip centers with multiple tenants. Includes detailed rent roll analysis.',
    useCase: 'Internal valuation',
    propertyTypes: ['Retail'],
    tags: ['retail', 'multi-tenant', 'rent roll'],
    createdBy: 'Jane Smith',
    createdAt: '2024-10-22T08:15:00Z',
    lastUsed: '2024-12-10T09:45:00Z',
    timesUsed: 8,
    isPublic: false,
  },
];

// ==========================================
// MAIN COMPONENT
// ==========================================
export default function TemplatePage() {
  const navigate = useNavigate();
  const { setTemplate } = useWizard();
  const [selected, setSelected] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'system' | 'custom'>('system');
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const handleSelect = (templateId: string) => {
    setSelected(templateId);
    setTemplate(templateId);
  };

  const handleContinue = () => {
    if (selected) {
      navigate('/document-intake');
    }
  };

  const handleEditTemplate = (templateId: string) => {
    console.log('Edit template:', templateId);
    setMenuOpen(null);
    // Would open a template editor modal
  };

  const handleDuplicateTemplate = (templateId: string) => {
    console.log('Duplicate template:', templateId);
    setMenuOpen(null);
    // Would create a copy of the template
  };

  const handleDeleteTemplate = (templateId: string) => {
    console.log('Delete template:', templateId);
    setMenuOpen(null);
    // Would show a confirmation dialog
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
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
          <p className="text-gray-600 dark:text-slate-400">
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

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 mb-6 bg-gray-200 rounded-lg p-1 w-fit">
          <button
            onClick={() => setActiveTab('system')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'system'
                ? 'bg-white text-[#1c3643] shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            System Templates
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'custom'
                ? 'bg-white text-[#1c3643] shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Star className="w-4 h-4" />
            My Templates
            {customTemplates.length > 0 && (
              <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full">
                {customTemplates.length}
              </span>
            )}
          </button>
        </div>

        {/* System Template Cards */}
        {activeTab === 'system' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
            {savedTemplates.map((template) => (
              <div
                key={template.id}
                onClick={() => handleSelect(template.id)}
                className={`bg-white dark:bg-slate-800 rounded-xl p-5 cursor-pointer transition-all duration-200 border-2 ${
                  selected === template.id
                    ? 'border-[#0da1c7] shadow-lg shadow-[#0da1c7]/20'
                    : 'border-gray-200 dark:border-slate-700 hover:border-[#0da1c7]/50 hover:shadow-md'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-bold text-[#1c3643] dark:text-white">{template.name}</h3>
                  {template.isSystem && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400 rounded border border-gray-200 dark:border-slate-600">
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

                <p className="text-sm text-gray-600 dark:text-slate-400 mb-4">{template.description}</p>

                {/* Metadata */}
                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-slate-400">
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
        )}

        {/* Custom Template Cards */}
        {activeTab === 'custom' && (
          <div className="mb-10">
            {customTemplates.length === 0 ? (
              <div className="bg-white dark:bg-slate-800 rounded-xl p-12 text-center border-2 border-dashed border-gray-300 dark:border-slate-600">
                <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No Custom Templates Yet</h3>
                <p className="text-gray-500 mb-4">
                  When you save a report as a template, it will appear here for future use.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {customTemplates.map((template) => (
                  <div
                    key={template.id}
                    onClick={() => handleSelect(template.id)}
                    className={`bg-white rounded-xl p-5 cursor-pointer transition-all duration-200 border-2 relative ${
                      selected === template.id
                        ? 'border-[#0da1c7] shadow-lg shadow-[#0da1c7]/20'
                        : 'border-gray-200 hover:border-[#0da1c7]/50 hover:shadow-md'
                    }`}
                  >
                    {/* Action Menu Button */}
                    <div className="absolute top-4 right-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpen(menuOpen === template.id ? null : template.id);
                        }}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <MoreVertical className="w-4 h-4 text-gray-400" />
                      </button>
                      
                      {/* Dropdown Menu */}
                      {menuOpen === template.id && (
                        <div className="absolute right-0 top-8 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg py-1 z-10 min-w-[140px]">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditTemplate(template.id);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            Edit
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDuplicateTemplate(template.id);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            Duplicate
                          </button>
                          <hr className="my-1 border-gray-100" />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTemplate(template.id);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Star className="w-5 h-5 text-amber-600" />
                      </div>
                      <div className="flex-1 pr-8">
                        <h3 className="text-lg font-bold text-[#1c3643] dark:text-white">{template.name}</h3>
                        <p className="text-xs text-gray-500">{template.useCase}</p>
                      </div>
                    </div>
                    
                    {/* Property Type Tags */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {template.propertyTypes.map((type, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-semibold px-2 py-0.5 rounded border bg-amber-50 text-amber-700 border-amber-200"
                        >
                          {type.toUpperCase()}
                        </span>
                      ))}
                      {template.isPublic ? (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded border bg-green-50 text-green-700 border-green-200">
                          TEAM
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded border bg-gray-50 text-gray-500 border-gray-200">
                          PRIVATE
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-gray-600 mb-4">{template.description}</p>

                    {/* User tags */}
                    {template.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {template.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] px-2 py-0.5 rounded bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Metadata */}
                    <div className="flex items-center gap-4 text-xs text-gray-500 border-t border-gray-100 pt-3">
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5" />
                        {template.createdBy}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {template.lastUsed ? `Used ${formatDate(template.lastUsed)}` : 'Never used'}
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5" />
                        Used {template.timesUsed}x
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
            )}
          </div>
        )}

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
