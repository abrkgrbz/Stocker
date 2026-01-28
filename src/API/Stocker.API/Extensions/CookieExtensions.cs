namespace Stocker.API.Extensions;

/// <summary>
/// Extension methods for cookie management with environment-aware settings
/// </summary>
public static class CookieExtensions
{
    /// <summary>
    /// Gets cookie options based on current environment (Development vs Production)
    /// </summary>
    public static CookieOptions GetAuthCookieOptions(this HttpResponse response, DateTimeOffset? expires = null)
    {
        var isDevelopment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == "Development";

        return new CookieOptions
        {
            HttpOnly = true,
            Secure = !isDevelopment, // HTTP for localhost, HTTPS for production
            SameSite = isDevelopment ? SameSiteMode.Lax : SameSiteMode.None,
            Domain = isDevelopment ? null : ".stoocker.app", // null = current domain for localhost
            Path = "/",
            Expires = expires
        };
    }

    /// <summary>
    /// Sets authentication cookies (access_token and refresh_token) with environment-aware settings
    /// </summary>
    public static void SetAuthCookies(this HttpResponse response, string accessToken, string refreshToken, DateTimeOffset accessTokenExpires)
    {
        var accessOptions = response.GetAuthCookieOptions(accessTokenExpires);
        var refreshOptions = response.GetAuthCookieOptions(DateTimeOffset.UtcNow.AddDays(7));

        response.Cookies.Append("access_token", accessToken, accessOptions);
        response.Cookies.Append("refresh_token", refreshToken, refreshOptions);
    }

    /// <summary>
    /// Clears all authentication cookies with environment-aware settings
    /// </summary>
    public static void ClearAuthCookies(this HttpResponse response)
    {
        var options = response.GetAuthCookieOptions();

        response.Cookies.Delete("access_token", options);
        response.Cookies.Delete("refresh_token", options);
        response.Cookies.Delete("auth-token", options);
    }
}
