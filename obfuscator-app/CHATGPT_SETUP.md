# ChatGPT Analysis Integration Setup

This app now includes ChatGPT-powered analysis that helps understand guardrail bypass techniques for security research purposes.

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the `obfuscator-app` directory:

```env
ChatGPT_KEY=your_openai_api_key_here
PORT=3001
```

Replace `your_openai_api_key_here` with your actual OpenAI API key.

### 3. Start the Application

You have two options:

**Option A: Run both server and frontend together**
```bash
npm run dev:full
```

**Option B: Run separately**
```bash
# Terminal 1: Start backend server
npm run server

# Terminal 2: Start frontend dev server
npm run dev
```

The backend server will run on `http://localhost:3001` and the frontend on `http://localhost:5173` (or the port Vite assigns).

## Usage

1. **Enter your text** in the source textarea
2. **Enable "ChatGPT Analysis Mode"** toggle
3. **Click Generate**
4. The app will:
   - Send your text to ChatGPT for analysis
   - Display guardrail analysis
   - Show step-by-step bypass instructions
   - Provide a transformed version of your text
   - Explain the transformation strategy

## Features

- **Guardrail Analysis**: Identifies what ChatGPT safety measures would block your content
- **Step-by-Step Instructions**: Numbered list of techniques to bypass guardrails
- **Example Prompts**: Shows example prompt structures for each technique
- **Rationale**: Explains why each technique works
- **Transformed Text**: Provides a version of your text that demonstrates bypass techniques

## API Endpoint

The backend exposes a POST endpoint at `/api/analyze`:

```javascript
POST http://localhost:3001/api/analyze
Content-Type: application/json

{
  "text": "Your text to analyze"
}
```

Response format:
```json
{
  "analysis": "Analysis of guardrails",
  "steps": [
    {
      "step": 1,
      "technique": "Role-playing",
      "instruction": "Detailed instruction",
      "example": "Example prompt",
      "rationale": "Why this works"
    }
  ],
  "transformedText": "Transformed version",
  "strategy": "Strategy explanation"
}
```

## Notes

- The ChatGPT analysis is for educational and security research purposes
- Make sure your OpenAI API key has sufficient credits
- The analysis uses GPT-4 model for best results
- If the server isn't running, you'll see an error message in the UI

