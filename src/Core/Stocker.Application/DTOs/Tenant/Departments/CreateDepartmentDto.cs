namespace Stocker.Application.DTOs.Tenant.Departments;

public class CreateDepartmentDto
{
    public string Name { get; set; } = string.Empty;
    public string? Code { get; set; }
    public string? Description { get; set; }
    public Guid? ParentDepartmentId { get; set; }
}
