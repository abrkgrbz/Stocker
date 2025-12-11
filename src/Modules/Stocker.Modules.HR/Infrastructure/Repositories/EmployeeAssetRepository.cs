using Microsoft.EntityFrameworkCore;
using Stocker.Modules.HR.Domain.Entities;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.Modules.HR.Infrastructure.Persistence;

namespace Stocker.Modules.HR.Infrastructure.Repositories;

/// <summary>
/// Repository implementation for EmployeeAsset entity
/// </summary>
public class EmployeeAssetRepository : BaseRepository<EmployeeAsset>, IEmployeeAssetRepository
{
    public EmployeeAssetRepository(HRDbContext context) : base(context)
    {
    }

    public override async Task<EmployeeAsset?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(a => a.Employee)
            .Include(a => a.AssignedBy)
            .Include(a => a.Department)
            .Where(a => !a.IsDeleted && a.Id == id)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<EmployeeAsset>> GetByEmployeeIdAsync(int employeeId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(a => a.Employee)
            .Include(a => a.AssignedBy)
            .Include(a => a.Department)
            .Where(a => !a.IsDeleted && a.EmployeeId == employeeId)
            .OrderByDescending(a => a.AssignmentDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<EmployeeAsset>> GetAssignedAssetsAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(a => a.Employee)
            .Include(a => a.AssignedBy)
            .Include(a => a.Department)
            .Where(a => !a.IsDeleted && a.Status == AssetAssignmentStatus.Assigned)
            .OrderByDescending(a => a.AssignmentDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<EmployeeAsset?> GetBySerialNumberAsync(string serialNumber, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(a => a.Employee)
            .Include(a => a.AssignedBy)
            .Include(a => a.Department)
            .Where(a => !a.IsDeleted && a.SerialNumber == serialNumber)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<EmployeeAsset>> GetExpiringWarrantyAssetsAsync(int daysThreshold = 30, CancellationToken cancellationToken = default)
    {
        var today = DateTime.UtcNow;
        var thresholdDate = today.AddDays(daysThreshold);

        return await DbSet
            .Include(a => a.Employee)
            .Include(a => a.AssignedBy)
            .Include(a => a.Department)
            .Where(a => !a.IsDeleted &&
                   a.Status == AssetAssignmentStatus.Assigned &&
                   a.WarrantyEndDate.HasValue &&
                   a.WarrantyEndDate.Value >= today &&
                   a.WarrantyEndDate.Value <= thresholdDate)
            .OrderBy(a => a.WarrantyEndDate)
            .ToListAsync(cancellationToken);
    }
}
