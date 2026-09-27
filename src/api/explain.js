export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  
  // Real implementation would use an OpenAI/Anthropic SDK.
  // const apiKey = process.env.OPENAI_API_KEY;
  // if (!apiKey) return res.status(500).json({ error: 'No API key configured' });
  
  // For this frontend-only MVP, we explicitly fail 
  // so the client falls back to the robust canned template,
  // preventing the panel from appearing broken without a backend.
  return res.status(500).json({ error: 'LLM API not reachable, falling back to local reasoning.' });
}
