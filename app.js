// This file ensures we use app.py for web service
const { spawn } = require('child_process');
const fs = require('fs');

// Check if Python and app.py exists
if (fs.existsSync('./app.py')) {
  console.log('Starting Python Flask application...');
  
  // Start the Python process
  const pythonProcess = spawn('python', ['app.py']);
  
  pythonProcess.stdout.on('data', (data) => {
    console.log(`Python output: ${data}`);
  });
  
  pythonProcess.stderr.on('data', (data) => {
    console.error(`Python error: ${data}`);
  });
  
  pythonProcess.on('close', (code) => {
    console.log(`Python process exited with code ${code}`);
    process.exit(code);
  });
} else {
  console.error('app.py not found! Make sure it exists in the root directory.');
  process.exit(1);
} 