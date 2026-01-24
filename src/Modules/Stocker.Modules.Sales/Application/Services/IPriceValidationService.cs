using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Sales.Application.Services;

/// <summary>
/// Service for validating client-provided prices against system pricing.
/// Prevents price manipulation by verifying prices from PriceLists before order creation.
/// </summary>
public interface IPriceValidationService
{
    /// <summary>
    /// Validates a client-provided price against system pricing for a specific product.
    /// Returns the validated system price if the client price is within tolerance,
    /// or a failure result if the price deviation exceeds the allowed threshold.
    /// </summary>
    Task<Result<decimal>> ValidateAndGetPriceAsync(
        Guid productId,
        decimal clientPrice,
        decimal quantity,
        Guid? customerId,
        string currency,
        CancellationToken cancellationToken = default);
}

/// <summary>
/// Result of price validation containing the system price and deviation info
/// </summary>
public record PriceValidationResult
{
    public Guid ProductId { get; init; }
    public decimal ClientPrice { get; init; }
    public decimal SystemPrice { get; init; }
    public decimal DeviationPercentage { get; init; }
    public bool IsWithinTolerance { get; init; }
    public string? PriceListCode { get; init; }
}
