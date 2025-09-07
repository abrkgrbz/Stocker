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
            Key = setting.Key,
            Value = setting.Value,
            DisplayName = setting.DisplayName ?? setting.Key,
            Description = setting.Description,
            DataType = setting.DataType ?? "string",
            IsRequired = setting.IsRequired,
            IsReadOnly = setting.IsReadOnly,
            DefaultValue = setting.DefaultValue
        };
    }
}