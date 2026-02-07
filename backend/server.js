const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');

dotenv.config();

const app = express();

// CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger
app.use((req, res, next) => {
  console.log(`\n📨 ${req.method} ${req.path}`);
  next();
});

// AI Service URL
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

// Routes
app.get('/', (req, res) => {
  console.log('✅ Base route hit');
  res.json({ 
    message: 'QueryGen AI Backend is running!',
    status: 'success',
    services: {
      frontend: 'http://localhost:5173',
      backend: 'http://localhost:5000',
      ai_service: AI_SERVICE_URL
    }
  });
});

// Main endpoint - now calls AI service
app.post('/api/generate-sql', async (req, res) => {
  try {
    console.log('✅ SQL endpoint hit');
    console.log('Query received:', req.body.query);
    
    const { query } = req.body;
    
    if (!query) {
      console.log('❌ No query in request');
      return res.status(400).json({
        success: false,
        error: 'Query is required'
      });
    }
    
    console.log('🤖 Calling AI service...');
    
    // Call FastAPI AI service
    const aiResponse = await axios.post(`${AI_SERVICE_URL}/api/text-to-sql`, {
      query: query,
      database_schema: "users(id, name, email, city, age)"
    });
    
    console.log('✅ AI Response received:', aiResponse.data.generated_sql);
    
    // Return to frontend
    res.json({
      success: true,
      naturalLanguageQuery: query,
      generatedSQL: aiResponse.data.generated_sql,
      modelUsed: aiResponse.data.model_used,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.response) {
      // AI service returned error
      return res.status(500).json({
        success: false,
        error: `AI Service Error: ${error.response.data.detail || error.message}`
      });
    } else if (error.request) {
      // AI service not reachable
      return res.status(503).json({
        success: false,
        error: 'AI service is not available. Make sure FastAPI is running on port 8000.'
      });
    } else {
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
});

// 404 handler
app.use((req, res) => {
  console.log('❌ 404 - Route not found:', req.path);
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err);
  res.status(500).json({
    success: false,
    error: err.message
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════╗
║  🚀 QueryGen AI Backend               ║
║  📍 http://localhost:${PORT}            ║
║  🤖 AI Service: ${AI_SERVICE_URL}    ║
║  ✅ Status: Running                    ║
╚═══════════════════════════════════════╝
  `);
});