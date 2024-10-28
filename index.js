require('dotenv').config();

const express = require('express');
const OpenAI = require('openai');
const bodyParser = require('body-parser');
const { z } = require("zod");
const { zodResponseFormat } = require("openai/helpers/zod");

const app = express();
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public/'));

// Initialize OpenAI with your API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, 
});

// Define prompt used for answering questions
const prompt = 'You are a helpful assistant.';
const responseFormat = z.object({
    simpleText : z.string(),
});


app.post('/ask', async (req, res) => {
  const question = req.body.question;

  if (!question) {
    return res.status(400).send({ error: 'Question is required' });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', 
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: question },
      ],
      response_format: zodResponseFormat(responseFormat, 'response_format'),
    });

    const response_format = completion.choices[0].message.content;
    res.send({ response_format });
  } catch (error) {
    console.error('Error communicating with OpenAI:', error);
    res.status(500).send({ error: 'An error occurred while processing your request.' });
  }
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/templates/index.html');
  });

app.get('/app', (req, res) => {
    res.sendFile(__dirname + '/public/templates/app.html');
  });

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
    console.log('App is running on http://localhost:3000/app');
});