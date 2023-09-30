@echo off
.\env\bin\python3 --version >nul 2>&1 || (
    echo Python3.10 virtual environment is not installed. Please install the application from install.sh
    exit /b 1
)
call npm --version >nul 2>&1 || (
    echo Node.js is not installed. Please install Node.js from https://nodejs.org/en/download/ and add it to your PATH.
    exit /b 1
)

echo Starting servers...
call .\env\bin\python3 run.py