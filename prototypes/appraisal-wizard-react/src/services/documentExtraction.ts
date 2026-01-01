/**
 * Document Extraction Service
 * 
 * This service handles document upload, AI-powered classification, and data extraction.
 * Uses real backend API endpoints for AI processing.
 * 
 * Backend API Endpoints:
 * - POST /api/documents/classify - AI document classification
 * - POST /api/documents/extract - AI data extraction
 */

// ==========================================
// DOCUMENT TYPES
// ==========================================
export type DocumentType = 
  | 'cadastral' 
  | 'engagement' 
  | 'sale' 
  | 'lease' 
  | 'rentroll' 
  | 'survey'
  | 'tax_return'
  | 'financial_statement'
  | 'unknown';

export interface DocumentTypeInfo {
  id: DocumentType;
  label: string;
  description: string;
  icon: string;
  color: string;
  extractFields: string[];
}

export const DOCUMENT_TYPES: Record<DocumentType, DocumentTypeInfo> = {
  cadastral: {
    id: 'cadastral',
    label: 'Cadastral / County Records',
    description: 'Property address, legal description, tax ID, owner, land area',
    icon: 'landmark',
    color: 'blue',
    extractFields: ['propertyAddress', 'legalDescription', 'taxId', 'owner', 'landArea', 'county', 'state', 'zipCode', 'yearBuilt', 'buildingSize', 'zoning'],
  },
  engagement: {
    id: 'engagement',
    label: 'Engagement Letter',
    description: 'Client name, fee, appraisal purpose, effective date',
    icon: 'file-signature',
    color: 'purple',
    extractFields: ['clientName', 'clientAddress', 'fee', 'appraisalPurpose', 'effectiveDate', 'intendedUse', 'intendedUsers', 'propertyAddress', 'propertyType', 'scopeOfWork', 'dueDate'],
  },
  sale: {
    id: 'sale',
    label: 'Buy/Sale Agreement',
    description: 'Sale price, sale date, buyer/seller, terms',
    icon: 'handshake',
    color: 'green',
    extractFields: ['salePrice', 'saleDate', 'buyer', 'seller', 'terms', 'earnestMoney', 'closingDate', 'propertyAddress', 'downPayment', 'financingTerms', 'contingencies'],
  },
  lease: {
    id: 'lease',
    label: 'Lease Agreement',
    description: 'Tenant info, rent amounts, lease terms',
    icon: 'file',
    color: 'orange',
    extractFields: ['tenantName', 'landlordName', 'rentAmount', 'leaseStart', 'leaseEnd', 'terms', 'escalations', 'options', 'securityDeposit', 'propertyAddress', 'squareFeet', 'leaseType', 'commonAreaMaintenance'],
  },
  rentroll: {
    id: 'rentroll',
    label: 'Rent Roll',
    description: 'Unit mix, occupancy, rental income',
    icon: 'bar-chart-3',
    color: 'teal',
    extractFields: ['units', 'occupancyRate', 'grossIncome', 'netIncome', 'averageRent', 'vacancies', 'totalSquareFeet', 'numberOfTenants', 'annualRent', 'monthlyRent'],
  },
  survey: {
    id: 'survey',
    label: 'Survey / Plat Map',
    description: 'Property boundaries, easements, dimensions',
    icon: 'map',
    color: 'indigo',
    extractFields: ['landArea', 'boundaries', 'easements', 'legalDescription', 'dimensions', 'setbacks', 'floodZone', 'surveyDate', 'surveyor', 'zoning'],
  },
  tax_return: {
    id: 'tax_return',
    label: 'Tax Return',
    description: 'Income, expenses, depreciation schedules',
    icon: 'receipt',
    color: 'red',
    extractFields: ['grossIncome', 'expenses', 'netIncome', 'depreciation', 'mortgageInterest', 'propertyTaxes', 'insurance', 'repairs', 'utilities', 'taxYear'],
  },
  financial_statement: {
    id: 'financial_statement',
    label: 'Financial Statement',
    description: 'Operating income, expenses, NOI',
    icon: 'wallet',
    color: 'emerald',
    extractFields: ['grossIncome', 'effectiveGrossIncome', 'expenses', 'netIncome', 'vacancyRate', 'managementFee', 'propertyTaxes', 'insurance', 'utilities', 'repairs', 'reserves', 'period'],
  },
  unknown: {
    id: 'unknown',
    label: 'Unknown Document',
    description: 'Document type could not be determined',
    icon: 'help-circle',
    color: 'gray',
    extractFields: ['propertyAddress', 'owner', 'value', 'date', 'description'],
  },
};

// ==========================================
// CLASSIFICATION TYPES
// ==========================================
export interface ClassificationResult {
  documentType: DocumentType;
  confidence: number;
  alternativeTypes?: { type: DocumentType; confidence: number; reasoning?: string }[];
  processingTimeMs: number;
  reasoning?: string;
  keyIndicators?: string[];
}

// ==========================================
// EXTRACTION TYPES
// ==========================================
export interface ExtractedField {
  value: string;
  confidence: number;
  edited?: boolean;
  source?: string; // Which document this came from
  sourceDocumentId?: string;
}

export interface ExtractedData {
  [key: string]: ExtractedField;
}

export interface ExtractionResult {
  success: boolean;
  data?: ExtractedData;
  error?: string;
  processingTimeMs?: number;
  tenants?: Array<{
    name: string;
    unit?: string;
    sqft?: string;
    rent?: string;
  }>;
}

export interface CadastralExtraction {
  propertyAddress: ExtractedField;
  legalDescription: ExtractedField;
  taxId: ExtractedField;
  owner: ExtractedField;
  landArea: ExtractedField;
  county?: ExtractedField;
  state?: ExtractedField;
  zipCode?: ExtractedField;
  yearBuilt?: ExtractedField;
  buildingSize?: ExtractedField;
  zoning?: ExtractedField;
}

export interface EngagementExtraction {
  clientName: ExtractedField;
  fee: ExtractedField;
  appraisalPurpose: ExtractedField;
  effectiveDate: ExtractedField;
  clientAddress?: ExtractedField;
  propertyAddress?: ExtractedField;
  intendedUse?: ExtractedField;
  intendedUsers?: ExtractedField;
  propertyType?: ExtractedField;
  scopeOfWork?: ExtractedField;
  dueDate?: ExtractedField;
}

export interface SaleAgreementExtraction {
  salePrice: ExtractedField;
  saleDate: ExtractedField;
  buyer: ExtractedField;
  seller: ExtractedField;
  terms: ExtractedField;
  earnestMoney?: ExtractedField;
  closingDate?: ExtractedField;
  propertyAddress?: ExtractedField;
  downPayment?: ExtractedField;
  financingTerms?: ExtractedField;
  contingencies?: ExtractedField;
}

export interface LeaseExtraction {
  tenantName: ExtractedField;
  rentAmount: ExtractedField;
  leaseStart: ExtractedField;
  leaseEnd: ExtractedField;
  terms: ExtractedField;
  escalations?: ExtractedField;
  options?: ExtractedField;
  landlordName?: ExtractedField;
  securityDeposit?: ExtractedField;
  propertyAddress?: ExtractedField;
  squareFeet?: ExtractedField;
  leaseType?: ExtractedField;
  commonAreaMaintenance?: ExtractedField;
}

export interface RentRollExtraction {
  units: ExtractedField;
  occupancyRate: ExtractedField;
  grossIncome: ExtractedField;
  netIncome: ExtractedField;
  averageRent?: ExtractedField;
  vacancies?: ExtractedField;
  totalSquareFeet?: ExtractedField;
  numberOfTenants?: ExtractedField;
  annualRent?: ExtractedField;
  monthlyRent?: ExtractedField;
}

// ==========================================
// API CONFIGURATION
// ==========================================
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Set to 'true' to use mock data (for development without API)
// Defaults to false (real AI enabled)
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true';

// ==========================================
// PDF TEXT EXTRACTION (Client-side)
// ==========================================

/**
 * Convert PDF first page to base64 image for Vision API
 */
async function convertPdfToImage(file: File): Promise<string | null> {
  try {
    console.log('[DocumentExtraction] Converting PDF to image...');
    const pdfjsLib = await import('pdfjs-dist');
    const pdfjsWorker = await import('pdfjs-dist/build/pdf.worker.min.mjs?url');
    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker.default;
    
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const page = await pdf.getPage(1); // Get first page only
    
    // Create canvas to render PDF page
    const viewport = page.getViewport({ scale: 2.0 }); // 2x scale for better quality
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    if (!context) {
      console.error('[DocumentExtraction] Could not get canvas context');
      return null;
    }
    
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    
    // Render PDF page to canvas
    await page.render({
      canvasContext: context,
      viewport: viewport,
    }).promise;
    
    // Convert canvas to base64 image
    const imageData = canvas.toDataURL('image/jpeg', 0.95).split(',')[1]; // Remove data:image/jpeg;base64, prefix
    console.log(`[DocumentExtraction] ✓ PDF converted to image (${imageData.length} chars base64)`);
    
    return imageData;
  } catch (error) {
    console.error('[DocumentExtraction] ✗ PDF to image conversion failed:', error);
    return null;
  }
}

/**
 * Extract text from a PDF file using pdf.js
 * Falls back to sending to backend if client-side extraction fails
 */
export async function extractTextFromFile(file: File): Promise<string> {
  console.log(`[DocumentExtraction] Starting text extraction for: ${file.name} (${file.type})`);
  
  // For PDF files, try to extract text client-side first
  if (file.type === 'application/pdf') {
    try {
      // Dynamically import pdf.js
      console.log('[DocumentExtraction] Loading pdfjs-dist...');
      const pdfjsLib = await import('pdfjs-dist');
      
      // Import the worker from the package itself (best for Vite/Webpack bundling)
      // This avoids CDN CORS issues and version mismatches
      const pdfjsWorker = await import('pdfjs-dist/build/pdf.worker.min.mjs?url');
      pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker.default;
      console.log('[DocumentExtraction] PDF.js worker loaded from package bundle');
      
      const arrayBuffer = await file.arrayBuffer();
      console.log(`[DocumentExtraction] File loaded, size: ${arrayBuffer.byteLength} bytes`);
      
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      console.log(`[DocumentExtraction] PDF loaded, ${pdf.numPages} pages`);
      
      let fullText = '';
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        
        console.log(`[DocumentExtraction] Page ${i} textContent.items count:`, textContent.items.length);
        console.log(`[DocumentExtraction] Page ${i} first 5 items:`, textContent.items.slice(0, 5));
        
        const pageText = textContent.items
          .map((item: any) => {
            // TextItem has 'str' property, TextMarkedContent doesn't
            const text = 'str' in item ? item.str : '';
            if (text && i === 1) {
              console.log(`[DocumentExtraction] Found text:`, text);
            }
            return text;
          })
          .join(' ');
        
        console.log(`[DocumentExtraction] Page ${i} extracted: ${pageText.length} chars`);
        console.log(`[DocumentExtraction] Page ${i} text preview:`, pageText.substring(0, 200));
        fullText += pageText + '\n\n';
      }
      
      // If we got meaningful text, return it
      if (fullText.trim().length > 100) {
        console.log(`[DocumentExtraction] ✓ Extracted ${fullText.length} chars from PDF client-side`);
        return fullText.trim();
      }
      
      // If text is too short, PDF is likely image-based
      console.warn(`[DocumentExtraction] ⚠ PDF is image-based (${fullText.trim().length} chars extracted)`);
      console.log('[DocumentExtraction] Will use Vision API for image-based PDF');
      return ''; // Return empty to signal image-based PDF
      
    } catch (error) {
      console.error('[DocumentExtraction] ✗ Client-side PDF extraction failed:', error);
      // Fall through to return empty
    }
  }
  
  // For non-PDF files or if extraction failed, return empty
  console.warn('[DocumentExtraction] No text extracted - will try Vision API if supported');
  return '';
}

// ==========================================
// MOCK DATA GENERATORS
// ==========================================
const mockExtractions: Record<string, () => ExtractedData> = {
  cadastral: () => ({
    propertyAddress: { value: '1234 Industrial Blvd, Billings, MT 59101', confidence: 0.95 },
    legalDescription: { 
      value: 'Lot 12, Block 4, CANYON CREEK INDUSTRIAL PARK, according to the plat thereof on file in the office of the Clerk and Recorder of Yellowstone County, Montana', 
      confidence: 0.88 
    },
    taxId: { value: '123-45-678-00', confidence: 0.97 },
    owner: { value: 'ABC Industrial Holdings LLC', confidence: 0.92 },
    landArea: { value: '2.45 acres (106,722 SF)', confidence: 0.94 },
    county: { value: 'Yellowstone County', confidence: 0.96 },
    state: { value: 'Montana', confidence: 0.99 },
    zipCode: { value: '59101', confidence: 0.98 },
  }),

  engagement: () => ({
    clientName: { value: 'First National Bank of Montana', confidence: 0.96 },
    fee: { value: '$4,500', confidence: 0.89 },
    appraisalPurpose: { value: 'Market Value for Loan Collateral', confidence: 0.91 },
    effectiveDate: { value: new Date().toISOString().split('T')[0], confidence: 0.94 },
    clientAddress: { value: '500 Main Street, Billings, MT 59101', confidence: 0.87 },
    intendedUse: { value: 'First mortgage loan decision', confidence: 0.85 },
  }),

  sale: () => ({
    salePrice: { value: '$2,150,000', confidence: 0.97 },
    saleDate: { value: '2024-06-15', confidence: 0.95 },
    buyer: { value: 'ABC Industrial Holdings LLC', confidence: 0.93 },
    seller: { value: 'Montana Properties Inc', confidence: 0.91 },
    terms: { value: 'Cash to Seller, conventional financing', confidence: 0.85 },
    earnestMoney: { value: '$50,000', confidence: 0.88 },
    closingDate: { value: '2024-07-15', confidence: 0.90 },
  }),

  lease: () => ({
    tenantName: { value: 'Acme Manufacturing Co.', confidence: 0.94 },
    rentAmount: { value: '$8,500/month NNN', confidence: 0.92 },
    leaseStart: { value: '2023-01-01', confidence: 0.96 },
    leaseEnd: { value: '2028-12-31', confidence: 0.96 },
    terms: { value: '5-year term, 3% annual escalations', confidence: 0.88 },
    escalations: { value: '3% annually', confidence: 0.90 },
    options: { value: 'Two 5-year renewal options at market rate', confidence: 0.82 },
  }),

  rentroll: () => ({
    units: { value: '12 units (10 office, 2 warehouse)', confidence: 0.91 },
    occupancyRate: { value: '92%', confidence: 0.94 },
    grossIncome: { value: '$245,000/year', confidence: 0.89 },
    netIncome: { value: '$198,500/year', confidence: 0.87 },
    averageRent: { value: '$18.50/SF', confidence: 0.85 },
    vacancies: { value: '1 unit (850 SF)', confidence: 0.92 },
  }),
};

// ==========================================
// EXTRACTION FUNCTIONS
// ==========================================

/**
 * Extract data from an uploaded document
 * @param file The uploaded file
 * @param documentType The type of document (cadastral, engagement, sale, lease, rentroll)
 * @returns Promise with extraction result
 */
export async function extractDocumentData(
  file: File,
  documentType: string
): Promise<ExtractionResult> {
  const startTime = Date.now();

  if (USE_MOCK_DATA) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));

    const mockGenerator = mockExtractions[documentType];
    if (!mockGenerator) {
      return {
        success: false,
        error: `Unknown document type: ${documentType}`,
        processingTimeMs: Date.now() - startTime,
      };
    }

    return {
      success: true,
      data: mockGenerator(),
      processingTimeMs: Date.now() - startTime,
    };
  }

  // Real API call
  try {
    // First, extract text from the file
    const text = await extractTextFromFile(file);
    
    // If no text was extracted, the PDF is image-based - convert to image
    if (!text || text.length < 50) {
      console.log('[DocumentExtraction] Image-based PDF detected, converting to image for Vision API');
      
      // Convert PDF first page to image
      const imageData = await convertPdfToImage(file);
      if (!imageData) {
        return {
          success: false,
          error: 'Could not convert PDF to image for Vision API processing.',
          processingTimeMs: Date.now() - startTime,
        };
      }
      
      console.log('[DocumentExtraction] PDF converted to image, sending to Vision API');
      
      // Call the backend extraction API with image data
      const response = await fetch(`${API_BASE_URL}/documents/extract`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: imageData, // Send base64 image instead of text
          documentType,
          filename: file.name,
          useVision: true, // Flag to indicate Vision API should be used
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.error || `Server error: ${response.status}`,
          processingTimeMs: Date.now() - startTime,
        };
      }
      
      const data = await response.json();
      
      if (!data.success) {
        return {
          success: false,
          error: data.error || 'Extraction failed',
          processingTimeMs: Date.now() - startTime,
        };
      }
      
      // Normalize and return
      const normalizedFields: Record<string, ExtractedField> = {};
      if (data.fields) {
        for (const [key, field] of Object.entries(data.fields)) {
          const typedField = field as { value: string | null; confidence: number };
          if (typedField.value !== null && typedField.value !== undefined) {
            normalizedFields[key] = {
              value: typedField.value,
              confidence: typedField.confidence > 1 ? typedField.confidence / 100 : typedField.confidence,
              source: file.name,
            };
          }
        }
      }
      
      return {
        success: true,
        data: normalizedFields,
        processingTimeMs: Date.now() - startTime,
        tenants: data.tenants,
      };
    }

    // Text was extracted successfully, use text-based extraction
    console.log('[DocumentExtraction] Text extracted successfully, using text-based extraction');
    
    // Call the backend extraction API
    const response = await fetch(`${API_BASE_URL}/documents/extract`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        documentType,
        filename: file.name,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.error || `Server error: ${response.status}`,
        processingTimeMs: Date.now() - startTime,
      };
    }

    const data = await response.json();
    
    if (!data.success) {
      return {
        success: false,
        error: data.error || 'Extraction failed',
        processingTimeMs: Date.now() - startTime,
      };
    }

    // Normalize confidence scores to 0-1 range
    const normalizedFields: Record<string, ExtractedField> = {};
    if (data.fields) {
      for (const [key, field] of Object.entries(data.fields)) {
        const typedField = field as { value: string | null; confidence: number };
        if (typedField.value !== null && typedField.value !== undefined) {
          normalizedFields[key] = {
            value: typedField.value,
            confidence: typedField.confidence > 1 ? typedField.confidence / 100 : typedField.confidence,
            source: file.name,
          };
        }
      }
    }

    return {
      success: true,
      data: normalizedFields,
      processingTimeMs: Date.now() - startTime,
      tenants: data.tenants,
    };
  } catch (error) {
    console.error('[DocumentExtraction] Extraction error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
      processingTimeMs: Date.now() - startTime,
    };
  }
}

/**
 * Batch extract data from multiple documents
 * @param files Array of files with their document types
 * @returns Promise with all extraction results
 */
export async function batchExtractDocuments(
  files: Array<{ file: File; documentType: string }>
): Promise<Record<string, ExtractionResult>> {
  const results: Record<string, ExtractionResult> = {};

  // Process in parallel
  await Promise.all(
    files.map(async ({ file, documentType }) => {
      const result = await extractDocumentData(file, documentType);
      results[`${documentType}_${file.name}`] = result;
    })
  );

  return results;
}

/**
 * Merge extracted data from multiple sources
 * Prioritizes data with higher confidence scores
 */
export function mergeExtractedData(
  sources: ExtractedData[]
): ExtractedData {
  const merged: ExtractedData = {};

  for (const source of sources) {
    for (const [key, field] of Object.entries(source)) {
      if (!merged[key] || field.confidence > merged[key].confidence) {
        merged[key] = { ...field };
      }
    }
  }

  return merged;
}

/**
 * Get field labels for display
 */
export function getFieldLabel(fieldName: string): string {
  const labels: Record<string, string> = {
    propertyAddress: 'Property Address',
    legalDescription: 'Legal Description',
    taxId: 'Tax ID / Parcel #',
    owner: 'Property Owner',
    landArea: 'Land Area',
    county: 'County',
    state: 'State',
    zipCode: 'ZIP Code',
    yearBuilt: 'Year Built',
    buildingSize: 'Building Size',
    zoning: 'Zoning',
    clientName: 'Client Name',
    clientAddress: 'Client Address',
    fee: 'Appraisal Fee',
    appraisalPurpose: 'Appraisal Purpose',
    effectiveDate: 'Effective Date',
    intendedUse: 'Intended Use',
    intendedUsers: 'Intended Users',
    propertyType: 'Property Type',
    scopeOfWork: 'Scope of Work',
    dueDate: 'Due Date',
    salePrice: 'Sale Price',
    saleDate: 'Sale Date',
    buyer: 'Buyer',
    seller: 'Seller',
    terms: 'Terms',
    earnestMoney: 'Earnest Money',
    closingDate: 'Closing Date',
    downPayment: 'Down Payment',
    financingTerms: 'Financing Terms',
    contingencies: 'Contingencies',
    tenantName: 'Tenant Name',
    landlordName: 'Landlord Name',
    rentAmount: 'Rent Amount',
    leaseStart: 'Lease Start',
    leaseEnd: 'Lease End',
    escalations: 'Escalations',
    options: 'Options',
    securityDeposit: 'Security Deposit',
    squareFeet: 'Square Feet',
    leaseType: 'Lease Type',
    commonAreaMaintenance: 'CAM',
    units: 'Unit Mix',
    occupancyRate: 'Occupancy Rate',
    grossIncome: 'Gross Income',
    effectiveGrossIncome: 'Effective Gross Income',
    netIncome: 'Net Income',
    averageRent: 'Average Rent',
    vacancies: 'Vacancies',
    totalSquareFeet: 'Total Square Feet',
    numberOfTenants: 'Number of Tenants',
    annualRent: 'Annual Rent',
    monthlyRent: 'Monthly Rent',
    boundaries: 'Boundaries',
    easements: 'Easements',
    dimensions: 'Dimensions',
    setbacks: 'Setbacks',
    floodZone: 'Flood Zone',
    surveyDate: 'Survey Date',
    surveyor: 'Surveyor',
    depreciation: 'Depreciation',
    mortgageInterest: 'Mortgage Interest',
    propertyTaxes: 'Property Taxes',
    insurance: 'Insurance',
    repairs: 'Repairs',
    utilities: 'Utilities',
    taxYear: 'Tax Year',
    vacancyRate: 'Vacancy Rate',
    managementFee: 'Management Fee',
    reserves: 'Reserves',
    period: 'Period',
    value: 'Value',
    date: 'Date',
    description: 'Description',
  };

  return labels[fieldName] || fieldName.replace(/([A-Z])/g, ' $1').trim();
}

/**
 * Get confidence level classification
 */
export function getConfidenceLevel(confidence: number): 'high' | 'medium' | 'low' {
  if (confidence >= 0.9) return 'high';
  if (confidence >= 0.7) return 'medium';
  return 'low';
}

/**
 * Get confidence color classes for styling
 */
export function getConfidenceColorClasses(confidence: number): string {
  const level = getConfidenceLevel(confidence);
  switch (level) {
    case 'high':
      return 'text-green-600 bg-green-50 border-green-200';
    case 'medium':
      return 'text-amber-600 bg-amber-50 border-amber-200';
    case 'low':
      return 'text-red-600 bg-red-50 border-red-200';
  }
}

// ==========================================
// AI DOCUMENT CLASSIFICATION
// ==========================================

/**
 * Classify a document using AI
 * Extracts text and sends to backend for classification
 */
export async function classifyDocument(file: File): Promise<ClassificationResult> {
  const startTime = Date.now();
  
  if (USE_MOCK_DATA) {
    // Simulate API processing time
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 700));
    
    // Use filename-based classification for mock mode
    const filename = file.name.toLowerCase();
    const filenameClassifications: Record<string, DocumentType> = {
      'cadastral': 'cadastral',
      'county': 'cadastral',
      'parcel': 'cadastral',
      'assessor': 'cadastral',
      'engagement': 'engagement',
      'letter': 'engagement',
      'proposal': 'engagement',
      'sale': 'sale',
      'purchase': 'sale',
      'psa': 'sale',
      'lease': 'lease',
      'rental': 'lease',
      'rentroll': 'rentroll',
      'rent_roll': 'rentroll',
      'rent-roll': 'rentroll',
      'occupancy': 'rentroll',
      'survey': 'survey',
      'plat': 'survey',
      'alta': 'survey',
      'tax': 'tax_return',
      '1040': 'tax_return',
      'schedule': 'tax_return',
      'financial': 'financial_statement',
      'operating': 'financial_statement',
      'proforma': 'financial_statement',
    };
    
    let matchedType: DocumentType = 'unknown';
    let matchedConfidence = 0.5;
    
    for (const [keyword, docType] of Object.entries(filenameClassifications)) {
      if (filename.includes(keyword)) {
        matchedType = docType;
        matchedConfidence = 0.85 + Math.random() * 0.10;
        break;
      }
    }
    
    if (matchedType === 'unknown') {
      // Random assignment for demo
      const types: DocumentType[] = ['cadastral', 'engagement', 'sale', 'lease', 'rentroll'];
      matchedType = types[Math.floor(Math.random() * types.length)];
      matchedConfidence = 0.70 + Math.random() * 0.15;
    }
    
    return {
      documentType: matchedType,
      confidence: matchedConfidence,
      alternativeTypes: [],
      processingTimeMs: Date.now() - startTime,
    };
  }
  
  // Real API call
  try {
    // Extract text from the file
    const text = await extractTextFromFile(file);
    
    if (!text || text.length < 50) {
      // If we can't extract text, use filename-based fallback
      console.warn('[DocumentExtraction] Could not extract text, using filename-based classification');
      const filename = file.name.toLowerCase();
      
      // Simple filename matching
      const lowerFilename = filename.toLowerCase();
      if (lowerFilename.includes('cadastral') || lowerFilename.includes('county') || 
          lowerFilename.includes('parcel') || lowerFilename.includes('cad') || 
          lowerFilename.includes('assessor') || lowerFilename.includes('tax')) {
        return { documentType: 'cadastral', confidence: 0.6, processingTimeMs: Date.now() - startTime };
      }
      if (lowerFilename.includes('engagement') || lowerFilename.includes('letter') || 
          lowerFilename.includes('proposal')) {
        return { documentType: 'engagement', confidence: 0.6, processingTimeMs: Date.now() - startTime };
      }
      if (lowerFilename.includes('sale') || lowerFilename.includes('purchase') || 
          lowerFilename.includes('deed')) {
        return { documentType: 'sale', confidence: 0.6, processingTimeMs: Date.now() - startTime };
      }
      if (lowerFilename.includes('lease') || lowerFilename.includes('rental')) {
        return { documentType: 'lease', confidence: 0.6, processingTimeMs: Date.now() - startTime };
      }
      if (lowerFilename.includes('rent') && (lowerFilename.includes('roll') || lowerFilename.includes('list'))) {
        return { documentType: 'rentroll', confidence: 0.6, processingTimeMs: Date.now() - startTime };
      }
      
      return { documentType: 'unknown', confidence: 0.3, processingTimeMs: Date.now() - startTime };
    }

    // Call the backend classification API
    const response = await fetch(`${API_BASE_URL}/documents/classify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        filename: file.name,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[DocumentExtraction] Classification API error:', errorData);
      return {
        documentType: 'unknown',
        confidence: 0.3,
        processingTimeMs: Date.now() - startTime,
      };
    }

    const data = await response.json();
    
    if (!data.success) {
      console.error('[DocumentExtraction] Classification failed:', data.error);
      return {
        documentType: 'unknown',
        confidence: 0.3,
        processingTimeMs: Date.now() - startTime,
      };
    }

    return {
      documentType: data.documentType as DocumentType,
      confidence: data.confidence,
      alternativeTypes: data.alternatives,
      processingTimeMs: Date.now() - startTime,
      reasoning: data.reasoning,
      keyIndicators: data.keyIndicators,
    };
    
  } catch (error) {
    console.error('[DocumentExtraction] Classification error:', error);
    return {
      documentType: 'unknown',
      confidence: 0.3,
      processingTimeMs: Date.now() - startTime,
    };
  }
}

/**
 * Classify and extract data from a document in one operation
 * This is the main function for the unified document intake flow
 */
export async function classifyAndExtract(
  file: File,
  onClassified?: (result: ClassificationResult) => void
): Promise<{
  classification: ClassificationResult;
  extraction: ExtractionResult;
}> {
  // First, classify the document
  const classification = await classifyDocument(file);
  
  // Notify caller of classification result
  if (onClassified) {
    onClassified(classification);
  }
  
  // Then extract data based on classified type
  const extraction = await extractDocumentData(file, classification.documentType);
  
  return { classification, extraction };
}

/**
 * Process multiple documents with progressive updates
 * Calls onProgress for each document as it's processed
 */
export async function processDocumentBatch(
  files: File[],
  onProgress: (fileIndex: number, stage: 'classifying' | 'extracting' | 'complete', result?: {
    classification?: ClassificationResult;
    extraction?: ExtractionResult;
  }) => void
): Promise<Array<{
  file: File;
  classification: ClassificationResult;
  extraction: ExtractionResult;
}>> {
  const results: Array<{
    file: File;
    classification: ClassificationResult;
    extraction: ExtractionResult;
  }> = [];
  
  // Process files sequentially to avoid overwhelming the API
  for (let index = 0; index < files.length; index++) {
    const file = files[index];
    
    // Notify: classifying
    onProgress(index, 'classifying');
    
    const classification = await classifyDocument(file);
    onProgress(index, 'extracting', { classification });
    
    const extraction = await extractDocumentData(file, classification.documentType);
    onProgress(index, 'complete', { classification, extraction });
    
    results.push({ file, classification, extraction });
  }
  
  return results;
}
