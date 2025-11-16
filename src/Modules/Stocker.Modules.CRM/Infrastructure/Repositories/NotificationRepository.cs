using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.Modules.CRM.Infrastructure.Persistence;

namespace Stocker.Modules.CRM.Infrastructure.Repositories;

public class NotificationRepository : INotificationRepository
{
    private readonly CRMDbContext _context;

    public NotificationRepository(CRMDbContext context)
    {
        _context = context;
    }

    public async System.Threading.Tasks.Task<List<Notification>> GetByUserIdAsync(Guid userId, bool? unreadOnly = null, CancellationToken cancellationToken = default)
    {
        var query = _context.Notifications
            .Where(n => n.UserId == userId);

        if (unreadOnly.HasValue && unreadOnly.Value)
        {
            query = query.Where(n => n.ReadAt == null);
        }

        return await query
            .OrderByDescending(n => n.CreatedDate)
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<Notification?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _context.Notifications
            .FirstOrDefaultAsync(n => n.Id == id, cancellationToken);
    }

    public async System.Threading.Tasks.Task<int> GetUnreadCountAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await _context.Notifications
            .Where(n => n.UserId == userId && n.ReadAt == null)
            .CountAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<Notification> CreateAsync(Notification notification, CancellationToken cancellationToken = default)
    {
        await _context.Notifications.AddAsync(notification, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
        return notification;
    }

    public async System.Threading.Tasks.Task UpdateAsync(Notification notification, CancellationToken cancellationToken = default)
    {
        _context.Notifications.Update(notification);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var notification = await GetByIdAsync(id, cancellationToken);
        if (notification != null)
        {
            _context.Notifications.Remove(notification);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }

    public async System.Threading.Tasks.Task<List<Notification>> GetPagedAsync(Guid userId, int skip, int take, bool? unreadOnly = null, CancellationToken cancellationToken = default)
    {
        var query = _context.Notifications
            .Where(n => n.UserId == userId);

        if (unreadOnly.HasValue && unreadOnly.Value)
        {
            query = query.Where(n => n.ReadAt == null);
        }

        return await query
            .OrderByDescending(n => n.CreatedDate)
            .Skip(skip)
            .Take(take)
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<int> GetTotalCountAsync(Guid userId, bool? unreadOnly = null, CancellationToken cancellationToken = default)
    {
        var query = _context.Notifications
            .Where(n => n.UserId == userId);

        if (unreadOnly.HasValue && unreadOnly.Value)
        {
            query = query.Where(n => n.ReadAt == null);
        }

        return await query.CountAsync(cancellationToken);
    }
}
