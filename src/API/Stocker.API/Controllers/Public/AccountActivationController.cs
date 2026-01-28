using MediatR;
using Microsoft.AspNetCore.Mvc;
using Stocker.API.Controllers.Base;
using Stocker.API.Extensions;
using Stocker.Application.DTOs.Tenant.Users;
using Stocker.Application.Features.Tenant.Users.Commands;
using Stocker.Application.Common.Exceptions;

namespace Stocker.API.Controllers.Public;

/// <summary>
/// Public controller for account activation (no authentication required).
/// Handles password setup for invited users.
/// </summary>
[ApiController]
[Route("api/public/account")]
public class AccountActivationController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IConfiguration _configuration;
    private readonly ILogger<AccountActivationController> _logger;

    public AccountActivationController(
        IMediator mediator,
        IConfiguration configuration,
        ILogger<AccountActivationController> logger)
    {
        _mediator = mediator;
        _configuration = configuration;
        _logger = logger;
    }

    /// <summary>
    /// Setup password for an invited user (account activation).
    /// This endpoint is used when a user clicks the activation link from their invitation email.
    /// Returns authentication tokens for auto-login.
    /// </summary>
    /// <param name="dto">Setup password request containing tenantId, userId, token, and passwords</param>
    /// <returns>Auth tokens for auto-login on success</returns>
    [HttpPost("setup-password")]
    [ProducesResponseType(typeof(ApiResponse<SetupPasswordResultDto>), 200)]
    [ProducesResponseType(typeof(ApiResponse<object>), 400)]
    public async Task<IActionResult> SetupPassword([FromBody] SetupPasswordDto dto)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values.SelectMany(v => v.Errors.Select(e => e.ErrorMessage));
            return BadRequest(new ApiResponse<object>
            {
                Success = false,
                Message = string.Join(", ", errors)
            });
        }

        _logger.LogInformation(
            "Account activation attempt for user {UserId} in tenant {TenantId}",
            dto.UserId,
            dto.TenantId);

        var command = new SetupPasswordCommand
        {
            TenantId = dto.TenantId,
            UserId = dto.UserId,
            Token = dto.Token,
            Password = dto.Password,
            ConfirmPassword = dto.ConfirmPassword
        };

        var result = await _mediator.Send(command);

        if (result.IsFailure)
        {
            _logger.LogWarning(
                "Account activation failed for user {UserId}: {Error}",
                dto.UserId,
                result.Error?.Description);

            return BadRequest(new ApiResponse<object>
            {
                Success = false,
                Message = result.Error?.Description ?? "Hesap aktifleştirilemedi"
            });
        }

        // Set HttpOnly cookies for auto-login
        SetAuthCookies(result.Value.AccessToken, result.Value.RefreshToken);

        _logger.LogInformation(
            "Account activated successfully for user {UserId} in tenant {TenantId}",
            dto.UserId,
            dto.TenantId);

        return Ok(new ApiResponse<SetupPasswordResultDto>
        {
            Success = true,
            Data = result.Value,
            Message = "Hesabınız başarıyla aktifleştirildi."
        });
    }

    /// <summary>
    /// Helper method to set authentication cookies (for auto-login after password setup)
    /// </summary>
    private void SetAuthCookies(string accessToken, string refreshToken)
    {
        Response.SetAuthCookies(accessToken, refreshToken, DateTimeOffset.UtcNow.AddHours(1));
    }
}

/// <summary>
/// DTO for setting up password during account activation.
/// </summary>
public class SetupPasswordDto
{
    public Guid TenantId { get; set; }
    public Guid UserId { get; set; }
    public string Token { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string ConfirmPassword { get; set; } = string.Empty;
}
