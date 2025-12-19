namespace Stocker.Application.Common.Interfaces;

/// <summary>
/// Provides secure password hashing and verification services.
/// Implementations should use industry-standard algorithms like PBKDF2, bcrypt, or Argon2.
/// </summary>
public interface IPasswordHasher
{
    /// <summary>
    /// Creates a secure hash of the provided password.
    /// The hash should include a unique salt and be suitable for secure storage.
    /// </summary>
    /// <param name="password">The plain text password to hash.</param>
    /// <returns>A Base64-encoded hash string including salt and algorithm metadata.</returns>
    string HashPassword(string password);

    /// <summary>
    /// Verifies a plain text password against a previously stored hash.
    /// Uses constant-time comparison to prevent timing attacks.
    /// </summary>
    /// <param name="hashedPassword">The stored hash to verify against.</param>
    /// <param name="providedPassword">The plain text password to verify.</param>
    /// <returns>True if the password matches the hash; otherwise, false.</returns>
    bool VerifyPassword(string hashedPassword, string providedPassword);
}