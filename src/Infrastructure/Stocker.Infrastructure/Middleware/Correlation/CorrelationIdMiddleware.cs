using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.Primitives;
using System.Diagnostics;

namespace Stocker.Infrastructure.Middleware.Correlation;

public class CorrelationIdMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<CorrelationIdMiddleware> _logger;
    private readonly CorrelationIdOptions _options;

    public CorrelationIdMiddleware(
        RequestDelegate next,
        ILogger<CorrelationIdMiddleware> logger,
        IOptions<CorrelationIdOptions> options)
    {
        _next = next;
        _logger = logger;
        _options = options.Value;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var correlationId = GetOrCreateCorrelationId(context);
        
        // Add to request headers if not present
        if (!context.Request.Headers.ContainsKey(_options.Header))
        {
            context.Request.Headers.Add(_options.Header, correlationId);
        }

        // Add to response headers
        context.Response.OnStarting(() =>
        {
            if (_options.IncludeInResponse && !context.Response.Headers.ContainsKey(_options.Header))
            {
                context.Response.Headers.Add(_options.Header, correlationId);
            }
            return Task.CompletedTask;
        });

        // Add to HttpContext Items for access in the application
        context.Items[_options.Header] = correlationId;

        // Set Activity (for distributed tracing)
        if (Activity.Current != null)
        {
            Activity.Current.SetBaggage(_options.Header, correlationId);
            Activity.Current.SetTag(_options.Header, correlationId);
        }

        // Add to logging scope
        using (_logger.BeginScope(new Dictionary<string, object>
        {
            ["CorrelationId"] = correlationId,
            ["RequestPath"] = context.Request.Path.ToString(),
            ["RequestMethod"] = context.Request.Method
        }))
        {
            _logger.LogInformation(
                "Processing request {Method} {Path} with CorrelationId: {CorrelationId}",
                context.Request.Method,
                context.Request.Path,
                correlationId);

            try
            {
                await _next(context);
            }
            finally
            {
                _logger.LogInformation(
                    "Completed request {Method} {Path} with CorrelationId: {CorrelationId}. StatusCode: {StatusCode}",
                    context.Request.Method,
                    context.Request.Path,
                    correlationId,
                    context.Response.StatusCode);
            }
        }
    }

    private string GetOrCreateCorrelationId(HttpContext context)
    {
        // Try to get from request header
        if (context.Request.Headers.TryGetValue(_options.Header, out StringValues correlationId))
        {
            var id = correlationId.FirstOrDefault();
            if (!string.IsNullOrWhiteSpace(id))
            {
                _logger.LogDebug("Found CorrelationId in request header: {CorrelationId}", id);
                return id;
            }
        }

        // Try alternate headers (for compatibility with different systems)
        foreach (var alternateHeader in _options.AlternateHeaders)
        {
            if (context.Request.Headers.TryGetValue(alternateHeader, out correlationId))
            {
                var id = correlationId.FirstOrDefault();
                if (!string.IsNullOrWhiteSpace(id))
                {
                    _logger.LogDebug("Found CorrelationId in alternate header {Header}: {CorrelationId}", alternateHeader, id);
                    return id;
                }
            }
        }

        // Generate new correlation ID
        var newCorrelationId = _options.CorrelationIdGenerator?.Invoke() ?? GenerateDefaultCorrelationId();
        _logger.LogDebug("Generated new CorrelationId: {CorrelationId}", newCorrelationId);
        return newCorrelationId;
    }

    private string GenerateDefaultCorrelationId()
    {
        return _options.UseGuid 
            ? Guid.NewGuid().ToString() 
            : $"{DateTime.UtcNow:yyyyMMddHHmmss}-{Guid.NewGuid().ToString("N").Substring(0, 8)}";
    }
}

public class CorrelationIdOptions
{
    public string Header { get; set; } = "X-Correlation-Id";
    public List<string> AlternateHeaders { get; set; } = new() { "X-Request-Id", "X-Trace-Id" };
    public bool IncludeInResponse { get; set; } = true;
    public bool UseGuid { get; set; } = true;
    public Func<string>? CorrelationIdGenerator { get; set; }
}

// Service to access correlation ID anywhere in the application
public interface ICorrelationIdProvider
{
    string? GetCorrelationId();
    void SetCorrelationId(string correlationId);
}

public class CorrelationIdProvider : ICorrelationIdProvider
{
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly CorrelationIdOptions _options;

    public CorrelationIdProvider(
        IHttpContextAccessor httpContextAccessor,
        IOptions<CorrelationIdOptions> options)
    {
        _httpContextAccessor = httpContextAccessor;
        _options = options.Value;
    }

    public string? GetCorrelationId()
    {
        return _httpContextAccessor.HttpContext?.Items[_options.Header] as string;
    }

    public void SetCorrelationId(string correlationId)
    {
        if (_httpContextAccessor.HttpContext != null)
        {
            _httpContextAccessor.HttpContext.Items[_options.Header] = correlationId;
        }
    }
}

public static class CorrelationIdExtensions
{
    public static IServiceCollection AddCorrelationId(
        this IServiceCollection services,
        Action<CorrelationIdOptions>? configureOptions = null)
    {
        services.AddHttpContextAccessor();
        services.AddSingleton<ICorrelationIdProvider, CorrelationIdProvider>();
        
        services.Configure<CorrelationIdOptions>(options =>
        {
            configureOptions?.Invoke(options);
        });

        return services;
    }

    public static IApplicationBuilder UseCorrelationId(this IApplicationBuilder app)
    {
        return app.UseMiddleware<CorrelationIdMiddleware>();
    }

    public static string? GetCorrelationId(this HttpContext httpContext)
    {
        var options = httpContext.RequestServices.GetService<IOptions<CorrelationIdOptions>>()?.Value 
                      ?? new CorrelationIdOptions();
        
        return httpContext.Items[options.Header] as string;
    }
}