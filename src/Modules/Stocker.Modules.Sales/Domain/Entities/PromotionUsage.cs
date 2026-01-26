using Stocker.SharedKernel.MultiTenancy;

namespace Stocker.Modules.Sales.Domain.Entities;

/// <summary>
/// Tracks promotion usage per customer per order.
/// Used for enforcing per-customer usage limits and audit trail.
/// </summary>
public class PromotionUsage : TenantEntity
{
    public Guid PromotionId { get; private set; }
    public Guid CustomerId { get; private set; }
    public Guid OrderId { get; private set; }
    public decimal DiscountApplied { get; private set; }
    public DateTime UsedAt { get; private set; }

    private PromotionUsage() : base() { }

    public static PromotionUsage Create(
        Guid tenantId,
        Guid promotionId,
        Guid customerId,
        Guid orderId,
        decimal discountApplied)
    {
        var usage = new PromotionUsage
        {
            Id = Guid.NewGuid(),
            PromotionId = promotionId,
            CustomerId = customerId,
            OrderId = orderId,
            DiscountApplied = discountApplied,
            UsedAt = DateTime.UtcNow
        };

        usage.SetTenantId(tenantId);

        return usage;
    }
}
