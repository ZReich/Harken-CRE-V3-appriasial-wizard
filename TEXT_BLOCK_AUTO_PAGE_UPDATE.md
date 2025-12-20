# Text Block Auto-Page Detection & Full-Width Default - Update Summary

## Changes Made

### 1. Automatic Page Detection
The text block now automatically detects which report page is currently visible in the viewport and adds the text block to that specific page.

#### Implementation Details:
- **Viewport Detection**: Calculates which page has the most visible area in the preview panel
- **Dynamic Target**: Text blocks are added to the page you're currently viewing, not always the first page
- **Multi-Page Support**: Works correctly even when scrolling through multiple report pages

#### Algorithm:
```javascript
// Iterate through all report pages
reportPages.forEach(page => {
    const rect = page.getBoundingClientRect();
    const previewRect = previewContent.getBoundingClientRect();
    
    // Calculate visible height
    const visibleTop = Math.max(rect.top, previewRect.top);
    const visibleBottom = Math.min(rect.bottom, previewRect.bottom);
    const visibleHeight = Math.max(0, visibleBottom - visibleTop);
    
    // Track page with maximum visibility
    if (visibleHeight > maxVisibility) {
        maxVisibility = visibleHeight;
        targetPage = page;
    }
});
```

### 2. Full-Width Default Size
Text blocks now span the full width of the page (minus padding) by default.

#### Default Dimensions:
- **Width**: Full page width minus left/right padding (60px each)
  - Calculation: `pageWidth - 120px`
  - Example: On an 8.5" page (816px), text block = 696px wide
  
- **Height**: Triple line height (approximately 3 lines of text)
  - Default: `72px` minimum height
  - Calculation: `14px font-size × 1.5 line-height × 3 lines ≈ 63px + padding`

#### Positioning:
- **X Position**: 60px from left edge (matches report padding)
- **Y Position**: 100px from top (provides space for page header)

### 3. CSS Updates
Removed the `min-width: 150px` constraint to allow full-width text blocks:

**Before:**
```css
.custom-text-block {
    position: absolute;
    min-width: 150px;  /* ← Removed */
    min-height: 40px;
    /* ... */
}
```

**After:**
```css
.custom-text-block {
    position: absolute;
    padding: 12px 16px;
    /* Width set dynamically via JavaScript */
    /* ... */
}
```

### 4. Block Data Storage
Enhanced block data to track which page the text block belongs to:

```javascript
const blockData = {
    id: Date.now(),
    element: textBlock,
    x: leftPadding,        // 60px
    y: 100,                // 100px from top
    page: targetPage       // Reference to parent page
};
```

## User Experience Flow

### Before Changes:
1. Click "Add Text Block"
2. Text block appears on first page only
3. Small default size (150px × 40px)
4. Always at position (100, 100)

### After Changes:
1. Scroll to any page in the report
2. Click "Add Text Block"
3. Text block appears on **currently visible page**
4. Full-width size spanning the page
5. Triple-line height for comfortable text entry
6. Positioned with proper padding from edges

## Visual Comparison

### Old Default:
```
┌─────────────────────────────────┐
│ Report Page                     │
│                                 │
│  ┌──────────┐                  │
│  │ Small    │ ← 150px wide     │
│  │ Text Box │    40px tall     │
│  └──────────┘                  │
│                                 │
└─────────────────────────────────┘
```

### New Default:
```
┌─────────────────────────────────┐
│ Report Page                     │
│                                 │
│  ┌───────────────────────────┐ │
│  │ Full-Width Text Block     │ │ ← Full width
│  │ With triple line height   │ │    72px tall
│  │                           │ │
│  └───────────────────────────┘ │
│                                 │
└─────────────────────────────────┘
```

## Technical Details

### Page Width Calculation:
```javascript
const pageWidth = targetPage.offsetWidth;  // e.g., 816px (8.5 inches)
const leftPadding = 60;
const rightPadding = 60;
const fullWidth = pageWidth - leftPadding - rightPadding;  // 696px
```

### Height Calculation:
```javascript
// Base calculation for triple line height:
// Font size: 14px
// Line height: 1.5 (21px per line)
// 3 lines: 21px × 3 = 63px
// Plus padding: 63px + 9px ≈ 72px
textBlock.style.minHeight = '72px';
```

### Viewport Visibility Detection:
The system calculates the intersection of each page's bounding rectangle with the preview panel's viewport to determine which page is most visible. This ensures text blocks are added to the page you're actually looking at, even if multiple pages are partially visible.

## Benefits

1. **Intuitive Placement**: Text blocks appear where you're working, not always on page 1
2. **Consistent Width**: Full-width blocks match the report's content area
3. **Better Readability**: Triple-line height provides comfortable space for text
4. **Professional Look**: Blocks align with report margins automatically
5. **Multi-Page Support**: Works seamlessly across all report pages

## Edge Cases Handled

1. **No Pages Visible**: Shows alert message
2. **Multiple Pages Visible**: Selects page with maximum visible area
3. **Scrolled Position**: Correctly identifies current page regardless of scroll position
4. **Different Page Types**: Works with cover pages, section pages, and TOC pages

## Files Modified

- `prototypes/evaluation-report-preview-editor.html`
  - Updated `addNewTextBlock()` function (lines 2213-2300)
  - Modified `.custom-text-block` CSS (lines 790-801)
  - Enhanced block data structure with page reference

## Testing Scenarios

- [x] Add text block while viewing page 1 → appears on page 1
- [x] Scroll to page 2, add text block → appears on page 2
- [x] Scroll to page 3, add text block → appears on page 3
- [x] Text block spans full width minus padding
- [x] Text block has triple-line height (72px)
- [x] Text block positioned at (60px, 100px) by default
- [x] Multiple text blocks can be added to same page
- [x] Text blocks on different pages don't interfere
- [x] Drag and drop still works correctly
- [x] Properties panel shows correct position

## Future Enhancements

1. Smart positioning to avoid overlapping existing text blocks
2. Snap to existing content blocks for alignment
3. Auto-adjust height based on content
4. Template sizes (full-width, half-width, sidebar)
5. Remember last used size for new blocks


