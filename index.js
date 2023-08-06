// server.js
const express = require('express');
const { Configuration, OpenAIApi } = require('openai');
const { connection } = require('./db');
require("dotenv").config();
const cors = require("cors")

const app = express();
app.use(express.json());
app.use(cors())

app.get("/user", (req,res) => {
    res.send({msg:"OK!"})
})

const configuration = new Configuration({
    apiKey: process.env.API_KEY,
  });
  
  const openai = new OpenAIApi(configuration);

app.post('/convert', async (req, res) => {
    try {
        const { sourceCode, sourceLanguage, targetLanguage } = req.body;
        
        if (!sourceCode || !sourceLanguage || !targetLanguage) {
            return res.status(400).json({ error: 'Missing required data: sourceCode, sourceLanguage, targetLanguage' });
          }

        const response = await openai.createChatCompletion({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: `Translate the following ${sourceLanguage} code to ${targetLanguage}: ${sourceCode}` }
          ],
          max_tokens: 100,
          temperature: 0.5,
        });
    
        const convertedCode = response.data.choices[0].message.content;
        res.status(200).json({ convertedCode });
      } catch (error) {
        console.error('Error converting code:', error);
        res.status(500).json({ error: 'An error occurred during code conversion' });
      }
});

app.post('/debug', async (req, res) => {
    try {
      const { sourceCode } = req.body;
  
      if (!sourceCode) {
        return res.status(400).json({ error: 'Missing converted code' });
      }
  
      const debugPrompt = `Debug the following code:\n${sourceCode}`;
      
      const response = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [{ role: "system", content: debugPrompt }],
        max_tokens: 100,
        temperature: 0.5,
      });
  
      const debuggedCode = response.data.choices[0].message.content;
      res.status(200).json({ debuggedCode });
    } catch (error) {
      console.error('Error during debugging:', error);
      res.status(500).json({ error: 'An error occurred during debugging' });
    }
  });
  
  app.post('/quality-check', async (req, res) => {
    try {
      const { sourceCode } = req.body;
  
      if (!sourceCode) {
        return res.status(400).json({ error: 'Missing converted code' });
      }
  
      const qualityPrompt = `Check the quality of the following code:\n${sourceCode}`;
      
      const response = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [{ role: "system", content: qualityPrompt }],
        max_tokens: 100,
        temperature: 0.5,
      });
  
      const qualityCheckResult = response.data.choices[0].message.content;
      res.status(200).json({ qualityCheckResult });
    } catch (error) {
      console.error('Error during quality check:', error);
      res.status(500).json({ error: 'An error occurred during quality check' });
    }
  });
  

app.listen(process.env.PORT, async () => {
    try {
        await connection
        console.log("connected to db")
    } catch (error) {
        console.log(error.message)
    }
    console.log("connected to server")
});