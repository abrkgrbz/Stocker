using Stocker.Modules.CRM.Domain.Enums;

namespace Stocker.Modules.CRM.Application.DTOs;

public class PipelineDto
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public PipelineType Type { get; set; }
    public bool IsActive { get; set; }
    public bool IsDefault { get; set; }
    public int DisplayOrder { get; set; }
    public string? Currency { get; set; }
    public List<PipelineStageDto> Stages { get; set; } = new();
    public int OpportunityCount { get; set; }
    public int DealCount { get; set; }
    public decimal TotalValue { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class PipelineStageDto
{
    public Guid Id { get; set; }
    public Guid PipelineId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int Order { get; set; }
    public int DisplayOrder { get; set; }
    public decimal Probability { get; set; }
    public string? Color { get; set; } = "#1890ff";
    public bool IsWon { get; set; }
    public bool IsLost { get; set; }
    public bool IsActive { get; set; }
    public int? RottenDays { get; set; }
    public int ItemCount { get; set; }
    public decimal TotalValue { get; set; }
}

public class PipelineStatisticsDto
{
    public Guid PipelineId { get; set; }
    public string PipelineName { get; set; } = string.Empty;
    public int TotalItems { get; set; }
    public int TotalOpportunities { get; set; }
    public int OpenOpportunities { get; set; }
    public int WonOpportunities { get; set; }
    public int LostOpportunities { get; set; }
    public decimal TotalValue { get; set; }
    public decimal WeightedValue { get; set; }
    public decimal WonValue { get; set; }
    public decimal LostValue { get; set; }
    public decimal AverageValue { get; set; }
    public decimal ConversionRate { get; set; }
    public decimal AverageCycleTime { get; set; }
    public List<StageStatisticsDto> StageStatistics { get; set; } = new();
    public List<VelocityDto> Velocity { get; set; } = new();
}

public class StageStatisticsDto
{
    public Guid StageId { get; set; }
    public string StageName { get; set; } = string.Empty;
    public int DisplayOrder { get; set; }
    public int ItemCount { get; set; }
    public int OpportunityCount { get; set; }
    public decimal TotalValue { get; set; }
    public decimal WeightedValue { get; set; }
    public double AverageDaysInStage { get; set; }
    public decimal AverageTimeInStage { get; set; }
    public decimal ConversionRate { get; set; }
}

public class VelocityDto
{
    public DateTime Date { get; set; }
    public int NewItems { get; set; }
    public int MovedItems { get; set; }
    public int WonItems { get; set; }
    public int LostItems { get; set; }
    public decimal TotalValue { get; set; }
}

public class PipelineReportDto
{
    public Guid? PipelineId { get; set; }
    public string? PipelineName { get; set; }
    public DateTime FromDate { get; set; }
    public DateTime ToDate { get; set; }
    public int TotalOpportunities { get; set; }
    public int TotalDeals { get; set; }
    public decimal TotalValue { get; set; }
    public decimal WeightedValue { get; set; }
    public List<StageReportDto> StageReports { get; set; } = new();
}

public class StageReportDto
{
    public Guid StageId { get; set; }
    public string StageName { get; set; } = string.Empty;
    public int ItemCount { get; set; }
    public decimal Value { get; set; }
    public decimal WeightedValue { get; set; }
    public decimal Probability { get; set; }
}

public class ForecastDto
{
    public DateTime FromDate { get; set; }
    public DateTime ToDate { get; set; }
    public decimal BestCase { get; set; }
    public decimal MostLikely { get; set; }
    public decimal WorstCase { get; set; }
    public decimal WeightedForecast { get; set; }
    public List<MonthlyForecastDto> MonthlyForecasts { get; set; } = new();
}

public class MonthlyForecastDto
{
    public string Month { get; set; } = string.Empty;
    public decimal BestCase { get; set; }
    public decimal MostLikely { get; set; }
    public decimal WorstCase { get; set; }
    public decimal Weighted { get; set; }
}