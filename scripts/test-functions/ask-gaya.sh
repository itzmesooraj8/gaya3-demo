#!/usr/bin/env bash
# Test script for ask-gaya function (curl)
# Usage: export FUNCTION_URL=...; export BEARER_TOKEN=...; ./ask-gaya.sh

if [ -z "$FUNCTION_URL" ] || [ -z "$BEARER_TOKEN" ]; then
  echo "Please set FUNCTION_URL and BEARER_TOKEN environment variables."
  exit 1
fi

curl -s -X POST "$FUNCTION_URL" \
  -H "Authorization: Bearer $BEARER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"user_id":"<user-uuid>","message":"Hello Gaya"}' | jq .
