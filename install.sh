#!/bin/bash

echo "Checking if Node.js is installed..."
if ! command -v node &>/dev/null; then
    echo "ERROR: Node.js is not installed."
    echo "Please install Node.js from https://nodejs.org/en/download/ and add it to your PATH."
    exit 1
fi
echo "Node.js is installed."

echo "Installing Node.js dependencies..."

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

echo "Generating .env file..."
node create_env.js
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to generate .env file."
    exit 1
fi

echo "All dependencies have been installed and .env file generated successfully."
