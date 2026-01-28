using Stocker.Domain.Master.ValueObjects;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Common.Interfaces;

public interface IPasswordService
{
    Result<bool> ValidatePassword(string plainPassword, string? username = null, string? email = null);
    HashedPassword CreateHashedPassword(string plainPassword, string? username = null, string? email = null);
    HashedPassword HashPassword(string plainPassword); // Simplified version
    bool VerifyPassword(HashedPassword hashedPassword, string plainPassword);
    /// <summary>
    /// Verifies a password against a combined hash string (salt+hash stored together).
    /// Used for TenantUser.PasswordHash which stores combined format.
    /// </summary>
    bool VerifyPasswordHash(string combinedHash, string plainPassword);
    string GetCombinedHash(HashedPassword hashedPassword);
    PasswordStrength CalculatePasswordStrength(string plainPassword);
}

public interface IPasswordValidator
{
    Result<bool> ValidatePassword(string plainPassword, string? username = null, string? email = null);
    PasswordStrength CalculateStrength(string plainPassword);
}

/// <summary>
/// Service for managing password history to prevent password reuse
/// </summary>
public interface IPasswordHistoryService
{
    /// <summary>
    /// Checks if the password was used recently (within the last N passwords)
    /// </summary>
    /// <param name="userId">The MasterUser ID</param>
    /// <param name="plainPassword">The new password to check</param>
    /// <param name="historyCount">Number of previous passwords to check (default: 5)</param>
    /// <returns>True if password was used recently, false otherwise</returns>
    Task<bool> IsPasswordInHistoryAsync(Guid userId, string plainPassword, int historyCount = 5);

    /// <summary>
    /// Adds the current password to history before changing it
    /// </summary>
    /// <param name="userId">The MasterUser ID</param>
    /// <param name="passwordHash">The hashed password to store</param>
    Task AddPasswordToHistoryAsync(Guid userId, string passwordHash);

    /// <summary>
    /// Cleans up old password history entries beyond the retention limit
    /// </summary>
    /// <param name="userId">The MasterUser ID</param>
    /// <param name="retentionCount">Number of entries to retain (default: 10)</param>
    Task CleanupOldHistoryAsync(Guid userId, int retentionCount = 10);
}

public enum PasswordStrength
{
    VeryWeak = 0,
    Weak = 1,
    Fair = 2,
    Good = 3,
    Strong = 4,
    VeryStrong = 5
}