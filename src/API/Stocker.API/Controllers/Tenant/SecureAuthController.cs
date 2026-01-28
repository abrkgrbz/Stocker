using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Application.Features.Identity.Commands.Login;
using Stocker.Application.Features.Identity.Commands.RefreshToken;
using Stocker.Application.Features.Identity.Commands.Logout;
using Stocker.Application.Common.Interfaces;
using Stocker.Identity.Services;
using Stocker.API.Extensions;
using Swashbuckle.AspNetCore.Annotations;
using System.Security.Claims;

namespace Stocker.API.Controllers.Tenant;

[ApiController]
[Route("api/secure-auth")]
[ApiExplorerSettings(GroupName = "public")]
[SwaggerTag("Secure Authentication - Cookie-based authentication with httpOnly cookies")]
public class SecureAuthController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ILogger<SecureAuthController> _logger;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly IConfiguration _configuration;

    public SecureAuthController(
        IMediator mediator, 
        ILogger<SecureAuthController> logger,
        IJwtTokenService jwtTokenService,
        IConfiguration configuration)
    {
        _mediator = mediator;
        _logger = logger;
        _jwtTokenService = jwtTokenService;
        _configuration = configuration;
    }

    /// <summary>
    /// Check current session status
    /// </summary>
    [HttpGet("session")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(SessionResponse), 200)]
    [ProducesResponseType(401)]
    public IActionResult GetSession()
    {
        // Check if user has valid auth cookie
        var accessToken = Request.Cookies["access_token"];
        var refreshToken = Request.Cookies["refresh_token"];

        if (string.IsNullOrEmpty(accessToken))
        {
            return Unauthorized(new { message = "No active session" });
        }

        // Validate token
        var principal = _jwtTokenService.ValidateToken(accessToken);
        if (principal == null)
        {
            // Try to refresh if we have refresh token
            if (!string.IsNullOrEmpty(refreshToken))
            {
                return Ok(new SessionResponse
                {
                    IsAuthenticated = false,
                    NeedsRefresh = true
                });
            }

            Response.Cookies.Delete("access_token");
            Response.Cookies.Delete("refresh_token");
            return Unauthorized(new { message = "Invalid session" });
        }

        return Ok(new SessionResponse
        {
            IsAuthenticated = true,
            AccessToken = accessToken,
            User = GetUserFromPrincipal(principal)
        });
    }

    /// <summary>
    /// Login with email and password (sets httpOnly cookies)
    /// </summary>
    [HttpPost("login")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(SecureAuthResponse), 200)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> SecureLogin([FromBody] LoginCommand command)
    {
        _logger.LogInformation("Secure login attempt for email: {Email}", command.Email);

        // Add IP address and User-Agent for audit logging
        var enrichedCommand = command with
        {
            IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString(),
            UserAgent = Request.Headers["User-Agent"].ToString()
        };

        var result = await _mediator.Send(enrichedCommand);
        
        if (result.IsSuccess)
        {
            var authData = result.Value;
            
            // Set httpOnly cookies
            SetAuthCookiesInternal(authData.AccessToken, authData.RefreshToken);
            
            _logger.LogInformation("User {Email} logged in successfully with secure cookies", command.Email);
            
            // Get tenant code from header or user data
            var tenantCode = Request.Headers["X-Tenant-Code"].FirstOrDefault() 
                            ?? authData.User?.TenantName; // Use TenantName as TenantCode if available
            
            // Return user data and tokens (for memory storage on client)
            return Ok(new SecureAuthResponse
            {
                User = authData.User,
                AccessToken = authData.AccessToken,
                RefreshToken = authData.RefreshToken,
                TenantId = authData.User?.TenantId?.ToString(),
                TenantCode = tenantCode
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
    /// Refresh access token using httpOnly refresh token cookie
    /// </summary>
    [HttpPost("refresh")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(RefreshResponse), 200)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> RefreshToken()
    {
        var refreshToken = Request.Cookies["refresh_token"];
        
        if (string.IsNullOrEmpty(refreshToken))
        {
            return Unauthorized(new { message = "No refresh token found" });
        }

        var command = new RefreshTokenCommand { RefreshToken = refreshToken };
        var result = await _mediator.Send(command);
        
        if (result.IsSuccess)
        {
            var authData = result.Value;
            
            // Update cookies
            SetAuthCookiesInternal(authData.AccessToken, authData.RefreshToken);
            
            return Ok(new RefreshResponse
            {
                AccessToken = authData.AccessToken
            });
        }
        
        // Clear invalid cookies
        Response.Cookies.Delete("access_token");
        Response.Cookies.Delete("refresh_token");
        
        return Unauthorized(new { message = "Invalid refresh token" });
    }

    /// <summary>
    /// Logout current user (clears httpOnly cookies)
    /// </summary>
    [HttpPost("logout")]
    [AllowAnonymous] // Allow even without valid token to clear cookies
    [ProducesResponseType(200)]
    public async Task<IActionResult> SecureLogout()
    {
        // Get user ID from cookie token if available
        var accessToken = Request.Cookies["access_token"];
        if (!string.IsNullOrEmpty(accessToken))
        {
            var principal = _jwtTokenService.ValidateToken(accessToken);
            if (principal != null)
            {
                var userId = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!string.IsNullOrEmpty(userId))
                {
                    var command = new LogoutCommand { UserId = userId };
                    await _mediator.Send(command);
                    _logger.LogInformation("User {UserId} logged out", userId);
                }
            }
        }
        
        // Clear cookies
        ClearAuthCookiesInternal();
        
        return Ok(new
        {
            success = true,
            message = "Logged out successfully"
        });
    }

    /// <summary>
    /// Get current user information
    /// </summary>
    [HttpGet("me")]
    [Authorize]
    [ProducesResponseType(typeof(SecureUserInfo), 200)]
    public IActionResult GetCurrentUser()
    {
        var user = GetUserFromPrincipal(User);
        return Ok(user);
    }

    #region Helper Methods

    private void SetAuthCookiesInternal(string accessToken, string refreshToken)
    {
        Response.SetAuthCookies(accessToken, refreshToken, DateTimeOffset.UtcNow.AddHours(1));
    }

    private void ClearAuthCookiesInternal()
    {
        Response.ClearAuthCookies();
    }

    private SecureUserInfo GetUserFromPrincipal(ClaimsPrincipal principal)
    {
        return new SecureUserInfo
        {
            Id = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value,
            Email = principal.FindFirst(ClaimTypes.Email)?.Value,
            Name = principal.FindFirst(ClaimTypes.Name)?.Value,
            TenantId = principal.FindFirst("TenantId")?.Value,
            TenantCode = principal.FindFirst("TenantCode")?.Value,
            Roles = principal.FindAll(ClaimTypes.Role).Select(c => c.Value).ToList()
        };
    }

    #endregion

    #region Response Models

    public class SessionResponse
    {
        public bool IsAuthenticated { get; set; }
        public bool NeedsRefresh { get; set; }
        public string AccessToken { get; set; }
        public SecureUserInfo User { get; set; }
    }

    public class SecureAuthResponse
    {
        public object User { get; set; }
        public string AccessToken { get; set; }
        public string RefreshToken { get; set; }
        public string TenantId { get; set; }
        public string TenantCode { get; set; }
    }

    public class RefreshResponse
    {
        public string AccessToken { get; set; }
    }

    public class SecureUserInfo
    {
        public string Id { get; set; }
        public string Email { get; set; }
        public string Name { get; set; }
        public string TenantId { get; set; }
        public string TenantCode { get; set; }
        public List<string> Roles { get; set; }
    }

    #endregion
}