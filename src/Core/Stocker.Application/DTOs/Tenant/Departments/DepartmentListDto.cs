namespace Stocker.Application.DTOs.Tenant.Departments;

public class DepartmentListDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Code { get; set; }
    public string? Description { get; set; }
    public Guid? ParentDepartmentId { get; set; }
    public string? ParentDepartmentName { get; set; }
    public bool IsActive { get; set; }
    public int EmployeeCount { get; set; }
}
