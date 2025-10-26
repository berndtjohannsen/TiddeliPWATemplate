# Tiddeli PWA Template - Setup Guide

## Current Status

The PWA template has been created with the following structure:

### ✅ Completed
- Project structure created
- HTML, JavaScript, and CSS files created
- Tailwind CSS installed and configured
- PWA manifest configured
- Service worker setup
- Client-side routing implemented

### ⚠️ Next Steps Required

#### 1. Create PWA Icons
You need to create two icon files in `images/icons/`:
- `icon-192.png` - 192x192 pixels
- `icon-512.png` - 512x512 pixels

You can use online tools like:
- https://www.favicon-generator.org/
- https://realfavicongenerator.net/
- Or any image editor

#### 2. Test the Application
1. Start a local development server (e.g., Live Server in VS Code)
2. Open the application in a browser
3. Test the navigation between sections
4. Check the service worker is registered (DevTools > Application > Service Workers)

#### 3. Development Workflow

**Building Tailwind CSS:**
```bash
npx tailwindcss -i ./css/styles.css -o ./css/tailwind.output.css --minify --watch
```

The `--watch` flag will automatically rebuild the CSS when you make changes.

**Or for a one-time build:**
```bash
npx tailwindcss -i ./css/styles.css -o ./css/tailwind.output.css --minify
```

## Project Structure

```
TiddeliPWATemplate/
├── css/
│   ├── styles.css              # Tailwind source (edit this)
│   └── tailwind.output.css     # Generated output (gitignored)
├── js/
│   ├── config.js               # App configuration and version
│   ├── app.js                  # Main application logic
│   ├── router.js               # Client-side routing
│   └── sw.js                   # Service worker
├── images/
│   └── icons/                  # Place your PWA icons here
├── assets/                     # Additional assets
├── index.html                  # Main entry point
├── manifest.json               # PWA manifest
├── tailwind.config.js          # Tailwind configuration
└── package.json                # NPM dependencies
```

## Key Features

- **Single Page Application**: No page reloads, smooth navigation
- **PWA Ready**: Offline support, installable as an app
- **Responsive Design**: Works on mobile and desktop
- **Modern UI**: Tailwind CSS for styling
- **Version Management**: Centralized version tracking in `js/config.js`

## Customizing

1. **App Name & Version**: Update `js/config.js`
2. **Routes**: Add new routes in `js/router.js`
3. **Styling**: Edit `css/styles.css` or use Tailwind classes in HTML
4. **Icons**: Replace icons in `images/icons/`

## Testing PWA Features

1. Open Chrome DevTools
2. Go to Application tab
3. Check Service Worker registration
4. Test "Add to Home Screen" functionality
5. Test offline mode by disabling network

## Browser Support

- Chrome/Edge: Full PWA support
- Firefox: Good support
- Safari: Good support (iOS 11.3+)
