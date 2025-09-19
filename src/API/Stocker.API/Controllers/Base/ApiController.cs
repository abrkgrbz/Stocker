using MediatR;
using Microsoft.AspNetCore.Mvc;
using Stocker.Application.Common.Extensions;
using Stocker.Application.Common.Models;
using Stocker.SharedKernel.Results;

namespace Stocker.API.Controllers.Base;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public abstract class ApiController : ControllerBase
{
    private ISender? _mediator;
    private ILogger? _logger;

    protected ISender Mediator => _mediator ??= HttpContext.RequestServices.GetRequiredService<ISender>();
    protected ILogger Logger => _logger ??= HttpContext.RequestServices.GetRequiredService<ILoggerFactory>()
        .CreateLogger(GetType());

    protected ActionResult HandleFailure(Result result)
    {
        return result.Error.Type switch
        {
            ErrorType.Validation => BadRequest(CreateProblemDetails(
                "Validation Error",
                StatusCodes.Status400BadRequest,
                result.Error)),

            ErrorType.NotFound => NotFound(CreateProblemDetails(
                "Resource Not Found", 
                StatusCodes.Status404NotFound,
                result.Error)),

            ErrorType.Conflict => Conflict(CreateProblemDetails(
                "Conflict Error",
                StatusCodes.Status409Conflict,
                result.Error)),

            ErrorType.Unauthorized => Unauthorized(CreateProblemDetails(
                "Unauthorized",
                StatusCodes.Status401Unauthorized,
                result.Error)),

            ErrorType.Forbidden => StatusCode(
                StatusCodes.Status403Forbidden,
                CreateProblemDetails(
                    "Forbidden",
                    StatusCodes.Status403Forbidden,
                    result.Error)),

            _ => StatusCode(StatusCodes.Status500InternalServerError, CreateProblemDetails(
                "Server Error",
                StatusCodes.Status500InternalServerError,
                result.Error))
        };
    }

    private ProblemDetails CreateProblemDetails(string title, int status, Error error)
    {
        return new ProblemDetails
        {
            Type = "https://datatracker.ietf.org/doc/html/rfc7231",
            Title = title,
            Status = status,
            Detail = error.Description,
            Instance = HttpContext.Request.Path,
            Extensions =
            {
                ["errorCode"] = error.Code,
                ["traceId"] = HttpContext.TraceIdentifier,
                ["timestamp"] = DateTime.UtcNow
            }
        };
    }

    protected string? GetUserId()
    {
        return User.Identity?.IsAuthenticated == true 
            ? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value 
            : null;
    }

    protected Guid? GetTenantId()
    {
        // First try to get from HttpContext.Items (set by TenantResolutionMiddleware)
        if (HttpContext.Items.TryGetValue("TenantId", out var tenantIdObj))
        {
            if (tenantIdObj is Guid tenantGuid)
            {
                return tenantGuid;
            }
            if (tenantIdObj is string tenantIdStr && Guid.TryParse(tenantIdStr, out var parsedGuid))
            {
                return parsedGuid;
            }
        }
        
        // Fallback to getting from claims (for backwards compatibility)
        var tenantIdClaim = User.FindFirst("TenantId")?.Value;
        return Guid.TryParse(tenantIdClaim, out var tenantId) ? tenantId : null;
    }

    protected string? GetUserEmail()
    {
        return User.Identity?.IsAuthenticated == true
            ? User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value
            : null;
    }

    protected string? GetUserRole()
    {
        return User.Identity?.IsAuthenticated == true
            ? User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value
            : null;
    }

    // Response helper methods
    protected IActionResult OkResponse<T>(T data, string? message = null)
    {
        var response = ApiResponse<T>.SuccessResponse(data, message);
        response.TraceId = HttpContext.TraceIdentifier;
        return Ok(response);
    }

    protected IActionResult CreatedResponse<T>(T data, string actionName, object? routeValues = null)
    {
        var response = ApiResponse<T>.SuccessResponse(data, "Resource created successfully");
        response.TraceId = HttpContext.TraceIdentifier;
        return CreatedAtAction(actionName, routeValues, response);
    }

    protected IActionResult NotFoundResponse<T>(string message = "Resource not found")
    {
        var response = ApiResponse<T>.FailureResponse(message);
        response.TraceId = HttpContext.TraceIdentifier;
        return NotFound(response);
    }

    protected IActionResult BadRequestResponse<T>(string error)
    {
        var response = ApiResponse<T>.FailureResponse(error);
        response.TraceId = HttpContext.TraceIdentifier;
        return BadRequest(response);
    }

    protected IActionResult BadRequestResponse<T>(List<string> errors)
    {
        var response = ApiResponse<T>.FailureResponse(errors);
        response.TraceId = HttpContext.TraceIdentifier;
        return BadRequest(response);
    }

    protected IActionResult OkPagedResponse<T>(T data, int pageNumber, int pageSize, int totalCount)
    {
        var response = PagedApiResponse<T>.Create(data, pageNumber, pageSize, totalCount);
        response.TraceId = HttpContext.TraceIdentifier;
        return Ok(response);
    }

    protected IActionResult HandleResult<T>(Result<T> result)
    {
        if (result.IsSuccess)
        {
            return OkResponse(result.Value);
        }

        return HandleFailure(result);
    }

    protected IActionResult HandleResult(Result result)
    {
        if (result.IsSuccess)
        {
            return Ok(ApiResponse<object>.SuccessResponse(null, "Operation completed successfully"));
        }

        return HandleFailure(result);
    }

    protected ApiResponse<T> CreateSuccessResponse<T>(T data, string? message = null)
    {
        var response = ApiResponse<T>.SuccessResponse(data, message);
        response.TraceId = HttpContext.TraceIdentifier;
        return response;
    }

    protected ApiResponse<object> CreateErrorResponse(string error)
    {
        var response = ApiResponse<object>.FailureResponse(error);
        response.TraceId = HttpContext.TraceIdentifier;
        return response;
    }
}