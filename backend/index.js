// backend/index.js (FINAL, AI-POWERED CODE WITHOUT DALL-E)

const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import the Google AI SDK only
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const port = process.env.PORT || 5001;

// Middleware to allow the frontend to connect
app.use(cors());
app.use(express.json());

// --- Google Gemini Setup ---
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const geminiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

app.get('/', (req, res) => {
  res.send('AI Travel Planner Backend is running!');
});

// The main endpoint to generate the itinerary
app.post('/api/generate-itinerary', async (req, res) => {
  console.log('Received request to generate itinerary:', req.body);
  const { destination, duration, interests, budget } = req.body;

  const prompt = `
  You are an expert travel planner. Create a detailed and engaging ${duration}-day travel itinerary for a trip to ${destination}.

  The user is interested in: ${interests.join(', ')}. Their budget is ${budget}.

  The itinerary should be in a JSON format and follow this exact structure.
  Provide a total budget estimate in USD based on the budget preference.
  For each day, include a title and a brief summary.
  For each activity, include a name, a detailed description, a compelling image search query, and plausible latitude and longitude.

  Ensure the output is valid, minified JSON. Do not include any text or formatting outside the JSON block.

  JSON Format:
  {
    "destination": "${destination}",
    "duration": ${duration},
    "interests": ["${interests.join('", "')}"],
    "budget": "${budget}",
    "totalBudgetEstimate": <number>,
    "itinerary": [
      {
        "day": 1,
        "title": "<day title>",
        "summary": "<day summary>",
        "activities": [
          {
            "name": "<activity name>",
            "description": "<activity description>",
            "imageQuery": "<compelling image search query>",
            "lat": <latitude>,
            "lng": <longitude>,
            "weather": { "temp": "25°C", "condition": "Sunny", "icon": "faSun" }
          },
          ...
        ]
      },
      ...
    ]
  }
  `;

  try {
    const geminiResult = await geminiModel.generateContent(prompt);
    const geminiText = geminiResult.response.text();

    let itineraryData;
    try {
      itineraryData = JSON.parse(geminiText.replace(/```json\n|```/g, '').trim());
    } catch (e) {
      console.error('Failed to parse Gemini JSON:', e);
      return res.status(500).json({ error: 'Failed to generate itinerary data.' });
    }

    res.json(itineraryData);

  } catch (error) {
    console.error('Error calling AI API:', error);
    res.status(500).json({ error: 'Failed to generate itinerary. Please ensure your Gemini API key is correct.' });
  }
});

app.listen(port, () => {
  console.log(`AI Travel Planner Backend is running on http://localhost:${port}`);
});