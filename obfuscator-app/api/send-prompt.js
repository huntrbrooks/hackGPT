// Vercel serverless function to send obfuscated prompts to ChatGPT
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, temperature } = req.body || {};

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const apiKey =
      process.env.ChatGPT_KEY ||
      process.env.OPENAI_API_KEY ||
      process.env.CHATGPT_KEY ||
      process.env.OPENAI_KEY;

    if (!apiKey || apiKey.trim() === '') {
      const envVars = Object.keys(process.env).filter(
        (key) =>
          key.toUpperCase().includes('CHATGPT') || key.toUpperCase().includes('OPENAI')
      );

      return res.status(500).json({
        error: 'ChatGPT API key not configured',
        details: `Environment variables checked: ChatGPT_KEY, OPENAI_API_KEY, CHATGPT_KEY, OPENAI_KEY. Found env vars: ${
          envVars.length > 0 ? envVars.join(', ') : 'none'
        }. Please ensure ChatGPT_KEY is set in Vercel environment variables and redeploy.`
      });
    }

    const model =
      process.env.CHATGPT_COMPLETION_MODEL ||
      process.env.CHATGPT_MODEL ||
      'gpt-4';
    const clampedTemperature =
      typeof temperature === 'number'
        ? Math.min(Math.max(temperature, 0), 2)
        : 0.7;
    const maxTokens =
      Number.parseInt(process.env.CHATGPT_MAX_TOKENS, 10) || 1200;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: 'You are ChatGPT, a helpful AI assistant.' },
          { role: 'user', content: prompt }
        ],
        temperature: clampedTemperature,
        max_tokens: maxTokens
      })
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error('OpenAI API error (send-prompt):', payload);
      return res
        .status(response.status)
        .json({ error: 'ChatGPT API error', details: payload });
    }

    const choice = payload.choices?.[0] || {};

    return res.status(200).json({
      response: choice.message?.content || '',
      model: payload.model || model,
      usage: payload.usage,
      finishReason: choice.finish_reason || null,
      id: payload.id || null,
      created: payload.created || null
    });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}


