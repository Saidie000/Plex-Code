#!/bin/bash
set -e

# -----------------------------
# CONFIGURATION
# -----------------------------
REPO="Saidie000/Plex-Code"
TAG_NAME="v1.0.0"                  # Release tag
MSI_FILE="../releases/NCOM SDK Win11.msi"
RELEASE_NAME="NCOM SDK Win11"
RELEASE_BODY="Automated release of NCOM SDK Win11 MSI with Audax + PlexCode IDE automatically."

# -----------------------------
# 1️⃣ Commit all changes
# -----------------------------
git add -A
git commit -m "Automated commit for release" || echo "⚠️ No changes to commit."

# -----------------------------
# 2️⃣ Push to main
# -----------------------------
git push origin main

# -----------------------------
# 3️⃣ Create GitHub release if missing
# -----------------------------
if ! gh release view "$TAG_NAME" --repo "$REPO" &> /dev/null; then
    gh release create "$TAG_NAME" --repo "$REPO" --title "$RELEASE_NAME" --notes "$RELEASE_BODY"
fi

# -----------------------------
# 4️⃣ Upload MSI
# -----------------------------
if [ ! -f "$MSI_FILE" ]; then
    echo "❌ MSI file not found at $MSI_FILE"
    exit 1
fi

gh release upload "$TAG_NAME" "$MSI_FILE" --repo "$REPO" --clobber
echo "✅ MSI uploaded to release $TAG_NAME successfully!"
