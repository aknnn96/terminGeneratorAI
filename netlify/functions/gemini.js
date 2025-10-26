// netlify/functions/gemini.js
export default async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: { message: 'GEMINI_API_KEY missing' } });

    // Body robust einlesen (je nach Runtime)
    let payload;
    if (typeof req.body === 'object') payload = req.body;
    else if (typeof req.body === 'string' && req.body.length) payload = JSON.parse(req.body);
    else {
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      const raw = Buffer.concat(chunks).toString('utf8');
      payload = raw ? JSON.parse(raw) : {};
    }

    const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent";
    const upstream = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey
      },
      body: JSON.stringify(payload)
    });

    const text = await upstream.text();
    return res.status(upstream.status).send(text);
  } catch (e) {
    return res.status(502).json({ error: { message: e.message } });
  }
};
