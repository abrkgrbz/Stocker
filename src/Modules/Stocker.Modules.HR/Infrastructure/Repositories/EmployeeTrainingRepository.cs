using Microsoft.EntityFrameworkCore;
using Stocker.Modules.HR.Domain.Entities;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.Modules.HR.Infrastructure.Persistence;

namespace Stocker.Modules.HR.Infrastructure.Repositories;

/// <summary>
/// Repository implementation for EmployeeTraining entity
/// </summary>
public class EmployeeTrainingRepository : BaseRepository<EmployeeTraining>, IEmployeeTrainingRepository
{
    public EmployeeTrainingRepository(HRDbContext context) : base(context)
    {
    }

    public async Task<EmployeeTraining?> GetWithDetailsAsync(int employeeTrainingId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(et => et.Employee)
            .Include(et => et.Training)
            .Where(et => !et.IsDeleted)
            .FirstOrDefaultAsync(et => et.Id == employeeTrainingId, cancellationToken);
    }

    public async Task<IReadOnlyList<EmployeeTraining>> GetByEmployeeAsync(int employeeId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(et => et.Training)
            .Where(et => !et.IsDeleted && et.EmployeeId == employeeId)
            .OrderByDescending(et => et.EnrollmentDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<EmployeeTraining>> GetByTrainingAsync(int trainingId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(et => et.Employee)
            .Where(et => !et.IsDeleted && et.TrainingId == trainingId)
            .OrderBy(et => et.Employee.FirstName)
            .ThenBy(et => et.Employee.LastName)
            .ToListAsync(cancellationToken);
    }

    public async Task<EmployeeTraining?> GetByEmployeeAndTrainingAsync(int employeeId, int trainingId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(et => !et.IsDeleted)
            .FirstOrDefaultAsync(et => et.EmployeeId == employeeId && et.TrainingId == trainingId, cancellationToken);
    }

    public async Task<IReadOnlyList<EmployeeTraining>> GetByEmployeeAndStatusAsync(int employeeId, EmployeeTrainingStatus status, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(et => et.Training)
            .Where(et => !et.IsDeleted && et.EmployeeId == employeeId && et.Status == status)
            .OrderByDescending(et => et.EnrollmentDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<EmployeeTraining>> GetExpiringCertificatesAsync(int daysThreshold = 30, CancellationToken cancellationToken = default)
    {
        var thresholdDate = DateTime.UtcNow.AddDays(daysThreshold);
        var now = DateTime.UtcNow;

        return await DbSet
            .Include(et => et.Employee)
            .Include(et => et.Training)
            .Where(et => !et.IsDeleted && et.Status == EmployeeTrainingStatus.Completed)
            .Where(et => et.CertificateExpiryDate.HasValue
                && et.CertificateExpiryDate.Value <= thresholdDate
                && et.CertificateExpiryDate.Value > now)
            .OrderBy(et => et.CertificateExpiryDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<(int Total, int Completed, int InProgress, int Failed, decimal AverageScore)> GetEmployeeSummaryAsync(int employeeId, CancellationToken cancellationToken = default)
    {
        var trainings = await DbSet
            .Where(et => !et.IsDeleted && et.EmployeeId == employeeId)
            .ToListAsync(cancellationToken);

        var total = trainings.Count;
        var completed = trainings.Count(t => t.Status == EmployeeTrainingStatus.Completed);
        var inProgress = trainings.Count(t => t.Status == EmployeeTrainingStatus.InProgress);
        var failed = trainings.Count(t => t.Status == EmployeeTrainingStatus.Failed);

        var scores = trainings.Where(t => t.Score.HasValue).Select(t => t.Score!.Value).ToList();
        var averageScore = scores.Count > 0 ? scores.Average() : 0;

        return (total, completed, inProgress, failed, averageScore);
    }

    public async Task<bool> IsEnrolledAsync(int employeeId, int trainingId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .AnyAsync(et => !et.IsDeleted
                && et.EmployeeId == employeeId
                && et.TrainingId == trainingId
                && (et.Status == EmployeeTrainingStatus.Enrolled || et.Status == EmployeeTrainingStatus.InProgress),
                cancellationToken);
    }
}
