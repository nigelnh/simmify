const axios = require("axios");
const cheerio = require("cheerio");
require("dotenv").config();

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

exports.handler = async (event, context) => {
  // Only allow POST
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { url } = JSON.parse(event.body);
    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

    // Check if API key exists
    if (!OPENROUTER_API_KEY) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          error:
            "API key not configured. Please check your environment variables.",
        }),
      };
    }

    // Basic URL validation
    if (!url) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "URL is required" }),
      };
    }

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
          "HTTP-Referer": process.env.URL || "http://localhost:3001",
          "X-Title": "Simmify",
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

    return {
      statusCode: 200,
      body: JSON.stringify({ summary: cleanSummary }),
    };
  } catch (error) {
    console.error("Error in summarizeContent:", error);

    // More specific error messages
    if (error.response) {
      // API error response
      const errorMessage =
        error.response.data.error?.message ||
        error.response.data.error ||
        JSON.stringify(error.response.data);

      return {
        statusCode: error.response.status,
        body: JSON.stringify({
          error: `API Error: ${errorMessage}`,
        }),
      };
    } else if (error.request) {
      // Network error
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: "Network error - Could not reach the API",
        }),
      };
    }

    // Generic error
    return {
      statusCode: 500,
      body: JSON.stringify({
        error:
          error.message ||
          "Failed to summarize content. Please check the URL and try again.",
      }),
    };
  }
};
