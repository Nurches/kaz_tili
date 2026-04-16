# Sozim

Kazakh dictionary app with AI explanations for words.

## What Is Implemented

- Search Kazakh words from `kk.wiktionary.org`
- Get AI explanation for each found word (Kazakh + Russian + examples)
- Save search history and favorites in local storage
- Voice pronunciation (`speechSynthesis`)

## AI Integration (OpenRouter)

The app uses:

- Frontend call: `POST /api/ai/explain`
- Local backend: `gemini-server.js` (Express)
- Vercel backend: `api/ai/explain.js` (Serverless Function)
- OpenRouter API: `https://openrouter.ai/api/v1/chat/completions`
- OpenRouter model: `openai/gpt-4o-mini` (`max_tokens: 100`)

Backend enforces a strict JSON shape:

```json
{
  "kk": "Kazakh explanation",
  "ru": "Russian translation",
  "examples": ["...", "..."]
}
```

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local` (or copy from `.env.example`) and set your key:

```env
OPENROUTER_API_KEY=YOUR_OPENROUTER_KEY
OPENROUTER_MODEL=openai/gpt-4o-mini
OPENROUTER_SITE_URL=http://localhost:3001
OPENROUTER_APP_NAME=Sozim
AI_SERVER_PORT=5001
```

## Run

Run both backend + frontend together:

```bash
npm run start:dev
```

- Web: `http://localhost:3001`
- API: `http://localhost:5001/api/health`
- Vercel health: `https://<your-domain>/api/health`

## Scripts

- `npm run start:server` - start AI backend only
- `npm run start:web` - start React app only
- `npm run start:dev` - start both
- `npm run build` - production build
- `npm test` - tests
