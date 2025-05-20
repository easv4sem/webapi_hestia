import Logger from "../Infrastructure/Logger/logger.js";

export const DEBUG = true;

export const HEARTBEAT = {
    OFFLINE_TREASHOLD_MINUTES: DEBUG ? 2 : 5,
    CHECK_INTERVAL_MS: DEBUG ? 20000 : 50000
};

if (DEBUG) {
    Logger.warn('[DEBUG MODE] Debug mode is enabled. This should not be used in production.');
    //Add variables to the log if changed for debug mode
    Logger.warn(
        `[DEBUG MODE] Heartbeat monitor is running with fast settings:\n` +
        `- OFFLINE_TREASHOLD_MINUTES: ${HEARTBEAT.OFFLINE_TREASHOLD_MINUTES}\n` +
        `- CHECK_INTERVAL_MS: ${HEARTBEAT.CHECK_INTERVAL_MS}`
    );
}