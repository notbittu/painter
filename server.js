const http = require('http');
const port = process.env.PORT || 10000;

http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'application/json'});
  
  const responseData = {
    status: 'ok',
    message: 'Server is running with quality',
    time: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  };
  
  res.end(JSON.stringify(responseData, null, 2));
}).listen(port);

console.log(`Server running on port ${port}`);
console.log('Listening for incoming requests...');
