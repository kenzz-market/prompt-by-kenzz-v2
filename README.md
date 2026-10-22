# Prompt by Kenzz — AI Studio + Supabase

## Contents
- `index.html`, `style.css`, `script.js`: website frontend.
- `supabase-config.js`: Supabase URL and publishable key (safe for frontend when RLS is configured).
- `ai-history.sql`: table and RLS policies for AI history.
- `supabase/functions/kenzz-ai/index.ts`: Supabase Edge Function source; calls Gemini API from the server.

## Important: AI requires one server-side setup
GitHub Pages cannot safely hold a provider API key. This project calls a Supabase Edge Function named `kenzz-ai`. You must deploy the function and set a Gemini API key as a Supabase Function secret. Do not put `GEMINI_API_KEY` in `supabase-config.js`, HTML, or browser JavaScript.

### A. Create/obtain a Gemini API key
1. Open https://aistudio.google.com/apikey and sign in.
2. Create an API key if the service offers access for your account/region.
3. Check the current quota and billing terms shown by Google. Free-tier availability and limits can change.

### B. Add the secret to Supabase
In Supabase project dashboard, open Edge Functions / Functions and set a Function secret:
- Name: `GEMINI_API_KEY`
- Value: your Gemini API key

If using the Supabase CLI instead, from a local environment use `supabase secrets set GEMINI_API_KEY=YOUR_KEY`. Do not paste the key into public GitHub.

### C. Deploy the Edge Function
Deploy folder `supabase/functions/kenzz-ai/` as function name `kenzz-ai`. The function source is included in this ZIP at `supabase/functions/kenzz-ai/index.ts`.
- In Supabase Dashboard, use the Edge Functions editor/deploy flow if available in your project.
- If the dashboard editor cannot deploy a function in your account, Supabase CLI or a supported deployment workflow is required; GitHub Pages alone cannot deploy backend functions.

### D. Create AI history table
1. Supabase → SQL Editor → New query.
2. Open `ai-history.sql` from this ZIP, copy all SQL, paste, and Run.
3. This creates `public.ai_history` and RLS policies so signed-in users can only read/write their own history.

### E. Configure authentication URLs
Supabase → Authentication → URL Configuration:
- Site URL: your GitHub Pages URL.
- Redirect URLs: add the same URL, for example `https://YOUR-USERNAME.github.io/prompt-by-kenzz-v2/`.

### F. Upload frontend to GitHub Pages
Upload these files directly into the repository root and replace files with the same names:
- `index.html`
- `style.css`
- `script.js`
- `supabase-config.js`

Do not upload the ZIP itself. Keep the `supabase` folder for Edge Function source/reference and the SQL file for setup; those do not run as website assets on GitHub Pages.

## Features
- AI Prompt Generator
- Prompt Enhancer
- AI Assistant/chat
- AI history stored in Supabase
- Existing prompt library and local generator

## Security notes
- Supabase publishable key is designed for frontend use; RLS must remain enabled.
- Never expose Gemini API key, Supabase secret key, or service_role key in the repository.
- The function requires an authenticated Supabase user.
- Add rate limits/usage caps before public launch to prevent unexpected provider usage. Provider free quota is not guaranteed.
- This build has no automatic admin privileges; admin actions should be protected separately.
