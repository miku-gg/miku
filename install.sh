#!/bin/bash

echo "Checking if Python is installed..."
if ! command -v python3.10 &>/dev/null; then
    echo "ERROR: Python 3.10 is not installed."
    echo "Please install Python from https://www.python.org/downloads/ and add it to your PATH."
    exit 1
fi
echo "Python is installed."

echo "Checking if Node.js is installed..."
if ! command -v node &>/dev/null; then
    echo "ERROR: Node.js is not installed."
    echo "Please install Node.js from https://nodejs.org/en/download/ and add it to your PATH."
    exit 1
fi
echo "Node.js is installed."

echo "Checking if Pip is installed..."
if ! command -v pip3 &>/dev/null; then
    echo "ERROR: Pip is not installed."
    echo "Please install pip from https://pip.pypa.io/en/stable/installation/ and add it to your PATH."
    exit 1
fi
echo "Pip is installed."

echo "Installing Node.js dependencies..."
rm -rf apps/browser-chat/node_modules/.vite || true

if [[ "$OSTYPE" == "darwin"* ]]; then
    if ! command -v brew &>/dev/null; then
        echo "ERROR: Homebrew is not installed."
        echo "Please install Homebrew from https://brew.sh/ and try again."
        exit 1
    fi
    brew install pnpm
else
    npm install -g pnpm
fi

pnpm install
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install dependencies."
    exit 1
fi

echo "Creating virtual environment..."
python3.10 -m venv env
echo "Activating virtual environment..."
source env/bin/activate

echo "Installing Python dependencies..."
pip3 install -r apps/embeddings-apis/sentence-embedder/requirements.txt
pip3 install -r apps/embeddings-apis/similarity-search/requirements.txt
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install Python dependencies."
    exit 1
fi

echo "Generating .env file..."
python3 create_env.py
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to generate .env file."
    exit 1
fi

echo "All dependencies have been installed and .env file generated successfully."
