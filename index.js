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

// Define the function schema
const functions = [
    {
      name: 'generate_budget',
      description: 'Generates a budget for the diagnosed car issues',
      parameters: {
        type: 'object',
        properties: {
          total_cost: {
            type: 'number',
            description: 'The total cost of all repairs',
          },
          parts: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                part_name: {
                  type: 'string',
                  description: 'Name of the car part',
                },
                cost: {
                  type: 'number',
                  description: 'Cost to repair or replace the part',
                },
              },
              required: ['part_name', 'cost'],
            },
          },
        },
        required: ['total_cost', 'parts'],
      },
    },
  ];

app.post('/diagnose', async (req, res) => {
    const carState = req.body.carState;
  
    if (!carState) {
      return res.status(400).send({ error: 'Car state is required' });
    }
  
    try {
      // Prepare the message content
      const userMessage = `Given the following car state indicating damage levels:
  ${JSON.stringify(carState, null, 2)}
  Generate a repair budget in JSON format with total cost and cost per part.`;
  
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an expert car mechanic and estimator.' },
          { role: 'user', content: userMessage },
        ],
        functions: functions,
        function_call: { name: 'generate_budget' },
      });
  
      const responseMessage = completion.choices[0].message;
  
      if (responseMessage.function_call) {
        const budget = JSON.parse(responseMessage.function_call.arguments);
        res.send(budget);
      } else {
        res.send({ message: responseMessage.content });
      }
    } catch (error) {
      console.error('Error communicating with OpenAI:', error);
      res.status(500).send({ error: 'An error occurred while processing your request.' });
    }
  });
  
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/templates/app.html');
  });

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});