# Tiddeli PWA Template

A minimal template app for creating PWA applications. Use this (copy the whole directory) as a starting point to create specific apps.

## Features

* Single-page application with client-side routing
* PWA ready (offline support, installable)
* Responsive design (mobile-first)
* Tailwind CSS for styling
* Service worker for caching
* Version management

## Quick Start

1. **Create PWA Icons**
   - Add `icon-192.png` (192x192) and `icon-512.png` (512x512) to `images/icons/`
   - Use online tools like [realfavicongenerator.net](https://realfavicongenerator.net/)

2. **Build CSS**
   ```bash
   npx tailwindcss -i ./css/styles.css -o ./css/tailwind.output.css --minify --watch
   ```

3. **Test**
   - Start a local server (e.g., Live Server)
   - Open in browser
   - Test PWA installation

## Project Structure

```
├── css/styles.css              # Tailwind source
├── js/                         # Application logic
├── images/icons/               # PWA icons (add your own)
├── index.html                  # Main entry point
├── manifest.json               # PWA manifest
└── design.md                   # Technical details
```

## Customizing

- **App name/version**: Edit `js/config.js`
- **Routes**: Add to `js/router.js`
- **Styling**: Edit `css/styles.css` or use Tailwind classes

More technical details in `design.md`.


