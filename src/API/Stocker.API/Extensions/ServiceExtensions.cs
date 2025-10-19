using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.ResponseCompression;
using Microsoft.OpenApi.Models;
using System.IO.Compression;
using System.Text.Json;
using System.Text.Json.Serialization;
using Stocker.API.Configuration;
using Stocker.Infrastructure.Middleware.RateLimiting;
using Stocker.Infrastructure.Middleware.Security;
using Stocker.Infrastructure.Middleware.Correlation;

namespace Stocker.API.Extensions;

/// <summary>
/// Service registration extensions
/// </summary>
public static class ServiceExtensions
{
    /// <summary>
    /// Adds API controllers with versioning and custom options
    /// </summary>
    public static IServiceCollection AddApiControllersWithVersioning(this IServiceCollection services)
    {
        // Add API Versioning
        services.AddApiVersioningConfiguration();
        
        // Add controllers with options
        services.AddControllers(options =>
        {
            // Add custom model binding
            options.ModelBindingMessageProvider.SetValueMustNotBeNullAccessor(
                _ => "The field is required.");
            
            // Add global filters
            options.Filters.Add(new ProducesAttribute("application/json"));
            options.Filters.Add(new ConsumesAttribute("application/json"));
            
            // Suppress default validation (we use FluentValidation)
            options.SuppressAsyncSuffixInActionNames = false;
        })
        .AddJsonOptions(options =>
        {
            // JSON serialization options
            options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
            options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
            options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
            options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
            options.JsonSerializerOptions.WriteIndented = false;
            
            // Date formatting
            options.JsonSerializerOptions.Converters.Add(new DateTimeConverter());
        })
        .ConfigureApiBehaviorOptions(options =>
        {
            // Custom validation error response
            options.InvalidModelStateResponseFactory = context =>
            {
                var errors = context.ModelState
                    .Where(e => e.Value?.Errors.Count > 0)
                    .SelectMany(x => x.Value!.Errors.Select(e => new
                    {
                        Field = x.Key,
                        Message = e.ErrorMessage
                    }))
                    .ToList();

                var response = new
                {
                    Type = "https://tools.ietf.org/html/rfc7231#section-6.5.1",
                    Title = "Validation Error",
                    Status = 400,
                    Detail = "One or more validation errors occurred.",
                    Instance = context.HttpContext.Request.Path,
                    TraceId = context.HttpContext.TraceIdentifier,
                    Errors = errors
                };

                return new BadRequestObjectResult(response)
                {
                    ContentTypes = { "application/problem+json" }
                };
            };
        });

        return services;
    }

    /// <summary>
    /// Adds response compression
    /// </summary>
    public static IServiceCollection AddResponseCompressionServices(this IServiceCollection services)
    {
        services.Configure<BrotliCompressionProviderOptions>(options =>
        {
            options.Level = CompressionLevel.Optimal;
        });

        services.Configure<GzipCompressionProviderOptions>(options =>
        {
            options.Level = CompressionLevel.Optimal;
        });

        services.AddResponseCompression(options =>
        {
            options.EnableForHttps = true;
            options.Providers.Add<BrotliCompressionProvider>();
            options.Providers.Add<GzipCompressionProvider>();
            
            // Add compressible MIME types
            options.MimeTypes = ResponseCompressionDefaults.MimeTypes.Concat(new[]
            {
                "application/json",
                "application/json+problem",
                "application/problem+json",
                "text/json",
                "text/plain",
                "text/html",
                "text/css",
                "text/javascript",
                "application/javascript",
                "image/svg+xml"
            });
        });

        return services;
    }

    /// <summary>
    /// Adds security services
    /// </summary>
    public static IServiceCollection AddSecurityServices(this IServiceCollection services, IConfiguration configuration)
    {
        // Security Headers
        services.AddSecurityHeaders(options =>
        {
            options.AddXContentTypeOptions = true;
            options.AddXFrameOptions = true;
            options.XFrameOptions = "SAMEORIGIN";
            options.AddXXssProtection = true;
            options.AddReferrerPolicy = true;
            options.ReferrerPolicy = "strict-origin-when-cross-origin";
            options.RemoveServerHeader = true;
            options.RemoveXPoweredByHeader = true;
            
            // Content Security Policy
            options.AddContentSecurityPolicy = true;
            options.ContentSecurityPolicy = configuration["Security:ContentSecurityPolicy"] ?? 
                "default-src 'self'; " +
                "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; " +
                "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
                "font-src 'self' https://fonts.gstatic.com data:; " +
                "img-src 'self' data: https:; " +
                "connect-src 'self' wss: https:; " +
                "frame-ancestors 'self'; " +
                "base-uri 'self'; " +
                "form-action 'self'";
                
            // Strict Transport Security (HSTS)
            options.AddStrictTransportSecurity = !configuration.GetValue<bool>("Development:DisableHSTS");
        });

        // Correlation ID
        services.AddCorrelationId(options =>
        {
            options.Header = "X-Correlation-Id";
            options.IncludeInResponse = true;
            options.UseGuid = true;
        });

        // Rate Limiting
        services.AddRateLimiting(options =>
        {
            options.EnableGlobalRateLimit = true;
            options.GlobalLimit = configuration.GetValue<int>("RateLimiting:GlobalLimit", 100);
            options.GlobalPeriodInSeconds = configuration.GetValue<int>("RateLimiting:GlobalPeriod", 60);
            
            // Add specific rules for different endpoints
            options.Rules["Authentication"] = new RateLimitRule
            {
                Limit = 5,
                PeriodInSeconds = 60
            };
            
            options.Rules["Registration"] = new RateLimitRule
            {
                Limit = 3,
                PeriodInSeconds = 300
            };
            
            options.Rules["PasswordReset"] = new RateLimitRule
            {
                Limit = 3,
                PeriodInSeconds = 300
            };
        });

        return services;
    }

    /// <summary>
    /// Adds monitoring and observability services
    /// </summary>
    public static IServiceCollection AddMonitoringServices(this IServiceCollection services, IConfiguration configuration)
    {
        // Health Checks (including RabbitMQ from MassTransit)
        services.AddHealthChecks();

        // Add metrics (Prometheus format)
        // Note: You'll need to add prometheus-net.AspNetCore NuGet package
        // services.AddMetrics();

        return services;
    }

    /// <summary>
    /// Adds caching services for Phase 2
    /// </summary>
    public static IServiceCollection AddCachingServices(this IServiceCollection services, IConfiguration configuration)
    {
        // ETag options
        services.Configure<Stocker.Infrastructure.Middleware.Caching.ETagOptions>(options =>
        {
            options.ExcludePaths = new[] { "/swagger", "/health", "/hubs", "/api/auth" };
            options.DefaultCacheControl = "private, must-revalidate";
            options.UseWeakETags = false;
        });

        // Cache-Control options
        services.Configure<Stocker.Infrastructure.Middleware.Caching.CacheControlOptions>(options =>
        {
            options.DefaultPolicy = new Stocker.Infrastructure.Middleware.Caching.CachePolicy
            {
                CacheControl = "private, max-age=0, must-revalidate",
                MaxAge = 0
            };

            // Override specific endpoint policies
            options.EndpointPolicies["/api/public"] = new Stocker.Infrastructure.Middleware.Caching.CachePolicy
            {
                CacheControl = "public, max-age=3600, s-maxage=7200",
                MaxAge = 3600,
                Vary = "Accept, Accept-Encoding"
            };
        });

        // Response caching options
        services.Configure<Stocker.Infrastructure.Middleware.Caching.ResponseCachingOptions>(options =>
        {
            options.DefaultCacheDurationSeconds = configuration.GetValue<int>("Caching:DefaultDuration", 60);
            options.MaxCacheDurationSeconds = configuration.GetValue<int>("Caching:MaxDuration", 3600);
            options.VaryByUser = false;
        });

        // Register bulk operation service
        services.AddScoped<Stocker.Application.Common.Services.IBulkOperationService,
            Stocker.Application.Common.Services.BulkOperationService>();

        return services;
    }
}

/// <summary>
/// Custom DateTime converter for consistent JSON formatting
/// </summary>
public class DateTimeConverter : JsonConverter<DateTime>
{
    private readonly string _dateTimeFormat = "yyyy-MM-dd'T'HH:mm:ss.fff'Z'";

    public override DateTime Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        return DateTime.Parse(reader.GetString()!);
    }

    public override void Write(Utf8JsonWriter writer, DateTime value, JsonSerializerOptions options)
    {
        writer.WriteStringValue(value.ToUniversalTime().ToString(_dateTimeFormat));
    }
}

/// <summary>
/// Custom DateTime? converter
/// </summary>
public class NullableDateTimeConverter : JsonConverter<DateTime?>
{
    private readonly string _dateTimeFormat = "yyyy-MM-dd'T'HH:mm:ss.fff'Z'";

    public override DateTime? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        var value = reader.GetString();
        return string.IsNullOrEmpty(value) ? null : DateTime.Parse(value);
    }

    public override void Write(Utf8JsonWriter writer, DateTime? value, JsonSerializerOptions options)
    {
        if (value.HasValue)
        {
            writer.WriteStringValue(value.Value.ToUniversalTime().ToString(_dateTimeFormat));
        }
        else
        {
            writer.WriteNullValue();
        }
    }
}