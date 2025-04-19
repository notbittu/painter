const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

// Print debugging information
console.log('Current directory:', process.cwd());
console.log('Directory contents:');
try {
  const files = fs.readdirSync('.');
  console.log(files);
} catch (err) {
  console.error('Error reading directory:', err);
}

// Try to find the build directory
console.log('Looking for build directory...');

// Check static directory path
const staticBuildPath = path.join(__dirname, 'static/client/build');
if (fs.existsSync(staticBuildPath) && fs.existsSync(path.join(staticBuildPath, 'index.html'))) {
  console.log('Found build at static/client/build');
  
  // Serve static files from the static/client/build directory
  app.use(express.static(staticBuildPath));
  
  // Handle React routing, return all requests to React app
  app.get('*', function(req, res) {
    res.sendFile(path.join(staticBuildPath, 'index.html'));
  });
} 
// Fallback to client/build
else if (fs.existsSync(path.join(__dirname, 'client/build/index.html'))) {
  console.log('Falling back to client/build');
  
  const clientBuildPath = path.join(__dirname, 'client/build');
  
  // Serve static files from the client/build directory
  app.use(express.static(clientBuildPath));
  
  // Handle React routing, return all requests to React app
  app.get('*', function(req, res) {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
}
// Error if no build found
else {
  console.error('ERROR: No build directory found');
  
  // Print directory structure for debugging
  console.log('Directory structure:');
  function listDirRecursive(dir, level = 0) {
    const indent = ' '.repeat(level * 2);
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stats = fs.statSync(fullPath);
      
      console.log(`${indent}- ${item}${stats.isDirectory() ? '/' : ''}`);
      
      if (stats.isDirectory() && level < 2) {
        listDirRecursive(fullPath, level + 1);
      }
    }
  }
  
  try {
    listDirRecursive(__dirname);
  } catch (err) {
    console.error('Error listing directory structure:', err);
  }
  
  // Setup a simple error page
  app.use(express.static(path.join(__dirname, 'public')));
  app.get('*', function(req, res) {
    res.status(500).send('Build not found. Please check the server logs.');
  });
}

const port = process.env.PORT || 10000;
app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on port ${port}`);
}); 