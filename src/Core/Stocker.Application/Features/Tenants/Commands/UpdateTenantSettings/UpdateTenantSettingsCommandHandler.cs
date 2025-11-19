using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;
using Stocker.Domain.Master.Entities;
using Stocker.SharedKernel.Results;
using System.Text.Json;

namespace Stocker.Application.Features.Tenants.Commands.UpdateTenantSettings;

public class UpdateTenantSettingsCommandHandler : IRequestHandler<UpdateTenantSettingsCommand, Result>
{
    private readonly ILogger<UpdateTenantSettingsCommandHandler> _logger;
    private readonly IMasterDbContext _masterContext;

    public UpdateTenantSettingsCommandHandler(
        ILogger<UpdateTenantSettingsCommandHandler> logger,
        IMasterDbContext masterContext)
    {
        _logger = logger;
        _masterContext = masterContext;
    }

    public async Task<Result> Handle(UpdateTenantSettingsCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Updating settings for tenant: {TenantId}", request.TenantId);

        try
        {
            var tenant = await _masterContext.Tenants
                .FirstOrDefaultAsync(t => t.Id == request.TenantId, cancellationToken);

            if (tenant == null)
            {
                return Result.Failure(Error.NotFound("Tenant.NotFound", "Tenant not found"));
            }

            var settings = await _masterContext.TenantSettings
                .FirstOrDefaultAsync(s => s.TenantId == request.TenantId, cancellationToken);

            if (settings == null)
            {
                // Create new settings if doesn't exist
                if (request.General == null)
                {
                    return Result.Failure(Error.Validation("TenantSettings.GeneralRequired", "General settings are required for initial setup"));
                }

                settings = TenantSettings.Create(
                    request.TenantId,
                    request.General.CompanyName,
                    request.General.Timezone,
                    request.General.Language,
                    request.General.DateFormat,
                    request.General.TimeFormat,
                    request.General.Currency);

                _masterContext.TenantSettings.Add(settings);
            }

            // Update General Settings
            if (request.General != null)
            {
                settings.UpdateGeneralSettings(
                    request.General.CompanyName,
                    request.General.Timezone,
                    request.General.Language,
                    request.General.DateFormat,
                    request.General.TimeFormat,
                    request.General.Currency,
                    request.General.FiscalYearStart,
                    request.General.WeekStart);
            }

            // Update Branding Settings
            if (request.Branding != null)
            {
                settings.UpdateBrandingSettings(
                    request.Branding.PrimaryColor,
                    request.Branding.SecondaryColor,
                    request.Branding.LogoUrl,
                    request.Branding.FaviconUrl,
                    request.Branding.CustomFooter,
                    request.Branding.CustomCSS,
                    request.Branding.HideWatermark);
            }

            // Update Email Settings
            if (request.Email != null)
            {
                settings.UpdateEmailSettings(JsonSerializer.Serialize(request.Email));
            }

            // Update Notification Settings
            if (request.Notifications != null)
            {
                settings.UpdateNotificationSettings(JsonSerializer.Serialize(request.Notifications));
            }

            // Update Security Settings
            if (request.Security != null)
            {
                settings.UpdateSecuritySettings(JsonSerializer.Serialize(request.Security));
            }

            // Update API Settings
            if (request.Api != null)
            {
                settings.UpdateApiSettings(JsonSerializer.Serialize(request.Api));
            }

            // Update Storage Settings
            if (request.Storage != null)
            {
                settings.UpdateStorageSettings(JsonSerializer.Serialize(request.Storage));
            }

            // Update Advanced Settings
            if (request.Advanced != null)
            {
                settings.UpdateAdvancedSettings(JsonSerializer.Serialize(request.Advanced));
            }

            await _masterContext.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Successfully updated settings for tenant: {TenantId}", request.TenantId);
            return Result.Success();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating tenant settings: {TenantId}", request.TenantId);
            return Result.Failure(
                Error.Failure("TenantSettings.UpdateError", "An error occurred while updating tenant settings"));
        }
    }
}
