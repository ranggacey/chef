/**
 * API route untuk chat AI menggunakan Lunos API.
 * Vercel serverless function untuk menghindari CORS issues.
 */
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages, temperature = 0.7, max_tokens = 8192 } = req.body;
  
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Parameter "messages" harus berupa array' });
  }

  // Use environment variable from Vercel
  const apiKey = process.env.LUNOS_API_KEY || 'sk-ad357639a218cbdb575ba627a0a6c4ae9a22943505598ef2';
  const baseUrl = 'https://api.lunos.tech/v1';

  if (!apiKey) {
    console.error('❌ LUNOS_API_KEY not found in environment');
    return res.status(500).json({ error: 'Kunci API Lunos tidak tersedia' });
  }

  try {
    console.log('🚀 Making request to Lunos API...');
    
    // Persiapkan payload untuk Lunos API
    const payload = {
      model: 'google/gemini-2.0-flash-lite',
      messages: messages,
      temperature: temperature,
      max_tokens: max_tokens
    };

    console.log('📦 Payload:', JSON.stringify(payload, null, 2));

    // Panggil Lunos API
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });

    console.log('📊 Lunos response status:', response.status);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('❌ Lunos API error:', errorBody);
      throw new Error(
        `Lunos API mengembalikan status ${response.status}: ${errorBody.substring(0, 200)}`
      );
    }

    const data = await response.json();
    console.log('✅ Lunos API success');
    
    // Return the same format as OpenAI API
    return res.status(200).json(data);
    
  } catch (err) {
    console.error('❌ Error saat memanggil Lunos API:', err);
    return res.status(500).json({ 
      error: 'Terjadi kesalahan saat memanggil Lunos API',
      details: err.message 
    });
  }
}
