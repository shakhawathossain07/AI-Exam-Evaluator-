import { useState, useCallback } from 'react';
import type { EvaluationResult, UploadedFile } from '../types';

interface EvaluationFormData {
  studentPaperFiles: UploadedFile[];
  markSchemeFiles: UploadedFile[];
  totalPossibleMarks: string;
  studentName: string;
  studentId: string;
  subject: string;
  examType: 'IELTS' | 'O-Level' | 'A-Level';
}

interface EvaluationState {
  formData: EvaluationFormData;
  results: EvaluationResult | null;
  evaluationId: string | null;
  showReview: boolean;
  isLoading: boolean;
  loadingMessage: string;
  error: string | null;
  isTransitioning: boolean;
  hasDraft: boolean;
  originalStudentPaperData: Record<string, unknown>[];
}

const initialFormData: EvaluationFormData = {
  studentPaperFiles: [],
  markSchemeFiles: [],
  totalPossibleMarks: '',
  studentName: '',
  studentId: '',
  subject: '',
  examType: 'O-Level'
};

const initialState: EvaluationState = {
  formData: initialFormData,
  results: null,
  evaluationId: null,
  showReview: false,
  isLoading: false,
  loadingMessage: '',
  error: null,
  isTransitioning: false,
  hasDraft: false,
  originalStudentPaperData: []
};

export function useEvaluationState() {
  const [state, setState] = useState<EvaluationState>(initialState);

  const updateFormData = useCallback((updates: Partial<EvaluationFormData>) => {
    setState(prev => ({
      ...prev,
      formData: { ...prev.formData, ...updates }
    }));
  }, []);

  const updateState = useCallback((updates: Partial<EvaluationState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const resetState = useCallback(() => {
    setState(initialState);
  }, []);

  return {
    state,
    updateFormData,
    updateState,
    resetState
  };
}