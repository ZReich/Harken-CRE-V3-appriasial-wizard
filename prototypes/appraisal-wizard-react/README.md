# Harken Appraisal Wizard

A modern, React-based commercial real estate appraisal wizard that guides appraisers through the complete valuation workflow.

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm run test

# Build for production
npm run build
```

## Live Demo

**Production:** [appraisal-wizard-react.vercel.app](https://appraisal-wizard-react.vercel.app)

## Documentation

| Document | Description |
|----------|-------------|
| [**DEVELOPER_GUIDE.md**](./DEVELOPER_GUIDE.md) | Comprehensive guide for developers joining the project |
| [CODEBASE_AUDIT.md](./CODEBASE_AUDIT.md) | Technical audit and architecture decisions |
| [MIGRATION.md](./MIGRATION.md) | Migration notes and upgrade paths |

## Tech Stack

- **Framework:** React 18 + TypeScript
- **Build:** Vite
- **Styling:** Tailwind CSS v4 with CSS Variables
- **State:** React Context + useReducer (modular slices)
- **Testing:** Vitest + React Testing Library
- **Deployment:** Vercel

## Project Structure

```
src/
├── components/      # 74 reusable UI components
├── context/         # State management (WizardContext + reducer slices)
│   └── reducers/    # 10 domain-specific reducer slices
├── features/        # Feature-based modules
│   ├── cost-approach/
│   ├── income-approach/
│   ├── sales-comparison/
│   ├── report-preview/
│   └── review/
├── hooks/           # 13 custom React hooks
├── pages/           # Page-level components (wizard steps)
├── services/        # 22 API service modules
├── constants/       # Configuration and static data
├── types/           # TypeScript type definitions
└── utils/           # Utility functions
```

## Key Features

- **6-Phase Wizard Flow:** Template → Document Intake → Setup → Subject Data → Analysis → Review
- **Multi-Scenario Support:** As Is, As If Complete, As Stabilized
- **Valuation Approaches:** Sales Comparison, Income, Cost, Land, Multi-Family
- **AI-Assisted Drafting:** Automated narrative generation
- **Document Extraction:** OCR and field mapping from uploaded documents
- **WYSIWYG Report Editor:** Drag-and-drop report builder with PDF export

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (port 5173) |
| `npm run build` | TypeScript check + production build |
| `npm run test` | Run tests in watch mode |
| `npm run test:run` | Run tests once |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run lint` | Lint the codebase |

## Environment Variables

Copy `env.example` to `.env.local` and configure:

```env
VITE_OPENAI_API_KEY=your_key_here
VITE_GOOGLE_MAPS_API_KEY=your_key_here
VITE_ESRI_API_KEY=your_key_here
```

## Contributing

See [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md) for coding standards, architecture decisions, and contribution guidelines.

## License

Proprietary - Harken CRE
