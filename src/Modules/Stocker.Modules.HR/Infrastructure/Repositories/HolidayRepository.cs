using Microsoft.EntityFrameworkCore;
using Stocker.Modules.HR.Domain.Entities;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.Modules.HR.Infrastructure.Persistence;

namespace Stocker.Modules.HR.Infrastructure.Repositories;

/// <summary>
/// Repository implementation for Holiday entity
/// </summary>
public class HolidayRepository : BaseRepository<Holiday>, IHolidayRepository
{
    public HolidayRepository(HRDbContext context) : base(context)
    {
    }

    public async Task<IReadOnlyList<Holiday>> GetByYearAsync(int year, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(h => !h.IsDeleted && h.Year == year)
            .OrderBy(h => h.Date)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Holiday>> GetByDateRangeAsync(DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(h => !h.IsDeleted &&
                   h.Date >= startDate &&
                   h.Date <= endDate)
            .OrderBy(h => h.Date)
            .ToListAsync(cancellationToken);
    }

    public async Task<Holiday?> GetByDateAsync(DateTime date, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(h => !h.IsDeleted && h.Date.Date == date.Date)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<bool> IsHolidayAsync(DateTime date, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .AnyAsync(h => !h.IsDeleted &&
                     h.IsActive &&
                     ((h.Date.Date == date.Date) ||
                      (h.EndDate.HasValue && h.Date.Date <= date.Date && h.EndDate.Value.Date >= date.Date)),
                     cancellationToken);
    }

    public async Task<IReadOnlyList<Holiday>> GetUpcomingAsync(int days = 30, CancellationToken cancellationToken = default)
    {
        var today = DateTime.UtcNow.Date;
        var endDate = today.AddDays(days);

        return await DbSet
            .Where(h => !h.IsDeleted &&
                   h.IsActive &&
                   h.Date >= today &&
                   h.Date <= endDate)
            .OrderBy(h => h.Date)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Holiday>> GetNationalHolidaysAsync(int year, CancellationToken cancellationToken = default)
    {
        // Since there's no IsNational property, we return all holidays for the year
        // In a real scenario, you might want to add a HolidayType enum
        return await DbSet
            .Where(h => !h.IsDeleted &&
                   h.Year == year &&
                   h.IsActive)
            .OrderBy(h => h.Date)
            .ToListAsync(cancellationToken);
    }

    public async Task CreateRecurringHolidaysAsync(int year, CancellationToken cancellationToken = default)
    {
        var previousYear = year - 1;

        var recurringHolidays = await DbSet
            .Where(h => !h.IsDeleted &&
                   h.IsRecurring &&
                   h.Year == previousYear)
            .ToListAsync(cancellationToken);

        foreach (var holiday in recurringHolidays)
        {
            // Check if holiday already exists for the new year
            var existsForYear = await DbSet.AnyAsync(
                h => !h.IsDeleted &&
                     h.Name == holiday.Name &&
                     h.Year == year,
                cancellationToken);

            if (!existsForYear)
            {
                var newDate = new DateTime(year, holiday.Date.Month, holiday.Date.Day);
                DateTime? newEndDate = holiday.EndDate.HasValue
                    ? new DateTime(year, holiday.EndDate.Value.Month, holiday.EndDate.Value.Day)
                    : null;

                var newHoliday = new Holiday(
                    holiday.Name,
                    newDate,
                    newEndDate,
                    holiday.IsRecurring,
                    holiday.IsHalfDay,
                    holiday.Description);

                await DbSet.AddAsync(newHoliday, cancellationToken);
            }
        }

        await Context.SaveChangesAsync(cancellationToken);
    }
}
