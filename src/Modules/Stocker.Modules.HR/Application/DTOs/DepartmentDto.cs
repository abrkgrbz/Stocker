namespace Stocker.Modules.HR.Application.DTOs;

/// <summary>
/// Data transfer object for Department entity
/// </summary>
public class DepartmentDto
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int? ParentDepartmentId { get; set; }
    public string? ParentDepartmentName { get; set; }
    public int? ManagerId { get; set; }
    public string? ManagerName { get; set; }
    public string? CostCenter { get; set; }
    public string? Location { get; set; }
    public int DisplayOrder { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public int EmployeeCount { get; set; }
    public List<DepartmentDto> SubDepartments { get; set; } = new();
}

/// <summary>
/// DTO for creating a department
/// </summary>
public class CreateDepartmentDto
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int? ParentDepartmentId { get; set; }
    public int? ManagerId { get; set; }
    public string? CostCenter { get; set; }
    public string? Location { get; set; }
    public int DisplayOrder { get; set; }
}

/// <summary>
/// DTO for updating a department
/// </summary>
public class UpdateDepartmentDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int? ParentDepartmentId { get; set; }
    public int? ManagerId { get; set; }
    public string? CostCenter { get; set; }
    public string? Location { get; set; }
    public int DisplayOrder { get; set; }
}

/// <summary>
/// DTO for department tree view
/// </summary>
public class DepartmentTreeDto
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public int Level { get; set; }
    public bool HasChildren { get; set; }
    public int EmployeeCount { get; set; }
    public List<DepartmentTreeDto> Children { get; set; } = new();
}
