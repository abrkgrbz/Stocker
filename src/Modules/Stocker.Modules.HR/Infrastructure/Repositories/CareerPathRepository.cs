using Microsoft.EntityFrameworkCore;
using Stocker.Modules.HR.Domain.Entities;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.Modules.HR.Infrastructure.Persistence;

namespace Stocker.Modules.HR.Infrastructure.Repositories;

/// <summary>
/// Repository implementation for CareerPath entity
/// </summary>
public class CareerPathRepository : BaseRepository<CareerPath>, ICareerPathRepository
{
    public CareerPathRepository(HRDbContext context) : base(context)
    {
    }

    public override async Task<CareerPath?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(c => c.Employee)
            .Include(c => c.CurrentPosition)
            .Include(c => c.TargetPosition)
            .Include(c => c.Mentor)
            .Include(c => c.Milestones)
            .Where(c => !c.IsDeleted && c.Id == id)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<CareerPath>> GetAllAsync(
        int? employeeId = null,
        CareerPathStatus? status = null,
        CareerTrack? careerTrack = null,
        bool? readyForPromotion = null,
        int pageNumber = 1,
        int pageSize = 10,
        CancellationToken cancellationToken = default)
    {
        var query = DbSet
            .Include(c => c.Employee)
            .Include(c => c.CurrentPosition)
            .Include(c => c.TargetPosition)
            .Include(c => c.Mentor)
            .Where(c => !c.IsDeleted);

        if (employeeId.HasValue)
            query = query.Where(c => c.EmployeeId == employeeId.Value);

        if (status.HasValue)
            query = query.Where(c => c.Status == status.Value);

        if (careerTrack.HasValue)
            query = query.Where(c => c.CareerTrack == careerTrack.Value);

        if (readyForPromotion.HasValue)
            query = query.Where(c => c.ReadyForPromotion == readyForPromotion.Value);

        return await query
            .OrderByDescending(c => c.CreatedDate)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<CareerPath>> GetByEmployeeIdAsync(int employeeId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(c => c.Employee)
            .Include(c => c.CurrentPosition)
            .Include(c => c.TargetPosition)
            .Include(c => c.Mentor)
            .Where(c => !c.IsDeleted && c.EmployeeId == employeeId)
            .OrderByDescending(c => c.CreatedDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<CareerPath>> GetActivePathsAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(c => c.Employee)
            .Include(c => c.CurrentPosition)
            .Include(c => c.TargetPosition)
            .Where(c => !c.IsDeleted && c.Status == CareerPathStatus.Active)
            .OrderByDescending(c => c.CreatedDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<CareerPath>> GetReadyForPromotionAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(c => c.Employee)
            .Include(c => c.CurrentPosition)
            .Include(c => c.TargetPosition)
            .Where(c => !c.IsDeleted && c.ReadyForPromotion && c.Status == CareerPathStatus.Active)
            .OrderByDescending(c => c.ReadinessScore)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<CareerPath>> GetByMentorIdAsync(int mentorId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(c => c.Employee)
            .Include(c => c.CurrentPosition)
            .Include(c => c.TargetPosition)
            .Where(c => !c.IsDeleted && c.MentorId == mentorId)
            .OrderByDescending(c => c.CreatedDate)
            .ToListAsync(cancellationToken);
    }
}
