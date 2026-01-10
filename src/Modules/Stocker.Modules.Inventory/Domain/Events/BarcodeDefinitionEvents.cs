using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.Inventory.Domain.Events;

#region BarcodeDefinition Events

/// <summary>
/// Barkod tanımı oluşturulduğunda tetiklenen event.
/// </summary>
public sealed record BarcodeDefinitionCreatedDomainEvent(
    int BarcodeDefinitionId,
    Guid TenantId,
    int ProductId,
    string Barcode,
    string BarcodeType,
    bool IsPrimary) : DomainEvent;

/// <summary>
/// Barkod tanımı güncellendiğinde tetiklenen event.
/// </summary>
public sealed record BarcodeDefinitionUpdatedDomainEvent(
    int BarcodeDefinitionId,
    Guid TenantId,
    int ProductId,
    string Barcode,
    string BarcodeType) : DomainEvent;

/// <summary>
/// Barkod birincil olarak ayarlandığında tetiklenen event.
/// </summary>
public sealed record BarcodeDefinitionSetAsPrimaryDomainEvent(
    int BarcodeDefinitionId,
    Guid TenantId,
    int ProductId,
    string Barcode) : DomainEvent;

/// <summary>
/// Barkod tanımı silindiğinde tetiklenen event.
/// </summary>
public sealed record BarcodeDefinitionDeletedDomainEvent(
    int BarcodeDefinitionId,
    Guid TenantId,
    int ProductId,
    string Barcode) : DomainEvent;

#endregion
