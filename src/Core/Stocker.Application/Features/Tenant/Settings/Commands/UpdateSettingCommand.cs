using MediatR;

namespace Stocker.Application.Features.Tenant.Settings.Commands;

public class UpdateSettingCommand : IRequest<bool>
{
    public Guid TenantId { get; set; }
    public string SettingKey { get; set; } = string.Empty;
    public string SettingValue { get; set; } = string.Empty;
    public string? ModifiedBy { get; set; }
}