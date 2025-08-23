# Coolify Frontend Service Configuration

## Environment Variables for Frontend Service:

```env
# Domain Configuration
COOLIFY_URL=https://stoocker.app
COOLIFY_BRANCH=master

# SSL Configuration  
COOLIFY_SSL_TYPE=letsencrypt
COOLIFY_AUTO_SSL=true
COOLIFY_FORCE_SSL=true

# Traefik Labels (if needed manually)
traefik.enable=true
traefik.http.routers.frontend.rule=Host(`stoocker.app`)
traefik.http.routers.frontend.tls=true
traefik.http.routers.frontend.tls.certresolver=letsencrypt
traefik.http.services.frontend.loadbalancer.server.port=80
```

## Steps to Fix SSL:

1. **In Coolify Dashboard:**
   - Go to Frontend service
   - Click on "Environment Variables" 
   - Add the variables above

2. **Domain Settings:**
   - Domain field: `stoocker.app` (without https://)
   - SSL: Let's Encrypt
   - Force HTTPS: Yes

3. **Redeploy:**
   - Save settings
   - Click "Redeploy"
   - Wait 2-3 minutes for Let's Encrypt certificate

## If Still Not Working:

1. **Check Coolify Proxy (Traefik):**
   ```bash
   docker ps | grep traefik
   docker logs coolify-proxy
   ```

2. **Check DNS Propagation:**
   - Use https://dnschecker.org
   - Verify stoocker.app points to 95.217.219.4

3. **Clear Browser Cache:**
   - Hard refresh: Ctrl+Shift+R
   - Or try incognito mode

## Testing:
After certificate is issued, test with:
- https://stoocker.app (should work)
- https://www.ssllabs.com/ssltest/analyze.html?d=stoocker.app