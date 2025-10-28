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
        const swUrl = `js/sw.js?v=${encodeURIComponent(APP_VERSION)}`;
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
function setupInstallPromptHandlers() {
    const installItem = document.getElementById('install-app-item');
    const installButton = document.getElementById('install-app-button');

    // Listen for the beforeinstallprompt event and show our own install UI
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredInstallPrompt = e;
        if (installItem) {
            installItem.classList.remove('hidden');
        }
    });

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
            // Optionally track choice.outcome === 'accepted' | 'dismissed'
        });
    }

    // When app is installed, hide install UI
    window.addEventListener('appinstalled', () => {
        if (installItem) {
            installItem.classList.add('hidden');
        }
    });
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
