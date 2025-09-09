---
inclusion: always
---

# Technology Stack & Development Guidelines

## Core Stack

### Frontend (React 18 + TypeScript)
- **Vite** build tool (dev server on port 5173)
- **Tailwind CSS** with custom gradient extensions
- **Framer Motion** for animations
- **Lucide React** for icons
- **React PDF** for document handling

### Backend & Database
- **Supabase** for auth, database, and edge functions
- **PostgreSQL** with Row Level Security (RLS) enabled
- **Google Gemini AI** for exam evaluation

### PDF Processing Stack
- **PDF.js (pdfjs-dist)** for parsing and rendering
- **html2canvas + jspdf** for PDF generation

## Required Development Patterns

### Component Creation
```typescript
// Always use TypeScript with proper typing
import React from 'react';
import type { ComponentProps } from '@/types';

interface ExamEvaluatorProps {
  examId: string;
  onComplete: (result: EvaluationResult) => void;
}

export const ExamEvaluator: React.FC<ExamEvaluatorProps> = ({ examId, onComplete }) => {
  // Implementation
};
```

### Service Layer Pattern
```typescript
// All services must follow this error handling pattern
export class EvaluationService {
  async evaluateExam(data: ExamData): Promise<EvaluationResult> {
    try {
      const result = await this.processEvaluation(data);
      return result;
    } catch (error) {
      logger.error('Evaluation failed', { error, examId: data.id });
      throw new Error('Evaluation failed');
    }
  }
}
```

### Supabase Integration
```typescript
// Always use typed Supabase client
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

const supabase = createClient<Database>(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

// Always check auth before operations
const { data: user } = await supabase.auth.getUser();
if (!user) throw new Error('Unauthorized');
```

## Development Commands

### Essential Commands
```bash
npm run dev          # Start dev server (localhost:5173)
npm run build        # Production build with obfuscation
npm run preview      # Test production build
npm run lint         # ESLint with TypeScript rules
npm test             # Run test suite
```

### Environment Setup
```bash
cp .env.example .env
# Required: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
# Optional: Add ?debug=true to URL for debug mode
```

## Build Configuration Rules

### Vite Configuration
- PDF.js included in `optimizeDeps`
- Development server locked to port 5173
- Production builds use Terser for obfuscation
- Source maps disabled in production

### Bundle Requirements
- Main bundle: <250KB gzipped
- Lazy load heavy components (ExamEvaluator, Analytics)
- Manual chunks for vendor libraries

### Security Features (Production)
- Code obfuscation via Terser
- Console statements stripped
- Hash-based asset names
- Single chunk bundling

## File Organization Standards

### Import Order (Enforced)
```typescript
// 1. External libraries
import React from 'react';
import { z } from 'zod';

// 2. Internal services
import { evaluationService } from '@/services/evaluationService';

// 3. Types
import type { EvaluationResult } from '@/types/feedback';

// 4. Relative imports
import './Component.css';
```

### Required File Extensions
- Components: `.tsx`
- Services/Utils: `.ts`
- Tests: `.test.ts` or `.test.tsx`
- Types: `.ts` (in `src/types/`)

## Environment Variables

### Required Variables
- `VITE_SUPABASE_URL`: Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Supabase anonymous key

### Optional Variables
- Debug mode: Add `?debug=true` to URL for debug components

## Performance Requirements

### Lazy Loading (Mandatory)
```typescript
// Always lazy load heavy components
const ExamEvaluator = lazy(() => import('./ExamEvaluator'));

// Always wrap in Suspense
<Suspense fallback={<LoadingSpinner />}>
  <ExamEvaluator />
</Suspense>
```

### PDF Processing
- Max file size: 10MB
- Process in chunks for large files
- Clean up PDF.js resources after use

## AI Integration Guidelines

### Gemini API Usage
- Rate limit: 10 requests/minute per user
- Input sanitization required
- Response validation mandatory
- Cache responses for identical inputs