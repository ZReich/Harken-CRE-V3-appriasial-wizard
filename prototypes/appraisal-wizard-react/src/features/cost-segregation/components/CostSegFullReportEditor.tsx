/**
 * CostSegFullReportEditor Component
 * 
 * Full-screen report editor for Cost Segregation reports.
 * Provides a two-panel layout with section sidebar and preview area.
 * Similar to the main appraisal report editor pattern.
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  ArrowLeft,
  FileText,
  Download,
  Eye,
  EyeOff,
  Printer,
  Settings,
  ChevronDown,
  ChevronRight,
  Building2,
  DollarSign,
  BookOpen,
  Shield,
  Camera,
  AlertCircle,
  CheckCircle2,
  Calculator,
  Layers,
} from 'lucide-react';
import type { CostSegAnalysis, CostSegBuildingBreakdown } from '../../../types';
import { useWizard } from '../../../context/WizardContext';
import { METHODOLOGY_TEXT, IRS_REFERENCES, COURT_CASE_REFERENCES } from '../../../constants/costSegCSSI';
import { formatCostSegCurrency, formatCostSegPercent } from '../../../services/costSegregationService';

// Section types for the report
type ReportSection = 
  | 'cover-letter'
  | 'executive-summary'
  | 'methodology'
  | 'property-description'
  | 'cost-summary'
  | 'cost-detail'
  | 'building-systems'
  | 'depreciation-schedule'
  | 'certification'
  | 'photos'
  | 'disclaimer';

interface SectionConfig {
  id: ReportSection;
  title: string;
  icon: React.ElementType;
  description: string;
  isEnabled: boolean;
}

const DEFAULT_SECTIONS: SectionConfig[] = [
  { id: 'cover-letter', title: 'Cover Letter', icon: FileText, description: 'Introduction and findings summary', isEnabled: true },
  { id: 'executive-summary', title: 'Executive Summary', icon: DollarSign, description: 'High-level cost allocation overview', isEnabled: true },
  { id: 'methodology', title: 'Methodology', icon: BookOpen, description: 'Study approach and IRS compliance', isEnabled: true },
  { id: 'property-description', title: 'Property Description', icon: Building2, description: 'Subject property details', isEnabled: true },
  { id: 'cost-summary', title: 'Cost Summary', icon: Calculator, description: 'Summary by depreciation class', isEnabled: true },
  { id: 'cost-detail', title: 'Cost Detail Tables', icon: Layers, description: 'Per-building component breakdown', isEnabled: true },
  { id: 'building-systems', title: 'Building Systems', icon: Building2, description: 'System valuations per building', isEnabled: true },
  { id: 'depreciation-schedule', title: 'Depreciation Schedule', icon: DollarSign, description: 'Year-by-year projections', isEnabled: true },
  { id: 'certification', title: 'Certification', icon: Shield, description: 'Investigation certificate', isEnabled: true },
  { id: 'photos', title: 'Site Photos', icon: Camera, description: 'Property documentation', isEnabled: false },
  { id: 'disclaimer', title: 'Disclaimer', icon: AlertCircle, description: 'Legal disclaimers', isEnabled: true },
];

interface CostSegFullReportEditorProps {
  analysis: CostSegAnalysis;
  onBack: () => void;
  onExportPdf?: () => void;
}

export const CostSegFullReportEditor: React.FC<CostSegFullReportEditorProps> = ({
  analysis,
  onBack,
  onExportPdf,
}) => {
  const { state } = useWizard();
  const [sections, setSections] = useState<SectionConfig[]>(DEFAULT_SECTIONS);
  const [activeSection, setActiveSection] = useState<ReportSection>('cover-letter');
  const [expandedSections, setExpandedSections] = useState<Set<ReportSection>>(new Set(['cover-letter']));

  // Report metadata
  const reportDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Toggle section enabled/disabled
  const toggleSectionEnabled = useCallback((sectionId: ReportSection) => {
    setSections(prev => prev.map(s => 
      s.id === sectionId ? { ...s, isEnabled: !s.isEnabled } : s
    ));
  }, []);

  // Get enabled sections
  const enabledSections = useMemo(() => {
    return sections.filter(s => s.isEnabled);
  }, [sections]);

  // Render section content
  const renderSectionContent = (sectionId: ReportSection) => {
    switch (sectionId) {
      case 'cover-letter':
        return <CoverLetterSection analysis={analysis} reportDate={reportDate} />;
      case 'executive-summary':
        return <ExecutiveSummarySection analysis={analysis} />;
      case 'methodology':
        return <MethodologySection />;
      case 'property-description':
        return <PropertyDescriptionSection analysis={analysis} state={state} />;
      case 'cost-summary':
        return <CostSummarySection analysis={analysis} />;
      case 'cost-detail':
        return <CostDetailSection analysis={analysis} />;
      case 'building-systems':
        return <BuildingSystemsSection analysis={analysis} />;
      case 'depreciation-schedule':
        return <DepreciationScheduleSection analysis={analysis} />;
      case 'certification':
        return <CertificationSection analysis={analysis} reportDate={reportDate} />;
      case 'photos':
        return <PhotosSection />;
      case 'disclaimer':
        return <DisclaimerSection />;
      default:
        return <div className="p-8 text-center text-harken-gray-med">Section content not implemented</div>;
    }
  };

  return (
    <div className="fixed inset-0 bg-harken-gray-light z-50 flex flex-col">
      {/* Header */}
      <header className="bg-surface-1 border-b border-light-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-harken-gray hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back</span>
            </button>
            <div className="h-6 w-px bg-harken-gray-med-lt" />
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-accent-teal-mint-light rounded-xl flex items-center justify-center">
                <Calculator className="w-5 h-5 text-accent-teal-mint" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900 dark:text-white">Cost Segregation Report</h1>
                <p className="text-sm text-harken-gray-med">{analysis.propertyName}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 text-harken-gray hover:text-slate-900 hover:bg-harken-gray-light rounded-lg transition-colors"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
            {onExportPdf && (
              <button
                onClick={onExportPdf}
                className="flex items-center gap-2 px-4 py-2 bg-accent-teal-mint text-white rounded-lg hover:bg-accent-teal-mint transition-colors font-medium"
              >
                <Download className="w-4 h-4" />
                Export PDF
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Section List */}
        <aside className="w-72 bg-surface-1 border-r border-light-border overflow-y-auto">
          <div className="p-4 border-b border-light-border">
            <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">
              Report Sections
            </h2>
            <p className="text-xs text-harken-gray-med mt-1">
              Toggle sections to include in report
            </p>
          </div>
          <nav className="p-2">
            {sections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              return (
                <div
                  key={section.id}
                  className={`group flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    isActive
                      ? 'bg-accent-teal-mint-light border border-accent-teal-mint'
                      : 'hover:bg-harken-gray-light'
                  } ${!section.isEnabled ? 'opacity-50' : ''}`}
                  onClick={() => section.isEnabled && setActiveSection(section.id)}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSectionEnabled(section.id);
                    }}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                      section.isEnabled
                        ? 'bg-accent-teal-mint border-accent-teal-mint text-white'
                        : 'border-light-border hover:border-harken-gray-med'
                    }`}
                  >
                    {section.isEnabled && <CheckCircle2 className="w-3 h-3" />}
                  </button>
                  <Icon className={`w-4 h-4 ${isActive ? 'text-accent-teal-mint' : 'text-harken-gray-med'}`} />
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-medium ${isActive ? 'text-accent-teal-mint' : 'text-harken-gray'}`}>
                      {section.title}
                    </div>
                    <div className="text-xs text-harken-gray-med truncate">
                      {section.description}
                    </div>
                  </div>
                </div>
              );
            })}
          </nav>
        </aside>

        {/* Preview Area */}
        <main className="flex-1 overflow-y-auto bg-harken-gray-light p-6">
          <div className="max-w-4xl mx-auto">
            {/* Paper-like container */}
            <div className="bg-surface-1 shadow-lg rounded-lg overflow-hidden">
              {/* Section Header */}
              <div className="bg-harken-gray-light dark:bg-elevation-1 px-8 py-4 border-b border-light-border dark:border-dark-border">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {sections.find(s => s.id === activeSection)?.title}
                </h2>
              </div>
              
              {/* Section Content */}
              <div className="px-8 py-6 min-h-[600px]">
                {renderSectionContent(activeSection)}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

// =================================================================
// SECTION COMPONENTS
// =================================================================

interface AnalysisProps {
  analysis: CostSegAnalysis;
}

// Cover Letter Section
const CoverLetterSection: React.FC<{ analysis: CostSegAnalysis; reportDate: string }> = ({
  analysis,
  reportDate,
}) => (
  <div className="space-y-6 font-serif">
    <div className="text-right text-sm text-harken-gray">
      {reportDate}
    </div>
    
    <div className="space-y-1">
      <p className="font-medium">[Recipient Name]</p>
      <p>[Title]</p>
      <p>[Company Name]</p>
      <p>{analysis.propertyAddress}</p>
    </div>

    <div>
      <p className="mb-4">Dear [Recipient]:</p>
      <p className="mb-4 leading-relaxed">
        This letter summarizes the results of the cost segregation study we have performed for the 
        property located at <strong>{analysis.propertyAddress}</strong>.
      </p>
      <p className="mb-4 leading-relaxed">
        The purpose of this study was to identify and separately depreciate certain assets 
        using the Modified Accelerated Cost Recovery System (MACRS) recovery periods of 5, 15, 
        and 39 years, rather than the standard 39-year recovery period for nonresidential real property.
      </p>
    </div>

    {/* Summary Table */}
    <div className="border border-light-border rounded overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-harken-gray-light">
          <tr className="border-b border-light-border">
            <th className="text-left px-4 py-2 font-semibold">Recovery Period</th>
            <th className="text-right px-4 py-2 font-semibold">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-light-border">
            <td className="px-4 py-2">5-Year Personal Property</td>
            <td className="px-4 py-2 text-right font-medium">
              {formatCostSegCurrency(analysis.summary.fiveYear.total)}
            </td>
          </tr>
          <tr className="border-b border-light-border">
            <td className="px-4 py-2">15-Year Real Property</td>
            <td className="px-4 py-2 text-right font-medium">
              {formatCostSegCurrency(analysis.summary.fifteenYear.total)}
            </td>
          </tr>
          <tr className="border-b border-light-border">
            <td className="px-4 py-2">39-Year Real Property</td>
            <td className="px-4 py-2 text-right font-medium">
              {formatCostSegCurrency(analysis.summary.thirtyNineYear.total)}
            </td>
          </tr>
          <tr className="bg-harken-gray-light font-bold">
            <td className="px-4 py-2">TOTAL PROJECT COST REVIEWED</td>
            <td className="px-4 py-2 text-right">
              {formatCostSegCurrency(analysis.totalProjectCost)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <p className="text-sm text-harken-gray leading-relaxed">
      This study has been prepared in accordance with the IRS Cost Segregation Audit 
      Techniques Guide and applicable Treasury Regulations. The taxpayer and their tax 
      advisor are responsible for determining the appropriate application of the study results.
    </p>

    <div className="pt-8">
      <p>Sincerely,</p>
      <div className="mt-12">
        <p className="font-medium">[Preparer Name]</p>
        <p className="text-sm text-harken-gray">[Title / Credentials]</p>
      </div>
    </div>
  </div>
);

// Executive Summary Section
const ExecutiveSummarySection: React.FC<AnalysisProps> = ({ analysis }) => (
  <div className="space-y-6">
    <h3 className="text-xl font-bold text-slate-900 border-b-2 border-accent-teal-mint pb-2">
      EXECUTIVE SUMMARY
    </h3>
    
    <div className="prose max-w-none">
      <p className="leading-relaxed">
        This cost segregation study analyzes the property at <strong>{analysis.propertyAddress}</strong> 
        to identify components eligible for accelerated depreciation under IRC Sections 167 and 168.
      </p>
    </div>

    {/* Summary Table */}
    <div className="border-2 border-slate-900 rounded overflow-hidden">
      <div className="bg-accent-teal-mint text-white px-4 py-2 font-bold text-center">
        SUMMARY OF FINDINGS
      </div>
      <table className="w-full">
        <thead className="bg-harken-gray-light">
          <tr className="border-b border-light-border">
            <th className="text-left px-4 py-3 font-semibold">Recovery Period</th>
            <th className="text-right px-4 py-3 font-semibold">Amount</th>
            <th className="text-right px-4 py-3 font-semibold">% of Total</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-light-border bg-accent-teal-mint-light">
            <td className="px-4 py-3">5-Year Personal Property</td>
            <td className="px-4 py-3 text-right font-medium">
              {formatCostSegCurrency(analysis.summary.fiveYear.total)}
            </td>
            <td className="px-4 py-3 text-right text-accent-teal-mint font-medium">
              {formatCostSegPercent(analysis.summary.fiveYear.percent)}
            </td>
          </tr>
          <tr className="border-b border-light-border bg-blue-50">
            <td className="px-4 py-3">15-Year Land Improvements</td>
            <td className="px-4 py-3 text-right font-medium">
              {formatCostSegCurrency(analysis.summary.fifteenYear.total)}
            </td>
            <td className="px-4 py-3 text-right text-blue-700 font-medium">
              {formatCostSegPercent(analysis.summary.fifteenYear.percent)}
            </td>
          </tr>
          <tr className="border-b border-light-border">
            <td className="px-4 py-3">39-Year Real Property</td>
            <td className="px-4 py-3 text-right font-medium">
              {formatCostSegCurrency(analysis.summary.thirtyNineYear.total)}
            </td>
            <td className="px-4 py-3 text-right">
              {formatCostSegPercent(analysis.summary.thirtyNineYear.percent)}
            </td>
          </tr>
          <tr className="bg-harken-gray-light font-bold">
            <td className="px-4 py-3">TOTAL PROJECT COST</td>
            <td className="px-4 py-3 text-right">
              {formatCostSegCurrency(analysis.totalProjectCost)}
            </td>
            <td className="px-4 py-3 text-right">100.0%</td>
          </tr>
        </tbody>
      </table>
    </div>

    {/* Key Benefits */}
    <div className="grid grid-cols-3 gap-4">
      <div className="bg-accent-teal-mint-light border border-accent-teal-mint rounded-lg p-4 text-center">
        <div className="text-xs text-accent-teal-mint uppercase tracking-wide mb-1">
          First Year Depreciation
        </div>
        <div className="text-2xl font-bold text-accent-teal-mint">
          {formatCostSegCurrency(analysis.firstYearDepreciation)}
        </div>
      </div>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
        <div className="text-xs text-blue-600 uppercase tracking-wide mb-1">
          Accelerated Benefit
        </div>
        <div className="text-2xl font-bold text-blue-700">
          {formatCostSegCurrency(analysis.acceleratedBenefit)}
        </div>
      </div>
      <div className="bg-harken-gray-light border border-light-border rounded-lg p-4 text-center">
        <div className="text-xs text-harken-gray uppercase tracking-wide mb-1">
          Land Value (Excluded)
        </div>
        <div className="text-2xl font-bold text-harken-gray">
          {formatCostSegCurrency(analysis.landValue)}
        </div>
      </div>
    </div>
  </div>
);

// Methodology Section
const MethodologySection: React.FC = () => (
  <div className="space-y-6">
    <h3 className="text-xl font-bold text-harken-dark border-b-2 border-accent-teal-mint pb-2">
      THE STUDY - METHODOLOGY
    </h3>

    <div className="prose max-w-none space-y-4">
      <h4 className="text-lg font-semibold text-harken-dark">Overview</h4>
      <p className="leading-relaxed text-harken-gray">{METHODOLOGY_TEXT.overview}</p>

      <h4 className="text-lg font-semibold text-harken-dark">Engineering Approach</h4>
      <p className="leading-relaxed text-harken-gray">{METHODOLOGY_TEXT.engineeringApproach}</p>

      <h4 className="text-lg font-semibold text-harken-dark">IRS Compliance</h4>
      <p className="leading-relaxed text-harken-gray">{METHODOLOGY_TEXT.irsCompliance}</p>
    </div>

    {/* Legal References */}
    <div className="bg-surface-2 dark:bg-elevation-2 border border-light-border dark:border-dark-border rounded-lg p-4">
      <h4 className="font-semibold text-harken-dark mb-3">Regulatory References</h4>
      <ul className="space-y-1 text-sm text-harken-gray">
        <li>• {IRS_REFERENCES.auditTechniquesGuide}</li>
        <li>• {IRS_REFERENCES.revenueProc8756}</li>
        <li>• {IRS_REFERENCES.section1245}</li>
        <li>• {IRS_REFERENCES.section1250}</li>
        <li>• {IRS_REFERENCES.treasuryDecision9636}</li>
      </ul>
    </div>

    {/* Court Cases */}
    <div className="bg-surface-2 dark:bg-elevation-2 border border-light-border dark:border-dark-border rounded-lg p-4">
      <h4 className="font-semibold text-harken-dark mb-3">Landmark Court Cases</h4>
      <div className="space-y-3">
        {COURT_CASE_REFERENCES.map((c, idx) => (
          <div key={idx} className="text-sm">
            <span className="font-medium text-harken-dark">{c.name}</span>
            <span className="text-harken-gray-med ml-2">({c.citation})</span>
            <p className="text-harken-gray text-xs mt-0.5">{c.note}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Property Description Section
const PropertyDescriptionSection: React.FC<{ analysis: CostSegAnalysis; state: any }> = ({
  analysis,
  state,
}) => (
  <div className="space-y-6">
    <h3 className="text-xl font-bold text-harken-dark border-b-2 border-accent-teal-mint pb-2">
      PROPERTY DESCRIPTION
    </h3>

    <div className="grid grid-cols-2 gap-6">
      <div>
        <h4 className="font-semibold text-harken-dark mb-2">Property Address</h4>
        <p className="text-harken-gray">{analysis.propertyAddress}</p>
      </div>
      <div>
        <h4 className="font-semibold text-harken-dark mb-2">Property Type</h4>
        <p className="text-harken-gray">{analysis.occupancyCode || 'Commercial'}</p>
      </div>
      <div>
        <h4 className="font-semibold text-harken-dark mb-2">Total Project Cost</h4>
        <p className="text-harken-gray font-medium">{formatCostSegCurrency(analysis.totalProjectCost)}</p>
      </div>
      <div>
        <h4 className="font-semibold text-harken-dark mb-2">Analysis Date</h4>
        <p className="text-harken-gray">{analysis.analysisDate.split('T')[0]}</p>
      </div>
    </div>

    {/* Buildings Analyzed */}
    <div className="border border-light-border rounded-lg overflow-hidden">
      <div className="bg-harken-gray-light px-4 py-2 font-semibold text-harken-dark border-b border-light-border">
        Buildings Analyzed
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-light-border bg-harken-gray-light">
            <th className="text-left px-4 py-2">Building</th>
            <th className="text-right px-4 py-2">Cost</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-harken-gray-light">
            <td className="px-4 py-2">Main Building</td>
            <td className="px-4 py-2 text-right font-medium">
              {formatCostSegCurrency(analysis.totalBuildingCost)}
            </td>
          </tr>
          <tr className="bg-harken-gray-light font-semibold">
            <td className="px-4 py-2">Total Building Cost</td>
            <td className="px-4 py-2 text-right">
              {formatCostSegCurrency(analysis.totalBuildingCost)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
);

// Cost Summary Section
const CostSummarySection: React.FC<AnalysisProps> = ({ analysis }) => (
  <div className="space-y-6">
    <h3 className="text-xl font-bold text-harken-dark border-b-2 border-accent-teal-mint pb-2">
      COST SUMMARY BY DEPRECIATION CLASS
    </h3>

    <table className="w-full border-2 border-harken-dark">
      <thead className="bg-accent-teal-mint text-white">
        <tr>
          <th className="text-left px-4 py-3 font-semibold">Property Category</th>
          <th className="text-right px-4 py-3 font-semibold">Cost</th>
          <th className="text-right px-4 py-3 font-semibold">5 Year</th>
          <th className="text-right px-4 py-3 font-semibold">15 Year</th>
          <th className="text-right px-4 py-3 font-semibold">39 Year</th>
        </tr>
      </thead>
      <tbody>
        <tr className="border-b border-light-border bg-accent-teal-mint-light">
          <td className="px-4 py-3 font-medium">5-Year Personal Property</td>
          <td className="px-4 py-3 text-right">{formatCostSegCurrency(analysis.summary.fiveYear.total)}</td>
          <td className="px-4 py-3 text-right font-bold">{formatCostSegCurrency(analysis.summary.fiveYear.total)}</td>
          <td className="px-4 py-3 text-right">-</td>
          <td className="px-4 py-3 text-right">-</td>
        </tr>
        <tr className="border-b border-light-border bg-blue-50">
          <td className="px-4 py-3 font-medium">15-Year Land Improvements</td>
          <td className="px-4 py-3 text-right">{formatCostSegCurrency(analysis.summary.fifteenYear.total)}</td>
          <td className="px-4 py-3 text-right">-</td>
          <td className="px-4 py-3 text-right font-bold">{formatCostSegCurrency(analysis.summary.fifteenYear.total)}</td>
          <td className="px-4 py-3 text-right">-</td>
        </tr>
        <tr className="border-b border-light-border">
          <td className="px-4 py-3 font-medium">39-Year Real Property</td>
          <td className="px-4 py-3 text-right">{formatCostSegCurrency(analysis.summary.thirtyNineYear.total)}</td>
          <td className="px-4 py-3 text-right">-</td>
          <td className="px-4 py-3 text-right">-</td>
          <td className="px-4 py-3 text-right font-bold">{formatCostSegCurrency(analysis.summary.thirtyNineYear.total)}</td>
        </tr>
        <tr className="bg-harken-gray-light font-bold border-t-2 border-harken-dark">
          <td className="px-4 py-3">TOTAL PROJECT COST</td>
          <td className="px-4 py-3 text-right">{formatCostSegCurrency(analysis.totalImprovementCost)}</td>
          <td className="px-4 py-3 text-right">{formatCostSegCurrency(analysis.summary.fiveYear.total)}</td>
          <td className="px-4 py-3 text-right">{formatCostSegCurrency(analysis.summary.fifteenYear.total)}</td>
          <td className="px-4 py-3 text-right">{formatCostSegCurrency(analysis.summary.thirtyNineYear.total)}</td>
        </tr>
        <tr className="bg-harken-gray-light">
          <td className="px-4 py-2 text-sm">% of Building Cost</td>
          <td className="px-4 py-2 text-right">100%</td>
          <td className="px-4 py-2 text-right text-accent-teal-mint">{formatCostSegPercent(analysis.summary.fiveYear.percent)}</td>
          <td className="px-4 py-2 text-right text-blue-700">{formatCostSegPercent(analysis.summary.fifteenYear.percent)}</td>
          <td className="px-4 py-2 text-right">{formatCostSegPercent(analysis.summary.thirtyNineYear.percent)}</td>
        </tr>
      </tbody>
    </table>
  </div>
);

// Cost Detail Section
const CostDetailSection: React.FC<AnalysisProps> = ({ analysis }) => (
  <div className="space-y-6">
    <h3 className="text-xl font-bold text-harken-dark border-b-2 border-accent-teal-mint pb-2">
      COST DETAIL BY BUILDING
    </h3>

    <p className="text-harken-gray text-sm">
      The following tables detail the component allocations for each building analyzed. 
      Components are classified according to IRS guidelines and MACRS recovery periods.
    </p>

    {/* Component List */}
    <div className="border border-light-border rounded-lg overflow-hidden">
      <div className="bg-accent-teal-mint text-white px-4 py-2 font-semibold">
        {analysis.propertyName} - Building Components
      </div>
      <table className="w-full text-sm">
        <thead className="bg-harken-gray-light">
          <tr className="border-b border-light-border">
            <th className="text-left px-4 py-2 font-semibold">Component</th>
            <th className="text-right px-4 py-2 font-semibold">Cost</th>
            <th className="text-right px-4 py-2 font-semibold">5 Year</th>
            <th className="text-right px-4 py-2 font-semibold">39 Year</th>
          </tr>
        </thead>
        <tbody>
          {analysis.components.slice(0, 15).map((comp, idx) => (
            <tr key={idx} className="border-b border-harken-gray-light">
              <td className="px-4 py-2">{comp.label}</td>
              <td className="px-4 py-2 text-right">{formatCostSegCurrency(comp.cost)}</td>
              <td className="px-4 py-2 text-right">
                {comp.depreciationClass === '5-year' ? formatCostSegCurrency(comp.cost) : '-'}
              </td>
              <td className="px-4 py-2 text-right">
                {comp.depreciationClass === '39-year' ? formatCostSegCurrency(comp.cost) : '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// Building Systems Section
const BuildingSystemsSection: React.FC<AnalysisProps> = ({ analysis }) => (
  <div className="space-y-6">
    <h3 className="text-xl font-bold text-harken-dark border-b-2 border-accent-teal-mint pb-2">
      BUILDING SYSTEMS
    </h3>

    <p className="text-harken-gray text-sm">
      Per Treasury Decision 9636, building systems are separately stated for tangible property 
      regulations compliance. The following table summarizes building system valuations.
    </p>

    <div className="border border-light-border rounded-lg overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-harken-gray-light">
          <tr className="border-b border-light-border">
            <th className="text-left px-4 py-3 font-semibold">Building Components</th>
            <th className="text-right px-4 py-3 font-semibold">Depreciable Cost</th>
            <th className="text-right px-4 py-3 font-semibold">Replacement Cost</th>
          </tr>
        </thead>
        <tbody>
          {(analysis.buildingSystems || []).map((system, idx) => (
            <tr key={idx} className="border-b border-harken-gray-light">
              <td className="px-4 py-2">{system.systemLabel}</td>
              <td className="px-4 py-2 text-right">{formatCostSegCurrency(system.depreciableCost)}</td>
              <td className="px-4 py-2 text-right">{formatCostSegCurrency(system.replacementCost)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-harken-gray-light font-bold">
            <td className="px-4 py-3">TOTAL BUILDING COST</td>
            <td className="px-4 py-3 text-right">{formatCostSegCurrency(analysis.totalBuildingCost)}</td>
            <td className="px-4 py-3 text-right">{formatCostSegCurrency(analysis.totalBuildingCost)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  </div>
);

// Depreciation Schedule Section
const DepreciationScheduleSection: React.FC<AnalysisProps> = ({ analysis }) => (
  <div className="space-y-6">
    <h3 className="text-xl font-bold text-harken-dark border-b-2 border-accent-teal-mint pb-2">
      DEPRECIATION SCHEDULE
    </h3>

    <p className="text-harken-gray text-sm">
      Year-by-year depreciation projections under MACRS. Includes applicable bonus 
      depreciation for eligible property classes.
    </p>

    <div className="border border-light-border rounded-lg overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-harken-gray-light">
          <tr className="border-b border-light-border">
            <th className="text-left px-4 py-2 font-semibold">Year</th>
            <th className="text-right px-4 py-2 font-semibold">5-Year</th>
            <th className="text-right px-4 py-2 font-semibold">15-Year</th>
            <th className="text-right px-4 py-2 font-semibold">39-Year</th>
            <th className="text-right px-4 py-2 font-semibold">Total</th>
            <th className="text-right px-4 py-2 font-semibold">Cumulative</th>
          </tr>
        </thead>
        <tbody>
          {(analysis.depreciationSchedule || []).slice(0, 10).map((year, idx) => (
            <tr key={idx} className={`border-b border-harken-gray-light ${idx === 0 ? 'bg-accent-teal-mint-light' : ''}`}>
              <td className="px-4 py-2 font-medium">{year.year}</td>
              <td className="px-4 py-2 text-right">{formatCostSegCurrency(year.fiveYearDepreciation)}</td>
              <td className="px-4 py-2 text-right">{formatCostSegCurrency(year.fifteenYearDepreciation)}</td>
              <td className="px-4 py-2 text-right">{formatCostSegCurrency(year.thirtyNineYearDepreciation)}</td>
              <td className="px-4 py-2 text-right font-medium">{formatCostSegCurrency(year.totalDepreciation)}</td>
              <td className="px-4 py-2 text-right">{formatCostSegCurrency(year.cumulativeDepreciation)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// Certification Section
const CertificationSection: React.FC<{ analysis: CostSegAnalysis; reportDate: string }> = ({
  analysis,
  reportDate,
}) => (
  <div className="space-y-6">
    <h3 className="text-xl font-bold text-harken-dark border-b-2 border-accent-teal-mint pb-2">
      INVESTIGATION AND EVALUATION CERTIFICATE
    </h3>

    <div className="prose max-w-none space-y-4 text-harken-gray">
      <p className="leading-relaxed">
        I certify that the cost segregation study for the property located at{' '}
        <strong>{analysis.propertyAddress}</strong> was conducted in accordance with 
        the IRS Cost Segregation Audit Techniques Guide.
      </p>
      
      <p className="leading-relaxed">
        The study methodology employs detailed engineering analysis using Marshall & Swift 
        cost data and component classification according to IRC Sections 1245 and 1250, 
        Treasury Regulations, and applicable court precedents.
      </p>

      <p className="leading-relaxed">
        This certification is made as of {reportDate}.
      </p>
    </div>

    <div className="border-t border-light-border pt-8 mt-8">
      <div className="w-64">
        <div className="border-b border-harken-dark mb-2 h-16" />
        <p className="font-medium">[Preparer Signature]</p>
        <p className="text-sm text-harken-gray">[Name and Credentials]</p>
        <p className="text-sm text-harken-gray">{reportDate}</p>
      </div>
    </div>
  </div>
);

// Photos Section
const PhotosSection: React.FC = () => (
  <div className="space-y-6">
    <h3 className="text-xl font-bold text-harken-dark border-b-2 border-accent-teal-mint pb-2">
      SITE PHOTOS
    </h3>

    <div className="text-center py-12 text-harken-gray-med">
      <Camera className="w-12 h-12 mx-auto mb-4 text-harken-gray-med-lt" />
      <p>No site photos attached</p>
      <p className="text-sm mt-2">Photos can be added from the Improvements Inventory or uploaded here.</p>
    </div>
  </div>
);

// Disclaimer Section
const DisclaimerSection: React.FC = () => (
  <div className="space-y-6">
    <h3 className="text-xl font-bold text-harken-dark border-b-2 border-accent-teal-mint pb-2">
      DISCLAIMER
    </h3>

    <div className="prose max-w-none text-sm text-harken-gray space-y-4">
      <p className="leading-relaxed">{METHODOLOGY_TEXT.disclaimer}</p>

      <p className="leading-relaxed">
        The allocations presented in this study are based on the information provided and 
        the professional judgment of the preparer. The taxpayer is responsible for 
        maintaining adequate documentation to support the deductions claimed.
      </p>

      <p className="leading-relaxed">
        This study is not intended to provide legal or tax advice. The taxpayer should 
        consult with their tax advisor regarding the implementation of the study results 
        and compliance with applicable tax laws.
      </p>

      <p className="leading-relaxed">
        The cost segregation study is based on information available at the time of 
        preparation. Changes in tax law, regulations, or IRS interpretation may affect 
        the applicability of the study results.
      </p>
    </div>
  </div>
);

export default CostSegFullReportEditor;
