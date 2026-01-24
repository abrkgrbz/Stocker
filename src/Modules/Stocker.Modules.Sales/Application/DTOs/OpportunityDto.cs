namespace Stocker.Modules.Sales.Application.DTOs;

public class OpportunityDto
{
    public Guid Id { get; init; }
    public string OpportunityNumber { get; init; } = string.Empty;
    public string Title { get; init; } = string.Empty;
    public string? Description { get; init; }
    public Guid? CustomerId { get; init; }
    public string? CustomerName { get; init; }
    public string? ContactName { get; init; }
    public string? ContactEmail { get; init; }
    public string? ContactPhone { get; init; }
    public string Stage { get; init; } = string.Empty;
    public string Source { get; init; } = string.Empty;
    public string Priority { get; init; } = string.Empty;
    public Guid? PipelineId { get; init; }
    public Guid? PipelineStageId { get; init; }
    public decimal EstimatedValue { get; init; }
    public string Currency { get; init; } = "TRY";
    public int Probability { get; init; }
    public decimal WeightedValue { get; init; }
    public DateTime CreatedDate { get; init; }
    public DateTime? ExpectedCloseDate { get; init; }
    public DateTime? ActualCloseDate { get; init; }
    public DateTime? LastActivityDate { get; init; }
    public DateTime? NextFollowUpDate { get; init; }
    public bool IsWon { get; init; }
    public bool IsLost { get; init; }
    public string? ClosedReason { get; init; }
    public string? LostToCompetitor { get; init; }
    public Guid? SalesPersonId { get; init; }
    public string? SalesPersonName { get; init; }
    public Guid? QuotationId { get; init; }
    public string? QuotationNumber { get; init; }
    public Guid? SalesOrderId { get; init; }
    public string? SalesOrderNumber { get; init; }
    public string? Notes { get; init; }
    public string? Tags { get; init; }
}

public class OpportunityListDto
{
    public Guid Id { get; init; }
    public string OpportunityNumber { get; init; } = string.Empty;
    public string Title { get; init; } = string.Empty;
    public string? CustomerName { get; init; }
    public string Stage { get; init; } = string.Empty;
    public string Priority { get; init; } = string.Empty;
    public decimal EstimatedValue { get; init; }
    public string Currency { get; init; } = "TRY";
    public int Probability { get; init; }
    public decimal WeightedValue { get; init; }
    public DateTime? ExpectedCloseDate { get; init; }
    public string? SalesPersonName { get; init; }
    public bool IsWon { get; init; }
    public bool IsLost { get; init; }
}

public class CreateOpportunityDto
{
    public string Title { get; init; } = string.Empty;
    public string? Description { get; init; }
    public decimal EstimatedValue { get; init; }
    public string Currency { get; init; } = "TRY";
    public Guid? CustomerId { get; init; }
    public string? CustomerName { get; init; }
    public string? ContactName { get; init; }
    public string? ContactEmail { get; init; }
    public string? ContactPhone { get; init; }
    public string? Source { get; init; }
    public string? Priority { get; init; }
    public DateTime? ExpectedCloseDate { get; init; }
    public Guid? SalesPersonId { get; init; }
    public string? SalesPersonName { get; init; }
    public Guid? PipelineId { get; init; }
    public string? Notes { get; init; }
    public string? Tags { get; init; }
}

public class UpdateOpportunityStageDto
{
    public string Stage { get; init; } = string.Empty;
}

public class UpdateOpportunityValueDto
{
    public decimal EstimatedValue { get; init; }
    public string? Currency { get; init; }
}

public class MarkOpportunityWonDto
{
    public Guid? SalesOrderId { get; init; }
    public string? SalesOrderNumber { get; init; }
}

public class MarkOpportunityLostDto
{
    public string Reason { get; init; } = string.Empty;
    public string? LostToCompetitor { get; init; }
}

public class AssignOpportunityDto
{
    public Guid SalesPersonId { get; init; }
    public string? SalesPersonName { get; init; }
}
