using Stocker.Infrastructure.Alerts.Domain;
using Stocker.Infrastructure.Alerts.Interfaces;

namespace Stocker.Infrastructure.Alerts.ModuleHelpers;

/// <summary>
/// Helper class for creating Sales module alerts.
/// Provides typed methods for common Sales alert scenarios.
/// </summary>
public class SalesAlertHelper
{
    private readonly IAlertBuilderFactory _alertBuilderFactory;
    private const string ModuleName = "Sales";

    public SalesAlertHelper(IAlertBuilderFactory alertBuilderFactory)
    {
        _alertBuilderFactory = alertBuilderFactory;
    }

    /// <summary>
    /// Creates an alert for a new sales order.
    /// </summary>
    public Task<AlertEntity> OrderCreatedAsync(
        Guid tenantId,
        Guid orderId,
        string orderNumber,
        string customerName,
        decimal totalAmount,
        string currency,
        CancellationToken cancellationToken = default)
    {
        return _alertBuilderFactory.Create()
            .ForTenant(tenantId)
            .WithCategory(AlertCategory.Order)
            .WithSeverity(AlertSeverity.Info)
            .FromModule(ModuleName)
            .WithContent(
                $"Yeni Sipariş: {orderNumber}",
                $"{customerName} - {totalAmount:N2} {currency} tutarında yeni sipariş oluşturuldu.")
            .WithAction($"/sales/orders/{orderId}", "Siparişi Görüntüle")
            .WithRelatedEntity("SalesOrder", orderId)
            .ForRole("SalesManager")
            .ExpiresIn(TimeSpan.FromDays(7))
            .BuildAndSendAsync(cancellationToken);
    }

    /// <summary>
    /// Creates an alert for order awaiting approval.
    /// </summary>
    public Task<AlertEntity> OrderAwaitingApprovalAsync(
        Guid tenantId,
        Guid orderId,
        string orderNumber,
        string customerName,
        decimal totalAmount,
        CancellationToken cancellationToken = default)
    {
        return _alertBuilderFactory.Create()
            .ForTenant(tenantId)
            .WithCategory(AlertCategory.Order)
            .WithSeverity(AlertSeverity.Medium)
            .FromModule(ModuleName)
            .WithContent(
                $"Onay Bekliyor: {orderNumber}",
                $"{customerName} siparişi onay bekliyor. Tutar: {totalAmount:N2} TL")
            .WithAction($"/sales/orders/{orderId}", "Onayla")
            .WithRelatedEntity("SalesOrder", orderId)
            .ForRole("SalesManager")
            .ExpiresIn(TimeSpan.FromDays(3))
            .BuildAndSendAsync(cancellationToken);
    }

    /// <summary>
    /// Creates an alert for order cancellation.
    /// </summary>
    public Task<AlertEntity> OrderCancelledAsync(
        Guid tenantId,
        Guid orderId,
        string orderNumber,
        string customerName,
        string cancellationReason,
        Guid? salesPersonId = null,
        CancellationToken cancellationToken = default)
    {
        var builder = _alertBuilderFactory.Create()
            .ForTenant(tenantId)
            .WithCategory(AlertCategory.Order)
            .WithSeverity(AlertSeverity.High)
            .FromModule(ModuleName)
            .WithContent(
                $"Sipariş İptal: {orderNumber}",
                $"{customerName} siparişi iptal edildi. Sebep: {cancellationReason}")
            .WithAction($"/sales/orders/{orderId}", "Detayları Gör")
            .WithRelatedEntity("SalesOrder", orderId)
            .ExpiresIn(TimeSpan.FromDays(14));

        if (salesPersonId.HasValue)
            builder.ForUser(salesPersonId.Value);
        else
            builder.ForRole("SalesManager");

        return builder.BuildAndSendAsync(cancellationToken);
    }

    /// <summary>
    /// Creates an alert for invoice payment overdue.
    /// </summary>
    public Task<AlertEntity> InvoiceOverdueAsync(
        Guid tenantId,
        Guid invoiceId,
        string invoiceNumber,
        string customerName,
        decimal amount,
        int daysOverdue,
        Guid? salesPersonId = null,
        CancellationToken cancellationToken = default)
    {
        var severity = daysOverdue > 30 ? AlertSeverity.Critical :
                       daysOverdue > 14 ? AlertSeverity.High : AlertSeverity.Medium;

        var builder = _alertBuilderFactory.Create()
            .ForTenant(tenantId)
            .WithCategory(AlertCategory.Invoice)
            .WithSeverity(severity)
            .FromModule(ModuleName)
            .WithContent(
                $"Vadesi Geçmiş Fatura: {invoiceNumber}",
                $"{customerName} - {amount:N2} TL tutarındaki fatura {daysOverdue} gündür ödenmedi.")
            .WithAction($"/sales/invoices/{invoiceId}", "Faturayı Görüntüle")
            .WithRelatedEntity("Invoice", invoiceId)
            .WithMetadata(new { daysOverdue, amount })
            .ExpiresIn(TimeSpan.FromDays(30));

        if (salesPersonId.HasValue)
            builder.ForUser(salesPersonId.Value);

        return builder.BuildAndSendAsync(cancellationToken);
    }

    /// <summary>
    /// Creates an alert for expiring quotation.
    /// </summary>
    public Task<AlertEntity> QuotationExpiringAsync(
        Guid tenantId,
        Guid quotationId,
        string quotationNumber,
        string customerName,
        int daysUntilExpiry,
        Guid? salesPersonId = null,
        CancellationToken cancellationToken = default)
    {
        var builder = _alertBuilderFactory.Create()
            .ForTenant(tenantId)
            .WithCategory(AlertCategory.Quotation)
            .WithSeverity(daysUntilExpiry <= 3 ? AlertSeverity.High : AlertSeverity.Medium)
            .FromModule(ModuleName)
            .WithContent(
                $"Teklif Süresi Doluyor: {quotationNumber}",
                $"{customerName} için verilen teklif {daysUntilExpiry} gün içinde sona erecek.")
            .WithAction($"/sales/quotations/{quotationId}", "Teklifi Görüntüle")
            .WithRelatedEntity("Quotation", quotationId)
            .ExpiresIn(TimeSpan.FromDays(daysUntilExpiry + 1));

        if (salesPersonId.HasValue)
            builder.ForUser(salesPersonId.Value);

        return builder.BuildAndSendAsync(cancellationToken);
    }

    /// <summary>
    /// Creates an alert for contract expiring.
    /// </summary>
    public Task<AlertEntity> ContractExpiringAsync(
        Guid tenantId,
        Guid contractId,
        string contractNumber,
        string customerName,
        int daysUntilExpiry,
        CancellationToken cancellationToken = default)
    {
        return _alertBuilderFactory.Create()
            .ForTenant(tenantId)
            .WithCategory(AlertCategory.Contract)
            .WithSeverity(daysUntilExpiry <= 7 ? AlertSeverity.High : AlertSeverity.Medium)
            .FromModule(ModuleName)
            .WithContent(
                $"Sözleşme Süresi Doluyor: {contractNumber}",
                $"{customerName} sözleşmesi {daysUntilExpiry} gün içinde sona erecek. Yenileme gerekiyor.")
            .WithAction($"/sales/contracts/{contractId}", "Sözleşmeyi Görüntüle")
            .WithRelatedEntity("CustomerContract", contractId)
            .ForRole("SalesManager")
            .WithEmailNotification(daysUntilExpiry <= 7)
            .ExpiresIn(TimeSpan.FromDays(daysUntilExpiry + 1))
            .BuildAndSendAsync(cancellationToken);
    }

    /// <summary>
    /// Creates an alert for credit limit exceeded.
    /// </summary>
    public Task<AlertEntity> CreditLimitExceededAsync(
        Guid tenantId,
        Guid customerId,
        string customerName,
        decimal creditLimit,
        decimal currentBalance,
        CancellationToken cancellationToken = default)
    {
        var percentUsed = creditLimit > 0 ? (currentBalance / creditLimit) * 100 : 100;

        return _alertBuilderFactory.Create()
            .ForTenant(tenantId)
            .WithCategory(AlertCategory.Credit)
            .WithSeverity(AlertSeverity.High)
            .FromModule(ModuleName)
            .WithContent(
                $"Kredi Limiti Aşıldı: {customerName}",
                $"Müşteri kredi limitini aştı. Limit: {creditLimit:N2} TL, Bakiye: {currentBalance:N2} TL (%{percentUsed:N0})")
            .WithAction($"/crm/customers/{customerId}", "Müşteriyi Görüntüle")
            .WithRelatedEntity("Customer", customerId)
            .WithMetadata(new { creditLimit, currentBalance, percentUsed })
            .ForRole("SalesManager")
            .WithEmailNotification()
            .ExpiresIn(TimeSpan.FromDays(14))
            .BuildAndSendAsync(cancellationToken);
    }

    /// <summary>
    /// Creates an alert for credit limit approaching.
    /// </summary>
    public Task<AlertEntity> CreditLimitApproachingAsync(
        Guid tenantId,
        Guid customerId,
        string customerName,
        decimal creditLimit,
        decimal currentBalance,
        int percentThreshold = 80,
        CancellationToken cancellationToken = default)
    {
        var percentUsed = creditLimit > 0 ? (currentBalance / creditLimit) * 100 : 100;

        return _alertBuilderFactory.Create()
            .ForTenant(tenantId)
            .WithCategory(AlertCategory.Credit)
            .WithSeverity(AlertSeverity.Medium)
            .FromModule(ModuleName)
            .WithContent(
                $"Kredi Limiti Uyarısı: {customerName}",
                $"Müşteri kredi limitinin %{percentThreshold}'ine ulaştı. Limit: {creditLimit:N2} TL, Bakiye: {currentBalance:N2} TL")
            .WithAction($"/crm/customers/{customerId}", "Müşteriyi Görüntüle")
            .WithRelatedEntity("Customer", customerId)
            .ForRole("SalesManager")
            .ExpiresIn(TimeSpan.FromDays(7))
            .BuildAndSendAsync(cancellationToken);
    }

    /// <summary>
    /// Creates an alert for payment received.
    /// </summary>
    public Task<AlertEntity> PaymentReceivedAsync(
        Guid tenantId,
        Guid invoiceId,
        string invoiceNumber,
        string customerName,
        decimal amount,
        Guid? salesPersonId = null,
        CancellationToken cancellationToken = default)
    {
        var builder = _alertBuilderFactory.Create()
            .ForTenant(tenantId)
            .WithCategory(AlertCategory.Payment)
            .WithSeverity(AlertSeverity.Info)
            .FromModule(ModuleName)
            .WithContent(
                $"Ödeme Alındı: {invoiceNumber}",
                $"{customerName} - {amount:N2} TL ödeme alındı.")
            .WithAction($"/sales/invoices/{invoiceId}", "Faturayı Görüntüle")
            .WithRelatedEntity("Invoice", invoiceId)
            .ExpiresIn(TimeSpan.FromDays(3));

        if (salesPersonId.HasValue)
            builder.ForUser(salesPersonId.Value);

        return builder.BuildAndSendAsync(cancellationToken);
    }

    /// <summary>
    /// Creates an alert for back order ready for fulfillment.
    /// </summary>
    public Task<AlertEntity> BackOrderReadyAsync(
        Guid tenantId,
        Guid backOrderId,
        string orderNumber,
        string productName,
        decimal quantity,
        CancellationToken cancellationToken = default)
    {
        return _alertBuilderFactory.Create()
            .ForTenant(tenantId)
            .WithCategory(AlertCategory.Order)
            .WithSeverity(AlertSeverity.Medium)
            .FromModule(ModuleName)
            .WithContent(
                $"Arka Sipariş Hazır: {orderNumber}",
                $"{productName} ({quantity:N0} adet) için stok geldi. Sipariş karşılanabilir.")
            .WithAction($"/sales/backorders/{backOrderId}", "Arka Siparişi Görüntüle")
            .WithRelatedEntity("BackOrder", backOrderId)
            .ForRole("WarehouseManager")
            .ExpiresIn(TimeSpan.FromDays(7))
            .BuildAndSendAsync(cancellationToken);
    }

    /// <summary>
    /// Creates an alert for shipment delivered.
    /// </summary>
    public Task<AlertEntity> ShipmentDeliveredAsync(
        Guid tenantId,
        Guid shipmentId,
        string shipmentNumber,
        string customerName,
        Guid? salesPersonId = null,
        CancellationToken cancellationToken = default)
    {
        var builder = _alertBuilderFactory.Create()
            .ForTenant(tenantId)
            .WithCategory(AlertCategory.Shipment)
            .WithSeverity(AlertSeverity.Info)
            .FromModule(ModuleName)
            .WithContent(
                $"Sevkiyat Teslim Edildi: {shipmentNumber}",
                $"{customerName} sevkiyatı başarıyla teslim edildi.")
            .WithAction($"/sales/shipments/{shipmentId}", "Sevkiyatı Görüntüle")
            .WithRelatedEntity("Shipment", shipmentId)
            .ExpiresIn(TimeSpan.FromDays(3));

        if (salesPersonId.HasValue)
            builder.ForUser(salesPersonId.Value);

        return builder.BuildAndSendAsync(cancellationToken);
    }

    /// <summary>
    /// Creates an alert for return request.
    /// </summary>
    public Task<AlertEntity> ReturnRequestedAsync(
        Guid tenantId,
        Guid returnId,
        string returnNumber,
        string customerName,
        string reason,
        CancellationToken cancellationToken = default)
    {
        return _alertBuilderFactory.Create()
            .ForTenant(tenantId)
            .WithCategory(AlertCategory.Return)
            .WithSeverity(AlertSeverity.High)
            .FromModule(ModuleName)
            .WithContent(
                $"İade Talebi: {returnNumber}",
                $"{customerName} iade talebinde bulundu. Sebep: {reason}")
            .WithAction($"/sales/returns/{returnId}", "İadeyi Görüntüle")
            .WithRelatedEntity("SalesReturn", returnId)
            .ForRole("SalesManager")
            .WithEmailNotification()
            .ExpiresIn(TimeSpan.FromDays(7))
            .BuildAndSendAsync(cancellationToken);
    }
}
