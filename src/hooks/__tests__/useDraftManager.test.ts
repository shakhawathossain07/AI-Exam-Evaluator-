import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { useDraftManager } from '../useDraftManager';
import type { EvaluationResult, UploadedFile } from '../../types';

// Mock data for testing
const mockResults: EvaluationResult = {
  totalScore: 85,
  maxScore: 100,
  grades: { '1': { score: 10, maxScore: 10, comments: 'Good job' } },
  feedback: 'Well done',
};
const mockEvaluationId = 'eval-123';
const mockStudentInfo = {
  name: 'John Doe',
  id: 'student-456',
  subject: 'Math',
  examType: 'Final',
};
const mockStudentPaperFiles: UploadedFile[] = [
  { id: 'file-1', file: new File(['content'], 'paper.pdf', { type: 'application/pdf' }) },
];

const DRAFT_KEY = 'evaluation_draft';

describe('useDraftManager', () => {
  // Clear localStorage before each test
  beforeEach(() => {
    localStorage.clear();
  });

  it('should not change hasDraft to false after loading a draft', () => {
    const { result } = renderHook(() => useDraftManager());

    // 1. Save a draft
    act(() => {
      result.current.saveDraft(
        mockResults,
        mockEvaluationId,
        mockStudentInfo,
        mockStudentPaperFiles
      );
    });

    // Verify draft is saved and hasDraft is true
    expect(result.current.hasDraft).toBe(true);
    expect(localStorage.getItem(DRAFT_KEY)).not.toBeNull();

    // 2. Load the draft
    let loadedDraft;
    act(() => {
      loadedDraft = result.current.loadDraft();
    });

    // Verify draft data is loaded correctly
    expect(loadedDraft).not.toBeNull();
    expect(loadedDraft?.evaluationId).toBe(mockEvaluationId);

    // 3. Assert that hasDraft is still true (This is where it should fail)
    expect(result.current.hasDraft).toBe(true);
  });
});
