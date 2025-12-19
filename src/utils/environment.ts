/**
 * Environment Security Configuration
 * Validates environment variables and prevents exposure of sensitive data
 */

interface EnvironmentConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  isDevelopment: boolean;
  isProduction: boolean;
}

interface SecurityHeaders {
  [key: string]: string;
}

/**
 * Validate environment variables for security
 */
export function validateEnvironment(): EnvironmentConfig {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const mode = import.meta.env.MODE;

  // Check for required environment variables
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing required environment variables. Please check your .env file.');
  }

  // Validate that placeholder values are replaced
  if (supabaseUrl.includes('your-project-ref') || 
      supabaseAnonKey.includes('your-anon-key')) {
    throw new Error('Environment variables contain placeholder values. Please update your .env file with actual Supabase credentials.');
  }

  // Validate URL format
  try {
    new URL(supabaseUrl);
  } catch {
    throw new Error('Invalid Supabase URL format in environment variables.');
  }

  // Validate that we're using HTTPS in production
  if (mode === 'production' && !supabaseUrl.startsWith('https://')) {
    throw new Error('Supabase URL must use HTTPS in production.');
  }

  // Validate key format (basic check)
  if (supabaseAnonKey.length < 100) {
    throw new Error('Supabase anon key appears to be invalid (too short).');
  }

  return {
    supabaseUrl,
    supabaseAnonKey,
    isDevelopment: mode === 'development',
    isProduction: mode === 'production'
  };
}

/**
 * Generate Content Security Policy headers
 */
export function generateCSPHeaders(): SecurityHeaders {
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob: https:",
    "connect-src 'self' https://*.supabase.co https://generativelanguage.googleapis.com",
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests"
  ];

  return {
    'Content-Security-Policy': cspDirectives.join('; '),
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
  };
}

/**
 * Sanitize environment variables for client-side use
 */
export function sanitizeClientEnv(): Record<string, string> {
  const env = validateEnvironment();
  
  // Only expose necessary variables to client
  return {
    SUPABASE_URL: env.supabaseUrl,
    SUPABASE_ANON_KEY: env.supabaseAnonKey,
    MODE: env.isDevelopment ? 'development' : 'production'
  };
}

/**
 * Check for development-only features in production
 */
export function checkProductionSafety(): void {
  const env = validateEnvironment();
  
  if (env.isProduction) {
    // Check for console.log statements (should be removed in production)
    if (typeof console !== 'undefined' && console.log.toString().indexOf('native code') === -1) {
      console.warn('Custom console override detected. This may expose sensitive information.');
    }

    // Check for localStorage debugging tools
    try {
      if (localStorage.getItem('debug') || 
          localStorage.getItem('devtools') ||
          sessionStorage.getItem('debug')) {
        console.warn('Debug flags detected in storage. Remove for production.');
      }
    } catch {
      // Storage access failed, which is fine
    }

    // Check for development URLs
    if (window.location.hostname === 'localhost' || 
        window.location.hostname === '127.0.0.1' ||
        window.location.hostname.includes('dev') ||
        window.location.hostname.includes('staging')) {
      console.warn('Running production build on development/staging domain.');
    }
  }
}

/**
 * Initialize security monitoring
 */
export function initializeSecurity(): void {
  // Validate environment on startup
  try {
    validateEnvironment();
    checkProductionSafety();
  } catch (error) {
    console.error('Security validation failed:', error);
    // In production, we might want to prevent app startup
    if (import.meta.env.MODE === 'production') {
      throw error;
    }
  }

  // Disable right-click in production (optional)
  if (import.meta.env.MODE === 'production') {
    document.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });

    // Disable F12, Ctrl+Shift+I, etc.
    document.addEventListener('keydown', (e) => {
      if (e.key === 'F12' || 
          (e.ctrlKey && e.shiftKey && e.key === 'I') ||
          (e.ctrlKey && e.shiftKey && e.key === 'C') ||
          (e.ctrlKey && e.key === 'U')) {
        e.preventDefault();
      }
    });
  }

  // Monitor for suspicious activity
  let rapidClickCount = 0;
  let lastClickTime = 0;
  
  document.addEventListener('click', () => {
    const now = Date.now();
    if (now - lastClickTime < 100) {
      rapidClickCount++;
      if (rapidClickCount > 10) {
        console.warn('Rapid clicking detected - possible automation');
        rapidClickCount = 0;
      }
    } else {
      rapidClickCount = 0;
    }
    lastClickTime = now;
  });

  // Clear sensitive data on page unload
  window.addEventListener('beforeunload', () => {
    try {
      // Clear any cached API keys or sensitive data
      const sensitiveKeys = ['apiKey', 'token', 'password', 'secret'];
      sensitiveKeys.forEach(key => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      });
    } catch {
      // Storage cleanup failed, but don't block unload
    }
  });
}

/**
 * Secure error logging that doesn't expose sensitive data
 */
export function secureLog(level: 'info' | 'warn' | 'error', message: string, data?: unknown): void {
  const env = validateEnvironment();
  
  // Only log in development or specific production scenarios
  if (env.isDevelopment || level === 'error') {
    const sanitizedData = data ? sanitizeLogData(data) : undefined;
    
    switch (level) {
      case 'info':
        console.info(`[SECURE] ${message}`, sanitizedData);
        break;
      case 'warn':
        console.warn(`[SECURE] ${message}`, sanitizedData);
        break;
      case 'error':
        console.error(`[SECURE] ${message}`, sanitizedData);
        break;
    }
  }
}

/**
 * Remove sensitive data from log objects
 */
function sanitizeLogData(data: unknown): unknown {
  if (typeof data === 'string') {
    // Remove potential API keys, tokens, passwords
    return data.replace(/([a-zA-Z0-9]{20,})/g, '[REDACTED]');
  }
  
  if (Array.isArray(data)) {
    return data.map(item => sanitizeLogData(item));
  }
  
  if (typeof data === 'object' && data !== null) {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      const lowerKey = key.toLowerCase();
      if (lowerKey.includes('password') || 
          lowerKey.includes('token') || 
          lowerKey.includes('key') ||
          lowerKey.includes('secret')) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = sanitizeLogData(value);
      }
    }
    return sanitized;
  }
  
  return data;
}

/**
 * Check if running in a secure context
 */
export function isSecureContext(): boolean {
  // Check for HTTPS (required for many security features)
  if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
    return false;
  }
  
  // Check for required security APIs
  if (!window.crypto || !window.crypto.subtle) {
    return false;
  }
  
  return true;
}

/**
 * Generate integrity hash for external resources
 */
export async function generateIntegrityHash(content: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  
  try {
    const hashBuffer = await crypto.subtle.digest('SHA-384', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return `sha384-${btoa(hashHex)}`;
  } catch {
    throw new Error('Failed to generate integrity hash');
  }
}

export type { EnvironmentConfig, SecurityHeaders };
