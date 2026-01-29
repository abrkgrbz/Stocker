using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;
using Stocker.Application.DTOs.Cart;
using Stocker.Application.Features.Cart;
using Stocker.Domain.Common.ValueObjects;
using Stocker.Domain.Master.Entities;
using Stocker.Domain.Master.Enums;
using Stocker.Domain.Master.Events;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Checkout.Commands.CompleteCheckout;

/// <summary>
/// Başarılı ödemeden sonra checkout'u tamamla - satın alınan özellikleri aktifleştir
/// </summary>
public record CompleteCheckoutCommand : IRequest<Result<OrderDto>>
{
    public Guid OrderId { get; init; }
    public string? PaymentProviderTransactionId { get; init; }
}

public class CompleteCheckoutCommandHandler : IRequestHandler<CompleteCheckoutCommand, Result<OrderDto>>
{
    private readonly IMasterDbContext _context;
    private readonly IPublisher _publisher;
    private readonly ILogger<CompleteCheckoutCommandHandler> _logger;

    public CompleteCheckoutCommandHandler(
        IMasterDbContext context,
        IPublisher publisher,
        ILogger<CompleteCheckoutCommandHandler> logger)
    {
        _context = context;
        _publisher = publisher;
        _logger = logger;
    }

    public async Task<Result<OrderDto>> Handle(CompleteCheckoutCommand request, CancellationToken cancellationToken)
    {
        var order = await _context.SubscriptionOrders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == request.OrderId, cancellationToken);

        if (order == null)
        {
            return Result<OrderDto>.Failure(Error.NotFound("Siparis.Bulunamadi", "Sipariş bulunamadı."));
        }

        // Sipariş durumunu doğrula (PaymentProcessing veya PaymentCompleted olmalı)
        if (order.Status != OrderStatus.PaymentProcessing && order.Status != OrderStatus.PaymentCompleted)
        {
            return Result<OrderDto>.Failure(Error.Validation("Siparis.GecersizDurum",
                $"Sipariş tamamlama için geçerli bir durumda değil. Mevcut durum: {order.Status}"));
        }

        try
        {
            // Ödeme işleniyor durumundaysa önce ödemeyi tamamla
            if (order.Status == OrderStatus.PaymentProcessing)
            {
                order.CompletePayment();
            }

            // Aktivasyon sürecini başlat
            order.StartActivation();
            await _context.SaveChangesAsync(cancellationToken);

            // Tenant için abonelik al veya oluştur
            var subscription = await GetOrCreateSubscriptionAsync(order, cancellationToken);

            // Her sipariş öğesini aktifleştir
            foreach (var item in order.Items)
            {
                try
                {
                    await ActivateOrderItemAsync(subscription, item, cancellationToken);
                    item.MarkAsActivated();
                }
                catch (Exception ex)
                {
                    item.MarkActivationFailed(ex.Message);
                }
            }

            // Siparişi tamamla
            order.Complete(subscription.Id);

            // Sepeti tamamlandı olarak işaretle
            var cart = await _context.SubscriptionCarts
                .FirstOrDefaultAsync(c => c.Id == order.CartId, cancellationToken);

            if (cart != null)
            {
                cart.Complete();
            }

            await _context.SaveChangesAsync(cancellationToken);

            // Aktivasyon event'ini yayınla
            var activatedFeatures = order.Items
                .Where(i => i.IsActivated)
                .Select(i => new ActivatedFeature
                {
                    FeatureType = i.ItemType.ToString(),
                    Code = i.ItemCode,
                    Name = i.ItemName,
                    Quantity = i.Quantity
                })
                .ToList();

            var activationEvent = new SubscriptionActivatedEvent
            {
                SubscriptionId = subscription.Id,
                TenantId = order.TenantId,
                OrderId = order.Id,
                OrderNumber = order.OrderNumber,
                ActivatedFeatures = activatedFeatures
            };

            await _publisher.Publish(activationEvent, cancellationToken);

            _logger.LogInformation("Abonelik aktifleştirildi. TenantId: {TenantId}, OrderId: {OrderId}, Modüller: {Modules}",
                order.TenantId, order.Id, string.Join(", ", activatedFeatures.Select(f => f.Code)));

            return Result<OrderDto>.Success(CartMapper.MapToDto(order));
        }
        catch (Exception ex)
        {
            return Result<OrderDto>.Failure(Error.Failure("Odeme.TamamlanamadiHata", $"Ödeme tamamlanamadı: {ex.Message}"));
        }
    }

    private async Task<Subscription> GetOrCreateSubscriptionAsync(SubscriptionOrder order, CancellationToken cancellationToken)
    {
        // Tenant için mevcut aktif aboneliği bul
        var subscription = await _context.Subscriptions
            .Include(s => s.Modules)
            .FirstOrDefaultAsync(s =>
                s.TenantId == order.TenantId &&
                (s.Status == SubscriptionStatus.Aktif || s.Status == SubscriptionStatus.Deneme),
                cancellationToken);

        if (subscription != null)
        {
            return subscription;
        }

        // Yeni abonelik oluştur
        subscription = Subscription.Create(
            order.TenantId,
            null, // Paket yok - özel abonelik
            order.BillingCycle,
            order.Total,
            DateTime.UtcNow,
            null // Deneme yok
        );

        _context.Subscriptions.Add(subscription);
        await _context.SaveChangesAsync(cancellationToken);

        return subscription;
    }

    private async Task ActivateOrderItemAsync(Subscription subscription, SubscriptionOrderItem item, CancellationToken cancellationToken)
    {
        switch (item.ItemType)
        {
            case CartItemType.Module:
                await ActivateModuleAsync(subscription, item, cancellationToken);
                break;

            case CartItemType.Bundle:
                await ActivateBundleAsync(subscription, item, cancellationToken);
                break;

            case CartItemType.AddOn:
                await ActivateAddOnAsync(subscription, item, cancellationToken);
                break;

            case CartItemType.StoragePlan:
                await ActivateStoragePlanAsync(subscription, item, cancellationToken);
                break;

            case CartItemType.Users:
                await ActivateUsersAsync(subscription, item, cancellationToken);
                break;

            default:
                throw new NotSupportedException($"'{item.ItemType}' öğe türü desteklenmiyor.");
        }
    }

    private Task ActivateModuleAsync(Subscription subscription, SubscriptionOrderItem item, CancellationToken cancellationToken)
    {
        // Modül zaten var mı kontrol et
        if (!subscription.Modules.Any(m => m.ModuleCode == item.ItemCode))
        {
            subscription.AddModule(item.ItemCode, item.ItemName);
        }
        return Task.CompletedTask;
    }

    private Task ActivateBundleAsync(Subscription subscription, SubscriptionOrderItem item, CancellationToken cancellationToken)
    {
        // Paketteki tüm modülleri ekle
        var moduleCodes = item.IncludedModuleCodes ?? new List<string>();
        foreach (var moduleCode in moduleCodes)
        {
            if (!subscription.Modules.Any(m => m.ModuleCode == moduleCode))
            {
                // Fiyatlandırmadan modül adını al (şimdilik kodu ad olarak kullan)
                subscription.AddModule(moduleCode, moduleCode);
            }
        }
        return Task.CompletedTask;
    }

    private async Task ActivateAddOnAsync(Subscription subscription, SubscriptionOrderItem item, CancellationToken cancellationToken)
    {
        // SubscriptionAddOn kaydı oluştur
        var addOn = await _context.AddOns
            .FirstOrDefaultAsync(a => a.Code == item.ItemCode, cancellationToken);

        if (addOn != null)
        {
            var subscriptionAddOn = new SubscriptionAddOn(
                subscription.Id,
                addOn.Id,
                addOn.Code,
                addOn.Name,
                item.UnitPrice,
                item.Quantity);

            _context.SubscriptionAddOns.Add(subscriptionAddOn);
        }
    }

    private Task ActivateStoragePlanAsync(Subscription subscription, SubscriptionOrderItem item, CancellationToken cancellationToken)
    {
        // Abonelik depolama kotasını güncelle
        if (item.StorageGB.HasValue)
        {
            var bucketName = $"tenant-{subscription.TenantId:N}";
            subscription.SetStorageBucket(bucketName, item.StorageGB.Value);
        }
        return Task.CompletedTask;
    }

    private Task ActivateUsersAsync(Subscription subscription, SubscriptionOrderItem item, CancellationToken cancellationToken)
    {
        // Abonelik kullanıcı sayısını güncelle
        subscription.UpdateUserCount(item.Quantity);
        return Task.CompletedTask;
    }
}
