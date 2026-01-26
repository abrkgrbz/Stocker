using Microsoft.Extensions.Logging;
using Stocker.Modules.Sales.Application.Services;
using Stocker.Modules.Sales.Domain.Entities;
using Stocker.Modules.Sales.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Sales.Infrastructure.Services;

/// <summary>
/// Implementation of promotion validation service.
/// Ensures all promotions are validated server-side with proper usage tracking
/// and per-customer limit enforcement.
/// </summary>
public class PromotionValidationService : IPromotionValidationService
{
    private readonly ISalesUnitOfWork _unitOfWork;
    private readonly ILogger<PromotionValidationService> _logger;

    public PromotionValidationService(
        ISalesUnitOfWork unitOfWork,
        ILogger<PromotionValidationService> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<Result<PromotionValidationResult>> ValidateAndCalculateAsync(
        string promotionCode,
        decimal orderAmount,
        Guid customerId,
        int quantity = 1,
        IEnumerable<Guid>? productIds = null,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(promotionCode))
        {
            return Result<PromotionValidationResult>.Failure(
                Error.Validation("Promotion.Code", "Promosyon kodu gereklidir"));
        }

        var promotion = await _unitOfWork.Promotions.GetByCodeAsync(
            promotionCode.ToUpperInvariant(), cancellationToken);

        if (promotion is null)
        {
            _logger.LogWarning("Invalid promotion code attempted: {PromotionCode}", promotionCode);
            return Result<PromotionValidationResult>.Failure(
                Error.NotFound("Promotion.NotFound", $"'{promotionCode}' promosyon kodu bulunamadı"));
        }

        // Validate promotion is valid and applicable
        var validationResult = await ValidatePromotionApplicabilityAsync(
            promotion, orderAmount, quantity, customerId, productIds, cancellationToken);

        if (!validationResult.IsSuccess)
        {
            return Result<PromotionValidationResult>.Failure(validationResult.Error!);
        }

        // Calculate discount based on promotion rules
        var discountAmount = CalculatePromotionDiscount(promotion, orderAmount, quantity);
        var effectiveRate = orderAmount > 0 ? (discountAmount / orderAmount) * 100 : 0;

        // Calculate remaining uses
        var customerUsageCount = await GetCustomerUsageCountAsync(promotion.Id, customerId, cancellationToken);
        int? remainingTotalUses = promotion.UsageLimit.HasValue
            ? promotion.UsageLimit.Value - promotion.TotalUsageCount
            : null;
        int? remainingCustomerUses = promotion.UsageLimitPerCustomer.HasValue
            ? promotion.UsageLimitPerCustomer.Value - customerUsageCount
            : null;

        _logger.LogInformation(
            "Promotion validated: Code={PromotionCode}, Amount={DiscountAmount}, Rate={EffectiveRate}%, Customer={CustomerId}",
            promotionCode, discountAmount, effectiveRate, customerId);

        return Result<PromotionValidationResult>.Success(new PromotionValidationResult
        {
            PromotionId = promotion.Id,
            PromotionCode = promotion.Code,
            PromotionName = promotion.Name,
            PromotionType = promotion.Type,
            CalculatedDiscountAmount = discountAmount,
            EffectiveDiscountRate = effectiveRate,
            IsStackable = promotion.IsStackable,
            IsExclusive = promotion.IsExclusive,
            Priority = promotion.Priority,
            RemainingTotalUses = remainingTotalUses,
            RemainingCustomerUses = remainingCustomerUses,
            FreeProduct = GetFreeProductInfo(promotion)
        });
    }

    public async Task<Result<IReadOnlyList<PromotionValidationResult>>> GetApplicablePromotionsAsync(
        decimal orderAmount,
        Guid customerId,
        int quantity = 1,
        IEnumerable<Guid>? productIds = null,
        string? channel = null,
        CancellationToken cancellationToken = default)
    {
        var activePromotions = await _unitOfWork.Promotions.GetActivePromotionsAsync(cancellationToken);
        var applicablePromotions = new List<PromotionValidationResult>();
        var productIdList = productIds?.ToList();

        foreach (var promotion in activePromotions)
        {
            // Validate applicability
            var validationResult = await ValidatePromotionApplicabilityAsync(
                promotion, orderAmount, quantity, customerId, productIdList, cancellationToken);

            if (!validationResult.IsSuccess)
            {
                continue; // Skip non-applicable promotions
            }

            // Check channel if specified
            if (!string.IsNullOrEmpty(channel) && !string.IsNullOrEmpty(promotion.ApplicableChannels))
            {
                var channels = promotion.ApplicableChannels.Split(',', StringSplitOptions.RemoveEmptyEntries);
                if (!channels.Any(c => c.Trim().Equals(channel, StringComparison.OrdinalIgnoreCase)))
                {
                    continue;
                }
            }

            var discountAmount = CalculatePromotionDiscount(promotion, orderAmount, quantity);
            var effectiveRate = orderAmount > 0 ? (discountAmount / orderAmount) * 100 : 0;

            var customerUsageCount = await GetCustomerUsageCountAsync(promotion.Id, customerId, cancellationToken);

            applicablePromotions.Add(new PromotionValidationResult
            {
                PromotionId = promotion.Id,
                PromotionCode = promotion.Code,
                PromotionName = promotion.Name,
                PromotionType = promotion.Type,
                CalculatedDiscountAmount = discountAmount,
                EffectiveDiscountRate = effectiveRate,
                IsStackable = promotion.IsStackable,
                IsExclusive = promotion.IsExclusive,
                Priority = promotion.Priority,
                RemainingTotalUses = promotion.UsageLimit.HasValue
                    ? promotion.UsageLimit.Value - promotion.TotalUsageCount
                    : null,
                RemainingCustomerUses = promotion.UsageLimitPerCustomer.HasValue
                    ? promotion.UsageLimitPerCustomer.Value - customerUsageCount
                    : null,
                FreeProduct = GetFreeProductInfo(promotion)
            });
        }

        // Sort by priority (higher first) and by discount amount
        var sortedPromotions = applicablePromotions
            .OrderByDescending(p => p.Priority)
            .ThenByDescending(p => p.CalculatedDiscountAmount)
            .ToList();

        _logger.LogInformation(
            "Found {Count} applicable promotions for order amount {OrderAmount}, Customer {CustomerId}",
            sortedPromotions.Count, orderAmount, customerId);

        return Result<IReadOnlyList<PromotionValidationResult>>.Success(sortedPromotions);
    }

    public async Task<Result> MarkPromotionUsedAsync(
        Guid promotionId,
        Guid customerId,
        Guid orderId,
        CancellationToken cancellationToken = default)
    {
        var promotion = await _unitOfWork.Promotions.GetByIdAsync(promotionId, cancellationToken);

        if (promotion is null)
        {
            return Result.Failure(
                Error.NotFound("Promotion.NotFound", "Promosyon bulunamadı"));
        }

        // Check if already used for this order (idempotency)
        var alreadyUsed = await _unitOfWork.PromotionUsages.ExistsForOrderAsync(
            promotionId, orderId, cancellationToken);

        if (alreadyUsed)
        {
            _logger.LogWarning(
                "Promotion {PromotionId} already used for order {OrderId}. Skipping duplicate usage.",
                promotionId, orderId);
            return Result.Success();
        }

        // CRITICAL: Validate limits again before incrementing (double-check)
        var customerUsageCount = await GetCustomerUsageCountAsync(promotionId, customerId, cancellationToken);

        if (promotion.UsageLimitPerCustomer.HasValue &&
            customerUsageCount >= promotion.UsageLimitPerCustomer.Value)
        {
            return Result.Failure(
                Error.Conflict("Promotion.CustomerLimitReached",
                    $"Bu promosyonu kullanım hakkınız ({promotion.UsageLimitPerCustomer.Value}) dolmuştur."));
        }

        // Increment total usage (with built-in limit check)
        var incrementResult = promotion.IncrementUsage();
        if (!incrementResult.IsSuccess)
        {
            return incrementResult;
        }

        // Record customer-specific usage
        var usage = PromotionUsage.Create(
            _unitOfWork.TenantId,
            promotionId,
            customerId,
            orderId,
            discountApplied: 0); // Will be updated with actual amount if needed

        await _unitOfWork.PromotionUsages.AddAsync(usage, cancellationToken);

        _logger.LogInformation(
            "Promotion usage recorded: PromotionId={PromotionId}, CustomerId={CustomerId}, OrderId={OrderId}, NewTotalCount={TotalCount}",
            promotionId, customerId, orderId, promotion.TotalUsageCount);

        return Result.Success();
    }

    public async Task<int> GetCustomerUsageCountAsync(
        Guid promotionId,
        Guid customerId,
        CancellationToken cancellationToken = default)
    {
        return await _unitOfWork.PromotionUsages.GetCustomerUsageCountAsync(
            promotionId, customerId, cancellationToken);
    }

    private async Task<Result> ValidatePromotionApplicabilityAsync(
        Promotion promotion,
        decimal orderAmount,
        int quantity,
        Guid customerId,
        IEnumerable<Guid>? productIds,
        CancellationToken cancellationToken)
    {
        // Check if promotion is valid (active, within date range, not exceeded global usage)
        if (!promotion.CanBeUsed())
        {
            return Result.Failure(
                Error.Conflict("Promotion.Invalid", "Bu promosyon artık geçerli değil"));
        }

        // Check customer-specific usage limit
        var customerUsageCount = await GetCustomerUsageCountAsync(
            promotion.Id, customerId, cancellationToken);

        if (!promotion.CanBeUsedByCustomer(customerUsageCount))
        {
            return Result.Failure(
                Error.Conflict("Promotion.CustomerLimitReached",
                    $"Bu promosyonu kullanım hakkınız dolmuştur. (Maksimum: {promotion.UsageLimitPerCustomer} kez)"));
        }

        // Check minimum order amount
        if (promotion.MinimumOrderAmount.HasValue && orderAmount < promotion.MinimumOrderAmount.Value)
        {
            return Result.Failure(
                Error.Validation("Promotion.MinimumOrderAmount",
                    $"Bu promosyon için minimum sipariş tutarı {promotion.MinimumOrderAmount.Value:N2} TL'dir"));
        }

        // Check customer segment targeting
        if (!string.IsNullOrEmpty(promotion.TargetCustomerSegments))
        {
            // TODO: Implement customer segment validation when CustomerSegment integration is complete
            // For now, we log and allow - segment validation should be added
            _logger.LogDebug(
                "Promotion {PromotionCode} has customer segment targeting but validation is not yet implemented",
                promotion.Code);
        }

        // Check product category targeting
        if (!string.IsNullOrEmpty(promotion.TargetProductCategories) && productIds != null)
        {
            // TODO: Implement product category validation when full product integration is available
            _logger.LogDebug(
                "Promotion {PromotionCode} has product category targeting but validation is not yet implemented",
                promotion.Code);
        }

        // Check excluded products
        if (!string.IsNullOrEmpty(promotion.ExcludedProducts) && productIds != null)
        {
            var excludedProducts = promotion.ExcludedProducts
                .Split(',', StringSplitOptions.RemoveEmptyEntries)
                .Select(id => Guid.TryParse(id.Trim(), out var guid) ? guid : (Guid?)null)
                .Where(g => g.HasValue)
                .Select(g => g!.Value)
                .ToList();

            var productIdList = productIds.ToList();
            if (excludedProducts.Any() && productIdList.Any(p => excludedProducts.Contains(p)))
            {
                return Result.Failure(
                    Error.Forbidden("Promotion.ExcludedProduct",
                        "Sepetinizdeki bir veya daha fazla ürün bu promosyondan hariç tutulmuştur"));
            }
        }

        return Result.Success();
    }

    private decimal CalculatePromotionDiscount(Promotion promotion, decimal orderAmount, int quantity)
    {
        // Get the first applicable rule - rules are sorted by SortOrder
        var rule = promotion.Rules.FirstOrDefault();
        if (rule == null)
        {
            return 0;
        }

        decimal discountAmount = 0;

        switch (rule.DiscountType)
        {
            case DiscountValueType.Percentage:
                discountAmount = orderAmount * rule.DiscountValue / 100;
                break;

            case DiscountValueType.FixedAmount:
                discountAmount = rule.DiscountValue;
                break;

            case DiscountValueType.FixedPrice:
                // Fixed price means the order total becomes this value
                discountAmount = Math.Max(0, orderAmount - rule.DiscountValue);
                break;
        }

        // Apply maximum discount cap if set
        if (promotion.MaximumDiscountAmount.HasValue && discountAmount > promotion.MaximumDiscountAmount.Value)
        {
            discountAmount = promotion.MaximumDiscountAmount.Value;
        }

        // Ensure discount doesn't exceed order amount
        return Math.Min(discountAmount, orderAmount);
    }

    private FreeProductInfo? GetFreeProductInfo(Promotion promotion)
    {
        var freeProductRule = promotion.Rules
            .FirstOrDefault(r => r.RuleType == PromotionRuleType.FreeProduct ||
                                r.RuleType == PromotionRuleType.BuyXGetYFree);

        if (freeProductRule?.FreeProductId != null && freeProductRule.FreeProductQuantity > 0)
        {
            return new FreeProductInfo
            {
                ProductId = freeProductRule.FreeProductId.Value,
                Quantity = freeProductRule.FreeProductQuantity!.Value
            };
        }

        return null;
    }
}
