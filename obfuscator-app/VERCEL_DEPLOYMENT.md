# Vercel Deployment Notes

## ✅ Deployment Complete

The app has been successfully deployed to Vercel:
- **Production URL**: Check your Vercel dashboard for the production URL

## ⚠️ Important: Set Environment Variable

For the ChatGPT analysis feature to work, you need to add the `ChatGPT_KEY` environment variable in Vercel:

1. Go to your Vercel dashboard
2. Select the `obfuscator-app` project
3. Go to **Settings** → **Environment Variables**
4. Add a new variable:
   - **Name**: `ChatGPT_KEY`
   - **Value**: Your OpenAI API key
   - **Environment**: Production, Preview, and Development (or just Production)
5. Click **Save**
6. Redeploy the application (or it will auto-deploy on next push)

## Project Structure

- Frontend: Built with Vite, deployed as static files
- Backend API: Serverless function at `/api/analyze.js`
- Configuration: `vercel.json` handles routing

## Local Development

For local development with the backend server:
```bash
npm run dev:full
```

This runs both the Express server (port 3001) and Vite dev server.

## Production

In production (Vercel), the API endpoint `/api/analyze` is handled by the serverless function automatically.

