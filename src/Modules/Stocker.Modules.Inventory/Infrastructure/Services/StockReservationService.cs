using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Inventory.Domain.Entities;
using Stocker.Modules.Inventory.Domain.Enums;
using Stocker.Modules.Inventory.Domain.Services;
using Stocker.Modules.Inventory.Infrastructure.Persistence;

namespace Stocker.Modules.Inventory.Infrastructure.Services;

/// <summary>
/// Stok rezervasyon servisi implementasyonu.
/// </summary>
public class StockReservationService : IStockReservationService
{
    private readonly InventoryDbContext _dbContext;

    public StockReservationService(InventoryDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<StockReservation> CreateReservationAsync(
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
        CancellationToken cancellationToken = default)
    {
        // Stok kontrolü
        var stock = await _dbContext.Stocks
            .FirstOrDefaultAsync(s => s.ProductId == productId && s.WarehouseId == warehouseId, cancellationToken);

        if (stock == null)
            throw new InvalidOperationException($"Ürün {productId} için depo {warehouseId}'de stok bulunamadı.");

        if (stock.AvailableQuantity < quantity)
            throw new InvalidOperationException(
                $"Yetersiz stok. Talep: {quantity}, Kullanılabilir: {stock.AvailableQuantity}");

        // Rezervasyon numarası oluştur
        var reservationNumber = await GenerateReservationNumberAsync(stock.TenantId, cancellationToken);

        // Rezervasyon oluştur
        var reservation = new StockReservation(
            reservationNumber,
            productId,
            warehouseId,
            quantity,
            reservationType,
            createdByUserId,
            expirationDate);

        if (locationId.HasValue)
            reservation.SetLocation(locationId);

        if (!string.IsNullOrEmpty(referenceDocumentType) && !string.IsNullOrEmpty(referenceDocumentNumber))
            reservation.SetReference(referenceDocumentType, referenceDocumentNumber, referenceDocumentId.HasValue ? Guid.Parse(referenceDocumentId.Value.ToString()) : null);

        if (!string.IsNullOrEmpty(notes))
            reservation.SetNotes(notes);

        // Stoğu rezerve et
        stock.ReserveStock(quantity);

        _dbContext.StockReservations.Add(reservation);
        await _dbContext.SaveChangesAsync(cancellationToken);

        // Domain event fırlat
        reservation.RaiseCreatedEvent();

        return reservation;
    }

    public async Task<StockReservation> FulfillReservationAsync(
        int reservationId,
        CancellationToken cancellationToken = default)
    {
        var reservation = await _dbContext.StockReservations
            .FirstOrDefaultAsync(r => r.Id == reservationId, cancellationToken);

        if (reservation == null)
            throw new InvalidOperationException($"Rezervasyon bulunamadı: {reservationId}");

        // Stoğu bul ve rezervasyonu serbest bırak
        var stock = await _dbContext.Stocks
            .FirstOrDefaultAsync(s => s.ProductId == reservation.ProductId && s.WarehouseId == reservation.WarehouseId, cancellationToken);

        if (stock != null && reservation.RemainingQuantity > 0)
        {
            // Rezervasyonu serbest bırak (çünkü stok çıkışı yapılacak)
            stock.ReleaseReservation(reservation.RemainingQuantity);
        }

        // Rezervasyonu karşıla
        reservation.Fulfill();

        await _dbContext.SaveChangesAsync(cancellationToken);

        return reservation;
    }

    public async Task<StockReservation> PartialFulfillReservationAsync(
        int reservationId,
        decimal fulfilledQuantity,
        CancellationToken cancellationToken = default)
    {
        var reservation = await _dbContext.StockReservations
            .FirstOrDefaultAsync(r => r.Id == reservationId, cancellationToken);

        if (reservation == null)
            throw new InvalidOperationException($"Rezervasyon bulunamadı: {reservationId}");

        // Stoğu bul ve kısmi rezervasyonu serbest bırak
        var stock = await _dbContext.Stocks
            .FirstOrDefaultAsync(s => s.ProductId == reservation.ProductId && s.WarehouseId == reservation.WarehouseId, cancellationToken);

        if (stock != null)
        {
            // Kısmi rezervasyonu serbest bırak
            stock.ReleaseReservation(fulfilledQuantity);
        }

        // Kısmi karşılama
        reservation.PartialFulfill(fulfilledQuantity);

        await _dbContext.SaveChangesAsync(cancellationToken);

        return reservation;
    }

    public async Task<StockReservation> CancelReservationAsync(
        int reservationId,
        string cancelledBy,
        CancellationToken cancellationToken = default)
    {
        var reservation = await _dbContext.StockReservations
            .FirstOrDefaultAsync(r => r.Id == reservationId, cancellationToken);

        if (reservation == null)
            throw new InvalidOperationException($"Rezervasyon bulunamadı: {reservationId}");

        // Stoğu bul ve rezervasyonu serbest bırak
        var stock = await _dbContext.Stocks
            .FirstOrDefaultAsync(s => s.ProductId == reservation.ProductId && s.WarehouseId == reservation.WarehouseId, cancellationToken);

        if (stock != null && reservation.RemainingQuantity > 0)
        {
            stock.ReleaseReservation(reservation.RemainingQuantity);
        }

        // Rezervasyonu iptal et
        reservation.Cancel(cancelledBy, "Kullanıcı tarafından iptal edildi");

        await _dbContext.SaveChangesAsync(cancellationToken);

        return reservation;
    }

    public async Task<int> ProcessExpiredReservationsAsync(
        CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;

        // Süresi dolmuş aktif rezervasyonları bul
        var expiredReservations = await _dbContext.StockReservations
            .Where(r => (r.Status == ReservationStatus.Active || r.Status == ReservationStatus.PartiallyFulfilled)
                        && r.ExpirationDate.HasValue
                        && r.ExpirationDate.Value < now)
            .ToListAsync(cancellationToken);

        var processedCount = 0;

        foreach (var reservation in expiredReservations)
        {
            // Stoğu bul ve rezervasyonu serbest bırak
            var stock = await _dbContext.Stocks
                .FirstOrDefaultAsync(s => s.ProductId == reservation.ProductId && s.WarehouseId == reservation.WarehouseId, cancellationToken);

            if (stock != null && reservation.RemainingQuantity > 0)
            {
                stock.ReleaseReservation(reservation.RemainingQuantity);
            }

            // Rezervasyonu expire et
            reservation.Expire();
            processedCount++;
        }

        if (processedCount > 0)
        {
            await _dbContext.SaveChangesAsync(cancellationToken);
        }

        return processedCount;
    }

    public async Task<IReadOnlyList<StockReservation>> GetReservationsByReferenceAsync(
        string referenceDocumentType,
        string referenceDocumentNumber,
        CancellationToken cancellationToken = default)
    {
        return await _dbContext.StockReservations
            .AsNoTracking()
            .Where(r => r.ReferenceDocumentType == referenceDocumentType
                        && r.ReferenceDocumentNumber == referenceDocumentNumber)
            .ToListAsync(cancellationToken);
    }

    public async Task<string> GenerateReservationNumberAsync(
        Guid tenantId,
        CancellationToken cancellationToken = default)
    {
        var today = DateTime.UtcNow;
        var prefix = $"RSV-{today:yyyyMMdd}";

        // Bugünkü son rezervasyon numarasını bul
        var lastReservation = await _dbContext.StockReservations
            .AsNoTracking()
            .Where(r => r.ReservationNumber.StartsWith(prefix))
            .OrderByDescending(r => r.ReservationNumber)
            .FirstOrDefaultAsync(cancellationToken);

        int nextNumber = 1;
        if (lastReservation != null)
        {
            var lastNumber = lastReservation.ReservationNumber.Split('-').LastOrDefault();
            if (int.TryParse(lastNumber, out var parsed))
            {
                nextNumber = parsed + 1;
            }
        }

        return $"{prefix}-{nextNumber:D4}";
    }
}
