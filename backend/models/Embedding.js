const mongoose = require('mongoose');

const embeddingSchema = new mongoose.Schema({
  documentId: { type: String, required: true, unique: true },
  category: { type: String, index: true },
  crop: { type: String, index: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  tags: [String],
  embedding: { type: [Number], required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Embedding', embeddingSchema);
