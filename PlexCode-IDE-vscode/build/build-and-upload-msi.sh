#!/bin/bash
set -e

# -----------------------------
# CONFIGURATION
# -----------------------------
REPO="Saidie000/Plex-Code"          # Your GitHub repo
TAG_NAME="v1.0.0"                  # Release tag
MSI_FILE="../releases/NCOM SDK Win11.msi"
RELEASE_NAME="NCOM SDK Win11"
RELEASE_BODY="Automated release of NCOM SDK Win11 MSI with Audax + PlexCode IDE."
CERT_NAME="NCOM Systems"
CERT_FILE="PlexCodeCert.pfx"
CERT_PASSWORD="ncom1234"

# -----------------------------
# 1️⃣ Create releases folder
# -----------------------------
mkdir -p ../releases
echo "✅ Releases folder ready."

# -----------------------------
# 2️⃣ Generate self-signed certificate
# -----------------------------
echo "Generating self-signed certificate..."
powershell -Command "New-SelfSignedCertificate -CertStoreLocation Cert:\CurrentUser\My -Subject 'CN=$CERT_NAME' -KeyExportPolicy Exportable -FriendlyName 'NCOM SDK Test Cert'"
powershell -Command "Export-PfxCertificate -Cert Cert:\CurrentUser\My\$(Get-ChildItem Cert:\CurrentUser\My | Where-Object { \$_.Subject -eq 'CN=$CERT_NAME' } | Select-Object -First 1).Thumbprint -FilePath $CERT_FILE -Password (ConvertTo-SecureString -String '$CERT_PASSWORD' -Force -AsPlainText)"
echo "✅ Self-signed certificate created."

# -----------------------------
# 3️⃣ Create WiX installer
# -----------------------------
echo "Creating WiX installer..."
cat > NCOM-SDK.wxs << 'WXS_EOF'
<?xml version="1.0" encoding="UTF-8"?>
<Wix xmlns="http://schemas.microsoft.com/wix/2006/wi">
  <Product Id="*" Name="NCOM SDK" Language="1033" Version="1.0.0.0" Manufacturer="NCOM Systems" UpgradeCode="PUT-GUID-HERE">
    <Package InstallerVersion="500" Compressed="yes" InstallScope="perMachine" />
    <Media Id="1" Cabinet="media1.cab" EmbedCab="yes" />
    <Directory Id="TARGETDIR" Name="SourceDir">
      <Directory Id="ProgramFilesFolder">
        <Directory Id="INSTALLFOLDER" Name="NCOM SDK">
          <Component Id="PlexCodeIDE" Guid="PUT-GUID-HERE">
            <File Id="plexcode-shell" Source="../src/plexcode-shell.js" KeyPath="yes" />
          </Component>
          <Component Id="mf-webview" Guid="PUT-GUID-HERE">
            <File Id="mf-webview-html" Source="../src/webview/mf-webview.html" KeyPath="yes" />
          </Component>
          <Component Id="mfPreview" Guid="PUT-GUID-HERE">
            <File Id="mfPreviewJS" Source="../src/mfPreview.js" KeyPath="yes" />
          </Component>
        </Directory>
      </Directory>
    </Directory>
    <Feature Id="DefaultFeature" Level="1">
      <ComponentRef Id="PlexCodeIDE" />
      <ComponentRef Id="mf-webview" />
      <ComponentRef Id="mfPreview" />
    </Feature>
  </Product>
</Wix>
WXS_EOF

echo "✅ WiX installer file created."

# -----------------------------
# 4️⃣ Build MSI
# -----------------------------
echo "Compiling MSI..."
candle NCOM-SDK.wxs -o NCOM-SDK.wixobj
light NCOM-SDK.wixobj -o "NCOM SDK Win11.msi"
echo "✅ MSI compiled."

# -----------------------------
# 5️⃣ Sign MSI
# -----------------------------
echo "Signing MSI..."
signtool sign /f $CERT_FILE /p $CERT_PASSWORD /tr http://timestamp.digicert.com /td sha256 /fd sha256 "NCOM SDK Win11.msi"
echo "✅ MSI signed."

# -----------------------------
# 6️⃣ Move MSI to releases
# -----------------------------
mv "NCOM SDK Win11.msi" ../releases/
echo "✅ MSI moved to releases folder."

# -----------------------------
# 7️⃣ Upload to GitHub release
# -----------------------------
if ! command -v gh &> /dev/null
then
    echo "❌ GitHub CLI 'gh' not installed. Install it first: https://cli.github.com/"
    exit 1
fi

# Create release if it doesn't exist
if gh release view "$TAG_NAME" --repo "$REPO" &> /dev/null; then
    echo "Release $TAG_NAME exists. Skipping creation..."
else
    echo "Creating GitHub release $TAG_NAME..."
    gh release create "$TAG_NAME" --repo "$REPO" --title "$RELEASE_NAME" --notes "$RELEASE_BODY"
fi

# Upload MSI
echo "Uploading MSI to GitHub release..."
gh release upload "$TAG_NAME" ../releases/NCOM\ SDK\ Win11.msi --repo "$REPO" --clobber

echo "✅ MSI uploaded successfully to GitHub release $TAG_NAME!"
