---
inclusion: fileMatch
fileMatchPattern: ['**/services/aiFeedbackEngine.ts', '**/services/feedbackService.ts', '**/services/evaluationService.ts', '**/services/api.ts']
---

# AI Integration Guidelines

## Google Gemini AI Configuration
- **API Key**: Use `VITE_GEMINI_API_KEY` environment variable
- **Model**: Default `gemini-2.0-flash` (configurable)
- **Timeout**: 45 seconds for API calls
- **Rate Limiting**: 10 generations per hour per user
- **Generation Parameters**: Temperature 0.3, TopP 0.8, TopK 20, Max tokens 4096

## Core AI Services Architecture

### Service Layer Pattern
```typescript
// Primary services
aiFeedbackEngine.generatePersonalizedFeedback(evaluation, template, studentInfo)
aiFeedbackEngine.generateClassAnalytics(evaluations)
evaluationService.evaluateExamPaper(input)
feedbackService.generateFeedback(evaluationId, options)
```

### Required Response Validation
- Always validate JSON responses from AI
- Implement fallback for malformed responses
- Sanitize all AI-generated content
- Validate feedback consistency with evaluation data

## Prompt Engineering Standards

### Evaluation Prompts Structure
```
CONTEXT: You are evaluating a [EXAM_TYPE] exam paper.
TASK: Grade against marking scheme.
MARKING SCHEME: [content]
STUDENT ANSWERS: [content]
OUTPUT FORMAT: JSON with score, breakdown, feedback, justification
```

### Feedback Generation Structure
```typescript
// Required output format
{
  overallSummary: { performance, grade, keyAchievements, mainConcerns },
  questionFeedback: [{ questionNumber, feedback, correctApproach, improvementTips }],
  recommendations: [{ topic, priority, resources, practiceActivities }],
  strengths: string[],
  areasForImprovement: string[]
}
```

## Error Handling Patterns

### Required Error Handling
```typescript
try {
  const result = await aiFeedbackEngine.generatePersonalizedFeedback(evaluation, template, studentInfo)
} catch (error) {
  if (error.type === 'AI_SERVICE_UNAVAILABLE') {
    return createFallbackFeedback(evaluation)
  }
  throw error
}
```

### Retry Logic
- Exponential backoff for API failures
- Maximum 3 retry attempts
- Log all API interactions for monitoring

## Feedback Template System

### Template Interface
```typescript
interface FeedbackTemplate {
  id: string
  examType: 'IELTS' | 'O-Level' | 'A-Level' | 'IGCSE'
  templateName: string
  sections: FeedbackSection[]
  tone: 'formal' | 'encouraging' | 'constructive'
  detailLevel: 'brief' | 'detailed' | 'comprehensive'
  isActive: boolean
}
```

### Default Template Configurations
- **IELTS**: Constructive tone, detailed level, band score focus
- **O-Level**: Encouraging tone, comprehensive level, concept understanding
- **A-Level**: Formal tone, comprehensive level, critical thinking analysis
- **IGCSE**: Balanced tone, detailed level, curriculum alignment

## Security Requirements

### Data Protection
- Never include PII in AI prompts
- Sanitize all inputs before sending to AI
- Implement access control for feedback operations
- Log API usage for audit purposes

### Rate Limiting
- Enforce per-user generation limits
- Monitor for abuse patterns
- Implement progressive delays for repeated failures

## Performance Optimization

### Caching Strategy
- Cache frequently used templates
- Cache AI responses where appropriate
- Implement intelligent batching for multiple requests

### Cost Management
- Monitor token usage and optimize prompt length
- Use appropriate model versions for different tasks
- Batch operations when possible

## Quality Assurance

### Validation Requirements
- Implement confidence scoring for evaluations
- Flag low-confidence results for manual review
- Validate feedback consistency (grades, question counts, coverage)
- Track evaluation accuracy against manual reviews

### Monitoring Metrics
- AI API response times
- Feedback generation success rates
- User satisfaction with generated feedback
- Token usage and costs

## Class Analytics

### Analytics Generation
```typescript
interface ClassAnalytics {
  totalStudents: number
  averageScore: number
  commonMistakes: CommonMistake[]
  topicPerformance: TopicPerformance[]
  recommendations: TeachingRecommendation[]
}
```

### Requirements
- Minimum 3 students for meaningful analytics
- Privacy-compliant aggregation (no individual identification)
- Regular generation (weekly/monthly)

## Integration Best Practices

1. **Always validate AI outputs** before saving to database
2. **Implement graceful fallbacks** for AI service unavailability
3. **Use structured prompts** with clear context, task, and format sections
4. **Cache responses** to reduce API calls and costs
5. **Monitor quality** through confidence scoring and manual review flags
6. **Sanitize inputs** to prevent prompt injection attacks
7. **Log interactions** for debugging and quality improvement