import { describe, it, expect, beforeEach, vi } from 'vitest'
import { AIFeedbackEngine } from '../aiFeedbackEngine'
import type { EvaluationData, StudentInfo } from '../../types'
import type { FeedbackTemplate } from '../../types/feedback'

// Mock fetch for Gemini API calls
global.fetch = vi.fn()

// Mock Supabase
vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        single: vi.fn(() => Promise.resolve({
          data: {
            gemini_api_key: 'test-api-key',
            gemini_model: 'gemini-2.0-flash'
          },
          error: null
        }))
      }))
    }))
  }
}))

describe('AIFeedbackEngine', () => {
  let aiFeedbackEngine: AIFeedbackEngine
  let mockEvaluation: EvaluationData
  let mockTemplate: FeedbackTemplate
  let mockStudentInfo: StudentInfo

  beforeEach(() => {
    aiFeedbackEngine = new AIFeedbackEngine()
    vi.clearAllMocks()

    mockEvaluation = {
      summary: {
        totalAwarded: 75,
        totalPossible: 100,
        percentage: 75,
        grade: { grade: 'B', color: 'blue' },
        feedback: 'Good performance overall'
      },
      questions: [
        {
          pageNumber: 1,
          heading: 'Question 1',
          questionText: 'What is photosynthesis?',
          transcription: 'Process where plants make food using sunlight',
          evaluation: 'Good understanding shown',
          justification: 'Correct concept identified',
          marks: '8/10'
        },
        {
          pageNumber: 2,
          heading: 'Question 2',
          questionText: 'Explain cellular respiration',
          transcription: 'Breaking down glucose for energy',
          evaluation: 'Partially correct',
          justification: 'Missing some key details',
          marks: '5/10'
        }
      ],
      rawResponse: 'Mock evaluation response'
    }

    mockTemplate = {
      id: 'template-1',
      examType: 'O-Level',
      templateName: 'Standard Template',
      sections: [],
      tone: 'constructive',
      detailLevel: 'detailed',
      isActive: true,
      createdBy: 'teacher-1',
      createdAt: new Date()
    }

    mockStudentInfo = {
      studentName: 'John Doe',
      studentId: 'S12345',
      subject: 'Biology',
      examType: 'O-Level'
    }
  })

  describe('generatePersonalizedFeedback', () => {
    it('should generate feedback successfully with valid AI response', async () => {
      const mockAIResponse = {
        overallSummary: {
          performance: 'Good performance with room for improvement',
          grade: 'B',
          percentile: 75,
          keyAchievements: ['Strong understanding of photosynthesis'],
          mainConcerns: ['Needs work on cellular respiration']
        },
        questionFeedback: [
          {
            questionId: 'q1',
            questionNumber: 'Question 1',
            feedback: 'Excellent understanding of photosynthesis',
            correctApproach: 'Continue with this approach',
            commonMistakes: [],
            improvementTips: ['Add more detail about chloroplasts']
          }
        ],
        recommendations: [
          {
            topic: 'Cellular Respiration',
            priority: 'high',
            resources: ['Biology textbook Chapter 5'],
            practiceActivities: ['Complete worksheet on respiration']
          }
        ],
        strengths: ['Good conceptual understanding'],
        areasForImprovement: ['More detailed explanations needed']
      }

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          candidates: [{
            content: {
              parts: [{
                text: JSON.stringify(mockAIResponse)
              }]
            }
          }]
        })
      } as Response)

      const result = await aiFeedbackEngine.generatePersonalizedFeedback(
        mockEvaluation,
        mockTemplate,
        mockStudentInfo
      )

      expect(result.overallSummary.performance).toBe('Good performance with room for improvement')
      expect(result.overallSummary.grade).toBe('B')
      expect(result.questionFeedback).toHaveLength(1)
      expect(result.recommendations).toHaveLength(1)
      expect(result.strengths).toContain('Good conceptual understanding')
    })

    it('should return fallback feedback when AI call fails', async () => {
      vi.mocked(fetch).mockRejectedValueOnce(new Error('API Error'))

      const result = await aiFeedbackEngine.generatePersonalizedFeedback(
        mockEvaluation,
        mockTemplate,
        mockStudentInfo
      )

      expect(result.overallSummary.performance).toContain('You scored 75/100')
      expect(result.overallSummary.grade).toBe('B')
      expect(result.questionFeedback).toHaveLength(2) // Should match evaluation questions
      expect(result.recommendations).toHaveLength(1)
    })

    it('should handle malformed AI response gracefully', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          candidates: [{
            content: {
              parts: [{
                text: 'Invalid JSON response'
              }]
            }
          }]
        })
      } as Response)

      const result = await aiFeedbackEngine.generatePersonalizedFeedback(
        mockEvaluation,
        mockTemplate,
        mockStudentInfo
      )

      // Should return fallback feedback
      expect(result.overallSummary.performance).toContain('You scored 75/100')
      expect(result.questionFeedback).toHaveLength(2)
    })
  })

  describe('generateClassAnalytics', () => {
    it('should generate analytics for multiple evaluations', async () => {
      const evaluations = [
        mockEvaluation,
        {
          ...mockEvaluation,
          summary: { ...mockEvaluation.summary, percentage: 85, totalAwarded: 85 }
        },
        {
          ...mockEvaluation,
          summary: { ...mockEvaluation.summary, percentage: 65, totalAwarded: 65 }
        }
      ]

      const analytics = await aiFeedbackEngine.generateClassAnalytics(evaluations)

      expect(analytics.totalStudents).toBe(3)
      expect(analytics.averageScore).toBe(75) // (75 + 85 + 65) / 3
      expect(analytics.commonMistakes).toBeDefined()
      expect(analytics.topicPerformance).toBeDefined()
      expect(analytics.recommendations).toBeDefined()
    })

    it('should return empty analytics for no evaluations', async () => {
      const analytics = await aiFeedbackEngine.generateClassAnalytics([])

      expect(analytics.totalStudents).toBe(0)
      expect(analytics.averageScore).toBe(0)
      expect(analytics.commonMistakes).toHaveLength(0)
      expect(analytics.topicPerformance).toHaveLength(0)
      expect(analytics.recommendations).toHaveLength(0)
    })

    it('should identify common mistakes correctly', async () => {
      const evaluationsWithMistakes = [
        {
          ...mockEvaluation,
          questions: [
            { ...mockEvaluation.questions[0], marks: '2/10' }, // Failed question
            { ...mockEvaluation.questions[1], marks: '8/10' }
          ]
        },
        {
          ...mockEvaluation,
          questions: [
            { ...mockEvaluation.questions[0], marks: '3/10' }, // Failed question
            { ...mockEvaluation.questions[1], marks: '9/10' }
          ]
        }
      ]

      const analytics = await aiFeedbackEngine.generateClassAnalytics(evaluationsWithMistakes)

      expect(analytics.commonMistakes.length).toBeGreaterThan(0)
      expect(analytics.commonMistakes[0].frequency).toBeGreaterThan(0)
    })
  })

  describe('validateFeedbackConsistency', () => {
    it('should validate consistent feedback', () => {
      const feedback = {
        overallSummary: {
          performance: 'Good performance',
          grade: 'B',
          percentile: 75,
          keyAchievements: ['Good understanding'],
          mainConcerns: ['Needs improvement']
        },
        questionFeedback: [
          {
            questionId: 'q1',
            questionNumber: 'Question 1',
            feedback: 'Good work',
            improvementTips: ['Keep practicing']
          },
          {
            questionId: 'q2',
            questionNumber: 'Question 2',
            feedback: 'Needs work',
            improvementTips: ['Study more']
          }
        ],
        recommendations: [],
        strengths: [],
        areasForImprovement: []
      }

      const validation = aiFeedbackEngine.validateFeedbackConsistency(feedback, mockEvaluation)

      expect(validation.isConsistent).toBe(true)
      expect(validation.issues).toHaveLength(0)
    })

    it('should detect inconsistent grade', () => {
      const feedback = {
        overallSummary: {
          performance: 'Excellent performance',
          grade: 'A', // Different from evaluation grade 'B'
          percentile: 90,
          keyAchievements: ['Excellent work'],
          mainConcerns: []
        },
        questionFeedback: [],
        recommendations: [],
        strengths: [],
        areasForImprovement: []
      }

      const validation = aiFeedbackEngine.validateFeedbackConsistency(feedback, mockEvaluation)

      expect(validation.isConsistent).toBe(false)
      expect(validation.issues).toContain('Feedback grade does not match evaluation grade')
    })

    it('should detect question count mismatch', () => {
      const feedback = {
        overallSummary: {
          performance: 'Good performance',
          grade: 'B',
          percentile: 75,
          keyAchievements: [],
          mainConcerns: []
        },
        questionFeedback: [
          {
            questionId: 'q1',
            questionNumber: 'Question 1',
            feedback: 'Good work',
            improvementTips: []
          }
          // Missing second question feedback
        ],
        recommendations: [],
        strengths: [],
        areasForImprovement: []
      }

      const validation = aiFeedbackEngine.validateFeedbackConsistency(feedback, mockEvaluation)

      expect(validation.isConsistent).toBe(false)
      expect(validation.issues).toContain('Question feedback count does not match evaluation questions')
    })
  })
})