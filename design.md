# Description
This file describes the implementation, architectural details and tech stack. Much intended to be used by AI.

# Design goals
This app (TiddeliPWATemlate) should be a PWA app that appears like a native app as far as possible. It should follow common design patterns in particular with respect to UI.

Target is reasonbale modern android phones and pads. It should run with various screen sizes.  Portrait mode is preferred. It should also run in a desktop browser.

# Tech stack
## Frontend:
- **HTML5**: Single-page application with `index.html` as the entry point
- **CSS**: Tailwind CSS for styling
  - Source file: `css/styles.css` with Tailwind directives
  - Output file: `css/tailwind.output.css` (generated, never edit directly)
  - Build command: `npx tailwindcss -i ./css/styles.css -o ./css/tailwind.output.css --minify --watch`
- **JavaScript**: Vanilla JavaScript (ES6+)
  - Dynamic content rendering for main content area
  - Client-side navigation without page reloads
  - Service worker for PWA offline capabilities
- **PWA**: 
  - Manifest file (`manifest.json`)
  - Service worker (`sw.js`) for offline functionality and caching

## Backend:
None, in this template app

# Architecture
## Single-Page Application (SPA)
- Single HTML file (`index.html`) as entry point
- Persistent UI elements remain visible:
  - Top navigation bar with app title and menu toggle
  - Bottom navigation bar for main app sections
- Dynamic main content area (`<main>`) updated via JavaScript
- No additional HTML pages loaded
- All navigation handled client-side
- Benefits:
  - Fast, app-like experience (no page reloads)
  - Easy state management in memory or localStorage
  - Consistent UI across the app

## Directory Structure
```
TiddeliPWATemplate/
├── css/
│   ├── styles.css              # Tailwind CSS source
│   └── tailwind.output.css     # Generated output (gitignored)
├── js/
│   ├── app.js                  # Main application logic
│   ├── router.js               # Client-side routing
│   └── sw.js                   # Service worker
├── images/                     # Image assets
│   └── icons/                  # App icons
├── assets/                     # Other static assets
├── index.html                  # Main entry point
├── manifest.json               # PWA manifest
└── [documentation files]
```

# Version management and updates

## Version Numbering
- **Semantic versioning**: Major.Minor.Patch (e.g., 1.2.3)
  - Major: Breaking changes
  - Minor: New features (backward compatible)
  - Patch: Bug fixes
- **Version storage (single source of truth)**: `js/config.js`
- **Version display**: Shown in app drawer/menu footer (populated at runtime)

## Version Tracking Files
1. **`js/config.js`** (ONLY PLACE TO CHANGE): 
   - Contains the version constant: `export const APP_VERSION = 'X.Y.Z';`
   - UI and service worker derive their version from this value
   - **This is the only file you edit when updating version**

2. **`manifest.json`**:
   - Does not include a `version` field (by design)
   - Browsers do not require the manifest to have a version for PWA functionality

3. **Service Worker (`js/sw.js`) and Cache**:
   - `app.js` registers the SW with a query string: `js/sw.js?v=APP_VERSION`
   - SW parses `v` from its own script URL and sets `CACHE_NAME = \`tiddeli-pwa-v${APP_VERSION}\``
   - New versions create new cache names; activation cleans up old caches

## Update Mechanism
- **Service worker registration**: Appends `?v=APP_VERSION` to SW URL; browser checks for updates on load
- **Update detection**: Standard SW lifecycle (new file or URL triggers updatefound)
- **Update strategy**:
  1. New SW installs in background, using versioned cache name
  2. On activation, old caches are deleted
  3. Page reload picks up new cached assets
  4. Optional UI prompt can be added for "Update available"
 - **Cache management**: Graceful fallback if network/cache fails

## Version Display in UI
- `index.html` contains `Version <span id="app-version"></span>` in the drawer footer
- `app.js` sets `#app-version` textContent from `APP_VERSION`
- Format: "Version X.Y.Z" (can be themed)

# Development tools:
- **Live Server**: For development and testing
- **Tailwind CLI**: For CSS compilation
- **Git**: Version control (user managed)

# Build CSS**
   ```bash
   npx tailwindcss -i ./css/styles.css -o ./css/tailwind.output.css --minify --watch
   ```


# Testing
- Manual testing on Android devices
- Desktop browser testing
- PWA installation and offline functionality testing
- Responsive design validation across screen sizes

# Security and Privacy
- No backend, so minimal security concerns
- Service worker respects caching strategies
- localStorage for user preferences (if needed)
- HTTPS required for PWA installation

# UI/UX Design
## Layout Components
1. **Top Bar**
   - App title/logo
   - Menu toggle button (hamburger)
   - Action buttons (if needed)

2. **Main Content Area**
   - Scrollable content
   - Dynamic content rendering based on navigation
   - Loading states

3. **Bottom Navigation Bar**
   - Home icon
   - Sample section icons (placeholder for custom app)
   - Settings/Profile (optional)

4. **Side Drawer/Menu** (when opened)
   - Navigation links
   - App info
   - Version display
   - Settings access

## Design Principles
- Mobile-first approach
- Material Design influenced UI patterns
- Smooth transitions and animations
- Touch-friendly button sizes (minimum 44x44px)
- Readable typography
- Consistent spacing using Tailwind utilities
- High contrast for accessibility

