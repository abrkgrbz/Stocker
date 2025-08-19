using Stocker.Domain.Common.ValueObjects;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Primitives;

namespace Stocker.Domain.Tenant.Entities;

public sealed class Company : TenantAggregateRoot
{
    private readonly List<Department> _departments = new();
    private readonly List<Branch> _branches = new();

    public string Name { get; private set; }
    public string Code { get; private set; }
    public string? LegalName { get; private set; }
    public string? IdentityType { get; private set; } // 'TC' or 'Vergi'
    public string? IdentityNumber { get; private set; } // TC Kimlik No or Vergi No
    public string? TaxNumber { get; private set; }
    public string? TaxOffice { get; private set; }
    public string? TradeRegisterNumber { get; private set; }
    public Email Email { get; private set; }
    public PhoneNumber Phone { get; private set; }
    public PhoneNumber? Fax { get; private set; }
    public Address Address { get; private set; }
    public string? Website { get; private set; }
    public string? LogoUrl { get; private set; }
    public string? Sector { get; private set; }
    public int? EmployeeCount { get; private set; }
    public DateTime FoundedDate { get; private set; }
    public string Currency { get; private set; }
    public string? Timezone { get; private set; }
    public bool IsActive { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }
    public IReadOnlyList<Department> Departments => _departments.AsReadOnly();
    public IReadOnlyList<Branch> Branches => _branches.AsReadOnly();

    private Company() { } // EF Constructor

    private Company(
        Guid tenantId,
        string name,
        string code,
        Email email,
        PhoneNumber phone,
        Address address,
        string currency,
        string? legalName = null,
        string? identityType = null,
        string? identityNumber = null,
        string? taxNumber = null,
        string? taxOffice = null,
        string? tradeRegisterNumber = null,
        PhoneNumber? fax = null,
        string? website = null,
        string? sector = null,
        int? employeeCount = null,
        DateTime? foundedDate = null,
        string? timezone = null)
    {
        Id = Guid.NewGuid();
        SetTenantId(tenantId);
        Name = name;
        Code = code;
        LegalName = legalName;
        IdentityType = identityType;
        IdentityNumber = identityNumber;
        TaxNumber = taxNumber;
        TaxOffice = taxOffice;
        TradeRegisterNumber = tradeRegisterNumber;
        Email = email;
        Phone = phone;
        Fax = fax;
        Address = address;
        Website = website;
        Sector = sector;
        EmployeeCount = employeeCount;
        FoundedDate = foundedDate ?? DateTime.UtcNow;
        Currency = currency;
        Timezone = timezone ?? "UTC";
        IsActive = true;
        CreatedAt = DateTime.UtcNow;
    }

    public static Company Create(
        Guid tenantId,
        string name,
        string code,
        string taxNumber,
        Email email,
        Address address,
        PhoneNumber? phone = null,
        PhoneNumber? fax = null,
        string? identityType = null,
        string? identityNumber = null,
        string? sector = null,
        int? employeeCount = null,
        string? taxOffice = null,
        string? tradeRegisterNumber = null,
        string? website = null)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            throw new ArgumentException("Company name cannot be empty.", nameof(name));
        }

        if (string.IsNullOrWhiteSpace(code))
        {
            throw new ArgumentException("Company code cannot be empty.", nameof(code));
        }

        if (string.IsNullOrWhiteSpace(taxNumber))
        {
            throw new ArgumentException("Tax number cannot be empty.", nameof(taxNumber));
        }

        return new Company(
            tenantId,
            name,
            code,
            email,
            phone ?? PhoneNumber.Create("+90 000 000 0000").Value!, // Default phone if not provided
            address,
            "TRY", // Default currency
            null, // legalName
            identityType,
            identityNumber,
            taxNumber,
            taxOffice,
            tradeRegisterNumber,
            fax,
            website,
            sector,
            employeeCount);
    }

    public void Update(
        string name,
        Email email,
        PhoneNumber phone,
        Address address,
        string? legalName = null,
        string? taxNumber = null,
        string? tradeRegisterNumber = null,
        PhoneNumber? fax = null,
        string? website = null,
        string? sector = null,
        int? employeeCount = null)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            throw new ArgumentException("Company name cannot be empty.", nameof(name));
        }

        Name = name;
        LegalName = legalName;
        TaxNumber = taxNumber;
        TradeRegisterNumber = tradeRegisterNumber;
        Email = email;
        Phone = phone;
        Fax = fax;
        Address = address;
        Website = website;
        Sector = sector;
        EmployeeCount = employeeCount;
        UpdatedAt = DateTime.UtcNow;
    }

    public void UpdateLogo(string? logoUrl)
    {
        LogoUrl = logoUrl;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Activate()
    {
        IsActive = true;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Deactivate()
    {
        IsActive = false;
        UpdatedAt = DateTime.UtcNow;
    }

    public Department AddDepartment(string name, string? code = null, string? description = null, Guid? parentDepartmentId = null)
    {
        if (_departments.Any(d => d.Name.Equals(name, StringComparison.OrdinalIgnoreCase)))
        {
            throw new InvalidOperationException($"Department '{name}' already exists.");
        }

        if (!string.IsNullOrWhiteSpace(code) && _departments.Any(d => d.Code?.Equals(code, StringComparison.OrdinalIgnoreCase) == true))
        {
            throw new InvalidOperationException($"Department code '{code}' already exists.");
        }

        var department = new Department(TenantId, Id, name, code, description, parentDepartmentId);
        _departments.Add(department);
        UpdatedAt = DateTime.UtcNow;

        return department;
    }

    public void RemoveDepartment(Guid departmentId)
    {
        var department = _departments.FirstOrDefault(d => d.Id == departmentId);
        if (department == null)
        {
            throw new InvalidOperationException($"Department with ID '{departmentId}' not found.");
        }

        // Check if any child departments exist
        if (_departments.Any(d => d.ParentDepartmentId == departmentId))
        {
            throw new InvalidOperationException("Cannot remove department with child departments.");
        }

        _departments.Remove(department);
        UpdatedAt = DateTime.UtcNow;
    }

    public Branch AddBranch(
        string name,
        Address address,
        PhoneNumber phone,
        string? code = null,
        Email? email = null,
        bool isHeadOffice = false)
    {
        if (_branches.Any(b => b.Name.Equals(name, StringComparison.OrdinalIgnoreCase)))
        {
            throw new InvalidOperationException($"Branch '{name}' already exists.");
        }

        if (!string.IsNullOrWhiteSpace(code) && _branches.Any(b => b.Code?.Equals(code, StringComparison.OrdinalIgnoreCase) == true))
        {
            throw new InvalidOperationException($"Branch code '{code}' already exists.");
        }

        if (isHeadOffice && _branches.Any(b => b.IsHeadOffice))
        {
            throw new InvalidOperationException("Company already has a head office.");
        }

        var branch = new Branch(TenantId, Id, name, address, phone, code, email, isHeadOffice);
        _branches.Add(branch);
        UpdatedAt = DateTime.UtcNow;

        return branch;
    }

    public void RemoveBranch(Guid branchId)
    {
        var branch = _branches.FirstOrDefault(b => b.Id == branchId);
        if (branch == null)
        {
            throw new InvalidOperationException($"Branch with ID '{branchId}' not found.");
        }

        if (branch.IsHeadOffice)
        {
            throw new InvalidOperationException("Cannot remove head office branch.");
        }

        _branches.Remove(branch);
        UpdatedAt = DateTime.UtcNow;
    }
}