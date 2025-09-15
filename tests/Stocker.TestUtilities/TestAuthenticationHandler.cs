using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System.Security.Claims;
using System.Text.Encodings.Web;

namespace Stocker.TestUtilities;

public class TestAuthenticationHandler : AuthenticationHandler<AuthenticationSchemeOptions>
{
    public const string SchemeName = "Test";
    
    public TestAuthenticationHandler(IOptionsMonitor<AuthenticationSchemeOptions> options,
        ILoggerFactory logger, UrlEncoder encoder)
        : base(options, logger, encoder)
    {
    }

    protected override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        // Check if there's a test authorization header
        if (Context.Request.Headers.ContainsKey("Authorization"))
        {
            var authHeader = Context.Request.Headers["Authorization"].ToString();
            
            if (authHeader.StartsWith("Bearer test-token-"))
            {
                // Extract info from test token
                var tokenParts = authHeader.Replace("Bearer test-token-", "").Split('-');
                var email = tokenParts.Length > 0 ? tokenParts[0] : "test@test.com";
                var role = tokenParts.Length > 1 ? tokenParts[1] : "User";
                
                var claims = new[]
                {
                    new Claim(ClaimTypes.Name, email),
                    new Claim(ClaimTypes.Email, email),
                    new Claim(ClaimTypes.Role, role),
                    new Claim("TenantId", Guid.NewGuid().ToString()),
                    new Claim("UserId", Guid.NewGuid().ToString())
                };

                var identity = new ClaimsIdentity(claims, SchemeName);
                var principal = new ClaimsPrincipal(identity);
                var ticket = new AuthenticationTicket(principal, SchemeName);

                return Task.FromResult(AuthenticateResult.Success(ticket));
            }
        }
        
        // No authentication header - return no result (not a failure)
        return Task.FromResult(AuthenticateResult.NoResult());
    }
}