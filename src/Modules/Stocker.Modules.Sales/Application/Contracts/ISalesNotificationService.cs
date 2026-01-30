namespace Stocker.Modules.Sales.Application.Contracts;

/// <summary>
/// Service for sending sales-related real-time notifications.
/// </summary>
public interface ISalesNotificationService
{
    #region Sales Order Notifications

    /// <summary>
    /// Sends notification when a new sales order is created.
    /// </summary>
    Task NotifySalesOrderCreatedAsync(
        Guid tenantId,
        Guid salesOrderId,
        string orderNumber,
        string customerName,
        decimal totalAmount,
        string currency,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Sends notification when a sales order is confirmed/approved.
    /// </summary>
    Task NotifySalesOrderConfirmedAsync(
        Guid tenantId,
        Guid salesOrderId,
        string orderNumber,
        string confirmedBy,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Sends notification when a sales order is shipped.
    /// </summary>
    Task NotifySalesOrderShippedAsync(
        Guid tenantId,
        Guid salesOrderId,
        string orderNumber,
        string trackingNumber,
        string carrierName,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Sends notification when a sales order is delivered.
    /// </summary>
    Task NotifySalesOrderDeliveredAsync(
        Guid tenantId,
        Guid salesOrderId,
        string orderNumber,
        string receivedBy,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Sends notification when a sales order is cancelled.
    /// </summary>
    Task NotifySalesOrderCancelledAsync(
        Guid tenantId,
        Guid salesOrderId,
        string orderNumber,
        string cancellationReason,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Sends notification when a sales order is partially shipped.
    /// </summary>
    Task NotifySalesOrderPartiallyShippedAsync(
        Guid tenantId,
        Guid salesOrderId,
        string orderNumber,
        int shippedItemCount,
        int totalItemCount,
        decimal shippedPercentage,
        CancellationToken cancellationToken = default);

    #endregion

    #region Quotation Notifications

    /// <summary>
    /// Sends notification when a new quotation is created.
    /// </summary>
    Task NotifyQuotationCreatedAsync(
        Guid tenantId,
        Guid quotationId,
        string quotationNumber,
        string customerName,
        decimal totalAmount,
        string currency,
        DateTime validUntil,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Sends notification when a quotation is sent to customer.
    /// </summary>
    Task NotifyQuotationSentAsync(
        Guid tenantId,
        Guid quotationId,
        string quotationNumber,
        string customerEmail,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Sends notification when a quotation is accepted.
    /// </summary>
    Task NotifyQuotationAcceptedAsync(
        Guid tenantId,
        Guid quotationId,
        string quotationNumber,
        Guid salesOrderId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Sends notification when a quotation is rejected.
    /// </summary>
    Task NotifyQuotationRejectedAsync(
        Guid tenantId,
        Guid quotationId,
        string quotationNumber,
        string rejectionReason,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Sends notification when a quotation expires.
    /// </summary>
    Task NotifyQuotationExpiredAsync(
        Guid tenantId,
        Guid quotationId,
        string quotationNumber,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Sends notification when a quotation is about to expire.
    /// </summary>
    Task NotifyQuotationExpiringAsync(
        Guid tenantId,
        Guid quotationId,
        string quotationNumber,
        int daysUntilExpiry,
        CancellationToken cancellationToken = default);

    #endregion

    #region Invoice Notifications

    /// <summary>
    /// Sends notification when a new invoice is created.
    /// </summary>
    Task NotifyInvoiceCreatedAsync(
        Guid tenantId,
        Guid invoiceId,
        string invoiceNumber,
        string customerName,
        decimal totalAmount,
        string currency,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Sends notification when an invoice is approved.
    /// </summary>
    Task NotifyInvoiceApprovedAsync(
        Guid tenantId,
        Guid invoiceId,
        string invoiceNumber,
        string approvedBy,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Sends notification when an invoice is sent to GİB (e-Invoice).
    /// </summary>
    Task NotifyInvoiceSentToGibAsync(
        Guid tenantId,
        Guid invoiceId,
        string invoiceNumber,
        Guid gibUuid,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Sends notification when an invoice is paid.
    /// </summary>
    Task NotifyInvoicePaidAsync(
        Guid tenantId,
        Guid invoiceId,
        string invoiceNumber,
        decimal paidAmount,
        string currency,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Sends notification when an invoice is cancelled.
    /// </summary>
    Task NotifyInvoiceCancelledAsync(
        Guid tenantId,
        Guid invoiceId,
        string invoiceNumber,
        string cancellationReason,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Sends notification when an invoice is overdue.
    /// </summary>
    Task NotifyInvoiceOverdueAsync(
        Guid tenantId,
        Guid invoiceId,
        string invoiceNumber,
        string customerName,
        decimal outstandingAmount,
        int daysOverdue,
        CancellationToken cancellationToken = default);

    #endregion

    #region Payment Notifications

    /// <summary>
    /// Sends notification when a payment is received.
    /// </summary>
    Task NotifyPaymentReceivedAsync(
        Guid tenantId,
        Guid paymentId,
        string paymentNumber,
        string customerName,
        decimal amount,
        string currency,
        string paymentMethod,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Sends notification when a payment is confirmed.
    /// </summary>
    Task NotifyPaymentConfirmedAsync(
        Guid tenantId,
        Guid paymentId,
        string paymentNumber,
        decimal amount,
        string confirmedBy,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Sends notification when a payment is allocated to an invoice.
    /// </summary>
    Task NotifyPaymentAllocatedAsync(
        Guid tenantId,
        Guid paymentId,
        string paymentNumber,
        Guid invoiceId,
        string invoiceNumber,
        decimal allocatedAmount,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Sends notification when a payment is refunded.
    /// </summary>
    Task NotifyPaymentRefundedAsync(
        Guid tenantId,
        Guid paymentId,
        string paymentNumber,
        decimal refundAmount,
        string refundReason,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Sends notification when a payment fails.
    /// </summary>
    Task NotifyPaymentFailedAsync(
        Guid tenantId,
        Guid paymentId,
        string paymentNumber,
        string customerName,
        decimal amount,
        string failureReason,
        CancellationToken cancellationToken = default);

    #endregion

    #region Shipment Notifications

    /// <summary>
    /// Sends notification when a shipment is created.
    /// </summary>
    Task NotifyShipmentCreatedAsync(
        Guid tenantId,
        Guid shipmentId,
        string shipmentNumber,
        Guid? salesOrderId,
        string carrierName,
        DateTime plannedShipDate,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Sends notification when a shipment is dispatched.
    /// </summary>
    Task NotifyShipmentDispatchedAsync(
        Guid tenantId,
        Guid shipmentId,
        string shipmentNumber,
        string trackingNumber,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Sends notification when shipment status is updated.
    /// </summary>
    Task NotifyShipmentStatusUpdatedAsync(
        Guid tenantId,
        Guid shipmentId,
        string shipmentNumber,
        string currentLocation,
        string status,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Sends notification when a shipment is delivered.
    /// </summary>
    Task NotifyShipmentDeliveredAsync(
        Guid tenantId,
        Guid shipmentId,
        string shipmentNumber,
        string receivedBy,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Sends notification when shipment delivery fails.
    /// </summary>
    Task NotifyShipmentDeliveryFailedAsync(
        Guid tenantId,
        Guid shipmentId,
        string shipmentNumber,
        string failureReason,
        CancellationToken cancellationToken = default);

    #endregion

    #region Sales Return Notifications

    /// <summary>
    /// Sends notification when a sales return is created.
    /// </summary>
    Task NotifySalesReturnCreatedAsync(
        Guid tenantId,
        Guid salesReturnId,
        string returnNumber,
        string customerName,
        string returnReason,
        decimal totalAmount,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Sends notification when a sales return is approved.
    /// </summary>
    Task NotifySalesReturnApprovedAsync(
        Guid tenantId,
        Guid salesReturnId,
        string returnNumber,
        string approvedBy,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Sends notification when returned items are received.
    /// </summary>
    Task NotifySalesReturnReceivedAsync(
        Guid tenantId,
        Guid salesReturnId,
        string returnNumber,
        string receivedBy,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Sends notification when a sales return is refunded.
    /// </summary>
    Task NotifySalesReturnRefundedAsync(
        Guid tenantId,
        Guid salesReturnId,
        string returnNumber,
        Guid creditNoteId,
        decimal refundAmount,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Sends notification when a sales return is rejected.
    /// </summary>
    Task NotifySalesReturnRejectedAsync(
        Guid tenantId,
        Guid salesReturnId,
        string returnNumber,
        string rejectionReason,
        CancellationToken cancellationToken = default);

    #endregion

    #region Credit Note Notifications

    /// <summary>
    /// Sends notification when a credit note is created.
    /// </summary>
    Task NotifyCreditNoteCreatedAsync(
        Guid tenantId,
        Guid creditNoteId,
        string creditNoteNumber,
        string customerName,
        decimal amount,
        string currency,
        string reason,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Sends notification when a credit note is approved.
    /// </summary>
    Task NotifyCreditNoteApprovedAsync(
        Guid tenantId,
        Guid creditNoteId,
        string creditNoteNumber,
        string approvedBy,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Sends notification when a credit note is applied.
    /// </summary>
    Task NotifyCreditNoteAppliedAsync(
        Guid tenantId,
        Guid creditNoteId,
        string creditNoteNumber,
        decimal amount,
        CancellationToken cancellationToken = default);

    #endregion

    #region Warranty Notifications

    /// <summary>
    /// Sends notification when a warranty is registered.
    /// </summary>
    Task NotifyWarrantyRegisteredAsync(
        Guid tenantId,
        Guid warrantyId,
        string warrantyNumber,
        string productName,
        string customerName,
        DateTime startDate,
        DateTime endDate,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Sends notification when a warranty claim is created.
    /// </summary>
    Task NotifyWarrantyClaimCreatedAsync(
        Guid tenantId,
        Guid warrantyId,
        string warrantyNumber,
        string claimNumber,
        string issueDescription,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Sends notification when a warranty claim is approved.
    /// </summary>
    Task NotifyWarrantyClaimApprovedAsync(
        Guid tenantId,
        Guid warrantyId,
        string claimNumber,
        string resolution,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Sends notification when a warranty claim is rejected.
    /// </summary>
    Task NotifyWarrantyClaimRejectedAsync(
        Guid tenantId,
        Guid warrantyId,
        string claimNumber,
        string rejectionReason,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Sends notification when a warranty is about to expire.
    /// </summary>
    Task NotifyWarrantyExpiringAsync(
        Guid tenantId,
        Guid warrantyId,
        string warrantyNumber,
        string productName,
        string customerName,
        int daysUntilExpiry,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Sends notification when a warranty expires.
    /// </summary>
    Task NotifyWarrantyExpiredAsync(
        Guid tenantId,
        Guid warrantyId,
        string warrantyNumber,
        string productName,
        string customerName,
        CancellationToken cancellationToken = default);

    #endregion

    #region Customer Contract Notifications

    /// <summary>
    /// Sends notification when a customer contract is about to expire.
    /// </summary>
    Task NotifyContractExpiringAsync(
        Guid tenantId,
        Guid contractId,
        string contractNumber,
        string customerName,
        int daysUntilExpiry,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Sends notification when a customer contract is renewed.
    /// </summary>
    Task NotifyContractRenewedAsync(
        Guid tenantId,
        Guid contractId,
        string contractNumber,
        string customerName,
        DateTime newEndDate,
        CancellationToken cancellationToken = default);

    #endregion
}
