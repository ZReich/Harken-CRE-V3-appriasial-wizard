# Evaluation Report Preview & Editor Guide

## Overview

The Evaluation Report Preview & Editor is a powerful new feature that allows users to view and customize their evaluation reports before finalizing them as PDFs. This feature provides a WYSIWYG (What You See Is What You Get) interface for reviewing and modifying report content, layout, and styling.

## Features

### 🎯 Key Capabilities

1. **Live Preview**: View your report exactly as it will appear in the final PDF
2. **Inline Editing**: Click on any text element to edit it directly
3. **Property Editing**: Modify font sizes, weights, colors, and text content through a dedicated properties panel
4. **Page Management**: Enable/disable specific pages to include/exclude from the final report
5. **Zoom Controls**: Adjust zoom level for better viewing (50% - 150%)
6. **Section Navigation**: Quick jump to any section using the pages panel
7. **Real-time Updates**: See changes immediately as you make them

### 📋 Report Sections

The editor supports all standard evaluation report sections:

- **Cover Page**: Property title, address, and main image
- **Table of Contents**: Auto-generated page index
- **Letter of Engagement**: Engagement details
- **Section 01 - Executive Summary**: Overview and key details
- **Section 02 - Property Summary**: Property specifications and details
- **Section 03 - Valuations**: Income, Sales, and Cost approaches
- **Section 04 - Weighted Value**: Final valuation calculations
- **Section 07 - Exhibits**: Supporting documents and images

## How to Access

### From Evaluation Review Page

1. Navigate to your evaluation and complete all required steps
2. Click the **"Complete"** button on the review page
3. In the modal dialog, click **"Preview & Edit Report"**
4. The report editor will open in a new browser tab

### Direct Access (Development/Testing)

Open the prototype directly:
```
/prototypes/evaluation-report-preview-editor.html?id=<evaluation_id>
```

## User Interface

### Top Toolbar

- **Logo & Title**: Shows "Evaluation Report Preview & Editor"
- **Back to Review**: Returns to the evaluation review page
- **Save Changes**: Saves all modifications to the backend
- **Download PDF**: Downloads the current state as a PDF
- **Finalize PDF**: Saves and marks the report as complete

### Left Panel - Pages List

- Lists all report pages/sections
- Checkbox to include/exclude pages from final PDF
- Click any page to scroll to it in the preview
- Shows page numbers for easy reference

### Center Panel - Visual Preview

- Full-size preview of the report pages
- Hover over any text element to see edit controls
- Click elements to select and edit them
- Mimics the exact PDF layout and styling

### Right Panel - Properties

- Shows properties of the selected element
- Edit text content with a textarea
- Adjust font size with a slider (8px - 72px)
- Change font weight (Light, Normal, Semi-Bold, Bold)
- Select text color from predefined swatches
- Click "Apply Changes" to update the element

### Bottom Controls - Zoom

- **Minus (−)**: Zoom out
- **Plus (+)**: Zoom in
- **Reset (⟲)**: Reset to 100%
- Current zoom level displayed in center

## Editing Workflow

### Basic Text Editing

1. **Select Element**
   - Click on any text in the preview
   - Element will highlight with a blue outline
   - Edit icon appears in the top-right corner

2. **Edit Properties**
   - Properties panel updates with element details
   - Modify text content in the textarea
   - Adjust font size, weight, and color as needed

3. **Apply Changes**
   - Click "Apply Changes" button in properties panel
   - Changes appear immediately in the preview

4. **Save Work**
   - Click "Save Changes" in the top toolbar
   - Changes are persisted to the backend

### Page Management

1. **Include/Exclude Pages**
   - Use checkboxes in the pages list
   - Unchecked pages won't appear in final PDF
   - Preview updates immediately

2. **Navigate Pages**
   - Click page items in the left panel
   - Preview scrolls smoothly to that page
   - Active page highlights in blue

### Finalizing the Report

1. **Review All Changes**
   - Scroll through entire report
   - Check all edited sections
   - Verify page inclusions

2. **Save Changes**
   - Click "Save Changes" in toolbar
   - Confirm success message

3. **Finalize**
   - Click "Finalize PDF" button
   - Confirm the action
   - Report is marked as complete

## Report Layout Structure

### Cover Page Style

- Large property title (42px, light weight)
- Subtitle with address
- Full-width property image
- Footer with gradient bar (green to blue to dark)
- Page number in bottom right

### Section Pages Style

- Vertical green sidebar with "SECTION XX" text
- Section header box in top-right (green background)
- Large section heading
- Two-column information grids
- Content text with proper spacing
- Page footer with page number

### Typography

- **Headings**: Montserrat font family
- **Cover Title**: 42px, light (300), green (#2e7d32)
- **Section Headings**: 32px, light (300), dark blue (#1c3643)
- **Subheadings**: 24px, semi-bold (600), green (#2e7d32)
- **Body Text**: 13px, normal (400), dark blue (#1c3643)
- **Labels**: 12px, semi-bold (600), gray (#687F8B)

### Color Palette

- **Primary Green**: #2e7d32
- **Primary Blue**: #0da1c7
- **Dark Blue**: #1c3643
- **Gray Text**: #687F8B
- **Light Gray**: #e0e0e0
- **Background**: #f9f9f9

## Technical Implementation

### Frontend Integration

The feature is integrated into the evaluation review pages:

**Files Modified:**
- `packages/frontend/src/pages/evaluation/evaluation-review/evaluation-review.tsx`
- `packages/frontend/src/pages/evaluation/residential/residential-review/residential-review.tsx`

**Changes Made:**
- Added EditIcon import from Material-UI
- Added "Preview & Edit Report" button to completion modal
- Button opens editor in new window with evaluation ID parameter

### Prototype

**Location:**
- `prototypes/evaluation-report-preview-editor.html`

**Features:**
- Standalone HTML file with embedded CSS and JavaScript
- No external dependencies except Google Fonts and Material Icons
- Can load report data from backend via evaluation ID
- Falls back to demo data for testing

### Backend Integration (Future)

**Required Endpoints:**

1. **GET /evaluations/report-preview/:id**
   - Returns HTML content of the evaluation report
   - Used to populate the editor with actual data
   
2. **POST /evaluations/save-report-changes/:id**
   - Saves user modifications to report content
   - Body contains changed elements and their new values

3. **GET /evaluation/report/:id** (Existing)
   - Generates final PDF with all changes applied
   
4. **GET /residential/report/:id** (Existing)
   - Generates final PDF for residential evaluations

### Data Flow

1. User clicks "Preview & Edit Report"
2. Editor opens with evaluation ID from URL parameter
3. Editor fetches report HTML from `/evaluations/report-preview/:id`
4. User makes changes in the editor
5. Changes are applied to the DOM in real-time
6. User clicks "Save Changes"
7. Changes posted to `/evaluations/save-report-changes/:id`
8. User clicks "Finalize PDF"
9. Final PDF generated with all saved changes

## Design Philosophy

### WYSIWYG Approach

The editor is designed to show **exactly** what will appear in the final PDF:

- Same page dimensions (8.5" x 11")
- Identical fonts and sizes
- Matching colors and spacing
- Accurate layout and positioning

### User-Friendly

- Intuitive click-to-edit interaction
- Clear visual feedback (outlines, highlights)
- Organized properties panel
- Helpful tooltips and descriptions

### Professional Output

- Maintains report quality and consistency
- Prevents layout breaking
- Enforces brand colors and styles
- Ensures readability

## Best Practices

### For Users

1. **Review First, Edit Later**
   - Read through the entire report before making changes
   - Note areas that need modification
   - Plan your edits

2. **Use Consistent Styling**
   - Keep font sizes proportional
   - Use brand colors from the swatches
   - Maintain proper text hierarchy

3. **Save Frequently**
   - Click "Save Changes" after major edits
   - Don't lose work due to browser issues

4. **Check Zoom at 100%**
   - Always review at 100% zoom before finalizing
   - This matches the actual PDF output size

### For Developers

1. **Maintain Layout Integrity**
   - Don't allow edits that break page layout
   - Validate font sizes and colors
   - Prevent removal of required elements

2. **Performance**
   - Lazy load images in preview
   - Optimize DOM manipulation
   - Cache rendered pages

3. **Error Handling**
   - Handle missing data gracefully
   - Provide fallback values
   - Show clear error messages

## Future Enhancements

### Planned Features

1. **Rich Text Editor**
   - Bold, italic, underline formatting
   - Bullet points and numbered lists
   - Text alignment options

2. **Image Management**
   - Upload replacement images
   - Crop and resize images
   - Image positioning controls

3. **Advanced Styling**
   - Custom color picker
   - More font family options
   - Border and shadow controls

4. **Collaboration**
   - Track changes and revision history
   - Comments and annotations
   - Multi-user editing

5. **Templates**
   - Save custom layouts as templates
   - Apply templates to new evaluations
   - Share templates across accounts

6. **Export Options**
   - Export to Word (DOCX)
   - Export to HTML
   - Print preview mode

## Troubleshooting

### Editor Not Loading

**Problem**: Blank screen or loading spinner doesn't disappear

**Solutions**:
- Check browser console for errors
- Verify evaluation ID in URL parameter
- Ensure backend API is running
- Try refreshing the page

### Changes Not Saving

**Problem**: Modifications don't persist after saving

**Solutions**:
- Check network tab for failed API calls
- Verify user has edit permissions
- Ensure evaluation is not locked
- Try logging out and back in

### Layout Looks Different in PDF

**Problem**: Final PDF doesn't match editor preview

**Solutions**:
- Clear browser cache
- Check zoom level is at 100%
- Verify browser compatibility
- Report as a bug for investigation

### Text Overflowing

**Problem**: Text extends beyond page boundaries

**Solutions**:
- Reduce font size
- Shorten text content
- Use appropriate font weight
- Check for very long words (add breaks)

## Support

For issues, questions, or feature requests:

1. Check this guide first
2. Review the prototype in `/prototypes/evaluation-report-preview-editor.html`
3. Check browser console for errors
4. Contact development team with:
   - Evaluation ID
   - Browser and version
   - Steps to reproduce issue
   - Screenshots if applicable

## Browser Compatibility

### Fully Supported

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Partially Supported

- Older browsers may have limited functionality
- Some CSS features may not render correctly
- JavaScript features may need polyfills

### Not Supported

- Internet Explorer (any version)
- Very old mobile browsers

## Keyboard Shortcuts

### Navigation

- **Arrow Keys**: Scroll preview
- **Page Up/Down**: Jump between pages
- **Home/End**: Go to first/last page

### Editing

- **Enter**: Apply text changes (when in textarea)
- **Escape**: Deselect current element
- **Ctrl/Cmd + S**: Save changes (planned)
- **Ctrl/Cmd + Z**: Undo (planned)

### View

- **Ctrl/Cmd + +**: Zoom in
- **Ctrl/Cmd + -**: Zoom out
- **Ctrl/Cmd + 0**: Reset zoom

---

**Version**: 1.0  
**Last Updated**: October 22, 2025  
**Status**: Initial Release


