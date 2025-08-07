using Stocker.SharedKernel.Primitives;
using System.Security.Cryptography;

namespace Stocker.Domain.Master.ValueObjects;

public sealed class RefreshToken : ValueObject
{
    public string Token { get; }
    public DateTime ExpiresAt { get; }
    public DateTime CreatedAt { get; }
    public string? DeviceInfo { get; }
    public string? IpAddress { get; }

    private RefreshToken(string token, DateTime expiresAt, DateTime createdAt, string? deviceInfo, string? ipAddress)
    {
        Token = token;
        ExpiresAt = expiresAt;
        CreatedAt = createdAt;
        DeviceInfo = deviceInfo;
        IpAddress = ipAddress;
    }

    public static RefreshToken Create(int expirationDays = 30, string? deviceInfo = null, string? ipAddress = null)
    {
        if (expirationDays <= 0)
        {
            throw new ArgumentException("Expiration days must be greater than zero.", nameof(expirationDays));
        }

        var token = GenerateToken();
        var now = DateTime.UtcNow;
        var expiresAt = now.AddDays(expirationDays);

        return new RefreshToken(token, expiresAt, now, deviceInfo, ipAddress);
    }

    public static RefreshToken Create(string token, DateTime expiresAt, string? deviceInfo = null, string? ipAddress = null)
    {
        if (string.IsNullOrWhiteSpace(token))
        {
            throw new ArgumentException("Token cannot be empty.", nameof(token));
        }

        if (expiresAt <= DateTime.UtcNow)
        {
            throw new ArgumentException("Expiry date must be in the future.", nameof(expiresAt));
        }

        return new RefreshToken(token, expiresAt, DateTime.UtcNow, deviceInfo, ipAddress);
    }

    public bool IsExpired() => DateTime.UtcNow > ExpiresAt;

    public bool IsValid() => !IsExpired();

    private static string GenerateToken()
    {
        var randomBytes = new byte[64];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomBytes);
        return Convert.ToBase64String(randomBytes)
            .Replace("+", "-")
            .Replace("/", "_")
            .Replace("=", "");
    }

    public override IEnumerable<object> GetEqualityComponents()
    {
        yield return Token;
        yield return ExpiresAt;
        yield return CreatedAt;
        yield return DeviceInfo ?? string.Empty;
        yield return IpAddress ?? string.Empty;
    }
}