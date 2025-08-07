using Stocker.SharedKernel.Primitives;

namespace Stocker.Domain.Master.Entities;

public sealed class SubscriptionUsage : Entity
{
    public Guid SubscriptionId { get; private set; }
    public string MetricName { get; private set; }
    public int Value { get; private set; }
    public DateTime RecordedAt { get; private set; }
    public DateTime CreatedAt { get; private set; }

    private SubscriptionUsage() { } // EF Constructor

    public SubscriptionUsage(
        Guid subscriptionId,
        string metricName,
        int value,
        DateTime recordedAt)
    {
        Id = Guid.NewGuid();
        SubscriptionId = subscriptionId;
        MetricName = metricName ?? throw new ArgumentNullException(nameof(metricName));
        Value = value;
        RecordedAt = recordedAt;
        CreatedAt = DateTime.UtcNow;
    }
}