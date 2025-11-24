namespace Stocker.Application.Common.Interfaces;

/// <summary>
/// Service for sending real-time tenant creation progress updates via SignalR
/// </summary>
public interface ITenantCreationProgressService
{
    /// <summary>
    /// Send progress update for a specific registration
    /// </summary>
    Task SendProgressAsync(Guid registrationId, TenantCreationStep step, string message, int progressPercentage, CancellationToken cancellationToken = default);

    /// <summary>
    /// Send error notification for tenant creation failure
    /// </summary>
    Task SendErrorAsync(Guid registrationId, string errorMessage, CancellationToken cancellationToken = default);

    /// <summary>
    /// Send completion notification with tenant information
    /// </summary>
    Task SendCompletionAsync(Guid registrationId, Guid tenantId, string tenantName, CancellationToken cancellationToken = default);
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
