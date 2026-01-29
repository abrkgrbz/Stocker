using Stocker.SharedKernel.Primitives;

namespace Stocker.Domain.Master.Events;

/// <summary>
/// Abonelik aktivasyonu tamamlandığında tetiklenir
/// </summary>
public sealed record SubscriptionActivatedEvent : IDomainEvent
{
    public Guid Id { get; init; } = Guid.NewGuid();
    public DateTime OccurredOnUtc { get; init; } = DateTime.UtcNow;
    public Guid SubscriptionId { get; init; }
    public Guid TenantId { get; init; }
    public Guid OrderId { get; init; }
    public string OrderNumber { get; init; } = string.Empty;
    public List<ActivatedFeature> ActivatedFeatures { get; init; } = new();
}

public record ActivatedFeature
{
    public string FeatureType { get; init; } = string.Empty;  // Module, Bundle, AddOn, StoragePlan, Users
    public string Code { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public int Quantity { get; init; } = 1;
}
