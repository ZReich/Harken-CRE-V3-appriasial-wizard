/**
 * Document Extraction Service
 * 
 * This service handles document upload and AI-powered data extraction.
 * Currently uses mock data, but is structured to connect to a real backend API.
 * 
 * Backend API Requirements:
 * - POST /api/documents/extract
 * - Accepts: multipart/form-data with file and documentType
 * - Returns: JSON with extracted fields and confidence scores
 */

// ==========================================
// TYPES
// ==========================================
export interface ExtractedField {
  value: string;
  confidence: number;
  edited?: boolean;
  source?: string; // Which document this came from
}

export interface ExtractedData {
  [key: string]: ExtractedField;
}

export interface ExtractionResult {
  success: boolean;
  data?: ExtractedData;
  error?: string;
  processingTimeMs?: number;
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
}

export interface EngagementExtraction {
  clientName: ExtractedField;
  fee: ExtractedField;
  appraisalPurpose: ExtractedField;
  effectiveDate: ExtractedField;
  clientAddress?: ExtractedField;
  propertyAddress?: ExtractedField;
  intendedUse?: ExtractedField;
}

export interface SaleAgreementExtraction {
  salePrice: ExtractedField;
  saleDate: ExtractedField;
  buyer: ExtractedField;
  seller: ExtractedField;
  terms: ExtractedField;
  earnestMoney?: ExtractedField;
  closingDate?: ExtractedField;
}

export interface LeaseExtraction {
  tenantName: ExtractedField;
  rentAmount: ExtractedField;
  leaseStart: ExtractedField;
  leaseEnd: ExtractedField;
  terms: ExtractedField;
  escalations?: ExtractedField;
  options?: ExtractedField;
}

export interface RentRollExtraction {
  units: ExtractedField;
  occupancyRate: ExtractedField;
  grossIncome: ExtractedField;
  netIncome: ExtractedField;
  averageRent?: ExtractedField;
  vacancies?: ExtractedField;
}

// ==========================================
// API CONFIGURATION
// ==========================================
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA !== 'false';

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
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentType);

    const response = await fetch(`${API_BASE_URL}/documents/extract`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.message || `Server error: ${response.status}`,
        processingTimeMs: Date.now() - startTime,
      };
    }

    const data = await response.json();
    return {
      success: true,
      data: data.extractedFields,
      processingTimeMs: Date.now() - startTime,
    };
  } catch (error) {
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
    clientName: 'Client Name',
    clientAddress: 'Client Address',
    fee: 'Appraisal Fee',
    appraisalPurpose: 'Appraisal Purpose',
    effectiveDate: 'Effective Date',
    intendedUse: 'Intended Use',
    salePrice: 'Sale Price',
    saleDate: 'Sale Date',
    buyer: 'Buyer',
    seller: 'Seller',
    terms: 'Terms',
    earnestMoney: 'Earnest Money',
    closingDate: 'Closing Date',
    tenantName: 'Tenant Name',
    rentAmount: 'Rent Amount',
    leaseStart: 'Lease Start',
    leaseEnd: 'Lease End',
    escalations: 'Escalations',
    options: 'Options',
    units: 'Unit Mix',
    occupancyRate: 'Occupancy Rate',
    grossIncome: 'Gross Income',
    netIncome: 'Net Income',
    averageRent: 'Average Rent',
    vacancies: 'Vacancies',
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

