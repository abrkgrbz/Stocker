namespace Stocker.Application.DTOs.Master;

public class ReportTypeDto
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Icon { get; set; } = string.Empty;
    public bool IsAvailable { get; set; }
}

public class GenerateReportRequest
{
    public string ReportType { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string? Format { get; set; }
    public Dictionary<string, object>? Parameters { get; set; }
}

public class ReportResultDto
{
    public Guid ReportId { get; set; }
    public string ReportType { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public DateTime GeneratedAt { get; set; }
    public string GeneratedBy { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string Format { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public object? Data { get; set; }
    public ReportSummaryDto? Summary { get; set; }
}

public class ReportSummaryDto
{
    public int TotalRecords { get; set; }
    public double ProcessingTime { get; set; }
    public Dictionary<string, object> KeyMetrics { get; set; } = new();
}

public class ReportHistoryDto
{
    public Guid Id { get; set; }
    public string ReportType { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public DateTime GeneratedAt { get; set; }
    public string GeneratedBy { get; set; } = string.Empty;
    public string Format { get; set; } = string.Empty;
    public long FileSize { get; set; }
    public string Status { get; set; } = string.Empty;
}

public class ScheduleReportRequest
{
    public string ReportType { get; set; } = string.Empty;
    public string Frequency { get; set; } = string.Empty; // daily, weekly, monthly
    public string[] Recipients { get; set; } = Array.Empty<string>();
    public string Format { get; set; } = "pdf";
    public Dictionary<string, object>? Parameters { get; set; }
}

public class ScheduledReportDto
{
    public Guid Id { get; set; }
    public string ReportType { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Frequency { get; set; } = string.Empty;
    public string[] Recipients { get; set; } = Array.Empty<string>();
    public string Format { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
    public DateTime NextRunTime { get; set; }
    public DateTime? LastRunTime { get; set; }
}