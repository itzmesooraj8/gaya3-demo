# Supabase Setup & Deploy Notes for Gaya3

This document describes how to apply the DB migration, create storage buckets, deploy the Edge Function `get-upload-url`, and run the booking confirmation worker.

## 1) Apply SQL migration

Option A — Supabase SQL editor (recommended quick):

1. Open your Supabase project → SQL Editor → New query.
2. Copy the contents of `supabase/migrations/001_create_schema.sql` and run it.

Option B — Supabase CLI (migrations):

1. Install Supabase CLI: `npm install -g supabase`.
2. Login and link your project:

```powershell
supabase login
supabase link --project-ref <your-project-ref>
```

3. If you maintain migrations via the CLI, place this file under `supabase/migrations/` and run:

```powershell
supabase db push
```

Note: If `postgis` isn't available for your plan, remove the `postgis` extension line and change `coordinates` to `point` or `text`.

## 2) Create storage buckets

In Supabase UI → Storage:
- Create `property-images` (Public)
- Create `avatars` (Public)

Recommended folder structure:
- `property-images/{property_id}/{filename}`
- `avatars/{user_id}/{filename}`

Policy: make buckets public for read access; use the `get-upload-url` function to ensure only authorized hosts upload images.

## 3) Deploy Edge Function: `get-upload-url`

This project includes an Edge Function at `functions/get-upload-url/index.ts`.

Steps to deploy:

1. Set function environment variables in Supabase dashboard (Functions → Settings):
   - `SUPABASE_URL` (your project URL)
   - `SUPABASE_SERVICE_ROLE_KEY` (service role key — keep secret)

2. Deploy via CLI (from repo root):

```powershell
supabase functions deploy get-upload-url --project-ref <your-project-ref>
```

Usage (frontend): send POST request to the function URL with Authorization header (Bearer user_access_token) and JSON payload:

```json
{
  "property_id": "<property-uuid>",
  "filename": "photo.jpg",
  "file_b64": "<base64-encoded-file>"
}
```

The function validates host ownership and uploads to `property-images/{property_id}/{filename}`. It returns `{ publicUrl, path }`.

## 4) Booking-confirmed worker

This project includes a worker script at `workers/booking-confirmed-listener/index.ts` that subscribes to bookings updates and sends confirmation emails using SendGrid.

Environment variables required to run the worker:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SENDGRID_API_KEY`
- `FROM_EMAIL` (optional)

Install dependencies and run (example using Node):

```powershell
# from repo root
cd workers/booking-confirmed-listener
npm init -y
npm install @supabase/supabase-js @sendgrid/mail
node index.js
```

Tip: Run this worker using a process manager (PM2) or as a container in production.

## 5) Secrets & Edge Functions

- Put the following secrets into Supabase Function environment variables (Functions → Settings):
  - `SUPABASE_SERVICE_ROLE_KEY` (service role key — keep secret)
  - `GEMINI_API_KEY` (Gemini / Google generative API key)
  - `STRIPE_SECRET` (Stripe secret key)
  - `SERVICE_ROLE_KEY` is accepted as an alternative name for the service key if you prefer a CLI-safe name.
- Never expose the service role key or other server secrets to the browser.

### New Edge Functions added in the repo

- `ask-gaya` — a small Deno Edge Function that proxies user messages to a Gemini-like generative API. It reads the user's `vibe_score` from `profiles` to build a system prompt and calls the external model with the server-side `GEMINI_API_KEY`.

- `create-payment-intent` — validates the property and dates, creates a `bookings` row with status `pending` (server-side), and creates a payment intent with Stripe using `STRIPE_SECRET`. It returns the `client_secret` and the `booking_id` to the frontend.

To deploy these functions:

```powershell
supabase functions deploy ask-gaya --project-ref <your-project-ref>
supabase functions deploy create-payment-intent --project-ref <your-project-ref>
```

Before deploying, set the function environment variables listed above in the dashboard (Functions → Settings). Both functions expect `SUPABASE_URL` and a service role key to call the REST API securely.

## Auth redirect URIs

When using Supabase authentication and external OAuth providers (Google), you must register the exact production redirect URI in both Supabase and the provider console. Add the following URI to:

- Supabase Console → Authentication → Settings → `Redirect URLs` and `Allowed Origins (CORS)`
- Google Cloud Console → APIs & Services → Credentials → OAuth 2.0 Client → `Authorized redirect URIs`

Use this exact value for production:

```
https://gaya3-henna.vercel.app/auth/callback
```

If you prefer using the root redirect, register `https://gaya3-henna.vercel.app/` as well, but the explicit `/auth/callback` path is recommended for clarity and security.

## 6) Testing checklist
- Sign up and create a `profiles` row with `id = auth.uid()`.
- As a host, create a property. Verify anonymous user can `SELECT` properties.
- Upload an image using the `get-upload-url` function.
- Create a booking via `create-payment-intent` flow (not included here) and then mark booking `confirmed` to trigger revenue update and the worker email.

## 8) Test scripts (local)

There are helper test scripts under `scripts/test-functions/`:

- PowerShell examples:
  - `scripts/test-functions/ask-gaya.ps1`
  - `scripts/test-functions/create-payment-intent.ps1`

- curl/bash examples (for macOS/Linux or WSL):
  - `scripts/test-functions/ask-gaya.sh`
  - `scripts/test-functions/create-payment-intent.sh`

Usage (PowerShell):

```powershell
# Run, then paste the function URL and an authenticated user token when prompted
.\scripts\test-functions\create-payment-intent.ps1
```

Usage (bash):

```bash
export FUNCTION_URL="https://<project>.functions.supabase.co/create-payment-intent"
export BEARER_TOKEN="<user_access_token>"
./scripts/test-functions/create-payment-intent.sh
```

Replace `<user_access_token>` with a logged-in user's access token (from `supabase.auth.session()` or from the browser). The scripts expect the function URL and token to be provided.

## 9) Set function secrets via CLI (optional)

There's a helper PowerShell script `scripts/set-supabase-secrets.ps1` which prompts you for values and runs:

```powershell
npx supabase secrets set SUPABASE_SERVICE_ROLE_KEY="<service-role-key>" GEMINI_API_KEY="<gemini-key>" STRIPE_SECRET="<stripe-secret>" --project-ref <project-ref>
```

You can also set these in the Dashboard → Functions → Settings.

## 7) Notes & next steps
- You can scaffold additional Edge Functions: `ask-gaya` (Gemini proxy) and `create-payment-intent` (Stripe). Example skeletons exist in project history and can be added on request.
- For production uploads, consider issuing pre-signed PUT URLs instead of sending base64 payloads.
