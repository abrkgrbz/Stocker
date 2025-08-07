using Microsoft.AspNetCore.Cryptography.KeyDerivation;
using Stocker.Domain.Master.ValueObjects;
using System.Security.Cryptography;

namespace Stocker.Identity.Services;

/// <summary>
/// Service to handle password operations and bridge between Domain and Identity layers
/// </summary>
public class PasswordService : IPasswordService
{
    private readonly IPasswordHasher _passwordHasher;
    
    private const int SaltSize = 128 / 8; // 128 bit
    private const int KeySize = 256 / 8; // 256 bit
    private const int Iterations = 10000;

    public PasswordService(IPasswordHasher passwordHasher)
    {
        _passwordHasher = passwordHasher;
    }

    /// <summary>
    /// Creates a HashedPassword value object using secure PBKDF2 hashing
    /// </summary>
    public HashedPassword CreateHashedPassword(string plainPassword)
    {
        if (string.IsNullOrWhiteSpace(plainPassword))
        {
            throw new ArgumentException("Password cannot be empty.", nameof(plainPassword));
        }

        if (plainPassword.Length < 8)
        {
            throw new ArgumentException("Password must be at least 8 characters long.", nameof(plainPassword));
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

            // Compare hashes
            return storedHash.SequenceEqual(testHash);
        }
        catch
        {
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
}

public interface IPasswordService
{
    HashedPassword CreateHashedPassword(string plainPassword);
    bool VerifyPassword(HashedPassword hashedPassword, string plainPassword);
    string GetCombinedHash(HashedPassword hashedPassword);
}