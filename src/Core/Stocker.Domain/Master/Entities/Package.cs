using Stocker.Domain.Common.ValueObjects;
using Stocker.Domain.Master.Enums;
using Stocker.Domain.Master.ValueObjects;
using Stocker.SharedKernel.Primitives;

namespace Stocker.Domain.Master.Entities;

public sealed class Package : AggregateRoot
{
    private readonly List<PackageFeature> _features = new();
    private readonly List<PackageModule> _modules = new();

    public string Name { get; private set; }
    public string? Description { get; private set; }
    public PackageType Type { get; private set; }
    public Money BasePrice { get; private set; }
    public PackageLimit Limits { get; private set; }
    public bool IsActive { get; private set; }
    public bool IsPublic { get; private set; }
    public int TrialDays { get; private set; }
    public int DisplayOrder { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }
    public IReadOnlyList<PackageFeature> Features => _features.AsReadOnly();
    public IReadOnlyList<PackageModule> Modules => _modules.AsReadOnly();

    private Package() { } // EF Constructor

    private Package(
        string name,
        PackageType type,
        Money basePrice,
        PackageLimit limits,
        string? description = null,
        int trialDays = 0,
        int displayOrder = 0,
        bool isPublic = true)
    {
        Id = Guid.NewGuid();
        Name = name;
        Description = description;
        Type = type;
        BasePrice = basePrice;
        Limits = limits;
        IsActive = true;
        IsPublic = isPublic;
        TrialDays = trialDays;
        DisplayOrder = displayOrder;
        CreatedAt = DateTime.UtcNow;
    }

    public static Package Create(
        string name,
        PackageType type,
        Money basePrice,
        PackageLimit limits,
        string? description = null,
        int trialDays = 0,
        int displayOrder = 0,
        bool isPublic = true)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            throw new ArgumentException("Package name cannot be empty.", nameof(name));
        }

        if (trialDays < 0)
        {
            throw new ArgumentException("Trial days cannot be negative.", nameof(trialDays));
        }

        return new Package(name, type, basePrice, limits, description, trialDays, displayOrder, isPublic);
    }

    public void Update(
        string name,
        string? description,
        Money basePrice,
        PackageLimit limits,
        int trialDays,
        int displayOrder,
        bool isPublic)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            throw new ArgumentException("Package name cannot be empty.", nameof(name));
        }

        Name = name;
        Description = description;
        BasePrice = basePrice;
        Limits = limits;
        TrialDays = trialDays;
        DisplayOrder = displayOrder;
        IsPublic = isPublic;
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

    public void AddFeature(string featureCode, string featureName, string? description = null, bool isHighlighted = false)
    {
        if (_features.Any(f => f.FeatureCode == featureCode))
        {
            throw new InvalidOperationException($"Feature '{featureCode}' already exists in this package.");
        }

        _features.Add(new PackageFeature(Id, featureCode, featureName, description, isHighlighted));
    }

    public void RemoveFeature(string featureCode)
    {
        var feature = _features.FirstOrDefault(f => f.FeatureCode == featureCode);
        if (feature == null)
        {
            throw new InvalidOperationException($"Feature '{featureCode}' not found in this package.");
        }

        _features.Remove(feature);
    }

    public void AddModule(string moduleCode, string moduleName, bool isIncluded = true, int? maxEntities = null)
    {
        if (_modules.Any(m => m.ModuleCode == moduleCode))
        {
            throw new InvalidOperationException($"Module '{moduleCode}' already exists in this package.");
        }

        _modules.Add(new PackageModule(Id, moduleCode, moduleName, isIncluded, maxEntities));
    }

    public void RemoveModule(string moduleCode)
    {
        var module = _modules.FirstOrDefault(m => m.ModuleCode == moduleCode);
        if (module == null)
        {
            throw new InvalidOperationException($"Module '{moduleCode}' not found in this package.");
        }

        _modules.Remove(module);
    }

    public bool HasFeature(string featureCode)
    {
        return _features.Any(f => f.FeatureCode == featureCode);
    }

    public bool HasModule(string moduleCode)
    {
        return _modules.Any(m => m.ModuleCode == moduleCode && m.IsIncluded);
    }

    public Money CalculatePriceForCycle(BillingCycle cycle)
    {
        var multiplier = cycle switch
        {
            BillingCycle.Monthly => 1m,
            BillingCycle.Quarterly => 2.7m, // 10% discount
            BillingCycle.SemiAnnually => 5.1m, // 15% discount
            BillingCycle.Annually => 9.6m, // 20% discount
            _ => 1m
        };

        return BasePrice.Multiply(multiplier);
    }
}