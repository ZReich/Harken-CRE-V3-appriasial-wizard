# Harken CRE - Developer Onboarding Guide

> **Production Codebase Overview**  
> Last Updated: November 2025

---

## Table of Contents
1. [Software Purpose](#software-purpose)
2. [Project Architecture](#project-architecture)
3. [Backend Tech Stack](#backend-tech-stack)
4. [Frontend Tech Stack](#frontend-tech-stack)
5. [Database Schema](#database-schema)
6. [File Structure](#file-structure)
7. [Getting Started](#getting-started)

---

## Software Purpose

**Harken CRE** is a **multi-tenant SaaS platform for commercial real estate valuation** that enables appraisal firms to create professional property valuations and manage comparable properties.

### Core Functionality

#### 1. Comparable Property Management
- Store and search commercial, residential, and land sales/lease comparables
- Geographic search with clustering and map visualization
- PDF import with AI extraction of property data
- Image upload and management for each comp
- Utility and zoning tracking

#### 2. Appraisal Creation (USPAP-Compliant)
- Commercial and land appraisals only (no residential appraisals)
- Multi-approach valuation (Sales, Income, Cost, Lease, Rent Roll)
- Comparable selection and adjustment calculations
- Map boundary drawing and aerial maps
- Photo pages and exhibits management
- PDF report generation with customizable templates

#### 3. Evaluation Creation (Non-USPAP)
- **Commercial evaluations**: 7 approaches (Sales, Income, Cost, Lease, Cap, Multi-Family, Rent Roll)
- **Residential evaluations**: 3 approaches (Sales, Income, Cost)
- **Land evaluations**: 2 approaches (Sales, Cost)
- Multi-scenario support (As-Is, As-Completed, As-Stabilized, etc.)
- Approach reconciliation with weighting
- Template-based report generation

#### 4. Multi-Tenant Account Management
- Account-level isolation
- User management with role-based permissions
- Client/company management
- Template management (System/Account/Personal tiers)

#### 5. Report Generation
- EJS-based HTML templates
- Pandoc conversion to PDF
- Merge field system
- Image and map integration
- Customizable sections per template

---

## Project Architecture

### Monorepo Structure
```
Harken-v2/
├── packages/
│   ├── backend/           # Node.js/Express backend
│   └── frontend/          # React frontend
├── migrations/            # Database migrations
└── package.json           # Root workspace config
```

### Technology Overview
- **Monorepo**: Lerna + npm workspaces
- **Backend**: Node.js 18+, Express, TypeScript, Sequelize, MySQL
- **Frontend**: React 18, TypeScript, Vite, Material UI, Tailwind
- **Database**: MySQL with 123 tables
- **Cloud**: AWS S3 for file storage

---

## Backend Tech Stack

### Runtime & Framework
- **Node.js** (>=18.0.0)
- **Express** ^4.18.2
- **TypeScript** (full implementation)

### Database & ORM
```json
"sequelize": "^6.37.3"
"mysql2": "^3.11.3"
```
- MySQL relational database
- 123 Sequelize models
- Database migrations via `sequelize-cli`

### Authentication & Security
```json
"jsonwebtoken": "9.0.2"
"bcrypt": "5.1.1"
"cors": "^2.8.5"
```
- JWT-based authentication
- Role-based authorization (SUPER_ADMINISTRATOR, ADMINISTRATOR, USER, DEV)
- Password hashing with bcrypt

### File Storage & Processing
```json
"aws-sdk": "^2.1569.0"
"multer": "^1.4.5-lts.1"
"sharp": "^0.33.5"
```
- AWS S3 for cloud storage
- Multer for file uploads
- Sharp for image processing/optimization

### AI & External Services
```json
"@google/generative-ai": "^0.22.0"
"pdf-parse": "^1.1.1"
"puppeteer": "^24.12.1"
```
- Google Gemini AI for comp selection and adjustments
- PDF parsing for data extraction
- Puppeteer for browser automation

### Email & Templates
```json
"nodemailer": "6.9.9"
"mjml": "^4.15.3"
"handlebars": "4.7.8"
```
- Nodemailer with Postmark transport
- MJML for responsive emails
- Handlebars for email templates

### Validation & Utilities
```json
"joi": "^17.11.0"
"moment-timezone": "^0.5.44"
"lodash": "^4.17.21"
"compression": "^1.7.4"
```
- Joi for schema validation
- Moment for date/time handling
- Lodash for utilities
- Compression middleware

### Logging
```json
"winston": "^3.13.0"
```
- Winston for structured logging

---

## Frontend Tech Stack

### Core Framework
```json
"react": "^18.2.0"
"react-dom": "^18.2.0"
"typescript": "^5.2.2"
"vite": "^5.0.8"
```
- React 18 with TypeScript
- Vite for fast development and builds

### UI Libraries
```json
"@mui/material": "^5.15.6"
"@mui/icons-material": "^5.15.6"
"antd": "^5.24.5"
"tailwindcss": "^3.4.1"
"@emotion/react": "^11.11.3"
"@emotion/styled": "^11.11.0"
```
- Material UI (primary component library)
- Ant Design (supplementary components)
- Tailwind CSS (utility classes)
- Emotion (CSS-in-JS)

### State Management
```json
"@reduxjs/toolkit": "^2.8.2"
"react-redux": "^9.2.0"
"redux-persist": "^6.0.0"
"zustand": "^5.0.6"
"react-query": "^3.39.3"
"@tanstack/react-query": "^5.76.0"
```
- Redux Toolkit for global state
- Redux Persist for localStorage
- React Query for server state caching
- Zustand for lightweight state

### Forms & Validation
```json
"formik": "2.4.5"
"yup": "1.3.3"
```
- Formik for complex multi-step forms
- Yup for validation schemas

### Routing
```json
"react-router-dom": "6.22.0"
```
- React Router v6 with nested routes
- Private route guards

### HTTP Client
```json
"axios": "^1.6.7"
```
- Axios with interceptors
- Centralized API client

### Maps & Geolocation
```json
"@react-google-maps/api": "^2.20.5"
"google-maps-react-markers": "2.0.8"
"leaflet": "1.9.4"
"leaflet.markercluster": "1.5.3"
```
- Google Maps JavaScript API
- Leaflet (alternative mapping)
- Marker clustering

### Rich Text Editors
```json
"@tinymce/tinymce-react": "^5.1.1"
"tinymce": "^7.6.1"
"react-quill": "^2.0.0"
```
- TinyMCE for report editing
- Quill for simpler text editing

### Drag & Drop
```json
"@dnd-kit/core": "^6.3.1"
"@dnd-kit/sortable": "^10.0.0"
"react-movable": "^3.4.0"
```
- Drag and drop for image reordering
- Sortable lists for exhibits

### Image Handling
```json
"react-image-crop": "^8.6.4"
"react-images-uploading": "^3.1.7"
"browser-image-compression": "^2.0.2"
```
- Image cropping
- Multi-image upload
- Client-side compression

### UI Enhancements
```json
"react-icons": "^5.0.1"
"react-toastify": "^11.0.3"
"react-window": "^1.8.11"
"framer-motion": "^11.0.0"
"react-color": "^2.19.3"
```
- Icon library
- Toast notifications
- Virtual scrolling (performance)
- Animations
- Color picker

### Date & Time
```json
"@mui/x-date-pickers": "^7.25.0"
"dayjs": "1.11.10"
```

### Utilities
```json
"lodash": "^4.17.21"
"dompurify": "^3.1.7"
"autosuggest-highlight": "^3.3.4"
```

---

## Database Schema

### Overview
- **123 total tables** in production
- Multi-tenant architecture with `account_id` isolation
- Separate tables for residential vs commercial properties

### Key Table Groups

#### Comps (Comparable Properties)
- `comps` - Commercial and land comparables
- `res_comps` - Residential comparables
- `comps_included_utilities`
- `zoning`
- `res_zoning`

#### Appraisals (Commercial/Land Only)
- `appraisals` - Main appraisal table
- `appraisal_approaches` - Approach configuration
- `appraisal_sales_approaches`
- `appraisal_income_approaches`
- `appraisal_cost_approaches`
- `appraisal_lease_approach`
- `appraisal_sales_approach_comps`
- `appraisal_sales_approach_comp_adj` - Adjustments
- `appraisal_income_approach_op_exp` - Operating expenses
- `appraisal_cost_approach_improvements`
- `appraisal_files` - Exhibits
- `appraisal_photo_pages`

#### Evaluations (Commercial/Land)
- `evaluations` - Main evaluation table
- `evaluation_sales_approaches`
- `evaluation_income_approaches`
- `evaluation_cost_approaches`
- `evaluation_lease_approach`
- `evaluation_cap_approaches`
- `evaluation_multi_family_approaches`
- `evaluation_scenario` - Multi-scenario support
- `eval_sales_approach_comps`
- `eval_cost_approach_comps`
- `eval_lease_approach_comps`
- `eval_cap_approach_comps`
- `eval_multi_family_approach_comps`
- `evaluation_files`
- `evaluation_photo_pages`

#### Residential Evaluations (Separate Tables)
- `res_evaluations` - Main residential table
- `res_evaluation_sales_approaches`
- `res_evaluation_income_approaches`
- `res_evaluation_cost_approaches`
- `res_evaluation_scenario`
- `res_eval_sales_approach_comps`
- `res_eval_cost_approach_comps`
- `res_evaluation_amenities`
- `res_evaluation_files`

#### Templates & Reports
- `template`
- `template_configuration`
- `template_scenarios`
- `sections`
- `section_item`

#### Users & Accounts
- `users`
- `accounts`
- `clients`
- `tokens`
- `company`

#### Global Codes (Dropdowns)
- `global_code_categories`
- `global_codes`

---

## File Structure

### Backend (`packages/backend/src/`)

```
packages/backend/src/
├── models/                    # 123 Sequelize models
│   ├── comps.sequelize.ts
│   ├── res_comps.sequelize.ts
│   ├── appraisals.sequelize.ts
│   ├── evaluations.sequelize.ts
│   ├── res_evaluations.sequelize.ts
│   ├── appraisal_sales_approaches.sequelize.ts
│   ├── evaluation_sales_approaches.sequelize.ts
│   ├── appraisal_income_approaches.sequelize.ts
│   ├── evaluation_income_approaches.sequelize.ts
│   ├── appraisal_cost_approaches.sequelize.ts
│   ├── evaluation_cost_approaches.sequelize.ts
│   ├── evaluation_cap_approaches.sequelize.ts
│   ├── evaluation_multi_family_approaches.sequelize.ts
│   ├── template.sequelize.ts
│   ├── template_scenarios.sequelize.ts
│   ├── users.sequelize.ts
│   ├── accounts.sequelize.ts
│   ├── clients.sequelize.ts
│   └── global_codes.sequelize.ts
│
├── services/                  # 283 service files (business logic)
│   ├── comps/
│   │   ├── comps.service.ts
│   │   ├── comps.store.ts
│   │   └── ICompsService.ts
│   ├── appraisals/
│   │   ├── appraisals.service.ts       # 11,329 lines
│   │   ├── appraisals.store.ts
│   │   └── IAppraisalsService.ts
│   ├── evaluations/
│   │   ├── evaluations.service.ts      # 8,881 lines
│   │   ├── evaluations.store.ts
│   │   └── IEvaluationsService.ts
│   ├── resEvaluations/
│   ├── appraisalSalesApproach/
│   ├── evaluationSaleApproach/
│   ├── appraisalIncomeApproach/
│   ├── evaluationIncomeApproach/
│   ├── appraisalCostApproach/
│   ├── evaluationCostApproach/
│   ├── evaluationLeaseApproach/
│   ├── evaluationCapApproach/
│   ├── evaluationMultiFamilyApproach/
│   ├── template/
│   ├── auth/
│   ├── user/
│   └── accounts/
│
├── routes/                    # 15 route modules
│   ├── comps.routes.ts
│   ├── appraisals.routes.ts
│   ├── evaluations.routes.ts
│   ├── resEvaluations.routes.ts
│   ├── residentialComp.routes.ts
│   ├── template.routes.ts
│   ├── auth.routes.ts
│   ├── user.routes.ts
│   ├── client.routes.ts
│   ├── accounts.routes.ts
│   └── admin.routes.ts
│
├── middleware/
│   ├── authenticate.ts        # JWT authentication
│   ├── authorize.ts           # Role-based access
│   └── common.ts              # Validation, error handling
│
├── utils/
│   ├── common/
│   │   ├── helper.ts
│   │   ├── reportHelpers.ts
│   │   ├── upload.ts          # S3 uploads
│   │   ├── openAI.ts          # AI integration
│   │   └── googlePlaces.ts
│   ├── enums/
│   │   ├── AppraisalsEnum.ts
│   │   ├── EvaluationsEnum.ts
│   │   ├── ResEvaluationsEnum.ts
│   │   ├── CompsEnum.ts
│   │   ├── TemplateEnum.ts
│   │   ├── RoleEnum.ts
│   │   └── StatusCodeEnum.ts
│   └── interfaces/
│       ├── common.ts
│       ├── IUser.ts
│       └── IZoning.ts
│
├── config/
│   └── db.ts                  # Sequelize config
│
└── templates/                 # Report templates
    ├── report/pages/          # 30 EJS templates (commercial)
    └── resReport/pages/       # 27 EJS templates (residential)
```

### Frontend (`packages/frontend/src/`)

```
packages/frontend/src/
├── pages/
│   ├── comps/                 # 65 files
│   │   ├── Listing/
│   │   │   ├── listing.tsx
│   │   │   ├── comps-table.tsx
│   │   │   ├── google-map.tsx
│   │   │   └── filter.tsx
│   │   ├── create-comp/
│   │   │   └── CreateComp.tsx
│   │   └── Update-comps/
│   │       └── UpdateComp.tsx
│   │
│   ├── appraisal/             # 130 files
│   │   ├── Listing/
│   │   │   └── index.tsx
│   │   ├── set-up/
│   │   │   └── Setup.tsx
│   │   ├── overview/
│   │   │   └── Overview.tsx
│   │   ├── sales/
│   │   │   └── sales-approach.tsx
│   │   ├── Income-Approch/
│   │   │   └── income.tsx
│   │   ├── overview/cost/
│   │   │   └── cost-approach.tsx
│   │   ├── overview/lease/
│   │   │   └── lease-approach.tsx
│   │   └── Report/
│   │       └── report.tsx
│   │
│   ├── evaluation/            # 256 files
│   │   ├── listing/
│   │   │   └── index.tsx
│   │   ├── set-up/
│   │   │   ├── evaluation-setup.tsx
│   │   │   └── residential-setup.tsx
│   │   ├── overview/          # 34 files
│   │   │   └── overview.tsx
│   │   ├── sales-approach/    # 16 files
│   │   ├── evaluation-income-approach/
│   │   ├── evaluation-cost-approach/
│   │   ├── evaluation-lease-approach/
│   │   ├── evaluation-cap-rate-approach/
│   │   ├── evaluation-multi-family-approach/
│   │   ├── evaluation-review/
│   │   │   └── evaluation-review.tsx
│   │   └── residential/
│   │       ├── residential-overview/
│   │       ├── residential-sales-approach/
│   │       ├── residential-income-approach/
│   │       ├── residential-cost-approach/
│   │       └── residential-review/
│   │
│   ├── account/               # Account management
│   ├── client/                # Client management
│   ├── login/                 # Authentication
│   ├── my-profile/            # User profile
│   └── Report/                # Template management
│
├── components/
│   ├── header/
│   │   └── index.tsx
│   ├── layout/
│   │   └── index.tsx
│   ├── modals/
│   ├── elements/
│   │   └── button/
│   ├── toast/
│   └── loader/
│
├── api/
│   ├── api-client.tsx         # Axios configuration
│   └── COMMON_URL.ts          # API endpoint constants
│
├── routing/
│   ├── Routes.tsx             # Main route configuration
│   └── PrivateRoute.tsx       # Authentication guards
│
├── utils/
│   ├── evaluationUtils.ts
│   ├── comps-helpers.ts
│   ├── commonFunctions.tsx
│   ├── storage.ts
│   └── validation-Schema.tsx
│
├── hook/
│   ├── useAuth.tsx
│   ├── useGet.tsx
│   └── useMutate.tsx
│
└── provider/
    ├── MuiProvider.tsx
    └── query.tsx
```

---

## Getting Started

### Prerequisites
- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **MySQL** database
- **Pandoc** (for PDF generation)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/HarkenCRE/Harken-v2.git
   cd Harken-v2
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   - Copy `.env.example` to `.env` in both backend and frontend
   - Configure database credentials
   - Add AWS S3 credentials
   - Add Google Maps API key
   - Add Google Gemini AI key

4. **Run database migrations**
   ```bash
   cd packages/backend
   export NODE_ENV=development
   npx sequelize-cli db:migrate
   npx sequelize-cli db:seed:all
   ```

5. **Start development servers**
   ```bash
   # From root directory
   npm start
   
   # Or run separately:
   npm run frontend  # Starts on http://localhost:5173
   npm run backend   # Starts on http://localhost:3000
   ```

### Development Workflow

**Backend:**
- Watch mode: `npm run start` (from packages/backend)
- Build: `npm run build`
- The backend auto-recompiles TypeScript on file changes

**Frontend:**
- Dev server: `npm run start` (from packages/frontend)
- Build: `npm run build`
- Vite provides hot module replacement

### Database Management

**Migrations:**
```bash
# Create migration
npx sequelize-cli migration:generate --name migration-name

# Run migrations
export NODE_ENV=development
npx sequelize-cli db:migrate

# Rollback
npx sequelize-cli db:migrate:undo
```

**Seeders:**
```bash
# Create seeder
npx sequelize-cli seed:generate --name seeder-name

# Run seeders
npx sequelize-cli db:seed:all
```

---

## API Architecture

### RESTful Endpoints

**Comps:**
- `POST /api/v1/comps/list` - Get comps with filtering
- `POST /api/v1/comps/create` - Create comp
- `GET /api/v1/comps/get/:id` - Get comp by ID
- `PATCH /api/v1/comps/update/:id` - Update comp
- `DELETE /api/v1/comps/delete/:id` - Delete comp

**Appraisals:**
- `POST /api/v1/appraisals/save-setup` - Create appraisal
- `GET /api/v1/appraisals/get/:id` - Get appraisal
- `PATCH /api/v1/appraisals/update-overview/:id` - Update overview
- `POST /api/v1/appraisals/save-sales-approach` - Save sales approach
- `POST /api/v1/appraisals/save-income-approach` - Save income approach
- `GET /api/v1/appraisals/download-report/:id` - Generate PDF

**Evaluations:**
- `POST /api/v1/evaluations/save-setup` - Create evaluation
- `GET /api/v1/evaluations/get/:id` - Get evaluation
- `POST /api/v1/evaluations/save-sales-approach` - Save sales approach
- `POST /api/v1/evaluations/save-income-approach` - Save income approach
- `POST /api/v1/evaluations/save-cap-approach` - Save cap approach
- `POST /api/v1/evaluations/save-multi-family-approach` - Save multi-family
- `GET /api/v1/evaluations/report-preview/:id` - Preview report

---

## Code Patterns

### Service/Store Pattern (Backend)

**Service Layer** (`*.service.ts`):
- Business logic
- Request validation (Joi)
- Response formatting
- Error handling

**Store Layer** (`*.store.ts`):
- Database operations
- Sequelize queries
- CRUD operations

**Interface Layer** (`I*.ts`):
- TypeScript interfaces
- Request/Response types

### Component Structure (Frontend)

- Feature-based organization
- Reusable components in `/components`
- Page-specific components in `/pages`
- Custom hooks in `/hook`
- API calls via React Query

---

## Key Concepts

### Property Types
- **Commercial**: `building_with_land`, building_size > 0
- **Residential**: Separate tables (`res_*`), has bedrooms/bathrooms
- **Land**: `land_only`, building_size = 0

### Valuation Approaches
- **Sales Comparison**: Comp selection + adjustments
- **Income**: PGI → EGI → NOI → Value (via cap rate)
- **Cost**: RCN - Depreciation + Land Value
- **Lease**: Market rent analysis
- **Cap**: Cap rate extraction from sales
- **Multi-Family**: GRM method
- **Rent Roll**: Unit-by-unit analysis

### Multi-Scenario Support
- As-Is, As-Completed, As-Stabilized, etc.
- Data inheritance between scenarios
- Comparison tables in reports

### Template System
- Three tiers: System, Account, Personal
- EJS templates with merge fields
- Customizable sections
- PDF generation via Pandoc

---

## Development Best Practices

1. **TypeScript**: Always use proper typing
2. **Validation**: Use Joi on backend, Yup on frontend
3. **Error Handling**: Use try/catch with proper error responses
4. **Code Quality**: Run ESLint and Prettier before commits
5. **Database**: Always create migrations for schema changes
6. **API**: Follow RESTful conventions
7. **Components**: Keep components small and reusable
8. **State**: Use React Query for server state, Redux for global UI state

---

## Support & Resources

- **Repository**: GitHub (private)
- **Documentation**: This file + inline code comments
- **Database Schema**: See migrations folder
- **API Docs**: Generated from route files

---

**Welcome to the Harken CRE development team!** 🚀








