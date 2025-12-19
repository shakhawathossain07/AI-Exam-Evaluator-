# Testing Standards and Guidelines

## Testing Philosophy
- Write tests first (TDD approach when possible)
- Aim for high test coverage (>80% for critical paths)
- Focus on testing behavior, not implementation details
- Maintain fast, reliable, and independent tests

## Test Structure

### Unit Tests
**Location**: `src/**/__tests__/*.test.ts`

**Naming Convention**:
- Test files: `ComponentName.test.tsx` or `serviceName.test.ts`
- Test descriptions: Use descriptive "should" statements
- Test groups: Use `describe` blocks for logical grouping

**Example Structure**:
```typescript
describe('EvaluationService', () => {
  describe('evaluateExamPaper', () => {
    it('should return evaluation results for valid input', async () => {
      // Arrange
      const mockInput = createMockEvaluationInput();
      
      // Act
      const result = await evaluationService.evaluateExamPaper(mockInput);
      
      // Assert
      expect(result).toMatchObject({
        overallScore: expect.any(Number),
        questionResults: expect.any(Array)
      });
    });
  });
});
```

### Integration Tests
**Location**: `src/**/__tests__/integration/*.test.ts`

**Focus Areas**:
- API endpoint testing
- Database operations
- External service integrations
- Complete user workflows

### Component Tests
**Location**: `src/components/**/__tests__/*.test.tsx`

**Testing Approach**:
- Use React Testing Library
- Test user interactions and accessibility
- Mock external dependencies
- Test error states and edge cases

**Example**:
```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ExamEvaluator } from '../ExamEvaluator';

describe('ExamEvaluator', () => {
  it('should display evaluation results after successful submission', async () => {
    render(<ExamEvaluator />);
    
    const fileInput = screen.getByLabelText(/upload exam paper/i);
    const submitButton = screen.getByRole('button', { name: /evaluate/i });
    
    fireEvent.change(fileInput, { target: { files: [mockPdfFile] } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/evaluation complete/i)).toBeInTheDocument();
    });
  });
});
```

## Mocking Guidelines

### Service Mocks
- Create reusable mock factories
- Mock external APIs and services
- Use MSW (Mock Service Worker) for API mocking
- Provide realistic mock data

### Database Mocks
- Use in-memory databases for testing
- Create test data fixtures
- Clean up data between tests
- Test both success and failure scenarios

## Test Data Management

### Mock Data Creation
```typescript
// src/test-utils/mockData.ts
export const createMockEvaluation = (overrides = {}) => ({
  id: 'eval-123',
  studentId: 'student-456',
  examType: 'IELTS',
  overallScore: 85,
  totalMarks: 100,
  ...overrides
});
```

### Test Utilities
```typescript
// src/test-utils/testUtils.tsx
export const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <AuthProvider>
      <QueryClient>
        {ui}
      </QueryClient>
    </AuthProvider>
  );
};
```

## Performance Testing
- Test component rendering performance
- Monitor API response times
- Test with large datasets
- Identify memory leaks

## Accessibility Testing
- Use jest-axe for automated a11y testing
- Test keyboard navigation
- Verify screen reader compatibility
- Test color contrast and visual accessibility

## Test Commands
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- ExamEvaluator.test.tsx

# Run integration tests only
npm run test:integration

# Run tests for changed files only
npm run test:changed
```

## Continuous Integration
- All tests must pass before merging
- Maintain minimum coverage thresholds
- Run tests on multiple Node.js versions
- Include performance regression testing

## Test Quality Metrics
- Code coverage: >80% for critical paths
- Test execution time: <30 seconds for unit tests
- Test reliability: <1% flaky test rate
- Test maintainability: Regular test refactoring