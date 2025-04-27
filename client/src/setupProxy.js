const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Determine the API URL - use environment variable in production
  // or default to localhost in development
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';
  
  app.use(
    '/api',
    createProxyMiddleware({
      target: apiUrl,
      changeOrigin: true,
      pathRewrite: {
        '^/api': '/api', // no rewrite needed if the paths match
      },
      // Log all API calls during development
      ...(process.env.NODE_ENV === 'development' && {
        logLevel: 'debug',
        onProxyReq: (proxyReq, req, res) => {
          console.log(`Proxying request to: ${apiUrl}${proxyReq.path}`);
        },
      }),
    })
  );
}; 