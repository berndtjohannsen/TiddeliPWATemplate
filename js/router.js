/**
 * Client-Side Router
 * Handles navigation without page reloads
 */

/**
 * Route definitions
 * Maps paths to content/functionality
 */
const routes = {
    '/': {
        title: 'Home',
        component: 'home',
    },
    '/section1': {
        title: 'Section 1',
        component: 'section1',
    },
    '/section2': {
        title: 'Section 2',
        component: 'section2',
    },
    '/settings': {
        title: 'Settings',
        component: 'settings',
    },
};

/**
 * Current route state
 */
let currentRoute = '/';

/**
 * Get the base path of the application (e.g., '' or '/TiddeliPWATemplate')
 * This handles both local development and GitHub Pages deployment
 */
function getBasePath() {
    const path = window.location.pathname;
    // If path starts with index.html, we're in local dev and should not use base path
    if (path.includes('/index.html')) {
        return '';
    }
    // If path starts with something other than just '/', extract base path
    // For GitHub Pages: /TiddeliPWATemplate/ -> /TiddeliPWATemplate
    // For local: / -> ''
    const match = path.match(/^\/([^\/]+)/);
    return match ? `/${match[1]}` : '';
}

/**
 * Normalize a route path by removing base path if present
 * @param {string} path - The full path including base path
 * @returns {string} Normalized path without base path
 */
function normalizePath(path) {
    // If path is index.html, treat it as home route
    if (path === '/index.html' || path.endsWith('/index.html')) {
        return '/';
    }
    
    const basePath = getBasePath();
    if (basePath && path.startsWith(basePath)) {
        const normalized = path.substring(basePath.length) || '/';
        return normalized;
    }
    return path;
}

/**
 * Initialize the router
 */
export function initRouter() {
    // Listen for browser back/forward buttons
    window.addEventListener('popstate', handleRoute);
    
    // Handle initial navigation
    const path = normalizePath(window.location.pathname);
    navigate(path);
}

/**
 * Handle route changes
 */
function handleRoute() {
    const path = normalizePath(window.location.pathname);
    navigate(path);
}

/**
 * Navigate to a route
 * @param {string} path - The path to navigate to (should be normalized)
 */
function navigate(path) {
    const route = routes[path] || routes['/'];
    
    // Update current route
    currentRoute = path;
    
    // Build full URL with base path if needed
    const basePath = getBasePath();
    // Handle trailing slash: if path is '/', we want /TiddeliPWATemplate/, not /TiddeliPWATemplate/
    const fullPath = basePath ? (path === '/' ? `${basePath}/` : `${basePath}${path}`) : path;
    
    // Update URL if needed
    if (window.location.pathname !== fullPath) {
        window.history.pushState({}, '', fullPath);
    }
    
    // Update page title
    document.title = `${route.title} - Tiddeli PWA Template`;
    
    // Update main content
    updateMainContent(route.component);
    
    // Update bottom navigation active state
    updateBottomNavActiveState(path);
}

/**
 * Update bottom navigation active state based on current route
 * @param {string} path - The current path
 */
function updateBottomNavActiveState(path) {
    const navItems = document.querySelectorAll('.bottom-nav-item');
    navItems.forEach(item => {
        const route = item.dataset.route;
        if (route === path) {
            // Set as active (blue background, white text)
            item.classList.add('bg-blue-600');
            item.classList.add('text-white');
            item.classList.remove('text-gray-600');
        } else {
            // Set as inactive (no background, gray text)
            item.classList.remove('bg-blue-600');
            item.classList.remove('text-white');
            item.classList.add('text-gray-600');
        }
    });
}

/**
 * Update main content area
 * @param {string} component - Component name to render
 */
function updateMainContent(component) {
    const main = document.querySelector('main');
    if (!main) return;
    
    // Get content for the component
    const content = getComponentContent(component);
    main.innerHTML = content;
}

/**
 * Get component content
 * @param {string} componentName - Name of the component
 * @returns {string} HTML content for the component
 */
function getComponentContent(componentName) {
    const contentMap = {
        home: `
            <div class="p-4">
                <h1 class="text-3xl font-bold mb-4">Welcome</h1>
                <p class="text-gray-600">This is the home page of your PWA template.</p>
                <p class="text-gray-600 mt-4">Start building your app here!</p>
            </div>
        `,
        section1: `
            <div class="p-4">
                <h1 class="text-3xl font-bold mb-4">Section 1</h1>
                <p class="text-gray-600">This is section 1 content.</p>
            </div>
        `,
        section2: `
            <div class="p-4">
                <h1 class="text-3xl font-bold mb-4">Section 2</h1>
                <p class="text-gray-600">This is section 2 content.</p>
            </div>
        `,
        settings: `
            <div class="p-4">
                <h1 class="text-3xl font-bold mb-4">Settings</h1>
                <p class="text-gray-600">App settings will go here.</p>
            </div>
        `,
    };
    
    return contentMap[componentName] || contentMap.home;
}

// Export navigate function for external use
window.router = { navigate };
