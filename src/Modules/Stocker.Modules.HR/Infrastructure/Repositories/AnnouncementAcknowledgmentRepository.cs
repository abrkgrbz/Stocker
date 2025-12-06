using Microsoft.EntityFrameworkCore;
using Stocker.Modules.HR.Domain.Entities;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.Modules.HR.Infrastructure.Persistence;

namespace Stocker.Modules.HR.Infrastructure.Repositories;

/// <summary>
/// Repository implementation for AnnouncementAcknowledgment entity
/// </summary>
public class AnnouncementAcknowledgmentRepository : BaseRepository<AnnouncementAcknowledgment>, IAnnouncementAcknowledgmentRepository
{
    public AnnouncementAcknowledgmentRepository(HRDbContext context) : base(context)
    {
    }

    public async Task<IReadOnlyList<AnnouncementAcknowledgment>> GetByAnnouncementAsync(int announcementId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(a => a.Employee)
            .Where(a => !a.IsDeleted && a.AnnouncementId == announcementId)
            .OrderByDescending(a => a.AcknowledgedDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<AnnouncementAcknowledgment>> GetByEmployeeAsync(int employeeId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(a => a.Announcement)
            .Where(a => !a.IsDeleted && a.EmployeeId == employeeId)
            .OrderByDescending(a => a.AcknowledgedDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<AnnouncementAcknowledgment?> GetByAnnouncementAndEmployeeAsync(int announcementId, int employeeId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(a => !a.IsDeleted)
            .FirstOrDefaultAsync(a => a.AnnouncementId == announcementId && a.EmployeeId == employeeId, cancellationToken);
    }
}
