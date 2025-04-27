// This file ensures we use app.py for web service
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'static/client/build')));

// The "catchall" handler: for any request not matched above, send the React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'static/client/build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 