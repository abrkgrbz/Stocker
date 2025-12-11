using Stocker.Domain.Common.ValueObjects;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Primitives;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Sales.Domain.Entities;

/// <summary>
/// Satış Bölgesi - Bölgesel satış organizasyonu
/// Sales Territory - Regional sales organization with hierarchy
/// </summary>
public class SalesTerritory : TenantAggregateRoot
{
    private readonly List<TerritoryAssignment> _assignments = new();
    private readonly List<TerritoryCustomer> _customers = new();
    private readonly List<TerritoryPostalCode> _postalCodes = new();
    private readonly List<SalesTerritory> _childTerritories = new();

    public string TerritoryCode { get; private set; } = string.Empty;
    public string Name { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public TerritoryType TerritoryType { get; private set; }
    public Guid? ParentTerritoryId { get; private set; }
    public int HierarchyLevel { get; private set; }
    public string? Country { get; private set; }
    public string? Region { get; private set; }
    public string? City { get; private set; }
    public string? District { get; private set; }
    public string? GeoBoundary { get; private set; }
    public TerritoryStatus Status { get; private set; }
    public Guid? TerritoryManagerId { get; private set; }
    public string? TerritoryManagerName { get; private set; }
    public Guid? DefaultPriceListId { get; private set; }
    public Money? PotentialValue { get; private set; }
    public Money? AnnualTarget { get; private set; }
    public decimal? LastPerformanceScore { get; private set; }
    public DateTime? LastPerformanceDate { get; private set; }
    public string? Notes { get; private set; }

    public IReadOnlyCollection<TerritoryAssignment> Assignments => _assignments.AsReadOnly();
    public IReadOnlyCollection<TerritoryCustomer> Customers => _customers.AsReadOnly();
    public IReadOnlyCollection<TerritoryPostalCode> PostalCodes => _postalCodes.AsReadOnly();
    public IReadOnlyCollection<SalesTerritory> ChildTerritories => _childTerritories.AsReadOnly();

    private SalesTerritory() { }

    public static Result<SalesTerritory> Create(
        Guid tenantId,
        string territoryCode,
        string name,
        TerritoryType territoryType,
        string? description = null,
        Guid? parentTerritoryId = null,
        int hierarchyLevel = 0)
    {
        if (string.IsNullOrWhiteSpace(territoryCode))
            return Result<SalesTerritory>.Failure(Error.Validation("Territory.Code", "Bölge kodu boş olamaz."));

        if (string.IsNullOrWhiteSpace(name))
            return Result<SalesTerritory>.Failure(Error.Validation("Territory.Name", "Bölge adı boş olamaz."));

        var territory = new SalesTerritory();
        territory.Id = Guid.NewGuid();
        territory.SetTenantId(tenantId);
        territory.TerritoryCode = territoryCode.ToUpperInvariant();
        territory.Name = name;
        territory.Description = description;
        territory.TerritoryType = territoryType;
        territory.ParentTerritoryId = parentTerritoryId;
        territory.HierarchyLevel = hierarchyLevel;
        territory.Status = TerritoryStatus.Active;

        return Result<SalesTerritory>.Success(territory);
    }

    public void SetGeographicInfo(string? country, string? region, string? city, string? district)
    {
        Country = country;
        Region = region;
        City = city;
        District = district;
    }

    public void SetGeoBoundary(string geoJson) => GeoBoundary = geoJson;

    public void AssignManager(Guid managerId, string managerName)
    {
        TerritoryManagerId = managerId;
        TerritoryManagerName = managerName;
    }

    public void RemoveManager()
    {
        TerritoryManagerId = null;
        TerritoryManagerName = null;
    }

    public Result<TerritoryAssignment> AssignSalesRepresentative(
        Guid salesRepId, string salesRepName, TerritoryRole role,
        DateTime effectiveFrom, DateTime? effectiveTo = null, decimal? commissionRate = null)
    {
        if (_assignments.Any(a => a.SalesRepresentativeId == salesRepId && a.IsActive && a.Role == role))
            return Result<TerritoryAssignment>.Failure(Error.Conflict("Territory.Assignment", "Bu temsilci için aynı rolde aktif atama mevcut."));

        var assignment = TerritoryAssignment.Create(Id, salesRepId, salesRepName, role, effectiveFrom, effectiveTo, commissionRate);
        if (!assignment.IsSuccess)
            return assignment;

        _assignments.Add(assignment.Value!);
        return assignment;
    }

    public Result RemoveAssignment(Guid assignmentId)
    {
        var assignment = _assignments.FirstOrDefault(a => a.Id == assignmentId);
        if (assignment == null)
            return Result.Failure(Error.NotFound("Territory.Assignment", "Atama bulunamadı."));

        assignment.Deactivate();
        return Result.Success();
    }

    public Result<TerritoryCustomer> AssignCustomer(Guid customerId, string customerName, Guid? primarySalesRepId = null, string? primarySalesRepName = null)
    {
        if (_customers.Any(c => c.CustomerId == customerId && c.IsActive))
            return Result<TerritoryCustomer>.Failure(Error.Conflict("Territory.Customer", "Müşteri zaten bu bölgeye atanmış."));

        var customer = TerritoryCustomer.Create(Id, customerId, customerName, primarySalesRepId, primarySalesRepName);
        if (!customer.IsSuccess)
            return customer;

        _customers.Add(customer.Value!);
        return customer;
    }

    public Result RemoveCustomer(Guid customerId)
    {
        var customer = _customers.FirstOrDefault(c => c.CustomerId == customerId && c.IsActive);
        if (customer == null)
            return Result.Failure(Error.NotFound("Territory.Customer", "Müşteri ataması bulunamadı."));

        customer.Deactivate();
        return Result.Success();
    }

    public Result<TerritoryPostalCode> AddPostalCode(string postalCode, string? areaName = null)
    {
        if (_postalCodes.Any(p => p.PostalCode == postalCode))
            return Result<TerritoryPostalCode>.Failure(Error.Conflict("Territory.PostalCode", "Bu posta kodu zaten eklenmiş."));

        var postal = TerritoryPostalCode.Create(Id, postalCode, areaName);
        if (!postal.IsSuccess)
            return postal;

        _postalCodes.Add(postal.Value!);
        return postal;
    }

    public Result RemovePostalCode(string postalCode)
    {
        var postal = _postalCodes.FirstOrDefault(p => p.PostalCode == postalCode);
        if (postal == null)
            return Result.Failure(Error.NotFound("Territory.PostalCode", "Posta kodu bulunamadı."));

        _postalCodes.Remove(postal);
        return Result.Success();
    }

    public Result<SalesTerritory> AddChildTerritory(string territoryCode, string name, TerritoryType territoryType, string? description = null)
    {
        if (_childTerritories.Any(t => t.TerritoryCode == territoryCode.ToUpperInvariant()))
            return Result<SalesTerritory>.Failure(Error.Conflict("Territory.Child", "Bu kodla alt bölge zaten mevcut."));

        var childResult = Create(TenantId, territoryCode, name, territoryType, description, Id, HierarchyLevel + 1);
        if (!childResult.IsSuccess)
            return childResult;

        var child = childResult.Value!;
        child.Country = Country;
        child.Region = Region;

        _childTerritories.Add(child);
        return Result<SalesTerritory>.Success(child);
    }

    public void UpdatePotentialValue(Money value) => PotentialValue = value;
    public void UpdateAnnualTarget(Money target) => AnnualTarget = target;
    public void SetDefaultPriceList(Guid priceListId) => DefaultPriceListId = priceListId;

    public void RecordPerformanceScore(decimal score)
    {
        if (score < 0 || score > 100)
            throw new ArgumentException("Performans skoru 0-100 arasında olmalıdır.");

        LastPerformanceScore = score;
        LastPerformanceDate = DateTime.UtcNow;
    }

    public void Activate() => Status = TerritoryStatus.Active;
    public void Deactivate() => Status = TerritoryStatus.Inactive;

    public void Suspend(string reason)
    {
        Status = TerritoryStatus.Suspended;
        Notes = $"{Notes}\n[{DateTime.UtcNow:yyyy-MM-dd}] Askıya alma nedeni: {reason}";
    }

    public IEnumerable<TerritoryAssignment> GetActiveAssignments() => _assignments.Where(a => a.IsActive && a.IsEffectiveAt(DateTime.UtcNow));
    public IEnumerable<TerritoryAssignment> GetAssignmentsByRole(TerritoryRole role) => _assignments.Where(a => a.Role == role && a.IsActive && a.IsEffectiveAt(DateTime.UtcNow));
    public IEnumerable<TerritoryCustomer> GetActiveCustomers() => _customers.Where(c => c.IsActive);
    public int GetCustomerCount() => _customers.Count(c => c.IsActive);
    public bool ContainsPostalCode(string postalCode) => _postalCodes.Any(p => p.PostalCode == postalCode);
    public string GetHierarchyPath() => $"{Country ?? ""}/{Region ?? ""}/{City ?? ""}/{Name}".Trim('/');
}

public class TerritoryAssignment : Entity<Guid>
{
    public Guid TerritoryId { get; private set; }
    public Guid SalesRepresentativeId { get; private set; }
    public string SalesRepresentativeName { get; private set; } = string.Empty;
    public TerritoryRole Role { get; private set; }
    public DateTime EffectiveFrom { get; private set; }
    public DateTime? EffectiveTo { get; private set; }
    public decimal? CommissionRate { get; private set; }
    public bool IsActive { get; private set; }

    private TerritoryAssignment() { }

    internal static Result<TerritoryAssignment> Create(
        Guid territoryId, Guid salesRepId, string salesRepName, TerritoryRole role,
        DateTime effectiveFrom, DateTime? effectiveTo, decimal? commissionRate)
    {
        if (effectiveTo.HasValue && effectiveTo.Value < effectiveFrom)
            return Result<TerritoryAssignment>.Failure(Error.Validation("Assignment.EffectiveTo", "Bitiş tarihi başlangıç tarihinden önce olamaz."));

        if (commissionRate.HasValue && (commissionRate < 0 || commissionRate > 100))
            return Result<TerritoryAssignment>.Failure(Error.Validation("Assignment.Commission", "Komisyon oranı 0-100 arasında olmalıdır."));

        var assignment = new TerritoryAssignment
        {
            Id = Guid.NewGuid(),
            TerritoryId = territoryId,
            SalesRepresentativeId = salesRepId,
            SalesRepresentativeName = salesRepName,
            Role = role,
            EffectiveFrom = effectiveFrom,
            EffectiveTo = effectiveTo,
            CommissionRate = commissionRate,
            IsActive = true
        };

        return Result<TerritoryAssignment>.Success(assignment);
    }

    public bool IsEffectiveAt(DateTime date) => date >= EffectiveFrom && (!EffectiveTo.HasValue || date <= EffectiveTo.Value);

    public void Deactivate()
    {
        IsActive = false;
        EffectiveTo = DateTime.UtcNow;
    }

    public void UpdateCommissionRate(decimal rate)
    {
        if (rate < 0 || rate > 100)
            throw new ArgumentException("Komisyon oranı 0-100 arasında olmalıdır.");
        CommissionRate = rate;
    }
}

public class TerritoryCustomer : Entity<Guid>
{
    public Guid TerritoryId { get; private set; }
    public Guid CustomerId { get; private set; }
    public string CustomerName { get; private set; } = string.Empty;
    public Guid? PrimarySalesRepresentativeId { get; private set; }
    public string? PrimarySalesRepresentativeName { get; private set; }
    public DateTime AssignedAt { get; private set; }
    public bool IsActive { get; private set; }

    private TerritoryCustomer() { }

    internal static Result<TerritoryCustomer> Create(Guid territoryId, Guid customerId, string customerName, Guid? primarySalesRepId, string? primarySalesRepName)
    {
        if (string.IsNullOrWhiteSpace(customerName))
            return Result<TerritoryCustomer>.Failure(Error.Validation("TerritoryCustomer.Name", "Müşteri adı boş olamaz."));

        var customer = new TerritoryCustomer
        {
            Id = Guid.NewGuid(),
            TerritoryId = territoryId,
            CustomerId = customerId,
            CustomerName = customerName,
            PrimarySalesRepresentativeId = primarySalesRepId,
            PrimarySalesRepresentativeName = primarySalesRepName,
            AssignedAt = DateTime.UtcNow,
            IsActive = true
        };

        return Result<TerritoryCustomer>.Success(customer);
    }

    public void AssignPrimarySalesRep(Guid salesRepId, string salesRepName)
    {
        PrimarySalesRepresentativeId = salesRepId;
        PrimarySalesRepresentativeName = salesRepName;
    }

    public void Deactivate() => IsActive = false;
    public void Activate() => IsActive = true;
}

public class TerritoryPostalCode : Entity<Guid>
{
    public Guid TerritoryId { get; private set; }
    public string PostalCode { get; private set; } = string.Empty;
    public string? AreaName { get; private set; }

    private TerritoryPostalCode() { }

    internal static Result<TerritoryPostalCode> Create(Guid territoryId, string postalCode, string? areaName)
    {
        if (string.IsNullOrWhiteSpace(postalCode))
            return Result<TerritoryPostalCode>.Failure(Error.Validation("PostalCode.Code", "Posta kodu boş olamaz."));

        var postal = new TerritoryPostalCode
        {
            Id = Guid.NewGuid(),
            TerritoryId = territoryId,
            PostalCode = postalCode.Trim(),
            AreaName = areaName
        };

        return Result<TerritoryPostalCode>.Success(postal);
    }
}

public enum TerritoryType { Country = 1, Region = 2, Province = 3, District = 4, FreeZone = 5, SpecialZone = 6, CustomerSegment = 7, Channel = 8 }
public enum TerritoryStatus { Active = 1, Inactive = 2, Suspended = 3, Planned = 4, Merged = 5 }
public enum TerritoryRole { Manager = 1, SalesRepresentative = 2, SeniorSalesRep = 3, SalesSpecialist = 4, TechnicalSales = 5, AccountManager = 6, Support = 7, Trainee = 8 }
