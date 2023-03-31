#!/bin/bash

echo "Checking if Python is installed..."
if ! command -v python &>/dev/null; then
    echo "ERROR: Python is not installed."
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
if ! command -v pip &>/dev/null; then
    echo "ERROR: Pip is not installed."
    echo "Please install pip from https://pip.pypa.io/en/stable/installation/ and add it to your PATH."
    exit 1
fi
echo "Pip is installed."

echo "Installing Node.js dependencies..."
rm -rf apps/browser-chat/node_modules/.vite || true
npm install -g pnpm
pnpm install
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install dependencies."
    exit 1
fi

echo "Installing Python dependencies..."
pip install -r apps/embeddings-apis/sentence-embedder/requirements.txt
pip install -r apps/embeddings-apis/similarity-search/requirements.txt
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install Python dependencies."
    exit 1
fi

echo "Generating .env file..."
python create_env.py
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to generate .env file."
    exit 1
fi

echo "All dependencies have been installed and .env file generated successfully."
