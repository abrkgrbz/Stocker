using Stocker.SharedKernel.MultiTenancy;

namespace Stocker.Domain.Tenant.Entities;

public sealed class Department : TenantEntity
{
    public Guid CompanyId { get; private set; }
    public string Name { get; private set; }
    public string? Code { get; private set; }
    public string? Description { get; private set; }
    public Guid? ParentDepartmentId { get; private set; }
    public Guid? ManagerId { get; private set; }
    public bool IsActive { get; private set; }
    public DateTime CreatedAt { get; private set; }

    private Department() { } // EF Constructor

    public Department(
        Guid tenantId,
        Guid companyId,
        string name,
        string? code = null,
        string? description = null,
        Guid? parentDepartmentId = null)
    {
        Id = Guid.NewGuid();
        SetTenantId(tenantId);
        CompanyId = companyId;
        Name = name ?? throw new ArgumentNullException(nameof(name));
        Code = code;
        Description = description;
        ParentDepartmentId = parentDepartmentId;
        IsActive = true;
        CreatedAt = DateTime.UtcNow;
    }

    public void Update(string name, string? code, string? description)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            throw new ArgumentException("Department name cannot be empty.", nameof(name));
        }

        Name = name;
        Code = code;
        Description = description;
    }

    public void AssignManager(Guid managerId)
    {
        ManagerId = managerId;
    }

    public void RemoveManager()
    {
        ManagerId = null;
    }

    public void Activate()
    {
        IsActive = true;
    }

    public void Deactivate()
    {
        IsActive = false;
    }
}