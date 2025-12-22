import { useState, useMemo, useRef, useCallback } from 'react';
import { useWizard } from '../../../context/WizardContext';
import { BASE_REPORT_SECTIONS, APPROACH_REPORT_SECTIONS, CLOSING_REPORT_SECTIONS } from '../constants';
import type { ReportSection, PropertyTabId, ElementStyles } from '../types';
// ReportField and EditableElement types are available via ReportSection type

// =================================================================
// SECTION TREE COMPONENT
// =================================================================

interface SectionTreeProps {
  sections: ReportSection[];
  onToggleSection: (sectionId: string) => void;
  onToggleField: (sectionId: string, fieldId: string) => void;
  onToggleExpand: (sectionId: string) => void;
  onScrollToSection: (sectionId: string) => void;
  activeSectionId: string | null;
}

function SectionTree({
  sections,
  onToggleSection,
  onToggleField,
  onToggleExpand,
  onScrollToSection,
  activeSectionId,
}: SectionTreeProps) {
  return (
    <div className="space-y-2">
      {sections.map((section) => (
        <div
          key={section.id}
          className={`border-l-3 transition-all ${
            activeSectionId === section.id ? 'border-l-[#0da1c7] bg-[#0da1c7]/5' : 'border-l-transparent'
          }`}
        >
          <div className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded-r cursor-pointer">
            <input
              type="checkbox"
              checked={section.enabled}
              onChange={() => onToggleSection(section.id)}
              onClick={(e) => e.stopPropagation()}
              className="w-4 h-4 accent-[#0da1c7]"
            />
            <button
              onClick={() => onToggleExpand(section.id)}
              className={`p-1 text-gray-500 hover:text-[#0da1c7] transition-transform ${
                section.expanded ? 'rotate-90' : ''
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <span
              onClick={() => onScrollToSection(section.id)}
              className={`flex-1 text-sm font-medium ${
                activeSectionId === section.id ? 'text-[#0da1c7]' : 'text-gray-700'
              }`}
            >
              {section.label}
            </span>
          </div>

          {/* Fields */}
          {section.expanded && section.fields.length > 0 && (
            <div className="ml-10 space-y-1 pb-2">
              {section.fields.map((field) => (
                <div
                  key={field.id}
                  className="flex items-center gap-2 px-2 py-1 hover:bg-gray-50 rounded"
                >
                  <input
                    type="checkbox"
                    checked={field.enabled}
                    onChange={() => onToggleField(section.id, field.id)}
                    className="w-3.5 h-3.5 accent-[#0da1c7]"
                  />
                  <span className="text-xs text-gray-600">{field.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// =================================================================
// REPORT PAGE PREVIEW COMPONENT
// =================================================================

interface ReportPageProps {
  section: ReportSection;
  propertyName: string;
  propertyAddress: string;
  selectedElement: string | null;
  onSelectElement: (elementId: string) => void;
}

function ReportPage({ section, propertyName, propertyAddress, selectedElement, onSelectElement }: ReportPageProps) {
  if (section.type === 'cover') {
    return (
      <div className="bg-white shadow-lg rounded-lg overflow-hidden" style={{ minHeight: '11in', width: '8.5in' }}>
        {/* Cover Page */}
        <div className="flex flex-col h-full">
          {/* Title Section */}
          <div
            onClick={() => onSelectElement(`${section.id}_title`)}
            className={`p-16 pb-4 cursor-pointer transition-all ${
              selectedElement === `${section.id}_title` ? 'outline outline-2 outline-[#0da1c7] bg-[#0da1c7]/5' : 'hover:bg-gray-50'
            }`}
          >
            <h1 className="text-5xl font-light text-emerald-700 leading-tight">{propertyName}</h1>
          </div>

          {/* Address Section */}
          <div
            onClick={() => onSelectElement(`${section.id}_address`)}
            className={`px-16 pb-8 cursor-pointer transition-all ${
              selectedElement === `${section.id}_address` ? 'outline outline-2 outline-[#0da1c7] bg-[#0da1c7]/5' : 'hover:bg-gray-50'
            }`}
          >
            <p className="text-lg text-gray-500">{propertyAddress}</p>
          </div>

          {/* Image Section */}
          <div
            onClick={() => onSelectElement(`${section.id}_image`)}
            className={`flex-1 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center cursor-pointer transition-all ${
              selectedElement === `${section.id}_image` ? 'outline outline-2 outline-[#0da1c7]' : ''
            }`}
            style={{ minHeight: '400px' }}
          >
            <div className="text-center text-gray-500">
              <svg className="w-16 h-16 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm">Cover Photo</p>
              <p className="text-xs opacity-75">Click to select and edit</p>
            </div>
          </div>

          {/* Footer */}
          <div
            onClick={() => onSelectElement(`${section.id}_footer`)}
            className={`h-20 bg-emerald-700 flex items-center justify-between px-16 cursor-pointer transition-all ${
              selectedElement === `${section.id}_footer` ? 'outline outline-2 outline-[#0da1c7]' : ''
            }`}
          >
            <div className="text-white font-bold">HARKEN</div>
            <div className="text-white text-sm text-right">
              <div>Commercial Real Estate</div>
              <div className="opacity-75 text-xs">Appraisal Services</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Section Page
  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden" style={{ minHeight: '11in', width: '8.5in' }}>
      <div className="grid grid-cols-[80px_1fr]" style={{ minHeight: '11in' }}>
        {/* Green Sidebar */}
        <div className="bg-emerald-700 text-white flex items-center justify-center">
          <span
            className="text-4xl font-bold tracking-widest"
            style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
          >
            {section.sectionNumber || ''}
          </span>
        </div>

        {/* Content */}
        <div className="p-12 relative">
          {/* Section Header */}
          <div className="absolute top-8 right-8 bg-emerald-700 text-white px-6 py-3 rounded">
            <div className="text-xs font-semibold">SECTION {section.sectionNumber}</div>
            <div className="text-sm font-bold">{section.label.replace(/Section \d+: /, '')}</div>
          </div>

          {/* Content */}
          <div className="mt-20">
            <h2
              onClick={() => onSelectElement(`${section.id}_heading`)}
              className={`text-3xl font-light text-gray-800 mb-6 cursor-pointer transition-all ${
                selectedElement === `${section.id}_heading` ? 'outline outline-2 outline-[#0da1c7] bg-[#0da1c7]/5 p-2 -m-2' : 'hover:bg-gray-50'
              }`}
            >
              {section.label.replace(/Section \d+: /, '')}
            </h2>

            {/* Placeholder Content */}
            <div className="space-y-4">
              {section.fields
                .filter((f) => f.enabled)
                .map((field) => (
                  <div
                    key={field.id}
                    onClick={() => onSelectElement(field.id)}
                    className={`p-4 border border-dashed border-gray-300 rounded cursor-pointer transition-all ${
                      selectedElement === field.id ? 'border-[#0da1c7] bg-[#0da1c7]/5' : 'hover:border-gray-400'
                    }`}
                  >
                    <p className="text-sm text-gray-500">{field.label}</p>
                    <p className="text-xs text-gray-400 mt-1">Click to edit content</p>
                  </div>
                ))}
            </div>
          </div>

          {/* Page Footer */}
          <div className="absolute bottom-8 right-8 text-xs text-gray-400">
            Page {section.sectionNumber ? parseInt(section.sectionNumber) + 2 : ''}
          </div>
        </div>
      </div>
    </div>
  );
}

// =================================================================
// PROPERTIES PANEL COMPONENT
// =================================================================

interface PropertiesPanelProps {
  selectedElement: string | null;
  elementStyles: ElementStyles;
  onStyleChange: (styles: Partial<ElementStyles>) => void;
  onDeleteElement: () => void;
}

function PropertiesPanel({ selectedElement, elementStyles, onStyleChange, onDeleteElement }: PropertiesPanelProps) {
  const [activeTab, setActiveTab] = useState<PropertyTabId>('design');

  const tabs: { id: PropertyTabId; label: string }[] = [
    { id: 'design', label: 'Design' },
    { id: 'content', label: 'Content' },
    { id: 'advanced', label: 'Advanced' },
  ];

  if (!selectedElement) {
    return (
      <div className="h-full flex items-center justify-center text-center p-8">
        <div className="text-gray-400">
          <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
          </svg>
          <p className="text-sm">Click on any element in the preview to edit its properties</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="text-sm font-bold text-gray-800">Element Properties</div>
        <div className="text-xs text-gray-500 mt-1">{selectedElement}</div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-[#0da1c7] border-b-2 border-[#0da1c7]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 space-y-6">
        {activeTab === 'design' && (
          <>
            {/* Typography */}
            <div>
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Typography</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Font Family</label>
                  <select
                    value={elementStyles.fontFamily || 'Montserrat'}
                    onChange={(e) => onStyleChange({ fontFamily: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  >
                    <option value="Montserrat">Montserrat</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Arial">Arial</option>
                    <option value="Times New Roman">Times New Roman</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Font Size (px)</label>
                  <input
                    type="number"
                    value={elementStyles.fontSize || 14}
                    onChange={(e) => onStyleChange({ fontSize: parseInt(e.target.value) })}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Font Weight</label>
                  <select
                    value={elementStyles.fontWeight || 'normal'}
                    onChange={(e) => onStyleChange({ fontWeight: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  >
                    <option value="normal">Normal</option>
                    <option value="500">Medium</option>
                    <option value="600">Semibold</option>
                    <option value="700">Bold</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Colors */}
            <div>
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Colors</h4>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Text Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={elementStyles.color || '#1c3643'}
                    onChange={(e) => onStyleChange({ color: e.target.value })}
                    className="w-10 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={elementStyles.color || '#1c3643'}
                    onChange={(e) => onStyleChange({ color: e.target.value })}
                    className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Alignment */}
            <div>
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Alignment</h4>
              <div className="flex gap-2">
                {(['left', 'center', 'right'] as const).map((align) => (
                  <button
                    key={align}
                    onClick={() => onStyleChange({ textAlign: align })}
                    className={`flex-1 py-2 border rounded text-sm capitalize ${
                      elementStyles.textAlign === align
                        ? 'border-[#0da1c7] bg-[#0da1c7]/10 text-[#0da1c7]'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {align}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === 'content' && (
          <div>
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Content</h4>
            <textarea
              placeholder="Edit the content of this element..."
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm min-h-[200px]"
            />
          </div>
        )}

        {activeTab === 'advanced' && (
          <>
            <div>
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Spacing</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Margin Top</label>
                  <input
                    type="number"
                    value={elementStyles.marginTop || 0}
                    onChange={(e) => onStyleChange({ marginTop: parseInt(e.target.value) })}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Margin Bottom</label>
                  <input
                    type="number"
                    value={elementStyles.marginBottom || 0}
                    onChange={(e) => onStyleChange({ marginBottom: parseInt(e.target.value) })}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Actions</h4>
              <button
                onClick={onDeleteElement}
                className="w-full py-2 bg-red-600 text-white rounded text-sm font-medium hover:bg-red-700"
              >
                Delete Element
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// =================================================================
// MAIN REPORT EDITOR COMPONENT
// =================================================================

export function ReportEditor() {
  const { state } = useWizard();
  const { scenarios, improvementsInventory, extractedData } = state;

  const previewRef = useRef<HTMLDivElement>(null);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [elementStyles, setElementStyles] = useState<ElementStyles>({});

  // Build dynamic sections based on selected approaches
  const sections = useMemo(() => {
    // Get all unique approaches used across scenarios
    const usedApproaches = new Set<string>();
    scenarios.forEach((s) => s.approaches.forEach((a) => usedApproaches.add(a)));

    // Build sections array
    const dynamicSections: ReportSection[] = [...BASE_REPORT_SECTIONS];

    // Add approach sections only if approach is used
    Object.entries(APPROACH_REPORT_SECTIONS).forEach(([approach, section]) => {
      if (usedApproaches.has(approach)) {
        dynamicSections.push({ ...section });
      }
    });

    // Add closing sections
    dynamicSections.push(...CLOSING_REPORT_SECTIONS);

    return dynamicSections;
  }, [scenarios]);

  const [reportSections, setReportSections] = useState<ReportSection[]>(sections);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);

  // Get property info
  const propertyName = useMemo(() => {
    if (improvementsInventory?.parcels?.[0]?.buildings?.[0]?.name) {
      return improvementsInventory.parcels[0].buildings[0].name;
    }
    if (extractedData?.cadastral?.propertyName?.value) {
      return extractedData.cadastral.propertyName.value;
    }
    return 'Subject Property';
  }, [improvementsInventory, extractedData]);

  const propertyAddress = useMemo(() => {
    if (extractedData?.cadastral?.address?.value) {
      return extractedData.cadastral.address.value;
    }
    if (improvementsInventory?.parcels?.[0]?.address) {
      return improvementsInventory.parcels[0].address;
    }
    return 'Address Not Specified';
  }, [extractedData, improvementsInventory]);

  // Handlers
  const handleToggleSection = useCallback((sectionId: string) => {
    setReportSections((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, enabled: !s.enabled } : s))
    );
  }, []);

  const handleToggleField = useCallback((sectionId: string, fieldId: string) => {
    setReportSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? { ...s, fields: s.fields.map((f) => (f.id === fieldId ? { ...f, enabled: !f.enabled } : f)) }
          : s
      )
    );
  }, []);

  const handleToggleExpand = useCallback((sectionId: string) => {
    setReportSections((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, expanded: !s.expanded } : s))
    );
  }, []);

  const handleScrollToSection = useCallback((sectionId: string) => {
    const element = document.getElementById(`page_${sectionId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setActiveSectionId(sectionId);
  }, []);

  const handleStyleChange = useCallback((styles: Partial<ElementStyles>) => {
    setElementStyles((prev) => ({ ...prev, ...styles }));
  }, []);

  const handleDeleteElement = useCallback(() => {
    // Would implement actual delete logic
    setSelectedElement(null);
  }, []);

  const handleAddTextBlock = useCallback(() => {
    alert('Add Text Block feature - would create a draggable text element');
  }, []);

  return (
    <div className="h-full flex bg-gray-100 -m-8">
      {/* Left Panel: Section Tree */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-bold text-gray-800">Report Pages</h3>
        </div>
        <div className="flex-1 overflow-auto p-4">
          <SectionTree
            sections={reportSections}
            onToggleSection={handleToggleSection}
            onToggleField={handleToggleField}
            onToggleExpand={handleToggleExpand}
            onScrollToSection={handleScrollToSection}
            activeSectionId={activeSectionId}
          />
        </div>
      </div>

      {/* Center Panel: Preview */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="p-4 bg-white border-b border-gray-200 flex items-center justify-between">
          <div className="font-bold text-gray-800">Report Preview</div>
          <button
            onClick={handleAddTextBlock}
            className="px-4 py-2 bg-gradient-to-r from-[#0da1c7] to-[#0890a8] text-white text-sm font-semibold rounded-lg flex items-center gap-2 hover:shadow-md transition-shadow"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Text Block
          </button>
        </div>
        <div ref={previewRef} className="flex-1 overflow-auto p-8 bg-gray-400/30">
          <div className="space-y-8 flex flex-col items-center">
            {reportSections
              .filter((s) => s.enabled)
              .map((section) => (
                <div key={section.id} id={`page_${section.id}`}>
                  <ReportPage
                    section={section}
                    propertyName={propertyName}
                    propertyAddress={propertyAddress}
                    selectedElement={selectedElement}
                    onSelectElement={setSelectedElement}
                  />
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Right Panel: Properties */}
      <div className="w-96 bg-white border-l border-gray-200">
        <PropertiesPanel
          selectedElement={selectedElement}
          elementStyles={elementStyles}
          onStyleChange={handleStyleChange}
          onDeleteElement={handleDeleteElement}
        />
      </div>
    </div>
  );
}

