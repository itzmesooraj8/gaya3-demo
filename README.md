<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1Rxf5EbkIQs9O_sWztDXIpp8thgAIV4G8

## Production

The production site is deployed at: https://gaya3-henna.vercel.app

Deployment checklist (quick)
- Ensure Vercel Project → Settings → Environment Variables includes:
   - `VITE_SUPABASE_URL` (your Supabase URL) or `SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY` (anon key) or `SUPABASE_ANON_KEY`
   - `VITE_CANONICAL_HOST` = `https://gaya3-henna.vercel.app` (optional, code falls back to this value)

- In Supabase Console → Authentication → Settings:
   - Add `https://gaya3-henna.vercel.app/auth/callback` to **Redirect URLs**
   - Add `https://gaya3-henna.vercel.app` to **Allowed Origins (CORS)**

- In Google Cloud Console → APIs & Services → Credentials → OAuth 2.0 Client:
   - Add `https://gaya3-henna.vercel.app/auth/callback` to **Authorized redirect URIs**

CI & automated checks
- A GitHub Action (`.github/workflows/quality.yml`) has been added to run `npm audit` (threshold: moderate) and Lighthouse CI against a `SITE_URL` secret. To enable:
   1. Add a GitHub Repository Secret named `SITE_URL` with value `https://gaya3-henna.vercel.app`.
   2. Optionally add `LHCI_GITHUB_APP_TOKEN` if you want richer LHCI reporting.

If you want me to tail Vercel logs during a redeploy, either:
- Disable Vercel deployment protection for this project (Project → Settings → Security), or
- Sign in to Vercel in your browser and open the deployment URL so automated checks can access it: `https://gaya3-henna.vercel.app`.

Before visiting production, ensure the following environment variables are configured in the Vercel project settings:
- `VITE_SUPABASE_URL` or `SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY` or `SUPABASE_ANON_KEY`

Also update any OAuth redirect URIs and CORS/allowed origins in third-party services (Supabase, Google OAuth, Stripe webhooks, etc.) to include `https://gaya3-henna.vercel.app`.

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
