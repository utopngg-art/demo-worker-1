const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();

// A simple Front Door
app.get('/', (req, res) => {
  res.send("🟢 Server is awake and running perfectly!");
});

// The Trigger Endpoint
app.get('/trigger-fetch', async (req, res) => {
  try {
    console.log("Fetching odds from The Odds API...");
    
    // 1. Fetch live/upcoming English Premier League odds
    const apiResponse = await axios.get('https://api.the-odds-api.com/v4/sports/soccer_epl/odds', {
      params: { 
          apiKey: process.env.ODDS_API_KEY, // Your new key!
          regions: 'uk', // Look at UK bookmakers
          markets: 'h2h' // Head-to-head (Home/Draw/Away match winner)
      } 
    });

    // The Odds API sends the games directly in an array
    const gamesData = apiResponse.data;

    if (!gamesData || gamesData.length === 0) {
        return res.status(200).json({ message: "No upcoming games found right now." });
    }

    console.log(`Found ${gamesData.length} upcoming games! Sending to Main App...`);

    // 2. Forward the data to your Main App's Secret Door
    await axios.post(process.env.MAIN_APP_URL, {
        games: gamesData 
    }, {
        headers: {
            'x-secret-password': process.env.SECRET_PASSWORD 
        }
    });

    console.log("Success! Live Data delivered.");
    res.status(200).json({ message: "Task complete. Live odds updated successfully." });

  } catch (error) {
    console.error("Error during fetch and send:", error.message);
    res.status(500).json({ error: "Something went wrong fetching from The Odds API." });
  }
});
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Demo Worker 1 is listening on port ${PORT}`);
});
