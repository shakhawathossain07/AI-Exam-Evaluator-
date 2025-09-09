import { useCallback } from 'react';
import { EvaluationService, type EvaluationFormData } from '../services/evaluationService';
import { EXAM_TYPE_CONFIGS } from '../constants/examTypes';
import type { EvaluationResult } from '../types';

interface UseEvaluationActionsProps {
  canEvaluate: boolean;
  isAdmin: boolean;
  accessMessage: string;
  onStateUpdate: (updates: Record<string, any>) => void;
  onError: (error: string) => void;
  onSuccess: (result: EvaluationResult) => void;
  refreshAccess: () => void;
}

export function useEvaluationActions({
  canEvaluate,
  isAdmin,
  accessMessage,
  onStateUpdate,
  onError,
  onSuccess,
  refreshAccess
}: UseEvaluationActionsProps) {

  const handleEvaluate = useCallback(async (formData: EvaluationFormData) => {
    try {
      // Validate access permissions
      if (!canEvaluate && !isAdmin) {
        onError(accessMessage || "You have reached your evaluation limit. Please contact an administrator.");
        return;
      }

      // Validate form data
      const validationError = EvaluationService.validateFormData(formData);
      if (validationError) {
        onError(validationError);
        return;
      }

      // Start loading state
      onStateUpdate({
        isLoading: true,
        error: null,
        loadingMessage: 'Preparing files for evaluation...'
      });

      // Add grading criteria to form data
      const formDataWithCriteria = {
        ...formData,
        gradingCriteria: EXAM_TYPE_CONFIGS[formData.examType].gradingCriteria
      };

      // Update loading message
      onStateUpdate({ loadingMessage: 'AI is evaluating the exam paper...' });
      
      // Process evaluation
      const result = await EvaluationService.processEvaluation(formDataWithCriteria);
      
      // Success callback
      onSuccess(result);
      
      // Refresh access status
      refreshAccess();
      
    } catch (err) {
      console.error('Evaluation error:', err);
      onError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      onStateUpdate({
        isLoading: false,
        loadingMessage: ''
      });
    }
  }, [canEvaluate, isAdmin, accessMessage, onStateUpdate, onError, onSuccess, refreshAccess]);

  const handleSaveReview = useCallback(async (
    evaluationId: string,
    updatedResults: EvaluationResult,
    onComplete: () => void
  ) => {
    if (!evaluationId) return;

    try {
      onStateUpdate({
        isTransitioning: true,
        loadingMessage: 'Saving evaluation...'
      });

      await EvaluationService.saveEvaluationResult(evaluationId, updatedResults);
      
      // Clear draft after successful save
      EvaluationService.clearDraft();
      
      onComplete();
      
    } catch (err) {
      console.error('Save error:', err);
      onError(err instanceof Error ? err.message : 'Failed to save evaluation');
    } finally {
      onStateUpdate({
        isTransitioning: false,
        loadingMessage: ''
      });
    }
  }, [onStateUpdate, onError]);

  const handleLoadDraft = useCallback(() => {
    const draftData = EvaluationService.loadDraft();
    
    if (draftData) {
      return {
        results: draftData.results,
        evaluationId: draftData.evaluationId,
        studentInfo: draftData.studentInfo || {},
        studentPaperFiles: draftData.studentPaperFiles || []
      };
    }
    
    return null;
  }, []);

  const handleClearDraft = useCallback(() => {
    EvaluationService.clearDraft();
  }, []);

  return {
    handleEvaluate,
    handleSaveReview,
    handleLoadDraft,
    handleClearDraft,
    hasDraft: EvaluationService.hasDraft()
  };
}