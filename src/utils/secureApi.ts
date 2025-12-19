/**
 * Secure API wrapper with comprehensive security measures
 * Protects against injection attacks, validates all inputs, and implements rate limiting
 */

import { supabase, getSiteUrl } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

// Type definitions for secure operations
interface SecureAuthResponse {
  user: User | null;
  session: Record<string, unknown> | null;
}

interface SecureEvaluationResult {
  success: boolean;
  evaluation: Record<string, unknown>;
  evaluationId: string;
  metadata: Record<string, unknown>;
}
import { 
  validateEmail, 
  validatePassword, 
  validateFileUpload, 
  validateNumericInput,
  validateStudentInfo,
  validateApiKey,
  sanitizeTextInput,
  detectSqlInjection,
  checkRateLimit,
  createSecurityMiddleware,
  SECURITY_LIMITS 
} from './security';
import { handleSupabaseError, handleApiError } from './errorHandler';
import type { 
  EvaluationLimitStatus, 
  GlobalSettings
} from '../types';

const securityMiddleware = createSecurityMiddleware();

/**
 * Secure authentication wrapper
 */
class SecureAuth {
  private static getUserId(): string {
    const userAgent = navigator.userAgent;
    const timestamp = Date.now().toString();
    return btoa(`${userAgent}:${timestamp}`).slice(0, 32);
  }

  static async signUp(email: string, password: string): Promise<Record<string, unknown>> {
    // Rate limiting
    const userId = this.getUserId();
    const rateCheck = checkRateLimit(`signup:${userId}`);
    if (!rateCheck.allowed) {
      throw new Error('Too many signup attempts. Please try again later.');
    }

    // Validate inputs
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      throw new Error(emailValidation.error);
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      throw new Error(passwordValidation.error);
    }

    // Check for SQL injection
    if (detectSqlInjection(email)) {
      throw new Error('Invalid email format');
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: sanitizeTextInput(email, 254),
        password: password, // Don't sanitize password as it might change special chars
        options: {
          emailRedirectTo: `${getSiteUrl()}/auth/callback`
        }
      });

      if (error) throw handleSupabaseError(error);
      return data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  static async signIn(email: string, password: string): Promise<Record<string, unknown>> {
    // Rate limiting
    const userId = this.getUserId();
    const rateCheck = checkRateLimit(`signin:${userId}`);
    if (!rateCheck.allowed) {
      throw new Error('Too many login attempts. Please try again later.');
    }

    // Validate inputs
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      throw new Error(emailValidation.error);
    }

    if (!password || password.length < 1) {
      throw new Error('Password is required');
    }

    // Check for SQL injection
    if (detectSqlInjection(email)) {
      throw new Error('Invalid email format');
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: sanitizeTextInput(email, 254),
        password: password
      });

      if (error) throw handleSupabaseError(error);
      return data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  static async signOut(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw handleSupabaseError(error);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  static async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw handleSupabaseError(error);
      return user;
    } catch (error) {
      throw handleApiError(error);
    }
  }
}

/**
 * Secure evaluation management
 */
class SecureEvaluation {
  static async checkEvaluationLimit(userId: string): Promise<EvaluationLimitStatus> {
    // Validate UUID format
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidPattern.test(userId)) {
      throw new Error('Invalid user ID format');
    }

    try {
      const { data: statusResult, error: statusError } = await supabase
        .rpc('get_user_evaluation_status', { check_user_id: userId });

      if (statusError) {
        console.error('RPC error checking evaluation status:', statusError);
        throw handleSupabaseError(statusError);
      }

      if (!statusResult || statusResult.length === 0) {
        // Fallback to direct table query with security
        const { data: userProfile, error: profileError } = await supabase
          .from('user_profiles')
          .select('evaluation_limit, evaluations_used')
          .eq('user_id', userId)
          .single();

        if (profileError) {
          throw handleSupabaseError(profileError);
        }

        const limit = Math.min(userProfile.evaluation_limit ?? 10, SECURITY_LIMITS.MAX_EVALUATION_LIMIT);
        const used = Math.max(0, userProfile.evaluations_used ?? 0);
        const remaining = Math.max(0, limit - used);

        return { canEvaluate: remaining > 0, remaining, total: limit };
      }

      const status = statusResult[0];
      return {
        canEvaluate: Boolean(status.can_evaluate),
        remaining: Math.max(0, status.remaining_evaluations),
        total: Math.min(status.total_limit, SECURITY_LIMITS.MAX_EVALUATION_LIMIT)
      };
    } catch (error) {
      throw handleApiError(error);
    }
  }

  static async submitEvaluation(formData: FormData): Promise<SecureEvaluationResult> {
    const user = await SecureAuth.getCurrentUser();
    if (!user) {
      throw new Error('Authentication required');
    }

    // Rate limiting per user
    const rateCheck = checkRateLimit(`evaluation:${user.id}`);
    if (!rateCheck.allowed) {
      throw new Error('Too many evaluation requests. Please wait before submitting another.');
    }

    // Validate and sanitize form data
    const studentName = formData.get('studentName') as string;
    const studentId = formData.get('studentId') as string;
    const subject = formData.get('subject') as string;
    const totalPossibleMarks = formData.get('totalPossibleMarks') as string;

    // Validate student information
    const studentInfoValidation = validateStudentInfo({
      studentName,
      studentId,
      subject
    });

    if (!studentInfoValidation.isValid) {
      throw new Error(`Validation failed: ${studentInfoValidation.errors.join(', ')}`);
    }

    // Validate marks
    const marksValidation = validateNumericInput(
      totalPossibleMarks, 
      SECURITY_LIMITS.MIN_MARKS, 
      SECURITY_LIMITS.MAX_MARKS
    );

    if (!marksValidation.isValid) {
      throw new Error(`Invalid marks: ${marksValidation.error}`);
    }

    // Validate files
    const studentPaperFiles = formData.getAll('studentPaper') as File[];
    const markSchemeFiles = formData.getAll('markScheme') as File[];

    if (studentPaperFiles.length === 0) {
      throw new Error('At least one student paper file is required');
    }

    if (markSchemeFiles.length === 0) {
      throw new Error('At least one mark scheme file is required');
    }

    if (studentPaperFiles.length > SECURITY_LIMITS.MAX_FILES || 
        markSchemeFiles.length > SECURITY_LIMITS.MAX_FILES) {
      throw new Error(`Too many files. Maximum ${SECURITY_LIMITS.MAX_FILES} files per type allowed.`);
    }

    // Validate each file
    const allFiles = [...studentPaperFiles, ...markSchemeFiles];
    for (const file of allFiles) {
      const fileValidation = validateFileUpload(file);
      if (!fileValidation.isValid) {
        throw new Error(`File validation failed for "${file.name}": ${fileValidation.error}`);
      }
    }

    // Create sanitized form data
    const sanitizedFormData = new FormData();
    sanitizedFormData.append('studentName', studentInfoValidation.sanitized!.studentName!);
    sanitizedFormData.append('studentId', studentInfoValidation.sanitized!.studentId!);
    sanitizedFormData.append('subject', studentInfoValidation.sanitized!.subject!);
    sanitizedFormData.append('totalPossibleMarks', marksValidation.value!.toString());

    // Add validated files
    studentPaperFiles.forEach(file => sanitizedFormData.append('studentPaper', file));
    markSchemeFiles.forEach(file => sanitizedFormData.append('markScheme', file));

    try {
      // Import the actual evaluation function
      const { evaluateExamPaper } = await import('../services/api');
      return await evaluateExamPaper(sanitizedFormData);
    } catch (error) {
      throw handleApiError(error);
    }
  }
}

/**
 * Secure admin operations
 */
class SecureAdmin {
  static async verifyAdminAccess(email: string): Promise<boolean> {
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      return false;
    }

    if (detectSqlInjection(email)) {
      return false;
    }

    try {
      const { data, error } = await supabase.rpc('is_user_admin', { 
        check_email: sanitizeTextInput(email, 254) 
      });

      if (error) {
        console.error('Admin verification error:', error);
        return false;
      }

      return Boolean(data);
    } catch (error) {
      console.error('Admin verification failed:', error);
      return false;
    }
  }

  static async updateGlobalSettings(settings: Partial<GlobalSettings>): Promise<void> {
    const user = await SecureAuth.getCurrentUser();
    if (!user) {
      throw new Error('Authentication required');
    }

    const isAdmin = await this.verifyAdminAccess(user.email || '');
    if (!isAdmin) {
      throw new Error('Admin access required');
    }

    // Rate limiting for admin operations
    const rateCheck = checkRateLimit(`admin:${user.id}`);
    if (!rateCheck.allowed) {
      throw new Error('Too many admin requests. Please wait.');
    }

    // Validate API key if provided
    if (settings.geminiApiKey !== undefined) {
      const apiKeyValidation = validateApiKey(settings.geminiApiKey);
      if (!apiKeyValidation.isValid) {
        throw new Error(`API Key validation failed: ${apiKeyValidation.error}`);
      }
    }

    // Validate model if provided
    if (settings.geminiModel !== undefined) {
      const allowedModels = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-2.5-flash-preview-05-20'];
      const sanitizedModel = sanitizeTextInput(settings.geminiModel, 50);
      
      if (!allowedModels.includes(sanitizedModel)) {
        throw new Error('Invalid model selection');
      }
      
      settings.geminiModel = sanitizedModel;
    }

    try {
      const { error } = await supabase.functions.invoke('admin-api/global-settings', {
        method: 'PUT',
        body: settings
      });

      if (error) throw handleSupabaseError(error);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  static async updateUserLimit(targetUserId: string, newLimit: number): Promise<void> {
    const user = await SecureAuth.getCurrentUser();
    if (!user) {
      throw new Error('Authentication required');
    }

    const isAdmin = await this.verifyAdminAccess(user.email || '');
    if (!isAdmin) {
      throw new Error('Admin access required');
    }

    // Validate target user ID
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidPattern.test(targetUserId)) {
      throw new Error('Invalid user ID format');
    }

    // Validate limit
    const limitValidation = validateNumericInput(
      newLimit, 
      SECURITY_LIMITS.MIN_EVALUATION_LIMIT, 
      SECURITY_LIMITS.MAX_EVALUATION_LIMIT
    );

    if (!limitValidation.isValid) {
      throw new Error(`Invalid limit: ${limitValidation.error}`);
    }

    try {
      const { error } = await supabase.rpc('update_user_evaluation_limit', {
        target_user_id: targetUserId,
        new_limit: limitValidation.value
      });

      if (error) throw handleSupabaseError(error);
    } catch (error) {
      throw handleApiError(error);
    }
  }
}

/**
 * Secure file operations
 */
class SecureFile {
  static async validateFileContent(file: File): Promise<boolean> {
    const validation = validateFileUpload(file);
    if (!validation.isValid) {
      return false;
    }

    try {
      // Additional content validation for PDFs
      if (file.type === 'application/pdf') {
        const arrayBuffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        
        // Check PDF magic number
        const pdfSignature = [0x25, 0x50, 0x44, 0x46]; // %PDF
        for (let i = 0; i < pdfSignature.length; i++) {
          if (uint8Array[i] !== pdfSignature[i]) {
            return false;
          }
        }
      }

      // Additional validation for images
      if (file.type.startsWith('image/')) {
        const arrayBuffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        
        // Check common image signatures
        const jpegSignature = [0xFF, 0xD8, 0xFF];
        const pngSignature = [0x89, 0x50, 0x4E, 0x47];
        
        if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
          for (let i = 0; i < jpegSignature.length; i++) {
            if (uint8Array[i] !== jpegSignature[i]) {
              return false;
            }
          }
        } else if (file.type === 'image/png') {
          for (let i = 0; i < pngSignature.length; i++) {
            if (uint8Array[i] !== pngSignature[i]) {
              return false;
            }
          }
        }
      }

      return true;
    } catch (error) {
      console.error('File content validation error:', error);
      return false;
    }
  }

  static async convertToSecureBase64(file: File): Promise<string> {
    const isValid = await this.validateFileContent(file);
    if (!isValid) {
      throw new Error('File content validation failed');
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = () => {
        try {
          const result = reader.result as string;
          const base64Data = result.split(',')[1];
          
          // Additional validation of base64 data
          if (!base64Data || base64Data.length === 0) {
            reject(new Error('Failed to convert file to base64'));
            return;
          }

          resolve(base64Data);
        } catch {
          reject(new Error('File conversion failed'));
        }
      };

      reader.onerror = () => {
        reject(new Error('File reading failed'));
      };

      reader.readAsDataURL(file);
    });
  }
}

// Export secure API wrapper
export const SecureAPI = {
  auth: SecureAuth,
  evaluation: SecureEvaluation,
  admin: SecureAdmin,
  file: SecureFile,
  
  // Utility functions
  sanitizeInput: sanitizeTextInput,
  validateEmail,
  validatePassword,
  validateFile: validateFileUpload,
  checkRateLimit,
  
  // Security middleware
  middleware: securityMiddleware
};
