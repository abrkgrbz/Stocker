using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.Modules.CRM.Domain.Enums;
using Stocker.Modules.CRM.Infrastructure.Persistence;

namespace Stocker.Modules.CRM.Infrastructure.Repositories;

public class ReminderRepository : IReminderRepository
{
    private readonly CRMDbContext _context;

    public ReminderRepository(CRMDbContext context)
    {
        _context = context;
    }

    public async System.Threading.Tasks.Task<List<Reminder>> GetByUserIdAsync(Guid userId, bool? pendingOnly = null, CancellationToken cancellationToken = default)
    {
        var query = _context.Reminders.Where(r => r.UserId == userId);

        if (pendingOnly.HasValue && pendingOnly.Value)
        {
            query = query.Where(r => r.Status == ReminderStatus.Pending || r.Status == ReminderStatus.Snoozed);
        }

        return await query
            .OrderByDescending(r => r.CreatedDate)
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<List<Reminder>> GetByAssignedUserIdAsync(Guid assignedUserId, bool? pendingOnly = null, CancellationToken cancellationToken = default)
    {
        var query = _context.Reminders.Where(r => r.AssignedToUserId == assignedUserId);

        if (pendingOnly.HasValue && pendingOnly.Value)
        {
            query = query.Where(r => r.Status == ReminderStatus.Pending || r.Status == ReminderStatus.Snoozed);
        }

        return await query
            .OrderByDescending(r => r.CreatedDate)
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<Reminder?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _context.Reminders
            .FirstOrDefaultAsync(r => r.Id == id, cancellationToken);
    }

    public async System.Threading.Tasks.Task<int> GetPendingCountAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await _context.Reminders
            .Where(r => r.UserId == userId && (r.Status == ReminderStatus.Pending || r.Status == ReminderStatus.Snoozed))
            .CountAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<Reminder> CreateAsync(Reminder reminder, CancellationToken cancellationToken = default)
    {
        _context.Reminders.Add(reminder);
        await _context.SaveChangesAsync(cancellationToken);
        return reminder;
    }

    public async System.Threading.Tasks.Task UpdateAsync(Reminder reminder, CancellationToken cancellationToken = default)
    {
        _context.Reminders.Update(reminder);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var reminder = await GetByIdAsync(id, cancellationToken);
        if (reminder != null)
        {
            _context.Reminders.Remove(reminder);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }

    public async System.Threading.Tasks.Task<List<Reminder>> GetPagedAsync(Guid userId, int skip, int take, bool? pendingOnly = null, CancellationToken cancellationToken = default)
    {
        var query = _context.Reminders.Where(r => r.UserId == userId);

        if (pendingOnly.HasValue && pendingOnly.Value)
        {
            query = query.Where(r => r.Status == ReminderStatus.Pending || r.Status == ReminderStatus.Snoozed);
        }

        return await query
            .OrderByDescending(r => r.CreatedDate)
            .Skip(skip)
            .Take(take)
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<int> GetTotalCountAsync(Guid userId, bool? pendingOnly = null, CancellationToken cancellationToken = default)
    {
        var query = _context.Reminders.Where(r => r.UserId == userId);

        if (pendingOnly.HasValue && pendingOnly.Value)
        {
            query = query.Where(r => r.Status == ReminderStatus.Pending || r.Status == ReminderStatus.Snoozed);
        }

        return await query.CountAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<List<Reminder>> GetDueRemindersAsync(CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;

        return await _context.Reminders
            .Where(r => r.Status == ReminderStatus.Pending || r.Status == ReminderStatus.Snoozed)
            .Where(r => (r.Status == ReminderStatus.Pending && r.RemindAt <= now) ||
                        (r.Status == ReminderStatus.Snoozed && r.SnoozedUntil.HasValue && r.SnoozedUntil.Value <= now))
            .OrderBy(r => r.RemindAt)
            .ToListAsync(cancellationToken);
    }
}
