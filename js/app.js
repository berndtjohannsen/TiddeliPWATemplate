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
        if (!banner) {
            console.error('[Install] Banner element not found!');
            return;
        }
        
        // Ensure banner is at body level (move if needed)
        if (banner.parentElement !== document.body) {
            document.body.insertBefore(banner, document.body.firstChild);
        }
        
        // Create content if missing (in case HTML was simplified)
        const existingDismiss = banner.querySelector('#banner-dismiss');
        const existingInstall = banner.querySelector('#banner-install');
        if (!existingDismiss || !existingInstall) {
            banner.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
                    <div style="padding-right: 12px; font-size: 14px; flex: 1;">For the best experience, install this app on your device.</div>
                    <div style="display: flex; gap: 8px; flex-shrink: 0;">
                        <button id="banner-dismiss" style="padding: 4px 12px; border-radius: 6px; background: transparent; color: #1e40af; border: none; white-space: nowrap; cursor: pointer;">Not now</button>
                        <button id="banner-install" style="padding: 4px 12px; border-radius: 6px; background: #2563eb; color: white; border: none; white-space: nowrap; cursor: pointer;">Install</button>
                    </div>
                </div>
            `;
            // Re-attach handlers to newly created buttons
            const newDismiss = document.getElementById('banner-dismiss');
            const newInstall = document.getElementById('banner-install');
            if (newDismiss) {
                newDismiss.addEventListener('click', () => {
                    const until = Date.now() + SNOOZE_MS;
                    localStorage.setItem(SNOOZE_KEY, String(until));
                    hideBanner();
                });
            }
            if (newInstall) {
                newInstall.addEventListener('click', async () => {
                    if (!deferredInstallPrompt) {
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
        }
        
        banner.classList.remove('hidden');
        // Force visible: position fixed under header
        const header = document.querySelector('header');
        const topOffset = header ? header.offsetHeight : 0;
        banner.style.cssText = `
            display: block !important;
            position: fixed !important;
            left: 0 !important;
            right: 0 !important;
            top: ${topOffset}px !important;
            z-index: 1000 !important;
            margin: 0 !important;
            width: 100% !important;
            box-sizing: border-box !important;
            background-color: #eff6ff !important;
            border-bottom: 1px solid #bfdbfe !important;
        `;
        console.log('[Install] Banner shown:', banner.getBoundingClientRect());
    }

    function hideBanner() {
        if (banner) {
            banner.classList.add('hidden');
            banner.style.cssText = 'display: none !important;';
        }
    }

    // If event fires later, react to it (secondary listener still ok)
    window.addEventListener('beforeinstallprompt', (e) => {
        // The early listener already prevented default, but we still update state
        if (!deferredInstallPrompt) {
            deferredInstallPrompt = e;
        }
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
    // If install prompt isn't available yet, hide the Install button and only show Not now
    if (!isStandalone() && canShowBanner() && banner) {
        showBanner();
        if (!deferredInstallPrompt && bannerInstall) {
            bannerInstall.classList.add('hidden');
        }
        console.log('[Install] Banner shown on first visit');
    } else {
        console.log('[Install] Banner not shown:', {
            isStandalone: isStandalone(),
            canShow: canShowBanner(),
            bannerExists: !!banner
        });
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
