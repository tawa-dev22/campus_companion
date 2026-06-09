@echo off
title Campus Companion Launcher
cls
echo =======================================================================
echo                  CAMPUS COMPANION APPLICATION LAUNCHER
echo =======================================================================
echo.
echo Please select how you want to run the application:
echo.
echo [1] Run using Docker (Recommended - No local Node.js or MongoDB needed)
echo [2] Run locally (Requires Node.js and MongoDB installed on this PC)
echo [3] Install/Reinstall all dependencies (Run this first if using Option 2)
echo [4] Exit
echo.
set /p opt="Enter choice (1-4): "

if "%opt%"=="1" goto docker_run
if "%opt%"=="2" goto local_run
if "%opt%"=="3" goto install_deps
if "%opt%"=="4" goto end

:docker_run
echo.
echo Starting Docker containers...
docker-compose up --build
goto end

:local_run
echo.
echo Launching backend and frontend concurrently...
npm run dev
goto end

:install_deps
echo.
echo Installing dependencies for root, backend, and frontend...
call npm run install-all
echo.
echo Installation complete!
pause
goto start

:end
echo.
echo Goodbye!
pause
