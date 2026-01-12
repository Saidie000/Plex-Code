#!/bin/bash
set -e

DEV_FOLDER="$(pwd)/NCOM DEV NOTES"

# --- 1️⃣ Create dev notes folder ---
mkdir -p "$DEV_FOLDER"

# --- 2️⃣ Generate repo file tree ---
echo "Generating full repo file tree..."
tree -a -I "node_modules|.git" > "$DEV_FOLDER/repo-file-tree.txt"
echo "✅ Repo file tree saved as repo-file-tree.txt"

# --- 3️⃣ Create Amnesia HTML readme ---
cat > "$DEV_FOLDER/Amnesia.html" << 'HTML_EOF'
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Coders Amnesia</title>
<style>
body { font-family: Arial, sans-serif; background: #121212; color: #f5f5f5; padding: 2em; line-height: 1.6; }
h1 { color: #ff5555; }
code { background: #222; padding: 0.2em 0.4em; border-radius: 4px; }
</style>
</head>
<body>
<h1>Hey, congratulations! You've got Amnesia!</h1>
<p>More formally known as "Coders Amnesia."</p>
<p>You've been away from this repo so long, you've forgotten what the heck you're even looking at. This document is here for a retard like you to remember:</p>
<ul>
<li>What this repo is.</li>
<li>How to use PlexCode, Audax, and NCOM SDK.</li>
<li>Where to find files and commands.</li>
</ul>
<p>If this doesn't work, then blame yourself — you're the one who created me!</p>
<p>Open <code>repo-file-tree.txt</code> to see the full file structure and understand where things live.</p>
</body>
</html>
HTML_EOF

echo "✅ Amnesia.html created in NCOM DEV NOTES"

