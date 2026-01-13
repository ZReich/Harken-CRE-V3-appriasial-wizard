import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  FileText,
  Grid,
  Eye,
  Edit3,
  Download,
} from 'lucide-react';
import type { ReportPage, TOCEntry, EditorMode } from '../../../types';
import {
  CoverPage,
  LetterPage,
  SummaryPage,
  NarrativePage,
  PhotoGridPage,
  TOCPage,
  AnalysisGridPage,
  AddendaHeaderPage,
  DemographicsPage,
  EconomicContextPage,
  SWOTPage,
  RiskRatingPage,
} from './pages';
import { ZOOM_LEVELS } from '../constants';

interface ReportPreviewProps {
  pages: ReportPage[];
  toc: TOCEntry[];
  currentPage?: number;
  onPageChange?: (page: number) => void;
  mode?: EditorMode;
  onModeChange?: (mode: EditorMode) => void;
  onElementSelect?: (elementId: string, pageIndex: number) => void;
  onExportPDF?: () => void;
  showSidebar?: boolean;
}

export const ReportPreview: React.FC<ReportPreviewProps> = ({
  pages,
  toc,
  currentPage: controlledPage,
  onPageChange,
  mode = 'view',
  onModeChange,
  onElementSelect,
  onExportPDF,
  showSidebar = true,
}) => {
  const [internalPage, setInternalPage] = useState(1);
  const [zoom, setZoom] = useState(75);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showThumbnails, setShowThumbnails] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const pagesContainerRef = useRef<HTMLDivElement>(null);

  const currentPage = controlledPage ?? internalPage;
  const totalPages = pages.length;

  const handlePageChange = useCallback((page: number) => {
    const clampedPage = Math.max(1, Math.min(page, totalPages));
    if (onPageChange) {
      onPageChange(clampedPage);
    } else {
      setInternalPage(clampedPage);
    }
  }, [totalPages, onPageChange]);

  const handleZoomIn = useCallback(() => {
    const currentIndex = ZOOM_LEVELS.indexOf(zoom);
    if (currentIndex < ZOOM_LEVELS.length - 1) {
      setZoom(ZOOM_LEVELS[currentIndex + 1]);
    }
  }, [zoom]);

  const handleZoomOut = useCallback(() => {
    const currentIndex = ZOOM_LEVELS.indexOf(zoom);
    if (currentIndex > 0) {
      setZoom(ZOOM_LEVELS[currentIndex - 1]);
    }
  }, [zoom]);

  const handleZoomChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setZoom(Number(e.target.value));
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case 'ArrowLeft':
        case 'PageUp':
          handlePageChange(currentPage - 1);
          break;
        case 'ArrowRight':
        case 'PageDown':
          handlePageChange(currentPage + 1);
          break;
        case 'Home':
          handlePageChange(1);
          break;
        case 'End':
          handlePageChange(totalPages);
          break;
        case '+':
        case '=':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            handleZoomIn();
          }
          break;
        case '-':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            handleZoomOut();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, totalPages, handlePageChange, handleZoomIn, handleZoomOut]);

  // Scroll to page when currentPage changes
  useEffect(() => {
    if (pagesContainerRef.current && pages.length > 0) {
      const pageElement = pagesContainerRef.current.children[currentPage - 1] as HTMLElement;
      if (pageElement) {
        pageElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [currentPage, pages.length]);

  const handleContentClick = useCallback((blockId: string) => {
    if (mode === 'select' || mode === 'text-edit') {
      onElementSelect?.(blockId, currentPage - 1);
    }
  }, [mode, currentPage, onElementSelect]);

  const renderPage = (page: ReportPage, _index: number) => {
    const isEditing = mode === 'select' || mode === 'text-edit';
    const commonProps = {
      isEditing,
      onContentClick: handleContentClick,
      pageNumber: page.pageNumber,
    };

    const pageComponent = (() => {
      switch (page.layout) {
        case 'cover':
          return <CoverPage content={page.content} coverPhoto={page.coverPhoto} {...commonProps} />;
        case 'letter':
          return <LetterPage content={page.content} title={page.title} {...commonProps} />;
        case 'toc':
          return <TOCPage entries={toc} title={page.title} {...commonProps} />;
        case 'summary-table':
          return <SummaryPage content={page.content} title={page.title} {...commonProps} />;
        case 'narrative':
          return <NarrativePage content={page.content} title={page.title} sectionId={page.sectionId} {...commonProps} />;
        case 'analysis-grid':
          return <AnalysisGridPage content={page.content} title={page.title} sectionId={page.sectionId} {...commonProps} />;
        case 'photo-grid-6':
        case 'photo-grid-4':
          return (
            <PhotoGridPage
              photos={page.photos || []}
              layout={page.layout === 'photo-grid-6' ? 'grid-6' : 'grid-4'}
              title={page.title}
              showAttribution={page.showAttribution}
              {...commonProps}
              onPhotoClick={handleContentClick}
            />
          );
        case 'photo-single':
          return (
            <PhotoGridPage
              photos={page.photos || []}
              layout="single"
              title={page.title}
              {...commonProps}
              onPhotoClick={handleContentClick}
            />
          );
        case 'addenda-header':
          return <AddendaHeaderPage title={page.title} pageNumber={page.pageNumber} />;
        case 'risk-rating': {
          const riskContent = page.content?.[0]?.content as { riskRating?: import('../../../types/api').RiskRatingData };
          return (
            <RiskRatingPage
              data={riskContent?.riskRating as import('../../../types/api').RiskRatingData}
              pageNumber={page.pageNumber}
            />
          );
        }
        case 'demographics': {
          const demoContent = page.content?.[0]?.content as { 
            demographics?: import('../../../types').DemographicsData;
            latitude?: number;
            longitude?: number;
          };
          return (
            <DemographicsPage
              data={demoContent?.demographics?.radiusAnalysis ?? []}
              source={demoContent?.demographics?.dataSource}
              asOfDate={demoContent?.demographics?.dataPullDate}
              latitude={demoContent?.latitude}
              longitude={demoContent?.longitude}
              pageNumber={page.pageNumber}
            />
          );
        }
        case 'economic-context': {
          const econContent = page.content?.[0]?.content as { economicIndicators?: import('../../../types').EconomicIndicators; chartStyle?: string };
          return (
            <EconomicContextPage
              data={econContent?.economicIndicators ?? null}
              pageNumber={page.pageNumber}
              chartStyle={econContent?.chartStyle as any}
            />
          );
        }
        case 'swot': {
          const swotContent = page.content?.[0]?.content as { swotAnalysis?: import('../../../types').SWOTAnalysisData };
          return (
            <SWOTPage
              data={swotContent?.swotAnalysis as import('../../../types').SWOTAnalysisData}
              pageNumber={page.pageNumber}
            />
          );
        }
        case 'map-page':
          return (
            <div className="w-full h-full bg-surface-1 flex items-center justify-center">
              <div className="text-harken-gray-med">
                <FileText size={48} className="mx-auto mb-4" />
                <p className="text-sm">Map Page</p>
                <p className="text-xs mt-1">{page.title}</p>
              </div>
            </div>
          );
        case 'document':
          return (
            <div className="w-full h-full bg-surface-1 flex items-center justify-center">
              <div className="text-harken-gray-med">
                <FileText size={48} className="mx-auto mb-4" />
                <p className="text-sm">Document Page</p>
                <p className="text-xs mt-1">{page.title}</p>
              </div>
            </div>
          );
        default:
          return <NarrativePage content={page.content} title={page.title} {...commonProps} />;
      }
    })();

    return (
      <div
        key={page.id}
        className="flex-shrink-0 shadow-lg rounded-lg overflow-hidden report-page-container"
        style={{
          width: `${612 * (zoom / 100)}px`,
          height: `${792 * (zoom / 100)}px`,
          backgroundColor: '#ffffff',
        }}
      >
        {/* Force light mode for report pages - they represent printed documents */}
        <div
          className="w-[612px] h-[792px] origin-top-left report-page-light-mode"
          style={{ 
            transform: `scale(${zoom / 100})`,
            backgroundColor: '#ffffff',
            color: '#1c3643',
          }}
        >
          {pageComponent}
        </div>
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      className={`flex flex-col h-full bg-surface-4 dark:bg-elevation-muted ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-surface-1 dark:bg-elevation-1 border-b border-light-border dark:border-dark-border dark:border-dark-border shadow-sm">
        {/* Left: Page navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="p-1.5 rounded hover:bg-surface-3 dark:hover:bg-elevation-3 text-slate-600 dark:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={18} />
          </button>

          <div className="flex items-center gap-1.5">
            <input
              type="number"
              min={1}
              max={totalPages}
              value={currentPage}
              onChange={(e) => handlePageChange(Number(e.target.value))}
              className="w-12 px-2 py-1 text-sm text-center border border-light-border dark:border-dark-border dark:border-harken-gray bg-surface-1 dark:bg-elevation-1 text-slate-900 dark:text-white rounded focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
            <span className="text-sm text-slate-500 dark:text-slate-400">of {totalPages}</span>
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="p-1.5 rounded hover:bg-surface-3 dark:hover:bg-elevation-3 text-slate-600 dark:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Center: Zoom controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleZoomOut}
            disabled={zoom <= ZOOM_LEVELS[0]}
            className="p-1.5 rounded hover:bg-surface-3 dark:hover:bg-elevation-3 text-slate-600 dark:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ZoomOut size={18} />
          </button>

          <select
            value={zoom}
            onChange={handleZoomChange}
            className="px-2 py-1 text-sm border border-light-border dark:border-dark-border dark:border-harken-gray bg-surface-1 dark:bg-elevation-1 text-slate-900 dark:text-white rounded focus:outline-none focus:ring-1 focus:ring-sky-500"
          >
            {ZOOM_LEVELS.map((level) => (
              <option key={level} value={level}>{level}%</option>
            ))}
          </select>

          <button
            onClick={handleZoomIn}
            disabled={zoom >= ZOOM_LEVELS[ZOOM_LEVELS.length - 1]}
            className="p-1.5 rounded hover:bg-surface-3 dark:hover:bg-elevation-3 text-slate-600 dark:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ZoomIn size={18} />
          </button>
        </div>

        {/* Right: Mode & actions */}
        <div className="flex items-center gap-2">
          {/* Mode toggle */}
          <div className="flex items-center bg-surface-3 dark:bg-elevation-subtle rounded-lg p-0.5">
            <button
              onClick={() => onModeChange?.('view')}
              className={`p-1.5 rounded ${mode === 'view' ? 'bg-surface-1 dark:bg-dark-input text-sky-600 dark:text-sky-400 shadow-sm' : 'hover:bg-surface-4 dark:hover:bg-elevation-muted text-slate-500 dark:text-slate-400'}`}
              title="View mode"
            >
              <Eye size={16} />
            </button>
            <button
              onClick={() => onModeChange?.('select')}
              className={`p-1.5 rounded ${mode === 'select' ? 'bg-surface-1 dark:bg-dark-input text-sky-600 dark:text-sky-400 shadow-sm' : 'hover:bg-surface-4 dark:hover:bg-elevation-muted text-slate-500 dark:text-slate-400'}`}
              title="Edit mode"
            >
              <Edit3 size={16} />
            </button>
          </div>

          <div className="w-px h-6 bg-surface-4 dark:bg-elevation-muted" />

          <button
            onClick={() => setShowThumbnails(!showThumbnails)}
            className={`p-1.5 rounded ${showThumbnails ? 'bg-surface-3 dark:bg-elevation-subtle text-slate-900 dark:text-white' : 'hover:bg-surface-3 dark:hover:bg-elevation-3 text-slate-500 dark:text-slate-400'}`}
            title="Toggle thumbnails"
          >
            <Grid size={18} />
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded hover:bg-surface-3 dark:hover:bg-elevation-3 text-slate-500 dark:text-slate-400"
            title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>

          {onExportPDF && (
            <button
              onClick={onExportPDF}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-500 text-white text-sm rounded hover:bg-sky-600"
            >
              <Download size={14} />
              Export PDF
            </button>
          )}
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Thumbnail sidebar */}
        {showSidebar && showThumbnails && (
          <div className="w-48 bg-surface-3 dark:bg-elevation-subtle border-r border-light-border dark:border-dark-border dark:border-dark-border overflow-y-auto p-3 space-y-3">
            {pages.map((page, index) => (
              <button
                key={page.id}
                onClick={() => handlePageChange(index + 1)}
                className={`w-full aspect-[8.5/11] bg-surface-1 rounded shadow-sm overflow-hidden border-2 transition-colors ${currentPage === index + 1
                  ? 'border-sky-500'
                  : 'border-transparent hover:border-border-muted dark:hover:border-dark-border-muted'
                  }`}
              >
                <div className="w-full h-full flex items-center justify-center text-xs text-harken-gray-med">
                  {index + 1}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Pages container */}
        <div
          ref={pagesContainerRef}
          className="flex-1 overflow-auto p-8"
        >
          <div className="flex flex-col items-center gap-8">
            {pages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-96 text-harken-gray-med">
                <FileText size={48} className="mb-4" />
                <p className="text-lg font-medium">No pages to display</p>
                <p className="text-sm mt-1">Complete the wizard to generate the report preview</p>
              </div>
            ) : (
              pages.map((page, index) => renderPage(page, index))
            )}
          </div>
        </div>
      </div>

      {/* Bottom status bar */}
      <div className="px-4 py-2 bg-surface-1 dark:bg-elevation-1 border-t border-light-border dark:border-dark-border dark:border-dark-border flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-4">
          <span>{totalPages} pages</span>
          <span>•</span>
          <span>8.5" × 11" (Letter)</span>
        </div>
        <div className="flex items-center gap-4">
          {mode !== 'view' && (
            <span className="text-sky-600 font-medium">
              Editing Mode - Click elements to select
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportPreview;

