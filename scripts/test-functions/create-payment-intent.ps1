Param()

$FUNCTION_URL = Read-Host "create-payment-intent function URL (e.g. https://<project>.functions.supabase.co/create-payment-intent)"
$BEARER_TOKEN = Read-Host "User access token (Bearer)" -AsSecureString
$token = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($BEARER_TOKEN))

$payload = @{ user_id = "<user-uuid>"; property_id = "<property-uuid>"; start_date = "2025-12-10"; end_date = "2025-12-12" } | ConvertTo-Json

Invoke-RestMethod -Uri $FUNCTION_URL -Method Post -Headers @{ Authorization = "Bearer $token"; 'Content-Type' = 'application/json' } -Body $payload | ConvertTo-Json -Depth 10
