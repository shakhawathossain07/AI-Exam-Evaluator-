---
inclusion: always
---

# Project Structure & Architecture Guidelines

## Core Service Layer (`src/services/`)

### Required Services
- `evaluationService.ts` - Core exam evaluation logic and AI integration
- `feedbackService.ts` - Feedback management and teacher workflow
- `aiFeedbackEngine.ts` - AI-powered feedback generation engine
- `api.ts` - External API integrations

### Service Implementation Rules
- All services MUST implement proper error handling with try/catch
- Use `src/config/feedbackSecurity.ts` for security utilities
- Implement rate limiting for AI API calls
- Follow async/await patterns consistently

## Component Architecture (`src/components/`)

### Mandatory Lazy Loading Pattern
```typescript
// ALWAYS use this pattern for heavy components
const ExamEvaluator = lazy(() => import('./ExamEvaluator'));
const Analytics = lazy(() => import('./Analytics'));
const IGCSEGenerator = lazy(() => import('./IGCSEGenerator'));

// ALWAYS wrap in Suspense with meaningful fallback
<Suspense fallback={<div className="animate-pulse">Loading...</div>}>
  <ExamEvaluator />
</Suspense>
```

### Component Organization Rules
- Place components in `src/components/` with PascalCase naming
- Use `src/components/igcse/` for IGCSE-specific features
- Implement error boundaries for all major feature components
- Use compound component pattern for complex UI elements

## Type System (`src/types/`)

### Required Type Files
- `feedback.ts` - Feedback system types (MUST use for all feedback features)
- `index.ts` - Core application types
- Use TypeScript interfaces, not type aliases for object shapes

### Type Implementation Rules
```typescript
// Use Zod schemas for runtime validation
import { z } from 'zod';

const EvaluationSchema = z.object({
  studentId: z.string().uuid(),
  examType: z.enum(['IELTS', 'O_LEVEL', 'A_LEVEL', 'IGCSE']),
  totalMarks: z.number().positive()
});
```

## Configuration Layer (`src/config/`)

### Security Configuration
- `feedbackSecurity.ts` - Security utilities and permission checks
- ALWAYS use `checkUserPermission()` for access control
- Implement role-based access: `admin`, `educator`, `student`

### Required Security Pattern
```typescript
import { checkUserPermission } from '@/config/feedbackSecurity';

const hasAccess = await checkUserPermission(userId, 'evaluation', 'read');
if (!hasAccess) throw new Error('Unauthorized');
```

## Database Layer (`supabase/`)

### Migration Rules
- Place all schema changes in `supabase/migrations/`
- Use descriptive migration names with timestamps
- ALWAYS implement Row Level Security (RLS) policies
- Include rollback instructions in migration comments

### Required RLS Pattern
```sql
-- Enable RLS on all tables
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;

-- Create policies for role-based access
CREATE POLICY "Users can view own evaluations" ON evaluations
  FOR SELECT USING (auth.uid() = student_id OR auth.uid() IN (
    SELECT user_id FROM user_roles WHERE role = 'admin'
  ));
```

## File Naming Conventions

### Strict Naming Rules
- **Components**: PascalCase (e.g., `ExamEvaluator.tsx`)
- **Services**: camelCase (e.g., `evaluationService.ts`)
- **Hooks**: camelCase with `use` prefix (e.g., `useEvaluationAccess.ts`)
- **Utils**: camelCase (e.g., `pdfUtils.ts`)
- **Types**: camelCase (e.g., `feedback.ts`)
- **Tests**: `*.test.ts` or `*.test.tsx`

## Import Organization Rules

### Required Import Order
```typescript
// 1. External libraries
import React, { lazy, Suspense } from 'react';
import { z } from 'zod';

// 2. Internal services and utilities
import { evaluationService } from '@/services/evaluationService';
import { checkUserPermission } from '@/config/feedbackSecurity';

// 3. Types
import type { EvaluationResult } from '@/types/feedback';

// 4. Relative imports last
import './ExamEvaluator.css';
```

## Testing Structure

### Test File Organization
- Unit tests: `src/**/__tests__/*.test.ts`
- Integration tests: `src/**/__tests__/integration/*.test.ts`
- Component tests: `src/components/**/__tests__/*.test.tsx`

### Required Test Patterns
```typescript
// Use descriptive test structure
describe('EvaluationService', () => {
  describe('evaluateExamPaper', () => {
    it('should return evaluation results for valid input', async () => {
      // Arrange, Act, Assert pattern
    });
  });
});
```

## Performance Requirements

### Bundle Splitting Rules
- Main bundle: < 250KB gzipped
- Individual chunks: < 100KB gzipped
- Use manual chunks for vendor libraries
- Lazy load all heavy components (ExamEvaluator, Analytics, IGCSEGenerator)

### Required Optimization Patterns
```typescript
// Memoize expensive calculations
const expensiveValue = useMemo(() => calculateScore(data), [data]);

// Use React.memo for frequently re-rendering components
export default React.memo(EvaluationCard);
```

## Error Handling Patterns

### Service Layer Error Handling
```typescript
try {
  const result = await aiService.evaluate(paper);
  return result;
} catch (error) {
  logger.error('Evaluation failed', { error, paperId });
  throw new Error('Evaluation failed'); // Generic message only
}
```

### Component Error Boundaries
- Wrap all major features in error boundaries
- Provide meaningful fallback UI
- Log errors for debugging without exposing internals