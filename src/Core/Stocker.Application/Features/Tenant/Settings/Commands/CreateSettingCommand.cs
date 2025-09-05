using MediatR;
using Stocker.Application.DTOs.Tenant.Settings;

namespace Stocker.Application.Features.Tenant.Settings.Commands;

public class CreateSettingCommand : IRequest<SettingDto>
{
    public Guid TenantId { get; set; }
    public string SettingKey { get; set; } = string.Empty;
    public string SettingValue { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Category { get; set; } = "General";
    public string DataType { get; set; } = "String";
    public bool IsSystemSetting { get; set; }
    public bool IsEncrypted { get; set; }
    public bool IsPublic { get; set; }
    public string? CreatedBy { get; set; }
}