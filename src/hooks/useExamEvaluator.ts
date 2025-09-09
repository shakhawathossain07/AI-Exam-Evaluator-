import { useState, useCallback } from 'react';
import { EvaluationService, type EvaluationFormData } from '../services/evaluationService';
import { useEvaluationAccess } from './useEvaluationAccess';
import type { EvaluationResult, UploadedFile } from '../types';

interface UseExamEvaluatorReturn {
  // State
  formData: EvaluationFormData;
  results: EvaluationResult | null;
  evaluationId: string | null;
  showReview: boolean;
  isLoading: boolean;
  loadingMessage: string;
  error: string | null;
  hasDraft: boolean;
  originalStudentPaperData: Record<string, unknown>[];
  
  // Actions
  updateFormData: (updates: Partial<EvaluationFormData>) => void;
  handleEvaluate: () => Promise<void>;
  handleSaveReview: (updatedResults: EvaluationResult) => Promise<void>;
  handleCancelReview: () => void;
  handleReset: () => void;
  loadDraft: () => void;
  clearDraft: () => void;
  
  // Access control
  canEvaluate: boolean;
  isAdmin: boolean;
  accessMessage: string;
  evaluationsRemaining: number;
  refreshAccess: () => void;
}

const initialFormData: EvaluationFormData = {
  studentPaperFiles: [],
  markSchemeFiles: [],
  totalPossibleMarks: '',
  studentName: '',
  studentId: '',
  subject: '',
  examType: 'O-Level',
  gradingCriteria: ''
};

export function useExamEvaluator(): UseExamEvaluatorReturn {
  // Access control
  const { 
    canEvaluate, 
    evaluationsRemaining, 
    isAdmin, 
    message: accessMessage, 
    refresh: refreshAccess 
  } = useEvaluationAccess();

  // Form state
  const [formData, setFormData] = useState<EvaluationFormData>(initialFormData);
  
  // Evaluation state
  const [results, setResults] = useState<EvaluationResult | null>(null);
  const [evaluationId, setEvaluationId] = useState<string | null>(null);
  const [showReview, setShowReview] = useState(false);
  const [originalStudentPaperData, setOriginalStudentPaperData] = useState<Record<string, unknown>[]>([]);
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [hasDraft, setHasDraft] = useState(EvaluationService.hasDraft());

  const updateFormData = useCallback((updates: Partial<EvaluationFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  }, []);

  const handleEvaluate = useCallback(async () => {
    // Validation
    if (!canEvaluate && !isAdmin) {
      setError(accessMessage || "You have reached your evaluation limit.");
      return;
    }

    const validationError = EvaluationService.validateFormData(formData);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError(null);
    setLoadingMessage('Preparing files for evaluation...');

    try {
      setLoadingMessage('AI is evaluating the exam paper...');
      const result = await EvaluationService.processEvaluation(formData);
      
      // Batch state updates
      setResults(result);
      setEvaluationId(result.evaluationId);
      
      if (result.originalStudentPaperFiles) {
        setOriginalStudentPaperData(result.originalStudentPaperFiles);
      }
      
      setShowReview(true);
      refreshAccess();
      
    } catch (err) {
      console.error('Evaluation error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, [formData, canEvaluate, isAdmin, accessMessage, refreshAccess]);

  const handleSaveReview = useCallback(async (updatedResults: EvaluationResult) => {
    if (!evaluationId) return;

    try {
      setLoadingMessage('Saving evaluation...');
      await EvaluationService.saveEvaluationResult(evaluationId, updatedResults);
      setResults(updatedResults);
      setShowReview(false);
      EvaluationService.clearDraft();
      setHasDraft(false);
    } catch (err) {
      console.error('Save error:', err);
      setError(err instanceof Error ? err.message : 'Failed to save evaluation');
    } finally {
      setLoadingMessage('');
    }
  }, [evaluationId]);

  const handleCancelReview = useCallback(() => {
    setShowReview(false);
  }, []);

  const handleReset = useCallback(() => {
    setFormData(initialFormData);
    setResults(null);
    setShowReview(false);
    setEvaluationId(null);
    setOriginalStudentPaperData([]);
    setError(null);
    EvaluationService.clearDraft();
    setHasDraft(false);
  }, []);

  const loadDraft = useCallback(() => {
    const draftData = EvaluationService.loadDraft();
    
    if (draftData) {
      setResults(draftData.results);
      setEvaluationId(draftData.evaluationId);
      
      if (draftData.studentInfo) {
        setFormData(prev => ({
          ...prev,
          studentName: draftData.studentInfo.name || '',
          studentId: draftData.studentInfo.id || '',
          subject: draftData.studentInfo.subject || '',
          examType: draftData.studentInfo.examType || 'O-Level'
        }));
      }
      
      setShowReview(true);
      setHasDraft(false);
    }
  }, []);

  const clearDraft = useCallback(() => {
    EvaluationService.clearDraft();
    setHasDraft(false);
  }, []);

  return {
    // State
    formData,
    results,
    evaluationId,
    showReview,
    isLoading,
    loadingMessage,
    error,
    hasDraft,
    originalStudentPaperData,
    
    // Actions
    updateFormData,
    handleEvaluate,
    handleSaveReview,
    handleCancelReview,
    handleReset,
    loadDraft,
    clearDraft,
    
    // Access control
    canEvaluate,
    isAdmin,
    accessMessage,
    evaluationsRemaining,
    refreshAccess
  };
}