using Stocker.SharedKernel.Primitives;
using System.Security.Cryptography;
using System.Text;

namespace Stocker.Domain.Master.ValueObjects;

public sealed class HashedPassword : ValueObject
{
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

        var hash = HashPassword(plainPassword, Salt);
        return hash == Hash;
    }

    private static string GenerateSalt()
    {
        var saltBytes = new byte[32];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(saltBytes);
        return Convert.ToBase64String(saltBytes);
    }

    private static string HashPassword(string password, string salt)
    {
        using var sha256 = SHA256.Create();
        var saltedPassword = password + salt;
        var saltedPasswordBytes = Encoding.UTF8.GetBytes(saltedPassword);
        var hashBytes = sha256.ComputeHash(saltedPasswordBytes);
        return Convert.ToBase64String(hashBytes);
    }

    public override IEnumerable<object> GetEqualityComponents()
    {
        yield return Hash;
        yield return Salt;
    }

    // Helper for Identity layer - returns combined hash
    public string Value => $"{Hash}:{Salt}";

    // Create from Identity layer hash format
    public static HashedPassword CreateFromHash(string hashedPassword)
    {
        if (string.IsNullOrWhiteSpace(hashedPassword))
        {
            throw new ArgumentException("Hashed password cannot be empty.", nameof(hashedPassword));
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

        // Otherwise assume it's a pre-hashed password (from Identity layer)
        // Generate a dummy salt for compatibility
        return new HashedPassword(hashedPassword, "");
    }
}