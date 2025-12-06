namespace Stocker.Modules.HR.Application.DTOs;

/// <summary>
/// Data transfer object for Holiday entity
/// </summary>
public class HolidayDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime Date { get; set; }
    public int Year { get; set; }
    public bool IsRecurring { get; set; }
    public int? RecurringMonth { get; set; }
    public int? RecurringDay { get; set; }
    public string? HolidayType { get; set; }
    public bool IsHalfDay { get; set; }
    public bool IsNational { get; set; }
    public string? AffectedRegions { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}

/// <summary>
/// DTO for creating a holiday
/// </summary>
public class CreateHolidayDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime Date { get; set; }
    public bool IsRecurring { get; set; }
    public string? HolidayType { get; set; }
    public bool IsHalfDay { get; set; }
    public bool IsNational { get; set; } = true;
    public string? AffectedRegions { get; set; }
}

/// <summary>
/// DTO for updating a holiday
/// </summary>
public class UpdateHolidayDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime Date { get; set; }
    public bool IsRecurring { get; set; }
    public string? HolidayType { get; set; }
    public bool IsHalfDay { get; set; }
    public bool IsNational { get; set; }
    public string? AffectedRegions { get; set; }
}

/// <summary>
/// DTO for yearly holiday calendar
/// </summary>
public class HolidayCalendarDto
{
    public int Year { get; set; }
    public int TotalHolidays { get; set; }
    public int NationalHolidays { get; set; }
    public int RegionalHolidays { get; set; }
    public List<HolidayDto> Holidays { get; set; } = new();
}
