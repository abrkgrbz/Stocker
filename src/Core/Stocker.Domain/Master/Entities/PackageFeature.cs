using Stocker.SharedKernel.Primitives;

namespace Stocker.Domain.Master.Entities;

public sealed class PackageFeature : Entity
{
    public Guid PackageId { get; private set; }
    public string FeatureCode { get; private set; }
    public string FeatureName { get; private set; }
    public string? Description { get; private set; }
    public bool IsHighlighted { get; private set; }
    public int DisplayOrder { get; private set; }

    private PackageFeature() { } // EF Constructor

    public PackageFeature(
        Guid packageId,
        string featureCode,
        string featureName,
        string? description = null,
        bool isHighlighted = false,
        int displayOrder = 0)
    {
        Id = Guid.NewGuid();
        PackageId = packageId;
        FeatureCode = featureCode ?? throw new ArgumentNullException(nameof(featureCode));
        FeatureName = featureName ?? throw new ArgumentNullException(nameof(featureName));
        Description = description;
        IsHighlighted = isHighlighted;
        DisplayOrder = displayOrder;
    }
}