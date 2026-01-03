import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWizard } from '../context/WizardContext';
import WizardLayout from '../components/WizardLayout';
import WizardGuidancePanel from '../components/WizardGuidancePanel';
import { DOCUMENTS_GUIDANCE } from '../constants/wizardPhaseGuidance';
import {
  Upload,
  CheckCircle,
  AlertCircle,
  X,
  Loader2,
  Sparkles,
  ChevronRight,
  RefreshCw,
  Eye,
  ChevronDown,
  Zap,
  Landmark,
  FileSignature,
  Handshake,
  File,
  BarChart3,
  Map,
  Receipt,
  Wallet,
  HelpCircle,
  Camera,
  FileText,
  type LucideIcon,
} from 'lucide-react';
import BulkPhotoDropZone from '../components/BulkPhotoDropZone';
import PhotoStagingTray from '../components/PhotoStagingTray';
import CoverPhotoSection from '../components/CoverPhotoSection';
import CoverPhotoPickerModal from '../components/CoverPhotoPickerModal';
import FloatingDropPanel from '../components/FloatingDropPanel';
import type { PhotoData } from '../types';

// Map icon names to Lucide components
const ICON_MAP: Record<string, LucideIcon> = {
  landmark: Landmark,
  'file-signature': FileSignature,
  handshake: Handshake,
  file: File,
  'bar-chart-3': BarChart3,
  map: Map,
  receipt: Receipt,
  wallet: Wallet,
  'help-circle': HelpCircle,
};
import {
  classifyAndExtract,
  extractDocumentData,
  DOCUMENT_TYPES,
  type DocumentType,
  type ClassificationResult,
  type ExtractionResult,
  type ExtractedData,
  getFieldLabel,
  getConfidenceColorClasses,
} from '../services/documentExtraction';
import { DOCUMENT_FIELD_MAPPINGS, type DocumentType as MappingDocumentType } from '../config/documentFieldMappings';

// ==========================================
// TYPES
// ==========================================
interface ProcessedDocument {
  id: string;
  file: File;
  status: 'uploading' | 'classifying' | 'extracting' | 'complete' | 'error';
  classification?: ClassificationResult;
  extraction?: ExtractionResult;
  error?: string;
}

// ==========================================
// DOCUMENT CARD COMPONENT
// ==========================================
function DocumentCard({
  doc,
  onRemove,
  onReprocess,
  onReclassify,
  isExpanded,
  onToggleExpand,
}: {
  doc: ProcessedDocument;
  onRemove: () => void;
  onReprocess: () => void;
  onReclassify: (newType: DocumentType) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}) {
  const [showTypeSelector, setShowTypeSelector] = useState(false);

  const typeInfo = doc.classification
    ? DOCUMENT_TYPES[doc.classification.documentType]
    : DOCUMENT_TYPES.unknown;

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getStatusContent = () => {
    switch (doc.status) {
      case 'uploading':
        return (
          <div className="flex items-center gap-2 text-gray-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Uploading...</span>
          </div>
        );
      case 'classifying':
        return (
          <div className="flex items-center gap-2 text-[#0da1c7]">
            <Sparkles className="w-4 h-4 animate-pulse" />
            <span className="text-sm">AI is analyzing document...</span>
          </div>
        );
      case 'extracting':
        return (
          <div className="flex items-center gap-2 text-[#0da1c7]">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Extracting data...</span>
          </div>
        );
      case 'complete':
        return (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm">
              {doc.extraction?.data
                ? `${Object.keys(doc.extraction.data).length} fields extracted`
                : 'Complete'}
            </span>
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{doc.error || 'Error processing'}</span>
          </div>
        );
    }
  };

  const colorMap: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-700 border-blue-200',
    purple: 'bg-purple-100 text-purple-700 border-purple-200',
    green: 'bg-green-100 text-green-700 border-green-200',
    orange: 'bg-orange-100 text-orange-700 border-orange-200',
    teal: 'bg-teal-100 text-teal-700 border-teal-200',
    indigo: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    red: 'bg-red-100 text-red-700 border-red-200',
    emerald: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    gray: 'bg-gray-100 text-gray-700 border-gray-200',
  };

  return (
    <div
      className={`bg-white dark:bg-slate-800 border rounded-xl overflow-hidden transition-all duration-300 ${doc.status === 'complete' ? 'border-green-200 dark:border-green-700 shadow-sm' :
        doc.status === 'error' ? 'border-red-200 dark:border-red-700' :
          'border-gray-200 dark:border-slate-700'
        }`}
    >
      {/* Card Header */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          {/* File Info */}
          <div className="flex items-start gap-3 min-w-0 flex-1">
            {/* Icon */}
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${doc.status === 'complete' ? 'bg-green-50 dark:bg-green-900/30' : 'bg-gray-50 dark:bg-slate-700'
              }`}>
              {doc.status === 'classifying' || doc.status === 'extracting' ? (
                <Sparkles className="w-6 h-6 text-[#0da1c7] animate-pulse" />
              ) : doc.status === 'uploading' ? (
                <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
              ) : (() => {
                const IconComponent = ICON_MAP[typeInfo.icon] || HelpCircle;
                return <IconComponent className="w-6 h-6 text-gray-600 dark:text-slate-400" />;
              })()}
            </div>

            {/* File Details */}
            <div className="min-w-0 flex-1">
              <p className="font-medium text-gray-900 dark:text-white truncate">{doc.file.name}</p>
              <p className="text-xs text-gray-500">{formatFileSize(doc.file.size)}</p>

              {/* Document Type Badge */}
              {doc.classification && doc.status !== 'classifying' && (
                <div className="mt-2 flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${colorMap[typeInfo.color] || colorMap.gray
                    }`}>
                    {typeInfo.label}
                    {doc.classification.confidence < 0.8 && (
                      <span className="text-[10px] opacity-70">
                        ({Math.round(doc.classification.confidence * 100)}%)
                      </span>
                    )}
                  </span>
                  <button
                    onClick={() => setShowTypeSelector(!showTypeSelector)}
                    className="text-xs text-gray-400 hover:text-[#0da1c7] underline"
                  >
                    Change
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Status & Actions */}
          <div className="flex items-center gap-2">
            {getStatusContent()}

            {doc.status === 'complete' && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('[DocumentIntake] View extracted data button clicked for', doc.file.name);
                    console.log('[DocumentIntake] Current isExpanded:', isExpanded);
                    onToggleExpand();
                  }}
                  className="p-1.5 text-gray-400 hover:text-[#0da1c7] hover:bg-gray-50 rounded-lg transition-colors"
                  title={isExpanded ? "Collapse" : "View extracted data"}
                >
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 rotate-180" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={onReprocess}
                  className="p-1.5 text-gray-400 hover:text-[#0da1c7] hover:bg-gray-50 rounded-lg transition-colors"
                  title="Reprocess"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </>
            )}

            <button
              onClick={onRemove}
              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="Remove"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Type Selector Dropdown */}
        {showTypeSelector && (
          <div className="mt-3 p-3 bg-gray-50 dark:bg-slate-800/50 rounded-lg border border-gray-200 dark:border-slate-700">
            <p className="text-xs font-medium text-gray-600 dark:text-slate-400 mb-2">Select correct document type:</p>
            <div className="grid grid-cols-2 gap-2">
              {Object.values(DOCUMENT_TYPES)
                .filter(t => t.id !== 'unknown')
                .map(type => (
                  <button
                    key={type.id}
                    onClick={() => {
                      onReclassify(type.id);
                      setShowTypeSelector(false);
                    }}
                    className={`text-left px-3 py-2 rounded-lg text-sm transition-colors ${doc.classification?.documentType === type.id
                      ? 'bg-[#0da1c7] text-white'
                      : 'bg-white dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 hover:border-[#0da1c7] hover:text-[#0da1c7]'
                      }`}
                  >
                    <span className="mr-2">{type.icon}</span>
                    {type.label}
                  </button>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Extracted Data Panel */}
      {isExpanded && doc.status === 'complete' && doc.extraction?.data && (
        <div className="border-t border-gray-100 dark:border-slate-700/50 bg-gray-50 dark:bg-slate-800/50 p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">Extracted Data</span>
            <span className="text-xs text-green-600 dark:text-green-400 font-medium flex items-center gap-1">
              <Zap className="w-3 h-3" />
              Ready to use
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {Object.entries(doc.extraction.data).map(([field, data]) => {
              console.log('[DocumentCard] Rendering extracted field:', field, data);
              return (
                <div
                  key={field}
                  className="bg-white dark:bg-slate-700/50 rounded-lg p-3 border border-gray-200 dark:border-slate-600"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-gray-600 dark:text-slate-400">{getFieldLabel(field)}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${getConfidenceColorClasses(data.confidence)}`}>
                      {Math.round(data.confidence * 100)}%
                    </span>
                  </div>
                  <p className="text-sm text-gray-900 dark:text-white truncate" title={data.value || ''}>{data.value || '(not extracted)'}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {isExpanded && doc.status === 'complete' && !doc.extraction?.data && (
        <div className="border-t border-gray-100 dark:border-slate-700 bg-yellow-50 dark:bg-yellow-900/20 p-4 text-center">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            No data extracted from this document. Try reprocessing or reclassifying.
          </p>
        </div>
      )}
      {(() => {
        console.log('[DocumentCard] Expanded panel check:', {
          isExpanded,
          status: doc.status,
          hasExtraction: !!doc.extraction,
          hasData: !!doc.extraction?.data,
          dataKeys: doc.extraction?.data ? Object.keys(doc.extraction.data) : []
        });
        return null;
      })()}
    </div>
  );
}

// ==========================================
// MAIN COMPONENT
// ==========================================
export default function DocumentIntakePage() {
  const navigate = useNavigate();
  const {
    setSubjectData,
    addUploadedDocument,
    state: wizardState,
    getStagingPhotos,
    removeStagingPhoto,
    assignStagingPhoto,
    getUnassignedStagingPhotos,
    setCoverPhoto,
    removeCoverPhoto,
    setReportPhotos,
    addFieldSuggestion,
  } = useWizard();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Tab state: 'documents' or 'photos'
  const [activeTab, setActiveTab] = useState<'documents' | 'photos'>('documents');

  // Drag and Drop state for photos
  const [isPhotoDragging, setIsPhotoDragging] = useState(false);
  const [draggedPhotoData, setDraggedPhotoData] = useState<{ id: string, file: File, preview: string } | null>(null);

  const [documents, setDocuments] = useState<ProcessedDocument[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [expandedDocId, setExpandedDocId] = useState<string | null>(null);

  // Photo state
  const [photos, setPhotos] = useState<Record<string, PhotoData | null>>({});
  const [showCoverPhotoPicker, setShowCoverPhotoPicker] = useState(false);

  // Default metadata values from appraiser info and inspection date
  const defaultTakenBy = useMemo(() => {
    const name = wizardState.subjectData?.inspectorName || '';
    const license = wizardState.subjectData?.inspectorLicense || '';
    return name ? (license ? `${name}, ${license}` : name) : '';
  }, [wizardState.subjectData?.inspectorName, wizardState.subjectData?.inspectorLicense]);

  const defaultTakenDate = wizardState.subjectData?.inspectionDate || '';

  // Sync photos to WizardContext when they change
  useEffect(() => {
    const assignments = Object.entries(photos)
      .filter(([_, photo]) => photo !== null)
      .map(([slotId, photo], index) => ({
        id: `photo-${slotId}-${Date.now()}`,
        photoId: slotId,
        slotId,
        url: photo!.preview,
        caption: photo!.caption,
        takenBy: photo!.takenBy || defaultTakenBy,
        takenDate: photo!.takenDate || defaultTakenDate,
        sortOrder: index,
      }));

    if (assignments.length > 0) {
      setReportPhotos({
        assignments,
        coverPhotoId: wizardState.coverPhoto?.id ?? null,
      });
    }
  }, [photos, defaultTakenBy, defaultTakenDate, setReportPhotos, wizardState.coverPhoto?.id]);

  // Get used slots (slots that already have photos)
  const usedSlots = useMemo(() => {
    const used = new Set<string>();
    Object.entries(photos).forEach(([slotId, photo]) => {
      if (photo) used.add(slotId);
    });
    return used;
  }, [photos]);

  // Handle photo upload to a slot
  const handlePhotoUpload = useCallback((slotId: string, file: File) => {
    const preview = URL.createObjectURL(file);
    setPhotos(prev => ({
      ...prev,
      [slotId]: {
        file,
        preview,
        caption: '',
        takenBy: defaultTakenBy,
        takenDate: defaultTakenDate,
      }
    }));
  }, [defaultTakenBy, defaultTakenDate]);

  // Handle assigning a staging photo
  const handleAssignStagingPhoto = (photo: { id: string; file: File }, slotId: string) => {
    handlePhotoUpload(slotId, photo.file);
    assignStagingPhoto(photo.id, slotId);
    removeStagingPhoto(photo.id);
  };

  // Handle accepting all AI suggestions
  const handleAcceptAllSuggestions = useCallback(() => {
    const unassigned = getUnassignedStagingPhotos();
    const localUsedSlots = new Set(usedSlots);
    unassigned.forEach(photo => {
      const topSuggestion = photo.suggestions?.[0];
      if (topSuggestion && !localUsedSlots.has(topSuggestion.slotId)) {
        handlePhotoUpload(topSuggestion.slotId, photo.file);
        assignStagingPhoto(photo.id, topSuggestion.slotId);
        removeStagingPhoto(photo.id);
        localUsedSlots.add(topSuggestion.slotId);
      }
    });
  }, [getUnassignedStagingPhotos, usedSlots, handlePhotoUpload, assignStagingPhoto, removeStagingPhoto]);

  // Handle photo drag start/end for the drop panel
  const handlePhotoDragStart = useCallback((photo: { id: string; file: File; preview: string }) => {
    setIsPhotoDragging(true);
    setDraggedPhotoData(photo);
  }, []);

  const handlePhotoDragEnd = useCallback(() => {
    setIsPhotoDragging(false);
    setDraggedPhotoData(null);
  }, []);

  // Handle drop to specific slot from panel
  const handlePanelDrop = useCallback((slotId: string) => {
    if (draggedPhotoData) {
      handleAssignStagingPhoto(draggedPhotoData, slotId);
      setIsPhotoDragging(false);
      setDraggedPhotoData(null);
    }
  }, [draggedPhotoData, handleAssignStagingPhoto]);

  // Handle file drop
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  }, []);

  // Handle file select
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      processFiles(files);
    }
  }, []);

  // Process uploaded files
  const processFiles = async (files: File[]) => {
    // Create initial document entries
    const newDocs: ProcessedDocument[] = files.map(file => ({
      id: `doc_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      file,
      status: 'uploading',
    }));

    setDocuments(prev => [...prev, ...newDocs]);

    // Process each file with staggered animation
    for (let i = 0; i < newDocs.length; i++) {
      const doc = newDocs[i];

      // Small delay between starting each file
      if (i > 0) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      // Update to classifying
      setDocuments(prev => prev.map(d =>
        d.id === doc.id ? { ...d, status: 'classifying' } : d
      ));

      try {
        const result = await classifyAndExtract(
          doc.file,
          (classification) => {
            // Update with classification, move to extracting
            setDocuments(prev => prev.map(d =>
              d.id === doc.id ? { ...d, status: 'extracting', classification } : d
            ));
          }
        );

        // Update with final result
        setDocuments(prev => prev.map(d =>
          d.id === doc.id ? {
            ...d,
            status: 'complete',
            classification: result.classification,
            extraction: result.extraction,
          } : d
        ));

        // Create field suggestions for user to Accept/Reject
        if (result.extraction.success && result.extraction.data) {
          console.log('[DocumentIntake] ✓ Extraction successful for', doc.file.name);
          console.log('[DocumentIntake] Extracted data:', result.extraction.data);
          console.log('[DocumentIntake] Document type:', result.classification.documentType);

          // Get field mappings for this document type
          const docType = result.classification.documentType as MappingDocumentType;
          const mappings = DOCUMENT_FIELD_MAPPINGS[docType] || DOCUMENT_FIELD_MAPPINGS.unknown;

          let suggestionsCreated = 0;
          for (const [extractedField, fieldData] of Object.entries(result.extraction.data)) {
            if (!fieldData.value) {
              console.log(`[DocumentIntake] Skipping field: ${extractedField} (no value)`);
              continue;
            }

            // Find the wizard path for this extracted field
            const mapping = mappings.find(m => m.extractedField === extractedField);
            if (!mapping) {
              console.log(`[DocumentIntake] No mapping for field: ${extractedField}`);
              continue;
            }

            // Transform value if transformer exists
            const value = mapping.transform
              ? mapping.transform(fieldData.value)
              : fieldData.value;

            // Create a pending suggestion for user to Accept/Reject
            console.log(`[DocumentIntake] Creating suggestion: ${mapping.wizardPath} = "${value}" (confidence: ${fieldData.confidence})`);
            addFieldSuggestion(mapping.wizardPath, {
              value,
              confidence: fieldData.confidence,
              source: 'document',
              sourceFilename: doc.file.name,
              sourceDocumentType: result.classification.documentType,
              status: 'pending',
              rejectedSources: [],
            });
            suggestionsCreated++;
          }

          console.log('[DocumentIntake] ✓ Created', suggestionsCreated, 'field suggestions for user review');
        } else {
          console.warn('[DocumentIntake] ⚠ Extraction failed or no data for', doc.file.name);
          if (result.extraction.error) {
            console.error('[DocumentIntake] Extraction error:', result.extraction.error);
          }
        }
      } catch (error) {
        setDocuments(prev => prev.map(d =>
          d.id === doc.id ? {
            ...d,
            status: 'error',
            error: error instanceof Error ? error.message : 'Processing failed',
          } : d
        ));
      }
    }
  };

  // Remove a document
  const removeDocument = (docId: string) => {
    setDocuments(prev => prev.filter(d => d.id !== docId));
    if (expandedDocId === docId) {
      setExpandedDocId(null);
    }
  };

  // Reprocess a document
  const reprocessDocument = async (docId: string) => {
    const doc = documents.find(d => d.id === docId);
    if (!doc) return;

    setDocuments(prev => prev.map(d =>
      d.id === docId ? { ...d, status: 'classifying', extraction: undefined } : d
    ));

    try {
      const result = await classifyAndExtract(
        doc.file,
        (classification) => {
          setDocuments(prev => prev.map(d =>
            d.id === docId ? { ...d, status: 'extracting', classification } : d
          ));
        }
      );

      setDocuments(prev => prev.map(d =>
        d.id === docId ? {
          ...d,
          status: 'complete',
          classification: result.classification,
          extraction: result.extraction,
        } : d
      ));

      // Create field suggestions for user to Accept/Reject (reprocess)
      if (result.extraction.success && result.extraction.data) {
        console.log('[DocumentIntake] Reprocess: Creating suggestions for', doc.file.name);

        const docType = result.classification.documentType as MappingDocumentType;
        const mappings = DOCUMENT_FIELD_MAPPINGS[docType] || DOCUMENT_FIELD_MAPPINGS.unknown;

        for (const [extractedField, fieldData] of Object.entries(result.extraction.data)) {
          if (!fieldData.value) continue;

          const mapping = mappings.find(m => m.extractedField === extractedField);
          if (!mapping) continue;

          const value = mapping.transform
            ? mapping.transform(fieldData.value)
            : fieldData.value;

          addFieldSuggestion(mapping.wizardPath, {
            value,
            confidence: fieldData.confidence,
            source: 'document',
            sourceFilename: doc.file.name,
            sourceDocumentType: result.classification.documentType,
            status: 'pending',
            rejectedSources: [],
          });
        }
      }
    } catch (error) {
      setDocuments(prev => prev.map(d =>
        d.id === docId ? {
          ...d,
          status: 'error',
          error: error instanceof Error ? error.message : 'Processing failed',
        } : d
      ));
    }
  };

  // Reclassify with a different type
  const reclassifyDocument = async (docId: string, newType: DocumentType) => {
    const doc = documents.find(d => d.id === docId);
    if (!doc) return;

    // Update classification and re-extract
    setDocuments(prev => prev.map(d =>
      d.id === docId ? {
        ...d,
        status: 'extracting',
        classification: {
          documentType: newType,
          confidence: 1.0, // User-specified = 100% confidence
          processingTimeMs: 0,
        },
      } : d
    ));

    // Re-run extraction with new type
    const extraction = await extractDocumentData(doc.file, newType);

    setDocuments(prev => prev.map(d =>
      d.id === docId ? { ...d, status: 'complete', extraction } : d
    ));

    // Create field suggestions for the re-extracted data
    if (extraction.success && extraction.data) {
      console.log('[DocumentIntake] Reclassify: Creating suggestions for', doc.file.name);

      const docType = newType as MappingDocumentType;
      const mappings = DOCUMENT_FIELD_MAPPINGS[docType] || DOCUMENT_FIELD_MAPPINGS.unknown;

      for (const [extractedField, fieldData] of Object.entries(extraction.data)) {
        if (!fieldData.value) continue;

        const mapping = mappings.find(m => m.extractedField === extractedField);
        if (!mapping) continue;

        const value = mapping.transform
          ? mapping.transform(fieldData.value)
          : fieldData.value;

        addFieldSuggestion(mapping.wizardPath, {
          value,
          confidence: fieldData.confidence,
          source: 'document',
          sourceFilename: doc.file.name,
          sourceDocumentType: newType,
          status: 'pending',
          rejectedSources: [],
        });
      }
    }
  };

  // Calculate stats
  const stats = useMemo(() => {
    const total = documents.length;
    const complete = documents.filter(d => d.status === 'complete').length;
    const processing = documents.filter(d =>
      d.status === 'classifying' || d.status === 'extracting' || d.status === 'uploading'
    ).length;
    const errors = documents.filter(d => d.status === 'error').length;
    const totalFields = documents
      .filter(d => d.extraction?.data)
      .reduce((sum, d) => sum + Object.keys(d.extraction!.data!).length, 0);

    return { total, complete, processing, errors, totalFields };
  }, [documents]);

  // Group documents by type for summary
  const documentsByType = useMemo(() => {
    const groups: Record<DocumentType, ProcessedDocument[]> = {} as any;
    documents
      .filter(d => d.classification && d.status === 'complete')
      .forEach(d => {
        const type = d.classification!.documentType;
        if (!groups[type]) groups[type] = [];
        groups[type].push(d);
      });
    return groups;
  }, [documents]);

  // Handle continue - save all extracted data and store documents to WizardContext
  const handleContinue = () => {
    // Merge all extracted data
    const allExtractedData: Record<string, ExtractedData> = {};
    documents.forEach(doc => {
      if (doc.classification && doc.extraction?.data) {
        const type = doc.classification.documentType;
        allExtractedData[type] = {
          ...allExtractedData[type],
          ...doc.extraction.data
        };
      }
    });

    // Save to session storage (for backward compatibility)
    sessionStorage.setItem('harken_extracted_data', JSON.stringify(allExtractedData));

    // Store each completed document to WizardContext for use in Exhibits & Docs section
    const existingDocIds = new Set(wizardState.uploadedDocuments.map(d => d.id));
    documents.forEach(doc => {
      if (doc.status === 'complete' && !existingDocIds.has(doc.id)) {
        addUploadedDocument({
          id: doc.id,
          name: doc.file.name,
          size: doc.file.size,
          type: doc.file.type,
          slotId: doc.classification?.documentType || 'unknown',
          status: 'extracted',
          extractedData: doc.extraction?.data,
          includeInReport: true,
        });
      }
    });

    // Update wizard context with extracted data
    const subjectDataUpdates: Record<string, string> = {};

    if (allExtractedData.cadastral) {
      const cad = allExtractedData.cadastral;
      if (cad.taxId?.value) subjectDataUpdates.taxId = cad.taxId.value;
      if (cad.legalDescription?.value) subjectDataUpdates.legalDescription = cad.legalDescription.value;
      if (cad.propertyAddress?.value) {
        const addr = cad.propertyAddress.value;
        const parts = addr.split(',').map((s: string) => s.trim());
        if (parts.length >= 2) {
          const street = parts[0];
          const cityStateZip = parts.slice(1).join(', ');
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

    if (allExtractedData.sale) {
      const sale = allExtractedData.sale;
      if (sale.saleDate?.value) subjectDataUpdates.lastSaleDate = sale.saleDate.value;
      if (sale.salePrice?.value) subjectDataUpdates.lastSalePrice = sale.salePrice.value;
    }

    if (Object.keys(subjectDataUpdates).length > 0) {
      setSubjectData(subjectDataUpdates as any);
    }

    navigate('/setup');
  };

  // Photo stats
  const stagingPhotos = getStagingPhotos();
  const unassignedPhotos = getUnassignedStagingPhotos();
  const assignedPhotoCount = Object.values(photos).filter(Boolean).length;

  // Sidebar
  const sidebar = (
    <div>
      <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Document & Photo Intake</h2>
      <p className="text-sm text-gray-500 mb-6">AI-powered processing</p>

      {/* Tab Navigation */}
      <div className="flex gap-1 p-1 bg-gray-100 dark:bg-slate-700 rounded-lg mb-6 w-full overflow-hidden">
        <button
          onClick={() => setActiveTab('documents')}
          className={`flex-1 flex items-center justify-center gap-1 px-1 py-1.5 rounded-md text-xs font-semibold transition-all ${activeTab === 'documents'
            ? 'bg-white dark:bg-slate-600 text-[#0da1c7] dark:text-cyan-400 shadow-sm'
            : 'text-gray-600 dark:text-slate-400 hover:text-gray-800 dark:hover:text-white'
            }`}
        >
          <FileText className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate">Documents</span>
        </button>
        <button
          onClick={() => setActiveTab('photos')}
          className={`flex-1 flex items-center justify-center gap-1 px-1 py-1.5 rounded-md text-xs font-semibold transition-all ${activeTab === 'photos'
            ? 'bg-white dark:bg-slate-600 text-[#0da1c7] dark:text-cyan-400 shadow-sm'
            : 'text-gray-600 dark:text-slate-400 hover:text-gray-800 dark:hover:text-white'
            }`}
        >
          <Camera className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate">Photos</span>
          {stagingPhotos.length > 0 && (
            <span className="ml-auto px-1.5 py-0.5 bg-[#0da1c7] text-white text-[9px] font-bold rounded-full flex-shrink-0">
              {stagingPhotos.length}
            </span>
          )}
        </button>
      </div>

      {/* Document Stats */}
      {activeTab === 'documents' && documents.length > 0 && (
        <div className="space-y-3 mb-6">
          <div className="bg-gradient-to-r from-[#0da1c7]/10 to-[#0da1c7]/5 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Documents</span>
              <span className="text-lg font-bold text-[#0da1c7]">{stats.complete}/{stats.total}</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#0da1c7] rounded-full transition-all duration-500"
                style={{ width: `${stats.total ? (stats.complete / stats.total) * 100 : 0}%` }}
              />
            </div>
          </div>

          {stats.totalFields > 0 && (
            <div className="flex items-center justify-between px-1 text-sm">
              <span className="text-gray-600 dark:text-slate-400">Fields extracted</span>
              <span className="font-semibold text-green-600">{stats.totalFields}</span>
            </div>
          )}

          {stats.processing > 0 && (
            <div className="flex items-center gap-2 text-[#0da1c7] text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Processing {stats.processing} document{stats.processing > 1 ? 's' : ''}...</span>
            </div>
          )}
        </div>
      )}

      {/* Photo Stats */}
      {activeTab === 'photos' && (
        <div className="space-y-3 mb-6">
          <div className="bg-gradient-to-r from-[#0da1c7]/10 to-[#0da1c7]/5 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-slate-400">Photos Uploaded</span>
              <span className="text-lg font-bold text-[#0da1c7]">{stagingPhotos.length + assignedPhotoCount}</span>
            </div>
            {unassignedPhotos.length > 0 && (
              <p className="text-xs text-amber-600 flex items-center gap-1 mt-2">
                <AlertCircle className="w-3 h-3" />
                {unassignedPhotos.length} awaiting assignment
              </p>
            )}
          </div>

          {wizardState.coverPhoto && (
            <div className="flex items-center gap-2 px-1 text-sm text-green-600">
              <CheckCircle className="w-4 h-4" />
              Cover photo selected
            </div>
          )}
        </div>
      )}

      {/* Document Type Summary */}
      {activeTab === 'documents' && Object.keys(documentsByType).length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Identified Documents</h3>
          {Object.entries(documentsByType).map(([type, docs]) => {
            const typeInfo = DOCUMENT_TYPES[type as DocumentType];
            const IconComponent = ICON_MAP[typeInfo.icon] || HelpCircle;
            return (
              <div
                key={type}
                className="flex items-center gap-3 p-2 rounded-lg bg-gray-50"
              >
                <IconComponent className="w-5 h-5 text-gray-600 dark:text-slate-400" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700 truncate">{typeInfo.label}</p>
                  <p className="text-xs text-gray-500">{docs.length} file{docs.length > 1 ? 's' : ''}</p>
                </div>
                <CheckCircle className="w-4 h-4 text-green-500" />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  // Guidance panel
  const helpSidebarGuidance = (
    <WizardGuidancePanel
      guidance={DOCUMENTS_GUIDANCE.overview}
      themeColor="#0da1c7"
    />
  );

  return (
    <WizardLayout
      title="Document & Photo Intake"
      subtitle="Phase 2 of 6 • AI-Powered Data Extraction"
      phase={2}
      sidebar={sidebar}
      helpSidebarGuidance={helpSidebarGuidance}
    >
      <div className="animate-fade-in">
        {activeTab === 'documents' ? (
          <>
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-[#0da1c7]/10 via-[#4db8d1]/5 to-transparent border border-[#0da1c7]/20 rounded-2xl p-6 mb-6">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#0da1c7] to-[#0b8fb0] flex items-center justify-center shadow-lg shadow-[#0da1c7]/20">
                  <Sparkles className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#1c3643] mb-1">AI-Powered Document Intake</h3>
                  <p className="text-gray-600 dark:text-slate-400">
                    Drop all your documents below. Our AI will automatically identify each document type,
                    extract relevant data, and pre-fill fields throughout the wizard.
                  </p>
                </div>
              </div>
            </div>

            {/* Unified Drop Zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 mb-6 ${isDragging
                ? 'border-[#0da1c7] bg-[#0da1c7]/10 scale-[1.02]'
                : 'border-gray-300 hover:border-[#0da1c7] hover:bg-[#0da1c7]/5'
                }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xlsx,.csv"
                className="hidden"
                onChange={handleFileSelect}
              />

              <div className={`transition-transform duration-300 ${isDragging ? 'scale-110' : ''}`}>
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center">
                  <Upload className={`w-8 h-8 transition-colors ${isDragging ? 'text-[#0da1c7]' : 'text-gray-400'}`} />
                </div>
                <p className="text-lg font-semibold text-gray-700 mb-1">
                  {isDragging ? 'Drop files here' : 'Drop all your documents here'}
                </p>
                <p className="text-sm text-gray-500 mb-3">
                  or click to browse
                </p>
                <p className="text-xs text-gray-400">
                  Supports PDF, images, Word docs, Excel, and CSV files
                </p>
              </div>

              {/* Animated border when dragging */}
              {isDragging && (
                <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                  <div className="absolute inset-0 border-2 border-[#0da1c7] rounded-2xl animate-pulse" />
                </div>
              )}
            </div>

            {/* Document Cards */}
            {documents.length > 0 && (
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-700">
                    Uploaded Documents ({documents.length})
                  </h3>
                  {stats.complete === stats.total && stats.total > 0 && (
                    <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      All documents processed
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  {documents.map(doc => (
                    <DocumentCard
                      key={doc.id}
                      doc={doc}
                      onRemove={() => removeDocument(doc.id)}
                      onReprocess={() => reprocessDocument(doc.id)}
                      onReclassify={(newType) => reclassifyDocument(doc.id, newType)}
                      isExpanded={expandedDocId === doc.id}
                      onToggleExpand={() => {
                        console.log('[DocumentIntake] onToggleExpand called for doc:', doc.id);
                        console.log('[DocumentIntake] Current expandedDocId:', expandedDocId);
                        console.log('[DocumentIntake] Will set to:', expandedDocId === doc.id ? null : doc.id);
                        setExpandedDocId(expandedDocId === doc.id ? null : doc.id);
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Photos Tab Content */}
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-[#0da1c7]/10 via-[#4db8d1]/5 to-transparent border border-[#0da1c7]/20 rounded-2xl p-6 mb-6">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#0da1c7] to-[#0b8fb0] flex items-center justify-center shadow-lg shadow-[#0da1c7]/20">
                  <Camera className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#1c3643] dark:text-white mb-1">Upload Property Photos</h3>
                  <p className="text-gray-600 dark:text-slate-400">
                    Upload all your property photos now so they're available throughout data entry.
                    AI will suggest which slot each photo belongs to, or you can assign them manually later.
                  </p>
                </div>
              </div>
            </div>

            {/* Cover Photo Section */}
            <div className="mb-6">
              <CoverPhotoSection
                coverPhoto={wizardState.coverPhoto}
                onSetCoverPhoto={setCoverPhoto}
                onRemoveCoverPhoto={removeCoverPhoto}
                uploadedPhotos={photos}
                subjectData={wizardState.subjectData}
                onOpenPicker={() => setShowCoverPhotoPicker(true)}
              />
            </div>

            {/* Cover Photo Picker Modal */}
            <CoverPhotoPickerModal
              isOpen={showCoverPhotoPicker}
              onClose={() => setShowCoverPhotoPicker(false)}
              onSelect={setCoverPhoto}
              uploadedPhotos={photos}
            />

            {/* Bulk Upload Drop Zone */}
            <BulkPhotoDropZone className="mb-6" />

            {/* Staging Tray - Shows unassigned photos */}
            <PhotoStagingTray
              onAssignPhoto={handleAssignStagingPhoto}
              onAcceptAllSuggestions={handleAcceptAllSuggestions}
              usedSlots={usedSlots}
              className="mb-6"
              onDragStart={handlePhotoDragStart}
              onDragEnd={handlePhotoDragEnd}
            />

            {/* Info about assigning photos later */}
            {stagingPhotos.length > 0 && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-400">Photos ready for assignment</p>
                  <p className="text-sm text-amber-700 dark:text-amber-500/80 mt-1">
                    You can accept the AI suggestions above, or assign photos to specific slots
                    in the Subject Property → Photos & Maps section.
                  </p>
                </div>
              </div>
            )}
            {/* Floating Drop Panel */}
            <FloatingDropPanel
              isVisible={isPhotoDragging}
              draggedPhotoPreview={draggedPhotoData?.preview}
              usedSlots={usedSlots}
              onDropToSlot={handlePanelDrop}
            />
          </>
        )}

        {/* Continue Button */}
        <div className="mt-8 pt-6 border-t border-gray-200 flex justify-between items-center">
          <button
            onClick={() => navigate('/template')}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            ← Back to Templates
          </button>
          <button
            onClick={handleContinue}
            disabled={stats.processing > 0}
            className={`px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-all ${stats.processing > 0
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-[#0da1c7] text-white hover:bg-[#0b8fb0] shadow-lg shadow-[#0da1c7]/20 hover:shadow-xl hover:shadow-[#0da1c7]/30'
              }`}
          >
            {stats.processing > 0 ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Continue to Setup
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </WizardLayout >
  );
}
