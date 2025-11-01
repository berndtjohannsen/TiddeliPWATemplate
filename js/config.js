/**
 * Application Configuration
 * This is the single source of truth for app version and configuration
 */

// Application version - Update this when releasing new versions
export const APP_VERSION = '1.0.356';

// Application name
export const APP_NAME = 'Tiddeli PWA Template';

// Application description
export const APP_DESCRIPTION = 'A minimal PWA template';

// Cache name for service worker (includes version for cache busting)
export const CACHE_NAME = `tiddeli-pwa-v${APP_VERSION}`;
