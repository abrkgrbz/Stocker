using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.Modules.CRM.Domain.Enums;
using Stocker.Modules.CRM.Infrastructure.Persistence;

namespace Stocker.Modules.CRM.Infrastructure.Repositories;

public class MeetingRepository : IMeetingRepository
{
    private readonly CRMDbContext _context;

    public MeetingRepository(CRMDbContext context)
    {
        _context = context;
    }

    public async System.Threading.Tasks.Task<List<Meeting>> GetAllAsync(
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
        CancellationToken cancellationToken = default)
    {
        var query = _context.Meetings.AsQueryable();

        if (customerId.HasValue)
            query = query.Where(m => m.CustomerId == customerId.Value);

        if (contactId.HasValue)
            query = query.Where(m => m.ContactId == contactId.Value);

        if (leadId.HasValue)
            query = query.Where(m => m.LeadId == leadId.Value);

        if (opportunityId.HasValue)
            query = query.Where(m => m.OpportunityId == opportunityId.Value);

        if (dealId.HasValue)
            query = query.Where(m => m.DealId == dealId.Value);

        if (status.HasValue)
            query = query.Where(m => m.Status == status.Value);

        if (meetingType.HasValue)
            query = query.Where(m => m.MeetingType == meetingType.Value);

        if (startDate.HasValue)
            query = query.Where(m => m.StartTime >= startDate.Value);

        if (endDate.HasValue)
            query = query.Where(m => m.StartTime <= endDate.Value);

        if (organizerId.HasValue)
            query = query.Where(m => m.OrganizerId == organizerId.Value);

        return await query
            .OrderByDescending(m => m.StartTime)
            .Skip(skip)
            .Take(take)
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<Meeting?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Meetings
            .Include(m => m.Customer)
            .Include(m => m.Contact)
            .Include(m => m.Lead)
            .Include(m => m.Opportunity)
            .Include(m => m.Deal)
            .Include(m => m.Attendees)
            .FirstOrDefaultAsync(m => m.Id == id, cancellationToken);
    }

    public async System.Threading.Tasks.Task<List<Meeting>> GetByCustomerIdAsync(Guid customerId, CancellationToken cancellationToken = default)
    {
        return await _context.Meetings
            .Where(m => m.CustomerId == customerId)
            .OrderByDescending(m => m.StartTime)
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<List<Meeting>> GetByOrganizerIdAsync(int organizerId, CancellationToken cancellationToken = default)
    {
        return await _context.Meetings
            .Where(m => m.OrganizerId == organizerId)
            .OrderByDescending(m => m.StartTime)
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<List<Meeting>> GetUpcomingMeetingsAsync(int? organizerId = null, CancellationToken cancellationToken = default)
    {
        var query = _context.Meetings
            .Where(m => m.Status == Domain.Entities.MeetingStatus.Scheduled && m.StartTime > DateTime.UtcNow);

        if (organizerId.HasValue)
            query = query.Where(m => m.OrganizerId == organizerId.Value);

        return await query
            .OrderBy(m => m.StartTime)
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<List<Meeting>> GetTodayMeetingsAsync(int? organizerId = null, CancellationToken cancellationToken = default)
    {
        var today = DateTime.UtcNow.Date;
        var tomorrow = today.AddDays(1);

        var query = _context.Meetings
            .Where(m => m.StartTime >= today && m.StartTime < tomorrow);

        if (organizerId.HasValue)
            query = query.Where(m => m.OrganizerId == organizerId.Value);

        return await query
            .OrderBy(m => m.StartTime)
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<int> GetTotalCountAsync(
        Guid? customerId = null,
        Guid? contactId = null,
        Domain.Entities.MeetingStatus? status = null,
        DateTime? startDate = null,
        DateTime? endDate = null,
        CancellationToken cancellationToken = default)
    {
        var query = _context.Meetings.AsQueryable();

        if (customerId.HasValue)
            query = query.Where(m => m.CustomerId == customerId.Value);

        if (contactId.HasValue)
            query = query.Where(m => m.ContactId == contactId.Value);

        if (status.HasValue)
            query = query.Where(m => m.Status == status.Value);

        if (startDate.HasValue)
            query = query.Where(m => m.StartTime >= startDate.Value);

        if (endDate.HasValue)
            query = query.Where(m => m.StartTime <= endDate.Value);

        return await query.CountAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<Meeting> CreateAsync(Meeting meeting, CancellationToken cancellationToken = default)
    {
        _context.Meetings.Add(meeting);
        await _context.SaveChangesAsync(cancellationToken);
        return meeting;
    }

    public async System.Threading.Tasks.Task UpdateAsync(Meeting meeting, CancellationToken cancellationToken = default)
    {
        _context.Meetings.Update(meeting);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var meeting = await GetByIdAsync(id, cancellationToken);
        if (meeting != null)
        {
            _context.Meetings.Remove(meeting);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}
