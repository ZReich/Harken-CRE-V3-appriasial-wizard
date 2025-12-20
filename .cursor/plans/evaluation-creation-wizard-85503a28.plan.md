<!-- 85503a28-9ba3-4c9e-bbc6-bcf45a7679d2 31ebada6-4fea-4758-84c0-759bcf64f6cf -->
# Enhanced Evaluation Creation Wizard Design

## Research Findings & Design Principles

**Best Practices from Industry Leaders:**

- **Progress Transparency**: Clear stepper with completion status (Smashing Magazine 2024)
- **Smart Navigation**: Conditional steps based on user selections (Webstacks)
- **Real-time Validation**: Inline feedback to prevent errors
- **Micro-interactions**: Smooth transitions and progress animations
- **Contextual Help**: Tooltips, info boxes, and helpful hints
- **Save Progress**: Auto-save and manual save options
- **Visual Hierarchy**: Color-coded sections with consistent design language

## Implementation Steps

### 1. Core Wizard Structure & Navigation

**Create new file**: `prototypes/evaluation-wizard-full.html`

**Main Progress Bar** (Horizontal stepper at top):

- Setup (Step 1)
- Overview (Step 2) 
- [Dynamic Approach Steps] (Steps 3-5)
- Exhibits (Step N-1)
- Review (Step N)

**Smart Navigation Logic**:

```javascript
// Dynamically build step array based on Setup selections
if (salesApproachSelected) steps.push({id: 'sales', name: 'Sales Approach'})
if (costApproachSelected) steps.push({id: 'cost', name: 'Cost Approach'})
if (incomeApproachSelected) steps.push({id: 'income', name: 'Income Approach'})
// etc for Multi-Family, Cap Rate, Lease
```

**Navigation Controls**:

- Sticky footer with "← Back" (gray), "Save Draft" (white), "Continue →" (cyan #0da1c7)
- Keyboard shortcuts: Ctrl+S (save), Ctrl+Enter (continue)
- Breadcrumb trail showing: Home > Evaluations > Create New
- Exit warning modal if unsaved changes

### 2. Step 1: Setup Page

**Layout**: Full-width card with white background

**Fields** (from screenshot 1):

- Evaluation Type dropdown (Residential, Commercial, Land)
- Client Details section with autocomplete
- Property address with Google Maps integration

**Approach Type Selection** (from screenshot 1):

- Large checkbox cards in 2x3 grid
- Each card shows: Icon, Title, Brief description
- Selected cards get cyan border (#0da1c7) and subtle background (#e8f5f7)
- Hover effect: slight elevation shadow
- "Add More" button with dashed border for custom approaches

**Micro-interactions**:

- Checkbox cards animate scale 1.0 → 1.02 on hover
- Checkmark animates in with bounce effect
- Step counter updates with slide transition

**Contextual Help**:

- Info icon next to "Approach Type" with tooltip: "Select all valuation methods you'll use. You can add more later."
- Recommended badge on "Sales Comparison Approach"

### 3. Step 2: Overview with Tabbed Sub-sections

**Tab Navigation** (Horizontal tabs below main progress bar):

```
[Overview Page] [Images] [Photos] [Map Boundary] [Aerial Map] [Area Info]
```

**Tab Styling**:

- Active tab: cyan bottom border (3px), cyan text
- Inactive tabs: gray text, hover shows light cyan background
- Tab completion indicator: green checkmark icon when all required fields filled

#### Sub-tab 2A: Overview Page

**Two-column layout**:

**Left Column - Property Details**:

- Report Title (required)
- Street Address, Suite Number
- State dropdown, ZIP, County
- Type dropdown (Sale/Lease)
- Under Contract Price
- Last Sale Date (datepicker with calendar icon)
- Close Date (datepicker)
- APN/Parcel ID/Tax ID
- Owner of Record
- Property Legal
- Property Rights
- File #
- Property Geocode

**Right Column - Interactive Map**:

- Google Maps embed with property pin
- Map/Satellite toggle buttons
- Zoom controls with + / - buttons
- "Set Location" button to update coordinates
- Shows lat/long coordinates below map

**Smart Features**:

- Address autocomplete with Google Places API
- Auto-populate county from ZIP code
- Date pickers with "Today" quick button
- "Is last sale date known?" Yes/No toggle (like screenshot shows)

#### Sub-tab 2B: Images Page

**Table Layout** (from screenshot):

- Columns: Image Preview | Description | Orientation | Page | Actions
- Drag handles for reordering rows
- Add image button with upload icon (cyan)

**Image Upload**:

- Drag & drop zone with dashed border
- "Click to upload or drag images here"
- Shows file size recommendation: "2MB - 5MB recommended"
- Preview thumbnails in table
- Orientation selector: Horizontal/Vertical radio buttons
- Page dropdown: 1-Cover, 2-TOC, 5-Executive Summary, 7-Property Summary

**Animations**:

- Uploaded images fade in from top
- Delete confirmation shake animation
- Drag reorder with smooth position transitions

#### Sub-tab 2C: Photos Page

**Simple Form** (from screenshot):

- Photo Taken By (text input)
- Photo Date (datepicker MM/DD/YYYY)
- Large "CLICK HERE TO ADD IMAGE" button (cyan, full width)

**Upload Experience**:

- File browser opens on click
- Multiple file selection enabled
- Progress bar for uploads
- Success checkmark animation

#### Sub-tab 2D: Map Boundary Page

**Full-screen Interactive Map** (from screenshot):

- Satellite view as default
- Drawing tools overlay for property boundary
- Instruction panel (white card, top-right):
  - "Select the boundaries of the property"
  - "Click on the map where you would like to place a point..."
  - Navigation buttons: ← | SAVE & CONTINUE → | SKIP

**Map Controls**:

- Map/Satellite toggle (top-left)
- Zoom +/- buttons
- Drawing tools: Polygon, Rectangle, Circle
- Undo/Redo buttons for boundary adjustments
- Clear all button

**Visual Feedback**:

- Boundary lines in cyan (#0da1c7) with 50% opacity fill
- Vertex points show as draggable circles
- Hover cursor changes to crosshair in drawing mode

#### Sub-tab 2E: Aerial Map

**Similar to Map Boundary** but different instruction:

- "Set the aerial map view"
- "Zoom and orient the map for final PDF display"
- Map view selector: Map/Hybrid toggle
- Save viewport position for PDF generation

#### Sub-tab 2F: Area Info

**Rich Text Editors** (from screenshot):

**City Info Section**:

- Label: "City Info (Only 1200 characters allowed)"
- Rich text toolbar: Bold, Italic, Underline, Strikethrough, Font, Size, Alignment, Lists
- Merge Field, Snippet Data, Save Snippet buttons
- Character counter: "0/1200 characters"

**County Info Section**:

- Same layout as City Info
- Character counter: "0/1200 characters"

**Market Trends Section**:

- Heading with info icon
- Expandable/collapsible chevron icons
- Placeholder for trend data visualization

**Save Controls**:

- Auto-save indicator (top-right): "Saving..." / "All changes saved"
- Manual "← Back" and "SAVE & CONTINUE →" buttons (bottom)

### 4. Step 3+: Approach Pages (Dynamic)

#### Sales Comparison Approach (if selected)

**Layout** (from screenshot 3):

**Left Sidebar** (sticky):

- Building $/SF filter controls
- Building Size / Land Area sliders
- Quality/Condition dropdowns
- Sales Price range
- Year Built / Remodeled
- Zoning filter
- Additional filters (collapsible sections)
- Notes section at bottom

**Main Content Area**:

- "Link Existing Comps" button (cyan, with link icon)
- Comp cards in grid (2 columns)
- Each card shows:
  - Property image (placeholder if none)
  - Location pin icon + Address
  - Date Sold, Property Type
  - Building $/SF, Building Size, Land Size
  - Sales Price, Quality, Condition
  - Year Built, Zoning
  - Adjustment percentages (Condition, Construction, etc.)
  - Adjustment input fields with dropdowns
  - Notes textarea

**Right Panel** (sticky):

- "SALES" heading
- "$0 100%" with change/edit icon
- Weight adjustment
- "WEIGHTED TOTAL" display
- "← NEXT →" navigation buttons
- "Add New Comp" button (cyan, with +)
- "Upload Comp" button (with upload icon)

**Micro-interactions**:

- Comp cards have subtle shadow, elevate on hover
- Filter changes instantly update comp list
- Adjustment inputs show real-time calculation
- Weight slider updates total with smooth number animation

### 5. Step N-1: Exhibits Page

**Simple Upload Interface** (from screenshot 4):

- "Upload New Exhibit (.pdf,.jpg,.png)" heading with cloud upload icon
- Large dashed border drop zone
- "Click or drag files here to upload"
- Table below with columns: Order | Title | File | Actions
- Drag handles for reordering
- Delete and preview icons in Actions

**Features**:

- Multiple file upload
- Progress bars for each file
- File type validation with error messages
- Preview modal for PDFs and images

### 6. Step N: Final Review

**Summary Dashboard** (from screenshot 5):

**Top Section - Final Value Review**:

- Heading: "FINAL VALUE REVIEW"
- Info message: "You're all done! View your proof, download the PDF..."
- "COMPLETE →" button (cyan, large, right-aligned)

**Valuation Summary Table**:

- Columns: Approach | Value Indicated | Weighting | Incremental Value | $/SF
- Sales Approach row with editable weight (100% default)
- Market Value calculated row
- Low/High price range display

**Market Value Breakdown**:

- Overall Price Range with Low/High values
- Rounding dropdown (No rounding default)
- Final Market Value display (large, bold)
- Final Market Value $/SF

**Review Notes Section**:

- Rich text editor (850 character limit)
- Merge Field, Snippet Data, Save Snippet buttons
- Formatting toolbar

**Review Information Section**:

- Reviewed By dropdown (Select Option)
- Review Date datepicker (MM/DD/YYYY)

**Navigation**:

- Save draft button
- Complete button to finalize

### 7. Visual Design & Animations

**Color Palette** (from existing prototype):

- Primary: #0da1c7 (cyan) - buttons, active states, progress
- Secondary: #1c3643 (dark blue-gray) - navbar, headings
- Success: #2e7d32 (green) - completed steps, checkmarks
- Warning: #ff9800 (orange) - validation warnings
- Error: #dc3545 (red) - errors, delete actions
- Background: #f5f5f5 (light gray)
- Cards: #ffffff (white)
- Text: #687F8B (gray), #1c3643 (dark)

**Transitions & Animations**:

```css
/* Step transition */
.step-content {
  animation: slideInRight 0.3s ease-out;
}

/* Progress bar fill */
.progress-bar {
  transition: width 0.5s cubic-bezier(0.4, 0.0, 0.2, 1);
}

/* Button hover */
.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(13, 161, 199, 0.3);
  transition: all 0.2s ease;
}

/* Card entrance */
.card-enter {
  animation: fadeInUp 0.4s ease-out;
}

/* Checkmark success */
.checkmark {
  animation: scaleIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

/* Loading spinner */
.spinner {
  animation: rotate 1s linear infinite;
}
```

**Micro-interactions**:

- Form field focus: border color transitions to cyan, subtle glow
- Required field indicator: red asterisk with pulse animation
- Validation success: green checkmark slides in from right
- Validation error: field shakes horizontally, error message fades in
- Save draft: button text changes to "Saving..." with spinner, then "Saved!" with checkmark
- Progress bar: fills smoothly with gradient animation
- Step completion: number changes to checkmark with scale animation

### 8. Helpful Tips & Contextual Help

**Info Icons** (throughout):

- Hover shows tooltip with helpful text
- Click opens detailed help modal
- Positioned next to complex fields

**Inline Help Text**:

- Gray text below fields explaining format or requirements
- Example: "Enter date in MM/DD/YYYY format"

**Smart Prompts**:

- Empty state messages in sections
- "No comps added yet. Click 'Add New Comp' or 'Link Existing Comps' to begin."

**Progress Indicators**:

- "3 of 10 required fields completed" on each page
- Section completion percentage

**Validation Messages**:

- Real-time validation on blur
- Friendly error messages: "Oops! This field is required" instead of just "Required"
- Success messages: "Great! Property address verified"

**Onboarding Tour** (optional first-time):

- Spotlight highlights key features
- Skip or dismiss option
- Keyboard shortcut hints (Ctrl+S, Ctrl+Enter)

### 9. Responsive Considerations

**Desktop (1200px+)**: Full layout as described

**Tablet (768px-1199px)**:

- Comp cards stack to single column
- Sidebars become collapsible panels
- Maps remain full width

**Mobile (< 768px)**:

- Progress bar becomes vertical on side or simplified dots
- Tabs become dropdown selector
- Forms stack to single column
- Sticky footer navigation always visible

### 10. JavaScript Functionality

**Auto-save**:

```javascript
// Save every 30 seconds or on field blur
debounce(autoSave, 30000);
```

**Step Validation**:

```javascript
function validateStep(stepId) {
  // Check required fields
  // Return true/false
  // Show error summary if false
}
```

**Progress Calculation**:

```javascript
function updateProgress() {
  const completed = completedSteps.length;
  const total = activeSteps.length;
  const percentage = (completed / total) * 100;
  // Update progress bar
}
```

**Navigation**:

```javascript
function goToStep(stepId) {
  if (!validateCurrentStep()) return;
  saveCurrentStep();
  showStep(stepId);
  updateURL(stepId);
  updateProgress();
}
```

## Files to Create/Modify

**New Files**:

1. `prototypes/evaluation-wizard-full.html` - Main wizard page
2. `prototypes/css/wizard-animations.css` - Animation styles
3. `prototypes/js/wizard-navigation.js` - Navigation logic
4. `prototypes/js/wizard-validation.js` - Form validation
5. `prototypes/js/wizard-autosave.js` - Auto-save functionality

**Existing Files to Reference**:

- `prototypes/comps-premium-with-clustering.html` - For color scheme and component styles
- `prototypes/evaluation-wizard-template-selector.html` - For existing wizard patterns

## Key Improvements Over Current Design

1. **Smart Navigation**: Only shows relevant approach steps
2. **Tabbed Overview**: Cleaner hierarchy for complex sub-sections
3. **Real-time Validation**: Immediate feedback vs. on-submit errors
4. **Auto-save**: Prevents data loss
5. **Micro-interactions**: Delightful animations and transitions
6. **Contextual Help**: Reduces confusion and support requests
7. **Progress Transparency**: Users always know where they are
8. **Keyboard Shortcuts**: Power users can navigate faster
9. **Responsive Design**: Works on all devices
10. **Modern Aesthetic**: Matches 2024-2025 design standards