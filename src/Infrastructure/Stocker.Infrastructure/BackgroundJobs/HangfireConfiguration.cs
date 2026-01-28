using Hangfire;
using Hangfire.Dashboard;
using Hangfire.PostgreSql;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Stocker.Infrastructure.BackgroundJobs;

public static class HangfireConfiguration
{
    public static IServiceCollection AddHangfireServices(this IServiceCollection services, IConfiguration configuration)
    {
        // Get connection string with fallback options - Use HangfireConnection first
        var connectionString = configuration.GetConnectionString("HangfireConnection") 
            ?? configuration.GetConnectionString("MasterConnection");
        
        // If connection string is not found, try to build it from environment variables
        if (string.IsNullOrEmpty(connectionString))
        {
            var dbHost = configuration["DB_HOST"] ?? "localhost";
            var dbPort = configuration["DB_PORT"] ?? "5432";
            var dbName = configuration["HANGFIRE_DB_NAME"] ?? "stocker_hangfire";
            var dbUser = configuration["DB_USER"] ?? "stocker_user";
            var dbPassword = configuration["DB_PASSWORD"] ?? "stocker_pass";

            connectionString = $"Host={dbHost};Port={dbPort};Database={dbName};Username={dbUser};Password={dbPassword};Include Error Detail=true";
            Console.WriteLine($"[Hangfire] Built connection string from environment variables");
        }
        
        Console.WriteLine($"[Hangfire] Connection string configured: {!string.IsNullOrEmpty(connectionString)}");
        
        // Hangfire konfigürasyonu
        services.AddHangfire(config => config
            .SetDataCompatibilityLevel(CompatibilityLevel.Version_180)
            .UseSimpleAssemblyNameTypeSerializer()
            .UseRecommendedSerializerSettings()
            .UsePostgreSqlStorage(options =>
            {
                options.UseNpgsqlConnection(connectionString);
            }, new PostgreSqlStorageOptions
            {
                QueuePollInterval = TimeSpan.FromSeconds(15),
                SchemaName = "hangfire",
                PrepareSchemaIfNecessary = true,
                InvisibilityTimeout = TimeSpan.FromMinutes(30),
                DistributedLockTimeout = TimeSpan.FromMinutes(5),
                TransactionSynchronisationTimeout = TimeSpan.FromMinutes(5),
                JobExpirationCheckInterval = TimeSpan.FromHours(1)
            }));

        // Hangfire server with retry configuration
        services.AddHangfireServer(options =>
        {
            options.ServerName = $"Stocker-{Environment.MachineName}";
            options.WorkerCount = Environment.ProcessorCount * 2;
            options.Queues = new[] { "critical", "default", "backups", "maintenance", "low" };
            options.ServerCheckInterval = TimeSpan.FromSeconds(30);
            options.ServerTimeout = TimeSpan.FromMinutes(5);
            options.SchedulePollingInterval = TimeSpan.FromSeconds(15);
            options.HeartbeatInterval = TimeSpan.FromSeconds(30);
        });

        return services;
    }

    public static IApplicationBuilder UseHangfireDashboard(this IApplicationBuilder app, IConfiguration configuration)
    {
        var dashboardPath = configuration.GetValue<string>("Hangfire:DashboardPath") ?? "/hangfire";

        // Get JWT settings for authorization
        var jwtSecret = configuration["JwtSettings:Secret"];
        var jwtIssuer = configuration["JwtSettings:Issuer"] ?? "Stocker";
        var jwtAudience = configuration["JwtSettings:Audience"] ?? "Stocker";

        app.UseHangfireDashboard(dashboardPath, new DashboardOptions
        {
            DashboardTitle = "Stocker - Background Jobs",
            Authorization = new[] {
                new HangfireJwtAuthorizationFilter(jwtSecret, jwtIssuer, jwtAudience)
            },
            IgnoreAntiforgeryToken = true,
            DisplayStorageConnectionString = false,
            IsReadOnlyFunc = (DashboardContext context) => false
        });

        // Schedule recurring jobs
        ScheduleRecurringJobs();

        return app;
    }

    /// <summary>
    /// Schedules all recurring background jobs.
    /// Note: Module-specific jobs are registered in their respective DependencyInjection files.
    /// </summary>
    private static void ScheduleRecurringJobs()
    {
        // ═══════════════════════════════════════════════════════════════
        // CRITICAL PRIORITY JOBS
        // ═══════════════════════════════════════════════════════════════

        // Tenant health check - runs every 15 minutes
        TenantHealthCheckJob.Schedule();

        // Subscription renewal check - runs daily at 08:00 UTC (critical for revenue)
        // TODO: Re-enable after INotificationService methods are implemented
        // SubscriptionRenewalCheckJob.Schedule();

        // ═══════════════════════════════════════════════════════════════
        // DEFAULT PRIORITY JOBS
        // ═══════════════════════════════════════════════════════════════

        // Trial subscription check - runs daily at 09:00 UTC
        TrialSubscriptionCheckJob.Schedule();

        // Inactive user detection - runs weekly on Monday at 06:00 UTC
        // TODO: Re-enable after INotificationService methods are implemented
        // InactiveUserDetectionJob.Schedule();

        // ═══════════════════════════════════════════════════════════════
        // MAINTENANCE PRIORITY JOBS
        // ═══════════════════════════════════════════════════════════════

        // Expired invitation cleanup - runs daily at 02:00 UTC
        ExpiredInvitationCleanupJob.Schedule();

        // Audit log archive - runs monthly on 1st at 02:00 UTC
        AuditLogArchiveJob.Schedule();

        // Database maintenance - runs weekly on Sunday at 04:00 UTC
        // TODO: Re-enable after fixing ConnectionString conversion
        // DatabaseMaintenanceJob.Schedule();

        // ═══════════════════════════════════════════════════════════════
        // REAL-TIME MONITORING JOBS
        // ═══════════════════════════════════════════════════════════════

        // System monitoring metrics - runs every 15 seconds
        RecurringJob.AddOrUpdate<MonitoringMetricsJob>(
            "monitoring-metrics",
            job => job.CollectAndPushMetrics(),
            "*/15 * * * * *", // Every 15 seconds
            new RecurringJobOptions
            {
                TimeZone = TimeZoneInfo.Utc
            });

        // Docker stats collection - runs every 30 seconds
        RecurringJob.AddOrUpdate<MonitoringMetricsJob>(
            "docker-stats-monitoring",
            job => job.CollectAndPushDockerStats(),
            "*/30 * * * * *", // Every 30 seconds
            new RecurringJobOptions
            {
                TimeZone = TimeZoneInfo.Utc
            });

        // ═══════════════════════════════════════════════════════════════
        // BACKUP JOBS
        // ═══════════════════════════════════════════════════════════════

        // Backup cleanup - runs daily at 3:00 AM UTC
        RecurringJob.AddOrUpdate<BackupJob>(
            "backup-cleanup-global",
            job => job.CleanupAllExpiredBackupsAsync(CancellationToken.None),
            "0 3 * * *", // Daily at 3:00 AM
            new RecurringJobOptions
            {
                TimeZone = TimeZoneInfo.Utc
            });

        // ═══════════════════════════════════════════════════════════════
        // MODULE-SPECIFIC JOBS
        // ═══════════════════════════════════════════════════════════════
        // Module jobs are scheduled from HangfireJobScheduler in the API layer
        // where all modules are referenced. Each module defines its jobs in:
        // - Infrastructure/BackgroundJobs/[JobName].cs
        // - Infrastructure/DependencyInjection.cs (Schedule[Module]Jobs() method)
        //
        // Available module jobs:
        // - Inventory: StockReorderAlertJob (every 4 hours)
        // - Sales: QuotationExpiryCheckJob (daily at 01:00 UTC)
        // - Purchase: PurchaseOrderFollowupJob (daily at 10:00 UTC)
        // - HR: LeaveBalanceAccrualJob (monthly on 1st at 00:30 UTC)
        // - Finance: InvoiceDueDateReminderJob (daily at 09:00 UTC)
        // - CRM: LeadScoringRecalculationJob (every 6 hours), ReminderJob (every minute)
    }
}