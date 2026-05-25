// backend/routes/chat.js
const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

router.post('/', async (req, res) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Messages history is required.' });
  }

  // Format messages history for Gemini
  // System instructions
  const systemInstruction = `
You are WanderGlow's AI Travel Assistant, a highly knowledgeable, friendly, and seasoned travel advisor.
Your goal is to answer users' travel questions, suggest destinations, give travel tips, help calculate budgets, and recommend activities.
Keep your responses relatively concise, engaging, and well-structured. Use emojis to make it lively.
If they ask you to plan a full trip, tell them to use the "Plan Trip" button in the navbar for a comprehensive itinerary, but offer a mini-preview here.
`;

  try {
    // We can format the history as a single prompt for flash
    let prompt = `${systemInstruction}\n\n`;
    
    // Add last 10 messages for context
    const recentMessages = messages.slice(-10);
    recentMessages.forEach(msg => {
      if (msg.type === 'user') {
        prompt += `User: ${msg.text}\n`;
      } else {
        prompt += `Assistant: ${msg.text}\n`;
      }
    });
    
    prompt += `Assistant:`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    res.json({ text: responseText });
  } catch (error) {
    console.error('Error in chatbot conversation:', error);
    res.status(500).json({ error: 'Failed to generate response. Please check your Gemini key.' });
  }
});

module.exports = router;
