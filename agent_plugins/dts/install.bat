@echo off
rem dts opencode plugin installer (Windows) - invokes install.ps1
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0install.ps1"
if errorlevel 1 exit /b 1
