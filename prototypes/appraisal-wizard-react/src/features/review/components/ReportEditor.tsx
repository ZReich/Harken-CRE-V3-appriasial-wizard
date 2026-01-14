/**
 * ReportEditor - WYSIWYG Report Builder
 * =====================================
 * 
 * This is the main report editor component (~3,500 lines) for building and customizing
 * appraisal reports. It's intentionally large as a page-level orchestrator that
 * coordinates many sub-components and features.
 * 
 * ## Key Features
 * - Drag-and-drop section reordering (dnd-kit)
 * - Inline text editing with WYSIWYG controls
 * - Photo editing and cropping
 * - Live PDF preview integration
 * - Auto-save with undo/redo support
 * - Multiple page layout templates
 * 
 * ## Architecture
 * This file follows the "Orchestrator Pattern" where complex UI coordination
 * logic is co-located for easier reasoning about state and data flow.
 * 
 * ## Section Navigation (search for `// ===`)
 * - TYPES: Local type definitions
 * - SECTION TREE COMPONENT: Drag-drop reordering
 * - COVER PAGE RENDERER: Cover page generation
 * - TEXT BLOCK COMPONENT: Editable text blocks
 * - MAIN EDITOR: Core editing canvas
 * - PDF EXPORT: Export functionality
 * 
 * ## Key Dependencies
 * - useReportState: Report structure management
 * - useAutoSave: Auto-persistence
 * - useUndoRedo: History management
 * - @dnd-kit: Drag-and-drop
 * 
 * @see DEVELOPER_GUIDE.md for architecture decisions
 */

import { useState, useMemo, useRef, useCallback, useEffect, createContext, useContext } from 'react';
import { useWizard } from '../../../context/WizardContext';
import { 
  BASE_REPORT_SECTIONS, 
  APPROACH_REPORT_SECTIONS, 
  CLOSING_REPORT_SECTIONS,
  createScenarioSections,
  createLeaseAbstractionSections,
  ZONING_EXHIBIT_TEMPLATE,
  ENVIRONMENTAL_EXHIBIT_TEMPLATE,
} from '../constants';
import type { ScenarioType } from '../types';
import { sampleAppraisalData } from '../data/sampleAppraisalData';
import type { 
  ReportSection, 
  PropertyTabId, 
  ElementStyles, 
  InlinePhotoPlacement, 
  PhotoSlotConfig,
  ComparableCardsPageData,
  ComparableCardData,
  ComparableMapData,
  DCFProjectionPageData,
} from '../types';
import { useReportState, type ReportState, type ReportStateActions } from '../../report-preview/hooks/useReportState';
import { InlinePhotoGrid } from './InlinePhotoSlot';
import { useAutoSave, useAutoSaveRecovery } from '../../report-preview/hooks/useAutoSave';
import { useUndoRedo } from '../../report-preview/hooks/useUndoRedo';
import { RecoveryDialog } from '../../report-preview/components/dialogs';
import { PhotoEditorDialog, type PhotoData, type PhotoEdits } from './PhotoEditorDialog';
import { PropertiesPanelSimplified } from './PropertiesPanelSimplified';
import { FindReplacePanel, type SearchResult } from './FindReplacePanel';
// Report page components for connected data display
import { RiskRatingPage } from '../../report-preview/components/pages/RiskRatingPage';
import { DemographicsPage, DemographicsOverviewPage, DemographicsDetailPage } from '../../report-preview/components/pages/DemographicsPage';
import { EconomicContextPage } from '../../report-preview/components/pages/EconomicContextPage';
import { SWOTPage } from '../../report-preview/components/pages/SWOTPage';
import { ReportPageBase } from '../../report-preview/components/pages/ReportPageBase';
import { ComparableSummaryCardsPage } from '../../report-preview/components/pages/ComparableSummaryCardsPage';
import { ComparableLocationMapPage } from '../../report-preview/components/pages/ComparableLocationMapPage';
import { DCFProjectionPage } from '../../report-preview/components/pages/DCFProjectionPage';
import { ComparisonGridPage } from '../../report-preview/components/pages/ComparisonGridPage';
import { IncomeGridPage } from '../../report-preview/components/pages/IncomeGridPage';
import { AddendaPage } from './AddendaPage';
// Drag-drop reordering
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
// Animation styles
import './reportEditorAnimations.css';
// Icons for toolbar
import { AlignLeft, AlignCenter, AlignRight, Grid3x3, Square, ZoomIn, ZoomOut, RotateCcw, StickyNote, Search as SearchIcon } from 'lucide-react';

// =================================================================
// TYPES
// =================================================================

interface TextBlock {
  id: string;
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  fontWeight: string;
  color: string;
  pageId: string;
  textAlign?: 'left' | 'center' | 'right';
  showBorder?: boolean;
  borderColor?: string;
  borderWidth?: number;
}

interface ElementContent {
  [elementId: string]: {
    text: string;
    styles: ElementStyles;
  };
}

// =================================================================
// SECTION TREE COMPONENT WITH DRAG-DROP REORDERING
// =================================================================

interface SectionTreeProps {
  sections: ReportSection[];
  onToggleSection: (sectionId: string) => void;
  onToggleField: (sectionId: string, fieldId: string) => void;
  onToggleExpand: (sectionId: string) => void;
  onScrollToSection: (sectionId: string) => void;
  onReorderSections: (oldIndex: number, newIndex: number) => void;
  activeSectionId: string | null;
  sectionNotes?: Record<string, string>;
  onNoteChange?: (sectionId: string, note: string) => void;
  hiddenSections?: Array<{ id: string; label: string; reason: string }>;
}

// Sortable Section Item Component
interface SortableSectionItemProps {
  section: ReportSection;
  onToggleSection: (sectionId: string) => void;
  onToggleField: (sectionId: string, fieldId: string) => void;
  onToggleExpand: (sectionId: string) => void;
  onScrollToSection: (sectionId: string) => void;
  activeSectionId: string | null;
  sectionNote?: string;
  onNoteChange?: (sectionId: string, note: string) => void;
}

function SortableSectionItem({
  section,
  onToggleSection,
  onToggleField,
  onToggleExpand,
  onScrollToSection,
  activeSectionId,
  sectionNote,
  onNoteChange,
}: SortableSectionItemProps) {
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteText, setNoteText] = useState(sectionNote || '');
  const noteInputRef = useRef<HTMLTextAreaElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  // Focus note input when opening
  useEffect(() => {
    if (noteOpen && noteInputRef.current) {
      noteInputRef.current.focus();
    }
  }, [noteOpen]);

  // Sync local note with prop
  useEffect(() => {
    setNoteText(sectionNote || '');
  }, [sectionNote]);

  const handleSaveNote = () => {
    onNoteChange?.(section.id, noteText);
    setNoteOpen(false);
  };

  const handleDeleteNote = () => {
    setNoteText('');
    onNoteChange?.(section.id, '');
    setNoteOpen(false);
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : undefined,
  };

  // Scenario color mapping for multi-scenario reports
  const scenarioColorMap = {
    blue: { bg: '#3b82f6', bgLight: 'rgba(59, 130, 246, 0.1)', bgLighter: 'rgba(59, 130, 246, 0.15)' },
    green: { bg: '#22c55e', bgLight: 'rgba(34, 197, 94, 0.1)', bgLighter: 'rgba(34, 197, 94, 0.15)' },
    purple: { bg: '#a855f7', bgLight: 'rgba(168, 85, 247, 0.1)', bgLighter: 'rgba(168, 85, 247, 0.15)' },
  };

  // Use scenario color if available, otherwise default teal
  const accentColor = section.scenarioColor 
    ? scenarioColorMap[section.scenarioColor].bg 
    : '#0da1c7';
  const bgColor = section.scenarioColor
    ? scenarioColorMap[section.scenarioColor].bgLight
    : 'rgba(13, 161, 199, 0.1)';
  const bgColorActive = section.scenarioColor
    ? scenarioColorMap[section.scenarioColor].bgLighter
    : 'rgba(13, 161, 199, 0.15)';

  // Scenario header sections get special styling
  const isScenarioHeader = section.isScenarioHeader;

  return (
    <div ref={setNodeRef} style={style}>
      {/* Scenario Header - Bold with full background */}
      {isScenarioHeader ? (
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all mt-4 first:mt-0"
          style={{ 
            backgroundColor: accentColor,
            borderLeft: `4px solid ${accentColor}`,
          }}
        >
          <span className="flex-1 text-sm font-bold text-white tracking-wide">
            {section.label}
          </span>
          {/* Scenario indicator dot */}
          <span className="w-2 h-2 rounded-full bg-white/80" />
        </div>
      ) : (
        /* Regular Section Row - Pill Style */
        <div
          className={`flex items-center gap-3 px-4 py-2.5 rounded-lg cursor-pointer transition-all ${
            section.parentSectionId ? 'ml-4' : ''
          }`}
          style={{
            backgroundColor: section.enabled
              ? (activeSectionId === section.id ? bgColorActive : bgColor)
              : '#f1f5f9',
            borderLeft: section.enabled 
              ? `4px solid ${activeSectionId === section.id ? accentColor : accentColor + '80'}`
              : '4px solid transparent',
            opacity: section.enabled ? 1 : 0.6,
          }}
        >
        {/* Drag Handle */}
        <button
          {...attributes}
          {...listeners}
          className="p-1 rounded cursor-grab active:cursor-grabbing transition-all hover:opacity-80"
          style={{
            color: section.enabled ? accentColor + '80' : '#64748b',
          }}
          title="Drag to reorder"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
          </svg>
        </button>

        {/* Expand/Collapse Arrow */}
        {section.fields.length > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand(section.id);
            }}
            className={`p-0.5 rounded transition-all hover:opacity-80 ${section.expanded ? 'rotate-90' : ''}`}
            style={{
              color: section.enabled ? accentColor : '#64748b',
            }}
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
          className="flex-1 text-sm transition-colors"
          style={{
            color: section.enabled
              ? (activeSectionId === section.id ? accentColor : '#1e293b')
              : '#64748b',
            fontWeight: section.enabled ? (activeSectionId === section.id ? 600 : 500) : 400,
          }}
        >
          {section.label}
        </span>

        {/* Note icon */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setNoteOpen(!noteOpen);
            }}
            className={`p-1 rounded transition-colors ${
              sectionNote ? 'text-amber-500 hover:bg-amber-50' : 'text-slate-300 hover:text-slate-400 hover:bg-slate-50'
            }`}
            title={sectionNote ? 'View note' : 'Add note'}
          >
            <StickyNote size={14} className={sectionNote ? 'fill-amber-100' : ''} />
          </button>
          
          {/* Note Popover */}
          {noteOpen && (
            <div 
              className="absolute right-0 top-8 z-50 w-64 bg-white rounded-lg shadow-xl border border-slate-200 p-3"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-600">Section Note</span>
                <button
                  onClick={() => setNoteOpen(false)}
                  className="p-1 hover:bg-slate-100 rounded text-slate-400"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <textarea
                ref={noteInputRef}
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Add a note for this section..."
                style={{ color: '#0f172a', backgroundColor: '#ffffff' }}
                className="w-full h-20 text-xs p-2 border border-slate-200 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-[#0da1c7]/30 focus:border-[#0da1c7]"
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleSaveNote}
                  className="flex-1 px-3 py-1.5 text-xs font-semibold bg-[#0da1c7] text-white rounded-md hover:bg-[#0da1c7]/90 transition-colors"
                >
                  Save
                </button>
                {sectionNote && (
                  <button
                    onClick={handleDeleteNote}
                    className="px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 rounded-md transition-colors"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Enable/Disable toggle */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleSection(section.id);
          }}
          style={{ backgroundColor: section.enabled ? accentColor : '#94a3b8' }}
          className="w-2 h-2 rounded-full flex-shrink-0 transition-colors hover:opacity-80"
          title={section.enabled ? 'Click to disable section' : 'Click to enable section'}
        />
      </div>
      )}

      {/* Fields - Dot Indicator Style (not for scenario headers) */}
      {!isScenarioHeader && section.expanded && section.fields.length > 0 && (
        <div className={`mt-1 space-y-0.5 pb-2 ${section.parentSectionId ? 'ml-16' : 'ml-12'}`}>
          {section.fields.map((field) => (
            <div
              key={field.id}
              onClick={() => onToggleField(section.id, field.id)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-md cursor-pointer transition-all"
              style={{
                backgroundColor: field.enabled ? bgColor : 'transparent',
              }}
            >
              {/* Dot Indicator */}
              <span
                style={{ backgroundColor: field.enabled ? accentColor : '#94a3b8' }}
                className="w-2 h-2 rounded-full flex-shrink-0 transition-colors"
              />
              {/* Field Label */}
              <span
                className={`text-xs transition-colors ${field.enabled ? 'text-slate-600' : 'text-slate-500'
                  }`}
              >
                {field.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SectionTree({
  sections,
  onToggleSection,
  onToggleField,
  onToggleExpand,
  onScrollToSection,
  onReorderSections,
  activeSectionId,
  sectionNotes,
  onNoteChange,
  hiddenSections,
}: SectionTreeProps) {
  const [hiddenExpanded, setHiddenExpanded] = useState(false);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = sections.findIndex((s) => s.id === active.id);
      const newIndex = sections.findIndex((s) => s.id === over.id);
      onReorderSections(oldIndex, newIndex);
    }
  };

  return (
    <div className="space-y-2">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-1.5">
            {sections.map((section) => (
              <SortableSectionItem
                key={section.id}
                section={section}
                onToggleSection={onToggleSection}
                onToggleField={onToggleField}
                onToggleExpand={onToggleExpand}
                onScrollToSection={onScrollToSection}
                activeSectionId={activeSectionId}
                sectionNote={sectionNotes?.[section.id]}
                onNoteChange={onNoteChange}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Hidden Sections Indicator */}
      {hiddenSections && hiddenSections.length > 0 && (
        <div className="border-t border-slate-200 pt-3 mt-3">
          <button
            onClick={() => setHiddenExpanded(!hiddenExpanded)}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors"
          >
            <svg 
              className={`w-4 h-4 transition-transform ${hiddenExpanded ? 'rotate-90' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-xs font-semibold">
              Hidden Sections ({hiddenSections.length})
            </span>
          </button>
          
          {hiddenExpanded && (
            <div className="mt-2 space-y-1 pl-4">
              {hiddenSections.map((section) => (
                <div 
                  key={section.id}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-500"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span className="font-medium text-slate-600">{section.label}</span>
                  <span className="text-slate-400">—</span>
                  <span className="text-slate-400 italic">{section.reason}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// =================================================================
// PHOTO COMPONENT
// =================================================================

interface PhotoSlotProps {
  photo?: { id?: string; url: string; caption: string };
  placeholder?: string;
  aspectRatio?: 'square' | '16/9' | '4/3' | 'auto';
  className?: string;
  onSelect?: () => void;
  onDoubleClick?: () => void;
  selected?: boolean;
  edits?: {
    rotation?: number;
    flipH?: boolean;
    flipV?: boolean;
    caption?: string;
  };
}

function PhotoSlot({ photo, placeholder, aspectRatio = 'auto', className = '', onSelect, onDoubleClick, selected, edits }: PhotoSlotProps) {
  const aspectClasses = {
    square: 'aspect-square',
    '16/9': 'aspect-video',
    '4/3': 'aspect-[4/3]',
    auto: '',
  };

  // Apply edits transform
  const transformStyle: React.CSSProperties = edits ? {
    transform: `rotate(${edits.rotation || 0}deg) scaleX(${edits.flipH ? -1 : 1}) scaleY(${edits.flipV ? -1 : 1})`,
  } : {};

  // Use edited caption if available
  const displayCaption = edits?.caption ?? photo?.caption;

  if (photo?.url) {
    return (
      <div
        className={`relative overflow-hidden rounded-lg cursor-pointer group ${aspectClasses[aspectRatio]} ${className} ${selected ? 'ring-2 ring-[#0da1c7]' : ''}`}
        onClick={onSelect}
        onDoubleClick={onDoubleClick}
      >
        <img
          src={photo.url}
          alt={displayCaption || ''}
          className="w-full h-full object-cover transition-transform"
          style={transformStyle}
        />
        {displayCaption && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
            <p className="text-white text-xs">{displayCaption}</p>
          </div>
        )}
        {/* Double-click hint */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
          <span className="text-white text-xs bg-black/50 px-2 py-1 rounded">Double-click to edit</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center rounded-lg cursor-pointer ${aspectClasses[aspectRatio]} ${className} ${selected ? 'ring-2 ring-[#0da1c7]' : ''}`}
      onClick={onSelect}
      onDoubleClick={onDoubleClick}
    >
      <div className="text-center text-slate-500 p-4">
        <svg className="w-10 h-10 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="text-xs">{placeholder || 'Double-click to add photo'}</p>
      </div>
    </div>
  );
}

// =================================================================
// DATA-DRIVEN REPORT PAGE COMPONENTS
// =================================================================

// Grid Context for sharing grid settings across all pages
interface GridContextType {
  showGrid: boolean;
  gridSize: number;
}

const GridContext = createContext<GridContextType>({ showGrid: false, gridSize: 16 });

interface ReportPageWrapperProps {
  section: ReportSection;
  pageNumber: number;
  children: React.ReactNode;
  sidebarLabel?: string;
}

function ReportPageWrapper({ section, pageNumber, children, sidebarLabel }: ReportPageWrapperProps) {
  const { showGrid, gridSize } = useContext(GridContext);
  
  return (
    <div className="shadow-lg rounded-lg overflow-hidden" style={{ minHeight: '11in', width: '8.5in', backgroundColor: '#ffffff' }}>
      <div className="grid grid-cols-[80px_1fr]" style={{ minHeight: '11in' }}>
        {/* Green Sidebar */}
        <div className="bg-[#0da1c7] text-white flex items-center justify-center relative">
          <span
            className="text-4xl font-bold tracking-widest"
            style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
          >
            {sidebarLabel || section.sectionNumber || ''}
          </span>
        </div>

        {/* Content */}
        <div className="relative">
          {/* Per-Page Grid Overlay */}
          {showGrid && (
            <div 
              className="absolute inset-0 pointer-events-none z-30"
              style={{
                backgroundImage: `
                  linear-gradient(to right, rgba(13,161,199,0.12) 1px, transparent 1px),
                  linear-gradient(to bottom, rgba(13,161,199,0.12) 1px, transparent 1px)
                `,
                backgroundSize: `${gridSize}px ${gridSize}px`,
              }}
            />
          )}
          {children}

          {/* Page Footer */}
          <div className="absolute bottom-4 right-8 text-xs text-slate-500 flex items-center gap-4">
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
  getAppliedStyle,
  subjectData,
  reconciliationData,
  coverPhoto: coverPhotoData,
  fieldVisibility,
}: {
  selectedElement: string | null;
  onSelectElement: (id: string) => void;
  onContentChange?: (elementId: string, content: string) => void;
  editedContent?: Record<string, string>;
  getAppliedStyle?: (elementId: string) => React.CSSProperties;
  subjectData?: import('../../../types').SubjectData;
  reconciliationData?: import('../../../types').ReconciliationData | null;
  coverPhoto?: import('../../../types').CoverPhotoData;
  fieldVisibility?: Record<string, boolean>;
}) {
  const fallbackData = sampleAppraisalData;
  const coverPhoto = coverPhotoData?.preview ? { url: coverPhotoData.preview, caption: coverPhotoData.caption || 'Cover Photo' } : fallbackData.photos.find(p => p.category === 'cover');
  const handleContentChange = onContentChange || (() => { });
  const getContent = (id: string, defaultVal: string) => editedContent?.[id] ?? defaultVal;
  const getStyle = (id: string) => getAppliedStyle?.(id) || {};
  
  // Field visibility helper - returns true if field is visible (defaults to true if not set)
  const isVisible = (fieldId: string) => fieldVisibility?.[fieldId] !== false;

  // Use wizard state or fall back to sample data
  const propertyName = subjectData?.propertyName || fallbackData.property.name;
  const fullAddress = subjectData?.address ?
    `${subjectData.address.street}, ${subjectData.address.city}, ${subjectData.address.state} ${subjectData.address.zip}` :
    fallbackData.property.fullAddress;
  const effectiveDate = subjectData?.effectiveDate || fallbackData.assignment.effectiveDate;

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden" style={{ minHeight: '11in', width: '8.5in' }}>
      <div className="flex flex-col h-full" style={{ minHeight: '11in' }}>
        {/* Header with logo */}
        <div className="p-8 pb-4 flex justify-between items-start">
          <div
            onClick={() => onSelectElement('cover_logo')}
            className={`cursor-pointer transition-all ${selectedElement === 'cover_logo' ? 'ring-2 ring-[#0da1c7] rounded' : ''}`}
          >
            <div className="text-2xl font-bold text-[#0da1c7] tracking-tight">ROVE</div>
            <div className="text-sm text-slate-500">VALUATIONS</div>
          </div>
          <div className="text-right text-sm text-slate-500">
            <div>Commercial Appraisal Report</div>
          </div>
        </div>

        {/* Title Section - conditionally rendered */}
        <div className="px-12 py-6">
          {isVisible('cover_title') && (
            <EditableElement
              elementId="cover_title"
              content={getContent('cover_title', propertyName)}
              selectedElement={selectedElement}
              onSelectElement={onSelectElement}
              onContentChange={handleContentChange}
              as="h1"
              className="text-4xl font-light text-[#0da1c7] leading-tight mb-2"
              appliedStyle={getStyle('cover_title')}
            />
          )}
          {isVisible('cover_address') && (
            <EditableElement
              elementId="cover_address"
              content={getContent('cover_address', fullAddress)}
              selectedElement={selectedElement}
              onSelectElement={onSelectElement}
              onContentChange={handleContentChange}
              as="p"
              className="text-xl text-slate-600"
              appliedStyle={getStyle('cover_address')}
            />
          )}
        </div>

        {/* Cover Photo - conditionally rendered */}
        {isVisible('cover_image') && (
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
                <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                  <div className="text-center text-slate-500">
                    <svg className="w-16 h-16 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm">Cover Photo</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer Info - conditionally rendered */}
        {isVisible('cover_footer') && (
          <div className="bg-[#0da1c7] text-white px-8 py-6">
            <div className="grid grid-cols-3 gap-6 text-sm">
              <div>
                <div className="text-[#0da1c7]-light text-xs uppercase mb-1">Property Type</div>
                <div className="font-medium">{fallbackData.property.propertySubtype}</div>
              </div>
              <div>
                <div className="text-[#0da1c7]-light text-xs uppercase mb-1">Effective Date</div>
                <div className="font-medium">{effectiveDate}</div>
              </div>
              <div>
                <div className="text-[#0da1c7]-light text-xs uppercase mb-1">Final Value</div>
                <div className="font-medium text-lg">${fallbackData.valuation.asIsValue.toLocaleString()}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Letter of Transmittal Page
function LetterPage({ selectedElement, onSelectElement, onContentChange, editedContent, getAppliedStyle, subjectData, fieldVisibility, pageNumber }: {
  selectedElement: string | null;
  onSelectElement: (id: string) => void;
  onContentChange?: (elementId: string, content: string) => void;
  editedContent?: Record<string, string>;
  getAppliedStyle?: (elementId: string) => React.CSSProperties;
  subjectData?: import('../../../types').SubjectData;
  fieldVisibility?: Record<string, boolean>;
  pageNumber?: number;
}) {
  const fallbackData = sampleAppraisalData;
  const handleContentChange = onContentChange || (() => { });
  const getContent = (id: string, defaultVal: string) => editedContent?.[id] ?? defaultVal;
  const getStyle = (id: string) => getAppliedStyle?.(id) || {};
  
  // Field visibility helper
  const isVisible = (fieldId: string) => fieldVisibility?.[fieldId] !== false;

  // Use wizard state or fall back to sample data
  const propertyName = subjectData?.propertyName || fallbackData.property.name;
  const effectiveDate = subjectData?.effectiveDate || fallbackData.assignment.effectiveDate;
  const reportDate = subjectData?.reportDate || fallbackData.assignment.reportDate;

  return (
    <ReportPageWrapper section={{ id: 'letter', label: 'Letter of Transmittal', enabled: true, expanded: false, fields: [], type: 'letter' }} pageNumber={pageNumber ?? 1}>
      <div className="p-12">
        {/* Client Information - conditionally rendered */}
        {isVisible('letter_client') && (
          <div className="mb-8">
            <div className="text-sm text-slate-500 mb-6">{reportDate}</div>

            <div className="mb-6">
              <EditableElement
                elementId="letter_client"
                content={getContent('letter_client', fallbackData.assignment.client)}
                selectedElement={selectedElement}
                onSelectElement={onSelectElement}
                onContentChange={handleContentChange}
                as="div"
                className="font-semibold text-slate-800"
                appliedStyle={getStyle('letter_client')}
              />
              <EditableElement
                elementId="letter_client_address"
                content={getContent('letter_client_address', fallbackData.assignment.clientAddress)}
                selectedElement={selectedElement}
                onSelectElement={onSelectElement}
                onContentChange={handleContentChange}
                as="div"
                className="text-sm text-slate-600"
                appliedStyle={getStyle('letter_client_address')}
              />
            </div>

            <div className="text-sm text-slate-600 mb-6">
              <span className="font-semibold">RE: </span>
              Appraisal of {propertyName}
            </div>
          </div>
        )}

        {/* Letter Body - conditionally rendered */}
        {isVisible('letter_body') && (
          <div className="text-sm text-slate-600 leading-relaxed space-y-4">
            <EditableElement
              elementId="letter_greeting"
              content={getContent('letter_greeting', 'Dear Client:')}
              selectedElement={selectedElement}
              onSelectElement={onSelectElement}
              onContentChange={handleContentChange}
              as="p"
              appliedStyle={getStyle('letter_greeting')}
            />
            <EditableElement
              elementId="letter_intro"
              content={getContent('letter_intro', `At your request, we have prepared an appraisal report on the above referenced property. This is an Appraisal Report that is intended to comply with the reporting requirements set forth under Standards Rule 2-2(a) of the Uniform Standards of Professional Appraisal Practice.`)}
              selectedElement={selectedElement}
              onSelectElement={onSelectElement}
              onContentChange={handleContentChange}
              as="p"
              appliedStyle={getStyle('letter_intro')}
            />
            <p>
              <strong>Intended Use:</strong> {subjectData?.appraisalPurpose || fallbackData.assignment.intendedUse}
            </p>
            <p>
              <strong>Interest Appraised:</strong> {subjectData?.propertyInterest || fallbackData.assignment.interestValued}
            </p>
            <EditableElement
              elementId="letter_conclusion_intro"
              content={getContent('letter_conclusion_intro', `Based on my analysis and subject to the assumptions and limiting conditions in this report, my opinion of the market value of the subject property, as of ${effectiveDate}, is:`)}
              selectedElement={selectedElement}
              onSelectElement={onSelectElement}
              onContentChange={handleContentChange}
              as="p"
              appliedStyle={getStyle('letter_conclusion_intro')}
            />
          </div>
        )}

        {/* Value Conclusion - conditionally rendered */}
        {isVisible('letter_value') && (
          <div className="text-center py-6 bg-slate-100 rounded-lg my-6">
            <div className="text-sm text-slate-500 uppercase mb-2">Market Value Conclusion</div>
            <div className="text-4xl font-bold text-[#0da1c7]">${fallbackData.valuation.asIsValue.toLocaleString()}</div>
          </div>
        )}

        {/* Signature - conditionally rendered */}
        {isVisible('letter_signature') && (
          <div className="text-sm text-slate-600 leading-relaxed">
            <p>Respectfully submitted,</p>
            <div className="mt-8">
              <div className="font-semibold">{subjectData?.inspectorName || fallbackData.assignment.appraiser}</div>
              <div className="text-slate-600">{subjectData?.inspectorLicense || fallbackData.assignment.appraiserLicense}</div>
              <div className="text-slate-600">{fallbackData.assignment.appraiserCompany}</div>
            </div>
          </div>
        )}
      </div>
    </ReportPageWrapper>
  );
}

// Executive Summary Page
function ExecutiveSummaryPage({ selectedElement, onSelectElement, subjectData, improvementsInventory, reconciliationData, fieldVisibility, pageNumber }: {
  selectedElement: string | null;
  onSelectElement: (id: string) => void;
  onContentChange?: (elementId: string, content: string) => void;
  editedContent?: Record<string, string>;
  getAppliedStyle?: (elementId: string) => React.CSSProperties;
  subjectData?: import('../../../types').SubjectData;
  improvementsInventory?: import('../../../types').ImprovementsInventory;
  reconciliationData?: import('../../../types').ReconciliationData | null;
  fieldVisibility?: Record<string, boolean>;
  pageNumber?: number;
}) {
  const fallbackData = sampleAppraisalData;
  
  // Field visibility helper
  const isVisible = (fieldId: string) => fieldVisibility?.[fieldId] !== false;

  // Use wizard state or fall back to sample data
  const propertyName = subjectData?.propertyName || fallbackData.property.name;
  const fullAddress = subjectData?.address ?
    `${subjectData.address.street}, ${subjectData.address.city}, ${subjectData.address.state} ${subjectData.address.zip}` :
    fallbackData.property.fullAddress;
  const taxId = subjectData?.taxId || fallbackData.property.taxId;
  const landArea = subjectData?.siteArea || fallbackData.site.landArea;
  const landAreaUnit = subjectData?.siteAreaUnit === 'sqft' ? 'SF' : (subjectData?.siteAreaUnit || fallbackData.site.landAreaUnit);
  const primaryBuilding = improvementsInventory?.parcels?.[0]?.buildings?.[0];
  const buildingArea = primaryBuilding?.areas?.reduce((sum, area) => sum + (area.squareFootage || 0), 0) || fallbackData.improvements.grossBuildingArea;
  const yearBuilt = primaryBuilding?.yearBuilt || fallbackData.improvements.yearBuilt;
  const zoning = subjectData?.zoningClass || fallbackData.site.zoning;
  const zoningDesc = subjectData?.zoningDescription?.split(',')[0] || fallbackData.site.zoningDescription.split(',')[0];
  const floodZone = subjectData?.femaZone || fallbackData.site.floodZone;
  const effectiveDate = subjectData?.effectiveDate || fallbackData.assignment.effectiveDate;
  const inspectionDate = subjectData?.inspectionDate || fallbackData.assignment.inspectionDate;
  const exposurePeriod = reconciliationData?.exposurePeriod ? `${reconciliationData.exposurePeriod} months` : fallbackData.valuation.exposurePeriod;

  const summaryRows = [
    { label: 'Property Name', value: propertyName },
    { label: 'Property Address', value: fullAddress },
    { label: 'Property Type', value: fallbackData.property.propertySubtype },
    { label: 'Owner of Record', value: fallbackData.property.ownerOfRecord },
    { label: 'Tax ID', value: taxId },
    { label: 'Land Area', value: `${landArea} ${landAreaUnit}` },
    { label: 'Building Area', value: `${typeof buildingArea === 'number' ? buildingArea.toLocaleString() : buildingArea} SF` },
    { label: 'Year Built', value: String(yearBuilt || 'N/A') },
    { label: 'Zoning', value: `${zoning} - ${zoningDesc}` },
    { label: 'Flood Zone', value: floodZone },
    { label: 'Effective Date of Value', value: effectiveDate },
    { label: 'Date of Inspection', value: inspectionDate },
  ];

  const valueRows = [
    { label: 'Land Value', value: `$${fallbackData.valuation.landValue.toLocaleString()}` },
    { label: 'Cost Approach', value: `$${fallbackData.valuation.costApproachValue.toLocaleString()}` },
    { label: 'Sales Comparison Approach', value: `$${fallbackData.valuation.salesComparisonValue.toLocaleString()}` },
    { label: 'Income Approach', value: `$${fallbackData.valuation.incomeApproachValue.toLocaleString()}` },
    { label: 'Final "As Is" Market Value', value: `$${fallbackData.valuation.asIsValue.toLocaleString()}`, emphasized: true },
    { label: 'Exposure Period', value: exposurePeriod },
  ];

  return (
    <ReportPageWrapper section={{ id: 'summary', label: 'Executive Summary', enabled: true, expanded: false, fields: [], type: 'summary-table' }} pageNumber={pageNumber ?? 2} sidebarLabel="01">
      <div className="p-10">
        {/* Section Badge */}
        <div className="absolute top-6 right-8 bg-[#0da1c7] text-white px-4 py-2 rounded text-xs font-semibold">
          SECTION 1 • SUMMARY
        </div>

        <h2 className="text-2xl font-light text-slate-800 mb-8 mt-8">Executive Summary</h2>

        {/* Property Summary Table - conditionally rendered */}
        {isVisible('exec_property') && (
          <div
            onClick={() => onSelectElement('summary_property')}
            className={`mb-8 p-4 -m-4 rounded cursor-pointer ${selectedElement === 'summary_property' ? 'ring-2 ring-[#0da1c7] bg-[#0da1c7]/5' : 'hover:bg-slate-100'}`}
          >
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Property Identification</h3>
            <table className="w-full text-sm">
              <tbody>
                {summaryRows.map((row, idx) => (
                  <tr key={idx} className="border-b border-slate-400-light">
                    <td className="py-2 pr-4 text-slate-600 w-1/3">{row.label}</td>
                    <td className="py-2 text-slate-800 font-medium">{row.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Value Summary - conditionally rendered */}
        {isVisible('exec_values') && (
          <div
            onClick={() => onSelectElement('summary_values')}
            className={`p-4 -m-4 rounded cursor-pointer ${selectedElement === 'summary_values' ? 'ring-2 ring-[#0da1c7] bg-[#0da1c7]/5' : 'hover:bg-slate-100'}`}
          >
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Value Conclusions</h3>
            <table className="w-full text-sm">
              <tbody>
                {valueRows.map((row, idx) => (
                  <tr key={idx} className={`border-b border-slate-400-light ${row.emphasized ? 'bg-[#0da1c7]/10' : ''}`}>
                    <td className={`py-2 pr-4 w-1/2 ${row.emphasized ? 'font-semibold text-[#0da1c7]' : 'text-slate-600'}`}>{row.label}</td>
                    <td className={`py-2 text-right ${row.emphasized ? 'font-bold text-[#0da1c7] text-xl' : 'text-slate-800 font-medium'}`}>{row.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Key Dates - conditionally rendered */}
        {isVisible('exec_dates') && (
          <div className="mt-6 text-sm text-slate-500">
            <span>Effective Date: {effectiveDate}</span>
            <span className="mx-2">|</span>
            <span>Inspection: {inspectionDate}</span>
          </div>
        )}
      </div>
    </ReportPageWrapper>
  );
}

// Property Description Page with Photos
function PropertyDescriptionPage({ 
  selectedElement, 
  onSelectElement, 
  onContentChange, 
  editedContent, 
  getAppliedStyle, 
  subjectData, 
  improvementsInventory, 
  fieldVisibility,
  pageNumber,
  // Inline photo placement props
  photoSlots,
  photoPlacements,
  availablePhotos,
  onAssignPhoto,
  onRemovePhoto,
  onOpenPhotoEditor,
  getPhotoEdits,
}: {
  selectedElement: string | null;
  onSelectElement: (id: string) => void;
  onContentChange?: (elementId: string, content: string) => void;
  editedContent?: Record<string, string>;
  getAppliedStyle?: (elementId: string) => React.CSSProperties;
  subjectData?: import('../../../types').SubjectData;
  improvementsInventory?: import('../../../types').ImprovementsInventory;
  fieldVisibility?: Record<string, boolean>;
  pageNumber?: number;
  // Inline photo placement props
  photoSlots?: PhotoSlotConfig[];
  photoPlacements?: InlinePhotoPlacement[];
  availablePhotos?: PhotoData[];
  onAssignPhoto?: (slotId: string, photoId: string) => void;
  onRemovePhoto?: (slotId: string) => void;
  onOpenPhotoEditor?: (photo: PhotoData) => void;
  getPhotoEdits?: (photoId: string) => PhotoEdits | undefined;
}) {
  const fallbackData = sampleAppraisalData;
  const exteriorPhotos = fallbackData.photos.filter(p => p.category === 'exterior').slice(0, 3);
  
  // Check if we have inline photo configuration
  const hasInlinePhotos = photoSlots && photoSlots.length > 0 && availablePhotos;
  const handleContentChange = onContentChange || (() => { });
  const getContent = (id: string, defaultVal: string) => editedContent?.[id] ?? defaultVal;
  const getStyle = (id: string) => getAppliedStyle?.(id) || {};
  
  // Field visibility helper
  const isVisible = (fieldId: string) => fieldVisibility?.[fieldId] !== false;

  // Get site data from wizard state or fall back to sample
  const siteArea = subjectData?.siteArea || fallbackData.site.landArea;
  const siteAreaUnit = subjectData?.siteAreaUnit === 'sqft' ? 'SF' : (subjectData?.siteAreaUnit || fallbackData.site.landAreaUnit);
  const shape = subjectData?.shape || fallbackData.site.shape;
  const frontage = subjectData?.frontage || fallbackData.site.frontage;
  const topography = subjectData?.topography || fallbackData.site.topography;
  const utilities = [
    subjectData?.waterSource,
    subjectData?.sewerType,
    subjectData?.electricProvider,
    subjectData?.naturalGas,
    subjectData?.telecom
  ].filter(Boolean).join(', ') || fallbackData.site.utilities.join(', ');
  const siteNarrative = subjectData?.siteDescriptionNarrative || '';

  // Area/neighborhood narratives from wizard state
  const areaDescription = subjectData?.areaDescription || '';
  const neighborhoodCharacteristics = subjectData?.neighborhoodCharacteristics || '';

  // Get improvements data from wizard state or fall back to sample
  const primaryBuilding = improvementsInventory?.parcels?.[0]?.buildings?.[0];
  const yearBuilt = primaryBuilding?.yearBuilt || fallbackData.improvements.yearBuilt;
  const buildingType = primaryBuilding?.name || fallbackData.improvements.buildingType;
  // Sum all areas in the building to get gross building area
  const grossBuildingArea = primaryBuilding?.areas?.reduce((sum, area) => sum + (area.squareFootage || 0), 0) || fallbackData.improvements.grossBuildingArea;
  const construction = primaryBuilding?.constructionType || fallbackData.improvements.construction;
  const condition = primaryBuilding?.condition || fallbackData.improvements.condition;
  const quality = primaryBuilding?.constructionQuality || fallbackData.improvements.quality;

  return (
    <ReportPageWrapper section={{ id: 'property', label: 'Property Description', enabled: true, expanded: false, fields: [], type: 'narrative' }} pageNumber={pageNumber ?? 3} sidebarLabel="02">
      <div className="p-6">
        <div className="absolute top-4 right-6 bg-[#0da1c7] text-white px-3 py-1.5 rounded text-xs font-semibold">
          SECTION 2 • PROPERTY
        </div>

        <h2 className="text-xl font-light text-slate-800 mb-4 mt-6">Property Description</h2>

        {/* Area/Neighborhood Description */}
        {(areaDescription || neighborhoodCharacteristics) && (
          <div
            onClick={() => onSelectElement('property_area')}
            className={`mb-4 p-3 -m-3 rounded cursor-pointer ${selectedElement === 'property_area' ? 'ring-2 ring-[#0da1c7] bg-[#0da1c7]/5' : 'hover:bg-slate-100'}`}
          >
            <h3 className="text-sm font-semibold text-slate-800 mb-2">Area & Neighborhood</h3>
            {areaDescription && (
              <EditableElement
                elementId="property_area_description"
                content={getContent('property_area_description', areaDescription)}
                selectedElement={selectedElement}
                onSelectElement={onSelectElement}
                onContentChange={handleContentChange}
                as="p"
                className="text-slate-600 text-xs leading-relaxed mb-2"
                appliedStyle={getStyle('property_area_description')}
              />
            )}
            {neighborhoodCharacteristics && (
              <EditableElement
                elementId="property_neighborhood"
                content={getContent('property_neighborhood', neighborhoodCharacteristics)}
                selectedElement={selectedElement}
                onSelectElement={onSelectElement}
                onContentChange={handleContentChange}
                as="p"
                className="text-slate-600 text-xs leading-relaxed"
                appliedStyle={getStyle('property_neighborhood')}
              />
            )}
          </div>
        )}

        {/* Inline Photos - Header Position */}
        {hasInlinePhotos && photoSlots && availablePhotos && (
          <div className="mb-4">
            <InlinePhotoGrid
              slots={photoSlots}
              placements={photoPlacements || []}
              availablePhotos={availablePhotos}
              onAssign={onAssignPhoto || (() => {})}
              onRemove={onRemovePhoto || (() => {})}
              onOpenEditor={onOpenPhotoEditor}
              getPhotoEdits={getPhotoEdits}
              position="header"
              columns={2}
            />
          </div>
        )}

        {/* Legacy Photos Grid - conditionally rendered when no inline photo config */}
        {!hasInlinePhotos && isVisible('prop_photos') && (
          <div className="grid grid-cols-3 gap-3 mb-4">
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
        )}

        {/* Site Description - conditionally rendered */}
        {isVisible('prop_site') && (
          <div
            onClick={() => onSelectElement('property_site')}
            className={`mb-4 p-3 -m-3 rounded cursor-pointer ${selectedElement === 'property_site' ? 'ring-2 ring-[#0da1c7] bg-[#0da1c7]/5' : 'hover:bg-slate-100'}`}
          >
            <h3 className="text-sm font-semibold text-slate-800 mb-2">Site Description</h3>
            <div className="grid grid-cols-2 gap-2 text-xs mb-3">
              <div>
                <span className="text-slate-500">Land Area:</span>
                <span className="ml-2 text-slate-800">{siteArea} {siteAreaUnit}</span>
              </div>
              <div>
                <span className="text-slate-500">Shape:</span>
                <span className="ml-2 text-slate-800">{shape}</span>
              </div>
              <div>
                <span className="text-slate-500">Frontage:</span>
                <span className="ml-2 text-slate-800">{frontage}</span>
              </div>
              <div>
                <span className="text-slate-500">Topography:</span>
                <span className="ml-2 text-slate-800">{topography}</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-500">Utilities:</span>
                <span className="ml-2 text-slate-800">{utilities}</span>
              </div>
            </div>
            {/* Site Description Narrative */}
            {siteNarrative && (
              <EditableElement
                elementId="property_site_narrative"
                content={getContent('property_site_narrative', siteNarrative)}
                selectedElement={selectedElement}
                onSelectElement={onSelectElement}
                onContentChange={handleContentChange}
                as="p"
                className="text-slate-600 text-xs leading-relaxed mt-2"
                appliedStyle={getStyle('property_site_narrative')}
              />
            )}
          </div>
        )}

        {/* Improvements - conditionally rendered */}
        {isVisible('prop_improvements') && (
          <div
            onClick={() => onSelectElement('property_improvements')}
            className={`p-3 -m-3 rounded cursor-pointer ${selectedElement === 'property_improvements' ? 'ring-2 ring-[#0da1c7] bg-[#0da1c7]/5' : 'hover:bg-slate-100'}`}
          >
            <h3 className="text-sm font-semibold text-slate-800 mb-2">Improvements</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div><span className="text-slate-500">Year Built:</span><span className="ml-2 text-slate-800">{yearBuilt}</span></div>
              <div><span className="text-slate-500">Building Type:</span><span className="ml-2 text-slate-800">{buildingType}</span></div>
              <div><span className="text-slate-500">Gross Building Area:</span><span className="ml-2 text-slate-800">{typeof grossBuildingArea === 'number' ? grossBuildingArea.toLocaleString() : grossBuildingArea} SF</span></div>
              <div><span className="text-slate-500">Construction:</span><span className="ml-2 text-slate-800">{construction}</span></div>
              <div><span className="text-slate-500">Condition:</span><span className="ml-2 text-slate-800">{condition}</span></div>
              <div><span className="text-slate-500">Quality:</span><span className="ml-2 text-slate-800">{quality}</span></div>
            </div>
          </div>
        )}

        {/* Inline Photos - Interior/Detail Position */}
        {hasInlinePhotos && photoSlots && availablePhotos && (
          <div className="mt-4">
            <h3 className="text-sm font-semibold text-slate-800 mb-2">Interior & Detail Photos</h3>
            <InlinePhotoGrid
              slots={photoSlots}
              placements={photoPlacements || []}
              availablePhotos={availablePhotos}
              onAssign={onAssignPhoto || (() => {})}
              onRemove={onRemovePhoto || (() => {})}
              onOpenEditor={onOpenPhotoEditor}
              getPhotoEdits={getPhotoEdits}
              position="inline"
              columns={2}
            />
          </div>
        )}
      </div>
    </ReportPageWrapper>
  );
}

// HBU Page
function HBUPage({ selectedElement, onSelectElement, onContentChange, editedContent, getAppliedStyle, hbuAnalysis, fieldVisibility, pageNumber }: {
  selectedElement: string | null;
  onSelectElement: (id: string) => void;
  onContentChange?: (elementId: string, content: string) => void;
  editedContent?: Record<string, string>;
  getAppliedStyle?: (elementId: string) => React.CSSProperties;
  hbuAnalysis?: import('../../../types').HBUAnalysis;
  fieldVisibility?: Record<string, boolean>;
  pageNumber?: number;
}) {
  const fallbackData = sampleAppraisalData;
  const handleContentChange = onContentChange || (() => { });
  const getContent = (id: string, defaultVal: string) => editedContent?.[id] ?? defaultVal;
  const getStyle = (id: string) => getAppliedStyle?.(id) || {};
  
  // Field visibility helper
  const isVisible = (fieldId: string) => fieldVisibility?.[fieldId] !== false;

  // Use wizard state HBU data or fall back to sample data
  const asVacant = {
    legallyPermissible: hbuAnalysis?.asVacant?.legallyPermissible || fallbackData.hbu.asVacant.legallyPermissible,
    physicallyPossible: hbuAnalysis?.asVacant?.physicallyPossible || fallbackData.hbu.asVacant.physicallyPossible,
    financiallyFeasible: hbuAnalysis?.asVacant?.financiallyFeasible || fallbackData.hbu.asVacant.financiallyFeasible,
    maximallyProductive: hbuAnalysis?.asVacant?.maximallyProductive || fallbackData.hbu.asVacant.maximallyProductive,
    conclusion: hbuAnalysis?.asVacant?.conclusion || fallbackData.hbu.asVacant.conclusion,
  };
  const asImproved = {
    // The wizard stores the full as-improved analysis in the conclusion field
    analysis: hbuAnalysis?.asImproved?.conclusion || fallbackData.hbu.asImproved.analysis,
    conclusion: hbuAnalysis?.asImproved?.conclusion || fallbackData.hbu.asImproved.conclusion,
  };

  return (
    <ReportPageWrapper section={{ id: 'hbu', label: 'Highest & Best Use', enabled: true, expanded: false, fields: [], type: 'narrative' }} pageNumber={pageNumber ?? 4} sidebarLabel="03">
      <div className="p-10">
        <div className="absolute top-6 right-8 bg-[#0da1c7] text-white px-4 py-2 rounded text-xs font-semibold">
          SECTION 3 • HBU
        </div>

        <h2 className="text-2xl font-light text-slate-800 mb-6 mt-8">Highest and Best Use Analysis</h2>

        <div className="mb-8">
          <h3 className="text-lg font-semibold text-[#0da1c7] mb-4">As Vacant</h3>
          <div className="space-y-4 text-sm text-slate-600">
            <div>
              <h4 className="font-semibold text-slate-800 mb-1">Legally Permissible</h4>
              <EditableElement
                elementId="hbu_legally_permissible"
                content={getContent('hbu_legally_permissible', asVacant.legallyPermissible)}
                selectedElement={selectedElement}
                onSelectElement={onSelectElement}
                onContentChange={handleContentChange}
                as="p"
                className="text-slate-600"
                appliedStyle={getStyle('hbu_legally_permissible')}
              />
            </div>
            <div>
              <h4 className="font-semibold text-slate-800 mb-1">Physically Possible</h4>
              <EditableElement
                elementId="hbu_physically_possible"
                content={getContent('hbu_physically_possible', asVacant.physicallyPossible)}
                selectedElement={selectedElement}
                onSelectElement={onSelectElement}
                onContentChange={handleContentChange}
                as="p"
                className="text-slate-600"
                appliedStyle={getStyle('hbu_physically_possible')}
              />
            </div>
            <div>
              <h4 className="font-semibold text-slate-800 mb-1">Financially Feasible</h4>
              <EditableElement
                elementId="hbu_financially_feasible"
                content={getContent('hbu_financially_feasible', asVacant.financiallyFeasible)}
                selectedElement={selectedElement}
                onSelectElement={onSelectElement}
                onContentChange={handleContentChange}
                as="p"
                className="text-slate-600"
                appliedStyle={getStyle('hbu_financially_feasible')}
              />
            </div>
            <div>
              <h4 className="font-semibold text-slate-800 mb-1">Maximally Productive</h4>
              <EditableElement
                elementId="hbu_maximally_productive"
                content={getContent('hbu_maximally_productive', asVacant.maximallyProductive)}
                selectedElement={selectedElement}
                onSelectElement={onSelectElement}
                onContentChange={handleContentChange}
                as="p"
                className="text-slate-600"
                appliedStyle={getStyle('hbu_maximally_productive')}
              />
            </div>
            <div className="bg-[#0da1c7]/10 p-4 rounded-lg">
              <h4 className="font-semibold text-[#0da1c7]">Conclusion (As Vacant)</h4>
              <EditableElement
                elementId="hbu_vacant_conclusion"
                content={getContent('hbu_vacant_conclusion', asVacant.conclusion)}
                selectedElement={selectedElement}
                onSelectElement={onSelectElement}
                onContentChange={handleContentChange}
                as="p"
                className="text-[#0da1c7]"
                appliedStyle={getStyle('hbu_vacant_conclusion')}
              />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-[#0da1c7] mb-4">As Improved</h3>
          <div className="space-y-4 text-sm text-slate-600">
            <EditableElement
              elementId="hbu_improved_analysis"
              content={getContent('hbu_improved_analysis', asImproved.analysis)}
              selectedElement={selectedElement}
              onSelectElement={onSelectElement}
              onContentChange={handleContentChange}
              as="p"
              className="text-slate-600"
              appliedStyle={getStyle('hbu_improved_analysis')}
            />
            <div className="bg-[#0da1c7]/10 p-4 rounded-lg">
              <h4 className="font-semibold text-[#0da1c7]">Conclusion (As Improved)</h4>
              <EditableElement
                elementId="hbu_improved_conclusion"
                content={getContent('hbu_improved_conclusion', asImproved.conclusion)}
                selectedElement={selectedElement}
                onSelectElement={onSelectElement}
                onContentChange={handleContentChange}
                as="p"
                className="text-[#0da1c7]"
                appliedStyle={getStyle('hbu_improved_conclusion')}
              />
            </div>
          </div>
        </div>
      </div>
    </ReportPageWrapper>
  );
}

// Market Analysis Page
function MarketAnalysisPage({ selectedElement, onSelectElement, onContentChange, editedContent, getAppliedStyle, marketAnalysis, fieldVisibility, pageNumber }: {
  selectedElement: string | null;
  onSelectElement: (id: string) => void;
  onContentChange?: (elementId: string, content: string) => void;
  editedContent?: Record<string, string>;
  getAppliedStyle?: (elementId: string) => React.CSSProperties;
  marketAnalysis?: import('../../../types').MarketAnalysisData;
  fieldVisibility?: Record<string, boolean>;
  pageNumber?: number;
}) {
  const handleContentChange = onContentChange || (() => { });
  const getContent = (id: string, defaultVal: string) => editedContent?.[id] ?? defaultVal;
  const getStyle = (id: string) => getAppliedStyle?.(id) || {};
  
  // Field visibility helper (for future use)
  const isVisible = (fieldId: string) => fieldVisibility?.[fieldId] !== false;

  const defaultMarketCycle = 'The current market cycle is in an expansion phase, characterized by increasing demand, rising prices, and active development activity in the subject\'s market area.';
  const defaultSupplyDemand = 'The local market demonstrates balanced supply and demand conditions. Current vacancy rates of approximately 4.8% are below historical averages, indicating healthy absorption of available space.';
  const defaultMarketTrends = 'Market trends show consistent year-over-year growth in transaction volume and pricing. Average sale prices have increased 8-12% annually over the past three years, reflecting strong investor confidence and sustained demand.';

  // Use wizard state market data or fall back to defaults
  const vacancyRate = marketAnalysis?.supplyMetrics?.vacancyRate ?? 4.8;
  const avgRent = marketAnalysis?.demandMetrics?.averageRent ?? 0;
  const rentGrowth = marketAnalysis?.demandMetrics?.rentGrowth ?? 0;
  const marketNarrative = marketAnalysis?.narrative || '';
  const marketTrendLabel = marketAnalysis?.marketTrends?.overallTrend === 'improving' ? 'Improving' :
    marketAnalysis?.marketTrends?.overallTrend === 'declining' ? 'Declining' : 'Stable';

  return (
    <ReportPageWrapper section={{ id: 'market-analysis', label: 'Market Analysis', enabled: true, expanded: false, fields: [], type: 'narrative' }} pageNumber={pageNumber ?? 5} sidebarLabel="02C">
      <div className="p-10">
        <div className="absolute top-6 right-8 bg-[#0da1c7] text-white px-4 py-2 rounded text-xs font-semibold">
          SECTION 2C • MARKET
        </div>

        <h2 className="text-2xl font-light text-slate-800 mb-6 mt-8">Market Analysis</h2>

        <div className="space-y-6 text-sm text-slate-600">
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-3">Market Cycle Stage</h3>
            <EditableElement
              elementId="market_cycle"
              content={getContent('market_cycle', defaultMarketCycle)}
              selectedElement={selectedElement}
              onSelectElement={onSelectElement}
              onContentChange={handleContentChange}
              as="p"
              className="text-slate-600"
              appliedStyle={getStyle('market_cycle')}
            />
          </div>

          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-3">Supply & Demand</h3>
            <EditableElement
              elementId="market_supply_demand"
              content={getContent('market_supply_demand', defaultSupplyDemand)}
              selectedElement={selectedElement}
              onSelectElement={onSelectElement}
              onContentChange={handleContentChange}
              as="p"
              className="text-slate-600"
              appliedStyle={getStyle('market_supply_demand')}
            />
          </div>

          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-3">Market Trends</h3>
            <EditableElement
              elementId="market_trends"
              content={getContent('market_trends', defaultMarketTrends)}
              selectedElement={selectedElement}
              onSelectElement={onSelectElement}
              onContentChange={handleContentChange}
              as="p"
              className="text-slate-600"
              appliedStyle={getStyle('market_trends')}
            />
          </div>

          {/* Market Narrative from Wizard */}
          {marketNarrative && (
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-3">Market Outlook & Analysis</h3>
              <EditableElement
                elementId="market_narrative"
                content={getContent('market_narrative', marketNarrative)}
                selectedElement={selectedElement}
                onSelectElement={onSelectElement}
                onContentChange={handleContentChange}
                as="p"
                className="text-slate-600"
                appliedStyle={getStyle('market_narrative')}
              />
            </div>
          )}

          {/* Market Data Summary */}
          <div className="mt-8 p-6 bg-gradient-to-r from-accent-amber-gold-light to-accent-amber-gold-light rounded-lg border border-accent-amber-gold">
            <h3 className="text-lg font-semibold text-amber-900 mb-4">Market Data Summary</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-accent-amber-gold font-medium mb-1">Vacancy Rate</div>
                <div className="text-2xl font-bold text-amber-800">{vacancyRate.toFixed(1)}%</div>
              </div>
              <div>
                <div className="text-accent-amber-gold font-medium mb-1">Market Trend</div>
                <div className="text-2xl font-bold text-amber-800">{marketTrendLabel}</div>
              </div>
              {avgRent > 0 && (
                <div>
                  <div className="text-accent-amber-gold font-medium mb-1">Avg. Rent</div>
                  <div className="text-2xl font-bold text-amber-800">${avgRent.toFixed(2)}/SF</div>
                </div>
              )}
              {rentGrowth !== 0 && (
                <div>
                  <div className="text-accent-amber-gold font-medium mb-1">Rent Growth</div>
                  <div className="text-2xl font-bold text-amber-800">{rentGrowth > 0 ? '+' : ''}{rentGrowth.toFixed(1)}%</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ReportPageWrapper>
  );
}

// Sales Comparison Page with Photos
function SalesComparisonPage({ selectedElement, onSelectElement, onContentChange, editedContent, getAppliedStyle, salesComparisonData, pageNumber }: {
  selectedElement: string | null;
  onSelectElement: (id: string) => void;
  onContentChange?: (elementId: string, content: string) => void;
  editedContent?: Record<string, string>;
  getAppliedStyle?: (elementId: string) => React.CSSProperties;
  salesComparisonData?: import('../../../types').SalesComparisonData;
  pageNumber?: number;
}) {
  const data = sampleAppraisalData;
  const handleContentChange = onContentChange || (() => { });
  const getContent = (id: string, defaultVal: string) => editedContent?.[id] ?? defaultVal;
  const getStyle = (id: string) => getAppliedStyle?.(id) || {};

  // Get narrative from wizard state
  const reconciliationNarrative = salesComparisonData?.reconciliationText || '';
  const concludedValue = salesComparisonData?.concludedValue;

  return (
    <ReportPageWrapper section={{ id: 'sales-comparison', label: 'Sales Comparison', enabled: true, expanded: false, fields: [], type: 'analysis-grid' }} pageNumber={pageNumber ?? 5} sidebarLabel="04">
      <div className="p-8">
        <div className="absolute top-6 right-8 bg-[#0da1c7] text-white px-4 py-2 rounded text-xs font-semibold">
          SECTION 4 • SALES
        </div>

        <h2 className="text-xl font-light text-slate-800 mb-4 mt-8">Sales Comparison Approach</h2>

        <p className="text-sm text-slate-600 mb-6">{data.salesComparison.methodology}</p>

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
              <tr className="border-b border-slate-200">
                <td className="px-2 py-2 font-medium text-slate-600">Photo</td>
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
              <tr className="border-b border-slate-400-light">
                <td className="px-2 py-1.5 font-medium text-slate-600">Address</td>
                <td className="px-2 py-1.5 text-center bg-slate-50 text-xs text-slate-800">{data.property.address}</td>
                {data.comparables.map(comp => (
                  <td key={comp.id} className="px-2 py-1.5 text-center text-xs text-slate-800">{comp.address}</td>
                ))}
              </tr>
              <tr className="border-b border-slate-400-light">
                <td className="px-2 py-1.5 font-medium text-slate-600">Sale Date</td>
                <td className="px-2 py-1.5 text-center bg-slate-50 text-slate-500">-</td>
                {data.comparables.map(comp => (
                  <td key={comp.id} className="px-2 py-1.5 text-center text-slate-800">{comp.saleDate}</td>
                ))}
              </tr>
              <tr className="border-b border-slate-400-light">
                <td className="px-2 py-1.5 font-medium text-slate-600">Sale Price</td>
                <td className="px-2 py-1.5 text-center bg-slate-50 text-slate-500">-</td>
                {data.comparables.map(comp => (
                  <td key={comp.id} className="px-2 py-1.5 text-center text-slate-800">${comp.salePrice.toLocaleString()}</td>
                ))}
              </tr>
              <tr className="border-b border-slate-400-light">
                <td className="px-2 py-1.5 font-medium text-slate-600">Building Size</td>
                <td className="px-2 py-1.5 text-center bg-slate-50 text-slate-800">{data.improvements.grossBuildingArea.toLocaleString()} SF</td>
                {data.comparables.map(comp => (
                  <td key={comp.id} className="px-2 py-1.5 text-center text-slate-800">{comp.buildingSize.toLocaleString()} SF</td>
                ))}
              </tr>
              <tr className="border-b border-slate-400-light">
                <td className="px-2 py-1.5 font-medium text-slate-600">Price/SF</td>
                <td className="px-2 py-1.5 text-center bg-slate-50 text-slate-500">-</td>
                {data.comparables.map(comp => (
                  <td key={comp.id} className="px-2 py-1.5 text-center text-slate-800">${comp.pricePerSF.toFixed(2)}</td>
                ))}
              </tr>
              <tr className="border-b border-slate-400-light">
                <td className="px-2 py-1.5 font-medium text-slate-600">Year Built</td>
                <td className="px-2 py-1.5 text-center bg-slate-50 text-slate-800">{data.improvements.yearBuilt}</td>
                {data.comparables.map(comp => (
                  <td key={comp.id} className="px-2 py-1.5 text-center text-slate-800">{comp.yearBuilt}</td>
                ))}
              </tr>

              {/* Adjustments */}
              <tr className="bg-slate-100">
                <td colSpan={2 + data.comparables.length} className="px-2 py-1 font-semibold text-xs text-slate-600 uppercase">Adjustments</td>
              </tr>
              {['location', 'size', 'quality', 'age', 'condition'].map(adj => (
                <tr key={adj} className="border-b border-slate-400-light">
                  <td className="px-2 py-1.5 font-medium text-slate-600 capitalize">{adj}</td>
                  <td className="px-2 py-1.5 text-center bg-slate-50 text-slate-500">-</td>
                  {data.comparables.map(comp => {
                    const val = comp.adjustments[adj as keyof typeof comp.adjustments] || 0;
                    return (
                      <td key={comp.id} className="px-2 py-1.5 text-center">
                        {val === 0 ? <span className="text-slate-500">-</span> : (
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
                <td className="px-2 py-1.5 text-slate-800">Net Adjustment</td>
                <td className="px-2 py-1.5 text-center bg-slate-100 text-slate-500">-</td>
                {data.comparables.map(comp => {
                  const total = comp.adjustments.total;
                  return (
                    <td key={comp.id} className="px-2 py-1.5 text-center">
                      <span className={total > 0 ? 'text-green-600' : total < 0 ? 'text-red-600' : 'text-slate-800'}>
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

        {/* Sales Comparison Reconciliation Narrative */}
        {reconciliationNarrative && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-3">Sales Comparison Analysis</h3>
            <EditableElement
              elementId="sales_reconciliation_narrative"
              content={getContent('sales_reconciliation_narrative', reconciliationNarrative)}
              selectedElement={selectedElement}
              onSelectElement={onSelectElement}
              onContentChange={handleContentChange}
              as="p"
              className="text-slate-600 text-sm leading-relaxed"
              appliedStyle={getStyle('sales_reconciliation_narrative')}
            />
          </div>
        )}

        {/* Value Conclusion */}
        <div className="mt-6 p-4 bg-gradient-to-r from-[#0da1c7]/10 to-[#0da1c7]/10 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-[#0da1c7] mb-1">Sales Comparison Value Indication</h4>
              <p className="text-sm text-[#0da1c7]">Based on adjusted price range of ${Math.min(...data.comparables.map(c => c.adjustedPricePerSF)).toFixed(2)} - ${Math.max(...data.comparables.map(c => c.adjustedPricePerSF)).toFixed(2)}/SF</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-[#0da1c7]">${(concludedValue ?? data.valuation.salesComparisonValue).toLocaleString()}</div>
              <div className="text-sm text-[#0da1c7]">${((concludedValue ?? data.valuation.salesComparisonValue) / data.improvements.grossBuildingArea).toFixed(2)}/SF</div>
            </div>
          </div>
        </div>
      </div>
    </ReportPageWrapper>
  );
}

// Income Approach Page
function IncomeApproachPage({ selectedElement, onSelectElement, onContentChange, editedContent, getAppliedStyle, incomeApproachData, pageNumber }: {
  selectedElement: string | null;
  onSelectElement: (id: string) => void;
  onContentChange?: (elementId: string, content: string) => void;
  editedContent?: Record<string, string>;
  getAppliedStyle?: (elementId: string) => React.CSSProperties;
  incomeApproachData?: import('../../../features/income-approach/types').IncomeApproachState | null;
  pageNumber?: number;
}) {
  const data = sampleAppraisalData;
  const handleContentChange = onContentChange || (() => { });
  const getContent = (id: string, defaultVal: string) => editedContent?.[id] ?? defaultVal;
  const getStyle = (id: string) => getAppliedStyle?.(id) || {};

  // Get narratives from wizard state
  const rentCompNotes = incomeApproachData?.rentCompNotes || '';
  const expenseCompNotes = incomeApproachData?.expenseCompNotes || '';

  return (
    <ReportPageWrapper section={{ id: 'income', label: 'Income Approach', enabled: true, expanded: false, fields: [], type: 'analysis-grid' }} pageNumber={pageNumber ?? 6} sidebarLabel="05">
      <div className="p-10">
        <div className="absolute top-6 right-8 bg-[#0da1c7] text-white px-4 py-2 rounded text-xs font-semibold">
          SECTION 5 • INCOME
        </div>

        <h2 className="text-2xl font-light text-slate-800 mb-4 mt-8">Income Approach</h2>

        <p className="text-sm text-slate-600 mb-6">{data.incomeApproach.methodology}</p>

        <div
          onClick={() => onSelectElement('income_analysis')}
          className={`p-4 -m-4 rounded cursor-pointer ${selectedElement === 'income_analysis' ? 'ring-2 ring-[#0da1c7] bg-[#0da1c7]/5' : 'hover:bg-slate-100'}`}
        >
          <table className="w-full text-sm">
            <tbody>
              <tr className="border-b border-slate-200">
                <td className="py-2 text-slate-600">Building Area</td>
                <td className="py-2 text-right font-medium text-slate-800">{data.improvements.grossBuildingArea.toLocaleString()} SF</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="py-2 text-slate-600">Market Rent (per SF)</td>
                <td className="py-2 text-right font-medium text-slate-800">${data.incomeApproach.marketRentPerSF.toFixed(2)}</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="py-2 text-slate-600 font-semibold">Potential Gross Income</td>
                <td className="py-2 text-right font-semibold text-slate-800">${data.incomeApproach.potentialGrossIncome.toLocaleString()}</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="py-2 text-slate-600">Less: Vacancy & Collection Loss ({data.incomeApproach.vacancyRate}%)</td>
                <td className="py-2 text-right font-medium text-red-600">-${(data.incomeApproach.potentialGrossIncome * data.incomeApproach.vacancyRate / 100).toLocaleString()}</td>
              </tr>
              <tr className="border-b border-slate-200 bg-slate-100">
                <td className="py-2 text-slate-600 font-semibold">Effective Gross Income</td>
                <td className="py-2 text-right font-semibold text-slate-800">${data.incomeApproach.effectiveGrossIncome.toLocaleString()}</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="py-2 text-slate-600">Less: Operating Expenses ({data.incomeApproach.expenseRatio}%)</td>
                <td className="py-2 text-right font-medium text-red-600">-${data.incomeApproach.operatingExpenses.toLocaleString()}</td>
              </tr>
              <tr className="bg-[#0da1c7]/10 border-b-2 border-[#0da1c7]">
                <td className="py-3 text-[#0da1c7] font-bold">Net Operating Income</td>
                <td className="py-3 text-right font-bold text-[#0da1c7] text-lg">${data.incomeApproach.netOperatingIncome.toLocaleString()}</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="py-2 text-slate-600">Capitalization Rate</td>
                <td className="py-2 text-right font-medium text-slate-800">{data.incomeApproach.capRate.toFixed(1)}%</td>
              </tr>
            </tbody>
          </table>

          {/* Rent Comparable Analysis Narrative */}
          {rentCompNotes && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Rent Comparable Analysis</h3>
              <EditableElement
                elementId="income_rent_narrative"
                content={getContent('income_rent_narrative', rentCompNotes)}
                selectedElement={selectedElement}
                onSelectElement={onSelectElement}
                onContentChange={handleContentChange}
                as="p"
                className="text-slate-600 text-sm leading-relaxed"
                appliedStyle={getStyle('income_rent_narrative')}
              />
            </div>
          )}

          {/* Expense Comparable Analysis Narrative */}
          {expenseCompNotes && (
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Expense Analysis</h3>
              <EditableElement
                elementId="income_expense_narrative"
                content={getContent('income_expense_narrative', expenseCompNotes)}
                selectedElement={selectedElement}
                onSelectElement={onSelectElement}
                onContentChange={handleContentChange}
                as="p"
                className="text-slate-600 text-sm leading-relaxed"
                appliedStyle={getStyle('income_expense_narrative')}
              />
            </div>
          )}

          <div className="mt-6 p-4 bg-gradient-to-r from-[#0da1c7]/10 to-[#0da1c7]/10 rounded-lg text-center">
            <div className="text-sm text-[#0da1c7] mb-1">Income Approach Value Indication</div>
            <div className="text-3xl font-bold text-[#0da1c7]">${data.incomeApproach.valueConclusion.toLocaleString()}</div>
          </div>
        </div>
      </div>
    </ReportPageWrapper>
  );
}

// Cost Approach Page
function CostApproachPage({ selectedElement, onSelectElement, onContentChange, editedContent, getAppliedStyle, pageNumber, valueMultiplier }: {
  selectedElement: string | null;
  onSelectElement: (id: string) => void;
  onContentChange?: (elementId: string, content: string) => void;
  editedContent?: Record<string, string>;
  getAppliedStyle?: (elementId: string) => React.CSSProperties;
  pageNumber?: number;
  valueMultiplier?: number;
}) {
  const handleContentChange = onContentChange || (() => { });
  const getContent = (id: string, defaultVal: string) => editedContent?.[id] ?? defaultVal;
  const getStyle = (id: string) => getAppliedStyle?.(id) || {};
  const data = sampleAppraisalData;
  const mult = valueMultiplier ?? 1;

  const adjusted = {
    ...data,
    costApproach: {
      ...data.costApproach,
      landValue: Math.round(data.costApproach.landValue * mult),
      replacementCostNew: Math.round(data.costApproach.replacementCostNew * mult),
      depreciatedCost: Math.round(data.costApproach.depreciatedCost * mult),
      valueConclusion: Math.round(data.costApproach.valueConclusion * mult),
    },
  };

  // Default AI draft for cost approach methodology
  const defaultCostMethodology = `The Cost Approach is based on the principle of substitution, which states that a prudent buyer would pay no more for a property than the cost to acquire a similar site and construct improvements of equivalent utility. This approach is particularly applicable to the subject property given its recent construction date of ${data.improvements.yearBuilt}.

The replacement cost new was estimated using the Marshall Valuation Service, a nationally recognized cost manual. The subject building contains ${data.improvements.grossBuildingArea.toLocaleString()} square feet of gross building area. Based on the quality of construction, building type, and local cost modifiers, the replacement cost new is estimated at $${data.costApproach.costPerSF.toFixed(2)} per square foot.

Physical depreciation was calculated using the age-life method. Given the building's age and condition, physical depreciation is estimated at ${((data.costApproach.physicalDepreciation / data.costApproach.replacementCostNew) * 100).toFixed(1)}% of replacement cost new. No functional or external obsolescence was identified in our analysis.

The land value of $${adjusted.costApproach.landValue.toLocaleString()} was derived from the sales comparison approach to land valuation, utilizing recent sales of comparable vacant industrial sites in the subject market area.`;

  return (
    <ReportPageWrapper section={{ id: 'cost', label: 'Cost Approach', enabled: true, expanded: false, fields: [], type: 'analysis-grid' }} pageNumber={pageNumber ?? 7} sidebarLabel="06">
      <div className="p-10">
        <div className="absolute top-6 right-8 bg-[#0da1c7] text-white px-4 py-2 rounded text-xs font-semibold">
          SECTION 6 • COST
        </div>

        <h2 className="text-2xl font-light text-slate-800 mb-6 mt-8">Cost Approach</h2>

        {/* Methodology Narrative */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Methodology</h3>
          <EditableElement
            elementId="cost_methodology"
            content={getContent('cost_methodology', defaultCostMethodology)}
            selectedElement={selectedElement}
            onSelectElement={onSelectElement}
            onContentChange={handleContentChange}
            as="div"
            className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap"
            appliedStyle={getStyle('cost_methodology')}
          />
        </div>

        {/* Cost Breakdown Table */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Cost Summary</h3>
          <div
            onClick={() => onSelectElement('cost_table')}
            className={`p-4 bg-white rounded-lg border border-slate-200 cursor-pointer ${selectedElement === 'cost_table' ? 'ring-2 ring-[#0da1c7] bg-[#0da1c7]/5' : 'hover:bg-slate-100'}`}
          >
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-b border-slate-200 bg-slate-100">
                  <td className="py-2 px-3 text-slate-600 font-semibold">Land Value</td>
                  <td className="py-2 px-3 text-right font-semibold text-slate-800">${adjusted.costApproach.landValue.toLocaleString()}</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="py-2 px-3 text-slate-600">Building Area</td>
                  <td className="py-2 px-3 text-right font-medium text-slate-800">{data.improvements.grossBuildingArea.toLocaleString()} SF</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="py-2 px-3 text-slate-600">Replacement Cost New (per SF)</td>
                  <td className="py-2 px-3 text-right font-medium text-slate-800">${data.costApproach.costPerSF.toFixed(2)}</td>
                </tr>
                <tr className="border-b border-slate-200 bg-slate-100">
                  <td className="py-2 px-3 text-slate-600 font-semibold">Replacement Cost New</td>
                  <td className="py-2 px-3 text-right font-semibold text-slate-800">${adjusted.costApproach.replacementCostNew.toLocaleString()}</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="py-2 px-3 text-slate-600">Less: Physical Depreciation</td>
                  <td className="py-2 px-3 text-right font-medium text-red-600">-${data.costApproach.physicalDepreciation.toLocaleString()}</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="py-2 px-3 text-slate-600">Less: Functional Obsolescence</td>
                  <td className="py-2 px-3 text-right font-medium text-red-600">-${data.costApproach.functionalObsolescence.toLocaleString()}</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="py-2 px-3 text-slate-600">Less: External Obsolescence</td>
                  <td className="py-2 px-3 text-right font-medium text-red-600">-${data.costApproach.externalObsolescence.toLocaleString()}</td>
                </tr>
                <tr className="border-b border-slate-200 bg-slate-100">
                  <td className="py-2 px-3 text-slate-600 font-semibold">Depreciated Cost of Improvements</td>
                  <td className="py-2 px-3 text-right font-semibold text-slate-800">${adjusted.costApproach.depreciatedCost.toLocaleString()}</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="py-2 px-3 text-slate-600">Plus: Site Improvements</td>
                  <td className="py-2 px-3 text-right font-medium text-green-600">+${data.costApproach.siteImprovements.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Value Conclusion */}
        <div className="p-5 bg-gradient-to-r from-[#0da1c7]/10 to-[#0da1c7]/10 rounded-lg border border-[#0da1c7]/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-[#0da1c7] font-medium mb-1">Cost Approach Value Indication</div>
              <div className="text-3xl font-bold text-[#0da1c7]">${adjusted.costApproach.valueConclusion.toLocaleString()}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-[#0da1c7] uppercase">Rounded</div>
              <div className="text-lg font-semibold text-[#0da1c7]">${(Math.round(adjusted.costApproach.valueConclusion / 5000) * 5000).toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>
    </ReportPageWrapper>
  );
}

// Land Valuation Page
function LandValuationPage({ selectedElement, onSelectElement, onContentChange, editedContent, getAppliedStyle, landValuationData, pageNumber }: {
  selectedElement: string | null;
  onSelectElement: (id: string) => void;
  onContentChange?: (elementId: string, content: string) => void;
  editedContent?: Record<string, string>;
  getAppliedStyle?: (elementId: string) => React.CSSProperties;
  landValuationData?: import('../../../types').LandValuationData;
  pageNumber?: number;
}) {
  const handleContentChange = onContentChange || (() => { });
  const getContent = (id: string, defaultVal: string) => editedContent?.[id] ?? defaultVal;
  const getStyle = (id: string) => getAppliedStyle?.(id) || {};

  // Get narrative from wizard state
  const landNarrative = landValuationData?.reconciliationText || '';
  const landComps = landValuationData?.landComps || [];
  const subjectAcreage = landValuationData?.subjectAcreage || 0;
  const concludedPricePerAcre = landValuationData?.concludedPricePerAcre || 0;
  const concludedLandValue = landValuationData?.concludedLandValue || 0;

  return (
    <ReportPageWrapper section={{ id: 'land-valuation', label: 'Land Valuation', enabled: true, expanded: false, fields: [], type: 'analysis-grid' }} pageNumber={pageNumber ?? 8} sidebarLabel="08">
      <div className="p-10">
        <div className="absolute top-6 right-8 bg-lime-600 text-white px-4 py-2 rounded text-xs font-semibold">
          SECTION 8 • LAND
        </div>

        <h2 className="text-2xl font-light text-slate-800 mb-6 mt-8">Land Valuation</h2>

        {/* Methodology */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Methodology</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            The land value is estimated using the Sales Comparison Approach, analyzing recent sales of comparable 
            vacant land parcels in the subject market area. Adjustments are made for differences in location, 
            size, zoning, topography, and other relevant characteristics.
          </p>
        </div>

        {/* Land Comparables Grid */}
        {landComps.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Land Sales Analysis</h3>
            <div
              onClick={() => onSelectElement('land_grid')}
              className={`rounded cursor-pointer ${selectedElement === 'land_grid' ? 'ring-2 ring-[#0da1c7]' : ''}`}
            >
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-lime-800 text-white">
                    <th className="px-2 py-2 text-left font-semibold">Element</th>
                    <th className="px-2 py-2 text-center font-semibold bg-lime-700">Subject</th>
                    {landComps.map((comp, idx) => (
                      <th key={comp.id} className="px-2 py-2 text-center font-semibold">Comp {idx + 1}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-200">
                    <td className="px-2 py-1.5 font-medium text-slate-600">Address</td>
                    <td className="px-2 py-1.5 text-center bg-slate-50 text-xs text-slate-800">Subject Site</td>
                    {landComps.map(comp => (
                      <td key={comp.id} className="px-2 py-1.5 text-center text-xs text-slate-800">{comp.address}</td>
                    ))}
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="px-2 py-1.5 font-medium text-slate-600">Sale Date</td>
                    <td className="px-2 py-1.5 text-center bg-slate-50 text-slate-500">-</td>
                    {landComps.map(comp => (
                      <td key={comp.id} className="px-2 py-1.5 text-center text-slate-800">{comp.saleDate}</td>
                    ))}
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="px-2 py-1.5 font-medium text-slate-600">Sale Price</td>
                    <td className="px-2 py-1.5 text-center bg-slate-50 text-slate-500">-</td>
                    {landComps.map(comp => (
                      <td key={comp.id} className="px-2 py-1.5 text-center text-slate-800">${comp.salePrice.toLocaleString()}</td>
                    ))}
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="px-2 py-1.5 font-medium text-slate-600">Acreage</td>
                    <td className="px-2 py-1.5 text-center bg-slate-50 text-slate-800">{subjectAcreage.toFixed(2)} AC</td>
                    {landComps.map(comp => (
                      <td key={comp.id} className="px-2 py-1.5 text-center text-slate-800">{comp.acreage.toFixed(2)} AC</td>
                    ))}
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="px-2 py-1.5 font-medium text-slate-600">Price/Acre</td>
                    <td className="px-2 py-1.5 text-center bg-slate-50 text-slate-500">-</td>
                    {landComps.map(comp => (
                      <td key={comp.id} className="px-2 py-1.5 text-center text-slate-800">${comp.pricePerAcre.toLocaleString()}/AC</td>
                    ))}
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="px-2 py-1.5 font-medium text-slate-600">Zoning</td>
                    <td className="px-2 py-1.5 text-center bg-slate-50 text-slate-800">Subject Zoning</td>
                    {landComps.map(comp => (
                      <td key={comp.id} className="px-2 py-1.5 text-center text-slate-800">{comp.zoning}</td>
                    ))}
                  </tr>
                  <tr className="bg-lime-800 text-white font-semibold">
                    <td className="px-2 py-2">Adj. Price/Acre</td>
                    <td className="px-2 py-2 text-center bg-lime-700">-</td>
                    {landComps.map(comp => (
                      <td key={comp.id} className="px-2 py-2 text-center">${comp.adjustedPricePerAcre.toLocaleString()}/AC</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Land Valuation Narrative */}
        {landNarrative && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-3">Land Valuation Analysis</h3>
            <EditableElement
              elementId="land_valuation_narrative"
              content={getContent('land_valuation_narrative', landNarrative)}
              selectedElement={selectedElement}
              onSelectElement={onSelectElement}
              onContentChange={handleContentChange}
              as="p"
              className="text-slate-600 text-sm leading-relaxed"
              appliedStyle={getStyle('land_valuation_narrative')}
            />
          </div>
        )}

        {/* Value Conclusion */}
        <div className="p-5 bg-gradient-to-r from-lime-50 to-lime-100 rounded-lg border border-lime-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-lime-700 font-medium mb-1">Land Value Indication</div>
              <div className="text-3xl font-bold text-lime-700">
                {concludedLandValue > 0 ? `$${concludedLandValue.toLocaleString()}` : 'Pending'}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-lime-600 uppercase">Per Acre</div>
              <div className="text-lg font-semibold text-lime-700">
                {concludedPricePerAcre > 0 ? `$${concludedPricePerAcre.toLocaleString()}` : '-'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ReportPageWrapper>
  );
}

// Reconciliation Page
function ReconciliationPage({ selectedElement, onSelectElement, onContentChange, editedContent, getAppliedStyle, reconciliationData, pageNumber }: {
  selectedElement: string | null;
  onSelectElement: (id: string) => void;
  onContentChange?: (elementId: string, content: string) => void;
  editedContent?: Record<string, string>;
  getAppliedStyle?: (elementId: string) => React.CSSProperties;
  reconciliationData?: import('../../../types').ReconciliationData | null;
  pageNumber?: number;
}) {
  const data = sampleAppraisalData;
  const handleContentChange = onContentChange || (() => { });
  const getContent = (id: string, defaultVal: string) => editedContent?.[id] ?? defaultVal;
  const getStyle = (id: string) => getAppliedStyle?.(id) || {};

  // Get narrative from wizard state (first scenario)
  const reconciliationNarrative = reconciliationData?.scenarioReconciliations?.[0]?.comments || '';
  const exposureRationale = reconciliationData?.exposureRationale || '';

  // Calculate value range and spread
  const values = [data.valuation.costApproachValue, data.valuation.salesComparisonValue, data.valuation.incomeApproachValue];
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const spread = ((maxValue - minValue) / minValue * 100).toFixed(1);

  return (
    <ReportPageWrapper section={{ id: 'reconciliation', label: 'Reconciliation', enabled: true, expanded: false, fields: [], type: 'narrative' }} pageNumber={pageNumber ?? 8} sidebarLabel="07">
      <div className="p-6">
        <div className="absolute top-4 right-6 bg-[#0da1c7] text-white px-3 py-1.5 rounded text-xs font-semibold">
          SECTION 7 • VALUE
        </div>

        <h2 className="text-xl font-light text-slate-800 mb-4 mt-6">Reconciliation of Value</h2>

        {/* Value Indications Grid */}
        <div
          onClick={() => onSelectElement('recon_approaches')}
          className={`mb-4 p-3 -m-3 rounded cursor-pointer ${selectedElement === 'recon_approaches' ? 'ring-2 ring-[#0da1c7] bg-[#0da1c7]/5' : 'hover:bg-slate-100'}`}
        >
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Value Indications</h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-100 rounded-lg p-3 text-center">
              <div className="text-[10px] text-slate-500 uppercase mb-0.5">Cost Approach</div>
              <div className="text-lg font-bold text-slate-800">${data.valuation.costApproachValue.toLocaleString()}</div>
              <div className="text-xs text-slate-500">Weight: {data.reconciliation.costApproachWeight}%</div>
            </div>
            <div className="bg-[#0da1c7]/10 rounded-lg p-3 text-center border-2 border-[#0da1c7]/20">
              <div className="text-[10px] text-[#0da1c7] uppercase mb-0.5">Sales Comparison</div>
              <div className="text-lg font-bold text-[#0da1c7]">${data.valuation.salesComparisonValue.toLocaleString()}</div>
              <div className="text-xs text-[#0da1c7]">Weight: {data.reconciliation.salesComparisonWeight}%</div>
            </div>
            <div className="bg-slate-100 rounded-lg p-3 text-center">
              <div className="text-[10px] text-slate-500 uppercase mb-0.5">Income Approach</div>
              <div className="text-lg font-bold text-slate-800">${data.valuation.incomeApproachValue.toLocaleString()}</div>
              <div className="text-xs text-slate-500">Weight: {data.reconciliation.incomeApproachWeight}%</div>
            </div>
          </div>
        </div>

        {/* Analysis Section - Condensed for print */}
        <div className="mb-4">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Analysis</h3>

          {/* Value Range Summary */}
          <div
            onClick={() => onSelectElement('recon_range')}
            className={`mb-3 p-3 bg-slate-50 rounded-lg border-l-3 border-slate-400 cursor-pointer ${selectedElement === 'recon_range' ? 'ring-2 ring-[#0da1c7]' : 'hover:bg-slate-100'}`}
          >
            <h4 className="text-xs font-semibold text-slate-700 mb-1">Value Range & Correlation</h4>
            <ul className="text-xs text-slate-600 space-y-0.5">
              <li className="flex items-start gap-1.5">
                <span className="text-slate-400 mt-0.5">•</span>
                <span>Range: ${minValue.toLocaleString()} to ${maxValue.toLocaleString()} ({spread}% spread)</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-slate-400 mt-0.5">•</span>
                <EditableElement
                  elementId="recon_correlation"
                  content={getContent('recon_correlation', 'All three approaches produced credible results and are supportive of each other')}
                  selectedElement={selectedElement}
                  onSelectElement={onSelectElement}
                  onContentChange={handleContentChange}
                  as="span"
                  className="text-xs"
                  appliedStyle={getStyle('recon_correlation')}
                />
              </li>
            </ul>
          </div>

          {/* Sales Comparison Approach */}
          <div
            onClick={() => onSelectElement('recon_sales')}
            className={`mb-3 p-3 bg-[#0da1c7]/10 rounded-lg border-l-3 border-[#0da1c7] cursor-pointer ${selectedElement === 'recon_sales' ? 'ring-2 ring-[#0da1c7]' : 'hover:bg-[#0da1c7]/10'}`}
          >
            <h4 className="text-xs font-semibold text-slate-900 mb-1">
              Sales Comparison Approach
              <span className="ml-2 px-1.5 py-0.5 bg-[#0da1c7]/20 text-slate-900 rounded text-[10px] font-medium">
                {data.reconciliation.salesComparisonWeight}% Weight — Primary
              </span>
            </h4>
            <EditableElement
              elementId="recon_sales_text"
              content={getContent('recon_sales_text', 'Greatest weight is placed on the Sales Comparison Approach as buyers and sellers in the local market typically rely on direct comparisons to similar properties when making purchase decisions.')}
              selectedElement={selectedElement}
              onSelectElement={onSelectElement}
              onContentChange={handleContentChange}
              as="p"
              className="text-xs text-slate-800 leading-relaxed"
              appliedStyle={getStyle('recon_sales_text')}
            />
          </div>

          {/* Income Approach */}
          <div
            onClick={() => onSelectElement('recon_income')}
            className={`mb-3 p-3 bg-blue-50 rounded-lg border-l-3 border-blue-400 cursor-pointer ${selectedElement === 'recon_income' ? 'ring-2 ring-[#0da1c7]' : 'hover:bg-blue-100'}`}
          >
            <h4 className="text-xs font-semibold text-slate-900 mb-1">
              Income Approach
              <span className="ml-2 px-1.5 py-0.5 bg-blue-200 text-blue-900 rounded text-[10px] font-medium">
                {data.reconciliation.incomeApproachWeight}% Weight — Secondary
              </span>
            </h4>
            <EditableElement
              elementId="recon_income_text"
              content={getContent('recon_income_text', 'The Income Approach is given secondary consideration. The capitalization rate applied was derived from market transactions and supported by investor surveys.')}
              selectedElement={selectedElement}
              onSelectElement={onSelectElement}
              onContentChange={handleContentChange}
              as="p"
              className="text-xs text-slate-800 leading-relaxed"
              appliedStyle={getStyle('recon_income_text')}
            />
          </div>

          {/* Cost Approach */}
          <div
            onClick={() => onSelectElement('recon_cost')}
            className={`mb-3 p-3 bg-accent-amber-gold-light rounded-lg border-l-3 border-amber-400 cursor-pointer ${selectedElement === 'recon_cost' ? 'ring-2 ring-[#0da1c7]' : 'hover:bg-amber-100'}`}
          >
            <h4 className="text-xs font-semibold text-slate-900 mb-1">
              Cost Approach
              <span className="ml-2 px-1.5 py-0.5 bg-amber-200 text-amber-900 rounded text-[10px] font-medium">
                {data.reconciliation.costApproachWeight}% Weight — Supporting
              </span>
            </h4>
            <EditableElement
              elementId="recon_cost_text"
              content={getContent('recon_cost_text', 'The Cost Approach is given least weight. While it accurately reflects replacement cost, it does not directly capture market dynamics.')}
              selectedElement={selectedElement}
              onSelectElement={onSelectElement}
              onContentChange={handleContentChange}
              as="p"
              className="text-xs text-slate-800 leading-relaxed"
              appliedStyle={getStyle('recon_cost_text')}
            />
          </div>

          {/* Reconciliation Narrative from Wizard */}
          {reconciliationNarrative && (
            <div
              onClick={() => onSelectElement('recon_narrative')}
              className={`mb-3 p-3 bg-purple-50 rounded-lg border-l-3 border-purple-400 cursor-pointer ${selectedElement === 'recon_narrative' ? 'ring-2 ring-[#0da1c7]' : 'hover:bg-purple-100'}`}
            >
              <h4 className="text-xs font-semibold text-purple-800 mb-1">Reconciliation Analysis</h4>
              <EditableElement
                elementId="recon_narrative"
                content={getContent('recon_narrative', reconciliationNarrative)}
                selectedElement={selectedElement}
                onSelectElement={onSelectElement}
                onContentChange={handleContentChange}
                as="p"
                className="text-xs text-purple-700 leading-relaxed"
                appliedStyle={getStyle('recon_narrative')}
              />
            </div>
          )}

          {/* Final Conclusion */}
          <div
            onClick={() => onSelectElement('recon_conclusion')}
            className={`p-3 bg-slate-100 rounded-lg border-l-3 border-slate-400 cursor-pointer ${selectedElement === 'recon_conclusion' ? 'ring-2 ring-[#0da1c7]' : 'hover:bg-slate-200'}`}
          >
            <h4 className="text-xs font-semibold text-slate-600 mb-1">Conclusion</h4>
            <EditableElement
              elementId="recon_final"
              content={getContent('recon_final', `Based on the foregoing analysis and reconciliation, it is my opinion that the market value of the subject property, as of the effective date of appraisal, is $${data.valuation.asIsValue.toLocaleString()}.`)}
              selectedElement={selectedElement}
              onSelectElement={onSelectElement}
              onContentChange={handleContentChange}
              as="p"
              className="text-xs text-slate-600 leading-relaxed font-medium"
              appliedStyle={getStyle('recon_final')}
            />
          </div>

          {/* Exposure Time Rationale from Wizard */}
          {exposureRationale && (
            <div
              onClick={() => onSelectElement('exposure_rationale')}
              className={`mt-3 p-3 bg-slate-50 rounded-lg border-l-3 border-slate-400 cursor-pointer ${selectedElement === 'exposure_rationale' ? 'ring-2 ring-[#0da1c7]' : 'hover:bg-slate-100'}`}
            >
              <h4 className="text-xs font-semibold text-slate-700 mb-1">Exposure & Marketing Time</h4>
              <EditableElement
                elementId="exposure_rationale"
                content={getContent('exposure_rationale', exposureRationale)}
                selectedElement={selectedElement}
                onSelectElement={onSelectElement}
                onContentChange={handleContentChange}
                as="p"
                className="text-xs text-slate-700 leading-relaxed"
                appliedStyle={getStyle('exposure_rationale')}
              />
            </div>
          )}
        </div>

        {/* Final Value Banner */}
        <div className="p-3 bg-gradient-to-r from-[#0da1c7] to-[#0b8fb0] rounded-lg text-center text-white">
          <div className="text-xs uppercase tracking-wider mb-1 opacity-80">Final Market Value Conclusion</div>
          <div className="text-2xl font-bold mb-1">${data.valuation.asIsValue.toLocaleString()}</div>
          <div className="text-xs opacity-80">As of {data.assignment.effectiveDate}</div>
        </div>
      </div>
    </ReportPageWrapper>
  );
}

// Photo Exhibits Page
function PhotoExhibitsPage({
  selectedElement,
  onSelectElement,
  onOpenPhotoEditor,
  getPhotoEdits,
  pageNumber,
}: {
  selectedElement: string | null;
  onSelectElement: (id: string) => void;
  onContentChange?: (elementId: string, content: string) => void;
  editedContent?: Record<string, string>;
  getAppliedStyle?: (elementId: string) => React.CSSProperties;
  onOpenPhotoEditor?: (photo: PhotoData) => void;
  getPhotoEdits?: (photoId: string) => PhotoEdits | undefined;
  pageNumber?: number;
}) {
  const data = sampleAppraisalData;
  const photos = data.photos.slice(0, 6);

  return (
    <ReportPageWrapper section={{ id: 'exhibits', label: 'Photo Exhibits', enabled: true, expanded: false, fields: [], type: 'photo-grid' }} pageNumber={pageNumber ?? 9} sidebarLabel="08">
      <div className="p-10">
        <div className="absolute top-6 right-8 bg-[#0da1c7] text-white px-4 py-2 rounded text-xs font-semibold">
          EXHIBITS
        </div>

        <h2 className="text-2xl font-light text-slate-800 mb-6 mt-8">Subject Property Photos</h2>

        <div className="grid grid-cols-2 gap-4">
          {photos.map((photo) => (
            <PhotoSlot
              key={photo.id}
              photo={photo}
              aspectRatio="4/3"
              selected={selectedElement === `exhibit_${photo.id}`}
              onSelect={() => onSelectElement(`exhibit_${photo.id}`)}
              onDoubleClick={() => onOpenPhotoEditor?.({
                id: photo.id,
                url: photo.url,
                caption: photo.caption,
                category: photo.category,
              })}
              edits={getPhotoEdits?.(photo.id)}
            />
          ))}
        </div>
      </div>
    </ReportPageWrapper>
  );
}

// Table of Contents Page - Dynamic pagination (1-3 pages based on section count)
// Each page holds up to 20 entries. No photo - more space for entries.
// Page numbers update dynamically when sections are reordered.
const ENTRIES_PER_TOC_PAGE = 20;

function TOCPage({
  selectedElement,
  onSelectElement,
  enabledSections,
  pageIndex = 0, // 0 = first page, 1 = second page, 2 = third page
  pageNumber, // Dynamic page number passed from parent
}: {
  selectedElement: string | null;
  onSelectElement: (id: string) => void;
  enabledSections: ReportSection[];
  onContentChange?: (elementId: string, content: string) => void;
  editedContent?: Record<string, string>;
  getAppliedStyle?: (elementId: string) => React.CSSProperties;
  onOpenPhotoEditor?: (photo: PhotoData) => void;
  getPhotoEdits?: (photoId: string) => PhotoEdits | undefined;
  pageIndex?: number;
  pageNumber: number;
}) {
  // IDs that should not appear as TOC entries (cover and TOC pages themselves)
  const tocExcludedIds = new Set(['cover', 'toc', 'toc-2', 'toc-3']);
  
  // Get all enabled sections in their current order
  const allEnabledSections = enabledSections.filter(s => s.enabled);
  
  // Build page number map - each enabled section gets a sequential page number
  const pageNumberMap = new Map<string, number>();
  allEnabledSections.forEach((section, index) => {
    pageNumberMap.set(section.id, index + 1); // Pages are 1-indexed
  });
  
  // Build TOC entries (exclude cover and TOC pages themselves)
  const tocEntries = allEnabledSections
    .filter(s => !tocExcludedIds.has(s.id))
    .map(section => ({
      id: section.id,
      title: section.label,
      page: pageNumberMap.get(section.id) || 0,
    }));

  // Calculate which entries belong on this TOC page
  const startIndex = pageIndex * ENTRIES_PER_TOC_PAGE;
  const entriesForThisPage = tocEntries.slice(startIndex, startIndex + ENTRIES_PER_TOC_PAGE);

  // Don't render if no entries for this page
  if (entriesForThisPage.length === 0) {
    return null;
  }

  // Calculate total TOC pages for "continued" logic
  const totalTocPages = Math.ceil(tocEntries.length / ENTRIES_PER_TOC_PAGE);
  const isFirstPage = pageIndex === 0;
  const isLastPage = pageIndex === totalTocPages - 1;
  
  const pageTitle = isFirstPage 
    ? 'Table of Contents' 
    : 'Table of Contents (Continued)';
  
  const sectionId = pageIndex === 0 ? 'toc' : pageIndex === 1 ? 'toc-2' : 'toc-3';

  return (
    <ReportPageWrapper 
      section={{ id: sectionId, label: pageTitle, enabled: true, expanded: false, fields: [], type: 'toc' }} 
      pageNumber={pageNumber} 
      sidebarLabel=""
    >
      <div className="p-12">
        <h2 className="text-3xl font-light text-[#0da1c7] mb-6 mt-4">{pageTitle}</h2>

        {isFirstPage && (
          <p className="text-xs text-slate-600 mb-4">
            The following sections are included in this appraisal report:
          </p>
        )}

        <div
          onClick={() => onSelectElement(`toc_entries_${pageIndex}`)}
          className={`space-y-0 p-3 -m-3 rounded cursor-pointer ${
            selectedElement === `toc_entries_${pageIndex}` 
              ? 'ring-2 ring-[#0da1c7] bg-cyan-50' 
              : 'hover:bg-slate-50'
          }`}
        >
          {entriesForThisPage.map((entry) => (
            <div
              key={entry.id}
              className="flex items-baseline border-b border-dotted border-slate-300 py-2 group"
            >
              <span className="text-slate-800 font-medium flex-shrink-0 text-sm">
                {entry.title}
              </span>
              <span 
                className="flex-1 border-b border-dotted border-slate-300 mx-3" 
                style={{ marginBottom: '0.3em' }}
              />
              <span className="text-slate-500 font-mono text-sm flex-shrink-0 tabular-nums w-6 text-right">
                {entry.page}
              </span>
            </div>
          ))}
        </div>

        {/* Show continuation indicator if not last page */}
        {!isLastPage && (
          <p className="text-xs text-slate-400 mt-6 text-center italic">
            Continued on next page...
          </p>
        )}
      </div>
    </ReportPageWrapper>
  );
}

// Assumptions & Limiting Conditions Page
function AssumptionsPage({ selectedElement, onSelectElement, pageNumber }: {
  selectedElement: string | null;
  onSelectElement: (id: string) => void;
  onContentChange?: (elementId: string, content: string) => void;
  editedContent?: Record<string, string>;
  getAppliedStyle?: (elementId: string) => React.CSSProperties;
  pageNumber?: number;
}) {
  const data = sampleAppraisalData;

  return (
    <ReportPageWrapper section={{ id: 'assumptions', label: 'Assumptions', enabled: true, expanded: false, fields: [], type: 'narrative' }} pageNumber={pageNumber ?? 10} sidebarLabel="09">
      <div className="p-6">
        <div className="absolute top-4 right-6 bg-[#0da1c7] text-white px-3 py-1.5 rounded text-xs font-semibold">
          ASSUMPTIONS
        </div>

        <h2 className="text-xl font-light text-slate-800 mb-4 mt-6">Assumptions and Limiting Conditions</h2>

        {/* Assumptions */}
        <div
          onClick={() => onSelectElement('assumptions_list')}
          className={`mb-4 p-3 -m-3 rounded cursor-pointer ${selectedElement === 'assumptions_list' ? 'ring-2 ring-[#0da1c7] bg-[#0da1c7]/5' : 'hover:bg-slate-100'}`}
        >
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">General Assumptions</h3>
          <ol className="list-decimal list-outside ml-4 space-y-1.5 text-xs text-slate-600 leading-relaxed">
            {data.assumptions.map((assumption, idx) => (
              <li key={idx}>{assumption}</li>
            ))}
          </ol>
        </div>

        {/* Limiting Conditions */}
        <div
          onClick={() => onSelectElement('limiting_conditions')}
          className={`p-3 -m-3 rounded cursor-pointer ${selectedElement === 'limiting_conditions' ? 'ring-2 ring-[#0da1c7] bg-[#0da1c7]/5' : 'hover:bg-slate-100'}`}
        >
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Limiting Conditions</h3>
          <ol className="list-decimal list-outside ml-4 space-y-1.5 text-xs text-slate-600 leading-relaxed">
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
function CertificationPage({ selectedElement, onSelectElement, subjectData, pageNumber }: {
  selectedElement: string | null;
  onSelectElement: (id: string) => void;
  onContentChange?: (elementId: string, content: string) => void;
  editedContent?: Record<string, string>;
  getAppliedStyle?: (elementId: string) => React.CSSProperties;
  subjectData?: import('../../../types').SubjectData;
  pageNumber?: number;
}) {
  const fallbackData = sampleAppraisalData;

  // Use wizard state or fall back to sample data
  const appraiserName = subjectData?.inspectorName || fallbackData.assignment.appraiser;
  const appraiserLicense = subjectData?.inspectorLicense || fallbackData.assignment.appraiserLicense;
  const reportDate = subjectData?.reportDate || fallbackData.assignment.reportDate;

  return (
    <ReportPageWrapper section={{ id: 'certification', label: 'Certification', enabled: true, expanded: false, fields: [], type: 'narrative' }} pageNumber={pageNumber ?? 11} sidebarLabel="10">
      <div className="p-10">
        <div className="absolute top-6 right-8 bg-[#0da1c7] text-white px-4 py-2 rounded text-xs font-semibold">
          CERTIFICATION
        </div>

        <h2 className="text-2xl font-light text-slate-800 mb-6 mt-8">Appraiser's Certification</h2>

        <div
          onClick={() => onSelectElement('certification_intro')}
          className={`mb-6 p-4 -m-4 rounded cursor-pointer ${selectedElement === 'certification_intro' ? 'ring-2 ring-[#0da1c7] bg-[#0da1c7]/5' : 'hover:bg-slate-100'}`}
        >
          <p className="text-sm text-slate-600 leading-relaxed">
            I certify that, to the best of my knowledge and belief:
          </p>
        </div>

        {/* Certifications List */}
        <div
          onClick={() => onSelectElement('certifications_list')}
          className={`mb-8 p-4 -m-4 rounded cursor-pointer ${selectedElement === 'certifications_list' ? 'ring-2 ring-[#0da1c7] bg-[#0da1c7]/5' : 'hover:bg-slate-100'}`}
        >
          <ol className="list-decimal list-outside ml-5 space-y-3 text-sm text-slate-600 leading-relaxed">
            {fallbackData.certifications.map((cert, idx) => (
              <li key={idx}>{cert}</li>
            ))}
          </ol>
        </div>

        {/* Signature Block */}
        <div
          onClick={() => onSelectElement('signature_block')}
          className={`mt-12 p-6 border-2 border-slate-200 rounded-lg ${selectedElement === 'signature_block' ? 'ring-2 ring-[#0da1c7] bg-[#0da1c7]/5' : 'hover:bg-slate-100'}`}
        >
          <div className="grid grid-cols-2 gap-8">
            <div>
              <div className="border-b-2 border-slate-400-med pb-2 mb-2 h-16"></div>
              <div className="text-sm font-semibold text-slate-800">{appraiserName}</div>
              <div className="text-xs text-slate-600">{appraiserLicense}</div>
              <div className="text-xs text-slate-600 mt-2">Date: {reportDate}</div>
            </div>
            <div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#0da1c7] mb-2">ROVE</div>
                <div className="text-sm text-slate-600">{fallbackData.assignment.appraiserCompany}</div>
                <div className="text-xs text-slate-500 mt-1">{fallbackData.assignment.appraiserAddress}</div>
                <div className="text-xs text-slate-500">{fallbackData.assignment.appraiserPhone}</div>
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
  appliedStyle?: React.CSSProperties; // Style from report state
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
  appliedStyle,
}: EditableElementProps) {
  // Merge base style with applied style from report state
  const mergedStyle = { ...style, ...appliedStyle };
  const [isEditing, setIsEditing] = useState(false);
  const [localContent, setLocalContent] = useState(content);
  const [originalHeight, setOriginalHeight] = useState<number>(0);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const displayRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setLocalContent(content);
  }, [content]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      // Select all text for easy replacement
      inputRef.current.setSelectionRange(0, inputRef.current.value.length);
    }
  }, [isEditing]);

  const handleDoubleClick = () => {
    // Capture the rendered height before switching to edit mode
    if (displayRef.current) {
      const rect = displayRef.current.getBoundingClientRect();
      setOriginalHeight(Math.max(rect.height, 80)); // Minimum 80px
    }
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (localContent !== content) {
      onContentChange(elementId, localContent);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Allow Shift+Enter for newlines in multiline content
    if (e.key === 'Enter' && !e.shiftKey && localContent.split('\n').length <= 1) {
      e.preventDefault();
      handleBlur();
    }
    if (e.key === 'Escape') {
      setLocalContent(content);
      setIsEditing(false);
    }
  };

  const isSelected = selectedElement === elementId;

  // Helper to render HTML content safely - converts HTML tags to rendered elements
  const renderFormattedContent = (text: string) => {
    // Check if content has HTML tags
    const hasHtml = /<[^>]+>/.test(text);
    
    if (hasHtml) {
      // Sanitize and render HTML - convert common tags
      // Note: For production, use DOMPurify
      const sanitized = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        // Now restore allowed tags
        .replace(/&lt;b&gt;/gi, '<b>')
        .replace(/&lt;\/b&gt;/gi, '</b>')
        .replace(/&lt;strong&gt;/gi, '<strong>')
        .replace(/&lt;\/strong&gt;/gi, '</strong>')
        .replace(/&lt;u&gt;/gi, '<u>')
        .replace(/&lt;\/u&gt;/gi, '</u>')
        .replace(/&lt;i&gt;/gi, '<i>')
        .replace(/&lt;\/i&gt;/gi, '</i>')
        .replace(/&lt;em&gt;/gi, '<em>')
        .replace(/&lt;\/em&gt;/gi, '</em>')
        .replace(/&lt;br\s*\/?&gt;/gi, '<br/>')
        .replace(/\n/g, '<br/>');
      
      return <span dangerouslySetInnerHTML={{ __html: sanitized }} />;
    }
    
    // For plain text, convert newlines to <br> elements
    const lines = text.split('\n');
    if (lines.length === 1) {
      return text;
    }
    
    return lines.map((line, i) => (
      <span key={i}>
        {line}
        {i < lines.length - 1 && <br />}
      </span>
    ));
  };

  if (isEditing) {
    // Calculate rows based on content length and newlines
    const lineCount = localContent.split('\n').length;
    const estimatedWrappedLines = Math.ceil(localContent.length / 80); // Rough estimate for wrapped lines
    const calculatedRows = Math.max(3, lineCount, Math.ceil(estimatedWrappedLines / 2));
    
    return (
      <textarea
        ref={inputRef}
        value={localContent}
        onChange={(e) => setLocalContent(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={`w-full border-2 border-[#0da1c7] rounded px-2 py-2 resize-vertical focus:outline-none focus:ring-2 focus:ring-[#0da1c7]/50 bg-white ${className}`}
        style={{
          ...mergedStyle,
          minHeight: Math.max(originalHeight, 80),
          fontFamily: 'inherit',
          fontSize: 'inherit',
          lineHeight: '1.6',
        }}
        rows={calculatedRows}
      />
    );
  }

  return (
    <Component
      ref={displayRef as React.RefObject<HTMLParagraphElement>}
      onClick={() => onSelectElement(elementId)}
      onDoubleClick={handleDoubleClick}
      className={`cursor-pointer transition-all rounded px-1 -mx-1 ${isSelected
        ? 'ring-2 ring-[#0da1c7] bg-[#0da1c7]/5'
        : 'hover:bg-slate-100'
        } ${className}`}
      style={{ ...mergedStyle, lineHeight: '1.6' }}
      title="Click to select, double-click to edit"
    >
      {renderFormattedContent(localContent)}
    </Component>
  );
}

// =================================================================
// ALIGNMENT GUIDE TYPES
// =================================================================

interface AlignmentGuide {
  type: 'horizontal' | 'vertical';
  position: number; // x for vertical, y for horizontal
  start: number;
  end: number;
}

// Alignment detection threshold (in pixels)
const ALIGNMENT_THRESHOLD = 5;

function calculateAlignments(
  draggingBlock: TextBlock,
  otherBlocks: TextBlock[],
  pageOffset: { x: number; y: number }
): { guides: AlignmentGuide[]; snapX: number | null; snapY: number | null } {
  const guides: AlignmentGuide[] = [];
  let snapX: number | null = null;
  let snapY: number | null = null;

  // Current block edges and center
  const left = draggingBlock.x;
  const right = draggingBlock.x + draggingBlock.width;
  const centerX = draggingBlock.x + draggingBlock.width / 2;
  const top = draggingBlock.y;
  const bottom = draggingBlock.y + draggingBlock.height;
  const centerY = draggingBlock.y + draggingBlock.height / 2;

  for (const other of otherBlocks) {
    if (other.id === draggingBlock.id) continue;

    // Other block edges and center
    const otherLeft = other.x;
    const otherRight = other.x + other.width;
    const otherCenterX = other.x + other.width / 2;
    const otherTop = other.y;
    const otherBottom = other.y + other.height;
    const otherCenterY = other.y + other.height / 2;

    // Check vertical alignments (left, right, center)
    const verticalChecks = [
      { pos: otherLeft, check: left, type: 'left-left' },
      { pos: otherLeft, check: right, type: 'left-right' },
      { pos: otherRight, check: left, type: 'right-left' },
      { pos: otherRight, check: right, type: 'right-right' },
      { pos: otherCenterX, check: centerX, type: 'center-center' },
    ];

    for (const v of verticalChecks) {
      if (Math.abs(v.pos - v.check) < ALIGNMENT_THRESHOLD) {
        guides.push({
          type: 'vertical',
          position: v.pos + pageOffset.x,
          start: Math.min(top, otherTop) + pageOffset.y,
          end: Math.max(bottom, otherBottom) + pageOffset.y,
        });
        // Snap logic: calculate the adjustment needed
        if (snapX === null) {
          if (v.type.startsWith('left')) {
            snapX = v.pos - left;
          } else if (v.type.startsWith('right')) {
            snapX = v.pos - right;
          } else {
            snapX = v.pos - centerX;
          }
        }
      }
    }

    // Check horizontal alignments (top, bottom, center)
    const horizontalChecks = [
      { pos: otherTop, check: top, type: 'top-top' },
      { pos: otherTop, check: bottom, type: 'top-bottom' },
      { pos: otherBottom, check: top, type: 'bottom-top' },
      { pos: otherBottom, check: bottom, type: 'bottom-bottom' },
      { pos: otherCenterY, check: centerY, type: 'center-center' },
    ];

    for (const h of horizontalChecks) {
      if (Math.abs(h.pos - h.check) < ALIGNMENT_THRESHOLD) {
        guides.push({
          type: 'horizontal',
          position: h.pos + pageOffset.y,
          start: Math.min(left, otherLeft) + pageOffset.x,
          end: Math.max(right, otherRight) + pageOffset.x,
        });
        // Snap logic
        if (snapY === null) {
          if (h.type.startsWith('top')) {
            snapY = h.pos - top;
          } else if (h.type.startsWith('bottom')) {
            snapY = h.pos - bottom;
          } else {
            snapY = h.pos - centerY;
          }
        }
      }
    }
  }

  return { guides, snapX, snapY };
}

// =================================================================
// ALIGNMENT GUIDES RENDERER
// =================================================================

function AlignmentGuidesOverlay({ guides }: { guides: AlignmentGuide[] }) {
  if (guides.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-[100]">
      {guides.map((guide, idx) => (
        <div
          key={`${guide.type}-${guide.position}-${idx}`}
          className="absolute bg-[#ff6b6b]"
          style={
            guide.type === 'vertical'
              ? {
                  left: guide.position,
                  top: guide.start,
                  width: 1,
                  height: guide.end - guide.start,
                }
              : {
                  top: guide.position,
                  left: guide.start,
                  height: 1,
                  width: guide.end - guide.start,
                }
          }
        />
      ))}
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
  showGrid?: boolean;
  gridSize?: number;
  allBlocks?: TextBlock[];
  onAlignmentGuidesChange?: (guides: AlignmentGuide[]) => void;
  pageOffset?: { x: number; y: number };
}

function DraggableTextBlock({ 
  block, 
  selected, 
  onSelect, 
  onUpdate, 
  onDelete, 
  showGrid = false, 
  gridSize = 16,
  allBlocks = [],
  onAlignmentGuidesChange,
  pageOffset = { x: 0, y: 0 }
}: DraggableTextBlockProps) {
  // Helper to snap value to grid
  const snapToGrid = (value: number): number => {
    if (!showGrid) return value;
    return Math.round(value / gridSize) * gridSize;
  };
  const [isEditing, setIsEditing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState<string | null>(null); // 'se', 'sw', 'ne', 'nw', 'e', 'w', 's', 'n'
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, width: 0, height: 0, blockX: 0, blockY: 0 });
  const blockRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  // Default placeholder text
  const DEFAULT_TEXT = 'New text block - double-click to edit';
  const isDefaultText = block.content === DEFAULT_TEXT;

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isEditing) return;
    e.stopPropagation();
    onSelect();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - block.x,
      y: e.clientY - block.y,
      width: block.width,
      height: block.height,
      blockX: block.x,
      blockY: block.y,
    });
  };

  const handleResizeStart = (e: React.MouseEvent, direction: string) => {
    e.stopPropagation();
    e.preventDefault();
    onSelect();
    setIsResizing(direction);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      width: block.width,
      height: block.height,
      blockX: block.x,
      blockY: block.y,
    });
  };

  // Handle dragging with alignment guides
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      let newX = e.clientX - dragStart.x;
      let newY = e.clientY - dragStart.y;
      
      // Calculate alignments with other blocks
      if (allBlocks.length > 1 && onAlignmentGuidesChange) {
        const tempBlock = { ...block, x: newX, y: newY };
        const { guides, snapX, snapY } = calculateAlignments(tempBlock, allBlocks, pageOffset);
        
        // Apply snap if within threshold
        if (snapX !== null) {
          newX += snapX;
        }
        if (snapY !== null) {
          newY += snapY;
        }
        
        onAlignmentGuidesChange(guides);
      }
      
      // Apply grid snapping after alignment snapping
      newX = snapToGrid(newX);
      newY = snapToGrid(newY);
      
      onUpdate({
        x: newX,
        y: newY,
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      // Clear alignment guides on mouse up
      onAlignmentGuidesChange?.([]);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDragging, dragStart, onUpdate, showGrid, gridSize, allBlocks, onAlignmentGuidesChange, pageOffset, block]);

  // Handle resizing
  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;
      const minWidth = 80;
      const minHeight = 40;

      const updates: Partial<TextBlock> = {};

      // Handle horizontal resizing
      if (isResizing.includes('e')) {
        updates.width = Math.max(minWidth, dragStart.width + deltaX);
      } else if (isResizing.includes('w')) {
        const newWidth = Math.max(minWidth, dragStart.width - deltaX);
        if (newWidth > minWidth) {
          updates.width = newWidth;
          updates.x = dragStart.blockX + deltaX;
        }
      }

      // Handle vertical resizing
      if (isResizing.includes('s')) {
        updates.height = Math.max(minHeight, dragStart.height + deltaY);
      } else if (isResizing.includes('n')) {
        const newHeight = Math.max(minHeight, dragStart.height - deltaY);
        if (newHeight > minHeight) {
          updates.height = newHeight;
          updates.y = dragStart.blockY + deltaY;
        }
      }

      onUpdate(updates);
    };

    const handleMouseUp = () => {
      setIsResizing(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, dragStart, onUpdate]);

  const handleDoubleClick = () => {
    setIsEditing(true);
    // Clear default text when entering edit mode
    if (isDefaultText) {
      onUpdate({ content: '' });
    }
  };

  // Focus editor and set initial content when entering edit mode
  useEffect(() => {
    if (isEditing && editorRef.current) {
      // Set initial content only when entering edit mode
      editorRef.current.innerHTML = isDefaultText ? '' : block.content;
      editorRef.current.focus();
      // Move cursor to end of content
      const range = document.createRange();
      range.selectNodeContents(editorRef.current);
      range.collapse(false); // false = collapse to end
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing]); // Only run when isEditing changes, not when content changes

  // Handle blur - save content
  const handleBlur = (e: React.FocusEvent) => {
    // Don't blur if clicking on toolbar buttons
    const relatedTarget = e.relatedTarget as HTMLElement;
    if (relatedTarget?.closest('[data-toolbar]')) {
      return;
    }
    setIsEditing(false);
    // If user cleared all text, restore default placeholder
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML;
      if (!newContent.trim() || newContent === '<br>') {
        onUpdate({ content: DEFAULT_TEXT });
      }
    }
  };

  // Format text using execCommand
  const applyFormat = (command: string) => {
    // Ensure we have a selection in the editor
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      editorRef.current?.focus();
      return;
    }
    
    // Execute the command
    document.execCommand(command, false);
    
    // After formatting, sync content and refocus
    if (editorRef.current) {
      onUpdate({ content: editorRef.current.innerHTML });
    }
    editorRef.current?.focus();
  };

  // Handle content input in contentEditable
  const handleInput = () => {
    if (editorRef.current) {
      onUpdate({ content: editorRef.current.innerHTML });
    }
  };

  // Keyboard shortcut handling for formatting
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case 'b':
          e.preventDefault();
          applyFormat('bold');
          break;
        case 'i':
          e.preventDefault();
          applyFormat('italic');
          break;
        case 'u':
          e.preventDefault();
          applyFormat('underline');
          break;
      }
    }
  };

  // Resize handle component
  const ResizeHandle = ({ position, cursor }: { position: string; cursor: string }) => {
    const positionStyles: Record<string, React.CSSProperties> = {
      'nw': { top: -4, left: -4, cursor: 'nw-resize' },
      'ne': { top: -4, right: -4, cursor: 'ne-resize' },
      'sw': { bottom: -4, left: -4, cursor: 'sw-resize' },
      'se': { bottom: -4, right: -4, cursor: 'se-resize' },
      'n': { top: -4, left: '50%', transform: 'translateX(-50%)', cursor: 'n-resize' },
      's': { bottom: -4, left: '50%', transform: 'translateX(-50%)', cursor: 's-resize' },
      'e': { right: -4, top: '50%', transform: 'translateY(-50%)', cursor: 'e-resize' },
      'w': { left: -4, top: '50%', transform: 'translateY(-50%)', cursor: 'w-resize' },
    };

    return (
      <div
        className="absolute w-3 h-3 bg-[#0da1c7] border-2 border-white rounded-sm shadow-sm hover:bg-[#0da1c7]-hover z-10"
        style={{ ...positionStyles[position], cursor }}
        onMouseDown={(e) => handleResizeStart(e, position)}
      />
    );
  };

  return (
    <div
      ref={blockRef}
      data-text-block="true"
      className={`absolute z-50 ${isEditing ? '' : 'cursor-move'} ${selected ? 'ring-2 ring-[#0da1c7] ring-offset-1' : ''}`}
      style={{
        left: block.x,
        top: block.y,
        width: block.width,
        height: isEditing ? block.height : 'auto',
        minHeight: block.height,
        fontSize: block.fontSize,
        fontWeight: block.fontWeight,
        color: block.color,
      }}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
    >
      {isEditing ? (
        <div className="relative">
          {/* Formatting Toolbar */}
          <div 
            data-toolbar="true"
            className="absolute -top-9 left-0 flex items-center gap-0.5 bg-slate-800 rounded-t-lg px-1 py-1 shadow-lg z-30"
          >
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); applyFormat('bold'); }}
              className="w-7 h-7 flex items-center justify-center rounded hover:bg-slate-700 text-white font-bold text-sm transition-colors"
              title="Bold (Ctrl+B)"
            >
              B
            </button>
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); applyFormat('italic'); }}
              className="w-7 h-7 flex items-center justify-center rounded hover:bg-slate-700 text-white italic text-sm transition-colors"
              title="Italic (Ctrl+I)"
            >
              I
            </button>
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); applyFormat('underline'); }}
              className="w-7 h-7 flex items-center justify-center rounded hover:bg-slate-700 text-white underline text-sm transition-colors"
              title="Underline (Ctrl+U)"
            >
              U
            </button>
            <div className="w-px h-5 bg-slate-600 mx-1" />
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); applyFormat('strikeThrough'); }}
              className="w-7 h-7 flex items-center justify-center rounded hover:bg-slate-700 text-white line-through text-sm transition-colors"
              title="Strikethrough"
            >
              S
            </button>
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); applyFormat('removeFormat'); }}
              className="w-7 h-7 flex items-center justify-center rounded hover:bg-slate-700 text-white text-xs transition-colors"
              title="Clear Formatting"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="w-px h-5 bg-slate-600 mx-1" />
            {/* Alignment Buttons */}
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); applyFormat('justifyLeft'); onUpdate({ textAlign: 'left' }); }}
              className={`w-7 h-7 flex items-center justify-center rounded transition-colors ${
                block.textAlign === 'left' || !block.textAlign ? 'bg-[#0da1c7] text-white' : 'hover:bg-slate-700 text-white'
              }`}
              title="Align Left"
            >
              <AlignLeft size={14} />
            </button>
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); applyFormat('justifyCenter'); onUpdate({ textAlign: 'center' }); }}
              className={`w-7 h-7 flex items-center justify-center rounded transition-colors ${
                block.textAlign === 'center' ? 'bg-[#0da1c7] text-white' : 'hover:bg-slate-700 text-white'
              }`}
              title="Align Center"
            >
              <AlignCenter size={14} />
            </button>
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); applyFormat('justifyRight'); onUpdate({ textAlign: 'right' }); }}
              className={`w-7 h-7 flex items-center justify-center rounded transition-colors ${
                block.textAlign === 'right' ? 'bg-[#0da1c7] text-white' : 'hover:bg-slate-700 text-white'
              }`}
              title="Align Right"
            >
              <AlignRight size={14} />
            </button>
            <div className="w-px h-5 bg-slate-600 mx-1" />
            {/* Border Toggle */}
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); onUpdate({ showBorder: !block.showBorder }); }}
              className={`w-7 h-7 flex items-center justify-center rounded transition-colors ${
                block.showBorder ? 'bg-[#0da1c7] text-white' : 'hover:bg-slate-700 text-white'
              }`}
              title="Toggle Border"
            >
              <Square size={14} />
            </button>
          </div>
          {/* ContentEditable Editor */}
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={handleInput}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="w-full p-2 border-2 border-[#0da1c7] rounded bg-white focus:outline-none focus:ring-2 focus:ring-[#0da1c7]/30 overflow-auto"
            style={{
              fontSize: block.fontSize,
              fontWeight: block.fontWeight,
              color: block.color,
              minHeight: block.height,
              lineHeight: '1.6',
              textAlign: block.textAlign || 'left',
            }}
          />
        </div>
      ) : (
        <div
          className={`p-2 bg-white rounded h-full ${
            isDefaultText 
              ? 'border-2 border-dashed border-slate-200 text-slate-500 italic' 
              : block.showBorder 
                ? '' 
                : 'border-2 border-solid border-slate-200'
          }`}
          style={{ 
            minHeight: block.height - 16, 
            lineHeight: '1.6',
            textAlign: block.textAlign || 'left',
            border: block.showBorder && !isDefaultText
              ? `${block.borderWidth || 2}px solid ${block.borderColor || '#1c3643'}`
              : undefined,
          }}
          dangerouslySetInnerHTML={{
            __html: isDefaultText 
              ? block.content 
              : block.content || ''
          }}
        />
      )}

      {/* Delete button */}
      {selected && !isEditing && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="absolute -top-3 -right-3 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-500 shadow-md z-20"
        >
          ×
        </button>
      )}

      {/* Resize handles - only show when selected and not editing */}
      {selected && !isEditing && (
        <>
          <ResizeHandle position="nw" cursor="nw-resize" />
          <ResizeHandle position="ne" cursor="ne-resize" />
          <ResizeHandle position="sw" cursor="sw-resize" />
          <ResizeHandle position="se" cursor="se-resize" />
          <ResizeHandle position="n" cursor="n-resize" />
          <ResizeHandle position="s" cursor="s-resize" />
          <ResizeHandle position="e" cursor="e-resize" />
          <ResizeHandle position="w" cursor="w-resize" />
        </>
      )}
    </div>
  );
}

// =================================================================
// REPORT EDITOR PROPS
// =================================================================

export interface ReportEditorProps {
  onSaveDraft?: () => void;
  onReportStateChange?: (state: ReportState, actions: ReportStateActions) => void;
}

// =================================================================
// MAIN REPORT EDITOR COMPONENT
// =================================================================

export function ReportEditor({ onSaveDraft, onReportStateChange }: ReportEditorProps = {}) {
  const { state } = useWizard();
  const { scenarios } = state;

  // Use the centralized report state hook for persistence
  const [reportState, reportActions] = useReportState();


  // Generate a stable report ID based on property info
  const reportId = useMemo(() =>
    `report-${state.subjectData?.propertyName || 'draft'}-${state.subjectData?.address?.street || 'unknown'}`.replace(/\s+/g, '-').toLowerCase().slice(0, 50),
    [state.subjectData?.propertyName, state.subjectData?.address?.street]
  );

  // Auto-save functionality
  const getReportData = useCallback(() => ({
    reportState,
    textBlocks: [],
  }), [reportState]);

  const [autoSaveState, autoSaveActions] = useAutoSave(getReportData, reportId, {
    intervalMs: 30000, // 30 seconds
    debounceMs: 3000, // 3 seconds after change
  });

  // Recovery functionality - check for saved data on mount
  const { hasRecoveryData, versions, recoverVersion, dismissRecovery } = useAutoSaveRecovery(
    'appraisal-wizard-autosave',
    reportId
  );
  const [showRecoveryDialog, setShowRecoveryDialog] = useState(hasRecoveryData);

  const previewRef = useRef<HTMLDivElement>(null);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [textBlocks, setTextBlocks] = useState<TextBlock[]>([]);
  
  // Grid overlay and snap-to-grid state
  const [showGrid, setShowGrid] = useState(false);
  const [gridSize] = useState(16); // 16px grid
  
  // Alignment guides for drag operations
  const [alignmentGuides, setAlignmentGuides] = useState<AlignmentGuide[]>([]);

  // Zoom state
  const [zoomLevel, setZoomLevel] = useState(100); // percentage

  // Find/Replace state
  const [findReplaceOpen, setFindReplaceOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);

  // Section notes state (internal only - not exported)
  const [sectionNotes, setSectionNotes] = useState<Record<string, string>>({});

  // AI loading state
  const [isAILoading, setIsAILoading] = useState(false);

  // Photo editor state
  const [photoEditorOpen, setPhotoEditorOpen] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<PhotoData | null>(null);
  const [photoEdits, setPhotoEdits] = useState<Record<string, PhotoEdits>>({});

  // Inline photo placement state - persisted via reportState.customContent
  const inlinePhotoPlacements: Record<string, InlinePhotoPlacement[]> = useMemo(() => {
    const placements: Record<string, InlinePhotoPlacement[]> = {};
    // Load from customContent for each section
    Object.keys(reportState.customContent || {}).forEach(key => {
      if (key.startsWith('inlinePhotos.')) {
        const sectionId = key.replace('inlinePhotos.', '');
        placements[sectionId] = reportState.customContent[key] || [];
      }
    });
    return placements;
  }, [reportState.customContent]);

  // Available photos - merge wizard state photos from multiple sources
  const availablePhotos: PhotoData[] = useMemo(() => {
    const allPhotos: PhotoData[] = [];
    const seenIds = new Set<string>();

    // 1. Get photos from reportPhotos.assignments (from DocumentIntakePage and SubjectDataPage)
    const reportAssignments = state.reportPhotos?.assignments || [];
    reportAssignments.forEach(assignment => {
      if (assignment.url && !seenIds.has(assignment.id)) {
        seenIds.add(assignment.id);
        allPhotos.push({
          id: assignment.id,
          url: assignment.url,
          caption: assignment.caption || assignment.slotId || 'Photo',
          category: assignment.slotId?.includes('exterior') ? 'exterior'
            : assignment.slotId?.includes('interior') ? 'interior'
            : assignment.slotId?.includes('aerial') ? 'aerial'
            : assignment.slotId?.includes('street') ? 'street'
            : 'general',
        });
      }
    });

    // 2. Get photos from staging photos (from BulkPhotoDropZone)
    const stagingPhotos = state.stagingPhotos || [];
    stagingPhotos
      .filter(p => p.preview && (p.status === 'classified' || p.status === 'pending'))
      .forEach(p => {
        if (!seenIds.has(p.id)) {
          seenIds.add(p.id);
          allPhotos.push({
            id: p.id,
            url: p.preview,
            caption: p.suggestions?.[0]?.slotLabel || p.assignedSlot || p.filename || 'Photo',
            category: p.suggestions?.[0]?.category || 'general',
          });
        }
      });
    
    // 3. If no wizard photos at all, fall back to sample data for demo purposes
    if (allPhotos.length === 0) {
      return sampleAppraisalData.photos.map(p => ({
        id: p.id,
        url: p.url,
        caption: p.caption,
        category: p.category,
      }));
    }
    
    return allPhotos;
  }, [state.reportPhotos?.assignments, state.stagingPhotos]);

  // Handlers for inline photo placement - persist to reportState.customContent
  const handleAssignInlinePhoto = useCallback((sectionId: string, slotId: string, photoId: string) => {
    const currentPlacements = inlinePhotoPlacements[sectionId] || [];
    // Remove any existing placement for this slot
    const filtered = currentPlacements.filter(p => p.slotId !== slotId);
    const newPlacements = [...filtered, { slotId, photoId }];
    
    // Persist to reportState.customContent
    reportActions.setCustomContent(`inlinePhotos.${sectionId}`, newPlacements);
  }, [inlinePhotoPlacements, reportActions]);

  const handleRemoveInlinePhoto = useCallback((sectionId: string, slotId: string) => {
    const currentPlacements = inlinePhotoPlacements[sectionId] || [];
    const newPlacements = currentPlacements.filter(p => p.slotId !== slotId);
    
    // Persist to reportState.customContent
    reportActions.setCustomContent(`inlinePhotos.${sectionId}`, newPlacements);
  }, [inlinePhotoPlacements, reportActions]);

  // Handle recovery - apply recovered data to report state
  const handleRecoverVersion = useCallback((versionId: string) => {
    const recoveredData = recoverVersion(versionId);
    if (recoveredData) {
      // Apply recovered reportState if present
      if (recoveredData.reportState) {
        // Apply custom content
        Object.entries(recoveredData.reportState.customContent || {}).forEach(([key, value]) => {
          reportActions.setCustomContent(key, value);
        });
        // Apply styling
        Object.entries(recoveredData.reportState.styling || {}).forEach(([id, styles]) => {
          reportActions.setElementStyle(id, styles as React.CSSProperties);
        });
        // Apply section visibility
        Object.entries(recoveredData.reportState.sectionVisibility || {}).forEach(([id, visible]) => {
          reportActions.setSectionVisibility(id, visible as boolean);
        });
      }
      // Apply recovered text blocks if present
      if (recoveredData.textBlocks && Array.isArray(recoveredData.textBlocks)) {
        setTextBlocks(recoveredData.textBlocks);
      }
    }
    setShowRecoveryDialog(false);
  }, [recoverVersion, reportActions]);

  const handleDismissRecovery = useCallback(() => {
    dismissRecovery();
    setShowRecoveryDialog(false);
  }, [dismissRecovery]);

  // Undo/Redo for content editing
  interface ContentHistory {
    editedContent: Record<string, unknown>;
    styling: Record<string, React.CSSProperties>;
    sectionOrder: string[]; // Track section ordering for undo/redo
    timestamp: number;
  }

  const {
    state: contentHistoryState,
    setState: setContentHistory,
    undo: undoContentInternal,
    redo: redoContentInternal,
    canUndo,
    canRedo,
  } = useUndoRedo<ContentHistory>({ editedContent: {}, styling: {}, sectionOrder: [], timestamp: Date.now() });

  // Ref to track if we're applying undo/redo (to prevent infinite loops)
  const isApplyingUndoRedo = useRef(false);
  // Ref to track the last state we pushed to history (to detect external changes)
  const lastPushedStateRef = useRef<string>('');

  // Update history when report state changes (but not from undo/redo operations)
  // Note: Section order changes are tracked separately in handleReorderSections
  useEffect(() => {
    if (isApplyingUndoRedo.current) return;

    const stateKey = JSON.stringify({
      customContent: reportState.customContent,
      styling: reportState.styling,
    });

    // Only push to history if state actually changed
    if (reportState.isDirty && stateKey !== lastPushedStateRef.current) {
      lastPushedStateRef.current = stateKey;
      setContentHistory({
        editedContent: reportState.customContent,
        styling: reportState.styling,
        sectionOrder: [], // Section order tracked separately via handleReorderSections
        timestamp: Date.now(),
      }, { merge: true });
    }
  }, [reportState.customContent, reportState.styling, reportState.isDirty, setContentHistory]);

  // Wrapped undo handler that applies state after undo
  const undoContent = useCallback(() => {
    isApplyingUndoRedo.current = true;
    undoContentInternal();
  }, [undoContentInternal]);

  // Wrapped redo handler that applies state after redo
  const redoContent = useCallback(() => {
    isApplyingUndoRedo.current = true;
    redoContentInternal();
  }, [redoContentInternal]);

  // Effect to apply undo/redo state back to reportState
  useEffect(() => {
    if (!isApplyingUndoRedo.current) return;

    // Apply the content from history state
    // First revert all, then re-apply from history
    reportActions.revertAllFields();

    // Apply custom content
    Object.entries(contentHistoryState.editedContent).forEach(([key, value]) => {
      reportActions.setCustomContent(key, value);
    });

    // Apply styling
    Object.entries(contentHistoryState.styling).forEach(([id, styles]) => {
      reportActions.setElementStyle(id, styles);
    });

    // Apply section order if present
    if (contentHistoryState.sectionOrder && contentHistoryState.sectionOrder.length > 0) {
      setReportSections(prev => {
        // Create a map for quick lookup
        const sectionMap = new Map(prev.map(s => [s.id, s]));
        // Reorder based on saved order, keeping any sections not in the saved order at the end
        const reordered: ReportSection[] = [];
        const usedIds = new Set<string>();
        
        contentHistoryState.sectionOrder.forEach(id => {
          const section = sectionMap.get(id);
          if (section) {
            reordered.push(section);
            usedIds.add(id);
          }
        });
        
        // Add any new sections that weren't in the saved order
        prev.forEach(s => {
          if (!usedIds.has(s.id)) {
            reordered.push(s);
          }
        });
        
        // Also update the report state
        reportActions.reorderSections(reordered.map(s => s.id));
        return reordered;
      });
    }

    // Update our tracking ref
    lastPushedStateRef.current = JSON.stringify({
      customContent: contentHistoryState.editedContent,
      styling: contentHistoryState.styling,
      sectionOrder: contentHistoryState.sectionOrder,
    });

    isApplyingUndoRedo.current = false;
  }, [contentHistoryState, reportActions]);

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if the target is an input/textarea (don't intercept their undo)
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      // Ctrl+Z / Cmd+Z for undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (canUndo) {
          undoContent();
        }
      }

      // Ctrl+Shift+Z / Cmd+Shift+Z or Ctrl+Y / Cmd+Y for redo
      if ((e.ctrlKey || e.metaKey) && ((e.key === 'z' && e.shiftKey) || e.key === 'y')) {
        e.preventDefault();
        if (canRedo) {
          redoContent();
        }
      }

      // Ctrl+S / Cmd+S for save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        onSaveDraft?.();
      }

      // Zoom controls: Ctrl++ / Ctrl+= for zoom in
      if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '=')) {
        e.preventDefault();
        setZoomLevel(z => Math.min(150, z + 10));
      }

      // Ctrl+- for zoom out
      if ((e.ctrlKey || e.metaKey) && e.key === '-') {
        e.preventDefault();
        setZoomLevel(z => Math.max(50, z - 10));
      }

      // Ctrl+0 for reset zoom
      if ((e.ctrlKey || e.metaKey) && e.key === '0') {
        e.preventDefault();
        setZoomLevel(100);
      }

      // Ctrl+G for grid toggle
      if ((e.ctrlKey || e.metaKey) && e.key === 'g') {
        e.preventDefault();
        setShowGrid(g => !g);
      }

      // Ctrl+F for find/replace
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        setFindReplaceOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [canUndo, canRedo, undoContent, redoContent, onSaveDraft]);

  // Expose report state to parent components
  useEffect(() => {
    onReportStateChange?.(reportState, reportActions);
  }, [reportState, reportActions, onReportStateChange]);

  // Build dynamic sections based on selected approaches and scenarios
  // This now creates scenario-grouped sections for multi-scenario reports
  const sections = useMemo(() => {
    const dynamicSections: ReportSection[] = [...BASE_REPORT_SECTIONS];

    // Add zoning and environmental exhibits (always available as exhibit pages)
    // These will be populated if/when zoning and environmental data is collected
    dynamicSections.push({ ...ZONING_EXHIBIT_TEMPLATE });
    dynamicSections.push({ ...ENVIRONMENTAL_EXHIBIT_TEMPLATE });

    // For single scenario, use legacy approach (flat sections)
    // For multiple scenarios, use scenario-grouped sections
    const hasMultipleScenarios = scenarios.length > 1;

    if (hasMultipleScenarios) {
      // === MULTI-SCENARIO MODE ===
      // Create scenario groups with color coding (As Is=blue, Completed=green, Stabilized=purple)
      scenarios.forEach((scenario) => {
        // Map scenario name to ScenarioType - handle common variations
        let scenarioType: ScenarioType = 'As Is';
        const lowerName = scenario.name.toLowerCase();
        if (lowerName.includes('completed') || lowerName.includes('prospective')) {
          scenarioType = 'As Completed';
        } else if (lowerName.includes('stabilized')) {
          scenarioType = 'As Stabilized';
        }

        // Generate all sections for this scenario
        const scenarioSections = createScenarioSections(
          scenario.id,
          scenarioType,
          scenario.approaches
        );

        // Add lease abstraction pages if income approach is enabled
        // Note: Lease abstractions will be dynamically populated when tenant data is available
        // from the IncomeApproachGrid component's state (managed separately)

        dynamicSections.push(...scenarioSections);
      });
    } else {
      // === SINGLE SCENARIO MODE (legacy) ===
      // Use flat section structure for backwards compatibility
      const usedApproaches = new Set<string>();
      scenarios.forEach((s) => s.approaches.forEach((a) => usedApproaches.add(a)));

      Object.entries(APPROACH_REPORT_SECTIONS).forEach(([approach, section]) => {
        if (usedApproaches.has(approach)) {
          dynamicSections.push({ ...section });
        }
      });
    }

    dynamicSections.push(...CLOSING_REPORT_SECTIONS);

    return dynamicSections;
  }, [scenarios]);

  const [reportSections, setReportSections] = useState<ReportSection[]>(sections);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);

  // Compute hidden sections (sections hidden due to missing data or approach not selected)
  const hiddenSections = useMemo(() => {
    const hidden: Array<{ id: string; label: string; reason: string }> = [];

    // Check data-dependent sections
    sections.forEach(section => {
      // Demographics requires data
      if (section.id === 'demographics' && !state.demographicsData) {
        hidden.push({ id: section.id, label: section.label, reason: 'No demographics data collected' });
      }
      // SWOT Analysis requires completion
      if (section.id === 'swot' && (!state.swotAnalysis || Object.keys(state.swotAnalysis).length === 0)) {
        hidden.push({ id: section.id, label: section.label, reason: 'SWOT analysis not completed' });
      }
      // Risk Rating requires generation
      if (section.id === 'risk-rating' && !state.riskRating) {
        hidden.push({ id: section.id, label: section.label, reason: 'Risk rating not generated' });
      }
    });

    // Dynamic TOC page hiding based on content section count
    const tocExcludedIds = new Set(['cover', 'toc', 'toc-2', 'toc-3']);
    const contentSectionCount = reportSections.filter(s => 
      s.enabled && !tocExcludedIds.has(s.id)
    ).length;
    
    const ENTRIES_PER_TOC_PAGE = 20;
    const requiredTocPages = Math.max(1, Math.ceil(contentSectionCount / ENTRIES_PER_TOC_PAGE));
    
    // Hide toc-2 if only 1 page needed
    if (requiredTocPages < 2) {
      hidden.push({ 
        id: 'toc-2', 
        label: 'Table of Contents (Continued)', 
        reason: `${contentSectionCount} sections fit on 1 TOC page` 
      });
    }
    // Hide toc-3 if only 1-2 pages needed
    if (requiredTocPages < 3) {
      hidden.push({ 
        id: 'toc-3', 
        label: 'Table of Contents (Continued)', 
        reason: `${contentSectionCount} sections fit on 2 TOC pages` 
      });
    }

    return hidden;
  }, [sections, reportSections, state.demographicsData, state.swotAnalysis, state.riskRating]);

  // Filter out hidden sections from visible list
  const visibleSections = useMemo(() => {
    const hiddenIds = new Set(hiddenSections.map(s => s.id));
    return reportSections.filter(s => !hiddenIds.has(s.id));
  }, [reportSections, hiddenSections]);

  // Sync section visibility with report state
  useEffect(() => {
    // Apply any stored visibility settings
    if (Object.keys(reportState.sectionVisibility).length > 0) {
      setReportSections(prev => prev.map(s => ({
        ...s,
        enabled: reportState.sectionVisibility[s.id] ?? s.enabled,
      })));
    }
  }, [reportState.sectionVisibility]);

  // Handlers
  const handleToggleSection = useCallback((sectionId: string) => {
    setReportSections((prev) => {
      const section = prev.find(s => s.id === sectionId);
      const newEnabled = !section?.enabled;
      // Persist to report state
      reportActions.setSectionVisibility(sectionId, newEnabled);
      return prev.map((s) => (s.id === sectionId ? { ...s, enabled: newEnabled } : s));
    });
  }, [reportActions]);

  const handleToggleField = useCallback((sectionId: string, fieldId: string) => {
    setReportSections((prev) => {
      const section = prev.find(s => s.id === sectionId);
      const field = section?.fields.find(f => f.id === fieldId);
      const currentlyEnabled = field?.enabled ?? true;
      const newEnabled = !currentlyEnabled;
      
      // Persist to report state
      reportActions.setFieldVisibility(sectionId, fieldId, newEnabled);
      
      return prev.map((s) =>
        s.id === sectionId
          ? { ...s, fields: s.fields.map((f) => (f.id === fieldId ? { ...f, enabled: newEnabled } : f)) }
          : s
      );
    });
  }, [reportActions]);

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

  // Handle section reordering from drag-drop
  const handleReorderSections = useCallback((oldIndex: number, newIndex: number) => {
    // Push current state to history before making the change
    setContentHistory({
      editedContent: reportState.customContent || {},
      styling: reportState.styling || {},
      sectionOrder: reportSections.map(s => s.id),
      timestamp: Date.now(),
    });
    
    setReportSections((prev) => {
      const reordered = arrayMove(prev, oldIndex, newIndex);
      // Persist the new order to report state
      reportActions.reorderSections(reordered.map(s => s.id));
      return reordered;
    });
  }, [reportActions, reportState.customContent, reportState.styling, reportSections, setContentHistory]);

  // Track which page is currently visible in the scroll area using Intersection Observer
  useEffect(() => {
    const previewContainer = previewRef.current;
    if (!previewContainer) return;

    const enabledSections = reportSections.filter(s => s.enabled);
    
    // Use scroll-based detection for more accurate tracking
    // This triggers when the section's top enters the top 15% of the viewport
    const observerOptions: IntersectionObserverInit = {
      root: previewContainer,
      rootMargin: '0px 0px -85% 0px', // Section becomes active when its top enters the top 15% of container
      threshold: 0,
    };

    // Track all currently intersecting sections to find the topmost one
    const intersectingSections = new Map<string, number>();

    const observerCallback: IntersectionObserverCallback = (entries) => {
      const containerRect = previewContainer.getBoundingClientRect();
      
      entries.forEach((entry) => {
        const sectionId = entry.target.id.replace('page_', '');
        
        if (entry.isIntersecting) {
          // Store the distance from the section's top to the container's top
          const distanceFromTop = entry.boundingClientRect.top - containerRect.top;
          intersectingSections.set(sectionId, distanceFromTop);
        } else {
          intersectingSections.delete(sectionId);
        }
      });

      // Find the section closest to the top of the viewport (smallest positive distance, or least negative)
      if (intersectingSections.size > 0) {
        let closestSection = '';
        let closestDistance = Infinity;
        
        intersectingSections.forEach((distance, sectionId) => {
          // Prefer sections whose top is at or above the viewport top (negative or small positive distance)
          // but still visible in the detection zone
          if (distance < closestDistance) {
            closestDistance = distance;
            closestSection = sectionId;
          }
        });
        
        if (closestSection) {
          setActiveSectionId(closestSection);
        }
      }
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    // Observe all page sections
    enabledSections.forEach((section) => {
      const element = document.getElementById(`page_${section.id}`);
      if (element) {
        observer.observe(element);
      }
    });

    // Set initial active section to first enabled section if not set
    if (!activeSectionId && enabledSections.length > 0) {
      setActiveSectionId(enabledSections[0].id);
    }

    return () => observer.disconnect();
  }, [reportSections, activeSectionId]);

  // Handle style changes via report state
  const handleStyleChange = useCallback((elementId: string, styles: Partial<ElementStyles>) => {
    if (!elementId) return;
    // Convert ElementStyles to CSSProperties for the hook
    const cssStyles: React.CSSProperties = {};
    if (styles.fontFamily) cssStyles.fontFamily = styles.fontFamily;
    if (styles.fontSize) cssStyles.fontSize = `${styles.fontSize}px`;
    if (styles.fontWeight) cssStyles.fontWeight = styles.fontWeight as React.CSSProperties['fontWeight'];
    if (styles.color) cssStyles.color = styles.color;
    if (styles.textAlign) cssStyles.textAlign = styles.textAlign;
    if (styles.marginTop !== undefined) cssStyles.marginTop = `${styles.marginTop}px`;
    if (styles.marginBottom !== undefined) cssStyles.marginBottom = `${styles.marginBottom}px`;

    reportActions.setElementStyle(elementId, cssStyles);
  }, [reportActions]);

  // Handle content changes via report state - using custom content
  const handleContentChange = useCallback((elementId: string, content: string) => {
    reportActions.setCustomContent(`content:${elementId}`, content);
  }, [reportActions]);

  // Get style value from report state
  const getElementStyle = useCallback((elementId: string): React.CSSProperties => {
    return reportState.styling[elementId] || {};
  }, [reportState.styling]);

  const handleDeleteElement = useCallback(() => {
    setSelectedElement(null);
  }, []);

  const handleAddTextBlock = useCallback(() => {
    // Smart positioning: Determine position based on scroll and visible page
    const previewContainer = previewRef.current;
    let targetPageId = activeSectionId || 'cover';
    let yPosition = 100;
    
    if (previewContainer) {
      const scrollTop = previewContainer.scrollTop;
      const containerRect = previewContainer.getBoundingClientRect();
      const viewportCenter = containerRect.height / 2;
      
      // Find which page element is currently in view
      const enabledSections = reportSections.filter(s => s.enabled);
      for (const section of enabledSections) {
        const pageElement = document.getElementById(`page_${section.id}`);
        if (pageElement) {
          const pageRect = pageElement.getBoundingClientRect();
          const pageRelativeTop = pageRect.top - containerRect.top;
          const pageRelativeBottom = pageRelativeTop + pageRect.height;
          
          // Check if this page is visible in the viewport
          if (pageRelativeTop < viewportCenter && pageRelativeBottom > 0) {
            targetPageId = section.id;
            
            // Calculate Y position relative to the page element
            // Position it roughly where the user is looking (center of visible area)
            const visibleTop = Math.max(0, -pageRelativeTop);
            const visibleBottom = Math.min(pageRect.height, containerRect.height - pageRelativeTop);
            yPosition = (visibleTop + visibleBottom) / 2 - 40; // -40 to account for block height/2
            
            // Clamp to reasonable bounds
            yPosition = Math.max(50, Math.min(yPosition, pageRect.height - 100));
            break;
          }
        }
      }
    }
    
    const newBlock: TextBlock = {
      id: `text-block-${Date.now()}`,
      content: 'New text block - double-click to edit',
      x: 100,
      y: yPosition,
      width: 220,
      height: 80,
      fontSize: 14,
      fontWeight: 'normal',
      color: '#1e293b',
      pageId: targetPageId,
      textAlign: 'left',
      showBorder: false,
      borderColor: '#1c3643',
      borderWidth: 2,
    };
    setTextBlocks((prev) => [...prev, newBlock]);
    setSelectedElement(newBlock.id);
    // Also store in custom content for persistence
    reportActions.setCustomContent(`textBlock:${newBlock.id}`, newBlock);
  }, [activeSectionId, reportActions, reportSections]);

  const handleUpdateTextBlock = useCallback((blockId: string, updates: Partial<TextBlock>) => {
    setTextBlocks((prev) => {
      const updated = prev.map((b) => (b.id === blockId ? { ...b, ...updates } : b));
      // Persist to report state
      const block = updated.find(b => b.id === blockId);
      if (block) {
        reportActions.setCustomContent(`textBlock:${blockId}`, block);
      }
      return updated;
    });
  }, [reportActions]);

  const handleDeleteTextBlock = useCallback((blockId: string) => {
    setTextBlocks((prev) => prev.filter((b) => b.id !== blockId));
    setSelectedElement(null);
    // Remove from custom content
    reportActions.setCustomContent(`textBlock:${blockId}`, null);
  }, [reportActions]);

  // Find/Replace handlers
  const handleSearch = useCallback((term: string, caseSensitive: boolean): SearchResult[] => {
    if (!term) {
      setSearchResults([]);
      return [];
    }

    const results: SearchResult[] = [];
    const searchFlags = caseSensitive ? 'g' : 'gi';
    const regex = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), searchFlags);

    // Search in custom content (edited text)
    Object.keys(reportState.customContent || {}).forEach(elementId => {
      const content = reportState.customContent[elementId];
      if (typeof content === 'string') {
        let match;
        let matchIndex = 0;
        while ((match = regex.exec(content)) !== null) {
          results.push({
            elementId,
            matchIndex,
            startIndex: match.index,
            endIndex: match.index + match[0].length,
            context: content.substring(Math.max(0, match.index - 20), match.index + match[0].length + 20),
          });
          matchIndex++;
        }
      }
    });

    // Search in text blocks
    textBlocks.forEach(block => {
      const plainText = block.content.replace(/<[^>]+>/g, ''); // Strip HTML
      let match;
      let matchIndex = 0;
      while ((match = regex.exec(plainText)) !== null) {
        results.push({
          elementId: block.id,
          matchIndex,
          startIndex: match.index,
          endIndex: match.index + match[0].length,
          context: plainText.substring(Math.max(0, match.index - 20), match.index + match[0].length + 20),
        });
        matchIndex++;
      }
    });

    setSearchResults(results);
    setCurrentMatchIndex(0);
    return results;
  }, [reportState.customContent, textBlocks]);

  const handleReplace = useCallback((term: string, replacement: string, all = false): number => {
    if (!term) return 0;

    let replaceCount = 0;
    const searchFlags = 'g'; // Always global for replace

    // Replace in custom content
    Object.keys(reportState.customContent || {}).forEach(elementId => {
      const content = reportState.customContent[elementId];
      if (typeof content === 'string' && content.includes(term)) {
        if (all) {
          const regex = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), searchFlags);
          const matches = content.match(regex);
          if (matches) {
            replaceCount += matches.length;
            reportActions.setCustomContent(elementId, content.replace(regex, replacement));
          }
        } else if (replaceCount === 0) {
          // Replace first occurrence only
          const index = content.indexOf(term);
          if (index !== -1) {
            replaceCount = 1;
            const newContent = content.substring(0, index) + replacement + content.substring(index + term.length);
            reportActions.setCustomContent(elementId, newContent);
          }
        }
      }
    });

    // Replace in text blocks
    textBlocks.forEach(block => {
      const plainText = block.content.replace(/<[^>]+>/g, '');
      if (plainText.includes(term)) {
        if (all) {
          const regex = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), searchFlags);
          const matches = block.content.match(regex);
          if (matches) {
            replaceCount += matches.length;
            handleUpdateTextBlock(block.id, { content: block.content.replace(regex, replacement) });
          }
        } else if (replaceCount === 0) {
          const index = block.content.indexOf(term);
          if (index !== -1) {
            replaceCount = 1;
            const newContent = block.content.substring(0, index) + replacement + block.content.substring(index + term.length);
            handleUpdateTextBlock(block.id, { content: newContent });
          }
        }
      }
    });

    return replaceCount;
  }, [reportState.customContent, textBlocks, reportActions, handleUpdateTextBlock]);

  const handleNavigateToMatch = useCallback((result: SearchResult) => {
    // Select the element
    setSelectedElement(result.elementId);
    
    // Scroll to the element
    const element = document.getElementById(`page_${result.elementId}`) || 
                    document.querySelector(`[data-element-id="${result.elementId}"]`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  // Section notes handlers
  const handleNoteChange = useCallback((sectionId: string, note: string) => {
    setSectionNotes(prev => {
      if (!note) {
        // Delete the note
        const { [sectionId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [sectionId]: note };
    });
  }, []);

  // AI generation handlers
  const handleAIRewrite = useCallback(async (elementId: string, currentText: string): Promise<string> => {
    setIsAILoading(true);
    try {
      // Simulate AI call - in production, this would call an actual AI service
      // For now, we'll return a mock response after a delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Create a professionally rewritten version
      const rewrittenText = `Based on our thorough analysis and in accordance with USPAP Standards, ${currentText.trim()}. This determination reflects our professional assessment of the subject property and current market conditions.`;
      
      // Update the content
      reportActions.setCustomContent(elementId, rewrittenText);
      return rewrittenText;
    } finally {
      setIsAILoading(false);
    }
  }, [reportActions]);

  const handleAIExpand = useCallback(async (elementId: string, currentText: string): Promise<string> => {
    setIsAILoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Create an expanded version
      const expandedText = `${currentText.trim()}\n\nThis conclusion is further supported by our comprehensive analysis of comparable properties in the immediate market area. The subject property's location, physical characteristics, and current market conditions have all been carefully considered in reaching this determination. Our research indicates that these factors are consistent with the broader market trends observed in similar property types within this submarket.`;
      
      reportActions.setCustomContent(elementId, expandedText);
      return expandedText;
    } finally {
      setIsAILoading(false);
    }
  }, [reportActions]);

  const handleAIShorten = useCallback(async (elementId: string, currentText: string): Promise<string> => {
    setIsAILoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Create a shortened version by taking first sentence or truncating
      const sentences = currentText.split(/[.!?]+/).filter(s => s.trim());
      const shortenedText = sentences.slice(0, Math.min(2, sentences.length)).join('. ').trim() + '.';
      
      reportActions.setCustomContent(elementId, shortenedText);
      return shortenedText;
    } finally {
      setIsAILoading(false);
    }
  }, [reportActions]);

  // Photo editing handlers
  const handleOpenPhotoEditor = useCallback((photo: PhotoData) => {
    setEditingPhoto(photo);
    setPhotoEditorOpen(true);
  }, []);

  const handleSavePhotoEdits = useCallback((photoId: string, edits: PhotoEdits, newUrl?: string) => {
    setPhotoEdits(prev => ({
      ...prev,
      [photoId]: edits,
    }));
    // Save to report state
    reportActions.setCustomContent(`photo:${photoId}`, { edits, newUrl });
  }, [reportActions]);

  const handleDeletePhoto = useCallback((photoId: string) => {
    // Mark photo as deleted in report state
    reportActions.setCustomContent(`photo:${photoId}`, { deleted: true });
  }, [reportActions]);

  // Get photo edits for a specific photo
  const getPhotoEdits = useCallback((photoId: string) => {
    return photoEdits[photoId];
  }, [photoEdits]);

  // Build edited content map from report state for components
  const editedContent = useMemo(() => {
    const result: Record<string, string> = {};
    Object.entries(reportState.customContent).forEach(([key, value]) => {
      if (key.startsWith('content:')) {
        const elementId = key.replace('content:', '');
        result[elementId] = value as string;
      }
    });
    return result;
  }, [reportState.customContent]);

  // For properties panel - convert report state styling to ElementStyles format
  const elementStyles = useMemo((): ElementStyles => {
    if (!selectedElement || !reportState.styling[selectedElement]) return {};
    const css = reportState.styling[selectedElement];
    const styles: ElementStyles = {};
    if (css.fontFamily) styles.fontFamily = css.fontFamily as string;
    if (css.fontSize) styles.fontSize = parseInt(css.fontSize as string) || 14;
    if (css.fontWeight) styles.fontWeight = css.fontWeight as string;
    if (css.color) styles.color = css.color as string;
    if (css.textAlign) styles.textAlign = css.textAlign as 'left' | 'center' | 'right';
    if (css.marginTop) styles.marginTop = parseInt(css.marginTop as string) || 0;
    if (css.marginBottom) styles.marginBottom = parseInt(css.marginBottom as string) || 0;
    return styles;
  }, [selectedElement, reportState.styling]);

  // For properties panel - build element content from report state
  const elementContent = useMemo((): ElementContent => {
    const result: ElementContent = {};
    Object.entries(reportState.customContent).forEach(([key, value]) => {
      if (key.startsWith('content:')) {
        const elementId = key.replace('content:', '');
        result[elementId] = {
          text: value as string,
          styles: {},
        };
      }
    });
    return result;
  }, [reportState.customContent]);

  const handleInlineContentChange = useCallback((elementId: string, content: string) => {
    handleContentChange(elementId, content);
  }, [handleContentChange]);

  // Helper: Get field visibility map for a specific section
  // Converts from "sectionId:fieldId" format to just "fieldId" for the component
  const getFieldVisibilityForSection = useCallback((sectionId: string): Record<string, boolean> => {
    const prefix = `${sectionId}:`;
    const result: Record<string, boolean> = {};
    Object.entries(reportState.fieldVisibility).forEach(([key, value]) => {
      if (key.startsWith(prefix)) {
        const fieldId = key.slice(prefix.length);
        result[fieldId] = value;
      }
    });
    return result;
  }, [reportState.fieldVisibility]);

  // =================================================================
  // SCENARIO REPORT PREVIEW HELPERS (Scenario pages must never hit Generic placeholder)
  // =================================================================
  const getScenarioMultiplier = useCallback((scenarioName?: string) => {
    const name = (scenarioName || '').toLowerCase();
    if (name.includes('completed')) return 1.15;
    if (name.includes('stabilized')) return 1.08;
    return 1.0; // As Is
  }, []);

  const buildScenarioComparableCardsData = useCallback((section: ReportSection): ComparableCardsPageData => {
    const scenarioId = section.scenarioId ?? 1;
    const scenarioName = section.scenarioName ?? 'As Is';
    const mult = getScenarioMultiplier(scenarioName);

    const comparableType = section.comparableType ?? 'improved';
    const approachType: ComparableCardsPageData['approachType'] =
      comparableType === 'rent' ? 'rent' : comparableType === 'land' ? 'land' : 'sales';

    const subjectCityStateZip = `${sampleAppraisalData.property.city}, ${sampleAppraisalData.property.state} ${sampleAppraisalData.property.zip}`;

    const buildImprovedComps = (): ComparableCardData[] => {
      return sampleAppraisalData.comparables.slice(0, 3).map((c) => ({
        id: c.id,
        type: 'improved',
        photoUrl: c.photoUrl,
        address: c.address,
        cityStateZip: subjectCityStateZip,
        saleDate: c.saleDate,
        salePrice: Math.round(c.salePrice * mult),
        pricePerUnit: Number((c.pricePerSF * mult).toFixed(2)),
        unitLabel: 'SF',
        size: c.buildingSize,
        sizeLabel: 'SF',
        yearBuilt: c.yearBuilt,
        propertyType: 'Industrial',
        narrative: 'Comparable sale selected for location, utility, and overall similarity to the subject.',
        netAdjustment: c.adjustments.total,
        adjustedValue: Math.round(c.salePrice * (1 + c.adjustments.total / 100) * mult),
      }));
    };

    const buildRentComps = (): ComparableCardData[] => {
      const base = sampleAppraisalData.incomeApproach.marketRentPerSF;
      const bumps = [-0.75, -0.25, 0.50];
      return bumps.map((b, idx) => ({
        id: `rent-comp-${scenarioId}-${idx + 1}`,
        type: 'rent',
        photoUrl: sampleAppraisalData.photos.find((p) => p.category === 'exterior')?.url,
        address: `Rent Comparable ${idx + 1} — ${sampleAppraisalData.property.city}`,
        cityStateZip: subjectCityStateZip,
        saleDate: sampleAppraisalData.assignment.effectiveDate,
        pricePerUnit: Number(((base + b) * mult).toFixed(2)),
        unitLabel: 'SF',
        size: Math.round(sampleAppraisalData.improvements.grossBuildingArea * (0.85 + idx * 0.1)),
        sizeLabel: 'SF',
        yearBuilt: sampleAppraisalData.improvements.yearBuilt - (idx + 1),
        propertyType: 'Industrial',
        narrative: 'Rental comparable adjusted for size, location, and lease structure.',
        netAdjustment: idx === 0 ? -5 : idx === 1 ? 0 : 3,
      }));
    };

    const buildLandComps = (): ComparableCardData[] => {
      const subjectAc = sampleAppraisalData.site.landArea;
      const baseLandValue = sampleAppraisalData.valuation.landValue;
      const basePpa = baseLandValue / Math.max(subjectAc, 0.01);
      const acres = [1.25, 1.65, 2.10];
      const ppaBumps = [-0.08, 0.0, 0.06];
      return acres.map((ac, idx) => ({
        id: `land-comp-${scenarioId}-${idx + 1}`,
        type: 'land',
        photoUrl: sampleAppraisalData.photos.find((p) => p.category === 'aerial')?.url,
        address: `Land Comparable ${idx + 1} — ${sampleAppraisalData.property.city}`,
        cityStateZip: subjectCityStateZip,
        saleDate: sampleAppraisalData.assignment.effectiveDate,
        salePrice: Math.round(basePpa * (1 + ppaBumps[idx]) * ac * mult),
        pricePerUnit: Math.round(basePpa * (1 + ppaBumps[idx]) * mult),
        unitLabel: 'Acre',
        size: ac,
        sizeLabel: 'Acres',
        propertyType: 'Industrial Land',
        narrative: 'Vacant industrial land sale adjusted to reflect subject zoning/utility and location.',
        netAdjustment: Math.round(ppaBumps[idx] * 100),
        adjustedValue: Math.round(basePpa * ac * mult),
      }));
    };

    const comparables =
      comparableType === 'rent' ? buildRentComps() : comparableType === 'land' ? buildLandComps() : buildImprovedComps();

    return {
      approachType,
      scenarioId,
      scenarioName,
      comparables,
    };
  }, [getScenarioMultiplier]);

  const buildScenarioComparableMapData = useCallback((section: ReportSection): ComparableMapData => {
    const scenarioId = section.scenarioId ?? 1;
    const scenarioName = section.scenarioName ?? 'As Is';
    const comparableType = section.comparableType ?? 'improved';
    const approachType: ComparableMapData['approachType'] =
      comparableType === 'rent' ? 'rent' : comparableType === 'land' ? 'land' : 'sales';

    const subjectLat = sampleAppraisalData.property.latitude;
    const subjectLng = sampleAppraisalData.property.longitude;

    // Deterministic "fake" coordinates around the subject for demo rendering
    const offsets = [
      { lat: 0.012, lng: -0.008 },
      { lat: -0.009, lng: 0.011 },
      { lat: 0.006, lng: 0.016 },
    ];

    const cards = buildScenarioComparableCardsData(section).comparables.slice(0, 3);

    return {
      approachType,
      scenarioId,
      imageUrl: '',
      subjectPin: {
        lat: subjectLat,
        lng: subjectLng,
        address: sampleAppraisalData.property.fullAddress,
      },
      comparablePins: cards.map((c, idx) => ({
        id: c.id,
        number: idx + 1,
        lat: subjectLat + offsets[idx].lat,
        lng: subjectLng + offsets[idx].lng,
        address: c.address,
      })),
    };
  }, [buildScenarioComparableCardsData]);

  const buildScenarioSalesGridData = useCallback((scenarioName?: string) => {
    const mult = getScenarioMultiplier(scenarioName);
    const subject = sampleAppraisalData;
    return {
      subject: {
        address: subject.property.fullAddress,
        salePrice: '-',
        pricePerSF: '-',
        propertyRights: 'Fee Simple',
        financing: '-',
        conditionsOfSale: '-',
        marketConditions: '-',
        location: 'Subject',
        siteSize: `${subject.site.landArea} AC`,
        buildingSize: `${subject.improvements.grossBuildingArea.toLocaleString()} SF`,
        yearBuilt: String(subject.improvements.yearBuilt),
        condition: subject.improvements.condition,
      },
      comparables: subject.comparables.slice(0, 3).map((c, index) => ({
        id: c.id,
        label: `Sale ${index + 1}`,
        data: {
          address: c.address,
          salePrice: `$${Math.round(c.salePrice * mult).toLocaleString()}`,
          pricePerSF: `$${(c.pricePerSF * mult).toFixed(2)}/SF`,
          propertyRights: 'Fee Simple',
          financing: index % 2 === 0 ? 'Cash' : 'Conventional',
          conditionsOfSale: 'Arms Length',
          marketConditions: '0%',
          location: c.adjustments.location === 0 ? 'Similar' : c.adjustments.location > 0 ? 'Inferior' : 'Superior',
          siteSize: 'Similar',
          buildingSize: `${c.buildingSize.toLocaleString()} SF`,
          yearBuilt: String(c.yearBuilt),
          condition: 'Good',
        },
        adjustments: {
          location: Math.round(c.salePrice * mult * (c.adjustments.location / 100)),
          siteSize: Math.round(c.salePrice * mult * (c.adjustments.size / 100)),
          buildingSize: 0,
          yearBuilt: Math.round(c.salePrice * mult * (c.adjustments.age / 100)),
          condition: Math.round(c.salePrice * mult * (c.adjustments.condition / 100)),
        },
      })),
      adjustmentRows: ['location', 'siteSize', 'buildingSize', 'yearBuilt', 'condition'],
      totalAdjustmentRow: true,
    };
  }, [getScenarioMultiplier]);

  const buildScenarioIncomeGridData = useCallback((scenarioName?: string) => {
    const mult = getScenarioMultiplier(scenarioName);
    const income = sampleAppraisalData.incomeApproach;
    const pgi = Math.round(income.potentialGrossIncome * mult);
    const vacancy = Math.round(pgi * (income.vacancyRate / 100));
    const egi = pgi - vacancy;
    const expensesTotal = Math.round(income.operatingExpenses * mult);
    const noi = Math.round(income.netOperatingIncome * mult);
    const indicatedValue = Math.round(income.valueConclusion * mult);
    return {
      pgi,
      vacancy,
      egi,
      expenses: {
        propertyTaxes: Math.round(expensesTotal * 0.45),
        insurance: Math.round(expensesTotal * 0.17),
        utilities: Math.round(expensesTotal * 0.13),
        repairs: Math.round(expensesTotal * 0.25),
        management: Math.round(egi * 0.05),
        reserves: Math.round(expensesTotal * 0.10),
      },
      totalExpenses: expensesTotal,
      noi,
      capRate: income.capRate,
      indicatedValue,
    };
  }, [getScenarioMultiplier]);

  const buildScenarioDCFData = useCallback((section: ReportSection): DCFProjectionPageData => {
    const scenarioId = section.scenarioId ?? 1;
    const scenarioName = section.scenarioName ?? 'As Is';
    const mult = getScenarioMultiplier(scenarioName);

    const holdingPeriod = 10;
    const discountRate = scenarioName.toLowerCase().includes('completed') ? 9.25 : scenarioName.toLowerCase().includes('stabilized') ? 9.75 : 10.25;
    const terminalCapRate = scenarioName.toLowerCase().includes('completed') ? 7.25 : scenarioName.toLowerCase().includes('stabilized') ? 7.5 : 7.75;
    const annualGrowthRate = scenarioName.toLowerCase().includes('stabilized') ? 3.25 : 3.0;

    const baseNoi = sampleAppraisalData.incomeApproach.netOperatingIncome * mult;
    const yearlyProjections = Array.from({ length: holdingPeriod }).map((_, i) => {
      const year = i + 1;
      const noi = Math.round(baseNoi * Math.pow(1 + annualGrowthRate / 100, i));
      const pvFactor = 1 / Math.pow(1 + discountRate / 100, year);
      const pvCashFlow = Math.round(noi * pvFactor);
      return { year, noi, pvFactor, pvCashFlow };
    });

    const lastNoi = yearlyProjections[yearlyProjections.length - 1]?.noi ?? 0;
    const reversionValue = Math.round(lastNoi / (terminalCapRate / 100));
    const pvReversionFactor = 1 / Math.pow(1 + discountRate / 100, holdingPeriod);
    const pvReversion = Math.round(reversionValue * pvReversionFactor);
    const totalPresentValue = Math.round(yearlyProjections.reduce((sum, y) => sum + y.pvCashFlow, 0) + pvReversion);

    return {
      scenarioId,
      scenarioName,
      holdingPeriod,
      discountRate,
      terminalCapRate,
      annualGrowthRate,
      yearlyProjections,
      reversionValue,
      pvReversion,
      totalPresentValue,
    };
  }, [getScenarioMultiplier]);

  const buildScenarioLandValuationData = useCallback((scenarioName?: string): import('../../../types').LandValuationData => {
    const mult = getScenarioMultiplier(scenarioName);
    const subjectAcreage = sampleAppraisalData.site.landArea;
    const concludedLandValue = Math.round(sampleAppraisalData.valuation.landValue * mult);
    const concludedPricePerAcre = Math.round(concludedLandValue / Math.max(subjectAcreage, 0.01));

    const basePpa = sampleAppraisalData.valuation.landValue / Math.max(subjectAcreage, 0.01);
    const acres = [1.25, 1.65, 2.10];
    const ppaBumps = [-0.08, 0.0, 0.06];

    const landComps = acres.map((ac, idx) => {
      const pricePerAcre = Math.round(basePpa * (1 + ppaBumps[idx]) * mult);
      const salePrice = Math.round(pricePerAcre * ac);
      const adjustedPricePerAcre = Math.round(basePpa * mult);
      return {
        id: `land-sale-${idx + 1}`,
        address: `Land Sale ${idx + 1} — ${sampleAppraisalData.property.city}`,
        saleDate: sampleAppraisalData.assignment.effectiveDate,
        salePrice,
        acreage: ac,
        pricePerAcre,
        zoning: sampleAppraisalData.site.zoning,
        adjustments: {
          location: ppaBumps[idx] * 100,
          size: 0,
          zoning: 0,
        },
        adjustedPricePerAcre,
      };
    });

    return {
      landComps,
      subjectAcreage,
      concludedPricePerAcre,
      concludedLandValue,
      reconciliationText: `Market evidence supports a land value indication of approximately $${concludedPricePerAcre.toLocaleString()} per acre, applied to ${subjectAcreage.toFixed(2)} acres, for a concluded land value of $${concludedLandValue.toLocaleString()} (${scenarioName || 'As Is'} scenario).`,
    };
  }, [getScenarioMultiplier]);

  // Render the appropriate page component
  // pageIndex here is the position in the rendered visibleSections array (0-indexed)
  // We pass pageIndex + 1 as the dynamic page number (1-indexed for display)
  const renderPage = (section: ReportSection, pageIndex: number) => {
    // Get field visibility for this section
    const fieldVisibility = getFieldVisibilityForSection(section.id);
    
    // Dynamic page number: 1-indexed position in the visible sections
    const dynamicPageNumber = pageIndex + 1;
    
    const commonProps = {
      selectedElement,
      onSelectElement: setSelectedElement,
      onContentChange: handleInlineContentChange,
      editedContent,
      getAppliedStyle: getElementStyle,
      fieldVisibility,
      pageNumber: dynamicPageNumber,
    };

    const photoProps = {
      ...commonProps,
      onOpenPhotoEditor: handleOpenPhotoEditor,
      getPhotoEdits,
    };

    // Scenario pages (dynamic IDs/types) — must not fall through to Generic placeholder
    if (section.isScenarioHeader) {
      const scenarioName = section.scenarioName ?? (section.label.replace(' VALUATION', '') || 'As Is');
      const mult = getScenarioMultiplier(scenarioName);
      const deltaPct = Math.round((mult - 1) * 100);
      const subtitle =
        mult === 1 ? 'Baseline valuation (As Is)' : `Scenario uplift applied: +${deltaPct}%`;

      return (
        <ReportPageBase
          title={section.label}
          sidebarLabel="VALUATION"
          pageNumber={dynamicPageNumber}
          sectionNumber={6}
          sectionTitle="VALUATION"
          contentPadding="p-10"
        >
          <div className="mt-2 text-sm text-slate-600">{subtitle}</div>

          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs text-slate-500 uppercase tracking-wide">Scenario</div>
              <div className="mt-1 text-xl font-semibold text-slate-800">{scenarioName}</div>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs text-slate-500 uppercase tracking-wide">Multiplier</div>
              <div className="mt-1 text-xl font-semibold text-slate-800">{mult.toFixed(2)}×</div>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs text-slate-500 uppercase tracking-wide">Implied Value (Sales)</div>
              <div className="mt-1 text-xl font-semibold text-slate-800">
                ${(Math.round(sampleAppraisalData.valuation.salesComparisonValue * mult)).toLocaleString()}
              </div>
            </div>
          </div>

          <div className="mt-6 text-xs text-slate-500">
            Scenario pages below render from the same report-preview components used elsewhere; when wizard data is missing, sample data is shown.
          </div>
        </ReportPageBase>
      );
    }

    if (section.type === 'comparable-cards') {
      const cardsData = buildScenarioComparableCardsData(section);
      return (
        <ComparableSummaryCardsPage
          data={cardsData}
          pageNumber={1}
          reportPageNumber={dynamicPageNumber}
          totalPages={1}
        />
      );
    }

    if (section.type === 'comparable-map') {
      const mapData = buildScenarioComparableMapData(section);
      return (
        <ComparableLocationMapPage
          data={mapData}
          pageNumber={dynamicPageNumber}
          scenarioName={section.scenarioName}
        />
      );
    }

    if (section.type === 'dcf-projection') {
      return <DCFProjectionPage data={buildScenarioDCFData(section)} pageNumber={dynamicPageNumber} />;
    }

    if (section.type === 'scenario-reconciliation') {
      const scenarioName = section.scenarioName ?? 'As Is';
      const mult = getScenarioMultiplier(scenarioName);
      const values = [
        { key: 'Sales Comparison', value: Math.round(sampleAppraisalData.valuation.salesComparisonValue * mult) },
        { key: 'Income Approach', value: Math.round(sampleAppraisalData.valuation.incomeApproachValue * mult) },
        { key: 'Cost Approach', value: Math.round(sampleAppraisalData.valuation.costApproachValue * mult) },
        { key: 'Land Valuation', value: Math.round(sampleAppraisalData.valuation.landValue * mult) },
      ];

      const scenarioRecon = state.reconciliationData?.scenarioReconciliations?.find((r) => r.scenarioId === section.scenarioId);
      const weights = scenarioRecon?.weights || { 'Sales Comparison': 50, 'Income Approach': 30, 'Cost Approach': 20 };

      const concluded = values.reduce((sum, v) => {
        const w = weights[v.key] ?? 0;
        return sum + (v.value * w) / 100;
      }, 0);

      return (
        <ReportPageBase
          title={`${scenarioName} Reconciliation`}
          sidebarLabel="RECON"
          pageNumber={dynamicPageNumber}
          sectionNumber={7}
          sectionTitle="VALUE"
          contentPadding="p-10"
        >
          <div className="text-sm text-slate-600 mb-4">
            Weighted reconciliation of indicated values by approach. Values shown reflect scenario multiplier.
          </div>

          <div className="border border-slate-200 rounded-lg overflow-hidden mb-5">
            <table className="w-full text-sm">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold text-slate-700">Approach</th>
                  <th className="px-4 py-2 text-right font-semibold text-slate-700">Indication</th>
                  <th className="px-4 py-2 text-right font-semibold text-slate-700">Weight</th>
                </tr>
              </thead>
              <tbody>
                {values.map((row) => (
                  <tr key={row.key} className="border-t border-slate-200">
                    <td className="px-4 py-2 text-slate-800">{row.key}</td>
                    <td className="px-4 py-2 text-right font-medium text-slate-800">${row.value.toLocaleString()}</td>
                    <td className="px-4 py-2 text-right text-slate-600">{(weights[row.key] ?? 0)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-gradient-to-r from-[#0da1c7]/10 to-[#0da1c7]/10 rounded-lg border border-[#0da1c7]/20">
            <div className="text-xs text-[#0da1c7] uppercase tracking-wider mb-1">Concluded Value (weighted)</div>
            <div className="text-3xl font-bold text-[#0da1c7]">${Math.round(concluded / 5000) * 5000}</div>
            {scenarioRecon?.comments && (
              <div className="mt-3 text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">{scenarioRecon.comments}</div>
            )}
          </div>
        </ReportPageBase>
      );
    }

    // Scenario approach pages (dynamic IDs)
    if (section.id.startsWith('sales-comparison-')) {
      const mult = getScenarioMultiplier(section.scenarioName);
      const concluded = Math.round(sampleAppraisalData.valuation.salesComparisonValue * mult);
      return (
        <ComparisonGridPage
          approachType="sales"
          title="Sales Comparison Approach"
          pageNumber={dynamicPageNumber}
          scenarioId={section.scenarioId}
          scenarioName={section.scenarioName}
          data={buildScenarioSalesGridData(section.scenarioName)}
          methodologyText={sampleAppraisalData.salesComparison.methodology}
          narrativeText={'Comparable sales were analyzed and adjusted for market-supported differences. Final selection of the indicated value reflects greatest emphasis on overall comparability and reliability of verified data.'}
          concludedValue={concluded}
        />
      );
    }

    if (section.id.startsWith('income-approach-')) {
      return (
        <IncomeGridPage
          title="Income Approach"
          pageNumber={dynamicPageNumber}
          scenarioId={section.scenarioId}
          scenarioName={section.scenarioName}
          data={buildScenarioIncomeGridData(section.scenarioName)}
          methodologyText={sampleAppraisalData.incomeApproach.methodology}
          narrativeText={'Market rent, stabilized occupancy, and operating expenses were derived from market evidence and applied to a stabilized operating statement. Value was estimated via direct capitalization and supported by sensitivity considerations.'}
        />
      );
    }

    if (section.id.startsWith('cost-approach-')) {
      return <CostApproachPage {...commonProps} valueMultiplier={getScenarioMultiplier(section.scenarioName)} />;
    }

    if (section.id.startsWith('land-valuation-')) {
      return (
        <LandValuationPage
          {...commonProps}
          landValuationData={buildScenarioLandValuationData(section.scenarioName)}
        />
      );
    }

    switch (section.id) {
      case 'cover':
        return <CoverPageReal {...commonProps} subjectData={state.subjectData} reconciliationData={state.reconciliationData} coverPhoto={state.coverPhoto} />;
      case 'toc':
        return <TOCPage {...photoProps} enabledSections={visibleSections} pageIndex={0} pageNumber={dynamicPageNumber} />;
      case 'toc-2':
        return <TOCPage {...photoProps} enabledSections={visibleSections} pageIndex={1} pageNumber={dynamicPageNumber} />;
      case 'toc-3':
        return <TOCPage {...photoProps} enabledSections={visibleSections} pageIndex={2} pageNumber={dynamicPageNumber} />;
      case 'letter':
        return <LetterPage {...commonProps} subjectData={state.subjectData} />;
      case 'executive-summary':
        return <ExecutiveSummaryPage {...commonProps} subjectData={state.subjectData} improvementsInventory={state.improvementsInventory} reconciliationData={state.reconciliationData} />;
      case 'property-description':
        // Get the section configuration for inline photos
        const propDescSection = reportSections.find(s => s.id === 'property-description');
        return (
          <PropertyDescriptionPage 
            {...commonProps} 
            subjectData={state.subjectData} 
            improvementsInventory={state.improvementsInventory}
            // Inline photo placement props
            photoSlots={propDescSection?.photoSlots}
            photoPlacements={inlinePhotoPlacements['property-description']}
            availablePhotos={availablePhotos}
            onAssignPhoto={(slotId, photoId) => handleAssignInlinePhoto('property-description', slotId, photoId)}
            onRemovePhoto={(slotId) => handleRemoveInlinePhoto('property-description', slotId)}
            onOpenPhotoEditor={handleOpenPhotoEditor}
            getPhotoEdits={getPhotoEdits}
          />
        );
      case 'hbu':
        return <HBUPage {...commonProps} hbuAnalysis={state.hbuAnalysis} />;
      case 'market-analysis':
        return <MarketAnalysisPage {...commonProps} marketAnalysis={state.marketAnalysis} />;
      case 'risk-rating':
        return state.riskRating ? (
          <RiskRatingPage
            data={state.riskRating}
            pageNumber={pageIndex + 1}
          />
        ) : null;
      case 'demographics':
        // Legacy single-page support
        return (
          <DemographicsPage
            data={state.demographicsData?.radiusAnalysis ?? []}
            source={state.demographicsData?.dataSource}
            asOfDate={state.demographicsData?.dataPullDate}
            latitude={state.subjectData?.coordinates?.latitude}
            longitude={state.subjectData?.coordinates?.longitude}
            pageNumber={pageIndex + 1}
          />
        );
      case 'demographics-overview':
        // Page 1: Large map + key demographic highlights
        return (
          <DemographicsOverviewPage
            data={state.demographicsData?.radiusAnalysis ?? []}
            source={state.demographicsData?.dataSource}
            asOfDate={state.demographicsData?.dataPullDate}
            latitude={state.subjectData?.coordinates?.latitude}
            longitude={state.subjectData?.coordinates?.longitude}
            pageNumber={pageIndex + 1}
          />
        );
      case 'demographics-detail':
        // Page 2: Detailed data tables
        return (
          <DemographicsDetailPage
            data={state.demographicsData?.radiusAnalysis ?? []}
            source={state.demographicsData?.dataSource}
            asOfDate={state.demographicsData?.dataPullDate}
            pageNumber={pageIndex + 1}
          />
        );
      case 'economic-context':
        return (
          <EconomicContextPage
            data={state.economicIndicators ?? null}
            pageNumber={pageIndex + 1}
            chartStyle={state.economicChartStyle}
          />
        );
      case 'swot':
        return state.swotAnalysis ? (
          <SWOTPage
            data={state.swotAnalysis}
            pageNumber={pageIndex + 1}
          />
        ) : null;
      case 'sales-comparison':
        return <SalesComparisonPage {...commonProps} salesComparisonData={state.salesComparisonData} />;
      case 'income-approach':
        return <IncomeApproachPage {...commonProps} incomeApproachData={state.incomeApproachData} />;
      case 'cost-approach':
        return <CostApproachPage {...commonProps} />;
      case 'land-valuation':
        return <LandValuationPage {...commonProps} landValuationData={state.landValuationData} />;
      case 'reconciliation':
        return <ReconciliationPage {...commonProps} reconciliationData={state.reconciliationData} />;
      case 'assumptions':
        return <AssumptionsPage {...commonProps} />;
      case 'certification':
        return <CertificationPage {...commonProps} subjectData={state.subjectData} />;
      case 'exhibits':
        return <PhotoExhibitsPage {...photoProps} />;
      case 'addenda':
        return <AddendaPage selectedElement={selectedElement} onSelectElement={setSelectedElement} />;
      default:
        // Generic page for other sections
        return (
          <ReportPageWrapper section={section} pageNumber={pageIndex + 1}>
            <div className="p-10">
              <h2 className="text-2xl font-light text-slate-800 mb-6 mt-8">{section.label}</h2>
              <div className="text-slate-500 text-sm">
                Content for {section.label} will be displayed here based on wizard data.
              </div>
            </div>
          </ReportPageWrapper>
        );
    }
  };

  return (
    <div 
      className="h-full flex bg-slate-100"
      onClick={(e) => {
        // Deselect text blocks when clicking anywhere outside of them
        const clickedOnTextBlock = (e.target as HTMLElement).closest('[data-text-block]');
        const clickedOnPropertiesPanel = (e.target as HTMLElement).closest('.w-96');
        // Only deselect if not clicking on a text block or the properties panel
        if (!clickedOnTextBlock && !clickedOnPropertiesPanel && selectedElement?.startsWith('text-block-')) {
          setSelectedElement(null);
        }
      }}
    >
      {/* Left Panel: Section Tree */}
      <div className="w-80 bg-white border-r border-slate-200 flex flex-col flex-shrink-0">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="font-bold text-slate-800">Report Pages</h3>
          <p className="text-xs text-slate-500 mt-1">Click to toggle • Arrow to expand</p>
        </div>
        <div className="flex-1 overflow-auto py-4 px-4">
          <SectionTree
            sections={visibleSections}
            onToggleSection={handleToggleSection}
            onToggleField={handleToggleField}
            onToggleExpand={handleToggleExpand}
            onScrollToSection={handleScrollToSection}
            onReorderSections={handleReorderSections}
            activeSectionId={activeSectionId}
            sectionNotes={sectionNotes}
            onNoteChange={handleNoteChange}
            hiddenSections={hiddenSections}
          />
        </div>
      </div>

      {/* Center Panel: Preview */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between">
          <div>
            <div className="font-bold text-slate-800">Report Preview</div>
            <div className="text-xs text-slate-500">{sampleAppraisalData.property.name}</div>
          </div>
          <div className="flex items-center gap-4">
            {/* Undo/Redo buttons */}
            <div className="flex items-center gap-1 border-r border-slate-200 pr-4">
              <button
                onClick={undoContent}
                disabled={!canUndo}
                className="p-2 rounded hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Undo (Ctrl+Z)"
              >
                <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
              </button>
              <button
                onClick={redoContent}
                disabled={!canRedo}
                className="p-2 rounded hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Redo (Ctrl+Shift+Z)"
              >
                <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10H11a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
                </svg>
              </button>
            </div>

            {/* Auto-save indicator */}
            {autoSaveState.isEnabled && (
              <div className="flex items-center gap-2 text-xs text-slate-500">
                {autoSaveState.isSaving ? (
                  <>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                    Saving...
                  </>
                ) : autoSaveState.lastSaved ? (
                  <>
                    <div className="w-2 h-2 bg-[#0da1c7] rounded-full" />
                    Auto-saved {new Date(autoSaveState.lastSaved).toLocaleTimeString()}
                  </>
                ) : null}
              </div>
            )}
            <button
              onClick={handleAddTextBlock}
              className="px-4 py-2 text-white text-sm font-semibold rounded-lg flex items-center gap-2 hover:shadow-md transition-shadow hover:brightness-110"
              style={{ backgroundColor: '#0da1c7' }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Text Block
            </button>
            <button
              onClick={() => setShowGrid(!showGrid)}
              className={`px-4 py-2 text-sm font-semibold rounded-lg flex items-center gap-2 transition-all ${
                showGrid
                  ? 'bg-[#0da1c7] text-white'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
              title="Toggle Snap Grid"
            >
              <Grid3x3 size={16} />
              Grid
            </button>
            
            {/* Zoom Controls */}
            <div className="flex items-center gap-1 bg-white rounded-lg border border-slate-200 p-1">
              <button
                onClick={() => setZoomLevel(z => Math.max(50, z - 10))}
                className="p-1.5 hover:bg-slate-100 rounded transition-colors"
                title="Zoom Out (Ctrl+-)"
              >
                <ZoomOut size={16} className="text-slate-600" />
              </button>
              <span className="text-xs font-medium text-slate-600 w-12 text-center">
                {zoomLevel}%
              </span>
              <button
                onClick={() => setZoomLevel(z => Math.min(150, z + 10))}
                className="p-1.5 hover:bg-slate-100 rounded transition-colors"
                title="Zoom In (Ctrl++)"
              >
                <ZoomIn size={16} className="text-slate-600" />
              </button>
              <button
                onClick={() => setZoomLevel(100)}
                className="p-1.5 hover:bg-slate-100 rounded transition-colors"
                title="Reset Zoom (Ctrl+0)"
              >
                <RotateCcw size={14} className="text-slate-500" />
              </button>
            </div>
          </div>
        </div>
        <div 
          ref={previewRef} 
          className="flex-1 overflow-auto p-8 bg-slate-400/30 relative"
        >
          <GridContext.Provider value={{ showGrid, gridSize }}>
            <div 
              className="report-preview-content space-y-8 flex flex-col items-center"
              style={{
                transform: `scale(${zoomLevel / 100})`,
                transformOrigin: 'top center',
              }}
            >
              {visibleSections
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
                          showGrid={showGrid}
                          gridSize={gridSize}
                          allBlocks={textBlocks.filter((b) => b.pageId === section.id)}
                          onAlignmentGuidesChange={setAlignmentGuides}
                        />
                      ))}
                  </div>
                ))}
            </div>
            {/* Alignment Guides Overlay */}
            <AlignmentGuidesOverlay guides={alignmentGuides} />
          </GridContext.Provider>
        </div>
      </div>

      {/* Right Panel: Properties */}
      <div className="w-96 bg-white border-l border-slate-200 flex-shrink-0">
        <PropertiesPanelSimplified
          selectedElement={selectedElement}
          elementStyles={elementStyles}
          elementContent={elementContent}
          onStyleChange={(styles) => selectedElement && handleStyleChange(selectedElement, styles)}
          onDeleteElement={handleDeleteElement}
          isDirty={reportState.isDirty}
          onSave={onSaveDraft}
          textBlockData={
            selectedElement?.startsWith('text-block-')
              ? (() => {
                  const block = textBlocks.find(b => b.id === selectedElement);
                  return block ? {
                    showBorder: block.showBorder,
                    borderColor: block.borderColor,
                    borderWidth: block.borderWidth,
                    textAlign: block.textAlign,
                  } : undefined;
                })()
              : undefined
          }
          onTextBlockUpdate={
            selectedElement?.startsWith('text-block-')
              ? (updates) => handleUpdateTextBlock(selectedElement, updates)
              : undefined
          }
          onAIRewrite={handleAIRewrite}
          onAIExpand={handleAIExpand}
          onAIShorten={handleAIShorten}
          isAILoading={isAILoading}
        />
      </div>

      {/* Recovery Dialog */}
      <RecoveryDialog
        isOpen={showRecoveryDialog}
        onClose={handleDismissRecovery}
        versions={versions}
        onRecover={handleRecoverVersion}
        onDelete={autoSaveActions.deleteVersion}
        onDismiss={handleDismissRecovery}
      />

      {/* Photo Editor Dialog */}
      <PhotoEditorDialog
        isOpen={photoEditorOpen}
        photo={editingPhoto}
        onClose={() => {
          setPhotoEditorOpen(false);
          setEditingPhoto(null);
        }}
        onSave={handleSavePhotoEdits}
        onDelete={handleDeletePhoto}
        availablePhotos={sampleAppraisalData.photos?.map((p, i) => ({
          id: p.id || `photo-${i}`,
          url: p.url,
          caption: p.caption,
          category: p.category,
        })) || []}
      />

      {/* Find/Replace Panel */}
      <FindReplacePanel
        isOpen={findReplaceOpen}
        onClose={() => setFindReplaceOpen(false)}
        onSearch={handleSearch}
        onReplace={handleReplace}
        onNavigateToMatch={handleNavigateToMatch}
        searchResults={searchResults}
        currentMatchIndex={currentMatchIndex}
        onCurrentMatchChange={setCurrentMatchIndex}
      />
    </div>
  );
}
