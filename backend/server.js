const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');
const mongoose = require('mongoose');

const authRoutes = require('./routes/auth');
const { protect } = require('./middleware/authMiddleware');
const Query = require('./models/Query');

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

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch((err) => console.error('❌ MongoDB Error:', err.message));

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'QueryGen AI Backend is running!', status: 'success' });
});

// Auth routes
app.use('/api/auth', authRoutes);

// Generate SQL (protected)
app.post('/api/generate-sql', protect, async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ success: false, error: 'Query is required' });
    }

    const aiResponse = await axios.post(`${AI_SERVICE_URL}/api/text-to-sql`, {
      query: query,
      database_schema: "users(id, name, email, city, age)"
    });

    const generatedSQL = aiResponse.data.generated_sql;

    // Save to MongoDB
    await Query.create({
      userId: req.user.id,
      naturalLanguageQuery: query,
      generatedSQL: generatedSQL,
      modelUsed: aiResponse.data.model_used
    });

    res.json({
  success: true,
  naturalLanguageQuery: query,
  generatedSQL: aiResponse.data.generated_sql,
  modelUsed: aiResponse.data.model_used,
  keywords: aiResponse.data.keywords,
  similarQueries: aiResponse.data.similar_queries,
  queryResults: aiResponse.data.query_results,
  timestamp: new Date().toISOString()
});

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      return res.status(500).json({ success: false, error: `AI Service Error: ${error.response.data.detail || error.message}` });
    } else if (error.request) {
      return res.status(503).json({ success: false, error: 'AI service not available.' });
    } else {
      return res.status(500).json({ success: false, error: error.message });
    }
  }
});

// Get query history (protected)
app.get('/api/history', protect, async (req, res) => {
  try {
    const queries = await Query.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(20);
    res.json({ success: true, queries });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});