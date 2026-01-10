using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.Purchase.Domain.Events;

#region SupplierEvaluation Events

/// <summary>
/// Tedarikçi değerlendirmesi oluşturulduğunda tetiklenen event
/// </summary>
public sealed record SupplierEvaluationCreatedDomainEvent(
    int SupplierEvaluationId,
    Guid TenantId,
    int SupplierId,
    string SupplierName,
    string EvaluationPeriod,
    decimal OverallScore) : DomainEvent;

/// <summary>
/// Tedarikçi performans puanı güncellendiğinde tetiklenen event
/// </summary>
public sealed record SupplierPerformanceScoreUpdatedDomainEvent(
    int SupplierId,
    Guid TenantId,
    string SupplierName,
    decimal OldScore,
    decimal NewScore,
    string ScoreCategory) : DomainEvent;

/// <summary>
/// Tedarikçi uyarı aldığında tetiklenen event
/// </summary>
public sealed record SupplierWarningIssuedDomainEvent(
    int SupplierId,
    Guid TenantId,
    string SupplierName,
    string WarningType,
    string WarningDescription,
    DateTime IssuedAt) : DomainEvent;

/// <summary>
/// Tedarikçi tercihli statüsü kazandığında tetiklenen event
/// </summary>
public sealed record SupplierPreferredStatusGrantedDomainEvent(
    int SupplierId,
    Guid TenantId,
    string SupplierName,
    DateTime GrantedAt,
    string Reason) : DomainEvent;

#endregion
