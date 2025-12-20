# Enhanced Evaluation Creation Wizard - Updated Plan

## User Feedback & Corrections Applied

Based on actual codebase analysis and user requirements, this plan implements the correct structure matching `packages/frontend/src/pages/evaluation/overview/` components.

## Key Changes from Original Plan:
1. **Overview uses LEFT SIDEBAR navigation** (not horizontal tabs)
2. **Images/Photos/Maps/Area Info are SEPARATE PAGES** accessed via top dropdown
3. **Added AI generation features** for Area Info (City/County data)
4. **Drag & drop standardized** across all upload areas
5. **Map tools visible** with icon toolbar
6. **Auto-save** instead of manual "Save & Continue" buttons
7. **Helpful instructional text** for image requirements

---

## Implementation Steps

### 1. Core Wizard Structure & Navigation

**File**: `prototypes/evaluation-wizard-full.html`

**Main Progress Stepper** (Horizontal at top):
- Setup (Step 1)
- Overview (Step 2)
- [Dynamic Approach Steps] (Steps 3-N based on selections)
- Exhibits (Step N-1)
- Review (Step N)

**Navigation Controls**:
- Sticky footer: "← Back" (gray), "Save Draft" (white), "Continue →" (cyan #0da1c7)
- Keyboard shortcuts: Ctrl+S (save), Ctrl+Enter (continue)
- Breadcrumb: Home > Evaluations > Create New
- Exit warning modal if unsaved changes

---

### 2. Step 1: Setup Page

**Layout**: Centered card, white background, max-width 1200px

**Fields**:
- Evaluation Type dropdown (Commercial/Residential/Land)
- Client Details with autocomplete search
- Property Address with Google Places autocomplete

**Approach Selection Cards** (2x3 grid):
- Sales Comparison Approach (recommended badge)
- Cost Approach
- Income Approach
- Lease Comps Analysis
- Cap Rate Analysis
- Multi-Family Analysis

**Card Styling**:
- White background, border, shadow on hover
- Selected: cyan border (#0da1c7), light cyan background (#e8f5f7)
- Checkmark icon animates in with bounce
- Icon, title, description for each approach

**Micro-interactions**:
- Hover: scale 1.02, elevate shadow
- Select: checkmark bounces in, border animates
- Progress counter updates smoothly

---

### 3. Step 2: Overview with Left Sidebar + Dropdown Navigation

#### **Top Dropdown**: "Overview ▾"
Dropdown menu options:
- **Overview Page** (7 sections with left sidebar)
- **Images** (separate page)
- **Photos** (separate page)
- **Map Boundary** (separate page)
- **Aerial Map** (separate page)
- **Area Info** (separate page)

All pages maintain the main progress stepper and share auto-save functionality.

---

#### **3A. Overview Page - Main Form**

**Layout**: Fixed left sidebar (240px) + Scrollable main content

**Left Sidebar** (matches `evaluation-overview-sidebar.tsx`):

```
┌─ PROPERTY DETAILS ✓
├─ SPECIFICATIONS
├─ ANALYSIS
├─ AMENITIES
├─ ZONING
├─ TAX ASSESSMENT
└─ MAP BOUNDARIES
```

**Sidebar Features**:
- Fixed position, follows scroll
- Active section: 3px cyan left border, cyan text, light background
- Completed sections show green checkmark
- Click to smooth-scroll to section
- Section names: UPPERCASE, bold, 14px
- Hover: subtle background color change

**Main Content - 7 Scrollable Sections**:

**Section 1: PROPERTY DETAILS** (from `evaluation-property-details.tsx`)

*Basic Information*:
- Business Name (text)
- Street Address (Google autocomplete, required, search icon)
- Suite Number
- City, State, ZIP (auto-filled)
- County (auto-filled)
- File #

*Transaction Details*:
- Type (Sale/Lease dropdown)
- Under Contract Price ($)
- Close Date (datepicker)
- Last Transferred Date
- "Is last sale date known?" toggle
- Price, Land Assessment, Structure Assessment ($)
- SIDs, Taxes in Arrears, Tax Liability ($)
- Assessed Market Year, Tax Liability Year

*Legal & Ownership*:
- APN / Parcel ID / Tax ID
- Owner of Record (textarea)
- Property Legal (textarea)
- Property Rights (textarea)
- Property Geocode

**Sticky Map Panel** (right side, 400px wide):
- Google Maps embed
- Map/Satellite toggle
- Zoom +/- controls
- "Set Location" button
- Lat/Long display (readonly)
- Updates when address changes

**Section 2: SPECIFICATIONS** (from `evaluation-specification.tsx`)

*Property Characteristics*:
- Property Class (dropdown)
- Condition (dropdown)
- Year Built, Year Remodeled (year pickers)
- Building Size (SF/AC toggle)
- Land Size (SF/AC toggle)
- Land Dimension (text)
- Number of Stories

*Physical Details*:
- Topography, Frontage, Front Feet, Lot Depth, Lot Shape, Height

*Infrastructure*:
- Utilities Select, Utilities Text
- Included Utilities (multi-select)
- Other Utilities

*Building Components*:
- Main Structure Base, Foundation
- Parking, Basement, ADA Compliance
- Exterior, Roof, Electrical, Plumbing
- Heating & Cooling, Windows

**Section 3: ANALYSIS** (from `evaluation-analysis.tsx`)

*Use & Purpose*:
- High and Best Use (textarea)
- Intended Use (textarea)
- Intended User (textarea)
- Most Likely Owner User
- Conforming Use Determination

*Traffic & Location*:
- Traffic Street Address (autocomplete)
- Traffic Counts (textarea)
- Traffic Count (number)
- Traffic Input

*Inspection Details*:
- Date of Analysis, Inspector Name
- Report Date, Effective Date

**Section 4: AMENITIES** (from `evaluation-amenities.tsx`)
*Only shown if building_with_land type*

*Residential* (if type = Residential):
- Bedrooms, Bathrooms (decimals allowed)
- Garage, Fencing, Fireplace
- Additional Amenities (multi-select)
- Other Amenities

*Commercial*:
- Services (textarea)
- Additional Features (textarea)
- Key Highlights (textarea)

*Site Details* (4 directions):
- North, South, East, West (textareas)

**Section 5: ZONING** (from `evaluation-zoning.tsx`)

- Zoning Type (e.g., "C-2")
- Zoning Description (textarea)
- Zoning Classification (dropdown)
- Allowed Uses (textarea)
- Restrictions (textarea)

**Section 6: TAX ASSESSMENT** (from `evaluation-tax-assessment.tsx`)

- County Details URL (link icon)
- County Tax URL (link icon)
- Subdivision Survey URL (link icon)
- Assessor Name
- Assessment Year
- Land Value, Improvement Value
- Total Assessed Value (calculated, readonly)
- Annual Tax Amount, Tax Rate (%)

**Section 7: MAP BOUNDARIES** (from `evaluation-map-boundaries.tsx`)

- Embedded map showing current boundary
- "Edit Boundary" button → navigates to full Map Boundary page
- Boundary coordinates summary
- "Clear Boundary" button

---

#### **3B. Images Page** (separate page from dropdown)

**Instructional Header** (in colored info box):
```
IMAGES
FOR BEST RESULTS, WE RECOMMEND PHOTO SIZE TO BE BETWEEN 2MB - 5MB, IF POSSIBLE.

📋 Photos Needed:
• Cover Photo: Main property image (horizontal orientation preferred)
• Table of Contents: Secondary property view (any orientation)
• Executive Summary: Professional exterior shot (horizontal)
• Property Summary: Additional view or detail shot (any orientation)

These images will appear in your final PDF report in high quality.
```

**Drag & Drop Upload Zone**:
- Large dashed border (#0da1c7) with icon
- "Drag images here or click to upload" text
- Upload icon (cloud with arrow)
- File size guidance below
- Hover overlay effect when dragging files
- Multiple file selection

**Images Table**:
Columns: `Image Preview | Description | Orientation | Page | Actions`

- Image Preview: 80x80px thumbnail
- Description: Auto-fills "Sub. Property 1", "Sub. Property 2", editable
- Orientation: Dropdown (Horizontal/Vertical)
- Page: Dropdown (1-Cover Photo, 2-Table of Contents, 5-Executive Summary, 7-Property Summary)
- Actions: Drag handle (⋮⋮), Delete button (trash icon)

**Features**:
- Drag to reorder rows (smooth animation)
- Delete shows confirmation tooltip
- Images fade in on upload
- Progress bars during upload
- Auto-saves after changes

---

#### **3C. Photos Page** (separate page from dropdown)

**Photo Metadata Fields**:
- Photo Taken By (text input, required)
- Photo Date (datepicker MM/DD/YYYY, required)

**Drag & Drop Upload Zone** (standardized):
- Large dashed border area
- "Drag photos here or click to upload"
- Upload icon (image icon)
- "Multiple files supported" text
- Click triggers file browser
- Multiple file selection enabled

**Upload Experience**:
- Progress bar for each file
- Thumbnail preview grid below
- Success checkmark animation
- File name and size display
- Delete option per photo

**Grid Display**:
- 4 columns on desktop
- Each photo card shows: thumbnail, filename, size, delete button
- Hover: elevate shadow, show delete clearly

---

#### **3D. Map Boundary Page** (separate page from dropdown)

**Full-height Interactive Map** (fills available height):

**Instruction Card** (top-right overlay, semi-transparent white):
```
Select the boundaries of the property
Click to place boundary points, drag to adjust vertices
```

**Drawing Tools Toolbar** (left side, vertical):
```
┌─ [◇] Polygon Tool     ← icon buttons with tooltips
├─ [□] Rectangle Tool
├─ [○] Circle Tool
├─ [↶] Undo
├─ [↷] Redo
└─ [🗑] Clear All (red)
```

**Tool Button Styling**:
- Width 48px, height 48px
- White background, shadow
- Icon centered, 24px size
- Active tool: cyan background (#0da1c7), white icon
- Hover: elevate, cyan border
- Tooltip on hover (e.g., "Polygon Tool - Click to draw custom boundary")

**Map Controls** (top-left):
- Map/Satellite toggle buttons
- Zoom + button
- Zoom - button
- My Location button (crosshair icon)

**Drawing Visual Feedback**:
- Boundary lines: cyan (#0da1c7), 2px width
- Fill: cyan with 30% opacity
- Vertex points: white circles, cyan border, 8px diameter
- Draggable vertices on hover (cursor: move)
- Crosshair cursor in drawing mode

**Auto-save**: Boundary saves automatically on change
**NO manual "Save & Continue" button** - removed per user feedback

---

#### **3E. Aerial Map Page** (separate page from dropdown)

**Instruction Card** (top-right):
```
Set the aerial map view for PDF display
Zoom and orient the map as it should appear in your final report
```

**Map Interface**:
- Full-height map view
- Map/Hybrid/Satellite toggle
- Zoom controls
- Zoom level indicator (e.g., "Zoom: 16")
- Pan/drag enabled
- No drawing tools (just viewport setting)

**Auto-save**: View position (center lat/lng + zoom) saves automatically
**NO manual "Save & Continue" button** - removed per user feedback

**Bottom Info Bar**:
- Current viewport center: Lat/Lng display
- Current zoom level
- "View saved automatically" indicator

---

#### **3F. Area Info Page** (separate page from dropdown)

**NEW FEATURE: AI-Assisted Content Generation**

**City Info Section**:

Header: `City Info (1200 characters max)` + character counter

**"Generate with AI" Button** (cyan, with sparkle ✨ icon):
- Tooltip: "AI will research and write city information based on property location"
- Click shows loading state: "AI is generating content..."
- Pulls from Wikipedia, public databases
- Generates professional, report-ready description
- Shows "Generated by AI ✨" badge on content
- User can edit AI-generated content freely
- Character counter updates in real-time
- Turns orange at 90%, red at 100%

**Rich Text Editor**:
- Toolbar: Merge Field, Snippet Data, Save Snippet, Bold, Italic, Underline
- Character counter: "245/1200 characters"
- Auto-saves on change

**County Info Section**:

Same layout as City Info:
- Header with character counter
- **"Generate with AI" Button**
- Rich text editor
- Edit after generation
- Auto-save

**Market Trends Section**:

**5 Trend Indicators** (row of dropdowns):
- Sales: [↑ | ↓ | →]
- Vacancy: [↑ | ↓ | →]
- Net Absorption: [↑ | ↓ | →]
- Construction: [↑ | ↓ | →]
- Lease Rates: [↑ | ↓ | →]

**"AI Analyze Trends" Button** (optional, secondary button):
- Tooltip: "AI will analyze market data and suggest trend directions"
- Uses CoStar/public market data APIs
- Suggests directions with confidence %
- User can accept or manually adjust

**AI Features Implementation**:
```javascript
async function generateCityInfo() {
  const address = getPropertyAddress();
  const city = extractCity(address);
  
  // Call AI API (OpenAI, Wikipedia API, etc.)
  const aiContent = await fetch('/api/ai/generate-city-info', {
    method: 'POST',
    body: JSON.stringify({ city, state, propertyType })
  });
  
  // Display with badge
  displayContent(aiContent, { badge: 'Generated by AI' });
  enableEditing();
}
```

---

### 4. Step 3+: Dynamic Approach Pages

**Conditional Display**: Only show approach pages selected in Setup step

#### Sales Comparison Approach

**3-Column Layout**:

**Left Sidebar** (sticky, 280px):
- Building $/SF sliders (min/max)
- Building Size slider
- Land Area slider
- Quality dropdown
- Condition dropdown
- Sales Price range
- Year Built range
- Zoning filter
- "Apply Filters" button
- "Notes" textarea at bottom

**Main Content Area**:
- "Link Existing Comps" button (cyan, link icon)
- Comp cards grid (2 columns)
- Each card shows:
  - Property image placeholder
  - Address with pin icon
  - Date Sold, Property Type
  - Building $/SF, Size, Land Size
  - Sales Price, Quality, Condition
  - Year Built, Zoning
  - Adjustment inputs (%, dropdowns)
  - Notes textarea

**Right Panel** (sticky, 240px):
- "SALES" heading
- Value display: "$0 100%"
- Weight slider (0-100%)
- "WEIGHTED TOTAL" calculation
- "← | NEXT →" navigation
- "Add New Comp" button (+)
- "Upload Comp" button (upload icon)

**Features**:
- Filter changes update comp list instantly
- Adjustment inputs calculate in real-time
- Weight slider animates number changes
- Comp cards elevate on hover

*(Similar layouts for Cost, Income, Lease, Cap Rate, Multi-Family approaches with approach-specific fields)*

---

### 5. Step N-1: Exhibits Upload

**Header**: "Upload New Exhibit" with cloud upload icon

**Large Drag & Drop Zone**:
- Dashed border, 200px height
- "Click or drag files here to upload"
- ".pdf, .jpg, .png accepted"
- Multiple file upload
- Drag overlay effect

**Exhibits Table**:
Columns: `Order | Title | File | Actions`

- Order: Drag handle for reordering
- Title: Editable text input
- File: Filename with icon, file size
- Actions: Preview eye icon, Delete trash icon

**Features**:
- Progress bars during upload
- File type validation
- Preview modal for PDFs/images
- Drag to reorder

---

### 6. Step N: Final Review

**Top Section**:
- Heading: "FINAL VALUE REVIEW"
- Info message: "You're all done! Review your valuation, download PDF, or complete the evaluation."
- "COMPLETE EVALUATION →" button (cyan, large, right)

**Valuation Summary Table**:
Columns: `Approach | Value Indicated | Weighting | Incremental Value | $/SF`

Rows (dynamically based on selected approaches):
- Sales Approach: $0 | 100% (editable slider) | $0 | $0
- Cost Approach: $0 | 0% | $0 | $0
- (etc.)
- **Market Value** (calculated, bold): $0 | 100% | $0 | $0

**Market Value Breakdown**:
- Overall Price Range: Low $0 - High $0
- Rounding dropdown (No rounding, $1000, $5000, $10000)
- **Final Market Value**: $0 (large, bold, primary color)
- Final Market Value $/SF: $0/SF

**Review Notes**:
- Rich text editor (850 char limit)
- Toolbar: Merge Field, Snippet, Bold, Italic
- Character counter

**Review Information**:
- Reviewed By (dropdown, user list)
- Review Date (datepicker)

**Actions**:
- "Save Draft" button
- "COMPLETE EVALUATION →" button (primary, large)

---

### 7. Visual Design & Animations

**Color Palette** (from `comps-premium-with-clustering.html`):
- Primary: `#0da1c7` - buttons, active states, progress
- Secondary: `#1c3643` - navbar, headings
- Success: `#2e7d32` - checkmarks, completed
- Warning: `#ff9800` - warnings
- Error: `#dc3545` - errors, delete
- Background: `#f5f5f5`
- Cards: `#ffffff`
- Text: `#687F8B`, `#1c3643`

**Transitions**:
```css
/* Page transitions */
.page-enter {
  animation: slideInRight 0.3s ease-out;
}

/* Progress bar */
.progress-fill {
  transition: width 0.5s cubic-bezier(0.4, 0.0, 0.2, 1);
}

/* Button hover */
.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(13, 161, 199, 0.3);
  transition: all 0.2s;
}

/* Checkmark */
.checkmark-enter {
  animation: scaleIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

/* Field validation */
.field-error {
  animation: shake 0.3s;
}

.field-success .icon {
  animation: slideInRight 0.2s;
}

/* Sidebar section highlight */
.sidebar-item.active {
  transition: all 0.2s ease;
}

/* Auto-save indicator */
.save-status {
  transition: opacity 0.3s, color 0.3s;
}

/* Drag & drop overlay */
.drag-overlay {
  transition: opacity 0.2s, background-color 0.2s;
}
```

**Micro-interactions**:
- Form focus: border → cyan, subtle glow
- Required field: red asterisk with subtle pulse
- Validation success: green checkmark slides in from right
- Validation error: field shakes, error text fades in below
- Save draft: "Saving..." with spinner → "Saved!" with checkmark (2s)
- Progress bar: smooth fill with gradient
- Step complete: number → checkmark with bounce
- Hover tooltips: fade in 200ms delay
- Drag handle: scale 1.1 on hover

---

### 8. Smart Features & Contextual Help

**Auto-save**:
- Saves every 30 seconds
- Saves on field blur
- Status indicator: "Saving..." / "All changes saved" / "Offline (will save when online)"

**Real-time Validation**:
- On field blur
- Required fields marked with red asterisk
- Invalid: red border, error message below, shake animation
- Valid: green checkmark, border returns to normal

**Progress Tracking**:
- Section completion: "5 of 12 required fields completed"
- Overall wizard progress: "Step 2 of 6 (33%)"
- Sidebar checkmarks when section complete

**Helpful Tooltips**:
- Info icons (ℹ) next to complex fields
- Hover shows tooltip with helpful text
- Click opens detailed help modal

**Smart Prompts**:
- Empty state messages: "No comps added yet. Click 'Add New Comp' or 'Link Existing Comps' to begin."
- Friendly validation: "Oops! This field is required" vs. "Required"
- Success feedback: "Great! Property address verified ✓"

**Keyboard Shortcuts**:
- Ctrl+S: Save draft
- Ctrl+Enter: Continue to next step
- Esc: Close modals
- Hint displayed on first visit

---

### 9. Responsive Design

**Desktop (1200px+)**: Full layout as described

**Tablet (768px-1199px)**:
- Sidebar becomes collapsible drawer (hamburger menu)
- Comp cards → single column
- Maps remain full width
- Sticky footer nav always visible

**Mobile (<768px)**:
- Progress stepper → simplified dots or dropdown
- Dropdown menu → hamburger menu
- Forms → full width single column
- Sticky footer: "Back" | "Save" | "Continue"
- Touch-optimized buttons (44px min)

---

### 10. JavaScript Functions

**Navigation**:
```javascript
function goToStep(stepId) {
  if (!validateCurrentStep()) {
    showValidationErrors();
    return false;
  }
  autoSave();
  hideCurrentStep();
  showStep(stepId);
  updateProgressBar();
  updateURL(stepId);
  scrollToTop();
}

function validateCurrentStep() {
  const requiredFields = getRequiredFieldsForStep(currentStep);
  const errors = [];
  
  requiredFields.forEach(field => {
    if (!field.value || !field.isValid()) {
      errors.push(field);
    }
  });
  
  return errors.length === 0;
}
```

**Auto-save**:
```javascript
let autoSaveTimer;
let hasUnsavedChanges = false;

function triggerAutoSave() {
  clearTimeout(autoSaveTimer);
  hasUnsavedChanges = true;
  updateSaveStatus('pending');
  
  autoSaveTimer = setTimeout(() => {
    performAutoSave();
  }, 30000); // 30 seconds
}

async function performAutoSave() {
  updateSaveStatus('saving');
  
  const formData = collectFormData();
  
  try {
    await fetch('/api/evaluations/draft', {
      method: 'POST',
      body: JSON.stringify(formData)
    });
    
    hasUnsavedChanges = false;
    updateSaveStatus('saved');
  } catch (error) {
    updateSaveStatus('error');
  }
}

// Save on field blur
document.querySelectorAll('input, textarea, select').forEach(field => {
  field.addEventListener('blur', triggerAutoSave);
});
```

**Progress Tracking**:
```javascript
function updateProgress() {
  const totalSteps = getActiveSteps().length;
  const completedSteps = getCompletedSteps().length;
  const currentStepIndex = getCurrentStepIndex();
  
  const percentage = (currentStepIndex / totalSteps) * 100;
  
  document.getElementById('progressBarFill').style.width = percentage + '%';
  document.getElementById('stepCounter').textContent = 
    `Step ${currentStepIndex + 1} of ${totalSteps}`;
}

function checkSectionComplete(sectionId) {
  const requiredFields = getRequiredFieldsForSection(sectionId);
  const allFilled = requiredFields.every(field => 
    field.value && field.value.trim() !== ''
  );
  
  if (allFilled) {
    markSectionComplete(sectionId);
    showCheckmark(sectionId);
  } else {
    markSectionIncomplete(sectionId);
    hideCheckmark(sectionId);
  }
}
```

**Sidebar Scroll Detection**:
```javascript
let sections = [];
let currentActiveSection = null;

function initSidebarScrollTracking() {
  sections = Array.from(document.querySelectorAll('[data-section]'));
  
  window.addEventListener('scroll', throttle(updateActiveSection, 100));
}

function updateActiveSection() {
  const scrollPosition = window.scrollY + 150; // offset for navbar
  
  for (let i = sections.length - 1; i >= 0; i--) {
    const section = sections[i];
    const sectionTop = section.offsetTop;
    
    if (scrollPosition >= sectionTop) {
      setActiveSection(section.dataset.section);
      break;
    }
  }
}

function setActiveSection(sectionId) {
  if (currentActiveSection === sectionId) return;
  
  // Remove active from all
  document.querySelectorAll('.sidebar-item').forEach(item => {
    item.classList.remove('active');
  });
  
  // Add active to current
  const activeItem = document.querySelector(`[data-sidebar-section="${sectionId}"]`);
  if (activeItem) {
    activeItem.classList.add('active');
    currentActiveSection = sectionId;
  }
}

function jumpToSection(sectionId) {
  const section = document.querySelector(`[data-section="${sectionId}"]`);
  if (section) {
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
```

**AI Generation**:
```javascript
async function generateCityInfo() {
  const button = document.getElementById('generateCityBtn');
  const editor = document.getElementById('cityInfoEditor');
  
  // Update button state
  button.disabled = true;
  button.textContent = 'Generating...';
  button.classList.add('loading');
  
  const propertyData = {
    city: document.getElementById('city').value,
    state: document.getElementById('state').value,
    propertyType: document.getElementById('evaluationType').value
  };
  
  try {
    const response = await fetch('/api/ai/generate-city-info', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(propertyData)
    });
    
    const data = await response.json();
    
    // Insert AI-generated content
    editor.value = data.content;
    
    // Add AI badge
    showAIBadge(editor, 'Generated by AI ✨');
    
    // Update character count
    updateCharacterCount('cityInfo', data.content.length);
    
    // Enable editing
    editor.removeAttribute('readonly');
    
    // Show success
    button.textContent = 'Regenerate';
    button.classList.remove('loading');
    button.disabled = false;
    
    showToast('City information generated successfully!', 'success');
  } catch (error) {
    showToast('Failed to generate content. Please try again.', 'error');
    button.textContent = 'Generate with AI';
    button.classList.remove('loading');
    button.disabled = false;
  }
}
```

---

## Files Structure

**Create**:
- `prototypes/evaluation-wizard-full.html` - Complete wizard HTML

**Reference** (for styling consistency):
- `prototypes/comps-premium-with-clustering.html` - Color scheme, buttons, nav
- `packages/frontend/src/pages/evaluation/overview/` - Actual field structure

---

## Summary of User-Requested Changes Applied

✅ **Overview structure corrected**: Left sidebar (not tabs) with 7 sections  
✅ **Images/Photos/Maps/Area Info**: Separate pages via dropdown (not tabs)  
✅ **Images section**: Added instructional text explaining photo requirements  
✅ **Photos section**: Drag & drop standardized (not just click button)  
✅ **Aerial Map**: Removed "Save & Continue", now auto-saves  
✅ **Map Boundary**: Visible drawing tools toolbar with icons  
✅ **Area Info**: Added "Generate with AI" buttons for City/County info  
✅ **All sections**: Auto-save instead of manual save buttons  
✅ **Sidebar**: Checkmarks when sections complete  
✅ **Navigation**: Smooth scrolling, scroll tracking  

This plan now accurately reflects the actual codebase structure and incorporates all user feedback for a superior, modern evaluation creation wizard.

