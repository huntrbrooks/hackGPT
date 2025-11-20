# Troubleshooting ChatGPT API Key Issues

## Quick Debug Steps

### 1. Test Environment Variables

Visit this URL on your deployed site to check if environment variables are accessible:
```
https://your-vercel-url.vercel.app/api/test-env
```

This will show you:
- Which environment variables are set
- Their lengths (without exposing the actual values)
- All OpenAI-related environment variables found

### 2. Verify Vercel Environment Variables

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your `obfuscator-app` project
3. Go to **Settings** → **Environment Variables**
4. Verify:
   - ✅ Variable name is exactly: `ChatGPT_KEY` (case-sensitive!)
   - ✅ Value is your OpenAI API key (starts with `sk-`)
   - ✅ Environment is set to **Production** (or all environments)
   - ✅ Click **Save** if you made changes

### 3. Common Issues & Solutions

#### Issue: Variable set but still not working
**Solution**: After setting/changing environment variables in Vercel, you MUST redeploy:
- Go to **Deployments** tab
- Click the **⋯** menu on the latest deployment
- Click **Redeploy**

Or push a new commit to trigger auto-deployment.

#### Issue: Variable name mismatch
**Solution**: The code checks these names (in order):
- `ChatGPT_KEY` (preferred)
- `OPENAI_API_KEY`
- `CHATGPT_KEY`
- `OPENAI_KEY`

Make sure your variable name matches one of these exactly (case-sensitive).

#### Issue: Variable set for wrong environment
**Solution**: Ensure the variable is set for **Production** environment:
- When adding the variable, select **Production** (or all environments)
- Preview deployments use Preview environment variables

### 4. Verify the Fix

After redeploying:
1. Visit your site
2. Try the ChatGPT Analysis feature
3. If it still fails, check the browser console (F12) for detailed error messages
4. Visit `/api/test-env` to see what environment variables are accessible

### 5. Alternative: Use Different Variable Name

If `ChatGPT_KEY` doesn't work, try setting `OPENAI_API_KEY` instead (this is the standard name used by OpenAI).

## Still Not Working?

Check the error message in the UI - it now includes debugging information showing:
- Which variable names were checked
- What environment variables were found
- Helpful next steps

