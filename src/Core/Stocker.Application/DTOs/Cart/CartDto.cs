using Stocker.Domain.Master.Enums;

namespace Stocker.Application.DTOs.Cart;

/// <summary>
/// Cart DTO for API responses
/// </summary>
public class CartDto
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public Guid? UserId { get; set; }
    public CartStatus Status { get; set; }
    public string StatusDisplay { get; set; } = string.Empty;
    public BillingCycle BillingCycle { get; set; }
    public string BillingCycleDisplay { get; set; } = string.Empty;
    public string Currency { get; set; } = "TRY";
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public bool HasExpired { get; set; }

    // Coupon
    public string? CouponCode { get; set; }
    public decimal DiscountPercent { get; set; }
    public decimal DiscountAmount { get; set; }

    // Items
    public List<CartItemDto> Items { get; set; } = new();
    public int ItemCount { get; set; }
    public bool IsEmpty { get; set; }

    // Calculated totals
    public decimal SubTotal { get; set; }
    public decimal DiscountTotal { get; set; }
    public decimal Total { get; set; }
}

/// <summary>
/// Cart item DTO for API responses
/// </summary>
public class CartItemDto
{
    public Guid Id { get; set; }
    public CartItemType ItemType { get; set; }
    public string ItemTypeDisplay { get; set; } = string.Empty;
    public Guid ItemId { get; set; }
    public string ItemCode { get; set; } = string.Empty;
    public string ItemName { get; set; } = string.Empty;
    public decimal UnitPrice { get; set; }
    public string Currency { get; set; } = "TRY";
    public int Quantity { get; set; }
    public decimal LineTotal { get; set; }

    // Item-specific metadata
    public int? TrialDays { get; set; }
    public decimal? DiscountPercent { get; set; }
    public List<string>? IncludedModuleCodes { get; set; }
    public string? RequiredModuleCode { get; set; }
    public int? StorageGB { get; set; }

    public DateTime AddedAt { get; set; }
}

/// <summary>
/// Request to add a module to cart
/// </summary>
public class AddModuleToCartRequest
{
    public string ModuleCode { get; set; } = string.Empty;
}

/// <summary>
/// Request to add a bundle to cart
/// </summary>
public class AddBundleToCartRequest
{
    public string BundleCode { get; set; } = string.Empty;
}

/// <summary>
/// Request to add an add-on to cart
/// </summary>
public class AddAddOnToCartRequest
{
    public string AddOnCode { get; set; } = string.Empty;
    public int Quantity { get; set; } = 1;
}

/// <summary>
/// Request to add a storage plan to cart
/// </summary>
public class AddStoragePlanToCartRequest
{
    public string PlanCode { get; set; } = string.Empty;
}

/// <summary>
/// Request to add users to cart
/// </summary>
public class AddUsersToCartRequest
{
    public string TierCode { get; set; } = string.Empty;
    public int UserCount { get; set; } = 1;
}

/// <summary>
/// Request to update item quantity
/// </summary>
public class UpdateCartItemQuantityRequest
{
    public Guid ItemId { get; set; }
    public int Quantity { get; set; }
}

/// <summary>
/// Request to apply coupon
/// </summary>
public class ApplyCouponRequest
{
    public string CouponCode { get; set; } = string.Empty;
}
