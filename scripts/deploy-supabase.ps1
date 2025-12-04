<#
deploy-supabase.ps1
Automates local supabase CLI install (dev) and function deployment for the `get-upload-url` function.

Note: This script does NOT store secrets. It uses the project ref from your Supabase dashboard.
Replace or set environment variables (SUPABASE_SERVICE_ROLE_KEY, GEMINI_API_KEY, STRIPE_SECRET) via the Supabase dashboard or CLI secrets.
#>

param(
  [string]$ProjectRef = 'gqtjwjbpxmnwnrqzybcw'
)

Write-Host "Using Supabase project ref: $ProjectRef"

# 1) Ensure local supabase is installed as a devDependency
Write-Host "Installing supabase CLI locally (devDependency)..."
npm install --save-dev supabase
if ($LASTEXITCODE -ne 0) { Write-Error "npm install failed (exit $LASTEXITCODE)"; exit $LASTEXITCODE }

Write-Host "Linking repository to Supabase project..."
# Link the project; this will create .supabase/config.toml in the repo
npx supabase link --project-ref $ProjectRef
if ($LASTEXITCODE -ne 0) { Write-Error "supabase link failed (exit $LASTEXITCODE). Ensure you are logged in (run 'npx supabase login')."; exit $LASTEXITCODE }

Write-Host "Deploying function: get-upload-url"
# Check Docker is available (Supabase CLI uses Docker to build functions)
Write-Host "Checking Docker availability..."
docker info > $null 2>&1
if ($LASTEXITCODE -ne 0) {
  Write-Error "Docker is not running or not installed. Start Docker Desktop and retry."; exit 1
}

Write-Host "Deploying function: get-upload-url"
npx supabase functions deploy get-upload-url --project-ref $ProjectRef
if ($LASTEXITCODE -ne 0) { Write-Error "Function deploy failed (exit $LASTEXITCODE)"; exit $LASTEXITCODE }

Write-Host "Deployment complete. You can describe the function to get its URL:";
Write-Host "  npx supabase functions describe get-upload-url --project-ref $ProjectRef"

Write-Host "Reminder: set secrets with 'npx supabase secrets set NAME='value' --project-ref $ProjectRef' or via the Supabase dashboard."

Write-Host "Done."
