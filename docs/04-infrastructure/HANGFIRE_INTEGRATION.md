# Hangfire Dashboard Integration

## Overview
Integrated Hangfire dashboard into Stocker Admin with JWT-based authentication and role-based access control.

## Implementation Details

### 1. Authentication & Authorization

#### JWT Token Flow
- Token passed via query string: `?access_token=<jwt_token>`
- Token stored in secure HTTP-only cookie for AJAX requests
- Cookie name: `HangfireAuthToken`
- Cookie expiry: 1 hour

#### Role Requirements
- Only `SistemYoneticisi` role has access
- No access for `Admin` or `FirmaYoneticisi` roles

### 2. Key Components

#### Backend

**HangfireJwtAuthorizationFilter.cs**
- Custom authorization filter for Hangfire dashboard
- Validates JWT tokens from multiple sources (header, query, cookie)
- Allows static resources without authentication
- Stores token in cookie for AJAX requests

**HangfireAuthMiddleware.cs**
- Middleware for Hangfire-specific authentication
- Sets proper MIME types for static resources
- Validates JWT and checks for SistemYoneticisi role
- Adds token to Authorization header for downstream processing

**SecurityHeadersMiddleware.cs**
- Modified to skip frame-related headers for Hangfire paths
- Allows iframe embedding from admin.stoocker.app

#### Frontend

**HangfireDashboard.tsx**
- React component for Hangfire dashboard access
- Role checking for SistemYoneticisi
- Iframe embedding with token in query string
- Option to open in new tab

### 3. Security Features

#### Content Security Policy (CSP)
- Frame-ancestors policy allows embedding from admin.stoocker.app
- X-Frame-Options header skipped for /hangfire paths

#### Static Resource Access
- CSS/JS files bypass authentication
- Proper MIME types set for all static resources
- Regex pattern matching for Hangfire's numeric resource URLs

#### AJAX Request Authentication
- Cookie-based authentication for stats and API endpoints
- Referer header parsing as fallback
- Token extraction from multiple sources

### 4. Configuration

#### Startup Configuration (Program.cs)
```csharp
// Add Hangfire authentication middleware
app.UseMiddleware<HangfireAuthMiddleware>(jwtSecret, jwtIssuer, jwtAudience);

// Add Hangfire Dashboard
app.UseHangfireDashboard(app.Configuration);
```

#### Dashboard Options
```csharp
new DashboardOptions
{
    DashboardTitle = "Stocker - Background Jobs",
    Authorization = new[] { new HangfireJwtAuthorizationFilter(...) },
    IgnoreAntiforgeryToken = true,
    DisplayStorageConnectionString = false,
    IsReadOnlyFunc = (DashboardContext context) => false
}
```

### 5. Testing

#### Manual Testing Steps
1. Login to Stocker Admin with SistemYoneticisi role
2. Navigate to Hangfire dashboard from menu
3. Verify dashboard loads in iframe
4. Test "Open in New Tab" functionality
5. Verify AJAX stats refresh works

#### PowerShell Test Script
Use `test-hangfire-auth.ps1` to test:
- Initial authentication with token
- Cookie-based API access
- Static resource access

### 6. Troubleshooting

#### Common Issues

**401 Errors for AJAX Requests**
- Solution: Cookie-based authentication implemented
- Token stored in HangfireAuthToken cookie

**CSP Frame-Ancestors Violation**
- Solution: Modified SecurityHeadersMiddleware
- Skips frame headers for /hangfire paths

**Static Resources 401**
- Solution: Bypass authentication for CSS/JS
- Regex pattern matching for numeric resource URLs

**Session Not Configured Error**
- Solution: Removed session usage
- Using cookies directly instead

### 7. Future Improvements

- [ ] Add token refresh mechanism for long sessions
- [ ] Implement WebSocket support for real-time updates
- [ ] Add custom Hangfire job scheduling UI
- [ ] Integrate with Stocker's notification system
- [ ] Add job execution history to audit logs

### 8. Environment Variables

Required environment variables for Hangfire:
- `DB_HOST`: Database server host
- `DB_USER`: Database user
- `DB_PASSWORD`: Database password
- `HANGFIRE_DB_NAME`: Hangfire database name (default: StockerHangfireDb)
- `JwtSettings:Secret`: JWT secret for token validation
- `JwtSettings:Issuer`: JWT issuer (default: Stocker)
- `JwtSettings:Audience`: JWT audience (default: Stocker)

### 9. Deployment Notes

- Hangfire dashboard available at: `/hangfire`
- Accessible from: `https://admin.stoocker.app/hangfire`
- Swagger enabled in production for testing: `ASPNETCORE_SWAGGER_ENABLED=true`
- CORS configured to allow all *.stoocker.app subdomains