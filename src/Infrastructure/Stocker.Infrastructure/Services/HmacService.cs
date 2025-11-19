using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;

namespace Stocker.Infrastructure.Services;

public class HmacService : IHmacService
{
    private readonly byte[] _secretKey;
    private readonly ILogger<HmacService> _logger;

    public HmacService(IConfiguration configuration, ILogger<HmacService> logger)
    {
        _logger = logger;

        // Get HMAC secret from configuration (Azure Key Vault or appsettings)
        var secretKeyBase64 = configuration["Security:HmacSecretKey"];

        if (string.IsNullOrEmpty(secretKeyBase64))
        {
            _logger.LogWarning("HMAC Secret Key not configured. Using default development key.");
            _logger.LogWarning("⚠️ IMPORTANT: Configure Security:HmacSecretKey in production!");

            // Development fallback - DO NOT use in production
            secretKeyBase64 = "YojxNKH6zKpCREDa2nniWFCDfpqW1UMqipRi+MsH+kc=";
        }

        try
        {
            _secretKey = Convert.FromBase64String(secretKeyBase64);
            _logger.LogInformation("✅ HMAC Service initialized with {KeySize}-bit key", _secretKey.Length * 8);
        }
        catch (FormatException ex)
        {
            _logger.LogError(ex, "Invalid HMAC Secret Key format. Must be base64 encoded.");
            throw new InvalidOperationException("Invalid HMAC Secret Key configuration", ex);
        }
    }

    public string GenerateSignature(string data)
    {
        if (string.IsNullOrEmpty(data))
        {
            throw new ArgumentNullException(nameof(data));
        }

        using var hmac = new HMACSHA256(_secretKey);
        var dataBytes = Encoding.UTF8.GetBytes(data);
        var hashBytes = hmac.ComputeHash(dataBytes);
        return Convert.ToBase64String(hashBytes);
    }

    public bool VerifySignature(string data, string signature)
    {
        if (string.IsNullOrEmpty(data) || string.IsNullOrEmpty(signature))
        {
            return false;
        }

        try
        {
            var expectedSignature = GenerateSignature(data);

            // Use constant-time comparison to prevent timing attacks
            return CryptographicOperations.FixedTimeEquals(
                Convert.FromBase64String(expectedSignature),
                Convert.FromBase64String(signature)
            );
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to verify HMAC signature");
            return false;
        }
    }

    public string GenerateTimestampedSignature(string data, long timestamp)
    {
        if (string.IsNullOrEmpty(data))
        {
            throw new ArgumentNullException(nameof(data));
        }

        // Combine data and timestamp for signature
        var message = $"{data}|{timestamp}";
        return GenerateSignature(message);
    }

    public bool VerifyTimestampedSignature(string data, long timestamp, string signature, int validityMinutes = 5)
    {
        if (string.IsNullOrEmpty(data) || string.IsNullOrEmpty(signature))
        {
            return false;
        }

        // Check timestamp expiration
        var now = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
        var age = now - timestamp;
        var maxAgeMs = validityMinutes * 60 * 1000;

        if (age < 0 || age > maxAgeMs)
        {
            _logger.LogWarning("Timestamped signature expired or invalid. Age: {Age}ms, Max: {Max}ms", age, maxAgeMs);
            return false;
        }

        // Verify signature
        var message = $"{data}|{timestamp}";
        return VerifySignature(message, signature);
    }
}
