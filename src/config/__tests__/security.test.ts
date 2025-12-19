import { describe, it, expect } from 'vitest';
import { 
  createCSPHeader, 
  getCSPDirectives, 
  createSecurityHeaders, 
  createCorsConfig,
  getSecurityConfig 
} from '../security';

describe('Security Configuration', () => {
  describe('createCSPHeader', () => {
    it('should create valid CSP header from directives', () => {
      const directives = {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        upgradeInsecureRequests: true
      };

      const result = createCSPHeader(directives);
      
      expect(result).toContain("default-src 'self'");
      expect(result).toContain("script-src 'self' 'unsafe-inline'");
      expect(result).toContain('upgrade-insecure-requests');
      expect(result).toEndWith(';');
    });

    it('should handle empty directives gracefully', () => {
      const directives = {
        defaultSrc: [],
        scriptSrc: ["'self'"]
      };

      const result = createCSPHeader(directives);
      
      expect(result).not.toContain('default-src');
      expect(result).toContain("script-src 'self'");
    });
  });

  describe('getCSPDirectives', () => {
    it('should return production-safe directives for production', () => {
      const directives = getCSPDirectives(true);
      
      expect(directives.frameSrc).toEqual(["'none'"]);
      expect(directives.upgradeInsecureRequests).toBe(true);
      expect(directives.connectSrc).not.toContain('ws://localhost:*');
    });

    it('should return development-friendly directives for development', () => {
      const directives = getCSPDirectives(false);
      
      expect(directives.frameSrc).toEqual(["'self'"]);
      expect(directives.upgradeInsecureRequests).toBeUndefined();
      expect(directives.connectSrc).toContain('ws://localhost:*');
    });
  });

  describe('createSecurityHeaders', () => {
    it('should create strict headers for production', () => {
      const headers = createSecurityHeaders(true);
      
      expect(headers['X-Frame-Options']).toBe('DENY');
      expect(headers['Cross-Origin-Embedder-Policy']).toBe('credentialless');
      expect(headers['Cross-Origin-Opener-Policy']).toBe('same-origin-allow-popups');
    });

    it('should create relaxed headers for development', () => {
      const headers = createSecurityHeaders(false);
      
      expect(headers['X-Frame-Options']).toBe('SAMEORIGIN');
      expect(headers['Cross-Origin-Embedder-Policy']).toBe('unsafe-none');
      expect(headers['Cross-Origin-Opener-Policy']).toBe('unsafe-none');
    });

    it('should include all required security headers', () => {
      const headers = createSecurityHeaders(true);
      
      expect(headers).toHaveProperty('X-Content-Type-Options', 'nosniff');
      expect(headers).toHaveProperty('X-XSS-Protection', '1; mode=block');
      expect(headers).toHaveProperty('Referrer-Policy', 'strict-origin-when-cross-origin');
      expect(headers).toHaveProperty('Permissions-Policy');
      expect(headers).toHaveProperty('Content-Security-Policy');
    });
  });

  describe('createCorsConfig', () => {
    it('should restrict origins in production', () => {
      const config = createCorsConfig(true);
      
      expect(config.origin).toEqual(['https://aiexamevaluator.me']);
      expect(config.credentials).toBe(true);
    });

    it('should allow localhost origins in development', () => {
      const config = createCorsConfig(false);
      
      expect(config.origin).toContain('http://localhost:3000');
      expect(config.origin).toContain('http://localhost:5173');
      expect(config.origin).toContain('https://aiexamevaluator.me');
    });
  });

  describe('getSecurityConfig', () => {
    it('should return complete security configuration', () => {
      const config = getSecurityConfig(true);
      
      expect(config).toHaveProperty('headers');
      expect(config).toHaveProperty('cors');
      expect(config.headers).toHaveProperty('X-Frame-Options');
      expect(config.cors).toHaveProperty('origin');
    });
  });
});