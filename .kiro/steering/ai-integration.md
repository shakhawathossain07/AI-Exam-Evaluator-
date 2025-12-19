# AI Integration Guidelines

## Google Gemini AI Integration

### API Configuration
- Use environment variables for API keys: `VITE_GEMINI_API_KEY`
- Implement proper error handling for API failures
- Add retry logic with exponential backoff
- Monitor API usage and costs

### Prompt Engineering Best Practices

#### Evaluation Prompts
- Structure prompts with clear sections: context, task, format
- Include specific grading criteria and rubrics
- Provide examples of good and poor answers
- Specify output format requirements (JSON, structured text)

#### Example Prompt Structure
```
CONTEXT: You are evaluating a [EXAM_TYPE] exam paper.

TASK: Grade the following student answers against the marking scheme.

MARKING SCHEME:
[Insert marking scheme content]

STUDENT ANSWERS:
[Insert student answers]

OUTPUT FORMAT:
Provide results in JSON format with:
- Overall score and percentage
- Question-by-question breakdown
- Detailed feedback for each answer
- Justification for marks awarded

GRADING CRITERIA:
- Award full marks for complete correct answers
- Give partial credit for partially correct responses
- Provide constructive feedback for improvement
- Be consistent with marking standards
```

### Response Processing
- Validate AI responses before saving
- Implement fallback mechanisms for malformed responses
- Log AI interactions for quality monitoring
- Cache responses to reduce API calls

### Quality Assurance
- Implement confidence scoring for AI evaluations
- Flag evaluations with low confidence for manual review
- Track evaluation accuracy against manual reviews
- Continuously improve prompts based on feedback

### Cost Optimization
- Batch multiple evaluations when possible
- Implement intelligent caching strategies
- Monitor token usage and optimize prompt length
- Use appropriate model versions for different tasks

### Security Considerations
- Never include sensitive data in prompts
- Implement rate limiting for API calls
- Secure API key storage and rotation
- Log API usage for audit purposes