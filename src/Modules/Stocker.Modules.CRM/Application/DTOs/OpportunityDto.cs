using Stocker.Modules.CRM.Domain.Enums;

namespace Stocker.Modules.CRM.Application.DTOs;

public class OpportunityDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid CustomerId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "TRY";
    public decimal Probability { get; set; }
    public DateTime ExpectedCloseDate { get; set; }
    public OpportunityStatus Status { get; set; }
    public Guid? PipelineId { get; set; }
    public string? PipelineName { get; set; }
    public Guid? CurrentStageId { get; set; }
    public string? CurrentStageName { get; set; }
    public string? LostReason { get; set; }
    public string? CompetitorName { get; set; }
    public string? Source { get; set; }
    public string? OwnerId { get; set; }
    public string? OwnerName { get; set; }
    public int Score { get; set; }
    public decimal WeightedAmount => Amount * (Probability / 100);
    public List<OpportunityProductDto> Products { get; set; } = new();
    public List<ActivityDto> RecentActivities { get; set; } = new();
    public List<NoteDto> Notes { get; set; } = new();
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class OpportunityProductDto
{
    public Guid Id { get; set; }
    public Guid OpportunityId { get; set; }
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string? ProductCode { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal DiscountPercentage { get; set; }
    public decimal TotalPrice => (UnitPrice * Quantity) * (1 - DiscountPercentage / 100);
}