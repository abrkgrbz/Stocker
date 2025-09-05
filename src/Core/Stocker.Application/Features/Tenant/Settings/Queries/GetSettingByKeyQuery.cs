using MediatR;
using Stocker.Application.DTOs.Tenant.Settings;

namespace Stocker.Application.Features.Tenant.Settings.Queries;

public class GetSettingByKeyQuery : IRequest<SettingDto?>
{
    public Guid TenantId { get; set; }
    public string SettingKey { get; set; } = string.Empty;
}