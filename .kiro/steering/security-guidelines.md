---
inclusion: always
---

# Security Guidelines

## Authentication & Authorization

### Supabase Auth Requirements
- **ALWAYS** use Supabase authentication - never bypass auth checks
- **MANDATORY** Row Level Security (RLS) on all database tables
- Use `src/config/feedbackSecurity.ts` for security utilities
- Implement role-based access: `admin`, `educator`, `student`

### Permission Patterns
```typescript
// Use existing security utilities
import { checkUserPermission } from '@/config/feedbackSecurity';

const hasAccess = await checkUserPermission(userId, 'evaluation', 'read');
if (!hasAccess) throw new Error('Unauthorized');
```

## Input Validation & Sanitization

### Required Validation Pattern
```typescript
// Use Zod for all input validation
import { z } from 'zod';

const EvaluationSchema = z.object({
  studentId: z.string().uuid(),
  examType: z.enum(['IELTS', 'O_LEVEL', 'A_LEVEL', 'IGCSE']),
  totalMarks: z.number().positive().max(1000)
});

// ALWAYS validate before processing
const validatedInput = EvaluationSchema.parse(userInput);
```

### File Upload Security
- **Max file size**: 10MB for PDFs
- **Allowed types**: `application/pdf` only
- **REQUIRED**: Validate file headers, not just extensions
- Use `src/utils/security.ts` for file validation utilities

## API Security Standards

### Rate Limiting (MANDATORY)
- Evaluation endpoints: 10 requests/minute per user
- AI feedback generation: 5 requests/minute per user
- File uploads: 3 requests/minute per user
- Use `src/utils/rateLimiting.ts` implementation

### Error Handling Pattern
```typescript
// NEVER expose internal errors to clients
try {
  // operation
} catch (error) {
  logger.error('Internal error', { error, userId });
  throw new Error('Operation failed'); // Generic message only
}
```

## Data Protection

### Sensitive Data Rules
- **NEVER log**: passwords, API keys, student personal data
- **Encrypt at rest**: student names, email addresses, evaluation content
- **Environment variables**: All secrets in `.env` (never commit)
- **Data retention**: Auto-delete evaluations after 2 years

### Database Security
- Use Supabase RLS policies for all tables
- Parameterized queries only (Supabase handles this)
- No direct SQL in application code
- Regular backup encryption verification

## Frontend Security

### XSS Prevention
- **NEVER use** `dangerouslySetInnerHTML`
- Sanitize all user content before rendering
- Use React's built-in escaping (default behavior)
- Validate all dynamic content from AI responses

### Content Security Policy
```typescript
// Required CSP headers for production
'Content-Security-Policy': 
  "default-src 'self'; " +
  "script-src 'self' 'unsafe-inline'; " +
  "style-src 'self' 'unsafe-inline'; " +
  "img-src 'self' data: https:; " +
  "connect-src 'self' https://*.supabase.co https://generativelanguage.googleapis.com"
```

## AI Integration Security

### Gemini API Protection
- **Rate limiting**: Implement in `aiFeedbackEngine.ts`
- **Input sanitization**: Clean all text before sending to AI
- **Response validation**: Validate AI responses before storing
- **API key rotation**: Monthly rotation schedule

### Prompt Injection Prevention
```typescript
// Sanitize inputs to prevent prompt injection
const sanitizeForAI = (input: string) => {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML
    .replace(/\n{3,}/g, '\n\n') // Limit newlines
    .substring(0, 10000); // Limit length
};
```

## Production Security Checklist

### Deployment Requirements
- [ ] All environment variables configured
- [ ] Debug mode disabled (`NODE_ENV=production`)
- [ ] Source maps disabled in production build
- [ ] Security headers enabled (HSTS, X-Frame-Options)
- [ ] HTTPS enforced
- [ ] Dependency vulnerability scan passed

### Monitoring Requirements
- Log authentication failures
- Monitor API rate limit violations
- Track file upload attempts and failures
- Alert on suspicious user behavior patterns

## Security Testing

### Required Test Coverage
```typescript
// Security tests for all services
describe('Security', () => {
  it('rejects unauthenticated requests', async () => {
    // Test implementation
  });
  
  it('validates file upload types', async () => {
    // Test malicious file uploads
  });
  
  it('prevents SQL injection', async () => {
    // Test with malicious inputs
  });
});
```

### Code Review Security Checklist
- [ ] No hardcoded secrets or credentials
- [ ] All user inputs validated with Zod schemas
- [ ] Authentication checks on protected routes
- [ ] Rate limiting implemented on API endpoints
- [ ] Error messages don't expose internal details
- [ ] File uploads properly validated
- [ ] AI inputs sanitized for prompt injection