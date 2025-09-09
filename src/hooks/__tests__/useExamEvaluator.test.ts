import { renderHook, act } from '@testing-library/react';
import { useExamEvaluator } from '../useExamEvaluator';
import { EvaluationService } from '../../services/evaluationService';
import { useEvaluationAccess } from '../useEvaluationAccess';

// Mock dependencies
jest.mock('../../services/evaluationService');
jest.mock('../useEvaluationAccess');

const mockEvaluationService = EvaluationService as jest.Mocked<typeof EvaluationService>;
const mockUseEvaluationAccess = useEvaluationAccess as jest.MockedFunction<typeof useEvaluationAccess>;

describe('useExamEvaluator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mocks
    mockUseEvaluationAccess.mockReturnValue({
      canEvaluate: true,
      evaluationsRemaining: 5,
      isAdmin: false,
      message: 'You have 5 evaluations remaining',
      loading: false,
      refresh: jest.fn()
    });

    mockEvaluationService.hasDraft.mockReturnValue(false);
    mockEvaluationService.validateFormData.mockReturnValue(null);
  });

  describe('initialization', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useExamEvaluator());

      expect(result.current.formData).toEqual({
        studentPaperFiles: [],
        markSchemeFiles: [],
        totalPossibleMarks: '',
        studentName: '',
        studentId: '',
        subject: '',
        examType: 'O-Level',
        gradingCriteria: ''
      });

      expect(result.current.results).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should detect existing drafts', () => {
      mockEvaluationService.hasDraft.mockReturnValue(true);
      
      const { result } = renderHook(() => useExamEvaluator());
      
      expect(result.current.hasDraft).toBe(true);
    });
  });

  describe('form data updates', () => {
    it('should update form data correctly', () => {
      const { result } = renderHook(() => useExamEvaluator());

      act(() => {
        result.current.updateFormData({
          studentName: 'John Doe',
          examType: 'IELTS'
        });
      });

      expect(result.current.formData.studentName).toBe('John Doe');
      expect(result.current.formData.examType).toBe('IELTS');
    });
  });

  describe('evaluation process', () => {
    it('should handle successful evaluation', async () => {
      const mockResult = {
        evaluationId: 'eval-123',
        evaluation: { questions: [], summary: {} },
        originalStudentPaperFiles: []
      };

      mockEvaluationService.processEvaluation.mockResolvedValue(mockResult);

      const { result } = renderHook(() => useExamEvaluator());

      // Set up valid form data
      act(() => {
        result.current.updateFormData({
          studentPaperFiles: [{ id: '1', file: new File([''], 'test.pdf'), preview: '' }]
        });
      });

      await act(async () => {
        await result.current.handleEvaluate();
      });

      expect(result.current.results).toEqual(mockResult);
      expect(result.current.evaluationId).toBe('eval-123');
      expect(result.current.showReview).toBe(true);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should handle evaluation errors', async () => {
      const errorMessage = 'API Error';
      mockEvaluationService.processEvaluation.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useExamEvaluator());

      // Set up valid form data
      act(() => {
        result.current.updateFormData({
          studentPaperFiles: [{ id: '1', file: new File([''], 'test.pdf'), preview: '' }]
        });
      });

      await act(async () => {
        await result.current.handleEvaluate();
      });

      expect(result.current.error).toBe(errorMessage);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.results).toBeNull();
    });

    it('should prevent evaluation when access is denied', async () => {
      mockUseEvaluationAccess.mockReturnValue({
        canEvaluate: false,
        evaluationsRemaining: 0,
        isAdmin: false,
        message: 'No evaluations remaining',
        loading: false,
        refresh: jest.fn()
      });

      const { result } = renderHook(() => useExamEvaluator());

      await act(async () => {
        await result.current.handleEvaluate();
      });

      expect(result.current.error).toBe('No evaluations remaining');
      expect(mockEvaluationService.processEvaluation).not.toHaveBeenCalled();
    });

    it('should handle validation errors', async () => {
      const validationError = 'Please upload student paper';
      mockEvaluationService.validateFormData.mockReturnValue(validationError);

      const { result } = renderHook(() => useExamEvaluator());

      await act(async () => {
        await result.current.handleEvaluate();
      });

      expect(result.current.error).toBe(validationError);
      expect(mockEvaluationService.processEvaluation).not.toHaveBeenCalled();
    });
  });

  describe('draft management', () => {
    it('should load draft successfully', () => {
      const mockDraft = {
        results: { evaluationId: 'eval-123' },
        evaluationId: 'eval-123',
        studentInfo: {
          name: 'John Doe',
          id: 'student-123',
          subject: 'Math',
          examType: 'O-Level'
        }
      };

      mockEvaluationService.loadDraft.mockReturnValue(mockDraft);

      const { result } = renderHook(() => useExamEvaluator());

      act(() => {
        result.current.loadDraft();
      });

      expect(result.current.results).toEqual(mockDraft.results);
      expect(result.current.evaluationId).toBe('eval-123');
      expect(result.current.formData.studentName).toBe('John Doe');
      expect(result.current.showReview).toBe(true);
    });

    it('should clear draft', () => {
      const { result } = renderHook(() => useExamEvaluator());

      act(() => {
        result.current.clearDraft();
      });

      expect(mockEvaluationService.clearDraft).toHaveBeenCalled();
    });
  });

  describe('reset functionality', () => {
    it('should reset all state to initial values', () => {
      const { result } = renderHook(() => useExamEvaluator());

      // Set some state
      act(() => {
        result.current.updateFormData({ studentName: 'John Doe' });
      });

      // Reset
      act(() => {
        result.current.handleReset();
      });

      expect(result.current.formData.studentName).toBe('');
      expect(result.current.results).toBeNull();
      expect(result.current.error).toBeNull();
      expect(mockEvaluationService.clearDraft).toHaveBeenCalled();
    });
  });
});