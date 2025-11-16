using Stocker.Modules.CRM.Domain.Entities;

namespace Stocker.Modules.CRM.Infrastructure.Repositories;

public interface IReminderRepository
{
    System.Threading.Tasks.Task<List<Reminder>> GetByUserIdAsync(Guid userId, bool? pendingOnly = null, CancellationToken cancellationToken = default);
    System.Threading.Tasks.Task<List<Reminder>> GetByAssignedUserIdAsync(Guid assignedUserId, bool? pendingOnly = null, CancellationToken cancellationToken = default);
    System.Threading.Tasks.Task<Reminder?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    System.Threading.Tasks.Task<int> GetPendingCountAsync(Guid userId, CancellationToken cancellationToken = default);
    System.Threading.Tasks.Task<Reminder> CreateAsync(Reminder reminder, CancellationToken cancellationToken = default);
    System.Threading.Tasks.Task UpdateAsync(Reminder reminder, CancellationToken cancellationToken = default);
    System.Threading.Tasks.Task DeleteAsync(int id, CancellationToken cancellationToken = default);
    System.Threading.Tasks.Task<List<Reminder>> GetPagedAsync(Guid userId, int skip, int take, bool? pendingOnly = null, CancellationToken cancellationToken = default);
    System.Threading.Tasks.Task<int> GetTotalCountAsync(Guid userId, bool? pendingOnly = null, CancellationToken cancellationToken = default);
    System.Threading.Tasks.Task<List<Reminder>> GetDueRemindersAsync(CancellationToken cancellationToken = default);
}
