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
        // Use absolute path to ensure SW registers from root, not relative to current path
        const swUrl = '/sw.js?v=' + encodeURIComponent(APP_VERSION);
        console.log('Registering service worker from:', swUrl);
        console.log('Current location:', window.location.href);
        console.log('Current pathname:', window.location.pathname);
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
            e.preventDefault();
            e.stopPropagation();
            // Handle navigation - let the router update the active state
            const route = item.dataset.route;
            if (route && window.router) {
                // Navigate using router
                window.router.navigate(route);
            } else if (route) {
                // Fallback: update URL and let popstate handle it
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
    const topInstallButton = document.getElementById('top-install-button');
    const topInstallPlaceholder = document.getElementById('top-install-placeholder');
    const banner = document.getElementById('install-banner');
    const bannerInstall = document.getElementById('banner-install');
    const bannerDismiss = document.getElementById('banner-dismiss');

    // Snooze configuration
    const SNOOZE_KEY = 'installBannerSnoozedUntil';
    const VERSION_SEEN_KEY = 'installBannerLastVersionSeen';
    const SNOOZE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

    function isStandalone() {
        return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    }

    function canShowBanner() {
        // Always show if version changed (new version available)
        const lastVersionSeen = localStorage.getItem(VERSION_SEEN_KEY);
        if (lastVersionSeen !== APP_VERSION) {
            return true; // New version - show banner regardless of snooze
        }
        
        // Same version - check snooze period
        const until = localStorage.getItem(SNOOZE_KEY);
        if (!until) return true;
        const untilMs = parseInt(until, 10);
        return Number.isNaN(untilMs) || Date.now() > untilMs;
    }
    
    function markVersionSeen() {
        localStorage.setItem(VERSION_SEEN_KEY, APP_VERSION);
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
                <div style="display: flex; align-items: center; justify-content: space-between; width: 100%; padding: 12px 16px; gap: 12px; flex-wrap: wrap;">
                    <div style="flex: 1; min-width: 200px; font-size: 14px; line-height: 1.5; color: #1e3a8a;">
                        <strong>📱 Install App</strong><br>
                        <span style="font-size: 13px; color: #475569;">For the best experience, install this app on your device.</span>
                    </div>
                    <div style="display: flex; gap: 8px; flex-shrink: 0; align-items: center;">
                        <button id="banner-dismiss" style="padding: 8px 16px; border-radius: 6px; background: transparent; color: #475569; border: 1px solid #cbd5e1; font-size: 14px; font-weight: 500; white-space: nowrap; cursor: pointer; transition: background-color 0.2s;">Not now</button>
                        <button id="banner-install" style="padding: 8px 16px; border-radius: 6px; background: #2563eb; color: white; border: none; font-size: 14px; font-weight: 600; white-space: nowrap; cursor: pointer; box-shadow: 0 1px 3px rgba(0,0,0,0.1); transition: background-color 0.2s;">Install</button>
                    </div>
                </div>
            `;
            // Re-attach handlers to newly created buttons
            const newDismiss = document.getElementById('banner-dismiss');
            const newInstall = document.getElementById('banner-install');
            if (newDismiss) {
                // Add hover effect
                newDismiss.addEventListener('mouseenter', () => {
                    newDismiss.style.backgroundColor = '#f1f5f9';
                });
                newDismiss.addEventListener('mouseleave', () => {
                    newDismiss.style.backgroundColor = 'transparent';
                });
                newDismiss.addEventListener('click', () => {
                    const until = Date.now() + SNOOZE_MS;
                    localStorage.setItem(SNOOZE_KEY, String(until));
                    markVersionSeen(); // Mark current version as seen
                    hideBanner();
                });
            }
            if (newInstall) {
                // Add hover effect
                newInstall.addEventListener('mouseenter', () => {
                    newInstall.style.backgroundColor = '#1d4ed8';
                });
                newInstall.addEventListener('mouseleave', () => {
                    newInstall.style.backgroundColor = '#2563eb';
                });
                newInstall.addEventListener('click', async () => {
                    if (!deferredInstallPrompt) {
                        markVersionSeen(); // Mark as seen even if install not available
                        hideBanner();
                        return;
                    }
                    deferredInstallPrompt.prompt();
                    const choice = await deferredInstallPrompt.userChoice;
                    deferredInstallPrompt = null;
                    markVersionSeen(); // Mark version as seen after install attempt
                    hideBanner();
                    if (topInstallButton) {
                        topInstallButton.classList.add('hidden');
                    }
                    if (topInstallPlaceholder) {
                        topInstallPlaceholder.classList.remove('hidden');
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
            background: linear-gradient(to bottom, #ffffff, #eff6ff) !important;
            border-bottom: 2px solid #3b82f6 !important;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1) !important;
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
        if (topInstallButton) {
            topInstallButton.classList.remove('hidden');
        }
        if (topInstallPlaceholder) {
            topInstallPlaceholder.classList.add('hidden');
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
        if (topInstallButton) {
            topInstallButton.classList.remove('hidden');
        }
        if (topInstallPlaceholder) {
            topInstallPlaceholder.classList.add('hidden');
        }
        if (!isStandalone() && canShowBanner()) {
            showBanner();
        }
        if (bannerInstall) {
            bannerInstall.classList.remove('hidden');
        }
    }

    // Always show banner on first visit or when version changes
    // If install prompt isn't available yet, hide the Install button and only show Not now
    if (!isStandalone() && canShowBanner() && banner) {
        showBanner();
        if (!deferredInstallPrompt && bannerInstall) {
            bannerInstall.classList.add('hidden');
        }
        const lastVersionSeen = localStorage.getItem(VERSION_SEEN_KEY);
        if (lastVersionSeen !== APP_VERSION) {
            console.log(`[Install] Banner shown for new version (${APP_VERSION}, was ${lastVersionSeen || 'none'})`);
        } else {
            console.log('[Install] Banner shown on first visit');
        }
    } else {
        console.log('[Install] Banner not shown:', {
            isStandalone: isStandalone(),
            canShow: canShowBanner(),
            bannerExists: !!banner,
            currentVersion: APP_VERSION,
            lastSeenVersion: localStorage.getItem(VERSION_SEEN_KEY)
        });
    }

    // Handle top install button click to trigger the prompt
    if (topInstallButton) {
        topInstallButton.addEventListener('click', async () => {
            if (!deferredInstallPrompt) {
                return;
            }
            deferredInstallPrompt.prompt();
            const choice = await deferredInstallPrompt.userChoice;
            deferredInstallPrompt = null;
            if (topInstallButton) {
                topInstallButton.classList.add('hidden');
            }
            if (topInstallPlaceholder) {
                topInstallPlaceholder.classList.remove('hidden');
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
                markVersionSeen(); // Mark as seen even if install not available
                hideBanner();
                return;
            }
            deferredInstallPrompt.prompt();
            const choice = await deferredInstallPrompt.userChoice;
            deferredInstallPrompt = null;
            markVersionSeen(); // Mark version as seen after install attempt
            hideBanner();
            if (topInstallButton) {
                topInstallButton.classList.add('hidden');
            }
            if (topInstallPlaceholder) {
                topInstallPlaceholder.classList.remove('hidden');
            }
        });
    }
    if (bannerDismiss) {
        bannerDismiss.addEventListener('click', () => {
            const until = Date.now() + SNOOZE_MS;
            localStorage.setItem(SNOOZE_KEY, String(until));
            markVersionSeen(); // Mark current version as seen
            hideBanner();
        });
    }

    // When app is installed, hide install UI
    window.addEventListener('appinstalled', () => {
        if (topInstallButton) {
            topInstallButton.classList.add('hidden');
        }
        if (topInstallPlaceholder) {
            topInstallPlaceholder.classList.remove('hidden');
        }
        hideBanner();
        console.log('[Install] App successfully installed!');
    });
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
