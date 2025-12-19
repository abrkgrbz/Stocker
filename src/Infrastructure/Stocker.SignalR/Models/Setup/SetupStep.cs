namespace Stocker.SignalR.Models.Setup;

/// <summary>
/// Tenant setup/provisioning steps
/// </summary>
public enum SetupStep
{
    /// <summary>
    /// Initializing the setup process
    /// </summary>
    Initializing = 0,

    /// <summary>
    /// Creating the tenant database
    /// </summary>
    CreatingDatabase = 1,

    /// <summary>
    /// Running database migrations
    /// </summary>
    RunningMigrations = 2,

    /// <summary>
    /// Seeding initial data
    /// </summary>
    SeedingData = 3,

    /// <summary>
    /// Configuring selected modules
    /// </summary>
    ConfiguringModules = 4,

    /// <summary>
    /// Creating storage resources
    /// </summary>
    CreatingStorage = 5,

    /// <summary>
    /// Activating the tenant
    /// </summary>
    ActivatingTenant = 6,

    /// <summary>
    /// Setup completed successfully
    /// </summary>
    Completed = 7,

    /// <summary>
    /// Setup failed
    /// </summary>
    Failed = -1
}
