// server.js
// Express server for Lab 1: Node.js and Express server
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware for parsing JSON (good practice)
app.use(express.json());

// 1. GET / - Welcome text message
app.get('/', (req, res) => {
  res.status(200).send('Welcome to the Node.js and Express Server - Lab 1!');
});

// 2. GET /about - Returns JSON object with student details
app.get('/about', (req, res) => {
  res.status(200).json({
    name: 'Vankadari Roopesh',
    section: 'Learning Group 7',
    registrationNumber: '252U1R1249'
  });
});

// 3. GET /time - Returns the current date and time using new Date()
app.get('/time', (req, res) => {
  const now = new Date();
  res.status(200).json({
    currentTime: now.toISOString(),
    dateTimeString: now.toString(),
    timestamp: now.getTime()
  });
});

// 4. Catch-all route for any unknown path (returns 404 status code and message)
app.use((req, res) => {
  res.status(404).send(`404 Not Found: Cannot ${req.method} ${req.originalUrl}`);
});

// Start the Express server
app.listen(PORT, () => {
  console.log(`Express server is running on http://localhost:${PORT}`);
});
