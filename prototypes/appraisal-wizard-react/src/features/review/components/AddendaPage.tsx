/**
 * AddendaPage Component
 * 
 * Displays uploaded documents in the report preview as an Addenda section.
 * Renders actual document content:
 * - Images are rendered full size (fit to page)
 * - PDFs are rendered with a 2-up layout (2 document pages per report page)
 * 
 * Uses pdfjs-dist for client-side PDF rendering.
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useWizard } from '../../../context/WizardContext';
import type { UploadedDocument } from '../../../types';
import * as pdfjsLib from 'pdfjs-dist';

// Define styles for the report page to match exactly the dimensions required
const PAGE_WIDTH_IN = 8.5;
const PAGE_HEIGHT_IN = 11;

// Styles
const styles = {
  pageContainer: {
    minHeight: '11in',
    width: '8.5in',
    backgroundColor: '#ffffff',
    position: 'relative' as const,
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    borderRadius: '0.5rem',
    overflow: 'hidden',
    marginBottom: '2rem', // Spacing between pages in the editor
  },
  sidebar: {
    backgroundColor: '#0da1c7',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative' as const,
  },
  sidebarText: {
    transform: 'rotate(-90deg)',
    whiteSpace: 'nowrap' as const,
    fontSize: '0.875rem',
    fontWeight: 500,
    letterSpacing: '0.05em',
    width: '200px',
    textAlign: 'center' as const,
  },
  pageNumber: {
    position: 'absolute' as const,
    top: '2rem',
    textAlign: 'center' as const,
    fontSize: '0.75rem',
    fontWeight: 700,
    letterSpacing: '0.05em',
  },
  badge: {
    position: 'absolute' as const,
    top: '0.5rem',
    right: '0.5rem',
    backgroundColor: '#0da1c7',
    color: 'white',
    padding: '0.25rem 1rem',
    borderRadius: '0.25rem',
    fontSize: '0.75rem',
    fontWeight: 600,
  }
};

interface AddendaPageProps {
  selectedElement: string | null;
  onSelectElement: (id: string | null) => void;
}

export function AddendaPage({ selectedElement, onSelectElement }: AddendaPageProps) {
  const { state } = useWizard();
  // Filter for docs that are explicitly NOT excluded (true or undefined means included)
  const documents = useMemo(() =>
    (state.uploadedDocuments || []).filter(d => d.includeInReport !== false),
    [state.uploadedDocuments]);

  // If no documents, render a single placeholder page
  if (documents.length === 0) {
    return (
      <AddendaPageLayout title="Supporting Documents">
        <div className="flex flex-col items-center justify-center h-full text-slate-400">
          <p className="mb-2">No documents included in addenda.</p>
          <p className="text-xs">Upload documents in the "Exhibits" section.</p>
        </div>
      </AddendaPageLayout>
    );
  }

  return (
    <>
      {documents.map((doc, index) => (
        <DocumentRenderer
          key={doc.id}
          document={doc}
          docIndex={index}
          totalDocs={documents.length}
        />
      ))}
    </>
  );
}

// ==========================================
// Layout Shell
// ==========================================

interface AddendaPageLayoutProps {
  children: React.ReactNode;
  title?: string;
  subTitle?: string;
}

function AddendaPageLayout({ children, title, subTitle }: AddendaPageLayoutProps) {
  return (
    <div style={styles.pageContainer}>
      <div className="grid grid-cols-[80px_1fr] h-full" style={{ minHeight: '11in' }}>
        {/* Sidebar */}
        <div style={styles.sidebar}>
          <div style={styles.pageNumber}>
            <span>ADDENDA</span>
          </div>
          <div style={styles.sidebarText}>
            SUPPORTING DOCUMENTS
          </div>
        </div>

        {/* Main Content */}
        <div className="relative p-8 h-full flex flex-col">
          {/* Header Badge */}
          <div style={styles.badge}>
            ADDENDA
          </div>

          {/* Header Content */}
          {(title || subTitle) && (
            <div className="mb-6 mt-4 border-b border-slate-200 pb-4">
              {title && <h2 className="text-2xl font-light text-harken-gray mb-1">{title}</h2>}
              {subTitle && <div className="text-sm font-medium text-slate-500">{subTitle}</div>}
            </div>
          )}

          {/* Body */}
          <div className="flex-1 min-h-0">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// Document Renderer (Dispatcher)
// ==========================================

function DocumentRenderer({ document, docIndex, totalDocs }: { document: UploadedDocument, docIndex: number, totalDocs: number }) {
  const isPdf = document.type === 'application/pdf' || document.name.toLowerCase().endsWith('.pdf');
  const isImage = document.type.startsWith('image/') || /\.(jpg|jpeg|png|webp)$/i.test(document.name);

  if (isPdf) {
    return <PdfDocumentResolver document={document} docIndex={docIndex} />;
  }

  if (isImage) {
    return (
      <AddendaPageLayout
        title={docIndex === 0 ? "Supporting Documents" : undefined}
        subTitle={`${document.name} (${document.documentType})`}
      >
        <div className="w-full h-full flex items-center justify-center p-4">
          {document.preview || document.url ? (
            <img
              src={document.preview || document.url}
              alt={document.name}
              className="max-w-full max-h-[800px] object-contain shadow-sm border border-slate-100"
            />
          ) : (
            <div className="text-red-400">Image source not available</div>
          )}
        </div>
      </AddendaPageLayout>
    );
  }

  // Fallback for unknown types
  return (
    <AddendaPageLayout title={document.name}>
      <div className="p-4 border border-dashed border-slate-300 rounded bg-slate-50 text-center">
        <p>Preview not available for this file type.</p>
        <p className="text-xs text-slate-500 mt-1">{document.name}</p>
      </div>
    </AddendaPageLayout>
  );
}

// ==========================================
// PDF Resolver & Renderer
// ==========================================

function PdfDocumentResolver({ document, docIndex }: { document: UploadedDocument, docIndex: number }) {
  const { updateUploadedDocument } = useWizard();
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadPdf = async () => {
      try {
        // Initialize worker
        const pdfjsWorker = await import('pdfjs-dist/build/pdf.worker.min.mjs?url');
        pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker.default;

        // Get source
        const src = document.file ? await document.file.arrayBuffer() : (document.url || document.preview);

        if (!src) throw new Error("No PDF source available");

        const loadingTask = pdfjsLib.getDocument(document.file ? { data: src } : src);
        const pdf = await loadingTask.promise;

        if (isMounted) {
          setPdfDoc(pdf);
          setNumPages(pdf.numPages);
          setError(null); // Clear error on success
        }
      } catch (err: any) {
        console.error("PDF Load Error:", err);
        if (isMounted) setError(err.message || "Failed to load PDF");
      }
    };

    loadPdf();

    return () => { isMounted = false; };
  }, [document]);

  const handleReupload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const newPreview = URL.createObjectURL(file);

      updateUploadedDocument(document.id, {
        file,
        preview: newPreview
      });

      // Force reset local state to ensure loading indicator shows immediately
      setPdfDoc(null);
      setNumPages(null);
      setError(null);
    }
  };

  if (error) {
    return (
      <AddendaPageLayout title={document.name} subTitle="Error Loading Document">
        <div className="flex flex-col items-center justify-center p-8 text-center h-[500px] border-2 border-dashed border-red-100 rounded-lg bg-red-50/10">
          <div className="text-red-500 font-medium mb-2 text-lg">Unable to View Document</div>
          <p className="text-sm text-slate-500 mb-6 max-w-md">
            The document source is missing from the current session (likely due to a page refresh).
            Please reload the file to view it.
          </p>

          <input
            type="file"
            accept="application/pdf"
            className="hidden"
            id={`reload-${document.id}`}
            onChange={handleReupload}
          />
          <label
            htmlFor={`reload-${document.id}`}
            className="px-6 py-2.5 bg-[#0da1c7] text-white font-medium rounded-lg hover:bg-[#0b8fb0] cursor-pointer shadow-sm transition-colors flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" /></svg>
            Reload PDF to View
          </label>
          <p className="mt-4 text-xs text-slate-400">
            (This won't create a duplicate, just restores the view)
          </p>
        </div>
      </AddendaPageLayout>
    );
  }

  if (!numPages || !pdfDoc) {
    return (
      <AddendaPageLayout title={document.name}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0da1c7]"></div>
          <span className="ml-3 text-slate-500">Processing document...</span>
        </div>
      </AddendaPageLayout>
    );
  }

  // Calculate layout pages (2 PDF pages per Report Page)
  const reportPageCount = Math.ceil(numPages / 2);
  const pages = [];

  for (let i = 0; i < reportPageCount; i++) {
    const pageIndex1 = (i * 2) + 1; // 1-based index
    const pageIndex2 = (i * 2) + 2;

    pages.push(
      <AddendaPageLayout
        key={`pdf-group-${i}`}
        // Only show main title on the very first page of the Addenda section (conceptually)
        // Check local demand: user might want title on every doc start.
        title={i === 0 ? "Supporting Documents" : undefined}
        subTitle={`${document.name} - Page ${pageIndex1}${pageIndex2 <= numPages ? ` & ${pageIndex2}` : ''}`}
      >
        <div className="flex flex-col gap-8 h-full pt-2">
          {/* Top Page (Page N) */}
          <div className="flex-1 flex flex-col min-h-0 border border-slate-200 shadow-sm bg-slate-50 overflow-hidden relative">
            <PdfPageCanvas pdfDoc={pdfDoc} pageNumber={pageIndex1} />
            <div className="absolute bottom-2 right-2 bg-white/80 px-2 py-0.5 text-[10px] rounded text-slate-500">
              Page {pageIndex1}
            </div>
          </div>

          {/* Bottom Page (Page N+1) - Only if exists */}
          {pageIndex2 <= numPages && (
            <div className="flex-1 flex flex-col min-h-0 border border-slate-200 shadow-sm bg-slate-50 overflow-hidden relative">
              <PdfPageCanvas pdfDoc={pdfDoc} pageNumber={pageIndex2} />
              <div className="absolute bottom-2 right-2 bg-white/80 px-2 py-0.5 text-[10px] rounded text-slate-500">
                Page {pageIndex2}
              </div>
            </div>
          )}

          {/* Spacer if odd number of pages to keep top page sized correctly */}
          {pageIndex2 > numPages && (
            <div className="flex-1 opacity-0 pointer-events-none"></div>
          )}
        </div>
      </AddendaPageLayout>
    );
  }

  return <>{pages}</>;
}

// ==========================================
// Low-Level Canvas Renderer
// ==========================================

function PdfPageCanvas({ pdfDoc, pageNumber }: { pdfDoc: any, pageNumber: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let renderTask: any = null;

    const render = async () => {
      if (!canvasRef.current || !containerRef.current || !pdfDoc) return;

      try {
        const page = await pdfDoc.getPage(pageNumber);

        // Calculate scale to fit container width
        // We want high quality, so we render at 2x and scale down with CSS
        const containerWidth = containerRef.current.clientWidth;
        const containerHeight = containerRef.current.clientHeight;

        // Get natural aspect ratio
        const initialViewport = page.getViewport({ scale: 1.0 });
        const aspectRatio = initialViewport.width / initialViewport.height;

        // Determine best scale to fit containment
        // We want to fit within the container bounds
        // Usually width-constrained
        const scale = (containerWidth * 2) / initialViewport.width; // 2x density

        const viewport = page.getViewport({ scale });

        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        if (!context) return;

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        // Render
        renderTask = page.render({
          canvasContext: context,
          viewport,
        });

        await renderTask.promise;
      } catch (err: any) {
        if (err.name !== 'RenderingCancelledException') {
          console.error(`Error rendering page ${pageNumber}`, err);
        }
      }
    };

    render();

    return () => {
      if (renderTask) renderTask.cancel();
    };
  }, [pdfDoc, pageNumber]);

  return (
    <div ref={containerRef} className="w-full h-full flex items-center justify-center p-2">
      <canvas
        ref={canvasRef}
        className="max-w-full max-h-full shadow-sm object-contain"
        style={{ width: 'auto', height: 'auto' }}
      />
    </div>
  );
}
