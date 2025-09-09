# Coolify Deployment Guide - SSL for Subdomains

## Problem
Tenant subdomains (like `techstart.stoocker.app`) need SSL certificates automatically.

## Solution without CloudFlare

### Option 1: Using Coolify's Built-in Features (Recommended)

1. **Deploy Main Web Application**
   - In Coolify, create a new application
   - Use `02-web.yml` for deployment
   - Set domain: `stoocker.app,www.stoocker.app`
   - Enable "Generate SSL Certificate" ✅
   - Coolify will auto-generate Let's Encrypt SSL

2. **Add Dynamic Subdomains**
   - In the same application settings
   - Go to "Domains" section
   - Add multiple domains separated by comma:
     ```
     stoocker.app,
     www.stoocker.app,
     demo.stoocker.app,
     techstart.stoocker.app,
     test.stoocker.app
     ```
   - Coolify will generate SSL for each domain automatically
   - No wildcard needed!

3. **For New Tenants**
   - When a new tenant registers (e.g., `newcompany`)
   - Add `newcompany.stoocker.app` to the domains list
   - Coolify auto-generates SSL within minutes

### Option 2: Using Coolify's Proxy Settings

1. **Enable Wildcard in Coolify Settings**
   ```yaml
   # In Coolify UI > Settings > Proxy
   - Enable: "Wildcard SSL"
   - Domain: "*.stoocker.app"
   - Email: "info@stoocker.app"
   ```

2. **Configure Application**
   - In your application settings:
   - Enable "Wildcard Domain"
   - Base domain: `stoocker.app`
   - Coolify will handle all subdomains

### Option 3: Manual Traefik Configuration in Coolify

1. **Access Coolify's Traefik**
   - SSH to your server
   - Edit `/data/coolify/proxy/dynamic.yaml`

2. **Add Wildcard Router**
   ```yaml
   http:
     routers:
       stocker-wildcard:
         rule: "HostRegexp(`{subdomain:[a-z0-9-]+}.stoocker.app`)"
         service: stocker-web
         tls:
           certResolver: letsencrypt
     services:
       stocker-web:
         loadBalancer:
           servers:
             - url: "http://stocker-web:3000"
   ```

3. **Restart Coolify Proxy**
   ```bash
   docker restart coolify-proxy
   ```

## Recommended Approach for Your Case

Since you don't have CloudFlare and using Coolify:

1. **Start with known subdomains**
   - Add known tenant subdomains manually in Coolify
   - Each gets its own SSL automatically

2. **Automate for new tenants**
   - Create a webhook/API that adds new domain to Coolify when tenant registers
   - Use Coolify API:
   ```bash
   curl -X POST https://your-coolify-instance/api/v1/applications/{app-id}/domains \
     -H "Authorization: Bearer YOUR_COOLIFY_TOKEN" \
     -d '{"domain": "newtenant.stoocker.app"}'
   ```

3. **Alternative: Use Single Domain with Path-based Routing**
   - Instead of `tenant.stoocker.app`
   - Use `stoocker.app/t/tenant`
   - No subdomain SSL issues
   - Modify your frontend routing to handle this

## Environment Variables for Coolify

Create these in Coolify UI for your application:

```env
# API Configuration
VITE_API_URL=https://api.stoocker.app
VITE_APP_URL=https://stoocker.app

# Feature Flags
VITE_ENABLE_MULTI_TENANT=true
VITE_ENABLE_SUBDOMAIN_ROUTING=true

# SSL Configuration (Coolify handles this)
FORCE_SSL=true
SSL_REDIRECT=true
```

## Testing SSL

After deployment, test each subdomain:
```bash
# Check SSL certificate
curl -vI https://demo.stoocker.app
curl -vI https://techstart.stoocker.app

# Check certificate details
echo | openssl s_client -showcerts -servername demo.stoocker.app -connect demo.stoocker.app:443 2>/dev/null | openssl x509 -inform pem -noout -text
```

## Important Notes

1. **Rate Limits**: Let's Encrypt has rate limits (50 certificates per week per domain)
2. **DNS**: Make sure all subdomains point to your Coolify server IP
3. **Propagation**: New DNS entries take 5-30 minutes to propagate
4. **Coolify Version**: Ensure you're using Coolify v4+ for best subdomain support

## Quick Fix for Current Issue

For immediate fix of `techstart.stoocker.app`:

1. Go to Coolify Dashboard
2. Find your web application
3. Click Settings → Domains
4. Add: `techstart.stoocker.app`
5. Click Save
6. Wait 1-2 minutes for SSL generation
7. Test: https://techstart.stoocker.app

The SSL certificate will be generated automatically!