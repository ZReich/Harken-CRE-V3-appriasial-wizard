# AGENTS.md - Harken v2 Development Guidelines

## Project Overview

Harken v2 is a commercial real estate appraisal platform built as a Lerna monorepo with:
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + MUI + Ant Design
- **Backend**: Node.js + Express + TypeScript + Sequelize (MySQL) + Winston logging
- **State Management**: Redux Toolkit + Zustand + React Query

## Build/Lint/Test Commands

### Root Commands (from `package.json`)
```bash
npm run frontend      # Start frontend dev server
npm run backend       # Start backend dev server
npm run lint          # Run lerna lint on frontend
npm run start         # Run both frontend and backend concurrently
```

### Frontend Commands (from `packages/frontend/package.json`)
```bash
npm run start         # Vite dev server
npm run build         # TypeScript check + Vite build
npm run lint          # ESLint with max warnings 0
npm run format        # Prettier write
npm run preview       # Vite preview
```

### Backend Commands (from `packages/backend/package.json`)
```bash
npm run dev           # Build TypeScript + run with node
npm run build         # TypeScript compilation to .dist/
npm run start         # npm-watch for development
npm run start-production # node .dist/index.js
```

### Single Test Execution
Tests are run through package-specific commands. No test framework is explicitly configured in the current setup.

## Code Style Guidelines

### TypeScript Configuration

**Frontend** (`packages/frontend/tsconfig.json`):
- Target: ES2020
- Module: ESNext
- Strict mode enabled
- Paths: `@/*` maps to `./src/*`
- No unused locals/parameters enforced

**Backend** (`packages/backend/tsconfig.json`):
- Target: ES2016
- Module: commonjs
- esModuleInterop: true
- Declarations output to `.dist/`
- Less strict (no strict mode, no unused locals)

### ESLint Configuration

**Frontend** extends: `eslint:recommended`, `typescript-eslint/recommended`, `react-hooks/recommended`, `eslint-config-prettier`
- Rules disabled: `@typescript-eslint/no-explicit-any`, `@typescript-eslint/no-unused-vars`, `react-hooks/exhaustive-deps`

**Backend** extends: `eslint:recommended`, `typescript-eslint/recommended`
- Rules disabled: `@typescript-eslint/no-explicit-any`, interface-name-prefix, explicit-function-return-type

### Prettier Configuration

**Frontend** (`packages/frontend/.prettierrc`):
- Single quotes
- Print width: 80
- Tab width: 2
- Trailing comma: es5
- Semi: true
- Arrow parens: always

**Backend** (`packages/backend/.prettierrc`):
- Single quotes
- Print width: 100
- Trailing comma: all
- UseTabs: true

### Naming Conventions

- **Components**: PascalCase for React components (`ThemeToggle.tsx`, `CustomSelect.tsx`)
- **Files**: camelCase for utility files (`formatDate.ts`, `apiClient.ts`)
- **Variables/functions**: camelCase
- **Constants**: SCREAMING_SNAKE_CASE where appropriate
- **Interfaces**: PascalCase with `I` prefix optional (check existing codebase)
- **CSS Classes**: kebab-case (Tailwind)

### Import Ordering (Frontend)

Standard pattern used:
1. React imports
2. Third-party library imports (MUI, AntD, etc.)
3. Custom components
4. Utils/hooks
5. Types/enums

```tsx
import React, { useState, useEffect } from 'react';
import { Button, Modal } from 'antd';
import { useDispatch } from 'react-redux';
import { ThemeToggle } from './components/ThemeToggle';
import { formatDate } from './utils/dateUtils';
```

### Tailwind CSS (`packages/frontend/tailwind.config.js`)

- Dark mode: class-based
- Semantic color palette: `surface-*`, `content-*`, `border-*`
- Brand colors: cyan, green, purple with hover/glow variants
- CSS variables for all semantic colors
- Custom shadow utilities for glow effects

### Error Handling

- Backend: Winston logger for structured logging
- Frontend: Toast notifications via `react-toastify`
- API errors: Handle with try/catch, display user-friendly messages
- Form validation: Formik + Yup
- Input sanitization: DOMPurify for HTML content

### React Component Patterns

- Use functional components with hooks
- Prefer composition over inheritance
- Use React Query for server state
- Use Redux Toolkit for global client state
- Memoize expensive computations with `useMemo`/`useCallback`
- Extract reusable logic into custom hooks (`packages/frontend/src/hook/`)

### UI Library Usage

**IMPORTANT**: When UI libraries (MUI, AntD, Radix, Shadcn) are detected, USE THEM:
- Do not build custom modals, dropdowns, or buttons from scratch
- Wrap/styled library components to achieve design goals
- This ensures stability and accessibility compliance

### Backend Patterns

- Routes in `src/routes/`
- Services in `src/services/`
- Models in `src/models/` (Sequelize)
- Middleware in `src/middleware/`
- Utilities in `src/utils/`
- Configuration in `src/config/`

### Git Hooks

Husky pre-commit hook runs `npm run lint` before commits.

## AI Appraisal Report Generation (When Applicable)

When generating AI prompts for appraisal report text:
- **Role**: Senior MAI-designated commercial appraiser, 30+ years experience
- **Tone**: Professional, authoritative, definitive
- **Perspective**: Third person ("the appraiser", "we")
- **Vocabulary**: "subject property", "highest and best use", "legally permissible", "financially feasible"
- **Formatting**: HTML only, no markdown
  - Bold headers: `<b><u>HEADER</u></b>`
  - Bold inline: `<b>text</b>`
  - Underline: `<u>text</u>`
  - Line breaks: `\n`
  - NO asterisks, underscores, hashtags, markdown bullets
- **Data integrity**: Only describe provided data, never fabricate
- **Conclusions**: Definitively stated, no hedging

## Debugging Protocol

When fixing bugs:
1. Reproduce and inspect (console, network, React dev tools)
2. Diagnose root causes (4-6 hypotheses)
3. Fix iteratively using library primitives
4. Test thoroughly (unit, integration, accessibility)
5. Verify and clean (remove debug logs)

## Response Format

- Concise answers, no unnecessary preamble
- Output code first when applicable
- Only explain when explicitly requested
