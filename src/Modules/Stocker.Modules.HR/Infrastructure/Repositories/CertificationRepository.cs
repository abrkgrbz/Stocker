using Microsoft.EntityFrameworkCore;
using Stocker.Modules.HR.Domain.Entities;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.Modules.HR.Infrastructure.Persistence;

namespace Stocker.Modules.HR.Infrastructure.Repositories;

/// <summary>
/// Repository implementation for Certification entity
/// </summary>
public class CertificationRepository : BaseRepository<Certification>, ICertificationRepository
{
    public CertificationRepository(HRDbContext context) : base(context)
    {
    }

    public override async Task<Certification?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(c => c.Employee)
            .Where(c => !c.IsDeleted && c.Id == id)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Certification>> GetByEmployeeIdAsync(int employeeId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(c => c.Employee)
            .Where(c => !c.IsDeleted && c.EmployeeId == employeeId)
            .OrderByDescending(c => c.IssueDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Certification>> GetActiveAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(c => c.Employee)
            .Where(c => !c.IsDeleted && c.Status == CertificationStatus.Active)
            .OrderByDescending(c => c.IssueDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Certification>> GetExpiringCertificationsAsync(int daysThreshold = 90, CancellationToken cancellationToken = default)
    {
        var thresholdDate = DateTime.UtcNow.AddDays(daysThreshold);
        var today = DateTime.UtcNow;

        return await DbSet
            .Include(c => c.Employee)
            .Where(c => !c.IsDeleted &&
                   c.Status == CertificationStatus.Active &&
                   c.ExpiryDate.HasValue &&
                   c.ExpiryDate.Value >= today &&
                   c.ExpiryDate.Value <= thresholdDate)
            .OrderBy(c => c.ExpiryDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Certification>> GetExpiredCertificationsAsync(CancellationToken cancellationToken = default)
    {
        var today = DateTime.UtcNow;

        return await DbSet
            .Include(c => c.Employee)
            .Where(c => !c.IsDeleted &&
                   c.ExpiryDate.HasValue &&
                   c.ExpiryDate.Value < today)
            .OrderBy(c => c.ExpiryDate)
            .ToListAsync(cancellationToken);
    }
}
