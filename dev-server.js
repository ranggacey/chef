// Simple development server untuk menjalankan API routes lokal
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Import API handler
const handler = async (req, res) => {
  // Copy dari api/chat.js tapi untuk development
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages, temperature = 0.7, max_tokens = 8192 } = req.body;
  
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Parameter "messages" harus berupa array' });
  }

  const apiKey = process.env.LUNOS_API_KEY || 'sk-ad357639a218cbdb575ba627a0a6c4ae9a22943505598ef2';
  const baseUrl = 'https://api.lunos.tech/v1';

  try {
    console.log('🚀 Development server: Making request to Lunos API...');
    
    const payload = {
      model: 'google/gemini-2.0-flash-lite',
      messages: messages,
      temperature: temperature,
      max_tokens: max_tokens
    };

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });

    console.log('📊 Development server: Lunos response status:', response.status);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('❌ Development server: Lunos API error:', errorBody);
      throw new Error(`Lunos API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Development server: Success');
    
    return res.status(200).json(data);
    
  } catch (err) {
    console.error('❌ Development server error:', err);
    return res.status(500).json({ 
      error: 'Development server error',
      details: err.message 
    });
  }
};

// API route
app.post('/api/chat', handler);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Development server running', port: PORT });
});

app.listen(PORT, () => {
  console.log(`🔧 Development API server running on http://localhost:${PORT}`);
  console.log(`🔗 API endpoint: http://localhost:${PORT}/api/chat`);
});
