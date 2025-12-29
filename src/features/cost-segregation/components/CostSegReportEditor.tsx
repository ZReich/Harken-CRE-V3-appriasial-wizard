/**
 * CostSegReportEditor Component
 * 
 * Full-screen modal for editing and previewing the Cost Seg report.
 * Includes section tree, inline editing, and PDF generation.
 */

import React, { useState, useRef, useCallback } from 'react';
import { 
  X, 
  Eye, 
  Edit3, 
  Download, 
  Save, 
  ChevronRight, 
  ChevronDown,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  FileText,
  Check,
  Loader2
} from 'lucide-react';
import type { CostSegAnalysis } from '../types';
import { useCostSegReportState } from '../hooks/useCostSegReportState';
import { generateCostSegPdf } from '../utils/costSegPdfExporter';
import { COST_SEG_REPORT_SECTIONS } from '../constants';

// Report page components
import { CostSegCoverPage } from './pages/CostSegCoverPage';
import { CostSegSummaryPage } from './pages/CostSegSummaryPage';
import { CostSegMethodologyPage } from './pages/CostSegMethodologyPage';
import { CostSegComponentsPage } from './pages/CostSegComponentsPage';
import { CostSegSchedulePage } from './pages/CostSegSchedulePage';
import { CostSegBuildingSystemsPage } from './pages/CostSegBuildingSystemsPage';
import { CostSegDisclaimerPage } from './pages/CostSegDisclaimerPage';

interface CostSegReportEditorProps {
  analysis: CostSegAnalysis;
  onClose: () => void;
}

export function CostSegReportEditor({ analysis, onClose }: CostSegReportEditorProps) {
  const {
    reportState,
    isDirty,
    toggleSection,
    updateNarrative,
    resetSection,
    save,
    isSectionVisible,
    orderedSections,
    lastSavedAt,
  } = useCostSegReportState(analysis);

  const [viewMode, setViewMode] = useState<'preview' | 'edit'>('preview');
  const [zoom, setZoom] = useState(100);
  const [isGenerating, setIsGenerating] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['cover']));
  const [activeSection, setActiveSection] = useState('cover');
  
  const reportRef = useRef<HTMLDivElement>(null);

  // Toggle section expansion in sidebar
  const toggleSectionExpanded = useCallback((sectionId: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  }, []);

  // Scroll to section in preview
  const scrollToSection = useCallback((sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.querySelector(`[data-page="${sectionId}"]`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  // Generate PDF
  const handleGeneratePdf = useCallback(async () => {
    if (!reportRef.current) return;
    
    setIsGenerating(true);
    try {
      await generateCostSegPdf(reportRef.current, analysis);
    } catch (error) {
      console.error('Failed to generate PDF:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [analysis]);

  // Zoom controls
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 10, 150));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 10, 50));
  const handleZoomReset = () => setZoom(100);

  // Get narrative content for a section
  const getNarrativeContent = (sectionId: string) => {
    return reportState.customNarratives[sectionId];
  };

  return (
    <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col">
      {/* Top Toolbar */}
      <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
          
          <div className="h-6 w-px bg-gray-200" />
          
          <div>
            <h1 className="font-semibold text-gray-900">Cost Segregation Report</h1>
            <p className="text-xs text-gray-500">{analysis.propertyAddress}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('preview')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'preview'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Eye size={16} />
              Preview
            </button>
            <button
              onClick={() => setViewMode('edit')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'edit'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Edit3 size={16} />
              Edit
            </button>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={handleZoomOut}
              className="p-1.5 text-gray-500 hover:text-gray-700 rounded"
            >
              <ZoomOut size={16} />
            </button>
            <span className="text-sm text-gray-600 w-12 text-center">{zoom}%</span>
            <button
              onClick={handleZoomIn}
              className="p-1.5 text-gray-500 hover:text-gray-700 rounded"
            >
              <ZoomIn size={16} />
            </button>
            <button
              onClick={handleZoomReset}
              className="p-1.5 text-gray-500 hover:text-gray-700 rounded"
            >
              <RotateCcw size={14} />
            </button>
          </div>

          <div className="h-6 w-px bg-gray-200" />

          {/* Save Button */}
          <button
            onClick={save}
            disabled={!isDirty}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isDirty
                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                : 'bg-gray-50 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Save size={16} />
            {isDirty ? 'Save Draft' : 'Saved'}
          </button>

          {/* Generate PDF Button */}
          <button
            onClick={handleGeneratePdf}
            disabled={isGenerating}
            className="flex items-center gap-2 px-4 py-2 bg-[#0da1c7] text-white rounded-lg text-sm font-medium hover:bg-[#0b8fb3] transition-colors disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download size={16} />
                Generate PDF
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex min-h-0">
        {/* Left Sidebar - Section Tree */}
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
          <div className="p-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">Report Sections</h2>
            <p className="text-xs text-gray-500 mt-1">Toggle visibility & navigate</p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            {orderedSections.map((section) => {
              const isVisible = isSectionVisible(section.id);
              const isActive = activeSection === section.id;
              const isExpanded = expandedSections.has(section.id);
              
              return (
                <div key={section.id}>
                  <div
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                      isActive
                        ? 'bg-[#0da1c7]/10 text-[#0da1c7]'
                        : 'hover:bg-gray-100 text-gray-700'
                    } ${!isVisible ? 'opacity-50' : ''}`}
                    onClick={() => scrollToSection(section.id)}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSection(section.id);
                      }}
                      className={`w-4 h-4 rounded border flex items-center justify-center ${
                        isVisible
                          ? 'bg-[#0da1c7] border-[#0da1c7]'
                          : 'border-gray-300'
                      }`}
                    >
                      {isVisible && <Check size={12} className="text-white" />}
                    </button>
                    
                    <FileText size={16} />
                    
                    <span className="flex-1 text-sm font-medium truncate">
                      {section.label}
                    </span>
                    
                    {section.editable && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSectionExpanded(section.id);
                        }}
                        className="p-0.5 hover:bg-gray-200 rounded"
                      >
                        {isExpanded ? (
                          <ChevronDown size={14} />
                        ) : (
                          <ChevronRight size={14} />
                        )}
                      </button>
                    )}
                  </div>
                  
                  {/* Expanded section options */}
                  {section.editable && isExpanded && (
                    <div className="ml-8 mt-1 p-2 bg-gray-50 rounded-lg">
                      <button
                        onClick={() => resetSection(section.id)}
                        className="text-xs text-gray-500 hover:text-gray-700"
                      >
                        Reset to default
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Sidebar Footer */}
          <div className="p-3 border-t border-gray-200 text-xs text-gray-500">
            {lastSavedAt && (
              <p>Last saved: {new Date(lastSavedAt).toLocaleTimeString()}</p>
            )}
          </div>
        </div>

        {/* Center - Report Preview */}
        <div className="flex-1 bg-gray-100 overflow-auto p-8">
          <div
            ref={reportRef}
            className="mx-auto bg-white shadow-xl"
            style={{
              width: `${8.5 * zoom / 100}in`,
              transformOrigin: 'top center',
            }}
          >
            {/* Render visible sections */}
            {isSectionVisible('cover') && (
              <CostSegCoverPage analysis={analysis} />
            )}
            
            {isSectionVisible('executive-summary') && (
              <CostSegSummaryPage analysis={analysis} />
            )}
            
            {isSectionVisible('methodology') && (
              <CostSegMethodologyPage 
                analysis={analysis}
                customNarrative={getNarrativeContent('methodology')}
              />
            )}
            
            {isSectionVisible('component-detail') && (
              <CostSegComponentsPage analysis={analysis} />
            )}
            
            {isSectionVisible('depreciation-schedule') && (
              <CostSegSchedulePage analysis={analysis} />
            )}
            
            {isSectionVisible('building-systems') && (
              <CostSegBuildingSystemsPage analysis={analysis} />
            )}
            
            {isSectionVisible('disclaimer') && (
              <CostSegDisclaimerPage 
                analysis={analysis}
                customDisclaimer={getNarrativeContent('disclaimer')}
              />
            )}
          </div>
        </div>

        {/* Right Sidebar - Edit Panel (shown in edit mode) */}
        {viewMode === 'edit' && (
          <div className="w-80 bg-white border-l border-gray-200 flex flex-col flex-shrink-0">
            <div className="p-4 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900">Edit Section</h2>
              <p className="text-xs text-gray-500 mt-1">{COST_SEG_REPORT_SECTIONS.find(s => s.id === activeSection)?.label}</p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              {activeSection === 'methodology' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Methodology Narrative
                  </label>
                  <textarea
                    value={getNarrativeContent('methodology') || ''}
                    onChange={(e) => updateNarrative('methodology', e.target.value)}
                    rows={10}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent"
                    placeholder="Enter custom methodology description..."
                  />
                </div>
              )}
              
              {activeSection === 'disclaimer' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Custom Disclaimer
                  </label>
                  <textarea
                    value={getNarrativeContent('disclaimer') || ''}
                    onChange={(e) => updateNarrative('disclaimer', e.target.value)}
                    rows={10}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent"
                    placeholder="Enter custom disclaimer text..."
                  />
                </div>
              )}
              
              {!['methodology', 'disclaimer'].includes(activeSection) && (
                <p className="text-sm text-gray-500">
                  This section is auto-generated from the analysis data and cannot be edited directly.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CostSegReportEditor;

