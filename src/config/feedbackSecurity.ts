/**
 * Feedback security configuration and RLS policy helpers
 * Ensures proper access control for feedback data
 */

import { supabase } from '../lib/supabase'

export interface FeedbackAccessControl {
  canViewFeedback: boolean
  canEditFeedback: boolean
  canPublishFeedback: boolean
  canManageTemplates: boolean
  canViewAnalytics: boolean
}

/**
 * Check user permissions for feedback operations
 */
export async function getFeedbackPermissions(
  userId: string,
  feedbackId?: string
): Promise<FeedbackAccessControl> {
  try {
    // Check if user is admin
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('is_admin')
      .eq('user_id', userId)
      .single()

    const isAdmin = userProfile?.is_admin || false

    // If admin, grant all permissions
    if (isAdmin) {
      return {
        canViewFeedback: true,
        canEditFeedback: true,
        canPublishFeedback: true,
        canManageTemplates: true,
        canViewAnalytics: true
      }
    }

    // For regular users, check specific feedback ownership
    let canAccessFeedback = false
    if (feedbackId) {
      const { data: feedback } = await supabase
        .from('feedback')
        .select('teacher_id')
        .eq('id', feedbackId)
        .single()

      canAccessFeedback = feedback?.teacher_id === userId
    }

    return {
      canViewFeedback: canAccessFeedback,
      canEditFeedback: canAccessFeedback,
      canPublishFeedback: canAccessFeedback,
      canManageTemplates: false, // Only admins can manage templates
      canViewAnalytics: true // Teachers can view their own analytics
    }
  } catch (error) {
    console.error('Error checking feedback permissions:', error)
    // Return restrictive permissions on error
    return {
      canViewFeedback: false,
      canEditFeedback: false,
      canPublishFeedback: false,
      canManageTemplates: false,
      canViewAnalytics: false
    }
  }
}

/**
 * Validate feedback data before saving
 */
export function validateFeedbackData(feedbackData: any): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  // Required fields validation
  if (!feedbackData.evaluationId) {
    errors.push('Evaluation ID is required')
  }

  if (!feedbackData.studentId) {
    errors.push('Student ID is required')
  }

  if (!feedbackData.teacherId) {
    errors.push('Teacher ID is required')
  }

  // Status validation
  const validStatuses = ['draft', 'reviewed', 'published']
  if (!validStatuses.includes(feedbackData.status)) {
    errors.push('Invalid feedback status')
  }

  // Generated feedback structure validation
  if (feedbackData.generatedFeedback) {
    const feedback = feedbackData.generatedFeedback

    if (!feedback.overallSummary) {
      errors.push('Generated feedback must include overall summary')
    }

    if (!Array.isArray(feedback.questionFeedback)) {
      errors.push('Generated feedback must include question feedback array')
    }

    if (!Array.isArray(feedback.recommendations)) {
      errors.push('Generated feedback must include recommendations array')
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Sanitize feedback content to prevent XSS
 */
export function sanitizeFeedbackContent(content: string): string {
  // Basic HTML sanitization - remove script tags and dangerous attributes
  return content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/javascript:/gi, '')
    .trim()
}

/**
 * Check if user can access student feedback
 */
export async function canAccessStudentFeedback(
  userId: string,
  studentId: string
): Promise<boolean> {
  try {
    // Check if user is the student themselves
    const { data: evaluation } = await supabase
      .from('evaluations')
      .select('user_id')
      .eq('student_id', studentId)
      .single()

    if (evaluation?.user_id === userId) {
      return true
    }

    // Check if user is admin
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('is_admin')
      .eq('user_id', userId)
      .single()

    return userProfile?.is_admin || false
  } catch (error) {
    console.error('Error checking student feedback access:', error)
    return false
  }
}

/**
 * Log feedback access for audit purposes
 */
export async function logFeedbackAccess(
  userId: string,
  feedbackId: string,
  action: 'view' | 'edit' | 'publish' | 'delete'
): Promise<void> {
  try {
    // This would typically log to an audit table
    // For now, we'll use console logging
    console.log(`Feedback access: User ${userId} performed ${action} on feedback ${feedbackId}`)
    
    // In a production system, you might want to store this in a dedicated audit log table
    // await supabase.from('audit_logs').insert({
    //   user_id: userId,
    //   resource_type: 'feedback',
    //   resource_id: feedbackId,
    //   action: action,
    //   timestamp: new Date().toISOString()
    // })
  } catch (error) {
    console.error('Error logging feedback access:', error)
  }
}

/**
 * Rate limiting for feedback generation
 */
export class FeedbackRateLimiter {
  private static attempts: Map<string, { count: number; resetTime: number }> = new Map()
  private static readonly MAX_ATTEMPTS = 10 // Max feedback generations per hour
  private static readonly WINDOW_MS = 60 * 60 * 1000 // 1 hour

  static canGenerateFeedback(userId: string): boolean {
    const now = Date.now()
    const userAttempts = this.attempts.get(userId)

    if (!userAttempts || now > userAttempts.resetTime) {
      // Reset or initialize attempts
      this.attempts.set(userId, { count: 1, resetTime: now + this.WINDOW_MS })
      return true
    }

    if (userAttempts.count >= this.MAX_ATTEMPTS) {
      return false
    }

    userAttempts.count++
    return true
  }

  static getRemainingAttempts(userId: string): number {
    const userAttempts = this.attempts.get(userId)
    if (!userAttempts || Date.now() > userAttempts.resetTime) {
      return this.MAX_ATTEMPTS
    }
    return Math.max(0, this.MAX_ATTEMPTS - userAttempts.count)
  }
}