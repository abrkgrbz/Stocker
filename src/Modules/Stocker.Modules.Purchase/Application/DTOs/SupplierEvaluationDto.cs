using Stocker.Modules.Purchase.Domain.Entities;

namespace Stocker.Modules.Purchase.Application.DTOs;

public record SupplierEvaluationDto
{
    public Guid Id { get; init; }
    public string EvaluationNumber { get; init; } = string.Empty;
    public Guid SupplierId { get; init; }
    public string SupplierCode { get; init; } = string.Empty;
    public string SupplierName { get; init; } = string.Empty;
    public string Status { get; init; } = string.Empty;
    public string Type { get; init; } = string.Empty;
    public string PeriodType { get; init; } = string.Empty;
    public int Year { get; init; }
    public int? Quarter { get; init; }
    public int? Month { get; init; }
    public DateTime StartDate { get; init; }
    public DateTime EndDate { get; init; }

    // Scores
    public decimal QualityScore { get; init; }
    public decimal DeliveryScore { get; init; }
    public decimal PriceScore { get; init; }
    public decimal ServiceScore { get; init; }
    public decimal CommunicationScore { get; init; }
    public decimal OverallScore { get; init; }

    // Weights
    public decimal QualityWeight { get; init; }
    public decimal DeliveryWeight { get; init; }
    public decimal PriceWeight { get; init; }
    public decimal ServiceWeight { get; init; }
    public decimal CommunicationWeight { get; init; }

    // Performance Metrics
    public int TotalOrders { get; init; }
    public int OnTimeDeliveries { get; init; }
    public decimal OnTimeDeliveryRate { get; init; }
    public int TotalItems { get; init; }
    public int AcceptedItems { get; init; }
    public int RejectedItems { get; init; }
    public decimal AcceptanceRate { get; init; }
    public decimal AverageLeadTimeDays { get; init; }
    public int TotalReturns { get; init; }
    public decimal ReturnRate { get; init; }
    public decimal TotalPurchaseAmount { get; init; }
    public decimal AverageOrderValue { get; init; }

    // Comparison
    public decimal? PreviousOverallScore { get; init; }
    public decimal? ScoreChange { get; init; }
    public string? ScoreTrend { get; init; }

    // Ranking
    public string Rating { get; init; } = string.Empty;
    public int? RankInCategory { get; init; }
    public int? TotalSuppliersInCategory { get; init; }

    // Evaluator
    public Guid? EvaluatedById { get; init; }
    public string? EvaluatedByName { get; init; }
    public DateTime? EvaluationDate { get; init; }

    // Comments
    public string? Strengths { get; init; }
    public string? Weaknesses { get; init; }
    public string? ImprovementAreas { get; init; }
    public string? Recommendations { get; init; }
    public string? Notes { get; init; }

    // Follow-up
    public bool RequiresFollowUp { get; init; }
    public DateTime? FollowUpDate { get; init; }
    public string? FollowUpNotes { get; init; }
    public bool FollowUpCompleted { get; init; }

    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }

    public List<SupplierEvaluationCriteriaDto> Criteria { get; init; } = new();
}

public record SupplierEvaluationCriteriaDto
{
    public Guid Id { get; init; }
    public Guid EvaluationId { get; init; }
    public string Category { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public decimal Weight { get; init; }
    public decimal Score { get; init; }
    public decimal WeightedScore { get; init; }
    public string? Evidence { get; init; }
    public string? Notes { get; init; }
}

public record SupplierEvaluationHistoryDto
{
    public Guid Id { get; init; }
    public Guid SupplierId { get; init; }
    public int Year { get; init; }
    public int? Quarter { get; init; }
    public int? Month { get; init; }
    public decimal OverallScore { get; init; }
    public decimal QualityScore { get; init; }
    public decimal DeliveryScore { get; init; }
    public decimal PriceScore { get; init; }
    public decimal ServiceScore { get; init; }
    public decimal CommunicationScore { get; init; }
    public string Rating { get; init; } = string.Empty;
    public DateTime RecordedAt { get; init; }
}

public record SupplierEvaluationListDto
{
    public Guid Id { get; init; }
    public string EvaluationNumber { get; init; } = string.Empty;
    public string SupplierName { get; init; } = string.Empty;
    public string Status { get; init; } = string.Empty;
    public string Type { get; init; } = string.Empty;
    public string PeriodType { get; init; } = string.Empty;
    public int Year { get; init; }
    public int? Quarter { get; init; }
    public decimal OverallScore { get; init; }
    public string Rating { get; init; } = string.Empty;
    public string? ScoreTrend { get; init; }
    public bool RequiresFollowUp { get; init; }
    public DateTime CreatedAt { get; init; }
}

public record CreateSupplierEvaluationDto
{
    public Guid SupplierId { get; init; }
    public string? SupplierCode { get; init; }
    public string SupplierName { get; init; } = string.Empty;
    public SupplierEvaluationType Type { get; init; } = SupplierEvaluationType.Periodic;
    public EvaluationPeriodType PeriodType { get; init; } = EvaluationPeriodType.Quarterly;
    public int Year { get; init; }
    public int? Quarter { get; init; }
    public int? Month { get; init; }
    public DateTime StartDate { get; init; }
    public DateTime EndDate { get; init; }
}

public record SetEvaluationWeightsDto
{
    public decimal QualityWeight { get; init; } = 25;
    public decimal DeliveryWeight { get; init; } = 25;
    public decimal PriceWeight { get; init; } = 20;
    public decimal ServiceWeight { get; init; } = 15;
    public decimal CommunicationWeight { get; init; } = 15;
}

public record SetEvaluationScoresDto
{
    public decimal QualityScore { get; init; }
    public decimal DeliveryScore { get; init; }
    public decimal PriceScore { get; init; }
    public decimal ServiceScore { get; init; }
    public decimal CommunicationScore { get; init; }
}

public record SetPerformanceMetricsDto
{
    public int TotalOrders { get; init; }
    public int OnTimeDeliveries { get; init; }
    public int TotalItems { get; init; }
    public int AcceptedItems { get; init; }
    public int RejectedItems { get; init; }
    public decimal AverageLeadTimeDays { get; init; }
    public int TotalReturns { get; init; }
    public decimal TotalPurchaseAmount { get; init; }
}

public record SetEvaluationCommentsDto
{
    public string? Strengths { get; init; }
    public string? Weaknesses { get; init; }
    public string? ImprovementAreas { get; init; }
    public string? Recommendations { get; init; }
    public string? Notes { get; init; }
}

public record SetFollowUpDto
{
    public bool RequiresFollowUp { get; init; }
    public DateTime? FollowUpDate { get; init; }
    public string? FollowUpNotes { get; init; }
}

public record AddEvaluationCriteriaDto
{
    public string Category { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public decimal Weight { get; init; }
    public decimal Score { get; init; }
    public string? Evidence { get; init; }
    public string? Notes { get; init; }
}

public record SupplierEvaluationSummaryDto
{
    public int TotalEvaluations { get; init; }
    public int DraftEvaluations { get; init; }
    public int PendingReviewEvaluations { get; init; }
    public int CompletedEvaluations { get; init; }
    public decimal AverageScore { get; init; }
    public int ExcellentSuppliers { get; init; }
    public int GoodSuppliers { get; init; }
    public int SatisfactorySuppliers { get; init; }
    public int NeedsImprovementSuppliers { get; init; }
    public int PoorSuppliers { get; init; }
    public int SuppliersRequiringFollowUp { get; init; }
    public Dictionary<string, int> EvaluationsByRating { get; init; } = new();
    public Dictionary<string, decimal> AverageScoreByCategory { get; init; } = new();
}

public record SupplierRankingDto
{
    public Guid SupplierId { get; init; }
    public string SupplierCode { get; init; } = string.Empty;
    public string SupplierName { get; init; } = string.Empty;
    public decimal OverallScore { get; init; }
    public string Rating { get; init; } = string.Empty;
    public int Rank { get; init; }
    public decimal QualityScore { get; init; }
    public decimal DeliveryScore { get; init; }
    public decimal PriceScore { get; init; }
    public decimal ServiceScore { get; init; }
    public decimal CommunicationScore { get; init; }
    public string? ScoreTrend { get; init; }
    public int TotalEvaluations { get; init; }
}
