using Stocker.Modules.CRM.Domain.Entities;

namespace Stocker.Modules.CRM.Infrastructure.Repositories;

public interface ICallLogRepository
{
    System.Threading.Tasks.Task<List<CallLog>> GetAllAsync(
        Guid? customerId = null,
        Guid? contactId = null,
        CallDirection? direction = null,
        CallStatus? status = null,
        DateTime? startDate = null,
        DateTime? endDate = null,
        int skip = 0,
        int take = 100,
        CancellationToken cancellationToken = default);

    System.Threading.Tasks.Task<CallLog?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    System.Threading.Tasks.Task<List<CallLog>> GetByCustomerIdAsync(Guid customerId, CancellationToken cancellationToken = default);

    System.Threading.Tasks.Task<List<CallLog>> GetByContactIdAsync(Guid contactId, CancellationToken cancellationToken = default);

    System.Threading.Tasks.Task<List<CallLog>> GetByAgentUserIdAsync(int agentUserId, CancellationToken cancellationToken = default);

    System.Threading.Tasks.Task<int> GetTotalCountAsync(
        Guid? customerId = null,
        Guid? contactId = null,
        CallDirection? direction = null,
        CallStatus? status = null,
        DateTime? startDate = null,
        DateTime? endDate = null,
        CancellationToken cancellationToken = default);

    System.Threading.Tasks.Task<CallLog> CreateAsync(CallLog callLog, CancellationToken cancellationToken = default);

    System.Threading.Tasks.Task UpdateAsync(CallLog callLog, CancellationToken cancellationToken = default);

    System.Threading.Tasks.Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);

    System.Threading.Tasks.Task<List<CallLog>> GetFollowUpRequiredAsync(CancellationToken cancellationToken = default);
}
