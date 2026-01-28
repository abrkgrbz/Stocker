using Microsoft.EntityFrameworkCore;
using Stocker.Application.Common.Interfaces;
using Stocker.Domain.Common.Entities;
using Stocker.Persistence.Contexts;

namespace Stocker.Persistence.Repositories;

/// <summary>
/// Repository implementation for outbox messages.
/// Uses MasterDbContext as outbox is shared across all tenants.
/// </summary>
public class OutboxRepository : IOutboxRepository
{
    private readonly MasterDbContext _context;

    public OutboxRepository(MasterDbContext context)
    {
        _context = context;
    }

    /// <inheritdoc />
    public async Task AddAsync(OutboxMessage message, CancellationToken cancellationToken = default)
    {
        await _context.OutboxMessages.AddAsync(message, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task AddRangeAsync(IEnumerable<OutboxMessage> messages, CancellationToken cancellationToken = default)
    {
        await _context.OutboxMessages.AddRangeAsync(messages, cancellationToken);
        // Note: SaveChanges is NOT called here - it will be called by the DbContext
        // as part of the same transaction that saves the entity changes
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<OutboxMessage>> GetUnprocessedAsync(int batchSize = 20, CancellationToken cancellationToken = default)
    {
        return await _context.OutboxMessages
            .Where(m => m.ProcessedOnUtc == null)
            .OrderBy(m => m.OccurredOnUtc)
            .Take(batchSize)
            .ToListAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task UpdateAsync(OutboxMessage message, CancellationToken cancellationToken = default)
    {
        _context.OutboxMessages.Update(message);
        await _context.SaveChangesAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<int> DeleteProcessedAsync(DateTime olderThan, CancellationToken cancellationToken = default)
    {
        return await _context.OutboxMessages
            .Where(m => m.ProcessedOnUtc != null && m.ProcessedOnUtc < olderThan)
            .ExecuteDeleteAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<OutboxMessage>> GetFailedAsync(int batchSize = 100, CancellationToken cancellationToken = default)
    {
        return await _context.OutboxMessages
            .Where(m => m.ProcessedOnUtc != null && m.Error != null)
            .OrderByDescending(m => m.ProcessedOnUtc)
            .Take(batchSize)
            .ToListAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<OutboxMessageStats> GetStatsAsync(CancellationToken cancellationToken = default)
    {
        var pending = await _context.OutboxMessages
            .CountAsync(m => m.ProcessedOnUtc == null, cancellationToken);

        var processed = await _context.OutboxMessages
            .CountAsync(m => m.ProcessedOnUtc != null && m.Error == null, cancellationToken);

        var failed = await _context.OutboxMessages
            .CountAsync(m => m.ProcessedOnUtc != null && m.Error != null, cancellationToken);

        var oldestPending = await _context.OutboxMessages
            .Where(m => m.ProcessedOnUtc == null)
            .OrderBy(m => m.OccurredOnUtc)
            .Select(m => (DateTime?)m.OccurredOnUtc)
            .FirstOrDefaultAsync(cancellationToken);

        return new OutboxMessageStats(pending, processed, failed, oldestPending);
    }
}
