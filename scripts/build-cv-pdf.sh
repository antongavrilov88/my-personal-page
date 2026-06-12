#!/usr/bin/env bash
set -euo pipefail
# Requires a running site (dev or prod) at BASE, e.g.:
#   npm run dev   # note the port
#   scripts/build-cv-pdf.sh http://localhost:3000
CHROME="${CHROME:-$(command -v google-chrome || command -v chromium || echo "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome")}"
BASE="${1:-http://localhost:3000}"
mkdir -p public/cv
for locale in en ru; do
  "$CHROME" --headless=new --disable-gpu \
    --run-all-compositor-stages-before-draw \
    --virtual-time-budget=10000 \
    --print-to-pdf="public/cv/anton-gavrilov-cv-${locale}.pdf" \
    --no-pdf-header-footer \
    "${BASE}/${locale}/cv"
  echo "wrote public/cv/anton-gavrilov-cv-${locale}.pdf"
done
