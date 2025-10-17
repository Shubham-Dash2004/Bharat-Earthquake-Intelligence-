const Groq = require('groq-sdk');

// Initialize the client here. By the time this file is required and used,
// the dotenv config in index.js will have already run.
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

async function extractClaimFromText(text) {
  // We no longer wrap the API call itself, just the final parsing.
  // If the API key is wrong, the new Groq() line above will throw a clear error.
  const chatCompletion = await groq.chat.completions.create({
    messages: [
      {
  role: "system",
  content: `You are a highly precise data extraction tool. Your only job is to analyze user text and extract key details into a structured JSON object.
  - The JSON object must be named "claim".
  - You MUST include a "location" key with the primary location.
  - You MUST include an "event_type" key (e.g., "earthquake", "flood").
  - Extract the numerical "magnitude" if mentioned. If not present, the value must be null.
  - Your response must ONLY be the JSON object. Example: {"claim": {"location": "Surat, India", "magnitude": 4.6, "event_type": "earthquake"}}`
},
      {
        role: "user",
        content: text,
      },
    ],
    model: "llama-3.1-8b-instant",
    response_format: { type: "json_object" },
  });

  const content = chatCompletion.choices[0]?.message?.content;

  if (!content) {
    throw new Error("AI response was empty.");
  }

  // A simple, safe parse. If this fails, the controller's main catch block will handle it.
  return JSON.parse(content);
}

module.exports = { extractClaimFromText };