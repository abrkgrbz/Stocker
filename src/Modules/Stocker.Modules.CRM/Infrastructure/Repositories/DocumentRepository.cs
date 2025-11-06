using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.Modules.CRM.Domain.Enums;
using Stocker.Modules.CRM.Infrastructure.Persistence;

namespace Stocker.Modules.CRM.Infrastructure.Repositories;

public class DocumentRepository : IDocumentRepository
{
    private readonly CRMDbContext _context;
    private readonly DbSet<Document> _dbSet;

    public DocumentRepository(CRMDbContext context)
    {
        _context = context;
        _dbSet = context.Set<Document>();
    }

    public async Task<Document?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _dbSet.FindAsync(new object[] { id }, cancellationToken);
    }

    public async System.Threading.Tasks.Task AddAsync(Document entity, CancellationToken cancellationToken = default)
    {
        await _dbSet.AddAsync(entity, cancellationToken);
    }

    public System.Threading.Tasks.Task UpdateAsync(Document entity, CancellationToken cancellationToken = default)
    {
        _dbSet.Update(entity);
        return System.Threading.Tasks.Task.CompletedTask;
    }

    public System.Threading.Tasks.Task DeleteAsync(Document entity, CancellationToken cancellationToken = default)
    {
        _dbSet.Remove(entity);
        return System.Threading.Tasks.Task.CompletedTask;
    }

    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task<IEnumerable<Document>> GetByEntityAsync(
        string entityId,
        string entityType,
        CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(d => d.EntityId == entityId && d.EntityType == entityType && !d.IsArchived)
            .OrderByDescending(d => d.UploadedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Document>> GetByCategoryAsync(
        DocumentCategory category,
        CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(d => d.Category == category && !d.IsArchived)
            .OrderByDescending(d => d.UploadedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Document>> GetByUploadedUserAsync(
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(d => d.UploadedBy == userId && !d.IsArchived)
            .OrderByDescending(d => d.UploadedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Document>> GetExpiredDocumentsAsync(
        CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        return await _dbSet
            .Where(d => d.ExpiresAt.HasValue && d.ExpiresAt.Value <= now && !d.IsArchived)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Document>> GetVersionHistoryAsync(
        int documentId,
        CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(d => d.Id == documentId || d.ParentDocumentId == documentId)
            .OrderByDescending(d => d.Version)
            .ToListAsync(cancellationToken);
    }

    public async Task<long> GetTotalStorageSizeAsync(
        CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(d => !d.IsArchived)
            .SumAsync(d => d.FileSize, cancellationToken);
    }

    public async Task<long> GetEntityStorageSizeAsync(
        string entityId,
        string entityType,
        CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(d => d.EntityId == entityId && d.EntityType == entityType && !d.IsArchived)
            .SumAsync(d => d.FileSize, cancellationToken);
    }
}
