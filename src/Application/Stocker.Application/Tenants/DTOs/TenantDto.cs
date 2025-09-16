namespace Stocker.Application.Tenants.DTOs;

public class TenantDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Slug { get; set; }
    public bool IsActive { get; set; }
    public string? PrimaryColor { get; set; }
    public string? SecondaryColor { get; set; }
    public string? Logo { get; set; }
    public DateTime CreatedDate { get; set; }
}