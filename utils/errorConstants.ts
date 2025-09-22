/**
 * Error handling constants
 * Centralized constants for error logging and sanitization
 */

// Sanitization limits
export const SANITIZATION_LIMITS = {
  ERROR_MESSAGE: 1000,
  ERROR_MESSAGE_FINAL: 500,
  ERROR_NAME: 100,
  USER_AGENT: 400,
  USER_AGENT_FINAL: 200,
  URL: 300,
  STACK_TRACE: 2000,
  GENERAL_INPUT: 2000,
} as const;

// Queue and rate limiting
export const ERROR_QUEUE_CONFIG = {
  MAX_QUEUE_SIZE: 100,
  MAX_REQUESTS_PER_HOUR: 10,
  RATE_LIMIT_THRESHOLD: 5,
} as const;

// API rate limiting
export const API_RATE_LIMITS = {
  WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  MAX_REQUESTS: 10,
} as const;

// LocalStorage keys
export const STORAGE_KEYS = {
  ERROR_QUEUE: 'webxr_error_queue',
} as const;

// Analytics service names
export const ANALYTICS_SERVICES = {
  GOOGLE: 'gtag',
  SENTRY: 'Sentry',
} as const;

// Component names
export const COMPONENT_NAMES = {
  WEBXR_DEFAULT: 'WebXR',
} as const;
