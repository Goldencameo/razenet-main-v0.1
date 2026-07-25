; Inno Setup script for RazePlayer (Windows)
; Build from repo root:
;   iscc razeplayer\installer\razeplayer.iss
;
; Requires exported files:
;   razeplayer\RazePlayer.exe
;   razeplayer\RazePlayer.pck

#define MyAppName "RazePlayer"
#define MyAppVersion "1.0.0"
#define MyAppPublisher "RazeHub"
#define MyAppURL "https://razehub.com"
#define MyAppExeName "RazePlayer.exe"

[Setup]
AppId={{A7C4E2B1-9F3D-4A8E-B6C1-2D5E8F0A1B3C}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}
AppUpdatesURL={#MyAppURL}
DefaultDirName={autopf}\{#MyAppName}
DefaultGroupName={#MyAppName}
DisableProgramGroupPage=yes
LicenseFile=
OutputDir=..\dist
OutputBaseFilename=RazePlayerSetup
Compression=lzma2
SolidCompression=yes
WizardStyle=modern
PrivilegesRequired=admin
ArchitecturesInstallIn64BitMode=x64compatible

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked

[Files]
Source: "..\RazePlayer.exe"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\RazePlayer.pck"; DestDir: "{app}"; Flags: ignoreversion

[Icons]
Name: "{group}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"
Name: "{autodesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; Tasks: desktopicon

[Registry]
; Register razeplayer:// custom URL protocol
Root: HKCR; Subkey: "razeplayer"; ValueType: string; ValueName: ""; ValueData: "URL:RazePlayer Protocol"; Flags: uninsdeletekey
Root: HKCR; Subkey: "razeplayer"; ValueType: string; ValueName: "URL Protocol"; ValueData: ""; Flags: uninsdeletevalue
Root: HKCR; Subkey: "razeplayer\DefaultIcon"; ValueType: string; ValueName: ""; ValueData: "{app}\{#MyAppExeName},0"
Root: HKCR; Subkey: "razeplayer\shell\open\command"; ValueType: string; ValueName: ""; ValueData: """{app}\{#MyAppExeName}"" ""%1"""

[Run]
Filename: "{app}\{#MyAppExeName}"; Description: "{cm:LaunchProgram,{#StringChange(MyAppName, '&', '&&')}}"; Flags: nowait postinstall skipifsilent

[Code]
function InitializeSetup(): Boolean;
begin
  Result := True;
  if not FileExists(ExpandConstant('{src}\..\RazePlayer.exe')) then
  begin
    MsgBox('RazePlayer.exe was not found. Export the Godot project to razeplayer\ before building the installer.', mbError, MB_OK);
    Result := False;
  end
  else if not FileExists(ExpandConstant('{src}\..\RazePlayer.pck')) then
  begin
    MsgBox('RazePlayer.pck was not found. Export the Godot project to razeplayer\ before building the installer.', mbError, MB_OK);
    Result := False;
  end;
end;
