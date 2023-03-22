@echo off
python --version >nul 2>&1 || (
    echo Python is not installed. Please install Python from https://www.python.org/downloads/ and add it to your PATH.
    exit /b 1
)
call npm --version >nul 2>&1 || (
    echo Node.js is not installed. Please install Node.js from https://nodejs.org/en/download/ and add it to your PATH.
    exit /b 1
)

echo Starting servers...
call python run.py