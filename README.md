# Luna QR

Privacy-first QR code generator — static, browser-only, no tracking.

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Deploy](https://github.com/luxbase/luna-qr/actions/workflows/deploy.yml/badge.svg)](https://github.com/luxbase/luna-qr/actions/workflows/deploy.yml)

## Features

- QR code generation via `qrcode.js`
- Custom foreground/background colors + transparent mode
- Logo overlay with auto-ECC upgrade for scannability
- Export as **PNG / JPEG / WebP** or **SVG**
- Camera QR scanner (decodes with `jsQR`)
- Labeled frame mode
- Multiple error correction levels
- Dark & light themes
- Shareable settings via URL hash
- Keyboard shortcut: `Ctrl+Enter` / `Cmd+Enter` to generate
- Fully responsive (desktop + mobile)

## Privacy

Zero data leaves your browser. No analytics, no tracking, no server.

## Structure

```text
doc/
  index.html
  css/styles.css
  js/main.js
  js/vendor/
  assets/
.github/workflows/
  deploy.yml    → GitHub Pages
  quality.yml   → CI
```

## Dev

No build step. Serve `doc/` with any static server:

```bash
python3 -m http.server 3000 -d doc
```

## Deploy

Push to `main` → GitHub Actions deploys `doc/` to Pages. Also works on Netlify, Vercel, S3, etc.
