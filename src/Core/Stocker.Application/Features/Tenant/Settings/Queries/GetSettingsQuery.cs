using MediatR;
using Stocker.Application.DTOs.Tenant.Settings;

namespace Stocker.Application.Features.Tenant.Settings.Queries;

public class GetSettingsQuery : IRequest<List<SettingCategoryDto>>
{
    public Guid TenantId { get; set; }
    public string? Category { get; set; }
    public bool IncludeSystemSettings { get; set; }
}