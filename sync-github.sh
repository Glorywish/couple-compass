#!/usr/bin/env bash
set -e

if [ -z "$GITHUB_PERSONAL_ACCESS_TOKEN" ]; then
  echo "Error: GITHUB_PERSONAL_ACCESS_TOKEN secret is not set."
  exit 1
fi

echo "Pushing to GitHub..."
git push \
  "https://Glorywish:$GITHUB_PERSONAL_ACCESS_TOKEN@github.com/Glorywish/couple-compass.git" \
  main

echo "Done! View your repo at: https://github.com/Glorywish/couple-compass"
