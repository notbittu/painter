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

// Find the build directory
let buildPath = path.join(__dirname, 'client/build');
let indexHtmlPath = path.join(buildPath, 'index.html');

// If direct path doesn't exist, try searching for it
if (!fs.existsSync(indexHtmlPath)) {
  console.log('client/build/index.html not found at the expected location, searching...');
  
  // Try client/build
  if (fs.existsSync('client') && fs.existsSync(path.join('client', 'build'))) {
    buildPath = path.join(process.cwd(), 'client/build');
    indexHtmlPath = path.join(buildPath, 'index.html');
    console.log('Found build at:', buildPath);
  } 
  // Try build
  else if (fs.existsSync('build')) {
    buildPath = path.join(process.cwd(), 'build');
    indexHtmlPath = path.join(buildPath, 'index.html');
    console.log('Found build at:', buildPath);
  }
  // Try client
  else if (fs.existsSync('client')) {
    const clientPath = path.join(process.cwd(), 'client');
    const clientDirs = fs.readdirSync(clientPath);
    console.log('Contents of client directory:', clientDirs);
    
    if (clientDirs.includes('build')) {
      buildPath = path.join(clientPath, 'build');
      indexHtmlPath = path.join(buildPath, 'index.html');
      console.log('Found build in client directory:', buildPath);
    }
  }
}

// Check if we found the build directory
if (fs.existsSync(indexHtmlPath)) {
  console.log('Found index.html at:', indexHtmlPath);
} else {
  console.error('Could not find index.html in any location!');
  console.log('Current structure:');
  try {
    const cwd = process.cwd();
    console.log('Working directory:', cwd);
    const dirs = fs.readdirSync(cwd);
    console.log('Top level directories:', dirs);
    
    if (dirs.includes('client')) {
      const clientContents = fs.readdirSync(path.join(cwd, 'client'));
      console.log('Client directory contents:', clientContents);
    }
  } catch (err) {
    console.error('Error examining directories:', err);
  }
}

// Serve static files from the React app
app.use(express.static(buildPath));

// Handle React routing, return all requests to React app
app.get('*', function(req, res) {
  if (fs.existsSync(indexHtmlPath)) {
    res.sendFile(indexHtmlPath);
  } else {
    res.status(500).send('React build not found. Please check server logs.');
  }
});

const port = process.env.PORT || 10000;
app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on port ${port}`);
}); 