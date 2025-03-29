const axios = require("axios");
const cheerio = require("cheerio");

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_API_KEY =
  "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";

exports.summarizeContent = async (req, res) => {
  const { url } = req.body;

  // Basic URL validation
  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  try {
    // First, fetch the content from the URL
    const webContent = await axios.get(url);
    const html = webContent.data;

    // Extract text content from HTML using cheerio
    const $ = cheerio.load(html);

    // Remove script and style elements
    $("script").remove();
    $("style").remove();

    // Get text content
    const textContent = $("body")
      .text()
      .replace(/\s+/g, " ") // Replace multiple spaces with single space
      .trim(); // Remove leading/trailing whitespace

    // Then, send to OpenRouter API for summarization
    const response = await axios.post(
      OPENROUTER_API_URL,
      {
        model: "google/gemini-pro",
        messages: [
          {
            role: "user",
            content: `Please provide a simple bullet-point summary of this content. Each point should start with a hyphen (-) and be on a new line. Do not use any markdown formatting or headers. Keep each point concise and clear. Here's the content: ${textContent}`,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "HTTP-Referer": "http://localhost:3001", // Required for OpenRouter
          "X-Title": "Simmify", // Optional, but good practice
        },
      }
    );

    // Better error handling for the API response
    if (!response.data || !response.data.choices || !response.data.choices[0]) {
      throw new Error("Invalid response from API");
    }

    const summary = response.data.choices[0].message.content;

    if (!summary) {
      throw new Error("No summary generated");
    }

    // Clean up the response by removing any markdown formatting and ensuring each bullet point is on a new line
    const cleanSummary = summary
      .replace(/^#+\s*/gm, "") // Remove markdown headers
      .replace(/^\*\s*/gm, "-") // Replace asterisks with hyphens
      .replace(/^\s*[-•]\s*/gm, "- ") // Standardize bullet points
      .replace(/\s*-\s*/g, "\n- ") // Ensure each bullet point starts on a new line
      .trim();

    // Return the summary to the client
    res.json({ summary: cleanSummary });
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
