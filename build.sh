#!/bin/bash

# Create the static directory structure first
mkdir -p static/client/build

# Install dependencies and build
cd client
npm install
npm run build

# Copy the build files to the static directory
cd ..
echo "Copying build files..."
cp -r client/build/* static/client/build/ || {
    echo "Failed to copy build files"
    exit 1
}

# Verify the files were copied
if [ -f "static/client/build/index.html" ]; then
    echo "Build files copied successfully"
else
    echo "Build files not found in static directory"
    exit 1
fi

# Install serve globally
npm install -g serve

# Start the server
echo "Starting server..."
serve -s static/client/build -l 3000 