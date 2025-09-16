# Traefik CORS Solution for Wildcard Subdomains

## Problem
Traefik's `accesscontrolalloworiginlist` doesn't support wildcard patterns like `https://*.stoocker.app`. This causes CORS errors when accessing the API from dynamic tenant subdomains (e.g., `abg-teknoloji.stoocker.app`).

## Solution
Use `accesscontrolalloworiginlistregex` instead, which supports regular expressions for matching origins.

## Configuration Change

### Before (Not Working)
```yaml
- "traefik.http.middlewares.api-cors.headers.accesscontrolalloworiginlist=https://stoocker.app,https://www.stoocker.app,https://admin.stoocker.app,https://master.stoocker.app,https://*.stoocker.app"
```

### After (Working)
```yaml
# Use regex pattern to match all *.stoocker.app subdomains
- "traefik.http.middlewares.api-cors.headers.accesscontrolalloworiginlistregex=^https://([a-zA-Z0-9-]+\\.)?stoocker\\.app$$"
```

## Regex Pattern Explanation
- `^` - Start of string
- `https://` - Literal https protocol
- `([a-zA-Z0-9-]+\\.)?` - Optional subdomain:
  - `[a-zA-Z0-9-]+` - One or more alphanumeric characters or hyphens
  - `\\.` - Literal dot
  - `?` - Makes the entire subdomain group optional
- `stoocker\\.app` - Literal domain name
- `$$` - End of string (double dollar sign needed in Docker labels)

## Supported Origins
This regex pattern matches:
- `https://stoocker.app` (main domain)
- `https://www.stoocker.app` (www subdomain)
- `https://abg-teknoloji.stoocker.app` (tenant subdomain)
- `https://any-subdomain.stoocker.app` (any subdomain)
- `https://multi-word-subdomain.stoocker.app` (hyphenated subdomains)

## Deployment Steps

1. **Update the Coolify configuration** in `deployment/coolify/applications/01-api.yml`

2. **Commit and push the changes**:
   ```bash
   git add deployment/coolify/applications/01-api.yml
   git commit -m "fix: Use regex pattern for CORS to support wildcard subdomains"
   git push origin master
   ```

3. **Coolify will automatically redeploy** the application with the new configuration

4. **Verify the fix** by testing from a tenant subdomain:
   ```javascript
   // Test from browser console at https://abg-teknoloji.stoocker.app
   fetch('https://api.stoocker.app/api/public/tenants/check/abg-teknoloji')
     .then(response => response.json())
     .then(data => console.log(data))
   ```

## Alternative Solutions

If regex doesn't work or you need more control:

1. **Handle CORS in the application** instead of Traefik
2. **Use a custom middleware** that dynamically sets CORS headers based on the Origin
3. **Implement forward authentication** for complex CORS logic

## References
- [Traefik Headers Middleware Documentation](https://doc.traefik.io/traefik/middlewares/http/headers/)
- [GitHub Issue #6851 - Subdomain wildcard CORS](https://github.com/traefik/traefik/issues/6851)