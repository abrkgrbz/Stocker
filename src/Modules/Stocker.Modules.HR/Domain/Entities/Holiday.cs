using Stocker.SharedKernel.Common;

namespace Stocker.Modules.HR.Domain.Entities;

/// <summary>
/// Resmi tatil entity'si
/// </summary>
public class Holiday : BaseEntity
{
    public string Name { get; private set; }
    public DateTime Date { get; private set; }
    public DateTime? EndDate { get; private set; }
    public bool IsRecurring { get; private set; }
    public bool IsHalfDay { get; private set; }
    public string? Description { get; private set; }
    public int Year { get; private set; }
    public bool IsActive { get; private set; }

    protected Holiday()
    {
        Name = string.Empty;
    }

    public Holiday(
        string name,
        DateTime date,
        DateTime? endDate = null,
        bool isRecurring = false,
        bool isHalfDay = false,
        string? description = null)
    {
        Name = name;
        Date = date.Date;
        EndDate = endDate?.Date;
        IsRecurring = isRecurring;
        IsHalfDay = isHalfDay;
        Description = description;
        Year = date.Year;
        IsActive = true;
    }

    public void Update(
        string name,
        DateTime date,
        DateTime? endDate,
        bool isRecurring,
        bool isHalfDay,
        string? description)
    {
        Name = name;
        Date = date.Date;
        EndDate = endDate?.Date;
        IsRecurring = isRecurring;
        IsHalfDay = isHalfDay;
        Description = description;
        Year = date.Year;
    }

    public void Activate() => IsActive = true;

    public void Deactivate() => IsActive = false;

    public int GetDurationDays()
    {
        if (!EndDate.HasValue)
            return IsHalfDay ? 0 : 1;

        return (EndDate.Value - Date).Days + 1;
    }

    public bool IsOnDate(DateTime checkDate)
    {
        var dateToCheck = checkDate.Date;

        if (IsRecurring)
        {
            // Tekrarlayan tatiller için sadece ay ve gün kontrolü
            if (EndDate.HasValue)
            {
                var checkMonthDay = (checkDate.Month, checkDate.Day);
                var startMonthDay = (Date.Month, Date.Day);
                var endMonthDay = (EndDate.Value.Month, EndDate.Value.Day);

                return checkMonthDay.CompareTo(startMonthDay) >= 0 && checkMonthDay.CompareTo(endMonthDay) <= 0;
            }
            return checkDate.Month == Date.Month && checkDate.Day == Date.Day;
        }

        if (EndDate.HasValue)
        {
            return dateToCheck >= Date && dateToCheck <= EndDate.Value;
        }

        return dateToCheck == Date;
    }
}
