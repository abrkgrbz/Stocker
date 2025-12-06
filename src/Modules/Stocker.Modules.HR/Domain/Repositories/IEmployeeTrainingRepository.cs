using Stocker.Modules.HR.Domain.Entities;

namespace Stocker.Modules.HR.Domain.Repositories;

/// <summary>
/// Repository interface for EmployeeTraining entity
/// </summary>
public interface IEmployeeTrainingRepository : IHRRepository<EmployeeTraining>
{
    /// <summary>
    /// Gets employee training with details
    /// </summary>
    Task<EmployeeTraining?> GetWithDetailsAsync(int employeeTrainingId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets trainings for an employee
    /// </summary>
    Task<IReadOnlyList<EmployeeTraining>> GetByEmployeeAsync(int employeeId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets participants for a training
    /// </summary>
    Task<IReadOnlyList<EmployeeTraining>> GetByTrainingAsync(int trainingId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets employee training by employee and training
    /// </summary>
    Task<EmployeeTraining?> GetByEmployeeAndTrainingAsync(int employeeId, int trainingId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets trainings by status for an employee
    /// </summary>
    Task<IReadOnlyList<EmployeeTraining>> GetByEmployeeAndStatusAsync(int employeeId, EmployeeTrainingStatus status, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets expiring certificates
    /// </summary>
    Task<IReadOnlyList<EmployeeTraining>> GetExpiringCertificatesAsync(int daysThreshold = 30, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets training summary for an employee
    /// </summary>
    Task<(int Total, int Completed, int InProgress, int Failed, decimal AverageScore)> GetEmployeeSummaryAsync(int employeeId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Checks if employee is already enrolled in training
    /// </summary>
    Task<bool> IsEnrolledAsync(int employeeId, int trainingId, CancellationToken cancellationToken = default);
}
