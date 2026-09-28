/**
 * Centralized Radar Scheduler and Polling Configuration
 * Prevents hardcoding intervals across the codebase and centralizes backoff,
 * cache TTL, urgency thresholds, and worker timing.
 */

export const RADAR_CONFIG = {
  // Scheduler loop tick: how often the background worker checks for due radars
  WORKER_TICK_MS: 4 * 1000, // 4 seconds

  // Base polling intervals based on journey proximity
  POLL_INTERVALS: {
    // Within 4 hours of departure or charting: high-frequency hunt
    CRITICAL_MS: 15 * 1000, // 15 seconds
    // Within 24 hours of journey date: active watch
    URGENT_MS: 25 * 1000,   // 25 seconds
    // Normal / more than 24 hours away
    NORMAL_MS: 45 * 1000,   // 45 seconds
    // Journey is days away
    RELAXED_MS: 90 * 1000,  // 90 seconds
  },

  // In-flight & cache deduplication
  CACHE_TTL_MS: 20 * 1000, // 20 seconds shared cache per train+date+class+quota
  STALE_AVAILABILITY_MS: 90 * 1000, // Considered stale if older than 90s

  // Failure and rate-limit backoff handling
  MAX_CONSECUTIVE_FAILURES: 5,
  BASE_BACKOFF_MS: 20 * 1000,
  MAX_BACKOFF_MS: 120 * 1000,
  BACKOFF_MULTIPLIER: 1.5,

  // Multi-train alert grouping:
  // If multiple trains on a route become available within this window, group them into 1 notification
  ROUTE_ALERT_GROUPING_WINDOW_MS: 10 * 1000,

  // Auto-expiry: journey date is in the past by more than X hours
  EXPIRY_GRACE_HOURS: 2,

  // Storage files
  DATA_DIR: 'data',
  RADARS_FILE: 'data/radars.json',
  SUBSCRIPTIONS_FILE: 'data/push_subscriptions.json',
  VAPID_FILE: 'data/vapid.json'
};
