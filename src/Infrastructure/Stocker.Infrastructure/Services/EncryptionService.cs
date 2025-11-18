using Microsoft.AspNetCore.DataProtection;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using System;
using System.Security.Cryptography;
using System.Text;
using Stocker.Application.Common.Exceptions;
using Stocker.Application.Common.Interfaces;

namespace Stocker.Infrastructure.Services;

public class EncryptionService : IEncryptionService
{
    private readonly IDataProtector _dataProtector;
    private readonly string _encryptionKey;
    private readonly ILogger<EncryptionService> _logger;

    public EncryptionService(
        IDataProtectionProvider dataProtectionProvider,
        IConfiguration configuration,
        ILogger<EncryptionService> logger)
    {
        _dataProtector = dataProtectionProvider.CreateProtector("Stocker.Encryption.v1");
        _encryptionKey = configuration["DATA_PROTECTION_KEY"] ??
                         Environment.GetEnvironmentVariable("DATA_PROTECTION_KEY") ??
                         throw new InvalidOperationException("DATA_PROTECTION_KEY is not configured");
        _logger = logger;
    }

    /// <summary>
    /// Encrypts sensitive data like SMTP passwords
    /// </summary>
    public string Encrypt(string plainText)
    {
        if (string.IsNullOrEmpty(plainText))
            return plainText;

        try
        {
            return _dataProtector.Protect(plainText);
        }
        catch (CryptographicException ex)
        {
            throw new InfrastructureException("Encryption.Failed", "Failed to encrypt data", ex);
        }
        catch (Exception ex)
        {
            throw new InfrastructureException("Encryption.UnexpectedError", "Unexpected error during encryption", ex);
        }
    }

    /// <summary>
    /// Decrypts sensitive data
    /// Returns empty string if decryption fails (allows graceful fallback)
    /// </summary>
    public string Decrypt(string cipherText)
    {
        if (string.IsNullOrEmpty(cipherText))
            return cipherText;

        try
        {
            return _dataProtector.Unprotect(cipherText);
        }
        catch (CryptographicException ex)
        {
            _logger.LogWarning(ex, "Failed to decrypt data - data may be corrupted or key mismatch. Returning empty string for graceful fallback.");
            return string.Empty;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error during decryption. Returning empty string for graceful fallback.");
            return string.Empty;
        }
    }

    /// <summary>
    /// Creates a one-way hash of a password using BCrypt
    /// </summary>
    public string HashPassword(string password)
    {
        if (string.IsNullOrEmpty(password))
            throw new ArgumentNullException(nameof(password));

        // Use BCrypt for password hashing (already in project via BCrypt.Net-Next)
        return BCrypt.Net.BCrypt.HashPassword(password, BCrypt.Net.BCrypt.GenerateSalt(12));
    }

    /// <summary>
    /// Verifies a password against a BCrypt hash
    /// </summary>
    public bool VerifyPassword(string password, string hash)
    {
        if (string.IsNullOrEmpty(password) || string.IsNullOrEmpty(hash))
            return false;

        try
        {
            return BCrypt.Net.BCrypt.Verify(password, hash);
        }
        catch (ArgumentException)
        {
            // Invalid hash format or arguments - return false for security
            return false;
        }
    }
}

/// <summary>
/// Extension methods for encryption service registration
/// </summary>
public static class EncryptionServiceExtensions
{
    public static IServiceCollection AddEncryptionService(this IServiceCollection services, IConfiguration configuration)
    {
        // Add Data Protection
        services.AddDataProtection()
            .SetApplicationName("Stocker.ERP")
            .PersistKeysToFileSystem(new DirectoryInfo(Path.Combine(Directory.GetCurrentDirectory(), "keys")));

        // Register encryption service
        services.AddSingleton<IEncryptionService, EncryptionService>();

        return services;
    }
}