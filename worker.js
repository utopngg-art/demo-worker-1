const axios = require('axios');
const express = require('express');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 10000;

// The Trigger Button
app.get('/trigger-fetch', async (req, res) => {
  try {
    console.log("Fetching odds from The Odds API...");

    // 1. Fetching the data from The Odds API
    const response = await axios.get('https://api.the-odds-api.com/v4/sports/soccer_epl/odds', {
      params: {
        apiKey: process.env.ODDS_API_KEY,
        regions: 'us',
        markets: 'h2h,totals', // 🔥 THE MAGIC FIX: We added Over/Under (totals) here!
        oddsFormat: 'decimal'
      }
    });

    const games = response.data;
    console.log(`Found ${games.length} upcoming games! Sending to Main App...`);

    // 2. Driving the data to the Main App's Secret Door
    await axios.post(process.env.MAIN_APP_URL, 
      { games: games },
      { 
        headers: { 
          'x-secret-password': process.env.SECRET_PASSWORD 
        } 
      }
    );

    console.log("Data delivered successfully!");
    res.json({ message: "Task complete. Live odds updated successfully." });

  } catch (error) {
    console.error("Error during fetch and send:", error.message);
    res.status(500).json({ error: "Something went wrong fetching from The Odds API." });
  }
});

app.listen(PORT, () => {
  console.log(`Demo Worker is listening on port ${PORT}`);
});
