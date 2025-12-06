using Microsoft.EntityFrameworkCore;
using Stocker.Modules.HR.Domain.Entities;
using Stocker.Modules.HR.Domain.Enums;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.Modules.HR.Infrastructure.Persistence;

namespace Stocker.Modules.HR.Infrastructure.Repositories;

/// <summary>
/// Repository implementation for Training entity
/// </summary>
public class TrainingRepository : BaseRepository<Training>, ITrainingRepository
{
    public TrainingRepository(HRDbContext context) : base(context)
    {
    }

    public async Task<Training?> GetWithParticipantsAsync(int trainingId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(t => t.Participants.Where(p => !p.IsDeleted))
                .ThenInclude(p => p.Employee)
            .Where(t => !t.IsDeleted && t.Id == trainingId)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Training>> GetByStatusAsync(TrainingStatus status, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(t => !t.IsDeleted && t.Status == status)
            .OrderByDescending(t => t.StartDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Training>> GetUpcomingTrainingsAsync(int days, CancellationToken cancellationToken = default)
    {
        var today = DateTime.UtcNow.Date;
        var endDate = today.AddDays(days);

        return await DbSet
            .Where(t => !t.IsDeleted &&
                   t.StartDate >= today &&
                   t.StartDate <= endDate &&
                   t.Status == TrainingStatus.Scheduled)
            .OrderBy(t => t.StartDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Training>> GetByDateRangeAsync(DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(t => !t.IsDeleted &&
                   ((t.StartDate >= startDate && t.StartDate <= endDate) ||
                    (t.EndDate >= startDate && t.EndDate <= endDate)))
            .OrderBy(t => t.StartDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Training>> GetByInstructorAsync(string instructor, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(t => !t.IsDeleted && t.Instructor == instructor)
            .OrderByDescending(t => t.StartDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> HasAvailableCapacityAsync(int trainingId, CancellationToken cancellationToken = default)
    {
        var training = await DbSet
            .Include(t => t.Participants.Where(p => !p.IsDeleted))
            .Where(t => !t.IsDeleted && t.Id == trainingId)
            .FirstOrDefaultAsync(cancellationToken);

        if (training == null || !training.MaxParticipants.HasValue)
            return true;

        return training.Participants.Count < training.MaxParticipants.Value;
    }

    public async Task<Training?> GetByCodeAsync(string code, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(t => !t.IsDeleted && t.Code == code)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Training>> GetUpcomingAsync(int days = 30, CancellationToken cancellationToken = default)
    {
        var today = DateTime.UtcNow.Date;
        var endDate = today.AddDays(days);

        return await DbSet
            .Where(t => !t.IsDeleted &&
                   t.StartDate >= today &&
                   t.StartDate <= endDate &&
                   t.Status == TrainingStatus.Scheduled)
            .OrderBy(t => t.StartDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Training>> GetMandatoryTrainingsAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(t => !t.IsDeleted && t.IsMandatory && t.IsActive)
            .OrderBy(t => t.StartDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Training>> GetWithAvailableSlotsAsync(CancellationToken cancellationToken = default)
    {
        var trainings = await DbSet
            .Include(t => t.Participants.Where(p => !p.IsDeleted))
            .Where(t => !t.IsDeleted && t.Status == TrainingStatus.Scheduled && t.IsActive)
            .ToListAsync(cancellationToken);

        return trainings
            .Where(t => !t.MaxParticipants.HasValue || t.Participants.Count < t.MaxParticipants.Value)
            .OrderBy(t => t.StartDate)
            .ToList();
    }

    public async Task<bool> ExistsWithCodeAsync(string code, int? excludeTrainingId = null, CancellationToken cancellationToken = default)
    {
        var query = DbSet.Where(t => !t.IsDeleted && t.Code == code);

        if (excludeTrainingId.HasValue)
        {
            query = query.Where(t => t.Id != excludeTrainingId.Value);
        }

        return await query.AnyAsync(cancellationToken);
    }
}
