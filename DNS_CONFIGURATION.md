# DNS Configuration for stoocker.app

## Required DNS Records

Add these DNS records to your domain provider (where you registered stoocker.app):

### A Records (Point to your server IP: 95.217.219.4)

| Type | Name | Value | TTL |
|------|------|--------|-----|
| A | @ | 95.217.219.4 | 3600 |
| A | www | 95.217.219.4 | 3600 |
| A | api | 95.217.219.4 | 3600 |
| A | * | 95.217.219.4 | 3600 |

### Alternative: CNAME Records (if using subdomain routing)

| Type | Name | Target | TTL |
|------|------|---------|-----|
| CNAME | www | stoocker.app | 3600 |
| CNAME | api | stoocker.app | 3600 |

## How to Add DNS Records

### For Popular Domain Providers:

#### Namecheap
1. Log in to Namecheap
2. Go to Domain List → Manage
3. Click on "Advanced DNS"
4. Add the A records above

#### GoDaddy
1. Log in to GoDaddy
2. Go to My Products → DNS
3. Click "Add" and select record type
4. Add the A records above

#### Cloudflare
1. Log in to Cloudflare
2. Select your domain
3. Go to DNS tab
4. Add the A records above
5. Set Proxy status to "DNS only" (grey cloud) initially

## Verify DNS Configuration

After adding records, verify them:

```bash
# Check A record for main domain
nslookup stoocker.app

# Check API subdomain
nslookup api.stoocker.app

# Check www subdomain
nslookup www.stoocker.app
```

Expected result: All should resolve to 95.217.219.4

## DNS Propagation

- DNS changes can take 1-48 hours to propagate globally
- Usually takes 5-30 minutes for most providers
- Check propagation status at: https://www.whatsmydns.net/

## Coolify Configuration

Once DNS is configured:

1. In Coolify, add domains without http:// or https://
2. For API service: `api.stoocker.app`
3. For Frontend: `stoocker.app,www.stoocker.app`
4. Coolify will automatically handle SSL certificates via Let's Encrypt