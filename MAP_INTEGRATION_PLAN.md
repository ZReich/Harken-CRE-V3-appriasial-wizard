# Map Integration Plan for Appraisal Wizard

## Executive Summary

Based on analysis of professional appraisal reports (CBRE, Rove Valuations, and regional appraisers), maps are a critical component of appraisal documentation. This plan outlines how to integrate map capture, generation, and display into the Harken wizard workflow, making it easy to capture all necessary maps while working through the wizard and properly display them in the final report.

---

## Part 1: Map Types Required in Appraisals

### 1.1 Subject Property Maps

| Map Type | Purpose | Source | Placement in Report |
|----------|---------|--------|---------------------|
| **Aerial View** | Bird's-eye view of subject property | Google Maps satellite | Subject Photos section, Addenda |
| **Parcel Map** | Property boundaries with parcel annotation | Cotality + user drawing | Site Analysis, Addenda |
| **Plat Map** | Official survey/subdivision map | Document upload (county records) | Site Analysis, Addenda |
| **Site Map** | Shows subject boundaries in detail | Generated + user annotation | Site Analysis section |
| **Location/Vicinity Map** | Property in neighborhood context | Google Maps street | Area Analysis, Addenda |

### 1.2 Regulatory & Risk Maps

| Map Type | Purpose | Source | Placement in Report |
|----------|---------|--------|---------------------|
| **Flood Plain Map** | FEMA flood zone designation | FEMA API + annotation | Site Analysis section |
| **Zoning Map** | Zoning classification visualization | Municipality/Cotality | Site Analysis section |

### 1.3 Comparable Sales Maps

| Map Type | Purpose | Source | Placement in Report |
|----------|---------|--------|---------------------|
| **Land Sales Map** | Locations of land comparables | Generated from comp data | Cost Approach - Land Valuation |
| **Improved Sales Map** | Locations of improved sales | Generated from comp data | Sales Comparison Approach |
| **Rental Comparables Map** | Locations of rent comps | Generated from comp data | Income Approach section |

### 1.4 Area Analysis Maps

| Map Type | Purpose | Source | Placement in Report |
|----------|---------|--------|---------------------|
| **Regional/Area Map** | Metro/regional context | Google Maps | General Area Analysis |
| **Surrounding Area Map** | Neighborhood with boundaries | Google Maps + annotation | Neighborhood Analysis |
| **Demographics Map** | Radius rings (1/3/5 mi) | RadiusRingMap component | Demographics section |

---

## Part 2: Wizard Integration Points

### 2.1 Where Maps Should Be Captured in Wizard

```
Setup Page
└── Address Entry
    └── [Auto-trigger] Generate base maps when coordinates available

Subject Data Page
├── Location & Area Tab
│   ├── Location Map (auto-generated)
│   ├── Regional/Area Map (auto-generated)
│   └── Surrounding Area Map (generate + annotate boundaries)
│
├── Site Details Tab (PRIMARY MAP LOCATION)
│   ├── Site Size & Shape Section
│   │   ├── Parcel/Boundary Map (draw/upload)
│   │   ├── Plat Map (upload from county)
│   │   └── Site Map (generate with boundary overlay)
│   ├── Flood Zone Section
│   │   └── Flood Plain Map (auto-generate from FEMA)
│   └── Zoning Section
│       └── Zoning Map (auto-generate if available)
│
├── Demographics Tab
│   └── Radius Ring Map (already exists)
│
└── Photos & Maps Tab
    ├── Street Scene Photos
    ├── Aerial View (satellite image)
    └── Map Gallery (all generated maps for review)

Analysis Page
├── Sales Comparison Tab
│   └── Improved Sales Map (auto-generate from comp addresses)
├── Income Approach Tab
│   └── Rental Comparables Map (auto-generate)
└── Cost Approach Tab
    └── Land Sales Map (auto-generate from land comp addresses)
```

### 2.2 Map Data Structure

```typescript
// New types to add to types/index.ts

export interface MapData {
  id: string;
  type: MapType;
  title: string;
  description?: string;
  
  // Source configuration
  source: 'generated' | 'uploaded' | 'drawn';
  
  // Location data
  center: {
    lat: number;
    lng: number;
  };
  zoom?: number;
  
  // Map styling
  mapType: 'satellite' | 'roadmap' | 'hybrid';
  
  // Generated image (for PDF export)
  imageUrl?: string;  // Static map URL or uploaded image
  imageData?: string; // Base64 for embedded
  
  // Boundaries/Annotations
  boundaries?: GeoJsonFeature[];
  annotations?: MapAnnotation[];
  
  // Markers (for comparable maps)
  markers?: MapMarker[];
  
  // Metadata
  capturedAt?: string;
  capturedBy?: string;
  
  // Report placement
  reportSections: string[];
}

export type MapType = 
  | 'aerial'
  | 'location'
  | 'vicinity'
  | 'parcel'
  | 'plat'
  | 'site'
  | 'flood'
  | 'zoning'
  | 'land-sales'
  | 'improved-sales'
  | 'rental-comps'
  | 'area'
  | 'surrounding-area'
  | 'demographics';

export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  label: string;
  type: 'subject' | 'comparable' | 'landmark';
  color?: string;
}

export interface MapAnnotation {
  id: string;
  type: 'label' | 'boundary' | 'arrow' | 'callout';
  content: string;
  position: { lat: number; lng: number };
  style?: Record<string, string>;
}

export interface GeoJsonFeature {
  type: 'Feature';
  geometry: {
    type: 'Polygon' | 'LineString' | 'Point';
    coordinates: number[][] | number[][][] | number[];
  };
  properties: Record<string, unknown>;
}
```

---

## Part 3: Implementation Plan

### Phase 1: Core Map Infrastructure (Week 1-2)

#### 1.1 Map State Management
Add map data to WizardContext:

```typescript
// In WizardContext.tsx - add to state
subjectMaps: MapData[];

// Add actions
SET_SUBJECT_MAPS
ADD_MAP
UPDATE_MAP
REMOVE_MAP

// Add helpers
addMap: (map: MapData) => void;
updateMap: (id: string, updates: Partial<MapData>) => void;
removeMap: (id: string) => void;
getMapsByType: (type: MapType) => MapData[];
getMapsBySection: (section: string) => MapData[];
```

#### 1.2 Map Generation Service
Create `services/mapGenerationService.ts`:

```typescript
export interface MapGenerationOptions {
  lat: number;
  lng: number;
  type: MapType;
  zoom?: number;
  size?: { width: number; height: number };
  markers?: MapMarker[];
  boundaries?: GeoJsonFeature[];
}

export async function generateMap(options: MapGenerationOptions): Promise<MapData>;
export async function generateAerialView(lat: number, lng: number): Promise<MapData>;
export async function generateFloodMap(lat: number, lng: number): Promise<MapData>;
export async function generateComparableMap(
  subject: { lat: number; lng: number },
  comparables: { lat: number; lng: number; label: string }[]
): Promise<MapData>;
```

### Phase 2: UI Components (Week 2-3)

#### 2.1 MapGeneratorPanel Component
Primary interface for generating/viewing maps in Site Details tab:

```typescript
// components/MapGeneratorPanel.tsx
interface MapGeneratorPanelProps {
  coordinates: { lat: number; lng: number };
  onMapGenerated: (map: MapData) => void;
}

// Features:
// - Quick generate buttons for each map type
// - Preview of generated maps
// - Download/export options
// - Regenerate with different settings
```

#### 2.2 BoundaryDrawingTool Component
For drawing property boundaries on maps:

```typescript
// components/BoundaryDrawingTool.tsx
interface BoundaryDrawingToolProps {
  baseMap: MapData;
  existingBoundaries?: GeoJsonFeature[];
  onBoundaryChange: (boundaries: GeoJsonFeature[]) => void;
}

// Features:
// - Polygon drawing mode
// - Edit existing boundaries
// - Import from Cotality parcel data
// - Snap-to-parcel feature
// - Clear/reset
```

#### 2.3 MapGallery Component
Display all captured maps for review:

```typescript
// components/MapGallery.tsx
interface MapGalleryProps {
  maps: MapData[];
  onMapSelect: (map: MapData) => void;
  onMapEdit: (map: MapData) => void;
  onMapDelete: (id: string) => void;
}

// Features:
// - Thumbnail grid view
// - Filter by type/section
// - Drag-and-drop reordering
// - Bulk actions
```

### Phase 3: Auto-Generation Logic (Week 3-4)

#### 3.1 Trigger Points for Auto-Generation

```typescript
// In SubjectDataPage.tsx or dedicated hook

// When coordinates become available (from address entry):
useEffect(() => {
  if (coordinates && !hasGeneratedInitialMaps) {
    autoGenerateMaps([
      'aerial',
      'location',
      'vicinity'
    ]);
    setHasGeneratedInitialMaps(true);
  }
}, [coordinates]);

// When FEMA data is fetched:
useEffect(() => {
  if (femaZone && coordinates) {
    autoGenerateFloodMap();
  }
}, [femaZone, coordinates]);

// When comparables are added in Analysis page:
useEffect(() => {
  if (comparables.length > 0) {
    autoGenerateComparableMap();
  }
}, [comparables]);
```

#### 3.2 Smart Zoom Algorithm
Determine optimal zoom based on content:

```typescript
function calculateOptimalZoom(config: {
  contentType: 'subject' | 'neighborhood' | 'regional' | 'comparables';
  parcelSize?: number; // acres
  comparableDistances?: number[]; // miles
}): number {
  switch (config.contentType) {
    case 'subject':
      // Zoom based on parcel size
      if (config.parcelSize && config.parcelSize < 1) return 18;
      if (config.parcelSize && config.parcelSize < 5) return 17;
      if (config.parcelSize && config.parcelSize < 20) return 16;
      return 15;
    
    case 'neighborhood':
      return 14; // ~0.5 mile view
    
    case 'regional':
      return 11; // ~5 mile view
    
    case 'comparables':
      // Zoom to fit all markers
      const maxDistance = Math.max(...(config.comparableDistances || [5]));
      if (maxDistance < 1) return 14;
      if (maxDistance < 3) return 12;
      if (maxDistance < 10) return 10;
      return 9;
    
    default:
      return 13;
  }
}
```

### Phase 4: Report Integration (Week 4-5)

#### 4.1 Map Page Component
Add MapPage to report preview:

```typescript
// features/report-preview/components/pages/MapPage.tsx
interface MapPageProps {
  map: MapData;
  pageNumber: number;
  showCaption?: boolean;
}

// Renders a full-page map with:
// - Map title/header
// - Map image (scaled to fit)
// - Legend (if applicable)
// - Source attribution
// - Page footer
```

#### 4.2 Report Section Integration
Maps embedded within relevant sections:

```typescript
// In NarrativePage for Site Analysis:
{sectionId === 'site-analysis' && (
  <>
    <NarrativeContent content={content} />
    <div className="mt-4 grid grid-cols-2 gap-4">
      {maps.filter(m => m.type === 'parcel').map(map => (
        <InlineMapDisplay key={map.id} map={map} size="half" />
      ))}
      {maps.filter(m => m.type === 'flood').map(map => (
        <InlineMapDisplay key={map.id} map={map} size="half" />
      ))}
    </div>
  </>
)}
```

#### 4.3 Addenda Map Section
Full-page maps in addenda:

```typescript
// Report generation flow:
const generateAddendaMaps = (maps: MapData[]): ReportPage[] => {
  const addendaMaps = maps.filter(m => 
    ['parcel', 'plat', 'land-sales', 'improved-sales', 'rental-comps'].includes(m.type)
  );
  
  return addendaMaps.map((map, index) => ({
    id: `addenda-map-${map.id}`,
    layout: 'map-page',
    title: map.title,
    content: { map },
    pageNumber: basePageNumber + index,
  }));
};
```

---

## Part 4: UI/UX Design

### 4.1 Site Details Tab Enhancement

```
┌─────────────────────────────────────────────────────────────────┐
│  SITE SIZE & SHAPE                                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Acres        │  │ Shape        │  │ Frontage     │          │
│  │ [1.534     ] │  │ [Rectangular]│  │ [226 ft    ] │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  PROPERTY BOUNDARY MAP                               [?]   ││
│  │  ┌─────────────────────────────────────────────────────┐   ││
│  │  │                                                     │   ││
│  │  │             [Interactive Map Area]                  │   ││
│  │  │                                                     │   ││
│  │  │    ╔════════════════════════════╗                  │   ││
│  │  │    ║   Drawn Property Boundary   ║                  │   ││
│  │  │    ╚════════════════════════════╝                  │   ││
│  │  │                                                     │   ││
│  │  └─────────────────────────────────────────────────────┘   ││
│  │                                                             ││
│  │  [📍 Draw Boundary] [📥 Import Parcel] [📤 Upload Plat]    ││
│  │                                                             ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  MAP GENERATION                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Generate maps for your report with one click. All maps will   │
│  be automatically placed in the appropriate report sections.   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                                                             ││
│  │  [🛰️ Aerial View]  [🗺️ Location Map]  [📍 Vicinity Map]  ││
│  │                                                             ││
│  │  [🌊 Flood Map]    [🏛️ Zoning Map]    [📐 Site Map]       ││
│  │                                                             ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│  Generated Maps (4)                                            │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐                   │
│  │ Aerial │ │Location│ │ Flood  │ │ Zoning │                   │
│  │  ✓     │ │   ✓    │ │   ✓    │ │   ✓    │                   │
│  └────────┘ └────────┘ └────────┘ └────────┘                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 One-Click Map Generation Flow

```
User enters address → Coordinates obtained
         ↓
    Auto-prompt: "Generate maps for this property?"
         ↓
    [Generate All Maps] or [Select Maps]
         ↓
    Progress indicator with live previews
         ↓
    Map gallery populated
         ↓
    User can edit/regenerate individual maps
```

---

## Part 5: API Integrations

### 5.1 Required APIs

| API | Purpose | Current Status |
|-----|---------|----------------|
| Google Maps Static API | Generate map images | ✅ Exists (static-radius.ts) |
| Google Maps JavaScript API | Interactive maps | ✅ Exists (RadiusRingMap) |
| FEMA Flood Map API | Flood zone data | 🔲 To implement |
| Cotality Parcel API | Parcel boundaries | 🔲 To implement |
| Google Maps Drawing API | Boundary drawing | 🔲 To implement |

### 5.2 New API Routes

```
POST /api/maps/generate-batch
  - Generate multiple maps at once
  - Returns array of map URLs/data

POST /api/maps/boundary
  - Process and store boundary GeoJSON
  - Convert to map overlay

GET /api/maps/flood/:lat/:lng
  - Fetch FEMA flood zone data
  - Generate flood map image

GET /api/maps/parcel/:parcelId
  - Fetch parcel boundary from Cotality
  - Return GeoJSON for overlay
```

---

## Part 6: Implementation Checklist

### Phase 1: Foundation ✅ Partially Done
- [x] RadiusRingMap component exists
- [x] Static map API exists
- [ ] Add MapData type to types/index.ts
- [ ] Add map state to WizardContext
- [ ] Create mapGenerationService.ts

### Phase 2: UI Components
- [ ] MapGeneratorPanel component
- [ ] BoundaryDrawingTool component
- [ ] MapGallery component
- [ ] InlineMapDisplay component
- [ ] MapPage report component

### Phase 3: Integration
- [ ] Add map section to Site Details tab
- [ ] Implement auto-generation triggers
- [ ] Connect to FEMA API
- [ ] Connect to Cotality parcel API
- [ ] Comparable maps in Analysis page

### Phase 4: Report Output
- [ ] MapPage in report preview
- [ ] Inline maps in narrative sections
- [ ] Addenda map pages
- [ ] PDF export with maps

### Phase 5: Polish
- [ ] Smart zoom algorithm
- [ ] Boundary editing tools
- [ ] Map annotations
- [ ] Caption editing
- [ ] Bulk regeneration

---

## Part 7: File Structure

```
prototypes/appraisal-wizard-react/
├── api/
│   └── maps/
│       ├── static-radius.ts     (existing)
│       ├── generate-batch.ts    (new)
│       ├── flood.ts             (new)
│       └── parcel.ts            (new)
│
├── src/
│   ├── components/
│   │   ├── RadiusRingMap.tsx    (existing)
│   │   ├── MapGeneratorPanel.tsx     (new)
│   │   ├── BoundaryDrawingTool.tsx   (new)
│   │   ├── MapGallery.tsx            (new)
│   │   └── InlineMapDisplay.tsx      (new)
│   │
│   ├── services/
│   │   └── mapGenerationService.ts   (new)
│   │
│   ├── features/
│   │   └── report-preview/
│   │       └── components/
│   │           └── pages/
│   │               └── MapPage.tsx   (new)
│   │
│   └── types/
│       └── index.ts             (add MapData types)
```

---

## Part 8: Meeting Discussion Points Addressed

### From Transcript:
1. **"Where the boundaries are on a map"** → BoundaryDrawingTool component with parcel import
2. **"Site size and shape section"** → Maps integrated into Site Details tab
3. **"Auto-fill zoning from Cotality"** → Zoning map auto-generation
4. **"Generate flood map, aerial view, location map"** → One-click map generation
5. **"Button click generates them"** → MapGeneratorPanel with quick actions
6. **"Algorithm for appropriate zoom"** → Smart zoom calculation based on content
7. **"Bulk upload photos... AI places them"** → Maps included in photo staging workflow

---

## Next Steps

1. **Immediate**: Add MapData types to `types/index.ts`
2. **This Week**: Create MapGeneratorPanel component
3. **Next Week**: Implement boundary drawing
4. **Following**: Connect to FEMA and parcel APIs
5. **Final**: Report integration and PDF export

---

*Created: January 1, 2026*
*Last Updated: January 1, 2026*
*Author: Harken Development Team*
