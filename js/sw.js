/**
 * Service Worker
 * Handles offline functionality and caching
 */

// App configuration (copied from config.js to avoid import issues)
const APP_VERSION = '1.0.0';
const CACHE_NAME = `tiddeli-pwa-v${APP_VERSION}`;

// Files to cache on install
const CACHE_ASSETS = [
    './',
    'index.html',
    'css/tailwind.output.css',
    'js/app.js',
    'js/router.js',
    'js/config.js',
    'manifest.json',
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
                return cache.addAll(CACHE_ASSETS);
            })
            .then(() => self.skipWaiting()) // Activate immediately
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
