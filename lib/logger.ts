/**
 * Application logger
 * Formats and routes log messages based on environment-specific log levels
 */

const isProd = process.env.NODE_ENV === 'production';
const LOG_LEVEL = process.env.LOG_LEVEL || (isProd ? 'warn' : 'debug');

const levels = { debug: 0, info: 1, warn: 2, error: 3 };
const currentLevel = levels[LOG_LEVEL as keyof typeof levels] ?? (isProd ? 2 : 0);

export function logInfo(message: string, data?: any) {
  if (currentLevel > levels.info) return;
  const timestamp = new Date().toISOString();

}

export function logDebug(message: string, data?: any) {
  if (currentLevel > levels.debug) return;
  const timestamp = new Date().toISOString();

}

export function logError(message: string, error?: any) {
  if (currentLevel > levels.error) return;
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] [ERROR] ${message}`, error || "");
}

export function logWarning(message: string, data?: any) {
  if (currentLevel > levels.warn) return;
  const timestamp = new Date().toISOString();
  console.warn(`[${timestamp}] [WARN] ${message}`, data || "");
}

/**
 * Backward compatibility exports
 */
export const getLogger = () => ({
  info: logInfo,
  debug: logDebug,
  error: logError,
  warn: logWarning,
});

export const securityLogger = {
  info: (msg: string, data?: any) => logInfo(`[SECURITY] ${msg}`, data),
  error: (msg: string, data?: any) => logError(`[SECURITY] ${msg}`, data),
  warn: (msg: string, data?: any) => logWarning(`[SECURITY] ${msg}`, data),
};
