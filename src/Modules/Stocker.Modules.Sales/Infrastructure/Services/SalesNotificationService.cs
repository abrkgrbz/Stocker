using Microsoft.Extensions.Logging;
using Stocker.Modules.Sales.Application.Contracts;
using Stocker.SignalR.Models.Notifications;
using Stocker.SignalR.Services.Interfaces;

namespace Stocker.Modules.Sales.Infrastructure.Services;

/// <summary>
/// SignalR-based implementation of sales notification service.
/// </summary>
public class SalesNotificationService : ISalesNotificationService
{
    private readonly INotificationService _notificationService;
    private readonly ILogger<SalesNotificationService> _logger;

    public SalesNotificationService(
        INotificationService notificationService,
        ILogger<SalesNotificationService> logger)
    {
        _notificationService = notificationService;
        _logger = logger;
    }

    #region Sales Order Notifications

    public async Task NotifySalesOrderCreatedAsync(
        Guid tenantId,
        Guid salesOrderId,
        string orderNumber,
        string customerName,
        decimal totalAmount,
        string currency,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "Yeni Satış Siparişi",
                Message = $"{orderNumber} numaralı sipariş oluşturuldu. Müşteri: {customerName}, Tutar: {totalAmount:N2} {currency}",
                Type = NotificationType.Order,
                Priority = NotificationPriority.Normal,
                ActionUrl = $"/sales/orders/{salesOrderId}",
                Icon = "shopping-cart",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "sales_order_created",
                    ["salesOrderId"] = salesOrderId,
                    ["orderNumber"] = orderNumber,
                    ["customerName"] = customerName,
                    ["totalAmount"] = totalAmount,
                    ["currency"] = currency
                }
            };

            await _notificationService.SendToTenantAsync(tenantId.ToString(), notification);
            _logger.LogInformation("Sales order created notification sent for {OrderNumber} in tenant {TenantId}", orderNumber, tenantId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send sales order created notification for {OrderNumber}", orderNumber);
        }
    }

    public async Task NotifySalesOrderConfirmedAsync(
        Guid tenantId,
        Guid salesOrderId,
        string orderNumber,
        string confirmedBy,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "Sipariş Onaylandı",
                Message = $"{orderNumber} numaralı sipariş {confirmedBy} tarafından onaylandı.",
                Type = NotificationType.Order,
                Priority = NotificationPriority.Normal,
                ActionUrl = $"/sales/orders/{salesOrderId}",
                Icon = "check-circle",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "sales_order_confirmed",
                    ["salesOrderId"] = salesOrderId,
                    ["orderNumber"] = orderNumber,
                    ["confirmedBy"] = confirmedBy
                }
            };

            await _notificationService.SendToTenantAsync(tenantId.ToString(), notification);
            _logger.LogInformation("Sales order confirmed notification sent for {OrderNumber} in tenant {TenantId}", orderNumber, tenantId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send sales order confirmed notification for {OrderNumber}", orderNumber);
        }
    }

    public async Task NotifySalesOrderShippedAsync(
        Guid tenantId,
        Guid salesOrderId,
        string orderNumber,
        string trackingNumber,
        string carrierName,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "Sipariş Sevk Edildi",
                Message = $"{orderNumber} numaralı sipariş sevk edildi. Kargo: {carrierName}, Takip No: {trackingNumber}",
                Type = NotificationType.Order,
                Priority = NotificationPriority.Normal,
                ActionUrl = $"/sales/orders/{salesOrderId}",
                Icon = "truck",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "sales_order_shipped",
                    ["salesOrderId"] = salesOrderId,
                    ["orderNumber"] = orderNumber,
                    ["trackingNumber"] = trackingNumber,
                    ["carrierName"] = carrierName
                }
            };

            await _notificationService.SendToTenantAsync(tenantId.ToString(), notification);
            _logger.LogInformation("Sales order shipped notification sent for {OrderNumber} in tenant {TenantId}", orderNumber, tenantId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send sales order shipped notification for {OrderNumber}", orderNumber);
        }
    }

    public async Task NotifySalesOrderDeliveredAsync(
        Guid tenantId,
        Guid salesOrderId,
        string orderNumber,
        string receivedBy,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "Sipariş Teslim Edildi",
                Message = $"{orderNumber} numaralı sipariş {receivedBy} tarafından teslim alındı.",
                Type = NotificationType.Order,
                Priority = NotificationPriority.Normal,
                ActionUrl = $"/sales/orders/{salesOrderId}",
                Icon = "package-check",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "sales_order_delivered",
                    ["salesOrderId"] = salesOrderId,
                    ["orderNumber"] = orderNumber,
                    ["receivedBy"] = receivedBy
                }
            };

            await _notificationService.SendToTenantAsync(tenantId.ToString(), notification);
            _logger.LogInformation("Sales order delivered notification sent for {OrderNumber} in tenant {TenantId}", orderNumber, tenantId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send sales order delivered notification for {OrderNumber}", orderNumber);
        }
    }

    public async Task NotifySalesOrderCancelledAsync(
        Guid tenantId,
        Guid salesOrderId,
        string orderNumber,
        string cancellationReason,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "Sipariş İptal Edildi",
                Message = $"{orderNumber} numaralı sipariş iptal edildi. Sebep: {cancellationReason}",
                Type = NotificationType.Order,
                Priority = NotificationPriority.High,
                ActionUrl = $"/sales/orders/{salesOrderId}",
                Icon = "x-circle",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "sales_order_cancelled",
                    ["salesOrderId"] = salesOrderId,
                    ["orderNumber"] = orderNumber,
                    ["cancellationReason"] = cancellationReason
                }
            };

            await _notificationService.SendToTenantAsync(tenantId.ToString(), notification);
            _logger.LogWarning("Sales order cancelled notification sent for {OrderNumber} in tenant {TenantId}", orderNumber, tenantId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send sales order cancelled notification for {OrderNumber}", orderNumber);
        }
    }

    public async Task NotifySalesOrderPartiallyShippedAsync(
        Guid tenantId,
        Guid salesOrderId,
        string orderNumber,
        int shippedItemCount,
        int totalItemCount,
        decimal shippedPercentage,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "Sipariş Kısmen Sevk Edildi",
                Message = $"{orderNumber} numaralı sipariş kısmen sevk edildi. Sevk: {shippedItemCount}/{totalItemCount} (%{shippedPercentage:N0})",
                Type = NotificationType.Order,
                Priority = NotificationPriority.Normal,
                ActionUrl = $"/sales/orders/{salesOrderId}",
                Icon = "truck",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "sales_order_partially_shipped",
                    ["salesOrderId"] = salesOrderId,
                    ["orderNumber"] = orderNumber,
                    ["shippedItemCount"] = shippedItemCount,
                    ["totalItemCount"] = totalItemCount,
                    ["shippedPercentage"] = shippedPercentage
                }
            };

            await _notificationService.SendToTenantAsync(tenantId.ToString(), notification);
            _logger.LogInformation("Sales order partially shipped notification sent for {OrderNumber} in tenant {TenantId}", orderNumber, tenantId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send sales order partially shipped notification for {OrderNumber}", orderNumber);
        }
    }

    #endregion

    #region Quotation Notifications

    public async Task NotifyQuotationCreatedAsync(
        Guid tenantId,
        Guid quotationId,
        string quotationNumber,
        string customerName,
        decimal totalAmount,
        string currency,
        DateTime validUntil,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "Yeni Teklif Oluşturuldu",
                Message = $"{quotationNumber} numaralı teklif oluşturuldu. Müşteri: {customerName}, Tutar: {totalAmount:N2} {currency}, Geçerlilik: {validUntil:dd.MM.yyyy}",
                Type = NotificationType.Order,
                Priority = NotificationPriority.Normal,
                ActionUrl = $"/sales/quotations/{quotationId}",
                Icon = "file-text",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "quotation_created",
                    ["quotationId"] = quotationId,
                    ["quotationNumber"] = quotationNumber,
                    ["customerName"] = customerName,
                    ["totalAmount"] = totalAmount,
                    ["currency"] = currency,
                    ["validUntil"] = validUntil.ToString("yyyy-MM-dd")
                }
            };

            await _notificationService.SendToTenantAsync(tenantId.ToString(), notification);
            _logger.LogInformation("Quotation created notification sent for {QuotationNumber} in tenant {TenantId}", quotationNumber, tenantId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send quotation created notification for {QuotationNumber}", quotationNumber);
        }
    }

    public async Task NotifyQuotationSentAsync(
        Guid tenantId,
        Guid quotationId,
        string quotationNumber,
        string customerEmail,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "Teklif Gönderildi",
                Message = $"{quotationNumber} numaralı teklif {customerEmail} adresine gönderildi.",
                Type = NotificationType.Order,
                Priority = NotificationPriority.Normal,
                ActionUrl = $"/sales/quotations/{quotationId}",
                Icon = "send",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "quotation_sent",
                    ["quotationId"] = quotationId,
                    ["quotationNumber"] = quotationNumber,
                    ["customerEmail"] = customerEmail
                }
            };

            await _notificationService.SendToTenantAsync(tenantId.ToString(), notification);
            _logger.LogInformation("Quotation sent notification sent for {QuotationNumber} in tenant {TenantId}", quotationNumber, tenantId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send quotation sent notification for {QuotationNumber}", quotationNumber);
        }
    }

    public async Task NotifyQuotationAcceptedAsync(
        Guid tenantId,
        Guid quotationId,
        string quotationNumber,
        Guid salesOrderId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "Teklif Kabul Edildi",
                Message = $"{quotationNumber} numaralı teklif kabul edildi ve siparişe dönüştürüldü.",
                Type = NotificationType.Order,
                Priority = NotificationPriority.High,
                ActionUrl = $"/sales/orders/{salesOrderId}",
                Icon = "check-circle",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "quotation_accepted",
                    ["quotationId"] = quotationId,
                    ["quotationNumber"] = quotationNumber,
                    ["salesOrderId"] = salesOrderId
                }
            };

            await _notificationService.SendToTenantAsync(tenantId.ToString(), notification);
            _logger.LogInformation("Quotation accepted notification sent for {QuotationNumber} in tenant {TenantId}", quotationNumber, tenantId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send quotation accepted notification for {QuotationNumber}", quotationNumber);
        }
    }

    public async Task NotifyQuotationRejectedAsync(
        Guid tenantId,
        Guid quotationId,
        string quotationNumber,
        string rejectionReason,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "Teklif Reddedildi",
                Message = $"{quotationNumber} numaralı teklif reddedildi. Sebep: {rejectionReason}",
                Type = NotificationType.Order,
                Priority = NotificationPriority.Normal,
                ActionUrl = $"/sales/quotations/{quotationId}",
                Icon = "x-circle",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "quotation_rejected",
                    ["quotationId"] = quotationId,
                    ["quotationNumber"] = quotationNumber,
                    ["rejectionReason"] = rejectionReason
                }
            };

            await _notificationService.SendToTenantAsync(tenantId.ToString(), notification);
            _logger.LogInformation("Quotation rejected notification sent for {QuotationNumber} in tenant {TenantId}", quotationNumber, tenantId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send quotation rejected notification for {QuotationNumber}", quotationNumber);
        }
    }

    public async Task NotifyQuotationExpiredAsync(
        Guid tenantId,
        Guid quotationId,
        string quotationNumber,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "Teklif Süresi Doldu",
                Message = $"{quotationNumber} numaralı teklifin geçerlilik süresi doldu.",
                Type = NotificationType.Order,
                Priority = NotificationPriority.Normal,
                ActionUrl = $"/sales/quotations/{quotationId}",
                Icon = "clock",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "quotation_expired",
                    ["quotationId"] = quotationId,
                    ["quotationNumber"] = quotationNumber
                }
            };

            await _notificationService.SendToTenantAsync(tenantId.ToString(), notification);
            _logger.LogInformation("Quotation expired notification sent for {QuotationNumber} in tenant {TenantId}", quotationNumber, tenantId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send quotation expired notification for {QuotationNumber}", quotationNumber);
        }
    }

    public async Task NotifyQuotationExpiringAsync(
        Guid tenantId,
        Guid quotationId,
        string quotationNumber,
        int daysUntilExpiry,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "Teklif Süresi Doluyor",
                Message = $"{quotationNumber} numaralı teklifin süresi {daysUntilExpiry} gün içinde dolacak.",
                Type = NotificationType.Order,
                Priority = daysUntilExpiry <= 3 ? NotificationPriority.High : NotificationPriority.Normal,
                ActionUrl = $"/sales/quotations/{quotationId}",
                Icon = "alert-triangle",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "quotation_expiring",
                    ["quotationId"] = quotationId,
                    ["quotationNumber"] = quotationNumber,
                    ["daysUntilExpiry"] = daysUntilExpiry
                }
            };

            await _notificationService.SendToTenantAsync(tenantId.ToString(), notification);
            _logger.LogInformation("Quotation expiring notification sent for {QuotationNumber} in tenant {TenantId}", quotationNumber, tenantId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send quotation expiring notification for {QuotationNumber}", quotationNumber);
        }
    }

    #endregion

    #region Invoice Notifications

    public async Task NotifyInvoiceCreatedAsync(
        Guid tenantId,
        Guid invoiceId,
        string invoiceNumber,
        string customerName,
        decimal totalAmount,
        string currency,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "Yeni Fatura Oluşturuldu",
                Message = $"{invoiceNumber} numaralı fatura oluşturuldu. Müşteri: {customerName}, Tutar: {totalAmount:N2} {currency}",
                Type = NotificationType.Payment,
                Priority = NotificationPriority.Normal,
                ActionUrl = $"/sales/invoices/{invoiceId}",
                Icon = "file-invoice",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "invoice_created",
                    ["invoiceId"] = invoiceId,
                    ["invoiceNumber"] = invoiceNumber,
                    ["customerName"] = customerName,
                    ["totalAmount"] = totalAmount,
                    ["currency"] = currency
                }
            };

            await _notificationService.SendToTenantAsync(tenantId.ToString(), notification);
            _logger.LogInformation("Invoice created notification sent for {InvoiceNumber} in tenant {TenantId}", invoiceNumber, tenantId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send invoice created notification for {InvoiceNumber}", invoiceNumber);
        }
    }

    public async Task NotifyInvoiceApprovedAsync(
        Guid tenantId,
        Guid invoiceId,
        string invoiceNumber,
        string approvedBy,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "Fatura Onaylandı",
                Message = $"{invoiceNumber} numaralı fatura {approvedBy} tarafından onaylandı.",
                Type = NotificationType.Payment,
                Priority = NotificationPriority.Normal,
                ActionUrl = $"/sales/invoices/{invoiceId}",
                Icon = "check-circle",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "invoice_approved",
                    ["invoiceId"] = invoiceId,
                    ["invoiceNumber"] = invoiceNumber,
                    ["approvedBy"] = approvedBy
                }
            };

            await _notificationService.SendToTenantAsync(tenantId.ToString(), notification);
            _logger.LogInformation("Invoice approved notification sent for {InvoiceNumber} in tenant {TenantId}", invoiceNumber, tenantId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send invoice approved notification for {InvoiceNumber}", invoiceNumber);
        }
    }

    public async Task NotifyInvoiceSentToGibAsync(
        Guid tenantId,
        Guid invoiceId,
        string invoiceNumber,
        Guid gibUuid,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "E-Fatura Gönderildi",
                Message = $"{invoiceNumber} numaralı e-fatura GİB'e gönderildi. UUID: {gibUuid}",
                Type = NotificationType.Payment,
                Priority = NotificationPriority.Normal,
                ActionUrl = $"/sales/invoices/{invoiceId}",
                Icon = "send",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "invoice_sent_to_gib",
                    ["invoiceId"] = invoiceId,
                    ["invoiceNumber"] = invoiceNumber,
                    ["gibUuid"] = gibUuid
                }
            };

            await _notificationService.SendToTenantAsync(tenantId.ToString(), notification);
            _logger.LogInformation("Invoice sent to GIB notification sent for {InvoiceNumber} in tenant {TenantId}", invoiceNumber, tenantId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send invoice sent to GIB notification for {InvoiceNumber}", invoiceNumber);
        }
    }

    public async Task NotifyInvoicePaidAsync(
        Guid tenantId,
        Guid invoiceId,
        string invoiceNumber,
        Guid paymentId,
        decimal paidAmount,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "Fatura Ödendi",
                Message = $"{invoiceNumber} numaralı fatura ödendi. Ödenen tutar: {paidAmount:N2}",
                Type = NotificationType.Payment,
                Priority = NotificationPriority.Normal,
                ActionUrl = $"/sales/invoices/{invoiceId}",
                Icon = "credit-card",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "invoice_paid",
                    ["invoiceId"] = invoiceId,
                    ["invoiceNumber"] = invoiceNumber,
                    ["paymentId"] = paymentId,
                    ["paidAmount"] = paidAmount
                }
            };

            await _notificationService.SendToTenantAsync(tenantId.ToString(), notification);
            _logger.LogInformation("Invoice paid notification sent for {InvoiceNumber} in tenant {TenantId}", invoiceNumber, tenantId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send invoice paid notification for {InvoiceNumber}", invoiceNumber);
        }
    }

    public async Task NotifyInvoiceCancelledAsync(
        Guid tenantId,
        Guid invoiceId,
        string invoiceNumber,
        string cancellationReason,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "Fatura İptal Edildi",
                Message = $"{invoiceNumber} numaralı fatura iptal edildi. Sebep: {cancellationReason}",
                Type = NotificationType.Payment,
                Priority = NotificationPriority.High,
                ActionUrl = $"/sales/invoices/{invoiceId}",
                Icon = "x-circle",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "invoice_cancelled",
                    ["invoiceId"] = invoiceId,
                    ["invoiceNumber"] = invoiceNumber,
                    ["cancellationReason"] = cancellationReason
                }
            };

            await _notificationService.SendToTenantAsync(tenantId.ToString(), notification);
            _logger.LogWarning("Invoice cancelled notification sent for {InvoiceNumber} in tenant {TenantId}", invoiceNumber, tenantId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send invoice cancelled notification for {InvoiceNumber}", invoiceNumber);
        }
    }

    public async Task NotifyInvoiceOverdueAsync(
        Guid tenantId,
        Guid invoiceId,
        string invoiceNumber,
        Guid? customerId,
        decimal outstandingAmount,
        int daysOverdue,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "Vadesi Geçmiş Fatura",
                Message = $"{invoiceNumber} numaralı faturanın vadesi {daysOverdue} gün geçti. Kalan: {outstandingAmount:N2}",
                Type = NotificationType.Payment,
                Priority = daysOverdue > 30 ? NotificationPriority.Urgent : NotificationPriority.High,
                ActionUrl = $"/sales/invoices/{invoiceId}",
                Icon = "alert-triangle",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "invoice_overdue",
                    ["invoiceId"] = invoiceId,
                    ["invoiceNumber"] = invoiceNumber,
                    ["customerId"] = customerId?.ToString() ?? string.Empty,
                    ["outstandingAmount"] = outstandingAmount,
                    ["daysOverdue"] = daysOverdue
                }
            };

            await _notificationService.SendToTenantAsync(tenantId.ToString(), notification);
            _logger.LogWarning("Invoice overdue notification sent for {InvoiceNumber} in tenant {TenantId}", invoiceNumber, tenantId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send invoice overdue notification for {InvoiceNumber}", invoiceNumber);
        }
    }

    #endregion

    #region Payment Notifications

    public async Task NotifyPaymentReceivedAsync(
        Guid tenantId,
        Guid paymentId,
        string paymentNumber,
        string customerName,
        decimal amount,
        string currency,
        string paymentMethod,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "Ödeme Alındı",
                Message = $"{customerName}'den {amount:N2} {currency} ödeme alındı. Yöntem: {paymentMethod}",
                Type = NotificationType.Payment,
                Priority = NotificationPriority.Normal,
                ActionUrl = $"/sales/payments/{paymentId}",
                Icon = "banknotes",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "payment_received",
                    ["paymentId"] = paymentId,
                    ["paymentNumber"] = paymentNumber,
                    ["customerName"] = customerName,
                    ["amount"] = amount,
                    ["currency"] = currency,
                    ["paymentMethod"] = paymentMethod
                }
            };

            await _notificationService.SendToTenantAsync(tenantId.ToString(), notification);
            _logger.LogInformation("Payment received notification sent for {PaymentNumber} in tenant {TenantId}", paymentNumber, tenantId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send payment received notification for {PaymentNumber}", paymentNumber);
        }
    }

    public async Task NotifyPaymentConfirmedAsync(
        Guid tenantId,
        Guid paymentId,
        string paymentNumber,
        decimal amount,
        string confirmedBy,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "Ödeme Onaylandı",
                Message = $"{paymentNumber} numaralı ödeme ({amount:N2}) {confirmedBy} tarafından onaylandı.",
                Type = NotificationType.Payment,
                Priority = NotificationPriority.Normal,
                ActionUrl = $"/sales/payments/{paymentId}",
                Icon = "check-circle",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "payment_confirmed",
                    ["paymentId"] = paymentId,
                    ["paymentNumber"] = paymentNumber,
                    ["amount"] = amount,
                    ["confirmedBy"] = confirmedBy
                }
            };

            await _notificationService.SendToTenantAsync(tenantId.ToString(), notification);
            _logger.LogInformation("Payment confirmed notification sent for {PaymentNumber} in tenant {TenantId}", paymentNumber, tenantId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send payment confirmed notification for {PaymentNumber}", paymentNumber);
        }
    }

    public async Task NotifyPaymentAllocatedAsync(
        Guid tenantId,
        Guid paymentId,
        string paymentNumber,
        Guid invoiceId,
        string invoiceNumber,
        decimal allocatedAmount,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "Ödeme Eşleştirildi",
                Message = $"{paymentNumber} ödemesinden {allocatedAmount:N2} tutar {invoiceNumber} faturasına eşleştirildi.",
                Type = NotificationType.Payment,
                Priority = NotificationPriority.Normal,
                ActionUrl = $"/sales/payments/{paymentId}",
                Icon = "link",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "payment_allocated",
                    ["paymentId"] = paymentId,
                    ["paymentNumber"] = paymentNumber,
                    ["invoiceId"] = invoiceId,
                    ["invoiceNumber"] = invoiceNumber,
                    ["allocatedAmount"] = allocatedAmount
                }
            };

            await _notificationService.SendToTenantAsync(tenantId.ToString(), notification);
            _logger.LogInformation("Payment allocated notification sent for {PaymentNumber} in tenant {TenantId}", paymentNumber, tenantId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send payment allocated notification for {PaymentNumber}", paymentNumber);
        }
    }

    public async Task NotifyPaymentRefundedAsync(
        Guid tenantId,
        Guid paymentId,
        string paymentNumber,
        decimal refundAmount,
        string refundReason,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "Ödeme İade Edildi",
                Message = $"{paymentNumber} numaralı ödemeden {refundAmount:N2} iade edildi. Sebep: {refundReason}",
                Type = NotificationType.Payment,
                Priority = NotificationPriority.High,
                ActionUrl = $"/sales/payments/{paymentId}",
                Icon = "rotate-ccw",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "payment_refunded",
                    ["paymentId"] = paymentId,
                    ["paymentNumber"] = paymentNumber,
                    ["refundAmount"] = refundAmount,
                    ["refundReason"] = refundReason
                }
            };

            await _notificationService.SendToTenantAsync(tenantId.ToString(), notification);
            _logger.LogInformation("Payment refunded notification sent for {PaymentNumber} in tenant {TenantId}", paymentNumber, tenantId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send payment refunded notification for {PaymentNumber}", paymentNumber);
        }
    }

    public async Task NotifyPaymentFailedAsync(
        Guid tenantId,
        Guid paymentId,
        string paymentNumber,
        Guid? customerId,
        decimal amount,
        string failureReason,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "Ödeme Başarısız",
                Message = $"{amount:N2} tutar ödeme başarısız oldu. Sebep: {failureReason}",
                Type = NotificationType.Payment,
                Priority = NotificationPriority.High,
                ActionUrl = $"/sales/payments/{paymentId}",
                Icon = "alert-circle",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "payment_failed",
                    ["paymentId"] = paymentId,
                    ["paymentNumber"] = paymentNumber,
                    ["customerId"] = customerId?.ToString() ?? string.Empty,
                    ["amount"] = amount,
                    ["failureReason"] = failureReason
                }
            };

            await _notificationService.SendToTenantAsync(tenantId.ToString(), notification);
            _logger.LogWarning("Payment failed notification sent for {PaymentNumber} in tenant {TenantId}", paymentNumber, tenantId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send payment failed notification for {PaymentNumber}", paymentNumber);
        }
    }

    #endregion

    #region Shipment Notifications

    public async Task NotifyShipmentCreatedAsync(
        Guid tenantId,
        Guid shipmentId,
        string shipmentNumber,
        Guid? salesOrderId,
        string carrierName,
        DateTime plannedShipDate,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "Yeni Sevkiyat Oluşturuldu",
                Message = $"{shipmentNumber} numaralı sevkiyat oluşturuldu. Kargo: {carrierName}, Planlanan Tarih: {plannedShipDate:dd.MM.yyyy}",
                Type = NotificationType.Order,
                Priority = NotificationPriority.Normal,
                ActionUrl = $"/sales/shipments/{shipmentId}",
                Icon = "package",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "shipment_created",
                    ["shipmentId"] = shipmentId,
                    ["shipmentNumber"] = shipmentNumber,
                    ["salesOrderId"] = salesOrderId?.ToString() ?? string.Empty,
                    ["carrierName"] = carrierName,
                    ["plannedShipDate"] = plannedShipDate.ToString("yyyy-MM-dd")
                }
            };

            await _notificationService.SendToTenantAsync(tenantId.ToString(), notification);
            _logger.LogInformation("Shipment created notification sent for {ShipmentNumber} in tenant {TenantId}", shipmentNumber, tenantId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send shipment created notification for {ShipmentNumber}", shipmentNumber);
        }
    }

    public async Task NotifyShipmentDispatchedAsync(
        Guid tenantId,
        Guid shipmentId,
        string shipmentNumber,
        string trackingNumber,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "Sevkiyat Gönderildi",
                Message = $"{shipmentNumber} numaralı sevkiyat gönderildi. Takip No: {trackingNumber}",
                Type = NotificationType.Order,
                Priority = NotificationPriority.Normal,
                ActionUrl = $"/sales/shipments/{shipmentId}",
                Icon = "truck",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "shipment_dispatched",
                    ["shipmentId"] = shipmentId,
                    ["shipmentNumber"] = shipmentNumber,
                    ["trackingNumber"] = trackingNumber
                }
            };

            await _notificationService.SendToTenantAsync(tenantId.ToString(), notification);
            _logger.LogInformation("Shipment dispatched notification sent for {ShipmentNumber} in tenant {TenantId}", shipmentNumber, tenantId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send shipment dispatched notification for {ShipmentNumber}", shipmentNumber);
        }
    }

    public async Task NotifyShipmentStatusUpdatedAsync(
        Guid tenantId,
        Guid shipmentId,
        string shipmentNumber,
        string currentLocation,
        string status,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "Sevkiyat Durumu Güncellendi",
                Message = $"{shipmentNumber} sevkiyatı: {status}. Konum: {currentLocation}",
                Type = NotificationType.Order,
                Priority = NotificationPriority.Normal,
                ActionUrl = $"/sales/shipments/{shipmentId}",
                Icon = "map-pin",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "shipment_status_updated",
                    ["shipmentId"] = shipmentId,
                    ["shipmentNumber"] = shipmentNumber,
                    ["currentLocation"] = currentLocation,
                    ["status"] = status
                }
            };

            await _notificationService.SendToTenantAsync(tenantId.ToString(), notification);
            _logger.LogInformation("Shipment status updated notification sent for {ShipmentNumber} in tenant {TenantId}", shipmentNumber, tenantId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send shipment status updated notification for {ShipmentNumber}", shipmentNumber);
        }
    }

    public async Task NotifyShipmentDeliveredAsync(
        Guid tenantId,
        Guid shipmentId,
        string shipmentNumber,
        string receivedBy,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "Sevkiyat Teslim Edildi",
                Message = $"{shipmentNumber} numaralı sevkiyat {receivedBy} tarafından teslim alındı.",
                Type = NotificationType.Order,
                Priority = NotificationPriority.Normal,
                ActionUrl = $"/sales/shipments/{shipmentId}",
                Icon = "package-check",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "shipment_delivered",
                    ["shipmentId"] = shipmentId,
                    ["shipmentNumber"] = shipmentNumber,
                    ["receivedBy"] = receivedBy
                }
            };

            await _notificationService.SendToTenantAsync(tenantId.ToString(), notification);
            _logger.LogInformation("Shipment delivered notification sent for {ShipmentNumber} in tenant {TenantId}", shipmentNumber, tenantId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send shipment delivered notification for {ShipmentNumber}", shipmentNumber);
        }
    }

    public async Task NotifyShipmentDeliveryFailedAsync(
        Guid tenantId,
        Guid shipmentId,
        string shipmentNumber,
        string failureReason,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "Teslimat Başarısız",
                Message = $"{shipmentNumber} numaralı sevkiyat teslim edilemedi. Sebep: {failureReason}",
                Type = NotificationType.Order,
                Priority = NotificationPriority.High,
                ActionUrl = $"/sales/shipments/{shipmentId}",
                Icon = "alert-triangle",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "shipment_delivery_failed",
                    ["shipmentId"] = shipmentId,
                    ["shipmentNumber"] = shipmentNumber,
                    ["failureReason"] = failureReason
                }
            };

            await _notificationService.SendToTenantAsync(tenantId.ToString(), notification);
            _logger.LogWarning("Shipment delivery failed notification sent for {ShipmentNumber} in tenant {TenantId}", shipmentNumber, tenantId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send shipment delivery failed notification for {ShipmentNumber}", shipmentNumber);
        }
    }

    #endregion

    #region Sales Return Notifications

    public async Task NotifySalesReturnCreatedAsync(
        Guid tenantId,
        Guid salesReturnId,
        string returnNumber,
        string customerName,
        string returnReason,
        decimal totalAmount,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "Yeni İade Talebi",
                Message = $"{returnNumber} numaralı iade talebi oluşturuldu. Müşteri: {customerName}, Sebep: {returnReason}",
                Type = NotificationType.Order,
                Priority = NotificationPriority.High,
                ActionUrl = $"/sales/returns/{salesReturnId}",
                Icon = "rotate-ccw",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "sales_return_created",
                    ["salesReturnId"] = salesReturnId,
                    ["returnNumber"] = returnNumber,
                    ["customerName"] = customerName,
                    ["returnReason"] = returnReason,
                    ["totalAmount"] = totalAmount
                }
            };

            await _notificationService.SendToTenantAsync(tenantId.ToString(), notification);
            _logger.LogInformation("Sales return created notification sent for {ReturnNumber} in tenant {TenantId}", returnNumber, tenantId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send sales return created notification for {ReturnNumber}", returnNumber);
        }
    }

    public async Task NotifySalesReturnApprovedAsync(
        Guid tenantId,
        Guid salesReturnId,
        string returnNumber,
        string approvedBy,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "İade Onaylandı",
                Message = $"{returnNumber} numaralı iade {approvedBy} tarafından onaylandı.",
                Type = NotificationType.Order,
                Priority = NotificationPriority.Normal,
                ActionUrl = $"/sales/returns/{salesReturnId}",
                Icon = "check-circle",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "sales_return_approved",
                    ["salesReturnId"] = salesReturnId,
                    ["returnNumber"] = returnNumber,
                    ["approvedBy"] = approvedBy
                }
            };

            await _notificationService.SendToTenantAsync(tenantId.ToString(), notification);
            _logger.LogInformation("Sales return approved notification sent for {ReturnNumber} in tenant {TenantId}", returnNumber, tenantId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send sales return approved notification for {ReturnNumber}", returnNumber);
        }
    }

    public async Task NotifySalesReturnReceivedAsync(
        Guid tenantId,
        Guid salesReturnId,
        string returnNumber,
        string receivedBy,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "İade Ürünleri Teslim Alındı",
                Message = $"{returnNumber} numaralı iade ürünleri {receivedBy} tarafından teslim alındı.",
                Type = NotificationType.Order,
                Priority = NotificationPriority.Normal,
                ActionUrl = $"/sales/returns/{salesReturnId}",
                Icon = "package-check",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "sales_return_received",
                    ["salesReturnId"] = salesReturnId,
                    ["returnNumber"] = returnNumber,
                    ["receivedBy"] = receivedBy
                }
            };

            await _notificationService.SendToTenantAsync(tenantId.ToString(), notification);
            _logger.LogInformation("Sales return received notification sent for {ReturnNumber} in tenant {TenantId}", returnNumber, tenantId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send sales return received notification for {ReturnNumber}", returnNumber);
        }
    }

    public async Task NotifySalesReturnRefundedAsync(
        Guid tenantId,
        Guid salesReturnId,
        string returnNumber,
        Guid creditNoteId,
        decimal refundAmount,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "İade Tutarı Ödendi",
                Message = $"{returnNumber} numaralı iade için {refundAmount:N2} tutarında alacak dekontu oluşturuldu.",
                Type = NotificationType.Payment,
                Priority = NotificationPriority.Normal,
                ActionUrl = $"/sales/returns/{salesReturnId}",
                Icon = "credit-card",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "sales_return_refunded",
                    ["salesReturnId"] = salesReturnId,
                    ["returnNumber"] = returnNumber,
                    ["creditNoteId"] = creditNoteId,
                    ["refundAmount"] = refundAmount
                }
            };

            await _notificationService.SendToTenantAsync(tenantId.ToString(), notification);
            _logger.LogInformation("Sales return refunded notification sent for {ReturnNumber} in tenant {TenantId}", returnNumber, tenantId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send sales return refunded notification for {ReturnNumber}", returnNumber);
        }
    }

    public async Task NotifySalesReturnRejectedAsync(
        Guid tenantId,
        Guid salesReturnId,
        string returnNumber,
        string rejectionReason,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "İade Reddedildi",
                Message = $"{returnNumber} numaralı iade reddedildi. Sebep: {rejectionReason}",
                Type = NotificationType.Order,
                Priority = NotificationPriority.Normal,
                ActionUrl = $"/sales/returns/{salesReturnId}",
                Icon = "x-circle",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "sales_return_rejected",
                    ["salesReturnId"] = salesReturnId,
                    ["returnNumber"] = returnNumber,
                    ["rejectionReason"] = rejectionReason
                }
            };

            await _notificationService.SendToTenantAsync(tenantId.ToString(), notification);
            _logger.LogInformation("Sales return rejected notification sent for {ReturnNumber} in tenant {TenantId}", returnNumber, tenantId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send sales return rejected notification for {ReturnNumber}", returnNumber);
        }
    }

    #endregion

    #region Credit Note Notifications

    public async Task NotifyCreditNoteCreatedAsync(
        Guid tenantId,
        Guid creditNoteId,
        string creditNoteNumber,
        string customerName,
        decimal amount,
        string currency,
        string reason,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "Yeni Alacak Dekontu",
                Message = $"{creditNoteNumber} numaralı alacak dekontu oluşturuldu. Müşteri: {customerName}, Tutar: {amount:N2} {currency}",
                Type = NotificationType.Payment,
                Priority = NotificationPriority.Normal,
                ActionUrl = $"/sales/credit-notes/{creditNoteId}",
                Icon = "file-minus",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "credit_note_created",
                    ["creditNoteId"] = creditNoteId,
                    ["creditNoteNumber"] = creditNoteNumber,
                    ["customerName"] = customerName,
                    ["amount"] = amount,
                    ["currency"] = currency,
                    ["reason"] = reason
                }
            };

            await _notificationService.SendToTenantAsync(tenantId.ToString(), notification);
            _logger.LogInformation("Credit note created notification sent for {CreditNoteNumber} in tenant {TenantId}", creditNoteNumber, tenantId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send credit note created notification for {CreditNoteNumber}", creditNoteNumber);
        }
    }

    public async Task NotifyCreditNoteApprovedAsync(
        Guid tenantId,
        Guid creditNoteId,
        string creditNoteNumber,
        string approvedBy,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "Alacak Dekontu Onaylandı",
                Message = $"{creditNoteNumber} numaralı alacak dekontu {approvedBy} tarafından onaylandı.",
                Type = NotificationType.Payment,
                Priority = NotificationPriority.Normal,
                ActionUrl = $"/sales/credit-notes/{creditNoteId}",
                Icon = "check-circle",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "credit_note_approved",
                    ["creditNoteId"] = creditNoteId,
                    ["creditNoteNumber"] = creditNoteNumber,
                    ["approvedBy"] = approvedBy
                }
            };

            await _notificationService.SendToTenantAsync(tenantId.ToString(), notification);
            _logger.LogInformation("Credit note approved notification sent for {CreditNoteNumber} in tenant {TenantId}", creditNoteNumber, tenantId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send credit note approved notification for {CreditNoteNumber}", creditNoteNumber);
        }
    }

    public async Task NotifyCreditNoteAppliedAsync(
        Guid tenantId,
        Guid creditNoteId,
        string creditNoteNumber,
        decimal amount,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "Alacak Dekontu Uygulandı",
                Message = $"{creditNoteNumber} numaralı alacak dekontundan {amount:N2} tutar uygulandı.",
                Type = NotificationType.Payment,
                Priority = NotificationPriority.Normal,
                ActionUrl = $"/sales/credit-notes/{creditNoteId}",
                Icon = "check-circle",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "credit_note_applied",
                    ["creditNoteId"] = creditNoteId,
                    ["creditNoteNumber"] = creditNoteNumber,
                    ["amount"] = amount
                }
            };

            await _notificationService.SendToTenantAsync(tenantId.ToString(), notification);
            _logger.LogInformation("Credit note applied notification sent for {CreditNoteNumber} in tenant {TenantId}", creditNoteNumber, tenantId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send credit note applied notification for {CreditNoteNumber}", creditNoteNumber);
        }
    }

    #endregion

    #region Warranty Notifications

    public async Task NotifyWarrantyRegisteredAsync(
        Guid tenantId,
        Guid warrantyId,
        string warrantyNumber,
        string productName,
        string customerName,
        DateTime startDate,
        DateTime endDate,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "Garanti Kaydı Oluşturuldu",
                Message = $"{warrantyNumber} numaralı garanti kaydı oluşturuldu. Ürün: {productName}, Müşteri: {customerName}, Bitiş: {endDate:dd.MM.yyyy}",
                Type = NotificationType.Order,
                Priority = NotificationPriority.Normal,
                ActionUrl = $"/sales/warranty/{warrantyId}",
                Icon = "shield-check",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "warranty_registered",
                    ["warrantyId"] = warrantyId,
                    ["warrantyNumber"] = warrantyNumber,
                    ["productName"] = productName,
                    ["customerName"] = customerName,
                    ["startDate"] = startDate.ToString("yyyy-MM-dd"),
                    ["endDate"] = endDate.ToString("yyyy-MM-dd")
                }
            };

            await _notificationService.SendToTenantAsync(tenantId.ToString(), notification);
            _logger.LogInformation("Warranty registered notification sent for {WarrantyNumber} in tenant {TenantId}", warrantyNumber, tenantId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send warranty registered notification for {WarrantyNumber}", warrantyNumber);
        }
    }

    public async Task NotifyWarrantyClaimCreatedAsync(
        Guid tenantId,
        Guid warrantyId,
        string warrantyNumber,
        string claimNumber,
        string issueDescription,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "Yeni Garanti Talebi",
                Message = $"{claimNumber} numaralı garanti talebi oluşturuldu. Sorun: {issueDescription}",
                Type = NotificationType.Order,
                Priority = NotificationPriority.High,
                ActionUrl = $"/sales/warranty/{warrantyId}",
                Icon = "alert-circle",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "warranty_claim_created",
                    ["warrantyId"] = warrantyId,
                    ["warrantyNumber"] = warrantyNumber,
                    ["claimNumber"] = claimNumber,
                    ["issueDescription"] = issueDescription
                }
            };

            await _notificationService.SendToTenantAsync(tenantId.ToString(), notification);
            _logger.LogInformation("Warranty claim created notification sent for {ClaimNumber} in tenant {TenantId}", claimNumber, tenantId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send warranty claim created notification for {ClaimNumber}", claimNumber);
        }
    }

    public async Task NotifyWarrantyClaimApprovedAsync(
        Guid tenantId,
        Guid warrantyId,
        string claimNumber,
        string resolution,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "Garanti Talebi Onaylandı",
                Message = $"{claimNumber} numaralı garanti talebi onaylandı. Çözüm: {resolution}",
                Type = NotificationType.Order,
                Priority = NotificationPriority.Normal,
                ActionUrl = $"/sales/warranty/{warrantyId}",
                Icon = "check-circle",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "warranty_claim_approved",
                    ["warrantyId"] = warrantyId,
                    ["claimNumber"] = claimNumber,
                    ["resolution"] = resolution
                }
            };

            await _notificationService.SendToTenantAsync(tenantId.ToString(), notification);
            _logger.LogInformation("Warranty claim approved notification sent for {ClaimNumber} in tenant {TenantId}", claimNumber, tenantId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send warranty claim approved notification for {ClaimNumber}", claimNumber);
        }
    }

    public async Task NotifyWarrantyClaimRejectedAsync(
        Guid tenantId,
        Guid warrantyId,
        string claimNumber,
        string rejectionReason,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "Garanti Talebi Reddedildi",
                Message = $"{claimNumber} numaralı garanti talebi reddedildi. Sebep: {rejectionReason}",
                Type = NotificationType.Order,
                Priority = NotificationPriority.Normal,
                ActionUrl = $"/sales/warranty/{warrantyId}",
                Icon = "x-circle",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "warranty_claim_rejected",
                    ["warrantyId"] = warrantyId,
                    ["claimNumber"] = claimNumber,
                    ["rejectionReason"] = rejectionReason
                }
            };

            await _notificationService.SendToTenantAsync(tenantId.ToString(), notification);
            _logger.LogInformation("Warranty claim rejected notification sent for {ClaimNumber} in tenant {TenantId}", claimNumber, tenantId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send warranty claim rejected notification for {ClaimNumber}", claimNumber);
        }
    }

    public async Task NotifyWarrantyExpiringAsync(
        Guid tenantId,
        Guid warrantyId,
        string warrantyNumber,
        string productName,
        string customerName,
        int daysUntilExpiry,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "Garanti Süresi Doluyor",
                Message = $"{warrantyNumber} numaralı garantinin süresi {daysUntilExpiry} gün içinde dolacak. Ürün: {productName}, Müşteri: {customerName}",
                Type = NotificationType.Order,
                Priority = daysUntilExpiry <= 7 ? NotificationPriority.High : NotificationPriority.Normal,
                ActionUrl = $"/sales/warranty/{warrantyId}",
                Icon = "clock",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "warranty_expiring",
                    ["warrantyId"] = warrantyId,
                    ["warrantyNumber"] = warrantyNumber,
                    ["productName"] = productName,
                    ["customerName"] = customerName,
                    ["daysUntilExpiry"] = daysUntilExpiry
                }
            };

            await _notificationService.SendToTenantAsync(tenantId.ToString(), notification);
            _logger.LogInformation("Warranty expiring notification sent for {WarrantyNumber} in tenant {TenantId}", warrantyNumber, tenantId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send warranty expiring notification for {WarrantyNumber}", warrantyNumber);
        }
    }

    public async Task NotifyWarrantyExpiredAsync(
        Guid tenantId,
        Guid warrantyId,
        string warrantyNumber,
        string productName,
        string customerName,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "Garanti Süresi Doldu",
                Message = $"{warrantyNumber} numaralı garantinin süresi doldu. Ürün: {productName}, Müşteri: {customerName}",
                Type = NotificationType.Order,
                Priority = NotificationPriority.Normal,
                ActionUrl = $"/sales/warranty/{warrantyId}",
                Icon = "shield-off",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "warranty_expired",
                    ["warrantyId"] = warrantyId,
                    ["warrantyNumber"] = warrantyNumber,
                    ["productName"] = productName,
                    ["customerName"] = customerName
                }
            };

            await _notificationService.SendToTenantAsync(tenantId.ToString(), notification);
            _logger.LogInformation("Warranty expired notification sent for {WarrantyNumber} in tenant {TenantId}", warrantyNumber, tenantId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send warranty expired notification for {WarrantyNumber}", warrantyNumber);
        }
    }

    #endregion

    #region Customer Contract Notifications

    public async Task NotifyContractExpiringAsync(
        Guid tenantId,
        Guid contractId,
        string contractNumber,
        string customerName,
        int daysUntilExpiry,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "Sözleşme Süresi Doluyor",
                Message = $"{contractNumber} numaralı sözleşmenin süresi {daysUntilExpiry} gün içinde dolacak. Müşteri: {customerName}",
                Type = NotificationType.Order,
                Priority = daysUntilExpiry <= 7 ? NotificationPriority.High : NotificationPriority.Normal,
                ActionUrl = $"/sales/contracts/{contractId}",
                Icon = "file-clock",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "contract_expiring",
                    ["contractId"] = contractId,
                    ["contractNumber"] = contractNumber,
                    ["customerName"] = customerName,
                    ["daysUntilExpiry"] = daysUntilExpiry
                }
            };

            await _notificationService.SendToTenantAsync(tenantId.ToString(), notification);
            _logger.LogInformation("Contract expiring notification sent for {ContractNumber} in tenant {TenantId}", contractNumber, tenantId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send contract expiring notification for {ContractNumber}", contractNumber);
        }
    }

    public async Task NotifyContractRenewedAsync(
        Guid tenantId,
        Guid contractId,
        string contractNumber,
        string customerName,
        DateTime newEndDate,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "Sözleşme Yenilendi",
                Message = $"{contractNumber} numaralı sözleşme yenilendi. Müşteri: {customerName}, Yeni Bitiş: {newEndDate:dd.MM.yyyy}",
                Type = NotificationType.Order,
                Priority = NotificationPriority.Normal,
                ActionUrl = $"/sales/contracts/{contractId}",
                Icon = "refresh-cw",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "contract_renewed",
                    ["contractId"] = contractId,
                    ["contractNumber"] = contractNumber,
                    ["customerName"] = customerName,
                    ["newEndDate"] = newEndDate.ToString("yyyy-MM-dd")
                }
            };

            await _notificationService.SendToTenantAsync(tenantId.ToString(), notification);
            _logger.LogInformation("Contract renewed notification sent for {ContractNumber} in tenant {TenantId}", contractNumber, tenantId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send contract renewed notification for {ContractNumber}", contractNumber);
        }
    }

    #endregion
}
