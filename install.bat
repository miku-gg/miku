@echo off
echo Checking if Node.js is installed...
call npm --version >nul 2>&1 || (
    echo ERROR: Node.js is not installed.
    echo Please install Node.js from https://nodejs.org/en/download/ and add it to your PATH.
    echo Press any key to exit.
    pause >nul
    exit /b 1
)
echo Node.js is installed.

echo Installing Node.js dependencies...
rem /q/s apps\interactor\node_modules\.vite > nul 2>&1 || exit
call npm install -g pnpm 0
call pnpm install
if errorlevel 1 (
    echo ERROR: Failed to install dependencies.
    echo Press any key to exit.
    pause >nul
    exit /b 1
)

echo Generating .env file...
call node create_env.js
if errorlevel 1 (
    echo ERROR: Failed to generate .env file.
    echo Press any key to exit.
    pause >nul
    exit /b 1
)

echo All dependencies have been installed and .env file generated successfully.
echo Press any key to exit.
pause >nul
