import { describe, it, expect, beforeEach, vi, Mock } from 'vitest'
import { FeedbackService } from '../feedbackService'
import { supabase } from '../../lib/supabase'
import { handleSupabaseError } from '../../utils/errorHandler'
import { 
  getFeedbackPermissions, 
  validateFeedbackData, 
  logFeedbackAccess,
  FeedbackRateLimiter
} from '../../config/feedbackSecurity'

// Mock dependencies
vi.mock('../../lib/supabase')
vi.mock('../../utils/errorHandler')
vi.mock('../../config/feedbackSecurity')

const mockSupabase = supabase as any
const mockHandleSupabaseError = handleSupabaseError as Mock
const mockGetFeedbackPermissions = getFeedbackPermissions as Mock
const mockValidateFeedbackData = validateFeedbackData as Mock
const mockLogFeedbackAccess = logFeedbackAccess as Mock
const mockFeedbackRateLimiter = FeedbackRateLimiter as any

describe('FeedbackService', () => {
  let feedbackService: FeedbackService
  const mockUser = { id: 'user-123', email: 'test@example.com' }

  beforeEach(() => {
    feedbackService = new FeedbackService()
    vi.clearAllMocks()

    // Default mocks
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    })

    mockGetFeedbackPermissions.mockResolvedValue({
      canViewFeedback: true,
      canEditFeedback: true,
      canPublishFeedback: true
    })

    mockValidateFeedbackData.mockReturnValue({
      isValid: true,
      errors: []
    })

    mockFeedbackRateLimiter.canGenerateFeedback.mockReturnValue(true)
    mockLogFeedbackAccess.mockResolvedValue(undefined)
  })

  describe('generateFeedback', () => {
    it('should generate feedback successfully for valid input', async () => {
      // Arrange
      const evaluationId = 'eval-123'
      const mockEvaluation = {
        id: evaluationId,
        student_id: 'student-456',
        user_id: 'user-123'
      }

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockEvaluation,
              error: null
            })
          })
        })
      })

      // Act
      const result = await feedbackService.generateFeedback(evaluationId)

      // Assert
      expect(result.success).toBe(true)
      expect(mockFeedbackRateLimiter.canGenerateFeedback).toHaveBeenCalledWith(mockUser.id)
      expect(mockGetFeedbackPermissions).toHaveBeenCalledWith(mockUser.id)
    })

    it('should fail when user is not authenticated', async () => {
      // Arrange
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: new Error('Not authenticated')
      })

      // Act
      const result = await feedbackService.generateFeedback('eval-123')

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toContain('Authentication required')
    })
  })

  describe('getFeedback', () => {
    it('should retrieve feedback successfully', async () => {
      // Arrange
      const feedbackId = 'feedback-123'
      const mockFeedbackData = {
        id: feedbackId,
        evaluation_id: 'eval-123',
        student_id: 'student-456',
        teacher_id: 'user-123',
        generated_feedback: { summary: 'Good work' },
        edited_feedback: null,
        status: 'draft',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockFeedbackData,
              error: null
            })
          })
        })
      })

      // Act
      const result = await feedbackService.getFeedback(feedbackId)

      // Assert
      expect(result).toBeTruthy()
      expect(result?.id).toBe(feedbackId)
      expect(result?.evaluationId).toBe('eval-123')
      expect(mockLogFeedbackAccess).toHaveBeenCalledWith(mockUser.id, feedbackId, 'view')
    })
  })
})