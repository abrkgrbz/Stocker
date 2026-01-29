using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;
using Stocker.Application.DTOs.Cart;
using Stocker.Application.Services;
using Stocker.Domain.Master.Entities;
using Stocker.Domain.Master.Enums;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Checkout.Commands.InitiateCheckout;

/// <summary>
/// Ödeme sürecini başlat - sepetten sipariş oluştur ve ödemeye hazırla
/// </summary>
public record InitiateCheckoutCommand : IRequest<Result<CheckoutInitResponse>>
{
    public Guid TenantId { get; init; }
    public BillingAddressDto BillingAddress { get; init; } = new();
    public string? CallbackUrl { get; init; }
}

public class InitiateCheckoutCommandHandler : IRequestHandler<InitiateCheckoutCommand, Result<CheckoutInitResponse>>
{
    private readonly IMasterDbContext _context;
    private readonly IIyzicoService _iyzicoService;
    private readonly ILogger<InitiateCheckoutCommandHandler> _logger;

    public InitiateCheckoutCommandHandler(
        IMasterDbContext context,
        IIyzicoService iyzicoService,
        ILogger<InitiateCheckoutCommandHandler> logger)
    {
        _context = context;
        _iyzicoService = iyzicoService;
        _logger = logger;
    }

    public async Task<Result<CheckoutInitResponse>> Handle(InitiateCheckoutCommand request, CancellationToken cancellationToken)
    {
        // Aktif sepeti getir
        var cart = await _context.SubscriptionCarts
            .Include(c => c.Items)
            .FirstOrDefaultAsync(c =>
                c.TenantId == request.TenantId &&
                c.Status == CartStatus.Active,
                cancellationToken);

        if (cart == null)
        {
            return Result<CheckoutInitResponse>.Failure(Error.NotFound("Sepet.Bulunamadi", "Aktif sepet bulunamadı."));
        }

        if (cart.IsEmpty)
        {
            return Result<CheckoutInitResponse>.Failure(Error.Validation("Sepet.Bos", "Sepet boş."));
        }

        if (cart.HasExpired)
        {
            cart.Expire();
            await _context.SaveChangesAsync(cancellationToken);
            return Result<CheckoutInitResponse>.Failure(Error.Validation("Sepet.SuresiDolmus", "Sepet süresi dolmuş. Lütfen yeni bir sepet oluşturun."));
        }

        // Tenant bilgisini al
        var tenant = await _context.Tenants
            .FirstOrDefaultAsync(t => t.Id == request.TenantId, cancellationToken);

        if (tenant == null)
        {
            return Result<CheckoutInitResponse>.Failure(Error.NotFound("Tenant.Bulunamadi", "Tenant bulunamadı."));
        }

        try
        {
            // Sepette ödeme sürecini başlat
            cart.StartCheckout();

            // Sepetten sipariş oluştur
            var order = SubscriptionOrder.CreateFromCart(cart);

            // Fatura adresini ayarla
            order.SetBillingAddress(
                request.BillingAddress.Name,
                request.BillingAddress.Address,
                request.BillingAddress.City,
                request.BillingAddress.Country,
                request.BillingAddress.ZipCode,
                request.BillingAddress.TaxId);

            _context.SubscriptionOrders.Add(order);
            await _context.SaveChangesAsync(cancellationToken);

            // Iyzico checkout form oluştur
            var iyzicoRequest = new IyzicoCheckoutRequest
            {
                TenantId = request.TenantId,
                CustomerEmail = tenant.ContactEmail.Value,
                CustomerName = request.BillingAddress.Name,
                Price = order.Total.Amount,
                Currency = order.Total.Currency,
                BasketId = order.OrderNumber,
                PaymentGroup = "SUBSCRIPTION",
                CallbackUrl = request.CallbackUrl ?? $"/api/tenant/cart/orders/{order.Id}/callback",
                BillingAddress = new IyzicoAddress
                {
                    ContactName = request.BillingAddress.Name,
                    City = request.BillingAddress.City,
                    Country = request.BillingAddress.Country,
                    Address = request.BillingAddress.Address,
                    ZipCode = request.BillingAddress.ZipCode
                },
                BasketItems = cart.Items.Select(item => new IyzicoBasketItem
                {
                    Id = item.Id.ToString(),
                    Name = item.ItemName,
                    Category1 = item.ItemType.ToString(),
                    ItemType = "VIRTUAL",
                    Price = item.LineTotal.Amount
                }).ToList(),
                EnableInstallment = true,
                Enable3DSecure = true
            };

            var iyzicoResult = await _iyzicoService.CreateCheckoutFormAsync(iyzicoRequest, cancellationToken);

            if (!iyzicoResult.IsSuccess)
            {
                _logger.LogError("Iyzico checkout form oluşturulamadı: {Error}", iyzicoResult.Error.Description);

                // Siparişi iptal et
                order.Cancel("Ödeme formu oluşturulamadı: " + iyzicoResult.Error.Description);
                cart.Abandon();
                await _context.SaveChangesAsync(cancellationToken);

                return Result<CheckoutInitResponse>.Failure(Error.Failure("Odeme.FormOlusturulamadi",
                    "Ödeme formu oluşturulamadı. Lütfen daha sonra tekrar deneyin."));
            }

            // Ödeme bilgilerini siparişe kaydet
            order.InitiatePayment(Domain.Master.Enums.PaymentMethod.Iyzico, null, iyzicoResult.Value.Token);
            await _context.SaveChangesAsync(cancellationToken);

            var response = new CheckoutInitResponse
            {
                OrderId = order.Id,
                OrderNumber = order.OrderNumber,
                Total = order.Total.Amount,
                Currency = order.Total.Currency,
                PaymentProviderOrderId = null,
                CheckoutFormContent = iyzicoResult.Value.CheckoutFormContent,
                CheckoutPageUrl = iyzicoResult.Value.PaymentPageUrl,
                PaymentToken = iyzicoResult.Value.Token
            };

            return Result<CheckoutInitResponse>.Success(response);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogError(ex, "Checkout başlatılırken hata oluştu");
            return Result<CheckoutInitResponse>.Failure(Error.Failure("Odeme.BaslatilamadiHata", ex.Message));
        }
    }
}
