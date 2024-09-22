const axios = require('axios');
const Link = require('./models');

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent';
const GEMINI_API_KEY = 'AIzaSyARrg9t2U4CLcXC6Hn6_v_XmMFVPEeNI6c';

exports.summarizeContent = async (req, res) => {
  const { url } = req.body;

  try {
    const response = await axios.post(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `A 1 paragraph summary.: ${url}`
            }
          ]
        }
      ]
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('API response:', response.data); // Log the API response

    // Ensure candidates array exists and has at least one element
    if (response.data.candidates && response.data.candidates.length > 0) {
      const content = response.data.candidates[0].content;

      // Ensure content and parts array exist and have at least one element
      if (content && content.parts && content.parts.length > 0) {
        const summary = content.parts[0].text;

        console.log('Extracted summary:', summary); // Log the extracted summary

        if (!summary) {
          return res.status(500).json({ error: 'Failed to extract summary from the API response' });
        }

        // Save the link and summary to the database
        const newLink = new Link({ url, summary });
        await newLink.save();

        res.json({ summary });
      } else {
        res.status(500).json({ error: 'No parts found in the API response content' });
      }
    } else {
      res.status(500).json({ error: 'No candidates found in the API response' });
    }
  } catch (error) {
    console.error('Error summarizing content:', error);
    res.status(500).json({ error: 'Failed to summarize content' });
  }
};

exports.getPreviousLinks = async (req, res) => {
  try {
    const links = await Link.find();
    res.json(links);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve links' });
  }
};