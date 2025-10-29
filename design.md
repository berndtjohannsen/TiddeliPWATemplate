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
   - Also exports `CACHE_NAME = \`tiddeli-pwa-v${APP_VERSION}\`` for consistency
   - UI and service worker derive their version from this value
   - **This is the only file you edit when updating version**

2. **`manifest.json`**:
   - Does not include a `version` field (by design)
   - Browsers do not require the manifest to have a version for PWA functionality

3. **Service Worker (`sw.js`) and Cache**:
   - Located in root directory (`sw.js`, not `js/sw.js`)
   - `app.js` registers the SW with a query string: `sw.js?v=APP_VERSION`
   - SW parses `v` parameter from its own script URL and sets `CACHE_NAME = \`tiddeli-pwa-v${APP_VERSION}\``
   - New versions create new cache names; activation cleans up old caches
   - Uses network-first strategy for HTML and `config.js` to quickly pick up new versions
   - Cache-first strategy for other static assets

## Update Mechanism
- **Service worker registration**: Appends `?v=APP_VERSION` to SW URL (`sw.js?v=X.Y.Z`); browser checks for updates on load
- **Update detection**: Standard SW lifecycle (new file or URL triggers `updatefound` event)
- **Update strategy**:
  1. New SW installs in background, using versioned cache name
  2. SW calls `skipWaiting()` to activate immediately
  3. On activation, old caches are deleted and new SW takes control
  4. `app.js` listens for `controllerchange` event and automatically reloads the page once
  5. Automatic reload ensures fresh assets are loaded from new cache
- **Cache management**: 
  - Network-first for HTML navigation and `config.js` (allows quick version detection)
  - Cache-first for other static assets (images, CSS, etc.)
  - Graceful fallback to cache if network fails

## Version-Aware Install Banner
- **Version tracking in localStorage**: 
  - Stores last seen version in `installBannerLastVersionSeen` key
  - Uses this to detect when `APP_VERSION` changes
- **Smart banner display**:
  - Banner automatically shows when version changes (even if previously snoozed)
  - Banner can be snoozed for 7 days, but version changes override snooze
  - After install attempt or dismiss, current version is marked as seen
- **Integration with PWA install prompt**:
  - Uses native `beforeinstallprompt` event
  - Banner shows "Install" button only when install prompt is available
  - Hides install UI once app is installed (detected via `appinstalled` event)

## Version Display in UI
- `index.html` contains `Version <span id="app-version"></span>` in the drawer footer
- `app.js` imports `APP_VERSION` from `config.js` and sets `#app-version` textContent
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

