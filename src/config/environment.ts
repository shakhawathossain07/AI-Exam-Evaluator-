/**
 * Environment configuration and validation utility
 * Centralizes all environment variable handling with type safety
 */

export interface EnvironmentConfig {
  supabase: {
    url: string;
    anonKey: string;
  };
  gemini: {
    apiKey: string;
  };
  app: {
    devPort: number;
    isDevelopment: boolean;
    isProduction: boolean;
    siteUrl: string;
  };
}

export interface EnvironmentValidation {
  isValid: boolean;
  missing: string[];
  warnings: string[];
}

/**
 * Validates and parses environment variables
 */
export function validateEnvironment(): EnvironmentValidation {
  const required = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY'
  ];
  
  const optional = [
    'VITE_GEMINI_API_KEY',
    'VITE_DEV_PORT',
    'VITE_SITE_URL'
  ];

  const missing = required.filter(key => !import.meta.env[key]);
  const warnings: string[] = [];

  // Check for placeholder values
  if (import.meta.env.VITE_SUPABASE_URL?.includes('your-project-ref')) {
    warnings.push('VITE_SUPABASE_URL appears to be a placeholder value');
  }

  if (import.meta.env.VITE_SUPABASE_ANON_KEY?.includes('your-anon-key')) {
    warnings.push('VITE_SUPABASE_ANON_KEY appears to be a placeholder value');
  }

  // Check optional but recommended variables
  optional.forEach(key => {
    if (!import.meta.env[key]) {
      warnings.push(`Optional environment variable ${key} is not set`);
    }
  });

  return {
    isValid: missing.length === 0,
    missing,
    warnings
  };
}

/**
 * Gets validated environment configuration
 */
export function getEnvironmentConfig(): EnvironmentConfig {
  const validation = validateEnvironment();
  
  if (!validation.isValid) {
    throw new Error(`Missing required environment variables: ${validation.missing.join(', ')}`);
  }

  if (validation.warnings.length > 0) {
    console.warn('Environment warnings:', validation.warnings);
  }

  return {
    supabase: {
      url: import.meta.env.VITE_SUPABASE_URL,
      anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    },
    gemini: {
      apiKey: import.meta.env.VITE_GEMINI_API_KEY || '',
    },
    app: {
      devPort: parseInt(import.meta.env.VITE_DEV_PORT || '5173'),
      isDevelopment: import.meta.env.DEV,
      isProduction: import.meta.env.PROD,
      siteUrl: import.meta.env.VITE_SITE_URL || 'http://localhost:5173',
    },
  };
}

/**
 * Type-safe environment variable getter
 */
export function getEnvVar(key: string, defaultValue?: string): string {
  const value = import.meta.env[key];
  
  if (!value && !defaultValue) {
    throw new Error(`Environment variable ${key} is required but not set`);
  }
  
  return value || defaultValue!;
}

/**
 * Checks if the application is properly configured
 */
export function isAppConfigured(): boolean {
  try {
    const config = getEnvironmentConfig();
    return !!(config.supabase.url && config.supabase.anonKey);
  } catch {
    return false;
  }
}