using Microsoft.AspNetCore.DataProtection;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Security.Cryptography;
using System.Text;
using Stocker.Application.Common.Exceptions;

namespace Stocker.Infrastructure.Services;

public interface IEncryptionService
{
    string Encrypt(string plainText);
    string Decrypt(string cipherText);
    string HashPassword(string password);
    bool VerifyPassword(string password, string hash);
}

public class EncryptionService : IEncryptionService
{
    private readonly IDataProtector _dataProtector;
    private readonly string _encryptionKey;

    public EncryptionService(IDataProtectionProvider dataProtectionProvider, IConfiguration configuration)
    {
        _dataProtector = dataProtectionProvider.CreateProtector("Stocker.Encryption.v1");
        _encryptionKey = configuration["DATA_PROTECTION_KEY"] ?? 
                         Environment.GetEnvironmentVariable("DATA_PROTECTION_KEY") ?? 
                         throw new InvalidOperationException("DATA_PROTECTION_KEY is not configured");
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
            throw new InfrastructureException("Decryption.Failed", "Failed to decrypt data - data may be corrupted or key mismatch", ex);
        }
        catch (Exception ex)
        {
            throw new InfrastructureException("Decryption.UnexpectedError", "Unexpected error during decryption", ex);
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