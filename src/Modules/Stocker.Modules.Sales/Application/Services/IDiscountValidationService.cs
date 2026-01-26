using Stocker.Modules.Sales.Domain.Entities;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Sales.Application.Services;

/// <summary>
/// Service for validating and calculating discounts based on coupon codes.
/// This is the ONLY authorized way to apply discounts - direct DiscountAmount/DiscountRate
/// from client requests must not be trusted.
/// </summary>
public interface IDiscountValidationService
{
    /// <summary>
    /// Validates a coupon code and calculates the discount amount.
    /// </summary>
    /// <param name="couponCode">The coupon code to validate</param>
    /// <param name="orderAmount">The order amount before discount</param>
    /// <param name="quantity">Total item quantity in order</param>
    /// <param name="customerId">Optional customer ID for customer-specific discounts</param>
    /// <param name="productIds">Optional product IDs for product-specific discounts</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Validated discount result with calculated amount</returns>
    Task<Result<DiscountValidationResult>> ValidateAndCalculateAsync(
        string couponCode,
        decimal orderAmount,
        int quantity = 1,
        Guid? customerId = null,
        IEnumerable<Guid>? productIds = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Validates multiple coupon codes and calculates combined discount.
    /// Only stackable discounts can be combined.
    /// </summary>
    Task<Result<DiscountValidationResult>> ValidateAndCalculateMultipleAsync(
        IEnumerable<string> couponCodes,
        decimal orderAmount,
        int quantity = 1,
        Guid? customerId = null,
        IEnumerable<Guid>? productIds = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets applicable automatic discounts for an order (no coupon code required).
    /// </summary>
    Task<Result<IReadOnlyList<DiscountValidationResult>>> GetApplicableAutomaticDiscountsAsync(
        decimal orderAmount,
        int quantity = 1,
        Guid? customerId = null,
        IEnumerable<Guid>? productIds = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Marks a discount as used (increments usage count).
    /// Should be called after order is successfully created.
    /// </summary>
    Task<Result> MarkDiscountUsedAsync(
        Guid discountId,
        CancellationToken cancellationToken = default);
}

/// <summary>
/// Result of discount validation containing calculated discount information.
/// </summary>
public record DiscountValidationResult
{
    /// <summary>
    /// The discount entity ID
    /// </summary>
    public Guid DiscountId { get; init; }

    /// <summary>
    /// The coupon code used
    /// </summary>
    public string CouponCode { get; init; } = string.Empty;

    /// <summary>
    /// The discount name for display
    /// </summary>
    public string DiscountName { get; init; } = string.Empty;

    /// <summary>
    /// Type of discount (Coupon, Automatic, etc.)
    /// </summary>
    public DiscountType DiscountType { get; init; }

    /// <summary>
    /// How the discount value is calculated
    /// </summary>
    public DiscountValueType ValueType { get; init; }

    /// <summary>
    /// The discount value (percentage or fixed amount based on ValueType)
    /// </summary>
    public decimal DiscountValue { get; init; }

    /// <summary>
    /// The calculated discount amount in currency
    /// </summary>
    public decimal CalculatedDiscountAmount { get; init; }

    /// <summary>
    /// The effective discount rate as percentage
    /// </summary>
    public decimal EffectiveDiscountRate { get; init; }

    /// <summary>
    /// Whether this discount can be stacked with others
    /// </summary>
    public bool IsStackable { get; init; }

    /// <summary>
    /// Priority for applying this discount (lower = applied first)
    /// </summary>
    public int Priority { get; init; }
}
