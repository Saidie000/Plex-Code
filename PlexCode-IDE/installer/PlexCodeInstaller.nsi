OutFile "PlexCode_Installer.exe"
InstallDir "$PROGRAMFILES\PlexCode Editor"
Page directory
Page instfiles

Section "Install"
  SetOutPath "$INSTDIR"
  File /r "../editor/*"        ; VSCode + PlexCode extension
  File "../plexcode_shell.exe" ; Runtime shell
  CreateShortcut "$DESKTOP\PlexCode.lnk" "$INSTDIR/Code.exe"
SectionEnd
