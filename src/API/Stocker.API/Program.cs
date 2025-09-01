using Serilog;
using Stocker.API.Configuration;
using Stocker.API.Filters;
using Stocker.Application;
using Stocker.Identity.Extensions;
using Stocker.Infrastructure.Extensions;
using Stocker.Infrastructure.BackgroundJobs;
using Stocker.Infrastructure.Middleware;
using Stocker.Persistence.Extensions;
using Stocker.Modules.CRM;
using Stocker.SharedKernel.Settings;
using Stocker.SignalR.Extensions;
using Stocker.SignalR.Hubs;
using Microsoft.AspNetCore.RateLimiting;
using System.Threading.RateLimiting;
using System.Globalization;
using Microsoft.AspNetCore.Localization;

var builder = WebApplication.CreateBuilder(args);

// Add configuration sources
builder.Configuration
    .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
    .AddJsonFile($"appsettings.{builder.Environment.EnvironmentName}.json", optional: true, reloadOnChange: true)
    .AddEnvironmentVariables();

// Add User Secrets in Development
if (builder.Environment.IsDevelopment())
{
    builder.Configuration.AddUserSecrets<Program>();
}

// Configure Serilog with Seq
SerilogConfiguration.ConfigureLogging(builder.Configuration, builder.Host);

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        policy =>
        {
            policy.WithOrigins("http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "http://localhost:3003", "http://localhost:5107")
                  .AllowAnyMethod()
                  .AllowAnyHeader()
                  .AllowCredentials()
                  .SetIsOriginAllowed(_ => true); // SignalR için gerekli
        });
    
    // SignalR için özel policy
    options.AddPolicy("SignalRPolicy",
        policy =>
        {
            policy.WithOrigins("http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "http://localhost:3003")
                  .AllowAnyMethod()
                  .AllowAnyHeader()
                  .AllowCredentials()
                  .SetIsOriginAllowed(_ => true);
        });
    
    // Production için geçici olarak tüm origin'lere izin ver
    options.AddPolicy("Production",
        policy =>
        {
            policy.AllowAnyMethod()
                  .AllowAnyHeader()
                  .AllowCredentials()
                  .SetIsOriginAllowed(_ => true) // Tüm origin'lere izin ver
                  .WithExposedHeaders("*"); // Tüm header'ları expose et
        });
});

// Configure Settings
builder.Services.Configure<DatabaseSettings>(builder.Configuration.GetSection("DatabaseSettings"));

// Add services to the container
builder.Services.AddControllers()
    .AddApplicationPart(typeof(Stocker.Modules.CRM.CRMModule).Assembly) // CRM Controller'larını yükle
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
        options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    // Master Admin APIs
    c.SwaggerDoc("master", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "Stocker Master API",
        Version = "v1",
        Description = "Master administration endpoints for system management"
    });
    
    // Tenant APIs
    c.SwaggerDoc("tenant", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "Stocker Tenant API",
        Version = "v1",
        Description = "Tenant-specific endpoints for business operations"
    });
    
    // Public APIs
    c.SwaggerDoc("public", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "Stocker Public API",
        Version = "v1",
        Description = "Public endpoints for registration and authentication"
    });
    
    // Admin APIs
    c.SwaggerDoc("admin", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "Stocker Admin API",
        Version = "v1",
        Description = "System administration and migration endpoints"
    });
    
    // Add JWT Authentication
    var securityScheme = new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Description = "JWT Authorization header using the Bearer scheme. \r\n\r\n Enter your token in the text input below.\r\n\r\nExample: \"1234567890abcdef\"",
        Reference = new Microsoft.OpenApi.Models.OpenApiReference
        {
            Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
            Id = "Bearer"
        }
    };
    
    c.AddSecurityDefinition("Bearer", securityScheme);
    
    // Add security requirement for non-public APIs
    var securityRequirement = new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        { securityScheme, new[] { "Bearer" } }
    };
    
    c.AddSecurityRequirement(securityRequirement);
    
    // Use custom schema IDs for cleaner documentation
    c.CustomSchemaIds(type =>
    {
        var typeName = type.Name;
        
        // Handle generic types with full type information
        if (type.IsGenericType)
        {
            var genericTypeName = type.GetGenericTypeDefinition().Name;
            // Remove the `1, `2 etc from the generic type name
            if (genericTypeName.Contains('`'))
            {
                genericTypeName = genericTypeName.Substring(0, genericTypeName.IndexOf('`'));
            }
            
            // Get the generic arguments and build their names recursively
            var genericArgs = type.GetGenericArguments();
            var genericArgNames = new List<string>();
            
            foreach (var arg in genericArgs)
            {
                if (arg.IsGenericType)
                {
                    // Recursively handle nested generics
                    var nestedName = arg.GetGenericTypeDefinition().Name;
                    if (nestedName.Contains('`'))
                    {
                        nestedName = nestedName.Substring(0, nestedName.IndexOf('`'));
                    }
                    var nestedArgs = arg.GetGenericArguments();
                    var nestedArgNames = nestedArgs.Select(a => a.Name.Replace("Dto", ""));
                    genericArgNames.Add($"{nestedName}Of{string.Join("And", nestedArgNames)}");
                }
                else
                {
                    // Simple type - clean up the name
                    var argName = arg.Name;
                    // Remove common suffixes for cleaner names
                    argName = argName.Replace("Dto", "").Replace("ViewModel", "VM");
                    genericArgNames.Add(argName);
                }
            }
            
            typeName = $"{genericTypeName}Of{string.Join("_", genericArgNames)}";
        }
        
        // Add namespace prefix for duplicate class names to avoid conflicts
        var duplicateNames = new[] 
        { 
            "ProcessPaymentCommand", 
            "ProcessPaymentResult",
            "PaymentResultDto",
            "CreateInvoiceCommand",
            "UpdateInvoiceCommand",
            "ApiResponse",
            "PagedResult" 
        };
        
        var baseTypeName = typeName.Contains("Of") ? typeName.Substring(0, typeName.IndexOf("Of")) : typeName;
        
        if (duplicateNames.Contains(baseTypeName))
        {
            // Get the immediate parent namespace for context
            var namespaceParts = type.Namespace?.Split('.') ?? Array.Empty<string>();
            if (namespaceParts.Length > 0)
            {
                var context = namespaceParts[^1]; // Get last part of namespace
                if (context == "ProcessPayment" || context == "Commands" || context == "Queries")
                {
                    // Go one level up for better context
                    context = namespaceParts.Length > 1 ? namespaceParts[^2] : context;
                }
                
                // Only add context if it's not already in the name
                if (!typeName.StartsWith(context))
                {
                    typeName = $"{context}_{typeName}";
                }
            }
        }
        
        // Clean up common suffixes for better readability (but not for generics)
        if (!type.IsGenericType)
        {
            var cleanupSuffixes = new Dictionary<string, string>
            {
                { "Dto", "" },
                { "ViewModel", "VM" },
                { "Request", "Req" },
                { "Response", "Res" },
                { "Command", "Cmd" },
                { "Query", "Qry" }
            };
            
            foreach (var suffix in cleanupSuffixes)
            {
                if (typeName.EndsWith(suffix.Key) && typeName.Length > suffix.Key.Length)
                {
                    typeName = typeName.Substring(0, typeName.Length - suffix.Key.Length) + suffix.Value;
                    break;
                }
            }
        }
        
        return typeName;
    });
    
    // Enable annotations
    c.EnableAnnotations();
    
    // Include XML comments for better documentation
    var xmlFile = $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    if (File.Exists(xmlPath))
    {
        c.IncludeXmlComments(xmlPath);
    }
    
    // Add schema filter to clean up schema display
    c.SchemaFilter<CleanupSchemaFilter>();
    
    // Group endpoints by path
    c.DocInclusionPredicate((docName, apiDesc) =>
    {
        var path = apiDesc.RelativePath?.ToLower() ?? "";
        
        return docName switch
        {
            "master" => path.Contains("/master/"),
            "tenant" => path.Contains("/tenant/"),
            "public" => path.Contains("/public/") || path.Contains("/auth"),
            "admin" => path.Contains("/admin/"),
            _ => false
        };
    });
    
    // Add operation filter to conditionally apply security requirements
    c.OperationFilter<AuthorizeCheckOperationFilter>();
});

// Add layer services using extension methods
builder.Services.AddApplication(builder.Configuration);
builder.Services.AddPersistenceServices(builder.Configuration);
builder.Services.AddInfrastructureServices(builder.Configuration, builder.Environment);
builder.Services.AddIdentityServices(builder.Configuration);
builder.Services.AddMultiTenancy();

// Add CRM Module
builder.Services.AddCRMModule(builder.Configuration);

// Add SignalR Services
builder.Services.AddSignalRServices();

// Configure SignalR for Redis if connection string is available (for scale-out)
var redisConnection = builder.Configuration.GetConnectionString("Redis");
if (!string.IsNullOrEmpty(redisConnection))
{
    builder.Services.AddSignalRRedis(redisConnection);
}

// Configure Localization
builder.Services.Configure<RequestLocalizationOptions>(options =>
{
    var supportedCultures = new[] { "tr-TR", "en-US" };
    options.SetDefaultCulture("tr-TR");
    options.AddSupportedCultures(supportedCultures);
    options.AddSupportedUICultures(supportedCultures);
});

// Add Authorization Policies
builder.Services.AddAuthorization(options =>
{
    // System Admin - Full system access
    options.AddPolicy("SystemAdminPolicy", policy =>
        policy.RequireRole("SistemYoneticisi"));
    
    // Tenant Admin - Tenant-scoped access
    options.AddPolicy("TenantAdminPolicy", policy =>
        policy.RequireRole("FirmaYoneticisi", "SistemYoneticisi"));
    
    // Regular User
    options.AddPolicy("UserPolicy", policy =>
        policy.RequireAuthenticatedUser()
              .RequireClaim("TenantId"));
});

// Add Rate Limiting
builder.Services.AddRateLimiter(options =>
{
    // Global limiter (skip for SignalR and public endpoints)
    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(httpContext =>
    {
        // Skip rate limiting for SignalR hubs
        if (httpContext.Request.Path.StartsWithSegments("/hubs"))
        {
            return RateLimitPartition.GetNoLimiter("signalr");
        }
        
        // Skip rate limiting for public endpoints
        if (httpContext.Request.Path.StartsWithSegments("/api/public"))
        {
            return RateLimitPartition.GetNoLimiter("public");
        }
        
        return RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: httpContext.User.Identity?.Name ?? httpContext.Request.Headers.Host.ToString(),
            factory: partition => new FixedWindowRateLimiterOptions
            {
                AutoReplenishment = true,
                PermitLimit = 100,
                QueueLimit = 0,
                Window = TimeSpan.FromMinutes(1)
            });
    });

    // Specific limiter for auth endpoints
    options.AddPolicy("auth", httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            factory: partition => new FixedWindowRateLimiterOptions
            {
                AutoReplenishment = true,
                PermitLimit = 5,
                QueueLimit = 0,
                Window = TimeSpan.FromMinutes(1)
            }));

    // API limiter for general endpoints
    options.AddPolicy("api", httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: httpContext.User.Identity?.Name ?? httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            factory: partition => new FixedWindowRateLimiterOptions
            {
                AutoReplenishment = true,
                PermitLimit = 60,
                QueueLimit = 0,
                Window = TimeSpan.FromMinutes(1)
            }));

    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
});

var app = builder.Build();

// Configure the HTTP request pipeline
// Swagger'ı hem development hem de production'da kullanılabilir yap
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/master/swagger.json", "Master API");
    c.SwaggerEndpoint("/swagger/tenant/swagger.json", "Tenant API");
    c.SwaggerEndpoint("/swagger/public/swagger.json", "Public API");
    c.SwaggerEndpoint("/swagger/admin/swagger.json", "Admin API");
    c.RoutePrefix = string.Empty; // Swagger UI at root
    c.DocumentTitle = "Stocker API Documentation";
});

// Use CORS - En başta olmalı
// Check for production domains in the current host
var currentHost = app.Configuration["ASPNETCORE_URLS"] ?? "";
var isProductionDomain = currentHost.Contains("stoocker.app") || 
                        app.Environment.EnvironmentName.Equals("Production", StringComparison.OrdinalIgnoreCase);

if (isProductionDomain)
{
    app.Logger.LogInformation("Using Production CORS policy");
    app.UseCors("Production");
}
else
{
    app.Logger.LogInformation("Using AllowAll CORS policy");
    app.UseCors("AllowAll");
}

// Enable WebSockets for SignalR
app.UseWebSockets(new WebSocketOptions
{
    KeepAliveInterval = TimeSpan.FromSeconds(30)
});

// Add Global Exception Handling Middleware
app.UseMiddleware<GlobalExceptionHandlingMiddleware>();

// Configure Serilog Request Logging
SerilogConfiguration.ConfigureRequestLogging(app);

// Use Request Localization
app.UseRequestLocalization();

// HTTPS redirect'i sadece production'da kullan
if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

// Add Security Headers (Skip for SignalR hubs)
app.Use(async (context, next) =>
{
    // Skip security headers for SignalR hubs to allow WebSocket connections
    if (!context.Request.Path.StartsWithSegments("/hubs"))
    {
        context.Response.Headers.Append("X-Content-Type-Options", "nosniff");
        context.Response.Headers.Append("X-Frame-Options", "DENY");
        context.Response.Headers.Append("X-XSS-Protection", "1; mode=block");
        context.Response.Headers.Append("Referrer-Policy", "strict-origin-when-cross-origin");
        // Update CSP to allow WebSocket connections
        context.Response.Headers.Append("Content-Security-Policy", 
            "default-src 'self'; " +
            "script-src 'self' 'unsafe-inline'; " +
            "style-src 'self' 'unsafe-inline'; " +
            "connect-src 'self' wss: ws: https: http:;");
    }
    await next();
});

// Add Tenant Resolution Middleware - Authentication'dan önce olmalı
// SignalR hub'ları için kontrol middleware'da yapılıyor
app.UseMiddleware<TenantResolutionMiddleware>();

app.UseAuthentication();
app.UseAuthorization();

// Add Rate Limiting - Authentication'dan sonra olmalı
app.UseRateLimiter();

// Add Hangfire Dashboard (after authentication to secure it)
app.UseHangfireDashboard(app.Configuration);

// Map controllers
app.MapControllers();

// Map SignalR Hubs with CORS
app.MapHub<ValidationHub>("/hubs/validation", options =>
{
    options.Transports = Microsoft.AspNetCore.Http.Connections.HttpTransportType.WebSockets |
                         Microsoft.AspNetCore.Http.Connections.HttpTransportType.ServerSentEvents |
                         Microsoft.AspNetCore.Http.Connections.HttpTransportType.LongPolling;
}).RequireCors("AllowAll");

app.MapHub<NotificationHub>("/hubs/notification", options =>
{
    options.Transports = Microsoft.AspNetCore.Http.Connections.HttpTransportType.WebSockets |
                         Microsoft.AspNetCore.Http.Connections.HttpTransportType.ServerSentEvents |
                         Microsoft.AspNetCore.Http.Connections.HttpTransportType.LongPolling;
}).RequireCors("AllowAll");

// Apply migrations on startup
using (var scope = app.Services.CreateScope())
{
    try
    {
        var migrationService = scope.ServiceProvider.GetRequiredService<Stocker.Persistence.Migrations.IMigrationService>();
        await migrationService.MigrateMasterDatabaseAsync();
        await migrationService.SeedMasterDataAsync();
        app.Logger.LogInformation("Database migration completed successfully");
        
        // Test Seq logging
        app.Logger.LogInformation("🚀 Stocker API started successfully");
        app.Logger.LogDebug("Debug: Seq connection test");
        app.Logger.LogWarning("Warning: This is a test warning for Seq");
        app.Logger.LogError("Error: This is a test error for Seq (not a real error)");
    }
    catch (Exception ex)
    {
        app.Logger.LogError(ex, "An error occurred while migrating the database");
        // Don't throw in production, just log the error
        if (app.Environment.IsDevelopment())
        {
            throw;
        }
    }
}

// Health check endpoints are handled by HealthController
// SignalR health check
app.MapGet("/health/signalr", () => Results.Ok(new { status = "Healthy", service = "SignalR" }))
   .WithName("SignalRHealthCheck")
   .WithTags("Health");

app.Run();
