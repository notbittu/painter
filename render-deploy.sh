#!/bin/bash
set -e

# Print debugging info
echo "Starting deployment process..."
echo "Current directory: $(pwd)"
echo "Directory listing:"
ls -la

# Install Python dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt

# Change to client directory
echo "Changing to client directory..."
cd client

# Install client dependencies
echo "Installing client dependencies..."
npm install

# Build the React app with ESLint checks disabled
echo "Building React app with ESLint checks disabled..."
export CI=false
export DISABLE_ESLINT_PLUGIN=true
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
echo "Creating static directory structure..."
mkdir -p static/client

# Copy the build files
echo "Copying build files..."
cp -r client/build static/client/

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

echo "Deployment preparation completed successfully." 