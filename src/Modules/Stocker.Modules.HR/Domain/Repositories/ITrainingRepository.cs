using Stocker.Modules.HR.Domain.Entities;
using Stocker.Modules.HR.Domain.Enums;

namespace Stocker.Modules.HR.Domain.Repositories;

/// <summary>
/// Repository interface for Training entity
/// </summary>
public interface ITrainingRepository : IHRRepository<Training>
{
    /// <summary>
    /// Gets a training with participants
    /// </summary>
    Task<Training?> GetWithParticipantsAsync(int trainingId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a training by code
    /// </summary>
    Task<Training?> GetByCodeAsync(string code, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets trainings by status
    /// </summary>
    Task<IReadOnlyList<Training>> GetByStatusAsync(TrainingStatus status, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets upcoming trainings
    /// </summary>
    Task<IReadOnlyList<Training>> GetUpcomingAsync(int days = 30, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets mandatory trainings
    /// </summary>
    Task<IReadOnlyList<Training>> GetMandatoryTrainingsAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets trainings with available slots
    /// </summary>
    Task<IReadOnlyList<Training>> GetWithAvailableSlotsAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Checks if training code exists
    /// </summary>
    Task<bool> ExistsWithCodeAsync(string code, int? excludeTrainingId = null, CancellationToken cancellationToken = default);
}
