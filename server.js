const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = 5000;

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

// Use CORS middleware
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Handle pre-flight requests
app.options("*", (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.sendStatus(200);
});

// Get access token from Spotify
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
          Authorization: `Basic ${Buffer.from(CLIENT_ID + ":" + CLIENT_SECRET).toString(
            "base64"
          )}`,
        },
      }
    );
    return response.data.access_token;
  } catch (error) {
    console.error("Error fetching access token: ", error);
    throw new Error("Failed to fetch access token");
  }
};

// Search for songs
app.get("/search", async (req, res) => {
  try {
    const accessToken = await getAccessToken();
    const { emotion } = req.query; // Get emotion from frontend

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
    console.error("Error searching Spotify: ", error);
    res.status(500).json({
      message: "Error searching Spotify",
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
