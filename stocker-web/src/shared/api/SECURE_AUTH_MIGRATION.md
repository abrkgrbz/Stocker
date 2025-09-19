# Secure Authentication Migration Guide

## Overview
This guide explains the migration from localStorage-based token storage to secure httpOnly cookie-based authentication.

## Security Improvements

### Before (Vulnerable)
```javascript
// Tokens stored in localStorage - vulnerable to XSS attacks
localStorage.setItem('stocker_token', accessToken);
localStorage.setItem('stocker_refresh_token', refreshToken);
```

### After (Secure)
```javascript
// Tokens stored in httpOnly cookies (set by backend)
// Frontend only keeps tokens in memory via tokenService
tokenService.setTokens(accessToken, refreshToken);
```

## Migration Steps

### 1. Backend Requirements
The backend must be updated to:
- Set tokens as httpOnly cookies on login
- Read tokens from cookies instead of Authorization header only
- Clear cookies on logout
- Implement `/api/auth/session` endpoint for session validation
- Implement `/api/auth/refresh` endpoint using cookie-based refresh token
- Implement `/api/auth/migrate-tokens` for gradual migration

### 2. Frontend Migration

#### Step 1: Use Secure Services
```javascript
// Old way
import { useAuthStore } from '@/app/store/auth.store';
import { apiClient } from '@/shared/api/client';

// New way
import { useSecureAuthStore } from '@/app/store/secureAuth.store';
import { secureApiClient } from '@/shared/api/secureClient';
```

#### Step 2: Update Components
```javascript
// Old way
const { user, isAuthenticated, login } = useAuthStore();

// New way
const { user, isAuthenticated, login } = useSecureAuthStore();
```

#### Step 3: API Calls
```javascript
// Old way
const response = await apiClient.get('/api/data');

// New way  
const response = await secureApiClient.get('/api/data');
```

## Implementation Timeline

### Phase 1: Preparation (Current)
✅ Create tokenService.ts
✅ Create secureAuth.store.ts
✅ Create secureClient.ts
✅ Implement migration helper

### Phase 2: Backend Updates (Next)
- [ ] Update login endpoint to set httpOnly cookies
- [ ] Update auth middleware to read from cookies
- [ ] Add session validation endpoint
- [ ] Add secure refresh endpoint
- [ ] Add token migration endpoint

### Phase 3: Gradual Migration
- [ ] Deploy backend changes
- [ ] Enable migration helper on frontend
- [ ] Monitor for issues
- [ ] Update all components to use secure services

### Phase 4: Cleanup
- [ ] Remove old auth.store.ts
- [ ] Remove old client.ts
- [ ] Remove all localStorage token references
- [ ] Security audit

## Security Benefits

1. **XSS Protection**: Tokens in httpOnly cookies cannot be accessed by JavaScript
2. **CSRF Protection**: Use SameSite cookie attribute
3. **Secure Flag**: Cookies only sent over HTTPS
4. **No Token Exposure**: Tokens never visible in browser DevTools
5. **Automatic Expiry**: Cookies expire automatically

## Testing Checklist

- [ ] Login sets httpOnly cookies (check Network tab)
- [ ] Subsequent requests include cookies automatically
- [ ] Refresh token works via cookies
- [ ] Logout clears cookies
- [ ] XSS attempts cannot access tokens
- [ ] CSRF protection is active
- [ ] Session persists across browser refresh
- [ ] Migration from localStorage works

## Rollback Plan

If issues arise, the old auth system is preserved:
1. Switch imports back to old services
2. localStorage tokens will still work
3. No data loss during migration

## API Contract

### Login Response
```json
{
  "user": { ... },
  "accessToken": "...", // Still sent for initial storage in memory
  "refreshToken": "..." // Optional, prefer cookie
}
// Plus Set-Cookie headers for httpOnly cookies
```

### Session Check
```
GET /api/auth/session
Cookies: auth-token=...; refresh-token=...

Response:
{
  "valid": true,
  "user": { ... }
}
```

### Token Refresh
```
POST /api/auth/refresh
Cookies: refresh-token=...

Response:
{
  "accessToken": "..." // New access token
}
// Plus Set-Cookie header for new auth-token
```

## Notes

- Non-sensitive data (tenant code, user preferences) can remain in localStorage
- Only authentication tokens should be in httpOnly cookies
- The migration is backward compatible during transition period
- Monitor error rates during migration