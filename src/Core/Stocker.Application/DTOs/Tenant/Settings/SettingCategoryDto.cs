namespace Stocker.Application.DTOs.Tenant.Settings;

public class SettingCategoryDto
{
    public string Category { get; set; } = string.Empty;
    public string? Description { get; set; }
    public List<SettingDto> Settings { get; set; } = new();
}