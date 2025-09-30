using Microsoft.AspNetCore.Http;
using System.Security.Claims;

namespace Stocker.IntegrationTests.Common;

public class TestAuthenticationMiddleware
{
    private readonly RequestDelegate _next;

    public TestAuthenticationMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        if (context.Request.Headers.ContainsKey("Authorization"))
        {
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, "test-user-id"),
                new Claim(ClaimTypes.Name, "Test User"),
                new Claim(ClaimTypes.Email, "test@example.com"),
                new Claim("TenantId", "test-tenant-id"),
                new Claim(ClaimTypes.Role, "Admin")
            };

            var identity = new ClaimsIdentity(claims, "Test");
            var principal = new ClaimsPrincipal(identity);
            context.User = principal;
        }

        await _next(context);
    }
}