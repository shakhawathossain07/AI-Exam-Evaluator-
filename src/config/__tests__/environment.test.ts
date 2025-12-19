import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  validateEnvironment, 
  getEnvironmentConfig, 
  getEnvVar, 
  isAppConfigured 
} from '../environment';

// Mock import.meta.env
const mockEnv = {
  VITE_SUPABASE_URL: '',
  VITE_SUPABASE_ANON_KEY: '',
  VITE_GEMINI_API_KEY: '',
  VITE_DEV_PORT: '',
  VITE_SITE_URL: '',
  DEV: false,
  PROD: true
};

vi.stubGlobal('import', {
  meta: {
    env: mockEnv
  }
});

describe('Environment Configuration', () => {
  beforeEach(() => {
    // Reset mock environment
    Object.keys(mockEnv).forEach(key => {
      mockEnv[key as keyof typeof mockEnv] = '';
    });
    mockEnv.DEV = false;
    mockEnv.PROD = true;
  });

  describe('validateEnvironment', () => {
    it('should return invalid when required variables are missing', () => {
      const result = validateEnvironment();
      
      expect(result.isValid).toBe(false);
      expect(result.missing).toContain('VITE_SUPABASE_URL');
      expect(result.missing).toContain('VITE_SUPABASE_ANON_KEY');
    });

    it('should return valid when all required variables are present', () => {
      mockEnv.VITE_SUPABASE_URL = 'https://test.supabase.co';
      mockEnv.VITE_SUPABASE_ANON_KEY = 'test-key';
      
      const result = validateEnvironment();
      
      expect(result.isValid).toBe(true);
      expect(result.missing).toHaveLength(0);
    });

    it('should warn about placeholder values', () => {
      mockEnv.VITE_SUPABASE_URL = 'https://your-project-ref.supabase.co';
      mockEnv.VITE_SUPABASE_ANON_KEY = 'your-anon-key';
      
      const result = validateEnvironment();
      
      expect(result.warnings).toContain('VITE_SUPABASE_URL appears to be a placeholder value');
      expect(result.warnings).toContain('VITE_SUPABASE_ANON_KEY appears to be a placeholder value');
    });
  });

  describe('getEnvironmentConfig', () => {
    it('should throw error when required variables are missing', () => {
      expect(() => getEnvironmentConfig()).toThrow('Missing required environment variables');
    });

    it('should return valid config when variables are present', () => {
      mockEnv.VITE_SUPABASE_URL = 'https://test.supabase.co';
      mockEnv.VITE_SUPABASE_ANON_KEY = 'test-key';
      mockEnv.VITE_GEMINI_API_KEY = 'gemini-key';
      mockEnv.VITE_DEV_PORT = '3000';
      mockEnv.DEV = true;
      mockEnv.PROD = false;
      
      const config = getEnvironmentConfig();
      
      expect(config.supabase.url).toBe('https://test.supabase.co');
      expect(config.supabase.anonKey).toBe('test-key');
      expect(config.gemini.apiKey).toBe('gemini-key');
      expect(config.app.devPort).toBe(3000);
      expect(config.app.isDevelopment).toBe(true);
      expect(config.app.isProduction).toBe(false);
    });

    it('should use default values for optional variables', () => {
      mockEnv.VITE_SUPABASE_URL = 'https://test.supabase.co';
      mockEnv.VITE_SUPABASE_ANON_KEY = 'test-key';
      
      const config = getEnvironmentConfig();
      
      expect(config.gemini.apiKey).toBe('');
      expect(config.app.devPort).toBe(5173);
      expect(config.app.siteUrl).toBe('http://localhost:5173');
    });
  });

  describe('getEnvVar', () => {
    it('should return environment variable value', () => {
      mockEnv.VITE_SUPABASE_URL = 'test-value';
      
      const result = getEnvVar('VITE_SUPABASE_URL');
      
      expect(result).toBe('test-value');
    });

    it('should return default value when variable is not set', () => {
      const result = getEnvVar('NONEXISTENT_VAR', 'default');
      
      expect(result).toBe('default');
    });

    it('should throw error when required variable is missing and no default', () => {
      expect(() => getEnvVar('NONEXISTENT_VAR')).toThrow('Environment variable NONEXISTENT_VAR is required but not set');
    });
  });

  describe('isAppConfigured', () => {
    it('should return false when configuration is invalid', () => {
      const result = isAppConfigured();
      
      expect(result).toBe(false);
    });

    it('should return true when configuration is valid', () => {
      mockEnv.VITE_SUPABASE_URL = 'https://test.supabase.co';
      mockEnv.VITE_SUPABASE_ANON_KEY = 'test-key';
      
      const result = isAppConfigured();
      
      expect(result).toBe(true);
    });
  });
});