/**
 * Main Application Logic
 * Handles app initialization and core functionality
 */

import { APP_VERSION, APP_NAME } from './config.js';
import { initRouter } from './router.js';

/**
 * Initialize the application
 */
function initApp() {
    console.log(`${APP_NAME} v${APP_VERSION} initialized`);
    
    // Populate version in UI
    const versionEl = document.getElementById('app-version');
    if (versionEl) {
        versionEl.textContent = APP_VERSION;
    }
    
    // Initialize install prompt handlers (Android/Chrome)
    setupInstallPromptHandlers();

    // Initialize router
    initRouter();
    
    // Register service worker
    if ('serviceWorker' in navigator) {
        registerServiceWorker();
        // Auto-reload once when a new SW takes control to pick up fresh assets
        let reloadedForUpdate = false;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            if (reloadedForUpdate) return;
            reloadedForUpdate = true;
            window.location.reload();
        });
    }
    
    // Setup UI event listeners
    setupEventListeners();
}

/**
 * Register service worker for PWA functionality
 */
async function registerServiceWorker() {
    try {
        // Pass version to service worker via query string
        const swUrl = `sw.js?v=${encodeURIComponent(APP_VERSION)}`;
        const registration = await navigator.serviceWorker.register(swUrl);
        console.log('Service Worker registered:', registration);
        
        // Check for updates
        registration.addEventListener('updatefound', () => {
            console.log('Service Worker update found');
            // TODO: Show update notification to user
        });
    } catch (error) {
        console.error('Service Worker registration failed:', error);
    }
}

/**
 * Setup UI event listeners
 */
function setupEventListeners() {
    // Menu toggle for side drawer
    const menuToggle = document.getElementById('menu-toggle');
    const drawer = document.getElementById('drawer');
    const drawerBackdrop = document.getElementById('drawer-backdrop');
    
    if (menuToggle && drawer) {
        menuToggle.addEventListener('click', () => {
            drawer.classList.add('translate-x-0');
            if (drawerBackdrop) {
                drawerBackdrop.classList.remove('hidden');
            }
        });
    }
    
    // Close drawer when backdrop is clicked
    if (drawerBackdrop) {
        drawerBackdrop.addEventListener('click', () => {
            drawer.classList.remove('translate-x-0');
            drawerBackdrop.classList.add('hidden');
        });
    }
    
    // Bottom navigation click handlers
    const navItems = document.querySelectorAll('.bottom-nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            // Remove active state from all items
            navItems.forEach(navItem => navItem.classList.remove('bg-blue-600'));
            // Add active state to clicked item
            item.classList.add('bg-blue-600');
            
            // Handle navigation
            const route = item.dataset.route;
            if (route) {
                // Navigate to route (handled by router)
                window.history.pushState({}, '', route);
                window.dispatchEvent(new PopStateEvent('popstate'));
            }
        });
    });
}

/**
 * Handle PWA install prompt flow for Android/Chrome
 */
let deferredInstallPrompt = null;
let beforeInstallEventQueued = false; // Set if event fires before handlers ready
// Attach listener as early as possible so we don't miss the event on first load
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
    beforeInstallEventQueued = true;
});
function setupInstallPromptHandlers() {
    const installItem = document.getElementById('install-app-item');
    const installButton = document.getElementById('install-app-button');
    const banner = document.getElementById('install-banner');
    const bannerInstall = document.getElementById('banner-install');
    const bannerDismiss = document.getElementById('banner-dismiss');

    // Snooze configuration
    const SNOOZE_KEY = 'installBannerSnoozedUntil';
    const SNOOZE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

    function isStandalone() {
        return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    }

    function canShowBanner() {
        const until = localStorage.getItem(SNOOZE_KEY);
        if (!until) return true;
        const untilMs = parseInt(until, 10);
        return Number.isNaN(untilMs) || Date.now() > untilMs;
    }

    function showBanner() {
        if (banner) {
            banner.classList.remove('hidden');
        }
    }

    function hideBanner() {
        if (banner) {
            banner.classList.add('hidden');
        }
    }

    // If event fires later, react to it (secondary listener still ok)
    window.addEventListener('beforeinstallprompt', () => {
        if (installItem) {
            installItem.classList.remove('hidden');
        }
        if (!isStandalone() && canShowBanner()) {
            showBanner();
        }
        // Make sure Install button is visible now that prompt is available
        if (bannerInstall) {
            bannerInstall.classList.remove('hidden');
        }
    });

    // If the event already fired before handlers were attached, show UI now
    if (beforeInstallEventQueued) {
        if (installItem) {
            installItem.classList.remove('hidden');
        }
        if (!isStandalone() && canShowBanner()) {
            showBanner();
        }
        if (bannerInstall) {
            bannerInstall.classList.remove('hidden');
        }
    }

    // Always show a friendly banner on first eligible visit, even before the install event
    // If install prompt isn't available yet, hide the Install button and only show OK
    if (!isStandalone() && canShowBanner()) {
        showBanner();
        if (!deferredInstallPrompt && bannerInstall) {
            bannerInstall.classList.add('hidden');
        }
    }

    // Handle install button click to trigger the prompt
    if (installButton) {
        installButton.addEventListener('click', async () => {
            if (!deferredInstallPrompt) {
                return;
            }
            deferredInstallPrompt.prompt();
            const choice = await deferredInstallPrompt.userChoice;
            deferredInstallPrompt = null;
            if (installItem) {
                installItem.classList.add('hidden');
            }
            hideBanner();
            // Optionally track choice.outcome === 'accepted' | 'dismissed'
        });
    }

    // Banner actions
    if (bannerInstall) {
        bannerInstall.addEventListener('click', async () => {
            if (!deferredInstallPrompt) {
                // No prompt available; just hide banner
                hideBanner();
                return;
            }
            deferredInstallPrompt.prompt();
            const choice = await deferredInstallPrompt.userChoice;
            deferredInstallPrompt = null;
            hideBanner();
            if (installItem) {
                installItem.classList.add('hidden');
            }
        });
    }
    if (bannerDismiss) {
        bannerDismiss.addEventListener('click', () => {
            const until = Date.now() + SNOOZE_MS;
            localStorage.setItem(SNOOZE_KEY, String(until));
            hideBanner();
        });
    }

    // When app is installed, hide install UI
    window.addEventListener('appinstalled', () => {
        if (installItem) {
            installItem.classList.add('hidden');
        }
        hideBanner();
    });
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
