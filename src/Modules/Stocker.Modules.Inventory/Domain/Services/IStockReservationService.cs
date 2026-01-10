using Stocker.Modules.Inventory.Domain.Entities;
using Stocker.Modules.Inventory.Domain.Enums;

namespace Stocker.Modules.Inventory.Domain.Services;

/// <summary>
/// Stok rezervasyon servisi interface'i.
/// Stok rezervasyonlarını yönetir.
/// </summary>
public interface IStockReservationService
{
    /// <summary>
    /// Yeni stok rezervasyonu oluşturur.
    /// </summary>
    Task<StockReservation> CreateReservationAsync(
        int productId,
        int warehouseId,
        int? locationId,
        decimal quantity,
        ReservationType reservationType,
        int createdByUserId,
        DateTime? expirationDate = null,
        string? referenceDocumentType = null,
        string? referenceDocumentNumber = null,
        int? referenceDocumentId = null,
        string? notes = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Rezervasyonu karşılar (tamamlar).
    /// </summary>
    Task<StockReservation> FulfillReservationAsync(
        int reservationId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Rezervasyonu kısmen karşılar.
    /// </summary>
    Task<StockReservation> PartialFulfillReservationAsync(
        int reservationId,
        decimal fulfilledQuantity,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Rezervasyonu iptal eder.
    /// </summary>
    Task<StockReservation> CancelReservationAsync(
        int reservationId,
        string cancelledBy,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Süresi dolmuş rezervasyonları işler.
    /// </summary>
    Task<int> ProcessExpiredReservationsAsync(
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Belirli bir referans belgesi için rezervasyonları getirir.
    /// </summary>
    Task<IReadOnlyList<StockReservation>> GetReservationsByReferenceAsync(
        string referenceDocumentType,
        string referenceDocumentNumber,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Rezervasyon numarası üretir.
    /// </summary>
    Task<string> GenerateReservationNumberAsync(
        Guid tenantId,
        CancellationToken cancellationToken = default);
}
