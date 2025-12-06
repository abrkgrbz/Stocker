using Stocker.Modules.HR.Domain.Entities;

namespace Stocker.Modules.HR.Domain.Repositories;

/// <summary>
/// Repository interface for Holiday entity
/// </summary>
public interface IHolidayRepository : IHRRepository<Holiday>
{
    /// <summary>
    /// Gets holidays by year
    /// </summary>
    Task<IReadOnlyList<Holiday>> GetByYearAsync(int year, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets holidays in date range
    /// </summary>
    Task<IReadOnlyList<Holiday>> GetByDateRangeAsync(DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets upcoming holidays
    /// </summary>
    Task<IReadOnlyList<Holiday>> GetUpcomingAsync(int days = 30, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets national holidays
    /// </summary>
    Task<IReadOnlyList<Holiday>> GetNationalHolidaysAsync(int year, CancellationToken cancellationToken = default);

    /// <summary>
    /// Checks if a date is a holiday
    /// </summary>
    Task<bool> IsHolidayAsync(DateTime date, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets holiday for a specific date
    /// </summary>
    Task<Holiday?> GetByDateAsync(DateTime date, CancellationToken cancellationToken = default);

    /// <summary>
    /// Creates recurring holidays for a new year
    /// </summary>
    Task CreateRecurringHolidaysAsync(int year, CancellationToken cancellationToken = default);
}
