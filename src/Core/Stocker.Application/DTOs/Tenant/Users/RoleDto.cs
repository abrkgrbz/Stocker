namespace Stocker.Application.DTOs.Tenant.Users;

public class RoleDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public List<string> Permissions { get; set; } = new();
    public int UserCount { get; set; }
    public bool IsSystemRole { get; set; }
    public DateTime CreatedDate { get; set; }
}