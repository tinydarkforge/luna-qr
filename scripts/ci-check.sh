#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

required_files=(
  "doc/index.html"
  "doc/css/styles.css"
  "doc/js/main.js"
  "doc/robots.txt"
  "doc/sitemap.xml"
)

for file in "${required_files[@]}"; do
  [[ -f "$file" ]] || { echo "Missing required file: $file"; exit 1; }
done

# Ensure every target="_blank" anchor block has rel="noopener noreferrer".
awk '
  /<a[[:space:]][^>]*target="_blank"/ { in_anchor=1; has_rel=($0 ~ /rel="noopener noreferrer"/); next }
  in_anchor {
    if ($0 ~ /rel="noopener noreferrer"/) has_rel=1;
    if ($0 ~ />/) {
      if (!has_rel) {
        print "Found target=\"_blank\" link without rel=\"noopener noreferrer\"";
        exit 1;
      }
      in_anchor=0;
      has_rel=0;
    }
  }
' doc/index.html

# Ensure anti-user copy/paste blockers are not present.
for pattern in 'contextmenu' '"copy"' '"cut"' '"paste"'; do
  if rg -n "$pattern" doc/js/main.js >/dev/null; then
    echo "Blocked interaction pattern found in JS: $pattern"
    exit 1
  fi
done

# Ensure index references local assets that exist.
index_refs=(
  "css/styles.css"
  "js/main.js"
  "assets/luna.webp"
  "assets/placeholder.svg"
)

for ref in "${index_refs[@]}"; do
  if ! rg -n "$ref" doc/index.html >/dev/null; then
    echo "index.html is missing reference: $ref"
    exit 1
  fi
  [[ -f "doc/$ref" ]] || { echo "Referenced file missing: doc/$ref"; exit 1; }
done

echo "ci-check: OK"
