/**
 * Production Security Module
 * Handles runtime security measures and environment protection
 */

// Disable certain features in production
const isProduction = import.meta.env.MODE === 'production';

// Security configuration
export const SECURITY_CONFIG = {
  DISABLE_DEVTOOLS: isProduction,
  DISABLE_CONSOLE: isProduction,
  DISABLE_RIGHT_CLICK: isProduction,
  ENABLE_OBFUSCATION: isProduction,
  MAX_REQUEST_RATE: 60, // requests per minute
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
};

/**
 * Initialize production security measures
 */
export function initProductionSecurity(): void {
  if (!isProduction) return;
  
  // Override console methods in production
  const noop = () => {};
  if (typeof window !== 'undefined') {
    (window as unknown as { console: Record<string, () => void> }).console = {
      log: noop,
      info: noop,
      warn: noop,
      error: noop,
      debug: noop,
      trace: noop,
      table: noop,
      dir: noop,
      group: noop,
      groupEnd: noop,
      time: noop,
      timeEnd: noop,
      clear: noop,
    };
  }
  
  // Disable right-click context menu
  if (SECURITY_CONFIG.DISABLE_RIGHT_CLICK) {
    document.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      return false;
    });
  }
  
  // Disable keyboard shortcuts for developer tools
  document.addEventListener('keydown', (e) => {
    // F12, Ctrl+Shift+I, Ctrl+Shift+C, Ctrl+U
    if (e.keyCode === 123 || 
        (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 67)) ||
        (e.ctrlKey && e.keyCode === 85)) {
      e.preventDefault();
      return false;
    }
  });
  
  // DevTools detection (basic)
  const devtools = { open: false };
  setInterval(() => {
    if (window.outerHeight - window.innerHeight > 200 || 
        window.outerWidth - window.innerWidth > 200) {
      if (!devtools.open) {
        devtools.open = true;
        // Log security event (but don't expose sensitive info)
        // In production, console is disabled, but this would be for server-side logging
      }
    }
  }, 1000);
}

/**
 * Sanitize data before any logging or display
 */
export function sanitizeForProduction(data: unknown): unknown {
  if (!isProduction) return data;
  
  if (typeof data === 'object' && data !== null) {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      // Remove sensitive keys
      if (key.toLowerCase().includes('password') ||
          key.toLowerCase().includes('secret') ||
          key.toLowerCase().includes('token') ||
          key.toLowerCase().includes('key')) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }
  
  return data;
}

/**
 * Rate limiting for API calls
 */
class RateLimiter {
  private requests: number[] = [];
  
  isAllowed(): boolean {
    const now = Date.now();
    const windowStart = now - 60000; // 1 minute window
    
    // Remove old requests
    this.requests = this.requests.filter(time => time > windowStart);
    
    // Check if under limit
    if (this.requests.length < SECURITY_CONFIG.MAX_REQUEST_RATE) {
      this.requests.push(now);
      return true;
    }
    
    return false;
  }
}

export const rateLimiter = new RateLimiter();

/**
 * Session security
 */
export function initSessionSecurity(): void {
  if (!isProduction) return;
  
  let lastActivity = Date.now();
  
  // Track user activity
  ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'].forEach(event => {
    document.addEventListener(event, () => {
      lastActivity = Date.now();
    });
  });
  
  // Check for session timeout
  setInterval(() => {
    if (Date.now() - lastActivity > SECURITY_CONFIG.SESSION_TIMEOUT) {
      // Session timeout - clear sensitive data
      if (typeof localStorage !== 'undefined') {
        localStorage.clear();
      }
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.clear();
      }
      // Optionally redirect to login
      // window.location.href = '/login';
    }
  }, 60000); // Check every minute
}
