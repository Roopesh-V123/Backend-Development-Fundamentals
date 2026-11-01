// server-http.js
// Plain HTTP server using Node.js built-in 'http' module
const http = require('http');

const PORT = 3000;

// Create HTTP server
const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.end('Hello');
});

// Start listening on port 3000
server.listen(PORT, () => {
  console.log(`HTTP Server running at http://localhost:${PORT}/`);
});
