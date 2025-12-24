/**
 * Template Storage Utility
 * 
 * Uses IndexedDB to store report templates for reuse.
 * Templates include report structure, section visibility, styling, and custom content.
 */

import { TemplateFormData } from '../components/dialogs/TemplateSaveDialog';

// =================================================================
// TYPES
// =================================================================

export interface StoredTemplate {
  id: string;
  metadata: TemplateFormData;
  content: {
    sectionVisibility: Record<string, boolean>;
    sectionOrder: string[];
    styling: Record<string, React.CSSProperties>;
    customContent: Record<string, unknown>;
    editedFields: Record<string, { path: string; editedValue: unknown }>;
  };
  createdAt: string;
  updatedAt: string;
  version: number;
}

// =================================================================
// DATABASE CONFIGURATION
// =================================================================

const DB_NAME = 'harken-templates';
const DB_VERSION = 1;
const STORE_NAME = 'templates';

// =================================================================
// DATABASE INITIALIZATION
// =================================================================

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error('Failed to open template database'));
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create templates object store
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        
        // Create indexes for searching
        store.createIndex('name', 'metadata.name', { unique: false });
        store.createIndex('useCase', 'metadata.useCase', { unique: false });
        store.createIndex('createdAt', 'createdAt', { unique: false });
        store.createIndex('updatedAt', 'updatedAt', { unique: false });
      }
    };
  });
}

// =================================================================
// TEMPLATE OPERATIONS
// =================================================================

/**
 * Save a new template to IndexedDB
 */
export async function saveTemplate(
  metadata: TemplateFormData,
  content: StoredTemplate['content']
): Promise<string> {
  const db = await openDatabase();
  
  const template: StoredTemplate = {
    id: `template-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    metadata,
    content,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    version: 1,
  };

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.add(template);

    request.onsuccess = () => {
      resolve(template.id);
    };

    request.onerror = () => {
      reject(new Error('Failed to save template'));
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
}

/**
 * Update an existing template
 */
export async function updateTemplate(
  id: string,
  updates: Partial<Pick<StoredTemplate, 'metadata' | 'content'>>
): Promise<void> {
  const db = await openDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const getRequest = store.get(id);

    getRequest.onsuccess = () => {
      const template = getRequest.result as StoredTemplate;
      if (!template) {
        reject(new Error('Template not found'));
        return;
      }

      const updatedTemplate: StoredTemplate = {
        ...template,
        metadata: updates.metadata ? { ...template.metadata, ...updates.metadata } : template.metadata,
        content: updates.content ? { ...template.content, ...updates.content } : template.content,
        updatedAt: new Date().toISOString(),
        version: template.version + 1,
      };

      const putRequest = store.put(updatedTemplate);
      
      putRequest.onsuccess = () => {
        resolve();
      };

      putRequest.onerror = () => {
        reject(new Error('Failed to update template'));
      };
    };

    getRequest.onerror = () => {
      reject(new Error('Failed to retrieve template'));
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
}

/**
 * Get a template by ID
 */
export async function getTemplate(id: string): Promise<StoredTemplate | null> {
  const db = await openDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(id);

    request.onsuccess = () => {
      resolve(request.result as StoredTemplate | null);
    };

    request.onerror = () => {
      reject(new Error('Failed to retrieve template'));
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
}

/**
 * Get all templates
 */
export async function getAllTemplates(): Promise<StoredTemplate[]> {
  const db = await openDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      const templates = request.result as StoredTemplate[];
      // Sort by updatedAt descending (most recent first)
      templates.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      resolve(templates);
    };

    request.onerror = () => {
      reject(new Error('Failed to retrieve templates'));
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
}

/**
 * Delete a template by ID
 */
export async function deleteTemplate(id: string): Promise<void> {
  const db = await openDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(new Error('Failed to delete template'));
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
}

/**
 * Search templates by name or use case
 */
export async function searchTemplates(query: string): Promise<StoredTemplate[]> {
  const allTemplates = await getAllTemplates();
  const lowerQuery = query.toLowerCase();
  
  return allTemplates.filter(template => 
    template.metadata.name.toLowerCase().includes(lowerQuery) ||
    template.metadata.description.toLowerCase().includes(lowerQuery) ||
    template.metadata.useCase.toLowerCase().includes(lowerQuery) ||
    template.metadata.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}

/**
 * Get templates by property type
 */
export async function getTemplatesByPropertyType(propertyType: string): Promise<StoredTemplate[]> {
  const allTemplates = await getAllTemplates();
  
  return allTemplates.filter(template => 
    template.metadata.propertyTypes.includes(propertyType)
  );
}

/**
 * Check if IndexedDB is supported
 */
export function isIndexedDBSupported(): boolean {
  return typeof window !== 'undefined' && 'indexedDB' in window;
}

/**
 * Clear all templates (for development/testing)
 */
export async function clearAllTemplates(): Promise<void> {
  const db = await openDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.clear();

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(new Error('Failed to clear templates'));
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
}

export default {
  saveTemplate,
  updateTemplate,
  getTemplate,
  getAllTemplates,
  deleteTemplate,
  searchTemplates,
  getTemplatesByPropertyType,
  isIndexedDBSupported,
  clearAllTemplates,
};

