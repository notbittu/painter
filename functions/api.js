const express = require('express');
const serverless = require('serverless-http');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const app = express();

// Enable CORS for all routes
app.use(cors());

// Import Flask app functionality
const {
  detectColors,
  generatePreview,
  colorMatches
} = require('../api-handlers');

// API endpoints
app.get('/.netlify/functions/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'API is running properly',
    time: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Color detection endpoint
app.post('/.netlify/functions/api/detect-colors', async (req, res) => {
  try {
    const result = await detectColors(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate preview endpoint
app.post('/.netlify/functions/api/generate-preview', async (req, res) => {
  try {
    const result = await generatePreview(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Color matches endpoint
app.post('/.netlify/functions/api/color-matches', async (req, res) => {
  try {
    const result = await colorMatches(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Handle all other API routes
app.all('/.netlify/functions/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Export the serverless function
module.exports.handler = serverless(app); 