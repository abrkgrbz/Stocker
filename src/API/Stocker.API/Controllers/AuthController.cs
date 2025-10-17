using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Application.Features.Identity.Commands.Login;
using Stocker.Application.Features.Identity.Commands.RefreshToken;
using Stocker.Application.Features.Identity.Commands.Logout;
using Stocker.Application.Features.Identity.Commands.Register;
using Stocker.Application.Features.Identity.Commands.VerifyEmail;
using Stocker.Application.Features.Identity.Commands.ResendVerificationEmail;
using Stocker.Application.Features.Identity.Queries.CheckEmail;
using Stocker.Application.Features.Identity.Commands.ForgotPassword;
using Stocker.Application.Features.Identity.Queries.ValidateResetToken;
using Stocker.Application.Features.Identity.Commands.ResetPassword;
using Stocker.Application.Features.Identity.Commands.Setup2FA;
using Stocker.Application.Features.Identity.Commands.Enable2FA;
using Stocker.Application.Features.Identity.Commands.Verify2FA;
using Stocker.Application.Features.Identity.Commands.Disable2FA;
using Stocker.Application.Features.Identity.Queries.Check2FALockout;
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
        var timestamp = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss.fff");
        
        _logger.LogDebug("TEST DEBUG: {Timestamp} - Debug log from AuthController", timestamp);
        _logger.LogInformation("TEST INFO: {Timestamp} - Information log from AuthController", timestamp);
        _logger.LogWarning("TEST WARNING: {Timestamp} - Warning log from AuthController", timestamp);
        _logger.LogError("TEST ERROR: {Timestamp} - Error log from AuthController (not a real error)", timestamp);
        
        // Direct Serilog kullanımı
        Serilog.Log.Debug("DIRECT DEBUG: {Timestamp} - Direct Serilog debug", timestamp);
        Serilog.Log.Information("DIRECT INFO: {Timestamp} - Direct Serilog information", timestamp);
        Serilog.Log.Warning("DIRECT WARNING: {Timestamp} - Direct Serilog warning", timestamp);
        Serilog.Log.Error("DIRECT ERROR: {Timestamp} - Direct Serilog error (test)", timestamp);
        
        return Ok(new { 
            message = "Seq test logs sent", 
            seqUrl = "http://95.217.219.4:5341",
            timestamp = timestamp,
            environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT")
        });
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
        _logger.LogWarning("API LOGIN REQUEST - Email: {Email}, Password: [{Password}], Length: {Length}",
            command.Email, command.Password, command.Password?.Length ?? 0);
        _logger.LogInformation("Login attempt for email: {Email}", command.Email);

        // Add IP address and User-Agent for audit logging
        var enrichedCommand = command with
        {
            IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString(),
            UserAgent = Request.Headers["User-Agent"].ToString()
        };

        var result = await _mediator.Send(enrichedCommand);

        if (result.IsSuccess)
        {
            _logger.LogInformation("User {Email} logged in successfully", command.Email);
            return Ok(new
            {
                success = true,
                data = result.Value
            });
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
            throw new Stocker.Application.Common.Exceptions.UnauthorizedException("User not found");
        
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

    /// <summary>
    /// Check if email exists and get tenant information
    /// </summary>
    [HttpPost("check-email")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(CheckEmailResponse), 200)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> CheckEmail([FromBody] CheckEmailQuery query)
    {
        _logger.LogInformation("Checking email: {Email}", query.Email);

        var result = await _mediator.Send(query);

        if (result.IsSuccess)
        {
            return Ok(new
            {
                success = true,
                data = result.Value
            });
        }

        return BadRequest(new
        {
            success = false,
            message = result.Error.Description
        });
    }

    /// <summary>
    /// Request password reset email
    /// </summary>
    [HttpPost("forgot-password")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(ForgotPasswordResponse), 200)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordCommand command)
    {
        _logger.LogInformation("Password reset request for email: {Email}", command.Email);

        // Add IP address and User-Agent for audit logging
        var enrichedCommand = command with
        {
            IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString(),
            UserAgent = Request.Headers["User-Agent"].ToString()
        };

        var result = await _mediator.Send(enrichedCommand);

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
    /// Validate password reset token
    /// </summary>
    [HttpGet("validate-reset-token")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(ValidateResetTokenResponse), 200)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> ValidateResetToken([FromQuery] string token)
    {
        _logger.LogInformation("Validating password reset token");

        var query = new ValidateResetTokenQuery { Token = token };
        var result = await _mediator.Send(query);

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
    /// Reset password with token
    /// </summary>
    [HttpPost("reset-password")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(ResetPasswordResponse), 200)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordCommand command)
    {
        _logger.LogInformation("Password reset attempt with token");

        // Add IP address and User-Agent for audit logging
        var enrichedCommand = command with
        {
            IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString(),
            UserAgent = Request.Headers["User-Agent"].ToString()
        };

        var result = await _mediator.Send(enrichedCommand);

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
    /// Setup 2FA for user account
    /// </summary>
    [HttpPost("setup-2fa")]
    [Authorize]
    [ProducesResponseType(typeof(Setup2FAResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> Setup2FA()
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrEmpty(userId))
            throw new Stocker.Application.Common.Exceptions.UnauthorizedException("User not found");

        var command = new Setup2FACommand { UserId = Guid.Parse(userId) };

        _logger.LogInformation("2FA setup request for user: {UserId}", userId);

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
    /// Enable 2FA with verification code
    /// </summary>
    [HttpPost("enable-2fa")]
    [Authorize]
    [ProducesResponseType(typeof(Enable2FAResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> Enable2FA([FromBody] Enable2FACommand command)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrEmpty(userId))
            throw new Stocker.Application.Common.Exceptions.UnauthorizedException("User not found");

        var enrichedCommand = command with { UserId = Guid.Parse(userId) };

        _logger.LogInformation("2FA enable request for user: {UserId}", userId);

        var result = await _mediator.Send(enrichedCommand);

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
    /// Check 2FA lockout status for user
    /// </summary>
    [HttpGet("check-2fa-lockout")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(LockoutStatusResponse), 200)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> Check2FALockout([FromQuery] string email)
    {
        _logger.LogInformation("Checking 2FA lockout status for email: {Email}", email);

        var query = new Check2FALockoutQuery(email);
        var result = await _mediator.Send(query);

        if (result.IsSuccess)
        {
            return Ok(new
            {
                success = true,
                data = result.Value
            });
        }

        return BadRequest(new
        {
            success = false,
            message = result.Error.Description
        });
    }

    /// <summary>
    /// Verify 2FA code during login
    /// </summary>
    [HttpPost("verify-2fa")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(AuthResponse), 200)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> Verify2FA([FromBody] Verify2FACommand command)
    {
        _logger.LogInformation("2FA verification attempt for email: {Email}", command.Email);

        // Add IP address and User-Agent for audit logging
        var enrichedCommand = command with
        {
            IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString(),
            UserAgent = Request.Headers["User-Agent"].ToString()
        };

        var result = await _mediator.Send(enrichedCommand);

        if (result.IsSuccess)
        {
            _logger.LogInformation("2FA verification successful for email: {Email}", command.Email);
            return Ok(result.Value);
        }

        _logger.LogWarning("Failed 2FA verification for email: {Email}", command.Email);
        return BadRequest(new
        {
            success = false,
            message = result.Error.Description
        });
    }

    /// <summary>
    /// Disable 2FA for user account
    /// </summary>
    [HttpPost("disable-2fa")]
    [Authorize]
    [ProducesResponseType(200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> Disable2FA([FromBody] Disable2FACommand command)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrEmpty(userId))
            throw new Stocker.Application.Common.Exceptions.UnauthorizedException("User not found");

        var enrichedCommand = command with { UserId = Guid.Parse(userId) };

        _logger.LogInformation("2FA disable request for user: {UserId}", userId);

        var result = await _mediator.Send(enrichedCommand);

        if (result.IsSuccess)
        {
            return Ok(new
            {
                success = true,
                message = "2FA disabled successfully"
            });
        }

        return BadRequest(new
        {
            success = false,
            message = result.Error.Description
        });
    }
}