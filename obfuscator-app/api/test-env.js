// Debug endpoint to check environment variables (without exposing values)
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const envVars = {
    ChatGPT_KEY: process.env.ChatGPT_KEY ? 'SET (length: ' + process.env.ChatGPT_KEY.length + ')' : 'NOT SET',
    OPENAI_API_KEY: process.env.OPENAI_API_KEY ? 'SET (length: ' + process.env.OPENAI_API_KEY.length + ')' : 'NOT SET',
    CHATGPT_KEY: process.env.CHATGPT_KEY ? 'SET (length: ' + process.env.CHATGPT_KEY.length + ')' : 'NOT SET',
    OPENAI_KEY: process.env.OPENAI_KEY ? 'SET (length: ' + process.env.OPENAI_KEY.length + ')' : 'NOT SET',
  };
  
  const allOpenAIVars = Object.keys(process.env).filter(key => 
    key.toUpperCase().includes('CHATGPT') || 
    key.toUpperCase().includes('OPENAI')
  );
  
  res.status(200).json({
    environment: process.env.VERCEL_ENV || 'unknown',
    checkedVariables: envVars,
    allOpenAIVarsFound: allOpenAIVars,
    nodeEnv: process.env.NODE_ENV
  });
}

