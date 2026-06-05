import express from 'express';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import Groq from 'groq-sdk';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  app.use(express.json());

  const PORT = 3000;
  const geminiApiKey = process.env.GEMINI_API_KEY;
  const groqApiKey = process.env.GROQ_API_KEY;

  const isGeminiValid = geminiApiKey && geminiApiKey !== 'MY_GEMINI_API_KEY' && !geminiApiKey.includes('YOUR_KEY');
  const isGroqValid = groqApiKey && groqApiKey !== 'MY_GROQ_API_KEY' && !groqApiKey.includes('YOUR_KEY');

  const genAI = isGeminiValid ? new GoogleGenerativeAI(geminiApiKey!) : null;
  const groq = isGroqValid ? new Groq({ apiKey: groqApiKey }) : null;

  // Helper to check if any AI is configured
  const checkAI = () => {
    if (!isGeminiValid && !isGroqValid) {
      throw new Error('No valid LLM API key found. Please set GEMINI_API_KEY or GROQ_API_KEY in your environment/settings.');
    }
  };

  // Unified LLM Helper for flexible tasks
  async function getLLMResponse(prompt: string, isJson: boolean = false) {
    if (isGroqValid && groq) {
      const completion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama-3.1-8b-instant',
        response_format: isJson ? { type: 'json_object' } : undefined,
      });
      return completion.choices[0]?.message?.content || '';
    } else if (isGeminiValid && genAI) {
      const model = genAI.getGenerativeModel({ 
        model: 'gemini-1.5-flash',
        generationConfig: isJson ? { responseMimeType: 'application/json' } : undefined
      });
      const result = await model.generateContent(prompt);
      return result.response.text();
    }
    throw new Error('LLM configuration error');
  }

  // Mock Database across domains (Yelp, Amazon, Goodreads)
  const MOCK_ITEMS = [
    // Yelp / Food (Nigerian Focus)
    { id: 'y1', domain: 'yelp', name: 'Nok by Alara', category: 'Fine Dining', price_range: '₦₦₦₦', location: 'Victoria Island, Lagos', description: 'Contemporary African cuisine in a stunning space.' },
    { id: 'y2', domain: 'yelp', name: 'Amala Shitta', category: 'Buka', price_range: '₦', location: 'Surulere, Lagos', description: 'Famous for its soft amala and spicy gbegiri/ewedu.' },
    
    // Amazon / Products
    { id: 'a1', domain: 'amazon', name: 'Oraimo FreePods 4', category: 'Electronics', price_range: '₦₦', description: 'Active Noise Cancellation wireless earbuds. Sturdy and loud.' },
    { id: 'a2', domain: 'amazon', name: 'Power King Blender', category: 'Home', price_range: '₦₦', description: 'High-speed blender for beans and tough spices.' },

    // Goodreads / Books
    { id: 'g1', domain: 'goodreads', name: 'Stay With Me', author: 'Ayobami Adebayo', category: 'Fiction', description: 'A devastatingly beautiful novel about marriage and family in Nigeria.' },
    { id: 'g2', domain: 'goodreads', name: 'Americanah', author: 'Chimamanda Ngozi Adichie', category: 'Fiction', description: 'A story of love and race centered around a young Nigerian woman.' },
  ];

  const PERSONA_SCHEMA = {
    type: SchemaType.OBJECT,
    properties: {
      user_id: { type: SchemaType.STRING },
      avg_rating: { type: SchemaType.NUMBER },
      rating_variance: { type: SchemaType.NUMBER },
      rating_tendency: { type: SchemaType.STRING, description: 'e.g., generous, critical, emotional_extreme' },
      typical_review_length: { type: SchemaType.NUMBER },
      lexical_richness: { type: SchemaType.NUMBER },
      common_phrases: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
      exclamations: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
      uses_pidgin: { type: SchemaType.BOOLEAN },
      pidgin_markers: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
      sentiment_skew: { type: SchemaType.NUMBER },
      sarcasm_usage: { type: SchemaType.NUMBER },
      preferred_categories: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
      price_sensitivity: { type: SchemaType.NUMBER },
      review_frequency: { type: SchemaType.STRING },
      persona_summary: { type: SchemaType.STRING }
    },
    required: ['user_id', 'persona_summary', 'uses_pidgin', 'common_phrases']
  };

  app.get('/health', (req, res) => res.json({ status: 'ready' }));

  app.post('/task_a/simulate', async (req, res) => {
    try {
      checkAI();
      const { user_name, item_id, history, persona: providedPersona } = req.body;

      let persona = providedPersona;
      if (!persona) {
        // 1. Extraction step
        const extractionPrompt = `
          User Name: ${user_name}
          Analyze this user history: ${JSON.stringify(history)}. 
          Capture rating tendencies, linguistic style (including pidgin usage), sentiment patterns, and contextual triggers.
          Focus on Nigerian nuances.
          Output exactly in this JSON format: ${JSON.stringify(PERSONA_SCHEMA)}
        `;
        const personaText = await getLLMResponse(extractionPrompt, true);
        try {
          const jsonMatch = personaText.match(/([{\[].*[}\]])/s);
          persona = JSON.parse(jsonMatch ? jsonMatch[0] : personaText);
        } catch (reason) {
          console.error('Failed to parse persona JSON:', personaText);
          throw new Error('Invalid persona extraction', { cause: reason });
        }
      }

      // If persona was extracted as an array, pick the first one for simulation if not otherwise specified
      if (Array.isArray(persona)) {
        persona = persona[0];
      }

      // 2. Generation step with Chain-of-Thought
      const item = MOCK_ITEMS.find(i => i.id === item_id) || MOCK_ITEMS[0];
      
      const genPrompt = `
        User Identity: ${user_name}
        Persona Profile: ${JSON.stringify(persona)}
        Item to review: ${JSON.stringify(item)}

        Instructions:
        1. Perform an Internal Chain-of-Thought: "As ${user_name}, I typically review [X]. For this ${item.category}, I will feel [...] because of [persona trait]."
        2. Write a review for the item exactly as they would. Match tone, pidgin level, and typical exclamations.
        3. Sprinkle pidgin naturally.

        Format: JSON { "internal_cot": "...", "rating": number, "review_text": "string", "fidelity_score": number }
      `;
      
      const text = await getLLMResponse(genPrompt, true);
      const jsonMatch = text.match(/([{\[].*[}\]])/s);
      if (jsonMatch) {
         res.json(JSON.parse(jsonMatch[0]));
      } else {
         res.json({ rating: 5, review_text: text, internal_cot: "Agentic reasoning completed with manual override.", fidelity_score: 85 });
      }
    } catch (error) {
      console.error('Simulation error:', error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Simulation failed' });
    }
  });

  app.post('/task_b/recommend', async (req, res) => {
    try {
      checkAI();
      const { query, history, conversation_state } = req.body;
      
      const extractionPrompt = `
        User History: ${JSON.stringify(history)}
        Conversation so far: ${JSON.stringify(conversation_state || [])}
        Incoming Request: "${query}"

        Tasks:
        1. Internal Reasoning: Analyze if this is a cold-start (low history). If yes, infer preferences from the conversation or general 'archetypes' (e.g. 'The Curious Explorer', 'The Budget Conscious').
        2. Cross-Domain Mapping: If they like food (Yelp), what kind of books (Goodreads) or electronics (Amazon) align with that 'vibe'? (e.g. spicy food lovers might liked bold, fast-paced thrillers).
        3. Reasoning: Why would the user like specific items based on their unique linguistic pattern and past sentiment?

        Available Catalog (Cross-domain): ${JSON.stringify(MOCK_ITEMS)}

        Output JSON Format: 
        { 
          "reasoning": "thought process here", 
          "ranked_items": [{"id": "...", "explanation": "personalized explanation in user voice"}], 
          "updated_state": "concise summary of dialogue context" 
        }
      `;

      const text = await getLLMResponse(extractionPrompt, true);
      const jsonMatch = text.match(/([{\[].*[}\]])/s);
      let data = { ranked_items: [], updated_state: "", reasoning: "" };
      
      if (jsonMatch) {
        try {
          data = JSON.parse(jsonMatch[0]);
        } catch (_) {
          console.error('Task B JSON parse error:', text);
        }
      }
      
      const ranked = (data.ranked_items || []).map((ri: any) => {
        const baseItem = MOCK_ITEMS.find(i => i.id === ri.id);
        return baseItem ? { ...baseItem, explanation: ri.explanation } : null;
      }).filter(Boolean);

      const finalRanked = ranked.length > 0 ? ranked : MOCK_ITEMS.slice(0, 3).map(item => ({
        ...item,
        explanation: `Since we're just getting to know you, I've picked ${item.name} as a top-rated entry point into ${item.domain}.`
      }));

      res.json({ 
        ranked_items: finalRanked, 
        conversation_id: "conv_" + (req.body.conversation_id || Date.now()),
        updated_state: data.updated_state || conversation_state,
        internal_reasoning: data.reasoning 
      });
    } catch (error) {
      console.error('Recommendation error:', error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Recommendation failed' });
    }
  });

  app.post('/api/extract-persona-only', async (req, res) => {
    try {
      checkAI();
      const { history } = req.body;
      const text = await getLLMResponse(`Extract persona and output ONLY JSON: ${JSON.stringify(history)}. Format: ${JSON.stringify(PERSONA_SCHEMA)}`, true);
      const jsonMatch = text.match(/([{\[].*[}\]])/s);
      if (jsonMatch) {
        res.json(JSON.parse(jsonMatch[0]));
      } else {
        res.status(500).json({ error: 'Failed to extract valid JSON persona', raw: text });
      }
    } catch (error) { 
      console.error('Extraction only error:', error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Extraction failed' }); 
    }
  });

  const distPath = path.resolve(__dirname, 'dist');
  const indexHtmlExists = fs.existsSync(path.join(distPath, 'index.html'));

  if (process.env.NODE_ENV === 'production' && indexHtmlExists) {
    console.log('Starting in PRODUCTION mode, serving from:', distPath);
    app.use(express.static(distPath));
    app.get('*', (req, res, next) => {
      // If the request is for an API, don't serve index.html
      if (req.path.startsWith('/task_a') || req.path.startsWith('/task_b') || req.path.startsWith('/api') || req.path === '/health') {
        return next();
      }
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    // If we're in production but dist is missing, log a warning and fallback to dev if possible,
    // though in a real production environment this should probably be an error.
    // In AI Studio, we want to favor the Vite middleware during development.
    if (process.env.NODE_ENV === 'production' && !indexHtmlExists) {
      console.warn('NODE_ENV is production but dist/index.html was not found. Falling back to Vite middleware.');
    }
    console.log('Starting in DEVELOPMENT mode with Vite Middleware');
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`NODE_ENV: ${process.env.NODE_ENV || 'undefined'}`);
    console.log(`Dist exists: ${indexHtmlExists}`);
  });
}

startServer();
