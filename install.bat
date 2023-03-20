@echo off
python --version >nul 2>&1 || (
    echo Python is not installed. Please install Python from https://www.python.org/downloads/ and add it to your PATH.
    exit /b 1
)
npm --version >nul 2>&1 || (
    echo Node.js is not installed. Please install Node.js from https://nodejs.org/en/download/ and add it to your PATH.
    exit /b 1
)
pip --version >nul 2>&1 || (
    echo Pip is not installed. Please install pip from https://pip.pypa.io/en/stable/installation/ and add it to your PATH.
    exit /b 1
)

echo Installing dependencies...
call pnpm install

echo Installing Python dependencies...
call pip install -r apps/embeddings-apis/sentence-embedder/requirements.txt
call pip install -r apps/embeddings-apis/similarity-search/requirements.txt

echo Generating .env file...
call python install.py
call python create_env.py
