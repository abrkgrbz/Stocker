using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace Stocker.API.Filters;

/// <summary>
/// Filter to enforce request size limits
/// </summary>
public class RequestSizeLimitFilter : IAsyncActionFilter
{
    private readonly ILogger<RequestSizeLimitFilter> _logger;
    private readonly long _maxRequestSize;

    public RequestSizeLimitFilter(
        ILogger<RequestSizeLimitFilter> logger,
        IConfiguration configuration)
    {
        _logger = logger;
        // Default to 10MB if not configured
        _maxRequestSize = configuration.GetValue<long>("RequestSizeLimit", 10 * 1024 * 1024);
    }

    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        var request = context.HttpContext.Request;

        // Check Content-Length header
        if (request.ContentLength.HasValue && request.ContentLength.Value > _maxRequestSize)
        {
            _logger.LogWarning("Request size {Size} exceeds limit {Limit} for {Path}",
                request.ContentLength.Value,
                _maxRequestSize,
                request.Path);

            context.Result = new ObjectResult(new
            {
                success = false,
                message = $"Request size exceeds the maximum allowed size of {_maxRequestSize / (1024 * 1024)}MB",
                timestamp = DateTime.UtcNow
            })
            {
                StatusCode = 413 // Payload Too Large
            };
            return;
        }

        // Check for specific file upload endpoints
        if (IsFileUploadEndpoint(request.Path))
        {
            // Allow larger size for file uploads (e.g., 50MB)
            var fileUploadLimit = _maxRequestSize * 5;
            if (request.ContentLength.HasValue && request.ContentLength.Value > fileUploadLimit)
            {
                _logger.LogWarning("File upload size {Size} exceeds limit {Limit} for {Path}",
                    request.ContentLength.Value,
                    fileUploadLimit,
                    request.Path);

                context.Result = new ObjectResult(new
                {
                    success = false,
                    message = $"File size exceeds the maximum allowed size of {fileUploadLimit / (1024 * 1024)}MB",
                    timestamp = DateTime.UtcNow
                })
                {
                    StatusCode = 413
                };
                return;
            }
        }

        await next();
    }

    private bool IsFileUploadEndpoint(PathString path)
    {
        var uploadPaths = new[]
        {
            "/upload",
            "/file",
            "/import",
            "/attachment",
            "/document",
            "/image"
        };

        return uploadPaths.Any(p => path.Value?.Contains(p, StringComparison.OrdinalIgnoreCase) ?? false);
    }
}