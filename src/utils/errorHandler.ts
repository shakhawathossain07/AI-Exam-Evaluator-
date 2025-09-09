import { EvaluatorError, EvaluatorErrorType } from '../types/evaluator';

export class EvaluatorErrorHandler {
  static createError(
    type: EvaluatorErrorType,
    message: string,
    details?: Record<string, unknown>
  ): EvaluatorError {
    return {
      type,
      message,
      details,
      retryable: this.isRetryable(type)
    };
  }

  static fromException(error: unknown): EvaluatorError {
    if (error instanceof Error) {
      const errorType = this.classifyError(error);
      const userMessage = this.getUserFriendlyMessage({ 
        type: errorType, 
        message: error.message,
        retryable: this.isRetryable(errorType)
      });
      
      return this.createError(
        errorType,
        userMessage,
        { originalError: error.message, stack: error.stack }
      );
    }

    return this.createError(
      EvaluatorErrorType.UNKNOWN_ERROR,
      'An unexpected error occurred',
      { originalError: String(error) }
    );
  }

  private static classifyError(error: Error): EvaluatorErrorType {
    const message = error.message.toLowerCase();
    
    // Network-related errors
    if (message.includes('fetch') || message.includes('network') || message.includes('connection')) {
      return EvaluatorErrorType.NETWORK_ERROR;
    }
    
    // Authentication/Authorization errors
    if (message.includes('401') || message.includes('403') || message.includes('unauthorized')) {
      return EvaluatorErrorType.ACCESS_DENIED;
    }
    
    // API service errors
    if (message.includes('api') || message.includes('500') || message.includes('502') || message.includes('503')) {
      return EvaluatorErrorType.API_ERROR;
    }
    
    // Validation errors
    if (message.includes('validation') || message.includes('invalid') || message.includes('required')) {
      return EvaluatorErrorType.VALIDATION_ERROR;
    }
    
    return EvaluatorErrorType.UNKNOWN_ERROR;
  }

  static isRetryable(type: EvaluatorErrorType): boolean {
    switch (type) {
      case EvaluatorErrorType.NETWORK_ERROR:
      case EvaluatorErrorType.API_ERROR:
        return true;
      case EvaluatorErrorType.VALIDATION_ERROR:
      case EvaluatorErrorType.ACCESS_DENIED:
      case EvaluatorErrorType.UNKNOWN_ERROR:
        return false;
      default:
        return false;
    }
  }

  static getRetryDelay(attemptNumber: number): number {
    // Exponential backoff: 1s, 2s, 4s, 8s, max 30s
    return Math.min(1000 * Math.pow(2, attemptNumber), 30000);
  }

  static shouldShowToUser(error: EvaluatorError): boolean {
    // Don't show technical details to users
    return error.type !== EvaluatorErrorType.UNKNOWN_ERROR;
  }

  static getUserFriendlyMessage(error: EvaluatorError): string {
    switch (error.type) {
      case EvaluatorErrorType.VALIDATION_ERROR:
        return error.message;
      case EvaluatorErrorType.ACCESS_DENIED:
        return 'You do not have permission to perform this action.';
      case EvaluatorErrorType.API_ERROR:
        return 'The service is temporarily unavailable. Please try again in a few minutes.';
      case EvaluatorErrorType.NETWORK_ERROR:
        return 'Please check your internet connection and try again.';
      case EvaluatorErrorType.UNKNOWN_ERROR:
      default:
        return 'Something went wrong. Please try again or contact support if the problem persists.';
    }
  }
}

// Additional utility functions for backwards compatibility
export function handleSupabaseError(error: unknown): EvaluatorError {
  if (error && typeof error === 'object') {
    const errorObj = error as Record<string, unknown>;
    if (errorObj.code === 'PGRST301' || errorObj.code === 'PGRST204') {
      return EvaluatorErrorHandler.createError(
        EvaluatorErrorType.ACCESS_DENIED,
        'Access denied or resource not found'
      );
    }
    
    if (typeof errorObj.message === 'string' && errorObj.message.includes('JWT')) {
      return EvaluatorErrorHandler.createError(
        EvaluatorErrorType.ACCESS_DENIED,
        'Authentication expired. Please sign in again.'
      );
    }
  }

  return EvaluatorErrorHandler.fromException(error);
}

export function handleApiError(error: unknown): EvaluatorError {
  if (error && typeof error === 'object') {
    const errorObj = error as Record<string, unknown>;
    if (errorObj.status === 401 || errorObj.status === 403) {
      return EvaluatorErrorHandler.createError(
        EvaluatorErrorType.ACCESS_DENIED,
        'Authentication required or access denied'
      );
    }

    if (typeof errorObj.status === 'number' && errorObj.status >= 500) {
      return EvaluatorErrorHandler.createError(
        EvaluatorErrorType.API_ERROR,
        'Server error. Please try again later.'
      );
    }
  }

  return EvaluatorErrorHandler.fromException(error);
}