using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Application.Common.Interfaces;
using Stocker.Application.DTOs.Cart;
using Stocker.Domain.Master.Entities;
using Stocker.Domain.Master.Enums;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Cart.Commands.CreateCart;

public class CreateCartCommandHandler : IRequestHandler<CreateCartCommand, Result<CartDto>>
{
    private readonly IMasterDbContext _context;

    public CreateCartCommandHandler(IMasterDbContext context)
    {
        _context = context;
    }

    public async Task<Result<CartDto>> Handle(CreateCartCommand request, CancellationToken cancellationToken)
    {
        // Tenant var mı kontrol et
        var tenantExists = await _context.Tenants
            .AnyAsync(t => t.Id == request.TenantId, cancellationToken);

        if (!tenantExists)
        {
            return Result<CartDto>.Failure(Error.NotFound("Tenant.Bulunamadi", "Tenant bulunamadı."));
        }

        // Bu tenant için mevcut aktif sepet var mı kontrol et
        var existingCart = await _context.SubscriptionCarts
            .FirstOrDefaultAsync(c =>
                c.TenantId == request.TenantId &&
                c.Status == CartStatus.Active,
                cancellationToken);

        if (existingCart != null)
        {
            // Yeni oluşturmak yerine mevcut sepeti döndür
            return Result<CartDto>.Success(MapToDto(existingCart));
        }

        // Yeni sepet oluştur
        var cart = SubscriptionCart.Create(
            request.TenantId,
            request.UserId,
            request.BillingCycle,
            request.Currency);

        _context.SubscriptionCarts.Add(cart);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<CartDto>.Success(MapToDto(cart));
    }

    private static CartDto MapToDto(SubscriptionCart cart)
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

    private static CartItemDto MapItemToDto(SubscriptionCartItem item)
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

    private static string GetStatusDisplay(CartStatus status) => status switch
    {
        CartStatus.Active => "Aktif",
        CartStatus.CheckoutPending => "Ödeme Bekleniyor",
        CartStatus.Completed => "Tamamlandı",
        CartStatus.Expired => "Süresi Doldu",
        CartStatus.Abandoned => "Terk Edildi",
        _ => status.ToString()
    };

    private static string GetBillingCycleDisplay(BillingCycle cycle) => cycle switch
    {
        BillingCycle.Aylik => "Aylık",
        BillingCycle.UcAylik => "3 Aylık",
        BillingCycle.AltiAylik => "6 Aylık",
        BillingCycle.Yillik => "Yıllık",
        _ => cycle.ToString()
    };

    private static string GetItemTypeDisplay(CartItemType type) => type switch
    {
        CartItemType.Module => "Modül",
        CartItemType.Bundle => "Paket",
        CartItemType.AddOn => "Ek Özellik",
        CartItemType.StoragePlan => "Depolama Planı",
        CartItemType.Users => "Kullanıcı",
        _ => type.ToString()
    };
}
