// src/context/reducers/documentSlice.ts
// Handles all document-related actions (uploads, extraction, field sources)

import type { WizardState, WizardAction, ExtractedFieldSource } from '../../types';
import { DOCUMENT_FIELD_MAPPINGS, type DocumentType } from '../../config/documentFieldMappings';
import { getNestedValue, isFilled, setNestedValue } from '../../utils/stateHelpers';

/**
 * Handles document-related actions.
 * Returns the updated state if handled, or null if not a document action.
 */
export function handleDocumentAction(
  state: WizardState,
  action: WizardAction
): WizardState | null {
  switch (action.type) {
    case 'SET_EXTRACTED_DATA':
      return {
        ...state,
        extractedData: {
          ...state.extractedData,
          [action.payload.slotId]: {
            ...state.extractedData[action.payload.slotId],
            ...action.payload.data,
          },
        },
      };

    case 'SET_ALL_EXTRACTED_DATA':
      return { ...state, extractedData: action.payload };

    case 'ADD_UPLOADED_DOCUMENT':
      return {
        ...state,
        uploadedDocuments: [...state.uploadedDocuments, action.payload],
      };

    case 'UPDATE_UPLOADED_DOCUMENT':
      return {
        ...state,
        uploadedDocuments: state.uploadedDocuments.map(doc =>
          doc.id === action.payload.id ? { ...doc, ...action.payload.updates } : doc
        ),
      };

    case 'REMOVE_UPLOADED_DOCUMENT':
      return {
        ...state,
        uploadedDocuments: state.uploadedDocuments.filter(doc => doc.id !== action.payload),
      };

    case 'SET_DOCUMENT_FIELD_SOURCE':
      return {
        ...state,
        documentFieldSources: {
          ...state.documentFieldSources,
          [action.payload.fieldPath]: action.payload,
        },
      };

    case 'CLEAR_DOCUMENT_FIELD_SOURCES':
      return {
        ...state,
        documentFieldSources: {},
      };

    case 'APPLY_DOCUMENT_EXTRACTED_DATA': {
      const { documentId, documentName, documentType, fields } = action.payload;
      console.log('[WizardContext] APPLY_DOCUMENT_EXTRACTED_DATA triggered');
      console.log('[WizardContext] Document:', documentName, 'Type:', documentType);
      console.log('[WizardContext] Fields to apply:', fields);

      const mappings = DOCUMENT_FIELD_MAPPINGS[documentType as DocumentType] || [];
      console.log('[WizardContext] Found', mappings.length, 'mappings for document type:', documentType);

      let updatedState = { ...state };
      const newFieldSources: Record<string, ExtractedFieldSource> = { ...state.documentFieldSources };
      let appliedCount = 0;
      let skippedCount = 0;

      // Apply each extracted field to the wizard state
      for (const [fieldName, fieldData] of Object.entries(fields)) {
        const mapping = mappings.find(m => m.extractedField === fieldName);
        if (mapping && fieldData.value) {
          // Only apply if confidence is above threshold and field is not already filled
          const currentValue = getNestedValue(updatedState, mapping.wizardPath);
          const shouldApply = fieldData.confidence >= 0.5 && !isFilled(currentValue);

          console.log(`[WizardContext] Field "${fieldName}" -> "${mapping.wizardPath}"`);
          console.log(`[WizardContext]   Current value:`, currentValue);
          console.log(`[WizardContext]   New value: "${fieldData.value}" (confidence: ${fieldData.confidence})`);
          console.log(`[WizardContext]   Should apply: ${shouldApply}`);

          if (shouldApply) {
            // Apply the value to the wizard state
            updatedState = setNestedValue(updatedState, mapping.wizardPath, fieldData.value);

              // Track the source
              newFieldSources[mapping.wizardPath] = {
                value: fieldData.value,
                confidence: fieldData.confidence,
                sourceDocumentId: documentId,
                sourceFilename: documentName,
                sourceDocumentType: documentType,
                extractedAt: new Date().toISOString(),
                fieldPath: mapping.wizardPath,
              };
            appliedCount++;
          } else {
            skippedCount++;
          }
        }
      }

      console.log(`[WizardContext] Applied ${appliedCount} fields, skipped ${skippedCount}`);

      return {
        ...updatedState,
        documentFieldSources: newFieldSources,
      };
    }

    default:
      return null;
  }
}
