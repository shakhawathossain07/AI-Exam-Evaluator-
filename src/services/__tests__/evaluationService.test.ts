import { EvaluationService } from '../evaluationService';
import { evaluateExamPaper, saveEvaluation } from '../api';
import type { UploadedFile } from '../../types';

// Mock the API functions
jest.mock('../api', () => ({
  evaluateExamPaper: jest.fn(),
  saveEvaluation: jest.fn()
}));

const mockEvaluateExamPaper = evaluateExamPaper as jest.MockedFunction<typeof evaluateExamPaper>;
const mockSaveEvaluation = saveEvaluation as jest.MockedFunction<typeof saveEvaluation>;

describe('EvaluationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('validateFormData', () => {
    it('should return error when no student paper files provided', () => {
      const formData = {
        studentPaperFiles: [],
        markSchemeFiles: [],
        totalPossibleMarks: '100',
        studentName: 'John Doe',
        studentId: '12345',
        subject: 'Mathematics',
        examType: 'O-Level' as const,
        gradingCriteria: 'Cambridge O-Level grading'
      };

      const result = EvaluationService.validateFormData(formData);
      expect(result).toBe("Please upload the student's exam paper before evaluating.");
    });

    it('should return null for valid form data', () => {
      const mockFile: UploadedFile = {
        id: '1',
        file: new File(['test'], 'test.pdf', { type: 'application/pdf' }),
        preview: 'data:application/pdf;base64,test'
      };

      const formData = {
        studentPaperFiles: [mockFile],
        markSchemeFiles: [],
        totalPossibleMarks: '100',
        studentName: 'John Doe',
        studentId: '12345',
        subject: 'Mathematics',
        examType: 'O-Level' as const,
        gradingCriteria: 'Cambridge O-Level grading'
      };

      const result = EvaluationService.validateFormData(formData);
      expect(result).toBeNull();
    });
  });

  describe('draft management', () => {
    const mockDraftData = {
      results: { evaluationId: 'test-id' } as any,
      evaluationId: 'test-id',
      studentInfo: {
        name: 'John Doe',
        id: '12345',
        subject: 'Math',
        examType: 'O-Level'
      },
      studentPaperFiles: []
    };

    it('should save draft to localStorage', () => {
      EvaluationService.saveDraft(mockDraftData);
      
      const saved = localStorage.getItem('evaluation_draft');
      expect(saved).toBeTruthy();
      
      const parsed = JSON.parse(saved!);
      expect(parsed.evaluationId).toBe('test-id');
      expect(parsed.timestamp).toBeTruthy();
    });

    it('should load draft from localStorage', () => {
      EvaluationService.saveDraft(mockDraftData);
      
      const loaded = EvaluationService.loadDraft();
      expect(loaded).toBeTruthy();
      expect(loaded.evaluationId).toBe('test-id');
    });

    it('should clear draft from localStorage', () => {
      EvaluationService.saveDraft(mockDraftData);
      expect(EvaluationService.hasDraft()).toBe(true);
      
      EvaluationService.clearDraft();
      expect(EvaluationService.hasDraft()).toBe(false);
    });

    it('should handle corrupted draft data gracefully', () => {
      localStorage.setItem('evaluation_draft', 'invalid-json');
      
      const loaded = EvaluationService.loadDraft();
      expect(loaded).toBeNull();
      expect(EvaluationService.hasDraft()).toBe(false);
    });
  });

  describe('processEvaluation', () => {
    it('should call API with properly formatted FormData', async () => {
      const mockFile: UploadedFile = {
        id: '1',
        file: new File(['test'], 'test.pdf', { type: 'application/pdf' }),
        preview: 'data:application/pdf;base64,test'
      };

      const formData = {
        studentPaperFiles: [mockFile],
        markSchemeFiles: [],
        totalPossibleMarks: '100',
        studentName: 'John Doe',
        studentId: '12345',
        subject: 'Mathematics',
        examType: 'O-Level' as const,
        gradingCriteria: 'Cambridge O-Level grading'
      };

      const mockResult = { evaluationId: 'test-id' } as any;
      mockEvaluateExamPaper.mockResolvedValue(mockResult);

      const result = await EvaluationService.processEvaluation(formData);

      expect(mockEvaluateExamPaper).toHaveBeenCalledWith(expect.any(FormData));
      expect(result).toBe(mockResult);
    });
  });

  describe('base64ToFile', () => {
    it('should convert base64 string to File object', () => {
      const base64Data = btoa('test file content');
      const fileName = 'test.txt';
      const mimeType = 'text/plain';

      const file = EvaluationService.base64ToFile(base64Data, fileName, mimeType);

      expect(file).toBeInstanceOf(File);
      expect(file.name).toBe(fileName);
      expect(file.type).toBe(mimeType);
    });
  });
});