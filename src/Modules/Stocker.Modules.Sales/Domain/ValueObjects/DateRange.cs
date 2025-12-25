using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.Sales.Domain.ValueObjects;

/// <summary>
/// Value Object representing a date range (start to end)
/// Used for warranty periods, contract terms, etc.
/// </summary>
public sealed class DateRange : ValueObject
{
    public DateTime StartDate { get; private set; }
    public DateTime EndDate { get; private set; }

    private DateRange() { }

    private DateRange(DateTime startDate, DateTime endDate)
    {
        StartDate = startDate;
        EndDate = endDate;
    }

    public static DateRange Create(DateTime startDate, DateTime endDate)
    {
        if (endDate < startDate)
            throw new ArgumentException("End date cannot be before start date");

        return new DateRange(startDate, endDate);
    }

    public static DateRange CreateFromDuration(DateTime startDate, TimeSpan duration)
    {
        return Create(startDate, startDate.Add(duration));
    }

    public static DateRange CreateYears(DateTime startDate, int years)
    {
        return Create(startDate, startDate.AddYears(years));
    }

    public static DateRange CreateMonths(DateTime startDate, int months)
    {
        return Create(startDate, startDate.AddMonths(months));
    }

    public bool Contains(DateTime date)
    {
        return date >= StartDate && date <= EndDate;
    }

    public bool IsActive => Contains(DateTime.UtcNow);

    public bool IsExpired => DateTime.UtcNow > EndDate;

    public bool HasStarted => DateTime.UtcNow >= StartDate;

    public int TotalDays => (int)(EndDate - StartDate).TotalDays;

    public int RemainingDays
    {
        get
        {
            if (IsExpired) return 0;
            if (!HasStarted) return TotalDays;
            return (int)(EndDate - DateTime.UtcNow).TotalDays;
        }
    }

    public DateRange Extend(TimeSpan duration)
    {
        return Create(StartDate, EndDate.Add(duration));
    }

    public DateRange ExtendYears(int years)
    {
        return Create(StartDate, EndDate.AddYears(years));
    }

    public bool Overlaps(DateRange other)
    {
        return StartDate <= other.EndDate && EndDate >= other.StartDate;
    }

    public override IEnumerable<object> GetEqualityComponents()
    {
        yield return StartDate;
        yield return EndDate;
    }

    public override string ToString() => $"{StartDate:yyyy-MM-dd} - {EndDate:yyyy-MM-dd}";
}
