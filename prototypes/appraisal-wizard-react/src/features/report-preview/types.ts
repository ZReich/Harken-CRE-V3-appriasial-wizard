// Re-export types from main types file
export type {
  ReportPhoto,
  ReportSectionConfig,
  AddendaItem,
  ReportConfig,
  ReportStyling,
  PageLayout,
  PageDimensions,
  SpacingRules,
  SectionBoundary,
  ContentBlock,
  ContentBlockType,
  ReportSection,
  ReportPage,
  PhotoUploadSlot,
  PhotoGridLayout,
  PhotoGridLayoutType,
  PhotoCategory,
  EditorMode,
  SelectedElement,
  InlineEditorState,
  EditorHistory,
  EditorState,
  PreviewEdit,
  ReportVersion,
  LayoutIssue,
  LayoutIssueType,
  LayoutIssueSeverity,
  OverflowResult,
  TOCEntry,
  TOCConfig,
} from '../../types';

// Additional local types for internal use

export interface PageRenderContext {
  pageNumber: number;
  totalPages: number;
  sectionTitle: string;
  propertyAddress: string;
  effectiveDate: string;
}

export interface RenderOptions {
  showPageNumbers: boolean;
  showHeaders: boolean;
  showFooters: boolean;
  showMarginGuides: boolean;
  showGridOverlay: boolean;
  scale: number;
}

export interface PhotoUploadState {
  uploading: boolean;
  progress: number;
  error: string | null;
}

