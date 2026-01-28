using Stocker.SharedKernel.Common;

namespace Stocker.Modules.HR.Domain.Entities;

/// <summary>
/// Departman entity'si - HR modülüne özel genişletilmiş departman bilgileri.
/// TenantDepartmentId üzerinden Tenant.Department ile ilişkilendirilebilir.
/// </summary>
public class Department : BaseEntity
{
    /// <summary>
    /// Tenant domain'deki karşılık gelen Department'ın ID'si.
    /// HR modülü aktif olduğunda, Tenant.Department ile senkronize edilir.
    /// </summary>
    public Guid? TenantDepartmentId { get; private set; }

    public string Code { get; private set; }
    public string Name { get; private set; }
    public string? Description { get; private set; }
    public int? ParentDepartmentId { get; private set; }
    public int? ManagerId { get; private set; }
    public string? CostCenter { get; private set; }
    public string? Location { get; private set; }
    public int DisplayOrder { get; private set; }
    public bool IsActive { get; private set; }

    // Navigation Properties
    public virtual Department? ParentDepartment { get; private set; }
    public virtual Employee? Manager { get; private set; }
    public virtual ICollection<Department> SubDepartments { get; private set; }
    public virtual ICollection<Employee> Employees { get; private set; }
    public virtual ICollection<Position> Positions { get; private set; }

    protected Department()
    {
        Code = string.Empty;
        Name = string.Empty;
        SubDepartments = new List<Department>();
        Employees = new List<Employee>();
        Positions = new List<Position>();
    }

    public Department(
        string code,
        string name,
        string? description = null,
        int? parentDepartmentId = null,
        string? costCenter = null,
        string? location = null,
        int displayOrder = 0,
        Guid? tenantDepartmentId = null)
    {
        Code = code;
        Name = name;
        Description = description;
        ParentDepartmentId = parentDepartmentId;
        CostCenter = costCenter;
        Location = location;
        DisplayOrder = displayOrder;
        TenantDepartmentId = tenantDepartmentId;
        IsActive = true;
        SubDepartments = new List<Department>();
        Employees = new List<Employee>();
        Positions = new List<Position>();
    }

    public void Update(
        string name,
        string? description,
        int? parentDepartmentId,
        string? costCenter,
        string? location,
        int displayOrder)
    {
        Name = name;
        Description = description;
        ParentDepartmentId = parentDepartmentId;
        CostCenter = costCenter;
        Location = location;
        DisplayOrder = displayOrder;
    }

    public void SetManager(int? managerId)
    {
        ManagerId = managerId;
    }

    public void Activate() => IsActive = true;

    public void Deactivate() => IsActive = false;

    /// <summary>
    /// HR Department'ı Tenant Department ile ilişkilendirir.
    /// Bu sayede HR modülü aktifken Tenant.Department ve HR.Department senkronize kalır.
    /// </summary>
    public void LinkToTenantDepartment(Guid tenantDepartmentId)
    {
        TenantDepartmentId = tenantDepartmentId;
    }

    /// <summary>
    /// Tenant Department ilişkisini kaldırır.
    /// </summary>
    public void UnlinkFromTenantDepartment()
    {
        TenantDepartmentId = null;
    }
}
