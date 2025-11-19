using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;
using Stocker.SharedKernel.Results;
using System.Text.Json;

namespace Stocker.Application.Features.Tenants.Queries.GetTenantSettings;

public class GetTenantSettingsQueryHandler : IRequestHandler<GetTenantSettingsQuery, Result<GetTenantSettingsResponse>>
{
    private readonly ILogger<GetTenantSettingsQueryHandler> _logger;
    private readonly IMasterDbContext _masterContext;

    public GetTenantSettingsQueryHandler(
        ILogger<GetTenantSettingsQueryHandler> logger,
        IMasterDbContext masterContext)
    {
        _logger = logger;
        _masterContext = masterContext;
    }

    public async Task<Result<GetTenantSettingsResponse>> Handle(GetTenantSettingsQuery request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Getting settings for tenant: {TenantId}", request.TenantId);

        try
        {
            var settings = await _masterContext.TenantSettings
                .FirstOrDefaultAsync(s => s.TenantId == request.TenantId, cancellationToken);

            if (settings == null)
            {
                _logger.LogInformation("No settings found for tenant {TenantId}, returning defaults", request.TenantId);

                // Return default settings
                return Result.Success(new GetTenantSettingsResponse
                {
                    General = new GeneralSettings(),
                    Branding = new BrandingSettings(),
                    Email = new EmailSettings(),
                    Notifications = new NotificationSettings(),
                    Security = new SecuritySettings(),
                    Api = new ApiSettings(),
                    Storage = new StorageSettings(),
                    Advanced = new AdvancedSettings()
                });
            }

            var response = new GetTenantSettingsResponse
            {
                General = new GeneralSettings
                {
                    CompanyName = settings.CompanyName,
                    Timezone = settings.Timezone,
                    Language = settings.Language,
                    DateFormat = settings.DateFormat,
                    TimeFormat = settings.TimeFormat,
                    Currency = settings.Currency,
                    FiscalYearStart = settings.FiscalYearStart,
                    WeekStart = settings.WeekStart
                },
                Branding = new BrandingSettings
                {
                    PrimaryColor = settings.PrimaryColor,
                    SecondaryColor = settings.SecondaryColor,
                    LogoUrl = settings.LogoUrl,
                    FaviconUrl = settings.FaviconUrl,
                    CustomFooter = settings.CustomFooter,
                    CustomCSS = settings.CustomCSS,
                    HideWatermark = settings.HideWatermark
                },
                Email = DeserializeSettings<EmailSettings>(settings.EmailSettingsJson) ?? new EmailSettings(),
                Notifications = DeserializeSettings<NotificationSettings>(settings.NotificationSettingsJson) ?? new NotificationSettings(),
                Security = DeserializeSettings<SecuritySettings>(settings.SecuritySettingsJson) ?? new SecuritySettings(),
                Api = DeserializeSettings<ApiSettings>(settings.ApiSettingsJson) ?? new ApiSettings(),
                Storage = DeserializeSettings<StorageSettings>(settings.StorageSettingsJson) ?? new StorageSettings(),
                Advanced = DeserializeSettings<AdvancedSettings>(settings.AdvancedSettingsJson) ?? new AdvancedSettings()
            };

            return Result.Success(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting tenant settings: {TenantId}", request.TenantId);
            return Result.Failure<GetTenantSettingsResponse>(
                Error.Failure("TenantSettings.GetError", "An error occurred while retrieving tenant settings"));
        }
    }

    private T? DeserializeSettings<T>(string? json) where T : class
    {
        if (string.IsNullOrEmpty(json))
            return null;

        try
        {
            return JsonSerializer.Deserialize<T>(json, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });
        }
        catch (JsonException ex)
        {
            _logger.LogWarning(ex, "Failed to deserialize settings JSON: {Type}", typeof(T).Name);
            return null;
        }
    }
}
