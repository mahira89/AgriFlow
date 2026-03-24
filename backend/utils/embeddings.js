const { genAI } = require('./gemini');
const Embedding = require('../models/Embedding');

async function generateEmbedding(text) {
  const model = genAI.getGenerativeModel({ model: 'gemini-embedding-001' });
  const result = await model.embedContent(text);
  return result.embedding.values;
}

function cosineSimilarity(vecA, vecB) {
  let dotProduct = 0, normA = 0, normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

async function findRelevantDocuments(query, topK = 3) {
  const queryEmbedding = await generateEmbedding(query);
  const allDocs = await Embedding.find({}, { embedding: 1, content: 1, title: 1, category: 1 });

  if (allDocs.length === 0) return [];

  const scored = allDocs.map(doc => ({
    title: doc.title,
    content: doc.content,
    category: doc.category,
    score: cosineSimilarity(queryEmbedding, doc.embedding)
  }));

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK).filter(doc => doc.score > 0.3);
}

module.exports = { generateEmbedding, findRelevantDocuments, cosineSimilarity };
