using Stocker.Domain.Common.ValueObjects;
using Stocker.SharedKernel.Primitives;

namespace Stocker.Domain.Master.Entities;

/// <summary>
/// Ek ozellikler (Add-ons) - API erişimi, öncelikli destek vb.
/// </summary>
public sealed class AddOn : AggregateRoot
{
    public string Code { get; private set; }
    public string Name { get; private set; }
    public string? Description { get; private set; }
    public string? Icon { get; private set; }
    public Money MonthlyPrice { get; private set; }
    public bool IsActive { get; private set; }
    public int DisplayOrder { get; private set; }
    public string? Category { get; private set; } // Destek, Entegrasyon, Güvenlik vb.
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }

    // Add-on özellikleri
    private readonly List<AddOnFeature> _features = new();
    public IReadOnlyList<AddOnFeature> Features => _features.AsReadOnly();

    private AddOn() { } // EF Constructor

    private AddOn(
        string code,
        string name,
        Money monthlyPrice,
        string? description = null,
        string? icon = null,
        int displayOrder = 0,
        string? category = null)
    {
        Id = Guid.NewGuid();
        Code = code;
        Name = name;
        Description = description;
        Icon = icon;
        MonthlyPrice = monthlyPrice;
        IsActive = true;
        DisplayOrder = displayOrder;
        Category = category;
        CreatedAt = DateTime.UtcNow;
    }

    public static AddOn Create(
        string code,
        string name,
        Money monthlyPrice,
        string? description = null,
        string? icon = null,
        int displayOrder = 0,
        string? category = null)
    {
        if (string.IsNullOrWhiteSpace(code))
            throw new ArgumentException("AddOn code cannot be empty.", nameof(code));

        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("AddOn name cannot be empty.", nameof(name));

        return new AddOn(code, name, monthlyPrice, description, icon, displayOrder, category);
    }

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
