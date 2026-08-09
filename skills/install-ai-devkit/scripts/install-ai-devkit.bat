@echo off
rem ============================================================================
rem install-ai-devkit.bat - One-shot install of the AI dev toolkit:
rem   task (go-task/task) + opencode + oh-my-pi (omp) + pi
rem All tools are pulled from official GitHub releases (pi via its official
rem npm package) into %USERPROFILE%\.local\bin and added to user PATH.
rem Override install dir with:  set INSTALL_DIR=...
rem Requires Windows 10 1803+ (built-in curl.exe and tar.exe).
rem ============================================================================
setlocal EnableExtensions

if defined INSTALL_DIR (set "DIR=%INSTALL_DIR%") else (set "DIR=%USERPROFILE%\.local\bin")
set "INSTALL_DIR=%DIR%"

echo ==============================================
echo   AI dev toolkit installer (install-ai-devkit)
echo   Install dir: %DIR%
echo ==============================================

echo.
echo ==^> [1/4] Installing task (go-task/task)
call "%~dp0install-task.bat"
if errorlevel 1 exit /b 1

echo.
echo ==^> [2/4] Installing opencode
call "%~dp0install-opencode.bat"
if errorlevel 1 exit /b 1

echo.
echo ==^> [3/4] Installing oh-my-pi (omp)
call "%~dp0install-omp.bat"
if errorlevel 1 exit /b 1

echo.
echo ==^> [4/4] Installing pi
call "%~dp0install-pi.bat"
if errorlevel 1 exit /b 1

echo.
echo ==============================================
echo [OK] Toolkit installed: task / opencode / omp / pi
echo   - Provider setup (deepseek / ollama / aliyun qwen /
echo     custom) and skill installation: ask AI to follow the
echo     SKILL.md workflow of this skill.
echo ==============================================
endlocal
