using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.Purchase.Domain.Events;

#region SupplierPayment Events

/// <summary>
/// Tedarikçi ödemesi oluşturulduğunda tetiklenen event
/// </summary>
public sealed record SupplierPaymentCreatedDomainEvent(
    int SupplierPaymentId,
    Guid TenantId,
    string PaymentNumber,
    int SupplierId,
    string SupplierName,
    decimal Amount,
    string Currency,
    string PaymentMethod) : DomainEvent;

/// <summary>
/// Tedarikçi ödemesi onaylandığında tetiklenen event
/// </summary>
public sealed record SupplierPaymentApprovedDomainEvent(
    int SupplierPaymentId,
    Guid TenantId,
    string PaymentNumber,
    int ApprovedById,
    DateTime ApprovedAt) : DomainEvent;

/// <summary>
/// Tedarikçi ödemesi gerçekleştirildiğinde tetiklenen event
/// </summary>
public sealed record SupplierPaymentExecutedDomainEvent(
    int SupplierPaymentId,
    Guid TenantId,
    string PaymentNumber,
    int SupplierId,
    decimal Amount,
    string Currency,
    string TransactionReference,
    DateTime ExecutedAt) : DomainEvent;

/// <summary>
/// Tedarikçi ödeme planı oluşturulduğunda tetiklenen event
/// </summary>
public sealed record SupplierPaymentScheduleCreatedDomainEvent(
    int SupplierPaymentId,
    Guid TenantId,
    int SupplierId,
    string SupplierName,
    int InstallmentCount,
    decimal TotalAmount) : DomainEvent;

#endregion
