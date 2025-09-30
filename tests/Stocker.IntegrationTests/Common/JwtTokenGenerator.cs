using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Stocker.IntegrationTests.Common;

public static class JwtTokenGenerator
{
    private const string SecretKey = "ThisIsAVeryLongSecretKeyForTestingPurposesOnly123456789!@#$%^&*()";
    private const string Issuer = "Stocker.Test";
    private const string Audience = "Stocker.Test.Client";

    public static string GenerateToken(
        string userId = "test-user-id",
        string username = "testuser",
        string email = "test@example.com",
        string tenantId = "test-tenant-id",
        string role = "SistemYoneticisi")
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(SecretKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, userId),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim(JwtRegisteredClaimNames.UniqueName, username),
            new Claim(JwtRegisteredClaimNames.Email, email),
            new Claim("TenantId", tenantId),
            new Claim(ClaimTypes.Role, role),
            new Claim(ClaimTypes.NameIdentifier, userId),
            new Claim(ClaimTypes.Name, username)
        };

        var token = new JwtSecurityToken(
            issuer: Issuer,
            audience: Audience,
            claims: claims,
            expires: DateTime.UtcNow.AddHours(1),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}