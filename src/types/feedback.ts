/**
 * Feedback system type definitions
 * Based on the design document specifications
 */

export interface FeedbackData {
  id: string
  evaluationId: string
  studentId: string
  teacherId: string
  generatedFeedback: GeneratedFeedback | null
  editedFeedback?: GeneratedFeedback | null
  status: 'draft' | 'reviewed' | 'published'
  createdAt: Date
  updatedAt: Date
}

export interface GeneratedFeedback {
  overallSummary: FeedbackSummary
  questionFeedback: QuestionFeedback[]
  recommendations: StudyRecommendation[]
  strengths: string[]
  areasForImprovement: string[]
}

export interface FeedbackSummary {
  performance: string
  grade: string
  percentile?: number
  keyAchievements: string[]
  mainConcerns: string[]
}

export interface QuestionFeedback {
  questionId: string
  questionNumber: string
  feedback: string
  correctApproach?: string
  commonMistakes?: string[]
  improvementTips: string[]
}

export interface StudyRecommendation {
  topic: string
  priority: 'high' | 'medium' | 'low'
  resources: string[]
  practiceActivities: string[]
}

export interface FeedbackTemplate {
  id: string
  examType: string
  templateName: string
  sections: FeedbackSection[]
  tone: 'formal' | 'encouraging' | 'constructive'
  detailLevel: 'brief' | 'detailed' | 'comprehensive'
  isActive: boolean
  createdBy: string
  createdAt: Date
}

export interface FeedbackSection {
  sectionType: 'summary' | 'question' | 'recommendations' | 'resources'
  template: string
  required: boolean
  order: number
}

export interface FeedbackOptions {
  templateId?: string
  tone?: 'formal' | 'encouraging' | 'constructive'
  detailLevel?: 'brief' | 'detailed' | 'comprehensive'
  includeRecommendations?: boolean
  includeResources?: boolean
}

export interface FeedbackResult {
  success: boolean
  feedbackId?: string
  status?: 'draft' | 'reviewed' | 'published'
  message?: string
  error?: string
}

export interface FeedbackExportOptions {
  format: 'pdf' | 'html' | 'email'
  includeGraphics: boolean
  includeBranding: boolean
  customization?: FeedbackCustomization
}

export interface FeedbackCustomization {
  headerText?: string
  footerText?: string
  logoUrl?: string
  colorScheme?: string
}

export interface ClassAnalytics {
  classId: string
  totalStudents: number
  averageScore: number
  commonMistakes: CommonMistake[]
  topicPerformance: TopicPerformance[]
  recommendations: TeachingRecommendation[]
}

export interface CommonMistake {
  questionType: string
  mistake: string
  frequency: number
  suggestedIntervention: string
}

export interface TopicPerformance {
  topic: string
  averageScore: number
  studentsStruggling: number
  studentsExcelling: number
}

export interface TeachingRecommendation {
  area: string
  priority: 'high' | 'medium' | 'low'
  suggestion: string
  resources: string[]
}

export interface FeedbackPermissions {
  canGenerate: boolean
  canEdit: boolean
  canPublish: boolean
  canViewAnalytics: boolean
  canManageTemplates: boolean
}

export interface FeedbackDeliveryLog {
  id: string
  feedbackId: string
  deliveryMethod: 'email' | 'pdf' | 'web'
  recipientEmail?: string
  deliveredAt: Date
  status: 'sent' | 'failed' | 'pending'
}

// Error handling types
export enum FeedbackErrorType {
  AI_SERVICE_UNAVAILABLE = 'ai_service_unavailable',
  TEMPLATE_NOT_FOUND = 'template_not_found',
  EVALUATION_NOT_FOUND = 'evaluation_not_found',
  INSUFFICIENT_DATA = 'insufficient_data',
  GENERATION_TIMEOUT = 'generation_timeout',
  VALIDATION_FAILED = 'validation_failed'
}

export interface FeedbackError {
  type: FeedbackErrorType
  message: string
  details?: Record<string, unknown>
  retryable: boolean
}

// Database schema types for Supabase integration
export interface FeedbackDatabaseRow {
  id: string
  evaluation_id: string
  student_id: string
  teacher_id: string
  generated_feedback: any // JSONB
  edited_feedback?: any // JSONB
  status: string
  created_at: string
  updated_at: string
}

export interface FeedbackTemplateDatabaseRow {
  id: string
  exam_type: string
  template_name: string
  template_content: any // JSONB
  is_active: boolean
  created_by: string
  created_at: string
}

export interface FeedbackDeliveryLogDatabaseRow {
  id: string
  feedback_id: string
  delivery_method: string
  recipient_email?: string
  delivered_at: string
  status: string
}