/**
 * Security configuration for headers and policies
 * Provides environment-aware security settings
 */

export interface SecurityConfig {
  headers: Record<string, string>;
  cors: {
    origin: string[];
    methods: string[];
    allowedHeaders: string[];
    credentials: boolean;
  };
}

export interface CSPDirectives {
  defaultSrc: string[];
  scriptSrc: string[];
  styleSrc: string[];
  imgSrc: string[];
  fontSrc: string[];
  connectSrc: string[];
  mediaSrc: string[];
  objectSrc: string[];
  frameSrc: string[];
  baseUri: string[];
  formAction: string[];
  upgradeInsecureRequests?: boolean;
}

/**
 * Creates Content Security Policy header value from directives
 */
export function createCSPHeader(directives: CSPDirectives): string {
  const policies: string[] = [];

  Object.entries(directives).forEach(([key, value]) => {
    if (key === 'upgradeInsecureRequests') {
      if (value) policies.push('upgrade-insecure-requests');
      return;
    }

    if (Array.isArray(value) && value.length > 0) {
      const directive = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      policies.push(`${directive} ${value.join(' ')}`);
    }
  });

  return policies.join('; ') + ';';
}

/**
 * Gets CSP directives based on environment
 */
export function getCSPDirectives(isProduction: boolean): CSPDirectives {
  const baseDirectives: CSPDirectives = {
    defaultSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
    scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://unpkg.com", "blob:"],
    styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
    imgSrc: ["'self'", "data:", "blob:", "https:", "http:"],
    fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
    connectSrc: [
      "'self'",
      "https://generativelanguage.googleapis.com",
      "https://*.supabase.co",
      "https://api.gemini.google.com",
      "wss://*.supabase.co",
      "ws://localhost:*",
      "ws://127.0.0.1:*"
    ],
    mediaSrc: ["'self'", "blob:", "data:"],
    objectSrc: ["'none'"],
    frameSrc: ["'self'"],
    baseUri: ["'self'"],
    formAction: ["'self'"],
  };

  // Add development-specific policies
  if (!isProduction) {
    baseDirectives.connectSrc.push("ws://localhost:*", "ws://127.0.0.1:*", "http://localhost:*", "http://127.0.0.1:*");
    baseDirectives.scriptSrc.push("http://localhost:*", "http://127.0.0.1:*");
  } else {
    baseDirectives.upgradeInsecureRequests = true;
  }

  return baseDirectives;
}

/**
 * Creates security headers configuration
 */
export function createSecurityHeaders(isProduction: boolean): Record<string, string> {
  const headers: Record<string, string> = {
    'X-Content-Type-Options': 'nosniff',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Cross-Origin-Embedder-Policy': 'unsafe-none', // More permissive for testing
    'Cross-Origin-Opener-Policy': 'unsafe-none', // More permissive for testing
    'Content-Security-Policy': createCSPHeader(getCSPDirectives(isProduction)),
  };

  // Only set X-Frame-Options in production to avoid TestSprite issues
  if (isProduction) {
    headers['X-Frame-Options'] = 'DENY';
  }

  return headers;
}

/**
 * Creates CORS configuration
 */
export function createCorsConfig(isProduction: boolean): SecurityConfig['cors'] {
  return {
    origin: isProduction 
      ? ['https://aiexamevaluator.me'] 
      : ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:5173', 'https://aiexamevaluator.me', '*'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'Cache-Control', 'X-File-Name'],
    credentials: true,
  };
}

/**
 * Gets complete security configuration
 */
export function getSecurityConfig(isProduction: boolean): SecurityConfig {
  return {
    headers: createSecurityHeaders(isProduction),
    cors: createCorsConfig(isProduction),
  };
}