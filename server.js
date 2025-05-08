require('dotenv').config();
const express = require('express');
const { Configuration, OpenAIApi } = require('openai');
const app = express();

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY
});
const openai = new OpenAIApi(configuration);

app.use(express.json());
app.use(express.static('public'));

app.post('/api/get-topic', async (req, res) => {
    try {
        const completion = await openai.createChatCompletion({
            model: "gpt-4",
            messages: [{
                role: "system",
                content: "You are a debate moderator. Generate a challenging and current Public Forum debate topic."
            }],
        });
        res.json({ topic: completion.data.choices[0].message.content });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to generate topic' });
    }
});

app.post('/api/get-feedback', async (req, res) => {
    const { topic, speeches, debaters } = req.body;
    try {
        const completion = await openai.createChatCompletion({
            model: "gpt-4",
            messages: [{
                role: "system",
                content: `You are a debate judge evaluating a Public Forum debate on the topic: ${topic}. Provide feedback and pick a winner.`
            }, {
                role: "user",
                content: JSON.stringify({ speeches, debaters })
            }],
        });
        res.json({
            decision: completion.data.choices[0].message.content,
            feedback: completion.data.choices[0].message.content
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to generate feedback' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
