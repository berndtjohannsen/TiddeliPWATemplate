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
 * Initialize the router
 */
export function initRouter() {
    // Handle initial route
    handleRoute();
    
    // Listen for browser back/forward buttons
    window.addEventListener('popstate', handleRoute);
    
    // Handle initial navigation
    const path = window.location.pathname;
    navigate(path);
}

/**
 * Handle route changes
 */
function handleRoute() {
    const path = window.location.pathname;
    navigate(path);
}

/**
 * Navigate to a route
 * @param {string} path - The path to navigate to
 */
function navigate(path) {
    const route = routes[path] || routes['/'];
    
    // Update current route
    currentRoute = path;
    
    // Update page title
    document.title = `${route.title} - Tiddeli PWA Template`;
    
    // Update main content
    updateMainContent(route.component);
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
