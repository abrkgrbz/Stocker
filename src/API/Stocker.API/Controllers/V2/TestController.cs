using Microsoft.AspNetCore.Mvc;
using Stocker.Application.Common.Models;
using System.Diagnostics;

namespace Stocker.API.Controllers.V2;

/// <summary>
/// Test controller for API v2 features
/// </summary>
[ApiController]
[ApiVersion("2.0")]
[ApiVersion("2.1")]
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
    /// Test endpoint for API v2 versioning
    /// </summary>
    [HttpGet("version")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    public IActionResult GetVersion()
    {
        var apiVersion = HttpContext.GetRequestedApiVersion()?.ToString() ?? "2.0";
        
        var response = ApiResponse<object>.CreateSuccess(new
        {
            version = apiVersion,
            framework = ".NET 9.0",
            timestamp = DateTime.UtcNow,
            features = new[]
            {
                "API Versioning",
                "Rate Limiting",
                "Security Headers",
                "Correlation ID",
                "Enhanced Error Handling",
                "GraphQL Support (v2)",
                "Bulk Operations (v2)",
                "Advanced Caching (v2)"
            },
            deprecationInfo = apiVersion == "2.0" ? "Version 2.0 will be deprecated on 2025-12-31" : null
        }, $"API v{apiVersion} is working");

        response.ApiVersion = apiVersion;
        response.TraceId = HttpContext.TraceIdentifier;

        return Ok(response);
    }

    /// <summary>
    /// Advanced feature only available in v2
    /// </summary>
    [HttpPost("bulk")]
    [MapToApiVersion("2.0")]
    [MapToApiVersion("2.1")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    public IActionResult BulkOperation([FromBody] List<object> items)
    {
        var response = ApiResponse<object>.CreateSuccess(new
        {
            processed = items?.Count ?? 0,
            status = "completed",
            timestamp = DateTime.UtcNow,
            apiVersion = HttpContext.GetRequestedApiVersion()?.ToString()
        }, "Bulk operation completed successfully");

        return Ok(response);
    }

    /// <summary>
    /// Feature only available in v2.1
    /// </summary>
    [HttpGet("advanced")]
    [MapToApiVersion("2.1")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    public IActionResult AdvancedFeature()
    {
        var response = ApiResponse<object>.CreateSuccess(new
        {
            feature = "Advanced Feature",
            availableSince = "v2.1",
            timestamp = DateTime.UtcNow
        }, "This is an advanced feature only available in v2.1");

        return Ok(response);
    }
}