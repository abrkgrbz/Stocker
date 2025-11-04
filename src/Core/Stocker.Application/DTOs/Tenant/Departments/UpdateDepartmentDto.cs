namespace Stocker.Application.DTOs.Tenant.Departments;

public class UpdateDepartmentDto
{
    public string Name { get; set; } = string.Empty;
    public string? Code { get; set; }
    public string? Description { get; set; }
}
