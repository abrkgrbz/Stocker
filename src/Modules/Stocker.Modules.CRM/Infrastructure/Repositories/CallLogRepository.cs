using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.Modules.CRM.Infrastructure.Persistence;

namespace Stocker.Modules.CRM.Infrastructure.Repositories;

public class CallLogRepository : ICallLogRepository
{
    private readonly CRMDbContext _context;

    public CallLogRepository(CRMDbContext context)
    {
        _context = context;
    }

    public async System.Threading.Tasks.Task<List<CallLog>> GetAllAsync(
        Guid? customerId = null,
        Guid? contactId = null,
        CallDirection? direction = null,
        CallStatus? status = null,
        DateTime? startDate = null,
        DateTime? endDate = null,
        int skip = 0,
        int take = 100,
        CancellationToken cancellationToken = default)
    {
        var query = _context.CallLogs.AsQueryable();

        if (customerId.HasValue)
            query = query.Where(c => c.CustomerId == customerId.Value);

        if (contactId.HasValue)
            query = query.Where(c => c.ContactId == contactId.Value);

        if (direction.HasValue)
            query = query.Where(c => c.Direction == direction.Value);

        if (status.HasValue)
            query = query.Where(c => c.Status == status.Value);

        if (startDate.HasValue)
            query = query.Where(c => c.StartTime >= startDate.Value);

        if (endDate.HasValue)
            query = query.Where(c => c.StartTime <= endDate.Value);

        return await query
            .OrderByDescending(c => c.StartTime)
            .Skip(skip)
            .Take(take)
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<CallLog?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.CallLogs
            .Include(c => c.Customer)
            .Include(c => c.Contact)
            .Include(c => c.Lead)
            .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);
    }

    public async System.Threading.Tasks.Task<List<CallLog>> GetByCustomerIdAsync(Guid customerId, CancellationToken cancellationToken = default)
    {
        return await _context.CallLogs
            .Where(c => c.CustomerId == customerId)
            .OrderByDescending(c => c.StartTime)
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<List<CallLog>> GetByContactIdAsync(Guid contactId, CancellationToken cancellationToken = default)
    {
        return await _context.CallLogs
            .Where(c => c.ContactId == contactId)
            .OrderByDescending(c => c.StartTime)
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<List<CallLog>> GetByAgentUserIdAsync(int agentUserId, CancellationToken cancellationToken = default)
    {
        return await _context.CallLogs
            .Where(c => c.AgentUserId == agentUserId)
            .OrderByDescending(c => c.StartTime)
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<int> GetTotalCountAsync(
        Guid? customerId = null,
        Guid? contactId = null,
        CallDirection? direction = null,
        CallStatus? status = null,
        DateTime? startDate = null,
        DateTime? endDate = null,
        CancellationToken cancellationToken = default)
    {
        var query = _context.CallLogs.AsQueryable();

        if (customerId.HasValue)
            query = query.Where(c => c.CustomerId == customerId.Value);

        if (contactId.HasValue)
            query = query.Where(c => c.ContactId == contactId.Value);

        if (direction.HasValue)
            query = query.Where(c => c.Direction == direction.Value);

        if (status.HasValue)
            query = query.Where(c => c.Status == status.Value);

        if (startDate.HasValue)
            query = query.Where(c => c.StartTime >= startDate.Value);

        if (endDate.HasValue)
            query = query.Where(c => c.StartTime <= endDate.Value);

        return await query.CountAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<CallLog> CreateAsync(CallLog callLog, CancellationToken cancellationToken = default)
    {
        _context.CallLogs.Add(callLog);
        await _context.SaveChangesAsync(cancellationToken);
        return callLog;
    }

    public async System.Threading.Tasks.Task UpdateAsync(CallLog callLog, CancellationToken cancellationToken = default)
    {
        _context.CallLogs.Update(callLog);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var callLog = await GetByIdAsync(id, cancellationToken);
        if (callLog != null)
        {
            _context.CallLogs.Remove(callLog);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }

    public async System.Threading.Tasks.Task<List<CallLog>> GetFollowUpRequiredAsync(CancellationToken cancellationToken = default)
    {
        return await _context.CallLogs
            .Where(c => c.FollowUpRequired && c.FollowUpDate.HasValue && c.FollowUpDate.Value <= DateTime.UtcNow)
            .OrderBy(c => c.FollowUpDate)
            .ToListAsync(cancellationToken);
    }
}
