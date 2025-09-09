---
inclusion: always
---

# AI Exam Evaluator Product Guide

## Core Product Identity
AI-powered exam evaluation platform using Google Gemini AI for consistent, intelligent assessment of student papers across multiple exam types (IELTS, O-Level, A-Level, IGCSE).

## Key User Roles & Permissions

### Educators (Primary Users)
- Upload and evaluate exam papers
- Review and edit AI-generated feedback
- Access class analytics and performance insights
- Manage student evaluations and feedback publication

### Administrators
- User management and system configuration
- Evaluation limits and quota management
- Feedback template configuration
- System analytics and monitoring

### Students (Read-Only Access)
- View evaluation results and personalized feedback
- Access study recommendations and improvement suggestions
- Track progress over time

## Core Workflows

### Evaluation Workflow
1. **Upload**: PDF exam papers + marking schemes
2. **Configure**: Exam type, total marks, student information
3. **Process**: AI evaluation via Gemini API
4. **Review**: Interactive editing of results
5. **Generate**: AI-powered personalized feedback
6. **Publish**: Teacher approval and student access

### Feedback Generation Workflow
1. **Auto-Generate**: AI creates personalized feedback using `aiFeedbackEngine`
2. **Teacher Review**: Edit feedback via `feedbackService`
3. **Template Selection**: Apply exam-type specific templates
4. **Quality Control**: Ensure educational standards before publishing
5. **Student Access**: Secure delivery of feedback with study recommendations

## Technical Implementation Guidelines

### Service Layer Architecture
- `evaluationService`: Core evaluation logic and AI integration
- `feedbackService`: Feedback management and teacher workflow
- `aiFeedbackEngine`: AI-powered feedback generation engine
- All services must implement proper error handling and rate limiting

### Data Models
- Use TypeScript interfaces from `src/types/feedback.ts`
- Implement proper validation for all user inputs
- Follow database schema in `supabase/migrations/`

### Security Requirements
- All feedback operations require authentication
- Implement role-based access control (RBAC)
- Use `feedbackSecurity.ts` for security utilities
- Rate limit AI API calls to prevent abuse

### Performance Considerations
- Lazy load heavy components (ExamEvaluator, Analytics)
- Implement caching for frequently accessed evaluations
- Batch AI requests when processing multiple papers
- Use Suspense boundaries for loading states

## Feature-Specific Guidelines

### IGCSE Specialized Features
- Support multiple paper types (Paper 1, 2, 3, 4)
- Subject-specific evaluation criteria
- Cambridge assessment standards compliance
- Specialized feedback templates for IGCSE format

### Analytics Dashboard
- Class-wide performance metrics
- Common mistake identification
- Teaching recommendation generation
- Progress tracking over time
- Export capabilities for reports

### Feedback System
- Multi-format feedback support (detailed, summary, constructive)
- Question-by-question breakdown
- Personalized study recommendations
- Teacher editing and approval workflow
- Student progress tracking

## Content Standards

### Feedback Quality
- Constructive and actionable feedback
- Age-appropriate language for target students
- Specific improvement suggestions with resources
- Balanced highlighting of strengths and areas for improvement

### Evaluation Consistency
- Standardized rubrics for each exam type
- Consistent scoring across similar papers
- Clear justification for marks awarded/deducted
- Alignment with official marking schemes

## Integration Points

### AI Services
- Google Gemini API for evaluation and feedback generation
- Implement proper error handling and fallbacks
- Cache responses to optimize performance
- Monitor API usage and costs

### Database Integration
- Supabase for data persistence and authentication
- Row Level Security (RLS) for data access control
- Real-time subscriptions for collaborative features
- Proper indexing for performance optimization

### File Processing
- PDF.js for document parsing and rendering
- Support for various PDF formats and sizes
- Secure file upload and storage
- Virus scanning and validation