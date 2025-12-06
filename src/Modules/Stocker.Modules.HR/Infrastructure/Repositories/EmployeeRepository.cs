using Microsoft.EntityFrameworkCore;
using Stocker.Modules.HR.Domain.Entities;
using Stocker.Modules.HR.Domain.Enums;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.Modules.HR.Infrastructure.Persistence;

namespace Stocker.Modules.HR.Infrastructure.Repositories;

/// <summary>
/// Repository implementation for Employee entity
/// </summary>
public class EmployeeRepository : BaseRepository<Employee>, IEmployeeRepository
{
    public EmployeeRepository(HRDbContext context) : base(context)
    {
    }

    public async Task<Employee?> GetWithDetailsAsync(int employeeId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(e => e.Department)
            .Include(e => e.Position)
            .Include(e => e.Manager)
            .Include(e => e.Shift)
            .Where(e => !e.IsDeleted && e.Id == employeeId)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Employee>> GetByDepartmentAsync(int departmentId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(e => !e.IsDeleted && e.DepartmentId == departmentId)
            .OrderBy(e => e.LastName)
            .ThenBy(e => e.FirstName)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Employee>> GetByManagerAsync(int managerId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(e => !e.IsDeleted && e.ManagerId == managerId)
            .OrderBy(e => e.LastName)
            .ThenBy(e => e.FirstName)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Employee>> GetByPositionAsync(int positionId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(e => !e.IsDeleted && e.PositionId == positionId)
            .OrderBy(e => e.LastName)
            .ThenBy(e => e.FirstName)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Employee>> GetByStatusAsync(EmployeeStatus status, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(e => !e.IsDeleted && e.Status == status)
            .OrderBy(e => e.LastName)
            .ThenBy(e => e.FirstName)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Employee>> GetActiveEmployeesAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(e => !e.IsDeleted && e.Status == EmployeeStatus.Active)
            .OrderBy(e => e.LastName)
            .ThenBy(e => e.FirstName)
            .ToListAsync(cancellationToken);
    }

    public async Task<Employee?> GetByCodeAsync(string employeeCode, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(e => !e.IsDeleted && e.EmployeeCode == employeeCode)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<Employee?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(e => !e.IsDeleted && e.Email != null && e.Email.Value == email)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<Employee?> GetByNationalIdAsync(string nationalId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(e => !e.IsDeleted && e.NationalId == nationalId)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<bool> ExistsWithCodeAsync(string employeeCode, int? excludeEmployeeId = null, CancellationToken cancellationToken = default)
    {
        var query = DbSet.Where(e => !e.IsDeleted && e.EmployeeCode == employeeCode);

        if (excludeEmployeeId.HasValue)
        {
            query = query.Where(e => e.Id != excludeEmployeeId.Value);
        }

        return await query.AnyAsync(cancellationToken);
    }

    public async Task<bool> ExistsWithEmailAsync(string email, int? excludeEmployeeId = null, CancellationToken cancellationToken = default)
    {
        var query = DbSet.Where(e => !e.IsDeleted && e.Email != null && e.Email.Value == email);

        if (excludeEmployeeId.HasValue)
        {
            query = query.Where(e => e.Id != excludeEmployeeId.Value);
        }

        return await query.AnyAsync(cancellationToken);
    }

    public async Task<bool> ExistsWithNationalIdAsync(string nationalId, int? excludeEmployeeId = null, CancellationToken cancellationToken = default)
    {
        var query = DbSet.Where(e => !e.IsDeleted && e.NationalId == nationalId);

        if (excludeEmployeeId.HasValue)
        {
            query = query.Where(e => e.Id != excludeEmployeeId.Value);
        }

        return await query.AnyAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Employee>> SearchAsync(string searchTerm, CancellationToken cancellationToken = default)
    {
        var term = searchTerm.ToLower();
        return await DbSet
            .Where(e => !e.IsDeleted &&
                (e.FirstName.ToLower().Contains(term) ||
                 e.LastName.ToLower().Contains(term) ||
                 e.EmployeeCode.ToLower().Contains(term) ||
                 (e.Email != null && e.Email.Value.ToLower().Contains(term))))
            .OrderBy(e => e.LastName)
            .ThenBy(e => e.FirstName)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Employee>> GetProbationEndingSoonAsync(int daysThreshold = 30, CancellationToken cancellationToken = default)
    {
        var today = DateTime.UtcNow.Date;
        var endDate = today.AddDays(daysThreshold);

        return await DbSet
            .Where(e => !e.IsDeleted &&
                   e.Status == EmployeeStatus.Probation &&
                   e.ProbationEndDate.HasValue &&
                   e.ProbationEndDate.Value >= today &&
                   e.ProbationEndDate.Value <= endDate)
            .OrderBy(e => e.ProbationEndDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Employee>> GetWorkAnniversariesAsync(DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default)
    {
        var employees = await DbSet
            .Where(e => !e.IsDeleted && e.Status == EmployeeStatus.Active)
            .ToListAsync(cancellationToken);

        return employees
            .Where(e =>
            {
                var anniversaryThisYear = new DateTime(startDate.Year, e.HireDate.Month, e.HireDate.Day);
                if (anniversaryThisYear < startDate)
                    anniversaryThisYear = anniversaryThisYear.AddYears(1);

                return anniversaryThisYear >= startDate && anniversaryThisYear <= endDate;
            })
            .OrderBy(e => new DateTime(startDate.Year, e.HireDate.Month, e.HireDate.Day))
            .ToList();
    }

    public async Task<IReadOnlyList<Employee>> GetBirthdaysAsync(DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default)
    {
        var employees = await DbSet
            .Where(e => !e.IsDeleted && e.Status == EmployeeStatus.Active)
            .ToListAsync(cancellationToken);

        return employees
            .Where(e =>
            {
                var birthdayThisYear = new DateTime(startDate.Year, e.BirthDate.Month, e.BirthDate.Day);
                if (birthdayThisYear < startDate)
                    birthdayThisYear = birthdayThisYear.AddYears(1);

                return birthdayThisYear >= startDate && birthdayThisYear <= endDate;
            })
            .OrderBy(e => new DateTime(startDate.Year, e.BirthDate.Month, e.BirthDate.Day))
            .ToList();
    }

    public async Task<IReadOnlyList<Employee>> GetByShiftAsync(int shiftId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(e => !e.IsDeleted && e.ShiftId == shiftId)
            .OrderBy(e => e.LastName)
            .ThenBy(e => e.FirstName)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Employee>> GetByWorkLocationAsync(int workLocationId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(e => !e.IsDeleted && e.WorkLocationId == workLocationId)
            .OrderBy(e => e.LastName)
            .ThenBy(e => e.FirstName)
            .ToListAsync(cancellationToken);
    }

    public async Task<Employee?> GetOrganizationChartAsync(int employeeId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(e => e.Department)
            .Include(e => e.Position)
            .Include(e => e.Manager)
                .ThenInclude(m => m!.Position)
            .Include(e => e.Subordinates.Where(s => !s.IsDeleted))
                .ThenInclude(s => s.Position)
            .Where(e => !e.IsDeleted && e.Id == employeeId)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<int> GetCountByDepartmentAsync(int departmentId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .CountAsync(e => !e.IsDeleted && e.DepartmentId == departmentId, cancellationToken);
    }

    public async Task<int> GetCountByPositionAsync(int positionId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .CountAsync(e => !e.IsDeleted && e.PositionId == positionId, cancellationToken);
    }
}
