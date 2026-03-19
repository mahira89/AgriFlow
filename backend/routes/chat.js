const router = require('express').Router();
const ChatHistory = require('../models/ChatHistory');

// Knowledge base for responses
const knowledgeBase = {
  greetings: [
    '🌾 Hello! I am AgriFlow, your farming assistant. How can I help you today?',
    '🌱 Namaste! Kya aapko kheti ke baare mein koi sawaal hai?',
    '👨‍🌾 Welcome! Ask me anything about farming, crops, or pesticides.'
  ],

  fertilizers: {
    wheat: '🌾 For Wheat: Use DAP (50 kg/acre) at sowing time. After 20-25 days, apply Urea (40 kg/acre). For better yield, use Zinc Sulfate (10 kg/acre).',
    rice: '🌱 For Rice: Apply DAP (50 kg/acre) and Potash (25 kg/acre) before transplanting. After 30 days, use Urea (40 kg/acre).',
    cotton: '🧶 For Cotton: Use DAP (40 kg/acre) and Potash (20 kg/acre) at sowing. Apply Urea (30 kg/acre) after 30 and 60 days.',
    vegetables: '🥬 For Vegetables: Use well-decomposed FYM (10 ton/acre) before planting. Apply NPK (50 kg/acre) as basal dose.',
    sugarcane: '🎋 For Sugarcane: Apply DAP (60 kg/acre) and Potash (40 kg/acre) at planting. Use Urea (150 kg/acre) in splits.'
  },

  pestControl: {
    tomato: '🍅 For Tomato: Common pests - Fruit borer, Aphids. Use Neem oil spray (5ml/liter) weekly. Install pheromone traps (5-6 per acre).',
    cotton: '🧶 For Cotton: Watch for Pink bollworm, Aphids. Use pheromone traps (8-10 per acre). Spray Imidacloprid (0.5ml/liter) if needed.',
    paddy: '🌾 For Paddy: Stem borer, Leaf folder common. Use Carbofuran (10 kg/acre) in nursery. Install light traps.',
    brinjal: '🍆 For Brinjal: Fruit and shoot borer. Remove affected fruits. Spray Neem-based pesticides weekly.',
    chilli: '🌶️ For Chilli: Thrips, Mites common. Use Spinosad (0.3ml/liter) alternately with other pesticides.'
  },

  diseases: {
    wheat: {
      rust: '🌾 Rust Disease: Orange/brown spots on leaves. Spray Mancozeb (2g/liter) or Propiconazole (1ml/liter).',
      smut: '🌾 Smut Disease: Black powdery mass in grains. Use disease-free seeds. Treat seeds with Carbendazim (2g/kg).'
    },
    tomato: {
      blight: '🍅 Early Blight: Dark spots on leaves. Remove affected leaves. Spray Chlorothalonil (2g/liter).',
      mosaic: '🍅 Mosaic Virus: Yellow mottling on leaves. Control aphids. Remove infected plants.'
    }
  },

  organic: {
    compost: '🌱 Compost Making: Mix green waste (leaves, vegetable scraps) with dry waste (straw, paper). Add cow dung slurry. Turn every 15 days. Ready in 2-3 months.',
    pesticides: '🌿 Organic Pesticides: Mix 5 liters cow urine + 5kg neem leaves + 5kg custard apple leaves. Boil for 2 hours. Dilute 1:10 with water and spray.',
    growth: '🌱 Natural Growth Promoter: Soak 1kg gram flour in 10 liters water overnight. Add 1 liter buttermilk. Spray after 10 days.'
  },

  market: {
    general: '📊 For current market prices, please visit your nearest APMC mandi or check government agricultural portal. Prices vary by season and quality.',
    tips: '💡 Marketing Tips: Grade your produce properly. Check multiple mandis for better rates. Consider joining Farmer Producer Organizations (FPOs).'
  },

  weather: {
    general: '⛅ For accurate weather updates, check local weather forecast. Plan farming activities accordingly.',
    advice: '🌤️ Weather-Based Advice: Sow seeds when soil moisture is adequate. Provide irrigation during dry spells. Protect crops from heavy rain.'
  },

  seasons: {
    kharif: '🌧️ Kharif Season (June-October): Crops - Rice, Cotton, Sugarcane, Maize, Groundnut. Sown with monsoon onset.',
    rabi: '☀️ Rabi Season (October-March): Crops - Wheat, Gram, Mustard, Peas, Barley. Requires irrigation.',
    zaid: '🌞 Zaid Season (April-June): Crops - Watermelon, Cucumber, Fodder. Short duration crops.'
  },

  irrigation: {
    wheat: '🌾 Wheat: 4-5 irrigations at critical stages - Crown root initiation, Tillering, Jointing, Flowering, Dough stage.',
    rice: '🌱 Rice: Maintain 5cm standing water during vegetative stage. Drain before harvesting.',
    vegetables: '🥬 Vegetables: Regular irrigation needed. Drip irrigation saves water and increases yield.'
  },

  default: [
    "I can help you with:",
    "🌾 Crop-specific advice (fertilizers, pests, diseases)",
    "🌱 Organic farming techniques",
    "📊 Market prices and tips",
    "⛅ Weather-based recommendations",
    "💧 Irrigation scheduling",
    "🌿 Pest and disease management",
    "",
    "Please ask me specific questions about any crop or farming practice!"
  ]
};

// Helper function to find crop in question
function findCropInQuestion(question) {
  const crops = ['wheat', 'rice', 'cotton', 'tomato', 'brinjal', 'chilli', 'sugarcane', 'maize', 'potato', 'onion', 'paddy'];
  const lowerQuestion = question.toLowerCase();
  
  for (let crop of crops) {
    if (lowerQuestion.includes(crop)) {
      return crop;
    }
  }
  return null;
}

// Helper function to find disease in question
function findDiseaseInQuestion(question) {
  const diseases = ['rust', 'smut', 'blight', 'mosaic', 'wilt', 'rot', 'spot', 'mildew'];
  const lowerQuestion = question.toLowerCase();
  
  for (let disease of diseases) {
    if (lowerQuestion.includes(disease)) {
      return disease;
    }
  }
  return null;
}

// Generate response based on user message
function generateResponse(message) {
  const lowerMsg = message.toLowerCase();
  
  // Check for greetings
  if (lowerMsg.match(/\b(hi|hello|hey|namaste|namaskar)\b/)) {
    return knowledgeBase.greetings[Math.floor(Math.random() * knowledgeBase.greetings.length)];
  }

  // Check for fertilizers
  if (lowerMsg.includes('fertilizer') || lowerMsg.includes('khad') || lowerMsg.includes('urea') || lowerMsg.includes('dap')) {
    const crop = findCropInQuestion(lowerMsg);
    if (crop && knowledgeBase.fertilizers[crop]) {
      return knowledgeBase.fertilizers[crop];
    } else if (crop) {
      return `I'm still learning about fertilizers for ${crop}. Please ask about wheat, rice, cotton, vegetables, or sugarcane.`;
    }
    return "Which crop do you need fertilizer advice for? I can help with wheat, rice, cotton, vegetables, and sugarcane.";
  }

  // Check for pests
  if (lowerMsg.includes('pest') || lowerMsg.includes('keeda') || lowerMsg.includes('insect')) {
    const crop = findCropInQuestion(lowerMsg);
    if (crop && knowledgeBase.pestControl[crop]) {
      return knowledgeBase.pestControl[crop];
    }
    return "Which crop has pest problem? I can advise for tomato, cotton, paddy, brinjal, and chilli.";
  }

  // Check for diseases
  if (lowerMsg.includes('disease') || lowerMsg.includes('rog') || lowerMsg.includes('symptoms')) {
    const crop = findCropInQuestion(lowerMsg);
    const disease = findDiseaseInQuestion(lowerMsg);
    
    if (crop && disease && knowledgeBase.diseases[crop] && knowledgeBase.diseases[crop][disease]) {
      return knowledgeBase.diseases[crop][disease];
    } else if (crop) {
      return `For ${crop}, common diseases include rust, smut, and blight. Please specify which disease symptoms you're seeing.`;
    }
    return "Please tell me which crop and what symptoms you're seeing (like spots on leaves, wilting, etc.)";
  }

  // Check for organic farming
  if (lowerMsg.includes('organic') || lowerMsg.includes('natural') || lowerMsg.includes('compost')) {
    if (lowerMsg.includes('compost')) {
      return knowledgeBase.organic.compost;
    } else if (lowerMsg.includes('pesticide') || lowerMsg.includes('insecticide')) {
      return knowledgeBase.organic.pesticides;
    } else if (lowerMsg.includes('growth')) {
      return knowledgeBase.organic.growth;
    }
    return knowledgeBase.organic.compost + "\n\n" + knowledgeBase.organic.pesticides;
  }

  // Check for market prices
  if (lowerMsg.includes('price') || lowerMsg.includes('rate') || lowerMsg.includes('market') || lowerMsg.includes('bhav') || lowerMsg.includes('mandi')) {
    return knowledgeBase.market.general + "\n\n" + knowledgeBase.market.tips;
  }

  // Check for weather
  if (lowerMsg.includes('weather') || lowerMsg.includes('mausam') || lowerMsg.includes('rain') || lowerMsg.includes('barish')) {
    return knowledgeBase.weather.general + "\n\n" + knowledgeBase.weather.advice;
  }

  // Check for seasons
  if (lowerMsg.includes('season') || lowerMsg.includes('crop season') || lowerMsg.includes('when to sow')) {
    return knowledgeBase.seasons.kharif + "\n\n" + knowledgeBase.seasons.rabi + "\n\n" + knowledgeBase.seasons.zaid;
  }

  // Check for irrigation
  if (lowerMsg.includes('irrigation') || lowerMsg.includes('water') || lowerMsg.includes('paani') || lowerMsg.includes('watering')) {
    const crop = findCropInQuestion(lowerMsg);
    if (crop && knowledgeBase.irrigation[crop]) {
      return knowledgeBase.irrigation[crop];
    } else if (crop) {
      return `I'm still learning about irrigation for ${crop}. Please ask about wheat, rice, or vegetables.`;
    }
    return "Which crop do you need irrigation advice for? I can help with wheat, rice, and vegetables.";
  }

  // Check for thanks
  if (lowerMsg.includes('thank')) {
    return "🙏 You're welcome! Happy farming! Feel free to ask more questions.";
  }

  // Check for bye
  if (lowerMsg.includes('bye') || lowerMsg.includes('goodbye')) {
    return "👋 Goodbye! Visit again for farming advice. Have a great harvest!";
  }

  // Default response - join the array into a string
  return knowledgeBase.default.join('\n');
}

// Chat endpoint
router.post('/message', async (req, res) => {
  try {
    const { message, userId } = req.body;
    
    console.log('📨 Received message:', message);
    
    // Generate response
    const response = generateResponse(message);
    
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
        
        // Keep only last 50 messages to prevent database bloat
        if (chatHistory.messages.length > 50) {
          chatHistory.messages = chatHistory.messages.slice(-50);
        }
        
        await chatHistory.save();
        console.log('💾 Chat saved to database');
      } catch (dbError) {
        console.log('⚠️ Database error:', dbError.message);
        // Continue even if database save fails
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
    
    if (userId === 'guest') {
      return res.json({ messages: [] });
    }
    
    const chatHistory = await ChatHistory.findOne({ userId });
    
    if (!chatHistory) {
      return res.json({ messages: [] });
    }
    
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
    
    if (userId === 'guest') {
      return res.json({ message: 'Guest history not stored' });
    }
    
    await ChatHistory.findOneAndDelete({ userId });
    res.json({ message: 'Chat history cleared' });
    
  } catch (error) {
    console.error('❌ Error clearing history:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
