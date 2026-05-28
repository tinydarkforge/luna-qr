# Luna QR Generator

Modern, privacy-conscious QR code generator built as a static frontend app.

## What it does

- Generates QR codes directly in the browser using `qrcode.js`
- Lets users download generated QR as PNG
- Supports Dark and Light themes with a lunar purple accent
- Works on desktop and mobile layouts
- Includes accessible form controls and keyboard-friendly privacy modal

## Privacy notes

- QR content is generated in-browser and is not stored by this app
- The site uses Google AdSense, which may use cookies/identifiers for ad delivery

## Project structure

```text
doc/
  index.html
  css/styles.css
  js/main.js
  assets/
```

## Local development

No build step is required. Serve `doc/` with any static server.

Example with Python:

```bash
cd public
python3 -m http.server 3000
```

Then open `http://localhost:3000`.

## Deployment

Deploy as static files (Netlify, GitHub Pages, Vercel static, S3, etc.).

## Maintenance suggestions

- Pin and review third-party scripts periodically
- Keep privacy language aligned with ad/analytics integrations
- Add automated accessibility and link checks in CI
