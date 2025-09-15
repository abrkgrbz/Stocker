using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Domain.Entities.Settings;
using Stocker.Application.Common.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Settings.Commands.UpdateGeneralSettings;

public class UpdateGeneralSettingsCommandHandler : IRequestHandler<UpdateGeneralSettingsCommand, Result<bool>>
{
    private readonly IMasterDbContext _context;

    public UpdateGeneralSettingsCommandHandler(IMasterDbContext context)
    {
        _context = context;
    }

    public async Task<Result<bool>> Handle(UpdateGeneralSettingsCommand request, CancellationToken cancellationToken)
    {
        try
        {
            await UpdateOrCreateSetting(SettingCategories.General, SettingKeys.SiteName, request.SiteName, cancellationToken);
            await UpdateOrCreateSetting(SettingCategories.General, SettingKeys.SiteUrl, request.SiteUrl, cancellationToken);
            await UpdateOrCreateSetting(SettingCategories.General, SettingKeys.AdminEmail, request.AdminEmail, cancellationToken);
            await UpdateOrCreateSetting(SettingCategories.General, SettingKeys.DefaultLanguage, request.DefaultLanguage, cancellationToken);
            await UpdateOrCreateSetting(SettingCategories.General, SettingKeys.DefaultTimezone, request.DefaultTimezone, cancellationToken);
            await UpdateOrCreateSetting(SettingCategories.General, SettingKeys.DateFormat, request.DateFormat, cancellationToken);
            await UpdateOrCreateSetting(SettingCategories.General, SettingKeys.TimeFormat, request.TimeFormat, cancellationToken);
            await UpdateOrCreateSetting(SettingCategories.General, SettingKeys.Currency, request.Currency, cancellationToken);
            await UpdateOrCreateSetting(SettingCategories.General, SettingKeys.MaxUploadSize, request.MaxUploadSize.ToString(), cancellationToken);
            await UpdateOrCreateSetting(SettingCategories.General, SettingKeys.AllowRegistration, request.AllowRegistration.ToString(), cancellationToken);
            await UpdateOrCreateSetting(SettingCategories.General, SettingKeys.RequireEmailVerification, request.RequireEmailVerification.ToString(), cancellationToken);
            await UpdateOrCreateSetting(SettingCategories.General, SettingKeys.MaintenanceMode, request.MaintenanceMode.ToString(), cancellationToken);

            await _context.SaveChangesAsync(cancellationToken);
            
            return Result<bool>.Success(true);
        }
        catch (Exception ex)
        {
            return Result<bool>.Failure(new SharedKernel.Results.Error("UpdateSettings.Failed", $"Failed to update general settings: {ex.Message}"));
        }
    }

    private async Task UpdateOrCreateSetting(string category, string key, string value, CancellationToken cancellationToken)
    {
        var setting = await _context.SystemSettings
            .FirstOrDefaultAsync(s => s.Category == category && s.Key == key, cancellationToken);

        if (setting == null)
        {
            setting = new SystemSettings(category, key, value, null, true, false);
            _context.SystemSettings.Add(setting);
        }
        else
        {
            setting.UpdateValue(value);
        }
    }
}