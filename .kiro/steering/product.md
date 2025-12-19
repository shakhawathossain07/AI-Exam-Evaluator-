# Product Overview

## AI Exam Evaluator

The AI Exam Evaluator is a web application that uses Google's Gemini AI to evaluate exam papers with precision and consistency. It serves educators by providing an efficient, reliable tool for academic assessment.

## Key Features

- **AI-Powered Evaluation**: Uses Google Gemini AI for intelligent exam paper assessment
- **Multiple Exam Types**: Supports IELTS, O-Level, A-Level, IGCSE, and standard grading systems
- **PDF Processing**: Advanced PDF parsing with page-by-page analysis
- **Real-time Preview**: Interactive evaluation review with editing capabilities
- **Secure Authentication**: Role-based access control with admin panel
- **Results Management**: History tracking, analytics, and export capabilities

## Target Users

- **Educators**: Teachers and professors evaluating student papers
- **Administrators**: System admins managing users and evaluation limits
- **Students**: Limited access for viewing their evaluation results

## Core Workflow

1. Upload student exam papers and marking schemes (PDF format)
2. Configure evaluation parameters (total marks, exam type, student info)
3. AI processes and evaluates the papers
4. Review and edit evaluation results
5. Save evaluations and export reports

## Security & Access

- Multi-factor authentication via Supabase
- Role-based permissions (user/admin)
- Rate limiting and input validation
- Production builds include code obfuscation and security hardening