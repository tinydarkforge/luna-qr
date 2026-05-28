# LunaQR

**Private. Instant. Professional.**

LunaQR is a privacy-first QR code generator that runs entirely in your browser. No server-side processing, no data tracking — just high-quality QR codes delivered instantly.

![LunaQR Preview](./assets/luna.webp)

## Features

- **Privacy by Design** — All generation happens client-side. Your URLs, text, and logos never leave your browser.
- **Real-time Generation** — See changes instantly as you type.
- **Custom Branding** — Upload your logo with auto-ECC upgrade for scannability.
- **High-Quality Exports**
  - **PNG / JPEG / WebP** — Pixel-perfect raster output with logo support.
  - **SVG** — Scalable vector graphics with embedded logos for professional use.
- **Fine-tuned Controls**
  - Adjustable Error Correction levels.
  - Custom sizing and safe margins.
  - Background modes: Light, Dark, and Transparent.
- **Dark & Light themes** inspired by GitHub's color system.
- **Shareable settings** via URL hash.
- **Camera QR scanner** using `jsQR`.
- **Labeled frame mode**.
- **Keyboard shortcut**: `Ctrl+Enter` / `Cmd+Enter` to generate.
- **Fully responsive** (desktop + mobile).

## Deploy

Static site — serves from any host:

| Platform | Config |
|----------|--------|
| **GitHub Pages** | Push `main` → workflow deploys `doc/` |
| **Netlify** | `netlify.toml` included (publish `doc`) |
| **Vercel** | Point to `doc/` directory |
| **Any static server** | `python3 -m http.server 3000 -d doc` |

## Stack

- HTML5 & CSS3 (variables, grid, backdrop filters)
- Vanilla JavaScript (no framework)
- [QRCode.js](https://github.com/davidshimjs/qrcodejs) — generation engine
- [jsQR](https://github.com/cozmo/jsQR) — camera decoding
- Plus Jakarta Sans & Outfit

## License

MIT — see [LICENSE](../LICENSE).
