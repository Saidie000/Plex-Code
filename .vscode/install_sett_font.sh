#!/usr/bin/env bash
set -euo pipefail

SRC=".vscode/fonts/sett.woff"
if [ ! -f "$SRC" ]; then
  echo "[✖] $SRC not found. Place your sett.woff into .vscode/fonts/ and rerun."
  exit 1
fi

FONT_DIR="$HOME/.local/share/fonts"
mkdir -p "$FONT_DIR"
cp "$SRC" "$FONT_DIR/Sett.woff"
fc-cache -f -v || true
echo "[✔] Installed Sett.woff to $FONT_DIR (if supported by your environment)."

echo "Note: VS Code client must have the font available; if you're using a remote Codespace, install the font on the client machine or the container depending on your setup."
