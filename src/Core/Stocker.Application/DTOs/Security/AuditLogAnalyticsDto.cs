namespace Stocker.Application.DTOs.Security;

/// <summary>
/// Analytics data for charts and visualizations
/// </summary>
public class AuditLogAnalyticsDto
{
    public HourlyActivityDto HourlyActivity { get; set; } = new();
    public CategoryDistributionDto CategoryDistribution { get; set; } = new();
    public SeverityDistributionDto SeverityDistribution { get; set; } = new();
    public WeeklyHeatmapDto WeeklyHeatmap { get; set; } = new();
}

/// <summary>
/// Hourly activity distribution (24 hours)
/// </summary>
public class HourlyActivityDto
{
    public List<HourlyDataPoint> Data { get; set; } = new();
}

public class HourlyDataPoint
{
    public int Hour { get; set; } // 0-23
    public string Label { get; set; } = string.Empty; // "00:00", "04:00", etc.
    public int Count { get; set; }
}

/// <summary>
/// Category distribution for pie chart
/// </summary>
public class CategoryDistributionDto
{
    public List<CategoryDataPoint> Data { get; set; } = new();
}

public class CategoryDataPoint
{
    public string Category { get; set; } = string.Empty; // Authentication, System, Data Access, Admin Actions, API Calls, Security
    public int Count { get; set; }
    public double Percentage { get; set; }
}

/// <summary>
/// Severity level distribution
/// </summary>
public class SeverityDistributionDto
{
    public int Info { get; set; }
    public int Warning { get; set; }
    public int Error { get; set; }
    public int Critical { get; set; }

    public List<SeverityDataPoint> Data { get; set; } = new();
}

public class SeverityDataPoint
{
    public string Level { get; set; } = string.Empty; // Info, Warning, Error, Critical
    public int Count { get; set; }
    public double Percentage { get; set; }
}

/// <summary>
/// Weekly heatmap (7 days x 24 hours)
/// </summary>
public class WeeklyHeatmapDto
{
    public List<HeatmapDataPoint> Data { get; set; } = new();
}

public class HeatmapDataPoint
{
    public string Day { get; set; } = string.Empty; // Pzt, Sal, Çar, Per, Cum, Cmt, Paz
    public int DayOfWeek { get; set; } // 0-6
    public int Hour { get; set; } // 0-23
    public int Count { get; set; }
}
