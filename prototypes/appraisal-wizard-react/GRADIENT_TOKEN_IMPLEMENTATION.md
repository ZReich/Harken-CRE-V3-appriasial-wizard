# Gradient Token Implementation Guide

## Overview

As part of the Harken Brand Color Migration (Phase 5.5), we implemented semantic gradient tokens to eliminate hardcoded gradient hex values and ensure consistent theming across light/dark modes.

---

## Gradient Patterns Defined

### Pattern 1: Primary Action Gradients
**Use Case**: Strong CTAs, important buttons  
**Tailwind Classes**:
```tsx
bg-gradient-to-r from-gradient-action-from to-gradient-action-to
hover:from-gradient-action-hover-from hover:to-gradient-action-hover-to
```

**Light Mode**: `#0da1c7 → #0890a8`  
**Dark Mode**: `#00d4ff → #0da1c7`

**Example**:
```tsx
<button className="bg-gradient-to-r from-gradient-action-from to-gradient-action-to">
  Generate Report
</button>
```

### Pattern 2: Light Action Gradients
**Use Case**: Secondary actions, AI-assist buttons  
**Tailwind Classes**:
```tsx
bg-gradient-to-r from-gradient-light-from to-gradient-light-to
hover:from-gradient-light-hover-from hover:to-gradient-light-hover-to
```

**Light Mode**: `#4db8d1 → #7fcce0`  
**Dark Mode**: `#00d4ff → #33ddff`

**Example**:
```tsx
<button className="bg-gradient-to-r from-gradient-light-from to-gradient-light-to">
  Generate with AI
</button>
```

### Pattern 3: Icon/Badge Gradients
**Use Case**: Small UI elements, badges, visual polish  
**Tailwind Classes**:
```tsx
bg-gradient-to-br from-gradient-icon-from to-gradient-icon-to
```

**Light Mode**: `#0da1c7 → #4db8d1`  
**Dark Mode**: `#00d4ff → #0da1c7`

**Example**:
```tsx
<div className="bg-gradient-to-br from-gradient-icon-from to-gradient-icon-to">
  <Icon />
</div>
```

### Pattern 4: Brand Header Gradient
**Use Case**: Hero sections, brand headers  
**Tailwind Classes**:
```tsx
bg-gradient-to-r from-gradient-brand-from to-gradient-brand-to
```

**Light Mode**: `#0da1c7 → #1c3643`  
**Dark Mode**: `#00d4ff → #0d1a22`

**Example**:
```tsx
<div className="h-2 bg-gradient-to-r from-gradient-brand-from to-gradient-brand-to" />
```

---

## Programmatic Access (TypeScript)

For charts, SVGs, or other programmatic color usage:

```typescript
import { lightColors, darkColors } from '@/constants/colors';
import { useTheme } from '@/context/ThemeContext';

function MyComponent() {
  const { resolvedTheme } = useTheme();
  const colors = resolvedTheme === 'dark' ? darkColors : lightColors;
  
  const gradient = colors.gradients.action;
  // gradient.from, gradient.to, gradient.hoverFrom, gradient.hoverTo
}
```

---

## Implementation Details

### CSS Variables (`index.css`)

**Light Theme** (`:root`):
```css
--gradient-action-from: #0da1c7;
--gradient-action-to: #0890a8;
--gradient-action-hover-from: #0b8fb0;
--gradient-action-hover-to: #0780a0;

--gradient-light-from: #4db8d1;
--gradient-light-to: #7fcce0;
--gradient-light-hover-from: #3da8c1;
--gradient-light-hover-to: #6fc0d4;

--gradient-icon-from: #0da1c7;
--gradient-icon-to: #4db8d1;

--gradient-brand-from: #0da1c7;
--gradient-brand-to: #1c3643;
```

**Dark Theme** (`html.dark`):
```css
--gradient-action-from: #00d4ff;
--gradient-action-to: #0da1c7;
--gradient-action-hover-from: #22d6f8;
--gradient-action-hover-to: #0fb8d4;

--gradient-light-from: #00d4ff;
--gradient-light-to: #33ddff;
--gradient-light-hover-from: #0dc7e8;
--gradient-light-hover-to: #4de3ff;

--gradient-icon-from: #00d4ff;
--gradient-icon-to: #0da1c7;

--gradient-brand-from: #00d4ff;
--gradient-brand-to: #0d1a22;
```

### Tailwind Theme Extension

All gradient tokens are mapped in the `@theme` directive:
```css
@theme {
  --color-gradient-action-from: var(--gradient-action-from);
  --color-gradient-action-to: var(--gradient-action-to);
  /* ... */
}
```

---

## Migration Examples

### Before (Hardcoded):
```tsx
<button className="bg-gradient-to-r from-[#0da1c7] to-[#0890b0] hover:from-[#0b8fb0] hover:to-[#0780a0]">
  Submit
</button>
```

### After (Semantic Tokens):
```tsx
<button className="bg-gradient-to-r from-gradient-action-from to-gradient-action-to hover:from-gradient-action-hover-from hover:to-gradient-action-hover-to">
  Submit
</button>
```

---

## Design Rationale

1. **Semantic Naming**: Each gradient has a clear purpose (action, light, icon, brand)
2. **Dark Mode**: Luminous variants ensure gradients work on dark backgrounds
3. **Hover States**: Explicit hover tokens for consistent interaction feedback
4. **Intentional Minimalism**: Only 4 gradient patterns for focused visual hierarchy
5. **WCAG AAA**: All gradient colors maintain proper contrast ratios

---

## Testing

All gradient tokens tested across:
- ✅ Light mode rendering
- ✅ Dark mode rendering
- ✅ Hover/interaction states
- ✅ TypeScript constant access
- ✅ Build compilation

---

*Last updated: January 6, 2026*  
*Related: `PHASES_5_6_PROGRESS.md`, `DEVELOPER_GUIDE.md`*
