/**
 * Cost Segregation PDF Exporter
 * 
 * Generates a standalone PDF report for Cost Segregation analysis.
 * Uses html2pdf.js for client-side PDF generation.
 */

import type { CostSegAnalysis } from '../types';

/**
 * Generate and download a Cost Segregation PDF report
 */
export async function generateCostSegPdf(
  reportElement: HTMLElement,
  analysis: CostSegAnalysis
): Promise<void> {
  // Dynamically import html2pdf to keep bundle small
  const html2pdf = (await import('html2pdf.js')).default;
  
  // Build filename from property address
  const addressParts = analysis.propertyAddress.split(',')[0].trim();
  const safeAddress = addressParts.replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `${safeAddress}_CostSeg_Report.pdf`;
  
  // Configure PDF options
  const options = {
    margin: 0,
    filename,
    image: { 
      type: 'jpeg', 
      quality: 0.98 
    },
    html2canvas: { 
      scale: 2,
      useCORS: true,
      letterRendering: true,
      logging: false,
    },
    jsPDF: { 
      unit: 'in', 
      format: 'letter', 
      orientation: 'portrait' 
    },
    pagebreak: { 
      mode: ['css', 'legacy'],
      before: '[data-page]',
      avoid: ['tr', '.avoid-break'],
    },
  };

  // Apply print styles temporarily
  const originalStyles = reportElement.style.cssText;
  reportElement.style.cssText = `
    width: 8.5in;
    min-height: auto;
    background: white;
  `;

  try {
    // Generate and save PDF
    await html2pdf()
      .set(options)
      .from(reportElement)
      .save();
  } finally {
    // Restore original styles
    reportElement.style.cssText = originalStyles;
  }
}

/**
 * Generate PDF blob (for preview or programmatic use)
 */
export async function generateCostSegPdfBlob(
  reportElement: HTMLElement
): Promise<Blob> {
  const html2pdf = (await import('html2pdf.js')).default;
  
  const options = {
    margin: 0,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { 
      scale: 2,
      useCORS: true,
      letterRendering: true,
    },
    jsPDF: { 
      unit: 'in', 
      format: 'letter', 
      orientation: 'portrait' 
    },
    pagebreak: { 
      mode: ['css', 'legacy'],
      before: '[data-page]',
    },
  };

  const blob = await html2pdf()
    .set(options)
    .from(reportElement)
    .outputPdf('blob');

  return blob as Blob;
}

/**
 * Generate PDF data URL (for iframe preview)
 */
export async function generateCostSegPdfDataUrl(
  reportElement: HTMLElement
): Promise<string> {
  const html2pdf = (await import('html2pdf.js')).default;
  
  const options = {
    margin: 0,
    image: { type: 'jpeg', quality: 0.95 },
    html2canvas: { 
      scale: 1.5,
      useCORS: true,
    },
    jsPDF: { 
      unit: 'in', 
      format: 'letter', 
      orientation: 'portrait' 
    },
    pagebreak: { 
      mode: ['css', 'legacy'],
      before: '[data-page]',
    },
  };

  const dataUrl = await html2pdf()
    .set(options)
    .from(reportElement)
    .outputPdf('dataurlstring');

  return dataUrl as string;
}

