Param()

$FUNCTION_URL = Read-Host "ask-gaya function URL (e.g. https://<project>.functions.supabase.co/ask-gaya)"
$BEARER_TOKEN = Read-Host "User access token (Bearer)" -AsSecureString
$token = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($BEARER_TOKEN))

$body = @{ user_id = "<user-uuid>"; message = "Hello Gaya" } | ConvertTo-Json

Invoke-RestMethod -Uri $FUNCTION_URL -Method Post -Headers @{ Authorization = "Bearer $token"; 'Content-Type' = 'application/json' } -Body $body | ConvertTo-Json -Depth 10
