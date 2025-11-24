namespace Stocker.SignalR.Models;

/// <summary>
/// Represents the progress of tenant creation process
/// </summary>
public class TenantCreationProgress
{
    public Guid RegistrationId { get; set; }
    public TenantCreationStep Step { get; set; }
    public string Message { get; set; } = string.Empty;
    public int ProgressPercentage { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    public bool IsCompleted { get; set; }
    public bool HasError { get; set; }
    public string? ErrorMessage { get; set; }
    public Dictionary<string, object>? Metadata { get; set; }
}

/// <summary>
/// Steps in the tenant creation process
/// </summary>
public enum TenantCreationStep
{
    /// <summary>
    /// Email verification completed
    /// </summary>
    EmailVerified = 0,

    /// <summary>
    /// Starting tenant creation process
    /// </summary>
    Starting = 1,

    /// <summary>
    /// Creating tenant record
    /// </summary>
    CreatingTenant = 2,

    /// <summary>
    /// Creating subscription
    /// </summary>
    CreatingSubscription = 3,

    /// <summary>
    /// Creating master user account
    /// </summary>
    CreatingMasterUser = 4,

    /// <summary>
    /// Creating tenant database
    /// </summary>
    CreatingDatabase = 5,

    /// <summary>
    /// Running database migrations
    /// </summary>
    RunningMigrations = 6,

    /// <summary>
    /// Seeding initial data
    /// </summary>
    SeedingData = 7,

    /// <summary>
    /// Activating package modules
    /// </summary>
    ActivatingModules = 8,

    /// <summary>
    /// Activating tenant
    /// </summary>
    ActivatingTenant = 9,

    /// <summary>
    /// Sending welcome email
    /// </summary>
    SendingWelcomeEmail = 10,

    /// <summary>
    /// Tenant creation completed successfully
    /// </summary>
    Completed = 11,

    /// <summary>
    /// Tenant creation failed
    /// </summary>
    Failed = 12
}
