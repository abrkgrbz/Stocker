using Stocker.SharedKernel.Common;

namespace Stocker.Modules.HR.Domain.Entities;

/// <summary>
/// Pozisyon entity'si
/// </summary>
public class Position : BaseEntity
{
    public string Code { get; private set; }
    public string Title { get; private set; }
    public string? Description { get; private set; }
    public int DepartmentId { get; private set; }
    public int Level { get; private set; }
    public decimal MinSalary { get; private set; }
    public decimal MaxSalary { get; private set; }
    public string Currency { get; private set; }
    public int? HeadCount { get; private set; }
    public string? Requirements { get; private set; }
    public string? Responsibilities { get; private set; }
    public bool IsActive { get; private set; }

    // Navigation Properties
    public virtual Department Department { get; private set; } = null!;
    public virtual ICollection<Employee> Employees { get; private set; }

    protected Position()
    {
        Code = string.Empty;
        Title = string.Empty;
        Currency = "TRY";
        Employees = new List<Employee>();
    }

    public Position(
        string code,
        string title,
        int departmentId,
        int level,
        decimal minSalary,
        decimal maxSalary,
        string currency = "TRY",
        string? description = null,
        int? headCount = null)
    {
        Code = code;
        Title = title;
        DepartmentId = departmentId;
        Level = level;
        MinSalary = minSalary;
        MaxSalary = maxSalary;
        Currency = currency;
        Description = description;
        HeadCount = headCount;
        IsActive = true;
        Employees = new List<Employee>();
    }

    public void Update(
        string title,
        string? description,
        int level,
        int? headCount,
        string? requirements,
        string? responsibilities)
    {
        Title = title;
        Description = description;
        Level = level;
        HeadCount = headCount;
        Requirements = requirements;
        Responsibilities = responsibilities;
    }

    public void UpdateSalaryRange(decimal minSalary, decimal maxSalary, string currency)
    {
        if (minSalary > maxSalary)
            throw new ArgumentException("Minimum salary cannot be greater than maximum salary");

        MinSalary = minSalary;
        MaxSalary = maxSalary;
        Currency = currency;
    }

    public void SetDepartment(int departmentId)
    {
        DepartmentId = departmentId;
    }

    public void Activate() => IsActive = true;

    public void Deactivate() => IsActive = false;

    public int GetFilledPositions() => Employees.Count(e => e.Status == Enums.EmployeeStatus.Active);

    public int GetVacancies() => (HeadCount ?? 0) - GetFilledPositions();
}
