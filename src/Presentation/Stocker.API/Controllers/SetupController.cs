using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Application.Features.Setup.Commands.CompleteSetup;
using System.Security.Claims;

namespace Stocker.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SetupController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ILogger<SetupController> _logger;

    public SetupController(IMediator mediator, ILogger<SetupController> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// Complete post-registration setup with package selection and company details
    /// </summary>
    [HttpPost("complete")]
    public async Task<IActionResult> CompleteSetup([FromBody] CompleteSetupRequest request, CancellationToken cancellationToken)
    {
        try
        {
            // Get userId and tenantId from claims
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var tenantIdClaim = User.FindFirst("TenantId")?.Value;

            if (string.IsNullOrEmpty(userIdClaim) || string.IsNullOrEmpty(tenantIdClaim))
            {
                return Unauthorized(new { success = false, message = "Kullanıcı bilgileri bulunamadı" });
            }

            if (!Guid.TryParse(userIdClaim, out var userId) || !Guid.TryParse(tenantIdClaim, out var tenantId))
            {
                return BadRequest(new { success = false, message = "Geçersiz kullanıcı bilgileri" });
            }

            var command = new CompleteSetupCommand
            {
                UserId = userId,
                TenantId = tenantId,
                PackageId = request.PackageId,
                CompanyName = request.CompanyName,
                CompanyCode = request.CompanyCode,
                Sector = request.Sector,
                EmployeeCount = request.EmployeeCount,
                ContactPhone = request.ContactPhone,
                Address = request.Address,
                TaxOffice = request.TaxOffice,
                TaxNumber = request.TaxNumber
            };

            var result = await _mediator.Send(command, cancellationToken);

            if (result.IsSuccess)
            {
                return Ok(new
                {
                    success = true,
                    data = result.Value,
                    message = result.Value.Message
                });
            }

            return BadRequest(new
            {
                success = false,
                message = result.Error.Description
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Setup completion error");
            return StatusCode(500, new
            {
                success = false,
                message = "Kurulum sırasında bir hata oluştu"
            });
        }
    }
}

public sealed record CompleteSetupRequest
{
    public Guid PackageId { get; init; }
    public string CompanyName { get; init; } = string.Empty;
    public string CompanyCode { get; init; } = string.Empty;
    public string? Sector { get; init; }
    public string? EmployeeCount { get; init; }
    public string? ContactPhone { get; init; }
    public string? Address { get; init; }
    public string? TaxOffice { get; init; }
    public string? TaxNumber { get; init; }
}
