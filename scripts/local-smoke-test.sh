#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR/doc"

PORT="${1:-4173}"

python3 -m http.server "$PORT" >/tmp/luna-qr-http.log 2>&1 &
SERVER_PID=$!
cleanup() {
  kill "$SERVER_PID" >/dev/null 2>&1 || true
}
trap cleanup EXIT

BASE_URL="http://127.0.0.1:${PORT}"

for _ in {1..20}; do
  if curl -fsS "${BASE_URL}/" >/tmp/luna-qr-index.html 2>/dev/null; then
    break
  fi
  sleep 0.3
done

curl -fsS "${BASE_URL}/" >/tmp/luna-qr-index.html
curl -fsS "${BASE_URL}/css/styles.css" >/dev/null
curl -fsS "${BASE_URL}/js/main.js" >/dev/null
curl -fsS "${BASE_URL}/robots.txt" >/dev/null
curl -fsS "${BASE_URL}/sitemap.xml" >/dev/null

rg -n 'class="theme-btn"' /tmp/luna-qr-index.html >/dev/null
rg -n 'id="qrForm"' /tmp/luna-qr-index.html >/dev/null
rg -n 'id="privacy-modal"' /tmp/luna-qr-index.html >/dev/null

echo "local-smoke-test: OK (${BASE_URL})"
