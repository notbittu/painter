#!/bin/bash

# Print environment information
echo "=== Environment Information ==="
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"
echo "Current directory: $(pwd)"
echo "=============================="

# Install dependencies and build
echo "Installing dependencies..."
cd client
npm install || {
    echo "Failed to install dependencies"
    exit 1
}

echo "Building React app..."
npm run build || {
    echo "Failed to build React app"
    exit 1
}

# Verify build directory exists
if [ ! -d "build" ]; then
    echo "React build directory not found"
    exit 1
fi

# Install serve globally
echo "Installing serve..."
npm install -g serve || {
    echo "Failed to install serve"
    exit 1
}

# Start the server
echo "Starting server..."
cd build
serve -s . -l 3000 