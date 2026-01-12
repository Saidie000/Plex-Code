#!/bin/bash
set -e

echo "=== NCOM SDK Build Script ==="

# --- 1️⃣ Generate self-signed certificate ---
echo "Generating self-signed certificate..."
CERT_NAME="NCOM Systems"
CERT_FILE="PlexCodeCert.pfx"
CERT_PASSWORD="ncom1234"

powershell -Command "New-SelfSignedCertificate -CertStoreLocation Cert:\CurrentUser\My -Subject 'CN=$CERT_NAME' -KeyExportPolicy Exportable -FriendlyName 'NCOM SDK Test Cert'"
powershell -Command "Export-PfxCertificate -Cert Cert:\CurrentUser\My\$(Get-ChildItem Cert:\CurrentUser\My | Where-Object { \$_.Subject -eq 'CN=$CERT_NAME' } | Select-Object -First 1).Thumbprint -FilePath $CERT_FILE -Password (ConvertTo-SecureString -String '$CERT_PASSWORD' -Force -AsPlainText)"

# --- 2️⃣ Create WiX installer file ---
echo "Creating WiX .wxs installer..."
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

# --- 3️⃣ Build MSI using WiX Toolset ---
echo "Compiling MSI..."
candle NCOM-SDK.wxs -o NCOM-SDK.wixobj
light NCOM-SDK.wixobj -o "NCOM SDK Win11.msi"

# --- 4️⃣ Sign the MSI using self-signed certificate ---
echo "Signing MSI with self-signed certificate..."
signtool sign /f $CERT_FILE /p $CERT_PASSWORD /tr http://timestamp.digicert.com /td sha256 /fd sha256 "NCOM SDK Win11.msi"

# --- 5️⃣ Move signed MSI to releases folder ---
mv "NCOM SDK Win11.msi" ../releases/
echo "✅ NCOM SDK MSI built, signed, and ready in releases folder."

