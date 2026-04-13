# Sozim

Kazakh dictionary app with AI explanations for words.

## What Is Implemented

- Search Kazakh words from `kk.wiktionary.org`
- Get AI explanation for each found word (Kazakh + Russian + examples)
- Save search history and favorites in local storage
- Voice pronunciation (`speechSynthesis`)

## AI Integration (Gemini)

The app uses:

- Frontend call: `POST /api/gemini/explain`
- Local backend: `gemini-server.js` (Express)
- Provider priority: `OpenAI (OPENAI_API_KEY)` -> `Gemini (GEMINI_API_KEY)`
- OpenAI default model: `gpt-4o-mini` (`max_tokens: 100`)
- Gemini fallback model: `gemini-2.5-flash`

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
GEMINI_API_KEY=YOUR_GEMINI_KEY
GEMINI_SERVER_PORT=5001
```

## Run

Run both backend + frontend together:

```bash
npm run start:dev
```

- Web: `http://localhost:3001`
- API: `http://localhost:5001/api/health`

## Scripts

- `npm run start:server` - start Gemini backend only
- `npm run start:web` - start React app only
- `npm run start:dev` - start both
- `npm run build` - production build
- `npm test` - tests
