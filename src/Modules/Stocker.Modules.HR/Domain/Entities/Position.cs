using Stocker.SharedKernel.Common;

namespace Stocker.Modules.HR.Domain.Entities;

public class Position : BaseEntity
{
    public string Code { get; private set; }
    public string Title { get; private set; }
    public string? Description { get; private set; }
    public int DepartmentId { get; private set; }
    public int Level { get; private set; }
    public decimal MinSalary { get; private set; }
    public decimal MaxSalary { get; private set; }
    public bool IsActive { get; private set; }
    
    public virtual ICollection<Employee> Employees { get; private set; }
    
    protected Position() { }
    
    public Position(
        string code,
        string title,
        int departmentId,
        int level,
        decimal minSalary,
        decimal maxSalary)
    {
        Code = code;
        Title = title;
        DepartmentId = departmentId;
        Level = level;
        MinSalary = minSalary;
        MaxSalary = maxSalary;
        IsActive = true;
        Employees = new List<Employee>();
    }
    
    public void UpdatePosition(string title, string? description)
    {
        Title = title;
        Description = description;
    }
    
    public void UpdateSalaryRange(decimal minSalary, decimal maxSalary)
    {
        if (minSalary > maxSalary)
            throw new ArgumentException("Minimum salary cannot be greater than maximum salary");
            
        MinSalary = minSalary;
        MaxSalary = maxSalary;
    }
    
    public void SetLevel(int level)
    {
        Level = level;
    }
    
    public void Activate() => IsActive = true;
    public void Deactivate() => IsActive = false;
}