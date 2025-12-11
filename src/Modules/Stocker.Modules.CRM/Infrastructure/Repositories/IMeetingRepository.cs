using Stocker.Modules.CRM.Domain.Entities;
using Stocker.Modules.CRM.Domain.Enums;

namespace Stocker.Modules.CRM.Infrastructure.Repositories;

public interface IMeetingRepository
{
    System.Threading.Tasks.Task<List<Meeting>> GetAllAsync(
        Guid? customerId = null,
        Guid? contactId = null,
        Guid? leadId = null,
        Guid? opportunityId = null,
        Guid? dealId = null,
        Domain.Entities.MeetingStatus? status = null,
        MeetingType? meetingType = null,
        DateTime? startDate = null,
        DateTime? endDate = null,
        int? organizerId = null,
        int skip = 0,
        int take = 100,
        CancellationToken cancellationToken = default);

    System.Threading.Tasks.Task<Meeting?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    System.Threading.Tasks.Task<List<Meeting>> GetByCustomerIdAsync(Guid customerId, CancellationToken cancellationToken = default);

    System.Threading.Tasks.Task<List<Meeting>> GetByOrganizerIdAsync(int organizerId, CancellationToken cancellationToken = default);

    System.Threading.Tasks.Task<List<Meeting>> GetUpcomingMeetingsAsync(int? organizerId = null, CancellationToken cancellationToken = default);

    System.Threading.Tasks.Task<List<Meeting>> GetTodayMeetingsAsync(int? organizerId = null, CancellationToken cancellationToken = default);

    System.Threading.Tasks.Task<int> GetTotalCountAsync(
        Guid? customerId = null,
        Guid? contactId = null,
        Domain.Entities.MeetingStatus? status = null,
        DateTime? startDate = null,
        DateTime? endDate = null,
        CancellationToken cancellationToken = default);

    System.Threading.Tasks.Task<Meeting> CreateAsync(Meeting meeting, CancellationToken cancellationToken = default);

    System.Threading.Tasks.Task UpdateAsync(Meeting meeting, CancellationToken cancellationToken = default);

    System.Threading.Tasks.Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
