# LunaQR

Privacy-first QR code generator — static, browser-only, zero tracking.

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Deploy](https://github.com/luxbase/luna-qr/actions/workflows/deploy.yml/badge.svg)](https://github.com/luxbase/luna-qr/actions/workflows/deploy.yml)

## Features

- **QR generation** via `qrcode.js` — PNG/JPEG/WebP/SVG export
- **Custom colors** — foreground, background, and transparent mode
- **Camera scanner** — decode existing QR codes via `jsQR`
- **Labeled frame** mode for branded outputs
- **Error correction**: Compact / Balanced / Robust / Maximum
- **Dark & light themes** — persisted to `localStorage`
- **Shareable settings** via URL hash (all controls serialized)
- **Keyboard shortcut**: `Ctrl+Enter` / `Cmd+Enter` to generate
- **Fully responsive** (desktop + mobile)

## Privacy

All processing happens in your browser. No data is sent to any server — no analytics, no tracking, no backend.

## Structure

```text
doc/
├── index.html
├── css/styles.css
├── js/
│   ├── main.js
│   └── vendor/
│       ├── qrcode.min.js
│       └── jsqr.min.js
└── assets/
    ├── luna.webp
    └── placeholder.svg
.github/workflows/
├── deploy.yml    → GitHub Pages
└── quality.yml   → CI (static checks + smoke test)
```

## Dev

No build step. Serve `doc/` with any static server:

```bash
python3 -m http.server 3000 -d doc
```

## Deploy

Push to `main` → GitHub Actions deploys `doc/` to Pages. Also works on Netlify, Vercel, S3, etc.
