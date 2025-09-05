namespace Stocker.Application.DTOs.Tenant.Settings;

public class SettingDto
{
    public Guid Id { get; set; }
    public string SettingKey { get; set; } = string.Empty;
    public string SettingValue { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Category { get; set; } = string.Empty;
    public string DataType { get; set; } = string.Empty;
    public bool IsSystemSetting { get; set; }
    public bool IsEncrypted { get; set; }
    public bool IsPublic { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}