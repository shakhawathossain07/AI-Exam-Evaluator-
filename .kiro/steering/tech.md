# Technology Stack

## Frontend Framework
- **React 18** with TypeScript
- **Vite** as build tool and dev server
- **Tailwind CSS** for styling with custom gradient extensions
- **Framer Motion** for animations
- **Lucide React** for icons

## Backend & Database
- **Supabase** for database, authentication, and edge functions
- **PostgreSQL** database via Supabase
- **Row Level Security (RLS)** for data access control

## AI Integration
- **Google Gemini AI** for exam paper evaluation
- Custom API integration for AI processing

## PDF Processing
- **PDF.js (pdfjs-dist)** for PDF parsing and rendering
- **react-pdf** for PDF components
- **html2canvas** + **jspdf** for PDF generation and export

## Development Tools
- **ESLint** with TypeScript rules
- **PostCSS** with Autoprefixer
- **Terser** for production minification

## Common Commands

### Development
```bash
npm run dev          # Start development server (localhost:5173)
npm run build        # Production build with security optimizations
npm run preview      # Preview production build
npm run lint         # Run ESLint checks
```

### Environment Setup
```bash
cp .env.example .env # Copy environment template
# Configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
```

### Supabase Commands
```bash
# Run migrations (if using Supabase CLI)
supabase db push
# Deploy edge functions
supabase functions deploy
```

## Build Configuration

### Production Security Features
- **Code Obfuscation**: Terser with maximum compression
- **Source Maps**: Disabled in production
- **Console Removal**: All console statements stripped
- **Filename Obfuscation**: Hash-based asset names
- **Single Chunk**: Bundled for better obfuscation

### Development Optimizations
- **Hot Module Replacement**: Enabled via Vite
- **PDF.js Optimization**: Included in optimizeDeps
- **Strict Port**: Development server on port 5173

## Environment Variables
- `VITE_SUPABASE_URL`: Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Supabase anonymous key
- Debug mode: Add `?debug=true` to URL for debug components