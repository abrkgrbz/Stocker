using Stocker.SharedKernel.MultiTenancy;

namespace Stocker.Modules.CRM.Domain.Entities;

/// <summary>
/// Satış bölgesi entity'si - Coğrafi satış bölgesi yönetimi
/// Territory entity - Geographic sales territory management
/// </summary>
public class Territory : TenantEntity
{
    private readonly List<TerritoryAssignment> _assignments = new();

    #region Temel Bilgiler (Basic Information)

    /// <summary>
    /// Bölge adı / Territory name
    /// </summary>
    public string Name { get; private set; } = string.Empty;

    /// <summary>
    /// Bölge kodu / Territory code
    /// </summary>
    public string Code { get; private set; } = string.Empty;

    /// <summary>
    /// Açıklama / Description
    /// </summary>
    public string? Description { get; private set; }

    /// <summary>
    /// Bölge türü / Territory type
    /// </summary>
    public TerritoryType TerritoryType { get; private set; }

    /// <summary>
    /// Aktif mi? / Is active?
    /// </summary>
    public bool IsActive { get; private set; }

    #endregion

    #region Hiyerarşi Bilgileri (Hierarchy Information)

    /// <summary>
    /// Üst bölge ID / Parent territory ID
    /// </summary>
    public Guid? ParentTerritoryId { get; private set; }

    /// <summary>
    /// Hiyerarşi seviyesi / Hierarchy level
    /// </summary>
    public int HierarchyLevel { get; private set; }

    /// <summary>
    /// Hiyerarşi yolu / Hierarchy path
    /// </summary>
    public string? HierarchyPath { get; private set; }

    #endregion

    #region Coğrafi Bilgiler (Geographic Information)

    /// <summary>
    /// Ülke / Country
    /// </summary>
    public string? Country { get; private set; }

    /// <summary>
    /// Ülke kodu / Country code
    /// </summary>
    public string? CountryCode { get; private set; }

    /// <summary>
    /// Bölge/İl / Region/State
    /// </summary>
    public string? Region { get; private set; }

    /// <summary>
    /// Şehir / City
    /// </summary>
    public string? City { get; private set; }

    /// <summary>
    /// İlçe / District
    /// </summary>
    public string? District { get; private set; }

    /// <summary>
    /// Posta kodu aralığı / Postal code range
    /// </summary>
    public string? PostalCodeRange { get; private set; }

    /// <summary>
    /// Koordinatlar (GeoJSON) / Coordinates
    /// </summary>
    public string? GeoCoordinates { get; private set; }

    #endregion

    #region Hedef Bilgileri (Target Information)

    /// <summary>
    /// Satış hedefi / Sales target
    /// </summary>
    public decimal? SalesTarget { get; private set; }

    /// <summary>
    /// Hedef yılı / Target year
    /// </summary>
    public int? TargetYear { get; private set; }

    /// <summary>
    /// Para birimi / Currency
    /// </summary>
    public string Currency { get; private set; } = "TRY";

    /// <summary>
    /// Potansiyel değer / Potential value
    /// </summary>
    public decimal? PotentialValue { get; private set; }

    #endregion

    #region Atama Bilgileri (Assignment Information)

    /// <summary>
    /// Atanan satış takımı ID / Assigned sales team ID
    /// </summary>
    public Guid? AssignedSalesTeamId { get; private set; }

    /// <summary>
    /// Birincil satış temsilcisi ID / Primary sales rep ID
    /// </summary>
    public int? PrimarySalesRepId { get; private set; }

    /// <summary>
    /// Birincil satış temsilcisi adı / Primary sales rep name
    /// </summary>
    public string? PrimarySalesRepName { get; private set; }

    #endregion

    #region İstatistikler (Statistics)

    /// <summary>
    /// Müşteri sayısı / Customer count
    /// </summary>
    public int CustomerCount { get; private set; }

    /// <summary>
    /// Fırsat sayısı / Opportunity count
    /// </summary>
    public int OpportunityCount { get; private set; }

    /// <summary>
    /// Toplam satış / Total sales
    /// </summary>
    public decimal TotalSales { get; private set; }

    /// <summary>
    /// Son güncelleme / Last updated
    /// </summary>
    public DateTime? StatsUpdatedAt { get; private set; }

    #endregion

    // Navigation
    public virtual Territory? ParentTerritory { get; private set; }
    public virtual SalesTeam? AssignedSalesTeam { get; private set; }
    public IReadOnlyList<TerritoryAssignment> Assignments => _assignments.AsReadOnly();

    protected Territory() : base() { }

    public Territory(
        Guid tenantId,
        string name,
        string code,
        TerritoryType territoryType = TerritoryType.Region) : base(Guid.NewGuid(), tenantId)
    {
        Name = name;
        Code = code;
        TerritoryType = territoryType;
        IsActive = true;
        HierarchyLevel = 1;
        Currency = "TRY";
    }

    public static Territory CreateCountry(Guid tenantId, string name, string code, string countryCode)
    {
        var territory = new Territory(tenantId, name, code, TerritoryType.Country);
        territory.Country = name;
        territory.CountryCode = countryCode;
        return territory;
    }

    public static Territory CreateRegion(Guid tenantId, string name, string code, Guid parentId, string region)
    {
        var territory = new Territory(tenantId, name, code, TerritoryType.Region);
        territory.ParentTerritoryId = parentId;
        territory.Region = region;
        territory.HierarchyLevel = 2;
        return territory;
    }

    public static Territory CreateCity(Guid tenantId, string name, string code, Guid parentId, string city)
    {
        var territory = new Territory(tenantId, name, code, TerritoryType.City);
        territory.ParentTerritoryId = parentId;
        territory.City = city;
        territory.HierarchyLevel = 3;
        return territory;
    }

    public TerritoryAssignment AssignToUser(int userId, string? userName = null, bool isPrimary = false)
    {
        if (_assignments.Any(a => a.UserId == userId && a.IsActive))
            throw new InvalidOperationException("Bu kullanıcı zaten bu bölgeye atanmış.");

        var assignment = new TerritoryAssignment(Id, userId, userName, isPrimary);
        _assignments.Add(assignment);

        if (isPrimary)
        {
            PrimarySalesRepId = userId;
            PrimarySalesRepName = userName;
        }

        return assignment;
    }

    public void RemoveUserAssignment(int userId)
    {
        var assignment = _assignments.FirstOrDefault(a => a.UserId == userId && a.IsActive);
        if (assignment != null)
        {
            assignment.Deactivate();

            if (PrimarySalesRepId == userId)
            {
                PrimarySalesRepId = null;
                PrimarySalesRepName = null;
            }
        }
    }

    public void AssignToSalesTeam(Guid salesTeamId) => AssignedSalesTeamId = salesTeamId;

    public void SetPrimarySalesRep(int userId, string? name = null)
    {
        PrimarySalesRepId = userId;
        PrimarySalesRepName = name;

        // Ensure user is assigned
        var existingAssignment = _assignments.FirstOrDefault(a => a.UserId == userId && a.IsActive);
        if (existingAssignment != null)
        {
            existingAssignment.SetAsPrimary();
        }
        else
        {
            AssignToUser(userId, name, true);
        }
    }

    public void SetParentTerritory(Guid parentId, int hierarchyLevel)
    {
        ParentTerritoryId = parentId;
        HierarchyLevel = hierarchyLevel;
    }

    public void SetGeographicInfo(string? country, string? region, string? city, string? district = null)
    {
        Country = country;
        Region = region;
        City = city;
        District = district;
    }

    public void SetPostalCodeRange(string range) => PostalCodeRange = range;
    public void SetGeoCoordinates(string coordinates) => GeoCoordinates = coordinates;

    public void SetSalesTarget(decimal target, int year)
    {
        SalesTarget = target;
        TargetYear = year;
    }

    public void SetPotentialValue(decimal value) => PotentialValue = value;

    public void UpdateStatistics(int customerCount, int opportunityCount, decimal totalSales)
    {
        CustomerCount = customerCount;
        OpportunityCount = opportunityCount;
        TotalSales = totalSales;
        StatsUpdatedAt = DateTime.UtcNow;
    }

    public void UpdateDetails(string name, string code, string? description = null)
    {
        Name = name;
        Code = code;
        Description = description;
    }

    public void SetHierarchyPath(string path) => HierarchyPath = path;
    public void SetCountryCode(string code) => CountryCode = code;
    public void SetCurrency(string currency) => Currency = currency;

    public void Activate() => IsActive = true;
    public void Deactivate() => IsActive = false;
}

/// <summary>
/// Bölge ataması / Territory assignment
/// </summary>
public class TerritoryAssignment : TenantEntity
{
    public Guid TerritoryId { get; private set; }
    public int UserId { get; private set; }
    public string? UserName { get; private set; }
    public bool IsPrimary { get; private set; }
    public bool IsActive { get; private set; }
    public DateTime AssignedDate { get; private set; }
    public DateTime? EndDate { get; private set; }

    /// <summary>
    /// Atama türü / Assignment type
    /// </summary>
    public TerritoryAssignmentType AssignmentType { get; private set; }

    /// <summary>
    /// Sorumluluk yüzdesi / Responsibility percentage
    /// </summary>
    public decimal? ResponsibilityPercentage { get; private set; }

    public virtual Territory Territory { get; private set; } = null!;

    protected TerritoryAssignment() : base() { }

    public TerritoryAssignment(
        Guid territoryId,
        int userId,
        string? userName = null,
        bool isPrimary = false) : base(Guid.NewGuid(), Guid.Empty)
    {
        TerritoryId = territoryId;
        UserId = userId;
        UserName = userName;
        IsPrimary = isPrimary;
        IsActive = true;
        AssignedDate = DateTime.UtcNow;
        AssignmentType = TerritoryAssignmentType.Primary;
    }

    public void SetAsPrimary() => IsPrimary = true;
    public void RemovePrimary() => IsPrimary = false;
    public void SetAssignmentType(TerritoryAssignmentType type) => AssignmentType = type;
    public void SetResponsibilityPercentage(decimal? percentage) => ResponsibilityPercentage = percentage;

    public void Deactivate()
    {
        IsActive = false;
        EndDate = DateTime.UtcNow;
    }

    public void Reactivate()
    {
        IsActive = true;
        EndDate = null;
    }
}

#region Enums

public enum TerritoryType
{
    /// <summary>Ülke / Country</summary>
    Country = 1,

    /// <summary>Bölge / Region</summary>
    Region = 2,

    /// <summary>Şehir / City</summary>
    City = 3,

    /// <summary>İlçe / District</summary>
    District = 4,

    /// <summary>Posta kodu / Postal code</summary>
    PostalCode = 5,

    /// <summary>Özel / Custom</summary>
    Custom = 6,

    /// <summary>Sektör bazlı / Industry based</summary>
    Industry = 7,

    /// <summary>Müşteri segmenti / Customer segment</summary>
    CustomerSegment = 8
}

public enum TerritoryAssignmentType
{
    /// <summary>Birincil / Primary</summary>
    Primary = 1,

    /// <summary>İkincil / Secondary</summary>
    Secondary = 2,

    /// <summary>Yedek / Backup</summary>
    Backup = 3,

    /// <summary>Geçici / Temporary</summary>
    Temporary = 4
}

#endregion
