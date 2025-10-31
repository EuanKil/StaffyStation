# STAFFY STATION

Static website about Staffordshire Bull Terriers. Pure HTML/CSS/JS, no backend.

## Contents

- index.html — Home
- gallery.html — Slideshow/gallery
- about.html — About page
- share.html — Submit and view community stories (stored in localStorage)
- policies.html — Site policies
- styles.css — Styles and layout
- script.js — Menu and small UI helpers
- slideshow.js — Slideshow logic and image list
- text-to-speech.js — Read-aloud buttons (Web Speech API)
- translate.js — Language selector backed by Google Translate
- share.js — Form handling, previews, localStorage persistence
- Images2/ — Images used by pages

## Run locally

Option A: open index.html in a browser.

Option B (recommended for Translate): serve over http://localhost

- Windows PowerShell
  1. Navigate to this folder
  2. Start a simple server on port 5500: `python -m http.server 5500`
  3. Open http://localhost:5500/

## Features

- Responsive layout with hamburger menu
- Slideshow with buttons and keyboard (←/→)
- Text-to-Speech on stories/About (if supported by the browser)
- Language selector using Google Translate (requires internet)
- "Share your story" form with image previews and local storage

## Notes

- Google Translate may not initialize on file:// pages; use a local server
- localStorage can be limited or disabled in Private/Incognito windows
- Image filenames must match those in `Images2/`

## Customize

- Change slideshow images in `slideshow.js` (the `images` array)
- Edit seeded stories in `share.js` (`seedStoriesIfEmpty()`)
- Update styles in `styles.css`

## Troubleshooting

- Language selector empty: check internet and use http://localhost
- TTS not working: try a Chromium browser and allow audio
- Stories not saved: check localStorage availability and image sizes

## Credits

Author: Euan Kilbane (2025001928)
