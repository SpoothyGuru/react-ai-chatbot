# Chatbot React (Vite)

Simple Vite + React chatbot that calls the OpenAI Chat Completions API directly from the browser using `fetch`.

Quick start:

1. Copy `.env.example` to `.env` and set your API key(s).

Environment variables:

- `VITE_AI_PROVIDER`: `openai` or `gemini` (defaults to `gemini`).
- `VITE_OPENAI_API_KEY`: your OpenAI API key (if using OpenAI).
- `VITE_GEMINI_API_KEY`: your Google/Gemini API key (if using Gemini).
- `VITE_GEMINI_MODEL`: optional Gemini model (defaults to `gemini-1.5-mini`).

2. Install dependencies:

```bash
npm install
```

3. Run dev server and the proxy server.

Option A — run separately (recommended):

```bash
# Start the proxy server (reads key from .env)
npm run server

# In another terminal, run the Vite dev server
npm run dev
```

Option B — single command (requires `concurrently`):

```bash
npm run start
```

Notes:
- Copy `.env.example` to `.env` and set your API key(s). The proxy reads `VITE_GEMINI_API_KEY` from `.env`.
- The client calls `/api/generate` which the proxy forwards to Google; this avoids CORS and keeps your API key server-side.

Notes:
- This project calls the OpenAI API directly from the browser. Keep your API key private.
- Use the `.env` file to store `VITE_OPENAI_API_KEY`.
