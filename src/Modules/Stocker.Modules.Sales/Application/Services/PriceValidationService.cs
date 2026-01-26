using Microsoft.Extensions.Logging;
using Stocker.Modules.Sales.Interfaces;
using Stocker.Shared.Contracts.Inventory;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Sales.Application.Services;

/// <summary>
/// Validates client-provided prices against PriceList system pricing.
/// Lookup priority:
/// 1. Customer-specific price list (if customerId provided)
/// 2. Standard/active price lists valid at current date
/// 3. Fallback to Inventory product base price
///
/// Tolerance: 1% deviation allowed to handle rounding differences.
/// </summary>
public class PriceValidationService : IPriceValidationService
{
    private const decimal PriceTolerancePercentage = 1.0m; // %1 tolerance

    private readonly ISalesUnitOfWork _unitOfWork;
    private readonly IInventoryService _inventoryService;
    private readonly ILogger<PriceValidationService> _logger;

    public PriceValidationService(
        ISalesUnitOfWork unitOfWork,
        IInventoryService inventoryService,
        ILogger<PriceValidationService> logger)
    {
        _unitOfWork = unitOfWork;
        _inventoryService = inventoryService;
        _logger = logger;
    }

    public async Task<Result<decimal>> ValidateAndGetPriceAsync(
        Guid productId,
        decimal clientPrice,
        decimal quantity,
        Guid? customerId,
        string currency,
        CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        decimal? systemPrice = null;
        string? priceListSource = null;

        // Priority 1: Customer-specific price list
        if (customerId.HasValue)
        {
            var customerPriceLists = await _unitOfWork.PriceLists.GetByCustomerIdAsync(
                customerId.Value, cancellationToken);

            var validCustomerList = customerPriceLists
                .Where(pl => pl.IsValidAt(now) && pl.CurrencyCode == currency)
                .OrderByDescending(pl => pl.Priority)
                .FirstOrDefault();

            if (validCustomerList != null)
            {
                var priceResult = validCustomerList.GetProductPrice(productId, quantity);
                if (priceResult.IsSuccess)
                {
                    systemPrice = priceResult.Value!.Amount;
                    priceListSource = $"Customer:{validCustomerList.Code}";
                }
            }
        }

        // Priority 2: Standard active price lists
        if (!systemPrice.HasValue)
        {
            var activePriceLists = await _unitOfWork.PriceLists.GetValidAtDateAsync(now, cancellationToken);

            var validList = activePriceLists
                .Where(pl => pl.CurrencyCode == currency)
                .OrderByDescending(pl => pl.Priority)
                .FirstOrDefault();

            if (validList != null)
            {
                var priceResult = validList.GetProductPrice(productId, quantity);
                if (priceResult.IsSuccess)
                {
                    systemPrice = priceResult.Value!.Amount;
                    priceListSource = $"Standard:{validList.Code}";
                }
            }
        }

        // Priority 3: Fallback to Inventory base price
        if (!systemPrice.HasValue)
        {
            var tenantId = _unitOfWork.TenantId;
            var product = await _inventoryService.GetProductByIdAsync(productId, tenantId, cancellationToken);

            if (product != null && product.UnitPrice > 0)
            {
                // CRITICAL: Currency mismatch check for product base price
                // Price lists already filter by currency, but inventory fallback doesn't
                if (!string.IsNullOrEmpty(product.Currency) &&
                    !string.Equals(product.Currency, currency, StringComparison.OrdinalIgnoreCase))
                {
                    _logger.LogWarning(
                        "Currency mismatch for product {ProductId}. Order currency: {OrderCurrency}, Product currency: {ProductCurrency}.",
                        productId, currency, product.Currency);

                    return Result<decimal>.Failure(
                        Error.Validation("Currency.Mismatch",
                            $"Sipariş para birimi ({currency}) ile ürün para birimi ({product.Currency}) uyuşmuyor. " +
                            $"Lütfen doğru para birimini seçin veya uygun bir fiyat listesi tanımlayın."));
                }

                systemPrice = product.UnitPrice;
                priceListSource = "Inventory:BasePrice";
            }
        }

        // No system price found - allow client price (product may not be in any price list)
        if (!systemPrice.HasValue)
        {
            _logger.LogWarning(
                "No system price found for product {ProductId}. Allowing client price {ClientPrice}.",
                productId, clientPrice);
            return Result<decimal>.Success(clientPrice);
        }

        // Validate deviation
        var deviation = systemPrice.Value == 0
            ? (clientPrice == 0 ? 0 : 100)
            : Math.Abs((clientPrice - systemPrice.Value) / systemPrice.Value * 100);

        if (deviation > PriceTolerancePercentage)
        {
            _logger.LogWarning(
                "Price manipulation detected for product {ProductId}. " +
                "Client: {ClientPrice}, System: {SystemPrice} ({Source}), Deviation: {Deviation:F2}%",
                productId, clientPrice, systemPrice.Value, priceListSource, deviation);

            return Result<decimal>.Failure(
                Error.Validation("Price.Mismatch",
                    $"Birim fiyat sistem fiyatıyla uyuşmuyor. " +
                    $"Beklenen: {systemPrice.Value:N2} {currency}, Gönderilen: {clientPrice:N2} {currency}. " +
                    $"İzin verilen sapma: %{PriceTolerancePercentage}."));
        }

        _logger.LogDebug(
            "Price validated for product {ProductId}: Client={ClientPrice}, System={SystemPrice} ({Source}), Deviation={Deviation:F2}%",
            productId, clientPrice, systemPrice.Value, priceListSource, deviation);

        // Return system price (canonical price, not client's potentially rounded value)
        return Result<decimal>.Success(systemPrice.Value);
    }
}
