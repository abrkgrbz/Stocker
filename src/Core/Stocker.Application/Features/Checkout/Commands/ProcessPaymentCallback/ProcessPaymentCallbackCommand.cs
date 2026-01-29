using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;
using Stocker.Application.Services;
using Stocker.Domain.Master.Enums;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Checkout.Commands.ProcessPaymentCallback;

/// <summary>
/// Iyzico ödeme callback'ini işle
/// </summary>
public record ProcessPaymentCallbackCommand : IRequest<Result<PaymentCallbackResponse>>
{
    public Guid OrderId { get; init; }
    public string Token { get; init; } = string.Empty;
}

public class PaymentCallbackResponse
{
    public bool Success { get; set; }
    public Guid OrderId { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public string? RedirectUrl { get; set; }
    public string? ErrorMessage { get; set; }
}

public class ProcessPaymentCallbackCommandHandler : IRequestHandler<ProcessPaymentCallbackCommand, Result<PaymentCallbackResponse>>
{
    private readonly IMasterDbContext _context;
    private readonly IIyzicoService _iyzicoService;
    private readonly ILogger<ProcessPaymentCallbackCommandHandler> _logger;

    public ProcessPaymentCallbackCommandHandler(
        IMasterDbContext context,
        IIyzicoService iyzicoService,
        ILogger<ProcessPaymentCallbackCommandHandler> logger)
    {
        _context = context;
        _iyzicoService = iyzicoService;
        _logger = logger;
    }

    public async Task<Result<PaymentCallbackResponse>> Handle(ProcessPaymentCallbackCommand request, CancellationToken cancellationToken)
    {
        // Siparişi getir
        var order = await _context.SubscriptionOrders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == request.OrderId, cancellationToken);

        if (order == null)
        {
            return Result<PaymentCallbackResponse>.Failure(Error.NotFound("Siparis.Bulunamadi", "Sipariş bulunamadı."));
        }

        // Token doğrula
        if (order.PaymentProviderToken != request.Token)
        {
            _logger.LogWarning("Geçersiz ödeme token'ı. OrderId: {OrderId}", request.OrderId);
            return Result<PaymentCallbackResponse>.Failure(Error.Validation("Odeme.GecersizToken", "Geçersiz ödeme token'ı."));
        }

        // Sipariş durumunu kontrol et
        if (order.Status != OrderStatus.PaymentProcessing)
        {
            return Result<PaymentCallbackResponse>.Failure(Error.Validation("Siparis.GecersizDurum",
                $"Sipariş ödeme işleme durumunda değil. Mevcut durum: {order.Status}"));
        }

        try
        {
            // Iyzico'dan ödeme sonucunu al
            var paymentResult = await _iyzicoService.GetCheckoutFormResultAsync(request.Token, cancellationToken);

            if (!paymentResult.IsSuccess)
            {
                _logger.LogError("Iyzico ödeme sonucu alınamadı: {Error}", paymentResult.Error.Description);
                order.FailPayment("Ödeme sonucu alınamadı: " + paymentResult.Error.Description);
                await _context.SaveChangesAsync(cancellationToken);

                return Result<PaymentCallbackResponse>.Success(new PaymentCallbackResponse
                {
                    Success = false,
                    OrderId = order.Id,
                    OrderNumber = order.OrderNumber,
                    ErrorMessage = "Ödeme sonucu alınamadı.",
                    RedirectUrl = $"/billing/orders/{order.Id}?status=failed"
                });
            }

            var iyzicoResult = paymentResult.Value;

            if (!iyzicoResult.IsSuccess)
            {
                _logger.LogWarning("Ödeme başarısız. OrderId: {OrderId}, Error: {Error}",
                    request.OrderId, iyzicoResult.ErrorMessage);

                order.FailPayment(iyzicoResult.ErrorMessage ?? "Ödeme başarısız.");
                await _context.SaveChangesAsync(cancellationToken);

                return Result<PaymentCallbackResponse>.Success(new PaymentCallbackResponse
                {
                    Success = false,
                    OrderId = order.Id,
                    OrderNumber = order.OrderNumber,
                    ErrorMessage = iyzicoResult.ErrorMessage ?? "Ödeme başarısız.",
                    RedirectUrl = $"/billing/orders/{order.Id}?status=failed"
                });
            }

            // Ödeme başarılı - siparişi güncelle
            _logger.LogInformation("Ödeme başarılı. OrderId: {OrderId}, PaymentId: {PaymentId}",
                request.OrderId, iyzicoResult.PaymentId);

            order.CompletePayment();
            await _context.SaveChangesAsync(cancellationToken);

            return Result<PaymentCallbackResponse>.Success(new PaymentCallbackResponse
            {
                Success = true,
                OrderId = order.Id,
                OrderNumber = order.OrderNumber,
                RedirectUrl = $"/billing/orders/{order.Id}?status=success"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Ödeme callback işlenirken hata oluştu. OrderId: {OrderId}", request.OrderId);

            return Result<PaymentCallbackResponse>.Failure(Error.Failure("Odeme.CallbackHatasi",
                "Ödeme işlenirken bir hata oluştu. Lütfen destek ile iletişime geçin."));
        }
    }
}
