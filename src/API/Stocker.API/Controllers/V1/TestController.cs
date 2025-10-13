using Microsoft.AspNetCore.Mvc;
using Stocker.Application.Common.Models;
using Stocker.Infrastructure.Middleware.RateLimiting;
using System.Diagnostics;

namespace Stocker.API.Controllers.V1;

/// <summary>
/// Test controller for API v1 features
/// </summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/[controller]")]
[Produces("application/json")]
public class TestController : ControllerBase
{
    private readonly ILogger<TestController> _logger;

    public TestController(ILogger<TestController> logger)
    {
        _logger = logger;
    }

    /// <summary>
    /// Test endpoint for API versioning
    /// </summary>
    [HttpGet("version")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    public IActionResult GetVersion()
    {
        var response = ApiResponse<object>.CreateSuccess(new
        {
            version = "1.0",
            framework = ".NET 9.0",
            timestamp = DateTime.UtcNow,
            features = new[]
            {
                "API Versioning",
                "Rate Limiting",
                "Security Headers",
                "Correlation ID",
                "Enhanced Error Handling"
            }
        }, "API v1.0 is working");

        response.ApiVersion = "1.0";
        response.TraceId = HttpContext.TraceIdentifier;

        return Ok(response);
    }

    /// <summary>
    /// Test rate limiting (5 requests per minute)
    /// </summary>
    [HttpGet("rate-limit")]
    [RateLimit(5, 60)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status429TooManyRequests)]
    public IActionResult TestRateLimit()
    {
        var response = ApiResponse<object>.CreateSuccess(new
        {
            message = "Rate limit test successful",
            timestamp = DateTime.UtcNow,
            remainingCalls = Response.Headers["X-RateLimit-Remaining"].FirstOrDefault()
        });

        return Ok(response);
    }

    /// <summary>
    /// Test error handling
    /// </summary>
    [HttpGet("error/{type}")]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status500InternalServerError)]
    public IActionResult TestError(string type)
    {
        switch (type.ToLower())
        {
            case "validation":
                throw new FluentValidation.ValidationException("Test validation error");
                
            case "notfound":
                throw new KeyNotFoundException("Resource not found for testing");
                
            case "business":
                throw new Infrastructure.Middleware.ErrorHandling.BusinessException(
                    "TEST_BUSINESS_ERROR",
                    "This is a test business error",
                    "Business Rule Violation",
                    System.Net.HttpStatusCode.BadRequest,
                    new Dictionary<string, object> { ["testField"] = "testValue" });
                
            case "internal":
                throw new Exception("Test internal server error");
                
            default:
                return BadRequest(new { error = "Unknown error type. Try: validation, notfound, business, internal" });
        }
    }

    /// <summary>
    /// Test pagination metadata
    /// </summary>
    [HttpGet("pagination")]
    [ProducesResponseType(typeof(ApiResponse<List<object>>), StatusCodes.Status200OK)]
    public IActionResult TestPagination([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        var totalItems = 100;
        var totalPages = (int)Math.Ceiling(totalItems / (double)pageSize);
        
        var items = Enumerable.Range((page - 1) * pageSize + 1, pageSize)
            .Select(i => new { id = i, name = $"Item {i}" })
            .ToList();

        var response = ApiResponse<List<object>>.CreateSuccess(
            items.Cast<object>().ToList(),
            "Paginated data retrieved successfully");

        response.Pagination = new PaginationMetadata
        {
            CurrentPage = page,
            PageSize = pageSize,
            TotalPages = totalPages,
            TotalItems = totalItems,
            HasNext = page < totalPages,
            HasPrevious = page > 1,
            Links = new Dictionary<string, string>
            {
                ["self"] = $"/api/v1/test/pagination?page={page}&pageSize={pageSize}",
                ["first"] = $"/api/v1/test/pagination?page=1&pageSize={pageSize}",
                ["last"] = $"/api/v1/test/pagination?page={totalPages}&pageSize={pageSize}",
                ["next"] = page < totalPages ? $"/api/v1/test/pagination?page={page + 1}&pageSize={pageSize}" : null,
                ["previous"] = page > 1 ? $"/api/v1/test/pagination?page={page - 1}&pageSize={pageSize}" : null
            }
        };

        return Ok(response);
    }

    /// <summary>
    /// Test correlation ID tracking
    /// </summary>
    [HttpGet("correlation")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    public IActionResult TestCorrelation()
    {
        var correlationId = HttpContext.Items["X-Correlation-Id"]?.ToString();
        
        _logger.LogInformation("Testing correlation ID: {CorrelationId}", correlationId);

        var response = ApiResponse<object>.CreateSuccess(new
        {
            correlationId,
            traceId = HttpContext.TraceIdentifier,
            requestId = Activity.Current?.Id,
            timestamp = DateTime.UtcNow
        }, "Correlation ID test successful");

        return Ok(response);
    }
}