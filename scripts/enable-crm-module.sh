#!/bin/bash

# Script to enable CRM module for all packages via API
# This adds CRM module to all existing packages in production

API_URL="https://api.stoocker.app"

# Login and get token
echo "🔐 Logging in to get admin token..."
TOKEN=$(curl -s -X POST "$API_URL/api/master/auth/login" \
  -H "Content-Type: application/json" \
  --data-binary @- << 'LOGINEOF'
{"email":"admin@stoocker.app","password":"Admin123!"}
LOGINEOF
)

TOKEN=$(echo "$TOKEN" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Failed to get admin token. Check credentials."
  exit 1
fi

echo "✅ Token obtained successfully"

echo "🔍 Fetching all packages..."

# Get all packages
PACKAGES=$(curl -s "$API_URL/api/master/packages" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

echo "📦 Packages found"

# For each package, add CRM module
echo "$PACKAGES" | grep -o '"id":"[^"]*' | cut -d'"' -f4 | while read PACKAGE_ID; do
  echo ""
  echo "➕ Adding CRM module to package: $PACKAGE_ID"

  RESULT=$(curl -s -X POST "$API_URL/api/master/packages/$PACKAGE_ID/modules" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    --data-binary @- << 'MODULEEOF'
{"moduleName":"CRM","isIncluded":true,"featureCode":"CRM","featureName":"CRM Modülü"}
MODULEEOF
)

  if echo "$RESULT" | grep -q '"success":true'; then
    echo "✅ Success"
  else
    echo "❌ Failed: $RESULT"
  fi
done

echo ""
echo "✅ CRM module has been added to all packages!"
echo ""
echo "🔄 Note: Tenant module cache will be automatically invalidated."
echo "💡 Users may need to re-login to get new module access."
