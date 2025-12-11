using Stocker.SharedKernel.Common;

namespace Stocker.Modules.Inventory.Domain.Entities;

/// <summary>
/// Raf ömrü yönetimi entity'si - FEFO (First Expired First Out) desteği
/// Shelf Life Management entity - FEFO support
/// Gıda, ilaç ve kozmetik sektörü için kritik
/// Türkiye'de son kullanma tarihi takibi zorunlu ürünler için
/// </summary>
public class ShelfLife : BaseEntity
{
    #region Temel Bilgiler (Basic Information)

    /// <summary>
    /// Ürün ID / Product ID
    /// </summary>
    public int ProductId { get; private set; }

    /// <summary>
    /// Raf ömrü türü / Shelf life type
    /// </summary>
    public ShelfLifeType ShelfLifeType { get; private set; }

    /// <summary>
    /// Toplam raf ömrü (gün) / Total shelf life (days)
    /// </summary>
    public int TotalShelfLifeDays { get; private set; }

    /// <summary>
    /// Aktif mi? / Is active?
    /// </summary>
    public bool IsActive { get; private set; }

    #endregion

    #region Kabul Kuralları (Receiving Rules)

    /// <summary>
    /// Minimum kalan raf ömrü - kabul için (gün) / Min remaining shelf life for receiving (days)
    /// </summary>
    public int MinReceivingShelfLifeDays { get; private set; }

    /// <summary>
    /// Minimum kalan raf ömrü - kabul için (%) / Min remaining shelf life for receiving (%)
    /// </summary>
    public decimal? MinReceivingShelfLifePercent { get; private set; }

    /// <summary>
    /// Kabul kuralı türü / Receiving rule type
    /// </summary>
    public ShelfLifeRuleType ReceivingRuleType { get; private set; }

    #endregion

    #region Satış Kuralları (Sales Rules)

    /// <summary>
    /// Minimum kalan raf ömrü - satış için (gün) / Min remaining shelf life for sales (days)
    /// </summary>
    public int MinSalesShelfLifeDays { get; private set; }

    /// <summary>
    /// Minimum kalan raf ömrü - satış için (%) / Min remaining shelf life for sales (%)
    /// </summary>
    public decimal? MinSalesShelfLifePercent { get; private set; }

    /// <summary>
    /// Satış kuralı türü / Sales rule type
    /// </summary>
    public ShelfLifeRuleType SalesRuleType { get; private set; }

    #endregion

    #region Uyarı Kuralları (Alert Rules)

    /// <summary>
    /// Uyarı eşiği (gün) / Alert threshold (days)
    /// </summary>
    public int AlertThresholdDays { get; private set; }

    /// <summary>
    /// Uyarı eşiği (%) / Alert threshold (%)
    /// </summary>
    public decimal? AlertThresholdPercent { get; private set; }

    /// <summary>
    /// Kritik eşik (gün) / Critical threshold (days)
    /// </summary>
    public int CriticalThresholdDays { get; private set; }

    /// <summary>
    /// Kritik eşik (%) / Critical threshold (%)
    /// </summary>
    public decimal? CriticalThresholdPercent { get; private set; }

    #endregion

    #region Müşteri Bazlı Kurallar (Customer-Specific Rules)

    /// <summary>
    /// Müşteri bazlı kural var mı? / Has customer-specific rules?
    /// </summary>
    public bool HasCustomerSpecificRules { get; private set; }

    /// <summary>
    /// Varsayılan müşteri minimum raf ömrü (gün) / Default customer min shelf life (days)
    /// </summary>
    public int? DefaultCustomerMinShelfLifeDays { get; private set; }

    #endregion

    #region Eylem Kuralları (Action Rules)

    /// <summary>
    /// Süre dolduğunda eylem / Action on expiry
    /// </summary>
    public ExpiryAction ExpiryAction { get; private set; }

    /// <summary>
    /// Otomatik karantinaya al / Auto quarantine
    /// </summary>
    public bool AutoQuarantineOnExpiry { get; private set; }

    /// <summary>
    /// Otomatik fire yap / Auto scrap
    /// </summary>
    public bool AutoScrapOnExpiry { get; private set; }

    /// <summary>
    /// Karantina öncesi uyarı süresi (gün) / Days before quarantine alert
    /// </summary>
    public int? DaysBeforeQuarantineAlert { get; private set; }

    #endregion

    #region Depolama Koşulları (Storage Conditions)

    /// <summary>
    /// Özel depolama gerekli mi? / Requires special storage?
    /// </summary>
    public bool RequiresSpecialStorage { get; private set; }

    /// <summary>
    /// Depolama koşulları notu / Storage conditions note
    /// </summary>
    public string? StorageConditions { get; private set; }

    /// <summary>
    /// Gerekli bölge türü / Required zone type
    /// </summary>
    public ZoneType? RequiredZoneType { get; private set; }

    #endregion

    // Navigation
    public virtual Product Product { get; private set; } = null!;

    protected ShelfLife() { }

    public ShelfLife(int productId, int totalShelfLifeDays, ShelfLifeType shelfLifeType = ShelfLifeType.ExpiryDate)
    {
        ProductId = productId;
        TotalShelfLifeDays = totalShelfLifeDays;
        ShelfLifeType = shelfLifeType;
        IsActive = true;

        // Default values
        MinReceivingShelfLifeDays = totalShelfLifeDays / 2;
        MinSalesShelfLifeDays = totalShelfLifeDays / 4;
        AlertThresholdDays = totalShelfLifeDays / 4;
        CriticalThresholdDays = totalShelfLifeDays / 10;
        ReceivingRuleType = ShelfLifeRuleType.Days;
        SalesRuleType = ShelfLifeRuleType.Days;
        ExpiryAction = ExpiryAction.Quarantine;
        AutoQuarantineOnExpiry = true;
    }

    public static ShelfLife CreateForFood(int productId, int totalDays)
    {
        var shelfLife = new ShelfLife(productId, totalDays, ShelfLifeType.ExpiryDate);
        shelfLife.AutoQuarantineOnExpiry = true;
        shelfLife.AutoScrapOnExpiry = false;
        shelfLife.RequiresSpecialStorage = true;
        return shelfLife;
    }

    public static ShelfLife CreateForPharmaceutical(int productId, int totalDays)
    {
        var shelfLife = new ShelfLife(productId, totalDays, ShelfLifeType.ExpiryDate);
        shelfLife.MinReceivingShelfLifePercent = 75; // En az %75 raf ömrü kalmış olmalı
        shelfLife.MinSalesShelfLifePercent = 50;
        shelfLife.ReceivingRuleType = ShelfLifeRuleType.Percentage;
        shelfLife.SalesRuleType = ShelfLifeRuleType.Percentage;
        shelfLife.AutoQuarantineOnExpiry = true;
        shelfLife.RequiresSpecialStorage = true;
        return shelfLife;
    }

    public void SetReceivingRules(int minDays, decimal? minPercent, ShelfLifeRuleType ruleType)
    {
        MinReceivingShelfLifeDays = minDays;
        MinReceivingShelfLifePercent = minPercent;
        ReceivingRuleType = ruleType;
    }

    public void SetSalesRules(int minDays, decimal? minPercent, ShelfLifeRuleType ruleType)
    {
        MinSalesShelfLifeDays = minDays;
        MinSalesShelfLifePercent = minPercent;
        SalesRuleType = ruleType;
    }

    public void SetAlertThresholds(int alertDays, int criticalDays, decimal? alertPercent = null, decimal? criticalPercent = null)
    {
        AlertThresholdDays = alertDays;
        CriticalThresholdDays = criticalDays;
        AlertThresholdPercent = alertPercent;
        CriticalThresholdPercent = criticalPercent;
    }

    public void SetExpiryAction(ExpiryAction action, bool autoQuarantine, bool autoScrap)
    {
        ExpiryAction = action;
        AutoQuarantineOnExpiry = autoQuarantine;
        AutoScrapOnExpiry = autoScrap;
    }

    public void SetStorageRequirements(bool requiresSpecial, string? conditions, ZoneType? zoneType)
    {
        RequiresSpecialStorage = requiresSpecial;
        StorageConditions = conditions;
        RequiredZoneType = zoneType;
    }

    public void SetCustomerRules(bool hasCustomerRules, int? defaultMinDays)
    {
        HasCustomerSpecificRules = hasCustomerRules;
        DefaultCustomerMinShelfLifeDays = defaultMinDays;
    }

    public void Activate() => IsActive = true;
    public void Deactivate() => IsActive = false;

    /// <summary>
    /// Verilen tarih için kalan raf ömrünü hesaplar / Calculates remaining shelf life
    /// </summary>
    public int CalculateRemainingDays(DateTime expiryDate)
    {
        return (expiryDate.Date - DateTime.UtcNow.Date).Days;
    }

    /// <summary>
    /// Kalan raf ömrü yüzdesini hesaplar / Calculates remaining percentage
    /// </summary>
    public decimal CalculateRemainingPercent(DateTime manufacturingDate, DateTime expiryDate)
    {
        var totalDays = (expiryDate - manufacturingDate).Days;
        if (totalDays <= 0) return 0;

        var remainingDays = (expiryDate.Date - DateTime.UtcNow.Date).Days;
        return Math.Max(0, (remainingDays * 100m) / totalDays);
    }

    /// <summary>
    /// Kabul için uygun mu? / Is acceptable for receiving?
    /// </summary>
    public bool IsAcceptableForReceiving(DateTime expiryDate, DateTime? manufacturingDate = null)
    {
        if (ReceivingRuleType == ShelfLifeRuleType.Days)
        {
            return CalculateRemainingDays(expiryDate) >= MinReceivingShelfLifeDays;
        }
        else if (MinReceivingShelfLifePercent.HasValue && manufacturingDate.HasValue)
        {
            return CalculateRemainingPercent(manufacturingDate.Value, expiryDate) >= MinReceivingShelfLifePercent.Value;
        }
        return true;
    }

    /// <summary>
    /// Satış için uygun mu? / Is acceptable for sales?
    /// </summary>
    public bool IsAcceptableForSales(DateTime expiryDate, DateTime? manufacturingDate = null)
    {
        if (SalesRuleType == ShelfLifeRuleType.Days)
        {
            return CalculateRemainingDays(expiryDate) >= MinSalesShelfLifeDays;
        }
        else if (MinSalesShelfLifePercent.HasValue && manufacturingDate.HasValue)
        {
            return CalculateRemainingPercent(manufacturingDate.Value, expiryDate) >= MinSalesShelfLifePercent.Value;
        }
        return true;
    }
}

/// <summary>
/// Raf ömrü türü / Shelf life type
/// </summary>
public enum ShelfLifeType
{
    /// <summary>Son kullanma tarihi / Expiry date</summary>
    ExpiryDate = 1,

    /// <summary>Tavsiye edilen tüketim tarihi / Best before date</summary>
    BestBefore = 2,

    /// <summary>Üretim tarihi bazlı / Manufacturing date based</summary>
    ManufacturingDateBased = 3,

    /// <summary>Açıldıktan sonra / After opening</summary>
    AfterOpening = 4,

    /// <summary>Kullanıma başladıktan sonra / After first use</summary>
    AfterFirstUse = 5
}

/// <summary>
/// Raf ömrü kural türü / Shelf life rule type
/// </summary>
public enum ShelfLifeRuleType
{
    /// <summary>Gün bazlı / Days based</summary>
    Days = 1,

    /// <summary>Yüzde bazlı / Percentage based</summary>
    Percentage = 2,

    /// <summary>Her ikisi de / Both</summary>
    Both = 3
}

/// <summary>
/// Süre dolduğunda eylem / Action on expiry
/// </summary>
public enum ExpiryAction
{
    /// <summary>Hiçbir şey yapma / No action</summary>
    None = 0,

    /// <summary>Uyar / Alert only</summary>
    AlertOnly = 1,

    /// <summary>Satışı engelle / Block sales</summary>
    BlockSales = 2,

    /// <summary>Karantinaya al / Quarantine</summary>
    Quarantine = 3,

    /// <summary>Fire yap / Scrap</summary>
    Scrap = 4,

    /// <summary>İndirimli satış / Discount sale</summary>
    DiscountSale = 5
}
