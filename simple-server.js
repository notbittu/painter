const http = require('http');
const port = process.env.PORT || 10000;

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  
  const responseData = {
    status: 'ok',
    message: 'Simple server is running',
    time: new Date().toISOString(),
    endpoint: req.url
  };
  
  res.end(JSON.stringify(responseData, null, 2));
});

server.listen(port, () => {
  console.log(`Server running at port ${port}`);
}); 