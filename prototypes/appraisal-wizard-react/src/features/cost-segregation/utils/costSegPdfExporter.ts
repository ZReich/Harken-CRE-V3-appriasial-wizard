/**
 * Cost Segregation PDF Exporter
 * 
 * Utility for generating PDF reports from Cost Segregation analysis.
 * Uses html2pdf.js for client-side PDF generation.
 * Note: Requires html2pdf.js to be loaded in the page (via CDN or build).
 */

import type { CostSegAnalysis } from '../../../types';
import type { CostSegReportSettings } from '../hooks/useCostSegReportState';

// Type for html2pdf.js when loaded as a global
interface Html2PdfInstance {
  set: (options: Record<string, unknown>) => Html2PdfInstance;
  from: (element: HTMLElement) => Html2PdfInstance;
  save: () => Promise<void>;
}

type Html2PdfFactory = () => Html2PdfInstance;

export interface ExportOptions {
  analysis: CostSegAnalysis;
  sections: string[];
  settings: CostSegReportSettings;
  filename?: string;
}

/**
 * Generate and download a PDF of the Cost Segregation report.
 */
export async function exportCostSegToPdf(options: ExportOptions): Promise<void> {
  const { analysis, sections, settings, filename } = options;

  // Check if html2pdf is available as a global (loaded via CDN or included in build)
  const html2pdf = (window as unknown as { html2pdf?: Html2PdfFactory }).html2pdf;
  if (!html2pdf) {
    throw new Error('html2pdf.js library not loaded. Please include it in your page.');
  }

  // Create a container for the report
  const container = document.createElement('div');
  container.className = 'cost-seg-pdf-export';
  container.style.cssText = `
    position: absolute;
    left: -9999px;
    top: 0;
    width: 8.5in;
    background: white;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;

  // Generate HTML content for each section
  const htmlContent = generateReportHtml(analysis, sections, settings);
  container.innerHTML = htmlContent;
  document.body.appendChild(container);

  try {
    // Configure html2pdf options
    const pdfOptions = {
      margin: 0,
      filename: filename || `CostSeg_Report_${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        logging: false,
        letterRendering: true,
      },
      jsPDF: {
        unit: 'in',
        format: 'letter',
        orientation: 'portrait',
      },
      pagebreak: { mode: ['css', 'legacy'], avoid: '.avoid-break' },
    };

    // Generate and download PDF
    await html2pdf().set(pdfOptions).from(container).save();
  } finally {
    // Clean up
    document.body.removeChild(container);
  }
}

/**
 * Generate HTML content for the report.
 */
function generateReportHtml(
  analysis: CostSegAnalysis,
  sections: string[],
  settings: CostSegReportSettings
): string {
  const pages: string[] = [];

  sections.forEach((sectionId) => {
    switch (sectionId) {
      case 'cover':
        pages.push(generateCoverPage(analysis, settings));
        break;
      case 'summary':
        pages.push(generateSummaryPage(analysis));
        break;
      case 'methodology':
        pages.push(generateMethodologyPage(analysis));
        break;
      case 'components':
        pages.push(generateComponentsPage(analysis));
        break;
      case 'schedule':
        pages.push(generateSchedulePage(analysis, settings.scheduleMaxYears));
        break;
      case 'systems':
        pages.push(generateSystemsPage(analysis));
        break;
      case 'disclaimer':
        pages.push(generateDisclaimerPage(analysis, settings));
        break;
    }
  });

  return `
    <style>
      .page { 
        page-break-after: always; 
        padding: 0.75in;
        min-height: 10in;
        box-sizing: border-box;
      }
      .page:last-child { page-break-after: avoid; }
      h2 { 
        color: #1c3643; 
        font-size: 18px; 
        margin-bottom: 16px;
        padding-bottom: 8px;
        border-bottom: 2px solid #0da1c7;
      }
      h3 { 
        color: #1c3643; 
        font-size: 14px; 
        margin-top: 16px;
        margin-bottom: 8px;
      }
      table { 
        width: 100%; 
        border-collapse: collapse; 
        font-size: 10px;
      }
      th, td { 
        padding: 6px 8px; 
        border: 1px solid #e2e8f0;
        text-align: left;
      }
      th { 
        background: #f8fafc; 
        font-weight: 600;
        color: #334155;
      }
      .text-right { text-align: right; }
      .text-center { text-align: center; }
      .font-bold { font-weight: 700; }
      .font-medium { font-weight: 500; }
      .text-emerald { color: #059669; }
      .text-blue { color: #2563eb; }
      .text-slate { color: #475569; }
      .bg-emerald { background: #ecfdf5; }
      .bg-blue { background: #eff6ff; }
      .bg-slate { background: #f8fafc; }
      .metric-box {
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 12px;
        text-align: center;
      }
      .metric-value {
        font-size: 18px;
        font-weight: 700;
        color: #1c3643;
      }
      .metric-label {
        font-size: 10px;
        color: #64748b;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
    </style>
    ${pages.join('')}
  `;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function generateCoverPage(analysis: CostSegAnalysis, settings: CostSegReportSettings): string {
  const acceleratedPercent = analysis.summary.fiveYear.percent + analysis.summary.fifteenYear.percent;

  return `
    <div class="page" style="display: flex; flex-direction: column; justify-content: center;">
      <div style="height: 4px; background: linear-gradient(to right, #0da1c7, #1c3643); border-radius: 2px; margin-bottom: 48px;"></div>
      
      <div style="text-align: center; flex: 1; display: flex; flex-direction: column; justify-content: center;">
        <div style="font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 16px;">
          Cost Segregation Study
        </div>
        <h1 style="font-size: 28px; color: #1c3643; margin-bottom: 8px;">
          ${analysis.propertyName || 'Subject Property'}
        </h1>
        <p style="font-size: 14px; color: #64748b;">
          ${analysis.propertyAddress}
        </p>
        
        <div style="width: 48px; height: 3px; background: #0da1c7; margin: 32px auto;"></div>
        
        <div style="display: flex; justify-content: center; gap: 32px; margin-top: 32px;">
          <div class="metric-box" style="min-width: 140px;">
            <div class="metric-value" style="color: #0da1c7;">
              ${formatCurrency(analysis.totalProjectCost)}
            </div>
            <div class="metric-label">Total Project Cost</div>
          </div>
          <div class="metric-box" style="min-width: 140px;">
            <div class="metric-value" style="color: #059669;">
              ${formatPercent(acceleratedPercent)}
            </div>
            <div class="metric-label">Accelerated Recovery</div>
          </div>
          <div class="metric-box" style="min-width: 140px;">
            <div class="metric-value">
              ${formatCurrency(analysis.firstYearDepreciation)}
            </div>
            <div class="metric-label">Year 1 Depreciation</div>
          </div>
        </div>
      </div>
      
      <div style="border-top: 1px solid #e2e8f0; padding-top: 24px; display: flex; justify-content: space-between; align-items: flex-end;">
        <div>
          <div style="font-weight: 600; color: #1c3643;">${settings.firmName}</div>
          ${settings.preparerName ? `<div style="font-size: 12px; color: #64748b;">Prepared by: ${settings.preparerName}</div>` : ''}
        </div>
        <div style="text-align: right;">
          <div style="font-size: 11px; color: #64748b;">Analysis Date</div>
          <div style="font-weight: 500; color: #1c3643;">${formatDate(analysis.analysisDate)}</div>
        </div>
      </div>
    </div>
  `;
}

function generateSummaryPage(analysis: CostSegAnalysis): string {
  const acceleratedTotal = analysis.summary.fiveYear.total + analysis.summary.fifteenYear.total;

  return `
    <div class="page">
      <h2>Executive Summary</h2>
      
      <p style="font-size: 11px; color: #475569; margin-bottom: 24px;">
        This cost segregation study was conducted for <strong>${analysis.propertyName}</strong> 
        to identify and reclassify building components that qualify for accelerated depreciation 
        under IRS guidelines.
      </p>
      
      <div style="background: #f8fafc; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
        <h3 style="margin-top: 0;">Key Findings</h3>
        <table style="border: none;">
          <tr style="border: none;">
            <td style="border: none; width: 50%;">
              <div class="metric-label">Total Project Cost</div>
              <div class="metric-value">${formatCurrency(analysis.totalProjectCost)}</div>
            </td>
            <td style="border: none; width: 50%;">
              <div class="metric-label">Depreciable Basis</div>
              <div class="metric-value">${formatCurrency(analysis.totalImprovementCost)}</div>
            </td>
          </tr>
          <tr style="border: none;">
            <td style="border: none;">
              <div class="metric-label">Accelerated Recovery</div>
              <div class="metric-value text-emerald">${formatCurrency(acceleratedTotal)}</div>
            </td>
            <td style="border: none;">
              <div class="metric-label">First Year Depreciation</div>
              <div class="metric-value text-blue">${formatCurrency(analysis.firstYearDepreciation)}</div>
            </td>
          </tr>
        </table>
      </div>
      
      <h3>Cost Allocation Summary</h3>
      <table>
        <thead>
          <tr>
            <th>Depreciation Class</th>
            <th class="text-right">Amount</th>
            <th class="text-right">Percentage</th>
            <th class="text-center">Recovery Method</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Land (Non-Depreciable)</td>
            <td class="text-right font-medium">${formatCurrency(analysis.landValue)}</td>
            <td class="text-right text-slate">—</td>
            <td class="text-center text-slate">N/A</td>
          </tr>
          <tr class="bg-emerald">
            <td class="text-emerald font-medium">5-Year Personal Property</td>
            <td class="text-right font-medium text-emerald">${formatCurrency(analysis.summary.fiveYear.total)}</td>
            <td class="text-right text-emerald">${formatPercent(analysis.summary.fiveYear.percent)}</td>
            <td class="text-center text-emerald">200% DB / HY</td>
          </tr>
          <tr class="bg-blue">
            <td class="text-blue font-medium">15-Year Land Improvements</td>
            <td class="text-right font-medium text-blue">${formatCurrency(analysis.summary.fifteenYear.total)}</td>
            <td class="text-right text-blue">${formatPercent(analysis.summary.fifteenYear.percent)}</td>
            <td class="text-center text-blue">150% DB / HY</td>
          </tr>
          <tr>
            <td>${analysis.isResidential ? '27.5' : '39'}-Year Real Property</td>
            <td class="text-right font-medium">${formatCurrency(analysis.isResidential ? analysis.summary.twentySevenFiveYear.total : analysis.summary.thirtyNineYear.total)}</td>
            <td class="text-right text-slate">${formatPercent(analysis.isResidential ? analysis.summary.twentySevenFiveYear.percent : analysis.summary.thirtyNineYear.percent)}</td>
            <td class="text-center text-slate">SL / MM</td>
          </tr>
          <tr class="bg-slate font-bold">
            <td>Total Improvements</td>
            <td class="text-right">${formatCurrency(analysis.totalImprovementCost)}</td>
            <td class="text-right">100%</td>
            <td class="text-center">—</td>
          </tr>
        </tbody>
      </table>
      <p style="font-size: 9px; color: #64748b; margin-top: 8px;">
        DB = Declining Balance, SL = Straight-Line, HY = Half-Year Convention, MM = Mid-Month Convention
      </p>
    </div>
  `;
}

function generateMethodologyPage(analysis: CostSegAnalysis): string {
  return `
    <div class="page">
      <h2>Methodology & IRS Compliance</h2>
      
      <h3>Study Approach</h3>
      <p style="font-size: 11px; color: #475569;">
        This cost segregation study was prepared using the <strong>Cost Estimate Approach</strong>, 
        which is one of the three IRS-accepted methodologies. This approach allocates construction 
        costs to individual building components based on industry-standard cost data and engineering estimates.
      </p>
      
      <h3>IRS Authority & Legal Basis</h3>
      <table>
        <tr>
          <td style="width: 50%; vertical-align: top;">
            <strong>Asset Classification</strong>
            <ul style="font-size: 10px; color: #475569; margin: 4px 0; padding-left: 16px;">
              <li>IRC Section 1245 - Tangible Personal Property</li>
              <li>IRC Section 1250 - Real Property</li>
              <li>Revenue Procedure 87-56 - Asset Class Lives</li>
            </ul>
          </td>
          <td style="width: 50%; vertical-align: top;">
            <strong>Depreciation Rules</strong>
            <ul style="font-size: 10px; color: #475569; margin: 4px 0; padding-left: 16px;">
              <li>IRC Section 167 - Depreciation Deduction</li>
              <li>IRC Section 168 - MACRS Depreciation</li>
              <li>IRC Section 168(k) - Bonus Depreciation</li>
            </ul>
          </td>
        </tr>
        <tr>
          <td style="vertical-align: top;">
            <strong>Tangible Property Regulations</strong>
            <ul style="font-size: 10px; color: #475569; margin: 4px 0; padding-left: 16px;">
              <li>Treasury Decision 9636 (Final Regulations)</li>
              <li>Unit of Property Rules</li>
              <li>Nine Building Systems Framework</li>
            </ul>
          </td>
          <td style="vertical-align: top;">
            <strong>IRS Audit Guide</strong>
            <ul style="font-size: 10px; color: #475569; margin: 4px 0; padding-left: 16px;">
              <li>Cost Segregation Audit Techniques Guide</li>
              <li>Principal Elements and Minimum Requirements</li>
            </ul>
          </td>
        </tr>
      </table>
      
      <h3>Classification Criteria</h3>
      <table>
        <thead>
          <tr>
            <th>Class</th>
            <th>Description</th>
            <th>Key Criteria</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="font-medium text-emerald">5-Year</td>
            <td>Tangible Personal Property</td>
            <td style="font-size: 9px;">Not inherently permanent; removable without damage</td>
          </tr>
          <tr>
            <td class="font-medium text-blue">15-Year</td>
            <td>Land Improvements</td>
            <td style="font-size: 9px;">Improvements to land, not building structure</td>
          </tr>
          <tr>
            <td class="font-medium">${analysis.isResidential ? '27.5' : '39'}-Year</td>
            <td>${analysis.isResidential ? 'Residential' : 'Nonresidential'} Real Property</td>
            <td style="font-size: 9px;">Structural components; integral to building</td>
          </tr>
        </tbody>
      </table>
    </div>
  `;
}

function generateComponentsPage(analysis: CostSegAnalysis): string {
  // Group components by class
  const grouped: Record<string, typeof analysis.components> = {
    '5-year': [],
    '7-year': [],
    '15-year': [],
    '27.5-year': [],
    '39-year': [],
  };

  analysis.components.forEach(c => {
    const effectiveClass = c.depreciationClassOverride || c.depreciationClass;
    if (grouped[effectiveClass]) {
      grouped[effectiveClass].push(c);
    }
  });

  const classLabels: Record<string, string> = {
    '5-year': '5-Year Personal Property',
    '7-year': '7-Year Personal Property',
    '15-year': '15-Year Land Improvements',
    '27.5-year': '27.5-Year Residential',
    '39-year': '39-Year Nonresidential',
  };

  let content = `
    <div class="page">
      <h2>Component Detail Listing</h2>
      <p style="font-size: 11px; color: #475569; margin-bottom: 16px;">
        Detailed listing of all building and site components analyzed, organized by IRS depreciation class.
      </p>
  `;

  ['5-year', '15-year', '39-year'].forEach(depClass => {
    const components = grouped[depClass];
    if (components.length === 0) return;

    const classTotal = components.reduce((sum, c) => sum + c.cost, 0);
    const classPercent = analysis.totalImprovementCost > 0 ? classTotal / analysis.totalImprovementCost : 0;

    content += `
      <h3 style="background: ${depClass === '5-year' ? '#ecfdf5' : depClass === '15-year' ? '#eff6ff' : '#f8fafc'}; 
                 padding: 8px; border-radius: 4px; margin-top: 16px;">
        ${classLabels[depClass]} - ${formatCurrency(classTotal)} (${formatPercent(classPercent)})
      </h3>
      <table style="font-size: 9px;">
        <thead>
          <tr>
            <th>Component</th>
            <th>Category</th>
            <th class="text-right">Cost</th>
            <th class="text-right">% of Total</th>
          </tr>
        </thead>
        <tbody>
          ${components.slice(0, 15).map(c => `
            <tr>
              <td>${c.label}</td>
              <td style="text-transform: capitalize;">${c.category.replace(/-/g, ' ')}</td>
              <td class="text-right font-medium">${formatCurrency(c.cost)}</td>
              <td class="text-right">${formatPercent(c.percentOfTotal)}</td>
            </tr>
          `).join('')}
          ${components.length > 15 ? `
            <tr>
              <td colspan="4" style="text-align: center; font-style: italic; color: #64748b;">
                ... and ${components.length - 15} more components
              </td>
            </tr>
          ` : ''}
        </tbody>
      </table>
    `;
  });

  content += '</div>';
  return content;
}

function generateSchedulePage(analysis: CostSegAnalysis, maxYears: number): string {
  const schedule = analysis.depreciationSchedule.slice(0, Math.min(maxYears, 15));

  return `
    <div class="page">
      <h2>Depreciation Schedule</h2>
      <p style="font-size: 11px; color: #475569; margin-bottom: 16px;">
        Year-by-year depreciation by asset class using MACRS rates per IRS Publication 946.
      </p>
      
      <table style="font-size: 9px;">
        <thead>
          <tr>
            <th>Year</th>
            <th class="text-right">5-Year</th>
            <th class="text-right">15-Year</th>
            <th class="text-right">${analysis.isResidential ? '27.5-Year' : '39-Year'}</th>
            <th class="text-right font-bold">Total</th>
            <th class="text-right">Cumulative</th>
            <th class="text-right">Remaining</th>
          </tr>
        </thead>
        <tbody>
          ${schedule.map((year, idx) => `
            <tr style="${year.year === 1 ? 'background: #ecfdf5;' : idx % 2 === 1 ? 'background: #f8fafc;' : ''}">
              <td class="font-medium">Year ${year.year}</td>
              <td class="text-right text-emerald">${formatCurrency(year.fiveYearDepreciation)}</td>
              <td class="text-right text-blue">${formatCurrency(year.fifteenYearDepreciation)}</td>
              <td class="text-right">${formatCurrency(analysis.isResidential ? year.twentySevenFiveYearDepreciation : year.thirtyNineYearDepreciation)}</td>
              <td class="text-right font-bold">${formatCurrency(year.totalDepreciation)}</td>
              <td class="text-right">${formatCurrency(year.cumulativeDepreciation)}</td>
              <td class="text-right">${formatCurrency(year.remainingBasis)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      ${schedule.length < analysis.depreciationSchedule.length ? `
        <p style="font-size: 9px; color: #64748b; text-align: center; margin-top: 8px;">
          Showing first ${schedule.length} years of ${analysis.depreciationSchedule.length}-year recovery period
        </p>
      ` : ''}
    </div>
  `;
}

function generateSystemsPage(analysis: CostSegAnalysis): string {
  const systems = analysis.buildingSystems
    .filter(s => s.depreciableCost > 0)
    .sort((a, b) => b.depreciableCost - a.depreciableCost);

  return `
    <div class="page">
      <h2>Building Systems Analysis</h2>
      <p style="font-size: 11px; color: #475569; margin-bottom: 16px;">
        Treasury Decision 9636 defines nine building systems as distinct units of property for 
        tangible property regulations compliance.
      </p>
      
      <table>
        <thead>
          <tr>
            <th>System</th>
            <th class="text-right">Depreciable Cost</th>
            <th class="text-right">% of Building</th>
            <th class="text-center">Components</th>
          </tr>
        </thead>
        <tbody>
          ${systems.map((system, idx) => `
            <tr style="${idx % 2 === 1 ? 'background: #f8fafc;' : ''}">
              <td class="font-medium">${system.systemLabel}</td>
              <td class="text-right">${formatCurrency(system.depreciableCost)}</td>
              <td class="text-right">${formatPercent(system.percentOfBuilding)}</td>
              <td class="text-center">${system.components.length}</td>
            </tr>
          `).join('')}
          <tr class="bg-slate font-bold">
            <td>Total</td>
            <td class="text-right">${formatCurrency(systems.reduce((sum, s) => sum + s.depreciableCost, 0))}</td>
            <td class="text-right">${formatPercent(systems.reduce((sum, s) => sum + s.percentOfBuilding, 0))}</td>
            <td class="text-center">${systems.reduce((sum, s) => sum + s.components.length, 0)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  `;
}

function generateDisclaimerPage(analysis: CostSegAnalysis, settings: CostSegReportSettings): string {
  return `
    <div class="page">
      <h2>Limiting Conditions & Disclaimer</h2>
      
      <h3>General Disclaimer</h3>
      <p style="font-size: 10px; color: #475569;">
        This cost segregation study has been prepared for the purpose of allocating building 
        and site improvement costs to the appropriate IRS depreciation classes. The analysis 
        is based on information provided by the property owner. We have not independently 
        verified all information.
      </p>
      
      <h3>Tax Advice Disclaimer</h3>
      <p style="font-size: 10px; color: #475569;">
        <strong>This study does not constitute tax advice.</strong> The property owner should 
        consult with a qualified tax professional before implementing any tax strategies based 
        on this study.
      </p>
      
      <h3>IRS Compliance</h3>
      <p style="font-size: 10px; color: #475569;">
        While this study has been prepared in accordance with IRS guidelines, the final 
        determination of depreciation classifications rests with the Internal Revenue Service.
      </p>
      
      <div style="background: #1c3643; color: white; border-radius: 8px; padding: 16px; margin-top: 24px;">
        <h3 style="color: white; margin-top: 0; border: none;">Preparer Certification</h3>
        <p style="font-size: 10px; color: #cbd5e1;">
          I certify that this cost segregation study was prepared in accordance with IRS guidelines 
          and represents my professional opinion regarding the classification of building components.
        </p>
        <div style="border-top: 1px solid #475569; margin-top: 12px; padding-top: 12px; display: flex; justify-content: space-between;">
          <div>
            <div style="font-size: 9px; color: #94a3b8;">Prepared By</div>
            <div style="font-weight: 500;">${settings.preparerName || '[Preparer Name]'}</div>
            ${settings.preparerCredentials ? `<div style="font-size: 10px; color: #cbd5e1;">${settings.preparerCredentials}</div>` : ''}
          </div>
          <div>
            <div style="font-size: 9px; color: #94a3b8;">Firm</div>
            <div style="font-weight: 500;">${settings.firmName}</div>
          </div>
          <div>
            <div style="font-size: 9px; color: #94a3b8;">Date</div>
            <div style="font-weight: 500;">${formatDate(analysis.analysisDate)}</div>
          </div>
        </div>
      </div>
    </div>
  `;
}
