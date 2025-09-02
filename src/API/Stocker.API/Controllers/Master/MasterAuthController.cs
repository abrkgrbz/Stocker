using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.API.Controllers.Base;
using Stocker.Application.Features.Identity.Commands.Login;
using Stocker.Application.Features.Identity.Commands.RefreshToken;
using Stocker.Application.Features.Identity.Commands.Logout;
using Stocker.Application.Features.Identity.Commands.VerifyEmail;
using Swashbuckle.AspNetCore.Annotations;

namespace Stocker.API.Controllers.Master;

[ApiController]
[Route("api/master/auth")]
[SwaggerTag("Master Authentication - System administrator authentication")]
public class MasterAuthController : ApiController
{
    private readonly ILogger<MasterAuthController> _logger;

    public MasterAuthController(ILogger<MasterAuthController> logger)
    {
        _logger = logger;
    }

    /// <summary>
    /// Master admin login
    /// </summary>
    [HttpPost("login")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(ApiResponse<AuthResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login([FromBody] LoginCommand command)
    {
        _logger.LogInformation("Master admin login attempt for email: {Email}", command.Email);
        
        // LoginCommandHandler already handles master admin detection
        var result = await Mediator.Send(command);
        
        if (result.IsSuccess)
        {
            // Verify this is actually a master admin
            if (result.Value.User.Roles.Contains("SistemYoneticisi") || result.Value.User.Roles.Contains("SystemAdmin"))
            {
                _logger.LogInformation("Master admin {Email} logged in successfully", command.Email);
                return HandleResult(result);
            }
            
            _logger.LogWarning("Non-master admin tried to login through master endpoint: {Email}", command.Email);
            return Unauthorized(CreateErrorResponse("Access denied. This endpoint is for system administrators only."));
        }
        
        _logger.LogWarning("Failed master admin login attempt for email: {Email}", command.Email);
        return HandleResult(result);
    }

    /// <summary>
    /// Refresh master admin access token
    /// </summary>
    [HttpPost("refresh-token")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(ApiResponse<AuthResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenCommand command)
    {
        var result = await Mediator.Send(command);
        return HandleResult(result);
    }

    /// <summary>
    /// Master admin logout
    /// </summary>
    [HttpPost("logout")]
    [Authorize(Policy = "RequireMasterAccess")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> Logout()
    {
        var userId = GetUserId();
        
        if (string.IsNullOrEmpty(userId))
        {
            return BadRequest(CreateErrorResponse("User not found"));
        }
        
        var command = new LogoutCommand { UserId = userId };
        var result = await Mediator.Send(command);
        
        _logger.LogInformation("Master admin {UserId} logged out", userId);
        
        return HandleResult(result);
    }

    /// <summary>
    /// Verify email address
    /// </summary>
    [HttpPost("verify-email")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(ApiResponse<VerifyEmailResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> VerifyEmail([FromBody] VerifyEmailCommand command)
    {
        _logger.LogInformation("Email verification attempt for: {Email}", command.Email);
        
        var result = await Mediator.Send(command);
        
        if (result.IsSuccess)
        {
            _logger.LogInformation("Email verified successfully for: {Email}", command.Email);
        }
        else
        {
            _logger.LogWarning("Email verification failed for: {Email} - {Error}", 
                command.Email, result.Error?.Description);
        }
        
        return HandleResult(result);
    }
    
    /// <summary>
    /// Validate master admin token
    /// </summary>
    [HttpGet("validate-token")]
    [Authorize(Policy = "RequireMasterAccess")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    public IActionResult ValidateToken()
    {
        var response = new
        {
            IsValid = true,
            UserId = GetUserId(),
            Email = GetUserEmail(),
            Role = "SystemAdmin",
            ExpiresAt = GetTokenExpiration()
        };
        
        return Ok(CreateSuccessResponse(response));
    }

    /// <summary>
    /// Get current user info
    /// </summary>
    [HttpGet("me")]
    [Authorize(Policy = "RequireMasterAccess")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    public IActionResult GetCurrentUser()
    {
        var userInfo = new
        {
            Id = GetUserId(),
            Email = GetUserEmail(),
            Username = User.Identity?.Name,
            Role = "SystemAdmin"
        };
        
        return Ok(CreateSuccessResponse(userInfo));
    }

    private DateTime GetTokenExpiration()
    {
        var expClaim = User.FindFirst("exp")?.Value;
        if (long.TryParse(expClaim, out var exp))
        {
            return DateTimeOffset.FromUnixTimeSeconds(exp).DateTime;
        }
        return DateTime.UtcNow;
    }
}