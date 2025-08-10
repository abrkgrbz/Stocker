using Stocker.SharedKernel.Primitives;
using System.Security.Cryptography;
using Microsoft.AspNetCore.Cryptography.KeyDerivation;

namespace Stocker.Domain.Master.ValueObjects;

public sealed class HashedPassword : ValueObject
{
    private const int SaltSize = 128 / 8; // 128 bit
    private const int KeySize = 256 / 8; // 256 bit
    private const int Iterations = 600000; // OWASP 2023 recommendation for PBKDF2-HMAC-SHA256

    public string Hash { get; }
    public string Salt { get; }

    private HashedPassword(string hash, string salt)
    {
        Hash = hash;
        Salt = salt;
    }

    public static HashedPassword Create(string plainPassword)
    {
        if (string.IsNullOrWhiteSpace(plainPassword))
        {
            throw new ArgumentException("Password cannot be empty.", nameof(plainPassword));
        }

        if (plainPassword.Length < 8)
        {
            throw new ArgumentException("Password must be at least 8 characters long.", nameof(plainPassword));
        }

        var salt = GenerateSalt();
        var hash = HashPassword(plainPassword, salt);

        return new HashedPassword(hash, salt);
    }

    public static HashedPassword FromHash(string hash, string salt)
    {
        if (string.IsNullOrWhiteSpace(hash))
        {
            throw new ArgumentException("Hash cannot be empty.", nameof(hash));
        }

        if (string.IsNullOrWhiteSpace(salt))
        {
            throw new ArgumentException("Salt cannot be empty.", nameof(salt));
        }

        return new HashedPassword(hash, salt);
    }

    public bool Verify(string plainPassword)
    {
        if (string.IsNullOrWhiteSpace(plainPassword))
        {
            return false;
        }

        try
        {
            // Extract salt bytes
            byte[] saltBytes = Convert.FromBase64String(Salt);
            byte[] storedHashBytes = Convert.FromBase64String(Hash);

            // Hash the provided password with the same salt
            byte[] testHash = KeyDerivation.Pbkdf2(
                password: plainPassword,
                salt: saltBytes,
                prf: KeyDerivationPrf.HMACSHA256,
                iterationCount: Iterations,
                numBytesRequested: KeySize);

            // Use constant-time comparison to prevent timing attacks
            return CryptographicOperations.FixedTimeEquals(storedHashBytes, testHash);
        }
        catch (FormatException)
        {
            // Invalid Base64 string
            return false;
        }
        catch (ArgumentException)
        {
            // Invalid arguments to PBKDF2
            return false;
        }
    }

    private static string GenerateSalt()
    {
        byte[] saltBytes = new byte[SaltSize];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(saltBytes);
        return Convert.ToBase64String(saltBytes);
    }

    private static string HashPassword(string password, string salt)
    {
        byte[] saltBytes = Convert.FromBase64String(salt);
        
        // Hash password using PBKDF2
        byte[] hash = KeyDerivation.Pbkdf2(
            password: password,
            salt: saltBytes,
            prf: KeyDerivationPrf.HMACSHA256,
            iterationCount: Iterations,
            numBytesRequested: KeySize);

        return Convert.ToBase64String(hash);
    }

    public override IEnumerable<object> GetEqualityComponents()
    {
        yield return Hash;
        yield return Salt;
    }

    // Helper for Identity layer - returns combined hash (salt + hash)
    public string Value
    {
        get
        {
            // Combine salt and hash for compatibility with PasswordHasher
            byte[] saltBytes = Convert.FromBase64String(Salt);
            byte[] hashBytes = Convert.FromBase64String(Hash);
            
            byte[] combined = new byte[saltBytes.Length + hashBytes.Length];
            Array.Copy(saltBytes, 0, combined, 0, saltBytes.Length);
            Array.Copy(hashBytes, 0, combined, saltBytes.Length, hashBytes.Length);
            
            return Convert.ToBase64String(combined);
        }
    }

    // Create from Identity layer hash format (combined salt+hash)
    public static HashedPassword CreateFromHash(string hashedPassword)
    {
        if (string.IsNullOrWhiteSpace(hashedPassword))
        {
            throw new ArgumentException("Hashed password cannot be empty.", nameof(hashedPassword));
        }

        try
        {
            // Decode from Base64
            byte[] hashBytes = Convert.FromBase64String(hashedPassword);

            // Check if it's a combined format (salt + hash)
            if (hashBytes.Length == SaltSize + KeySize)
            {
                // Extract salt and hash
                byte[] saltBytes = new byte[SaltSize];
                byte[] hashOnlyBytes = new byte[KeySize];
                
                Array.Copy(hashBytes, 0, saltBytes, 0, SaltSize);
                Array.Copy(hashBytes, SaltSize, hashOnlyBytes, 0, KeySize);
                
                string salt = Convert.ToBase64String(saltBytes);
                string hash = Convert.ToBase64String(hashOnlyBytes);
                
                return FromHash(hash, salt);
            }
            
            // If it's in the format "hash:salt", split it
            if (hashedPassword.Contains(':'))
            {
                var parts = hashedPassword.Split(':');
                if (parts.Length == 2)
                {
                    return FromHash(parts[0], parts[1]);
                }
            }
            
            // For backward compatibility, generate a dummy salt
            return new HashedPassword(hashedPassword, Convert.ToBase64String(new byte[SaltSize]));
        }
        catch
        {
            // For backward compatibility, if parsing fails
            if (hashedPassword.Contains(':'))
            {
                var parts = hashedPassword.Split(':');
                if (parts.Length == 2)
                {
                    return FromHash(parts[0], parts[1]);
                }
            }
            
            // Last resort: treat as hash with empty salt
            return new HashedPassword(hashedPassword, Convert.ToBase64String(new byte[SaltSize]));
        }
    }
}