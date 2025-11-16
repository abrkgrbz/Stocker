using Stocker.Modules.CRM.Domain.Entities;

namespace Stocker.Modules.CRM.Infrastructure.Repositories;

public interface INotificationRepository
{
    System.Threading.Tasks.Task<List<Notification>> GetByUserIdAsync(Guid userId, bool? unreadOnly = null, CancellationToken cancellationToken = default);
    System.Threading.Tasks.Task<Notification?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    System.Threading.Tasks.Task<int> GetUnreadCountAsync(Guid userId, CancellationToken cancellationToken = default);
    System.Threading.Tasks.Task<Notification> CreateAsync(Notification notification, CancellationToken cancellationToken = default);
    System.Threading.Tasks.Task UpdateAsync(Notification notification, CancellationToken cancellationToken = default);
    System.Threading.Tasks.Task DeleteAsync(int id, CancellationToken cancellationToken = default);
    System.Threading.Tasks.Task<List<Notification>> GetPagedAsync(Guid userId, int skip, int take, bool? unreadOnly = null, CancellationToken cancellationToken = default);
    System.Threading.Tasks.Task<int> GetTotalCountAsync(Guid userId, bool? unreadOnly = null, CancellationToken cancellationToken = default);
}
