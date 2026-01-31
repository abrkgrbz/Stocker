using Hangfire;
using MassTransit;
using Microsoft.Extensions.Caching.Hybrid;
using Microsoft.Extensions.Caching.StackExchangeRedis;
using Serilog;
using Stocker.API.Configuration;
using Stocker.API.Extensions;
using Stocker.Application;
using Stocker.Identity.Extensions;
using Stocker.Infrastructure.Extensions;
using Stocker.Infrastructure.BackgroundJobs;
using Stocker.Infrastructure.RateLimiting;
using Stocker.Persistence.Extensions;
using Stocker.Modules.CRM;
using Stocker.Modules.Sales;
using Stocker.Modules.Finance;
using Stocker.Modules.Inventory;
using Stocker.Modules.HR;
using Stocker.Modules.Purchase;
using Stocker.Modules.Manufacturing;
using Stocker.SharedKernel.Settings;
using Stocker.SignalR.Extensions;
using Stocker.Modules.CRM.Infrastructure.BackgroundJobs;
using Stocker.Persistence.Filters;
using Prometheus;

// ========================================
// NPGSQL CONFIGURATION
// ========================================
// Enable legacy timestamp behavior for Npgsql
// This allows DateTime to work with both 'timestamp with time zone' and 'timestamp without time zone'
// MUST be set at the very beginning, before any DbContext instances are created
AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

var builder = WebApplication.CreateBuilder(args);

// ========================================
// KESTREL SERVER CONFIGURATION
// ========================================
builder.WebHost.ConfigureKestrelServer();

// ========================================
// CONFIGURATION SOURCES
// ========================================
builder.Configuration
    .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
    .AddJsonFile($"appsettings.{builder.Environment.EnvironmentName}.json", optional: true, reloadOnChange: true)
    .AddEnvironmentVariables()
    .AddAzureKeyVault(builder.Environment); // Add Azure Key Vault support

if (builder.Environment.IsDevelopment())
{
    builder.Configuration.AddUserSecrets<Program>();
}

// ========================================
// LOGGING (SERILOG)
// ========================================
SerilogConfiguration.ConfigureLogging(builder.Configuration, builder.Host);

// ========================================
// SERVICE REGISTRATION
// ========================================

// CORS Policies
builder.Services.AddCorsPolicies(builder.Configuration, builder.Environment);

// Settings Configuration
builder.Services.Configure<DatabaseSettings>(builder.Configuration.GetSection("DatabaseSettings"));

// Controllers with Filters, Versioning and JSON Options
builder.Services.AddApiControllersWithVersioning();

// Response Compression
builder.Services.AddResponseCompressionServices();

// Security Services (Headers, Correlation, Rate Limiting)
builder.Services.AddSecurityServices(builder.Configuration);

// Caching Services (ETag, Cache-Control, Response Caching, Output Caching)
builder.Services.AddCachingServices(builder.Configuration);

// Monitoring Services (Health Checks, Metrics)
builder.Services.AddMonitoringServices(builder.Configuration);

// Swagger Documentation
builder.Services.AddSwaggerDocumentation();

// Layer Services (Application, Infrastructure, Persistence, Identity)
// Note: Infrastructure must be registered before Persistence because
// TenantDatabaseSecurityService depends on IEncryptionService and ISecretStore
builder.Services.AddApplication(builder.Configuration);
builder.Services.AddInfrastructureServices(builder.Configuration, builder.Environment);
builder.Services.AddPersistenceServices(builder.Configuration);
builder.Services.AddIdentityServices(builder.Configuration);
builder.Services.AddMultiTenancy();

// ========================================
// MASSTRANSIT - CENTRALIZED CONFIGURATION
// ========================================
// Configure MassTransit once for all modules
var rabbitMqEnabled = builder.Configuration.GetValue<bool>("RabbitMQ:Enabled");

builder.Services.AddMassTransit(x =>
{
    var enabledModules = builder.Configuration.GetSection("EnabledModules");

    // Register consumers from enabled modules
    if (enabledModules.GetValue<bool>("CRM"))
    {
        Stocker.Modules.CRM.Infrastructure.DependencyInjection.AddCRMConsumers(x);
    }

    if (enabledModules.GetValue<bool>("Sales"))
    {
        Stocker.Modules.Sales.Infrastructure.DependencyInjection.AddSalesConsumers(x);
    }

    if (enabledModules.GetValue<bool>("Finance"))
    {
        Stocker.Modules.Finance.Infrastructure.DependencyInjection.AddFinanceConsumers(x);
    }

    if (enabledModules.GetValue<bool>("Inventory"))
    {
        Stocker.Modules.Inventory.Infrastructure.DependencyInjection.AddInventoryConsumers(x);
    }

    // Configure transport based on RabbitMQ availability
    if (rabbitMqEnabled)
    {
        Log.Information("Configuring MassTransit with RabbitMQ transport");

        // Configure RabbitMQ
        x.UsingRabbitMq((context, cfg) =>
        {
            var rabbitMqHost = builder.Configuration.GetValue<string>("RabbitMQ:Host") ?? "localhost";
            var rabbitMqVirtualHost = builder.Configuration.GetValue<string>("RabbitMQ:VirtualHost") ?? "/";
            var rabbitMqUsername = builder.Configuration.GetValue<string>("RabbitMQ:Username") ?? "guest";
            var rabbitMqPassword = builder.Configuration.GetValue<string>("RabbitMQ:Password") ?? "guest";
            var retryCount = builder.Configuration.GetValue<int>("RabbitMQ:RetryCount");
            var retryInterval = builder.Configuration.GetValue<int>("RabbitMQ:RetryInterval");

            cfg.Host(rabbitMqHost, rabbitMqVirtualHost, h =>
            {
                h.Username(rabbitMqUsername);
                h.Password(rabbitMqPassword);

                // Connection resilience
                h.RequestedConnectionTimeout(TimeSpan.FromSeconds(30));
                h.Heartbeat(TimeSpan.FromSeconds(60));
            });

            // Tenant context filter - sets tenant context for ITenantEvent messages
            cfg.UseConsumeFilter(typeof(TenantConsumeFilter<>), context);

            // Global retry policy with exponential backoff
            cfg.UseMessageRetry(r =>
            {
                r.Exponential(retryCount,
                    TimeSpan.FromSeconds(retryInterval),
                    TimeSpan.FromSeconds(retryInterval * 10),
                    TimeSpan.FromSeconds(retryInterval));

                // Only retry on specific exceptions
                r.Ignore<ArgumentNullException>();
                r.Ignore<InvalidOperationException>();
            });

            // Circuit breaker to prevent cascading failures
            cfg.UseCircuitBreaker(cb =>
            {
                cb.TrackingPeriod = TimeSpan.FromMinutes(1);
                cb.TripThreshold = 15;
                cb.ActiveThreshold = 10;
                cb.ResetInterval = TimeSpan.FromMinutes(5);
            });

            // Dead letter queue configuration
            cfg.UseDelayedRedelivery(r => r.Intervals(
                TimeSpan.FromSeconds(5),
                TimeSpan.FromSeconds(15),
                TimeSpan.FromSeconds(30)));

            // Configure endpoints for all modules
            cfg.ConfigureEndpoints(context);
        });
    }
    else
    {
        Log.Warning("RabbitMQ is disabled. Using in-memory transport for MassTransit. Events will NOT be persisted or distributed.");

        // Use in-memory transport when RabbitMQ is not available
        x.UsingInMemory((context, cfg) =>
        {
            // Tenant context filter - sets tenant context for ITenantEvent messages
            cfg.UseConsumeFilter(typeof(TenantConsumeFilter<>), context);

            cfg.ConfigureEndpoints(context);
        });
    }
});

// ========================================
// AUTOMAPPER - CENTRALIZED REGISTRATION
// ========================================
// Register all AutoMapper profiles from all modules in a single call
// This prevents profile conflicts when multiple modules call AddAutoMapper separately
var enabledModules = builder.Configuration.GetSection("EnabledModules");

builder.Services.AddAutoMapper(cfg =>
{
    if (enabledModules.GetValue<bool>("CRM"))
    {
        cfg.AddProfile<Stocker.Modules.CRM.Application.Mappings.CRMProfile>();
        Log.Information("AutoMapper: CRMProfile registered");
    }
    if (enabledModules.GetValue<bool>("Sales"))
    {
        cfg.AddProfile<Stocker.Modules.Sales.Application.Mappings.SalesProfile>();
        Log.Information("AutoMapper: SalesProfile registered");
    }
    if (enabledModules.GetValue<bool>("Finance"))
    {
        cfg.AddProfile<Stocker.Modules.Finance.Application.Mappings.FinanceProfile>();
        Log.Information("AutoMapper: FinanceProfile registered");
    }
    if (enabledModules.GetValue<bool>("Purchase"))
    {
        cfg.AddProfile<Stocker.Modules.Purchase.Application.Mappings.PurchaseProfile>();
        Log.Information("AutoMapper: PurchaseProfile registered");
    }
});
Log.Information("AutoMapper centralized registration completed");

// ========================================
// MODULAR ARCHITECTURE - CONDITIONAL LOADING
// ========================================
// Load modules based on configuration (tenant subscriptions)

// CRM Module
if (enabledModules.GetValue<bool>("CRM"))
{
    Log.Information("Loading CRM Module...");
    builder.Services.AddCRMModule(builder.Configuration);
}

// Sales Module
if (enabledModules.GetValue<bool>("Sales"))
{
    Log.Information("Loading Sales Module...");
    builder.Services.AddSalesModule(builder.Configuration);
}

// Finance Module
if (enabledModules.GetValue<bool>("Finance"))
{
    Log.Information("Loading Finance Module...");
    builder.Services.AddFinanceModule(builder.Configuration);
}

// Inventory Module
if (enabledModules.GetValue<bool>("Inventory"))
{
    Log.Information("Loading Inventory Module...");
    builder.Services.AddInventoryModule(builder.Configuration);
}

// HR Module
if (enabledModules.GetValue<bool>("HR"))
{
    Log.Information("Loading HR Module...");
    builder.Services.AddHRModule(builder.Configuration);
}

// Purchase Module
if (enabledModules.GetValue<bool>("Purchase"))
{
    Log.Information("Loading Purchase Module...");
    builder.Services.AddPurchaseModule(builder.Configuration);
}

// Manufacturing Module
if (enabledModules.GetValue<bool>("Manufacturing"))
{
    Log.Information("Loading Manufacturing Module...");
    builder.Services.AddManufacturingModule(builder.Configuration);
}

// SignalR Services
builder.Services.AddSignalRServices();

// SignalR Redis (if connection string available for scale-out)
var redisConnection = builder.Configuration.GetConnectionString("Redis");
if (!string.IsNullOrEmpty(redisConnection))
{
    builder.Services.AddSignalRRedis(redisConnection);
}

// ========================================
// HYBRID CACHE (L1 Memory + L2 Redis)
// ========================================
// HybridCache provides two-tier caching:
// - L1: In-process memory cache (fast, per-instance)
// - L2: Distributed Redis cache (shared across instances)
builder.Services.AddHybridCache(options =>
{
    // Default expiration for cached items
    options.DefaultEntryOptions = new HybridCacheEntryOptions
    {
        // L1 (Memory) expiration - shorter for memory efficiency
        LocalCacheExpiration = TimeSpan.FromMinutes(30),

        // L2 (Redis) expiration - longer for reference data
        Expiration = TimeSpan.FromHours(24)
    };

    // Maximum size per cached entry (10MB)
    options.MaximumPayloadBytes = 10 * 1024 * 1024;

    // Maximum number of entries in L1 cache
    options.MaximumKeyLength = 1024;
});

// Configure Redis as L2 distributed cache (if connection string available)
if (!string.IsNullOrEmpty(redisConnection))
{
    builder.Services.AddStackExchangeRedisCache(options =>
    {
        options.Configuration = redisConnection;
        options.InstanceName = "Stocker:";
    });

    Log.Information("HybridCache configured with Redis L2 backend");
}
else
{
    // Fallback to memory-only distributed cache for development
    builder.Services.AddDistributedMemoryCache();
    Log.Warning("HybridCache running in memory-only mode (no Redis configured)");
}

// Localization
builder.Services.AddRequestLocalizationOptions();

// Authorization Policies
builder.Services.AddAuthorizationPolicies();

// Tenant-based Rate Limiting
builder.Services.AddTenantRateLimiting(builder.Configuration);

// ========================================
// BUILD APPLICATION
// ========================================
var app = builder.Build();

// ========================================
// CONFIGURE API CATEGORY ENRICHER
// ========================================
// Configure after DI container is built to enable HttpContextAccessor injection
SerilogConfiguration.ConfigureApiCategoryEnricher(app.Services, app.Configuration);

// ========================================
// DATABASE MIGRATION (MUST BE BEFORE MIDDLEWARE)
// ========================================
// IMPORTANT: Database migration must run BEFORE UseApiPipeline because
// Hangfire initialization (inside UseApiPipeline) requires Hangfire database to exist
await app.MigrateDatabaseAsync();

// ========================================
// MIDDLEWARE PIPELINE
// ========================================
app.UseApiPipeline(builder.Configuration);

// ========================================
// HANGFIRE RECURRING JOBS
// ========================================
// CRITICAL: Remove old reminder job from queue if it exists
// This job was causing tenant context errors in multi-tenant environment
RecurringJob.RemoveIfExists("process-due-reminders");
Log.Information("Removed legacy reminder job (multi-tenant context issue)");

// Register reminder processing job (currently disabled - see ReminderJob.cs for details)
ReminderJob.RegisterRecurringJob();
Log.Information("Hangfire recurring jobs registered successfully");

// ========================================
// RUN APPLICATION
// ========================================
app.Run();

// Make Program class accessible for integration tests
public partial class Program { }
