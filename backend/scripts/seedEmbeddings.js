require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const mongoose = require('mongoose');
const Embedding = require('../models/Embedding');
const { generateEmbedding } = require('../utils/embeddings');
const dataset = require('../data/agricultural-dataset.json');

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  await Embedding.deleteMany({});
  console.log('Cleared existing embeddings');

  let successCount = 0;
  for (let i = 0; i < dataset.length; i++) {
    const item = dataset[i];
    console.log(`[${i + 1}/${dataset.length}] Embedding: ${item.title}`);

    try {
      const textToEmbed = `${item.title}. ${item.content}. Tags: ${item.tags.join(', ')}`;
      const embedding = await generateEmbedding(textToEmbed);

      await Embedding.create({
        documentId: item.id,
        category: item.category,
        crop: item.crop || 'general',
        title: item.title,
        content: item.content,
        tags: item.tags,
        embedding: embedding
      });

      successCount++;

      // Rate limiting for Gemini free tier
      if (i < dataset.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
    } catch (err) {
      console.error(`  Failed: ${err.message}`);
    }
  }

  console.log(`\nDone! Seeded ${successCount}/${dataset.length} embeddings.`);
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
