import { useReducer, useCallback } from 'react';
import type { EvaluationResult, UploadedFile } from '../types';

interface EvaluatorState {
  // Form data
  studentPaperFiles: UploadedFile[];
  markSchemeFiles: UploadedFile[];
  totalPossibleMarks: string;
  studentName: string;
  studentId: string;
  subject: string;
  examType: 'IELTS' | 'O-Level' | 'A-Level';
  
  // Evaluation state
  results: EvaluationResult | null;
  evaluationId: string | null;
  showReview: boolean;
  originalStudentPaperData: Record<string, unknown>[];
  
  // UI state
  isLoading: boolean;
  loadingMessage: string;
  error: string | null;
  hasDraft: boolean;
}

type EvaluatorAction =
  | { type: 'UPDATE_FORM_FIELD'; field: keyof EvaluatorState; value: any }
  | { type: 'SET_LOADING'; isLoading: boolean; message?: string }
  | { type: 'SET_ERROR'; error: string | null }
  | { type: 'SET_RESULTS'; results: EvaluationResult; evaluationId: string }
  | { type: 'SET_REVIEW_MODE'; showReview: boolean }
  | { type: 'RESET_STATE' }
  | { type: 'LOAD_DRAFT'; draftData: any };

const initialState: EvaluatorState = {
  studentPaperFiles: [],
  markSchemeFiles: [],
  totalPossibleMarks: '',
  studentName: '',
  studentId: '',
  subject: '',
  examType: 'O-Level',
  results: null,
  evaluationId: null,
  showReview: false,
  originalStudentPaperData: [],
  isLoading: false,
  loadingMessage: '',
  error: null,
  hasDraft: false
};

function evaluatorReducer(state: EvaluatorState, action: EvaluatorAction): EvaluatorState {
  switch (action.type) {
    case 'UPDATE_FORM_FIELD':
      return {
        ...state,
        [action.field]: action.value,
        error: null // Clear error when user makes changes
      };
      
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.isLoading,
        loadingMessage: action.message || '',
        error: action.isLoading ? null : state.error // Clear error when starting new operation
      };
      
    case 'SET_ERROR':
      return {
        ...state,
        error: action.error,
        isLoading: false,
        loadingMessage: ''
      };
      
    case 'SET_RESULTS':
      return {
        ...state,
        results: action.results,
        evaluationId: action.evaluationId,
        isLoading: false,
        loadingMessage: '',
        error: null
      };
      
    case 'SET_REVIEW_MODE':
      return {
        ...state,
        showReview: action.showReview
      };
      
    case 'RESET_STATE':
      return initialState;
      
    case 'LOAD_DRAFT':
      return {
        ...state,
        results: action.draftData.results,
        evaluationId: action.draftData.evaluationId,
        studentName: action.draftData.studentInfo?.name || '',
        studentId: action.draftData.studentInfo?.id || '',
        subject: action.draftData.studentInfo?.subject || '',
        examType: action.draftData.studentInfo?.examType || 'O-Level',
        showReview: true,
        hasDraft: false
      };
      
    default:
      return state;
  }
}

export function useEvaluatorReducer() {
  const [state, dispatch] = useReducer(evaluatorReducer, initialState);
  
  const updateFormField = useCallback((field: keyof EvaluatorState, value: any) => {
    dispatch({ type: 'UPDATE_FORM_FIELD', field, value });
  }, []);
  
  const setLoading = useCallback((isLoading: boolean, message?: string) => {
    dispatch({ type: 'SET_LOADING', isLoading, message });
  }, []);
  
  const setError = useCallback((error: string | null) => {
    dispatch({ type: 'SET_ERROR', error });
  }, []);
  
  const setResults = useCallback((results: EvaluationResult, evaluationId: string) => {
    dispatch({ type: 'SET_RESULTS', results, evaluationId });
  }, []);
  
  const setReviewMode = useCallback((showReview: boolean) => {
    dispatch({ type: 'SET_REVIEW_MODE', showReview });
  }, []);
  
  const resetState = useCallback(() => {
    dispatch({ type: 'RESET_STATE' });
  }, []);
  
  const loadDraft = useCallback((draftData: any) => {
    dispatch({ type: 'LOAD_DRAFT', draftData });
  }, []);
  
  return {
    state,
    actions: {
      updateFormField,
      setLoading,
      setError,
      setResults,
      setReviewMode,
      resetState,
      loadDraft
    }
  };
}