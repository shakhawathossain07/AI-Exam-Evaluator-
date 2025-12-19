import { useState, useCallback } from 'react';
import type { EvaluationResult, UploadedFile } from '../types';

interface FormData {
  studentPaperFiles: UploadedFile[];
  markSchemeFiles: UploadedFile[];
  totalPossibleMarks: string;
  studentName: string;
  studentId: string;
  subject: string;
  examType: 'IELTS' | 'O-Level' | 'A-Level';
}

interface EvaluationState {
  isLoading: boolean;
  loadingMessage: string;
  error: string | null;
  results: EvaluationResult | null;
  showReview: boolean;
  evaluationId: string | null;
  originalStudentPaperData: Record<string, unknown>[];
}

export function useExamEvaluatorState() {
  // Form state
  const [formData, setFormData] = useState<FormData>({
    studentPaperFiles: [],
    markSchemeFiles: [],
    totalPossibleMarks: '',
    studentName: '',
    studentId: '',
    subject: '',
    examType: 'O-Level'
  });

  // Evaluation state
  const [evaluationState, setEvaluationState] = useState<EvaluationState>({
    isLoading: false,
    loadingMessage: '',
    error: null,
    results: null,
    showReview: false,
    evaluationId: null,
    originalStudentPaperData: []
  });

  const updateFormData = useCallback((updates: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  }, []);

  const updateEvaluationState = useCallback((updates: Partial<EvaluationState>) => {
    setEvaluationState(prev => ({ ...prev, ...updates }));
  }, []);

  const resetState = useCallback(() => {
    setFormData({
      studentPaperFiles: [],
      markSchemeFiles: [],
      totalPossibleMarks: '',
      studentName: '',
      studentId: '',
      subject: '',
      examType: 'O-Level'
    });
    setEvaluationState({
      isLoading: false,
      loadingMessage: '',
      error: null,
      results: null,
      showReview: false,
      evaluationId: null,
      originalStudentPaperData: []
    });
  }, []);

  return {
    formData,
    evaluationState,
    updateFormData,
    updateEvaluationState,
    resetState
  };
}