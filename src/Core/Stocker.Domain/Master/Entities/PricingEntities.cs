using Stocker.Domain.Common.ValueObjects;
using Stocker.Domain.Master.Enums;
using Stocker.SharedKernel.Primitives;

namespace Stocker.Domain.Master.Entities;

#region Module Pricing

/// <summary>
/// Tekil modül fiyatlandırması - À la carte modül satışı için
/// </summary>
public sealed class ModulePricing : AggregateRoot
{
    public string ModuleCode { get; private set; }       // "Inventory", "Sales" vb.
    public string ModuleName { get; private set; }       // Görüntü adı
    public string? Description { get; private set; }     // Modül açıklaması
    public string? Icon { get; private set; }            // UI ikonu (heroicon adı)
    public Money MonthlyPrice { get; private set; }      // Aylık fiyat
    public Money YearlyPrice { get; private set; }       // Yıllık fiyat (genelde %20 indirimli)
    public bool IsCore { get; private set; }             // Zorunlu modül mü (CMS gibi, her pakette dahil)
    public bool IsActive { get; private set; }           // Satışa açık mı
    public int? TrialDays { get; private set; }          // Deneme süresi (gün)
    public int DisplayOrder { get; private set; }        // UI sıralama
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }

    // Modüle dahil özellikler (JSON olarak saklanabilir)
    public string? IncludedFeaturesJson { get; private set; }

    private ModulePricing() { } // EF Constructor

    private ModulePricing(
        string moduleCode,
        string moduleName,
        Money monthlyPrice,
        Money yearlyPrice,
        string? description = null,
        string? icon = null,
        bool isCore = false,
        int? trialDays = null,
        int displayOrder = 0)
    {
        Id = Guid.NewGuid();
        ModuleCode = moduleCode;
        ModuleName = moduleName;
        Description = description;
        Icon = icon;
        MonthlyPrice = monthlyPrice;
        YearlyPrice = yearlyPrice;
        IsCore = isCore;
        IsActive = true;
        TrialDays = trialDays;
        DisplayOrder = displayOrder;
        CreatedAt = DateTime.UtcNow;
    }

    public static ModulePricing Create(
        string moduleCode,
        string moduleName,
        Money monthlyPrice,
        Money yearlyPrice,
        string? description = null,
        string? icon = null,
        bool isCore = false,
        int? trialDays = null,
        int displayOrder = 0)
    {
        if (string.IsNullOrWhiteSpace(moduleCode))
            throw new ArgumentException("Module code cannot be empty.", nameof(moduleCode));

        if (string.IsNullOrWhiteSpace(moduleName))
            throw new ArgumentException("Module name cannot be empty.", nameof(moduleName));

        return new ModulePricing(moduleCode, moduleName, monthlyPrice, yearlyPrice, description, icon, isCore, trialDays, displayOrder);
    }

    public void Update(
        string moduleName,
        Money monthlyPrice,
        Money yearlyPrice,
        string? description = null,
        string? icon = null,
        int? trialDays = null,
        int displayOrder = 0)
    {
        ModuleName = moduleName;
        MonthlyPrice = monthlyPrice;
        YearlyPrice = yearlyPrice;
        Description = description;
        Icon = icon;
        TrialDays = trialDays;
        DisplayOrder = displayOrder;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetIncludedFeatures(string[] features)
    {
        IncludedFeaturesJson = System.Text.Json.JsonSerializer.Serialize(features);
        UpdatedAt = DateTime.UtcNow;
    }

    public string[] GetIncludedFeatures()
    {
        if (string.IsNullOrEmpty(IncludedFeaturesJson))
            return Array.Empty<string>();

        return System.Text.Json.JsonSerializer.Deserialize<string[]>(IncludedFeaturesJson) ?? Array.Empty<string>();
    }

    public Money GetPriceForCycle(BillingCycle cycle) => cycle == BillingCycle.Yillik ? YearlyPrice : MonthlyPrice;

    public void Activate() { IsActive = true; UpdatedAt = DateTime.UtcNow; }
    public void Deactivate() { IsActive = false; UpdatedAt = DateTime.UtcNow; }
}

#endregion

#region Module Bundle

/// <summary>
/// Modül paketi - Birden fazla modülün indirimli satışı için
/// Örnek: "Satış Paketi" = Sales + CRM + Finance
/// </summary>
public sealed class ModuleBundle : AggregateRoot
{
    public string BundleCode { get; private set; }       // "SALES_BUNDLE", "MANUFACTURING_BUNDLE"
    public string BundleName { get; private set; }       // "Satış Paketi"
    public string? Description { get; private set; }
    public string? Icon { get; private set; }
    public Money MonthlyPrice { get; private set; }      // Bundle aylık fiyatı (indirimli)
    public Money YearlyPrice { get; private set; }       // Bundle yıllık fiyatı
    public decimal DiscountPercent { get; private set; } // Tek tek almaya göre indirim yüzdesi
    public bool IsActive { get; private set; }
    public int DisplayOrder { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }

    private readonly List<ModuleBundleItem> _modules = new();
    public IReadOnlyList<ModuleBundleItem> Modules => _modules.AsReadOnly();

    private ModuleBundle() { } // EF Constructor

    private ModuleBundle(
        string bundleCode,
        string bundleName,
        Money monthlyPrice,
        Money yearlyPrice,
        decimal discountPercent,
        string? description = null,
        string? icon = null,
        int displayOrder = 0)
    {
        Id = Guid.NewGuid();
        BundleCode = bundleCode;
        BundleName = bundleName;
        Description = description;
        Icon = icon;
        MonthlyPrice = monthlyPrice;
        YearlyPrice = yearlyPrice;
        DiscountPercent = discountPercent;
        IsActive = true;
        DisplayOrder = displayOrder;
        CreatedAt = DateTime.UtcNow;
    }

    public static ModuleBundle Create(
        string bundleCode,
        string bundleName,
        Money monthlyPrice,
        Money yearlyPrice,
        decimal discountPercent = 0,
        string? description = null,
        string? icon = null,
        int displayOrder = 0)
    {
        if (string.IsNullOrWhiteSpace(bundleCode))
            throw new ArgumentException("Bundle code cannot be empty.", nameof(bundleCode));

        if (string.IsNullOrWhiteSpace(bundleName))
            throw new ArgumentException("Bundle name cannot be empty.", nameof(bundleName));

        if (discountPercent < 0 || discountPercent > 100)
            throw new ArgumentException("Discount percent must be between 0 and 100.", nameof(discountPercent));

        return new ModuleBundle(bundleCode, bundleName, monthlyPrice, yearlyPrice, discountPercent, description, icon, displayOrder);
    }

    public void Update(
        string bundleName,
        Money monthlyPrice,
        Money yearlyPrice,
        decimal discountPercent,
        string? description = null,
        string? icon = null,
        int displayOrder = 0)
    {
        BundleName = bundleName;
        MonthlyPrice = monthlyPrice;
        YearlyPrice = yearlyPrice;
        DiscountPercent = discountPercent;
        Description = description;
        Icon = icon;
        DisplayOrder = displayOrder;
        UpdatedAt = DateTime.UtcNow;
    }

    public void AddModule(string moduleCode)
    {
        if (_modules.Any(m => m.ModuleCode == moduleCode))
            throw new InvalidOperationException($"Module '{moduleCode}' already exists in this bundle.");

        _modules.Add(new ModuleBundleItem(Id, moduleCode));
        UpdatedAt = DateTime.UtcNow;
    }

    public void RemoveModule(string moduleCode)
    {
        var module = _modules.FirstOrDefault(m => m.ModuleCode == moduleCode);
        if (module == null)
            throw new InvalidOperationException($"Module '{moduleCode}' not found in this bundle.");

        _modules.Remove(module);
        UpdatedAt = DateTime.UtcNow;
    }

    public bool HasModule(string moduleCode) => _modules.Any(m => m.ModuleCode == moduleCode);

    public Money GetPriceForCycle(BillingCycle cycle) => cycle == BillingCycle.Yillik ? YearlyPrice : MonthlyPrice;

    public void Activate() { IsActive = true; UpdatedAt = DateTime.UtcNow; }
    public void Deactivate() { IsActive = false; UpdatedAt = DateTime.UtcNow; }
}

/// <summary>
/// Bundle içindeki modül referansı
/// </summary>
public sealed class ModuleBundleItem : Entity
{
    public Guid ModuleBundleId { get; private set; }
    public string ModuleCode { get; private set; }

    private ModuleBundleItem() { } // EF Constructor

    public ModuleBundleItem(Guid moduleBundleId, string moduleCode)
    {
        Id = Guid.NewGuid();
        ModuleBundleId = moduleBundleId;
        ModuleCode = moduleCode;
    }
}

#endregion

#region Subscription AddOn

/// <summary>
/// Aboneliğe bağlı add-on kayıtları
/// Bir subscription'ın hangi add-on'lara sahip olduğunu takip eder
/// </summary>
public sealed class SubscriptionAddOn : Entity
{
    public Guid SubscriptionId { get; private set; }
    public Guid AddOnId { get; private set; }
    public string AddOnCode { get; private set; }
    public string AddOnName { get; private set; }
    public Money Price { get; private set; }             // Satın alma anındaki fiyat
    public int Quantity { get; private set; }            // Miktar (ör: 3 adet ek depolama)
    public DateTime AddedAt { get; private set; }
    public DateTime? ExpiresAt { get; private set; }     // Bitiş tarihi (null = süresiz)
    public bool IsActive { get; private set; }
    public string? CancellationReason { get; private set; }
    public DateTime? CancelledAt { get; private set; }

    // Navigation
    public Subscription? Subscription { get; private set; }
    public AddOn? AddOn { get; private set; }

    private SubscriptionAddOn() { } // EF Constructor

    public SubscriptionAddOn(
        Guid subscriptionId,
        Guid addOnId,
        string addOnCode,
        string addOnName,
        Money price,
        int quantity = 1,
        DateTime? expiresAt = null)
    {
        Id = Guid.NewGuid();
        SubscriptionId = subscriptionId;
        AddOnId = addOnId;
        AddOnCode = addOnCode;
        AddOnName = addOnName;
        Price = price;
        Quantity = quantity;
        AddedAt = DateTime.UtcNow;
        ExpiresAt = expiresAt;
        IsActive = true;
    }

    public void UpdateQuantity(int quantity)
    {
        if (quantity < 1)
            throw new ArgumentException("Quantity must be at least 1.", nameof(quantity));

        Quantity = quantity;
    }

    public void Extend(DateTime newExpiresAt)
    {
        if (newExpiresAt <= DateTime.UtcNow)
            throw new ArgumentException("New expiration date must be in the future.", nameof(newExpiresAt));

        ExpiresAt = newExpiresAt;
    }

    public void Cancel(string? reason = null)
    {
        IsActive = false;
        CancelledAt = DateTime.UtcNow;
        CancellationReason = reason;
    }

    public void Reactivate()
    {
        IsActive = true;
        CancelledAt = null;
        CancellationReason = null;
    }

    public bool IsExpired => ExpiresAt.HasValue && ExpiresAt.Value < DateTime.UtcNow;
}

#endregion

/// <summary>
/// Ek ozellikler (Add-ons) - API erişimi, öncelikli destek vb.
/// </summary>
public sealed class AddOn : AggregateRoot
{
    public string Code { get; private set; }
    public string Name { get; private set; }
    public string? Description { get; private set; }
    public string? Icon { get; private set; }
    public AddOnType Type { get; private set; }          // Feature, Storage, Users, API, Integration, Support
    public Money MonthlyPrice { get; private set; }
    public Money? YearlyPrice { get; private set; }      // Yıllık fiyat (opsiyonel, indirimli)
    public bool IsActive { get; private set; }
    public int DisplayOrder { get; private set; }
    public string? Category { get; private set; }        // Destek, Entegrasyon, Güvenlik vb.
    public string? RequiredModuleCode { get; private set; } // Hangi modüle bağlı (opsiyonel)
    public int? Quantity { get; private set; }           // Miktar (50GB storage, 10 kullanıcı vb.)
    public string? QuantityUnit { get; private set; }    // Birim (GB, kullanıcı, vb.)
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }

    // Add-on özellikleri
    private readonly List<AddOnFeature> _features = new();
    public IReadOnlyList<AddOnFeature> Features => _features.AsReadOnly();

    private AddOn() { } // EF Constructor

    private AddOn(
        string code,
        string name,
        AddOnType type,
        Money monthlyPrice,
        Money? yearlyPrice = null,
        string? description = null,
        string? icon = null,
        int displayOrder = 0,
        string? category = null,
        string? requiredModuleCode = null,
        int? quantity = null,
        string? quantityUnit = null)
    {
        Id = Guid.NewGuid();
        Code = code;
        Name = name;
        Type = type;
        Description = description;
        Icon = icon;
        MonthlyPrice = monthlyPrice;
        YearlyPrice = yearlyPrice;
        IsActive = true;
        DisplayOrder = displayOrder;
        Category = category;
        RequiredModuleCode = requiredModuleCode;
        Quantity = quantity;
        QuantityUnit = quantityUnit;
        CreatedAt = DateTime.UtcNow;
    }

    public static AddOn Create(
        string code,
        string name,
        AddOnType type,
        Money monthlyPrice,
        Money? yearlyPrice = null,
        string? description = null,
        string? icon = null,
        int displayOrder = 0,
        string? category = null,
        string? requiredModuleCode = null,
        int? quantity = null,
        string? quantityUnit = null)
    {
        if (string.IsNullOrWhiteSpace(code))
            throw new ArgumentException("AddOn code cannot be empty.", nameof(code));

        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("AddOn name cannot be empty.", nameof(name));

        return new AddOn(code, name, type, monthlyPrice, yearlyPrice, description, icon, displayOrder, category, requiredModuleCode, quantity, quantityUnit);
    }

    public void Update(
        string name,
        AddOnType type,
        Money monthlyPrice,
        Money? yearlyPrice = null,
        string? description = null,
        string? icon = null,
        int displayOrder = 0,
        string? category = null,
        string? requiredModuleCode = null,
        int? quantity = null,
        string? quantityUnit = null)
    {
        Name = name;
        Type = type;
        MonthlyPrice = monthlyPrice;
        YearlyPrice = yearlyPrice;
        Description = description;
        Icon = icon;
        DisplayOrder = displayOrder;
        Category = category;
        RequiredModuleCode = requiredModuleCode;
        Quantity = quantity;
        QuantityUnit = quantityUnit;
        UpdatedAt = DateTime.UtcNow;
    }

    public Money GetPriceForCycle(BillingCycle cycle) =>
        cycle == BillingCycle.Yillik && YearlyPrice != null ? YearlyPrice : MonthlyPrice;

    public void AddFeature(string featureName, string? description = null)
    {
        if (_features.Any(f => f.FeatureName == featureName))
            return;

        _features.Add(new AddOnFeature(Id, featureName, description));
    }

    public void Activate() { IsActive = true; UpdatedAt = DateTime.UtcNow; }
    public void Deactivate() { IsActive = false; UpdatedAt = DateTime.UtcNow; }
}

/// <summary>
/// Add-on özellikleri
/// </summary>
public sealed class AddOnFeature : Entity
{
    public Guid AddOnId { get; private set; }
    public string FeatureName { get; private set; }
    public string? Description { get; private set; }

    private AddOnFeature() { } // EF Constructor

    public AddOnFeature(Guid addOnId, string featureName, string? description = null)
    {
        Id = Guid.NewGuid();
        AddOnId = addOnId;
        FeatureName = featureName;
        Description = description;
    }
}

/// <summary>
/// Depolama planları
/// </summary>
public sealed class StoragePlan : AggregateRoot
{
    public string Code { get; private set; }
    public string Name { get; private set; }
    public string? Description { get; private set; }
    public int StorageGB { get; private set; } // GB cinsinden depolama
    public Money MonthlyPrice { get; private set; }
    public bool IsActive { get; private set; }
    public bool IsDefault { get; private set; }
    public int DisplayOrder { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }

    private StoragePlan() { } // EF Constructor

    private StoragePlan(
        string code,
        string name,
        int storageGB,
        Money monthlyPrice,
        string? description = null,
        bool isDefault = false,
        int displayOrder = 0)
    {
        Id = Guid.NewGuid();
        Code = code;
        Name = name;
        StorageGB = storageGB;
        Description = description;
        MonthlyPrice = monthlyPrice;
        IsActive = true;
        IsDefault = isDefault;
        DisplayOrder = displayOrder;
        CreatedAt = DateTime.UtcNow;
    }

    public static StoragePlan Create(
        string code,
        string name,
        int storageGB,
        Money monthlyPrice,
        string? description = null,
        bool isDefault = false,
        int displayOrder = 0)
    {
        if (string.IsNullOrWhiteSpace(code))
            throw new ArgumentException("StoragePlan code cannot be empty.", nameof(code));

        if (storageGB <= 0)
            throw new ArgumentException("Storage must be greater than 0 GB.", nameof(storageGB));

        return new StoragePlan(code, name, storageGB, monthlyPrice, description, isDefault, displayOrder);
    }

    public void Activate() { IsActive = true; UpdatedAt = DateTime.UtcNow; }
    public void Deactivate() { IsActive = false; UpdatedAt = DateTime.UtcNow; }
    public void SetAsDefault() { IsDefault = true; UpdatedAt = DateTime.UtcNow; }
    public void UnsetDefault() { IsDefault = false; UpdatedAt = DateTime.UtcNow; }
}

/// <summary>
/// Sektör/İş türü tanımları
/// </summary>
public sealed class Industry : AggregateRoot
{
    public string Code { get; private set; }
    public string Name { get; private set; }
    public string? Description { get; private set; }
    public string? Icon { get; private set; }
    public bool IsActive { get; private set; }
    public int DisplayOrder { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }

    // Sektöre önerilen modüller
    private readonly List<IndustryRecommendedModule> _recommendedModules = new();
    public IReadOnlyList<IndustryRecommendedModule> RecommendedModules => _recommendedModules.AsReadOnly();

    private Industry() { } // EF Constructor

    private Industry(
        string code,
        string name,
        string? description = null,
        string? icon = null,
        int displayOrder = 0)
    {
        Id = Guid.NewGuid();
        Code = code;
        Name = name;
        Description = description;
        Icon = icon;
        IsActive = true;
        DisplayOrder = displayOrder;
        CreatedAt = DateTime.UtcNow;
    }

    public static Industry Create(
        string code,
        string name,
        string? description = null,
        string? icon = null,
        int displayOrder = 0)
    {
        if (string.IsNullOrWhiteSpace(code))
            throw new ArgumentException("Industry code cannot be empty.", nameof(code));

        return new Industry(code, name, description, icon, displayOrder);
    }

    public void AddRecommendedModule(string moduleCode)
    {
        if (_recommendedModules.Any(m => m.ModuleCode == moduleCode))
            return;

        _recommendedModules.Add(new IndustryRecommendedModule(Id, moduleCode));
    }

    public void Activate() { IsActive = true; UpdatedAt = DateTime.UtcNow; }
    public void Deactivate() { IsActive = false; UpdatedAt = DateTime.UtcNow; }
}

/// <summary>
/// Sektöre önerilen modüller
/// </summary>
public sealed class IndustryRecommendedModule : Entity
{
    public Guid IndustryId { get; private set; }
    public string ModuleCode { get; private set; }

    private IndustryRecommendedModule() { } // EF Constructor

    public IndustryRecommendedModule(Guid industryId, string moduleCode)
    {
        Id = Guid.NewGuid();
        IndustryId = industryId;
        ModuleCode = moduleCode;
    }
}

/// <summary>
/// Kullanıcı sayısı paketleri
/// </summary>
public sealed class UserTier : AggregateRoot
{
    public string Code { get; private set; }
    public string Name { get; private set; }
    public string? Description { get; private set; }
    public int MinUsers { get; private set; }
    public int MaxUsers { get; private set; } // -1 = sınırsız
    public Money PricePerUser { get; private set; } // Kullanıcı başına aylık fiyat
    public Money? BasePrice { get; private set; } // Sabit temel fiyat (opsiyonel)
    public bool IsActive { get; private set; }
    public int DisplayOrder { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }

    private UserTier() { } // EF Constructor

    private UserTier(
        string code,
        string name,
        int minUsers,
        int maxUsers,
        Money pricePerUser,
        Money? basePrice = null,
        string? description = null,
        int displayOrder = 0)
    {
        Id = Guid.NewGuid();
        Code = code;
        Name = name;
        MinUsers = minUsers;
        MaxUsers = maxUsers;
        PricePerUser = pricePerUser;
        BasePrice = basePrice;
        Description = description;
        IsActive = true;
        DisplayOrder = displayOrder;
        CreatedAt = DateTime.UtcNow;
    }

    public static UserTier Create(
        string code,
        string name,
        int minUsers,
        int maxUsers,
        Money pricePerUser,
        Money? basePrice = null,
        string? description = null,
        int displayOrder = 0)
    {
        if (string.IsNullOrWhiteSpace(code))
            throw new ArgumentException("UserTier code cannot be empty.", nameof(code));

        if (minUsers < 1)
            throw new ArgumentException("Minimum users must be at least 1.", nameof(minUsers));

        if (maxUsers != -1 && maxUsers < minUsers)
            throw new ArgumentException("Maximum users must be greater than or equal to minimum users.", nameof(maxUsers));

        return new UserTier(code, name, minUsers, maxUsers, pricePerUser, basePrice, description, displayOrder);
    }

    public bool IsWithinRange(int userCount) => userCount >= MinUsers && (MaxUsers == -1 || userCount <= MaxUsers);

    public Money CalculatePrice(int userCount)
    {
        var userPrice = PricePerUser.Amount * userCount;
        var baseAmount = BasePrice?.Amount ?? 0m;
        return Money.Create(baseAmount + userPrice, PricePerUser.Currency);
    }

    public void Activate() { IsActive = true; UpdatedAt = DateTime.UtcNow; }
    public void Deactivate() { IsActive = false; UpdatedAt = DateTime.UtcNow; }
}
