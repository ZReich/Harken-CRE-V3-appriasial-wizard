import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWizard } from '../context/WizardContext';
import WizardLayout from '../components/WizardLayout';
import WizardGuidancePanel from '../components/WizardGuidancePanel';
import { DOCUMENTS_GUIDANCE, type SectionGuidance } from '../constants/wizardPhaseGuidance';
import {
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  X,
  Loader2,
  Sparkles,
  ChevronRight,
  Edit2,
  Check,
  RefreshCw,
} from 'lucide-react';

// ==========================================
// TYPES
// ==========================================
interface UploadedDocument {
  id: string;
  name: string;
  size: number;
  type: string;
  file: File;
  status: 'pending' | 'processing' | 'extracted' | 'error';
  extractedData?: ExtractedFields;
  error?: string;
}

interface ExtractedFields {
  [key: string]: {
    value: string;
    confidence: number;
    edited?: boolean;
  };
}

interface DocumentSlot {
  id: string;
  label: string;
  description: string;
  extractFields: string[];
  accepts: string;
  icon: 'cadastral' | 'engagement' | 'sale' | 'lease' | 'rentroll';
}

// ==========================================
// DOCUMENT SLOTS CONFIGURATION
// ==========================================
const documentSlots: DocumentSlot[] = [
  {
    id: 'cadastral',
    label: 'Cadastral / County Records',
    description: 'Property address, legal description, tax ID, owner, land area',
    extractFields: ['propertyAddress', 'legalDescription', 'taxId', 'owner', 'landArea'],
    accepts: '.pdf,.jpg,.jpeg,.png',
    icon: 'cadastral',
  },
  {
    id: 'engagement',
    label: 'Engagement Letter',
    description: 'Client name, fee, property address, appraisal purpose',
    extractFields: ['clientName', 'fee', 'appraisalPurpose', 'effectiveDate'],
    accepts: '.pdf,.doc,.docx',
    icon: 'engagement',
  },
  {
    id: 'sale',
    label: 'Buy/Sale Agreement',
    description: 'Sale price, sale date, buyer/seller, terms',
    extractFields: ['salePrice', 'saleDate', 'buyer', 'seller', 'terms'],
    accepts: '.pdf,.doc,.docx',
    icon: 'sale',
  },
  {
    id: 'lease',
    label: 'Lease Agreements',
    description: 'Tenant info, rent amounts, lease terms',
    extractFields: ['tenantName', 'rentAmount', 'leaseStart', 'leaseEnd', 'terms'],
    accepts: '.pdf,.doc,.docx',
    icon: 'lease',
  },
  {
    id: 'rentroll',
    label: 'Rent Roll',
    description: 'Unit mix, occupancy, rental income',
    extractFields: ['units', 'occupancyRate', 'grossIncome', 'netIncome'],
    accepts: '.pdf,.xlsx,.csv',
    icon: 'rentroll',
  },
];

// ==========================================
// MOCK AI EXTRACTION (simulates backend)
// ==========================================
const mockExtractData = (slotId: string): ExtractedFields => {
  const mockData: Record<string, ExtractedFields> = {
    cadastral: {
      propertyAddress: { value: '1234 Industrial Blvd, Billings, MT 59101', confidence: 0.95 },
      legalDescription: { value: 'Lot 12, Block 4, CANYON CREEK INDUSTRIAL PARK, according to the plat thereof on file in the office of the Clerk and Recorder of Yellowstone County, Montana', confidence: 0.88 },
      taxId: { value: '123-45-678-00', confidence: 0.97 },
      owner: { value: 'ABC Industrial Holdings LLC', confidence: 0.92 },
      landArea: { value: '2.45 acres (106,722 SF)', confidence: 0.94 },
    },
    engagement: {
      clientName: { value: 'First National Bank of Montana', confidence: 0.96 },
      fee: { value: '$4,500', confidence: 0.89 },
      appraisalPurpose: { value: 'Market Value for Loan Collateral', confidence: 0.91 },
      effectiveDate: { value: '2024-12-15', confidence: 0.94 },
    },
    sale: {
      salePrice: { value: '$2,150,000', confidence: 0.97 },
      saleDate: { value: '2024-06-15', confidence: 0.95 },
      buyer: { value: 'ABC Industrial Holdings LLC', confidence: 0.93 },
      seller: { value: 'Montana Properties Inc', confidence: 0.91 },
      terms: { value: 'Cash to Seller, conventional financing', confidence: 0.85 },
    },
    lease: {
      tenantName: { value: 'Acme Manufacturing Co.', confidence: 0.94 },
      rentAmount: { value: '$8,500/month NNN', confidence: 0.92 },
      leaseStart: { value: '2023-01-01', confidence: 0.96 },
      leaseEnd: { value: '2028-12-31', confidence: 0.96 },
      terms: { value: '5-year term, 3% annual escalations', confidence: 0.88 },
    },
    rentroll: {
      units: { value: '12 units (10 office, 2 warehouse)', confidence: 0.91 },
      occupancyRate: { value: '92%', confidence: 0.94 },
      grossIncome: { value: '$245,000/year', confidence: 0.89 },
      netIncome: { value: '$198,500/year', confidence: 0.87 },
    },
  };
  return mockData[slotId] || {};
};

// ==========================================
// MAIN COMPONENT
// ==========================================
export default function DocumentIntakePage() {
  const navigate = useNavigate();
  const { dispatch, setSubjectData } = useWizard();
  const [documents, setDocuments] = useState<Record<string, UploadedDocument[]>>({});
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<{ slotId: string; docId: string; field: string } | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleFileDrop = useCallback((e: React.DragEvent<HTMLDivElement>, slotId: string) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    addFiles(files, slotId);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>, slotId: string) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      addFiles(files, slotId);
    }
  }, []);

  const addFiles = async (files: File[], slotId: string) => {
    const newDocs: UploadedDocument[] = files.map(file => ({
      id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      size: file.size,
      type: file.type,
      file,
      status: 'pending',
    }));

    setDocuments(prev => ({
      ...prev,
      [slotId]: [...(prev[slotId] || []), ...newDocs],
    }));

    // Process each file
    for (const doc of newDocs) {
      await processDocument(slotId, doc.id);
    }
  };

  const processDocument = async (slotId: string, docId: string) => {
    // Set to processing
    setDocuments(prev => ({
      ...prev,
      [slotId]: prev[slotId].map(d =>
        d.id === docId ? { ...d, status: 'processing' } : d
      ),
    }));

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));

    // Get mock extracted data
    const extractedData = mockExtractData(slotId);

    // Update with extracted data
    setDocuments(prev => ({
      ...prev,
      [slotId]: prev[slotId].map(d =>
        d.id === docId ? { ...d, status: 'extracted', extractedData } : d
      ),
    }));
  };

  const removeDocument = (slotId: string, docId: string) => {
    setDocuments(prev => ({
      ...prev,
      [slotId]: prev[slotId].filter(d => d.id !== docId),
    }));
  };

  const reprocessDocument = async (slotId: string, docId: string) => {
    await processDocument(slotId, docId);
  };

  const startEdit = (slotId: string, docId: string, field: string, currentValue: string) => {
    setEditingField({ slotId, docId, field });
    setEditValue(currentValue);
  };

  const saveEdit = () => {
    if (!editingField) return;
    const { slotId, docId, field } = editingField;

    setDocuments(prev => ({
      ...prev,
      [slotId]: prev[slotId].map(d => {
        if (d.id !== docId || !d.extractedData) return d;
        return {
          ...d,
          extractedData: {
            ...d.extractedData,
            [field]: { ...d.extractedData[field], value: editValue, edited: true },
          },
        };
      }),
    }));

    setEditingField(null);
    setEditValue('');
  };

  const acceptAllFromDocument = (slotId: string, docId: string) => {
    // Mark document as accepted - in real implementation, this would save to context
    const doc = documents[slotId]?.find(d => d.id === docId);
    if (doc?.extractedData) {
      // Store extracted data in wizard context
      dispatch({
        type: 'SET_EXTRACTED_DATA',
        payload: { slotId, data: doc.extractedData },
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-600 bg-green-50';
    if (confidence >= 0.7) return 'text-amber-600 bg-amber-50';
    return 'text-red-600 bg-red-50';
  };

  const getFieldLabel = (field: string) => {
    const labels: Record<string, string> = {
      propertyAddress: 'Property Address',
      legalDescription: 'Legal Description',
      taxId: 'Tax ID / Parcel #',
      owner: 'Property Owner',
      landArea: 'Land Area',
      clientName: 'Client Name',
      fee: 'Appraisal Fee',
      appraisalPurpose: 'Appraisal Purpose',
      effectiveDate: 'Effective Date',
      salePrice: 'Sale Price',
      saleDate: 'Sale Date',
      buyer: 'Buyer',
      seller: 'Seller',
      terms: 'Terms',
      tenantName: 'Tenant Name',
      rentAmount: 'Rent Amount',
      leaseStart: 'Lease Start',
      leaseEnd: 'Lease End',
      units: 'Unit Mix',
      occupancyRate: 'Occupancy Rate',
      grossIncome: 'Gross Income',
      netIncome: 'Net Income',
    };
    return labels[field] || field;
  };

  const totalDocsUploaded = Object.values(documents).flat().length;
  const totalExtracted = Object.values(documents).flat().filter(d => d.status === 'extracted').length;

  const handleContinue = () => {
    // Save all extracted data to context/storage
    const allExtractedData: Record<string, ExtractedFields> = {};
    Object.entries(documents).forEach(([slotId, docs]) => {
      docs.forEach(doc => {
        if (doc.extractedData) {
          allExtractedData[slotId] = { ...allExtractedData[slotId], ...doc.extractedData };
        }
      });
    });
    sessionStorage.setItem('harken_extracted_data', JSON.stringify(allExtractedData));
    
    // Also update centralized subjectData in WizardContext
    const subjectDataUpdates: Record<string, string> = {};
    
    // Extract from cadastral data
    if (allExtractedData.cadastral) {
      const cad = allExtractedData.cadastral;
      if (cad.taxId?.value) subjectDataUpdates.taxId = cad.taxId.value;
      if (cad.legalDescription?.value) subjectDataUpdates.legalDescription = cad.legalDescription.value;
      if (cad.propertyAddress?.value) {
        // Parse address if it's a full string
        const addr = cad.propertyAddress.value;
        // Try to parse "Street, City, State ZIP" format
        const parts = addr.split(',').map(s => s.trim());
        if (parts.length >= 2) {
          const street = parts[0];
          const cityStateZip = parts.slice(1).join(', ');
          // Try to parse "City, State ZIP"
          const stateZipMatch = cityStateZip.match(/^(.+?),?\s*([A-Z]{2})\s*(\d{5})?/i);
          if (stateZipMatch) {
            setSubjectData({
              address: {
                street,
                city: stateZipMatch[1].trim(),
                state: stateZipMatch[2].toUpperCase(),
                zip: stateZipMatch[3] || '',
                county: '',
              }
            });
          }
        }
      }
    }
    
    // Extract from sale data
    if (allExtractedData.sale) {
      const sale = allExtractedData.sale;
      if (sale.saleDate?.value) subjectDataUpdates.lastSaleDate = sale.saleDate.value;
      if (sale.salePrice?.value) subjectDataUpdates.lastSalePrice = sale.salePrice.value;
    }
    
    // Apply updates to subjectData
    if (Object.keys(subjectDataUpdates).length > 0) {
      setSubjectData(subjectDataUpdates as any);
    }
    
    navigate('/setup');
  };

  // Sidebar content
  const sidebar = (
    <div>
      <h2 className="text-lg font-bold text-gray-900 mb-1">Document Intake</h2>
      <p className="text-sm text-gray-500 mb-6">Upload documents for AI extraction</p>
      <nav className="space-y-1">
        {documentSlots.map((slot) => {
          const slotDocs = documents[slot.id] || [];
          const hasExtracted = slotDocs.some(d => d.status === 'extracted');
          const isProcessing = slotDocs.some(d => d.status === 'processing');

          return (
            <button
              key={slot.id}
              onClick={() => setSelectedSlot(slot.id)}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm flex items-center justify-between transition-colors ${
                selectedSlot === slot.id
                  ? 'bg-[#0da1c7]/10 text-[#0da1c7] font-medium'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                {slot.label}
              </span>
              {isProcessing && <Loader2 className="w-4 h-4 animate-spin text-[#0da1c7]" />}
              {hasExtracted && !isProcessing && <CheckCircle className="w-4 h-4 text-green-500" />}
              {slotDocs.length > 0 && !hasExtracted && !isProcessing && (
                <span className="text-xs bg-gray-200 px-1.5 py-0.5 rounded">{slotDocs.length}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Summary */}
      {totalDocsUploaded > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            <div className="flex justify-between mb-1">
              <span>Documents uploaded:</span>
              <span className="font-medium">{totalDocsUploaded}</span>
            </div>
            <div className="flex justify-between">
              <span>Fields extracted:</span>
              <span className="font-medium text-green-600">{totalExtracted}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Get current guidance based on selected slot
  const currentGuidance = useMemo((): SectionGuidance | null => {
    if (!selectedSlot) {
      return DOCUMENTS_GUIDANCE.overview;
    }
    // Map slot IDs to guidance keys
    const slotToGuidanceKey: Record<string, string> = {
      cadastral: 'cadastral',
      engagement: 'engagement',
      sale: 'sale',
      lease: 'lease',
      rentroll: 'rentroll',
    };
    const guidanceKey = slotToGuidanceKey[selectedSlot];
    return guidanceKey ? DOCUMENTS_GUIDANCE[guidanceKey] : DOCUMENTS_GUIDANCE.overview;
  }, [selectedSlot]);

  // Help sidebar with dynamic guidance panel
  const helpSidebarGuidance = (
    <WizardGuidancePanel 
      guidance={currentGuidance}
      themeColor="#0da1c7"
    />
  );

  return (
    <WizardLayout
      title="Document Intake"
      subtitle="Phase 2 of 6 • AI-Powered Data Extraction"
      phase={2}
      sidebar={sidebar}
      helpSidebarGuidance={helpSidebarGuidance}
    >
      <div className="animate-fade-in">
        {/* Main upload area or selected slot details */}
        {!selectedSlot ? (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-[#0da1c7]/10 to-[#4db8d1]/10 border border-[#0da1c7]/20 rounded-xl p-6 mb-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#0da1c7] flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-[#1c3643] mb-1">AI-Powered Document Intake</h3>
                  <p className="text-sm text-gray-600">
                    Upload your source documents and let AI extract property details, client information, 
                    and financial data. This will pre-populate fields throughout the wizard.
                  </p>
                </div>
              </div>
            </div>

            {/* All document slots */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {documentSlots.map((slot) => {
                const slotDocs = documents[slot.id] || [];
                const hasExtracted = slotDocs.some(d => d.status === 'extracted');

                return (
                  <div
                    key={slot.id}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handleFileDrop(e, slot.id)}
                    onClick={() => setSelectedSlot(slot.id)}
                    className={`border-2 border-dashed rounded-xl p-5 cursor-pointer transition-all ${
                      hasExtracted
                        ? 'border-green-300 bg-green-50'
                        : 'border-gray-300 hover:border-[#0da1c7] hover:bg-[#0da1c7]/5'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {hasExtracted ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <Upload className="w-5 h-5 text-gray-400" />
                        )}
                        <span className="font-medium text-gray-700">{slot.label}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                    <p className="text-xs text-gray-500 mb-2">{slot.description}</p>
                    {slotDocs.length > 0 && (
                      <div className="text-xs text-[#0da1c7] font-medium">
                        {slotDocs.length} file(s) uploaded
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Selected slot detail view */
          <div>
            <button
              onClick={() => setSelectedSlot(null)}
              className="text-sm text-[#0da1c7] hover:text-[#0b8fb0] mb-4 flex items-center gap-1"
            >
              ← Back to all documents
            </button>

            {(() => {
              const slot = documentSlots.find(s => s.id === selectedSlot)!;
              const slotDocs = documents[selectedSlot] || [];

              return (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-[#1c3643]">{slot.label}</h3>
                      <p className="text-sm text-gray-500">{slot.description}</p>
                    </div>
                  </div>

                  {/* Upload zone */}
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handleFileDrop(e, selectedSlot)}
                    className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-[#0da1c7] hover:bg-[#0da1c7]/5 transition-all mb-6"
                  >
                    <input
                      type="file"
                      id={`upload-${selectedSlot}`}
                      multiple
                      accept={slot.accepts}
                      className="hidden"
                      onChange={(e) => handleFileSelect(e, selectedSlot)}
                    />
                    <label htmlFor={`upload-${selectedSlot}`} className="cursor-pointer">
                      <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                      <p className="font-medium text-gray-700">Drop files here or click to upload</p>
                      <p className="text-xs text-gray-500 mt-1">Accepts: {slot.accepts}</p>
                    </label>
                  </div>

                  {/* Uploaded documents with extracted data */}
                  {slotDocs.map((doc) => (
                    <div key={doc.id} className="bg-white border border-gray-200 rounded-xl p-4 mb-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <FileText className="w-8 h-8 text-gray-400" />
                          <div>
                            <p className="font-medium text-gray-800">{doc.name}</p>
                            <p className="text-xs text-gray-500">{formatFileSize(doc.size)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {doc.status === 'processing' && (
                            <span className="flex items-center gap-1 text-sm text-[#0da1c7]">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Extracting...
                            </span>
                          )}
                          {doc.status === 'extracted' && (
                            <span className="flex items-center gap-1 text-sm text-green-600">
                              <CheckCircle className="w-4 h-4" />
                              Extracted
                            </span>
                          )}
                          {doc.status === 'error' && (
                            <span className="flex items-center gap-1 text-sm text-red-600">
                              <AlertCircle className="w-4 h-4" />
                              Error
                            </span>
                          )}
                          <button
                            onClick={() => reprocessDocument(selectedSlot, doc.id)}
                            className="p-1 text-gray-400 hover:text-[#0da1c7]"
                            title="Reprocess"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => removeDocument(selectedSlot, doc.id)}
                            className="p-1 text-gray-400 hover:text-red-500"
                            title="Remove"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Extracted fields */}
                      {doc.status === 'extracted' && doc.extractedData && (
                        <div className="border-t border-gray-100 pt-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-gray-500 uppercase">Extracted Fields</span>
                            <button
                              onClick={() => acceptAllFromDocument(selectedSlot, doc.id)}
                              className="text-xs text-[#0da1c7] hover:text-[#0b8fb0] font-medium flex items-center gap-1"
                            >
                              <Check className="w-3 h-3" />
                              Accept All
                            </button>
                          </div>
                          <div className="space-y-2">
                            {Object.entries(doc.extractedData).map(([field, data]) => (
                              <div
                                key={field}
                                className="flex items-start justify-between p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                              >
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-0.5">
                                    <span className="text-xs font-medium text-gray-600">{getFieldLabel(field)}</span>
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${getConfidenceColor(data.confidence)}`}>
                                      {Math.round(data.confidence * 100)}%
                                    </span>
                                    {data.edited && (
                                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-600">
                                        Edited
                                      </span>
                                    )}
                                  </div>
                                  {editingField?.slotId === selectedSlot &&
                                   editingField?.docId === doc.id &&
                                   editingField?.field === field ? (
                                    <div className="flex items-center gap-2">
                                      <input
                                        type="text"
                                        value={editValue}
                                        onChange={(e) => setEditValue(e.target.value)}
                                        className="flex-1 text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-[#0da1c7] focus:border-transparent"
                                        autoFocus
                                      />
                                      <button
                                        onClick={saveEdit}
                                        className="p-1 text-green-600 hover:text-green-700"
                                      >
                                        <Check className="w-4 h-4" />
                                      </button>
                                      <button
                                        onClick={() => setEditingField(null)}
                                        className="p-1 text-gray-400 hover:text-gray-600"
                                      >
                                        <X className="w-4 h-4" />
                                      </button>
                                    </div>
                                  ) : (
                                    <p className="text-sm text-gray-800 truncate">{data.value}</p>
                                  )}
                                </div>
                                {!editingField && (
                                  <button
                                    onClick={() => startEdit(selectedSlot, doc.id, field, data.value)}
                                    className="p-1 text-gray-400 hover:text-[#0da1c7] ml-2"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {slotDocs.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="w-12 h-12 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">No documents uploaded yet</p>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}

        {/* Continue button */}
        <div className="mt-8 pt-6 border-t border-gray-200 flex justify-between items-center">
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            ← Back to Templates
          </button>
          <button
            onClick={handleContinue}
            className="px-6 py-2.5 bg-[#0da1c7] text-white rounded-lg font-medium hover:bg-[#0b8fb0] flex items-center gap-2"
          >
            Continue to Setup
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </WizardLayout>
  );
}

