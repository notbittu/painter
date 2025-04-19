#!/bin/bash

# Print debugging info
echo "Current directory: $(pwd)"
echo "Directory listing:"
ls -la

# Install root dependencies
echo "Installing root dependencies..."
npm install

# Change to client directory
echo "Changing to client directory..."
cd client

# Install client dependencies
echo "Installing client dependencies..."
npm install

# Build the React app
echo "Building React app..."
npm run build

# Check if build succeeded
if [ ! -d "build" ]; then
  echo "Error: build directory not found"
  exit 1
fi

echo "Build directory contents:"
ls -la build

# Go back to root
echo "Going back to root directory..."
cd ..

# Create the static directory
echo "Creating static directory..."
mkdir -p static/client/build

# Copy the build files
echo "Copying build files..."
cp -r client/build/* static/client/build/

# Verify the static directory
echo "Verifying static directory..."
if [ -d "static/client/build" ]; then
  echo "Static directory created successfully."
  echo "Contents of static/client/build:"
  ls -la static/client/build
else
  echo "Failed to create static directory."
  exit 1
fi

echo "Build completed successfully." 