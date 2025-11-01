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
let cachedBasePath = null;

/**
 * Get the base path of the application (e.g., '' or '/TiddeliPWATemplate')
 * This handles both local development and GitHub Pages deployment
 */
function getBasePath() {
    // Cache the base path on first call to avoid recalculating on every navigation
    if (cachedBasePath !== null) {
        return cachedBasePath;
    }
    
    const path = window.location.pathname;
    // If path starts with index.html, we're in local dev and should not use base path
    if (path.includes('/index.html')) {
        cachedBasePath = '';
        return cachedBasePath;
    }
    // For GitHub Pages, we need to detect the base path from the initial URL
    // Check if we're at the root or have a repo name in the path
    if (path === '/' || path === '/index.html') {
        cachedBasePath = '';
        return cachedBasePath;
    }
    // If path starts with something other than just '/', extract base path
    // For GitHub Pages: /TiddeliPWATemplate/ -> /TiddeliPWATemplate
    const match = path.match(/^\/([^\/]+)/);
    cachedBasePath = match ? `/${match[1]}` : '';
    return cachedBasePath;
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
                
                <!-- Sample Image -->
                <div class="my-6">
                    <img src="./images/icons/icon-192.png" alt="App Icon" class="w-32 h-32 mx-auto rounded-lg shadow-md">
                </div>
                
                <!-- Sample Content Sections for Scrolling Test -->
                <div class="space-y-4">
                    <section class="bg-white p-4 rounded-lg shadow-sm">
                        <h2 class="text-xl font-semibold mb-2">Features</h2>
                        <p class="text-gray-600">This PWA template includes:</p>
                        <ul class="list-disc list-inside mt-2 space-y-1 text-gray-600">
                            <li>Offline support via service worker</li>
                            <li>Install prompt for better user experience</li>
                            <li>Responsive design with Tailwind CSS</li>
                            <li>Client-side routing</li>
                            <li>Version management</li>
                        </ul>
                    </section>
                    
                    <section class="bg-white p-4 rounded-lg shadow-sm">
                        <h2 class="text-xl font-semibold mb-2">Getting Started</h2>
                        <p class="text-gray-600 mb-2">To customize this template:</p>
                        <p class="text-gray-600">1. Update the navigation items to match your app sections</p>
                        <p class="text-gray-600">2. Modify the content for each section in router.js</p>
                        <p class="text-gray-600">3. Add your own styling and branding</p>
                        <p class="text-gray-600">4. Configure the manifest.json for your app</p>
                    </section>
                    
                    <section class="bg-white p-4 rounded-lg shadow-sm">
                        <h2 class="text-xl font-semibold mb-2">Additional Content</h2>
                        <p class="text-gray-600">This section demonstrates scrolling behavior on the home page.</p>
                        <p class="text-gray-600 mt-2">You can add more content here to test how the page handles longer content and scrolling.</p>
                    </section>
                    
                    <section class="bg-white p-4 rounded-lg shadow-sm">
                        <h2 class="text-xl font-semibold mb-2">More Information</h2>
                        <p class="text-gray-600">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
                        <p class="text-gray-600 mt-2">Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
                    </section>
                    
                    <section class="bg-white p-4 rounded-lg shadow-sm mb-8">
                        <h2 class="text-xl font-semibold mb-2">Footer Content</h2>
                        <p class="text-gray-600">This is additional content at the bottom of the page to ensure there's enough scrollable content to test the bottom navigation behavior.</p>
                    </section>
                </div>
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
