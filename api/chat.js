export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {

    const { conversation } = req.body;

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "openai/gpt-3.5-turbo",
          messages: conversation
        })
      }
    );

    const data = await response.json();

    console.log("OpenRouter response:", data);

    const text =
      data?.choices?.[0]?.message?.content ||
      "Sorry, AI could not respond.";

    res.status(200).json({ text });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      text: "Server error while contacting AI."
    });

  }
}