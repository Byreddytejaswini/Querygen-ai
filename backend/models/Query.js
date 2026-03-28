const mongoose = require('mongoose');

const querySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  naturalLanguageQuery: { type: String, required: true },
  generatedSQL: { type: String, required: true },
  modelUsed: { type: String, default: 'llama-3.3-70b-versatile' },
  keywords: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Query', querySchema);