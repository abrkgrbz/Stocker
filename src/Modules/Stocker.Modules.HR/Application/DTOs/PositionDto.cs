namespace Stocker.Modules.HR.Application.DTOs;

/// <summary>
/// Data transfer object for Position entity
/// </summary>
public class PositionDto
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int DepartmentId { get; set; }
    public string? DepartmentName { get; set; }
    public int Level { get; set; }
    public decimal MinSalary { get; set; }
    public decimal MaxSalary { get; set; }
    public string Currency { get; set; } = "TRY";
    public int? HeadCount { get; set; }
    public int FilledPositions { get; set; }
    public int Vacancies { get; set; }
    public string? Requirements { get; set; }
    public string? Responsibilities { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

/// <summary>
/// DTO for position summary in lists
/// </summary>
public class PositionSummaryDto
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? DepartmentName { get; set; }
    public int Level { get; set; }
    public int? HeadCount { get; set; }
    public int FilledPositions { get; set; }
    public bool IsActive { get; set; }
}

/// <summary>
/// DTO for creating a position
/// </summary>
public class CreatePositionDto
{
    public string Code { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int DepartmentId { get; set; }
    public int Level { get; set; }
    public decimal MinSalary { get; set; }
    public decimal MaxSalary { get; set; }
    public string Currency { get; set; } = "TRY";
    public int? HeadCount { get; set; }
    public string? Requirements { get; set; }
    public string? Responsibilities { get; set; }
}

/// <summary>
/// DTO for updating a position
/// </summary>
public class UpdatePositionDto
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int DepartmentId { get; set; }
    public int Level { get; set; }
    public decimal MinSalary { get; set; }
    public decimal MaxSalary { get; set; }
    public string Currency { get; set; } = "TRY";
    public int? HeadCount { get; set; }
    public string? Requirements { get; set; }
    public string? Responsibilities { get; set; }
}
