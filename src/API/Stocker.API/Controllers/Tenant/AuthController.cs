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
using Stocker.Application.Features.Identity.Queries.Get2FAStatus;
using Stocker.Application.Features.Identity.Queries.GetCurrentUser;
using Stocker.API.Extensions;
using Swashbuckle.AspNetCore.Annotations;

namespace Stocker.API.Controllers.Tenant;

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
    /// Gets the real client IP address, checking various proxy headers
    /// Priority: CF-Connecting-IP (Cloudflare) > X-Forwarded-For > X-Real-IP > RemoteIpAddress
    /// </summary>
    private string? GetClientIpAddress()
    {
        // Check CF-Connecting-IP header (set by Cloudflare)
        var cfConnectingIp = Request.Headers["CF-Connecting-IP"].FirstOrDefault();
        if (!string.IsNullOrEmpty(cfConnectingIp))
        {
            return cfConnectingIp.Trim();
        }

        // Check True-Client-IP header (alternative Cloudflare header)
        var trueClientIp = Request.Headers["True-Client-IP"].FirstOrDefault();
        if (!string.IsNullOrEmpty(trueClientIp))
        {
            return trueClientIp.Trim();
        }

        // Check X-Forwarded-For header (set by reverse proxies like nginx, traefik)
        var forwardedFor = Request.Headers["X-Forwarded-For"].FirstOrDefault();
        if (!string.IsNullOrEmpty(forwardedFor))
        {
            // X-Forwarded-For can contain multiple IPs: "client, proxy1, proxy2"
            // First one is the original client
            return forwardedFor.Split(',').FirstOrDefault()?.Trim();
        }

        // Check X-Real-IP header (alternative header used by some proxies)
        var realIp = Request.Headers["X-Real-IP"].FirstOrDefault();
        if (!string.IsNullOrEmpty(realIp))
        {
            return realIp;
        }

        // Fall back to connection's remote IP
        return HttpContext.Connection.RemoteIpAddress?.ToString();
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

        // Debug: Log tenant context
        _logger.LogInformation("🔍 Login request headers - X-Tenant-Code: {TenantCode}, X-Tenant-Id: {TenantId}",
            Request.Headers["X-Tenant-Code"].ToString(),
            Request.Headers["X-Tenant-Id"].ToString());
        _logger.LogInformation("🔍 HttpContext.Items - TenantId: {TenantId}",
            HttpContext.Items.ContainsKey("TenantId") ? HttpContext.Items["TenantId"] : "NOT SET");

        // Debug: Log IP detection details
        var clientIp = GetClientIpAddress();
        var userAgent = Request.Headers["User-Agent"].ToString();
        _logger.LogInformation("🔍 Login IP Detection - CF-Connecting-IP: {CFIP}, X-Forwarded-For: {XFF}, X-Real-IP: {XRI}, RemoteIP: {RemoteIP}, Final: {FinalIP}",
            Request.Headers["CF-Connecting-IP"].ToString(),
            Request.Headers["X-Forwarded-For"].ToString(),
            Request.Headers["X-Real-IP"].ToString(),
            HttpContext.Connection.RemoteIpAddress?.ToString(),
            clientIp);
        _logger.LogInformation("🔍 Login User-Agent: {UserAgent}", userAgent);

        // Add IP address and User-Agent for audit logging
        var enrichedCommand = command with
        {
            IpAddress = clientIp,
            UserAgent = userAgent
        };

        var result = await _mediator.Send(enrichedCommand);

        if (result.IsSuccess)
        {
            Response.SetAuthCookies(result.Value.AccessToken, result.Value.RefreshToken, result.Value.ExpiresAt);
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
        // Add IP address and User-Agent for refresh token tracking
        var enrichedCommand = command with
        {
            IpAddress = GetClientIpAddress(),
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
    /// Logout current user and clear HttpOnly cookies
    /// </summary>
    [HttpPost("logout")]
    [Authorize]
    [ProducesResponseType(200)]
    public async Task<IActionResult> Logout()
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrEmpty(userId))
            throw new Stocker.Application.Common.Exceptions.UnauthorizedException("User not found");

        // Revoke refresh tokens in database
        var command = new LogoutCommand { UserId = userId };
        await _mediator.Send(command);

        _logger.LogInformation("User {UserId} logged out - clearing auth cookies", userId);

        // Clear HttpOnly auth cookies (but keep tenant-code!)
        Response.ClearAuthCookies();
        _logger.LogDebug("Auth cookies cleared (tenant-code preserved)");

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
    /// Get current authenticated user information
    /// </summary>
    [HttpGet("me")]
    [Authorize]
    [ProducesResponseType(typeof(UserInfo), 200)]
    [ProducesResponseType(401)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> GetCurrentUser()
    {
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            _logger.LogWarning("Invalid or missing user ID claim");
            throw new Stocker.Application.Common.Exceptions.UnauthorizedException("User not found");
        }

        // Extract additional claims for invited user support
        var isInvitedUserClaim = User.FindFirst("IsInvitedUser")?.Value;
        var isInvitedUser = isInvitedUserClaim?.ToLower() == "true";

        var tenantUserIdClaim = User.FindFirst("TenantUserId")?.Value;
        Guid? tenantUserId = null;
        if (!string.IsNullOrEmpty(tenantUserIdClaim) && Guid.TryParse(tenantUserIdClaim, out var parsedTenantUserId))
        {
            tenantUserId = parsedTenantUserId;
        }

        var tenantIdClaim = User.FindFirst("TenantId")?.Value;
        Guid? tenantId = null;
        if (!string.IsNullOrEmpty(tenantIdClaim) && Guid.TryParse(tenantIdClaim, out var parsedTenantId))
        {
            tenantId = parsedTenantId;
        }

        _logger.LogInformation("Getting current user information for userId: {UserId} (IsInvitedUser: {IsInvitedUser}, TenantUserId: {TenantUserId})",
            userId, isInvitedUser, tenantUserId);

        var query = new GetCurrentUserQuery
        {
            UserId = userId,
            IsInvitedUser = isInvitedUser,
            TenantUserId = tenantUserId,
            TenantId = tenantId
        };
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
            IpAddress = GetClientIpAddress(),
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
            IpAddress = GetClientIpAddress(),
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
            return Ok(new
            {
                success = true,
                data = result.Value,
                message = "2FA kurulumu basariyla tamamlandi"
            });
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
            return Ok(new
            {
                success = true,
                data = result.Value,
                message = "2FA basariyla etkinlestirildi"
            });
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
            IpAddress = GetClientIpAddress(),
            UserAgent = Request.Headers["User-Agent"].ToString()
        };

        var result = await _mediator.Send(enrichedCommand);

        if (result.IsSuccess)
        {
            Response.SetAuthCookies(result.Value.AccessToken, result.Value.RefreshToken, result.Value.ExpiresAt);
            _logger.LogInformation("2FA verification successful for email: {Email}", command.Email);
            return Ok(new
            {
                success = true,
                data = result.Value,
                message = "2FA doğrulaması başarılı"
            });
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

    /// <summary>
    /// Get 2FA status for current user
    /// </summary>
    [HttpGet("2fa-status")]
    [Authorize]
    [ProducesResponseType(typeof(Get2FAStatusResponse), 200)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> Get2FAStatus()
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrEmpty(userId))
            throw new Stocker.Application.Common.Exceptions.UnauthorizedException("User not found");

        _logger.LogInformation("2FA status request for user: {UserId}", userId);

        var query = new Get2FAStatusQuery { UserId = Guid.Parse(userId) };
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
}