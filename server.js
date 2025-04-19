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

// Check if client/build exists
console.log('Checking client/build directory:');
try {
  const buildPath = path.join(__dirname, 'client/build');
  if (fs.existsSync(buildPath)) {
    console.log('client/build directory exists. Contents:');
    const buildFiles = fs.readdirSync(buildPath);
    console.log(buildFiles);
  } else {
    console.log('client/build directory does not exist!');
  }
} catch (err) {
  console.error('Error checking client/build:', err);
}

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'client/build')));

// Handle React routing, return all requests to React app
app.get('*', function(req, res) {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

const port = process.env.PORT || 10000;
app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on port ${port}`);
}); 