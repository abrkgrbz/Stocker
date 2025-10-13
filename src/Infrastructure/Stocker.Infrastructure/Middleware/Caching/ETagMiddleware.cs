using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Primitives;
using Microsoft.Net.Http.Headers;
using System.IO;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace Stocker.Infrastructure.Middleware.Caching;

/// <summary>
/// Middleware for handling ETags for HTTP caching
/// </summary>
public class ETagMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ETagMiddleware> _logger;
    private readonly ETagOptions _options;

    public ETagMiddleware(
        RequestDelegate next,
        ILogger<ETagMiddleware> logger,
        ETagOptions options)
    {
        _next = next;
        _logger = logger;
        _options = options;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var request = context.Request;
        var response = context.Response;

        // Skip ETag for non-cacheable methods
        if (!IsETaggableMethod(request.Method))
        {
            await _next(context);
            return;
        }

        // Check if path should be excluded
        if (_options.ExcludePaths?.Any(path => request.Path.StartsWithSegments(path)) == true)
        {
            await _next(context);
            return;
        }

        // Store original response body stream
        var originalBodyStream = response.Body;

        try
        {
            using var responseBody = new MemoryStream();
            response.Body = responseBody;

            // Process the request
            await _next(context);

            // Only add ETag for successful responses
            if (IsSuccessStatusCode(response.StatusCode))
            {
                // Calculate ETag from response body
                var etag = GenerateETag(responseBody);

                // Check If-None-Match header
                if (request.Headers.TryGetValue(HeaderNames.IfNoneMatch, out var ifNoneMatch))
                {
                    if (ifNoneMatch.Contains(etag))
                    {
                        _logger.LogDebug("ETag match found. Returning 304 Not Modified");
                        response.StatusCode = StatusCodes.Status304NotModified;
                        response.ContentLength = 0;
                        response.Headers[HeaderNames.ETag] = etag;
                        return;
                    }
                }

                // Check If-Match header (for updates)
                if (request.Headers.TryGetValue(HeaderNames.IfMatch, out var ifMatch))
                {
                    if (!ifMatch.Contains(etag) && !ifMatch.Contains("*"))
                    {
                        _logger.LogDebug("ETag mismatch. Returning 412 Precondition Failed");
                        response.StatusCode = StatusCodes.Status412PreconditionFailed;
                        return;
                    }
                }

                // Add ETag header
                response.Headers[HeaderNames.ETag] = etag;

                // Add Cache-Control if not already set
                if (!response.Headers.ContainsKey(HeaderNames.CacheControl))
                {
                    response.Headers[HeaderNames.CacheControl] = _options.DefaultCacheControl;
                }
            }

            // Copy the response body back to the original stream
            responseBody.Seek(0, SeekOrigin.Begin);
            await responseBody.CopyToAsync(originalBodyStream);
        }
        finally
        {
            response.Body = originalBodyStream;
        }
    }

    private static bool IsETaggableMethod(string method)
    {
        return method == HttpMethods.Get ||
               method == HttpMethods.Head ||
               method == HttpMethods.Put ||
               method == HttpMethods.Delete;
    }

    private static bool IsSuccessStatusCode(int statusCode)
    {
        return statusCode >= 200 && statusCode < 300;
    }

    private static string GenerateETag(MemoryStream responseBody)
    {
        // Generate ETag from response content
        responseBody.Seek(0, SeekOrigin.Begin);
        using var sha256 = SHA256.Create();
        var hash = sha256.ComputeHash(responseBody);
        var etag = Convert.ToBase64String(hash);

        // Wrap in quotes as per HTTP spec
        return $"\"{etag}\"";
    }
}

/// <summary>
/// Options for ETag middleware configuration
/// </summary>
public class ETagOptions
{
    /// <summary>
    /// Paths to exclude from ETag generation
    /// </summary>
    public string[]? ExcludePaths { get; set; }

    /// <summary>
    /// Default Cache-Control header value
    /// </summary>
    public string DefaultCacheControl { get; set; } = "private, must-revalidate";

    /// <summary>
    /// Enable weak ETags
    /// </summary>
    public bool UseWeakETags { get; set; } = false;
}