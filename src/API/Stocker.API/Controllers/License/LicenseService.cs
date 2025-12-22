using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

namespace Stocker.API.Controllers.License;

/// <summary>
/// Lisans yönetim servisi
/// Lisanslar veritabanında saklanır ve periyodik olarak ana sunucu ile doğrulanır
/// </summary>
public class LicenseService : ILicenseService
{
    private readonly IConfiguration _configuration;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger<LicenseService> _logger;

    // Lisans sunucu URL'i (sizin ana sunucunuz)
    private readonly string _licenseServerUrl;

    public LicenseService(
        IConfiguration configuration,
        IHttpClientFactory httpClientFactory,
        ILogger<LicenseService> logger)
    {
        _configuration = configuration;
        _httpClientFactory = httpClientFactory;
        _logger = logger;
        _licenseServerUrl = configuration["SelfHosted:LicenseServer"] ?? "https://api.stoocker.app/license";
    }

    public async Task<LicenseValidationResult> ValidateLicenseAsync(ValidateLicenseRequest request)
    {
        try
        {
            // Ana lisans sunucusuna istek gönder
            var client = _httpClientFactory.CreateClient("LicenseServer");
            client.BaseAddress = new Uri(_licenseServerUrl);

            var response = await client.PostAsJsonAsync("/validate", new
            {
                licenseKey = request.LicenseKey,
                machineId = request.MachineId,
                productId = request.ProductId,
                version = request.Version,
                timestamp = DateTime.UtcNow
            });

            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                _logger.LogWarning("License validation failed: {Error}", errorContent);

                return new LicenseValidationResult(false, ErrorMessage: "Lisans doğrulanamadı");
            }

            var result = await response.Content.ReadFromJsonAsync<LicenseServerResponse>();

            if (result == null || !result.Valid)
            {
                return new LicenseValidationResult(false, ErrorMessage: result?.Message ?? "Geçersiz lisans");
            }

            // Lisans bilgilerini döndür
            var licenseInfo = new LicenseInfo(
                CompanyName: result.CompanyName!,
                Email: result.Email!,
                MaxUsers: result.MaxUsers,
                ExpiresAt: result.ExpiresAt,
                Features: result.Features ?? new List<string>()
            );

            _logger.LogInformation("License validated for {Company}", licenseInfo.CompanyName);

            return new LicenseValidationResult(true, licenseInfo);
        }
        catch (HttpRequestException ex)
        {
            _logger.LogError(ex, "Cannot connect to license server");
            return new LicenseValidationResult(false, ErrorMessage: "Lisans sunucusuna bağlanılamadı");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "License validation error");
            return new LicenseValidationResult(false, ErrorMessage: "Lisans doğrulama hatası");
        }
    }

    public async Task<LicenseValidationResult> CheckLicenseAsync(CheckLicenseRequest request)
    {
        try
        {
            var client = _httpClientFactory.CreateClient("LicenseServer");
            client.BaseAddress = new Uri(_licenseServerUrl);

            var response = await client.PostAsJsonAsync("/check", new
            {
                licenseKey = request.LicenseKey,
                machineId = request.MachineId,
                productId = request.ProductId,
                timestamp = DateTime.UtcNow
            });

            if (!response.IsSuccessStatusCode)
            {
                return new LicenseValidationResult(false, ErrorMessage: "Lisans kontrolü başarısız");
            }

            var result = await response.Content.ReadFromJsonAsync<LicenseServerResponse>();

            if (result == null || !result.Valid)
            {
                return new LicenseValidationResult(false, ErrorMessage: result?.Message ?? "Lisans geçersiz");
            }

            var licenseInfo = new LicenseInfo(
                CompanyName: result.CompanyName ?? "",
                Email: result.Email ?? "",
                MaxUsers: result.MaxUsers,
                ExpiresAt: result.ExpiresAt,
                Features: result.Features ?? new List<string>()
            );

            return new LicenseValidationResult(true, licenseInfo);
        }
        catch (HttpRequestException)
        {
            // Sunucuya ulaşılamıyor - offline mod devam edebilir
            _logger.LogWarning("License server unreachable, offline mode");
            return new LicenseValidationResult(false, ErrorMessage: "Lisans sunucusuna ulaşılamıyor");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "License check error");
            return new LicenseValidationResult(false, ErrorMessage: "Lisans kontrol hatası");
        }
    }

    public async Task DeactivateLicenseAsync(DeactivateLicenseRequest request)
    {
        try
        {
            var client = _httpClientFactory.CreateClient("LicenseServer");
            client.BaseAddress = new Uri(_licenseServerUrl);

            await client.PostAsJsonAsync("/deactivate", new
            {
                licenseKey = request.LicenseKey,
                machineId = request.MachineId,
                timestamp = DateTime.UtcNow
            });

            _logger.LogInformation("License deactivated for machine {MachineId}", request.MachineId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "License deactivation error");
            throw;
        }
    }
}

/// <summary>
/// Lisans sunucusu yanıt modeli
/// </summary>
internal record LicenseServerResponse
{
    public bool Valid { get; init; }
    public string? Message { get; init; }
    public string? CompanyName { get; init; }
    public string? Email { get; init; }
    public int MaxUsers { get; init; }
    public DateTime ExpiresAt { get; init; }
    public List<string>? Features { get; init; }
}
