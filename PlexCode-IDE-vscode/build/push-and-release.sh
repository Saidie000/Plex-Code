#!/bin/bash
set -e

# -----------------------------
# CONFIGURATION
# -----------------------------
REPO="Saidie000/Plex-Code"
TAG_NAME="v1.0.0"                  # Release tag
MSI_FILE="../releases/NCOM SDK Win11.msi"
RELEASE_NAME="NCOM SDK Win11"
RELEASE_BODY="Automated release of NCOM SDK Win11 MSI with Audax + PlexCode IDE."

# -----------------------------
# 1️⃣ Commit all changes
# -----------------------------
echo "Adding all changes to git..."
git add -A
git commit -m "Automated commit for release" || echo "⚠️ No changes to commit."

# -----------------------------
# 2️⃣ Push to main
# -----------------------------
echo "Pushing changes to main..."
git push origin main
echo "✅ Changes pushed."

# -----------------------------
# 3️⃣ Check for GitHub CLI
# -----------------------------
if ! command -v gh &> /dev/null
then
    echo "❌ GitHub CLI not found. Install it first: https://cli.github.com/"
    exit 1
fi

# -----------------------------
# 4️⃣ Create release if not exists
# -----------------------------
if gh release view "$TAG_NAME" --repo "$REPO" &> /dev/null; then
    echo "Release $TAG_NAME exists. Skipping creation..."
else
    echo "Creating GitHub release $TAG_NAME..."
    gh release create "$TAG_NAME" --repo "$REPO" --title "$RELEASE_NAME" --notes "$RELEASE_BODY"
fi

# -----------------------------
# 5️⃣ Upload MSI to release
# -----------------------------
echo "Uploading MSI to GitHub release..."
gh release upload "$TAG_NAME" "$MSI_FILE" --repo "$REPO" --clobber
echo "✅ MSI uploaded to release $TAG_NAME successfully!"
