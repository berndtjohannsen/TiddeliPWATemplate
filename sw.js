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

    const req = event.request;
    const url = new URL(req.url);

    const isNavigation = req.mode === 'navigate' || (req.destination === 'document');
    const isHtml = req.headers.get('accept')?.includes('text/html');
    const isConfig = url.pathname.endsWith('/js/config.js');

    // Network-first for HTML navigations and config.js to pick up new versions quickly
    if (isNavigation || isHtml || isConfig) {
        event.respondWith(
            fetch(req)
                .then((networkResponse) => {
                    if (networkResponse && networkResponse.status === 200) {
                        const toCache = networkResponse.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put(req, toCache));
                    }
                    return networkResponse;
                })
                .catch(() => caches.match(req))
        );
        return;
    }

    // Cache-first for other GET requests
    event.respondWith(
        caches.match(req).then((cachedResponse) => {
            if (cachedResponse) return cachedResponse;
            return fetch(req).then((response) => {
                if (!response || response.status !== 200) return response;
                const responseToCache = response.clone();
                caches.open(CACHE_NAME).then((cache) => cache.put(req, responseToCache));
                return response;
            });
        })
    );
});
