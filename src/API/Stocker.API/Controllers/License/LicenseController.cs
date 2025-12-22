using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Stocker.API.Controllers.License;

/// <summary>
/// Self-hosted lisans yönetimi için API endpoint'leri
/// </summary>
[ApiController]
[Route("api/[controller]")]
[AllowAnonymous]
public class LicenseController : ControllerBase
{
    private readonly ILicenseService _licenseService;
    private readonly ILogger<LicenseController> _logger;

    public LicenseController(ILicenseService licenseService, ILogger<LicenseController> logger)
    {
        _licenseService = licenseService;
        _logger = logger;
    }

    /// <summary>
    /// Lisans anahtarını doğrula ve aktifleştir
    /// </summary>
    [HttpPost("validate")]
    public async Task<IActionResult> ValidateLicense([FromBody] ValidateLicenseRequest request)
    {
        try
        {
            var result = await _licenseService.ValidateLicenseAsync(request);

            if (!result.Valid)
            {
                return BadRequest(new { valid = false, message = result.ErrorMessage });
            }

            return Ok(new
            {
                valid = true,
                license = new
                {
                    companyName = result.License!.CompanyName,
                    email = result.License.Email,
                    maxUsers = result.License.MaxUsers,
                    expiresAt = result.License.ExpiresAt,
                    features = result.License.Features
                }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "License validation failed");
            return StatusCode(500, new { valid = false, message = "Lisans doğrulama hatası" });
        }
    }

    /// <summary>
    /// Mevcut lisansı kontrol et (periyodik)
    /// </summary>
    [HttpPost("check")]
    public async Task<IActionResult> CheckLicense([FromBody] CheckLicenseRequest request)
    {
        try
        {
            var result = await _licenseService.CheckLicenseAsync(request);

            if (!result.Valid)
            {
                return BadRequest(new { valid = false, message = result.ErrorMessage });
            }

            return Ok(new
            {
                valid = true,
                license = new
                {
                    expiresAt = result.License!.ExpiresAt,
                    features = result.License.Features
                }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "License check failed");
            return StatusCode(500, new { valid = false, message = "Lisans kontrol hatası" });
        }
    }

    /// <summary>
    /// Lisansı devre dışı bırak
    /// </summary>
    [HttpPost("deactivate")]
    public async Task<IActionResult> DeactivateLicense([FromBody] DeactivateLicenseRequest request)
    {
        try
        {
            await _licenseService.DeactivateLicenseAsync(request);
            return Ok(new { success = true, message = "Lisans devre dışı bırakıldı" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "License deactivation failed");
            return StatusCode(500, new { success = false, message = "Devre dışı bırakma hatası" });
        }
    }
}

#region DTOs

public record ValidateLicenseRequest(
    string LicenseKey,
    string MachineId,
    string ProductId,
    string Version
);

public record CheckLicenseRequest(
    string LicenseKey,
    string MachineId,
    string ProductId
);

public record DeactivateLicenseRequest(
    string LicenseKey,
    string MachineId
);

public record LicenseInfo(
    string CompanyName,
    string Email,
    int MaxUsers,
    DateTime ExpiresAt,
    List<string> Features
);

public record LicenseValidationResult(
    bool Valid,
    LicenseInfo? License = null,
    string? ErrorMessage = null
);

#endregion

#region Service Interface

public interface ILicenseService
{
    Task<LicenseValidationResult> ValidateLicenseAsync(ValidateLicenseRequest request);
    Task<LicenseValidationResult> CheckLicenseAsync(CheckLicenseRequest request);
    Task DeactivateLicenseAsync(DeactivateLicenseRequest request);
}

#endregion
