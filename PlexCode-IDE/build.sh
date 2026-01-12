#!/bin/bash
echo "Installing Wine + NSIS..."
sudo apt update
sudo apt install -y wine nsis

echo "Building Windows installer..."
wine makensis installer/PlexCodeInstaller.nsi

echo "Installer created: PlexCode_Installer.exe"
