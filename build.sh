#!/bin/bash

# Print environment information
echo "=== Environment Information ==="
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"
echo "Current directory: $(pwd)"
echo "=============================="

# Create the static directory structure first
echo "Creating static directory structure..."
mkdir -p static/client/build || {
    echo "Failed to create static directory"
    exit 1
}

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

# Copy the build files to the static directory
echo "Copying build files..."
cd ..
cp -r client/build/* static/client/build/ || {
    echo "Failed to copy build files"
    exit 1
}

# Verify the files were copied
echo "Verifying build files..."
if [ -f "static/client/build/index.html" ]; then
    echo "Build files copied successfully"
    echo "Contents of static directory:"
    ls -la static/client/build/
else
    echo "Build files not found in static directory"
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
serve -s static/client/build -l 3000 