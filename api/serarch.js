const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = 5000;

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

app.use(cors({origin: "https://moodify-livid-six.vercel.app/"}))

// get access token
const getAccessToken = async () => {
    try {
        const response = await axios.post('https://accounts.spotify.com/api/token', null, {
            params: {
                grant_type: 'client_credentials',
            },
            headers: {
                'Authorization': `Basic ${Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64')}`,
            },
        });
        return response.data.access_token;
    } catch (error) {
        console.error("Error fetching access token: ", error);
        throw new Error("Failed to fetch access token");
    }
};

// search for songs
app.get("/search", async (req, res) => {
    try {
        const accessToken = await getAccessToken();
        const { emotion } = req.query; // get emotion from frontend

        const query = `${emotion} mood`; // construct query based on emotion
        const searchResponse = await axios.get('https://api.spotify.com/v1/search', {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
            params: {
                q: query,
                type: 'track',
                limit: 50,
            },
        });
        
        res.json(searchResponse.data.tracks.items); // return songs
    } catch (error) {
        console.error('Error searching spotify: ', error);
        res.status(500).json({
            message: 'Error searching spotify'
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
});