using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Sales.Domain.Entities;
using Stocker.Modules.Sales.Domain.Repositories;

namespace Stocker.Modules.Sales.Infrastructure.Persistence.Repositories;

public class DeliveryNoteRepository : BaseRepository<DeliveryNote>, IDeliveryNoteRepository
{
    public DeliveryNoteRepository(SalesDbContext context) : base(context)
    {
    }

    public async Task<DeliveryNote?> GetByNumberAsync(string deliveryNoteNumber, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(d => d.Items)
            .FirstOrDefaultAsync(d => d.DeliveryNoteNumber == deliveryNoteNumber, cancellationToken);
    }

    public async Task<DeliveryNote?> GetWithItemsAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(d => d.Items)
            .FirstOrDefaultAsync(d => d.Id == id, cancellationToken);
    }

    public async Task<IReadOnlyList<DeliveryNote>> GetBySalesOrderIdAsync(Guid salesOrderId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(d => d.Items)
            .Where(d => d.SalesOrderId == salesOrderId)
            .OrderByDescending(d => d.DeliveryNoteDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<DeliveryNote>> GetByReceiverIdAsync(Guid receiverId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(d => d.Items)
            .Where(d => d.ReceiverId == receiverId)
            .OrderByDescending(d => d.DeliveryNoteDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<DeliveryNote>> GetByStatusAsync(DeliveryNoteStatus status, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(d => d.Items)
            .Where(d => d.Status == status)
            .OrderByDescending(d => d.DeliveryNoteDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<DeliveryNote>> GetByShipmentIdAsync(Guid shipmentId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(d => d.Items)
            .Where(d => d.ShipmentId == shipmentId)
            .OrderByDescending(d => d.DeliveryNoteDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<int> GetNextSequenceNumberAsync(string series, CancellationToken cancellationToken = default)
    {
        var maxSequence = await _dbSet
            .Where(d => d.Series == series)
            .MaxAsync(d => (int?)d.SequenceNumber, cancellationToken);

        return (maxSequence ?? 0) + 1;
    }
}
