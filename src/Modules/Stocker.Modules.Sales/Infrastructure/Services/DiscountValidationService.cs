using Microsoft.Extensions.Logging;
using Stocker.Modules.Sales.Application.Services;
using Stocker.Modules.Sales.Domain.Entities;
using Stocker.Modules.Sales.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Sales.Infrastructure.Services;

/// <summary>
/// Implementation of discount validation service.
/// Ensures all discounts are validated server-side from trusted discount definitions.
/// </summary>
public class DiscountValidationService : IDiscountValidationService
{
    private readonly ISalesUnitOfWork _unitOfWork;
    private readonly ILogger<DiscountValidationService> _logger;

    public DiscountValidationService(
        ISalesUnitOfWork unitOfWork,
        ILogger<DiscountValidationService> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<Result<DiscountValidationResult>> ValidateAndCalculateAsync(
        string couponCode,
        decimal orderAmount,
        int quantity = 1,
        Guid? customerId = null,
        IEnumerable<Guid>? productIds = null,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(couponCode))
        {
            return Result<DiscountValidationResult>.Failure(
                Error.Validation("Discount.CouponCode", "Coupon code is required"));
        }

        var discount = await _unitOfWork.Discounts.GetByCodeAsync(
            couponCode.ToUpperInvariant(), cancellationToken);

        if (discount is null)
        {
            _logger.LogWarning("Invalid coupon code attempted: {CouponCode}", couponCode);
            return Result<DiscountValidationResult>.Failure(
                Error.NotFound("Discount.NotFound", $"Coupon code '{couponCode}' not found"));
        }

        // Validate the discount is valid and applicable
        var validationResult = ValidateDiscountApplicability(
            discount, orderAmount, quantity, customerId, productIds);

        if (!validationResult.IsSuccess)
        {
            return Result<DiscountValidationResult>.Failure(validationResult.Error!);
        }

        // Calculate the discount amount using the entity's logic
        var calculationResult = discount.CalculateDiscount(orderAmount, quantity);
        if (!calculationResult.IsSuccess)
        {
            return Result<DiscountValidationResult>.Failure(calculationResult.Error!);
        }

        var discountAmount = calculationResult.Value;
        var effectiveRate = orderAmount > 0 ? (discountAmount / orderAmount) * 100 : 0;

        _logger.LogInformation(
            "Discount validated: Code={CouponCode}, Amount={DiscountAmount}, Rate={EffectiveRate}%",
            couponCode, discountAmount, effectiveRate);

        return Result<DiscountValidationResult>.Success(new DiscountValidationResult
        {
            DiscountId = discount.Id,
            CouponCode = discount.Code,
            DiscountName = discount.Name,
            DiscountType = discount.Type,
            ValueType = discount.ValueType,
            DiscountValue = discount.Value,
            CalculatedDiscountAmount = discountAmount,
            EffectiveDiscountRate = effectiveRate,
            IsStackable = discount.IsStackable,
            Priority = discount.Priority
        });
    }

    public async Task<Result<DiscountValidationResult>> ValidateAndCalculateMultipleAsync(
        IEnumerable<string> couponCodes,
        decimal orderAmount,
        int quantity = 1,
        Guid? customerId = null,
        IEnumerable<Guid>? productIds = null,
        CancellationToken cancellationToken = default)
    {
        var codes = couponCodes?.ToList() ?? new List<string>();
        if (!codes.Any())
        {
            return Result<DiscountValidationResult>.Failure(
                Error.Validation("Discount.CouponCodes", "At least one coupon code is required"));
        }

        var validatedDiscounts = new List<(Discount Discount, decimal Amount)>();
        decimal currentOrderAmount = orderAmount;

        // Sort by priority (lower first) and validate each
        foreach (var code in codes)
        {
            var discount = await _unitOfWork.Discounts.GetByCodeAsync(
                code.ToUpperInvariant(), cancellationToken);

            if (discount is null)
            {
                return Result<DiscountValidationResult>.Failure(
                    Error.NotFound("Discount.NotFound", $"Coupon code '{code}' not found"));
            }

            // If we have multiple discounts, all must be stackable (except the first)
            if (validatedDiscounts.Any() && !discount.IsStackable)
            {
                return Result<DiscountValidationResult>.Failure(
                    Error.Conflict("Discount.NotStackable",
                        $"Discount '{code}' cannot be combined with other discounts"));
            }

            var validationResult = ValidateDiscountApplicability(
                discount, currentOrderAmount, quantity, customerId, productIds);

            if (!validationResult.IsSuccess)
            {
                return Result<DiscountValidationResult>.Failure(validationResult.Error!);
            }

            var calculationResult = discount.CalculateDiscount(currentOrderAmount, quantity);
            if (!calculationResult.IsSuccess)
            {
                return Result<DiscountValidationResult>.Failure(calculationResult.Error!);
            }

            var discountAmount = calculationResult.Value;
            validatedDiscounts.Add((discount, discountAmount));

            // For stacked discounts, reduce the order amount for subsequent calculations
            currentOrderAmount -= discountAmount;
        }

        var totalDiscountAmount = validatedDiscounts.Sum(d => d.Amount);
        var effectiveRate = orderAmount > 0 ? (totalDiscountAmount / orderAmount) * 100 : 0;
        var primaryDiscount = validatedDiscounts.First().Discount;

        _logger.LogInformation(
            "Multiple discounts validated: Codes={CouponCodes}, TotalAmount={TotalDiscountAmount}",
            string.Join(", ", codes), totalDiscountAmount);

        return Result<DiscountValidationResult>.Success(new DiscountValidationResult
        {
            DiscountId = primaryDiscount.Id,
            CouponCode = string.Join("+", codes),
            DiscountName = string.Join(" + ", validatedDiscounts.Select(d => d.Discount.Name)),
            DiscountType = primaryDiscount.Type,
            ValueType = DiscountValueType.FixedAmount, // Combined discounts are reported as fixed amount
            DiscountValue = totalDiscountAmount,
            CalculatedDiscountAmount = totalDiscountAmount,
            EffectiveDiscountRate = effectiveRate,
            IsStackable = true,
            Priority = validatedDiscounts.Min(d => d.Discount.Priority)
        });
    }

    public async Task<Result<IReadOnlyList<DiscountValidationResult>>> GetApplicableAutomaticDiscountsAsync(
        decimal orderAmount,
        int quantity = 1,
        Guid? customerId = null,
        IEnumerable<Guid>? productIds = null,
        CancellationToken cancellationToken = default)
    {
        var automaticDiscounts = await _unitOfWork.Discounts.GetByTypeAsync(
            DiscountType.Automatic, cancellationToken);

        var applicableDiscounts = new List<DiscountValidationResult>();
        var productIdList = productIds?.ToList();

        foreach (var discount in automaticDiscounts.Where(d => d.IsValid()))
        {
            var validationResult = ValidateDiscountApplicability(
                discount, orderAmount, quantity, customerId, productIdList);

            if (!validationResult.IsSuccess)
            {
                continue; // Skip non-applicable automatic discounts
            }

            var calculationResult = discount.CalculateDiscount(orderAmount, quantity);
            if (!calculationResult.IsSuccess)
            {
                continue;
            }

            var discountAmount = calculationResult.Value;
            var effectiveRate = orderAmount > 0 ? (discountAmount / orderAmount) * 100 : 0;

            applicableDiscounts.Add(new DiscountValidationResult
            {
                DiscountId = discount.Id,
                CouponCode = discount.Code,
                DiscountName = discount.Name,
                DiscountType = discount.Type,
                ValueType = discount.ValueType,
                DiscountValue = discount.Value,
                CalculatedDiscountAmount = discountAmount,
                EffectiveDiscountRate = effectiveRate,
                IsStackable = discount.IsStackable,
                Priority = discount.Priority
            });
        }

        // Sort by priority
        var sortedDiscounts = applicableDiscounts
            .OrderBy(d => d.Priority)
            .ToList();

        _logger.LogInformation(
            "Found {Count} applicable automatic discounts for order amount {OrderAmount}",
            sortedDiscounts.Count, orderAmount);

        return Result<IReadOnlyList<DiscountValidationResult>>.Success(sortedDiscounts);
    }

    public async Task<Result> MarkDiscountUsedAsync(
        Guid discountId,
        CancellationToken cancellationToken = default)
    {
        var discount = await _unitOfWork.Discounts.GetByIdAsync(discountId, cancellationToken);

        if (discount is null)
        {
            return Result.Failure(
                Error.NotFound("Discount.NotFound", "Discount not found"));
        }

        var incrementResult = discount.IncrementUsage();
        if (!incrementResult.IsSuccess)
        {
            return incrementResult;
        }

        _logger.LogInformation(
            "Discount usage incremented: Id={DiscountId}, NewCount={UsageCount}",
            discountId, discount.UsageCount);

        return Result.Success();
    }

    private Result ValidateDiscountApplicability(
        Discount discount,
        decimal orderAmount,
        int quantity,
        Guid? customerId,
        IEnumerable<Guid>? productIds)
    {
        // Check if discount is valid (active, within date range, not exceeded usage)
        if (!discount.IsValid())
        {
            return Result.Failure(
                Error.Conflict("Discount.Invalid", "This discount is no longer valid"));
        }

        // Check minimum order amount
        if (discount.MinimumOrderAmount.HasValue && orderAmount < discount.MinimumOrderAmount.Value)
        {
            return Result.Failure(
                Error.Validation("Discount.MinimumOrderAmount",
                    $"Minimum order amount of {discount.MinimumOrderAmount.Value:C} required"));
        }

        // Check minimum quantity
        if (discount.MinimumQuantity.HasValue && quantity < discount.MinimumQuantity.Value)
        {
            return Result.Failure(
                Error.Validation("Discount.MinimumQuantity",
                    $"Minimum quantity of {discount.MinimumQuantity.Value} required"));
        }

        // Check customer applicability
        if (!string.IsNullOrEmpty(discount.ApplicableCustomerIds) && customerId.HasValue)
        {
            var applicableCustomers = discount.ApplicableCustomerIds
                .Split(',', StringSplitOptions.RemoveEmptyEntries)
                .Select(id => Guid.TryParse(id.Trim(), out var guid) ? guid : (Guid?)null)
                .Where(g => g.HasValue)
                .Select(g => g!.Value)
                .ToList();

            if (applicableCustomers.Any() && !applicableCustomers.Contains(customerId.Value))
            {
                return Result.Failure(
                    Error.Forbidden("Discount.NotApplicable",
                        "This discount is not available for your account"));
            }
        }

        // Check product applicability
        if (!string.IsNullOrEmpty(discount.ApplicableProductIds) && productIds != null)
        {
            var applicableProducts = discount.ApplicableProductIds
                .Split(',', StringSplitOptions.RemoveEmptyEntries)
                .Select(id => Guid.TryParse(id.Trim(), out var guid) ? guid : (Guid?)null)
                .Where(g => g.HasValue)
                .Select(g => g!.Value)
                .ToList();

            var productIdList = productIds.ToList();
            if (applicableProducts.Any() && !productIdList.Any(p => applicableProducts.Contains(p)))
            {
                return Result.Failure(
                    Error.Forbidden("Discount.NotApplicable",
                        "This discount is not applicable to the selected products"));
            }
        }

        // Check excluded products
        if (!string.IsNullOrEmpty(discount.ExcludedProductIds) && productIds != null)
        {
            var excludedProducts = discount.ExcludedProductIds
                .Split(',', StringSplitOptions.RemoveEmptyEntries)
                .Select(id => Guid.TryParse(id.Trim(), out var guid) ? guid : (Guid?)null)
                .Where(g => g.HasValue)
                .Select(g => g!.Value)
                .ToList();

            var productIdList = productIds.ToList();
            if (excludedProducts.Any() && productIdList.Any(p => excludedProducts.Contains(p)))
            {
                return Result.Failure(
                    Error.Forbidden("Discount.ExcludedProduct",
                        "One or more products are excluded from this discount"));
            }
        }

        return Result.Success();
    }
}
