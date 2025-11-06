using Stocker.Modules.CRM.Domain.Entities;
using Stocker.Modules.CRM.Domain.Enums;

namespace Stocker.Modules.CRM.Infrastructure.Repositories;

public interface IDocumentRepository
{
    Task<Document?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    System.Threading.Tasks.Task AddAsync(Document entity, CancellationToken cancellationToken = default);
    System.Threading.Tasks.Task UpdateAsync(Document entity, CancellationToken cancellationToken = default);
    System.Threading.Tasks.Task DeleteAsync(Document entity, CancellationToken cancellationToken = default);
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<Document>> GetByEntityAsync(string entityId, string entityType, CancellationToken cancellationToken = default);
    Task<IEnumerable<Document>> GetByCategoryAsync(DocumentCategory category, CancellationToken cancellationToken = default);
    Task<IEnumerable<Document>> GetByUploadedUserAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<IEnumerable<Document>> GetExpiredDocumentsAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<Document>> GetVersionHistoryAsync(int documentId, CancellationToken cancellationToken = default);
    Task<long> GetTotalStorageSizeAsync(CancellationToken cancellationToken = default);
    Task<long> GetEntityStorageSizeAsync(string entityId, string entityType, CancellationToken cancellationToken = default);
}
