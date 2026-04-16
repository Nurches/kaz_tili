# Sozim

Kazakh dictionary app with AI explanations for words.

## What Is Implemented

- Search Kazakh words from `kk.wiktionary.org`
- Get AI explanation for each found word (Kazakh + Russian + examples)
- Save search history and favorites in local storage
- Voice pronunciation (`speechSynthesis`)

## AI Integration (OpenAI)

The app uses:

- Frontend call: `POST /api/ai/explain`
- Local backend: `gemini-server.js` (Express)
- OpenAI model: `gpt-4o-mini` (`max_tokens: 100`)

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
OPENAI_API_KEY=YOUR_OPENAI_KEY
OPENAI_MODEL=gpt-4o-mini
AI_SERVER_PORT=5001
```

## Run

Run both backend + frontend together:

```bash
npm run start:dev
```

- Web: `http://localhost:3001`
- API: `http://localhost:5001/api/health`

## Scripts

- `npm run start:server` - start AI backend only
- `npm run start:web` - start React app only
- `npm run start:dev` - start both
- `npm run build` - production build
- `npm test` - tests
