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

# Go back to the root
cd ..

# Create static directory structure
echo "Creating static directory structure..."
mkdir -p static/client/build

# Copy build files
echo "Copying build files..."
cp -r client/build/* static/client/build/

# Verify files were copied
echo "Verifying copied files..."
if [ -d "static/client/build" ]; then
  echo "static/client/build directory exists. Contents:"
  ls -la static/client/build
else
  echo "static/client/build directory not found!"
  exit 1
fi

echo "Build process completed successfully." 