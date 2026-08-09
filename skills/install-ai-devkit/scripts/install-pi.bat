@echo off
rem ============================================================================
rem install-pi.bat - Install pi (earendil-works/pi) AI agent.
rem pi is distributed officially via npm (@earendil-works/pi-coding-agent,
rem CLI name "pi"); there is no official release binary.
rem Note: pi installs into the npm global dir (npm prefix -g), NOT
rem %USERPROFILE%\.local\bin; admin may be required there.
rem ============================================================================
setlocal EnableExtensions

where npm >nul 2>&1
if not errorlevel 1 (
  echo [pi] npm global dir:
  for /f "usebackq delims=" %%p in (`npm prefix -g 2^>nul`) do echo   %%p
  echo [pi] Installing @earendil-works/pi-coding-agent via npm (global)...
  call npm install -g @earendil-works/pi-coding-agent
  if errorlevel 1 (
    echo [ERROR] npm install failed.
    exit /b 1
  )
) else (
  echo [ERROR] npm not found. pi is distributed via npm - install Node.js
  echo         from https://nodejs.org first, then run this script again.
  exit /b 1
)

echo [OK] pi installed. Verify:
pi --version 2>nul || pi version 2>nul || echo   pi command is ready (version command differs by release; try pi --help)
endlocal
