import type { EvaluationResult, UploadedFile } from './index';

export interface EvaluatorFormData {
  readonly studentPaperFiles: UploadedFile[];
  readonly markSchemeFiles: UploadedFile[];
  readonly totalPossibleMarks: string;
  readonly studentName: string;
  readonly studentId: string;
  readonly subject: string;
  readonly examType: ExamType;
}

export type ExamType = 'IELTS' | 'O-Level' | 'A-Level';

export interface EvaluatorState {
  readonly formData: EvaluatorFormData;
  readonly results: EvaluationResult | null;
  readonly evaluationId: string | null;
  readonly showReview: boolean;
  readonly isLoading: boolean;
  readonly loadingMessage: string;
  readonly error: string | null;
  readonly hasDraft: boolean;
  readonly originalStudentPaperData: readonly Record<string, unknown>[];
}

export interface EvaluatorActions {
  readonly updateFormData: (updates: Partial<EvaluatorFormData>) => void;
  readonly handleEvaluate: () => Promise<void>;
  readonly handleSaveReview: (updatedResults: EvaluationResult) => Promise<void>;
  readonly handleCancelReview: () => void;
  readonly handleReset: () => void;
  readonly loadDraft: () => void;
  readonly clearDraft: () => void;
}

export interface AccessControlState {
  readonly canEvaluate: boolean;
  readonly isAdmin: boolean;
  readonly accessMessage: string;
  readonly evaluationsRemaining: number;
  readonly refreshAccess: () => void;
}

export interface DraftData {
  readonly results: EvaluationResult;
  readonly evaluationId: string;
  readonly studentInfo: {
    readonly name: string;
    readonly id: string;
    readonly subject: string;
    readonly examType: string;
  };
  readonly studentPaperFiles: readonly {
    readonly id: string;
    readonly name: string;
    readonly type: string;
    readonly size: number;
  }[];
  readonly timestamp: string;
}

// Error types for better error handling
export enum EvaluatorErrorType {
  VALIDATION_ERROR = 'validation_error',
  ACCESS_DENIED = 'access_denied',
  API_ERROR = 'api_error',
  NETWORK_ERROR = 'network_error',
  UNKNOWN_ERROR = 'unknown_error'
}

export interface EvaluatorError {
  readonly type: EvaluatorErrorType;
  readonly message: string;
  readonly details?: Record<string, unknown>;
  readonly retryable: boolean;
}