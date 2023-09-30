@echo off
echo Checking if Python is installed...
python3.10 --version >nul 2>&1 || (
    echo ERROR: Python 3.10 is not installed.
    echo Please install Python from https://www.python.org/downloads/ and add it to your PATH.
    echo Press any key to exit.
    pause >nul
    exit /b 1
)
echo Python is installed.

echo Checking if Node.js is installed...
call npm --version >nul 2>&1 || (
    echo ERROR: Node.js is not installed.
    echo Please install Node.js from https://nodejs.org/en/download/ and add it to your PATH.
    echo Press any key to exit.
    pause >nul
    exit /b 1
)
echo Node.js is installed.

echo Checking if Pip is installed...
pip --version >nul 2>&1 || (
    echo ERROR: Pip is not installed.
    echo Please install pip from https://pip.pypa.io/en/stable/installation/ and add it to your PATH.
    echo Press any key to exit.
    pause >nul
    exit /b 1
)
echo Pip is installed.

echo Installing Node.js dependencies...
del /q/s apps\browser-chat\node_modules\.vite > nul 2>&1 || exit
call npm install -g pnpm 0
call pnpm install
if errorlevel 1 (
    echo ERROR: Failed to install dependencies.
    echo Press any key to exit.
    pause >nul
    exit /b 1
)

echo Creating python virtual environment...
call python3.10 -m venv env
echo Activating python virtual environment...
call .\env\Scripts\activate

echo Installing Python dependencies...
call pip install -r apps/embeddings-apis/sentence-embedder/requirements.txt
call pip install -r apps/embeddings-apis/similarity-search/requirements.txt
if errorlevel 1 (
    echo ERROR: Failed to install Python dependencies.
    echo Press any key to exit.
    pause >nul
    exit /b 1
)

echo Generating .env file...
call python create_env.py
if errorlevel 1 (
    echo ERROR: Failed to generate .env file.
    echo Press any key to exit.
    pause >nul
    exit /b 1
)

echo All dependencies have been installed and .env file generated successfully.
echo Press any key to exit.
pause >nul
