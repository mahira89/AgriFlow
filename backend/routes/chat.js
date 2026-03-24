const router = require('express').Router();
const ChatHistory = require('../models/ChatHistory');
const { generateGeminiResponse } = require('../utils/gemini');

// Knowledge base for rule-based fallback and context extraction
const knowledgeBase = {
  fertilizers: {
    wheat: 'For Wheat: Use DAP (50 kg/acre) at sowing time. After 20-25 days, apply Urea (40 kg/acre). For better yield, use Zinc Sulfate (10 kg/acre).',
    rice: 'For Rice: Apply DAP (50 kg/acre) and Potash (25 kg/acre) before transplanting. After 30 days, use Urea (40 kg/acre).',
    cotton: 'For Cotton: Use DAP (40 kg/acre) and Potash (20 kg/acre) at sowing. Apply Urea (30 kg/acre) after 30 and 60 days.',
    vegetables: 'For Vegetables: Use well-decomposed FYM (10 ton/acre) before planting. Apply NPK (50 kg/acre) as basal dose.',
    sugarcane: 'For Sugarcane: Apply DAP (60 kg/acre) and Potash (40 kg/acre) at planting. Use Urea (150 kg/acre) in splits.'
  },
  pestControl: {
    tomato: 'For Tomato: Common pests - Fruit borer, Aphids. Use Neem oil spray (5ml/liter) weekly. Install pheromone traps (5-6 per acre).',
    cotton: 'For Cotton: Watch for Pink bollworm, Aphids. Use pheromone traps (8-10 per acre). Spray Imidacloprid (0.5ml/liter) if needed.',
    paddy: 'For Paddy: Stem borer, Leaf folder common. Use Carbofuran (10 kg/acre) in nursery. Install light traps.',
    brinjal: 'For Brinjal: Fruit and shoot borer. Remove affected fruits. Spray Neem-based pesticides weekly.',
    chilli: 'For Chilli: Thrips, Mites common. Use Spinosad (0.3ml/liter) alternately with other pesticides.'
  },
  diseases: {
    wheat: { rust: 'Rust Disease: Orange/brown spots on leaves. Spray Mancozeb (2g/liter) or Propiconazole (1ml/liter).', smut: 'Smut Disease: Black powdery mass in grains. Use disease-free seeds. Treat seeds with Carbendazim (2g/kg).' },
    tomato: { blight: 'Early Blight: Dark spots on leaves. Remove affected leaves. Spray Chlorothalonil (2g/liter).', mosaic: 'Mosaic Virus: Yellow mottling on leaves. Control aphids. Remove infected plants.' }
  },
  organic: {
    compost: 'Compost Making: Mix green waste with dry waste. Add cow dung slurry. Turn every 15 days. Ready in 2-3 months.',
    pesticides: 'Organic Pesticides: Mix 5 liters cow urine + 5kg neem leaves + 5kg custard apple leaves. Boil 2 hours. Dilute 1:10 with water.',
    growth: 'Natural Growth Promoter: Soak 1kg gram flour in 10 liters water overnight. Add 1 liter buttermilk. Spray after 10 days.'
  },
  seasons: {
    kharif: 'Kharif Season (June-October): Crops - Rice, Cotton, Sugarcane, Maize, Groundnut. Sown with monsoon onset.',
    rabi: 'Rabi Season (October-March): Crops - Wheat, Gram, Mustard, Peas, Barley. Requires irrigation.',
    zaid: 'Zaid Season (April-June): Crops - Watermelon, Cucumber, Fodder. Short duration crops.'
  },
  irrigation: {
    wheat: 'Wheat: 4-5 irrigations at critical stages - Crown root initiation, Tillering, Jointing, Flowering, Dough stage.',
    rice: 'Rice: Maintain 5cm standing water during vegetative stage. Drain before harvesting.',
    vegetables: 'Vegetables: Regular irrigation needed. Drip irrigation saves water and increases yield.'
  }
};

// Helper functions
function findCropInQuestion(question) {
  const crops = ['wheat', 'rice', 'cotton', 'tomato', 'brinjal', 'chilli', 'sugarcane', 'maize', 'potato', 'onion', 'paddy'];
  const lowerQuestion = question.toLowerCase();
  for (let crop of crops) {
    if (lowerQuestion.includes(crop)) return crop;
  }
  return null;
}

function findDiseaseInQuestion(question) {
  const diseases = ['rust', 'smut', 'blight', 'mosaic', 'wilt', 'rot', 'spot', 'mildew'];
  const lowerQuestion = question.toLowerCase();
  for (let disease of diseases) {
    if (lowerQuestion.includes(disease)) return disease;
  }
  return null;
}

// Extract relevant context from knowledgeBase based on keywords
function extractKnowledgeBaseContext(message) {
  const lowerMsg = message.toLowerCase();
  const contextParts = [];
  const crop = findCropInQuestion(lowerMsg);
  const disease = findDiseaseInQuestion(lowerMsg);

  if (lowerMsg.match(/fertilizer|khad|urea|dap|nutrient/)) {
    if (crop && knowledgeBase.fertilizers[crop]) {
      contextParts.push(knowledgeBase.fertilizers[crop]);
    } else {
      contextParts.push(Object.values(knowledgeBase.fertilizers).join('\n'));
    }
  }

  if (lowerMsg.match(/pest|keeda|insect|bug|worm/)) {
    if (crop && knowledgeBase.pestControl[crop]) {
      contextParts.push(knowledgeBase.pestControl[crop]);
    }
  }

  if (lowerMsg.match(/disease|rog|symptom|infection|fungus/)) {
    if (crop && disease && knowledgeBase.diseases[crop]?.[disease]) {
      contextParts.push(knowledgeBase.diseases[crop][disease]);
    } else if (crop && knowledgeBase.diseases[crop]) {
      contextParts.push(Object.values(knowledgeBase.diseases[crop]).join('\n'));
    }
  }

  if (lowerMsg.match(/organic|natural|compost|bio/)) {
    contextParts.push(Object.values(knowledgeBase.organic).join('\n'));
  }

  if (lowerMsg.match(/season|kharif|rabi|zaid|when to sow/)) {
    contextParts.push(Object.values(knowledgeBase.seasons).join('\n'));
  }

  if (lowerMsg.match(/irrigation|water|paani|drip|sprinkler/)) {
    if (crop && knowledgeBase.irrigation[crop]) {
      contextParts.push(knowledgeBase.irrigation[crop]);
    } else {
      contextParts.push(Object.values(knowledgeBase.irrigation).join('\n'));
    }
  }

  return contextParts.join('\n\n');
}

// Rule-based fallback response
function generateFallbackResponse(message) {
  const lowerMsg = message.toLowerCase();

  if (lowerMsg.match(/\b(hi|hello|hey|namaste|namaskar)\b/)) {
    const greetings = [
      '🌾 Hello! I am AgriFlow, your farming assistant. How can I help you today?',
      '🌱 Namaste! Ask me anything about farming, crops, or agriculture.',
      '👨‍🌾 Welcome! I can help with fertilizers, pests, diseases, and more.'
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  if (lowerMsg.includes('thank')) return '🙏 You\'re welcome! Happy farming! Feel free to ask more questions.';
  if (lowerMsg.includes('bye') || lowerMsg.includes('goodbye')) return '👋 Goodbye! Visit again for farming advice. Have a great harvest!';

  const crop = findCropInQuestion(lowerMsg);

  if (lowerMsg.match(/fertilizer|khad|urea|dap/) && crop && knowledgeBase.fertilizers[crop]) {
    return knowledgeBase.fertilizers[crop];
  }
  if (lowerMsg.match(/pest|keeda|insect/) && crop && knowledgeBase.pestControl[crop]) {
    return knowledgeBase.pestControl[crop];
  }
  if (lowerMsg.match(/irrigation|water|paani/) && crop && knowledgeBase.irrigation[crop]) {
    return knowledgeBase.irrigation[crop];
  }

  return "I can help you with:\n🌾 Crop-specific advice (fertilizers, pests, diseases)\n🌱 Organic farming techniques\n📊 Market prices and tips\n⛅ Weather-based recommendations\n💧 Irrigation scheduling\n🌿 Pest and disease management\n\nPlease ask me specific questions about any crop or farming practice!";
}

// Smart response: tries Gemini + RAG first, falls back to rules
async function generateSmartResponse(message) {
  if (!process.env.GEMINI_API_KEY) {
    console.log('⚠️ No Gemini API key, using rule-based response');
    return generateFallbackResponse(message);
  }

  try {
    // Extract context from knowledgeBase
    let context = extractKnowledgeBaseContext(message);

    // Try RAG if available (will be added in Phase 3)
    try {
      const { findRelevantDocuments } = require('../utils/embeddings');
      const relevantDocs = await findRelevantDocuments(message, 3);
      if (relevantDocs.length > 0) {
        const ragContext = relevantDocs.map(doc =>
          `[${doc.category}] ${doc.title}:\n${doc.content}`
        ).join('\n\n');
        context = ragContext + (context ? '\n\n---\n\n' + context : '');
      }
    } catch (ragError) {
      // RAG not available yet or failed - continue with knowledgeBase context
    }

    // Try weather context if relevant
    if (message.toLowerCase().match(/weather|mausam|rain|barish|temperature|forecast/)) {
      try {
        const axios = require('axios');
        const weatherRes = await axios.get(`http://localhost:${process.env.PORT || 5000}/api/weather?city=Delhi`);
        const w = weatherRes.data.current;
        context += `\n\nCurrent Weather in Delhi: ${w.main.temp}°C, ${w.weather[0].description}, Humidity: ${w.main.humidity}%, Wind: ${w.wind.speed} m/s`;
        if (weatherRes.data.recommendations) {
          context += `\nFarming Recommendations: ${weatherRes.data.recommendations.join('. ')}`;
        }
      } catch (e) {
        // Weather unavailable, continue without
      }
    }

    const response = await generateGeminiResponse(message, context);
    return response;
  } catch (error) {
    console.error('❌ Gemini error, falling back to rules:', error.message);
    return generateFallbackResponse(message);
  }
}

// Chat endpoint
router.post('/message', async (req, res) => {
  try {
    const { message, userId } = req.body;

    console.log('📨 Received message:', message);

    const response = await generateSmartResponse(message);

    // Save to database if userId provided
    if (userId && userId !== 'guest') {
      try {
        let chatHistory = await ChatHistory.findOne({ userId });

        if (!chatHistory) {
          chatHistory = new ChatHistory({ userId, messages: [] });
        }

        chatHistory.messages.push(
          { sender: 'user', message: message },
          { sender: 'bot', message: response }
        );

        if (chatHistory.messages.length > 50) {
          chatHistory.messages = chatHistory.messages.slice(-50);
        }

        await chatHistory.save();
        console.log('💾 Chat saved to database');
      } catch (dbError) {
        console.log('⚠️ Database error:', dbError.message);
      }
    }

    res.json({
      response,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({
      error: 'Internal server error',
      response: 'Sorry, I encountered an error. Please try again.'
    });
  }
});

// Get chat history
router.get('/history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    if (userId === 'guest') return res.json({ messages: [] });

    const chatHistory = await ChatHistory.findOne({ userId });
    if (!chatHistory) return res.json({ messages: [] });

    res.json({ messages: chatHistory.messages });
  } catch (error) {
    console.error('❌ Error fetching history:', error);
    res.status(500).json({ error: error.message });
  }
});

// Clear chat history
router.delete('/history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    if (userId === 'guest') return res.json({ message: 'Guest history not stored' });

    await ChatHistory.findOneAndDelete({ userId });
    res.json({ message: 'Chat history cleared' });
  } catch (error) {
    console.error('❌ Error clearing history:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
