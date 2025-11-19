using Stocker.SharedKernel.Primitives;

namespace Stocker.Domain.Master.ValueObjects;

public sealed class EmailVerificationToken : ValueObject
{
    public string Token { get; private set; }
    public string OtpCode { get; private set; }
    public DateTime ExpiresAt { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public bool IsUsed { get; private set; }
    public DateTime? UsedAt { get; private set; }

    // Parameterless constructor for EF Core
    private EmailVerificationToken()
    {
        Token = string.Empty;
        OtpCode = string.Empty;
    }

    private EmailVerificationToken(string token, string otpCode, DateTime expiresAt)
    {
        Token = token;
        OtpCode = otpCode;
        ExpiresAt = expiresAt;
        CreatedAt = DateTime.UtcNow;
        IsUsed = false;
    }

    public static EmailVerificationToken Create(int expirationHours = 24)
    {
        var token = GenerateToken();
        var otpCode = GenerateOtpCode();
        var expiresAt = DateTime.UtcNow.AddHours(expirationHours);
        return new EmailVerificationToken(token, otpCode, expiresAt);
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

    private static string GenerateOtpCode()
    {
        // Use cryptographically secure random number generator
        using var rng = System.Security.Cryptography.RandomNumberGenerator.Create();
        var bytes = new byte[4];
        rng.GetBytes(bytes);
        var number = BitConverter.ToUInt32(bytes, 0);
        // Generate 6-digit code between 100000-999999
        var code = (number % 900000) + 100000;
        return code.ToString();
    }

    public override IEnumerable<object> GetEqualityComponents()
    {
        yield return Token;
        yield return OtpCode;
    }
}