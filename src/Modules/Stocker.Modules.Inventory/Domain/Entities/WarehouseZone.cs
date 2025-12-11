using Stocker.SharedKernel.Common;

namespace Stocker.Modules.Inventory.Domain.Entities;

/// <summary>
/// Depo bölgesi entity'si - Soğuk, kuru, tehlikeli madde alanları
/// Warehouse Zone entity - Cold storage, dry storage, hazardous areas
/// Türkiye'de gıda, ilaç ve tehlikeli madde mevzuatına uygun
/// </summary>
public class WarehouseZone : BaseEntity
{
    private readonly List<Location> _locations = new();

    #region Temel Bilgiler (Basic Information)

    /// <summary>
    /// Depo ID / Warehouse ID
    /// </summary>
    public int WarehouseId { get; private set; }

    /// <summary>
    /// Bölge kodu / Zone code
    /// </summary>
    public string Code { get; private set; } = string.Empty;

    /// <summary>
    /// Bölge adı / Zone name
    /// </summary>
    public string Name { get; private set; } = string.Empty;

    /// <summary>
    /// Açıklama / Description
    /// </summary>
    public string? Description { get; private set; }

    /// <summary>
    /// Bölge türü / Zone type
    /// </summary>
    public ZoneType ZoneType { get; private set; }

    /// <summary>
    /// Aktif mi? / Is active?
    /// </summary>
    public bool IsActive { get; private set; }

    #endregion

    #region Sıcaklık Kontrolü (Temperature Control)

    /// <summary>
    /// Sıcaklık kontrollü mü? / Is temperature controlled?
    /// </summary>
    public bool IsTemperatureControlled { get; private set; }

    /// <summary>
    /// Minimum sıcaklık (°C) / Minimum temperature
    /// </summary>
    public decimal? MinTemperature { get; private set; }

    /// <summary>
    /// Maksimum sıcaklık (°C) / Maximum temperature
    /// </summary>
    public decimal? MaxTemperature { get; private set; }

    /// <summary>
    /// Hedef sıcaklık (°C) / Target temperature
    /// </summary>
    public decimal? TargetTemperature { get; private set; }

    /// <summary>
    /// Sıcaklık izleme gerekli mi? / Is temperature monitoring required?
    /// </summary>
    public bool RequiresTemperatureMonitoring { get; private set; }

    #endregion

    #region Nem Kontrolü (Humidity Control)

    /// <summary>
    /// Nem kontrollü mü? / Is humidity controlled?
    /// </summary>
    public bool IsHumidityControlled { get; private set; }

    /// <summary>
    /// Minimum nem (%) / Minimum humidity
    /// </summary>
    public decimal? MinHumidity { get; private set; }

    /// <summary>
    /// Maksimum nem (%) / Maximum humidity
    /// </summary>
    public decimal? MaxHumidity { get; private set; }

    #endregion

    #region Güvenlik ve Tehlike (Safety and Hazard)

    /// <summary>
    /// Tehlikeli madde bölgesi mi? / Is hazardous material zone?
    /// </summary>
    public bool IsHazardous { get; private set; }

    /// <summary>
    /// Tehlike sınıfı / Hazard class
    /// </summary>
    public string? HazardClass { get; private set; }

    /// <summary>
    /// UN numarası / UN number
    /// </summary>
    public string? UnNumber { get; private set; }

    /// <summary>
    /// Özel erişim gerekli mi? / Requires special access?
    /// </summary>
    public bool RequiresSpecialAccess { get; private set; }

    /// <summary>
    /// Erişim seviyesi / Access level
    /// </summary>
    public int? AccessLevel { get; private set; }

    #endregion

    #region Kapasite Bilgileri (Capacity Information)

    /// <summary>
    /// Toplam alan (m²) / Total area (m²)
    /// </summary>
    public decimal? TotalArea { get; private set; }

    /// <summary>
    /// Kullanılabilir alan (m²) / Usable area (m²)
    /// </summary>
    public decimal? UsableArea { get; private set; }

    /// <summary>
    /// Maksimum palet kapasitesi / Maximum pallet capacity
    /// </summary>
    public int? MaxPalletCapacity { get; private set; }

    /// <summary>
    /// Maksimum yükseklik (m) / Maximum height (m)
    /// </summary>
    public decimal? MaxHeight { get; private set; }

    /// <summary>
    /// Maksimum ağırlık (kg/m²) / Max weight per area
    /// </summary>
    public decimal? MaxWeightPerArea { get; private set; }

    #endregion

    #region Operasyon Bilgileri (Operation Information)

    /// <summary>
    /// Öncelik sırası / Priority order
    /// </summary>
    public int Priority { get; private set; }

    /// <summary>
    /// Varsayılan toplama bölgesi mi? / Is default picking zone?
    /// </summary>
    public bool IsDefaultPickingZone { get; private set; }

    /// <summary>
    /// Varsayılan yerleştirme bölgesi mi? / Is default putaway zone?
    /// </summary>
    public bool IsDefaultPutawayZone { get; private set; }

    /// <summary>
    /// Karantina bölgesi mi? / Is quarantine zone?
    /// </summary>
    public bool IsQuarantineZone { get; private set; }

    /// <summary>
    /// İade bölgesi mi? / Is returns zone?
    /// </summary>
    public bool IsReturnsZone { get; private set; }

    #endregion

    // Navigation
    public virtual Warehouse Warehouse { get; private set; } = null!;
    public IReadOnlyList<Location> Locations => _locations.AsReadOnly();

    protected WarehouseZone() { }

    public WarehouseZone(int warehouseId, string code, string name, ZoneType zoneType)
    {
        WarehouseId = warehouseId;
        Code = code;
        Name = name;
        ZoneType = zoneType;
        IsActive = true;
        Priority = 0;
    }

    public static WarehouseZone CreateColdStorage(int warehouseId, string code, string name, decimal minTemp, decimal maxTemp)
    {
        var zone = new WarehouseZone(warehouseId, code, name, ZoneType.ColdStorage);
        zone.IsTemperatureControlled = true;
        zone.MinTemperature = minTemp;
        zone.MaxTemperature = maxTemp;
        zone.TargetTemperature = (minTemp + maxTemp) / 2;
        zone.RequiresTemperatureMonitoring = true;
        return zone;
    }

    public static WarehouseZone CreateFreezer(int warehouseId, string code, string name)
    {
        var zone = new WarehouseZone(warehouseId, code, name, ZoneType.Freezer);
        zone.IsTemperatureControlled = true;
        zone.MinTemperature = -25;
        zone.MaxTemperature = -18;
        zone.TargetTemperature = -20;
        zone.RequiresTemperatureMonitoring = true;
        return zone;
    }

    public static WarehouseZone CreateHazardous(int warehouseId, string code, string name, string hazardClass)
    {
        var zone = new WarehouseZone(warehouseId, code, name, ZoneType.Hazardous);
        zone.IsHazardous = true;
        zone.HazardClass = hazardClass;
        zone.RequiresSpecialAccess = true;
        zone.AccessLevel = 3;
        return zone;
    }

    public static WarehouseZone CreateQuarantine(int warehouseId, string code, string name)
    {
        var zone = new WarehouseZone(warehouseId, code, name, ZoneType.Quarantine);
        zone.IsQuarantineZone = true;
        zone.RequiresSpecialAccess = true;
        return zone;
    }

    public void SetTemperatureControl(decimal? min, decimal? max, decimal? target, bool requiresMonitoring)
    {
        IsTemperatureControlled = min.HasValue || max.HasValue;
        MinTemperature = min;
        MaxTemperature = max;
        TargetTemperature = target;
        RequiresTemperatureMonitoring = requiresMonitoring;
    }

    public void SetHumidityControl(decimal? min, decimal? max)
    {
        IsHumidityControlled = min.HasValue || max.HasValue;
        MinHumidity = min;
        MaxHumidity = max;
    }

    public void SetHazardInfo(bool isHazardous, string? hazardClass, string? unNumber)
    {
        IsHazardous = isHazardous;
        HazardClass = hazardClass;
        UnNumber = unNumber;
    }

    public void SetAccessControl(bool requiresSpecialAccess, int? accessLevel)
    {
        RequiresSpecialAccess = requiresSpecialAccess;
        AccessLevel = accessLevel;
    }

    public void SetCapacity(decimal? totalArea, decimal? usableArea, int? maxPallets, decimal? maxHeight)
    {
        TotalArea = totalArea;
        UsableArea = usableArea;
        MaxPalletCapacity = maxPallets;
        MaxHeight = maxHeight;
    }

    public void SetOperationFlags(bool isPickingZone, bool isPutawayZone, bool isQuarantine, bool isReturns)
    {
        IsDefaultPickingZone = isPickingZone;
        IsDefaultPutawayZone = isPutawayZone;
        IsQuarantineZone = isQuarantine;
        IsReturnsZone = isReturns;
    }

    public void SetPriority(int priority) => Priority = priority;
    public void SetDescription(string? description) => Description = description;
    public void Activate() => IsActive = true;
    public void Deactivate() => IsActive = false;
}

/// <summary>
/// Bölge türü / Zone type
/// </summary>
public enum ZoneType
{
    /// <summary>Genel depolama / General storage</summary>
    General = 1,

    /// <summary>Soğuk hava deposu / Cold storage</summary>
    ColdStorage = 2,

    /// <summary>Dondurucu / Freezer</summary>
    Freezer = 3,

    /// <summary>Kuru depo / Dry storage</summary>
    DryStorage = 4,

    /// <summary>Tehlikeli madde / Hazardous material</summary>
    Hazardous = 5,

    /// <summary>Karantina / Quarantine</summary>
    Quarantine = 6,

    /// <summary>İade / Returns</summary>
    Returns = 7,

    /// <summary>Toplama / Picking</summary>
    Picking = 8,

    /// <summary>Sevkiyat / Shipping</summary>
    Shipping = 9,

    /// <summary>Teslim alma / Receiving</summary>
    Receiving = 10,

    /// <summary>Çapraz sevkiyat / Cross-docking</summary>
    CrossDocking = 11,

    /// <summary>Değerli eşya / High value</summary>
    HighValue = 12,

    /// <summary>Büyük hacimli / Bulk storage</summary>
    Bulk = 13,

    /// <summary>Diğer / Other</summary>
    Other = 99
}
