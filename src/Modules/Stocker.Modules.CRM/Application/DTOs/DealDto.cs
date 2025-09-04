using Stocker.Modules.CRM.Domain.Enums;

namespace Stocker.Modules.CRM.Application.DTOs;

public class DealDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid CustomerId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "TRY";
    public DealStatus Status { get; set; }
    public DealPriority Priority { get; set; }
    public Guid? PipelineId { get; set; }
    public string? PipelineName { get; set; }
    public Guid? CurrentStageId { get; set; }
    public string? CurrentStageName { get; set; }
    public DateTime ExpectedCloseDate { get; set; }
    public DateTime? ActualCloseDate { get; set; }
    public decimal Probability { get; set; }
    public string? LostReason { get; set; }
    public string? WonDetails { get; set; }
    public string? CompetitorName { get; set; }
    public string? Source { get; set; }
    public string? OwnerId { get; set; }
    public string? OwnerName { get; set; }
    public decimal WeightedAmount => Amount * (Probability / 100);
    public List<DealProductDto> Products { get; set; } = new();
    public List<ActivityDto> Activities { get; set; } = new();
    public List<NoteDto> Notes { get; set; } = new();
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class DealProductDto
{
    public Guid Id { get; set; }
    public Guid DealId { get; set; }
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string? ProductCode { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal DiscountPercentage { get; set; }
    public decimal TotalPrice => (UnitPrice * Quantity) * (1 - DiscountPercentage / 100);
}

public class DealStatisticsDto
{
    public int TotalDeals { get; set; }
    public int OpenDeals { get; set; }
    public int WonDeals { get; set; }
    public int LostDeals { get; set; }
    public decimal TotalValue { get; set; }
    public decimal AverageValue { get; set; }
    public decimal WinRate { get; set; }
    public decimal AverageSalesCycle { get; set; }
    public Dictionary<string, int> DealsByStatus { get; set; } = new();
    public Dictionary<string, decimal> ValueByStatus { get; set; } = new();
    public List<MonthlyDealDto> MonthlyDeals { get; set; } = new();
}

public class MonthlyDealDto
{
    public string Month { get; set; } = string.Empty;
    public int Count { get; set; }
    public decimal Value { get; set; }
}

public class ConversionRatesDto
{
    public Guid? PipelineId { get; set; }
    public string? PipelineName { get; set; }
    public decimal OverallConversionRate { get; set; }
    public List<StageConversionDto> StageConversions { get; set; } = new();
}

public class StageConversionDto
{
    public Guid FromStageId { get; set; }
    public string FromStageName { get; set; } = string.Empty;
    public Guid ToStageId { get; set; }
    public string ToStageName { get; set; } = string.Empty;
    public decimal ConversionRate { get; set; }
    public int ConvertedCount { get; set; }
    public int TotalCount { get; set; }
}