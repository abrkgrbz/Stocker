#!/bin/bash

echo "DNS Records Check for stoocker.app"
echo "===================================="
echo ""

echo "Main domain (stoocker.app):"
nslookup stoocker.app
echo ""

echo "WWW subdomain (www.stoocker.app):"
nslookup www.stoocker.app
echo ""

echo "API subdomain (api.stoocker.app):"
nslookup api.stoocker.app
echo ""

echo "Expected IP: 95.217.219.4"
echo ""

echo "Current services:"
echo "- API: http://95.217.219.4:5000"
echo "- Frontend: http://95.217.219.4:3000"