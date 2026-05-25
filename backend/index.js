// backend/index.js (FINAL, AI-POWERED CODE WITHOUT DALL-E)

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import the Google AI SDK only
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const port = process.env.PORT || 5001;

// Middleware to allow the frontend to connect
app.use(cors());
app.use(express.json());

// Serve static assets from the React frontend build
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// --- Google Gemini Setup ---
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const geminiModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

app.get('/', (req, res) => {
  res.send('AI Travel Planner Backend is running!');
});

// --- API Routers ---
app.use('/api/auth', require('./routes/auth').router);
app.use('/api/trips', require('./routes/trips'));
app.use('/api/images', require('./routes/images'));
app.use('/api/chat', require('./routes/chat'));


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
  For each activity, include a name, a detailed description, a scheduled time (e.g. "10:00 AM"), a cost in USD (number), a transit note (e.g. "🚶‍♂️ 8 mins walk (600m)"), a compelling image search query, and plausible latitude and longitude.
  Also provide 2-3 flight options and 2-3 hotel options matching this destination and budget scale.

  Ensure the output is valid, minified JSON. Do not include any text or formatting outside the JSON block.

  JSON Format:
  {
    "destination": "${destination}",
    "duration": ${duration},
    "interests": ["${interests.join('", "')}"],
    "budget": "${budget}",
    "totalBudgetEstimate": <number>,
    "flights": [
      {
        "airline": "<airline name>",
        "flightNo": "<flight number>",
        "price": <price in USD (number)>,
        "departure": "<departure airport code>",
        "arrival": "<arrival airport code>",
        "duration": "<e.g. 7h 45m>"
      }
    ],
    "hotels": [
      {
        "name": "<hotel name>",
        "rating": <rating out of 5 e.g. 4.7 (number)>,
        "pricePerNight": <price per night in USD (number)>,
        "description": "<short premium description>",
        "imageQuery": "<photo query e.g. Plaza hotel Paris>",
        "lat": <latitude>,
        "lng": <longitude>
      }
    ],
    "itinerary": [
      {
        "day": 1,
        "title": "<day title>",
        "summary": "<day summary>",
        "activities": [
          {
            "name": "<activity name>",
            "description": "<activity description>",
            "time": "<scheduled time>",
            "cost": <cost in USD (number)>,
            "transit": "<mode and duration to next activity, e.g. 🚗 12 mins drive>",
            "imageQuery": "<compelling image search query>",
            "lat": <latitude>,
            "lng": <longitude>
          }
        ]
      }
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

// Catch-all route to serve the React app's index.html for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

app.listen(port, () => {
  console.log(`AI Travel Planner Backend is running on http://localhost:${port}`);
});