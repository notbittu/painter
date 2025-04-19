#!/bin/bash

# Install dependencies
cd client
npm install

# Build the React app
npm run build

# Create the static directory if it doesn't exist
cd ..
mkdir -p static/client/build

# Copy the build files to the static directory
cp -r client/build/* static/client/build/

# Install serve globally
npm install -g serve

# Start the server
serve -s static/client/build -l 3000 