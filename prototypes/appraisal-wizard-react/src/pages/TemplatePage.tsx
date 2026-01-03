import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWizard } from '../context/WizardContext';
import WizardLayout from '../components/WizardLayout';
import { FileText, Info, CheckCircle, Star, Edit2, Copy, Trash2, MoreVertical, User, Clock, ScaleIcon, ClipboardCheckIcon } from 'lucide-react';

// ==========================================
// REPORT TYPES & TEMPLATES
// ==========================================
type ReportType = 'appraisal' | 'evaluation';

interface ReportTemplate {
  id: string;
  name: string;
  type: ReportType;
  description: string;
  tags: { label: string; color: string }[];
  sections: number;
  approaches: string[];
  accounts: number;
  isSystem: boolean;
}

const savedTemplates: ReportTemplate[] = [
  // ------------------------------------------------------------------
  // APPRAISAL TEMPLATES
  // ------------------------------------------------------------------
  {
    id: 'standard-appraisal',
    name: 'Standard Appraisal',
    type: 'appraisal',
    description: 'Full USPAP-compliant appraisal report suitable for most commercial lending purposes.',
    tags: [
      { label: 'STANDARD', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
      { label: 'USPAP', color: 'bg-blue-100 text-blue-700 border-blue-200' },
    ],
    sections: 25,
    approaches: ['Income', 'Sales', 'Cost'],
    accounts: 45,
    isSystem: true,
  },
  {
    id: 'commercial-standard',
    name: 'Commercial Evaluation - Detailed',
    type: 'appraisal', // Kept as appraisal based on complexity context
    description: 'Comprehensive commercial property evaluation with deep income, sales, and cap rate analysis.',
    tags: [
      { label: 'COMMERCIAL', color: 'bg-blue-100 text-blue-700 border-blue-200' },
      { label: 'DETAILED', color: 'bg-green-100 text-green-700 border-green-200' },
    ],
    sections: 18,
    approaches: ['Income', 'Sales', 'Cap'],
    accounts: 73,
    isSystem: true,
  },
  {
    id: 'commercial-limit-scope',
    name: 'Restricted Appraisal Report',
    type: 'appraisal',
    description: 'Restricted use appraisal report for internal decision making or monitoring.',
    tags: [
      { label: 'RESTRICTED', color: 'bg-orange-100 text-orange-700 border-orange-200' },
      { label: 'internal', color: 'bg-gray-100 text-gray-700 border-gray-200' },
    ],
    sections: 12,
    approaches: ['Sales', 'Income'],
    accounts: 20,
    isSystem: true,
  },
  {
    id: 'development-lifecycle',
    name: 'Development Lifecycle Analysis',
    type: 'appraisal',
    description: 'Complete development analysis with as-is, as-stabilized, and as-completed scenarios.',
    tags: [
      { label: 'DEVELOPMENT', color: 'bg-purple-100 text-purple-700 border-purple-200' },
      { label: 'MULTI-SCENARIO', color: 'bg-pink-100 text-pink-700 border-pink-200' },
    ],
    sections: 24,
    approaches: ['Income', 'Sales', 'Cost', 'Cap'],
    accounts: 31,
    isSystem: true,
  },

  // ------------------------------------------------------------------
  // EVALUATION TEMPLATES
  // ------------------------------------------------------------------
  {
    id: 'standard-evaluation',
    name: 'Standard Evaluation',
    type: 'evaluation',
    description: 'Streamlined evaluation report focusing on market value without full USPAP requirements.',
    tags: [
      { label: 'STANDARD', color: 'bg-teal-100 text-teal-700 border-teal-200' },
      { label: 'EVALUATION', color: 'bg-green-100 text-green-700 border-green-200' },
    ],
    sections: 8,
    approaches: ['Sales', 'Income'],
    accounts: 15,
    isSystem: true,
  },
  {
    id: 'desk-review',
    name: 'Desktop Evaluation',
    type: 'evaluation',
    description: 'Remote valuation based on tax records, market data, and provided photos.',
    tags: [
      { label: 'DESKTOP', color: 'bg-cyan-100 text-cyan-700 border-cyan-200' },
      { label: 'FAST', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
    ],
    sections: 5,
    approaches: ['Sales'],
    accounts: 8,
    isSystem: true,
  },
];

// ==========================================
// CUSTOM TEMPLATES (User-created)
// ==========================================
interface CustomTemplate {
  id: string;
  name: string;
  type: ReportType; // Added type
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

const customTemplates: CustomTemplate[] = [
  {
    id: 'custom-industrial-shop',
    name: 'Industrial Shop/Office Combo',
    type: 'appraisal',
    description: 'Template for light industrial properties with integrated shop and office components.',
    useCase: 'Bank loan appraisal',
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
    type: 'appraisal',
    description: 'Optimized for small retail strip centers with multiple tenants.',
    useCase: 'Internal valuation',
    propertyTypes: ['Retail'],
    tags: ['retail', 'multi-tenant'],
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

  // State
  const [reportType, setReportType] = useState<ReportType | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'system' | 'custom'>('system');
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  // Handle Report Type Selection
  const handleReportTypeSelect = (type: ReportType) => {
    setReportType(type);
    setSelected(null); // Reset selected template when type changes
    // Optionally auto-select the standard template for that type
    // setSelected(`standard-${type}`);
    // setTemplate(`standard-${type}`);
  };

  const handleSelect = (templateId: string) => {
    setSelected(templateId);
    setTemplate(templateId);
  };

  const handleContinue = () => {
    if (selected) {
      navigate('/document-intake');
    }
  };

  // Filter templates based on selected type
  const filteredSystemTemplates = savedTemplates.filter(t => t.type === reportType);
  const filteredCustomTemplates = customTemplates.filter(t => t.type === reportType);

  // Mock handlers
  const handleEditTemplate = (id: string) => { console.log('Edit', id); setMenuOpen(null); };
  const handleDuplicateTemplate = (id: string) => { console.log('Duplicate', id); setMenuOpen(null); };
  const handleDeleteTemplate = (id: string) => { console.log('Delete', id); setMenuOpen(null); };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <WizardLayout
      title="Select Report Template"
      subtitle="Choose the type of report and a template to get started."
      phase={1}
      onContinue={handleContinue}
    >
      <div className="max-w-7xl mx-auto space-y-8">

        {/* REPORT TYPE SELECTION */}
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-[#1c3643] dark:text-white border-b-2 border-gray-200 dark:border-slate-600 pb-3 mb-4">
            What are we creating today?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Appraisal Option */}
            <button
              onClick={() => handleReportTypeSelect('appraisal')}
              className={`relative p-5 border-2 rounded-xl text-left transition-all hover:border-[#0da1c7]/50 dark:hover:border-cyan-400/50 flex items-start gap-4 ${reportType === 'appraisal'
                ? 'border-[#0da1c7] bg-[#0da1c7]/5 dark:bg-cyan-500/10'
                : 'border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700/50'
                }`}
            >
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${reportType === 'appraisal' ? 'bg-[#0da1c7] text-white' : 'bg-gray-200 dark:bg-slate-600 text-gray-500 dark:text-slate-400'
                }`}>
                <ScaleIcon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-1">Appraisal</h4>
                <p className="text-sm text-gray-600 dark:text-slate-400">
                  Full USPAP-compliant opinion of value. Includes extensive data analysis, highest and best use, and all applicable approaches to value.
                </p>
              </div>
              {reportType === 'appraisal' && (
                <div className="absolute top-4 right-4 text-[#0da1c7]">
                  <CheckCircle className="w-6 h-6" />
                </div>
              )}
            </button>

            {/* Evaluation Option */}
            <button
              onClick={() => handleReportTypeSelect('evaluation')}
              className={`relative p-5 border-2 rounded-xl text-left transition-all hover:border-[#0da1c7]/50 dark:hover:border-cyan-400/50 flex items-start gap-4 ${reportType === 'evaluation'
                ? 'border-[#0da1c7] bg-[#0da1c7]/5 dark:bg-cyan-500/10'
                : 'border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700/50'
                }`}
            >
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${reportType === 'evaluation' ? 'bg-[#0da1c7] text-white' : 'bg-gray-200 dark:bg-slate-600 text-gray-500 dark:text-slate-400'
                }`}>
                <ClipboardCheckIcon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-1">Evaluation</h4>
                <p className="text-sm text-gray-600 dark:text-slate-400">
                  Restricted scope valuation for lower-risk transactions. Focuses on market value with streamlined analysis and reporting.
                </p>
              </div>
              {reportType === 'evaluation' && (
                <div className="absolute top-4 right-4 text-[#0da1c7]">
                  <CheckCircle className="w-6 h-6" />
                </div>
              )}
            </button>
          </div>
        </div>

        {/* TEMPLATE SELECTION (Only shown if report type is selected) */}
        {reportType && (
          <div className="animate-fade-in space-y-6">

            {/* Template Selection Header & Tabs */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-[#1c3643] dark:text-white">
                  Select {reportType === 'appraisal' ? 'Appraisal' : 'Evaluation'} Template
                </h3>
                <p className="text-sm text-gray-500 dark:text-slate-400">
                  Choose a template to pre-configure your report structure.
                </p>
              </div>

              <div className="flex items-center gap-1 bg-gray-200 dark:bg-slate-700 rounded-lg p-1 self-start">
                <button
                  onClick={() => setActiveTab('system')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'system'
                    ? 'bg-white dark:bg-slate-600 text-[#1c3643] dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200'
                    }`}
                >
                  System Templates
                </button>
                <button
                  onClick={() => setActiveTab('custom')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'custom'
                    ? 'bg-white dark:bg-slate-600 text-[#1c3643] dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200'
                    }`}
                >
                  <Star className="w-4 h-4" />
                  My Templates
                  {filteredCustomTemplates.length > 0 && (
                    <span className="px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs rounded-full">
                      {filteredCustomTemplates.length}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* System Templates Grid */}
            {activeTab === 'system' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5 mb-10">
                {filteredSystemTemplates.map((template) => (
                  <div
                    key={template.id}
                    onClick={() => handleSelect(template.id)}
                    className={`bg-white dark:bg-slate-800 rounded-xl p-5 cursor-pointer transition-all duration-200 border-2 ${selected === template.id
                      ? 'border-[#0da1c7] shadow-lg shadow-[#0da1c7]/20 relative overflow-hidden'
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
                      <div className="absolute top-0 right-0 p-2 bg-[#0da1c7] text-white rounded-bl-lg">
                        <CheckCircle className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Custom Template Cards */}
            {activeTab === 'custom' && (
              <div className="mb-10">
                {filteredCustomTemplates.length === 0 ? (
                  <div className="bg-white dark:bg-slate-800 rounded-xl p-12 text-center border-2 border-dashed border-gray-300 dark:border-slate-600">
                    <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 dark:text-slate-300 mb-2">No Custom Templates</h3>
                    <p className="text-gray-500 dark:text-slate-400 mb-4">
                      You don't have any custom {reportType} templates yet.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {filteredCustomTemplates.map((template) => (
                      <div
                        key={template.id}
                        onClick={() => handleSelect(template.id)}
                        className={`bg-white dark:bg-slate-800 rounded-xl p-5 cursor-pointer transition-all duration-200 border-2 relative ${selected === template.id
                          ? 'border-[#0da1c7] shadow-lg shadow-[#0da1c7]/20 relative overflow-hidden'
                          : 'border-gray-200 dark:border-slate-700 hover:border-[#0da1c7]/50 hover:shadow-md'
                          }`}
                      >
                        {/* Action Menu Button */}
                        <div className="absolute top-4 right-4 z-10">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setMenuOpen(menuOpen === template.id ? null : template.id);
                            }}
                            className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                          >
                            <MoreVertical className="w-4 h-4 text-gray-400" />
                          </button>

                          {/* Dropdown Menu */}
                          {menuOpen === template.id && (
                            <div className="absolute right-0 top-8 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg py-1 z-20 min-w-[140px]">
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
                              <hr className="my-1 border-gray-100 dark:border-slate-700" />
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteTemplate(template.id);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                Delete
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Star className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                          </div>
                          <div className="flex-1 pr-8">
                            <h3 className="text-lg font-bold text-[#1c3643] dark:text-white">{template.name}</h3>
                            <p className="text-xs text-gray-500 dark:text-slate-400">{template.useCase}</p>
                          </div>
                        </div>

                        {/* Property Type Tags */}
                        <div className="flex flex-wrap gap-2 mb-3">
                          {template.propertyTypes.map((type, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] font-semibold px-2 py-0.5 rounded border bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800"
                            >
                              {type.toUpperCase()}
                            </span>
                          ))}
                          {template.isPublic ? (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded border bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800">
                              TEAM
                            </span>
                          ) : (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded border bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700">
                              PRIVATE
                            </span>
                          )}
                        </div>

                        <p className="text-sm text-gray-600 dark:text-slate-400 mb-4">{template.description}</p>

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
                        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-slate-500 border-t border-gray-100 dark:border-slate-700 pt-3">
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
                          <div className="absolute top-0 right-0 p-2 bg-[#0da1c7] text-white rounded-bl-lg">
                            <CheckCircle className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Info Box moved to bottom or integrated better? Keeping it here mostly for context if needed, but maybe less relevant now. */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-500 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 text-sm">About {reportType === 'appraisal' ? 'Appraisal' : 'Evaluation'} Templates</h4>
                <p className="text-blue-800 dark:text-blue-200 text-sm">
                  {reportType === 'appraisal'
                    ? 'Appraisal templates are designed to meet full USPAP Standard 2 requirements, suitable for federally regulated transactions.'
                    : 'Evaluation templates are streamlined for non-complex properties or low-risk transactions where a full appraisal is not required.'}
                </p>
              </div>
            </div>

            {/* Continue Button - Dark mode styled */}
            <div className="text-center pt-4">
              <button
                onClick={handleContinue}
                disabled={!selected}
                className={`px-8 py-3 rounded-lg font-semibold flex items-center gap-2 mx-auto transition-all ${selected
                  ? 'bg-[#0da1c7] text-white hover:bg-[#0b8fb0]'
                  : 'bg-gray-300 dark:bg-slate-700 text-gray-500 dark:text-slate-500 cursor-not-allowed'
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
        )}
      </div>
    </WizardLayout>
  );
}
