using Microsoft.EntityFrameworkCore;
using Stocker.Modules.HR.Domain.Entities;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.Modules.HR.Infrastructure.Persistence;

namespace Stocker.Modules.HR.Infrastructure.Repositories;

/// <summary>
/// Repository implementation for EmployeeBenefit entity
/// </summary>
public class EmployeeBenefitRepository : BaseRepository<EmployeeBenefit>, IEmployeeBenefitRepository
{
    public EmployeeBenefitRepository(HRDbContext context) : base(context)
    {
    }

    public override async Task<EmployeeBenefit?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(b => b.Employee)
            .Include(b => b.ApprovedBy)
            .Where(b => !b.IsDeleted && b.Id == id)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<EmployeeBenefit>> GetByEmployeeIdAsync(int employeeId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(b => b.Employee)
            .Include(b => b.ApprovedBy)
            .Where(b => !b.IsDeleted && b.EmployeeId == employeeId)
            .OrderByDescending(b => b.StartDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<EmployeeBenefit>> GetActiveAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(b => b.Employee)
            .Include(b => b.ApprovedBy)
            .Where(b => !b.IsDeleted && b.Status == BenefitStatus.Active)
            .OrderByDescending(b => b.StartDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<decimal> GetTotalBenefitValueAsync(int employeeId, CancellationToken cancellationToken = default)
    {
        var totalValue = await DbSet
            .Where(b => !b.IsDeleted &&
                   b.EmployeeId == employeeId &&
                   b.Status == BenefitStatus.Active &&
                   b.AnnualValue.HasValue)
            .SumAsync(b => b.AnnualValue!.Value, cancellationToken);

        return totalValue;
    }

    public async Task<IReadOnlyList<EmployeeBenefit>> GetExpiringBenefitsAsync(int daysThreshold = 30, CancellationToken cancellationToken = default)
    {
        var today = DateTime.UtcNow;
        var thresholdDate = today.AddDays(daysThreshold);

        return await DbSet
            .Include(b => b.Employee)
            .Include(b => b.ApprovedBy)
            .Where(b => !b.IsDeleted &&
                   b.Status == BenefitStatus.Active &&
                   b.EndDate.HasValue &&
                   b.EndDate.Value >= today &&
                   b.EndDate.Value <= thresholdDate)
            .OrderBy(b => b.EndDate)
            .ToListAsync(cancellationToken);
    }
}
