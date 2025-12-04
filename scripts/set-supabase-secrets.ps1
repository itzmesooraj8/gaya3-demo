Param()

Write-Host "This script sets Supabase Function secrets using the local Supabase CLI (npx)."
Write-Host "You'll be prompted to enter values. Replace <project-ref> with your project ref."

$projectRef = Read-Host "Supabase project ref (e.g. gqtjwjbpxmnwnrqzybcw)"
$serviceKey = Read-Host "SUPABASE_SERVICE_ROLE_KEY (paste the service role key)"
$gemini = Read-Host "GEMINI_API_KEY (paste)"
$stripe = Read-Host "STRIPE_SECRET (paste)"

Write-Host "Setting secrets using npx supabase. This requires you to be logged in (npx supabase login)."

npx supabase secrets set SUPABASE_SERVICE_ROLE_KEY="$serviceKey" GEMINI_API_KEY="$gemini" STRIPE_SECRET="$stripe" --project-ref $projectRef

Write-Host "Note: You can also set these via the Supabase Dashboard → Functions → Settings → Environment Variables."
