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

// CRM Module
builder.Services.AddCRMModule(builder.Configuration);

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
