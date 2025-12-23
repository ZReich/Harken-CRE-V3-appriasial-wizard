/**
 * PDF Export Utility
 * 
 * Provides functions for generating PDF from the report preview.
 * Uses html2pdf.js for client-side generation.
 * 
 * For production, consider using:
 * - Puppeteer on the backend for higher quality output
 * - PDF.js for more control over the generation process
 * - WeasyPrint for CSS-based layouts
 */

export interface PDFExportOptions {
  filename?: string;
  pageSize?: 'letter' | 'a4' | 'legal';
  orientation?: 'portrait' | 'landscape';
  margin?: number | { top: number; right: number; bottom: number; left: number };
  quality?: 'low' | 'medium' | 'high';
  includeBackground?: boolean;
  scale?: number;
}

export interface PDFExportProgress {
  status: 'preparing' | 'rendering' | 'generating' | 'complete' | 'error';
  currentPage?: number;
  totalPages?: number;
  message?: string;
}

type ProgressCallback = (progress: PDFExportProgress) => void;

const DEFAULT_OPTIONS: PDFExportOptions = {
  filename: 'appraisal-report.pdf',
  pageSize: 'letter',
  orientation: 'portrait',
  margin: 0,
  quality: 'high',
  includeBackground: true,
  scale: 2,
};

/**
 * Generate PDF from HTML element using html2pdf.js
 * Note: Requires html2pdf.js to be loaded in the page
 */
export async function exportToPDF(
  element: HTMLElement,
  options: PDFExportOptions = {},
  onProgress?: ProgressCallback
): Promise<Blob> {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
  
  onProgress?.({ status: 'preparing', message: 'Preparing document...' });

  // Check if html2pdf is available
  const html2pdf = (window as unknown as { html2pdf?: unknown }).html2pdf;
  if (!html2pdf) {
    throw new Error('html2pdf.js library not loaded. Please include it in your page.');
  }

  try {
    onProgress?.({ status: 'rendering', message: 'Rendering pages...' });

    // Configure html2pdf options
    const pdfOptions = {
      margin: mergedOptions.margin,
      filename: mergedOptions.filename,
      image: { 
        type: 'jpeg', 
        quality: mergedOptions.quality === 'high' ? 0.98 : mergedOptions.quality === 'medium' ? 0.92 : 0.85 
      },
      html2canvas: { 
        scale: mergedOptions.scale || 2,
        useCORS: true,
        logging: false,
        letterRendering: true,
        allowTaint: true,
      },
      jsPDF: { 
        unit: 'in', 
        format: mergedOptions.pageSize, 
        orientation: mergedOptions.orientation 
      },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
    };

    onProgress?.({ status: 'generating', message: 'Generating PDF...' });

    // Generate PDF
    const pdf = await (html2pdf as CallableFunction)()
      .from(element)
      .set(pdfOptions)
      .outputPdf('blob');

    onProgress?.({ status: 'complete', message: 'PDF generated successfully!' });

    return pdf;
  } catch (error) {
    onProgress?.({ 
      status: 'error', 
      message: `Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}` 
    });
    throw error;
  }
}

/**
 * Download PDF directly to user's device
 */
export async function downloadPDF(
  element: HTMLElement,
  options: PDFExportOptions = {},
  onProgress?: ProgressCallback
): Promise<void> {
  const pdf = await exportToPDF(element, options, onProgress);
  
  // Create download link
  const url = URL.createObjectURL(pdf);
  const link = document.createElement('a');
  link.href = url;
  link.download = options.filename || DEFAULT_OPTIONS.filename || 'report.pdf';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generate PDF using native browser print dialog
 * This is a fallback that uses CSS print styles
 */
export function printToPDF(element?: HTMLElement): void {
  if (element) {
    // Clone the element and prepare for print
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to print the report.');
      return;
    }

    // Copy styles
    const styles = Array.from(document.styleSheets)
      .map(styleSheet => {
        try {
          return Array.from(styleSheet.cssRules)
            .map(rule => rule.cssText)
            .join('\n');
        } catch {
          return '';
        }
      })
      .join('\n');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Appraisal Report</title>
          <style>${styles}</style>
        </head>
        <body class="print-mode">
          ${element.outerHTML}
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    
    // Wait for images to load
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  } else {
    window.print();
  }
}

/**
 * Prepare report pages for PDF export
 * Adds necessary classes and ensures proper page breaks
 */
export function prepareForExport(container: HTMLElement): void {
  // Add print class
  container.classList.add('pdf-export-mode');

  // Ensure all pages have proper page break classes
  const pages = container.querySelectorAll('.report-page');
  pages.forEach((page, index) => {
    if (index > 0) {
      page.classList.add('break-before');
    }
    page.classList.add('keep-together');
  });

  // Force all images to be loaded
  const images = container.querySelectorAll('img');
  images.forEach(img => {
    img.setAttribute('loading', 'eager');
  });
}

/**
 * Clean up after export
 */
export function cleanupAfterExport(container: HTMLElement): void {
  container.classList.remove('pdf-export-mode');
}

/**
 * Generate PDF on the server (requires backend endpoint)
 * This is the recommended approach for production
 */
export async function exportToPDFServer(
  reportData: unknown,
  options: PDFExportOptions = {}
): Promise<Blob> {
  const response = await fetch('/api/generate-pdf', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      data: reportData,
      options,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to generate PDF: ${response.statusText}`);
  }

  return response.blob();
}

/**
 * Check if PDF generation is supported in the current environment
 */
export function isPDFExportSupported(): {
  clientSide: boolean;
  serverSide: boolean;
  print: boolean;
} {
  return {
    clientSide: typeof (window as unknown as { html2pdf?: unknown }).html2pdf !== 'undefined',
    serverSide: false, // Would need to check API availability
    print: typeof window !== 'undefined' && typeof window.print === 'function',
  };
}

export default {
  exportToPDF,
  downloadPDF,
  printToPDF,
  prepareForExport,
  cleanupAfterExport,
  exportToPDFServer,
  isPDFExportSupported,
};

