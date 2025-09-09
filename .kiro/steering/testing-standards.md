---
inclusion: always
---

# Testing Standards

## Core Testing Rules

### File Structure & Naming
- Unit tests: `src/**/__tests__/*.test.ts`
- Component tests: `src/components/**/__tests__/*.test.tsx`
- Integration tests: `src/**/__tests__/integration/*.test.ts`
- Test files: `ComponentName.test.tsx` or `serviceName.test.ts`

### Required Testing Pattern
```typescript
describe('ServiceName', () => {
  describe('methodName', () => {
    it('should [expected behavior] when [condition]', async () => {
      // Arrange
      const mockInput = createMockData();
      
      // Act
      const result = await service.method(mockInput);
      
      // Assert
      expect(result).toMatchObject(expectedShape);
    });
  });
});
```

## Service Testing Requirements

### Core Services Must Test
- `evaluationService`: AI evaluation logic, error handling, rate limiting
- `feedbackService`: CRUD operations, permission checks, validation
- `aiFeedbackEngine`: AI integration, response validation, caching

### Required Test Coverage
```typescript
// Test authentication and authorization
it('should reject unauthenticated requests', async () => {
  await expect(service.method()).rejects.toThrow('Unauthorized');
});

// Test input validation
it('should validate input with Zod schema', async () => {
  const invalidInput = { invalid: 'data' };
  await expect(service.method(invalidInput)).rejects.toThrow();
});

// Test error handling
it('should handle AI API failures gracefully', async () => {
  mockAIService.mockRejectedValue(new Error('API Error'));
  const result = await service.evaluate(validInput);
  expect(result.error).toBeDefined();
});
```

## Component Testing Standards

### React Testing Library Pattern
```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from '@/test-utils/testUtils';

describe('ExamEvaluator', () => {
  it('should handle file upload and display results', async () => {
    renderWithProviders(<ExamEvaluator />);
    
    const fileInput = screen.getByLabelText(/upload/i);
    fireEvent.change(fileInput, { target: { files: [mockPdfFile] } });
    
    await waitFor(() => {
      expect(screen.getByText(/evaluation complete/i)).toBeInTheDocument();
    });
  });
});
```

### Required Component Tests
- User interactions (upload, submit, edit)
- Loading and error states
- Accessibility (keyboard navigation, screen readers)
- Permission-based rendering

## Mock Data & Utilities

### Standard Mock Factories
```typescript
// src/test-utils/mockData.ts
export const createMockEvaluation = (overrides = {}) => ({
  id: 'eval-123',
  studentId: 'student-456',
  examType: 'IELTS' as const,
  overallScore: 85,
  totalMarks: 100,
  createdAt: new Date().toISOString(),
  ...overrides
});

export const createMockUser = (role = 'educator') => ({
  id: 'user-123',
  email: 'test@example.com',
  role,
  permissions: getDefaultPermissions(role)
});
```

### Test Providers
```typescript
// src/test-utils/testUtils.tsx
export const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <AuthProvider>
      <QueryClientProvider client={testQueryClient}>
        {ui}
      </QueryClientProvider>
    </AuthProvider>
  );
};
```

## Security Testing Requirements

### Authentication Tests
```typescript
// Test all protected endpoints
it('should require authentication for evaluation creation', async () => {
  const response = await request(app)
    .post('/api/evaluations')
    .send(validEvaluationData);
  expect(response.status).toBe(401);
});

// Test role-based access
it('should allow admin access to user management', async () => {
  const adminToken = await getAuthToken('admin');
  const response = await request(app)
    .get('/api/admin/users')
    .set('Authorization', `Bearer ${adminToken}`);
  expect(response.status).toBe(200);
});
```

### Input Validation Tests
```typescript
// Test Zod schema validation
it('should reject invalid evaluation data', async () => {
  const invalidData = { examType: 'INVALID_TYPE' };
  await expect(evaluationService.create(invalidData))
    .rejects.toThrow('Validation failed');
});
```

## Performance & Integration Testing

### Database Tests
- Use test database with cleanup between tests
- Test RLS policies with different user roles
- Verify query performance with realistic data volumes

### AI Integration Tests
```typescript
// Mock AI responses for consistent testing
beforeEach(() => {
  mockGeminiAPI.mockResolvedValue({
    evaluation: { score: 85, feedback: 'Good work' },
    confidence: 0.9
  });
});

it('should handle AI API rate limiting', async () => {
  mockGeminiAPI.mockRejectedValue(new Error('Rate limit exceeded'));
  const result = await aiFeedbackEngine.generateFeedback(input);
  expect(result.error).toContain('rate limit');
});
```

## Test Commands & CI

### Essential Commands
```bash
npm test                    # Run all tests
npm run test:coverage      # Coverage report (>80% required)
npm run test:integration   # Integration tests only
npm test -- --watch       # Watch mode for development
```

### CI Requirements
- All tests pass before merge
- Coverage threshold: 80% for services, 70% for components
- Performance tests for PDF processing (<30s for 20 pages)
- Security tests for authentication and authorization

## Quality Metrics
- Unit test execution: <30 seconds total
- Integration tests: <2 minutes total
- Flaky test rate: <1%
- Test maintenance: Review and refactor quarterly