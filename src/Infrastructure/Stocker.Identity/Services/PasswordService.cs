using Microsoft.AspNetCore.Cryptography.KeyDerivation;
using Stocker.Domain.Master.ValueObjects;
using System.Security.Cryptography;
using Stocker.Application.Common.Interfaces;
using Stocker.SharedKernel.Results;
using Microsoft.Extensions.Logging;

namespace Stocker.Identity.Services;

/// <summary>
/// Service to handle password operations and bridge between Domain and Identity layers
/// </summary>
public class PasswordService : IPasswordService
{
    private readonly IPasswordHasher _passwordHasher;
    private readonly IPasswordValidator _passwordValidator;
    private readonly ILogger<PasswordService> _logger;

    private const int SaltSize = 128 / 8; // 128 bit
    private const int KeySize = 256 / 8; // 256 bit
    private const int Iterations = 600000; // OWASP 2023 recommendation for PBKDF2-HMAC-SHA256


    public PasswordService(IPasswordHasher passwordHasher, IPasswordValidator? passwordValidator = null, ILogger<PasswordService>? logger = null)
    {
        _passwordHasher = passwordHasher;
        _passwordValidator = passwordValidator ?? new PasswordValidator(new SharedKernel.Settings.PasswordPolicy());
        _logger = logger ?? Microsoft.Extensions.Logging.Abstractions.NullLogger<PasswordService>.Instance;
    }

    /// <summary>
    /// Validates a password against the configured policy
    /// </summary>
    public Result<bool> ValidatePassword(string plainPassword, string? username = null, string? email = null)
    {
        return _passwordValidator.ValidatePassword(plainPassword, username, email);
    }

    /// <summary>
    /// Creates a HashedPassword value object using secure PBKDF2 hashing
    /// </summary>
    public HashedPassword CreateHashedPassword(string plainPassword, string? username = null, string? email = null)
    {
        // Validate password first
        var validationResult = ValidatePassword(plainPassword, username, email);
        if (validationResult.IsFailure)
        {
            throw new ArgumentException($"Password validation failed: {string.Join(", ", validationResult.Errors.Select(e => e.Description))}", nameof(plainPassword));
        }

        // Generate salt
        byte[] salt = new byte[SaltSize];
        using (var rng = RandomNumberGenerator.Create())
        {
            rng.GetBytes(salt);
        }

        // Hash password using PBKDF2
        byte[] hash = KeyDerivation.Pbkdf2(
            password: plainPassword,
            salt: salt,
            prf: KeyDerivationPrf.HMACSHA256,
            iterationCount: Iterations,
            numBytesRequested: KeySize);

        // Convert to Base64 for storage
        string saltBase64 = Convert.ToBase64String(salt);
        string hashBase64 = Convert.ToBase64String(hash);

        // Create HashedPassword value object
        return HashedPassword.FromHash(hashBase64, saltBase64);
    }

    /// <summary>
    /// Verifies a password against a HashedPassword value object
    /// </summary>
    public bool VerifyPassword(HashedPassword hashedPassword, string plainPassword)
    {
        if (hashedPassword == null || string.IsNullOrWhiteSpace(plainPassword))
        {
            return false;
        }

        try
        {
            // Extract salt and hash from value object
            byte[] salt = Convert.FromBase64String(hashedPassword.Salt);
            byte[] storedHash = Convert.FromBase64String(hashedPassword.Hash);

            // Hash the provided password with the same salt
            byte[] testHash = KeyDerivation.Pbkdf2(
                password: plainPassword,
                salt: salt,
                prf: KeyDerivationPrf.HMACSHA256,
                iterationCount: Iterations,
                numBytesRequested: KeySize);

            // Debug logging
            var storedHashStr = Convert.ToBase64String(storedHash);
            var testHashStr = Convert.ToBase64String(testHash);
            
            // Warning level logging for production debug
            var saltStr = Convert.ToBase64String(salt);
            _logger.LogWarning("Password verification debug - Salt: {Salt}, StoredHash (first 10): {StoredHashPrefix}, TestHash (first 10): {TestHashPrefix}, Match: {IsMatch}, Iterations: {Iterations}, PasswordLength: {PasswordLength}, InputPassword (first 3): {PasswordPrefix}",
                saltStr.Substring(0, Math.Min(10, saltStr.Length)),
                storedHashStr.Substring(0, Math.Min(10, storedHashStr.Length)),
                testHashStr.Substring(0, Math.Min(10, testHashStr.Length)),
                storedHashStr == testHashStr,
                Iterations,
                plainPassword.Length,
                plainPassword.Substring(0, Math.Min(3, plainPassword.Length)));
            
            // Compare hashes
            var result = CryptographicOperations.FixedTimeEquals(storedHash, testHash);
            _logger.LogWarning("Password verification result: {Result}", result);
            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "VerifyPassword exception");
            return false;
        }
    }

    /// <summary>
    /// Creates a combined hash string compatible with IPasswordHasher
    /// </summary>
    public string GetCombinedHash(HashedPassword hashedPassword)
    {
        if (hashedPassword == null)
        {
            throw new ArgumentNullException(nameof(hashedPassword));
        }

        // Combine salt and hash for IPasswordHasher compatibility
        byte[] salt = Convert.FromBase64String(hashedPassword.Salt);
        byte[] hash = Convert.FromBase64String(hashedPassword.Hash);
        
        byte[] combined = new byte[salt.Length + hash.Length];
        Array.Copy(salt, 0, combined, 0, salt.Length);
        Array.Copy(hash, 0, combined, salt.Length, hash.Length);
        
        return Convert.ToBase64String(combined);
    }

    /// <summary>
    /// Calculates the strength of a password
    /// </summary>
    public PasswordStrength CalculatePasswordStrength(string plainPassword)
    {
        return _passwordValidator.CalculateStrength(plainPassword);
    }
}

public interface IPasswordService
{
    Result<bool> ValidatePassword(string plainPassword, string? username = null, string? email = null);
    HashedPassword CreateHashedPassword(string plainPassword, string? username = null, string? email = null);
    bool VerifyPassword(HashedPassword hashedPassword, string plainPassword);
    string GetCombinedHash(HashedPassword hashedPassword);
    PasswordStrength CalculatePasswordStrength(string plainPassword);
}