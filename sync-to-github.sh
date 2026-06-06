#!/usr/bin/env bash
# Sync workspace edits to GitHub (triggers Render auto-redeploy).
# Usage: ./sync-to-github.sh "your commit message"
set -e

MSG="${1:-Update from Ninja workspace}"

# Pull the latest index.html from the workspace root into this bundle
if [ -f ../index.html ]; then
  cp ../index.html ./index.html
  echo "Synced index.html from workspace root."
fi

git add -A
if git diff --cached --quiet; then
  echo "No changes to commit."
  exit 0
fi

git commit -m "$MSG"
git push origin main
echo "Pushed to GitHub. Render will auto-redeploy."
