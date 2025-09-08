using MediatR;
using Stocker.Application.DTOs.Tenant.Settings;
using Stocker.Application.Features.Tenant.Settings.Queries;
using Stocker.Application.Interfaces.Repositories;

namespace Stocker.Application.Features.Tenant.Settings.Handlers;

public class GetSettingByKeyQueryHandler : IRequestHandler<GetSettingByKeyQuery, SettingDto?>
{
    private readonly ISettingsRepository _settingsRepository;

    public GetSettingByKeyQueryHandler(ISettingsRepository settingsRepository)
    {
        _settingsRepository = settingsRepository;
    }

    public async Task<SettingDto?> Handle(GetSettingByKeyQuery request, CancellationToken cancellationToken)
    {
        var setting = await _settingsRepository.GetTenantSettingByKeyAsync(request.TenantId, request.SettingKey, cancellationToken);
        
        if (setting == null)
            return null;

        return new SettingDto
        {
            Id = setting.Id,
            SettingKey = setting.SettingKey,
            SettingValue = setting.SettingValue,
            Description = setting.Description,
            Category = setting.Category,
            DataType = setting.DataType,
            IsSystemSetting = setting.IsSystemSetting,
            IsEncrypted = setting.IsEncrypted,
            IsPublic = setting.IsPublic,
            CreatedAt = setting.CreatedAt,
            UpdatedAt = setting.UpdatedAt
        };
    }
}