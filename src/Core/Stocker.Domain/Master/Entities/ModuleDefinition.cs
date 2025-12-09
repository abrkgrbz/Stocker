using Stocker.Domain.Common.ValueObjects;
using Stocker.SharedKernel.Primitives;

namespace Stocker.Domain.Master.Entities;

/// <summary>
/// Sistemde mevcut olan modüllerin tanımlarını tutar.
/// Her modülün fiyatı, açıklaması ve özellikleri burada tanımlanır.
/// </summary>
public sealed class ModuleDefinition : AggregateRoot
{
    public string Code { get; private set; }
    public string Name { get; private set; }
    public string? Description { get; private set; }
    public string? Icon { get; private set; }
    public Money MonthlyPrice { get; private set; }
    public bool IsCore { get; private set; } // Core modüller her pakette zorunlu
    public bool IsActive { get; private set; }
    public int DisplayOrder { get; private set; }
    public string? Category { get; private set; } // Satış, Stok, İK, CRM, Finans vb.
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }

    // Modül özellikleri (feature list)
    private readonly List<ModuleFeature> _features = new();
    public IReadOnlyList<ModuleFeature> Features => _features.AsReadOnly();

    // Modül bağımlılıkları (bu modül için gerekli diğer modüller)
    private readonly List<ModuleDependency> _dependencies = new();
    public IReadOnlyList<ModuleDependency> Dependencies => _dependencies.AsReadOnly();

    private ModuleDefinition() { } // EF Constructor

    private ModuleDefinition(
        string code,
        string name,
        Money monthlyPrice,
        string? description = null,
        string? icon = null,
        bool isCore = false,
        int displayOrder = 0,
        string? category = null)
    {
        Id = Guid.NewGuid();
        Code = code;
        Name = name;
        Description = description;
        Icon = icon;
        MonthlyPrice = monthlyPrice;
        IsCore = isCore;
        IsActive = true;
        DisplayOrder = displayOrder;
        Category = category;
        CreatedAt = DateTime.UtcNow;
    }

    public static ModuleDefinition Create(
        string code,
        string name,
        Money monthlyPrice,
        string? description = null,
        string? icon = null,
        bool isCore = false,
        int displayOrder = 0,
        string? category = null)
    {
        if (string.IsNullOrWhiteSpace(code))
            throw new ArgumentException("Module code cannot be empty.", nameof(code));

        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Module name cannot be empty.", nameof(name));

        return new ModuleDefinition(code, name, monthlyPrice, description, icon, isCore, displayOrder, category);
    }

    public void Update(
        string name,
        string? description,
        string? icon,
        Money monthlyPrice,
        bool isCore,
        int displayOrder,
        string? category)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Module name cannot be empty.", nameof(name));

        Name = name;
        Description = description;
        Icon = icon;
        MonthlyPrice = monthlyPrice;
        IsCore = isCore;
        DisplayOrder = displayOrder;
        Category = category;
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

    public void AddFeature(string featureName, string? description = null)
    {
        if (_features.Any(f => f.FeatureName == featureName))
            return;

        _features.Add(new ModuleFeature(Id, featureName, description));
    }

    public void RemoveFeature(string featureName)
    {
        var feature = _features.FirstOrDefault(f => f.FeatureName == featureName);
        if (feature != null)
            _features.Remove(feature);
    }

    public void AddDependency(string dependentModuleCode)
    {
        if (_dependencies.Any(d => d.DependentModuleCode == dependentModuleCode))
            return;

        _dependencies.Add(new ModuleDependency(Id, dependentModuleCode));
    }

    public void RemoveDependency(string dependentModuleCode)
    {
        var dependency = _dependencies.FirstOrDefault(d => d.DependentModuleCode == dependentModuleCode);
        if (dependency != null)
            _dependencies.Remove(dependency);
    }
}

/// <summary>
/// Modülün sunduğu özellikler
/// </summary>
public sealed class ModuleFeature : Entity
{
    public Guid ModuleDefinitionId { get; private set; }
    public string FeatureName { get; private set; }
    public string? Description { get; private set; }

    private ModuleFeature() { } // EF Constructor

    public ModuleFeature(Guid moduleDefinitionId, string featureName, string? description = null)
    {
        Id = Guid.NewGuid();
        ModuleDefinitionId = moduleDefinitionId;
        FeatureName = featureName;
        Description = description;
    }
}

/// <summary>
/// Modül bağımlılıkları - bir modülün çalışması için gerekli diğer modüller
/// </summary>
public sealed class ModuleDependency : Entity
{
    public Guid ModuleDefinitionId { get; private set; }
    public string DependentModuleCode { get; private set; } // Bağımlı olunan modülün kodu

    private ModuleDependency() { } // EF Constructor

    public ModuleDependency(Guid moduleDefinitionId, string dependentModuleCode)
    {
        Id = Guid.NewGuid();
        ModuleDefinitionId = moduleDefinitionId;
        DependentModuleCode = dependentModuleCode;
    }
}
