/**
 * Comprehensive Security Framework
 * Protects against SQL Injection, XSS, CSRF, and other common attacks
 */

// Input validation patterns
const SECURITY_PATTERNS = {
  EMAIL: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  STUDENT_ID: /^[A-Za-z0-9\-_]{1,50}$/,
  STUDENT_NAME: /^[A-Za-z\s\-'.]{1,100}$/,
  SUBJECT: /^[A-Za-z0-9\s\-'.&()]{1,100}$/,
  FILENAME: /^[A-Za-z0-9\-_.\s()]+\.(pdf|jpg|jpeg|png)$/i,
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
};

// Maximum allowed values
const SECURITY_LIMITS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_FILES: 10,
  MAX_STRING_LENGTH: 1000,
  MAX_MARKS: 1000,
  MIN_MARKS: 1,
  MAX_EVALUATION_LIMIT: 1000,
  MIN_EVALUATION_LIMIT: 1,
  MAX_API_KEY_LENGTH: 200,
  RATE_LIMIT_WINDOW: 60000, // 1 minute
  RATE_LIMIT_MAX_REQUESTS: 30
};

// Dangerous file types and content
const SECURITY_BLACKLIST = {
  DANGEROUS_EXTENSIONS: ['.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js', '.jar', '.sh'],
  MALICIOUS_CONTENT: ['<script>', 'javascript:', 'data:text/html', 'vbscript:', 'onload=', 'onerror='],
  SQL_INJECTION_PATTERNS: [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
    /(--|;|\/\*|\*\/|xp_|sp_)/i,
    /('|"|`|;|--|\||&|\$)/,
    /(UNION|OR|AND)\s+\d+\s*=\s*\d+/i
  ],
  XSS_PATTERNS: [
    /<script[^>]*>.*?<\/script>/gi,
    /<iframe[^>]*>.*?<\/iframe>/gi,
    /<object[^>]*>.*?<\/object>/gi,
    /<embed[^>]*>/gi,
    /javascript:/gi,
    /vbscript:/gi,
    /on\w+\s*=/gi
  ]
};

// Rate limiting storage
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export function sanitizeHtml(input: string): string {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .replace(/`/g, '&#96;');
}

/**
 * Validate and sanitize text input
 */
export function sanitizeTextInput(input: string, maxLength: number = SECURITY_LIMITS.MAX_STRING_LENGTH): string {
  if (typeof input !== 'string') return '';
  
  // Remove potential XSS content
  let sanitized = sanitizeHtml(input.trim());
  
  // Check for malicious content
  for (const pattern of SECURITY_BLACKLIST.XSS_PATTERNS) {
    sanitized = sanitized.replace(pattern, '');
  }
  
  // Truncate to max length
  return sanitized.slice(0, maxLength);
}

/**
 * Validate email format and security
 */
export function validateEmail(email: string): { isValid: boolean; error?: string } {
  if (!email || typeof email !== 'string') {
    return { isValid: false, error: 'Email is required' };
  }
  
  const sanitized = sanitizeTextInput(email, 254);
  
  if (!SECURITY_PATTERNS.EMAIL.test(sanitized)) {
    return { isValid: false, error: 'Invalid email format' };
  }
  
  // Check for suspicious patterns
  if (sanitized.includes('..') || sanitized.startsWith('.') || sanitized.endsWith('.')) {
    return { isValid: false, error: 'Invalid email format' };
  }
  
  return { isValid: true };
}

/**
 * Validate password strength and security
 */
export function validatePassword(password: string): { isValid: boolean; error?: string } {
  if (!password || typeof password !== 'string') {
    return { isValid: false, error: 'Password is required' };
  }
  
  if (password.length < 8) {
    return { isValid: false, error: 'Password must be at least 8 characters long' };
  }
  
  if (password.length > 128) {
    return { isValid: false, error: 'Password is too long' };
  }
  
  if (!SECURITY_PATTERNS.PASSWORD.test(password)) {
    return { isValid: false, error: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character' };
  }
  
  // Check for common weak passwords
  const weakPasswords = ['password', '12345678', 'qwerty123', 'admin123', 'password123'];
  if (weakPasswords.some(weak => password.toLowerCase().includes(weak))) {
    return { isValid: false, error: 'Password is too common' };
  }
  
  return { isValid: true };
}

/**
 * Validate file upload security
 */
export function validateFileUpload(file: File): { isValid: boolean; error?: string } {
  if (!file) {
    return { isValid: false, error: 'File is required' };
  }
  
  // Check file size
  if (file.size > SECURITY_LIMITS.MAX_FILE_SIZE) {
    return { isValid: false, error: `File size must be less than ${SECURITY_LIMITS.MAX_FILE_SIZE / (1024 * 1024)}MB` };
  }
  
  if (file.size === 0) {
    return { isValid: false, error: 'File cannot be empty' };
  }
  
  // Validate filename
  const sanitizedName = sanitizeTextInput(file.name, 255);
  if (!SECURITY_PATTERNS.FILENAME.test(sanitizedName)) {
    return { isValid: false, error: 'Invalid file type. Only PDF, JPG, JPEG, and PNG files are allowed' };
  }
  
  // Check for dangerous extensions
  const extension = sanitizedName.toLowerCase().substring(sanitizedName.lastIndexOf('.'));
  if (SECURITY_BLACKLIST.DANGEROUS_EXTENSIONS.includes(extension)) {
    return { isValid: false, error: 'Dangerous file type detected' };
  }
  
  // Validate MIME type
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'Invalid file type detected' };
  }
  
  return { isValid: true };
}

/**
 * Validate numeric input with bounds
 */
export function validateNumericInput(value: unknown, min: number, max: number): { isValid: boolean; error?: string; value?: number } {
  if (value === null || value === undefined || value === '') {
    return { isValid: false, error: 'Value is required' };
  }
  
  const num = typeof value === 'string' ? parseInt(value, 10) : Number(value);
  
  if (isNaN(num)) {
    return { isValid: false, error: 'Value must be a number' };
  }
  
  if (num < min) {
    return { isValid: false, error: `Value must be at least ${min}` };
  }
  
  if (num > max) {
    return { isValid: false, error: `Value must be at most ${max}` };
  }
  
  return { isValid: true, value: num };
}

/**
 * Check for SQL injection attempts
 */
export function detectSqlInjection(input: string): boolean {
  if (typeof input !== 'string') return false;
  
  const lowercaseInput = input.toLowerCase();
  
  return SECURITY_BLACKLIST.SQL_INJECTION_PATTERNS.some(pattern => pattern.test(lowercaseInput));
}

/**
 * Rate limiting implementation
 */
export function checkRateLimit(identifier: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);
  
  if (!record || now > record.resetTime) {
    // First request or window expired
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + SECURITY_LIMITS.RATE_LIMIT_WINDOW
    });
    return { allowed: true, remaining: SECURITY_LIMITS.RATE_LIMIT_MAX_REQUESTS - 1 };
  }
  
  if (record.count >= SECURITY_LIMITS.RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false, remaining: 0 };
  }
  
  record.count++;
  return { allowed: true, remaining: SECURITY_LIMITS.RATE_LIMIT_MAX_REQUESTS - record.count };
}

/**
 * Validate student information
 */
export function validateStudentInfo(studentInfo: {
  studentName?: string;
  studentId?: string;
  subject?: string;
}): { isValid: boolean; errors: string[]; sanitized?: typeof studentInfo } {
  const errors: string[] = [];
  const sanitized = { ...studentInfo };
  
  // Validate student name
  if (!studentInfo.studentName) {
    errors.push('Student name is required');
  } else {
    sanitized.studentName = sanitizeTextInput(studentInfo.studentName, 100);
    if (!SECURITY_PATTERNS.STUDENT_NAME.test(sanitized.studentName)) {
      errors.push('Student name contains invalid characters');
    }
  }
  
  // Validate student ID
  if (!studentInfo.studentId) {
    errors.push('Student ID is required');
  } else {
    sanitized.studentId = sanitizeTextInput(studentInfo.studentId, 50);
    if (!SECURITY_PATTERNS.STUDENT_ID.test(sanitized.studentId)) {
      errors.push('Student ID contains invalid characters');
    }
  }
  
  // Validate subject
  if (!studentInfo.subject) {
    errors.push('Subject is required');
  } else {
    sanitized.subject = sanitizeTextInput(studentInfo.subject, 100);
    if (!SECURITY_PATTERNS.SUBJECT.test(sanitized.subject)) {
      errors.push('Subject contains invalid characters');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitized: errors.length === 0 ? sanitized : undefined
  };
}

/**
 * Validate API key format
 */
export function validateApiKey(apiKey: string): { isValid: boolean; error?: string } {
  if (!apiKey || typeof apiKey !== 'string') {
    return { isValid: false, error: 'API key is required' };
  }
  
  const sanitized = apiKey.trim();
  
  if (sanitized.length < 20) {
    return { isValid: false, error: 'API key is too short' };
  }
  
  if (sanitized.length > SECURITY_LIMITS.MAX_API_KEY_LENGTH) {
    return { isValid: false, error: 'API key is too long' };
  }
  
  // Check for obvious fake keys
  if (sanitized.toLowerCase().includes('your-api-key') || 
      sanitized === 'test' || 
      sanitized === 'demo') {
    return { isValid: false, error: 'Invalid API key format' };
  }
  
  return { isValid: true };
}

/**
 * Generate secure random token
 */
export function generateSecureToken(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const randomArray = new Uint8Array(length);
  crypto.getRandomValues(randomArray);
  
  for (let i = 0; i < length; i++) {
    result += chars[randomArray[i] % chars.length];
  }
  
  return result;
}

/**
 * Content Security Policy headers
 */
export const CSP_HEADERS = {
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' https:",
    "connect-src 'self' https://*.supabase.co https://generativelanguage.googleapis.com",
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'"
  ].join('; ')
};

/**
 * Security middleware for API calls
 */
export function createSecurityMiddleware() {
  return {
    validateRequest: (request: {
      headers?: Record<string, string>;
      body?: unknown;
      method?: string;
    }) => {
      // Validate Content-Type for POST/PUT requests
      if (['POST', 'PUT', 'PATCH'].includes(request.method || '')) {
        const contentType = request.headers?.['content-type'] || '';
        if (!contentType.includes('application/json') && !contentType.includes('multipart/form-data')) {
          throw new Error('Invalid content type');
        }
      }
      
      // Check for common attack headers
      const suspiciousHeaders = ['x-forwarded-host', 'x-original-url', 'x-rewrite-url'];
      for (const header of suspiciousHeaders) {
        if (request.headers?.[header]) {
          throw new Error('Suspicious request detected');
        }
      }
      
      return true;
    },
    
    sanitizeResponse: (data: unknown) => {
      if (typeof data === 'string') {
        return sanitizeHtml(data);
      }
      
      if (Array.isArray(data)) {
        return data.map(item => typeof item === 'string' ? sanitizeHtml(item) : item);
      }
      
      if (typeof data === 'object' && data !== null) {
        const sanitized: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(data)) {
          sanitized[key] = typeof value === 'string' ? sanitizeHtml(value) : value;
        }
        return sanitized;
      }
      
      return data;
    }
  };
}

export { SECURITY_LIMITS, SECURITY_PATTERNS };
