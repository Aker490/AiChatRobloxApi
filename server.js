const app = require("express")();
const bodyParser = require("body-parser");
const fetch = require("node-fetch");
const fs = require("fs");

const PORT = 3000;

globalThis.fetch = fetch;
globalThis.Headers = fetch.Headers
globalThis.Request = fetch.Request
globalThis.Response = fetch.Response

app.use(bodyParser.json());

const {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold
} = require("@google/generative-ai");
const { response } = require("express");

const apikey = process.env.API_KEY;
const genai = new GoogleGenerativeAI(apikey);

const generationconfig = {
    temperature: 0,
    topP: 0.95,
    topK: 64,
    responseMimeType: "text/plain"
}

async function run(prompt,history){
    try {
        const model = genai.getGenerativeModel({
            model: "gemini-1.5-flash",
        })

        const chattsession = model.startChat({
            generationConfig,
            history: history,
        })

        const result = await chattsession.sendMessage(prompt);
        return {response: true, Text: result.response.text()};
    } catch (error) {
        console.error("Error occurred while generating response:", error);
        return {response: false, error: error.message};
    }
}

app.post("/",async (req, res) => {
    const prompt = req.body.prompt;
    const history = req.body.history;

    const response = await run(prompt, history);

    if (response.response == true){
        res.status(200).send(response.Text);
    } else {
        res.status(500).send(response.error);
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
