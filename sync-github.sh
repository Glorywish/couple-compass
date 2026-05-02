#!/bin/bash
# Push the latest Replit changes to GitHub
# Run this from the Replit Shell after any session to keep GitHub in sync

set -e

if [ -z "$GITHUB_PERSONAL_ACCESS_TOKEN" ]; then
  echo "Error: GITHUB_PERSONAL_ACCESS_TOKEN secret is not set."
  exit 1
fi

echo "Pushing to GitHub..."
git --no-optional-locks push \
  "https://Glorywish:$GITHUB_PERSONAL_ACCESS_TOKEN@github.com/Glorywish/couple-compass.git" \
  main

echo "Done! View your repo at: https://github.com/Glorywish/couple-compass"
