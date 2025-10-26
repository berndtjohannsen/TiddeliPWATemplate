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
- **Version storage**: Single source of truth in `js/config.js`
- **Version display**: Shown in app drawer/menu footer

## Version Tracking Files
1. **`js/config.js`** (PRIMARY/SINGLE SOURCE): 
   - Contains version number as constant
   - Read by application and build tools
   - Format: `export const APP_VERSION = '1.0.0';`
   - **This is the only file you edit when updating version**

2. **`manifest.json`** (AUTO-GENERATED or SYNCED):
   - Browser expects version field for PWA
   - Options for keeping in sync:
     - **Option A**: Manually update both files (simple but error-prone)
     - **Option B**: JavaScript reads from config.js and updates manifest at runtime (more complex)
     - **Option C**: Build script copies version from config.js to manifest.json (recommended if using build tools)
   - Since we're using vanilla JS with minimal build process, manually keeping them in sync is acceptable

3. **Service Worker Cache**:
   - Cache name includes version (e.g., `cache-v1.0.0`)
   - Version read from config.js at runtime
   - Allows multiple versions to coexist
   - Old caches cleaned up automatically

## Update Mechanism
- **Service worker registration**: Checks for updates on page load
- **Update detection**: Compares service worker file hash
- **Update strategy**:
  1. New service worker downloads in background
  2. User sees "Update available" notification
  3. On user action, activate new service worker
  4. Reload page to get new cached assets
- **Cache management**: 
  - Old cache deleted after new cache activated
  - Graceful fallback if new version fails

## Version Display in UI
- App drawer footer shows current version
- Format: "Version 1.0.0" or "v1.0.0"
- Clickable to show version history (optional)

# Development tools:
- **Live Server**: For development and testing
- **Tailwind CLI**: For CSS compilation
- **Git**: Version control (user managed)

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

