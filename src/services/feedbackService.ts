import { supabase } from '../lib/supabase'
import { handleSupabaseError } from '../utils/errorHandler'
import { aiFeedbackEngine } from './aiFeedbackEngine'
import { 
  getFeedbackPermissions, 
  validateFeedbackData, 
  logFeedbackAccess,
  FeedbackRateLimiter
} from '../config/feedbackSecurity'
import type { EvaluationData, StudentInfo } from '../types'
import type { 
  FeedbackData, 
  FeedbackTemplate, 
  FeedbackOptions, 
  FeedbackResult,
  FeedbackError,
  FeedbackErrorType,
  GeneratedFeedback
} from '../types/feedback'

/**
 * Core feedback service for managing automated feedback generation
 * 
 * This service integrates with the existing evaluation pipeline and AI services
 * to provide comprehensive feedback management capabilities including:
 * - AI-powered feedback generation using Gemini AI
 * - Template-based feedback customization
 * - Teacher review and editing workflows
 * - Student feedback access and delivery
 * - Class-wide analytics and insights
 * 
 * @example
 * ```typescript
 * // Generate feedback for an evaluation
 * const result = await feedbackService.generateFeedback('eval-123', {
 *   templateId: 'template-456',
 *   tone: 'encouraging'
 * });
 * 
 * // Update existing feedback
 * await feedbackService.updateFeedback('feedback-789', {
 *   status: 'published',
 *   editedFeedback: modifiedFeedback
 * });
 * ```
 * 
 * @see {@link aiFeedbackEngine} for AI feedback generation
 * @see {@link FeedbackTemplate} for template structure
 * @see {@link FeedbackData} for data model
 */
export class FeedbackService {
  /**
   * Generate feedback for a completed evaluation
   * 
   * This method orchestrates the entire feedback generation process:
   * 1. Validates user permissions and rate limits
   * 2. Retrieves evaluation data and appropriate template
   * 3. Calls AI service to generate personalized feedback
   * 4. Validates feedback consistency with evaluation results
   * 5. Saves feedback record to database
   * 
   * @param evaluationId - Unique identifier for the evaluation
   * @param options - Optional configuration for feedback generation
   * @param options.templateId - Specific template to use (auto-selected if not provided)
   * @param options.tone - Feedback tone override
   * @param options.detailLevel - Level of detail override
   * @returns Promise resolving to feedback generation result
   * 
   * @throws {FeedbackError} When generation fails due to various reasons:
   * - AI_SERVICE_UNAVAILABLE: Authentication or rate limit issues
   * - EVALUATION_NOT_FOUND: Invalid evaluation ID
   * - TEMPLATE_NOT_FOUND: No suitable template available
   * - VALIDATION_FAILED: Permission or data validation errors
   * 
   * @example
   * ```typescript
   * const result = await feedbackService.generateFeedback('eval-123', {
   *   tone: 'encouraging',
   *   detailLevel: 'comprehensive'
   * });
   * 
   * if (result.success) {
   *   console.log('Feedback generated:', result.feedbackId);
   * } else {
   *   console.error('Generation failed:', result.error);
   * }
   * ```
   */
  async generateFeedback(
    evaluationId: string, 
    options: FeedbackOptions = {}
  ): Promise<FeedbackResult> {
    try {
      // Get the current user
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        throw this.createFeedbackError(
          'AI_SERVICE_UNAVAILABLE',
          'Authentication required for feedback generation',
          true
        )
      }

      // Check rate limiting
      if (!FeedbackRateLimiter.canGenerateFeedback(user.id)) {
        throw this.createFeedbackError(
          'GENERATION_TIMEOUT',
          'Rate limit exceeded. Please try again later.',
          true
        )
      }

      // Check permissions
      const permissions = await getFeedbackPermissions(user.id)
      if (!permissions.canViewFeedback) {
        throw this.createFeedbackError(
          'VALIDATION_FAILED',
          'Insufficient permissions to generate feedback',
          false
        )
      }

      // Fetch the evaluation data
      const { data: evaluation, error: evalError } = await supabase
        .from('evaluations')
        .select('*')
        .eq('id', evaluationId)
        .single()

      if (evalError || !evaluation) {
        throw this.createFeedbackError(
          'EVALUATION_NOT_FOUND',
          `Evaluation not found: ${evaluationId}`,
          false
        )
      }

      // Check if feedback already exists
      const { data: existingFeedback } = await supabase
        .from('feedback')
        .select('id, status')
        .eq('evaluation_id', evaluationId)
        .single()

      if (existingFeedback && existingFeedback.status === 'published') {
        throw this.createFeedbackError(
          'VALIDATION_FAILED',
          'Feedback already exists for this evaluation',
          false
        )
      }

      // Get appropriate feedback template
      const examType = evaluation.evaluation_result?.studentInfo?.examType || 'Standard'
      const templates = await this.getFeedbackTemplates(examType)
      const template = templates.find(t => t.templateName.includes('Standard')) || templates[0]

      if (!template) {
        throw this.createFeedbackError(
          'TEMPLATE_NOT_FOUND',
          `No feedback template found for exam type: ${examType}`,
          false
        )
      }

      // Generate AI feedback
      let generatedFeedback: GeneratedFeedback | null = null
      try {
        const evaluationData = evaluation.evaluation_result as EvaluationData
        const studentInfo = evaluationData.summary.studentInfo as StudentInfo
        
        generatedFeedback = await aiFeedbackEngine.generatePersonalizedFeedback(
          evaluationData,
          template,
          studentInfo
        )

        // Validate feedback consistency
        const consistency = aiFeedbackEngine.validateFeedbackConsistency(
          generatedFeedback,
          evaluationData
        )

        if (!consistency.isConsistent) {
          console.warn('Generated feedback has consistency issues:', consistency.issues)
        }
      } catch (error) {
        console.error('AI feedback generation failed:', error)
        // Continue with null feedback - can be generated later
      }

      // Create feedback record
      const feedbackData: Partial<FeedbackData> = {
        evaluationId,
        studentId: evaluation.student_id || 'unknown',
        teacherId: user.id,
        status: 'draft',
        generatedFeedback,
        editedFeedback: null
      }

      // Validate feedback data
      const validation = validateFeedbackData(feedbackData)
      if (!validation.isValid) {
        throw this.createFeedbackError(
          'VALIDATION_FAILED',
          `Invalid feedback data: ${validation.errors.join(', ')}`,
          false
        )
      }

      const { data: savedFeedback, error: saveError } = await supabase
        .from('feedback')
        .insert(this.mapFeedbackDataToDatabase(feedbackData))
        .select()
        .single()

      if (saveError) {
        throw handleSupabaseError(saveError)
      }

      // Log the feedback generation
      await logFeedbackAccess(user.id, savedFeedback.id, 'view')

      return {
        success: true,
        feedbackId: savedFeedback.id,
        status: 'draft',
        message: generatedFeedback 
          ? 'Feedback generated successfully' 
          : 'Feedback record created - generation pending'
      }

    } catch (error) {
      console.error('Feedback generation failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  /**
   * Get feedback templates for a specific exam type
   */
  async getFeedbackTemplates(examType: string): Promise<FeedbackTemplate[]> {
    try {
      const { data: templates, error } = await supabase
        .from('feedback_templates')
        .select('*')
        .eq('exam_type', examType)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) {
        throw handleSupabaseError(error)
      }

      return templates || []
    } catch (error) {
      console.error('Failed to fetch feedback templates:', error)
      return []
    }
  }

  /**
   * Save feedback data to database
   */
  async saveFeedback(feedback: FeedbackData): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('feedback')
        .upsert({
          id: feedback.id,
          evaluation_id: feedback.evaluationId,
          student_id: feedback.studentId,
          teacher_id: feedback.teacherId,
          generated_feedback: feedback.generatedFeedback,
          edited_feedback: feedback.editedFeedback,
          status: feedback.status,
          updated_at: new Date().toISOString()
        })
        .select('id')
        .single()

      if (error) {
        throw handleSupabaseError(error)
      }

      return data.id
    } catch (error) {
      console.error('Failed to save feedback:', error)
      throw error
    }
  }

  /**
   * Update existing feedback
   */
  async updateFeedback(
    feedbackId: string, 
    updates: Partial<FeedbackData>
  ): Promise<void> {
    try {
      // Validate input
      if (!feedbackId?.trim()) {
        throw new Error('Feedback ID is required')
      }

      // Validate updates
      const validation = validateFeedbackData({ ...updates, id: feedbackId })
      if (!validation.isValid) {
        throw new Error(`Invalid update data: ${validation.errors.join(', ')}`)
      }

      // Check permissions
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('Authentication required')
      }

      const permissions = await getFeedbackPermissions(user.id, feedbackId)
      if (!permissions.canEditFeedback) {
        throw new Error('Insufficient permissions to edit feedback')
      }

      const { error } = await supabase
        .from('feedback')
        .update(this.mapFeedbackDataToDatabase({
          ...updates,
          updatedAt: new Date()
        }))
        .eq('id', feedbackId)

      if (error) {
        throw handleSupabaseError(error)
      }

      // Log the update
      await logFeedbackAccess(user.id, feedbackId, 'edit')
    } catch (error) {
      console.error('Failed to update feedback:', error)
      throw error
    }
  }

  /**
   * Get feedback by ID
   */
  async getFeedback(feedbackId: string): Promise<FeedbackData | null> {
    try {
      // Validate input
      if (!feedbackId?.trim()) {
        throw new Error('Feedback ID is required')
      }

      // Check permissions
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('Authentication required')
      }

      const permissions = await getFeedbackPermissions(user.id, feedbackId)
      if (!permissions.canViewFeedback) {
        throw new Error('Insufficient permissions to view feedback')
      }

      const { data, error } = await supabase
        .from('feedback')
        .select('*')
        .eq('id', feedbackId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return null // Not found
        }
        throw handleSupabaseError(error)
      }

      // Log the access
      await logFeedbackAccess(user.id, feedbackId, 'view')

      return this.mapDatabaseToFeedbackData(data)
    } catch (error) {
      console.error('Failed to get feedback:', error)
      return null
    }
  }

  /**
   * Get all feedback for a teacher
   */
  async getTeacherFeedback(teacherId: string): Promise<FeedbackData[]> {
    try {
      const { data, error } = await supabase
        .from('feedback')
        .select('*')
        .eq('teacher_id', teacherId)
        .order('created_at', { ascending: false })

      if (error) {
        throw handleSupabaseError(error)
      }

      return (data || []).map(this.mapDatabaseToFeedbackData)
    } catch (error) {
      console.error('Failed to get teacher feedback:', error)
      return []
    }
  }

  /**
   * Delete feedback
   */
  async deleteFeedback(feedbackId: string): Promise<void> {
    try {
      // Validate input
      if (!feedbackId?.trim()) {
        throw new Error('Feedback ID is required')
      }

      // Check permissions
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('Authentication required')
      }

      const permissions = await getFeedbackPermissions(user.id, feedbackId)
      if (!permissions.canEditFeedback) {
        throw new Error('Insufficient permissions to delete feedback')
      }

      const { error } = await supabase
        .from('feedback')
        .delete()
        .eq('id', feedbackId)

      if (error) {
        throw handleSupabaseError(error)
      }

      // Log the deletion
      await logFeedbackAccess(user.id, feedbackId, 'delete')
    } catch (error) {
      console.error('Failed to delete feedback:', error)
      throw error
    }
  }

  /**
   * Bulk operations for feedback management
   */
  async bulkUpdateFeedbackStatus(
    feedbackIds: string[], 
    status: 'draft' | 'reviewed' | 'published'
  ): Promise<{ success: string[]; failed: string[] }> {
    const results = { success: [], failed: [] }

    for (const feedbackId of feedbackIds) {
      try {
        await this.updateFeedback(feedbackId, { status })
        results.success.push(feedbackId)
      } catch (error) {
        console.error(`Failed to update feedback ${feedbackId}:`, error)
        results.failed.push(feedbackId)
      }
    }

    return results
  }

  /**
   * Regenerate AI feedback for existing feedback record
   */
  async regenerateFeedback(feedbackId: string): Promise<FeedbackResult> {
    try {
      // Get current user and check permissions
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw this.createFeedbackError(
          'AI_SERVICE_UNAVAILABLE',
          'Authentication required',
          true
        )
      }

      const permissions = await getFeedbackPermissions(user.id, feedbackId)
      if (!permissions.canEditFeedback) {
        throw this.createFeedbackError(
          'VALIDATION_FAILED',
          'Insufficient permissions to regenerate feedback',
          false
        )
      }

      // Get existing feedback record
      const { data: feedback, error: feedbackError } = await supabase
        .from('feedback')
        .select('*, evaluations(*)')
        .eq('id', feedbackId)
        .single()

      if (feedbackError || !feedback) {
        throw this.createFeedbackError(
          'EVALUATION_NOT_FOUND',
          'Feedback record not found',
          false
        )
      }

      // Get evaluation data
      const evaluation = feedback.evaluations
      if (!evaluation?.evaluation_result) {
        throw this.createFeedbackError(
          'INSUFFICIENT_DATA',
          'Evaluation data not available',
          false
        )
      }

      // Get template
      const examType = evaluation.evaluation_result?.studentInfo?.examType || 'Standard'
      const templates = await this.getFeedbackTemplates(examType)
      const template = templates.find(t => t.templateName.includes('Standard')) || templates[0]

      if (!template) {
        throw this.createFeedbackError(
          'TEMPLATE_NOT_FOUND',
          `No template found for exam type: ${examType}`,
          false
        )
      }

      // Generate new feedback
      const evaluationData = evaluation.evaluation_result as EvaluationData
      const studentInfo = evaluationData.summary.studentInfo as StudentInfo
      
      const generatedFeedback = await aiFeedbackEngine.generatePersonalizedFeedback(
        evaluationData,
        template,
        studentInfo
      )

      // Update feedback record
      await this.updateFeedback(feedbackId, { 
        generatedFeedback,
        status: 'draft' // Reset to draft after regeneration
      })

      return {
        success: true,
        feedbackId,
        status: 'draft',
        message: 'Feedback regenerated successfully'
      }
    } catch (error) {
      console.error('Failed to regenerate feedback:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  /**
   * Get feedback statistics for a teacher
   */
  async getFeedbackStats(teacherId: string): Promise<{
    total: number
    byStatus: Record<string, number>
    recentActivity: number
  }> {
    try {
      const { data: feedbacks, error } = await supabase
        .from('feedback')
        .select('status, created_at')
        .eq('teacher_id', teacherId)

      if (error) {
        throw handleSupabaseError(error)
      }

      const total = feedbacks?.length || 0
      const byStatus = feedbacks?.reduce((acc, feedback) => {
        acc[feedback.status] = (acc[feedback.status] || 0) + 1
        return acc
      }, {} as Record<string, number>) || {}

      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
      
      const recentActivity = feedbacks?.filter(
        feedback => new Date(feedback.created_at) > oneWeekAgo
      ).length || 0

      return { total, byStatus, recentActivity }
    } catch (error) {
      console.error('Failed to get feedback stats:', error)
      return { total: 0, byStatus: {}, recentActivity: 0 }
    }
  }

  /**
   * Create a structured feedback error
   */
  private createFeedbackError(
    type: FeedbackErrorType,
    message: string,
    retryable: boolean,
    details?: Record<string, unknown>
  ): FeedbackError {
    return {
      type,
      message,
      retryable,
      details
    }
  }

  /**
   * Map FeedbackData to database format
   */
  private mapFeedbackDataToDatabase(feedbackData: Partial<FeedbackData>): any {
    return {
      id: feedbackData.id,
      evaluation_id: feedbackData.evaluationId,
      student_id: feedbackData.studentId,
      teacher_id: feedbackData.teacherId,
      generated_feedback: feedbackData.generatedFeedback,
      edited_feedback: feedbackData.editedFeedback,
      status: feedbackData.status,
      updated_at: new Date().toISOString()
    }
  }

  /**
   * Map database record to FeedbackData interface
   */
  private mapDatabaseToFeedbackData(data: any): FeedbackData {
    return {
      id: data.id,
      evaluationId: data.evaluation_id,
      studentId: data.student_id,
      teacherId: data.teacher_id,
      generatedFeedback: data.generated_feedback,
      editedFeedback: data.edited_feedback,
      status: data.status,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    }
  }
}

// Export singleton instance
export const feedbackService = new FeedbackService()