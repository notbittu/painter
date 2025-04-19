const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');

// Basic status endpoint
app.get('/api/status', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Serve static files if they exist
if (fs.existsSync(path.join(__dirname, 'build'))) {
  app.use(express.static(path.join(__dirname, 'build')));
  
  // Handle React routing
  app.get('*', function(req, res) {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });
} else {
  // Fallback route
  app.get('/', (req, res) => {
    res.send('Painter API is running. Static files not found.');
  });
}

const port = process.env.PORT || 10000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 