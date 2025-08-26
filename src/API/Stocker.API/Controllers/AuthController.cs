using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Application.Features.Identity.Commands.Login;
using Stocker.Application.Features.Identity.Commands.RefreshToken;
using Stocker.Application.Features.Identity.Commands.Logout;
using Stocker.Application.Features.Identity.Commands.Register;
using Stocker.Application.Features.Identity.Commands.VerifyEmail;
using Stocker.Application.Features.Identity.Commands.ResendVerificationEmail;
using Swashbuckle.AspNetCore.Annotations;

namespace Stocker.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[SwaggerTag("Authentication - User authentication and token management")]
public class AuthController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ILogger<AuthController> _logger;

    public AuthController(IMediator mediator, ILogger<AuthController> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }
    
    /// <summary>
    /// Test Seq logging
    /// </summary>
    [HttpGet("test-seq")]
    [AllowAnonymous]
    public IActionResult TestSeq()
    {
        _logger.LogDebug("TEST: Debug log from AuthController");
        _logger.LogInformation("TEST: Information log from AuthController");
        _logger.LogWarning("TEST: Warning log from AuthController");
        _logger.LogError("TEST: Error log from AuthController (not a real error)");
        
        return Ok(new { message = "Seq test logs sent. Check http://95.217.219.4:5341" });
    }

    /// <summary>
    /// Login with email and password
    /// </summary>
    [HttpPost("login")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(AuthResponse), 200)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> Login([FromBody] LoginCommand command)
    {
        _logger.LogInformation("Login attempt for email: {Email}", command.Email);
        
        var result = await _mediator.Send(command);
        
        if (result.IsSuccess)
        {
            _logger.LogInformation("User {Email} logged in successfully", command.Email);
            return Ok(result.Value);
        }
        
        _logger.LogWarning("Failed login attempt for email: {Email}", command.Email);
        return BadRequest(new
        {
            success = false,
            message = result.Error.Description
        });
    }

    /// <summary>
    /// Refresh access token using refresh token
    /// </summary>
    [HttpPost("refresh-token")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(AuthResponse), 200)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenCommand command)
    {
        var result = await _mediator.Send(command);
        
        if (result.IsSuccess)
        {
            return Ok(result.Value);
        }
        
        return BadRequest(new
        {
            success = false,
            message = result.Error.Description
        });
    }

    /// <summary>
    /// Register a new user and company
    /// </summary>
    [HttpPost("register")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(RegisterResponse), 200)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> Register([FromBody] RegisterCommand command)
    {
        _logger.LogInformation("Registration attempt for company: {CompanyName}, user: {Username}", 
            command.CompanyName, command.Username);
        
        var result = await _mediator.Send(command);
        
        if (result.IsSuccess)
        {
            _logger.LogInformation("Registration successful for company: {CompanyName}", command.CompanyName);
            return Ok(result.Value);
        }
        
        _logger.LogWarning("Failed registration attempt for company: {CompanyName}, error: {Error}", 
            command.CompanyName, result.Error.Description);
        return BadRequest(new
        {
            success = false,
            message = result.Error.Description
        });
    }

    /// <summary>
    /// Logout current user
    /// </summary>
    [HttpPost("logout")]
    [Authorize]
    [ProducesResponseType(200)]
    public async Task<IActionResult> Logout()
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        
        if (string.IsNullOrEmpty(userId))
        {
            return BadRequest(new { success = false, message = "User not found" });
        }
        
        var command = new LogoutCommand { UserId = userId };
        await _mediator.Send(command);
        
        _logger.LogInformation("User {UserId} logged out", userId);
        
        return Ok(new
        {
            success = true,
            message = "Logged out successfully"
        });
    }

    /// <summary>
    /// Verify email address with token
    /// </summary>
    [HttpPost("verify-email")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(VerifyEmailResponse), 200)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> VerifyEmail([FromBody] VerifyEmailCommand command)
    {
        _logger.LogInformation("Email verification attempt for: {Email}", command.Email);
        
        var result = await _mediator.Send(command);
        
        if (result.IsSuccess)
        {
            _logger.LogInformation("Email verified successfully for: {Email}", command.Email);
            return Ok(result.Value);
        }
        
        _logger.LogWarning("Failed email verification for: {Email}, error: {Error}", 
            command.Email, result.Error.Description);
        return BadRequest(new
        {
            success = false,
            message = result.Error.Description
        });
    }

    /// <summary>
    /// Resend email verification
    /// </summary>
    [HttpPost("resend-verification-email")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(ResendVerificationEmailResponse), 200)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> ResendVerificationEmail([FromBody] ResendVerificationEmailCommand command)
    {
        _logger.LogInformation("Resend verification email request for: {Email}", command.Email);
        
        var result = await _mediator.Send(command);
        
        if (result.IsSuccess)
        {
            _logger.LogInformation("Verification email resent for: {Email}", command.Email);
            return Ok(result.Value);
        }
        
        _logger.LogWarning("Failed to resend verification email for: {Email}, error: {Error}", 
            command.Email, result.Error.Description);
        return BadRequest(new
        {
            success = false,
            message = result.Error.Description
        });
    }
}