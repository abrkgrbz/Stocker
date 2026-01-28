using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;
using Stocker.Domain.Master.Entities;

namespace Stocker.Identity.Services;

/// <summary>
/// Service for managing password history to prevent password reuse
/// </summary>
public class PasswordHistoryService : IPasswordHistoryService
{
    private readonly IMasterDbContext _masterContext;
    private readonly IPasswordService _passwordService;
    private readonly ILogger<PasswordHistoryService> _logger;

    public PasswordHistoryService(
        IMasterDbContext masterContext,
        IPasswordService passwordService,
        ILogger<PasswordHistoryService> logger)
    {
        _masterContext = masterContext;
        _passwordService = passwordService;
        _logger = logger;
    }

    /// <inheritdoc />
    public async Task<bool> IsPasswordInHistoryAsync(Guid userId, string plainPassword, int historyCount = 5)
    {
        try
        {
            // Get the last N password hashes for this user
            var recentHashes = await _masterContext.PasswordHistories
                .Where(ph => ph.MasterUserId == userId)
                .OrderByDescending(ph => ph.CreatedAt)
                .Take(historyCount)
                .Select(ph => ph.PasswordHash)
                .ToListAsync();

            // Also check the current password on the MasterUser
            var masterUser = await _masterContext.MasterUsers.FindAsync(userId);
            if (masterUser != null)
            {
                // Check against current password
                if (_passwordService.VerifyPasswordHash(masterUser.PasswordHash, plainPassword))
                {
                    _logger.LogDebug("Password matches current password for user {UserId}", userId);
                    return true;
                }
            }

            // Check against historical passwords
            foreach (var hash in recentHashes)
            {
                if (_passwordService.VerifyPasswordHash(hash, plainPassword))
                {
                    _logger.LogDebug("Password found in history for user {UserId}", userId);
                    return true;
                }
            }

            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking password history for user {UserId}", userId);
            // On error, allow the password change to proceed (fail-open for usability)
            return false;
        }
    }

    /// <inheritdoc />
    public async Task AddPasswordToHistoryAsync(Guid userId, string passwordHash)
    {
        try
        {
            var historyEntry = PasswordHistory.Create(userId, passwordHash);
            _masterContext.PasswordHistories.Add(historyEntry);
            await _masterContext.SaveChangesAsync();

            _logger.LogInformation("Added password to history for user {UserId}", userId);

            // Clean up old entries
            await CleanupOldHistoryAsync(userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error adding password to history for user {UserId}", userId);
            // Don't throw - password history failure shouldn't block password change
        }
    }

    /// <inheritdoc />
    public async Task CleanupOldHistoryAsync(Guid userId, int retentionCount = 10)
    {
        try
        {
            // Get entries to delete (older than the retention limit)
            var entriesToDelete = await _masterContext.PasswordHistories
                .Where(ph => ph.MasterUserId == userId)
                .OrderByDescending(ph => ph.CreatedAt)
                .Skip(retentionCount)
                .ToListAsync();

            if (entriesToDelete.Any())
            {
                _masterContext.PasswordHistories.RemoveRange(entriesToDelete);
                await _masterContext.SaveChangesAsync();

                _logger.LogDebug("Cleaned up {Count} old password history entries for user {UserId}",
                    entriesToDelete.Count, userId);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error cleaning up password history for user {UserId}", userId);
            // Don't throw - cleanup failure shouldn't affect operation
        }
    }
}
