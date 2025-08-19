using Stocker.SharedKernel.Primitives;

namespace Stocker.Domain.Master.ValueObjects;

public sealed class EmailVerificationToken : ValueObject
{
    public string Token { get; }
    public DateTime ExpiresAt { get; }
    public DateTime CreatedAt { get; }
    public bool IsUsed { get; private set; }
    public DateTime? UsedAt { get; private set; }

    private EmailVerificationToken(string token, DateTime expiresAt)
    {
        Token = token;
        ExpiresAt = expiresAt;
        CreatedAt = DateTime.UtcNow;
        IsUsed = false;
    }

    public static EmailVerificationToken Create(int expirationHours = 24)
    {
        var token = GenerateToken();
        var expiresAt = DateTime.UtcNow.AddHours(expirationHours);
        return new EmailVerificationToken(token, expiresAt);
    }

    public bool IsValid()
    {
        return !IsUsed && ExpiresAt > DateTime.UtcNow;
    }

    public void MarkAsUsed()
    {
        if (IsUsed)
        {
            throw new InvalidOperationException("Token has already been used.");
        }

        IsUsed = true;
        UsedAt = DateTime.UtcNow;
    }

    private static string GenerateToken()
    {
        // Generate a secure random token
        var bytes = new byte[32];
        using (var rng = System.Security.Cryptography.RandomNumberGenerator.Create())
        {
            rng.GetBytes(bytes);
        }
        return Convert.ToBase64String(bytes)
            .Replace("+", "-")
            .Replace("/", "_")
            .TrimEnd('=');
    }

    public override IEnumerable<object> GetEqualityComponents()
    {
        yield return Token;
    }
}