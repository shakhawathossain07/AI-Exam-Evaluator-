# Project Structure

## Root Directory
```
├── .env                    # Environment variables (not in git)
├── .env.example           # Environment template
├── package.json           # Dependencies and scripts
├── vite.config.ts         # Vite configuration with security settings
├── tailwind.config.js     # Tailwind CSS configuration
├── tsconfig.json          # TypeScript configuration (references)
├── eslint.config.js       # ESLint configuration
└── README.md              # Project documentation
```

## Source Code Organization (`src/`)

### Main Application Files
- `main.tsx` - Application entry point with React StrictMode
- `App.tsx` - Main app component with routing and lazy loading
- `index.css` - Global styles and Tailwind imports
- `vite-env.d.ts` - Vite type definitions

### Component Architecture (`src/components/`)
- **Lazy Loading**: Heavy components are lazy-loaded for performance
- **Error Boundaries**: Wrapped around main app for error handling
- **Suspense**: Used with fallback loading components

#### Key Components
- `AuthWrapper.tsx` - Authentication wrapper for protected routes
- `Navigation.tsx` - Main navigation with tab-based routing
- `Dashboard.tsx` - Main dashboard component
- `ExamEvaluator.tsx` - Core evaluation functionality
- `ResultsHistory.tsx` - Evaluation history management
- `Analytics.tsx` - Usage analytics and reporting
- `Settings.tsx` - Application settings
- `IGCSEGenerator.tsx` - IGCSE-specific functionality

#### Specialized Folders
- `igcse/` - IGCSE-specific components and logic

### Business Logic (`src/services/`)
- `api.ts` - API service layer for external integrations

### Data Layer (`src/lib/`)
- `supabase.ts` - Supabase client configuration and database types

### Custom Hooks (`src/hooks/`)
- `useEvaluationAccess.ts` - Access control for evaluations

### Type Definitions (`src/types/`)
- `index.ts` - Centralized TypeScript type definitions

### Utilities (`src/utils/`)
- `environment.ts` - Environment configuration helpers
- `errorHandler.ts` - Error handling utilities
- `pdfUtils.ts` - PDF processing utilities
- `performance.ts` - Performance monitoring
- `security.ts` - Security utilities
- `rateLimiting.ts` - Rate limiting implementation
- Production security files for code protection

### Static Data (`src/data/`)
- `igcse/` - IGCSE-specific data and configurations

## Backend (`supabase/`)
```
├── functions/             # Supabase Edge Functions
├── migrations/           # Database schema migrations
└── .temp/               # Temporary Supabase files
```

## Public Assets (`public/`)
- Static images (logos, photos)
- `favicon.ico` - Site favicon
- `sw.js` - Service worker
- `_redirects` - Netlify redirect rules

## Architecture Patterns

### Component Patterns
- **Lazy Loading**: Performance optimization for heavy components
- **Error Boundaries**: Graceful error handling
- **Compound Components**: Complex UI components broken into smaller parts
- **Custom Hooks**: Reusable stateful logic

### State Management
- **React State**: Local component state with useState
- **Context**: Authentication state via AuthWrapper
- **Supabase**: Server state management

### File Naming Conventions
- **Components**: PascalCase (e.g., `ExamEvaluator.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useEvaluationAccess.ts`)
- **Utils**: camelCase (e.g., `pdfUtils.ts`)
- **Types**: camelCase (e.g., `index.ts`)

### Import Organization
- External libraries first
- Internal components/utilities second
- Relative imports last
- Lazy imports for performance-critical components