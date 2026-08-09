@echo off
rem ============================================================================
rem install-task.bat - Install latest task (go-task/task) from official GitHub
rem release into %USERPROFILE%\.local\bin (no admin required).
rem Override install dir with:  set INSTALL_DIR=...
rem Requires Windows 10 1803+ (built-in curl.exe and tar.exe).
rem ============================================================================
setlocal EnableExtensions

set "REPO=go-task/task"
if defined INSTALL_DIR (set "DIR=%INSTALL_DIR%") else (set "DIR=%USERPROFILE%\.local\bin")

rem ---- Detect architecture ----
set "ARCH=%PROCESSOR_ARCHITECTURE%"
if /i "%ARCH%"=="AMD64" set "ARCH=amd64"
if /i "%ARCH%"=="ARM64" set "ARCH=arm64"

rem ---- Get latest release tag via GitHub API ----
for /f "usebackq delims=" %%v in (`powershell -NoProfile -ExecutionPolicy Bypass -Command "(Invoke-RestMethod -Uri 'https://api.github.com/repos/%REPO%/releases/latest' -Headers @{'User-Agent'='install-task'}).tag_name"`) do set "TAG=%%v"
if not defined TAG (
  echo [ERROR] Could not get latest release of %REPO%. Check network / GitHub API rate limit.
  exit /b 1
)

set "FILE=task_windows_%ARCH%.zip"
set "URL=https://github.com/%REPO%/releases/download/%TAG%/%FILE%"
set "TMP=%TEMP%\install-task-%RANDOM%"
mkdir "%TMP%" >nul 2>&1

echo [task] Latest version: %TAG%
echo [task] Downloading: %URL%
curl.exe -fL --retry 3 --max-time 300 -o "%TMP%\%FILE%" "%URL%"
if errorlevel 1 (
  echo [ERROR] Download failed: %URL%
  rmdir /s /q "%TMP%" >nul 2>&1
  exit /b 1
)

echo [task] Extracting and installing to %DIR% ...
tar.exe -xf "%TMP%\%FILE%" -C "%TMP%"
if errorlevel 1 (
  echo [ERROR] Extract failed: %FILE%
  rmdir /s /q "%TMP%" >nul 2>&1
  exit /b 1
)
if not exist "%DIR%" mkdir "%DIR%"
copy /y "%TMP%\task.exe" "%DIR%\task.exe" >nul
if errorlevel 1 (
  echo [ERROR] Copy failed: %DIR%\task.exe
  rmdir /s /q "%TMP%" >nul 2>&1
  exit /b 1
)
rmdir /s /q "%TMP%" >nul 2>&1

echo [OK] task installed: %DIR%\task.exe
"%DIR%\task.exe" --version >nul 2>&1
if errorlevel 1 echo [WARN] Could not verify version - check %DIR%\task.exe manually.

rem ---- Ensure user PATH contains install dir (user-level, no admin needed) ----
powershell -NoProfile -ExecutionPolicy Bypass -Command "$p=[Environment]::GetEnvironmentVariable('Path','User'); if ($p -notlike '*%DIR%*') { [Environment]::SetEnvironmentVariable('Path', ($p + ';' + '%DIR%'), 'User'); Write-Host '[PATH] Added to user PATH - reopen terminal to use.' } else { Write-Host '[PATH] Already in user PATH.' }"

echo.
echo Note: installing under your user profile needs NO admin rights.
echo If you want a system-wide install (e.g. C:\Program Files\task), run this
echo script as Administrator with INSTALL_DIR pointing to a system directory.
endlocal
