import { supabase } from '../lib/supabase'
import { handleApiError } from '../utils/errorHandler'
import type { 
  EvaluationData, 
  StudentInfo,
  GlobalSettings 
} from '../types'
import type {
  GeneratedFeedback,
  FeedbackTemplate,
  ClassAnalytics,
  FeedbackSummary,
  QuestionFeedback,
  StudyRecommendation,
  CommonMistake,
  TopicPerformance,
  TeachingRecommendation
} from '../types/feedback'

/**
 * AI Feedback Engine Service
 * 
 * This service handles all AI-powered feedback generation using Google's Gemini AI.
 * It provides intelligent, personalized feedback based on student evaluation results
 * and configurable templates for different exam types.
 * 
 * Key capabilities:
 * - Personalized feedback generation with contextual prompts
 * - Template-based feedback structure and tone control
 * - Class-wide analytics and common mistake identification
 * - Feedback consistency validation and quality assurance
 * - Fallback mechanisms for AI service failures
 * 
 * @example
 * ```typescript
 * // Generate personalized feedback
 * const feedback = await aiFeedbackEngine.generatePersonalizedFeedback(
 *   evaluationData,
 *   template,
 *   studentInfo
 * );
 * 
 * // Generate class analytics
 * const analytics = await aiFeedbackEngine.generateClassAnalytics(evaluations);
 * 
 * // Validate feedback consistency
 * const validation = aiFeedbackEngine.validateFeedbackConsistency(
 *   feedback,
 *   evaluation
 * );
 * ```
 * 
 * @see {@link FeedbackService} for high-level feedback management
 * @see {@link FeedbackTemplate} for template configuration
 * @see {@link GeneratedFeedback} for output structure
 */
export class AIFeedbackEngine {
  private geminiApiKey: string = ''
  private geminiModel: string = 'gemini-2.0-flash'

  constructor() {
    this.initializeSettings()
  }

  /**
   * Initialize AI settings from global configuration
   */
  private async initializeSettings(): Promise<void> {
    try {
      const { data: settings } = await supabase
        .from('global_settings')
        .select('gemini_api_key, gemini_model')
        .single()

      if (settings) {
        this.geminiApiKey = settings.gemini_api_key || ''
        this.geminiModel = settings.gemini_model || 'gemini-2.0-flash'
      }
    } catch (error) {
      console.warn('Failed to load AI settings, using defaults:', error)
    }
  }

  /**
   * Generate personalized feedback for a student evaluation
   * 
   * This is the core method for AI-powered feedback generation. It constructs
   * a detailed prompt based on the evaluation results and template, calls the
   * Gemini AI API, and processes the response into structured feedback.
   * 
   * The generated feedback includes:
   * - Overall performance summary with key achievements and concerns
   * - Question-by-question detailed feedback and improvement tips
   * - Personalized study recommendations with priority levels
   * - Identified strengths and areas for improvement
   * 
   * @param evaluation - Complete evaluation data including scores and question results
   * @param template - Feedback template defining structure, tone, and detail level
   * @param studentInfo - Optional student context (name, subject, exam type)
   * @returns Promise resolving to structured feedback object
   * 
   * @throws {Error} When AI service is unavailable or API call fails
   * 
   * @example
   * ```typescript
   * const feedback = await aiFeedbackEngine.generatePersonalizedFeedback(
   *   {
   *     summary: { totalAwarded: 85, totalPossible: 100, percentage: 85 },
   *     questions: [{ heading: 'Q1', marks: '8/10', evaluation: 'Good work' }]
   *   },
   *   {
   *     examType: 'IELTS',
   *     tone: 'encouraging',
   *     detailLevel: 'detailed'
   *   },
   *   {
   *     studentName: 'John Doe',
   *     subject: 'English',
   *     examType: 'IELTS'
   *   }
   * );
   * ```
   */
  async generatePersonalizedFeedback(
    evaluation: EvaluationData,
    template: FeedbackTemplate,
    studentInfo?: StudentInfo
  ): Promise<GeneratedFeedback> {
    try {
      await this.initializeSettings()

      if (!this.geminiApiKey) {
        throw new Error('Gemini API key not configured')
      }

      const prompt = this.buildFeedbackPrompt(evaluation, template, studentInfo)
      const aiResponse = await this.callGeminiAPI(prompt)
      
      return this.parseFeedbackResponse(aiResponse, evaluation, template)
    } catch (error) {
      console.error('Failed to generate personalized feedback:', error)
      return this.createFallbackFeedback(evaluation, template)
    }
  }

  /**
   * Generate class-wide analytics from multiple evaluations
   */
  async generateClassAnalytics(evaluations: EvaluationData[]): Promise<ClassAnalytics> {
    try {
      if (evaluations.length === 0) {
        return this.createEmptyClassAnalytics()
      }

      const totalStudents = evaluations.length
      const averageScore = this.calculateAverageScore(evaluations)
      const commonMistakes = this.identifyCommonMistakes(evaluations)
      const topicPerformance = this.analyzeTopicPerformance(evaluations)
      const recommendations = await this.generateTeachingRecommendations(
        commonMistakes,
        topicPerformance
      )

      return {
        classId: `class-${Date.now()}`, // Generate temporary class ID
        totalStudents,
        averageScore,
        commonMistakes,
        topicPerformance,
        recommendations
      }
    } catch (error) {
      console.error('Failed to generate class analytics:', error)
      return this.createEmptyClassAnalytics()
    }
  }

  /**
   * Validate feedback consistency with evaluation results
   */
  validateFeedbackConsistency(
    feedback: GeneratedFeedback,
    evaluation: EvaluationData
  ): { isConsistent: boolean; issues: string[] } {
    const issues: string[] = []

    // Check if feedback matches evaluation grade
    if (feedback.overallSummary.grade !== evaluation.summary.grade?.grade) {
      issues.push('Feedback grade does not match evaluation grade')
    }

    // Check if question count matches
    if (feedback.questionFeedback.length !== evaluation.questions.length) {
      issues.push('Question feedback count does not match evaluation questions')
    }

    // Check for missing feedback on failed questions
    const failedQuestions = evaluation.questions.filter(q => {
      const [awarded, total] = q.marks.split('/').map(Number)
      return awarded < total * 0.5 // Less than 50% marks
    })

    const feedbackForFailedQuestions = feedback.questionFeedback.filter(qf =>
      failedQuestions.some(fq => fq.heading === qf.questionNumber)
    )

    if (feedbackForFailedQuestions.length < failedQuestions.length) {
      issues.push('Missing feedback for some failed questions')
    }

    return {
      isConsistent: issues.length === 0,
      issues
    }
  }

  /**
   * Build the prompt for Gemini AI feedback generation
   */
  private buildFeedbackPrompt(
    evaluation: EvaluationData,
    template: FeedbackTemplate,
    studentInfo?: StudentInfo
  ): string {
    const examType = studentInfo?.examType || 'Standard'
    const studentName = studentInfo?.studentName || 'Student'
    const subject = studentInfo?.subject || 'Unknown Subject'

    return `You are an expert educational feedback generator. Generate detailed, constructive feedback for a student's exam performance.

**Student Information:**
- Name: ${studentName}
- Subject: ${subject}
- Exam Type: ${examType}
- Overall Score: ${evaluation.summary.totalAwarded}/${evaluation.summary.totalPossible} (${evaluation.summary.percentage}%)
- Grade: ${evaluation.summary.grade?.grade || 'N/A'}

**Feedback Requirements:**
- Tone: ${template.tone}
- Detail Level: ${template.detailLevel}
- Template: ${template.templateName}

**Evaluation Results:**
${JSON.stringify(evaluation, null, 2)}

**Instructions:**
1. Provide an overall performance summary highlighting key strengths and areas for improvement
2. Give specific feedback for each question, focusing on:
   - What the student did well
   - Where they made mistakes
   - How to improve their approach
   - Study recommendations for weak areas
3. Suggest specific study resources and practice activities
4. Maintain a ${template.tone} tone throughout
5. Be specific and actionable in your recommendations

**Output Format (JSON):**
{
  "overallSummary": {
    "performance": "string - overall performance description",
    "grade": "${evaluation.summary.grade?.grade || 'N/A'}",
    "percentile": number or null,
    "keyAchievements": ["achievement1", "achievement2"],
    "mainConcerns": ["concern1", "concern2"]
  },
  "questionFeedback": [
    {
      "questionId": "string",
      "questionNumber": "string",
      "feedback": "string - detailed feedback",
      "correctApproach": "string - how to approach correctly",
      "commonMistakes": ["mistake1", "mistake2"],
      "improvementTips": ["tip1", "tip2"]
    }
  ],
  "recommendations": [
    {
      "topic": "string",
      "priority": "high|medium|low",
      "resources": ["resource1", "resource2"],
      "practiceActivities": ["activity1", "activity2"]
    }
  ],
  "strengths": ["strength1", "strength2"],
  "areasForImprovement": ["area1", "area2"]
}`
  }

  /**
   * Call Gemini AI API for feedback generation
   */
  private async callGeminiAPI(prompt: string): Promise<string> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 45000) // 45 second timeout

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${this.geminiModel}:generateContent?key=${this.geminiApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              responseMimeType: "application/json",
              temperature: 0.3, // Lower temperature for more consistent feedback
              topP: 0.8,
              topK: 20,
              maxOutputTokens: 4096
            }
          }),
          signal: controller.signal
        }
      )

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status} - ${await response.text()}`)
      }

      const result = await response.json()
      const generatedText = result.candidates?.[0]?.content?.parts?.[0]?.text

      if (!generatedText) {
        throw new Error('No content in Gemini response')
      }

      return generatedText
    } catch (error) {
      clearTimeout(timeoutId)
      throw handleApiError(error)
    }
  }

  /**
   * Parse AI response into structured feedback
   */
  private parseFeedbackResponse(
    aiResponse: string,
    evaluation: EvaluationData,
    template: FeedbackTemplate
  ): GeneratedFeedback {
    try {
      const parsed = JSON.parse(aiResponse)
      
      // Validate and sanitize the response
      return {
        overallSummary: this.validateFeedbackSummary(parsed.overallSummary, evaluation),
        questionFeedback: this.validateQuestionFeedback(parsed.questionFeedback, evaluation),
        recommendations: this.validateRecommendations(parsed.recommendations),
        strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
        areasForImprovement: Array.isArray(parsed.areasForImprovement) ? parsed.areasForImprovement : []
      }
    } catch (error) {
      console.error('Failed to parse AI feedback response:', error)
      return this.createFallbackFeedback(evaluation, template)
    }
  }

  /**
   * Validate and sanitize feedback summary
   */
  private validateFeedbackSummary(
    summary: any,
    evaluation: EvaluationData
  ): FeedbackSummary {
    return {
      performance: summary?.performance || 'Performance analysis completed',
      grade: summary?.grade || evaluation.summary.grade?.grade || 'N/A',
      percentile: typeof summary?.percentile === 'number' ? summary.percentile : null,
      keyAchievements: Array.isArray(summary?.keyAchievements) ? summary.keyAchievements : [],
      mainConcerns: Array.isArray(summary?.mainConcerns) ? summary.mainConcerns : []
    }
  }

  /**
   * Validate and sanitize question feedback
   */
  private validateQuestionFeedback(
    questionFeedback: any[],
    evaluation: EvaluationData
  ): QuestionFeedback[] {
    if (!Array.isArray(questionFeedback)) {
      return evaluation.questions.map((q, index) => ({
        questionId: `q${index + 1}`,
        questionNumber: q.heading,
        feedback: 'Feedback generated',
        correctApproach: 'Review the marking scheme',
        commonMistakes: [],
        improvementTips: ['Practice similar questions']
      }))
    }

    return questionFeedback.map((qf, index) => ({
      questionId: qf?.questionId || `q${index + 1}`,
      questionNumber: qf?.questionNumber || `Question ${index + 1}`,
      feedback: qf?.feedback || 'Feedback provided',
      correctApproach: qf?.correctApproach,
      commonMistakes: Array.isArray(qf?.commonMistakes) ? qf.commonMistakes : [],
      improvementTips: Array.isArray(qf?.improvementTips) ? qf.improvementTips : []
    }))
  }

  /**
   * Validate and sanitize study recommendations
   */
  private validateRecommendations(recommendations: any[]): StudyRecommendation[] {
    if (!Array.isArray(recommendations)) {
      return []
    }

    return recommendations.map(rec => ({
      topic: rec?.topic || 'General Study',
      priority: ['high', 'medium', 'low'].includes(rec?.priority) ? rec.priority : 'medium',
      resources: Array.isArray(rec?.resources) ? rec.resources : [],
      practiceActivities: Array.isArray(rec?.practiceActivities) ? rec.practiceActivities : []
    }))
  }

  /**
   * Create fallback feedback when AI generation fails
   */
  private createFallbackFeedback(
    evaluation: EvaluationData,
    template: FeedbackTemplate
  ): GeneratedFeedback {
    const percentage = evaluation.summary.percentage || 0
    const grade = evaluation.summary.grade?.grade || 'N/A'

    return {
      overallSummary: {
        performance: `You scored ${evaluation.summary.totalAwarded}/${evaluation.summary.totalPossible} (${percentage}%) with a grade of ${grade}.`,
        grade,
        percentile: null,
        keyAchievements: percentage >= 70 ? ['Good overall performance'] : [],
        mainConcerns: percentage < 50 ? ['Needs improvement in several areas'] : []
      },
      questionFeedback: evaluation.questions.map((q, index) => ({
        questionId: `q${index + 1}`,
        questionNumber: q.heading,
        feedback: q.evaluation,
        correctApproach: 'Review the marking scheme and model answers',
        commonMistakes: [],
        improvementTips: ['Practice similar questions', 'Review relevant study materials']
      })),
      recommendations: [{
        topic: 'General Study',
        priority: 'medium' as const,
        resources: ['Textbook review', 'Practice papers'],
        practiceActivities: ['Complete additional exercises', 'Review weak topics']
      }],
      strengths: percentage >= 70 ? ['Demonstrates understanding of key concepts'] : [],
      areasForImprovement: percentage < 70 ? ['Focus on weaker topic areas'] : []
    }
  }

  /**
   * Calculate average score from evaluations
   */
  private calculateAverageScore(evaluations: EvaluationData[]): number {
    const validScores = evaluations
      .map(e => e.summary.percentage)
      .filter((score): score is number => score !== null && score !== undefined)

    if (validScores.length === 0) return 0

    return Math.round(validScores.reduce((sum, score) => sum + score, 0) / validScores.length)
  }

  /**
   * Identify common mistakes across evaluations
   */
  private identifyCommonMistakes(evaluations: EvaluationData[]): CommonMistake[] {
    const mistakes: Record<string, { count: number; questions: string[] }> = {}

    evaluations.forEach(evaluation => {
      evaluation.questions.forEach(question => {
        const [awarded, total] = question.marks.split('/').map(Number)
        if (awarded < total * 0.5) { // Failed question
          const key = question.heading.replace(/\d+/g, 'X') // Normalize question numbers
          if (!mistakes[key]) {
            mistakes[key] = { count: 0, questions: [] }
          }
          mistakes[key].count++
          mistakes[key].questions.push(question.heading)
        }
      })
    })

    return Object.entries(mistakes)
      .filter(([, data]) => data.count >= 2) // At least 2 students made this mistake
      .map(([questionType, data]) => ({
        questionType,
        mistake: `Common difficulty with ${questionType}`,
        frequency: Math.round((data.count / evaluations.length) * 100),
        suggestedIntervention: `Review ${questionType} concepts and provide additional practice`
      }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 5) // Top 5 common mistakes
  }

  /**
   * Analyze topic performance across evaluations
   */
  private analyzeTopicPerformance(evaluations: EvaluationData[]): TopicPerformance[] {
    const topics: Record<string, { scores: number[]; total: number }> = {}

    evaluations.forEach(evaluation => {
      evaluation.questions.forEach(question => {
        const [awarded, total] = question.marks.split('/').map(Number)
        const score = total > 0 ? (awarded / total) * 100 : 0
        const topic = question.heading.split(' ')[0] // Use first word as topic
        
        if (!topics[topic]) {
          topics[topic] = { scores: [], total: 0 }
        }
        topics[topic].scores.push(score)
        topics[topic].total++
      })
    })

    return Object.entries(topics).map(([topic, data]) => {
      const averageScore = Math.round(data.scores.reduce((sum, score) => sum + score, 0) / data.scores.length)
      const studentsStruggling = data.scores.filter(score => score < 50).length
      const studentsExcelling = data.scores.filter(score => score >= 80).length

      return {
        topic,
        averageScore,
        studentsStruggling,
        studentsExcelling
      }
    }).sort((a, b) => a.averageScore - b.averageScore) // Worst performing topics first
  }

  /**
   * Generate teaching recommendations based on analytics
   */
  private async generateTeachingRecommendations(
    commonMistakes: CommonMistake[],
    topicPerformance: TopicPerformance[]
  ): Promise<TeachingRecommendation[]> {
    const recommendations: TeachingRecommendation[] = []

    // Recommendations based on common mistakes
    commonMistakes.slice(0, 3).forEach(mistake => {
      recommendations.push({
        area: mistake.questionType,
        priority: mistake.frequency > 50 ? 'high' : 'medium',
        suggestion: mistake.suggestedIntervention,
        resources: ['Additional practice materials', 'Concept review sessions']
      })
    })

    // Recommendations based on topic performance
    topicPerformance.slice(0, 3).forEach(topic => {
      if (topic.averageScore < 60) {
        recommendations.push({
          area: topic.topic,
          priority: topic.averageScore < 40 ? 'high' : 'medium',
          suggestion: `Focus on ${topic.topic} - ${topic.studentsStruggling} students struggling`,
          resources: ['Targeted worksheets', 'One-on-one support', 'Peer tutoring']
        })
      }
    })

    return recommendations.slice(0, 5) // Limit to top 5 recommendations
  }

  /**
   * Create empty class analytics for error cases
   */
  private createEmptyClassAnalytics(): ClassAnalytics {
    return {
      classId: 'empty',
      totalStudents: 0,
      averageScore: 0,
      commonMistakes: [],
      topicPerformance: [],
      recommendations: []
    }
  }
}

// Export singleton instance
export const aiFeedbackEngine = new AIFeedbackEngine()