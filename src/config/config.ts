import Logger from "../Infrastructure/Logger/logger.js";

export const DEBUG = true;

export const HEARTBEAT_CONFIG = {
    OFFLINE_THRESHOLD_MINUTES: DEBUG ? 2 : 5,
    CHECK_INTERVAL_MS: DEBUG ? 120000 : 240000 // in milliseconds
};

// Optional: Set this to override TTL, otherwise it's calculated automatically
const CUSTOM_DEVICE_TTL_SECONDS = undefined; // e.g., set to 50 if you want to override

// Compute maximum allowed TTL
const MAX_DEVICE_TTL_SECONDS = Math.floor((HEARTBEAT_CONFIG.CHECK_INTERVAL_MS / 1000) / 2);

// Determine final TTL, applying the safety limit
const DEVICE_TTL_SECONDS = CUSTOM_DEVICE_TTL_SECONDS !== undefined
    ? Math.min(CUSTOM_DEVICE_TTL_SECONDS, MAX_DEVICE_TTL_SECONDS)
    : MAX_DEVICE_TTL_SECONDS;

export const READIES_CONFIG = {
    DEVICE_TTL_SECONDS
};

if (DEBUG) {
    Logger.warn('[DEBUG MODE] Debug mode is enabled. This should not be used in production.');
    Logger.warn(
        `[DEBUG MODE] Heartbeat monitor is running with fast settings:\n` +
        `- OFFLINE_TREASHOLD_MINUTES: ${HEARTBEAT_CONFIG.OFFLINE_THRESHOLD_MINUTES}\n` +
        `- CHECK_INTERVAL_MS: ${HEARTBEAT_CONFIG.CHECK_INTERVAL_MS}\n` +
        `- DEVICE_TTL_SECONDS (capped): ${READIES_CONFIG.DEVICE_TTL_SECONDS} (Max allowed: ${MAX_DEVICE_TTL_SECONDS})`
    );
}
