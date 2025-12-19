using Microsoft.AspNetCore.Cryptography.KeyDerivation;
using Microsoft.Extensions.Logging;
using System.Security.Cryptography;
using Stocker.Application.Common.Interfaces;
using Stocker.Identity.Logging;

namespace Stocker.Identity.Services;

/// <summary>
/// Secure password hasher using PBKDF2-HMAC-SHA256.
/// Follows OWASP 2023 recommendations for iteration count.
/// Supports backward compatibility with legacy hashes.
/// </summary>
public class PasswordHasher : IPasswordHasher
{
    private readonly ILogger<PasswordHasher> _logger;

    private const int SaltSize = 128 / 8; // 128 bit (16 bytes)
    private const int KeySize = 256 / 8; // 256 bit (32 bytes)

    /// <summary>
    /// Current iteration count following OWASP 2023 recommendations for PBKDF2-HMAC-SHA256.
    /// </summary>
    private const int CurrentIterations = 600000;

    /// <summary>
    /// Legacy iteration count for backward compatibility with existing hashes.
    /// </summary>
    private const int LegacyIterations = 10000;

    /// <summary>
    /// Version byte to identify hash format.
    /// Version 1 = Legacy (10,000 iterations)
    /// Version 2 = Current (600,000 iterations)
    /// </summary>
    private const byte CurrentVersion = 2;
    private const byte LegacyVersion = 1;

    /// <summary>
    /// Header size for versioned hashes (1 byte version + 4 bytes iteration count).
    /// </summary>
    private const int HeaderSize = 5;

    public PasswordHasher(ILogger<PasswordHasher>? logger = null)
    {
        _logger = logger ?? Microsoft.Extensions.Logging.Abstractions.NullLogger<PasswordHasher>.Instance;
    }

    /// <summary>
    /// Hashes a password using PBKDF2-HMAC-SHA256 with current iteration count.
    /// </summary>
    /// <param name="password">The plain text password to hash.</param>
    /// <returns>Base64 encoded hash with embedded salt, version, and iteration metadata.</returns>
    public string HashPassword(string password)
    {
        // Generate cryptographically secure salt
        byte[] salt = new byte[SaltSize];
        using (var rng = RandomNumberGenerator.Create())
        {
            rng.GetBytes(salt);
        }

        // Hash password using PBKDF2
        byte[] hash = KeyDerivation.Pbkdf2(
            password: password,
            salt: salt,
            prf: KeyDerivationPrf.HMACSHA256,
            iterationCount: CurrentIterations,
            numBytesRequested: KeySize);

        // Build versioned hash: [version(1)] + [iterations(4)] + [salt(16)] + [hash(32)]
        byte[] hashBytes = new byte[HeaderSize + SaltSize + KeySize];
        hashBytes[0] = CurrentVersion;
        BitConverter.GetBytes(CurrentIterations).CopyTo(hashBytes, 1);
        salt.CopyTo(hashBytes, HeaderSize);
        hash.CopyTo(hashBytes, HeaderSize + SaltSize);

        _logger.LogDebug(
            new EventId(IdentityLogEvents.PasswordHashed, nameof(IdentityLogEvents.PasswordHashed)),
            "Password hashed with version {Version} and {Iterations} iterations",
            CurrentVersion, CurrentIterations);

        return Convert.ToBase64String(hashBytes);
    }

    /// <summary>
    /// Verifies a password against a stored hash.
    /// Supports both legacy and current hash formats for backward compatibility.
    /// </summary>
    /// <param name="hashedPassword">The stored hash to verify against.</param>
    /// <param name="providedPassword">The plain text password to verify.</param>
    /// <returns>True if the password matches; otherwise, false.</returns>
    public bool VerifyPassword(string hashedPassword, string providedPassword)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(hashedPassword) || string.IsNullOrWhiteSpace(providedPassword))
            {
                return false;
            }

            byte[] hashBytes = Convert.FromBase64String(hashedPassword);

            // Determine hash format based on length
            bool isVersionedFormat = hashBytes.Length == HeaderSize + SaltSize + KeySize;
            bool isLegacyFormat = hashBytes.Length == SaltSize + KeySize;

            if (!isVersionedFormat && !isLegacyFormat)
            {
                _logger.LogWarning(
                    new EventId(IdentityLogEvents.PasswordVerificationFailed, nameof(IdentityLogEvents.PasswordVerificationFailed)),
                    "Invalid hash format detected, length: {Length}", hashBytes.Length);
                return false;
            }

            int iterations;
            byte[] salt = new byte[SaltSize];
            byte[] storedHash = new byte[KeySize];

            if (isVersionedFormat)
            {
                // Versioned format: [version(1)] + [iterations(4)] + [salt(16)] + [hash(32)]
                byte version = hashBytes[0];
                iterations = BitConverter.ToInt32(hashBytes, 1);
                Array.Copy(hashBytes, HeaderSize, salt, 0, SaltSize);
                Array.Copy(hashBytes, HeaderSize + SaltSize, storedHash, 0, KeySize);

                _logger.LogDebug(
                    new EventId(IdentityLogEvents.PasswordVerified, nameof(IdentityLogEvents.PasswordVerified)),
                    "Verifying versioned hash (v{Version}, {Iterations} iterations)",
                    version, iterations);
            }
            else
            {
                // Legacy format: [salt(16)] + [hash(32)]
                iterations = LegacyIterations;
                Array.Copy(hashBytes, 0, salt, 0, SaltSize);
                Array.Copy(hashBytes, SaltSize, storedHash, 0, KeySize);

                _logger.LogInformation(
                    new EventId(IdentityLogEvents.LegacyPasswordHashDetected, nameof(IdentityLogEvents.LegacyPasswordHashDetected)),
                    "Legacy password hash detected, using {Iterations} iterations. Consider rehashing.",
                    LegacyIterations);
            }

            // Hash provided password with extracted parameters
            byte[] testHash = KeyDerivation.Pbkdf2(
                password: providedPassword,
                salt: salt,
                prf: KeyDerivationPrf.HMACSHA256,
                iterationCount: iterations,
                numBytesRequested: KeySize);

            // Use constant-time comparison to prevent timing attacks
            return CryptographicOperations.FixedTimeEquals(storedHash, testHash);
        }
        catch (FormatException)
        {
            _logger.LogWarning(
                new EventId(IdentityLogEvents.PasswordVerificationFailed, nameof(IdentityLogEvents.PasswordVerificationFailed)),
                "Invalid Base64 format in stored hash");
            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(
                new EventId(IdentityLogEvents.PasswordError, nameof(IdentityLogEvents.PasswordError)),
                ex,
                "Unexpected error during password verification");
            return false;
        }
    }

    /// <summary>
    /// Determines if a hash needs to be upgraded to the current iteration count.
    /// </summary>
    /// <param name="hashedPassword">The stored hash to check.</param>
    /// <returns>True if the hash should be rehashed with current settings.</returns>
    public bool NeedsRehash(string hashedPassword)
    {
        if (string.IsNullOrWhiteSpace(hashedPassword))
        {
            return false;
        }

        try
        {
            byte[] hashBytes = Convert.FromBase64String(hashedPassword);

            // Legacy format always needs rehash
            if (hashBytes.Length == SaltSize + KeySize)
            {
                return true;
            }

            // Versioned format - check iteration count
            if (hashBytes.Length == HeaderSize + SaltSize + KeySize)
            {
                int iterations = BitConverter.ToInt32(hashBytes, 1);
                return iterations < CurrentIterations;
            }

            return false;
        }
        catch
        {
            return false;
        }
    }
}
