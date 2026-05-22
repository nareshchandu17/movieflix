/**
 * @file logger.ts
 * @description Core utility services, backend API clients, or database connectors for MovieFlix services.
 * Provides enterprise-grade reliability, streaming controls, and robust type safety.
 * 
 * @author CHANDU NARESH <nareshchandu27@gmail.com>
 * @copyright (c) 2026 MovieFlix. All rights reserved.
 */

/**
 * Standardized Production Logger
 */
export function logInfo(message: string, data?: any) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [INFO] ${message}`, data ? JSON.stringify(data, null, 2) : "");
}

export function logError(message: string, error?: any) {
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] [ERROR] ${message}`, error || "");
}

export function logWarning(message: string, data?: any) {
  const timestamp = new Date().toISOString();
  console.warn(`[${timestamp}] [WARN] ${message}`, data || "");
}

/**
 * Backward compatibility exports
 */
export const getLogger = () => ({
  info: logInfo,
  error: logError,
  warn: logWarning,
});

export const securityLogger = {
  info: (msg: string, data?: any) => logInfo(`[SECURITY] ${msg}`, data),
  error: (msg: string, data?: any) => logError(`[SECURITY] ${msg}`, data),
  warn: (msg: string, data?: any) => logWarning(`[SECURITY] ${msg}`, data),
};
