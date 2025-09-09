# Configuration Module

This module provides centralized configuration management for the AI Exam Evaluator application.

## Files

### `environment.ts`
Handles environment variable validation and configuration parsing.

**Key Functions:**
- `validateEnvironment()` - Validates required environment variables
- `getEnvironmentConfig()` - Returns typed configuration object
- `getEnvVar(key, defaultValue?)` - Type-safe environment variable getter
- `isAppConfigured()` - Checks if app is properly configured

**Usage:**
```typescript
import { getEnvironmentConfig, isAppConfigured } from './config/environment';

if (!isAppConfigured()) {
  console.error('Application not properly configured');
  return;
}

const config = getEnvironmentConfig();
console.log('Supabase URL:', config.supabase.url);
```

### `security.ts`
Manages security headers and CORS configuration.

**Key Functions:**
- `createSecurityHeaders(isProduction)` - Creates security headers
- `createCorsConfig(isProduction)` - Creates CORS configuration
- `getSecurityConfig(isProduction)` - Returns complete security config
- `createCSPHeader(directives)` - Creates CSP header from directives

**Usage:**
```typescript
import { getSecurityConfig } from './config/security';

const securityConfig = getSecurityConfig(process.env.NODE_ENV === 'production');
app.use(helmet(securityConfig.headers));
```

### `feedbackSecurity.ts`
Manages access control and security for the feedback system.

**Key Functions:**
- `getFeedbackPermissions(userId, feedbackId?)` - Check user permissions for feedback operations
- `validateFeedbackData(feedbackData)` - Validate feedback data structure and content
- `sanitizeFeedbackContent(content)` - Sanitize feedback content to prevent XSS
- `canAccessStudentFeedback(userId, studentId)` - Check if user can access student feedback
- `logFeedbackAccess(userId, feedbackId, action)` - Log feedback access for audit purposes
- `FeedbackRateLimiter` - Rate limiting class for feedback generation

**Usage:**
```typescript
import { getFeedbackPermissions, validateFeedbackData } from './config/feedbackSecurity';

// Check permissions before allowing feedback operations
const permissions = await getFeedbackPermissions(userId, feedbackId);
if (!permissions.canEditFeedback) {
  throw new Error('Insufficient permissions');
}

// Validate feedback data before saving
const validation = validateFeedbackData(feedbackData);
if (!validation.isValid) {
  throw new Error(`Invalid data: ${validation.errors.join(', ')}`);
}
```

## Environment Variables

### Required
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key

### Optional
- `VITE_GEMINI_API_KEY` - Google Gemini AI API key
- `VITE_DEV_PORT` - Development server port (default: 5173)
- `VITE_SITE_URL` - Site URL for redirects (default: http://localhost:5173)

## Security Configuration

The security module provides environment-aware security settings:

### Production Security
- Strict CSP with `upgrade-insecure-requests`
- `X-Frame-Options: DENY`
- `Cross-Origin-Embedder-Policy: credentialless`
- Restricted CORS origins

### Development Security
- Relaxed CSP allowing localhost WebSocket connections
- `X-Frame-Options: SAMEORIGIN` (for testing compatibility)
- `Cross-Origin-Embedder-Policy: unsafe-none`
- Permissive CORS for local development

## Feedback Security Features

### Access Control
The feedback security module implements comprehensive access control:

- **Role-based permissions**: Admin vs. regular user access levels
- **Ownership validation**: Users can only access their own feedback
- **Student access**: Students can view published feedback for their evaluations
- **Rate limiting**: Prevents abuse of feedback generation (10 per hour per user)

### Data Validation
- **Required field validation**: Ensures all necessary data is present
- **Status validation**: Validates feedback status transitions
- **Structure validation**: Validates generated feedback structure
- **Content sanitization**: Prevents XSS attacks in feedback content

### Audit Logging
- **Access tracking**: Logs all feedback access attempts
- **Action logging**: Records view, edit, publish, and delete actions
- **User identification**: Associates all actions with specific users
- **Timestamp tracking**: Maintains audit trail with precise timing

## Testing

Run configuration tests:
```bash
npm test src/config
```

The tests cover:
- Environment variable validation
- Security header generation
- CSP directive handling
- CORS configuration
- Error handling for missing variables
- Feedback security validation
- Access control permissions
- Rate limiting functionality