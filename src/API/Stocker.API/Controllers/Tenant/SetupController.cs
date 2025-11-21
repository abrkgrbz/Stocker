using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Application.Features.Setup.Commands.CompleteSetup;
using Swashbuckle.AspNetCore.Annotations;
using System.Security.Claims;

namespace Stocker.API.Controllers.Tenant;

[ApiController]
[Route("api/[controller]")]
[Authorize]
[SwaggerTag("Setup - Post-registration setup and onboarding")]
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
    [SwaggerOperation(
        Summary = "Complete setup wizard",
        Description = "Completes the setup wizard by creating company and subscription after tenant registration"
    )]
    [SwaggerResponse(200, "Setup completed successfully")]
    [SwaggerResponse(400, "Invalid request or setup failed")]
    [SwaggerResponse(401, "Unauthorized - missing or invalid token")]
    [SwaggerResponse(500, "Internal server error")]
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
