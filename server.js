const express = require("express");
const fetch = require("node-fetch");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const PORT = 3000;

app.use(express.json());

const apikey = process.env.API_KEY;
if (!apikey) {
    console.error("Missing API_KEY in environment variables");
    process.exit(1);
}

const genai = new GoogleGenerativeAI(apikey);

const generationConfig = {
    temperature: 0,
    topP: 0.95,
    topK: 64,
    responseMimeType: "text/plain"
};

async function run(prompt, history) {
    try {
        const model = genai.getGenerativeModel({ model: "gemini-1.5-flash" });

        const chatSession = model.startChat({
            generationConfig,
            history
        });

        const result = await chatSession.sendMessage(prompt);
        return { response: true, text: await result.response.text() };
    } catch (error) {
        console.error("Error occurred while generating response:", error);
        return { response: false, error: error.message };
    }
}

app.post("/", async (req, res) => {
    const { prompt, history } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: "Missing 'prompt' in request body" });
    }

    const response = await run(prompt, history || []);

    if (response.response) {
        res.status(200).send(response.text);
    } else {
        res.status(500).send(response.error);
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
