using Microsoft.EntityFrameworkCore;
using Stocker.Modules.HR.Domain.Entities;
using Stocker.Modules.HR.Domain.Enums;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.Modules.HR.Infrastructure.Persistence;

namespace Stocker.Modules.HR.Infrastructure.Repositories;

/// <summary>
/// Repository implementation for EmployeeDocument entity
/// </summary>
public class EmployeeDocumentRepository : BaseRepository<EmployeeDocument>, IEmployeeDocumentRepository
{
    public EmployeeDocumentRepository(HRDbContext context) : base(context)
    {
    }

    public async Task<IReadOnlyList<EmployeeDocument>> GetByEmployeeAsync(int employeeId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(d => !d.IsDeleted && d.EmployeeId == employeeId)
            .OrderByDescending(d => d.CreatedDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<EmployeeDocument>> GetByTypeAsync(DocumentType documentType, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(d => !d.IsDeleted && d.DocumentType == documentType)
            .OrderByDescending(d => d.CreatedDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<EmployeeDocument>> GetByEmployeeAndTypeAsync(int employeeId, DocumentType documentType, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(d => !d.IsDeleted &&
                   d.EmployeeId == employeeId &&
                   d.DocumentType == documentType)
            .OrderByDescending(d => d.CreatedDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<EmployeeDocument>> GetExpiringAsync(int daysThreshold = 30, CancellationToken cancellationToken = default)
    {
        var today = DateTime.UtcNow.Date;
        var endDate = today.AddDays(daysThreshold);

        return await DbSet
            .Include(d => d.Employee)
            .Where(d => !d.IsDeleted &&
                   d.ExpiryDate.HasValue &&
                   d.ExpiryDate.Value >= today &&
                   d.ExpiryDate.Value <= endDate)
            .OrderBy(d => d.ExpiryDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<EmployeeDocument>> GetExpiredAsync(CancellationToken cancellationToken = default)
    {
        var today = DateTime.UtcNow.Date;
        return await DbSet
            .Include(d => d.Employee)
            .Where(d => !d.IsDeleted &&
                   d.ExpiryDate.HasValue &&
                   d.ExpiryDate.Value < today)
            .OrderByDescending(d => d.ExpiryDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<EmployeeDocument>> GetUnverifiedAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(d => d.Employee)
            .Where(d => !d.IsDeleted && !d.IsVerified)
            .OrderByDescending(d => d.CreatedDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> ExistsWithNumberAsync(string documentNumber, DocumentType documentType, int? excludeDocumentId = null, CancellationToken cancellationToken = default)
    {
        var query = DbSet.Where(d => !d.IsDeleted &&
                                d.DocumentNumber == documentNumber &&
                                d.DocumentType == documentType);

        if (excludeDocumentId.HasValue)
        {
            query = query.Where(d => d.Id != excludeDocumentId.Value);
        }

        return await query.AnyAsync(cancellationToken);
    }
}
