using Microsoft.AspNetCore.Cryptography.KeyDerivation;
using Stocker.Domain.Master.ValueObjects;
using System.Security.Cryptography;
using Stocker.Application.Common.Interfaces;
using Stocker.SharedKernel.Results;
using Microsoft.Extensions.Logging;
using Stocker.Identity.Logging;

namespace Stocker.Identity.Services;

/// <summary>
/// Service to handle password operations and bridge between Domain and Identity layers.
/// Implements both Identity and Application layer interfaces for compatibility.
/// </summary>
public class PasswordService : IPasswordService, Application.Common.Interfaces.IPasswordService
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

            // Compare hashes using constant-time comparison to prevent timing attacks
            var result = CryptographicOperations.FixedTimeEquals(storedHash, testHash);

            if (!result)
            {
                _logger.LogDebug(
                    new EventId(IdentityLogEvents.PasswordVerificationFailed, nameof(IdentityLogEvents.PasswordVerificationFailed)),
                    "Password verification failed for provided credentials");
            }

            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(
                new EventId(IdentityLogEvents.PasswordError, nameof(IdentityLogEvents.PasswordError)),
                ex,
                "Error during password verification");
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
    /// Simplified password hashing without username/email context.
    /// </summary>
    public HashedPassword HashPassword(string plainPassword)
    {
        return CreateHashedPassword(plainPassword);
    }

    /// <summary>
    /// Verifies a password against a combined hash string (salt+hash stored together).
    /// Used for TenantUser.PasswordHash which stores the combined format from GetCombinedHash.
    /// </summary>
    public bool VerifyPasswordHash(string combinedHash, string plainPassword)
    {
        if (string.IsNullOrWhiteSpace(combinedHash) || string.IsNullOrWhiteSpace(plainPassword))
        {
            return false;
        }

        try
        {
            // Decode the combined hash
            byte[] combined = Convert.FromBase64String(combinedHash);

            // Extract salt (first SaltSize bytes) and hash (remaining bytes)
            if (combined.Length < SaltSize + KeySize)
            {
                _logger.LogWarning("Combined hash is too short for expected format");
                return false;
            }

            byte[] salt = new byte[SaltSize];
            byte[] storedHash = new byte[KeySize];
            Array.Copy(combined, 0, salt, 0, SaltSize);
            Array.Copy(combined, SaltSize, storedHash, 0, KeySize);

            // Hash the provided password with the extracted salt
            byte[] testHash = KeyDerivation.Pbkdf2(
                password: plainPassword,
                salt: salt,
                prf: KeyDerivationPrf.HMACSHA256,
                iterationCount: Iterations,
                numBytesRequested: KeySize);

            // Compare using constant-time comparison
            var result = CryptographicOperations.FixedTimeEquals(storedHash, testHash);

            if (!result)
            {
                _logger.LogDebug(
                    new EventId(IdentityLogEvents.PasswordVerificationFailed, nameof(IdentityLogEvents.PasswordVerificationFailed)),
                    "Password hash verification failed for provided credentials");
            }

            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(
                new EventId(IdentityLogEvents.PasswordError, nameof(IdentityLogEvents.PasswordError)),
                ex,
                "Error during password hash verification");
            return false;
        }
    }

    /// <summary>
    /// Calculates the strength of a password
    /// </summary>
    public PasswordStrength CalculatePasswordStrength(string plainPassword)
    {
        return _passwordValidator.CalculateStrength(plainPassword);
    }

    /// <summary>
    /// Explicit interface implementation for Application layer PasswordStrength enum.
    /// </summary>
    Application.Common.Interfaces.PasswordStrength Application.Common.Interfaces.IPasswordService.CalculatePasswordStrength(string plainPassword)
    {
        var strength = CalculatePasswordStrength(plainPassword);
        return (Application.Common.Interfaces.PasswordStrength)(int)strength.Score;
    }
}

/// <summary>
/// Provides password-related operations including hashing, verification, and validation.
/// Uses PBKDF2-HMAC-SHA256 with OWASP 2023 recommended iteration count.
/// </summary>
public interface IPasswordService
{
    /// <summary>
    /// Validates a password against the configured password policy.
    /// </summary>
    /// <param name="plainPassword">The plain text password to validate.</param>
    /// <param name="username">Optional username to check for password containing username.</param>
    /// <param name="email">Optional email to check for password containing email parts.</param>
    /// <returns>A result indicating whether the password meets all policy requirements.</returns>
    Result<bool> ValidatePassword(string plainPassword, string? username = null, string? email = null);

    /// <summary>
    /// Creates a securely hashed password value object.
    /// </summary>
    /// <param name="plainPassword">The plain text password to hash.</param>
    /// <param name="username">Optional username for validation.</param>
    /// <param name="email">Optional email for validation.</param>
    /// <returns>A HashedPassword value object containing the hash and salt.</returns>
    /// <exception cref="ArgumentException">Thrown when password validation fails.</exception>
    HashedPassword CreateHashedPassword(string plainPassword, string? username = null, string? email = null);

    /// <summary>
    /// Verifies a plain text password against a stored hashed password.
    /// Uses constant-time comparison to prevent timing attacks.
    /// </summary>
    /// <param name="hashedPassword">The stored hashed password value object.</param>
    /// <param name="plainPassword">The plain text password to verify.</param>
    /// <returns>True if the password matches; otherwise, false.</returns>
    bool VerifyPassword(HashedPassword hashedPassword, string plainPassword);

    /// <summary>
    /// Converts a HashedPassword value object to a combined hash string
    /// compatible with IPasswordHasher storage format.
    /// </summary>
    /// <param name="hashedPassword">The hashed password value object.</param>
    /// <returns>A Base64-encoded string combining salt and hash.</returns>
    string GetCombinedHash(HashedPassword hashedPassword);

    /// <summary>
    /// Verifies a password against a combined hash string (salt+hash stored together).
    /// Used for TenantUser.PasswordHash which stores the combined format.
    /// </summary>
    /// <param name="combinedHash">The Base64-encoded combined salt+hash string.</param>
    /// <param name="plainPassword">The plain text password to verify.</param>
    /// <returns>True if the password matches; otherwise, false.</returns>
    bool VerifyPasswordHash(string combinedHash, string plainPassword);

    /// <summary>
    /// Calculates the strength score for a password.
    /// </summary>
    /// <param name="plainPassword">The plain text password to analyze.</param>
    /// <returns>A PasswordStrength object containing the score, entropy, and suggestions.</returns>
    PasswordStrength CalculatePasswordStrength(string plainPassword);
}