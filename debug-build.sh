#!/bin/bash

# Print debugging info
echo "===== ENVIRONMENT DEBUGGING ====="
echo "Current directory: $(pwd)"
echo "Directory listing:"
ls -la
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"
echo "Build command from package.json:"
cat package.json | grep build
echo "==============================="

# Install dependencies
echo "===== INSTALLING DEPENDENCIES ====="
npm install
echo "==============================="

# Check client directory
echo "===== CLIENT DIRECTORY ====="
if [ -d "client" ]; then
  echo "Client directory exists"
  cd client
  echo "Client directory contents:"
  ls -la
  echo "Installing client dependencies..."
  npm install
  echo "Building React app..."
  npm run build
  if [ -d "build" ]; then
    echo "Client build directory exists"
    echo "Contents of client/build:"
    ls -la build
  else
    echo "ERROR: Client build directory not found"
  fi
  cd ..
else
  echo "ERROR: Client directory not found"
  exit 1
fi
echo "==============================="

# Create build directory
echo "===== CREATING BUILD DIRECTORY ====="
mkdir -p build
echo "Copying client build to root build directory..."
cp -r client/build/* build/
echo "Contents of build directory:"
ls -la build
echo "==============================="

# Check for static directory references in scripts
echo "===== CHECKING FOR STATIC DIRECTORY REFERENCES ====="
grep -r "static/client/build" --include="*.json" --include="*.js" --include="*.sh" .
echo "==============================="

echo "Build process completed." 