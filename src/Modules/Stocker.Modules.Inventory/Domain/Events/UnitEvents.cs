using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.Inventory.Domain.Events;

#region Unit Events

/// <summary>
/// Birim oluşturulduğunda tetiklenen event.
/// </summary>
public sealed record UnitCreatedDomainEvent(
    int UnitId,
    Guid TenantId,
    string Code,
    string Name,
    string? Symbol,
    bool IsBaseUnit) : DomainEvent;

/// <summary>
/// Birim güncellendiğinde tetiklenen event.
/// </summary>
public sealed record UnitUpdatedDomainEvent(
    int UnitId,
    Guid TenantId,
    string Code,
    string Name,
    string? Symbol) : DomainEvent;

/// <summary>
/// Birim dönüşümü tanımlandığında tetiklenen event.
/// </summary>
public sealed record UnitConversionDefinedDomainEvent(
    int UnitConversionId,
    Guid TenantId,
    int FromUnitId,
    int ToUnitId,
    decimal ConversionFactor) : DomainEvent;

/// <summary>
/// Birim dönüşümü güncellendiğinde tetiklenen event.
/// </summary>
public sealed record UnitConversionUpdatedDomainEvent(
    int UnitConversionId,
    Guid TenantId,
    int FromUnitId,
    int ToUnitId,
    decimal OldFactor,
    decimal NewFactor) : DomainEvent;

/// <summary>
/// Birim silindiğinde tetiklenen event.
/// </summary>
public sealed record UnitDeletedDomainEvent(
    int UnitId,
    Guid TenantId,
    string Code,
    string Name) : DomainEvent;

#endregion
