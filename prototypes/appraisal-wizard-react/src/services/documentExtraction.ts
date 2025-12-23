/**
 * Document Extraction Service
 * 
 * This service handles document upload, AI-powered classification, and data extraction.
 * Currently uses mock data, but is structured to connect to a real backend API.
 * 
 * Backend API Requirements:
 * - POST /api/documents/classify - AI document classification
 * - POST /api/documents/extract - AI data extraction
 * - Accepts: multipart/form-data with file
 * - Returns: JSON with document type, extracted fields, and confidence scores
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
    icon: '🏛️',
    color: 'blue',
    extractFields: ['propertyAddress', 'legalDescription', 'taxId', 'owner', 'landArea'],
  },
  engagement: {
    id: 'engagement',
    label: 'Engagement Letter',
    description: 'Client name, fee, appraisal purpose, effective date',
    icon: '📋',
    color: 'purple',
    extractFields: ['clientName', 'fee', 'appraisalPurpose', 'effectiveDate'],
  },
  sale: {
    id: 'sale',
    label: 'Buy/Sale Agreement',
    description: 'Sale price, sale date, buyer/seller, terms',
    icon: '🤝',
    color: 'green',
    extractFields: ['salePrice', 'saleDate', 'buyer', 'seller', 'terms'],
  },
  lease: {
    id: 'lease',
    label: 'Lease Agreement',
    description: 'Tenant info, rent amounts, lease terms',
    icon: '📄',
    color: 'orange',
    extractFields: ['tenantName', 'rentAmount', 'leaseStart', 'leaseEnd', 'terms'],
  },
  rentroll: {
    id: 'rentroll',
    label: 'Rent Roll',
    description: 'Unit mix, occupancy, rental income',
    icon: '📊',
    color: 'teal',
    extractFields: ['units', 'occupancyRate', 'grossIncome', 'netIncome'],
  },
  survey: {
    id: 'survey',
    label: 'Survey / Plat Map',
    description: 'Property boundaries, easements, dimensions',
    icon: '🗺️',
    color: 'indigo',
    extractFields: ['landArea', 'boundaries', 'easements'],
  },
  tax_return: {
    id: 'tax_return',
    label: 'Tax Return',
    description: 'Income, expenses, depreciation schedules',
    icon: '📑',
    color: 'red',
    extractFields: ['grossIncome', 'expenses', 'netIncome'],
  },
  financial_statement: {
    id: 'financial_statement',
    label: 'Financial Statement',
    description: 'Operating income, expenses, NOI',
    icon: '💰',
    color: 'emerald',
    extractFields: ['grossIncome', 'expenses', 'netIncome', 'noi'],
  },
  unknown: {
    id: 'unknown',
    label: 'Unknown Document',
    description: 'Document type could not be determined',
    icon: '❓',
    color: 'gray',
    extractFields: [],
  },
};

// ==========================================
// CLASSIFICATION TYPES
// ==========================================
export interface ClassificationResult {
  documentType: DocumentType;
  confidence: number;
  alternativeTypes?: { type: DocumentType; confidence: number }[];
  processingTimeMs: number;
}

// ==========================================
// EXTRACTION TYPES
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

// ==========================================
// AI DOCUMENT CLASSIFICATION
// ==========================================

/**
 * Keywords that suggest document types based on filename
 */
const classificationKeywords: Record<DocumentType, string[]> = {
  cadastral: ['cadastral', 'county', 'record', 'parcel', 'assessor', 'property card', 'tax card'],
  engagement: ['engagement', 'letter', 'proposal', 'agreement', 'contract', 'loi'],
  sale: ['sale', 'purchase', 'buy', 'sell', 'psa', 'agreement', 'contract of sale'],
  lease: ['lease', 'rental agreement', 'tenant', 'sublease', 'amendment'],
  rentroll: ['rent roll', 'rentroll', 'rent_roll', 'unit mix', 'occupancy', 'tenant list'],
  survey: ['survey', 'plat', 'boundary', 'alta', 'topographic'],
  tax_return: ['tax return', 'schedule e', '1040', '1065', '1120', 'k-1'],
  financial_statement: ['financial', 'income statement', 'p&l', 'profit', 'operating statement', 'proforma'],
  unknown: [],
};

/**
 * Classify a document using AI (simulated with filename analysis)
 * In production, this would call an AI/ML backend
 */
export async function classifyDocument(file: File): Promise<ClassificationResult> {
  const startTime = Date.now();
  
  // Simulate API processing time
  await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 700));
  
  const filename = file.name.toLowerCase();
  const scores: { type: DocumentType; score: number }[] = [];
  
  // Score based on filename keywords
  for (const [docType, keywords] of Object.entries(classificationKeywords)) {
    if (docType === 'unknown') continue;
    
    let score = 0;
    for (const keyword of keywords) {
      if (filename.includes(keyword.toLowerCase().replace(/ /g, ''))) {
        score += 0.4;
      }
      if (filename.includes(keyword.toLowerCase().replace(/ /g, '_'))) {
        score += 0.4;
      }
      if (filename.includes(keyword.toLowerCase().replace(/ /g, '-'))) {
        score += 0.4;
      }
    }
    
    // Boost based on file extension
    if (docType === 'rentroll' && (filename.endsWith('.xlsx') || filename.endsWith('.csv'))) {
      score += 0.3;
    }
    if ((docType === 'cadastral' || docType === 'survey') && 
        (filename.endsWith('.jpg') || filename.endsWith('.png') || filename.endsWith('.pdf'))) {
      score += 0.1;
    }
    
    if (score > 0) {
      scores.push({ type: docType as DocumentType, score: Math.min(score, 0.98) });
    }
  }
  
  // Sort by score descending
  scores.sort((a, b) => b.score - a.score);
  
  // If no matches, use random assignment for demo (simulating AI classification)
  if (scores.length === 0) {
    const types: DocumentType[] = ['cadastral', 'engagement', 'sale', 'lease', 'rentroll'];
    const randomType = types[Math.floor(Math.random() * types.length)];
    const randomConfidence = 0.75 + Math.random() * 0.20; // 75-95%
    
    return {
      documentType: randomType,
      confidence: randomConfidence,
      alternativeTypes: types
        .filter(t => t !== randomType)
        .slice(0, 2)
        .map(t => ({ type: t, confidence: 0.3 + Math.random() * 0.3 })),
      processingTimeMs: Date.now() - startTime,
    };
  }
  
  const topMatch = scores[0];
  
  return {
    documentType: topMatch.type,
    confidence: topMatch.score,
    alternativeTypes: scores.slice(1, 3).map(s => ({ type: s.type, confidence: s.score })),
    processingTimeMs: Date.now() - startTime,
  };
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
  
  // Process files in parallel but stagger the starts for visual effect
  const promises = files.map(async (file, index) => {
    // Stagger start by 300ms per file
    await new Promise(resolve => setTimeout(resolve, index * 300));
    
    // Notify: classifying
    onProgress(index, 'classifying');
    
    const classification = await classifyDocument(file);
    onProgress(index, 'extracting', { classification });
    
    const extraction = await extractDocumentData(file, classification.documentType);
    onProgress(index, 'complete', { classification, extraction });
    
    return { file, classification, extraction };
  });
  
  const allResults = await Promise.all(promises);
  results.push(...allResults);
  
  return results;
}



