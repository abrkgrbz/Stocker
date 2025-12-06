using Microsoft.EntityFrameworkCore;
using Stocker.Modules.HR.Domain.Entities;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.Modules.HR.Infrastructure.Persistence;

namespace Stocker.Modules.HR.Infrastructure.Repositories;

/// <summary>
/// Repository implementation for Announcement entity
/// </summary>
public class AnnouncementRepository : BaseRepository<Announcement>, IAnnouncementRepository
{
    public AnnouncementRepository(HRDbContext context) : base(context)
    {
    }

    public async Task<Announcement?> GetWithAcknowledgmentsAsync(int announcementId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(a => a.Acknowledgments)
            .Include(a => a.Author)
            .Include(a => a.Department)
            .Where(a => !a.IsDeleted)
            .FirstOrDefaultAsync(a => a.Id == announcementId, cancellationToken);
    }

    public async Task<IReadOnlyList<Announcement>> GetPublishedAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(a => !a.IsDeleted && a.IsPublished)
            .OrderByDescending(a => a.PublishDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Announcement>> GetActiveAsync(CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        return await DbSet
            .Where(a => !a.IsDeleted && a.IsActive && a.IsPublished)
            .Where(a => !a.ExpiryDate.HasValue || a.ExpiryDate > now)
            .OrderByDescending(a => a.Priority)
            .ThenByDescending(a => a.PublishDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Announcement>> GetPinnedAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(a => !a.IsDeleted && a.IsPinned && a.IsPublished)
            .OrderByDescending(a => a.Priority)
            .ThenByDescending(a => a.PublishDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Announcement>> GetByDepartmentAsync(int? departmentId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(a => !a.IsDeleted && a.DepartmentId == departmentId)
            .OrderByDescending(a => a.PublishDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Announcement>> GetRequiringAcknowledgmentAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(a => !a.IsDeleted && a.RequiresAcknowledgment && a.IsPublished)
            .OrderByDescending(a => a.PublishDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Announcement>> GetUnacknowledgedByEmployeeAsync(int employeeId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(a => a.Acknowledgments)
            .Where(a => !a.IsDeleted && a.RequiresAcknowledgment && a.IsPublished)
            .Where(a => !a.Acknowledgments.Any(ack => ack.EmployeeId == employeeId))
            .OrderByDescending(a => a.Priority)
            .ThenByDescending(a => a.PublishDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<(int TotalTarget, int Acknowledged)> GetAcknowledgmentStatsAsync(int announcementId, CancellationToken cancellationToken = default)
    {
        var announcement = await DbSet
            .Include(a => a.Acknowledgments)
            .FirstOrDefaultAsync(a => a.Id == announcementId && !a.IsDeleted, cancellationToken);

        if (announcement == null)
            return (0, 0);

        // Count acknowledged
        var acknowledged = announcement.Acknowledgments.Count;

        // For total target, we'd need to count employees in the target department or all employees
        // This is a simplified version - the actual implementation would depend on business logic
        var totalTarget = announcement.DepartmentId.HasValue
            ? await Context.Set<Employee>()
                .CountAsync(e => !e.IsDeleted && e.DepartmentId == announcement.DepartmentId, cancellationToken)
            : await Context.Set<Employee>()
                .CountAsync(e => !e.IsDeleted, cancellationToken);

        return (totalTarget, acknowledged);
    }
}
