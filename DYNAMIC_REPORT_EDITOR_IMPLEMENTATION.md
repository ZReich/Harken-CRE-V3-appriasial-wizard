# Dynamic Report Review & Editing System - Complete Implementation Guide

**Document Version:** 1.0  
**Date:** November 3, 2025  
**Target Audience:** Development Team  
**Project:** Harken CRE v2 - Report Generation System Modernization

---

## Table of Contents

1. [Current System Analysis](#1-current-system-analysis)
2. [Problems with Current Approach](#2-problems-with-current-approach)
3. [Proposed Solution Architecture](#3-proposed-solution-architecture)
4. [Technology Stack Recommendations](#4-technology-stack-recommendations)
5. [Backend Implementation](#5-backend-implementation)
6. [Frontend Implementation](#6-frontend-implementation)
7. [Database Schema Changes](#7-database-schema-changes)
8. [API Endpoints](#8-api-endpoints)
9. [Picture-Perfect Preview System](#9-picture-perfect-preview-system)
10. [Dynamic Field Management](#10-dynamic-field-management)
11. [PDF Generation Strategy](#11-pdf-generation-strategy)
12. [Responsive Design Considerations](#12-responsive-design-considerations)
13. [Migration Plan](#13-migration-plan)
14. [Testing Strategy](#14-testing-strategy)
15. [Performance Optimization](#15-performance-optimization)

---

## 1. Current System Analysis

### 1.1 Current Report Generation Flow

#### **Appraisals (Commercial)**
**File:** `packages/backend/src/services/appraisals/appraisals.service.ts`

```typescript
// Current flow:
generateAppraisalReport()
  ↓
  getPDFContent(appraisalData) // Generates HTML from template
  ↓
  fs.writeFile(htmlFile) // Writes HTML to disk
  ↓
  Pandoc command execution // Converts HTML → DOCX
  ↓
  Stream DOCX file to client
```

**Key Components:**
- Template-based system using database (`template`, `sections`, `section_item` tables)
- Dynamic content injection using merge fields (e.g., `{{property_address}}`)
- Pandoc for HTML → DOCX conversion
- Custom Lua filters for formatting (`reportReference/formatting.lua`)
- Reference document for styling (`reportReference/custom-reference.docx`)

#### **Evaluations (Commercial & Residential)**
**Files:**
- `packages/backend/src/services/evaluations/evaluations.service.ts`
- `packages/backend/src/services/resEvaluations/resEvaluations.service.ts`

```typescript
// Current flow:
getReportPdfContent(id) // Returns HTML string
  ↓
  Load EJS templates from disk
  ↓
  Fetch evaluation data with all approaches
  ↓
  Render templates with EJS
  ↓
  Compose full HTML document
  ↓
  Use Puppeteer for HTML → PDF conversion
  ↓
  Stream PDF to client
```

**EJS Templates Used:**
```
packages/backend/templates/report/pages/
├── header.ejs (CSS, fonts, scripts)
├── cover.ejs (Cover page)
├── toc.ejs (Table of contents)
├── letterOfEngagement.ejs
├── executiveSummaryDescription.ejs
├── executiveSummaryDetails.ejs
├── propertySummaryOverview.ejs
├── propertySummaryZoningDescription.ejs
├── propertySummaryAreaInfo.ejs
├── propertySummaryAerialsMap.ejs
├── propertyBoundary.ejs
├── valuationsDeterminants.ejs
├── valuationsExplanation.ejs
├── valuationsIncomeApproach.ejs
├── valuationsLeaseCompsComparison.ejs
├── valuationsCAPCompsComparison.ejs
├── valuationsMultifamilyCompsComparison.ejs
├── valuationsSalesComparisonApproach.ejs
├── valuationsCostApproach.ejs
├── weightedValue.ejs
├── aboutBusinessProperties.ejs
├── brokerProfile.ejs
├── brokerSignificantTransactions.ejs
├── assumptions.ejs
├── assumptionsContinued.ejs
├── exhibits.ejs
└── footer.ejs
```

### 1.2 Data Flow

```
User completes evaluation
  ↓
Clicks "Download PDF"
  ↓
Backend: Fetch all data
  - Evaluation base info
  - Scenarios (multiple approaches)
  - Property details
  - Comparables
  - Images/maps
  - Global codes (states, zoning, conditions, etc.)
  ↓
Backend: Render EJS templates
  - Header with inline CSS
  - Each section with data
  - Footer
  ↓
Backend: Clean HTML (remove tabs/newlines)
  ↓
Backend: Generate PDF with Puppeteer
  ↓
Stream to client
```

### 1.3 Frontend Preview

**File:** `packages/frontend/src/pages/evaluation/report/index.tsx`

```typescript
// Current preview system
- Fetches HTML from `/evaluations/report-preview/:id`
- Displays in iframe using HtmlViewer component
- No editing capability
- Simple read-only view
```

---

## 2. Problems with Current Approach

### 2.1 Technical Limitations

| Issue | Impact | Severity |
|-------|--------|----------|
| **No Live Preview** | Users can't see report before PDF generation | 🔴 High |
| **No Editing** | Must re-enter data in wizard to change content | 🔴 High |
| **Pandoc Dependency** | External binary, OS-specific, deployment issues | 🟡 Medium |
| **Static Templates** | Can't adjust layout dynamically | 🔴 High |
| **No Field Flexibility** | New global codes require template updates | 🔴 High |
| **Poor Responsiveness** | Fixed 8.5" × 11" layout, doesn't adapt | 🟡 Medium |
| **Limited Customization** | Can't adjust per-client branding easily | 🟡 Medium |

### 2.2 User Experience Issues

1. **Blind PDF Generation**: Users download PDF, review, realize changes needed, go back to wizard
2. **No Section Management**: Can't enable/disable sections dynamically
3. **No Content Adjustment**: Can't tweak wording or formatting before final output
4. **Slow Iteration**: Each change requires full wizard re-submission
5. **No Template Flexibility**: All evaluations use same rigid structure

### 2.3 Maintenance Burden

1. **EJS Template Sprawl**: 20+ template files, hard to maintain consistency
2. **Duplicate Logic**: Similar code in evaluations.service.ts and resEvaluations.service.ts
3. **Brittle Styling**: Inline CSS in header.ejs, difficult to update globally
4. **Version Control**: Hard to track template changes across deployments

---

## 3. Proposed Solution Architecture

### 3.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (React)                        │
├─────────────────────────────────────────────────────────────┤
│  Report Builder UI                                          │
│  ├── Page List Panel (left)                                │
│  ├── Live Preview Canvas (center) - WYSIWYG                │
│  └── Properties Panel (right)                              │
│                                                             │
│  Features:                                                  │
│  • Drag & drop sections                                    │
│  • Inline text editing                                     │
│  • Style customization (fonts, colors, spacing)           │
│  • Image upload/replacement                                │
│  • Real-time preview (exactly as PDF will look)           │
│  • Section visibility toggles                              │
└─────────────────────────────────────────────────────────────┘
                          ↕ REST API
┌─────────────────────────────────────────────────────────────┐
│                  BACKEND (Node.js/Express)                  │
├─────────────────────────────────────────────────────────────┤
│  Report Service Layer                                       │
│  ├── Report Builder API                                    │
│  │   • GET /api/v2/reports/:id/structure                  │
│  │   • PUT /api/v2/reports/:id/structure                  │
│  │   • POST /api/v2/reports/:id/render-preview            │
│  │   • POST /api/v2/reports/:id/generate-pdf              │
│  │                                                          │
│  ├── Report Renderer                                       │
│  │   • React-based component rendering (server-side)      │
│  │   • OR Handlebars/Mustache for templates              │
│  │   • Dynamic section assembly                            │
│  │   • Global code injection                               │
│  │                                                          │
│  └── PDF Generator                                         │
│      • Puppeteer (headless Chrome)                        │
│      • OR Playwright                                       │
│      • OR @react-pdf/renderer                             │
└─────────────────────────────────────────────────────────────┘
                          ↕
┌─────────────────────────────────────────────────────────────┐
│                  DATABASE (PostgreSQL/MySQL)                │
├─────────────────────────────────────────────────────────────┤
│  report_structures                                          │
│  report_sections                                            │
│  report_section_items                                       │
│  report_customizations                                      │
│  report_templates                                           │
│  report_field_mappings                                      │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Core Principles

1. **Component-Based Architecture**: Each report section is a reusable component
2. **Separation of Data and Presentation**: Data models separate from rendering logic
3. **JSON-Driven Structure**: Report structure stored as JSON, easy to manipulate
4. **Server-Side Rendering**: Generate HTML on backend for consistency
5. **Client-Side Editing**: Rich editing experience in browser
6. **Atomic Updates**: Save individual changes immediately
7. **Version Control**: Track report revisions

---

## 4. Technology Stack Recommendations

### 4.1 Replacing Pandoc

#### **Option A: Puppeteer (Current for Evaluations) ✅ RECOMMENDED**

**Pros:**
- Already in use for evaluation PDFs
- Full CSS/JavaScript support
- Renders exactly as browsers do
- Can handle complex layouts, charts, images
- Actively maintained
- Great for responsive designs

**Cons:**
- Heavier (requires Chrome headless)
- Slower than pure PDF libraries

**Usage:**
```typescript
import puppeteer from 'puppeteer';

async function generatePDF(html: string): Promise<Buffer> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  
  const pdf = await page.pdf({
    format: 'Letter',
    printBackground: true,
    margin: { top: '0.5in', right: '0.5in', bottom: '0.5in', left: '0.5in' }
  });
  
  await browser.close();
  return pdf;
}
```

#### **Option B: @react-pdf/renderer**

**Pros:**
- React components → PDF directly
- No headless browser needed
- Lighter weight
- Good performance

**Cons:**
- Different API from regular React
- Limited CSS support
- Can't reuse existing HTML templates
- Requires rewriting all templates

#### **Option C: Playwright**

**Pros:**
- Modern alternative to Puppeteer
- Better API
- Faster
- Multi-browser support

**Cons:**
- Newer, less proven
- Similar resource requirements to Puppeteer

#### **Recommendation: Stick with Puppeteer**

You're already using it for evaluations successfully. Extend that approach to appraisals as well. Remove Pandoc dependency entirely.

### 4.2 Template Engine Options

#### **Option A: React Server Components**

Render React components on server, send HTML to client.

**Pros:**
- Component reusability (frontend & backend)
- Modern, maintainable
- Great developer experience
- TypeScript support

#### **Option B: Handlebars ✅ RECOMMENDED**

Simple, logic-less templates. Easy migration from EJS.

**Pros:**
- Simple syntax
- Fast
- Easy to learn
- Great for email/PDFs

**Example:**
```handlebars
<div class="executive-summary">
  <h1>Executive Summary</h1>
  <p>Property: {{evaluation.property_address}}</p>
  <p>Value: {{formatCurrency evaluation.final_value}}</p>
</div>
```

#### **Option C: Keep EJS, Improve Organization**

**Pros:**
- No migration needed
- Team already familiar

**Cons:**
- Older syntax
- Less modern tooling

**Recommendation: Handlebars for new system**

Clean, simple, performant. Easy for non-developers to understand.

### 4.3 Frontend Framework for Editor

#### **Option A: Lexical (Meta's Rich Text Editor)**

**Pros:**
- Modern, extensible
- Great for document editing
- TypeScript support
- Active development

**Cons:**
- Learning curve
- Complex setup

#### **Option B: TipTap (ProseMirror wrapper)**

**Pros:**
- Excellent API
- Vue & React support
- Great documentation
- Modular

**Cons:**
- Paid pro version for some features

#### **Option C: Custom contentEditable + React**

**Pros:**
- Full control
- Lighter weight
- No dependencies

**Cons:**
- More bugs to fix
- Cross-browser issues

**Recommendation: TipTap for rich editing, Custom for layout management**

---

## 5. Backend Implementation

### 5.1 New Service Structure

```typescript
// packages/backend/src/services/reports/reports.service.ts

export default class ReportsService {
  
  /**
   * Get report structure with all data for editing
   */
  async getReportStructure(params: {
    type: 'appraisal' | 'evaluation' | 'residential';
    id: number;
  }): Promise<IReportStructure> {
    // 1. Fetch base data (evaluation/appraisal)
    // 2. Load applicable template
    // 3. Fetch all related data (comps, approaches, etc.)
    // 4. Load customizations if any
    // 5. Build structure JSON
    
    return {
      id,
      type,
      metadata: { /* account, theme, colors */ },
      sections: [
        {
          id: 'cover',
          type: 'cover_page',
          enabled: true,
          order: 1,
          data: { /* cover page data */ },
          customizations: { /* user overrides */ }
        },
        {
          id: 'executive_summary',
          type: 'executive_summary',
          enabled: true,
          order: 2,
          data: { /* summary data */ },
          items: [
            {
              type: 'text',
              content: 'The subject property...',
              editable: true,
              style: { fontSize: 14, color: '#1c3643' }
            }
          ]
        },
        // ... more sections
      ]
    };
  }
  
  /**
   * Render report as HTML for preview
   */
  async renderReportPreview(structureId: number): Promise<string> {
    const structure = await this.getReportStructure(structureId);
    const html = await this.reportRenderer.render(structure);
    return html;
  }
  
  /**
   * Save customizations from editor
   */
  async saveReportCustomizations(
    reportId: number,
    customizations: IReportCustomization[]
  ): Promise<void> {
    await this.reportCustomizationStore.bulkUpsert(customizations);
  }
  
  /**
   * Generate final PDF
   */
  async generateFinalPDF(reportId: number): Promise<Buffer> {
    // 1. Get structure with customizations
    const structure = await this.getReportStructure(reportId);
    
    // 2. Render HTML
    const html = await this.reportRenderer.render(structure);
    
    // 3. Generate PDF with Puppeteer
    const pdf = await this.pdfGenerator.generate(html);
    
    return pdf;
  }
}
```

### 5.2 Report Renderer

```typescript
// packages/backend/src/services/reports/reportRenderer.ts

import Handlebars from 'handlebars';
import fs from 'fs/promises';
import path from 'path';

export class ReportRenderer {
  private templates: Map<string, HandlebarsTemplateDelegate> = new Map();
  
  constructor() {
    this.registerHelpers();
    this.preloadTemplates();
  }
  
  /**
   * Register Handlebars helpers
   */
  private registerHelpers() {
    Handlebars.registerHelper('formatCurrency', (value: number) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(value);
    });
    
    Handlebars.registerHelper('formatDate', (date: Date) => {
      return new Intl.DateFormat('en-US').format(date);
    });
    
    // ... more helpers
  }
  
  /**
   * Preload templates into memory
   */
  private async preloadTemplates() {
    const templateDir = path.join(__dirname, '../../templates/reports');
    const files = await fs.readdir(templateDir);
    
    for (const file of files) {
      if (file.endsWith('.hbs')) {
        const content = await fs.readFile(path.join(templateDir, file), 'utf8');
        const name = file.replace('.hbs', '');
        this.templates.set(name, Handlebars.compile(content));
      }
    }
  }
  
  /**
   * Render full report from structure
   */
  async render(structure: IReportStructure): Promise<string> {
    const { metadata, sections } = structure;
    
    // Build CSS
    const css = this.buildCSS(metadata);
    
    // Render sections
    const sectionsHTML = sections
      .filter(s => s.enabled)
      .sort((a, b) => a.order - b.order)
      .map(section => this.renderSection(section, metadata))
      .join('\n');
    
    // Wrap in HTML document
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Evaluation Report</title>
          <style>${css}</style>
        </head>
        <body>
          ${sectionsHTML}
        </body>
      </html>
    `;
    
    return html;
  }
  
  /**
   * Render individual section
   */
  private renderSection(section: IReportSection, metadata: IReportMetadata): string {
    const template = this.templates.get(section.type);
    if (!template) {
      throw new Error(`Template not found: ${section.type}`);
    }
    
    // Merge section data with metadata
    const data = {
      ...metadata,
      ...section.data,
      customizations: section.customizations
    };
    
    return template(data);
  }
  
  /**
   * Build CSS with account theming
   */
  private buildCSS(metadata: IReportMetadata): string {
    return `
      @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;600;700&display=swap');
      
      * {
        font-family: 'Montserrat', sans-serif;
        box-sizing: border-box;
      }
      
      body {
        margin: 0;
        padding: 0;
      }
      
      .report-page {
        width: 8.5in;
        min-height: 11in;
        margin: 0;
        background: white;
        page-break-after: always;
      }
      
      .cover-page {
        /* ... */
      }
      
      :root {
        --primary-color: ${metadata.primary_color || '#0da1c7'};
        --secondary-color: ${metadata.secondary_color || '#2e7d32'};
        --tertiary-color: ${metadata.tertiary_color || '#1c3643'};
      }
      
      /* ... more styles */
    `;
  }
}
```

### 5.3 PDF Generator

```typescript
// packages/backend/src/services/reports/pdfGenerator.ts

import puppeteer, { Browser, Page } from 'puppeteer';

export class PDFGenerator {
  private browser: Browser | null = null;
  
  /**
   * Initialize browser instance
   */
  async init() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage' // Important for Docker/low memory
        ]
      });
    }
  }
  
  /**
   * Generate PDF from HTML
   */
  async generate(html: string, options: IPDFOptions = {}): Promise<Buffer> {
    await this.init();
    
    const page = await this.browser!.newPage();
    
    // Set viewport for consistent rendering
    await page.setViewport({ width: 1200, height: 1600 });
    
    // Load HTML
    await page.setContent(html, {
      waitUntil: 'networkidle0',
      timeout: 30000
    });
    
    // Wait for images to load
    await page.evaluateHandle('document.fonts.ready');
    
    // Generate PDF
    const pdf = await page.pdf({
      format: 'Letter',
      printBackground: true,
      margin: {
        top: options.marginTop || '0.5in',
        right: options.marginRight || '0.5in',
        bottom: options.marginBottom || '0.5in',
        left: options.marginLeft || '0.5in'
      },
      displayHeaderFooter: options.headerFooter || false,
      headerTemplate: options.headerTemplate || '',
      footerTemplate: options.footerTemplate || ''
    });
    
    await page.close();
    
    return pdf;
  }
  
  /**
   * Cleanup
   */
  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}
```

---

## 6. Frontend Implementation

### 6.1 Report Editor Component

```tsx
// packages/frontend/src/pages/reports/ReportEditor.tsx

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ReportAPI } from '../../api/reports';

export const ReportEditor: React.FC = () => {
  const { id, type } = useParams<{ id: string; type: string }>();
  const [structure, setStructure] = useState<IReportStructure | null>(null);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [zoom, setZoom] = useState(100);
  const [saving, setSaving] = useState(false);
  
  useEffect(() => {
    loadReport();
  }, [id, type]);
  
  const loadReport = async () => {
    const data = await ReportAPI.getStructure(type, parseInt(id));
    setStructure(data);
  };
  
  const handleSectionUpdate = async (sectionId: string, updates: any) => {
    // Optimistic update
    setStructure(prev => ({
      ...prev!,
      sections: prev!.sections.map(s =>
        s.id === sectionId ? { ...s, ...updates } : s
      )
    }));
    
    // Save to backend
    await ReportAPI.updateSection(structure!.id, sectionId, updates);
  };
  
  const handleGeneratePDF = async () => {
    setSaving(true);
    try {
      const pdfBlob = await ReportAPI.generatePDF(structure!.id);
      // Download
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${id}.pdf`;
      a.click();
    } finally {
      setSaving(false);
    }
  };
  
  if (!structure) {
    return <LoadingSpinner />;
  }
  
  return (
    <div className="report-editor">
      <TopToolbar
        onSave={handleSave}
        onGeneratePDF={handleGeneratePDF}
        onBack={() => window.history.back()}
        saving={saving}
      />
      
      <div className="editor-layout">
        <PageListPanel
          sections={structure.sections}
          selectedSection={selectedSection}
          onSelectSection={setSelectedSection}
          onToggleSection={(id) => {
            const section = structure.sections.find(s => s.id === id);
            handleSectionUpdate(id, { enabled: !section?.enabled });
          }}
        />
        
        <PreviewCanvas
          structure={structure}
          zoom={zoom}
          selectedSection={selectedSection}
          onSelectSection={setSelectedSection}
          onUpdateSection={handleSectionUpdate}
        />
        
        <PropertiesPanel
          section={structure.sections.find(s => s.id === selectedSection)}
          onUpdate={(updates) => handleSectionUpdate(selectedSection!, updates)}
        />
      </div>
      
      <ZoomControls zoom={zoom} onZoomChange={setZoom} />
    </div>
  );
};
```

### 6.2 Preview Canvas Component

```tsx
// packages/frontend/src/pages/reports/PreviewCanvas.tsx

import React, { useRef, useEffect, useState } from 'react';
import { ContentEditable } from './ContentEditable';

interface PreviewCanvasProps {
  structure: IReportStructure;
  zoom: number;
  selectedSection: string | null;
  onSelectSection: (id: string) => void;
  onUpdateSection: (id: string, updates: any) => void;
}

export const PreviewCanvas: React.FC<PreviewCanvasProps> = ({
  structure,
  zoom,
  selectedSection,
  onSelectSection,
  onUpdateSection
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  
  return (
    <div className="preview-canvas" style={{ transform: `scale(${zoom / 100})` }}>
      <div ref={canvasRef} className="report-pages">
        {structure.sections
          .filter(s => s.enabled)
          .sort((a, b) => a.order - b.order)
          .map(section => (
            <ReportSection
              key={section.id}
              section={section}
              selected={section.id === selectedSection}
              onSelect={() => onSelectSection(section.id)}
              onUpdate={(updates) => onUpdateSection(section.id, updates)}
            />
          ))}
      </div>
    </div>
  );
};

const ReportSection: React.FC<{
  section: IReportSection;
  selected: boolean;
  onSelect: () => void;
  onUpdate: (updates: any) => void;
}> = ({ section, selected, onSelect, onUpdate }) => {
  const handleTextChange = (itemId: string, newContent: string) => {
    const updatedItems = section.items?.map(item =>
      item.id === itemId ? { ...item, content: newContent } : item
    );
    onUpdate({ items: updatedItems });
  };
  
  return (
    <div
      className={`report-page ${selected ? 'selected' : ''}`}
      onClick={onSelect}
      data-section={section.id}
    >
      <SectionToolbar section={section} onUpdate={onUpdate} />
      
      <div className={`section-content ${section.type}`}>
        {section.type === 'cover_page' && (
          <CoverPageContent section={section} onUpdate={onUpdate} />
        )}
        
        {section.type === 'executive_summary' && (
          <ExecutiveSummaryContent
            section={section}
            onTextChange={handleTextChange}
          />
        )}
        
        {/* ... other section types */}
      </div>
    </div>
  );
};
```

### 6.3 Inline Editing Component

```tsx
// packages/frontend/src/pages/reports/ContentEditable.tsx

import React, { useRef, useEffect } from 'react';

interface ContentEditableProps {
  html: string;
  onChange: (html: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

export const ContentEditable: React.FC<ContentEditableProps> = ({
  html,
  onChange,
  className,
  style
}) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const lastHtml = useRef(html);
  
  useEffect(() => {
    if (elementRef.current && html !== elementRef.current.innerHTML) {
      elementRef.current.innerHTML = html;
    }
  }, [html]);
  
  const handleInput = () => {
    if (elementRef.current) {
      const newHtml = elementRef.current.innerHTML;
      if (newHtml !== lastHtml.current) {
        lastHtml.current = newHtml;
        onChange(newHtml);
      }
    }
  };
  
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  };
  
  return (
    <div
      ref={elementRef}
      contentEditable
      onInput={handleInput}
      onPaste={handlePaste}
      className={className}
      style={style}
      suppressContentEditableWarning
    />
  );
};
```

---

## 7. Database Schema Changes

### 7.1 New Tables

```sql
-- Report structures (one per evaluation/appraisal)
CREATE TABLE report_structures (
  id SERIAL PRIMARY KEY,
  type VARCHAR(50) NOT NULL, -- 'appraisal', 'evaluation', 'residential'
  entity_id INT NOT NULL, -- ID of evaluation or appraisal
  account_id INT NOT NULL,
  template_id INT,
  version INT DEFAULT 1,
  is_finalized BOOLEAN DEFAULT FALSE,
  finalized_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (account_id) REFERENCES accounts(id),
  FOREIGN KEY (template_id) REFERENCES report_templates(id),
  INDEX idx_type_entity (type, entity_id),
  INDEX idx_account (account_id)
);

-- Report sections within a structure
CREATE TABLE report_sections (
  id SERIAL PRIMARY KEY,
  report_structure_id INT NOT NULL,
  section_type VARCHAR(100) NOT NULL, -- 'cover_page', 'executive_summary', etc.
  order_index INT NOT NULL,
  enabled BOOLEAN DEFAULT TRUE,
  config JSON, -- Section-specific configuration
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (report_structure_id) REFERENCES report_structures(id) ON DELETE CASCADE,
  INDEX idx_structure (report_structure_id),
  INDEX idx_order (report_structure_id, order_index)
);

-- Customizations to report content
CREATE TABLE report_customizations (
  id SERIAL PRIMARY KEY,
  report_structure_id INT NOT NULL,
  section_id INT,
  element_path VARCHAR(500) NOT NULL, -- JSON path to element (e.g., 'sections[0].items[2].content')
  property_name VARCHAR(100) NOT NULL, -- 'content', 'fontSize', 'color', etc.
  property_value TEXT,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (report_structure_id) REFERENCES report_structures(id) ON DELETE CASCADE,
  FOREIGN KEY (section_id) REFERENCES report_sections(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id),
  INDEX idx_structure (report_structure_id),
  INDEX idx_section (section_id)
);

-- Report templates (reusable structures)
CREATE TABLE report_templates (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'appraisal', 'evaluation', 'residential'
  description TEXT,
  account_id INT, -- NULL = global template
  is_default BOOLEAN DEFAULT FALSE,
  structure JSON NOT NULL, -- Full template structure
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (account_id) REFERENCES accounts(id),
  FOREIGN KEY (created_by) REFERENCES users(id),
  INDEX idx_type (type),
  INDEX idx_account (account_id)
);

-- Field mappings (which database fields map to which template variables)
CREATE TABLE report_field_mappings (
  id SERIAL PRIMARY KEY,
  template_id INT NOT NULL,
  field_key VARCHAR(255) NOT NULL, -- 'property_address', 'final_value', etc.
  data_source VARCHAR(100) NOT NULL, -- 'evaluation', 'property', 'scenario', etc.
  field_path VARCHAR(500) NOT NULL, -- JSON path to actual data
  formatter VARCHAR(100), -- 'currency', 'date', 'percent', etc.
  default_value TEXT,
  is_required BOOLEAN DEFAULT FALSE,
  
  FOREIGN KEY (template_id) REFERENCES report_templates(id) ON DELETE CASCADE,
  INDEX idx_template (template_id),
  UNIQUE KEY unique_template_field (template_id, field_key)
);

-- Report generation history (audit trail)
CREATE TABLE report_generation_log (
  id SERIAL PRIMARY KEY,
  report_structure_id INT NOT NULL,
  generated_by INT NOT NULL,
  file_path VARCHAR(500),
  file_size INT,
  generation_time_ms INT,
  status VARCHAR(50), -- 'success', 'failed'
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (report_structure_id) REFERENCES report_structures(id),
  FOREIGN KEY (generated_by) REFERENCES users(id),
  INDEX idx_structure (report_structure_id),
  INDEX idx_created (created_at)
);
```

### 7.2 Migration Strategy

```typescript
// migrations/20251103_create_report_system.ts

export async function up(knex: Knex): Promise<void> {
  // Create new tables
  await knex.schema.createTable('report_structures', (table) => {
    table.increments('id').primary();
    table.string('type', 50).notNullable();
    table.integer('entity_id').notNullable();
    table.integer('account_id').notNullable();
    table.integer('template_id');
    table.integer('version').defaultTo(1);
    table.boolean('is_finalized').defaultTo(false);
    table.timestamp('finalized_at');
    table.timestamps(true, true);
    
    table.foreign('account_id').references('accounts.id');
    table.foreign('template_id').references('report_templates.id');
    table.index(['type', 'entity_id']);
    table.index(['account_id']);
  });
  
  // ... create other tables
  
  // Migrate existing evaluations to new system
  await knex.raw(`
    INSERT INTO report_structures (type, entity_id, account_id, version)
    SELECT 
      'evaluation' as type,
      id as entity_id,
      account_id,
      1 as version
    FROM evaluations
  `);
  
  // Migrate existing residential evaluations
  await knex.raw(`
    INSERT INTO report_structures (type, entity_id, account_id, version)
    SELECT 
      'residential' as type,
      id as entity_id,
      account_id,
      1 as version
    FROM res_evaluations
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('report_generation_log');
  await knex.schema.dropTableIfExists('report_field_mappings');
  await knex.schema.dropTableIfExists('report_customizations');
  await knex.schema.dropTableIfExists('report_sections');
  await knex.schema.dropTableIfExists('report_structures');
  await knex.schema.dropTableIfExists('report_templates');
}
```

---

## 8. API Endpoints

### 8.1 Endpoint Definitions

```typescript
// packages/backend/src/routes/reports.routes.ts

import { Router } from 'express';
import ReportsController from '../controllers/reports.controller';

class ReportsRoutes {
  public router: Router;
  private controller: ReportsController;
  
  constructor() {
    this.router = Router();
    this.controller = new ReportsController();
    this.initializeRoutes();
  }
  
  private initializeRoutes() {
    // Get report structure for editing
    this.router.get(
      '/:type/:id/structure',
      this.controller.getStructure
    );
    
    // Update report structure
    this.router.put(
      '/:type/:id/structure',
      this.controller.updateStructure
    );
    
    // Update individual section
    this.router.patch(
      '/structures/:structureId/sections/:sectionId',
      this.controller.updateSection
    );
    
    // Save customizations
    this.router.post(
      '/structures/:structureId/customizations',
      this.controller.saveCustomizations
    );
    
    // Get HTML preview
    this.router.get(
      '/structures/:structureId/preview',
      this.controller.getPreview
    );
    
    // Generate PDF
    this.router.post(
      '/structures/:structureId/generate-pdf',
      this.controller.generatePDF
    );
    
    // Finalize report (lock from further edits)
    this.router.post(
      '/structures/:structureId/finalize',
      this.controller.finalizeReport
    );
    
    // Get report templates
    this.router.get(
      '/templates/:type',
      this.controller.getTemplates
    );
    
    // Create custom template
    this.router.post(
      '/templates',
      this.controller.createTemplate
    );
  }
}
```

### 8.2 Controller Implementation

```typescript
// packages/backend/src/controllers/reports.controller.ts

export default class ReportsController {
  private reportsService: ReportsService;
  
  constructor() {
    this.reportsService = new ReportsService();
  }
  
  /**
   * GET /:type/:id/structure
   * Get full report structure for editing
   */
  public getStructure = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { type, id } = req.params;
      const userId = req.user.id;
      
      // Validate type
      if (!['appraisal', 'evaluation', 'residential'].includes(type)) {
        return res.status(400).json({ error: 'Invalid report type' });
      }
      
      // Check permissions
      await this.checkPermissions(type, parseInt(id), userId);
      
      // Get or create structure
      let structure = await this.reportsService.getStructure(type, parseInt(id));
      
      if (!structure) {
        // Create new structure from default template
        structure = await this.reportsService.createStructure(type, parseInt(id));
      }
      
      return res.json({ data: structure });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  };
  
  /**
   * PATCH /structures/:structureId/sections/:sectionId
   * Update individual section
   */
  public updateSection = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { structureId, sectionId } = req.params;
      const updates = req.body;
      const userId = req.user.id;
      
      // Check if report is finalized
      const structure = await this.reportsService.getStructureById(parseInt(structureId));
      if (structure.is_finalized) {
        return res.status(403).json({ error: 'Report is finalized and cannot be edited' });
      }
      
      // Update section
      await this.reportsService.updateSection(
        parseInt(structureId),
        parseInt(sectionId),
        updates,
        userId
      );
      
      return res.json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  };
  
  /**
   * POST /structures/:structureId/customizations
   * Save bulk customizations
   */
  public saveCustomizations = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { structureId } = req.params;
      const { customizations } = req.body;
      const userId = req.user.id;
      
      await this.reportsService.saveCustomizations(
        parseInt(structureId),
        customizations,
        userId
      );
      
      return res.json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  };
  
  /**
   * GET /structures/:structureId/preview
   * Get HTML preview
   */
  public getPreview = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { structureId } = req.params;
      
      const html = await this.reportsService.renderPreview(parseInt(structureId));
      
      res.setHeader('Content-Type', 'text/html');
      return res.send(html);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  };
  
  /**
   * POST /structures/:structureId/generate-pdf
   * Generate PDF
   */
  public generatePDF = async (req: Request, res: Response): Promise<void> => {
    try {
      const { structureId } = req.params;
      const userId = req.user.id;
      
      // Generate PDF
      const pdf = await this.reportsService.generatePDF(parseInt(structureId), userId);
      
      // Set headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="report-${structureId}.pdf"`);
      
      // Stream PDF
      res.send(pdf);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  /**
   * POST /structures/:structureId/finalize
   * Finalize report (lock from edits)
   */
  public finalizeReport = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { structureId } = req.params;
      const userId = req.user.id;
      
      await this.reportsService.finalizeReport(parseInt(structureId), userId);
      
      return res.json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  };
  
  private async checkPermissions(type: string, id: number, userId: number): Promise<void> {
    // Check if user has access to this report
    // Implement based on your permission system
  }
}
```

---

## 9. Picture-Perfect Preview System

### 9.1 Accurate Preview Rendering

**Challenge:** Preview must look **exactly** like the final PDF.

**Solution:** Use the same rendering engine for preview and PDF.

```typescript
// Shared rendering function
async function renderReport(structure: IReportStructure): Promise<string> {
  const renderer = new ReportRenderer();
  return await renderer.render(structure);
}

// Preview endpoint
app.get('/preview/:id', async (req, res) => {
  const html = await renderReport(structure);
  res.send(html); // Show in iframe
});

// PDF endpoint
app.get('/pdf/:id', async (req, res) => {
  const html = await renderReport(structure); // Same HTML!
  const pdf = await generatePDF(html);
  res.send(pdf);
});
```

### 9.2 CSS for Print Media

Use CSS `@page` and `@media print` to ensure consistency:

```css
/* Base styles (screen & print) */
.report-page {
  width: 8.5in;
  height: 11in;
  margin: 0;
  padding: 0.5in;
  background: white;
}

/* Print-specific */
@media print {
  .report-page {
    page-break-after: always;
  }
  
  .no-print {
    display: none !important;
  }
  
  body {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}

/* Page breaks */
@page {
  size: 8.5in 11in;
  margin: 0;
}
```

### 9.3 Viewport-Based Zoom

```tsx
const PreviewCanvas: React.FC<{ zoom: number }> = ({ zoom }) => {
  return (
    <div className="preview-wrapper">
      <div
        className="preview-content"
        style={{
          transform: `scale(${zoom / 100})`,
          transformOrigin: 'top center',
          width: `${(100 / zoom) * 100}%`
        }}
      >
        {/* Report pages */}
      </div>
    </div>
  );
};
```

### 9.4 Image Handling

**Problem:** Images might not load in preview or PDF.

**Solution:** Convert to base64 or ensure URLs are accessible.

```typescript
async function embedImages(html: string): Promise<string> {
  const $ = cheerio.load(html);
  const images = $('img');
  
  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    const src = $(img).attr('src');
    
    if (src && !src.startsWith('data:')) {
      // Download image
      const response = await fetch(src);
      const buffer = await response.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      const mimeType = response.headers.get('content-type');
      
      // Replace with base64
      $(img).attr('src', `data:${mimeType};base64,${base64}`);
    }
  }
  
  return $.html();
}
```

---

## 10. Dynamic Field Management

### 10.1 Field Binding System

**Goal:** When global codes change (new zoning types, conditions, etc.), reports automatically adapt.

```typescript
// Field mapping configuration
const fieldMappings = {
  'property_address': {
    source: 'evaluation',
    path: 'property_address',
    formatter: 'text'
  },
  'final_value': {
    source: 'evaluation',
    path: 'final_value',
    formatter: 'currency'
  },
  'zoning_type': {
    source: 'globalCodes',
    path: 'zone',
    field: 'evaluation.zoning',
    formatter: 'lookup'
  },
  'condition': {
    source: 'globalCodes',
    path: 'condition',
    field: 'property.condition',
    formatter: 'lookup'
  }
};

// Resolve field values
async function resolveFieldValues(
  structure: IReportStructure,
  data: any
): Promise<Record<string, any>> {
  const values: Record<string, any> = {};
  
  for (const [key, mapping] of Object.entries(fieldMappings)) {
    let value: any;
    
    if (mapping.source === 'evaluation') {
      value = _.get(data, mapping.path);
    } else if (mapping.source === 'globalCodes') {
      const codes = await getGlobalCodes(mapping.path);
      const fieldValue = _.get(data, mapping.field);
      value = codes.options.find(opt => opt.value === fieldValue)?.label;
    }
    
    // Apply formatter
    if (mapping.formatter === 'currency') {
      value = formatCurrency(value);
    } else if (mapping.formatter === 'date') {
      value = formatDate(value);
    }
    
    values[key] = value;
  }
  
  return values;
}
```

### 10.2 Conditional Sections

Some sections should only appear if certain conditions are met:

```typescript
interface IReportSection {
  id: string;
  type: string;
  enabled: boolean;
  conditions?: {
    field: string;
    operator: 'equals' | 'notEquals' | 'greaterThan' | 'lessThan' | 'exists';
    value: any;
  }[];
}

function shouldRenderSection(section: IReportSection, data: any): boolean {
  if (!section.enabled) {
    return false;
  }
  
  if (!section.conditions || section.conditions.length === 0) {
    return true;
  }
  
  return section.conditions.every(condition => {
    const fieldValue = _.get(data, condition.field);
    
    switch (condition.operator) {
      case 'equals':
        return fieldValue === condition.value;
      case 'notEquals':
        return fieldValue !== condition.value;
      case 'greaterThan':
        return fieldValue > condition.value;
      case 'lessThan':
        return fieldValue < condition.value;
      case 'exists':
        return fieldValue !== undefined && fieldValue !== null;
      default:
        return true;
    }
  });
}

// Example usage
{
  id: 'sales_approach',
  type: 'valuations_sales_approach',
  enabled: true,
  conditions: [
    { field: 'scenario.has_sales_approach', operator: 'equals', value: true }
  ]
}
```

### 10.3 Dynamic Tables

Approach tables need to adapt to number of comparables:

```handlebars
{{!-- valuationsSalesApproach.hbs --}}
<div class="approach-table">
  <h2>Sales Comparison Approach</h2>
  
  <table class="data-table">
    <thead>
      <tr>
        <th>Property</th>
        {{#each comparables}}
        <th>Comp {{@index}}</th>
        {{/each}}
        <th>Subject</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Sale Price</strong></td>
        {{#each comparables}}
        <td>{{formatCurrency this.sale_price}}</td>
        {{/each}}
        <td>{{formatCurrency subject.value}}</td>
      </tr>
      {{#each adjustments}}
      <tr>
        <td>{{this.label}}</td>
        {{#each ../comparables}}
        <td>{{formatCurrency (lookup this @../adjustments @index)}}</td>
        {{/each}}
        <td>-</td>
      </tr>
      {{/each}}
    </tbody>
  </table>
</div>
```

### 10.4 Responsive Column Layout

Use CSS Grid to adapt to content:

```css
.approach-table {
  overflow-x: auto;
}

.data-table {
  display: grid;
  grid-template-columns: 150px repeat(auto-fit, minmax(100px, 1fr));
  gap: 1px;
  background: #d0d0d0;
}

.data-table th,
.data-table td {
  background: white;
  padding: 8px;
  min-height: 40px;
  display: flex;
  align-items: center;
}

/* Adjust column widths based on content */
@media screen and (max-width: 1200px) {
  .data-table {
    grid-template-columns: 150px repeat(auto-fit, minmax(80px, 1fr));
  }
}
```

---

## 11. PDF Generation Strategy

### 11.1 Puppeteer Optimization

```typescript
// Reuse browser instance for performance
class OptimizedPDFGenerator {
  private static instance: OptimizedPDFGenerator;
  private browser: Browser | null = null;
  private queue: Array<{ html: string; resolve: (pdf: Buffer) => void }> = [];
  private processing = false;
  
  static getInstance(): OptimizedPDFGenerator {
    if (!this.instance) {
      this.instance = new OptimizedPDFGenerator();
    }
    return this.instance;
  }
  
  async generate(html: string): Promise<Buffer> {
    return new Promise((resolve) => {
      this.queue.push({ html, resolve });
      this.processQueue();
    });
  }
  
  private async processQueue() {
    if (this.processing || this.queue.length === 0) {
      return;
    }
    
    this.processing = true;
    
    try {
      if (!this.browser) {
        this.browser = await puppeteer.launch({
          headless: true,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu'
          ]
        });
      }
      
      const { html, resolve } = this.queue.shift()!;
      const page = await this.browser.newPage();
      
      await page.setContent(html, { waitUntil: 'networkidle0' });
      
      const pdf = await page.pdf({
        format: 'Letter',
        printBackground: true,
        margin: { top: '0.5in', right: '0.5in', bottom: '0.5in', left: '0.5in' }
      });
      
      await page.close();
      resolve(pdf);
    } catch (error) {
      console.error('PDF generation failed:', error);
    } finally {
      this.processing = false;
      
      if (this.queue.length > 0) {
        setImmediate(() => this.processQueue());
      }
    }
  }
  
  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}
```

### 11.2 Alternative: Client-Side PDF Generation

For lighter backend load, generate PDFs on client:

```typescript
// Using jsPDF + html2canvas
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

async function generatePDFClientSide(elementId: string): Promise<Blob> {
  const element = document.getElementById(elementId);
  
  if (!element) {
    throw new Error('Element not found');
  }
  
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false
  });
  
  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF('p', 'mm', 'letter');
  const imgWidth = 210; // A4 width in mm
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  
  pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
  
  return pdf.output('blob');
}
```

**Pros:**
- No backend processing
- Faster for user

**Cons:**
- Lower quality
- Browser compatibility issues
- Can't handle multi-page properly

**Recommendation:** Keep Puppeteer for production PDFs.

---

## 12. Responsive Design Considerations

### 12.1 Fixed Page Size vs. Responsive

**Decision:** Use **fixed page size** for editor, but provide zoom controls.

```tsx
// Fixed 8.5" × 11" pages
const LETTER_WIDTH = 816; // 8.5in × 96dpi
const LETTER_HEIGHT = 1056; // 11in × 96dpi

const ReportPage: React.FC = () => {
  return (
    <div
      className="report-page"
      style={{
        width: `${LETTER_WIDTH}px`,
        minHeight: `${LETTER_HEIGHT}px`,
        background: 'white',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        margin: '20px auto'
      }}
    >
      {/* Page content */}
    </div>
  );
};
```

### 12.2 Zoom Controls

```tsx
const ZoomControls: React.FC<{ zoom: number; onZoomChange: (zoom: number) => void }> = ({
  zoom,
  onZoomChange
}) => {
  const zoomLevels = [50, 75, 100, 125, 150];
  
  return (
    <div className="zoom-controls">
      <button onClick={() => onZoomChange(Math.max(50, zoom - 10))}>
        <ZoomOutIcon />
      </button>
      
      <select
        value={zoom}
        onChange={(e) => onZoomChange(parseInt(e.target.value))}
      >
        {zoomLevels.map(level => (
          <option key={level} value={level}>{level}%</option>
        ))}
      </select>
      
      <button onClick={() => onZoomChange(Math.min(150, zoom + 10))}>
        <ZoomInIcon />
      </button>
      
      <button onClick={() => onZoomChange(100)}>
        Reset
      </button>
    </div>
  );
};
```

### 12.3 Editor Layout Breakpoints

```css
/* Desktop (default) */
.editor-layout {
  display: grid;
  grid-template-columns: 280px 1fr 360px;
  gap: 0;
  height: calc(100vh - 60px);
}

/* Tablet */
@media (max-width: 1200px) {
  .editor-layout {
    grid-template-columns: 240px 1fr 300px;
  }
}

/* Hide panels button for small screens */
@media (max-width: 900px) {
  .editor-layout {
    grid-template-columns: 1fr;
  }
  
  .pages-panel,
  .properties-panel {
    position: fixed;
    top: 60px;
    bottom: 0;
    z-index: 100;
    background: white;
    box-shadow: 0 0 20px rgba(0,0,0,0.3);
    transform: translateX(-100%);
    transition: transform 0.3s;
  }
  
  .pages-panel {
    left: 0;
    width: 280px;
  }
  
  .properties-panel {
    right: 0;
    width: 360px;
    transform: translateX(100%);
  }
  
  .pages-panel.open {
    transform: translateX(0);
  }
  
  .properties-panel.open {
    transform: translateX(0);
  }
}
```

---

## 13. Migration Plan

### 13.1 Phase 1: Foundation (Weeks 1-2)

**Backend:**
- [ ] Create new database tables
- [ ] Implement `ReportsService` base structure
- [ ] Implement `ReportRenderer` with Handlebars
- [ ] Create default templates for all report types
- [ ] Set up API routes and controllers

**Frontend:**
- [ ] Create `ReportEditor` component structure
- [ ] Build `PreviewCanvas` component
- [ ] Implement zoom controls
- [ ] Create basic page list panel

**Testing:**
- [ ] Unit tests for renderer
- [ ] API endpoint tests

### 13.2 Phase 2: Core Editing Features (Weeks 3-4)

**Backend:**
- [ ] Implement customization save/load
- [ ] Build field mapping system
- [ ] Create section management APIs
- [ ] Implement conditional rendering

**Frontend:**
- [ ] Implement inline text editing
- [ ] Build properties panel
- [ ] Add section enable/disable
- [ ] Implement drag & drop section reordering
- [ ] Add image upload/replace

**Testing:**
- [ ] Integration tests for save/load
- [ ] E2E tests for editing flow

### 13.3 Phase 3: PDF Generation (Week 5)

**Backend:**
- [ ] Optimize Puppeteer PDF generation
- [ ] Implement PDF generation queue
- [ ] Add error handling and retries
- [ ] Create PDF caching layer

**Frontend:**
- [ ] Add "Generate PDF" button
- [ ] Show generation progress
- [ ] Handle errors gracefully

**Testing:**
- [ ] Load testing for PDF generation
- [ ] Verify PDF output matches preview

### 13.4 Phase 4: Advanced Features (Week 6)

**Backend:**
- [ ] Implement report templates system
- [ ] Add template import/export
- [ ] Create report versioning
- [ ] Build audit trail

**Frontend:**
- [ ] Add template selector
- [ ] Implement undo/redo
- [ ] Add keyboard shortcuts
- [ ] Build collaboration features (optional)

**Testing:**
- [ ] User acceptance testing
- [ ] Performance testing

### 13.5 Phase 5: Migration & Rollout (Week 7)

- [ ] Migrate existing evaluations to new system
- [ ] Run parallel systems (old & new)
- [ ] Train users
- [ ] Gradual rollout to accounts
- [ ] Monitor for issues
- [ ] Deprecate old system

---

## 14. Testing Strategy

### 14.1 Unit Tests

```typescript
// __tests__/reportRenderer.test.ts

describe('ReportRenderer', () => {
  let renderer: ReportRenderer;
  
  beforeAll(() => {
    renderer = new ReportRenderer();
  });
  
  test('renders cover page correctly', async () => {
    const structure: IReportStructure = {
      sections: [
        {
          id: 'cover',
          type: 'cover_page',
          enabled: true,
          order: 1,
          data: {
            title: 'Test Property',
            subtitle: 'Evaluation Report'
          }
        }
      ]
    };
    
    const html = await renderer.render(structure);
    
    expect(html).toContain('Test Property');
    expect(html).toContain('Evaluation Report');
  });
  
  test('applies customizations correctly', async () => {
    const structure: IReportStructure = {
      sections: [
        {
          id: 'summary',
          type: 'executive_summary',
          enabled: true,
          order: 1,
          data: { content: 'Original content' },
          customizations: {
            content: 'Customized content'
          }
        }
      ]
    };
    
    const html = await renderer.render(structure);
    
    expect(html).toContain('Customized content');
    expect(html).not.toContain('Original content');
  });
  
  test('skips disabled sections', async () => {
    const structure: IReportStructure = {
      sections: [
        {
          id: 'summary',
          type: 'executive_summary',
          enabled: false,
          order: 1,
          data: { content: 'Should not appear' }
        }
      ]
    };
    
    const html = await renderer.render(structure);
    
    expect(html).not.toContain('Should not appear');
  });
});
```

### 14.2 Integration Tests

```typescript
// __tests__/integration/reports.api.test.ts

describe('Reports API', () => {
  let server: any;
  let token: string;
  
  beforeAll(async () => {
    server = await startTestServer();
    token = await getTestAuthToken();
  });
  
  test('GET /api/v2/reports/evaluation/:id/structure returns structure', async () => {
    const response = await request(server)
      .get('/api/v2/reports/evaluation/123/structure')
      .set('Authorization', `Bearer ${token}`);
    
    expect(response.status).toBe(200);
    expect(response.body.data).toHaveProperty('sections');
    expect(response.body.data.sections).toBeInstanceOf(Array);
  });
  
  test('PATCH /api/v2/reports/structures/:id/sections/:sectionId updates section', async () => {
    const response = await request(server)
      .patch('/api/v2/reports/structures/1/sections/2')
      .set('Authorization', `Bearer ${token}`)
      .send({
        enabled: false
      });
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    
    // Verify update
    const getResponse = await request(server)
      .get('/api/v2/reports/evaluation/123/structure')
      .set('Authorization', `Bearer ${token}`);
    
    const section = getResponse.body.data.sections.find(s => s.id === 2);
    expect(section.enabled).toBe(false);
  });
});
```

### 14.3 E2E Tests

```typescript
// e2e/report-editor.spec.ts (Playwright)

import { test, expect } from '@playwright/test';

test.describe('Report Editor', () => {
  test('loads report and allows editing', async ({ page }) => {
    await page.goto('/reports/evaluation/123/edit');
    
    // Wait for report to load
    await page.waitForSelector('.report-page');
    
    // Click on a text element
    await page.click('.editable-text');
    
    // Edit text
    await page.fill('.editable-text', 'Updated content');
    
    // Save
    await page.click('button:has-text("Save")');
    
    // Wait for save confirmation
    await page.waitForSelector('.toast:has-text("Saved")');
    
    // Reload page
    await page.reload();
    
    // Verify change persisted
    const content = await page.textContent('.editable-text');
    expect(content).toBe('Updated content');
  });
  
  test('generates PDF correctly', async ({ page }) => {
    await page.goto('/reports/evaluation/123/edit');
    
    // Click generate PDF
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.click('button:has-text("Generate PDF")')
    ]);
    
    // Verify download
    expect(download.suggestedFilename()).toMatch(/report-\d+\.pdf/);
    
    const path = await download.path();
    const stats = await fs.promises.stat(path);
    expect(stats.size).toBeGreaterThan(1000); // At least 1KB
  });
});
```

---

## 15. Performance Optimization

### 15.1 Caching Strategy

```typescript
// Cache rendered HTML
import { createClient } from 'redis';

class ReportCache {
  private client: ReturnType<typeof createClient>;
  
  async get(structureId: number): Promise<string | null> {
    const key = `report:${structureId}`;
    return await this.client.get(key);
  }
  
  async set(structureId: number, html: string, ttl: number = 3600): Promise<void> {
    const key = `report:${structureId}`;
    await this.client.setEx(key, ttl, html);
  }
  
  async invalidate(structureId: number): Promise<void> {
    const key = `report:${structureId}`;
    await this.client.del(key);
  }
}

// Usage in service
async renderPreview(structureId: number): Promise<string> {
  // Check cache first
  let html = await this.cache.get(structureId);
  
  if (!html) {
    // Render fresh
    const structure = await this.getStructure(structureId);
    html = await this.renderer.render(structure);
    
    // Cache for 1 hour
    await this.cache.set(structureId, html, 3600);
  }
  
  return html;
}

// Invalidate cache on update
async updateSection(structureId: number, sectionId: number, updates: any): Promise<void> {
  await this.sectionStore.update(sectionId, updates);
  await this.cache.invalidate(structureId); // Clear cache
}
```

### 15.2 PDF Generation Queue

```typescript
// Use Bull for job queue
import Queue from 'bull';

const pdfQueue = new Queue('pdf-generation', {
  redis: { host: 'localhost', port: 6379 }
});

pdfQueue.process(async (job) => {
  const { structureId } = job.data;
  
  job.progress(10);
  
  const structure = await reportsService.getStructure(structureId);
  job.progress(30);
  
  const html = await renderer.render(structure);
  job.progress(50);
  
  const pdf = await pdfGenerator.generate(html);
  job.progress(80);
  
  // Save to S3 or file system
  const url = await savePDF(pdf, structureId);
  job.progress(100);
  
  return { url };
});

// In controller
async function generatePDF(req: Request, res: Response): Promise<Response> {
  const { structureId } = req.params;
  
  const job = await pdfQueue.add({ structureId });
  
  return res.json({ jobId: job.id });
}

// Status endpoint
async function getPDFStatus(req: Request, res: Response): Promise<Response> {
  const { jobId } = req.params;
  
  const job = await pdfQueue.getJob(jobId);
  
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }
  
  const state = await job.getState();
  const progress = job.progress();
  
  if (state === 'completed') {
    return res.json({
      status: 'completed',
      url: job.returnvalue.url
    });
  }
  
  return res.json({ status: state, progress });
}
```

### 15.3 Database Query Optimization

```typescript
// Fetch all data in single query with joins
async function getEvaluationDataForReport(id: number): Promise<any> {
  return await Evaluation.findOne({
    where: { id },
    include: [
      {
        model: Account,
        attributes: ['name', 'theme', 'primary_color', 'secondary_color']
      },
      {
        model: Property,
        include: [
          { model: PropertyImages },
          { model: PropertyDocuments }
        ]
      },
      {
        model: Scenario,
        include: [
          { model: LeaseApproach, include: [Comparable] },
          { model: CapApproach, include: [Comparable] },
          { model: MultiFamilyApproach, include: [Comparable] }
        ]
      }
    ]
  });
}
```

---

## 16. Implementation Checklist

### Backend

- [ ] Install dependencies: `handlebars`, `puppeteer`, `bull`, `redis`
- [ ] Create database migrations
- [ ] Implement `ReportsService`
- [ ] Implement `ReportRenderer`
- [ ] Implement `PDFGenerator`
- [ ] Create API routes and controllers
- [ ] Create Handlebars templates for all sections
- [ ] Set up Redis for caching
- [ ] Set up Bull for PDF queue
- [ ] Write unit tests
- [ ] Write integration tests

### Frontend

- [ ] Install dependencies: `react`, `@mui/material`, `axios`
- [ ] Create `ReportEditor` component
- [ ] Create `PreviewCanvas` component
- [ ] Create `PageListPanel` component
- [ ] Create `PropertiesPanel` component
- [ ] Implement inline editing with `ContentEditable`
- [ ] Add drag & drop for section reordering
- [ ] Implement zoom controls
- [ ] Add image upload functionality
- [ ] Create report API client
- [ ] Write E2E tests with Playwright

### DevOps

- [ ] Update Docker configuration for Puppeteer
- [ ] Configure Redis in production
- [ ] Set up Bull dashboard
- [ ] Configure S3 for PDF storage
- [ ] Add monitoring for PDF generation
- [ ] Set up error alerting

### Documentation

- [ ] API documentation
- [ ] User guide for report editor
- [ ] Template development guide
- [ ] Deployment guide

---

## 17. Conclusion

This implementation plan provides a complete roadmap for replacing the current Pandoc-based system with a modern, dynamic report editing solution. The key improvements include:

1. **Live Preview:** Users see exactly what they'll get before generating PDF
2. **Inline Editing:** Make changes directly in the visual editor
3. **Flexibility:** Add/remove sections, reorder content, customize styling
4. **Maintainability:** Component-based templates, clean separation of concerns
5. **Performance:** Caching, queued PDF generation, optimized rendering
6. **Responsiveness:** Zoom controls, adaptive layouts
7. **Dynamic Fields:** Automatically adapt to new global codes

The architecture is designed to be:
- **Scalable:** Queue-based PDF generation handles load
- **Maintainable:** Clean separation of rendering, data, and presentation
- **Extensible:** Easy to add new report types and sections
- **Testable:** Comprehensive test coverage at all levels
- **Production-Ready:** Caching, error handling, monitoring built-in

By following this plan systematically, your team can deliver a best-in-class report editing experience that will delight users and significantly reduce support burden.

---

**Next Steps:**
1. Review this document with the team
2. Prioritize features (MVP vs. nice-to-have)
3. Estimate effort for each phase
4. Create Jira tickets/tasks
5. Begin Phase 1 implementation

**Questions or clarifications?** Reach out to the architect or lead developer.








