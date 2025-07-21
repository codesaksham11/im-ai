// This is server-side code and will run on Vercel/Netlify's servers.

// We need a library to make HTTP requests from our server.
// You might need to add "node-fetch" to your package.json dependencies.
const fetch = require('node-fetch');

// This is the "unofficial" API endpoint that Perchance's own generator uses.
// THIS CAN CHANGE AT ANY TIME WITHOUT WARNING.
const PERCHANCE_API_URL = 'https://perchance.org/api/generateImage';

// This is the main function that handles requests to /api/generate
module.exports = async (req, res) => {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        // Make the request to the real Perchance API from our server
        const perchanceResponse = await fetch(PERCHANCE_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            // The body needs to be in this specific format for this endpoint
            body: JSON.stringify({
                prompt: prompt,
                // This is the generator name from the URL perchance.org/ai-nsfw-image-generator
                generator: 'text-to-image-generator', 
                output_type: 'image_b64' // Request image as Base64 text
            })
        });

        if (!perchanceResponse.ok) {
            // Forward the error from Perchance
            const errorText = await perchanceResponse.text();
            console.error('Perchance API Error:', errorText);
            return res.status(perchanceResponse.status).json({ error: 'Failed to generate image from Perchance.' });
        }
        
        const data = await perchanceResponse.json();

        // Check if the response was successful and contains the image data
        if (data.status === 'success' && data.img_b64) {
            // Send the Base64 image string back to our frontend
            // The frontend will set this as the `src` of an <img> tag.
            res.status(200).json({ 
                imageUrl: `data:image/jpeg;base64,${data.img_b64}` 
            });
        } else {
            throw new Error('Perchance API did not return a successful image.');
        }

    } catch (error) {
        console.error('Server-side Error:', error);
        res.status(500).json({ error: 'An internal server error occurred.' });
    }
};
