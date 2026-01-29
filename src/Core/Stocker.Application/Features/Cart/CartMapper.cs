using Stocker.Application.DTOs.Cart;
using Stocker.Domain.Master.Entities;
using Stocker.Domain.Master.Enums;

namespace Stocker.Application.Features.Cart;

/// <summary>
/// Shared mapper for Cart entities to DTOs
/// </summary>
public static class CartMapper
{
    public static CartDto MapToDto(SubscriptionCart cart)
    {
        return new CartDto
        {
            Id = cart.Id,
            TenantId = cart.TenantId,
            UserId = cart.UserId,
            Status = cart.Status,
            StatusDisplay = GetStatusDisplay(cart.Status),
            BillingCycle = cart.BillingCycle,
            BillingCycleDisplay = GetBillingCycleDisplay(cart.BillingCycle),
            Currency = cart.Currency,
            CreatedAt = cart.CreatedAt,
            UpdatedAt = cart.UpdatedAt,
            ExpiresAt = cart.ExpiresAt,
            HasExpired = cart.HasExpired,
            CouponCode = cart.CouponCode,
            DiscountPercent = cart.DiscountPercent,
            DiscountAmount = cart.DiscountAmount,
            Items = cart.Items.Select(MapItemToDto).ToList(),
            ItemCount = cart.ItemCount,
            IsEmpty = cart.IsEmpty,
            SubTotal = cart.SubTotal.Amount,
            DiscountTotal = cart.DiscountTotal.Amount,
            Total = cart.Total.Amount
        };
    }

    public static CartItemDto MapItemToDto(SubscriptionCartItem item)
    {
        return new CartItemDto
        {
            Id = item.Id,
            ItemType = item.ItemType,
            ItemTypeDisplay = GetItemTypeDisplay(item.ItemType),
            ItemId = item.ItemId,
            ItemCode = item.ItemCode,
            ItemName = item.ItemName,
            UnitPrice = item.UnitPrice.Amount,
            Currency = item.UnitPrice.Currency,
            Quantity = item.Quantity,
            LineTotal = item.LineTotal.Amount,
            TrialDays = item.TrialDays,
            DiscountPercent = item.DiscountPercent,
            IncludedModuleCodes = item.IncludedModuleCodes,
            RequiredModuleCode = item.RequiredModuleCode,
            StorageGB = item.StorageGB,
            AddedAt = item.AddedAt
        };
    }

    public static OrderDto MapToDto(SubscriptionOrder order)
    {
        return new OrderDto
        {
            Id = order.Id,
            OrderNumber = order.OrderNumber,
            TenantId = order.TenantId,
            UserId = order.UserId,
            CartId = order.CartId,
            SubscriptionId = order.SubscriptionId,
            Status = order.Status,
            StatusDisplay = GetOrderStatusDisplay(order.Status),
            BillingCycle = order.BillingCycle,
            BillingCycleDisplay = GetBillingCycleDisplay(order.BillingCycle),
            SubTotal = order.SubTotal.Amount,
            DiscountTotal = order.DiscountTotal.Amount,
            TaxAmount = order.TaxAmount.Amount,
            Total = order.Total.Amount,
            Currency = order.Total.Currency,
            CouponCode = order.CouponCode,
            CouponDiscountPercent = order.CouponDiscountPercent,
            PaymentMethod = (Domain.Master.Enums.PaymentMethod?)order.PaymentMethod,
            PaymentMethodDisplay = order.PaymentMethod?.ToString(),
            PaymentProviderOrderId = order.PaymentProviderOrderId,
            PaymentInitiatedAt = order.PaymentInitiatedAt,
            PaymentCompletedAt = order.PaymentCompletedAt,
            PaymentFailureReason = order.PaymentFailureReason,
            CreatedAt = order.CreatedAt,
            CompletedAt = order.CompletedAt,
            CancelledAt = order.CancelledAt,
            CancellationReason = order.CancellationReason,
            BillingName = order.BillingName,
            BillingAddress = order.BillingAddress,
            BillingCity = order.BillingCity,
            BillingCountry = order.BillingCountry,
            BillingZipCode = order.BillingZipCode,
            TaxId = order.TaxId,
            Items = order.Items.Select(MapOrderItemToDto).ToList()
        };
    }

    public static OrderItemDto MapOrderItemToDto(SubscriptionOrderItem item)
    {
        return new OrderItemDto
        {
            Id = item.Id,
            ItemType = item.ItemType,
            ItemTypeDisplay = GetItemTypeDisplay(item.ItemType),
            ItemId = item.ItemId,
            ItemCode = item.ItemCode,
            ItemName = item.ItemName,
            UnitPrice = item.UnitPrice.Amount,
            Quantity = item.Quantity,
            LineTotal = item.LineTotal.Amount,
            Currency = item.UnitPrice.Currency,
            IsActivated = item.IsActivated,
            ActivatedAt = item.ActivatedAt,
            ActivationError = item.ActivationError,
            TrialDays = item.TrialDays,
            DiscountPercent = item.DiscountPercent,
            IncludedModuleCodes = item.IncludedModuleCodes,
            RequiredModuleCode = item.RequiredModuleCode,
            StorageGB = item.StorageGB
        };
    }

    public static string GetStatusDisplay(CartStatus status) => status switch
    {
        CartStatus.Active => "Aktif",
        CartStatus.CheckoutPending => "Ödeme Bekleniyor",
        CartStatus.Completed => "Tamamlandı",
        CartStatus.Expired => "Süresi Doldu",
        CartStatus.Abandoned => "Terk Edildi",
        _ => status.ToString()
    };

    public static string GetOrderStatusDisplay(OrderStatus status) => status switch
    {
        OrderStatus.Pending => "Beklemede",
        OrderStatus.PaymentProcessing => "Ödeme İşleniyor",
        OrderStatus.PaymentCompleted => "Ödeme Tamamlandı",
        OrderStatus.PaymentFailed => "Ödeme Başarısız",
        OrderStatus.Activating => "Aktivasyon Yapılıyor",
        OrderStatus.Completed => "Tamamlandı",
        OrderStatus.Cancelled => "İptal Edildi",
        OrderStatus.RefundRequested => "İade Talep Edildi",
        OrderStatus.Refunded => "İade Edildi",
        _ => status.ToString()
    };

    public static string GetBillingCycleDisplay(BillingCycle cycle) => cycle switch
    {
        BillingCycle.Aylik => "Aylık",
        BillingCycle.UcAylik => "3 Aylık",
        BillingCycle.AltiAylik => "6 Aylık",
        BillingCycle.Yillik => "Yıllık",
        _ => cycle.ToString()
    };

    public static string GetItemTypeDisplay(CartItemType type) => type switch
    {
        CartItemType.Module => "Modül",
        CartItemType.Bundle => "Paket",
        CartItemType.AddOn => "Ek Özellik",
        CartItemType.StoragePlan => "Depolama Planı",
        CartItemType.Users => "Kullanıcı",
        _ => type.ToString()
    };
}
