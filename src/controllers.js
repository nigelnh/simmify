const axios = require("axios");

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent";
const GEMINI_API_KEY = "YOUR_API_KEY";

exports.summarizeContent = async (req, res) => {
  const { url } = req.body;

  // Basic URL validation
  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  try {
    // First, fetch the content from the URL
    const webContent = await axios.get(url);
    const textContent = webContent.data;

    // Then, send to Gemini for summarization
    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `Please provide a concise one-paragraph summary of this content: ${textContent}`,
              },
            ],
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    // Better error handling for the Gemini API response
    if (
      !response.data ||
      !response.data.candidates ||
      !response.data.candidates[0]
    ) {
      throw new Error("Invalid response from Gemini API");
    }

    const summary = response.data.candidates[0].content.parts[0].text;

    if (!summary) {
      throw new Error("No summary generated");
    }

    res.json({ summary });
  } catch (error) {
    console.error("Error in summarizeContent:", error);

    // More specific error messages
    if (error.response) {
      // API error response
      return res.status(error.response.status).json({
        error: `API Error: ${error.response.data.error || "Unknown API error"}`,
      });
    } else if (error.request) {
      // Network error
      return res.status(500).json({
        error: "Network error - Could not reach the API",
      });
    }

    // Generic error
    res.status(500).json({
      error: "Failed to summarize content. Please check the URL and try again.",
    });
  }
};
