#!/usr/bin/env python3
import sys, os

# Usage: python bootstrap_plx.py <file>
if len(sys.argv) < 2:
    print("Usage: bootstrap_plx.py <file>")
    sys.exit(1)

file_path = sys.argv[1]

try:
    with open(file_path, 'r') as f:
        lines = f.readlines()
except FileNotFoundError:
    print(f"[✖] File not found: {file_path}")
    sys.exit(2)

if lines and lines[0].strip() == ".plx":
    base, ext = os.path.splitext(file_path)
    new_file = base + ".plx"
    if new_file != file_path:
        os.rename(file_path, new_file)
        print(f"[✔] File renamed to {new_file}")
    else:
        print("[✔] File already has .plx extension")
else:
    print("[✖] First line is not .plx — nothing changed")
