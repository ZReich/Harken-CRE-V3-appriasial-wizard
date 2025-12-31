/**
 * CostSegReportEditor Component
 * 
 * Full-screen interactive editor for the Cost Segregation report.
 * Provides section management, preview, and PDF export functionality.
 */

import React, { useState, useRef, useCallback } from 'react';
import {
  ArrowLeft,
  Download,
  Eye,
  EyeOff,
  Settings,
  FileText,
  ChevronRight,
  ChevronDown,
  GripVertical,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Printer,
} from 'lucide-react';
import { useCostSegReportState } from '../hooks/useCostSegReportState';
import { exportCostSegToPdf } from '../utils/costSegPdfExporter';
import {
  CostSegCoverPage,
  CostSegSummaryPage,
  CostSegMethodologyPage,
  CostSegComponentsPage,
  CostSegSchedulePage,
  CostSegBuildingSystemsPage,
  CostSegDisclaimerPage,
} from './pages';
import type { CostSegAnalysis } from '../../../types';

interface CostSegReportEditorProps {
  analysis: CostSegAnalysis;
  onBack: () => void;
  className?: string;
}

export const CostSegReportEditor: React.FC<CostSegReportEditorProps> = ({
  analysis,
  onBack,
  className = '',
}) => {
  const [activeSection, setActiveSection] = useState('cover');
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const {
    sections,
    toggleSection,
    visibleSections,
    settings,
    updateSettings,
    isDirty,
  } = useCostSegReportState(analysis);

  // Handle PDF export
  const handleExport = useCallback(async () => {
    setIsExporting(true);
    setExportError(null);
    
    try {
      await exportCostSegToPdf({
        analysis,
        sections: visibleSections.map(s => s.id),
        settings,
        filename: `CostSeg_${analysis.propertyName?.replace(/\s+/g, '_') || 'Report'}_${new Date().toISOString().split('T')[0]}.pdf`,
      });
    } catch (err) {
      setExportError(err instanceof Error ? err.message : 'Failed to export PDF');
    } finally {
      setIsExporting(false);
    }
  }, [analysis, visibleSections, settings]);

  // Handle print
  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  // Render page component based on section ID
  const renderPageComponent = (sectionId: string) => {
    const commonProps = {
      analysis,
      firmName: settings.firmName,
      preparerName: settings.preparerName,
      preparerCredentials: settings.preparerCredentials,
    };

    switch (sectionId) {
      case 'cover':
        return <CostSegCoverPage {...commonProps} />;
      case 'summary':
        return <CostSegSummaryPage analysis={analysis} />;
      case 'methodology':
        return <CostSegMethodologyPage analysis={analysis} />;
      case 'components':
        return <CostSegComponentsPage analysis={analysis} />;
      case 'schedule':
        return <CostSegSchedulePage analysis={analysis} maxYears={settings.scheduleMaxYears} />;
      case 'systems':
        return <CostSegBuildingSystemsPage analysis={analysis} />;
      case 'disclaimer':
        return <CostSegDisclaimerPage {...commonProps} />;
      default:
        return null;
    }
  };

  return (
    <div className={`fixed inset-0 bg-slate-100 flex flex-col z-50 ${className}`}>
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <div className="h-6 w-px bg-slate-300" />
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-[#0da1c7]" />
              <div>
                <h1 className="font-bold text-slate-900">Cost Segregation Report</h1>
                <p className="text-xs text-slate-500">{analysis.propertyName}</p>
              </div>
            </div>
            {isDirty && (
              <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded">
                Unsaved Changes
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                showSettings 
                  ? 'bg-slate-200 text-slate-900' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Settings className="w-4 h-4" />
              Settings
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="flex items-center gap-2 px-4 py-2 bg-[#0da1c7] text-white rounded-lg hover:bg-[#0b8eb1] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExporting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Export PDF
                </>
              )}
            </button>
          </div>
        </div>

        {/* Export Error */}
        {exportError && (
          <div className="mt-3 px-4 py-2 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-sm text-red-700">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {exportError}
          </div>
        )}
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-72 bg-white border-r border-slate-200 flex flex-col">
          {/* Sections List */}
          <div className="flex-1 overflow-y-auto p-4">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Report Sections
            </h3>
            <div className="space-y-1">
              {sections.sort((a, b) => a.order - b.order).map((section) => (
                <div
                  key={section.id}
                  className={`group flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                    activeSection === section.id
                      ? 'bg-[#0da1c7]/10 text-[#0da1c7]'
                      : section.isVisible
                      ? 'hover:bg-slate-50 text-slate-700'
                      : 'text-slate-400'
                  }`}
                  onClick={() => section.isVisible && setActiveSection(section.id)}
                >
                  <GripVertical className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 cursor-grab" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{section.title}</div>
                    <div className="text-xs text-slate-400 truncate">{section.description}</div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSection(section.id);
                    }}
                    disabled={section.isRequired}
                    className={`p-1 rounded transition-colors ${
                      section.isRequired
                        ? 'text-slate-300 cursor-not-allowed'
                        : section.isVisible
                        ? 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                        : 'text-slate-300 hover:text-slate-500 hover:bg-slate-100'
                    }`}
                    title={section.isRequired ? 'Required section' : section.isVisible ? 'Hide section' : 'Show section'}
                  >
                    {section.isVisible ? (
                      <Eye className="w-4 h-4" />
                    ) : (
                      <EyeOff className="w-4 h-4" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <div className="border-t border-slate-200 p-4 bg-slate-50">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Report Settings
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Firm Name
                  </label>
                  <input
                    type="text"
                    value={settings.firmName}
                    onChange={(e) => updateSettings({ firmName: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0da1c7]/20 focus:border-[#0da1c7]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Preparer Name
                  </label>
                  <input
                    type="text"
                    value={settings.preparerName}
                    onChange={(e) => updateSettings({ preparerName: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0da1c7]/20 focus:border-[#0da1c7]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Credentials
                  </label>
                  <input
                    type="text"
                    value={settings.preparerCredentials}
                    onChange={(e) => updateSettings({ preparerCredentials: e.target.value })}
                    placeholder="e.g., MAI, SRA, CPA"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0da1c7]/20 focus:border-[#0da1c7]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Schedule Years to Show
                  </label>
                  <select
                    value={settings.scheduleMaxYears}
                    onChange={(e) => updateSettings({ scheduleMaxYears: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0da1c7]/20 focus:border-[#0da1c7]"
                  >
                    <option value={10}>10 Years</option>
                    <option value={15}>15 Years</option>
                    <option value={20}>20 Years</option>
                    <option value={39}>Full Schedule</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* Preview Area */}
        <main className="flex-1 overflow-y-auto bg-slate-200 p-8">
          <div className="max-w-[8.5in] mx-auto">
            {/* Navigation */}
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
              {visibleSections.map((section, idx) => (
                <React.Fragment key={section.id}>
                  {idx > 0 && <ChevronRight className="w-4 h-4" />}
                  <button
                    onClick={() => setActiveSection(section.id)}
                    className={`hover:text-slate-700 transition-colors ${
                      activeSection === section.id ? 'text-[#0da1c7] font-medium' : ''
                    }`}
                  >
                    {section.title}
                  </button>
                </React.Fragment>
              ))}
            </div>

            {/* Report Page Preview */}
            <div 
              ref={reportRef}
              className="bg-white shadow-xl rounded-lg overflow-hidden"
              style={{ minHeight: '11in' }}
            >
              {renderPageComponent(activeSection)}
            </div>

            {/* Page Navigation */}
            <div className="flex items-center justify-between mt-6">
              <button
                onClick={() => {
                  const currentIndex = visibleSections.findIndex(s => s.id === activeSection);
                  if (currentIndex > 0) {
                    setActiveSection(visibleSections[currentIndex - 1].id);
                  }
                }}
                disabled={visibleSections.findIndex(s => s.id === activeSection) === 0}
                className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="w-4 h-4" />
                Previous
              </button>
              
              <span className="text-sm text-slate-500">
                Page {visibleSections.findIndex(s => s.id === activeSection) + 1} of {visibleSections.length}
              </span>

              <button
                onClick={() => {
                  const currentIndex = visibleSections.findIndex(s => s.id === activeSection);
                  if (currentIndex < visibleSections.length - 1) {
                    setActiveSection(visibleSections[currentIndex + 1].id);
                  }
                }}
                disabled={visibleSections.findIndex(s => s.id === activeSection) === visibleSections.length - 1}
                className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CostSegReportEditor;
