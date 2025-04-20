#!/bin/bash

# Remove all problematic files
echo "Removing problematic files..."
if [ -f "Dockerfile" ]; then
  rm Dockerfile
  echo "Removed Dockerfile"
fi

if [ -f "render-build.sh" ]; then
  rm render-build.sh
  echo "Removed render-build.sh"
fi

if [ -f "debug-build.sh" ]; then
  rm debug-build.sh
  echo "Removed debug-build.sh"
fi

if [ -f "build.sh" ]; then
  rm build.sh
  echo "Removed build.sh"
fi

# Remove any static directory if it exists
if [ -d "static" ]; then
  rm -rf static
  echo "Removed static directory"
fi

echo "Repository cleaned of problematic files." 