using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Text;

namespace Stocker.Infrastructure.Middleware;

public class HangfireAuthMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<HangfireAuthMiddleware> _logger;
    private readonly string _jwtSecret;
    private readonly string _jwtIssuer;
    private readonly string _jwtAudience;

    public HangfireAuthMiddleware(
        RequestDelegate next,
        ILogger<HangfireAuthMiddleware> logger,
        string jwtSecret,
        string jwtIssuer = "Stocker",
        string jwtAudience = "Stocker")
    {
        _next = next;
        _logger = logger;
        _jwtSecret = jwtSecret;
        _jwtIssuer = jwtIssuer;
        _jwtAudience = jwtAudience;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var path = context.Request.Path.ToString().ToLower();

        // Only process Hangfire requests
        if (!path.StartsWith("/hangfire"))
        {
            await _next(context);
            return;
        }

        // Allow static resources (CSS, JS) without authentication
        // Hangfire generates resource URLs with numeric patterns like css18210556519183
        if (path.Contains("css") || path.Contains("js") || path.Contains("font") || 
            path.EndsWith(".css") || path.EndsWith(".js") || path.EndsWith(".woff") || 
            path.EndsWith(".woff2") || path.EndsWith(".ttf") ||
            System.Text.RegularExpressions.Regex.IsMatch(path, @"css\d+") ||
            System.Text.RegularExpressions.Regex.IsMatch(path, @"js\d+"))
        {
            // Set proper MIME types for static resources
            if (path.Contains("css"))
            {
                context.Response.ContentType = "text/css; charset=utf-8";
            }
            else if (path.Contains("js"))
            {
                context.Response.ContentType = "application/javascript; charset=utf-8";
            }
            else if (path.Contains("font") || path.EndsWith(".woff") || path.EndsWith(".woff2"))
            {
                context.Response.ContentType = "font/woff2";
            }
            
            // Skip authentication for static resources but pass through
            await _next(context);
            return;
        }

        // For non-static resources, validate JWT token
        var token = GetJwtToken(context);
        if (!string.IsNullOrEmpty(token))
        {
            try
            {
                var tokenHandler = new JwtSecurityTokenHandler();
                var validationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSecret)),
                    ValidateIssuer = true,
                    ValidIssuer = _jwtIssuer,
                    ValidateAudience = true,
                    ValidAudience = _jwtAudience,
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero
                };

                var principal = tokenHandler.ValidateToken(token, validationParameters, out _);
                
                // Check for SistemYoneticisi role
                var hasRequiredRole = principal.IsInRole("SistemYoneticisi") ||
                    principal.Claims.Any(c => (c.Type == "role" || c.Type == System.Security.Claims.ClaimTypes.Role) 
                        && c.Value == "SistemYoneticisi");

                if (hasRequiredRole)
                {
                    // Set user context for downstream middleware
                    context.User = principal;
                    
                    // Add token to Authorization header for Hangfire to pick up
                    if (!context.Request.Headers.ContainsKey("Authorization"))
                    {
                        context.Request.Headers.Append("Authorization", $"Bearer {token}");
                    }
                }
                else
                {
                    _logger.LogWarning("User does not have SistemYoneticisi role for Hangfire access");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating JWT token for Hangfire");
            }
        }

        await _next(context);
    }

    private string GetJwtToken(HttpContext httpContext)
    {
        // Try to get token from query string (for iframe access)
        if (httpContext.Request.Query.TryGetValue("access_token", out var queryToken))
        {
            var token = queryToken.FirstOrDefault();
            if (!string.IsNullOrEmpty(token))
            {
                return token;
            }
        }

        // Try to get token from Authorization header
        var authHeader = httpContext.Request.Headers["Authorization"].FirstOrDefault();
        if (!string.IsNullOrEmpty(authHeader) && authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
        {
            return authHeader.Substring("Bearer ".Length).Trim();
        }

        // Try to get token from cookie
        if (httpContext.Request.Cookies.TryGetValue("Authorization", out var cookieToken))
        {
            if (cookieToken.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
            {
                return cookieToken.Substring("Bearer ".Length).Trim();
            }
            return cookieToken;
        }

        return null;
    }
}