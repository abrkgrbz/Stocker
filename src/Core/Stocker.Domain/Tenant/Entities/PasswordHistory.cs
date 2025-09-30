using System;
using Stocker.SharedKernel.Primitives;

namespace Stocker.Domain.Tenant.Entities;

public class PasswordHistory : AggregateRoot<Guid>
{
    private PasswordHistory() { }
    public Guid UserId { get; private set; }
    public string PasswordHash { get; private set; } = string.Empty;
    public string Salt { get; private set; } = string.Empty;
    
    // Password Details
    public int PasswordStrength { get; private set; } // 0-100
    public bool MeetsComplexityRequirements { get; private set; }
    public int Length { get; private set; }
    public bool HasUppercase { get; private set; }
    public bool HasLowercase { get; private set; }
    public bool HasNumbers { get; private set; }
    public bool HasSpecialCharacters { get; private set; }
    public bool HasSequentialCharacters { get; private set; }
    public bool HasRepeatingCharacters { get; private set; }
    
    // Change Information
    public DateTime ChangedAt { get; private set; }
    public string ChangedBy { get; private set; } = string.Empty;
    public PasswordChangeReason ChangeReason { get; private set; }
    public string? ChangeReasonDetails { get; private set; }
    public string? ChangedFromIP { get; private set; }
    public string? ChangedFromDevice { get; private set; }
    public string? ChangedFromLocation { get; private set; }
    
    // Expiration
    public DateTime? ExpirationDate { get; private set; }
    public bool WasExpired { get; private set; }
    public int DaysUsed { get; private set; }
    
    // Security
    public bool WasCompromised { get; private set; }
    public DateTime? CompromisedAt { get; private set; }
    public string? CompromiseReason { get; private set; }
    public bool ForcedChange { get; private set; }
    
    // Validation
    public DateTime? LastValidatedAt { get; private set; }
    public int FailedAttemptCount { get; private set; }
    public DateTime? LastFailedAttemptAt { get; private set; }
    
    public static PasswordHistory Create(
        Guid userId,
        string passwordHash,
        string salt,
        int length,
        PasswordChangeReason changeReason,
        string changedBy,
        string? changedFromIP = null,
        int? expirationDays = null)
    {
        if (userId == Guid.Empty)
            throw new ArgumentException("User ID is required", nameof(userId));
        if (string.IsNullOrWhiteSpace(passwordHash))
            throw new ArgumentException("Password hash is required", nameof(passwordHash));
        if (string.IsNullOrWhiteSpace(salt))
            throw new ArgumentException("Salt is required", nameof(salt));
        if (string.IsNullOrWhiteSpace(changedBy))
            throw new ArgumentException("Changed by is required", nameof(changedBy));
            
        var history = new PasswordHistory
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            PasswordHash = passwordHash,
            Salt = salt,
            Length = length,
            ChangeReason = changeReason,
            ChangedBy = changedBy,
            ChangedFromIP = changedFromIP,
            ChangedAt = DateTime.UtcNow
        };
        
        if (expirationDays.HasValue && expirationDays.Value > 0)
        {
            history.ExpirationDate = history.ChangedAt.AddDays(expirationDays.Value);
        }
        
        return history;
    }
    
    public void SetPasswordAnalysis(
        int strength,
        bool meetsComplexity,
        bool hasUppercase,
        bool hasLowercase,
        bool hasNumbers,
        bool hasSpecialCharacters,
        bool hasSequential,
        bool hasRepeating)
    {
        PasswordStrength = Math.Min(100, Math.Max(0, strength));
        MeetsComplexityRequirements = meetsComplexity;
        HasUppercase = hasUppercase;
        HasLowercase = hasLowercase;
        HasNumbers = hasNumbers;
        HasSpecialCharacters = hasSpecialCharacters;
        HasSequentialCharacters = hasSequential;
        HasRepeatingCharacters = hasRepeating;
    }
    
    public void SetChangeDetails(
        string? reasonDetails,
        string? device,
        string? location)
    {
        ChangeReasonDetails = reasonDetails;
        ChangedFromDevice = device;
        ChangedFromLocation = location;
    }
    
    public void MarkAsCompromised(string reason)
    {
        if (string.IsNullOrWhiteSpace(reason))
            throw new ArgumentException("Compromise reason is required", nameof(reason));
            
        WasCompromised = true;
        CompromisedAt = DateTime.UtcNow;
        CompromiseReason = reason;
    }
    
    public void RecordFailedAttempt()
    {
        FailedAttemptCount++;
        LastFailedAttemptAt = DateTime.UtcNow;
    }
    
    public void RecordValidation()
    {
        LastValidatedAt = DateTime.UtcNow;
    }
    
    public void CalculateDaysUsed(DateTime? endDate = null)
    {
        var end = endDate ?? DateTime.UtcNow;
        DaysUsed = (int)(end - ChangedAt).TotalDays;
        
        if (ExpirationDate.HasValue && end >= ExpirationDate.Value)
        {
            WasExpired = true;
        }
    }
    
    public bool IsExpired()
    {
        if (!ExpirationDate.HasValue)
            return false;
            
        return DateTime.UtcNow > ExpirationDate.Value;
    }
    
    public int GetDaysUntilExpiration()
    {
        if (!ExpirationDate.HasValue)
            return int.MaxValue;
            
        var days = (ExpirationDate.Value - DateTime.UtcNow).TotalDays;
        return Math.Max(0, (int)days);
    }
    
    public bool MatchesPassword(string hashedPassword)
    {
        return PasswordHash == hashedPassword;
    }
}

public enum PasswordChangeReason
{
    Initial,
    UserRequested,
    AdminForced,
    Expired,
    Compromised,
    PolicyChange,
    SecurityReset,
    ForgotPassword,
    FirstLogin,
    Scheduled,
    TwoFactorReset
}