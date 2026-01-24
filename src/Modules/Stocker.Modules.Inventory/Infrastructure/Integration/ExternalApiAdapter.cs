using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Inventory.Infrastructure.Resilience;

namespace Stocker.Modules.Inventory.Infrastructure.Integration;

/// <summary>
/// External API call result.
/// </summary>
public class ApiCallResult<T>
{
    public bool Success { get; init; }
    public T? Data { get; init; }
    public int StatusCode { get; init; }
    public string? ErrorMessage { get; init; }
    public TimeSpan Duration { get; init; }
    public string? CorrelationId { get; init; }

    public static ApiCallResult<T> Ok(T data, int statusCode, TimeSpan duration, string? correlationId = null) => new()
    {
        Success = true,
        Data = data,
        StatusCode = statusCode,
        Duration = duration,
        CorrelationId = correlationId
    };

    public static ApiCallResult<T> Fail(string error, int statusCode = 0, TimeSpan duration = default) => new()
    {
        Success = false,
        ErrorMessage = error,
        StatusCode = statusCode,
        Duration = duration
    };
}

/// <summary>
/// Configuration for an external API adapter.
/// </summary>
public class ExternalApiConfig
{
    public string Name { get; init; } = string.Empty;
    public string BaseUrl { get; init; } = string.Empty;
    public TimeSpan Timeout { get; init; } = TimeSpan.FromSeconds(30);
    public Dictionary<string, string> DefaultHeaders { get; init; } = new();
    public string? ApiKey { get; init; }
    public string? ApiKeyHeader { get; init; } = "X-API-Key";
    public int CircuitBreakerThreshold { get; init; } = 3;
    public TimeSpan CircuitBreakerOpenDuration { get; init; } = TimeSpan.FromSeconds(30);
}

/// <summary>
/// Generic external API adapter with circuit breaker and retry support.
/// Provides a resilient layer for all outbound API communications.
/// </summary>
public class ExternalApiAdapter
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly CircuitBreakerRegistry _circuitBreakerRegistry;
    private readonly ILogger<ExternalApiAdapter> _logger;
    private readonly ExternalApiConfig _config;
    private readonly CircuitBreaker _circuitBreaker;

    public ExternalApiAdapter(
        IHttpClientFactory httpClientFactory,
        CircuitBreakerRegistry circuitBreakerRegistry,
        ILogger<ExternalApiAdapter> logger,
        ExternalApiConfig config)
    {
        _httpClientFactory = httpClientFactory;
        _circuitBreakerRegistry = circuitBreakerRegistry;
        _logger = logger;
        _config = config;

        _circuitBreaker = _circuitBreakerRegistry.GetOrCreate($"ExternalApi_{config.Name}", options =>
        {
            options.FailureThreshold = config.CircuitBreakerThreshold;
            options.OpenDuration = config.CircuitBreakerOpenDuration;
            options.SuccessThresholdInHalfOpen = 2;
            options.OperationTimeout = config.Timeout;
        });
    }

    /// <summary>
    /// Execute a GET request.
    /// </summary>
    public async Task<ApiCallResult<T>> GetAsync<T>(
        string path,
        Dictionary<string, string>? headers = null,
        CancellationToken cancellationToken = default)
    {
        return await ExecuteAsync<T>(HttpMethod.Get, path, null, headers, cancellationToken);
    }

    /// <summary>
    /// Execute a POST request.
    /// </summary>
    public async Task<ApiCallResult<T>> PostAsync<T>(
        string path,
        object? body = null,
        Dictionary<string, string>? headers = null,
        CancellationToken cancellationToken = default)
    {
        return await ExecuteAsync<T>(HttpMethod.Post, path, body, headers, cancellationToken);
    }

    /// <summary>
    /// Execute a PUT request.
    /// </summary>
    public async Task<ApiCallResult<T>> PutAsync<T>(
        string path,
        object? body = null,
        Dictionary<string, string>? headers = null,
        CancellationToken cancellationToken = default)
    {
        return await ExecuteAsync<T>(HttpMethod.Put, path, body, headers, cancellationToken);
    }

    /// <summary>
    /// Execute a DELETE request.
    /// </summary>
    public async Task<ApiCallResult<T>> DeleteAsync<T>(
        string path,
        Dictionary<string, string>? headers = null,
        CancellationToken cancellationToken = default)
    {
        return await ExecuteAsync<T>(HttpMethod.Delete, path, null, headers, cancellationToken);
    }

    /// <summary>
    /// Core execution method with circuit breaker protection.
    /// </summary>
    private async Task<ApiCallResult<T>> ExecuteAsync<T>(
        HttpMethod method,
        string path,
        object? body,
        Dictionary<string, string>? headers,
        CancellationToken cancellationToken)
    {
        var correlationId = Guid.NewGuid().ToString("N")[..12];
        var startTime = DateTime.UtcNow;

        try
        {
            return await _circuitBreaker.ExecuteAsync(async ct =>
            {
                using var client = _httpClientFactory.CreateClient(_config.Name);
                client.BaseAddress = new Uri(_config.BaseUrl);
                client.Timeout = _config.Timeout;

                using var request = new HttpRequestMessage(method, path);

                // Add default headers
                foreach (var header in _config.DefaultHeaders)
                    request.Headers.TryAddWithoutValidation(header.Key, header.Value);

                // Add API key
                if (!string.IsNullOrEmpty(_config.ApiKey) && !string.IsNullOrEmpty(_config.ApiKeyHeader))
                    request.Headers.TryAddWithoutValidation(_config.ApiKeyHeader, _config.ApiKey);

                // Add custom headers
                if (headers != null)
                {
                    foreach (var header in headers)
                        request.Headers.TryAddWithoutValidation(header.Key, header.Value);
                }

                // Add correlation ID
                request.Headers.TryAddWithoutValidation("X-Correlation-Id", correlationId);

                // Add body
                if (body != null)
                {
                    var json = JsonSerializer.Serialize(body, new JsonSerializerOptions
                    {
                        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                    });
                    request.Content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");
                }

                var response = await client.SendAsync(request, ct);
                var duration = DateTime.UtcNow - startTime;

                if (response.IsSuccessStatusCode)
                {
                    var data = await response.Content.ReadFromJsonAsync<T>(cancellationToken: ct);
                    _logger.LogDebug(
                        "External API call success: {ApiName} {Method} {Path}, Status={StatusCode}, Duration={Duration}ms",
                        _config.Name, method, path, (int)response.StatusCode, duration.TotalMilliseconds);

                    return ApiCallResult<T>.Ok(data!, (int)response.StatusCode, duration, correlationId);
                }
                else
                {
                    var errorBody = await response.Content.ReadAsStringAsync(ct);
                    _logger.LogWarning(
                        "External API call failed: {ApiName} {Method} {Path}, Status={StatusCode}, Error={Error}",
                        _config.Name, method, path, (int)response.StatusCode, errorBody);

                    return ApiCallResult<T>.Fail(errorBody, (int)response.StatusCode, duration);
                }
            }, cancellationToken);
        }
        catch (CircuitBreakerOpenException ex)
        {
            var duration = DateTime.UtcNow - startTime;
            _logger.LogWarning(
                "External API circuit breaker open: {ApiName}, retry after {Seconds}s",
                _config.Name, ex.RemainingOpenTime.TotalSeconds);

            return ApiCallResult<T>.Fail(
                $"Service temporarily unavailable (circuit breaker open). Retry after {ex.RemainingOpenTime.TotalSeconds:F0}s.",
                503, duration);
        }
        catch (Exception ex) when (ex is HttpRequestException or TaskCanceledException)
        {
            var duration = DateTime.UtcNow - startTime;
            _logger.LogWarning(ex,
                "External API call error: {ApiName} {Method} {Path}",
                _config.Name, method, path);

            return ApiCallResult<T>.Fail(ex.Message, 0, duration);
        }
    }

    /// <summary>
    /// Check if the circuit breaker is healthy.
    /// </summary>
    public bool IsHealthy => _circuitBreaker.State != CircuitState.Open;

    /// <summary>
    /// Get adapter name.
    /// </summary>
    public string Name => _config.Name;
}

/// <summary>
/// Factory for creating configured external API adapters.
/// </summary>
public class ExternalApiAdapterFactory
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly CircuitBreakerRegistry _circuitBreakerRegistry;
    private readonly ILoggerFactory _loggerFactory;

    public ExternalApiAdapterFactory(
        IHttpClientFactory httpClientFactory,
        CircuitBreakerRegistry circuitBreakerRegistry,
        ILoggerFactory loggerFactory)
    {
        _httpClientFactory = httpClientFactory;
        _circuitBreakerRegistry = circuitBreakerRegistry;
        _loggerFactory = loggerFactory;
    }

    /// <summary>
    /// Create an adapter for a specific external API configuration.
    /// </summary>
    public ExternalApiAdapter Create(ExternalApiConfig config)
    {
        return new ExternalApiAdapter(
            _httpClientFactory,
            _circuitBreakerRegistry,
            _loggerFactory.CreateLogger<ExternalApiAdapter>(),
            config);
    }
}
