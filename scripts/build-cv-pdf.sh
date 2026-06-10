#!/usr/bin/env bash
set -euo pipefail
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
BASE="${1:-http://localhost:3000}"
mkdir -p public/cv
for locale in en ru; do
  "$CHROME" --headless=new --disable-gpu \
    --print-to-pdf="public/cv/anton-gavrilov-cv-${locale}.pdf" \
    --no-pdf-header-footer \
    "${BASE}/${locale}/cv"
  echo "wrote public/cv/anton-gavrilov-cv-${locale}.pdf"
done
