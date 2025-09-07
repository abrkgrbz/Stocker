using MediatR;
using Stocker.Application.DTOs.Tenant.Settings;
using Stocker.Application.Features.Tenant.Settings.Queries;
using Stocker.Application.Interfaces.Repositories;

namespace Stocker.Application.Features.Tenant.Settings.Handlers;

public class GetSettingsQueryHandler : IRequestHandler<GetSettingsQuery, List<SettingCategoryDto>>
{
    private readonly ISettingsRepository _settingsRepository;

    public GetSettingsQueryHandler(ISettingsRepository settingsRepository)
    {
        _settingsRepository = settingsRepository;
    }

    public async Task<List<SettingCategoryDto>> Handle(GetSettingsQuery request, CancellationToken cancellationToken)
    {
        return await _settingsRepository.GetGroupedSettingsAsync(request.TenantId, cancellationToken);
    }
}