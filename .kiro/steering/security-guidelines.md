# Security Guidelines and Best Practices

## Authentication and Authorization

### Supabase Auth Integration
- Use Supabase's built-in authentication for user management
- Implement Row Level Security (RLS) for all database tables
- Never bypass authentication checks in production code
- Use JWT tokens for API authentication

### Role-Based Access Control
```typescript
// Example permission checking
const checkPermission = async (userId: string, resource: string, action: string) => {
  const userRole = await getUserRole(userId);
  return hasPermission(userRole, resource, action);
};
```

### Session Management
- Implement automatic session timeout (30 minutes idle)
- Use secure, httpOnly cookies for session storage
- Invalidate sessions on password change
- Monitor for concurrent session abuse

## Data Protection

### Sensitive Data Handling
- Encrypt all PII (Personally Identifiable Information)
- Use environment variables for all secrets
- Never log sensitive data (passwords, tokens, personal info)
- Implement data retention policies

### File Upload Security
```typescript
// File validation example
const validateUploadedFile = (file: File) => {
  // Check file type
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    throw new Error('Invalid file type');
  }
  
  // Check file size (max 10MB)
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('File too large');
  }
  
  // Scan for malware (implement virus scanning)
  return scanForViruses(file);
};
```

### Database Security
- Use parameterized queries to prevent SQL injection
- Implement proper RLS policies for all tables
- Encrypt sensitive columns at rest
- Regular security audits of database access

## API Security

### Input Validation
```typescript
// Example input validation
const validateEvaluationInput = (input: unknown) => {
  const schema = z.object({
    studentId: z.string().uuid(),
    examType: z.enum(['IELTS', 'O_LEVEL', 'A_LEVEL', 'IGCSE']),
    totalMarks: z.number().positive().max(1000)
  });
  
  return schema.parse(input);
};
```

### Rate Limiting
- Implement rate limiting on all API endpoints
- Use progressive delays for repeated failures
- Monitor for abuse patterns
- Block suspicious IP addresses

### CORS Configuration
```typescript
// Secure CORS setup
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'],
  credentials: true,
  optionsSuccessStatus: 200
};
```

## Frontend Security

### XSS Prevention
- Sanitize all user input before rendering
- Use Content Security Policy (CSP) headers
- Avoid dangerouslySetInnerHTML
- Validate and escape dynamic content

### CSRF Protection
- Use CSRF tokens for state-changing operations
- Implement SameSite cookie attributes
- Validate referrer headers for sensitive actions

### Secure Communication
- Use HTTPS for all communications
- Implement certificate pinning where possible
- Validate SSL certificates
- Use secure WebSocket connections (WSS)

## Environment and Configuration Security

### Environment Variables
```bash
# .env.example - Never commit actual values
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GEMINI_API_KEY=your_gemini_api_key

# Production-only variables
DATABASE_PASSWORD=secure_password
JWT_SECRET=random_secure_secret
ENCRYPTION_KEY=32_byte_encryption_key
```

### Production Security
- Enable security headers (HSTS, X-Frame-Options, etc.)
- Disable debug mode and verbose error messages
- Remove development dependencies from production
- Implement proper logging without sensitive data

## Monitoring and Incident Response

### Security Monitoring
- Log all authentication attempts
- Monitor for unusual access patterns
- Track failed login attempts and account lockouts
- Alert on suspicious activities

### Audit Logging
```typescript
// Example audit log entry
const logSecurityEvent = (event: SecurityEvent) => {
  auditLogger.info({
    timestamp: new Date().toISOString(),
    userId: event.userId,
    action: event.action,
    resource: event.resource,
    ipAddress: event.ipAddress,
    userAgent: event.userAgent,
    success: event.success,
    details: event.details
  });
};
```

### Incident Response
- Have a security incident response plan
- Implement automated threat detection
- Maintain contact information for security team
- Regular security drills and testing

## Code Security Practices

### Secure Coding Standards
- Regular security code reviews
- Use static analysis tools (ESLint security rules)
- Implement dependency vulnerability scanning
- Keep all dependencies updated

### Secret Management
- Never commit secrets to version control
- Use secret management services in production
- Rotate secrets regularly
- Implement least-privilege access

### Error Handling
```typescript
// Secure error handling
const handleError = (error: Error, req: Request) => {
  // Log detailed error for debugging
  logger.error('Detailed error info', { error, userId: req.user?.id });
  
  // Return generic error to client
  return {
    message: 'An error occurred',
    code: 'INTERNAL_ERROR',
    // Never expose internal details
  };
};
```

## Compliance and Privacy

### GDPR Compliance
- Implement data subject rights (access, deletion, portability)
- Maintain data processing records
- Implement privacy by design
- Regular privacy impact assessments

### Data Retention
- Implement automatic data deletion policies
- Archive old data securely
- Provide data export capabilities
- Document data flows and storage

## Security Testing

### Regular Security Assessments
- Automated vulnerability scanning
- Penetration testing (quarterly)
- Code security reviews
- Dependency vulnerability checks

### Security Test Cases
```typescript
describe('Security Tests', () => {
  it('should reject requests without valid authentication', async () => {
    const response = await request(app)
      .get('/api/evaluations')
      .expect(401);
  });
  
  it('should prevent SQL injection in search queries', async () => {
    const maliciousInput = "'; DROP TABLE users; --";
    const response = await request(app)
      .get(`/api/search?q=${maliciousInput}`)
      .expect(400);
  });
});
```