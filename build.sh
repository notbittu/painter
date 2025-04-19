#!/bin/bash

# Print debugging information
echo "Current directory: $(pwd)"
echo "Directory contents:"
ls -la

# Install dependencies in the client folder
cd client
echo "Installing client dependencies..."
npm install

# Build the React app
echo "Building React app..."
npm run build

# Verify build was created
echo "Checking build directory..."
if [ -d "build" ]; then
  echo "Build directory exists. Contents:"
  ls -la build
else
  echo "Build directory not found!"
  exit 1
fi

echo "Build process completed successfully." 