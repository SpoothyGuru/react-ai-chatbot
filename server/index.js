// Minimal proxy server for OpenRouter
// Keeps API key secure on server side

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

console.log("OPENROUTER KEY:", process.env.VITE_OPENROUTER_API_KEY);

const app = express();
const port = process.env.PORT || 5175;

app.use(cors());
app.use(express.json());

app.post("/api/generate", async (req, res) => {
  try {
    const { conversation } = req.body;

    if (!conversation) {
      return res.status(400).json({ error: "Missing conversation in body" });
    }

    const apiKey = process.env.VITE_OPENROUTER_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "Server missing VITE_OPENROUTER_API_KEY" });
    }

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          "HTTP-Referer": "http://localhost:5173",
          "X-Title": "React Chatbot Project"
        },
        body: JSON.stringify({
          model: "openai/gpt-4o-mini",   // ✅ Free & works
          messages: conversation,
          temperature: 0.7
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenRouter error:", data);
      return res.status(response.status).json({ error: data });
    }

    const assistantText = data?.choices?.[0]?.message?.content;

    return res.json({ text: assistantText });

  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`OpenRouter proxy running on http://localhost:${port}`);
});