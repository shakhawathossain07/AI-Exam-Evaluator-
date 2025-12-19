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