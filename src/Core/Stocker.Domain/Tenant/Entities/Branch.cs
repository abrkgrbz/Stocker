using Stocker.Domain.Common.ValueObjects;
using Stocker.SharedKernel.MultiTenancy;

namespace Stocker.Domain.Tenant.Entities;

public sealed class Branch : TenantEntity
{
    public Guid CompanyId { get; private set; }
    public string Name { get; private set; }
    public string? Code { get; private set; }
    public Address Address { get; private set; }
    public PhoneNumber Phone { get; private set; }
    public Email? Email { get; private set; }
    public bool IsHeadOffice { get; private set; }
    public Guid? ManagerId { get; private set; }
    public bool IsActive { get; private set; }
    public DateTime CreatedAt { get; private set; }

    private Branch() { } // EF Constructor

    public Branch(
        Guid tenantId,
        Guid companyId,
        string name,
        Address address,
        PhoneNumber phone,
        string? code = null,
        Email? email = null,
        bool isHeadOffice = false)
    {
        Id = Guid.NewGuid();
        SetTenantId(tenantId);
        CompanyId = companyId;
        Name = name ?? throw new ArgumentNullException(nameof(name));
        Code = code;
        Address = address ?? throw new ArgumentNullException(nameof(address));
        Phone = phone ?? throw new ArgumentNullException(nameof(phone));
        Email = email;
        IsHeadOffice = isHeadOffice;
        IsActive = true;
        CreatedAt = DateTime.UtcNow;
    }

    public void Update(
        string name,
        Address address,
        PhoneNumber phone,
        string? code = null,
        Email? email = null)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            throw new ArgumentException("Branch name cannot be empty.", nameof(name));
        }

        Name = name;
        Code = code;
        Address = address ?? throw new ArgumentNullException(nameof(address));
        Phone = phone ?? throw new ArgumentNullException(nameof(phone));
        Email = email;
    }

    public void SetAsHeadOffice()
    {
        IsHeadOffice = true;
    }

    public void UnsetAsHeadOffice()
    {
        IsHeadOffice = false;
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