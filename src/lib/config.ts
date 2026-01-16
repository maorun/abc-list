/**
 * Application Configuration
 * Feature flags and environment-based settings
 */

/**
 * Feature flag to enable/disable Community features
 * Set VITE_ENABLE_COMMUNITY=true in .env to enable Community Hub
 */
export const COMMUNITY_ENABLED =
  import.meta.env.VITE_ENABLE_COMMUNITY === "true";

/**
 * Check if Community features are enabled
 */
export function isCommunityEnabled(): boolean {
  return COMMUNITY_ENABLED;
}
