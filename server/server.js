// server/server.js

const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse incoming JSON requests
app.use(bodyParser.json());
app.use(express.static('public'));  // Serve static files from the public folder

// Route to get a random topic from OpenAI API
app.get('/api/topic', async (req, res) => {
    try {
        // Call OpenAI API to get a random debate topic
        const response = await axios.post(
            'https://api.openai.com/v1/completions',
            {
                model: "text-davinci-003",  // You can replace this with any OpenAI model
                prompt: "Give me a random Public Forum debate topic.",
                max_tokens: 100,
                temperature: 0.7
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const topic = response.data.choices[0].text.trim();
        res.json({ topic });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching topic from OpenAI');
    }
});

// Route to process user's speech and provide feedback and score
app.post('/api/debate', async (req, res) => {
    const { speech } = req.body;

    try {
        // Send the speech to OpenAI for feedback, scoring, and suggestions
        const response = await axios.post(
            'https://api.openai.com/v1/completions',
            {
                model: "text-davinci-003",  // Again, you can replace with other models
                prompt: `You are a debate judge. Rate the following speech out of 100 and provide feedback for improvement:\n\nSpeech:\n${speech}`,
                max_tokens: 200,
                temperature: 0.5
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const feedback = response.data.choices[0].text.trim();
        const scoreMatch = feedback.match(/(\d{1,3})/);  // Match a number between 0-100

        const score = scoreMatch ? parseInt(scoreMatch[0]) : 0;

        res.json({
            feedback: feedback,
            score: score,
            suggestions: 'You can improve by refining your structure and making stronger arguments.'
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error processing the speech');
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
