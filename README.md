# Payment Platform — Requirements Agent

Next.js + Tailwind version of the agentic requirements-gathering prototype:
Interview agent → Extraction agent → Compliance/Risk agent → SDLC-recommendation agent.

## Setup (first time)

1. **Install Node.js 18+** if you don't have it: https://nodejs.org (LTS version).
2. **Get an Anthropic API key**: https://console.anthropic.com/settings/keys (sign up, add a small amount of credit — this app makes a handful of API calls per interview, costs fractions of a cent to a few cents each).
3. In this project folder, install dependencies:
   ```
   npm install
   ```
4. Copy the env example and paste in your key:
   ```
   cp .env.local.example .env.local
   ```
   then edit `.env.local` and replace the placeholder with your real key.
5. Run it:
   ```
   npm run dev
   ```
6. Open http://localhost:3000

That's it — no separate database to install. A `data.sqlite` file is created automatically in the project folder the first time you run a session; that's where all interviews/requirements are stored.

## How it's structured

- `app/page.tsx` — dashboard, lists past sessions
- `app/interview/page.tsx` — the chat interview UI
- `app/session/[id]/page.tsx` — the generated requirements + SDLC recommendation view
- `app/api/interview/route.ts` — calls the **Interview Agent** (one question per request)
- `app/api/pipeline/route.ts` — calls **Extraction → Compliance → SDLC** agents in sequence and saves the result
- `lib/anthropic.ts` — all four agent prompts live here; this is what you'd edit to change agent behavior
- `lib/db.ts` — SQLite table setup (`better-sqlite3`, file-based, zero config)

## Next steps if you want to go further

- Swap `lib/anthropic.ts`'s direct API calls for calls to your own fine-tuned model endpoint (e.g. a Hugging Face Inference Endpoint) once you have one per agent role.
- Add auth (e.g. NextAuth) if more than one person will use it.
- Deploy: this can go on Vercel directly — just add `ANTHROPIC_API_KEY` as an environment variable in the Vercel project settings. Note: Vercel's serverless functions are ephemeral, so `data.sqlite` won't persist across deploys there — for real deployment, swap SQLite for a hosted Postgres (e.g. Vercel Postgres, Supabase) using the same query shapes in `lib/db.ts`.
