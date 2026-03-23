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
    console.log("Fetching odds from Sports API...");
    
    // 1. Fetch data from the API Provider
    const apiResponse = await axios.get('https://v3.football.api-sports.io/odds', {
      headers: {
        'x-apisports-key': process.env.SPORTS_API_KEY
      },
      params: { 
          league: '39', // Premier League
          season: '2025' // Current Season
          // NOTICE: We completely deleted the date! 
      } 
    });

    const gamesData = apiResponse.data.response;

    // 🚨 X-RAY VISION: If the API sends nothing, print its secret data to the screen!
    if (!gamesData || gamesData.length === 0) {
        return res.status(200).json({ 
            message: "No games found. Here is exactly what the API said:", 
            raw_api_data: apiResponse.data 
        });
    }

    console.log("Data fetched! Sending to Main App...");

    // 2. Forward the data to your Main App's Secret Door
    await axios.post(process.env.MAIN_APP_URL, {
        games: gamesData 
    }, {
        headers: {
            'x-secret-password': process.env.SECRET_PASSWORD 
        }
    });

    console.log("Success! Data delivered.");
    res.status(200).json({ message: "Task complete. Odds updated successfully." });

  } catch (error) {
    console.error("Error during fetch and send:", error.message);
    res.status(500).json({ error: "Something went wrong." });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Demo Worker 1 is listening on port ${PORT}`);
});
