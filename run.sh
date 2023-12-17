#!/bin/bash

if ! which node > /dev/null 2>&1 ; then
    echo "echo Node.js is not installed. Please install Node.js from https://nodejs.org/en/download/ and add it to your PATH."
    exit 1
fi

echo "Starting servers..."
pnpm start
