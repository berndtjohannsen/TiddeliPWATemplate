/**
 * Service Worker
 * Handles offline functionality and caching
 */

// Derive version from service worker script URL query string
// Fallback to '0.0.0' if not provided
const swScriptUrl = new URL(self.location);
const APP_VERSION = swScriptUrl.searchParams.get('v') || '0.0.0';
const CACHE_NAME = `tiddeli-pwa-v${APP_VERSION}`;

// Files to cache on install
const CACHE_ASSETS = [
    'index.html',
    'css/tailwind.output.css',
    'js/app.js',
    'js/router.js',
    'js/config.js',
    'manifest.json',
    'images/icons/icon-192.png',
    'images/icons/icon-512.png',
    // Add more assets as needed
];

/**
 * Install event - Cache assets
 */
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installing...', 'v' + APP_VERSION);
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[Service Worker] Caching assets');
                // Cache files one by one to identify which one fails
                return Promise.allSettled(
                    CACHE_ASSETS.map(url => 
                        cache.add(url).catch(error => {
                            console.error(`[Service Worker] Failed to cache ${url}:`, error);
                            return null; // Continue with other files
                        })
                    )
                );
            })
            .then(() => {
                console.log('[Service Worker] Caching completed');
                return self.skipWaiting(); // Activate immediately
            })
            .catch(error => {
                console.error('[Service Worker] Installation failed:', error);
            })
    );
});

/**
 * Activate event - Clean up old caches
 */
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activating...');
    
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[Service Worker] Removing old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim()) // Take control of all pages
    );
});

/**
 * Fetch event - Serve from cache, fall back to network
 */
self.addEventListener('fetch', (event) => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') {
        return;
    }
    
    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                // Return cached version if available
                if (cachedResponse) {
                    return cachedResponse;
                }
                
                // Otherwise fetch from network
                return fetch(event.request)
                    .then((response) => {
                        // Don't cache non-successful responses
                        if (!response || response.status !== 200) {
                            return response;
                        }
                        
                        // Clone the response (streams can only be consumed once)
                        const responseToCache = response.clone();
                        
                        // Cache the new response
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });
                        
                        return response;
                    });
            })
            .catch(() => {
                // Fallback if both cache and network fail
                // Could return an offline page here
                console.log('[Service Worker] Fetch failed');
            })
    );
});
