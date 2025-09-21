using Hangfire.Annotations;
using Hangfire.Dashboard;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Stocker.Infrastructure.BackgroundJobs;

public class HangfireJwtAuthorizationFilter : IDashboardAuthorizationFilter
{
    private readonly string _jwtSecret;
    private readonly string _jwtIssuer;
    private readonly string _jwtAudience;

    public HangfireJwtAuthorizationFilter(string jwtSecret, string jwtIssuer, string jwtAudience)
    {
        _jwtSecret = jwtSecret;
        _jwtIssuer = jwtIssuer;
        _jwtAudience = jwtAudience;
    }

    public bool Authorize([NotNull] DashboardContext context)
    {
        var httpContext = context.GetHttpContext();
        var path = httpContext.Request.Path.ToString().ToLower();

        // Allow static resources without authentication
        // Hangfire serves CSS and JS with specific numeric patterns in the URL
        if (path.Contains("css") || path.Contains("js") || 
            path.Contains("font") || path.EndsWith(".css") || 
            path.EndsWith(".js") || path.EndsWith(".woff") || 
            path.EndsWith(".woff2") || path.EndsWith(".ttf") ||
            System.Text.RegularExpressions.Regex.IsMatch(path, @"css\d+") ||
            System.Text.RegularExpressions.Regex.IsMatch(path, @"js\d+"))
        {
            return true; // Allow static resources without authentication
        }

        // Store token in session for subsequent AJAX calls
        var token = GetJwtToken(httpContext);
        if (!string.IsNullOrEmpty(token) && httpContext.Session != null)
        {
            try 
            {
                httpContext.Session.SetString("HangfireToken", token);
            }
            catch 
            {
                // Session might not be available
            }
        }

        // Allow Hangfire API endpoints (stats, recurring jobs, etc.) if user is already authenticated
        // These are called via AJAX from the dashboard
        if (path.Contains("/hangfire/stats") || 
            path.Contains("/hangfire/recurring") ||
            path.Contains("/hangfire/servers") ||
            path.Contains("/hangfire/jobs") ||
            path.Contains("/hangfire/api"))
        {
            // First check session for stored token
            string sessionToken = null;
            try
            {
                sessionToken = httpContext.Session?.GetString("HangfireToken");
            }
            catch
            {
                // Session might not be available
            }

            if (!string.IsNullOrEmpty(sessionToken) && ValidateToken(sessionToken))
            {
                return true;
            }

            // Check if we have a valid token in the referrer's query string
            var referer = httpContext.Request.Headers["Referer"].ToString();
            if (!string.IsNullOrEmpty(referer) && referer.Contains("access_token="))
            {
                // Extract token from referrer URL
                var tokenMatch = System.Text.RegularExpressions.Regex.Match(referer, @"access_token=([^&]+)");
                if (tokenMatch.Success)
                {
                    var refererToken = System.Net.WebUtility.UrlDecode(tokenMatch.Groups[1].Value);
                    if (ValidateToken(refererToken))
                    {
                        return true;
                    }
                }
            }

            // Also try to get token directly
            if (!string.IsNullOrEmpty(token) && ValidateToken(token))
            {
                return true;
            }
        }

        // Check environment
        var environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Production";
        var isDevelopment = environment == "Development";

        // First check if already authenticated via normal authentication
        if (httpContext.User.Identity?.IsAuthenticated == true)
        {
            return CheckRoles(httpContext.User);
        }

        // Try to get JWT token from various sources (already retrieved above)
        if (string.IsNullOrEmpty(token))
        {
            // In development, allow access from localhost without authentication
            if (isDevelopment && 
                (httpContext.Request.Host.Host == "localhost" || 
                 httpContext.Request.Host.Host == "127.0.0.1"))
            {
                return true;
            }
            return false;
        }

        // Validate JWT token
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
            return CheckRoles(principal);
        }
        catch
        {
            return false;
        }
    }

    private string GetJwtToken(HttpContext httpContext)
    {
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

        // Try to get token from query string (for iframe access)
        if (httpContext.Request.Query.TryGetValue("access_token", out var queryToken))
        {
            return queryToken.FirstOrDefault();
        }

        return null;
    }

    private bool CheckRoles(ClaimsPrincipal user)
    {
        if (user == null || !user.Identity?.IsAuthenticated == true)
        {
            return false;
        }

        // Check for required role - only SistemYoneticisi
        var hasRequiredRole = user.IsInRole("SistemYoneticisi");

        // Also check for role claims in JWT
        if (!hasRequiredRole)
        {
            var roleClaims = user.Claims.Where(c => c.Type == ClaimTypes.Role || c.Type == "role");
            hasRequiredRole = roleClaims.Any(c => c.Value == "SistemYoneticisi");
        }

        return hasRequiredRole;
    }

    private bool ValidateToken(string token)
    {
        if (string.IsNullOrEmpty(token))
        {
            return false;
        }

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
            return CheckRoles(principal);
        }
        catch
        {
            return false;
        }
    }
}