const express = require('express');
const cors = require('cors');
const { createClient } = require('@deepgram/sdk');
const fs = require('fs');
const { pipeline } = require('stream/promises');
const dotenv = require('dotenv');

dotenv.config();
const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

const deepgramApiKey = process.env.DEEPGRAM;
const deepgram = createClient(deepgramApiKey);

app.post('/english', async (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).send('Text is required');
  }

  try {
    const response = await deepgram.speak.request(
      { text },
      {
        model: 'aura-luna-en',
      }
    );

    const stream = await response.getStream();
    if (stream) {
      res.setHeader('Content-Type', 'audio/mpeg');
      await pipeline(stream, res);
    } else {
      res.status(500).send('Error generating audio');
    }
  } catch (err) {
    console.error('Error:', err);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
