import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { useWizard } from '../../../context/WizardContext';
import { BASE_REPORT_SECTIONS, APPROACH_REPORT_SECTIONS, CLOSING_REPORT_SECTIONS } from '../constants';
import { sampleAppraisalData } from '../data/sampleAppraisalData';
import type { ReportSection, PropertyTabId, ElementStyles } from '../types';

// =================================================================
// TYPES
// =================================================================

interface TextBlock {
  id: string;
  content: string;
  x: number;
  y: number;
  width: number;
  fontSize: number;
  fontWeight: string;
  color: string;
  pageId: string;
}

interface ElementContent {
  [elementId: string]: {
    text: string;
    styles: ElementStyles;
  };
}

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
    <div className="space-y-1.5">
      {sections.map((section) => (
        <div key={section.id}>
          {/* Section Row - Pill Style */}
          <div
            onClick={() => onToggleSection(section.id)}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg cursor-pointer transition-all ${
              section.enabled
                ? activeSectionId === section.id
                  ? 'bg-[#0da1c7]/15 border-l-4 border-[#0da1c7]'
                  : 'bg-[#0da1c7]/10 border-l-4 border-[#0da1c7]/50 hover:bg-[#0da1c7]/15'
                : 'bg-gray-50 border-l-4 border-transparent opacity-60 hover:opacity-80'
            }`}
          >
            {/* Expand/Collapse Arrow */}
            {section.fields.length > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleExpand(section.id);
                }}
                className={`p-0.5 rounded transition-all ${
                  section.enabled
                    ? 'text-[#0da1c7] hover:bg-[#0da1c7]/20'
                    : 'text-gray-400 hover:bg-gray-200'
                } ${section.expanded ? 'rotate-90' : ''}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
            {section.fields.length === 0 && <div className="w-5" />}

            {/* Section Label */}
            <span
              onClick={(e) => {
                e.stopPropagation();
                if (section.enabled) {
                  onScrollToSection(section.id);
                }
              }}
              className={`flex-1 text-sm transition-colors ${
                section.enabled
                  ? activeSectionId === section.id
                    ? 'text-[#0da1c7] font-semibold'
                    : 'text-gray-800 font-medium'
                  : 'text-gray-400'
              }`}
            >
              {section.label}
            </span>
            
            {/* Enable/Disable indicator */}
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${section.enabled ? 'bg-green-500' : 'bg-gray-300'}`} />
          </div>

          {/* Fields - Dot Indicator Style */}
          {section.expanded && section.fields.length > 0 && (
            <div className="ml-8 mt-1 space-y-0.5 pb-2">
              {section.fields.map((field) => (
                <div
                  key={field.id}
                  onClick={() => onToggleField(section.id, field.id)}
                  className={`flex items-center gap-2.5 px-3 py-1.5 rounded-md cursor-pointer transition-all ${
                    field.enabled
                      ? 'bg-[#0da1c7]/5 hover:bg-[#0da1c7]/10'
                      : 'bg-transparent hover:bg-gray-50'
                  }`}
                >
                  {/* Dot Indicator */}
                  <span
                    className={`w-2 h-2 rounded-full flex-shrink-0 transition-colors ${
                      field.enabled ? 'bg-[#0da1c7]' : 'bg-gray-300'
                    }`}
                  />
                  {/* Field Label */}
                  <span
                    className={`text-xs transition-colors ${
                      field.enabled ? 'text-gray-700' : 'text-gray-400'
                    }`}
                  >
                    {field.label}
                  </span>
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
// PHOTO COMPONENT
// =================================================================

interface PhotoSlotProps {
  photo?: { url: string; caption: string };
  placeholder?: string;
  aspectRatio?: 'square' | '16/9' | '4/3' | 'auto';
  className?: string;
  onSelect?: () => void;
  selected?: boolean;
}

function PhotoSlot({ photo, placeholder, aspectRatio = 'auto', className = '', onSelect, selected }: PhotoSlotProps) {
  const aspectClasses = {
    square: 'aspect-square',
    '16/9': 'aspect-video',
    '4/3': 'aspect-[4/3]',
    auto: '',
  };

  if (photo?.url) {
    return (
      <div 
        className={`relative overflow-hidden rounded-lg ${aspectClasses[aspectRatio]} ${className} ${selected ? 'ring-2 ring-[#0da1c7]' : ''}`}
        onClick={onSelect}
      >
        <img 
          src={photo.url} 
          alt={photo.caption} 
          className="w-full h-full object-cover"
        />
        {photo.caption && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
            <p className="text-white text-xs">{photo.caption}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div 
      className={`bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center rounded-lg ${aspectClasses[aspectRatio]} ${className} ${selected ? 'ring-2 ring-[#0da1c7]' : ''}`}
      onClick={onSelect}
    >
      <div className="text-center text-gray-400 p-4">
        <svg className="w-10 h-10 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="text-xs">{placeholder || 'Click to add photo'}</p>
      </div>
    </div>
  );
}

// =================================================================
// DATA-DRIVEN REPORT PAGE COMPONENTS
// =================================================================

interface ReportPageWrapperProps {
  section: ReportSection;
  pageNumber: number;
  children: React.ReactNode;
  sidebarLabel?: string;
}

function ReportPageWrapper({ section, pageNumber, children, sidebarLabel }: ReportPageWrapperProps) {
  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden" style={{ minHeight: '11in', width: '8.5in' }}>
      <div className="grid grid-cols-[80px_1fr]" style={{ minHeight: '11in' }}>
        {/* Green Sidebar */}
        <div className="bg-emerald-700 text-white flex items-center justify-center relative">
          <span
            className="text-4xl font-bold tracking-widest"
            style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
          >
            {sidebarLabel || section.sectionNumber || ''}
          </span>
        </div>

        {/* Content */}
        <div className="relative">
          {children}
          
          {/* Page Footer */}
          <div className="absolute bottom-4 right-8 text-xs text-gray-400 flex items-center gap-4">
            <span>ROVE Valuations</span>
            <span>|</span>
            <span>Page {pageNumber}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Cover Page with Real Data
function CoverPageReal({ 
  selectedElement, 
  onSelectElement,
  onContentChange,
  editedContent,
}: { 
  selectedElement: string | null; 
  onSelectElement: (id: string) => void;
  onContentChange?: (elementId: string, content: string) => void;
  editedContent?: Record<string, string>;
}) {
  const data = sampleAppraisalData;
  const coverPhoto = data.photos.find(p => p.category === 'cover');
  const handleContentChange = onContentChange || (() => {});
  const getContent = (id: string, defaultVal: string) => editedContent?.[id] ?? defaultVal;

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden" style={{ minHeight: '11in', width: '8.5in' }}>
      <div className="flex flex-col h-full" style={{ minHeight: '11in' }}>
        {/* Header with logo */}
        <div className="p-8 pb-4 flex justify-between items-start">
          <div 
            onClick={() => onSelectElement('cover_logo')}
            className={`cursor-pointer transition-all ${selectedElement === 'cover_logo' ? 'ring-2 ring-[#0da1c7] rounded' : ''}`}
          >
            <div className="text-2xl font-bold text-emerald-700 tracking-tight">ROVE</div>
            <div className="text-sm text-gray-500">VALUATIONS</div>
          </div>
          <div className="text-right text-sm text-gray-500">
            <div>Commercial Appraisal Report</div>
          </div>
        </div>

        {/* Title Section */}
        <div className="px-12 py-6">
          <EditableElement
            elementId="cover_title"
            content={getContent('cover_title', data.property.name)}
            selectedElement={selectedElement}
            onSelectElement={onSelectElement}
            onContentChange={handleContentChange}
            as="h1"
            className="text-4xl font-light text-emerald-700 leading-tight mb-2"
          />
          <EditableElement
            elementId="cover_address"
            content={getContent('cover_address', data.property.fullAddress)}
            selectedElement={selectedElement}
            onSelectElement={onSelectElement}
            onContentChange={handleContentChange}
            as="p"
            className="text-xl text-gray-600"
          />
        </div>

        {/* Cover Photo */}
        <div 
          className="flex-1 mx-8 mb-4"
          onClick={() => onSelectElement('cover_photo')}
        >
          <div className={`h-full rounded-lg overflow-hidden ${selectedElement === 'cover_photo' ? 'ring-2 ring-[#0da1c7]' : ''}`}>
            {coverPhoto ? (
              <img 
                src={coverPhoto.url} 
                alt={coverPhoto.caption}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <svg className="w-16 h-16 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm">Cover Photo</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Info */}
        <div className="bg-emerald-700 text-white px-8 py-6">
          <div className="grid grid-cols-3 gap-6 text-sm">
            <div>
              <div className="text-emerald-200 text-xs uppercase mb-1">Property Type</div>
              <div className="font-medium">{data.property.propertySubtype}</div>
            </div>
            <div>
              <div className="text-emerald-200 text-xs uppercase mb-1">Effective Date</div>
              <div className="font-medium">{data.assignment.effectiveDate}</div>
            </div>
            <div>
              <div className="text-emerald-200 text-xs uppercase mb-1">Final Value</div>
              <div className="font-medium text-lg">${data.valuation.asIsValue.toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Letter of Transmittal Page
function LetterPage({ selectedElement, onSelectElement }: { 
  selectedElement: string | null; 
  onSelectElement: (id: string) => void;
}) {
  const data = sampleAppraisalData;

  return (
    <ReportPageWrapper section={{ id: 'letter', label: 'Letter of Transmittal', enabled: true, expanded: false, fields: [], type: 'letter' }} pageNumber={1}>
      <div className="p-12">
        <div className="mb-8">
          <div className="text-sm text-gray-500 mb-6">{data.assignment.reportDate}</div>
          
          <div 
            onClick={() => onSelectElement('letter_client')}
            className={`mb-6 p-3 -m-3 rounded cursor-pointer ${selectedElement === 'letter_client' ? 'ring-2 ring-[#0da1c7] bg-[#0da1c7]/5' : 'hover:bg-gray-50'}`}
          >
            <div className="font-semibold text-gray-800">{data.assignment.client}</div>
            <div className="text-sm text-gray-600">{data.assignment.clientAddress}</div>
          </div>

          <div className="text-sm text-gray-600 mb-6">
            <span className="font-semibold">RE: </span>
            Appraisal of {data.property.name}
          </div>
        </div>

        <div 
          onClick={() => onSelectElement('letter_body')}
          className={`text-sm text-gray-700 leading-relaxed space-y-4 p-3 -m-3 rounded cursor-pointer ${selectedElement === 'letter_body' ? 'ring-2 ring-[#0da1c7] bg-[#0da1c7]/5' : 'hover:bg-gray-50'}`}
        >
          <p>Dear Client:</p>
          <p>
            At your request, we have prepared an appraisal report on the above referenced property. 
            This is an Appraisal Report that is intended to comply with the reporting requirements 
            set forth under Standards Rule 2-2(a) of the Uniform Standards of Professional Appraisal Practice.
          </p>
          <p>
            <strong>Intended Use:</strong> {data.assignment.intendedUse}
          </p>
          <p>
            <strong>Interest Appraised:</strong> {data.assignment.interestValued}
          </p>
          <p>
            Based on my analysis and subject to the assumptions and limiting conditions in this report, 
            my opinion of the market value of the subject property, as of {data.assignment.effectiveDate}, is:
          </p>
          <div className="text-center py-6 bg-gray-50 rounded-lg my-6">
            <div className="text-sm text-gray-500 uppercase mb-2">Market Value Conclusion</div>
            <div className="text-4xl font-bold text-emerald-700">${data.valuation.asIsValue.toLocaleString()}</div>
          </div>
          <p>Respectfully submitted,</p>
          <div className="mt-8">
            <div className="font-semibold">{data.assignment.appraiser}</div>
            <div className="text-gray-600">{data.assignment.appraiserLicense}</div>
            <div className="text-gray-600">{data.assignment.appraiserCompany}</div>
          </div>
        </div>
      </div>
    </ReportPageWrapper>
  );
}

// Executive Summary Page
function ExecutiveSummaryPage({ selectedElement, onSelectElement }: { 
  selectedElement: string | null; 
  onSelectElement: (id: string) => void;
}) {
  const data = sampleAppraisalData;

  const summaryRows = [
    { label: 'Property Name', value: data.property.name },
    { label: 'Property Address', value: data.property.fullAddress },
    { label: 'Property Type', value: data.property.propertySubtype },
    { label: 'Owner of Record', value: data.property.ownerOfRecord },
    { label: 'Tax ID', value: data.property.taxId },
    { label: 'Land Area', value: `${data.site.landArea} ${data.site.landAreaUnit} (${data.site.landAreaSF.toLocaleString()} SF)` },
    { label: 'Building Area', value: `${data.improvements.grossBuildingArea.toLocaleString()} SF` },
    { label: 'Year Built', value: data.improvements.yearBuilt.toString() },
    { label: 'Zoning', value: `${data.site.zoning} - ${data.site.zoningDescription.split(',')[0]}` },
    { label: 'Flood Zone', value: data.site.floodZone },
    { label: 'Effective Date of Value', value: data.assignment.effectiveDate },
    { label: 'Date of Inspection', value: data.assignment.inspectionDate },
  ];

  const valueRows = [
    { label: 'Land Value', value: `$${data.valuation.landValue.toLocaleString()}` },
    { label: 'Cost Approach', value: `$${data.valuation.costApproachValue.toLocaleString()}` },
    { label: 'Sales Comparison Approach', value: `$${data.valuation.salesComparisonValue.toLocaleString()}` },
    { label: 'Income Approach', value: `$${data.valuation.incomeApproachValue.toLocaleString()}` },
    { label: 'Final "As Is" Market Value', value: `$${data.valuation.asIsValue.toLocaleString()}`, emphasized: true },
    { label: 'Exposure Period', value: data.valuation.exposurePeriod },
  ];

  return (
    <ReportPageWrapper section={{ id: 'summary', label: 'Executive Summary', enabled: true, expanded: false, fields: [], type: 'summary-table' }} pageNumber={2} sidebarLabel="01">
      <div className="p-10">
        {/* Section Badge */}
        <div className="absolute top-6 right-8 bg-emerald-700 text-white px-4 py-2 rounded text-xs font-semibold">
          SECTION 1 • SUMMARY
        </div>

        <h2 className="text-2xl font-light text-gray-800 mb-8 mt-8">Executive Summary</h2>

        {/* Property Summary Table */}
        <div 
          onClick={() => onSelectElement('summary_property')}
          className={`mb-8 p-4 -m-4 rounded cursor-pointer ${selectedElement === 'summary_property' ? 'ring-2 ring-[#0da1c7] bg-[#0da1c7]/5' : 'hover:bg-gray-50'}`}
        >
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Property Identification</h3>
          <table className="w-full text-sm">
            <tbody>
              {summaryRows.map((row, idx) => (
                <tr key={idx} className="border-b border-gray-100">
                  <td className="py-2 pr-4 text-gray-600 w-1/3">{row.label}</td>
                  <td className="py-2 text-gray-800 font-medium">{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Value Summary */}
        <div 
          onClick={() => onSelectElement('summary_values')}
          className={`p-4 -m-4 rounded cursor-pointer ${selectedElement === 'summary_values' ? 'ring-2 ring-[#0da1c7] bg-[#0da1c7]/5' : 'hover:bg-gray-50'}`}
        >
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Value Conclusions</h3>
          <table className="w-full text-sm">
            <tbody>
              {valueRows.map((row, idx) => (
                <tr key={idx} className={`border-b border-gray-100 ${row.emphasized ? 'bg-emerald-50' : ''}`}>
                  <td className={`py-2 pr-4 w-1/2 ${row.emphasized ? 'font-semibold text-emerald-800' : 'text-gray-600'}`}>{row.label}</td>
                  <td className={`py-2 text-right ${row.emphasized ? 'font-bold text-emerald-700 text-xl' : 'text-gray-800 font-medium'}`}>{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </ReportPageWrapper>
  );
}

// Property Description Page with Photos
function PropertyDescriptionPage({ selectedElement, onSelectElement }: { 
  selectedElement: string | null; 
  onSelectElement: (id: string) => void;
}) {
  const data = sampleAppraisalData;
  const exteriorPhotos = data.photos.filter(p => p.category === 'exterior').slice(0, 3);

  return (
    <ReportPageWrapper section={{ id: 'property', label: 'Property Description', enabled: true, expanded: false, fields: [], type: 'narrative' }} pageNumber={3} sidebarLabel="02">
      <div className="p-10">
        <div className="absolute top-6 right-8 bg-emerald-700 text-white px-4 py-2 rounded text-xs font-semibold">
          SECTION 2 • PROPERTY
        </div>

        <h2 className="text-2xl font-light text-gray-800 mb-6 mt-8">Property Description</h2>

        {/* Photos Grid */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {exteriorPhotos.map((photo) => (
            <PhotoSlot
              key={photo.id}
              photo={photo}
              aspectRatio="4/3"
              selected={selectedElement === `photo_${photo.id}`}
              onSelect={() => onSelectElement(`photo_${photo.id}`)}
            />
          ))}
        </div>

        {/* Site Description */}
        <div 
          onClick={() => onSelectElement('property_site')}
          className={`mb-6 p-4 -m-4 rounded cursor-pointer ${selectedElement === 'property_site' ? 'ring-2 ring-[#0da1c7] bg-[#0da1c7]/5' : 'hover:bg-gray-50'}`}
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Site Description</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Land Area:</span>
              <span className="ml-2 text-gray-800">{data.site.landArea} {data.site.landAreaUnit} ({data.site.landAreaSF.toLocaleString()} SF)</span>
            </div>
            <div>
              <span className="text-gray-500">Shape:</span>
              <span className="ml-2 text-gray-800">{data.site.shape}</span>
            </div>
            <div>
              <span className="text-gray-500">Frontage:</span>
              <span className="ml-2 text-gray-800">{data.site.frontage}</span>
            </div>
            <div>
              <span className="text-gray-500">Topography:</span>
              <span className="ml-2 text-gray-800">{data.site.topography}</span>
            </div>
            <div className="col-span-2">
              <span className="text-gray-500">Utilities:</span>
              <span className="ml-2 text-gray-800">{data.site.utilities.join(', ')}</span>
            </div>
          </div>
        </div>

        {/* Improvements */}
        <div 
          onClick={() => onSelectElement('property_improvements')}
          className={`p-4 -m-4 rounded cursor-pointer ${selectedElement === 'property_improvements' ? 'ring-2 ring-[#0da1c7] bg-[#0da1c7]/5' : 'hover:bg-gray-50'}`}
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Improvements</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-gray-500">Year Built:</span><span className="ml-2 text-gray-800">{data.improvements.yearBuilt}</span></div>
            <div><span className="text-gray-500">Building Type:</span><span className="ml-2 text-gray-800">{data.improvements.buildingType}</span></div>
            <div><span className="text-gray-500">Gross Building Area:</span><span className="ml-2 text-gray-800">{data.improvements.grossBuildingArea.toLocaleString()} SF</span></div>
            <div><span className="text-gray-500">Office Area:</span><span className="ml-2 text-gray-800">{data.improvements.officeArea.toLocaleString()} SF</span></div>
            <div><span className="text-gray-500">Shop/Warehouse:</span><span className="ml-2 text-gray-800">{data.improvements.shopArea.toLocaleString()} SF</span></div>
            <div><span className="text-gray-500">Clear Height:</span><span className="ml-2 text-gray-800">{data.improvements.clearHeight} ft</span></div>
            <div><span className="text-gray-500">Overhead Doors:</span><span className="ml-2 text-gray-800">{data.improvements.overheadDoors}</span></div>
            <div><span className="text-gray-500">Construction:</span><span className="ml-2 text-gray-800">{data.improvements.construction}</span></div>
            <div><span className="text-gray-500">Condition:</span><span className="ml-2 text-gray-800">{data.improvements.condition}</span></div>
            <div><span className="text-gray-500">Quality:</span><span className="ml-2 text-gray-800">{data.improvements.quality}</span></div>
          </div>
        </div>
      </div>
    </ReportPageWrapper>
  );
}

// HBU Page
function HBUPage({ selectedElement, onSelectElement, onContentChange, editedContent }: { 
  selectedElement: string | null; 
  onSelectElement: (id: string) => void;
  onContentChange?: (elementId: string, content: string) => void;
  editedContent?: Record<string, string>;
}) {
  const data = sampleAppraisalData;
  const handleContentChange = onContentChange || (() => {});
  const getContent = (id: string, defaultVal: string) => editedContent?.[id] ?? defaultVal;

  return (
    <ReportPageWrapper section={{ id: 'hbu', label: 'Highest & Best Use', enabled: true, expanded: false, fields: [], type: 'narrative' }} pageNumber={4} sidebarLabel="03">
      <div className="p-10">
        <div className="absolute top-6 right-8 bg-emerald-700 text-white px-4 py-2 rounded text-xs font-semibold">
          SECTION 3 • HBU
        </div>

        <h2 className="text-2xl font-light text-gray-800 mb-6 mt-8">Highest and Best Use Analysis</h2>

        <div className="mb-8">
          <h3 className="text-lg font-semibold text-emerald-700 mb-4">As Vacant</h3>
          <div className="space-y-4 text-sm text-gray-700">
            <div>
              <h4 className="font-semibold text-gray-800 mb-1">Legally Permissible</h4>
              <EditableElement
                elementId="hbu_legally_permissible"
                content={getContent('hbu_legally_permissible', data.hbu.asVacant.legallyPermissible)}
                selectedElement={selectedElement}
                onSelectElement={onSelectElement}
                onContentChange={handleContentChange}
                as="p"
                className="text-gray-700"
              />
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-1">Physically Possible</h4>
              <EditableElement
                elementId="hbu_physically_possible"
                content={getContent('hbu_physically_possible', data.hbu.asVacant.physicallyPossible)}
                selectedElement={selectedElement}
                onSelectElement={onSelectElement}
                onContentChange={handleContentChange}
                as="p"
                className="text-gray-700"
              />
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-1">Financially Feasible</h4>
              <EditableElement
                elementId="hbu_financially_feasible"
                content={getContent('hbu_financially_feasible', data.hbu.asVacant.financiallyFeasible)}
                selectedElement={selectedElement}
                onSelectElement={onSelectElement}
                onContentChange={handleContentChange}
                as="p"
                className="text-gray-700"
              />
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-1">Maximally Productive</h4>
              <EditableElement
                elementId="hbu_maximally_productive"
                content={getContent('hbu_maximally_productive', data.hbu.asVacant.maximallyProductive)}
                selectedElement={selectedElement}
                onSelectElement={onSelectElement}
                onContentChange={handleContentChange}
                as="p"
                className="text-gray-700"
              />
            </div>
            <div className="bg-emerald-50 p-4 rounded-lg">
              <h4 className="font-semibold text-emerald-800">Conclusion (As Vacant)</h4>
              <EditableElement
                elementId="hbu_vacant_conclusion"
                content={getContent('hbu_vacant_conclusion', data.hbu.asVacant.conclusion)}
                selectedElement={selectedElement}
                onSelectElement={onSelectElement}
                onContentChange={handleContentChange}
                as="p"
                className="text-emerald-700"
              />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-emerald-700 mb-4">As Improved</h3>
          <div className="space-y-4 text-sm text-gray-700">
            <EditableElement
              elementId="hbu_improved_analysis"
              content={getContent('hbu_improved_analysis', data.hbu.asImproved.analysis)}
              selectedElement={selectedElement}
              onSelectElement={onSelectElement}
              onContentChange={handleContentChange}
              as="p"
              className="text-gray-700"
            />
            <div className="bg-emerald-50 p-4 rounded-lg">
              <h4 className="font-semibold text-emerald-800">Conclusion (As Improved)</h4>
              <EditableElement
                elementId="hbu_improved_conclusion"
                content={getContent('hbu_improved_conclusion', data.hbu.asImproved.conclusion)}
                selectedElement={selectedElement}
                onSelectElement={onSelectElement}
                onContentChange={handleContentChange}
                as="p"
                className="text-emerald-700"
              />
            </div>
          </div>
        </div>
      </div>
    </ReportPageWrapper>
  );
}

// Sales Comparison Page with Photos
function SalesComparisonPage({ selectedElement, onSelectElement }: { 
  selectedElement: string | null; 
  onSelectElement: (id: string) => void;
}) {
  const data = sampleAppraisalData;

  return (
    <ReportPageWrapper section={{ id: 'sales-comparison', label: 'Sales Comparison', enabled: true, expanded: false, fields: [], type: 'analysis-grid' }} pageNumber={5} sidebarLabel="04">
      <div className="p-8">
        <div className="absolute top-6 right-8 bg-emerald-700 text-white px-4 py-2 rounded text-xs font-semibold">
          SECTION 4 • SALES
        </div>

        <h2 className="text-xl font-light text-gray-800 mb-4 mt-8">Sales Comparison Approach</h2>

        <p className="text-sm text-gray-600 mb-6">{data.salesComparison.methodology}</p>

        {/* Comparison Grid */}
        <div 
          onClick={() => onSelectElement('sales_grid')}
          className={`rounded cursor-pointer ${selectedElement === 'sales_grid' ? 'ring-2 ring-[#0da1c7]' : ''}`}
        >
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-slate-800 text-white">
                <th className="px-2 py-2 text-left font-semibold">Element</th>
                <th className="px-2 py-2 text-center font-semibold bg-slate-700">Subject</th>
                {data.comparables.map(comp => (
                  <th key={comp.id} className="px-2 py-2 text-center font-semibold">{comp.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Photo Row */}
              <tr className="border-b border-gray-200">
                <td className="px-2 py-2 font-medium text-gray-700">Photo</td>
                <td className="px-2 py-2 text-center bg-slate-50">
                  <div className="w-20 h-14 mx-auto rounded overflow-hidden">
                    <img src={data.photos[0]?.url} alt="Subject" className="w-full h-full object-cover" />
                  </div>
                </td>
                {data.comparables.map(comp => (
                  <td key={comp.id} className="px-2 py-2 text-center">
                    <div className="w-20 h-14 mx-auto rounded overflow-hidden">
                      <img src={comp.photoUrl} alt={comp.name} className="w-full h-full object-cover" />
                    </div>
                  </td>
                ))}
              </tr>

              {/* Data Rows */}
              <tr className="border-b border-gray-100">
                <td className="px-2 py-1.5 font-medium text-gray-700">Address</td>
                <td className="px-2 py-1.5 text-center bg-slate-50 text-xs">{data.property.address}</td>
                {data.comparables.map(comp => (
                  <td key={comp.id} className="px-2 py-1.5 text-center text-xs">{comp.address}</td>
                ))}
              </tr>
              <tr className="border-b border-gray-100">
                <td className="px-2 py-1.5 font-medium text-gray-700">Sale Date</td>
                <td className="px-2 py-1.5 text-center bg-slate-50">-</td>
                {data.comparables.map(comp => (
                  <td key={comp.id} className="px-2 py-1.5 text-center">{comp.saleDate}</td>
                ))}
              </tr>
              <tr className="border-b border-gray-100">
                <td className="px-2 py-1.5 font-medium text-gray-700">Sale Price</td>
                <td className="px-2 py-1.5 text-center bg-slate-50">-</td>
                {data.comparables.map(comp => (
                  <td key={comp.id} className="px-2 py-1.5 text-center">${comp.salePrice.toLocaleString()}</td>
                ))}
              </tr>
              <tr className="border-b border-gray-100">
                <td className="px-2 py-1.5 font-medium text-gray-700">Building Size</td>
                <td className="px-2 py-1.5 text-center bg-slate-50">{data.improvements.grossBuildingArea.toLocaleString()} SF</td>
                {data.comparables.map(comp => (
                  <td key={comp.id} className="px-2 py-1.5 text-center">{comp.buildingSize.toLocaleString()} SF</td>
                ))}
              </tr>
              <tr className="border-b border-gray-100">
                <td className="px-2 py-1.5 font-medium text-gray-700">Price/SF</td>
                <td className="px-2 py-1.5 text-center bg-slate-50">-</td>
                {data.comparables.map(comp => (
                  <td key={comp.id} className="px-2 py-1.5 text-center">${comp.pricePerSF.toFixed(2)}</td>
                ))}
              </tr>
              <tr className="border-b border-gray-100">
                <td className="px-2 py-1.5 font-medium text-gray-700">Year Built</td>
                <td className="px-2 py-1.5 text-center bg-slate-50">{data.improvements.yearBuilt}</td>
                {data.comparables.map(comp => (
                  <td key={comp.id} className="px-2 py-1.5 text-center">{comp.yearBuilt}</td>
                ))}
              </tr>

              {/* Adjustments */}
              <tr className="bg-slate-100">
                <td colSpan={2 + data.comparables.length} className="px-2 py-1 font-semibold text-xs text-slate-600 uppercase">Adjustments</td>
              </tr>
              {['location', 'size', 'quality', 'age', 'condition'].map(adj => (
                <tr key={adj} className="border-b border-gray-100">
                  <td className="px-2 py-1.5 font-medium text-gray-700 capitalize">{adj}</td>
                  <td className="px-2 py-1.5 text-center bg-slate-50">-</td>
                  {data.comparables.map(comp => {
                    const val = comp.adjustments[adj as keyof typeof comp.adjustments] || 0;
                    return (
                      <td key={comp.id} className="px-2 py-1.5 text-center">
                        {val === 0 ? '-' : (
                          <span className={val > 0 ? 'text-green-600' : 'text-red-600'}>
                            {val > 0 ? '+' : ''}{val}%
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
              <tr className="bg-slate-200 font-semibold">
                <td className="px-2 py-1.5 text-gray-800">Net Adjustment</td>
                <td className="px-2 py-1.5 text-center bg-slate-100">-</td>
                {data.comparables.map(comp => {
                  const total = comp.adjustments.total;
                  return (
                    <td key={comp.id} className="px-2 py-1.5 text-center">
                      <span className={total > 0 ? 'text-green-600' : total < 0 ? 'text-red-600' : ''}>
                        {total > 0 ? '+' : ''}{total}%
                      </span>
                    </td>
                  );
                })}
              </tr>
              <tr className="bg-slate-800 text-white font-semibold">
                <td className="px-2 py-2">Adjusted Price/SF</td>
                <td className="px-2 py-2 text-center bg-slate-700">-</td>
                {data.comparables.map(comp => (
                  <td key={comp.id} className="px-2 py-2 text-center">${comp.adjustedPricePerSF.toFixed(2)}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Value Conclusion */}
        <div className="mt-6 p-4 bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-emerald-800 mb-1">Sales Comparison Value Indication</h4>
              <p className="text-sm text-emerald-700">Based on adjusted price range of ${Math.min(...data.comparables.map(c => c.adjustedPricePerSF)).toFixed(2)} - ${Math.max(...data.comparables.map(c => c.adjustedPricePerSF)).toFixed(2)}/SF</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-emerald-700">${data.valuation.salesComparisonValue.toLocaleString()}</div>
              <div className="text-sm text-emerald-600">${(data.valuation.salesComparisonValue / data.improvements.grossBuildingArea).toFixed(2)}/SF</div>
            </div>
          </div>
        </div>
      </div>
    </ReportPageWrapper>
  );
}

// Income Approach Page
function IncomeApproachPage({ selectedElement, onSelectElement }: { 
  selectedElement: string | null; 
  onSelectElement: (id: string) => void;
}) {
  const data = sampleAppraisalData;

  return (
    <ReportPageWrapper section={{ id: 'income', label: 'Income Approach', enabled: true, expanded: false, fields: [], type: 'analysis-grid' }} pageNumber={6} sidebarLabel="05">
      <div className="p-10">
        <div className="absolute top-6 right-8 bg-emerald-700 text-white px-4 py-2 rounded text-xs font-semibold">
          SECTION 5 • INCOME
        </div>

        <h2 className="text-2xl font-light text-gray-800 mb-4 mt-8">Income Approach</h2>

        <p className="text-sm text-gray-600 mb-6">{data.incomeApproach.methodology}</p>

        <div 
          onClick={() => onSelectElement('income_analysis')}
          className={`p-4 -m-4 rounded cursor-pointer ${selectedElement === 'income_analysis' ? 'ring-2 ring-[#0da1c7] bg-[#0da1c7]/5' : 'hover:bg-gray-50'}`}
        >
          <table className="w-full text-sm">
            <tbody>
              <tr className="border-b border-gray-200">
                <td className="py-2 text-gray-600">Building Area</td>
                <td className="py-2 text-right font-medium">{data.improvements.grossBuildingArea.toLocaleString()} SF</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-2 text-gray-600">Market Rent (per SF)</td>
                <td className="py-2 text-right font-medium">${data.incomeApproach.marketRentPerSF.toFixed(2)}</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-2 text-gray-600 font-semibold">Potential Gross Income</td>
                <td className="py-2 text-right font-semibold">${data.incomeApproach.potentialGrossIncome.toLocaleString()}</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-2 text-gray-600">Less: Vacancy & Collection Loss ({data.incomeApproach.vacancyRate}%)</td>
                <td className="py-2 text-right font-medium text-red-600">-${(data.incomeApproach.potentialGrossIncome * data.incomeApproach.vacancyRate / 100).toLocaleString()}</td>
              </tr>
              <tr className="border-b border-gray-200 bg-gray-50">
                <td className="py-2 text-gray-700 font-semibold">Effective Gross Income</td>
                <td className="py-2 text-right font-semibold">${data.incomeApproach.effectiveGrossIncome.toLocaleString()}</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-2 text-gray-600">Less: Operating Expenses ({data.incomeApproach.expenseRatio}%)</td>
                <td className="py-2 text-right font-medium text-red-600">-${data.incomeApproach.operatingExpenses.toLocaleString()}</td>
              </tr>
              <tr className="bg-emerald-50 border-b-2 border-emerald-300">
                <td className="py-3 text-emerald-800 font-bold">Net Operating Income</td>
                <td className="py-3 text-right font-bold text-emerald-700 text-lg">${data.incomeApproach.netOperatingIncome.toLocaleString()}</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-2 text-gray-600">Capitalization Rate</td>
                <td className="py-2 text-right font-medium">{data.incomeApproach.capRate.toFixed(1)}%</td>
              </tr>
            </tbody>
          </table>

          <div className="mt-6 p-4 bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-lg text-center">
            <div className="text-sm text-emerald-600 mb-1">Income Approach Value Indication</div>
            <div className="text-3xl font-bold text-emerald-700">${data.incomeApproach.valueConclusion.toLocaleString()}</div>
          </div>
        </div>
      </div>
    </ReportPageWrapper>
  );
}

// Cost Approach Page
function CostApproachPage({ selectedElement, onSelectElement }: { 
  selectedElement: string | null; 
  onSelectElement: (id: string) => void;
}) {
  const data = sampleAppraisalData;

  return (
    <ReportPageWrapper section={{ id: 'cost', label: 'Cost Approach', enabled: true, expanded: false, fields: [], type: 'analysis-grid' }} pageNumber={7} sidebarLabel="06">
      <div className="p-10">
        <div className="absolute top-6 right-8 bg-emerald-700 text-white px-4 py-2 rounded text-xs font-semibold">
          SECTION 6 • COST
        </div>

        <h2 className="text-2xl font-light text-gray-800 mb-6 mt-8">Cost Approach</h2>

        <div 
          onClick={() => onSelectElement('cost_analysis')}
          className={`p-4 -m-4 rounded cursor-pointer ${selectedElement === 'cost_analysis' ? 'ring-2 ring-[#0da1c7] bg-[#0da1c7]/5' : 'hover:bg-gray-50'}`}
        >
          <table className="w-full text-sm">
            <tbody>
              <tr className="border-b border-gray-200 bg-gray-50">
                <td className="py-2 text-gray-700 font-semibold">Land Value</td>
                <td className="py-2 text-right font-semibold">${data.costApproach.landValue.toLocaleString()}</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-2 text-gray-600">Building Area</td>
                <td className="py-2 text-right font-medium">{data.improvements.grossBuildingArea.toLocaleString()} SF</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-2 text-gray-600">Replacement Cost New (per SF)</td>
                <td className="py-2 text-right font-medium">${data.costApproach.costPerSF.toFixed(2)}</td>
              </tr>
              <tr className="border-b border-gray-200 bg-gray-50">
                <td className="py-2 text-gray-700 font-semibold">Replacement Cost New</td>
                <td className="py-2 text-right font-semibold">${data.costApproach.replacementCostNew.toLocaleString()}</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-2 text-gray-600">Less: Physical Depreciation</td>
                <td className="py-2 text-right font-medium text-red-600">-${data.costApproach.physicalDepreciation.toLocaleString()}</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-2 text-gray-600">Less: Functional Obsolescence</td>
                <td className="py-2 text-right font-medium text-red-600">-${data.costApproach.functionalObsolescence.toLocaleString()}</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-2 text-gray-600">Less: External Obsolescence</td>
                <td className="py-2 text-right font-medium text-red-600">-${data.costApproach.externalObsolescence.toLocaleString()}</td>
              </tr>
              <tr className="border-b border-gray-200 bg-gray-50">
                <td className="py-2 text-gray-700 font-semibold">Depreciated Cost of Improvements</td>
                <td className="py-2 text-right font-semibold">${data.costApproach.depreciatedCost.toLocaleString()}</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-2 text-gray-600">Plus: Site Improvements</td>
                <td className="py-2 text-right font-medium text-green-600">+${data.costApproach.siteImprovements.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>

          <div className="mt-6 p-4 bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-lg text-center">
            <div className="text-sm text-emerald-600 mb-1">Cost Approach Value Indication</div>
            <div className="text-3xl font-bold text-emerald-700">${data.costApproach.valueConclusion.toLocaleString()}</div>
          </div>
        </div>
      </div>
    </ReportPageWrapper>
  );
}

// Reconciliation Page
function ReconciliationPage({ selectedElement, onSelectElement, onContentChange, editedContent }: { 
  selectedElement: string | null; 
  onSelectElement: (id: string) => void;
  onContentChange?: (elementId: string, content: string) => void;
  editedContent?: Record<string, string>;
}) {
  const data = sampleAppraisalData;
  const handleContentChange = onContentChange || (() => {});
  const getContent = (id: string, defaultVal: string) => editedContent?.[id] ?? defaultVal;

  return (
    <ReportPageWrapper section={{ id: 'reconciliation', label: 'Reconciliation', enabled: true, expanded: false, fields: [], type: 'narrative' }} pageNumber={8} sidebarLabel="07">
      <div className="p-10">
        <div className="absolute top-6 right-8 bg-emerald-700 text-white px-4 py-2 rounded text-xs font-semibold">
          SECTION 7 • VALUE
        </div>

        <h2 className="text-2xl font-light text-gray-800 mb-6 mt-8">Reconciliation of Value</h2>

        <div 
          onClick={() => onSelectElement('recon_approaches')}
          className={`mb-8 p-4 -m-4 rounded cursor-pointer ${selectedElement === 'recon_approaches' ? 'ring-2 ring-[#0da1c7] bg-[#0da1c7]/5' : 'hover:bg-gray-50'}`}
        >
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Value Indications</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-xs text-gray-500 uppercase mb-1">Cost Approach</div>
              <div className="text-xl font-bold text-gray-800">${data.valuation.costApproachValue.toLocaleString()}</div>
              <div className="text-sm text-gray-500 mt-1">Weight: {data.reconciliation.costApproachWeight}%</div>
            </div>
            <div className="bg-emerald-50 rounded-lg p-4 text-center border-2 border-emerald-200">
              <div className="text-xs text-emerald-600 uppercase mb-1">Sales Comparison</div>
              <div className="text-xl font-bold text-emerald-700">${data.valuation.salesComparisonValue.toLocaleString()}</div>
              <div className="text-sm text-emerald-600 mt-1">Weight: {data.reconciliation.salesComparisonWeight}%</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-xs text-gray-500 uppercase mb-1">Income Approach</div>
              <div className="text-xl font-bold text-gray-800">${data.valuation.incomeApproachValue.toLocaleString()}</div>
              <div className="text-sm text-gray-500 mt-1">Weight: {data.reconciliation.incomeApproachWeight}%</div>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Analysis</h3>
          <EditableElement
            elementId="recon_narrative"
            content={getContent('recon_narrative', data.reconciliation.narrative)}
            selectedElement={selectedElement}
            onSelectElement={onSelectElement}
            onContentChange={handleContentChange}
            as="p"
            className="text-sm text-gray-700 leading-relaxed"
          />
        </div>

        <div className="p-6 bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-lg text-center text-white">
          <div className="text-sm uppercase tracking-wider mb-2 opacity-80">Final Market Value Conclusion</div>
          <div className="text-4xl font-bold mb-2">${data.valuation.asIsValue.toLocaleString()}</div>
          <div className="text-sm opacity-80">As of {data.assignment.effectiveDate}</div>
        </div>
      </div>
    </ReportPageWrapper>
  );
}

// Photo Exhibits Page
function PhotoExhibitsPage({ selectedElement, onSelectElement }: { 
  selectedElement: string | null; 
  onSelectElement: (id: string) => void;
}) {
  const data = sampleAppraisalData;
  const photos = data.photos.slice(0, 6);

  return (
    <ReportPageWrapper section={{ id: 'exhibits', label: 'Photo Exhibits', enabled: true, expanded: false, fields: [], type: 'photo-grid' }} pageNumber={9} sidebarLabel="08">
      <div className="p-10">
        <div className="absolute top-6 right-8 bg-emerald-700 text-white px-4 py-2 rounded text-xs font-semibold">
          EXHIBITS
        </div>

        <h2 className="text-2xl font-light text-gray-800 mb-6 mt-8">Subject Property Photos</h2>

        <div className="grid grid-cols-2 gap-4">
          {photos.map((photo) => (
            <PhotoSlot
              key={photo.id}
              photo={photo}
              aspectRatio="4/3"
              selected={selectedElement === `exhibit_${photo.id}`}
              onSelect={() => onSelectElement(`exhibit_${photo.id}`)}
            />
          ))}
        </div>
      </div>
    </ReportPageWrapper>
  );
}

// Table of Contents Page
function TOCPage({ selectedElement, onSelectElement, enabledSections }: { 
  selectedElement: string | null; 
  onSelectElement: (id: string) => void;
  enabledSections: ReportSection[];
}) {
  // Build TOC entries from enabled sections
  const tocEntries = enabledSections
    .filter(s => s.enabled && s.id !== 'cover' && s.id !== 'toc')
    .map((section, idx) => ({
      title: section.label,
      page: idx + 2, // Cover is 1, then content starts
    }));

  return (
    <ReportPageWrapper section={{ id: 'toc', label: 'Table of Contents', enabled: true, expanded: false, fields: [], type: 'toc' }} pageNumber={2} sidebarLabel="">
      <div className="p-12">
        <h2 className="text-3xl font-light text-emerald-700 mb-12 mt-8">Table of Contents</h2>

        <div 
          onClick={() => onSelectElement('toc_entries')}
          className={`space-y-0 p-4 -m-4 rounded cursor-pointer ${selectedElement === 'toc_entries' ? 'ring-2 ring-[#0da1c7] bg-[#0da1c7]/5' : 'hover:bg-gray-50'}`}
        >
          {tocEntries.map((entry, idx) => (
            <div 
              key={idx} 
              className="flex items-baseline border-b border-dotted border-gray-300 py-3 group"
            >
              <span className="text-gray-800 font-medium flex-shrink-0">{entry.title}</span>
              <span className="flex-1 border-b border-dotted border-gray-300 mx-3" style={{ marginBottom: '0.3em' }}></span>
              <span className="text-gray-600 font-mono text-sm flex-shrink-0">{entry.page}</span>
            </div>
          ))}
        </div>

        {/* Photo of Subject */}
        <div className="mt-12">
          <PhotoSlot
            photo={sampleAppraisalData.photos.find(p => p.category === 'aerial')}
            placeholder="Aerial View"
            aspectRatio="16/9"
            selected={selectedElement === 'toc_photo'}
            onSelect={() => onSelectElement('toc_photo')}
          />
        </div>
      </div>
    </ReportPageWrapper>
  );
}

// Assumptions & Limiting Conditions Page
function AssumptionsPage({ selectedElement, onSelectElement }: { 
  selectedElement: string | null; 
  onSelectElement: (id: string) => void;
}) {
  const data = sampleAppraisalData;

  return (
    <ReportPageWrapper section={{ id: 'assumptions', label: 'Assumptions', enabled: true, expanded: false, fields: [], type: 'narrative' }} pageNumber={10} sidebarLabel="09">
      <div className="p-10">
        <div className="absolute top-6 right-8 bg-emerald-700 text-white px-4 py-2 rounded text-xs font-semibold">
          ASSUMPTIONS
        </div>

        <h2 className="text-2xl font-light text-gray-800 mb-6 mt-8">Assumptions and Limiting Conditions</h2>

        {/* Assumptions */}
        <div 
          onClick={() => onSelectElement('assumptions_list')}
          className={`mb-8 p-4 -m-4 rounded cursor-pointer ${selectedElement === 'assumptions_list' ? 'ring-2 ring-[#0da1c7] bg-[#0da1c7]/5' : 'hover:bg-gray-50'}`}
        >
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">General Assumptions</h3>
          <ol className="list-decimal list-outside ml-5 space-y-3 text-sm text-gray-700 leading-relaxed">
            {data.assumptions.map((assumption, idx) => (
              <li key={idx}>{assumption}</li>
            ))}
          </ol>
        </div>

        {/* Limiting Conditions */}
        <div 
          onClick={() => onSelectElement('limiting_conditions')}
          className={`p-4 -m-4 rounded cursor-pointer ${selectedElement === 'limiting_conditions' ? 'ring-2 ring-[#0da1c7] bg-[#0da1c7]/5' : 'hover:bg-gray-50'}`}
        >
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Limiting Conditions</h3>
          <ol className="list-decimal list-outside ml-5 space-y-3 text-sm text-gray-700 leading-relaxed">
            {data.limitingConditions.map((condition, idx) => (
              <li key={idx}>{condition}</li>
            ))}
          </ol>
        </div>
      </div>
    </ReportPageWrapper>
  );
}

// Certification Page
function CertificationPage({ selectedElement, onSelectElement }: { 
  selectedElement: string | null; 
  onSelectElement: (id: string) => void;
}) {
  const data = sampleAppraisalData;

  return (
    <ReportPageWrapper section={{ id: 'certification', label: 'Certification', enabled: true, expanded: false, fields: [], type: 'narrative' }} pageNumber={11} sidebarLabel="10">
      <div className="p-10">
        <div className="absolute top-6 right-8 bg-emerald-700 text-white px-4 py-2 rounded text-xs font-semibold">
          CERTIFICATION
        </div>

        <h2 className="text-2xl font-light text-gray-800 mb-6 mt-8">Appraiser's Certification</h2>

        <div 
          onClick={() => onSelectElement('certification_intro')}
          className={`mb-6 p-4 -m-4 rounded cursor-pointer ${selectedElement === 'certification_intro' ? 'ring-2 ring-[#0da1c7] bg-[#0da1c7]/5' : 'hover:bg-gray-50'}`}
        >
          <p className="text-sm text-gray-700 leading-relaxed">
            I certify that, to the best of my knowledge and belief:
          </p>
        </div>

        {/* Certifications List */}
        <div 
          onClick={() => onSelectElement('certifications_list')}
          className={`mb-8 p-4 -m-4 rounded cursor-pointer ${selectedElement === 'certifications_list' ? 'ring-2 ring-[#0da1c7] bg-[#0da1c7]/5' : 'hover:bg-gray-50'}`}
        >
          <ol className="list-decimal list-outside ml-5 space-y-3 text-sm text-gray-700 leading-relaxed">
            {data.certifications.map((cert, idx) => (
              <li key={idx}>{cert}</li>
            ))}
          </ol>
        </div>

        {/* Signature Block */}
        <div 
          onClick={() => onSelectElement('signature_block')}
          className={`mt-12 p-6 border-2 border-gray-200 rounded-lg ${selectedElement === 'signature_block' ? 'ring-2 ring-[#0da1c7] bg-[#0da1c7]/5' : 'hover:bg-gray-50'}`}
        >
          <div className="grid grid-cols-2 gap-8">
            <div>
              <div className="border-b-2 border-gray-400 pb-2 mb-2 h-16"></div>
              <div className="text-sm font-semibold text-gray-800">{data.assignment.appraiser}</div>
              <div className="text-xs text-gray-600">{data.assignment.appraiserLicense}</div>
              <div className="text-xs text-gray-600 mt-2">Date: {data.assignment.reportDate}</div>
            </div>
            <div>
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-700 mb-2">ROVE</div>
                <div className="text-sm text-gray-600">{data.assignment.appraiserCompany}</div>
                <div className="text-xs text-gray-500 mt-1">{data.assignment.appraiserAddress}</div>
                <div className="text-xs text-gray-500">{data.assignment.appraiserPhone}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ReportPageWrapper>
  );
}

// =================================================================
// EDITABLE ELEMENT WRAPPER - Double-click to edit inline
// =================================================================

interface EditableElementProps {
  elementId: string;
  content: string;
  selectedElement: string | null;
  onSelectElement: (id: string) => void;
  onContentChange: (elementId: string, newContent: string) => void;
  className?: string;
  as?: 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'span' | 'div';
  style?: React.CSSProperties;
}

function EditableElement({
  elementId,
  content,
  selectedElement,
  onSelectElement,
  onContentChange,
  className = '',
  as: Component = 'p',
  style,
}: EditableElementProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [localContent, setLocalContent] = useState(content);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setLocalContent(content);
  }, [content]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (localContent !== content) {
      onContentChange(elementId, localContent);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleBlur();
    }
    if (e.key === 'Escape') {
      setLocalContent(content);
      setIsEditing(false);
    }
  };

  const isSelected = selectedElement === elementId;

  if (isEditing) {
    return (
      <textarea
        ref={inputRef}
        value={localContent}
        onChange={(e) => setLocalContent(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={`w-full border-2 border-[#0da1c7] rounded px-2 py-1 resize-none focus:outline-none focus:ring-2 focus:ring-[#0da1c7]/50 ${className}`}
        style={{ 
          ...style,
          minHeight: '2em',
          height: 'auto',
        }}
        rows={Math.max(1, localContent.split('\n').length)}
      />
    );
  }

  return (
    <Component
      onClick={() => onSelectElement(elementId)}
      onDoubleClick={handleDoubleClick}
      className={`cursor-pointer transition-all rounded px-1 -mx-1 ${
        isSelected
          ? 'ring-2 ring-[#0da1c7] bg-[#0da1c7]/5'
          : 'hover:bg-gray-50'
      } ${className}`}
      style={style}
      title="Click to select, double-click to edit"
    >
      {localContent}
    </Component>
  );
}

// =================================================================
// PROPERTIES PANEL COMPONENT
// =================================================================

interface PropertiesPanelProps {
  selectedElement: string | null;
  elementStyles: ElementStyles;
  elementContent: ElementContent;
  onStyleChange: (styles: Partial<ElementStyles>) => void;
  onContentChange: (elementId: string, content: string) => void;
  onDeleteElement: () => void;
}

function PropertiesPanel({ selectedElement, elementStyles, elementContent, onStyleChange, onContentChange, onDeleteElement }: PropertiesPanelProps) {
  const [activeTab, setActiveTab] = useState<PropertyTabId>('design');
  const [localContent, setLocalContent] = useState('');

  useEffect(() => {
    if (selectedElement && elementContent[selectedElement]) {
      setLocalContent(elementContent[selectedElement].text);
    } else {
      setLocalContent('');
    }
  }, [selectedElement, elementContent]);

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
          <p className="text-sm font-medium mb-2">No Element Selected</p>
          <p className="text-xs opacity-75">Click on any element in the preview to edit its properties</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="text-sm font-bold text-gray-800">Element Properties</div>
        <div className="text-xs text-gray-500 mt-1 font-mono">{selectedElement}</div>
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
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent"
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
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Font Weight</label>
                  <select
                    value={elementStyles.fontWeight || 'normal'}
                    onChange={(e) => onStyleChange({ fontWeight: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent"
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
                    className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent"
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
                    className={`flex-1 py-2 border rounded text-sm capitalize transition-all ${
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
              value={localContent}
              onChange={(e) => setLocalContent(e.target.value)}
              onBlur={() => selectedElement && onContentChange(selectedElement, localContent)}
              placeholder="Edit the content of this element..."
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm min-h-[200px] focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent"
            />
            <button
              onClick={() => selectedElement && onContentChange(selectedElement, localContent)}
              className="mt-3 w-full py-2 bg-[#0da1c7] text-white rounded text-sm font-medium hover:bg-[#0890a8] transition-colors"
            >
              Apply Changes
            </button>
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
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Margin Bottom</label>
                  <input
                    type="number"
                    value={elementStyles.marginBottom || 0}
                    onChange={(e) => onStyleChange({ marginBottom: parseInt(e.target.value) })}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Actions</h4>
              <button
                onClick={onDeleteElement}
                className="w-full py-2 bg-red-600 text-white rounded text-sm font-medium hover:bg-red-700 transition-colors"
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
// DRAGGABLE TEXT BLOCK COMPONENT
// =================================================================

interface DraggableTextBlockProps {
  block: TextBlock;
  selected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<TextBlock>) => void;
  onDelete: () => void;
}

function DraggableTextBlock({ block, selected, onSelect, onUpdate, onDelete }: DraggableTextBlockProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const blockRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isEditing) return;
    e.stopPropagation();
    onSelect();
    setIsDragging(true);
    setDragStart({ x: e.clientX - block.x, y: e.clientY - block.y });
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      onUpdate({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart, onUpdate]);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
  };

  return (
    <div
      ref={blockRef}
      className={`absolute cursor-move ${selected ? 'ring-2 ring-[#0da1c7]' : ''}`}
      style={{
        left: block.x,
        top: block.y,
        width: block.width,
        fontSize: block.fontSize,
        fontWeight: block.fontWeight,
        color: block.color,
      }}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
    >
      {isEditing ? (
        <textarea
          value={block.content}
          onChange={(e) => onUpdate({ content: e.target.value })}
          onBlur={handleBlur}
          autoFocus
          className="w-full p-2 border border-[#0da1c7] rounded resize-none"
          style={{ fontSize: block.fontSize, fontWeight: block.fontWeight, color: block.color }}
        />
      ) : (
        <div className="p-2 bg-white/80 rounded border border-dashed border-gray-300">
          {block.content || 'Double-click to edit'}
        </div>
      )}
      {selected && !isEditing && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="absolute -top-3 -right-3 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600"
        >
          ×
        </button>
      )}
    </div>
  );
}

// =================================================================
// MAIN REPORT EDITOR COMPONENT
// =================================================================

export function ReportEditor() {
  const { state } = useWizard();
  const { scenarios } = state;

  const previewRef = useRef<HTMLDivElement>(null);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [elementStyles, setElementStyles] = useState<ElementStyles>({});
  const [elementContent, setElementContent] = useState<ElementContent>({});
  const [textBlocks, setTextBlocks] = useState<TextBlock[]>([]);

  // Build dynamic sections based on selected approaches
  const sections = useMemo(() => {
    const usedApproaches = new Set<string>();
    scenarios.forEach((s) => s.approaches.forEach((a) => usedApproaches.add(a)));

    const dynamicSections: ReportSection[] = [...BASE_REPORT_SECTIONS];

    Object.entries(APPROACH_REPORT_SECTIONS).forEach(([approach, section]) => {
      if (usedApproaches.has(approach)) {
        dynamicSections.push({ ...section });
      }
    });

    dynamicSections.push(...CLOSING_REPORT_SECTIONS);

    return dynamicSections;
  }, [scenarios]);

  const [reportSections, setReportSections] = useState<ReportSection[]>(sections);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);

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

  const handleContentChange = useCallback((elementId: string, content: string) => {
    setElementContent((prev) => ({
      ...prev,
      [elementId]: {
        text: content,
        styles: prev[elementId]?.styles || {},
      },
    }));
  }, []);

  const handleDeleteElement = useCallback(() => {
    setSelectedElement(null);
  }, []);

  const handleAddTextBlock = useCallback(() => {
    const newBlock: TextBlock = {
      id: `text-block-${Date.now()}`,
      content: 'New text block - double-click to edit',
      x: 100,
      y: 100,
      width: 200,
      fontSize: 14,
      fontWeight: 'normal',
      color: '#1c3643',
      pageId: activeSectionId || 'cover',
    };
    setTextBlocks((prev) => [...prev, newBlock]);
    setSelectedElement(newBlock.id);
  }, [activeSectionId]);

  const handleUpdateTextBlock = useCallback((blockId: string, updates: Partial<TextBlock>) => {
    setTextBlocks((prev) =>
      prev.map((b) => (b.id === blockId ? { ...b, ...updates } : b))
    );
  }, []);

  const handleDeleteTextBlock = useCallback((blockId: string) => {
    setTextBlocks((prev) => prev.filter((b) => b.id !== blockId));
    setSelectedElement(null);
  }, []);

  // Store for edited content (inline editing)
  const [editedContent, setEditedContent] = useState<Record<string, string>>({});

  const handleInlineContentChange = useCallback((elementId: string, content: string) => {
    setEditedContent(prev => ({ ...prev, [elementId]: content }));
    // Also update the elementContent for the properties panel
    handleContentChange(elementId, content);
  }, [handleContentChange]);

  // Render the appropriate page component
  const renderPage = (section: ReportSection, pageIndex: number) => {
    const commonProps = {
      selectedElement,
      onSelectElement: setSelectedElement,
      onContentChange: handleInlineContentChange,
      editedContent,
    };

    switch (section.id) {
      case 'cover':
        return <CoverPageReal {...commonProps} />;
      case 'toc':
        return <TOCPage selectedElement={selectedElement} onSelectElement={setSelectedElement} enabledSections={reportSections} />;
      case 'letter':
        return <LetterPage selectedElement={selectedElement} onSelectElement={setSelectedElement} />;
      case 'executive-summary':
        return <ExecutiveSummaryPage selectedElement={selectedElement} onSelectElement={setSelectedElement} />;
      case 'property-description':
        return <PropertyDescriptionPage selectedElement={selectedElement} onSelectElement={setSelectedElement} />;
      case 'hbu':
        return <HBUPage {...commonProps} />;
      case 'sales-comparison':
        return <SalesComparisonPage selectedElement={selectedElement} onSelectElement={setSelectedElement} />;
      case 'income-approach':
        return <IncomeApproachPage selectedElement={selectedElement} onSelectElement={setSelectedElement} />;
      case 'cost-approach':
        return <CostApproachPage selectedElement={selectedElement} onSelectElement={setSelectedElement} />;
      case 'reconciliation':
        return <ReconciliationPage {...commonProps} />;
      case 'assumptions':
        return <AssumptionsPage selectedElement={selectedElement} onSelectElement={setSelectedElement} />;
      case 'certification':
        return <CertificationPage selectedElement={selectedElement} onSelectElement={setSelectedElement} />;
      case 'exhibits':
        return <PhotoExhibitsPage selectedElement={selectedElement} onSelectElement={setSelectedElement} />;
      default:
        // Generic page for other sections
        return (
          <ReportPageWrapper section={section} pageNumber={pageIndex + 1}>
            <div className="p-10">
              <h2 className="text-2xl font-light text-gray-800 mb-6 mt-8">{section.label}</h2>
              <div className="text-gray-500 text-sm">
                Content for {section.label} will be displayed here based on wizard data.
              </div>
            </div>
          </ReportPageWrapper>
        );
    }
  };

  return (
    <div className="h-full flex bg-gray-100">
      {/* Left Panel: Section Tree */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="font-bold text-gray-800">Report Pages</h3>
          <p className="text-xs text-gray-500 mt-1">Click to toggle • Arrow to expand</p>
        </div>
        <div className="flex-1 overflow-auto py-4 px-4">
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
          <div>
            <div className="font-bold text-gray-800">Report Preview</div>
            <div className="text-xs text-gray-500">{sampleAppraisalData.property.name}</div>
          </div>
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
        <div ref={previewRef} className="flex-1 overflow-auto p-8 bg-gray-400/30 relative">
          <div className="space-y-8 flex flex-col items-center">
            {reportSections
              .filter((s) => s.enabled)
              .map((section, idx) => (
                <div key={section.id} id={`page_${section.id}`} className="relative">
                  {renderPage(section, idx)}
                  {/* Text blocks for this page */}
                  {textBlocks
                    .filter((b) => b.pageId === section.id)
                    .map((block) => (
                      <DraggableTextBlock
                        key={block.id}
                        block={block}
                        selected={selectedElement === block.id}
                        onSelect={() => setSelectedElement(block.id)}
                        onUpdate={(updates) => handleUpdateTextBlock(block.id, updates)}
                        onDelete={() => handleDeleteTextBlock(block.id)}
                      />
                    ))}
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Right Panel: Properties */}
      <div className="w-96 bg-white border-l border-gray-200 flex-shrink-0">
        <PropertiesPanel
          selectedElement={selectedElement}
          elementStyles={elementStyles}
          elementContent={elementContent}
          onStyleChange={handleStyleChange}
          onContentChange={handleContentChange}
          onDeleteElement={handleDeleteElement}
        />
      </div>
    </div>
  );
}
