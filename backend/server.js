// Import required packages
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors()); // Allow frontend to connect
app.use(express.json()); // Parse JSON request bodies

// Basic test route
app.get('/', (req, res) => {
  res.json({ 
    message: 'QueryGen AI Backend is running!',
    status: 'success' 
  });
});

// Text-to-SQL endpoint (mock for now)
app.post('/api/generate-sql', (req, res) => {
  const { query } = req.body;
  
  // Mock response - we'll connect to AI service later
  const mockSQL = `SELECT * FROM users WHERE condition LIKE '%${query}%';`;
  
  res.json({
    success: true,
    naturalLanguageQuery: query,
    generatedSQL: mockSQL,
    timestamp: new Date()
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Backend server running on http://localhost:${PORT}`);
});