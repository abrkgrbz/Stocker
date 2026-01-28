using Stocker.SharedKernel.Primitives;

namespace Stocker.Domain.Master.Entities;

/// <summary>
/// Stores historical password hashes to prevent password reuse.
/// When a user changes their password, the old hash is stored here.
/// </summary>
public sealed class PasswordHistory : Entity
{
    /// <summary>
    /// The user this password history belongs to
    /// </summary>
    public Guid MasterUserId { get; private set; }

    /// <summary>
    /// The hashed password (includes salt)
    /// </summary>
    public string PasswordHash { get; private set; }

    /// <summary>
    /// When this password was set
    /// </summary>
    public DateTime CreatedAt { get; private set; }

    private PasswordHistory() { } // EF Constructor

    private PasswordHistory(Guid masterUserId, string passwordHash)
    {
        Id = Guid.NewGuid();
        MasterUserId = masterUserId;
        PasswordHash = passwordHash;
        CreatedAt = DateTime.UtcNow;
    }

    /// <summary>
    /// Creates a new password history entry
    /// </summary>
    public static PasswordHistory Create(Guid masterUserId, string passwordHash)
    {
        if (masterUserId == Guid.Empty)
            throw new ArgumentException("MasterUserId cannot be empty", nameof(masterUserId));

        if (string.IsNullOrWhiteSpace(passwordHash))
            throw new ArgumentException("Password hash cannot be empty", nameof(passwordHash));

        return new PasswordHistory(masterUserId, passwordHash);
    }
}
