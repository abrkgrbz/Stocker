using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Stocker.SharedKernel.Results;

namespace Stocker.API.Controllers.Master;

[ApiController]
[Route("api/master/[controller]")]
[Authorize(Policy = "SystemAdminPolicy")]
public abstract class MasterControllerBase : ControllerBase
{
    protected readonly IMediator _mediator;
    protected readonly ILogger _logger;

    protected MasterControllerBase(IMediator mediator, ILogger logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    protected string CurrentUserId => User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
        ?? throw new UnauthorizedAccessException("User ID not found");
        
    protected string CurrentUserEmail => User.FindFirst(ClaimTypes.Email)?.Value 
        ?? throw new UnauthorizedAccessException("User email not found");

    protected IActionResult HandleResult<T>(Result<T> result)
    {
        if (result.IsSuccess)
        {
            return Ok(new ApiResponse<T>
            {
                Success = true,
                Data = result.Value,
                Timestamp = DateTime.UtcNow
            });
        }

        return result.Error.Type switch
        {
            ErrorType.NotFound => NotFound(new ApiResponse<T>
            {
                Success = false,
                Message = result.Error.Description,
                Timestamp = DateTime.UtcNow
            }),
            ErrorType.Validation => BadRequest(new ApiResponse<T>
            {
                Success = false,
                Message = result.Error.Description,
                Errors = new List<string> { result.Error.Description },
                Timestamp = DateTime.UtcNow
            }),
            ErrorType.Conflict => Conflict(new ApiResponse<T>
            {
                Success = false,
                Message = result.Error.Description,
                Timestamp = DateTime.UtcNow
            }),
            _ => BadRequest(new ApiResponse<T>
            {
                Success = false,
                Message = result.Error.Description,
                Timestamp = DateTime.UtcNow
            })
        };
    }
}

public class ApiResponse<T>
{
    public bool Success { get; set; }
    public T? Data { get; set; }
    public string? Message { get; set; }
    public List<string>? Errors { get; set; }
    public DateTime Timestamp { get; set; }
}