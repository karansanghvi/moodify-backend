const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Environment Variables
const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

// Ensure environment variables are loaded
if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error("Error: Missing Spotify Client ID or Client Secret in environment variables.");
  process.exit(1);
}

// CORS Configuration
app.use(
  cors({
    origin: "https://moodify-livid-six.vercel.app", // Allow your frontend domain
    methods: ["GET", "POST"], // Allow specific HTTP methods
    allowedHeaders: ["Content-Type", "Authorization"], // Allow specific headers
  })
);

// Debugging middleware for CORS
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "https://moodify-livid-six.vercel.app");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

// Fetch access token from Spotify API
const getAccessToken = async () => {
  try {
    const response = await axios.post(
      "https://accounts.spotify.com/api/token",
      null,
      {
        params: {
          grant_type: "client_credentials",
        },
        headers: {
          Authorization: `Basic ${Buffer.from(CLIENT_ID + ":" + CLIENT_SECRET).toString("base64")}`,
        },
      }
    );
    return response.data.access_token;
  } catch (error) {
    console.error("Error fetching access token: ", error.response?.data || error.message);
    throw new Error("Failed to fetch access token");
  }
};

// Search for songs based on emotion
app.get("/search", async (req, res) => {
  try {
    const accessToken = await getAccessToken();
    const { emotion } = req.query; // Get emotion from the frontend query parameters

    if (!emotion) {
      return res.status(400).json({ message: "Emotion query parameter is required" });
    }

    const query = `${emotion} mood`; // Construct query based on emotion
    const searchResponse = await axios.get("https://api.spotify.com/v1/search", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        q: query,
        type: "track",
        limit: 50,
      },
    });

    res.json(searchResponse.data.tracks.items); // Return songs
  } catch (error) {
    console.error("Error searching Spotify: ", error.response?.data || error.message);
    res.status(500).json({ message: "Error searching Spotify" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
