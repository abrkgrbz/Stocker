namespace Stocker.Modules.Sales.Application.DTOs;

public record CustomerSegmentDto(
    Guid Id,
    string Code,
    string Name,
    string? Description,
    decimal DiscountPercentage,
    decimal? MinimumOrderAmount,
    decimal? MaximumOrderAmount,
    bool AllowSpecialPricing,
    decimal? DefaultCreditLimit,
    int DefaultPaymentTermDays,
    bool RequiresAdvancePayment,
    decimal? AdvancePaymentPercentage,
    string Priority,
    string ServiceLevel,
    int? MaxResponseTimeHours,
    bool HasDedicatedSupport,
    decimal? MinimumAnnualRevenue,
    int? MinimumOrderCount,
    int? MinimumMonthsAsCustomer,
    bool FreeShipping,
    decimal? FreeShippingThreshold,
    bool EarlyAccessToProducts,
    bool ExclusivePromotions,
    string? BenefitsDescription,
    string? Color,
    string? BadgeIcon,
    bool IsActive,
    bool IsDefault,
    int CustomerCount,
    decimal TotalRevenue,
    decimal AverageOrderValue);

public record CustomerSegmentListDto(
    Guid Id,
    string Code,
    string Name,
    string Priority,
    string ServiceLevel,
    decimal DiscountPercentage,
    bool IsActive,
    bool IsDefault,
    int CustomerCount,
    string? Color,
    string? BadgeIcon);

public record CreateCustomerSegmentDto(
    string Code,
    string Name,
    string Priority = "Normal",
    string? Description = null);

public record SetSegmentPricingDto(
    decimal DiscountPercentage,
    decimal? MinimumOrderAmount = null,
    decimal? MaximumOrderAmount = null);

public record SetSegmentCreditTermsDto(
    decimal? CreditLimit = null,
    int PaymentTermDays = 30,
    bool RequiresAdvancePayment = false,
    decimal? AdvancePaymentPercentage = null);

public record SetSegmentServiceLevelDto(
    string Priority,
    string ServiceLevel,
    int? MaxResponseTimeHours = null,
    bool DedicatedSupport = false);

public record SetSegmentEligibilityDto(
    decimal? MinimumAnnualRevenue = null,
    int? MinimumOrderCount = null,
    int? MinimumMonthsAsCustomer = null);

public record SetSegmentBenefitsDto(
    bool FreeShipping = false,
    decimal? FreeShippingThreshold = null,
    bool EarlyAccessToProducts = false,
    bool ExclusivePromotions = false,
    string? BenefitsDescription = null);

public record SetSegmentVisualDto(
    string? Color = null,
    string? BadgeIcon = null);

public record UpdateSegmentDetailsDto(
    string? Name = null,
    string? Description = null);

public record AssignCustomerToSegmentDto(
    Guid CustomerId);
