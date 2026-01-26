using Stocker.Modules.Sales.Domain.Entities;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Sales.Application.Services;

/// <summary>
/// Service for validating and calculating promotions.
/// This ensures promotions are properly validated server-side with usage tracking.
/// </summary>
public interface IPromotionValidationService
{
    /// <summary>
    /// Validates a promotion code and calculates the discount.
    /// Includes customer-specific usage limit checks.
    /// </summary>
    /// <param name="promotionCode">The promotion code to validate</param>
    /// <param name="orderAmount">The order amount before discount</param>
    /// <param name="customerId">Customer ID for per-customer limit checks</param>
    /// <param name="quantity">Total item quantity in order</param>
    /// <param name="productIds">Optional product IDs for product-specific promotions</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Validated promotion result with calculated discount</returns>
    Task<Result<PromotionValidationResult>> ValidateAndCalculateAsync(
        string promotionCode,
        decimal orderAmount,
        Guid customerId,
        int quantity = 1,
        IEnumerable<Guid>? productIds = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets applicable automatic promotions for an order.
    /// Includes customer-specific usage limit checks.
    /// </summary>
    Task<Result<IReadOnlyList<PromotionValidationResult>>> GetApplicablePromotionsAsync(
        decimal orderAmount,
        Guid customerId,
        int quantity = 1,
        IEnumerable<Guid>? productIds = null,
        string? channel = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Marks a promotion as used for a customer (increments usage counts).
    /// Should be called WITHIN the same transaction as order creation.
    /// </summary>
    /// <param name="promotionId">The promotion ID</param>
    /// <param name="customerId">The customer who used the promotion</param>
    /// <param name="orderId">The order where promotion was applied</param>
    /// <param name="cancellationToken">Cancellation token</param>
    Task<Result> MarkPromotionUsedAsync(
        Guid promotionId,
        Guid customerId,
        Guid orderId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets customer's usage count for a specific promotion.
    /// Used for per-customer limit validation.
    /// </summary>
    Task<int> GetCustomerUsageCountAsync(
        Guid promotionId,
        Guid customerId,
        CancellationToken cancellationToken = default);
}

/// <summary>
/// Result of promotion validation containing calculated discount information.
/// </summary>
public record PromotionValidationResult
{
    /// <summary>
    /// The promotion entity ID
    /// </summary>
    public Guid PromotionId { get; init; }

    /// <summary>
    /// The promotion code
    /// </summary>
    public string PromotionCode { get; init; } = string.Empty;

    /// <summary>
    /// The promotion name for display
    /// </summary>
    public string PromotionName { get; init; } = string.Empty;

    /// <summary>
    /// Type of promotion (Discount, BuyXGetY, etc.)
    /// </summary>
    public PromotionType PromotionType { get; init; }

    /// <summary>
    /// The calculated discount amount in currency
    /// </summary>
    public decimal CalculatedDiscountAmount { get; init; }

    /// <summary>
    /// The effective discount rate as percentage
    /// </summary>
    public decimal EffectiveDiscountRate { get; init; }

    /// <summary>
    /// Whether this promotion can be stacked with others
    /// </summary>
    public bool IsStackable { get; init; }

    /// <summary>
    /// Whether this promotion is exclusive (cannot be combined)
    /// </summary>
    public bool IsExclusive { get; init; }

    /// <summary>
    /// Priority for applying this promotion (higher = applied first)
    /// </summary>
    public int Priority { get; init; }

    /// <summary>
    /// Total remaining uses for this promotion
    /// </summary>
    public int? RemainingTotalUses { get; init; }

    /// <summary>
    /// Remaining uses for this customer
    /// </summary>
    public int? RemainingCustomerUses { get; init; }

    /// <summary>
    /// Free product details if promotion includes free items
    /// </summary>
    public FreeProductInfo? FreeProduct { get; init; }
}

/// <summary>
/// Information about free products in a promotion
/// </summary>
public record FreeProductInfo
{
    public Guid ProductId { get; init; }
    public int Quantity { get; init; }
}
