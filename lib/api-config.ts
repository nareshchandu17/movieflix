/**
 * API Configuration and Validation
 * Provides runtime validation for API keys with graceful fallbacks
 */

export interface APIConfig {
  tmdb: {
    apiKey: string;
    isValid: boolean;
  };
  youtube: {
    apiKey: string;
    isValid: boolean;
  };
  gemini: {
    apiKey: string;
    isValid: boolean;
  };
}

/**
 * Validates API configuration and returns status
 */
export function validateAPIConfig(): APIConfig {
  return {
    tmdb: {
      apiKey: process.env.TMDB_API_KEY || '',
      isValid: !!(process.env.TMDB_API_KEY && process.env.TMDB_API_KEY.length > 0),
    },
    youtube: {
      apiKey: process.env.YOUTUBE_API_KEY || '',
      isValid: !!(process.env.YOUTUBE_API_KEY && process.env.YOUTUBE_API_KEY.length > 0),
    },
    gemini: {
      apiKey: process.env.GEMINI_API_KEY || '',
      isValid: !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.length > 0),
    },
  };
}

/**
 * Checks if critical API keys are available
 */
export function hasCriticalAPIKeys(): boolean {
  const config = validateAPIConfig();
  return config.tmdb.isValid;
}

/**
 * Gets a user-friendly error message for missing API keys
 */
export function getAPIErrorMessage(service: keyof APIConfig): string {
  const config = validateAPIConfig();
  
  if (config[service].isValid) {
    return '';
  }

  const serviceNames = {
    tmdb: 'TMDB',
    youtube: 'YouTube',
    gemini: 'Gemini AI',
  };

  return `Missing ${serviceNames[service]} API key. Please configure the ${service.toUpperCase()}_API_KEY environment variable.`;
}

/**
 * Safe API key getter with fallback
 */
export function getAPIKey(service: keyof APIConfig): string {
  const config = validateAPIConfig();
  return config[service].apiKey;
}
