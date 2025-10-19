using MassTransit;
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
using Stocker.Modules.Sales.Infrastructure;
using Stocker.Modules.Finance.Infrastructure;
using Stocker.Modules.Inventory.Infrastructure;
using Stocker.SharedKernel.Settings;
using Stocker.SignalR.Extensions;

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
    .AddEnvironmentVariables();

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

// Layer Services (Application, Persistence, Infrastructure, Identity)
builder.Services.AddApplication(builder.Configuration);
builder.Services.AddPersistenceServices(builder.Configuration);
builder.Services.AddInfrastructureServices(builder.Configuration, builder.Environment);
builder.Services.AddIdentityServices(builder.Configuration);
builder.Services.AddMultiTenancy();

// ========================================
// MASSTRANSIT - CENTRALIZED CONFIGURATION
// ========================================
// Configure MassTransit once for all modules
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
});

// ========================================
// MODULAR ARCHITECTURE - CONDITIONAL LOADING
// ========================================
// Load modules based on configuration (tenant subscriptions)
var enabledModules = builder.Configuration.GetSection("EnabledModules");

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
    builder.Services.AddSalesInfrastructure(builder.Configuration);
}

// Finance Module
if (enabledModules.GetValue<bool>("Finance"))
{
    Log.Information("Loading Finance Module...");
    builder.Services.AddFinanceInfrastructure(builder.Configuration);
}

// Inventory Module
if (enabledModules.GetValue<bool>("Inventory"))
{
    Log.Information("Loading Inventory Module...");
    builder.Services.AddInventoryInfrastructure(builder.Configuration);
}

// SignalR Services
builder.Services.AddSignalRServices();

// SignalR Redis (if connection string available for scale-out)
var redisConnection = builder.Configuration.GetConnectionString("Redis");
if (!string.IsNullOrEmpty(redisConnection))
{
    builder.Services.AddSignalRRedis(redisConnection);
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
// MIDDLEWARE PIPELINE
// ========================================
app.UseApiPipeline(builder.Configuration);

// ========================================
// DATABASE MIGRATION
// ========================================
await app.MigrateDatabaseAsync();

// ========================================
// RUN APPLICATION
// ========================================
app.Run();

// Make Program class accessible for integration tests
public partial class Program { }
